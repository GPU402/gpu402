import { serve } from "@hono/node-server";
import { Lium } from "gpu402";
import { createApp } from "./app.js";
import { ChainReader, liumStatsReader } from "./chain.js";
import { loadConfig } from "./config.js";
import { Ledger } from "./db.js";
import { EventBus } from "./events.js";
import { Pricing } from "./pricing.js";
import { Refunder } from "./refunds.js";
import { RentalService } from "./rentals.js";

const cfg = loadConfig();
const lium = new Lium({ apiKey: cfg.LIUM_API_KEY ?? "", baseUrl: cfg.LIUM_BASE_URL, userAgent: "gpu402-gateway/0.1" });
const ledger = new Ledger(cfg.DB_PATH);
const bus = new EventBus(ledger);
const pricing = new Pricing(lium, cfg);
const refunder = new Refunder(cfg);
const rentals = new RentalService(cfg, lium, ledger, bus, pricing, refunder);
const chain = new ChainReader(cfg.SUBTENSOR_WS, cfg.NETUID);

const app = createApp({ cfg, lium, ledger, bus, pricing, rentals, chain, liumStats: liumStatsReader(cfg.LIUM_BASE_URL) });

const server = serve({ fetch: app.fetch, port: cfg.PORT }, (info) => {
  console.log(`GPU402 gateway on http://localhost:${info.port}`);
  console.log(`  network      ${cfg.X402_NETWORK} via ${cfg.FACILITATOR_URL}`);
  console.log(`  payTo        ${cfg.GATEWAY_PAY_TO ?? "(not set: quoting only)"}`);
  console.log(`  Lium key     ${cfg.LIUM_API_KEY ? `${cfg.LIUM_API_KEY.slice(0, 6)}…` : "(not set: quoting only)"}`);
  console.log(`  refunds      ${refunder.enabled ? "on" : `off (${refunder.reason})`}`);
  console.log(`  margin       ${(cfg.MARGIN * 100).toFixed(0)}% · sweeper every ${cfg.SWEEP_INTERVAL_MS / 1000}s`);
});

rentals.start();
void chain.stats().catch(() => {}); // warm the SN51 cache

let closing = false;
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, async () => {
    if (closing) process.exit(1);
    closing = true;
    console.log(`\n${sig}: stopping. Active pods keep their Lium-side removal schedule, and the sweeper resumes on restart.`);
    rentals.stop();
    server.close();
    await chain.close();
    process.exit(0);
  });
}
