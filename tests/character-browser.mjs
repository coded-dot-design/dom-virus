import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { gameRoot } from "../scripts/game-paths.mjs";
const source = (game, file) => "/@fs" + resolve(gameRoot(game), "src", file);
const urls = {
  runner: source("byte-runner", "index.ts"),
  simulation: source("byte-runner", "simulation.ts"),
  presentation: source("byte-runner", "presentation.ts"),
  maze: source("byte-runner", "maze.ts"),
  sprites: source("null-invaders", "sprites.ts"),
  shooter: source("null-invaders", "index.ts"),
  ship: source("null-invaders", "simulation.ts"),
  board: "/@fs" + resolve("src/board.ts"),
};
mkdirSync("artifacts/characters", { recursive: true });
const server = await createServer({
  configFile: "vite.config.js",
  server: { port: 5208, host: "127.0.0.1" },
});
await server.listen();
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/tmp/chromium") ? "/tmp/chromium" : undefined),
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://127.0.0.1:5208");
  await page.setContent(
    '<style>body{margin:0;background:#f6f7f8;color:#182331;font:16px system-ui}#fixture{position:relative;margin:20px;width:900px;height:650px;background:white;border:1px solid #cad0d8}h1{font-size:48px;margin:40px}p{margin:25px 40px;max-width:500px}button{margin:25px 40px;padding:18px;background:#79cddc;border:1px solid;color:#17202a;box-shadow:4px 4px #17202a}</style><main id="fixture"><h1>The page is the playfield.</h1><p>Follow the food. Eat these real letters. Tiny feet, big appetite.</p><button data-virus-target>SPAWN_01</button></main><div style="height:1200px"></div>',
  );
  const proof = await page.evaluate(async (u) => {
    const { createGame } = await import(u.simulation),
      { createBoard } = await import(u.board);
    const root = document.querySelector("#fixture"),
      board = createBoard(document, { root });
    board.measure(0, true);
    const events = [],
      api = {
        board,
        options: { root, document, theme: "light" },
        input: {
          keys: new Set(),
          mode: "keyboard",
          pointer: { active: false, x: 0, y: 0 },
          fire: false,
        },
        width: 1100,
        height: 760,
        time: 0,
        random: () => 0.62,
        reducedMotion: false,
        emit: (type, data) => events.push({ type, ...data }),
        burst() {},
        popup() {},
        move() {},
        finish() {},
      };
    const g = createGame(api);
    g.reset();
    g.draw();
    const svg = root
      .querySelector("dom-virus-attachment")
      .shadowRoot.querySelector("[data-byte-trails]");
    const tick = (key = "", dt = 0.025) => {
      api.input.keys = new Set(key ? [key] : []);
      api.time += dt;
      g.update(dt);
      g.draw();
    };
    const frames = new Set(),
      mouth = new Set();
    const body = svg.querySelector("[data-byte-body]"),
      feet = svg.querySelector("[data-byte-feet]");
    for (let i = 0; i < 40; i++) {
      tick("ArrowRight");
      frames.add(feet.dataset.frame);
      mouth.add(body.dataset.mouth);
    }
    const stableNodes = body === svg.querySelector("[data-byte-body]");
    tick();
    const stopped = feet.dataset.frame === "0";
    const directions = [];
    for (const key of ["ArrowDown", "ArrowLeft", "ArrowUp", "ArrowRight"]) {
      tick(key);
      directions.push(svg.querySelector("[data-byte-pose]").dataset.facing);
    }
    for (let i = 0; i < 280; i++) tick("ArrowRight");
    const wallStopped = feet.dataset.frame === "0";
    const moveTo = (x, y) => {
      for (let i = 0; i < 1500; i++) {
        const p = g.snapshot().player,
          dx = x - p.x,
          dy = y - p.y;
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
        tick(
          Math.abs(dx) > 2
            ? dx > 0
              ? "ArrowRight"
              : "ArrowLeft"
            : dy > 0
              ? "ArrowDown"
              : "ArrowUp",
          0.012,
        );
      }
    };
    // Reach a power square through ordinary DOM space, then seek a live fly.
    const power = svg.querySelector(
      '[data-byte-power]:not([visibility="hidden"])',
    );
    let overclock = false,
      vulnerable = false,
      capture = false;
    if (power) {
      const r = power.getBoundingClientRect();
      moveTo(r.x + r.width / 2, r.y + r.height / 2);
      overclock = g.snapshot().power > 0;
      vulnerable = [...svg.querySelectorAll("[data-byte-fly]")].some(
        (n) => n.dataset.vulnerable === "true",
      );
      for (let i = 0; i < 700 && g.snapshot().power > 0; i++) {
        const fly = svg.querySelector("[data-byte-fly]");
        if (!fly) break;
        const r = fly.getBoundingClientRect(),
          p = g.snapshot().player,
          dx = r.x + r.width / 2 - p.x,
          dy = r.y + r.height / 2 - p.y;
        tick(
          Math.abs(dx) > Math.abs(dy)
            ? dx > 0
              ? "ArrowRight"
              : "ArrowLeft"
            : dy > 0
              ? "ArrowDown"
              : "ArrowUp",
          0.012,
        );
        if (events.some((e) => e.type === "ghost-eaten")) {
          capture = true;
          break;
        }
      }
    }
    const wings = svg.querySelector("[data-byte-fly] [data-wings]");
    let flap = false;
    if (wings) {
      const d = wings.getAttribute("d");
      tick("", 0.14);
      flap = d !== wings.getAttribute("d");
    }
    api.reducedMotion = true;
    tick();
    const reduced =
      svg.querySelector("[data-byte-feet]").dataset.frame === "0" &&
      [...svg.querySelectorAll("[data-wings]")].every(
        (n) => n.dataset.frame === "0",
      );
    const squares = [...svg.querySelectorAll("[data-byte-pellet]")].every(
      (n) => n.tagName === "rect",
    );
    window.fixtureGame = { g, api, board, svg, tick };
    return {
      frames: [...frames],
      mouth: [...mouth],
      directions,
      stableNodes,
      stopped,
      wallStopped,
      overclock,
      vulnerable,
      capture,
      flap,
      reduced,
      squares,
      food: svg.querySelectorAll("[data-byte-pellet]").length,
    };
  }, urls);
  assert.equal(proof.frames.filter((x) => x !== "0").length, 4);
  assert.equal(proof.mouth.length > 1, true);
  assert.deepEqual(proof.directions, ["1", "2", "3", "0"]);
  for (const k of [
    "stableNodes",
    "stopped",
    "wallStopped",
    "overclock",
    "vulnerable",
    "capture",
    "reduced",
    "squares",
  ])
    assert.equal(proof[k], true, k + JSON.stringify(proof));
  console.log("Frog/flies simulation", proof);
  await page.evaluate(() => {
    window.fixtureGame.board.destroy();
    delete window.fixtureGame;
  });
  const cache = await page.evaluate(async (u) => {
    const { drawShip, drawSprite, spriteCacheSize, SPRITE_CACHE_LIMIT } =
      await import(u.sprites);
    const c = document.createElement("canvas");
    c.width = 1100;
    c.height = 420;
    document.body.prepend(c);
    const ctx = c.getContext("2d");
    const poses = ["idle", "thrust", "bank-left", "bank-right"];
    for (let n = 0; n < 1000; n++) {
      drawShip(
        ctx,
        (n % 4) + 1,
        poses[n % 4],
        n,
        n % 100,
        100,
        n / 100,
        !!(n % 2),
      );
    }
    for (let tier = 1; tier <= 4; tier++)
      for (const pose of poses)
        for (let frame = 0; frame < 2; frame++)
          for (const flash of [false, true])
            drawShip(ctx, tier, pose, frame, 0, 0, 0, flash);
    for (const kind of ["drone", "crab", "squid"])
      for (let frame = 0; frame < 2; frame++)
        for (const flash of [false, true])
          drawSprite(ctx, kind, frame, 0, 0, 0, flash);
    const a = spriteCacheSize(document);
    for (let n = 0; n < 1000; n++)
      drawShip(ctx, (n % 4) + 1, poses[n % 4], n, 0, 0, n / 10, !!(n % 2));
    const b = spriteCacheSize(document);
    c.remove();
    return { a, b, limit: SPRITE_CACHE_LIMIT };
  }, urls);
  assert.equal(cache.a, cache.limit);
  assert.equal(cache.a, cache.b);
  console.log("Finite canvas cache", cache);
  const shipMotion=await page.evaluate(async u=>{
    const {createGame}=await import(u.ship),{drawShip}=await import(u.sprites);
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=760;const ctx=canvas.getContext('2d');let drawn='';const original=ctx.drawImage.bind(ctx);
    ctx.drawImage=(image,...args)=>{if(image.width===37)drawn=image.toDataURL();original(image,...args);};
    let travel=0,angle=-Math.PI/2;const segments=[];
    const api={width:1000,height:760,time:0,options:{document},input:{keys:new Set(['ArrowRight']),mode:'keyboard',pointer:{active:false,x:0,y:0}},random:()=>.5,reducedMotion:false,firing:false,emit(){},burst(){},popup(){},finish(){},move(p){p.x+=travel;p.angle=angle;},board:{targets:[{visible:false,health:80,maxHealth:80,rect:null}],resetTargets(){},hitSegment(a,b){segments.push({a:{...a},b:{...b}});return null;},damage(){},consume(){return false;}}};
    const game=createGame(api);game.reset();
    const step=()=>{api.time+=.025;game.update(.025);game.draw(ctx);return drawn;};
    const idle=step();travel=3;const thrust=step();angle=-Math.PI;const left=step();angle=0;const right=step();travel=0;const stopped=step();
    const poseDifferent=new Set([idle,thrust,left,right]).size===4,stops=stopped===idle;
    api.firing=true;segments.length=0;step();const player=game.snapshot().player,first=segments[0];
    const aligned=!!first&&Math.abs(first.a.x-player.x-16)<.001&&Math.abs(first.a.y-player.y)<.001&&first.b.x>first.a.x;
    return {poseDifferent,stops,aligned};
  },urls);
  for(const [key,value] of Object.entries(shipMotion))assert.equal(value,true,key);
  console.log('Ship idle, movement thrust, both banks, stopped engines and muzzle alignment',shipMotion);
  await page.evaluate(()=>{
    const pending=new Set(),request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
    window.pendingGameFrames=pending;
    window.requestAnimationFrame=callback=>{const id=request(time=>{pending.delete(id);callback(time);});pending.add(id);return id;};
    window.cancelAnimationFrame=id=>{pending.delete(id);cancel(id);};
  });
  // Public runtime lifecycle and native scroll ownership in both themes.
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      async ({ u, theme }) => {
        const { createByteRunner } = await import(u.runner);
        window.lifecycleErrors = [];
        window.live = createByteRunner({
          root: "#fixture",
          seed: 22,
          theme,
          onError: (e) => window.lifecycleErrors.push(e.message),
        });
        window.live.start();
      },
      { u: urls, theme },
    );
    await page.waitForTimeout(100);
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    assert.equal(await page.evaluate(()=>window.live.getSnapshot().status),'paused');
    assert.equal(await page.evaluate(()=>window.pendingGameFrames.size),0);
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    assert.equal(await page.evaluate(()=>window.live.getSnapshot().status),'running');
    const elapsed = await page.evaluate(
      () => window.live.getSnapshot().elapsed,
    );
    assert.ok(elapsed >= 0, "clock never goes backward");
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(180);
    await page.keyboard.up("ArrowRight");
    await page.waitForTimeout(40);
    assert.equal(
      await page.locator("[data-byte-feet]").getAttribute("data-frame"),
      "0",
    );
    await page.evaluate(() => window.live.pause());
    const frozen = await page
      .locator("[data-byte-runner]")
      .getAttribute("transform");
    const pellet = page.locator("[data-byte-pellet]").first(),
      a = await pellet.boundingBox();
    await page.evaluate(() => scrollBy(0, 80));
    const b = await pellet.boundingBox();
    assert.ok(Math.abs(a.y - b.y - 80) < 1);
    await page.waitForTimeout(100);
    assert.equal(
      await page.locator("[data-byte-runner]").getAttribute("transform"),
      frozen,
    );
    await page.evaluate(() => window.live.resume());
    await page.waitForTimeout(80);
    await page.evaluate(() => window.live.start());
    await page.waitForTimeout(80);
    assert.equal(await page.locator("[data-byte-trails]").count(), 1);
    await page.evaluate(() => window.live.destroy());
    assert.equal(await page.locator("dom-virus-attachment").count(), 0);
    assert.deepEqual(await page.evaluate(() => window.lifecycleErrors), []);
    await page.evaluate(() => scrollTo(0, 0));
  }
  // Repeat public sessions and measure owned node counts after Recall.
  const counts = [];
  for (let i = 0; i < 4; i++) {
    await page.evaluate(async (u) => {
      const { createNullInvaders } = await import(u.shooter);
      window.live = createNullInvaders({ root: "#fixture", seed: 4 });
      window.live.start();
    }, urls);
    await page.waitForTimeout(70);
    await page.evaluate(() => window.live.destroy());
    counts.push(await page.locator("*").count());
  }
  assert.ok(counts.every((n) => n === counts[0]));
  assert.equal(
    await page.locator("[data-dom-virus-root],dom-virus-attachment").count(),
    0,
  );
  console.log(
    "Public pause, scroll, restart and Recall; stable node counts",
    counts,
  );
  assert.deepEqual(errors, []);
  assert.equal(await page.evaluate(()=>window.pendingGameFrames.size),0,'Recall leaves no animation loop');
  writeFileSync(
    "artifacts/characters/checks.json",
    JSON.stringify({ proof, cache, shipMotion, counts, errors }, null, 2),
  );
} finally {
  await browser.close();
  await server.close();
}
