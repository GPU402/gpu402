import { GpuToolkit } from "@gpu402/tools";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { OWNERSHIP_HEADERS, generateSshKeyPair, ownershipMessage } from "gpu402";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startSshServer, type TestSshServer } from "../../../packages/sdk/test/ssh-server.js";
import { verifyOwnership } from "../src/auth.js";
import { blockPriceMicros, fromMicros, money, toMicros } from "../src/pricing.js";
import { NETWORK, createHarness } from "./harness.js";

const agent = privateKeyToAccount(generatePrivateKey());
const ssh = generateSshKeyPair("agent");
const MIN = 60_000;

describe("pricing", () => {
  it("prices a block as Lium hourly × 0.25 × (1 + margin), rounded up to the micro-dollar", () => {
    expect(blockPriceMicros(0.35, 0.1)).toBe(96_250);
    expect(blockPriceMicros(0.2, 0.1)).toBe(55_000);
    expect(blockPriceMicros(0.333333, 0.1)).toBe(91_667); // 91666.6… rounds up, never under-charges
    expect(money(fromMicros(toMicros(0.09625)))).toBe("$0.096250");
  });
});

describe("ownership proof", () => {
  const header = (h: Record<string, string>) => (n: string) => h[n];
  it("accepts a fresh signature from the payer and rejects stale, missing or foreign ones", async () => {
    const ts = Math.floor(Date.now() / 1000);
    const sig = await agent.signMessage({ message: ownershipMessage("pod-1", ts) });
    const ok = header({ [OWNERSHIP_HEADERS.timestamp]: String(ts), [OWNERSHIP_HEADERS.signature]: sig });
    expect(await verifyOwnership("pod-1", agent.address, ok)).toEqual({ ok: true });
    expect(await verifyOwnership("pod-2", agent.address, ok)).toMatchObject({ ok: false, status: 403 }); // bound to one pod
    expect(await verifyOwnership("pod-1", privateKeyToAccount(generatePrivateKey()).address, ok)).toMatchObject({ ok: false, status: 403 });
    expect(await verifyOwnership("pod-1", agent.address, ok, Date.now() + 10 * MIN)).toMatchObject({ ok: false, status: 401 });
    expect(await verifyOwnership("pod-1", agent.address, header({}))).toMatchObject({ ok: false, status: 401 });
  });
});

describe("never leak cost", () => {
  let h: Awaited<ReturnType<typeof createHarness>>;
  let pay: typeof fetch;
  beforeAll(async () => {
    h = await createHarness({ refunds: true });
    pay = wrapFetchWithPaymentFromConfig(h.gatewayFetch, { schemes: [{ network: NETWORK, client: new ExactEvmScheme(agent) }] });
  });
  afterAll(() => h.close());

  const rent = async (blocks = 1) => {
    const res = await pay("http://gateway.test/rent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ gpu: "RTX 4090", blocks, sshPublicKey: ssh.publicKey }),
    });
    expect(res.status).toBe(201);
    return (await res.json()).podId as string;
  };

  it("removes a paid pod that never starts and refunds the agent in full", async () => {
    const podId = await rent(2);
    h.ledger.updatePod(podId, { created_at: Date.now() - (h.cfg.START_TIMEOUT_MIN + 1) * MIN });
    await h.rentals.poll();
    expect(h.ledger.getPod(podId)).toMatchObject({ status: "failed", removed_reason: "start_timeout" });
    expect(h.lium.deleted).toContain(podId);
    expect(h.refunds.at(-1)).toMatchObject({ to: agent.address.toLowerCase(), usd: 0.1925 });
    expect(h.ledger.paymentsForPod(podId)[0]).toMatchObject({ status: "refunded", refund_usd: 0.1925 });
  });

  it("refunds the unused share when Lium loses a running pod", async () => {
    h.lium.podStatus = "RUNNING";
    const podId = await rent(1);
    await h.rentals.poll();
    const pod = h.ledger.getPod(podId)!;
    // Used 5 of 15 paid minutes.
    h.ledger.updatePod(podId, { ready_at: Date.now() - 5 * MIN, expires_at: Date.now() + 10 * MIN });
    h.lium.podStatus = "BROKEN";
    await h.rentals.poll();
    expect(h.ledger.getPod(podId)).toMatchObject({ status: "failed", removed_reason: "lium_broken" });
    expect(h.refunds.at(-1)!.usd).toBeCloseTo((pod.block_price_usd * 2) / 3, 4);
    h.lium.podStatus = "PENDING";
  });

  it("abandons a pod rented right before a crash that never recorded its settlement", async () => {
    const podId = await rent(1);
    h.ledger.updatePod(podId, { status: "unpaid", created_at: Date.now() - 6 * MIN });
    await h.rentals.sweep();
    expect(h.ledger.getPod(podId)).toMatchObject({ status: "failed" });
    expect(h.lium.deleted).toContain(podId);
  });

  it("on startup, removes gateway pods on Lium that the ledger does not know, and leaves other pods alone", async () => {
    h.lium.extraPods.push({ id: "orphan-1", pod_name: "gpu402-gw-deadbeef", status: "RUNNING" }, { id: "mine-1", pod_name: "my-notebook", status: "RUNNING" });
    await h.rentals.reconcile();
    expect(h.lium.deleted).toContain("orphan-1");
    expect(h.lium.deleted).not.toContain("mine-1");
  });
});

describe("full agent chain over x402 and real SSH", () => {
  let h: Awaited<ReturnType<typeof createHarness>>;
  let sshd: TestSshServer;
  let poller: NodeJS.Timeout;
  beforeAll(async () => {
    sshd = await startSshServer(ssh.publicKey);
    h = await createHarness({ sshCommand: `ssh root@${sshd.host} -p ${sshd.port}` });
    poller = setInterval(() => void h.rentals.poll(), 50);
  });
  afterAll(async () => {
    clearInterval(poller);
    await h.close();
    await sshd.close();
  });

  it("rentGpu pays and waits for SSH, runOnGpu runs the job on the pod, stopGpu releases it", async () => {
    const events: string[] = [];
    const toolkit = new GpuToolkit({
      mode: "x402",
      gatewayUrl: "http://gateway.test",
      wallet: agent,
      fetch: h.gatewayFetch,
      sshKey: ssh,
      onEvent: (e) => events.push(e.type),
    });
    h.lium.podStatus = "RUNNING";

    const rented = await toolkit.rentGpu({ gpu: "RTX 4090", minutes: 20 });
    expect(rented).toMatchObject({ gpu: "NVIDIA GeForce RTX 4090", paidUsd: 0.1925 }); // 20 min → 2 blocks
    expect(rented.paymentTx).toMatch(/^0x[0-9a-f]{64}$/);
    expect(rented.paymentExplorer).toBe(`https://sepolia.basescan.org/tx/${rented.paymentTx}`);
    expect(rented.ssh).toBe(`ssh root@${sshd.host} -p ${sshd.port}`);

    const run = await toolkit.runOnGpu({ podId: rented.podId, command: "echo benchmark-ok && exit 0", timeoutSeconds: 30 });
    expect(run).toMatchObject({ exitCode: 0, stdout: "benchmark-ok\n" });

    await toolkit.stopGpu({ podId: rented.podId });
    expect(h.lium.deleted).toContain(rented.podId);
    expect(h.ledger.getPod(rented.podId)).toMatchObject({ status: "stopped", removed_reason: "stopped_by_owner" });
    expect(events).toEqual(expect.arrayContaining(["renting", "paid", "rented", "ready", "stdout", "stopped"]));
  }, 30_000);
});

describe("abuse limits", () => {
  it("rate limits paid and signed routes per client and caps body size", async () => {
    const h = await createHarness({ env: { RATE_LIMIT_PER_MIN: "3" } });
    try {
      const statuses: number[] = [];
      for (let i = 0; i < 4; i++) statuses.push((await h.gatewayFetch("http://gateway.test/pods/x")).status);
      expect(statuses).toEqual([404, 404, 404, 429]);
      expect((await h.gatewayFetch("http://gateway.test/gpus")).status).toBe(200); // free market data is not limited
      const big = await h.gatewayFetch("http://gateway.test/quote", { method: "POST", body: "x".repeat(20_000) });
      expect(big.status).toBe(413);
    } finally {
      await h.close();
    }
  });
});

describe("Lium outage", () => {
  it("serves the last good market while Lium is down, and says so plainly when there is none", async () => {
    const h = await createHarness();
    try {
      // Nothing cached yet: a clear 503, never a 500 and never a payment request.
      h.lium.marketDown = true;
      const cold = await h.gatewayFetch("http://gateway.test/gpus");
      expect(cold.status).toBe(503);
      expect(await cold.json()).toMatchObject({ error: "lium_unavailable" });
      const rent = await h.gatewayFetch("http://gateway.test/rent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gpu: "RTX 4090", sshPublicKey: ssh.publicKey }),
      });
      expect(rent.status).toBe(503);
      expect(rent.headers.get("PAYMENT-REQUIRED")).toBeNull();

      // Lium back: the market is cached. Then Lium down again: the cache keeps quoting.
      h.lium.marketDown = false;
      expect((await h.gatewayFetch("http://gateway.test/gpus")).status).toBe(200);
      h.lium.marketDown = true;
      // Force a refresh while Lium is down: it must fall back to the snapshot, not fail.
      const snapshot = await h.pricing.gpus(true);
      expect(snapshot.length).toBeGreaterThan(0);
      const warm = await h.gatewayFetch("http://gateway.test/quote?gpu=RTX4090&gpuCount=1&blocks=3");
      expect(warm.status).toBe(200);
      expect((await warm.json()).blockPriceUsd).toBe(0.09625);
    } finally {
      await h.close();
    }
  }, 30_000);
});

describe("node locations for the dashboard globe", () => {
  it("serves real node coordinates and records them on each rental", async () => {
    const h = await createHarness();
    try {
      const { nodes } = await (await h.gatewayFetch("http://gateway.test/api/nodes")).json();
      expect(nodes[0]).toMatchObject({ id: expect.any(String), lat: expect.any(Number), lon: expect.any(Number) });
      const pay = wrapFetchWithPaymentFromConfig(h.gatewayFetch, { schemes: [{ network: NETWORK, client: new ExactEvmScheme(agent) }] });
      const res = await pay("http://gateway.test/rent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gpu: "RTX 4090", sshPublicKey: ssh.publicKey }),
      });
      const { podId } = await res.json();
      expect(h.ledger.getPod(podId)).toMatchObject({ lat: 52.52, lon: 13.405, city: "Berlin" });
      const state = await (await h.gatewayFetch("http://gateway.test/api/state")).json();
      expect(state.pods.find((p: { podId: string }) => p.podId === podId)).toMatchObject({ lat: 52.52, lon: 13.405, city: "Berlin" });
    } finally {
      await h.close();
    }
  });
});

describe("browser payments", () => {
  it("lets a browser x402 client through the CORS preflight on its paid retry", async () => {
    const h = await createHarness();
    try {
      const res = await h.gatewayFetch("http://gateway.test/rent", {
        method: "OPTIONS",
        headers: {
          origin: "http://localhost:3000",
          "access-control-request-method": "POST",
          // What @x402/fetch sends with the signed retry.
          "access-control-request-headers": "content-type,payment-signature,access-control-expose-headers",
        },
      });
      const allowed = (res.headers.get("access-control-allow-headers") ?? "").toLowerCase().split(",");
      expect(allowed).toEqual(expect.arrayContaining(["content-type", "payment-signature", "access-control-expose-headers"]));
    } finally {
      await h.close();
    }
  });
});

describe("public site, local gateway", () => {
  it("opts in to Chrome's Private Network Access on preflight", async () => {
    const h = await createHarness();
    try {
      const res = await h.gatewayFetch("http://gateway.test/rent", {
        method: "OPTIONS",
        headers: {
          origin: "https://gpu402.vercel.app",
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type",
          "access-control-request-private-network": "true",
        },
      });
      expect(res.headers.get("access-control-allow-private-network")).toBe("true");
      expect(res.headers.get("access-control-allow-origin")).toBe("*");
    } finally {
      await h.close();
    }
  });
});
