import type { BoardTarget, Point } from "./contracts.js";

/** Bounded, lazily allocated entities. Removal swaps with the last active item. */
export class EntityPool<T extends object> {
  private readonly items: T[] = [];
  private readonly free: T[] = [];
  private readonly create: () => T;
  readonly capacity: number;
  constructor(capacity: number, create: () => T) {
    if (!Number.isInteger(capacity) || capacity < 1)
      throw new RangeError("Entity capacity must be a positive integer.");
    this.capacity = capacity;
    this.create = create;
  }
  get active(): readonly T[] {
    return this.items;
  }
  get size(): number {
    return this.items.length;
  }
  acquire(): T | undefined {
    if (this.items.length >= this.capacity) return undefined;
    const item = this.free.pop() ?? this.create();
    this.items.push(item);
    return item;
  }
  releaseAt(index: number): boolean {
    const item = this.items[index];
    if (item === undefined) return false;
    const last = this.items.pop();
    if (index < this.items.length && last !== undefined)
      this.items[index] = last;
    this.free.push(item);
    return true;
  }
  release(item: T): boolean {
    return this.releaseAt(this.items.indexOf(item));
  }
  clear(): void {
    // Keep storage for the next wave/restart; never grow beyond capacity.
    while (this.items.length) this.releaseAt(this.items.length - 1);
  }
}

export interface SpawnPoint extends Point {
  target: BoardTarget | undefined;
}
/** Pick a live visible factory without allocating a filtered target array. */
export function chooseSpawn(
  targets: readonly BoardTarget[],
  random: () => number,
  width: number,
  edgeY = 8,
): SpawnPoint | null {
  let available = 0;
  for (const target of targets)
    if (target.visible && target.health > 0 && target.rect) available++;
  if (!targets.length)
    return { x: random() * width, y: edgeY, target: undefined };
  if (!available) return null;
  let pick = Math.min(available - 1, Math.floor(random() * available));
  for (const target of targets) {
    if (!target.visible || target.health <= 0 || !target.rect) continue;
    if (pick-- === 0)
      return {
        x: (target.rect.left + target.rect.right) / 2,
        y: (target.rect.top + target.rect.bottom) / 2,
        target,
      };
  }
  return null;
}

export function translateEntities(
  items: readonly Point[],
  dx: number,
  dy: number,
): void {
  for (const item of items) {
    item.x -= dx;
    item.y -= dy;
  }
}
