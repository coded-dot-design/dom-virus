// The hub's idle loops on Fizlet (site-kit/loop.ts): the Battlefield and Kaiju detail scenes, the
// three engineering diagrams and the style guide's press demo. For each one, on the built site:
// it runs on screen; it sleeps off screen, in a hidden tab and (diagrams) while its pause key holds
// it; Recall (destroy) gives every style back as the HTML had it; reduced motion never starts it
// and shows the CSS still frame. Run after npm run site:build (part of npm run site:test:browser).
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, statSync, existsSync } from "node:fs";
import { resolve, extname } from "node:path";
import { chromium } from "playwright";

const root = resolve("artifacts/site");
const server = createServer((req, res) => {
  try {
    let file = resolve(root, "." + decodeURIComponent(req.url.split("?")[0]).replace(/^\/dom-virus/, ""));
    if (!file.startsWith(root + "/") && file !== root) throw new Error("Invalid path");
    if (statSync(file).isDirectory()) file += "/index.html";
    res.setHeader("Content-Type", { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml" }[extname(file)] || "application/octet-stream");
    res.end(readFileSync(file));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}/dom-virus/`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync("/tmp/chromium") ? "/tmp/chromium" : undefined), args: ["--no-sandbox"] });
// [page, scene root, has a pause key]. Kaiju is staging only (lifecycle): skipped on a production build.
const production = existsSync(resolve(root, "CNAME"));
const scenes = [
  ["games/battlefield/", ".battlefield-display", false],
  ...(production ? [] : [["games/kaiju/", ".kaiju-display", false]]),
  ["about/brand/archive/", ".system-map", true],
  ["about/brand/archive/", ".tick-map", true],
  ["about/brand/archive/", ".ownership-map", true],
  ["about/brand/", ".sg-depth", false],
];
// Every inline style in the scene, in document order (what the loop writes, and what Recall restores).
const styles = (sel) => [...document.querySelector(sel).querySelectorAll("*")].map((e) => e.getAttribute("style"));
const frames = (sel) => document.querySelector(sel).loop.engine.stats().frames;
const paused = (sel) => document.querySelector(sel).loop.engine.paused;
// The loop's writes change the scene within a play (some loops hold still for part of theirs).
const moves = async (page, sel, what) => {
  const s0 = await page.evaluate(styles, sel);
  await page.waitForFunction(([sel, s0]) => [...document.querySelector(sel).querySelectorAll("*")].some((e, i) => e.getAttribute("style") !== s0[i]), [sel, s0], { timeout: 7000 }).catch(() => assert.fail(what));
};
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const [path, sel, key] of scenes) {
    const name = `${path}${sel}`;
    await page.goto(base + path);
    // The HTML as served: the still frame Recall must give back.
    const html = await (await page.request.get(base + path)).text();
    const served = await page.evaluate(([html, sel]) => [...new DOMParser().parseFromString(html, "text/html").querySelector(sel).querySelectorAll("*")].map((e) => e.getAttribute("style")), [html, sel]);
    await page.locator(sel).first().scrollIntoViewIfNeeded();
    await page.waitForFunction((sel) => document.querySelector(sel).loop?.engine.running, sel);
    // Runs: frames tick and the loop's writes change the scene.
    const f0 = await page.evaluate(frames, sel);
    await moves(page, sel, `${name} moves`);
    await page.waitForFunction(([sel, f0]) => document.querySelector(sel).loop.engine.stats().frames > f0 + 5, [sel, f0], { timeout: 3000 }).catch(() => assert.fail(`${name} runs`));
    // Off screen: the engine sleeps (no frames at all).
    await page.evaluate((sel) => {
      const r = document.querySelector(sel).getBoundingClientRect();
      scrollTo(0, r.top + scrollY > innerHeight * 1.5 ? 0 : document.documentElement.scrollHeight);
    }, sel);
    await page.waitForFunction((sel) => document.querySelector(sel).loop.engine.paused.includes("offscreen"), sel);
    let f = await page.evaluate(frames, sel);
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(frames, sel), f, `${name} does no frames off screen`);
    // Back on screen it runs again; a hidden tab sleeps it.
    await page.locator(sel).first().scrollIntoViewIfNeeded();
    await page.waitForFunction((sel) => document.querySelector(sel).loop.engine.running, sel);
    await moves(page, sel, `${name} moves again back on screen`);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    assert.ok((await page.evaluate(paused, sel)).includes("hidden"), `${name} sleeps in a hidden tab`);
    f = await page.evaluate(frames, sel);
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(frames, sel), f, `${name} does no frames in a hidden tab`);
    await page.evaluate(() => {
      delete document.visibilityState;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForFunction((sel) => document.querySelector(sel).loop.engine.running, sel);
    await moves(page, sel, `${name} moves again in a visible tab`);
    // The diagrams' pause key holds the engine; pressed again, it runs.
    if (key) {
      const button = page.locator(`${sel} [data-motion-toggle]`);
      await button.click();
      assert.ok((await page.evaluate(paused, sel)).includes("stopped"), `${name} pause key stops it`);
      await button.click();
      await page.waitForFunction((sel) => document.querySelector(sel).loop.engine.running, sel);
      await moves(page, sel, `${name} moves again after the pause key`);
    }
    // Recall: every style back exactly as served.
    await page.evaluate((sel) => document.querySelector(sel).loop.destroy(), sel);
    assert.deepEqual(await page.evaluate(styles, sel), served, `${name} Recall gives the page back`);
  }
  assert.deepEqual(errors, []);

  // Reduced motion: no loop is built, the scene is the CSS still frame (the served styles).
  const still = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const calm = await still.newPage();
  for (const [path, sel] of scenes) {
    await calm.goto(base + path);
    const html = await (await calm.request.get(base + path)).text();
    await calm.locator(sel).first().scrollIntoViewIfNeeded();
    await calm.waitForTimeout(250);
    assert.equal(await calm.evaluate((sel) => document.querySelector(sel).loop, sel), undefined, `${path}${sel}: no loop under reduced motion`);
    const served = await calm.evaluate(([html, sel]) => [...new DOMParser().parseFromString(html, "text/html").querySelector(sel).querySelectorAll("*")].map((e) => e.getAttribute("style")), [html, sel]);
    assert.deepEqual(await calm.evaluate(styles, sel), served, `${path}${sel}: still frame`);
  }
  // Recall's still frame for the ownership diagram is the original word, the bar full.
  await calm.goto(base + "about/brand/archive/");
  assert.deepEqual(await calm.evaluate(() => ["original-word", "changed-word"].map((c) => getComputedStyle(document.querySelector("." + c)).opacity)), ["1", "0"]);
  // Turning reduced motion on while a loop runs Recalls it at once.
  const live = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await live.newPage();
  await p.goto(base + "games/battlefield/");
  await p.locator(".battlefield-display").scrollIntoViewIfNeeded();
  await p.waitForFunction(() => document.querySelector(".battlefield-display").loop?.engine.running);
  await p.waitForTimeout(200);
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.waitForFunction(() => !document.querySelector(".battlefield-display").loop);
  assert.ok(await p.evaluate(() => [...document.querySelectorAll(".battlefield-display .tank, .battlefield-display .shell")].every((e) => !/transform|opacity|--k/.test(e.getAttribute("style") || ""))), "reduced motion on: Recalled");
  await p.emulateMedia({ reducedMotion: "no-preference" });
  await p.waitForFunction(() => document.querySelector(".battlefield-display").loop?.engine.running);
  console.log(`Loops on Fizlet: ${scenes.length} scenes run, sleep off screen and in hidden tabs, Recall, and hold still under reduced motion.`);
} catch (e) {
  console.log(`::error title=Site loops test::${String(e.stack || e).split("\n").slice(0, 30).join(" | ").slice(0, 2500)}`);
  throw e;
} finally {
  await browser.close();
  server.close();
}
