# Performance contract

These are implementation limits, not a promise of a particular frame rate on every site.

| Resource | New-game limit |
| --- | ---: |
| Active animation loops | 1 |
| Canvas backing resolution | 1.5 × CSS pixel ratio maximum |
| Indexed glyphs | 8,000 |
| Selected text containers | 160 |
| Text walker visits | 6,000 per scan |
| Glyph measurements per geometry refresh | 900 |
| Factories / gates | 32 |
| Null Invaders aliens | 48 |
| Null Invaders bullets | 80 |
| Byte Runner ghosts | 40 |
| Byte Runner uncollected pickups | 4 |
| Decorative particles | 100 |
| HUD updates | At most 10 per simulation second, plus lifecycle transitions |
| Dirty geometry cadence | At most 12.5 Hz |
| Stable geometry cadence | 2 Hz |
| DOM rediscovery after changes | At most 2 Hz |
| Simulation delta | Capped at 34 ms |
| Built game gzip budget | 18,000 bytes including shared runtime |

One requestAnimationFrame chain runs while playing. Pause, loss, victory, Recall, and destroy stop scheduling. Visibility changes pause play. Motion is time-based, and the bounded delta intentionally drops excessive catch-up work after a long stall. Bullet sweeps and movement sampling prevent thin targets from being skipped at normal supported frame intervals.

Enemies, bullets, and particles reuse objects within a round. Counts stay bounded. There is no large physics engine, sprite atlas, image decoder, or per-enemy DOM node. Static binary glyph painting is cached and composed as one image each frame. Collision queries use nearby spatial-grid cells before exact intersection tests.

Range geometry and computed styles can trigger browser layout. They are outside the per-projectile path, cached, and refreshed only at the bounded cadence. Scrolling invalidates geometry; nested overflow clips are respected. The cache intentionally limits the playable portion of exceptionally dense documents. Reaching a cap does not enlarge it automatically.

`frameMs` measures the JavaScript update/draw work inside a frame. It excludes browser paint/compositing and display latency. `maxFrameMs` is the maximum since start. The browser suite emits a small headless sample into `artifacts/browser-metrics.json`; it is a regression aid, not a hardware-independent benchmark. Real-device profiling on representative host pages is still necessary before production claims.

Run each game's `npm run size` to enforce the distribution budget. Development `node_modules`, Vite, test dependencies, and the playground are not shipped in the game package. React is an optional peer dependency only for the React entry.

Release check: run browser behavior tests, inspect dark/light/mobile screenshots, verify cleanup after repeated switching, build both games, run their rule tests and size checks, and build the hub playground.
