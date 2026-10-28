# Sherman Bytes: voice

**#01 · DOM TANK · Embedded game.** Speaks in the DOM VIRUS voice family: inherit everything in
[`../../voice.md`](../../voice.md) (tone, words, avoid list, credit, size rules). This file adds
what is particular to Sherman Bytes.

Sources: [`sherman-bytes/site/game.json`](https://github.com/coded-dot-design/sherman-bytes/blob/main/site/game.json)
(page copy), [`sherman-bytes/README.md`](https://github.com/coded-dot-design/sherman-bytes/blob/main/README.md),
the hub's game page ([`GameSection.astro`](../../../site-kit/components/GameSection.astro)) and
[`CrossPromo.astro`](../../../site-kit/components/CrossPromo.astro).

---

## Who we talk to

Players first: someone who wants to drive a tank across the page they are reading, right now.
Then developers who want it on their own site: the page says it is **installable** and sends them
to the repository's README. Setup steps never go on the page.

## How we sound

Military-arcade, clipped, in commands. Breach. Build. Hold.

- "Every page is a battlefield." (`sherman-bytes/site/game.json:7`, `README.md:5`)
- "Breach. Build. Hold the page." (`game.json:11`)
- "The terrain is the typography." (`game.json:42`)
- "Breach the walls. Capture the button." (`game.json:46`)
- "A tiny engineer. Your own defensive line." (`game.json:50`)
- "Where the tanks come from: one Sherman, your page, and everything on it as cover."
  (`site-kit/components/CrossPromo.astro:12`)

## Words we use / words we avoid

- **Use:** breach, capture, hold, cover, pillbox, mine, scrap, squad, wave, siege, base, bunker,
  binary rubble, "the page as terrain".
- **Avoid:** "Bolo" in product copy. The README credits the inspiration with care: "inspired by
  the terrain, base capture and resupply ideas of Stuart Cheshire's Bolo. Original pixel art; no
  Bolo code or assets." (`README.md:7`). Keep that framing in the README and the hub's origin story;
  don't use the name to sell the game (parent avoid list: no third-party trademarks).
- **Avoid:** "D-pad" for touch controls; the game uses a joystick (repo commit "Site copy:
  joystick, not D-pad").

## CTA labels

| Label | Goes to |
|---|---|
| **Play Sherman Bytes** | starts the game on the page (`GameSection.astro:46`) |
| **Get the code & setup instructions** | <https://github.com/coded-dot-design/sherman-bytes> (from `family.json`) |
| Supporting copy: "Play it here, then make it part of your own project. Visit GitHub for the source code, setup instructions, and integration examples." | |
| **Play DOM Battlefield** | Battlefield's playable board (`family.json` → `urls.productionPlay`) |
| **Play Battlefield Blitz** | Blitz's playable board |
| Eject cartridge | back to the console (`GameSection.astro:43`) |

The boards link back with **"Explore the original Sherman Bytes"** (rulebook §7).

## Avoid

- Install, `npm pack` or configuration steps on the page; they live in the README ("Embed"
  section).
- Calling it a "battle royale" or "squad" game: that is Blitz and Battlefield. Sherman is one tank,
  single player (`README.md:7`).

## Limits

- **May say:** the numbers in `game.json` (`facts`: 32 enemy tank cap, 120 pooled shells, 3
  buildable defences; chapters: 16 starting scrap, 0.7 s to capture, at most 40 enemies per wave and
  32 alive at once). The hub's caps sentence: "Sherman Bytes caps tanks at 32 and shells at 120."
  (`site-kit/components/UnderTheHood.astro:120`).
- **May say:** shells write literal 0/1 into the page's own Text nodes, and Recall restores what is
  still owned (`game.json` → `extra`).
- **May not say:** a frame rate, or a size that isn't read from `metrics.gzip`.

## Content mix

80–90% gameplay: the loop (Breach the button walls · Capture and resupply · Build cover and
pillboxes · Hold the next wave), the characters, the controls, the first two chapters. 10–20% tech:
the size fact, the engine line ("Shared TypeScript runtime · original single-player tank
simulation", `game.json:68`), the code card and the README link.

## Size and speed

- Measured at the last hub build (`site/generated/data.json`): **26,994 bytes gzip, shown as
  27.0 kB**, `dist/index.js`, game + shared runtime, v0.5.2. Pages read it from data.
- Enforced ceiling: 28,000 bytes (`sherman-bytes/scripts/size.mjs:7`).
- A smaller next target is required by the rulebook and doesn't exist yet (open question).

## Credit

**By Chris Cooley · [coded.design](https://coded.design)**.

## Open questions

1. Kicker: "DOM TANK TACTICS" (today) → "DOM TANK" (rulebook). Confirm before the copy change.
2. The cross-promo today says "Swap to DOM Battlefield" and opens Battlefield's info page; the
   rulebook wants "Play DOM Battlefield" to the playable board, plus a Blitz link.
3. What is Sherman's next, smaller size target?
4. `PERFORMANCE.md:29` lists a 26,000-byte budget; the repo enforces 28,000 and today's build is
   26,994.
