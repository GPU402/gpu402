import type { PaymentPayload, PaymentRequirements } from "@x402/core/types";
import { parseEther, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NATIVE_SCHEME, NativeTaoClientScheme, NativeTaoFacilitator, TAO_ASSET, WEI_PER_RAO, formatTao, usdToTaoWei } from "../src/tao.js";
import { startAnvil } from "./anvil.js";

const NETWORK = "eip155:945";
let chain: Awaited<ReturnType<typeof startAnvil>>;
let facilitator: NativeTaoFacilitator;
const agent = privateKeyToAccount(generatePrivateKey());
const gateway = privateKeyToAccount(generatePrivateKey()).address;

const requirements = (amount: bigint, payTo: string = gateway): PaymentRequirements => ({
  scheme: NATIVE_SCHEME,
  network: NETWORK,
  asset: TAO_ASSET,
  amount: amount.toString(),
  payTo,
  maxTimeoutSeconds: 300,
  extra: {},
});
const pay = async (r: PaymentRequirements, from = agent): Promise<PaymentPayload> => {
  const { payload } = await new NativeTaoClientScheme(from, { [NETWORK]: chain.url }).createPaymentPayload(2, r);
  return { x402Version: 2, accepted: r, payload };
};

beforeAll(async () => {
  chain = await startAnvil(945);
  await chain.fund(agent.address, "1");
  facilitator = new NativeTaoFacilitator({ networks: { [NETWORK]: chain.url }, confirmTimeoutMs: 10_000 });
});
afterAll(() => chain.stop());

describe("TAO pricing", () => {
  it("converts USD to whole rao, rounding up", () => {
    // $0.09625 at $233.29/TAO = 0.000412576…TAO → 412577 rao
    expect(usdToTaoWei(0.09625, 233.29)).toBe(412_577n * WEI_PER_RAO);
    expect(usdToTaoWei(0.09625, 233.29) % WEI_PER_RAO).toBe(0n);
    expect(formatTao(412_577n * WEI_PER_RAO)).toBe("0.000413");
  });
});

describe("native TAO x402 scheme on a real EVM node (chain 945)", { timeout: 30_000 }, () => {
  const amount = usdToTaoWei(0.09625, 233.29);

  it("advertises the native scheme for the Bittensor network", async () => {
    expect((await facilitator.getSupported()).kinds).toEqual([{ x402Version: 2, scheme: "native", network: NETWORK }]);
  });

  it("verifies a signed transfer without moving any TAO", async () => {
    const before = await chain.balance(agent.address);
    const p = await pay(requirements(amount));
    expect(await facilitator.verify(p, requirements(amount))).toEqual({ isValid: true, payer: agent.address });
    expect(await chain.balance(agent.address)).toBe(before); // nothing broadcast yet
  });

  it("rejects the wrong amount, the wrong recipient, and a wallet that cannot pay", async () => {
    const p = await pay(requirements(amount));
    expect((await facilitator.verify(p, requirements(amount + WEI_PER_RAO))).invalidReason).toBe("invalid_native_amount");
    expect((await facilitator.verify(p, requirements(amount, agent.address))).invalidReason).toBe("invalid_native_recipient");
    const broke = privateKeyToAccount(generatePrivateKey());
    await chain.fund(broke.address, "0.0000001"); // enough to sign with a nonce, not enough to pay
    const pb = await pay(requirements(amount), broke);
    expect((await facilitator.verify(pb, requirements(amount))).invalidReason).toBe("invalid_native_insufficient_balance");
  });

  it("settles by broadcasting the transfer, then refuses to accept it twice", async () => {
    const r = requirements(amount);
    const p = await pay(r);
    const gwBefore = await chain.balance(gateway);
    const s = await facilitator.settle(p, r);
    expect(s).toMatchObject({ success: true, network: NETWORK, payer: agent.address });
    expect(s.transaction).toMatch(/^0x[0-9a-f]{64}$/);
    expect((s.extra as { blockNumber: number }).blockNumber).toBeGreaterThan(0);
    expect((await chain.balance(gateway)) - gwBefore).toBe(amount);
    const again = await facilitator.verify(p, r);
    expect(again.isValid).toBe(false); // replay: same transaction (and its nonce is now used)
  });

  it("refuses a payment above the agent's own cap before signing", async () => {
    const client = new NativeTaoClientScheme(agent, { [NETWORK]: chain.url });
    await expect(client.createPaymentPayload(2, requirements(parseEther("0.5")), { maxAmountPerPayment: parseEther("0.01").toString() })).rejects.toThrow(/cap/);
  });

  it("refuses a transaction signed for another chain", async () => {
    const r = requirements(amount);
    const p = await pay(r);
    const otherChain: PaymentRequirements = { ...r, network: "eip155:964" };
    const f964 = new NativeTaoFacilitator({ networks: { "eip155:964": chain.url } });
    expect((await f964.verify(p, otherChain)).invalidReason).toBe("invalid_native_chain");
  });
});

export type { Hex };
