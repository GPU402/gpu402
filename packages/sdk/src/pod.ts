import type { components } from "./generated/lium.js";

export type LiumPodDetail = components["schemas"]["PodDetailResponse"];
export type LiumPodListItem = components["schemas"]["PodListItemResponse"];

export interface SshTarget {
  host: string;
  port: number;
  user: string;
  /** The command Lium prints, e.g. `ssh root@1.2.3.4 -p 40022`. */
  command: string;
}

/** Statuses after which a pod will never become RUNNING. */
export const TERMINAL_POD_STATUSES = new Set([
  "CREATION_FAILED",
  "FAILED",
  "BROKEN",
  "STOPPED",
  "DELETED",
  "REMOVED",
  "REBOOT_FAILED",
  "TERMINATED",
]);

export interface Pod {
  id: string;
  name: string;
  /** Lium status: PENDING, RUNNING, CREATION_FAILED, BROKEN, … */
  status: string;
  executorId: string;
  gpu: string;
  gpuCount: number;
  /** USD per hour for the whole pod. */
  pricePerHour: number | null;
  /** Set once the pod answers on SSH (or, while PENDING, once its port is known). */
  ssh: SshTarget | null;
  /** USD billed to this rental so far, from Lium's ledger. */
  spendToDate: number | null;
  createdAt: string | null;
  removalScheduledAt: string | null;
  /** While PENDING: the step the create has reached. */
  phase: string | null;
  estimatedReadySeconds: number | null;
  raw: LiumPodDetail | LiumPodListItem;
}

/**
 * Parses `ssh root@1.2.3.4 -p 40022` (and variants with `-o` options or the
 * port before the target).
 */
export function parseSshCommand(cmd: string | null | undefined): SshTarget | null {
  if (!cmd) return null;
  const target = cmd.match(/(?:^|\s)([A-Za-z0-9._-]+)@(\[[^\]]+\]|[A-Za-z0-9.:-]+)/);
  if (!target) return null;
  const port = cmd.match(/(?:^|\s)-p\s*(\d{1,5})(?:\s|$)/);
  return {
    user: target[1]!,
    host: target[2]!.replace(/^\[|\]$/g, ""),
    port: port ? Number(port[1]) : 22,
    command: cmd.trim(),
  };
}

export function toPod(p: LiumPodDetail | LiumPodListItem): Pod {
  const d = p as Partial<LiumPodDetail> & { id: string };
  return {
    id: d.id,
    name: d.pod_name ?? "",
    status: String(d.status ?? "UNKNOWN").toUpperCase(),
    executorId: d.executor_id ?? "",
    gpu: d.gpu_name ?? "",
    gpuCount: Number(d.gpu_count ?? 0),
    pricePerHour: d.price ?? null,
    ssh: parseSshCommand(d.ssh_connect_cmd) ?? null,
    spendToDate: d.spend_to_date ?? null,
    createdAt: d.created_at ?? null,
    removalScheduledAt: d.removal_scheduled_at ?? null,
    phase: d.phase ?? null,
    estimatedReadySeconds: d.estimated_ready_seconds ?? null,
    raw: p,
  };
}
