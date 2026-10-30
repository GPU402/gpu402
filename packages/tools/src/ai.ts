import { tool, type Tool } from "ai";
import type { z } from "zod";
import { GpuToolkit, TOOL_DESCRIPTIONS, listGpusInput, rentGpuInput, runOnGpuInput, stopGpuInput, type GpuToolsOptions } from "./core.js";

/**
 * GPU tools for the Vercel AI SDK.
 *
 * ```ts
 * const { tools, toolkit } = createGpuTools({ mode: "x402", gatewayUrl, wallet: process.env.AGENT_PRIVATE_KEY });
 * await generateText({ model, tools, stopWhen: stepCountIs(12), prompt: "Benchmark this model on a GPU" });
 * await toolkit.stopAll();
 * ```
 */
export type GpuAiTools = {
  listGpus: Tool<z.output<typeof listGpusInput>, Awaited<ReturnType<GpuToolkit["listGpus"]>>>;
  rentGpu: Tool<z.output<typeof rentGpuInput>, Awaited<ReturnType<GpuToolkit["rentGpu"]>>>;
  runOnGpu: Tool<z.output<typeof runOnGpuInput>, Awaited<ReturnType<GpuToolkit["runOnGpu"]>>>;
  stopGpu: Tool<z.output<typeof stopGpuInput>, Awaited<ReturnType<GpuToolkit["stopGpu"]>>>;
};

export function createGpuTools(opts: GpuToolsOptions | GpuToolkit): { tools: GpuAiTools; toolkit: GpuToolkit } {
  const toolkit = opts instanceof GpuToolkit ? opts : new GpuToolkit(opts);
  const tools: GpuAiTools = {
    listGpus: tool({ description: TOOL_DESCRIPTIONS.listGpus, inputSchema: listGpusInput, execute: (i) => toolkit.listGpus(i) }),
    rentGpu: tool({ description: TOOL_DESCRIPTIONS.rentGpu, inputSchema: rentGpuInput, execute: (i) => toolkit.rentGpu(i) }),
    runOnGpu: tool({ description: TOOL_DESCRIPTIONS.runOnGpu, inputSchema: runOnGpuInput, execute: (i) => toolkit.runOnGpu(i) }),
    stopGpu: tool({ description: TOOL_DESCRIPTIONS.stopGpu, inputSchema: stopGpuInput, execute: (i) => toolkit.stopGpu(i) }),
  };
  return { tools, toolkit };
}

export { GpuToolkit } from "./core.js";
export type { GpuToolsOptions, ToolEvent } from "./core.js";
