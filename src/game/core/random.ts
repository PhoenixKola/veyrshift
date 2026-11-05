// Seeded PRNG. NEVER use Math.random for gameplay decisions; seeds are reproducible.
export class SeededRandom {
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0 || 1; }
  next(): number {
    let x = this.state;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 4294967296;
  }
  range(min: number, max: number): number { return min + this.next() * (max - min); }
  int(min: number, max: number): number { return Math.floor(this.range(min, max + 1)); }
  pick<T>(values: readonly T[]): T { if (values.length === 0) throw new Error('Cannot choose an empty collection'); return values[this.int(0, values.length-1)]; }
  getState(): number { return this.state; }
}
export function stableRunSeed(): number { return Date.now() >>> 0; }
