# Swarm Protocol: voice

**#04 · DOM DEFENSE · Embedded game.** In the DOM VIRUS voice family: inherit everything in
[`../../voice.md`](../../voice.md) (the persona, tone, avoid list, byline, claims, size rules).
This file adds what is particular to Swarm Protocol.

Sources: `swarm-protocol/site/game.json` (page copy), `swarm-protocol/README.md`,
`swarm-protocol/PERFORMANCE.md`, the hub's game page (`site-kit/components/GameSection.astro`).

---

## Who's talking

**The game talks first.** Play now, in its urgent, slightly mischievous defender's voice. Then
**a short maker's note** from Chris Cooley, first person, one to three sentences: a trick, an
opinion, a measured win. Excited and specific; never biography, never a new fact.

## Who we talk to

Players first: anyone who wants to release a swarm on the page and then save it. Then site owners
and developers who want a hidden game on their own site: the page says it is **installable** and
sends them to the README. Setup steps never go on the page.

## How the game sounds

Defensive, urgent, a little mischievous. Short orders.

- "Protect every last byte."
- "Release a swarm onto the page, then defend it."
- "Squash them before the interface falls apart."
- "The button is a living health bar."
- "Rescue is a decision, not a teleport cheat."

## The maker's note

Chris on the craft. Themes that fit Swarm: measuring before believing, cutting work instead of
chasing frame rates, the button as a health bar, a hidden opt-in game.

| Don't | Do |
|---|---|
| "Swarm runs at a buttery 60fps everywhere." | "I measured the work, not the frame rate: 81.8% fewer ancestry checks in a repeatable workload." |
| "An incredible bug-squashing adventure!" | "Squash them before the interface falls apart." |
| "Powered by Fizlet." | "Swarm keeps its own engine." |

Sample maker's lines (style, not facts):
- "Measure before you believe. The swarm got faster when I counted what it was doing."
- "I wanted the button to feel alive. So its health is the button."

## The byline

The page says **"by Chris Cooley"**: **By Chris Cooley · coded.design**, linked to
<https://coded.design/> (`family.json` → `credit`). JSON-LD `author` / `creator`: Person "Chris
Cooley", url `https://coded.design/`.

## Words we use / words we never use

- **Use:** swarm, bugs, crawler, hunter, evolve, bite, squash, defend, rescue, zap, the button's
  health.
- **With care:** "hidden, opt-in" and the activation sequence (↑ ↑ ↓ ↓ ← → ← → B A Enter). It is
  part of the charm; its setup stays in the README.
- **Never:** "shared engine" or "Fizlet" for Swarm ("Swarm keeps its established engine"); frame
  rates as promises.

## CTA labels

| Label | Goes to |
|---|---|
| **Play Swarm Protocol** | starts the game on the page |
| **Get the code & setup instructions** | the repo (`family.json` → `games[].repo`) |
| Eject cartridge | back to the console |

Supporting copy: "Play it here, then make it part of your own project. Visit GitHub for the
source code, setup instructions, and integration examples." No board is built from Swarm, so no
"Play [Board Game]" link.

## What we never do

- Drop-in ZIP, Astro component or npm steps on the page; they live in the README.
- FPS claims. Swarm's optimisation is stated as operations: "reduced ancestry checks by 81.8% and
  distance calls by 90.4% … That measures operations in a repeatable workload, not universal FPS."

## Claims: what we may and may not say

- **May say:** the `game.json` facts (48 bug cap, 36 Range reads per frame, 240 nearby glyph
  cache); the coming-soon baseline as a labelled measurement ("≈32 fps" under a 4x CPU throttle,
  goal 60 fps).
- **May not say:** that Swarm runs on the shared runtime or Fizlet; a frame rate as a promise; a
  persona claim that isn't measured.

## Content mix and size

80–90% gameplay: the loop (Release the swarm · Defend the buttons · Rescue distant attacks · Recall
the page), the crew from crawler to hunter, controls, the first two chapters. 10–20% tech and
maker: the size, the engine line ("Established Swarm engine"), the maker's note, the README link.

Size is read from data (last hub build: 34,646 bytes gzip for the full immediate import graph,
shown as 34.6 kB, v1.3.1; initial graph 4,342 bytes), labelled "full immediate path", with a
smaller next target labelled "target" (C1).

## Avoid

<!-- Read by astro-base-engine (voice.avoid): one word or phrase per bullet, flagged wherever it
appears in page copy. The reasons are in the sections above. -->

- revolutionary
- game-changing
- cutting-edge
- best-in-class
- world-class
- seamless
- synergy
- security sandbox
- secure sandbox
- undo everything
- guaranteed fps
- ghosts
- power orbs
- corrupt letters
- next-gen
- disruptive
- unleash
- supercharge
- blazing fast
- lightning-fast
- full speed on anything
- days instead of months
- buttery

## Limits

<!-- Read by astro-base-engine (voice.maxSentenceWords, voice.maxExclamations). -->

- max sentence words: 25
- max exclamations: 1

## Open questions

1. **Release route:** the README says v1.2.3 is "the newest version with published release
   assets; later versions are tags only for now", while the hub shows v1.3.1.
2. **Initial size:** the hub shows 4.3 kB gzip for the initial static graph; `PERFORMANCE.md` says
   "about 1.1 kB compressed" (the deferred scheduler). C2 says generate from the build; which
   figure leads?
