# Phase 1: the line in the sand (2026-10-28)

Everything as it stood before the Phase 2 push (marketing clean-up, brand and URL cut-over, the
no-cms content engine, multiplayer). Point back here to compare pages, games, sizes and copy.

Every repo has a **`phase-1` branch** frozen at the commit below. Treat it as read-only: never push
to it. (Cloud sessions can't create tags; the script at the bottom turns each branch into a
`phase-1` tag from a machine with push access.) Each repo also has its release tag `vX.Y.Z`; where
the `phase-1` commit is newer than the release tag, the extra commits are docs, site pages or tests.

| Repo | Version | Commit (`phase-1`) | Date | Role | Live |
|---|---|---|---|---|---|
| [dom-virus](https://github.com/coded-dot-design/dom-virus/tree/phase-1) | v0.46.0 | `b88c78a` | 2026-10-28 | Hub site (arcade, cartridges, coming soon, under the hood) | https://coded-dot-design.github.io/dom-virus/ |
| [dom-battlefield](https://github.com/coded-dot-design/dom-battlefield/tree/phase-1) | v0.18.12 | `f901af9` | 2026-10-28 | Board game (Modern) + Battlefield site (landing, style guide, /play/, /blitz/) | https://coded-dot-design.github.io/dom-battlefield/ |
| [dom-battlefield-blitz](https://github.com/coded-dot-design/dom-battlefield-blitz/tree/phase-1) | v0.6.5 | `c8c8ca4` | 2026-10-28 | Board game (Classic) code; pages live on the Battlefield site | https://coded-dot-design.github.io/dom-battlefield/blitz/ |
| [fizlet](https://github.com/coded-dot-design/fizlet/tree/phase-1) | v0.2.4 | `466d003` | 2026-10-28 | Engine (kernel + bricks + Board UI kit) + engine site | https://coded-dot-design.github.io/fizlet/ (Pages not enabled yet) |
| [sherman-bytes](https://github.com/coded-dot-design/sherman-bytes/tree/phase-1) | v0.5.2 | `caa1dbf` | 2026-10-26 | Embedded game (Classic): the tank the boards are built from | https://coded-dot-design.github.io/dom-virus/ (cartridge) |
| [swarm-protocol](https://github.com/coded-dot-design/swarm-protocol/tree/phase-1) | v1.3.1 | `03156d2` | 2026-10-26 | Embedded game | https://coded-dot-design.github.io/dom-virus/ (cartridge) |
| [null-invaders](https://github.com/coded-dot-design/null-invaders/tree/phase-1) | v0.7.2 | `3d18d66` | 2026-10-26 | Embedded game | https://coded-dot-design.github.io/dom-virus/ (cartridge) |
| [byte-runner](https://github.com/coded-dot-design/byte-runner/tree/phase-1) | v0.10.2 | `cd18396` | 2026-10-26 | Embedded game | https://coded-dot-design.github.io/dom-virus/ (cartridge) |

## What Phase 1 contains

- **Engine:** Fizlet 0.2.4: kernel (2.8 KB gzip) + input, collide, fx, sound, embed bricks + the
  Board UI kit (`src/ui/`). Multiplayer (E4) not started. Plan: [`ENGINE.md`](../../ENGINE.md).
- **Board games:** DOM Battlefield 0.18.12 (Modern: squad tactics, campaign), Battlefield Blitz
  0.6.5 (Classic: free for all, platoons, practice).
- **Embedded games:** Sherman Bytes, Swarm Protocol, Null Invaders, Byte Runner (pinned in
  [`games.json`](../../games.json)).
- **Sites:** the DOM VIRUS hub, the Battlefield site (landing, style guide, /play/, /blitz/), the
  Fizlet site (built, waiting on Pages).
- **Perf baseline:** [`docs/engine/baseline/`](../engine/baseline/).

## Phase 2 rule: the games are locked

No changes to board or embedded game functionality, styling, hero or in-page animations during
the clean-up. Animations and game layers are only *moved* into the new structure; any clean-up of
them is a separate, later pass (after the engine work). Content, READMEs, page structure, brand and
navigation are what Phase 2 changes.

## Turn the branches into tags (run once, from a machine with push access)

```sh
tag() { gh api "repos/coded-dot-design/$1/git/refs" -f ref=refs/tags/phase-1 -f sha="$2" >/dev/null && echo "tagged $1"; }
tag dom-virus b88c78abe2397e744303120ee5298d77a95b6175
tag dom-battlefield f901af9abecb5b1e76b1573b8669c49c19ffd8db
tag dom-battlefield-blitz c8c8ca403d78c9583ad03f133b70a110138285b5
tag fizlet 466d003c68c8be2beba91df1ee6de62398b25499
tag sherman-bytes caa1dbf2cf5c6524887babd83ac2851f9bf24039
tag swarm-protocol 03156d2e8e437c550e98f4ace4d4d1aba87867db
tag null-invaders 3d18d664e5f5e52062b61af277c82c45d2d54056
tag byte-runner cd18396af591149f37fbb7676a709d90dccb827f
```
