// The built site (artifacts/site) against the lifecycle (site-kit/lifecycle.mjs), for either target:
//   production (SITE_URL=https://domvirus.com SITE_BASE=/): DOM Kaiju is not ready, so no page, feed or
//     discovery file names it or links to it; its old URLs are redirects.
//   staging (default github.io build): Kaiju is on the shelf, on coming soon and has its page.
// Run after npm run site:build: npm run site:test:lifecycle
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const out = resolve("artifacts/site");
const read = (p) => readFileSync(resolve(out, p), "utf8");
const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(resolve(dir, e.name)) : /\.(html|xml|txt)$/.test(e.name) ? [resolve(dir, e.name)] : []));
const production = existsSync(resolve(out, "CNAME"));
const redirect = (p) => read(`${p}/index.html`).includes('content="noindex,follow"');

if (production) {
  for (const f of files(out)) {
    const text = readFileSync(f, "utf8");
    assert.doesNotMatch(text, /kaiju/i, `${f.slice(out.length + 1)} names Kaiju`);
    assert.doesNotMatch(text, /news\/coming-next/, `${f.slice(out.length + 1)} links the Kaiju post`);
  }
  assert.ok(redirect("games/kaiju") && read("games/kaiju/index.html").includes("url=/games/"), "/games/kaiju/ redirects to /games/");
  assert.ok(redirect("news/coming-next") && read("news/coming-next/index.html").includes("url=/news/"), "/news/coming-next/ redirects to /news/");
  assert.ok(!existsSync(resolve(out, "coming-soon/kaiju")), "no /coming-soon/kaiju/ page");
  assert.match(read("index.html"), /3 new games \+ the engine/);
  console.log("Lifecycle (production): no Kaiju anywhere; its URLs redirect.");
} else {
  assert.ok(!redirect("games/kaiju") && read("games/kaiju/index.html").includes('id="kaiju-title"'), "staging serves the Kaiju page");
  assert.match(read("index.html"), /data-cart="kaiju"/, "Kaiju cartridge on the shelf");
  assert.match(read("games/coming-soon/index.html"), /<h2[^>]*>DOM Kaiju<\/h2>/);
  assert.ok(!redirect("news/coming-next"), "staging serves the coming-next post");
  console.log("Lifecycle (staging): Kaiju shown on the shelf, coming soon and its own page.");
}
