import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import shotsRaw from "../../public/capture/shots.json";
import { Backdrop, BrowserFrame, Caption, Highlight, Reveal, SceneLabel, SpeedBadge, Terminal } from "../components";
import { eventsIn, footageOf, frameOf, linesOf, phaseWindow, rateAt, srcAt, takeOf, timeMap, totalFrames, type Segment, type Take } from "../session";
import { C, FPS, mono, sans } from "../theme";

type Rect = { x: number; y: number; w: number; h: number };
export const shots = shotsRaw as unknown as {
  rects: Record<string, Rect | null>;
  usdcReceipt: { tx: string; status: string; block: number; time: string; submittedBy: string; transfer: { from: string; to: string; amount: string } };
  taoReceipt: { tx: string; status: string; block: number; from: string; to: string; valueWei: string; chainId: number };
};
/** Dashboard regions that keep their place while rentals are added below them. */
export const panels = {
  kpis: shots.rects.kpis!,
  flow: shots.rects.flow!,
  feedTop: { ...shots.rects.feed!, h: 430 },
};

/** The dashboard's content column in the recording (it is centred in a 1920 px viewport). */
export const CONTENT = { x: 292, w: 1336 };

/**
 * Real dashboard footage for one stretch of the recording, at the time map's
 * speeds, cropped to the content column. The last real frame is held after the
 * recording ends, so a scene never shows black.
 */
function Footage({ segs, width, take, tail = 0 }: { segs: Segment[]; width: number; take: Take; tail?: number }) {
  const k = width / CONTENT.w;
  const src = staticFile(footageOf(take));
  const last = segs[segs.length - 1]!;
  const end = last.at + last.frames;
  return (
    <div style={{ width: 1920, height: 1080, transform: `translateX(${-CONTENT.x * k}px) scale(${k})`, transformOrigin: "top left", position: "absolute" }}>
      {segs.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={s.frames} layout="none">
          <OffthreadVideo src={src} startFrom={Math.round((s.src0 / 1000) * FPS)} playbackRate={s.rate} muted style={{ width: 1920, height: 1080 }} />
        </Sequence>
      ))}
      {tail > 0 && (
        <Sequence from={end} durationInFrames={tail} layout="none">
          <OffthreadVideo src={src} startFrom={Math.max(Math.round((last.src1 / 1000) * FPS) - 2, 0)} playbackRate={0.01} muted style={{ width: 1920, height: 1080 }} />
        </Sequence>
      )}
    </div>
  );
}

export interface Cue {
  match: (x: { kind: "line" | "event"; text: string; type?: string }) => boolean;
  text: string;
  accent?: string;
  /** Dashboard region to outline while the caption shows (dashboard pixels). */
  panel?: Rect;
  label?: string;
}

/** Plans one live scene: the time map, and when each caption and highlight appears. */
export function planLive(phase: string, cues: Cue[]) {
  const [start, end] = phaseWindow(phase);
  // Show settlement links as plain transaction hashes (no block-explorer URLs in the film).
  const lines = linesOf(phase).map((l) => ({ ...l, text: l.text.replace(/https:\/\/sepolia\.basescan\.org\/tx\/(0x[0-9a-f]{8})[0-9a-f]+([0-9a-f]{6})/i, "tx $1…$2 on Base Sepolia") }));
  const events = eventsIn(phase, start, end);
  const hits: { t: number; cue: Cue }[] = [];
  for (const cue of cues) {
    const ev = events.find((e) => cue.match({ kind: "event", text: e.message, type: e.type }));
    const ln = lines.find((l) => cue.match({ kind: "line", text: l.text }));
    const t = Math.min(ev?.t ?? Infinity, ln?.t ?? Infinity);
    if (Number.isFinite(t)) hits.push({ t, cue });
  }
  hits.sort((a, b) => a.t - b.t);
  const keys = [...hits.map((h) => h.t), ...lines.filter((l) => /^(✓|▸|⇢)/.test(l.text)).map((l) => l.t)];
  const segs = timeMap(start, end, keys, { hold: 2600, maxGapMs: 1500 });
  return { segs, frames: totalFrames(segs) + 45, hits, lines, take: takeOf(phase) };
}

export function LiveScene({ n, title, accent, plan, terminalTitle }: { n: string; title: string; accent: string; plan: ReturnType<typeof planLive>; terminalTitle: string }) {
  const f = useCurrentFrame();
  const { segs, hits, lines, frames } = plan;
  const clamped = Math.min(f, totalFrames(segs) - 1);
  const now = srcAt(segs, clamped);
  const fw = 1060;
  const k = fw / CONTENT.w;
  const capFrames = hits.map((h) => frameOf(segs, h.t));
  return (
    <AbsoluteFill>
      <Backdrop tint={accent} />
      <SceneLabel n={n} title={title} color={accent} />
      <SpeedBadge rate={f < totalFrames(segs) ? rateAt(segs, clamped) : 1} />
      <div style={{ position: "absolute", left: 60, top: 150 }}>
        <Terminal lines={lines} now={now} title={terminalTitle} width={720} height={720} fontSize={17} />
      </div>
      <div style={{ position: "absolute", left: 810, top: 150 }}>
        <BrowserFrame url="localhost:3001 · GPU402 Live" width={fw} height={676}>
          <Footage segs={segs} width={fw} take={plan.take} tail={frames - totalFrames(segs) + 20} />
          {hits.map((h, i) => {
            const r = h.cue.panel;
            if (!r) return null;
            return <Highlight key={i} x={(r.x - CONTENT.x) * k} y={r.y * k} w={r.w * k} h={r.h * k} from={capFrames[i]!} to={(capFrames[i + 1] ?? frames) - 6} color={h.cue.accent ?? accent} label={h.cue.label} />;
          })}
        </BrowserFrame>
      </div>
      {hits.map((h, i) => (
        <Caption key={i} from={capFrames[i]!} to={Math.max((capFrames[i + 1] ?? frames) - 6, capFrames[i]! + 45)} accent={h.cue.accent ?? accent}>
          {h.cue.text}
        </Caption>
      ))}
    </AbsoluteFill>
  );
}

/** Tells the viewer how much real time a compressed scene covers. */
export function RealTimeNote({ plan }: { plan: ReturnType<typeof planLive> }) {
  const f = useCurrentFrame();
  const real = (plan.segs[plan.segs.length - 1]!.src1 - plan.segs[0]!.src0) / 1000;
  const o = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", left: 60, top: 884, fontFamily: mono, fontSize: 18, color: C.faint, opacity: o }}>real session time: {real.toFixed(0)} s · idle stretches sped up, key moments at real speed</div>;
}

export const CHAIN_FRAMES = 330;
export function ChainScene() {
  const [start, end] = phaseWindow("chain");
  const segs = timeMap(start, end, [], { hold: 11_000, maxGapMs: 4000 });
  const r = shots.rects.chain;
  const fw = 1240;
  const k = fw / CONTENT.w;
  return (
    <AbsoluteFill>
      <Backdrop tint={C.purple} />
      <SceneLabel n="07" title="Subnet 51, read from chain" color={C.purple} />
      <div style={{ position: "absolute", left: 340, top: 130 }}>
        <BrowserFrame url="localhost:3001 · GPU402 Live" width={fw} height={740}>
          <Footage segs={segs} width={fw} take="tao" tail={CHAIN_FRAMES} />
          {r && <Highlight x={(r.x - CONTENT.x) * k} y={(r.y - 1250) * k} w={r.w * k} h={Math.min(r.h * k, 740 - (r.y - 1250) * k - 12)} from={60} to={CHAIN_FRAMES - 20} color={C.purple} label="Bittensor Finney, live" />}
        </BrowserFrame>
      </div>
      <Caption from={40} to={CHAIN_FRAMES - 12} accent={C.purple}>
        Every rental is demand for Subnet 51's miners. The dashboard reads the subnet straight from Bittensor.
      </Caption>
    </AbsoluteFill>
  );
}

export { Img, Reveal, sans };
