import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  BudgetExceededError,
  BudgetGuard,
  Lium,
  LiumInsufficientBalanceError,
  LiumNoMatchError,
  LiumNotFoundError,
  createRetryingFetch,
  errorFromResponse,
  filterGpus,
  generateSshKeyPair,
  normalizeGpuName,
  parseSshCommand,
  type LiumExecutor,
} from "../src/index.js";

const exec = (over: Partial<LiumExecutor> & { id: string }): LiumExecutor =>
  ({
    validator_hotkey: "5F",
    specs: {},
    ncu_profiling_enabled: false,
    disk_health_ok: true,
    on_infiniband_fabric: false,
    on_roce_fabric: false,
    nvlink: null,
    gpu_class: "NVIDIA GeForce RTX 4090",
    gpu_class_display: "RTX 4090",
    machine_name: "NVIDIA GeForce RTX 4090",
    price_per_gpu: 0.3,
    gpu_count: 1,
    available_gpu_count: 1,
    min_gpu_count_for_rental: 1,
    frequent_rent_failures: false,
    is_slow_machine: false,
    offers_bare_metal: false,
    is_bookmarked: false,
    infiniband_fabric_rentable: false,
    roce_fabric_rentable: false,
    operated_by_lium: false,
    max_cuda_version: 12.8,
    ...over,
  }) as LiumExecutor;

describe("normalizeGpuName", () => {
  it("strips vendor words and punctuation", () => {
    expect(normalizeGpuName("NVIDIA GeForce RTX 4090")).toBe("RTX4090");
    expect(normalizeGpuName("rtx-4090")).toBe("RTX4090");
    expect(normalizeGpuName("NVIDIA H100 80GB HBM3")).toBe("H10080GBHBM3");
  });
});

describe("filterGpus", () => {
  const list = [
    exec({ id: "a", price_per_gpu: 0.5 }),
    exec({ id: "b", price_per_gpu: 0.25, reliability_score: 90 }),
    exec({ id: "c", price_per_gpu: 0.25, reliability_score: 99 }),
    exec({ id: "d", price_per_gpu: 0.1, frequent_rent_failures: true }),
    exec({ id: "e", price_per_gpu: 0.2, available_gpu_count: 0 }),
    exec({ id: "f", price_per_gpu: 2.5, gpu_class: "NVIDIA H100 80GB HBM3", gpu_class_display: "H100", machine_name: "NVIDIA H100 80GB HBM3" }),
    exec({ id: "g", price_per_gpu: 0.15, min_gpu_count_for_rental: 8, gpu_count: 8, available_gpu_count: 8 }),
  ];

  it("sorts cheapest first, most reliable on ties, and drops unrentable nodes", () => {
    expect(filterGpus(list, { gpu: "RTX4090" }).map((g) => g.id)).toEqual(["c", "b", "a"]);
  });
  it("applies the price ceiling and accepts several models", () => {
    expect(filterGpus(list, { gpu: ["H100", "rtx 4090"], maxUsdPerGpuHour: 0.3 }).map((g) => g.id)).toEqual(["c", "b"]);
    expect(filterGpus(list, { gpu: "H100" }).map((g) => g.id)).toEqual(["f"]);
  });
  it("treats a multi-GPU node with no minimum as whole-only (splitting off)", () => {
    const whole = exec({ id: "w", price_per_gpu: 0.05, gpu_count: 8, available_gpu_count: 8, min_gpu_count_for_rental: null });
    const split = exec({ id: "s", price_per_gpu: 0.06, gpu_count: 8, available_gpu_count: 8, min_gpu_count_for_rental: 1 });
    expect(filterGpus([whole, split], { gpuCount: 1 }).map((g) => g.id)).toEqual(["s"]);
    expect(filterGpus([whole, split], { gpuCount: 8 }).map((g) => g.id)).toEqual(["w", "s"]);
    expect(filterGpus([exec({ id: "one", gpu_count: 1, min_gpu_count_for_rental: null })], { gpuCount: 1 })).toHaveLength(1);
  });
  it("respects minimum GPU counts per node", () => {
    expect(filterGpus(list, { gpuCount: 8 }).map((g) => g.id)).toEqual(["g"]);
  });
});

describe("parseSshCommand", () => {
  it("parses Lium's ssh_connect_cmd", () => {
    expect(parseSshCommand("ssh root@203.0.113.7 -p 40022")).toEqual({
      user: "root",
      host: "203.0.113.7",
      port: 40022,
      command: "ssh root@203.0.113.7 -p 40022",
    });
    expect(parseSshCommand("ssh -o StrictHostKeyChecking=no -p 2222 ubuntu@pod.example.com")).toMatchObject({
      user: "ubuntu",
      host: "pod.example.com",
      port: 2222,
    });
    expect(parseSshCommand("ssh root@1.2.3.4")?.port).toBe(22);
    expect(parseSshCommand("")).toBeNull();
  });
});

describe("errorFromResponse", () => {
  it("maps Lium's envelope to typed errors", () => {
    const e = errorFromResponse(403, {
      success: false,
      error: { code: "insufficient_balance", message: "Balance too low", hint: "Top up", request_id: "r1" },
    });
    expect(e).toBeInstanceOf(LiumInsufficientBalanceError);
    expect(e).toMatchObject({ status: 403, code: "insufficient_balance", hint: "Top up", requestId: "r1" });
    const nm = errorFromResponse(409, { code: "no_executor_matches_spec", constraint: "max_price_per_gpu_hour", message: "x" });
    expect(nm).toBeInstanceOf(LiumNoMatchError);
    expect((nm as LiumNoMatchError).constraint).toBe("max_price_per_gpu_hour");
    expect(errorFromResponse(404, {})).toBeInstanceOf(LiumNotFoundError);
  });
});

describe("BudgetGuard", () => {
  it("refuses a rent whose worst case exceeds the cap and frees failed reservations", () => {
    const g = new BudgetGuard(1);
    const r1 = g.reserve(0.6);
    expect(() => g.reserve(0.6)).toThrow(BudgetExceededError);
    r1.release();
    const r2 = g.reserve(0.6);
    r2.commit("pod-1");
    expect(g.remaining()).toBeCloseTo(0.4);
    g.close("pod-1", 0.1);
    expect(g.remaining()).toBeCloseTo(0.9);
    expect(() => g.reserve(Number.POSITIVE_INFINITY)).toThrow(/TTL/);
  });
  it("reports when ledger spend reaches the cap", () => {
    const g = new BudgetGuard(0.5);
    g.reserve(0.5).commit("p");
    expect(g.record("p", 0.2)).toBe(false);
    expect(g.record("p", 0.5)).toBe(true);
  });
});

describe("generateSshKeyPair", () => {
  it("creates an OpenSSH ed25519 pair", () => {
    const kp = generateSshKeyPair("test");
    expect(kp.publicKey).toMatch(/^ssh-ed25519 AAAA\S+ test$/);
    expect(kp.privateKey).toContain("OPENSSH PRIVATE KEY");
  });
});

// A local HTTP server that speaks Lium's wire format, to drive retry and fallback paths deterministically.
describe("Lium client against a local server", () => {
  type Handler = (req: IncomingMessage, body: string, res: ServerResponse) => void;
  let handler: Handler = () => {};
  const calls: string[] = [];
  let baseUrl = "";
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c)).on("end", () => {
      calls.push(`${req.method} ${req.url}`);
      handler(req, body, res);
    });
  });
  const json = (res: ServerResponse, status: number, data: unknown, headers: Record<string, string> = {}) => {
    res.writeHead(status, { "content-type": "application/json", ...headers });
    res.end(JSON.stringify(data));
  };

  beforeAll(async () => {
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => new Promise<void>((r) => server.close(() => r())));

  it("retries 429 and 5xx with backoff, honouring Retry-After", async () => {
    let n = 0;
    handler = (_req, _b, res) => (++n < 3 ? json(res, n === 1 ? 429 : 503, {}, { "Retry-After": "0" }) : json(res, 200, { ok: true }));
    const retries: number[] = [];
    const f = createRetryingFetch(fetch, { baseDelayMs: 1, onRetry: (i) => retries.push(i.status ?? 0) });
    const res = await f(`${baseUrl}/x`);
    expect(res.status).toBe(200);
    expect(retries).toEqual([429, 503]);
  });

  it("does not retry a POST without an Idempotency-Key", async () => {
    let n = 0;
    handler = (_req, _b, res) => (n++, json(res, 503, {}));
    const res = await createRetryingFetch(fetch, { baseDelayMs: 1 })(`${baseUrl}/y`, { method: "POST", body: "{}" });
    expect(res.status).toBe(503);
    expect(n).toBe(1);
  });

  it("rentCheapest skips a node taken between listing and renting, sends the key and schedules the TTL", async () => {
    calls.length = 0;
    const seen: Record<string, unknown> = {};
    handler = (req, body, res) => {
      const url = req.url ?? "";
      if (url.startsWith("/executors?") || url === "/executors") {
        seen.key = req.headers["x-api-key"];
        return json(res, 200, [
          exec({ id: "11111111-aaaa", price_per_gpu: 0.2 }),
          exec({ id: "22222222-bbbb", price_per_gpu: 0.3 }),
        ]);
      }
      if (url === "/templates") {
        return json(res, 200, [
          { id: "t-cu13", name: "Pytorch (Cuda + DinD)", category: "PYTORCH", user_id: null, is_private: false, docker_image_tag: "2.12.0-cuda13.0.2", status: "CREATED" },
          { id: "t-cu128", name: "Pytorch (Cuda + DinD)", category: "PYTORCH", user_id: null, is_private: false, docker_image_tag: "2.11.0-cuda12.8", status: "CREATED" },
        ]);
      }
      if (url === "/executors/11111111-aaaa/rent") {
        return json(res, 409, { success: false, error: { code: "node_unavailable", message: "Node rented since you listed it" } });
      }
      if (url === "/executors/22222222-bbbb/rent") {
        seen.rentBody = JSON.parse(body);
        seen.idem = req.headers["idempotency-key"];
        return json(res, 200, { success: true, pod_id: "pod-123" });
      }
      if (url === "/pods/pod-123/schedule-removal") {
        seen.schedule = JSON.parse(body);
        return json(res, 200, { success: true });
      }
      json(res, 404, {});
    };

    const lium = new Lium({ apiKey: "sk_test", baseUrl, retry: { baseDelayMs: 1 } });
    const attempts: string[] = [];
    const before = Date.now();
    const out = await lium.rentCheapest({
      gpu: "RTX4090",
      maxUsdPerHour: 0.5,
      ttlMinutes: 15,
      sshPublicKey: "ssh-ed25519 AAAA test",
      onAttempt: (g, e) => attempts.push(`${g.id}${e ? `:${e.code}` : ""}`),
    });

    expect(seen.key).toBe("sk_test");
    expect(attempts).toEqual(["11111111-aaaa", "11111111-aaaa:node_unavailable", "22222222-bbbb"]);
    expect(out).toMatchObject({ podId: "pod-123", executorId: "22222222-bbbb", gpuCount: 1, pricePerHour: 0.3 });
    expect(seen.rentBody).toMatchObject({ user_public_key: "ssh-ed25519 AAAA test", template_id: "t-cu128", gpu_count: 1 });
    expect(seen.idem).toMatch(/^[0-9a-f-]{36}$/);
    const at = Date.parse((seen.schedule as { removal_scheduled_at: string }).removal_scheduled_at);
    expect(at - before).toBeGreaterThanOrEqual(15 * 60_000 - 1000);
    expect(at - before).toBeLessThan(15 * 60_000 + 5000);
  });

  it("removes the pod if its TTL cannot be scheduled (never leak cost)", async () => {
    let deleted = false;
    handler = (req, _b, res) => {
      const url = req.url ?? "";
      if (url === "/templates") return json(res, 200, [{ id: "t", name: "Pytorch", category: "PYTORCH", user_id: null, docker_image_tag: "cuda12.8" }]);
      if (url === "/executors") return json(res, 200, [exec({ id: "33333333-cccc" })]);
      if (url.endsWith("/rent")) return json(res, 200, { pod_id: "pod-9" });
      if (url.endsWith("/schedule-removal")) return json(res, 400, { error: { code: "bad_request", message: "nope" } });
      if (req.method === "GET" && url === "/pods/pod-9") return json(res, 200, { id: "pod-9", status: "PENDING", spend_to_date: 0 });
      if (req.method === "DELETE" && url === "/pods/pod-9") return (deleted = true), json(res, 200, {});
      json(res, 404, {});
    };
    const lium = new Lium({ apiKey: "k", baseUrl, retry: { baseDelayMs: 1 } });
    await expect(lium.rent("33333333-cccc", { sshPublicKey: "ssh-ed25519 A", ttlMinutes: 15 })).rejects.toMatchObject({
      code: "ttl_schedule_failed",
    });
    expect(deleted).toBe(true);
  });

  it("stop is idempotent", async () => {
    handler = (_req, _b, res) => json(res, 404, { error: { code: "pod_not_found", message: "gone" } });
    const lium = new Lium({ apiKey: "k", baseUrl, retry: { maxRetries: 0 } });
    await expect(lium.stop("pod-x")).resolves.toEqual({ stopped: false, spentUsd: null });
  });

  it("refuses to rent without an API key", async () => {
    const lium = new Lium({ apiKey: "", baseUrl });
    await expect(lium.rent("44444444-dddd", { sshPublicKey: "k" })).rejects.toMatchObject({ code: "missing_api_key" });
  });
});
