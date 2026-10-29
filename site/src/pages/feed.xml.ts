// RSS 2.0 for news and the devlog (brand/SITEMAP.md E9): newest 30 published posts.
import type { APIRoute } from 'astro';
import { posts, dateOf, routeOf } from '@site-kit/engine-content';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const home = new URL(base, site).href;
  const items = [...posts('news'), ...posts('blog')].sort((a, b) => dateOf(b).localeCompare(dateOf(a))).slice(0, 30);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>DOM VIRUS: news and devlog</title>
<link>${home}</link>
<description>Releases, launches and the devlog behind tiny open-source games that play on your page.</description>
<language>en</language>
<atom:link href="${home}feed.xml" rel="self" type="application/rss+xml"/>
${items.map((p) => { const url = new URL(base + routeOf(p), site).href; return `<item><title>${esc(p.sections[0].heading)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(`${dateOf(p)}T12:00:00Z`).toUTCString()}</pubDate><category>${esc(p.meta?.pageType === 'news' ? 'News' : 'Devlog')}</category><description>${esc(p.seo.description)}</description></item>`; }).join('\n')}
</channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
