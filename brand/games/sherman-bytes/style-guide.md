# Style guide — Sherman Bytes

Preset: cyberpunk-tron · flat colors only (no gradients, blur or glow) · inherits DOM VIRUS · amber accent · shared 3D keys

Sherman Bytes wears the DOM VIRUS look: night ground, neon on ink, hard 45° shadows, the
cartridge. Everything not listed here comes from the DOM VIRUS style guide (brand/style-guide.md).
This file lists only what differs: the accent, the palette, the cast and the cartridge.

```tokens
{
  "game": { "id": "sherman-bytes", "number": "01", "tag": "DOM TANK", "kind": "DOM TANK TACTICS", "icon": "tank" },
  "color": {
    "accent": "#ee6875",
    "accent-ink": "#292014",
    "accent-text-light": "#b13f4b",
    "accent-ink-light": "#270508",
    "hover": "#e7ba74",
    "palette": {
      "tank-bits": "#4bce82",
      "enemy": "#ee6875",
      "heavy": "#f4457a",
      "shell": "#06c4ff",
      "power": "#cdde00"
    },
    "characters": {
      "your-sherman": "#4bce82",
      "scout-tank": "#ee6875",
      "heavy-tank": "#f4457a",
      "field-engineer": "#4bce82"
    }
  },
  "key": {
    "face": "#ee6875",
    "ink": "#171022",
    "rest": "3px 3px 0 #fff4ff",
    "board-base": "0 3px 0 #3b3170"
  },
  "cartridge": {
    "face": "#ee6875",
    "side": "7px",
    "bottom": "6px",
    "label": "01 / DOM TANK TACTICS",
    "tagline": "Every page is a battlefield.",
    "variant": "standard"
  },
  "byline": { "text": "by Chris Cooley", "href": "https://coded.design/" }
}
```

<!-- src: accent coded-dot-design/dom-virus site-kit/style.css:1454-1463 (.accent-amber), hover :1879-1882 -->
<!-- src: palette, characters, kind, tagline coded-dot-design/sherman-bytes site/game.json -->
<!-- src: key face/ink the hub .button, style.css:1703-1731; board-base coded-dot-design/fizlet src/ui/tokens.json --line, board-ui.css:80 -->
<!-- src: cartridge site-kit/components/Cartridge.astro:38, StyleGuide.astro:137 -->

## Rules

- **Amber is the game's signal, and it reads coral.** `accent-amber` is `#ee6875`. Use it for the
  game section, its keys and its cartridge; light-theme text uses `#b13f4b`.
- **Contrast holds:** `#ee6875` on the dark ground 6.36:1; `#b13f4b` on the light ground 5.32:1;
  button ink `#171022` on the amber face 6.06:1 (WCAG 2, computed from the hexes above).
- **Green is you, red and pink are them.** Your tank and its bits are `#4bce82`; scouts are coral,
  heavies pink; shells cyan; power yellow-green. Never swap sides.
- **Pixels for play.** Tank, engineer and enemies are crisp pixel art with two tread frames and
  an independent turret; keep them crisp, never smoothed.
- **Real text is the terrain.** Binary rubble is the page's own text, never a drawn copy.

## Current styles (documented, Phase 2 lock)

| Element | Value | Source |
|---|---|---|
| Accent class | `.accent-amber`: `#ee6875`, ink `#292014`; light `#b13f4b` / `#270508` | `style.css:1454-1463` |
| Hover signal | `#e7ba74` | `style.css:1879-1882` |
| Hard cover in the page | `[data-sherman-wall]`: 1px dashed accent, 11px mono caps, 0.08em tracking | `style.css:1470-1478` |
| Spawn buttons in the preview | 3px double border, accent 65% into line | `style.css:1501-1503` |
| Preview tank | rotated −27° | `style.css:1498-1500` |
| Cartridge | standard (PRESS START), tank icon, first on the shelf | `CartridgeShelf.astro:41` |
| Binary rubble opacity | `binaryOpacity: 0.32` via CSS Highlights; fully visible without that API | `site/game.json` code, extra |

## Exceptions (Phase 2 lock)

Shipped by the shared DOM VIRUS runtime (coded-dot-design/dom-virus 0.21.0, bundled in this
game), not flat, documented and left as they are:

- **Scoreboard panel:** a frosted backdrop blur of 16px on desktop, turned off on touch and narrow
  screens (`src/arcade-hud.ts:5`, `src/runtime.ts:266`).
- **Touch joystick and keys:** a 14px soft halo of the key colour on the knob and touch keys, and a
  ring drawn with a radial gradient plus an 18px inner shade on the stick
  (`src/touch-controls.ts:291`, `:293`, `:296`).
