import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, statSync, existsSync } from "node:fs";
import { resolve, extname } from "node:path";
import { chromium } from "playwright";

// The cartridge console's choreography runs on Fizlet (site-kit/console/): each move must run,
// settle to 0 fps when it is done, and Recall (shelf.choreo.destroy()) must give the page back.
const root = resolve("artifacts/site");
const server = createServer((req, res) => {
  try {
    let file = resolve(root, "." + decodeURIComponent(req.url.split("?")[0]).replace(/^\/dom-virus/, ""));
    if (!file.startsWith(root + "/") && file !== root) throw new Error("Invalid path");
    if (statSync(file).isDirectory()) file += "/index.html";
    res.setHeader(
      "Content-Type",
      { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml" }[extname(file)] ||
        "application/octet-stream",
    );
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/dom-virus/`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || (existsSync("/tmp/chromium") ? "/tmp/chromium" : undefined),
  args: ["--no-sandbox"],
});

// Every requestAnimationFrame call on the page is counted: settled means none at all.
const countFrames = () => {
  window.__raf = 0;
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => (window.__raf++, raf(cb));
};
const shelf = ".cartridge-shelf";
const engineState = (page) => page.evaluate((s) => document.querySelector(s).choreo.engine.paused, shelf);
/** The engine has settled and the page asks for no frames for `ms`. */
async function settles(page, what, ms = 600) {
  await page.waitForFunction((s) => document.querySelector(s).choreo.engine.paused.length > 0, shelf, { timeout: 4000 });
  const before = await page.evaluate(() => window.__raf);
  await page.waitForTimeout(ms);
  const frames = (await page.evaluate(() => window.__raf)) - before;
  assert.equal(frames, 0, `${what}: settles to 0 fps (asked for ${frames} frames in ${ms} ms; engine ${(await engineState(page)).join(",")})`);
}
/** Inline style of `sel`, sampled each frame for `ms`: the distinct values it went through. */
const sample = (page, sel, prop, ms) =>
  page.evaluate(
    ([sel, prop, ms]) =>
      new Promise((done) => {
        const seen = new Set(),
          t0 = performance.now();
        const tick = () => {
          const el = document.querySelector(sel);
          if (el) seen.add(el.style.getPropertyValue(prop));
          if (performance.now() - t0 < ms) requestAnimationFrame(tick);
          else done([...seen]);
        };
        tick();
      }),
    [sel, prop, ms],
  );
/** What Recall must give back: every cartridge's attributes and place, the console's and screen's. */
const snapshot = (page) =>
  page.evaluate(() => ({
    carts: [...document.querySelectorAll(".cartridge-shelf .cartridge")].map((c) => [
      c.dataset.cart,
      c.parentElement.dataset.bay,
      c.style.cssText,
      c.className,
    ]),
    bays: [...document.querySelectorAll(".cartridge-shelf .bay")].map((b) => [b.className, b.style.cssText]),
    console: [document.querySelector("[data-console]").className, document.querySelector("[data-console]").style.cssText],
    screen: [document.querySelector("[data-console-screen]").className, document.querySelector("[data-console-screen]").style.cssText],
    plugging: document.querySelector("[data-shelf]").dataset.plugging ?? null,
    boards: document.querySelectorAll(".board-open").length,
    html: document.documentElement.className,
    leftovers: document.querySelectorAll(".attract .bolt, .attract .burst, .attract .zapped, .attract .jump").length,
  }));

try {
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 500 });
    await context.addInitScript(countFrames);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    // Launches are caught here (a 204 navigates nowhere), so each move can be checked in place.
    await page.route(/\/dom-virus\/(battlefield|games\/[\w-]+)\/$/, (route) => route.fulfill({ status: 204 })); // 204: the browser stays on this page
    await page.goto(base);
    const home = await snapshot(page);

    // 1. Pop-in: the cartridges pop up as the shelf scrolls in, then hand their styles back.
    await page.locator("[data-shelf]").scrollIntoViewIfNeeded();
    const popped = await sample(page, '.cartridge[data-cart="byte-runner"]', "opacity", 500);
    assert.ok(popped.length > 2, `pop-in runs (opacity went through ${popped.join(" | ")})`);
    await page.waitForFunction(() => document.querySelector("[data-shelf]").dataset.pop === "in");
    const rest = await snapshot(page);
    assert.deepEqual(rest.carts, home.carts, "pop-in leaves no inline style behind");
    await settles(page, `pop-in @${width}`);

    // 2. Insert: the cartridge flies in, the screen boots, and it waits for a choice at 0 fps.
    const bf = page.locator('.cartridge[data-cart="battlefield"]');
    await bf.scrollIntoViewIfNeeded();
    await page.mouse.move(2, 2);
    await bf.click();
    const flight = await sample(page, '.cartridge[data-cart="battlefield"]', "transform", 500);
    assert.ok(flight.length > 5, `insert flight runs (${flight.length} transforms)`);
    await page.waitForFunction(() => document.querySelector("[data-console]").classList.contains("booting"));
    const name = await sample(page, "[data-console-name]", "letter-spacing", 200);
    assert.ok(name.includes("12px"), `the name types on (${name.join(" | ")})`);
    await page.waitForFunction(() => !document.querySelector("[data-console-name]").style.cssText, null, { timeout: 2000 });
    await settles(page, `seated @${width}`);

    // 3. Not now: another cartridge wiggles, the seated one hops; both give `translate` back.
    await page.locator('.cartridge[data-cart="byte-runner"]').click();
    const wiggle = await sample(page, '.cartridge[data-cart="byte-runner"]', "translate", 300);
    assert.ok(wiggle.length > 2, `refuse wiggle runs (${wiggle.join(" | ")})`);
    await page.waitForFunction(
      () =>
        !document.querySelector('.cartridge[data-cart="byte-runner"]').style.translate &&
        !document.querySelector('.cartridge[data-cart="battlefield"]').style.translate,
    );
    await settles(page, `refuse @${width}`);

    // 4. Eject (Esc): the exact reverse, then home with nothing left inline.
    await page.keyboard.press("Escape");
    const out = await sample(page, '.cartridge[data-cart="battlefield"]', "transform", 500);
    assert.ok(out.length > 5, `eject flight runs (${out.length} transforms)`);
    await page.waitForFunction(() => !document.querySelector("[data-shelf]").dataset.plugging, null, { timeout: 4000 });
    const ejected = await snapshot(page);
    assert.deepEqual(ejected.carts, home.carts, "home means home: every cartridge back in its bay as it was");
    assert.deepEqual(ejected.bays, home.bays);
    await settles(page, `eject @${width}`);

    // 5. Idle mini-game: A fires (bolt, burst), B jumps, Start hops; nothing is left behind.
    await page.locator('[data-pad="a"]').click();
    const bolt = await sample(page, ".attract .bolt", "transform", 150);
    assert.ok(bolt.filter(Boolean).length > 1, `the bolt flies (${bolt.join(" | ")})`);
    await page.locator('[data-pad="b"]').click();
    await page.locator('[data-pad="start"]').click();
    await page.waitForFunction(
      () => !document.querySelector(".attract .bolt, .attract .burst, .attract .zapped, .attract .jump, .attract.hop, .attract.aiming"),
      null,
      { timeout: 3000 },
    );
    await settles(page, `idle game @${width}`);

    // 6. Full game: the screen grows into the board (clip-path on the clock), the page drops its
    //    scrollbar; Recall gives everything back.
    await bf.click();
    await page.waitForFunction(() => document.querySelector("[data-console]").classList.contains("booting"));
    await page.locator('[data-pad="a"]').dispatchEvent("click");
    await page.waitForFunction(() => document.querySelector(".board-open"), null, { timeout: 4000 });
    const grow = await sample(page, ".board-open", "clip-path", 500);
    assert.ok(grow.length > 5 && grow[0] !== "", `the screen grows over the page (${grow.length} clips)`);
    await page.waitForFunction(() => document.documentElement.classList.contains("board-full"), null, { timeout: 3000 });
    assert.match(
      await page.evaluate(() => document.querySelector(".board-open").style.clipPath),
      /^inset\(0px( round 0px)?\)$/,
      "the board covers the viewport",
    );
    await page.evaluate((s) => document.querySelector(s).choreo.destroy(), shelf);
    const recalled = await snapshot(page);
    for (const k of ["carts", "bays", "plugging", "boards", "html", "leftovers"])
      assert.deepEqual(recalled[k], { ...home, carts: home.carts }[k], `Recall gives back ${k}`);
    assert.equal(recalled.console[0], home.console[0], "Recall: the console is idle");
    assert.equal(recalled.console[1], home.console[1], "Recall: the console's inline style is given back");
    assert.deepEqual((await engineState(page)).includes("stopped"), true);
    await settles(page, `after Recall @${width}`).catch(() => {}); // the engine is gone: count frames directly
    const after = await page.evaluate(() => window.__raf);
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => window.__raf), after, "after Recall: no frames");

    // 7. Recall mid-flight: the cartridge is home at once.
    await page.goto(base + "?fresh=1#games"); // a new document (a hash alone would stay on this one)
    await page.waitForFunction(() => document.querySelector("[data-shelf]").dataset.pop === "in", null, { timeout: 5000 });
    await page.locator('.cartridge[data-cart="byte-runner"]').click();
    await page.waitForFunction(() => !!document.querySelector('.cartridge[data-cart="byte-runner"]').style.transform, null, { timeout: 2000 });
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.querySelector("[data-console]").classList.contains("booting")), false, "mid-flight");
    await page.evaluate((s) => document.querySelector(s).choreo.destroy(), shelf);
    assert.deepEqual((await snapshot(page)).carts, home.carts, "Recall mid-flight puts the cartridge home");

    // 8. The way back through the board: docked, the doors fold shut on the clock, the board
    //    shrinks into the screen, the cartridge flies home; then 0 fps.
    await page.goto(base + "?board=battlefield#console");
    await page.waitForFunction(() => document.querySelector(".board-open.closing"), null, { timeout: 4000 });
    const fold = await sample(page, ".board-open > i.l", "transform", 500);
    assert.ok(fold.length > 5, `the doors fold shut (${fold.length} transforms)`);
    await page.waitForFunction(
      () => !document.querySelector(".board-open") && !document.querySelector("[data-shelf]").dataset.plugging && location.hash === "#games",
      null,
      { timeout: 6000 },
    );
    const back = await snapshot(page);
    assert.deepEqual(back.carts, home.carts);
    await settles(page, `return through the board @${width}`);

    // 9. Reduced motion: the way back lands at once; an idle shot lands on its end state.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(base + "?play=byte-runner#console");
    assert.match(page.url(), /#games$/, "reduced motion: home at once");
    assert.deepEqual((await snapshot(page)).carts, home.carts);
    await page.locator('[data-pad="a"]').click();
    await page.waitForFunction(() => !document.querySelector(".attract .bolt, .attract .burst"), null, { timeout: 300 });
    await settles(page, `reduced motion @${width}`);
    await page.emulateMedia({ reducedMotion: "no-preference" });

    assert.deepEqual(errors, [], "no page errors");
    await context.close();
  }
  console.log("Site: the cartridge console's choreography runs on Fizlet, settles to 0 fps and Recalls (desktop and phone).");
} finally {
  await browser.close();
  server.close();
}
