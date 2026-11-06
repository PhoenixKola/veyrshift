import { cardinalFromTravel, facingFromAngle, movementFacingFromVector } from '../core/direction.js';
import type { FacingDirection, TravelDirection } from '../core/direction.js';
import { KAIRO_BASE_ABILITIES, KAIRO_COMBO_HITS } from '../data/kairoAbilities.js';
import { formById } from '../data/kairoForms.js';
import type { AbilityId, Hero, KairoFormId, LocomotionState } from '../core/types.js';

export type AnimationAtlas = 'idle'|'run'|'dodge'|'combo'|'states'|'locomotionTransitions'|'bolt'|'shockwave'|'guardParry'|'finisher';
export type HeroAnimationState = 'idle'|'start'|'run'|'stop'|'dodge'|'combo'|'bolt'|'shockwave'|'finisher'|'guard'|'parry'|'hurt'|'ko'|'ember';
export interface ResolvedAnimation {
  state: HeroAnimationState;
  atlas: AnimationAtlas;
  direction: TravelDirection;
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

const directionRows: Record<TravelDirection, number> = { front: 0, right: 1, back: 2, left: 3,
  northeast: 4, northwest: 5, southeast: 6, southwest: 7 };
const cardinalAngle: Record<FacingDirection, number> = { right: 0, front: Math.PI/2, left: Math.PI, back: -Math.PI/2 };
const cardinal = (angle: number) => facingFromAngle(angle);

/** Legacy form special/finisher fallback outside Ember's new right-facing action sheets. */
export function formAbilityComboFrame(formId: Exclude<KairoFormId, 'base'>, ability: 'shockwave'|'finisher', phase: number): number {
  const chain = ability === 'finisher' ? 2 : formId === 'glass-current' ? 1 : 2;
  return chain * 4 + Math.max(0, Math.min(3, Math.floor(phase)));
}

function comboFrame(hero: Hero): number {
  const hit = KAIRO_COMBO_HITS[Math.max(0, Math.min(2, hero.combo - 1))];
  const t = hero.attackAnimTime;
  const newRightArt = hero.attackFacing === 'right' && (hero.attackFormId === 'base' || hero.attackFormId === 'ember-drive');
  const formHitOne = !newRightArt && hero.attackFormId !== 'base' && hero.combo === 1;
  const baseHitTwo = !newRightArt && hero.attackFormId === 'base' && hero.combo === 2;
  // Legacy atlas columns differ: Ember hit one and base hit two land in column 1.
  // Keep contact artwork on screen through the simulation's active hit window.
  const contact = formHitOne || baseHitTwo ? 1 : 2;
  if (t < hit.timing.windup * .52) return 0;
  if (t < hit.timing.windup) return contact === 1 ? 0 : 1;
  if (t < hit.timing.windup + hit.timing.active) return contact;
  const recovery = t - hit.timing.windup - hit.timing.active;
  return recovery < hit.timing.recovery * .44 ? Math.min(3, contact + 1) : 3;
}

function actionFrame(hero: Hero, id: AbilityId): number {
  if (id === 'bolt') {
    const timing=KAIRO_BASE_ABILITIES.bolt.timing,t=hero.abilityAnimTime;
    if(t<timing.windup*.5)return 0;
    if(t<timing.windup)return 1;
    return t<timing.windup+timing.active?2:3;
  }
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
  let direction: TravelDirection;
  let frame = 0;
  let frameCount = 1;
  let loop = false;

  if (hero.ko) { state = 'ko'; atlas = 'states'; direction = hero.hurtFacing; frame = 3; }
  else if (hero.hurtTime > 0) { state = 'hurt'; atlas = 'states'; direction = hero.hurtFacing; frame = 2; }
  else if (hero.transformVisualTime > 0) { state = 'ember'; atlas = 'states'; direction = cardinal(hero.face); frame = hero.transformVisualTime / hero.transformVisualDuration > .5 ? 0 : 1; }
  else if (hero.dashTime > 0) {
    state = 'dodge'; atlas = 'dodge'; direction = movementFacingFromVector({ x: hero.vx, y: hero.vy }, cardinalFromTravel(hero.moveFacing));
    frame = Math.min(3, Math.floor(Math.max(0, 1 - hero.dashTime / hero.dashDuration) * 4)); frameCount = 4;
  } else if (hero.attackTime > 0) {
    state = 'combo'; atlas = 'combo'; direction = hero.attackFacing;
    frame = (Math.max(1, Math.min(3, hero.combo)) - 1) * 4 + comboFrame(hero); frameCount = 12;
  } else if (hero.currentAbility === 'bolt' && hero.abilityAnimTime < hero.abilityAnimDuration) {
    state = 'bolt'; atlas = 'bolt'; direction = cardinal(hero.actionAngle); frame = actionFrame(hero, 'bolt'); frameCount = 4;
  } else if (hero.currentAbility === 'shockwave') {
    const authoredRight = hero.abilityFormId === 'ember-drive' && hero.attackFacing === 'right';
    state = 'shockwave'; atlas = hero.abilityFormId === 'base' || authoredRight ? 'shockwave' : 'combo'; direction = hero.attackFacing;
    const phase = actionFrame(hero, 'shockwave');
    frame = hero.abilityFormId === 'glass-current' || hero.abilityFormId === 'ember-drive' && !authoredRight ? formAbilityComboFrame(hero.abilityFormId, 'shockwave', phase) : phase; frameCount = atlas === 'combo' ? 12 : 4;
  } else if (hero.currentAbility === 'finisher') {
    const authoredRight = hero.abilityFormId === 'ember-drive' && hero.attackFacing === 'right';
    state = 'finisher'; atlas = hero.abilityFormId === 'glass-current' || hero.abilityFormId === 'ember-drive' && !authoredRight ? 'combo' : 'finisher'; direction = hero.attackFacing;
    const phase = actionFrame(hero, 'finisher');
    frame = atlas === 'combo' ? formAbilityComboFrame(hero.abilityFormId as Exclude<KairoFormId,'base'>, 'finisher', phase) : phase; frameCount = atlas === 'combo' ? 12 : 4;
  } else if (hero.transformed && hero.formId !== 'base' && hero.parryVisualTime > 0) {
    state = 'parry'; atlas = 'guardParry'; direction = cardinal(hero.face); frame = 2; frameCount = 4;
  } else if (hero.guardTime > 0) {
    const formGuard = hero.transformed && hero.formId !== 'base';
    state = formGuard ? 'guard' : hero.parryWindow > 0 ? 'parry' : 'guard'; atlas = 'guardParry'; direction = cardinal(hero.face);
    frame = formGuard ? hero.guardTime < .06 ? 0 : hero.parryWindow > 0 ? 1 : 3 : state === 'parry' ? 0 : 1; frameCount = 4;
  } else if (hero.locomotion === 'start' || hero.locomotion === 'stop') {
    state = hero.locomotion; atlas = 'locomotionTransitions'; direction = cardinalFromTravel(hero.moveFacing);
    frame = locomotionFrame(hero.locomotion, hero.locomotionTime); frameCount = 4;
  } else if (Math.hypot(hero.vx, hero.vy) > 70) {
    state = 'run'; atlas = 'run'; direction = hero.transformed && hero.formId === 'glass-current' ? cardinalFromTravel(hero.moveFacing) : hero.moveFacing;
    const stepSpeed = hero.transformed ? formById(hero.formId)?.combat.moveSpeed ?? 277 : 277;
    frame = Math.floor(hero.step / (stepSpeed * .07)) % 4; frameCount = 4; loop = true;
  } else {
    state = 'idle'; atlas = 'idle'; direction = hero.transformed && hero.formId === 'glass-current' ? cardinalFromTravel(hero.moveFacing) : hero.moveFacing;
    frame = Math.floor(clock / .16) % 4; frameCount = 4; loop = true;
  }

  // Movement poses use velocity direction; attacks hold the same quantized angle as their hit arc.
  if (state === 'bolt' || state === 'combo' || state === 'shockwave' || state === 'finisher') direction = state === 'bolt' ? cardinal(hero.actionAngle) : hero.attackFacing;
  return { state, atlas, direction, directionRow: directionRows[direction], frame, frameCount, loop, mirrorX: false };
}

export function facingDirectionIndex(direction: FacingDirection): number { return directionRows[direction]; }
export function cardinalFacingAngle(direction: FacingDirection): number { return cardinalAngle[direction]; }
