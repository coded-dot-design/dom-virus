# DOM VIRUS: Future phases

A running list. Phase 1 (the hub, five games, the cartridge console) is tagged `phase-1`; see
[HANDOFF.md](HANDOFF.md). Add items as they come up; move them to a CHANGELOG when shipped.

## Cleanup carried over from Phase 1 (small, do first)

- **Swarm Protocol releases:** CI tags are created with the workflow token, so they don't trigger
  `release.yml`. The last GitHub release (zip + npm tarball) is v1.2.3; v1.2.4–v1.3.1 are tags only.
  Fix with a PAT/App token or by having `release.yml` run on `workflow_run`. Also: add the missing
  CHANGELOG 1.3.1 entry, align Node 22 → 24 in `release.yml`, and add `shared/ORIGIN.json`.
- **Game READMEs** (Sherman, Null, Byte Runner, Swarm) still describe the retired per-game Astro
  sites (`site:build`, `site:preview`, `npm run dev`) and the old size budgets; refresh them.
- **Stale "D-pad" copy** in Sherman and Byte Runner `site/game.json` and in the Byte Runner and Null READMEs; the
  controls are a joystick now.
- **Null Invaders:** the in-game hint says "G: next gate", but the game page says "G — next factory". Pick one.
- **CHANGELOG order** in Null and Byte Runner: a stray version heading sits above `# Changelog`.
- **Byte Runner:** the CHANGELOG says flies cap at 8, but the code (`MAX_GHOSTS`) caps at 12. Byte Runner is
  also the only engine game without a simulation test. Its size headroom is under 1 KB (29.2 of 30 KB).
- **Battlefield:** `shared/ORIGIN.json` version labels are stale (the hashes match); re-run `node scripts/sync-shared.mjs`.
- **Hub pins:** the hourly hub build already follows the newest tag in each pinned major line (all v0),
  so a new game tag reaches the hub before `games.json` is bumped. Decide whether pins should be exact.

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
