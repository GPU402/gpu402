# @gpu402/tools

Drop-in GPU tools for AI agents: `listGpus`, `rentGpu`, `runOnGpu`, `stopGpu`, backed by Lium (Bittensor Subnet 51).

- **x402 mode:** the agent pays per use from its own wallet through a [GPU402 gateway](https://github.com/GPU402/gpu402), in USDC on Base (gasless) or TAO on Bittensor EVM. It needs no Lium account and no API key.
- **Key mode:** your own Lium API key, through the [`gpu402`](https://www.npmjs.com/package/gpu402) SDK.

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

## Paying in TAO

Gateways that accept TAO offer it next to USDC in every 402. Set `payWith: "tao"` and the same wallet key pays on Bittensor EVM:

```ts
const { tools } = createGpuTools({ mode: "x402", gatewayUrl, wallet, payWith: "tao", maxTaoPerPayment: 0.01 });
```

TAO has no gasless authorization like USDC's EIP-3009, so `@gpu402/tools/tao` adds an x402 scheme of its own, `native`. The agent signs a TAO transfer without broadcasting it, and the gateway verifies it, rents, then broadcasts. The same module exports the server scheme and facilitator for anyone running a gateway:

```ts
import { NativeTaoClientScheme, NativeTaoServerScheme, NativeTaoFacilitator } from "@gpu402/tools/tao";
```

## Gateway client

```ts
import { Gpu402Gateway } from "@gpu402/tools";
const gw = new Gpu402Gateway({ url, wallet });
const { data, payment } = await gw.rent({ gpu: "RTX 4090", blocks: 1, sshPublicKey }); // answers the 402 itself (USDC or TAO)
const ready = await gw.waitReady(data.podId);   // signed by the paying wallet
await gw.extend(data.podId, 1);                 // another paid 15-minute block
await gw.stop(data.podId);
```

## Links

- Source, gateway and docs: https://github.com/GPU402/gpu402
- SDK: https://www.npmjs.com/package/gpu402
