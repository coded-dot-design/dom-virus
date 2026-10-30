// The footer site map's columns (brand/SITEMAP.md, Navigation). Routes are not listed here: the
// footer collects every page the build serves (site-kit/components/FooterSitemap.astro) and this
// file only says which column a route sits in, what leads each column and what a page without page
// JSON is called. Shared with tests/site-footer.mjs, which checks the built footer against the
// built sitemap. Routes are relative to the site root with a trailing slash: "" (home), "news/x/".

/** The columns, in order. `prefixes` place a route; `lead` opens the column; `labels` name pages
 * whose own title does not read well as a link (section indexes, the layout's own pages). */
export const GROUPS = [
  { id: "games", heading: "Games", prefixes: ["", "games/", "battlefield/"], lead: ["", "games/"], labels: { "": "The arcade", "games/": "All games", "battlefield/": "Play DOM Battlefield", "games/coming-soon/": "Coming soon" } },
  { id: "engine", heading: "Under the hood", prefixes: ["engine/", "blog/"], lead: ["engine/", "blog/"], labels: { "engine/": "How the games work", "blog/": "The devlog" } },
  { id: "news", heading: "News", prefixes: ["news/"], lead: ["news/"], labels: { "news/": "All news" } },
  { id: "about", heading: "About", prefixes: ["about/", "support/", "contact/"], lead: ["about/"], labels: { "about/": "About DOM VIRUS", "about/brand/": "Brand and style guide" } },
  { id: "legal", heading: "Legal", prefixes: ["legal/"], lead: ["legal/"], labels: { "legal/": "Overview" } },
];

/** The column a route belongs to: the longest matching prefix ("" matches home only). A new
 * top-level page with no column of its own lands in About. */
export function groupOf(route) {
  let best = null;
  for (const g of GROUPS)
    for (const p of g.prefixes)
      if ((p === "" ? route === "" : route.startsWith(p)) && (!best || p.length > best.p.length)) best = { g, p };
  return (best?.g || GROUPS.find((g) => g.id === "about")).id;
}

/** Archive pages are kept for the record and stay out of the footer (they may stay in the sitemap). */
export const unlisted = (route) => /(^|\/)archive\/$/.test(route);

/** "/news/x", "news/x/#y" -> "news/x/"; "/" -> "". */
export const routeOf = (path) => path.replace(/[?#].*$/, "").replace(/^\/+/, "").replace(/\/?$/, "/").replace(/^\/$/, "");
