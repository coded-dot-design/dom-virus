# Sherman Bytes: style guide

**#01 · DOM TANK · Embedded · Classic · Released.** The tank game that started the pattern: its
characters grow into DOM Battlefield and Battlefield Blitz (rulebook
[`../../README.md`](../../README.md) §3, [`family.json`](../../family.json) → `builtFrom`).

**Inherits everything from the parent guide** ([`../../style-guide.md`](../../style-guide.md)):
type, surfaces, light/dark tokens, the 3D rule and keys, motion, reduced motion, accessibility and
the "never" list. The page frame is the parent's. This file lists only what differs.

**Sources:** [`sherman-bytes/site/game.json`](https://github.com/coded-dot-design/sherman-bytes/blob/main/site/game.json)
(source of truth), mirrored in [`site/generated/data.json`](../../../site/generated/data.json);
accent classes in [`site-kit/style.css`](../../../site-kit/style.css); character art in
[`site-kit/components/Icon.astro`](../../../site-kit/components/Icon.astro).

---

## Tokens

```tokens
{
  "$source": "sherman-bytes/site/game.json (accent, palette, characters, icon, kind, tagline); site-kit/style.css:1454-1464 (.accent-amber), :1879-1882 (--hover), :1470-1478 ([data-sherman-wall]); site-kit/components/Icon.astro (tank, engineer art)",
  "game": { "id": "sherman-bytes", "number": "01", "tag": "DOM TANK", "kindToday": "DOM TANK TACTICS", "type": "embedded", "style": "classic", "icon": "tank" },
  "color": {
    "accent": { "class": "accent-amber", "accent": "#ee6875", "accent-ink": "#292014", "hover": "#e7ba74" },
    "accent-light": { "accent": "#ee6875", "accent-text": "#b13f4b", "accent-ink": "#270508" },
    "palette": {
      "Tank / bits": "#4bce82",
      "Enemy": "#ee6875",
      "Heavy": "#f4457a",
      "Shell": "#06c4ff",
      "Power": "#cdde00"
    },
    "characters": {
      "Your Sherman": { "role": "Commander", "color": "#4bce82", "note": "game.json color is empty; the icon's default body is #4bce82, treads #8573ee, sight #06c4ff" },
      "Scout tank": { "role": "35 armor", "color": "#ee6875" },
      "Heavy tank": { "role": "70 armor", "color": "#f4457a" },
      "Field engineer": { "role": "Builder", "color": "#4bce82", "detail": "#8573ee" }
    }
  },
  "cartridge": {
    "label": "01 / DOM TANK TACTICS",
    "name": "Sherman Bytes",
    "tagline": "Every page is a battlefield.",
    "cover": "pixel tank icon on the amber label art panel",
    "face": "#ee6875",
    "variant": "standard (one action: PRESS START)",
    "shadow-angle": "inherits the hub: 45deg down-right"
  },
  "extras": {
    "bunker": "[data-sherman-wall]: 1px dashed var(--accent), 11px/1.5 mono, uppercase, 0.08em tracking",
    "target-buttons": "3px double border, color-mix(in srgb, var(--accent) 65%, var(--line))"
  }
}
```

## What differs from the parent

- **Accent: amber** (`accent-amber`, `#ee6875`). Light-theme text uses `#b13f4b`. The hover signal
  is gold `#e7ba74`. Contrast: `#ee6875` on the dark background 6.36:1; `#b13f4b` on the light
  background 5.32:1; button ink `#171022` on the accent face 6.06:1.
- **Palette** ("GAME PALETTE / FULL SIGNAL" strip on the game page): green tank and bits, coral
  enemy, pink heavy, cyan shell, yellow-green power (table above).
- **Characters:** your green Sherman, the coral Scout tank, the pink Heavy tank, and the Field
  engineer (green with violet). All crisp pixel art.
- **Gameplay tag and number:** `01 / DOM TANK`. Today the cartridge and section kicker read
  "DOM TANK TACTICS"; the rulebook's target is "DOM TANK" (a content change in the clean-up).
- **Cartridge:** standard cartridge, tank icon on the label, first slot on the shelf (index 0, so
  its sticker sits top left at −9° and peels). Its game sticker (`GameSticker`) uses the first look:
  −7° tilt, peeling corner.
- **On the game page:** the illustration's tank is rotated −27°; spawn buttons get a double
  border; a dashed "HARD COVER" bunker (`data-sherman-wall`) sits in the page as real cover
  (`GameSection.astro:58`, `style.css:1470-1478`, `:1498-1503`).
- **Related boards:** DOM Battlefield (cyan) and Battlefield Blitz (pink) use Sherman's tanks; they
  keep their own brand ([`family.json`](../../family.json)).

## Open questions

1. **"Amber" is coral.** The accent named amber is `#ee6875`, the same hex as the enemy Scout tank.
   The console attract loop draws the tank in a true amber, `#ffb547`
   (`CartridgeShelf.astro:27`). Which is Sherman's colour?
2. **Shelf number vs roster number.** The cartridge reads `01`, which matches the roster. (Other
   games' numbers shift; see the parent guide.)
