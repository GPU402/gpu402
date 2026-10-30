/**
 * x402 "native" scheme for TAO on Bittensor EVM.
 *
 * USDC on Base is paid with a signed EIP-3009 authorization. TAO is Bittensor's
 * native currency and has no such authorization, so the equivalent here is a
 * signed but unbroadcast transfer transaction: the agent signs a plain TAO
 * transfer to the gateway and hands it over in the payment header. The
 * facilitator checks it (recipient, exact amount, signer, nonce, balance)
 * before the resource is served, and broadcasts it only when settling.
 * If the gateway never settles, the transaction is never sent and no TAO moves.
 */
import type { FacilitatorClient } from "@x402/core/server";
import type {
  AssetAmount,
  Network,
  PaymentPayload,
  PaymentRequirements,
  Price,
  SchemeNetworkServer,
  SettleResponse,
  SupportedKind,
  SupportedResponse,
  VerifyResponse,
} from "@x402/core/types";
import {
  createPublicClient,
  http,
  keccak256,
  parseTransaction,
  recoverTransactionAddress,
  type Hex,
  type LocalAccount,
  type PublicClient,
} from "viem";

export const NATIVE_SCHEME = "native";
/** Asset id used in payment requirements for TAO (the chain's native currency, 18 decimals in the EVM). */
export const TAO_ASSET = "TAO";
export const TAO_DECIMALS = 18;
/** 1 rao (10^-9 TAO, Substrate's smallest unit) in EVM wei. Amounts are kept to whole rao. */
export const WEI_PER_RAO = 1_000_000_000n;

export const BITTENSOR_EVM: Record<string, { name: string; rpcUrl: string; explorerTx: string | null }> = {
  "eip155:945": { name: "Bittensor EVM testnet", rpcUrl: "https://test.chain.opentensor.ai", explorerTx: null },
  "eip155:964": { name: "Bittensor EVM", rpcUrl: "https://lite.chain.opentensor.ai", explorerTx: "https://evm.taostats.io/tx/" },
};

export const isTaoNetwork = (network: string) => network in BITTENSOR_EVM;
const chainIdOf = (network: string) => Number(network.split(":")[1]);

/** USD → wei of TAO at `usdPerTao`, rounded up to a whole rao so the gateway is never under-paid. */
export function usdToTaoWei(usd: number, usdPerTao: number): bigint {
  if (!(usdPerTao > 0)) throw new Error("A positive TAO/USD rate is required");
  const rao = BigInt(Math.ceil((usd / usdPerTao) * 1e9 - 1e-9));
  return (rao > 0n ? rao : 1n) * WEI_PER_RAO;
}

export const formatTao = (wei: bigint | string, digits = 6) => (Number(BigInt(wei) / WEI_PER_RAO) / 1e9).toFixed(digits);

export interface NativeTaoPayload {
  /** Signed, serialized transfer transaction (not broadcast). */
  transaction: Hex;
  from: Hex;
}

// ------------------------------------------------------------------- client

/** Agent side: signs a TAO transfer that matches the payment requirements exactly. */
export class NativeTaoClientScheme {
  readonly scheme = NATIVE_SCHEME;
  private readonly clients = new Map<string, PublicClient>();

  constructor(
    private readonly account: LocalAccount,
    private readonly rpcUrls: Record<string, string> = {},
  ) {}

  private client(network: string): PublicClient {
    let c = this.clients.get(network);
    if (!c) {
      const url = this.rpcUrls[network] ?? BITTENSOR_EVM[network]?.rpcUrl;
      if (!url) throw new Error(`No RPC URL for ${network}`);
      c = createPublicClient({ transport: http(url) }) as PublicClient;
      this.clients.set(network, c);
    }
    return c;
  }

  async createPaymentPayload(x402Version: number, req: PaymentRequirements, context?: { maxAmountPerPayment?: string }) {
    if (req.asset !== TAO_ASSET) throw new Error(`The native scheme pays in TAO, not ${req.asset}`);
    const value = BigInt(req.amount);
    if (context?.maxAmountPerPayment && value > BigInt(context.maxAmountPerPayment)) {
      throw new Error(`Payment of ${formatTao(value)} TAO is above this wallet's cap of ${formatTao(context.maxAmountPerPayment)} TAO`);
    }
    const c = this.client(req.network);
    const to = req.payTo as Hex;
    const [nonce, gasPrice, gas] = await Promise.all([
      c.getTransactionCount({ address: this.account.address, blockTag: "pending" }),
      c.getGasPrice(),
      // A plain transfer costs 21,000 gas; estimation fails when the balance is short, which the facilitator reports properly.
      c.estimateGas({ account: this.account.address, to, value }).catch(() => 21_000n),
    ]);
    const transaction = await this.account.signTransaction({
      type: "legacy",
      chainId: chainIdOf(req.network),
      to,
      value,
      nonce,
      gas,
      gasPrice,
    });
    const payload: NativeTaoPayload = { transaction, from: this.account.address };
    return { x402Version, payload: payload as unknown as Record<string, unknown> };
  }
}

// ------------------------------------------------------------------- server

/** Resource-server side: prices are given as TAO amounts in wei; verification happens before the handler, settlement after. */
export class NativeTaoServerScheme implements SchemeNetworkServer {
  readonly scheme = NATIVE_SCHEME;
  readonly defaultAssetTransferMethod = "default";
  readonly paymentFlows = { default: { supported: ["authorization"] as const, default: "authorization" as const } };

  /** Nothing to add: TAO needs no token metadata or facilitator-specific fields. */
  async enhancePaymentRequirements(requirements: PaymentRequirements, _kind: SupportedKind, _extensions: string[]): Promise<PaymentRequirements> {
    return requirements;
  }

  async parsePrice(price: Price, network: Network): Promise<AssetAmount> {
    if (typeof price === "object" && price !== null && "amount" in price) {
      return { amount: price.amount, asset: price.asset || TAO_ASSET, extra: price.extra ?? {} };
    }
    throw new Error(`The native scheme on ${network} needs a TAO amount in wei, not a money string`);
  }

  getAssetDecimals(): number {
    return TAO_DECIMALS;
  }
}

// -------------------------------------------------------------- facilitator

export interface NativeTaoFacilitatorOptions {
  /** CAIP-2 network → RPC URL. Defaults to the public Bittensor EVM endpoints. */
  networks: Record<string, string | undefined>;
  /** How long to wait for the transfer to be included. Default 60 s. */
  confirmTimeoutMs?: number;
}

/**
 * Verifies and settles native TAO payments by talking to the Bittensor EVM
 * directly, so no third-party facilitator is involved.
 */
export class NativeTaoFacilitator implements FacilitatorClient {
  private readonly clients = new Map<string, PublicClient>();
  private readonly settled = new Set<string>();

  constructor(private readonly opts: NativeTaoFacilitatorOptions) {
    for (const [network, url] of Object.entries(opts.networks)) {
      const rpc = url ?? BITTENSOR_EVM[network]?.rpcUrl;
      if (!rpc) throw new Error(`No RPC URL for ${network}`);
      this.clients.set(network, createPublicClient({ transport: http(rpc) }) as PublicClient);
    }
  }

  async getSupported(): Promise<SupportedResponse> {
    return {
      kinds: [...this.clients.keys()].map((network) => ({ x402Version: 2, scheme: NATIVE_SCHEME, network: network as Network })),
      extensions: [],
      signers: {},
    };
  }

  private async inspect(p: PaymentPayload, r: PaymentRequirements): Promise<{ ok: true; from: Hex; raw: Hex } | { ok: false; reason: string; from?: Hex }> {
    const c = this.clients.get(r.network);
    if (!c) return { ok: false, reason: "unsupported_network" };
    const { transaction: raw, from: claimed } = p.payload as unknown as NativeTaoPayload;
    if (typeof raw !== "string" || !raw.startsWith("0x")) return { ok: false, reason: "invalid_native_payload" };
    let tx;
    let from: Hex;
    try {
      tx = parseTransaction(raw);
      from = await recoverTransactionAddress({ serializedTransaction: raw as never });
    } catch {
      return { ok: false, reason: "invalid_native_signature" };
    }
    if (claimed && claimed.toLowerCase() !== from.toLowerCase()) return { ok: false, reason: "invalid_native_signer", from };
    if (tx.chainId !== chainIdOf(r.network)) return { ok: false, reason: "invalid_native_chain", from };
    if (tx.to?.toLowerCase() !== r.payTo.toLowerCase()) return { ok: false, reason: "invalid_native_recipient", from };
    if ((tx.value ?? 0n) !== BigInt(r.amount)) return { ok: false, reason: "invalid_native_amount", from };
    if (tx.data && tx.data !== "0x") return { ok: false, reason: "invalid_native_calldata", from };
    if (this.settled.has(keccak256(raw))) return { ok: false, reason: "invalid_native_replay", from };
    const [nonce, balance] = await Promise.all([c.getTransactionCount({ address: from, blockTag: "pending" }), c.getBalance({ address: from })]);
    if (tx.nonce !== nonce) return { ok: false, reason: "invalid_native_nonce", from };
    const fee = (tx.gas ?? 0n) * (tx.gasPrice ?? tx.maxFeePerGas ?? 0n);
    if (balance < (tx.value ?? 0n) + fee) return { ok: false, reason: "invalid_native_insufficient_balance", from };
    return { ok: true, from, raw };
  }

  async verify(p: PaymentPayload, r: PaymentRequirements): Promise<VerifyResponse> {
    const v = await this.inspect(p, r);
    return v.ok ? { isValid: true, payer: v.from } : { isValid: false, invalidReason: v.reason, payer: v.from };
  }

  async settle(p: PaymentPayload, r: PaymentRequirements): Promise<SettleResponse> {
    const v = await this.inspect(p, r);
    if (!v.ok) return { success: false, errorReason: v.reason, transaction: "", network: r.network as Network, payer: v.from };
    const c = this.clients.get(r.network)!;
    const hash = keccak256(v.raw);
    this.settled.add(hash);
    try {
      await c.sendRawTransaction({ serializedTransaction: v.raw });
      const receipt = await c.waitForTransactionReceipt({ hash, timeout: this.opts.confirmTimeoutMs ?? 60_000 });
      if (receipt.status !== "success") {
        return { success: false, errorReason: "native_transfer_reverted", transaction: hash, network: r.network as Network, payer: v.from };
      }
      return { success: true, transaction: hash, network: r.network as Network, payer: v.from, extra: { blockNumber: Number(receipt.blockNumber) } };
    } catch (err) {
      this.settled.delete(hash);
      return {
        success: false,
        errorReason: "native_broadcast_failed",
        errorMessage: (err as Error).message.slice(0, 200),
        transaction: hash,
        network: r.network as Network,
        payer: v.from,
      };
    }
  }
}

/** Sends TAO from the gateway's own wallet, e.g. to refund an agent. */
export async function sendTao(account: LocalAccount, network: string, to: Hex, wei: bigint, rpcUrl?: string): Promise<Hex> {
  const c = createPublicClient({ transport: http(rpcUrl ?? BITTENSOR_EVM[network]?.rpcUrl) }) as PublicClient;
  const [nonce, gasPrice, gas] = await Promise.all([
    c.getTransactionCount({ address: account.address, blockTag: "pending" }),
    c.getGasPrice(),
    c.estimateGas({ account: account.address, to, value: wei }),
  ]);
  const raw = await account.signTransaction({ type: "legacy", chainId: chainIdOf(network), to, value: wei, nonce, gas, gasPrice });
  const hash = await c.sendRawTransaction({ serializedTransaction: raw });
  const receipt = await c.waitForTransactionReceipt({ hash, timeout: 60_000 });
  if (receipt.status !== "success") throw new Error(`TAO transfer ${hash} reverted`);
  return hash;
}
