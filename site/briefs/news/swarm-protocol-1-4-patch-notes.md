---
type: news
title: Swarm Protocol 1.4 patch notes | Versions 1.4.0, from the changelog.
slug: swarm-protocol-1-4-patch-notes
tags: [release, patch-notes, swarm-protocol]
date: 2026-10-30
status: published
image: /shots/swarm-protocol.jpg
---
Swarm Protocol 1.4.0 (30 October 2026) moves the swarm onto Fizlet. The bugs, the buttons, the rescues and every rule's numbers stay as they were. What changes is how the game reads and writes the page.

[stats]
1.4.0 | current release (30 October 2026)
1 | release in these notes
39,132 B | gzip, the current build
[/stats]

[text]
heading: Version 1.4.0 | Released 30 October 2026.

Swarm Protocol runs on Fizlet 0.17.0. The widget, every visual and the rules' numbers stay as they were.

- **Same seed, same round.** The rules run in fixed 1/60 s steps, seeded per round. A step never allocates (tested).
- **The page always comes back.** Every page change goes through the engine's ledger, and Recall restores the page byte for byte (Chromium test).
- **Letters are measured on a budget.** At most 600 reads a refresh, 12.5 times a second while the page changes and twice a second once it is still. After a scroll or resize, a bug waits for the next measure (at most 0.5 s) before it picks a letter.
- **Squashes land on the next step.** The kill, scatter and score follow one frame later. A rescue scrolls at once and pays on the next step.
- **Big pages.** At most 64 buttons and 32 page UI areas take part in a round. Without Intl.Segmenter (older browsers), a round runs on buttons only.
- **Size and speed.** The game on first open is 39,132 B gzip (1.3.1: 30,304 B), of which the Fizlet kernel is 3,422 B. Frame work in Chromium averages 0.6 ms.
[/text]

[cta]
Play Swarm Protocol -> /games/swarm-protocol/
Read the full changelog -> https://github.com/coded-dot-design/swarm-protocol/blob/main/CHANGELOG.md
How the games run on Fizlet -> https://fizlet.com/notes/moving-the-games-onto-a-4-kb-kernel/
[/cta]

[seo]
title: Swarm Protocol 1.4 patch notes: on the Fizlet engine
description: Swarm Protocol 1.4.0 patch notes: the swarm moves onto Fizlet with the same rules, a page that always comes back and 0.6 ms frames.
[/seo]
