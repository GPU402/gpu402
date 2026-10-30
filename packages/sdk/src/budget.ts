import { BudgetExceededError } from "./errors.js";

interface Reservation {
  /** Worst-case cost: hourly price × TTL. */
  maxUsd: number;
  /** Last spend read from Lium's ledger. */
  spentUsd: number;
  closed: boolean;
}

/**
 * Local spend guard. Every rent reserves its worst-case cost (price × TTL)
 * up front, so a rent that could push total spend past the cap is refused
 * before it reaches Lium. `watch` additionally polls Lium's per-pod ledger
 * and stops every tracked pod once actual spend reaches the cap.
 */
export class BudgetGuard {
  private readonly pods = new Map<string, Reservation>();
  private pending = 0;

  constructor(readonly capUsd: number) {
    if (!(capUsd > 0)) throw new RangeError("Budget cap must be a positive USD amount");
  }

  /** Worst-case USD committed: closed pods at their actual spend, open pods at their reservation. */
  committed(): number {
    let sum = this.pending;
    for (const r of this.pods.values()) sum += r.closed ? r.spentUsd : Math.max(r.maxUsd, r.spentUsd);
    return sum;
  }

  /** USD actually billed so far, per Lium's ledger. */
  spent(): number {
    let sum = 0;
    for (const r of this.pods.values()) sum += r.spentUsd;
    return sum;
  }

  remaining(): number {
    return Math.max(this.capUsd - this.committed(), 0);
  }

  /** Reserves `maxUsd` before a rent; throws if it does not fit. Returns a release function for failed rents. */
  reserve(maxUsd: number): { commit: (podId: string) => void; release: () => void } {
    if (!Number.isFinite(maxUsd)) {
      throw new BudgetExceededError("A budget is set, so every rent needs a TTL (ttlMinutes) to bound its cost.", {
        code: "budget_requires_ttl",
      });
    }
    const after = this.committed() + maxUsd;
    if (after > this.capUsd + 1e-9) {
      throw new BudgetExceededError(
        `Rent refused: worst-case cost $${maxUsd.toFixed(4)} would bring committed spend to $${after.toFixed(4)}, over the $${this.capUsd.toFixed(2)} budget.`,
        { code: "budget_exceeded" },
      );
    }
    this.pending += maxUsd;
    let settled = false;
    return {
      commit: (podId) => {
        if (settled) return;
        settled = true;
        this.pending -= maxUsd;
        this.pods.set(podId, { maxUsd, spentUsd: 0, closed: false });
      },
      release: () => {
        if (settled) return;
        settled = true;
        this.pending -= maxUsd;
      },
    };
  }

  /** Records the latest ledger spend for a pod. Returns true when total spend reached the cap. */
  record(podId: string, spentUsd: number): boolean {
    const r = this.pods.get(podId);
    if (r) r.spentUsd = Math.max(r.spentUsd, spentUsd);
    return this.spent() >= this.capUsd;
  }

  close(podId: string, finalSpentUsd?: number): void {
    const r = this.pods.get(podId);
    if (!r) return;
    if (finalSpentUsd !== undefined) r.spentUsd = Math.max(r.spentUsd, finalSpentUsd);
    r.closed = true;
  }

  openPods(): string[] {
    return [...this.pods.entries()].filter(([, r]) => !r.closed).map(([id]) => id);
  }

  tracks(podId: string): boolean {
    return this.pods.has(podId);
  }
}
