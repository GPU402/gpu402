// Real screenshots for the film (Lium docs, this session's BaseScan transaction, npm, GitHub),
// plus the on-screen rectangles of each dashboard panel, so highlights land on the real UI.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../public/capture");
const session = JSON.parse(readFileSync(resolve(out, "session.json"), "utf8"));
const settledUsdc = session.events.find((e) => e.type === "payment.settled" && e.data?.url?.includes("basescan"));

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36");

const shots = {};
async function shot(name, url, opts = {}) {
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 45_000 });
    await new Promise((r) => setTimeout(r, opts.wait ?? 2500));
    if (opts.scrollTo) await page.evaluate((y) => window.scrollTo(0, y), opts.scrollTo);
    await page.screenshot({ path: resolve(out, `${name}.png`) });
    shots[name] = { url, ok: true };
    console.log("shot", name, url);
  } catch (e) {
    shots[name] = { url, ok: false, error: String(e.message).slice(0, 120) };
    console.log("FAILED", name, e.message);
  }
}

await shot("lium-docs", "https://docs.lium.io/developers/api");
if (settledUsdc) await shot("basescan", settledUsdc.data.url, { wait: 5000 });
await shot("npm-sdk", "https://www.npmjs.com/package/gpu402");
await shot("npm-tools", "https://www.npmjs.com/package/@gpu402/tools");
await shot("github", "https://github.com/GPU402/gpu402");

// Panel rectangles on the dashboard, at the same viewport the screencast used.
await page.goto(process.env.DASHBOARD_URL ?? "http://localhost:3001", { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 4000));
const rects = await page.evaluate(() => {
  const pick = (h) => [...document.querySelectorAll("section")].find((s) => s.querySelector("h2")?.textContent?.startsWith(h));
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y + window.scrollY, w: r.width, h: r.height };
  };
  return {
    kpis: box(document.querySelector("main section")),
    flow: box([...document.querySelectorAll("section")].find((s) => s.textContent?.includes("Last rental"))),
    rentals: box(pick("Live rentals")),
    payments: box(pick("x402 payments")),
    feed: box(pick("Gateway feed")),
    market: box(pick("GPU market")),
    chain: box(pick("Subnet")),
  };
});
await page.screenshot({ path: resolve(out, "dashboard-top.png") });
await page.evaluate(() => window.scrollTo(0, 1250));
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: resolve(out, "dashboard-chain.png") });

// The TAO payment from the second take, confirmed against Bittensor EVM's own RPC (the testnet has no public explorer).
const tao = JSON.parse(readFileSync(resolve(out, "session-tao.json"), "utf8"));
const taoTx = tao.events.find((e) => e.type === "payment.settled")?.data?.tx ?? null;
let taoReceipt = null;
if (taoTx) {
  const rpc = async (method, params) => (await (await fetch("https://test.chain.opentensor.ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) })).json()).result;
  const [r, t] = await Promise.all([rpc("eth_getTransactionReceipt", [taoTx]), rpc("eth_getTransactionByHash", [taoTx])]);
  taoReceipt = { tx: taoTx, status: r?.status === "0x1" ? "success" : r?.status, block: r ? parseInt(r.blockNumber, 16) : null, from: t?.from, to: t?.to, valueWei: t ? BigInt(t.value).toString() : null, chainId: t ? parseInt(t.chainId, 16) : null };
}
const usdcTx = settledUsdc?.data?.tx ?? null;
writeFileSync(resolve(out, "shots.json"), JSON.stringify({ shots, rects, basescanTx: settledUsdc?.data ?? null, usdcTx, taoReceipt }, null, 2));
console.log("TAO receipt", JSON.stringify(taoReceipt));
console.log(JSON.stringify(rects));
await browser.close();
