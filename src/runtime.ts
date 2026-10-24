import { controlIcons, controlStyles } from "./game-controls.js";
import { createGameAudio } from "./audio.js";
import { createMobileZoomLock } from "./zoom-lock.js";
import { createMobileSelectionLock } from "./selection-lock.js";
import type {
  Board,
  GameContext,
  GameController,
  GameDefinition,
  GameOptions,
  GameSimulation,
  GameSnapshot,
  GameStats,
  GameStatus,
  InputState,
} from "./contracts.js";
import { arcadeStyles, arcadeMarkup } from "./arcade-hud.js";
import { EntityPool, translateEntities } from "./entities.js";
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}
type ArcadeEvents = DocumentEventMap &
  WindowEventMap &
  HTMLElementEventMap &
  MediaQueryListEventMap;
type Field =
  | "resource"
  | "score"
  | "lives"
  | "wave"
  | "status"
  | "detail"
  | "kills"
  | "alive"
  | "combo"
  | "weaponLabel"
  | "progressText"
  | "progress";
interface Popup {
  x: number;
  y: number;
  life: number;
  text: string;
  tone: "score" | "upgrade" | "hurt";
}
import { createBoard } from "./board.js";
import { clamp, seededRandom } from "./math.js";

const editSelector =
  'input,textarea,select,[contenteditable],form,dialog,[role="dialog"]';
export function createArcade<S extends GameStats>(
  definition: GameDefinition<S>,
  options: GameOptions<S> = {},
): GameController<S> {
  const doc = options.document || globalThis.document;
  if (!doc?.defaultView)
    throw new Error("Create a DOM Virus game in the browser after mounting.");
  const win = doc.defaultView;
  const selectionLock = createMobileSelectionLock(doc);
  const zoomLock = createMobileZoomLock(doc, options.lockZoom !== false);
  const audio = createGameAudio(doc, definition.id, options.sound);
  const supportsFire = definition.capabilities?.fire === true;
  let host: HTMLDivElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let board: Board | null = null;
  let game: GameSimulation<S> | null = null;
  let raf = 0,
    last = 0,
    time = 0,
    notifyAt = -1,
    destroyed = false,
    pausedByVisibility = false;
  let status: GameStatus = "idle";
  let width = 0,
    height = 0,
    dpr = 1,
    sx = 0,
    sy = 0,
    frameMs = 0,
    maxFrameMs = 0;
  let listeners: (() => void)[] = [];
  const particlePool = new EntityPool<Particle>(100, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    life: 0,
    color: "",
  }));
  const particles = particlePool.active;
  const popupPool = new EntityPool<Popup>(24, () => ({
    x: 0,
    y: 0,
    life: 0,
    text: "",
    tone: "score",
  }));
  const popups = popupPool.active;
  let notice = "";
  let input: InputState = {
    keys: new Set(),
    pointer: { x: 0, y: 0, active: false },
    fire: false,
    mode: "keyboard",
  };
  let ui: Partial<Record<Field, HTMLElement>> & { pause?: HTMLButtonElement } =
    {};
  let lastStats: Partial<S> = {};
  let autoFire = false;
  const random =
    options.seed === undefined ? Math.random : seededRandom(options.seed);
  const darkQuery = win.matchMedia("(prefers-color-scheme: dark)"),
    motionQuery = win.matchMedia("(prefers-reduced-motion: reduce)");
  const theme = () =>
    options.theme === "dark" || (options.theme !== "light" && darkQuery.matches)
      ? "dark"
      : "light";
  const reduced = () => options.reducedMotion ?? motionQuery.matches;
  function on<K extends keyof ArcadeEvents>(
    target: EventTarget,
    event: K,
    fn: (event: ArcadeEvents[K]) => void,
    settings?: AddEventListenerOptions | boolean,
  ) {
    const listener = fn as EventListener;
    target.addEventListener(event, listener, settings);
    listeners.push(() => target.removeEventListener(event, listener, settings));
  }
  function emit(type: string, data: Record<string, unknown> = {}) {
    audio.play(type);
    options.onEvent?.({ ...data, type, game: definition.id });
  }
  function getSnapshot(): GameSnapshot<S> {
    return {
      id: definition.id,
      status,
      elapsed: time,
      ...lastStats,
      ...(game?.snapshot() || {}),
      board: board?.stats || {
        indexed: 0,
        visible: 0,
        spent: 0,
        measurements: 0,
      },
      particles: particles.length,
      frameMs,
      maxFrameMs,
      notice,
    };
  }
  function notify(force = false) {
    if (!force && time - notifyAt < 0.1) return;
    notifyAt = time;
    const snap = getSnapshot();
    options.onState?.(snap);
    if (!host) return;
    const arcade = definition.hud === "arcade";
    const fields: Partial<Record<Field, string>> = {
      score: String(snap.score || 0).padStart(6, "0"),
      lives:
        snap.hud?.health ??
        `${snap.lives ?? 3} ${arcade ? "SHIELDS" : "LIVES"}`,
      wave: String(snap.wave || 1).padStart(2, "0"),
      status: status.toUpperCase(),
      resource: snap.hud?.resource ?? "",
      detail: notice || snap.detail || definition.hint,
    };
    if (snap.hud) {
      Object.assign(fields, {
        kills: String(snap.hud.kills),
        alive: String(snap.hud.alive),
        combo: `×${snap.hud.combo} combo`,
        weaponLabel: snap.hud.label,
        progressText: snap.hud.progressText,
      });
      const value = String(Math.round(clamp(snap.hud.progress, 0, 1) * 100));
      if (ui.progress && ui.progress.style.width !== `${value}%`) {
        ui.progress.style.width = `${value}%`;
        ui.progress.parentElement?.setAttribute("aria-valuenow", value);
      }
    }
    for (const key of Object.keys(fields) as Field[]) {
      const element = ui[key];
      if (element && element.textContent !== fields[key])
        element.textContent = fields[key] ?? "";
    }
    if (ui.pause) {
      const label = status === "paused" ? "Resume game" : "Pause game";
      if (ui.pause.getAttribute("aria-label") !== label) {
        ui.pause.innerHTML =
          status === "paused" ? controlIcons.play : controlIcons.pause;
        ui.pause.setAttribute("aria-label", label);
      }
      const disabled = status !== "running" && status !== "paused";
      if (ui.pause.disabled !== disabled) ui.pause.disabled = disabled;
    }
  }
  const touchKeys = new Map<number, string>();
  function clearInput() {
    touchKeys.clear();
    input?.keys.clear();
    if (input) {
      input.fire = false;
      input.pointer.active = false;
    }
  }
  function resize() {
    width = win.innerWidth;
    height = win.innerHeight;
    dpr = Math.min(win.devicePixelRatio || 1, 1.5);
    if (canvas && ctx) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    // A resize clears canvas pixels even while the animation loop is paused.
    if (game && board && status !== "running") {
      board.measure(time, true);
      draw();
    }
  }
  function mount() {
    if (doc.querySelector("[data-dom-virus-root]"))
      throw new Error(
        "Recall the active DOM Virus game before starting another.",
      );
    board = createBoard(doc, {
      ...options,
      binaryColor: options.binaryColor ?? definition.color,
    });
    host = doc.createElement("div");
    host.dataset.domVirusRoot = definition.id;
    host.dataset.virusIgnore = "";
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>
      :host{all:initial!important;position:fixed!important;inset:0!important;display:block!important;z-index:2147483000!important;pointer-events:none!important;contain:layout style;--accent:${definition.color}}
      *{box-sizing:border-box}canvas{position:absolute;inset:0;pointer-events:none}.hud{position:absolute;pointer-events:auto}section{display:flex;justify-content:space-between;align-items:baseline}nav{display:flex;gap:6px;flex-wrap:wrap}button{font:inherit;color:inherit;background:transparent;border:1px solid #73837c66;padding:6px 9px;border-radius:7px;cursor:pointer}button:disabled{opacity:.4}
      ${arcadeStyles}
      ${controlStyles}
      .touch{position:absolute;inset:auto max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));display:none;justify-content:space-between;align-items:end;pointer-events:none;margin:0}.touch[hidden]{display:none!important}.dpad{display:grid;grid-template:repeat(3,48px)/repeat(3,48px);gap:4px}.touch button{pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;color:#f5f7ff;background:#151b29ed;border:1px solid #8899ae;min-width:48px;min-height:48px;font-size:21px}.touch button:active{background:#405064}.touch button[data-k=ArrowUp]{grid-area:1/2}.touch button[data-k=ArrowLeft]{grid-area:2/1}.touch button[data-k=ArrowRight]{grid-area:2/3}.touch button[data-k=ArrowDown]{grid-area:3/2}.touch .fire-pad{width:76px;height:76px;border-radius:50%;font-size:14px;letter-spacing:.1em;border-color:var(--accent)}
      .touch .abilities{display:flex;flex-direction:column;gap:6px;position:absolute;right:0;bottom:88px}.touch .abilities button{font-size:11px;min-height:44px;padding:8px 10px}.game-commands{padding:0 16px 12px}.touch svg{pointer-events:none}.hud[data-theme=light]~.touch button{color:#142629;background:#fbfcf9f5;border-color:#70867f;box-shadow:0 3px 0 #14262926}.hud[data-theme=light]~.touch button:active{background:#dce5df}
      .hud.compact p,.hud.compact nav,.hud.compact .stats,.hud.compact .meter-label,.hud.compact .meter{display:none}.hud.compact .game{padding:6px 12px}.hud.compact .score{font-size:22px}.hud.compact .wave{padding:2px 6px}.hud.compact .score-label{display:none}.hud.compact header{padding:5px 10px}.hud.compact .flight{margin-top:3px}
      @media(pointer:coarse),(max-width:600px){.touch{display:flex}.hud,.hud.arcade{top:max(10px,env(safe-area-inset-top));bottom:auto;right:max(10px,env(safe-area-inset-right));width:min(310px,calc(100% - 20px));max-height:calc(100dvh - 190px);overflow:auto;backdrop-filter:none}.hud.compact{width:240px}.hud header button{min-width:44px;min-height:44px}.hud nav button{min-height:44px}}

    </style><canvas aria-hidden="true"></canvas><aside class="hud arcade" aria-label="${definition.title} controls">${arcadeMarkup(definition.title, supportsFire, definition.hud === "arcade")}</aside>`;
    const touch = shadow.querySelector<HTMLElement>(".touch")!;
    // Controls are siblings of the scoreboard: minimizing it never hides play.
    touch.remove();
    touch.setAttribute("aria-label", "Game touch controls");
    touch.innerHTML = `<div class="dpad"><button data-k="ArrowUp" aria-label="Move forward or up">${controlIcons.up}</button><button data-k="ArrowLeft" aria-label="Turn or move left">${controlIcons.left}</button><button data-k="ArrowRight" aria-label="Turn or move right">${controlIcons.right}</button><button data-k="ArrowDown" aria-label="Move backward or down">${controlIcons.down}</button></div>${supportsFire ? '<button class="fire-pad" data-k="Space" aria-label="Hold to fire">FIRE</button>' : ""}`;
    shadow.append(touch);
    doc.documentElement.append(host);
    canvas = shadow.querySelector("canvas")!;
    ctx = canvas.getContext("2d");
    if (!ctx) {
      teardown();
      throw new Error("Canvas 2D is unavailable.");
    }
    ui = Object.fromEntries(
      [...shadow.querySelectorAll<HTMLElement>("[data-field]")].map((el) => [
        el.dataset.field,
        el,
      ]),
    );
    ui.pause = shadow.querySelector<HTMLButtonElement>("[data-action=pause]")!;
    const hud = shadow.querySelector<HTMLElement>(".hud")!;
    const fold = shadow.querySelector<HTMLButtonElement>(
      '[data-action="fold"]',
    )!;
    const setCompact = (compact: boolean) => {
      hud.classList.toggle("compact", compact);
      fold.innerHTML = compact ? controlIcons.expand : controlIcons.minimize;
      fold.setAttribute("aria-expanded", String(!compact));
      fold.setAttribute(
        "aria-label",
        compact ? "Expand scoreboard" : "Minimize scoreboard",
      );
    };
    setCompact(win.matchMedia("(pointer: coarse), (max-width: 600px)").matches);
    const command = (id: string) => {
      if (status !== "running") return;
      game?.action?.(id);
      notify(true);
    };
    if (definition.actions?.length) {
      for (const mobile of [false, true]) {
        const commands = doc.createElement("nav");
        commands.className = mobile ? "abilities" : "game-commands";
        commands.setAttribute("aria-label", "Game abilities");
        for (const action of definition.actions) {
          const button = doc.createElement("button");
          button.textContent = mobile
            ? action.label.replace(/^[A-Z] · /, "")
            : action.label;
          button.dataset.ability = action.id;
          button.setAttribute(
            "aria-keyshortcuts",
            action.key.replace(/^Key/, ""),
          );
          on(button, "click", () => {
            command(action.id);
            button.blur();
          });
          commands.append(button);
        }
        (mobile ? touch : hud).append(commands);
      }
    }
    const soundButton = shadow.querySelector<HTMLButtonElement>(
      '[data-action="sound"]',
    )!;
    let soundState = "";
    const syncSound = () => {
      const next = `${audio.enabled}:${audio.available}`;
      if (next === soundState) return;
      soundState = next;
      soundButton.innerHTML = audio.enabled
        ? controlIcons.sound
        : controlIcons.mute;
      soundButton.setAttribute(
        "aria-label",
        audio.available
          ? audio.enabled
            ? "Mute game sound"
            : "Enable game sound"
          : "Game sound unavailable in this browser",
      );
      soundButton.setAttribute("aria-pressed", String(audio.enabled));
      soundButton.disabled = !audio.available;
    };
    syncSound();
    const unlockSound = (event: Event) => {
      if (status !== "running" && status !== "paused") return;
      if ((event as KeyboardEvent).code === "Escape") return;
      audio.unlock(event);
      syncSound();
    };
    on(win, "pointerdown", unlockSound, true);
    on(win, "keydown", unlockSound, true);
    const syncTheme = () => {
      hud.dataset.theme = theme();
      board?.invalidate();
    };
    syncTheme();
    on(darkQuery, "change", syncTheme);
    for (const el of shadow.querySelectorAll<HTMLButtonElement>(
      "[data-action]",
    ))
      on(el, "click", () => {
        const action = el.dataset.action;
        if (action === "sound") {
          audio.toggle();
          audio.unlock();
          audio.play("preview");
          syncSound();
        }
        if (action === "pause") status === "paused" ? resume() : pause();
        if (action === "exit") stop();
        if (action === "restart") start();
        if (action === "gate") nextGate();
        if (action === "fold") {
          setCompact(!hud.classList.contains("compact"));
        }
        if (action === "fire") {
          autoFire = !autoFire;
          el.textContent = autoFire ? "Fire: on" : "Auto fire";
          el.setAttribute("aria-pressed", String(autoFire));
        }
        // Return keyboard control to the board after an in-game action.
        // Otherwise the protected HUD keeps swallowing movement/fire keys.
        if (status === "running") el.blur();
      });
    input = {
      keys: new Set(),
      pointer: {
        x: win.innerWidth / 2,
        y: win.innerHeight * 0.65,
        active: false,
      },
      fire: false,
      mode: options.controls === "keyboard" ? "keyboard" : "mouse",
    };
    for (const el of shadow.querySelectorAll<HTMLButtonElement>("[data-k]")) {
      on(el, "pointerdown", (e) => {
        if (status !== "running") return;
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        touchKeys.set(e.pointerId, el.dataset.k!);
        input.pointer.active = false;
        input.mode = "keyboard";
        input.keys.add(el.dataset.k!);
      });
      const release = (e: PointerEvent) => {
        const key = touchKeys.get(e.pointerId);
        touchKeys.delete(e.pointerId);
        if (key && ![...touchKeys.values()].includes(key))
          input.keys.delete(key);
      };
      on(el, "pointerup", release);
      on(el, "pointercancel", release);
      on(el, "lostpointercapture", release);
    }
    function isProtected(e: Event) {
      return e
        .composedPath()
        .some(
          (el) =>
            el === host ||
            (el instanceof win.Element &&
              (el.matches(editSelector) || el.matches("[data-virus-ignore]"))),
        );
    }
    on(
      doc,
      "keydown",
      (e) => {
        if (e.code === "Escape") {
          e.preventDefault();
          stop();
          return;
        }
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        // Page chrome may retain focus after a pointer interaction. It must not
        // turn active game movement/fire into scrolling or a button click.
        // Editable fields and keyboard-operated HUD controls keep native input.
        const path = e.composedPath();
        const editable = path.some(
          (el) => el instanceof win.Element && el.matches(editSelector),
        );
        const hudControl =
          path.includes(host!) &&
          path.some((el) => el instanceof win.Element && el.matches("button"));
        const movement = /^(Arrow(Up|Down|Left|Right)|Key[WASD])$/.test(e.code);
        const fire = supportsFire && e.code === "Space";
        if (
          status === "running" &&
          !editable &&
          (movement || (fire && !hudControl))
        ) {
          e.preventDefault();
          e.stopPropagation();
          input.mode = "keyboard";
          input.keys.add(e.code);
          return;
        }
        if (isProtected(e) || editable) return;
        if (e.code === "KeyP") {
          e.preventDefault();
          if (!e.repeat) status === "paused" ? resume() : pause();
          return;
        }
        if (status !== "running") return;
        const command = definition.actions?.find(
          (action) => action.key === e.code,
        );
        if (command) {
          e.preventDefault();
          if (!e.repeat) {
            game?.action?.(command.id);
            notify(true);
          }
          return;
        }
        if (e.code === "KeyG") {
          e.preventDefault();
          if (!e.repeat) nextGate();
          return;
        }
        if (
          [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "KeyW",
            "KeyA",
            "KeyS",
            "KeyD",
            "Space",
          ].includes(e.code)
        ) {
          e.preventDefault();
          input.mode = "keyboard";
          input.keys.add(e.code);
        }
      },
      true,
    );
    on(
      doc,
      "keyup",
      (e) => {
        if (input.keys.has(e.code)) {
          e.preventDefault();
          e.stopPropagation();
        }
        input.keys.delete(e.code);
      },
      true,
    );
    on(
      doc,
      "pointermove",
      (e) => {
        if (
          status !== "running" ||
          isProtected(e) ||
          e.pointerType === "touch" ||
          options.controls === "keyboard"
        )
          return;
        input.pointer = { x: e.clientX, y: e.clientY, active: true };
        input.mode = "mouse";
      },
      { passive: true },
    );
    on(
      doc,
      "pointerdown",
      (e) => {
        if (status !== "running" || isProtected(e) || e.button !== 0) return;
        if (supportsFire) {
          input.fire = true;
          e.preventDefault();
        }
      },
      true,
    );
    on(doc, "pointerup", () => (input.fire = false), true);
    on(doc, "pointercancel", () => (input.fire = false), true);
    on(
      doc,
      "click",
      (e) => {
        if (
          status === "running" &&
          supportsFire &&
          !isProtected(e) &&
          e.detail > 0
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );
    on(doc, "focusin", (e) => {
      if (
        e.target instanceof win.Element &&
        e.target.matches(editSelector) &&
        status === "running"
      )
        pause();
    });
    on(win, "blur", () => {
      if (status === "running") pause();
      clearInput();
    });
    on(win, "pagehide", stop);
    on(doc, "visibilitychange", () => {
      if (doc.hidden && status === "running") {
        pause();
        pausedByVisibility = true;
      } else if (!doc.hidden && pausedByVisibility) {
        pausedByVisibility = false;
        resume();
      }
    });
    on(win, "resize", resize);
    resize();
    sx = win.scrollX;
    sy = win.scrollY;
    board.measure(0, true);
    const api: GameContext = {
      board,
      input,
      random,
      emit,
      options,
      get width() {
        return width;
      },
      get height() {
        return height;
      },
      get time() {
        return time;
      },
      get firing() {
        return (
          supportsFire && (input.fire || autoFire || input.keys.has("Space"))
        );
      },
      get reducedMotion() {
        return reduced();
      },
      move(player, dt, speed = 300, cardinal = false) {
        let x = 0,
          y = 0;
        const k = input.keys;
        if (input.mode === "mouse" && input.pointer.active) {
          x = input.pointer.x - player.x;
          y = input.pointer.y - player.y;
          const n = Math.hypot(x, y);
          if (n > 4) {
            const step = Math.min(speed * dt, n);
            player.x += (x / n) * step;
            player.y += (y / n) * step;
            player.angle = Math.atan2(y, x);
          }
        } else {
          x =
            Number(k.has("ArrowRight") || k.has("KeyD")) -
            Number(k.has("ArrowLeft") || k.has("KeyA"));
          y =
            Number(k.has("ArrowDown") || k.has("KeyS")) -
            Number(k.has("ArrowUp") || k.has("KeyW"));
          if (cardinal && x && y) {
            let lastDirection = "";
            for (const key of k)
              if (/^(Arrow|Key[WASD])/.test(key)) lastDirection = key;
            if (
              ["ArrowUp", "ArrowDown", "KeyW", "KeyS"].includes(lastDirection)
            )
              x = 0;
            else y = 0;
          }
          const n = Math.hypot(x, y);
          if (n) {
            player.x += (x / n) * speed * dt;
            player.y += (y / n) * speed * dt;
            player.angle = Math.atan2(y, x);
          }
        }
        player.x = clamp(player.x, 14, width - 14);
        player.y = clamp(player.y, 14, height - 14);
      },
      burst(x, y, color, count = 9) {
        if (reduced()) return;
        for (let i = 0; i < count && particles.length < 100; i++) {
          const p = particlePool.acquire();
          if (!p) break;
          const a = random() * Math.PI * 2,
            s = 30 + random() * 100;
          Object.assign(p, {
            x,
            y,
            vx: Math.cos(a) * s,
            vy: Math.sin(a) * s,
            life: 0.3 + random() * 0.3,
            color,
          });
        }
      },
      popup(x, y, text, tone = "score") {
        if (tone === "score" && /^\+\d+$/.test(text)) {
          for (const p of popups)
            if (
              p.tone === tone &&
              /^\+\d+$/.test(p.text) &&
              p.life > 0.65 &&
              Math.abs(p.x - x) < 28 &&
              Math.abs(p.y - (y - 12)) < 28
            ) {
              p.text = `+${Number(p.text.slice(1)) + Number(text.slice(1))}`;
              p.life = 1.1;
              return;
            }
        }
        const popup = popupPool.acquire();
        if (popup)
          Object.assign(popup, { x, y: y - 12, text, tone, life: 1.1 });
      },
      finish(won = false) {
        status = won ? "won" : "gameover";
        zoomLock.setActive(false);
        selectionLock.setActive(false);
        notice = won
          ? "Page cleared and restored. Restart for another run."
          : "Run ended. Page restored. Restart for another run.";
        clearInput();
        setCompact(false);
        touch.hidden = true;
        board?.destroy();
        ctx?.clearRect(0, 0, width, height);
        emit(status);
        notify(true);
      },
    };
    game = definition.create(api);
    game.reset();
  }
  function nextGate() {
    const gates = board?.targets.filter((t) => t.health > 0) || [];
    const t = gates.find((t) => !t.visible) || gates[0];
    t?.element.scrollIntoView({ behavior: "instant", block: "center" });
    board?.invalidate();
    emit("jump", { target: t?.id });
  }
  function frame(now: number) {
    raf = 0;
    if (status !== "running" || !game || !board) return;
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.034));
    last = now;
    time += dt;
    const workStart = win.performance.now();
    try {
      const dx = win.scrollX - sx,
        dy = win.scrollY - sy;
      sx = win.scrollX;
      sy = win.scrollY;
      if (dx || dy) {
        game.scroll?.(dx, dy);
        translateEntities(particles, dx, dy);
        translateEntities(popups, dx, dy);
      }
      board.measure(time);
      game.update(dt);
      if ((status as GameStatus) !== "running") {
        ctx?.clearRect(0, 0, width, height);
        notify(true);
        return;
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life <= 0) {
          particlePool.releaseAt(i);
        }
      }
      for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i]!;
        p.life -= dt;
        if (!reduced()) p.y -= 18 * dt;
        if (p.life <= 0) popupPool.releaseAt(i);
      }
      draw();
      frameMs = win.performance.now() - workStart;
      maxFrameMs = Math.max(maxFrameMs, frameMs);
      notify();
      if (status === "running") raf = win.requestAnimationFrame(frame);
    } catch (error) {
      notice = "The game stopped safely after an error.";
      stop();
      options.onError?.(error);
    }
  }
  function draw() {
    if (!ctx || !board || !game) return;
    if (status === "won" || status === "gameover") {
      ctx.clearRect(0, 0, width, height);
      return;
    }
    ctx.clearRect(0, 0, width, height);
    board.draw(ctx, time, reduced());
    game.draw(ctx);
    for (const p of particles) {
      ctx.globalAlpha = Math.min(1, p.life * 3);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    }
    ctx.save();
    ctx.font = "700 16px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.lineJoin = "round";
    const popupEdge = theme() === "dark" ? "#101010" : "#ffffff";
    for (const p of popups) {
      ctx.globalAlpha = clamp(p.life / 0.4, 0, 1);
      ctx.strokeStyle = popupEdge;
      ctx.lineWidth = 6;
      ctx.strokeText(p.text, p.x, p.y);
      ctx.strokeStyle = "#101010";
      ctx.lineWidth = 3;
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle =
        p.tone === "upgrade"
          ? "#06c4ff"
          : p.tone === "hurt"
            ? "#f4457a"
            : "#4bce82";
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  function teardown() {
    audio.close();
    zoomLock.setActive(false);
    selectionLock.setActive(false);
    win.cancelAnimationFrame(raf);
    raf = 0;
    for (const off of listeners) off();
    listeners = [];
    board?.destroy();
    board = null;
    host?.remove();
    host = null;
    ui = {};
    game = null;
    particlePool.clear();
    popupPool.clear();
    pausedByVisibility = false;
    ctx = null;
    canvas = null;
    autoFire = false;
  }
  function start() {
    if (destroyed)
      throw new Error(
        "This game instance was destroyed. Create another instance.",
      );
    teardown();
    time = 0;
    notifyAt = -1;
    frameMs = 0;
    maxFrameMs = 0;
    lastStats = {};
    notice = "";
    try {
      mount();
      status = "running";
      zoomLock.setActive(true);
      selectionLock.setActive(true);
      last = win.performance.now();
      draw();
      notify(true);
      audio.unlock();
      emit("start");
      raf = win.requestAnimationFrame(frame);
    } catch (error) {
      teardown();
      status = "idle";
      options.onError?.(error);
      throw error;
    }
    return getSnapshot();
  }
  function pause() {
    if (status !== "running") return;
    status = "paused";
    audio.silence();
    zoomLock.setActive(false);
    selectionLock.setActive(false);
    board?.setActive?.(false);
    clearInput();
    win.cancelAnimationFrame(raf);
    raf = 0;
    notify(true);
    emit("pause");
  }
  function resume() {
    if (status !== "paused" || doc.hidden) return;
    status = "running";
    zoomLock.setActive(true);
    selectionLock.setActive(true);
    notice = "";
    board?.invalidate();
    board?.setActive?.(true);
    last = win.performance.now();
    notify(true);
    raf = win.requestAnimationFrame(frame);
    emit("resume");
  }
  function stop() {
    if (destroyed) return;
    lastStats = game?.snapshot() || lastStats;
    clearInput();
    teardown();
    status = "idle";
    notice = "";
    notify(true);
    emit("recall");
  }
  function destroy() {
    if (destroyed) return;
    stop();
    destroyed = true;
    status = "destroyed";
    notify(true);
  }
  return { start, pause, resume, stop, destroy, getSnapshot };
}
