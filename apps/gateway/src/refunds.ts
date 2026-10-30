import { createPublicClient, createWalletClient, erc20Abi, http, parseUnits, type Chain, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import type { Config } from "./config.js";

const CHAINS: Record<string, Chain> = { "eip155:84532": baseSepolia, "eip155:8453": base };

/**
 * Sends USDC back to an agent whose paid pod never started (or died early).
 * Enabled only when REFUND_PRIVATE_KEY is the key of GATEWAY_PAY_TO, which
 * then also needs a little ETH for gas.
 */
export class Refunder {
  private readonly wallet;
  private readonly publicClient;
  readonly enabled: boolean;
  readonly reason: string | undefined;

  constructor(cfg: Config) {
    const chain = CHAINS[cfg.X402_NETWORK];
    const key = cfg.REFUND_PRIVATE_KEY as Hex | undefined;
    const account = key ? privateKeyToAccount(key) : undefined;
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

  /** Transfers `usd` of the token back to `to` and waits for the receipt. Returns the tx hash. */
  async refund(asset: string, to: string, usd: number): Promise<Hex> {
    if (!this.enabled || !this.wallet || !this.publicClient) throw new Error(`Refunds disabled: ${this.reason}`);
    const amount = parseUnits(usd.toFixed(6), 6);
    const hash = await this.wallet.writeContract({
      address: asset as Hex,
      abi: erc20Abi,
      functionName: "transfer",
      args: [to as Hex, amount],
    });
    await this.publicClient.waitForTransactionReceipt({ hash, timeout: 60_000 });
    return hash;
  }
}
