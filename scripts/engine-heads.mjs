// Writes astro-base-engine `<head>` output for every page JSON in site/src/content/pages into
// site/src/content/heads/<id>.html, which Site.astro injects for that page.
//   node scripts/engine-heads.mjs           write the heads
//   node scripts/engine-heads.mjs --check   fail if a committed head is stale
// The engine is a separate (private) Python repo, so this runs where it is checked out:
// ABE_ENGINE=<astro-engine>/engine (default ../astro-engine/engine). CI does not run it; the
// site build instead fails if a head's canonical does not match the page's real URL.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const engine = resolve(root, process.env.ABE_ENGINE || "../astro-engine/engine");
const pages = resolve(root, "site/src/content/pages");
const heads = resolve(root, "site/src/content/heads");
const check = process.argv.includes("--check");
if (!existsSync(engine)) {
  console.error(`astro-base-engine not found at ${engine} (set ABE_ENGINE).`);
  process.exit(1);
}
mkdirSync(heads, { recursive: true });
let stale = 0;
for (const file of readdirSync(pages).filter((f) => f.endsWith(".json"))) {
  const id = file.slice(0, -5);
  const html = execFileSync("python3", ["-m", "astro_base_engine", "head", id, "--site", "site"], {
    cwd: root,
    env: { ...process.env, PYTHONPATH: engine },
    encoding: "utf8",
  });
  const dest = resolve(heads, `${id}.html`);
  if (check) {
    const same = existsSync(dest) && readFileSync(dest, "utf8") === html;
    if (!same) stale++, console.error(`stale: site/src/content/heads/${id}.html`);
  } else {
    writeFileSync(dest, html);
    console.log(`wrote site/src/content/heads/${id}.html`);
  }
}
if (stale) process.exit(1);
