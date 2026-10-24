import { useEffect } from "react";
import type { GameController, GameOptions, GameStats } from "./contracts.js";

export interface GameComponentProps<
  S extends GameStats = GameStats,
  O extends GameOptions<S> = GameOptions<S>,
> {
  active?: boolean;
  options?: O;
}

/** Memoize options. Each effect owns and recalls exactly the instance it starts. */
export function createGameComponent<
  S extends GameStats,
  O extends GameOptions<S> = GameOptions<S>,
>(
  create: (options?: O) => GameController<S>,
): (props: GameComponentProps<S, O>) => null {
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
