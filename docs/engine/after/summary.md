# Engine after (E3): frame time vs the E0 baseline

**Status: not acceptance-grade.** These runs did not happen on a quiet machine. The 1-minute load
average was 22 to 37 on a 4-core machine through every run (other jobs shared it). It never went
below 22 in a 45-minute wait for a quiet window (14:46 to 15:31 UTC, sampled every 30 s, peak 55).
Run-to-run spread is as large as the differences below: Byte Runner 1.0.1 p95 was 200.1, 300 and
350 ms over its three runs. So nothing below shows a regression or a win. Roadmap G5 stays open
until a rerun on a quiet machine (load average under 1.5).

## How it was run

- `node scripts/perf-baseline.mjs --runs 3` (this commit adds `--runs`, p50, the load average per
  run, `--only`, `--releases`, `--site` and `--blitz`). 4x CPU throttle, 2 s warm-up, 10 s measured,
  1440x900, Chromium 153.0.8010.12, hub 0.48.0 (`main` at `e8c5962`, built locally).
- Each number is the median of 3 runs. Run date: 2026-10-30, 15:31 to 15:39 UTC.
- **Same machine, same session for both sides.** The E0 builds were played again in this session
  (the E0 file in `../baseline/` came from another machine on 2026-10-28, and it has no p50):
  - Arcade games: the archived release from TEST A RELEASE (`--releases`), on the same hub page
    as the current release.
  - DOM Battlefield 0.18.4: its tagged `dist/` was swapped into the hub's `/battlefield/` (`--site`).
  - Battlefield Blitz has no build from before the engine (it has run on Fizlet since 0.1.0). So it
    has numbers but nothing to compare them with. It plays a board match (AI platoons) in an
    1100x640 board on a blank page, from its built `dist/` (`--blitz`).
- The build was pinned locally for this run only (not committed): `games.json` Swarm `v1.4.0`,
  `battlefield.json` `v1.0.1`, and `site/releases.json` cut to the four E0 releases.
- **Dropped frames** = frames over 33.4 ms in the 10 s window.

## Results

p50 ms / p95 ms / dropped frames. Δ is after minus before; a negative Δ is better.

| Game | Before (E0 build) | p50 / p95 / dropped | After (release) | p50 / p95 / dropped | Δ p50 / p95 / dropped | E0 file, other machine (p95 / dropped) | Load per run (before · after) |
|---|---|---|---|---|---|---|---|
| null-invaders | 0.7.2 | 16.7 / 100.1 / 62 | 1.0.2 | 16.7 / 66.7 / 39 | 0.0 / -33.4 / -23 | 16.8 / 0 | 36, 36.8, 37.83 · 30.46, 30.35, 32.09 |
| byte-runner | 0.10.2 | 50 / 216.6 / 84 | 1.0.1 | 50.1 / 300 / 80 | 0.1 / 83.4 / -4 | 33.4 / 29 | 37.1, 37.81, 36.94 · 25.28, 29.12, 32.3 |
| sherman-bytes | 0.5.2 | 16.7 / 50 / 45 | 1.0.1 | 16.7 / 66.7 / 40 | 0.0 / 16.7 / -5 | 16.8 / 0 | 34.57, 29.64, 25.92 · 29.29, 29.02, 28.69 |
| swarm-protocol | 1.3.1 | 50.1 / 133.3 / 109 | 1.4.0 | 66.7 / 166.7 / 97 | 16.6 / 33.4 / -12 | 50.1 / 86 | 24.56, 22.46, 23.65 · 28.99, 28.08, 27.37 |
| dom-battlefield | 0.18.4 | 16.8 / 83.3 / 73 | 1.0.1 | 16.7 / 116.7 / 69 | -0.1 / 33.4 / -4 | 16.8 / 2 | 24.72, 24.07, 24.78 · 30.98, 32.23, 34.45 |
| dom-battlefield-blitz | none | n/a | 0.10.0 | 16.7 / 66.7 / 56 | n/a | n/a | · 23.28, 24.37, 24.35 |

Raw data: `runs/` (`<game>.json` is the release, `<game>@<tag>.json` is the E0 build, with every
run in `runs[]`). `runs-bf-0.18.4/` holds DOM Battlefield 0.18.4.

## To watch on the quiet rerun

Under this load, some after numbers were worse than before. None of them is a measured regression,
because the load moved more than the numbers did. Check these first:

- Byte Runner p95
- Swarm Protocol p50 and p95
- DOM Battlefield p95
- Sherman Bytes p95

To rerun:

```sh
npm run site:build   # with the pins above
node scripts/perf-baseline.mjs --out docs/engine/after/runs --runs 3 \
  --releases null-invaders@v0.7.2,byte-runner@v0.10.2,sherman-bytes@v0.5.2,swarm-protocol@v1.3.1 \
  --blitz ../dom-battlefield-blitz/dist
node scripts/perf-baseline.mjs --out docs/engine/after/runs-bf-0.18.4 --runs 3 \
  --site <hub copy with dom-battlefield v0.18.4 dist/ at battlefield/> --only dom-battlefield
```
