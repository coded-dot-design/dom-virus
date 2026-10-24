import assert from "node:assert/strict";
import { resolve } from "node:path";
export async function checkAttachedEffects(page) {
  const url = "/@fs" + resolve("src/board.ts");
  const result = await page.evaluate(async (url) => {
    const { createBoard } = await import(url);
    const root = document.createElement("div");
    root.style.cssText =
      "position:fixed;top:40px;left:40px;width:500px;height:250px;overflow:auto;background:white;color:black;z-index:100";
    root.innerHTML =
      '<div style="height:900px;padding:30px"><p>Native scrolling terrain</p><button style="margin-top:60px">Factory</button></div>';
    document.body.append(root);
    const target = root.querySelector("button"),
      node = target.firstChild,
      original = target.style.cssText;
    const rect = target.getBoundingClientRect();
    let scans = 0,
      reads = 0;
    const query = root.querySelectorAll.bind(root);
    root.querySelectorAll = (...args) => {
      scans++;
      return query(...args);
    };
    const getRect = target.getBoundingClientRect.bind(target);
    target.getBoundingClientRect = () => {
      reads++;
      return getRect();
    };
    const board = createBoard(document, { root, targetEffects: "liquid" });
    board.measure(0, true);
    const ctx = new Proxy(
      {},
      {
        get() {
          return () => {
            throw Error("Target decoration should not draw on canvas");
          };
        },
      },
    );
    board.draw(ctx, 0, false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const initialScans = scans;
    board.measure(1, true);
    const noOwnRescan = scans === initialScans;
    const host = target.querySelector("[data-dom-virus-effect]");
    const before = host.getBoundingClientRect(),
      originalTarget = getRect();
    const noLayoutChange =
      Math.abs(originalTarget.width - rect.width) < 0.01 &&
      Math.abs(originalTarget.height - rect.height) < 0.01 &&
      node === target.firstChild;
    board.setActive(false);
    const animations = host.shadowRoot.getAnimations();
    const paused =
      animations.length === 2 &&
      animations.every((a) => a.playState === "paused");
    const initialReads = reads;
    root.scrollTop = 45;
    target.style.transform = "translateX(17px)";
    const after = host.getBoundingClientRect();
    const followsNatively =
      Math.abs(after.top - before.top + 45) < 0.1 &&
      Math.abs(after.left - before.left - 17) < 0.1 &&
      reads === initialReads;
    target.style.removeProperty("transform");
    await new Promise((resolve) => setTimeout(resolve, 0));
    board.measure(2, true);
    // Every native damage ripple is a style change; it must not rebuild glyphs.
    const scanBeforeHit = scans;
    board.damage(board.targets[0], 30);
    board.draw(ctx, 2.2, false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    board.measure(3, true);
    const hitDoesNotRescan = scans === scanBeforeHit;
    // A host change in the same task as our next paint must still be observed.
    target.style.width = "220px";
    board.damage(board.targets[0], 5);
    board.draw(ctx, 3.2, false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    board.measure(4, true);
    const hostInvalidates = scans > scanBeforeHit;
    target.style.removeProperty("width");
    board.destroy();
    const cleanup =
      !target.querySelector("[data-dom-virus-effect]") &&
      animations.every((a) => a.playState === "idle") &&
      target.style.cssText === original &&
      target.firstChild === node;
    // Repeated starts do not accumulate attached hosts or running animations.
    for (let i = 0; i < 3; i++) {
      const b = createBoard(document, { root, targetEffects: "liquid" });
      b.measure(0, true);
      b.draw(ctx, 0, false);
      b.destroy();
    }
    const repeatClean = !root.querySelector("[data-dom-virus-effect]");
    root.remove();
    return {
      noOwnRescan,
      noLayoutChange,
      paused,
      followsNatively,
      hitDoesNotRescan,
      hostInvalidates,
      cleanup,
      repeatClean,
    };
  }, url);
  for (const [key, value] of Object.entries(result))
    assert.equal(value, true, key);
  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.evaluate(async (url) => {
    const { createBoard } = await import(url);
    const root = document.createElement("div");
    root.style.cssText = "position:fixed;top:30px;left:30px";
    root.innerHTML = "<button>Mobile factory</button>";
    document.body.append(root);
    const b = createBoard(document, { root, targetEffects: "liquid" });
    b.measure(0, true);
    b.draw({}, 0, false);
    b.damage(b.targets[0], 40);
    b.draw({}, 0.2, false);
    const button = root.firstChild,
      host = button.querySelector("[data-dom-virus-effect]");
    const quiet =
      !button.style.backgroundImage.includes("svg") &&
      host.shadowRoot.getAnimations().every((a) => a.playState === "paused");
    b.destroy();
    root.remove();
    return quiet;
  }, url);
  assert.equal(
    mobile,
    true,
    "mobile uses stable native fill and paused beacons",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  console.log(
    "Attached effects: native nested scrolling, transforms, mobile, ownership and cleanup verified.",
    result,
  );
}
