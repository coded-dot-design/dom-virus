// RFC 9116 security contact (brand/SITEMAP.md E10). Expires is one year from the build.
import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const expires = new Date(Date.now() + 365 * 864e5).toISOString().replace(/\.\d+Z$/, 'Z');
  return new Response(`Contact: https://github.com/coded-dot-design/dom-virus/security/advisories/new
Expires: ${expires}
Preferred-Languages: en
Canonical: ${new URL(base + '.well-known/security.txt', site).href}
Policy: ${new URL(base + 'contact/', site).href}
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
