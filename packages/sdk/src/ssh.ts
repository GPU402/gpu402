import { connect } from "node:net";
import ssh2, { type Client as SshClient, type ConnectConfig } from "ssh2";
import { LiumHostKeyError, LiumSSHError } from "./errors.js";
import { defaultHostKeyStore, hostKeyString, insecureByEnv, type HostKeyStore } from "./hostkeys.js";
import { sleep } from "./http.js";
import type { SshTarget } from "./pod.js";

// ssh2 is CommonJS: take its exports from the default import so Node ESM can load it.
const { Client, utils } = ssh2;

export interface ExecOptions {
  /** OpenSSH or PEM private key matching the public key the pod was rented with. */
  privateKey: string | Buffer;
  passphrase?: string;
  /** Called with each stdout chunk as it arrives. */
  onStdout?: (chunk: string) => void;
  /** Called with each stderr chunk as it arrives. */
  onStderr?: (chunk: string) => void;
  /** Kill the command after this long. Default 10 minutes. */
  timeoutMs?: number;
  /** Connection attempts while sshd comes up. Default 5. */
  connectAttempts?: number;
  /** Cap on captured output per stream, in bytes. Default 4 MiB. */
  maxOutputBytes?: number;
  signal?: AbortSignal;
  /**
   * Host key checking. By default the pod's key is pinned on first connection
   * (in ~/.lium/known_hosts/<id>, shared with Lium's CLI) and any later
   * different key is refused with LiumHostKeyError. `id` names the pin (the pod
   * id; defaults to host:port). `false` turns checking off, as does
   * LIUM_SSH_INSECURE=1.
   */
  hostKey?: { id?: string; store?: HostKeyStore } | false;
}

export interface ExecResult {
  exitCode: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  /** True when captured output hit `maxOutputBytes` (streaming callbacks still saw everything). */
  truncated: boolean;
}

async function connectOnce(target: SshTarget, opts: ExecOptions): Promise<SshClient> {
  const check = opts.hostKey !== false && !insecureByEnv();
  const store = (opts.hostKey && opts.hostKey.store) || defaultHostKeyStore;
  const id = (opts.hostKey && opts.hostKey.id) || `${target.host}:${target.port}`;
  const pinned = check ? await store.get(id) : [];
  let seen: string | undefined;

  const client = await new Promise<SshClient>((resolve, reject) => {
    const c = new Client();
    c.once("ready", () => resolve(c))
      .once("error", (err) => {
        if (seen && pinned.length && !pinned.includes(seen)) {
          reject(
            new LiumHostKeyError(`Pod ${id} presented an SSH host key that differs from the one pinned for it; refusing to connect.`, {
              code: "host_key_mismatch",
              hint: `If the pod was recreated, remove its pin (${id} in ~/.lium/known_hosts) and connect again. Otherwise someone may be intercepting the connection.`,
            }),
          );
        } else reject(err);
      })
      .connect({
        host: target.host,
        port: target.port,
        username: target.user,
        privateKey: opts.privateKey,
        passphrase: opts.passphrase,
        readyTimeout: 20_000,
        keepaliveInterval: 15_000,
        // Checked during the handshake, before authentication: a wrong key never sees a command.
        hostVerifier: (key: Buffer) => {
          seen = hostKeyString(key);
          return !check || pinned.length === 0 || pinned.includes(seen);
        },
      } satisfies ConnectConfig);
  });

  if (check && pinned.length === 0 && seen) await store.add(id, { host: target.host, port: target.port, key: seen });
  return client;
}

/** Resolves when the TCP port accepts connections (sshd is listening). */
export function waitForPort(host: string, port: number, timeoutMs = 3_000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host, port });
    const done = (ok: boolean) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs, () => done(false));
    socket.once("connect", () => done(true)).once("error", () => done(false));
  });
}

const shellQuote = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

/** Runs `command` on the pod over SSH, streaming output, and returns the exit code. */
export async function sshExec(target: SshTarget, command: string, opts: ExecOptions): Promise<ExecResult> {
  const attempts = opts.connectAttempts ?? 5;
  let client: SshClient | undefined;
  let lastErr: unknown;
  for (let i = 0; i < attempts && !client; i++) {
    try {
      client = await connectOnce(target, opts);
    } catch (err) {
      if (err instanceof LiumHostKeyError) throw err; // never retry against a host we do not trust
      lastErr = err;
      const msg = String((err as Error)?.message ?? err);
      if (/authentication/i.test(msg)) break;
      if (i < attempts - 1) await sleep(2_000 * (i + 1), opts.signal);
    }
  }
  if (!client) {
    throw new LiumSSHError(`SSH to ${target.user}@${target.host}:${target.port} failed: ${(lastErr as Error)?.message ?? lastErr}`, {
      cause: lastErr,
    });
  }

  const started = Date.now();
  const limit = opts.maxOutputBytes ?? 4 * 1024 * 1024;
  const out: Buffer[] = [];
  const err: Buffer[] = [];
  let outBytes = 0;
  let errBytes = 0;
  let truncated = false;

  try {
    return await new Promise<ExecResult>((resolve, reject) => {
      // Run under bash -lc so PATH and conda/venv profiles load like an interactive shell.
      client!.exec(`bash -lc ${shellQuote(command)}`, (e, stream) => {
        if (e) return reject(new LiumSSHError(`SSH exec failed: ${e.message}`, { cause: e }));
        const timer = setTimeout(() => {
          stream.signal("KILL");
          stream.close();
          reject(new LiumSSHError(`Command timed out after ${opts.timeoutMs ?? 600_000} ms`));
        }, opts.timeoutMs ?? 600_000);
        opts.signal?.addEventListener("abort", () => stream.close(), { once: true });

        stream.on("data", (chunk: Buffer) => {
          opts.onStdout?.(chunk.toString("utf8"));
          if (outBytes < limit) out.push(chunk);
          else truncated = true;
          outBytes += chunk.length;
        });
        stream.stderr.on("data", (chunk: Buffer) => {
          opts.onStderr?.(chunk.toString("utf8"));
          if (errBytes < limit) err.push(chunk);
          else truncated = true;
          errBytes += chunk.length;
        });
        stream.on("close", (code: number | null, signal: string | null) => {
          clearTimeout(timer);
          resolve({
            exitCode: code ?? null,
            signal: signal ?? null,
            stdout: Buffer.concat(out).toString("utf8"),
            stderr: Buffer.concat(err).toString("utf8"),
            durationMs: Date.now() - started,
            truncated,
          });
        });
      });
    });
  } finally {
    client.end();
  }
}

export interface SshKeyPair {
  /** `ssh-ed25519 AAAA… comment`: give this to `rent`. */
  publicKey: string;
  /** OpenSSH private key: keep it, give it to `exec`. */
  privateKey: string;
}

/** Generates a fresh ed25519 key pair in memory, e.g. one per agent run. */
export function generateSshKeyPair(comment = "gpu402"): SshKeyPair {
  const { public: pub, private: priv } = utils.generateKeyPairSync("ed25519", { comment });
  return { publicKey: pub.trim(), privateKey: priv };
}
