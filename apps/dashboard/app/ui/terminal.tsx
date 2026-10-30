"use client";

import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GatewayEvent } from "../lib";
import { cx, useCalmMotion } from "./primitives";

/** The five steps of a paid rental, each drawn from the gateway's own events. */
const STEPS = [
  {
    id: "quote",
    tab: "Quote",
    title: "Ask for a GPU. Get a price.",
    body: "The agent calls the gateway. It answers HTTP 402 with the price of a 15-minute block, taken from Lium’s live market.",
    types: ["quote.issued"],
  },
  {
    id: "pay",
    tab: "Pay",
    title: "Pay in the same request.",
    body: "The agent signs USDC on Base or sends TAO on Bittensor, then retries. No account and no API key.",
    types: ["payment.verified", "payment.settled", "payment.rejected", "payment.failed"],
  },
  {
    id: "rent",
    tab: "Rent",
    title: "A Subnet 51 miner takes the job.",
    body: "The gateway rents the cheapest matching Lium node. The payment settles on-chain.",
    types: ["pod.rented", "pod.failed", "payment.refunded"],
  },
  {
    id: "run",
    tab: "Run",
    title: "Run code on the GPU.",
    body: "The pod answers over SSH within seconds. Paid time starts only once it does.",
    types: ["pod.ready", "pod.extended"],
  },
  {
    id: "release",
    tab: "Release",
    title: "Pay only for what ran.",
    body: "When paid time ends, the gateway removes the pod. A rental that fails is refunded.",
    types: ["pod.expired", "pod.stopped"],
  },
] as const;

type Line = { key: string; text: string; tone: "cmd" | "ok" | "in" | "warn" | "bad" | "dim"; url?: string | null };

const TONE: Record<Line["tone"], string> = {
  cmd: "text-text",
  ok: "text-live",
  in: "text-peri",
  warn: "text-amber",
  bad: "text-rose",
  dim: "text-faint",
};

const urlOf = (e: GatewayEvent) => {
  try {
    return e.data ? ((JSON.parse(e.data) as { url?: string | null }).url ?? null) : null;
  } catch {
    return null;
  }
};

/** The latest rental's events, from its 402 quote to its removal. */
function lastRun(events: GatewayEvent[]) {
  const asc = [...events].sort((a, b) => a.ts - b.ts);
  const rented = [...asc].reverse().find((e) => e.type === "pod.rented" && e.pod_id);
  if (!rented) return null;
  const quote = [...asc].reverse().find((e) => e.type === "quote.issued" && e.ts <= rented.ts);
  const from = quote?.ts ?? rented.ts;
  const run = asc.filter((e) => e.pod_id === rented.pod_id || (!e.pod_id && e.ts >= from && e.ts <= rented.ts));
  return { pod: rented.pod_id!, run };
}

function linesFor(step: number, run: GatewayEvent[]): Line[] {
  const s = STEPS[step]!;
  const mine = run.filter((e) => (s.types as readonly string[]).includes(e.type));
  const out: Line[] = [];
  if (s.id === "quote") {
    out.push({ key: "cmd", text: "$ pnpm demo:agent", tone: "cmd" });
    out.push({ key: "req", text: "→ POST /rent  { gpu, blocks: 1, sshPublicKey }", tone: "dim" });
    out.push({ key: "402", text: "← HTTP 402 Payment Required", tone: "in" });
  }
  if (s.id === "pay") out.push({ key: "retry", text: "→ POST /rent  PAYMENT-SIGNATURE: <signed payment>", tone: "dim" });
  if (s.id === "run") out.push({ key: "ssh", text: "$ ssh into the pod, run the job", tone: "cmd" });
  for (const e of mine) {
    const bad = e.type.endsWith("failed") || e.type === "payment.rejected";
    out.push({
      key: `${e.id}`,
      text: `${bad ? "✗" : "✓"} ${e.message}`,
      tone: bad ? "bad" : e.type === "payment.refunded" ? "warn" : "ok",
      url: urlOf(e),
    });
  }
  if (mine.length === 0 && s.id !== "quote") out.push({ key: "wait", text: "… not reached yet", tone: "dim" });
  return out;
}

const STEP_MS = 5000;

export function HowItWorks({ events }: { events: GatewayEvent[] }) {
  const reduce = useCalmMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const last = useMemo(() => lastRun(events), [events]);
  const lines = last ? linesFor(step, last.run) : [];

  // Walk through the steps while the section is on screen, until someone picks one.
  const playing = auto && inView && !reduce;
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, step]);

  const s = STEPS[step]!;
  return (
    <section ref={ref} id="how" className="scroll-mt-24 py-24 lg:py-40">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <p className="eyebrow">
            <span className="text-peri">01</span> —— How it works / Step {step + 1} · {s.tab}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            >
              <h2 className="mt-5 text-[clamp(1.75rem,3vw,2.5rem)] font-light leading-[1.1] tracking-[-0.035em]">{s.title}</h2>
              <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted">{s.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div>
          <div className="overflow-hidden rounded-2xl border border-hair bg-[#0b0c0f] shadow-[0_40px_120px_-40px_rgba(67,96,255,0.35)]">
            <div className="flex items-center gap-3 border-b border-hair px-4 py-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-ink-3" />
                <span className="size-2.5 rounded-full bg-ink-3" />
                <span className="size-2.5 rounded-full bg-ink-3" />
              </span>
              <p className="num truncate text-[13px] text-muted">
                gpu402 / agent{last && <span className="text-faint"> · pod {last.pod.slice(0, 8)}</span>}
              </p>
              <p className="eyebrow ml-auto hidden whitespace-nowrap text-[10px] sm:block">Replayed</p>
            </div>
            <ol className="num min-h-[260px] space-y-2 p-5 text-[13px] leading-relaxed sm:min-h-[280px]" aria-live="polite" aria-label={`Terminal, step ${step + 1}: ${s.tab}`}>
              {!last ? (
                <>
                  <li className="text-text">$ pnpm demo:agent</li>
                  <li className="text-faint">
                    Waiting for the first agent to pay<span className="caret">▍</span>
                  </li>
                </>
              ) : (
                lines.map((l, i) => (
                  <motion.li
                    key={`${s.id}-${l.key}`}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: reduce ? 0 : i * 0.18, ease: [0, 0, 0.2, 1] }}
                    className={cx("break-words", TONE[l.tone])}
                  >
                    {l.text}
                    {l.url && (
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 inline-flex items-center gap-0.5 text-peri underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-peri"
                      >
                        tx <ArrowUpRight className="size-3" aria-hidden />
                      </a>
                    )}
                  </motion.li>
                ))
              )}
            </ol>
          </div>

          <div role="tablist" aria-label="Steps" className="mt-4 grid grid-cols-5 gap-2">
            {STEPS.map((x, i) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={i === step}
                onClick={() => (setStep(i), setAuto(false))}
                className="group grid min-h-10 gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peri"
              >
                <span className="relative h-0.5 overflow-hidden rounded-full bg-ink-3">
                  {i < step && <span className="absolute inset-0 bg-ink-3" />}
                  {i === step && (
                    <motion.span
                      key={`${step}-${playing}`}
                      className="absolute inset-y-0 left-0 bg-accent"
                      initial={{ width: playing ? "0%" : "100%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: playing ? STEP_MS / 1000 : 0, ease: "linear" }}
                    />
                  )}
                </span>
                <span className={cx("eyebrow truncate text-[11px] transition-colors duration-100", i === step ? "text-text" : "group-hover:text-muted")}>{x.tab}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
