// Under the hood labs. The page practises what it preaches: one requestAnimationFrame loop drives
// every lab that is on screen, labs off screen sleep, nodes are created once and reused, and only
// transforms and opacity animate. The engine HUD shows it working (FPS, entities, labs awake).
// Reduced motion: nothing moves on its own; buttons still work and show their result.

type Lab = {
  tick?(dt: number, now: number): void;
  wake?(): void;
  sleep?(): void;
  entities?(): number;
};

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pad = (n: number) => String(n).padStart(2, "0");
const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector<T>(sel)!;

// ---------------------------------------------------------------- 00 duel (Bolo, 1990)
function duel(lab: HTMLElement): Lab {
  const stage = $(lab, ".duel");
  const sides = [0, 1].map((s) => {
    const machine = $(stage, `.machine[data-side="${s}"]`);
    const packet = document.createElement("i");
    packet.className = "packet";
    packet.style.opacity = "0";
    stage.append(packet);
    return {
      crt: $(machine, ".crt"),
      sprite: $(machine, ".tank-sprite"),
      flash: $(machine, ".hit-flash"),
      score: $(machine, ".duel-score"),
      packet,
      flying: false,
      land: () => {},
      t: 0,
      x0: 0,
      x1: 0,
      hits: 0,
    };
  });
  const wire = $(stage, ".cable i");
  let y = 0,
    touched = -Infinity,
    next = 1200,
    turn = 0;
  // Line the cable up with the middle of the two screens, so packets leave one CRT and land in the other.
  const measure = () => {
    const top = stage.getBoundingClientRect().top + stage.clientTop;
    const crt = sides[0]!.crt.getBoundingClientRect();
    y = crt.top + crt.height / 2 - top;
    const cable = wire.parentElement!.getBoundingClientRect();
    wire.style.top = `${y - (cable.top - top) - 1.5}px`;
  };
  const centre = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.left + r.width / 2 - stage.getBoundingClientRect().left - stage.clientLeft;
  };
  const fire = (from: number) => {
    const me = sides[from]!,
      them = sides[1 - from]!;
    if (me.flying) return;
    me.sprite.animate([{ transform: "translateX(0)" }, { transform: `translateX(${from ? 4 : -4}px)` }, { transform: "translateX(0)" }], { duration: 160 });
    const land = () => {
      me.flying = false;
      me.hits = (me.hits + 1) % 100;
      me.score.textContent = pad(me.hits);
      them.flash.animate([{ opacity: 0.9 }, { opacity: 0.2 }, { opacity: 0.7 }, { opacity: 0 }], { duration: 360, easing: "steps(4)" });
      if (!reduce) them.sprite.animate([{ transform: "translate(0,0)" }, { transform: "translate(-3px,2px)" }, { transform: "translate(3px,-1px)" }, { transform: "translate(0,0)" }], { duration: 240, easing: "steps(4)" });
    };
    if (reduce) return land();
    // The packet is just state; the engine loop moves it (no timers, no per-shot nodes).
    measure();
    Object.assign(me, { flying: true, t: 0, x0: centre(me.crt), x1: centre(them.crt), land });
    me.packet.style.top = `${y - 5}px`;
  };
  stage.querySelectorAll<HTMLElement>("[data-fire]").forEach((key) =>
    key.addEventListener("click", () => {
      touched = performance.now();
      fire(Number(key.dataset.fire));
      next = 1200;
    }),
  );
  addEventListener("resize", measure, { passive: true });
  measure();
  return {
    tick(dt, now) {
      for (const side of sides) {
        if (!side.flying) continue;
        side.t += dt / 560;
        if (side.t >= 1) {
          side.flying = false;
          side.packet.style.opacity = "0";
          side.land();
          continue;
        }
        const t = side.t;
        side.packet.style.transform = `translateX(${(side.x0 + (side.x1 - side.x0) * t).toFixed(1)}px) scale(${t < 0.12 ? 0.4 + t * 5 : t > 0.9 ? 1 + (t - 0.9) * 6 : 1})`;
        side.packet.style.opacity = String(t < 0.12 ? t / 0.12 : t > 0.92 ? (1 - t) / 0.08 : 1);
      }
      // Two players on two machines: a human on either key, or the attract-mode duel when idle.
      if (!reduce && now - touched > 5000 && (next -= dt) <= 0) {
        next = rand(900, 1700);
        fire((turn = 1 - turn));
      }
    },
    wake: measure,
    entities: () => 2 + sides.filter((s) => s.flying).length,
  };
}

// ---------------------------------------------------------------- 01 the page becomes the board
const BUG = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><path fill="currentColor" fill-rule="evenodd" d="M5 1h1v2h4V1h1v2h1v2h1v8h-1v1H4v-1H3V5h1V3h1zM6 6v1h1V6zm3 0v1h1V6zM1 6h2v1H1zm12 0h2v1h-2zM1 9h2v1H1zm12 0h2v1h-2zM1 12h2v1H1zm12 0h2v1h-2z"/></svg>';
function board(lab: HTMLElement): Lab {
  const figure = $(lab, ".board");
  const page = $(figure, "[data-board]");
  const xray = $(page, ".xray");
  const nest = $(page, ".bugs");
  const factory = $(page, "[data-factory]");
  const toggle = $(figure, "[data-xray]");
  const count = $(figure, "[data-bug-count]");
  const solids = [...page.querySelectorAll<HTMLElement>("[data-solid]")];
  const NAMES: Record<string, string> = { H4: "<h4> COVER", P: "<p> TERRAIN", BUTTON: "<button> FACTORY" };
  const boxes = solids.map((el) => {
    const b = document.createElement("b");
    b.append(document.createElement("span"));
    b.firstElementChild!.textContent = NAMES[el.tagName] ?? el.tagName;
    xray.append(b);
    return b;
  });
  const MAX = 6,
    S = 20;
  const bugs = Array.from({ length: MAX }, () => {
    const el = document.createElement("i");
    el.innerHTML = BUG;
    el.style.opacity = "0";
    nest.append(el);
    return { el, x: 0, y: 0, vx: 0, vy: 0, alive: false };
  });
  let rects: { x: number; y: number; w: number; h: number }[] = [],
    W = 0,
    H = 0,
    top = 30;
  // Read the geometry once (and on resize), like the board adapter: the loop only uses the cache.
  const measure = () => {
    const p = page.getBoundingClientRect();
    W = page.clientWidth;
    H = page.clientHeight;
    top = $(page, ".mini-chrome").offsetHeight;
    rects = solids.map((el, i) => {
      const r = el.getBoundingClientRect();
      const box = { x: r.left - p.left - page.clientLeft, y: r.top - p.top - page.clientTop, w: r.width, h: r.height };
      Object.assign(boxes[i]!.style, { left: `${box.x - 4}px`, top: `${box.y - 4}px`, width: `${box.w + 8}px`, height: `${box.h + 8}px` });
      return box;
    });
  };
  const hits = (x: number, y: number) =>
    x < 0 || y < top || x + S > W || y + S > H || rects.some((r) => x < r.x + r.w && x + S > r.x && y < r.y + r.h && y + S > r.y);
  const place = (b: (typeof bugs)[number]) => {
    const a = Math.atan2(b.vy, b.vx) + Math.PI / 2;
    b.el.style.transform = `translate(${b.x}px,${b.y}px) rotate(${Math.round((a * 180) / Math.PI / 45) * 45}deg)`;
  };
  const alive = () => bugs.filter((b) => b.alive).length;
  const show = () => (count.textContent = `BUGS ${alive()} / ${MAX}${alive() === MAX ? " · CAP" : ""}`);
  const spawn = (fromButton: boolean) => {
    const b = bugs.find((b) => !b.alive);
    if (!b) {
      factory.animate([{ translate: "0 0" }, { translate: "-3px 0" }, { translate: "3px 0" }, { translate: "0 0" }], { duration: 240 });
      return;
    }
    const f = rects[rects.length - 1];
    let x = fromButton && f ? f.x + f.w + 6 : rand(10, W - S - 10),
      y = fromButton && f ? f.y + f.h / 2 - S / 2 : rand(top + 6, H - S - 6);
    for (let n = 0; n < 40 && hits(x, y); n++) (x = rand(6, W - S - 6)), (y = rand(top + 6, H - S - 6));
    const angle = fromButton ? rand(-1.2, -0.3) : rand(0, Math.PI * 2),
      speed = rand(46, 70);
    Object.assign(b, { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alive: true });
    b.el.style.opacity = "1";
    place(b);
    if (!reduce) b.el.animate([{ scale: 0 }, { scale: 1.3 }, { scale: 1 }], { duration: 260, easing: "steps(3)" });
    show();
  };
  factory.addEventListener("click", () => {
    measure();
    spawn(true);
  });
  toggle.addEventListener("click", () => {
    const on = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(on));
    figure.toggleAttribute("data-xray-on", on);
    measure();
  });
  // Easter egg: tap a bug to squash it.
  page.addEventListener("pointerdown", (event) => {
    if (event.target === factory) return;
    const p = page.getBoundingClientRect();
    const x = event.clientX - p.left - page.clientLeft,
      y = event.clientY - p.top - page.clientTop;
    const bug = bugs.find((b) => b.alive && Math.hypot(b.x + S / 2 - x, b.y + S / 2 - y) < 22);
    if (!bug) return;
    bug.alive = false;
    bug.el.animate([{ scale: 1, opacity: 1 }, { scale: 1.6, opacity: 0.6 }, { scale: 0.2, opacity: 0 }], { duration: 220, easing: "steps(3)", fill: "forwards" }).finished.then(() => {
      if (!bug.alive) bug.el.style.opacity = "0";
      bug.el.getAnimations().forEach((a) => a.cancel());
    });
    show();
  });
  new ResizeObserver(measure).observe(page);
  measure();
  spawn(false);
  return {
    tick(dt) {
      if (reduce) return;
      const s = dt / 1000;
      for (const b of bugs) {
        if (!b.alive) continue;
        // Move one axis at a time against the cached rectangles: bounce on whichever axis hits.
        const nx = b.x + b.vx * s;
        if (hits(nx, b.y)) b.vx = -b.vx;
        else b.x = nx;
        const ny = b.y + b.vy * s;
        if (hits(b.x, ny)) b.vy = -b.vy;
        else b.y = ny;
        if (hits(b.x, b.y)) (b.x = Math.min(Math.max(b.x, 2), W - S - 2)), (b.y = Math.min(Math.max(b.y, top + 2), H - S - 2));
        if (Math.random() < s * 0.4) {
          const a = Math.atan2(b.vy, b.vx) + rand(-0.8, 0.8),
            v = Math.hypot(b.vx, b.vy);
          (b.vx = Math.cos(a) * v), (b.vy = Math.sin(a) * v);
        }
        place(b);
      }
    },
    wake: measure,
    entities: alive,
  };
}

// ---------------------------------------------------------------- 02 one loop, bounded work
const SPARKS = ["#4bce82", "#06c4ff", "#f4457a", "#ffd166", "#8573ee"];
function pool(lab: HTMLElement): Lab {
  const figure = $(lab, ".pool");
  const arena = $(figure, "[data-arena]");
  const slots = [...figure.querySelectorAll<HTMLElement>("[data-slots] i")];
  const bar = $(figure, "[data-frame-bar]");
  const ms = $(figure, "[data-frame-ms]");
  const readout = $(figure, "[data-pool-readout]");
  const N = slots.length;
  // The pool is filled once, up front. After this, nothing is ever created again.
  const parts = slots.map((slot, i) => {
    const el = document.createElement("i");
    el.style.setProperty("--c", SPARKS[i % SPARKS.length]!);
    arena.append(el);
    return { el, slot, on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 };
  });
  type Part = (typeof parts)[number];
  let active = 0,
    rejected = 0,
    awake = false,
    touched = -Infinity,
    trickle = 0,
    hud = 0,
    frame = 16.7,
    half = 140;
  const report = () => (readout.textContent = `ACTIVE ${pad(active)} / ${N} · REJECTED ${rejected} · ALLOCATIONS 0`);
  const free = (p: Part) => {
    p.on = false;
    active--;
    p.el.style.opacity = "0";
    p.slot.classList.remove("on");
  };
  const spawn = (count: number) => {
    let capped = false;
    for (let k = 0; k < count; k++) {
      const p = parts.find((p) => !p.on);
      if (!p) {
        rejected++;
        capped = true;
        continue;
      }
      active++;
      // No motion preference: park the spark in the arena and let it expire where it is.
      Object.assign(p, reduce
        ? { on: true, x: rand(-half + 10, half - 10), y: rand(20, 140), vx: 0, vy: 0, life: rand(1.6, 2.6) }
        : { on: true, x: rand(-12, 12), y: 0, vx: rand(-90, 90), vy: rand(170, 270), life: rand(1.6, 2.6) });
      p.slot.classList.add("on");
    }
    if (capped) {
      figure.classList.remove("capped");
      void figure.offsetWidth;
      figure.classList.add("capped");
    }
    report();
  };
  figure.addEventListener("animationend", () => figure.classList.remove("capped"));
  $(figure, "[data-spawn]").addEventListener("click", () => {
    touched = performance.now();
    spawn(8);
  });
  const measure = () => (half = arena.clientWidth / 2);
  report();
  return {
    tick(dt, now) {
      const s = dt / 1000;
      frame += (dt - frame) * 0.1;
      // Attract mode: a small fountain while nobody is pressing SPAWN.
      if (awake && !reduce && now - touched > 4000 && (trickle -= dt) <= 0) {
        trickle = 420;
        if (active < 10) spawn(2);
      }
      for (const p of parts) {
        if (!p.on) continue;
        if ((p.life -= s) <= 0) {
          free(p);
          continue;
        }
        p.vy -= 420 * s;
        p.x += p.vx * s;
        p.y += p.vy * s;
        if (p.y < 0) (p.y = 0), (p.vy *= -0.45), (p.vx *= 0.8);
        if (Math.abs(p.x) > half - 4) (p.x = Math.sign(p.x) * (half - 4)), (p.vx = -p.vx);
        p.el.style.transform = `translate(${p.x.toFixed(1)}px,${(-p.y).toFixed(1)}px)`;
        p.el.style.opacity = String(Math.min(1, p.life * 2));
      }
      // HUD at 10 Hz, separate from the simulation (same rule as the games).
      if ((hud -= dt) <= 0) {
        hud = 100;
        bar.style.transform = `scaleX(${Math.min(1, frame / 33.4)})`;
        ms.textContent = `${frame.toFixed(1)}ms`;
        report();
      }
    },
    wake() {
      awake = true;
      measure();
    },
    sleep() {
      awake = false;
    },
    entities: () => active,
  };
}

// ---------------------------------------------------------------- 03 recall
function recall(lab: HTMLElement): Lab {
  const figure = $(lab, ".recall");
  const victim = $(figure, "[data-victim]");
  const ledger = $(figure, "[data-ledger]");
  const owned = $(figure, "[data-owned]");
  const fire = $<HTMLButtonElement>(figure, "[data-hit]");
  const edit = $<HTMLButtonElement>(figure, "[data-app-edit]");
  const back = $<HTMLButtonElement>(figure, "[data-recall]");
  victim.normalize();
  const text = victim.firstChild as Text;
  const original = text.data;
  const CAP = 6;
  type Entry = { at: number; was: string; wrote: string; app: boolean; li: HTMLLIElement };
  const entries: Entry[] = [];
  const highlights = "highlights" in CSS ? (CSS as unknown as { highlights: Map<string, unknown> }).highlights : null;
  const paint = () => {
    if (!highlights || typeof Highlight === "undefined") return;
    const ranges = (app: boolean) =>
      entries
        .filter((e) => e.app === app)
        .map((e) => {
          const r = new Range();
          r.setStart(text, e.at);
          r.setEnd(text, e.at + 1);
          return r;
        });
    highlights.set("lab-owned", new Highlight(...ranges(false)));
    highlights.set("lab-app", new Highlight(...ranges(true)));
  };
  const sync = () => {
    const mine = entries.filter((e) => !e.app).length;
    const app = entries.length - mine;
    owned.textContent = `OWNED ${mine}${app ? ` · APP ${app}` : ""}${mine >= CAP ? " · CAP" : ""}`;
    edit.disabled = !mine;
    back.disabled = !entries.length && text.data === original;
    paint();
  };
  const log = (html: string, cls = "") => {
    const li = document.createElement("li");
    li.innerHTML = html;
    if (cls) li.className = cls;
    ledger.append(li);
    return li;
  };
  const tidy = () => ledger.querySelectorAll("li.back").forEach((li) => li.remove());
  fire.addEventListener("click", () => {
    tidy();
    if (entries.filter((e) => !e.app).length >= CAP) {
      owned.animate([{ translate: "0 0" }, { translate: "-3px 0" }, { translate: "3px 0" }, { translate: "0 0" }], { duration: 240 });
      return;
    }
    const free = [...text.data].map((c, i) => (/[a-z]/i.test(c) && !entries.some((e) => e.at === i) ? i : -1)).filter((i) => i >= 0);
    if (!free.length) return;
    const at = free[Math.floor(Math.random() * free.length)]!;
    const was = text.data[at]!,
      wrote = Math.random() < 0.5 ? "0" : "1";
    text.replaceData(at, 1, wrote); // same Text node, one character, no wrappers
    const li = log(`<b>#${pad(at)}</b> “${was}” → ${wrote} · GAME`);
    entries.push({ at, was, wrote, app: false, li });
    sync();
  });
  edit.addEventListener("click", () => {
    const mine = entries.filter((e) => !e.app);
    const e = mine[mine.length - 1];
    if (!e) return;
    text.replaceData(e.at, 1, "*");
    e.app = true;
    e.li.className = "app";
    e.li.innerHTML = `<b>#${pad(e.at)}</b> “${e.wrote}” → * · YOUR APP`;
    sync();
  });
  back.addEventListener("click", () => {
    tidy();
    if (!entries.length) {
      // Nothing left to recall: the page reloads, which is the other way to get it back.
      text.data = original;
      log(`<b>↻</b> page reloaded`, "back");
      return sync();
    }
    for (const e of entries.splice(0)) {
      if (!e.app && text.data[e.at] === e.wrote) {
        text.replaceData(e.at, 1, e.was);
        e.li.className = "back";
      } else {
        e.li.innerHTML += " · KEPT";
        e.li.className = "app back";
      }
    }
    sync();
  });
  sync();
  return {};
}

// ---------------------------------------------------------------- 05 build once, ship each
function pipeline(lab: HTMLElement): Lab {
  const figure = $(lab, ".pipeline");
  const stages = [...figure.querySelectorAll<HTMLElement>(".stages li")];
  const parcel = $(figure, ".parcel");
  const key = $<HTMLButtonElement>(figure, "[data-ship]");
  const readout = $(figure, "[data-ship-readout]");
  const SAY = ["BUILD ENGINE", "SNAPSHOT + FINGERPRINT", "TEST · TAG", "PIN EXACT VERSION", "DEPLOY TO PAGES"];
  const LIVE = "LIVE · 0 SERVERS";
  let shipped = false;
  const spot = (el: HTMLElement) => {
    const f = figure.getBoundingClientRect(),
      r = el.getBoundingClientRect();
    return `translate(${r.left + r.width / 2 - f.left - 11}px,${r.top - f.top - 22}px)`;
  };
  const ship = async () => {
    shipped = true;
    key.disabled = true;
    stages.forEach((s) => s.classList.remove("lit"));
    if (reduce) {
      stages.forEach((s) => s.classList.add("lit"));
      readout.textContent = LIVE;
      key.disabled = false;
      return;
    }
    let from = spot(stages[0]!);
    parcel.style.transform = from;
    parcel.style.opacity = "1";
    for (const [i, stage] of stages.entries()) {
      const to = spot(stage);
      readout.textContent = `${SAY[i]!}…`;
      await parcel.animate([{ transform: from }, { transform: `${to} translateY(-10px)`, offset: 0.6 }, { transform: to }], { duration: i ? 420 : 200, easing: "steps(6)", fill: "forwards" }).finished;
      parcel.style.transform = from = to;
      parcel.getAnimations().forEach((a) => a.cancel());
      stage.classList.add("lit");
      await new Promise((r) => setTimeout(r, 260));
    }
    readout.textContent = LIVE;
    parcel.animate([{ scale: 1 }, { scale: 1.5 }, { scale: 1 }], { duration: 300, easing: "steps(3)" });
    key.disabled = false;
  };
  key.addEventListener("click", () => void ship());
  return {
    wake() {
      if (!shipped && !reduce) setTimeout(() => !shipped && void ship(), 500);
    },
  };
}

// ---------------------------------------------------------------- the engine
export function startLabs(root: HTMLElement) {
  const makers: Record<string, (el: HTMLElement) => Lab> = { duel, board, pool, recall, pipeline };
  const labs = new Map<Element, Lab>();
  root.querySelectorAll<HTMLElement>("[data-lab]").forEach((el) => {
    const make = makers[el.dataset.lab ?? ""];
    if (make) labs.set(el, make(el));
  });
  const awake = new Set<Lab>();
  const hud = root.querySelector<HTMLElement>("[data-engine-hud]");
  const fpsOut = hud?.querySelector<HTMLElement>("[data-hud-fps]");
  const entOut = hud?.querySelector<HTMLElement>("[data-hud-entities]");
  const awakeOut = hud?.querySelector<HTMLElement>("[data-hud-awake]");
  let raf = 0,
    last = 0,
    fps = 60,
    hudTimer = 0;
  const report = () => {
    if (!hud) return;
    let n = 0;
    awake.forEach((lab) => (n += lab.entities?.() ?? 0));
    hud.toggleAttribute("data-idle", !raf);
    fpsOut!.textContent = raf ? String(Math.round(fps)) : "--";
    entOut!.textContent = String(n);
    awakeOut!.textContent = String(awake.size);
  };
  const frame = (now: number) => {
    const dt = Math.min(50, last ? now - last : 16.7);
    last = now;
    fps += (1000 / Math.max(dt, 1) - fps) * 0.08;
    awake.forEach((lab) => lab.tick?.(dt, now));
    if ((hudTimer -= dt) <= 0) (hudTimer = 250), report();
    raf = requestAnimationFrame(frame);
  };
  const run = () => {
    const needs = [...awake].some((lab) => lab.tick);
    if (needs && !raf) (last = 0), (raf = requestAnimationFrame(frame));
    if (!needs && raf) cancelAnimationFrame(raf), (raf = 0);
    report();
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const lab = labs.get(entry.target)!;
        if (entry.isIntersecting && !awake.has(lab)) awake.add(lab), lab.wake?.();
        else if (!entry.isIntersecting && awake.has(lab)) awake.delete(lab), lab.sleep?.();
      }
      run();
    },
    { rootMargin: "40px 0px" },
  );
  labs.forEach((_, el) => io.observe(el));
  if (hud) hud.querySelector<HTMLElement>("[data-hud-total]")!.textContent = String(labs.size);
  (window as unknown as { __lab?: unknown }).__lab = { awake: () => awake.size, running: () => !!raf };
}
