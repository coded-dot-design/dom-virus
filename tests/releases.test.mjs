// site/releases.json's shape and the tag reader behind it. That it lists every released tag (from the
// network) is checked by `npm run site:test:releases` (CI only: hourly Pages builds follow new tags
// and must not fail on one before `npm run sync:releases` runs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BOARD, FIRST, catalogFrom, parseTags } from "../scripts/releases-catalog.mjs";

const catalog = JSON.parse(readFileSync(new URL("../site/releases.json", import.meta.url), "utf8"));
const pins = JSON.parse(readFileSync(new URL("../games.json", import.meta.url), "utf8"));

test("parseTags keeps the commit behind an annotated tag; catalogFrom sorts newest first from the first tag", () => {
  const tags = parseTags(
    [
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\trefs/tags/v1.0.0",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\trefs/tags/v1.0.0^{}",
      "cccccccccccccccccccccccccccccccccccccccc\trefs/tags/v0.9.0",
      "dddddddddddddddddddddddddddddddddddddddd\trefs/tags/v0.10.0",
      "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee\trefs/tags/engine-baseline",
      "ffffffffffffffffffffffffffffffffffffffff\trefs/tags/v0.1.0",
    ].join("\n"),
  );
  assert.equal(tags.get("v1.0.0"), "b".repeat(40));
  assert.equal(tags.has("engine-baseline"), false);
  assert.deepEqual(
    catalogFrom(tags, "v0.9.0").map((r) => r.version),
    ["v1.0.0", "v0.10.0", "v0.9.0"],
  );
});

test("every game is in the catalog, and each served pin is one of its releases", () => {
  assert.deepEqual(Object.keys(catalog).sort(), Object.keys({ ...FIRST, ...BOARD }).sort());
  for (const [name, pin] of Object.entries(pins))
    assert.ok(
      catalog[name].some((r) => r.version === pin),
      `${name} ${pin} (games.json) is not in site/releases.json`,
    );
  for (const releases of Object.values(catalog))
    for (const { version, commit } of releases) {
      assert.match(version, /^v\d+\.\d+\.\d+$/);
      assert.match(commit, /^[a-f0-9]{40}$/);
    }
});
