// A real SSH server on 127.0.0.1 (ssh2's Server) that authenticates one public key and
// runs exec requests with /bin/sh, so SSH paths are tested over an actual SSH connection.
import { spawn } from "node:child_process";
import type { AddressInfo } from "node:net";
import ssh2 from "ssh2";

const { Server, utils } = ssh2;

export interface TestSshServer {
  host: string;
  port: number;
  commands: string[];
  close(): Promise<void>;
}

export async function startSshServer(authorizedPublicKey: string): Promise<TestSshServer> {
  const allowed = utils.parseKey(authorizedPublicKey);
  if (allowed instanceof Error) throw allowed;
  const hostKey = utils.generateKeyPairSync("ed25519").private;
  const commands: string[] = [];

  const server = new Server({ hostKeys: [hostKey] }, (client) => {
    client
      .on("authentication", (ctx) => {
        const ok =
          ctx.method === "publickey" &&
          ctx.key.algo === allowed.type &&
          Buffer.compare(ctx.key.data, allowed.getPublicSSH()) === 0 &&
          (!ctx.signature || allowed.verify(ctx.blob!, ctx.signature, ctx.hashAlgo) === true);
        if (ok) ctx.accept();
        else ctx.reject(["publickey"]);
      })
      .on("ready", () => {
        client.on("session", (accept) => {
          accept().on("exec", (acceptExec, _reject, info) => {
            commands.push(info.command);
            const stream = acceptExec();
            const child = spawn("/bin/sh", ["-c", info.command], { env: { PATH: process.env.PATH ?? "/usr/bin:/bin", HOME: "/tmp" } });
            child.stdout.pipe(stream, { end: false });
            child.stderr.pipe(stream.stderr, { end: false });
            stream.on("close", () => child.kill("SIGKILL"));
            child.on("close", (code, signal) => {
              if (signal) stream.exit(signal.replace(/^SIG/, ""), false, "");
              else stream.exit(code ?? 0);
              stream.end();
            });
          });
        });
      })
      .on("error", () => {});
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    host: "127.0.0.1",
    port,
    commands,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
