# Demo runbook

How to record the 3-minute GPU402 demo (whitepaper, "Demo script"). Every step is live: Lium's real market and miners, USDC on Base Sepolia, SN51 read from Finney.

## Before recording (10 minutes)

1. **Pre-flight.** Every line must show ✔:
   ```bash
   pnpm check:wallets
   ```
   You need a Lium balance of at least $1, at least 0.5 USDC in the agent wallet, and the facilitator online.
2. **Model key.** Put `GOOGLE_GENERATIVE_AI_API_KEY` (or `ANTHROPIC_API_KEY` with `AGENT_PROVIDER=anthropic`) in `.env`.
3. **Fresh ledger (optional).** For a clean dashboard: `rm -f apps/gateway/data/gpu402.db*`.
4. **Start everything:**
   ```bash
   pnpm build && pnpm dev     # gateway :4020 + dashboard :3000
   ```
5. **Screen layout:** dashboard on the left (browser at http://localhost:3000), terminal on the right.
6. **Warm-up run.** Run `pnpm demo:sdk RTX3090` once, so you know nodes are renting and how long startup takes right now.

## The 3 minutes

| Time | Show | Say |
|---|---|---|
| 0:00–0:20 | Lium docs: TypeScript gets `openapi-typescript`, agents need an account | "TypeScript devs get types, not a client. Agents need an account and a card before they can rent. Every blocked agent is lost Lium miner revenue." |
| 0:20–1:00 | `pnpm demo:sdk`: cheapest 4090 rented, `nvidia-smi`, pod stopped, final cost | "Five lines with `gpu402`: rent the cheapest RTX 4090, run on it, stop it. Billed per second; the pod self-destructs even if my laptop dies." |
| 1:00–2:00 | `pnpm demo:agent`, with the dashboard's flow strip lighting up 1→5 | "This agent has only a USDC wallet. It hits HTTP 402, signs a USDC payment, and the gateway rents a Lium GPU for it. The agent SSHes in with its own key and benchmarks." |
| 2:00–2:30 | Dashboard: payment row → BaseScan tx, pod countdown, SN51 panel | "Here is the settlement on Base, the pod's paid countdown, and Lium's subnet read live from Bittensor: miners earning, emissions." |
| 2:30–3:00 | Feed shows `pod.expired` (or `DELETE` from the agent) | "Open source, MIT, built on Lium's own spec. The Lium team will list `gpu402` in their docs as a community TypeScript client, and the gateway is the agent payment rail for SN51." |

**Showing the sweeper live:** the agent releases its GPU when done, which shows as `pod.stopped`. To show removal at paid expiry instead, rent from the terminal and let one block run out. Alternatively, before recording, set `SWEEP_INTERVAL_MS=10000` and rent a 1-block pod about 15 minutes before the expiry segment.

## Backup

Record one full clean take of steps 2–4 ahead of time, in case house Wi-Fi or a Lium node fails live. While recording it, keep `apps/gateway/data/gpu402.db`: the dashboard keeps showing that run's payments, tx links and events after a restart.

## If something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| `gateway_low_balance` (503) | Lium balance below 15 min of all pods + reserve | Top up Lium, then retry (no payment was taken) |
| `no_match` (409) | No free node of that model | `pnpm demo:agent` falls back to RTX 3090; or check `curl localhost:4020/gpus` |
| Pod stuck `starting` | Slow node | After `START_TIMEOUT_MIN` (12) it is removed and the agent refunded on-chain |
| Agent: spend cap error | x402 client refused a payment over `maxUsdPerPayment` ($1) | Pick a cheaper GPU or raise the cap in `examples/agent-demo/src/agent.ts` |
