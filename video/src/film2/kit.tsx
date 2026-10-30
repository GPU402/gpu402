import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, OffthreadVideo, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";

export const { fontFamily: sans } = loadGeist("normal", { weights: ["300", "400", "500", "600"], subsets: ["latin"] });
export const { fontFamily: mono } = loadGeistMono("normal", { weights: ["400", "500"], subsets: ["latin"] });
export const { fontFamily: serif } = loadSerif("italic", { weights: ["400"], subsets: ["latin"] });

/** Brand tokens, from brand.md. */
export const B = {
  void: "#07080A",
  text: "#EDEDF0",
  muted: "#A3A4AB",
  faint: "#7A7C85",
  hair: "rgba(235,238,245,0.09)",
  ink: "rgba(235,238,245,0.04)",
  accent: "#4360FF",
  peri: "#9DB0FF",
  live: "#3DDC97",
  usdc: "#7B93FF",
  tao: "#E8834A",
  amber: "#E0A23A",
  rose: "#F0616D",
  paper: "#F2EFE9",
  rust: "#B85A2E",
  cobalt: "#3B50DD",
};

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

/** 0→1 between two frames, eased. */
export const t01 = (f: number, a: number, b: number, ease = EASE) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export function useSpring(delay = 0, damping = 18, stiffness = 120) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness, mass: 0.9 } });
}

/** Animated film grain, vignette and a faint scanline: the finish on every shot. */
export function Finish({ vignette = 0.75 }: { vignette?: number }) {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,${vignette}) 100%)` }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "screen" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
}

/** A slow light sweep in the accent colour, drifting across the frame. */
export function LightLeak({ color = B.accent, from = 0, speed = 1, opacity = 0.35 }: { color?: string; from?: number; speed?: number; opacity?: number }) {
  const frame = useCurrentFrame();
  const x = 20 + Math.sin((frame + from) / (90 / speed)) * 25;
  const y = 30 + Math.cos((frame + from) / (120 / speed)) * 20;
  return <AbsoluteFill style={{ background: `radial-gradient(45% 55% at ${x}% ${y}%, ${color}, transparent 70%)`, opacity, mixBlendMode: "screen", filter: "blur(40px)" }} />;
}

/** Perspective grid floor, receding to a horizon. */
export function GridFloor({ opacity = 0.35 }: { opacity?: number }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ perspective: 900, overflow: "hidden", opacity }}>
      <div
        style={{
          position: "absolute",
          left: "-50%",
          right: "-50%",
          top: "55%",
          height: "120%",
          transform: "rotateX(72deg)",
          transformOrigin: "50% 0%",
          backgroundImage: `linear-gradient(${B.hair} 1px, transparent 1px), linear-gradient(90deg, ${B.hair} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          backgroundPosition: `0 ${(frame * 2) % 80}px`,
          maskImage: "linear-gradient(to bottom, black, transparent 70%)",
        }}
      />
    </AbsoluteFill>
  );
}

/** Words that rise out of a blur, one after another. */
export function Kinetic({ text, delay = 0, stagger = 4, style, accent }: { text: string; delay?: number; stagger?: number; style?: CSSProperties; accent?: (word: string, i: number) => CSSProperties | undefined }) {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", columnGap: "0.26em", ...style }}>
      {words.map((w, i) => {
        const p = t01(frame, delay + i * stagger, delay + i * stagger + 18);
        return (
          <span key={i} style={{ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 0.5}em)`, filter: `blur(${(1 - p) * 12}px)`, ...accent?.(w, i) }}>
            {w}
          </span>
        );
      })}
    </span>
  );
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

/** Text that resolves from random glyphs, left to right. */
export function Scramble({ text, start, dur = 18, style }: { text: string; start: number; dur?: number; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const p = t01(frame, start, start + dur, Easing.linear);
  const fixed = Math.floor(p * text.length);
  const out = [...text].map((ch, i) => (i < fixed || ch === " " ? ch : frame < start ? "" : GLYPHS[Math.floor(random(`${i}-${Math.floor(frame / 2)}`) * GLYPHS.length)])).join("");
  return <span style={style}>{out}</span>;
}

/** A mono label: "04 —— LIVE RUN". */
export function Eyebrow({ n, children, delay = 0, color = B.peri }: { n?: string; children: ReactNode; delay?: number; color?: string }) {
  const frame = useCurrentFrame();
  const p = t01(frame, delay, delay + 16);
  return (
    <div style={{ fontFamily: mono, fontSize: 20, letterSpacing: "0.18em", textTransform: "uppercase", color: B.faint, opacity: p, transform: `translateX(${(1 - p) * -20}px)` }}>
      {n && <span style={{ color }}>{n}</span>}
      {n && " —— "}
      {children}
    </div>
  );
}

export function Pill({ children, color = B.peri, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 20px",
        borderRadius: 999,
        border: `1px solid ${color}55`,
        background: `${color}14`,
        color,
        fontFamily: mono,
        fontSize: 22,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Real footage of the site in a floating browser window, tilted in 3D, with a slow camera move.
 * `zoom` and `focus` push the camera in on part of the page.
 */
export function Browser({
  src,
  startFrom = 0,
  rate = 1,
  width = 1500,
  tiltFrom = [10, -14],
  tiltTo = [4, -6],
  zoom = [1, 1.06],
  focus = "50% 50%",
  delay = 0,
  url = "localhost:3000",
}: {
  src: string;
  startFrom?: number;
  rate?: number;
  width?: number;
  tiltFrom?: [number, number];
  tiltTo?: [number, number];
  zoom?: [number, number];
  focus?: string;
  delay?: number;
  url?: string;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const enter = useSpring(delay, 20, 90);
  const p = t01(frame, 0, durationInFrames, Easing.inOut(Easing.cubic));
  const rx = interpolate(p, [0, 1], [tiltFrom[0], tiltTo[0]]);
  const ry = interpolate(p, [0, 1], [tiltFrom[1], tiltTo[1]]);
  const z = interpolate(p, [0, 1], zoom);
  const h = (width * 1080) / 1920;
  return (
    <div style={{ perspective: 2200, display: "grid", placeItems: "center" }}>
      <div
        style={{
          width,
          transform: `translateY(${(1 - enter) * 120}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${0.92 + enter * 0.08})`,
          opacity: enter,
          borderRadius: 22,
          overflow: "hidden",
          border: `1px solid ${B.hair}`,
          background: "#0b0c0f",
          boxShadow: `0 80px 200px -60px rgba(67,96,255,0.55), 0 40px 80px -40px rgba(0,0,0,0.9)`,
        }}
      >
        <div style={{ height: 44, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", borderBottom: `1px solid ${B.hair}` }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 12, height: 12, borderRadius: 99, background: "rgba(235,238,245,0.14)" }} />
          ))}
          <span style={{ marginLeft: 16, fontFamily: mono, fontSize: 16, color: B.faint, padding: "4px 14px", borderRadius: 8, background: B.ink }}>{url}</span>
        </div>
        <div style={{ width, height: h, overflow: "hidden" }}>
          <OffthreadVideo
            src={staticFile(src)}
            startFrom={startFrom}
            playbackRate={rate}
            muted
            style={{ width, height: h, transform: `scale(${z})`, transformOrigin: focus }}
          />
        </div>
      </div>
    </div>
  );
}

/** A caption card that slides in, used to point at what is happening in footage. */
export function Callout({ at, until, children, x, y, color = B.peri }: { at: number; until: number; children: ReactNode; x: number; y: number; color?: string }) {
  const frame = useCurrentFrame();
  const inP = t01(frame, at, at + 14);
  const outP = t01(frame, until - 10, until);
  const p = inP * (1 - outP);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: p,
        transform: `translateY(${(1 - inP) * 24}px) scale(${0.96 + p * 0.04})`,
        padding: "18px 26px",
        borderRadius: 18,
        background: "rgba(10,11,14,0.86)",
        border: `1px solid ${color}55`,
        boxShadow: `0 20px 60px -20px ${color}66`,
        backdropFilter: "blur(10px)",
        fontFamily: sans,
        fontSize: 30,
        color: B.text,
        maxWidth: 620,
      }}
    >
      {children}
    </div>
  );
}

/** A fast white flash, for hard cuts. */
export function Flash({ at, dur = 8 }: { at: number; dur?: number }) {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 2, at + dur], [0, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "#fff", opacity: o, mixBlendMode: "screen", pointerEvents: "none" }} />;
}

export const Bg = ({ children }: { children?: ReactNode }) => <AbsoluteFill style={{ background: B.void, fontFamily: sans, color: B.text }}>{children}</AbsoluteFill>;
