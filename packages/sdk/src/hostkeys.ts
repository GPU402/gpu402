import { appendFile, mkdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * SSH host keys pinned on first use, one file per pod, in OpenSSH known_hosts
 * format. The default directory is the one Lium's own CLI and Python SDK use
 * (~/.lium/known_hosts/<pod id>), so a pod pinned by either is trusted the same
 * way by both. A later connection that presents a different key is refused.
 */
export interface HostKeyStore {
  /** Keys pinned for this pod, as "type base64" strings. */
  get(id: string): Promise<string[]>;
  /** Pins a key for this pod. */
  add(id: string, entry: { host: string; port: number; key: string }): Promise<void>;
}

const safeId = (id: string) => id.replace(/[^A-Za-z0-9._-]/g, "_");
const hostField = (host: string, port: number) => (port === 22 ? host : `[${host}]:${port}`);

/** Parses one known_hosts line into "type base64", ignoring the host field and any comment. */
function keyOf(line: string): string | null {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 3 || line.trim().startsWith("#")) return null;
  return `${parts[1]} ${parts[2]}`;
}

export class FileHostKeyStore implements HostKeyStore {
  readonly dir: string;

  constructor(dir?: string) {
    this.dir = dir ?? process.env.GPU402_KNOWN_HOSTS_DIR ?? join(homedir(), ".lium", "known_hosts");
  }

  async get(id: string): Promise<string[]> {
    try {
      const text = await readFile(join(this.dir, safeId(id)), "utf8");
      return text.split("\n").map(keyOf).filter((k): k is string => k !== null);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
  }

  async add(id: string, entry: { host: string; port: number; key: string }): Promise<void> {
    await mkdir(this.dir, { recursive: true, mode: 0o700 });
    await appendFile(join(this.dir, safeId(id)), `${hostField(entry.host, entry.port)} ${entry.key}\n`, { mode: 0o600 });
  }
}

export class MemoryHostKeyStore implements HostKeyStore {
  private readonly pins = new Map<string, string[]>();

  async get(id: string): Promise<string[]> {
    return this.pins.get(id) ?? [];
  }

  async add(id: string, entry: { key: string }): Promise<void> {
    this.pins.set(id, [...(this.pins.get(id) ?? []), entry.key]);
  }
}

/**
 * The file store, falling back to memory where the filesystem is read-only
 * (serverless, containers): pins then last for the life of the process.
 */
export class DefaultHostKeyStore implements HostKeyStore {
  private readonly file = new FileHostKeyStore();
  private readonly memory = new MemoryHostKeyStore();
  private fileWorks = true;

  async get(id: string): Promise<string[]> {
    const mem = await this.memory.get(id);
    if (!this.fileWorks) return mem;
    try {
      return [...(await this.file.get(id)), ...mem];
    } catch {
      this.fileWorks = false;
      return mem;
    }
  }

  async add(id: string, entry: { host: string; port: number; key: string }): Promise<void> {
    if (this.fileWorks) {
      try {
        return await this.file.add(id, entry);
      } catch {
        this.fileWorks = false;
      }
    }
    await this.memory.add(id, entry);
  }
}

export const defaultHostKeyStore = new DefaultHostKeyStore();

/** "ssh-ed25519 AAAA…" from the raw key blob an SSH server presents. */
export function hostKeyString(blob: Buffer): string {
  const len = blob.readUInt32BE(0);
  return `${blob.subarray(4, 4 + len).toString("ascii")} ${blob.toString("base64")}`;
}

/** True when host keys should not be checked (LIUM_SSH_INSECURE=1, as in Lium's own tools). */
export const insecureByEnv = () => process.env.LIUM_SSH_INSECURE === "1" || process.env.GPU402_SSH_INSECURE === "1";
