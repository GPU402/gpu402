import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop, Caption, Reveal, SceneLabel, SpeedBadge, Terminal } from "../components";
import { frameOf, linesOf, phaseWindow, rateAt, srcAt, timeMap, totalFrames } from "../session";
import { C, mono, sans } from "../theme";

const CODE = [
  ['import', ' { Lium, generateSshKeyPair } ', 'from', ' "gpu402";'],
  ["", "", "", ""],
  ['const', ' ssh = generateSshKeyPair();', "", ""],
  ['const', ' lium = ', 'new', ' Lium({ apiKey: process.env.LIUM_API_KEY });'],
  ['const', ' pod = ', 'await', ' lium.rentCheapest({ gpu: "RTX3090", ttlMinutes: 15, sshPublicKey: ssh.publicKey });'],
  ['await', ' lium.exec(', 'await', ' lium.waitReady(pod.podId), "nvidia-smi", { privateKey: ssh.privateKey });'],
  ['await', ' lium.stop(pod.podId);', "", ""],
];

const CUES: { re: RegExp; text: string; accent?: string }[] = [
  { re: /^Renting the cheapest/, text: "npm install gpu402. A few lines of TypeScript rent the cheapest RTX 3090 on Lium." },
  { re: /^Pod .* on node/, text: "Rented at $0.21/hour. Lium also schedules the pod's removal itself, so cost can't leak." },
  { re: /^Ready:/, text: "Ready, with SSH, in under half a minute." },
  { re: /NVIDIA-SMI/, text: "A real command on a real GPU, served by a Bittensor Subnet 51 miner." },
  { re: /^Stopped\./, text: "Stopped. Lium billed it to the second.", accent: C.green },
];

export function planSdk() {
  const [start, end] = phaseWindow("sdk");
  const lines = linesOf("sdk");
  const hits = CUES.map((c) => ({ c, t: lines.find((l) => c.re.test(l.text))?.t })).filter((h): h is { c: (typeof CUES)[number]; t: number } => h.t !== undefined);
  const segs = timeMap(start, end, [...hits.map((h) => h.t), ...lines.map((l) => l.t)], { hold: 2400, maxGapMs: 1200 });
  return { segs, lines, hits, frames: totalFrames(segs) + 40 };
}

export function SdkScene({ plan }: { plan: ReturnType<typeof planSdk> }) {
  const f = useCurrentFrame();
  const { segs, lines, hits, frames } = plan;
  const end = totalFrames(segs) - 1;
  const now = srcAt(segs, Math.min(f, end));
  const caps = hits.map((h) => frameOf(segs, h.t));
  const chars = interpolate(f, [6, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const total = CODE.flat().join("").length;
  let budget = Math.floor(chars * total);
  return (
    <AbsoluteFill>
      <Backdrop />
      <SceneLabel n="03" title="The SDK" />
      <SpeedBadge rate={f < end ? rateAt(segs, Math.min(f, end)) : 1} />
      <Reveal delay={0} style={{ position: "absolute", left: 60, top: 150 }}>
        <div style={{ width: 780, borderRadius: 14, background: "rgba(10,13,18,0.96)", border: `1px solid ${C.line2}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", padding: "26px 28px", fontFamily: mono, fontSize: 19, lineHeight: 1.65 }}>
          <div style={{ fontFamily: sans, fontSize: 18, color: C.faint, marginBottom: 12 }}>quickstart.ts</div>
          {CODE.map((row, i) => (
            <div key={i} style={{ whiteSpace: "pre-wrap", minHeight: 30 }}>
              {row.map((tok, j) => {
                const take = Math.max(0, Math.min(tok.length, budget));
                budget -= tok.length;
                return (
                  <span key={j} style={{ color: j % 2 === 0 ? "#d58cff" : C.text }}>
                    {tok.slice(0, take)}
                  </span>
                );
              })}
            </div>
          ))}
          <div style={{ marginTop: 18, display: "flex", gap: 12, fontFamily: sans, fontSize: 18, color: C.muted }}>
            <span style={{ color: C.green }}>✓</span> typed from Lium's OpenAPI spec · retries · budget guard · SSH exec
          </div>
        </div>
      </Reveal>
      <div style={{ position: "absolute", left: 880, top: 150 }}>
        <Terminal lines={lines} now={now} title="pnpm demo:sdk RTX3090  (live, real Lium GPU)" width={980} height={720} fontSize={16} prompt="$ pnpm demo:sdk RTX3090" />
      </div>
      {hits.map((h, i) => (
        <Caption key={i} from={caps[i]!} to={Math.max((caps[i + 1] ?? frames) - 6, caps[i]! + 50)} accent={h.c.accent ?? C.green}>
          {h.c.text}
        </Caption>
      ))}
    </AbsoluteFill>
  );
}
