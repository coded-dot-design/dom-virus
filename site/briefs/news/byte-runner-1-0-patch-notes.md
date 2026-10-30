---
type: news
title: Byte Runner 1.0 patch notes | Versions 1.0.0 to 1.0.1, from the changelog.
slug: byte-runner-1-0-patch-notes
tags: [release, patch-notes, byte-runner]
date: 2026-10-30
status: published
image: /shots/byte-runner.jpg
---
Byte Runner 1.0 keeps the frog, the flies and the trails, on a new engine. 1.0.0 moved it onto Fizlet, and 1.0.1 (30 October 2026) fixes drawing on 2× and zoomed screens and lets you drag the scoreboard.

[stats]
1.0.1 | current release (30 October 2026)
2 | releases in these notes
34,859 B | gzip, the current build
[/stats]

[text]
heading: Version 1.0.1 | Released 30 October 2026.

Same game and rules. The engine update is the only code change.

- **Fixed: the game draws in the right place on 2× and zoomed screens.** On a 1.5× or 2× screen, the gates' beacon rings, sparks and popups drew too big and away from the page. The trails, food and sprites live in the page and were never off (checked in Chromium at 2×).
- **The scoreboard drags.** Grab the card anywhere that isn't a key, with mouse or touch. It stays inside the window, even when the window shrinks.
- **Easier-to-read keys.** The scoreboard's key labels pass WCAG AA contrast in light and dark.
- **Under the hood.** Fizlet 0.19.0 (was 0.13.0). The game is 34,859 B gzip (1.0.0: 33,868 B); the budget moves to 35,500 B.
[/text]

[text]
heading: Version 1.0.0: on Fizlet | Released 29 October 2026.

Byte Runner moves from the DOM VIRUS core onto Fizlet 0.13.0. Same game, same numbers.

- **Same seed, new maze.** The engine draws a different random sequence than 0.10.x, so a seed gives a different food layout. It still repeats: the same seed with the same inputs replays the same run (tested).
- **A new scoreboard.** Score, level, lives, power, a food meter, the Jump and Refresh maze keys and a comms toast, in the Board UI kit.
- **Phone stick from the kit.** The stick turns by its stronger axis past a 0.15 dead zone. On keys, the newest held direction still wins.
- **Trails follow the page.** The maze rebuilds from the layout every 0.35 s when the view changed, on a new level and when you press M.
- **No page-wide locks on phones.** The selection and zoom locks are gone; the touch pad itself never selects text.
- **Size.** 33,868 B gzip (0.10.2: 29,160 B). The Board UI kit's CSS is 2,962 B of it.
[/text]

[cta]
Play Byte Runner -> /games/byte-runner/
Read the full changelog -> https://github.com/coded-dot-design/byte-runner/blob/main/CHANGELOG.md
How the games run on Fizlet -> https://fizlet.com/notes/moving-the-games-onto-a-4-kb-kernel/
[/cta]

[seo]
title: Byte Runner 1.0 patch notes: 1.0.0 to 1.0.1
description: Byte Runner 1.0 patch notes: the move to the Fizlet engine, a new scoreboard, sharp drawing on 2× screens and a draggable card.
[/seo]
