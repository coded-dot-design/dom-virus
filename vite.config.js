import { defineConfig } from "vite";
import { resolve } from "node:path";
import {
  repoRoot as repo,
  gameRoot as gamePath,
} from "./scripts/game-paths.mjs";
export default defineConfig({
  root: resolve(repo, "playground"),
  resolve: {
    alias: {
      "@coded-design/dom-virus/react": resolve(repo, "src/react.ts"),
      "@coded-design/dom-virus": resolve(repo, "src/index.ts"),
      "@games/null-invaders/react": resolve(
        gamePath("null-invaders"),
        "src/react.ts",
      ),
      "@games/byte-runner/react": resolve(
        gamePath("byte-runner"),
        "src/react.ts",
      ),
      "@games/null-invaders": resolve(
        gamePath("null-invaders"),
        "src/index.ts",
      ),
      "@games/byte-runner": resolve(gamePath("byte-runner"), "src/index.ts"),
      "@games/sherman-bytes": resolve(
        gamePath("sherman-bytes"),
        "src/index.ts",
      ),
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
        gamePath("sherman-bytes"),
      ],
    },
  },
  build: { outDir: resolve(repo, "dist/playground"), emptyOutDir: true },
});
