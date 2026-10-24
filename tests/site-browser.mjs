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
  assert.deepEqual(
    await page
      .locator(".game-tab")
      .evaluateAll((nodes) => nodes.map((n) => n.hash)),
    ["#sherman-bytes", "#swarm-protocol", "#byte-runner", "#null-invaders"],
  );
  assert.deepEqual(
    await page
      .locator(".game-section")
      .evaluateAll((nodes) => nodes.map((n) => n.id)),
    ["sherman-bytes", "swarm-protocol", "byte-runner", "null-invaders"],
  );
  const promo = page.locator(".hero-crossover");
  assert.equal(await promo.locator(".promo-character,.character-icon").count(), 7);
  assert.equal(await promo.locator(".promo-frog").count(), 0);
  assert.equal(await promo.locator(".promo-fly").count(), 2);
  assert.equal(await promo.locator(".ship-shot,.tank-shot").count(), 2);
  for (const selector of [".hero", ".engineering", ".embed-section"]) {
    assert.deepEqual(await page.locator(selector).evaluate(el=>{const s=getComputedStyle(el);return [s.borderTopWidth,s.borderRightWidth,s.boxShadow]}), ["0px","0px","none"]);
  }
  await promo.getByRole("button", { name: "Pause scene animation" }).click();
  assert.equal(await promo.getAttribute("data-motion"), "false");
  await promo.getByRole("button", { name: "Resume scene animation" }).click();
  await promo.evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=1550}));
  assert.ok(Number(await promo.locator('.ship-impact').evaluate(el=>getComputedStyle(el).opacity))>.5);
  await promo.evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>a.currentTime=3700));
  assert.ok(Number(await promo.locator('.tank-impact').evaluate(el=>getComputedStyle(el).opacity))>.5);
  await promo.evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>a.play()));
  assert.equal(await page.locator(".game-tab .directory-arrow").count(), 4);
  assert.equal(await page.locator(".code-example .astro-code").count(), 4);
  assert.equal(await menu.isVisible(), false);
  assert.equal(await page.locator(".site-header nav a").count(), 3);

  for (const theme of ["dark", "light"]) {
    await page.getByRole("button", { name: `Use ${theme} theme` }).click();
    await promo.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      () => document.querySelector(".hero-crossover").dataset.motion === "true",
    );
    await page
      .locator(".hero-grid")
      .screenshot({ path: `${output}/hero-${theme}.png` });
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

  for (const width of [320, 390, 430, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
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
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
    }
    for (const theme of ["light", "dark"]) {
      await page.evaluate(() => scrollTo(0, 0));
      if (width <= 760) await menu.click();
      await page.getByRole("button", { name: `Use ${theme} theme` }).click();
      if (width <= 760) {
        await page
          .locator(".site-header")
          .screenshot({ path: `${output}/menu-${width}-${theme}.png` });
        await page.keyboard.press("Escape");
      }
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
        `${width}/${theme} overflows: ${overflow}`,
      );
      await page
        .locator(".hero-grid")
        .screenshot({ path: `${output}/hero-${width}-${theme}.png` });
      await system.screenshot({
        path: `${output}/diagram-${width}-${theme}.png`,
      });
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
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
      await page.evaluate(() => scrollTo(0, 0));
      if (width <= 760) await menu.click();
      await page.getByRole("button", { name: `Use ${theme} theme` }).click();
      if (width <= 760) await page.keyboard.press("Escape");
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
  assert.deepEqual(errors, []);
  console.log(
    "Site: responsive navigation, both themes, SVG controls, syntax colors, exact clipboard, animation pause/visibility/reduced motion, and launcher passed.",
  );
} finally {
  await browser.close();
  server.close();
}
