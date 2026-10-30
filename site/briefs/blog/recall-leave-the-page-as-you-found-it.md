---
type: blog
title: Recall: leaving the page the way you found it | An ownership ledger, not a reset button.
slug: recall-leave-the-page-as-you-found-it
tags: [recall, engine, fizlet]
date: 2026-11-19
status: scheduled
publishAt: 2026-11-19
image: /shots/sherman-bytes.jpg
---
Every DOM VIRUS game breaks the page you are reading, on purpose. Then you press Recall and the page comes back. That second half is the part I care about most, and it is harder than it looks.

[text]
heading: A game is a guest

A game that runs on your real page is a guest. It gets to rearrange the furniture for a while. It does not get to leave a mess.

If a game rewrites your headline and forgets to put it back, that is now a bug in your site, not just in mine. Nobody would embed a game that did that twice.

So Recall is not an extra. It is the reason the rest of the project is allowed to exist.
[/text]

[text]
heading: What the ledger records

Every change a game makes goes through an ownership ledger. For each text node it touches, the ledger keeps two values: the original, and the latest value the game wrote.

Hits rewrite characters inside the existing text node to a literal 0 or 1. The node stays the same node. Nothing is cloned, wrapped or swapped out.

Styles work the same way. When a game paints a button it is attacking, it records what was there first. When a target is removed, its effect records are released and its owned styles restored.
[/text]

[text]
heading: Compare before you restore

Here is the subtle part. Your page is alive. Your app might update a price, a counter or a headline while the game is running.

So Recall does not blindly write the old values back. It compares the current value with the last value the game wrote.

If they still match, the game still owns that change, and Recall restores the original. If they differ, your app changed it since. Your app wins, and Recall leaves it alone.

That is also why I'm careful about what Recall promises. It gives back what the game changed and still owns. It cannot roll back unrelated changes made by your application.

Recall never replaces a container's HTML and never recreates a button. The elements your app knows about are the same elements after the game leaves.
[/text]

[text]
heading: Leaving means all of it

Giving the page back is more than text. Recall stops the frame loop, takes the game's controls off the page and releases the audio context.

On the hub, switching cartridges runs Recall first and loads the next game after. One game should never leave scraps for the next one.

I test this the boring way. The browser tests switch games over and over and check the cleanup each time, including on mobile and inside scrolling containers.
[/text]

[text]
heading: Recall in Fizlet

Fizlet, the engine behind Battlefield Blitz, makes the same rule part of its contract. Every page change goes through engine.ledger: text, styles, attributes, classes and added nodes.

Writes are change-only, so the ledger skips anything that would not change the page. Calling destroy restores the page, style text byte for byte, and a newer edit by the host page always wins.

One AbortSignal removes every listener and observer the engine added. Each of those rules has a test.

Blitz shows it best when you drop it onto a page. Shells knock your headings around, treads flatten them, and Escape gives the page back.
[/text]

[text]
heading: Try it yourself

The engine page on the hub has a small live demo. Fire at a sentence, let a pretend app edit one of the hit letters, then press Recall. Only the game's own edits come back.

Then try it on a real game. Play Sherman Bytes for a minute, wreck a paragraph or two and press Recall. The page you came for will be right where you left it.
[/text]

[features rows]
heading: Keep reading
item: Sherman Bytes | Wreck a paragraph, then hit Recall and watch it come back. | Play Sherman Bytes -> /games/sherman-bytes/
item: Try the Recall demo | Fire at a sentence, let a pretend app edit a letter, then Recall. | See the Recall demo -> /engine/
item: The page is the game board | How the games read the page in the first place. | Read: The page is the game board -> /blog/the-page-is-the-game-board/
[/features]

[seo]
title: Recall: how DOM VIRUS games give your page back
description: Every DOM VIRUS game keeps an ownership ledger. Recall restores what the game still owns, and if your app changed something since, your app wins.
[/seo]
