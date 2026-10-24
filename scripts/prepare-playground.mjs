import { existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { games, gameRoot, entryFile } from "./game-paths.mjs";
for (const [name, ref] of Object.entries(games)) {
  const dest = gameRoot(name);
  if (existsSync(resolve(dest, entryFile(name)))) continue;
  mkdirSync(dirname(dest), { recursive: true });
  console.log(`Preparing ${name} (${ref})…`);
  const commit = /^[a-f\d]{40}$/i.test(ref);
  execFileSync(
    "git",
    [
      "clone",
      "--depth",
      "1",
      ...(commit ? ["--no-checkout"] : ["--branch", ref]),
      `https://github.com/coded-dot-design/${name}.git`,
      dest,
    ],
    { stdio: "inherit" },
  );
  if (commit) {
    execFileSync("git", ["-C", dest, "fetch", "--depth", "1", "origin", ref], {
      stdio: "inherit",
    });
    execFileSync("git", ["-C", dest, "checkout", "--detach", ref], {
      stdio: "inherit",
    });
  }
}
