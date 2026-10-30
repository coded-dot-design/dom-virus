# Style guide — Swarm Protocol

Preset: cyberpunk-tron · flat colors only (no gradients, blur or glow) · inherits DOM VIRUS · violet accent · shared 3D keys

Swarm Protocol wears the DOM VIRUS look: night ground, neon on ink, hard 45° shadows, the
cartridge. Everything not listed here comes from the DOM VIRUS style guide (brand/style-guide.md).
This file lists only what differs: the accent, the crew, the bug and the cartridge.

```tokens
{
  "game": { "id": "swarm-protocol", "number": "04", "tag": "DOM DEFENSE", "kind": "DOM DEFENSE", "icon": "bug" },
  "color": {
    "accent": "#8573ee",
    "accent-ink": "#231635",
    "accent-text-light": "#5f48ba",
    "accent-ink-light": "#21051a",
    "hover": "#74dfa1",
    "palette": {
      "cursor": "#06c4ff",
      "crawler": "#ff6b6b",
      "evolved-bits": "#d984ff",
      "hunter": "#8573ee",
      "score": "#74dfa1"
    },
    "characters": {
      "cursor-target": "#06c4ff",
      "crawler": "#ff6b6b",
      "evolved-crawler": "#d984ff",
      "button-hunter": "#8573ee"
    }
  },
  "key": {
    "face": "#8573ee",
    "ink": "#171022",
    "rest": "3px 3px 0 #fff4ff",
    "board-base": "0 3px 0 #3b3170"
  },
  "cartridge": {
    "face": "#8573ee",
    "side": "7px",
    "bottom": "6px",
    "tagline": "Protect every last byte.",
    "variant": "standard"
  },
  "byline": { "text": "by Chris Cooley", "href": "https://coded.design/" }
}
```

<!-- src: accent coded-dot-design/dom-virus site-kit/style.css:42-46, :59-63 (.accent-violet), hover :1875-1878 -->
<!-- src: palette, characters, kind, tagline coded-dot-design/swarm-protocol site/game.json -->
<!-- src: key the hub .button, style.css:1703-1731; board-base coded-dot-design/fizlet src/ui/tokens.json --line, board-ui.css:80 -->
<!-- src: cartridge site-kit/components/Cartridge.astro:38, StyleGuide.astro:137 -->

## Rules

- **Violet is the game's signal.** `accent-violet` `#8573ee` for the section, keys and cartridge;
  light-theme text uses `#5f48ba`. Mint `#74dfa1` is the hover and the score.
- **Contrast holds:** `#8573ee` on the dark ground 5.26:1; `#5f48ba` on the light ground 6.27:1;
  button ink `#171022` on the violet face 5.01:1 (WCAG 2, computed from the hexes above).
- **The crew grows in colour order:** coral crawler, lilac evolved crawler, violet hunter, in both
  themes. You are the cyan crosshair, not a character.
- **The button is the health bar.** Mint, then yellow at 75%, then coral red at 35%; the real label,
  icon and handler stay the page's own.

## Current styles (documented, Phase 2 lock)

| Element | Value | Source |
|---|---|---|
| Accent class | `.accent-violet`: `#8573ee`, ink `#231635`; light `#5f48ba` / `#21051a` | `style.css:42-46`, `:59-63` |
| Hover signal | `#74dfa1` | `style.css:1875-1878` |
| Preview crew | coral `#ff6b6b`, lilac `#d984ff`, violet `#8573ee`, both themes | `style.css:1775-1785` |
| Preview bugs | upright, aligned pixels, connected limbs | `style.css:1856-1861` |
| Bug icon | a line drawing adapted from Lucide (ISC), the one character icon that is not pixel art | `site-kit/components/Icon.astro:6` |
| Cartridge | standard (PRESS START), bug icon on the label | `CartridgeShelf.astro:52` |

## Exceptions (Phase 2 lock)

Shipped by Swarm's own engine (coded-dot-design/swarm-protocol 1.3.1), not flat, documented and
left as they are:

- **Button health fill:** a hard-stop linear gradient from the bottom up
  (`src/target-health.ts:24`).
- **Button bubbles:** radial-gradient bubbles on mobile; desktop ripples and bubbles
  (`src/dom-defender.ts:389`, `:461`).
- **Scoreboard panel:** a 16px backdrop blur and a soft `0 12px 55px` drop shadow
  (`src/swarm-widget.ts:18`).
- **Edge attack alert:** a pulsing translucent halo, 2.2s (`src/attack-indicators.ts:53`, `:59`).
