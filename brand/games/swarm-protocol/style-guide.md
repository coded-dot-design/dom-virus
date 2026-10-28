# Swarm Protocol: style guide

**#04 · DOM DEFENSE · Embedded · Released.** "The original DOM experiment." (its version note,
`swarm-protocol/site/game.json:11`). Bugs eat the page; you squash them.

**Inherits everything from the parent guide** ([`../../style-guide.md`](../../style-guide.md)):
type, surfaces, light/dark tokens, the 3D rule and keys, motion, reduced motion, accessibility and
the "never" list. The page frame is the parent's. This file lists only what differs.

**Sources:** [`swarm-protocol/site/game.json`](https://github.com/coded-dot-design/swarm-protocol/blob/main/site/game.json)
(source of truth), mirrored in [`site/generated/data.json`](../../../site/generated/data.json);
accent classes and crew colours in [`site-kit/style.css`](../../../site-kit/style.css); icons in
[`site-kit/components/Icon.astro`](../../../site-kit/components/Icon.astro).

---

## Tokens

```tokens
{
  "$source": "swarm-protocol/site/game.json (accent, palette, characters, icon, kind, tagline); site-kit/style.css:42-46, :59-63 (.accent-violet), :1875-1878 (--hover), :1775-1785 (Swarm crew); site-kit/components/Icon.astro (bug, reticle)",
  "game": { "id": "swarm-protocol", "number": "04", "tag": "DOM DEFENSE", "kindToday": "DOM DEFENSE", "type": "embedded", "style": null, "icon": "bug" },
  "color": {
    "accent": { "class": "accent-violet", "accent": "#8573ee", "accent-ink": "#231635", "hover": "#74dfa1" },
    "accent-light": { "accent": "#8573ee", "accent-text": "#5f48ba", "accent-ink": "#21051a" },
    "palette": {
      "Cursor": "#06c4ff",
      "Crawler": "#ff6b6b",
      "Evolved / bits": "#d984ff",
      "Hunter": "#8573ee",
      "Score": "#74dfa1"
    },
    "characters": {
      "Cursor target": { "role": "You · aim and squash", "color": "#06c4ff", "detail": "#ecfcff on a #101010 outline" },
      "Crawler": { "role": "Tier 1", "color": "#ff6b6b" },
      "Evolved crawler": { "role": "Tier 2 · 6 letters", "color": "#d984ff" },
      "Button hunter": { "role": "Tier 3 · 12 letters", "color": "#8573ee" }
    }
  },
  "cartridge": {
    "label": "03 / DOM DEFENSE",
    "name": "Swarm Protocol",
    "tagline": "Protect every last byte.",
    "cover": "bug icon on the violet label art panel",
    "face": "#8573ee",
    "variant": "standard (one action: PRESS START)",
    "shadow-angle": "inherits the hub: 45deg down-right"
  }
}
```

## What differs from the parent

- **Accent: violet** (`accent-violet`, `#8573ee`). Light-theme text uses `#5f48ba`. The hover
  signal is mint `#74dfa1`. Contrast: `#8573ee` on the dark background 5.26:1; `#5f48ba` on the
  light background 6.27:1; button ink `#171022` on the accent face 5.01:1.
- **Palette:** cyan cursor, then the crew in order of growth: coral crawler, lilac evolved
  crawler, violet hunter, and a mint score.
- **Characters:** the hub keeps "Swarm's original coral / lilac / violet crew, in both themes"
  (`style.css:1775-1785`). The player is a cyan crosshair (`reticle`), not a pixel character.
- **Icon style:** the bug is a line drawing adapted from Lucide (ISC licence, kept in
  `Icon.astro`), drawn with aligned pixels and connected limbs on the hub
  (`style.css:1856-1861`). It is the one character icon that is not crisp pixel art.
- **Gameplay tag and number:** `04 / DOM DEFENSE` in the rulebook. The shelf cartridge reads
  `03 / DOM DEFENSE` today.
- **Cartridge:** standard cartridge, bug icon on the label.
- **Buttons as health bars** (in the game layer, locked): "The first bite fades the button to mint
  green. Yellow starts at 75% health, then coral red at 35%." (`game.json:46`).

## Open questions

1. **Number:** the shelf says 03, the rulebook roster says 04.
2. **Line icon vs pixels:** the parent rule is "Line for UI. Pixels for play." Swarm's bug is a
   line-icon derivative. Keep as Swarm's signature, or redraw in pixels later (not in Phase 2)?
