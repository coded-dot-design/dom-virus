import {
  cpSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  mkdirSync,
} from "node:fs";
import { resolve, relative } from "node:path";
import { createHash } from "node:crypto";
const root = process.cwd();
const kit = resolve(root, "site-kit");
const { kitVersion } = JSON.parse(
  readFileSync(resolve(root, "site/config.json"), "utf8"),
);
const hash = createHash("sha256");
function digest(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const path = resolve(dir, item.name);
    if (item.isDirectory()) digest(path);
    else hash.update(relative(kit, path)).update(readFileSync(path));
  }
}
digest(kit);
const sourceSha256 = hash.digest("hex");
for (const name of ["null-invaders", "byte-runner", "swarm-protocol"]) {
  const repo = resolve(root, "..", name);
  const dest = resolve(repo, "site/shared");
  rmSync(dest, { recursive: true, force: true });
  cpSync(kit, dest, { recursive: true });
  mkdirSync(resolve(repo, "site/src/pages"), { recursive: true });
  cpSync(
    resolve(root, "site/src/pages/index.astro"),
    resolve(repo, "site/src/pages/index.astro"),
  );
  writeFileSync(
    resolve(repo, "site/astro.config.mjs"),
    `export { default } from './shared/config.mjs';\n`,
  );
  writeFileSync(
    resolve(repo, "site/config.json"),
    JSON.stringify({ id: name, kitVersion }, null, 2) + "\n",
  );
  writeFileSync(
    resolve(dest, "ORIGIN.json"),
    JSON.stringify(
      {
        project: "https://github.com/coded-dot-design/dom-virus",
        version: kitVersion,
        sourceSha256,
        note: "Generated site kit. Edit dom-virus/site-kit, then run npm run sync:sites. Game content remains owned by site/game.json in this repository.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`${name}: shared Astro site kit synchronized.`);
}
