// The footer site map against the built site (artifacts/site), for either target. Every page this
// build indexes is linked from the footer exactly once, in the column site-kit/footer-map.mjs puts
// it in; nothing the build does not index is (redirects, noindex pages, hidden games and their posts,
// archive pages). Production: "indexed" is sitemap.xml, which must match the built pages. Staging
// has no sitemap: the built pages with their own canonical and no noindex.
// Run after npm run site:build (it runs with npm run site:test:lifecycle).
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { FAMILY_LINE, GROUPS, SELF, groupOf, unlisted } from "../site-kit/footer-map.mjs";

const out = resolve("artifacts/site");
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(resolve(dir, e.name)) : e.name === "index.html" ? [resolve(dir, e.name)] : []));
const pages = walk(out).map((file) => {
  const html = readFileSync(file, "utf8");
  const route = relative(out, file).split(sep).slice(0, -1).map((s) => `${s}/`).join("");
  return { file, route, html, canonical: html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], noindex: /<meta name="robots" content="[^"]*noindex/.test(html) };
});
const home = pages.find((p) => p.route === "");
const root = home.canonical; // https://domvirus.com/ or https://coded-dot-design.github.io/dom-virus/
const basePath = new URL(root).pathname;
const production = existsSync(resolve(out, "CNAME"));

// What this build indexes.
const indexable = pages.filter((p) => !p.noindex && p.canonical === root + p.route).map((p) => p.route).sort();
let indexed = indexable;
if (production) {
  indexed = [...readFileSync(resolve(out, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].slice(root.length)).sort();
  assert.deepEqual(indexed, indexable, "sitemap.xml lists exactly the indexable built pages");
}
if (production) for (const f of FAMILY_LINE) if (f.href !== SELF) assert.ok(!readFileSync(resolve(out, "sitemap.xml"), "utf8").includes(f.href), `sitemap.xml has no ${f.href}`);
const listed = indexed.filter((r) => !unlisted(r));
assert.ok(listed.length > 20, `footer lists ${listed.length} pages`);

let checked = 0;
for (const page of pages) {
  const nav = page.html.match(/<nav\b[^>]*aria-label="Site map"[^>]*>([\s\S]*?)<\/nav>/);
  if (!nav) {
    assert.ok(page.noindex || !/class="site-footer"/.test(page.html), `${page.route || "/"} has a footer but no site map`);
    continue;
  }
  checked++;
  const where = page.route || "/";
  assert.match(page.html.match(/<footer\b[\s\S]*<\/footer>/)?.[0] || "", /aria-label="Site map"/, `${where}: the site map sits in the footer`);
  const columns = [...nav[1].matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>\s*<ul\b[^>]*>([\s\S]*?)<\/ul>/g)];
  assert.deepEqual(columns.map((c) => c[1].replace(/<[^>]+>/g, "").replace(/^\d+/, "")), GROUPS.map((g) => g.heading), `${where}: one h2 + ul per column, in order`);
  const seen = new Map();
  const current = [];
  for (const [i, [, , list]] of columns.entries()) {
    const group = GROUPS[i].id;
    if (GROUPS[i].external) {
      // The family line: the four family sites, in order, ↗ on all but this one; never in sitemap.xml.
      const family = [...list.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, text]) => [href, text.replace(/<[^>]+>/g, "").trim()]);
      assert.deepEqual(family, FAMILY_LINE.map((f) => [f.href, f.href === SELF ? f.label : `${f.label} ↗`]), `${where}: the family line`);
      continue;
    }
    for (const [tag, href] of list.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)) {
      if (/\/feed\.xml$/.test(href)) continue; // the RSS link: a feed, not a page
      assert.ok(href.startsWith(basePath), `${where}: ${href} stays on the site`);
      const route = href.slice(basePath.length);
      assert.ok(listed.includes(route), `${where}: links ${href}, which this build does not index (or lists as archive)`);
      assert.equal(groupOf(route), group, `${where}: ${href} sits under ${group}, not ${groupOf(route)}`);
      seen.set(route, (seen.get(route) || 0) + 1);
      if (/aria-current="page"/.test(tag)) current.push(route);
    }
  }
  for (const r of listed) assert.equal(seen.get(r) || 0, 1, `${where}: /${r} is linked ${seen.get(r) || 0} times`);
  assert.deepEqual(current, listed.includes(page.route) ? [page.route] : [], `${where}: aria-current marks this page only`);
}
assert.ok(checked >= listed.length, `site map checked on ${checked} pages`);
console.log(`Footer site map (${production ? "production" : "staging"}): ${listed.length} pages in ${GROUPS.length} columns, each linked once, on all ${checked} pages with a footer; ${indexed.length - listed.length} archive page(s) left out.`);
