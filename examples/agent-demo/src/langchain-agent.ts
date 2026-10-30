// The same GPU tools in LangChain.js, in key mode (the developer's own Lium API key).
//   pnpm --filter @gpu402/agent-demo langchain
import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import { createGpuTools } from "@gpu402/tools/langchain";

if (!process.env.LIUM_API_KEY || !process.env.ANTHROPIC_API_KEY) {
  console.error("Set LIUM_API_KEY and ANTHROPIC_API_KEY in .env");
  process.exit(1);
}

const { tools, toolkit } = createGpuTools({
  mode: "key",
  budgetUsd: 1,
  maxUsdPerGpuHour: 0.8,
  onEvent: (e) => (e.type === "stdout" ? process.stdout.write(e.chunk) : console.log("·", e.type, "podId" in e ? e.podId : "")),
});
const byName = new Map<string, { invoke(input: unknown): Promise<unknown> }>(tools.map((t) => [t.name, t as never]));
const model = new ChatAnthropic({ model: process.env.AGENT_MODEL ?? "claude-sonnet-5-5" }).bindTools(tools);

const messages: BaseMessage[] = [
  new SystemMessage("You rent GPUs with rentGpu, run commands with runOnGpu and always release them with stopGpu."),
  new HumanMessage(process.argv.slice(2).join(" ") || "Rent the cheapest RTX 3090 or RTX 4090 for 15 minutes, run nvidia-smi and tell me the GPU name, driver and memory."),
];

try {
  for (let step = 0; step < 10; step++) {
    const reply = (await model.invoke(messages)) as AIMessage;
    messages.push(reply);
    if (!reply.tool_calls?.length) {
      console.log(`\n${reply.content}`);
      break;
    }
    for (const call of reply.tool_calls) {
      console.log(`▸ ${call.name} ${JSON.stringify(call.args)}`);
      const out = await byName.get(call.name)!.invoke(call.args);
      messages.push(new ToolMessage({ tool_call_id: call.id!, content: String(out) }));
    }
  }
} finally {
  await toolkit.stopAll();
}
