# Arcade implementation study

Reviewed October 23, 2026. These are design and performance references; the new game code, characters, and page interaction layer are original. No source or assets were copied from the reference games.

- [Dave Kerr's Space Invaders](https://github.com/dwmkerr/spaceinvaders), especially `js/spaceinvaders.js`: a compact example of separate update/draw game states, wave settings, keyboard state, and simple projectile collisions. We use a similar separation of concerns. Its older interval scheduler is not used; our runtime owns one requestAnimationFrame chain and bounds elapsed time.
- [Chregi / platzhersh's Pacman Canvas](https://github.com/platzhersh/pacman-canvas), especially `pacman-canvas.js`: examined normal/frightened ghost speeds, directional movement, and temporary vulnerable states. Byte Runner uses original free-page movement and gate-driven spawning instead of importing that game's maze, artwork, code, or licensed assets.
- [MDN — Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas): cache repeated drawing, avoid expensive shadows, limit state work, and use requestAnimationFrame. The binary glyph layer is cached; procedural characters avoid asset downloads and shadowBlur.
- [MDN — 2D collision detection](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection): separate broad-phase candidate selection from exact collision checks. Our glyph grid limits candidates; swept segment/box intersections prevent projectile tunneling.
- [MDN — Anatomy of a video game](https://developer.mozilla.org/en-US/docs/Games/Anatomy): input, update, and render have explicit responsibilities. The runtime owns scheduling; games implement a small simulation contract.
- [MDN — CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API): style text ranges without replacing document structure. This supports visual letter consumption while leaving host framework text ownership intact.

The existing Swarm Protocol game remains MIT-licensed and is consumed through its own adapter. Its existing third-party notices remain with that project. This repository's new runtime uses no third-party runtime dependency.
