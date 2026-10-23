import test from "node:test";
import assert from "node:assert/strict";
import { EntityPool, chooseSpawn, translateEntities } from "../src/entities.ts";

test("entity storage stays bounded and reuses released objects across waves", () => {
  let allocations = 0;
  const pool = new EntityPool(3, () => ({ id: ++allocations, x: 0, y: 0 }));
  const first = pool.acquire(),
    second = pool.acquire(),
    third = pool.acquire();
  assert.equal(pool.acquire(), undefined);
  assert.equal(pool.releaseAt(1), true);
  assert.deepEqual(pool.active, [first, third]);
  assert.equal(pool.acquire(), second);
  assert.equal(pool.release({}), false);
  for (let wave = 0; wave < 200; wave++) {
    pool.clear();
    for (let i = 0; i < 3; i++) assert.ok(pool.acquire());
    assert.equal(pool.acquire(), undefined);
  }
  assert.equal(allocations, 3);
  assert.equal(new Set(pool.active).size, 3);
  translateEntities(pool.active, 10, -4);
  assert.deepEqual(
    pool.active.map(({ x, y }) => ({ x, y })),
    Array(3).fill({ x: -10, y: 4 }),
  );
});

test("spawn selection skips dead/clipped gates and uses edges only without targets", () => {
  const rect = { left: 20, top: 30, right: 60, bottom: 50 };
  const live = { id: "live", visible: true, health: 100, rect };
  const dead = { ...live, id: "dead", health: 0 };
  const clipped = { ...live, id: "clipped", visible: false };
  assert.equal(chooseSpawn([dead, live, clipped], () => 0.5, 800).target, live);
  assert.equal(
    chooseSpawn([dead, clipped], () => 0.5, 800),
    null,
  );
  assert.deepEqual(
    chooseSpawn([], () => 0.5, 800, 16),
    { x: 400, y: 16, target: undefined },
  );
  assert.deepEqual(
    chooseSpawn([live], () => 0.5, 800),
    { x: 40, y: 40, target: live },
  );
});
