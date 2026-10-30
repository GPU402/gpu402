"use client";

import { Check, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { cx, useCalmMotion } from "./primitives";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts its children in once they scroll into view. */
export function Reveal({ children, delay = 0, className, depth }: { children: ReactNode; delay?: number; className?: string; depth?: boolean }) {
  return (
    <motion.div
      className={className}
      style={depth ? { transformPerspective: 1400, transformOrigin: "50% 0%" } : undefined}
      initial={depth ? { opacity: 0, rotateX: 18, y: 60, scale: 0.96 } : { opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={depth ? { opacity: 1, rotateX: 0, y: 0, scale: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Numbered section heading: "03 —— Playground", a title, and one line of context. */
export function SectionHead({ n, kicker, title, lede, className }: { n: string; kicker: string; title: ReactNode; lede?: ReactNode; className?: string }) {
  return (
    <Reveal className={cx("max-w-2xl", className)}>
      <p className="eyebrow">
        <span className="text-peri">{n}</span> —— {kicker}
      </p>
      <h2 className="mt-6 text-[clamp(2.2rem,4.6vw,3.8rem)] font-light leading-[1.02] tracking-[-0.045em] text-balance">{title}</h2>
      {lede && <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-muted text-pretty">{lede}</p>}
    </Reveal>
  );
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

/** Cycles through `words`, scrambling letters between them. Static under reduced motion. */
export function Scramble({ words, every = 2600, className }: { words: string[]; every?: number; className?: string }) {
  const reduce = useCalmMotion();
  const [text, setText] = useState(words[0]!);
  const i = useRef(0);
  useEffect(() => {
    if (reduce || words.length < 2) return;
    let raf = 0;
    const t = setInterval(() => {
      i.current = (i.current + 1) % words.length;
      const to = words[i.current]!;
      const from = text;
      const len = Math.max(from.length, to.length);
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / 520, 1);
        const fixed = Math.floor(p * len);
        let out = "";
        for (let k = 0; k < len; k++) out += k < fixed ? (to[k] ?? "") : to[k] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        setText(out);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, every);
    return () => (clearInterval(t), cancelAnimationFrame(raf));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, words, every]);
  return (
    <span className={className} aria-label={words.join(", then ")}>
      <span aria-hidden>{text}</span>
    </span>
  );
}

/** An endless horizontal ticker. Pauses on hover; still under reduced motion. */
export function Marquee({ children, seconds = 50 }: { children: ReactNode; seconds?: number }) {
  return (
    <div className="marquee group relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      {[0, 1].map((k) => (
        <div key={k} aria-hidden={k === 1} className="marquee-track flex shrink-0 items-center gap-10 pr-10" style={{ "--marquee-s": `${seconds}s` } as CSSProperties}>
          {children}
        </div>
      ))}
    </div>
  );
}

/** A card lit by a soft spotlight that follows the pointer. */
export function Spotlight({ children, className, as: As = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" | "article" }) {
  const ref = useRef<HTMLElement>(null);
  const move = (e: PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--sx", `${x}px`);
    el.style.setProperty("--sy", `${y}px`);
    // Lean a few degrees toward the pointer.
    el.style.setProperty("--ry", `${((x / r.width - 0.5) * 7).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - y / r.height) * 7).toFixed(2)}deg`);
  };
  const leave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };
  return (
    <As ref={ref as never} onPointerMove={move} onPointerLeave={leave} className={cx("spotlight tilt relative overflow-hidden rounded-2xl border border-hair bg-ink-1", className)}>
      {children}
    </As>
  );
}

export function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        })
      }
      className={cx(
        "inline-flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] text-muted transition-colors duration-100 hover:bg-ink-2 hover:text-text focus-visible:outline-2 focus-visible:outline-peri",
        className,
      )}
      aria-label={done ? "Copied" : `${label}: ${text.slice(0, 60)}`}
    >
      {done ? <Check className="size-3.5 text-live" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span className="sr-only sm:not-sr-only">{done ? "Copied" : label}</span>
    </button>
  );
}

/** `npm i gpu402` as a chip you can copy. */
export function InstallChip({ cmd, className }: { cmd: string; className?: string }) {
  return (
    <div className={cx("inline-flex min-h-11 items-center gap-1 rounded-full border border-hair bg-void/60 py-1 pl-4 pr-1 backdrop-blur", className)}>
      <span className="num text-[13px] text-faint">$</span>
      <span className="num whitespace-nowrap pl-1.5 pr-1 text-[13px] text-text">{cmd}</span>
      <CopyButton text={cmd} label="Copy" className="rounded-full" />
    </div>
  );
}

// ------------------------------------------------------------------ code

type Lang = "ts" | "bash" | "json" | "http";
/** [pattern, class, capture group to colour (default the whole match)] */
const RULES: Record<Lang, [RegExp, string, number?][]> = {
  ts: [
    // Not after a colon, so "http://" stays a string.
    [/(?<![:"'])\/\/.*$/gm, "c-com"],
    [/(["'`])(?:\\.|(?!\1).)*\1/g, "c-str"],
    [/\b(import|from|const|await|new|export|return|async|function|let)\b/g, "c-kw"],
    [/\b\d[\d_.]*\b/g, "c-num"],
    [/\b([A-Za-z_]\w*)(?=\()/g, "c-fn"],
  ],
  bash: [
    [/#.*$/gm, "c-com"],
    [/(["'])(?:\\.|(?!\1).)*\1/g, "c-str"],
    [/^(\s*)(curl|npm|pnpm|npx|ssh|chmod)\b/gm, "c-kw", 2],
    [/\s(-{1,2}[\w-]+)/g, "c-fn", 1],
  ],
  json: [
    [/"(?:\\.|[^"\\])*"(?=\s*:)/g, "c-key"],
    [/"(?:\\.|[^"\\])*"/g, "c-str"],
    [/\b(true|false|null)\b/g, "c-kw"],
    [/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi, "c-num"],
  ],
  http: [
    [/^(GET|POST|DELETE|HTTP\/\d(?:\.\d)?)\b/gm, "c-kw"],
    [/^([\w-]+)(?=:)/gm, "c-key"],
    [/\b(\d{3})\b/g, "c-num"],
  ],
};

/** Splits code into highlighted spans. Earlier rules win where matches overlap. */
function highlight(code: string, lang: Lang): ReactNode[] {
  const marks: { s: number; e: number; c: string }[] = [];
  for (const [re, c, g = 0] of RULES[lang]) {
    for (const m of code.matchAll(re)) {
      const text = m[g];
      if (!text) continue;
      const s = m.index! + m[0].indexOf(text);
      const e = s + text.length;
      if (!marks.some((x) => s < x.e && e > x.s)) marks.push({ s, e, c });
    }
  }
  marks.sort((a, b) => a.s - b.s);
  const out: ReactNode[] = [];
  let at = 0;
  marks.forEach((m, i) => {
    if (m.s > at) out.push(code.slice(at, m.s));
    out.push(
      <span key={i} className={m.c}>
        {code.slice(m.s, m.e)}
      </span>,
    );
    at = m.e;
  });
  out.push(code.slice(at));
  return out;
}

export function Code({ code, lang, className }: { code: string; lang: Lang; className?: string }) {
  return (
    <pre className={cx("num overflow-x-auto text-[13px] leading-[1.7] text-muted", className)}>
      <code>{highlight(code, lang)}</code>
    </pre>
  );
}
