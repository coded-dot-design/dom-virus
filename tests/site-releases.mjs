// TEST A RELEASE covers every game version. site/releases.json lists every released tag (git
// ls-remote), at its tag's commit: fails when a game releases and `npm run sync:releases` has not run.
// In the built site, each game's picker offers its current release plus every other release in the
// file, and each game's recent releases (PLAY_FROM) load from their archived path and go live.
// Run after `npm run site:build` (needs the network).
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFileSync, statSync, existsSync } from "node:fs";
import { resolve, extname } from "node:path";
import { chromium } from "playwright";
import { compare, remoteCatalog } from "../scripts/releases-catalog.mjs";

const root = resolve("artifacts/site");
const catalog = JSON.parse(readFileSync("site/releases.json", "utf8"));
for (const [name, releases] of Object.entries(remoteCatalog())) {
  const listed = new Map((catalog[name] ?? []).map((r) => [r.version, r.commit]));
  const missing = releases.filter((r) => !listed.has(r.version)).map((r) => r.version);
  assert.deepEqual(missing, [], `${name}: released but not in site/releases.json (npm run sync:releases)`);
  for (const { version, commit } of releases) assert.equal(listed.get(version), commit, `${name} ${version}: tag moved`);
}
const data = JSON.parse(readFileSync("site/generated/data.json", "utf8"));
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
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || (existsSync("/tmp/chromium") ? "/tmp/chromium" : undefined),
  args: ["--no-sandbox"],
});
// Played end to end: each game's builds on Fizlet (1.0.0 on; Swarm 1.4.0) and the build before it.
const PLAY_FROM = { "null-invaders": "v1.0.0", "byte-runner": "v1.0.0", "sherman-bytes": "v1.0.0", "swarm-protocol": "v1.3.1" };
let played = 0;
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const failed = [];
  page.on("response", (r) => r.url().includes("/releases/") && r.status() >= 400 && failed.push(r.url()));
  for (const game of data.games) {
    // Each game's own page carries its picker.
    await page.goto(`${base}games/${game.id}/`);
    const current = `v${game.version}`;
    const select = page.locator(`select[data-release="${game.id}"]`);
    const options = await select.locator("option").evaluateAll((list) => list.map((o) => [o.value, o.dataset.version, o.textContent]));
    assert.deepEqual(options[0], [game.id, current, `Current · ${current}`], `${game.id}: current first`);
    assert.deepEqual(
      options.slice(1).map((o) => o[1]),
      catalog[game.id].map((r) => r.version).filter((v) => v !== current),
      `${game.id}: every other release in site/releases.json, newest first`,
    );
    for (const [key, version, label] of options.slice(1)) {
      assert.equal(key, `${game.id}@${version}`);
      assert.match(label, / · (archived|newer)$/);
    }
    for (const [key, version] of options.slice(1).filter(([, v]) => compare(v, PLAY_FROM[game.id]) >= 0)) {
      await select.selectOption(key);
      await page.locator(`[data-launch="${game.id}"]`).click();
      await page.waitForFunction(() => /is live/.test(document.querySelector("#site-status")?.textContent ?? ""), null, { timeout: 20000 });
      assert.match(await page.locator("#session-name").textContent(), new RegExp(`${version.replaceAll(".", "\\.")}$`), `${game.id} ${version} is the build that runs`);
      await page.locator("#session-recall").click();
      await page.waitForFunction(() => document.querySelector(".session-bar")?.hidden);
      played++;
    }
  }
  assert.deepEqual(failed, [], "every archived module is served");
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
  server.close();
}
console.log(`TEST A RELEASE: every picker lists its game's releases; ${played} recent archived builds went live.`);
