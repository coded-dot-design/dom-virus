# Voice — Byte Runner

Brand level: game · by Chris Cooley (https://coded.design/)

**05 / DOM CHASE.** A round, hungry pixel frog, magnetic food pipes in the page's whitespace, and
flies to hunt. Byte Runner is in the DOM VIRUS voice family: everything in the DOM VIRUS voice
(brand/voice.md) holds. This file adds only what is Byte Runner's.

## Who we talk to

1. **Players** who want a quick, hungry chase across the page they are reading. No install,
   Recall gives the page back.
2. **Developers** who want it on their own site. One line, "it's open source", and a link to the
   GitHub repository. Setup stays in the README.

## How we sound

Hungry, bouncy, a little cute. Food words, small-creature words, two-beat lines.

- **80–90% just play.** Race the pipes, queue turns, jump out to eat real letters, grab a power
  square and turn the chase around. Tiny feet, big appetite.
- **10–20% engine.** The whitespace is the maze; the DOM carries the trails. One fact, one line.
- **Maker's note, one to three sentences at most.** Chris on teaching a frog to read a layout.

Lines that are the game's own (`site/game.json`):

- "Follow the bites. Eat the page."
- "Food trails. Tiny feet. A very real page."
- "The UI is the terrain."
- "Big glow. Bigger appetite."
- "Small feet. Big appetite."

Maker's note (style, not facts): "Your page's whitespace is already a maze. I just had to teach a
frog to find it."

| Don't | Do |
|---|---|
| "A classic maze game, reimagined!" | "Follow the bites. Eat the page." |
| "Turn the tables on the ghosts." | "Turn the tables on the flies." |
| "Food fills every page, guaranteed." | "The maze uses the whitespace your page already has." |

## Facts we say

Say these as written. Sizes and versions change per release: re-measure before quoting.

- 3 starting lives; 6–8 power squares; each gives 6 seconds of power, stacking to a 9-second
  ceiling. <!-- src: fizlet/byte-runner site/game.json facts, chapters -->
- Vulnerable flies are worth 100, 200, 300, then 400 points. Fruit is optional bonus food.
  <!-- src: fizlet/byte-runner site/game.json chapters -->
- Up to five flies at the start, building toward nine on the first level and twelve later, where
  space permits. <!-- src: fizlet/byte-runner site/game.json extra -->
- Three flies, three minds: the violet Chaser pursues, the pink Interceptor aims ahead, the cyan
  Roamer wanders. <!-- src: fizlet/byte-runner site/game.json characters -->
- Eaten letters stay changed until Recall, which removes the game's creatures, food and text
  edits. <!-- src: fizlet/byte-runner site/game.json chapters, extra -->
- 29,160 bytes gzip at v0.10.2, under a 30,000-byte ceiling enforced by `scripts/size.mjs`.
  <!-- src: node scripts/size.mjs on fizlet/byte-runner v0.10.2 dist/index.js -->
- Runs on the shared DOM VIRUS runtime. Never say it runs on Fizlet.
  <!-- src: fizlet/byte-runner shared/ORIGIN.json (dom-virus 0.21.0) -->

Words that are Byte Runner's: frog, trails, food pipes, pellets, power squares, flies (Chaser,
Interceptor, Roamer), fruit, chomp, tongue, hunt, whitespace.

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
- ghosts
- power orbs
- reimagined

## Limits

- max sentence words: 22
- max exclamations: 1
