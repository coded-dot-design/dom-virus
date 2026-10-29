# Null Invaders: voice

**#06 · DOM SHOOTER · Embedded game.** In the DOM VIRUS voice family: inherit everything in
[`../../voice.md`](../../voice.md) (the persona, tone, avoid list, byline, claims, size rules).
This file adds what is particular to Null Invaders.

Sources: `null-invaders/site/game.json` (page copy), `null-invaders/README.md`,
`null-invaders/PERFORMANCE.md`, the hub's game page (`site-kit/components/GameSection.astro`).

---

## Who's talking

**The game talks first.** Play now, in its fast, escalating, slightly deadpan shooter voice. Then
**a short maker's note** from Chris Cooley, first person, one to three sentences: a trick, an
opinion, a measured detail. Excited and specific; never biography, never a new fact.

## Who we talk to

Players first: anyone who wants to fly a ship through the page and shoot it to pieces. Then
developers who want it on their own site: the page says it is **installable** and sends them to
the README. Setup steps never go on the page.

## How the game sounds

Arcade shooter: fast, escalating, a little deadpan. Waves and upgrades.

- "Delete the invasion."
- "Fly an interceptor through a real webpage."
- "Four waves. One page. Increasing firepower."
- "Every heading is cover. Every button is a factory."
- "Fast shots still hit thin letters."

## The maker's note

Chris on the craft. Themes that fit Null Invaders: why fast shots still hit thin letters, writing into real text nodes in the page's own font, caps that keep a frame
honest, why it's the smallest of the four.

| Don't | Do |
|---|---|
| "The ultimate space shooter, now in your browser!" | "Delete the invasion." |
| "Shots corrupt letters into binary." | "Hits turn letters into binary, in the page's own font." |
| "Endless bullets, zero slowdown." | "Aliens cap at 48 and bullets at 80. That's how the frame stays honest." |

Sample maker's lines (style, not facts):
- "A fast shot that skips a thin letter feels like a bug. So it doesn't skip."
- "Every bullet comes from a pool. Hit the cap and the game just says no."

## The byline

The page says **"by Chris Cooley"**: **By Chris Cooley · coded.design**, linked to
<https://coded.design/> (`family.json` → `credit`). JSON-LD `author` / `creator`: Person "Chris
Cooley", url `https://coded.design/`.

## Words we use / words we never use

- **Use:** interceptor, pilot, waves, factories, gates, aliens (drone, crab, squid), shields,
  combat XP, the four guns by name (Pulse, Twin, Trident, Overdrive), combo, binary.
- **Never:** the names of other shooters (no third-party trademarks); "corrupt" for what shots do
  (the game says "Turn letters into binary" and "Shoot letters").

## CTA labels

| Label | Goes to |
|---|---|
| **Play Null Invaders** | starts the game on the page |
| **Get the code & setup instructions** | the repo (`family.json` → `games[].repo`) |
| Eject cartridge | back to the console |

Supporting copy: "Play it here, then make it part of your own project. Visit GitHub for the
source code, setup instructions, and integration examples." No board is built from Null Invaders,
so no "Play [Board Game]" link.

## What we never do

- "Embed without a build system" and npm steps on the page; they live in the README.
- Long weapon tables on the page; the README holds the full gun table.
- Claim it runs on Fizlet. It runs on the DOM VIRUS shared runtime; Fizlet is next.

## Claims: what we may and may not say

- **May say:** the `game.json` facts (4 weapon tiers, 48 alien cap, 80 bullet cap); hits write a
  literal 0 or 1 into the existing DOM Text node, in the page's own font.
- **May not say:** a frame rate as a promise, or a persona claim that isn't measured.

## Content mix and size

80–90% gameplay: the loop (Shoot letters · Earn combat XP · Upgrade the ship · Destroy factories),
the ship and the aliens, controls, the first two chapters. 10–20% tech and maker: the size, the
engine line ("Shared TypeScript runtime"), the maker's note, the code card and the README link.

Size is read from data (last hub build: 22,940 bytes gzip, shown as 22.9 kB, v0.7.2, the smallest
of the four embedded games; ceiling 24,000 in `scripts/size.mjs`), with a smaller next target
labelled "target" (C1).

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
- ultimate

## Limits

<!-- Read by astro-base-engine (voice.maxSentenceWords, voice.maxExclamations). -->

- max sentence words: 25
- max exclamations: 1

## Open questions

1. **Lives or shields?** The README says "Three lives"; `game.json` says "Three shields" and
   "Contact costs a shield".
