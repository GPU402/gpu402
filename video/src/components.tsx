import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Line } from "./session";
import { C, mono, sans } from "./theme";

/** Slowly drifting grid with two soft glows. */
export function Backdrop({ tint = C.green }: { tint?: string }) {
  const f = useCurrentFrame();
  const drift = (f * 0.25) % 48;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: `${drift}px ${drift}px`,
          maskImage: "radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)",
        }}
      />
      <div style={{ position: "absolute", left: -300, top: -300, width: 1100, height: 1100, borderRadius: "50%", background: tint, opacity: 0.07, filter: "blur(160px)", transform: `translate(${Math.sin(f / 90) * 60}px, ${Math.cos(f / 110) * 40}px)` }} />
      <div style={{ position: "absolute", right: -350, bottom: -400, width: 1200, height: 1200, borderRadius: "50%", background: C.blue, opacity: 0.06, filter: "blur(180px)", transform: `translate(${Math.cos(f / 100) * 50}px, ${Math.sin(f / 80) * 50}px)` }} />
    </AbsoluteFill>
  );
}

export function useEnter(delay = 0, damping = 18) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping, mass: 0.8 } });
}

/** Fade + rise in, fade out near the end of `dur`. */
export function Reveal({ delay = 0, dur, children, style, y = 24 }: { delay?: number; dur?: number; children: ReactNode; style?: CSSProperties; y?: number }) {
  const f = useCurrentFrame();
  const p = useEnter(delay);
  const out = dur ? interpolate(f, [delay + dur - 10, delay + dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return <div style={{ opacity: p * out, transform: `translateY(${(1 - p) * y}px)`, ...style }}>{children}</div>;
}

/** Scene number and title, top-left. */
export function SceneLabel({ n, title, color = C.green }: { n: string; title: string; color?: string }) {
  const p = useEnter(4);
  return (
    <div style={{ position: "absolute", left: 72, top: 56, display: "flex", alignItems: "center", gap: 16, opacity: p, transform: `translateX(${(1 - p) * -20}px)`, fontFamily: sans }}>
      <div style={{ fontFamily: mono, fontSize: 20, color, border: `1px solid ${color}55`, background: `${color}14`, borderRadius: 8, padding: "6px 12px" }}>{n}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color: C.text, letterSpacing: -0.3 }}>{title}</div>
    </div>
  );
}

/** Bottom caption: appears at `from`, stays until `to` (scene frames). */
export function Caption({ from, to, children, accent = C.green }: { from: number; to: number; children: ReactNode; accent?: string }) {
  const f = useCurrentFrame();
  if (f < from - 2 || f > to + 12) return null;
  const inP = interpolate(f, [from, from + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP = interpolate(f, [to, to + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", opacity: inP * outP, transform: `translateY(${(1 - inP) * 16}px)` }}>
      <div style={{ maxWidth: 1500, display: "flex", alignItems: "center", gap: 18, padding: "18px 30px", borderRadius: 16, background: "rgba(8,11,16,0.86)", border: `1px solid ${C.line2}`, boxShadow: `0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px ${accent}22`, backdropFilter: "blur(12px)" }}>
        <div style={{ width: 10, height: 10, borderRadius: 5, background: accent, boxShadow: `0 0 18px ${accent}` }} />
        <div style={{ fontFamily: sans, fontSize: 34, fontWeight: 500, color: C.text, letterSpacing: -0.2, lineHeight: 1.3 }}>{children}</div>
      </div>
    </div>
  );
}

/** "4× speed" badge whenever footage is compressed. */
export function SpeedBadge({ rate }: { rate: number }) {
  const show = rate > 1.25;
  return (
    <div style={{ position: "absolute", right: 72, top: 60, fontFamily: mono, fontSize: 22, color: show ? C.amber : "transparent", border: `1px solid ${show ? C.amber + "66" : "transparent"}`, background: show ? `${C.amber}14` : "transparent", borderRadius: 8, padding: "6px 12px" }}>
      ▶▶ {rate >= 10 ? Math.round(rate) : rate.toFixed(1)}× speed
    </div>
  );
}

const lineColor = (t: string) =>
  t.startsWith("✓") ? C.green : t.startsWith("▸") ? "#d58cff" : t.startsWith("⇢") ? C.amber : t.startsWith("…") || t.startsWith("  …") ? C.faint : /error|Error|✘/.test(t) ? C.red : t.startsWith("|") || t.startsWith("+") ? "#9fb0c4" : C.text;

/** Terminal window replaying real transcript lines up to `now` (ms). */
export function Terminal({ lines, now, title, width, height, fontSize = 19, prompt }: { lines: Line[]; now: number; title: string; width: number; height: number; fontSize?: number; prompt?: string }) {
  const visible = lines.filter((l) => l.t <= now);
  const rows = Math.floor((height - 64) / (fontSize * 1.5));
  const shown = visible.slice(-rows);
  const last = visible[visible.length - 1];
  const fresh = last ? Math.max(0, 1 - (now - last.t) / 400) : 0;
  return (
    <div style={{ width, height, borderRadius: 14, background: "rgba(10,13,18,0.96)", border: `1px solid ${C.line2}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", borderBottom: `1px solid ${C.line}`, background: C.panel }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
        ))}
        <div style={{ marginLeft: 12, fontFamily: mono, fontSize: 16, color: C.muted }}>{title}</div>
      </div>
      <div style={{ flex: 1, padding: "14px 20px", fontFamily: mono, fontSize, lineHeight: 1.5, overflow: "hidden" }}>
        {prompt && visible.length === 0 && <div style={{ color: C.green }}>{prompt}</div>}
        {shown.map((l, i) => (
          <div key={`${l.t}-${i}`} style={{ color: lineColor(l.text), whiteSpace: "pre", overflow: "hidden", textOverflow: "ellipsis", opacity: i === shown.length - 1 ? 0.55 + 0.45 * (1 - fresh) + 0.45 * fresh : 1 }}>
            {l.text}
          </div>
        ))}
        <span style={{ display: "inline-block", width: fontSize * 0.6, height: fontSize * 1.1, background: C.green, opacity: Math.floor(now / 500) % 2 ? 0.9 : 0.15, verticalAlign: "text-bottom" }} />
      </div>
    </div>
  );
}

/** A browser window around real footage or a screenshot. */
export function BrowserFrame({ url, width, height, children }: { url: string; width: number; height: number; children: ReactNode }) {
  return (
    <div style={{ width, height: height + 44, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.line2}`, boxShadow: "0 30px 90px rgba(0,0,0,0.65)", background: C.panel }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", gap: 8, padding: "0 16px", borderBottom: `1px solid ${C.line}` }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
        ))}
        <div style={{ marginLeft: 16, flex: 1, maxWidth: 620, height: 28, borderRadius: 8, background: C.bg, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", padding: "0 12px", fontFamily: mono, fontSize: 15, color: C.muted }}>{url}</div>
      </div>
      <div style={{ position: "relative", width, height, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

/** Pulsing outline around a region (coordinates in the frame's own pixels). */
export function Highlight({ x, y, w, h, from, to, color = C.green, label }: { x: number; y: number; w: number; h: number; from: number; to: number; color?: string; label?: string }) {
  const f = useCurrentFrame();
  if (f < from || f > to + 10) return null;
  const inP = interpolate(f, [from, from + 8], [0, 1], { extrapolateRight: "clamp" });
  const outP = interpolate(f, [to, to + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 0.6 + 0.4 * Math.sin((f - from) / 5);
  return (
    <div style={{ position: "absolute", left: x - 6, top: y - 6, width: w + 12, height: h + 12, borderRadius: 14, border: `3px solid ${color}`, boxShadow: `0 0 ${24 * pulse}px ${color}aa, inset 0 0 ${16 * pulse}px ${color}33`, opacity: inP * outP, pointerEvents: "none" }}>
      {label && (
        <div style={{ position: "absolute", top: -40, left: 0, fontFamily: sans, fontSize: 20, fontWeight: 600, color: C.bg, background: color, padding: "4px 12px", borderRadius: 8 }}>{label}</div>
      )}
    </div>
  );
}

export function Pill({ children, color = C.green, size = 22 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <span style={{ fontFamily: mono, fontSize: size, color, border: `1px solid ${color}55`, background: `${color}14`, borderRadius: 10, padding: "6px 14px", whiteSpace: "nowrap" }}>{children}</span>
  );
}
