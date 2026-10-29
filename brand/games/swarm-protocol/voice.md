# Swarm Protocol: voice

**#04 · DOM DEFENSE · Embedded game.** Speaks in the DOM VIRUS voice family: inherit everything in
[`../../voice.md`](../../voice.md) (tone, words, avoid list, credit, size rules). This file adds
what is particular to Swarm Protocol.

Sources: [`swarm-protocol/site/game.json`](https://github.com/coded-dot-design/swarm-protocol/blob/main/site/game.json)
(page copy), [`swarm-protocol/README.md`](https://github.com/coded-dot-design/swarm-protocol/blob/main/README.md),
[`swarm-protocol/PERFORMANCE.md`](https://github.com/coded-dot-design/swarm-protocol/blob/main/PERFORMANCE.md),
and the hub's game page ([`GameSection.astro`](../../../site-kit/components/GameSection.astro)).

---

## Who we talk to

Players first: anyone who wants to release a swarm on the page and then save it. Then site owners
and developers who want a hidden game on their own site: the page says it is **installable** and
sends them to the repository's README. Setup steps never go on the page.

## How we sound

Defensive, urgent, a little mischievous. Short orders.

- "Protect every last byte." (`swarm-protocol/site/game.json:7`)
- "Release a swarm onto the page, then defend it." (`game.json:8`)
- "Squash them before the interface falls apart." (`game.json:8`)
- "The button is a living health bar." (`game.json:45`)
- "Rescue is a decision, not a teleport cheat." (`game.json:49`)
- "Little agents eat selected letters into `0` and `1`, grow stronger, and hunt marked buttons."
  (`README.md:5`)

## Words we use / words we avoid

- **Use:** swarm, bugs, crawler, hunter, evolve, bite, squash, defend, rescue, zap, the button's
  health.
- **Use with care:** "hidden, opt-in" and the activation sequence (↑ ↑ ↓ ↓ ← → ← → B A Enter,
  `game.json` → `extra`, `README.md:5`, `:9`). It is part of the charm; keep the setup of it in the
  README.
- **Avoid:** calling Swarm part of the shared engine. "Swarm keeps its established engine."
  (`game.json:54`); its engine line is "Established Swarm engine" (`game.json:59`).

## CTA labels

| Label | Goes to |
|---|---|
| **Play Swarm Protocol** | starts the game on the page (`GameSection.astro:46`) |
| **Get the code & setup instructions** | <https://github.com/coded-dot-design/swarm-protocol> (from `family.json`) |
| Supporting copy: "Play it here, then make it part of your own project. Visit GitHub for the source code, setup instructions, and integration examples." | |
| Eject cartridge | back to the console (`GameSection.astro:43`) |

No board game is built from Swarm today, so no "Play [Board Game]" link.

## What we never do
- Drop-in ZIP, Astro component or npm steps on the page; they live in the README ("Install the
  drop-in ZIP in Astro").
- FPS claims. Swarm's optimisation is stated as operations, not frame rate: "reduced ancestry
  checks by 81.8% and distance calls by 90.4% … That measures operations in a repeatable workload,
  not universal FPS." (`site-kit/components/Site.astro:100`).

## Claims: what we may and may not say

- **May say:** the `game.json` facts (48 bug cap, 36 Range reads per frame, 240 nearby glyph
  cache) and "Swarm caps bugs at 48." (`site-kit/components/UnderTheHood.astro:120`).
- **May say:** the coming-soon baseline as a measurement with its goal labelled: "≈32 fps" under a
  4x CPU throttle, goal 60 fps (`site-kit/coming-soon.ts:100`).
- **May not say:** that Swarm runs on the shared engine or Fizlet today.

## Content mix

80–90% gameplay: the loop (Release the swarm · Defend the buttons · Rescue distant attacks ·
Recall the page), the crew from crawler to hunter, controls, the first two chapters. 10–20% tech:
the size fact, the engine line and the README link.

## Size and speed

- Measured at the last hub build (`site/generated/data.json`): **34,646 bytes gzip, shown as
  34.6 kB**, for the full immediate import graph (6 files, including lazy game code), v1.3.1. The
  initial static import graph is 4,342 bytes (4.3 kB). The page labels it "full immediate path"
  (`GameSection.astro:59`).
- Enforced ceiling: none fixed; Swarm reports its module graph (`swarm-protocol/scripts/size.mjs`).
- A smaller next target is required by the rulebook and doesn't exist yet (open question).

## Credit

**By Chris Cooley · [coded.design](https://coded.design)**.

## Avoid

<!-- Read by astro-base-engine (voice.avoid): one word or phrase per bullet, flagged wherever it
appears in page copy. The reasons are in "Words we use / avoid" and "What we never do" above. -->

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

## Limits

<!-- Read by astro-base-engine (voice.maxSentenceWords, voice.maxExclamations). -->

- max sentence words: 25
- max exclamations: 1

## Open questions

1. **Initial size:** the hub shows 4.3 kB gzip for the initial static graph; Swarm's
   `PERFORMANCE.md:33` says "Initial loading remains about 1.1 kB compressed" (the deferred
   scheduler). Which number leads?
2. **Package scope:** Swarm publishes as `@chriscooley/swarm-protocol`; the other games use
   `@coded-design/…`. Is that intended for the brand?
3. **Release route:** the README says v1.2.3 is "the newest version with published release
   assets; later versions are tags only for now" (`README.md:28`), while the hub shows v1.3.1.
4. What is Swarm's size ceiling and next, smaller target?
