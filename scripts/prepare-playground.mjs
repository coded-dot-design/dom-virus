import { existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { games, gameRoot, entryFile } from "./game-paths.mjs";
import { cloneAny, gitAny } from "./github.mjs";
for (const [name, ref] of Object.entries(games)) {
  const dest = gameRoot(name);
  if (existsSync(resolve(dest, entryFile(name)))) continue;
  mkdirSync(dirname(dest), { recursive: true });
  console.log(`Preparing ${name} (${ref})…`);
  const commit = /^[a-f\d]{40}$/i.test(ref);
  cloneAny(name, ["--depth", "1", ...(commit ? ["--no-checkout"] : ["--branch", ref])], dest);
  if (commit) {
    gitAny(name, () => ["-C", dest, "fetch", "--depth", "1", "origin", ref], { stdio: "inherit" });
    execFileSync("git", ["-C", dest, "checkout", "--detach", ref], {
      stdio: "inherit",
    });
  }
}
