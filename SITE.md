# DOM VIRUS site kit

Created by Chris Cooley / coded.design. MIT licensed.

The site kit (`site-kit/`) now serves only the DOM Virus hub. The individual game websites are retired: each game has one page on the hub (`/games/<id>/`), and its GitHub README holds the full technical details. Game repositories keep only their content (`site/game.json`, plus `site/art.json` for character art); their GitHub Pages address redirects to the hub page. `npm run sync:sites` now only refreshes the hub's character art from sibling checkouts.

Hub pages: home (hero + cartridge shelf), `/games/<id>/` for each game, `/games/battlefield/` (how Battlefield is layered on Sherman Bytes; launches `/battlefield/`), `/under-the-hood/` (engine-wide engineering and embedding), and `/archive/` (the original one-page layout, kept for the record). Page changes use cross-document View Transitions.

Each game owns `site/game.json`: gameplay facts, controls, source links and integration example. The hub resolves versions from `games.json`; local sibling checkouts take precedence to support coordinated development. A standalone clone fetches the pinned game tags or full commit SHAs under `.games/`. Swarm's ignored distribution is built on demand. Optional `contentRefs` in `site/config.json` pin a newer game description independently of the selected game release; an explicit content pin takes precedence over the bundled description. Fetching that JSON never changes the game checkout. The site records the versions actually measured, which may differ from the pins during local development.

The kit's preparation script measures built distributions and generates a static data file plus a dynamic-import registry. The browser loads only the chosen game. Astro renders content without a client framework; the small TypeScript launcher handles themes, loading races, Pause, Recall and code copying. `site/**` and `site-kit/**` are marked as side-effectful so bundlers retain page scripts and styles; shipped game entrypoints remain tree-shakable.

## Staging and production

A build is **production** when it serves the URL in `targets.production` of `site/engine.config.json` (https://domvirus.com), **staging** otherwise (github.io, local and PR builds). `site-kit/lifecycle.mjs` reads the content model: a game whose status is not `published` (DOM Kaiju) shows on staging only. Production leaves out its cartridge, cards, page, the posts its model relations tie to it, its sitemap and llms.txt rows, and any engine-page sentence, card or stat that names it; `$whileHidden` in `site/redirects.json` keeps its old URLs while it is hidden. `npm run site:test:lifecycle` checks the built site for either target.

## Release discipline

Use SemVer for the package version and immutable `vX.Y.Z` tags for tested releases. Update lockfiles with every dependency change. Null Invaders, Byte Runner and DOM VIRUS tag new versions only after their check workflow passes. Swarm's existing release workflow verifies the exact version and source before publishing a tag and downloadable assets. Site-kit metadata versions the reusable UI separately.

For coordinated changes: publish game repositories first, wait for checked version tags, then update `games.json` and publish the hub. Do not point a released hub at floating branches. Draft integration builds may pin exact candidate commit SHAs so they can be checked before the game release tags exist. A website-only deployment does not require republishing an npm package. GitHub Pages deployment never publishes to npm.

## Hosting and local testing

Node 24; `npm ci && npm run dev`. Follow the printed URL. To build the public page run `npm run site:build`; to preview its production files run `npm run site:preview`. Set `SITE_BASE=/` only for a root-mounted preview. The default base is the repository name for GitHub Pages.

Enable GitHub Actions as the Pages source once per repository. The `Deploy product page` workflow runs package checks, builds the site, validates its static assets and uploads `artifacts/site`; only then can its least-privilege deploy job publish. Build checks also run on pull requests.

## Honest measurements

Raw and gzip package byte counts are generated at build time, not hard-coded. Swarm's complete immediate import graph includes dynamically reached game chunks, with each reachable file counted once; its static graph is shown separately. Counts exclude Astro, React adapters, network headers and caching. They are package download estimates, not this site's chunk layout or device FPS.

Swarm runs its rules on the Fizlet kernel since 1.4.0. The two newer games share the DOM VIRUS engine snapshot. Shadow DOM provides style encapsulation, not a security boundary. Visual text mode requires CSS Custom Highlights; static hosts can explicitly opt into direct text mode. Recall restores only still-owned mutations and cannot undo application writes.

## Release testing and automatic refresh

The hub's release picker loads historical distributions from `site/releases.json`. Every entry pins a tag **and** commit; builds fail if the tag moves. Old modules live under `releases/<game>/<version>/` with an emitted `release.json` containing commit and file SHA-256 hashes. They never use the current engine. It lists every released tag of every game (`npm run sync:releases`, from each arcade game's first hub-compatible tag in `scripts/releases-catalog.mjs`); `npm run site:test:releases` fails while one is missing. The build skips the release it serves as Current and marks a tagged release newer than Current `newer`. DOM Battlefield and Battlefield Blitz are listed too; their builds are served by their own sites (Battlefield: `/v/<version>/`), never bundled into the hub. The visible technical notes describe the current release; the session bar identifies the selected build.

Each game's main push deploys its own latest site after checks. The hub's Pages job also runs hourly (GitHub scheduling can be delayed), resolves the newest stable version tag in each configured major line, verifies the cloned commit and package version, and rebuilds. This needs no cross-repository write token. Local and PR builds keep using `games.json` pins. Set `DOM_VIRUS_LATEST_RELEASES=1` on a standalone clone to reproduce automatic selection; the actual displayed versions and CI logs identify what was built. A new major version requires explicitly updating the configured line.
