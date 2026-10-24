import { EntityPool } from "./entities.js";
import type { Point } from "./contracts.js";
export type SupplyKind = "repair" | "charge" | "scrap";
interface Supply extends Point {
  kind: SupplyKind;
  targetY: number;
  life: number;
}
/** Small shared airdrops; the game chooses placement and the collected reward. */
export class SupplyDrops {
  private readonly pool = new EntityPool<Supply>(6, () => ({
    x: 0,
    y: 0,
    targetY: 0,
    life: 0,
    kind: "repair",
  }));
  get size() {
    return this.pool.size;
  }
  reset() {
    this.pool.clear();
  }
  spawn(point: Point, kind: SupplyKind) {
    const item = this.pool.acquire();
    if (!item) return false;
    Object.assign(item, {
      x: point.x,
      y: point.y - 60,
      targetY: point.y,
      kind,
      life: 14,
    });
    return true;
  }
  update(dt: number, player: Point, collect: (kind: SupplyKind) => void) {
    const items = this.pool.active;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i]!;
      item.life -= dt;
      item.y = Math.min(item.targetY, item.y + 90 * dt);
      if (
        item.y >= item.targetY &&
        Math.hypot(player.x - item.x, player.y - item.y) < 24
      ) {
        const kind = item.kind;
        this.pool.releaseAt(i);
        collect(kind);
      } else if (item.life <= 0) this.pool.releaseAt(i);
    }
  }
  scroll(dx: number, dy: number) {
    for (const item of this.pool.active) {
      item.x -= dx;
      item.y -= dy;
      item.targetY -= dy;
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.lineWidth = 2;
    for (const item of this.pool.active) {
      const { x, y, kind } = item;
      ctx.strokeStyle =
        kind === "repair"
          ? "#a6ef91"
          : kind === "charge"
            ? "#76e2ff"
            : "#f9bf62";
      ctx.fillStyle = "#14232c";
      ctx.fillRect(x - 10, y - 9, 20, 18);
      ctx.strokeRect(x - 10, y - 9, 20, 18);
      ctx.fillStyle = ctx.strokeStyle;
      if (kind === "repair") {
        ctx.fillRect(x - 2, y - 6, 4, 12);
        ctx.fillRect(x - 6, y - 2, 12, 4);
      } else if (kind === "charge") {
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 7);
        ctx.lineTo(x - 5, y + 1);
        ctx.lineTo(x, y + 1);
        ctx.lineTo(x - 2, y + 7);
        ctx.lineTo(x + 5, y - 1);
        ctx.lineTo(x, y - 1);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(x - 6, y - 5, 5, 4);
        ctx.fillRect(x + 1, y - 1, 5, 4);
        ctx.fillRect(x - 6, y + 3, 5, 4);
      }
      if (y < item.targetY) {
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 9);
        ctx.lineTo(x - 15, y - 24);
        ctx.lineTo(x, y - 30);
        ctx.lineTo(x + 15, y - 24);
        ctx.lineTo(x + 10, y - 9);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
