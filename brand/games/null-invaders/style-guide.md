# Null Invaders: style guide

Preset: cyberpunk-tron · flat colors in the game layer (hard, unblurred shadows; the shadow angle is a brand token). Read by astro-base-engine; the site renders its own look.

**#06 · DOM SHOOTER · Embedded · Released.** Fly an interceptor through a real webpage, shoot
letters into binary and break the button factories.

**Inherits everything from the parent guide** ([`../../style-guide.md`](../../style-guide.md)):
type, surfaces, light/dark tokens, the 3D rule and keys, motion, reduced motion, accessibility and
the "never" list. The page frame is the parent's. This file lists only what differs.

**Sources:** [`null-invaders/site/game.json`](https://github.com/coded-dot-design/null-invaders/blob/main/site/game.json)
(source of truth) and [`null-invaders/site/art.json`](https://github.com/coded-dot-design/null-invaders/blob/main/site/art.json)
(ship art), mirrored in [`site/generated/data.json`](../../../site/generated/data.json) and
[`site-kit/character-art.json`](../../../site-kit/character-art.json); alien art in
[`site-kit/components/Icon.astro`](../../../site-kit/components/Icon.astro); accent classes in
[`site-kit/style.css`](../../../site-kit/style.css).

---

## Tokens

```tokens
{
  "$source": "null-invaders/site/game.json (accent, palette, characters, icon, kind, tagline); null-invaders/site/art.json (ship); site-kit/components/Icon.astro (drone, crab, squid); site-kit/style.css:32-36, :47-52 (.accent-cyan), :1867-1870 (--hover)",
  "game": { "id": "null-invaders", "number": "06", "tag": "DOM SHOOTER", "kindToday": "DOM SHOOTER", "type": "embedded", "style": null, "icon": "ship" },
  "color": {
    "accent": { "class": "accent-cyan", "accent": "#06c4ff", "accent-ink": "#102528", "hover": "#b1a1e8" },
    "accent-light": { "accent": "#06c4ff", "accent-text": "#247488", "accent-ink": "#061b29" },
    "palette": {
      "Ship / bits": "#06c4ff",
      "Drone": "#8573ee",
      "Crab": "#f4457a",
      "Squid": "#cdde00",
      "Danger": "#ee6875"
    },
    "characters": {
      "Interceptor": { "role": "Pilot", "color": "#06c4ff", "art": ["#06c4ff", "#0b8eae", "#092331", "#cdde00", "#fff5d7"] },
      "Drone": { "role": "Pursuer", "color": "#8573ee", "outline": "#261634", "eyes": "#fff1ff" },
      "Crab": { "role": "Fast pursuer", "color": "#f4457a", "outline": "#321623", "eyes": "#fff6d6" },
      "Squid": { "role": "Fastest pursuer", "color": "#cdde00", "outline": "#32200f", "eyes": "#fff7d1" }
    }
  },
  "cartridge": {
    "label": "05 / DOM SHOOTER",
    "name": "Null Invaders",
    "tagline": "Delete the invasion.",
    "cover": "pixel interceptor (ship) icon on the cyan label art panel",
    "face": "#06c4ff",
    "variant": "standard (one action: PRESS START)",
    "shadow-angle": "inherits the hub: 45deg down-right"
  }
}
```

## What differs from the parent

- **Accent: cyan** (`accent-cyan`, `#06c4ff`), shared with DOM Battlefield. Light-theme text uses
  `#247488`. The hover signal is lilac `#b1a1e8`. Contrast: `#06c4ff` on the dark background
  9.57:1; `#247488` on the light background 4.98:1; button ink on the accent face 9.13:1.
- **Palette:** cyan ship and bits; three aliens in violet (drone), pink (crab) and yellow-green
  (squid); coral for danger.
- **Characters:** "The cyan interceptor keeps its split nose, stepped wings, lime core, and twin
  engines" (`game.json:49`). The aliens are two-frame pixel shapes with a dark outline and pale
  eyes. `game.json` leaves character colours empty; the colours above come from the art files.
- **Upright grid:** illustration characters are never rotated (`style.css:1955-1962`).
- **Gameplay tag and number:** `06 / DOM SHOOTER` in the rulebook. The shelf cartridge reads
  `05 / DOM SHOOTER` today.
- **Cartridge:** standard cartridge, ship icon on the label. The interceptor is also the hero's
  ship on the hub home page (`HeroScene.astro:134`).

## Open questions

1. **Shared accent:** Null Invaders and DOM Battlefield are both cyan, so two cartridges on the
   shelf share a colour. Intended?
2. **Number:** the shelf says 05, the rulebook roster says 06.
