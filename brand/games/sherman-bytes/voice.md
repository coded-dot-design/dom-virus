# Sherman Bytes: voice

**#01 · DOM TANK · Embedded game.** In the DOM VIRUS voice family: inherit everything in
[`../../voice.md`](../../voice.md) (the persona, tone, avoid list, byline, claims, size rules).
This file adds what is particular to Sherman Bytes.

Sources: `sherman-bytes/site/game.json` (page copy), `sherman-bytes/README.md`, the hub's game page
(`site-kit/components/GameSection.astro`, `CrossPromo.astro`).

---

## Who's talking

**The game talks first.** Play now, in its own clipped military-arcade voice. Then **a short
maker's note** from Chris Cooley, first person, one to three sentences: the trick he loved
building, an opinion about craft, why it's small. Excited and specific; never biography, never a
new fact.

## Who we talk to

Players first: someone who wants to drive a tank across the page they are reading, right now. Then
developers who want it on their own site: the page says it is **installable** and sends them to
the README. Setup steps never go on the page.

## How the game sounds

Clipped, in commands. Breach. Build. Hold.

- "Every page is a battlefield."
- "Breach. Build. Hold the page."
- "The terrain is the typography."
- "Breach the walls. Capture the button."
- "A tiny engineer. Your own defensive line."

## The maker's note

Chris on the craft, after the game has had its say. Themes that fit Sherman: the page as terrain,
why real text nodes beat clones, pooling shells, why one small tank is enough.

| Don't | Do |
|---|---|
| "Sherman Bytes is a revolutionary tank experience." | "Breach. Build. Hold the page." |
| "The fastest tank game on the web." | "Shells write real 0s and 1s into the page's own text. I still grin every time." |
| "Inspired by Bolo, the classic Mac game!" | Keep Bolo for the hub's credited origin story; let the tank sell itself. |

Sample maker's lines (style, not facts):
- "The terrain is your typography. I couldn't resist driving a tank through a paragraph."
- "Every shell comes from a pool. Nothing new gets made mid-fight, and you can feel it."

## The byline

The page says **"by Chris Cooley"**: **By Chris Cooley · coded.design**, linked to
<https://coded.design/> (`family.json` → `credit`). JSON-LD `author` / `creator`: Person "Chris
Cooley", url `https://coded.design/`.

## Words we use / words we never use

- **Use:** breach, capture, hold, cover, pillbox, mine, scrap, wave, siege, base, bunker, binary
  rubble, "the page as terrain", joystick (touch).
- **Never:** "Bolo" to sell the game (the README credits it with care: "inspired by the terrain,
  base capture and resupply ideas of Stuart Cheshire's Bolo. Original pixel art; no Bolo code or
  assets."); "D-pad" (it's a joystick); "battle royale" or "squad" (that's Blitz and Battlefield;
  Sherman is one tank, single player).

## CTA labels

| Label | Goes to |
|---|---|
| **Play Sherman Bytes** | starts the game on the page |
| **Get the code & setup instructions** | the repo (`family.json` → `games[].repo`) |
| **Play DOM Battlefield** · **Play Battlefield Blitz** | the playable boards (`urls.productionPlay`) |
| Eject cartridge | back to the console |

Supporting copy: "Play it here, then make it part of your own project. Visit GitHub for the
source code, setup instructions, and integration examples." The boards link back with **Explore the
original Sherman Bytes**.

## What we never do

- Install, `npm pack` or configuration steps on the page; they live in the README.
- Claim it runs on Fizlet. It runs on the DOM VIRUS shared runtime; Fizlet is next.

## Claims: what we may and may not say

- **May say:** the `game.json` facts (32 enemy tank cap, 120 pooled shells, 3 buildable defences;
  16 starting scrap, 0.7 s to capture, at most 40 enemies per wave and 32 alive at once); shells
  write literal 0/1 into the page's own Text nodes, and Recall restores what is still owned.
- **May not say:** a frame rate, a size that isn't read from `metrics.gzip`, or a persona claim
  that isn't measured ("full speed on anything").

## Content mix and size

80–90% gameplay: the loop (Breach the button walls · Capture and resupply · Build cover and
pillboxes · Hold the next wave), characters, controls, the first two chapters. 10–20% tech and
maker: the size, the engine line ("Shared TypeScript runtime · original single-player tank
simulation"), the maker's note, the code card and the README link.

Size is read from data (last hub build: 26,994 bytes gzip, shown as 27.0 kB, v0.5.2; ceiling
28,000 in `scripts/size.mjs`), with a smaller next target labelled "target" (C1).

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
- d-pad

## Limits

<!-- Read by astro-base-engine (voice.maxSentenceWords, voice.maxExclamations). -->

- max sentence words: 25
- max exclamations: 1
