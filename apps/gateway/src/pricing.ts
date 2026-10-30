import { BLOCK_MINUTES, normalizeGpuName, type Gpu, type Lium } from "gpu402";
import { z } from "zod";
import type { Config } from "./config.js";

export const RentRequest = z.object({
  /** GPU model, e.g. "RTX 4090", "RTX4090", "H100". */
  gpu: z.string().min(2).max(64),
  gpuCount: z.number().int().min(1).default(1),
  /** Prepaid 15-minute blocks. */
  blocks: z.number().int().min(1).default(1),
  /** Agent's SSH public key. The gateway never sees the private key. */
  sshPublicKey: z
    .string()
    .max(4096)
    .regex(/^(ssh-ed25519|ssh-rsa|ecdsa-sha2-nistp(256|384|521)) [A-Za-z0-9+/=]+( .*)?$/, "must be an OpenSSH public key"),
  /** Refuse if the GPU402 price per GPU-hour is above this. */
  maxUsdPerGpuHour: z.number().positive().optional(),
});
export type RentRequest = z.infer<typeof RentRequest>;

export const ExtendRequest = z.object({ blocks: z.number().int().min(1).default(1) });

export interface MarketModel {
  gpu: string;
  nodes: number;
  gpusAvailable: number;
  liumPricePerGpuHour: number;
  pricePerGpuHour: number;
  blockPriceUsd: number;
  vramGb: number | null;
  countries: string[];
}

export interface GatewayQuote {
  key: string;
  gpu: string;
  gpuCount: number;
  blocks: number;
  minutes: number;
  /** Cheapest matching Lium node right now, per GPU-hour. The rent never pays Lium more. */
  liumPricePerGpuHour: number;
  liumPricePerHour: number;
  /** GPU402 price of one 15-minute block for this pod. */
  blockPriceUsd: number;
  totalUsd: number;
  /** x402 money string, e.g. "$0.090750". */
  price: string;
  nodesAvailable: number;
  quotedAt: number;
  validUntil: number;
}

/** USDC has 6 decimals: work in integer micro-dollars and round up so we never undercharge. */
export const toMicros = (usd: number) => Math.ceil(usd * 1e6 - 1e-6);
export const fromMicros = (m: number) => m / 1e6;
export const money = (usd: number) => `$${usd.toFixed(6)}`;

export function blockPriceMicros(liumPricePerHour: number, margin: number): number {
  return toMicros(((liumPricePerHour * BLOCK_MINUTES) / 60) * (1 + margin));
}

export class Pricing {
  private market: { at: number; gpus: Gpu[] } | undefined;
  private inflight: Promise<Gpu[]> | undefined;
  private readonly locks = new Map<string, GatewayQuote>();

  constructor(
    private readonly lium: Lium,
    private readonly cfg: Config,
  ) {}

  /** Rentable nodes the gateway is willing to sell, refreshed at most every 30 s. */
  async gpus(force = false): Promise<Gpu[]> {
    if (!force && this.market && Date.now() - this.market.at < 30_000) return this.market.gpus;
    this.inflight ??= this.lium
      .listGpus({ gpu: this.cfg.allowedGpus.length ? this.cfg.allowedGpus : undefined, secureOnly: this.cfg.SECURE_ONLY })
      .then((gpus) => {
        this.market = { at: Date.now(), gpus };
        return gpus;
      })
      .finally(() => (this.inflight = undefined));
    return this.inflight;
  }

  async models(): Promise<MarketModel[]> {
    const byModel = new Map<string, Gpu[]>();
    for (const g of await this.gpus()) byModel.set(g.gpu, [...(byModel.get(g.gpu) ?? []), g]);
    return [...byModel.entries()]
      .map(([gpu, nodes]) => {
        const cheapest = nodes[0]!;
        const block = fromMicros(blockPriceMicros(cheapest.pricePerGpuHour, this.cfg.MARGIN));
        return {
          gpu,
          nodes: nodes.length,
          gpusAvailable: nodes.reduce((s, n) => s + n.availableGpuCount, 0),
          liumPricePerGpuHour: cheapest.pricePerGpuHour,
          pricePerGpuHour: block * 4,
          blockPriceUsd: block,
          vramGb: cheapest.vramGb,
          countries: [...new Set(nodes.map((n) => n.country).filter((c): c is string => Boolean(c)))].slice(0, 6),
        };
      })
      .sort((a, b) => a.blockPriceUsd - b.blockPriceUsd);
  }

  private keyOf(r: Pick<RentRequest, "gpu" | "gpuCount" | "blocks" | "maxUsdPerGpuHour">) {
    return JSON.stringify([normalizeGpuName(r.gpu), r.gpuCount, r.blocks, r.maxUsdPerGpuHour ?? null]);
  }

  /**
   * The price for a rent request. The first call fixes the price for
   * QUOTE_TTL_SEC, so the 402 an agent sees and the price checked when it
   * retries with payment are identical even if Lium's market moves.
   */
  async quote(r: Pick<RentRequest, "gpu" | "gpuCount" | "blocks" | "maxUsdPerGpuHour">): Promise<GatewayQuote> {
    const key = this.keyOf(r);
    const now = Date.now();
    const locked = this.locks.get(key);
    if (locked && locked.validUntil > now) return locked;

    const q = normalizeGpuName(r.gpu);
    const match = (await this.gpus())
      .filter((g) => normalizeGpuName(g.gpu).includes(q) && g.availableGpuCount >= r.gpuCount && g.minGpuCount <= r.gpuCount)
      .filter((g) => r.maxUsdPerGpuHour === undefined || fromMicros(blockPriceMicros(g.pricePerGpuHour, this.cfg.MARGIN)) * 4 <= r.maxUsdPerGpuHour);
    const best = match[0];
    if (!best) throw new QuoteError(`No rentable ${r.gpu} node${r.maxUsdPerGpuHour ? ` under $${r.maxUsdPerGpuHour}/GPU-hour` : ""} right now. GET /gpus lists what is available.`);

    const liumPricePerHour = best.pricePerGpuHour * r.gpuCount;
    const blockMicros = blockPriceMicros(liumPricePerHour, this.cfg.MARGIN);
    const totalMicros = blockMicros * r.blocks;
    if (fromMicros(blockMicros) > this.cfg.MAX_BLOCK_PRICE_USD) {
      throw new QuoteError(`A ${best.gpu} block costs $${fromMicros(blockMicros).toFixed(4)}, above this gateway's $${this.cfg.MAX_BLOCK_PRICE_USD} per-block cap.`);
    }
    const quote: GatewayQuote = {
      key,
      gpu: best.gpu,
      gpuCount: r.gpuCount,
      blocks: r.blocks,
      minutes: r.blocks * BLOCK_MINUTES,
      liumPricePerGpuHour: best.pricePerGpuHour,
      liumPricePerHour,
      blockPriceUsd: fromMicros(blockMicros),
      totalUsd: fromMicros(totalMicros),
      price: money(fromMicros(totalMicros)),
      nodesAvailable: match.length,
      quotedAt: now,
      validUntil: now + this.cfg.QUOTE_TTL_SEC * 1000,
    };
    this.locks.set(key, quote);
    for (const [k, v] of this.locks) if (v.validUntil <= now) this.locks.delete(k);
    return quote;
  }

  /** Forget a locked quote, e.g. after the rent it priced succeeded. */
  release(key: string) {
    this.locks.delete(key);
  }
}

export class QuoteError extends Error {
  override name = "QuoteError";
}
