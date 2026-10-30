// What site/releases.json must hold: every released tag of every game, read from the game's repo.
// Shared by scripts/sync-releases.mjs (writes the file) and tests/site-releases.mjs (fails when a
// released tag is missing from it).
import { execFileSync } from "node:child_process";

// Arcade games (games.json): the oldest tag each game's hub factory can mount (earlier builds
// predate the engine API). Their builds are archived into the hub (site-kit/scripts/releases.mjs).
export const FIRST = {
  "sherman-bytes": "v0.1.0",
  "swarm-protocol": "v1.0.13",
  "byte-runner": "v0.2.0",
  "null-invaders": "v0.3.0",
};
// Board games: listed from their first tag. Their builds are served by their own sites
// (dom-battlefield: /v/<version>/), never bundled into the hub.
export const BOARD = {
  "dom-battlefield": "v0.1.0",
  "dom-battlefield-blitz": "v0.1.0",
};

const parse = (v) => v.slice(1).split(".").map(Number);
export const compare = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

/** `git ls-remote --tags` output → Map(version → commit). Peeled (^{}) entries name the commit
 *  behind an annotated tag, so they win over the tag object's own id. */
export function parseTags(text) {
  const tags = new Map();
  for (const line of text.trim().split("\n")) {
    const [commit, ref] = line.split("\t");
    const match = /^refs\/tags\/(v\d+\.\d+\.\d+)(\^\{\})?$/.exec(ref ?? "");
    if (match && (match[2] || !tags.has(match[1]))) tags.set(match[1], commit);
  }
  return tags;
}

/** Every tag from `first` on, newest first, each pinned to its commit. */
export function catalogFrom(tags, first) {
  return [...tags]
    .filter(([v]) => compare(v, first) >= 0)
    .sort(([a], [b]) => compare(b, a))
    .map(([version, commit]) => ({ version, commit }));
}

export function remoteTags(name) {
  return parseTags(
    execFileSync("git", ["ls-remote", "--tags", `https://github.com/coded-dot-design/${name}.git`], {
      encoding: "utf8",
    }),
  );
}

/** The whole catalog, from the network: { game: [{ version, commit }] }. */
export function remoteCatalog() {
  const catalog = {};
  for (const [name, first] of Object.entries({ ...FIRST, ...BOARD }))
    catalog[name] = catalogFrom(remoteTags(name), first);
  return catalog;
}
