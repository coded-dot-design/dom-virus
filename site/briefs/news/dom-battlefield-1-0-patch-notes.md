---
type: news
title: DOM Battlefield 1.0 patch notes | Versions 1.0.0 to 1.0.1, from the release commits.
slug: dom-battlefield-1-0-patch-notes
tags: [release, patch-notes, dom-battlefield]
date: 2026-10-30
status: published
image: /shots/dom-battlefield.jpg
---
DOM Battlefield 1.0 is the same squad-tactics game on the Fizlet engine. 1.0.0 (29 October 2026) moved the battle onto Fizlet with gameplay unchanged, and 1.0.1 (30 October 2026) puts the landing page's live battle on Fizlet too.

[stats]
1.0.1 | current release (30 October 2026)
2 | releases in these notes
71,911 B | gzip, the 1.0.0 game build (gate 72,500 B)
0 | minor GCs over 20,000 busy steps (tested)
[/stats]

[text]
heading: Version 1.0.1 | Released 30 October 2026.

- **The landing hero runs on Fizlet.** The tank arena in the hero loads when it is needed, steps the battle at a fixed 60 Hz without allocating, and Recall restores the hero byte for byte. With reduced motion on, you get a still poster.
- **It rests.** The hero battle settles to no frames 30 s after your last input.
- **Under the hood.** Fizlet 0.17.0 (was 0.15.0). The game build changes by the engine's Recall fix only (+7 B gzip).
[/text]

[text]
heading: Version 1.0.0: on Fizlet | Released 29 October 2026.

The battle runs as one system on a Fizlet engine, and the game's own frame loop is gone. Nothing changes in how you play.

- **Same battles.** The new step plays the 0.18.13 battles identically.
- **Same seed, same battle.** Every random roll in play comes from the map's seed, so a map replays the same way from the same inputs.
- **No garbage-collection hitches.** Once warm, a battle step allocates nothing: 0 minor GCs over 20,000 busy steps (tested).
- **Repair kits** drop through the engine's rules brick. The battle keeps its own kit timer and caps.
- **Size.** 71,911 B gzip; the size gate moves from 68,000 to 72,500 B.
[/text]

[cta]
Play DOM Battlefield -> /games/battlefield/
Read the release commits -> https://github.com/coded-dot-design/dom-battlefield/commits/main
How the games run on Fizlet -> https://fizlet.com/notes/moving-the-games-onto-a-4-kb-kernel/
[/cta]

[seo]
title: DOM Battlefield 1.0 patch notes: 1.0.0 to 1.0.1
description: DOM Battlefield 1.0 patch notes: the squad-tactics game on the Fizlet engine, the same battles, replayable maps and no GC hitches.
[/seo]
