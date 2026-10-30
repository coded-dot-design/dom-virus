---
type: blog
title: How we build games on a 4 KB kernel | What a tiny engine means when you play.
slug: how-we-build-games-on-a-4-kb-kernel
tags: [fizlet, engine, performance]
date: 2026-10-30
status: published
image: /og/dom-virus.png
---
Every game in the DOM VIRUS arcade runs on Fizlet, a game engine for the page whose kernel has a 4 KB gzip budget. The kernel runs the loop: read the page, step the rules, write the page back. Each game adds only the bricks it needs. Here is what that means when you play.

[stats]
3,422 B | the Fizlet kernel, gzip (budget 4,096 B), on Fizlet 0.17.0
6 | arcade games on Fizlet
0 | minor GCs in 20,000 busy steps, in each port's test
27,499 B | all of Null Invaders 1.0.2, gzip
[/stats]

[text]
heading: One loop for every game

A game on Fizlet is a set of rules and a loop. Each frame the engine reads the page: where the letters and the buttons are. Then it steps the rules on typed arrays. Then it writes the page back through a ledger.

The ledger is why Recall works. Every change the game makes to the page is recorded, so the page comes back byte for byte when you are done.
[/text]

[text]
heading: What you notice as a player

- **No hitches.** A step never allocates, so the garbage collector has nothing to clean up mid-fight. Each port proves it: 20,000 busy steps, 0 minor GCs.
- **Same seed, same run.** Every random roll comes from the run's seed, so a run replays exactly. That is what lets [Battlefield Blitz](/games/battlefield-blitz/) play two players in lockstep: only inputs travel, and two peers stay identical, with 0 desyncs in its tests.
- **One button language.** The scoreboards share the Board UI kit, so a key in [Null Invaders](/games/null-invaders/) presses like a key in [DOM Battlefield](/games/battlefield/).
- **The page comes back.** Recall restores the page byte for byte, tested in Chromium for every port.
[/text]

[text]
heading: What it costs

Small is not free. Moving onto Fizlet made the games bigger in gzip bytes, by 7 to 21%. Most of that is the shared Board UI kit each game bakes in. The patch notes give every game's size, before and after.

The full story, with the size ledger game by game and what the ports taught the engine, is on fizlet.com.
[/text]

[features cards]
heading: The games on the kernel
item: Null Invaders | Fly an interceptor through the page. 27,499 B gzip for the whole game (1.0.2). | Play Null Invaders -> /games/null-invaders/
item: Byte Runner | A frog on the page's trails. 34,859 B gzip (1.0.1). | Play Byte Runner -> /games/byte-runner/
item: Sherman Bytes | The pixel tank that breaches button bases. 33,601 B gzip (1.0.1). | Play Sherman Bytes -> /games/sherman-bytes/
item: Swarm Protocol | Defend the page from a swarm. 39,132 B gzip on first open (1.4.0). | Play Swarm Protocol -> /games/swarm-protocol/
item: DOM Battlefield | Squad tactics on a full board. 71,911 B gzip (1.0.0). | Play DOM Battlefield -> /games/battlefield/
item: Battlefield Blitz | Every tank for itself, or two players in lockstep. 40,507 B gzip (0.10.0). | Play Battlefield Blitz -> /games/battlefield-blitz/
[/features]

[faq]
Q: How big is the Fizlet kernel?
A: 3,422 B gzip on Fizlet 0.17.0, as Swarm Protocol 1.4.0's size check measures it. Its budget is 4,096 B.
Q: Which games run on Fizlet?
A: All six in the arcade: Null Invaders, Byte Runner, Sherman Bytes, Swarm Protocol, DOM Battlefield and Battlefield Blitz.
Q: Where are the technical details?
A: On fizlet.com: the kernel, the bricks and the size ledger for every port.
[/faq]

[cta]
The full story on fizlet.com -> https://fizlet.com/notes/moving-the-games-onto-a-4-kb-kernel/
Browse the games -> /games/
Read the patch notes -> /news/
[/cta]

[seo]
title: How we build games on a 4 KB kernel | DOM VIRUS
description: Every DOM VIRUS game runs on Fizlet, whose kernel is 3,422 B gzip. What that buys players: no hitches, replayable runs, the page back.
[/seo]
