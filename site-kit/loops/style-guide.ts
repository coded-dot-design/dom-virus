// The style guide's 3D rule demo: the TOP key lifts, presses onto its BASE and comes back (2.4 s).
// Was CSS @keyframes; same stops and easing on fizlet/timeline (site-kit/loop.ts).
import { bezier, play } from "../loop";

const none = "translate(0px,0px)";
for (const root of document.querySelectorAll<HTMLElement>(".sg-depth"))
  play(root, [[root.querySelectorAll(".top"), { period: 2.4, ease: bezier(0.2, 0.8, 0.2, 1), base: { transform: none }, stops: [[[0, 30, 100], { transform: none }], [[45, 55], { transform: "translate(-4px,-4px)" }], [[70, 85], { transform: "translate(14px,14px)" }]] }]]);
