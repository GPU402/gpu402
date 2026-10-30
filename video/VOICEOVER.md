# GPU402 film: voice-over script

Film: `video/out/gpu402-film.mp4` (2:43, 1920×1080, 30 fps, no audio).
Render it again with `pnpm --filter @gpu402/video exec remotion render src/index.ts GPU402Film out/gpu402-film.mp4`.

Each block starts at the timecode shown and is sized to fit before the next cut, at a calm pace of about 2.5 words a second. Lines in *italics* are optional if you run long. Leave the gaps silent; the picture carries them.

---

**0:00 · Cold open** (402, the globe)

> HTTP has a status code that has been waiting since 1997.
> Four-oh-two. Payment Required. "Reserved for future use."

**0:09 · The problem**

> AI agents can write code. But they can't rent a GPU.
> No credit card. No account. No API key.
> So we gave them a wallet, and a status code.

**0:18 · The reveal**

> This is GPU402.
> Every dot on this globe is a real GPU on Lium, Bittensor's Subnet 51.

**0:29 · How it works**

> An agent asks for a GPU. The gateway answers four-oh-two, with an exact price, in USDC or in TAO.
> The agent signs a payment. A signature, not a transaction: no gas, no account.
> Only when Lium accepts the rental does the money settle on-chain. If the rental fails, nobody pays.

**0:46 · A real agent run**

> This is a real run, recorded on testnet.
> A Gemini agent is asked to benchmark an RTX 3090.
> It finds one, gets the four-oh-two, and pays six cents in USDC.
> A Subnet 51 miner in Australia takes the job. Twenty-nine seconds later, the GPU answers over SSH.
> The agent runs its own benchmark: seventy-four teraflops.
> Then it gives the GPU back, and Lium stops billing.
> *On the right is the gateway's own ledger of the same run.*

**1:21 · Paying in TAO**

> Same tools. Same wallet. This time it pays in TAO, on Bittensor EVM.
> Bittensor money in. Bittensor compute out.

**1:34 · Try it on the site**

> You don't have to take our word for it.
> On the site, every button sends a real request.
> Price any GPU on Lium's live market. Ask without paying, and read the real four-oh-two.
> Or connect your own wallet, pay, and SSH into the GPU.

**1:51 · Proof**

> Real money moved, on Base and on Bittensor. Every rental ran on a real miner.

**2:01 · Shipped**

> It is shipped. The SDK and the agent tools are live on npm today.
> One install gives any agent a GPU.

**2:10 · Approved by Lium**

> And the Lium team approved GPU402 for their official docs, as a community-maintained client.
> *We even added SSH host-key pinning when they asked for it.*

**2:18 · Montage**

> A real machine, in 3D. Plain HTTP, all the way down. And Subnet 51, read straight from the chain.

**2:31 · Outro**

> GPU402. GPUs that agents pay for themselves.
> npm install gpu402 tools. Built for the Bittensor Builders House.

---

## Facts behind each line

Everything said is on screen and comes from a real run or live data:

- 402 quote, $0.057750 USDC, Lium node in Australia, ready in 29 s, 73.93 TFLOPS, released: `video/public/capture/session.json` (recorded 30 Oct 2026).
- TAO payment and its transaction: `video/public/capture/session-tao.json`.
- npm versions and publish dates: `video/public/site/npm.json`, read from registry.npmjs.org.
- Site footage: `video/public/site/*.mp4`, screencast of the live dashboard against the live gateway (`node video/record/site.mjs`).
- Lium approval: the Lium team's reply approving GPU402 for listing in their docs as a community-maintained client; the docs change was still being merged when this was written.
