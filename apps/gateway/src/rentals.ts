import { createHash, randomUUID } from "node:crypto";
import {
  BLOCK_MINUTES,
  LiumError,
  LiumNotFoundError,
  TERMINAL_POD_STATUSES,
  type GatewayPodStatus,
  type Lium,
} from "gpu402";
import { TAO_ASSET, formatTao } from "@gpu402/tools/tao";
import { explorerTx, networkLabel, type Config } from "./config.js";
import { ACTIVE_STATUSES, type Ledger, type PodRow } from "./db.js";
import type { EventBus } from "./events.js";
import type { GatewayQuote, Pricing, RentRequest } from "./pricing.js";
import type { Refunder } from "./refunds.js";

const MIN = 60_000;
const POD_PREFIX = "gpu402-gw-";
/** Lium removes the pod this long after the paid expiry even if the gateway is down. */
const BACKSTOP_GRACE_MIN = 3;

export interface Settlement {
  txHash: string;
  payer: string;
  network: string;
  asset: string;
  amountAtomic: string;
  amountUsd: number;
}

/** "0.096250 USDC" or "0.000412577 TAO (≈$0.0963)". */
export const paidLabel = (s: Pick<Settlement, "asset" | "amountAtomic" | "amountUsd">) =>
  s.asset === TAO_ASSET ? `${formatTao(s.amountAtomic, 9)} TAO (≈$${s.amountUsd.toFixed(4)})` : `${(Number(s.amountAtomic) / 1e6).toFixed(6)} USDC`;

export const shortAddr = (a: string | null | undefined) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "unknown");
const sshFingerprint = (key: string) =>
  "SHA256:" + createHash("sha256").update(Buffer.from(key.split(/\s+/)[1] ?? key, "base64")).digest("base64").replace(/=+$/, "");

export class CapacityError extends Error {
  override name = "CapacityError";
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

export class RentalService {
  private balanceCache: { at: number; usd: number } | undefined;
  private timers: NodeJS.Timeout[] = [];
  private busy = { poll: false, sweep: false };

  constructor(
    private readonly cfg: Config,
    private readonly lium: Lium,
    private readonly ledger: Ledger,
    private readonly bus: EventBus,
    private readonly pricing: Pricing,
    private readonly refunder: Refunder,
  ) {}

  get canRent(): boolean {
    return Boolean(this.cfg.LIUM_API_KEY && this.cfg.GATEWAY_PAY_TO);
  }

  /** Forget the cached Lium balance, e.g. right after a top-up. */
  invalidateBalance() {
    this.balanceCache = undefined;
  }

  async liumBalance(maxAgeMs = 15_000): Promise<number | null> {
    if (!this.cfg.LIUM_API_KEY) return null;
    if (this.balanceCache && Date.now() - this.balanceCache.at < maxAgeMs) return this.balanceCache.usd;
    try {
      const usd = await this.lium.balance();
      this.balanceCache = { at: Date.now(), usd };
      return usd;
    } catch {
      return this.balanceCache?.usd ?? null;
    }
  }

  /**
   * Runs before the 402 is issued, so an agent is never asked to pay for a
   * rent the gateway cannot fund: Lium needs a balance above 15 minutes of
   * every running pod plus 15 minutes of the new one.
   */
  async checkCapacity(quote: GatewayQuote): Promise<void> {
    if (!this.cfg.LIUM_API_KEY) throw new CapacityError("This gateway has no Lium API key configured, so it can quote but not rent.", "gateway_not_configured");
    if (!this.cfg.GATEWAY_PAY_TO) throw new CapacityError("This gateway has no GATEWAY_PAY_TO wallet configured.", "gateway_not_configured");
    const active = this.ledger.podsByStatus([...ACTIVE_STATUSES, "unpaid"]);
    if (active.length >= this.cfg.MAX_ACTIVE_PODS) {
      throw new CapacityError(`The gateway is at its limit of ${this.cfg.MAX_ACTIVE_PODS} active pods. Try again shortly.`, "gateway_at_capacity");
    }
    const balance = await this.liumBalance();
    const floor = active.reduce((s, p) => s + p.lium_price_per_hour / 4, 0) + quote.liumPricePerHour / 4 + this.cfg.RESERVE_USD;
    if (balance === null || balance < floor) {
      this.bus.emit("gateway.warning", `Refused a ${quote.gpu} rent: Lium balance $${balance?.toFixed(2) ?? "?"} is below the $${floor.toFixed(2)} needed`);
      throw new CapacityError("The gateway's Lium balance cannot cover another pod right now. No payment was requested.", "gateway_low_balance");
    }
  }

  /** Called after the facilitator verified the payment and before it settles: rent on Lium. */
  async rent(req: RentRequest, quote: GatewayQuote, payer: string | null): Promise<PodRow> {
    const name = `${POD_PREFIX}${randomUUID().slice(0, 8)}`;
    const startBudgetMin = req.blocks * BLOCK_MINUTES + this.cfg.START_TIMEOUT_MIN + BACKSTOP_GRACE_MIN;
    const rented = await this.lium.rentCheapest({
      gpu: quote.gpu,
      gpuCount: req.gpuCount,
      // Never pay Lium more per GPU-hour than the price this payment was quoted on.
      maxUsdPerHour: quote.liumPricePerGpuHour,
      secureOnly: this.cfg.SECURE_ONLY,
      sshPublicKey: req.sshPublicKey,
      ttlMinutes: startBudgetMin,
      name,
      customerRef: payer ?? undefined,
    });
    const gpu = (await this.pricing.gpus()).find((g) => g.id === rented.executorId);
    const row: PodRow = {
      id: rented.podId,
      name,
      payer: payer?.toLowerCase() ?? null,
      gpu: rented.gpu || quote.gpu,
      gpu_count: rented.gpuCount,
      executor_id: rented.executorId,
      lium_price_per_hour: rented.pricePerHour || quote.liumPricePerHour,
      block_price_usd: quote.blockPriceUsd,
      blocks_paid: req.blocks,
      status: "unpaid",
      lium_status: "PENDING",
      ssh_host: null,
      ssh_port: null,
      ssh_user: null,
      ssh_key_fingerprint: sshFingerprint(req.sshPublicKey),
      country: gpu?.country ?? null,
      created_at: Date.now(),
      ready_at: null,
      expires_at: null,
      removed_at: null,
      removed_reason: null,
      lium_spend_usd: null,
    };
    this.ledger.insertPod(row);
    this.pricing.release(quote.key);
    this.bus.emit(
      "pod.rented",
      `Rented ${row.gpu}${row.gpu_count > 1 ? ` ×${row.gpu_count}` : ""} on Lium node ${row.executor_id.slice(0, 8)} at $${row.lium_price_per_hour.toFixed(3)}/h${row.country ? ` (${row.country})` : ""}`,
      { podId: row.id, data: { executorId: row.executor_id, liumPricePerHour: row.lium_price_per_hour } },
    );
    return row;
  }

  /** The payment for a rent settled on-chain: the pod is now the payer's. */
  confirmRent(podId: string, s: Settlement) {
    const pod = this.ledger.getPod(podId);
    if (!pod) return;
    this.ledger.insertPayment({
      pod_id: podId,
      kind: "rent",
      blocks: pod.blocks_paid,
      amount_usd: s.amountUsd,
      amount_atomic: s.amountAtomic,
      asset: s.asset,
      network: s.network,
      payer: s.payer.toLowerCase(),
      tx_hash: s.txHash,
      status: "settled",
      created_at: Date.now(),
    });
    this.ledger.updatePod(podId, { status: "starting", payer: s.payer.toLowerCase() });
    this.bus.emit("payment.settled", `Settled ${paidLabel(s)} from ${shortAddr(s.payer)} on ${networkLabel(s.network)} for ${pod.blocks_paid} block(s)`, {
      podId,
      data: { tx: s.txHash, url: explorerTx(s.network, s.txHash), network: s.network },
    });
  }

  /** Settlement failed after the rent: remove the pod at once, the agent paid nothing. */
  async abandonRent(podId: string, reason: string) {
    const pod = this.ledger.getPod(podId);
    if (!pod) return;
    await this.remove(pod, "failed", `payment_failed: ${reason}`);
    this.bus.emit("payment.failed", `Payment did not settle (${reason}); pod ${podId.slice(0, 8)} removed, nothing charged`, { podId });
  }

  /** Paid extension settled: add blocks and move both expiries (ours and Lium's backstop). */
  async confirmExtend(podId: string, blocks: number, s: Settlement) {
    const pod = this.ledger.getPod(podId);
    if (!pod) return;
    this.ledger.insertPayment({
      pod_id: podId,
      kind: "extend",
      blocks,
      amount_usd: s.amountUsd,
      amount_atomic: s.amountAtomic,
      asset: s.asset,
      network: s.network,
      payer: s.payer.toLowerCase(),
      tx_hash: s.txHash,
      status: "settled",
      created_at: Date.now(),
    });
    const blocksPaid = pod.blocks_paid + blocks;
    const expiresAt = pod.expires_at ? pod.expires_at + blocks * BLOCK_MINUTES * MIN : null;
    this.ledger.updatePod(podId, { blocks_paid: blocksPaid, expires_at: expiresAt });
    const backstop = expiresAt ?? pod.created_at + (blocksPaid * BLOCK_MINUTES + this.cfg.START_TIMEOUT_MIN) * MIN;
    await this.lium.scheduleRemoval(podId, new Date(backstop + BACKSTOP_GRACE_MIN * MIN)).catch((err) =>
      this.bus.emit("gateway.warning", `Could not move Lium's removal schedule for ${podId.slice(0, 8)}: ${(err as Error).message}`, { podId }),
    );
    this.bus.emit(
      "pod.extended",
      `Extended by ${blocks} block(s) for ${paidLabel(s)}${expiresAt ? `; now expires ${new Date(expiresAt).toISOString().slice(11, 19)} UTC` : ""}`,
      { podId, data: { tx: s.txHash, url: explorerTx(s.network, s.txHash) } },
    );
  }

  async stopByOwner(pod: PodRow) {
    await this.remove(pod, "stopped", "stopped_by_owner");
    this.bus.emit("pod.stopped", `Owner stopped pod ${pod.id.slice(0, 8)} early`, { podId: pod.id });
  }

  // ----------------------------------------------------------- background work

  start() {
    const every = (ms: number, fn: () => Promise<void>) => {
      const t = setInterval(() => void fn().catch((e) => console.error(e)), ms);
      t.unref();
      this.timers.push(t);
    };
    every(this.cfg.POLL_INTERVAL_MS, () => this.poll());
    every(this.cfg.SWEEP_INTERVAL_MS, () => this.sweep());
    void this.reconcile().then(() => this.sweep()).catch((e) => console.error("reconcile failed", e));
  }

  stop() {
    for (const t of this.timers) clearInterval(t);
    this.timers = [];
  }

  /** Watches starting pods until they are RUNNING with SSH; starts the paid clock then. */
  async poll() {
    if (this.busy.poll || !this.cfg.LIUM_API_KEY) return;
    this.busy.poll = true;
    try {
      for (const pod of this.ledger.podsByStatus(["starting", "running"])) {
        let live;
        try {
          live = await this.lium.getPod(pod.id);
        } catch (err) {
          if (err instanceof LiumNotFoundError) {
            this.ledger.updatePod(pod.id, { status: "failed", removed_at: Date.now(), removed_reason: "gone_from_lium", lium_status: "DELETED" });
            this.bus.emit("pod.failed", `Pod ${pod.id.slice(0, 8)} disappeared from Lium`, { podId: pod.id });
            await this.refundUnused(pod, Date.now());
          }
          continue;
        }
        const fields: Partial<PodRow> = { lium_status: live.status, lium_spend_usd: live.spendToDate ?? pod.lium_spend_usd };
        if (live.ssh) Object.assign(fields, { ssh_host: live.ssh.host, ssh_port: live.ssh.port, ssh_user: live.ssh.user });

        if (TERMINAL_POD_STATUSES.has(live.status)) {
          this.ledger.updatePod(pod.id, fields);
          await this.remove({ ...pod, ...fields }, "failed", `lium_${live.status.toLowerCase()}`);
          this.bus.emit("pod.failed", `Pod ${pod.id.slice(0, 8)} reached ${live.status} on Lium`, { podId: pod.id });
          await this.refundUnused(pod, Date.now());
          continue;
        }
        if (pod.status === "starting" && live.status === "RUNNING" && live.ssh) {
          const readyAt = Date.now();
          const expiresAt = readyAt + pod.blocks_paid * BLOCK_MINUTES * MIN;
          this.ledger.updatePod(pod.id, { ...fields, status: "running", ready_at: readyAt, expires_at: expiresAt });
          await this.lium.scheduleRemoval(pod.id, new Date(expiresAt + BACKSTOP_GRACE_MIN * MIN)).catch(() => {});
          this.bus.emit(
            "pod.ready",
            `Pod ready in ${Math.round((readyAt - pod.created_at) / 1000)} s: ${live.ssh.command} · paid until ${new Date(expiresAt).toISOString().slice(11, 19)} UTC`,
            { podId: pod.id },
          );
          continue;
        }
        if (pod.status === "starting" && Date.now() - pod.created_at > this.cfg.START_TIMEOUT_MIN * MIN) {
          await this.remove({ ...pod, ...fields }, "failed", "start_timeout");
          this.bus.emit("pod.failed", `Pod ${pod.id.slice(0, 8)} did not start within ${this.cfg.START_TIMEOUT_MIN} min; removed`, { podId: pod.id });
          await this.refundUnused(pod, pod.created_at);
          continue;
        }
        this.ledger.updatePod(pod.id, fields);
      }
    } finally {
      this.busy.poll = false;
    }
  }

  /** Removes every pod past its paid expiry. Runs every SWEEP_INTERVAL_MS and once at startup. */
  async sweep() {
    if (this.busy.sweep || !this.cfg.LIUM_API_KEY) return;
    this.busy.sweep = true;
    try {
      const now = Date.now();
      for (const pod of this.ledger.podsByStatus(["running"])) {
        if (pod.expires_at !== null && pod.expires_at <= now) {
          await this.remove(pod, "expired", "paid_time_ended");
          this.bus.emit("pod.expired", `Sweeper removed pod ${pod.id.slice(0, 8)} at paid expiry (${pod.blocks_paid} block(s) used)`, {
            podId: pod.id,
          });
        }
      }
      // A crash between renting and settling leaves an unpaid pod: never let it bill.
      for (const pod of this.ledger.podsByStatus(["unpaid"])) {
        if (now - pod.created_at > 5 * MIN) await this.abandonRent(pod.id, "no settlement recorded");
      }
    } finally {
      this.busy.sweep = false;
    }
  }

  /** At startup: remove gateway pods on Lium that the ledger does not consider active (e.g. after a crash). */
  async reconcile() {
    if (!this.cfg.LIUM_API_KEY) return;
    const active = new Set(this.ledger.podsByStatus([...ACTIVE_STATUSES, "unpaid"]).map((p) => p.id));
    for (const pod of await this.lium.listPods()) {
      if (pod.name.startsWith(POD_PREFIX) && !active.has(pod.id) && !TERMINAL_POD_STATUSES.has(pod.status)) {
        await this.lium.stop(pod.id).catch(() => {});
        this.bus.emit("pod.stopped", `Reconciler removed orphaned gateway pod ${pod.id.slice(0, 8)}`, { podId: pod.id });
      }
    }
  }

  private async remove(pod: PodRow, status: PodRow["status"], reason: string) {
    let spent: number | null = pod.lium_spend_usd;
    try {
      const r = await this.lium.stop(pod.id);
      spent = r.spentUsd ?? spent;
    } catch (err) {
      if (!(err instanceof LiumError && err.status === 404)) {
        this.bus.emit("gateway.warning", `Removing pod ${pod.id.slice(0, 8)} failed (${(err as Error).message}); will retry`, { podId: pod.id });
        return;
      }
    }
    this.ledger.updatePod(pod.id, { status, removed_at: Date.now(), removed_reason: reason, lium_spend_usd: spent });
    this.balanceCache = undefined;
  }

  /** Refunds the unused share of what the agent paid when a pod fails through no fault of theirs. */
  private async refundUnused(pod: PodRow, usedUntil: number) {
    const payments = this.ledger.paymentsForPod(pod.id).filter((p) => p.status === "settled");
    if (payments.length === 0) return;
    const paidMs = pod.blocks_paid * BLOCK_MINUTES * MIN;
    const usedMs = pod.ready_at ? Math.max(Math.min(usedUntil, pod.expires_at ?? usedUntil) - pod.ready_at, 0) : 0;
    const share = Math.max(1 - usedMs / paidMs, 0);
    if (!this.refunder.enabled) {
      this.bus.emit("gateway.warning", `Pod ${pod.id.slice(0, 8)} failed; refund of ${(share * 100).toFixed(0)}% owed but refunds are disabled (${this.refunder.reason})`, {
        podId: pod.id,
      });
      return;
    }
    for (const p of payments) {
      if (share <= 0) continue;
      try {
        const { tx, usd } = await this.refunder.refundPayment(p, share);
        this.ledger.markRefunded(p.id, tx, usd);
        const what = p.asset === TAO_ASSET ? `${formatTao((BigInt(p.amount_atomic) * BigInt(Math.floor(share * 1e6))) / 1_000_000n, 9)} TAO` : `${usd.toFixed(6)} USDC`;
        this.bus.emit("payment.refunded", `Refunded ${what} to ${shortAddr(p.payer)} on ${networkLabel(p.network)}`, {
          podId: pod.id,
          data: { tx, url: explorerTx(p.network, tx) },
        });
      } catch (err) {
        this.bus.emit("gateway.warning", `Refund for pod ${pod.id.slice(0, 8)} failed: ${(err as Error).message}`, { podId: pod.id });
      }
    }
  }

  // ------------------------------------------------------------------- views

  status(pod: PodRow, baseUrl: string): GatewayPodStatus {
    const now = Date.now();
    const iso = (t: number | null) => (t === null ? null : new Date(t).toISOString());
    return {
      podId: pod.id,
      status: pod.status,
      liumStatus: pod.lium_status,
      gpu: pod.gpu,
      gpuCount: pod.gpu_count,
      payer: pod.payer,
      blocksPaid: pod.blocks_paid,
      blockPriceUsd: pod.block_price_usd,
      ssh:
        pod.ssh_host && pod.ssh_port && pod.status === "running"
          ? {
              host: pod.ssh_host,
              port: pod.ssh_port,
              user: pod.ssh_user ?? "root",
              command: `ssh ${pod.ssh_user ?? "root"}@${pod.ssh_host} -p ${pod.ssh_port}`,
            }
          : null,
      createdAt: new Date(pod.created_at).toISOString(),
      readyAt: iso(pod.ready_at),
      expiresAt: iso(pod.expires_at),
      secondsLeft: pod.expires_at && pod.status === "running" ? Math.max(Math.round((pod.expires_at - now) / 1000), 0) : null,
      removedReason: pod.removed_reason,
      payments: this.ledger.paymentsForPod(pod.id).map((p) => ({
        kind: p.kind,
        blocks: p.blocks,
        amountUsd: p.amount_usd,
        asset: p.asset,
        amount: p.asset === TAO_ASSET ? formatTao(p.amount_atomic, 9) : (Number(p.amount_atomic) / 1e6).toFixed(6),
        network: p.network,
        txHash: p.tx_hash,
        explorerUrl: explorerTx(p.network, p.tx_hash),
        status: p.status,
        refundTx: p.refund_tx,
      })),
      links: { self: `${baseUrl}/pods/${pod.id}`, extend: `${baseUrl}/pods/${pod.id}/extend` },
    };
  }
}
