# Changelog

## 0.28.2

Site kit 1.32.2:
- Phones: the cartridge row can't be swiped sideways while a cartridge goes in, sits in the console or comes home (the page still scrolls up and down). It swipes again as soon as the cartridge is back in its spot.

## 0.28.1

Site kit 1.32.1:
- One cartridge at a time: while a cartridge is flying in, loading, launching or ejecting, tapping another one no longer opens its page. It wiggles "not now" with a low buzz, and the seated cartridge hops to show what's in the way.
- Changed your mind? While the console waits (PRESS START, or Battlefield's RED/BLUE choice), tap the seated cartridge or press Esc to eject it back to the shelf.

## 0.28.0 — Under the hood, rebuilt as a lab

Site kit 1.32.0:
- Under the hood is now a set of live labs on one tiny engine loop (site-kit/lab.ts), with an engine HUD (FPS, entities, labs awake). Labs off screen sleep; with reduced motion nothing plays on its own.
- 00 Insert coin · 1990: where DOM VIRUS comes from. Bolo across a Bay Area classroom, as a two-Mac duel you can play (packets cross the cable).
- 01 The board: X-ray shows the rectangles a game reads; bugs walk around real elements; the button is a factory; tap a bug to squash it.
- 02 One loop: a 32-slot pool with a hard cap, a frame meter and ALLOCATIONS 0.
- 03 Recall: hits rewrite one Text node; the app's edit wins; Recall restores only the game's letters.
- 04 Spec sheet cards and live package sizes; 05 a release pipeline you can ship.
- Style guide case study: "Where it started". Docs: Bolo origin in HANDOFF; multiplayer plan in FUTURE.

## 0.27.0 — Phase one

Site kit 1.31.0:
- Games key: a gold count badge (05) rides on the cartridge key; on the home page the key toggles — to the shelf (#games, pressed in) and back to the top (hash dropped).
- The style guide footer key stays pressed in on the style guide.
- Battlefield info page: "Swap to Sherman Bytes" carries the Sherman tank icon; the long "/ SHERMAN EXPANSION" eyebrow drops on phones.
- Detail-page credit lines link Chris Cooley (LinkedIn) and coded.design.

## 0.26.5

Site kit 1.30.5:
- Phone swipe row: tapping a cartridge that's partly off-screen glides the row so its spot is centred behind the console while the cartridge flies in (matching the way back).
- Cartridge swaps are a shared rule (site-kit/swap.ts `swapHref`): Battlefield's "Swap to Sherman Bytes" ejects Battlefield and plugs in Sherman, like Sherman → Battlefield. Documented in the style guide's motion rules.
- Footer: normal phones show "Created by Chris Cooley" and "© <year> coded.design · MIT"; only very small screens (≤360px) switch to "By" and drop MIT.

## 0.26.4

Site kit 1.30.4:
- Eject cartridge: the eject icon is a small 3D key (2px base) that lifts with the link on hover and presses on its base.
- Swarm Protocol's skull sticker moved off the side face onto the label corner.
- Footer: the style guide icon shows on phones too; small screens read "By Chris Cooley" and "© <year> coded.design" (MIT drops). "Chris Cooley" links to LinkedIn.

## 0.26.3

Site kit 1.30.3:
- Phones: the hero card sits closer under the intro (gap 80px → 50px), so the whole interactive hero fits in the first screen; the "try me" bubble still clears the text above.

## 0.26.2

Site kit 1.30.2:
- Sherman Bytes' "Open Battlefield" is now "Swap to Battlefield": it goes home with ?play=sherman-bytes&next=battlefield, plays the normal return (screen morphs back, Sherman ejects to its spot), then plugs in DOM Battlefield; the console boots, presses A for you, shows LOADING GAME and the board folds open into the full game. Reduced motion: straight to the game. The archive keeps a direct link.

## 0.26.1

Site kit 1.30.1:
- Fix: pressing start hid the whole console (the loading-text rule also matched the console's new "loading" state class), so the page jumped and the screen-to-page morph broke. The state is now `is-loading`; a regression test checks the console keeps its size while loading.
- A seated cartridge no longer shows a focus outline after a keyboard start.

## 0.26.0

Site kit 1.30.0:
- Console loading screen: after start it says LOADING GAME / LOADING INFO; about one time in three the cartridge is "stubborn" and the screen flips to an old-console fix (BLOWING ON PINS, JIGGLE CARTRIDGE…) before loading.
- Idle console mini-game: eight good and bad guys roll by; A (red) fires from the bottom at a crosshair (HITS counter, or OOPS! on a friendly), B (blue) or a tap on the screen makes the middle one jump, Start makes them all hop. Tiny WebAudio blips.
- Hero "try me" bubble: shows only if someone looks at the hero for a few seconds without touching it; leaves on its own or on the first touch.
- New style guide page (/style-guide/): brand, colour tokens, type, the 3D press rule with live demos, components (real cartridges, console, touch controls), motion, icons, voice, the cartridge line-up, and a short case study on turning the original one-page site into the cartridge console (links to the archive). Linked from a footer icon on desktop.

## 0.25.6

- Battlefield 0.6.8 pinned: Eject is a 3D panel button like Sound and Theme (icon-only on phones).

## 0.25.5

Site kit 1.29.5:
- Game and Battlefield info pages: the back link is now "Eject cartridge" (eject icon); it still returns home and ejects the cartridge.
- Battlefield 0.6.7 pinned: its header Exit is now "Eject", going home with the board-closing eject.

## 0.25.4

Site kit 1.29.4:
- Phones: a quick second tap on anything that isn't a control no longer zooms (iOS ignores user-scalable=no), e.g. while tapping bad guys in the hero game.
- Footer: the coded.design icon button is gone (it's the text link now); the GitHub button hovers/presses exactly. Phones: skull mark + the credit and copyright stacked beside it (truncating, "MIT"), then GitHub; one tight row.
- Header nav buttons press correctly (hover no longer overrides the press).

## 0.25.3

Site kit 1.29.3:
- Footer bottom line: "Created by Chris Cooley" on the left; "© <year> coded.design · Open source (MIT)" on the right (stacked on phones). The coded.design link is accent-coloured with a hover, no underline.

## 0.25.2

Site kit 1.29.2:
- Game detail pages are numbered in the home shelf's order (Sherman 01, Battlefield 02, Swarm 03, Byte Runner 04, Null Invaders 05).

## 0.25.1

Site kit 1.29.1:
- The empty shelf spot left by a plugged-in cartridge shows a muted "cover": the game's icon, name and number (compact row on phones), above where the seated cartridge reaches.
- Every cartridge carries a tiny DOM Virus skull sticker, stuck on like an afterthought: a different spot and tilt per cartridge, some peeling at a corner.

## 0.25.0

Site kit 1.29.0:
- Header nav is square 3D icon buttons (Games, Under the hood, theme) at every width, with tooltips; the current page stays pressed in.
- Footer at every width: brand, coded.design + GitHub icon buttons, and one small attribution line "© <year> Chris Cooley · coded.design · MIT" (year stamped at build). Leftover bottom padding removed.
- Phones: tighter vertical spacing around the console (36px above, 42px below; sizes unchanged), and a smoother pick-up: the cartridge lifts a touch, glides over the console and slides straight down (no hop, no wait for the scroll); the pull-out is its exact reverse. Desktop motion unchanged.

## 0.24.3

Site kit 1.28.3:
- Phone header: one row — brand plus square 3D icon buttons for Games (cartridge), Under the hood (chip) and the theme. The current page's button stays pressed in. Labels stay in the accessible name. Desktop unchanged.

## 0.24.2

Site kit 1.28.2:
- Phone footer: one short row — the brand plus two square 3D icon links (coded.design, GitHub). Desktop keeps the labelled groups.

## 0.24.1

Site kit 1.28.1:
- Phone swipe row: cartridges are sized from the console (half its width, desktop proportions), so a cartridge keeps its size when it plugs in, and they're taller (no squat cards). The console sits a little closer to the row.

## 0.24.0

Site kit 1.28.0 (DOM Virus hero only):
- The tank drives up into the card nose-first (tracks facing up, treads rolling), then pivots to face across the card. Tread marks now stay inside the treads (intro and game).
- The mock BUTTON_01 is a real 3D button again (hover lift, press onto its base) and clicking it nukes every bad guy and resets the round; the first click also starts the mini-game.

## 0.23.0

Site kit 1.27.0:
- Phones / small tablets (≤860px): the cartridge shelf is a horizontal swipe row that snaps a cartridge to the middle with its neighbours peeking in, so the shelf and console read as one unit. Desktop is unchanged.
- In the swipe row a cartridge lifts out of the row (same spot) to fly to the console and slides back into its bay after ejecting; on return the row centres that cartridge's spot first.
- DOM Battlefield moves to slot 2.

## 0.22.0

Engine:
- Shared touch controls (src/touch-controls.ts): Battlefield-style analog joystick (8-way, or 4-way for grid games), round Fire button and arcade secondary buttons, with exact 3D press states. Replaces the arrow D-pad in every engine game; games opt into 4-way / a primary action via `GameDefinition.touch`.
- Pins: Null Invaders 0.7.2, Byte Runner 0.10.2 (4-way stick, Jump), Sherman Bytes 0.5.2 — all ship the new controls (their engine snapshots were synced at 0.21.0 + these engine commits).

## 0.21.0

Site kit 1.26.0:
- Header: brand left; Games, Under the hood and one light/dark toggle right. No menu on phones: the two links sit on a second row. GitHub moved to the footer.
- Footer: brand left; labelled Made by / Open source groups; plain links, no arrows; the one-page archive is kept but no longer linked.
- 3D buttons measured in the browser and made exact: hover lifts only the top surface (base never moves), press and selected (aria-pressed) sit exactly on the base, no overshoot easing. Flat icon buttons (copy, pause, theme was flat) no longer jump; the theme toggle is now a proper 3D button; nerd-notes cards press onto their shadow.
- Console: a solid 14px 45° pink extrusion (twice the cartridge's side) with ridge texture and an ink rim; sits close under the shelf again.
- A soft dashed outline (cartridge shape) marks a cartridge's shelf spot while it's plugged in.
- Battlefield 0.6.6 pinned (exact 3D button press states in the app).

## 0.20.0

Site kit 1.25.0:
- One launch path: the console never moves. Info/game pages flash the screen and morph it into the page; the full game opens its board. Coming back is the exact reverse from the same seated position (no drawer slide, no rise, no shoved-down cartridge).
- Removed leftovers: the drawer, the drawer slide and the lowered return state.
- Console top follows the 3D rules: no bump; the top face isn't visible, so cartridges slide in behind the flat top edge, just past their pins. More room above the console so a seated cartridge sits clear of the shelf.

## 0.19.4

Site kit 1.24.4:
- Pins wrap under the cartridge at the same 45° as the corner chamfer and mitre: the recess and each finger's underside are skewed through the bottom face.

## 0.19.3

Site kit 1.24.3:
- Pins: the dark connector recess cuts through the bottom face to the edge and the gold fingers wrap around the bottom.
- Every cartridge goes into the console the same depth: just past its pins, so the label's bottom meets the slit (measured without any hover lift).

## 0.19.2

Site kit 1.24.2:
- Screen chips follow the buttons' left-to-right order (BLUE INFO, RED LAUNCH).

## 0.19.1

Site kit 1.24.1:
- Cartridge redrawn from the original: thick darker side face down the right and a bottom face, mitred at the corner; notch and bottom-left chamfer outlined; no drop shadow or animated hover shadow (just a lift).
- Edge connector pins: gold fingers in a dark recess, some worn short, tarnished or missing.
- Special edition is just the sticker (no pink trim). Other cartridges no longer dim while one is plugged in.
- Console slot is a clean block with a wide black slit the cartridge drops into; pink shadows have slightly rounder corners; Select/Start line up with B/A.

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
