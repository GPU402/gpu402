import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { B, Bg, EASE, Eyebrow, Finish, Flash, GridFloor, Kinetic, LightLeak, Scramble, mono, serif, t01, useSpring } from "./kit";

export const OPEN_FRAMES = 270;

/** Cold open: the real globe of Lium nodes in the dark, and the status code nobody used for 27 years. */
export function Open() {
  const frame = useCurrentFrame();
  // Cropped to the globe alone: the site's own headline sits further left.
  const push = interpolate(frame, [0, OPEN_FRAMES], [2.25, 2.05]);
  const fadeIn = t01(frame, 0, 40);
  const big = useSpring(28, 14, 90);
  return (
    <Bg>
      {/* The live globe, cropped from the real hero recording. */}
      <AbsoluteFill style={{ opacity: fadeIn * 0.75, maskImage: "linear-gradient(90deg, transparent 0%, transparent 30%, black 62%)" }}>
        <OffthreadVideo
          src={staticFile("site/hero.mp4")}
          muted
          style={{ width: 1920, height: 1080, transform: `scale(${push})`, transformOrigin: "100% 42%", filter: "saturate(1.2)" }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(7,8,10,0.96) 0%, rgba(7,8,10,0.75) 45%, rgba(7,8,10,0.2) 100%)" }} />
      <LightLeak color={B.accent} opacity={0.28} />

      <AbsoluteFill style={{ padding: "0 140px", justifyContent: "center" }}>
        <Eyebrow delay={10}>HTTP/1.1 · since 1997</Eyebrow>
        <div style={{ marginTop: 26, fontFamily: mono, fontSize: 260, lineHeight: 0.9, letterSpacing: "-0.04em", color: B.text, transform: `scale(${0.9 + big * 0.1})`, transformOrigin: "0% 50%", opacity: big }}>
          <Scramble text="402" start={28} dur={22} />
        </div>
        <div style={{ marginTop: 18, fontSize: 64, fontWeight: 300, letterSpacing: "-0.03em" }}>
          <Kinetic text="Payment Required." delay={58} />
        </div>
        <div style={{ marginTop: 22, fontFamily: serif, fontStyle: "italic", fontSize: 54, color: B.peri, opacity: t01(frame, 110, 140), transform: `translateY(${(1 - t01(frame, 110, 140)) * 20}px)` }}>
          “Reserved for future use.”
        </div>
        <div style={{ marginTop: 40, fontFamily: mono, fontSize: 24, color: B.faint, opacity: t01(frame, 170, 195) }}>The future just arrived.</div>
      </AbsoluteFill>
      <Flash at={OPEN_FRAMES - 8} />
      <Finish />
    </Bg>
  );
}

export const PROBLEM_FRAMES = 300;

/** The problem, in three beats. */
export function Problem() {
  const frame = useCurrentFrame();
  const beat = (a: number, b: number) => t01(frame, a, a + 14) * (1 - t01(frame, b - 12, b));
  const strike = t01(frame, 150, 180);
  return (
    <Bg>
      <GridFloor opacity={0.5} />
      <LightLeak color={B.rose} from={200} opacity={0.12} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ position: "absolute", opacity: beat(0, 95), fontSize: 110, fontWeight: 300, letterSpacing: "-0.05em" }}>
          <Kinetic text="AI agents can write code." delay={4} />
        </div>
        <div style={{ position: "absolute", opacity: beat(95, 205), fontSize: 110, fontWeight: 300, letterSpacing: "-0.05em" }}>
          <Kinetic text="They can't rent a GPU." delay={100} accent={(w) => (w === "can't" ? { color: B.rose, fontFamily: serif, fontStyle: "italic" } : undefined)} />
          <div style={{ marginTop: 40, display: "flex", gap: 22, justifyContent: "center", fontFamily: mono, fontSize: 30, color: B.muted }}>
            {["credit card", "account", "API key", "a human"].map((w, i) => (
              <span key={w} style={{ position: "relative", opacity: t01(frame, 120 + i * 6, 134 + i * 6) }}>
                {w}
                <span style={{ position: "absolute", left: 0, top: "52%", height: 3, background: B.rose, width: `${Math.min(1, Math.max(0, strike * 4 - i)) * 100}%` }} />
              </span>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", opacity: beat(205, PROBLEM_FRAMES + 10), fontSize: 96, fontWeight: 300, letterSpacing: "-0.05em", lineHeight: 1.05 }}>
          <Kinetic text="So we gave them" delay={210} />
          <div style={{ fontFamily: serif, fontStyle: "italic", color: B.peri, fontSize: 120 }}>
            <Kinetic text="a wallet and a status code." delay={222} />
          </div>
        </div>
      </AbsoluteFill>
      <Finish />
    </Bg>
  );
}

export const REVEAL_FRAMES = 330;

/** The product, live: the real site with its globe of Lium nodes. */
export function Reveal() {
  const frame = useCurrentFrame();
  const word = useSpring(0, 16, 80);
  const shrink = t01(frame, 60, 110);
  const scale = interpolate(shrink, [0, 1], [1, 0.82]);
  return (
    <Bg>
      <AbsoluteFill style={{ transform: `scale(${scale}) translateY(${shrink * 30}px)`, borderRadius: shrink * 24, overflow: "hidden", boxShadow: `0 0 0 1px ${B.hair}, 0 80px 200px -40px rgba(67,96,255,${0.5 * shrink})` }}>
        <OffthreadVideo src={staticFile("site/hero.mp4")} muted style={{ width: 1920, height: 1080 }} />
      </AbsoluteFill>
      {/* Wordmark slam, then it clears to show the live site. */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(7,8,10,${1 - t01(frame, 34, 64)})` }}>
        <div style={{ fontSize: 240, fontWeight: 300, letterSpacing: "-0.07em", opacity: 1 - t01(frame, 40, 62), transform: `scale(${0.8 + word * 0.2}) translateY(${t01(frame, 40, 62) * -60}px)`, filter: `blur(${t01(frame, 40, 62) * 16}px)` }}>
          GPU402
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 40,
          textAlign: "center",
          fontFamily: mono,
          fontSize: 24,
          letterSpacing: "0.16em",
          color: B.muted,
          opacity: t01(frame, 110, 130) * (1 - t01(frame, REVEAL_FRAMES - 20, REVEAL_FRAMES)),
        }}
      >
        LIVE SITE · REAL LIUM NODES · REAL GATEWAY
      </div>
      <Finish vignette={0.5} />
    </Bg>
  );
}

export const PROTOCOL_FRAMES = 540;

const NODES = [
  { id: "agent", x: 330, label: "AI agent", sub: "a wallet, no account" },
  { id: "gw", x: 960, label: "GPU402", sub: "x402 gateway" },
  { id: "lium", x: 1590, label: "Lium", sub: "Subnet 51 miner" },
] as const;

/** One request, drawn: the 402, the signature, the rental, the settlement. */
export function Protocol() {
  const frame = useCurrentFrame();
  const Y = 560;
  const steps = [
    { a: 30, from: 330, to: 960, label: "POST /rent  { gpu: \"RTX 3090\" }", color: B.text },
    { a: 90, from: 960, to: 330, label: "402 Payment Required  ·  $0.057750 USDC  or  0.000247 TAO", color: B.peri, up: true },
    { a: 200, from: 330, to: 960, label: "POST /rent  + PAYMENT-SIGNATURE", color: B.usdc },
    { a: 270, from: 960, to: 1590, label: "rent the cheapest RTX 3090", color: B.live },
    { a: 330, from: 1590, to: 960, label: "pod ready", color: B.live, up: true },
    { a: 400, from: 960, to: 330, label: "201  ·  ssh root@103.158.243.210 -p 8598", color: B.live, up: true },
  ];
  const sign = t01(frame, 150, 175) * (1 - t01(frame, 215, 235));
  const settle = t01(frame, 300, 320);
  return (
    <Bg>
      <GridFloor opacity={0.3} />
      <LightLeak color={B.accent} opacity={0.18} />
      <AbsoluteFill style={{ padding: "90px 140px" }}>
        <Eyebrow n="01">How it works</Eyebrow>
        <div style={{ marginTop: 24, fontSize: 84, fontWeight: 300, letterSpacing: "-0.05em" }}>
          <Kinetic text="One request." delay={4} /> <span style={{ fontFamily: serif, fontStyle: "italic", color: B.peri }}><Kinetic text="Paid in the same breath." delay={14} /></span>
        </div>
      </AbsoluteFill>

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="wire" x1="0" x2="1">
            <stop offset="0" stopColor={B.peri} stopOpacity="0.1" />
            <stop offset="0.5" stopColor={B.peri} stopOpacity="0.5" />
            <stop offset="1" stopColor={B.peri} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <line x1={330} x2={330 + 1260 * t01(frame, 10, 60)} y1={Y} y2={Y} stroke="url(#wire)" strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />
        {steps.map((s, i) => {
          const p = t01(frame, s.a, s.a + 34);
          if (frame < s.a) return null;
          const x = s.from + (s.to - s.from) * p;
          return <circle key={i} cx={x} cy={Y} r={10} fill={s.color} style={{ filter: `drop-shadow(0 0 16px ${s.color})` }} opacity={1 - t01(frame, s.a + 34, s.a + 50)} />;
        })}
      </svg>

      {NODES.map((n, i) => {
        const p = t01(frame, 8 + i * 8, 30 + i * 8);
        const glow = n.id === "agent" ? sign : n.id === "lium" ? t01(frame, 300, 320) : t01(frame, 90, 110) * (1 - t01(frame, 140, 160));
        return (
          <div key={n.id} style={{ position: "absolute", left: n.x - 150, top: Y - 150, width: 300, height: 300, display: "grid", placeItems: "center", opacity: p, transform: `scale(${0.8 + p * 0.2})` }}>
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: 48,
                border: `1px solid ${B.hair}`,
                background: n.id === "gw" ? `linear-gradient(160deg, ${B.accent}, #1d2a99)` : "rgba(235,238,245,0.04)",
                display: "grid",
                placeItems: "center",
                boxShadow: `0 0 ${40 + glow * 80}px ${glow * 20}px ${n.id === "agent" ? B.usdc : n.id === "lium" ? B.live : B.accent}${glow > 0 ? "88" : "00"}`,
                fontFamily: mono,
                fontSize: n.id === "gw" ? 44 : 64,
              }}
            >
              {n.id === "agent" ? "◎" : n.id === "gw" ? "402" : "▣"}
            </div>
            <div style={{ position: "absolute", top: 270, textAlign: "center", width: 400 }}>
              <div style={{ fontSize: 34, fontWeight: 400 }}>{n.label}</div>
              <div style={{ fontFamily: mono, fontSize: 20, color: B.faint, marginTop: 6 }}>{n.sub}</div>
            </div>
          </div>
        );
      })}

      {/* Packet labels */}
      {steps.map((s, i) => {
        const p = t01(frame, s.a + 4, s.a + 20) * (1 - t01(frame, (steps[i + 1]?.a ?? PROTOCOL_FRAMES) - 6, (steps[i + 1]?.a ?? PROTOCOL_FRAMES) + 6));
        if (p <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: s.up ? Y - 250 : Y - 250, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
            <span style={{ fontFamily: mono, fontSize: 30, color: s.color, padding: "12px 24px", borderRadius: 14, background: "rgba(10,11,14,0.9)", border: `1px solid ${s.color}44` }}>{s.label}</span>
          </div>
        );
      })}

      {/* The signature moment */}
      <div style={{ position: "absolute", left: 130, top: Y + 190, width: 420, opacity: sign, transform: `translateY(${(1 - sign) * 20}px)` }}>
        <div style={{ fontFamily: mono, fontSize: 22, color: B.usdc }}>EIP-3009 signature</div>
        <div style={{ fontSize: 26, color: B.muted, marginTop: 6 }}>Signed, not sent. No gas, no account.</div>
      </div>
      <div style={{ position: "absolute", left: 690, top: Y + 270, width: 540, textAlign: "center", opacity: settle * (1 - t01(frame, 470, 500)) }}>
        <div style={{ fontFamily: mono, fontSize: 22, color: B.live }}>settles on-chain only after Lium accepts</div>
        <div style={{ fontSize: 26, color: B.muted, marginTop: 6 }}>If the rental fails, nobody pays.</div>
      </div>
      <Finish />
    </Bg>
  );
}

export { EASE };
