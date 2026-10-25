import test from "node:test";
import assert from "node:assert/strict";
import { createStickKeys } from "../src/touch-controls.ts";

const at = (deg, m = 1) => [
  Math.cos((deg * Math.PI) / 180) * m,
  Math.sin((deg * Math.PI) / 180) * m,
];

test("8-way stick maps sectors to arrow keys with a deadzone", () => {
  const stick = createStickKeys("8way");
  assert.equal(stick.update(...at(0, 0.2)), false);
  assert.deepEqual(stick.keys, []);
  assert.equal(stick.update(...at(0, 0.5)), true);
  assert.deepEqual(stick.keys, ["ArrowRight"]);
  stick.update(...at(45));
  assert.deepEqual([...stick.keys].sort(), ["ArrowDown", "ArrowRight"]);
  stick.update(...at(-90));
  assert.deepEqual(stick.keys, ["ArrowUp"]);
  stick.update(...at(-135));
  assert.deepEqual([...stick.keys].sort(), ["ArrowLeft", "ArrowUp"]);
  stick.update(...at(180));
  assert.deepEqual(stick.keys, ["ArrowLeft"]);
  stick.update(0, 0);
  assert.deepEqual(stick.keys, []);
});

test("8-way stick holds its sector near a border (no diagonal flicker)", () => {
  const stick = createStickKeys("8way");
  stick.update(...at(20));
  assert.deepEqual(stick.keys, ["ArrowRight"]);
  // 25° is nearer the diagonal, but within the hysteresis band of Right.
  assert.equal(stick.update(...at(25)), false);
  assert.equal(stick.update(...at(20)), false);
  stick.update(...at(35));
  assert.deepEqual([...stick.keys].sort(), ["ArrowDown", "ArrowRight"]);
  assert.equal(stick.update(...at(20)), false, "diagonal held back to 20°");
  stick.update(...at(10));
  assert.deepEqual(stick.keys, ["ArrowRight"]);
});

test("deadzone release has hysteresis", () => {
  const stick = createStickKeys("8way");
  stick.update(...at(90, 0.3));
  assert.deepEqual(stick.keys, ["ArrowDown"]);
  assert.equal(stick.update(...at(90, 0.25)), false);
  stick.update(...at(90, 0.15));
  assert.deepEqual(stick.keys, []);
  assert.equal(stick.update(...at(90, 0.25)), false, "re-entry needs the full deadzone");
});

test("4-way stick picks the dominant axis and resists switching at 45°", () => {
  const stick = createStickKeys("4way");
  stick.update(...at(30));
  assert.deepEqual(stick.keys, ["ArrowRight"]);
  assert.equal(stick.update(...at(50)), false);
  stick.update(...at(70));
  assert.deepEqual(stick.keys, ["ArrowDown"]);
  stick.update(...at(-100));
  assert.deepEqual(stick.keys, ["ArrowUp"]);
  stick.update(...at(170));
  assert.deepEqual(stick.keys, ["ArrowLeft"]);
  stick.reset();
  assert.deepEqual(stick.keys, []);
});
