import { registry } from "@game-registry";
import { track } from "./analytics/track.mjs";
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
// Gameplay analytics (site-kit/analytics): no-ops until the visitor accepts, and never inside a game.
let played: { game: string; version?: string; at: number } | null = null;
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
  if (played && previous) {
    const score = previous.getSnapshot().score;
    track("game_end", {
      game: played.game,
      ...(played.version ? { version: played.version } : {}),
      ...(typeof score === "number" ? { score } : {}),
      duration: Math.round((performance.now() - played.at) / 1000),
    });
  }
  played = null;
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
      played = { game: key, version, at: performance.now() };
      track("game_start", { game: key, ...(version ? { version } : {}) });
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
// Header Games key on the home page: it toggles. At the shelf (#games) it's pressed in; clicking
// it again goes back to the top (and drops the hash); clicking once more jumps back to the games.
const gamesLink = document.querySelector<HTMLAnchorElement>("[data-games-link]");
if (gamesLink && document.querySelector("[data-shelf]")) {
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
      if (hero.dataset.nukeOnStart) delete hero.dataset.nukeOnStart, heroGame()?.nuke();
    });
  },
);
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
        if (shown || heroGame() || hero.dataset.play) return;
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
// The mock BUTTON_01 is the big red button: clicking it nukes every bad guy and resets the round
// (the same nuke the two-minute timer fires). The first click also starts the game.
const heroGame = () => (hero as (HTMLElement & { heroGame?: { nuke(): void } }) | null)?.heroGame;
hero?.querySelector(".promo-button")?.addEventListener("click", () => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (heroGame()) heroGame()!.nuke();
  else hero.dataset.nukeOnStart = "true";
});
// CSS owns the motion. Observe visibility once per illustration to avoid offscreen work.
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
