import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, statSync, existsSync, mkdirSync } from "node:fs";
import { resolve, extname } from "node:path";
import { chromium } from "playwright";

// Exercise the actual compiled site, including its shared client and built syntax colors.
const root = resolve("artifacts/site");
const output = resolve("artifacts/site-qa");
mkdirSync(output, { recursive: true });
const server = createServer((req, res) => {
  try {
    let file = resolve(
      root,
      "." +
        decodeURIComponent(req.url.split("?")[0]).replace(/^\/dom-virus/, ""),
    );
    if (!file.startsWith(root + "/") && file !== root)
      throw new Error("Invalid path");
    if (statSync(file).isDirectory()) file += "/index.html";
    res.setHeader(
      "Content-Type",
      {
        ".js": "text/javascript",
        ".css": "text/css",
        ".html": "text/html",
        ".json": "application/json",
        ".svg": "image/svg+xml",
      }[extname(file)] || "application/octet-stream",
    );
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/dom-virus/`;
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/tmp/chromium") ? "/tmp/chromium" : undefined),
  args: ["--no-sandbox"],
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  const menu = page.getByRole("button", { name: /^(Open|Close) menu$/ });
  const system = page.locator(".system-map");
  // Home is the DOM Virus hero plus a cartridge shelf; each game lives on its own page.
  const order = ["sherman-bytes", "swarm-protocol", "byte-runner", "null-invaders"];
  assert.deepEqual(
    await page.locator(".cartridge").evaluateAll((nodes) => nodes.map((n) => new URL(n.href).pathname)),
    [...order, "battlefield"].map((id) => `/dom-virus/games/${id}/`),
  );
  assert.equal(await page.locator(".game-section").count(), 0, "no long scroll of game sections on home");
  assert.equal(await page.locator(".console").count(), 1);
  const promo = page.locator(".hero-crossover");
  // Mash-up: DOM Virus skulls and bad guys from every game, an interceptor, and a turreted tank.
  assert.equal(await promo.locator(".promo-character,.character-icon").count(), 9);
  assert.equal(await promo.locator(".foe-skull").count(), 3);
  assert.equal(await promo.locator(".boom").count(), 7);
  assert.ok((await promo.locator(".shot.miss").count()) >= 4, "some shots miss and fly off screen");
  // After the intro, both shooters sit fully inside the browser card.
  await promo.evaluate((el) => el.getAnimations({ subtree: true }).forEach((a) => { a.currentTime = 3600; }));
  const card = await promo.locator(".promo-stage").boundingBox();
  for (const sel of [".plane-aim .promo-character", ".tank-hull"]) {
    const r = await promo.locator(sel).boundingBox();
    assert.ok(r.x >= card.x - 2 && r.y >= card.y - 2 && r.x + r.width <= card.x + card.width + 2 && r.y + r.height <= card.y + card.height + 2, `${sel} inside the card`);
  }
  for (const selector of [".hero"]) {
    assert.deepEqual(await page.locator(selector).evaluate(el=>{const s=getComputedStyle(el);return [s.borderTopWidth,s.borderRightWidth,s.boxShadow]}), ["0px","0px","none"]);
  }
  await promo.getByRole("button", { name: "Pause scene animation" }).click();
  assert.equal(await promo.getAttribute("data-motion"), "false");
  await promo.getByRole("button", { name: "Resume scene animation" }).click();
  // First kill (interceptor) lands 4.24s in, the tank's 5.24s: each target explodes and vanishes.
  const at = async (ms) => promo.evaluate((el, ms) => el.getAnimations({ subtree: true }).forEach((a) => { a.currentTime = ms; }), ms);
  const opacity = (loc) => loc.evaluate((el) => Number(getComputedStyle(el).opacity));
  await at(4300);
  assert.ok((await opacity(promo.locator(".boom").nth(0).locator(".boom-flash"))) > 0.5);
  await at(4550);
  assert.ok((await opacity(promo.locator(".die").nth(0))) < 0.2, "first target is destroyed");
  await at(5300);
  assert.ok((await opacity(promo.locator(".boom").nth(1).locator(".boom-flash"))) > 0.5);
  // Tap the card: the contained mini-game takes over (auto-aim, spawns, squash, nuke cycle).
  await promo.locator(".promo-stage").click({ position: { x: 240, y: 200 } });
  await page.waitForFunction(() => document.querySelector(".hero-crossover").dataset.play === "true");
  await page.waitForFunction(() => document.querySelector(".hero-crossover").heroGame.foes > 0);
  assert.equal(await promo.locator(".foe-css").first().isVisible(), false, "CSS loop steps aside");
  await page.waitForFunction(() => document.querySelector(".hero-crossover").heroGame.score > 0, null, { timeout: 15000 });
  await page.evaluate(() => document.querySelector(".hero-crossover").heroGame.nuke());
  await page.waitForFunction(() => document.querySelector(".hero-crossover").classList.contains("hx-nuke"));
  await page.waitForFunction(() => !document.querySelector(".hero-crossover").classList.contains("hx-nuke"), null, { timeout: 5000 });
  assert.equal(await page.evaluate(() => document.querySelector(".hero-crossover").heroGame.score), 0, "round resets");
  assert.equal(await menu.isVisible(), false);
  assert.equal(await page.locator(".site-header nav a").count(), 3);

  // Picking a cartridge plugs it into the console, boots the screen, then opens the game page.
  await page.locator('.cartridge[data-cart="byte-runner"]').scrollIntoViewIfNeeded();
  await page.locator('.cartridge[data-cart="byte-runner"]').click();
  await page.waitForFunction(() => document.querySelector(".console")?.classList.contains("booting"));
  await page.waitForURL(/\/games\/byte-runner\/$/);
  assert.equal(await page.locator(".game-section.standalone").count(), 1);
  assert.equal(await page.locator(".game-section").evaluate((el) => getComputedStyle(el).borderTopWidth), "0px", "game page has no outer border");
  assert.equal(await page.locator('[data-launch="byte-runner"]').count(), 1);
  // One page per game: deep details live in the game's GitHub README.
  assert.equal(await page.locator(".nerd-link").getAttribute("href"), "https://github.com/coded-dot-design/byte-runner#readme");
  // Battlefield has its own page and launches the app; Sherman Bytes can launch it too.
  await page.goto(base + "games/battlefield/");
  assert.equal(new URL(await page.getByRole("link", { name: "Launch Battlefield" }).evaluate((a) => a.href)).pathname, "/dom-virus/battlefield/");
  assert.equal(await page.locator(".bf-layers li").count(), 4);
  await page.goto(base + "games/sherman-bytes/");
  assert.equal(new URL(await page.getByRole("link", { name: "Open Battlefield" }).evaluate((a) => a.href)).pathname, "/dom-virus/battlefield/");
  // The original one-page layout is archived.
  await page.goto(base + "archive/");
  assert.equal(await page.locator(".game-section").count(), 4);
  await page.goto(base + "under-the-hood/");
  assert.equal(await page.locator(".code-example .astro-code").count(), 4);
  for (const selector of [".engineering", ".embed-section"])
    assert.deepEqual(await page.locator(selector).evaluate(el=>{const s=getComputedStyle(el);return [s.borderTopWidth,s.borderRightWidth,s.boxShadow]}), ["0px","0px","none"]);

  for (const theme of ["dark", "light"]) {
    await page.goto(base);
    await page.getByRole("button", { name: `Use ${theme} theme` }).click();
    await promo.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => document.querySelector(".hero-crossover").dataset.motion === "true",
    );
    await page
      .locator(".hero-grid")
      .screenshot({ path: `${output}/hero-${theme}.png` });
    await page.locator(".cartridge-shelf").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector("[data-shelf]").dataset.pop === "in");
    await page.waitForTimeout(900);
    await page.locator(".cartridge-shelf").screenshot({ path: `${output}/shelf-${theme}.png` });
    await page.goto(base + "under-the-hood/");
    await system.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => document.querySelector(".system-map").dataset.motion === "true",
    );
    const arrow = system.locator(".map-exchange .ui-icon").first();
    assert.equal(
      await arrow.evaluate((el) => getComputedStyle(el).animationPlayState),
      "running",
    );
    const animation = await arrow.evaluate(
      (el) => el.getAnimations()[0].currentTime,
    );
    await page.waitForTimeout(120);
    assert.ok(
      (await arrow.evaluate((el) => el.getAnimations()[0].currentTime)) >
        animation,
    );
    await system
      .getByRole("button", { name: "Pause diagram animation" })
      .click();
    assert.equal(
      await arrow.evaluate((el) => getComputedStyle(el).animationPlayState),
      "paused",
    );
    const stopped = await arrow.evaluate(
      (el) => el.getAnimations()[0].currentTime,
    );
    await page.waitForTimeout(80);
    assert.ok(
      Math.abs(
        (await arrow.evaluate((el) => el.getAnimations()[0].currentTime)) -
          stopped,
      ) < 20,
    );
    await system
      .getByRole("button", { name: "Resume diagram animation" })
      .click();
    await system.screenshot({ path: `${output}/diagram-${theme}.png` });
    await page
      .locator(".tick-map")
      .screenshot({ path: `${output}/loop-${theme}.png` });
    await page
      .locator(".ownership-map")
      .screenshot({ path: `${output}/recall-${theme}.png` });
    const code = page.locator(".code-example").first();
    await code.scrollIntoViewIfNeeded();
    const colors = await code
      .locator("code .line span")
      .evaluateAll((nodes) => [
        ...new Set(nodes.map((el) => getComputedStyle(el).color)),
      ]);
    assert.ok(
      colors.length >= 5,
      `${theme} syntax has ${colors.length} distinct colors`,
    );
    const source = await code.locator("code").textContent();
    await code.locator("[data-copy]").click();
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      source,
    );
    assert.equal(await code.locator(".copied-icon").isVisible(), true);
    assert.equal(await code.locator(".copy-icon").count(), 1);
    await code.screenshot({ path: `${output}/code-${theme}.png` });
    await page
      .locator(".technical-grid")
      .first()
      .screenshot({ path: `${output}/engineering-${theme}.png` });
    await page
      .locator(".deep-dive")
      .first()
      .screenshot({ path: `${output}/budgets-${theme}.png` });
    const sizes = page.locator(".deep-dive").nth(1);
    await sizes.locator("summary").click();
    await sizes.screenshot({ path: `${output}/sizes-${theme}.png` });
    await sizes.locator("summary").click();
    await page
      .locator(".embed-game")
      .first()
      .screenshot({ path: `${output}/embed-${theme}.png` });
    await page.waitForFunction(
      () => document.querySelector(".system-map").dataset.motion === "false",
    );
    assert.equal(
      await arrow.evaluate((el) => getComputedStyle(el).animationPlayState),
      "paused",
    );
  }

  const pages = ["", "under-the-hood/", "games/byte-runner/", "games/battlefield/", "archive/"];
  for (const width of [320, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base);
    if (width <= 760) {
      assert.equal(await menu.isVisible(), true);
      assert.equal(await page.locator(".header-panel").isVisible(), false);
      await menu.click();
      assert.equal(await menu.getAttribute("aria-expanded"), "true");
      assert.equal(
        await page.getByRole("link", { name: "Under the hood" }).isVisible(),
        true,
      );
      await page.keyboard.press("Escape");
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
      assert.equal(
        await menu.evaluate((el) => el === document.activeElement),
        true,
      );
      await menu.click();
      await page.getByRole("link", { name: "Under the hood" }).click();
      await page.waitForURL(/under-the-hood\/$/);
    }
    for (const theme of ["light", "dark"]) {
      await page.goto(base);
      if (width <= 760) await menu.click();
      await page.getByRole("button", { name: `Use ${theme} theme` }).click();
      if (width <= 760) {
        await page
          .locator(".site-header")
          .screenshot({ path: `${output}/menu-${width}-${theme}.png` });
        await page.keyboard.press("Escape");
      }
      for (const path of pages) {
        if (path) await page.goto(base + path);
        const overflow = await page.evaluate(() =>
          [...document.querySelectorAll("body *")]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return (
                r.right > innerWidth + 1 &&
                r.width > 0 &&
                getComputedStyle(el).position !== "fixed" &&
                !el.closest("pre,.budget-wrap")
              );
            })
            .map((el) => el.className)
            .filter((x) => typeof x === "string"),
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          `${width}/${theme}/${path || "home"} overflows: ${overflow}`,
        );
        if (!path)
          await page
            .locator(".hero-grid")
            .screenshot({ path: `${output}/hero-${width}-${theme}.png` });
        if (path === "under-the-hood/")
          await system.screenshot({
            path: `${output}/diagram-${width}-${theme}.png`,
          });
      }
    }
  }
  // Reduced motion: the hero game ends and the poster returns; diagrams stop.
  await page.goto(base);
  await promo.locator(".promo-stage").click({ position: { x: 240, y: 200 } });
  await page.waitForFunction(() => document.querySelector(".hero-crossover").dataset.play === "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => !document.querySelector(".hero-crossover").dataset.play);
  assert.equal(await page.locator(".hx-layer,.hx-foes").count(), 0, "reduced motion restores the poster");
  assert.equal(await promo.evaluate((el) => el.getAnimations({ subtree: true }).length), 0);
  await page.goto(base + "under-the-hood/");
  await system.scrollIntoViewIfNeeded();
  assert.equal(await system.locator(".motion-toggle").isVisible(), false);
  const running = await page
    .locator(".system-map,.tick-map,.ownership-map,.hero-crossover")
    .evaluateAll(
      (nodes) =>
        nodes.flatMap((el) => el.getAnimations({ subtree: true })).length,
    );
  assert.equal(running, 0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(base + "games/byte-runner/");
  await page.locator('[data-launch="byte-runner"]').click();
  await page.waitForFunction(
    () => document.querySelector("#session-state")?.textContent === "running",
  );
  assert.match(
    (await page.locator("#session-name").textContent()).trim(),
    /^Byte Runner(?: v[\d.]+)?$/,
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".session-bar").isVisible(), false);
  for (const width of [1200, 390])
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + "games/byte-runner/");
      if (width <= 760) await menu.click();
      await page.getByRole("button", { name: `Use ${theme} theme` }).click();
      if (width <= 760) {
        await page.keyboard.press("Escape");
        assert.ok(
          await page.locator(".game-section").evaluateAll((nodes) =>
            nodes.every((node) => {
              const r = node.getBoundingClientRect();
              return r.left >= 24 && innerWidth - r.right >= 24;
            }),
          ),
          "mobile cards retain useful page gutters",
        );
      }
      await page.locator('[data-launch="byte-runner"]').click();
      await page.waitForFunction(
        () =>
          document.querySelector("#session-state")?.textContent === "running",
      );
      await page.waitForTimeout(1100);
      await page.keyboard.press("KeyP");
      await page.waitForFunction(
        () =>
          document.querySelector("#session-state")?.textContent === "paused",
      );
      const guide = page.locator("[data-byte-guides]");
      assert.equal(await guide.count(), 1);
      assert.ok(
        (await guide.getAttribute("d")).length > 0,
        "actual hub has whitespace routes",
      );
      assert.ok(
        (await page.locator("[data-byte-pellet],[data-byte-power]").count()) >
          12,
        `usable food trail on hub ${width}/${theme}: ${await page.locator("[data-byte-pellet],[data-byte-power]").count()}`,
      );
      const clear = await guide.evaluate((path) => {
        const root = path.getRootNode().host.parentElement,
          matrix = path.getScreenCTM();
        const bounds = [];
        for (const el of root.querySelectorAll(
          "button,a[href],input,select,textarea,summary,img,svg,canvas,video,iframe,pre,table,hr,figure,fieldset,details,[data-byte-obstacle]",
        )) {
          const r = el.getBoundingClientRect();
          if (r.width && r.height) bounds.push(r);
        }
        const walker = document.createTreeWalker(root, 4),
          range = document.createRange();
        let node;
        while ((node = walker.nextNode())) {
          if (
            !node.textContent.trim() ||
            node.parentElement.closest(
              "script,style,noscript,svg,button,a[href],textarea,pre,table",
            )
          )
            continue;
          range.selectNodeContents(node);
          bounds.push(...range.getClientRects());
        }
        const collisions = [],
          radius = Number(path.getAttribute("stroke-width")) / 2;
        for (const segment of path.getAttribute("d").match(/M[^M]+/g) || []) {
          const [x, y, bx, by] = segment.match(/[-\d.]+/g).map(Number),
            a = new DOMPoint(x, y).matrixTransform(matrix),
            b = new DOMPoint(bx, by).matrixTransform(matrix);
          if (
            bounds.some(
              (r) =>
                Math.max(a.x, b.x) + radius > r.left &&
                Math.min(a.x, b.x) - radius < r.right &&
                Math.max(a.y, b.y) + radius > r.top &&
                Math.min(a.y, b.y) - radius < r.bottom,
            )
          )
            collisions.push(segment);
        }
        return collisions;
      });
      assert.deepEqual(
        clear,
        [],
        `hub ${width}/${theme} guide edges avoid native content`,
      );
      await page.screenshot({
        path: `${output}/byte-trails-${width}-${theme}.png`,
      });
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("[data-byte-trails]").count(), 0);
    }
  // The Battlefield is a separate static app under the hub, not a bundled game mode.
  await page.goto(base + "battlefield/");
  await page.waitForFunction(() => !!window.battlefield);
  assert.equal(await page.locator(".bf-mission").count(), 4);
  await page.locator("#bf-deploy").click();
  assert.ok(await page.evaluate(() => window.battlefield.playing));
  await page.locator("[data-order=follow]").click();
  assert.ok(await page.evaluate(() => window.battlefield.snapshot().units.filter(u => u.side === 0 && u.id !== 0).every(u => u.order === "follow")));
  await page.locator("#bf-pause").click();
  assert.ok(await page.evaluate(() => window.battlefield.paused));
  // Narrow/touch layouts keep secondary actions in the slide-out panel.
  if (await page.locator("#bf-squad").isVisible()) await page.locator("#bf-squad").click();
  await page.locator("#bf-restart").click();
  assert.equal(await page.evaluate(() => window.battlefield.playing), false);
  assert.deepEqual(errors, []);
  console.log(
    "Site: responsive navigation, both themes, SVG controls, syntax colors, exact clipboard, animation pause/visibility/reduced motion, and launcher passed.",
  );
  // Touch devices: the demo page is a game board (no zoom, no selection or copy callouts).
  {
    const touch = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await touch.goto(base);
    const policy = await touch.evaluate(() => ({
      touch: getComputedStyle(document.documentElement).touchAction,
      select: getComputedStyle(document.querySelector("h1")).userSelect,
      gesture: (() => { const e = new Event("gesturestart", { cancelable: true }); document.dispatchEvent(e); return e.defaultPrevented; })(),
    }));
    assert.deepEqual(policy, { touch: "pan-x pan-y", select: "none", gesture: true });
    await touch.close();
  }
} catch (e) {
  // CI annotation: readable from the checks API even when log downloads are not.
  console.log(`::error title=Site browser test::${String(e.stack || e).split("\n").slice(0, 5).join(" | ").slice(0, 900)}`);
  throw e;
} finally {
  await browser.close();
  server.close();
}
