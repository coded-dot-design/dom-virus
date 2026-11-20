# Voice — Sherman Bytes

Brand level: game · by Chris Cooley (https://coded.design/)

**01 / DOM TANK.** One pixel tank, one live webpage, and the text is the terrain. Sherman Bytes is
in the DOM VIRUS voice family: everything in the DOM VIRUS voice (brand/voice.md) holds. This file
adds only what is Sherman's.

## Who we talk to

1. **Players** who want to drive a tank across the page they are reading, right now. No install,
   Recall gives the page back.
2. **Developers** who want it on their own site. They get one line: the game is all rights
   reserved, so ask Chris Cooley first. Never call it open source or MIT; only the engine
   (@fzlt/core) is MIT.

## How we sound

Clipped field orders. Short commands, full stops, three beats: Breach. Build. Hold.

- **80–90% just play.** What you do (drive, aim, breach, capture, build, hold), how it feels
  (letters as walls, shells that blast text into binary rubble), and the controls.
- **10–20% engine.** Real Text nodes, pooled shells, a bounded wave director. One fact, one line.
- **Maker's note, at most one to three sentences.** Chris, first person, on a trick he loved.

Lines that are the game's own (`site/game.json`):

- "Every page is a battlefield."
- "Breach. Build. Hold the page."
- "The terrain is the typography."
- "Breach the walls. Capture the button."
- "A tiny engineer. Your own defensive line."
- "The next wave is already coming."

Maker's note (style, not facts): "I couldn't resist driving a tank through a paragraph. Every
shell comes from a pool, so nothing new gets made mid-fight."

| Don't | Do |
|---|---|
| "A revolutionary tank experience." | "Breach. Build. Hold the page." |
| "Squad up for a battle royale." | "One tank. Your page. Hold it." |
| "The fastest tank game on the web." | "Shells write real 0s and 1s into the page's own text." |

## Facts we say

Say these as written. Sizes and versions change per release: re-measure before quoting.

- Enemy tanks cap at 32 alive; 120 pooled shells; 3 buildable defences: cover (2 scrap),
  pillbox (8), mine (3). <!-- src: fizlet/sherman-bytes site/game.json facts, controls -->
- Start with 16 scrap. Capture a button base by holding it for 0.7 seconds. At most 40 enemies a
  wave. <!-- src: fizlet/sherman-bytes site/game.json chapters -->
- Scout tanks carry 35 armor; heavy tanks 70 armor, from wave 2.
  <!-- src: fizlet/sherman-bytes site/game.json characters -->
- Two modes: Siege (hold against waves) and Conquest (capture every base).
  <!-- src: fizlet/sherman-bytes site/game.json chapters, code -->
- Shells write literal 0/1 into the page's existing Text nodes. Recall restores what the game
  still owns; newer page edits win. <!-- src: fizlet/sherman-bytes README.md:63 -->
- 26,994 bytes gzip at v0.5.2, under a 28,000-byte ceiling enforced by `scripts/size.mjs`.
  <!-- src: node scripts/size.mjs on fizlet/sherman-bytes v0.5.2 dist/index.js -->
- Runs on the shared DOM VIRUS runtime. Never say it runs on Fizlet.
  <!-- src: fizlet/sherman-bytes shared/ORIGIN.json (dom-virus 0.21.0) -->
- Its tanks also roll in DOM Battlefield and Battlefield Blitz.
  <!-- src: fizlet/dom-virus site-kit/components/CrossPromo.astro -->

Words that are Sherman's: breach, capture, hold, cover, pillbox, mine, scrap, wave, siege, base,
binary rubble, joystick (on touch).

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
- battle royale
- d-pad
- Bolo

## Limits

- max sentence words: 22
- max exclamations: 1
