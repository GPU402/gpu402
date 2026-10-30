"use client";

import { ArrowRight, ArrowUpRight, RefreshCw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COLOR } from "./engine/colors";
import type { EnginePod, EnginePulse } from "./engine/Engine";
import { GATEWAY, getJson, networkName, type EngineNodeView, type GatewayEvent, type GatewayState, type LiumNetwork, type MarketModel, type PodView, type Sn51Stats } from "./lib";
import { railOf } from "./ui/events";
import { NowCard } from "./ui/now";
import { ActivityPanel, MarketPanel, PaymentsPanel, RentalDialog, RentalsPanel, SubnetPanel, TABS, TabBar, type Tab } from "./ui/panels";
import { CountUp, Skeleton, cx, useNow } from "./ui/primitives";
import { HowItWorks } from "./ui/terminal";

const REPO = "https://github.com/GPU402/gpu402";

// three.js needs the browser: load the globe on the client only.
const Engine = dynamic(() => import("./engine/Engine"), { ssr: false });

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

export default function Dashboard() {
  const state = usePoll<GatewayState>("/api/state", 4000);
  const market = usePoll<{ models: MarketModel[] }>("/gpus", 30_000);
  const chain = usePoll<Sn51Stats>("/api/sn51", 30_000);
  const lium = usePoll<LiumNetwork>("/api/lium", 60_000);
  const nodes = usePoll<{ nodes: EngineNodeView[] }>("/api/nodes", 60_000);
  const now = useNow();
  const still = useReducedMotion() ?? false;

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

  const current = pods.find((p) => p.status === "running" || p.status === "starting") ?? pods[0] ?? null;
  const openPod = pods.find((p) => p.podId === open) ?? null;
  const offline = Boolean(state.error) && !s;
  const online = connected && !state.error;
  const nodeCount = nodes.data?.nodes.length ?? 0;
  const pickTab = (t: Tab) => (setTab(t), document.getElementById("live")?.scrollIntoView({ block: "start" }));

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <nav className="fixed inset-x-0 top-3 z-40 px-3 sm:px-4" aria-label="Main">
        <div className="mx-auto flex max-w-[1240px] items-center gap-2 rounded-2xl border border-hair bg-void/70 px-3 py-2 backdrop-blur-xl sm:gap-6">
          <a href="#top" className="flex min-h-10 items-center gap-2 rounded-lg px-1 focus-visible:outline-2 focus-visible:outline-peri">
            <Mark />
            <span className="text-[15px] font-medium tracking-tight">GPU402</span>
          </a>
          <div className="hidden items-center gap-1 text-sm text-muted md:flex">
            {[
              ["How it works", "#how"],
              ["Live", "#live"],
            ].map(([l, h]) => (
              <a key={h} href={h} className="rounded-lg px-3 py-2 hover:text-text focus-visible:outline-2 focus-visible:outline-peri">
                {l}
              </a>
            ))}
            <button type="button" onClick={() => pickTab("Market")} className="rounded-lg px-3 py-2 hover:text-text focus-visible:outline-2 focus-visible:outline-peri">
              Market
            </button>
            <button type="button" onClick={() => pickTab("Subnet 51")} className="rounded-lg px-3 py-2 hover:text-text focus-visible:outline-2 focus-visible:outline-peri">
              Subnet 51
            </button>
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
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-text px-4 text-[13px] font-medium text-void hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri"
          >
            GitHub <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </div>
      </nav>

      {/* Hero: the headline, with the globe of real Lium nodes rising behind it. */}
      <header id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <div
          className="absolute left-1/2 top-[44svh] aspect-square w-[min(1280px,170vw)] -translate-x-1/2 sm:top-[40svh]"
          role="img"
          aria-label={`Globe of ${nodeCount} Lium GPU nodes. Payments circle the ring; each rental fires a beam to its miner.`}
        >
          <Engine nodes={nodes.data?.nodes ?? []} pods={enginePods} pulses={pulses} still={still} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" aria-hidden />

        <div className="pointer-events-none relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 pt-32 text-center sm:pt-36">
          <a
            href="#how"
            className="pointer-events-auto inline-flex min-h-9 items-center gap-2 rounded-full border border-hair bg-ink-1 px-3.5 text-[13px] text-muted backdrop-blur hover:text-text focus-visible:outline-2 focus-visible:outline-peri"
          >
            <span className="size-1.5 rounded-full bg-live" aria-hidden />
            x402 GPU rentals for agents · live on testnet
            <ArrowRight className="size-3.5" aria-hidden />
          </a>
          <h1 className="mt-7 text-[clamp(2.6rem,7vw,4.6rem)] font-light leading-[1.02] tracking-[-0.055em]">
            Rent a GPU <span className="font-serif text-[1.08em] italic tracking-[-0.02em] text-peri">in one</span>
            <br />
            HTTP request
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            An agent pays with USDC or TAO and gets a Bittensor Subnet 51 GPU from Lium. No account, no API key.
          </p>
          <div className="pointer-events-auto mt-8 flex flex-wrap justify-center gap-3">
            <a href="#live" className="btn-accent inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri">
              Watch it live <ArrowRight className="size-4" aria-hidden />
            </a>
            <a
              href="#how"
              className="inline-flex min-h-11 items-center rounded-full border border-hair bg-ink-1 px-5 text-[15px] text-text backdrop-blur hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri"
            >
              How it works
            </a>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-auto flex w-full max-w-[1240px] flex-wrap items-end justify-between gap-4 px-4 pb-6 sm:px-6">
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <span className="size-1.5 rounded-full bg-white" aria-hidden />
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            <span>
              <span className="num text-text">{nodeCount || "—"}</span> Lium nodes. White is cheapest, blue is premium.
            </span>
          </p>
          <dl className="grid grid-cols-3 divide-x divide-hair overflow-hidden rounded-xl border border-hair bg-void/70 backdrop-blur-xl">
            <Stat label="Live" value={s?.totals.activePods} format={(n) => Math.round(n).toString()} tone={s?.totals.activePods ? "text-live" : undefined} />
            <Stat label="Paid" value={s?.totals.usdcReceived} format={(n) => `$${n.toFixed(2)}`} />
            <Stat label="GPU min" value={s?.totals.gpuMinutesRouted} format={(n) => n.toFixed(0)} />
          </dl>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 sm:px-6">
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

        {s && <Ledger s={s} />}

        <section id="live" className="scroll-mt-24 py-20 lg:py-28">
          <p className="eyebrow">
            <span className="text-peri">02</span> —— Live / {tab}
          </p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div className="grid content-start gap-6">
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-light leading-[1.1] tracking-[-0.035em]">What the gateway is doing now.</h2>
              {s ? <NowCard pod={current} now={now} onOpen={(p) => setOpen(p.podId)} /> : <Skeleton className="h-56 rounded-2xl" />}
            </div>
            <div>
              <TabBar tab={tab} onChange={setTab} />
              <div
                role="tabpanel"
                id={`panel-${TABS.indexOf(tab)}`}
                aria-labelledby={`tab-${TABS.indexOf(tab)}`}
                tabIndex={0}
                className="mt-6 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-peri"
              >
                {!s && tab !== "Market" && tab !== "Subnet 51" ? (
                  <div className="grid gap-2" aria-busy="true">
                    {Array.from({ length: 4 }, (_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : tab === "Activity" ? (
                  <ActivityPanel events={events} now={now} />
                ) : tab === "Rentals" ? (
                  <RentalsPanel pods={pods} now={now} onOpen={(p) => setOpen(p.podId)} />
                ) : tab === "Payments" ? (
                  <PaymentsPanel s={s!} now={now} />
                ) : tab === "Market" ? (
                  <MarketPanel models={market.data?.models ?? (market.error ? [] : null)} />
                ) : (
                  <SubnetPanel c={chain.data} lium={lium.data} />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-2 border-t border-hair px-4 py-8 text-[13px] text-faint sm:px-6">
        <span>GPU402 · open source · Bittensor Subnet 51 via Lium</span>
        <a href={REPO} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-text focus-visible:outline-2 focus-visible:outline-peri">
          github.com/GPU402/gpu402 <ArrowUpRight className="size-3" aria-hidden />
        </a>
      </footer>

      <RentalDialog pod={openPod} now={now} onClose={() => setOpen(null)} />
    </div>
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
  return (
    <section aria-labelledby="ledger-title" className="grid gap-3">
      <div className="rounded-3xl bg-paper p-6 text-paper-ink sm:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p id="ledger-title" className="text-[clamp(3rem,9vw,6rem)] font-light tabular-nums leading-none tracking-[-0.06em] text-rust">
              <CountUp value={s.totals.usdcReceived} format={(n) => `$${n.toFixed(2)}`} />
            </p>
            <p className="mt-3 text-[17px] text-paper-ink">paid by agents over x402, in {s.totals.payments} payments</p>
          </div>
          <p className="eyebrow !text-paper-muted">By rail</p>
        </div>
        <div className="mt-8 flex h-12 overflow-hidden rounded-xl" role="img" aria-label={rails.map((r) => `${r.label} ${Math.round((r.usd / total) * 100)}%`).join(", ")}>
          {rails
            .filter((r) => r.usd > 0)
            .map((r) => (
              <div key={r.label} className={cx("num flex items-center px-4 text-[13px] text-white", r.color)} style={{ width: `${(r.usd / total) * 100}%` }}>
                {Math.round((r.usd / total) * 100)}%
              </div>
            ))}
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
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
      <dl className="grid divide-y divide-paper-hair overflow-hidden rounded-3xl bg-paper text-paper-ink sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[
          [String(s.totals.pods), "Rentals", "paid for by agents, end to end"],
          [s.totals.gpuMinutesRouted.toFixed(0), "GPU-minutes", "served by Subnet 51 miners"],
          [`$${s.totals.liumSpendUsd.toFixed(2)}`, "To Lium", "billed by the second"],
        ].map(([v, k, d], i) => (
          <div key={k} className="p-6 sm:p-8">
            <dt className="sr-only">{k}</dt>
            <dd>
              <span className={cx("text-[2.25rem] font-light tracking-[-0.04em]", i === 2 && "text-cobalt")}>{v}</span>
              <span className="eyebrow ml-2 !text-paper-muted">{k}</span>
              <p className="mt-1 text-[15px] text-paper-muted">{d}</p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
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
