# DOM VIRUS: voice (parent)

How the **DOM VIRUS hub** sounds: `domvirus.com` (today `coded-dot-design.github.io/dom-virus/`),
its home, games shelf, engine page (Under the Hood), about, blog and news, and the page frame
around every game page. Each game's voice ([`games/`](games/)) is in the same family and inherits
this file.

Persona source: Chris Cooley's public story (the About page and the blog). Family rules [`README.md`](README.md),
decisions [`DECISIONS.md`](DECISIONS.md) (E14: the public story), look
[`style-guide.md`](style-guide.md). Labels, URLs and the credit come from [`family.json`](family.json).

---

## Who's talking

**Chris Cooley, in the first person**: a solo maker who builds small, fast browser games on the
side, for the love of it, and ships them in the open. This is where the maker's voice is
**strongest** of any brand in the family: the hub carries the story, the devlog and the weekly drop.

Write a more interesting version of Chris: **excited, passionate, opinionated about craft.** We
have creative licence on **tone**, never on **facts or biography**. The energy can be turned up; a
number, a date or a life detail can't be made up.

## Who we talk to

1. **Players** who want to play something now: "No install to play. Hit Recall to give the page
   back." Play comes first on every page.
2. **Curious developers** who want to know how a game runs inside a real page. They get proof
   (the engine page) and a pointer (each game's repository), not a manual.
3. **People following the making**: the devlog and news readers who come back for the next game.

## How we sound

- **A maker at the bench.** "Here's the trick." "Watch this." "I couldn't leave it alone."
- **Strong opinions, held loosely.** "The DOM is faster than you think if you stop fighting it."
  "If it doesn't feel good at 60fps it isn't done." "Every kilobyte is a choice."
- **Generous with technique.** Transforms over layout, one animation loop, flat colour because
  paint is the budget, measure before you believe.
- **Joy over hype.** The excitement comes from the details, never from adjectives.
- **The arcade frame stays.** Short, playful, two beats, full stops. Headlines are commands. The
  machine speaks in mono caps ("INSERT CARTRIDGE", "PRESS START", "BLUE INFO · RED LAUNCH").
  Always say how to undo ("Hit Recall to give the page back.").

**Where the persona shows up:** the about page, blog and devlog posts, the launch post, the engine
page's intro and a one-line maker's note on game pages. Headlines, keys and the shelf stay in the
arcade voice; Chris speaks in the body copy around them.

**Themes to write about** (opinions and know-how, not life details): why tiny games are fun;
getting smooth motion out of the DOM; why one loop beats many; why size is a feature; what a
mechanic cost in bytes and how it was built; giving the page back exactly as it was.

### Do / don't

| Don't | Do |
|---|---|
| "A revolutionary new way to play on the web." | "Your page. Their playground." |
| "Blazing-fast games that run on any device." | "Sherman Bytes is 27.0 kB gzip, game and engine. The next target is smaller." (number from data) |
| "Our team is excited to announce…" | "I couldn't leave this one alone. Here's how it works." |
| "Ten games, available now!" | "Six games to play today. Ten at launch is the plan." |
| "I grew up in [town] working at [company]…" | "I had a computer in the house before most people did, and I still play like it." |

### Sample lines (style, not facts)

- "Small is a feature. A game that loads before you finish blinking is a game you actually play."
- "Most jank is self-inflicted. Stop asking the browser to do layout sixty times a second."
- "I build these because I can't not build them. Come watch the next one get made."
- "The page is the game board. Hit Recall and it's yours again."

## The byline

Every page literally says **"by Chris Cooley"**: the family line **By Chris Cooley · coded.design**
(`family.json` → `credit`), linked to <https://coded.design/>, in the footer and in the About and
credits. JSON-LD `author` / `creator` is the Person "Chris Cooley", url `https://coded.design/`.

## Words we use / words we never use

- **Use:** page, board, playfield; real (real letters, real buttons); letters, binary, 0 and 1;
  Recall, give the page back; cartridge, shelf, console, eject, PRESS START; tiny, small;
  measured, budget, cap, limit; bad guys; open source, MIT; the games' own words (flies, power
  squares, binary).
- **Never:** "sandbox" or "secure" for Shadow DOM (a style boundary, not a security sandbox);
  "snapshot" or "undo everything" for Recall (an ownership ledger); frame rates as promises; hype
  words; third-party names in product copy (the credited Bolo origin story is the one exception);
  install talk for board games; old words ("ghosts", "power orbs", "corrupt letters").

## CTA labels

Exact labels live in `family.json` → `links`: **Get the code & setup instructions** (embedded game
→ its repo), **Play [Board Game]**, **Explore the original [Embedded Game]**, with the supporting
line "Play it here, then make it part of your own project. Visit GitHub for the source code, setup
instructions, and integration examples." Hub keys: Choose your game, Play [Game], Eject cartridge,
Swap to [Game], Copy code. Keep **playing** and **getting the code** visibly different.

## What we never do

- Instructions on pages: setup lives in each game's README; the page points there.
- Reuse invitations for board games ("install", "embed" on a board).
- Long help on a key or overlay; keys are one or two words.
- Retyped facts: sizes, versions, URLs and counts are data (`site/generated/data.json`,
  `family.json`).
- Biography beyond the persona: no employers, family, places or hobbies (E14).
- Hard-coded hosts for other sites.

## Claims: what we may and may not say

**May say** (each from the repos): the games change the **real** page (hits write literal 0 or 1
into the existing Text nodes); Recall restores what the game still owns, and a newer host edit
wins; one requestAnimationFrame loop, pooled entities with hard caps (`PERFORMANCE.md`); package
sizes as generated from each build (gzip, decimal kB, read from data); no runtime dependencies;
open source, MIT; no install to play; **six games playable today**, counted from `family.json`.

**Plans, phrased as plans:** the November launch with 10 games and "a new game every week after
launch" ("the plan is…", "I'm aiming for…"). The launch post stays a draft until the owner sets the
date and confirms the 10 (E13). "Days, not weeks" is an aim, or cite git (Blitz 0.1.0 → 0.6.5 on
2026-10-28, C4).

**May not say:**
- Any frame rate as a promise; FPS appears only as a labelled measurement under stated conditions.
- "Runs at full speed on anything", "days instead of months" or any other claim from the persona
  story that isn't measured.
- That Shadow DOM is a security boundary, or that Recall undoes everything.
- That the four embedded games or DOM Battlefield run on Fizlet. **Only Battlefield Blitz runs on
  Fizlet today**; the others move onto it next.
- Package size as this page's network transfer; unmeasured numbers (targets say "target").

## Content mix, size and the family

- **Home:** play first (hero, shelf, console), one line on the trick, one link to how it works.
- **Game pages:** 80–90% gameplay, 10–20% tech, plus a short maker's note. Each states its
  measured gzip size (game + engine) and a smaller next target labelled "target" (C1). Say what the
  bytes bought; never trade playability for bytes.
- **Engine page, blog, news:** the maker's voice at full volume; plans labelled as plans.
- **Fizlet:** proof and a pointer: one heading, one or two sentences, a link to the Fizlet site.
  Present tense only for Blitz.
- **Boards:** played on their own subdomains, never installed. Name the relationship: Battlefield
  and Blitz are built from Sherman Bytes.

## Avoid

<!-- Read by astro-base-engine (voice.avoid): one word or phrase per bullet, flagged wherever it
appears in page copy. The reasons are in the sections above. -->

- revolutionary
- game-changing
- cutting-edge
- best-in-class
- world-class
- seamless
- synergy
- security sandbox
- secure sandbox
- undo everything
- guaranteed fps
- ghosts
- power orbs
- corrupt letters
- next-gen
- disruptive
- unleash
- supercharge
- blazing fast
- lightning-fast
- full speed on anything
- days instead of months

## Limits

<!-- Read by astro-base-engine (voice.maxSentenceWords, voice.maxExclamations). -->

- max sentence words: 25
- max exclamations: 1

## Open questions

1. **Bolo-era details.** Which details of the Bolo story are fine to mention publicly (open in the
   persona story)? Until answered, say "Bolo" and the feeling, not the setup.
2. **Credit link.** The hub footer links Chris Cooley to LinkedIn today; the byline rule links to
   coded.design. Does LinkedIn stay anywhere (About only)?
