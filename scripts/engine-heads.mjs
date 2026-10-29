// Writes astro-base-engine `<head>` output for every page JSON in site/src/content/pages, once per
// target in site/engine.config.json:
//   staging    (https://coded-dot-design.github.io/dom-virus) -> site/src/content/heads/<id>.html
//   production (https://domvirus.com)                         -> site/src/content/heads/production/<id>.html
// Site.astro picks the head whose canonical matches the URL the build serves, so the same commit
// builds correctly for github.io and for the domain (SITE_URL / SITE_BASE repo variables).
// Also writes the engine's discovery files per target (`abe site-files`) to
// site/src/content/discovery/<target>/: staging = robots.txt (Disallow: /); production = robots.txt,
// sitemap.xml, llms.txt on https://domvirus.com. site-kit/scripts/sitemap.mjs copies the set that
// matches the build into the artifact and checks it against the built pages.
//   node scripts/engine-heads.mjs           write the heads
//   node scripts/engine-heads.mjs --check   fail if a committed head is stale or missing
// The engine is a separate (private) Python repo, so this runs where it is checked out:
// ABE_ENGINE=<astro-engine>/engine (default ../astro-engine/engine). CI does not run it; the
// site build instead fails if no head's canonical matches the page's real URL.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const engine = resolve(root, process.env.ABE_ENGINE || "../astro-engine/engine");
const pages = resolve(root, "site/src/content/pages");
const targets = { staging: "site/src/content/heads", production: "site/src/content/heads/production" };
const check = process.argv.includes("--check");
if (!existsSync(engine)) {
  console.error(`astro-base-engine not found at ${engine} (set ABE_ENGINE).`);
  process.exit(1);
}
let stale = 0;
for (const [target, dir] of Object.entries(targets)) {
  const heads = resolve(root, dir);
  mkdirSync(heads, { recursive: true });
  for (const file of readdirSync(pages).filter((f) => f.endsWith(".json"))) {
    const id = file.slice(0, -5);
    const html = execFileSync("python3", ["-m", "astro_base_engine", "head", id, "--site", "site", "--target", target], {
      cwd: root,
      env: { ...process.env, PYTHONPATH: engine },
      encoding: "utf8",
    });
    const dest = resolve(heads, `${id}.html`);
    if (check) {
      const same = existsSync(dest) && readFileSync(dest, "utf8") === html;
      if (!same) stale++, console.error(`stale: ${dir}/${id}.html`);
    } else {
      writeFileSync(dest, html);
    }
  }
  if (!check) console.log(`wrote ${readdirSync(pages).filter((f) => f.endsWith(".json")).length} ${target} heads to ${dir}/`);
}
// Discovery files. --check compares against a fresh run in a temp folder.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
for (const target of Object.keys(targets)) {
  const dir = `site/src/content/discovery/${target}`;
  const out = check ? mkdtempSync(resolve(tmpdir(), "abe-")) : resolve(root, dir);
  if (!check) rmSync(out, { recursive: true, force: true }), mkdirSync(out, { recursive: true });
  execFileSync("python3", ["-m", "astro_base_engine", "site-files", "--site", "site", "--target", target, "--out", out], {
    cwd: root,
    env: { ...process.env, PYTHONPATH: engine },
    encoding: "utf8",
  });
  for (const f of readdirSync(out)) {
    if (!check) continue;
    const dest = resolve(root, dir, f);
    if (!existsSync(dest) || readFileSync(dest, "utf8") !== readFileSync(resolve(out, f), "utf8")) stale++, console.error(`stale: ${dir}/${f}`);
  }
  if (check) rmSync(out, { recursive: true, force: true });
  else console.log(`wrote ${target} discovery files to ${dir}/: ${readdirSync(out).join(", ")}`);
}
if (stale) process.exit(1);
console.log(check ? "engine heads are current for staging and production" : "done");
