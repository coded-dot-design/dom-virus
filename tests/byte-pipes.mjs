import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium } from "playwright";
import { resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { gameRoot } from "../scripts/game-paths.mjs";
const server = await createServer({
  configFile: "vite.config.js",
  server: { host: "127.0.0.1", port: 5221 },
});
await server.listen();
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/tmp/chromium") ? "/tmp/chromium" : undefined),
  args: ["--no-sandbox"],
});
const urls = {
  simulation: "/@fs" + resolve(gameRoot("byte-runner"), "src/simulation.ts"),
  index: "/@fs" + resolve(gameRoot("byte-runner"), "src/index.ts"),
  board: "/@fs" + resolve("src/board.ts"),
};
mkdirSync("artifacts/byte-pipes", { recursive: true });
try {
  for (const mobile of [false, true])
    for (const dark of [false, true]) {
      const page = await browser.newPage({
        viewport: mobile
          ? { width: 390, height: 844 }
          : { width: 1200, height: 900 },
        hasTouch: mobile,
        isMobile: mobile,
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("http://127.0.0.1:5221");
      await page.setContent(
        `<style>body{margin:0;background:${dark ? "#141824" : "#f5f7f5"};color:${dark ? "#eff6f1" : "#182b25"};font:18px system-ui}main{position:relative;height:1600px;padding:28px}h1{max-width:400px;font-size:30px}p{max-width:280px;line-height:1.6}button{padding:12px;background:#74dfa1;border:0}#drift{position:absolute;top:300px;left:35%;width:80px;height:40px;background:#c6aff5}</style><main><h1>PIPE RUNNER</h1><p>Catch the trail. Jump the gap. Hunt the flies.</p><button>Native button</button><div id=drift role=img></div></main>`,
      );
      const proof = await page.evaluate(
        async ({ urls, dark }) => {
          const { createBoard } = await import(urls.board),
            { createGame } = await import(urls.simulation);
          const root = document.querySelector("main"),
            board = createBoard(document, { root });
          board.measure(0, true);
          const events = [];
          let randomSeed = 12;
          const api = {
            board,
            options: { root, document, theme: dark ? "dark" : "light" },
            input: {
              keys: new Set(),
              mode: "keyboard",
              pointer: { active: false, x: 0, y: 0 },
            },
            width: innerWidth,
            height: innerHeight,
            time: 0,
            random: () => {
              randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0;
              return randomSeed / 4294967296;
            },
            reducedMotion: false,
            emit: (type, data) => events.push({ type, ...data }),
            burst() {},
            popup() {},
            finish() {},
          };
          const game = createGame(api);
          game.reset();
          game.draw();
          const svg = root
            .querySelector("dom-virus-attachment")
            .shadowRoot.querySelector("svg");
          const runner = svg.querySelector("[data-byte-runner]"),
            guide = svg.querySelector("[data-byte-guides]");
          const tick = (key = "", dt = 0.025) => {
            api.input.keys = new Set(key ? [key] : []);
            api.time += dt;
            game.update(dt);
            game.draw();
          };
          const pos = (n) => {
            const m = n
              .getAttribute("transform")
              .match(/translate\(([-\d.]+)[ ,]([-\d.]+)\)/);
            return { x: +m[1], y: +m[2] };
          };
          const edges = () =>
            guide
              .getAttribute("d")
              .match(/M[^M]+/g)
              .map((s) => s.match(/[-\d.]+/g).map(Number));
          const distance = (p) =>
            Math.min(
              ...edges().map(([x, y, bx, by]) => {
                const t = Math.max(
                  0,
                  Math.min(
                    1,
                    ((p.x - x) * (bx - x) + (p.y - y) * (by - y)) /
                      ((bx - x) ** 2 + (by - y) ** 2),
                  ),
                );
                return Math.hypot(
                  p.x - x - (bx - x) * t,
                  p.y - y - (by - y) * t,
                );
              }),
            );
          const initial = guide.getAttribute("d"),
            pellet = svg.querySelector("[data-byte-pellet]");
          document.querySelector("#drift").style.transform = "translateX(25px)";
          for (let i = 0; i < 24; i++) tick();
          const stableMaze =
            initial === guide.getAttribute("d") &&
            pellet.isConnected &&
            !events.some((e) => e.type === "maze-reflow");
          const opacity = new Set(
            [...svg.querySelectorAll("[data-byte-pellet]")].map((n) =>
              n.getAttribute("opacity"),
            ),
          );
          const ring = svg.querySelector("[data-pulse]"),
            pulseBefore = ring.getAttribute("transform");
          tick("", 0.2);
          const pulse = pulseBefore !== ring.getAttribute("transform");
          let locked = true,
            moved = 0;
          const start = pos(runner);
          for (const key of [
            "ArrowRight",
            "ArrowDown",
            "ArrowLeft",
            "ArrowUp",
          ]) {
            tick("", 0.3); // Avoid intentional double taps in this pipe-only test.
            for (let i = 0; i < 16; i++) {
              tick(key);
              locked &&= distance(pos(runner)) < 0.03;
              moved += Math.hypot(
                pos(runner).x - start.x,
                pos(runner).y - start.y,
              );
            }
          }
          tick("", 0.3);
          const still = pos(runner);
          tick("", 0.1);
          const idle =
            JSON.stringify(still) === JSON.stringify(pos(runner)) &&
            svg.querySelector("[data-byte-feet]").dataset.frame === "0";
          // Explicit action works at any point along an edge, with a visible airborne state.
          api.input.keys = new Set(["ArrowRight"]);
          game.action("jump");
          tick("ArrowRight");
          const jump = runner.dataset.jumping === "true";
          let escaped = false;
          for (let i = 0; i < 8; i++) {
            tick("ArrowRight");
            escaped ||= distance(pos(runner)) > 11;
          }
          // Release then repeat the same direction to jump; holding alone is not a double tap.
          tick("", 0.3);
          tick("ArrowDown");
          tick("");
          tick("ArrowDown");
          const doubleTap = runner.dataset.jumping === "true";
          for (let i = 0; i < 20; i++) tick("ArrowDown");
          const heldDoesNotRepeat = runner.dataset.jumping === "false";
          // Stable layouts while characters and page elements move; explicit refresh is the boundary.
          game.action("refresh");
          game.draw();
          const refresh =
            events.some((e) => e.type === "maze-reflow") && !pellet.isConnected;
          let viewport = true,
            flyEscaped = false,
            maxFlies = 0;
          for (let i = 0; i < 560; i++) {
            tick();
            const flies = [...svg.querySelectorAll("[data-byte-fly]")];
            maxFlies = Math.max(maxFlies, flies.length);
            for (const fly of flies) {
              const p = pos(fly);
              viewport &&=
                p.x >= 0 && p.x <= innerWidth && p.y >= 0 && p.y <= innerHeight;
              flyEscaped ||= distance(p) > 1;
            }
          }
          api.reducedMotion = true;
          game.draw();
          const food = svg.querySelector("[data-byte-food]").innerHTML;
          for (let i = 0; i < 10; i++) {
            api.time += 0.1;
            game.draw();
          }
          const reduced =
            food === svg.querySelector("[data-byte-food]").innerHTML;
          const count = svg.querySelectorAll("*").length;
          for (let i = 0; i < 4; i++) {
            game.reset();
            game.draw();
          }
          const bounded =
            svg.querySelectorAll("*").length <= count + 60 &&
            root.querySelectorAll("dom-virus-attachment").length === 1;
          window.pipeQA = { api, game, board, svg, tick };
          return {
            stableMaze,
            twinkle: opacity.size > 1,
            pulse,
            locked,
            moved: moved > 50,
            idle,
            jump,
            escaped,
            doubleTap,
            heldDoesNotRepeat,
            refresh,
            viewport,
            flyEscaped,
            maxFlies,
            reduced,
            bounded,
          };
        },
        { urls, dark },
      );
      console.log({ mobile, dark, ...proof });
      for (const [key, value] of Object.entries(proof))
        if (key !== "maxFlies") assert.equal(value, true, key);
      assert.ok(proof.maxFlies >= 7, "larger fly population");
      await page.screenshot({
        path: `artifacts/byte-pipes/${mobile ? "mobile" : "desktop"}-${dark ? "dark" : "light"}.png`,
      });
      await page.evaluate(() => {
        window.pipeQA.board.destroy();
        delete window.pipeQA;
      });
      // Test real event routing: Space must not scroll, and mobile gets both actions.
      await page.evaluate(async (u) => {
        const { createByteRunner } = await import(u.index);
        window.live = createByteRunner({
          root: document.querySelector("main"),
          seed: 12,
        });
        window.live.start();
      }, urls);
      const y = await page.evaluate(() => scrollY);
      await page.keyboard.press("Space");
      await page.waitForTimeout(50);
      assert.equal(await page.evaluate(() => scrollY), y);
      assert.equal(
        await page.locator("[data-byte-runner]").getAttribute("data-jumping"),
        "true",
      );
      if (mobile) {
        await page.locator(".touch [data-ability=jump]").click();
        assert.ok(
          await page.locator(".touch [data-ability=refresh]").isVisible(),
        );
      }
      await page.evaluate(() => window.live.pause());
      const frozen = await page.locator("[data-byte-food]").innerHTML();
      await page.waitForTimeout(180);
      assert.equal(await page.locator("[data-byte-food]").innerHTML(), frozen);
      await page.evaluate(() => {
        window.live.resume();
        window.live.destroy();
      });
      assert.equal(await page.locator("[data-byte-trails]").count(), 0);
      assert.deepEqual(errors, []);
      await page.close();
    }
} finally {
  await browser.close();
  await server.close();
}
