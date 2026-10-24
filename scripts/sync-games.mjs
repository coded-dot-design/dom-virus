import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
const { version } = JSON.parse(readFileSync("package.json", "utf8"));
const hash = createHash("sha256");
for (const file of readdirSync("src").sort())
  hash.update(file).update(readFileSync(resolve("src", file)));
const sourceSha256 = hash.digest("hex");
const selected = process.argv.slice(2);
for (const name of selected)
  if (!["null-invaders", "byte-runner", "sherman-bytes"].includes(name))
    throw new Error(`Unknown game: ${name}`);
let count = 0;
for (const name of ["null-invaders", "byte-runner", "sherman-bytes"]) {
  if (selected.length && !selected.includes(name)) continue;
  const repo = resolve("..", name);
  if (!existsSync(resolve(repo, "src/index.ts"))) continue;
  const manifest = JSON.parse(
    readFileSync(resolve(repo, "package.json"), "utf8"),
  );
  if (manifest.name !== `@coded-design/${name}`)
    throw new Error(`Unexpected package in ${repo}`);
  const shared = resolve(repo, "shared");
  rmSync(resolve(shared, "types"), { recursive: true, force: true });
  mkdirSync(resolve(shared, "types"), { recursive: true });
  rmSync(resolve(shared, "core.d.ts"), { force: true });
  copyFileSync("dist/index.js", resolve(shared, "core.js"));
  copyFileSync("dist/react.js", resolve(shared, "react.js"));
  copyFileSync("scripts/build-game.mjs", resolve(shared, "build-game.mjs"));
  for (const file of readdirSync("dist"))
    if (file.endsWith(".d.ts"))
      copyFileSync(resolve("dist", file), resolve(shared, "types", file));
  writeFileSync(
    resolve(shared, "ORIGIN.json"),
    JSON.stringify(
      {
        project: "https://github.com/coded-dot-design/dom-virus",
        version,
        sourceSha256,
        license: "MIT",
        note: "Generated engine, React adapter, declarations and builder. Edit dom-virus/src, then run npm run sync:games and rebuild each game.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`${name}: engine ${version} snapshot synchronized.`);
  count++;
}
if (!count)
  throw new Error(
    "No sibling TypeScript game checkouts found. Clone null-invaders and byte-runner beside dom-virus.",
  );

// Swarm keeps its own gameplay engine and consumes only this standalone helper.
const swarm = resolve("..", "swarm-protocol");
if (existsSync(resolve(swarm, "src/dom-defender.ts"))) {
  mkdirSync(resolve(swarm, "shared"), {recursive:true});
  copyFileSync("src/game-controls.ts", resolve(swarm, "shared/game-controls.ts"));
  copyFileSync("src/zoom-lock.ts", resolve(swarm, "shared/zoom-lock.ts"));
  copyFileSync("src/attachments.ts", resolve(swarm, "shared/attachments.ts"));
}
