import { createArcade, EntityPool } from "../src/index.js";
import type { GameDefinition, GameOptions, GameStats } from "../src/index.js";
interface Stats extends GameStats {
  score: number;
  combo: number;
}
const definition: GameDefinition<Stats> = {
  id: "type-test",
  title: "Typed game",
  color: "#fff",
  hint: "Test",
  capabilities: { fire: true },
  create(context) {
    // @ts-expect-error Game-owned DOM targets require a typed target, not an ID.
    context.board.damage("gate-1", 10);
    // @ts-expect-error Player movement requires an angle as well as position.
    context.move({ x: 0, y: 0 }, 0.016);
    return {
      reset() {},
      update() {},
      draw() {},
      snapshot: () => ({ score: 0, combo: 1 }),
    };
  },
};
const game = createArcade(definition, {
  onState(state) {
    const combo: number | undefined = state.combo;
    void combo;
    // @ts-expect-error Game-specific snapshots preserve their numeric fields.
    const wrong: string = state.combo;
    void wrong;
  },
});
game.destroy();
// @ts-expect-error Selectors must be strings.
const badConfig: GameOptions = { targetSelector: 42 };
// @ts-expect-error Themes are a closed union.
const badTheme: GameOptions = { theme: "neon" };
void badConfig;
void badTheme;
const pool = new EntityPool(2, () => ({ x: 0, y: 0 }));
// @ts-expect-error Consumers cannot grow a pool beyond its capacity.
pool.active.push({ x: 1, y: 1 });
