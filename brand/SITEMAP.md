# Routes and site map (decided 2026-10-29)

The family's content follows one story: **an idea becomes a playable game on your page, then a
board game on its own site.** Routes follow that story, then the standard pages every public site
needs. Decisions are numbered (E1–E12) and also listed in [DECISIONS.md](DECISIONS.md).

## Rules

- **E1 · No flat pages without a reason.** A page sits under the section it belongs to (`/games/…`,
  `/engine/…`, `/about/…`, `/legal/…`). Top level holds only sections plus the two pages people and
  tools expect at the root: `/contact/` and `/support/`.
- **E2 · One URL per game, for life.** `/games/<id>/` is the game's page from idea to board. Its
  stage (idea → playable → board) changes the template, never the URL, so links and search
  rankings carry forward and no redirect is ever needed when a game ships.
- **E3 · Boards get their own subdomain** (`<game>.domvirus.com`). The hub's `/games/<id>/` stays
  the game's entry in the family and links to the board.
- **E4 · One redirect source per site**: `site/redirects.json`. On GitHub Pages it builds static
  redirect pages (meta refresh, canonical to the target, `noindex`); on Cloudflare it becomes bulk
  redirects (301) from the same file.
- **E5 · Trailing slashes everywhere** (Astro `trailingSlash: "always"`); lowercase, hyphenated slugs;
  no dates in URLs (posts are evergreen; dates live on the page).
- **E6 · Content pages are engine pages.** Every page except the console, the game pages and the apps
  is a brief in `site/briefs/<section>/` → `python3 scripts/abe.py produce … --write` → page JSON →
  rendered by `site-kit/components/EnginePage.astro` in the hub's own look. Copy lives in the JSON.
- **E7 · Lifecycle.** Production builds show `published` pages and `scheduled` pages whose
  `publishAt` has passed; the hourly scheduled Pages build publishes them on time. Drafts never ship.

## DOM VIRUS hub: `domvirus.com` (today `coded-dot-design.github.io/dom-virus/`)

| Route | Page | Status |
|---|---|---|
| `/` | The console: every cartridge | live |
| `/games/` | Every game, by stage: playable, boards, coming soon | new |
| `/games/<id>/` | One game, for life (E2) | live (6) |
| `/games/coming-soon/` | Ideas and what's next (was `/coming-soon/`) | moved |
| `/engine/` | How the games work: read the page cheaply, own only what you change, give it back (was `/under-the-hood/`) | moved |
| `/engine/<slug>/` | Deep dives (performance, Recall, the ledger) | later |
| `/news/` · `/news/<slug>/` | Releases, launches, press, events, game updates | new |
| `/blog/` · `/blog/<slug>/` | The devlog: why and how, in Chris's voice | new |
| `/about/` | The story: one maker, Bolo, a game a week | new |
| `/about/press/` | Press kit: facts, logos, screenshots, contact | new |
| `/about/brand/` | Brand and style guide (was `/style-guide/`) | moved |
| `/about/brand/archive/` | The one-page layout, kept as a case study (was `/archive/`) | moved |
| `/support/` | Back the project: sponsorships and tips (links set in `site/support.json`) | new |
| `/contact/` | How to reach us: bugs, press, everything else | new |
| `/legal/` | Index of the legal pages | new |
| `/legal/privacy/` · `/legal/cookies/` · `/legal/terms/` · `/legal/licenses/` · `/legal/accessibility/` | Privacy, cookies and storage, terms of use (site + games), open-source licences, accessibility statement | new |
| `/battlefield/` | The hub's copy of the Battlefield app; redirects to `battlefield.domvirus.com/play/battlefield/` when that domain is live | live |
| `/board-ui/` | Old address, already a redirect | live |
| `/feed.xml` | RSS for news and blog | new |
| `/sitemap.xml` · `/robots.txt` | Built from the final HTML (canonical, indexable pages only) | new |
| `/.well-known/security.txt` · `/humans.txt` | Security contact; credits | new |
| `/404` | Not found | live |

**Navigation.** The header keeps its keys (Games, Engine, theme). The footer carries the full map
in five columns: Games · Under the hood (engine + devlog) · News · About · Legal. It is built from
the routes the build serves (`site-kit/components/FooterSitemap.astro`; columns and labels in
`site-kit/footer-map.mjs`), so a new page joins it on its own; what the build hides or does not index
stays out, and so does `/about/brand/archive/`. `tests/site-footer.mjs` checks every sitemap page is
linked exactly once.

## Board sites: `<game>.domvirus.com` (Battlefield + Blitz today)

`/` landing · `/play/<board>/` the board · `/<board>/` a second board's landing (`/blitz/`) ·
`/style-guide/` the board's own guide. News, blog, legal, support and contact live on the hub and
are linked from the board's footer; a board never duplicates them.

## Fizlet: `fizlet.com` (or `fizlet.coded.design`)

`/` · `/docs/` and `/docs/<slug>/` (guides) · `/bricks/<id>/` · `/examples/<slug>/` · `/blog/<slug>/`
(engine posts). Legal and contact link to the hub until Fizlet needs its own.

## Machine pages and tracking

- **Sitemap**: one `sitemap.xml` per site, from the built HTML: canonical URLs of pages without
  `noindex`. `robots.txt` points to it. (Search engines only read `robots.txt` at a host's root, so
  both work fully once the domain is pointed.)
- **Analytics (E8)**: Cloudflare Web Analytics, cookieless, loaded only when the repository variable
  `PUBLIC_CF_ANALYTICS_TOKEN` is set. No cookies, no cross-site tracking, so no consent banner; the
  cookies page says exactly what is stored (theme, sound, game settings in `localStorage`). Adding
  anything that sets cookies or tracks across sites needs a consent banner first.
- **E9 · Feeds**: `/feed.xml` (news + blog, newest 30).
- **E10 · Security**: `security.txt` points to GitHub private vulnerability reporting.
- **E11 · Support**: GitHub Sponsors first, a tip jar (Ko-fi or Buy Me a Coffee) second; the page
  shows only the links that are set, so it ships before the accounts exist.
- **E12 · Contact**: no form until there is a backend (a Worker on the Cloudflare step-up). Until then:
  GitHub issues for bugs and ideas, an email address from `site/contact.json` once one exists.
