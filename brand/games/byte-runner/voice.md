# Byte Runner: voice

**#05 · DOM CHASE · Embedded game.** In the DOM VIRUS voice family: inherit everything in
[`../../voice.md`](../../voice.md) (the persona, tone, avoid list, byline, claims, size rules).
This file adds what is particular to Byte Runner.

Sources: `byte-runner/site/game.json` (page copy), `byte-runner/README.md`,
`byte-runner/PERFORMANCE.md`, the hub's game page (`site-kit/components/GameSection.astro`).

---

## Who's talking

**The game talks first.** Play now, in its hungry, bouncy, slightly cute voice. Then **a short
maker's note** from Chris Cooley, first person, one to three sentences: a trick, an opinion, what
a feature cost. Excited and specific; never biography, never a new fact.

## Who we talk to

Players first: anyone who wants a quick, hungry chase across the page they are reading. Then
developers who want it on their own site: the page says it is **installable** and sends them to
the README. Setup steps never go on the page.

## How the game sounds

Hungry, bouncy, a little cute. Food words and small-creature words.

- "Follow the bites. Eat the page."
- "A round, hungry pixel frog races through magnetic food pipes in the page's whitespace."
- "Food trails. Tiny feet. A very real page."
- "The UI is the terrain."
- "Small feet. Big appetite."

## The maker's note

Chris on the craft. Themes that fit Byte Runner: whitespace as a maze, routing around real
layout, saying what the bytes bought (sound, controls, the bigger maze), reading layout less.

| Don't | Do |
|---|---|
| "A classic maze game, reimagined!" | "Follow the bites. Eat the page." |
| "Turn the tables on the ghosts." | "Turn the tables on the flies." |
| "Food fills every page, guaranteed." | "The maze uses the safe whitespace your page already has." |

Sample maker's lines (style, not facts):
- "Your page's whitespace is a maze. I just had to teach a frog to find it."
- "Every kilobyte is a choice. This one bought sound and a bigger maze."

## The byline

The page says **"by Chris Cooley"**: **By Chris Cooley · coded.design**, linked to
<https://coded.design/> (`family.json` → `credit`). JSON-LD `author` / `creator`: Person "Chris
Cooley", url `https://coded.design/`.

## Words we use / words we never use

- **Use:** frog, trails, food pipes, pellets, power squares, flies (Chaser, Interceptor, Roamer),
  fruit, chomp, hunt, whitespace.
- **Never:** "ghosts" and "power orbs" (old hub wording; the game says **flies** and **power
  squares / pellets**); the name of any other maze game (no third-party trademarks).

## CTA labels

| Label | Goes to |
|---|---|
| **Play Byte Runner** | starts the game on the page |
| **Get the code & setup instructions** | the repo (`family.json` → `games[].repo`) |
| Eject cartridge | back to the console |

Supporting copy: "Play it here, then make it part of your own project. Visit GitHub for the
source code, setup instructions, and integration examples." No board is built from Byte Runner,
so no "Play [Board Game]" link.

## What we never do

- "Embed without a build system" and npm steps on the page; they live in the README.
- Promise more food on every page: "no overlap is introduced just to meet a numeric target".
- Claim it runs on Fizlet. It runs on the DOM VIRUS shared runtime; Fizlet is next.

## Claims: what we may and may not say

- **May say:** the `game.json` facts (6–8 power squares, 3 starting lives, 9 s power ceiling);
  "Byte Runner caps flies at 12"; the coming-soon baseline as a labelled measurement ("≈48 fps"
  under a 4x CPU throttle, goal 60 fps, because it "reads layout every frame").
- **May not say:** a frame rate as a promise, a food count as a guarantee, or a persona claim that
  isn't measured.

## Content mix and size

80–90% gameplay: the loop (Follow pixel food · Grab glowing power · Hunt flies + fruit · Clear the
next trail), the frog and the flies, controls, the first two chapters. 10–20% tech and maker: the
size, the engine line ("Shared TypeScript runtime"), the maker's note, the code card and the
README link.

Size is read from data (last hub build: 29,160 bytes gzip, shown as 29.2 kB, v0.10.2; ceiling
30,000 in `scripts/size.mjs`), with a smaller next target labelled "target" (C1).

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
- reimagined

## Limits

<!-- Read by astro-base-engine (voice.maxSentenceWords, voice.maxExclamations). -->

- max sentence words: 25
- max exclamations: 1

## Open questions

1. **Caps disagree.** `PERFORMANCE.md` says food 420 and routing candidates 952; older hub copy
   says 672 and 280. C2 says generate from the build; until then quote `PERFORMANCE.md`.
