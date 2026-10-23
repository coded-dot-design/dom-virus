export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const inside = (r, x, y, pad = 0) =>
  x >= r.left - pad &&
  x <= r.right + pad &&
  y >= r.top - pad &&
  y <= r.bottom + pad;
export function segmentHit(a, b, r, padding = 0) {
  let lo = 0,
    hi = 1;
  for (const [start, delta, min, max] of [
    [a.x, b.x - a.x, r.left - padding, r.right + padding],
    [a.y, b.y - a.y, r.top - padding, r.bottom + padding],
  ]) {
    if (Math.abs(delta) < 1e-9) {
      if (start < min || start > max) return null;
      continue;
    }
    let t0 = (min - start) / delta,
      t1 = (max - start) / delta;
    if (t0 > t1) [t0, t1] = [t1, t0];
    lo = Math.max(lo, t0);
    hi = Math.min(hi, t1);
    if (lo > hi) return null;
  }
  return lo;
}
export function seededRandom(seed = 1) {
  let n = seed >>> 0;
  return () => {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    return n / 4294967296;
  };
}
export class SpatialGrid {
  constructor(size = 64) {
    this.size = size;
    this.cells = new Map();
  }
  clear() {
    this.cells.clear();
  }
  insert(item, r) {
    for (
      let x = Math.floor(r.left / this.size);
      x <= Math.floor(r.right / this.size);
      x++
    )
      for (
        let y = Math.floor(r.top / this.size);
        y <= Math.floor(r.bottom / this.size);
        y++
      ) {
        const key = `${x}:${y}`;
        if (!this.cells.has(key)) this.cells.set(key, []);
        this.cells.get(key).push(item);
      }
  }
  query(r) {
    const out = new Set();
    for (
      let x = Math.floor(r.left / this.size);
      x <= Math.floor(r.right / this.size);
      x++
    )
      for (
        let y = Math.floor(r.top / this.size);
        y <= Math.floor(r.bottom / this.size);
        y++
      )
        for (const item of this.cells.get(`${x}:${y}`) || []) out.add(item);
    return [...out];
  }
}
