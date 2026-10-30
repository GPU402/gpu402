import { z } from "zod";

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/, "must be a 0x EVM address");
const bool = z
  .enum(["true", "false", "1", "0"])
  .transform((v) => v === "true" || v === "1");
const optional = <T extends z.ZodType>(s: T) => z.preprocess((v) => (v === "" ? undefined : v), s.optional());

const Env = z.object({
  PORT: z.coerce.number().int().default(4020),
  PUBLIC_URL: optional(z.url()),
  CORS_ORIGIN: z.string().default("*"),
  /** Read client IPs from X-Forwarded-For (set when running behind a reverse proxy). */
  TRUST_PROXY: optional(bool),
  /** Requests per minute per client on /rent and /pods/*. */
  RATE_LIMIT_PER_MIN: z.coerce.number().int().min(1).default(60),
  DB_PATH: z.string().default("./data/gpu402.db"),

  /** Gateway's own Lium key (read, rent, manage). Without it the gateway quotes but does not rent. */
  LIUM_API_KEY: optional(z.string()),
  LIUM_BASE_URL: z.url().default("https://lium.io/api"),

  /** Where agents' USDC goes. */
  GATEWAY_PAY_TO: optional(address),
  /** CAIP-2 network. Base Sepolia for the demo; eip155:8453 is Base mainnet. */
  X402_NETWORK: z.string().regex(/^eip155:\d+$/).default("eip155:84532"),
  FACILITATOR_URL: z.url().default("https://x402.org/facilitator"),
  /** Optional private key of GATEWAY_PAY_TO, used only to refund agents whose pod never started. */
  REFUND_PRIVATE_KEY: optional(z.string().regex(/^0x[0-9a-fA-F]{64}$/)),
  EVM_RPC_URL: optional(z.url()),

  /** GPU402 block price = Lium hourly price × 0.25 × (1 + margin). */
  MARGIN: z.coerce.number().min(0).max(5).default(0.1),
  MAX_BLOCKS_PER_PAYMENT: z.coerce.number().int().min(1).max(96).default(8),
  MAX_GPUS_PER_POD: z.coerce.number().int().min(1).max(8).default(1),
  MAX_ACTIVE_PODS: z.coerce.number().int().min(1).default(5),
  /** Extra Lium balance kept on top of the 15-minute rule. */
  RESERVE_USD: z.coerce.number().min(0).default(0.5),
  /** Refuse to sell a block for more than this many USD (agent safety + demo cost cap). */
  MAX_BLOCK_PRICE_USD: z.coerce.number().positive().default(1),
  /** Only sell these GPU models (comma separated, e.g. "RTX 4090,RTX 3090"); empty = all. */
  ALLOWED_GPUS: z.string().default(""),
  SECURE_ONLY: optional(bool),

  SWEEP_INTERVAL_MS: z.coerce.number().int().min(5_000).default(30_000),
  POLL_INTERVAL_MS: z.coerce.number().int().min(2_000).default(8_000),
  /** A pod that is not RUNNING after this long is removed and refunded. */
  START_TIMEOUT_MIN: z.coerce.number().min(2).default(12),
  /** How long a 402 price quote stays fixed for the same request. */
  QUOTE_TTL_SEC: z.coerce.number().int().min(30).default(300),

  SUBTENSOR_WS: z.string().default("wss://entrypoint-finney.opentensor.ai:443"),
  NETUID: z.coerce.number().int().default(51),
});

export type Config = z.infer<typeof Env> & { allowedGpus: string[] };

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = Env.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid gateway configuration:\n${issues}`);
  }
  const c = parsed.data;
  return {
    ...c,
    allowedGpus: c.ALLOWED_GPUS.split(",").map((s) => s.trim()).filter(Boolean),
  };
}

export const isTestnet = (network: string) => ["eip155:84532", "eip155:11155111"].includes(network);

export function explorerTx(network: string, tx: string): string {
  const base: Record<string, string> = {
    "eip155:84532": "https://sepolia.basescan.org",
    "eip155:8453": "https://basescan.org",
  };
  return `${base[network] ?? "https://sepolia.basescan.org"}/tx/${tx}`;
}
