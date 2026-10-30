// Rewrites site/releases.json from each game's tags: every release (arcade games from the first
// hub-compatible one; board games from their first tag), newest first, each pinned to its tag's
// commit. The build serves the current release as "Current" and skips it in the archive
// (site-kit/scripts/releases.mjs). tests/site-releases.mjs fails when a released tag is missing.
// Run after any game release: npm run sync:releases
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { FIRST, remoteCatalog } from "./releases-catalog.mjs";

const root = process.cwd();
const pins = JSON.parse(readFileSync(resolve(root, "games.json"), "utf8"));
for (const name of Object.keys(pins))
  if (!FIRST[name]) throw Error(`No first archived release for ${name}`);
const catalog = remoteCatalog();
for (const [name, releases] of Object.entries(catalog))
  console.log(`${name}: ${releases.length} release(s), newest ${releases[0]?.version ?? "none"}.`);
writeFileSync(resolve(root, "site/releases.json"), JSON.stringify(catalog, null, 2) + "\n");
