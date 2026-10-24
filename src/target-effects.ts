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
  beacon: HTMLElement | null;
  animations: Animation[];
  moving: boolean;
  period: number;
  beaconColor: string;
}
// Swarm's health colors and damped liquid surface, shared as presentation only.
export function targetSignal(health: number, color = "#06c4ff") {
  const fill = clamp(health, 0, 100);
  return {
    fill,
    color: fill > 60 ? color : fill > 25 ? "#cdde00" : "#ee6875",
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
  private running = true;
  private readonly quiet: MediaQueryList;
  private readonly win: Window;
  constructor(win: Window) {
    this.win = win;
    this.quiet = win.matchMedia("(pointer: coarse), (max-width: 640px)");
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
        empty: darkText ? "#eae1ff" : "#241a35",
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
        beacon: null,
        animations: [],
        moving: false,
        period: 0,
        beaconColor: "",
      };
      // An owned, empty child follows its button through native layout, nested
      // scrolling and transforms. Never replace labels or host pseudo-elements.
      if (
        target.element instanceof this.win.document.defaultView!.HTMLElement &&
        !/^(IMG|INPUT|BR|HR|CANVAS|VIDEO|IFRAME)$/.test(target.element.tagName)
      ) {
        if (css.position === "static")
          s.ledger.writeStyle(target.element, "position", "relative");
        const host = this.win.document.createElement("dom-virus-effect");
        host.setAttribute("data-dom-virus-effect", "");
        host.setAttribute("aria-hidden", "true");
        host.style.cssText =
          "all:initial!important;position:absolute!important;inset:-3px!important;display:block!important;border-radius:inherit!important;pointer-events:none!important;user-select:none!important;";
        const shadow = host.attachShadow({ mode: "open" });
        for (let i = 0; i < 2; i++) {
          const ring = this.win.document.createElement("i");
          ring.style.cssText =
            "position:absolute;inset:0;border:1.5px solid currentColor;border-radius:inherit;box-sizing:border-box;pointer-events:none;opacity:.6";
          shadow.append(ring);
          const animation = ring.animate(
            [
              { transform: "scale(1)", opacity: 0.6 },
              { transform: "scale(1.16)", opacity: 0 },
            ],
            { duration: 1000, delay: i * 500, iterations: Infinity },
          );
          animation.pause();
          s.animations.push(animation);
        }
        target.element.append(host);
        s.beacon = host;
      }
      this.surfaces.set(target, s);
    }
    return s;
  }
  draw(
    _ctx: CanvasRenderingContext2D,
    targets: readonly BoardTarget[],
    time: number,
    reduced: boolean,
  ) {
    this.time = time;
    const quiet = reduced || this.quiet.matches;
    for (const target of targets) {
      if (!target.element.isConnected) continue;
      if (!target.visible || !target.rect) {
        const existing = this.surfaces.get(target);
        if (existing) this.motion(existing, false);
        continue;
      }
      const s = this.surface(target);
      const signal = targetSignal(
        (target.health / target.maxHealth) * 100,
        s.color,
      );
      const elapsed = time - s.hitAt;
      const energy = quiet ? 0 : clamp(1 - elapsed / 0.65, 0, 1);
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
      if (s.beacon) {
        const color = target.health > 0 ? signal.color : "#4bce82";
        if (s.beaconColor !== color) {
          s.beacon.style.setProperty("color", color, "important");
          s.beaconColor = color;
        }
        const period = Math.round(signal.period * 5) / 5;
        if (s.period !== period) {
          for (let i = 0; i < s.animations.length; i++)
            s.animations[i]!.effect?.updateTiming({
              duration: period * 1000,
              delay: i * period * 500,
            });
          s.period = period;
        }
        this.motion(s, this.running && !quiet && target.health > 0);
      }
    }
  }
  private motion(surface: Surface, moving: boolean) {
    if (surface.moving === moving) return;
    surface.moving = moving;
    for (const animation of surface.animations) {
      if (moving) animation.play();
      else {
        animation.pause();
        animation.currentTime = 0;
      }
    }
  }
  setActive(active: boolean) {
    this.running = active;
    if (!active)
      for (const surface of this.surfaces.values()) this.motion(surface, false);
  }
  ownsStyleMutation(target: BoardTarget) {
    return (
      this.surfaces.get(target)?.ledger.ownsStyleMutation(target.element) ??
      false
    );
  }
  private release(surface: Surface) {
    for (const animation of surface.animations) animation.cancel();
    surface.beacon?.remove();
    surface.ledger.restore();
  }
  sync(targets: readonly BoardTarget[]) {
    for (const [target, surface] of this.surfaces)
      if (!targets.includes(target)) {
        this.release(surface);
        this.surfaces.delete(target);
      }
  }
  destroy() {
    for (const surface of this.surfaces.values()) this.release(surface);
    this.surfaces.clear();
  }
}
