"use client";

import { ArrowRight, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { GATEWAY } from "../lib";
import { Code } from "./kit";
import { cx } from "./primitives";

interface Endpoint {
  method: "GET" | "POST" | "DELETE";
  path: string;
  what: string;
  /** Runnable from this page without a wallet. */
  run?: string;
  paid?: boolean;
}

/** Endpoints the dashboard itself reads, next to the ones the gateway lists at GET /. */
const FEEDS: Endpoint[] = [
  { method: "GET", path: "/health", what: "Is it up, can it rent", run: "/health" },
  { method: "GET", path: "/api/state", what: "Totals, pods, payments, events", run: "/api/state" },
  { method: "GET", path: "/api/nodes", what: "Every Lium node with coordinates", run: "/api/nodes" },
  { method: "GET", path: "/api/sn51", what: "Subnet 51 read from Finney", run: "/api/sn51" },
  { method: "GET", path: "/api/lium", what: "Lium network totals", run: "/api/lium" },
  { method: "GET", path: "/api/events", what: "Live feed, Server-Sent Events" },
];

/** Turns the gateway's own index ("GET /quote?gpu=…": "…") into endpoints. */
function fromIndex(map: Record<string, string>): Endpoint[] {
  return Object.entries(map).map(([k, what]) => {
    const [method, path] = k.split(" ") as [Endpoint["method"], string];
    const paid = /^Paid/.test(what);
    return { method, path, what: what.replace(/^Paid \(x402\)\.\s*/, "").replace(/\s*\(free\)$/, ""), paid, run: method === "GET" && !path.includes(":") ? path : undefined };
  });
}

const METHOD: Record<Endpoint["method"], string> = {
  GET: "text-live bg-live/10",
  POST: "text-peri bg-accent/15",
  DELETE: "text-rose bg-rose/10",
};

export function ApiExplorer() {
  const [list, setList] = useState<Endpoint[] | null>(null);
  const [sel, setSel] = useState(0);
  const [out, setOut] = useState<{ status: number; ms: number; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`${GATEWAY}/`)
      .then((r) => r.json())
      .then((j: { endpoints: Record<string, string> }) => setList([{ method: "GET", path: "/", what: "This index", run: "/" }, ...fromIndex(j.endpoints), ...FEEDS]))
      .catch(() => setList(FEEDS));
  }, []);

  const ep = list?.[sel];
  const send = async () => {
    if (!ep?.run) return;
    setBusy(true);
    const t0 = performance.now();
    try {
      const res = await fetch(`${GATEWAY}${ep.run}`);
      const json: unknown = await res.json();
      let text = JSON.stringify(json, null, 2);
      if (text.length > 6000) text = `${text.slice(0, 6000)}\n… (${(text.length / 1024).toFixed(0)} KB in all)`;
      setOut({ status: res.status, ms: performance.now() - t0, text });
    } catch (e) {
      setOut({ status: 0, ms: performance.now() - t0, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid overflow-hidden rounded-3xl border border-hair bg-[#0a0b0e] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <ul className="max-h-[560px] overflow-y-auto border-b border-hair p-2 lg:border-b-0 lg:border-r" aria-label="Endpoints">
        {!list &&
          Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="m-1 h-14 animate-pulse rounded-xl bg-ink-1 motion-reduce:animate-none" aria-hidden />
          ))}
        {list?.map((e, i) => (
          <li key={`${e.method} ${e.path}`}>
            <button
              type="button"
              onClick={() => (setSel(i), setOut(null))}
              aria-current={sel === i}
              className={cx(
                "grid w-full grid-cols-[3.75rem_minmax(0,1fr)] items-start gap-x-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-peri",
                sel === i ? "bg-ink-2" : "hover:bg-ink-1",
              )}
            >
              <span className={cx("num mt-0.5 rounded-md px-1.5 py-0.5 text-center text-[11px]", METHOD[e.method])}>{e.method}</span>
              <span className="min-w-0">
                <span className="num block truncate text-[13px] text-text">{e.path}</span>
                <span className="block truncate text-[12px] text-faint">{e.what}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex min-w-0 flex-col p-5">
        {ep && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <span className={cx("num rounded-md px-2 py-0.5 text-[12px]", METHOD[ep.method])}>{ep.method}</span>
              <span className="num min-w-0 flex-1 truncate text-[15px]">{ep.path}</span>
              {ep.paid && <span className="rounded-full border border-accent/40 px-2.5 py-0.5 text-[12px] text-peri">x402</span>}
            </div>
            <p className="mt-2 text-[14px] text-muted">{ep.what}</p>
            <div className="mt-4">
              {ep.run ? (
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={busy}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-text px-4 text-sm font-medium text-void hover:bg-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Play className="size-4" aria-hidden />}
                  Send
                </button>
              ) : (
                <a href="#try" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-hair px-4 text-sm text-text hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-peri">
                  {ep.path === "/api/events" ? "It powers the live feed below" : "Try it in the playground"} <ArrowRight className="size-4" aria-hidden />
                </a>
              )}
            </div>
            <div className="mt-4 min-h-[260px] flex-1 rounded-2xl border border-hair bg-void p-4" aria-live="polite">
              {out ? (
                <>
                  <p className="mb-3 flex items-center gap-3">
                    <span className={cx("num rounded-md px-2 py-0.5 text-[12px]", out.status >= 200 && out.status < 300 ? "bg-live/15 text-live" : "bg-rose/15 text-rose")}>
                      {out.status ? `HTTP ${out.status}` : "Network error"}
                    </span>
                    <span className="num text-[12px] text-faint">{Math.round(out.ms)} ms</span>
                  </p>
                  <Code code={out.text} lang="json" className="max-h-[380px]" />
                </>
              ) : (
                <Code code={`curl ${GATEWAY}${ep.run ?? ep.path}`} lang="bash" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
