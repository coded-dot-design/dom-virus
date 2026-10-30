import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { TARGET, HIDDEN_PAGES, HIDDEN_ROUTES, mentionsHidden } from "../lifecycle.mjs";
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
  const whileHidden = Object.entries(redirects.$whileHidden || {}).filter(([k]) => HIDDEN_ROUTES.includes(k));
  const moved = [...Object.entries(redirects).filter(([k]) => !k.startsWith("$")), ...whileHidden];
  for (const [from, to] of moved) {
    const page = readFileSync(resolve(output, from, "index.html"), "utf8");
    assert(page.includes(`url=${base}/${to}`), `Redirect ${from} must point to ${to}`);
    assert(page.includes('content="noindex,follow"'), `Redirect ${from} must be noindex`);
    assert(existsSync(resolve(output, to, "index.html")), `Redirect target missing: ${to}`);
  }
  // Discovery files per target (site-kit/scripts/sitemap.mjs): production has a sitemap and CNAME,
  // staging only a robots.txt that blocks crawlers.
  const robots = readFileSync(resolve(output, "robots.txt"), "utf8");
  if (existsSync(resolve(output, "sitemap.xml"))) {
    const sitemap = readFileSync(resolve(output, "sitemap.xml"), "utf8");
    assert(sitemap.includes("/about/</loc>") && !sitemap.includes("/under-the-hood/"), "Sitemap must list live pages only.");
    assert(robots.includes("Sitemap: "), "robots.txt must point to the sitemap.");
    assert(existsSync(resolve(output, "CNAME")), "A production build names its domain in CNAME.");
  } else {
    assert(/Disallow: \/\n/.test(robots), "A staging build's robots.txt must block crawlers.");
  }
  assert(readFileSync(resolve(output, "feed.xml"), "utf8").includes("<item>"), "RSS feed must have items.");
  // Drafts and not-yet-due scheduled pages never ship (E7), nor posts about a hidden game.
  const pagesDir = "site/src/content/pages";
  for (const f of readdirSync(pagesDir)) {
    const p = JSON.parse(readFileSync(resolve(pagesDir, f), "utf8"));
    const live = !HIDDEN_PAGES.includes(p.id) && (p.status === "published" || (p.status === "scheduled" && Date.parse(p.publishAt) <= Date.now()));
    if (["embedded", "game"].includes(p.meta?.pageType)) continue;
    const page = resolve(output, p.path.replace(/^\//, ""), "index.html");
    // A hidden post's old URL may hold its redirect page (site/redirects.json).
    const built = existsSync(page) && !readFileSync(page, "utf8").includes('content="noindex,follow"');
    assert.equal(built, live, `${p.id}: built must equal live (${p.status})`);
  }
  // A game the build hides (unready in the model; production only, site-kit/lifecycle.mjs) is gone
  // from every page, feed and discovery file; its routes are redirects or nothing.
  if (HIDDEN_ROUTES.length) {
    const files = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(resolve(dir, e.name)) : /\.(html|xml|txt)$/.test(e.name) ? [resolve(dir, e.name)] : []));
    for (const f of files(output)) assert(!mentionsHidden(readFileSync(f, "utf8")), `${f.slice(output.length + 1)} names a game this ${TARGET} build hides`);
    for (const r of HIDDEN_ROUTES) {
      const page = resolve(output, r, "index.html");
      assert(!existsSync(page) || readFileSync(page, "utf8").includes('content="noindex,follow"'), `${r} must not be a page in a ${TARGET} build`);
    }
  }
  console.log(`Routes verified: ${moved.length} redirects, sitemap, robots, feed, lifecycle.`);
}
