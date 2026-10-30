// The real agent runs, replayed from the recorded sessions. Every line and every
// gateway event below is verbatim from public/capture/session*.json; only the idle
// waiting is shortened, and the film says so on screen.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import raw from "../../public/capture/session.json";
import rawTao from "../../public/capture/session-tao.json";
import { B, Bg, Eyebrow, Finish, Kinetic, LightLeak, mono, sans, serif, t01, useSpring } from "./kit";

type Line = { phase: string; t: number; text: string };
type Ev = { t: number; type: string; message: string };
const agentLines = (raw.lines as Line[]).filter((l) => l.phase === "agent");
const agentEvents = (raw.events as Ev[]).filter((e) => e.t > 60_000);
const taoLines = (rawTao.lines as Line[]).filter((l) => l.phase === "tao");
const taoEvents = rawTao.events as Ev[];

const find = (lines: Line[], re: RegExp) => {
  const l = lines.find((x) => re.test(x.text));
  if (!l) throw new Error(`No recorded line matches ${re}`);
  return l.text;
};
const ev = (events: Ev[], type: string) => events.find((e) => e.type === type)!;

type Shown = { at: number; text: string; tone: "head" | "task" | "tool" | "ok" | "dim" | "out" | "big" };

const S = 30; // frames per second

/** What the terminal shows, and when (in scene frames). Text is the recorded text. */
const AGENT: Shown[] = [
  { at: 10, text: find(agentLines, /^GPU402 agent demo/).replace(/\s+wallet.*$/, ""), tone: "head" },
  { at: 30, text: find(agentLines, /^Task:/), tone: "task" },
  { at: 4 * S, text: find(agentLines, /^▸ listGpus/), tone: "tool" },
  { at: 5 * S, text: find(agentLines, /^⇢ rentGpu/), tone: "dim" },
  { at: 7 * S, text: find(agentLines, /HTTP 402 answered/), tone: "ok" },
  { at: 9 * S, text: find(agentLines, /is starting on a Bittensor SN51 miner/), tone: "ok" },
  { at: 10 * S, text: "  … pod starting → pending → running", tone: "dim" },
  { at: 14 * S, text: find(agentLines, /✓ GPU ready/), tone: "ok" },
  { at: 16 * S, text: "▸ runOnGpu  nvidia-smi && python3 matmul.py  (8192×8192, fp16)", tone: "tool" },
  { at: 18 * S, text: find(agentLines, /NVIDIA-SMI .* CUDA Version/), tone: "out" },
  { at: 18 * S + 4, text: find(agentLines, /^\|\s+0\s+NVIDIA GeForce RTX 3090/), tone: "out" },
  { at: 18 * S + 8, text: find(agentLines, /^\|\s+0%\s+51C/), tone: "out" },
  { at: 21 * S, text: find(agentLines, /^\d+(\.\d+)? TFLOPS$/), tone: "big" },
  { at: 26 * S, text: find(agentLines, /^✓ GPU released/), tone: "ok" },
  { at: 28 * S, text: find(agentLines, /measured .* TFLOPS/), tone: "task" },
];

const TONE: Record<Shown["tone"], React.CSSProperties> = {
  head: { color: B.faint },
  task: { color: B.text },
  tool: { color: B.peri },
  ok: { color: B.live },
  dim: { color: B.faint },
  out: { color: B.muted, whiteSpace: "pre", fontSize: 19 },
  big: { color: B.text },
};

function Terminal({ lines, title, width = 1080 }: { lines: Shown[]; title: string; width?: number }) {
  const frame = useCurrentFrame();
  const enter = useSpring(0, 20, 90);
  const visible = lines.filter((l) => frame >= l.at);
  return (
    <div style={{ perspective: 2000 }}>
      <div
        style={{
          width,
          height: 760,
          borderRadius: 24,
          overflow: "hidden",
          background: "#0a0b0e",
          border: `1px solid ${B.hair}`,
          boxShadow: "0 80px 200px -60px rgba(67,96,255,0.5)",
          transform: `rotateY(${8 - enter * 8 + 6}deg) rotateX(${(1 - enter) * 10 + 2}deg) translateY(${(1 - enter) * 80}px)`,
          opacity: enter,
        }}
      >
        <div style={{ height: 50, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: `1px solid ${B.hair}` }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 12, height: 12, borderRadius: 99, background: "rgba(235,238,245,0.14)" }} />
          ))}
          <span style={{ marginLeft: 14, fontFamily: mono, fontSize: 18, color: B.muted }}>{title}</span>
          <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: 14, letterSpacing: "0.16em", color: B.faint }}>RECORDED · LIVE TESTNET</span>
        </div>
        <div style={{ padding: "26px 30px", display: "grid", gap: 14, fontFamily: mono, fontSize: 22, lineHeight: 1.45 }}>
          {visible.map((l, i) => {
            const p = t01(frame, l.at, l.at + 10);
            const chars = Math.floor(t01(frame, l.at, l.at + Math.min(24, l.text.length / 3)) * l.text.length);
            if (l.tone === "big") {
              const s = useBig(frame, l.at);
              return (
                <div key={i} style={{ fontFamily: sans, fontWeight: 300, fontSize: 96, letterSpacing: "-0.04em", color: B.text, transform: `scale(${0.6 + s * 0.4})`, transformOrigin: "0% 50%", opacity: s, textShadow: `0 0 60px ${B.accent}` }}>
                  {l.text}
                </div>
              );
            }
            return (
              <div key={i} style={{ ...TONE[l.tone], opacity: p, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: l.tone === "out" ? "pre" : "normal", wordBreak: "break-all" }}>
                {l.text.slice(0, Math.max(chars, l.tone === "out" ? l.text.length : 0))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** A quick overshoot pop for the headline number. */
const useBig = (frame: number, at: number) => interpolate(frame - at, [0, 6, 14], [0, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** The gateway's own record of the same run, lighting up as it happened. */
function Steps({ steps }: { steps: { at: number; label: string; detail: string; color: string }[] }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "grid", gap: 18, width: 560 }}>
      {steps.map((s, i) => {
        const on = t01(frame, s.at, s.at + 12);
        return (
          <div key={i} style={{ display: "flex", gap: 18, alignItems: "flex-start", opacity: 0.25 + on * 0.75 }}>
            <span style={{ marginTop: 8, width: 16, height: 16, borderRadius: 99, flexShrink: 0, background: on > 0.5 ? s.color : "transparent", border: `2px solid ${on > 0.5 ? s.color : B.faint}`, boxShadow: on > 0.5 ? `0 0 20px ${s.color}` : "none" }} />
            <div>
              <div style={{ fontSize: 30, fontWeight: 400, color: B.text }}>{s.label}</div>
              <div style={{ fontFamily: mono, fontSize: 17, color: B.muted, marginTop: 4, lineHeight: 1.4 }}>{s.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const AGENT_FRAMES = 1050;

export function AgentRun() {
  const frame = useCurrentFrame();
  const real = (agentLines.at(-1)!.t - agentLines[0]!.t) / 1000;
  const steps = [
    { at: 6 * S, label: "402 quote", detail: ev(agentEvents, "quote.issued").message, color: B.peri },
    { at: 7 * S, label: "Payment verified", detail: ev(agentEvents, "payment.verified").message, color: B.usdc },
    { at: 9 * S, label: "Rented on Lium", detail: ev(agentEvents, "pod.rented").message, color: B.live },
    { at: 9 * S + 10, label: "Settled on Base", detail: ev(agentEvents, "payment.settled").message, color: B.usdc },
    { at: 14 * S, label: "GPU ready", detail: ev(agentEvents, "pod.ready").message.replace(/ · paid until.*/, ""), color: B.live },
    { at: 26 * S, label: "Released", detail: "Lium stops billing the second it is stopped", color: B.faint },
  ];
  return (
    <Bg>
      <LightLeak color={B.accent} opacity={0.2} />
      <AbsoluteFill style={{ padding: "70px 110px" }}>
        <Eyebrow n="02">A real agent · Gemini · pays in USDC</Eyebrow>
        <div style={{ marginTop: 18, fontSize: 64, fontWeight: 300, letterSpacing: "-0.045em" }}>
          <Kinetic text="It rents its own GPU, runs a benchmark," delay={4} stagger={3} />{" "}
          <span style={{ fontFamily: serif, fontStyle: "italic", color: B.peri }}>
            <Kinetic text="and gives it back." delay={22} stagger={3} />
          </span>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 110, top: 250 }}>
        <Terminal lines={AGENT} title="pnpm demo:agent" />
      </div>
      <div style={{ position: "absolute", right: 110, top: 290 }}>
        <Eyebrow delay={20}>The gateway's ledger</Eyebrow>
        <div style={{ marginTop: 26 }}>
          <Steps steps={steps} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 110, bottom: 36, fontFamily: mono, fontSize: 18, color: B.faint, opacity: t01(frame, 60, 80) }}>
        Recorded on 30 Oct 2026. {Math.round(real)} s of real time, waiting shortened.
      </div>
      <Finish />
    </Bg>
  );
}

export const TAO_FRAMES = 390;

const TAO: Shown[] = [
  { at: 10, text: find(taoLines, /payWith: tao/), tone: "tool" },
  { at: 50, text: find(taoLines, /HTTP 402 answered in TAO/), tone: "ok" },
  { at: 90, text: `✓ ${ev(taoEvents, "payment.settled").message}`, tone: "ok" },
  { at: 130, text: find(taoLines, /✓ GPU ready/), tone: "ok" },
  { at: 160, text: find(taoLines, /^NVIDIA GeForce RTX 3090, /), tone: "out" },
  { at: 190, text: find(taoLines, /^✓ GPU released/), tone: "ok" },
];

export function TaoRun() {
  const frame = useCurrentFrame();
  const big = t01(frame, 230, 262);
  return (
    <Bg>
      <LightLeak color={B.tao} opacity={0.22} />
      <AbsoluteFill style={{ padding: "70px 110px" }}>
        <Eyebrow n="03" color={B.tao}>Same tools · pays in TAO</Eyebrow>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 110, top: 170, transform: `scale(${1 - big * 0.12})`, transformOrigin: "0% 0%", opacity: 1 - big * 0.55 }}>
        <Terminal lines={TAO} title="agent tools · payWith: tao" width={1240} />
      </div>
      <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "flex-end", padding: "0 110px 110px" }}>
        <div style={{ textAlign: "right", opacity: big, transform: `translateY(${(1 - big) * 40}px)` }}>
          <div style={{ fontSize: 92, fontWeight: 300, letterSpacing: "-0.05em" }}>Bittensor money in.</div>
          <div style={{ fontSize: 92, fontFamily: serif, fontStyle: "italic", color: B.tao }}>Bittensor compute out.</div>
        </div>
      </AbsoluteFill>
      <Finish />
    </Bg>
  );
}
