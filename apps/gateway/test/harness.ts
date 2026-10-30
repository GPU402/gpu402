// Test harness for the gateway: a local server that speaks Lium's REST wire format
// (so every Lium outcome can be driven) and a facilitator that cryptographically
// verifies each EIP-3009 payment signature. Agents sign with real @x402 clients.
import { createServer, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import type { FacilitatorClient } from "@x402/core/server";
import type { PaymentPayload, PaymentRequirements } from "@x402/core/types";
import { Lium } from "gpu402";
import { keccak256, toHex, verifyTypedData, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";
import { Ledger } from "../src/db.js";
import { EventBus } from "../src/events.js";
import { NativeTaoFacilitator } from "@gpu402/tools/tao";
import type { TaoPriceOracle } from "../src/oracle.js";
import { Pricing } from "../src/pricing.js";
import { Refunder } from "../src/refunds.js";
import { RentalService } from "../src/rentals.js";

export const NETWORK = "eip155:84532";
export const USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export const EXECUTORS = [
  { id: "aaaaaaaa-0000-0000-0000-000000000001", price_per_gpu: 0.35, gpu_class: "NVIDIA GeForce RTX 4090", machine_name: "NVIDIA GeForce RTX 4090", location: { country: "Germany" } },
  { id: "aaaaaaaa-0000-0000-0000-000000000002", price_per_gpu: 0.4, gpu_class: "NVIDIA GeForce RTX 4090", machine_name: "NVIDIA GeForce RTX 4090", location: { country: "Poland" } },
  { id: "aaaaaaaa-0000-0000-0000-000000000003", price_per_gpu: 2.2, gpu_class: "NVIDIA H100 80GB HBM3", machine_name: "NVIDIA H100 80GB HBM3" },
].map((e) => ({
  validator_hotkey: "5F",
  specs: {},
  gpu_count: 1,
  available_gpu_count: 1,
  min_gpu_count_for_rental: 1,
  max_cuda_version: 12.8,
  frequent_rent_failures: false,
  disk_health_ok: true,
  ...e,
}));

export interface HarnessOptions {
  /** What GET /pods/{id} returns as ssh_connect_cmd once RUNNING. */
  sshCommand?: string;
  env?: Record<string, string>;
  refunds?: boolean;
  /** Accept TAO on a local EVM chain at a fixed TAO/USD rate. */
  tao?: { rpcUrl: string; usdPerTao: number };
  /** Use the real Refunder with this pay-to key (refunds are sent on chain). */
  refundKey?: `0x${string}`;
}

export async function createHarness(opts: HarnessOptions = {}) {
  const lium = {
    balance: 20,
    rentFails: false,
    podStatus: "PENDING",
    rents: [] as { executor: string; body: Record<string, unknown> }[],
    deleted: [] as string[],
    schedules: [] as { pod: string; at: string }[],
    extraPods: [] as { id: string; pod_name: string; status: string }[],
    podSeq: 0,
  };
  const pods = new Map<string, { id: string; pod_name: string; executor_id: string }>();
  const send = (res: ServerResponse, status: number, data: unknown) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(data));
  };

  const liumServer = createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c)).on("end", () => {
      const path = new URL(req.url ?? "/", "http://x").pathname;
      if (req.headers["x-api-key"] !== "sk_test" && !(req.method === "GET" && ["/executors", "/templates"].includes(path))) {
        return send(res, 401, { error: { code: "unauthorized", message: "API key not found" } });
      }
      if (req.method === "GET" && path === "/executors") return send(res, 200, EXECUTORS);
      if (req.method === "GET" && path === "/templates") {
        return send(res, 200, [{ id: "tpl-pytorch", name: "Pytorch (Cuda + DinD)", category: "PYTORCH", user_id: null, is_private: false, docker_image_tag: "2.11-cuda12.8", status: "CREATED" }]);
      }
      if (req.method === "GET" && path === "/users/me") return send(res, 200, { balance: lium.balance });
      if (req.method === "GET" && path === "/pods") {
        return send(res, 200, [...[...pods.values()].map((p) => ({ ...p, status: lium.podStatus })), ...lium.extraPods]);
      }
      let m = path.match(/^\/executors\/([^/]+)\/rent$/);
      if (req.method === "POST" && m) {
        if (lium.rentFails) return send(res, 409, { error: { code: "node_unavailable", message: "Node rented since you listed it" } });
        const body = JSON.parse(raw);
        lium.rents.push({ executor: m[1]!, body });
        const id = `pod-${++lium.podSeq}`;
        pods.set(id, { id, pod_name: body.pod_name, executor_id: m[1]! });
        return send(res, 200, { success: true, pod_id: id });
      }
      m = path.match(/^\/pods\/([^/]+)\/schedule-removal$/);
      if (req.method === "POST" && m) {
        lium.schedules.push({ pod: m[1]!, at: JSON.parse(raw).removal_scheduled_at });
        return send(res, 200, { success: true });
      }
      m = path.match(/^\/pods\/([^/]+)$/);
      if (m) {
        const extra = lium.extraPods.find((p) => p.id === m![1]);
        if (extra && req.method === "DELETE") {
          lium.deleted.push(extra.id);
          lium.extraPods = lium.extraPods.filter((p) => p !== extra);
          return send(res, 200, {});
        }
        if (extra) return send(res, 200, { ...extra, spend_to_date: 0 });
        const pod = pods.get(m[1]!);
        if (!pod) return send(res, 404, { error: { code: "pod_not_found", message: "No such pod" } });
        if (req.method === "DELETE") {
          lium.deleted.push(pod.id);
          pods.delete(pod.id);
          return send(res, 200, {});
        }
        return send(res, 200, {
          ...pod,
          status: lium.podStatus,
          gpu_name: "NVIDIA GeForce RTX 4090",
          gpu_count: "1",
          price: 0.35,
          spend_to_date: 0.01,
          ssh_connect_cmd: lium.podStatus === "RUNNING" ? (opts.sshCommand ?? "ssh root@203.0.113.10 -p 40022") : "",
        });
      }
      send(res, 404, { error: { code: "not_found", message: path } });
    });
  });
  await new Promise<void>((r) => liumServer.listen(0, "127.0.0.1", r));

  const facilitatorLog: string[] = [];
  const control = { settleFails: false, unfunded: new Set<string>() };
  const facilitator: FacilitatorClient = {
    async getSupported() {
      return { kinds: [{ x402Version: 2, scheme: "exact", network: NETWORK }], extensions: [], signers: {} };
    },
    async verify(p: PaymentPayload, r: PaymentRequirements) {
      const { signature, authorization: a } = p.payload as { signature: Hex; authorization: Record<string, string> };
      const valid =
        a.to?.toLowerCase() === r.payTo.toLowerCase() &&
        BigInt(a.value!) === BigInt(r.amount) &&
        (await verifyTypedData({
          address: a.from as Hex,
          domain: { name: String(r.extra.name), version: String(r.extra.version), chainId: 84532, verifyingContract: r.asset as Hex },
          types: {
            TransferWithAuthorization: [
              { name: "from", type: "address" },
              { name: "to", type: "address" },
              { name: "value", type: "uint256" },
              { name: "validAfter", type: "uint256" },
              { name: "validBefore", type: "uint256" },
              { name: "nonce", type: "bytes32" },
            ],
          },
          primaryType: "TransferWithAuthorization",
          message: { from: a.from as Hex, to: a.to as Hex, value: BigInt(a.value!), validAfter: BigInt(a.validAfter!), validBefore: BigInt(a.validBefore!), nonce: a.nonce as Hex },
          signature,
        }));
      facilitatorLog.push(`verify:${valid}:${r.amount}`);
      if (valid && control.unfunded.has(a.from!.toLowerCase())) {
        // Same reason code the public facilitator returns for a wallet without enough USDC.
        return { isValid: false, invalidReason: "invalid_exact_evm_insufficient_balance", payer: a.from };
      }
      return valid ? { isValid: true, payer: a.from } : { isValid: false, invalidReason: "invalid_signature", payer: a.from };
    },
    async settle(p: PaymentPayload, r: PaymentRequirements) {
      const a = (p.payload as { authorization: { from: string; nonce: string } }).authorization;
      facilitatorLog.push(`settle:${r.amount}`);
      if (control.settleFails) return { success: false, errorReason: "insufficient_funds", transaction: "", network: r.network, payer: a.from };
      return { success: true, transaction: keccak256(toHex(a.nonce)), network: r.network, payer: a.from };
    },
  };

  const payTo = privateKeyToAccount(opts.refundKey ?? generatePrivateKey()).address;
  const cfg = loadConfig({
    LIUM_API_KEY: "sk_test",
    LIUM_BASE_URL: `http://127.0.0.1:${(liumServer.address() as AddressInfo).port}`,
    GATEWAY_PAY_TO: payTo,
    DB_PATH: ":memory:",
    PUBLIC_URL: "http://gateway.test",
    MAX_ACTIVE_PODS: "3",
    TAO_PAYMENTS: opts.tao ? "true" : "false",
    ...(opts.refundKey ? { REFUND_PRIVATE_KEY: opts.refundKey } : {}),
    ...(opts.tao ? { TAO_RPC_URL: opts.tao.rpcUrl } : {}),
    ...opts.env,
  } as NodeJS.ProcessEnv);
  const refunds: { asset: string; to: string; usd: number }[] = [];
  const stubRefunder = {
    enabled: opts.refunds ?? false,
    reason: opts.refunds ? undefined : "disabled in test",
    async refundPayment(p: { asset: string; payer: string; amount_usd: number }, share: number) {
      const usd = Math.floor(p.amount_usd * share * 1e6) / 1e6;
      refunds.push({ asset: p.asset, to: p.payer, usd });
      return { tx: keccak256(toHex(`refund-${refunds.length}`)), usd };
    },
  } as unknown as Refunder;
  const refunder = opts.refundKey ? new Refunder(cfg) : stubRefunder;

  const client = new Lium({ apiKey: cfg.LIUM_API_KEY, baseUrl: cfg.LIUM_BASE_URL, retry: { maxRetries: 0 } });
  const ledger = new Ledger(":memory:");
  const bus = new EventBus(ledger);
  // A fixed TAO/USD rate stands in for the exchange feeds, so amounts are deterministic.
  const oracle = opts.tao ? ({ rate: async () => ({ usdPerTao: opts.tao!.usdPerTao, sources: { test: opts.tao!.usdPerTao }, at: Date.now() }) } as unknown as TaoPriceOracle) : undefined;
  const pricing = new Pricing(client, cfg, oracle);
  const taoFacilitator = opts.tao ? new NativeTaoFacilitator({ networks: { [cfg.TAO_NETWORK]: opts.tao.rpcUrl }, confirmTimeoutMs: 10_000 }) : undefined;
  const rentals = new RentalService(cfg, client, ledger, bus, pricing, refunder);
  const app = createApp({ cfg, lium: client, ledger, bus, pricing, rentals, chain: { stats: async () => ({}) } as never, liumStats: async () => null, facilitator, taoFacilitator });
  const gatewayFetch: typeof fetch = async (input, init) => app.fetch(new Request(input, init));

  return {
    app,
    cfg,
    payTo,
    ledger,
    rentals,
    lium,
    control,
    facilitatorLog,
    refunds,
    gatewayFetch,
    close: () => new Promise<void>((r) => liumServer.close(() => r())),
  };
}
