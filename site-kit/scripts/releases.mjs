import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  cpSync,
  rmSync,
  readdirSync,
} from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const command = (cwd, ...args) =>
  execFileSync(args[0], args.slice(1), {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
// current: { game: "vX.Y.Z" } the build serves as "Current"; that release is not archived again.
// A listed release newer than current (tagged, not yet served) is marked newer.
const parse = (v) => v.slice(1).split(".").map(Number);
const newer = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  return (x[0] - y[0] || x[1] - y[1] || x[2] - y[2]) > 0;
};
export function prepareArchives(root, names, current = {}) {
  const manifest = resolve(root, "site/releases.json");
  if (!existsSync(manifest)) return {};
  const catalog = JSON.parse(readFileSync(manifest, "utf8"));
  const out = resolve(root, "site/generated/public/releases");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const prepared = {};
  for (const name of names) {
    prepared[name] = [];
    for (const entry of catalog[name] || []) {
      const { version, commit } = entry;
      if (version === current[name]) continue;
      if (!/^v\d+\.\d+\.\d+$/.test(version) || !/^[a-f0-9]{40}$/.test(commit))
        throw Error(`Invalid release pin: ${name}`);
      const checkout = resolve(root, ".site-releases", name, version);
      if (!existsSync(resolve(checkout, ".git"))) {
        mkdirSync(dirname(checkout), { recursive: true });
        command(
          root,
          "git",
          "clone",
          "--depth",
          "1",
          "--branch",
          version,
          `https://github.com/coded-dot-design/${name}.git`,
          checkout,
        );
      }
      if (command(checkout, "git", "rev-parse", "HEAD") !== commit)
        throw Error(`Release tag changed: ${name} ${version}`);
      const pkg = JSON.parse(
        readFileSync(resolve(checkout, "package.json"), "utf8"),
      );
      if (`v${pkg.version}` !== version)
        throw Error(`Version mismatch: ${name} ${version}`);
      if (!existsSync(resolve(checkout, "dist/index.js"))) {
        command(checkout, "npm", "ci", "--no-audit", "--no-fund");
        command(checkout, "npm", "run", "build");
      }
      const destination = resolve(out, name, version);
      mkdirSync(destination, { recursive: true });
      const hashes = {};
      const copy = (dir) => {
        for (const item of readdirSync(dir, { withFileTypes: true })) {
          const source = resolve(dir, item.name);
          if (item.isDirectory()) copy(source);
          else if (item.name.endsWith(".js")) {
            const file = relative(resolve(checkout, "dist"), source);
            mkdirSync(dirname(resolve(destination, file)), { recursive: true });
            cpSync(source, resolve(destination, file));
            hashes[file] = createHash("sha256")
              .update(readFileSync(source))
              .digest("hex");
          }
        }
      };
      copy(resolve(checkout, "dist"));
      for (const file of ["LICENSE", "THIRD_PARTY_NOTICES.md"])
        if (existsSync(resolve(checkout, file)))
          cpSync(resolve(checkout, file), resolve(destination, file));
      writeFileSync(
        resolve(destination, "release.json"),
        JSON.stringify(
          { game: name, version, commit, files: hashes },
          null,
          2,
        ) + "\n",
      );
      prepared[name].push({
        version,
        commit,
        key: `${name}@${version}`,
        newer: Boolean(current[name]) && newer(version, current[name]),
        path: `releases/${name}/${version}/index.js`,
      });
      console.log(
        `Archived ${name} ${version} at ${commit.slice(0, 7)}; ${Object.keys(hashes).length} immutable modules.`,
      );
    }
  }
  return prepared;
}
