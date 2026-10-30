// Discovery files for the built site (brand/SITEMAP.md), from astro-base-engine's `abe site-files`
// output committed per target in site/src/content/discovery/<target>/ (npm run engine:heads).
// The target follows the URL this build serves: production when it is targets.production's siteUrl
// in site/engine.config.json (https://domvirus.com), staging otherwise (github.io).
//   production  robots.txt + sitemap.xml + llms.txt, plus CNAME with the domain
//   staging     robots.txt only (Disallow: /), no sitemap
// Checks against the built HTML: every sitemap URL is built, on this host and indexable. An indexable
// built page missing from the engine's sitemap (a scheduled page that went live after the files were
// generated) is appended, with a note to regenerate. Routes the build hides (an unready game and the
// posts about it; site-kit/lifecycle.mjs) come out of the engine's sitemap and llms.txt first.
// Run after `astro build`.
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, copyFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { SITE_ROOT as siteRoot, PRODUCTION_ROOT as production, TARGET as target, HIDDEN_ROUTES } from "../lifecycle.mjs";
const root = process.cwd();
const out = resolve(root, "artifacts/site");
const src = resolve(root, "site/src/content/discovery", target);
if (!existsSync(resolve(src, "robots.txt"))) throw new Error(`discovery: no ${target} files in ${src}; run npm run engine:heads`);
for (const f of ["robots.txt", "sitemap.xml", "llms.txt", "CNAME"]) rmSync(join(out, f), { force: true });
for (const f of readdirSync(src)) copyFileSync(resolve(src, f), join(out, f));

const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : []; });
const built = new Map(); // canonical -> indexable
const heads = new Map(); // canonical -> { title, description } (llms.txt rows for site-owned pages)
const unesc = (s = "") => s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
for (const file of walk(out)) {
  const html = readFileSync(file, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] || "";
  if (canonical && canonical.startsWith(siteRoot)) built.set(canonical, !/noindex/.test(robots) || built.get(canonical) === true);
  if (canonical && !/noindex/.test(robots)) heads.set(canonical, { title: unesc(html.match(/<title>([^<]*)<\/title>/)?.[1]), description: unesc(html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1]) });
}
if (target === "production") {
  const host = new URL(production).host;
  writeFileSync(join(out, "CNAME"), `${host}\n`);
  const hidden = HIDDEN_ROUTES.map((r) => production + r);
  let xml = readFileSync(join(out, "sitemap.xml"), "utf8").replace(/^\s*<url><loc>([^<]+)<\/loc>.*<\/url>\n/gm, (row, loc) => (hidden.includes(loc) ? "" : row));
  writeFileSync(join(out, "sitemap.xml"), xml);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const loc of locs) {
    if (!loc.startsWith(production)) throw new Error(`sitemap: ${loc} is not on ${production}`);
    if (!built.has(loc)) throw new Error(`sitemap: ${loc} is not a built page`);
    if (!built.get(loc)) throw new Error(`sitemap: ${loc} is built noindex`);
  }
  const missing = [...built].filter(([u, ok]) => ok && !locs.includes(u)).map(([u]) => u).sort();
  if (missing.length) {
    xml = xml.replace("</urlset>", missing.map((u) => `  <url><loc>${u}</loc></url>\n`).join("") + "</urlset>");
    writeFileSync(join(out, "sitemap.xml"), xml);
    console.warn(`sitemap: appended ${missing.length} indexable page(s) not in the engine's file (run npm run engine:heads): ${missing.join(", ")}`);
  }
  // llms.txt lists the engine's pages; the site's own indexable pages (home, games, engine…) join
  // them under "Site", so llms.txt covers exactly the sitemap.
  let llms = readFileSync(join(out, "llms.txt"), "utf8").replace(/^- \[[^\]]*\]\(([^)]+)\).*\n/gm, (row, u) => (hidden.includes(u.replace(/\/?$/, "/")) ? "" : row));
  writeFileSync(join(out, "llms.txt"), llms);
  const sitemapUrls = [...locs, ...missing];
  const own = sitemapUrls.filter((u) => !llms.includes(`](${u})`)).sort();
  if (own.length) {
    llms = llms.trimEnd() + "\n\n## Site\n\n" + own.map((u) => `- [${heads.get(u)?.title || u}](${u}): ${heads.get(u)?.description || ""}`.trimEnd()).join("\n") + "\n";
    writeFileSync(join(out, "llms.txt"), llms);
  }
  const listed = [...llms.matchAll(/^- \[[^\]]*\]\(([^)]+)\)/gm)].map((m) => m[1].replace(/\/?$/, "/"));
  for (const u of sitemapUrls) if (!listed.includes(u)) throw new Error(`llms.txt: ${u} is in the sitemap but not listed`);
  if (listed.length !== sitemapUrls.length) throw new Error(`llms.txt lists ${listed.length} pages, the sitemap ${sitemapUrls.length}`);
  if (!readFileSync(join(out, "robots.txt"), "utf8").includes(`Sitemap: ${production}sitemap.xml`)) throw new Error("robots.txt must point to the sitemap");
  console.log(`Discovery (production, ${host}): sitemap ${locs.length + missing.length} URLs, llms.txt ${listed.length} (${own.length} site pages), robots.txt, CNAME`);
} else {
  console.log(`Discovery (staging, ${siteRoot}): robots.txt disallows crawlers; no sitemap. ${built.size} pages built.`);
}
