# Phase 2 decisions: open questions across the family

One list for the owner. Each item says where the question comes from, what the existing copy and
code do today, and a recommendation. Answer here (or in the PR), then the brand files, `family.json`
and pages follow. Nothing below has been changed in any page or game yet.

Sources: the rulebook (`brand/README.md`) and the brand files written for DOM VIRUS, the four
embedded games, Battlefield, Blitz and Fizlet (each lists its own open questions in full).

## A. Rules that conflict with what's live

| # | Question | Today | Recommendation |
|---|---|---|---|
| A1 | **Blitz drop-in vs "boards are never installable".** | Blitz ships a one-line drop-in (`/blitz/blitz.js`) and the Battlefield, Blitz, Fizlet and hub pages promote it ("Put it on your site", "Drops onto any website with one line"). | Treat **Blitz as both**: an embedded game (installable, drop-in) *and* a board on the Battlefield site. Its drop-in moves to an embedded page on the hub (`/games/blitz/`), its board stays on the Battlefield subdomain with no install copy. Keep `/blitz/blitz.js` working forever (snippets are in the wild). |
| A2 | **Classic / Modern.** | Copy never uses either word. Battlefield = "squad tactics"; Blitz = "the arcade version". | Battlefield = **Classic**, Blitz = **Modern** (the rulebook table). Consider "Arcade" instead of "Modern": it's the word the copy already uses. |
| A3 | **Embedded path:** `/games/<id>/` or `/embedded/<id>/`. | `/games/<id>/` is live. | Keep **`/games/`** (no redirects, matches your URL table); set the engine config's embedded pattern to `/games/{slug}/`. |
| A4 | **Blitz's home and play URL.** | `/blitz/`, `/blitz/play/`, `/blitz/blitz.js` on the Battlefield site. | `battlefield.domvirus.com/blitz/` (landing) and `battlefield.domvirus.com/play/blitz/` (board) with a redirect from `/blitz/play/`; `/blitz/blitz.js` never moves. |
| A5 | **Numbering.** | The shelf numbers Swarm 03, Byte Runner 04, Null 05; coming-soon numbers Blitz 01, Kaiju 03. | Adopt the roster (01 Sherman … 07 Kaiju) everywhere, from `family.json`. |
| A6 | **Credit line.** | "Created by Chris Cooley" (LinkedIn) + "© coded.design", unlinked; none on the Battlefield `/play/` page. | "**By Chris Cooley · coded.design**" with coded.design linked, on every page including play screens. |
| A7 | **"Explore the original Sherman Bytes".** | Missing everywhere; Sherman's page links Battlefield's info page, not the playable board, and nothing links Blitz. | Add both directions per the rulebook §7 (content-only change, from `family.json`). |
| A8 | **CTA labels.** | "Install guide" / "Install + integration guide". | "**Get the code & setup instructions**". |
| A9 | **Fizlet "powers" claim.** | Fizlet README: "Fizlet powers the DOM VIRUS arcade and DOM Battlefield". Only Blitz runs on Fizlet today. | Reword to what's true: "Fizlet runs Battlefield Blitz; the arcade and Battlefield move onto it next." |
| A10 | **Fizlet "on npm".** | Rulebook: npm packages. Site: "Not on npm yet". | Keep "not yet" until published; decide one package with subpath exports (current build) vs one per brick. |

## B. Brand and design

| # | Question | Recommendation |
|---|---|---|
| B1 | Approve Fizlet's proposed visual guide (`fizlet/brand/style-guide.md`). | Approve; it's the Board UI kit plus a few site tokens. |
| B2 | Soft effects in page chrome (hero washes, glows, header blur) vs "flat colour". | Allow in page chrome where measured cheap; never in the game layer. |
| B3 | Theme default: hub follows the system; Battlefield and Fizlet start dark. | Keep per brand (as documented). |
| B4 | Sherman Bytes' "amber" accent is coral `#ee6875`; lime differs between the token and Byte Runner's section; Null Invaders and Battlefield share cyan; no `.accent-pink` exists for Blitz/Kaiju. | Rename to what they are, add pink, give Battlefield its own token. Visual change: do it in the game-layer clean-up, not now. |
| B5 | Light-theme contrast: `--k-sys-ink #0088b3` (3.6:1) and Fizlet `--hl` (4.0:1) miss AA for text. | Deepen both in the Board UI kit (one fix for every board). |
| B6 | Swarm's bug icon is a line icon in a pixel family. | Leave (game locked); redraw in the game clean-up. |

## C. Facts and numbers

| # | Question | Recommendation |
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

| # | Question | Recommendation |
|---|---|---|
| D1 | Fizlet domain: `fizlet.com` or `fizlet.coded.design`. | Whichever you can buy; the config takes either. |
| D2 | Registrar and DNS. | Cloudflare (at-cost, DNS API for scripted subdomains, CDN in front of Pages, Workers later for multiplayer). |
| D3 | Donations: GitHub Sponsors, Buy Me a Coffee or Ko-fi. | GitHub Sponsors (open source, no fees), with Ko-fi as the casual option. |
| D4 | `dombattlefield.com` (in the Battlefield README) vs `battlefield.domvirus.com`. | Subdomain is canonical; point `dombattlefield.com` at it with a redirect if you own it. |
