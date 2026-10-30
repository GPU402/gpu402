import { randomUUID } from "node:crypto";
import createClient, { type Client } from "openapi-fetch";
import { BudgetGuard } from "./budget.js";
import {
  LiumError,
  LiumNotFoundError,
  NODE_TAKEN_CODES,
  PodStartError,
  errorFromResponse,
} from "./errors.js";
import type { components, paths } from "./generated/lium.js";
import { filterGpus, minRentableGpus, toGpu, type Gpu, type GpuFilter, type LiumExecutor } from "./gpu.js";
import { createRetryingFetch, sleep, type RetryOptions } from "./http.js";
import { TERMINAL_POD_STATUSES, toPod, type Pod } from "./pod.js";
import { sshExec, waitForPort, type ExecOptions, type ExecResult } from "./ssh.js";

export const DEFAULT_BASE_URL = "https://lium.io/api";
export const BLOCK_MINUTES = 15;

export type LiumApi = Client<paths>;
type Template = components["schemas"]["TemplateResponse"];
type RentBySpecRequest = components["schemas"]["RentBySpecRequest"];
type RentBySpecResponse = components["schemas"]["RentBySpecResponse"];

export interface LiumOptions {
  /** Lium API key (`X-API-Key`). Defaults to `process.env.LIUM_API_KEY`. Listing GPUs and quotes work without one. */
  apiKey?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  retry?: RetryOptions;
  /** Cap total spend of pods rented by this client, in USD. */
  budgetUsd?: number;
  /** Tag every rental with your end customer's reference (`X-Customer-Ref`). */
  customerRef?: string;
  userAgent?: string;
}

export interface Quote {
  executorId: string;
  gpuCount: number;
  /** Whole-pod USD per hour. */
  pricePerHour: number;
  /** One 15-minute block. */
  pricePerBlock: number;
  /** Cost of the quoted duration. */
  totalUsd: number;
  minutes: number;
  /** A rent needs a balance above this (15 minutes of the price) plus 15 minutes of each running pod. */
  balanceFloorUsd: number;
  raw: components["schemas"]["JobQuoteResponse"];
}

export interface RentOptions {
  /** Your SSH public key (`ssh-ed25519 …`). Lium installs it in the pod; the private key never leaves you. */
  sshPublicKey: string | string[];
  /** Remove the pod automatically after this many minutes (Lium schedules the removal server-side). */
  ttlMinutes?: number;
  name?: string;
  /** Defaults to the newest official PyTorch template whose CUDA version the node supports. */
  templateId?: string;
  gpuCount?: number;
  /** Extra ports to expose. */
  ports?: number;
  idempotencyKey?: string;
  customerRef?: string;
}

export interface RentResult {
  podId: string;
  executorId: string;
  name: string;
  gpu: string;
  gpuCount: number;
  /** Whole-pod USD per hour at rent time. */
  pricePerHour: number;
  expiresAt: Date | null;
  templateId: string | null;
}

export interface RentCheapestSpec extends Omit<RentOptions, "gpuCount">, Omit<GpuFilter, "maxUsdPerGpuHour"> {
  /** Ceiling on the price per GPU-hour. */
  maxUsdPerHour?: number;
  /** How many of the cheapest nodes to try when one is taken. Default 5. */
  maxAttempts?: number;
  onAttempt?: (gpu: Gpu, error?: LiumError) => void;
}

export interface RentBySpecOptions extends Omit<RentOptions, "gpuCount" | "ports"> {
  gpu: string;
  gpuCount?: number;
  maxUsdPerGpuHour?: number;
  minVramGb?: number;
  country?: string;
  dryRun?: boolean;
  extra?: Partial<RentBySpecRequest>;
}

export interface WaitReadyOptions {
  /** Default 15 minutes. */
  timeoutMs?: number;
  /** Default 5 s. */
  intervalMs?: number;
  /** Also wait until the SSH port accepts TCP connections. Default true. */
  probeSsh?: boolean;
  onProgress?: (pod: Pod) => void;
  signal?: AbortSignal;
}

const isUuidish = (s: string) => /^[0-9a-f-]{8,}$/i.test(s);
const cudaOf = (t: Template) => Number(/cuda(\d+(?:\.\d+)?)/i.exec(t.docker_image_tag)?.[1] ?? 0);

export class Lium {
  /** Fully typed raw client for every Lium endpoint, generated from Lium's OpenAPI spec. */
  readonly api: LiumApi;
  readonly baseUrl: string;
  private readonly hasKey: boolean;
  private readonly customerRef: string | undefined;
  private guard: BudgetGuard | undefined;
  private templateCache: { at: number; list: Template[] } | undefined;

  constructor(opts: LiumOptions = {}) {
    const apiKey = opts.apiKey ?? (typeof process !== "undefined" ? process.env.LIUM_API_KEY : undefined);
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.hasKey = Boolean(apiKey);
    this.customerRef = opts.customerRef;
    const headers: Record<string, string> = { "User-Agent": opts.userAgent ?? "gpu402-sdk/0.1" };
    if (apiKey) headers["X-API-Key"] = apiKey;
    this.api = createClient<paths>({
      baseUrl: this.baseUrl,
      headers,
      fetch: createRetryingFetch(opts.fetch ?? globalThis.fetch, opts.retry),
    });
    if (opts.budgetUsd !== undefined) this.guard = new BudgetGuard(opts.budgetUsd);
  }

  /** Sets a spend cap for pods rented by this client. Rents over the cap are refused; `watchBudget` stops pods at the cap. */
  budget(usd: number): BudgetGuard {
    this.guard = new BudgetGuard(usd);
    return this.guard;
  }

  get budgetGuard(): BudgetGuard | undefined {
    return this.guard;
  }

  private requireKey(op: string) {
    if (!this.hasKey) {
      throw new LiumError(`${op} needs a Lium API key: pass { apiKey } or set LIUM_API_KEY.`, { code: "missing_api_key" });
    }
  }

  private unwrap<T>(r: { data?: T; error?: unknown; response: Response }, op: string): T {
    if (!r.response.ok) throw errorFromResponse(r.response.status, r.error, `${op} failed`);
    return r.data as T;
  }

  // ---------------------------------------------------------------- discovery

  /** Every node on the marketplace, as Lium returns it. Works without a key. */
  async executors(): Promise<LiumExecutor[]> {
    const r = await this.api.GET("/executors", {});
    return this.unwrap(r, "GET /executors") ?? [];
  }

  /** Rentable GPUs matching the filter, cheapest per GPU-hour first. Works without a key. */
  async listGpus(filter: GpuFilter = {}): Promise<Gpu[]> {
    return filterGpus(await this.executors(), filter);
  }

  /**
   * Prices a rental on one node: per hour, per 15-minute block and for the given duration. Works without a key.
   * `gpuCount` defaults to the node's smallest rentable count (usually 1), the same default `rent` uses;
   * Lium's endpoint alone would price every free GPU on the node.
   */
  async quote(node: string | Gpu, opts: { minutes?: number; gpuCount?: number } = {}): Promise<Quote> {
    const minutes = opts.minutes ?? BLOCK_MINUTES;
    const executorId = typeof node === "string" ? node : node.id;
    let gpuCount = opts.gpuCount ?? (typeof node === "string" ? undefined : Math.max(node.minGpuCount, 1));
    if (gpuCount === undefined) {
      const found = (await this.executors()).find((e) => e.id === executorId);
      gpuCount = found ? minRentableGpus(found) : 1;
    }
    const r = await this.api.GET("/executors/{executor_uuid}/quote", {
      params: { path: { executor_uuid: executorId }, query: { hours: minutes / 60, gpu_count: gpuCount } },
    });
    const q = this.unwrap(r, "GET /executors/{id}/quote");
    return {
      executorId: q.executor_id,
      gpuCount: q.gpu_count,
      pricePerHour: q.price_per_hour,
      pricePerBlock: (q.price_per_hour * BLOCK_MINUTES) / 60,
      totalUsd: q.total_usd,
      minutes,
      balanceFloorUsd: q.rent_balance_required_usd ?? q.pod_balance_floor_usd,
      raw: q,
    };
  }

  /** Lium's official and your own templates. */
  async templates(): Promise<Template[]> {
    if (this.templateCache && Date.now() - this.templateCache.at < 10 * 60_000) return this.templateCache.list;
    const r = await this.api.GET("/templates", {});
    const list = this.unwrap(r, "GET /templates") ?? [];
    this.templateCache = { at: Date.now(), list };
    return list;
  }

  /** Newest official PyTorch template whose CUDA version the node's driver supports. */
  async defaultTemplateId(gpu?: Pick<Gpu, "maxCudaVersion">): Promise<string> {
    const maxCuda = gpu?.maxCudaVersion ?? Number.POSITIVE_INFINITY;
    const official = (await this.templates())
      .filter((t) => t.user_id == null && !t.is_private && t.category === "PYTORCH" && /pytorch/i.test(t.name))
      .filter((t) => !/VERIFY_FAILED/i.test(t.status ?? ""))
      .sort((a, b) => cudaOf(b) - cudaOf(a));
    const pick = official.find((t) => cudaOf(t) <= maxCuda) ?? official.at(-1);
    if (!pick) throw new LiumError("No official PyTorch template found on Lium; pass templateId.", { code: "template_not_found" });
    return pick.id;
  }

  /** Account balance in USD (`GET /users/me`). */
  async balance(): Promise<number> {
    this.requireKey("balance");
    const r = await this.api.GET("/users/me", {});
    const me = this.unwrap(r, "GET /users/me") as { balance?: number | string } | undefined;
    return Number(me?.balance ?? 0);
  }

  // ------------------------------------------------------------------- renting

  /** Rents one node. With `ttlMinutes`, Lium removes the pod at expiry even if this process dies. */
  async rent(node: string | Gpu, opts: RentOptions): Promise<RentResult> {
    this.requireKey("rent");
    let gpu: Gpu | undefined = typeof node === "string" ? undefined : node;
    const executorId = typeof node === "string" ? node : node.id;
    if (!isUuidish(executorId)) throw new LiumError(`Not a node id: ${executorId}`, { code: "bad_request" });
    if (!gpu) {
      const found = (await this.executors()).find((e) => e.id === executorId);
      if (found) gpu = toGpu(found);
    }
    const gpuCount = opts.gpuCount ?? Math.max(gpu?.minGpuCount ?? 1, 1);
    const pricePerHour = (gpu?.pricePerGpuHour ?? Number.NaN) * gpuCount;

    const reservation = this.guard?.reserve(opts.ttlMinutes ? (pricePerHour * opts.ttlMinutes) / 60 : Number.POSITIVE_INFINITY);
    const name = opts.name ?? `gpu402-${randomUUID().slice(0, 8)}`;
    try {
      const templateId = opts.templateId ?? (await this.defaultTemplateId(gpu));
      const r = await this.api.POST("/executors/{executor_uuid}/rent", {
        params: {
          path: { executor_uuid: executorId },
          header: {
            "Idempotency-Key": opts.idempotencyKey ?? randomUUID(),
            ...(opts.customerRef ?? this.customerRef ? { "X-Customer-Ref": opts.customerRef ?? this.customerRef } : {}),
          } as never,
        },
        body: {
          pod_name: name,
          user_public_key: opts.sshPublicKey,
          template_id: templateId,
          gpu_count: gpuCount,
          ...(opts.ports ? { initial_port_count: opts.ports } : {}),
        } as components["schemas"]["RentExecutorRequest"],
      });
      const data = this.unwrap(r, "POST /executors/{id}/rent") as { pod_id?: string; id?: string } | undefined;
      const podId = data?.pod_id ?? data?.id;
      if (!podId) throw new LiumError("Lium accepted the rent but returned no pod_id", { body: data });
      reservation?.commit(podId);

      const expiresAt = opts.ttlMinutes ? new Date(Date.now() + opts.ttlMinutes * 60_000) : null;
      if (expiresAt) await this.scheduleRemovalOrStop(podId, expiresAt);
      return {
        podId,
        executorId,
        name,
        gpu: gpu?.gpu ?? "",
        gpuCount,
        pricePerHour: Number.isFinite(pricePerHour) ? pricePerHour : 0,
        expiresAt,
        templateId,
      };
    } catch (err) {
      reservation?.release();
      throw err;
    }
  }

  /**
   * Rents the cheapest node that matches. If a node is taken between listing
   * and renting, tries the next cheapest (across every model you allow).
   */
  async rentCheapest(spec: RentCheapestSpec): Promise<RentResult> {
    this.requireKey("rentCheapest");
    const gpuCount = spec.gpuCount ?? 1;
    const candidates = await this.listGpus({ ...spec, gpuCount, maxUsdPerGpuHour: spec.maxUsdPerHour });
    if (candidates.length === 0) {
      throw errorFromResponse(409, {
        code: "no_executor_matches_spec",
        constraint: spec.maxUsdPerHour !== undefined ? "max_price_per_gpu_hour" : "gpu_type",
        message: `No rentable ${[spec.gpu ?? "GPU"].flat().join(" / ")} node${spec.maxUsdPerHour !== undefined ? ` under $${spec.maxUsdPerHour}/GPU-hour` : ""} right now.`,
      });
    }
    let lastErr: LiumError | undefined;
    for (const gpu of candidates.slice(0, spec.maxAttempts ?? 5)) {
      try {
        spec.onAttempt?.(gpu);
        return await this.rent(gpu, { ...spec, gpuCount });
      } catch (err) {
        if (err instanceof LiumError && (NODE_TAKEN_CODES.has(err.code ?? "") || err instanceof LiumNotFoundError)) {
          lastErr = err;
          spec.onAttempt?.(gpu, err);
          continue;
        }
        throw err;
      }
    }
    throw lastErr ?? new LiumError("Every candidate node was taken");
  }

  /** Lium's server-side `rent-by-spec`: it picks and rents the cheapest match in one call. */
  async rentBySpec(opts: RentBySpecOptions): Promise<RentResult & { dryRun: boolean; candidates: number }> {
    this.requireKey("rentBySpec");
    const gpuCount = opts.gpuCount ?? 1;
    const ceiling = opts.maxUsdPerGpuHour;
    const reservation =
      opts.dryRun || !this.guard
        ? undefined
        : this.guard.reserve(opts.ttlMinutes && ceiling !== undefined ? (ceiling * gpuCount * opts.ttlMinutes) / 60 : Number.POSITIVE_INFINITY);
    const name = opts.name ?? `gpu402-${randomUUID().slice(0, 8)}`;
    try {
      const r = await this.api.POST("/executors/rent-by-spec", {
        params: {
          header: {
            "Idempotency-Key": opts.idempotencyKey ?? randomUUID(),
            ...(opts.customerRef ?? this.customerRef ? { "X-Customer-Ref": opts.customerRef ?? this.customerRef } : {}),
          } as never,
        },
        body: {
          pod_name: name,
          user_public_key: opts.sshPublicKey,
          gpu_type: opts.gpu,
          gpu_count: gpuCount,
          max_price_per_gpu_hour: ceiling ?? null,
          min_vram_gb: opts.minVramGb ?? null,
          country: opts.country ?? null,
          template_id: opts.templateId ?? null,
          dry_run: opts.dryRun ?? false,
          ...opts.extra,
        } as RentBySpecRequest,
      });
      const data = this.unwrap(r, "POST /executors/rent-by-spec") as RentBySpecResponse;
      const sel = (data.selected_executor ?? {}) as Partial<LiumExecutor> & { id?: string };
      const result = {
        podId: data.pod_id ?? "",
        executorId: sel.id ?? "",
        name,
        gpu: sel.gpu_class ?? sel.machine_name ?? opts.gpu,
        gpuCount,
        pricePerHour: data.price_per_hour,
        expiresAt: null as Date | null,
        templateId: data.template_id ?? null,
        dryRun: data.dry_run,
        candidates: data.candidates,
      };
      if (!data.dry_run && data.pod_id) {
        reservation?.commit(data.pod_id);
        if (opts.ttlMinutes) {
          result.expiresAt = new Date(Date.now() + opts.ttlMinutes * 60_000);
          await this.scheduleRemovalOrStop(data.pod_id, result.expiresAt);
        }
      } else reservation?.release();
      return result;
    } catch (err) {
      reservation?.release();
      throw err;
    }
  }

  /** Never leak cost: if Lium will not take the removal schedule, remove the pod now. */
  private async scheduleRemovalOrStop(podId: string, at: Date) {
    try {
      await this.scheduleRemoval(podId, at);
    } catch (err) {
      await this.stop(podId).catch(() => {});
      throw new LiumError(`Pod ${podId} was removed because its TTL could not be scheduled: ${(err as Error).message}`, {
        code: "ttl_schedule_failed",
        cause: err,
      });
    }
  }

  /** Has Lium remove the pod at `at` (UTC), server-side. */
  async scheduleRemoval(podId: string, at: Date): Promise<void> {
    this.requireKey("scheduleRemoval");
    const r = await this.api.POST("/pods/{id}/schedule-removal", {
      params: { path: { id: podId } },
      body: { removal_scheduled_at: at.toISOString() },
    });
    this.unwrap(r, "POST /pods/{id}/schedule-removal");
  }

  // ---------------------------------------------------------------------- pods

  async getPod(podId: string): Promise<Pod> {
    this.requireKey("getPod");
    const r = await this.api.GET("/pods/{id}", { params: { path: { id: podId } } });
    return toPod(this.unwrap(r, "GET /pods/{id}"));
  }

  async listPods(): Promise<Pod[]> {
    this.requireKey("listPods");
    const r = await this.api.GET("/pods", {});
    if (r.response.status === 402) return []; // BALANCE_REQUIRED: no balance and no pods
    return (this.unwrap(r, "GET /pods") ?? []).map(toPod);
  }

  /** Polls until the pod is RUNNING with SSH reachable. Throws `PodStartError` on a terminal status or timeout. */
  async waitReady(podId: string, opts: WaitReadyOptions = {}): Promise<Pod> {
    const deadline = Date.now() + (opts.timeoutMs ?? 15 * 60_000);
    const interval = opts.intervalMs ?? 5_000;
    let last: Pod | undefined;
    while (Date.now() < deadline) {
      last = await this.getPod(podId);
      opts.onProgress?.(last);
      if (TERMINAL_POD_STATUSES.has(last.status)) {
        throw new PodStartError(`Pod ${podId} reached ${last.status} before it was ready`, { code: last.status.toLowerCase() });
      }
      if (last.status === "RUNNING" && last.ssh) {
        if (opts.probeSsh === false || (await waitForPort(last.ssh.host, last.ssh.port))) return last;
      }
      await sleep(interval, opts.signal);
    }
    throw new PodStartError(`Pod ${podId} was not ready after ${Math.round((opts.timeoutMs ?? 900_000) / 1000)} s (last status ${last?.status ?? "unknown"})`, {
      code: "start_timeout",
    });
  }

  /** Runs a command on the pod over SSH and returns its exit code and output. */
  async exec(pod: Pod | string, command: string, opts: ExecOptions): Promise<ExecResult> {
    const p = typeof pod === "string" ? await this.getPod(pod) : pod;
    if (!p.ssh) throw new LiumError(`Pod ${p.id} has no SSH endpoint yet (status ${p.status}); call waitReady first.`, { code: "pod_not_ready" });
    return sshExec(p.ssh, command, opts);
  }

  /** Removes the pod. Idempotent: an already removed pod is not an error. Returns the final ledger spend when known. */
  async stop(podId: string): Promise<{ stopped: boolean; spentUsd: number | null }> {
    this.requireKey("stop");
    let spentUsd: number | null = null;
    try {
      spentUsd = (await this.getPod(podId)).spendToDate;
    } catch (err) {
      if (err instanceof LiumNotFoundError) {
        this.guard?.close(podId);
        return { stopped: false, spentUsd: null };
      }
    }
    const r = await this.api.DELETE("/pods/{id}", { params: { path: { id: podId } } });
    if (r.response.status === 404) {
      this.guard?.close(podId, spentUsd ?? undefined);
      return { stopped: false, spentUsd };
    }
    this.unwrap(r, "DELETE /pods/{id}");
    // The pod's live spend lags Lium's billing ticks; its statement is billed to the second and outlives the pod.
    const billed = await this.statement(podId).catch(() => null);
    if (billed) spentUsd = Math.max(spentUsd ?? 0, billed.totalUsd);
    this.guard?.close(podId, spentUsd ?? undefined);
    return { stopped: true, spentUsd };
  }

  /** What Lium billed for a pod, from its billing ledger. Available after the pod is removed. */
  async statement(podId: string): Promise<{ totalUsd: number; billedSeconds: number; billedUntil: string | null; raw: unknown }> {
    this.requireKey("statement");
    const r = await this.api.GET("/pods/{id}/statement", { params: { path: { id: podId } } });
    const s = this.unwrap(r, "GET /pods/{id}/statement") as { total?: number; billed_seconds?: number; billed_until?: string | null };
    return { totalUsd: Number(s?.total ?? 0), billedSeconds: Number(s?.billed_seconds ?? 0), billedUntil: s?.billed_until ?? null, raw: s };
  }

  /**
   * Polls Lium's ledger for pods this client rented and stops all of them
   * once actual spend reaches the budget cap. Returns a function that stops watching.
   */
  watchBudget(opts: { intervalMs?: number; onCapReached?: (spentUsd: number) => void } = {}): () => void {
    const guard = this.guard;
    if (!guard) throw new LiumError("Set a budget first: lium.budget(usd) or new Lium({ budgetUsd }).");
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      const open = guard.openPods();
      let hit = false;
      for (const id of open) {
        try {
          const pod = await this.getPod(id);
          if (TERMINAL_POD_STATUSES.has(pod.status)) guard.close(id, pod.spendToDate ?? undefined);
          else hit = guard.record(id, pod.spendToDate ?? 0) || hit;
        } catch (err) {
          if (err instanceof LiumNotFoundError) guard.close(id);
        }
      }
      if (hit) {
        await Promise.allSettled(guard.openPods().map((id) => this.stop(id)));
        opts.onCapReached?.(guard.spent());
      }
    };
    const timer = setInterval(() => void tick(), opts.intervalMs ?? 30_000);
    timer.unref?.();
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }
}
