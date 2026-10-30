// Snapshot the part of the Fizlet engine the sites use (sibling checkout ../fizlet, or FIZLET_DIR)
// into vendor/fizlet, with provenance in vendor/fizlet/ORIGIN.json. Today that is the performance
// overlay (fizlet/perf on the kernel), the Board UI kit's Settings switch (setting, PERF_KEY),
// fizlet/timeline (the cartridge console choreography, site-kit/console/, and the detail-page scenes and
// diagrams: site-kit/loop.ts), plus the Under the hood
// labs (Fizlet's site/labs/: the same scenes as its gallery, into vendor/fizlet/labs/, their kernel
// import pointed at the vendored kernel).
//   node scripts/sync-fizlet.mjs   (check out a release tag in ../fizlet first)
// Never edit vendor/fizlet by hand: change coded-dot-design/fizlet, then run this.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";

const from = process.env.FIZLET_DIR ?? "../fizlet";
const FILES = ["kernel/index.ts", "kernel/engine.ts", "kernel/ledger.ts", "kernel/need.ts", "kernel/pool.ts", "kernel/random.ts", "kernel/ring.ts", "perf.ts", "timeline.ts", "ui/board-ui.ts"];
const sha = (f) => createHash("sha256").update(readFileSync(f)).digest("hex");
// The labs (site/labs/ in Fizlet): the only rewrite is their kernel import (../../src/ → ../).
const LABS = ["lab.ts", "index.ts", "board.ts", "duel.ts", "pipeline.ts", "pool.ts", "recall.ts", "labs.css"];
rmSync("vendor/fizlet", { recursive: true, force: true });
for (const f of FILES) {
  mkdirSync(dirname(`vendor/fizlet/${f}`), { recursive: true });
  cpSync(`${from}/src/${f}`, `vendor/fizlet/${f}`);
}
mkdirSync("vendor/fizlet/labs", { recursive: true });
for (const f of LABS) writeFileSync(`vendor/fizlet/labs/${f}`, readFileSync(`${from}/site/labs/${f}`, "utf8").replaceAll('"../../src/', '"../'));
const ALL = [...FILES, ...LABS.map((f) => `labs/${f}`)];
const version = JSON.parse(readFileSync(`${from}/package.json`, "utf8")).version;
const commit = execFileSync("git", ["-C", from, "rev-parse", "HEAD"]).toString().trim();
writeFileSync("vendor/fizlet/ORIGIN.json", JSON.stringify({
  note: "Generated snapshot (a subset: the perf overlay, the kit's Settings switch, the timeline and the Under the hood labs from site/labs/, kernel imports pointed at ../). Edit coded-dot-design/fizlet, then run node scripts/sync-fizlet.mjs.",
  repository: "https://github.com/coded-dot-design/fizlet",
  version,
  commit,
  files: ALL.map((f) => ({ path: f, sha256: sha(`vendor/fizlet/${f}`) })),
}, null, 2) + "\n");
console.log(`vendor/fizlet ← Fizlet ${version} (${commit.slice(0, 7)}): ${ALL.length} files`);
