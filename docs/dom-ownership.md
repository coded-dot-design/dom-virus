# The browser owns the board

DOM VIRUS uses the live document as terrain. The board is not a canvas copy of the page.

- A hit changes the existing Text node to literal binary. Its font, wrapping, accessibility text, selection and scrolling remain native. No replacement letters or per-letter element wrappers are rendered by the game.
- Each changed node retains its original and last game-written value. Each changed style property retains its original value and priority. Recall restores a property only while the game still owns its current value. A newer application edit wins. This is a change ledger, not a whole-document snapshot or a history of every projectile.
- Liquid health is painted on the real button background. A small, empty, non-interactive child owns its beacon. Its two rings live in an isolated shadow root and animate with native transform/opacity keyframes. The browser handles their placement, inherited border radius, nested scrolling, clipping and ancestor transforms.
- A static target temporarily receives `position: relative` to establish the containing block. That style is recorded and conditionally restored. Existing labels, event handlers, children and pseudo-elements are retained. SVG targets keep the background effect without the HTML attachment.
- Mobile/coarse-pointer and reduced-motion paths use a stable native fill and stationary rings. Desktop hit ripples settle after 0.65 seconds. Hidden targets and paused games pause their owned animations; removal and Recall cancel them.

## What still needs game geometry

Moving tanks, ships, bullets and swarms need positions and collision tests. The engine reads a bounded cache of actual DOM geometry for this work. It reuses one measurement Range instead of allocating a Range per collision candidate. Spent glyphs are excluded from collision measurements. No geometry reads are needed to position a button's attached beacon.

The cache must refresh after scrolling, resizing, real text changes and application layout changes. Browser layout, paint and native animations still cost work; attaching a visual does not make rendering free. These changes remove unnecessary JavaScript synchronization and allocations, not the need for collision detection.

Game-owned background writes do not rebuild the text index. The style ledger distinguishes these writes from external changes, including an application width change immediately followed by a game paint in the same task. MutationObserver still invalidates the board for the application's change.

## Bounded rendering

The existing 32-target cap also bounds attached hosts to 32 and their native animations to 64. Offscreen targets do not start new visuals. The shared engine reuses entity pools; Null Invaders and Sherman cache their sprite frames. Swarm keeps its established independent runtime. Repeated Recall must leave no owned hosts, live animations or style changes behind.

Browser regression checks exercise native nested scrolling and transforms without another board draw, unchanged target dimensions and label identity, pause/mobile behavior, observer invalidation, repeated cleanup, real-text mutation, Unicode offsets and newer host edits.
