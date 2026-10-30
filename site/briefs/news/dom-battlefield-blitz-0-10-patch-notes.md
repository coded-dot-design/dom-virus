---
type: news
title: Battlefield Blitz 0.10 patch notes | Versions 0.7.0 to 0.10.0, from the changelog.
slug: dom-battlefield-blitz-0-10-patch-notes
tags: [release, patch-notes, dom-battlefield-blitz]
date: 2026-10-30
status: published
image: /shots/dom-battlefield-blitz.jpg
---
Battlefield Blitz went from its own site to two-player matches in eight releases. 0.9.0 added two players in lockstep, and 0.10.0 (30 October 2026) adds a real lobby and a scoreboard you can drag. Solo matches still play the 0.8.2 matches value for value.

[stats]
0.10.0 | current release (30 October 2026)
8 | releases in these notes
40,507 B | gzip, the current build
[/stats]

[text]
heading: Version 0.10.0 | Released 30 October 2026.

- **A real two-player lobby** at /play/two/: join with an invite code and a room, send player 2 a link, then the countdown and the match. After it: REMATCH (same room, a fresh seed) or NEW ROOM. If the other player leaves: REJOIN or NEW ROOM. Before, the match just waited.
- **Two players on phones.** One full-screen stage with no scroll on phones. A short landscape phone gets a two-column card, and every lobby key is at least 44 px.
- **The scoreboard drags.** Drag its top bar. It stays on the board and is remembered on this device; a double-click puts it back.
- **The hero follows the theme.** In light mode the gradient behind the hero copy was still the dark one. It now uses the theme's colours, and every hero text colour passes WCAG AA.
- **Under the hood.** Fizlet 0.19.0 (was 0.15.0), no game change. dist/blitz.js is 40,507 B gzip (budget 40,960 B).
[/text]

[text]
heading: Version 0.9.0 | Released 30 October 2026.

- **Two players in lockstep.** Both players run the same match from the room's seed, and only inputs travel. A fixed 1100 × 640 arena scales to fit, so any two screens play one match. Seats after the humans are bots.
- **Tested for drift.** Two peers on different screen sizes play 3,600 frames identical, also with 6 ± 5 ticks of jitter: 0 desyncs.
- **Solo play is unchanged.** The pinned 0.8.2 matches still play value for value.
- **Size.** dist/blitz.js is 40,251 B gzip; the two-player module, dist/blitz-net.mjs, is 41,785 B (budget 43,008 B).
[/text]

[text]
heading: Version 0.8.4 | Released 30 October 2026.

- **No garbage-collection hitches.** The step allocates nothing: 20,000 busy steps make 0 minor GCs (0.8.3 made 10 and 14).
- **A screen-shake fix.** The shake no longer draws from the match's seeded random, so how often the screen is drawn no longer changes a match. Board matches where you get hit play differently from 0.8.3, and they replay.
- **Size.** 39,143 B gzip.
[/text]

[text]
heading: Version 0.8.3 | Released 30 October 2026.

Same matches, bit for bit: seeds 41, 42 and 7 play the 0.8.2 matches for 3,600 frames.

- **No wall clock in the step.** A cover's knock cool-down runs on match time, so a page-cover match no longer depends on the wall clock.
- **Size.** 37,885 B gzip.
[/text]

[text]
heading: Version 0.8.2 | Released 29 October 2026.

- **Keys press right.** Every in-page key is the Board UI kit's: press beats hover, and the face and its base both take the click. PLAY BLITZ is the kit's sticker key.
- **Cleaner pages.** The footer headings keep a clean order, and both pages carry structured data.
- **Size.** 37,813 B gzip.
[/text]

[text]
heading: Version 0.8.1 | Released 29 October 2026.

- **Supply crates read the engine.** The fall shadow and the blink come from the drop brick. Five seeds × 7,200 frames play the same as 0.8.0.
- **Size.** 37,614 B gzip.
[/text]

[text]
heading: Version 0.8.0 | Released 29 October 2026.

- **Replayable matches.** Every random number in a match comes from the engine's seeded random: the same seed and the same input give the same match.
- **Supply crates on fizlet/rules.** 2 at once, a 2.2 s parachute fall and 14 s on the ground, as before, with the same kinds, odds and rewards.
- **Size.** 37,639 B gzip (was 34,501 B).
[/text]

[text]
heading: Version 0.7.0 | Released 29 October 2026.

- **Blitz has its own site.** The landing page and the game at /play/ moved over from the Battlefield site, ready for battlefieldblitz.domvirus.com. The site links to DOM Battlefield and DOM VIRUS.
[/text]

[cta]
Play Battlefield Blitz -> /games/battlefield-blitz/
Read the full changelog -> https://github.com/coded-dot-design/dom-battlefield-blitz/blob/main/CHANGELOG.md
How the games run on Fizlet -> https://fizlet.com/notes/moving-the-games-onto-a-4-kb-kernel/
[/cta]

[seo]
title: Battlefield Blitz 0.10 patch notes: 0.7.0 to 0.10.0
description: Battlefield Blitz patch notes 0.7.0 to 0.10.0: two players in lockstep, a real lobby, replayable matches and no GC hitches.
[/seo]
