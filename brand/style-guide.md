# Style guide — DOM VIRUS

Preset: cyberpunk-tron · flat colors only (no gradients, blur or glow) · hard shadows that fall 45° down-right · shared 3D keys

Cyber Punk × Tron in flat colour: a deep violet-navy night, neon accents, an ink outline on
everything you can press, and every game shipped as a cartridge. Paint is the budget, so depth
comes from hard offset bases, never from blur. Live source: `site-kit/style.css` and the
`/style-guide/` page (`site-kit/components/StyleGuide.astro`) in coded-dot-design/dom-virus. If
this file and the source disagree, the source wins.

```tokens
{
  "color": {
    "dark": {
      "bg": "#100a1b", "surface": "#1a112b", "raised": "#281b40", "ink": "#fff4ff",
      "muted": "#cec0e0", "faint": "#b39acd", "line": "#49345e",
      "accent": "#f4457a", "accent-ink": "#21051a", "hover": "#79cddc"
    },
    "light": {
      "bg": "#f6f7f8", "surface": "#ffffff", "raised": "#edf0f2", "ink": "#171022",
      "muted": "#4d5866", "faint": "#586577", "line": "#d1d7de",
      "accent": "#f4457a", "accent-text": "#bf2d5b", "accent-ink": "#21051a"
    },
    "game": {
      "pink": "#f4457a", "amber": "#ee6875", "cyan": "#06c4ff",
      "violet": "#8573ee", "lime": "#4bce82", "technical": "#63bfc8"
    },
    "screen": "#07060f"
  },
  "font": {
    "sans": "Inter, Arial, Helvetica, sans-serif",
    "mono": "ui-monospace, SFMono-Regular, Consolas, monospace",
    "body-line-height": "1.65",
    "heading-line-height": "1.08",
    "heading-letter-spacing": "-0.04em",
    "button": "700 14px"
  },
  "key": {
    "radius": "9px",
    "border": "2px",
    "min-height": "46px",
    "rest": "3px 3px 0 #fff4ff",
    "hover": "5px 5px 0 #fff4ff",
    "press": "0 0 0 #fff4ff",
    "rest-light": "3px 3px 0 #171022",
    "travel": "140ms",
    "press-time": "55ms"
  },
  "board-key": {
    "rest": "0 3px 0 #3b3170",
    "press": "0 0 0 #3b3170",
    "rim": "#07060f",
    "radius": "6px",
    "travel": "120ms",
    "press-time": "50ms"
  },
  "shadow": {
    "card": "7px 7px 0 #f4457a",
    "code-card": "6px 6px 0 #f4457a",
    "console": "16px 16px 0 #fff4ff"
  },
  "byline": { "text": "by Chris Cooley", "href": "https://coded.design/" }
}
```

<!-- src: color dark/light coded-dot-design/dom-virus site-kit/style.css:1-31, hover :1864-1866; game accents :32-46, :1454-1458, technical :745; screen tokens.json rim/bg -->
<!-- src: font site-kit/style.css:13-14, :68-73, :109-114, :3223-3231 -->
<!-- src: key site-kit/style.css:1703-1731 (rest, hover, press, 140ms, 55ms), :3223-3231 (2px, 9px, 46px) -->
<!-- src: board-key coded-dot-design/fizlet 0.5.1 src/ui/tokens.json "key"/"motion", src/ui/board-ui.css:80-99, :125-131 (u = 1px on desktop) -->
<!-- src: shadow site-kit/style.css:1697, :3205; console CartridgeShelf.astro:99 -->

## Rules

- **Flat colour only.** Solid fills, hard offset shadows with zero blur. No gradients, blur or
  glow on new pages.
- **Every surface you can press is a 3D key.** A flat face over a hard base. Hover lifts the face
  and grows the base by the same amount; press lands exactly on the base; selected stays pressed
  in; one curve, no overshoot (`StyleGuide.astro:119-127`).
- **Shadows fall 45° down-right on the hub** (x = y): keys, cards, console and cartridges. Never
  mix directions within the hub. Boards use the shared Board UI key, whose base sits straight
  below.
- **One shared key family.** The Fizlet Board UI kit (`src/ui/BOARD-UI.md`, `board-ui.css`,
  `tokens.json`) is the source of truth for the 3D key; the hub `.button` follows the same rule.
- **Dark is home; light is the same world at noon.** One set of token names in both themes. Light
  theme text uses `accent-text`, never the raw accent.
- **Plain sans, machine mono.** No web fonts and no downloads (`StyleGuide.astro:98`).
- **Pixels for play, lines for UI.** Never mix pixel art and line icons in one control
  (`StyleGuide.astro:202`).
- **One mark.** The pixel skull, always crisp, pink on dark or light; never smoothed, outlined,
  rotated, recoloured or given effects (`StyleGuide.astro:64`, `:78`).
- **Motion is cheap and reversible.** Transforms only, nothing reads layout in an animation
  frame, idle loops pause offscreen, `prefers-reduced-motion` stops all of it
  (`style.css:1409-1416`).
- **The byline is on every page:** "by Chris Cooley", linked to https://coded.design/.

## Current styles (documented, Phase 2 lock)

What ships today on the hub, in `site-kit/style.css` unless named:

| Element | Value | Source |
|---|---|---|
| Dark theme ground / ink | `#100a1b` / `#fff4ff` | `style.css:3`, `:6` |
| Light theme ground / ink | `#f6f7f8` / `#171022` | `style.css:20`, `:23` |
| Brand accent (default, the skull) | `#f4457a` | `style.css:10` |
| Game accents | amber `#ee6875` (Sherman Bytes), cyan `#06c4ff` (Null Invaders, DOM Battlefield), violet `#8573ee` (Swarm Protocol), lime `#4bce82` (Byte Runner) | `style.css:32-46`, `:1454-1458` |
| Byte Runner section override | `--accent: #3ecb74` | `style.css:1886-1888` |
| Technical cards (Under the Hood) | `#63bfc8` on the same hard edges | `style.css:745`, `:2186-2191` |
| `.button` rest / hover / press | `3px 3px 0` ink → `translate(-2px,-2px)` + `5px 5px 0` → `translate(3px,3px)` + `0 0 0`, 55ms | `style.css:1703-1731` |
| `.button` shape | 2px ink border, 9px radius, 46px min height, 700 14px | `style.css:3223-3231` |
| Key focus | `2px solid` ink, offset 6px | `style.css:1733-1737` |
| Link focus | `2px solid` accent, offset 5px | `style.css:90-95` |
| Game display / hero art | `7px 7px 0` accent / `7px 7px 0 #f4457a` | `style.css:1696-1697`, `:1517` |
| Cartridge | solid 45° extrusion, side 7px, no drop shadow | `StyleGuide.astro:137` |
| Console | 14px 45° extrusion + `16px 16px 0` ink | `StyleGuide.astro:137`, `CartridgeShelf.astro:99` |
| Board UI key (shared, Fizlet 0.5.1) | base `0 var(--py) 0 var(--edge)` straight below, 3u base / 4u arcade, 120ms, press 50ms | `board-ui.css:80-99`, `:125-131` |

## Exceptions (Phase 2 lock)

These ship today and are not flat. They are documented here and stay as they are; new pages use
the flat tokens above.

- **Board UI key glow** (dark theme only): arcade keys carry a soft neon halo of 14u / 18u / 22u
  at rest / hover / press, and locked keys an 18u breath. Source: coded-dot-design/fizlet 0.5.1
  `src/ui/board-ui.css:161-163`, `:181`; `src/ui/tokens.json` "derived".
- **Keymap keycap hover halo:** `0 0 12px` of the key colour on hover (`style.css:2852-2855`), and
  a two-layer background for the coloured keycap border (`style.css:2809-2811`).
- **Code board grid:** a 20px line grid drawn with two linear gradients (`style.css:304-307`).
- **Dot pattern:** a radial-gradient dot background (`style.css:558`).
- **Style guide console LED:** `0 0 8px #4bce82` (`StyleGuide.astro:351`), and a scanline
  repeating gradient on the demo screen (`StyleGuide.astro:342`).
- **Mark stage:** a line grid behind the skull on the style guide page (`StyleGuide.astro:281`).
