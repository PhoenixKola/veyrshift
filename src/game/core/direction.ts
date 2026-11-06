import type { Vec2 } from './types.js';

/** Four authored cardinal views. World y increases toward the camera. */
export type FacingDirection = 'front' | 'right' | 'back' | 'left';
export const FACING_DIRECTIONS: readonly FacingDirection[] = ['front', 'right', 'back', 'left'];

/** Select the dominant movement axis; vertical wins exact diagonal ties. */
export function facingFromVector(vector: Vec2): FacingDirection {
  if (Math.abs(vector.x) > Math.abs(vector.y)) return vector.x >= 0 ? 'right' : 'left';
  return vector.y >= 0 ? 'front' : 'back';
}

/** Map continuous combat aim to the nearest authored view. */
export function facingFromAngle(angle: number): FacingDirection {
  return facingFromVector({ x: Math.cos(angle), y: Math.sin(angle) });
}
