---
type: news
title: Null Invaders 1.0 patch notes | Versions 1.0.0 to 1.0.2, from the changelog.
slug: null-invaders-1-0-patch-notes
tags: [release, patch-notes, null-invaders]
date: 2026-10-30
status: published
image: /shots/null-invaders.jpg
---
Null Invaders 1.0 is the same shooter on a new engine. 1.0.0 moved it onto Fizlet, 1.0.1 proved its step allocates nothing, and 1.0.2 (30 October 2026) fixes drawing on 2× and zoomed screens and lets you drag the scoreboard.

[stats]
1.0.2 | current release (30 October 2026)
3 | releases in these notes
27,499 B | gzip, the current build
[/stats]

[text]
heading: Version 1.0.2 | Released 30 October 2026.

Same game and rules. The engine update is the only code change.

- **Fixed: the game draws in the right place on 2× and zoomed screens.** On a 1.5× or 2× screen, the ship, the invaders and the factories' beacon rings drew too big and away from the page. Now the art sits on your ship and around the target buttons (checked in Chromium at 2×).
- **The scoreboard drags.** Grab the card anywhere that isn't a key, with mouse or touch. It stays inside the window, even when the window shrinks.
- **Easier-to-read keys.** The scoreboard's key labels pass WCAG AA contrast in light and dark.
- **Under the hood.** Fizlet 0.19.0 (was 0.13.0). The game is 27,499 B gzip (1.0.1: 26,493 B); the budget moves to 28,000 B.
[/text]

[text]
heading: Version 1.0.1 | Released 29 October 2026.

Same game: a run replays bit for bit what 1.0.0 played (same seeds, same inputs).

- **No allocation in the step.** Math.hypot is out of the step, because V8's allocates on every call. Its replacement returns exactly the same numbers, so gameplay doesn't move by a bit.
- **Size.** 26,493 B gzip (budget 27,000 B).
[/text]

[text]
heading: Version 1.0.0: on Fizlet | Released 29 October 2026.

Null Invaders moves from the DOM VIRUS core onto Fizlet 0.13.0. Same game, same numbers.

- **A new scoreboard.** Score, wave, shields, combo and the weapon meter sit in the Board UI kit, with the same keys and readouts as DOM Battlefield and a comms toast for upgrades, waves and the result.
- **Phone controls from the kit.** The touch stick and the Fire key are the kit's pad.
- **Factories show their health** as a level inside the button and a beacon ring.
- **Same seed, same run.** A step never allocates (tested: 20,000 busy steps, no minor GC), and the same seed with the same inputs replays the same run (tested).
- **Size.** 26,434 B gzip (0.7.2: 22,940 B). The Board UI kit's CSS is 2,702 B of it.
[/text]

[cta]
Play Null Invaders -> /games/null-invaders/
Read the full changelog -> https://github.com/coded-dot-design/null-invaders/blob/main/CHANGELOG.md
How the games run on Fizlet -> https://fizlet.com/notes/moving-the-games-onto-a-4-kb-kernel/
[/cta]

[seo]
title: Null Invaders 1.0 patch notes: 1.0.0 to 1.0.2
description: Null Invaders 1.0 patch notes: the move to the Fizlet engine, sharp drawing on 2× screens and a scoreboard you can drag.
[/seo]
