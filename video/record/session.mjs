// Records one real GPU402 session for the demo film.
//
//   - Chrome screencasts the live dashboard (1920x1080) for the whole session
//   - every terminal line of each real demo is saved with its offset from T0
//   - every gateway event (402, verified, rented, settled, ready, removed) is saved from the SSE feed
//
// Nothing is simulated: the demos rent real Lium GPUs and pay real testnet USDC and TAO.
// Output: video/public/capture/{dashboard.webm, session.json}
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../..");
const out = resolve(here, "../public/capture");
mkdirSync(out, { recursive: true });

const GATEWAY = process.env.GATEWAY_URL ?? "http://localhost:4020";
const DASHBOARD = process.env.DASHBOARD_URL ?? "http://localhost:3001";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// TAKE=tao records only the TAO payment and the Subnet 51 scroll, into session-tao.json / dashboard-tao.webm.
// TAKE=taoagent records the AI agent paying in TAO (Gemini) and the Subnet 51 scroll, into *-taoagent files.
const TAKE = process.env.TAKE ?? "main";
const PHASES = { main: ["http402", "sdk", "agent"], tao: ["tao", "chain"], taoagent: ["agent", "chain"] }[TAKE];
const only = (name) => PHASES.includes(name);
const suffix = TAKE === "main" ? "" : `-${TAKE}`;

const session = { startedAt: null, phases: [], lines: [], events: [], http402: null, durationMs: 0 };
let T0 = 0;
const now = () => Date.now() - T0;
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");

function phase(name, label) {
  session.phases.push({ name, label, t: now() });
  console.log(`\n[${(now() / 1000).toFixed(1)}s] ── ${label}`);
}

function run(phaseName, cmd, args, env = {}) {
  return new Promise((done) => {
    const child = spawn(cmd, args, { cwd: repo, env: { ...process.env, ...env, FORCE_COLOR: "0" } });
    const onData = (stream) => (buf) => {
      for (const raw of buf.toString().split("\n")) {
        const text = strip(raw).replace(/\r/g, "").trimEnd();
        if (!text || /auto-install-peers|^\$ |npm warn/.test(text)) continue;
        session.lines.push({ phase: phaseName, t: now(), stream, text });
        console.log(`  ${(now() / 1000).toFixed(1).padStart(6)}s  ${text.slice(0, 150)}`);
      }
    };
    child.stdout.on("data", onData("out"));
    child.stderr.on("data", onData("err"));
    child.on("close", (code) => done(code));
  });
}

async function followEvents() {
  const res = await fetch(`${GATEWAY}/api/events`);
  const reader = res.body.getReader();
  let buf = "";
  (async () => {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buf += new TextDecoder().decode(value);
      let i;
      while ((i = buf.indexOf("\n\n")) >= 0) {
        const chunk = buf.slice(0, i);
        buf = buf.slice(i + 2);
        const data = chunk.split("\n").find((l) => l.startsWith("data:"));
        if (chunk.includes("event: gateway") && data) {
          const e = JSON.parse(data.slice(5));
          session.events.push({ t: now(), type: e.type, message: e.message, data: e.data ? JSON.parse(e.data) : null });
        }
      }
    }
  })().catch(() => {});
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars", "--force-color-profile=srgb"] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
await page.goto(DASHBOARD, { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 4000));

const recorder = await page.screencast({ path: resolve(out, `dashboard${suffix}.webm`), ffmpegPath: "/opt/homebrew/bin/ffmpeg", fps: 30 });
T0 = Date.now();
session.startedAt = new Date(T0).toISOString();
await followEvents();

// 1. The raw protocol: an unpaid POST /rent and its 402.
if (only("http402")) {
phase("http402", "The 402");
const body = { gpu: "RTX 3090", blocks: 1, sshPublicKey: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGpu402DemoPublicKeyOnlyNoPrivateKeyHereXX agent" };
const r402 = await fetch(`${GATEWAY}/rent`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const required = JSON.parse(Buffer.from(r402.headers.get("payment-required"), "base64").toString());
session.http402 = { t: now(), request: { method: "POST", path: "/rent", body }, status: r402.status, body: await r402.json(), accepts: required.accepts };
await new Promise((r) => setTimeout(r, 3000));

}

// 2. The SDK: five lines, a real GPU.
if (only("sdk")) {
phase("sdk", "SDK: rent, run, stop");
await run("sdk", "pnpm", ["demo:sdk", "RTX3090"]);
await new Promise((r) => setTimeout(r, 3000));

}

// 3. An AI agent with only a wallet pays in USDC.
if (only("agent")) {
phase("agent", TAKE === "taoagent" ? "Agent pays with TAO" : "Agent pays with USDC");
await run("agent", "pnpm", [
  "demo:agent",
  "Rent the cheapest RTX 3090 for 15 minutes, check it with nvidia-smi, then measure fp16 matmul TFLOPS on 8192x8192 matrices (warm up, time 20 iterations with torch.cuda.synchronize). Report one line.",
], { AGENT_PAY_WITH: TAKE === "taoagent" ? "tao" : "usdc" });
await new Promise((r) => setTimeout(r, 4000));

}

// 4. The same, paid in TAO on Bittensor EVM.
if (only("tao")) {
phase("tao", "Agent pays with TAO");
await run("tao", "pnpm", ["--filter", "@gpu402/agent-demo", "exec", "tsx", `--env-file=${resolve(repo, ".env")}`, "scratch/tao-short.mts"]);
await new Promise((r) => setTimeout(r, 4000));

}

// 5. Scroll the dashboard to the GPU market and Subnet 51.
if (only("chain")) {
phase("chain", "Subnet 51 on chain");
for (let y = 0; y <= 1250; y += 25) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise((r) => setTimeout(r, 40));
}
await new Promise((r) => setTimeout(r, 7000));
for (let y = 1250; y >= 0; y -= 50) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise((r) => setTimeout(r, 20));
}
await new Promise((r) => setTimeout(r, 3000));
}

session.durationMs = now();
await recorder.stop();
writeFileSync(resolve(out, `session${suffix}.json`), JSON.stringify(session, null, 2));
await browser.close();
console.log(`\nRecorded ${(session.durationMs / 1000).toFixed(0)} s: ${session.lines.length} terminal lines, ${session.events.length} gateway events.`);
process.exit(0);
