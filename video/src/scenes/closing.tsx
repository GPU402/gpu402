import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Backdrop, Caption, Pill, Reveal, SceneLabel, useEnter } from "../components";
import { C, mono, sans } from "../theme";
import { shots } from "./live";

const short = (a: string, n = 6) => `${a.slice(0, n)}…${a.slice(-4)}`;

function Row({ k, v, color = C.text }: { k: string; v: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 24, padding: "11px 0", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ fontFamily: sans, fontSize: 22, color: C.muted }}>{k}</div>
      <div style={{ fontFamily: mono, fontSize: 22, color }}>{v}</div>
    </div>
  );
}

function Receipt({ title, chain, color, rows, delay }: { title: string; chain: string; color: string; rows: { k: string; v: string; color?: string }[]; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div style={{ width: 800, borderRadius: 18, background: C.panel, border: `1px solid ${color}66`, boxShadow: `0 0 70px ${color}22, 0 30px 80px rgba(0,0,0,0.5)`, padding: "30px 34px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: sans, fontSize: 32, fontWeight: 700, color: C.text }}>{title}</div>
          <Pill color={color} size={18}>{chain}</Pill>
        </div>
        {rows.map((r) => (
          <Row key={r.k} {...r} />
        ))}
      </div>
    </Reveal>
  );
}

export const PROOF_FRAMES = 420;
export function ProofScene() {
  const t = shots.taoReceipt;
  const tao = (Number(BigInt(t.valueWei) / 1_000_000_000n) / 1e9).toFixed(9);
  const rpc = [
    { c: C.muted, s: "$ curl https://test.chain.opentensor.ai \\" },
    { c: C.muted, s: "    -d '{\"method\":\"eth_getTransactionReceipt\"," },
    { c: C.muted, s: `        \"params\":[\"${t.tx.slice(0, 18)}…\"]}'` },
    { c: C.text, s: "" },
    { c: C.text, s: "{" },
    { c: C.green, s: '  "status":      "0x1"' },
    { c: C.text, s: `  "blockNumber": ${t.block.toLocaleString()}` },
    { c: C.text, s: `  "chainId":     ${t.chainId}   // Bittensor EVM testnet` },
    { c: C.text, s: `  "from":        "${short(t.from, 8)}"   // agent` },
    { c: C.text, s: `  "to":          "${short(t.to, 8)}"   // GPU402 gateway` },
    { c: C.purple, s: `  "value":       ${tao} TAO` },
    { c: C.text, s: "}" },
  ];
  return (
    <AbsoluteFill>
      <Backdrop tint={C.purple} />
      <SceneLabel n="06" title="Proof, on Bittensor" color={C.purple} />
      <div style={{ position: "absolute", left: 100, top: 170, display: "flex", gap: 60, alignItems: "flex-start" }}>
        <Receipt
          title="TAO payment"
          chain="Bittensor EVM · 945"
          color={C.purple}
          delay={10}
          rows={[
            { k: "status", v: t.status, color: C.green },
            { k: "block", v: t.block.toLocaleString() },
            { k: "from (agent wallet)", v: short(t.from) },
            { k: "to (gateway)", v: short(t.to) },
            { k: "amount", v: `${tao} TAO`, color: C.purple },
            { k: "priced at", v: "$0.05775 · median of 4 TAO/USD feeds" },
            { k: "verified by", v: "the gateway, against the chain" },
            { k: "tx", v: short(t.tx, 10) },
          ]}
        />
        <Reveal delay={70}>
          <div style={{ width: 860, borderRadius: 18, background: "rgba(10,13,18,0.96)", border: `1px solid ${C.line2}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", padding: "26px 30px", fontFamily: mono, fontSize: 21, lineHeight: 1.6 }}>
            <div style={{ fontFamily: sans, fontSize: 22, color: C.faint, marginBottom: 12 }}>Verify it yourself: Bittensor's own RPC</div>
            {rpc.map((l, i) => (
              <Reveal key={i} delay={90 + i * 6} y={6}>
                <div style={{ color: l.c, whiteSpace: "pre", minHeight: 30 }}>{l.s}</div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
      <Reveal delay={150} style={{ position: "absolute", left: 100, top: 790, display: "flex", gap: 18 }}>
        <Pill color={C.purple}>Signed transfer, broadcast only after Lium rents</Pill>
        <Pill color={C.green}>Failed rent → no TAO moves</Pill>
        <Pill color={C.green}>Pod removed on time, every time</Pill>
      </Reveal>
      <Caption from={20} to={210} accent={C.purple}>
        The agent's TAO payment, read straight from Bittensor: agent to gateway, the exact quoted amount.
      </Caption>
      <Caption from={225} to={PROOF_FRAMES - 14} accent={C.green}>
        The gateway rents only after a payment verifies, and moves the TAO only after Lium has rented.
      </Caption>
    </AbsoluteFill>
  );
}

export const OUTRO_FRAMES = 420;
export function Outro() {
  const f = useCurrentFrame();
  const cards = [
    { src: "capture/npm-sdk.png", label: "npmjs.com/package/gpu402", rot: -7, x: 120 },
    { src: "capture/github.png", label: "github.com/GPU402/gpu402", rot: 0, x: 660 },
    { src: "capture/npm-tools.png", label: "npmjs.com/package/@gpu402/tools", rot: 7, x: 1200 },
  ];
  const fadeCards = interpolate(f, [170, 200], [1, 0.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const big = useEnter(185, 14);
  return (
    <AbsoluteFill>
      <Backdrop />
      <SceneLabel n="08" title="Ship it" />
      <div style={{ opacity: fadeCards }}>
        {cards.map((c, i) => (
          <Reveal key={c.src} delay={10 + i * 18} style={{ position: "absolute", left: c.x, top: 200 }}>
            <div style={{ transform: `rotate(${c.rot}deg)`, width: 600, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.line2}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", background: C.panel }}>
              <div style={{ height: 36, display: "flex", alignItems: "center", padding: "0 14px", fontFamily: mono, fontSize: 15, color: C.muted, borderBottom: `1px solid ${C.line}` }}>{c.label}</div>
              <Img src={staticFile(c.src)} style={{ width: 600, height: 338, objectFit: "cover", objectPosition: "top" }} />
            </div>
          </Reveal>
        ))}
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: big, transform: `scale(${0.92 + big * 0.08})` }}>
        <div style={{ fontFamily: mono, fontSize: 64, color: C.text, padding: "22px 40px", borderRadius: 18, background: "rgba(10,13,18,0.92)", border: `1px solid ${C.green}66`, boxShadow: `0 0 90px ${C.green}33` }}>
          <span style={{ color: C.green }}>$</span> npm install gpu402
        </div>
        <div style={{ fontFamily: sans, fontSize: 36, color: C.muted, marginTop: 34, textAlign: "center", lineHeight: 1.45 }}>
          Typed from Lium's own spec. Paid per request with x402, in USDC or TAO.
          <br />
          Every rental is demand for Bittensor Subnet 51's miners.
        </div>
        <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
          <Pill color={C.green}>github.com/GPU402/gpu402</Pill>
          <Pill color={C.blue}>npm · gpu402 · @gpu402/tools</Pill>
          <Pill color={C.purple}>MIT · open source</Pill>
        </div>
        <div style={{ fontFamily: sans, fontSize: 22, color: C.faint, marginTop: 46 }}>Built for Bittensor Builders House · Track 4 · a community project, not maintained by Lium</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
