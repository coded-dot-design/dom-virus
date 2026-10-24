import test from "node:test";
import assert from "node:assert/strict";
import { createMobileSelectionLock } from "../src/selection-lock.ts";
const { createMobileSelectionLock: independentCopy } = await import(
  "../src/selection-lock.ts?independent-copy"
);
function fixture(mobile = true, editable = false) {
  const nodes = new Set();
  let cleared = 0;
  const selection = {
    anchorNode: {
      nodeType: 3,
      parentElement: { closest: () => (editable ? {} : null) },
    },
    removeAllRanges() {
      cleared++;
    },
  };
  const doc = {
    head: { append: (node) => nodes.add(node) },
    createElement: () => {
      const node = {
        dataset: {},
        textContent: "",
        remove: () => nodes.delete(node),
      };
      return node;
    },
    getSelection: () => selection,
    defaultView: { matchMedia: () => ({ matches: mobile }) },
  };
  return { doc, nodes, cleared: () => cleared };
}
test("independent game bundles share one selection lease until the final owner releases it", () => {
  const { doc, nodes } = fixture();
  const first = createMobileSelectionLock(doc),
    second = independentCopy(doc);
  first.setActive(true);
  first.setActive(true);
  second.setActive(true);
  assert.equal(nodes.size, 1);
  first.setActive(false);
  assert.equal(nodes.size, 1);
  first.setActive(false);
  assert.equal(nodes.size, 1);
  second.setActive(false);
  assert.equal(nodes.size, 0);
  first.setActive(true);
  assert.equal(nodes.size, 1);
  first.setActive(false);
  assert.equal(nodes.size, 0);
});
test("launch clears ordinary mobile selections but preserves editable and desktop selections", () => {
  for (const [mobile, editable, expected] of [
    [true, false, 1],
    [true, true, 0],
    [false, false, 0],
  ]) {
    const f = fixture(mobile, editable),
      lock = createMobileSelectionLock(f.doc);
    lock.setActive(true);
    assert.equal(f.cleared(), expected);
    lock.setActive(false);
    assert.equal(f.nodes.size, 0);
  }
});
