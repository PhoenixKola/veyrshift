import { facingFromAngle, facingFromVector } from '../core/direction.js';
import type { FacingDirection } from '../core/direction.js';
import type { Hero } from '../core/types.js';

export type AnimationAtlas = 'idle' | 'run' | 'dodge' | 'combo' | 'states';
export type HeroAnimationState = 'idle' | 'run' | 'dodge' | 'combo' | 'guard' | 'parry' | 'hurt' | 'ko' | 'ember';
export interface ResolvedAnimation {
  state: HeroAnimationState;
  atlas: AnimationAtlas;
  direction: FacingDirection;
  directionRow: number;
  frame: number;
  frameCount: number;
  loop: boolean;
  mirrorX: false;
}
export type AtlasSource = 'b03' | 'b02' | 'vector';
export function resolveAtlasSource(generatedReady: boolean, legacyReady: boolean): AtlasSource {
  return generatedReady ? 'b03' : legacyReady ? 'b02' : 'vector';
}

const directionRows: Record<FacingDirection, number> = { front: 0, right: 1, back: 2, left: 3 };

function comboPhase(hero: Hero): number {
  const t = hero.attackAnimTime;
  const startup = Math.max(0.01, hero.attackStartup);
  if (t < startup * .6) return 0;
  if (t < startup) return 1;
  if (t < startup + .075) return 2;
  return 3;
}

export function resolveHeroAnimation(hero: Hero, clock: number): ResolvedAnimation {
  let state: HeroAnimationState;
  let atlas: AnimationAtlas;
  let direction: FacingDirection;
  let frame = 0;
  let frameCount = 1;
  let loop = false;

  if (hero.ko) {
    state = 'ko'; atlas = 'states'; direction = hero.hurtFacing; frame = 3;
  } else if (hero.hurtTime > 0) {
    state = 'hurt'; atlas = 'states'; direction = hero.hurtFacing; frame = 2;
  } else if (hero.transformVisualTime > 0) {
    state = 'ember'; atlas = 'states'; direction = facingFromAngle(hero.face);
    frame = hero.transformVisualTime / hero.transformVisualDuration > .5 ? 0 : 1;
  } else if (hero.dashTime > 0) {
    state = 'dodge'; atlas = 'dodge';
    direction = facingFromVector({ x: hero.vx, y: hero.vy });
    const progress = 1 - hero.dashTime / .19;
    frame = Math.min(3, Math.floor(Math.max(0, progress) * 4)); frameCount = 4;
  } else if (hero.attackTime > 0) {
    state = 'combo'; atlas = 'combo'; direction = facingFromAngle(hero.face);
    frame = (Math.max(1, Math.min(3, hero.combo)) - 1) * 4 + comboPhase(hero);
    frameCount = 12;
  } else if (hero.guardTime > 0) {
    state = hero.parryWindow > 0 ? 'parry' : 'guard'; atlas = 'states'; direction = facingFromAngle(hero.face); frame = state === 'parry' ? 1 : 0;
  } else if (Math.hypot(hero.vx, hero.vy) > 70) {
    state = 'run'; atlas = 'run'; direction = hero.moveFacing;
    const strideDistance = 277 * .07;
    frame = Math.floor(hero.step / strideDistance) % 4; frameCount = 4; loop = true;
  } else {
    state = 'idle'; atlas = 'idle'; direction = hero.moveFacing;
    frame = Math.floor(clock / .16) % 4; frameCount = 4; loop = true;
  }

  return { state, atlas, direction, directionRow: directionRows[direction], frame, frameCount, loop, mirrorX: false };
}

export function facingDirectionIndex(direction: FacingDirection): number {
  return directionRows[direction];
}
