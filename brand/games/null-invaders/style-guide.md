# Style guide — Null Invaders

Preset: cyberpunk-tron · flat colors only (no gradients, blur or glow) · inherits DOM VIRUS · cyan accent · shared 3D keys

Null Invaders wears the DOM VIRUS look: night ground, neon on ink, hard 45° shadows, the
cartridge. Everything not listed here comes from the DOM VIRUS style guide (brand/style-guide.md).
This file lists only what differs: the accent, the ship, the aliens and the cartridge.

```tokens
{
  "game": { "id": "null-invaders", "number": "06", "tag": "DOM SHOOTER", "kind": "DOM SHOOTER", "icon": "ship" },
  "color": {
    "accent": "#06c4ff",
    "accent-ink": "#102528",
    "accent-text-light": "#247488",
    "accent-ink-light": "#061b29",
    "hover": "#b1a1e8",
    "palette": {
      "ship-bits": "#06c4ff",
      "drone": "#8573ee",
      "crab": "#f4457a",
      "squid": "#cdde00",
      "danger": "#ee6875"
    },
    "characters": {
      "interceptor": "#06c4ff",
      "interceptor-shade": "#0b8eae",
      "interceptor-outline": "#092331",
      "interceptor-core": "#cdde00",
      "interceptor-light": "#fff5d7",
      "drone": "#8573ee",
      "crab": "#f4457a",
      "squid": "#cdde00"
    }
  },
  "key": {
    "face": "#06c4ff",
    "ink": "#171022",
    "rest": "3px 3px 0 #fff4ff",
    "board-base": "0 3px 0 #3b3170"
  },
  "cartridge": {
    "face": "#06c4ff",
    "side": "7px",
    "bottom": "6px",
    "tagline": "Delete the invasion.",
    "variant": "standard"
  },
  "byline": { "text": "by Chris Cooley", "href": "https://coded.design/" }
}
```

<!-- src: accent fizlet/dom-virus site-kit/style.css:32-36, :47-52 (.accent-cyan), hover :1867-1870 -->
<!-- src: palette, characters, kind, tagline fizlet/null-invaders site/game.json; ship colours site/art.json -->
<!-- src: key the hub .button, style.css:1703-1731; board-base fizlet/fzlt src/ui/tokens.json --line, board-ui.css:80 -->
<!-- src: cartridge site-kit/components/Cartridge.astro:38, StyleGuide.astro:137 -->

## Rules

- **Cyan is the ship and the signal.** `accent-cyan` `#06c4ff` for the section, keys and
  cartridge; light-theme text uses `#247488`. Cyan is shared with DOM Battlefield.
- **Contrast holds:** `#06c4ff` on the dark ground 9.57:1; `#247488` on the light ground 4.98:1;
  button ink `#171022` on the cyan face 9.13:1 (WCAG 2, computed from the hexes above). Raw cyan
  is never light-theme text.
- **One cyan ship against three aliens.** Violet drone, pink crab, yellow-green squid; coral means
  danger.
- **The ship keeps its shape.** Split nose, stepped wings, lime core, twin engines, through Pulse,
  Twin, Trident and Overdrive. Pixel variants are baked once and drawn with smoothing off.
- **Upright pixels.** Ship and aliens never rotate in the preview.

## Current styles (documented, Phase 2 lock)

| Element | Value | Source |
|---|---|---|
| Accent class | `.accent-cyan`: `#06c4ff`, ink `#102528`; light `#247488` / `#061b29` | `style.css:32-36`, `:47-52` |
| Hover signal | `#b1a1e8` | `style.css:1867-1870` |
| Preview characters | upright grid, never rotated | `style.css:1955-1963` |
| Ship art | four weapon tiers, at most 64 cached ship variants | null-invaders `README.md:142` |
| Hub hero | the interceptor is the hero's ship on the home page | `HeroScene.astro` |
| Cartridge | standard (PRESS START), ship icon on the label | `CartridgeShelf.astro:52` |

## Exceptions (Phase 2 lock)

Shipped by the shared DOM VIRUS runtime (fizlet/dom-virus 0.21.0, bundled in this
game), not flat, documented and left as they are:

- **Factory buttons:** the liquid health fill is a hard-stop linear gradient from the bottom up
  (`src/target-effects.ts:41`; this game sets `targetEffects: "liquid"`).
- **Scoreboard panel:** a frosted backdrop blur of 16px on desktop, turned off on touch and narrow
  screens (`src/arcade-hud.ts:5`, `src/runtime.ts:266`).
- **Touch joystick and keys:** a 14px soft halo of the key colour on the knob and touch keys, and a
  ring drawn with a radial gradient plus an 18px inner shade on the stick
  (`src/touch-controls.ts:291`, `:293`, `:296`).
