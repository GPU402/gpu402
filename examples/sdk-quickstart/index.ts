// The whitepaper's five lines, runnable: rent the cheapest RTX 4090 on Lium, run nvidia-smi, stop it.
// Needs LIUM_API_KEY. A fresh SSH key pair is generated for the pod; the private key never leaves this process.
import { Lium, generateSshKeyPair } from "gpu402";

const ssh = generateSshKeyPair();
const lium = new Lium({ apiKey: process.env.LIUM_API_KEY, budgetUsd: 1 });

const gpu = process.argv[2] ?? "RTX4090";
console.log(`Renting the cheapest ${gpu} on Lium (Bittensor SN51)…`);

const pod = await lium.rentCheapest({ gpu, maxUsdPerHour: 0.8, ttlMinutes: 15, sshPublicKey: ssh.publicKey });
try {
  console.log(`Pod ${pod.podId} on node ${pod.executorId} at $${pod.pricePerHour.toFixed(3)}/h; Lium removes it at ${pod.expiresAt?.toISOString()}`);
  const ready = await lium.waitReady(pod.podId, { onProgress: (p) => process.stdout.write(`\r  ${p.status} ${p.phase ?? ""}`.padEnd(60)) });
  console.log(`\nReady: ${ready.ssh?.command}`);
  const out = await lium.exec(ready, "nvidia-smi", { privateKey: ssh.privateKey, onStdout: (s) => process.stdout.write(s) });
  console.log(`exit code ${out.exitCode} in ${out.durationMs} ms`);
} finally {
  const { spentUsd } = await lium.stop(pod.podId);
  console.log(`Stopped. Lium billed $${(spentUsd ?? 0).toFixed(6)} for this run (per-second ledger).`);
}
