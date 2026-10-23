import { defineConfig } from "vite";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const repo = process.cwd();
const gamePath = (name) =>
  existsSync(resolve(repo, "..", name, "src"))
    ? resolve(repo, "..", name)
    : resolve(repo, ".games", name);
export default defineConfig({
  root: resolve(repo, "playground"),
  resolve: {
    alias: {
      "@coded-design/dom-virus": resolve(repo, "src/index.js"),
      "@games/null-invaders": resolve(
        gamePath("null-invaders"),
        "src/index.js",
      ),
      "@games/byte-runner": resolve(gamePath("byte-runner"), "src/index.js"),
      "@games/swarm": resolve(
        gamePath("swarm-protocol"),
        "src/swarm-loader.js",
      ),
    },
  },
  server: {
    host: "127.0.0.1",
    fs: {
      allow: [
        repo,
        gamePath("null-invaders"),
        gamePath("byte-runner"),
        gamePath("swarm-protocol"),
      ],
    },
  },
  build: { outDir: resolve(repo, "dist/playground"), emptyOutDir: true },
});
