# DOM VIRUS: new game ideas and build order

The list of games we plan to build next, in order. Each one is a "coming soon" entry on the hub
(`/coming-soon/`). When a game starts, it gets its own design doc under `docs/games/`, a repo and a
hub id. Names are working names; every one is original (no third-party trademarks in the product).

**The drama bar.** Every new game must hit the animation level of the DOM VIRUS home hero (interceptor
and tank blowing up bad guys, `site-kit/components/HeroScene.astro` + `site-kit/hero-game.ts`) and the
DOM Battlefield landing hero (tanks shelling and flattening the headline, airstrikes,
`dom-battlefield/site/src/scripts/arena.ts`). Those two are the floor: hit-stop, flash, shock rings,
spinning chunks, square debris, scorch, shake, pop words, letters knocked and flattened, then the page
heals on Recall.

| # | Game | One line | Status | Design |
|---|---|---|---|---|
| 1 | **Battlefield Blitz** | DOM Battlefield's fast arcade cut: the landing-page arena as a real game. Waves, airstrikes, chaos. | Next up | below |
| 2 | **DOM Crossfire** | The mash-up: the DOM VIRUS hero (interceptor, skulls, bad guys) meets the Battlefield arena (tanks, airstrikes) on one page. | Next up | below |
| 3 | **DOM Kaiju** | A giant pixel gorilla climbs your page from the footer to the top, smashing text while choppers swarm. | Planned (engine test) | [`docs/games/dom-kaiju.md`](docs/games/dom-kaiju.md) |
| 4 | **DOM Flock** | The light-gun duck shoot: birds burst out of the page and you're the crosshair. | Idea | below |

Battlefield (the original, "OG") stays the full tactics game; Blitz is its arcade sibling.

---

## 1. Battlefield Blitz (next up)

**Why first:** it already exists as the DOM Battlefield landing hero (`arena.ts`, ≈600 lines, game
tank sprites, one canvas). Turning it into a game is mostly rules and UI, so it is the quickest
proof of the drama bar and a clean first engine harness test (`fx`, `camera` shake, `input`, pools).

- **Repo:** `coded-dot-design/dom-battlefield` (a second mode: `/blitz/`) or its own
  `dom-battlefield-blitz`; decide when work starts. **Hub id:** `blitz`.
- **Loop:** endless waves on the page you are on. You drive one tank (WASD / stick), aim with the
  pointer (or auto-aim on phones), and call **airstrikes** (tap anywhere, limited charges that
  refill with kills). Enemy tanks pour in from the edges in waves; every 5th wave a boss (a heavy
  with a shield, or an HQ that spawns tanks).
- **Page as terrain:** headings and cards are cover (shells knock letters, treads flatten them,
  exactly like the landing hero); white space is open ground. Recall heals everything.
- **Drama:** all of the landing hero (multi-blast strikes, KABOOM / WRECKED / FLATTENED pop words,
  scorch, shake) plus combo chains, slow-mo on the last kill of a wave, a big wave-clear burst.
- **Power-ups (drops):** rapid fire, triple shot, cluster strike, shield, nuke (screen-clear).
- **Score:** wrecks, flattened, strikes, waves, combo. Local high score; later a weekly board.
- **UI:** Board UI throughout (HUD panel like the landing hero's WRECKS / FLATTENED / STRIKES, the
  AIRSTRIKE key, pause overlay, launch burst on START).
- **Builds:** embed (drop onto any page, easter-egg trigger) and the board mode inside Battlefield's
  site.

## 2. DOM Crossfire (next up, the mash-up)

**Why second:** both halves exist: the DOM VIRUS hero mini-game (interceptor + tank vs skulls and
bad guys, `hero-game.ts`) and the Battlefield arena. Crossfire puts them on one page.

- **Hub id:** `crossfire`. **Repo:** decide when work starts (likely in `dom-virus` as a hub
  feature first, then its own package).
- **Loop:** air and ground at once. You fly the **interceptor** (DOM VIRUS hero ship) or drive the
  **tank**, switch any time (TAB / swap key); the other is AI wingman. Enemies are the whole
  family: DOM VIRUS skulls, aliens, flies from Swarm Protocol, Null Invaders, enemy tanks from
  Battlefield. They spawn out of the page's own elements (buttons become factories).
- **Drama:** the hero's booms (flash, core, ring, rotating square, square bits) and the arena's
  strikes and letter knocks together; the nuke round reset from the hero game ("every two minutes
  an alarm counts down, the card blinks and a nuke resets the round") becomes the boss phase.
- **Score:** kills by type, combo, rounds survived. Same HUD language as Blitz.
- **Builds:** first as the playable DOM VIRUS home hero (replace the "tap to play" mini-game), then an
  embed.

## 3. DOM Kaiju (the engine's big test)

Full design in [`docs/games/dom-kaiju.md`](docs/games/dom-kaiju.md): GLITCH the giant pixel gorilla
falls in, the page auto-scrolls to the footer, and he climbs back to the top up the sides of text,
cards and buttons, punching handholds into white space, smashing everything (fire, falling people,
glyph shards), while chopper swarms shoot and live-wire text zaps him back to the bottom. Embed and
board builds. Coming soon cartridge and detail page on the hub (`/games/kaiju/`).

## 4. DOM Flock (idea)

The light-gun duck shoot, our way.
- Pixel birds burst out of headings and images in pairs, flap across the page in arcs, dodge, and
  escape off the top if you miss. You are the crosshair (mouse / tap; gamepad aim).
- Three shots per pair; a hit bird freezes, does the startled pose and drops into the text,
  knocking letters. A smug pixel hound pops up from the footer to show your catch (or laughs).
- Rounds speed up; golden birds score big; clay-target bonus round with page buttons as launchers.
- Small and quick: a good "micro-interaction" test for the engine's `input` (pointer aim) and `fx`.

---

## Next phase (engine and optimisations)

Tracked in [`ENGINE.md`](ENGINE.md). Short version for the hub's coming-soon page:
- **E0** baseline and archives: perf harness (done), baseline numbers (done), Battlefield archive
  selector, test-a-release for every game.
- **E1** kernel: one scheduler, fixed step, lifecycle, pools, ledger (Recall), ≤ 4 KB.
- **E2** harnesses: input, collide, actor/steer, rules, board-page, board-grid, view, camera, fx,
  sound adapter, embed config (palette + easter eggs), Board UI.
- **E3** port the games to the engine (cut versions), perf equal or better than baseline.
- **E4** multiplayer Battlefield (presence, rooms, co-op and 1v1).
- **Optimisation targets from the baseline:** Swarm Protocol (≈32 fps under 4x throttle → 60),
  Byte Runner (per-frame layout reads, ≈48 fps → 60), Battlefield layouts per second.
