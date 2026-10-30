// TAO payments end to end: an agent pays the gateway in TAO on a real EVM node running
// Bittensor EVM's chain id (945). Transfers are signed, broadcast and mined for real.
import { Gpu402Gateway, GpuToolkit } from "@gpu402/tools";
import { usdToTaoWei } from "@gpu402/tools/tao";
import { decodePaymentRequiredHeader, decodePaymentResponseHeader } from "@x402/core/http";
import { generateSshKeyPair } from "gpu402";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startAnvil } from "../../../packages/tools/test/anvil.js";
import { createHarness } from "./harness.js";

const USD_PER_TAO = 233.29;
const BLOCK_WEI = usdToTaoWei(0.09625, USD_PER_TAO); // RTX 4090 at $0.35/h, one block, +10%
const ssh = generateSshKeyPair("agent");
const gatewayKey = generatePrivateKey();
const agent = privateKeyToAccount(generatePrivateKey());
let chain: Awaited<ReturnType<typeof startAnvil>>;
let h: Awaited<ReturnType<typeof createHarness>>;
let gw: Gpu402Gateway;

beforeAll(async () => {
  chain = await startAnvil(945);
  await chain.fund(agent.address, "1");
  h = await createHarness({ tao: { rpcUrl: chain.url, usdPerTao: USD_PER_TAO }, refundKey: gatewayKey, refunds: true });
  gw = new Gpu402Gateway({ url: "http://gateway.test", wallet: agent, fetch: h.gatewayFetch, payWith: "tao", taoRpcUrls: { "eip155:945": chain.url } });
});
afterAll(async () => {
  await h.close();
  chain.stop();
});
beforeEach(() => {
  h.lium.rentFails = false;
  h.lium.podStatus = "PENDING";
  h.rentals.invalidateBalance();
});

// Each test waits for real transactions to be mined, so it gets more than vitest's default 5 s.
describe("paying in TAO on Bittensor EVM", { timeout: 30_000 }, () => {
  it("offers USDC and TAO in one 402, at the same USD price", async () => {
    const res = await h.gatewayFetch("http://gateway.test/rent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ gpu: "RTX 4090", sshPublicKey: ssh.publicKey }),
    });
    expect(res.status).toBe(402);
    const { accepts } = decodePaymentRequiredHeader(res.headers.get("PAYMENT-REQUIRED")!);
    expect(accepts).toHaveLength(2);
    expect(accepts[0]).toMatchObject({ scheme: "exact", network: "eip155:84532", amount: "96250" });
    expect(accepts[1]).toMatchObject({ scheme: "native", network: "eip155:945", asset: "TAO", amount: BLOCK_WEI.toString(), payTo: h.payTo });
    expect((await res.json()).message).toMatch(/\$0\.096250 USDC or 0\.000413 TAO/);
    const quote = await (await h.gatewayFetch("http://gateway.test/quote?gpu=RTX4090")).json();
    expect(quote.tao).toMatchObject({ network: "eip155:945", amountWei: BLOCK_WEI.toString(), usdPerTao: USD_PER_TAO });
  });

  it("rents after the TAO transfer is mined, and records it in TAO and USD", async () => {
    const [agentBefore, gwBefore] = await Promise.all([chain.balance(agent.address), chain.balance(h.payTo)]);
    const { data, payment } = await gw.rent({ gpu: "RTX 4090", sshPublicKey: ssh.publicKey });
    expect(data.status).toBe("starting");
    expect(payment).toMatchObject({ network: "eip155:945", payer: agent.address });
    expect((await chain.balance(h.payTo)) - gwBefore).toBe(BLOCK_WEI);
    expect(agentBefore - (await chain.balance(agent.address))).toBeGreaterThan(BLOCK_WEI); // amount + gas
    const receipt = await chain.client.getTransactionReceipt({ hash: payment!.txHash as `0x${string}` });
    expect(receipt.status).toBe("success");
    const row = h.ledger.paymentsForPod(data.podId)[0]!;
    expect(row).toMatchObject({ asset: "TAO", network: "eip155:945", amount_atomic: BLOCK_WEI.toString(), amount_usd: 0.09625 });
    expect(h.ledger.recentEvents(10).find((e) => e.type === "payment.settled")!.message).toMatch(/0\.000412577 TAO .*Bittensor EVM testnet/);
    const status = await gw.status(data.podId);
    expect(status.payments[0]).toMatchObject({ asset: "TAO", amount: "0.000412577", explorerUrl: null });
  });

  it("extends in TAO at the pod's locked price", async () => {
    h.lium.podStatus = "RUNNING";
    const { data } = await gw.rent({ gpu: "RTX 4090", sshPublicKey: ssh.publicKey });
    await h.rentals.poll();
    const gwBefore = await chain.balance(h.payTo);
    const ext = await gw.extend(data.podId, 2);
    expect(ext.payment?.network).toBe("eip155:945");
    expect((await chain.balance(h.payTo)) - gwBefore).toBe(usdToTaoWei(0.1925, USD_PER_TAO));
    expect(h.ledger.getPod(data.podId)!.blocks_paid).toBe(3);
  });

  it("moves no TAO when Lium cannot rent", async () => {
    h.lium.rentFails = true;
    const before = await chain.balance(agent.address);
    await expect(gw.rent({ gpu: "RTX 4090", sshPublicKey: ssh.publicKey })).rejects.toMatchObject({ status: 409 });
    expect(await chain.balance(agent.address)).toBe(before); // the signed transfer was never broadcast
  });

  it("refuses a wallet without enough TAO, explains why, and rents nothing", async () => {
    const broke = privateKeyToAccount(generatePrivateKey());
    await chain.fund(broke.address, "0.0001");
    const pods = h.ledger.recentPods(100).length;
    const poor = new Gpu402Gateway({ url: "http://gateway.test", wallet: broke, fetch: h.gatewayFetch, payWith: "tao", taoRpcUrls: { "eip155:945": chain.url } });
    await expect(poor.rent({ gpu: "RTX 4090", sshPublicKey: ssh.publicKey })).rejects.toMatchObject({ status: 402 });
    expect(h.ledger.recentPods(100).length).toBe(pods);
    expect(h.ledger.recentEvents(5).find((e) => e.type === "payment.rejected")?.message).toMatch(/invalid_native_insufficient_balance/);
  });

  it("refunds a pod that never starts in TAO, on chain, from the gateway wallet", async () => {
    const { data } = await gw.rent({ gpu: "RTX 4090", sshPublicKey: ssh.publicKey });
    const before = await chain.balance(agent.address);
    h.ledger.updatePod(data.podId, { created_at: Date.now() - (h.cfg.START_TIMEOUT_MIN + 1) * 60_000 });
    await h.rentals.poll();
    expect(h.ledger.getPod(data.podId)).toMatchObject({ status: "failed", removed_reason: "start_timeout" });
    expect((await chain.balance(agent.address)) - before).toBe(BLOCK_WEI); // the full block, back in TAO
    const p = h.ledger.paymentsForPod(data.podId)[0]!;
    expect(p.status).toBe("refunded");
    expect((await chain.client.getTransactionReceipt({ hash: p.refund_tx as `0x${string}` })).status).toBe("success");
  });

  it("the AI tools pay in TAO when asked to", async () => {
    h.lium.podStatus = "RUNNING";
    const poller = setInterval(() => void h.rentals.poll(), 50);
    try {
      const toolkit = new GpuToolkit({ mode: "x402", gatewayUrl: "http://gateway.test", wallet: agent, fetch: h.gatewayFetch, payWith: "tao", taoRpcUrls: { "eip155:945": chain.url }, sshKey: ssh });
      const rented = await toolkit.rentGpu({ gpu: "RTX 4090", minutes: 15 });
      expect(rented.paymentTx).toMatch(/^0x[0-9a-f]{64}$/);
      expect(rented.paymentExplorer).toBeNull(); // no public explorer for the Bittensor EVM testnet
      expect(h.ledger.paymentsForPod(rented.podId)[0]!.asset).toBe("TAO");
    } finally {
      clearInterval(poller);
    }
  }, 20_000);
});

export { decodePaymentResponseHeader };
