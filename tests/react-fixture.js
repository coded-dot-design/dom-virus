import { createElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { NullInvaders } from "@games/null-invaders/react";
import { ByteRunner } from "@games/byte-runner/react";
const root = createRoot(document.getElementById("react-root"));
const events = [];
let options = { root: "#board", onEvent: (event) => events.push(event.type) };
window.reactFixture = {
  events,
  render(active, runner = false, changeOptions = false) {
    if (changeOptions) options = { ...options, reducedMotion: true };
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(runner ? ByteRunner : NullInvaders, { active, options }),
      ),
    );
  },
  unmount() {
    root.unmount();
  },
};
