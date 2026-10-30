// DOM Battlefield's display card: tanks patrol, turrets sweep, shells fly and blast (6 s loop).
// Was CSS @keyframes; same stops, easings and delays on fizlet/timeline (site-kit/loop.ts).
import { CSS, play, type Keyframes } from "../loop";

const P = 6;
const patrol = (t: string, delay = 0): Keyframes => ({ period: P, ease: CSS.inOut, delay, base: { transform: `${t}(0px)` }, stops: [[50, { transform: `${t}(${t === "translateX" ? 26 : -22}px)` }]] });
for (const root of document.querySelectorAll<HTMLElement>(".battlefield-display")) {
  const $ = (s: string) => root.querySelectorAll<SVGElement>(s);
  const at = (el: Element) => Number((el as SVGElement).dataset.delay);
  play(root, [
    [$(".a1.patrol-x,.a2.patrol-x"), patrol("translateX")],
    [$(".a1.patrol-y,.a2.patrol-y"), patrol("translateY")],
    [$(".b1.patrol-x,.b2.patrol-x"), patrol("translateX", -3)],
    [$(".b1.patrol-y,.b2.patrol-y"), patrol("translateY", -3)],
    // Turrets sweep around their aim (--a0); CSS adds --sweep to it.
    [$(".aim"), { period: P, ease: CSS.inOut, base: { "--sweep": "0deg" }, stops: [[40, { "--sweep": "24deg" }], [70, { "--sweep": "-18deg" }]] }],
    // A shell flies out and vanishes (--k: 0 at the muzzle, 1 at the target); its blast follows.
    ...[...$(".shell")].map((el): [Element, Keyframes] => [el, { period: P, ease: CSS.linear, delay: at(el), base: { opacity: "0", "--k": "0" }, stops: [[0, { opacity: "1", "--k": "0" }], [5.3, { opacity: "1", "--k": "1" }], [[5.4, 100], { opacity: "0" }]] }]),
    ...[...$(".blast")].map((el): [Element, Keyframes] => [el, { period: P, ease: CSS.out, delay: at(el), base: { opacity: "0", transform: "scale(1)" }, stops: [[0, { opacity: "1", transform: "scale(0.3)" }], [5, { opacity: "1", transform: "scale(1.6)" }], [[10, 100], { opacity: "0", transform: "scale(2.2)" }]] }]),
  ]);
}
