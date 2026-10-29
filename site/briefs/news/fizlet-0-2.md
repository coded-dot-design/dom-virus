---
type: news
title: Fizlet 0.2 | The engine gets its first bricks.
slug: fizlet-0-2
tags: [release, fizlet]
date: 2026-10-28
status: published
image: https://coded-dot-design.github.io/dom-virus/og/dom-virus.png
---
Fizlet 0.2 adds the first five bricks on top of the kernel: input, collide, fx, sound and embed. Fizlet is the tiny game and animation engine for the DOM behind the DOM VIRUS family. One shared loop, bounded everything, and page changes given back on Recall.

[text]
heading: What's new

Input turns keys, pointer and a touch stick into intents. Keys typed into the host page's own fields never count.

Collide is a fixed-capacity spatial hash with overlap tests and swept circle checks, so fast shots don't tunnel through thin targets.

Fx brings pooled particles, the hero blast, pop words, scorch and shake. Sound maps engine events to synth cues and unlocks on a gesture.

Embed handles the drop-in: a hex-only palette, easter-egg triggers, lazy load, an open and close toggle, and Escape to close. Since 0.2.1 it can wait closed behind a PLAY key.

The Board UI kit got two fixes. The surrender flag keeps its grid and outline, and the card grip matches DOM Battlefield's.

Every brick has tests in Node and Chromium, and every size budget runs in CI.
[/text]

[text]
heading: Where it runs

Battlefield Blitz runs on Fizlet today. The four embedded games and DOM Battlefield move onto it next.
[/text]

[stats]
0.2.4 | current release (28 October 2026)
2.8 kB | kernel, gzip (2,839 bytes)
4.1 kB | kernel budget (4,096 bytes)
5 | new bricks in 0.2
0 | runtime dependencies
[/stats]

[cta]
Play Battlefield Blitz -> https://coded-dot-design.github.io/dom-battlefield/blitz/play/
Get the code & setup instructions -> https://github.com/coded-dot-design/fizlet
[/cta]

[seo]
title: Fizlet 0.2: input, collide, fx, sound and embed bricks
description: Fizlet 0.2 adds five bricks to the 2.8 kB kernel: input, collide, fx, sound and embed. Tested in Node and Chromium, with size budgets in CI.
[/seo]
