# astro-base-engine: suggestions from the DOM VIRUS pilot

Written by the site agent on 2026-10-29 while producing the first engine page for this family
(`/games/sherman-bytes/` on the hub). The engine was **not** changed; every item below was worked
around on the site side, and the workaround is named so the keeper can see the cost. Ordered by impact.
Hand the prompt at the bottom to the astro-engine keeper as is.

## What the pilot did

- Brief `site/briefs/games-sherman-bytes.md` → `abe produce --write` → `abe status … published` →
  `npm run engine:heads` (runs `abe head` per page into `site/src/content/heads/`).
- The site layout injects the head file and maps the page JSON onto existing components
  (lead, Play label, related-game cards, FAQ, "get the code" line). No new visual language.
- Results: `abe audit` 100 (0 errors, 0 warnings); `abe check-html` on the built page 0 errors,
  1 warning (`perf.js`, the game itself). The other three embedded game pages also pass now (heading
  order fixed in markup; screenshots pixel-identical to before).

## Suggestions

| # | Area | Friction seen | Workaround on the site | Suggested engine change |
|---|---|---|---|---|
| 1 | Paths | `src/content/pages` is hard-coded; this site's Astro `srcDir` is `site/src`. | Run every command with `--site site`; inputs point to `../brand/`. | `paths.pages` (and `paths.styles`) in engine.config.json, default unchanged. |
| 2 | Lifecycle | `produce --write` sets `status` from the brief (default `draft`), so a re-produce silently drops a published page to noindex unless the brief says `status: published`. | Put `status:` in every brief. | Keep the existing status when the brief has none and the page file exists. |
| 3 | Brief | An HTML comment after a block is refused ("copy after a block…"). | Notes moved out of the brief. | Ignore `<!-- … -->` anywhere in a brief. |
| 4 | Open Graph | `og:image` is printed as given; a relative path (`/og/x.png`) is invalid for crawlers and wrong under a base path. | Absolute URL in the brief + a stable copy of the image at `/og/dom-virus.png`. | Resolve relative images against `brand.siteUrl`; print `og:image:alt`, `og:site_name`, `twitter:*`. |
| 5 | Environments | One `brand.siteUrl` for every target. github.io now, custom domain later, base path `/dom-virus` vs `/`. | The layout fails the build if the head's canonical is not the URL being built. | `targets: {staging: {siteUrl}, production: {siteUrl}}` or an `ABE_SITE_URL` env override. |
| 6 | Breadcrumbs | BreadcrumbList links every path segment; `/games/` did not exist (404). | Added a `/games/` page that sends people to the home console. | Config `breadcrumbs` per segment (name + url, or skip), or only link segments that are pages. |
| 7 | JSON-LD | `VideoGame` uses the SEO title as `name` and has no author, platform, price or repository. | None (left as produced). | For VideoGame/SoftwareSourceCode: `name` from the hero heading, `author`/`creator` from `brand.author`, `gamePlatform: "Web browser"`, `applicationCategory: "Game"`, `isAccessibleForFree`, `offers` price 0, `codeRepository`/`sameAs`, `image`. Organization + WebSite on the home page. |
| 8 | check-html | `perf.js` warns on any script; game and app pages need JS by design. Full-screen app routes (`/battlefield/`) and the 404 page fail rules that don't apply to them (canonical on a noindex page). | Warnings accepted; app routes listed as exempt in the report. | `checks.jsBudget` (bytes) instead of zero-JS; `checks.exempt` globs; skip the canonical rule when robots is noindex. |
| 9 | Data-bound facts | Sizes and caps change every release; copying them into a brief makes them stale. | Gameplay facts (loop, controls, characters, sizes) stay in the game's own data; the page JSON holds only the marketing layer. | A way for a brief to reference site data (e.g. `[stats source=games.sherman-bytes]`) or a `slot` the site fills, so audits still see the section. |
| 10 | CI | The engine repo is private, so a site's CI cannot run `produce`, `head --check`, `audit` or `check-html`. | Heads are generated locally and committed; `node scripts/engine-heads.mjs --check` exists for local use. | A pinned, vendorable build (zipapp or `pip install` from a tag) that a site CI job can fetch with a read token. |
| 11 | CTAs | `#play` is an in-page action (a button that starts the game), not a link. | The site maps the CTA with `href: #play` onto its Play button. | CTA `kind: action` (no href checks) so sites can bind it to a control. |
| 12 | Cards | featureList items carry title/body/link only; the site needed to know which card is a cartridge on its shelf. | A small title → cartridge map in the component. | Optional `key` per item, passed through untouched. |
| 13 | Voice input | `## Avoid` is read as literal words, but brand teams write rules there. | Renamed the rules to `## What we never do`; added a machine-only `## Avoid` list and `## Limits`. | Document the format in `brief-template`, or read a fenced `avoid` block so prose and rules can't collide. |
| 14 | Templates | `brief-template <type>` silently uses defaults when `--site` is missing, so a custom type looks unknown. | Always pass `--site site`. | Fail (or hint) when the type is not in the loaded config. |
| 15 | SEO floor | No sitemap or robots.txt from the engine. | Not done yet (rollout). | `abe sitemap <dist> --site` that crawls built HTML, honours robots meta and canonical, and writes `sitemap.xml` + `robots.txt`. |
| 16 | Game pages | A game page needs sections the engine has no type for: controls, characters, palette, the live game. | Rendered by the site from game data. | A `game` preset whose `slot game`, `slot controls`, `slot characters` are site-filled but counted by the audit. |
| 17 | Dates | `meta.created` (and `datePublished`) is the day `produce` runs; release notes need their real date. | `scripts/abe.py` reads `date:` from the brief and passes it to `build(today=…)`. | A `date:` frontmatter key. |
| 18 | Heads and time | `head` bakes robots from the status on the day it runs, so a scheduled page's committed head stays `noindex` after it goes live. | The layout swaps robots to `index,follow` once the page is visible. | Emit robots from the lifecycle at build time, or an option to omit robots from `head`. |
| 19 | Site-owned routes | Links to pages the site renders itself (home, game pages) are reported as broken. | `scripts/abe.py` adds `siteRoutes.paths` from the config as known routes. | A `knownRoutes` config key. |
| 20 | Rich text | Paragraphs can't hold inline links or lists; legal and blog copy needs both. | Links moved into `features rows` blocks. | Minimal inline markup in `[text]` (links, emphasis, bullet lists). |

## Prompt for the keeper

> You keep astro-base-engine (`brain-cache/astro-engine`). A site agent ran the first pilot of the
> engine on a browser-game site whose Astro `srcDir` is not `src/` and whose pages host live games.
> The pilot passed (audit 100, check-html 0 errors) only with site-side workarounds. Read the table
> in this file (20 items, each with the friction, the workaround and a suggested change) and turn it
> into engine changes, smallest and most general first: 2 (keep status on re-produce), 3 (comments
> in briefs), 4 (absolute og:image), 1 (configurable pages dir), 14 (unknown type), 5 (per-target
> siteUrl), 6 (breadcrumb parents), 8 (JS budget, exemptions, noindex canonical), 7 (richer
> VideoGame/SoftwareSourceCode JSON-LD), then 9–20. Keep the engine neutral: no client names, no
> game-specific code; game support should be a generic "interactive page" capability. Each change
> gets a test and a line in the README. Defaults must not change for existing sites. Report what you
> changed, what you declined and why.

Sources: `site/briefs/games-sherman-bytes.md`, `site/engine.config.json`,
`site/src/content/pages/games-sherman-bytes.json`, `scripts/engine-heads.mjs`,
`site-kit/components/{Site,GameSection,CrossPromo}.astro`, astro-engine
`engine/astro_base_engine/{cli,brief,render,lifecycle}.py` (read 2026-10-29).
