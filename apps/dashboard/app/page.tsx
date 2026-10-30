"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GATEWAY,
  clock,
  getJson,
  gpuName,
  networkName,
  paidAmount,
  short,
  usd,
  type GatewayEvent,
  type GatewayState,
  type LiumNetwork,
  type MarketModel,
  type PodView,
  type Sn51Stats,
} from "./lib";

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

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

export default function Dashboard() {
  const state = usePoll<GatewayState>("/api/state", 4000);
  const market = usePoll<{ models: MarketModel[] }>("/gpus", 30_000);
  const chain = usePoll<Sn51Stats>("/api/sn51", 30_000);
  const lium = usePoll<LiumNetwork>("/api/lium", 60_000);
  const [live, setLive] = useState<GatewayEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const reloadState = useRef(state.reload);
  reloadState.current = state.reload;

  useEffect(() => {
    const es = new EventSource(`${GATEWAY}/api/events`);
    es.addEventListener("hello", () => setConnected(true));
    es.addEventListener("gateway", (m) => {
      const e = JSON.parse((m as MessageEvent).data) as GatewayEvent;
      setLive((prev) => [e, ...prev].slice(0, 80));
      void reloadState.current();
    });
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, []);

  const events = useMemo(() => {
    const seen = new Set<number>();
    return [...live, ...(state.data?.events ?? [])].filter((e) => (e.id ? !seen.has(e.id) && seen.add(e.id) : true)).slice(0, 60);
  }, [live, state.data?.events]);

  const s = state.data;
  const offline = Boolean(state.error) && !s;

  return (
    <main className="grid-bg min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <Header s={s} connected={connected && !state.error} />

        {offline && (
          <div className="mt-6 rounded-lg border border-bad/40 bg-bad/10 p-4 text-sm text-bad">
            Cannot reach the gateway at <span className="font-mono">{GATEWAY}</span>. Start it with <span className="font-mono">pnpm gateway</span>.
          </div>
        )}

        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Kpi label="Active GPUs" value={s ? String(s.totals.activePods) : "—"} hint={s ? `${s.totals.pods} rented total` : ""} accent />
          <Kpi label="Received via x402" value={s ? `$${s.totals.usdcReceived.toFixed(4)}` : "—"} hint={s ? `${s.totals.payments} payments · USDC + TAO, in USD` : ""} tone="x402" />
          <Kpi label="GPU-minutes to Lium" value={s ? s.totals.gpuMinutesRouted.toFixed(1) : "—"} hint="served by SN51 miners" />
          <Kpi label="Paid to Lium miners" value={s ? usd(s.totals.liumSpendUsd) : "—"} hint="per-second billing" />
          <Kpi label="Gateway Lium balance" value={s ? usd(s.gateway.liumBalanceUsd, 2) : "—"} hint={s?.gateway.canRent ? "renting enabled" : "quote-only mode"} tone={s?.gateway.canRent ? undefined : "warn"} />
          <Kpi label="Margin per block" value={s ? `${(s.gateway.margin * 100).toFixed(0)}%` : "—"} hint={`${s?.gateway.blockMinutes ?? 15}-min prepaid blocks`} />
        </section>

        <FlowStrip events={events} />

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Panel title="Live rentals" subtitle="Paid time starts when the pod is reachable; the sweeper removes it at expiry">
              <PodsTable pods={s?.pods ?? []} />
            </Panel>
            <Panel title="x402 payments" subtitle={s ? `USDC on ${networkName(s.gateway.network)} via ${s.gateway.facilitator.replace(/^https?:\/\//, "")}${s.gateway.tao ? ` · TAO on ${s.gateway.tao.label}, settled by the gateway` : ""}` : ""}>
              <Payments s={s} />
            </Panel>
          </div>
          <Panel title="Gateway feed" subtitle="Every 402, payment, rent and removal, live" className="xl:row-span-2">
            <EventFeed events={events} />
          </Panel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          <Panel title="GPU market" subtitle="Cheapest live Lium node per model, GPU402 price per 15-min block" className="xl:col-span-2">
            <Market models={market.data?.models ?? []} />
          </Panel>
          <Panel title={`Subnet ${chain.data?.netuid ?? 51} on chain`} subtitle={chain.data ? `Bittensor Finney · block ${chain.data.block.toLocaleString()}` : "Reading subtensor…"}>
            <Chain c={chain.data} lium={lium.data} error={chain.error} />
          </Panel>
        </section>

        {s && s.spendByAgent.length > 0 && (
          <section className="mt-6">
            <Panel title="Spend per agent wallet" subtitle="Net of refunds">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {s.spendByAgent.map((a) => (
                  <div key={a.payer} className="flex items-center justify-between rounded-md border border-line bg-panel-2 px-3 py-2 text-sm">
                    <span className="font-mono text-muted">{short(a.payer)}</span>
                    <span className="tabular">
                      {usd(a.usd)} <span className="text-faint">· {a.pods} pod{a.pods === 1 ? "" : "s"}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}

        <footer className="mt-10 border-t border-line pt-4 text-xs text-faint">
          GPU402 · open source · Lium API is the source of truth (types generated from lium.io/api/openapi.json) · gateway {GATEWAY}
        </footer>
      </div>
    </main>
  );
}

// ------------------------------------------------------------------ components

function Header({ s, connected }: { s: GatewayState | null; connected: boolean }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-md border border-accent-dim bg-accent/10 font-mono text-sm font-bold text-accent">402</div>
          <h1 className="text-2xl font-semibold tracking-tight">GPU402</h1>
          <span className="rounded border border-line-2 px-2 py-0.5 text-xs text-muted">Bittensor SN51 · Lium</span>
        </div>
        <p className="mt-1.5 text-sm text-muted">Any TypeScript app or AI agent rents a decentralized GPU in one call, and pays per use with x402. No account.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {s && (
          <>
            <span className="rounded-md border border-x402/40 bg-x402/10 px-2 py-1 text-x402">
              USDC · {networkName(s.gateway.network)}
            </span>
            {s.gateway.tao && <span className="rounded-md border border-tao/40 bg-tao/10 px-2 py-1 text-tao">TAO · {s.gateway.tao.label}</span>}
            <span className="rounded-md border border-line-2 px-2 py-1 font-mono text-muted">payTo {short(s.gateway.payTo)}</span>
          </>
        )}
        <span className={`flex items-center gap-1.5 rounded-md border px-2 py-1 ${connected ? "border-accent-dim text-accent" : "border-bad/40 text-bad"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "pulse-dot bg-accent" : "bg-bad"}`} />
          {connected ? "live" : "offline"}
        </span>
      </div>
    </header>
  );
}

function Kpi({ label, value, hint, accent, tone }: { label: string; value: string; hint?: string; accent?: boolean; tone?: "x402" | "warn" }) {
  const color = accent ? "text-accent" : tone === "x402" ? "text-x402" : tone === "warn" ? "text-warn" : "text-text";
  return (
    <div className="rounded-lg border border-line bg-panel px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-faint">{label}</div>
      <div className={`tabular mt-1 text-2xl font-semibold ${color}`}>{value}</div>
      {hint && <div className="mt-0.5 truncate text-xs text-muted">{hint}</div>}
    </div>
  );
}

function Panel({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-line bg-panel ${className}`}>
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

const FLOW = [
  { type: "quote.issued", label: "HTTP 402 quote" },
  { type: "payment.verified", label: "USDC signed & verified" },
  { type: "pod.rented", label: "Rented on Lium" },
  { type: "payment.settled", label: "Settled on-chain" },
  { type: "pod.ready", label: "GPU ready (SSH)" },
  { type: "pod.expired", label: "Removed at expiry" },
] as const;

/** The paid-rental pipeline, lit up from the most recent run's events. */
function FlowStrip({ events }: { events: GatewayEvent[] }) {
  const lastQuote = events.find((e) => e.type === "quote.issued");
  const since = lastQuote?.ts ?? 0;
  const reached = new Set(events.filter((e) => e.ts >= since).map((e) => (e.type === "pod.stopped" ? "pod.expired" : e.type)));
  const failed = events.some((e) => e.ts >= since && (e.type === "payment.failed" || e.type === "pod.failed"));
  return (
    <section className="mt-6 overflow-x-auto rounded-lg border border-line bg-panel px-4 py-3">
      <div className="flex min-w-[760px] items-center gap-2">
        <span className="mr-2 text-[11px] uppercase tracking-wider text-faint">Last rental</span>
        {FLOW.map((step, i) => {
          const on = reached.has(step.type);
          return (
            <div key={step.type} className="flex flex-1 items-center gap-2">
              <div
                className={`flex-1 rounded-md border px-3 py-2 text-center text-xs transition-colors ${
                  on ? (i < 2 ? "border-x402/50 bg-x402/10 text-x402" : "border-accent-dim bg-accent/10 text-accent") : "border-line text-faint"
                }`}
              >
                <span className="font-mono">{i + 1}</span> · {step.label}
              </div>
              {i < FLOW.length - 1 && <span className={on ? "text-muted" : "text-line-2"}>→</span>}
            </div>
          );
        })}
        {failed && <span className="ml-2 rounded border border-bad/40 px-2 py-1 text-xs text-bad">failed · see feed</span>}
      </div>
    </section>
  );
}

const STATUS_STYLE: Record<PodView["status"], string> = {
  starting: "border-warn/40 bg-warn/10 text-warn",
  running: "border-accent-dim bg-accent/10 text-accent",
  expired: "border-line-2 text-muted",
  stopped: "border-line-2 text-muted",
  failed: "border-bad/40 bg-bad/10 text-bad",
  unpaid: "border-line-2 text-faint",
};

function PodsTable({ pods }: { pods: PodView[] }) {
  const now = useNow();
  if (pods.length === 0) return <Empty>No rentals yet. Run <span className="font-mono">pnpm demo:agent</span> to have an agent pay for one.</Empty>;
  return (
    <div className="-mx-4 overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-faint">
            <th className="px-4 pb-2 font-medium">Pod</th>
            <th className="pb-2 font-medium">GPU</th>
            <th className="pb-2 font-medium">Agent</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="w-[30%] pb-2 font-medium">Paid time</th>
            <th className="px-4 pb-2 text-right font-medium">Lium $/h</th>
          </tr>
        </thead>
        <tbody>
          {pods.map((p) => {
            const total = p.blocksPaid * 15 * 60;
            const left = p.status === "running" && p.expiresAt ? (Date.parse(p.expiresAt) - now) / 1000 : null;
            const pct = left === null ? (p.status === "expired" ? 0 : p.status === "starting" ? 100 : 0) : Math.max(0, Math.min(100, (left / total) * 100));
            return (
              <tr key={p.podId} className="border-t border-line align-middle">
                <td className="px-4 py-2.5 font-mono text-xs text-muted">{p.podId.slice(0, 8)}</td>
                <td className="py-2.5">
                  {gpuName(p.gpu)}
                  {p.gpuCount > 1 ? ` ×${p.gpuCount}` : ""}
                  {p.country && <span className="ml-1.5 text-xs text-faint">{p.country}</span>}
                </td>
                <td className="py-2.5 font-mono text-xs text-muted">{short(p.payer)}</td>
                <td className="py-2.5">
                  <span className={`rounded border px-1.5 py-0.5 text-xs ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                  {p.status === "starting" && p.liumStatus && <span className="ml-1.5 text-xs text-faint">{p.liumStatus.toLowerCase()}</span>}
                </td>
                <td className="py-2.5 pr-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div
                        className={`h-full rounded-full ${p.status === "running" ? (pct < 15 ? "bg-warn" : "bg-accent") : p.status === "starting" ? "pulse-dot bg-warn/60" : "bg-line-2"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="tabular w-24 text-right text-xs text-muted">
                      {left !== null ? `${clock(left)} left` : p.status === "starting" ? "starting…" : (p.removedReason ?? p.status).replace(/_/g, " ")}
                    </span>
                  </div>
                </td>
                <td className="tabular px-4 py-2.5 text-right text-xs text-muted">{p.liumPricePerHour.toFixed(3)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Payments({ s }: { s: GatewayState | null }) {
  const payments = s?.payments ?? [];
  if (payments.length === 0) return <Empty>No payments yet. Each one links to its Base transaction.</Empty>;
  return (
    <ul className="divide-y divide-line">
      {payments.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
          <div className="flex items-center gap-3">
            <span className={`tabular font-semibold ${p.asset === "TAO" ? "text-tao" : "text-x402"}`}>{paidAmount(p.asset, p.amount_atomic)}</span>
            {p.asset === "TAO" && <span className="tabular text-xs text-faint">≈ ${p.amount_usd.toFixed(4)}</span>}
            <span className="text-xs text-muted">
              {p.kind === "rent" ? "rent" : "extend"} · {p.blocks} block{p.blocks === 1 ? "" : "s"} · pod {p.pod_id.slice(0, 8)} · from <span className="font-mono">{short(p.payer)}</span>
            </span>
            {p.status === "refunded" && <span className="rounded border border-warn/40 px-1.5 text-xs text-warn">refunded {usd(p.refund_usd)}</span>}
          </div>
          <div className="flex items-center gap-3 text-xs">
            {p.explorerUrl ? (
              <a className="font-mono text-x402 hover:underline" href={p.explorerUrl} target="_blank" rel="noreferrer">
                {short(p.tx_hash, 10, 6)} ↗
              </a>
            ) : (
              <span className="font-mono text-tao" title={`${p.tx_hash} on ${networkName(p.network)} (no public explorer)`}>
                {short(p.tx_hash, 10, 6)}
              </span>
            )}
            {p.refundUrl && (
              <a className="font-mono text-warn hover:underline" href={p.refundUrl} target="_blank" rel="noreferrer">
                refund ↗
              </a>
            )}
            <span className="text-faint">{new Date(p.created_at).toLocaleTimeString()}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

const EVENT_COLOR: Record<string, string> = {
  "quote.issued": "text-x402",
  "payment.verified": "text-x402",
  "payment.settled": "text-x402",
  "payment.refunded": "text-warn",
  "payment.failed": "text-bad",
  "payment.rejected": "text-bad",
  "pod.rented": "text-accent",
  "pod.ready": "text-accent",
  "pod.extended": "text-accent",
  "pod.expired": "text-muted",
  "pod.stopped": "text-muted",
  "pod.failed": "text-bad",
  "gateway.warning": "text-warn",
};

function EventFeed({ events }: { events: GatewayEvent[] }) {
  if (events.length === 0) return <Empty>Waiting for the first request…</Empty>;
  return (
    <ol className="max-h-[720px] space-y-2 overflow-y-auto pr-1">
      {events.map((e) => {
        const data = e.data ? (JSON.parse(e.data) as { url?: string }) : null;
        return (
          <li key={`${e.id}-${e.ts}`} className="slide-in rounded-md border border-line bg-panel-2 px-3 py-2">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className={`font-mono ${EVENT_COLOR[e.type] ?? "text-muted"}`}>{e.type}</span>
              <span className="tabular text-faint">{new Date(e.ts).toLocaleTimeString()}</span>
            </div>
            <p className="mt-1 break-words text-xs leading-relaxed text-text/90">{e.message}</p>
            {data?.url && (
              <a className="mt-1 inline-block font-mono text-[11px] text-x402 hover:underline" href={data.url} target="_blank" rel="noreferrer">
                view transaction ↗
              </a>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Market({ models }: { models: MarketModel[] }) {
  if (models.length === 0) return <Empty>Loading Lium's live market…</Empty>;
  const max = Math.max(...models.map((m) => m.pricePerGpuHour));
  return (
    <div className="-mx-4 overflow-x-auto">
      <table className="w-full min-w-[620px] text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-faint">
            <th className="px-4 pb-2 font-medium">Model</th>
            <th className="pb-2 font-medium">VRAM</th>
            <th className="pb-2 text-right font-medium">Free GPUs</th>
            <th className="pb-2 text-right font-medium">Lium $/GPU-h</th>
            <th className="w-[28%] px-4 pb-2 text-right font-medium">GPU402 per 15 min</th>
          </tr>
        </thead>
        <tbody>
          {models.slice(0, 12).map((m) => (
            <tr key={m.gpu} className="border-t border-line">
              <td className="px-4 py-2">
                {gpuName(m.gpu)}
                <span className="ml-2 text-xs text-faint">{m.countries.slice(0, 3).join(", ")}</span>
              </td>
              <td className="tabular py-2 text-muted">{m.vramGb ? `${m.vramGb} GB` : "—"}</td>
              <td className="tabular py-2 text-right text-muted">{m.gpusAvailable}</td>
              <td className="tabular py-2 text-right text-muted">{m.liumPricePerGpuHour.toFixed(3)}</td>
              <td className="px-4 py-2">
                <div className="flex items-center justify-end gap-2">
                  <div className="hidden h-1 w-20 overflow-hidden rounded-full bg-line sm:block">
                    <div className="h-full bg-x402/70" style={{ width: `${(m.pricePerGpuHour / max) * 100}%` }} />
                  </div>
                  <span className="tabular w-20 text-right font-medium text-x402">${m.blockPriceUsd.toFixed(4)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Chain({ c, lium, error }: { c: Sn51Stats | null; lium: LiumNetwork | null; error: string | null }) {
  if (!c) return <Empty>{error ? `Chain read failed: ${error}` : "Connecting to wss://entrypoint-finney.opentensor.ai…"}</Empty>;
  const stat = (label: string, value: string, tone = "text-text") => (
    <div className="rounded-md border border-line bg-panel-2 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-faint">{label}</div>
      <div className={`tabular mt-0.5 text-base font-semibold ${tone}`}>{value}</div>
    </div>
  );
  const top = c.topMiners[0]?.incentive ?? 1;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {stat("Miners earning", String(c.minersWithIncentive), "text-accent")}
        {stat("Validators", String(c.validators))}
        {stat("UIDs", `${c.uids}/${c.maxUids}`)}
        {stat("α emitted / tempo", c.emissionAlphaPerTempo.toFixed(1), "text-tao")}
        {stat("TAO in pool", c.taoIn.toLocaleString(undefined, { maximumFractionDigits: 0 }), "text-tao")}
        {stat("α price", `${c.alphaPriceTao.toFixed(4)} τ`, "text-tao")}
      </div>
      {c.blocksSinceLastStep !== null && (
        <div>
          <div className="mb-1 flex justify-between text-[11px] text-faint">
            <span>Tempo progress</span>
            <span className="tabular">
              {c.blocksSinceLastStep}/{c.tempo} blocks
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-tao/70" style={{ width: `${Math.min((c.blocksSinceLastStep / c.tempo) * 100, 100)}%` }} />
          </div>
        </div>
      )}
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-wider text-faint">Top miners by incentive</div>
        <ul className="space-y-1.5">
          {c.topMiners.slice(0, 6).map((m) => (
            <li key={m.uid} className="flex items-center gap-2 text-xs">
              <span className="tabular w-10 text-faint">#{m.uid}</span>
              <span className="w-24 font-mono text-muted">{short(m.hotkey, 5, 4)}</span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-accent/70" style={{ width: `${Math.max((m.incentive / top) * 100, 2)}%` }} />
              </div>
              <span className="tabular w-14 text-right text-muted">{(m.incentive * 100).toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
      {lium && (
        <div className="border-t border-line pt-3 text-xs text-muted">
          Lium network: <span className="text-text">{lium.gpusRented.toLocaleString()}</span> of {lium.gpusListed.toLocaleString()} GPUs rented ·{" "}
          {lium.providers} providers · {lium.countries} countries · {(lium.utilisation30d * 100).toFixed(0)}% 30-day utilisation
        </div>
      )}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-dashed border-line-2 px-4 py-6 text-center text-sm text-muted">{children}</div>;
}
