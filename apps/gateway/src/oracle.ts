/**
 * TAO/USD rate for pricing GPU blocks in TAO. Lium prices in USD, so a TAO
 * payment is the USD price converted at the median of several public
 * exchange feeds, which one bad or missing source cannot move.
 */

interface Source {
  name: string;
  url: string;
  read: (json: unknown) => number;
}

const SOURCES: Source[] = [
  { name: "coinbase", url: "https://api.coinbase.com/v2/prices/TAO-USD/spot", read: (j) => Number((j as { data: { amount: string } }).data.amount) },
  { name: "kraken", url: "https://api.kraken.com/0/public/Ticker?pair=TAOUSD", read: (j) => Number(Object.values((j as { result: Record<string, { c: string[] }> }).result)[0]!.c[0]) },
  { name: "binance", url: "https://api.binance.com/api/v3/ticker/price?symbol=TAOUSDT", read: (j) => Number((j as { price: string }).price) },
  { name: "coingecko", url: "https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd", read: (j) => Number((j as { bittensor: { usd: number } }).bittensor.usd) },
];

export interface TaoRate {
  usdPerTao: number;
  sources: Record<string, number>;
  at: number;
}

export class TaoPriceOracle {
  private last: TaoRate | undefined;
  private inflight: Promise<TaoRate> | undefined;

  constructor(
    private readonly opts: { maxAgeMs?: number; staleOkMs?: number; minSources?: number; fetch?: typeof fetch } = {},
  ) {}

  /** Current rate; refreshed at most once a minute. Falls back to a rate up to an hour old if every feed is down. */
  async rate(): Promise<TaoRate> {
    const now = Date.now();
    if (this.last && now - this.last.at < (this.opts.maxAgeMs ?? 60_000)) return this.last;
    this.inflight ??= this.refresh().finally(() => (this.inflight = undefined));
    try {
      return await this.inflight;
    } catch (err) {
      if (this.last && now - this.last.at < (this.opts.staleOkMs ?? 3_600_000)) return this.last;
      throw err;
    }
  }

  private async refresh(): Promise<TaoRate> {
    const f = this.opts.fetch ?? globalThis.fetch;
    const results = await Promise.allSettled(
      SOURCES.map(async (s) => {
        const res = await f(s.url, { signal: AbortSignal.timeout(6_000) });
        if (!res.ok) throw new Error(`${s.name}: HTTP ${res.status}`);
        const v = s.read(await res.json());
        if (!(v > 0)) throw new Error(`${s.name}: bad value`);
        return [s.name, v] as const;
      }),
    );
    const ok = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    if (ok.length < (this.opts.minSources ?? 2)) throw new Error(`Only ${ok.length} TAO/USD feed(s) answered`);
    const sorted = ok.map(([, v]) => v).sort((a, b) => a - b);
    const mid = sorted.length / 2;
    const usdPerTao = sorted.length % 2 ? sorted[Math.floor(mid)]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
    this.last = { usdPerTao, sources: Object.fromEntries(ok), at: Date.now() };
    return this.last;
  }
}
