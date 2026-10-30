// Builds app/engine/land.json: evenly spaced points on the sphere that fall on land
// (Natural Earth 1:110m, via world-atlas). The dashboard globe draws these as dots.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve("world-atlas/land-110m.json"), "utf8"));
const land = feature(topo, topo.objects.land);

const N = 22000; // points on the whole sphere (Fibonacci lattice: near-uniform spacing)
const golden = Math.PI * (3 - Math.sqrt(5));
const out = [];
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const t = golden * i;
  const lat = (Math.asin(y) * 180) / Math.PI;
  const lon = ((Math.atan2(Math.sin(t) * r, Math.cos(t) * r) * 180) / Math.PI);
  if (lat < -60) continue; // leave Antarctica out: it hides the southern nodes
  if (geoContains(land, [lon, lat])) out.push(Math.round(lat * 10) / 10, Math.round(lon * 10) / 10);
}
writeFileSync(new URL("../app/engine/land.json", import.meta.url), JSON.stringify(out));
console.log(`${out.length / 2} land points`);
