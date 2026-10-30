# gpu402

Typed TypeScript SDK for [Lium](https://lium.io) (Bittensor Subnet 51). Rent the cheapest matching GPU, wait until it is ready, run a job over SSH, stop it, and enforce a budget, in five lines.

```bash
npm install gpu402
```

```ts
import { Lium, generateSshKeyPair } from "gpu402";

const ssh = generateSshKeyPair();
const lium = new Lium({ apiKey: process.env.LIUM_API_KEY });
const pod = await lium.rentCheapest({ gpu: "RTX4090", maxUsdPerHour: 0.5, ttlMinutes: 30, sshPublicKey: ssh.publicKey });
const out = await lium.exec(await lium.waitReady(pod.podId), "nvidia-smi", { privateKey: ssh.privateKey });
await lium.stop(pod.podId);
```

| Method | Lium API | Adds |
|---|---|---|
| `listGpus(filter)` | `GET /executors` | Filter by model(s), price, VRAM, country, reliability; cheapest first |
| `quote(nodeId, {minutes})` | `GET /executors/{id}/quote` | Price per hour, per 15-min block, balance floor |
| `rent(nodeId, opts)` | `POST /executors/{id}/rent` | Idempotency key, official PyTorch template matched to the node's CUDA, server-side TTL |
| `rentCheapest(spec)` | `GET /executors` then rent | Tries the next cheapest node (across all allowed models) if one is taken |
| `rentBySpec(spec)` | `POST /executors/rent-by-spec` | Lium's server-side pick, with `dryRun` |
| `waitReady(podId)` | `GET /pods/{id}` polling | Terminal-status detection, SSH port probe, timeout |
| `exec(pod, cmd, {privateKey})` | SSH (`ssh2`) | Streams stdout/stderr, exit code, timeout |
| `stop(podId)` | `DELETE /pods/{id}` | Idempotent; returns the ledger spend |
| `budget(usd)` / `watchBudget()` | local + `GET /pods/{id}` | Refuses rents whose worst case exceeds the cap; stops pods at the cap |
| `api` | every endpoint | Fully typed raw client (`openapi-fetch`) generated from Lium's spec |

- **Typed errors** follow Lium's `error.code` envelope: `LiumInsufficientBalanceError`, `LiumNoMatchError` (with `.constraint`), `LiumRateLimitError`, `PodStartError` and others.
- **Retries** use exponential backoff with jitter on 429 and 5xx, and honour `Retry-After`. A POST is retried only when it carries an `Idempotency-Key`.
- **Host keys are checked:** the first SSH connection to a pod pins its host key in `~/.lium/known_hosts/<pod id>`, shared with Lium's CLI, and a different key later is refused with `LiumHostKeyError` before anything runs. Set `LIUM_SSH_INSECURE=1` (or `hostKey: false`) to opt out.
- **Never leak cost:** with `ttlMinutes`, Lium schedules the pod's removal server-side. If that schedule cannot be set, the pod is removed at once.
- **Types** are regenerated from `https://lium.io/api/openapi.json` with `pnpm gen:types`, so the SDK tracks Lium's API exactly.

Listing GPUs and quotes work without a key. Node 20+.

## Links

- Source and docs: https://github.com/GPU402/gpu402
- Agent tools (Vercel AI SDK, LangChain.js, x402 payments in USDC or TAO): https://www.npmjs.com/package/@gpu402/tools
- Lium API: https://lium.io/api/openapi.json

GPU402 is a community project and is not maintained by Lium.
