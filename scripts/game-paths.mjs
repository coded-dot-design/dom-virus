import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const games = JSON.parse(
  process.env.DOM_VIRUS_GAME_PINS_JSON ||
    readFileSync(resolve(repoRoot, "games.json"), "utf8"),
);
export const entryFile = (name) =>
  name === "swarm-protocol" ? "src/swarm-loader.ts" : "src/index.ts";
export function gameRoot(name) {
  const ref = games[name];
  if (!ref || !/^[\w.-]+$/.test(ref))
    throw new Error(`Invalid game version for ${name}`);
  const sibling = resolve(repoRoot, "..", name);
  if (existsSync(resolve(sibling, entryFile(name)))) return sibling;
  if (existsSync(resolve(sibling, "src")))
    throw new Error(
      `${name} has an older source layout. Run git -C ../${name} pull --ff-only origin main, then restart.`,
    );
  return resolve(repoRoot, ".games", name, ref);
}

/** The playground's import for a game: source for core-snapshot games; the built file for games on
 *  Fizlet (E3), which bake in build-time pieces (the Board UI kit CSS) that their source can't carry. */
export function playgroundEntry(name, react = false) {
  const root = gameRoot(name);
  if (existsSync(resolve(root, "vendor/fizlet/ORIGIN.json"))) return resolve(root, react ? "dist/react.js" : "dist/index.js");
  return resolve(root, react ? "src/react.ts" : entryFile(name));
}

/** The last release of each game that ran on this core, for games since ported onto Fizlet (E3). */
export const LAST_CORE_RELEASE = { "null-invaders": "v0.7.2", "byte-runner": "v0.10.2", "sherman-bytes": "v0.5.2" };
/** Where the core's own tests load a game from. A game on Fizlet no longer exercises this core, so
 *  the tests use its last core release (cloned once into .games/<name>/<tag>). */
export function coreGameRoot(name) {
  const root = gameRoot(name);
  const tag = LAST_CORE_RELEASE[name];
  if (!tag || !existsSync(resolve(root, "vendor/fizlet/ORIGIN.json"))) return root;
  const dest = resolve(repoRoot, ".games", name, tag);
  if (!existsSync(resolve(dest, "src"))) {
    mkdirSync(resolve(repoRoot, ".games", name), { recursive: true });
    execFileSync("git", ["clone", "--depth", "1", "--branch", tag, `https://github.com/coded-dot-design/${name}.git`, dest], { stdio: "inherit" });
  }
  return dest;
}
