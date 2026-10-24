export type WavePhase = "prepare" | "assault" | "rebuild";
/** A DOM-independent wave clock. Games decide where and what to spawn. */
export class WaveDirector {
  wave = 1;
  phase: WavePhase = "prepare";
  remaining = 0;
  countdown = 4;
  private spawnIn = 0;
  readonly capacity: number;
  constructor(capacity = 32) {
    this.capacity = Math.max(1, Math.floor(capacity));
  }
  get limit() {
    return Math.min(this.capacity, 8 + this.wave * 4);
  }
  get ready() {
    return this.phase === "assault" && this.remaining > 0 && this.spawnIn <= 0;
  }
  reset() {
    this.wave = 1;
    this.phase = "prepare";
    this.remaining = 0;
    this.countdown = 4;
    this.spawnIn = 0;
  }
  update(dt: number, alive: number): "start" | "clear" | undefined {
    this.spawnIn -= dt;
    if (this.phase !== "assault") {
      this.countdown = Math.max(0, this.countdown - dt);
      if (this.countdown === 0) {
        if (this.phase === "rebuild") this.wave++;
        this.phase = "assault";
        this.remaining = Math.min(40, 5 + this.wave * 5);
        this.spawnIn = 0;
        return "start";
      }
    } else if (this.remaining === 0 && alive === 0) {
      this.phase = "rebuild";
      this.countdown = 8;
      return "clear";
    }
  }
  spawned() {
    this.remaining = Math.max(0, this.remaining - 1);
  }
  rest() {
    this.spawnIn = Math.max(0.7, 2.1 - this.wave * 0.12);
  }
}
