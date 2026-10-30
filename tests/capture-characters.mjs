import { createServer } from "vite";
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { coreGameRoot as gameRoot } from "../scripts/game-paths.mjs";
const out = resolve("artifacts/characters");
mkdirSync(out, { recursive: true });
const s = await createServer({
  configFile: "vite.config.js",
  server: { port: 5210, host: "127.0.0.1" },
});
await s.listen();
const b = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/tmp/chromium") ? "/tmp/chromium" : undefined),
  args: ["--no-sandbox"],
});
try {
  const p = await b.newPage({ viewport: { width: 1000, height: 760 } });
  await p.goto("http://127.0.0.1:5210");
  await p.setContent(
    '<style>body{margin:0;background:#f6f7f8;color:#17202a;font:14px ui-monospace,monospace}h1{font-size:22px;margin:20px 28px 8px}p{margin:8px 28px;color:#586577}.row{position:relative;margin:12px 28px;width:944px;height:150px;background:#fff;border:1px solid #ccd3db;box-shadow:4px 4px #f4457a}.native{height:115px}.label{position:absolute;top:12px;left:18px;font-size:11px}canvas{display:block}.dark{background:#1a112b;color:#fff4ff}</style><h1>DOM VIRUS / PIXEL MOTION</h1><p>Actual renderers · native size above · 4× pixel inspection below</p><div class="row native" id="native"><span class="label">FROG + FLIES / ACTUAL SIZE</span></div><div class="row" id="large"><span class="label">IDLE → RUN + CHOMP → UP → DOWN → OVERCLOCK</span></div><div class="row dark" id="ships"><span class="label">PULSE → TWIN → TRIDENT → OVERDRIVE / 4×</span><canvas width="944" height="150"></canvas></div><p>Four foot frames. Independent chomping. Two wing frames. Finite ship poses.</p>',
  );
  await p.evaluate(
    async (paths) => {
      const { createPresentation } = await import(paths.presentation),
        { drawShip } = await import(paths.sprites);
      const make = (id) => {
        const root = document.getElementById(id);
        const host = document.createElement("div");
        host.style.cssText = "position:absolute;inset:0";
        root.append(host);
        const shadow = host.attachShadow({ mode: "open" });
        const api = {
          options: { document, root, theme: "light" },
          board: { attach: () => shadow, targets: [], glyphs: [] },
          width: 1000,
          height: 760,
          time: 0,
          reducedMotion: false,
        };
        const v = createPresentation(api);
        const frame = v.measure();
        v.mount(
          { cells: [], pellets: [], step: 44, start: 0, path: "" },
          frame,
        );
        v.syncPosition();
        return { v, api, shadow };
      };
      const native = make("native"),
        large = make("large"),
        ships = document.querySelector("#ships canvas").getContext("2d");
      // Multiple frogs use independent native presentations; no alternate artwork.
      const frogs = Array.from({ length: 5 }, (_, i) => make("large"));
      window.renderPreview = (frame) => {
        const t = frame / 12,
          a = { moving: frame % 48 < 36, runTime: t, chompUntil: t + 1 };
        native.api.time = t;
        native.v.render(
          { x: 100 + Math.sin(t) * 20, y: 68, direction: frame < 24 ? 0 : 2 },
          [0, 1, 2].map((kind) => ({
            id: kind,
            kind,
            phase: kind * 0.37,
            x: 230 + kind * 120,
            y: 67,
            direction: frame < 24 ? 0 : 2,
          })),
          frame >= 36 ? 4 : 0,
          0,
          null,
          a,
        );
        const set = (o, x, dir, moving, power) => {
          o.api.time = t;
          o.v.render({ x, y: 0, direction: dir }, [], power, 0, null, {
            moving,
            runTime: t,
            chompUntil: moving ? t + 1 : 0,
          });
          const svg = o.shadow.querySelector("svg");
          svg.style.overflow = "visible";
          const runner = svg.querySelector("[data-byte-runner]");
          runner.setAttribute("transform", `translate(${x} 86) scale(4)`);
        };
        frogs.forEach((o, i) =>
          set(o, 100 + i * 178, [0, 0, 3, 1, 2][i], i !== 0, i === 4 ? 4 : 0),
        );
        large.shadow.querySelector("svg").style.display = "none";
        ships.clearRect(0, 0, 944, 150);
        for (let tier = 1; tier <= 4; tier++) {
          ships.save();
          ships.translate(115 + (tier - 1) * 236, 85);
          ships.scale(4, 4);
          drawShip(
            ships,
            tier,
            ["idle", "thrust", "bank-left", "bank-right"][
              Math.floor(frame / 12) % 4
            ],
            frame % 2,
            0,
            0,
          );
          ships.restore();
        }
      };
      window.renderPreview(0);
    },
    {
      presentation:
        "/@fs" + resolve(gameRoot("byte-runner"), "src/presentation.ts"),
      sprites: "/@fs" + resolve(gameRoot("null-invaders"), "src/sprites.ts"),
    },
  );
  for (let i = 0; i < 48; i++) {
    await p.evaluate((i) => window.renderPreview(i), i);
    await p.screenshot({
      path: resolve(out, `pixels-${String(i).padStart(3, "0")}.png`),
    });
  }
  await p.evaluate(() => window.renderPreview(17));
  await p.screenshot({ path: resolve(out, "pixel-inspection.png") });
  await p.close();
  // Capture actual running games on a real DOM page, with keyboard input.
  for (const name of ["byte-runner", "null-invaders"]) {
    const page = await b.newPage({ viewport: { width: 960, height: 640 } });
    await page.goto("http://127.0.0.1:5210");
    await page.setContent(
      `<style>body{margin:0;background:#f6f7f8;color:#17202a;font:18px system-ui}main{position:relative;margin:20px;padding:30px;width:860px;height:510px;background:white;border:1px solid #ccd3db;box-shadow:6px 6px #f4457a}small{font:12px monospace;color:#bf2d5b}h1{font-size:48px;margin:38px 0 14px;letter-spacing:-2px}p{width:480px;line-height:1.7}button{font:14px monospace;padding:15px;margin:35px 20px 0 0;background:#79cddc;color:#17202a;border:1px solid;box-shadow:3px 3px #17202a}.footer{margin-top:65px;font:13px monospace;color:#586577}</style><main><small>DOM VIRUS / ${name.toUpperCase()}</small><h1>The page is the playfield.</h1><p>Follow the food, eat these real letters, and play with the interface. The DOM stays alive beneath every character.</p><button data-virus-target>SPAWN_01</button><button data-virus-target>SPAWN_02</button><div class="footer">ACTUAL GAMEPLAY SIZE · ARROWS / WASD · RECALL RESTORES THE PAGE</div></main>`,
    );
    await page.evaluate(
      async ({ path, name }) => {
        const mod = await import(path);
        window.captureErrors = [];
        window.live = (
          name === "byte-runner" ? mod.createByteRunner : mod.createNullInvaders
        )({
          root: "main",
          seed: 12,
          theme: "light",
          onError: (e) => window.captureErrors.push(e.message),
        });
        window.live.start();
      },
      { name, path: "/@fs" + resolve(gameRoot(name), "src/index.ts") },
    );
    await page.waitForTimeout(100);
    await page.locator("[data-action=fold]").click();
    await page.waitForTimeout(180);
    if (name === "null-invaders") await page.keyboard.down("Space");
    const sequence =
      name === "null-invaders"
        ? [
            "ArrowRight",
            "ArrowUp",
            "ArrowLeft",
            "ArrowLeft",
            "ArrowDown",
            "ArrowDown",
            "ArrowRight",
            "ArrowUp",
            "ArrowRight",
            "ArrowLeft",
            "",
            "",
          ]
        : [
            "ArrowRight",
            "ArrowRight",
            "ArrowUp",
            "ArrowUp",
            "ArrowLeft",
            "ArrowLeft",
            "ArrowDown",
            "ArrowDown",
            "ArrowRight",
            "ArrowRight",
            "",
            "",
          ];
    let last = "";
    for (let i = 0; i < 72; i++) {
      const key = sequence[Math.floor(i / 6)];
      if (key !== last) {
        if (last) await page.keyboard.up(last);
        if (key) await page.keyboard.down(key);
        last = key;
      }
      await page.waitForTimeout(55);
      await page.screenshot({
        path: resolve(out, `${name}-${String(i).padStart(3, "0")}.png`),
      });
    }
    if (last) await page.keyboard.up(last);
    if (name === "null-invaders") await page.keyboard.up("Space");
    await page.screenshot({ path: resolve(out, `${name}-in-game.png`) });
    console.log(
      name,
      await page.evaluate(() => ({
        state: window.live.getSnapshot(),
        errors: window.captureErrors,
      })),
    );
    await page.close();
  }
} finally {
  await b.close();
  await s.close();
}
