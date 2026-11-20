# Style guide — DOM Kaiju

Preset: cyberpunk-tron · flat colors only (no gradients, blur or glow) · inherits DOM VIRUS · pink accent · coming soon · shared 3D keys

DOM Kaiju is an idea, shown as coming soon. It wears the DOM VIRUS look: night ground, neon on
ink, hard 45° shadows, the cartridge. Everything not listed here comes from the DOM VIRUS style
guide (brand/style-guide.md). The cast colours below are the concept on the coming-soon page
("CONCEPT / NOT FINAL"), not a shipped game.

```tokens
{
  "game": { "id": "kaiju", "number": "07", "tag": "CLIMB + SMASH", "kind": "CLIMB + SMASH", "icon": "kaiju", "status": "idea" },
  "color": {
    "accent": "#f4457a",
    "accent-ink": "#21051a",
    "accent-text-light": "#bf2d5b",
    "hover": "#79cddc",
    "concept-palette": {
      "fur": "#3b2a6b",
      "chest-fists": "#ff2e88",
      "eyes": "#ffe14d",
      "choppers": "#06c4ff",
      "tracers": "#ffc21a",
      "fire": "#ff8a1f",
      "electricity": "#19f0ff",
      "rubble": "#aea4d6"
    },
    "concept-cast": {
      "gorilla": "#3b2a6b",
      "choppers": "#06c4ff",
      "gunship": "#1d6fa3",
      "live-wires": "#19f0ff",
      "fire": "#ff8a1f",
      "people": "#ffd1dc"
    },
    "soon-band": "#ffe14d",
    "soon-band-alt": "#f4c21a"
  },
  "key": {
    "face": "#f4457a",
    "ink": "#171022",
    "rest": "3px 3px 0 #fff4ff",
    "board-base": "0 3px 0 #3b3170"
  },
  "cartridge": {
    "face": "#f4457a",
    "side": "7px",
    "bottom": "6px",
    "tagline": "Climb the page. Wreck the page.",
    "variant": "coming soon"
  },
  "byline": { "text": "by Chris Cooley", "href": "https://coded.design/" }
}
```

<!-- src: accent pink is the hub default, fizlet/dom-virus site-kit/style.css:10-11, :28, hover :1864-1866; accent "pink" site-kit/coming-soon.ts:62 -->
<!-- src: concept palette and cast site-kit/components/KaijuDetail.astro:18-28; docs/games/dom-kaiju.md palette table -->
<!-- src: cartridge CartridgeShelf.astro:57-61; soon band Cartridge.astro:43, :113 -->
<!-- src: key the hub .button, style.css:1703-1731; board-base fizlet/fzlt src/ui/tokens.json --line, board-ui.css:80 -->

## Rules

- **Pink is the signal, as the brand's own colour.** Kaiju uses the hub default `#f4457a`; there is
  no separate `.accent-pink` class. Light-theme text uses `#bf2d5b`.
- **Contrast holds:** `#f4457a` on the dark ground 5.53:1; `#bf2d5b` on the light ground 5.23:1;
  button ink `#171022` on the pink face 5.27:1 (WCAG 2, computed from the hexes above).
- **Say "concept" on every picture of the game.** The display reads "CONCEPT / NOT FINAL"; the play
  key stays disabled and reads "Coming soon".
- **Neon on ink, like DOM Battlefield.** The plan passes the palette to the engine as a Board UI
  palette, so the game itself will use the shared Board UI key.
- **Pixels for play.** The gorilla is crisp pixel art; the coming-soon art never smooths it.

## Current styles (documented, Phase 2 lock)

What ships today is the coming-soon page and cartridge, not a game:

| Element | Value | Source |
|---|---|---|
| Cartridge | coming-soon variant, gorilla icon, one INFO action, yellow striped COMING SOON band | `CartridgeShelf.astro:57-61`, `Cartridge.astro:43` |
| Section heading | `CLIMB + SMASH / COMING SOON`, version tag `PLANNED / MIT` | `KaijuDetail.astro:38` |
| Play key | disabled `Coming soon` key, 85% opacity, not-allowed cursor | `KaijuDetail.astro:44`, `:95` |
| Build-order note | accent at 14% into surface, 2px ink border, 8px radius, blinking 8px LED | `KaijuDetail.astro:90-94` |
| Concept display | blocks `#1a1430` with `#3c2b55` borders; choppers `#06c4ff`; SMASH! sticker `#ffe14d` | `KaijuDetail.astro:98-118` |
| Motion | steps() climb, rotor and burn loops, only while on screen; none under reduced motion | `KaijuDetail.astro:120-136`, `:152` |

## Exceptions (Phase 2 lock)

Shipped on the coming-soon page and cartridge, not flat, documented and left as they are:

- **COMING SOON band:** yellow stripes drawn with a repeating linear gradient
  (`Cartridge.astro:113`).
- **Concept city grid:** a 24px cyan line grid from two linear gradients (`KaijuDetail.astro:97`).
- **Live-wire card:** a soft cyan halo of 18px, pulsing to 26px (`KaijuDetail.astro:105`, `:136`).
- **Burning line:** an orange-yellow-pink gradient with a hue and brightness filter flicker
  (`KaijuDetail.astro:106`, `:135`).
- **Tracers:** an 8px soft amber halo (`KaijuDetail.astro:115`).
- **Cast swatches:** two colours split by a hard-stop diagonal gradient (`KaijuDetail.astro:145`).
