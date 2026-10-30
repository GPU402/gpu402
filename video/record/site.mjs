// Records the redesigned GPU402 site for the demo film, one clip per section.
//
// Every clip is a real screencast of the running dashboard against the live gateway:
// the globe is Lium's real nodes, the playground sends real requests, npm is read live.
// Also captures the npm pages of both published packages.
//
//   node record/site.mjs            # all clips
//   ONLY=hero,playground node record/site.mjs
//
// Output: video/public/site/*.webm and *.png
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "../public/site");
mkdirSync(out, { recursive: true });

const SITE = process.env.DASHBOARD_URL ?? "http://localhost:3000";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ONLY = process.env.ONLY?.split(",");
const want = (name) => !ONLY || ONLY.includes(name);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  args: ["--window-size=1920,1080", "--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist", "--hide-scrollbars", "--force-color-profile=srgb"],
});

async function open() {
  const page = await browser.newPage();
  await page.goto(SITE, { waitUntil: "networkidle2", timeout: 60_000 });
  // Hide the Next.js dev badge; nothing else is touched.
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await sleep(7000); // globe, market and chain data
  return page;
}

const jump = (page, sel, offset = 0) =>
  page.evaluate(
    (s, o) => {
      const el = document.querySelector(s);
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + o, behavior: "instant" });
    },
    sel,
    offset,
  );

/** Smoothly scrolls by `px` over `ms`, so scroll-linked motion plays on camera. */
const glide = (page, px, ms) =>
  page.evaluate(
    (px, ms) =>
      new Promise((done) => {
        const y0 = scrollY;
        const t0 = performance.now();
        const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
        const step = (now) => {
          const p = Math.min((now - t0) / ms, 1);
          window.scrollTo(0, y0 + px * ease(p));
          p < 1 ? requestAnimationFrame(step) : done();
        };
        requestAnimationFrame(step);
      }),
    px,
    ms,
  );

/** Moves the real mouse along a path, so hovers and pointer-driven 3D react. */
async function sweep(page, points, ms) {
  const steps = Math.max(2, Math.round(ms / 16));
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    for (let k = 1; k <= steps / (points.length - 1); k++) {
      const t = k / (steps / (points.length - 1));
      await page.mouse.move(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
      await sleep(16);
    }
  }
}

const clickText = (page, scope, text) =>
  page.evaluate(
    (scope, text) => [...document.querySelectorAll(`${scope} button`)].find((b) => b.textContent.replace(/\s+/g, " ").trim().startsWith(text))?.click(),
    scope,
    text,
  );

async function clip(name, run) {
  if (!want(name)) return;
  const page = await open();
  await run.prepare?.(page);
  const rec = await page.screencast({ path: `${out}/${name}.webm`, fps: 30 });
  await run.act(page);
  await rec.stop();
  await page.close();
  console.log("recorded", name);
}

await clip("hero", {
  act: async (page) => {
    await page.mouse.move(1500, 500);
    await sleep(3500);
    // Drag the globe: it is interactive.
    await page.mouse.down();
    await sweep(page, [[1500, 500], [1200, 470], [1050, 460]], 1600);
    await page.mouse.up();
    await sleep(5000);
  },
});

await clip("howitworks", {
  prepare: (page) => jump(page, "#how", -60),
  act: () => sleep(16_000),
});

await clip("gpu", {
  prepare: (page) => jump(page, "section[aria-labelledby=machine-title]", -500),
  act: async (page) => {
    await page.mouse.move(700, 500);
    await glide(page, 520, 2600);
    await sweep(page, [[700, 400], [1300, 600], [900, 300], [1100, 500]], 3600);
    await glide(page, 300, 2000);
  },
});

await clip("playground", {
  prepare: (page) => jump(page, "#try", 120),
  act: async (page) => {
    await sleep(1200);
    await page.select("#try select", await page.$eval("#try select option:nth-child(2)", (o) => o.value)).catch(() => {});
    await sleep(900);
    await clickText(page, "#try", "Send request");
    await sleep(2200);
    await glide(page, 420, 1800);
    await sleep(1200);
    await glide(page, -420, 1200);
    await clickText(page, "#try", "02Get the 402");
    await sleep(900);
    await clickText(page, "#try", "Send request");
    await sleep(2400);
    await glide(page, 520, 2000);
    await sleep(2400);
  },
});

await clip("proof", {
  prepare: (page) => jump(page, "section[aria-label=Proof]", -200),
  act: async (page) => {
    await glide(page, 300, 1500);
    await sleep(4500);
  },
});

await clip("packages", {
  prepare: (page) => jump(page, "#packages", 300),
  act: async (page) => {
    await sleep(800);
    await sweep(page, [[300, 650], [500, 500], [960, 600], [1150, 450], [1600, 600], [1450, 700]], 5200);
  },
});

await clip("api", {
  prepare: (page) => jump(page, "#api", 300),
  act: async (page) => {
    await sleep(800);
    await page.evaluate(() => [...document.querySelectorAll("#api ul button")].find((b) => b.textContent.includes("/gpus"))?.click());
    await sleep(700);
    await page.evaluate(() => [...document.querySelectorAll("#api button")].find((b) => b.textContent.trim() === "Send")?.click());
    await sleep(2200);
    await page.evaluate(() => [...document.querySelectorAll("#api ul button")].find((b) => b.textContent.includes("/api/sn51"))?.click());
    await sleep(700);
    await page.evaluate(() => [...document.querySelectorAll("#api button")].find((b) => b.textContent.trim() === "Send")?.click());
    await sleep(3000);
  },
});

await clip("network", {
  prepare: (page) => jump(page, "#network", 200),
  act: async (page) => {
    await sleep(800);
    await glide(page, 700, 4200);
    await sleep(1200);
  },
});

if (want("npm")) {
  const page = await browser.newPage();
  for (const [name, file] of [["gpu402", "npm-sdk"], ["@gpu402/tools", "npm-tools"]]) {
    await page.goto(`https://www.npmjs.com/package/${name}`, { waitUntil: "networkidle2", timeout: 60_000 });
    await sleep(1500);
    await page.screenshot({ path: `${out}/${file}.png` });
    console.log("captured", file);
  }
}

await browser.close();
