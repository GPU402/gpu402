import { AlertTriangle, BadgeCheck, Coins, Cpu, FileText, Power, RotateCcw, ShieldX, Timer, Zap, type LucideIcon } from "lucide-react";
import type { GatewayEvent, PodView } from "../lib";

export type Tone = "neutral" | "live" | "usdc" | "tao" | "amber" | "rose";

const TAO_NETS = new Set(["eip155:945", "eip155:964"]);

/** Which rail an event belongs to, from its own data or its wording. */
export function railOf(e: GatewayEvent): "usdc" | "tao" | null {
  try {
    const d = e.data ? (JSON.parse(e.data) as { network?: string }) : null;
    if (d?.network) return TAO_NETS.has(d.network) ? "tao" : "usdc";
  } catch {}
  if (/\bTAO\b/.test(e.message)) return "tao";
  if (/USDC/.test(e.message)) return "usdc";
  return null;
}

export const EVENT: Record<string, { icon: LucideIcon; tone: Tone; label: string }> = {
  "quote.issued": { icon: FileText, tone: "neutral", label: "402 quote" },
  "payment.verified": { icon: BadgeCheck, tone: "usdc", label: "Payment verified" },
  "payment.settled": { icon: Coins, tone: "usdc", label: "Settled on-chain" },
  "payment.rejected": { icon: ShieldX, tone: "rose", label: "Payment refused" },
  "payment.failed": { icon: ShieldX, tone: "rose", label: "Not settled" },
  "payment.refunded": { icon: RotateCcw, tone: "amber", label: "Refunded" },
  "pod.rented": { icon: Cpu, tone: "live", label: "Rented on Lium" },
  "pod.ready": { icon: Zap, tone: "live", label: "GPU ready" },
  "pod.extended": { icon: Timer, tone: "live", label: "Extended" },
  "pod.expired": { icon: Power, tone: "neutral", label: "Removed at expiry" },
  "pod.stopped": { icon: Power, tone: "neutral", label: "Released" },
  "pod.failed": { icon: AlertTriangle, tone: "rose", label: "Pod failed" },
  "gateway.warning": { icon: AlertTriangle, tone: "amber", label: "Notice" },
};

export function eventMeta(e: GatewayEvent) {
  const m = EVENT[e.type] ?? { icon: FileText, tone: "neutral" as Tone, label: e.type };
  const rail = railOf(e);
  // Payments take the colour of the rail they ran on.
  const tone: Tone = e.type.startsWith("payment.") && m.tone === "usdc" && rail === "tao" ? "tao" : m.tone;
  return { ...m, tone };
}

/** The steps of one rental, lit from what the pod and its events say. */
export const STEPS = ["Quote", "Paid", "Rented", "Settled", "Ready", "Done"] as const;

export function stepOf(pod: PodView): number {
  if (pod.status === "expired" || pod.status === "stopped") return 6;
  if (pod.status === "failed" || pod.status === "unpaid") return -1;
  if (pod.status === "running") return 5;
  return pod.payments.length ? 4 : 3;
}

export const gpuShort = (g: string) => g.replace(/^NVIDIA\s+/, "").replace(/GeForce\s+/, "").replace(/Tesla\s+/, "");
export const place = (p: { city?: string | null; country?: string | null }) => [p.city, p.country].filter(Boolean).join(", ") || "Unknown location";
export const toneColor: Record<Tone, string> = { neutral: "var(--muted)", live: "var(--live)", usdc: "var(--usdc)", tao: "var(--tao)", amber: "var(--amber)", rose: "var(--rose)" };
