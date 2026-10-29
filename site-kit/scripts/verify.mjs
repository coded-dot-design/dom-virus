import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const root = process.cwd();
const { id } = JSON.parse(readFileSync("site/config.json", "utf8"));
const base = (process.env.SITE_BASE || `/${id}`).replace(/\/$/, "");
const output = resolve(root, "artifacts/site");
const html = readFileSync(resolve(output, "index.html"), "utf8");
const assets = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
  .map((m) => m[1])
  .filter((url) => url.startsWith("/") && !url.startsWith("//"));
assert(
  assets.some((url) => url.endsWith(".js")),
  "Production HTML must include the interactive launcher script.",
);
assert(
  assets.some((url) => url.endsWith(".css")),
  "Production HTML must include its styles.",
);
for (const url of assets) {
  assert(url.startsWith(`${base}/`), `Wrong Pages base: ${url}`);
  assert(
    existsSync(resolve(output, url.slice(base.length + 1))),
    `Missing production asset: ${url}`,
  );
}
assert(html.includes("Chris Cooley"), "Creator credit missing.");
console.log(
  `Verified ${id}: rendered page, launcher script, CSS and ${assets.length} asset paths.`,
);

const data = JSON.parse(readFileSync("site/generated/data.json", "utf8"));
for (const game of data.games)
  for (const archive of game.archives || []) {
    assert(
      existsSync(resolve(output, archive.path)),
      `Missing archive: ${archive.path}`,
    );
    const manifest = JSON.parse(
      readFileSync(resolve(output, archive.path, "../release.json"), "utf8"),
    );
    assert.equal(manifest.commit, archive.commit);
    assert.equal(manifest.version, archive.version);
  }
console.log("Archived release entrypoints and commit manifests verified.");

// Routes, redirects, sitemap and feed (hub; brand/SITEMAP.md). Skipped on sites without them.
if (existsSync("site/redirects.json")) {
  const redirects = JSON.parse(readFileSync("site/redirects.json", "utf8"));
  for (const [from, to] of Object.entries(redirects).filter(([k]) => !k.startsWith("$"))) {
    const page = readFileSync(resolve(output, from, "index.html"), "utf8");
    assert(page.includes(`url=${base}/${to}`), `Redirect ${from} must point to ${to}`);
    assert(page.includes('content="noindex,follow"'), `Redirect ${from} must be noindex`);
    assert(existsSync(resolve(output, to, "index.html")), `Redirect target missing: ${to}`);
  }
  const sitemap = readFileSync(resolve(output, "sitemap.xml"), "utf8");
  assert(sitemap.includes("/about/</loc>") && !sitemap.includes("/under-the-hood/"), "Sitemap must list live pages only.");
  assert(readFileSync(resolve(output, "robots.txt"), "utf8").includes("Sitemap: "), "robots.txt must point to the sitemap.");
  assert(readFileSync(resolve(output, "feed.xml"), "utf8").includes("<item>"), "RSS feed must have items.");
  // Drafts and not-yet-due scheduled pages never ship (E7).
  const pagesDir = "site/src/content/pages";
  for (const f of readdirSync(pagesDir)) {
    const p = JSON.parse(readFileSync(resolve(pagesDir, f), "utf8"));
    const live = p.status === "published" || (p.status === "scheduled" && Date.parse(p.publishAt) <= Date.now());
    if (["embedded", "game"].includes(p.meta?.pageType)) continue;
    assert.equal(existsSync(resolve(output, p.path.replace(/^\//, ""), "index.html")), live, `${p.id}: built must equal live (${p.status})`);
  }
  console.log(`Routes verified: ${Object.keys(redirects).length - 1} redirects, sitemap, robots, feed, lifecycle.`);
}
