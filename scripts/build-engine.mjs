import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
const require = createRequire(import.meta.url);
mkdirSync("dist", { recursive: true });
for (const file of readdirSync("dist"))
  if (file.endsWith(".js") || file.endsWith(".d.ts"))
    rmSync(resolve("dist", file));
const tsc = resolve(
  dirname(require.resolve("typescript/package.json")),
  "bin/tsc",
);
execFileSync(process.execPath, [tsc, "-p", "tsconfig.build.json"], {
  stdio: "inherit",
});
for (const entry of ["index", "react"])
  await build({
    entryPoints: [`src/${entry}.ts`],
    outfile: `dist/${entry}.js`,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    minify: true,
    legalComments: "none",
    external: ["react"],
  });
console.log(
  "Shared engine: JavaScript bundles and generated declarations ready.",
);
