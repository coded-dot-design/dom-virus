# Voice — Swarm Protocol

Brand level: game · by Chris Cooley (https://coded.design/)

**04 / DOM DEFENSE.** "The original DOM experiment." You release a swarm on the page, then you have
to save it. Swarm Protocol is in the DOM VIRUS voice family: everything in the DOM VIRUS voice
(brand/voice.md) holds. This file adds only what is Swarm's.

## Who we talk to

1. **Players** who want to squash bugs before the page falls apart. No install, Recall gives the
   page back.
2. **Site owners and developers** who want a hidden game on their own site. One line, "it's open
   source", and a link to the GitHub repository. Setup stays in the README.

## How we sound

Urgent, defensive, a little mischievous. Alarms and short orders: release, defend, rescue, squash.

- **80–90% just play.** Bugs bite letters into binary, grow, and hunt your buttons. You click,
  tap and scroll to save them. The button is a health bar you can watch drain.
- **10–20% engine.** Swarm keeps its own engine; the win is counted in operations, never FPS.
- **Maker's note, one to three sentences at most.** Chris on measuring before believing.

Lines that are the game's own (`site/game.json`):

- "Protect every last byte."
- "Release a swarm onto the page, then defend it."
- "Squash them before the interface falls apart."
- "The button is a living health bar."
- "Rescue is a decision, not a teleport cheat."

Maker's note (style, not facts): "I wanted the button to feel alive, so its health is the button.
Then I counted what the swarm was doing, and cut the work."

| Don't | Do |
|---|---|
| "Buttery 60fps everywhere." | "90.1% fewer ancestry checks than 1.3.1 in the documented workload." |
| "An incredible bug-squashing adventure!" | "Squash them before the interface falls apart." |
| "Powered by Fizlet." | "The rules run as one Fizlet system; a step never allocates." |

## Facts we say

Say these as written; re-check the source before quoting after a release.

- Up to 48 bugs; at most 600 Range reads a refresh (12.5 Hz while the page changes, 2 Hz once it
  is still); a rules step that never allocates.
  <!-- src: coded-dot-design/swarm-protocol site/game.json facts -->
- Bugs grow: a crawler evolves after 6 letters, a button hunter after 12; each step adds a hit
  point. <!-- src: coded-dot-design/swarm-protocol site/game.json characters -->
- The first bite turns a button mint; yellow from 75% health, coral red from 35%.
  <!-- src: coded-dot-design/swarm-protocol site/game.json chapters -->
- Rescue: Jump from 50 points, Jump + Zap from 200; prices rise with each use. Scrolling is
  always free. <!-- src: coded-dot-design/swarm-protocol site/game.json chapters -->
- Against 1.3.1, the documented 43-second workload makes 90.1% fewer ancestry checks and 91.5%
  fewer computed-style reads. Those are operation counts, not an FPS claim.
  <!-- src: coded-dot-design/swarm-protocol site/game.json chapters, PERFORMANCE.md -->
- Optional hidden start: ↑ ↑ ↓ ↓ ← → ← → B A Enter. The game loads on first open.
  <!-- src: coded-dot-design/swarm-protocol site/game.json extra -->
- Since 1.4.0 Swarm runs on Fizlet: the kernel and `fizlet/board-page`, not the shared runtime.
  Every page change goes through the engine's ledger; Recall restores the page byte for byte.
  <!-- src: coded-dot-design/swarm-protocol site/game.json engine -->

Words that are Swarm's: swarm, bugs, crawler, hunter, evolve, bite, squash, defend, rescue, jump,
zap, the button's health.

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
- buttery
- undo everything
- corrupt letters
- powered by Fizlet
- shared engine

## Limits

- max sentence words: 22
- max exclamations: 1
