// The home page's cartridge shelf + console (CartridgeShelf.astro loads this; no other page pays
// for it). The choreography is its own module on Fizlet (site-kit/console/), mounted at once: the
// way back docks the cartridge before the first paint. This file adds the hub's side: where a
// launch goes and the URL state for the way back. Picking a cartridge flies it into the console,
// boots the screen, then navigates; the browser's View Transition morphs the console screen into
// the game page's display.
import { mount } from "./console";
const shelfRoot = document.querySelector<HTMLElement>(".cartridge-shelf:has([data-console])");
const consoleEl = shelfRoot?.querySelector<HTMLElement>("[data-console]") ?? null;
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
  // The head script took scroll restoration over for the docked arrival (the console module locks).
  history.scrollRestoration = "auto";
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
const withNext = (state: ReturnType<typeof returnState>) => state && { ...state, next: new URLSearchParams(location.search).get("next") };
if (shelfRoot) {
  const initial = returnState();
  const choreo = mount(shelfRoot, {
    // Returning from a game skips the pop-in: the shelf is already set up around the docked cartridge.
    pop: !initial,
    launch: (action, { cart, screen, board }) => {
      if (!board) screen.style.setProperty("view-transition-name", "game-screen");
      leaveTo(cart, board, action.href);
    },
    mark: markReturn,
    docked: () => document.getElementById("dv-return")?.remove(),
    reveal: afterReveal,
    unmark: clearReturn,
    home: settle,
    returnState: () => withNext(returnState()),
  });
  // Tests reach it here: shelf.choreo.destroy() is Recall.
  Object.assign(shelfRoot, { choreo });
  if (initial) choreo.returnHome(withNext(initial)!);
  // From elsewhere on the site (a cartridge on Under the hood): ?load=<id> brings you to the
  // console, plugs that cartridge in and presses the button that opens its page (INFO / B for the full game).
  const load = new URLSearchParams(location.search).get("load");
  if (!initial && load && /^[\w-]+$/.test(load)) {
    history.replaceState(history.state, "", `${location.pathname}#console`);
    shelfRoot.querySelector<HTMLElement>("[data-shelf]")!.dataset.pop = "in";
    choreo.lock();
    const cart = shelfRoot.querySelector<HTMLElement>(`.cartridge[data-cart="${load}"]`);
    let pad = "a";
    try {
      pad = (JSON.parse(cart?.dataset.actions || "[]") as { pad: string; label: string }[]).find((a) => /info/i.test(a.label))?.pad ?? "a";
    } catch {}
    choreo.swapIn(load, pad, 0.45);
  }
}

