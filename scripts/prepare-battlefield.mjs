import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const REPO = "https://github.com/coded-dot-design/dom-battlefield.git";
let pin = JSON.parse(readFileSync("battlefield.json", "utf8"));
// Hourly/main Pages builds follow the newest stable tag in the pinned major line,
// so a Battlefield release reaches the hub without a manual pin bump.
if (process.env.DOM_VIRUS_LATEST_RELEASES === "1") {
  const major = pin.ref.split(".")[0];
  const tags = execFileSync("git", ["ls-remote", "--tags", REPO], { encoding: "utf8" })
    .split("\n")
    .map((line) => line.match(/refs\/tags\/(v\d+\.\d+\.\d+)$/)?.[1])
    .filter((tag) => tag && tag.split(".")[0] === major)
    .sort((a, b) => {
      const av = a.slice(1).split(".").map(Number),
        bv = b.slice(1).split(".").map(Number);
      return bv[0] - av[0] || bv[1] - av[1] || bv[2] - av[2];
    });
  if (tags[0]) pin = { version: tags[0].slice(1), ref: tags[0] };
}
if (!/^[\w.-]+$/.test(pin.ref)) throw Error("Invalid Battlefield pin");
const sibling = resolve("../dom-battlefield");
const useSibling =
  existsSync(resolve(sibling, "src/model.ts")) &&
  process.env.DOM_VIRUS_LATEST_RELEASES !== "1";
const root = useSibling ? sibling : resolve(".apps/dom-battlefield", pin.ref);
if (!existsSync(resolve(root, "package.json"))) {
  mkdirSync(dirname(root), { recursive: true });
  execFileSync("git", ["clone", "--depth", "1", "--branch", pin.ref, REPO, root], {
    stdio: "inherit",
  });
}
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
if (pkg.name !== "@coded-design/dom-battlefield" || pkg.version !== pin.version)
  throw Error("Battlefield version does not match its site pin");
const manifest = JSON.parse(readFileSync(resolve(root, "dist/build.json"), "utf8"));
if (manifest.version !== pin.version) throw Error("Stale Battlefield build");
for (const [file, hash] of Object.entries(manifest.files)) {
  if (file.includes("..") || file.startsWith("/")) throw Error("Invalid Battlefield asset path");
  if (createHash("sha256").update(readFileSync(resolve(root, "dist", file))).digest("hex") !== hash)
    throw Error(`Battlefield asset mismatch: ${file}`);
}
const dest = resolve("site/generated/public/battlefield");
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(resolve(root, "dist"), dest, { recursive: true });
// The app's links back to the hub are absolute (for its standalone preview). Served from the hub,
// make them same-origin so Eject never bounces through a redirect (e.g. on a custom domain).
const hubBase = (process.env.SITE_BASE || "/dom-virus").replace(/\/?$/, "/");
const page = resolve(dest, "index.html");
let app = readFileSync(page, "utf8").replaceAll("https://coded-dot-design.github.io/dom-virus/", hubBase);
// Head tags for the hub's copy (canonical, Open Graph), from the app's own title and description:
// the hub serves this page, so it is its canonical address. Head only; the app itself is untouched.
const siteUrl = new URL(hubBase, process.env.SITE_URL || "https://coded-dot-design.github.io").href;
const title = app.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
const description = app.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1];
if (!title || !description) throw Error("Battlefield page lost its title or description");
if (!app.includes('rel="canonical"'))
  app = app.replace(
    "</head>",
    [
      `<link rel="canonical" href="${siteUrl}battlefield/">`,
      '<meta property="og:type" content="website">',
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${description}">`,
      `<meta property="og:url" content="${siteUrl}battlefield/">`,
      `<meta property="og:image" content="${siteUrl}og/dom-virus.png">`,
      '<meta name="twitter:card" content="summary_large_image">',
      // The playable game as a VideoGame (same shape as the hub's game pages; facts from its head).
      `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org", "@type": "VideoGame", "@id": `${siteUrl}battlefield/`, url: `${siteUrl}battlefield/`,
        name: title.split(" · ")[0], description: description.replace(/&quot;/g, '"').replace(/&amp;/g, "&"), inLanguage: "en",
        isPartOf: { "@type": "WebSite", name: "DOM VIRUS", url: siteUrl.replace(/\/$/, "") }, gamePlatform: "Web browser", applicationCategory: "Game",
        image: `${siteUrl}og/dom-virus.png`,
      }).replace(/</g, "\\u003c")}</script>`,
      "</head>",
    ].join("\n"),
  );
writeFileSync(page, app);

console.log(`Battlefield ${pin.version}: verified standalone app copied to /battlefield/.`);
