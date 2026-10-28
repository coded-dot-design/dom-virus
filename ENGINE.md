# Engine phase: the micro DOM game engine

Status: **Phase E0 (baseline) in progress** (perf harness and baseline numbers done; tags and the Battlefield archive selector next). Owner: whoever picks this up. Update the
[Progress log](#progress-log) at the end of every working session. This file is the plan and the
handoff: an agent or a person should be able to start from here with no other context.

Working name: **Capsid** (placeholder: the final name is friendlier, see section 7) (a capsid is the tiny protein shell that carries a virus's payload: the
engine is the small shell a page's game or interaction rides in). Alternatives if it doesn't stick:
*Strain*, *Mote*, *Spore*, *Rampage* (it should look and feel like Rampage, in the browser). Decide in
E1 before the package name is published.

---

## 1. Why build it

DOM VIRUS proved that real games can run **inside ordinary web pages**: on the page's own text and
buttons, on phones, without bogging the page down. The pieces that make that work (one bounded
frame loop, hard caps, pooled entities, a mutation ledger that restores the page exactly, cached
geometry with no layout reads in the hot path, pause off-screen) are rare. Most animation libraries
target big effects (scroll scenes, 3D, transitions) and treat performance as an afterthought; most
game engines assume they own the whole page or canvas.

The engine packages that discipline so it can be reused for:

- **Games** in the page (the five DOM VIRUS games, multiplayer Battlefield).
- **Micro interactive animations** that make a site feel alive: a diagram you can play with, a
  hero that reacts, a lead form that becomes a tiny game, a guided "agent" that talks to a visitor.
- **Agency work** (coded.design): Astro SEO sites with high-impact, low-footprint interaction that
  still runs on a 2010 Chromebook.

It is **not** a scroll-animation, UI-transition or tween library (use WAAPI, Motion or CSS for
that). It is the smallest possible **micro game / interaction engine**: a clock, a world, entities,
input, collision and rules, with an optional presence/multiplayer harness.

### Where we stand against prior art (research, 2026-10)

| Need | Best existing | Size (gzip) | Why it isn't this |
|---|---|---|---|
| Tiny canvas game kit | Kontra 10 | 2.8 KB min game, 13.8 KB all | Canvas-only, one global canvas, pauses only on `blur`, not embed-safe |
| Juicy 2D games | LittleJS 1.28 | ~150 KB bundle | WebGL, owns the page |
| Friendly composition API | Kaplay 3001 | 69 KB | Monolithic, no tree-shaking |
| Full engines | Phaser 4, Excalibur, melonJS, PixiJS | 114–353 KB | Big, canvas/WebGL, own the page |
| DOM renderer engine | Crafty 0.9 | 42 KB | Unmaintained since 2018 |
| DOM animation | Motion 14 (mini: 3.4 KB), anime.js 4, GSAP 3, WAAPI | 3–28 KB | No loop, entities, collision, input or rules. GSAP's licence restricts "competing" tools |
| Multiplayer | partysocket 4 KB; Colyseus 54 KB; Liveblocks 59 KB; Yjs 29 KB | | Either heavy or not game-shaped |

**The gap we own:** an engine that is (1) *embed-safe by contract* (hard caps, zero steady-state
allocation, no layout reads in the tick, change-only writes, one shared rAF, auto-pause off-screen
and when hidden, CSS containment, one-call teardown, a ledger that restores the host page);
(2) *DOM-native* (game objects are, or ride on, real elements, accessible and styleable);
(3) *composable* (independently importable harnesses of about 1 KB each);
(4) *presence-ready* (a few-KB client sending small validated input commands, where humans and AI
agents are the same kind of participant); (5) *determinism-ready* (fixed step, seeded random,
fixed-capacity state) so lockstep or rollback become possible later.

**Where others already win (don't compete):** hundreds of sprites, shaders or physics (use
Pixi/Phaser); UI tweening and springs (Motion/WAAPI); designer-authored vector animation
(Rive/Lottie). Sprite counts on the DOM are capped by design (64–128 actors).

Sources and measurements are in the research notes appended in
[Appendix B](#appendix-b-research-notes).

---

## 2. The contract (non-negotiable)

Every harness and every game built on the engine must keep these. Each has a test in E1.

1. **One clock per page.** A single shared `requestAnimationFrame` scheduler for every engine
   instance on the page; fixed simulation step (default 60 Hz) with an accumulator, a cap on
   catch-up steps (drop, don't spiral), and render interpolation where useful.
2. **Bounded everything.** Every pool, list, cache and queue has a declared capacity. Reaching a cap
   refuses new work; it never grows. Caps are visible in a `stats()` snapshot.
3. **Zero steady-state allocation.** No closures, arrays or `{x, y}` objects created per tick in the
   hot path. Pools and scratch objects are reused. Verified by a heap test.
4. **No layout reads in the tick.** Geometry is read on resize/scroll/intersection or at a throttled
   cadence (≤ 12.5 Hz dirty, ≤ 2 Hz stable), cached, and shared. Writes are batched after reads.
5. **Change-only writes.** DOM writes happen only when a value changed (keyed caches). Only
   `transform` and `opacity` move in hot paths; promoted layers are capped.
6. **Pause by default.** Off-screen (IntersectionObserver), hidden tab, `pagehide`, reduced motion
   (effects off or calm), editable focus. Zero CPU while paused.
7. **Own nothing you can't give back.** Every page mutation goes through the ledger; destroy
   restores still-owned values exactly (a newer host edit always wins). One `AbortSignal` tears
   down every listener and observer.
8. **Embed-safe.** CSS containment on owned roots, Shadow DOM for owned UI, no global styles, no
   global listeners outside the signal, multiple instances allowed.
9. **Budgets in CI.** Kernel ≤ 4 KB gzip; each harness ≤ ~1.5 KB; a full arcade game ≤ its current
   budget; per-frame JS ≤ 4 ms on a throttled CPU profile; long tasks none.

---

## 3. What we already have (inventory, 2026-10)

The engine is mostly **extraction and standardisation**, not invention. Details:
[Appendix A](#appendix-a-inventory).

| Capability | Best current implementation | Notes |
|---|---|---|
| Frame loop | `dom-battlefield/src/client.ts` (fixed 60 Hz accumulator) | Core `runtime.ts` uses variable dt (≤ 34 ms); Swarm has a third loop |
| Lifecycle / pause | core `runtime.ts` (visibility, blur, focus, pagehide) | Three copies; Battlefield uses AbortController (adopt), core uses listener arrays |
| Ledger / Recall | core `ledger.ts` (`MutationLedger`) | Swarm has its own style/attribute ledgers; merge into one |
| Page board | core `board.ts` (glyph scan, cached geometry, spatial grid, one reused Range) | The "page is the board" harness |
| Grid board | `dom-battlefield/src/model.ts` (tiles, BFS routes, LOS, generator) | The "own world" harness; Byte Runner has a second BFS |
| Entities / pools | core `EntityPool` | Battlefield model splices (pool it); Swarm compacts arrays |
| Collision | core `segmentHit`, `SpatialGrid`; Sherman circle-vs-rect; BF tile probes | `SpatialGrid` allocates on query (fix) |
| Steering | Sherman `turnToward` + probe steering; BF `drive`; Swarm orbit/pursuit; NI homing | Five versions; extract common behaviours |
| Aim / targeting | BF `nearestVisible` + LOS at 5 Hz; NI/SB atan2 | Extract |
| Input | core `touch-controls.ts` (`bindStick`, `bindPress`, `createStickKeys`) + runtime keys; BF analog stick + `press()` (second-finger safe) | Merge into one controller harness with intent maps |
| Sound | core `audio.ts` (oscillator synth, 6 voices, cue cooldowns) | Swarm has its own; adopt core |
| Sprites | Sherman `tankSprites` (cached canvas tiles), NI sprite atlas, BR SVG, BF DOM-per-actor | Two "bake to canvas" caches to merge |
| Effects | core particles (100) / popups (24); BF effects (96) | Merge |
| Camera | BF `View.follow` (dead zone, margins) | Only BF has one |
| UI chrome | core HUD, game controls; BF cards, stickers, 3D buttons | Keep UI out of the kernel; ship as optional kits |
| Locks | core `selection-lock`, `zoom-lock` | Already shared by copy |
| Distribution | `sync-games.mjs` (minified core copy, pinned **0.21.0** in three games) and BF `sync-shared.mjs` | Two sync schemes; arcade games are 19 core versions behind |

**Known facts to correct in docs:** FUTURE.md says the sim "is already fixed-step"; only
Battlefield is. Core `board.consume` uses `Math.random()`, not the seeded random. Byte Runner reads
`getBoundingClientRect` twice per frame (`syncPosition`).

---

## 4. Architecture: kernel + harnesses + game harness

Lego bricks. The kernel is the only required piece; every harness is an independent import that
declares what it needs. A **game harness** is a config that composes harnesses for one game or
interaction.

```
@capsid/kernel      clock · scheduler · lifecycle · signal · caps/stats · pools · ledger · writer
@capsid/board-page  the page as the world: glyph/element scan, cached geometry, spatial grid, recall
@capsid/board-grid  a tile world: tiles, generator hooks, BFS/flow fields, line of sight
@capsid/input       controller harness: keys, pointer, touch stick, press keys, gamepad → intents
@capsid/actor       character harness: position, velocity, heading, hp, team; pooled
@capsid/steer       steering: seek, flee, arrive, follow-path, orbit, wander, avoid (probe), separation
@capsid/collide     collision + reconcile: AABB, circle, swept segment, tile probes, spatial hash
@capsid/aim         aim harness: nearest / nearest-visible / lock / lead targeting, turret turn rate
@capsid/rules       logic harness: waves, objectives, timers, scoring, win/lose, seeded random
@capsid/sound       sound adapter: tiny synth (default), cue map, voice cap, gesture unlock
@capsid/view-dom    render adapters: DOM node per actor, cached canvas sprite tiles, SVG layer, pools
@capsid/camera      follow with dead zone, bounds, margins, pan
@capsid/fx          particles, popups, flashes (WAAPI one-shots outside the tick)
@capsid/presence    multiplayer/presence: rooms, command stream, snapshots, interpolation, agents
@capsid/embed       drop-in install: palette, lazy load, easter-egg triggers, open/close toggle (from Swarm's loader)
@capsid/ui          the Board UI kit (board-ui/, spec BOARD-UI.md): keys, cards, overlays, bursts; not in kernel
```

Names are placeholders. In E1 decide between one package with subpath exports
(`capsid/input`, recommended: one version, tree-shakable) and many packages.

### 4.1 Kernel (≤ 4 KB)

- `createEngine({ root, step = 1/60, maxSteps = 4, signal })`: attaches to the shared scheduler.
- **Systems** run in fixed order each step: `input → rules → steer → move/collide → aim → fx`. A
  game registers systems; harnesses ship systems. Render runs once per frame after the steps, with
  `alpha` for interpolation.
- **Phases:** `read` (cached geometry only), `step`, `write` (change-keyed DOM writes). No reads after
  writes in a frame.
- **Lifecycle:** `start / pause / resume / stop / destroy`; auto-pause rules from the contract;
  `destroy()` = `signal.abort()` + ledger restore + pools cleared.
- **Caps and stats:** `engine.stats()` returns frame ms (avg/max), steps dropped, and per-pool use and
  caps. Debug build asserts budgets.
- **Seeded random** for anything that affects simulation (needed for multiplayer).

### 4.2 State shape

Simulation state is plain, serializable data (Battlefield's `model.ts` is the reference): no DOM, no
closures, fixed-capacity arrays. That enables snapshots (rollback, replays, archives), tests without
a browser, and the presence harness.

### 4.3 Events and the sound adapter

Harnesses talk through one fixed-capacity **event ring** per step (no callbacks in the hot path):
`collide` emits contacts (`{kind: "hit" | "touch" | "block", a, b, impulse}`), `rules` emits game
events (`score`, `wave`, `win`), `actor` emits `spawn` / `destroyed`. The **sound adapter** reads the
ring after the step and maps events to cues through a cue map (`{ hit: "hit", "touch:wall": "bump" }`)
with per-cue cooldowns and the voice cap, so collisions make sound without collide knowing about
audio. The default adapter is the tiny synth (core `audio.ts`); a game can pass its own adapter
(`{ play(cue, intensity) }`, e.g. sampled sounds) or none. Audio still unlocks on the first trusted
gesture and stays silent while paused or hidden.

### 4.4 Embed config (palette and easter egg)

Every game or interaction mounts with one small, serializable config, so a site can drop it in:

```ts
mount(game, {
  root,                                  // where it lives (default: a fixed host on <body>)
  palette: { cmd: "#8573ee", teamA: "#4bce82" },   // hex only, any subset (Board UI roles)
  easterEgg: true,                       // or false (default) or an object, below
});

easterEgg: {
  sequence: "konami" | false | string[], // keys; default "konami" = ↑ ↑ ↓ ↓ ← → ← → B A Enter (Swarm's)
  gesture: { on: "selector", type: "hold-tap" | "double-tap" | "long-press" } | false,
  click: "selector" | false,             // a host button that opens the game
  scope: { sequence: "desktop", gesture: "mobile", click: "all" },  // per trigger
  toggle: true,                          // the floating open / close key once unlocked
}
```

- **Palette:** the Board UI roles (`board-ui/BOARD-UI.md` section 3). Validated as hex; anything
  else is ignored, so an embed can never inject CSS. This is the fix for "the colours clash with
  my site": the host passes its brand colours, everything else is derived.
- **`easterEgg: false`** (default): the game mounts normally (or the host calls `open()` itself).
- **`easterEgg: true`**: dormant install. Nothing heavy loads; only tiny input listeners run. The
  default triggers are the Konami sequence on desktop and a hold-release-tap on any element marked
  `[data-<game>-trigger]` on touch. A trigger **lazy-loads** the game module, then shows the
  game with the **toggle** key (open / minimise / close). Escape closes and restores the page.
- **Triggers:** a key sequence (any list), a gesture on a selector (hold-then-tap, double tap,
  long press), or a click on a selector; each can be scoped to desktop, mobile or both.
- **Safety and privacy (from Swarm, keep):** keys inside inputs, editable content, dialogs and
  `[data-<game>-ignore]` never advance a sequence; the sequence keeps only an integer position and
  a timestamp (typed text is never stored or sent); gesture timers exist only while a gesture is in
  progress; a route change cancels a pending load; `destroy()` removes every listener.
- **Swarm today** hard-codes this in `swarm-protocol/src/swarm-loader.ts` (sequence, footer
  hold-tap, pill). E2 moves it into `@capsid/embed`; Swarm's engine cut uses the harness with
  `easterEgg: true` and keeps its exact behaviour (its tests port over).

### 4.5 Game harness (composition)

```ts
const game = defineGame({
  board: gridBoard({ cols: 40, rows: 18, generate }),
  actors: actors({ cap: 24, roles }),
  input: controller({ intents: { move: "stick|wasd", fire: "hold:space|fire", command: "o" } }),
  systems: [steer.followPath(), collide.tiles(), aim.nearestVisible({ hz: 5 }), rules.capture()],
  view: domView({ sprite: tankSprite, pool: 24 }),
  sound: synth({ cues }),
  presence: presence.optional(),
});
mount(game, { root: element, signal });
```

A micro-interaction uses the same API with fewer bricks (e.g. `board-page + actor + steer + fx`).

---

## 5. Multiplayer / presence harness

Goal: two people (or a person and an AI agent) in the same game or page interaction, with a
client of a few KB and no game-specific server code beyond rules.

- **Model:** authoritative room. Clients send **input commands** (small, typed, validated, rate
  limited); the room runs the same fixed-step simulation and broadcasts compact snapshots or deltas
  at 10–20 Hz; clients render remote entities with snapshot interpolation (~100 ms behind) and
  predict their own actor. Later: lockstep for turn/grid games, rollback for twitch 1v1 (state is
  already fixed-capacity, so snapshots are cheap).
- **Transport adapter:** default reference server on Cloudflare Durable Objects / PartyKit
  (partysocket ≈ 4 KB, WebSocket hibernation keeps idle rooms cheap). WebRTC as an optional
  peer-to-peer transport (FUTURE.md "Bolo promise"), not the default (NAT failures).
- **Agents as participants:** an AI agent joins a room like any player and emits the same command
  stream, validated by the same rules. This is the business case: an interactive element on a client
  site where a human or an agent can respond to a visitor (questions, guided tours, a lead form as a
  game).
- **Battlefield multiplayer** is the launch showcase: 1v1 and co-op platoons, plan step shared,
  ghosts for remote tanks.
- **Privacy and safety:** no personal data in commands; rooms expire; rate limits; server validates
  every command; documented threat model before launch.

---

## 6. Phases

Each phase ends with a tagged release, green CI, updated docs and a progress-log entry.

### E0: Baseline and archives (do first)
- Freeze today's builds as the comparison baseline: tag `engine-baseline` in every repo.
- Make every current game version playable from the hub's **TEST A RELEASE** selector
  (`site/releases.json` + `site-kit/scripts/releases.mjs`). Add Battlefield archive support (it is a
  separate app under `/battlefield/`; give it versioned paths such as `/battlefield/v0.15.8/` and a
  selector on its info page). Optional: `?release=` deep link for side-by-side tests.
- Build the **perf harness**: one Playwright script per game that records frame ms, long tasks, JS
  heap after N seconds, DOM node count, layout count (via `PerformanceObserver` / CDP metrics) under
  a 4x CPU throttle, saved as JSON per version. This is the before/after evidence.
- Fix the doc errors listed in section 3.

**Exit:** baseline numbers for all six apps checked in under `docs/engine/baseline/`.

Progress:
- [x] Perf harness: `npm run perf:baseline` (`scripts/perf-baseline.mjs`) plays every app from the
  built hub under a 4x CPU throttle; writes `docs/engine/baseline/<app>.json` + `summary.md`.
- [x] Baseline numbers recorded (2026-10-28, hub 0.43.0): `docs/engine/baseline/summary.md`.
- [x] Baseline commits recorded: `docs/engine/baseline/versions.json`.
- [ ] Tag those commits `engine-baseline` in every repo (cloud sessions can't push tags; run the
  command in `docs/engine/baseline/README.md` from a machine with push access).
- [ ] Battlefield archive selector (versioned `/battlefield/vX.Y.Z/` paths + a selector on its page).
- [ ] Hub TEST A RELEASE selector covering every current game version.

Baseline findings (first perf targets): **Swarm Protocol** is the heaviest (≈32 fps, 18 long tasks
in 10s, ≈200 ms/s script at 4x throttle); **Byte Runner** drops frames (≈48 fps, 44 layouts/s, from
its per-frame `getBoundingClientRect`); Battlefield runs ≈48 layouts/s (worth a look). Sherman
Bytes and Null Invaders hold 60 fps.

### E1: Kernel
- Create the engine repo (`coded-dot-design/<name>`), move `board-ui/` and the core there, and
  publish it as one package with subpath exports. Then build, in that repo, the
  kernel: scheduler, fixed step, lifecycle with `AbortSignal`, caps/stats, pools, ledger (from
  `ledger.ts`, merged with Swarm's attribute/style ledger), keyed writer, seeded random.
- Tests that prove the contract: one rAF for N instances; zero allocation over 10k steps (heap
  sampling); no forced layout in a step (spy on layout APIs); pause stops all work; destroy restores
  the page and leaves no listeners.
- Name decided, package published (or private) with semver `0.x`.

**Exit:** kernel ≤ 4 KB gzip, contract tests green.

### E2: Harnesses
Extract in this order (each with unit tests, size check and an example):
1. `input` (merge core `touch-controls` + runtime keys + Battlefield `press()` and analog stick;
   intent maps; second-finger safe by default; gamepad).
2. `collide` (fix `SpatialGrid` allocation; AABB, circle, swept segment, tile probes).
3. `actor` + `steer` (from Sherman, Battlefield, Swarm, Null Invaders).
4. `aim`, `rules` (waves from `WaveDirector`, objectives from Battlefield).
5. `board-page` (from `board.ts`), `board-grid` (from Battlefield `model.ts` + Byte Runner BFS).
6. `view-dom` (merge the two canvas sprite caches; DOM node pools from Battlefield `view.ts`),
   `camera`, `fx`, `sound` (adapter reading the event ring, section 4.3).
7. `embed` (section 4.4): palette config, lazy load, easter-egg triggers and toggle, extracted
   from Swarm's loader; remove the hard-coded copy from Swarm in its engine cut.
8. `ui`: the Board UI kit (`board-ui/`) as the optional UI brick; Battlefield ports onto it in E3.

**Exit:** every harness ≤ ~1.5 KB, documented, with a runnable example in `playground/`.

### E3: Port the games (cut version)
- One game at a time, smallest first: Null Invaders → Byte Runner → Sherman Bytes → Swarm Protocol
  → Battlefield. Each port is a **major version** of the game (`1.0.0` "engine" cut), with the
  pre-engine build kept playable from the hub archive selector.
- Separate game logic (rules, content, art) from engine concerns. Delete the duplicated code listed
  in section 3. Replace `shared/` copies with the engine package.
- Run the perf harness against the baseline for each port; regressions block the release.

**Exit:** all games on the engine, no `shared/` copies, perf equal or better than baseline.

### E4: Presence and multiplayer Battlefield
- `presence` harness + reference room server + interpolation + command validation.
- Battlefield 1v1 and co-op; agent participant prototype (an AI player and an AI "host" that talks
  to the visitor through the same command channel).

**Exit:** two browsers on different networks play a Battlefield match; agent joins a room.

### E5: Docs for humans and AI
- `docs/engine/` authoring guide: "build a game or micro-interaction in an afternoon", one page per
  harness (purpose, API, caps, cost, example), recipes, and a strict **AI-readable** spec
  (`docs/engine/AGENTS.md`: contract, file layout, how to add a game, how to add a harness, the
  tests that must pass).
- Under the Hood page: an "Engine" section with live stats from the kernel.

### E6: Weekly performance wins
- A standing weekly pass: run the perf harness, pick the top cost, fix it, record the win in
  `docs/engine/perf-log.md`.

---

## 7. Open decisions

- Name: something friendly, not virus-themed (the engine is the product; DOM VIRUS is one
  showcase). Shortlist: Mote, Glint, Pip, Sprig, Kite; also Rampage. Capsid / Strain / Spore are out.
- One package with subpaths vs many packages.
- Licence for everything (MIT recommended; the hub, games and engine are open).
- ~~Engine location~~ **Decided 2026-10-28: its own repo** in the coded-dot-design org, with a
  friendly name (not virus-themed). dom-virus stays the showcase site and the games' home; the
  Board UI kit and the core move to the engine repo in E1, and the hub consumes the engine package.
- Whether the arcade games' `createArcade` API stays as a compatibility layer on top of the kernel.
- Reference room host (Cloudflare account) and cost limits.

---

## 8. How to work on this

1. Read this file, then [HANDOFF.md](HANDOFF.md) (repo map, invariants, release discipline) and
   [PERFORMANCE.md](PERFORMANCE.md) (current caps).
2. Pick the first unchecked item in the current phase. Keep changes small and releasable.
3. Keep the contract (section 2). If something can't, write it down here first.
4. Before pushing: `npm run check`, the browser suites, and the perf harness once E0 exists.
5. Update the progress log below, then commit with the code.

---

## Progress log

| Date | Phase | What changed | Next |
|---|---|---|---|
| 2026-10-28 | E0 | Board UI design system shipped (`board-ui/`, `/board-ui/`, hub 0.43.0) as the `ui` brick. Plan: event ring + sound adapter (4.3), embed config with palette and easter-egg triggers lifted from Swarm (4.4), `embed` and `ui` harnesses in E2. E0: perf harness + baseline numbers + baseline commits recorded. | Tag baselines (needs push access); Battlefield archive selector; then E1 |
| 2026-10-27 | Plan | Plan written from a code inventory of all six repos and a prior-art survey. Battlefield 0.15.8 shipped after a regression audit (fixes for touch double-fires, Menu following the header link, plan lost on resize, Enter clearing routes). Baseline to freeze: hub 0.40.9 + the games in `games.json` + Battlefield 0.15.8. | E0: tag baselines, archive selector for Battlefield, perf harness |

---

## Appendix A: inventory

**dom-virus core (`src/`, 3,139 lines, `dist/index.js` 19.1 KB gzip).** `runtime.ts` (969 lines) is
a monolith: one variable-dt rAF loop (dt ≤ 34 ms), input, HUD, touch controls, audio, locks,
particle (100) and popup (24) pools, pause rules, single game per page, full-viewport host with a
Shadow DOM and one canvas (DPR ≤ 1.5). `board.ts`: page scan (≤ 160 text containers, ≤ 6,000 walker
visits, ≤ 8,000 glyphs, ≤ 32 targets), throttled geometry with one reused Range (≤ 900 measurements),
`SpatialGrid`, swept hits, glyph rewrite to 0/1 through the ledger, CSS highlights, MutationObserver
that ignores the engine's own writes. `ledger.ts`: `MutationLedger` (text + inline style, original
and latest value, abandoned on host edit, restore). `attachments.ts`: shadow-root children on host
elements. `target-effects.ts`: liquid health fill ≤ 12 Hz, WAAPI beacons paused off-screen.
`entities.ts`: `EntityPool` (swap-remove, capacity refusal). `math.ts`, `waves.ts`, `supplies.ts`,
`touch-controls.ts`, `audio.ts`, `zoom-lock.ts`, `selection-lock.ts`, `arcade-hud.ts`, `react.ts`.

**Games.** Byte Runner 0.10.2, Null Invaders 0.7.2 and Sherman Bytes 0.5.2 run on `createArcade` via a
minified core copy pinned at 0.21.0. Swarm Protocol 1.3.1 has its own engine (`dom-defender.ts`,
1,426 lines) plus raw copies of four core files. Battlefield 0.15.8 is a standalone app with the
cleanest layering: `model.ts` (pure, serializable simulation: tiles ≤ 48×30, BFS routes, LOS,
caps 24 tanks / 200 shots / 96 effects, fixed 60 Hz), `view.ts` (DOM view, change keys, node pools,
camera), `client.ts` (input, UI, loop, lifecycle, AbortController).

Size budgets today: Byte Runner 30 KB, Null Invaders 24 KB, Sherman 28 KB (each per file, including
the runtime), Swarm ~32.7 KB complete (no enforced budget), Battlefield 54 KB combined
(HTML + JS + CSS).

## Appendix B: research notes

Measured 2026-10-27 (esbuild minify + gzip -9). Kontra 10.0.2: 2.8 KB minimal, 13.8 KB all; fixed step
with accumulator; `Pool`, `Quadtree`; pauses only on blur. LittleJS 1.28: fixed 60 Hz, ZzFX synth,
~154 KB bundle. Kaplay 3001: 69 KB, component composition, 50 Hz fixed update. Excalibur 0.32:
~125 KB, ECS, fixed update with interpolation. melonJS 20.10: 114 KB, pooling built into the API.
Crafty 0.9: DOM renderer, 42 KB, last release 2018. Phaser 4.2: 320–353 KB. PixiJS 8.22: 237 KB.
Motion 14.6: `animate` 24.3 KB, `motion/mini` 3.4 KB, `inView` 0.5 KB, read/update/render frame
batching. GSAP 3.15: 28.3 KB core, `lagSmoothing(500, 33)`; licence restricts tools that compete
with Webflow. anime.js 4.5: `animate` 12.7 KB. Multiplayer clients: partysocket 4.0 KB, Supabase
Realtime 17.1 KB, Yjs 28.7 KB, Colyseus SDK 53.8 KB, Liveblocks 58.8 KB.

Techniques: Fix Your Timestep (gafferongames.com), snapshot interpolation and client/server
(gafferongames.com, gabrielgambetta.com), lockstep (Age of Empires "1500 archers"), GGPO rollback,
fastdom read/write batching, FLIP, IntersectionObserver/visibility pausing, CSS containment and
`content-visibility`, compositor-only properties and layer cost, AbortController teardown,
third-party embed budgets (web.dev INP and long tasks).
