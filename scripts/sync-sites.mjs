// Game websites are retired: every game page now lives on the DOM Virus hub, and each game
// repository keeps only its content (site/game.json, site/art.json). This script only refreshes
// the hub's copy of the games' character art from sibling checkouts.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const root = process.cwd();
const characterArt = {};
for (const name of ["byte-runner", "null-invaders"])
  characterArt[name] = JSON.parse(readFileSync(resolve(root, "..", name, "site/art.json"), "utf8"));
writeFileSync(resolve(root, "site-kit/character-art.json"), JSON.stringify(characterArt, null, 2) + "\n");
console.log("Character art refreshed from byte-runner and null-invaders.");
