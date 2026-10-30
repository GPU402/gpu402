"use client";

import { ArrowUpRight, Download, KeyRound, Loader2, Minus, Play, Plus, Power, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GATEWAY, gpuName, short, type MarketModel } from "../lib";
import { Code, CopyButton } from "../ui/kit";
import { CountdownRing, cx, useCalmMotion } from "../ui/primitives";
import { canMakeSshKeys, makeSshKeyPair, type SshKeyPair } from "./sshkey";
import { BASE_SEPOLIA, BrowserWallet, USDC_FAUCET, hasWallet, readPaymentRequired } from "./wallet";

const MODES = [
  { id: "price", n: "01", label: "Price a GPU", hint: "GET /quote · free" },
  { id: "challenge", n: "02", label: "Get the 402", hint: "POST /rent · unpaid" },
  { id: "rent", n: "03", label: "Pay and rent", hint: "Your wallet · USDC" },
] as const;
type Mode = (typeof MODES)[number]["id"];

interface Exchange {
  request: string;
  status: number;
  ms: number;
  body: unknown;
  note?: string;
}

const BLOCK_CAP = 1;
const pretty = (v: unknown) => JSON.stringify(v, null, 2);

/** Live, real calls to the gateway, from this page. */
export function Playground({ models }: { models: MarketModel[] | null }) {
  const reduce = useCalmMotion();
  const [mode, setMode] = useState<Mode>("price");
  const [gpu, setGpu] = useState<string | null>(null);
  const [blocks, setBlocks] = useState(1);
  const [busy, setBusy] = useState(false);
  const [ex, setEx] = useState<Partial<Record<Mode, Exchange>>>({});

  // The gateway refuses blocks above MAX_BLOCK_PRICE_USD ($1 by default), so only offer what it will quote.
  const options = useMemo(() => (models ?? []).filter((m) => m.gpusAvailable > 0 && m.blockPriceUsd <= BLOCK_CAP).slice(0, 14), [models]);
  useEffect(() => {
    if (!gpu && options[0]) setGpu(options[0].gpu);
  }, [gpu, options]);
  const model = options.find((m) => m.gpu === gpu);
  const gpuArg = gpu ? gpuName(gpu) : "RTX 4090";

  const run = async (m: Mode) => {
    if (!gpu) return;
    setBusy(true);
    const t0 = performance.now();
    try {
      if (m === "price") {
        const url = `${GATEWAY}/quote?gpu=${encodeURIComponent(gpuArg)}&blocks=${blocks}`;
        const res = await fetch(url);
        const body: unknown = await res.json();
        setEx((x) => ({ ...x, price: { request: `GET /quote?gpu=${gpuArg}&blocks=${blocks}`, status: res.status, ms: performance.now() - t0, body } }));
      } else {
        // A real key, made here, so the gateway's own validation passes and it answers with the price.
        const key = await makeSshKeyPair("gpu402-playground");
        const res = await fetch(`${GATEWAY}/rent`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ gpu: gpuArg, blocks, sshPublicKey: key.publicKey }),
        });
        const offers = readPaymentRequired(res);
        await res.text();
        setEx((x) => ({
          ...x,
          challenge: {
            request: `POST /rent\ncontent-type: application/json\n\n{ "gpu": "${gpuArg}", "blocks": ${blocks}, "sshPublicKey": "ssh-ed25519 AAAA…" }`,
            status: res.status,
            ms: performance.now() - t0,
            body: offers ?? { error: "No PAYMENT-REQUIRED header" },
            note: "Decoded from the PAYMENT-REQUIRED header",
          },
        }));
      }
    } catch (e) {
      setEx((x) => ({ ...x, [m]: { request: m, status: 0, ms: performance.now() - t0, body: { error: (e as Error).message } } }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      {/* The console */}
      <div className="min-w-0 overflow-hidden rounded-3xl border border-hair bg-[#0a0b0e] shadow-[0_60px_160px_-60px_rgba(67,96,255,0.45)]">
        <div role="tablist" aria-label="Playground" className="grid grid-cols-3 border-b border-hair">
          {MODES.map((x) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={mode === x.id}
              onClick={() => setMode(x.id)}
              className={cx(
                "relative grid min-h-16 gap-0.5 px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-peri sm:px-5",
                mode === x.id ? "bg-ink-1 text-text" : "text-muted hover:bg-ink-1/60 hover:text-text",
              )}
            >
              <span className={cx("eyebrow text-[10px]", mode === x.id && "!text-peri")}>{x.n}</span>
              <span className="text-[15px]">{x.label}</span>
              <span className="num hidden truncate text-[11px] text-faint sm:block">{x.hint}</span>
              {mode === x.id && <motion.span layoutId="pg-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }} />}
            </button>
          ))}
        </div>

        {/* Inputs shared by every mode */}
        <div className="flex flex-wrap items-end gap-4 border-b border-hair px-5 py-4">
          <label className="grid min-w-0 flex-1 basis-full gap-1.5 sm:basis-0">
            <span className="eyebrow text-[10px]">GPU · live from Lium</span>
            <select
              value={gpu ?? ""}
              onChange={(e) => setGpu(e.target.value)}
              disabled={!options.length}
              className="min-h-11 w-full rounded-xl border border-hair bg-void px-3 text-[15px] text-text focus-visible:outline-2 focus-visible:outline-peri"
            >
              {!options.length && <option>Loading the market…</option>}
              {options.map((m) => (
                <option key={m.gpu} value={m.gpu}>
                  {gpuName(m.gpu)} · ${m.blockPriceUsd.toFixed(4)} / 15 min · {m.gpusAvailable} free
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-1.5">
            <span className="eyebrow text-[10px]" id="blocks-label">
              Time
            </span>
            <div className="flex items-center rounded-xl border border-hair" role="group" aria-labelledby="blocks-label">
              <button type="button" onClick={() => setBlocks((b) => Math.max(1, b - 1))} className="grid size-11 place-items-center text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-peri" aria-label="Fewer blocks">
                <Minus className="size-4" aria-hidden />
              </button>
              <span className="num w-16 text-center text-[15px]" aria-live="polite">
                {blocks * 15} min
              </span>
              <button type="button" onClick={() => setBlocks((b) => Math.min(4, b + 1))} className="grid size-11 place-items-center text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-peri" aria-label="More blocks">
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
          >
            {mode === "rent" ? (
              <RentFlow gpu={gpuArg} blocks={blocks} priceUsd={model ? model.blockPriceUsd * blocks : null} />
            ) : (
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="max-w-sm text-sm text-muted">
                    {mode === "price"
                      ? "Ask the gateway what this GPU costs right now. Nothing is paid."
                      : "Ask to rent without paying. The gateway answers HTTP 402 with exactly what it accepts."}
                  </p>
                  <button
                    type="button"
                    onClick={() => void run(mode)}
                    disabled={busy || !gpu}
                    className="btn-accent inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri"
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Play className="size-4" aria-hidden />}
                    Send request
                  </button>
                </div>
                <ExchangeView ex={ex[mode]} mode={mode} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CodeTabs gpu={gpuArg} blocks={blocks} />
    </div>
  );
}

function ExchangeView({ ex, mode }: { ex: Exchange | undefined; mode: "price" | "challenge" }) {
  if (!ex) {
    return (
      <div className="mt-5 grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-hair p-6 text-center">
        <p className="text-sm text-faint">The real response appears here.</p>
      </div>
    );
  }
  const ok = ex.status >= 200 && ex.status < 300;
  const is402 = ex.status === 402;
  const offers = mode === "challenge" && is402 ? offersOf(ex.body) : [];
  return (
    <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3" aria-live="polite">
      <div className="rounded-2xl border border-hair bg-void p-4">
        <p className="eyebrow mb-2 text-[10px]">Request</p>
        <Code code={ex.request} lang="http" />
      </div>
      <div className="rounded-2xl border border-hair bg-void p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span
            className={cx(
              "num rounded-md px-2 py-0.5 text-[13px]",
              ok ? "bg-live/15 text-live" : is402 ? "bg-accent/20 text-peri" : "bg-rose/15 text-rose",
            )}
          >
            {ex.status === 0 ? "Network error" : `HTTP ${ex.status}${is402 ? " Payment Required" : ok ? " OK" : ""}`}
          </span>
          <span className="num text-[12px] text-faint">{Math.round(ex.ms)} ms</span>
          {ex.note && <span className="text-[12px] text-faint">{ex.note}</span>}
        </div>
        {offers.length > 0 && (
          <ul className="mb-4 grid gap-2 sm:grid-cols-2">
            {offers.map((o) => (
              <li key={o.network} className="rounded-xl border border-hair bg-ink-1 p-3">
                <p className={cx("num text-lg", o.tao ? "text-tao" : "text-usdc")}>{o.amount}</p>
                <p className="mt-0.5 text-[12px] text-muted">{o.label}</p>
              </li>
            ))}
          </ul>
        )}
        <Code code={pretty(ex.body)} lang="json" className="max-h-[320px]" />
      </div>
    </div>
  );
}

/** The offers inside a decoded PAYMENT-REQUIRED header, in plain units. */
function offersOf(body: unknown) {
  const accepts = (body as { accepts?: { scheme: string; network: string; amount: string; asset: string }[] })?.accepts ?? [];
  return accepts.map((a) => {
    const tao = a.asset === "TAO";
    return {
      network: a.network,
      tao,
      amount: tao ? `${(Number(BigInt(a.amount) / 1_000_000_000n) / 1e9).toFixed(9)} TAO` : `${(Number(a.amount) / 1e6).toFixed(6)} USDC`,
      label: tao ? "Native TAO on Bittensor EVM testnet" : "USDC on Base Sepolia, signed, no gas",
    };
  });
}

// --------------------------------------------------------------- pay and rent

type Pod = {
  podId: string;
  status: string;
  liumStatus: string | null;
  ssh: { host: string; port: number; user: string; command: string } | null;
  expiresAt: string | null;
  blocksPaid: number;
};

function RentFlow({ gpu, blocks, priceUsd }: { gpu: string; blocks: number; priceUsd: number | null }) {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [key, setKey] = useState<SshKeyPair | null>(null);
  const [pod, setPod] = useState<Pod | null>(null);
  const [tx, setTx] = useState<string | null>(null);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const polling = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const connect = async () => {
    setError(null);
    try {
      const w = await BrowserWallet.connect();
      setWallet(w);
      setBalance(await w.usdcBalance().catch(() => null));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const makeKey = async () => {
    setError(null);
    try {
      setKey(await makeSshKeyPair());
    } catch {
      setError("This browser cannot make Ed25519 keys. Use a recent Chrome, Safari or Firefox.");
    }
  };

  const poll = async (w: BrowserWallet, podId: string) => {
    if (polling.current) return;
    polling.current = true;
    setStep("Signing once to read your pod (no gas)…");
    try {
      for (let i = 0; i < 120; i++) {
        const res = await fetch(`${GATEWAY}/pods/${podId}`, { headers: await w.ownership(podId) });
        const s = (await res.json()) as Pod & { message?: string };
        if (!res.ok) throw new Error(s.message ?? `HTTP ${res.status}`);
        setPod(s);
        setStep(s.status === "starting" ? `Lium is starting the pod${s.liumStatus ? ` (${s.liumStatus.toLowerCase()})` : ""}…` : null);
        if (s.status !== "starting") break;
        await new Promise((r) => setTimeout(r, 4000));
      }
    } catch (e) {
      setError((e as Error).message);
      setStep(null);
    } finally {
      polling.current = false;
    }
  };

  const rent = async () => {
    if (!wallet || !key) return;
    setError(null);
    setStep("Approve the USDC signature in your wallet…");
    try {
      const r = await wallet.call<Pod & { message?: string }>(wallet.paidFetch(1), `${GATEWAY}/rent`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gpu, blocks, sshPublicKey: key.publicKey }),
      });
      if (r.status >= 400) throw new Error(r.body.message ?? `The gateway answered HTTP ${r.status}`);
      setTx(r.payment?.txHash ?? null);
      setPod(r.body);
      setBalance(await wallet.usdcBalance().catch(() => balance));
      void poll(wallet, r.body.podId);
    } catch (e) {
      setError((e as Error).message.replace(/^Error: /, ""));
      setStep(null);
    }
  };

  const stop = async () => {
    if (!wallet || !pod) return;
    setError(null);
    try {
      const res = await fetch(`${GATEWAY}/pods/${pod.podId}`, { method: "DELETE", headers: await wallet.ownership(pod.podId) });
      const s = (await res.json()) as Pod & { message?: string };
      if (!res.ok) throw new Error(s.message ?? `HTTP ${res.status}`);
      setPod(s);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const download = () => {
    if (!key) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([key.privateKey], { type: "text/plain" }));
    a.download = "gpu402_ed25519";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const left = pod?.status === "running" && pod.expiresAt ? Math.max(0, (Date.parse(pod.expiresAt) - now) / 1000) : null;
  const short402 = priceUsd != null ? `$${priceUsd.toFixed(4)}` : "the quoted price";
  const lacking = balance !== null && priceUsd !== null && balance < priceUsd;

  return (
    <div className="grid gap-3 p-5">
      <p className="text-sm text-muted">
        A real rental, paid from your own wallet in USDC on Base Sepolia. You sign once; the facilitator pays the gas. The GPU is yours over SSH for {blocks * 15} minutes.
      </p>

      <FlowStep n={1} done={Boolean(wallet)} title="Connect a wallet">
        {wallet ? (
          <p className="num text-[13px] text-muted">
            {short(wallet.address, 8, 6)} · {balance === null ? "…" : `${balance.toFixed(4)} USDC`}
            {lacking && (
              <a href={USDC_FAUCET} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-0.5 text-peri hover:underline">
                Get test USDC <ArrowUpRight className="size-3" aria-hidden />
              </a>
            )}
          </p>
        ) : (
          <button type="button" onClick={() => void connect()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-text px-4 text-sm font-medium text-void hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri">
            <Wallet className="size-4" aria-hidden /> {hasWallet() ? "Connect wallet" : "Connect wallet (none found)"}
          </button>
        )}
      </FlowStep>

      <FlowStep n={2} done={Boolean(key)} title="Make an SSH key in this browser">
        {key ? (
          <div className="flex w-full flex-wrap items-center gap-2">
            <p className="num min-w-0 flex-1 truncate text-[12px] text-faint">{key.publicKey}</p>
            <button type="button" onClick={download} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-[13px] text-peri hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-peri">
              <Download className="size-3.5" aria-hidden /> Private key
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void makeKey()}
            disabled={!canMakeSshKeys()}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-hair px-4 text-sm text-text hover:bg-ink-2 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-peri"
          >
            <KeyRound className="size-4" aria-hidden /> Generate Ed25519 key
          </button>
        )}
      </FlowStep>

      <FlowStep n={3} done={Boolean(pod)} title={`Pay ${short402} and rent ${gpu}`}>
        {!pod ? (
          <button
            type="button"
            onClick={() => void rent()}
            disabled={!wallet || !key || Boolean(step)}
            className="btn-accent inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-medium disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peri"
          >
            {step ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Play className="size-4" aria-hidden />}
            Pay and rent
          </button>
        ) : (
          <div className="grid w-full gap-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
              <span className="num text-muted">pod {pod.podId.slice(0, 8)}</span>
              <span className={cx("num", pod.status === "running" ? "text-live" : pod.status === "starting" ? "text-amber" : "text-muted")}>{pod.status}</span>
              {tx && (
                <a href={`https://sepolia.basescan.org/tx/${tx}`} target="_blank" rel="noreferrer" className="num inline-flex items-center gap-0.5 text-peri hover:underline">
                  {short(tx, 8, 6)} <ArrowUpRight className="size-3" aria-hidden />
                </a>
              )}
            </div>
            {pod.ssh && pod.status === "running" && (
              <div className="flex items-center gap-4 rounded-xl border border-hair bg-void p-3">
                {left !== null && <CountdownRing left={left} total={pod.blocksPaid * 900} size={52} />}
                <div className="min-w-0 flex-1">
                  <p className="eyebrow text-[10px]">Your GPU</p>
                  <p className="num mt-1 truncate text-[13px] text-text">{`ssh -i gpu402_ed25519 -p ${pod.ssh.port} ${pod.ssh.user}@${pod.ssh.host}`}</p>
                </div>
                <CopyButton text={`chmod 600 gpu402_ed25519 && ssh -i gpu402_ed25519 -p ${pod.ssh.port} ${pod.ssh.user}@${pod.ssh.host}`} label="Copy" />
              </div>
            )}
            {(pod.status === "running" || pod.status === "starting") && (
              <button type="button" onClick={() => void stop()} className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-hair px-4 text-sm text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-peri">
                <Power className="size-4" aria-hidden /> Release the GPU
              </button>
            )}
          </div>
        )}
      </FlowStep>

      <div aria-live="polite" className="min-h-6 text-[13px]">
        {step && (
          <p className="flex items-center gap-2 text-muted">
            <Loader2 className="size-3.5 animate-spin" aria-hidden /> {step}
          </p>
        )}
        {error && <p className="text-rose">{error}</p>}
      </div>
      <p className="text-[12px] text-faint">
        Testnet only ({BASE_SEPOLIA}). The gateway pays Lium real money for your GPU; please release it when you are done.
      </p>
    </div>
  );
}

function FlowStep({ n, title, done, children }: { n: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-hair bg-ink-1 p-4">
      <span className={cx("num grid size-7 shrink-0 place-items-center rounded-full text-[12px]", done ? "bg-live/15 text-live" : "bg-ink-2 text-muted")}>{done ? "✓" : n}</span>
      <div className="grid min-w-0 flex-1 justify-items-start gap-2.5 [&>*]:max-w-full">
        <p className="text-[15px] text-text">{title}</p>
        {children}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- code

function CodeTabs({ gpu, blocks }: { gpu: string; blocks: number }) {
  const [tab, setTab] = useState(0);
  const snippets = [
    {
      label: "SDK",
      file: "rent.ts",
      lang: "ts" as const,
      code: `import { Gpu402Gateway } from "@gpu402/tools";

const gw = new Gpu402Gateway({
  url: "${GATEWAY}",
  wallet: process.env.AGENT_PRIVATE_KEY, // USDC, no gas
  payWith: "usdc", // or "tao"
});

const quote = await gw.quote({ gpu: "${gpu}", blocks: ${blocks} });
const { data: pod, payment } = await gw.rent({
  gpu: "${gpu}", blocks: ${blocks},
  sshPublicKey, // your OpenSSH public key
});
const ready = await gw.waitReady(pod.podId);
console.log(ready.ssh.command, payment.txHash);`,
    },
    {
      label: "AI agent",
      file: "agent.ts",
      lang: "ts" as const,
      code: `import { createGpuTools } from "@gpu402/tools/ai";
import { generateText, stepCountIs } from "ai";

const { tools, toolkit } = createGpuTools({
  mode: "x402",
  gatewayUrl: "${GATEWAY}",
  wallet: process.env.AGENT_PRIVATE_KEY,
  maxUsdPerPayment: 1,
});

await generateText({
  model, tools, stopWhen: stepCountIs(12),
  prompt: "Benchmark matmul on an ${gpu}",
});
await toolkit.stopAll();`,
    },
    {
      label: "curl",
      file: "shell",
      lang: "bash" as const,
      code: `# Free: the live price
curl "${GATEWAY}/quote?gpu=${encodeURIComponent(gpu)}&blocks=${blocks}"

# Unpaid: the 402 and what it accepts
curl -i -X POST ${GATEWAY}/rent \\
  -H "content-type: application/json" \\
  -d '{"gpu":"${gpu}","blocks":${blocks},"sshPublicKey":"ssh-ed25519 AAAA…"}'

# Paid: retry with a PAYMENT-SIGNATURE header
# (any x402 client does this for you)`,
    },
  ];
  const s = snippets[tab]!;
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-hair bg-[#0a0b0e]">
      <div className="flex items-center gap-1 border-b border-hair px-3 py-2" role="tablist" aria-label="Code">
        {snippets.map((x, i) => (
          <button
            key={x.label}
            role="tab"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={cx("min-h-9 rounded-lg px-3 text-[13px] transition-colors duration-100 focus-visible:outline-2 focus-visible:outline-peri", tab === i ? "bg-ink-2 text-text" : "text-muted hover:text-text")}
          >
            {x.label}
          </button>
        ))}
        <span className="num ml-auto hidden text-[12px] text-faint sm:block">{s.file}</span>
        <CopyButton text={s.code} />
      </div>
      <Code code={s.code} lang={s.lang} className="flex-1 p-5" />
      <p className="border-t border-hair px-5 py-3 text-[12px] text-faint">Updates as you pick a GPU and time on the left.</p>
    </div>
  );
}
