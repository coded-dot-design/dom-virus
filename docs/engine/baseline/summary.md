# Engine baseline: performance

Recorded 2026-10-28 with `node scripts/perf-baseline.mjs` from hub 0.43.0. Each app is played
from the built hub for 10s (after a 2s warm-up) at 1440x900 under a 4x CPU throttle in
153.0.8010.12. Compare only against runs from the same machine and browser.

| App | Version | fps | avg frame ms | p95 ms | frames > 33ms | long tasks | heap MB | DOM nodes | layouts/s | script ms/s | task ms/s |
|---|---|---|---|---|---|---|---|---|---|---|---|
| sherman-bytes | 0.5.2 | 60.1 | 16.67 | 16.8 | 0 | 0 (0 ms) | 4.01 | 1229 | 9.3 | 85.22 | 564.23 |
| swarm-protocol | 1.3.1 | 31.9 | 31.29 | 50.1 | 86 | 18 (1141 ms) | 2.79 | 3979 | 24.2 | 198.4 | 966.77 |
| byte-runner | 0.10.2 | 47.7 | 21.03 | 33.4 | 29 | 0 (0 ms) | 4.3 | 1568 | 43.7 | 89.27 | 826.3 |
| null-invaders | 0.7.2 | 59.9 | 16.69 | 16.8 | 0 | 0 (0 ms) | 3.2 | 1004 | 5.8 | 51.97 | 376.37 |
| dom-battlefield | 0.18.4 | 58.3 | 17.15 | 16.8 | 2 | 0 (0 ms) | 3.95 | 2421 | 48.1 | 95.7 | 723.2 |
