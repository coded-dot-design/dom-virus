# Engine baseline: performance

Recorded 2026-10-30 with `node scripts/perf-baseline.mjs` from hub 0.48.0. Each app is played
from the built hub for 10s (after a 2s warm-up) at 1440x900 under a 4x CPU throttle in
153.0.8010.12; each number is the median of 3 runs. Compare only against runs from the same machine and browser.

| App | Version | fps | avg frame ms | p50 ms | p95 ms | frames > 33ms | long tasks | heap MB | DOM nodes | layouts/s | script ms/s | task ms/s | load avg (1 min) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sherman-bytes | 1.0.1 | 56.8 | 17.63 | 16.7 | 16.8 | 2 | 1 (133 ms) | 3.79 | 1503 | 10.3 | 143.12 | 865.74 | 0.73 |
| swarm-protocol | 1.4.0 | 13.9 | 71.94 | 66.7 | 116.7 | 121 | 88 (7109 ms) | 3.93 | 3443 | 10.9 | 256.02 | 985.98 | 1.25 |
| byte-runner | 1.0.1 | 34.4 | 29.12 | 33.3 | 50.1 | 79 | 5 (254 ms) | 4.1 | 1830 | 31.2 | 114.62 | 921.63 | 1.62 |
| null-invaders | 1.0.3 | 58.4 | 17.15 | 16.7 | 16.8 | 3 | 1 (68 ms) | 3.01 | 1265 | 5.9 | 84.02 | 506.24 | 1.73 |
| dom-battlefield | 1.0.1 | 41.7 | 24.02 | 16.7 | 50 | 46 | 18 (990 ms) | 2.73 | 2449 | 37.4 | 112.54 | 978.45 | 1.48 |
| null-invaders@v0.7.2 | 0.7.2 | 55.8 | 17.98 | 16.7 | 33.3 | 4 | 1 (51 ms) | 3.13 | 1243 | 4.6 | 83.94 | 516.86 | 1.49 |
| byte-runner@v0.10.2 | 0.10.2 | 32.4 | 30.97 | 33.3 | 50.1 | 75 | 7 (398 ms) | 4.15 | 1813 | 29.4 | 114.41 | 920.79 | 2.09 |
| sherman-bytes@v0.5.2 | 0.5.2 | 50.1 | 19.96 | 16.7 | 33.4 | 18 | 2 (116 ms) | 4.12 | 1526 | 9.1 | 160.95 | 975.92 | 2.07 |
| swarm-protocol@v1.3.1 | 1.3.1 | 16.4 | 60.67 | 66.6 | 116.7 | 121 | 91 (6754 ms) | 3.95 | 4177 | 16.5 | 246.83 | 988.03 | 1.99 |
| dom-battlefield-blitz | 0.10.0 | 35.3 | 28.37 | 33.3 | 50 | 61 | 11 (657 ms) | 3.61 | 299 | 6.2 | 173.04 | 981.72 | 1.74 |
