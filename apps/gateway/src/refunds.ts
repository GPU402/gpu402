import { TAO_ASSET, WEI_PER_RAO, isTaoNetwork, sendTao } from "@gpu402/tools/tao";
import { createPublicClient, createWalletClient, erc20Abi, http, type Chain, type Hex, type LocalAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import type { Config } from "./config.js";

const CHAINS: Record<string, Chain> = { "eip155:84532": baseSepolia, "eip155:8453": base };

export interface RefundablePayment {
  asset: string;
  network: string;
  payer: string;
  amount_atomic: string;
  amount_usd: number;
}

/**
 * Sends an agent's money back, in the asset and on the chain it paid with,
 * when its paid pod never started (or died early). Enabled only when
 * REFUND_PRIVATE_KEY is the key of the pay-to wallet, which then needs a little
 * gas: ETH on Base for USDC refunds, TAO on Bittensor EVM for TAO refunds.
 */
export class Refunder {
  private readonly wallet;
  private readonly publicClient;
  private readonly account: LocalAccount | undefined;
  private readonly taoRpcUrl: string | undefined;
  readonly enabled: boolean;
  readonly reason: string | undefined;

  constructor(cfg: Config) {
    const chain = CHAINS[cfg.X402_NETWORK];
    const key = cfg.REFUND_PRIVATE_KEY as Hex | undefined;
    const account = key ? privateKeyToAccount(key) : undefined;
    this.account = account;
    this.taoRpcUrl = cfg.TAO_RPC_URL;
    if (!account || !chain) {
      this.enabled = false;
      this.reason = !account ? "REFUND_PRIVATE_KEY not set" : `no chain config for ${cfg.X402_NETWORK}`;
      return;
    }
    if (cfg.GATEWAY_PAY_TO && account.address.toLowerCase() !== cfg.GATEWAY_PAY_TO.toLowerCase()) {
      throw new Error("REFUND_PRIVATE_KEY must be the key of GATEWAY_PAY_TO (refunds come from the wallet that was paid).");
    }
    const transport = http(cfg.EVM_RPC_URL);
    this.wallet = createWalletClient({ account, chain, transport });
    this.publicClient = createPublicClient({ chain, transport });
    this.enabled = true;
  }

  /** Refunds `share` (0–1) of a payment. Returns the refund transaction and its USD value. */
  async refundPayment(p: RefundablePayment, share: number): Promise<{ tx: Hex; usd: number }> {
    if (!this.enabled || !this.account) throw new Error(`Refunds disabled: ${this.reason}`);
    const parts = 1_000_000n;
    const scaled = BigInt(Math.floor(Math.min(Math.max(share, 0), 1) * Number(parts)));
    let atomic = (BigInt(p.amount_atomic) * scaled) / parts;
    if (p.asset === TAO_ASSET || isTaoNetwork(p.network)) {
      atomic -= atomic % WEI_PER_RAO; // whole rao only
      if (atomic <= 0n) throw new Error("Refund rounds to zero");
      const tx = await sendTao(this.account, p.network, p.payer as Hex, atomic, this.taoRpcUrl);
      return { tx, usd: Math.floor(p.amount_usd * share * 1e6) / 1e6 };
    }
    if (!this.wallet || !this.publicClient) throw new Error("No chain configured for USDC refunds");
    if (atomic <= 0n) throw new Error("Refund rounds to zero");
    const tx = await this.wallet.writeContract({ address: p.asset as Hex, abi: erc20Abi, functionName: "transfer", args: [p.payer as Hex, atomic] });
    await this.publicClient.waitForTransactionReceipt({ hash: tx, timeout: 60_000 });
    return { tx, usd: Number(atomic) / 1e6 };
  }
}
