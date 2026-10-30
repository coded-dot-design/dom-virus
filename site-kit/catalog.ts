// The arcade catalog, from the content model (site/src/content/model/games: generated from the game
// specs in brain-cache/fizlet-engine). One list for the /games/ catalog and the board pages: every
// published game this build shows, with its genre, players and badges as the spec states them.
import { gameShown } from './lifecycle.mjs';

type ModelGame = {
  id: string;
  status: string;
  data: {
    id: string; name: string; number: string; type: 'embedded' | 'board'; repo: string;
    site: { kind: string; tagline: string; description: string; accent: string; icon: string };
    urls?: Record<string, string>;
    page?: { slug: string; type: string; genre?: string[]; playMode?: string[]; players?: string; badges?: string[]; poster?: { src: string; alt: string }; playHref?: string; links?: { label: string; href: string }[] };
  };
};
const files = import.meta.glob('/site/src/content/model/games/*.json', { eager: true, import: 'default' }) as Record<string, ModelGame>;

export type CatalogGame = {
  id: string; name: string; repo: string; kind: string; tagline: string; description: string; accent: string; icon: string;
  type: 'embedded' | 'board'; route: string; genre: string[]; players: string; multiplayer: boolean; isNew: boolean;
  poster?: { src: string; alt: string };
};

/** Published games this build shows, in the shelf's order (spec number). */
export const catalog: CatalogGame[] = Object.values(files)
  .filter((g) => g.status === 'published' && g.data.page && gameShown(g.id))
  .sort((a, b) => a.data.number.localeCompare(b.data.number))
  .map(({ data: d }) => ({
    id: d.id, name: d.name, repo: d.repo, kind: d.site.kind, tagline: d.site.tagline, description: d.site.description,
    accent: d.site.accent, icon: d.site.icon, type: d.type,
    route: `games/${d.page!.slug}/`,
    genre: d.page!.genre || [],
    players: d.page!.players || '1',
    multiplayer: (d.page!.playMode || []).includes('MultiPlayer'),
    isNew: (d.page!.badges || []).includes('new'),
    poster: d.page!.poster,
  }));

/** Genres in first-seen order, for the catalog's filters. */
export const genres = [...new Set(catalog.flatMap((g) => g.genre))];

/** Board games whose hub page is an engine page of type `board` with no route of its own
 * (DOM Battlefield keeps /games/battlefield/, its own route). */
export const boardRoutes = () => catalog.filter((g) => g.type === 'board' && g.route !== 'games/battlefield/');
export const byRoute = (slug: string) => catalog.find((g) => g.route === `games/${slug}/`);
