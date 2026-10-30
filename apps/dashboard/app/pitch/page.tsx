"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Maximize2 } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { getJson, type EngineNodeView, type GatewayState } from "../lib";
import { InstallChip } from "../ui/kit";
import { CountUp, cx, useCalmMotion } from "../ui/primitives";

const Engine = dynamic(() => import("../engine/Engine"), { ssr: false });
const GpuCard = dynamic(() => import("../engine/GpuCard"), { ssr: false });

const REPO = "https://github.com/GPU402/gpu402";

// ------------------------------------------------------------------ motion

const EASE = [0.16, 1, 0.3, 1] as const;

/** The slide itself: slides in from the direction of travel, out of a blur. */
const slideV: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 80, filter: "blur(12px)" }),
  show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE, staggerChildren: 0.09, delayChildren: 0.12 } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -60, filter: "blur(10px)", transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }),
};

/** Each line on a slide rises in after the one before. */
const itemV: Variants = {
  enter: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
  exit: { opacity: 0 },
};

function I({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemV} className={className}>
      {children}
    </motion.div>
  );
}

const Kicker = ({ n, children }: { n: number; children: ReactNode }) => (
  <I>
    <p className="eyebrow">
      <span className="text-peri">{String(n).padStart(2, "0")}</span> —— {children}
    </p>
  </I>
);

const H = ({ children, className }: { children: ReactNode; className?: string }) => (
  <I>
    <h2 className={cx("mt-6 text-[clamp(2.6rem,min(6.4vw,10vh),6.5rem)] font-light leading-[0.98] tracking-[-0.055em] text-balance", className)}>{children}</h2>
  </I>
);

const Em = ({ children, color = "text-peri" }: { children: ReactNode; color?: string }) => <span className={cx("font-serif italic tracking-[-0.02em]", color)}>{children}</span>;

// ------------------------------------------------------------------ data

interface Live {
  state: GatewayState | null;
  nodes: EngineNodeView[];
  versions: Record<string, string>;
}

function useLive(): Live {
  const [state, setState] = useState<GatewayState | null>(null);
  const [nodes, setNodes] = useState<EngineNodeView[]>([]);
  const [versions, setVersions] = useState<Record<string, string>>({});
  useEffect(() => {
    getJson<GatewayState>("/api/state").then(setState, () => {});
    getJson<{ nodes: EngineNodeView[] }>("/api/nodes").then((r) => setNodes(r.nodes), () => {});
    for (const name of ["gpu402", "@gpu402/tools"]) {
      fetch(`https://registry.npmjs.org/${name.replace("/", "%2f")}/latest`)
        .then((r) => r.json())
        .then((j: { version: string }) => setVersions((v) => ({ ...v, [name]: j.version })), () => {});
    }
  }, []);
  return { state, nodes, versions };
}

// ------------------------------------------------------------------ slides

type Slide = { title: string; glow: string; render: (live: Live, still: boolean) => ReactNode };

const SLIDES: Slide[] = [
  {
    title: "GPU402",
    glow: "rgba(67,96,255,0.22)",
    render: ({ nodes }, still) => (
      <>
        <motion.div variants={itemV} className="pointer-events-none absolute inset-y-0 right-[-18vw] w-[78vw] max-md:inset-x-0 max-md:top-[40%] max-md:w-full" aria-hidden>
          <Engine nodes={nodes} pods={[]} pulses={[]} still={still} />
        </motion.div>
        <div className="relative max-w-[56rem]">
          <I>
            <p className="num inline-flex items-center gap-3 rounded-full border border-hair bg-void/60 py-1.5 pl-1.5 pr-4 text-[13px] backdrop-blur">
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-peri">HTTP</span> 402 → 200
            </p>
          </I>
          <I>
            <h1 className="mt-8 text-[clamp(4rem,min(13vw,20vh),11rem)] font-light leading-[0.85] tracking-[-0.07em]">GPU402</h1>
          </I>
          <I>
            <p className="mt-6 text-[clamp(1.5rem,min(3.2vw,5vh),2.75rem)] font-light leading-tight tracking-[-0.03em]">
              GPUs that agents <Em>pay for themselves.</Em>
            </p>
          </I>
        </div>
      </>
    ),
  },
  {
    title: "The problem",
    glow: "rgba(240,97,109,0.14)",
    render: () => (
      <div className="max-w-[60rem]">
        <Kicker n={2}>The problem</Kicker>
        <H>
          Agents can write code.
          <br />
          They <Em color="text-rose">can’t</Em> rent a GPU.
        </H>
        <I className="mt-12 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[clamp(1rem,1.8vw,1.4rem)] text-muted">
          {["a credit card", "an account", "an API key", "a human"].map((w, i) => (
            <span key={w} className="relative">
              {w}
              <motion.span
                className="absolute inset-x-0 top-1/2 h-[2px] origin-left bg-rose"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.15, ease: EASE }}
              />
            </span>
          ))}
        </I>
      </div>
    ),
  },
  {
    title: "The insight",
    glow: "rgba(157,176,255,0.16)",
    render: () => (
      <div className="max-w-[64rem]">
        <Kicker n={3}>The insight</Kicker>
        <I>
          <p className="num mt-6 text-[clamp(7rem,min(26vw,38vh),22rem)] leading-[0.85] tracking-[-0.06em]">402</p>
        </I>
        <I>
          <p className="mt-4 text-[clamp(1.6rem,3.4vw,3rem)] font-light tracking-[-0.03em]">
            Payment Required. <Em>“Reserved for future use”</Em> since 1997.
          </p>
        </I>
        <I>
          <p className="mt-6 text-[clamp(1.1rem,2vw,1.6rem)] text-muted">x402 made it real. We pointed it at GPUs.</p>
        </I>
      </div>
    ),
  },
  {
    title: "How it works",
    glow: "rgba(67,96,255,0.18)",
    render: (_, still) => (
      <div className="w-full max-w-[76rem]">
        <Kicker n={4}>How it works</Kicker>
        <H>
          One request. <Em>Paid in the same breath.</Em>
        </H>
        <I className="relative mt-16 grid grid-cols-3 items-start gap-6">
          <div className="absolute left-[16.6%] right-[16.6%] top-[44px] h-px bg-gradient-to-r from-transparent via-peri/50 to-transparent" aria-hidden />
          {!still && (
            <motion.span
              className="absolute top-[38px] size-3 rounded-full bg-peri shadow-[0_0_20px_var(--peri)]"
              initial={{ left: "16.6%" }}
              animate={{ left: ["16.6%", "50%", "16.6%", "50%", "83.4%", "50%", "16.6%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
          )}
          {[
            ["◎", "Agent", "asks for a GPU", "bg-ink-2"],
            ["402", "GPU402", "answers with a price", "bg-gradient-to-br from-accent to-[#1d2a99]"],
            ["▣", "Lium · SN51", "serves the GPU", "bg-ink-2"],
          ].map(([icon, name, what, bg]) => (
            <div key={name} className="relative grid justify-items-center text-center">
              <span className={cx("num grid size-[88px] place-items-center rounded-3xl border border-hair text-2xl", bg)}>{icon}</span>
              <p className="mt-5 text-[clamp(1.1rem,1.8vw,1.6rem)]">{name}</p>
              <p className="mt-1 text-[clamp(0.85rem,1.2vw,1.05rem)] text-muted">{what}</p>
            </div>
          ))}
        </I>
        <I className="mt-14 grid gap-3 font-mono text-[clamp(0.85rem,1.3vw,1.1rem)] text-muted sm:grid-cols-3">
          <p>
            <span className="text-peri">1</span> · 402 with an exact price
          </p>
          <p>
            <span className="text-peri">2</span> · a signature, no gas
          </p>
          <p>
            <span className="text-peri">3</span> · SSH in seconds
          </p>
        </I>
      </div>
    ),
  },
  {
    title: "It works",
    glow: "rgba(61,220,151,0.14)",
    render: ({ state }) => (
      <div className="w-full max-w-[76rem]">
        <Kicker n={5}>It works, live</Kicker>
        <H>
          Real agents. Real GPUs. <Em color="text-live">Real money.</Em>
        </H>
        <I className="mt-14 grid grid-cols-3 gap-6 border-t border-hair pt-10">
          {[
            [state?.totals.pods, (n: number) => Math.round(n).toString(), "rentals"],
            [state?.totals.usdcReceived, (n: number) => `$${n.toFixed(2)}`, "paid over x402"],
            [state?.totals.gpuMinutesRouted, (n: number) => n.toFixed(0), "GPU-minutes"],
          ].map(([v, f, k]) => (
            <div key={k as string}>
              <p className="text-[clamp(2.8rem,min(7vw,11vh),6.5rem)] font-light leading-none tracking-[-0.05em] tabular-nums">
                {typeof v === "number" ? <CountUp value={v} format={f as (n: number) => string} /> : "—"}
              </p>
              <p className="eyebrow mt-3">{k as string}</p>
            </div>
          ))}
        </I>
        <I>
          <p className="mt-12 text-[clamp(1rem,1.7vw,1.4rem)] text-muted">
            A Gemini agent rented an RTX 3090 on its own and measured <span className="text-text">73.93 TFLOPS</span>.
          </p>
        </I>
      </div>
    ),
  },
  {
    title: "Two rails",
    glow: "rgba(232,131,74,0.14)",
    render: () => (
      <div className="w-full max-w-[76rem]">
        <Kicker n={6}>Two rails</Kicker>
        <H>Pay how the agent already holds money.</H>
        <I className="mt-14 grid gap-6 sm:grid-cols-2">
          {[
            ["USDC", "on Base", "Signed, never sent. No gas.", "text-usdc", "from-usdc/15"],
            ["TAO", "on Bittensor EVM", "Bittensor money in. Bittensor compute out.", "text-tao", "from-tao/15"],
          ].map(([coin, where, line, color, from]) => (
            <div key={coin} className={cx("rounded-3xl border border-hair bg-gradient-to-br to-transparent p-[clamp(1.5rem,3vw,2.5rem)]", from)}>
              <p className={cx("num text-[clamp(3rem,7vw,6rem)] leading-none", color)}>{coin}</p>
              <p className="eyebrow mt-3">{where}</p>
              <p className="mt-8 text-[clamp(1.1rem,1.9vw,1.6rem)] font-light">{line}</p>
            </div>
          ))}
        </I>
      </div>
    ),
  },
  {
    title: "It ships",
    glow: "rgba(67,96,255,0.16)",
    render: ({ versions }) => (
      <div className="w-full max-w-[76rem]">
        <Kicker n={7}>It ships today</Kicker>
        <H>
          One install. <Em>Any agent.</Em>
        </H>
        <I className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-hair bg-hair">
          {[
            ["gpu402", "The SDK", "Rent, run and stop Lium GPUs from TypeScript"],
            ["@gpu402/tools", "Agent tools", "Vercel AI SDK and LangChain, paying over x402"],
            ["gateway", "Self-host", "The x402 server: USDC or TAO in, Lium GPUs out"],
          ].map(([name, role, what]) => (
            <div key={name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 bg-void px-[clamp(1.25rem,2.5vw,2rem)] py-[clamp(1rem,2.4vh,1.6rem)] sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto]">
              <p className="num text-[clamp(1.1rem,1.8vw,1.5rem)]">{name}</p>
              <p className="hidden text-[clamp(0.95rem,1.4vw,1.15rem)] text-muted sm:block">{what}</p>
              <p className="num text-[13px] text-live">{versions[name] ? `v${versions[name]} · npm` : role}</p>
            </div>
          ))}
        </I>
        <I className="mt-10">
          <InstallChip cmd="npm i @gpu402/tools" />
        </I>
      </div>
    ),
  },
  {
    title: "For Bittensor",
    glow: "rgba(61,220,151,0.12)",
    render: (_, still) => (
      <div className="grid w-full max-w-[80rem] items-center gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div>
          <Kicker n={8}>Why it matters</Kicker>
          <H className="text-[clamp(2.4rem,min(5.2vw,9vh),5.5rem)]">
            Every agent becomes a <Em color="text-live">Subnet 51</Em> customer.
          </H>
          <I>
            <p className="mt-8 max-w-xl text-[clamp(1.05rem,1.7vw,1.4rem)] text-muted">New demand for Lium’s miners, from buyers that could never pay before.</p>
          </I>
          <I>
            <p className="mt-10 inline-flex items-center gap-2.5 rounded-full border border-live/30 bg-live/10 px-4 py-2 text-[clamp(0.9rem,1.3vw,1.1rem)] text-live">
              <span className="size-1.5 rounded-full bg-live" aria-hidden /> Approved by Lium for its official docs
            </p>
          </I>
        </div>
        <motion.div variants={itemV} className="relative h-[min(52vh,520px)] max-md:hidden" aria-hidden>
          <GpuCard live={false} still={still} />
        </motion.div>
      </div>
    ),
  },
  {
    title: "What’s next",
    glow: "rgba(157,176,255,0.14)",
    render: () => (
      <div className="w-full max-w-[76rem]">
        <Kicker n={9}>What’s next</Kicker>
        <H>From testnet to every compute subnet.</H>
        <I className="mt-14 grid gap-8 sm:grid-cols-3">
          {[
            ["Mainnet", "Base and Bittensor EVM. A config change, not a rewrite."],
            ["More subnets", "One gateway in front of any Bittensor compute."],
            ["Agent stores", "MCP and tool registries, so agents find it on their own."],
          ].map(([t, d], i) => (
            <div key={t} className="border-t border-hair pt-6">
              <p className="num text-[13px] text-peri">0{i + 1}</p>
              <p className="mt-3 text-[clamp(1.4rem,2.4vw,2rem)] font-light tracking-[-0.03em]">{t}</p>
              <p className="mt-3 text-[clamp(0.95rem,1.4vw,1.15rem)] text-muted">{d}</p>
            </div>
          ))}
        </I>
      </div>
    ),
  },
  {
    title: "GPU402",
    glow: "rgba(67,96,255,0.24)",
    render: ({ nodes }, still) => (
      <>
        <motion.div variants={itemV} className="pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(60%_60%_at_50%_55%,black,transparent)]" aria-hidden>
          <Engine nodes={nodes} pods={[]} pulses={[]} still={still} />
        </motion.div>
        <div className="relative mx-auto max-w-[64rem] text-center">
          <H>
            Give an agent a wallet.
            <br />
            <Em>It rents its own GPU.</Em>
          </H>
          <I className="mt-12 flex flex-wrap justify-center gap-3">
            <a href="/#try" className="btn-accent inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri">
              Try it live <ArrowRight className="size-4" aria-hidden />
            </a>
            <InstallChip cmd="npm i @gpu402/tools" />
          </I>
          <I>
            <a href={REPO} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-1 font-mono text-[13px] text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-peri">
              github.com/GPU402/gpu402 <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </I>
        </div>
      </>
    ),
  },
];

// ------------------------------------------------------------------ deck

const fromHash = () => {
  const n = Number(typeof window === "undefined" ? 1 : window.location.hash.slice(1));
  return Number.isInteger(n) && n >= 1 && n <= SLIDES.length ? n - 1 : 0;
};

export default function Pitch() {
  const live = useLive();
  const still = useCalmMotion();
  const [[i, dir], setPos] = useState<[number, number]>([0, 1]);
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);

  useEffect(() => setPos([fromHash(), 1]), []);
  useEffect(() => {
    const onHash = () => setPos(([cur]) => [fromHash(), fromHash() >= cur ? 1 : -1]);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((n: number) => {
    const to = Math.max(0, Math.min(SLIDES.length - 1, n));
    setPos(([cur]) => (to === cur ? [cur, 1] : [to, to > cur ? 1 : -1]));
    history.replaceState(null, "", `#${to + 1}`);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Enter and Space belong to the focused button or link, not the deck.
      if ((e.key === "Enter" || e.key === " ") && (e.target as HTMLElement).closest("a,button")) return;
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) (e.preventDefault(), go(i + 1));
      else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) (e.preventDefault(), go(i - 1));
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(SLIDES.length - 1);
      else if (e.key.toLowerCase() === "f") void (document.fullscreenElement ? document.exitFullscreen() : root.current?.requestFullscreen());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go]);

  const s = SLIDES[i]!;
  return (
    <div
      ref={root}
      className="relative h-dvh overflow-hidden bg-void select-none"
      onPointerDown={(e) => (touch.current = e.pointerType === "touch" ? e.clientX : null)}
      onPointerUp={(e) => {
        if (touch.current === null) return;
        const dx = e.clientX - touch.current;
        if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      {/* Ambient light, tinted per slide */}
      <motion.div className="pointer-events-none absolute inset-0" animate={{ background: `radial-gradient(60% 55% at 70% 40%, ${s.glow}, transparent 70%)` }} transition={{ duration: 1.2 }} aria-hidden />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-[clamp(1rem,4vw,3.5rem)] py-5">
        <a href="/" className="flex min-h-10 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-peri">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="var(--text)" strokeWidth="2" />
            <circle cx="12" cy="12" r="3.5" fill="var(--accent)" />
          </svg>
          <span className="text-[15px] font-medium">GPU402</span>
        </a>
        <div className="flex items-center gap-2">
          <span className="num text-[13px] text-muted" aria-hidden>
            {String(i + 1).padStart(2, "0")} / {SLIDES.length}
          </span>
          <button
            type="button"
            onClick={() => void (document.fullscreenElement ? document.exitFullscreen() : root.current?.requestFullscreen())}
            className="grid size-10 place-items-center rounded-full text-muted hover:bg-ink-2 hover:text-text focus-visible:outline-2 focus-visible:outline-peri"
            aria-label="Full screen (F)"
          >
            <Maximize2 className="size-4" aria-hidden />
          </button>
        </div>
      </header>

      <main className="relative z-10 h-full" aria-roledescription="carousel" aria-label="GPU402 pitch">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.section
            key={i}
            custom={dir}
            variants={slideV}
            initial="enter"
            animate="show"
            exit="exit"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SLIDES.length}: ${s.title}`}
            className={cx("absolute inset-0 flex items-center px-[clamp(1.25rem,6vw,6rem)] pb-24 pt-24", i === SLIDES.length - 1 && "justify-center")}
          >
            {s.render(live, still)}
          </motion.section>
        </AnimatePresence>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-4 px-[clamp(1rem,4vw,3.5rem)] pb-6">
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="grid size-11 shrink-0 place-items-center rounded-full border border-hair text-muted hover:text-text disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-peri" aria-label="Previous slide">
          <ArrowLeft className="size-4" aria-hidden />
        </button>
        <nav className="flex flex-1 gap-1.5" aria-label="Slides">
          {SLIDES.map((x, k) => (
            <button key={k} type="button" onClick={() => go(k)} className="group grid min-h-10 flex-1 items-center focus-visible:outline-2 focus-visible:outline-peri" aria-label={`Slide ${k + 1}: ${x.title}`} aria-current={k === i ? "step" : undefined}>
              <span className="relative h-[3px] overflow-hidden rounded-full bg-ink-3 transition-colors duration-150 group-hover:bg-faint">
                <motion.span className="absolute inset-0 origin-left bg-accent" initial={false} animate={{ scaleX: k <= i ? 1 : 0 }} transition={{ duration: 0.5, ease: EASE }} />
              </span>
            </button>
          ))}
        </nav>
        <button type="button" onClick={() => go(i + 1)} disabled={i === SLIDES.length - 1} className="btn-accent grid size-11 shrink-0 place-items-center rounded-full disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri" aria-label="Next slide">
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </footer>
      <p className="pointer-events-none absolute bottom-[4.6rem] right-[clamp(1rem,4vw,3.5rem)] z-20 hidden font-mono text-[11px] tracking-[0.16em] text-faint md:block">← → TO NAVIGATE · F FOR FULL SCREEN</p>
    </div>
  );
}
