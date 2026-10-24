# DOM VIRUS site kit

Created by Chris Cooley / coded.design. MIT licensed.

The canonical kit is `site-kit/`, versioned by `site/config.json`. Run `npm run sync:sites` with the three sibling game repositories present to copy it into each repo's `site/shared/`. The generated `ORIGIN.json` records the kit version and source SHA-256. Commit those copies; game websites build independently and never fetch UI components at runtime. Keep the kit version in sync when publishing changes to its contract.

Each game owns `site/game.json`: gameplay facts, controls, source links and integration example. The hub resolves versions from `games.json`; local sibling checkouts take precedence to support coordinated development. A standalone clone fetches the pinned game tags under `.games/`. Swarm's ignored distribution is built on demand. Optional `contentRefs` in `site/config.json` pin a newer game description independently of the selected game release; an explicit content pin takes precedence over the bundled description. Fetching that JSON never changes the game checkout. The site records the versions actually measured, which may differ from the pins during local development.

The kit's preparation script measures built distributions and generates a static data file plus a dynamic-import registry. The browser loads only the chosen game. Astro renders content without a client framework; the small TypeScript launcher handles themes, loading races, Pause, Recall and code copying. `site/**` and `site-kit/**` are marked as side-effectful so bundlers retain page scripts and styles; shipped game entrypoints remain tree-shakable.

## Release discipline

Use SemVer for the package version and immutable `vX.Y.Z` tags for tested releases. Update lockfiles with every dependency change. Null Invaders, Byte Runner and DOM VIRUS tag new versions only after their check workflow passes. Swarm's existing release workflow verifies the exact version and source before publishing a tag and downloadable assets. Site-kit metadata versions the reusable UI separately.

For coordinated changes: publish game repositories first, wait for checked version tags, then update `games.json` and publish the hub. Do not point a released hub at floating branches. A website-only deployment does not require republishing an npm package. GitHub Pages deployment never publishes to npm.

## Hosting and local testing

Node 24; `npm ci && npm run dev`. Follow the printed URL. To build the public page run `npm run site:build`; to preview its production files run `npm run site:preview`. Set `SITE_BASE=/` only for a root-mounted preview. The default base is the repository name for GitHub Pages.

Enable GitHub Actions as the Pages source once per repository. The `Deploy product page` workflow runs package checks, builds the site, validates its static assets and uploads `artifacts/site`; only then can its least-privilege deploy job publish. Build checks also run on pull requests.

## Honest measurements

Raw and gzip package byte counts are generated at build time, not hard-coded. Swarm's complete immediate import graph includes dynamically reached game chunks, with each reachable file counted once; its static graph is shown separately. Counts exclude Astro, React adapters, network headers and caching. They are package download estimates, not this site's chunk layout or device FPS.

Swarm keeps its established simulation. The two newer games share the DOM VIRUS engine snapshot. Shadow DOM provides style encapsulation, not a security boundary. Visual text mode requires CSS Custom Highlights; static hosts can explicitly opt into direct text mode. Recall restores only still-owned mutations and cannot undo application writes.

## Release testing and automatic refresh

The hub's release picker loads historical distributions from `site/releases.json`. Every entry pins a tag **and** commit; builds fail if the tag moves. Old modules live under `releases/<game>/<version>/` with an emitted `release.json` containing commit and file SHA-256 hashes. They never use the current engine. The initial archive offers Null Invaders 0.3.0, Byte Runner 0.2.0, and Swarm Protocol 1.0.13. Add older tags explicitly after checking their API compatibility. The visible technical notes describe the current release; the session bar identifies the selected build.

Each game's main push deploys its own latest site after checks. The hub's Pages job also runs hourly (GitHub scheduling can be delayed), resolves the newest stable version tag in each configured major line, verifies the cloned commit and package version, and rebuilds. This needs no cross-repository write token. Local and PR builds keep using `games.json` pins. Set `DOM_VIRUS_LATEST_RELEASES=1` on a standalone clone to reproduce automatic selection; the actual displayed versions and CI logs identify what was built. A new major version requires explicitly updating the configured line.
