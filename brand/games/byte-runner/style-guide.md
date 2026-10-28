# Byte Runner: style guide

**#05 · DOM CHASE · Embedded · Released.** A round, hungry pixel frog runs food trails through the
page's whitespace and eats real text.

**Inherits everything from the parent guide** ([`../../style-guide.md`](../../style-guide.md)):
type, surfaces, light/dark tokens, the 3D rule and keys, motion, reduced motion, accessibility and
the "never" list. The page frame is the parent's. This file lists only what differs.

**Sources:** [`byte-runner/site/game.json`](https://github.com/coded-dot-design/byte-runner/blob/main/site/game.json)
(source of truth) and [`byte-runner/site/art.json`](https://github.com/coded-dot-design/byte-runner/blob/main/site/art.json)
(character art), mirrored in [`site/generated/data.json`](../../../site/generated/data.json) and
[`site-kit/character-art.json`](../../../site-kit/character-art.json); accent classes in
[`site-kit/style.css`](../../../site-kit/style.css).

---

## Tokens

```tokens
{
  "$source": "byte-runner/site/game.json (accent, palette, characters, icon, kind, tagline); byte-runner/site/art.json; site-kit/style.css:37-41, :53-58 (.accent-lime), :1871-1874 (--hover), :1886-1888 (#byte-runner accent override)",
  "game": { "id": "byte-runner", "number": "05", "tag": "DOM CHASE", "kindToday": "DOM CHASE", "type": "embedded", "style": null, "icon": "runner" },
  "color": {
    "accent": { "class": "accent-lime", "accent": "#4bce82", "accent-ink": "#1b2710", "hover": "#79cddc", "game-section-override": "#3ecb74" },
    "accent-light": { "accent": "#4bce82", "accent-text": "#171022", "accent-ink": "#102006" },
    "palette": {
      "Frog": "#3ecb74",
      "Chaser": "#8573ee",
      "Interceptor": "#f4457a",
      "Roamer": "#06c4ff",
      "Vulnerable": "#628dce"
    },
    "characters": {
      "Byte Runner": { "role": "You", "color": "#3ecb74", "art": ["#3ecb74", "#8de45c", "#fff5d7", "#152820"] },
      "Chaser": { "role": "Direct pursuit", "color": "#8573ee" },
      "Interceptor": { "role": "Predictive pursuit", "color": "#f4457a" },
      "Roamer": { "role": "Unpredictable pursuit", "color": "#06c4ff" },
      "Vulnerable flies": { "role": "Power window", "color": "#628dce" },
      "Power pellet": { "role": "Flip the chase", "color": "#f4457a" },
      "Bonus fruit": { "role": "Extra points", "color": "#f4457a", "stem": "#4bce82" }
    }
  },
  "cartridge": {
    "label": "04 / DOM CHASE",
    "name": "Byte Runner",
    "tagline": "Follow the bites. Eat the page.",
    "cover": "pixel frog (runner) icon on the lime label art panel",
    "face": "#4bce82",
    "variant": "standard (one action: PRESS START)",
    "shadow-angle": "inherits the hub: 45deg down-right"
  }
}
```

## What differs from the parent

- **Accent: lime** (`accent-lime`, `#4bce82`). Inside its own game section the hub sets
  `--accent: #3ecb74`, the frog's green (`style.css:1886-1888`). Light-theme text uses the ink
  `#171022` (lime is too light for text on white: 1.87:1). The hover signal is teal `#79cddc`.
  Contrast: `#4bce82` on the dark background 9.66:1; button ink on the accent face 9.22:1.
- **Palette:** a green frog against three coloured flies (violet chaser, pink interceptor, cyan
  roamer) that turn blue (`#628dce`) when vulnerable. Pink also marks power pellets and fruit.
- **Characters:** retained pixel art from the game (frog with expressive eyes and tiny ball-shaped
  feet; flies with wings). The live page draws them from `art.json`.
- **Upright grid:** Byte Runner's illustration characters are never rotated
  (`style.css:1955-1962`).
- **Gameplay tag and number:** `05 / DOM CHASE` in the rulebook. The shelf cartridge reads
  `04 / DOM CHASE` today; the live style guide shows Byte Runner as its standard cartridge example
  (`StyleGuide.astro:147`).
- **Cartridge:** standard cartridge, runner icon on the label.

## Open questions

1. **Accent hex:** `accent-lime` is `#4bce82` (cartridge, shelf, size chips); the game section uses
   `#3ecb74`. Which is the brand value?
2. **Number:** the shelf says 04, the rulebook roster says 05.
