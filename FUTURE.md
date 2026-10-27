# DOM VIRUS: Future phases

A running list. Phase 1 (the hub, five games, the cartridge console) is tagged `phase-1`; see
[HANDOFF.md](HANDOFF.md). Add items as they come up; move them to a CHANGELOG when shipped.

## Cleanup carried over from Phase 1 (small, do first)

Done before launch: game READMEs refreshed, D-pad copy fixed (hub pins the copy commits in
`site/config.json` `contentRefs`), CHANGELOG order, Swarm 1.3.1 entry, fly-cap note, branded 404,
share cards (Open Graph), one `h1` per page. Still open:

- **Swarm Protocol releases:** CI tags are created with the workflow token, so they don't trigger
  `release.yml`. The last GitHub release (zip + npm tarball) is v1.2.3; v1.2.4–v1.3.1 are tags only.
  Fix with a PAT/App token or by having `release.yml` run on `workflow_run`. Also align Node 22 → 24
  in `release.yml` (and `docs/RELEASING.md`, `docs/FIRST-PUBLISH.md`), and add `shared/ORIGIN.json`.
- **Null Invaders:** the in-game hint says "G: next gate"; the site says "G — next factory" (the
  brand word). Change the hint in `src/index.ts` in the next game release.
- **Byte Runner:** the only engine game without a simulation test. Size headroom is under 1 KB (29.2 of 30 KB).
- **Battlefield:** `shared/ORIGIN.json` version labels are stale (the hashes match); re-run
  `node scripts/sync-shared.mjs`. The standalone app (`/battlefield/`) has no share card yet.
- **Changelogs** skip some tagged versions (Byte Runner 0.6.0–0.10.1, Null 0.3.0/0.6.0/0.7.1,
  Sherman 0.3.1/0.4.5/0.5.1). Backfill from git history if wanted.
- **Hub pins:** the hourly hub build already follows the newest tag in each pinned major line (all v0),
  so a new game tag reaches the hub before `games.json` is bumped. Decide whether pins should be exact.
- **Viewport zoom is disabled** (`user-scalable=no`, by request, to stop double-tap zoom). Lighthouse
  flags this for accessibility; the touchend guard in `client.ts` may be enough on its own.
- **Stuck cartridge after eject (fixed in 0.31.0, keep an eye on it):** CI's Chromium kept a
  cancelled animation's seat transform applied (above inline styles, invisible to
  `getAnimations()`; a cloned node was clean). `eject()` now checks the cartridge is at rest and
  swaps in a fresh copy if not. The site test still warns ("Ejected cartridge kept a transform") if
  it ever sees the offset again. Worth filing a minimal repro with Chromium.
- **Custom domain:** set `SITE_URL` and `SITE_BASE=/` in `pages.yml` (see `site-kit/config.mjs`).

## Phase 2: one controls layer, optimisation, hardening

### Controls as a layer (top priority)

Games should focus on gameplay and animation. Controls should be one shared, layered package with
a consistent adapter.

- **Base layer (every game, out of the box):**
  - Keyboard defaults (arrows/WASD, Space, Esc pause, P).
  - Pointer basics and gamepad (Gamepad API).
  - Focus handling and reduced-motion and sound preferences.
- **Mobile layer (opt-in per game):**
  - The touch kit (stick, Fire, primary, secondary).
  - Safe areas, landscape and fullscreen gates.
  - Analog values passed through (not just arrow keys).
- **Extension layer:** a board like Battlefield extends it with its own commands (auto-aim, lock,
  orders, squad) without forking the base. Battlefield moves onto the shared stick, Fire and press code.
- **Ownership:** one place owns styling (tokens + the 3D press rule), behaviour (pointer capture,
  multi-touch, hysteresis) and accessibility labels. Games declare an intent map (`move`, `fire`,
  `primary`, `secondary[]`) and the layer renders the right controls per device.
- **Delivery:** decide between a sibling package (`@coded-design/dom-controls`) synced like the
  engine, or the engine's own module. Either way it gets its own tests, a playground page and a changelog.

### Performance and size

- Prefetch or prerender the game page while a cartridge boots (Speculation Rules or `<link rel=prefetch>`),
  so the morph lands on a ready page.
- Shrink CSS:
  - Dedupe the old layered header/footer rules in `site-kit/style.css`.
  - Move page-specific CSS into components.
  - Measure the critical CSS for the home page.
- Re-tighten the game size budgets after the controls layer lands; the touch kit added ~2 KB to each engine game.
- Share one copy of the engine and controls between games on the hub (one cached chunk), instead of a
  copy per game bundle.
- Lighthouse and Web Vitals budgets in CI (LCP, CLS, INP on a throttled phone profile).

### Quality and hardening

- Turn the 3D button audit into a CI test (every visible 3D control: base fixed on hover, press lands
  exactly, selected stays pressed), plus visual regression screenshots of the key states:
  - the shelf;
  - a seated cartridge;
  - two-way prompt;
  - loading;
  - board;
  - phone row.
- Real-device passes (iOS Safari, Android Chrome, low-end Android) for the swipe row, the double-tap
  guard and the touch controls; a device matrix in the repo.
- Accessibility:
  - Keyboard access to console pads.
  - Screen-reader announcements for console states (booting, loading, choices).
  - Focus order after returns.
  - Contrast checks for both themes.
- Error resilience: if a pinned game fails to load, the console shows a friendly cartridge error
  instead of hanging.
- Content Security Policy for the static site (no inline JS beyond the two documented head scripts,
  or hash them).

### Multiplayer: two players, two pages, one battle (the Bolo promise)

The whole project started with Bolo: two people, two machines, one network, and someone else's tank
on your screen. Single-player DOM games prove the board; multiplayer is what made it feel like magic,
so it's the headline feature for a later version.

- **Why:** it closes the loop on the origin story, it's the most shareable thing a DOM game can do
  ("my page vs. your page"), and it stresses the engine in honest ways (determinism, input latency,
  bandwidth).
- **First cut:** 2-player Sherman Bytes or Battlefield. Peer to peer over WebRTC data channels, with a
  tiny signalling step (share a link or a short code). No game server; the static-site rule holds.
- **Model:** lockstep or rollback on inputs only (needs a fixed-step, seeded simulation first: today only Battlefield is fixed-step, and the core `runtime.ts` uses a variable dt; see ENGINE.md), so a
  packet is a few bytes per tick. Each player's own page is their board; the opponent appears as a
  ghost tank. A shared "arena page" mode for when both should fight on the same document.
- **Couch mode:** two players on one keyboard/pad as the zero-network fallback, which is also how to
  test the rules first.
- **Under the hood:** lab 00 already shows the idea (two Macs, packets on a cable). Once it ships,
  that lab becomes a real link-up demo.

### Product

- More cartridges: the shelf, the count badge and the swipe row are data-driven, so adding a game is
  `site/game.json` plus a pin. Write the "add a cartridge" checklist.
- Generalise swaps and chains (`?next=` can chain any cartridge); maybe a "mash-up" Start action.
- Console idle game: high-score memory (per-viewer), more characters from new games.
- Style guide: export tokens as JSON/CSS for the games and Battlefield to consume (single source).

## Phase 3: platform

- Engine API docs and a "build a DOM game in an afternoon" guide with the playground.
- Embeddable console: drop the cartridge console onto any site as a widget.
- PWA for the hub (offline shelf, Home Screen icon like Battlefield's).
- Awards and press kit: recorded walkthrough, stills of every key state, the case study.
- Telemetry-free play stats (local only) for the idle and hero games.
