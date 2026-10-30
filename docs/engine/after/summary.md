# Engine after (E3): frame time vs the E0 baseline

**Status: quiet-machine run, 2026-10-30, 15:48 to 16:11 UTC.** One game slowed down by more than the
run-to-run noise: **Swarm Protocol 1.4.0 runs about 15% fewer frames per second than 1.3.1** (median
14.2 vs 16.8 fps over 6 runs). The other ported games are level with their E0 build or better. Blitz
has no pre-engine build, so it has numbers only.

This replaces the first run (load average 22 to 55 on a shared box), which was not valid.

## Load average

- Nothing else ran on the machine: 4 cores, and `ps` during the runs showed only the test browser
  and the harness.
- Each set of runs started only after the 1-minute load average had stayed under 1.5 for 60 s
  (sampled every 10 s). At each start it was 0.07 to 0.19.
- **During the runs it was 1.3 to 2.6.** That load comes from the measurement itself. Under the 4x
  CPU throttle, the game's renderer keeps one core at about 100% and the browser process uses
  another 25%, and the 1-minute average counts both. So only 40 of the 138 samples taken during the
  runs were under 1.5. A harness run can't stay under 1.5 on this machine. The background load did.
- For comparison, the first attempt ran at 22 to 55, 10 to 30 times more.
- Each run's load is in its JSON (`runs[].load1`). Every sample is in `load-samples.txt`.

## How it was run

- Two passes (A, then B) of `node scripts/perf-baseline.mjs --runs 3`: each number is the median of
  3 runs, so each game has 6 runs per side. Before and after were played in the same session on the
  same machine.
- Setup: 4x CPU throttle, 2 s warm-up, 10 s measured, 1440x900, Chromium 153.0.8010.12 (the
  pre-installed full Chromium via `CHROMIUM_PATH`, headless), Node 22.23.4.
- Hub 0.48.0, from this branch (`e8c5962` plus the harness).
- Before: the E0 builds.
  - Arcade games: the archived release, played through TEST A RELEASE (`--releases`).
  - DOM Battlefield 0.18.4: its tagged `dist/`, swapped into the hub's `/battlefield/` (`--site`).
- After: the releases.
  - Null Invaders 1.0.3 (latest 1.0.x), Swarm Protocol 1.4.0 and DOM Battlefield 1.0.1.
  - Byte Runner 1.0.1 and Sherman Bytes 1.0.1, the hub's current pins.
  - Their newest tags too, Byte Runner 1.0.2 and Sherman Bytes 1.1.0, measured after the main
    passes against their E0 builds again ("newest tag" rows).
  - Battlefield Blitz 0.10.0 (built from its tag; a board match on a blank page, `--blitz`).
- The pins were set locally for the run and not committed: `games.json`, `battlefield.json`
  `v1.0.1`, and `site/releases.json` cut to the four E0 releases.
- **Dropped frames** = frames over 33.4 ms in the 10 s window.
- Frame times come in vsync steps (16.7, 33.3, 50, 66.7 ms...), so p50 and p95 move a whole step
  at a time. fps is the finer measure, which is why the spread table has it.

## Results

p50 ms / p95 ms / dropped frames, each the median of 3 runs. Δ is after minus before; negative is
better.

| Game | Before | After | Pass | Before p50 / p95 / dropped | After p50 / p95 / dropped | Δ p50 / p95 / dropped |
|---|---|---|---|---|---|---|
| Null Invaders | 0.7.2 | 1.0.3 | A | 16.7 / 33.3 / 4 | 16.7 / 16.8 / 3 | 0 / -16.5 / -1 |
| Null Invaders | 0.7.2 | 1.0.3 | B | 16.7 / 16.8 / 5 | 16.7 / 16.8 / 2 | 0 / 0 / -3 |
| Byte Runner | 0.10.2 | 1.0.1 | A | 33.3 / 50.1 / 75 | 33.3 / 50.1 / 79 | 0 / 0 / +4 |
| Byte Runner | 0.10.2 | 1.0.1 | B | 33.3 / 50.1 / 74 | 33.2 / 50.1 / 83 | -0.1 / 0 / +9 |
| Byte Runner, newest tag | 0.10.2 | 1.0.2 | A | 33.3 / 66.6 / 84 | 33.3 / 50.1 / 80 | 0 / -16.5 / -4 |
| Byte Runner, newest tag | 0.10.2 | 1.0.2 | B | 33.3 / 50 / 74 | 33.3 / 50 / 77 | 0 / 0 / +3 |
| Sherman Bytes | 0.5.2 | 1.0.1 | A | 16.7 / 33.4 / 18 | 16.7 / 16.8 / 2 | 0 / -16.6 / -16 |
| Sherman Bytes | 0.5.2 | 1.0.1 | B | 16.7 / 33.4 / 8 | 16.7 / 16.8 / 3 | 0 / -16.6 / -5 |
| Sherman Bytes, newest tag | 0.5.2 | 1.1.0 | A | 16.7 / 33.4 / 13 | 16.7 / 16.8 / 6 | 0 / -16.6 / -7 |
| Sherman Bytes, newest tag | 0.5.2 | 1.1.0 | B | 16.7 / 33.3 / 8 | 16.7 / 16.8 / 3 | 0 / -16.5 / -5 |
| Swarm Protocol | 1.3.1 | 1.4.0 | A | 66.6 / 116.7 / 121 | 66.7 / 116.7 / 121 | +0.1 / 0 / 0 |
| Swarm Protocol | 1.3.1 | 1.4.0 | B | 50 / 99.9 / 131 | 66.6 / 116.7 / 126 | +16.6 / +16.8 / -5 |
| DOM Battlefield | 0.18.4 | 1.0.1 | A | 33.3 / 66.7 / 98 | 16.7 / 50 / 46 | -16.6 / -16.7 / -52 |
| DOM Battlefield | 0.18.4 | 1.0.1 | B | 16.7 / 33.4 / 22 | 16.7 / 33.4 / 27 | 0 / 0 / +5 |
| Battlefield Blitz | none | 0.10.0 | A | n/a | 33.3 / 50 / 61 | n/a |
| Battlefield Blitz | none | 0.10.0 | B | n/a | 33.3 / 50 / 68 | n/a |

### Spread: all 6 runs per side

Range of each single run (lowest to highest), and the median fps over the 6 runs.

| Game | Before: p50 · p95 · dropped · fps (median) | After: p50 · p95 · dropped · fps (median) | 1-min load in the runs |
|---|---|---|---|
| Null Invaders | 16.7 · 16.8–33.3 · 3–10 · 55.4–57.9 (57.2) | 16.7 · 16.7–16.8 · 1–5 · 58.4–59.7 (59.3) | 1.47–1.85 |
| Byte Runner | 33.3 · 50–50.1 · 69–93 · 30.4–34.3 (32.5) | 16.7–33.3 · 50–50.1 · 69–85 · 32.9–37.3 (34.5) | 1.34–2.15 |
| Byte Runner, newest tag | 33.3 · 50–66.6 · 72–90 · 30.8–34.4 (33.0) | 16.8–33.3 · 50–66.6 · 66–84 · 32–35.5 (33.8) | 0.86–2.62 |
| Sherman Bytes | 16.7 · 33.3–33.4 · 6–19 · 46–54.4 (50.3) | 16.7 · 16.8–33.3 · 0–5 · 56.8–58.9 (57.5) | 0.14–2.2 |
| Sherman Bytes, newest tag | 16.7 · 16.8–33.4 · 6–14 · 51.3–57.5 (53.8) | 16.7 · 16.8–33.3 · 3–8 · 53.8–57.9 (57.1) | 0.19–2.63 |
| Swarm Protocol | 50–66.7 · 99.9–116.7 · 117–134 · 13.8–19.7 (16.8) | 66.6–83.3 · 116.6–133.3 · 118–136 · 12.8–15.9 (14.2) | 1.23–2.01 |
| DOM Battlefield | 16.7–50 · 33.4–99.9 · 21–127 · 19.3–49.3 (38.5) | 16.7–33.4 · 33.4–83.4 · 20–111 · 22.6–49.6 (45.2) | 1.31–1.81 |
| Battlefield Blitz | n/a | 16.7–33.3 · 33.4–50.1 · 31–71 · 33.4–41.9 (35.0) | 1.56–1.87 |

## What it shows

- **Null Invaders, Sherman Bytes:** level or better. Sherman Bytes 1.0.1 and 1.1.0 both drop fewer
  frames than 0.5.2 (p95 16.8 vs 33.4 ms, in both passes).
- **Byte Runner:** level. 1.0.1 and 1.0.2 sit inside 0.10.2's spread on every measure, and fps is
  a little higher.
- **DOM Battlefield:** level or better. Both builds have occasional slow runs (0.18.4 down to
  19.3 fps, 1.0.1 down to 22.6). Pass A favours 1.0.1, and pass B is a tie.
- **Swarm Protocol: regression.**
  - 1.4.0 is slower than 1.3.1 in both passes: 13.9 vs 16.4 fps in A, 14.6 vs 18.8 in B.
  - Over the 6 runs, 5 of 1.3.1's runs are faster than 1.4.0's fastest, and the median is 14.2 vs
    16.8 fps (-15%). The ranges overlap by one run each way (12.8–15.9 vs 13.8–19.7).
  - A rank test on the 6 + 6 runs gives p ≈ 0.03 (exact Mann-Whitney, U = 4 of 36).
  - p50 is one vsync step worse in pass B (66.6 vs 50 ms), and 1.4.0 is the only build with a run
    at 83.3 ms p50. Long-task time is also up, 7.0 vs 6.3 s per 10 s (median).
  - Dropped frames are level, because nearly every frame is over 33.4 ms in both builds.
  - The load average doesn't explain it: 1.3.1 ran under the higher load of the two (1.74–2.01 vs
    1.23–1.68).
- **Battlefield Blitz 0.10.0:** about 35 fps, p50 33.3 ms, p95 50 ms. No E0 build to compare with.

These numbers are slower than the E0 file in `../baseline/` (another machine, 2026-10-28). Only the
same-session pairs above are compared.

## Raw data

- `runs/` and `pass-b/runs/`: passes A and B. `<game>.json` is the release, `<game>@<tag>.json` is
  the E0 build, and each file keeps every run in `runs[]`.
- `runs-bf-0.18.4/` and `pass-b/runs-bf-0.18.4/`: DOM Battlefield 0.18.4.
- `runs-latest/` and `pass-b/runs-latest/`: Byte Runner 1.0.2 and Sherman Bytes 1.1.0, with their
  E0 builds played again.
- `load-samples.txt`: the load average every 10 s, 15:45 to 16:11 UTC.

## To rerun

Wait for the 1-minute load average to stay under 1.5. Set the pins above (for Battlefield 0.18.4,
copy the built hub and put the v0.18.4 tag's `dist/` at `battlefield/`; for Blitz, build its tag),
then run both passes:

```sh
npm run site:build
node scripts/perf-baseline.mjs --out docs/engine/after/runs --runs 3 \
  --releases null-invaders@v0.7.2,byte-runner@v0.10.2,sherman-bytes@v0.5.2,swarm-protocol@v1.3.1 \
  --blitz ../dom-battlefield-blitz/dist
node scripts/perf-baseline.mjs --out docs/engine/after/runs-bf-0.18.4 --runs 3 \
  --site <hub copy with dom-battlefield v0.18.4 dist/ at battlefield/> --only dom-battlefield
```

If Playwright can't find its headless shell, set `CHROMIUM_PATH` to a Chromium binary.
