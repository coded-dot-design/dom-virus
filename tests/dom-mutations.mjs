import assert from "node:assert/strict";
import { resolve } from "node:path";
import { gameRoot } from "../scripts/game-paths.mjs";

export async function checkDomMutations(page) {
  const result = await page.evaluate(
    async (url) => {
      const { createBoard } = await import(url);
      const root = document.createElement("div");
      root.style.cssText =
        "position:fixed;left:40px;top:40px;width:600px;background:white;color:black;z-index:100";
      root.innerHTML = '<p style="font:40px monospace">A𝕏éZ</p>';
      document.body.append(root);
      const node = root.firstChild.firstChild,
        original = node.data;
      const board = createBoard(document, { root, binaryOpacity: 0.32 });
      board.measure(0, true);
      const glyphs = [...board.glyphs];
      // Consume from both ends, including a surrogate pair and combining mark.
      const order = [glyphs[2], glyphs[0], glyphs[3], glyphs[1]];
      const writes = order.every((g) => board.consume(g));
      const allBinary = /^[01]{4}$/.test(node.data);
      const noWrappers =
        root.firstChild.childNodes.length === 1 &&
        root.firstChild.firstChild === node;
      const rangesAligned = glyphs.every((g) => g.range?.toString() === g.bit);
      board.measure(1, true);
      const once =
        board.stats.spent === 4 && glyphs.every((g) => !board.consume(g));
      board.destroy();
      const recalled = node.data === original && CSS.highlights.size === 0;
      const descriptor = Object.getOwnPropertyDescriptor(window, "Highlight");
      let noHighlightApi = false;
      try {
        Object.defineProperty(window, "Highlight", {
          value: undefined,
          configurable: true,
        });
        const plain = createBoard(document, { root, binaryOpacity: 0.32 });
        plain.measure(0, true);
        plain.consume(plain.glyphs[0]);
        noHighlightApi = /^[01]/.test(node.data);
        plain.destroy();
        noHighlightApi &&= node.data === original;
      } finally {
        if (descriptor) Object.defineProperty(window, "Highlight", descriptor);
      }
      const external = createBoard(document, { root });
      external.measure(0, true);
      external.consume(external.glyphs[0]);
      node.data = "Fresh host content";
      external.measure(1, true);
      const changed = external.consume(external.glyphs[0]);
      external.destroy();
      const hostWins = !changed && node.data === "Fresh host content";
      root.remove();
      return {
        writes,
        allBinary,
        noWrappers,
        rangesAligned,
        once,
        recalled,
        noHighlightApi,
        hostWins,
      };
    },
    "/@fs" + resolve("src/board.ts"),
  );
  for (const [key, value] of Object.entries(result))
    assert.equal(value, true, key);

  const ending = await page.evaluate(
    async (url) => {
      const { createArcade } = await import(url);
      const root = document.createElement("div");
      root.style.cssText =
        "position:fixed;left:30px;top:30px;width:600px;background:white;color:black";
      root.innerHTML = "<p>Restorable</p><button>Factory</button>";
      document.body.append(root);
      const p = root.querySelector("p"),
        node = p.firstChild,
        button = root.querySelector("button");
      const originalStyle = button.getAttribute("style");
      let wrote = false,
        owned = false;
      let resolveEnd;
      const finished = new Promise((resolve) => (resolveEnd = resolve));
      const game = createArcade(
        {
          id: "finish-probe",
          title: "Finish probe",
          color: "#fff",
          hint: "",
          create(api) {
            return {
              reset() {
                wrote = api.board.consume(api.board.glyphs[0]);
                api.board.damage(api.board.targets[0], 50);
                owned = /^[01]/.test(p.textContent);
              },
              update() {
                api.finish(false);
              },
              draw() {},
              snapshot: () => ({ score: 7 }),
            };
          },
        },
        {
          root,
          onState(s) {
            if (s.status === "gameover") resolveEnd();
          },
        },
      );
      game.start();
      await finished;
      const restored =
        p.textContent === "Restorable" &&
        p.firstChild === node &&
        button.getAttribute("style") === originalStyle;
      const retainedResult =
        game.getSnapshot().score === 7 &&
        game.getSnapshot().status === "gameover";
      game.start();
      const restarted = /^[01]/.test(p.textContent);
      game.destroy();
      const recalled = p.textContent === "Restorable";
      root.remove();
      return { wrote, owned, restored, retainedResult, restarted, recalled };
    },
    "/@fs" + resolve("src/index.ts"),
  );
  for (const [key, value] of Object.entries(ending))
    assert.equal(value, true, key);
  const games = [
    ["null-invaders", "createNullInvaders"],
    ["byte-runner", "createByteRunner"],
    ["sherman-bytes", "createShermanBytes"],
  ];
  for (const [name, factory] of games) {
    await page.evaluate(
      async ({ url, factory, runner }) => {
        const module = await import(url);
        const root = document.createElement("div");
        root.id = "mutation-proof";
        root.style.cssText =
          "position:fixed;inset:0;background:#fff;color:#000;z-index:100";
        const p = document.createElement("p");
        p.textContent = "W";
        const x = innerWidth * (runner ? 0.45 : 0.5),
          y = innerHeight * (runner ? 0.45 : 0.7);
        p.style.cssText = `position:absolute;left:${x + (runner ? 65 : -12)}px;top:${y - (runner ? 20 : 90)}px;margin:0;font:40px/1 monospace`;
        root.append(p);
        document.body.append(root);
        window.mutationProof = {
          root,
          p,
          node: p.firstChild,
          game: module[factory]({
            root,
            textSelector: "p",
            targetSelector: "[data-test-base]",
            controls: "keyboard",
            mode: "conquest",
            fortifications: false,
          }),
        };
        window.mutationProof.game.start();
      },
      {
        url: "/@fs" + resolve(gameRoot(name), "src/index.ts"),
        factory,
        runner: name === "byte-runner",
      },
    );
    const key = name === "byte-runner" ? "ArrowRight" : "Space";
    await page.keyboard.down(key);
    try {
      await page.waitForFunction(
        () =>
          /^[01]$/.test(
            document.querySelector("#mutation-proof p").textContent,
          ),
        undefined,
        { timeout: 5000 },
      );
    } finally {
      await page.keyboard.up(key);
    }
    const proof = await page.evaluate(() => {
      const { root, p, node, game } = window.mutationProof;
      const mutated = /^[01]$/.test(p.textContent),
        sameNode = p.firstChild === node;
      game.destroy();
      const restored = p.textContent === "W" && p.firstChild === node;
      root.remove();
      delete window.mutationProof;
      return { mutated, sameNode, restored };
    });
    assert.deepEqual(
      proof,
      { mutated: true, sameNode: true, restored: true },
      name,
    );
  }
  console.log(
    "Actual DOM mutation and Recall verified for all three shared-engine games.",
  );
}
