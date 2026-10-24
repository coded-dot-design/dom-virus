import assert from "node:assert/strict";
import { resolve } from "node:path";
import { gameRoot } from "../scripts/game-paths.mjs";
export async function checkNativeOwnership(page) {
  const result = await page.evaluate(
    async (urls) => {
      const { createBoard } = await import(urls.board),
        { AttachedPresentation } = await import(urls.swarm),
        { BasePresentation } = await import(urls.sherman);
      const scroller = document.createElement("div");
      scroller.style.cssText =
        "position:fixed;left:40px;top:40px;width:500px;height:260px;overflow:auto";
      scroller.innerHTML =
        '<div style="height:1200px;padding:50px"><button style="width:180px;height:50px;margin-top:80px">Real target</button></div>';
      document.body.append(scroller);
      const target = scroller.querySelector("button"),
        text = target.firstChild,
        original = target.style.cssText;
      const board = createBoard(document, { root: scroller });
      board.measure(0, true);
      const base = board.targets[0];
      base.health = 0;
      const presentation = new BasePresentation({
        board,
        options: { document },
      });
      presentation.update([
        {
          target: base,
          captured: false,
          capture: 0.35,
          walls: Array.from({ length: 4 }, () => ({ hp: 50, maxHp: 50 })),
        },
      ]);
      const baseRoot = target.querySelector("dom-virus-attachment").shadowRoot;
      const wall = baseRoot.querySelector(".wall");
      const before = wall.getBoundingClientRect();
      scroller.scrollTop = 47;
      target.style.transform = "translateX(23px)";
      const after = wall.getBoundingClientRect();
      const nativeBase =
        Math.abs(after.top - before.top + 47) < 0.1 &&
        Math.abs(after.left - before.left - 23) < 0.1;
      const capture =
        baseRoot.querySelector(".progress").style.transform === "scaleX(0.5)";
      target.style.removeProperty("transform");
      board.destroy();
      const baseClean =
        !target.querySelector("dom-virus-attachment") &&
        target.style.cssText === original &&
        target.firstChild === text;
      const styles = new Map();
      const swarm = new AttachedPresentation(
        document,
        (el, key, value, priority) => {
          styles.set(key, el.style.getPropertyValue(key));
          el.style.setProperty(key, value, priority);
        },
      );
      const r = target.getBoundingClientRect();
      const swarmTarget = {
        element: target,
        rect: r,
        health: 100,
        rendered: true,
        visible: true,
        palette: { power: "#00e5ff" },
      };
      const bug = {
        id: 1,
        attached: true,
        target: swarmTarget,
        x: r.left + 30,
        y: r.top + 20,
      };
      swarm.update([swarmTarget], [bug], false);
      swarm.drawBug(bug, 1, (ctx) => {
        ctx.fillStyle = "#ff168f";
        ctx.fillRect(bug.x - 3, bug.y - 3, 6, 6);
      });
      swarm.setActive(false);
      const root = target.querySelector("dom-virus-attachment").shadowRoot,
        sprite = root.querySelector("canvas"),
        signal = root.querySelector(".signal");
      const b = sprite.getBoundingClientRect(),
        ringBefore = signal.getBoundingClientRect();
      scroller.scrollTop += 31;
      target.style.transform = "translateX(13px)";
      const a = sprite.getBoundingClientRect(),
        ringAfter = signal.getBoundingClientRect();
      const nativeBug =
        Math.abs(a.top - b.top + 31) < 0.1 &&
        Math.abs(a.left - b.left - 13) < 0.1;
      const nativeRing =
        Math.abs(ringAfter.top - ringBefore.top + 31) < 0.1 &&
        Math.abs(ringAfter.left - ringBefore.left - 13) < 0.1;
      const paused = root
        .getAnimations()
        .every((a) => a.playState === "paused");
      swarm.clear();
      const swarmClean = !target.querySelector("dom-virus-attachment");
      scroller.remove();
      return {
        nativeBase,
        capture,
        baseClean,
        nativeBug,
        nativeRing,
        paused,
        swarmClean,
      };
    },
    {
      board: "/@fs" + resolve("src/board.ts"),
      swarm:
        "/@fs" +
        resolve(gameRoot("swarm-protocol"), "src/attached-presentation.ts"),
      sherman:
        "/@fs" + resolve(gameRoot("sherman-bytes"), "src/base-presentation.ts"),
    },
  );
  for (const [key, value] of Object.entries(result))
    assert.equal(value, true, key);
  await page.evaluate(
    async (url) => {
      const spacer = document.createElement("div");
      spacer.id = "key-scroll-space";
      spacer.style.height = "2500px";
      document.body.append(spacer);
      const { createArcade } = await import(url);
      window.keyChecks = { fired: false, moved: false, clicks: 0 };
      const control = document.createElement("button");
      control.id = "protected-key-test";
      control.setAttribute("data-virus-ignore", "");
      control.textContent = "Host control";
      control.style.cssText = "position:fixed;left:10px;top:10px";
      control.onclick = () => window.keyChecks.clicks++;
      document.body.append(control);
      window.keyController = createArcade({
        id: "key-ownership",
        title: "Keys",
        color: "#ff168f",
        capabilities: { fire: true },
        create: (api) => ({
          reset() {},
          draw() {},
          update() {
            window.keyChecks.fired ||= api.firing;
            window.keyChecks.moved ||= api.input.keys.has("ArrowDown");
          },
          snapshot: () => ({}),
        }),
      });
      window.keyController.start();
      control.focus();
      window.scrollTo(0, 0);
    },
    "/@fs" + resolve("src/index.ts"),
  );
  await page.keyboard.down("Space");
  await page.waitForTimeout(100);
  await page.keyboard.up("Space");
  await page.keyboard.down("ArrowDown");
  await page.waitForTimeout(100);
  await page.keyboard.up("ArrowDown");
  const keys = await page.evaluate(() => ({
    ...window.keyChecks,
    scroll: scrollY,
  }));
  assert.equal(keys.fired, true);
  assert.equal(keys.moved, true);
  assert.equal(keys.clicks, 0);
  assert.equal(keys.scroll, 0);
  await page.evaluate(() => {
    window.keyController.destroy();
    document.querySelector("#protected-key-test").remove();
    document.body.focus();
  });
  await page.keyboard.press("Space");
  await page.waitForTimeout(250);
  assert.ok(
    await page.evaluate(() => scrollY > 0),
    "native scrolling returns after Recall",
  );
  await page.evaluate(() => {
    scrollTo(0, 0);
    document.querySelector("#key-scroll-space").remove();
  });
  console.log(
    "Native ownership: paused base walls, capture, attached bug, rings, cleanup and focused-control key capture verified.",
    result,
  );
}
