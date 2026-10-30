// What a build shows, from the content model's lifecycle (site/src/content/model). One place decides,
// for the Astro pages and for the build scripts (sitemap.mjs, verify.mjs).
//   staging     every game, ready or not (github.io, local and PR builds).
//   production  the URL in targets.production of site/engine.config.json (https://domvirus.com).
//               A game whose model status is not `published` (DOM Kaiju: idea) is hidden there:
//               no cartridge, card or detail page, no post about it (a post whose model relations name
//               it), no sitemap, llms.txt or feed row, and engine copy that names it drops the sentence,
//               card or stat. Publishing the game in the model brings it all back; nothing to undo here.
// A hidden route that was ever live keeps its URL through `$whileHidden` in site/redirects.json.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (p) => JSON.parse(readFileSync(resolve(root, p), "utf8"));
const list = (dir) => (existsSync(resolve(root, dir)) ? readdirSync(resolve(root, dir)).filter((f) => f.endsWith(".json")).sort().map((f) => read(`${dir}/${f}`)) : []);

const { id } = read("site/config.json");
/** The site root this build serves, e.g. https://domvirus.com/ (same rule as site-kit/config.mjs). */
export const SITE_ROOT = new URL((process.env.SITE_BASE || `/${id}`).replace(/\/?$/, "/"), process.env.SITE_URL || "https://coded-dot-design.github.io").href;
const cfg = existsSync(resolve(root, "site/engine.config.json")) ? read("site/engine.config.json") : {};
export const PRODUCTION_ROOT = cfg.targets?.production?.brand?.siteUrl?.replace(/\/?$/, "/");
/** "production" when this build serves the production URL, "staging" otherwise. */
export const TARGET = PRODUCTION_ROOT && SITE_ROOT === PRODUCTION_ROOT ? "production" : "staging";

const model = "site/src/content/model";
/** Games in the model that are not published yet, and the posts about them (model relations). */
const unready = list(`${model}/games`).filter((g) => g.status !== "published");
const unreadyIds = unready.map((g) => g.id);
const aboutUnready = list(`${model}/posts`).filter((p) => (p.relations?.games || []).some((g) => unreadyIds.includes(g))).map((p) => p.id);
const pagePath = (pageId) => { const f = `site/src/content/pages/${pageId}.json`; return existsSync(resolve(root, f)) ? read(f).path : undefined; };
const route = (path) => path.replace(/^\/+/, "").replace(/\/?$/, "/");
/** Routes of unready games and their posts, relative to the site root ("games/kaiju/"). */
const unreadyRoutes = [...unreadyIds.map((g) => `games/${g}/`), ...aboutUnready.map(pagePath).filter(Boolean).map(route)];

const hide = TARGET === "production";
/** Game ids this build hides. */
export const HIDDEN_GAMES = hide ? unreadyIds : [];
/** Engine page ids (posts) this build hides. */
export const HIDDEN_PAGES = hide ? aboutUnready : [];
/** Routes this build does not serve as pages (a redirect in site/redirects.json may take them). */
export const HIDDEN_ROUTES = hide ? unreadyRoutes : [];
export const gameShown = (gameId) => !HIDDEN_GAMES.includes(gameId);

// Names this build must not print: "DOM Kaiju" and its short form "Kaiju".
const names = hide ? unready.flatMap((g) => [g.data?.name || g.id, (g.data?.name || g.id).replace(/^DOM\s+/i, "")]) : [];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const nameRe = names.length ? new RegExp(`\\b(${[...new Set(names)].map(esc).join("|")})\\b`, "i") : null;
/** True when the text names a hidden game. */
export const mentionsHidden = (text) => !!nameRe && typeof text === "string" && nameRe.test(text);
/** True when an href points at a hidden route ("/games/kaiju", "/news/coming-next/#x"). */
export const linksHidden = (href) => typeof href === "string" && HIDDEN_ROUTES.includes(route(href.replace(/[?#].*$/, "")));
/** The text without the sentences that name a hidden game. */
export const dropMentions = (text) => (nameRe ? text.split(/(?<=[.!?])\s+/).filter((s) => !nameRe.test(s)).join(" ") : text);

// A list entry (card, stat, related link, section) goes when it links to a hidden route or its
// title, label, value or heading names a hidden game.
const hides = (o) => [o.href, o.link?.href].some(linksHidden) || [o.title, o.label, o.value, o.heading].some(mentionsHidden);
const ADDRESS = new Set(["id", "href", "src", "path", "canonical"]); // addresses, not copy
/** Engine page content (sections, hero, items) with hidden games taken out. Unchanged on staging. */
export function scrub(node) {
  if (!nameRe && !HIDDEN_ROUTES.length) return node;
  if (typeof node === "string") return dropMentions(node);
  if (Array.isArray(node)) return node.filter((x) => !(x && typeof x === "object" && hides(x))).map(scrub).filter((x) => x !== "");
  if (node && typeof node === "object") return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, ADDRESS.has(k) ? v : scrub(v)]));
  return node;
}
