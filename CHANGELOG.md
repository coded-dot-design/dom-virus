# Changelog

## 0.19.0

Site kit 1.24.0:
- Cartridges declare their actions (pad, label, link, launch style); the console maps them to its buttons. One action: PRESS START. Several: the screen shows a coloured chip per button and waits for a choice.
- DOM Battlefield drops the sleeve: it boots both LEDs and shows RED ▶ LAUNCH (board folds open into the full game) and BLUE ▶ INFO (screen morphs into the details page).
- Coming back is tracked in the URL (?play=<id> / ?board=<id>#console), read before first paint: the page arrives with the cartridge docked and the console in its drawer, the game screen morphs back, the console rises, then the cartridge pulls out and flies home. The full game returns through its board folding shut. Game pages' All games links use the same URL; the state is cleared once the cartridge is home.

## 0.18.0

Site kit 1.23.0:
- Cartridges: the notched shell is its own layer, so the hard shadow covers the right side and the notch corner. Contact pins look worn: a few missing, worn short, or tarnished.
- Console slot is a groove: the cartridge slides into the hole behind a front lip instead of behind a block. Insert clicks and power-on chirps (WebAudio, gesture-started).
- Start animation moves slot, lip, body and the plugged cartridge together (no more split top).
- Console controls are plain spans with diagonal hard shadows, so site button styles no longer leak in; tighter spacing; LED moved up and right.
- DOM Battlefield is a special edition: pink trim, a sleeve over the bottom half that opens the details page, and a cartridge that boots two LEDs and folds the game board open into the full game.

## 0.17.1

Site kit 1.22.0:
- Every console control is clickable with a springy press: the D-pad tilts toward the pressed arm, Select/Start click down, A/B make the attract characters hop (A still starts a plugged cartridge).
- Cartridges use the site's hard-shadow language: a layered offset shadow that grows as they lift and collapses when pressed.
- Eject: returning from a game page pops the cartridge out of the console and flies it back to its shelf spot.

## 0.17.0

Site kit 1.21.0:
- The start screen is a tiny game: a plugged cartridge powers the console (LED, the game's name, PRESS START, pulsing A). A, a tap on the screen, Enter or a short wait starts it; the screen flashes and the console slides into its drawer while the page morphs in.
- Attract mode: characters from the games march across the idle console screen (paused offscreen).
- DOM Battlefield's display is a live battlefield: cover blocks, HQs, and two tanks a side patrolling, sweeping turrets, trading shots (some miss) with blasts.
- Reusable components: `Cartridge`, `PixelTank` (shared by the hero and Battlefield), shelf/console and Battlefield styles scoped to their components, and one shared `.card` surface.

## 0.16.0

Site kit 1.20.0 — one page per game, on DOM Virus only:
- Game websites in the four game repos are retired (their Pages now redirect here). Each game page's nerd-notes card links to that game's GitHub README instead of a separate nerd page.
- DOM Battlefield gets a fifth cartridge and its own page explaining how it is layered on Sherman Bytes (model, DOM grid view, borrowed Sherman sprites, mobile shell), with Launch Battlefield. Sherman Bytes' page still launches it too.
- The original one-page layout is archived at `/archive/` (linked from the footer).
- `sync:sites` only refreshes character art now.

## 0.15.0

Site kit 1.19.0 — the hub becomes a small multi-page site:
- Home is the DOM Virus hero plus a cartridge shelf. Cartridges pop up from the bottom as the shelf scrolls in; picking one lifts it out, plugs it into a retro console, boots the screen and opens the game page.
- Each game has its own page (`/games/<id>/`, no outer border) with a "why it's cool" teaser that links to its own nerd-notes page (`/games/<id>/nerd/`: every engineering note, sizes, source files).
- The engine-wide engineering and embedding sections move to `/under-the-hood/`.
- Page changes use cross-document View Transitions (no client router, so the launcher and hero game are untouched); the console screen morphs into the game display. Browsers without support simply navigate. Reduced motion disables the transitions and cartridge flight.
- Single-game sites keep their one-page layout.

## 0.14.0

Site kit 1.18.0 — demo pages behave like a game on touch devices:
- No pinch or double-tap zoom (viewport, `touch-action: pan-x pan-y`, Safari gesture events), no text selection, no long-press copy/lookup callouts. Form fields stay editable; code samples keep their Copy buttons. Desktop is unchanged.
- Embedded games already apply the same reversible zoom and selection locks only while a session runs (shared engine and Swarm), restoring the host page afterwards.

## 0.13.0

Site kit 1.17.0 — the hero card is playable:
- Untouched, the choreographed CSS loop runs as before. The first tap or drag on the card loads a tiny contained game (`site-kit/hero-game.ts`, dynamic import).
- Bad guys (DOM Virus skulls, aliens, flies, bugs) keep spawning and self-destruct after a few seconds; the interceptor and tank turret auto-aim on their own centres and auto-fire with spread, so some shots miss and fly off screen.
- Tap a bad guy to squash it; drag the tank (treads roll); tap the tank for a 360° turret spray; tap the plane to spin it and burst-fire (faster taps, more bullets).
- Every two minutes: a 10-second alarm (card blinks), a nuke clears everything, the round resets. Score and timer replace the status line.
- One rAF loop, capped pools (26 foes, 60 shots, 14 explosions); pauses with the scene toggle/offscreen; reduced motion ends the game and restores the poster.

## 0.12.0

Site kit 1.16.0 — hero mash-up, choreographed (CSS only, paused until the scene toggle runs it):
- Intro: the DOM Virus skull spawns into the browser card first, then more skulls, aliens, flies and a bug pop in. The interceptor flies in from off screen; the tank drives up from the bottom.
- Loop (8s): the interceptor turns on its centre and the tank's turret rotates to face each target before firing; seven kills alternate between them, each with a big CSS explosion and a hit shake, and targets respawn. Near-miss spray shots streak off screen.
- New abstract tank in the game-card style (treads, hull, separate rotating turret).

## 0.11.9

- Serve DOM Battlefield 0.6.5. Site kit 1.15.6: borderless Home Screen icon so iOS corners never clip it.

## 0.11.8

- Serve DOM Battlefield 0.6.4 (final logo). Site kit 1.15.5: solid Battlefield mark on its button.

## 0.11.7

- Serve DOM Battlefield 0.6.3. Site kit 1.15.4: Open Battlefield button mark shows the skull's pixel-sized hole.

## 0.11.6

- Serve DOM Battlefield 0.6.2. Site kit 1.15.3: Open Battlefield button mark back to the solid skull on the grid.

## 0.11.5

- Serve DOM Battlefield 0.6.1. Site kit 1.15.2: the Open Battlefield button mark matches Battlefield's notched skull.

## 0.11.4

- Serve DOM Battlefield 0.6.0 (analog thumbstick, follow camera, haptics, new skull-on-grid logo).
- Site kit 1.15.1: app icon in the Battlefield style (DOM Virus skull on a map grid) for the browser tab and Home Screen; the Open Battlefield button uses the Battlefield mark.

## 0.11.3

Site kit 1.15.0 (website only; game runtimes unchanged):
- "Know your controls" renders outlined neon keycaps (WASD and arrow clusters, mouse, Space/Esc) with what each does.
- Hero mash-up: tank and interceptor stay inside the browser card and blast flies and aliens that spill off its edges, with exaggerated CSS explosions and a hit shake.
- File-size and fact cards use the hard-shadow card style instead of left borders.

## 0.11.2

- Serve DOM Battlefield 0.2.0 (widescreen touch cockpit, Tron/cyberpunk skin, slower armor).
- Pages builds now follow the newest Battlefield release tag in the pinned major line, like the games, so Battlefield releases reach the hub without a manual pin bump.

## 0.11.0

Shared sound, persistent scoreboard controls, SVG touch icons, and mobile game abilities. Remove redundant HUD markup and avoid repeated pause-control writes.

## 0.10.2

- Replace the DV letters in the header, footer and favicon with the supplied pixel skull as a small transparent SVG.

- Replace the game sections’ thick top stripes with thin outlines and matching offset arcade shadows.

- Remove the dark background from native 0/1 highlights while retaining their game color.

- Present the new Byte Runner maze release and matching pixel character guide.
- Give real spawn buttons bright fills and subtle same-color hover/press states.
- Enlarge the light/dark toggle with clear 22px SVG icons and 40px controls.

## 0.10.1

- Soften the site and game graphics to a flat color palette while retaining native attachments, raised controls and press feedback. Remove the outer page/header side borders. Swarm colors remain unchanged.

## 0.10.0

- Native target attachments, focused-control keyboard capture, neon binary highlights, per-game palette bars, white browser panels in light mode, and raised arcade styling across both themes.

## 0.9.0

- Independent touch D-pad and hold-to-fire controls, compact mobile scoreboard with expanded results, colored native bit highlights, and abstract site previews. Shared engine 0.9.0.

## 0.8.0 — 2026-10-24

- Attach target beacons to their real elements with native transform/opacity animations; remove viewport-painted beacon copies.
- Keep mobile/coarse-pointer fills stable, pause owned animations with the game, and cancel them on teardown.
- Filter game-owned style writes from board rescans while detecting interleaved application style changes. Reuse one Range for collision measurements.
- Add browser regressions for native nested scrolling, transforms, mobile, observer ownership and repeated cleanup. Document the DOM ownership boundary.


## 0.7.0 — 2026-10-24

- Make real DOM text mutation the only consumption path. Remove canvas replacement glyphs and the visual-only mode.
- Keep node identity, track original/latest owned writes, and preserve newer host changes on Recall.
- Exclude spent text from collision measurements; skip reindexing on game-owned text mutations. CSS Highlights only provide optional opacity on already-mutated text.
- Release Null Invaders 0.4.0, Byte Runner 0.3.0 and Sherman Bytes 0.3.0. Add browser checks for real text mutation, Unicode offsets, missing Highlights support and Recall in all three games.
- Site kit 1.4.0 documents the actual DOM pipeline. Swarm runtime remains unchanged.

## 0.6.0 — 2026-10-24

- Add optional game actions with accessible HUD buttons and keyboard shortcuts, plus a shared bounded wave director.
- Upgrade Sherman Bytes to 0.2.0 and archive its original 0.1.0 release for comparison. Other game runtimes remain unchanged.
- Site kit 1.3.0: game-derived character illustrations, neutral white/blue light surfaces, brighter dark surfaces, separated game sections and a dedicated engineering section.

## 0.5.0 — 2026-10-24

- Add Sherman Bytes to the independent game catalog and Astro hub.
- Add opt-in visual binary opacity; default opacity remains 1.
- Extend selective engine/site synchronization to the fourth game.

- Preserve game-specific option types in React adapters.
- Return keyboard focus to the board after launcher and HUD actions.

## 0.4.1 — 2026-10-23

- Add a historical release selector with tag + commit pins, separate immutable modules, and per-file hashes.
- Refresh the hosted hub hourly from stable release tags; each game page still deploys on every main push.
## 0.4.0 — 2026-10-23

- Add the Astro product/test page, system/light/dark themes, real game descriptions, measured package sizes, architecture diagrams, and creator attribution.
- Add a versioned shared site kit and CI-gated GitHub Pages builds. Commit the Node 24 toolchain and lockfile.
- Remove decorative game HUD shadows. Keep gameplay, colors, sprites, liquid fills and score effects unchanged.
