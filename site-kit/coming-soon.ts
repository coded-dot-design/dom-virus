// Coming soon: the next games and the next engine phase, in build order. One list feeds the
// /coming-soon/ page, the Kaiju detail page and the shelf's COMING SOON cartridge.
// Source of truth for the plans: GAMES.md and docs/games/*.md (keep them in step).
const GH = "https://github.com/coded-dot-design/dom-virus/blob/main";

export type SoonGame = {
  id: string;
  n: string;
  status: "NEXT UP" | "PLANNED" | "IDEA";
  name: string;
  kind: string;
  accent: "cyan" | "violet" | "lime" | "pink";
  line: string;
  points: string[];
  /** Hub detail page (relative to base), if it has one. */
  page?: string;
  doc: string;
};

export const SOON_GAMES: SoonGame[] = [
  {
    id: "blitz",
    n: "01",
    status: "NEXT UP",
    name: "Battlefield Blitz",
    kind: "ARCADE TANKS",
    accent: "cyan",
    line: "DOM Battlefield's fast arcade cut: the landing-page battle becomes a real game.",
    points: [
      "Endless waves of tanks pour in from the edges; a boss every fifth wave",
      "Tap anywhere for airstrikes: multi-blast, letters knocked flying",
      "Treads flatten headings, shells chew cards, Recall heals the page",
      "Combos, slow-mo last kills, power-ups: cluster strike, shield, nuke",
    ],
    doc: `${GH}/GAMES.md#1-battlefield-blitz-next-up`,
  },
  {
    id: "crossfire",
    n: "02",
    status: "NEXT UP",
    name: "DOM Crossfire",
    kind: "AIR + GROUND MASH-UP",
    accent: "violet",
    line: "The DOM VIRUS hero meets the Battlefield arena: interceptor and tank against everything.",
    points: [
      "Fly the interceptor or drive the tank; swap any time, the other one wings for you",
      "Skulls, aliens, flies and enemy tanks spawn out of the page itself",
      "Hero booms plus arena airstrikes, all at once",
      "The nuke countdown becomes the boss round",
    ],
    doc: `${GH}/GAMES.md#2-dom-crossfire-next-up-the-mash-up`,
  },
  {
    id: "kaiju",
    n: "03",
    status: "PLANNED",
    name: "DOM Kaiju",
    kind: "CLIMB + SMASH",
    accent: "pink",
    line: "A giant pixel gorilla falls onto your page and climbs it from the footer to the top, smashing as he goes.",
    points: [
      "Climb the sides of text, cards and buttons; punch handholds into white space",
      "Text cracks, shatters and catches fire; tiny people fall (catch them)",
      "Chopper swarms strafe you: swat them, grab them, throw them",
      "Live-wire text zaps you all the way back to the bottom",
    ],
    page: "games/kaiju/",
    doc: `${GH}/docs/games/dom-kaiju.md`,
  },
  {
    id: "flock",
    n: "04",
    status: "IDEA",
    name: "DOM Flock",
    kind: "LIGHT-GUN SHOOT",
    accent: "lime",
    line: "Pixel birds burst out of the page in pairs. You are the crosshair.",
    points: [
      "Three shots a pair; misses escape off the top",
      "Hit birds drop into the text and knock the letters",
      "A smug pixel hound pops up from the footer with your catch",
      "Golden birds and a clay-target round with page buttons as launchers",
    ],
    doc: `${GH}/GAMES.md#4-dom-flock-idea`,
  },
];

export const NEXT_PHASE = [
  { tag: "E0", title: "Baseline and archives", body: "Perf harness and baseline numbers are in. Next: play any past Battlefield build from its page, and test any release of every game." },
  { tag: "E1", title: "One tiny kernel", body: "One scheduler, a fixed step, clean start and stop, pools and the Recall ledger, in about 4 KB." },
  { tag: "E2", title: "Harnesses", body: "Input, collisions, steering, page and grid boards, camera, effects, a sound adapter, the embed config (palette and easter eggs) and Board UI." },
  { tag: "E3", title: "Port every game", body: "Each cartridge gets an engine cut: less code, same feel, at least as fast as today. The old builds stay playable." },
  { tag: "E4", title: "Multiplayer Battlefield", body: "Two players, two pages, one battle: rooms, co-op and 1v1." },
];

export const OPTIMIZE = [
  { name: "Swarm Protocol", now: "≈32 fps", goal: "60 fps", note: "heaviest script time under a 4x CPU throttle" },
  { name: "Byte Runner", now: "≈48 fps", goal: "60 fps", note: "reads layout every frame; move to the cached board" },
  { name: "DOM Battlefield", now: "≈48 layouts/s", goal: "near 0", note: "batch DOM writes on the grid" },
];

export const GAMES_DOC = `${GH}/GAMES.md`;
export const ENGINE_DOC = `${GH}/ENGINE.md`;
