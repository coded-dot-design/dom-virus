# DOM VIRUS · coded.design

## Play and develop the Astro site

Product page: https://coded-dot-design.github.io/dom-virus/ (available after Pages is enabled and the deployment succeeds). Created by **Chris Cooley / coded.design**.

Use Node **24** (`nvm use`), then run from this repository, where `package.json` lives:

```sh
npm ci
npm run dev
```

Open the exact local URL Astro prints, including the `/dom-virus/` base path. `npm ci` uses the committed lockfile. `npm run dev:playground` keeps the original Vite regression playground available. The product site loads built game distributions; after editing game source, run `npm run build` and restart `npm run dev`.

```sh
npm run check
npm run site:build
npm run site:preview
```

`site:build` writes static output to `artifacts/site` and checks the launch script, styles and Pages asset paths. Pages builds run on every push to `main`; PR checks also build the product site. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**. No custom domain or paid hosting is required for this public repository. If the deploy job ran before enabling Pages, rerun that failed job afterward.

The page defaults to your system color scheme, with persistent light/dark overrides. Game launches are explicit and lazy-loaded. Recall destroys the active controller and restores eligible game-owned edits. Menu controls, code examples and the launcher are excluded from game targets.



**The page is the game board.** A local arcade playground and small shared runtime for four independently usable MIT-licensed games.

| Game | Play |
| --- | --- |
| [Swarm Protocol](https://github.com/coded-dot-design/swarm-protocol) | Defend letters and buttons from an evolving bug swarm. |
| [Null Invaders](https://github.com/coded-dot-design/null-invaders) | Fly through a webpage, corrupt letters into binary, and destroy alien factories. |
| [Byte Runner](https://github.com/coded-dot-design/byte-runner) | Eat letters, collect power orbs, and turn the tables on button-spawned ghosts. |

This first cut is a development playground. The public launcher and Chrome extension are future work. Swarm remains its existing v1.1.0 implementation and API.

## Run all four games

Use Node **22.12+** or Node 24, npm, and Git:

```sh
git clone https://github.com/coded-dot-design/dom-virus.git
cd dom-virus
npm ci
npm run dev
```

Open the URL Vite prints, normally **http://127.0.0.1:5173**. Choose a cartridge and select **Launch game**. The default fictional page needs no target attributes: headings, paragraphs, list text, buttons, and button-style links are automatically selected within its board.

On the first run, the setup script clones the game versions in `games.json` into `.games/`. It does not install their development dependencies or execute their install scripts. GitHub is accessed during setup; the running playground uses local files only.

If sibling checkouts named `null-invaders`, `byte-runner`, or `swarm-protocol` are present, the playground uses those sources instead. This lets you iterate across separate repositories with Vite reloads. Managed copies use `.games/<game>/<version>/`, so changing a pin fetches a fresh version without touching old copies. Sibling checkouts take priority; pull all sibling repos together. An older sibling source layout reports the exact pull command instead of failing later in Vite.

## Controls and scenarios

- Null Invaders: mouse movement or arrows/WASD; hold click or Space to fire. Combat XP upgrades the gun from one to four shots within a wave; the run has four waves.
- Byte Runner: arrows/WASD. Every six fresh letters spawns an orb nearby. Collect it to stop spawning and eat ghosts for six seconds; stacked power is capped at nine seconds. Glitch fruit appears periodically.
- Swarm Protocol: click/tap bugs to defend the page. Its original behavior and controls remain intact.
- New games: **P** pauses/resumes, **G** jumps to the next offscreen gate, **Escape** recalls the page. Coarse-pointer devices receive on-screen directional controls and an auto-fire toggle for the shooter.
- Recall removes the game and restores its owned effects. Switching cartridges does the same before loading the next game.

The scenario picker supports generic page detection, explicitly marked targets, letters only, and a nested scrolling room. The form is intentionally protected. The page and game HUD follow system light/dark preferences. Reduced-motion preference suppresses decorative particles and idle pulses without disabling essential gameplay movement.

For local inspection, `window.playground.getSnapshot()` returns the current game's snapshot. This global exists only in the development playground; game packages add no globals.

## Update existing local checkouts

From the folder containing all four repositories, pull each game and the playground, then install from the committed lockfile:

```sh
git -C null-invaders pull --ff-only origin main &&
git -C byte-runner pull --ff-only origin main &&
git -C swarm-protocol pull --ff-only origin main &&
git -C dom-virus pull --ff-only origin main &&
cd dom-virus && npm ci && npm run dev
```

If an initially empty clone has an untracked `package-lock.json`, move that file outside the clone before pulling. Do not replace the repository's committed lockfile with it. `npm ci` requires the committed `package.json` and `package-lock.json`.

## Independent packages

Each new game repository provides a separate npm-compatible package, a self-contained `dist/index.js`, an optional `/react` adapter, its own Vite page, MIT license, tests, and size check. The shared runtime is bundled into each built game, so a consumer needs only the selected game. No runtime download from this repository is required.

The runtime source is maintained once in this repository. Games pin a generated runtime snapshot with a source fingerprint and bundle it during a release. Runtime changes do not silently change already released games.

## TypeScript and the shared engine

Engine and both new games use strict TypeScript with unchecked-index and exact-optional-property checks. Declarations are generated from implementation sources. TypeScript, test tools and development dependencies are absent from the browser bundles.

- `src/contracts.ts`: typed definitions, simulation context, board, input, configuration, controller and game-specific snapshots.
- `src/runtime.ts`: one animation loop, input, lifecycle, HUD, accessibility preferences and cleanup. Games declare capabilities such as `fire`; the engine does not check game IDs.
- `src/board.ts` and `src/ledger.ts`: target discovery, cached glyph geometry, controlled mutations and compare-before-restore behavior.
- `src/entities.ts`: bounded reusable entity pools, visible/live factory selection and scroll translation.
- `src/arcade-hud.ts` and `src/target-effects.ts`: opt-in score panel, health fills, impact ripples and beacon presentation. Null Invaders uses these; Swarm retains its existing implementation.
- `src/react.ts`: optional shared effect adapter, tested with real React StrictMode mounts and cleanup.

Each game supplies a `GameDefinition` and `GameSimulation`: reset, update, draw and snapshot, plus optional scroll handling. Rules, player/enemy types and procedural artwork belong to each game. Swarm Protocol retains its existing engine/API for this migration.

Game distributions bundle a generated engine snapshot, so they stay independently installable. Author engine code here; never hand-edit `shared/` in a game. To update snapshots and build all distributions with sibling repos present:

```sh
npm run sync:games
npm --prefix ../null-invaders run check
npm --prefix ../byte-runner run check
npm run check
npm run test:browser
```

To update only one game, run `npm run build:engine && node scripts/sync-games.mjs null-invaders`. This leaves the other game’s pinned snapshot unchanged.

`sync:games` generates the JavaScript engine, optional React adapter, declaration files and shared game builder. Each game's `shared/ORIGIN.json` records the engine version and source hash. Game builds always use that snapshot; Vite uses sibling source for live iteration. Commit snapshot updates with the affected game release.

## Target configuration

Both new factories accept these options. Passing no options uses the current document body and the defaults below:

```js
const game = createNullInvaders({
  root: 'main', // Element or CSS selector
  textSelector: 'h1,h2,h3,h4,h5,h6,p,li,blockquote,[data-virus-text]',
  targetSelector: 'button,[role="button"],a.button,a.btn,[data-virus-target]',
  excludeSelector: '[data-virus-ignore]',
  domMode: 'visual', // default; 'text' opts static content into real text changes
  binaryStyle: 'native', // Null Invaders default; 'neon' is also available
  targetEffects: 'liquid', // Null Invaders default; 'fade' is also available
  theme: 'system',
});
game.start();
```

Explicit selectors replace their corresponding defaults. Forms, editable fields, code/preformatted text, live regions, dialogs, and game controls are protected by the engine. Protected areas remain excluded even if a broad selector matches them. Ordinary text links are excluded from text consumption. Hidden/clipped targets are not active spawn points. A page without buttons falls back to edge spawns so the letters-only scenario is playable.

## How it works

- One small host with Shadow DOM contains the canvas and HUD. The board adapter intentionally reads selected elements in the host document. Shadow DOM is style encapsulation, not a security sandbox.
- Text is indexed as grapheme clusters with `Intl.Segmenter`, avoiding accidental splits in emoji and combining characters. Ranges supply positions without inserting a span around every letter.
- Default visual effects use CSS Highlights to conceal consumed glyphs, with cached binary replacements painted on canvas. React retains ownership of its text nodes. The optional `text` mode edits selected static text directly and records originals.
- The mutation ledger compares the current value with the last game-written value before restoration. A newer host update wins. Destroy never replaces a container's HTML or recreates a button.
- Canvas characters are original procedural shapes. A small shared loop handles time, input, cleanup, and effects. Game simulations own enemy behavior, scoring, and win/loss rules.
- Geometry refreshes are throttled and bounded. Glyph collision uses a spatial grid, and projectiles use swept tests to avoid skipping thin letters.

## Validation

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Browser tests start and stop their own Vite server. Set `CHROMIUM_PATH` if using an existing Chromium binary. They cover all three games, movement, pause, switching, generic exclusions, nested clipping, visual/direct text modes, host updates, repeated cleanup, ghost power timing, wave progression, mobile page width, typed game capabilities, native-font binary replacements, liquid damage/restoration, reduced-motion feedback, light/dark/mobile shooter HUDs, and real React StrictMode mount/update/unmount cleanup. Screenshots and sampled frame-work measurements are written to `artifacts/`.

See [PERFORMANCE.md](PERFORMANCE.md) for limits and measurement scope, and [REFERENCES.md](REFERENCES.md) for the implementation study.

## First-cut boundaries

The two new games target modern browsers with Canvas 2D, Shadow DOM, `Intl.Segmenter`, and CSS Highlights. The visual mode requires CSS Highlights; older browsers can explicitly use text mode on static opted-in content. This is not yet a cross-browser certification. Cross-origin frames and closed shadow roots are outside the board. Aggressively transforming pages, virtualized content, and hostile styles need additional fixtures before making broad compatibility claims.

No external fonts, images, sound files, telemetry, account, or backend are required. Chrome extension permissions, store packaging, persistent settings, and a public launcher are deferred.

MIT © 2026 Chris Cooley. Brand: coded.design.

## Version tags

After checks pass on `main`, CI creates the tag matching `package.json` (for example `v0.2.0`) if it does not already exist. Existing tags never move. Bump the package version for the next release.

Sherman Bytes is the fourth game: capture button bases with an M4-inspired pixel tank. Its engine snapshot adds opt-in `binaryOpacity`; other games keep their existing engine snapshots.
