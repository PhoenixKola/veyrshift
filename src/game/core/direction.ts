import type { Vec2 } from './types.js';

/** Four authored cardinal views. World y increases toward the camera. */
export type FacingDirection = 'front' | 'right' | 'back' | 'left';
export const FACING_DIRECTIONS: readonly FacingDirection[] = ['front', 'right', 'back', 'left'];

/** Select the nearest authored cardinal view for combat aim. */
export function facingFromVector(vector: Vec2): FacingDirection {
  if (Math.abs(vector.x) > Math.abs(vector.y)) return vector.x >= 0 ? 'right' : 'left';
  return vector.y >= 0 ? 'front' : 'back';
}

/** Travel presentation favors a side profile at 45 degrees and keeps its view
 * through small input/velocity changes. Only four body views are authored. */
export function movementFacingFromVector(vector: Vec2, previous: FacingDirection): FacingDirection {
  const x = Math.abs(vector.x), y = Math.abs(vector.y);
  if (x < .001 && y < .001) return previous;
  if (x < .001) return vector.y >= 0 ? 'front' : 'back';
  if (y < .001) return vector.x >= 0 ? 'right' : 'left';
  const lateral = vector.x >= 0 ? 'right' : 'left';
  const vertical = vector.y >= 0 ? 'front' : 'back';
  // Hysteresis prevents the run sheet flickering at the diagonal boundary.
  if (previous === lateral && x >= y * .62) return lateral;
  if (previous === vertical && x <= y * .82) return vertical;
  return x >= y * .72 ? lateral : vertical;
}

/** Quantize combat aim with the same diagonal presentation bias as travel. */
export function facingFromAngle(angle: number): FacingDirection {
  return movementFacingFromVector({ x: Math.cos(angle), y: Math.sin(angle) }, 'front');
}
