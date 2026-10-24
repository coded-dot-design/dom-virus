import "./style.css";
const registry = {
  "null-invaders": {
    load: () => import("@games/null-invaders"),
    factory: "createNullInvaders",
    hint: "Mouse or WASD to fly · Click or Space to fire · G jumps to a factory.",
  },
  "byte-runner": {
    load: () => import("@games/byte-runner"),
    factory: "createByteRunner",
    hint: "Arrows or WASD to move · Follow the pellet trails, collect power pellets, and clear each food trail.",
  },
  "swarm-protocol": {
    load: () => import("@games/swarm"),
    factory: "installSwarm",
    hint: "Click the bugs to defend the page · Scroll freely to follow attacks.",
  },
  "sherman-bytes": {
    load: () => import("@games/sherman-bytes"),
    factory: "createShermanBytes",
    hint: "WASD or arrows to drive · Mouse to aim · Click or Space to fire · Occupy disabled bases to capture.",
  },
};
let game = null,
  revision = 0,
  last = "",
  selected = "null-invaders";
const $ = (s) => document.querySelector(s);
const buttons = [...document.querySelectorAll("[data-game]")];
const root = $("#board");
function update(snapshot) {
  const value = snapshot
    ? `${snapshot.status.toUpperCase()}  /  ${snapshot.score || 0} PTS  /  ${snapshot.alive || 0} ENEMIES`
    : "READY / SELECT A GAME";
  if (value !== last) {
    $("#telemetry").textContent = value;
    last = value;
  }
}
function recall() {
  revision++;
  game?.destroy();
  game = null;
  update(null);
  $("#pause").textContent = "Pause";
}
async function launch() {
  recall();
  const generation = revision;
  $("#launch").disabled = true;
  try {
    const entry = registry[selected],
      module = await entry.load();
    if (generation !== revision) return;
    const mode = $("#scenario").value;
    const options = {
      document,
      root,
      onState: update,
      onError: (error) => ($("#telemetry").textContent = error.message),
    };
    if (mode === "marked") {
      options.textSelector = "[data-virus-text]";
      options.targetSelector = "[data-virus-target]";
    }
    if (mode === "letters") {
      options.targetSelector = "[data-no-target]";
    }
    if (mode === "nested") {
      options.root = $("#nested");
    }
    if (selected === "swarm-protocol") {
      // Swarm keeps its established API; adapt it at the playground boundary.
      const scope = mode === "nested" ? "#nested" : "#board";
      Object.assign(options, {
        textSelector:
          mode === "marked"
            ? `${scope} [data-virus-text]`
            : `${scope} :is(h1,h2,h3,h4,h5,h6,p,li,blockquote)`,
        targetSelector:
          mode === "letters"
            ? "[data-no-target]"
            : mode === "marked"
              ? `${scope} [data-virus-target]`
              : `${scope} :is(button,[role="button"],a.button,a.btn):not(form *,[data-virus-ignore] *)`,
        storageKey: "dom-virus-playground-swarm",
        keyboard: false,
        triggerSelector: false,
      });
    }
    game = module[entry.factory](options);
    await game.start();
    $("#launch").blur();
    options.root.scrollIntoView({ behavior: "instant", block: "start" });
  } catch (error) {
    recall();
    $("#telemetry").textContent = `Unable to start: ${error.message}`;
    console.error(error);
  } finally {
    if (generation === revision) $("#launch").disabled = false;
    else $("#launch").disabled = false;
  }
}
for (const el of buttons)
  el.addEventListener("click", () => {
    recall();
    selected = el.dataset.game;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
    $("#instructions").textContent = registry[selected].hint;
  });
$("#launch").addEventListener("click", launch);
$("#recall").addEventListener("click", recall);
$("#pause").addEventListener("click", () => {
  if (!game) return;
  const paused = game.getSnapshot()?.status === "paused";
  paused ? game.resume() : game.pause();
  $("#pause").textContent = paused ? "Pause" : "Resume";
  $("#pause").blur();
});
$("#scenario").addEventListener("change", recall);
$("#demo-form").addEventListener("submit", (e) => {
  e.preventDefault();
  $("#form-result").textContent = "Form works. Nothing was submitted.";
});
for (const el of document.querySelectorAll("#board button:not(form button)"))
  el.addEventListener("click", () => {
    $("#host-event").textContent =
      `Original button action: ${el.textContent.trim()}`;
  });
window.playground = {
  launch,
  recall,
  getSnapshot: () => game?.getSnapshot() || null,
};
if (import.meta.hot) import.meta.hot.dispose(recall);
window.addEventListener("pagehide", recall);
