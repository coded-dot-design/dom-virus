import { registry } from "@game-registry";
type Snapshot = { status?: string; score?: number };
type Controller = {
  start(): unknown;
  pause(): void;
  resume(): void;
  destroy(): void;
  getSnapshot(): Snapshot;
};
const html = document.documentElement;
const media = matchMedia("(prefers-color-scheme: dark)");
// One light/dark toggle. Until the visitor picks, the system theme is used.
const themeToggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
function applyTheme(preference: string) {
  html.dataset.preference = preference;
  html.dataset.theme =
    preference === "system" ? (media.matches ? "dark" : "light") : preference;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute(
      "content",
      html.dataset.theme === "dark" ? "#100a1b" : "#f6f7f8",
    );
  themeToggle?.setAttribute(
    "aria-label",
    html.dataset.theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
  );
}
applyTheme(html.dataset.preference || "system");
media.addEventListener("change", () =>
  applyTheme(html.dataset.preference || "system"),
);
themeToggle?.addEventListener("click", () => {
  const choice = html.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("dom-virus:theme", choice);
  } catch {}
  applyTheme(choice);
});
const status = document.querySelector<HTMLElement>("#site-status")!;
const bar = document.querySelector<HTMLElement>(".session-bar")!;
const stateLabel = document.querySelector<HTMLElement>("#session-state")!;
const nameLabel = document.querySelector<HTMLElement>("#session-name")!;
const pause = document.querySelector<HTMLButtonElement>("#session-pause")!;
let current: Controller | null = null;
let epoch = 0;
let focused: HTMLElement | null = null;
let statusTimer: ReturnType<typeof setTimeout>;
function announce(message: string) {
  clearTimeout(statusTimer);
  status.textContent = message;
  statusTimer = setTimeout(() => {
    status.textContent = "";
  }, 7000);
}
function recall(focus = true) {
  epoch++;
  const previous = current;
  current = null;
  previous?.destroy();
  bar.hidden = true;
  document
    .querySelectorAll("[data-launch]")
    .forEach((b) => b.removeAttribute("aria-busy"));
  if (focus) focused?.focus({ preventScroll: true });
}
function update(snapshot: Snapshot) {
  const state = snapshot.status || "running";
  stateLabel.textContent = state;
  pause.textContent = state === "paused" ? "Resume" : "Pause";
  pause.disabled = !["running", "paused", "intermission"].includes(state);
  // Lazy games may emit idle before start resolves; reveal the bar again
  // when that same session becomes active.
  bar.hidden = state === "destroyed" || state === "idle";
}
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-launch]",
))
  button.addEventListener("click", async () => {
    recall(false);
    focused = button;
    const request = epoch;
    const id = button.dataset.launch!;
    const select = document.querySelector<HTMLSelectElement>(
      `[data-release="${id}"]`,
    );
    const key = select?.value || id;
    const version = select?.selectedOptions[0]?.dataset.version;
    const load = registry[key as keyof typeof registry];
    if (!load) return;
    nameLabel.textContent =
      button.textContent?.replace(/^\s*Play /, "").trim() || id;
    if (version) nameLabel.textContent += ` ${version}`;
    stateLabel.textContent = "loading";
    pause.disabled = true;
    bar.hidden = false;
    button.setAttribute("aria-busy", "true");
    try {
      const factory = await load();
      if (request !== epoch) return;
      const onState = (snapshot: Snapshot) => {
        if (request === epoch) update(snapshot);
      };
      current =
        id === "swarm-protocol"
          ? factory({
              textSelector: "#board :is(h1,h2,h3,p,li)",
              targetSelector: "[data-arcade-target]",
              keyboard: false,
              triggerSelector: false,
              storageKey: "dom-virus:swarm",
              onState,
            })
          : factory({
              root: "#board",
              textSelector: "h1,h2,h3,p,li",
              targetSelector: "[data-arcade-target]",
              theme: html.dataset.theme,
              excludeSelector:
                "[data-virus-ignore], pre, code, input, textarea, select, [contenteditable]",
              onState,
            });
      const controller = current!;
      await controller.start();
      if (request !== epoch) return;
      // Protected launcher controls must release focus so Space drives the game
      // instead of activating Play again. Recall restores focus to this button.
      button.blur();
      update(controller.getSnapshot());
      button.removeAttribute("aria-busy");
      announce(
        `${nameLabel.textContent} is live. Press Escape or Recall to restore the page.`,
      );
    } catch (error) {
      if (request !== epoch) return;
      recall();
      console.error(error);
      announce("The game could not load. Please reload and try again.");
    }
  });
pause.addEventListener("click", () => {
  if (!current) return;
  if (current.getSnapshot().status === "paused") current.resume();
  else current.pause();
  update(current.getSnapshot());
  pause.blur();
});
document.querySelector("#session-recall")!.addEventListener("click", () => {
  recall();
  announce("Session ended. Game-owned page changes recalled.");
});
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape" && !bar.hidden) {
      recall();
      announce("Session ended. Game-owned page changes recalled.");
    }
  },
  true,
);
window.addEventListener("pagehide", () => recall(false));
for (const button of document.querySelectorAll<HTMLButtonElement>(
  "[data-copy]",
))
  button.addEventListener("click", async () => {
    const code =
      button.closest(".code-example")?.querySelector("code")?.textContent || "";
    try {
      await navigator.clipboard.writeText(code);
      const label = button.querySelector("[data-copy-label]");
      if (label) label.textContent = "Copied";
      button.classList.add("is-copied");
      setTimeout(() => {
        if (label) label.textContent = "Copy code";
        button.classList.remove("is-copied");
      }, 2000);
    } catch {
      announce("Clipboard unavailable. Select the code to copy it.");
    }
  });


// Touch devices: the page is a game board, so no pinch/double-tap zoom and no text selection
// or copy callouts (CSS handles touch-action and selection; Safari also needs its gesture events).
if (matchMedia("(pointer: coarse)").matches) {
  const block = (event: Event) => event.cancelable && event.preventDefault();
  document.addEventListener("gesturestart", block, { passive: false });
  document.addEventListener("gesturechange", block, { passive: false });
  document.addEventListener(
    "touchmove",
    (event) => (event as TouchEvent).touches.length > 1 && block(event),
    { passive: false },
  );
}
// Cartridge shelf: cartridges pop up as the shelf scrolls in. Picking one lifts it out,
// plugs it into the console, boots the screen, then navigates; the browser's View Transition
// morphs the console screen into the game page's display.
const shelf = document.querySelector<HTMLElement>("[data-shelf]");
const consoleEl = document.querySelector<HTMLElement>("[data-console]");
// Returning from a game skips the pop-in: the shelf is already set up around the docked cartridge.
if (shelf && "IntersectionObserver" in window && !returnState()) {
  shelf.dataset.pop = "wait";
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        shelf.dataset.pop = "in";
        io.disconnect();
      }
    },
    { threshold: 0.15 },
  );
  io.observe(shelf);
}
// Phones show the shelf as a horizontal swipe row (overflow scroller), which would clip a
// cartridge flying to the console. So a cartridge is lifted out into .flight-deck at exactly the
// spot it occupied (its bay keeps the space and shows the dashed outline), and put back after it
// ejects. On desktop the shelf is a plain grid and nothing moves in the DOM.
const deck = document.querySelector<HTMLElement>("[data-flight-deck]");
const scrollerShelf = () => !!shelf && getComputedStyle(shelf).overflowX !== "visible";
const lifted = (cart: HTMLElement) => cart.parentElement === deck;
const allCarts = () => [...document.querySelectorAll<HTMLElement>(".cartridge-shelf .cartridge")];
function liftOut(cart: HTMLElement) {
  if (!deck || !scrollerShelf() || lifted(cart)) return;
  const bay = cart.parentElement!,
    host = deck.offsetParent!.getBoundingClientRect();
  cart.style.setProperty("transform", "none", "important");
  const r = cart.getBoundingClientRect();
  cart.style.removeProperty("transform");
  bay.classList.add("out");
  bay.style.minHeight = `${r.height}px`;
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
  const bay = document.querySelector<HTMLElement>(`[data-bay="${cart.dataset.cart}"]`)!;
  for (const k of ["position", "margin", "left", "top", "width", "height"]) cart.style.removeProperty(k);
  bay.append(cart);
  bay.classList.remove("out");
  bay.style.removeProperty("min-height");
}
// Tiny synth for the console: a cartridge click on insert, a power-on chirp per LED.
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
    o = audio.createOscillator(),
    g = audio.createGain();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(audio.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}
const sfx = {
  click: () => (tone("square", 2400, 500, 0, 0.03, 0.05), tone("square", 1400, 260, 0.05, 0.045, 0.06)),
  power: (at = 0) => (tone("triangle", 220, 880, at, 0.16, 0.07), tone("sine", 1320, 1320, at + 0.17, 0.07, 0.04)),
};
shelf?.addEventListener("click", (event) => {
  const cart = (event.target as Element).closest<HTMLAnchorElement>("a.cartridge");
  const mouse = event as MouseEvent;
  if (!cart || !consoleEl || mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.button) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || shelf.dataset.plugging) return;
  event.preventDefault();
  unlockAudio();
  liftOut(cart);
  shelf.dataset.plugging = cart.dataset.cart!;
  cart.classList.add("plugging");
  const screen = consoleEl.querySelector<HTMLElement>("[data-console-screen]")!;
  // Bring the console on screen first (phones), then fly.
  const below = consoleEl.getBoundingClientRect().bottom > innerHeight;
  if (below) consoleEl.scrollIntoView({ block: "end", behavior: "smooth" });
  setTimeout(() => plug(cart, screen), below ? 380 : 0);
});
// Where a plugged cartridge sits. The console's top face isn't visible from this angle (we see
// its front plus the right/bottom sides, like the cartridges), so a cartridge simply slides down
// behind the top edge. Every cartridge goes in the same amount: just past its pins, so the bottom
// of the label meets the edge. Measured without any hover lift so the depth never varies.
function slotOffset(cart: HTMLElement) {
  cart.style.transformOrigin = "50% 100%";
  cart.style.setProperty("transition", "none");
  cart.style.setProperty("transform", "none", "important");
  const c = cart.getBoundingClientRect(),
    label = cart.querySelector<HTMLElement>(".label")!.getBoundingClientRect(),
    body = consoleEl!.querySelector<HTMLElement>(".body")!.getBoundingClientRect();
  cart.style.removeProperty("transform");
  cart.style.removeProperty("transition");
  const k = Math.min(1, (body.width * 0.56) / c.width);
  return {
    dx: body.left + body.width / 2 - (c.left + c.width / 2),
    dy: body.top + (c.bottom - label.bottom) * k - c.bottom,
    k,
    h: c.height,
  };
}
function plug(cart: HTMLAnchorElement, screen: HTMLElement) {
  if (!consoleEl) return;
  const { dx, dy, k, h } = slotOffset(cart);
  const full = cart.hasAttribute("data-full");
  const go = (href: string) => {
    screen.style.setProperty("view-transition-name", "game-screen");
    leaveTo(cart, false, href);
  };
  const flight = cart.animate(
    [
      { transform: "none" },
      { transform: `translateY(-28px) scale(1.06) rotate(-3deg)`, offset: 0.24 },
      { transform: `translate(${dx}px, ${dy - h * 0.55}px) scale(${k})`, offset: 0.68 },
      { transform: `translate(${dx}px, ${dy - h * 0.2}px) scale(${k})`, offset: 0.82 },
      { transform: `translate(${dx}px, ${dy}px) scale(${k})` },
    ],
    { duration: 820, easing: "cubic-bezier(.3,.7,.3,1)", fill: "forwards" },
  );
  // Seated: click, power LED (two for a full game), PRESS START; A, a tap or Enter starts (or wait).
  flight.onfinish = () => {
    sfx.click();
    sfx.power(0.12);
    if (full) sfx.power(0.5);
    consoleEl.style.setProperty("--boot", getComputedStyle(cart).getPropertyValue("--accent") || "#f4457a");
    consoleEl.querySelector("[data-console-name]")!.textContent = cart.querySelector("strong")?.textContent ?? "";
    pressText(cart);
    consoleEl.classList.toggle("full", full);
    consoleEl.classList.add("booting");
    // The cartridge declares what it can do; the console maps those actions onto its pads.
    // One action: PRESS START (or wait). Several: the screen lists them and waits for a choice.
    const actions = cartActions(cart);
    let started = false;
    const start = (action: CartAction) => {
      if (started) return;
      started = true;
      clearTimeout(auto);
      removeEventListener("keydown", onKey);
      pad?.removeEventListener("click", onPad);
      // Both launches leave the console exactly where it is (so coming back is the same exact
      // reverse): the screen flashes, then it morphs into the page or opens into the board.
      consoleEl.classList.add("starting");
      if (action.launch === "board") {
        openBoard(screen, () => leaveTo(cart, true, action.href));
        return;
      }
      setTimeout(() => go(action.href), 320);
    };
    const byPad = (p: string) =>
      actions.find((a) => a.pad === p) ?? (actions.length === 1 && (p === "a" || p === "start") ? actions[0] : undefined);
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const action = k === "enter" || k === " " ? actions[0] : byPad(k === "s" ? "start" : k);
      if (!action) return;
      e.preventDefault();
      start(action);
    };
    const onPad = (e: Event) => {
      const action = byPad((e.target as HTMLElement).closest<HTMLElement>("[data-pad]")?.dataset.pad ?? "");
      if (action) start(action);
    };
    const pad = consoleEl.querySelector("[data-console-pad]");
    const auto = actions.length > 1 ? 0 : setTimeout(() => start(actions[0]!), 1800);
    addEventListener("keydown", onKey);
    pad?.addEventListener("click", onPad);
    screen.addEventListener("click", () => start(actions[0]!), { once: true });
  };
}
type CartAction = { pad: "a" | "b" | "start"; label: string; href: string; launch?: "screen" | "board" };
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
  const press = consoleEl!.querySelector<HTMLElement>("[data-console-press]")!,
    actions = cartActions(cart);
  consoleEl!.classList.toggle("choice", actions.length > 1);
  if (actions.length < 2) press.textContent = "PRESS START";
  // Chips follow the pads' left-to-right order on the console: Start, B (blue), A (red).
  else press.innerHTML = [...actions].sort((x, y) => PAD_ORDER.indexOf(x.pad) - PAD_ORDER.indexOf(y.pad)).map((a) => `<b class="${PAD_CHIP[a.pad][0]}">${PAD_CHIP[a.pad][1]}</b> ${a.label}`).join(" ");
}
// Full game: the console screen grows to fill the viewport, then the board folds open.
function buildBoard(closing: boolean) {
  const board = document.createElement("div");
  board.className = closing ? "board-open closing" : "board-open";
  board.setAttribute("aria-hidden", "true");
  const blocks = [
    [12, 22, 9, 6], [70, 18, 6, 12], [30, 64, 12, 5], [78, 70, 8, 8], [48, 38, 5, 14],
  ].map(([x, y, w, hh]) => `<b style="--x:${x}%;--y:${y}%;--w:${w}%;--h:${hh}%"></b>`).join("");
  const tanks = [
    [18, 46, "#06c4ff"], [24, 74, "#06c4ff"], [74, 36, "#f4457a"], [84, 56, "#f4457a"],
  ].map(([x, y, c], i) => `<em style="--x:${x}%;--y:${y}%;--c:${c};--d:${i * 70}ms"></em>`).join("");
  board.innerHTML = `${blocks}${tanks}<span>DEPLOYING SQUAD</span><i class="l"></i><i class="r"></i>`;
  document.body.append(board);
  return board;
}
const screenClip = (screen: HTMLElement) => {
  const r = screen.getBoundingClientRect();
  return `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 10px)`;
};
function openBoard(screen: HTMLElement, done: () => void) {
  const board = buildBoard(false);
  board.animate([{ clipPath: screenClip(screen) }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }], {
    duration: 600,
    easing: "cubic-bezier(.7,0,.2,1)",
    fill: "forwards",
  });
  tone("sawtooth", 90, 360, 0.05, 0.55, 0.035);
  setTimeout(() => tone("square", 660, 990, 0, 0.09, 0.04), 640);
  setTimeout(done, 1300);
}
// The reverse: the covers fold shut over the board, then it shrinks back into the console screen.
function closeBoard(board: HTMLElement, screen: HTMLElement, done: () => void) {
  board.classList.add("closing");
  setTimeout(() => {
    board.animate([{ clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: screenClip(screen) }], {
      duration: 560,
      easing: "cubic-bezier(.7,0,.2,1)",
      fill: "forwards",
    }).onfinish = () => {
      board.remove();
      done();
    };
  }, 760);
}

// Coming back from a game. Leaving rewrites the home URL to ?play=<id>#console (or ?board=<id>
// for the full game); game pages link back the same way. An inline head script reads it before
// first paint (html[data-return], cartridge hidden until seated, screen named for the View
// Transition), so the page arrives in the state it left: the game screen morphs back into the
// console (or the board folds shut into it), then the cartridge pulls out and flies home.
function returnState() {
  const q = new URLSearchParams(location.search),
    id = q.get("play") || q.get("board");
  return id && /^[\w-]+$/.test(id) ? { id, board: q.has("board") } : null;
}
function leaveTo(cart: HTMLAnchorElement, board: boolean, href = cart.href) {
  history.replaceState(history.state, "", `${location.pathname}?${board ? "board" : "play"}=${cart.dataset.cart}#console`);
  location.href = href;
}
function markReturn(state: { id: string; board: boolean }) {
  const d = document.documentElement;
  d.dataset.return = state.id;
  d.dataset.returnMode = state.board ? "board" : "screen";
}
function clearReturn() {
  const d = document.documentElement;
  delete d.dataset.return;
  delete d.dataset.returnMode;
  document.getElementById("dv-return")?.remove();
  consoleEl?.querySelector<HTMLElement>("[data-console-screen]")?.style.removeProperty("view-transition-name");
}
function settle() {
  clearReturn();
  history.replaceState(history.state, "", `${location.pathname}#games`);
}
// Run after the incoming View Transition (if any) has finished.
function afterReveal(fresh: boolean, cb: () => void) {
  let done = false;
  const run = () => {
    if (!done) (done = true), cb();
  };
  const use = (vt?: { finished: Promise<unknown> } | null) =>
    vt ? vt.finished.then(run, run) : requestAnimationFrame(() => requestAnimationFrame(run));
  const seen = (window as { __dvReveal?: { vt: { finished: Promise<unknown> } | null } }).__dvReveal;
  if (seen && !fresh) use(seen.vt);
  else addEventListener("pagereveal", (e) => use((e as Event & { viewTransition?: { finished: Promise<unknown> } }).viewTransition), { once: true });
  setTimeout(run, fresh ? 700 : 1500);
}
function dock(cart: HTMLElement) {
  const full = cart.hasAttribute("data-full");
  cart.getAnimations().forEach((a) => a.cancel());
  // Swipe row (phones): bring the cartridge's spot to the middle first, so it flies home to a
  // place you can see, then lift it out of the row like a fresh plug-in.
  if (scrollerShelf() && !lifted(cart)) {
    const bay = cart.parentElement!.getBoundingClientRect(),
      row = shelf!.getBoundingClientRect();
    shelf!.scrollTo({ left: shelf!.scrollLeft + bay.left - row.left - (row.width - bay.width) / 2, behavior: "instant" });
    liftOut(cart);
  }
  shelf!.dataset.plugging = cart.dataset.cart!;
  cart.classList.add("plugging");
  const seat = slotOffset(cart);
  const at = `translate(${seat.dx}px, ${seat.dy}px) scale(${seat.k})`;
  cart.animate([{ transform: at }, { transform: at }], { duration: 1, fill: "forwards" });
  document.getElementById("dv-return")?.remove();
  consoleEl!.style.setProperty("--boot", getComputedStyle(cart).getPropertyValue("--accent") || "#f4457a");
  consoleEl!.querySelector("[data-console-name]")!.textContent = cart.querySelector("strong")?.textContent ?? "";
  pressText(cart);
  consoleEl!.classList.remove("starting");
  consoleEl!.classList.toggle("full", full);
  consoleEl!.classList.add("booting");
  return seat;
}
function returnHome(state: { id: string; board: boolean }, fresh: boolean) {
  const cart = allCarts().find((n) => n.dataset.cart === state.id);
  document.querySelectorAll(".board-open").forEach((n) => n.remove());
  if (!cart || !consoleEl || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (cart) cart.getAnimations().forEach((a) => a.cancel()), putBack(cart);
    consoleEl?.classList.remove("booting", "starting", "full", "choice");
    shelf?.querySelectorAll(".plugging").forEach((n) => n.classList.remove("plugging"));
    if (shelf) delete shelf.dataset.plugging;
    return settle();
  }
  markReturn(state);
  const screen = consoleEl.querySelector<HTMLElement>("[data-console-screen]")!;
  const seat = dock(cart);
  // The full game comes back through its board; the board is up before the first frame.
  const board = state.board ? buildBoard(false) : null;
  board?.classList.add("shut");
  if (board) clearReturn();
  afterReveal(fresh, () => {
    if (board) return closeBoard(board, screen, () => eject(cart, seat));
    clearReturn();
    setTimeout(() => eject(cart, seat), 160);
  });
}
// The cartridge pops out of the console and flies home.
function eject(cart: HTMLElement, seat: { dx: number; dy: number; k: number; h: number }) {
  const { dx, dy, k, h } = seat;
  cart.getAnimations().forEach((a) => a.cancel());
  const out = cart.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${k})` },
      { transform: `translate(${dx}px, ${dy - h * 0.75}px) scale(${k}) rotate(4deg)`, offset: 0.3 },
      { transform: `translate(${dx * 0.4}px, ${(dy - h) * 0.5}px) rotate(-3deg) scale(1.04)`, offset: 0.65 },
      { transform: "none" },
    ],
    { duration: 900, easing: "cubic-bezier(.3,.7,.3,1)", fill: "both" },
  );
  setTimeout(() => consoleEl!.classList.remove("booting", "full", "choice"), 300);
  out.onfinish = () => {
    out.cancel();
    cart.classList.remove("plugging");
    cart.style.removeProperty("transform-origin");
    putBack(cart);
    if (shelf) delete shelf.dataset.plugging;
    settle();
  };
}
const initialReturn = shelf ? returnState() : null;
if (initialReturn) returnHome(initialReturn, false);
// Back/forward from the bfcache: the page is restored mid-launch; rewind it from there.
addEventListener("pageshow", (event) => {
  if (!shelf || !event.persisted) return;
  const state = returnState();
  if (state) return returnHome(state, true);
  delete shelf.dataset.plugging;
  allCarts().forEach((n) => {
    n.classList.remove("plugging");
    n.getAnimations().forEach((a) => a.cancel());
    putBack(n);
  });
  document.querySelectorAll(".board-open").forEach((n) => n.remove());
  consoleEl?.classList.remove("booting", "starting", "full", "choice");
  clearReturn();
});
// Console buttons: all clickable. A starts a plugged cartridge (handled above); idle A/B make
// the attract characters hop; the D-pad tilts (CSS).
consoleEl?.querySelector("[data-console-pad]")?.addEventListener("click", (event) => {
  const pad = (event.target as HTMLElement).closest<HTMLElement>("[data-pad]")?.dataset.pad;
  if (!pad || consoleEl.classList.contains("booting")) return;
  if (pad === "a" || pad === "b" || pad === "start") {
    const attract = consoleEl.querySelector(".attract")!;
    attract.classList.remove("hop");
    void (attract as HTMLElement).offsetWidth;
    attract.classList.add("hop");
    setTimeout(() => attract.classList.remove("hop"), 160);
  }
});
// Hero mini-game: the CSS loop runs for everyone; the first tap or drag on the card loads a
// tiny contained game (only then). Reduced-motion visitors keep the still poster.
const hero = document.querySelector<HTMLElement>(".hero-crossover");
hero?.querySelector(".promo-stage")?.addEventListener(
  "pointerdown",
  (event) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || hero.dataset.play) return;
    hero.dataset.play = "loading";
    void import("./hero-game").then(({ startHeroGame }) => {
      delete hero.dataset.play;
      startHeroGame(hero, event as PointerEvent);
    });
  },
);
// CSS owns the motion. Observe visibility once per illustration to avoid offscreen work.
const diagrams = document.querySelectorAll<HTMLElement>(
  ".system-map,.tick-map,.ownership-map,.hero-crossover,.console,.battlefield-display",
);
const visibleDiagrams = new Set<Element>();
function syncDiagramMotion() {
  diagrams.forEach(
    (diagram) =>
      (diagram.dataset.motion = String(
        !document.hidden &&
          diagram.dataset.paused !== "true" &&
          visibleDiagrams.has(diagram),
      )),
  );
}
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) =>
        entry.isIntersecting
          ? visibleDiagrams.add(entry.target)
          : visibleDiagrams.delete(entry.target),
      );
      syncDiagramMotion();
    },
    { threshold: 0.1 },
  );
  diagrams.forEach((diagram) => observer.observe(diagram));
  document.addEventListener("visibilitychange", syncDiagramMotion);
  window.addEventListener("pagehide", () => {
    observer.disconnect();
    visibleDiagrams.clear();
    syncDiagramMotion();
  });
  window.addEventListener("pageshow", () =>
    diagrams.forEach((diagram) => observer.observe(diagram)),
  );
  diagrams.forEach((diagram) =>
    diagram
      .querySelector<HTMLButtonElement>("[data-motion-toggle]")
      ?.addEventListener("click", (event) => {
        const button = event.currentTarget as HTMLButtonElement;
        const paused = diagram.dataset.paused !== "true";
        diagram.dataset.paused = String(paused);
        button.setAttribute("aria-pressed", String(paused));
        button.setAttribute(
          "aria-label",
          `${paused ? "Resume" : "Pause"} ${button.dataset.motionLabel || "diagram"} animation`,
        );
        button.title = paused ? "Resume animation" : "Pause animation";
        syncDiagramMotion();
      }),
  );
}
