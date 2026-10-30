// Idle loops on Fizlet: the detail-page scenes and the diagrams (every animation on the site runs
// on Fizlet; only subtle CSS, a blinking LED, runs without it). A loop is a CSS @keyframes rule
// written as data (stops in percent, a period, a CSS easing per segment, an animation-delay), played
// by fizlet/timeline on one engine per scene:
// - the engine sleeps while its scene is off screen or the tab is hidden (its own pause rules), and
//   while the scene's pause key holds it (data-paused, set by client.ts);
// - every write goes through the ledger, so destroy() (Recall) puts each style back as it was;
// - reduced motion never builds it: the scene keeps its CSS still frame (turning it on later Recalls).
import { createEngine, type Engine } from "../vendor/fizlet/kernel/engine";
import { timeline, type Timeline } from "../vendor/fizlet/timeline";

type Ease = (p: number) => number;
/** A CSS cubic-bezier(x1, y1, x2, y2): the same curve the keyframes had (fizlet tables it once). */
export function bezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const at = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t * t + t ** 3;
  return (p) => {
    let lo = 0,
      hi = 1,
      t = p;
    for (let i = 0; i < 24; i++) (at(x1, x2, t) < p ? (lo = t) : (hi = t)), (t = (lo + hi) / 2);
    return at(y1, y2, t);
  };
}
/** CSS's named easings (fizlet's own `in`/`out` are cubic powers, not these curves). */
export const CSS = {
  ease: bezier(0.25, 0.1, 0.25, 1),
  in: bezier(0.42, 0, 1, 1),
  out: bezier(0, 0, 0.58, 1),
  inOut: bezier(0.42, 0, 0.58, 1),
  linear: "linear",
} as const;

/** Keyframe stops: [percent or percents, properties], as in @keyframes. */
export type Stops = [number | number[], Record<string, string>][];
export interface Keyframes {
  /** Seconds per play (animation-duration). */
  period: number;
  stops: Stops;
  /** Each property's value outside the animation: CSS's implicit 0% and 100%. */
  base: Record<string, string>;
  /** Per segment, as animation-timing-function (default CSS ease). */
  ease?: Ease | string;
  /** Seconds, as animation-delay (negative starts part way). Steady state only: a positive delay
   *  is a phase offset, which matches CSS from the first full play on. */
  delay?: number;
}
export interface Loops {
  engine: Engine;
  /** Freeze every loop at `t` seconds of the scene's clock (screenshots, tests). */
  seek(t: number): void;
  /** Recall: stop for good and give every style back. */
  destroy(): void;
}

/** Play `loops` (targets + keyframes) in `root`; `root.loop` holds the controller (tests, Recall). */
export function play(root: HTMLElement, loops: [Element | ArrayLike<Element>, Keyframes][]) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let live: Loops | undefined;
  const sync = () => {
    if (reduce.matches) live?.destroy(), (live = undefined);
    else live ??= build(root, loops);
    (root as HTMLElement & { loop?: Loops }).loop = live;
  };
  reduce.addEventListener("change", sync);
  sync();
}

function build(root: HTMLElement, loops: [Element | ArrayLike<Element>, Keyframes][]): Loops {
  // No editable rule: typing in a field has nothing to do with an idle loop.
  const engine = createEngine({ root, settle: 1, pause: { editable: false } });
  // One timeline per (period, phase): a loop repeats forever at its own length.
  const lines = new Map<string, [Timeline, number]>();
  for (const [targets, k] of loops) {
    const phase = (((-(k.delay ?? 0)) % k.period) + k.period) % k.period, key = `${k.period}/${phase}`;
    if (!lines.has(key)) {
      const tl = timeline(engine, { repeat: Infinity, motion: true });
      // Off screen or in a hidden tab the engine pauses and calls each system's pause(): a timeline's
      // own pause() would then stop the loop for good. Run it through its step and render only, so
      // it carries on where it was when the engine wakes. (Fizlet 0.20.0: Timeline.pause doubles as
      // the System pause hook.)
      engine.remove(tl);
      engine.add({ step: tl.step, render: tl.render });
      lines.set(key, [tl, phase]);
    }
    const tl = lines.get(key)![0];
    for (const prop in k.base) {
      // This property's stops, with the base filling the implicit 0% and 100%.
      const at: [number, string][] = [];
      for (const [pcts, props] of k.stops) for (const p of ([] as number[]).concat(pcts)) if (props[prop] != null) at.push([p, props[prop]!]);
      at.sort((a, b) => a[0] - b[0]);
      if (at[0]?.[0] !== 0) at.unshift([0, k.base[prop]!]);
      if (at[at.length - 1]![0] !== 100) at.push([100, k.base[prop]!]);
      for (let i = 1; i < at.length; i++) {
        const [p0, v0] = at[i - 1]!, [p1, v1] = at[i]!;
        tl.to(targets, { [prop]: [v0, v1] }, { at: (p0 / 100) * k.period, dur: ((p1 - p0) / 100) * k.period, ease: k.ease ?? CSS.ease });
      }
    }
  }
  for (const [tl, phase] of lines.values()) tl.seek(phase).play();
  // The scene's pause key (client.ts sets data-paused): held, the engine does no frames at all.
  const held = () => (root.dataset.paused === "true" ? engine.stop() : engine.start());
  const watch = new MutationObserver(held);
  watch.observe(root, { attributes: true, attributeFilter: ["data-paused"] });
  engine.signal.addEventListener("abort", () => watch.disconnect(), { once: true });
  held();
  return {
    engine,
    seek(t) {
      for (const [tl, phase] of lines.values()) tl.pause().seek(phase + t);
      engine.advance(engine.dt); // one step samples the playheads, its render writes them
    },
    destroy: () => engine.destroy(),
  };
}
