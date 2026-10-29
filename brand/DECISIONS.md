# Phase 2 decisions

Every question raised while writing the brand inputs, what the existing copy and code do today, and
the **decision taken**. Decided 2026-10-29 by the site agent on the owner's instruction ("make your
own decisions, based on best practice and the astro-engine's learnings"). The owner can reverse any
line: change it here, then the brand files, `family.json` and pages follow. Nothing below has been
applied to a page or a game yet; applying them is the content pass (games stay locked).

Principles used: keep live URLs (engine rule 5), never invent facts or numbers (engine rule 4),
facts are data not prose (rulebook §11), one shared component over copies, and don't touch the game
layer in Phase 2.

Sources: the rulebook (`brand/README.md`), the client card (`brain-cache/coded`
`clients/domvirus/_card.md`), astro-engine's contract and defaults, and the brand files written for
DOM VIRUS, the four embedded games, Battlefield, Blitz and Fizlet.

## A. Rules that conflict with what's live

| # | Question | Today | Decision |
|---|---|---|---|
| A1 | **Blitz drop-in vs "boards are never installable".** | Blitz ships a one-line drop-in (`/blitz/blitz.js`) and the Battlefield, Blitz, Fizlet and hub pages promote it ("Put it on your site", "Drops onto any website with one line"). | Treat **Blitz as both**: an embedded game (installable, drop-in) *and* a board on the Battlefield site. Its drop-in moves to an embedded page on the hub (`/games/blitz/`), its board stays on the Battlefield subdomain with no install copy. Keep `/blitz/blitz.js` working forever (snippets are in the wild). |
| A2 | **Classic / Modern.** | Copy never uses either word. Battlefield = "squad tactics"; Blitz = "the arcade version". | Battlefield = **Classic**, Blitz = **Modern** (the rulebook table). Consider "Arcade" instead of "Modern": it's the word the copy already uses. |
| A3 | **Embedded path:** `/games/<id>/` or `/embedded/<id>/`. | `/games/<id>/` is live. | Keep **`/games/`** (no redirects, matches your URL table); set the engine config's embedded pattern to `/games/{slug}/`. |
| A4 | **Blitz's home and play URL.** | `/blitz/`, `/blitz/play/`, `/blitz/blitz.js` on the Battlefield site. | **Changed by the owner (2026-10-29):** its own subdomain, `battlefieldblitz.domvirus.com` (landing) and `battlefieldblitz.domvirus.com/play/` (board), from the dom-battlefield-blitz repo. The Battlefield site keeps `/blitz/` and `/blitz/play/` for old links, with their canonical on the new host; `/blitz/blitz.js` never moves. |
| A5 | **Numbering.** | The shelf numbers Swarm 03, Byte Runner 04, Null 05; coming-soon numbers Blitz 01, Kaiju 03. | Adopt the roster (01 Sherman … 07 Kaiju) everywhere, from `family.json`. |
| A6 | **Credit line.** | "Created by Chris Cooley" (LinkedIn) + "© coded.design", unlinked; none on the Battlefield `/play/` page. | "**By Chris Cooley · coded.design**" with coded.design linked, on every page including play screens. |
| A7 | **"Explore the original Sherman Bytes".** | Missing everywhere; Sherman's page links Battlefield's info page, not the playable board, and nothing links Blitz. | Add both directions per the rulebook §7 (content-only change, from `family.json`). |
| A8 | **CTA labels.** | "Install guide" / "Install + integration guide". | "**Get the code & setup instructions**". |
| A9 | **Fizlet "powers" claim.** | Fizlet README: "Fizlet powers the DOM VIRUS arcade and DOM Battlefield". Only Blitz runs on Fizlet today. | Reword to what's true: "Fizlet runs Battlefield Blitz; the arcade and Battlefield move onto it next." |
| A10 | **Fizlet "on npm".** | Rulebook: npm packages. Site: "Not on npm yet". | Keep "not yet" until published; decide one package with subpath exports (current build) vs one per brick. |

## B. Brand and design

| # | Question | Decision |
|---|---|---|
| B1 | Approve Fizlet's proposed visual guide (`fizlet/brand/style-guide.md`). | Approve; it's the Board UI kit plus a few site tokens. |
| B2 | Soft effects in page chrome (hero washes, glows, header blur) vs "flat colour". | Allow in page chrome where measured cheap; never in the game layer. |
| B3 | Theme default: hub follows the system; Battlefield and Fizlet start dark. | Keep per brand (as documented). |
| B4 | Sherman Bytes' "amber" accent is coral `#ee6875`; lime differs between the token and Byte Runner's section; Null Invaders and Battlefield share cyan; no `.accent-pink` exists for Blitz/Kaiju. | Rename to what they are, add pink, give Battlefield its own token. Visual change: do it in the game-layer clean-up, not now. |
| B5 | Light-theme contrast: `--k-sys-ink #0088b3` (3.6:1) and Fizlet `--hl` (4.0:1) miss AA for text. | Deepen both in the Board UI kit (one fix for every board). |
| B6 | Swarm's bug icon is a line icon in a pixel family. | Leave (game locked); redraw in the game clean-up. |

## C. Facts and numbers

| # | Question | Decision |
|---|---|---|
| C1 | Smaller next size targets don't exist for any game. | Set each target ~10% under today's measured gzip; show "now / target" on every game page. |
| C2 | Stale numbers: Fizlet site says Blitz "about 17 KB" (now 34.5 KB); Battlefield README sizes (61.5 KB, now 67.6 KB); Swarm initial size (4.3 kB on the hub vs ~1.1 kB in its docs); Byte Runner caps disagree; `PERFORMANCE.md` ceilings older than today. | Generate every size from the build (the hub already does); delete hand-typed numbers. |
| C3 | "MULTIPLAYER SOON" on the Battlefield hero while its README says multiplayer isn't implied. | Keep "soon" only once E4 is scheduled; until then "multiplayer: planned". |
| C4 | "New games take days, not weeks" (coming soon) has no measurement. | Keep as an aim, phrased as one, or cite what git shows: Blitz went from 0.1.0 to 0.6.5 (platoons, practice, kit keys, pause) on one day, 2026-10-28. |
| C5 | Hero says "Five tiny arcade experiments"; six games are released. | Count from `family.json`. |
| C6 | Old words ("ghosts", "power orbs", "corrupt letters") vs the games (flies, power squares, binary). | Use the games' words. |
| C7 | Swarm package scope `@chriscooley` vs `@coded-design`; last release with assets v1.2.3 vs hub v1.3.1. | Decide the npm scope for every package (recommend `@coded-design`). |
| C8 | "Install it like an app" vs "No install" on the Battlefield landing. | "Add it to your home screen". |

## D. Domains, hosting, money

| # | Question | Decision |
|---|---|---|
| D1 | Fizlet domain: `fizlet.com` or `fizlet.coded.design`. | Whichever you can buy; the config takes either. |
| D2 | Registrar and DNS. | Cloudflare (at-cost, DNS API for scripted subdomains, CDN in front of Pages, Workers later for multiplayer). |
| D3 | Donations: GitHub Sponsors, Buy Me a Coffee or Ko-fi. | GitHub Sponsors (open source, no fees), with Ko-fi as the casual option. |
| D4 | `dombattlefield.com` (in the Battlefield README) vs `battlefield.domvirus.com`. | Subdomain is canonical; point `dombattlefield.com` at it with a redirect if you own it. |
| D5 | Multiplayer room server (GitHub Pages can't run one). The card names S3 + CloudFront as the hosting step-up. | Cloudflare Workers + Durable Objects for rooms (one stateful object per room over WebSockets), independent of page hosting; AWS API Gateway WebSockets if everything must live on AWS. Owner to confirm the account before E4 starts. |
| D6 | Engine page-content path: astro-engine writes `src/content/pages`; these Astro sites use `site/src`. | Run the engine with `--site site` and point `inputs` at `../brand/` (no site restructure). Suggested engine change: a configurable pages dir (`brand/ENGINE-SUGGESTIONS.md`). |
| D7 | Who owns which words on an embedded game page. | The engine page JSON owns the marketing layer: SEO, lead, Play label, related-game cards, FAQ, the "get the code" line. Gameplay facts (loop, controls, characters, sizes, caps) stay in the game repo's `site/game.json` and the build-time size measurement, so they can't go stale. |
| D8 | Engine `<head>` in the layout. | `npm run engine:heads` writes `abe head` output to `site/src/content/heads/<id>.html` (committed; CI can't run the private engine). The layout uses it instead of its own tags and fails the build if its canonical is not the URL being built. |
| D9 | Hero actions and cross-links on game pages. | Play stands alone in the hero (existing tested rule); GitHub stays with the install key. Related boards with a shelf cartridge still go through the cartridge swap; the label follows §7 ("Play DOM Battlefield"). |

## E. Routes, site map and standard pages (2026-10-29)

Full table and reasons: [SITEMAP.md](SITEMAP.md).

| # | Question | Decision |
|---|---|---|
| E1 | Flat top-level pages? | No. Pages sit under their section (`/games/`, `/engine/`, `/about/`, `/legal/`); only `/contact/` and `/support/` stay at the root, where people and tools expect them. |
| E2 | Coming-soon URL vs game URL. | One URL per game for life: `/games/<id>/` from idea to board; the stage changes the template, not the URL. `/coming-soon/` became the stage list `/games/coming-soon/`. This supersedes the `domvirus.com/coming-soon/<game>` row in the client card. |
| E3 | Boards. | Own subdomain; the hub's `/games/<id>/` stays the family entry. |
| E4 | Redirects. | One source, `site/redirects.json`: static redirect pages on GitHub Pages, bulk 301s on Cloudflare. Moved today: `/under-the-hood/` → `/engine/`, `/style-guide/` → `/about/brand/`, `/archive/` → `/about/brand/archive/`, `/coming-soon/` → `/games/coming-soon/`. |
| E5 | URL style. | Trailing slash, lowercase, hyphens, no dates in URLs. |
| E6 | Who renders content pages. | astro-base-engine page JSON → `EnginePage.astro` in the hub's look. |
| E7 | Publishing. | Published, or scheduled once `publishAt` passes (the hourly Pages build picks it up). Drafts never ship. |
| E8 | Analytics and consent. | Cloudflare Web Analytics, cookieless, behind the `PUBLIC_CF_ANALYTICS_TOKEN` repo variable; no cookies, so no banner. Anything that sets cookies needs consent first. |
| E9 | Feeds. | `/feed.xml` (news + devlog). |
| E10 | Security contact. | `/.well-known/security.txt` → GitHub private vulnerability reporting. |
| E11 | Donations. | `/support/`: GitHub Sponsors first, a tip jar second; links go live when the accounts exist. |
| E12 | Contact. | No form until there's a backend; GitHub issues now, email once one exists. |
| E13 | Blog cadence and dates. | The devlog publishes weekly (scheduled posts); release notes are dated by their real git tags; the launch post stays a draft until the owner sets the November date and confirms the 10 games. |
| E14 | The public story. | First person as Chris: a house full of computers in the 80s and 90s, Bolo, 20 years of tiny games, a game a week on the side. No employers, hometown, family or hobbies in public copy. |

