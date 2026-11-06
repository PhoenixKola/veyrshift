import type { Vec2 } from './types.js';

/** Four authored cardinal views. World y increases toward the camera. */
export type FacingDirection = 'front' | 'right' | 'back' | 'left';
export type TravelDirection = FacingDirection | 'northeast' | 'northwest' | 'southeast' | 'southwest';
export const FACING_DIRECTIONS: readonly FacingDirection[] = ['front', 'right', 'back', 'left'];

/** Select the nearest authored cardinal view for combat aim. */
export function facingFromVector(vector: Vec2): FacingDirection {
  if (Math.abs(vector.x) > Math.abs(vector.y)) return vector.x >= 0 ? 'right' : 'left';
  return vector.y >= 0 ? 'front' : 'back';
}

/** Legacy four-way view selection for older attack, dodge, and transition sheets. */
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

const TRAVEL_ANGLES: readonly [TravelDirection, number][] = [
  ['right', 0], ['southeast', Math.PI / 4], ['front', Math.PI / 2],
  ['southwest', 3 * Math.PI / 4], ['left', Math.PI], ['northwest', -3 * Math.PI / 4],
  ['back', -Math.PI / 2], ['northeast', -Math.PI / 4],
];
const angularDistance = (a: number, b: number): number => Math.abs(Math.atan2(Math.sin(a-b), Math.cos(a-b)));

/** Eight travel atlas rows for base and Ember. A small angular dead band
 * retains the current row during analogue wobble or movement easing. */
export function travelFacingFromVector(vector: Vec2, previous: TravelDirection): TravelDirection {
  if (Math.hypot(vector.x, vector.y) < .001) return previous;
  const angle = Math.atan2(vector.y, vector.x);
  const previousAngle = TRAVEL_ANGLES.find(([name]) => name === previous)?.[1] ?? 0;
  if (angularDistance(angle, previousAngle) < Math.PI / 8 + .09) return previous;
  return TRAVEL_ANGLES.reduce((best, candidate) =>
    angularDistance(angle, candidate[1]) < angularDistance(angle, best[1]) ? candidate : best)[0];
}

export function cardinalFromTravel(direction: TravelDirection): FacingDirection {
  if (direction === 'northeast' || direction === 'southeast') return 'right';
  if (direction === 'northwest' || direction === 'southwest') return 'left';
  return direction;
}
