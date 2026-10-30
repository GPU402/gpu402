import { createServer, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Lium, LiumSSHError, PodStartError, generateSshKeyPair, sshExec, waitForPort, type SshTarget } from "../src/index.js";
import { startSshServer, type TestSshServer } from "./ssh-server.js";

const key = generateSshKeyPair("test");
const other = generateSshKeyPair("intruder");
let ssh: TestSshServer;
let target: SshTarget;

beforeAll(async () => {
  ssh = await startSshServer(key.publicKey);
  target = { host: ssh.host, port: ssh.port, user: "root", command: `ssh root@${ssh.host} -p ${ssh.port}` };
});
afterAll(() => ssh.close());

describe("sshExec over a real SSH connection", () => {
  it("runs the command under a login bash, streams output and returns the exit code", async () => {
    const chunks: string[] = [];
    const r = await sshExec(target, "echo out; echo err >&2; exit 3", { privateKey: key.privateKey, onStdout: (c) => chunks.push(c) });
    expect(r).toMatchObject({ exitCode: 3, stdout: "out\n", stderr: "err\n", truncated: false });
    expect(chunks.join("")).toBe("out\n");
    expect(ssh.commands.at(-1)).toBe(`bash -lc 'echo out; echo err >&2; exit 3'`);
  });

  it("quotes commands safely", async () => {
    const r = await sshExec(target, `printf '%s' "it's \\"quoted\\""`, { privateKey: key.privateKey });
    expect(r.stdout).toBe(`it's "quoted"`);
  });

  it("fails fast with a typed error when the key is not authorized", async () => {
    const started = Date.now();
    await expect(sshExec(target, "true", { privateKey: other.privateKey })).rejects.toBeInstanceOf(LiumSSHError);
    expect(Date.now() - started).toBeLessThan(5_000); // no retry loop on auth failure
  });

  it("kills a command that runs past its timeout", async () => {
    await expect(sshExec(target, "sleep 30", { privateKey: key.privateKey, timeoutMs: 500 })).rejects.toThrow(/timed out/);
  });

  it("caps captured output but still streams all of it", async () => {
    let streamed = 0;
    const r = await sshExec(target, "head -c 200000 /dev/zero | tr '\\0' x", {
      privateKey: key.privateKey,
      maxOutputBytes: 10_000,
      onStdout: (c) => (streamed += c.length),
    });
    expect(r.truncated).toBe(true);
    expect(r.stdout.length).toBeLessThan(200_000);
    expect(streamed).toBe(200_000);
  });

  it("probes whether the SSH port is open", async () => {
    expect(await waitForPort(ssh.host, ssh.port)).toBe(true);
    expect(await waitForPort("127.0.0.1", 1, 500)).toBe(false);
  });
});

describe("Lium pod lifecycle against a Lium-format server and a real SSH server", () => {
  let status = "PENDING";
  const deleted: string[] = [];
  let spend = 0;
  let base = "";
  const send = (res: ServerResponse, code: number, body: unknown) => {
    res.writeHead(code, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };
  const server = createServer((req, res) => {
    const m = (req.url ?? "").match(/^\/pods\/([^/]+)$/);
    if (!m) return send(res, 404, {});
    if (req.method === "DELETE") return deleted.push(m[1]!), send(res, 200, {});
    send(res, 200, {
      id: m[1],
      pod_name: "p",
      status,
      executor_id: "e",
      gpu_name: "NVIDIA GeForce RTX 4090",
      gpu_count: "1",
      price: 0.35,
      spend_to_date: spend,
      ssh_connect_cmd: status === "RUNNING" ? `ssh root@${ssh.host} -p ${ssh.port}` : "",
    });
  });
  beforeAll(async () => {
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(() => new Promise<void>((r) => server.close(() => r())));

  it("waitReady polls until RUNNING with SSH reachable, then exec runs on the pod", async () => {
    const lium = new Lium({ apiKey: "k", baseUrl: base });
    const seen: string[] = [];
    setTimeout(() => (status = "RUNNING"), 150);
    const pod = await lium.waitReady("pod-1", { intervalMs: 50, onProgress: (p) => seen.push(p.status) });
    expect(seen[0]).toBe("PENDING");
    expect(pod.ssh).toMatchObject({ host: "127.0.0.1", port: ssh.port });
    const out = await lium.exec(pod, "nvidia-smi 2>/dev/null || echo no-gpu-here", { privateKey: key.privateKey });
    expect(out.exitCode).toBe(0);
  });

  it("waitReady throws PodStartError on a terminal status", async () => {
    status = "CREATION_FAILED";
    await expect(new Lium({ apiKey: "k", baseUrl: base }).waitReady("pod-2", { intervalMs: 10 })).rejects.toBeInstanceOf(PodStartError);
  });

  it("watchBudget stops every tracked pod once ledger spend reaches the cap", async () => {
    status = "RUNNING";
    const lium = new Lium({ apiKey: "k", baseUrl: base });
    const guard = lium.budget(0.1);
    guard.reserve(0.1).commit("pod-3");
    let capped = -1;
    const stop = lium.watchBudget({ intervalMs: 30, onCapReached: (s) => (capped = s) });
    spend = 0.12;
    await new Promise((r) => setTimeout(r, 200));
    stop();
    expect(deleted).toContain("pod-3");
    expect(capped).toBeCloseTo(0.12);
  });
});
