# Engine baseline: performance

Recorded 2026-10-30 with `node scripts/perf-baseline.mjs` from hub 0.48.0. Each app is played
from the built hub for 10s (after a 2s warm-up) at 1440x900 under a 4x CPU throttle in
153.0.8010.12; each number is the median of 3 runs. Compare only against runs from the same machine and browser.

| App | Version | fps | avg frame ms | p50 ms | p95 ms | frames > 33ms | long tasks | heap MB | DOM nodes | layouts/s | script ms/s | task ms/s | load avg (1 min) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dom-battlefield | 0.18.4 | 48.3 | 20.74 | 16.7 | 33.4 | 22 | 7 (410 ms) | 3.41 | 2425 | 40.5 | 121.57 | 969.84 | 1.4 |
