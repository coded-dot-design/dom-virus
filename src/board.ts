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
import { MutationLedger } from "./ledger.js";
import { SpatialGrid, inside, segmentHit } from "./math.js";

export const PROTECTED =
  'form,input,textarea,select,option,button,[contenteditable],script,style,noscript,pre,code,[aria-live],dialog,[role="dialog"],[data-virus-ignore],[data-dom-virus-root],[data-swarm-ui]';
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
  const records = new Map<Text, TextRecord>(),
    targetRecords = new Map<HTMLElement | SVGElement, BoardTarget>();
  const visual = options.domMode !== "text";
  const canHighlight = Boolean(win.CSS?.highlights && win.Highlight);
  if (visual && !canHighlight)
    throw new Error(
      'Visual text effects need CSS Highlights. Use domMode: "text" only on opted-in static content.',
    );
  const name = `dom-virus-${++sequence}`;
  const highlight = visual ? new win.Highlight() : null;
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
  const binaryCanvas = doc.createElement("canvas"),
    binaryContext = binaryCanvas.getContext("2d");
  if (!binaryContext) throw new Error("Canvas 2D is unavailable.");
  const binaryCtx = binaryContext;
  let binaryDirty = true;
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const protectedTarget =
    'form,input,textarea,select,[contenteditable],[aria-live],dialog,[role="dialog"],[data-virus-ignore],[data-dom-virus-root],[data-swarm-ui]';
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
    binaryDirty = true;
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
    binaryDirty = true;
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
    const typography = new Map<Element, NonNullable<Glyph["typography"]>>();
    for (const g of glyphs) {
      g.rect = null;
      const r = g.record,
        el = r.node.parentElement;
      if (!el || r.node.nodeValue !== r.latest || !el.isConnected) continue;
      if (!parents.has(el)) {
        const box = el.getBoundingClientRect();
        const css = win.getComputedStyle(el);
        if (options.binaryStyle === "native") {
          const font = `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
          binaryCtx.font = font;
          const metrics = binaryCtx.measureText("01");
          typography.set(el, {
            font,
            color: css.color,
            ascent: metrics.fontBoundingBoxAscent,
            descent: metrics.fontBoundingBoxDescent,
          });
        }
        parents.set(
          el,
          visible(box) &&
            css.visibility !== "hidden" &&
            css.display !== "none" &&
            css.opacity !== "0",
        );
      }
      if (!parents.get(el) || measurements >= 900) continue;
      const face = typography.get(el);
      if (face) g.typography = face;
      const range = g.range || doc.createRange();
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
      !g ||
      g.spent ||
      !g.record.node.isConnected ||
      g.record.node.nodeValue !== g.record.latest
    )
      return false;
    g.bit = Math.random() < 0.5 ? "0" : "1";
    g.effect = effect;
    if (visual && highlight) {
      if (!style) {
        style = doc.createElement("style");
        style.dataset.virusIgnore = "";
        style.textContent = `::highlight(${name}){color:transparent;text-shadow:none}`;
        (doc.head || doc.documentElement).append(style);
        win.CSS.highlights.set(name, highlight);
      }
      const range = doc.createRange();
      range.setStart(g.record.node, g.offset);
      range.setEnd(g.record.node, g.offset + g.length);
      g.range = range;
      highlight.add(range);
    } else {
      const r = g.record,
        value = effect === "binary" ? g.bit : "\u00a0";
      const next =
        r.latest.slice(0, g.offset) +
        value +
        r.latest.slice(g.offset + g.length);
      if (!ledger.writeText(r.node, next)) return false;
      const delta = value.length - g.length;
      for (const other of r.glyphs)
        if (other.offset > g.offset) other.offset += delta;
      g.length = value.length;
      r.latest = next;
      dirty = true;
    }
    g.spent = true;
    spentCount++;
    binaryDirty = true;
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
    if (!target.element.isConnected || target.health <= 0) return false;
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
    for (const t of targets) {
      t.health = t.maxHealth = health;
      if (!effects) ledger.writeStyle(t.element, "opacity", "1");
    }
  }
  function draw(ctx: CanvasRenderingContext2D, time = 0, reduced = false) {
    effects?.draw(ctx, targets, time, reduced);
    if (!visual) return;
    if (!binaryDirty) {
      ctx.drawImage(binaryCanvas, 0, 0, win.innerWidth, win.innerHeight);
      return;
    }
    binaryDirty = false;
    const dpr = Math.min(win.devicePixelRatio || 1, 1.5);
    binaryCanvas.width = Math.round(win.innerWidth * dpr);
    binaryCanvas.height = Math.round(win.innerHeight * dpr);
    binaryCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const output = ctx;
    ctx = binaryCtx;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, options.binaryOpacity ?? 1));
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const g of visibleGlyphs)
      if (g.spent && g.effect === "binary" && g.rect) {
        const r = g.rect;
        if (options.binaryStyle === "native" && g.typography) {
          const face = g.typography;
          ctx.save();
          ctx.font = face.font;
          ctx.fillStyle = face.color;
          ctx.textBaseline = "alphabetic";
          ctx.beginPath();
          ctx.rect(r.left, r.top, r.width, r.height);
          ctx.clip();
          ctx.fillText(
            g.bit,
            (r.left + r.right) / 2,
            (r.top + r.bottom + face.ascent - face.descent) / 2,
            r.width,
          );
          ctx.restore();
          continue;
        }
        ctx.font = `${Math.min(22, Math.max(10, r.height * 0.72))}px monospace`;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#081012";
        ctx.fillStyle = "#63e6d4";
        ctx.strokeText(g.bit, (r.left + r.right) / 2, (r.top + r.bottom) / 2);
        ctx.fillText(g.bit, (r.left + r.right) / 2, (r.top + r.bottom) / 2);
      }
    ctx.restore();
    output.drawImage(binaryCanvas, 0, 0, win.innerWidth, win.innerHeight);
  }
  const invalidate = () => {
    dirty = true;
  };
  doc.addEventListener("scroll", invalidate, { capture: true, passive: true });
  win.addEventListener("resize", invalidate);
  const observer = new win.MutationObserver((changes) => {
    if (
      changes.some(
        (c) =>
          !c.target.parentElement?.closest("[data-dom-virus-root]") &&
          !(
            c.target instanceof win.Element &&
            c.target.closest("[data-dom-virus-root]")
          ),
      )
    ) {
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
    ledger.restore();
    effects?.destroy();
    records.clear();
    targetRecords.clear();
    glyphs = [];
    visibleGlyphs = [];
    targets = [];
    grid.clear();
  }
  return {
    measure,
    consume,
    hitSegment,
    near,
    damage,
    resetTargets,
    draw,
    destroy,
    invalidate,
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
