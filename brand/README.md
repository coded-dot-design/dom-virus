# The DOM VIRUS family: brands, structure and content rules

The source of truth for **what goes where, who it talks to and how it sounds**, across the parent
site, every game and the Fizlet engine. It decides structure and voice. The visual style guides
(`style-guide.md` in each brand folder) decide the look.

- Machine-readable twin: [`family.json`](family.json) (brands, games, relationships, URLs).
  Pages and agents read it for links, labels and URLs instead of copying them.
- Phase: **2** (marketing clean-up and cut-over). Phase 1 is frozen: see
  [`docs/phase-1/`](../docs/phase-1/README.md).
- Owner: Chris Cooley · [coded.design](https://coded.design). Ask before changing anything marked
  **Decision** or **Open question**.

---

## 1. Brand levels

Every page belongs to exactly one level. Apply that level's visual guide and voice, and nothing
else.

| Level | Sites | Visual guide | Voice | Content mix |
|---|---|---|---|---|
| **DOM VIRUS** (parent) | `domvirus.com` | [`brand/style-guide.md`](style-guide.md) (the hub's `/style-guide/`) | [`brand/voice.md`](voice.md) | Markets the games, the play experience and the engine behind them. Game pages lead with play; Under the Hood carries the tech story. |
| **A game** (embedded or board) | an embedded game's page on `domvirus.com/games/<id>/`; a board game's own subdomain | that game's `style-guide.md` | that game's `voice.md`, in the DOM VIRUS voice family | **80–90% gameplay** (what you do, why it's fun, play now), **10–20% engine/tech** (size, speed, how it touches the page). The user just needs to play. |
| **Fizlet** (engine) | `fizlet.com` (preferred) or `fizlet.coded.design`; configurable until bought | `fizlet/brand/style-guide.md` | `fizlet/brand/voice.md` | **~100% the engine**: speed, size, performance, consistent games built fast at small scale. DOM VIRUS and the games appear only as use cases and proof. It stands on its own. |

Rules:
- Anything under a game's subdomain uses **that game's** guide and voice. Changes on the parent
  site use the **parent's**.
- An embedded game's page lives on the parent site, so the page frame (header, footer, nav) is the
  parent's; the game section inside it wears the game's accent (today's `accent-<colour>` system).
- One voice family: every brand sounds like it came from the same arcade. Different products, same
  attitude.

## 2. Shared by every brand (Fizlet included)

- **The 3D key.** One component: the Board UI kit's key family (`.bui-key`, `.bui-arcade`,
  `.bui-sticker-key`, states: rest / hover / press / locked / call), source of truth in
  `fizlet/src/ui/` (spec `BOARD-UI.md`). The DOM VIRUS hub's `.button` keys and the Battlefield
  landing keys are the same family; Phase 2 makes them one documented component instead of copies.
- **The core wireframe.** Page structure, semantic markup and metadata come from the shared
  marketing engine (astro-base-engine, see §11). Brands change the look, never the frame.
- **Credit**, visible on every page: **By Chris Cooley · coded.design**, with coded.design linked
  to <https://coded.design>.
- **Default design style:** cyberpunk meets Tron. Dark by default, light theme supported everywhere,
  neon accents on deep navy, pixel characters, mono type, hard bases straight below (never to the
  side unless a brand's cartridge says so).
- **Flat colour for performance.** No gradients, blurs or glows in the game layer unless measured.
  Shadows are hard and offset, not blurred.
- **Size is a recurring theme.** Every game landing page states the delivered, compressed size
  (gzip, game + engine) and its target. Real numbers when it ships, labelled targets while it's an
  idea, always a smaller next target, never at the cost of playability. Fizlet speaks to this on
  every page.
- **Accessible and SEO-sound by default** (§10).

## 3. Games: types, styles, tags

**Two types**
- **Embedded game**: a DOM game that runs *inside* any web page, breaks the page as you play and
  gives it back on Recall. Users can install it on their own sites.
- **Board game**: a full game built on an embedded game's characters plus a board. It runs only on
  our sites, where we control it.

**Two styles**: **Classic** (strategy and tactics) and **Modern** (arcade action, battle-royale
pace). (Working names; **Open question**: keep "Modern"?)

**The pattern** (set by Sherman Bytes): build the tiny embedded game first, then grow its
characters into board games of different styles.

**Roster** (Phase 1)

| # | Gameplay tag | Game | Type | Style | Built from | Status |
|---|---|---|---|---|---|---|
| 01 | DOM TANK | Sherman Bytes | Embedded | Classic | — | Released |
| 02 | SQUAD TACTICS | DOM Battlefield | Board | Classic | Sherman Bytes | Released |
| 03 | DOM BLITZ | Battlefield Blitz | Board | Modern | Sherman Bytes | Released |
| 04 | DOM DEFENSE | Swarm Protocol | Embedded | — | — | Released |
| 05 | DOM CHASE | Byte Runner | Embedded | — | — | Released |
| 06 | DOM SHOOTER | Null Invaders | Embedded | — | — | Released |
| 07 | CLIMB + SMASH | DOM Kaiju | Board | — | — | Coming soon |

- **Open question:** your brief listed DOM Battlefield as Board/Modern and Blitz as Board/Classic,
  but also described the strategy game as Classic and the battle royale as Modern. The table follows
  the description (Battlefield = Classic strategy, Blitz = Modern battle royale). Confirm.
- The gameplay tag is the cartridge kicker (`01 / DOM TANK`). Today Sherman Bytes reads
  "DOM TANK TACTICS"; the target is "DOM TANK" (content change only, applied in the clean-up).
- Coming-soon ideas (DOM Crossfire, DOM Flock) get a number and tag when approved.

**Installing**
- **Embedded games are installable.** Their pages say so and send developers to the game's own
  repository for setup (§6).
- **Board games are not.** No install directions anywhere. The code is open source (MIT), but we
  don't invite reuse of the boards: they are played on our site.
- **Fizlet is a package to build on.** We do encourage it (§9).

## 4. URLs

**Production targets**

| Purpose | URL |
|---|---|
| DOM VIRUS: main site | `domvirus.com` |
| Coming-soon game idea | `domvirus.com/coming-soon/<game>/` |
| Embedded game demo + description + repo link | `domvirus.com/games/<game>/` |
| Blog | `domvirus.com/blog/<post>/` |
| News (press releases, events, launches, game updates, white papers) | `domvirus.com/news/<post>/` |
| Shared style guide (cartridge, keys, rules) | `domvirus.com/style-guide/` |
| Board game landing page | `<game>.domvirus.com` |
| Playable board (one board on the subdomain) | `<game>.domvirus.com/play/` |
| Playable boards (several on one subdomain) | `<game>.domvirus.com/play/<board>/` |
| Fizlet | `fizlet.com` (preferred) · `fizlet.coded.design` (fallback); configurable |

- **Open question (embedded path):** your URL tables say `/games/<game>/`; the site-agent
  handoff's engine config says `/embedded/<slug>/`. Today's pages already live at `/games/<id>/`,
  so `/games/` needs no redirects. Pick one; if `/embedded/` wins, redirect every `/games/<id>/`.
- **Open question (Blitz):** Blitz and Battlefield share the Battlefield brand and site. Proposed:
  `battlefield.domvirus.com/play/battlefield/` and `/play/blitz/` (several boards, one subdomain),
  Blitz's landing at `battlefield.domvirus.com/blitz/`. The alternative is its own
  `blitz.domvirus.com`.

**Environments.** The production URLs above are targets. Until each domain is pointed, the
GitHub Pages addresses keep working, and local dev keeps working:

| Brand | Local | GitHub Pages (today) | Production |
|---|---|---|---|
| DOM VIRUS | `npm run dev` (dom-virus) | `coded-dot-design.github.io/dom-virus/` | `domvirus.com` |
| DOM Battlefield (+ Blitz) | `npm run site:dev` (dom-battlefield) | `coded-dot-design.github.io/dom-battlefield/` | `battlefield.domvirus.com` |
| Fizlet | `npm run site` (fizlet) | `coded-dot-design.github.io/fizlet/` | `fizlet.com` |

DOM VIRUS and Battlefield build their URLs from `SITE_URL` + `SITE_BASE` (repo variables, wired
in their Pages workflows). Fizlet's `scripts/site.mjs` still hard-codes `/fizlet/`: it needs the
same two variables before its domain switch. Cross-site links come from `family.json`, so a domain
switch is one edit.
Never hard-code another site's host in a page. Keep URLs stable: if one must move, add a redirect.

**Preloading the subdomain games.** Goal: a board game opens instantly from the hub. Plan: on
cartridge hover or focus (and when its detail page is shown), the hub adds `<link rel="prefetch">`
for the board's play page and its game bundle (same-site subdomains share the browser's cache
partition). Full cross-origin *prerender* needs a response header GitHub Pages can't set, so it
waits for the hosting move (§12).

## 5. Pages and templates

Every page type below is a template: structure and copy order from the engine, look from the
brand, animation in slots. No one-off pages.

**General marketing (parent):** home (hero animation, interactive cartridge library and console to
reach every game), coming soon (index + one page per idea), blog (index + post), news (index +
post: press releases, events, launches, game updates, white papers), submit your idea (form),
support the project (donations; **Decision:** GitHub Sponsors / Buy Me a Coffee / Ko-fi), plus the
standard set: about, contact, privacy, terms, 404, sitemap, campaign landing pages.

**Game templates**
- **Cartridge**: shared component; the shadow angle, cover art and colours come from the brand
  (`--shadow-angle` per brand). Carries the number, gameplay tag, name, tagline and the console
  actions (START / INFO / LAUNCH).
- **Coming-soon page** (`/coming-soon/<game>/`): character first pass, game description, gameplay
  logic, hero inspiration preview (the browser-skeleton hero from the embedded template), cartridge
  preview.
- **Embedded game page** (`/games/<game>/`): same frame as DOM VIRUS with the game's accent; the
  game runs on the page so you see what it does to HTML; a short "use it in your project" pitch and
  the repo link (§6).
- **Board landing page** (`<game>.domvirus.com`): the game's own brand; an exaggerated full-page
  hero that plays the idea; the cartridge; links to play and to the original embedded game.
- **Board play page** (`<game>.domvirus.com/play/`): the game. On phones it loads like an app: no
  header, footer or scroll, no pinch or double-tap zoom, full screen (shipped on
  `/blitz/play/`, Phase 1). Every game also ships the shared kit: full-screen key, pause =
  surrender overlay, light and dark, the 3D keys.

## 6. Embedded game pages and repositories

**Every game and the engine have their own GitHub repository**, and the pages say so.

Each embedded game page:
1. Runs the game on the page as a playable demo.
2. Briefly says what it does and that developers can use it in their own projects.
3. Has a prominent **"Get the code & setup instructions"** link to that game's repository.
4. Sends developers to the README for installation, configuration, usage and integration examples.

Detailed instructions live in the repository, never on the page. Supporting copy:

> Play it here, then make it part of your own project. Visit GitHub for the source code, setup
> instructions, and integration examples.

Repository URLs come from `family.json` (one place, checked by the link audit).

## 7. Related games: cross-links

When an embedded game supplies a board game's characters, mechanics or starting point, link both
ways. Relationships are explicit in `family.json` (`builtFrom`); names may differ and one embedded
game can feed several boards. Show the links only where a relationship exists.

- **Embedded page → board:** "**Play [Board Game]**", straight to its playable board.
- **Board → embedded:** "**Explore the original [Embedded Game]**", back to the demo, on both the
  board's landing page and its play screen.
- Keep **playing a game** and **getting the code** visibly different: "Play …" goes to a game;
  "Get the code & setup instructions" goes to GitHub.

Today: Sherman Bytes → DOM Battlefield, Battlefield Blitz.

## 8. From idea to published game

1. **Coming soon** (page on `domvirus.com`, from the template): first pass at characters and style
   guide; description; gameplay logic; hero inspiration preview; cartridge preview.
2. **Idea approval**: iterate on design; cartridge design; approve design, idea and gameplay
   logic and controls.
3. **Embedded game**: repo under coded-dot-design; build the approved game; update its
   `/games/<game>/` page with the playable game; complete the cartridge.
4. Some games stop here. Others go on to a board game.
5. **Board game idea**: repo under coded-dot-design; subdomain (scripted DNS, see §12); landing
   page on the subdomain in the game's brand; exaggerated full-page hero; cartridge design; the
   game's own style guide and palette, following the established pattern.
6. **Board game**: build it on the embedded game's harness and the board concept; update the
   landing page and cartridge; add the cartridge and its play/info links to the DOM VIRUS console.

Each step publishes content (§11): coming-soon page, launch post, news item, social posts.

## 9. The engine and open source: how we talk about code

- **Embedded games**: the only copy-paste pattern. One script tag or npm import, documented in
  the repo.
- **Board games**: open source, but we present them as games to play, not code to take. No
  install or reuse instructions.
- **Fizlet**: npm packages people should build on. External content evangelises: theory-first,
  conversational and hyped, with diagrams and live experiments like today's Under the Hood page.
  It goes deep on *how it works* and *how to hook in*: "to add an action to the page, do this; if
  you're building a shooter, do that; if it's multiplayer, do this", not code to paste into an app.
  The engine's internal knowledge (agent rules, recipes) lives in the second brain; the Fizlet
  site is the public face and looks like the newest work (Battlefield's design and diagrams).
- Repos and READMEs follow the same split: games explain play first and link to the tech; Fizlet
  explains the tech.

## 10. SEO, accessibility and performance: the floor

Owned by the marketing engine (structure, metadata, audits). Every page ships:
- unique title and description, canonical, Open Graph and Twitter cards with an image, JSON-LD
  (`WebSite`, `Organization`, `VideoGame` / `SoftwareApplication`, `BlogPosting`, `NewsArticle`,
  `BreadcrumbList` as fits), `lang`, one `h1`, landmarks, alt text, keyboard paths, visible focus,
  reduced-motion fallbacks, AA contrast in both themes;
- a sitemap and robots.txt per site, a 404, internal links that resolve (checked in CI);
- the size and speed story in numbers we measured.

Baseline audit at Phase 1 (`artifacts` builds, 2026-10-28):

| Check | DOM VIRUS | Battlefield | Fizlet |
|---|---|---|---|
| title, description, canonical, `lang` | yes | yes | yes |
| Open Graph + Twitter card | yes | yes | title only, no image |
| JSON-LD | no | no | no |
| sitemap.xml / robots.txt | no / no | no / no | no / no |
| 404 page | yes | no | yes |

Performance is already strong (perf harness and budgets in each repo); keep it measured, never
regress it for content.

## 11. Content: the no-cms engine

**Goal:** a new game every week (then every day) with a steady stream of blog, news and social
posts, without one-off work.

- **The frame:** the shared marketing engine (astro-base-engine, in `brain-cache/astro-engine`)
  owns page structure, copy order, metadata, links, accessibility and the content lifecycle
  (idea → draft → scheduled → published). Pages keep their copy in page JSON, never only in a
  component.
- **The look:** each site keeps its own design, components and animations. The engine leaves slots
  (`data-slot-target="<page-id>#<slot-id>"`) and our animation engine fills them.
- **The brain:** the second brain runs the engine and agents (a Python application with tools and
  agent rules) that take a game from idea to published pages and posts.
- **Templates to build:** blog post, news item / press release, coming-soon page, embedded game
  page, board landing page, social posts (copy plus image sizes: 1200×630 link preview,
  1080×1080, 1080×1920), launch checklist. Screenshots and preview images are generated, not drawn.
- **DRY rule:** if an agent does it twice, it becomes a function, template or data field. Facts
  (sizes, versions, URLs, relationships) are data, read by pages and posts, never retyped.

## 12. Hosting and domains

- **Now:** GitHub Pages per site (free, HTTPS, custom domain per repo). Good for every static page.
- **Domains:** each site sets `SITE_URL` / `SITE_BASE` and a `CNAME`. A game subdomain is its
  board repo's Pages site with `<game>.domvirus.com` as its custom domain. **Decision:** registrar
  and DNS. Recommended: Cloudflare (at-cost domains, DNS API for scripted subdomains, free CDN in
  front of Pages, room for headers later).
- **Later (multiplayer):** a room server is needed; GitHub Pages can't run one. Recommended:
  Cloudflare Workers + Durable Objects (WebSocket rooms) on the same account.

## 13. Phase rules

- **Phase 1 is frozen** (`phase-1` branch in every repo; manifest in `docs/phase-1/`).
- **Games are locked in Phase 2:** no changes to board or embedded game functionality, styling,
  hero or in-page animations. They are only moved into the new structure. Game-layer and animation
  clean-up come later, after the engine work.
- **Flow:** branch → pull request into `staging` → review → the owner merges to `main`.
- **Never degrade** design, styles, gameplay or performance. Clean up means DRY and reusable, not
  different.
