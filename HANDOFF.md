# DOM VIRUS: agent handoff (hub + engine)

This is the first file any agent or model should read in this repo. Every repo in the ecosystem
keeps a `HANDOFF.md` (how it works, why, and what must not break) and a `FUTURE.md` (what's next).
The rest of this file is the map: what exists, how it fits together, why it works the way it does,
and the lessons that cost real time to learn. Phase 1 is done and tagged `phase-1`.

## Start here (for agents)

**Engine phase:** the next big piece of work is extracting a reusable micro DOM game and
interaction engine from this core and the games. The plan, contract, phases and progress log are
in [ENGINE.md](ENGINE.md). Read it before changing `src/`.

**What/why:** the hub site is the showcase for DOM games. Navigation is a game: cartridges, a
console, exact-reverse transitions. It is also a portfolio piece for coded.design: polished, fun,
full of easter eggs, and high-performance on phones. Not "vibe-coded".

**Where to change what**

| Task | Go to |
|---|---|
| Page layout, header, footer, page routing | `site-kit/components/Site.astro`, `site/src/pages/*` |
| Cartridge look (shell, pins, sticker, ghost cover) | `site-kit/components/Cartridge.astro` |
| Shelf, console, idle mini-game, board overlay CSS | `site-kit/components/CartridgeShelf.astro` |
| Plug/boot/launch/return/swap/eject logic, idle game, hero hooks | `site-kit/client.ts` |
| Cross-game links (swaps) | `site-kit/swap.ts` (`swapHref`) |
| Hero art / hero mini-game | `site-kit/components/HeroScene.astro`, `site-kit/hero-game.ts` |
| Game pages / Battlefield info page | `site-kit/components/GameSection.astro`, `BattlefieldDetail.astro` |
| Style guide + case study | `site-kit/components/StyleGuide.astro` |
| Under the hood page (live labs + engine HUD) | `site-kit/components/UnderTheHood.astro`, `site-kit/lab.ts` |
| Shared tokens, global buttons, layout | `site-kit/style.css` |
| Engine runtime, touch controls | `src/runtime.ts`, `src/touch-controls.ts` (then `npm run sync:games`) |
| Which game versions the hub ships | `games.json`, `battlefield.json` |

**Invariants: don't break these**

- The console never moves on launch. Launch and return start from the same seat (exact reverse).
- Return state lives in the URL (`?play=` / `?board=` / `?next=` + `#console`) and is read before first
  paint by the inline head script in `Site.astro`.
- Cross-game links are swaps (`swapHref`), never plain jumps.
- One cartridge at a time. While one is busy (flying, loading, launching, ejecting), other cartridges
  refuse with a wiggle (`refuse()`) and never follow their links. While the console waits for input,
  tapping the seated cartridge (or Esc) ejects it (`waiting.pull()`). Keyboard Enter is never eject.
  On phones the row is also locked to vertical panning while busy (`.shelf[data-plugging]{touch-action:pan-y}`);
  scripted centring still works.
- The 3D press rule (section 4) holds for every 3D control: the base never moves, the press lands
  exactly, selected stays pressed, and there's no overshoot easing.
- Only transforms and opacity move in hot paths. One layout read per gesture. Pause offscreen
  (`data-motion`). Respect `prefers-reduced-motion` (navigation becomes plain links).
- Name JS state classes distinctly (`is-…`) so scoped component rules can't match them.
- Never edit a game's `shared/` by hand. Change the owner (`src/` here), then sync.
- A release is package.json + both top-level lock fields + CHANGELOG + `site/config.json` `kitVersion`
  in one commit. CI tags `v<version>`. Pin a game or Battlefield only after its tag exists.

**Verify before you push**

```bash
export CHROMIUM_PATH=/path/to/chromium   # if Playwright's bundled browser isn't available
npx tsc --noEmit
npm run site:build && npm run site:test:browser     # Node 24
npm run check && npm run test:browser               # when src/ (engine) changed
```

When you touch motion or buttons, also measure in a browser. A screenshot isn't proof: check rects
and shadows at rest, on hover and on press, and watch transitions frame by frame on desktop and on
a 390px phone viewport.

**Keeping this file current:** update `HANDOFF.md` and `FUTURE.md` in the same change whenever
behaviour, architecture or workflow changes. Every repo keeps both files.

---

- **Live hub:** https://coded-dot-design.github.io/dom-virus/
- **Full game:** https://coded-dot-design.github.io/dom-virus/battlefield/
- **Style guide:** https://coded-dot-design.github.io/dom-virus/style-guide/ (brand, tokens, 3D rule, motion, components, case study)
- **Original one-page site (archived, unlinked from nav):** https://coded-dot-design.github.io/dom-virus/archive/
- **Phase 1 tag:** `phase-1` in every repo (hub `v0.27.0`)

## 1. What this is

DOM VIRUS is a set of tiny arcade games that play on the page you are reading. Headings, buttons
and paragraphs become terrain, food, enemies and cover. The hub site is itself the showcase: navigation
is a game (cartridges, a console), every surface obeys one 3D press rule, and motion is cheap
(CSS + WAAPI transforms) so it stays smooth on phones.

**Where it comes from (the "why" behind every game):** Bolo, played in a middle-school engineering
tech class, on a room of networked Macs. The hook was the networking: your machine reaching into
someone else's screen, which is exactly what a DOM VIRUS game does to a page. Keep the story simple
when writing copy: curious, hands-on, smart without showing off. No dates, places or "N years later"
maths; it shouldn't read as a memoir. It is told on the Under the hood page (lab 00). That's also why
multiplayer is on the roadmap (see FUTURE.md).

## 2. Repositories

| Repo | What | Phase 1 version |
|---|---|---|
| `dom-virus` | Shared engine (`src/`), the hub site (`site-kit/`, `site/`), pins, playground | 0.27.0 |
| `sherman-bytes` | Tank game (engine game) | 0.5.2 |
| `null-invaders` | Shooter (engine game) | 0.7.2 |
| `byte-runner` | Maze chase (engine game, 4-way stick) | 0.10.2 |
| `swarm-protocol` | Point-and-tap defense (own widget, not the engine runtime) | 1.3.1 |
| `dom-battlefield` | Separate full-screen app layered on Sherman's sprites | 0.6.8 |

The game repos no longer host their own websites; their Pages workflow deploys a redirect to the
hub page. Each keeps `site/game.json` (and `site/art.json`) as the source of its copy and art.

### How code flows

1. **Engine:** edit `dom-virus/src`. `npm run sync:games` builds the engine and copies
   `dist/index.js`, the React adapter, the declarations and the builder into each engine game's `shared/`, with
   `ORIGIN.json` (version and SHA-256). Then rebuild, test and bump each game.
2. **Battlefield:** pulls its owning-source snapshots with `node scripts/sync-shared.mjs`
   (Sherman sprites, the selection lock, audio). It never edits `shared/` directly.
3. **Hub pins:** `games.json` (engine game tags) and `battlefield.json` (Battlefield tag). The hub
   build clones the pinned tags. The build fails if the Battlefield pin doesn't match a sibling checkout's
   version, so pin after the tag exists.
4. **Releases:** CI tags `v<package.version>` on main when checks pass. Bump `package.json`,
   both top-level `package-lock.json` fields and the CHANGELOG (or the README changelog for
   Battlefield) in the same commit. For the hub, also bump `site/config.json` `kitVersion`.
   Only those two lock fields: never search-and-replace a version string across the lockfile.
   Dependencies share version numbers (esbuild and scheduler are 0.28.x), and a global replace
   breaks `npm ci` in CI (this happened at 0.28.3). `npm version <x> --no-git-tag-version` is safest.

### Custom domain (domvirus.com)

The build reads two optional repo variables (Settings → Secrets and variables → Actions → Variables):
`SITE_URL` (e.g. `https://domvirus.com`) and `SITE_BASE` (`/`). Unset, the site builds for
`coded-dot-design.github.io/dom-virus/`. Switch order: DNS records → Pages custom domain → set both
variables → re-run "Deploy product page". The hub rewrites Battlefield's absolute hub links to
same-origin paths at build time (`scripts/prepare-battlefield.mjs`). Old github.io links redirect.

### Commands (hub)

```bash
# Node 24 is required for Astro (CI uses it).
npm run site:build            # typecheck site-kit, prepare data, astro build, verify
npm run site:test:browser     # the big site browser test (Playwright, Chromium)
npm run check                 # engine: typecheck, unit tests, build, package types
npm run test:browser          # engine games' browser tests (touch controls, audio…)
npm run sync:games            # engine -> null-invaders, byte-runner, sherman-bytes
```

In a sandbox, point Playwright at a preinstalled Chromium with
`CHROMIUM_PATH=/path/to/chrome`. The tests read it.

## 3. The hub UX: cartridge console navigation

The original site was one long page with every game, the engineering notes and the embed docs, so
every game competed with every other. Phase 1 turned navigation into play.

- **Shelf:** each game is a physical cartridge (`Cartridge.astro`). DOM Battlefield is in slot 02
  as a special edition (sticker, two console LEDs).
- **Plug in:** clicking a cartridge flies it to the console (one WAAPI animation). It slides
  behind the console's flat top edge, always the same depth (just past the pins, measured without
  any hover lift). Then a click and power-on chirp (tiny WebAudio), the LED lights, and the screen boots
  in the game's colour.
- **Actions are the cartridge's rules.** `actions` on a cartridge map to console pads. One action
  means "PRESS START" (auto-starts). Several actions means the screen lists coloured chips in the pads'
  physical order (BLUE INFO, RED LAUNCH) and waits.
- **Start:** the screen flashes, says LOADING GAME / LOADING INFO (about a third of the time it's a
  "stubborn cartridge" joke first, e.g. BLOWING ON PINS), then:
  - **Page launch:** the console screen morphs into the game page's display (cross-document View
    Transition, `view-transition-name: game-screen`).
  - **Full game:** the screen grows to the viewport and a board folds open, then the app loads.
- **The console never moves.** Launch and return start from the same seat, so the way back is an
  exact reverse. (Phase 1 learned this the hard way: a "slide into the drawer" launch made returns
  look broken.)
- **Return:** leaving rewrites the home URL to `?play=<id>#console` (or `?board=<id>`). Game pages'
  "Eject cartridge" links use the same URL. An inline head script reads it before first paint and
  marks `html[data-return]`, hides the cartridge until seated, and names the screen for the View
  Transition. The page arrives docked: the screen morphs back (or the board folds shut), then the
  cartridge ejects and flies home. Then the URL is cleaned to `#games`.
- **Swaps:** links from one game to another never skip the console. `swapHref(base, from, to)`
  (`site-kit/swap.ts`) → `?play=<from>&next=<to>#console`: eject the first, plug in the second, press
  its A for you. Used for Sherman ⇄ Battlefield.
- **Empty spot:** while a cartridge is out, its bay shows a dashed outline with a muted cover (icon,
  name, number), so the shelf remembers.
- **Phones (≤860px):** the shelf is a horizontal swipe row (scroll-snap). A scroller clips its content,
  so the flying cartridge is lifted into `.flight-deck` at exactly its spot (its bay keeps the
  space) and put back after the eject. A tapped cartridge that's half off-screen pulls its spot to the
  middle while it flies. On return the row centres the spot before the eject. Phone cartridges are
  sized from the console (half its width) so they never change size when plugged in.
- **Idle console:** with nothing plugged in it's a tiny game. Good and bad guys roll by; A fires at a
  crosshair (HITS or OOPS!), B or a tap makes the middle one jump.
- **Hero:** a CSS loop for everyone. The first tap lazy-loads a contained mini-game (`hero-game.ts`)
  with BUTTON_01 as a nuke. A "try me" bubble appears only if someone lingers without touching it.

## 4. Design system (see the style guide page for the live version)

- **The 3D rule:** every 3D surface is a top over a hard base (`S px S px 0`).
  - Hover (fine pointers only) lifts the top `(-h,-h)` and grows the shadow by `h`, so the base never moves.
  - Press lands exactly on the base: `translate(S,S)`, shadow 0.
  - Selected (`aria-pressed`, `aria-current`) stays pressed and never lifts.
  - Transform and shadow share one duration and curve, with no overshoot easing (overshoot = wobble) and no `scale()`.
  - Site buttons use S=3/h=2. The eject key uses S=2. Battlefield documents its families with `--px/--py/--hx/--hy`.
- **Cartridge:**
  - Front face in the accent, a darker 7px right side face and a 6px bottom face, mitred at the corner.
  - The notch and the bottom-left chamfer are 45°, with outline offsets calculated so the 2px outline stays even.
  - Edge-connector pins wrap under the cartridge, skewed 45°.
  - Deterministic wear per cartridge index, and a skull sticker per cartridge (different spot, tilt and peel).
- **Console:** flat top (its top face isn't visible from this angle), a 14px 45° pink extrusion
  (twice the cartridge side) built from 1px box-shadow layers with two darker ridge layers, and an ink rim.
- **Header/footer:**
  - Square 3D icon keys: Games (cartridge, with a gold count badge, toggles `#games`), Under the hood (chip), theme. The current page is pressed.
  - Detail pages: Play stands alone. Cross-game swaps live in a `CrossPromo` card ("Next on the shelf") further down; GitHub lives with the code (the expanding `IconKey`, "Install guide"). Every `.button` shares one shape: 2px ink border, 9px corners, 46px, 3px base.
  - The footer has the skull mark, the style guide and GitHub keys, and "Created by Chris Cooley" (LinkedIn) / "© <build year> coded.design · Open source (MIT)". The year is stamped at build.
- **Voice:** short, playful, arcade: "Pick a cartridge.", "INSERT CARTRIDGE", "Eject cartridge".

## 5. DOM game engineering: what we learned

### Performance

- **Only transforms and opacity move.** One layout read per gesture or flight (`getBoundingClientRect`
  at the start), then WAAPI or CSS does the rest. No layout reads in `pointermove`.
- **WAAPI with `fill: "forwards"`** holds positions without inline styles, so transitions don't fire.
  Use a 1ms two-keyframe animation to "seat" an element instantly. `composite: "add"` layers a
  movement on top of an existing hold.
- **Offscreen pause:** an IntersectionObserver sets `data-motion` and CSS runs loops only when
  `data-motion="true"`. Illustrations sleep when you scroll away.
- **Lazy everything:** the hero mini-game is a dynamic import on first pointerdown. Games load on Play.
- **CSS `steps()`** gives pixel-art marching loops nearly free.
- **Sizes stay small:** engine games are ~23–30 KB gzip each, and Battlefield is ~29 KB gzip for the whole app.

### Pitfalls (each one bit us)

- **Scoped class collisions:** a scoped `.loading{display:none}` (for the loading text) also matched
  the console when it got a `loading` state class. The console vanished and the transition broke. Name
  state classes distinctly (`is-loading`), and there is a regression test.
- **Astro scoped styles don't reach child components or JS-made elements.** Use `:global()` (e.g. for
  `PixelTank` internals in the hero, JS-toggled classes, created nodes).
- **Global button rules win specificity fights.** `:root :is(button,.button):hover/:active` overrode
  component buttons (zero-size console pads, wobbly presses). Use `:where()` or plain spans for
  decorative controls, and audit with a browser script.
- **Hover can override press.** If `:hover` is more specific than `:active`, clicking never sinks.
  Make press rules at least as specific, or exclude `[aria-current]` from hover.
- **Measure without hover.** Clicking a hovered cartridge measured a lifted rect, so the depth varied.
  Force `transform: none !important` while measuring.
- **Scroll containers clip flights.** Lift the flying element out (same spot), then put it back.
- **View Transitions:**
  - Both pages must opt in, and the named element must exist on both sides.
  - Name the console screen only while leaving or returning.
  - Ancestor opacity isn't in the snapshot, so don't fade parents.
  - `pagereveal` must be caught by an inline head script to be reliable.
- **bfcache:** a page restored mid-launch fires `pageshow` with `persisted`. Rewind from that
  state rather than resetting (cancel animations, re-dock, then play the reverse).
- **iOS:**
  - Safari ignores `user-scalable=no`. Use `touch-action` and block `gesturestart`/`gesturechange`. A quick second tap on non-controls is `preventDefault`ed on `touchend`; games read pointer events, so play is unaffected.
  - Home Screen icons must be PNG and full-bleed, because iOS rounds and clips borders.
- **Easing:** overshoot curves (`cubic-bezier(…1.5…)`) make 3D buttons wobble through their base.
  Keep presses on monotonic curves and save the bounce for non-pressable things.
- **Test flakes come from timing, not logic.** Wait for counters or state, not values that can change
  again within a frame (e.g. the hero score after a reset; use the `resets` counter).

### Touch controls (engine)

`src/touch-controls.ts` is the shared Battlefield-style kit:

- An analog stick mapped to arrow keys: 8-way, or 4-way for grid games, with deadzone and sector hysteresis.
- Pointer capture, and multi-touch with Fire held.
- The `bindPress` `.down` class, because touch `:active` is unreliable.
- Fire, primary and secondary button markup, and the CSS.

Games opt in via `GameDefinition.touch` (`stick: "4way"`, `primary`). Battlefield still has its own
stick implementation (same look). Unifying them is Phase 2.

## 6. Testing

- `tests/site-browser.mjs` drives the real built site, covering:
  - shelf order and hrefs;
  - plug, boot, loading, launch, Back and eject;
  - two-way cartridges (RED/BLUE);
  - the board launch and return;
  - the Eject link reverse;
  - the swap flows;
  - the phone swipe row (lift-out, centring, return into its bay);
  - the idle console game;
  - the hero mini-game and nuke;
  - the header toggle and badge;
  - footer states;
  - the style guide;
  - overflow at 320–1440px in both themes;
  - reduced motion.
- **Button audits:** during Phase 1 we measured every 3D button (rest, hover, press) in a browser:
  the base must not move, and the press must land exactly. It found real bugs every time. Phase 2
  should make it a CI test.
- Engine: `npm test` (unit, including touch-control mapping) and `npm run test:browser` (touch,
  audio, game smoke tests). Battlefield: `npm run check`, `npm run size`, `npm run test:browser`.
