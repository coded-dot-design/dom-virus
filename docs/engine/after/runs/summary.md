# Engine baseline: performance

Recorded 2026-10-30 with `node scripts/perf-baseline.mjs` from hub 0.48.0. Each app is played
from the built hub for 10s (after a 2s warm-up) at 1440x900 under a 4x CPU throttle in
153.0.8010.12; each number is the median of 3 runs. Compare only against runs from the same machine and browser.

| App | Version | fps | avg frame ms | p50 ms | p95 ms | frames > 33ms | long tasks | heap MB | DOM nodes | layouts/s | script ms/s | task ms/s | load avg (1 min) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sherman-bytes | 1.0.1 | 37.4 | 26.88 | 16.7 | 66.7 | 40 | 21 (2129 ms) | 3.73 | 1475 | 9.2 | 154.76 | 838.25 | 29.02 |
| swarm-protocol | 1.4.0 | 12.9 | 77.77 | 66.7 | 166.7 | 97 | 70 (6481 ms) | 3.77 | 3481 | 9.6 | 241.81 | 932.56 | 28.08 |
| byte-runner | 1.0.1 | 11.7 | 88.03 | 50.1 | 300 | 80 | 62 (7312 ms) | 4.65 | 1755 | 12.3 | 123.03 | 952.28 | 29.12 |
| null-invaders | 1.0.2 | 40.3 | 24.94 | 16.7 | 66.7 | 39 | 15 (1525 ms) | 3.13 | 1245 | 5 | 103.3 | 477.15 | 30.46 |
| dom-battlefield | 1.0.1 | 27.4 | 36.62 | 16.7 | 116.7 | 69 | 34 (3054 ms) | 2.64 | 2458 | 25.6 | 86.23 | 856.29 | 32.23 |
| null-invaders@v0.7.2 | 0.7.2 | 28.7 | 34.84 | 16.7 | 100.1 | 62 | 28 (2999 ms) | 3.43 | 1241 | 6 | 105.77 | 736.57 | 36.8 |
| byte-runner@v0.10.2 | 0.10.2 | 12.4 | 80.91 | 50 | 216.6 | 84 | 59 (5960 ms) | 4.11 | 1689 | 12.5 | 96.44 | 879.29 | 37.1 |
| sherman-bytes@v0.5.2 | 0.5.2 | 39.8 | 25.08 | 16.7 | 50 | 45 | 15 (1310 ms) | 3.61 | 1500 | 8.2 | 137.81 | 844.2 | 29.64 |
| swarm-protocol@v1.3.1 | 1.3.1 | 15.3 | 64.81 | 50.1 | 133.3 | 109 | 78 (6123 ms) | 3.85 | 3856 | 14.1 | 236.6 | 937.1 | 23.65 |
| dom-battlefield-blitz | 0.10.0 | 34.3 | 29.06 | 16.7 | 66.7 | 56 | 20 (2126 ms) | 3.44 | 292 | 5.5 | 166.72 | 877.31 | 24.35 |
