# Null Invaders: voice

**#06 · DOM SHOOTER · Embedded game.** Speaks in the DOM VIRUS voice family: inherit everything in
[`../../voice.md`](../../voice.md) (tone, words, avoid list, credit, size rules). This file adds
what is particular to Null Invaders.

Sources: [`null-invaders/site/game.json`](https://github.com/coded-dot-design/null-invaders/blob/main/site/game.json)
(page copy), [`null-invaders/README.md`](https://github.com/coded-dot-design/null-invaders/blob/main/README.md),
and the hub's game page ([`GameSection.astro`](../../../site-kit/components/GameSection.astro)).

---

## Who we talk to

Players first: anyone who wants to fly a ship through the page and shoot it to pieces. Then
developers who want it on their own site: the page says it is **installable** and sends them to the
repository's README. Setup steps never go on the page.

## How we sound

Arcade shooter: fast, escalating, a little deadpan. Waves and upgrades.

- "Delete the invasion." (`null-invaders/site/game.json:7`)
- "Fly an interceptor through a real webpage." (`game.json:8`, `README.md:7`)
- "Four waves. One page. Increasing firepower." (`game.json:11`)
- "Every heading is cover. Every button is a factory." (`game.json:40`)
- "Get stronger during the fight." (`game.json:44`)
- "Fast shots still hit thin letters." (`game.json:52`)

## Words we use / words we avoid

- **Use:** interceptor, pilot, waves, factories, gates, aliens (drone, crab, squid), shields,
  combat XP, the four guns by name (Pulse, Twin, Trident, Overdrive), combo, binary.
- **Avoid:** naming other shooters; the parent rule is no third-party trademarks.
- **Avoid:** "corrupt" for what shots do. Older hub copy says "corrupt letters into binary"
  (`dom-virus/README.md:33`); `game.json` says "Turn letters into binary" and "Shoot letters".

## CTA labels

| Label | Goes to |
|---|---|
| **Play Null Invaders** | starts the game on the page (`GameSection.astro:46`) |
| **Get the code & setup instructions** | <https://github.com/coded-dot-design/null-invaders> (from `family.json`) |
| Supporting copy: "Play it here, then make it part of your own project. Visit GitHub for the source code, setup instructions, and integration examples." | |
| Eject cartridge | back to the console (`GameSection.astro:43`) |

No board game is built from Null Invaders today, so no "Play [Board Game]" link.

## Avoid

- The "Embed without a build system" and npm steps on the page; they live in the README.
- Long weapon tables on the page; the README holds the full gun table (`README.md:16-21`).

## Limits

- **May say:** the `game.json` facts (4 weapon tiers, 48 alien cap, 80 bullet cap) and "Null
  Invaders caps aliens at 48 and bullets at 80" (`site-kit/components/UnderTheHood.astro:120`,
  `PERFORMANCE.md:14-15`).
- **May say:** hits write a literal 0 or 1 into the existing DOM Text node, in the page's own font
  (`game.json:41`, `README.md:14`).
- **May not say:** a frame rate as a promise.

## Content mix

80–90% gameplay: the loop (Shoot letters · Earn combat XP · Upgrade the ship · Destroy
factories), the ship and the aliens, controls, the first two chapters. 10–20% tech: the size
fact, the engine line ("Shared TypeScript runtime", `game.json:58`), the code card and the README
link.

## Size and speed

- Measured at the last hub build (`site/generated/data.json`): **22,940 bytes gzip, shown as
  22.9 kB**, `dist/index.js`, game + shared runtime, v0.7.2. Pages read it from data. It is the
  smallest of the four.
- Enforced ceiling: 24,000 bytes (`null-invaders/scripts/size.mjs:7`).
- A smaller next target is required by the rulebook and doesn't exist yet (open question).

## Credit

**By Chris Cooley · [coded.design](https://coded.design)**.

## Open questions

1. **Lives or shields?** The README says "Three lives" (`README.md:7`); `game.json` says "Three
   shields" (`extra`) and "Contact costs a shield" (Crab).
2. `PERFORMANCE.md:29` lists a 22,000-byte budget; the repo enforces 24,000 and today's build is
   22,940. What is the next, smaller target?
