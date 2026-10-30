import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * The pod ledger. Every rental, payment and lifecycle event is written here
 * before anything else happens, so a crash never loses track of a billed pod.
 */

export type PodStatus = "starting" | "running" | "expired" | "stopped" | "failed" | "unpaid";
export const ACTIVE_STATUSES: PodStatus[] = ["starting", "running"];

export interface PodRow {
  id: string;
  name: string;
  payer: string | null;
  gpu: string;
  gpu_count: number;
  executor_id: string;
  lium_price_per_hour: number;
  block_price_usd: number;
  blocks_paid: number;
  status: PodStatus;
  lium_status: string | null;
  ssh_host: string | null;
  ssh_port: number | null;
  ssh_user: string | null;
  ssh_key_fingerprint: string;
  country: string | null;
  created_at: number;
  ready_at: number | null;
  expires_at: number | null;
  removed_at: number | null;
  removed_reason: string | null;
  lium_spend_usd: number | null;
  /** Where the node is, from Lium's node data (for the dashboard globe). */
  lat: number | null;
  lon: number | null;
  city: string | null;
}

export interface PaymentRow {
  id: number;
  pod_id: string;
  kind: "rent" | "extend";
  blocks: number;
  amount_usd: number;
  amount_atomic: string;
  asset: string;
  network: string;
  payer: string;
  tx_hash: string;
  status: "settled" | "refunded";
  refund_tx: string | null;
  refund_usd: number | null;
  created_at: number;
}

export interface EventRow {
  id: number;
  ts: number;
  type: string;
  pod_id: string | null;
  message: string;
  data: string | null;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS pods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  payer TEXT,
  gpu TEXT NOT NULL,
  gpu_count INTEGER NOT NULL,
  executor_id TEXT NOT NULL,
  lium_price_per_hour REAL NOT NULL,
  block_price_usd REAL NOT NULL,
  blocks_paid INTEGER NOT NULL,
  status TEXT NOT NULL,
  lium_status TEXT,
  ssh_host TEXT,
  ssh_port INTEGER,
  ssh_user TEXT,
  ssh_key_fingerprint TEXT NOT NULL,
  country TEXT,
  created_at INTEGER NOT NULL,
  ready_at INTEGER,
  expires_at INTEGER,
  removed_at INTEGER,
  removed_reason TEXT,
  lium_spend_usd REAL
);
CREATE INDEX IF NOT EXISTS pods_status ON pods(status);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pod_id TEXT NOT NULL REFERENCES pods(id),
  kind TEXT NOT NULL,
  blocks INTEGER NOT NULL,
  amount_usd REAL NOT NULL,
  amount_atomic TEXT NOT NULL,
  asset TEXT NOT NULL,
  network TEXT NOT NULL,
  payer TEXT NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  refund_tx TEXT,
  refund_usd REAL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  type TEXT NOT NULL,
  pod_id TEXT,
  message TEXT NOT NULL,
  data TEXT
);
`;

export class Ledger {
  readonly db: DatabaseSync;

  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    this.db.exec(SCHEMA);
    // Ledgers created before node locations were recorded gain the columns in place.
    const cols = new Set((this.db.prepare("PRAGMA table_info(pods)").all() as { name: string }[]).map((c) => c.name));
    for (const [name, type] of [["lat", "REAL"], ["lon", "REAL"], ["city", "TEXT"]] as const) {
      if (!cols.has(name)) this.db.exec(`ALTER TABLE pods ADD COLUMN ${name} ${type}`);
    }
  }

  insertPod(p: Omit<PodRow, "lium_status" | "ssh_host" | "ssh_port" | "ssh_user" | "ready_at" | "expires_at" | "removed_at" | "removed_reason" | "lium_spend_usd">) {
    this.db
      .prepare(
        `INSERT INTO pods (id, name, payer, gpu, gpu_count, executor_id, lium_price_per_hour, block_price_usd, blocks_paid, status, ssh_key_fingerprint, country, created_at, lat, lon, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(p.id, p.name, p.payer, p.gpu, p.gpu_count, p.executor_id, p.lium_price_per_hour, p.block_price_usd, p.blocks_paid, p.status, p.ssh_key_fingerprint, p.country, p.created_at, p.lat, p.lon, p.city);
  }

  updatePod(id: string, fields: Partial<PodRow>) {
    const keys = Object.keys(fields) as (keyof PodRow)[];
    if (keys.length === 0) return;
    const sql = `UPDATE pods SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`;
    this.db.prepare(sql).run(...keys.map((k) => fields[k] as never), id);
  }

  getPod(id: string): PodRow | undefined {
    return this.db.prepare("SELECT * FROM pods WHERE id = ?").get(id) as PodRow | undefined;
  }

  podsByStatus(statuses: PodStatus[]): PodRow[] {
    return this.db
      .prepare(`SELECT * FROM pods WHERE status IN (${statuses.map(() => "?").join(",")}) ORDER BY created_at`)
      .all(...statuses) as unknown as PodRow[];
  }

  recentPods(limit = 50): PodRow[] {
    return this.db.prepare("SELECT * FROM pods ORDER BY created_at DESC LIMIT ?").all(limit) as unknown as PodRow[];
  }

  insertPayment(p: Omit<PaymentRow, "id" | "refund_tx" | "refund_usd">): number {
    const r = this.db
      .prepare(
        `INSERT INTO payments (pod_id, kind, blocks, amount_usd, amount_atomic, asset, network, payer, tx_hash, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(p.pod_id, p.kind, p.blocks, p.amount_usd, p.amount_atomic, p.asset, p.network, p.payer, p.tx_hash, p.status, p.created_at);
    return Number(r.lastInsertRowid);
  }

  markRefunded(paymentId: number, refundTx: string, refundUsd: number) {
    this.db.prepare("UPDATE payments SET status = 'refunded', refund_tx = ?, refund_usd = ? WHERE id = ?").run(refundTx, refundUsd, paymentId);
  }

  paymentsForPod(podId: string): PaymentRow[] {
    return this.db.prepare("SELECT * FROM payments WHERE pod_id = ? ORDER BY created_at").all(podId) as unknown as PaymentRow[];
  }

  recentPayments(limit = 50): PaymentRow[] {
    return this.db.prepare("SELECT * FROM payments ORDER BY created_at DESC LIMIT ?").all(limit) as unknown as PaymentRow[];
  }

  insertEvent(e: Omit<EventRow, "id">): EventRow {
    const r = this.db.prepare("INSERT INTO events (ts, type, pod_id, message, data) VALUES (?, ?, ?, ?, ?)").run(e.ts, e.type, e.pod_id, e.message, e.data);
    return { ...e, id: Number(r.lastInsertRowid) };
  }

  recentEvents(limit = 60): EventRow[] {
    return this.db.prepare("SELECT * FROM events ORDER BY id DESC LIMIT ?").all(limit) as unknown as EventRow[];
  }

  totals(now = Date.now()) {
    const pay = this.db
      .prepare(
        `SELECT COUNT(*) AS n, COALESCE(SUM(amount_usd), 0) AS gross, COALESCE(SUM(refund_usd), 0) AS refunded FROM payments`,
      )
      .get() as { n: number; gross: number; refunded: number };
    const pods = this.db
      .prepare(
        `SELECT COUNT(*) AS n,
                SUM(CASE WHEN status IN ('starting','running') THEN 1 ELSE 0 END) AS active,
                COALESCE(SUM(lium_spend_usd), 0) AS liumSpend,
                COALESCE(SUM(CASE WHEN ready_at IS NOT NULL
                  THEN (MIN(COALESCE(removed_at, ?), COALESCE(expires_at, ?), ?) - ready_at) * gpu_count ELSE 0 END), 0) AS gpuMs
         FROM pods`,
      )
      .get(now, now, now) as { n: number; active: number | null; liumSpend: number; gpuMs: number };
    return {
      payments: pay.n,
      usdcReceived: pay.gross - pay.refunded,
      usdcRefunded: pay.refunded,
      pods: pods.n,
      activePods: pods.active ?? 0,
      liumSpendUsd: pods.liumSpend,
      gpuMinutesRouted: Math.max(pods.gpuMs, 0) / 60_000,
    };
  }

  spendByPayer(limit = 10) {
    return this.db
      .prepare(
        `SELECT payer, COUNT(DISTINCT pod_id) AS pods, SUM(amount_usd - COALESCE(refund_usd, 0)) AS usd
         FROM payments GROUP BY payer ORDER BY usd DESC LIMIT ?`,
      )
      .all(limit) as { payer: string; pods: number; usd: number }[];
  }
}
