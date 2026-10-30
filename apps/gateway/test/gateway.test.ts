// End-to-end test of the paid x402 loop. The agent signs real EIP-3009 payments
// with @x402/fetch; the harness facilitator cryptographically verifies each signature;
// a local server speaks Lium's REST wire format so every Lium outcome can be driven.
import { decodePaymentRequiredHeader } from "@x402/core/http";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { OWNERSHIP_HEADERS, generateSshKeyPair, ownershipMessage } from "gpu402";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { EXECUTORS, NETWORK, USDC, createHarness } from "./harness.js";

const agent = privateKeyToAccount(generatePrivateKey());
const stranger = privateKeyToAccount(generatePrivateKey());
const ssh = generateSshKeyPair("agent");

let h: Awaited<ReturnType<typeof createHarness>>;
let payingFetch: typeof fetch;
const gatewayFetch: typeof fetch = (input, init) => h.gatewayFetch(input, init);

beforeAll(async () => {
  h = await createHarness();
  payingFetch = wrapFetchWithPaymentFromConfig(gatewayFetch, { schemes: [{ network: NETWORK, client: new ExactEvmScheme(agent) }] });
});
afterAll(() => h.close());
beforeEach(() => {
  h.lium.rentFails = false;
  h.lium.balance = 20;
  h.lium.podStatus = "PENDING";
  h.control.settleFails = false;
  h.facilitatorLog.length = 0;
  h.rentals.invalidateBalance();
});

const rentBody = (over: Record<string, unknown> = {}) =>
  JSON.stringify({ gpu: "RTX 4090", blocks: 1, sshPublicKey: ssh.publicKey, ...over });
const post = (f: typeof fetch, path: string, body: string) =>
  f(`http://gateway.test${path}`, { method: "POST", headers: { "content-type": "application/json" }, body });
const signedGet = async (podId: string, signer = agent, method = "GET") => {
  const ts = Math.floor(Date.now() / 1000);
  const signature = await signer.signMessage({ message: ownershipMessage(podId, ts) });
  return gatewayFetch(`http://gateway.test/pods/${podId}`, {
    method,
    headers: { [OWNERSHIP_HEADERS.timestamp]: String(ts), [OWNERSHIP_HEADERS.signature]: signature },
  });
};

describe("GPU402 gateway", () => {
  it("quotes for free and answers an unpaid rent with HTTP 402 and the exact block price", async () => {
    const q = await (await gatewayFetch("http://gateway.test/quote?gpu=rtx4090&blocks=2")).json();
    // 0.35 $/h × 0.25 h × 1.10 = $0.09625 per block
    expect(q).toMatchObject({ gpu: "NVIDIA GeForce RTX 4090", blockPriceUsd: 0.09625, totalUsd: 0.1925, price: "$0.192500", payTo: h.payTo });

    const res = await post(gatewayFetch, "/rent", rentBody());
    expect(res.status).toBe(402);
    const required = decodePaymentRequiredHeader(res.headers.get("PAYMENT-REQUIRED")!);
    expect(required.accepts[0]).toMatchObject({ scheme: "exact", network: NETWORK, amount: "96250", payTo: h.payTo, asset: USDC });
    expect((await res.json()).quote).toMatchObject({ blocks: 1, minutes: 15, totalUsd: 0.09625 });
    expect(h.lium.rents).toHaveLength(0);
  });

  it("rejects bad requests before any payment", async () => {
    expect((await post(gatewayFetch, "/rent", rentBody({ sshPublicKey: "not a key" }))).status).toBe(400);
    expect((await post(gatewayFetch, "/rent", rentBody({ blocks: 99 }))).status).toBe(400);
    expect((await post(gatewayFetch, "/rent", rentBody({ gpu: "B200" }))).status).toBe(409);
  });

  let podId = "";
  it("pays, rents the cheapest matching node at the quoted ceiling, then settles", async () => {
    const res = await post(payingFetch, "/rent", rentBody());
    expect(res.status).toBe(201);
    const body = await res.json();
    podId = body.podId;
    expect(body).toMatchObject({ status: "starting", gpu: "NVIDIA GeForce RTX 4090", blocksPaid: 1 });
    expect(res.headers.get("PAYMENT-RESPONSE")).toBeTruthy();
    expect(h.facilitatorLog).toEqual(["verify:true:96250", "settle:96250"]);

    const rent = h.lium.rents.at(-1)!;
    expect(rent.executor).toBe(EXECUTORS[0]!.id);
    expect(rent.body).toMatchObject({ user_public_key: ssh.publicKey, template_id: "tpl-pytorch", gpu_count: 1 });
    expect(h.lium.schedules.some((s) => s.pod === podId)).toBe(true); // Lium-side backstop removal

    const pod = h.ledger.getPod(podId)!;
    expect(pod).toMatchObject({ status: "starting", payer: agent.address.toLowerCase(), block_price_usd: 0.09625 });
    expect(h.ledger.paymentsForPod(podId)).toHaveLength(1);
    expect(h.ledger.paymentsForPod(podId)[0]).toMatchObject({ amount_usd: 0.09625, payer: agent.address.toLowerCase(), status: "settled" });
  });

  it("starts the paid clock when the pod is RUNNING and only the paying wallet can read SSH access", async () => {
    h.lium.podStatus = "RUNNING";
    await h.rentals.poll();
    const pod = h.ledger.getPod(podId)!;
    expect(pod.status).toBe("running");
    expect(pod.expires_at! - pod.ready_at!).toBe(15 * 60_000);

    expect((await gatewayFetch(`http://gateway.test/pods/${podId}`)).status).toBe(401);
    expect((await signedGet(podId, stranger)).status).toBe(403);
    const ok = await signedGet(podId);
    expect(ok.status).toBe(200);
    expect((await ok.json()).ssh).toMatchObject({ host: "203.0.113.10", port: 40022, user: "root" });
  });

  it("sells extra blocks at the locked block price and moves the expiry", async () => {
    const before = h.ledger.getPod(podId)!;
    const res = await post(payingFetch, `/pods/${podId}/extend`, JSON.stringify({ blocks: 2 }));
    expect(res.status).toBe(200);
    expect(h.facilitatorLog).toEqual(["verify:true:192500", "settle:192500"]);
    const after = h.ledger.getPod(podId)!;
    expect(after.blocks_paid).toBe(3);
    expect(after.expires_at! - before.expires_at!).toBe(30 * 60_000);
  });

  it("the sweeper removes the pod at its paid expiry", async () => {
    h.ledger.updatePod(podId, { expires_at: Date.now() - 1 });
    await h.rentals.sweep();
    expect(h.lium.deleted).toContain(podId);
    expect(h.ledger.getPod(podId)).toMatchObject({ status: "expired", removed_reason: "paid_time_ended" });
  });

  it("explains a payment the facilitator refuses, and rents nothing", async () => {
    const before = h.ledger.recentPods(100).length;
    const broke = privateKeyToAccount(generatePrivateKey());
    h.control.unfunded.add(broke.address.toLowerCase());
    const brokeFetch = wrapFetchWithPaymentFromConfig(gatewayFetch, { schemes: [{ network: NETWORK, client: new ExactEvmScheme(broke) }] });
    const res = await post(brokeFetch, "/rent", rentBody());
    expect(res.status).toBe(402);
    expect(h.ledger.recentPods(100).length).toBe(before);
    expect(h.facilitatorLog).not.toContain("settle:96250");
    expect(h.ledger.recentEvents(5).find((e) => e.type === "payment.rejected")?.message).toMatch(/insufficient_balance/);
  });

  it("never settles when Lium cannot rent: the agent pays nothing", async () => {
    h.lium.rentFails = true;
    const res = await post(payingFetch, "/rent", rentBody());
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("capacity_changed");
    expect(h.facilitatorLog).toEqual(["verify:true:96250"]);
  });

  it("removes the pod at once when settlement fails", async () => {
    h.control.settleFails = true;
    const res = await post(payingFetch, "/rent", rentBody());
    expect(res.status).toBe(402);
    const failed = h.ledger.recentPods(1)[0]!;
    expect(failed.status).toBe("failed");
    expect(failed.removed_reason).toMatch(/^payment_failed: insufficient_funds/); // the facilitator's own reason
    expect(h.lium.deleted).toContain(failed.id);
  });

  it("refuses to ask for payment when its Lium balance cannot cover the 15-minute rule", async () => {
    h.lium.balance = 0.1;
    const res = await post(gatewayFetch, "/rent", rentBody());
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("gateway_low_balance");
  });

  it("reports totals for the dashboard", async () => {
    const state = await (await gatewayFetch("http://gateway.test/api/state")).json();
    expect(state.totals).toMatchObject({ payments: 2, pods: 2 });
    expect(state.totals.usdcReceived).toBeCloseTo(0.28875, 6);
    expect(state.payments[0].explorerUrl).toMatch(/^https:\/\/sepolia\.basescan\.org\/tx\/0x/);
  });
});

describe("agent-side client (@gpu402/tools)", () => {
  it("rents, reads signed status with SSH, extends and stops through the x402 gateway", async () => {
    const { Gpu402Gateway } = await import("@gpu402/tools");
    const gw = new Gpu402Gateway({ url: "http://gateway.test", wallet: agent, fetch: gatewayFetch, maxUsdPerPayment: 1 });

    const { data, payment } = await gw.rent({ gpu: "RTX 4090", blocks: 1, sshPublicKey: ssh.publicKey });
    expect(payment?.txHash).toMatch(/^0x[0-9a-f]{64}$/);
    expect(data.status).toBe("starting");

    h.lium.podStatus = "RUNNING";
    await h.rentals.poll();
    const ready = await gw.waitReady(data.podId, { intervalMs: 10 });
    expect(ready.ssh).toMatchObject({ host: "203.0.113.10", port: 40022 });

    const ext = await gw.extend(data.podId, 1);
    expect(ext.payment?.txHash).toBeTruthy();
    expect((await gw.status(data.podId)).blocksPaid).toBe(2);

    const stopped = await gw.stop(data.podId);
    expect(stopped.status).toBe("stopped");
    expect(h.lium.deleted).toContain(data.podId);
  });
});
