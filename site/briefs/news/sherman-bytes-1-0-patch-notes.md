---
type: news
title: Sherman Bytes 1.0 patch notes | Versions 1.0.0 to 1.0.1, from the changelog.
slug: sherman-bytes-1-0-patch-notes
tags: [release, patch-notes, sherman-bytes]
date: 2026-10-30
status: published
image: /shots/sherman-bytes.jpg
---
Sherman Bytes 1.0 is the same pixel tank on a new engine. 1.0.0 moved it onto Fizlet with the same waves, drops and cannon, and 1.0.1 (30 October 2026) fixes drawing on 2× and zoomed screens and lets you drag the scoreboard.

[stats]
1.0.1 | current release (30 October 2026)
2 | releases in these notes
33,601 B | gzip, the current build
[/stats]

[text]
heading: Version 1.0.1 | Released 30 October 2026.

Same game and rules. The engine update is the only code change.

- **Fixed: the game draws in the right place on 2× and zoomed screens.** On a 1.5× or 2× screen, the tank, enemies, shells and the bases' beacon rings drew too big and away from the page: the tank started off screen and enemies fired at empty space. Now the art sits on your tank and around the bases (checked in Chromium at 2×).
- **The scoreboard drags.** Grab the card anywhere that isn't a key, with mouse or touch. It stays inside the window, even when the window shrinks.
- **Easier-to-read keys.** The scoreboard's key labels pass WCAG AA contrast in light and dark.
- **Under the hood.** Fizlet 0.19.0 (was 0.13.0). The game is 33,601 B gzip (1.0.0: 32,606 B); the budget moves to 34,000 B.
[/text]

[text]
heading: Version 1.0.0: on Fizlet | Released 29 October 2026.

Sherman Bytes moves from the DOM VIRUS core onto Fizlet 0.13.0. Same game, same numbers.

- **Same waves, drops and cannon.** The wave clock and the airdrops keep their numbers, and the cannon still levels up at 20 and 60 XP.
- **A new scoreboard.** Score, wave, armor and scrap, the cannon meter, the Cover, Pillbox and Mine keys and a comms toast for waves, in the Board UI kit.
- **Bases show their health** as a level inside the button (full green at full health) and a beacon ring.
- **A base is the whole button.** A button half off screen keeps walls fitted to its whole box, and a letter exactly at the tank's radius now blocks.
- **Same seed, same run.** A step never allocates (tested: 20,000 busy steps with waves, builds, mines and pillboxes, no minor GC), and a run replays from its seed (tested).
- **Size.** 32,606 B gzip (0.5.2: 26,994 B). The Board UI kit's CSS is 3,060 B of it.
[/text]

[cta]
Play Sherman Bytes -> /games/sherman-bytes/
Read the full changelog -> https://github.com/coded-dot-design/sherman-bytes/blob/main/CHANGELOG.md
How the games run on Fizlet -> https://fizlet.com/notes/moving-the-games-onto-a-4-kb-kernel/
[/cta]

[seo]
title: Sherman Bytes 1.0 patch notes: 1.0.0 to 1.0.1
description: Sherman Bytes 1.0 patch notes: the tank game on the Fizlet engine, the same waves and cannon, and sharp drawing on 2× screens.
[/seo]
