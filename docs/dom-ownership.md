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

## Touch controls and text paint (0.9)

Movement and fire controls are siblings of the scoreboard inside the shadow root.
Each held touch owns its pointer ID and key; lifting one finger cannot release a
second finger's fire button. Native pointer capture delivers releases outside the
button. Cancellation, blur, pause and teardown clear input. Touch-sized buttons
have `touch-action: none` locally; the rest of the document keeps native scrolling.
Mobile starts with a compact score/health panel. Results expand automatically.

Converted bits use CSS Custom Highlights with the active game’s neon accent at full
brightness by default and a dark native background. `binaryOpacity` remains opt-in. The underlying Text node still contains the literal digit. Highlights do
not add layout boxes, rotate glyphs or replace font metrics. Browsers without the
API keep the actual text mutation without decorative paint. Each changed node's
range offsets are repaired on mutation, never by a per-character frame loop.

Explosions remain independent, bounded transient particles (100 shared particles,
24 score popups). Ships/tanks use cached pixel sprites; Swarm caches its Path2D body
and leg geometry. Native target animations pause with the game, while entity motion
and particle lifetimes share the existing animation loop. These bounds prevent
unlimited effects growth; they do not guarantee a frame rate on every host page.

Active mobile play temporarily sets the root's `touch-action` policy to allow
panning without pinch/double-tap zoom. Existing stricter panning restrictions stay
in place. Pause, game end and Recall conditionally restore the previous inline
value; newer host edits win. No viewport meta tag is rewritten and an already
zoomed page is not forcibly reset. Set `lockZoom: false` to retain normal zoom.
The small helper is shared with Swarm without replacing Swarm's engine.

Swarm pulse rings and attached bug sprites live under the actual button, in an owned
Shadow DOM child. Sherman base walls, capture status, progress and cover outlines
use the same native attachment rule. They follow scrolling and ancestor transforms
even while the simulation is paused. Recall removes attachments and conditionally
restores owned positioning styles. Attached bugs reuse small bounded canvases;
free actors and transient particles continue sharing the game loop.

While a game is running, movement/fire keydown and keyup events are consumed even
when page chrome retains focus. Typing fields, dialogs, modifier shortcuts and
keyboard activation of HUD buttons retain their native behavior. Recall releases
all game listeners.
