// Creates .env from .env.example with two fresh Base Sepolia test wallets:
// the gateway's payTo wallet (with its key as REFUND_PRIVATE_KEY) and the agent's wallet.
// Never overwrites a value that is already set.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");
const source = existsSync(envPath) ? readFileSync(envPath, "utf8") : readFileSync(resolve(root, ".env.example"), "utf8");

const current = new Map<string, string>();
for (const line of source.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) current.set(m[1]!, m[2]!.trim());
}

const set = new Map<string, string>();
if (!current.get("GATEWAY_PAY_TO") && !current.get("REFUND_PRIVATE_KEY")) {
  const key = generatePrivateKey();
  set.set("REFUND_PRIVATE_KEY", key);
  set.set("GATEWAY_PAY_TO", privateKeyToAccount(key).address);
}
if (!current.get("AGENT_PRIVATE_KEY")) set.set("AGENT_PRIVATE_KEY", generatePrivateKey());

let out = source;
for (const [k, v] of set) {
  out = new RegExp(`^${k}=.*$`, "m").test(out) ? out.replace(new RegExp(`^${k}=.*$`, "m"), `${k}=${v}`) : `${out.trimEnd()}\n${k}=${v}\n`;
}
writeFileSync(envPath, out, { mode: 0o600 });

const payTo = set.get("GATEWAY_PAY_TO") ?? current.get("GATEWAY_PAY_TO");
const agentKey = (set.get("AGENT_PRIVATE_KEY") ?? current.get("AGENT_PRIVATE_KEY")) as `0x${string}`;
const agent = privateKeyToAccount(agentKey).address;

console.log(set.size ? `Wrote ${[...set.keys()].join(", ")} to .env` : ".env already has wallets; nothing changed.");
console.log(`
Gateway payTo wallet : ${payTo}
Agent wallet         : ${agent}

Fund them on Base Sepolia (testnet, free):
  1. USDC for the agent  → https://faucet.circle.com  (network: Base Sepolia, address: ${agent})
  2. ETH for refunds gas → https://portal.cdp.coinbase.com/products/faucet  (address: ${payTo})
Then set LIUM_API_KEY in .env and run: pnpm check:wallets
`);
