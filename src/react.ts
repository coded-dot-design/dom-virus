import { useEffect } from "react";
import type { GameController, GameOptions, GameStats } from "./contracts.js";

export interface GameComponentProps<S extends GameStats = GameStats> {
  active?: boolean;
  options?: GameOptions<S>;
}

/** Memoize options. Each effect owns and recalls exactly the instance it starts. */
export function createGameComponent<S extends GameStats>(
  create: (options?: GameOptions<S>) => GameController<S>,
): (props: GameComponentProps<S>) => null {
  return function GameComponent({ active = true, options }) {
    useEffect(() => {
      if (!active) return;
      const game = create(options);
      game.start();
      return () => game.destroy();
    }, [active, options]);
    return null;
  };
}
