import { registry } from "@game-registry";
import { slot } from "../vendor/fizlet/slot";
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
  // iOS ignores user-scalable=no and still zooms on a quick double tap (e.g. tapping bad guys in
  // the hero game). A quick second tap on anything that isn't a control can't zoom; games read
  // pointer events, so play is unaffected, and links/buttons keep every tap.
  let lastTap = 0;
  document.addEventListener(
    "touchend",
    (event) => {
      const quick = event.timeStamp - lastTap < 400;
      lastTap = event.timeStamp;
      if (quick && !(event.target as Element).closest?.("a,button,input,textarea,select,label,summary,[role=button],[contenteditable]")) block(event);
    },
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
// One cartridge at a time. While one is flying, loading, launching or coming home, the others
// say "not now" (a quick wiggle and a buzz) instead of following their links. While the console
// waits for you (PRESS START, or Battlefield's RED/BLUE choice), tapping the seated cartridge
// (or Esc) pulls it back out: the eject button is the cartridge itself.
let waiting: { cart: HTMLElement; pull: () => void } | null = null;
function refuse(cart: HTMLElement) {
  tone("square", 140, 110, 0, 0.09, 0.03);
  // The individual `translate` property stacks on top of the cartridge's own transform (its seat
  // or flight) without composite: "add", which has left a stuck transform behind in some Chromium builds.
  cart.animate([{ translate: "0 0" }, { translate: "-5px 0" }, { translate: "5px 0" }, { translate: "-3px 0" }, { translate: "0 0" }], { duration: 260, easing: "steps(5)" });
  // Hint: the seated cartridge hops, so you know which one is in the way.
  if (waiting && waiting.cart !== cart)
    waiting.cart.animate([{ translate: "0 0" }, { translate: "0 -7px" }, { translate: "0 0" }], { duration: 300, easing: "cubic-bezier(.3,.7,.3,1)" });
}
const onCartClick = (event: Event) => {
  const cart = (event.target as Element).closest<HTMLAnchorElement>("a.cartridge");
  const mouse = event as MouseEvent;
  if (!cart || !consoleEl || !shelf || mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.button) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  event.preventDefault();
  if (shelf.dataset.plugging) {
    // detail is 0 for keyboard clicks: Enter is START on the console, never eject.
    if (waiting?.cart === cart && mouse.detail) return waiting.pull();
    return refuse(cart);
  }
  unlockAudio();
  liftOut(cart);
  // Swipe row (phones): a cartridge tapped half off-screen pulls its spot to the middle while it
  // flies in, so the empty spot ends up right behind the console (as it is on the way back).
  if (lifted(cart)) {
    const bay = cart.dataset.cart && document.querySelector<HTMLElement>(`[data-bay="${cart.dataset.cart}"]`)!.getBoundingClientRect(),
      row = shelf.getBoundingClientRect();
    if (bay) shelf.scrollTo({ left: shelf.scrollLeft + bay.left - row.left - (row.width - bay.width) / 2, behavior: "smooth" });
  }
  shelf.dataset.plugging = cart.dataset.cart!;
  cart.classList.add("plugging");
  const screen = consoleEl.querySelector<HTMLElement>("[data-console-screen]")!;
  // Bring the console on screen first (phones), then fly.
  const below = consoleEl.getBoundingClientRect().bottom > innerHeight;
  if (below) consoleEl.scrollIntoView({ block: "end", behavior: "smooth" });
  // Swipe row (phones): the cartridge rides along with the page, so it can fly while the page
  // scrolls; no pause before the pick-up.
  const row = scrollerShelf();
  setTimeout(() => plug(cart, screen), below && !row ? 380 : 0);
};
shelf?.addEventListener("click", onCartClick);
deck?.addEventListener("click", onCartClick);
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
function plug(cart: HTMLAnchorElement, screen: HTMLElement, autoPad?: string) {
  if (!consoleEl) return;
  const { dx, dy, k, h } = slotOffset(cart);
  const full = cart.hasAttribute("data-full");
  const go = (href: string) => {
    screen.style.setProperty("view-transition-name", "game-screen");
    leaveTo(cart, false, href);
  };
  // Phones (swipe row): the console sits right under the row, so a hop would look awkward: pick
  // the cartridge up a touch, glide over the slot, slide straight down in. Desktop keeps its arc.
  const flight = scrollerShelf()
    ? cart.animate(
        [
          { transform: "none", easing: "cubic-bezier(.2,.7,.3,1)" },
          { transform: "translateY(-14px) scale(1.03)", offset: 0.24, easing: "cubic-bezier(.4,0,.2,1)" },
          { transform: `translate(${dx}px, -14px) scale(${k})`, offset: 0.5, easing: "cubic-bezier(.45,0,.25,1)" },
          { transform: `translate(${dx}px, ${dy}px) scale(${k})` },
        ],
        { duration: 760, fill: "forwards" },
      )
    : cart.animate(
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
    const stop = () => {
      started = true;
      waiting = null;
      clearTimeout(auto);
      clearTimeout(pressTimer);
      removeEventListener("keydown", onKey);
      pad?.removeEventListener("click", onPad);
      screen.removeEventListener("click", onScreen);
    };
    const start = (action: CartAction) => {
      if (started) return;
      stop();
      // Both launches leave the console exactly where it is (so coming back is the same exact
      // reverse): the screen flashes, then it morphs into the page or opens into the board.
      consoleEl.classList.add("starting");
      const wait = loadingScreen(action.launch === "board" || !/info/i.test(action.label) ? "GAME" : "INFO");
      if (action.launch === "board") {
        setTimeout(() => openBoard(screen, () => leaveTo(cart, true, action.href)), wait);
        return;
      }
      setTimeout(() => go(action.href), wait);
    };
    const byPad = (p: string) =>
      actions.find((a) => a.pad === p) ?? (actions.length === 1 && (p === "a" || p === "start") ? actions[0] : undefined);
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") return e.preventDefault(), pull();
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
    // Cartridge swap (e.g. "Swap to Battlefield"): the console presses the button for you.
    let pressTimer = 0;
    if (autoPad) {
      const btn = consoleEl.querySelector<HTMLElement>(`[data-pad="${autoPad}"]`);
      pressTimer = window.setTimeout(() => {
        btn?.classList.add("press");
        setTimeout(() => {
          btn?.classList.remove("press");
          const action = byPad(autoPad);
          if (action) start(action);
        }, 170);
      }, 1100);
    }
    const onScreen = () => start(actions[0]!);
    // Changed your mind? Pull the cartridge back out: the exact reverse of the insert.
    const pull = () => {
      if (started) return;
      stop();
      sfx.click();
      eject(cart, { dx, dy, k, h });
    };
    waiting = { cart, pull };
    addEventListener("keydown", onKey);
    pad?.addEventListener("click", onPad);
    screen.addEventListener("click", onScreen);
  };
}
// After start the screen says LOADING GAME / LOADING INFO. Now and then the cartridge is
// "stubborn" and the screen flips to an old-console fix before it loads (a little longer).
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
  const el = consoleEl!.querySelector<HTMLElement>("[data-console-loading]")!;
  el.textContent = `LOADING ${what}`;
  consoleEl!.classList.add("is-loading");
  if (Math.random() > 0.3) return 700;
  setTimeout(() => {
    el.textContent = LOAD_JOKES[Math.floor(Math.random() * LOAD_JOKES.length)]!;
    tone("square", 180, 120, 0, 0.12, 0.03);
  }, 650);
  return 1750;
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
// The doors stay shut: the game page paints the same shut doors and opens them once it has
// loaded, so the reveal is the game's own start (no stand-in board in between).
function openBoard(screen: HTMLElement, done: () => void) {
  const board = buildBoard(false);
  board.classList.add("hold");
  board.animate([{ clipPath: screenClip(screen) }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }], {
    duration: 600,
    easing: "cubic-bezier(.7,0,.2,1)",
    fill: "forwards",
  });
  tone("sawtooth", 90, 360, 0.05, 0.55, 0.035);
  // Once the doors cover the page, drop its scrollbar: the game page has none, so the doors'
  // seam lands on the same pixel when the game takes over.
  setTimeout(() => document.documentElement.classList.add("board-full"), 620);
  setTimeout(done, 700);
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
  // The full game opens the shut doors itself once it has loaded (see openBoard).
  if (board) try { sessionStorage.setItem("dom-virus:doors", "shut"); } catch {}
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
  document.querySelector("[data-games-link]")?.setAttribute("aria-current", "page");
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
function centreBay(cart: HTMLElement) {
  if (!scrollerShelf() || lifted(cart)) return;
  const bay = cart.parentElement!.getBoundingClientRect(),
    row = shelf!.getBoundingClientRect();
  shelf!.scrollTo({ left: shelf!.scrollLeft + bay.left - row.left - (row.width - bay.width) / 2, behavior: "instant" });
}
function dock(cart: HTMLElement) {
  const full = cart.hasAttribute("data-full");
  cart.getAnimations().forEach((a) => a.cancel());
  // Swipe row (phones): bring the cartridge's spot to the middle first, so it flies home to a
  // place you can see, then lift it out of the row like a fresh plug-in.
  if (scrollerShelf() && !lifted(cart)) {
    centreBay(cart);
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
  consoleEl!.classList.remove("starting", "is-loading");
  consoleEl!.classList.toggle("full", full);
  consoleEl!.classList.add("booting");
  return seat;
}
// A swap (?next=<id>) chains a second cartridge after the eject: it flies in, boots and the
// console presses its main button (A) for you, e.g. Sherman Bytes out, DOM Battlefield in.
let chained: string | null = null;
function swapIn(id: string, pad = "a") {
  const cart = allCarts().find((n) => n.dataset.cart === id) as HTMLAnchorElement | undefined;
  if (!cart || !consoleEl || !shelf) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches)
    return void (location.href = cartActions(cart).find((a) => a.pad === pad)?.href ?? cart.href);
  centreBay(cart);
  liftOut(cart);
  shelf.dataset.plugging = id;
  cart.classList.add("plugging");
  plug(cart, consoleEl.querySelector<HTMLElement>("[data-console-screen]")!, pad);
}
function returnHome(state: { id: string; board: boolean }, fresh: boolean) {
  const cart = allCarts().find((n) => n.dataset.cart === state.id);
  const next = new URLSearchParams(location.search).get("next");
  chained = next && /^[\w-]+$/.test(next) ? next : null;
  document.querySelectorAll(".board-open").forEach((n) => n.remove());
  document.documentElement.classList.remove("board-full");
  if (!cart || !consoleEl || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    if (cart) cart.getAnimations().forEach((a) => a.cancel()), putBack(cart);
    consoleEl?.classList.remove("booting", "starting", "is-loading", "full", "choice");
    shelf?.querySelectorAll(".plugging").forEach((n) => n.classList.remove("plugging"));
    if (shelf) delete shelf.dataset.plugging;
    settle();
    if (chained) swapIn(chained);
    return;
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
  // Phones: the exact reverse of the phone insert (straight up out of the slot, glide, set down).
  const out = lifted(cart)
    ? cart.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${k})`, easing: "cubic-bezier(.3,0,.2,1)" },
          { transform: `translate(${dx}px, -14px) scale(${k})`, offset: 0.5, easing: "cubic-bezier(.45,0,.25,1)" },
          { transform: "translateY(-14px) scale(1.03)", offset: 0.76, easing: "cubic-bezier(.3,.6,.3,1)" },
          { transform: "none" },
        ],
        { duration: 800, fill: "both" },
      )
    : cart.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${k})` },
          { transform: `translate(${dx}px, ${dy - h * 0.75}px) scale(${k}) rotate(4deg)`, offset: 0.3 },
          { transform: `translate(${dx * 0.4}px, ${(dy - h) * 0.5}px) rotate(-3deg) scale(1.04)`, offset: 0.65 },
          { transform: "none" },
        ],
        { duration: 900, easing: "cubic-bezier(.3,.7,.3,1)", fill: "both" },
      );
  setTimeout(() => consoleEl!.classList.remove("booting", "is-loading", "full", "choice"), 300);
  out.onfinish = () => {
    // Home means home: drop every hold, hop or leftover transform so it sits exactly in its bay.
    cart.getAnimations().forEach((a) => a.cancel());
    cart.classList.remove("plugging");
    cart.style.removeProperty("transform-origin");
    cart.style.removeProperty("transform");
    putBack(cart);
    // Some Chromium builds keep a cancelled animation's transform applied (above inline styles and
    // invisible to getAnimations), leaving the cartridge stuck at its seat over a neighbour. If it
    // isn't at rest, swap in a fresh copy of the element: listeners live on the shelf, so nothing
    // is lost, and keyboard focus moves with it.
    if (!cart.matches(":hover") && getComputedStyle(cart).transform !== "none") {
      const fresh = cart.cloneNode(true) as HTMLElement,
        focused = document.activeElement === cart;
      cart.replaceWith(fresh);
      if (focused) fresh.focus({ preventScroll: true });
    }
    if (shelf) delete shelf.dataset.plugging;
    settle();
    const next = chained;
    chained = null;
    if (next) setTimeout(() => swapIn(next), 260);
  };
}
const initialReturn = shelf ? returnState() : null;
if (initialReturn) returnHome(initialReturn, false);
// From elsewhere on the site (a cartridge on Under the hood): ?load=<id> brings you to the console,
// plugs that cartridge in and presses the button that opens its page (INFO / B for the full game).
{
  const load = new URLSearchParams(location.search).get("load");
  if (shelf && consoleEl && !initialReturn && load && /^[\w-]+$/.test(load)) {
    history.replaceState(history.state, "", `${location.pathname}#console`);
    shelf.dataset.pop = "in";
    consoleEl.scrollIntoView({ block: "center", behavior: "instant" });
    const cart = allCarts().find((n) => n.dataset.cart === load);
    const info = cart && cartActions(cart as HTMLAnchorElement).find((a) => /info/i.test(a.label));
    setTimeout(() => swapIn(load, info?.pad ?? "a"), 450);
  }
}
// Back/forward from the bfcache: the page is restored mid-launch; rewind it from there.
addEventListener("pageshow", (event) => {
  if (!shelf || !event.persisted) return;
  // A launch's shut doors are still up in the restored page.
  document.querySelectorAll(".board-open").forEach((n) => n.remove());
  document.documentElement.classList.remove("board-full");
  const state = returnState();
  if (state) return returnHome(state, true);
  delete shelf.dataset.plugging;
  allCarts().forEach((n) => {
    n.classList.remove("plugging");
    n.getAnimations().forEach((a) => a.cancel());
    putBack(n);
  });
  document.querySelectorAll(".board-open").forEach((n) => n.remove());
  document.documentElement.classList.remove("board-full");
  consoleEl?.classList.remove("booting", "starting", "is-loading", "full", "choice");
  clearReturn();
});
// Console buttons: all clickable. With a cartridge in, they follow its actions (above). With
// nothing plugged in the idle screen is a tiny game: A (red) fires from the bottom at the
// crosshair in the middle (bad guys score, good guys are "OOPS"), B (blue) or a tap on the screen
// makes the middle character jump, Start makes them all hop. The D-pad tilts (CSS).
const attractRow = consoleEl?.querySelector<HTMLElement>("[data-attract]");
const hitsEl = consoleEl?.querySelector<HTMLElement>("[data-console-hits]");
let hits = 0,
  aimTimer = 0;
function middleOne(reach: number) {
  const row = attractRow!.getBoundingClientRect(),
    cx = row.left + row.width / 2;
  let best: HTMLElement | null = null;
  for (const i of attractRow!.querySelectorAll<HTMLElement>("i:not(.zapped)")) {
    const r = i.getBoundingClientRect(),
      d = Math.abs(r.left + r.width / 2 - cx);
    if (d < reach) (reach = d), (best = i);
  }
  return best;
}
function idleShoot() {
  const row = attractRow!,
    screen = consoleEl!.querySelector<HTMLElement>(".screen")!.getBoundingClientRect(),
    from = screen.bottom - row.getBoundingClientRect().top;
  row.classList.add("aiming");
  clearTimeout(aimTimer);
  aimTimer = window.setTimeout(() => row.classList.remove("aiming"), 900);
  const bolt = document.createElement("b");
  bolt.className = "bolt";
  row.append(bolt);
  tone("square", 1400, 320, 0, 0.07, 0.03);
  bolt.animate([{ transform: `translateY(${from}px)` }, { transform: "translateY(6px)" }], { duration: 170, easing: "linear" }).onfinish = () => {
    const target = middleOne(16);
    if (!target) {
      bolt.animate([{ transform: "translateY(6px)", opacity: 1 }, { transform: "translateY(-60px)", opacity: 0 }], 160).onfinish = () => bolt.remove();
      return;
    }
    bolt.remove();
    target.classList.add("zapped");
    setTimeout(() => target.classList.remove("zapped"), 900);
    const burst = document.createElement("b");
    burst.className = "burst";
    row.append(burst);
    burst.animate([{ transform: "scale(.3)", opacity: 1 }, { transform: "scale(1.4)", opacity: 0 }], { duration: 320, easing: "ease-out" }).onfinish = () => burst.remove();
    tone("sawtooth", 260, 60, 0, 0.16, 0.04);
    const friendly = target.dataset.side === "good";
    if (!friendly) hits++;
    hitsEl!.textContent = friendly ? "OOPS! FRIENDLY" : `HITS ${String(hits).padStart(2, "0")}`;
    hitsEl!.classList.add("on");
    consoleEl!.querySelector(".screen")!.classList.toggle("oops", friendly);
  };
}
function idleJump() {
  const one = middleOne(40);
  if (!one || one.classList.contains("jump")) return;
  one.classList.add("jump");
  tone("sine", 330, 660, 0, 0.12, 0.03);
  setTimeout(() => one.classList.remove("jump"), 240);
}
consoleEl?.querySelector("[data-console-pad]")?.addEventListener("click", (event) => {
  const pad = (event.target as HTMLElement).closest<HTMLElement>("[data-pad]")?.dataset.pad;
  if (!pad || consoleEl.classList.contains("booting")) return;
  unlockAudio();
  if (pad === "a") idleShoot();
  else if (pad === "b") idleJump();
  else if (pad === "start") {
    const attract = consoleEl.querySelector(".attract")!;
    attract.classList.remove("hop");
    void (attract as HTMLElement).offsetWidth;
    attract.classList.add("hop");
    setTimeout(() => attract.classList.remove("hop"), 160);
  }
});
consoleEl?.querySelector("[data-console-screen]")?.addEventListener("click", () => {
  if (consoleEl.classList.contains("booting")) return;
  unlockAudio();
  idleJump();
});
// Header Games key on the home page: it toggles. At the shelf (#games) it's pressed in; clicking
// it again goes back to the top (and drops the hash); clicking once more jumps back to the games.
const gamesLink = document.querySelector<HTMLAnchorElement>("[data-games-link]");
if (gamesLink && shelf) {
  const sync = () => (location.hash === "#games" ? gamesLink.setAttribute("aria-current", "page") : gamesLink.removeAttribute("aria-current"));
  sync();
  addEventListener("hashchange", sync);
  addEventListener("popstate", sync);
  gamesLink.addEventListener("click", (event) => {
    if (location.hash !== "#games") return requestAnimationFrame(sync);
    event.preventDefault();
    history.pushState(history.state, "", location.pathname);
    scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    sync();
  });
}
// Under the hood: the labs load their tiny engine only on that page.
const labPage = document.querySelector<HTMLElement>("[data-lab-page]");
if (labPage) void import("./lab").then(({ startLabs }) => startLabs(labPage));
// Hero: the crossover scene and its mini-game run on Fizlet (hero-scene.ts). fizlet/slot loads it
// once the card is near the viewport; reduced-motion visitors keep the still poster (never loaded).
const hero = document.querySelector<HTMLElement>(".hero-crossover");
const heroStage = hero?.querySelector<HTMLElement>(".promo-stage");
if (heroStage) slot(heroStage, () => import("./hero-scene").then((m) => m.mountHero), { idle: 0 });
// "Try me" bubble: if someone looks at the hero for a few seconds without touching it, a small
// hint pops up by the card, then leaves on its own (or on the first touch). Once per visit.
const tryMe = hero?.querySelector<HTMLElement>("[data-try-me]");
if (hero && tryMe && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let shown = false,
    timer = 0;
  const touched = () => {
    shown = true;
    clearTimeout(timer);
    tryMe.classList.remove("show");
  };
  hero.addEventListener("pointerdown", touched, { once: true });
  const watch = new IntersectionObserver(
    ([entry]) => {
      clearTimeout(timer);
      if (shown || !entry!.isIntersecting) return;
      timer = window.setTimeout(() => {
        if (shown || hero.dataset.play) return;
        shown = true;
        tryMe.hidden = false;
        requestAnimationFrame(() => tryMe.classList.add("show"));
        setTimeout(() => tryMe.classList.remove("show"), 5200);
      }, 4200);
    },
    { threshold: 0.6 },
  );
  watch.observe(hero);
}
// CSS owns the diagrams' motion (the hero scene follows data-motion too). Observe visibility once
// per illustration to avoid offscreen work.
const diagrams = document.querySelectorAll<HTMLElement>(
  ".system-map,.tick-map,.ownership-map,.hero-crossover,.console,.battlefield-display,.kaiju-display",
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
