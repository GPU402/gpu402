"use client";

import { ArrowUpRight, Boxes, Bot, Server } from "lucide-react";
import { useEffect, useState } from "react";
import { InstallChip, Reveal, Spotlight } from "./kit";
import { Skeleton, cx } from "./primitives";

interface NpmInfo {
  version: string;
  description: string;
  license: string;
  size: number;
  files: number;
  published: string | null;
  downloads: number | null;
}

/** Live facts about a package from the npm registry. */
function useNpm(name: string) {
  const [info, setInfo] = useState<NpmInfo | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const enc = name.replace("/", "%2f");
    Promise.all([
      fetch(`https://registry.npmjs.org/${enc}`).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(`https://api.npmjs.org/downloads/point/last-month/${name}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
      .then(([doc, dl]) => {
        const v = doc["dist-tags"].latest as string;
        const latest = doc.versions[v];
        setInfo({
          version: v,
          description: latest.description,
          license: latest.license,
          size: latest.dist.unpackedSize,
          files: latest.dist.fileCount,
          published: doc.time?.[v] ?? null,
          downloads: typeof dl?.downloads === "number" ? dl.downloads : null,
        });
      })
      .catch(() => setError(true));
  }, [name]);
  return { info, error };
}

const PACKAGES = [
  {
    name: "gpu402",
    icon: Boxes,
    role: "The SDK",
    install: "npm i gpu402",
    pitch: "Rent the cheapest Lium GPU, run a job over SSH, stop it. Inside a budget.",
    entries: [
      ["gpu402", "Lium client: listGpus, quote, rentCheapest, waitReady, exec, stop"],
      ["gpu402/openapi", "Every Lium endpoint, typed from its OpenAPI spec"],
    ],
  },
  {
    name: "@gpu402/tools",
    icon: Bot,
    role: "Tools for agents",
    install: "npm i @gpu402/tools",
    pitch: "Four tools and a wallet. Your agent rents, runs and pays per use.",
    entries: [
      ["@gpu402/tools/ai", "Vercel AI SDK tools"],
      ["@gpu402/tools/langchain", "LangChain.js tools"],
      ["@gpu402/tools", "Gpu402Gateway, the x402 client"],
      ["@gpu402/tools/tao", "Pay in TAO on Bittensor EVM"],
    ],
  },
] as const;

export function Packages() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {PACKAGES.map((p, i) => (
        <Reveal key={p.name} delay={i * 0.08} className="lg:row-span-1">
          <PackageCard p={p} />
        </Reveal>
      ))}
      <Reveal delay={0.16}>
        <Spotlight as="article" className="flex h-full flex-col p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-ink-2 text-peri">
              <Server className="size-5" aria-hidden />
            </span>
            <div>
              <p className="eyebrow text-[10px]">Self-host</p>
              <h3 className="text-xl font-light tracking-tight">The gateway</h3>
            </div>
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">
            The x402 server behind this page. Run your own with a Lium key and a payout address.
          </p>
          <ul className="mt-5 grid gap-2 text-[14px] text-muted">
            {["Takes USDC or TAO", "Refunds failed rentals", "Removes pods when paid time ends"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-peri" aria-hidden /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-6">
            <InstallChip cmd="pnpm gateway" />
          </div>
        </Spotlight>
      </Reveal>
    </div>
  );
}

function PackageCard({ p }: { p: (typeof PACKAGES)[number] }) {
  const { info, error } = useNpm(p.name);
  const Icon = p.icon;
  return (
    <Spotlight as="article" className="flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-accent/15 text-peri">
            <Icon className="size-5" aria-hidden />
          </span>
          <div>
            <p className="eyebrow text-[10px]">{p.role}</p>
            <h3 className="num text-xl tracking-tight">{p.name}</h3>
          </div>
        </div>
        <a
          href={`https://www.npmjs.com/package/${p.name}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center gap-1 rounded-full border border-hair px-3 text-[12px] text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-peri"
        >
          npm <ArrowUpRight className="size-3" aria-hidden />
        </a>
      </div>

      <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px]">
        {info ? (
          <>
            <Fact k="Version" v={`v${info.version}`} tone="text-live" />
            <Fact k="License" v={info.license} />
            <Fact k="Unpacked" v={`${(info.size / 1024).toFixed(0)} KB`} />
            {info.published && <Fact k="Published" v={new Date(info.published).toLocaleDateString(undefined, { day: "numeric", month: "short" })} />}
            {info.downloads !== null && <Fact k="Downloads, 30 d" v={info.downloads.toLocaleString()} />}
          </>
        ) : error ? (
          <p className="text-faint">npm is not reachable right now.</p>
        ) : (
          <Skeleton className="h-8 w-56" />
        )}
      </dl>

      <p className="mt-6 text-[15px] leading-relaxed text-muted">{p.pitch}</p>

      <ul className="mt-5 grid gap-px overflow-hidden rounded-xl border border-hair bg-hair">
        {p.entries.map(([path, what]) => (
          <li key={path} className="grid gap-0.5 bg-[#0a0b0e] px-3.5 py-2.5">
            <span className="num text-[12px] text-peri">{path}</span>
            <span className="text-[13px] text-muted">{what}</span>
          </li>
        ))}
      </ul>


      <div className="mt-auto pt-6">
        <InstallChip cmd={p.install} />
      </div>
    </Spotlight>
  );
}

function Fact({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div>
      <dt className="eyebrow text-[9px]">{k}</dt>
      <dd className={cx("num mt-0.5 text-[13px] text-text", tone)}>{v}</dd>
    </div>
  );
}
