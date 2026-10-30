// Under the hood labs. The labs are Fizlet scenes (vendor/fizlet/labs, the same ones as the Fizlet
// gallery; never edit them here): each is one engine on Fizlet's shared clock (one
// requestAnimationFrame for every engine on the page), settles when idle, sleeps off screen and
// writes the page only through its ledger. This file mounts them and runs the engine HUD, which
// reads the engines themselves: frame rate from the shared clock, entities from each lab, labs awake
// = lab engines running right now. Reduced motion: nothing moves on its own; buttons still work.
import { createEngine } from "../vendor/fizlet/kernel/index";
import { board, duel, pipeline, pool, recall, type Lab, type LabMount } from "../vendor/fizlet/labs/index";

const MAKERS: Record<string, LabMount> = { duel, board, pool, recall, pipeline };

export function startLabs(root: HTMLElement) {
  const hud = root.querySelector<HTMLElement>("[data-engine-hud]");
  // The HUD's own engine: awake while any lab runs, then it settles too (and shows "--").
  const meter = createEngine({ root, settle: 0.3, pause: { offscreen: false } });
  const labs: Lab[] = [];
  root.querySelectorAll<HTMLElement>("[data-lab]").forEach((el) => {
    const make = MAKERS[el.dataset.lab ?? ""], figure = el.querySelector<HTMLElement>(".fzl");
    if (make && figure) labs.push(make(figure, { onWake: () => meter.wake() }));
  });
  const running = () => labs.some((lab) => lab.engine.running);
  if (hud) {
    const L = meter.ledger;
    const out = (sel: string) => {
      const el = hud.querySelector<HTMLElement>(sel)!;
      return (el.firstChild as Text | null) ?? el.appendChild(document.createTextNode(""));
    };
    const fpsOut = out("[data-hud-fps]"), entOut = out("[data-hud-entities]"), awakeOut = out("[data-hud-awake]");
    out("[data-hud-total]").data = String(labs.length);
    // fps (eased), ms to the next HUD write (4 Hz, apart from the labs' frames), labs awake.
    const s = new Float64Array([60, 0, 0]);
    meter.add({
      read(e) {
        let n = 0;
        for (const lab of labs) n += lab.engine.running ? 1 : 0;
        s[2] = n;
        const d = e.timing[0]!;
        if (n) e.busy();
        if (n && d > 0) s[0]! += (1 / Math.max(d, 0.001) - s[0]!) * 0.08;
      },
      render(e) {
        if ((s[1]! -= e.timing[0]! * 1000) > 0 && s[2]) return;
        s[1] = 250;
        let n = 0;
        if (s[2]) for (const lab of labs) n += lab.engine.running ? lab.entities() : 0;
        L.attr(hud, "data-idle", s[2] ? null : "");
        L.text(fpsOut, s[2] ? String(Math.round(s[0]!)) : "--");
        L.text(entOut, String(n));
        L.text(awakeOut, String(s[2]));
      },
    });
    meter.start();
  }
  (window as unknown as { __lab?: unknown }).__lab = { awake: () => labs.filter((lab) => lab.engine.running).length, running };
}
