// Discovery files for the built site (brand/SITEMAP.md), from astro-base-engine's `abe site-files`
// output committed per target in site/src/content/discovery/<target>/ (npm run engine:heads).
// The target follows the URL this build serves: production when it is targets.production's siteUrl
// in site/engine.config.json (https://domvirus.com), staging otherwise (github.io).
//   production  robots.txt + sitemap.xml + llms.txt, plus CNAME with the domain
//   staging     robots.txt only (Disallow: /), no sitemap
// Checks against the built HTML: every sitemap URL is built, on this host and indexable. An indexable
// built page missing from the engine's sitemap (a scheduled page that went live after the files were
// generated) is appended, with a note to regenerate. Run after `astro build`.
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, copyFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
const root = process.cwd();
const out = resolve(root, "artifacts/site");
const { id } = JSON.parse(readFileSync(resolve(root, "site/config.json"), "utf8"));
const cfg = JSON.parse(readFileSync(resolve(root, "site/engine.config.json"), "utf8"));
const siteRoot = new URL((process.env.SITE_BASE || `/${id}`).replace(/\/?$/, "/"), process.env.SITE_URL || "https://coded-dot-design.github.io").href;
const production = cfg.targets.production.brand.siteUrl.replace(/\/?$/, "/");
const target = siteRoot === production ? "production" : "staging";
const src = resolve(root, "site/src/content/discovery", target);
if (!existsSync(resolve(src, "robots.txt"))) throw new Error(`discovery: no ${target} files in ${src}; run npm run engine:heads`);
for (const f of ["robots.txt", "sitemap.xml", "llms.txt", "CNAME"]) rmSync(join(out, f), { force: true });
for (const f of readdirSync(src)) copyFileSync(resolve(src, f), join(out, f));

const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : []; });
const built = new Map(); // canonical -> indexable
for (const file of walk(out)) {
  const html = readFileSync(file, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] || "";
  if (canonical && canonical.startsWith(siteRoot)) built.set(canonical, !/noindex/.test(robots) || built.get(canonical) === true);
}
if (target === "production") {
  const host = new URL(production).host;
  writeFileSync(join(out, "CNAME"), `${host}\n`);
  let xml = readFileSync(join(out, "sitemap.xml"), "utf8");
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
  if (!readFileSync(join(out, "robots.txt"), "utf8").includes(`Sitemap: ${production}sitemap.xml`)) throw new Error("robots.txt must point to the sitemap");
  console.log(`Discovery (production, ${host}): sitemap ${locs.length + missing.length} URLs, robots.txt, llms.txt, CNAME`);
} else {
  console.log(`Discovery (staging, ${siteRoot}): robots.txt disallows crawlers; no sitemap. ${built.size} pages built.`);
}
