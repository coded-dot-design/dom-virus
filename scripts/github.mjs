// Where the games' repos live, and how the build reads them (migration 2026-11-20: the fizlet org,
// private, all rights reserved). Every read tries the fizlet/ address first, then the old
// coded-dot-design/ one: before a transfer only the old one answers (GitHub redirects it after one),
// and a fresh repo's archived predecessor keeps its release tags. A private repo needs a read
// token: set GAMES_READ_TOKEN (fine-grained, contents: read on the game repos; a repository secret
// in CI). It reaches git as an auth header through git's environment config, never in argv or a
// .git/config, and git never prompts.
import { execFileSync } from "node:child_process";

const OLD_OWNER = "coded-dot-design";
/** Old repo name -> its name in the fizlet org (fresh repos that were renamed). */
const RENAMED = { "dom-battlefield": "battlefield", "dom-battlefield-blitz": "battlefield-blitz", "dom-crossfire": "battlefield-crossfire" };

/** The repo's page on GitHub (links, codeRepository). */
export const repoUrl = (name) => `https://github.com/fizlet/${RENAMED[name] ?? name}`;
/** Clone addresses, in the order the build tries them. */
export const gitUrls = (name) => [`${repoUrl(name)}.git`, `https://github.com/${OLD_OWNER}/${name}.git`];

const gitEnv = () => {
  const env = { ...process.env, GIT_TERMINAL_PROMPT: "0" };
  const token = process.env.GAMES_READ_TOKEN;
  if (token) {
    const n = Number(env.GIT_CONFIG_COUNT || 0);
    env.GIT_CONFIG_COUNT = String(n + 1);
    env[`GIT_CONFIG_KEY_${n}`] = "http.https://github.com/.extraheader";
    env[`GIT_CONFIG_VALUE_${n}`] = `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${token}`).toString("base64")}`;
  }
  return env;
};

/** Run git with args(url) against each address until one works; returns its stdout. `accept(out)`
 *  can pass on an answer (e.g. a repo with no tags yet). */
export function gitAny(name, args, { accept = () => true, stdio = ["ignore", "pipe", "pipe"] } = {}) {
  let last;
  for (const url of gitUrls(name)) {
    try {
      const out = execFileSync("git", args(url), { encoding: "utf8", env: gitEnv(), stdio }) ?? "";
      if (accept(out)) return out;
      last = new Error(`${url}: nothing usable`);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

/** `git ls-remote --tags` from the first address that lists any tag. */
export const remoteTagsText = (name) => gitAny(name, (url) => ["ls-remote", "--tags", url], { accept: (out) => /refs\/tags\//.test(out) });
/** `git clone <extra> <url> <dest>` from the first address that works. */
export const cloneAny = (name, extra, dest) => gitAny(name, (url) => ["clone", ...extra, url, dest], { stdio: "inherit" });
