# Engine baseline: performance

Recorded 2026-10-30 with `node scripts/perf-baseline.mjs` from hub 0.48.0. Each app is played
from the built hub for 10s (after a 2s warm-up) at 1440x900 under a 4x CPU throttle in
153.0.8010.12; each number is the median of 3 runs. Compare only against runs from the same machine and browser.

| App | Version | fps | avg frame ms | p50 ms | p95 ms | frames > 33ms | long tasks | heap MB | DOM nodes | layouts/s | script ms/s | task ms/s | load avg (1 min) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| sherman-bytes | 1.0.1 | 58.8 | 17.03 | 16.7 | 16.8 | 3 | 0 (0 ms) | 3.89 | 1503 | 10.4 | 140.12 | 873.51 | 1.72 |
| swarm-protocol | 1.4.0 | 14.6 | 68.49 | 66.6 | 116.7 | 126 | 90 (6954 ms) | 3.46 | 3284 | 11.7 | 241.7 | 986.98 | 1.51 |
| byte-runner | 1.0.1 | 34.8 | 28.78 | 33.2 | 50.1 | 83 | 3 (162 ms) | 3.8 | 1826 | 30 | 109.51 | 913.38 | 1.55 |
| null-invaders | 1.0.3 | 59.6 | 16.81 | 16.7 | 16.8 | 2 | 1 (64 ms) | 3.14 | 1265 | 5.7 | 77.28 | 498.01 | 1.68 |
| dom-battlefield | 1.0.1 | 48.8 | 20.49 | 16.7 | 33.4 | 27 | 8 (475 ms) | 2.93 | 3317 | 39.3 | 109.12 | 946.18 | 1.52 |
| null-invaders@v0.7.2 | 0.7.2 | 57.3 | 17.48 | 16.7 | 16.8 | 5 | 0 (0 ms) | 3.48 | 1251 | 5.1 | 73.9 | 516.8 | 1.53 |
| byte-runner@v0.10.2 | 0.10.2 | 34 | 29.41 | 33.3 | 50.1 | 74 | 9 (488 ms) | 4.33 | 1816 | 28.1 | 115.48 | 925.15 | 1.57 |
| sherman-bytes@v0.5.2 | 0.5.2 | 52.6 | 19.04 | 16.7 | 33.4 | 8 | 2 (102 ms) | 4.82 | 1528 | 9.2 | 145.4 | 959.47 | 1.91 |
| swarm-protocol@v1.3.1 | 1.3.1 | 18.8 | 53.01 | 50 | 99.9 | 131 | 87 (5992 ms) | 4.31 | 4321 | 18.4 | 231.2 | 988.38 | 1.81 |
| dom-battlefield-blitz | 0.10.0 | 34.8 | 28.73 | 33.3 | 50 | 68 | 17 (940 ms) | 3.61 | 302 | 5.7 | 172.4 | 989.07 | 1.67 |
