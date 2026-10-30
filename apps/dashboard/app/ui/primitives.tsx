"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** A number that eases to its new value (instant under reduced motion). */
export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      from.current = value;
      return;
    }
    const c = animate(from.current, value, { duration: 0.6, ease: [0, 0, 0.2, 1], onUpdate: setShown });
    from.current = value;
    return () => c.stop();
  }, [value, reduce]);
  return <>{format(shown)}</>;
}

/** Circular countdown: fraction of paid time left. */
export function CountdownRing({ left, total, size = 64, color = "var(--live)" }: { left: number; total: number; size?: number; color?: string }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.max(0, Math.min(1, left / total)) : 0;
  const m = Math.floor(left / 60);
  const s = Math.floor(left % 60);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${m} minutes ${s} seconds of paid time left`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ink-3)" strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - frac)} style={{ transition: "stroke-dashoffset 1s linear" }} />
      </svg>
      <span className="num absolute text-[13px] text-text">
        {m}:{String(s).padStart(2, "0")}
      </span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-xl bg-ink-2 motion-reduce:animate-none", className)} aria-hidden />;
}

export function Empty({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-hair px-6 py-12 text-center">
      <p className="text-[15px] font-medium text-text">{title}</p>
      {hint && <p className="max-w-md text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "live" | "usdc" | "tao" | "amber" | "rose" }) {
  const tones = {
    neutral: "border-hair bg-ink-1 text-muted",
    live: "border-live/30 bg-live/10 text-live",
    usdc: "border-usdc/30 bg-usdc/10 text-usdc",
    tao: "border-tao/30 bg-tao/10 text-tao",
    amber: "border-amber/30 bg-amber/10 text-amber",
    rose: "border-rose/30 bg-rose/10 text-rose",
  } as const;
  return <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

/** "12s ago", "4m ago", refreshed each second by the caller's clock. */
export function ago(ts: number, now: number) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}
