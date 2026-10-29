---
type: blog
title: Why I built Fizlet | A 4 KB kernel and a box of bricks.
slug: why-i-built-fizlet
tags: [fizlet, engine, performance, open-source]
date: 2026-11-26
status: scheduled
publishAt: 2026-11-26
image: /og/dom-virus.png
---
Fizlet is the small engine I wrote so each new game starts where the last one finished. It is a kernel with a 4 KB gzip budget, plus bricks of about 1.5 KB each. Battlefield Blitz runs on it today.

[text]
heading: The same lessons, written down once

By the time I had four embedded games, they shared a lot: one loop, pools, cached geometry and a ledger for Recall. They shared it through a common runtime, but some of the rules lived only in my head.

Fizlet turns those rules into a contract. Every brick and every game built on it keeps the same promises, and each promise has a test.

The name is fizz, the pop of an effect, with a nod to physics. The -let is small, like an applet.
[/text]

[text]
heading: What the contract says

One clock per page. Every engine on a page shares one requestAnimationFrame, with a fixed 60 Hz step and a catch-up cap. A long frame drops time; it never spirals.

Bounded everything. Pools and the event ring have a fixed capacity and refuse work when full.

Zero allocation in the steady state. One test runs a million kernel steps of a busy system and checks that no young-generation garbage collection happens.

No layout reads in the step. Read in read, simulate in step, write in render. A debug brick counts any layout read made during a step.

Change-only writes, pause by default, and own nothing you can't give back. A hidden tab, a root scrolled off screen or typing in the host's own fields all pause it.

Embed-safe: no globals, no global styles, many engines per page. And budgets in CI, so none of this quietly grows.
[/text]

[text]
heading: A kernel plus bricks

The kernel is the clock and scheduler, pools, the event ring, the ledger and a seeded random. Its budget is 4 KB gzip, and today it measures about 2.8 KB.

Everything else is a brick you import only if you need it. Input turns keys, the pointer and a touch stick into intents. Collide brings a spatial hash and swept hit tests, so fast shots don't tunnel through targets.

Fx carries pooled particles, the hero blast, pop words, scorch and shake. Sound turns game events into synthesized cues. Embed handles the drop-in, brand palettes and easter-egg triggers.

There is also the Board UI kit: the 3D keys, cards and overlays the Battlefield games wear. And no runtime dependencies, ever.
[/text]

[text]
heading: Battlefield Blitz is the proof

Blitz was the first game built on Fizlet, and today it is the only one. Fizlet 0.1.0 shipped the kernel. Version 0.2.0 shipped the first bricks, the ones Blitz needed.

Blitz is a free-for-all tank brawl: parachute in, call airstrikes, most kills in three minutes wins. Its whole build has a 40 KB gzip budget, engine, art and Board UI kit included. Today it measures about 34 KB.

The four embedded games still run on the DOM VIRUS shared runtime, and Swarm Protocol keeps its own engine. Moving them onto Fizlet is the next phase, not something already done.

I won't claim Fizlet makes those games faster until I have measured it on real devices. That is the deal with every number on this site.
[/text]

[text]
heading: Why not an existing engine

There are good small engines out there, and I compared a lot of them before starting. Most assume they own a canvas or the whole page. Most animation libraries have no loop, entities, collision or rules.

I wanted something else: a polite guest on a page it does not own, small enough that the page never notices it is there. That gap is what Fizlet is for.

It is MIT licensed and built to be built on. Games, yes, but also a diagram you can play with or a hero that reacts. If you make something with it, I would love to see it.
[/text]

[features rows]
heading: Go deeper
item: Fizlet on GitHub | The kernel, the bricks, the contract and its tests. MIT licensed. | Get the Fizlet code on GitHub -> https://github.com/coded-dot-design/fizlet
item: Battlefield Blitz | The first game on Fizlet. Every tank for itself. | Play Battlefield Blitz -> https://coded-dot-design.github.io/dom-battlefield/blitz/play/
item: How the games work | One loop, a cheap read of the page and a clean exit, as live demos. | See how the engine works -> /engine/
[/features]

[seo]
title: Why I built Fizlet: a tiny engine for games on the page
description: Fizlet is a micro game engine for the DOM: a 4 KB gzip kernel budget, bricks of about 1.5 KB, zero steady-state allocation. Battlefield Blitz runs on it.
[/seo]
