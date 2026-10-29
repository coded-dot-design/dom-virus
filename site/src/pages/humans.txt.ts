// humanstxt.org credits.
import type { APIRoute } from 'astro';
export const GET: APIRoute = () => new Response(`/* TEAM */
Maker: Chris Cooley
Studio: coded.design
Site: https://coded.design

/* THANKS */
Bolo, for the first networked tank battle.
Everyone who plays on their own page and hits Recall after.

/* SITE */
Standards: HTML, CSS, TypeScript
Components: Astro, each game's own small engine
Software: open source, MIT
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
