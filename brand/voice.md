# DOM VIRUS: voice (parent)

How the **DOM VIRUS parent brand** sounds: the hub at `domvirus.com` (today
`coded-dot-design.github.io/dom-virus/`), its home, coming-soon, style-guide, Under the Hood, blog
and news pages, and the page frame around every game page. Each game's voice
([`games/`](games/)) belongs to the same family and inherits from this file.

- **Rules of the family:** [`README.md`](README.md) (brand levels, content mix, URLs, cross-links,
  open source). Labels and URLs come from [`family.json`](family.json), never retyped.
- **Look:** [`style-guide.md`](style-guide.md). The live guide's own voice section is
  `site-kit/components/StyleGuide.astro:207-218`.
- **Derived from existing copy only.** Every example below is quoted from a file in this repo or a
  game repo. Gaps and contradictions are under [Open questions](#open-questions).

---

## Who we talk to

From the copy, the hub speaks to two people at once, in this order:

1. **Players**: anyone who lands on the page and wants to play something now. They need no
   setup: "No install to play. Hit Recall to give the page back." (`site-kit/components/Site.astro:81`).
2. **Curious developers**: people who want to know how a game can run inside a real page, and
   maybe put one on their own site. The hub gives them proof (Under the Hood) and a pointer (each
   game's repository), not a manual: "Deep details moved to one page per game and to each game's
   README; the engineering moved under the hood." (`site-kit/components/StyleGuide.astro:245`).

The rulebook's content mix sets the balance (below): lead with play, carry the tech story in its
own place.

---

## How we sound

**Short. Playful. Arcade.** (`site-kit/components/StyleGuide.astro:209`). Two beats, full stops,
no hype. Commands, not descriptions. The machine speaks in mono caps. Always say how to undo.

Real lines from the hub:

| Line | Source | What it shows |
|---|---|---|
| "Your page. *Their playground.*" | `site-kit/components/Site.astro:81` | Two beats; the twist in the second |
| "The DOM is the game board. Letters become points. Buttons become enemy factories." | `site-kit/components/Site.astro:81` | Concrete nouns from the page itself |
| "Pick a cartridge." / "Each game plays across the page you are reading." | `site-kit/components/CartridgeShelf.astro:36-37` | Headline as a command, then one plain sentence |
| "Hit Recall to give the page back." | `site-kit/components/Site.astro:81`, `StyleGuide.astro:216` | Always tell people how to undo |
| "Small games. *Serious engineering.*" | `site-kit/components/UnderTheHood.astro:31` | The tech story in the same two-beat shape |
| "Limits constrain work; they are not frame-rate promises." | `site-kit/components/UnderTheHood.astro:117` | Honest about what a number means |

The machine voice (mono, caps): "INSERT CARTRIDGE", "PRESS START", "INSERT CURIOSITY. PRESS
PLAY.", "SAME PAGE. DIFFERENT RULES. TAP TO PLAY" (`CartridgeShelf.astro:35`, `:68`, `:71`;
`HeroScene.astro:162`). Controls are named by colour and verb: "BLUE INFO · RED LAUNCH"
(`StyleGuide.astro:215`).

The style guide's own rules for headlines and labels (`StyleGuide.astro:211-216`):
- Headlines are commands, not descriptions.
- The machine speaks in caps, in mono.
- Name the action by what the world does ("Eject cartridge").
- Two beats, full stops, no hype ("Same page. Different rules.").
- Controls are named by colour and verb.
- Always tell people how to undo.

---

## Words we use / words we avoid

**Use** (all in today's copy):
- **page, board, playfield**: "The page is the game board" (`README.md:28`); "THE PAGE IS THE
  PLAYFIELD." (`GameSection.astro:51`).
- **real**: real letters, real buttons, real elements: "REAL ELEMENTS. REAL COLLISIONS."
  (`Site.astro:111`).
- **letters, binary, 0 and 1**: what the games do to text.
- **buttons as factories / bases / gates**: what the games do to buttons.
- **Recall, give the page back, restore**: the promise.
- **cartridge, shelf, console, plug in, eject, swap, PRESS START**: the hub's navigation.
- **tiny, small**: "tiny arcade experiments" (`Site.astro:81`), "Small games." (`UnderTheHood.astro:31`).
- **measured, budget, cap, limit**: "Performance budgets, in actual numbers" (`Site.astro:99`).
- **bad guys**: for enemies in general (`HeroScene.astro:18`, `:100`).
- **open source, MIT**: "OPEN SOURCE · MIT" (`Site.astro:80`).

**Avoid:**
- **"sandbox", "secure", "isolated" for Shadow DOM.** The copy is explicit: "It is a style boundary,
  not a security sandbox" (`Site.astro:96`).
- **"snapshot", "undo everything" for Recall.** "It is an ownership ledger—not a snapshot that
  overwrites your whole document. It cannot roll back unrelated changes made by your application."
  (`Site.astro:98`).
- **FPS promises.** "Hard limits constrain work; they are not frame-rate guarantees."
  (`Site.astro:99`).
- **Third-party names and trademarks in product copy.** "Names are working names; every one is
  original (no third-party trademarks in the product)." (`GAMES.md:5`). The one exception is the
  credited origin story (Bolo, `UnderTheHood.astro:39-42`).
- **"ghosts"** for Byte Runner's enemies (old wording in `README.md:34`, `:58`); the game calls them
  **flies** (`byte-runner/site/game.json`).
- **Install talk for board games** (rulebook §3, §9).
- **Hype words** (the guide's "no hype" rule, `StyleGuide.astro:214`).

---

## CTA labels

Use these exactly. Labels that are data live in `family.json` → `links`; read them from there.

**Rulebook labels (targets for the clean-up):**

| Label | Where | Goes to |
|---|---|---|
| **Get the code & setup instructions** | every embedded game page, prominent | that game's repository (`family.json` → `games[].repo`) |
| **Play [Board Game]** (e.g. "Play DOM Battlefield") | an embedded game page whose characters feed a board (`builtFrom`) | the board's playable page (`urls.productionPlay`) |
| **Explore the original [Embedded Game]** (e.g. "Explore the original Sherman Bytes") | a board's landing page and play screen | the embedded game's page on the hub |
| Supporting copy: "Play it here, then make it part of your own project. Visit GitHub for the source code, setup instructions, and integration examples." | next to "Get the code & setup instructions" | — |

Keep **playing** and **getting the code** visibly different: "Play …" goes to a game; "Get the
code & setup instructions" goes to GitHub (rulebook §7).

**Labels on the hub today:**

| Label | Source | Note |
|---|---|---|
| Choose your game | `Site.astro:81` | home hero, primary |
| See how it works | `Site.astro:81` | text link to Under the Hood |
| Play [Game] | `GameSection.astro:46` | primary on each game page |
| Read the source | `GameSection.astro:48` | single-game layout only |
| Install guide / Install + integration guide | `CodePreview.astro:14`, `Site.astro:103` | target: **Get the code & setup instructions** |
| Copy code | `CodePreview.astro:11` | |
| Eject cartridge | `GameSection.astro:43`, `BattlefieldDetail.astro:53` | back to the console |
| Swap to [Game] | `CrossPromo.astro:21` | game-to-game swap on the hub |
| Launch Battlefield | `BattlefieldDetail.astro:60` | |
| Play it now · Details · Design notes | `ComingSoon.astro:31-33` | coming-soon cards |
| Coming soon (disabled key) | `KaijuDetail.astro:44` | |
| See the original one-page site | `StyleGuide.astro:246` | |
| INSERT CARTRIDGE · PRESS START · BLUE INFO · RED LAUNCH | `CartridgeShelf.astro:68-71`, `StyleGuide.astro:215` | machine voice, mono caps |

---

## Avoid

- Instructions on pages. Setup, configuration and integration live in each game's README; the page
  only points there (rulebook §6).
- Reuse invitations for board games ("drop it on your site", "install", "embed") (rulebook §3).
- Long help on a key or overlay; keys are one or two words (`fizlet/src/ui/BOARD-UI.md` §1.7).
- Retyped facts. Sizes, versions, URLs and relationships are data (`site/generated/data.json`,
  `family.json`), read by pages and posts (rulebook §11).
- Claims the copy doesn't support (see Limits).
- Hard-coded hosts for other sites (rulebook §4).

---

## Limits: what we may and may not claim

**We may say** (each backed by a source):
- The games change the **real** page: hits write literal 0 or 1 into the existing Text nodes; no
  clones, no per-letter wrappers (`UnderTheHood.astro:105`, `README.md:136`).
- **Recall** restores what the game still owns; if the host app changed it since, the app wins
  (`UnderTheHood.astro:105`).
- **One loop, bounded work:** one requestAnimationFrame loop, pooled entities with hard ceilings
  (`UnderTheHood.astro:89`, `PERFORMANCE.md:7`, `:31-33`).
- **Hard limits, in numbers**, from `PERFORMANCE.md` and the spec sheet: 8,000 indexed glyphs,
  900 glyph measurements per refresh, 32 factories, 100 decorative particles, 1.5× canvas pixel
  ratio cap, HUD at most 10 updates per simulation second, 12.5 Hz dirty / 2 Hz stable geometry
  (`PERFORMANCE.md:5-29`; `UnderTheHood.astro:10-19`).
- **Package sizes**, as generated at site build from each package's distribution files (gzip,
  decimal kB) and read from `site/generated/data.json` → `games[].metrics`, never typed in
  (`SITE.md:27`, `Site.astro:100`).
- **No runtime dependencies** in the game packages; React is an optional adapter
  (`README.md:83`, `PERFORMANCE.md:39`).
- **Open source, MIT** (`Site.astro:80`; each game's `site/game.json` → `license`).
- **No install to play** on the hub (`Site.astro:81`).

**We may not say:**
- Any frame rate as a promise. FPS numbers appear only as labelled measurements under stated
  conditions, such as the coming-soon baseline "≈32 fps" / "≈48 fps" under a 4x CPU throttle, with
  their goal marked as a goal (`site-kit/coming-soon.ts:99-103`). "Compare real-device frame
  profiles before claiming an FPS improvement." (`PERFORMANCE.md:43`).
- That Shadow DOM is a security boundary (`Site.astro:96`, `SITE.md:29`).
- That Recall undoes everything on the page (`Site.astro:98`).
- That the four embedded games run on Fizlet **today**. They run on the DOM VIRUS shared runtime
  (Swarm keeps its own engine); Fizlet is the next phase for them (`ComingSoon.astro:41-42`,
  `coming-soon.ts:91-97`). Battlefield Blitz is the one game built on Fizlet now (`GAMES.md:28`).
- Package-size figures as this page's network transfer: "these package figures are not a
  prediction of this page's network transfer" (`Site.astro:100`).
- Numbers that aren't measured. Targets are labelled as targets ("≤30 kB gzip target for the embed",
  `KaijuDetail.astro:33`).

---

## Content mix

From the rulebook (§1): the parent **markets the games, the play experience and the engine behind
them**. Game pages lead with play; Under the Hood carries the tech story.

- **Home:** play first: the hero, the shelf, the console. One line on the trick ("The DOM is the
  game board") and one link to how it works.
- **Game pages on the hub:** follow the game mix: **80–90% gameplay**, **10–20% engine/tech**
  (see each game's `voice.md`).
- **Under the Hood:** the engineering story, as live demos ("Poke it. Scroll away and it sleeps.",
  `UnderTheHood.astro:32`).
- **Coming soon, blog, news:** plans labelled as plans ("PLANS, NOT PROMISES",
  `ComingSoon.astro:12`).

---

## How we talk about the Fizlet engine

**Proof and a pointer.** The hub shows that one small engine is behind the games and links out; the
Fizlet site (`fizlet.com`, from `family.json`) does the deep dive.

- Today's line: "One engine under every cartridge: Fizlet." / "The games share one small engine:
  one loop, one way to read the page and give it back, one set of keys."
  (`ComingSoon.astro:41-42`). Keep that shape: one heading, one or two sentences, a link.
- Use a number only if it is measured and sourced in Fizlet (e.g. the kernel budget "Kernel ≤ 4 KB
  gzip (today: ~2.8 KB)", `fizlet/README.md:48`), and link to it rather than explain it.
- Speak about Fizlet in the future tense for the four embedded games (it is the E1–E3 plan) and in
  the present tense only for what ships on it (Blitz).
- Don't teach the engine on the hub. Theory, diagrams, "how to hook in" belong to Fizlet's site
  (rulebook §9).

---

## How we talk about board games

**Play them on our sites. No install talk.** (rulebook §3, §9).

- Board games are full games, played on their own subdomains. The hub shows the cartridge and a
  "Play" key; it never explains how to install or embed a board.
- Today's Battlefield line, the model: "Command a squad of up to twelve Sherman tanks on a cyberpunk
  grid built from real page elements." (`BattlefieldDetail.astro:58`).
- Name the relationship when it exists: Battlefield and Blitz are built from Sherman Bytes. Use the
  rulebook's cross-link labels ("Play [Board Game]" / "Explore the original [Embedded Game]").
- They are open source (MIT), but we present them as games to play, not code to take.

---

## How we talk about size and speed

Size is a recurring theme across the family (rulebook §2).

- **Measured gzip, game + engine.** Every game page states the delivered, compressed size of the
  game and its engine. On the hub this is `games[].metrics.gzip` in `site/generated/data.json`,
  shown as decimal kB with one decimal ("27.0 kB · gzip · complete game + engine",
  `GameSection.astro:59`). Swarm's figure is its full immediate import graph and says so.
- **Always a smaller next target**, labelled as a target (rulebook §2). Ideas carry labelled
  targets ("≤30 kB gzip target for the embed", `KaijuDetail.astro:33`).
- **Never at playability's cost.** "The modest budget increases explicitly cover sound,
  persistent controls, mobile abilities and the expanded maze."
  (`docs/performance-audit-2026-10.md:31`) is the model: say what the bytes bought.
- **Honest scope.** Say what a number excludes: "The Astro site, React adapter, HTTP headers and
  browser cache are excluded." (`Site.astro:100`).
- Snapshot at the last hub build (`site/generated/data.json`, kit 1.49.0), for orientation only;
  pages read the live data:

| Game (version) | gzip bytes | Shown as | Enforced ceiling (repo `scripts/size.mjs`) |
|---|---:|---|---:|
| Sherman Bytes (0.5.2) | 26,994 | 27.0 kB | 28,000 |
| Swarm Protocol (1.3.1) | 34,646 (initial 4,342) | 34.6 kB | module-graph report, no fixed ceiling |
| Byte Runner (0.10.2) | 29,160 | 29.2 kB | 30,000 |
| Null Invaders (0.7.2) | 22,940 | 22.9 kB | 24,000 |

---

## Credit line

Visible on every page: **By Chris Cooley · [coded.design](https://coded.design)**, with
coded.design linked to <https://coded.design> (rulebook §2; `family.json` → `credit`).

---

## Open questions

1. **Credit wording.** The rulebook says "By Chris Cooley · coded.design". The hub footer says
   "Created by Chris Cooley" (short: "By") and "© [year] coded.design · Open source (MIT)", with
   Chris Cooley linked to LinkedIn (`Site.astro:142`); game pages say "Created by Chris Cooley ·
   coded.design" (`GameSection.astro:48`). Should "Created by" become "By", and does the LinkedIn
   link stay?
2. **Cross-link label from Sherman Bytes.** The rulebook wants "Play DOM Battlefield" straight to
   the playable board. The Sherman page today shows "Swap to DOM Battlefield", which swaps
   cartridges and opens Battlefield's info page (`CrossPromo.astro:21`, `GameSection.astro:65`).
   And there is no Sherman → Battlefield Blitz link yet.
3. **Blitz is described as embeddable.** "Drops onto any website with one line"
   (`coming-soon.ts:35`), "drops onto any page" (`BattlefieldDetail.astro:117`), "drop-in
   `/blitz/blitz.js`" (`GAMES.md:29`). The rulebook says board games have no install directions.
   Is Blitz a board game, or also an embedded game?
4. **How many games.** The home hero says "Five tiny arcade experiments" (`Site.astro:81`); the
   rulebook roster has six released games and one coming soon; the readout says "4 new games + the
   engine" coming soon (`Site.astro:87`), although Blitz has shipped.
5. **Gameplay tags and numbers.** Sherman's kind is "DOM TANK TACTICS" everywhere today; the
   rulebook target is "DOM TANK". `coming-soon.ts` gives Blitz the kind "ARCADE TANKS" and accent
   cyan; the rulebook gives "DOM BLITZ" and pink. Coming-soon numbers (Blitz 01, Crossfire 02,
   Kaiju 03, Flock 04) differ from the roster numbers (Blitz 03, Kaiju 07).
6. **No smaller next targets.** The rulebook asks every game page for a smaller next target. The
   only size figures in the repos are enforced ceilings (above), which sit above today's sizes.
   `PERFORMANCE.md:29` lists older ceilings (Byte 27,000 / Null 22,000 / Sherman 26,000) than the
   repos enforce now, and today's measured sizes exceed those. Who sets the next targets?
7. **"New games take days, not weeks"** (`ComingSoon.astro:42`) is a forward claim with no
   measurement behind it yet. Keep as an aim, or drop?
8. **Swarm's initial size.** The hub reports 4.3 kB gzip for Swarm's initial static import graph
   (`data.json`); Swarm's `PERFORMANCE.md:33` says initial loading is "about 1.1 kB compressed"
   (the deferred scheduler). Which number does a page use?
9. **Dark by default vs system.** The hub follows the system colour scheme (`README.md:24`); the
   rulebook says "Dark by default".
