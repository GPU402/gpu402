"use client";

import { Check, MapPin } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { short, type PodView } from "../lib";
import { STEPS, gpuShort, place, stepOf } from "./events";
import { CountdownRing, Pill, cx } from "./primitives";

const STATUS: Record<PodView["status"], { label: string; tone: "live" | "amber" | "neutral" | "rose" }> = {
  starting: { label: "Starting", tone: "amber" },
  running: { label: "Live", tone: "live" },
  expired: { label: "Paid time ended", tone: "neutral" },
  stopped: { label: "Released", tone: "neutral" },
  failed: { label: "Failed", tone: "rose" },
  unpaid: { label: "Not paid", tone: "rose" },
};

/** The story of the rental happening now (or the last one), in one card. */
export function NowCard({ pod, now, onOpen }: { pod: PodView | null; now: number; onOpen: (p: PodView) => void }) {
  const reduce = useReducedMotion();
  if (!pod) {
    return (
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-faint">Now</p>
        <p className="mt-3 text-[15px] text-text">Waiting for the first agent to pay.</p>
        <p className="mt-1 text-sm text-muted">
          Run <code className="num rounded bg-ink-2 px-1.5 py-0.5 text-text">pnpm demo:agent</code> and watch it arrive here.
        </p>
      </div>
    );
  }
  const step = stepOf(pod);
  const s = STATUS[pod.status];
  const left = pod.expiresAt && pod.status === "running" ? Math.max(0, (Date.parse(pod.expiresAt) - now) / 1000) : 0;
  const pay = pod.payments[0];
  const live = pod.status === "running" || pod.status === "starting";
  return (
    <AnimatePresence mode="wait">
      <motion.button
        key={pod.podId}
        type="button"
        onClick={() => onOpen(pod)}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        className="glass group w-full rounded-2xl p-5 text-left transition-colors duration-100 hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri"
        aria-label={`Rental of ${gpuShort(pod.gpu)} in ${place(pod)}, ${s.label}. Open details.`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-faint">{live ? "Now" : "Last rental"}</p>
              <Pill tone={s.tone}>
                {live && <span className="live-dot size-1.5 rounded-full bg-current" />}
                {s.label}
              </Pill>
            </div>
            <p className="mt-3 truncate font-display text-xl font-light tracking-tight text-text">{gpuShort(pod.gpu)}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="size-3.5" aria-hidden /> {place(pod)}
            </p>
          </div>
          {pod.status === "running" && <CountdownRing left={left} total={pod.blocksPaid * 15 * 60} />}
        </div>

        <ol className="mt-5 grid grid-cols-6 gap-1.5" aria-label="Rental progress">
          {STEPS.map((label, i) => {
            const done = step > i || step === 6;
            const current = step === i;
            return (
              <li key={label} className="grid gap-1.5">
                <span className={cx("h-1 rounded-full", done ? "bg-live" : current ? "bg-amber" : step === -1 ? "bg-rose/40" : "bg-ink-3")} />
                <span className={cx("flex items-center gap-1 text-[11px]", done ? "text-text" : "text-faint")}>
                  {done && <Check className="size-3 text-live" aria-hidden />}
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-hair pt-4 text-sm">
          <span className="text-muted">
            Paid by <span className="num text-text">{short(pod.payer)}</span>
          </span>
          {pay ? (
            <span className={cx("num font-medium", pay.asset === "TAO" ? "text-tao" : "text-usdc")}>
              {pay.amount} {pay.asset === "TAO" ? "TAO" : "USDC"}
            </span>
          ) : (
            <span className="text-faint">Payment pending</span>
          )}
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
