import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pins = JSON.parse(readFileSync(resolve(root, "games.json"), "utf8"));
for (const [name, ref] of Object.entries(pins)) {
  if (existsSync(resolve(root, "..", name, "src"))) continue;
  const dest = resolve(root, ".games", name);
  if (existsSync(resolve(dest, "src"))) continue;
  mkdirSync(resolve(root, ".games"), { recursive: true });
  console.log(`Preparing ${name} (${ref})…`);
  execFileSync(
    "git",
    [
      "clone",
      "--depth",
      "1",
      "--branch",
      ref,
      `https://github.com/coded-dot-design/${name}.git`,
      dest,
    ],
    { stdio: "inherit" },
  );
}
