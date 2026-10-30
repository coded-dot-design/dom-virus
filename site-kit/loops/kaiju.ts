// The coming-soon climb on its detail page: the ape climbs, choppers hover and fire, a person
// falls, SMASH! pops, a line burns and a live wire zaps. Was CSS @keyframes; same stops, easings
// and delays on fizlet/timeline (site-kit/loop.ts).
import { CSS, play, type Keyframes } from "../loop";

const tracer = (delay = 0): Keyframes => ({ period: 1.3, ease: CSS.linear, delay, base: { opacity: "0", transform: "translateX(0px)" }, stops: [[0, { opacity: "1" }], [60, { opacity: "1", transform: "translateX(-120px)" }], [[61, 100], { opacity: "0" }]] });
const zap = (a: number, b: number, blur: number) => `0 0 0 2px rgba(25,240,255,${a}),0 0 ${blur}px rgba(25,240,255,${b})`;
for (const root of document.querySelectorAll<HTMLElement>(".kaiju-display")) {
  const $ = (s: string) => root.querySelectorAll<HTMLElement>(s);
  play(root, [
    [$(".ape"), { period: 4, ease: "steps(8)", base: { transform: "translate(0px,0px)" }, stops: [[0, { transform: "translate(0px,40px)" }], [50, { transform: "translate(-6px,-10px)" }], [100, { transform: "translate(0px,40px)" }]] }],
    [$(".chopper"), { period: 1.6, ease: CSS.inOut, base: { transform: "translate(0px,0px)" }, stops: [[50, { transform: "translate(-8px,-5px)" }]] }],
    [$(".chopper s"), { period: 0.12, ease: CSS.linear, base: { transform: "scaleX(1)" }, stops: [[50, { transform: "scaleX(0.3)" }]] }],
    [$(".t1"), tracer()],
    [$(".t2"), tracer(0.6)],
    [$(".person"), { period: 2.2, ease: CSS.in, base: { opacity: "1", transform: "translateY(0px) rotate(0deg)" }, stops: [[0, { opacity: "1" }], [90, { opacity: "1", transform: "translateY(100px) rotate(540deg)" }], [100, { opacity: "0" }]] }],
    [$(".pow"), { period: 4, ease: CSS.out, base: { opacity: "0", transform: "scale(1)" }, stops: [[[0, 44], { opacity: "0", transform: "scale(0.4)" }], [48, { opacity: "1", transform: "scale(1.25)" }], [60, { opacity: "1", transform: "scale(1)" }], [[70, 100], { opacity: "0" }]] }],
    [$(".blk i.burn"), { period: 0.5, ease: "steps(2)", base: { filter: "hue-rotate(0deg) brightness(1)" }, stops: [[50, { filter: "hue-rotate(-20deg) brightness(1.3)" }]] }],
    [$(".blk.live"), { period: 1.1, ease: "steps(2)", base: { "box-shadow": zap(0.267, 0.4, 18) }, stops: [[50, { "box-shadow": zap(1, 1, 26) }]] }],
  ]);
}
