import type { Vec2 } from './types.js';
export const clamp = (value: number, low: number, high: number): number => Math.max(low, Math.min(high, value));
export const distance = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);
export const normalize = (v: Vec2): Vec2 => { const d = Math.hypot(v.x, v.y); return d > 0.00001 ? { x: v.x / d, y: v.y / d } : { x: 0, y: 0 }; };
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export function circleOverlaps(a: Vec2, ar: number, b: Vec2, br: number): boolean { return distance(a, b) <= ar + br; }
export function inArc(origin: Vec2, facing: number, target: Vec2, reach: number, arc: number): boolean {
  const dx = target.x - origin.x, dy = target.y - origin.y;
  const d = Math.hypot(dx, dy);
  if (d > reach || d < 0.00001) return false;
  return Math.cos(Math.atan2(dy, dx) - facing) >= Math.cos(arc * 0.5);
}
