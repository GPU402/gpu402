// An AI agent with only a USDC wallet (no Lium account, no API key for GPUs) rents a Lium GPU
// through the GPU402 x402 gateway, benchmarks on it, reports, and releases it.
//
//   pnpm demo:agent                       # default task
//   pnpm demo:agent "train a tiny MLP on MNIST and report accuracy"
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGpuTools, type ToolEvent } from "@gpu402/tools/ai";
import { withQuotaFallback } from "./fallback.js";
import { generateText, stepCountIs } from "ai";
import type { Hex } from "viem";

const c = { dim: "\x1b[2m", bold: "\x1b[1m", green: "\x1b[32m", cyan: "\x1b[36m", yellow: "\x1b[33m", magenta: "\x1b[35m", reset: "\x1b[0m" };
const need = (k: string) => process.env[k] || (console.error(`Set ${k} in .env (see .env.example)`), process.exit(1));

const gatewayUrl = process.env.GPU402_GATEWAY_URL ?? "http://localhost:4020";
const wallet = need("AGENT_PRIVATE_KEY") as Hex;
// AGENT_PROVIDER picks the model vendor; the GPU tools are the same either way.
const provider = process.env.AGENT_PROVIDER ?? (process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "google" : "anthropic");
need(provider === "google" ? "GOOGLE_GENERATIVE_AI_API_KEY" : "ANTHROPIC_API_KEY");

// Pay with USDC on Base (default) or TAO on Bittensor EVM: AGENT_PAY_WITH=tao
const payWith = process.env.AGENT_PAY_WITH === "tao" ? "tao" : "usdc";
const explorer = (network: string, tx: string) =>
  ({ "eip155:84532": `https://sepolia.basescan.org/tx/${tx}`, "eip155:8453": `https://basescan.org/tx/${tx}`, "eip155:964": `https://evm.taostats.io/tx/${tx}` })[network] ??
  `tx ${tx} on Bittensor EVM testnet`;
let streaming = false;
const onEvent = (e: ToolEvent) => {
  if (e.type === "stdout" || e.type === "stderr") {
    if (!streaming) process.stdout.write(`${c.dim}`);
    streaming = true;
    process.stdout.write(e.chunk);
    return;
  }
  if (streaming) process.stdout.write(c.reset);
  streaming = false;
  const line = {
    renting: () => `${c.yellow}⇢ rentGpu: asking the gateway for ${e.type === "renting" && `${e.minutes} min of ${e.gpu}`}${c.reset}`,
    paid: () => e.type === "paid" && `${c.green}✓ HTTP 402 answered: paid $${e.amountUsd.toFixed(6)} in ${e.network.startsWith("eip155:9") ? "TAO" : "USDC"}  ${explorer(e.network, e.txHash)}${c.reset}`,
    rented: () => e.type === "rented" && `${c.green}✓ Lium pod ${e.podId} (${e.gpu}) is starting on a Bittensor SN51 miner${c.reset}`,
    waiting: () => e.type === "waiting" && `${c.dim}  … pod ${e.status.toLowerCase()}${c.reset}`,
    ready: () => e.type === "ready" && `${c.green}✓ GPU ready: ${e.ssh}  (paid until ${e.expiresAt?.slice(11, 19)} UTC)${c.reset}`,
    stopped: () => e.type === "stopped" && `${c.green}✓ GPU released (pod ${e.podId})${c.reset}`,
  }[e.type]();
  console.log(line);
};

const { tools, toolkit } = createGpuTools({ mode: "x402", gatewayUrl, wallet, maxUsdPerPayment: 1, payWith, onEvent });
// AGENT_MODEL may be a comma-separated list: when one model's quota runs out, the next takes over.
const modelIds = (process.env.AGENT_MODEL || (provider === "google" ? "gemini-3.5-flash,gemini-3-flash-preview,gemini-3.5-flash-lite,gemini-flash-lite-latest" : "claude-sonnet-5-5"))
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const modelId = modelIds[0]!;
const make = provider === "google" ? createGoogleGenerativeAI() : createAnthropic();
const model = withQuotaFallback(
  modelIds.map((id) => make(id)),
  (from, to) => console.log(`${c.yellow}⇢ ${from} is out of quota; continuing with ${to}${c.reset}`),
);

const task =
  process.argv.slice(2).join(" ") ||
  "Benchmark PyTorch matrix-multiply throughput on a GPU. Rent the cheapest RTX 4090 for 15 minutes " +
    "(fall back to an RTX 3090 if none is available), check the GPU with nvidia-smi, then measure fp16 and fp32 " +
    "TFLOPS with torch.matmul on 8192×8192 matrices (warm up, then time 20 iterations with torch.cuda.synchronize). " +
    "Report a short table of the results.";

console.log(`${c.bold}GPU402 agent demo${c.reset}  model ${modelId}  pays in ${payWith.toUpperCase()}  wallet ${toolkit.gateway!.address}  gateway ${gatewayUrl}`);
console.log(`${c.cyan}Task:${c.reset} ${task}\n`);

try {
  const result = await generateText({
    model,
    tools,
    stopWhen: stepCountIs(14),
    system:
      "You are an autonomous ML engineer. You have no GPU of your own; rent one with rentGpu (it is paid per use from your wallet), " +
      "use runOnGpu to run shell commands on it (python3 with torch is installed), and always call stopGpu when you are done. " +
      "Keep commands non-interactive. Write Python with python3 - <<'EOF' … EOF heredocs.",
    prompt: task,
    onStepFinish: ({ toolCalls, text }) => {
      for (const call of toolCalls) {
        const input = JSON.stringify(call.input);
        console.log(`${c.magenta}▸ ${call.toolName}${c.reset} ${c.dim}${input.length > 160 ? `${input.slice(0, 160)}…` : input}${c.reset}`);
      }
      if (text && toolCalls.length) console.log(`${c.dim}${text}${c.reset}`);
    },
  });
  console.log(`\n${c.bold}Agent report${c.reset}\n${result.text}`);
} finally {
  await toolkit.stopAll(); // never leave a GPU running, even if the model forgot or the run failed
}
