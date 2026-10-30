// Read-only calls against the real Lium API (no key needed). Skip with GPU402_OFFLINE=1.
// With LIUM_API_KEY set, also checks the key and its balance; nothing is rented.
import { describe, expect, it } from "vitest";
import { Lium } from "../src/index.js";

const offline = process.env.GPU402_OFFLINE === "1";

describe.skipIf(offline)("live Lium API (read-only)", () => {
  const lium = new Lium({ apiKey: "" });

  it("lists rentable GPUs, cheapest first", async () => {
    const gpus = await lium.listGpus();
    expect(gpus.length).toBeGreaterThan(0);
    for (let i = 1; i < gpus.length; i++) expect(gpus[i]!.pricePerGpuHour).toBeGreaterThanOrEqual(gpus[i - 1]!.pricePerGpuHour);
    expect(gpus[0]!.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("quotes a 15-minute block on the cheapest node", async () => {
    const [cheapest] = await lium.listGpus();
    const q = await lium.quote(cheapest!.id, { minutes: 15 });
    expect(q.pricePerHour).toBeGreaterThan(0);
    expect(q.pricePerBlock).toBeCloseTo(q.pricePerHour / 4, 6);
    expect(q.totalUsd).toBeCloseTo(q.pricePerBlock, 4);
  });

  it("quotes one GPU by default on a multi-GPU node, not every free GPU", async () => {
    const multi = (await lium.listGpus()).find((g) => g.availableGpuCount > 1 && g.minGpuCount === 1);
    if (!multi) return; // market has no splittable multi-GPU node right now
    const q = await lium.quote(multi);
    expect(q.gpuCount).toBe(1);
    expect(q.pricePerHour).toBeCloseTo(multi.pricePerGpuHour, 4);
    expect((await lium.quote(multi.id)).gpuCount).toBe(1);
  });

  it("finds an official PyTorch template", async () => {
    expect(await lium.defaultTemplateId({ maxCudaVersion: 12.8 })).toMatch(/^[0-9a-f-]{36}$/);
  });

  it.skipIf(!process.env.LIUM_API_KEY)("reads the account balance with the configured key", async () => {
    const balance = await new Lium().balance();
    expect(Number.isFinite(balance)).toBe(true);
  });
});
