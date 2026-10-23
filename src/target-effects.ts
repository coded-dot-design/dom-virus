import type { BoardTarget, Point } from "./contracts.js";
import { MutationLedger } from "./ledger.js";
import { clamp } from "./math.js";

interface Surface {
  ledger: MutationLedger;
  color: string;
  empty: string;
  background: string;
  size: string;
  position: string;
  repeat: string;
  hitAt: number;
  impact: number;
  fill: number;
  lastPaint: number;
  animating: boolean;
}
// Swarm's health colors and damped liquid surface, shared as presentation only.
export function targetSignal(health: number, color = "#06c4ff") {
  const fill = clamp(health, 0, 100);
  return {
    fill,
    color: fill > 60 ? color : fill > 25 ? "#cdde00" : "#f4457a",
    period: 0.7 + 2.1 * (1 - fill / 100),
  };
}
export function liquidFill(
  fill: number,
  color: string,
  energy = 0,
  time = 0,
  impact = 0.5,
): string {
  if (energy <= 0 || fill <= 0 || fill >= 100)
    return `linear-gradient(to top,${color} 0%,${color} ${fill}%,transparent ${fill}%,transparent 100%)`;
  const level = 100 - fill;
  const amplitude = Math.min(7, fill * 0.45, level * 0.45) * energy * energy;
  let path = "";
  let previousY = level;
  for (let i = 0; i < 7; i++) {
    const x = (i * 100) / 6;
    const distance = Math.abs(x / 100 - impact);
    const dip = Math.exp(-distance * distance * 28) * Math.exp(-time * 12);
    const wave =
      Math.sin(distance * 15 - time * 20) * (1 - Math.exp(-time * 16));
    const y = level + amplitude * (dip + wave * 0.55);
    const mid = (x - 100 / 12).toFixed(2);
    path +=
      i === 0
        ? `M0 ${y.toFixed(2)}`
        : `C${mid} ${previousY.toFixed(2)} ${mid} ${y.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
    previousY = y;
  }
  // Colors come from computed CSS, but still escape XML delimiters.
  const safe = color.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path fill="${safe}" d="${path}L100 100H0Z"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
export class TargetEffects {
  private readonly surfaces = new Map<BoardTarget, Surface>();
  private time = 0;
  private readonly win: Window;
  constructor(win: Window) {
    this.win = win;
  }
  hit(target: BoardTarget, impact?: Point) {
    const surface = this.surface(target);
    surface.hitAt = this.time;
    surface.impact =
      impact && target.rect
        ? clamp((impact.x - target.rect.left) / target.rect.width, 0, 1)
        : 0.5;
  }
  private surface(target: BoardTarget): Surface {
    let s = this.surfaces.get(target);
    if (!s) {
      const css = this.win.getComputedStyle(target.element);
      const custom =
        css.getPropertyValue("--virus-power-color").trim() ||
        css.getPropertyValue("--swarm-power-color").trim();
      const background = css.backgroundColor;
      const probeCanvas = this.win.document.createElement("canvas");
      probeCanvas.width = probeCanvas.height = 1;
      const probe = probeCanvas.getContext("2d", { willReadFrequently: true });
      let darkText = false;
      if (probe) {
        probe.fillStyle = css.color;
        probe.fillRect(0, 0, 1, 1);
        const rgb = probe.getImageData(0, 0, 1, 1).data;
        darkText = rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722 < 140;
      }
      s = {
        ledger: new MutationLedger(),
        empty: darkText ? "#dce3df" : "#252c32",
        color:
          custom ||
          (background !== "rgba(0, 0, 0, 0)" && background !== "transparent"
            ? background
            : "#06c4ff"),
        background: css.backgroundImage,
        size: css.backgroundSize,
        position: css.backgroundPosition,
        repeat: css.backgroundRepeat,
        hitAt: -100,
        impact: 0.5,
        fill: -1,
        lastPaint: -100,
        animating: false,
      };
      this.surfaces.set(target, s);
    }
    return s;
  }
  draw(
    ctx: CanvasRenderingContext2D,
    targets: readonly BoardTarget[],
    time: number,
    reduced: boolean,
  ) {
    this.time = time;
    ctx.save();
    for (const target of targets) {
      if (!target.visible || !target.rect || !target.element.isConnected)
        continue;
      const s = this.surface(target);
      const signal = targetSignal(
        (target.health / target.maxHealth) * 100,
        s.color,
      );
      const elapsed = time - s.hitAt;
      const energy = reduced ? 0 : clamp(1 - elapsed / 0.65, 0, 1);
      // At most 12 DOM paints/sec per visible target, only while a hit ripples.
      if (
        (s.fill < 0 || time - s.lastPaint >= 1 / 12) &&
        (signal.fill !== s.fill || energy > 0 || s.animating)
      ) {
        const layer = liquidFill(
          signal.fill,
          signal.color,
          energy,
          elapsed,
          s.impact,
        );
        s.ledger.writeStyle(
          target.element,
          "background-image",
          `${layer}${s.background === "none" ? "" : "," + s.background}`,
          "important",
        );
        s.ledger.writeStyle(
          target.element,
          "background-size",
          `100% 100%,${s.size}`,
          "important",
        );
        s.ledger.writeStyle(
          target.element,
          "background-position",
          `0 0,${s.position}`,
          "important",
        );
        s.ledger.writeStyle(
          target.element,
          "background-repeat",
          `no-repeat,${s.repeat}`,
          "important",
        );
        // A quiet empty tank beneath the fill keeps draining readable on solid buttons.
        s.ledger.writeStyle(
          target.element,
          "background-color",
          s.empty,
          "important",
        );
        s.fill = signal.fill;
        s.lastPaint = time;
        s.animating = energy > 0;
      }
      const r = target.rect;
      const alive = target.health > 0;
      ctx.strokeStyle = alive ? signal.color : "#74dfa1";
      ctx.lineWidth = 1.5;
      if (!alive || reduced) {
        ctx.globalAlpha = 0.6;
        ctx.strokeRect(r.left - 3, r.top - 3, r.width + 6, r.height + 6);
      } else {
        for (let band = 0; band < 2; band++) {
          const phase = (time / signal.period + band * 0.5) % 1;
          const spread = 2 + phase * 12;
          ctx.globalAlpha = (1 - phase) ** 2 * 0.6;
          ctx.beginPath();
          ctx.roundRect(
            r.left - spread,
            r.top - spread,
            r.width + spread * 2,
            r.height + spread * 2,
            7 + spread,
          );
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }
  sync(targets: readonly BoardTarget[]) {
    for (const [target, surface] of this.surfaces)
      if (!targets.includes(target)) {
        surface.ledger.restore();
        this.surfaces.delete(target);
      }
  }
  destroy() {
    for (const surface of this.surfaces.values()) surface.ledger.restore();
    this.surfaces.clear();
  }
}
