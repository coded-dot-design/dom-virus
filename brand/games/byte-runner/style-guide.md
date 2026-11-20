# Style guide — Byte Runner

Preset: cyberpunk-tron · flat colors only (no gradients, blur or glow) · inherits DOM VIRUS · lime accent · shared 3D keys

Byte Runner wears the DOM VIRUS look: night ground, neon on ink, hard 45° shadows, the cartridge.
Everything not listed here comes from the DOM VIRUS style guide (brand/style-guide.md). This file
lists only what differs: the accent, the frog, the flies and the cartridge.

```tokens
{
  "game": { "id": "byte-runner", "number": "05", "tag": "DOM CHASE", "kind": "DOM CHASE", "icon": "runner" },
  "color": {
    "accent": "#4bce82",
    "accent-section": "#3ecb74",
    "accent-ink": "#1b2710",
    "accent-text-light": "#171022",
    "accent-ink-light": "#102006",
    "hover": "#79cddc",
    "palette": {
      "frog": "#3ecb74",
      "chaser": "#8573ee",
      "interceptor": "#f4457a",
      "roamer": "#06c4ff",
      "vulnerable": "#628dce"
    },
    "characters": {
      "byte-runner": "#3ecb74",
      "frog-light": "#8de45c",
      "frog-eye": "#fff5d7",
      "frog-outline": "#152820",
      "chaser": "#8573ee",
      "interceptor": "#f4457a",
      "roamer": "#06c4ff",
      "vulnerable-flies": "#628dce",
      "power-pellet": "#f4457a",
      "bonus-fruit": "#f4457a"
    }
  },
  "key": {
    "face": "#4bce82",
    "ink": "#171022",
    "rest": "3px 3px 0 #fff4ff",
    "board-base": "0 3px 0 #3b3170"
  },
  "cartridge": {
    "face": "#4bce82",
    "side": "7px",
    "bottom": "6px",
    "tagline": "Follow the bites. Eat the page.",
    "variant": "standard"
  },
  "byline": { "text": "by Chris Cooley", "href": "https://coded.design/" }
}
```

<!-- src: accent coded-dot-design/dom-virus site-kit/style.css:37-41, :53-58 (.accent-lime), hover :1871-1874, section override :1886-1888 -->
<!-- src: palette, characters, kind, tagline coded-dot-design/byte-runner site/game.json; frog art colours site/art.json -->
<!-- src: key the hub .button, style.css:1703-1731; board-base coded-dot-design/fizlet src/ui/tokens.json --line, board-ui.css:80 -->
<!-- src: cartridge site-kit/components/Cartridge.astro:38, StyleGuide.astro:137 -->

## Rules

- **Lime outside, frog green inside.** Cartridge, shelf and chips use `accent-lime` `#4bce82`; the
  game section sets the frog's own `#3ecb74`. Lime is too light for text on white, so light-theme
  text uses the ink `#171022`.
- **Contrast holds:** `#4bce82` on the dark ground 9.66:1 (`#3ecb74` 9.25:1); button ink `#171022`
  on the lime face 9.22:1 (WCAG 2, computed from the hexes above).
- **One green frog against three coloured flies.** Violet chases, pink intercepts, cyan roams; all
  turn blue `#628dce` when vulnerable. Pink also marks power and fruit.
- **Upright pixels.** The frog and flies are crisp pixel art and never rotate in the preview.
- **The power pulse is flat:** three stacked pink squares at 10%, 24% and full opacity, no blur
  (coded-dot-design/byte-runner `src/presentation.ts:280`).

## Current styles (documented, Phase 2 lock)

| Element | Value | Source |
|---|---|---|
| Accent class | `.accent-lime`: `#4bce82`, ink `#1b2710`; light text `#171022`, ink `#102006` | `style.css:37-41`, `:53-58` |
| Game section accent | `#byte-runner { --accent: #3ecb74 }` | `style.css:1886-1888` |
| Hover signal | `#79cddc` | `style.css:1871-1874` |
| Preview characters | upright grid, never rotated | `style.css:1955-1963` |
| Pipe guides | 25% opacity dark, 32% light | byte-runner `src/presentation.ts:265` |
| Cartridge | standard (PRESS START), frog icon; the live style guide's standard cartridge example | `StyleGuide.astro:147` |

## Exceptions (Phase 2 lock)

Shipped by the shared DOM VIRUS runtime (coded-dot-design/dom-virus 0.21.0, bundled in this
game), not flat, documented and left as they are:

- **Scoreboard panel:** a frosted backdrop blur of 16px on desktop, turned off on touch and narrow
  screens (`src/arcade-hud.ts:5`, `src/runtime.ts:266`).
- **Touch joystick and keys:** a 14px soft halo of the key colour on the knob and touch keys, and a
  ring drawn with a radial gradient plus an 18px inner shade on the stick
  (`src/touch-controls.ts:291`, `:293`, `:296`).
