# Voice — Null Invaders

Brand level: game · by Chris Cooley (https://coded.design/)

**06 / DOM SHOOTER.** Fly an interceptor through a real webpage, shoot letters into binary, and
break the button factories. Null Invaders is in the DOM VIRUS voice family: everything in the DOM
VIRUS voice (brand/voice.md) holds. This file adds only what is Null Invaders'.

## Who we talk to

1. **Players** who want to fly a ship through the page and shoot it to pieces. No install, Recall
   gives the page back.
2. **Developers** who want it on their own site. One line, "it's open source", and a link to the
   GitHub repository. Setup stays in the README.

## How we sound

Arcade shooter: fast, escalating, a little deadpan. Waves, upgrades, counts.

- **80–90% just play.** Fly and fire, earn combat XP, watch the guns grow from Pulse to Overdrive,
  and shut the factories down before the wave does.
- **10–20% engine.** Swept shots, real Text nodes, bounded pools. One fact, one line.
- **Maker's note, one to three sentences at most.** Chris on why a fast shot never skips a letter.

Lines that are the game's own (`site/game.json`):

- "Delete the invasion."
- "Four waves. One page. Increasing firepower."
- "Every heading is cover. Every button is a factory."
- "Get stronger during the fight."
- "Fast shots still hit thin letters."

Maker's note (style, not facts): "A fast shot that skips a thin letter feels like a bug. So I made
sure it can't."

| Don't | Do |
|---|---|
| "The ultimate space shooter!" | "Delete the invasion." |
| "Shots corrupt letters into binary." | "Hits turn letters into binary, in the page's own font." |
| "Endless bullets, zero slowdown." | "Aliens cap at 48 and bullets at 80." |

## Facts we say

Say these as written. Sizes and versions change per release: re-measure before quoting.

- 4 weapon tiers: Pulse, then Twin at 8 XP, Trident at 24, four-shot Overdrive at 50.
  <!-- src: coded-dot-design/null-invaders site/game.json facts, chapters -->
- Letters give 1 XP, aliens 4, factory hits 2, a destroyed factory another 8. Fire cadence speeds
  from 160 ms to 95 ms. <!-- src: coded-dot-design/null-invaders site/game.json chapters -->
- Up to 48 aliens and 80 bullets, recycled through bounded pools.
  <!-- src: coded-dot-design/null-invaders site/game.json facts, chapters -->
- Three shields, four waves. Chained kills build a multiplier up to ×5; losing a shield resets
  the combo but keeps your weapon. <!-- src: coded-dot-design/null-invaders site/game.json extra -->
- A hit writes a literal 0 or 1 into the existing Text node, in the page's own font and colour.
  <!-- src: coded-dot-design/null-invaders site/game.json chapters -->
- 22,940 bytes gzip at v0.7.2, under a 24,000-byte ceiling enforced by `scripts/size.mjs`.
  <!-- src: node scripts/size.mjs on coded-dot-design/null-invaders v0.7.2 dist/index.js -->
- Runs on the shared DOM VIRUS runtime. Never say it runs on Fizlet.
  <!-- src: coded-dot-design/null-invaders shared/ORIGIN.json (dom-virus 0.21.0) -->

Words that are Null Invaders': interceptor, pilot, waves, factories, gates, aliens (drone, crab,
squid), shields, combat XP, Pulse, Twin, Trident, Overdrive, combo, binary.

## Byline

Every surface says **by Chris Cooley**, linked to <https://coded.design/>: the hub's frame, the
game section credit and JSON-LD `author` / `creator` (Person "Chris Cooley", url
`https://coded.design/`). Family line: "By Chris Cooley · coded.design".

## Avoid

- revolutionary
- game-changing
- cutting-edge
- blazing fast
- next-gen
- unleash
- guaranteed fps
- undo everything
- corrupt letters
- ultimate
- zero slowdown
- endless bullets

## Limits

- max sentence words: 22
- max exclamations: 1
