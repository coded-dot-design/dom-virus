import test from "node:test";
import assert from "node:assert/strict";
import { SupplyDrops } from "../src/supplies.ts";
test("airdrops are bounded, expire and reuse slots", () => {
  const drops = new SupplyDrops();
  for (let i = 0; i < 20; i++) drops.spawn({ x: 100, y: 200 }, "repair");
  assert.equal(drops.size, 6);
  drops.update(15, { x: 1000, y: 1000 }, () => assert.fail("Out of reach"));
  assert.equal(drops.size, 0);
  assert.equal(drops.spawn({ x: 100, y: 200 }, "scrap"), true);
  drops.reset();
  assert.equal(drops.size, 0);
});
test("scrolling preserves landing position and each supply is collected once", () => {
  const drops = new SupplyDrops(),
    found = [];
  drops.spawn({ x: 100, y: 200 }, "charge");
  drops.scroll(20, 50);
  drops.update(0.2, { x: 80, y: 150 }, (kind) => found.push(kind));
  assert.equal(found.length, 0);
  drops.update(0.5, { x: 80, y: 150 }, (kind) => found.push(kind));
  drops.update(0.5, { x: 80, y: 150 }, (kind) => found.push(kind));
  assert.deepEqual(found, ["charge"]);
});
