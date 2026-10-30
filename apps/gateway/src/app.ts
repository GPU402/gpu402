import { HTTPFacilitatorClient, type HTTPRequestContext } from "@x402/core/server";
import { decodePaymentRequiredHeader, decodePaymentResponseHeader, decodePaymentSignatureHeader } from "@x402/core/http";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import {
  BLOCK_MINUTES,
  LiumError,
  LiumNoMatchError,
  NODE_TAKEN_CODES,
  OWNERSHIP_HEADERS,
  type GatewayQuoteResponse,
  type GatewayRentResponse,
  type Lium,
} from "gpu402";
import { Hono, type Context, type MiddlewareHandler } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { streamSSE } from "hono/streaming";
import { verifyOwnership } from "./auth.js";
import type { ChainReader, LiumNetworkStats } from "./chain.js";
import { explorerTx, isTestnet, type Config } from "./config.js";
import { ACTIVE_STATUSES, type Ledger, type PodRow } from "./db.js";
import type { EventBus } from "./events.js";
import { rateLimit } from "./limits.js";
import { ExtendRequest, Pricing, QuoteError, RentRequest, fromMicros, money, toMicros, type GatewayQuote } from "./pricing.js";
import { CapacityError, RentalService, shortAddr, type Settlement } from "./rentals.js";

type Vars = {
  rentReq: RentRequest;
  quote: GatewayQuote;
  pod: PodRow;
  extendBlocks: number;
  rented: PodRow | undefined;
  payer: string | null;
};
type Env = { Variables: Vars };

export interface AppDeps {
  cfg: Config;
  lium: Lium;
  ledger: Ledger;
  bus: EventBus;
  pricing: Pricing;
  rentals: RentalService;
  chain: ChainReader;
  liumStats: () => Promise<LiumNetworkStats | null>;
  /** Override the facilitator (tests). */
  facilitator?: ConstructorParameters<typeof x402ResourceServer>[0];
}

const err = (c: Context, status: number, code: string, message: string, extra: Record<string, unknown> = {}) =>
  c.json({ error: code, message, ...extra }, status as never);

/** The payer and the exact amount the agent signed, read from the payment header. */
function readPayment(header: string | undefined) {
  if (!header) return null;
  try {
    const p = decodePaymentSignatureHeader(header);
    const auth = (p.payload as { authorization?: { from?: string } }).authorization;
    return { payer: auth?.from ?? null, asset: p.accepted.asset, amount: p.accepted.amount, network: p.accepted.network };
  } catch {
    return null;
  }
}

/** Why a settlement failed, as the facilitator reported it in the PAYMENT-RESPONSE header. */
function settlementFailureReason(c: Context): string {
  const header = c.res.headers.get("PAYMENT-RESPONSE") ?? c.res.headers.get("X-PAYMENT-RESPONSE");
  try {
    if (header) {
      const s = decodePaymentResponseHeader(header);
      if (s.errorReason) return s.errorMessage && s.errorMessage !== s.errorReason ? `${s.errorReason}: ${s.errorMessage}` : s.errorReason;
    }
  } catch {}
  return `HTTP ${c.res.status}`;
}

function settlementOf(c: Context): Settlement | null {
  const header = c.res.headers.get("PAYMENT-RESPONSE") ?? c.res.headers.get("X-PAYMENT-RESPONSE");
  const paid = readPayment(c.req.header("payment-signature") ?? c.req.header("x-payment"));
  if (!header || !paid || c.res.status >= 400) return null;
  try {
    const s = decodePaymentResponseHeader(header);
    if (!s.success || !s.transaction) return null;
    const atomic = s.amount ?? paid.amount;
    return {
      txHash: s.transaction,
      payer: s.payer ?? paid.payer ?? "",
      network: s.network ?? paid.network,
      asset: paid.asset,
      amountAtomic: atomic,
      amountUsd: Number(atomic) / 1e6,
    };
  } catch {
    return null;
  }
}

export function createApp(d: AppDeps) {
  const { cfg, ledger, bus, pricing, rentals } = d;
  const app = new Hono<Env>();
  const baseUrl = (c: Context) => cfg.PUBLIC_URL ?? new URL(c.req.url).origin;

  app.use(
    "*",
    cors({
      origin: cfg.CORS_ORIGIN === "*" ? "*" : cfg.CORS_ORIGIN.split(","),
      allowHeaders: ["Content-Type", "PAYMENT-SIGNATURE", "X-PAYMENT", OWNERSHIP_HEADERS.timestamp, OWNERSHIP_HEADERS.signature],
      exposeHeaders: ["PAYMENT-REQUIRED", "PAYMENT-RESPONSE", "X-PAYMENT-RESPONSE"],
    }),
  );
  app.use("*", secureHeaders({ crossOriginResourcePolicy: "cross-origin" }));
  app.use("*", async (c, next) => {
    const started = Date.now();
    await next();
    // Log what matters (writes and errors), not the dashboard's polling.
    if (c.req.method !== "GET" || c.res.status >= 400) {
      console.log(`${c.req.method} ${c.req.path} → ${c.res.status} (${Date.now() - started} ms)`);
    }
  });
  app.use("*", bodyLimit({ maxSize: 16 * 1024, onError: (c) => err(c, 413, "payload_too_large", "Request body over 16 KiB.") }));
  const limited = rateLimit({ windowMs: 60_000, max: cfg.RATE_LIMIT_PER_MIN, trustProxy: cfg.TRUST_PROXY ?? false, name: "pod" });
  app.use("/rent", limited);
  app.use("/pods/*", limited);

  app.onError((e, c) => {
    console.error(e);
    return err(c, 500, "internal_error", e.message);
  });

  // ----------------------------------------------------------------- x402 setup
  const payTo = cfg.GATEWAY_PAY_TO ?? "0x0000000000000000000000000000000000000000";
  const resourceServer = new x402ResourceServer(d.facilitator ?? new HTTPFacilitatorClient({ url: cfg.FACILITATOR_URL })).register(
    cfg.X402_NETWORK as `${string}:${string}`,
    new ExactEvmScheme(),
  );

  const rentQuoteFromCtx = async (ctx: HTTPRequestContext) => {
    const body = RentRequest.parse(await (ctx.adapter.getBody?.() as Promise<unknown>));
    return pricing.quote(body);
  };
  const extendPriceFromCtx = async (ctx: HTTPRequestContext) => {
    const id = ctx.path.split("/")[2] ?? "";
    const pod = ledger.getPod(id);
    const { blocks } = ExtendRequest.parse(await (ctx.adapter.getBody?.() as Promise<unknown>));
    if (!pod) throw new Error("unknown pod");
    return money(fromMicros(toMicros(pod.block_price_usd) * blocks));
  };

  const payment = paymentMiddleware(
    {
      "POST /rent": {
        accepts: {
          scheme: "exact",
          network: cfg.X402_NETWORK as `${string}:${string}`,
          payTo,
          price: async (ctx) => (await rentQuoteFromCtx(ctx)).price,
          maxTimeoutSeconds: 300,
        },
        description: "GPU402: prepaid 15-minute blocks of a Lium (Bittensor SN51) GPU with SSH access",
        mimeType: "application/json",
        serviceName: "GPU402",
        unpaidResponseBody: async (ctx) => {
          const q = await rentQuoteFromCtx(ctx);
          return {
            contentType: "application/json",
            body: {
              error: "payment_required",
              message: `${q.blocks} block(s) of ${q.gpu}${q.gpuCount > 1 ? ` ×${q.gpuCount}` : ""} (${q.minutes} min) cost ${q.price} USDC. Retry with a signed x402 payment.`,
              quote: { gpu: q.gpu, gpuCount: q.gpuCount, blocks: q.blocks, minutes: q.minutes, blockPriceUsd: q.blockPriceUsd, totalUsd: q.totalUsd, validUntil: new Date(q.validUntil).toISOString() },
            },
          };
        },
      },
      "POST /pods/:id/extend": {
        accepts: {
          scheme: "exact",
          network: cfg.X402_NETWORK as `${string}:${string}`,
          payTo,
          price: extendPriceFromCtx,
          maxTimeoutSeconds: 120,
        },
        description: "GPU402: add prepaid 15-minute blocks to a running pod",
        mimeType: "application/json",
        serviceName: "GPU402",
      },
    },
    resourceServer,
  );

  /** Runs the x402 middleware inline; a response it returns (402, errors) becomes the final response. */
  const runPayment = async (c: Context<Env>, next: () => Promise<void>) => {
    const out = await payment(c, next);
    if (out instanceof Response) c.res = out;
  };

  // ------------------------------------------------------------- free endpoints
  app.get("/", (c) =>
    c.json({
      name: "GPU402",
      description: "Rent a decentralized Lium (Bittensor Subnet 51) GPU per use with x402. No account, just a USDC wallet.",
      network: cfg.X402_NETWORK,
      testnet: isTestnet(cfg.X402_NETWORK),
      payTo: cfg.GATEWAY_PAY_TO ?? null,
      blockMinutes: BLOCK_MINUTES,
      margin: cfg.MARGIN,
      canRent: rentals.canRent,
      endpoints: {
        "GET /gpus": "Live GPUs with GPU402 block prices (free)",
        "GET /quote?gpu=RTX4090&blocks=1": "Price of a rent (free)",
        "POST /rent": "Paid (x402). Body {gpu, gpuCount?, blocks?, sshPublicKey, maxUsdPerGpuHour?}",
        "POST /pods/:id/extend": "Paid (x402). Body {blocks}",
        "GET /pods/:id": `Status and SSH (signed by the paying wallet: ${OWNERSHIP_HEADERS.timestamp}, ${OWNERSHIP_HEADERS.signature})`,
        "DELETE /pods/:id": "Early stop (signed). No refund in v1",
      },
    }),
  );

  app.get("/health", async (c) => c.json({ ok: true, canRent: rentals.canRent, activePods: ledger.podsByStatus(ACTIVE_STATUSES).length }));

  app.get("/gpus", async (c) => {
    const models = await pricing.models();
    return c.json({ network: cfg.X402_NETWORK, blockMinutes: BLOCK_MINUTES, margin: cfg.MARGIN, models });
  });

  app.get("/quote", async (c) => {
    const parsed = RentRequest.omit({ sshPublicKey: true }).safeParse({
      gpu: c.req.query("gpu") ?? "",
      gpuCount: Number(c.req.query("gpuCount") ?? 1),
      blocks: Number(c.req.query("blocks") ?? 1),
      maxUsdPerGpuHour: c.req.query("maxUsdPerGpuHour") ? Number(c.req.query("maxUsdPerGpuHour")) : undefined,
    });
    if (!parsed.success) return err(c, 400, "bad_request", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    try {
      const q = await pricing.quote(parsed.data);
      const body: GatewayQuoteResponse = {
        gpu: q.gpu,
        gpuCount: q.gpuCount,
        blocks: q.blocks,
        minutes: q.minutes,
        blockPriceUsd: q.blockPriceUsd,
        totalUsd: q.totalUsd,
        price: q.price,
        liumPricePerGpuHour: q.liumPricePerGpuHour,
        margin: cfg.MARGIN,
        nodesAvailable: q.nodesAvailable,
        validUntil: new Date(q.validUntil).toISOString(),
        network: cfg.X402_NETWORK,
        payTo: cfg.GATEWAY_PAY_TO ?? null,
      };
      return c.json(body);
    } catch (e) {
      if (e instanceof QuoteError) return err(c, 409, "no_match", e.message);
      throw e;
    }
  });

  // ------------------------------------------------------------------ POST /rent
  const parseRent: MiddlewareHandler<Env> = async (c, next) => {
    const parsed = RentRequest.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return err(c, 400, "bad_request", parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
    const r = parsed.data;
    if (r.blocks > cfg.MAX_BLOCKS_PER_PAYMENT) return err(c, 400, "bad_request", `At most ${cfg.MAX_BLOCKS_PER_PAYMENT} blocks per payment; extend later.`);
    if (r.gpuCount > cfg.MAX_GPUS_PER_POD) return err(c, 400, "bad_request", `At most ${cfg.MAX_GPUS_PER_POD} GPU(s) per pod on this gateway.`);
    try {
      c.set("quote", await pricing.quote(r));
    } catch (e) {
      if (e instanceof QuoteError) return err(c, 409, "no_match", e.message);
      throw e;
    }
    c.set("rentReq", r);
    await next();
  };

  const capacity: MiddlewareHandler<Env> = async (c, next) => {
    try {
      await rentals.checkCapacity(c.get("quote"));
    } catch (e) {
      if (e instanceof CapacityError) return err(c, 503, e.code, e.message);
      throw e;
    }
    await next();
  };

  /** Wraps x402: settle → the pod is the payer's; settlement fails → the pod is removed and nothing is charged. */
  const paidRent: MiddlewareHandler<Env> = async (c, next) => {
    const hadPayment = Boolean(c.req.header("payment-signature") ?? c.req.header("x-payment"));
    await runPayment(c, next);
    const rented = c.get("rented");
    if (!hadPayment && c.res.status === 402) {
      const q = c.get("quote");
      bus.emit("quote.issued", `402 quote: ${q.blocks} × 15 min of ${q.gpu} = ${q.price} USDC`, { data: { totalUsd: q.totalUsd } });
    }
    if (hadPayment && !rented && c.res.status === 402) {
      // The facilitator refused the signed payment (e.g. not enough USDC): say why, nothing was rented.
      let reason = "rejected";
      try {
        reason = decodePaymentRequiredHeader(c.res.headers.get("PAYMENT-REQUIRED") ?? "").error ?? reason;
      } catch {}
      const payer = readPayment(c.req.header("payment-signature") ?? c.req.header("x-payment"))?.payer ?? null;
      bus.emit("payment.rejected", `Payment from ${shortAddr(payer)} refused by the facilitator (${reason}); nothing rented`);
    }
    if (!rented) return;
    const s = settlementOf(c);
    if (s) rentals.confirmRent(rented.id, s);
    else await rentals.abandonRent(rented.id, settlementFailureReason(c));
  };

  app.post("/rent", parseRent, capacity, paidRent, async (c) => {
    const req = c.get("rentReq");
    const quote = c.get("quote");
    const payer = readPayment(c.req.header("payment-signature") ?? c.req.header("x-payment"))?.payer ?? null;
    bus.emit("payment.verified", `Payment of ${quote.price} USDC verified from ${shortAddr(payer)}; renting on Lium`);
    let row: PodRow;
    try {
      row = await rentals.rent(req, quote, payer);
    } catch (e) {
      // A failed rent returns >= 400, so x402 never settles: the agent pays nothing.
      const code = e instanceof LiumError ? (e.code ?? "lium_error") : "rent_failed";
      // The market moved under the quote (node taken, split refused, price rose): ask for a fresh quote.
      const capacity = e instanceof LiumNoMatchError || (e instanceof LiumError && (e.status === 409 || NODE_TAKEN_CODES.has(code)));
      pricing.release(quote.key);
      bus.emit("gateway.warning", `Lium rent failed (${code}): ${(e as Error).message}. Payment not settled.`);
      return err(
        c,
        capacity ? 409 : 502,
        capacity ? "capacity_changed" : code,
        `${capacity ? "That GPU was taken before it could be rented; request a new quote." : "Renting on Lium failed."} Your payment was not settled. (${(e as Error).message})`,
      );
    }
    c.set("rented", row);
    const body: GatewayRentResponse = {
      ...rentals.status({ ...row, status: "starting" }, baseUrl(c)),
      quote: { totalUsd: quote.totalUsd, blockPriceUsd: quote.blockPriceUsd, liumPricePerHour: row.lium_price_per_hour, minutes: quote.minutes },
    };
    return c.json(body, 201);
  });

  // ------------------------------------------------------- POST /pods/:id/extend
  const parseExtend: MiddlewareHandler<Env> = async (c, next) => {
    const pod = ledger.getPod(c.req.param("id") ?? "");
    if (!pod) return err(c, 404, "pod_not_found", "No such GPU402 pod.");
    if (pod.status !== "running" && pod.status !== "starting") return err(c, 409, "pod_not_active", `Pod is ${pod.status}; start a new rent instead.`);
    const parsed = ExtendRequest.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success || parsed.data.blocks > cfg.MAX_BLOCKS_PER_PAYMENT) {
      return err(c, 400, "bad_request", `blocks must be 1 to ${cfg.MAX_BLOCKS_PER_PAYMENT}`);
    }
    c.set("pod", pod);
    c.set("extendBlocks", parsed.data.blocks);
    await next();
  };

  const paidExtend: MiddlewareHandler<Env> = async (c, next) => {
    await runPayment(c, next);
    const s = c.res.status < 400 ? settlementOf(c) : null;
    if (s) await rentals.confirmExtend(c.get("pod").id, c.get("extendBlocks"), s);
  };

  app.post("/pods/:id/extend", parseExtend, paidExtend, (c) => {
    const pod = c.get("pod");
    const blocks = c.get("extendBlocks");
    const preview = {
      ...pod,
      blocks_paid: pod.blocks_paid + blocks,
      expires_at: pod.expires_at ? pod.expires_at + blocks * BLOCK_MINUTES * 60_000 : null,
    };
    return c.json(rentals.status(preview, baseUrl(c)));
  });

  // ---------------------------------------------------- owner-only pod access
  const owner: MiddlewareHandler<Env> = async (c, next) => {
    const pod = ledger.getPod(c.req.param("id") ?? "");
    if (!pod) return err(c, 404, "pod_not_found", "No such GPU402 pod.");
    const r = await verifyOwnership(pod.id, pod.payer, (n) => c.req.header(n));
    if (!r.ok) return err(c, r.status, "unauthorized", r.error);
    c.set("pod", pod);
    await next();
  };

  app.get("/pods/:id", owner, (c) => c.json(rentals.status(c.get("pod"), baseUrl(c))));

  app.delete("/pods/:id", owner, async (c) => {
    const pod = c.get("pod");
    if (pod.status === "running" || pod.status === "starting") await rentals.stopByOwner(pod);
    return c.json(rentals.status(ledger.getPod(pod.id)!, baseUrl(c)));
  });

  // --------------------------------------------------------- dashboard feed
  app.get("/api/state", async (c) => {
    const pods = ledger.recentPods(40).map((p) => {
      const s = rentals.status(p, baseUrl(c));
      return { ...s, ssh: s.ssh ? { ...s.ssh, command: undefined } : null, executorId: p.executor_id, country: p.country, liumPricePerHour: p.lium_price_per_hour, liumSpendUsd: p.lium_spend_usd };
    });
    return c.json({
      gateway: {
        network: cfg.X402_NETWORK,
        testnet: isTestnet(cfg.X402_NETWORK),
        payTo: cfg.GATEWAY_PAY_TO ?? null,
        margin: cfg.MARGIN,
        blockMinutes: BLOCK_MINUTES,
        canRent: rentals.canRent,
        liumBalanceUsd: await rentals.liumBalance(),
        facilitator: cfg.FACILITATOR_URL,
      },
      totals: ledger.totals(),
      spendByAgent: ledger.spendByPayer(),
      pods,
      payments: ledger.recentPayments(40).map((p) => ({ ...p, explorerUrl: explorerTx(p.network, p.tx_hash), refundUrl: p.refund_tx ? explorerTx(p.network, p.refund_tx) : null })),
      events: ledger.recentEvents(60),
      now: new Date().toISOString(),
    });
  });

  app.get("/api/sn51", async (c) => {
    try {
      return c.json(await d.chain.stats());
    } catch (e) {
      return err(c, 502, "chain_unavailable", `Could not read subnet ${cfg.NETUID} from ${cfg.SUBTENSOR_WS}: ${(e as Error).message}`);
    }
  });

  app.get("/api/lium", async (c) => c.json((await d.liumStats()) ?? {}));

  app.get("/api/events", (c) =>
    streamSSE(c, async (stream) => {
      const queue: string[] = [];
      let wake: (() => void) | undefined;
      const unsubscribe = bus.subscribe((e) => {
        queue.push(JSON.stringify(e));
        wake?.();
      });
      stream.onAbort(() => {
        unsubscribe();
        wake?.();
      });
      await stream.writeSSE({ event: "hello", data: JSON.stringify({ at: Date.now() }) });
      while (!stream.aborted) {
        if (queue.length === 0) {
          await Promise.race([new Promise<void>((r) => (wake = r)), stream.sleep(15_000)]);
          wake = undefined;
          if (queue.length === 0 && !stream.aborted) await stream.writeSSE({ event: "ping", data: String(Date.now()) });
        }
        while (queue.length) await stream.writeSSE({ event: "gateway", data: queue.shift()! });
      }
      unsubscribe();
    }),
  );

  return app;
}
