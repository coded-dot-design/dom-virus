import type {
  Board,
  BoardOptions,
  Glyph,
  TextRecord,
  BoardTarget,
  Point,
  Bounds,
  Rect,
} from "./contracts.js";
import { TargetEffects } from "./target-effects.js";
import { ElementAttachments } from "./attachments.js";
import { MutationLedger } from "./ledger.js";
import { SpatialGrid, inside, segmentHit } from "./math.js";

export const PROTECTED =
  'form,input,textarea,select,option,button,[contenteditable],script,style,noscript,pre,code,[aria-live],dialog,[role="dialog"],[data-virus-ignore],[data-dom-virus-root],[data-dom-virus-effect],[data-swarm-ui]';
let sequence = 0;
export function createBoard(doc: Document, options: BoardOptions = {}): Board {
  const view = doc.defaultView;
  if (!view) throw new Error("DOM Virus requires a live browser document.");
  const win = view;
  const selectedRoot =
    typeof options.root === "string"
      ? doc.querySelector(options.root)
      : options.root || doc.body;
  if (!selectedRoot?.querySelectorAll)
    throw new Error("DOM Virus: root must be an existing element.");
  const root = selectedRoot;
  const textSelector =
    options.textSelector ??
    "[data-virus-text],h1,h2,h3,h4,h5,h6,p,li,blockquote";
  const targetSelector =
    options.targetSelector ??
    '[data-virus-target],button,[role="button"],a.button,a.btn';
  const exclude = options.excludeSelector
    ? `${PROTECTED},${options.excludeSelector}`
    : PROTECTED;
  // Validate selectors before creating any owned DOM.
  root.querySelectorAll(textSelector);
  root.querySelectorAll(targetSelector);
  root.matches(exclude);
  const effects =
    options.targetEffects === "liquid" ? new TargetEffects(win) : null;
  const ledger = new MutationLedger(),
    grid = new SpatialGrid<Glyph>();
  const attachments = new ElementAttachments(doc, (el, property, value, priority) => ledger.writeStyle(el, property, value, priority));
  const records = new Map<Text, TextRecord>(),
    targetRecords = new Map<HTMLElement | SVGElement, BoardTarget>();
  if (options.domMode && options.domMode !== "text")
    throw new Error(
      "DOM Virus mutates real text. Remove the old visual mode option.",
    );
  const opacity = Math.max(0, Math.min(1, options.binaryOpacity ?? 1));
  const requestedColor = options.binaryColor ?? '#f4457a';
  const binaryColor = /^#[a-f\d]{6}$/i.test(requestedColor) ? requestedColor : '#f4457a';
  const name = `dom-virus-${++sequence}`;
  // Optional styling of the actual mutated text, never a canvas replacement.
  const highlight =
    win.CSS?.highlights && win.Highlight
      ? new win.Highlight()
      : null;
  let style: HTMLStyleElement | null = null;
  let dirty = true,
    scanDirty = true,
    lastScan = -Infinity,
    lastMeasure = -Infinity,
    destroyed = false;
  let glyphs: Glyph[] = [];
  let visibleGlyphs: Glyph[] = [];
  let targets: BoardTarget[] = [];
  let measurements = 0,
    spentCount = 0;
  const measureRange = doc.createRange();
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const protectedTarget =
    'form,input,textarea,select,[contenteditable],[aria-live],dialog,[role="dialog"],[data-virus-ignore],[data-dom-virus-root],[data-dom-virus-effect],[data-swarm-ui]';
  const allowedTarget = (el: Element): el is HTMLElement | SVGElement =>
    (el instanceof win.HTMLElement || el instanceof win.SVGElement) &&
    !el.closest(
      options.excludeSelector
        ? `${protectedTarget},${options.excludeSelector}`
        : protectedTarget,
    );
  const visible = (r: Rect) =>
    r.width > 0 &&
    r.height > 0 &&
    r.right > 0 &&
    r.bottom > 0 &&
    r.left < win.innerWidth &&
    r.top < win.innerHeight;
  const clearRecord = (r: TextRecord) => {
    for (const g of r.glyphs) {
      if (g.range) highlight?.delete(g.range);
      if (g.spent) spentCount--;
    }
    records.delete(r.node);
  };
  function scan() {
    scanDirty = false;
    for (const [node, r] of records)
      if (
        !node.isConnected ||
        !root.contains(node) ||
        node.nodeValue !== r.latest
      )
        clearRecord(r);
    const seen = new Set<Text>();
    let count = 0,
      visited = 0;
    const elements = [
      ...(root.matches(textSelector) ? [root] : []),
      ...root.querySelectorAll(textSelector),
    ].slice(0, 160);
    for (const el of elements) {
      if (el.closest(exclude)) continue;
      const walker = doc.createTreeWalker(el, 4);
      let candidate: Node | null;
      while (
        (candidate = walker.nextNode()) &&
        visited++ < 6000 &&
        count < 8000
      ) {
        const node = candidate as Text; // TreeWalker is restricted to SHOW_TEXT.
        if (
          seen.has(node) ||
          node.parentElement?.closest(exclude) ||
          node.parentElement?.closest("a")
        )
          continue;
        seen.add(node);
        let r = records.get(node);
        if (!r) {
          r = {
            node,
            latest: node.data,
            original: node.data,
            glyphs: [],
          };
          for (const part of segmenter.segment(r.original))
            if (
              /\p{L}|\p{N}/u.test(part.segment) &&
              count + r.glyphs.length < 8000
            ) {
              r.glyphs.push({
                record: r,
                offset: part.index,
                length: part.segment.length,
                char: part.segment,
                spent: false,
                rect: null,
                range: null,
                bit: "0",
              });
            }
          records.set(node, r);
        }
        count += r.glyphs.length;
      }
    }
    for (const r of records.values()) if (!seen.has(r.node)) clearRecord(r);
    // Fair interleaving: a long heading or paragraph cannot monopolize the cache.
    const rows = [...records.values()].map((r) => r.glyphs);
    glyphs = [];
    for (let i = 0; rows.some((row) => i < row.length); i += 8)
      for (const row of rows) glyphs.push(...row.slice(i, i + 8));
    const candidates = [
      ...(root.matches(targetSelector) ? [root] : []),
      ...root.querySelectorAll(targetSelector),
    ]
      .filter(allowedTarget)
      .slice(0, 32);
    targets = candidates.map((el, i) => {
      if (!targetRecords.has(el))
        targetRecords.set(el, {
          element: el,
          id: el.id || `gate-${i}`,
          label: (el.textContent ?? "").trim().slice(0, 32),
          health: 100,
          maxHealth: 100,
          rect: null,
          visible: false,
        });
      return targetRecords.get(el)!;
    });
    for (const el of targetRecords.keys())
      if (!candidates.includes(el)) targetRecords.delete(el);
    effects?.sync(targets);
  }
  function measure(now: number, force = false) {
    if (destroyed) return;
    if (scanDirty && (force || now - lastScan > 0.5)) {
      scan();
      lastScan = now;
      dirty = true;
    }
    if (!force && now - lastMeasure < (dirty ? 0.08 : 0.5)) return;
    lastMeasure = now;
    dirty = false;
    measurements = 0;
    visibleGlyphs = [];
    grid.clear();
    const clipCache = new Map<Element, Bounds>();
    function clipped(rect: Rect, element: Element): Rect {
      let clip = clipCache.get(element);
      if (!clip) {
        clip = {
          left: 0,
          top: 0,
          right: win.innerWidth,
          bottom: win.innerHeight,
        };
        for (
          let parent = element.parentElement;
          parent && parent !== doc.documentElement;
          parent = parent.parentElement
        ) {
          const css = win.getComputedStyle(parent);
          const cx = /(auto|scroll|hidden|clip)/.test(css.overflowX),
            cy = /(auto|scroll|hidden|clip)/.test(css.overflowY);
          if (cx || cy) {
            const r = parent.getBoundingClientRect();
            if (cx) {
              clip.left = Math.max(clip.left, r.left);
              clip.right = Math.min(clip.right, r.right);
            }
            if (cy) {
              clip.top = Math.max(clip.top, r.top);
              clip.bottom = Math.min(clip.bottom, r.bottom);
            }
          }
        }
        clipCache.set(element, clip);
      }
      const left = Math.max(rect.left, clip.left),
        right = Math.min(rect.right, clip.right),
        top = Math.max(rect.top, clip.top),
        bottom = Math.min(rect.bottom, clip.bottom);
      return {
        left,
        right,
        top,
        bottom,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      };
    }
    const parents = new Map<Element, boolean>();
    for (const g of glyphs) {
      g.rect = null;
      if (g.spent) continue;
      const r = g.record,
        el = r.node.parentElement;
      if (!el || r.node.nodeValue !== r.latest || !el.isConnected) continue;
      if (!parents.has(el)) {
        const box = el.getBoundingClientRect();
        const css = win.getComputedStyle(el);
        parents.set(
          el,
          visible(box) &&
            css.visibility !== "hidden" &&
            css.display !== "none" &&
            css.opacity !== "0",
        );
      }
      if (!parents.get(el) || measurements >= 900) continue;
      const range = measureRange;
      try {
        range.setStart(r.node, g.offset);
        range.setEnd(r.node, g.offset + g.length);
        const rect = clipped(range.getBoundingClientRect(), el);
        measurements++;
        if (visible(rect)) {
          g.rect = rect;
          visibleGlyphs.push(g);
          if (!g.spent) grid.insert(g, rect);
        }
      } catch {
        scanDirty = true;
      }
    }
    for (const target of targets) {
      target.rect = clipped(
        target.element.getBoundingClientRect(),
        target.element,
      );
      const css = win.getComputedStyle(target.element);
      target.visible =
        visible(target.rect) &&
        css.visibility !== "hidden" &&
        css.display !== "none" &&
        css.opacity !== "0";
    }
  }
  function consume(
    g: Glyph | null | undefined,
    effect: "binary" | "erase" = "binary",
  ) {
    if (
      destroyed ||
      !g ||
      g.spent ||
      !g.record.node.isConnected ||
      g.record.node.nodeValue !== g.record.latest
    )
      return false;
    g.bit = Math.random() < 0.5 ? "0" : "1";
    g.effect = effect;
    const r = g.record,
      value = effect === "binary" ? g.bit : "\u00a0";
    const next =
      r.latest.slice(0, g.offset) + value + r.latest.slice(g.offset + g.length);
    if (!ledger.writeText(r.node, next)) return false;
    const delta = value.length - g.length;
    for (const other of r.glyphs)
      if (other.offset > g.offset) other.offset += delta;
    g.length = value.length;
    r.latest = next;
    g.spent = true;
    spentCount++;
    dirty = true;
    if (highlight) {
      if (!style) {
        style = doc.createElement("style");
        style.dataset.virusIgnore = "";
        style.textContent = `::highlight(${name}){color:color-mix(in srgb,${binaryColor} ${opacity*100}%,transparent);background-color:transparent}`;
        (doc.head || doc.documentElement).append(style);
        win.CSS.highlights.set(name, highlight);
      }
      g.range = doc.createRange();
      highlight.add(g.range);
      // A Text.nodeValue write resets live Range offsets in this node.
      // Restore all owned ranges after each write, including shorter graphemes.
      for (const spent of r.glyphs)
        if (spent.spent && spent.range) {
          spent.range.setStart(r.node, spent.offset);
          spent.range.setEnd(r.node, spent.offset + spent.length);
        }
    }
    return true;
  }
  function hitSegment(a: Point, b: Point) {
    const candidates = grid.query({
      left: Math.min(a.x, b.x) - 2,
      right: Math.max(a.x, b.x) + 2,
      top: Math.min(a.y, b.y) - 2,
      bottom: Math.max(a.y, b.y) + 2,
    });
    let result: Glyph | null = null;
    let best = Infinity;
    for (const g of candidates)
      if (!g.spent && g.rect) {
        const t = segmentHit(a, b, g.rect, 2);
        if (t !== null && t < best) {
          best = t;
          result = g;
        }
      }
    return result ? { glyph: result, t: best } : null;
  }
  function near(x: number, y: number, radius = 14) {
    return grid
      .query({
        left: x - radius,
        right: x + radius,
        top: y - radius,
        bottom: y + radius,
      })
      .filter((g) => !g.spent && g.rect && inside(g.rect, x, y, radius));
  }
  function damage(target: BoardTarget, amount: number, impact?: Point) {
    if (destroyed || !target.element.isConnected || target.health <= 0)
      return false;
    target.health = Math.max(0, target.health - amount);
    if (effects) effects.hit(target, impact);
    else
      ledger.writeStyle(
        target.element,
        "opacity",
        String(0.3 + (0.7 * target.health) / target.maxHealth),
      );
    return true;
  }
  function resetTargets(health = 100) {
    if (destroyed) return;
    for (const t of targets) {
      t.health = t.maxHealth = health;
      if (!effects) ledger.writeStyle(t.element, "opacity", "1");
    }
  }
  function draw(ctx: CanvasRenderingContext2D, time = 0, reduced = false) {
    if (!destroyed) effects?.draw(ctx, targets, time, reduced);
  }
  const invalidate = () => {
    dirty = true;
  };
  doc.addEventListener("scroll", invalidate, { capture: true, passive: true });
  win.addEventListener("resize", invalidate);
  const observer = new win.MutationObserver((changes) => {
    const external = changes.some((c) => {
      const element =
        c.target instanceof win.Element ? c.target : c.target.parentElement;
      if (element?.closest("[data-dom-virus-root],[data-dom-virus-effect]"))
        return false;
      if (
        c.type === "childList" &&
        [...c.addedNodes, ...c.removedNodes].every(
          (n) =>
            n instanceof win.Element && n.hasAttribute("data-dom-virus-effect"),
        )
      )
        return false;
      if (
        c.type === "characterData" &&
        records.get(c.target as Text)?.latest === c.target.nodeValue
      )
        return false;
      if (
        c.type === "attributes" &&
        c.attributeName === "style" &&
        (c.target instanceof win.HTMLElement ||
          c.target instanceof win.SVGElement)
      ) {
        const target = targetRecords.get(c.target);
        if (
          (target && effects?.ownsStyleMutation(target)) ||
          ledger.ownsStyleMutation(c.target)
        )
          return false;
      }
      return true;
    });
    if (external) {
      dirty = true;
      scanDirty = true;
    }
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "style", "hidden"],
  });
  const resize = win.ResizeObserver ? new win.ResizeObserver(invalidate) : null;
  resize?.observe(root);
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    observer.disconnect();
    resize?.disconnect();
    doc.removeEventListener("scroll", invalidate, true);
    win.removeEventListener("resize", invalidate);
    if (win.CSS?.highlights?.get(name) === highlight)
      win.CSS.highlights.delete(name);
    style?.remove();
    effects?.destroy();
    attachments.clear();
    ledger.restore();
    records.clear();
    targetRecords.clear();
    glyphs = [];
    visibleGlyphs = [];
    targets = [];
    grid.clear();
  }
  return {
    attach: (element: Element) => destroyed ? null : attachments.attach(element),
    measure,
    consume,
    hitSegment,
    near,
    damage,
    resetTargets,
    draw,
    destroy,
    invalidate,
    setActive(active: boolean) {
      effects?.setActive(active);
    },
    get targets() {
      return targets;
    },
    get glyphs() {
      return visibleGlyphs;
    },
    get stats() {
      return {
        indexed: glyphs.length,
        visible: visibleGlyphs.length,
        spent: spentCount,
        measurements,
      };
    },
  };
}
