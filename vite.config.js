import { defineConfig } from "vite";
import { resolve } from "node:path";
import {
  repoRoot as repo,
  gameRoot as gamePath,
  playgroundEntry,
} from "./scripts/game-paths.mjs";
export default defineConfig({
  root: resolve(repo, "playground"),
  resolve: {
    alias: {
      "@coded-design/dom-virus/react": resolve(repo, "src/react.ts"),
      "@coded-design/dom-virus": resolve(repo, "src/index.ts"),
      "@games/null-invaders/react": playgroundEntry("null-invaders", true),
      "@games/byte-runner/react": playgroundEntry("byte-runner", true),
      "@games/null-invaders": playgroundEntry("null-invaders"),
      "@games/byte-runner": playgroundEntry("byte-runner"),
      "@games/sherman-bytes": playgroundEntry("sherman-bytes"),
      "@games/swarm": resolve(
        gamePath("swarm-protocol"),
        "src/swarm-loader.ts",
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
