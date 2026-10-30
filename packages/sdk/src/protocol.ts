/**
 * Wire types of the GPU402 x402 gateway, shared by the gateway and the agent tools.
 */

export const OWNERSHIP_HEADERS = {
  timestamp: "X-GPU402-Timestamp",
  signature: "X-GPU402-Signature",
} as const;

/** How long a signed ownership proof stays valid. */
export const OWNERSHIP_WINDOW_SEC = 300;

/**
 * The message the paying wallet signs (EIP-191 personal_sign) to prove it
 * owns a pod. Bound to one pod id and a unix timestamp, so it cannot be
 * replayed for another pod or after five minutes.
 */
export function ownershipMessage(podId: string, timestamp: number): string {
  return `GPU402 pod access\npod: ${podId}\ntimestamp: ${timestamp}`;
}

export interface GatewayRentRequest {
  gpu: string;
  gpuCount?: number;
  blocks?: number;
  sshPublicKey: string;
  maxUsdPerGpuHour?: number;
}

export interface GatewayPayment {
  kind: "rent" | "extend";
  blocks: number;
  amountUsd: number;
  /** "TAO", or the token contract for USDC. */
  asset: string;
  /** Human amount in the asset paid, e.g. "0.096250" USDC or "0.000412577" TAO. */
  amount: string;
  network: string;
  txHash: string;
  /** Null on networks with no public explorer (Bittensor EVM testnet). */
  explorerUrl: string | null;
  status: "settled" | "refunded";
  refundTx: string | null;
}

export interface GatewayPodStatus {
  podId: string;
  status: "starting" | "running" | "expired" | "stopped" | "failed" | "unpaid";
  liumStatus: string | null;
  gpu: string;
  gpuCount: number;
  payer: string | null;
  blocksPaid: number;
  blockPriceUsd: number;
  ssh: { host: string; port: number; user: string; command: string } | null;
  createdAt: string;
  readyAt: string | null;
  /** Paid time runs from readyAt; the sweeper removes the pod at expiresAt. */
  expiresAt: string | null;
  secondsLeft: number | null;
  removedReason: string | null;
  payments: GatewayPayment[];
  links: { self: string; extend: string };
}

export interface GatewayRentResponse extends GatewayPodStatus {
  quote: { totalUsd: number; blockPriceUsd: number; liumPricePerHour: number; minutes: number };
}

export interface GatewayQuoteResponse {
  gpu: string;
  gpuCount: number;
  blocks: number;
  minutes: number;
  blockPriceUsd: number;
  totalUsd: number;
  price: string;
  liumPricePerGpuHour: number;
  margin: number;
  nodesAvailable: number;
  validUntil: string;
  network: string;
  payTo: string | null;
  /** The same price in TAO on Bittensor EVM, when the gateway accepts TAO. */
  tao?: { network: string; payTo: string | null; amount: string; amountWei: string; usdPerTao: number };
}
