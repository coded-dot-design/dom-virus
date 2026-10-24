import test from "node:test";
import assert from "node:assert/strict";
import { WaveDirector } from "../src/waves.ts";
test("waves announce attacks, wait for survivors, and provide a build interval", () => {
  const w = new WaveDirector();
  assert.equal(w.update(4, 0), "start");
  assert.equal(w.remaining, 10);
  for (let i = 0; i < 10; i++) w.spawned();
  assert.equal(w.update(0.1, 1), undefined);
  assert.equal(w.update(0.1, 0), "clear");
  assert.equal(w.phase, "rebuild");
  w.update(7, 0);
  assert.equal(w.wave, 1);
  assert.equal(w.update(1, 0), "start");
  assert.equal(w.wave, 2);
});
test("long sessions respect simultaneous and per-wave caps; reset clears progression", () => {
  const w = new WaveDirector(32);
  for (let n = 0; n < 150; n++) {
    w.update(8, 0);
    assert.ok(w.limit <= 32);
    assert.ok(w.remaining <= 40);
    while (w.remaining) w.spawned();
    w.update(0.1, 0);
  }
  w.reset();
  assert.equal(w.wave, 1);
  assert.equal(w.phase, "prepare");
  assert.equal(w.ready, false);
});
