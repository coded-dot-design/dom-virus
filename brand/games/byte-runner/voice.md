# Byte Runner: voice

**#05 · DOM CHASE · Embedded game.** Speaks in the DOM VIRUS voice family: inherit everything in
[`../../voice.md`](../../voice.md) (tone, words, avoid list, credit, size rules). This file adds
what is particular to Byte Runner.

Sources: [`byte-runner/site/game.json`](https://github.com/coded-dot-design/byte-runner/blob/main/site/game.json)
(page copy), [`byte-runner/README.md`](https://github.com/coded-dot-design/byte-runner/blob/main/README.md),
and the hub's game page ([`GameSection.astro`](../../../site-kit/components/GameSection.astro)).

---

## Who we talk to

Players first: anyone who wants a quick, hungry chase across the page they are reading. Then
developers who want it on their own site: the page says it is **installable** and sends them to the
repository's README. Setup steps never go on the page.

## How we sound

Hungry, bouncy, a little cute. Food words and small-creature words.

- "Follow the bites. Eat the page." (`byte-runner/site/game.json:7`)
- "A round, hungry pixel frog races through magnetic food pipes in the page's whitespace."
  (`game.json:8`)
- "Food trails. Tiny feet. A very real page." (`game.json:11`)
- "The UI is the terrain." (`game.json:40`)
- "Big glow. Bigger appetite." (`game.json:44`)
- "Small feet. Big appetite." (`game.json:48`)

## Words we use / words we avoid

- **Use:** frog, trails, food pipes, pellets, power squares, flies (Chaser, Interceptor, Roamer),
  fruit, chomp, hunt, whitespace.
- **Avoid:** "ghosts" and "power orbs". The hub README still says "turn the tables on
  button-spawned ghosts" and "collect power orbs" (`dom-virus/README.md:34`, `:58`); the game calls
  them **flies** and **power squares / pellets** (`game.json:45`, characters).
- **Avoid:** naming any other maze game; the parent rule is no third-party trademarks.

## CTA labels

| Label | Goes to |
|---|---|
| **Play Byte Runner** | starts the game on the page (`GameSection.astro:46`) |
| **Get the code & setup instructions** | <https://github.com/coded-dot-design/byte-runner> (from `family.json`) |
| Supporting copy: "Play it here, then make it part of your own project. Visit GitHub for the source code, setup instructions, and integration examples." | |
| Eject cartridge | back to the console (`GameSection.astro:43`) |

No board game is built from Byte Runner today, so no "Play [Board Game]" link.

## What we never do
- The "Embed without a build system" and npm steps on the page; they live in the README.
- Promising more food on every page. The maze uses available safe whitespace: "no overlap is
  introduced just to meet a numeric target" (`docs/performance-audit-2026-10.md:33`).

## Claims: what we may and may not say

- **May say:** the `game.json` facts (6–8 power squares, 3 starting lives, 9 s power ceiling) and
  "Byte Runner caps flies at 12" (`site-kit/components/UnderTheHood.astro:120`,
  `PERFORMANCE.md:16`).
- **May say:** the coming-soon baseline as a measurement with its goal labelled: "≈48 fps" under a
  4x CPU throttle, goal 60 fps, because it "reads layout every frame" (`site-kit/coming-soon.ts:101`).
- **May not say:** a frame rate as a promise, or a food count as a guarantee.

## Content mix

80–90% gameplay: the loop (Follow pixel food · Grab glowing power · Hunt flies + fruit · Clear the
next trail), the frog and the flies, controls, the first two chapters. 10–20% tech: the size fact,
the engine line ("Shared TypeScript runtime", `game.json:58`), the code card and the README link.

## Size and speed

- Measured at the last hub build (`site/generated/data.json`): **29,160 bytes gzip, shown as
  29.2 kB**, `dist/index.js`, game + shared runtime, v0.10.2. Pages read it from data.
- Enforced ceiling: 30,000 bytes (`byte-runner/scripts/size.mjs:7`).
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

1. **Caps disagree.** `PERFORMANCE.md:17-18` says food 420 and routing candidates 952; the hub's
   older engineering copy says "layout routing candidates at 672, food squares at 280"
   (`site-kit/components/Site.astro:99`, single-game and archive layouts).
2. `PERFORMANCE.md:29` lists a 27,000-byte budget; the repo enforces 30,000 and today's build is
   29,160. What is the next, smaller target?
