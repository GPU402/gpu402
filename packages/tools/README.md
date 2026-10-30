# @gpu402/tools

Drop-in GPU tools for AI agents: `listGpus`, `rentGpu`, `runOnGpu`, `stopGpu`, backed by Lium (Bittensor Subnet 51).

- **x402 mode:** the agent pays per use from a USDC wallet through a GPU402 gateway. It needs no Lium account, no API key and no gas.
- **Key mode:** your own Lium API key, through the [`gpu402`](../sdk) SDK.

Each toolkit generates its own SSH key pair in memory. The private key never leaves the process.

## Install

```bash
npm install @gpu402/tools ai                 # Vercel AI SDK
npm install @gpu402/tools @langchain/core     # LangChain.js
```

## Vercel AI SDK

```ts
import { createGpuTools } from "@gpu402/tools/ai";
import { generateText, stepCountIs } from "ai";

const { tools, toolkit } = createGpuTools({
  mode: "x402",
  gatewayUrl: "http://localhost:4020",
  wallet: process.env.AGENT_PRIVATE_KEY as `0x${string}`,
  maxUsdPerPayment: 1,
});
try {
  await generateText({ model, tools, stopWhen: stepCountIs(12), prompt: "Benchmark matmul TFLOPS on an RTX 4090" });
} finally {
  await toolkit.stopAll();
}
```

## LangChain.js

```ts
import { createGpuTools } from "@gpu402/tools/langchain";
const { tools, toolkit } = createGpuTools({ mode: "key", apiKey: process.env.LIUM_API_KEY, budgetUsd: 2 });
const model = new ChatAnthropic({ model: "claude-sonnet-5-5" }).bindTools(tools); // DynamicStructuredTool[]
```

## Gateway client

```ts
import { Gpu402Gateway } from "@gpu402/tools";
const gw = new Gpu402Gateway({ url, wallet });
const { data, payment } = await gw.rent({ gpu: "RTX 4090", blocks: 1, sshPublicKey }); // answers the 402 itself
const ready = await gw.waitReady(data.podId);   // signed by the paying wallet
await gw.extend(data.podId, 1);                 // another paid 15-minute block
await gw.stop(data.podId);
```
