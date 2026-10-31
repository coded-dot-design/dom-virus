// The cartridge console: a shelf of cartridges and a handheld console (CartridgeShelf.astro markup).
// Pick a cartridge: it lifts out, flies over and slides down into the console, the screen boots
// (PRESS START, or a choice of pads), then the screen flashes and the action launches: a page, or
// for a full game the screen grows over the viewport first. Pull it back out (tap it, or Esc) and
// it flies home: the exact reverse. With nothing plugged in the screen is a tiny game.
//
// Every move runs on Fizlet: one engine, `fizlet/timeline` tracks on its clock, writes through the
// ledger, and the pauses between beats are timeline tracks too, so the engine settles to 0 fps
// once a move is done. destroy() is Recall: the page is given back as it was. Reduced motion:
// the click follows the cartridge's link (no flight) and anything that does play lands on its end.
//
// Self-contained so other sites can vendor it: the only imports are the two Fizlet files, and
// everything site-specific (where a launch goes, URL state for the way back) comes in as options.
import { createEngine } from "../../vendor/fizlet/kernel/engine";
import { timeline, type Ease, type Timeline, type TimelineOptions, type TrackOptions, type Value } from "../../vendor/fizlet/timeline";

export type CartAction = { pad: "a" | "b" | "start"; label: string; href: string; launch?: "screen" | "board" };
/** Coming back from an action: which cartridge, whether through the board, and a cartridge to swap in after. */
export type ReturnState = { id: string; board: boolean; next?: string | null };
export interface LaunchContext {
  cart: HTMLAnchorElement;
  screen: HTMLElement;
  /** The board covers the viewport (a full game). */
  board: boolean;
  /** Undo the launch here (no navigation): the board folds shut into the screen, the cartridge flies home. */
  back(): void;
}
export interface ConsoleOptions {
  /** The launch, once the screen has flashed (and the board is up). Default: open the action's page. */
  launch?(action: CartAction, ctx: LaunchContext): void;
  /** Pop the cartridges in when the shelf scrolls into view (default true). */
  pop?: boolean;
  /** Way back, before the cartridge docks: mark the page (the hub names the screen for its View Transition). */
  mark?(state: ReturnState): void;
  /** The docked cartridge is seated. */
  docked?(): void;
  /** The page is ready to play the way back (e.g. after the incoming View Transition). Default: two frames. */
  reveal?(fresh: boolean, go: () => void): void;
  /** Drop the return marks (before the cartridge leaves the console). */
  unmark?(): void;
  /** The cartridge is home again. */
  home?(): void;
  /** Back/forward cache restore: the return state to replay, if any. */
  returnState?(): ReturnState | null;
}

// ---------- Easing: CSS cubic-bezier curves and WAAPI keyframe offsets as timeline easings ----------
// Each easing is made once (the timeline samples it into a table, keyed by the function).
type Curve = readonly [number, number, number, number];
const EASE = new Map<string, Ease>();
const memo = (key: string, make: () => Ease) => EASE.get(key) ?? (EASE.set(key, make()), EASE.get(key)!);
const solve = ([x1, y1, x2, y2]: Curve): Ease => {
  const c = (a: number, b: number, t: number) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  return (p) => {
    let lo = 0,
      hi = 1;
    for (let i = 0; i < 24; i++) {
      const t = (lo + hi) / 2;
      if (c(x1, x2, t) < p) lo = t;
      else hi = t;
    }
    return c(y1, y2, (lo + hi) / 2);
  };
};
/** cubic-bezier(x1, y1, x2, y2). */
const bez = (...c: Curve) => memo(`${c}`, () => solve(c));
/** WAAPI keyframes at `offsets` under one easing: the timeline spaces keyframes evenly, so the eased
 *  progress is mapped through the offsets (piecewise linear, extrapolated past the ends). */
const spaced = (c: Curve, offsets: readonly number[]) =>
  memo(`${c}@${offsets}`, () => {
    const ease = bez(...c),
      n = offsets.length - 1;
    return (p) => {
      const v = ease(p);
      let i = 0;
      while (i < n - 1 && v > offsets[i + 1]!) i++;
      return (i + (v - offsets[i]!) / (offsets[i + 1]! - offsets[i]!)) / n;
    };
  });
/** CSS animation-direction: reverse, as an easing on keyframes written in play order. */
const reversed = (c: Curve) =>
  memo(`${c}~`, () =>
    (
      (ease) => (p: number) =>
        1 - ease(1 - p)
    )(bez(...c)),
  );
const LINEAR = (p: number) => p;
// One transform shape for every cartridge keyframe (only the numbers change).
const T = (x = 0, y = 0, s = 1, r = 0) => `translate(${x}px, ${y}px) scale(${s}) rotate(${r}deg)`;

export function mount(root: HTMLElement, o: ConsoleOptions = {}) {
  const doc = root.ownerDocument,
    win = doc.defaultView!,
    html = doc.documentElement;
  const shelf = root.querySelector<HTMLElement>("[data-shelf]")!;
  const consoleEl = root.querySelector<HTMLElement>("[data-console]")!;
  const deck = root.querySelector<HTMLElement>("[data-flight-deck]");
  const screen = consoleEl.querySelector<HTMLElement>("[data-console-screen]")!;
  const ctl = new AbortController(),
    on = { signal: ctl.signal };
  const reduced = () => win.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- The engine: one clock for every move; it settles when nothing moves ----------
  const engine = createEngine({ settle: 0.25, pause: { editable: false } });
  engine.start();
  type Run = { tl: Timeline; els: readonly Element[]; done: Promise<void> };
  type To = (el: object, values: Record<string, Value>, t?: TrackOptions) => To;
  const runs = new Set<Run>();
  /**
   * Build and play a timeline on `els`; `done` resolves when it ends (never if it is halted).
   * A track's first keyframe is written at once, through the ledger: the timeline's own first write
   * lands a frame or two later (a settled engine's first frame has no step), and in between the
   * page would show the element as it was (a board without its clip, a cartridge off its seat).
   */
  function run(els: readonly Element[], fill: (to: To) => unknown, opts?: TimelineOptions): Run {
    const tl = timeline(engine, opts),
      held = new Set<string>();
    const to: To = (el, values, t) => {
      els.forEach((e, i) => {
        if (e !== el) return;
        for (const k in values) {
          const v = values[k];
          if (Array.isArray(v) && !held.has(i + k)) (held.add(i + k), engine.ledger.style(el as HTMLElement, k, String(v[0])));
        }
      });
      tl.to(el, values, t);
      return to;
    };
    fill(to);
    let end!: () => void;
    const r: Run = { tl, els, done: new Promise<void>((res) => (end = res)) };
    runs.add(r);
    void tl.done().then(() => {
      if (!runs.delete(r)) return;
      engine.remove(tl);
      end();
    });
    tl.play();
    return r;
  }
  /** A pause between beats, on the engine's clock (it keeps the engine awake while it counts). */
  const wait = (sec: number) => run([], (to) => to(new Float64Array(1), { 0: [0, 1] }, { dur: sec, ease: LINEAR }), { motion: true });
  const later = (sec: number, fn: () => void) => {
    const r = wait(sec);
    void r.done.then(fn);
    return r;
  };
  const cancel = (r?: Run | null) => {
    if (r && runs.delete(r)) (r.tl.pause(), engine.remove(r.tl));
  };
  /** Stop every move on `el` and give its inline `props` back (what cancelling an animation did). */
  function halt(el: Element, props = ["transform", "translate"]) {
    for (const r of runs) if (r.els.includes(el)) cancel(r);
    for (const p of props) engine.ledger.unstyle(el as HTMLElement, p);
  }
  /** Play and then give the touched properties back (a one-shot CSS animation without fill). */
  const blip = (els: HTMLElement[], props: string[], fill: (to: To) => unknown) => {
    const r = run(els, fill);
    void r.done.then(() => els.forEach((el) => props.forEach((p) => engine.ledger.unstyle(el, p))));
    return r;
  };

  // ---------- Shelf pop-in: cartridges pop up as the shelf scrolls in ----------
  let setPopIn = () => {};
  if (o.pop !== false && "IntersectionObserver" in win) {
    shelf.dataset.pop = "wait";
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        // `wait` hides them until the first frame is written; "in" once they've landed.
        const pops = allCarts().map((cart) =>
          blip([cart], ["opacity", "transform"], (to) =>
            to(
              cart,
              { opacity: [0, 1], transform: [T(0, 90, 1, 6), T()] },
              { dur: 0.7, ease: bez(0.3, 1.5, 0.5, 1), at: 0.11 * +(getComputedStyle(cart).getPropertyValue("--i") || 0) },
            ),
          ),
        );
        void Promise.all(pops.map((r) => r.done)).then(() => (shelf.dataset.pop = "in"));
        // A cartridge picked mid-pop lands at once (halt), so stop waiting for the rest of the row.
        setPopIn = () => (shelf.dataset.pop = "in");
      },
      { threshold: 0.15 },
    );
    io.observe(shelf);
    ctl.signal.addEventListener("abort", () => io.disconnect());
  }

  // ---------- Phones: the shelf is a swipe row, so a flying cartridge is lifted out into the deck ----------
  const scrollerShelf = () => getComputedStyle(shelf).overflowX !== "visible";
  const lifted = (cart: HTMLElement) => cart.parentElement === deck;
  const allCarts = () => [...root.querySelectorAll<HTMLAnchorElement>("[data-shelf] .cartridge, [data-flight-deck] .cartridge")];
  function liftOut(cart: HTMLElement) {
    if (!deck || !scrollerShelf() || lifted(cart)) return;
    const bay = cart.parentElement!,
      host = deck.offsetParent!.getBoundingClientRect();
    cart.style.setProperty("transform", "none", "important");
    const r = cart.getBoundingClientRect();
    cart.style.removeProperty("transform");
    // The bay keeps its own height (not the cartridge's, which can overhang it): nothing moves.
    bay.style.minHeight = `${bay.getBoundingClientRect().height}px`;
    bay.classList.add("out");
    deck.append(cart);
    Object.assign(cart.style, {
      position: "absolute",
      margin: "0",
      left: `${r.left - host.left}px`,
      top: `${r.top - host.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
  }
  function putBack(cart: HTMLElement) {
    if (!lifted(cart)) return;
    const bay = root.querySelector<HTMLElement>(`[data-bay="${cart.dataset.cart}"]`)!;
    for (const k of ["position", "margin", "left", "top", "width", "height"]) cart.style.removeProperty(k);
    bay.append(cart);
    bay.classList.remove("out");
    bay.style.removeProperty("min-height");
  }
  function centreBay(cart: HTMLElement) {
    if (!scrollerShelf() || lifted(cart)) return;
    const bay = cart.parentElement!.getBoundingClientRect(),
      row = shelf.getBoundingClientRect();
    shelf.scrollTo({ left: shelf.scrollLeft + bay.left - row.left - (row.width - bay.width) / 2, behavior: "instant" });
  }

  // ---------- The lock: where the page sits while a cartridge is in ----------
  // The same spot going in (a click) and coming back (a return URL, back/forward, a swap), so the
  // way back is an exact reverse. The shelf section is a full-viewport hero: its top goes to the
  // viewport top and the console sits centred in it. Taller than the viewport (short screens): the
  // console and the seated cartridge, centred where they fit, the console's bottom in view where
  // they don't; never past the section, so what follows it (the footer) plays no part. Measured
  // once, at rest, before a move starts: the seat's height is the tallest cartridge at its seat scale.
  function lockY() {
    const y = win.scrollY,
      vh = win.innerHeight,
      s = root.getBoundingClientRect(),
      top = s.top + y;
    if (s.height <= vh + 1) return Math.round(top);
    const c = consoleEl.getBoundingClientRect(),
      body = consoleEl.querySelector<HTMLElement>(".body")!.getBoundingClientRect();
    const seat = Math.max(0, ...allCarts().map((n) => n.offsetHeight * Math.min(1, (body.width * 0.56) / (n.offsetWidth || 1))));
    const from = body.top - seat,
      to = c.bottom + 16;
    const want = to - from <= vh ? (from + to - vh) / 2 : to - vh;
    return Math.round(Math.min(Math.max(want + y, top), top + s.height - vh));
  }
  /** Scroll to the lock (`target` measured earlier, or now). True when the page had to move. */
  function lockTo(target = lockY(), behavior: ScrollBehavior = "instant") {
    if (Math.abs(win.scrollY - target) < 1) return false;
    win.scrollTo({ top: target, behavior: reduced() ? "instant" : behavior });
    return true;
  }

  // ---------- Sound: a cartridge click on insert, a power-on chirp per LED ----------
  let audio: AudioContext | undefined;
  function unlockAudio() {
    try {
      audio ??= new AudioContext();
      if (audio.state === "suspended") void audio.resume();
    } catch {}
  }
  function tone(type: OscillatorType, from: number, to: number, at: number, dur: number, vol: number) {
    if (!audio || audio.state !== "running") return;
    const t = audio.currentTime + at,
      osc = audio.createOscillator(),
      g = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(audio.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  const sfx = {
    click: () => (tone("square", 2400, 500, 0, 0.03, 0.05), tone("square", 1400, 260, 0.05, 0.045, 0.06)),
    power: (at = 0) => (tone("triangle", 220, 880, at, 0.16, 0.07), tone("sine", 1320, 1320, at + 0.17, 0.07, 0.04)),
  };

  // ---------- One cartridge at a time ----------
  // While one is flying, loading, launching or coming home, the others say "not now" (a wiggle and
  // a buzz). While the console waits for you, tapping the seated cartridge (or Esc) pulls it out.
  let waiting: { cart: HTMLElement; pull: () => void } | null = null;
  function refuse(cart: HTMLElement) {
    tone("square", 140, 110, 0, 0.09, 0.03);
    // `translate` stacks on the cartridge's own transform (its seat or flight).
    blip([cart], ["translate"], (to) => to(cart, { translate: ["0px 0px", "-5px 0px", "5px 0px", "-3px 0px", "0px 0px"] }, { dur: 0.26, ease: "steps(5)" }));
    // Hint: the seated cartridge hops, so you know which one is in the way.
    const seated = waiting && waiting.cart !== cart ? waiting.cart : null;
    if (seated) blip([seated], ["translate"], (to) => to(seated, { translate: ["0px 0px", "0px -7px", "0px 0px"] }, { dur: 0.3, ease: bez(0.3, 0.7, 0.3, 1) }));
  }
  const onCartClick = (event: Event) => {
    const cart = (event.target as Element).closest<HTMLAnchorElement>("a.cartridge");
    const mouse = event as MouseEvent;
    if (!cart || mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.button) return;
    if (reduced()) return;
    event.preventDefault();
    if (shelf.dataset.plugging) {
      // detail is 0 for keyboard clicks: Enter is START on the console, never eject.
      if (waiting?.cart === cart && mouse.detail) return waiting.pull();
      return refuse(cart);
    }
    unlockAudio();
    const target = lockY();
    halt(cart, ["transform", "translate", "opacity"]);
    setPopIn();
    liftOut(cart);
    // Swipe row: a cartridge tapped half off-screen pulls its spot to the middle while it flies in.
    if (lifted(cart)) {
      const bay = root.querySelector<HTMLElement>(`[data-bay="${cart.dataset.cart}"]`)!.getBoundingClientRect(),
        row = shelf.getBoundingClientRect();
      shelf.scrollTo({ left: shelf.scrollLeft + bay.left - row.left - (row.width - bay.width) / 2, behavior: "smooth" });
    }
    shelf.dataset.plugging = cart.dataset.cart!;
    cart.classList.add("plugging");
    // Lock the page on the shelf first (measured above, before anything moved), then fly; the
    // swipe row rides along, no pause.
    const moved = lockTo(target, "smooth");
    const go = () => plug(cart);
    if (moved && !scrollerShelf()) later(0.38, go);
    else go();
  };
  shelf.addEventListener("click", onCartClick, on);
  deck?.addEventListener("click", onCartClick, on);

  // Where a plugged cartridge sits: it slides down behind the console's top edge, just past its pins.
  // Measured without any hover lift so the depth never varies.
  type Seat = { dx: number; dy: number; k: number; h: number };
  function slotOffset(cart: HTMLElement): Seat {
    engine.ledger.style(cart, "transform-origin", "50% 100%");
    cart.style.setProperty("transition", "none");
    cart.style.setProperty("transform", "none", "important");
    const c = cart.getBoundingClientRect(),
      label = cart.querySelector<HTMLElement>(".label")!.getBoundingClientRect(),
      body = consoleEl.querySelector<HTMLElement>(".body")!.getBoundingClientRect();
    cart.style.removeProperty("transform");
    cart.style.removeProperty("transition");
    const k = Math.min(1, (body.width * 0.56) / c.width);
    return { dx: body.left + body.width / 2 - (c.left + c.width / 2), dy: body.top + (c.bottom - label.bottom) * k - c.bottom, k, h: c.height };
  }
  const seatAt = ({ dx, dy, k }: Seat) => T(dx, dy, k);

  // ---------- Boot: power LED(s), the cartridge's name, PRESS START (or its pads) ----------
  function boot(cart: HTMLElement, full: boolean) {
    engine.ledger.style(consoleEl, "--boot", getComputedStyle(cart).getPropertyValue("--accent") || "#f4457a");
    const name = consoleEl.querySelector<HTMLElement>("[data-console-name]")!;
    name.textContent = cart.querySelector("strong")?.textContent ?? "";
    pressText(cart);
    consoleEl.classList.remove("starting", "is-loading");
    consoleEl.classList.toggle("full", full);
    consoleEl.classList.add("booting");
    // The name types on: spread wide and dim, in three steps.
    // Spread wide by a transform, not letter-spacing: the glyphs never move in layout (no shift).
    blip([name], ["opacity", "transform"], (to) => to(name, { opacity: [0, 1], transform: ["scaleX(1.5)", "scaleX(1)"] }, { dur: 0.42, ease: "steps(3)" }));
  }
  function plug(cart: HTMLAnchorElement, autoPad?: string) {
    const seat = slotOffset(cart),
      { dx, dy, k, h } = seat;
    const full = cart.hasAttribute("data-full");
    // Phones: pick it up a touch, glide over the slot, slide straight down in. Desktop: an arc.
    const flight = lifted(cart)
      ? run([cart], (to) => {
          to(cart, { transform: [T(), T(0, -14, 1.03)] }, { dur: 0.76 * 0.24, ease: bez(0.2, 0.7, 0.3, 1) });
          to(cart, { transform: T(dx, -14, k) }, { dur: 0.76 * 0.26, ease: bez(0.4, 0, 0.2, 1) });
          to(cart, { transform: T(dx, dy, k) }, { dur: 0.76 * 0.5, ease: bez(0.45, 0, 0.25, 1) });
        })
      : run([cart], (to) =>
          to(
            cart,
            { transform: [T(), T(0, -28, 1.06, -3), T(dx, dy - h * 0.55, k), T(dx, dy - h * 0.2, k), seatAt(seat)] },
            { dur: 0.82, ease: spaced([0.3, 0.7, 0.3, 1], [0, 0.24, 0.68, 0.82, 1]) },
          ),
        );
    // Seated: click, power LED (two for a full game), PRESS START; A, a tap or Enter starts (or wait).
    void flight.done.then(() => {
      sfx.click();
      sfx.power(0.12);
      if (full) sfx.power(0.5);
      boot(cart, full);
      seated(cart, seat, autoPad);
    });
  }
  function seated(cart: HTMLAnchorElement, seat: Seat, autoPad?: string) {
    // The cartridge declares what it can do; the console maps those actions onto its pads.
    const actions = cartActions(cart);
    let started = false,
      auto: Run | null = null,
      press: Run | null = null;
    const stop = () => {
      started = true;
      waiting = null;
      cancel(auto);
      cancel(press);
      win.removeEventListener("keydown", onKey);
      pad?.removeEventListener("click", onPad);
      screen.removeEventListener("click", onScreen);
    };
    const start = (action: CartAction) => {
      if (started) return;
      stop();
      // Both launches leave the console where it is (so coming back is the exact reverse): the
      // screen flashes, then it launches, or first opens into the board.
      consoleEl.classList.add("starting");
      flash();
      const board = action.launch === "board";
      const ms = loadingScreen(board || !/info/i.test(action.label) ? "GAME" : "INFO");
      const ctx: LaunchContext = { cart, screen, board, back: () => back(cart, seat, ctx) };
      later(ms / 1000, () => (board ? openBoard(() => launch(action, ctx)) : launch(action, ctx)));
    };
    const byPad = (p: string) => actions.find((a) => a.pad === p) ?? (actions.length === 1 && (p === "a" || p === "start") ? actions[0] : undefined);
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "escape") return (e.preventDefault(), pull());
      const action = key === "enter" || key === " " ? actions[0] : byPad(key === "s" ? "start" : key);
      if (!action) return;
      e.preventDefault();
      start(action);
    };
    const onPad = (e: Event) => {
      const action = byPad((e.target as HTMLElement).closest<HTMLElement>("[data-pad]")?.dataset.pad ?? "");
      if (action) start(action);
    };
    const pad = consoleEl.querySelector("[data-console-pad]");
    if (actions.length < 2) auto = later(1.8, () => start(actions[0]!));
    // Cartridge swap (e.g. "Swap to Battlefield"): the console presses the button for you.
    if (autoPad) {
      const btn = consoleEl.querySelector<HTMLElement>(`[data-pad="${autoPad}"]`);
      press = later(1.1, () => {
        btn?.classList.add("press");
        press = later(0.17, () => {
          btn?.classList.remove("press");
          const action = byPad(autoPad);
          if (action) start(action);
        });
      });
    }
    const onScreen = () => start(actions[0]!);
    // Changed your mind? Pull the cartridge back out: the exact reverse of the insert.
    const pull = () => {
      if (started) return;
      stop();
      sfx.click();
      eject(cart, seat);
    };
    waiting = { cart, pull };
    win.addEventListener("keydown", onKey, on);
    pad?.addEventListener("click", onPad, on);
    screen.addEventListener("click", onScreen, on);
  }
  const launch = (action: CartAction, ctx: LaunchContext) => (o.launch ? o.launch(action, ctx) : (win.location.href = action.href));
  // A launch undone in place (no navigation): fold the board shut if it is up, then fly home.
  function back(cart: HTMLAnchorElement, seat: Seat, ctx: LaunchContext) {
    consoleEl.classList.remove("starting", "is-loading");
    const board = doc.querySelector<HTMLElement>(".board-open");
    html.classList.remove("board-full");
    if (board && ctx.board) {
      board.classList.remove("hold");
      board.classList.add("shut");
      closeBoard(board, () => eject(cart, seat));
    } else eject(cart, seat);
  }
  // Start: the screen flashes white for one beat (two steps), then it is the boot colour again.
  function flash() {
    const bg = getComputedStyle(screen).backgroundColor,
      m = /^(rgba?)\(([^)]*)\)$/.exec(bg);
    if (!m) return;
    const white = `${m[1]}(255, 255, 255${m[2]!.split(",").length > 3 ? ", 1" : ""})`;
    blip([screen], ["background-color"], (to) => to(screen, { "background-color": [bg, white, bg] }, { dur: 0.18, ease: "steps(2)" }));
  }
  // After start: LOADING GAME / LOADING INFO. Now and then the cartridge is "stubborn" and the
  // screen flips to an old-console fix first (a little longer). Returns the wait in ms.
  const LOAD_JOKES = [
    "BLOWING ON PINS",
    "JIGGLE CARTRIDGE",
    "DUST IN THE SLOT",
    "RESEATING PINS",
    "ADJUST TRACKING",
    "PFFFT. TRY AGAIN",
    "HOLD RESET. KIDDING",
  ];
  function loadingScreen(what: string) {
    const el = consoleEl.querySelector<HTMLElement>("[data-console-loading]")!;
    el.textContent = `LOADING ${what}`;
    consoleEl.classList.add("is-loading");
    if (Math.random() > 0.3) return 700;
    later(0.65, () => {
      el.textContent = LOAD_JOKES[Math.floor(Math.random() * LOAD_JOKES.length)]!;
      tone("square", 180, 120, 0, 0.12, 0.03);
    });
    return 1750;
  }
  function cartActions(cart: HTMLElement): CartAction[] {
    try {
      const list = JSON.parse(cart.dataset.actions || "[]") as CartAction[];
      if (list.length) return list;
    } catch {}
    return [{ pad: "a", label: "START", href: cart.getAttribute("href")!, launch: "screen" }];
  }
  const PAD_ORDER = ["start", "b", "a"];
  const PAD_CHIP = { a: ["ka", "RED"], b: ["kb", "BLUE"], start: ["ks", "START"] } as const;
  function pressText(cart: HTMLElement) {
    const press = consoleEl.querySelector<HTMLElement>("[data-console-press]")!,
      actions = cartActions(cart);
    consoleEl.classList.toggle("choice", actions.length > 1);
    if (actions.length < 2) press.textContent = "PRESS START";
    // Chips follow the pads' left-to-right order on the console: Start, B (blue), A (red).
    else
      press.innerHTML = [...actions]
        .sort((x, y) => PAD_ORDER.indexOf(x.pad) - PAD_ORDER.indexOf(y.pad))
        .map((a) => `<b class="${PAD_CHIP[a.pad][0]}">${PAD_CHIP[a.pad][1]}</b> ${a.label}`)
        .join(" ");
  }

  // ---------- Full game: the screen grows over the viewport; the board's doors stay shut ----------
  function buildBoard() {
    const board = doc.createElement("div");
    board.className = "board-open";
    board.setAttribute("aria-hidden", "true");
    const blocks = [
      [12, 22, 9, 6],
      [70, 18, 6, 12],
      [30, 64, 12, 5],
      [78, 70, 8, 8],
      [48, 38, 5, 14],
    ]
      .map(([x, y, w, hh]) => `<b style="--x:${x}%;--y:${y}%;--w:${w}%;--h:${hh}%"></b>`)
      .join("");
    const tanks = (
      [
        [18, 46, "#06c4ff"],
        [24, 74, "#06c4ff"],
        [74, 36, "#f4457a"],
        [84, 56, "#f4457a"],
      ] as const
    )
      .map(([x, y, c], i) => `<em style="--x:${x}%;--y:${y}%;--c:${c};--d:${i * 70}ms"></em>`)
      .join("");
    board.innerHTML = `${blocks}${tanks}<span>DEPLOYING SQUAD</span><i class="l"></i><i class="r"></i>`;
    doc.body.append(board);
    return board;
  }
  const screenClip = () => {
    const r = screen.getBoundingClientRect();
    return `inset(${r.top}px ${win.innerWidth - r.right}px ${win.innerHeight - r.bottom}px ${r.left}px round 10px)`;
  };
  const FULL = "inset(0px 0px 0px 0px round 0px)";
  // The game page paints the same shut doors and opens them once it has loaded.
  function openBoard(done: () => void) {
    const board = buildBoard();
    board.classList.add("hold");
    run([board], (to) => to(board, { "clip-path": [screenClip(), FULL] }, { dur: 0.6, ease: bez(0.7, 0, 0.2, 1) }));
    tone("sawtooth", 90, 360, 0.05, 0.55, 0.035);
    // Once the doors cover the page, drop its scrollbar: the game page has none, so the doors'
    // seam lands on the same pixel when the game takes over.
    later(0.62, () => html.classList.add("board-full"));
    later(0.7, done);
  }
  // The reverse: the doors fold shut over the board, then it shrinks back into the console screen.
  function closeBoard(board: HTMLElement, done: () => void) {
    board.classList.add("closing");
    const doors = [...board.querySelectorAll<HTMLElement>(":scope > i")];
    run(doors, (to) =>
      doors.forEach((door) =>
        to(
          door,
          { transform: [`rotateY(${door.classList.contains("r") ? 100 : -100}deg)`, "rotateY(0deg)"], opacity: [0.4, 1] },
          { dur: 0.5, delay: 0.1, at: 0, ease: reversed([0.6, 0, 0.3, 1]) },
        ),
      ),
    );
    later(
      0.76,
      () =>
        void run([board], (to) => to(board, { "clip-path": [FULL, screenClip()] }, { dur: 0.56, ease: bez(0.7, 0, 0.2, 1) })).done.then(() => {
          board.remove();
          done();
        }),
    );
  }

  // ---------- The way back: docked at load, then out and home ----------
  function dock(cart: HTMLAnchorElement) {
    halt(cart, ["transform", "translate", "opacity"]);
    // Swipe row: bring its spot to the middle first, so it flies home to a place you can see.
    if (scrollerShelf() && !lifted(cart)) {
      centreBay(cart);
      liftOut(cart);
    }
    shelf.dataset.plugging = cart.dataset.cart!;
    cart.classList.add("plugging");
    const seat = slotOffset(cart);
    // Seated before the first frame (the ledger write lands now; the eject takes it from here).
    engine.ledger.style(cart, "transform", seatAt(seat));
    o.docked?.();
    boot(cart, cart.hasAttribute("data-full"));
    return seat;
  }
  // A swap chains a second cartridge after the eject: it flies in, boots and the console presses
  // its button for you (e.g. Sherman Bytes out, DOM Battlefield in).
  let chained: string | null = null;
  function swapIn(id: string, pad = "a") {
    const cart = allCarts().find((n) => n.dataset.cart === id);
    if (!cart) return;
    if (reduced()) return void (win.location.href = cartActions(cart).find((a) => a.pad === pad)?.href ?? cart.href);
    halt(cart, ["transform", "translate", "opacity"]);
    centreBay(cart);
    liftOut(cart);
    shelf.dataset.plugging = id;
    cart.classList.add("plugging");
    plug(cart, pad);
  }
  /** Put every cartridge home and the console back to idle, at once. */
  function rewind() {
    waiting = null;
    for (const r of [...runs]) cancel(r);
    doc.querySelectorAll(".board-open").forEach((n) => n.remove());
    html.classList.remove("board-full");
    delete shelf.dataset.plugging;
    allCarts().forEach((n) => {
      n.classList.remove("plugging");
      halt(n, ["transform", "translate", "opacity", "transform-origin"]);
      putBack(n);
    });
    consoleEl.classList.remove("booting", "starting", "is-loading", "full", "choice");
  }
  function returnHome(state: ReturnState, fresh = false) {
    lockTo();
    const cart = allCarts().find((n) => n.dataset.cart === state.id);
    chained = state.next && /^[\w-]+$/.test(state.next) ? state.next : null;
    doc.querySelectorAll(".board-open").forEach((n) => n.remove());
    html.classList.remove("board-full");
    if (!cart || reduced()) {
      rewind();
      o.home?.();
      if (chained) swapIn(chained);
      return;
    }
    o.mark?.(state);
    const seat = dock(cart);
    // The full game comes back through its board; the board is up before the first frame.
    const board = state.board ? buildBoard() : null;
    board?.classList.add("shut");
    if (board) o.unmark?.();
    const reveal = o.reveal ?? ((_: boolean, go: () => void) => requestAnimationFrame(() => requestAnimationFrame(go)));
    reveal(fresh, () => {
      if (board) return closeBoard(board, () => eject(cart, seat));
      o.unmark?.();
      later(0.16, () => eject(cart, seat));
    });
  }
  // The cartridge pops out of the console and flies home.
  function eject(cart: HTMLElement, seat: Seat) {
    const { dx, dy, k, h } = seat;
    halt(cart);
    // Phones: the exact reverse of the phone insert (straight up out of the slot, glide, set down).
    const out = lifted(cart)
      ? run([cart], (to) => {
          to(cart, { transform: [seatAt(seat), T(dx, -14, k)] }, { dur: 0.8 * 0.5, ease: bez(0.3, 0, 0.2, 1) });
          to(cart, { transform: T(0, -14, 1.03) }, { dur: 0.8 * 0.26, ease: bez(0.45, 0, 0.25, 1) });
          to(cart, { transform: T() }, { dur: 0.8 * 0.24, ease: bez(0.3, 0.6, 0.3, 1) });
        })
      : run([cart], (to) =>
          to(
            cart,
            { transform: [seatAt(seat), T(dx, dy - h * 0.75, k, 4), T(dx * 0.4, (dy - h) * 0.5, 1.04, -3), T()] },
            { dur: 0.9, ease: spaced([0.3, 0.7, 0.3, 1], [0, 0.3, 0.65, 1]) },
          ),
        );
    later(0.3, () => consoleEl.classList.remove("booting", "is-loading", "full", "choice"));
    void out.done.then(() => {
      // Home means home: no hold, hop or leftover transform, exactly in its bay.
      halt(cart, ["transform", "translate", "transform-origin"]);
      cart.classList.remove("plugging");
      putBack(cart);
      delete shelf.dataset.plugging;
      o.home?.();
      const next = chained;
      chained = null;
      if (next) later(0.26, () => swapIn(next));
    });
  }
  // Back/forward cache: the page is restored mid-launch; rewind it from there.
  win.addEventListener(
    "pageshow",
    (event) => {
      if (!event.persisted) return;
      doc.querySelectorAll(".board-open").forEach((n) => n.remove());
      html.classList.remove("board-full");
      const state = o.returnState?.();
      if (state) return returnHome(state, true);
      rewind();
      o.unmark?.();
    },
    on,
  );

  // ---------- Idle: with nothing plugged in the screen is a tiny game ----------
  // A (red) fires from the bottom at the crosshair in the middle (bad guys score, good guys are
  // "OOPS"), B (blue) or a tap on the screen makes the middle character jump, Start makes them all hop.
  const attractRow = consoleEl.querySelector<HTMLElement>("[data-attract]")!;
  const hitsEl = consoleEl.querySelector<HTMLElement>("[data-console-hits]")!;
  let hits = 0,
    aim: Run | null = null;
  function middleOne(reach: number) {
    const row = attractRow.getBoundingClientRect(),
      cx = row.left + row.width / 2;
    let best: HTMLElement | null = null;
    for (const i of attractRow.querySelectorAll<HTMLElement>("i:not(.zapped)")) {
      const r = i.getBoundingClientRect(),
        d = Math.abs(r.left + r.width / 2 - cx);
      if (d < reach) ((reach = d), (best = i));
    }
    return best;
  }
  function idleShoot() {
    const row = attractRow,
      from = screen.getBoundingClientRect().bottom - row.getBoundingClientRect().top;
    row.classList.add("aiming");
    cancel(aim);
    aim = later(0.9, () => row.classList.remove("aiming"));
    const bolt = doc.createElement("b");
    bolt.className = "bolt";
    row.append(bolt);
    tone("square", 1400, 320, 0, 0.07, 0.03);
    void run([bolt], (to) => to(bolt, { transform: [`translateY(${from}px)`, "translateY(6px)"] }, { dur: 0.17, ease: LINEAR })).done.then(() => {
      const target = middleOne(16);
      if (!target) {
        void run([bolt], (to) => to(bolt, { transform: ["translateY(6px)", "translateY(-60px)"], opacity: [1, 0] }, { dur: 0.16, ease: LINEAR })).done.then(
          () => bolt.remove(),
        );
        return;
      }
      bolt.remove();
      target.classList.add("zapped");
      later(0.9, () => target.classList.remove("zapped"));
      const burst = doc.createElement("b");
      burst.className = "burst";
      row.append(burst);
      void run([burst], (to) => to(burst, { transform: ["scale(0.3)", "scale(1.4)"], opacity: [1, 0] }, { dur: 0.32, ease: bez(0, 0, 0.58, 1) })).done.then(
        () => burst.remove(),
      );
      tone("sawtooth", 260, 60, 0, 0.16, 0.04);
      const friendly = target.dataset.side === "good";
      if (!friendly) hits++;
      hitsEl.textContent = friendly ? "OOPS! FRIENDLY" : `HITS ${String(hits).padStart(2, "0")}`;
      hitsEl.classList.add("on");
      screen.classList.toggle("oops", friendly);
    });
  }
  function idleJump() {
    const one = middleOne(40);
    if (!one || one.classList.contains("jump")) return;
    one.classList.add("jump");
    tone("sine", 330, 660, 0, 0.12, 0.03);
    later(0.24, () => one.classList.remove("jump"));
  }
  consoleEl.querySelector("[data-console-pad]")?.addEventListener(
    "click",
    (event) => {
      const pad = (event.target as HTMLElement).closest<HTMLElement>("[data-pad]")?.dataset.pad;
      if (!pad || consoleEl.classList.contains("booting")) return;
      unlockAudio();
      if (pad === "a") idleShoot();
      else if (pad === "b") idleJump();
      else if (pad === "start") {
        const attract = consoleEl.querySelector<HTMLElement>(".attract")!;
        attract.classList.remove("hop");
        void attract.offsetWidth;
        attract.classList.add("hop");
        later(0.16, () => attract.classList.remove("hop"));
      }
    },
    on,
  );
  screen.addEventListener(
    "click",
    () => {
      if (consoleEl.classList.contains("booting")) return;
      unlockAudio();
      idleJump();
    },
    on,
  );

  return {
    engine,
    /** Play the way back from an action (the cartridge docked, then out and home). */
    returnHome,
    /** Scroll to the lock now, at once (a page that arrives with a cartridge to plug in). */
    lock: () => void lockTo(),
    /** Plug a cartridge in and press `pad` for it, after `delay` seconds. */
    swapIn: (id: string, pad = "a", delay = 0) => (delay ? later(delay, () => swapIn(id, pad)) : swapIn(id, pad)),
    /** Recall: every move stops, every cartridge goes home, the page is given back as it was. */
    destroy() {
      rewind();
      attractRow.querySelectorAll(".bolt,.burst").forEach((n) => n.remove());
      attractRow.querySelectorAll(".zapped,.jump").forEach((n) => n.classList.remove("zapped", "jump"));
      attractRow.classList.remove("aiming", "hop");
      hitsEl.textContent = "";
      hitsEl.classList.remove("on");
      screen.classList.remove("oops");
      if (shelf.dataset.pop) shelf.dataset.pop = "in";
      ctl.abort();
      engine.destroy();
      void audio?.close().catch(() => {});
    },
  };
}
export type ConsoleHandle = ReturnType<typeof mount>;
