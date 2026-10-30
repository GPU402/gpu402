import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import npm from "../../public/site/npm.json";
import { B, Bg, Browser, Callout, Eyebrow, Finish, Flash, GridFloor, Kinetic, LightLeak, Pill, Scramble, mono, serif, t01, useSpring } from "./kit";

export const PLAY_FRAMES = 540;

/** The playground, recorded live: a real quote, then the real 402. */
export function Playground() {
  return (
    <Bg>
      <LightLeak color={B.accent} opacity={0.2} />
      <AbsoluteFill style={{ padding: "60px 110px" }}>
        <Eyebrow n="04">Try it on the site</Eyebrow>
        <div style={{ marginTop: 16, fontSize: 60, fontWeight: 300, letterSpacing: "-0.045em" }}>
          <Kinetic text="Every button sends a real request." delay={4} stagger={3} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 120, alignItems: "center", justifyContent: "center" }}>
        <Browser src="site/playground.mp4" width={1520} tiltFrom={[8, 10]} tiltTo={[3, 3]} zoom={[1.0, 1.1]} focus="30% 40%" />
      </AbsoluteFill>
      <Callout at={40} until={150} x={1180} y={300}>
        Pick any GPU from <b>Lium’s live market</b>
      </Callout>
      <Callout at={150} until={270} x={1180} y={300} color={B.live}>
        <span style={{ fontFamily: mono, color: B.live }}>GET /quote</span>
        <br />A real price, straight from the gateway
      </Callout>
      <Callout at={300} until={500} x={1180} y={300} color={B.peri}>
        <span style={{ fontFamily: mono, color: B.peri }}>HTTP 402</span>, decoded live:
        <br />
        pay in <b style={{ color: B.usdc }}>USDC</b> or <b style={{ color: B.tao }}>TAO</b>
      </Callout>
      <Finish vignette={0.6} />
    </Bg>
  );
}

export const PROOF_FRAMES = 300;

export function Proof() {
  const frame = useCurrentFrame();
  return (
    <Bg>
      <LightLeak color={B.rust} opacity={0.14} />
      <AbsoluteFill style={{ padding: "60px 110px" }}>
        <Eyebrow n="05" color={B.tao}>Proof</Eyebrow>
        <div style={{ marginTop: 16, fontSize: 60, fontWeight: 300, letterSpacing: "-0.045em" }}>
          <Kinetic text="Real money moved." delay={4} />{" "}
          <span style={{ fontFamily: serif, fontStyle: "italic", color: B.tao }}>
            <Kinetic text="On-chain." delay={14} />
          </span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ top: 130, alignItems: "center", justifyContent: "center" }}>
        <Browser src="site/proof.mp4" rate={0.6} width={1480} tiltFrom={[-6, -10]} tiltTo={[2, -2]} zoom={[1.02, 1.12]} focus="50% 70%" />
      </AbsoluteFill>
      <div style={{ position: "absolute", right: 110, top: 70, display: "flex", gap: 14, opacity: t01(frame, 40, 60) }}>
        <Pill color={B.usdc}>USDC · Base Sepolia</Pill>
        <Pill color={B.tao}>TAO · Bittensor EVM</Pill>
      </div>
      <Finish vignette={0.6} />
    </Bg>
  );
}

export const SHIP_FRAMES = 540;

/** Shipped: both packages live on npm (read from the registry), and Lium's approval. */
export function Shipped() {
  const frame = useCurrentFrame();
  const swap = t01(frame, 270, 300);
  const pkgs = npm.packages;
  return (
    <Bg>
      <GridFloor opacity={0.3} />
      <LightLeak color={B.accent} opacity={0.18} />
      {/* Part 1: npm */}
      <AbsoluteFill style={{ padding: "70px 110px", opacity: 1 - swap, transform: `translateX(${-swap * 120}px)` }}>
        <Eyebrow n="06">Shipped</Eyebrow>
        <div style={{ marginTop: 18, fontSize: 88, fontWeight: 300, letterSpacing: "-0.05em" }}>
          <Kinetic text="Live on" delay={4} /> <span style={{ fontFamily: mono, color: "#CB3837" }}><Scramble text="npm" start={16} dur={14} /></span>
        </div>
        <div style={{ marginTop: 50, display: "flex", gap: 40 }}>
          {pkgs.map((p, i) => {
            const s = useSpring(30 + i * 12, 16, 90);
            const cmd = `npm i ${p.name}`;
            const typed = cmd.slice(0, Math.floor(t01(frame, 70 + i * 20, 110 + i * 20) * cmd.length));
            return (
              <div
                key={p.name}
                style={{
                  width: 800,
                  padding: 44,
                  borderRadius: 32,
                  border: `1px solid ${B.hair}`,
                  background: "linear-gradient(160deg, rgba(235,238,245,0.06), rgba(235,238,245,0.015))",
                  transform: `perspective(1600px) rotateY(${(1 - s) * (i ? -25 : 25)}deg) translateY(${(1 - s) * 80}px)`,
                  opacity: s,
                  boxShadow: "0 60px 160px -60px rgba(67,96,255,0.55)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: mono, fontSize: 46 }}>{p.name}</span>
                  <Pill color={B.live}>v{p.version}</Pill>
                </div>
                <div style={{ marginTop: 20, fontSize: 26, color: B.muted, lineHeight: 1.4, height: 112, overflow: "hidden" }}>{p.description}</div>
                <div style={{ marginTop: 26, display: "flex", gap: 36, fontFamily: mono, fontSize: 20, color: B.faint }}>
                  <span>
                    PUBLISHED <span style={{ color: B.text }}>{new Date(p.published).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </span>
                  <span>
                    LICENSE <span style={{ color: B.text }}>{p.license}</span>
                  </span>
                </div>
                <div style={{ marginTop: 30, fontFamily: mono, fontSize: 28, padding: "18px 24px", borderRadius: 16, background: "#0a0b0e", border: `1px solid ${B.hair}` }}>
                  <span style={{ color: B.faint }}>$ </span>
                  {typed}
                  <span style={{ opacity: Math.floor(frame / 15) % 2 ? 1 : 0, color: B.peri }}>▍</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 34, fontFamily: mono, fontSize: 18, color: B.faint, opacity: t01(frame, 120, 140) }}>read from registry.npmjs.org</div>
      </AbsoluteFill>

      {/* Part 2: Lium */}
      <AbsoluteFill style={{ padding: "70px 110px", opacity: swap, transform: `translateX(${(1 - swap) * 120}px)` }}>
        <Eyebrow n="07" color={B.live}>Recognised</Eyebrow>
        <div style={{ display: "flex", gap: 70, marginTop: 40, alignItems: "center" }}>
          <div style={{ width: 760 }}>
            <div style={{ fontSize: 96, fontWeight: 300, letterSpacing: "-0.05em", lineHeight: 1 }}>
              <Kinetic text="Approved by" delay={290} /> <span style={{ fontFamily: serif, fontStyle: "italic", color: B.live }}><Kinetic text="Lium." delay={300} /></span>
            </div>
            <div style={{ marginTop: 30, fontSize: 36, color: B.muted, lineHeight: 1.35, opacity: t01(frame, 320, 345) }}>
              Approved for Lium’s official docs as a <span style={{ color: B.text }}>community-maintained client</span> for Subnet 51.
            </div>
            <div style={{ marginTop: 34, display: "flex", gap: 14, flexWrap: "wrap", opacity: t01(frame, 350, 370) }}>
              <Pill color={B.live}>SSH host keys pinned, as Lium asked</Pill>
              <Pill color={B.peri}>Types from Lium’s OpenAPI</Pill>
            </div>
          </div>
          <div style={{ perspective: 1800, opacity: t01(frame, 300, 330) }}>
            <div style={{ width: 900, borderRadius: 22, overflow: "hidden", border: `1px solid ${B.hair}`, transform: `rotateY(${-16 + t01(frame, 300, 540) * 8}deg) rotateX(4deg)`, boxShadow: "0 60px 160px -60px rgba(61,220,151,0.45)" }}>
              <Img src={staticFile("capture/lium-docs.png")} style={{ width: 900, display: "block" }} />
            </div>
            <div style={{ marginTop: 14, fontFamily: mono, fontSize: 18, color: B.faint, textAlign: "center" }}>Lium’s developer docs</div>
          </div>
        </div>
      </AbsoluteFill>
      <Finish />
    </Bg>
  );
}

export const MONTAGE_FRAMES = 390;

const CUTS = [
  { src: "site/gpu.mp4", from: 40, label: "A real machine, in 3D", sub: "Fans spin up while a pod is live", focus: "50% 45%" },
  { src: "site/api.mp4", from: 20, label: "Plain HTTP", sub: "Every endpoint, runnable in the page", focus: "55% 55%" },
  { src: "site/network.mp4", from: 10, label: "Subnet 51, on chain", sub: "Miners, validators, the live market", focus: "50% 50%" },
];

/** Fast cuts through the rest of the site. */
export function Montage() {
  const frame = useCurrentFrame();
  const len = MONTAGE_FRAMES / CUTS.length;
  return (
    <Bg>
      {CUTS.map((c, i) => (
        <Sequence key={c.src} from={i * len} durationInFrames={len}>
          <Shot {...c} len={len} />
        </Sequence>
      ))}
      {CUTS.map((_, i) => (i ? <Flash key={i} at={i * len - 2} dur={6} /> : null))}
      <Finish />
    </Bg>
  );
}

function Shot({ src, from, label, sub, focus, len }: { src: string; from: number; label: string; sub: string; focus: string; len: number }) {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, len], [1.08, 1.2]);
  const p = t01(frame, 4, 20);
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(src)} startFrom={from} muted style={{ width: 1920, height: 1080, transform: `scale(${z})`, transformOrigin: focus }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(7,8,10,0.92) 0%, transparent 45%)" }} />
      <div style={{ position: "absolute", left: 110, bottom: 90, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
        <div style={{ fontSize: 78, fontWeight: 300, letterSpacing: "-0.045em" }}>{label}</div>
        <div style={{ fontFamily: mono, fontSize: 24, color: B.muted, marginTop: 8 }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
}

export const OUTRO_FRAMES = 360;

export function Outro() {
  const frame = useCurrentFrame();
  const word = useSpring(10, 16, 70);
  return (
    <Bg>
      <AbsoluteFill style={{ opacity: 0.55 * t01(frame, 0, 30), maskImage: "radial-gradient(55% 70% at 62% 50%, black 40%, transparent 75%)" }}>
        <OffthreadVideo src={staticFile("site/hero.mp4")} muted style={{ width: 1920, height: 1080, transform: `scale(${2.2 - t01(frame, 0, OUTRO_FRAMES) * 0.15})`, transformOrigin: "100% 42%" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(7,8,10,0.55), rgba(7,8,10,0.95))" }} />
      <LightLeak color={B.accent} opacity={0.25} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: 210, fontWeight: 300, letterSpacing: "-0.07em", transform: `scale(${0.85 + word * 0.15})`, opacity: word, filter: `blur(${(1 - word) * 14}px)` }}>GPU402</div>
        <div style={{ marginTop: 6, fontSize: 64, fontWeight: 300, letterSpacing: "-0.04em" }}>
          <Kinetic text="GPUs that agents" delay={40} /> <span style={{ fontFamily: serif, fontStyle: "italic", color: B.peri }}><Kinetic text="pay for themselves." delay={50} /></span>
        </div>
        <div style={{ marginTop: 60, display: "flex", gap: 18, opacity: t01(frame, 90, 115) }}>
          <Pill color={B.text}>$ npm i @gpu402/tools</Pill>
          <Pill color={B.peri}>github.com/GPU402/gpu402</Pill>
        </div>
        <div style={{ marginTop: 44, fontFamily: mono, fontSize: 20, letterSpacing: "0.18em", color: B.faint, opacity: t01(frame, 130, 155) }}>
          BITTENSOR BUILDERS HOUSE · TRACK 4 · LIUM · SUBNET 51 · x402
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: B.void, opacity: t01(frame, OUTRO_FRAMES - 30, OUTRO_FRAMES) }} />
      <Finish />
    </Bg>
  );
}
