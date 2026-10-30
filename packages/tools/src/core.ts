import { BLOCK_MINUTES, Lium, generateSshKeyPair, sshExec, type SshKeyPair, type SshTarget } from "gpu402";
import type { Hex, LocalAccount } from "viem";
import { z } from "zod";
import { Gpu402Gateway } from "./gateway-client.js";

/**
 * One set of GPU tools, two ways to pay:
 * - key mode: your Lium API key, through the gpu402 SDK;
 * - x402 mode: the agent's USDC wallet, through a GPU402 gateway. No account.
 * Either way the toolkit holds a fresh SSH key pair in memory; the private key never leaves this process.
 */
export type GpuToolsOptions =
  | { mode: "key"; lium?: Lium; apiKey?: string; maxUsdPerGpuHour?: number; budgetUsd?: number; sshKey?: SshKeyPair; onEvent?: (e: ToolEvent) => void }
  | {
      mode: "x402";
      gatewayUrl: string;
      wallet: Hex | LocalAccount;
      maxUsdPerPayment?: number;
      networks?: `${string}:${string}`[];
      /** Pay with USDC on Base (default) or TAO on Bittensor EVM. */
      payWith?: "usdc" | "tao";
      taoRpcUrls?: Record<string, string>;
      maxTaoPerPayment?: number;
      /** Custom fetch for reaching the gateway (proxies, tests). */
      fetch?: typeof fetch;
      sshKey?: SshKeyPair;
      onEvent?: (e: ToolEvent) => void;
    };

export type ToolEvent =
  | { type: "renting"; gpu: string; minutes: number }
  | { type: "paid"; amountUsd: number; txHash: string; network: string }
  | { type: "rented"; podId: string; gpu: string }
  | { type: "waiting"; podId: string; status: string }
  | { type: "ready"; podId: string; ssh: string; expiresAt: string | null }
  | { type: "stdout" | "stderr"; podId: string; chunk: string }
  | { type: "stopped"; podId: string };

interface RentedPod {
  podId: string;
  gpu: string;
  ssh: SshTarget;
  expiresAt: string | null;
}

/** Block explorer link for a settlement, from the PAYMENT-RESPONSE receipt (the 201 body is written before settlement). */
const explorerTx = (network: string, tx: string): string | null =>
  ({
    "eip155:84532": `https://sepolia.basescan.org/tx/${tx}`,
    "eip155:8453": `https://basescan.org/tx/${tx}`,
    "eip155:964": `https://evm.taostats.io/tx/${tx}`,
  })[network] ?? null;

const tail = (s: string, n = 6_000) => (s.length > n ? `…(${s.length - n} earlier characters omitted)…\n${s.slice(-n)}` : s);

export const rentGpuInput = z.object({
  gpu: z.string().describe('GPU model, e.g. "RTX 4090", "RTX 3090", "H100", "A100". Use listGpus to see what is available.'),
  minutes: z.number().int().min(15).max(120).default(15).describe("How long you need it. Billed in 15-minute blocks, rounded up."),
  maxUsdPerGpuHour: z.number().positive().optional().describe("Refuse if the price per GPU-hour is above this."),
});
export const runOnGpuInput = z.object({
  podId: z.string().describe("The podId returned by rentGpu."),
  command: z.string().describe("Shell command to run on the GPU machine (bash). PyTorch and CUDA are installed. Example: nvidia-smi"),
  timeoutSeconds: z.number().int().min(5).max(3600).default(600),
});
export const stopGpuInput = z.object({ podId: z.string().describe("The podId to stop and release.") });
export const listGpusInput = z.object({ gpu: z.string().optional().describe("Filter by model name, e.g. 4090.") });

export class GpuToolkit {
  readonly sshKey: SshKeyPair;
  readonly mode: "key" | "x402";
  readonly gateway: Gpu402Gateway | undefined;
  readonly lium: Lium | undefined;
  private readonly pods = new Map<string, RentedPod>();
  private readonly emit: (e: ToolEvent) => void;
  private readonly maxUsdPerGpuHour: number | undefined;

  constructor(opts: GpuToolsOptions) {
    this.mode = opts.mode;
    this.sshKey = opts.sshKey ?? generateSshKeyPair("gpu402-agent");
    this.emit = opts.onEvent ?? (() => {});
    if (opts.mode === "x402") {
      this.gateway = new Gpu402Gateway({
        url: opts.gatewayUrl,
        wallet: opts.wallet,
        maxUsdPerPayment: opts.maxUsdPerPayment,
        networks: opts.networks,
        payWith: opts.payWith,
        taoRpcUrls: opts.taoRpcUrls,
        maxTaoPerPayment: opts.maxTaoPerPayment,
        fetch: opts.fetch,
      });
    } else {
      this.lium = opts.lium ?? new Lium({ apiKey: opts.apiKey, budgetUsd: opts.budgetUsd });
      this.maxUsdPerGpuHour = opts.maxUsdPerGpuHour;
    }
  }

  async listGpus(input: z.infer<typeof listGpusInput>) {
    if (this.gateway) {
      const { models } = await this.gateway.gpus();
      return models
        .filter((m) => !input.gpu || m.gpu.toLowerCase().replace(/\s/g, "").includes(input.gpu.toLowerCase().replace(/\s/g, "")))
        .slice(0, 15)
        .map((m) => ({ gpu: m.gpu, usdPer15Min: m.blockPriceUsd, usdPerHour: m.pricePerGpuHour, available: m.gpusAvailable, vramGb: m.vramGb }));
    }
    const gpus = await this.lium!.listGpus({ gpu: input.gpu });
    const seen = new Map<string, (typeof gpus)[number]>();
    for (const g of gpus) if (!seen.has(g.gpu)) seen.set(g.gpu, g);
    return [...seen.values()].slice(0, 15).map((g) => ({ gpu: g.gpu, usdPerHour: g.pricePerGpuHour, usdPer15Min: g.pricePerGpuHour / 4, vramGb: g.vramGb }));
  }

  /** Rents a GPU and waits until it accepts SSH. */
  async rentGpu(input: z.infer<typeof rentGpuInput>) {
    const blocks = Math.ceil(input.minutes / BLOCK_MINUTES);
    this.emit({ type: "renting", gpu: input.gpu, minutes: blocks * BLOCK_MINUTES });
    const started = Date.now();

    if (this.gateway) {
      const { data, payment } = await this.gateway.rent({ gpu: input.gpu, blocks, sshPublicKey: this.sshKey.publicKey, maxUsdPerGpuHour: input.maxUsdPerGpuHour });
      if (payment) this.emit({ type: "paid", amountUsd: data.quote.totalUsd, txHash: payment.txHash, network: payment.network });
      this.emit({ type: "rented", podId: data.podId, gpu: data.gpu });
      const ready = await this.gateway.waitReady(data.podId, { onProgress: (s) => this.emit({ type: "waiting", podId: data.podId, status: s.liumStatus ?? s.status }) });
      const pod = { podId: data.podId, gpu: data.gpu, ssh: ready.ssh!, expiresAt: ready.expiresAt };
      this.pods.set(pod.podId, pod);
      this.emit({ type: "ready", podId: pod.podId, ssh: ready.ssh!.command, expiresAt: pod.expiresAt });
      return {
        podId: pod.podId,
        gpu: pod.gpu,
        paidUsd: data.quote.totalUsd,
        paymentTx: payment?.txHash ?? null,
        paymentExplorer: payment ? explorerTx(payment.network, payment.txHash) : null,
        readyInSeconds: Math.round((Date.now() - started) / 1000),
        expiresAt: pod.expiresAt,
        ssh: ready.ssh!.command,
      };
    }

    const lium = this.lium!;
    const rented = await lium.rentCheapest({
      gpu: input.gpu,
      maxUsdPerHour: input.maxUsdPerGpuHour ?? this.maxUsdPerGpuHour,
      ttlMinutes: blocks * BLOCK_MINUTES,
      sshPublicKey: this.sshKey.publicKey,
    });
    this.emit({ type: "rented", podId: rented.podId, gpu: rented.gpu });
    try {
      const ready = await lium.waitReady(rented.podId, { onProgress: (p) => this.emit({ type: "waiting", podId: rented.podId, status: p.status }) });
      const pod = { podId: rented.podId, gpu: rented.gpu, ssh: ready.ssh!, expiresAt: rented.expiresAt?.toISOString() ?? null };
      this.pods.set(pod.podId, pod);
      this.emit({ type: "ready", podId: pod.podId, ssh: ready.ssh!.command, expiresAt: pod.expiresAt });
      return {
        podId: pod.podId,
        gpu: pod.gpu,
        usdPerHour: rented.pricePerHour,
        readyInSeconds: Math.round((Date.now() - started) / 1000),
        expiresAt: pod.expiresAt,
        ssh: ready.ssh!.command,
      };
    } catch (err) {
      await lium.stop(rented.podId).catch(() => {});
      throw err;
    }
  }

  /** Runs a shell command on a rented GPU over SSH. */
  async runOnGpu(input: z.infer<typeof runOnGpuInput>) {
    let pod = this.pods.get(input.podId);
    if (!pod && this.gateway) {
      const s = await this.gateway.status(input.podId);
      if (s.ssh) pod = { podId: s.podId, gpu: s.gpu, ssh: s.ssh, expiresAt: s.expiresAt };
    }
    if (!pod && this.lium) {
      const p = await this.lium.getPod(input.podId);
      if (p.ssh) pod = { podId: p.id, gpu: p.gpu, ssh: p.ssh, expiresAt: p.removalScheduledAt };
    }
    if (!pod) throw new Error(`Unknown or not ready pod ${input.podId}; call rentGpu first.`);
    const r = await sshExec(pod.ssh, input.command, {
      privateKey: this.sshKey.privateKey,
      hostKey: { id: pod.podId }, // pinned on first use; a changed key is refused
      timeoutMs: input.timeoutSeconds * 1000,
      onStdout: (chunk) => this.emit({ type: "stdout", podId: pod.podId, chunk }),
      onStderr: (chunk) => this.emit({ type: "stderr", podId: pod.podId, chunk }),
    });
    return { exitCode: r.exitCode, stdout: tail(r.stdout), stderr: tail(r.stderr, 2_000), durationSeconds: Math.round(r.durationMs / 100) / 10 };
  }

  /** Releases the GPU. */
  async stopGpu(input: z.infer<typeof stopGpuInput>) {
    if (this.gateway) await this.gateway.stop(input.podId);
    else await this.lium!.stop(input.podId);
    this.pods.delete(input.podId);
    this.emit({ type: "stopped", podId: input.podId });
    return { podId: input.podId, stopped: true };
  }

  /** Stops every pod this toolkit rented. Call it in a finally block. */
  async stopAll() {
    await Promise.allSettled([...this.pods.keys()].map((podId) => this.stopGpu({ podId })));
  }
}

export const TOOL_DESCRIPTIONS = {
  listGpus: "List GPU models available to rent right now on Lium (Bittensor Subnet 51), with prices.",
  rentGpu:
    "Rent a decentralized GPU on Lium (Bittensor Subnet 51) and wait until it is ready. Returns a podId. Billed in prepaid 15-minute blocks; the GPU is removed automatically when the time runs out.",
  runOnGpu: "Run a shell command on a GPU you rented (bash, with CUDA and PyTorch installed). Returns exit code, stdout and stderr.",
  stopGpu: "Stop and release a rented GPU as soon as you are done with it.",
} as const;
