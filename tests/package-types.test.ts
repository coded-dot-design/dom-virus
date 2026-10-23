import { createArcade, EntityPool } from "@coded-design/dom-virus";
import { createGameComponent } from "@coded-design/dom-virus/react";
import type { GameDefinition } from "@coded-design/dom-virus";
const definition: GameDefinition<{ score: number; energy: number }> = {
  id: "consumer", title: "Consumer", hint: "", color: "#fff",
  create: () => ({ reset() {}, update() {}, draw() {}, snapshot: () => ({ score: 0, energy: 5 }) }),
};
const factory = () => createArcade(definition);
factory().getSnapshot().energy?.toFixed();
// @ts-expect-error Generated public declarations retain custom stats.
factory().getSnapshot().energy?.toUpperCase();
createGameComponent(factory)({ active: true });
new EntityPool(2, () => ({ x: 0 })).acquire()?.x.toFixed();
