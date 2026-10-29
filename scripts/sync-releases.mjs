// Rewrites site/releases.json from each game's tags: every release from the
// first hub-compatible one up to (not including) the version pinned in
// games.json, newest first, each pinned to its tag's commit.
// Run after pinning a new game version: npm run sync:releases
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

// Oldest tag each game's hub factory can mount (earlier builds predate the engine API).
const FIRST = {
  "sherman-bytes": "v0.1.0",
  "swarm-protocol": "v1.0.13",
  "byte-runner": "v0.2.0",
  "null-invaders": "v0.3.0",
};
const root = process.cwd();
const pins = JSON.parse(readFileSync(resolve(root, "games.json"), "utf8"));
const parse = (v) => v.slice(1).split(".").map(Number);
const compare = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};
const catalog = {};
for (const [name, pin] of Object.entries(pins)) {
  const first = FIRST[name];
  if (!first) throw Error(`No first archived release for ${name}`);
  const refs = execFileSync(
    "git",
    ["ls-remote", "--tags", `https://github.com/coded-dot-design/${name}.git`],
    { encoding: "utf8" },
  );
  const tags = new Map();
  for (const line of refs.trim().split("\n")) {
    const [commit, ref] = line.split("\t");
    const match = /^refs\/tags\/(v\d+\.\d+\.\d+)(\^\{\})?$/.exec(ref);
    // Peeled (^{}) entries name the commit behind an annotated tag.
    if (match && (match[2] || !tags.has(match[1]))) tags.set(match[1], commit);
  }
  catalog[name] = [...tags]
    .filter(([v]) => compare(v, first) >= 0 && compare(v, pin) < 0)
    .sort(([a], [b]) => compare(b, a))
    .map(([version, commit]) => ({ version, commit }));
  console.log(
    `${name}: ${catalog[name].length} archived release(s) before ${pin}.`,
  );
}
writeFileSync(
  resolve(root, "site/releases.json"),
  JSON.stringify(catalog, null, 2) + "\n",
);
