export const GATEWAY = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:4020";

export interface GatewayEvent {
  id: number;
  ts: number;
  type: string;
  pod_id: string | null;
  message: string;
  data: string | null;
}

export interface PodView {
  podId: string;
  status: "starting" | "running" | "expired" | "stopped" | "failed" | "unpaid";
  liumStatus: string | null;
  gpu: string;
  gpuCount: number;
  payer: string | null;
  blocksPaid: number;
  blockPriceUsd: number;
  ssh: { host: string; port: number; user: string } | null;
  createdAt: string;
  readyAt: string | null;
  expiresAt: string | null;
  secondsLeft: number | null;
  removedReason: string | null;
  executorId: string;
  country: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
  liumPricePerHour: number;
  liumSpendUsd: number | null;
  payments: PodPayment[];
}

/** A payment as the gateway reports it on a pod: `amount` is already human-readable. */
export interface PodPayment {
  kind: "rent" | "extend";
  blocks: number;
  amountUsd: number;
  asset: string;
  amount: string;
  network: string;
  txHash: string;
  explorerUrl: string | null;
  status: "settled" | "refunded";
  refundTx: string | null;
}

export interface EngineNodeView {
  id: string;
  gpu: string;
  gpus: number;
  pricePerGpuHour: number;
  country: string | null;
  city: string | null;
  lat: number;
  lon: number;
}

export interface PaymentView {
  id: number;
  pod_id: string;
  kind: "rent" | "extend";
  blocks: number;
  amount_usd: number;
  /** "TAO", or the USDC token contract. */
  asset: string;
  amount_atomic: string;
  payer: string;
  tx_hash: string;
  network: string;
  status: "settled" | "refunded";
  refund_usd: number | null;
  created_at: number;
  explorerUrl: string | null;
  refundUrl: string | null;
}

export interface GatewayState {
  gateway: {
    network: string;
    testnet: boolean;
    payTo: string | null;
    margin: number;
    blockMinutes: number;
    canRent: boolean;
    liumBalanceUsd: number | null;
    facilitator: string;
    tao: { network: string; label: string; payTo: string | null } | null;
  };
  totals: {
    payments: number;
    usdcReceived: number;
    usdcRefunded: number;
    pods: number;
    activePods: number;
    liumSpendUsd: number;
    gpuMinutesRouted: number;
  };
  spendByAgent: { payer: string; pods: number; usd: number }[];
  pods: PodView[];
  payments: PaymentView[];
  events: GatewayEvent[];
  now: string;
}

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

export interface Sn51Stats {
  netuid: number;
  block: number;
  name: string | null;
  uids: number;
  maxUids: number;
  tempo: number;
  blocksSinceLastStep: number | null;
  minersWithIncentive: number;
  validators: number;
  emissionAlphaPerTempo: number;
  taoIn: number;
  alphaIn: number;
  alphaPriceTao: number;
  topMiners: { uid: number; hotkey: string; incentive: number; emissionAlpha: number }[];
  fetchedAt: string;
}

export interface LiumNetwork {
  gpusListed: number;
  gpusRented: number;
  gpuModels: number;
  countries: number;
  providers: number;
  utilisation30d: number;
}

export const short = (s: string | null | undefined, a = 6, b = 4) => (s ? `${s.slice(0, a)}…${s.slice(-b)}` : "—");
export const usd = (n: number | null | undefined, d = 4) => (n == null ? "—" : `$${n.toFixed(d)}`);
export const gpuName = (g: string) => g.replace(/^NVIDIA\s+/, "").replace(/GeForce\s+/, "").replace(/Tesla\s+/, "");
export const clock = (secs: number) => {
  const s = Math.max(0, Math.floor(secs));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
export const networkName = (n: string) =>
  ({ "eip155:84532": "Base Sepolia", "eip155:8453": "Base", "eip155:945": "Bittensor EVM testnet", "eip155:964": "Bittensor EVM" })[n] ?? n;

/** "0.096250 USDC" or "0.000412577 TAO". TAO amounts are wei (18 decimals); USDC has 6. */
export const paidAmount = (asset: string, atomic: string) =>
  asset === "TAO" ? `${(Number(BigInt(atomic) / 1_000_000_000n) / 1e9).toFixed(9)} TAO` : `${(Number(atomic) / 1e6).toFixed(6)} USDC`;

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${GATEWAY}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
