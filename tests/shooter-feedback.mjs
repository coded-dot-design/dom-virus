import assert from "node:assert/strict";
import { resolve } from "node:path";
import { gameRoot } from "../scripts/game-paths.mjs";

export async function checkShooterFeedback(page) {
  const urls = {
    board: "/@fs" + resolve("src/board.ts"),
    shooter: "/@fs" + resolve(gameRoot("null-invaders"), "src/index.ts"),
  };
  const result = await page.evaluate(async ({ board: boardURL }) => {
    const { createBoard } = await import(boardURL);
    const root = document.createElement("div");
    root.style.cssText =
      "position:fixed;left:30px;top:30px;width:800px;background:#fff;color:#18312a;z-index:100";
    root.innerHTML =
      '<h2 style="font:italic 700 40px Georgia;color:rgb(24,49,42)">Typography</h2><p>Keep the text node and native button action.</p><button style="background-color:rgb(25,120,170)!important;background-image:linear-gradient(#fff2,#0002);color:white;--virus-power-color:#06c4ff">Factory</button>';
    document.body.append(root);
    const button = root.querySelector("button");
    const original = button.style.cssText;
    const label = button.firstChild;
    let clicks = 0;
    button.addEventListener("click", () => clicks++);
    const b = createBoard(document, {
      root,
      binaryStyle: "native",
      targetEffects: "liquid",
    });
    b.measure(0, true);
    const glyph = b.glyphs.find((g) => g.char === "T");
    const node = glyph.record.node,
      text = node.data;
    b.consume(glyph);
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    b.draw(ctx, 0.01, false);
    const fontMatches =
      glyph.typography.font.includes("Georgia") &&
      glyph.typography.font.includes("40px") &&
      glyph.typography.color === "rgb(24, 49, 42)";
    const initial = button.style.backgroundImage;
    b.damage(b.targets[0], 50, { x: 55, y: 100 });
    b.draw(ctx, 0.1, false);
    const ripple = button.style.backgroundImage;
    b.draw(ctx, 1, false);
    const settled = button.style.backgroundImage;
    button.click();
    const output = {
      fontMatches,
      keepsText: node.data === text,
      spentOnce: b.consume(glyph) === false,
      keepsLabel: button.firstChild === label,
      keepsAction: clicks === 1,
      initialFill: initial.includes("100%"),
      ripple: ripple.includes("svg"),
      settles: settled.includes("50%") && !settled.includes("svg"),
      originalBackgroundRetained: settled.includes("rgba(255, 255, 255"),
    };
    b.destroy();
    output.restoresStyle = button.style.cssText === original;
    output.restoresHighlights = CSS.highlights.size === 0;
    const c = createBoard(document, { root, targetEffects: "liquid" });
    c.measure(0, true);
    c.draw(ctx, 0, true);
    c.damage(c.targets[0], 50);
    c.draw(ctx, 0.1, true);
    output.reducedMotionStatic = !button.style.backgroundImage.includes("svg");
    button.style.setProperty(
      "background-image",
      "linear-gradient(red, blue)",
      "important",
    );
    c.draw(ctx, 0.2, true);
    c.destroy();
    output.hostWins =
      button.style.backgroundImage === "linear-gradient(red, blue)";
    root.remove();
    return output;
  }, urls);
  for (const [key, value] of Object.entries(result))
    assert.equal(value, true, key);
  console.log(
    "Shooter typography, liquid hits, reduced motion and exact recall",
    result,
  );
  await page.evaluate(async ({ shooter }) => {
    const { createNullInvaders } = await import(shooter);
    const root = document.createElement("div");
    root.id = "feedback-board";
    root.style.cssText =
      "position:fixed;inset:0;z-index:100;background:#111a1b;color:#e8f3e8;padding:60px";
    root.innerHTML =
      '<h1 style="font:500 72px/1.15 Georgia;margin:0 0 40px">THE PAGE IS THE PLAYFIELD.</h1><p style="font:24px/1.6 Georgia;max-width:850px">Letters break into binary. Factories release pixel invaders. Keep moving, build your combo, and upgrade your interceptor.</p><button style="position:absolute;left:47%;top:46%;background:#06c4ff;color:#101820;border:0;border-radius:12px;padding:18px 28px">ALIEN FACTORY</button><button style="position:absolute;left:20%;top:46%;background:#bd9bf4;color:#101820;border:0;border-radius:12px;padding:18px 28px">HIVE NODE</button>';
    document.body.append(root);
    window.feedbackGame = createNullInvaders({
      root,
      controls: "keyboard",
      seed: 17,
    });
    window.feedbackGame.start();
  }, urls);
  await page.waitForTimeout(2300);
  await page.keyboard.down("Space");
  await page.waitForTimeout(2000);
  await page.keyboard.up("Space");
  const hud = page.locator("[data-dom-virus-root] .hud");
  await page.waitForTimeout(120);
  assert.match(
    await hud.locator("[data-field=score]").textContent(),
    /^\d{6}$/,
  );
  assert.equal(
    await hud.locator(".meter").getAttribute("aria-valuemax"),
    "100",
  );
  assert.equal(await hud.getAttribute("data-theme"), "dark");
  await page.screenshot({ path: "artifacts/shooter-dark.png" });
  await page.emulateMedia({ colorScheme: "light" });
  await page.evaluate(() => {
    const root = document.querySelector("#feedback-board");
    root.style.background = "#f4f5ef";
    root.style.color = "#1b302c";
  });
  await page.waitForTimeout(150);
  assert.equal(await hud.getAttribute("data-theme"), "light");
  await page.screenshot({ path: "artifacts/shooter-light.png" });
  await hud.locator("[data-action=fold]").click();
  assert.equal(await hud.locator(".game").isVisible(), false);
  await hud.locator("[data-action=fold]").click();
  await hud.locator("[data-action=pause]").click();
  assert.equal(
    await page.evaluate(() => window.feedbackGame.getSnapshot().status),
    "paused",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const box = await hud.boundingBox();
  assert.ok(
    box.x >= 0 &&
      box.x + box.width <= 390 &&
      box.y >= 0 &&
      box.y + box.height <= 844,
  );
  await page.screenshot({ path: "artifacts/shooter-mobile.png" });
  await hud.locator("[data-action=exit]").click();
  assert.equal(await page.locator("[data-dom-virus-root]").count(), 0);
  assert.equal(await page.evaluate(() => CSS.highlights.size), 0);
  await page.evaluate(() => {
    window.feedbackGame.destroy();
    document.querySelector("#feedback-board").remove();
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
}
