import { facingFromAngle, facingFromVector } from '../core/direction.js';
import type { FacingDirection } from '../core/direction.js';
import { KAIRO_COMBO_HITS } from '../data/kairoAbilities.js';
import { formById } from '../data/kairoForms.js';
import type { AbilityId, Hero, KairoFormId, LocomotionState } from '../core/types.js';

export type AnimationAtlas = 'idle'|'run'|'dodge'|'combo'|'states'|'locomotionTransitions'|'bolt'|'shockwave'|'guardParry'|'finisher';
export type HeroAnimationState = 'idle'|'start'|'run'|'stop'|'dodge'|'combo'|'bolt'|'shockwave'|'finisher'|'guard'|'parry'|'hurt'|'ko'|'ember';
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
export type AtlasSource = 'b03'|'b02'|'vector';
export function resolveAtlasSource(generatedReady: boolean, legacyReady: boolean): AtlasSource {
  return generatedReady ? 'b03' : legacyReady ? 'b02' : 'vector';
}

/** Select authored form animation art only when the form is active and its atlas loaded. */
export function resolveFormAnimationAtlas(formId: KairoFormId, transformed: boolean, atlasReady: boolean): Exclude<KairoFormId, 'base'> | null {
  return transformed && atlasReady && formId !== 'base' ? formId : null;
}
export const resolveFormComboAtlas = resolveFormAnimationAtlas;
export const resolveFormRunAtlas = resolveFormAnimationAtlas;

const directionRows: Record<FacingDirection, number> = { front: 0, right: 1, back: 2, left: 3 };
const cardinalAngle: Record<FacingDirection, number> = { right: 0, front: Math.PI/2, left: Math.PI, back: -Math.PI/2 };
const cardinal = (angle: number) => facingFromAngle(angle);

function comboFrame(hero: Hero): number {
  const hit = KAIRO_COMBO_HITS[Math.max(0, Math.min(2, hero.combo - 1))];
  const t = hero.attackAnimTime;
  if (t < hit.timing.windup * .42) return 0;
  if (t < hit.timing.windup) return 1;
  if (t < hit.timing.windup + hit.timing.active) return 2;
  return 3;
}

function actionFrame(hero: Hero, id: AbilityId): number {
  const definition = ({ bolt: .105, shockwave: .22, finisher: .27 } as Partial<Record<AbilityId, number>>)[id] ?? .2;
  const progress = Math.max(0, Math.min(.999, hero.abilityAnimTime / Math.max(definition, hero.abilityAnimDuration)));
  return Math.min(3, Math.floor(progress * 4));
}

function locomotionFrame(state: LocomotionState, time: number): number {
  if (state === 'start') return time > .075 ? 1 : 0;
  if (state === 'stop') return time > .08 ? 2 : 3;
  return state === 'run' ? 3 : 0;
}

export function resolveHeroAnimation(hero: Hero, clock: number): ResolvedAnimation {
  let state: HeroAnimationState;
  let atlas: AnimationAtlas;
  let direction: FacingDirection;
  let frame = 0;
  let frameCount = 1;
  let loop = false;

  if (hero.ko) { state = 'ko'; atlas = 'states'; direction = hero.hurtFacing; frame = 3; }
  else if (hero.hurtTime > 0) { state = 'hurt'; atlas = 'states'; direction = hero.hurtFacing; frame = 2; }
  else if (hero.transformVisualTime > 0) { state = 'ember'; atlas = 'states'; direction = cardinal(hero.face); frame = hero.transformVisualTime / hero.transformVisualDuration > .5 ? 0 : 1; }
  else if (hero.dashTime > 0) {
    state = 'dodge'; atlas = 'dodge'; direction = facingFromVector({ x: hero.vx, y: hero.vy });
    frame = Math.min(3, Math.floor(Math.max(0, 1 - hero.dashTime / .19) * 4)); frameCount = 4;
  } else if (hero.attackTime > 0) {
    state = 'combo'; atlas = 'combo'; direction = hero.attackFacing;
    frame = (Math.max(1, Math.min(3, hero.combo)) - 1) * 4 + comboFrame(hero); frameCount = 12;
  } else if (hero.currentAbility === 'bolt' && hero.abilityAnimTime < hero.abilityAnimDuration) {
    state = 'bolt'; atlas = 'bolt'; direction = cardinal(hero.actionAngle); frame = actionFrame(hero, 'bolt'); frameCount = 4;
  } else if (hero.currentAbility === 'shockwave') {
    state = 'shockwave'; atlas = 'shockwave'; direction = hero.attackFacing; frame = actionFrame(hero, 'shockwave'); frameCount = 4;
  } else if (hero.currentAbility === 'finisher') {
    state = 'finisher'; atlas = 'finisher'; direction = hero.attackFacing; frame = actionFrame(hero, 'finisher'); frameCount = 4;
  } else if (hero.guardTime > 0) {
    state = hero.parryWindow > 0 ? 'parry' : 'guard'; atlas = 'guardParry'; direction = cardinal(hero.face); frame = state === 'parry' ? 0 : 1; frameCount = 4;
  } else if (hero.locomotion === 'start' || hero.locomotion === 'stop') {
    state = hero.locomotion; atlas = 'locomotionTransitions'; direction = hero.moveFacing;
    frame = locomotionFrame(hero.locomotion, hero.locomotionTime); frameCount = 4;
  } else if (Math.hypot(hero.vx, hero.vy) > 70) {
    state = 'run'; atlas = 'run'; direction = hero.moveFacing;
    const stepSpeed = hero.transformed ? formById(hero.formId)?.combat.moveSpeed ?? 277 : 277;
    frame = Math.floor(hero.step / (stepSpeed * .07)) % 4; frameCount = 4; loop = true;
  } else {
    state = 'idle'; atlas = 'idle'; direction = hero.moveFacing;
    frame = Math.floor(clock / .16) % 4; frameCount = 4; loop = true;
  }

  // Movement poses use velocity direction; attacks hold the same quantized angle as their hit arc.
  if (state === 'bolt' || state === 'combo' || state === 'shockwave' || state === 'finisher') direction = state === 'bolt' ? cardinal(hero.actionAngle) : hero.attackFacing;
  return { state, atlas, direction, directionRow: directionRows[direction], frame, frameCount, loop, mirrorX: false };
}

export function facingDirectionIndex(direction: FacingDirection): number { return directionRows[direction]; }
export function cardinalFacingAngle(direction: FacingDirection): number { return cardinalAngle[direction]; }
