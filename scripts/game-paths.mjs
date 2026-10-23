import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const games = JSON.parse(
  process.env.DOM_VIRUS_GAME_PINS_JSON ||
    readFileSync(resolve(repoRoot, "games.json"), "utf8"),
);
export const entryFile = (name) =>
  name === "swarm-protocol" ? "src/swarm-loader.js" : "src/index.ts";
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
