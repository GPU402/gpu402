import { ApiPromise, WsProvider } from "@polkadot/api";

/**
 * Reads Lium's subnet state straight from the Bittensor chain (subtensor
 * storage over WebSocket): miners, validators, emissions, pool and price.
 * Read-only: GPU402 runs no miner or validator.
 */

export interface Sn51Stats {
  netuid: number;
  block: number;
  name: string | null;
  url: string | null;
  owner: string | null;
  uids: number;
  maxUids: number;
  tempo: number;
  blocksSinceLastStep: number | null;
  minersWithIncentive: number;
  validators: number;
  /** Alpha emitted to the subnet's neurons per tempo (sum of per-UID emission). */
  emissionAlphaPerTempo: number;
  /** TAO in the subnet's pool. */
  taoIn: number;
  alphaIn: number;
  alphaOut: number;
  /** Spot price, TAO per alpha (taoIn / alphaIn). */
  alphaPriceTao: number;
  topMiners: { uid: number; hotkey: string; incentive: number; emissionAlpha: number }[];
  fetchedAt: string;
}

const RAO = 1e9;
const U16 = 65_535;
const num = (v: { toString(): string } | null | undefined) => Number(v?.toString() ?? 0);
const text = (v: unknown) => {
  if (v == null) return null;
  const s = typeof v === "string" ? v : String(v);
  return s.startsWith("0x") ? Buffer.from(s.slice(2), "hex").toString("utf8") || null : s || null;
};

export class ChainReader {
  private api: Promise<ApiPromise> | undefined;
  private cache: { at: number; stats: Sn51Stats } | undefined;
  private inflight: Promise<Sn51Stats> | undefined;

  constructor(
    private readonly ws: string,
    private readonly netuid: number,
    private readonly ttlMs = 60_000,
  ) {}

  private connect(): Promise<ApiPromise> {
    this.api ??= ApiPromise.create({ provider: new WsProvider(this.ws, 5_000), noInitWarn: true, throwOnConnect: true }).catch(
      (err) => {
        this.api = undefined;
        throw err;
      },
    );
    return this.api;
  }

  async stats(): Promise<Sn51Stats> {
    if (this.cache && Date.now() - this.cache.at < this.ttlMs) return this.cache.stats;
    this.inflight ??= this.read()
      .then((stats) => {
        this.cache = { at: Date.now(), stats };
        return stats;
      })
      .finally(() => (this.inflight = undefined));
    try {
      return await this.inflight;
    } catch (err) {
      if (this.cache) return this.cache.stats; // serve the last good read if the RPC hiccups
      throw err;
    }
  }

  private async read(): Promise<Sn51Stats> {
    const api = await this.connect();
    const st = api.query.subtensorModule!;
    const n = this.netuid;
    const [header, uids, maxUids, tempo, since, taoIn, alphaIn, alphaOut, owner, identity, emission, incentive, permits, keys] =
      await Promise.all([
        api.rpc.chain.getHeader(),
        st.subnetworkN!(n),
        st.maxAllowedUids!(n),
        st.tempo!(n),
        st.blocksSinceLastStep ? st.blocksSinceLastStep(n) : Promise.resolve(null),
        st.subnetTAO!(n),
        st.subnetAlphaIn!(n),
        st.subnetAlphaOut!(n),
        st.subnetOwner!(n),
        st.subnetIdentitiesV3 ? st.subnetIdentitiesV3(n) : Promise.resolve(null),
        st.emission!(n),
        st.incentive!(n),
        st.validatorPermit ? st.validatorPermit(n) : Promise.resolve(null),
        st.keys!.entries(n),
      ]);

    const em = (emission.toJSON() as (number | string)[]).map(Number);
    const inc = (incentive.toJSON() as number[]).map(Number);
    const perm = (permits?.toJSON() as boolean[] | null) ?? [];
    const hotkeys = new Map<number, string>();
    for (const [k, v] of keys) hotkeys.set(num(k.args[1] as never), v.toString());

    const id = (identity?.toJSON() ?? null) as { subnetName?: string; subnetUrl?: string } | null;
    const tao = num(taoIn) / RAO;
    const aIn = num(alphaIn) / RAO;
    const topMiners = inc
      .map((v, uid) => ({ uid, hotkey: hotkeys.get(uid) ?? "", incentive: v / U16, emissionAlpha: (em[uid] ?? 0) / RAO }))
      .filter((m) => m.incentive > 0)
      .sort((a, b) => b.incentive - a.incentive)
      .slice(0, 8);

    return {
      netuid: n,
      block: header.number.toNumber(),
      name: text(id?.subnetName),
      url: text(id?.subnetUrl),
      owner: owner?.toString() ?? null,
      uids: num(uids),
      maxUids: num(maxUids),
      tempo: num(tempo),
      blocksSinceLastStep: since == null ? null : num(since),
      minersWithIncentive: inc.filter((v) => v > 0).length,
      validators: perm.filter(Boolean).length,
      emissionAlphaPerTempo: em.reduce((s, v) => s + v, 0) / RAO,
      taoIn: tao,
      alphaIn: aIn,
      alphaOut: num(alphaOut) / RAO,
      alphaPriceTao: aIn > 0 ? tao / aIn : 0,
      topMiners,
      fetchedAt: new Date().toISOString(),
    };
  }

  async close() {
    if (this.api) await (await this.api).disconnect().catch(() => {});
  }
}

export interface LiumNetworkStats {
  gpusListed: number;
  gpusRented: number;
  gpuModels: number;
  countries: number;
  providers: number;
  utilisation30d: number;
  fetchedAt: string;
}

/** Lium's public network stats feed (https://lium.io/api/public/v1/stats), cached for a minute. */
export function liumStatsReader(baseUrl: string) {
  let cache: { at: number; data: LiumNetworkStats } | undefined;
  return async (): Promise<LiumNetworkStats | null> => {
    if (cache && Date.now() - cache.at < 60_000) return cache.data;
    try {
      const res = await fetch(`${baseUrl.replace(/\/api$/, "")}/api/public/v1/stats`, { signal: AbortSignal.timeout(8_000) });
      if (!res.ok) return cache?.data ?? null;
      const j = (await res.json()) as { generated_at: string; fleet: Record<string, number> };
      const data = {
        gpusListed: j.fleet.gpus_listed ?? 0,
        gpusRented: j.fleet.gpus_rented ?? 0,
        gpuModels: j.fleet.gpu_models ?? 0,
        countries: j.fleet.countries ?? 0,
        providers: j.fleet.providers ?? 0,
        utilisation30d: j.fleet.utilisation_30d ?? 0,
        fetchedAt: j.generated_at,
      };
      cache = { at: Date.now(), data };
      return data;
    } catch {
      return cache?.data ?? null;
    }
  };
}
