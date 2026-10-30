import test from "node:test";
import assert from "node:assert/strict";
import { checkVendor } from "../scripts/vendor-check.mjs";

test("vendor/fizlet matches its ORIGIN.json snapshot", () => {
  assert.match(checkVendor(), /files verified/);
});
