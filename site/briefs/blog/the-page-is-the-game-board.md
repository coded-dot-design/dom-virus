---
type: blog
title: The page is the game board | Letters are terrain. Buttons are bases.
slug: the-page-is-the-game-board
tags: [engine, recall, performance, sherman-bytes]
date: 2026-10-29
status: published
image: /og/dom-virus.png
---
Most browser games bring their own world: a canvas, a level, a map someone drew. DOM VIRUS games use the one already in front of you. The page you are reading is the board, and the game plays on its real letters and buttons.

[text]
heading: Real elements, real collisions

When a game starts, it reads the page. It finds the text and the buttons, measures where they sit and builds a map from them. Then the simulation plays against that map.

The letters stay real. A hit does not paint a fake letter on top of the page. It rewrites the character inside the existing text node to a literal 0 or 1.

There are no clones and no per-letter wrappers. I tried the other way first. Early builds drew replacement glyphs on a canvas. Hub 0.7.0 removed them and made real text the only path.

That choice made the engine harder and the game better. When the page is real, every hit is real too, and so is every repair.
[/text]

[text]
heading: Same page, different rules

Each cartridge maps the same page onto its own rules.

In Sherman Bytes, letters are walls. They block your tank and your shells, and blasting them leaves faint binary rubble you can drive across. Buttons spawn enemy tanks, so you breach them and take them.

In Null Invaders you fly an interceptor through the page. You turn letters into binary, break the button factories and clear the aliens they release.

In Byte Runner, a round pixel frog races through food pipes in the page's whitespace. It jumps out to eat real text and hunts escaping flies.

Swarm Protocol flips it around. You release a swarm onto the page, then defend it. Bugs eat letters into binary and drain your buttons.

Same page, different rules. That line is on the hub for a reason.
[/text]

[text]
heading: Reading the page without slowing it down

A webpage makes a good map, but asking the browser for layout is expensive. So the games read geometry, cache it and refresh it on a schedule.

The limits are hard numbers. The games index up to 8,000 glyphs and measure at most 900 of them per refresh. They pick up to 160 text containers and 32 button targets.

Geometry refreshes at most 12.5 times a second while the page is changing, and twice a second once it settles. A shell never asks the browser where a letter is. It asks the cache.

Turning a letter into a digit can reflow the line, because most fonts are proportional. When that happens, the cache is marked dirty and refreshed within the same limits.

These limits constrain work. They are not frame-rate promises. Real frame time still depends on the page, its fonts and your device.
[/text]

[text]
heading: The game UI stays out of your way

The game's own canvas and controls live in a Shadow Root on a custom host element. That keeps the game's styles from leaking into your page.

It is a style boundary, nothing more. The letters and buttons the game plays on stay in your real document.

The rest of the hub page is excluded on purpose. Menus, code examples and the launcher are not targets, so the game never eats the controls you need to stop it.
[/text]

[text]
heading: Then Recall gives the page back

A game that breaks your page and leaves it broken is a bug, not a feature. So every game keeps an ownership ledger: what was there before, and what the game wrote.

Press Recall and the game restores what it still owns. If your app changed something since, your app wins.

That rule is the heart of the whole project, and it gets its own post next month. For now, go wreck a paragraph. Then press Recall and watch it come back.
[/text]

[features rows]
heading: Try it on this site
item: Sherman Bytes | Breach the button bases, build cover, hold the page. Then hit Recall. | Play Sherman Bytes -> /games/sherman-bytes/
item: Null Invaders | Fly an interceptor through a real webpage and break the button factories. | Play Null Invaders -> /games/null-invaders/
item: Byte Runner | A hungry pixel frog races through the page's whitespace. | Play Byte Runner -> /games/byte-runner/
item: Swarm Protocol | Release a swarm onto the page, then defend it. | Play Swarm Protocol -> /games/swarm-protocol/
item: Two Macs, one network, and Bolo | Where the idea of a game that reaches into your page came from. | Read: Two Macs, one network, and Bolo -> /blog/two-macs-one-network-and-bolo/
[/features]

[seo]
title: The page is the game board: how DOM VIRUS games play
description: DOM VIRUS games play on the page you are reading: letters are terrain, buttons are bases, and Recall gives the page back. Here is how that works.
[/seo]
