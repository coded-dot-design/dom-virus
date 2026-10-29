# DOM VIRUS: style guide (parent)

Preset: cyberpunk-tron · flat colors in the game layer (hard, unblurred shadows; the shadow angle is a brand token). Read by astro-base-engine; the site renders its own look.

The visual summary for the **DOM VIRUS parent brand** (`domvirus.com`, today
`coded-dot-design.github.io/dom-virus/`). It is an input for the marketing engine: it says what the
look is and where the live source lives. It does not replace the source.

- **Level:** parent (see the family rulebook, [`README.md`](README.md) §1, and
  [`family.json`](family.json)).
- **Applies to:** every page on the hub: the page frame (header, footer, nav) on every page, plus
  the body of the home, coming-soon, style-guide, Under the Hood, blog and news pages. A game page
  on the hub keeps this frame; its game section wears the game's accent (see
  [`games/`](games/)).
- **Voice:** [`voice.md`](voice.md).
- **Status:** documentation only (Phase 2). The games are locked. Nothing here asks for a code
  change; differences between this guide, the rulebook and the code are listed under
  [Open questions](#open-questions).

---

## 1. Live sources (read these, not a copy)

| What | Source of truth |
|---|---|
| The live style guide page (`/style-guide/`) | [`site-kit/components/StyleGuide.astro`](../site-kit/components/StyleGuide.astro), rendered by [`site/src/pages/style-guide/index.astro`](../site/src/pages/style-guide/index.astro) |
| Colour, type, button, focus and motion tokens | [`site-kit/style.css`](../site-kit/style.css) (`:root`, `html[data-theme="light"]`, `.accent-*`) |
| The cartridge | [`site-kit/components/Cartridge.astro`](../site-kit/components/Cartridge.astro) (scoped `<style>`) |
| The shelf and console | [`site-kit/components/CartridgeShelf.astro`](../site-kit/components/CartridgeShelf.astro) |
| The home hero | [`site-kit/components/HeroScene.astro`](../site-kit/components/HeroScene.astro) |
| A game's section on the hub | [`site-kit/components/GameSection.astro`](../site-kit/components/GameSection.astro) |
| Each game's accent, palette, kind, tagline, characters | [`site/generated/data.json`](../site/generated/data.json), generated from each game repo's `site/game.json` |
| The shared 3D key (Board UI) | Fizlet: [`src/ui/BOARD-UI.md`](https://github.com/coded-dot-design/fizlet/blob/main/src/ui/BOARD-UI.md), [`src/ui/board-ui.css`](https://github.com/coded-dot-design/fizlet/blob/main/src/ui/board-ui.css), [`src/ui/tokens.json`](https://github.com/coded-dot-design/fizlet/blob/main/src/ui/tokens.json) |

If this file and a source disagree, the source wins and this file is out of date.

---

## 2. Default style

**Cyberpunk meets Tron, in flat colour.** The style guide page sums it up: "a flat, neon,
hard-shadow world where every surface is something you can press, and every game ships as a
cartridge" (`StyleGuide.astro:54`).

- **Night first, neon on purpose.** Deep violet-navy ground (`--bg #100a1b`), neon accents, an ink
  outline on everything you can press. "Dark is home; light is the same world at noon"
  (`StyleGuide.astro:87`).
- **Pixels for play, lines for UI.** Game art is crisp-edged pixels (`shape-rendering:
  crispEdges`). Interface icons are 24-unit line icons, 1.8 stroke, round caps. Never mix the two in
  one control (`StyleGuide.astro:202`).
- **Plain sans, machine mono.** No web fonts and no downloads. A system sans for reading, the
  platform monospace for everything the machine says (`StyleGuide.astro:98`).
- **Flat colour for performance.** Solid fills and hard, unblurred offset shadows. Depth comes from
  hard extrusions, not blur.
- **One mark.** The pixel skull: "A 64-unit pixel skull with a single offset pixel: the virus
  'infecting' the grid" (`StyleGuide.astro:64`). Pink on dark or light ground, always crisp, never
  smoothed, outlined, rotated or recoloured per game (`StyleGuide.astro:64`, `:76-79`).

---

## 3. Tokens

Exact values from the sources cited in `"$source"`. CSS variable names are kept where they exist.
`var(--…)` values are references, not literals.

```tokens
{
  "$source": {
    "color": "site-kit/style.css:1-64 (:root, light theme, .accent-cyan/lime/violet), :1454-1464 (.accent-amber), :1863-1888 (--hover), :2184-2197 (technical teal); StyleGuide.astro:25-29 (named accents)",
    "font": "site-kit/style.css:13-14, :68-73, :109-114, :191-196, :221-226",
    "radius": "site-kit/style.css:3221-3231 (.button), :2072/:2106 (square nav keys), :1696-1698 (.game-display); Cartridge.astro:81, :94; CartridgeShelf.astro:99",
    "shadow": "site-kit/style.css:1703-1731 (.button), :1696-1697 (.game-display), :1516-1518 (.hero-art), :2184-2191 (.engineering), :3202-3205 (.embed-game .code-example); Cartridge.astro:77-86; CartridgeShelf.astro:99; StyleGuide.astro:119-137",
    "motion": "site-kit/style.css:1708-1731, :1787-1855, :1409-1416, :3054-3089; Cartridge.astro:80, :87-88; CartridgeShelf.astro:90-91; StyleGuide.astro:40-48"
  },
  "color": {
    "dark": {
      "bg": "#100a1b",
      "surface": "#1a112b",
      "raised": "#281b40",
      "ink": "#fff4ff",
      "muted": "#cec0e0",
      "faint": "#b39acd",
      "line": "#49345e",
      "accent": "#f4457a",
      "accent-ink": "#21051a",
      "grid": "#ffffff05",
      "hover": "#79cddc",
      "theme-color": "#100a1b"
    },
    "light": {
      "bg": "#f6f7f8",
      "surface": "#ffffff",
      "raised": "#edf0f2",
      "ink": "#171022",
      "muted": "#4d5866",
      "faint": "#586577",
      "line": "#d1d7de",
      "accent": "#f4457a",
      "accent-text": "#bf2d5b",
      "accent-ink": "#21051a",
      "grid": "#17253506"
    },
    "accent": {
      "pink": { "class": "(default, no class)", "accent": "#f4457a", "accent-ink": "#21051a", "light": { "accent-text": "#bf2d5b", "accent-ink": "#21051a" }, "hover": "#79cddc", "use": "brand, console, the skull mark" },
      "amber": { "class": "accent-amber", "accent": "#ee6875", "accent-ink": "#292014", "light": { "accent-text": "#b13f4b", "accent-ink": "#270508" }, "hover": "#e7ba74", "use": "Sherman Bytes" },
      "cyan": { "class": "accent-cyan", "accent": "#06c4ff", "accent-ink": "#102528", "light": { "accent-text": "#247488", "accent-ink": "#061b29" }, "hover": "#b1a1e8", "use": "Null Invaders, DOM Battlefield" },
      "violet": { "class": "accent-violet", "accent": "#8573ee", "accent-ink": "#231635", "light": { "accent-text": "#5f48ba", "accent-ink": "#21051a" }, "hover": "#74dfa1", "use": "Swarm Protocol" },
      "lime": { "class": "accent-lime", "accent": "#4bce82", "accent-ink": "#1b2710", "light": { "accent-text": "#171022", "accent-ink": "#102006" }, "hover": "#79cddc", "use": "Byte Runner" }
    },
    "fixed": {
      "button-ink": "#171022",
      "hover-ink": "#17202a",
      "screen-black": "#07060f",
      "contact-gold": "#ffc94a",
      "nav-count-gold": "#ffd166",
      "skull-sticker-vinyl": "#14101f",
      "technical": { "accent": "#63bfc8", "hover": "#b1a1e8", "accent-ink": "#112c30", "light-accent-text": "#236f78", "light-embed-bg": "#f0f5f5" }
    }
  },
  "font": {
    "sans": "Inter, Arial, Helvetica, sans-serif",
    "mono": "ui-monospace, SFMono-Regular, Consolas, monospace",
    "body": { "line-height": 1.65 },
    "heading": { "line-height": 1.08, "letter-spacing": "-0.04em" },
    "hero-h1": { "weight": 500, "size": "clamp(48px, 5.5vw, 72px)", "line-height": 1.04, "letter-spacing": "-0.068em" },
    "eyebrow": { "font": "10px/1.5 var(--mono)", "letter-spacing": "0.1em" },
    "button": { "size": "14px", "weight": 700 },
    "web-fonts": "none"
  },
  "radius": {
    "button": "9px",
    "nav-key": "8px",
    "theme-toggle": "8px",
    "game-display": "7px",
    "code-card": "10px",
    "cross-promo": "12px",
    "console": "18px",
    "cartridge-shell": "12px 12px 0 0",
    "cartridge-label": "6px",
    "cartridge-notch": "22px at 45deg"
  },
  "shadow": {
    "shadow-angle": "45deg, down and to the right (x offset = y offset)",
    "button": { "rest": "3px 3px 0 var(--ink)", "hover": "5px 5px 0 var(--ink) + translate(-2px, -2px)", "press": "0 0 0 var(--ink) + translate(3px, 3px)", "selected": "0 0 0 var(--ink) + translate(3px, 3px)" },
    "game-display": "7px 7px 0 var(--accent)",
    "hero-art": "7px 7px 0 #f4457a",
    "technical-card": "7px 7px 0 var(--accent)",
    "code-card": "6px 6px 0 var(--accent) (4px 4px under 760px)",
    "cross-promo": "6px 6px 0 var(--accent) (4px 4px under 760px)",
    "cartridge": "no drop shadow: a 45deg solid extrusion, 7px side face on the right + 6px bottom face",
    "console": "14px stepped 45deg extrusion in the accent + 16px 16px 0 var(--ink)"
  },
  "motion": {
    "key-travel": "transform + box-shadow 140ms cubic-bezier(0.2, 0.8, 0.2, 1)",
    "key-press": "55ms",
    "colour-change": "background-color, color, border-color 140ms ease",
    "cartridge-hover": "translateY(-8px) rotate(-1deg), 260ms cubic-bezier(.34, 1.7, .5, 1)",
    "cartridge-press": "translateY(2px), 60ms",
    "cartridge-pop-in": "700ms cubic-bezier(.3, 1.5, .5, 1), staggered 110ms per cartridge",
    "cartridge-flight": "820ms desktop, 760ms phone",
    "eject": "900ms desktop, 800ms phone",
    "page-out": "260ms ease-in (fade + scale 0.97)",
    "page-in": "420ms cubic-bezier(0.2, 0.8, 0.3, 1) (fade + 26px rise)",
    "screen-to-page": "600ms cubic-bezier(0.2, 0.8, 0.2, 1) (view-transition-group game-screen)",
    "idle-loops": "CSS steps(), paused offscreen",
    "reduced-motion": "animation: none; transition: none (global)"
  }
}
```

**Contrast (measured, WCAG 2 ratio, from the token values above):**

| Pair | Ratio |
|---|---:|
| dark `--ink` / `--muted` / `--faint` on `--bg` | 18.16 / 11.32 / 7.79 |
| light `--ink` / `--muted` / `--faint` on `--bg` | 17.27 / 6.74 / 5.53 |
| dark accents on `--bg`: pink / amber / cyan / violet / lime | 5.53 / 6.36 / 9.57 / 5.26 / 9.66 |
| light `--accent-text` on `--bg`: pink / amber / cyan / violet / lime | 5.23 / 5.32 / 4.98 / 6.27 / 17.27 |
| button ink `#171022` on accent faces: pink / amber / cyan / violet / lime | 5.27 / 6.06 / 9.13 / 5.01 / 9.22 |

Raw accents on the light background are below 4.5:1 for text (cyan 1.89, lime 1.87, pink 3.27).
That is why light theme text uses `--accent-text`, never `--accent`.

---

## 4. Light and dark

- Two themes, **one set of token names**. Dark tokens live on `:root`; light tokens on
  `html[data-theme="light"]` (`style.css:1-31`). Each accent has a light twin (`--accent-text`,
  `--accent-ink`).
- The page follows the system colour scheme, with a persistent override from the theme key
  (stored at `dom-virus:theme`: `system`, `dark` or `light`; `Site.astro:61`). The markup ships as
  `data-theme="dark"` before the script runs.
- In light theme the "browser panels" (hero art, game display) stay white with an ink outline and
  keep the neon game colours (`style.css:1505-1515`).
- The skull stays pink in both themes; games carry the accent (`StyleGuide.astro:76-79`).

---

## 5. The shared 3D key (the family's one key component)

**One component for the family:** the Board UI key family in Fizlet (`.bui-key`, `.bui-arcade`,
`.bui-sticker-key`; states rest / hover / press / locked / call / disabled / focus), source of truth
in [`fizlet/src/ui/`](https://github.com/coded-dot-design/fizlet/tree/main/src/ui)
([`BOARD-UI.md`](https://github.com/coded-dot-design/fizlet/blob/main/src/ui/BOARD-UI.md) §5,
[`board-ui.css`](https://github.com/coded-dot-design/fizlet/blob/main/src/ui/board-ui.css)).

**The hub's keys today** (`.button`, the square nav keys, the theme toggle, `IconKey`, the
console pads) are the same idea built separately in `site-kit/style.css`. They follow the hub's
**3D rule** (`StyleGuide.astro:119-127`): flat face over a hard offset base; hover lifts only the
top and grows the shadow by the same amount; press lands exactly on the base; selected stays
pressed in; one curve, no overshoot.

| | Hub `.button` (today) | Board UI `.bui-key` / `.bui-arcade` (Fizlet) |
|---|---|---|
| Base direction | **diagonal**, down-right: `3px 3px 0 var(--ink)` | **straight below**: `0 var(--py) 0 var(--edge)` |
| Base colour | ink (`--ink`) | `--line` (base key) or the key colour 45% into `--rim` (arcade) |
| Base height | 3px | 3u (base key), 4u (arcade), 5u (sticker key) |
| Hover | `translate(-2px,-2px)`, shadow `5px 5px`, background `--hover` | `translateY(-hy)`, base grows by `hy` (1u / 2u) |
| Press | `translate(3px,3px)`, shadow 0, 55ms | `translateY(py)`, base 0, 50ms |
| Selected / locked | `aria-pressed="true"` stays pressed | `aria-pressed` / `.active`: pressed + lock colour + 1.8s breath |
| Call (next key to press) | none | `.bui-call` ring from the base |
| Curve | 140ms `cubic-bezier(0.2, 0.8, 0.2, 1)` | 120ms ease-out |
| Border / radius | 2px ink, 9px | 2u rim; 6u (base), 10u (arcade), 12u (sticker key) |
| Height | 46px min | 40u (base), 44u (arcade) min |
| Focus | `outline: 2px solid var(--ink); outline-offset: 6px` | 3u `--bg` gap + 6u `--k-sys-ink` ring on face **and** base |
| Glow | none | dark theme only: 14u / 18u / 22u of the key colour |

Board UI says so itself: "the hub's marketing site uses diagonal shadows; the board does not"
(`BOARD-UI.md:20-22`). **Phase 2 will merge these into one documented component. Do not merge them
here, and do not restyle either one.** Until then: hub pages use the hub `.button`; boards use
Board UI.

---

## 6. The cartridge and `--shadow-angle`

The cartridge is the hub's signature object: every game ships as one, on a shelf, plugged into a
console that is the navigation (`CartridgeShelf.astro:6-17`, `StyleGuide.astro:171`).

**Anatomy** (`StyleGuide.astro:154-162`, `Cartridge.astro`):
- **Shell:** accent front face, 2px ink outline, 12px top corners.
- **Notch:** 22px, 45°, top right: the same angle as the depth.
- **Side + bottom faces:** darker accent (`color-mix(in srgb, var(--accent) 48%, #0b0a1a)` side,
  `68%` inset band at the bottom), mitred at the corner. Side face 7px, bottom face 6px.
- **Grip:** five ridges along the top.
- **Label:** surface card with 2px ink border, 6px radius: art (the game's pixel icon on a 14%
  accent tint), `0N / KIND`, name, tagline.
- **Pins:** gold fingers (`#ffe7a6` / `#ffc94a`, wrap `#a8771d`) that wrap under the edge at 45°;
  a few worn short, tarnished or missing, deterministic per cartridge.
- **Sticker:** the skull on dark vinyl (`#14101f`, white 2px edge), a different spot and tilt per
  cartridge, some peeling.
- **Variants:** standard (one action, PRESS START); special edition (a full game: two actions,
  BLUE INFO and RED LAUNCH, plus a SPECIAL EDITION tag); coming soon (yellow striped COMING SOON
  band); placeholder (dashed empty bay with a muted cover).

**Shadow direction and angle (`--shadow-angle`).** The rulebook names this a per-brand parameter
(README §5). The hub has no `--shadow-angle` variable today; the value is built into the CSS:

| Object | Direction today | Values |
|---|---|---|
| Cartridge | 45°, down and to the right; no drop shadow, a solid extrusion | right side face 7px, bottom face 6px; notch and bottom-left chamfer also 45° (`Cartridge.astro:77-86`) |
| Console | 45°, down and to the right | 14 stepped 1px accent layers + `16px 16px 0 var(--ink)` (`CartridgeShelf.astro:99`) |
| Keys, cards, game display | 45°, down and to the right | `3px 3px` keys; `6px 6px` and `7px 7px` cards (§3 tokens) |

So the hub's `--shadow-angle` is **45°, down-right (x = y)**, everywhere. The live guide states
it as a rule: "Depth always falls down and to the right" and "The console and the cartridges follow
the same rule as solid 45° extrusions: the cartridge side is 7px, the console 14px"
(`StyleGuide.astro:119`, `:137`). The rulebook's family default is "hard bases straight below
(never to the side unless a brand's cartridge says so)" (README §2). That is listed under
[Open questions](#open-questions); this guide documents what ships.

---

## 7. Layout and components (summary)

- **Frame:** max width 1200px; header 106px (auto on phones); brand left; square 3D icon keys
  (Games, Under the hood) and the theme toggle right. The page you are on stays pressed in, in the
  accent (`style.css:2097-2135`).
- **Section heading:** a mono eyebrow with a tilted index sticker (`.section-heading .index`,
  rotated −5°, accent fill, ink border, `2px 2px` shadow) and a version tag on the right.
- **Game display:** a browser-window card with an ink border, 7px radius and a `7px 7px` accent
  shadow; the game plays in it.
- **Technical cards** (Under the Hood, embed): a calmer teal signal (`#63bfc8`) on the same hard
  edges.
- **Home hero:** a CSS-only browser card ("your.page / under attack") where skulls and bad guys
  spawn and a tank and an interceptor blast them; tap to play (`HeroScene.astro`).
- **Shelf and console:** cartridges pop in as the shelf scrolls into view; pick one, it flies into
  the console, the screen boots in its accent, PRESS START morphs the screen into the game page.

---

## 8. Motion

"Alive, cheap, reversible" (`StyleGuide.astro:185`).

- **Motion is the map:** it shows where you came from and how to get back. Launch and return are
  exact mirrors; the console never moves (`StyleGuide.astro:190-197`).
- **Cheap:** CSS and Web Animations transforms only, no layout reads in animation frames, no
  framework, mini-games loaded on the first tap (`StyleGuide.astro:185`).
- **Offscreen pause:** idle loops and illustrations sleep when you scroll away (`data-motion`).
- **State in the URL:** `?play=<id>` / `?board=<id>` lets the page arrive docked, with no flash.
- **Swaps, not jumps:** game-to-game links eject one cartridge and plug in the other.

**Reduced motion** (`prefers-reduced-motion: reduce`): every loop stops and navigation becomes a
plain link (`StyleGuide.astro:191`). The CSS sets `animation: none` and `transition: none` globally
(`style.css:1409-1416`), turns off view transitions (`style.css:3083-3089`) and hides the scene
motion toggle (`style.css:2702-2711`). Games keep essential movement but drop decorative particles
and idle pulses (`README.md:63`).

---

## 9. Accessibility

- **Contrast:** AA for text in both themes (table in §3). Light theme text uses `--accent-text`.
  Text on an accent face uses the dark button ink `#171022` or `--accent-ink`.
- **Focus:** always visible. Links and buttons: `2px solid var(--accent)`, offset 5px
  (`style.css:90-95`); 3D keys: `2px solid var(--ink)`, offset 6px (`style.css:1733-1737`);
  cartridges: `3px solid var(--ink)`, offset 6px (`Cartridge.astro:89`).
- **State without colour alone:** selected keys stay pressed in (`StyleGuide.astro:125`).
- **Names:** icon-only keys keep their label as the accessible name (`.nav-label`, `IconKey`).
- **Skip link** to the games; decorative art is `aria-hidden`; illustrations carry an
  `aria-label`.
- **Touch:** `touch-action: manipulation` on buttons and links; 40–46px keys.
- The rulebook's floor (README §10): one `h1`, landmarks, alt text, keyboard paths, visible
  focus, reduced-motion fallbacks, AA contrast in both themes.

---

## 10. Never

- Never put gradients, blurs or glows in the **game layer** unless they are measured (rulebook §2).
  Shadows are hard and offset, never blurred.
- Never smooth, outline, rotate or recolour the skull mark; never add gradients, glows or bevels
  to it (`StyleGuide.astro:64`, `:78-79`).
- Never mix line icons and pixel art in one control (`StyleGuide.astro:202`).
- Never use a raw accent for light-theme text; use `--accent-text`.
- Never use web fonts or font downloads (`StyleGuide.astro:98`).
- Never animate layout or read layout in an animation frame; never let a hover bounce push a key
  through its base ("No overshoot", `StyleGuide.astro:126`).
- Never move the console, and never jump between games without the eject/plug-in swap.
- Never hard-code another site's host in a page; read URLs from [`family.json`](family.json).
- Never restyle game sections, heroes or in-page animations in Phase 2 (rulebook §13).
- Never merge the hub `.button` and Board UI keys by hand outside the Phase 2 component work.

---

## Open questions

1. **Shadow direction.** The rulebook default is "hard bases straight below (never to the side
   unless a brand's cartridge says so)". The hub uses 45° down-right everywhere, and its own guide
   says "Depth always falls down and to the right". Board UI uses straight below. Is the hub's
   `--shadow-angle` officially 45° down-right, or does Phase 2 move the hub to straight below?
2. **The "amber" accent is not amber.** `accent-amber` is `#ee6875` (a coral red), and Sherman's
   enemy tank uses the same hex. The console attract loop draws the tank in `#ffb547`
   (`CartridgeShelf.astro:27`). Keep the token name, rename it, or change the hex (a design change,
   so not in Phase 2)?
3. **Byte Runner's accent.** The game section overrides `--accent` to `#3ecb74`
   (`style.css:1886-1888`), while `accent-lime` is `#4bce82`. Which is the brand value?
4. **Pink has no class.** Pink (`#f4457a`) is the `:root` default; there is no `.accent-pink`,
   although `family.json` gives DOM Kaiju and Blitz the accent `pink`.
5. **Dark by default.** The rulebook says "Dark by default". The hub follows the system colour
   scheme (dark markup before the script). Confirm that system-first is the intended reading.
6. **Flat colour in the page layer.** The hub chrome uses a few gradients and glows: the grid
   background on the code board, the cartridge pins, the COMING SOON stripes, the console boot glow
   and the hero alarm glow. The rule names the game layer; confirm these page-layer details are
   allowed.
7. **Line-up numbering.** The live guide's line-up (`StyleGuide.astro:33-39`) and the shelf number
   Sherman 01, Battlefield 02, Swarm 03, Byte Runner 04, Null Invaders 05. The rulebook roster is
   Sherman 01, Battlefield 02, Blitz 03, Swarm 04, Byte Runner 05, Null Invaders 06, Kaiju 07.
8. **Where Board UI lives.** `BOARD-UI.md` (v1.1) still says it "Lives in the DOM Battlefield repo";
   Fizlet's `CLAUDE.md` and the rulebook name `fizlet/src/ui/` as the source of truth.
