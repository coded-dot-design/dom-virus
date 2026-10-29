---
type: blog
title: Twenty years of tiny games | What the DOM taught me about speed.
slug: twenty-years-of-tiny-games
tags: [performance, engine, story]
date: 2026-11-05
status: scheduled
publishAt: 2026-11-05
image: https://coded-dot-design.github.io/dom-virus/og/dom-virus.png
---
I have made small games and micro animations on the side for more than twenty years. The tools changed every few years. The lesson did not: on a webpage, speed comes from doing less, on purpose, every single frame.

[text]
heading: Flash, then jQuery

My first games lived inside Flash embeds. They were small and self-contained, and the plugin did the heavy lifting. You drew a box on a page and the game lived inside it.

Then the plugin faded and the page itself became the stage. Back when jQuery was the best tool we had, I built animated single-page sites with it.

That is where I learned the hard way that the DOM has a cost. Animate the wrong property, or read a size at the wrong moment, and the whole page stutters.
[/text]

[text]
heading: Years of apps

After that came years of building apps in Python, PHP and Angular. Less animation, more data, more forms, more screens that had to stay fast as they grew.

Apps teach you a different kind of performance. Memory that grows a little every minute. Listeners that never get removed. Work that keeps running while nobody is looking.

For the last four or five years it has mostly been TypeScript and React. TypeScript is a correctness tool for me, not a speed trick. Its types are erased at build time.

Along the way there were game sites and interactive pieces. Each one was a small excuse to try the old ideas again.
[/text]

[text]
heading: What made it into the games

DOM VIRUS is where those lessons ended up. Every game here follows the same rules.

One loop. A single requestAnimationFrame chain drives the whole game. Pause, loss, victory and Recall stop it, and a hidden tab pauses play.

Pools, not garbage. Enemies, bullets, pickups and particles share fixed, typed pools with hard ceilings. Removing one swaps it with the last active item. A long session never grows its memory.

Cached geometry. Layout reads happen outside the per-projectile path, on a bounded schedule. A shell checks a cache, never the browser.

Bounded catch-up. The simulation step is capped at 34 milliseconds. After a long stall, the game drops the extra time instead of racing to replay it.

Narrow collisions. A spatial grid checks nearby cells before any exact test, so each shell only tests what is close to it.

Caps you can read. Sherman Bytes caps tanks at 32 and shells at 120. Null Invaders caps aliens at 48 and bullets at 80. Byte Runner caps flies at 12.

Cheap pixels. The canvas backing resolution is capped at 1.5 times the CSS pixel ratio. The HUD updates at most 10 times per simulation second.
[/text]

[text]
heading: Why caps beat cleverness

A cap sounds like a limit on fun. In practice it is the opposite. When the pool is full, the game says no to the next particle, and the frame stays inside its budget.

Without a cap, the busiest moment of a game is also the slowest one. That is exactly when you need it to be smooth.

So I set the ceiling first, then design the game to feel big inside it. Nobody notices the 101st spark that never appeared. Everybody notices a stutter.
[/text]

[text]
heading: Small is a feature

The games are small too, and the hub measures them at every build. Sherman Bytes 0.5.2 ships at 27.0 kB gzip, game and engine together. Null Invaders 0.7.2 ships at 22.9 kB.

Those figures are package sizes, not a prediction of what any one page downloads. But they keep me honest. Every kilobyte has to buy something you can feel while playing.

Twenty years in, the tools are better and the browsers are faster. The discipline is the one I learned animating with jQuery: read once, write only what changed and stop when nobody is watching.
[/text]

[features rows]
heading: Keep reading
item: The page is the game board | How the games read the page cheaply and play on its real letters. | Read: The page is the game board -> /blog/the-page-is-the-game-board/
item: Sherman Bytes | One loop, pooled tanks and shells, cached geometry. Feel it for yourself. | Play Sherman Bytes -> /games/sherman-bytes/
item: Under the hood | The same rules as live demos you can poke. | See how the engine works -> /engine/
[/features]

[seo]
title: Twenty years of tiny games: what the DOM taught me
description: From Flash embeds and jQuery to TypeScript: twenty years of small web games, and the rules they taught me. One loop, pools, caps and cached geometry.
[/seo]
