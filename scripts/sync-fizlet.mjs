// Snapshot the part of the Fizlet engine the sites use (sibling checkout ../fizlet, or FIZLET_DIR)
// into vendor/fizlet, with provenance in vendor/fizlet/ORIGIN.json. Today that is the kernel, the
// performance overlay (fizlet/perf), the Board UI kit's Settings switch (setting, PERF_KEY) and
// fizlet/slot (the home hero's lazy mount; the hero scene runs on the kernel), and fizlet/timeline +
// fizlet/css-clock (the ambient CSS loops on the kernel clock).
//   node scripts/sync-fizlet.mjs   (check out a release tag in ../fizlet first)
// node scripts/vendor-check.mjs checks the snapshot still matches ORIGIN.json (npm test runs it).
// Never edit vendor/fizlet by hand: change coded-dot-design/fizlet, then run this.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";

const from = process.env.FIZLET_DIR ?? "../fizlet";
const FILES = ["kernel/engine.ts", "kernel/ledger.ts", "kernel/need.ts", "kernel/pool.ts", "kernel/random.ts", "kernel/ring.ts", "perf.ts", "slot.ts", "timeline.ts", "css-clock.ts", "ui/board-ui.ts"];
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
rmSync("vendor/fizlet", { recursive: true, force: true });
for (const f of FILES) {
  mkdirSync(dirname(`vendor/fizlet/${f}`), { recursive: true });
  cpSync(`${from}/src/${f}`, `vendor/fizlet/${f}`);
}
const version = JSON.parse(readFileSync(`${from}/package.json`, "utf8")).version;
const commit = execFileSync("git", ["-C", from, "rev-parse", "HEAD"]).toString().trim();
writeFileSync("vendor/fizlet/ORIGIN.json", JSON.stringify({
  note: "Generated snapshot (a subset: the kernel, the perf overlay, the kit's Settings switch, the slot, timeline and css-clock). Edit coded-dot-design/fizlet, then run node scripts/sync-fizlet.mjs.",
  repository: "https://github.com/coded-dot-design/fizlet",
  version,
  commit,
  files: FILES.map((f) => ({ path: f, sha256: sha(`vendor/fizlet/${f}`) })),
}, null, 2) + "\n");
console.log(`vendor/fizlet ← Fizlet ${version} (${commit.slice(0, 7)}): ${FILES.length} files`);
