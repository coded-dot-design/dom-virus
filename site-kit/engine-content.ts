// astro-base-engine content for the hub (brand/SITEMAP.md E6–E7). Page JSON lives in
// site/src/content/pages, `abe head` output in site/src/content/heads. Sites without these folders
// (the single-game repos) get empty maps, so the kit still builds there.
import { HIDDEN_PAGES } from './lifecycle.mjs';
export type EnginePage = {
  id: string;
  path: string;
  template: string;
  status?: string;
  publishAt?: string;
  seo: { title: string; description: string; canonical?: string; schemaPageType?: string };
  sections: any[];
  meta?: { pageType?: string; tags?: string[]; created?: string; closing?: any };
};

const files = import.meta.glob('/site/src/content/pages/*.json', { eager: true, import: 'default' }) as Record<string, EnginePage>;
// One head per target (scripts/engine-heads.mjs): heads/<id>.html for staging (github.io),
// heads/production/<id>.html for https://domvirus.com. The build uses the one whose canonical is
// the URL it serves.
const heads = import.meta.glob(['/site/src/content/heads/*.html', '/site/src/content/heads/production/*.html'], { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;
const canonicalOf = (html: string) => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];

export const pages: EnginePage[] = Object.values(files);
export const byId = (id: string): EnginePage | undefined => files[`/site/src/content/pages/${id}.json`];

// Lifecycle (E7): published, or scheduled with its time passed at build time. Drafts never ship, and
// neither does a post about a game this build hides (site-kit/lifecycle.mjs: unready games, production).
const BUILD_TIME = Date.now();
export const visible = (p: EnginePage) =>
  !HIDDEN_PAGES.includes(p.id) &&
  (p.status === 'published' || (p.status === 'scheduled' && !!p.publishAt && Date.parse(p.publishAt) <= BUILD_TIME));

// The page's date: its publish time when scheduled, otherwise the date it was produced.
export const dateOf = (p: EnginePage) => (p.publishAt || p.meta?.created || '').slice(0, 10);
export const formatDate = (d: string) =>
  d ? new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '';

// '/blog/two-macs' -> 'blog/two-macs/' (relative to the site base).
export const routeOf = (p: EnginePage) => p.path.replace(/^\/+/, '').replace(/\/?$/, '/').replace(/^\/$/, '');

export const posts = (type: 'blog' | 'news') =>
  pages.filter((p) => p.meta?.pageType === type && visible(p)).sort((a, b) => dateOf(b).localeCompare(dateOf(a)));

// Engine head for a page served at pageUrl. The engine bakes robots from the status on the day heads were generated;
// a scheduled page that has since gone live is indexable now (ENGINE-SUGGESTIONS #18).
export const headOf = (p: EnginePage | undefined, pageUrl: string) => {
  if (!p) return undefined;
  const candidates = [`/site/src/content/heads/${p.id}.html`, `/site/src/content/heads/production/${p.id}.html`]
    .map((k) => heads[k])
    .filter(Boolean);
  if (!candidates.length) {
    if (visible(p)) throw new Error(`No engine head for ${p.id}. Run npm run engine:heads.`);
    return undefined;
  }
  const html = candidates.find((h) => canonicalOf(h) === pageUrl);
  if (!html)
    throw new Error(
      `No engine head for ${p.id} has canonical ${pageUrl} (found ${candidates.map(canonicalOf).join(', ')}). ` +
        'Check targets in site/engine.config.json against SITE_URL/SITE_BASE and run npm run engine:heads.',
    );
  return visible(p) ? html.replace('content="noindex,nofollow"', 'content="index,follow"') : html;
};

// Pages the catch-all route renders (games have their own route).
export const routable = () => pages.filter((p) => visible(p) && !['embedded', 'game', 'board'].includes(p.meta?.pageType ?? ''));
