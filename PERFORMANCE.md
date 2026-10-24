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
| Byte Runner flies | 12 |
| Byte Runner food | 420 |
| Byte Runner routing candidates | 952 |
| Byte Runner bonus fruit | 1 |
| Simultaneous synthesized voices | 6 |
| Decorative particles | 100 |
| Score/upgrade popups | 24 (nearby scores coalesce) |
| Liquid background paints | At most 12 Hz per visible factory, after impacts |
| HUD updates | At most 10 per simulation second, plus lifecycle transitions |
| Dirty geometry cadence | At most 12.5 Hz |
| Stable geometry cadence | 2 Hz |
| DOM rediscovery after changes | At most 2 Hz |
| Simulation delta | Capped at 34 ms |
| Built game gzip budgets | Byte 27,000 / Null 22,000 / Sherman 26,000 bytes including shared runtime |

One requestAnimationFrame chain runs while playing. Pause, loss, victory, Recall, and destroy stop scheduling. Visibility changes pause play. Motion is time-based, and the bounded delta intentionally drops excessive catch-up work after a long stall. Bullet sweeps and movement sampling prevent thin targets from being skipped at normal supported frame intervals.

Enemies, bullets, pickups and particles use the same typed, bounded entity pool. Removal swaps with the last active item; wave resets recycle storage. The pool refuses new entities at its capacity. Gate selection and scroll translation avoid temporary filtered/concatenated entity arrays. Counts stay bounded. There is no large physics engine, external sprite sheet or image decoder. Byte Runner retains native SVG character groups; Null Invaders and Sherman Bytes use canvas drawing. Null Invaders bakes finite enemy and player pose/upgrade variants into small canvas tiles, cached by character/frame/hit state and drawn with image smoothing disabled. Static binary glyph painting is cached and composed as one image each frame. Collision queries use nearby spatial-grid cells before exact intersection tests.

Range geometry and computed styles can trigger browser layout. They are outside the per-projectile path, cached, and refreshed only at the bounded cadence. Scrolling invalidates geometry; nested overflow clips are respected. The cache intentionally limits the playable portion of exceptionally dense documents. Reaching a cap does not enlarge it automatically.

`frameMs` measures the JavaScript update/draw work inside a frame. It excludes browser paint/compositing and display latency. `maxFrameMs` is the maximum since start. The browser suite emits a small headless sample into `artifacts/browser-metrics.json`; it is a regression aid, not a hardware-independent benchmark. Real-device profiling on representative host pages is still necessary before production claims.

Run each game's `npm run size` to enforce the distribution budget. Development `node_modules`, Vite, test dependencies, and the playground are not shipped in the game package. React is an optional peer dependency only for the React entry.

Release check: run browser behavior tests, inspect dark/light/mobile screenshots, verify cleanup after repeated switching, build all four games, run their rule tests and size checks, and build the hub playground.

Type annotations are erased during builds; TypeScript is a correctness tool, not a frame-rate optimization. Strict checks and generated declarations keep game/engine interfaces aligned. Pool reuse and reduced temporary allocation arrived in 0.2.0. The 0.3.0 shooter adds pooled score popups, cached pixel tiles and hit-driven liquid backgrounds; idle buttons do not repaint their backgrounds. Typography is sampled during geometry refresh, never per projectile. Removed targets release their effect records and restore owned styles. Compare real-device frame profiles before claiming an FPS improvement.

The [October 2026 audit](docs/performance-audit-2026-10.md) records current release sizes, maze-generation measurements, mobile controls, audio lifecycle checks, and engine/animation tradeoffs. Sound uses native scheduled envelopes without adding a timer or animation loop.
