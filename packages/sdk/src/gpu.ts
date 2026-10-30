import type { components } from "./generated/lium.js";

export type LiumExecutor = components["schemas"]["ExecutorDetailResponse"];

/** "NVIDIA GeForce RTX 4090" -> "RTX4090"; "h100 sxm" -> "H100SXM". */
export function normalizeGpuName(name: string): string {
  return name
    .toUpperCase()
    .replace(/\bNVIDIA\b|\bGEFORCE\b|\bTESLA\b/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

/** The GPU type a node is listed under, as Lium names it. */
export function gpuClassOf(e: LiumExecutor): string {
  return e.gpu_class ?? e.machine_name ?? "unknown";
}

/** True when the node's GPU matches the query ("RTX4090", "rtx 4090", "H100", "NVIDIA H200"). */
export function gpuMatches(e: LiumExecutor, query: string): boolean {
  const q = normalizeGpuName(query);
  if (!q) return true;
  return [e.gpu_class, e.gpu_class_display, e.machine_name].some((n) => n && normalizeGpuName(n).includes(q));
}

/**
 * Smallest number of GPUs a node rents out at once. A provider turns GPU splitting off by
 * clearing the minimum, so a multi-GPU node with no minimum rents whole only.
 */
export function minRentableGpus(e: LiumExecutor): number {
  return e.min_gpu_count_for_rental ?? Math.max(e.gpu_count ?? 1, 1);
}

export interface Gpu {
  /** Executor (node) id: pass it to `rent` or `quote`. */
  id: string;
  /** Lium's GPU type, e.g. "NVIDIA GeForce RTX 4090". */
  gpu: string;
  gpuCount: number;
  availableGpuCount: number;
  /** Smallest number of GPUs this node rents out at once. */
  minGpuCount: number;
  pricePerGpuHour: number;
  vramGb: number | null;
  maxCudaVersion: number | null;
  country: string | null;
  city: string | null;
  reliabilityScore: number | null;
  tier: string | null;
  downloadMbps: number | null;
  minerHotkey: string | null;
  raw: LiumExecutor;
}

export function toGpu(e: LiumExecutor): Gpu {
  const specs = (e.specs ?? {}) as {
    gpu?: { details?: Array<{ capacity?: number }> };
    gpu_metrics?: { vram_gb?: number };
  };
  const capacityMb = specs.gpu?.details?.[0]?.capacity;
  const vram = specs.gpu_metrics?.vram_gb ?? (capacityMb ? Math.round(capacityMb / 1024) : null);
  const loc = e.location as { country?: string | null; city?: string | null } | null | undefined;
  return {
    id: e.id,
    gpu: gpuClassOf(e),
    gpuCount: e.gpu_count ?? 0,
    availableGpuCount: e.available_gpu_count ?? e.gpu_count ?? 0,
    minGpuCount: minRentableGpus(e),
    pricePerGpuHour: e.price_per_gpu ?? Number.POSITIVE_INFINITY,
    vramGb: vram ?? null,
    maxCudaVersion: e.max_cuda_version ?? null,
    country: loc?.country ?? null,
    city: loc?.city ?? null,
    reliabilityScore: e.reliability_score ?? null,
    tier: e.tier ?? null,
    downloadMbps: e.effective_download_speed_mbps ?? null,
    minerHotkey: e.miner_hotkey ?? null,
    raw: e,
  };
}

export interface GpuFilter {
  /** One GPU model or a list of acceptable models, e.g. "RTX4090" or ["RTX4090", "RTX3090"]. */
  gpu?: string | string[];
  /** GPUs per pod. Default 1. */
  gpuCount?: number;
  /** Ceiling on the price per GPU-hour. */
  maxUsdPerGpuHour?: number;
  minVramGb?: number;
  /** ISO country code or name. */
  country?: string;
  /** Skip spot nodes, which a provider may reclaim at any time. Default false. */
  secureOnly?: boolean;
  /** Skip nodes Lium flags for frequent rent failures. Default true. */
  reliableOnly?: boolean;
}

/** Rentable nodes matching the filter, cheapest per GPU-hour first, most reliable first on ties. */
export function filterGpus(executors: LiumExecutor[], filter: GpuFilter = {}): Gpu[] {
  const wanted = filter.gpu === undefined ? [] : Array.isArray(filter.gpu) ? filter.gpu : [filter.gpu];
  const count = filter.gpuCount ?? 1;
  const reliableOnly = filter.reliableOnly ?? true;
  return executors
    .filter((e) => e.price_per_gpu != null && e.active !== false && e.is_responsive !== false)
    .filter((e) => (e.available_gpu_count ?? e.gpu_count ?? 0) >= count)
    .filter((e) => minRentableGpus(e) <= count)
    .filter((e) => !reliableOnly || (!e.frequent_rent_failures && e.disk_health_ok !== false))
    .filter((e) => !filter.secureOnly || e.tier !== "spot")
    .filter((e) => wanted.length === 0 || wanted.some((w) => gpuMatches(e, w)))
    .map(toGpu)
    .filter((g) => filter.maxUsdPerGpuHour === undefined || g.pricePerGpuHour <= filter.maxUsdPerGpuHour)
    .filter((g) => filter.minVramGb === undefined || (g.vramGb ?? 0) >= filter.minVramGb)
    .filter((g) => {
      if (!filter.country) return true;
      const c = filter.country.toLowerCase();
      const code = ((g.raw.location as { country_code?: string } | null)?.country_code ?? "").toLowerCase();
      return code === c || (g.country ?? "").toLowerCase() === c;
    })
    .sort((a, b) => a.pricePerGpuHour - b.pricePerGpuHour || (b.reliabilityScore ?? 0) - (a.reliabilityScore ?? 0));
}
