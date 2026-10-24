# DOM Virus performance and controls audit — October 24, 2026

The current DOM-attached rendering architecture stays in place. This release expands Byte Runner's safe whitespace graph, adds quiet synthesized audio to the three core games, preserves Swarm's existing cues, and standardizes the scoreboard action row. No runtime dependencies, sound downloads, extra animation loops or sound timers were added.

## Findings and changes

| Area | Finding | Implemented change / retained contract |
| --- | --- | --- |
| Byte maze | A few content anchors left large safe regions unused | Broader whitespace branches and up to 12 alternate connections use the same collision-checked graph. Frog remains free; flies remain on corridors. |
| Maze generation | Expanded-route selection repeatedly compared every prior node | Cache nearest-route distances and update them only for newly selected nodes; accumulate route length while connecting. Identical output in 36 pre/post-cleanup fixture comparisons. |
| HUD | Generic and arcade panels duplicated markup; pause text was overwritten at every notification | One arcade shell and one SVG action definition. Update pause geometry/attributes only when state changes. Clear detached HUD references on teardown. |
| Tank snapshots | Five filtered arrays were allocated per snapshot | Count captured bases and structures in two passes, without temporary arrays. Public fields, values and gameplay remain unchanged. |
| Mobile | Build commands disappeared with the minimized HUD | Cover, Pillbox and Mine share the existing action dispatch, beside D-pad/Fire. Compact tank HUD retains armor and scrap. |
| Audio | Three core games had no effects; Swarm already had a complete synth | New lazy six-voice synth for core games, fixed cue/cooldown vocabulary, short gain envelopes, gesture-only unlock, persisted mute, pause silence and context closure on Recall. Swarm's tested audio remains intact. |
| Lifecycle | Existing single RAF and ownership cleanup are appropriate | Preserve simulation clocks, pools, resize/scroll behavior, visibility pause and native DOM restoration. Minimize changes presentation only. |
| Animation | Byte uses retained SVG; ship uses finite cached canvas variants | Retain these paths. No sprite markup rebuild per frame, continuous cache keys, extra timers or continuous blur effects. |

The shared header always exposes **sound, pause/resume, minimize/expand, close/Recall**, in that order, with SVG icons and 44-pixel hit areas. Swarm's minimized state now retains this header instead of hiding those actions behind a launcher. Paused state, score and waves survive minimizing/expanding.

## Measurements

Release baselines were rebuilt from the previously shipped Git HEADs using the existing scripts. Bytes are gzip bytes, not rounded KiB. React remains external.

| Game | Before | After | Delta | Enforced ceiling |
| --- | ---: | ---: | ---: | ---: |
| Byte Runner index | 23,759 | 25,776 | +2,017 | 27,000 |
| Null Invaders index | 18,941 | 20,618 | +1,677 | 22,000 |
| Sherman Bytes index | 22,901 | 24,669 | +1,768 | 26,000 |
| Swarm full immediate graph | 33,857 | 34,332 | +475 | Existing module-graph report |

React entries are 25,860 / 20,700 / 24,753 bytes respectively. Swarm's initial deferred scheduler remains a separate small path; the complete deferred graph is 35,462 bytes. The modest budget increases explicitly cover sound, persistent controls, mobile abilities and the expanded maze.

For a fixed obstacle at 30–60% width and 30–50% height, route length changes from 1,400 to 4,465 pixels at 390×844 and from 2,874 to 9,964 pixels at 1200×900. Tests also require at least twice the previous 5,584-pixel coverage at 2500×1400. These fixtures measure navigable length, not a food-count increase. Fully occluded or narrow disconnected layouts remain limited to available safe whitespace; no overlap is introduced just to meet a numeric target.

A Node 24 microbenchmark of the *expanded* maze before and after nearest-distance caching used five warmups and 30 samples. This compares the cleanup with its equivalent expanded implementation, not the smaller 0.8.0 maze:

| Viewport | Median before cleanup | Median after | p95 before | p95 after |
| --- | ---: | ---: | ---: | ---: |
| 390×844 | 1.79 ms | 1.26 ms | 2.11 ms | 2.13 ms |
| 1200×900 | 11.22 ms | 6.09 ms | 16.52 ms | 9.46 ms |
| 2500×1400 | 9.07 ms | 5.32 ms | 9.60 ms | 7.01 ms |

The larger maze costs more layout-time work than the old sparse maze. Generation runs on geometry changes, not every animation frame. These local samples exclude browser layout/paint and are not a device-independent FPS claim.

## Engine and animation choices

| Technique | Decision for this codebase |
| --- | --- |
| Retained SVG groups + cached Canvas tiles | Keep. They preserve element ownership, native scrolling, crisp pixels and the existing collision clock. Cache repeated drawing and use transforms for motion. |
| Native Web Animations | Appropriate for small, owned UI responses and hit effects; connect pause/play/cancel to the existing lifecycle. Do not give character simulation a second clock. |
| PixiJS | Its WebGL/WebGPU renderer and particle facilities are useful if profiling eventually shows much larger canvas scenes are render-bound. Current bounded scenes do not justify migrating DOM ownership or adding another renderer. No unmeasured bundle/FPS claim is made. |
| Phaser | Scene, input and timestep systems substantially overlap this project's existing runtime. Retain the current runtime unless the product grows into independent game scenes requiring those systems. |
| Web Audio oscillators | Use now for short arcade effects. No codec/download costs or sample decoder. Six active voices maximum; frequent eating/fire events are rate-limited. |
| Richer effects | Prefer brief color/frame changes, short transform recoil, small pooled particles and finite pre-baked variants. Profile actual host pages before adding filters or more layers. |

Sources reviewed: [MDN Canvas optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas), [MDN Web Animations](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API), [MDN Web Audio practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices), [PixiJS introduction](https://pixijs.com/8.x/guides/getting-started/intro), [Phaser scenes](https://docs.phaser.io/phaser/concepts/scenes), [Phaser timestep](https://docs.phaser.io/api-documentation/class/core-timestep). Engine selection is our inference from those capabilities and this project's measured constraints.

## Validation and practical limits

- Existing type checks, unit tests, package/declaration checks, builds and size reports for all affected repositories.
- Existing ownership, keyboard/Space capture, multi-touch, movement, sprite-cache, reduced-motion, scroll/resize, character-state and Recall browser regressions.
- Expanded maze tests require doubled fixture coverage, connected routes and collision-free food/edges; browser checks cover real unmarked controls, media and non-edible text.
- New audio unit tests cover no-gesture/no-browser cases, mute persistence, unknown events, six-voice cap, pause silence and repeated context teardown.
- New browser suite covers all four games × desktop/mobile × light/dark: native audio waveform, mute, pause/resume, fixed header order, 44-pixel controls, minimized building, Space firing without scrolling, closed audio contexts and restored DOM.
- Canonical site kit is synchronized and all five sites built. Compiled hub checks cover mobile menu, themes, motion, code previews and real Byte Runner launch/whitespace paths.

Browser testing uses headless Chromium with mobile/touch emulation. It does not replace listening on speakers/headphones or testing Safari on a physical iPhone. No universal frame-rate or hardware battery-use guarantee is implied. Audio events do not alter scoring, projectile timing, resource costs, enemy rules or collisions.
