import { linearTiming, TransitionSeries, type TransitionPresentation } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill } from "remotion";
import { B } from "./kit";
import { OPEN_FRAMES, Open, PROBLEM_FRAMES, PROTOCOL_FRAMES, Problem, Protocol, REVEAL_FRAMES, Reveal } from "./opening";
import { AGENT_FRAMES, AgentRun, TAO_FRAMES, TaoRun } from "./run";
import { MONTAGE_FRAMES, Montage, OUTRO_FRAMES, Outro, PLAY_FRAMES, PROOF_FRAMES, Playground, Proof, SHIP_FRAMES, Shipped } from "./site";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Out = TransitionPresentation<any> | null;

const T = 12; // transition length in frames

const scenes: { frames: number; el: React.ReactNode; out: Out }[] = [
  { frames: OPEN_FRAMES, el: <Open />, out: fade() },
  { frames: PROBLEM_FRAMES, el: <Problem />, out: fade() },
  { frames: REVEAL_FRAMES, el: <Reveal />, out: slide({ direction: "from-bottom" }) },
  { frames: PROTOCOL_FRAMES, el: <Protocol />, out: wipe({ direction: "from-left" }) },
  { frames: AGENT_FRAMES, el: <AgentRun />, out: slide({ direction: "from-right" }) },
  { frames: TAO_FRAMES, el: <TaoRun />, out: fade() },
  { frames: PLAY_FRAMES, el: <Playground />, out: slide({ direction: "from-bottom" }) },
  { frames: PROOF_FRAMES, el: <Proof />, out: wipe({ direction: "from-right" }) },
  { frames: SHIP_FRAMES, el: <Shipped />, out: fade() },
  { frames: MONTAGE_FRAMES, el: <Montage />, out: fade() },
  { frames: OUTRO_FRAMES, el: <Outro />, out: null },
];

export const FILM2_FRAMES = scenes.reduce((s, x) => s + x.frames, 0) - T * (scenes.length - 1);

/** GPU402, the film: real footage and real recorded runs, cut to under three minutes. */
export function Film2() {
  return (
    <AbsoluteFill style={{ background: B.void }}>
      <TransitionSeries>
        {scenes.flatMap((s, i) => [
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={s.frames}>
            {s.el}
          </TransitionSeries.Sequence>,
          ...(s.out ? [<TransitionSeries.Transition key={`t${i}`} presentation={s.out} timing={linearTiming({ durationInFrames: T })} />] : []),
        ])}
      </TransitionSeries>
    </AbsoluteFill>
  );
}
