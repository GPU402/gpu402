// Starts a local EVM node (Foundry's anvil) with Bittensor EVM's chain id, so native TAO
// payments are signed, broadcast and mined for real in tests.
import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { createPublicClient, createTestClient, http, parseEther, type Hex, type PublicClient } from "viem";

const freePort = () =>
  new Promise<number>((resolve) => {
    const s = createServer().listen(0, "127.0.0.1", () => {
      const { port } = s.address() as { port: number };
      s.close(() => resolve(port));
    });
  });

export interface AnvilChain {
  url: string;
  client: PublicClient;
  fund(address: Hex, tao: string): Promise<void>;
  balance(address: Hex): Promise<bigint>;
  stop(): void;
}

export async function startAnvil(chainId = 945): Promise<AnvilChain> {
  const port = await freePort();
  const proc: ChildProcess = spawn("anvil", ["--port", String(port), "--chain-id", String(chainId), "--silent"], { stdio: "ignore" });
  const url = `http://127.0.0.1:${port}`;
  const client: PublicClient = createPublicClient({ transport: http(url) });
  const admin = createTestClient({ mode: "anvil", transport: http(url) });
  for (let i = 0; i < 100; i++) {
    try {
      await client.getChainId();
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 50));
    }
  }
  return {
    url,
    client,
    fund: (address: Hex, tao: string) => admin.setBalance({ address, value: parseEther(tao) }),
    balance: (address: Hex) => client.getBalance({ address }),
    stop: () => void proc.kill(),
  };
}
