# Engine baseline: performance

Recorded 2026-10-30 with `node scripts/perf-baseline.mjs` from hub 0.48.0. Each app is played
from the built hub for 10s (after a 2s warm-up) at 1440x900 under a 4x CPU throttle in
153.0.8010.12; each number is the median of 3 runs. Compare only against runs from the same machine and browser.

| App | Version | fps | avg frame ms | p50 ms | p95 ms | frames > 33ms | long tasks | heap MB | DOM nodes | layouts/s | script ms/s | task ms/s | load avg (1 min) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sherman-bytes | 1.1.0 | 57.3 | 17.45 | 16.7 | 16.8 | 6 | 3 (215 ms) | 3.54 | 1516 | 9.5 | 133.11 | 827.23 | 0.6 |
| byte-runner | 1.0.2 | 33.6 | 29.86 | 33.3 | 50.1 | 80 | 9 (482 ms) | 3.97 | 1853 | 29.7 | 118.11 | 918.65 | 1.04 |
| byte-runner@v0.10.2 | 0.10.2 | 31.9 | 31.4 | 33.3 | 66.6 | 84 | 10 (570 ms) | 4.07 | 1810 | 27.5 | 121.1 | 925.94 | 1.73 |
| sherman-bytes@v0.5.2 | 0.5.2 | 53.2 | 18.83 | 16.7 | 33.4 | 13 | 0 (0 ms) | 3.83 | 1528 | 9.2 | 144.4 | 962.94 | 2.18 |
