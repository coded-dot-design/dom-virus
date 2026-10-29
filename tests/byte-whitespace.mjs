import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium } from "playwright";
import { resolve } from "node:path";
import { mkdirSync, existsSync } from "node:fs";
import { coreGameRoot as gameRoot } from "../scripts/game-paths.mjs";
const server = await createServer({
  configFile: "vite.config.js",
  server: { host: "127.0.0.1", port: 5216 },
});
await server.listen();
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/tmp/chromium") ? "/tmp/chromium" : undefined),
  args: ["--no-sandbox"],
});
const urls = Object.fromEntries(
  ["maze", "presentation", "simulation"].map((n) => [
    n,
    "/@fs" + resolve(gameRoot("byte-runner"), "src", n + ".ts"),
  ]),
);
urls.board = "/@fs" + resolve("src/board.ts");
urls.math = "/@fs" + resolve("src/math.ts");
mkdirSync("artifacts/byte-whitespace", { recursive: true });
try {
  for (const mobile of [false, true])
    for (const dark of [false, true]) {
      const page = await browser.newPage({
          viewport: mobile
            ? { width: 390, height: 844 }
            : { width: 1200, height: 900 },
          hasTouch: mobile,
          isMobile: mobile,
          colorScheme: dark ? "dark" : "light",
        }),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("http://127.0.0.1:5216");
      await page.setContent(
        `<style>*{box-sizing:border-box}body{margin:0;background:${dark ? "#100b1d" : "#f6f7f8"};color:${dark ? "#eee8ff" : "#20192f"};font:16px/1.5 system-ui}main{position:relative;min-height:1800px;padding:48px 40px;max-width:1100px;margin:auto}h1{font-size:40px;line-height:1.1;margin:0 0 20px;max-width:650px}p{max-width:580px;margin:0 0 44px}h2{font-size:24px;margin:0 0 12px}.row{display:flex;gap:24px;margin:36px 0 56px;align-items:center;flex-wrap:wrap}button,input{padding:15px;background:${dark ? "#261c38" : "white"};color:inherit;border:1px solid #8573ee;border-radius:4px;font:inherit}button{background:#f4457a;color:#170b20;box-shadow:4px 4px #8573ee}svg{background:#b1a1e822;border-radius:8px}.foot{margin-top:56px}@media(max-width:500px){main{padding:36px 28px}h1{font-size:32px}.row{gap:20px}p{margin-bottom:40px}input{width:180px}}</style><main><h1>The page is the playground.</h1><p>Follow the food through open space. Take a detour to eat the real page, then find your way back to the trail.</p><div class=row><button>Unmarked button</button><input aria-label='Untouched input' placeholder='Native input'></div><h2>Go off the trail.</h2><p>The frog can roam. Flies follow the soft edges around the words and controls.</p><div class=row><svg width=130 height=80 viewBox='0 0 130 80' role=img aria-label='Native illustration'><path d='M25 55 50 25 74 53 103 17' stroke='#8573ee' stroke-width=6 fill=none/></svg><span>Non-edible text still needs room.</span></div><p class=foot>Scroll naturally. The DOM carries the trails with it.</p></main>`,
      );
      const result = await page.evaluate(
        async ({ u, dark }) => {
          const { createBoard } = await import(u.board),
            { createPresentation } = await import(u.presentation),
            { makeMaze, blocked, TRAIL_CLEARANCE } = await import(u.maze),
            { createGame } = await import(u.simulation);
          const root = document.querySelector("main");
          let board = createBoard(document, { root, textSelector: "h1,h2,p" });
          board.measure(0, true);
          const api = {
            board,
            options: { root, document, theme: dark ? "dark" : "light" },
            input: {
              keys: new Set(),
              mode: "keyboard",
              pointer: { active: false, x: 0, y: 0 },
              fire: false,
            },
            width: innerWidth,
            height: innerHeight,
            time: 0,
            random: () => 0.62,
            reducedMotion: false,
            emit() {},
            burst() {},
            popup() {},
            move() {},
            finish() {},
          };
          const view = createPresentation(api),
            frame = view.measure();
          let seed = Math.floor(0.62 * 0x7fffffff) + 7919;
          const random = () => {
            seed |= 0;
            seed = (seed + 0x6d2b79f5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
          };
          // Graph layout is seed-independent except for choosing a first nearby text run.
          const maze = makeMaze(
            frame.width,
            frame.height,
            frame.walls,
            random,
            frame.text,
          );
          const obstacles = [...frame.walls, ...frame.text];
          let clear = true;
          for (const a of maze.cells)
            for (const id of a.exits)
              clear &&= !blocked(a, maze.cells[id], obstacles, maze.clearance);
          const unmarked = root.querySelector("button").getBoundingClientRect(),
            nativeButton = frame.walls.some(
              (w) =>
                Math.abs(w.left - (unmarked.left - frame.left) / frame.scaleX) <
                1,
            );
          const label = root.querySelector(".row span").getBoundingClientRect(),
            nativeLabel = frame.text.some(
              (w) =>
                Math.abs(w.left - (label.left - frame.left) / frame.scaleX) < 1,
            );
          board.destroy();
          board = createBoard(document, { root, textSelector: "h1,h2,p" });
          board.measure(0, true);
          api.board = board;
          const game = createGame(api);
          game.reset();
          game.draw();
          const svg = root
            .querySelector("dom-virus-attachment")
            .shadowRoot.querySelector("[data-byte-trails]");
          const edges = svg
            .querySelector("[data-byte-guides]")
            .getAttribute("d")
            .match(/M[^M]+/g)
            .map((p) => p.match(/[-\d.]+/g).map(Number));
          const distance = (p) =>
            Math.min(
              ...edges.map(([x, y, bx, by]) => {
                const t = Math.max(
                  0,
                  Math.min(
                    1,
                    ((p.x - x) * (bx - x) + (p.y - y) * (by - y)) /
                      ((bx - x) ** 2 + (by - y) ** 2),
                  ),
                );
                return Math.hypot(
                  p.x - x - t * (bx - x),
                  p.y - y - t * (by - y),
                );
              }),
            );
          const tick = (key = "", dt = 0.025) => {
            api.input.keys = new Set(key ? [key] : []);
            api.time += dt;
            game.update(dt);
            game.draw();
          };
          let fliesOnTrail = true,
            flyCount = 0;
          for (let i = 0; i < 160; i++) {
            tick();
            for (const fly of svg.querySelectorAll("[data-byte-fly]")) {
              const [x, y] = fly
                .getAttribute("transform")
                .match(/translate\(([-\d.]+) ([-\d.]+)\)/)
                .slice(1)
                .map(Number);
              fliesOnTrail &&= distance({ x, y }) < 0.02;
              flyCount++;
            }
          }
          const runner = svg.querySelector("[data-byte-runner]"),
            feet = svg.querySelector("[data-byte-feet]"),
            body = svg.querySelector("[data-byte-body]");
          let roam = false;
          for (const key of [
            "ArrowDown",
            "ArrowRight",
            "ArrowUp",
            "ArrowLeft",
          ]) {
            api.input.keys = new Set([key]);
            game.action("jump");
            for (let i = 0; i < 20; i++) {
              tick(key);
              const [x, y] = runner
                .getAttribute("transform")
                .match(/[-\d.]+/g)
                .map(Number);
              roam ||= distance({ x, y }) > 20;
            }
          }
          game.reset();
          game.draw();
          const poses = [];
          for (const key of ["ArrowUp", "ArrowDown"]) {
            api.input.keys = new Set([key]);
            game.action("jump");
            const frames = new Set();
            for (let i = 0; i < 8; i++) {
              tick(key);
              frames.add(body.getAttribute("d"));
            }
            poses.push(frames.size);
          }
          tick("", 0.3);
          const stopped = feet.dataset.frame === "0";
          const guides = svg.querySelector("[data-byte-guides]"),
            mask = svg.querySelector("mask");
          const stable = [guides, mask, runner];
          for (let i = 0; i < 3; i++) {
            game.reset();
            game.draw();
          }
          const stableNodes =
            stable.every((n) => n.isConnected) &&
            svg.querySelectorAll("[data-byte-guides]").length === 1 &&
            svg.querySelectorAll("mask").length === 1;
          const cover = document.createElement("div");
          cover.setAttribute("role", "img");
          cover.style.cssText = "position:absolute;inset:0";
          root.append(cover);
          game.action("refresh");
          for (let i = 0; i < 20; i++) tick();
          const hidden = svg.getAttribute("visibility") === "hidden";
          cover.remove();
          game.action("refresh");
          for (let i = 0; i < 20; i++) tick();
          const recovered =
            svg.getAttribute("visibility") === "visible" &&
            game.snapshot().score === 0;
          window.whitespaceQA = { game, api, board, svg, tick };
          return {
            clear,
            nativeButton,
            nativeLabel,
            food: maze.pellets.length,
            fliesOnTrail,
            flyCount,
            roam,
            poses,
            stopped,
            stableNodes,
            hidden,
            recovered,
            edges: edges.length,
          };
        },
        { u: urls, dark },
      );
      for (const key of [
        "clear",
        "nativeButton",
        "nativeLabel",
        "fliesOnTrail",
        "roam",
        "stopped",
        "stableNodes",
        "hidden",
        "recovered",
      ])
        assert.equal(result[key], true, key + JSON.stringify(result));
      assert.ok(result.food > 10);
      assert.ok(result.flyCount > 0);
      assert.deepEqual(result.poses, [1, 1]);
      await page.screenshot({
        path: `artifacts/byte-whitespace/${mobile ? "mobile" : "desktop"}-${dark ? "dark" : "light"}.png`,
      });
      const guides = page.locator("[data-byte-guides]");
      const before = await guides.boundingBox();
      await page.evaluate(() => scrollBy(0, 100));
      const after = await guides.boundingBox();
      assert.ok(Math.abs(before.y - after.y - 100) < 1, "native paused scroll");
      await page.evaluate(() => {
        window.whitespaceQA.board.destroy();
        delete window.whitespaceQA;
      });
      assert.equal(await page.locator("[data-byte-trails]").count(), 0);
      assert.deepEqual(errors, []);
      console.log({ mobile, dark, ...result });
      await page.close();
    }
} finally {
  await browser.close();
  await server.close();
}
