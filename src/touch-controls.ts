/**
 * Shared mobile controls: an analog thumbstick, a round Fire button and
 * secondary ability buttons, styled after DOM Battlefield.
 *
 * Feel rules (keep them when editing):
 * - One layout read per touch start; pointermove only writes a transform.
 * - Pointer capture per control, keyed by pointerId, so the stick and Fire
 *   can be held at the same time by different fingers.
 * - touch-action:none and no text selection on every control.
 * - 3D press: rest shadow (S,S); fine-pointer hover lifts the top by (-h,-h)
 *   with shadow (S+h); pressed translates exactly (S,S) with shadow 0, so the
 *   top lands on the base. aria-pressed=true stays pressed. Transform and
 *   shadow share one duration and easing; no overshoot, no scale().
 */

export type StickMode = "8way" | "4way";

const svg = (body: string, stroke = 2.6) =>
  `<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

/** Battlefield's crosshair. */
export const fireIcon = svg(
  '<path d="M10 1v5M10 14v5M1 10h5M14 10h5"/><circle cx="10" cy="10" r="5"/>',
);

const stickMarks = `<svg class="tc-marks" viewBox="0 0 100 100" aria-hidden="true"><path d="M44 15 50 9l6 6M44 85l6 6 6-6M15 44 9 50l6 6M85 44l6 6-6 6"/></svg>`;

/** Thumbstick markup. `role=application` lets screen readers pass drags through. */
export function stickMarkup(label = "Move: drag in any direction") {
  return `<div class="tc-stick" role="application" aria-label="${label}">${stickMarks}<i class="tc-knob"></i></div>`;
}

/** Round Fire button. `data-k=Space` lets the runtime map it to the fire key. */
export function fireButtonMarkup(label = "Hold to fire") {
  return `<button type="button" class="tc-btn tc-fire" data-k="Space" aria-label="${label}">${fireIcon}</button>`;
}

/** Large round button for a game's main action when it has no Fire (e.g. Jump). */
export function primaryButtonMarkup(text: string, label = text) {
  return `<button type="button" class="tc-btn tc-primary" aria-label="${label}"><span>${text}</span></button>`;
}

/** Small arcade button for abilities and other secondary actions. */
export function secondaryButtonMarkup(text: string, label = text) {
  return `<button type="button" class="tc-btn" aria-label="${label}">${text}</button>`;
}

const directionKeys = (dx: number, dy: number) => {
  const keys: string[] = [];
  if (dy < 0) keys.push("ArrowUp");
  if (dy > 0) keys.push("ArrowDown");
  if (dx < 0) keys.push("ArrowLeft");
  if (dx > 0) keys.push("ArrowRight");
  return keys;
};

export interface StickKeyOptions {
  /** Magnitude (0..1) needed before any key is held. Default 0.28. */
  deadzone?: number;
  /** Magnitude below the deadzone at which held keys release. Default 0.07. */
  release?: number;
  /** Extra angle, as a fraction of a sector, before switching sectors. Default 0.18. */
  hysteresis?: number;
}

export interface StickKeys {
  /** Feed a stick vector (x right, y down; magnitude 0..1). Returns true if keys changed. */
  update(x: number, y: number): boolean;
  /** Arrow keys currently held: one in 4-way, one or two in 8-way. */
  readonly keys: readonly string[];
  reset(): void;
}

/**
 * Maps a stick vector to arrow keys. 8-way by default; "4way" picks the
 * dominant axis for grid games. Both the deadzone and the sector borders have
 * hysteresis so a thumb resting near a diagonal never flickers.
 */
export function createStickKeys(
  mode: StickMode = "8way",
  { deadzone = 0.28, release = 0.07, hysteresis = 0.18 }: StickKeyOptions = {},
): StickKeys {
  const count = mode === "4way" ? 4 : 8;
  const span = (Math.PI * 2) / count;
  let sector = -1;
  let keys: string[] = [];
  return {
    get keys() {
      return keys;
    },
    update(x, y) {
      const m = Math.min(1, Math.hypot(x, y));
      let next = sector;
      if (m < (sector < 0 ? deadzone : deadzone - release)) next = -1;
      else {
        const a = Math.atan2(y, x);
        const nearest = ((Math.round(a / span) % count) + count) % count;
        if (sector < 0) next = nearest;
        else {
          const off = Math.abs(
            ((((a - sector * span) % (Math.PI * 2)) + Math.PI * 3) %
              (Math.PI * 2)) -
              Math.PI,
          );
          if (off > span * (0.5 + hysteresis)) next = nearest;
        }
      }
      if (next === sector) return false;
      sector = next;
      keys =
        next < 0
          ? []
          : directionKeys(
              Math.round(Math.cos(next * span)),
              Math.round(Math.sin(next * span)),
            );
      return true;
    },
    reset() {
      sector = -1;
      keys = [];
    },
  };
}

type Listen = (
  target: EventTarget,
  type: string,
  fn: (event: PointerEvent) => void,
) => void;
const defaultListen = (offs: (() => void)[]): Listen => (target, type, fn) => {
  const listener = fn as EventListener;
  target.addEventListener(type, listener);
  offs.push(() => target.removeEventListener(type, listener));
};
const capture = (el: Element, id: number) => {
  try {
    el.setPointerCapture(id);
  } catch {
    // Synthetic or already-ended pointers cannot be captured; the press still counts.
  }
};

export interface StickOptions {
  /** Return false to ignore a touch (e.g. while paused). */
  canStart?(event: PointerEvent): boolean;
  /** Stick vector: x right, y down, clipped to the unit circle. */
  onMove(x: number, y: number): void;
  onEnd?(): void;
  /** Knob travel as a fraction of the stick width. Default 0.36 (Battlefield). */
  travel?: number;
  /** Supply the host's listener helper so its teardown removes these too. */
  listen?: Listen;
}

export interface StickControl {
  readonly active: boolean;
  /** Recentre the knob and end the drag without waiting for pointerup. */
  release(): void;
  destroy(): void;
}

/** Drives a `.tc-stick` element (see stickMarkup). */
export function bindStick(
  stick: HTMLElement,
  options: StickOptions,
): StickControl {
  const offs: (() => void)[] = [];
  const listen = options.listen ?? defaultListen(offs);
  const knob = stick.querySelector<HTMLElement>(".tc-knob");
  const travel = options.travel ?? 0.36;
  let id = -1,
    cx = 0,
    cy = 0,
    r = 1;
  const move = (e: PointerEvent) => {
    let dx = (e.clientX - cx) / r,
      dy = (e.clientY - cy) / r;
    const d = Math.hypot(dx, dy);
    if (d > 1) {
      dx /= d;
      dy /= d;
    }
    if (knob)
      knob.style.transform = `translate3d(${(dx * r).toFixed(1)}px,${(dy * r).toFixed(1)}px,0)`;
    options.onMove(dx, dy);
  };
  const end = () => {
    if (id < 0) return;
    id = -1;
    if (knob) knob.style.transform = "";
    stick.classList.remove("down");
    options.onMove(0, 0);
    options.onEnd?.();
  };
  listen(stick, "pointerdown", (e) => {
    e.preventDefault();
    if (id >= 0 || options.canStart?.(e) === false) return;
    const rect = stick.getBoundingClientRect();
    id = e.pointerId;
    capture(stick, id);
    stick.classList.add("down");
    cx = rect.left + rect.width / 2;
    cy = rect.top + rect.height / 2;
    r = Math.max(1, rect.width * travel);
    move(e);
  });
  listen(stick, "pointermove", (e) => {
    if (e.pointerId === id) move(e);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    listen(stick, type, (e) => {
      if (e.pointerId === id) end();
    });
  return {
    get active() {
      return id >= 0;
    },
    release: end,
    destroy() {
      end();
      for (const off of offs) off();
      offs.length = 0;
    },
  };
}

export interface PressOptions {
  canPress?(event: PointerEvent): boolean;
  onPress(event: PointerEvent): void;
  onRelease?(pointerId: number): void;
  listen?: Listen;
}

export interface PressControl {
  /** Lift the button and forget held pointers (onRelease is called for each). */
  release(): void;
  destroy(): void;
}

/**
 * Hold-to-act press with pointer capture and a `.down` class, because :active
 * is unreliable for touch. Several fingers may hold one button.
 */
export function bindPress(
  button: HTMLElement,
  options: PressOptions,
): PressControl {
  const offs: (() => void)[] = [];
  const listen = options.listen ?? defaultListen(offs);
  const held = new Set<number>();
  const up = (pointerId: number) => {
    if (!held.delete(pointerId)) return;
    if (!held.size) button.classList.remove("down");
    options.onRelease?.(pointerId);
  };
  listen(button, "pointerdown", (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    if (options.canPress?.(e) === false) return;
    capture(button, e.pointerId);
    held.add(e.pointerId);
    button.classList.add("down");
    options.onPress(e);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    listen(button, type, (e) => up(e.pointerId));
  const release = () => {
    for (const pointerId of [...held]) up(pointerId);
  };
  return {
    release,
    destroy() {
      release();
      for (const off of offs) off();
      offs.length = 0;
    },
  };
}

/**
 * Battlefield's look. Scope: a `.touch` container. Colors are tokens so the
 * HUD's light theme (`.hud[data-theme=light]~.touch`) can retint them, and
 * `--accent` (the game color) tints the stick and primary action.
 * Set `data-motion="reduce"` on `.touch` to drop the knob's return glide.
 */
export const touchControlStyles = `
.touch{--tc-ink:#07060f;--tc-base:#07060f;--tc-stick:var(--accent,#19f0ff);--tc-fire:#ff2e88;--tc-alt:#19f0ff;--tc-focus:#ffe14d;--s:4px;--h:2px;--e:cubic-bezier(.25,.8,.25,1);--t:110ms;position:absolute;inset:auto max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));display:none;justify-content:space-between;align-items:flex-end;gap:16px;margin:0;pointer-events:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;font:700 11px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace}
.hud[data-theme=light]~.touch{--tc-base:#eef0fb;--tc-fire:#e8177a;--tc-alt:#00a9d6;--tc-focus:#6f45e6}
.tc-stick,.tc-btn{--c:var(--tc-stick);--sh:color-mix(in srgb,var(--c) 45%,#07060f);--gl:color-mix(in srgb,var(--c) 45%,transparent);touch-action:none;pointer-events:auto}
.tc-stick{position:relative;flex:none;width:clamp(116px,33vw,148px);aspect-ratio:1;border-radius:50%;cursor:grab;background:radial-gradient(circle,#0000 34%,color-mix(in srgb,var(--c) 16%,#0000) 34% 35.5%,#0000 35.5%),color-mix(in srgb,var(--c) 9%,var(--tc-base));border:2px solid var(--c);box-shadow:var(--s) var(--s) 0 color-mix(in srgb,var(--c) 35%,#07060f),inset 0 0 18px color-mix(in srgb,var(--c) 16%,#0000)}
.tc-marks{position:absolute;inset:0;width:100%!important;height:100%!important;fill:none;stroke:color-mix(in srgb,var(--c) 60%,#0000);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
.tc-knob{position:absolute;inset:30%;border-radius:50%;background:var(--c);border:2px solid var(--tc-ink);box-shadow:3px 3px 0 var(--sh),0 0 14px var(--gl);transition:transform 160ms var(--e),box-shadow var(--t) var(--e);pointer-events:none;will-change:transform}
.tc-stick.down{cursor:grabbing;--t:60ms;--gl:color-mix(in srgb,var(--c) 70%,#0000)}.down>.tc-knob{transition:box-shadow var(--t) var(--e);box-shadow:1px 1px 0 var(--sh),0 0 22px var(--gl)}
.tc-side,.touch .abilities{display:flex;flex-direction:column;align-items:flex-end;gap:16px;margin:0;padding:0;pointer-events:none}.touch .abilities{align-items:stretch;gap:10px}
.touch .tc-btn{--c:var(--tc-alt);font:inherit;letter-spacing:.06em;text-transform:uppercase;color:#07060f;background:var(--c);border:2px solid var(--tc-ink);border-radius:10px;min-width:48px;min-height:44px;margin:0;padding:8px 14px;display:grid;place-items:center;opacity:1;box-shadow:var(--s) var(--s) 0 var(--sh),0 0 14px var(--gl);transition:transform var(--t) var(--e),box-shadow var(--t) var(--e)}
.touch .tc-btn svg{width:44%;height:44%;margin:0}
.touch :is(.tc-fire,.tc-primary){--c:var(--tc-fire);width:clamp(80px,23vw,96px);aspect-ratio:1;padding:0;border-width:3px;border-radius:50%}.touch .tc-primary{--c:var(--tc-stick);font-size:12px;letter-spacing:.1em}
.touch .tc-btn:focus-visible{outline:3px solid var(--tc-focus);outline-offset:3px}.touch .tc-btn:disabled{opacity:.45}
@media (hover:hover) and (pointer:fine){.touch .tc-btn:not(:disabled):hover{transform:translate(calc(-1*var(--h)),calc(-1*var(--h)));box-shadow:calc(var(--s) + var(--h)) calc(var(--s) + var(--h)) 0 var(--sh),0 0 18px var(--gl)}}
.touch .tc-btn:not(:disabled):is(:active,.down,[aria-pressed=true]){--t:60ms;--gl:color-mix(in srgb,var(--c) 70%,#0000);transform:translate(var(--s),var(--s));box-shadow:0 0 0 var(--sh),0 0 22px var(--gl)}
.touch svg{pointer-events:none}.touch[data-motion=reduce] *{transition:none!important}
`;
