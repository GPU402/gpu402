import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill } from "remotion";
import { CHAIN_FRAMES, ChainScene, LiveScene, RealTimeNote, panels, planLive, type Cue } from "./scenes/live";
import { HTTP402_FRAMES, Http402, INTRO_FRAMES, Intro, PROBLEM_FRAMES, Problem } from "./scenes/opening";
import { OUTRO_FRAMES, Outro, PROOF_FRAMES, ProofScene } from "./scenes/closing";
import { SdkScene, planSdk } from "./scenes/sdk";
import { C } from "./theme";

const ev = (type: string) => (x: { kind: string; type?: string }) => x.kind === "event" && x.type === type;
const line = (re: RegExp) => (x: { kind: string; text: string }) => x.kind === "line" && re.test(x.text);

const AGENT_CUES: Cue[] = [
  { match: line(/^Task:/), text: "An AI agent gets a task. It has a USDC wallet, and no Lium account.", accent: C.green },
  { match: ev("quote.issued"), text: "It asks for a GPU. The gateway answers HTTP 402 with an exact price.", accent: C.blue, panel: panels.flow, label: "1 · 402 quote" },
  { match: ev("payment.verified"), text: "The agent signs a USDC payment. No gas, no account. The facilitator verifies it.", accent: C.blue, panel: panels.flow, label: "2 · verified" },
  { match: ev("pod.rented"), text: "Only then does GPU402 rent the cheapest matching GPU on Lium, Subnet 51.", accent: C.green, panel: panels.feedTop, label: "3 · rented on Lium" },
  { match: ev("payment.settled"), text: "Now the payment settles on Base. If Lium had failed, it never would have.", accent: C.blue, panel: panels.kpis, label: "4 · settled on-chain" },
  { match: ev("pod.ready"), text: "The GPU answers SSH. Paid time starts now, not at the signature.", accent: C.green, panel: panels.flow, label: "5 · GPU ready" },
  { match: line(/TFLOPS/), text: "The agent wrote and ran its own benchmark on the GPU, over SSH.", accent: C.green },
  { match: ev("pod.stopped"), text: "Done. It releases the GPU, and Lium stops billing.", accent: C.green, panel: panels.feedTop, label: "released" },
];

const TAO_CUES: Cue[] = [
  { match: line(/payWith: tao/), text: "Same agent tools, same wallet key. This time it pays in TAO.", accent: C.purple },
  { match: ev("payment.verified"), text: "GPU402's own x402 scheme: a signed TAO transfer, verified by the gateway on Bittensor EVM.", accent: C.purple, panel: panels.feedTop, label: "TAO verified" },
  { match: ev("payment.settled"), text: "Rented on Lium, then the TAO transfer is broadcast and mined.", accent: C.purple, panel: panels.feedTop, label: "settled on Bittensor" },
  { match: ev("pod.ready"), text: "Bittensor money in, Bittensor compute out.", accent: C.green, panel: panels.flow, label: "GPU ready" },
  { match: ev("pod.stopped"), text: "Released. Lium accepts TAO top-ups, so the whole loop can stay on Bittensor.", accent: C.green, panel: panels.feedTop, label: "released" },
];

export const sdkPlan = planSdk();
export const agentPlan = planLive("agent", AGENT_CUES);
export const taoPlan = planLive("tao", TAO_CUES);

const T = 18; // transition length in frames
const scenes = [
  { frames: INTRO_FRAMES, el: <Intro /> },
  { frames: PROBLEM_FRAMES, el: <Problem /> },
  { frames: HTTP402_FRAMES, el: <Http402 /> },
  { frames: sdkPlan.frames, el: <SdkScene plan={sdkPlan} /> },
  {
    frames: agentPlan.frames,
    el: (
      <>
        <LiveScene n="04" title="An agent pays with USDC" accent={C.blue} plan={agentPlan} terminalTitle="pnpm demo:agent  (Gemini, live)" />
        <RealTimeNote plan={agentPlan} />
      </>
    ),
  },
  {
    frames: taoPlan.frames,
    el: (
      <>
        <LiveScene n="05" title="…or pays with TAO" accent={C.purple} plan={taoPlan} terminalTitle="agent tools · payWith: tao  (live)" />
        <RealTimeNote plan={taoPlan} />
      </>
    ),
  },
  { frames: PROOF_FRAMES, el: <ProofScene /> },
  { frames: CHAIN_FRAMES, el: <ChainScene /> },
  { frames: OUTRO_FRAMES, el: <Outro /> },
];

export const FILM_FRAMES = scenes.reduce((s, x) => s + x.frames, 0) - T * (scenes.length - 1);

export function Film() {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <TransitionSeries>
        {scenes.flatMap((s, i) => [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={s.frames}>
            {s.el}
          </TransitionSeries.Sequence>,
          ...(i < scenes.length - 1
            ? [<TransitionSeries.Transition key={`t${i}`} presentation={i % 3 === 1 ? slide({ direction: "from-right" }) : fade()} timing={linearTiming({ durationInFrames: T })} />]
            : []),
        ])}
      </TransitionSeries>
    </AbsoluteFill>
  );
}
