# Changelog

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
