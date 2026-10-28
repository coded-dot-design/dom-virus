# DOM Kaiju: game design (the engine's big test case)

**Status:** planned, third in line: after **Battlefield Blitz** and **DOM Crossfire** (the two quick
arena games in `GAMES.md`), and once the engine harnesses exist (E2). Coming soon on the hub.
**Working name:** DOM Kaiju. **Hero:** GLITCH, a giant pixel gorilla.
**Repo (to create):** `coded-dot-design/dom-kaiju`. **Hub id:** `kaiju`. **Hub page:** `/games/kaiju/`.
**Builds:** an **embed** version (drops onto any page) and a **board** version (full game, its own
page and cartridge, like DOM Battlefield).

> Inspired by the arcade building-smasher genre and the classic giant-ape-on-a-skyscraper film.
> Everything here is original: our own name, character, art and rules. Do not use "Rampage",
> "Kong", "King Kong" or "Donkey Kong" anywhere in the product (they are other companies' marks).
> The name can still change; if it does, change it here first, then `GAMES.md` and the hub page.

This file is the seed for the engine's first big test run (Blitz and Crossfire warm it up). When work starts, read it top to bottom,
then `ENGINE.md` (the engine contract) and `dom-battlefield/board-ui/BOARD-UI.md` (the board UI).

---

## 1. The pitch

The page is a city. **GLITCH** falls out of the sky, crashes through the header, rides the page all
the way down to the footer, and has to **climb back to the top**: up the sides of headings,
paragraphs, cards and buttons, punching holes in empty space to make handholds, smashing everything
he grabs. Helicopters swarm in shooting. Some text is **live with electricity**; touch it and you
are zapped and fall all the way back down. Reach the top, beat your chest on the logo, and the page
is yours (until Recall gives it back).

It must feel **more dramatic than anything we have shipped**: the DOM VIRUS home hero (interceptor
and tank blowing up bad guys) and the DOM Battlefield landing hero (tanks shelling and flattening
the headline, airstrikes) are the floor, not the ceiling. Every smash should land with weight.

---

## 2. The run (one page = one level)

1. **Drop-in (≈2.5 s, skippable).** The page loads normally. A shadow grows over the header, then
   GLITCH smashes down through it: impact frame, white flash, the header cracks and sags, letters
   spray out. He keeps falling; the page **auto-scrolls with him** to the very bottom (camera
   leads by a third of the viewport, eases out), knocking a few elements on the way. He lands on the
   footer: shock ring, dust, the footer bends, a chest-beat roar. HUD slams in.
2. **Climb.** Get from the footer to the top of the page. Camera follows GLITCH up (never faster
   than he climbs; a little look-ahead upward).
3. **Fall.** Zapped by live text, shot down at zero health, or missing a jump drops him. A zap
   always sends him to the **bottom** (spec from the brief). Optional tuning: from deep in a long
   page, drop to the last **checkpoint** (a card he fully destroyed) instead; decide in playtests.
4. **Top.** Grab the top edge of the page (header / logo / first heading). Chest-beat, the camera
   pulls back, score card slams in: height, WRECKED %, choppers swatted, people saved, time, falls.
5. **Recall.** The page heals: every crack, hole, burn and missing letter is restored (engine
   ledger). Play again or leave.

Difficulty scales with **page height**: a short page is a sprint, a long article is a mountain.
Chopper waves, live-wire density and fire spread all scale with progress (height climbed / total).

---

## 3. Moving: the page is the terrain

The engine's `board-page` harness turns the page into terrain (cached rects, no layout reads in the
loop):

| Surface | Source | What GLITCH can do |
|---|---|---|
| **Climbable block** | headings, paragraphs, list items, cards, images, buttons, inputs, nav | Grab either **side** and climb it; pull up onto its **top edge**; hang under its **bottom edge**; punch it |
| **Line of text** | each text line's rect (from ranges) | Climb text lines like ledges; letters crack and fall as he grips |
| **White space** | gaps between blocks | Cannot be gripped until he **punches a handhold** into it (a jagged hole decal that is climbable for the rest of the run) |
| **Page edges** | viewport left/right | Walls he can climb (slower) |
| **Live wires** | marked elements (see 5.3) | Touching = zap |

Moves (all on one fixed-step clock):

- **Climb** up / down / sideways along any gripped surface. Speed by surface: text fastest, cards
  normal, page edge and punched holes slow.
- **Jump** from a grip in any direction (hold to charge a longer leap). Jumps arc; he can grab
  anything he touches mid-air. Wall-kick between two close elements.
- **Pull up** onto a top edge and **run** along it (cards and headings are rooftops).
- **Drop** (let go) to fall to a lower grip.
- **Punch hole** into white space: 3 quick hits = one handhold; makes a crater with cracks
  radiating out (decal on a shared canvas layer, recorded for Recall).
- **Smash** (punch the element he's on or next to): see section 4.
- **Grab** a chopper or a person within reach (section 5).
- **Roar** (rage full): screen-wide shock, choppers spin out, lights flicker.

Auto-scroll: the page scrolls to keep GLITCH in the lower-middle third while climbing, upper third
while falling. User scrolling is locked during a run (restored on pause/Recall).

---

## 4. Smashing (the drama bar)

Every hit has: **hit-stop** (40–80 ms freeze), **impact frame** (1 frame inverted flash on the
element, like the Board UI launch burst), **screen shake** scaled by power, **debris** (square bits
plus real glyph shards from the text), and a **sound** from the sound adapter.

| Target | Light punch | Heavy smash (charged) | 3rd smash on the same element |
|---|---|---|---|
| **Text line** | letters crack (outline jitter), 2–4 letters pop off and tumble | a word **shatters**: glyph shards spin out, the rest of the line buckles | the line **catches fire** (5.2) |
| **Heading** | dents, letters knock and swing (Battlefield arena knock) | letters fly off, the heading tilts and hangs by one end | **collapses**: falls, bounces, breaks on what's below |
| **Card** | cracks spread from the fist | a corner breaks off and drops; contents rattle | card **crumbles** into chunks (6 clip-path chunks, the launch-burst recipe), people fall out |
| **Button** | presses in, springs back | pops off its base and is flung | becomes a thrown weapon (hits a chopper = instant kill) |
| **Image** | glass crack overlay | shatters into tiles | tiles rain down |
| **White space** | dust puff | crater (handhold) | bigger crater, cracks connect to neighbours |

"Wrecked %" = weighted share of the page's blocks damaged. Everything is a **visual layer plus
recorded mutations** (letters swapped for spaces / classes / transforms through the engine writer
and ledger); **Recall restores the exact page**.

Reference animations to reuse and push further:
- DOM VIRUS home hero (`site-kit/components/HeroScene.astro`, `site-kit/hero-game.ts`): shooters
  turning on their centre, near-miss sprays, booms with flash + core + ring + rotating square + 10
  square bits, card shake on hit.
- DOM Battlefield landing hero (`dom-battlefield/site/src/scripts/arena.ts`): letters knocked with
  rotation and colour flash, letters **flattened** (scaleY squash) when driven over, scorch marks,
  smoke, "KABOOM / WRECKED" pop text, multi-blast airstrikes, hero shake.
- Board UI launch burst (`board-ui.ts launch()`): press + invert, 6 spinning clip-path chunks, flash,
  shock ring, 12 falling bits.

---

## 5. The city fights back

### 5.1 Choppers (main enemy)
- Small pixel helicopters (rotor blur, searchlight cone, the DOM VIRUS cyan) arrive in **swarms**
  from the screen edges, hover at a standoff distance and **strafe** (tracer bursts), some fire
  slow **rockets** that crater text.
- Swarm logic from Swarm Protocol (flocking, separation, standoff ring) via the engine `steer`
  harness. Waves scale with height; a **gunship** mini-boss every ~3 screens.
- GLITCH can **swat** (punch: chopper spins out smoking and crashes into the page, exploding the
  element it hits), or **grab** one and **throw** it into other choppers (chain explosions) or into
  a card (big smash). Grabbed chopper can be **crushed** for health.

### 5.2 Fire
- Third smash on text, rockets and crashed choppers start **fire**: pixel flames crawl along the text
  line letter by letter (letters blacken, curl, drop as ash), spread to touching elements slowly.
- Fire hurts GLITCH while gripping a burning element (pushes routes). Burnt-out text leaves a
  charred ledge (still climbable). Fire is capped (pooled particles, max burning lines).

### 5.3 Live wires (electricity)
- Some elements are **electrified**: crackling cyan outline, sparks running along edges, a hum when
  near. Density rises with height. Some pulse on/off (timing puzzle); some are always live.
- Touch = **ZAP**: white-out flash, skeleton x-ray frame of GLITCH (2 frames), he lets go and
  **falls to the bottom** (or checkpoint, see 2.3). Smashing the "fuse" (a marked small element
  like a badge or icon) kills the wire for the rest of the run.
- Page authors can mark live wires with `data-kaiju-live`; otherwise the game picks elements.

### 5.4 People
- Tiny pixel people (2–3 px wide, many colours) live in cards and text blocks. They **wave and
  run**, and **fall** screaming (little "!") when their element is smashed, flailing on the way
  down, popping a parachute sometimes.
- GLITCH can **catch** falling people (bonus "SAVED"), or **grab** one from a ledge and set them on
  a safe roof (bonus). Keep it cartoon and kind: nobody is eaten or hurt on screen; a person who
  hits the bottom bounces, dusts off and walks away.
- Bystander count and saves are on the score card.

### 5.5 Ground units (crossover, later)
- From DOM Battlefield: Sherman tanks roll in on the footer and shell upward (Battlefield sprites,
  same arena code). Optional, after the core loop is fun.

---

## 6. Health, rage and score

- **Health**: 10 pips. Bullets −1, rockets −2, fire −1/s, crash landing −1. At 0 he falls (to the
  bottom) and stands back up with 5 pips.
- **Rage**: fills with every smash and swat; full = **ROAR** (section 3) and 8 s of RAGE (double
  smash power, red glow, bigger debris).
- **Score**: height (biggest weight), WRECKED %, choppers swatted (thrown = ×2), people saved, time,
  falls (penalty). Combo multiplier for chained smashes within 1.2 s.

---

## 7. Controls (Board UI)

| Action | Desktop | Phone (landscape, Board UI cockpit) |
|---|---|---|
| Climb / move | WASD / arrows | analog stick (left rail) |
| Jump (hold to charge) | Space | JUMP key (right rail) |
| Punch / smash (hold = heavy) | J or click | SMASH key, the big fire-style key |
| Grab / throw | K | GRAB key |
| Roar (rage full) | R | ROAR key (calls when ready) |
| Pause | Esc / P | menu key → pause overlay (KEEP SMASHING / RECALL) |

Every key, overlay and toast follows Board UI (`BOARD-UI.md`): 3D keys, one colour per job,
locked keys rest down, overlays slam and press in, comms toast for explanations, launch burst on
START.

---

## 8. Characters and colours

Palette (passed to the engine as a Board UI palette; neon on ink, like Battlefield):

| Role | Colour | Hex |
|---|---|---|
| GLITCH fur | deep violet | `#3b2a6b` |
| GLITCH chest, fists glow | hot pink | `#ff2e88` |
| GLITCH eyes | warning yellow | `#ffe14d` |
| Choppers | DOM VIRUS cyan | `#06c4ff` |
| Tracers, rockets | amber | `#ffc21a` |
| Fire | orange → yellow | `#ff8a1f` → `#ffe14d` |
| Electricity | white-cyan | `#e8fbff` / `#19f0ff` |
| People | mixed pastels | `#ffd1dc` `#b8f2e6` `#ffe5a8` `#c8b6ff` |
| Rubble, ash | muted lilac | `#aea4d6` |
| Board UI keys | Board UI roles | `cmd #9a63ff`, `fire #ff2b4e` (SMASH), `go #39ffb0`, `sys #19f0ff` |

Characters:
- **GLITCH**: a giant pixel gorilla (sprite ~48×56 at 1x, scaled to page: about one heading tall).
  Frames: idle breathe, climb (4), hang, pull-up, run (6), jump crouch / air / land, punch L/R,
  heavy wind-up, smash, grab, throw, roar, hurt, zapped (x-ray 2 frames), fall (flail), chest-beat.
  A tiny DOM VIRUS skull sticker on his shoulder.
- **Choppers**: scout (fast, tracer), gunship (slow, rockets, 3 hits), searchlight cone.
- **People**: 4 body types × 4 palettes, 3-frame run, wave, fall flail, parachute.
- **Fuse box**: small blinking badge that powers live wires.

---

## 9. Two builds, one game

### Embed (`dom-kaiju/embed`)
- Drops onto **any page** with one script tag or `import { mount } from "dom-kaiju"`, using the
  engine `embed` harness (`ENGINE.md` 4.4): `palette`, `easterEgg` (key sequence, gesture, button
  selector, desktop/mobile scope, toggle UI), lazy load, `data-kaiju-ignore` / live-wire markers.
- Shorter run: GLITCH drops in, smashes what's on screen, climbs the visible part of the page.
- Strict budget: **≤ 30 KB gzip** game code on top of the engine; never blocks the host page; one
  rAF; Recall restores everything; works inside the hub cartridge console like the other games.

### Board (`dom-kaiju` full game)
- Its own page (like `/battlefield/`), a **SPECIAL EDITION** cartridge on the hub shelf, a long
  built-for-it "city page" (a fake newspaper / skyscraper landing page) with sections tuned as a
  level, plus "play on this page" for any hub page.
- Board UI cockpit on phones, boot screen, door hand-off from the hub, its own landing site (like
  `dom-battlefield/site/`).

---

## 10. What it must prove about the engine (test plan)

DOM Kaiju is the first big game written **on** the engine (Blitz and Crossfire are the small
warm-ups). It must exercise:

| Engine part | What Kaiju uses it for | Pass bar |
|---|---|---|
| kernel scheduler / fixed step | physics, climbing, choppers | one rAF for everything; zero allocation per step (pools) |
| `board-page` | page → climb surfaces, text lines, gaps | rect cache, no layout reads in the step; rescan on resize only |
| `collide` | grips, punches, bullets, people | spatial grid, swept segments for falls and tracers |
| `camera` | auto-scroll drop-in, follow climb | smooth, no scroll fighting, restore user scroll on exit |
| `fx` | booms, debris, fire, sparks, cracks, decals | bounded pools; drama at 60 fps |
| ledger / writer | text damage, holes, burns | **Recall restores the exact DOM** (test: hash before == after) |
| `input` | stick, keys, gamepad, Board UI keys | second-finger safe; same intents on all devices |
| `sound` adapter | smashes, roar, rotors, zaps | event ring → cues; mute persists |
| `embed` | palette, easter egg, lazy load | config validated (hex only); trigger works desktop + phone |
| `ui` (Board UI) | HUD, overlays, cockpit | follows `BOARD-UI.md` exactly |
| perf harness | baseline vs Kaiju | **≥ 55 fps under 4x CPU throttle** on the hub home page with 20 choppers + fire |

Size targets: engine kernel ≤ 4 KB, harnesses ≤ ~1.5 KB each, Kaiju embed ≤ 30 KB, board build
(including art) ≤ 80 KB gzip.

---

## 11. Milestones (each a tagged release)

| # | Milestone | Done when |
|---|---|---|
| K0 | Repo + skeleton on the engine | `dom-kaiju` repo, CI, size budget, hub page says coming soon (done: this doc + hub page) |
| K1 | Climb prototype | GLITCH climbs, jumps and grips real page blocks; camera follows; no art polish |
| K2 | Smash | punches, holes, text damage, Recall restores; drama bar (hit-stop, shake, debris) |
| K3 | City fights back | choppers (swat, grab, throw), live wires + zap fall, fire, people |
| K4 | Run structure | drop-in intro, auto-scroll, top + score card, health / rage / combo, sound |
| K5 | Board UI + phone | cockpit, overlays, boot, cartridge, door hand-off; embed build with config |
| K6 | Ship | hub cartridge goes from COMING SOON to playable; landing site; perf report vs baseline |

---

## 12. Open questions

- Final name check (DOM Kaiju / GLITCH): availability of the repo, npm name and domain.
- Zap to bottom vs checkpoint (playtest both; brief says bottom).
- How far down an embed run goes on very long pages (cap the auto-scroll distance?).
- Grab-and-throw people at all, or only catch/save (keep it kind).
- Whether Battlefield tanks appear (crossover) in v1 or later.
