import { x402Client } from "@x402/core/client";
import { decodePaymentResponseHeader } from "@x402/core/http";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import {
  OWNERSHIP_HEADERS,
  PodStartError,
  ownershipMessage,
  type GatewayPodStatus,
  type GatewayQuoteResponse,
  type GatewayRentRequest,
  type GatewayRentResponse,
} from "gpu402";
import { parseEther, type Hex, type LocalAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { NATIVE_SCHEME, NativeTaoClientScheme, TAO_ASSET } from "./tao.js";

export interface GatewayClientOptions {
  /** e.g. http://localhost:4020 */
  url: string;
  /** The agent's wallet: a private key or a viem LocalAccount. It holds USDC; it needs no ETH and no Lium account. */
  wallet: Hex | LocalAccount;
  /** Refuse any single payment above this many USD. Default $2. */
  maxUsdPerPayment?: number;
  /** Networks to pay USDC on (CAIP-2). Default Base Sepolia. */
  networks?: `${string}:${string}`[];
  /** Pay with USDC (default) or with TAO on Bittensor EVM, when the gateway offers both. */
  payWith?: "usdc" | "tao";
  /** Bittensor EVM networks to pay TAO on. Default the testnet, eip155:945. */
  taoNetworks?: `${string}:${string}`[];
  /** RPC per Bittensor EVM network, if not the public endpoint. */
  taoRpcUrls?: Record<string, string>;
  /** Refuse any single TAO payment above this many TAO. Default 0.02. */
  maxTaoPerPayment?: number;
  fetch?: typeof fetch;
}

export interface PaidResult<T> {
  data: T;
  payment: { txHash: string; network: string; payer: string | null } | null;
}

export class GatewayError extends Error {
  override name = "GatewayError";
  constructor(
    message: string,
    readonly status: number,
    readonly code: string | undefined,
    readonly body: unknown,
  ) {
    super(message);
  }
}

/**
 * Client for a GPU402 x402 gateway. Paid calls answer the 402 by signing a
 * USDC transferWithAuthorization (EIP-3009) with the agent's wallet; no gas,
 * no account.
 */
export class Gpu402Gateway {
  readonly url: string;
  readonly account: LocalAccount;
  private readonly plainFetch: typeof fetch;
  private readonly paidFetch: typeof fetch;

  constructor(opts: GatewayClientOptions) {
    this.url = opts.url.replace(/\/$/, "");
    this.account = typeof opts.wallet === "string" ? privateKeyToAccount(opts.wallet) : opts.wallet;
    this.plainFetch = opts.fetch ?? globalThis.fetch;
    const networks = opts.networks ?? ["eip155:84532"];
    const taoNetworks = opts.taoNetworks ?? ["eip155:945"];
    const preferTao = opts.payWith === "tao";
    const taoCap = parseEther(String(opts.maxTaoPerPayment ?? 0.02)).toString();
    const client = x402Client.fromConfig({
      schemes: [
        ...networks.map((network) => ({ network, client: new ExactEvmScheme(this.account) })),
        ...taoNetworks.map((network) => ({ network, client: new NativeTaoClientScheme(this.account, opts.taoRpcUrls) as never })),
      ],
      spendControls: {
        maxAmountPerPayment: `$${opts.maxUsdPerPayment ?? 2}`,
        allowedAssets: taoNetworks.map((network) => ({ network, asset: TAO_ASSET, maxAmountPerPayment: taoCap })),
      },
      policies: [
        (_v, reqs) =>
          reqs.filter((r) =>
            r.scheme === NATIVE_SCHEME ? taoNetworks.includes(r.network as `${string}:${string}`) : networks.includes(r.network as `${string}:${string}`),
          ),
      ],
      paymentRequirementsSelector: (_v, reqs) => reqs.find((r) => (r.scheme === NATIVE_SCHEME) === preferTao) ?? reqs[0]!,
    });
    this.paidFetch = wrapFetchWithPayment(this.plainFetch, client);
  }

  get address(): string {
    return this.account.address;
  }

  private async json<T>(res: Response): Promise<T> {
    const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    if (!res.ok) throw new GatewayError(body.message ?? `Gateway answered HTTP ${res.status}`, res.status, body.error, body);
    return body as T;
  }

  private paymentOf(res: Response) {
    const h = res.headers.get("PAYMENT-RESPONSE") ?? res.headers.get("X-PAYMENT-RESPONSE");
    if (!h) return null;
    try {
      const s = decodePaymentResponseHeader(h);
      return { txHash: s.transaction, network: s.network, payer: s.payer ?? null };
    } catch {
      return null;
    }
  }

  private async signed(podId: string): Promise<Record<string, string>> {
    const ts = Math.floor(Date.now() / 1000);
    const signature = await this.account.signMessage({ message: ownershipMessage(podId, ts) });
    return { [OWNERSHIP_HEADERS.timestamp]: String(ts), [OWNERSHIP_HEADERS.signature]: signature };
  }

  /** Live GPU models with GPU402 block prices. Free. */
  async gpus() {
    return this.json<{ network: string; blockMinutes: number; margin: number; models: { gpu: string; blockPriceUsd: number; pricePerGpuHour: number; gpusAvailable: number; vramGb: number | null }[] }>(
      await this.plainFetch(`${this.url}/gpus`),
    );
  }

  /** Price of a rent. Free. */
  async quote(spec: Omit<GatewayRentRequest, "sshPublicKey">): Promise<GatewayQuoteResponse> {
    const q = new URLSearchParams({ gpu: spec.gpu, blocks: String(spec.blocks ?? 1), gpuCount: String(spec.gpuCount ?? 1) });
    if (spec.maxUsdPerGpuHour) q.set("maxUsdPerGpuHour", String(spec.maxUsdPerGpuHour));
    return this.json(await this.plainFetch(`${this.url}/quote?${q}`));
  }

  /** Pays for and rents a GPU. Returns as soon as Lium accepted the rent; call `waitReady` for SSH. */
  async rent(spec: GatewayRentRequest): Promise<PaidResult<GatewayRentResponse>> {
    const res = await this.paidFetch(`${this.url}/rent`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(spec),
    });
    return { data: await this.json<GatewayRentResponse>(res), payment: this.paymentOf(res) };
  }

  /** Pays for more 15-minute blocks. */
  async extend(podId: string, blocks = 1): Promise<PaidResult<GatewayPodStatus>> {
    const res = await this.paidFetch(`${this.url}/pods/${podId}/extend`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
    return { data: await this.json<GatewayPodStatus>(res), payment: this.paymentOf(res) };
  }

  /** Status, SSH endpoint and time left, proven with a signature from the paying wallet. */
  async status(podId: string): Promise<GatewayPodStatus> {
    return this.json(await this.plainFetch(`${this.url}/pods/${podId}`, { headers: await this.signed(podId) }));
  }

  async waitReady(podId: string, opts: { timeoutMs?: number; intervalMs?: number; onProgress?: (s: GatewayPodStatus) => void } = {}): Promise<GatewayPodStatus> {
    const deadline = Date.now() + (opts.timeoutMs ?? 15 * 60_000);
    while (Date.now() < deadline) {
      const s = await this.status(podId);
      opts.onProgress?.(s);
      if (s.status === "running" && s.ssh) return s;
      if (s.status !== "starting") throw new PodStartError(`Pod ${podId} is ${s.status}${s.removedReason ? ` (${s.removedReason})` : ""}`, { code: s.status });
      await new Promise((r) => setTimeout(r, opts.intervalMs ?? 5_000));
    }
    throw new PodStartError(`Pod ${podId} was not ready in time`, { code: "start_timeout" });
  }

  /** Stops the pod early. */
  async stop(podId: string): Promise<GatewayPodStatus> {
    return this.json(await this.plainFetch(`${this.url}/pods/${podId}`, { method: "DELETE", headers: await this.signed(podId) }));
  }
}
