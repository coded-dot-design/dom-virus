import { checkNativeOwnership } from './native-ownership.mjs';
import { checkMobileControls } from "./mobile-controls.mjs";
import { createServer } from "vite";
import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { checkAttachedEffects } from "./attached-effects.mjs";
import { checkDomMutations } from "./dom-mutations.mjs";
import { checkShooterFeedback } from "./shooter-feedback.mjs";
import { gameRoot } from "../scripts/game-paths.mjs";
const sourcePath = (name) => resolve(gameRoot(name), "src/simulation.ts");
const sourceURLs = {
  board: "/@fs" + resolve("src/board.ts"),
  shooter: "/@fs" + sourcePath("null-invaders"),
  runner: "/@fs" + sourcePath("byte-runner"),
};
mkdirSync("artifacts", { recursive: true });
const server = await createServer({
  configFile: "vite.config.js",
  server: { port: 5199, host: "127.0.0.1" },
});
await server.listen();
const executablePath =
  process.env.CHROMIUM_PATH ||
  (existsSync("/tmp/chromium") ? "/tmp/chromium" : undefined);
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "dark",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://127.0.0.1:5199");
  await page.screenshot({
    path: "artifacts/playground-dark.png",
    fullPage: true,
  });
  await page.click("#launch");
  await page.waitForTimeout(150);
  assert.equal(
    (await page.evaluate(() => window.playground.getSnapshot())).status,
    "running",
  );
  await page.evaluate(() => document.querySelector(".hero").scrollIntoView());
  await page.waitForTimeout(250);
  await page.keyboard.down("Space");
  await page.waitForTimeout(600);
  await page.keyboard.up("Space");
  console.log(
    "shooter",
    await page.evaluate(() => window.playground.getSnapshot()),
  );
  await page.screenshot({ path: "artifacts/null-invaders.png" });
  await page.keyboard.press("KeyP");
  const paused = await page.evaluate(
    () => window.playground.getSnapshot().elapsed,
  );
  await page.waitForTimeout(150);
  assert.equal(
    await page.evaluate(() => window.playground.getSnapshot().elapsed),
    paused,
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("[data-dom-virus-root]").count(), 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('[data-game="byte-runner"]');
  await page.click("#launch");
  await page.waitForTimeout(100);
  await page.evaluate(() => document.querySelector(".hero").scrollIntoView());
  await page.waitForTimeout(150);
  const before = await page.evaluate(
    () => window.playground.getSnapshot().player.x,
  );
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(200);
  await page.keyboard.up("ArrowRight");
  const after = await page.evaluate(
    () => window.playground.getSnapshot().player.x,
  );
  assert.ok(after > before);
  await page.screenshot({ path: "artifacts/byte-runner.png" });
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('[data-game="sherman-bytes"]');
  await page.click("#launch");
  await page.waitForTimeout(150);
  assert.equal(
    (await page.evaluate(() => window.playground.getSnapshot())).status,
    "running",
  );
  // HUD actions must release focus so subsequent keys still drive the tank.
  await page.locator('[data-dom-virus-root] [data-action="fire"]').click();
  assert.equal(
    await page.evaluate(() => document.activeElement === document.body),
    true,
  );
  const tankBefore = await page.evaluate(
    () => window.playground.getSnapshot().player,
  );
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(200);
  await page.keyboard.up("ArrowRight");
  const tankAfter = await page.evaluate(
    () => window.playground.getSnapshot().player,
  );
  assert.ok(
    tankAfter.angle > tankBefore.angle,
    "Sherman responds to steering after using HUD auto fire",
  );
  await page.locator('[data-dom-virus-root] [data-action="exit"]').click();
  assert.equal(await page.locator("[data-dom-virus-root]").count(), 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('[data-game="swarm-protocol"]');
  await page.click("#launch");
  await page.waitForTimeout(500);
  assert.equal(
    (await page.evaluate(() => window.playground.getSnapshot())).status,
    "running",
  );
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.playground.recall());
  assert.equal(await page.locator("[data-dom-virus-root]").count(), 0);
  await checkShooterFeedback(page);
  await checkDomMutations(page);
  await checkMobileControls(page, "/@fs" + resolve("src/runtime.ts"));
  await checkAttachedEffects(page);
  await page.emulateMedia({ colorScheme: "light" });
  await page.screenshot({
    path: "artifacts/playground-light.png",
    fullPage: true,
  });
  const checks = await page.evaluate(async (urls) => {
    const { createBoard } = await import(urls.board);
    const root = document.createElement("div");
    root.style.cssText =
      "position:fixed;left:20px;top:20px;background:white;color:black;width:500px;z-index:100";
    root.innerHTML =
      '<h2>Alpha beta</h2><p>Gamma delta</p><button>Factory</button><form><p>Protected text</p><button>Protected control</button></form><p data-virus-ignore>Excluded</p><div id="clip" style="height:40px;overflow:hidden"><p style="margin-top:100px">Clipped text</p><button>Clipped gate</button></div>';
    document.body.append(root);
    const b = createBoard(document, { root });
    b.measure(0, true);
    const first = b.glyphs.find((g) => g.char === "A");
    const original = root.querySelector("h2").textContent;
    const node = root.querySelector("h2").firstChild;
    const result = {
      defaultTargets: b.targets.length,
      protectedExcluded: !b.glyphs.some((g) =>
        g.record.node.parentElement.closest("form,[data-virus-ignore]"),
      ),
      clippedExcluded: !b.glyphs.some((g) =>
        g.record.node.parentElement.closest("#clip"),
      ),
      clippedGateHidden:
        b.targets.find((t) => t.element.parentElement.id === "clip").visible ===
        false,
    };
    result.firstConsume = b.consume(first);
    result.repeatConsume = b.consume(first);
    result.actualTextChanged = /^[01]lpha beta$/.test(node.nodeValue);
    result.sameTextNode = root.querySelector("h2").firstChild === node;
    result.noReplacementOverlay = root.querySelector("h2").childElementCount === 0;
    result.nativeBitPaint = CSS.highlights.size === 1 && [...[...CSS.highlights.values()][0]][0].startContainer === node;
    root.querySelector("button").style.opacity = ".8";
    b.damage(b.targets[0], 50);
    root.querySelector("button").style.opacity = ".95";
    b.destroy();
    result.stylePreserved =
      Number(root.querySelector("button").style.opacity) === 0.95;
    result.highlightsClean = CSS.highlights.size === 0;
    result.defaultRestored = node.nodeValue === original;
    const direct = createBoard(document, { root, domMode: "text" });
    direct.measure(0, true);
    direct.consume(direct.glyphs.find((g) => g.char === "A"));
    result.directChanged = node.nodeValue !== original;
    direct.destroy();
    result.directRestored = node.nodeValue === original;
    const host = createBoard(document, { root, domMode: "text" });
    host.measure(0, true);
    host.consume(host.glyphs.find((g) => g.char === "A"));
    node.nodeValue = "Host owns the latest value";
    host.destroy();
    result.hostPreserved = node.nodeValue === "Host owns the latest value";
    root.remove();
    return result;
  }, sourceURLs);
  assert.equal(checks.defaultTargets, 2);
  assert.equal(checks.repeatConsume, false);
  for (const [key, value] of Object.entries(checks))
    if (!["defaultTargets", "repeatConsume"].includes(key))
      assert.equal(value, true, key);
  console.log("DOM behavior", checks);
  const simulation = await page.evaluate(async (urls) => {
    const { createGame: createShooter } = await import(urls.shooter);
    const { createGame: createRunner } = await import(urls.runner);
    const make = () => ({
      width: 1000,
      height: 800,
      time: 0,
      options: {},
      input: {},
      random: () => 0,
      reducedMotion: true,
      firing: false,
      emit() {},
      burst() {},
      popup() {},
      move() {},
      finish(won) {
        this.finished = won ? "won" : "lost";
      },
      board: {
        targets: [],
        resetTargets(h) {
          for (const t of this.targets) {
            t.health = t.maxHealth = h;
          }
        },
        hitSegment() {
          return null;
        },
        near() {
          return [];
        },
        consume(g) {
          if (g.spent) return false;
          g.spent = true;
          return true;
        },
        damage(t, n) {
          t.health = Math.max(0, t.health - n);
        },
      },
    });
    const a = make(),
      s = createShooter(a);
    s.reset();
    for (let i = 0; i < 300; i++) {
      a.time += 0.1;
      s.update(0.1);
    }
    const enemyCap = s.snapshot().alive;
    // A cleared button remains dead within its wave and reactivates for the next wave.
    const c = make();
    c.board.targets = [{ health: 1, maxHealth: 1, visible: false }];
    const clear = createShooter(c);
    clear.reset();
    c.board.targets[0].health = 0;
    clear.update(0.01);
    clear.update(2.1);
    const advanced =
      clear.snapshot().wave === 2 && c.board.targets[0].health > 0;
    for (let wave = 2; wave <= 4; wave++) {
      c.board.targets[0].health = 0;
      clear.update(0.01);
      clear.update(2.1);
    }
    const victory = c.finished === "won";
    const r = make();
    r.board.targets = [
      {
        id: "runner-gate",
        health: 100,
        maxHealth: 100,
        visible: true,
        rect: {
          left: 20,
          right: 80,
          top: 20,
          bottom: 50,
          width: 60,
          height: 30,
        },
      },
    ];
    const runner = createRunner(r);
    runner.reset();
    const glyphs = Array.from({ length: 6 }, () => ({
      spent: false,
      rect: { left: 0, top: 0, width: 10, height: 10 },
    }));
    r.board.near = () => glyphs;
    runner.update(0.01);
    const orb =
      runner.snapshot().pickups === 1 && runner.snapshot().eaten === 6;
    r.move = (p) => {
      p.x = 520;
      p.y = 360;
    };
    runner.update(0.01);
    const powered =
      runner.snapshot().power > 0 && r.board.targets[0].health === 0;
    const count = runner.snapshot().alive;
    for (let i = 0; i < 20; i++) runner.update(0.1);
    const halted = runner.snapshot().alive === count;
    r.move = () => {};
    for (let i = 0; i < 50; i++) runner.update(0.1);
    const resumed =
      runner.snapshot().alive > 0 && runner.snapshot().power === 0;
    return { enemyCap, advanced, victory, orb, powered, halted, resumed };
  }, sourceURLs);
  assert.ok(simulation.enemyCap <= 48);
  for (const [key, value] of Object.entries(simulation))
    if (key !== "enemyCap") assert.equal(value, true, key);
  console.log("Game simulation", simulation);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('[data-game="null-invaders"]');
  await page.click("#launch");
  await page.evaluate(() => document.querySelector(".hero").scrollIntoView());
  await page.keyboard.down("Space");
  const perf = [];
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(100);
    perf.push(await page.evaluate(() => window.playground.getSnapshot()));
  }
  await page.keyboard.up("Space");
  const frameTimes = perf.map((s) => s.frameMs).sort((a, b) => a - b);
  const metrics = {
    samples: frameTimes.length,
    p50FrameWorkMs: frameTimes[Math.floor(frameTimes.length * 0.5)],
    p95FrameWorkMs: frameTimes[Math.floor(frameTimes.length * 0.95)],
    maxObservedFrameWorkMs: Math.max(...perf.map((s) => s.maxFrameMs)),
    maxGlyphMeasurements: Math.max(...perf.map((s) => s.board.measurements)),
    maxParticles: Math.max(...perf.map((s) => s.particles)),
  };
  assert.ok(metrics.maxGlyphMeasurements <= 900);
  assert.ok(metrics.maxParticles <= 100);
  writeFileSync(
    "artifacts/browser-metrics.json",
    JSON.stringify(metrics, null, 2),
  );
  console.log("Frame sample (headless, not a hardware guarantee)", metrics);
  await page.keyboard.press("Escape");
  // Repeated mount/recall should leave no overlay or global highlight entries.
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.playground.launch());
    await page.keyboard.press("Escape");
  }
  assert.equal(await page.locator("[data-dom-virus-root]").count(), 0);
  assert.equal(await page.evaluate(() => CSS.highlights.size), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.screenshot({
    path: "artifacts/playground-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  // Real React StrictMode mounts, effect replays, option changes and cleanup.
  await page.goto(
    "http://127.0.0.1:5199/@fs" + resolve("tests/react-fixture.html"),
  );
  await page.waitForFunction(() => Boolean(window.reactFixture));
  await page.evaluate(() => window.reactFixture.render(true));
  await page.waitForFunction(
    () => document.querySelectorAll("[data-dom-virus-root]").length === 1,
  );
  const starts = await page.evaluate(
    () =>
      window.reactFixture.events.filter((event) => event === "start").length,
  );
  assert.ok(starts >= 2, "StrictMode replays the mounting effect");
  await page.evaluate(() => window.reactFixture.render(true));
  await page.waitForTimeout(100);
  assert.equal(
    await page.evaluate(
      () =>
        window.reactFixture.events.filter((event) => event === "start").length,
    ),
    starts,
  );
  await page.evaluate(() => window.reactFixture.render(true, false, true));
  await page.waitForFunction(
    (before) =>
      window.reactFixture.events.filter((event) => event === "start").length >
      before,
    starts,
  );
  assert.equal(await page.locator("[data-dom-virus-root]").count(), 1);
  await page.evaluate(() => window.reactFixture.render(false));
  await page.waitForFunction(
    () => document.querySelectorAll("[data-dom-virus-root]").length === 0,
  );
  assert.equal(await page.evaluate(() => CSS.highlights.size), 0);
  await page.evaluate(() => window.reactFixture.render(true, true));
  await page.waitForFunction(
    () =>
      document.querySelector("[data-dom-virus-root]")?.dataset.domVirusRoot ===
      "byte-runner",
  );
  await page.evaluate(() => window.reactFixture.unmount());
  assert.equal(await page.locator("[data-dom-virus-root]").count(), 0);
  assert.equal(await page.evaluate(() => CSS.highlights.size), 0);
  assert.equal(
    await page.locator("#board h1").textContent(),
    "React owns these letters",
  );
  console.log(
    "React StrictMode, stable options, option changes, active toggle and unmount checks passed.",
  );
  const capabilityChecks = await page.evaluate(
    async (url) => {
      const { createArcade } = await import(url);
      const events = [];
      let actions = 0;
      const make = (fire) =>
        createArcade(
          {
            id: "capability-probe",
            title: "Probe",
            color: "#fff",
            hint: "Test",
            capabilities: { fire },
            actions: [{ id: "build", key: "KeyB", label: "Build probe" }],
            create(api) {
              return {
                reset() {
                  api.emit("probe", { type: 123, game: 123 });
                },
                update() {},
                draw() {},
                action(id) {
                  if (id === "build") actions++;
                },
                snapshot: () => ({ score: 0, firing: api.firing }),
              };
            },
          },
          { root: "#board", onEvent: (event) => events.push(event) },
        );
      const shoot = make(true);
      shoot.start();
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: 0,
        }),
      );
      const firing = shoot.getSnapshot().firing;
      const host = document.querySelector("[data-dom-virus-root]");
      const command = host.shadowRoot.querySelector(".game-commands button");
      command.click();
      const actionButton =
        actions === 1 && document.activeElement === document.body;
      document.body.dispatchEvent(
        new KeyboardEvent("keydown", {
          code: "KeyB",
          bubbles: true,
          cancelable: true,
        }),
      );
      document.body.dispatchEvent(
        new KeyboardEvent("keydown", {
          code: "KeyB",
          repeat: true,
          bubbles: true,
          cancelable: true,
        }),
      );
      const actionKey = actions === 2;
      const input = document.createElement("input");
      document.body.append(input);
      input.focus();
      input.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyB", bubbles: true }),
      );
      const actionTyping = actions === 2;
      input.remove();
      shoot.pause();
      command.click();
      document.body.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyB", bubbles: true }),
      );
      const actionPause = actions === 2;
      shoot.resume();
      const button = document.querySelector("#board button");
      const suppressed = !button.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }),
      );
      shoot.destroy();
      const walk = make(false);
      walk.start();
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          cancelable: true,
          button: 0,
        }),
      );
      const notFiring = !walk.getSnapshot().firing;
      const pageClickable = button.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 }),
      );
      walk.destroy();
      const event = events.find((event) => event.type === "probe");
      return {
        firing,
        suppressed,
        actionButton,
        actionKey,
        actionTyping,
        actionPause,
        notFiring,
        pageClickable,
        eventIdentity: event?.game === "capability-probe",
      };
    },
    "/@fs" + resolve("src/index.ts"),
  );
  for (const [key, value] of Object.entries(capabilityChecks))
    assert.equal(value, true, key);
  console.log("Game capabilities work without a game-specific ID.");
  await checkNativeOwnership(page);
  assert.deepEqual(errors, []);
  console.log("Browser smoke checks passed.");
} finally {
  await browser.close();
  await server.close();
}
