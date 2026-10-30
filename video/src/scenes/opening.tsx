import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Backdrop, BrowserFrame, Caption, Pill, Reveal, SceneLabel, useEnter } from "../components";
import { session } from "../session";
import { C, mono, sans } from "../theme";

export const INTRO_FRAMES = 240;
export function Intro() {
  const f = useCurrentFrame();
  const status = "HTTP/1.1 402 Payment Required";
  const typed = status.slice(0, Math.floor(interpolate(f, [8, 52], [0, status.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const lift = interpolate(f, [92, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logo = useEnter(104, 14);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ transform: `translateY(${-lift * 250}px) scale(${1 - lift * 0.45})`, opacity: 1 - lift * 0.55, textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 76, color: C.text, letterSpacing: -1 }}>
            {typed}
            <span style={{ opacity: Math.floor(f / 12) % 2 ? 1 : 0, color: C.green }}>▍</span>
          </div>
          <Reveal delay={58}>
            <div style={{ fontFamily: sans, fontSize: 34, color: C.muted, marginTop: 18 }}>"Reserved for future use." Since 1997.</div>
          </Reveal>
        </div>
        <div style={{ position: "absolute", top: 400, display: "flex", flexDirection: "column", alignItems: "center", opacity: logo, transform: `scale(${0.85 + logo * 0.15})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div style={{ width: 120, height: 120, borderRadius: 26, border: `2px solid ${C.green}88`, background: `${C.green}18`, display: "grid", placeItems: "center", fontFamily: mono, fontWeight: 700, fontSize: 44, color: C.green, boxShadow: `0 0 80px ${C.green}44` }}>402</div>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 132, color: C.text, letterSpacing: -5 }}>GPU402</div>
          </div>
          <Reveal delay={130}>
            <div style={{ fontFamily: sans, fontSize: 40, color: C.muted, marginTop: 26, textAlign: "center" }}>Decentralized GPUs for any TypeScript program, paid for by the request.</div>
          </Reveal>
          <div style={{ display: "flex", gap: 18, marginTop: 44 }}>
            <Reveal delay={162}><Pill color={C.green}>Lium · Bittensor Subnet 51</Pill></Reveal>
            <Reveal delay={172}><Pill color={C.blue}>x402 · USDC on Base</Pill></Reveal>
            <Reveal delay={182}><Pill color={C.purple}>TAO on Bittensor EVM</Pill></Reveal>
          </div>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 40, width: "100%", textAlign: "center", fontFamily: mono, fontSize: 18, color: C.faint, opacity: interpolate(f, [190, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Everything that follows was recorded live on {new Date(session.startedAt).toUTCString().slice(0, 16)}: real GPUs, real payments.
      </div>
    </AbsoluteFill>
  );
}

export const PROBLEM_FRAMES = 420;
export function Problem() {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, PROBLEM_FRAMES], [1, 1.08]);
  const points = [
    { at: 40, head: "TypeScript gets types, not a client", body: "Every request, retry, poll, SSH session and cleanup is yours to write." },
    { at: 130, head: "Agents need an account before they can pay", body: "Sign up, verify, add a card or a top-up. An agent with a wallet has no way in." },
    { at: 220, head: "Running a job means rebuilding SSH", body: "There is no REST endpoint to run a command on a pod." },
  ];
  return (
    <AbsoluteFill>
      <Backdrop tint={C.red} />
      <SceneLabel n="01" title="The gap" color={C.amber} />
      <div style={{ position: "absolute", left: 72, top: 170, transform: `perspective(1600px) rotateY(9deg) scale(${zoom})`, transformOrigin: "left center", opacity: useEnter(6) }}>
        <BrowserFrame url="docs.lium.io/developers/api" width={900} height={506}>
          <Img src={staticFile("capture/lium-docs.png")} style={{ width: 900, height: 506, objectFit: "cover", objectPosition: "top" }} />
        </BrowserFrame>
      </div>
      <div style={{ position: "absolute", left: 1060, top: 190, width: 780, display: "flex", flexDirection: "column", gap: 34 }}>
        {points.map((p, i) => (
          <Reveal key={i} delay={p.at}>
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ fontFamily: mono, fontSize: 22, color: C.amber, marginTop: 6 }}>0{i + 1}</div>
              <div>
                <div style={{ fontFamily: sans, fontSize: 38, fontWeight: 700, color: C.text, letterSpacing: -0.6 }}>{p.head}</div>
                <div style={{ fontFamily: sans, fontSize: 26, color: C.muted, marginTop: 8, lineHeight: 1.35 }}>{p.body}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Caption from={300} to={PROBLEM_FRAMES - 14} accent={C.amber}>
        Every agent that can't pay is GPU demand Lium's miners never see.
      </Caption>
    </AbsoluteFill>
  );
}

export const HTTP402_FRAMES = 450;
export function Http402() {
  const s = session.http402;
  const fmt = (a: (typeof s.accepts)[number]) => (a.asset === "TAO" ? `${(Number(BigInt(a.amount) / 1_000_000_000n) / 1e9).toFixed(9)} TAO` : `${(Number(a.amount) / 1e6).toFixed(6)} USDC`);
  const net = (n: string) => ({ "eip155:84532": "Base Sepolia", "eip155:945": "Bittensor EVM testnet" })[n] ?? n;
  return (
    <AbsoluteFill>
      <Backdrop tint={C.blue} />
      <SceneLabel n="02" title="One request" color={C.blue} />
      <div style={{ position: "absolute", left: 110, top: 200, display: "flex", gap: 60, alignItems: "flex-start" }}>
        <Reveal delay={10}>
          <div style={{ width: 640, borderRadius: 16, background: C.panel, border: `1px solid ${C.line2}`, padding: 34, fontFamily: mono, fontSize: 24, lineHeight: 1.55 }}>
            <div style={{ color: C.blue, fontWeight: 700 }}>POST /rent</div>
            <div style={{ color: C.muted }}>content-type: application/json</div>
            <div style={{ marginTop: 14, color: C.text }}>{"{"}</div>
            <div style={{ color: C.text, paddingLeft: 28 }}>"gpu": <span style={{ color: C.green }}>"{String(s.request.body.gpu)}"</span>,</div>
            <div style={{ color: C.text, paddingLeft: 28 }}>"blocks": <span style={{ color: C.amber }}>{String(s.request.body.blocks)}</span>,</div>
            <div style={{ color: C.text, paddingLeft: 28 }}>"sshPublicKey": <span style={{ color: C.green }}>"ssh-ed25519 AAAA…"</span></div>
            <div style={{ color: C.text }}>{"}"}</div>
            <div style={{ marginTop: 18, fontFamily: sans, fontSize: 22, color: C.faint }}>No account. No API key. Just a wallet.</div>
          </div>
        </Reveal>
        <Reveal delay={70}>
          <div style={{ width: 1000, borderRadius: 16, background: C.panel, border: `1px solid ${C.blue}66`, boxShadow: `0 0 60px ${C.blue}22`, padding: 34, fontFamily: mono }}>
            <div style={{ fontSize: 34, fontWeight: 700, color: C.blue }}>HTTP/1.1 {s.status} Payment Required</div>
            <div style={{ fontFamily: sans, fontSize: 26, color: C.text, marginTop: 14, lineHeight: 1.4 }}>{s.body.message}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 28 }}>
              {s.accepts.map((a, i) => {
                const color = a.asset === "TAO" ? C.purple : C.blue;
                return (
                  <Reveal key={i} delay={140 + i * 50}>
                    <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 22px", borderRadius: 12, border: `1px solid ${color}55`, background: `${color}10` }}>
                      <div style={{ fontSize: 22, color, width: 90 }}>{a.scheme}</div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: C.text, width: 330 }}>{fmt(a)}</div>
                      <div style={{ fontFamily: sans, fontSize: 24, color: C.muted }}>on {net(a.network)} → {a.payTo.slice(0, 6)}…{a.payTo.slice(-4)}</div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
      <Caption from={40} to={180} accent={C.blue}>An agent asks for a GPU. The gateway answers HTTP 402 with an exact price.</Caption>
      <Caption from={195} to={330} accent={C.purple}>Two ways to pay, same price: USDC on Base, or TAO on Bittensor.</Caption>
      <Caption from={345} to={HTTP402_FRAMES - 14} accent={C.green}>The agent signs a payment from its own wallet and asks again. That's it.</Caption>
    </AbsoluteFill>
  );
}
