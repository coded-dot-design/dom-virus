import test from "node:test";
import assert from "node:assert/strict";
import { segmentHit, SpatialGrid, seededRandom } from "../src/math.js";
import { MutationLedger } from "../src/ledger.js";
test("a fast projectile cannot tunnel through a thin glyph", () => {
  assert.equal(
    segmentHit(
      { x: 0, y: 5 },
      { x: 100, y: 5 },
      { left: 30, right: 31, top: 0, bottom: 10 },
    ),
    0.3,
  );
});
test("parallel and reversed sweeps reject misses and preserve first contact", () => {
  const r = { left: 10, right: 20, top: 10, bottom: 20 };
  assert.equal(segmentHit({ x: 0, y: 5 }, { x: 50, y: 5 }, r), null);
  assert.equal(segmentHit({ x: 30, y: 15 }, { x: 0, y: 15 }, r), 1 / 3);
  assert.equal(segmentHit({ x: 15, y: 15 }, { x: 15, y: 15 }, r), 0);
});
test("spatial query deduplicates targets crossing cell boundaries", () => {
  const grid = new SpatialGrid(10),
    a = { id: 1 },
    b = { id: 2 };
  grid.insert(a, { left: 5, right: 25, top: 0, bottom: 20 });
  grid.insert(b, { left: 80, right: 90, top: 80, bottom: 90 });
  assert.deepEqual(grid.query({ left: 0, right: 30, top: 0, bottom: 20 }), [a]);
});
test("a seeded run is reproducible", () => {
  const a = seededRandom(42),
    b = seededRandom(42);
  assert.deepEqual(
    Array.from({ length: 30 }, a),
    Array.from({ length: 30 }, b),
  );
});
test("Recall restores owned text but preserves a newer host edit", () => {
  const ledger = new MutationLedger(),
    a = { nodeValue: "original" },
    b = { nodeValue: "second" };
  ledger.writeText(a, "0");
  ledger.writeText(b, "1");
  b.nodeValue = "host update";
  assert.equal(ledger.writeText(b, "0"), false);
  ledger.restore();
  assert.equal(a.nodeValue, "original");
  assert.equal(b.nodeValue, "host update");
});
