// The engineering diagrams (Architecture.astro): the scan and packets of "the page becomes the
// board", the frame loop's tracer and steps, and "change it, give it back". Was CSS @keyframes; same
// stops, easings and delays on fizlet/timeline (site-kit/loop.ts). The pause key in each figure
// holds its engine (data-paused).
import { CSS, play, type Keyframes } from "../loop";

const packet = (delay = 0): Keyframes => ({ period: 2.5, ease: CSS.linear, delay, base: { "stroke-dashoffset": "0px" }, stops: [[100, { "stroke-dashoffset": "-212px" }]] });
// A frame step or a phase is lit (--on: 1) for its first quarter or third of the 6 s loop.
const lit = (until: number, delay: number): Keyframes => ({ period: 6, ease: "steps(1)", delay, base: { "--on": "0" }, stops: [[[0, until], { "--on": "1" }], [[until + 1, 100], { "--on": "0" }]] });
// The exchange icons nod as geometry is read, then as owned changes are written.
const nod = (from: number, to: number, y: number): Keyframes => ({ period: 6, ease: CSS.inOut, base: { transform: "translateY(0px)", opacity: "0.6" }, stops: [[[0, from, 100], { transform: "translateY(0px)", opacity: "0.6" }], [[from + 15, to], { transform: `translateY(${y}px)`, opacity: "1" }]] });

for (const root of document.querySelectorAll<HTMLElement>(".system-map")) {
  const $ = (s: string) => root.querySelectorAll<Element>(s);
  play(root, [
    [$(".lab-scan"), { period: 5, ease: CSS.inOut, base: { transform: "translateX(0px) scaleX(1)", opacity: "1" }, stops: [[[0, 15, 100], { transform: "translateX(0px) scaleX(1)", opacity: "0.8" }], [[40, 65], { transform: "translateX(218px) scaleX(0.65)", opacity: "1" }], [85, { opacity: "0.25" }]] }],
    [$(".lab-packet:not(.output-packet)"), packet()],
    [$(".output-packet"), packet(-1.25)],
    [$(".map-exchange span:first-child .ui-icon"), nod(20, 55, 4)],
    [$(".map-exchange span:last-child .ui-icon"), nod(50, 80, -4)],
  ]);
}
for (const root of document.querySelectorAll<HTMLElement>(".tick-map")) {
  const $ = (s: string) => root.querySelectorAll<Element>(s);
  play(root, [
    [$(".frame-tracer"), { period: 6, ease: CSS.linear, base: { "stroke-dashoffset": "0px" }, stops: [[100, { "stroke-dashoffset": "-100px" }]] }],
    ...[0, 4.5, 3, 1.5].map((d, i): [NodeListOf<Element>, Keyframes] => [$(`.step-${i}`), lit(24, -d)]),
  ]);
}
for (const root of document.querySelectorAll<HTMLElement>(".ownership-map")) {
  const $ = (s: string) => root.querySelectorAll<Element>(s);
  const word = (on: string, off: string): Keyframes => ({ period: 6, ease: "steps(1)", base: { opacity: on }, stops: [[[0, 66, 100], { opacity: on }], [33, { opacity: off }]] });
  play(root, [
    [$(".original-word"), word("1", "0")],
    [$(".changed-word"), word("0", "1")],
    [$(".phase-original"), lit(32, 0)],
    [$(".phase-edit"), lit(32, -4)],
    [$(".phase-restore"), lit(32, -2)],
    [$(".ownership-progress i"), { period: 6, ease: CSS.linear, base: { transform: "scaleX(1)" }, stops: [[0, { transform: "scaleX(0)" }], [100, { transform: "scaleX(1)" }]] }],
  ]);
}
