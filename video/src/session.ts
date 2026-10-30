// The recorded session and a time map that compresses idle stretches while
// keeping every key moment at real speed. Source time (ms since recording
// start) maps to video frames scene by scene.
import raw from "../public/capture/session.json";
import rawTao from "../public/capture/session-tao.json";
import { FPS } from "./theme";

export interface Line {
  phase: string;
  t: number;
  stream: string;
  text: string;
}
export interface GatewayEvent {
  t: number;
  type: string;
  message: string;
  data: { url?: string; tx?: string; network?: string } | null;
}
export interface Session {
  startedAt: string;
  durationMs: number;
  phases: { name: string; label: string; t: number }[];
  lines: Line[];
  events: GatewayEvent[];
  http402: {
    status: number;
    request: { method: string; path: string; body: Record<string, unknown> };
    body: { error: string; message: string; quote: Record<string, unknown> };
    accepts: { scheme: string; network: string; asset: string; amount: string; payTo: string }[];
  };
}

/** Main take: 402, SDK, agent paying USDC. Second take: agent paying TAO, Subnet 51 scroll. */
export const session = raw as unknown as Session;
export const sessionTao = rawTao as unknown as Session;
export type Take = "main" | "tao";
export const takeOf = (phase: string): Take => (phase === "tao" || phase === "chain" ? "tao" : "main");
export const sessionOf = (take: Take) => (take === "tao" ? sessionTao : session);
export const footageOf = (take: Take) => (take === "tao" ? "capture/dashboard-tao.mp4" : "capture/dashboard.mp4");

export function phaseWindow(name: string): [number, number] {
  const s = sessionOf(takeOf(name));
  const i = s.phases.findIndex((p) => p.name === name);
  if (i < 0) throw new Error(`No phase ${name} in the recording`);
  const start = s.phases[i]!.t;
  const end = s.phases[i + 1]?.t ?? s.durationMs;
  return [start, end];
}

export interface Segment {
  /** Source window, ms. */
  src0: number;
  src1: number;
  /** Playback rate (1 = real time). */
  rate: number;
  /** Video frames this segment occupies. */
  frames: number;
  /** First video frame of the segment, relative to the scene. */
  at: number;
}

/**
 * Real speed for `hold` ms after each key moment; everything between key
 * moments is squeezed so no idle gap shows for more than ~`maxGapMs`.
 */
export function timeMap(start: number, end: number, keys: number[], opts: { hold?: number; maxGapMs?: number; maxRate?: number } = {}): Segment[] {
  const hold = opts.hold ?? 2200;
  const maxGap = opts.maxGapMs ?? 1800;
  const maxRate = opts.maxRate ?? 16;
  const marks = [...new Set([start, ...keys.filter((k) => k > start && k < end), end])].sort((a, b) => a - b);
  const segs: Segment[] = [];
  let at = 0;
  const push = (src0: number, src1: number, rate: number) => {
    if (src1 - src0 < 30) return;
    const frames = Math.max(1, Math.round(((src1 - src0) / 1000 / rate) * FPS));
    segs.push({ src0, src1, rate, frames, at });
    at += frames;
  };
  for (let i = 0; i < marks.length - 1; i++) {
    const a = marks[i]!;
    const b = marks[i + 1]!;
    const real = Math.min(hold, b - a);
    push(a, a + real, 1);
    const rest = b - (a + real);
    if (rest > 0) push(a + real, b, Math.min(Math.max(rest / maxGap, 1), maxRate));
  }
  return segs;
}

export const totalFrames = (segs: Segment[]) => segs.reduce((s, x) => s + x.frames, 0);

/** Source time shown at a scene-relative frame. */
export function srcAt(segs: Segment[], frame: number): number {
  const s = segs.find((x) => frame >= x.at && frame < x.at + x.frames) ?? segs[segs.length - 1]!;
  const local = Math.min(frame - s.at, s.frames);
  return s.src0 + (local / FPS) * 1000 * s.rate;
}

export function rateAt(segs: Segment[], frame: number): number {
  return (segs.find((x) => frame >= x.at && frame < x.at + x.frames) ?? segs[segs.length - 1]!).rate;
}

/** Scene-relative frame at which a source time is shown. */
export function frameOf(segs: Segment[], t: number): number {
  const s = segs.find((x) => t >= x.src0 && t <= x.src1) ?? (t < segs[0]!.src0 ? segs[0]! : segs[segs.length - 1]!);
  return Math.round(s.at + ((Math.min(Math.max(t, s.src0), s.src1) - s.src0) / 1000 / s.rate) * FPS);
}

export const linesOf = (phase: string) => sessionOf(takeOf(phase)).lines.filter((l) => l.phase === phase);
export const eventsIn = (phase: string, start: number, end: number) => sessionOf(takeOf(phase)).events.filter((e) => e.t >= start && e.t <= end);
