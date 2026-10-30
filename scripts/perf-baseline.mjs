// Engine E0 perf harness: plays each app from the built hub (artifacts/site) under a 4x CPU
// throttle and records frame times, long tasks, heap, DOM size and layout/style work over a fixed
// window. Output: docs/engine/baseline/<app>.json and summary.md (the before/after evidence).
//
//   npm run site:build && node scripts/perf-baseline.mjs [--out docs/engine/baseline] [--seconds 10]
//     [--runs 3]                 play each app N times; every number is the median of the runs
//     [--only a,b]               measure only these app ids
//     [--releases g@vX.Y.Z,...]  also play archived releases from TEST A RELEASE (site/releases.json)
//     [--site <dir>]             serve another built hub (default artifacts/site)
//     [--blitz <dir>]            also play Battlefield Blitz from its built dist/ (board mode)
//
// Numbers are relative: compare runs from the same machine and browser only. Each run records the
// machine's 1-minute load average; a busy machine skews frame times.
import { createServer } from "node:http";
import { loadavg } from "node:os";
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { resolve, extname, join } from "node:path";
import { chromium } from "playwright";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const OUT = resolve(arg("out", "docs/engine/baseline"));
const SECONDS = Number(arg("seconds", "10"));
const WARM_MS = 2000;
const THROTTLE = 4;
const RUNS = Math.max(1, Number(arg("runs", "1")));
const ONLY = arg("only", "") ? arg("only").split(",") : null;
const RELEASES = arg("releases", "") ? arg("releases").split(",") : [];
const BLITZ = arg("blitz", "") ? resolve(arg("blitz")) : null;
const root = resolve(arg("site", "artifacts/site"));
if (!existsSync(join(root, "index.html"))) throw Error("Build the site first: npm run site:build");

const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/dom-virus/, "") || "/";
  if (BLITZ && path === "/__blitz/") {
    res.writeHead(200, { "content-type": "text/html" });
    return res.end(`<!doctype html><meta charset="utf-8"><title>Blitz</title><style>body{margin:0;background:#fff}</style><div id="board" style="position:relative;width:1100px;height:640px"></div>`);
  }
  const dir = BLITZ && path.startsWith("/__blitz/") ? BLITZ : root;
  let file = join(dir, dir === BLITZ ? path.slice("/__blitz".length) : path);
  if (!file.startsWith(dir)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}/dom-virus/`;

const games = JSON.parse(readFileSync("games.json", "utf8"));
const battlefield = JSON.parse(readFileSync("battlefield.json", "utf8"));
const hub = JSON.parse(readFileSync("package.json", "utf8")).version;
let apps = [
  ...Object.entries(games).map(([id, version]) => ({
    id, version: version.replace(/^v/, ""), url: `${base}games/${id}/`,
    start: async (page) => page.locator(`[data-launch="${id}"]`).first().click(),
  })),
  {
    // The served build says its version (dist/build.json); battlefield.json is the pin it was built from.
    id: "dom-battlefield", version: existsSync(join(root, "battlefield/build.json")) ? JSON.parse(readFileSync(join(root, "battlefield/build.json"), "utf8")).version : battlefield.version, url: `${base}battlefield/`,
    start: async (page) => {
      await page.locator(".bf-mission").first().click();
      await page.locator("#bf-quick").click();
    },
  },
  // Archived releases, played from the same page through the release picker.
  ...RELEASES.map((key) => {
    const [id, version] = key.split("@");
    return {
      id: key, version: version.replace(/^v/, ""), url: `${base}games/${id}/`,
      start: async (page) => {
        await page.locator(`select[data-release="${id}"]`).first().selectOption(key);
        await page.locator(`[data-launch="${id}"]`).first().click();
      },
    };
  }),
  // Blitz is not on the hub: a board match (AI platoons) in an 1100x640 board on a blank page.
  ...(BLITZ ? [{
    id: "dom-battlefield-blitz", version: JSON.parse(readFileSync(join(BLITZ, "build.json"), "utf8")).version, url: `${base}__blitz/`,
    start: async (page) => {
      await page.evaluate(async () => {
        const { createBlitz } = await import("./blitz.mjs");
        window.game = createBlitz(document.getElementById("board"), { mode: "board", seconds: 120 });
        window.game.start();
      });
    },
  }] : []),
];
if (ONLY) apps = apps.filter((app) => ONLY.includes(app.id));

// In-page probes: long tasks from load, frame deltas once measuring starts.
const probe = () => {
  const w = window;
  w.__perf = { long: [], frames: [], measuring: false };
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (w.__perf.measuring) w.__perf.long.push(e.duration);
    }).observe({ type: "longtask", buffered: false });
  } catch {}
  let last = 0;
  const tick = (t) => {
    if (w.__perf.measuring && last) w.__perf.frames.push(t - last);
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const median = (a) => pct(a, 0.5);
const pct = (a, p) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))] : 0);
const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
mkdirSync(OUT, { recursive: true });
const results = [];
async function measure(app) {
  const load1 = round(loadavg()[0]);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    try {
      localStorage.setItem("dom-battlefield:intro", "seen");
      localStorage.setItem("dom-battlefield:tips", "off");
    } catch {}
  });
  await context.addInitScript(probe);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  await page.goto(app.url, { waitUntil: "load" });
  await page.waitForTimeout(500);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
  let started = true;
  try {
    await app.start(page);
  } catch (e) {
    started = false;
    errors.push(`start: ${e.message}`);
  }
  await page.waitForTimeout(WARM_MS);
  const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const before = await metrics();
  await page.evaluate(() => (window.__perf.measuring = true));
  await page.waitForTimeout(SECONDS * 1000);
  await page.evaluate(() => (window.__perf.measuring = false));
  const after = await metrics();
  const { frames, long } = await page.evaluate(() => window.__perf);
  const delta = (k) => (after[k] ?? 0) - (before[k] ?? 0);
  const result = {
    app: app.id, version: app.version, hub, date: new Date().toISOString(), started,
    setup: { cpuThrottle: THROTTLE, seconds: SECONDS, warmMs: WARM_MS, viewport: "1440x900", browser: browser.version() },
    load1,
    frames: {
      count: frames.length, fps: round(frames.length / SECONDS, 1),
      avgMs: round(frames.reduce((a, b) => a + b, 0) / (frames.length || 1)), p50Ms: round(pct(frames, 0.5)), p95Ms: round(pct(frames, 0.95)), maxMs: round(Math.max(0, ...frames)),
      over33ms: frames.filter((f) => f > 33.4).length,
    },
    longTasks: { count: long.length, totalMs: round(long.reduce((a, b) => a + b, 0)), maxMs: round(Math.max(0, ...long)) },
    heapMB: round((after.JSHeapUsedSize ?? 0) / 1048576), domNodes: after.Nodes ?? 0,
    perSecond: {
      layouts: round(delta("LayoutCount") / SECONDS, 1), styleRecalcs: round(delta("RecalcStyleCount") / SECONDS, 1),
      scriptMs: round((delta("ScriptDuration") * 1000) / SECONDS), layoutMs: round((delta("LayoutDuration") * 1000) / SECONDS),
      styleMs: round((delta("RecalcStyleDuration") * 1000) / SECONDS), taskMs: round((delta("TaskDuration") * 1000) / SECONDS),
    },
    errors,
  };
  await context.close();
  return result;
}
// The median of each number across runs (runs are kept, with the load average each ran under).
const medianOf = (runs) => {
  const merge = (xs) => typeof xs[0] === "number" ? round(median(xs)) : xs[0] && typeof xs[0] === "object" && !Array.isArray(xs[0])
    ? Object.fromEntries(Object.keys(xs[0]).map((k) => [k, merge(xs.map((x) => x[k]))])) : xs[0];
  const { frames, longTasks, heapMB, domNodes, perSecond, load1 } = merge(runs);
  return { ...runs[0], date: runs[0].date, load1, frames, longTasks, heapMB, domNodes, perSecond,
    errors: [...new Set(runs.flatMap((r) => r.errors))], started: runs.every((r) => r.started),
    ...(runs.length > 1 ? { runs: runs.map(({ load1, frames, longTasks, perSecond }) => ({ load1, frames, longTasks, perSecond })) } : {}) };
};
for (const app of apps) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await measure(app));
  const result = medianOf(runs);
  result.setup.runs = RUNS;
  const errors = result.errors;
  writeFileSync(resolve(OUT, `${app.id}.json`), JSON.stringify(result, null, 2) + "\n");
  results.push(result);
  console.log(`${app.id} ${app.version}: ${result.frames.fps} fps, p50 ${result.frames.p50Ms}ms, p95 ${result.frames.p95Ms}ms, long tasks ${result.longTasks.count}, heap ${result.heapMB} MB, script ${result.perSecond.scriptMs} ms/s${errors.length ? `, errors: ${errors.length}` : ""}, load ${result.load1}`);
}
await browser.close();
server.close();

const rows = results.map((r) => `| ${r.app} | ${r.version} | ${r.frames.fps} | ${r.frames.avgMs} | ${r.frames.p50Ms ?? ""} | ${r.frames.p95Ms} | ${r.frames.over33ms} | ${r.longTasks.count} (${r.longTasks.totalMs} ms) | ${r.heapMB} | ${r.domNodes} | ${r.perSecond.layouts} | ${r.perSecond.scriptMs} | ${r.perSecond.taskMs} | ${r.load1 ?? ""} |`);
writeFileSync(resolve(OUT, "summary.md"), `# Engine baseline: performance

Recorded ${results[0]?.date.slice(0, 10)} with \`node scripts/perf-baseline.mjs\` from hub ${hub}. Each app is played
from the built hub for ${SECONDS}s (after a ${WARM_MS / 1000}s warm-up) at 1440x900 under a ${THROTTLE}x CPU throttle in
${results[0]?.setup.browser}${RUNS > 1 ? `; each number is the median of ${RUNS} runs` : ""}. Compare only against runs from the same machine and browser.

| App | Version | fps | avg frame ms | p50 ms | p95 ms | frames > 33ms | long tasks | heap MB | DOM nodes | layouts/s | script ms/s | task ms/s | load avg (1 min) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${rows.join("\n")}
`);
console.log(`Wrote ${OUT}/summary.md`);
