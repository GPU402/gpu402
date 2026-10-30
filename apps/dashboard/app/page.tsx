"use client";

import { ArrowRight, ArrowUpRight, RefreshCw } from "lucide-react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "motion/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COLOR } from "./engine/colors";
import type { EnginePod, EnginePulse } from "./engine/Engine";
import { GATEWAY, getJson, gpuName, networkName, type EngineNodeView, type GatewayEvent, type GatewayState, type LiumNetwork, type MarketModel, type PodView, type Sn51Stats } from "./lib";
import { Playground } from "./try/playground";
import { ApiExplorer } from "./ui/api";
import { eventMeta, gpuShort, place, railOf, toneColor } from "./ui/events";
import { InstallChip, Marquee, Reveal, Scramble, SectionHead } from "./ui/kit";
import { NowCard } from "./ui/now";
import { Packages } from "./ui/packages";
import { ActivityPanel, MarketPanel, PaymentsPanel, RentalDialog, RentalsPanel, SubnetPanel, TABS, TabBar, type Tab } from "./ui/panels";
import { CountUp, Skeleton, ago, cx, useCalmMotion, useNow } from "./ui/primitives";
import { HowItWorks } from "./ui/terminal";

const REPO = "https://github.com/GPU402/gpu402";

// three.js needs the browser: load the globe on the client only.
const Engine = dynamic(() => import("./engine/Engine"), { ssr: false });
const GpuCard = dynamic(() => import("./engine/GpuCard"), { ssr: false });

function usePoll<T>(path: string, everyMs: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setData(await getJson<T>(path));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [path]);
  useEffect(() => {
    void load();
    const t = setInterval(load, everyMs);
    return () => clearInterval(t);
  }, [load, everyMs]);
  return { data, error, reload: load };
}

const PULSE_MS = 4000;
const NAV = [
  ["How it works", "#how"],
  ["Try it", "#try"],
  ["Packages", "#packages"],
  ["API", "#api"],
  ["Network", "#network"],
  ["Live", "#live"],
] as const;

export default function Dashboard() {
  const state = usePoll<GatewayState>("/api/state", 4000);
  const market = usePoll<{ models: MarketModel[] }>("/gpus", 30_000);
  const chain = usePoll<Sn51Stats>("/api/sn51", 30_000);
  const lium = usePoll<LiumNetwork>("/api/lium", 60_000);
  const nodes = usePoll<{ nodes: EngineNodeView[] }>("/api/nodes", 60_000);
  const now = useNow();
  const reduce = useCalmMotion() ?? false;

  const [live, setLive] = useState<GatewayEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [pulses, setPulses] = useState<EnginePulse[]>([]);
  const [tab, setTab] = useState<Tab>("Activity");
  const [open, setOpen] = useState<string | null>(null);

  const s = state.data;
  const pods = s?.pods ?? [];
  // Beams wait here until the pod's coordinates arrive with the next state.
  const pending = useRef(new Set<string>());
  const podsRef = useRef(pods);
  podsRef.current = pods;
  const reloadState = useRef(state.reload);
  reloadState.current = state.reload;

  const beam = useCallback((pod: PodView) => {
    if (pod.lat == null || pod.lon == null) return false;
    const at = performance.now();
    setPulses((p) => [...p, { key: `beam-${pod.podId}-${at}`, kind: "beam", color: COLOR.live, lat: pod.lat!, lon: pod.lon!, at }]);
    return true;
  }, []);

  useEffect(() => {
    const es = new EventSource(`${GATEWAY}/api/events`);
    es.addEventListener("hello", () => setConnected(true));
    es.addEventListener("gateway", (m) => {
      const e = JSON.parse((m as MessageEvent).data) as GatewayEvent;
      setLive((prev) => [e, ...prev].slice(0, 60));
      if (e.type === "payment.settled") {
        const color = railOf(e) === "tao" ? COLOR.tao : COLOR.usdc;
        setPulses((p) => [...p, { key: `pay-${e.id}-${e.ts}`, kind: "payment", color, at: performance.now() }]);
      }
      if ((e.type === "pod.rented" || e.type === "pod.ready") && e.pod_id) {
        const pod = podsRef.current.find((p) => p.podId === e.pod_id);
        if (!pod || !beam(pod)) pending.current.add(e.pod_id);
      }
      void reloadState.current();
    });
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [beam]);

  // Fire the beams that were waiting for coordinates.
  useEffect(() => {
    for (const id of pending.current) {
      const pod = pods.find((p) => p.podId === id);
      if (pod && beam(pod)) pending.current.delete(id);
    }
  }, [pods, beam]);

  // Drop finished pulses.
  useEffect(() => {
    if (pulses.length === 0) return;
    const t = setTimeout(() => setPulses((p) => p.filter((x) => performance.now() - x.at < PULSE_MS)), PULSE_MS);
    return () => clearTimeout(t);
  }, [pulses]);

  const events = useMemo(() => {
    const seen = new Set<number>();
    return [...live, ...(s?.events ?? [])].filter((e) => !seen.has(e.id) && Boolean(seen.add(e.id)));
  }, [live, s?.events]);

  const enginePods = useMemo<EnginePod[]>(
    () =>
      pods.flatMap((p) =>
        (p.status === "running" || p.status === "starting") && p.lat != null && p.lon != null ? [{ id: p.podId, lat: p.lat, lon: p.lon, status: p.status, gpu: p.gpu }] : [],
      ),
    [pods],
  );

  // The globe drifts and fades as the hero scrolls away.
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const globeY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);
  const globeOpacity = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.15]);

  const current = pods.find((p) => p.status === "running" || p.status === "starting") ?? pods[0] ?? null;
  const openPod = pods.find((p) => p.podId === open) ?? null;
  const offline = Boolean(state.error) && !s;
  const online = connected && !state.error;
  const nodeCount = nodes.data?.nodes.length ?? 0;
  const models = market.data?.models ?? null;

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <a href="#try" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-text focus:px-4 focus:py-2 focus:text-void">
        Skip to the playground
      </a>

      <nav className="fixed inset-x-0 top-3 z-40 px-3 sm:px-4" aria-label="Main">
        <div className="mx-auto flex max-w-[1280px] items-center gap-2 rounded-2xl border border-hair bg-void/70 px-3 py-2 backdrop-blur-xl sm:gap-4">
          <a href="#top" className="flex min-h-10 items-center gap-2 rounded-lg px-1 focus-visible:outline-2 focus-visible:outline-peri">
            <Mark />
            <span className="text-[15px] font-medium tracking-tight">GPU402</span>
          </a>
          <div className="hidden items-center text-sm text-muted lg:flex">
            {NAV.map(([l, h]) => (
              <a key={h} href={h} className="rounded-lg px-3 py-2 transition-colors duration-100 hover:text-text focus-visible:outline-2 focus-visible:outline-peri">
                {l}
              </a>
            ))}
          </div>
          <span
            role="status"
            className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-full border border-hair px-3 text-[13px] text-muted"
            title={s ? `USDC on ${networkName(s.gateway.network)}${s.gateway.tao ? `, TAO on ${s.gateway.tao.label}` : ""}` : undefined}
          >
            <span className={cx("size-1.5 rounded-full", online ? "live-dot bg-live" : "bg-rose")} aria-hidden />
            {online ? "Testnet" : "Offline"}
          </span>
          <a
            href="#try"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-text px-4 text-[13px] font-medium text-void hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri"
          >
            Try it <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </div>
      </nav>

      {/* ------------------------------------------------------------- hero */}
      <header ref={hero} id="top" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_75%_45%,rgba(67,96,255,0.16),transparent_70%)]" aria-hidden />
        {/* Position on the outer box; the inner one takes the scroll transform, which would override Tailwind's translate. */}
        <div
          className="absolute left-1/2 top-[50svh] aspect-square w-[min(1100px,160vw)] -translate-x-1/2 lg:left-[calc(78vw_-_min(660px,42vw))] lg:top-1/2 lg:aspect-[4/3] lg:w-[min(1320px,84vw)] lg:-translate-y-1/2 lg:translate-x-0"
          role="img"
          aria-label={`Globe of ${nodeCount} Lium GPU nodes. Payments circle the ring; each rental fires a beam to its miner.`}
        >
          <motion.div style={{ y: globeY, opacity: globeOpacity }} className="size-full">
            <Engine nodes={nodes.data?.nodes ?? []} pods={enginePods} pulses={pulses} still={reduce} />
          </motion.div>
        </div>

        {/* The copy sits above the globe but lets the pointer through, so the globe stays draggable; only its controls take clicks. */}
        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center px-4 pb-6 pt-28 sm:px-6 sm:pt-32 lg:pt-24">
          <div className="max-w-[min(760px,58vw)] max-lg:max-w-[640px]">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="num inline-flex items-center gap-3 rounded-full border border-hair bg-void/50 py-1.5 pl-1.5 pr-4 text-[13px] backdrop-blur"
            >
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-peri">HTTP</span>
              <Scramble words={["402 Payment Required", "200 OK · GPU ready"]} className="text-text" />
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-[min(2rem,3.5vh)] text-[clamp(2.6rem,min(7vw,10vh),6.2rem)] font-light leading-[0.94] tracking-[-0.06em]"
            >
              GPUs that agents
              <br />
              <span className="font-serif text-[1.06em] italic tracking-[-0.02em] text-peri">pay for</span> themselves.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="mt-[min(1.75rem,3.2vh)] max-w-[30rem] text-[17px] leading-relaxed text-muted lg:text-[18px]">
                One HTTP request rents a Bittensor Subnet 51 GPU from Lium. The agent pays with x402, in USDC or TAO. No account, no API key, no human.
              </p>
              <div className="pointer-events-auto mt-[min(2.25rem,4vh)] flex flex-wrap items-center gap-3">
                <a href="#try" className="btn-accent inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-[15px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri">
                  Rent one from here <ArrowRight className="size-4" aria-hidden />
                </a>
                <InstallChip cmd="npm i @gpu402/tools" />
              </div>

              <dl className="mt-[min(3.5rem,7vh)] hidden max-w-xl grid-cols-2 gap-8 border-t border-hair pt-[min(1.5rem,3vh)] sm:grid">
                <div>
                  <dt className="eyebrow text-[10px]">Pays in</dt>
                  <dd className="mt-2.5 flex flex-wrap gap-2 text-[13px]">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-usdc/25 px-3 py-1 text-usdc">
                      <span className="size-1.5 rounded-full bg-usdc" aria-hidden /> USDC · Base
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-tao/25 px-3 py-1 text-tao">
                      <span className="size-1.5 rounded-full bg-tao" aria-hidden /> TAO · Bittensor
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-[10px]">{current?.status === "running" || current?.status === "starting" ? "Renting now" : "Last rental"}</dt>
                  <dd className="mt-2.5">
                    {current ? (
                      <button
                        type="button"
                        onClick={() => setOpen(current.podId)}
                        className="pointer-events-auto inline-flex min-h-8 items-center gap-2 rounded-lg text-left text-[14px] text-muted transition-colors duration-100 hover:text-text focus-visible:outline-2 focus-visible:outline-peri"
                      >
                        <span className={cx("size-1.5 shrink-0 rounded-full", current.status === "running" ? "live-dot bg-live" : "bg-faint")} aria-hidden />
                        <span>
                          <span className="text-text">{gpuShort(current.gpu)}</span> in {place(current)} · {ago(Date.parse(current.createdAt), now)}
                        </span>
                      </button>
                    ) : (
                      <span className="text-[14px] text-faint">{s ? "Waiting for the first agent" : "…"}</span>
                    )}
                  </dd>
                </div>
              </dl>
            </motion.div>
          </div>
        </div>

        {/* Real events, as they happen, floating over the globe. */}
        <EventToasts events={events} now={now} reduce={reduce} />

        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[1280px] flex-wrap items-end justify-between gap-4 px-4 pb-6 sm:px-6">
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <span className="size-1.5 rounded-full bg-white" aria-hidden />
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            <span>
              <span className="num text-text">{nodeCount || "—"}</span> Lium nodes, live. Drag the globe.
            </span>
          </p>
          <dl className="grid grid-cols-3 divide-x divide-hair overflow-hidden rounded-xl border border-hair bg-void/70 backdrop-blur-xl">
            <Stat label="Live" value={s?.totals.activePods} format={(n) => Math.round(n).toString()} tone={s?.totals.activePods ? "text-live" : undefined} />
            <Stat label="Paid" value={s?.totals.usdcReceived} format={(n) => `$${n.toFixed(2)}`} />
            <Stat label="GPU min" value={s?.totals.gpuMinutesRouted} format={(n) => n.toFixed(0)} />
          </dl>
        </div>
      </header>

      {/* Live market ticker */}
      <div className="border-y border-hair bg-ink-1 py-4" aria-label="Live GPU prices">
        {models ? (
          <Marquee seconds={Math.max(30, models.length * 4)}>
            {models.slice(0, 16).map((m) => (
              <span key={m.gpu} className="flex shrink-0 items-baseline gap-3 text-[14px]">
                <span className="text-text">{gpuName(m.gpu)}</span>
                <span className="num text-peri">${m.blockPriceUsd.toFixed(4)}</span>
                <span className="eyebrow text-[10px]">/15 min · {m.gpusAvailable} free</span>
                <span className="text-faint" aria-hidden>
                  ✦
                </span>
              </span>
            ))}
            {chain.data && (
              <span className="flex shrink-0 items-baseline gap-3 text-[14px]">
                <span className="text-text">Subnet 51</span>
                <span className="num text-peri">block {chain.data.block.toLocaleString()}</span>
                <span className="eyebrow text-[10px]">{chain.data.minersWithIncentive} miners earning</span>
                <span className="text-faint" aria-hidden>
                  ✦
                </span>
              </span>
            )}
          </Marquee>
        ) : (
          <Skeleton className="mx-4 h-6" />
        )}
      </div>

      <main className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {offline && (
          <div role="alert" className="glass mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
            <p className="text-sm">
              Can’t reach the gateway at <span className="num text-muted">{GATEWAY}</span>. Start it with <code className="num rounded bg-ink-2 px-1.5 py-0.5">pnpm gateway</code>.
            </p>
            <button
              type="button"
              onClick={() => void state.reload()}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-text px-4 text-sm font-medium text-void hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri"
            >
              <RefreshCw className="size-4" aria-hidden /> Retry
            </button>
          </div>
        )}

        <HowItWorks events={events} />

        <Machine live={enginePods.some((p) => p.status === "running")} reduce={reduce} nodes={nodeCount} models={models?.length ?? 0} />

        <section id="try" className="scroll-mt-24 py-24 lg:py-40" aria-labelledby="try-title">
          <SectionHead
            n="02"
            kicker="Playground"
            title={
              <span id="try-title">
                Don’t take our word. <span className="font-serif italic text-peri">Send it.</span>
              </span>
            }
            lede="Every button here hits the live gateway. Price a GPU, read its 402, then rent one with your own wallet."
          />
          <Reveal depth className="mt-16">
            <Playground models={models} />
          </Reveal>
        </section>

        {s && (
          <section className="py-24 lg:py-40" aria-label="Proof">
            <SectionHead n="03" kicker="Proof" title="Real money moved. On-chain." lede="Every payment settled on-chain. Every rental ran on a real miner." />
            <Reveal depth className="mt-16">
              <Ledger s={s} />
            </Reveal>
          </section>
        )}

        <section id="packages" className="scroll-mt-24 py-24 lg:py-40" aria-labelledby="pk-title">
          <SectionHead
            n="04"
            kicker="Packages"
            title={
              <span id="pk-title">
                Two packages. <span className="font-serif italic text-peri">One line</span> to a GPU.
              </span>
            }
            lede="Live from the npm registry. Use the SDK with your Lium key, or give the tools to an agent and let it pay."
          />
          <div className="mt-16">
            <Packages />
          </div>
        </section>

        <section id="api" className="scroll-mt-24 py-24 lg:py-40" aria-labelledby="api-title">
          <SectionHead
            n="05"
            kicker="API"
            title={<span id="api-title">Plain HTTP, all the way down.</span>}
            lede="Pick an endpoint and send it. The free ones answer right here."
          />
          <Reveal depth className="mt-16">
            <ApiExplorer />
          </Reveal>
        </section>

        <section id="network" className="scroll-mt-24 py-24 lg:py-40" aria-labelledby="net-title">
          <SectionHead
            n="06"
            kicker="Network"
            title={
              <span id="net-title">
                Compute from <span className="font-serif italic text-peri">Subnet 51.</span>
              </span>
            }
            lede="Bittensor pays Lium’s miners to serve GPUs. GPU402 puts a price and a wallet in front."
          />
          <div className="mt-16 grid gap-6">
            <Reveal className="rounded-3xl border border-hair bg-ink-1 p-6 sm:p-8">
              <p className="eyebrow mb-6">Subnet 51 · Bittensor Finney</p>
              <SubnetPanel c={chain.data} lium={lium.data} />
            </Reveal>
            <Reveal delay={0.08} className="rounded-3xl border border-hair bg-ink-1 p-6 sm:p-8">
              <p className="eyebrow mb-6">Market · GPU402 price per 15 minutes</p>
              <MarketPanel models={models ?? (market.error ? [] : null)} />
            </Reveal>
          </div>
        </section>

        <section id="live" className="scroll-mt-24 py-24 lg:py-40" aria-labelledby="live-title">
          <SectionHead n="07" kicker={`Live / ${tab}`} title={<span id="live-title">What the gateway is doing now.</span>} />
          <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
            <div className="grid content-start gap-6">{s ? <NowCard pod={current} now={now} onOpen={(p) => setOpen(p.podId)} /> : <Skeleton className="h-56 rounded-2xl" />}</div>
            <div>
              <TabBar tab={tab} onChange={setTab} />
              <div
                role="tabpanel"
                id={`panel-${TABS.indexOf(tab)}`}
                aria-labelledby={`tab-${TABS.indexOf(tab)}`}
                tabIndex={0}
                className="mt-6 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peri"
              >
                {!s ? (
                  <div className="grid gap-2" aria-busy="true">
                    {Array.from({ length: 4 }, (_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : tab === "Activity" ? (
                  <ActivityPanel events={events} now={now} />
                ) : tab === "Rentals" ? (
                  <RentalsPanel pods={pods} now={now} onOpen={(p) => setOpen(p.podId)} />
                ) : (
                  <PaymentsPanel s={s} now={now} />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer online={online} />
      <RentalDialog pod={openPod} now={now} onClose={() => setOpen(null)} />
    </div>
  );
}

/** A full-width pause: one real GPU, in 3D, turning as the page scrolls. */
function Machine({ live, reduce, nodes, models }: { live: boolean; reduce: boolean; nodes: number; models: number }) {
  const ref = useRef<HTMLElement>(null);
  const near = useInView(ref, { margin: "200px", once: true });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const words = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [120, -120]);
  return (
    <section ref={ref} className="relative -mx-4 overflow-hidden py-24 sm:-mx-6 lg:py-36" aria-labelledby="machine-title">
      <motion.p style={{ x: words }} className="wordmark pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center text-[clamp(5rem,17vw,16rem)] font-light leading-none tracking-[-0.06em]" aria-hidden>
        one request
      </motion.p>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_45%_at_50%_50%,rgba(67,96,255,0.18),transparent_70%)]" aria-hidden />
      <div className="relative mx-auto h-[min(62vh,560px)] max-w-5xl">{near && <GpuCard live={live} still={reduce} scroll={scrollYProgress} />}</div>
      <div className="relative mx-auto mt-6 max-w-3xl px-4 text-center">
        <h2 id="machine-title" className="text-[clamp(1.75rem,3.4vw,2.75rem)] font-light leading-[1.08] tracking-[-0.04em] text-balance">
          Every GPU here is a <span className="font-serif italic text-peri">real machine</span>, on a Subnet 51 miner.
        </h2>
        <dl className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-6">
          {[
            [nodes ? String(nodes) : "—", "nodes"],
            [models ? String(models) : "—", "GPU models"],
            ["15", "min blocks"],
          ].map(([v, k]) => (
            <div key={k} className="flex flex-col-reverse">
              <dt className="eyebrow mt-1 text-[10px]">{k}</dt>
              <dd className="text-[clamp(2rem,4vw,3rem)] font-light tracking-[-0.04em] tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-[13px] text-faint">{live ? "A pod is live right now: watch the fans." : "Drag your pointer across it. The fans spin up while a pod is live."}</p>
      </div>
    </section>
  );
}

/** The three most recent real events, stacked beside the globe. */
function EventToasts({ events, now, reduce }: { events: GatewayEvent[]; now: number; reduce: boolean }) {
  const top = events.filter((e) => e.type !== "quote.issued").slice(0, 3);
  if (top.length === 0) return null;
  return (
    <ol className="pointer-events-none absolute bottom-28 right-6 z-10 hidden w-[300px] grid-cols-[minmax(0,1fr)] gap-2 xl:grid [@media(max-height:820px)]:!hidden" aria-label="Latest gateway events">
      <AnimatePresence initial={false}>
        {top.map((e, i) => {
          const m = eventMeta(e);
          const Icon = m.icon;
          return (
            <motion.li
              key={e.id}
              layout={!reduce}
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1 - i * 0.22, x: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, x: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-3 rounded-2xl border border-hair bg-void/75 p-3 backdrop-blur-xl"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-ink-2" style={{ color: toneColor[m.tone] }}>
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="flex items-baseline justify-between gap-2 text-[13px] text-text">
                  {m.label}
                  <span className="num text-[11px] text-faint">{ago(e.ts, now)}</span>
                </p>
                <p className="truncate text-[12px] text-muted">{e.message}</p>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ol>
  );
}

function Stat({ label, value, format, tone }: { label: string; value: number | undefined; format: (n: number) => string; tone?: string }) {
  return (
    <div className="px-4 py-3 sm:px-5">
      <dt className="eyebrow whitespace-nowrap text-[10px]">{label}</dt>
      <dd className={cx("num mt-1.5 text-[15px] text-text sm:text-base", tone)}>{value == null ? "—" : <CountUp value={value} format={format} />}</dd>
    </div>
  );
}

/** The headline number on paper: what agents paid, split by the rail they paid on. */
function Ledger({ s }: { s: GatewayState }) {
  const settled = s.payments.filter((p) => p.status === "settled");
  const tao = settled.filter((p) => p.asset === "TAO").reduce((a, p) => a + p.amount_usd, 0);
  const usdc = settled.filter((p) => p.asset !== "TAO").reduce((a, p) => a + p.amount_usd, 0);
  const total = tao + usdc || 1;
  const rails = [
    { label: "USDC on Base", usd: usdc, n: settled.filter((p) => p.asset !== "TAO").length, color: "bg-cobalt" },
    { label: "TAO on Bittensor", usd: tao, n: settled.filter((p) => p.asset === "TAO").length, color: "bg-rust" },
  ];
  const recent = settled.slice(0, 3);
  return (
    <div className="grid gap-3">
      <div className="grid gap-8 rounded-3xl bg-paper p-6 text-paper-ink sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div>
          <p className="text-[clamp(3.4rem,10vw,7.5rem)] font-light leading-[0.9] tracking-[-0.065em] text-rust tabular-nums">
            <CountUp value={s.totals.usdcReceived} format={(n) => `$${n.toFixed(2)}`} />
          </p>
          <p className="mt-4 text-[17px]">paid by agents over x402, in {s.totals.payments} payments</p>
          <div className="mt-8 flex h-12 overflow-hidden rounded-xl" role="img" aria-label={rails.map((r) => `${r.label} ${Math.round((r.usd / total) * 100)}%`).join(", ")}>
            {rails
              .filter((r) => r.usd > 0)
              .map((r) => (
                <div key={r.label} className={cx("num flex items-center px-4 text-[13px] text-white", r.color)} style={{ width: `${(r.usd / total) * 100}%` }}>
                  {Math.round((r.usd / total) * 100)}%
                </div>
              ))}
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {rails.map((r) => (
              <li key={r.label} className="flex items-center justify-between gap-3 text-[15px]">
                <span className="flex items-center gap-2.5">
                  <span className={cx("size-2.5 rounded-sm", r.color)} aria-hidden />
                  {r.label}
                </span>
                <span className="num text-[13px] text-paper-muted">
                  ${r.usd.toFixed(4)} · {r.n}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col">
          <p className="eyebrow !text-paper-muted">Latest settlements</p>
          <ul className="mt-4 grid divide-y divide-paper-hair border-y border-paper-hair">
            {recent.map((p) => {
              const tao = p.asset === "TAO";
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                  <span className="flex items-center gap-2.5">
                    <span className={cx("size-2 rounded-full", tao ? "bg-rust" : "bg-cobalt")} aria-hidden />
                    <span className="num">${p.amount_usd.toFixed(4)}</span>
                    <span className="text-paper-muted">{tao ? "TAO" : "USDC"}</span>
                  </span>
                  {p.explorerUrl ? (
                    <a href={p.explorerUrl} target="_blank" rel="noreferrer" className="num inline-flex items-center gap-1 text-[12px] text-cobalt hover:underline focus-visible:outline-2 focus-visible:outline-cobalt">
                      {p.tx_hash.slice(0, 10)}… <ArrowUpRight className="size-3" aria-hidden />
                    </a>
                  ) : (
                    <span className="num text-[12px] text-paper-muted" title={p.tx_hash}>
                      {p.tx_hash.slice(0, 10)}…
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <dl className="grid divide-y divide-paper-hair overflow-hidden rounded-3xl bg-paper text-paper-ink sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          [String(s.totals.pods), "Rentals", "paid for by agents, end to end"],
          [s.totals.gpuMinutesRouted.toFixed(0), "GPU-minutes", "served by Subnet 51 miners"],
          [`$${s.totals.liumSpendUsd.toFixed(2)}`, "To Lium", "billed by the second"],
        ].map(([v, k, d], i) => (
          <div key={k} className="p-6 sm:p-8">
            <dt className="sr-only">{k}</dt>
            <dd>
              <span className={cx("text-[2.4rem] font-light tracking-[-0.045em]", i === 2 && "text-cobalt")}>{v}</span>
              <span className="eyebrow ml-2 !text-paper-muted">{k}</span>
              <p className="mt-1 text-[15px] text-paper-muted">{d}</p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Footer({ online }: { online: boolean }) {
  const cols = [
    ["Build", [["SDK on npm", "https://www.npmjs.com/package/gpu402"], ["Agent tools on npm", "https://www.npmjs.com/package/@gpu402/tools"], ["Source on GitHub", REPO]]],
    ["Learn", [["How it works", "#how"], ["Playground", "#try"], ["API", "#api"]]],
    ["Network", [["Lium", "https://lium.io"], ["Bittensor", "https://bittensor.com"], ["x402", "https://x402.org"]]],
  ] as const;
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-hair">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 pb-6 pt-16 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.6fr))]">
        <div>
          <a href="#top" className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-peri">
            <Mark />
            <span className="text-[15px] font-medium">GPU402</span>
          </a>
          <p className="mt-4 max-w-xs text-[15px] text-muted">The payment rail between AI agents and decentralized GPUs. Open source, MIT.</p>
          <p className="mt-5 inline-flex items-center gap-2 text-[13px] text-muted">
            <span className={cx("size-1.5 rounded-full", online ? "bg-live" : "bg-rose")} aria-hidden />
            {online ? "Gateway online" : "Gateway offline"}
          </p>
        </div>
        {cols.map(([title, links]) => (
          <nav key={title} aria-label={title}>
            <p className="eyebrow text-[10px]">{title}</p>
            <ul className="mt-4 grid gap-2.5 text-[14px] text-muted">
              {links.map(([l, h]) => (
                <li key={l}>
                  <a
                    href={h}
                    {...(h.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="inline-flex items-center gap-1 transition-colors duration-100 hover:text-text focus-visible:outline-2 focus-visible:outline-peri"
                  >
                    {l}
                    {h.startsWith("http") && <ArrowUpRight className="size-3" aria-hidden />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="wordmark pointer-events-none select-none text-center text-[clamp(5rem,23vw,22rem)] font-light leading-[0.8] tracking-[-0.07em]" aria-hidden>
        GPU402
      </p>
    </footer>
  );
}

/** The mark: a ring (the x402 loop) around a lit core (the GPU). */
function Mark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="var(--text)" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" fill="var(--accent)" />
    </svg>
  );
}
