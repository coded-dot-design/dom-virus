# Engine baseline: performance

Recorded 2026-10-30 with `node scripts/perf-baseline.mjs` from hub 0.48.0. Each app is played
from the built hub for 10s (after a 2s warm-up) at 1440x900 under a 4x CPU throttle in
153.0.8010.12; each number is the median of 3 runs. Compare only against runs from the same machine and browser.

| App | Version | fps | avg frame ms | p50 ms | p95 ms | frames > 33ms | long tasks | heap MB | DOM nodes | layouts/s | script ms/s | task ms/s | load avg (1 min) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sherman-bytes | 1.1.0 | 56.9 | 17.57 | 16.7 | 16.8 | 3 | 2 (152 ms) | 3.51 | 1520 | 9.6 | 138.95 | 837.36 | 1.83 |
| byte-runner | 1.0.2 | 33.9 | 29.55 | 33.3 | 50 | 77 | 4 (218 ms) | 4.1 | 1850 | 31.4 | 116.67 | 928 | 2.13 |
| byte-runner@v0.10.2 | 0.10.2 | 34 | 29.51 | 33.3 | 50 | 74 | 7 (371 ms) | 4.56 | 1819 | 28.4 | 112.95 | 928.1 | 2.47 |
| sherman-bytes@v0.5.2 | 0.5.2 | 56.1 | 17.85 | 16.7 | 33.3 | 8 | 0 (0 ms) | 3.93 | 1532 | 9.3 | 137.42 | 944.93 | 2.42 |
