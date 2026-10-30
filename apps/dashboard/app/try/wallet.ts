import { x402Client } from "@x402/core/client";
import { decodePaymentRequiredHeader, decodePaymentResponseHeader } from "@x402/core/http";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { createPublicClient, createWalletClient, custom, erc20Abi, formatUnits, http, type EIP1193Provider, type Hex } from "viem";
import { baseSepolia } from "viem/chains";

/** USDC on Base Sepolia (Circle's testnet token). */
export const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
export const BASE_SEPOLIA = "eip155:84532" as const;
export const USDC_FAUCET = "https://faucet.circle.com/";

/** Same message and headers as the gpu402 SDK's `ownershipMessage` (packages/sdk/src/protocol.ts). */
export const ownershipMessage = (podId: string, ts: number) => `GPU402 pod access\npod: ${podId}\ntimestamp: ${ts}`;
const OWNERSHIP = { timestamp: "X-GPU402-Timestamp", signature: "X-GPU402-Signature" } as const;
/** The gateway accepts a signature for 300 s; re-sign a little before that. */
const SIGNATURE_REUSE_MS = 240_000;

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

export const hasWallet = () => typeof window !== "undefined" && Boolean(window.ethereum);

/** Decodes the PAYMENT-REQUIRED header of a 402 into its offers. */
export function readPaymentRequired(res: Response) {
  const h = res.headers.get("PAYMENT-REQUIRED");
  if (!h) return null;
  try {
    return decodePaymentRequiredHeader(h);
  } catch {
    return null;
  }
}

export interface PaidResponse<T> {
  status: number;
  body: T;
  payment: { txHash: string; network: string; payer: string | null } | null;
}

/** A visitor's own wallet, paying the gateway in USDC on Base Sepolia through x402. */
export class BrowserWallet {
  private sig: { podId: string; at: number; headers: Record<string, string> } | null = null;

  private constructor(
    readonly address: Hex,
    private readonly wallet: ReturnType<typeof createWalletClient>,
  ) {}

  static async connect(): Promise<BrowserWallet> {
    const eth = window.ethereum;
    if (!eth) throw new Error("No browser wallet found. Install one such as MetaMask or Rabby.");
    const [address] = (await eth.request({ method: "eth_requestAccounts" })) as Hex[];
    if (!address) throw new Error("The wallet did not share an account.");
    const hex = `0x${baseSepolia.id.toString(16)}` as const;
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex }] });
    } catch (e) {
      if ((e as { code?: number }).code !== 4902) throw e;
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [{ chainId: hex, chainName: "Base Sepolia", nativeCurrency: baseSepolia.nativeCurrency, rpcUrls: [baseSepolia.rpcUrls.default.http[0]!], blockExplorerUrls: ["https://sepolia.basescan.org"] }],
      });
    }
    return new BrowserWallet(address, createWalletClient({ account: address, chain: baseSepolia, transport: custom(eth) }));
  }

  async usdcBalance(): Promise<number> {
    const pub = createPublicClient({ chain: baseSepolia, transport: http() });
    const raw = await pub.readContract({ address: USDC_BASE_SEPOLIA, abi: erc20Abi, functionName: "balanceOf", args: [this.address] });
    return Number(formatUnits(raw, 6));
  }

  /** fetch that answers a 402 by signing a USDC transferWithAuthorization (EIP-3009). No gas. */
  paidFetch(maxUsd = 1): typeof fetch {
    const signer = {
      address: this.address,
      signTypedData: (m: { domain: Record<string, unknown>; types: Record<string, unknown>; primaryType: string; message: Record<string, unknown> }) =>
        this.wallet.signTypedData({ ...(m as Parameters<typeof this.wallet.signTypedData>[0]), account: this.address }),
    };
    const client = x402Client.fromConfig({
      schemes: [{ network: BASE_SEPOLIA, client: new ExactEvmScheme(signer) }],
      spendControls: { maxAmountPerPayment: `$${maxUsd}` },
      policies: [(_v, reqs) => reqs.filter((r) => r.network === BASE_SEPOLIA && r.scheme === "exact")],
    });
    return wrapFetchWithPayment(fetch, client);
  }

  async call<T>(f: typeof fetch, url: string, init?: RequestInit): Promise<PaidResponse<T>> {
    const res = await f(url, init);
    const body = (await res.json().catch(() => ({}))) as T;
    const h = res.headers.get("PAYMENT-RESPONSE") ?? res.headers.get("X-PAYMENT-RESPONSE");
    let payment: PaidResponse<T>["payment"] = null;
    if (h) {
      try {
        const s = decodePaymentResponseHeader(h);
        payment = { txHash: s.transaction, network: s.network, payer: s.payer ?? null };
      } catch {}
    }
    return { status: res.status, body, payment };
  }

  /** Ownership headers for GET/DELETE /pods/:id, signed once and reused inside the gateway's window. */
  async ownership(podId: string): Promise<Record<string, string>> {
    if (this.sig && this.sig.podId === podId && Date.now() - this.sig.at < SIGNATURE_REUSE_MS) return this.sig.headers;
    const ts = Math.floor(Date.now() / 1000);
    const signature = await this.wallet.signMessage({ account: this.address, message: ownershipMessage(podId, ts) });
    this.sig = { podId, at: Date.now(), headers: { [OWNERSHIP.timestamp]: String(ts), [OWNERSHIP.signature]: signature } };
    return this.sig.headers;
  }
}
