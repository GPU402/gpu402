# Brand: GPU402

_Status: active_

GPU402 is a payment rail for decentralized compute. The interface is near-black and quiet, with one electric blue and one editorial serif word per screen. Light headlines, mono labels, flat hairline panels, real 3D where it explains something, and a paper surface for the one number that matters. The signature is the status code itself: 402 turning into 200.

## Ideas

- **A planet of real GPUs.** The hero is a globe of Lium's real nodes rising from the bottom of the screen, wrapped in an x402 payment ring. Payments travel the ring; rentals fire a beam to the miner's real location.
- **Show the product working.** "How it works" is a terminal window that replays the latest real rental from the gateway's own events, step by step: Quote, Pay, Rent, Run, Release.
- **Try everything for real.** The playground prices a GPU, shows the raw 402, and rents one paid from the visitor's own wallet, with an SSH key made in the browser. The API explorer sends the free endpoints live; package cards read npm live.
- **One machine in 3D.** A GPU card built in three.js turns with the scroll and leans toward the pointer; its fans spin up while a real pod is live.
- **Space over density.** Sections breathe (160 px apart on desktop), one sentence of context each, short lists with "Show more".
- **One number on paper.** What agents paid, on a cream card, split by rail.
- **Everything else one tap away.** Live details sit in tabs. Never a wall of tables.

## Colour

| Token | Value | Use |
|---|---|---|
| `--void` | `#07080A` | Page background |
| `--ink-1` / `--ink-2` / `--ink-3` | `rgba(235,238,245,0.03 / 0.055 / 0.1)` | Panels, hover, tracks |
| `--hair` | `rgba(235,238,245,0.075)` | Hairline borders |
| `--text` | `#EDEDF0` | Primary text |
| `--muted` | `#A3A4AB` | Secondary text |
| `--faint` | `#7A7C85` | Labels (4.6:1 on void) |
| `--accent` | `#4360FF` | Primary action, active tab, premium nodes |
| `--peri` | `#9DB0FF` | Serif accent word, links, the globe's land |
| `--live` | `#3DDC97` | Live compute, success |
| `--usdc` | `#7B93FF` | USDC on Base |
| `--tao` | `#E8834A` | TAO on Bittensor |
| `--amber` / `--rose` | `#E0A23A` / `#F0616D` | Starting / failure |
| `--paper` / `--paper-ink` / `--paper-muted` | `#F2EFE9` / `#16161A` / `#5D5B57` | The paper card |
| `--rust` / `--cobalt` | `#B85A2E` / `#3B50DD` | TAO and USDC on paper |

## Type

- **Headlines:** Geist Light, tracking about -0.05em.
- **Accent:** Instrument Serif italic in `--peri`, for one or two words.
- **UI:** Geist.
- **Labels, numbers, code:** Geist Mono. Labels are uppercase with wide tracking ("01 —— HOW IT WORKS / QUOTE"). Numbers are always `tabular-nums`.

## Motion

- Ambient motion (globe rotation, the step walkthrough) is slow and stops under `prefers-reduced-motion`.
- Event motion (a payment, a rental) takes 250–400 ms, eases out, and is also shown as text.
- UI micro-interactions take 100–150 ms and change colour or transform only.

## Voice

Short, plain, present tense. "Paid in TAO", not "Payment has been successfully processed". Numbers before words.
