"use client";

import { ArrowUpRight, Copy, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  networkName,
  paidAmount,
  short,
  type GatewayEvent,
  type GatewayState,
  type LiumNetwork,
  type MarketModel,
  type PodView,
  type Sn51Stats,
} from "../lib";
import { eventMeta, gpuShort, place, toneColor } from "./events";
import { CountdownRing, Empty, Pill, Skeleton, ago, cx } from "./primitives";

export const TABS = [
  "Activity",
  "Rentals",
  "Payments",
  "Market",
  "Subnet 51",
] as const;
export type Tab = (typeof TABS)[number];

/** WAI-ARIA tabs: arrow keys move between tabs, Home/End jump. */
export function TabBar({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (t: Tab) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const n =
      e.key === "ArrowRight"
        ? i + 1
        : e.key === "ArrowLeft"
          ? i - 1
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? TABS.length - 1
              : null;
    if (n === null) return;
    e.preventDefault();
    const j = (n + TABS.length) % TABS.length;
    onChange(TABS[j]!);
    refs.current[j]?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label="Details"
      className="flex max-w-full gap-6 overflow-x-auto border-b border-hair"
    >
      {TABS.map((t, i) => (
        <button
          key={t}
          ref={(el) => void (refs.current[i] = el)}
          role="tab"
          id={`tab-${i}`}
          aria-selected={tab === t}
          aria-controls={`panel-${i}`}
          tabIndex={tab === t ? 0 : -1}
          onClick={() => onChange(t)}
          onKeyDown={(e) => onKey(e, i)}
          className={cx(
            "eyebrow -mb-px min-h-11 shrink-0 border-b-2 text-[11px] transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri",
            tab === t ? "border-accent !text-text" : "border-transparent hover:!text-muted",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function ActivityPanel({
  events,
  now,
}: {
  events: GatewayEvent[];
  now: number;
}) {
  const [all, setAll] = useState(false);
  if (events.length === 0)
    return (
      <Empty
        title="Nothing has happened yet."
        hint="Every quote, payment, rental and removal appears here the moment it happens."
      />
    );
  return (
    <>
      <ol className="grid gap-1" aria-live="polite">
        {events.slice(0, all ? 40 : 8).map((e) => {
          const m = eventMeta(e);
          const Icon = m.icon;
          const url = (() => {
            try {
              return e.data
                ? ((JSON.parse(e.data) as { url?: string | null }).url ?? null)
                : null;
            } catch {
              return null;
            }
          })();
          return (
            <li
              key={`${e.id}-${e.ts}`}
              className="flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors duration-100 hover:bg-ink-1"
            >
              <span
                className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-ink-2"
                style={{ color: toneColor[m.tone] }}
              >
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="text-sm font-medium text-text">{m.label}</p>
                  <time
                    className="num text-xs text-faint"
                    dateTime={new Date(e.ts).toISOString()}
                  >
                    {ago(e.ts, now)}
                  </time>
                </div>
                <p className="mt-0.5 break-words text-sm text-muted">
                  {e.message}
                </p>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex min-h-10 items-center gap-1 text-xs text-usdc hover:underline focus-visible:outline-2 focus-visible:outline-usdc"
                  >
                    View transaction{" "}
                    <ArrowUpRight className="size-3" aria-hidden />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {events.length > 8 && (
        <button
          type="button"
          onClick={() => setAll((a) => !a)}
          className="mt-3 min-h-10 rounded-full px-4 text-sm text-muted hover:bg-ink-2 hover:text-text focus-visible:outline-2 focus-visible:outline-peri"
        >
          {all ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );
}

const STATUS_TONE: Record<
  PodView["status"],
  "live" | "amber" | "neutral" | "rose"
> = {
  running: "live",
  starting: "amber",
  expired: "neutral",
  stopped: "neutral",
  failed: "rose",
  unpaid: "rose",
};

export function RentalsPanel({
  pods,
  now,
  onOpen,
}: {
  pods: PodView[];
  now: number;
  onOpen: (p: PodView) => void;
}) {
  if (pods.length === 0)
    return (
      <Empty
        title="No rentals yet."
        hint="When an agent pays, its GPU shows up here with a live countdown."
      />
    );
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {pods.slice(0, 12).map((p) => {
        const left =
          p.status === "running" && p.expiresAt
            ? Math.max(0, (Date.parse(p.expiresAt) - now) / 1000)
            : null;
        return (
          <li key={p.podId}>
            <button
              type="button"
              onClick={() => onOpen(p)}
              className="glass flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-colors duration-100 hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[15px] font-semibold text-text">
                    {gpuShort(p.gpu)}
                  </p>
                  <Pill tone={STATUS_TONE[p.status]}>{p.status}</Pill>
                </div>
                <p className="mt-1 flex items-center gap-1 truncate text-sm text-muted">
                  <MapPin className="size-3.5 shrink-0" aria-hidden />{" "}
                  {place(p)}
                </p>
                <p className="num mt-2 text-xs text-faint">
                  ${p.liumPricePerHour.toFixed(2)}/h on Lium · {p.blocksPaid} ×
                  15 min
                </p>
              </div>
              {left !== null && (
                <CountdownRing
                  left={left}
                  total={p.blocksPaid * 900}
                  size={52}
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function PaymentsPanel({ s, now }: { s: GatewayState; now: number }) {
  if (s.payments.length === 0)
    return (
      <Empty
        title="No payments yet."
        hint="Agents pay per 15-minute block, in USDC on Base or TAO on Bittensor."
      />
    );
  return (
    <ul className="grid gap-2">
      {s.payments.slice(0, 15).map((p) => {
        const tao = p.asset === "TAO";
        const amount = paidAmount(p.asset, p.amount_atomic);
        return (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-3 transition-colors duration-100 hover:bg-ink-1"
          >
            <div className="flex items-center gap-3">
              <span
                className={cx(
                  "size-2 rounded-full",
                  tao ? "bg-tao" : "bg-usdc",
                )}
                aria-hidden
              />
              <div>
                <p
                  className={cx(
                    "num text-[15px] font-medium",
                    tao ? "text-tao" : "text-usdc",
                  )}
                >
                  {amount}
                </p>
                <p className="text-xs text-muted">
                  {p.kind === "rent" ? "Rent" : "Extend"} · {p.blocks} block
                  {p.blocks === 1 ? "" : "s"} · {networkName(p.network)} · from{" "}
                  <span className="num">{short(p.payer)}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {p.status === "refunded" && <Pill tone="amber">Refunded</Pill>}
              {p.explorerUrl ? (
                <a
                  href={p.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="num inline-flex min-h-10 items-center gap-1 text-xs text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-peri"
                >
                  {short(p.tx_hash, 8, 6)}{" "}
                  <ArrowUpRight className="size-3" aria-hidden />
                </a>
              ) : (
                <CopyHash hash={p.tx_hash} />
              )}
              <span className="num w-16 text-right text-xs text-faint">
                {ago(p.created_at, now)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Bittensor's testnet has no public explorer: offer the hash to copy instead of a link. */
function CopyHash({ hash }: { hash: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        void navigator.clipboard
          .writeText(hash)
          .then(() => (setDone(true), setTimeout(() => setDone(false), 1500)))
      }
      className="num inline-flex min-h-10 items-center gap-1 text-xs text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-peri"
      aria-label={`Copy transaction hash ${hash}`}
    >
      {done ? "Copied" : short(hash, 8, 6)}{" "}
      <Copy className="size-3" aria-hidden />
    </button>
  );
}

export function MarketPanel({ models }: { models: MarketModel[] | null }) {
  if (!models) return <ListSkeleton />;
  if (models.length === 0)
    return (
      <Empty
        title="Lium's market is not reachable right now."
        hint="The gateway retries every 30 seconds."
      />
    );
  const max = Math.max(...models.slice(0, 12).map((m) => m.blockPriceUsd));
  return (
    <ul className="grid gap-1">
      {models.slice(0, 12).map((m) => (
        <li
          key={m.gpu}
          className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl px-3 py-2.5 transition-colors duration-100 hover:bg-ink-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]"
        >
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-text">
              {gpuShort(m.gpu)}
            </p>
            <p className="truncate text-xs text-muted">
              {m.vramGb ? `${m.vramGb} GB · ` : ""}
              {m.gpusAvailable} free · {m.countries.slice(0, 2).join(", ")}
            </p>
          </div>
          <div
            className="hidden h-1.5 overflow-hidden rounded-full bg-ink-2 sm:block"
            aria-hidden
          >
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${Math.max(6, (m.blockPriceUsd / max) * 100)}%`,
              }}
            />
          </div>
          <p className="num text-right text-[15px] text-text">
            ${m.blockPriceUsd.toFixed(4)}
            <span className="block text-[11px] text-faint">per 15 min</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export function SubnetPanel({
  c,
  lium,
}: {
  c: Sn51Stats | null;
  lium: LiumNetwork | null;
}) {
  if (!c) return <ListSkeleton />;
  const top = c.topMiners.slice(0, 7);
  const maxInc = top[0]?.incentive ?? 1;
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <figure className="relative mx-auto aspect-square w-full max-w-[420px]">
        <svg
          viewBox="-210 -210 420 420"
          className="size-full"
          role="img"
          aria-label={`Top ${top.length} Subnet 51 miners by incentive, orbiting the subnet`}
        >
          <defs>
            <radialGradient id="core" r="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.9" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle r="46" fill="url(#core)" opacity="0.35" />
          <circle
            r="22"
            fill="var(--void)"
            stroke="var(--peri)"
            strokeWidth="1.5"
          />
          <text
            textAnchor="middle"
            dy="5"
            className="fill-text"
            style={{ font: "500 13px var(--font-geist)" }}
          >
            51
          </text>
          {top.map((m, i) => {
            const r = 62 + i * 21;
            const size = 3 + Math.sqrt(m.incentive / maxInc) * 11;
            return (
              <g key={m.uid}>
                <circle
                  r={r}
                  fill="none"
                  stroke="var(--ink-3)"
                  strokeDasharray="2 5"
                />
                <g
                  className="motion-safe:animate-[spin_var(--d)_linear_infinite]"
                  style={{
                    ["--d" as string]: `${28 + i * 9}s`,
                    transformOrigin: "0 0",
                    transform: `rotate(${i * 67}deg)`,
                  }}
                >
                  <circle
                    cx={r}
                    cy={0}
                    r={size}
                    fill={i === 0 ? "var(--accent)" : "var(--peri)"}
                    opacity={i === 0 ? 1 : 0.85}
                  >
                    <title>{`UID ${m.uid} · ${(m.incentive * 100).toFixed(1)}% incentive`}</title>
                  </circle>
                </g>
              </g>
            );
          })}
        </svg>
        <figcaption className="mt-2 text-center text-xs text-muted">
          Top miners by incentive. Bigger means a larger share.
        </figcaption>
      </figure>
      <div className="grid gap-6">
        <dl className="grid grid-cols-2 gap-3">
          {[
            ["Miners earning", String(c.minersWithIncentive), "text-text"],
            ["Validators", String(c.validators), "text-text"],
            ["Alpha price in TAO", c.alphaPriceTao.toFixed(4), "text-text"],
            [
              "TAO in pool",
              c.taoIn.toLocaleString(undefined, { maximumFractionDigits: 0 }),
              "text-tao",
            ],
          ].map(([k, v, tone]) => (
            <div key={k} className="glass rounded-2xl p-4">
              <dt className="text-xs text-muted">{k}</dt>
              <dd
                className={cx(
                  "num mt-1 font-display text-2xl font-light",
                  tone,
                )}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted">
          Read live from Bittensor Finney at block{" "}
          <span className="num text-text">{c.block.toLocaleString()}</span>.
          {lium && (
            <>
              {" "}
              Across Lium,{" "}
              <span className="num text-text">
                {lium.gpusRented.toLocaleString()}
              </span>{" "}
              of {lium.gpusListed.toLocaleString()} GPUs are rented right now.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-14" />
      ))}
    </div>
  );
}

/** Rental details in a native modal dialog: focus is trapped and Escape closes it. */
export function RentalDialog({
  pod,
  now,
  onClose,
}: {
  pod: PodView | null;
  now: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (pod && !d.open) d.showModal();
    if (!pod && d.open) d.close();
  }, [pod]);
  const left =
    pod?.status === "running" && pod.expiresAt
      ? Math.max(0, (Date.parse(pod.expiresAt) - now) / 1000)
      : null;
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="glass m-auto w-[min(560px,calc(100vw-32px))] rounded-2xl p-0 text-text "
      aria-labelledby="rental-title"
    >
      {pod && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="rental-title"
                className="font-display text-2xl font-light tracking-tight"
              >
                {gpuShort(pod.gpu)}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <MapPin className="size-3.5" aria-hidden /> {place(pod)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 place-items-center rounded-full bg-ink-2 text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-peri"
              aria-label="Close"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-muted">Status</dt>
              <dd className="mt-1 capitalize">{pod.status}</dd>
            </div>
            <div>
              <dt className="text-muted">Paid time</dt>
              <dd className="num mt-1">{pod.blocksPaid * 15} min</dd>
            </div>
            <div>
              <dt className="text-muted">Lium price</dt>
              <dd className="num mt-1">${pod.liumPricePerHour.toFixed(3)}/h</dd>
            </div>
            <div>
              <dt className="text-muted">Billed by Lium</dt>
              <dd className="num mt-1">
                {pod.liumSpendUsd != null
                  ? `$${pod.liumSpendUsd.toFixed(4)}`
                  : "Settling"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted">Paid by</dt>
              <dd className="num mt-1 break-all">{pod.payer ?? "Unknown"}</dd>
            </div>
          </dl>
          {left !== null && (
            <div className="mt-6 flex items-center gap-4 rounded-2xl bg-ink-1 p-4">
              <CountdownRing left={left} total={pod.blocksPaid * 900} />
              <p className="text-sm text-muted">
                Paid time left. The gateway removes the pod when it runs out.
              </p>
            </div>
          )}
          <h3 className="mt-6 text-sm font-medium text-text">Payments</h3>
          <ul className="mt-2 grid gap-2">
            {pod.payments.map((p) => (
              <li
                key={p.txHash}
                className="flex items-center justify-between gap-3 rounded-xl bg-ink-1 px-3 py-2.5 text-sm"
              >
                <span
                  className={cx(
                    "num",
                    p.asset === "TAO" ? "text-tao" : "text-usdc",
                  )}
                >
                  {p.amount} {p.asset === "TAO" ? "TAO" : "USDC"}
                </span>
                {p.explorerUrl ? (
                  <a
                    href={p.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="num inline-flex items-center gap-1 text-xs text-muted hover:text-text"
                  >
                    {short(p.txHash, 8, 6)}{" "}
                    <ArrowUpRight className="size-3" aria-hidden />
                  </a>
                ) : (
                  <CopyHash hash={p.txHash} />
                )}
              </li>
            ))}
            {pod.payments.length === 0 && (
              <li className="text-sm text-faint">No settled payment.</li>
            )}
          </ul>
        </div>
      )}
    </dialog>
  );
}
