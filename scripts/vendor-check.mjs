// vendor/fizlet must be exactly the snapshot ORIGIN.json describes (never edited by hand).
//   node scripts/vendor-check.mjs   (npm test runs it through tests/vendor-fizlet.test.mjs)
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export function checkVendor(dir = "vendor/fizlet") {
  const origin = JSON.parse(readFileSync(join(dir, "ORIGIN.json"), "utf8"));
  const files = [];
  const walk = (d) => readdirSync(d).forEach((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : files.push(relative(dir, join(d, n)))));
  walk(dir);
  const listed = new Map(origin.files.map((f) => [f.path, f.sha256]));
  const bad = files.filter((f) => f !== "ORIGIN.json" && listed.get(f) !== createHash("sha256").update(readFileSync(join(dir, f))).digest("hex"));
  const missing = [...listed.keys()].filter((f) => !files.includes(f));
  if (bad.length || missing.length) throw new Error(`${dir} differs from its ORIGIN.json: ${[...bad, ...missing].join(", ")} (run node scripts/sync-fizlet.mjs)`);
  return `${dir}: Fizlet ${origin.version} (${origin.commit.slice(0, 7)}), ${files.length - 1} files verified`;
}

if (import.meta.url === `file://${process.argv[1]}`) console.log(checkVendor());
