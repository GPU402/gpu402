import { DynamicStructuredTool } from "@langchain/core/tools";
import { GpuToolkit, TOOL_DESCRIPTIONS, listGpusInput, rentGpuInput, runOnGpuInput, stopGpuInput, type GpuToolsOptions } from "./core.js";

const asText = (fn: (i: never) => Promise<unknown>) => async (i: never) => JSON.stringify(await fn(i));

/**
 * GPU tools for LangChain.js, as DynamicStructuredTool instances.
 *
 * ```ts
 * const { tools, toolkit } = createGpuTools({ mode: "key", apiKey: process.env.LIUM_API_KEY });
 * const model = new ChatAnthropic({ model: "claude-sonnet-5-5" }).bindTools(tools);
 * ```
 */
export function createGpuTools(opts: GpuToolsOptions | GpuToolkit) {
  const toolkit = opts instanceof GpuToolkit ? opts : new GpuToolkit(opts);
  const tools = [
    new DynamicStructuredTool({ name: "listGpus", description: TOOL_DESCRIPTIONS.listGpus, schema: listGpusInput, func: asText((i) => toolkit.listGpus(i)) }),
    new DynamicStructuredTool({ name: "rentGpu", description: TOOL_DESCRIPTIONS.rentGpu, schema: rentGpuInput, func: asText((i) => toolkit.rentGpu(i)) }),
    new DynamicStructuredTool({ name: "runOnGpu", description: TOOL_DESCRIPTIONS.runOnGpu, schema: runOnGpuInput, func: asText((i) => toolkit.runOnGpu(i)) }),
    new DynamicStructuredTool({ name: "stopGpu", description: TOOL_DESCRIPTIONS.stopGpu, schema: stopGpuInput, func: asText((i) => toolkit.stopGpu(i)) }),
  ];
  return { tools, toolkit };
}

export { GpuToolkit } from "./core.js";
export type { GpuToolsOptions, ToolEvent } from "./core.js";
