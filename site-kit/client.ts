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
const themeButtons = document.querySelectorAll<HTMLButtonElement>(
  "[data-theme-choice]",
);
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
  themeButtons.forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.themeChoice === preference),
    ),
  );
}
applyTheme(html.dataset.preference || "system");
media.addEventListener("change", () =>
  applyTheme(html.dataset.preference || "system"),
);
themeButtons.forEach((button) =>
  button.addEventListener("click", () => {
    const choice = button.dataset.themeChoice!;
    try {
      localStorage.setItem("dom-virus:theme", choice);
    } catch {}
    applyTheme(choice);
  }),
);
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

// Expand navigation without squeezing the brand or hiding links on small screens.
const header = document.querySelector<HTMLElement>(".site-header")!;
const menu = document.querySelector<HTMLButtonElement>(".menu-toggle")!;
const mobile = matchMedia("(max-width: 760px)");
function closeMenu(restoreFocus = false) {
  header.dataset.menuOpen = "false";
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open menu");
  if (restoreFocus) menu.focus();
}
header.dataset.navReady = "true";
closeMenu();
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  header.dataset.menuOpen = String(open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
header
  .querySelectorAll("nav a")
  .forEach((link) => link.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && header.dataset.menuOpen === "true")
    closeMenu(true);
});
document.addEventListener("pointerdown", (event) => {
  if (mobile.matches && !header.contains(event.target as Node)) closeMenu();
});
mobile.addEventListener("change", () => closeMenu());

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
if (shelf && "IntersectionObserver" in window) {
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
  shelf.dataset.plugging = cart.dataset.cart!;
  cart.classList.add("plugging");
  const screen = consoleEl.querySelector<HTMLElement>("[data-console-screen]")!;
  // Bring the console on screen first (phones), then fly.
  const below = consoleEl.getBoundingClientRect().bottom > innerHeight;
  if (below) consoleEl.scrollIntoView({ block: "end", behavior: "smooth" });
  setTimeout(() => plug(cart, screen), below ? 380 : 0);
});
// Where a plugged cartridge sits: bottom-centre anchored, pins down in the groove behind the lip,
// scaled so it fits the hole.
function slotOffset(cart: HTMLElement) {
  cart.style.transformOrigin = "50% 100%";
  const c = cart.getBoundingClientRect(),
    hole = consoleEl!.querySelector<HTMLElement>(".hole")!.getBoundingClientRect();
  return {
    dx: hole.left + hole.width / 2 - (c.left + c.width / 2),
    dy: hole.top + hole.height / 2 + 22 - c.bottom,
    k: Math.min(1, (hole.width * 0.92) / c.width),
    h: c.height,
  };
}
function plug(cart: HTMLAnchorElement, screen: HTMLElement) {
  if (!consoleEl) return;
  const { dx, dy, k, h } = slotOffset(cart);
  const full = cart.hasAttribute("data-full");
  const remember = () => {
    // Remember the cartridge so coming back ejects it from the console.
    try {
      sessionStorage.setItem(PLUGGED, cart.dataset.cart!);
    } catch {}
  };
  const go = () => {
    screen.style.setProperty("view-transition-name", "game-screen");
    remember();
    location.href = cart.href;
  };
  // A special edition first slides up out of its sleeve, then rises above it.
  const lift = full ? -h * 0.62 : -28;
  if (full) setTimeout(() => (cart.style.zIndex = "32"), 230);
  const flight = cart.animate(
    [
      { transform: "none" },
      { transform: `translateY(${lift}px) scale(1.06) rotate(-3deg)`, offset: 0.24 },
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
    consoleEl.querySelector("[data-console-press]")!.textContent = full ? "FULL GAME · PRESS START" : "PRESS START";
    consoleEl.classList.toggle("full", full);
    consoleEl.classList.add("booting");
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      clearTimeout(auto);
      removeEventListener("keydown", onKey);
      consoleEl.classList.add("starting");
      if (full) {
        remember();
        openBoard(screen, () => (location.href = cart.href));
        return;
      }
      // The plugged cartridge rides down into the drawer with the console.
      cart.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(34px)", opacity: 0.2 }], {
        duration: 500,
        delay: 120,
        easing: "cubic-bezier(.6,0,.8,.4)",
        fill: "forwards",
        composite: "add",
      });
      setTimeout(go, 320);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        start();
      }
    };
    const auto = setTimeout(start, full ? 2200 : 1800);
    addEventListener("keydown", onKey);
    consoleEl.querySelector("[data-console-start]")?.addEventListener("click", start, { once: true });
    screen.addEventListener("click", start, { once: true });
  };
}
// Full game: the console screen grows to fill the viewport, then the board folds open.
function openBoard(screen: HTMLElement, done: () => void) {
  const r = screen.getBoundingClientRect(),
    board = document.createElement("div");
  board.className = "board-open";
  board.setAttribute("aria-hidden", "true");
  const blocks = [
    [12, 22, 9, 6], [70, 18, 6, 12], [30, 64, 12, 5], [78, 70, 8, 8], [48, 38, 5, 14],
  ].map(([x, y, w, hh]) => `<b style="--x:${x}%;--y:${y}%;--w:${w}%;--h:${hh}%"></b>`).join("");
  const tanks = [
    [18, 46, "#06c4ff"], [24, 74, "#06c4ff"], [74, 36, "#f4457a"], [84, 56, "#f4457a"],
  ].map(([x, y, c], i) => `<em style="--x:${x}%;--y:${y}%;--c:${c};--d:${i * 70}ms"></em>`).join("");
  board.innerHTML = `${blocks}${tanks}<span>DEPLOYING SQUAD</span><i class="l"></i><i class="r"></i>`;
  document.body.append(board);
  board.animate(
    [
      { clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 10px)` },
      { clipPath: "inset(0px 0px 0px 0px round 0px)" },
    ],
    { duration: 600, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" },
  );
  tone("sawtooth", 90, 360, 0.05, 0.55, 0.035);
  setTimeout(() => tone("square", 660, 990, 0, 0.09, 0.04), 640);
  setTimeout(done, 1300);
}
// Coming back from a game page: the cartridge pops out of the console and flies home.
const PLUGGED = "dom-virus:plugged";
function eject(id: string) {
  const cart = shelf?.querySelector<HTMLElement>(`.cartridge[data-cart="${id}"]`);
  if (!cart || !consoleEl || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  shelf!.dataset.pop = "in";
  cart.classList.add("plugging");
  const full = cart.hasAttribute("data-full");
  if (full) cart.style.zIndex = "32";
  const { dx, dy, k, h } = slotOffset(cart);
  consoleEl.querySelector("[data-console-name]")!.textContent = cart.querySelector("strong")?.textContent ?? "";
  consoleEl.style.setProperty("--boot", getComputedStyle(cart).getPropertyValue("--accent") || "#f4457a");
  consoleEl.querySelector("[data-console-press]")!.textContent = full ? "FULL GAME · PRESS START" : "PRESS START";
  consoleEl.classList.toggle("full", full);
  consoleEl.classList.add("booting");
  const out = cart.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${k})` },
      { transform: `translate(${dx}px, ${dy - h * 0.75}px) scale(${k}) rotate(4deg)`, offset: 0.3 },
      { transform: `translate(${dx * 0.4}px, ${(dy - h) * 0.5}px) rotate(-3deg) scale(1.04)`, offset: 0.65 },
      { transform: full ? `translateY(${-h * 0.62}px)` : "none", offset: full ? 0.85 : 1 },
      ...(full ? [{ transform: "none" }] : []),
    ],
    { duration: full ? 1100 : 900, delay: 350, easing: "cubic-bezier(.3,.7,.3,1)" },
  );
  // A special edition slides back down into its sleeve.
  if (full) setTimeout(() => cart.style.removeProperty("z-index"), 350 + 1100 * 0.85);
  setTimeout(() => consoleEl.classList.remove("booting", "full"), 650);
  out.onfinish = () => {
    cart.classList.remove("plugging");
    cart.style.removeProperty("transform-origin");
  };
}
// Back/forward (or the All games link) restores the shelf, then ejects the last cartridge.
addEventListener("pageshow", () => {
  if (!shelf) return;
  delete shelf.dataset.plugging;
  document.querySelectorAll(".board-open").forEach((n) => n.remove());
  shelf.querySelectorAll<HTMLElement>(".cartridge").forEach((n) => {
    n.classList.remove("plugging");
    n.style.removeProperty("z-index");
    n.getAnimations().forEach((a) => a.cancel());
  });
  consoleEl?.classList.remove("booting", "starting", "full");
  consoleEl?.querySelector<HTMLElement>("[data-console-screen]")?.style.removeProperty("view-transition-name");
  let id: string | null = null;
  try {
    id = sessionStorage.getItem(PLUGGED);
    sessionStorage.removeItem(PLUGGED);
  } catch {}
  if (id) requestAnimationFrame(() => eject(id!));
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
