import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

// site-kit/lifecycle.mjs decides per build target; load it fresh under each target's env.
const load = (env) =>
  JSON.parse(
    execFileSync(process.execPath, ["--input-type=module", "-e", `
      const l = await import("./site-kit/lifecycle.mjs");
      const page = [{ heading: "Hero" }, { type: "prose", body: ["Six games are playable. DOM Kaiju is coming soon.", "Kaiju climbs."] },
        { type: "featureList", items: [{ title: "07 DOM Kaiju", link: { href: "/games/kaiju/" } }, { title: "Coming next", link: { href: "/news/coming-next" } }, { title: "Swarm", body: "Bugs.", link: { href: "/games/swarm-protocol/" } }] },
        { type: "statStrip", items: [{ value: "1", label: "game coming soon: DOM Kaiju" }, { value: "6", label: "games released" }] }];
      console.log(JSON.stringify({ target: l.TARGET, games: l.HIDDEN_GAMES, pages: l.HIDDEN_PAGES, routes: l.HIDDEN_ROUTES, kaiju: l.gameShown("kaiju"), swarm: l.gameShown("swarm-protocol"), page: l.scrub(page) }));
    `], { env: { ...process.env, SITE_URL: "", SITE_BASE: "", ...env }, encoding: "utf8" }),
  );

test("production hides an unready game, its posts and every mention", () => {
  const p = load({ SITE_URL: "https://domvirus.com", SITE_BASE: "/" });
  assert.equal(p.target, "production");
  assert.deepEqual(p.games, ["kaiju"], "Kaiju's model status is idea");
  assert.equal(p.kaiju, false);
  assert.equal(p.swarm, true);
  assert.ok(p.pages.includes("news-coming-next"), "a post whose model relations name Kaiju");
  assert.ok(p.routes.includes("games/kaiju/") && p.routes.includes("news/coming-next/"));
  assert.deepEqual(p.page, [
    { heading: "Hero" },
    { type: "prose", body: ["Six games are playable."] },
    { type: "featureList", items: [{ title: "Swarm", body: "Bugs.", link: { href: "/games/swarm-protocol/" } }] },
    { type: "statStrip", items: [{ value: "6", label: "games released" }] },
  ]);
});

test("staging shows everything and serves the unready routes as pages", () => {
  const s = load({});
  assert.equal(s.target, "staging");
  assert.deepEqual([s.games, s.pages, s.routes], [[], [], []]);
  assert.equal(s.kaiju, true);
  assert.equal(s.page[1].body[0], "Six games are playable. DOM Kaiju is coming soon.", "copy unchanged");
});
