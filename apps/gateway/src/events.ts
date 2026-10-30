import { EventEmitter } from "node:events";
import type { EventRow, Ledger } from "./db.js";

export type GatewayEventType =
  | "quote.issued"
  | "payment.verified"
  | "payment.settled"
  | "payment.failed"
  | "payment.refunded"
  | "pod.rented"
  | "pod.ready"
  | "pod.extended"
  | "pod.expired"
  | "pod.stopped"
  | "pod.failed"
  | "sweeper.run"
  | "gateway.warning";

/** Persists every event to the ledger and fans it out to SSE subscribers (the dashboard). */
export class EventBus {
  private readonly emitter = new EventEmitter();

  constructor(private readonly ledger: Ledger) {
    this.emitter.setMaxListeners(200);
  }

  emit(type: GatewayEventType, message: string, opts: { podId?: string | null; data?: unknown; persist?: boolean } = {}): EventRow {
    const row: Omit<EventRow, "id"> = {
      ts: Date.now(),
      type,
      pod_id: opts.podId ?? null,
      message,
      data: opts.data === undefined ? null : JSON.stringify(opts.data),
    };
    const saved = opts.persist === false ? { ...row, id: 0 } : this.ledger.insertEvent(row);
    this.emitter.emit("event", saved);
    console.log(`[${new Date(row.ts).toISOString()}] ${type.padEnd(16)} ${message}`);
    return saved;
  }

  subscribe(fn: (e: EventRow) => void): () => void {
    this.emitter.on("event", fn);
    return () => this.emitter.off("event", fn);
  }
}
