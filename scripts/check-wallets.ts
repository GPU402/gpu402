// Pre-flight check for the live demo: wallet balances on Base Sepolia, the Lium key and balance, and the facilitator.
import "dotenv/config";
import { Lium } from "gpu402";
import { createPublicClient, erc20Abi, formatEther, formatUnits, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Circle USDC on Base Sepolia
const client = createPublicClient({ chain: baseSepolia, transport: http(process.env.EVM_RPC_URL || undefined) });
const ok = (b: boolean) => (b ? "✔" : "✘");
let ready = true;

async function wallet(label: string, address: Hex | undefined, needUsdc: number, needEth: number) {
  if (!address) {
    console.log(`${ok(false)} ${label}: not set (run pnpm setup:wallets)`);
    ready = false;
    return;
  }
  const [usdc, eth] = await Promise.all([
    client.readContract({ address: USDC, abi: erc20Abi, functionName: "balanceOf", args: [address] }),
    client.getBalance({ address }),
  ]);
  const u = Number(formatUnits(usdc, 6));
  const e = Number(formatEther(eth));
  const good = u >= needUsdc && e >= needEth;
  if (needUsdc > 0 || needEth > 0) ready &&= good;
  console.log(`${ok(good)} ${label} ${address}: ${u.toFixed(4)} USDC, ${e.toFixed(6)} ETH${good ? "" : `  (need ≥ ${needUsdc} USDC${needEth ? `, ≥ ${needEth} ETH` : ""})`}`);
}

const agentKey = process.env.AGENT_PRIVATE_KEY as Hex | undefined;
await wallet("Agent  ", agentKey ? privateKeyToAccount(agentKey).address : undefined, 0.5, 0);
await wallet("Gateway", process.env.GATEWAY_PAY_TO as Hex | undefined, 0, process.env.REFUND_PRIVATE_KEY ? 0.0001 : 0);

if (process.env.LIUM_API_KEY) {
  try {
    const balance = await new Lium().balance();
    const good = balance >= 1;
    ready &&= good;
    console.log(`${ok(good)} Lium key ${process.env.LIUM_API_KEY.slice(0, 6)}…: balance $${balance.toFixed(2)}${good ? "" : " (top up at lium.io/billing)"}`);
  } catch (e) {
    ready = false;
    console.log(`${ok(false)} Lium key rejected: ${(e as Error).message}`);
  }
} else {
  ready = false;
  console.log(`${ok(false)} LIUM_API_KEY not set (lium.io → Access → API Keys)`);
}

const fac = process.env.FACILITATOR_URL || "https://x402.org/facilitator";
const network = process.env.X402_NETWORK || "eip155:84532";
const supported = (await fetch(`${fac}/supported`).then((r) => r.json())) as { kinds: { scheme: string; network: string }[] };
const facOk = supported.kinds.some((k) => k.scheme === "exact" && k.network === network);
ready &&= facOk;
console.log(`${ok(facOk)} Facilitator ${fac} supports exact on ${network}`);

console.log(ready ? "\nReady for the live demo." : "\nNot ready yet: fix the ✘ lines above.");
process.exit(ready ? 0 : 1);
