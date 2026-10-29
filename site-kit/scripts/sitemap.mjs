// Writes sitemap.xml and robots.txt from the built HTML (brand/SITEMAP.md): every page's canonical
// URL, skipping pages marked noindex (404, redirects, drafts). Run after `astro build`.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
const out = resolve(process.cwd(), "artifacts/site");
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") ? [p] : []; });
const urls = new Set();
for (const file of walk(out)) {
  const html = readFileSync(file, "utf8");
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] || "";
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical && !/noindex/.test(robots)) urls.add(canonical);
}
const list = [...urls].sort();
if (!list.length) throw new Error("sitemap: no indexable pages found");
const home = list.reduce((a, b) => (a.length <= b.length ? a : b));
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${list.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${home}sitemap.xml\n`);
console.log(`Sitemap: ${list.length} indexable pages; robots.txt points to ${home}sitemap.xml`);
