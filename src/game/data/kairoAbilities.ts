import type { AbilityId, KeyAction } from '../core/types.js';

export type AbilityTiming = { windup: number; active: number; recovery: number; cancelAt: number };
export type ComboHitDefinition = {
  damage: number;
  timing: AbilityTiming;
  range: number;
  arcRadians: number;
  targetCap: number;
  knockback: number;
  stagger: number;
  pulseOnHit: number;
  vfx: 'strike-one'|'strike-two'|'strike-three';
  sfx: 'punch-one'|'punch-two'|'punch-three';
};
export type AbilityDefinition = {
  id: AbilityId;
  name: string;
  role: string;
  description: string;
  accessibilityLabel: string;
  input: { keyboardMouse: string; gamepad: string; action: KeyAction };
  timing: AbilityTiming;
  cooldown: number;
  pulseCost: number;
  pulseOnHit: number;
  range: number;
  arcRadians: number;
  targetCap: number;
  damage: number;
  knockback: number;
  stagger: number;
  animation: string;
  vfx: string[];
  sfx: { event: string; bus: 'combat'|'ui'; maxVoices: number }[];
  icon: string;
  iconFrame: number;
  iconColumns: number;
  iconDirectionRow: number;
};

const noDamage = { range: 0, arcRadians: 0, targetCap: 0, damage: 0, knockback: 0, stagger: 0, pulseOnHit: 0 };

export const KAIRO_COMBO_HITS: readonly ComboHitDefinition[] = [
  { damage: 14, timing: { windup: .065, active: .055, recovery: .19, cancelAt: .065 }, range: 86, arcRadians: .84, targetCap: 2, knockback: 118, stagger: .2, pulseOnHit: 7, vfx: 'strike-one', sfx: 'punch-one' },
  { damage: 19, timing: { windup: .09, active: .065, recovery: .2, cancelAt: .09 }, range: 92, arcRadians: .88, targetCap: 2, knockback: 154, stagger: .25, pulseOnHit: 8, vfx: 'strike-two', sfx: 'punch-two' },
  { damage: 31, timing: { windup: .135, active: .085, recovery: .3, cancelAt: .135 }, range: 108, arcRadians: 1.16, targetCap: 3, knockback: 292, stagger: .48, pulseOnHit: 10, vfx: 'strike-three', sfx: 'punch-three' },
];

/** Base-form combat is authored here so simulation, HUD and audio share one contract. */
export const KAIRO_BASE_ABILITIES: Readonly<Record<AbilityId, AbilityDefinition>> = {
  combo: {
    id: 'combo', name: 'Kinetic String', role: 'Three-press close-range chain',
    description: 'Tap again during recovery to queue the next distinct strike. Hit three is a launching cuff blow.',
    accessibilityLabel: 'Kinetic String, one strike per press, three-hit maximum',
    input: { keyboardMouse: 'LMB / J / Space', gamepad: 'A / Cross', action: 'attack' },
    timing: { windup: KAIRO_COMBO_HITS[0].timing.windup, active: KAIRO_COMBO_HITS[0].timing.active, recovery: KAIRO_COMBO_HITS[0].timing.recovery, cancelAt: 0 },
    cooldown: 0, pulseCost: 0, ...noDamage, animation: 'combo',
    vfx: ['strike-one', 'strike-two', 'strike-three'],
    sfx: [{ event: 'punch-one', bus: 'combat', maxVoices: 3 }, { event: 'punch-two', bus: 'combat', maxVoices: 3 }, { event: 'punch-three', bus: 'combat', maxVoices: 2 }],
    icon: '/assets/characters/kairo/b04/combo.webp', iconFrame: 6, iconColumns: 12, iconDirectionRow: 1,
  },
  bolt: {
    id: 'bolt', name: 'Kinetic Bolt', role: 'Deliberate short-range projectile',
    description: 'Fire one fast, piercing kinetic shard. Each press launches at most one bolt.',
    accessibilityLabel: 'Kinetic Bolt, fires one aimed projectile',
    input: { keyboardMouse: 'RMB / K', gamepad: 'RB / R1', action: 'bolt' },
    timing: { windup: .105, active: .055, recovery: .24, cancelAt: .16 }, cooldown: .52, pulseCost: 0,
    pulseOnHit: 5, range: 620, arcRadians: .28, targetCap: 1, damage: 24, knockback: 165, stagger: .24,
    animation: 'bolt', vfx: ['bolt-cast', 'bolt-flight', 'bolt-impact', 'bolt-dissipate'],
    sfx: [{ event: 'bolt-cast', bus: 'combat', maxVoices: 2 }, { event: 'bolt-hit', bus: 'combat', maxVoices: 3 }],
    icon: '/assets/characters/kairo/b04/bolt-cast.webp', iconFrame: 2, iconColumns: 4, iconDirectionRow: 1,
  },
  shockwave: {
    id: 'shockwave', name: 'Resonance Shockwave', role: 'Radial crowd control',
    description: 'Drive a low circular pulse through nearby foes. Pushback creates room without spending Pulse.',
    accessibilityLabel: 'Resonance Shockwave, radial pushback attack',
    input: { keyboardMouse: 'Q', gamepad: 'X / Square', action: 'shockwave' },
    timing: { windup: .22, active: .09, recovery: .39, cancelAt: .22 }, cooldown: 4.8, pulseCost: 0,
    pulseOnHit: 6, range: 172, arcRadians: Math.PI * 2, targetCap: 8, damage: 24, knockback: 238, stagger: .44,
    animation: 'shockwave', vfx: ['shockwave-ground', 'shockwave-contact'],
    sfx: [{ event: 'shockwave-charge', bus: 'combat', maxVoices: 1 }, { event: 'shockwave-release', bus: 'combat', maxVoices: 1 }],
    icon: '/assets/characters/kairo/b04/shockwave.webp', iconFrame: 2, iconColumns: 4, iconDirectionRow: 0,
  },
  guard: {
    id: 'guard', name: 'Counterguard', role: 'Hold to block; release a timed perfect parry',
    description: 'Hold to reduce incoming damage. The first 220 ms deflects a hit and restores Pulse.',
    accessibilityLabel: 'Counterguard, hold to block and parry during the opening window',
    input: { keyboardMouse: 'Hold E', gamepad: 'Hold LB / L1', action: 'guard' },
    timing: { windup: 0, active: .22, recovery: 0, cancelAt: 0 }, cooldown: 0, pulseCost: 0,
    ...noDamage, animation: 'guard-parry', vfx: ['guard-sheen', 'parry-deflect'],
    sfx: [{ event: 'guard-block', bus: 'combat', maxVoices: 2 }, { event: 'parry', bus: 'combat', maxVoices: 1 }],
    icon: '/assets/characters/kairo/b04/guard-parry.webp', iconFrame: 1, iconColumns: 4, iconDirectionRow: 1,
  },
  dodge: {
    id: 'dodge', name: 'Slipstream', role: 'Directional evasive dash',
    description: 'Dash along movement or aim. The opening 260 ms are invulnerable; the recovery is vulnerable.',
    accessibilityLabel: 'Slipstream dodge, directional dash with a short invulnerable window',
    input: { keyboardMouse: 'Shift', gamepad: 'B / Circle', action: 'dash' },
    timing: { windup: .025, active: .19, recovery: .16, cancelAt: 0 }, cooldown: .88, pulseCost: 0,
    ...noDamage, animation: 'dodge', vfx: ['dodge-afterimage', 'dodge-land'],
    sfx: [{ event: 'dodge-start', bus: 'combat', maxVoices: 2 }, { event: 'dodge-land', bus: 'combat', maxVoices: 2 }],
    icon: '/assets/characters/kairo/b03/dodge.png', iconFrame: 2, iconColumns: 4, iconDirectionRow: 1,
  },
  finisher: {
    id: 'finisher', name: 'Threadbreak', role: 'Pulse-consuming forward finisher',
    description: 'Spend 75 Pulse on a fast step-through crossing-cuff strike that can hit up to three foes.',
    accessibilityLabel: 'Threadbreak finisher, costs 75 Pulse',
    input: { keyboardMouse: 'F', gamepad: 'LT / L2', action: 'finisher' },
    timing: { windup: .27, active: .1, recovery: .43, cancelAt: .27 }, cooldown: 10, pulseCost: 75,
    pulseOnHit: 0, range: 244, arcRadians: 1.22, targetCap: 3, damage: 72, knockback: 360, stagger: .6,
    animation: 'finisher', vfx: ['finisher-charge', 'finisher-impact', 'finisher-fade'],
    sfx: [{ event: 'finisher-build', bus: 'combat', maxVoices: 1 }, { event: 'finisher-hit', bus: 'combat', maxVoices: 1 }, { event: 'finisher-fade', bus: 'combat', maxVoices: 1 }],
    icon: '/assets/characters/kairo/b04/finisher.webp', iconFrame: 2, iconColumns: 4, iconDirectionRow: 1,
  },
  emberPreview: {
    id: 'emberPreview', name: 'Ember Drive', role: 'Experimental form preview',
    description: 'A short presentation and damage-modifier prototype. It is not a completed alternate moveset.',
    accessibilityLabel: 'Ember Drive experimental form preview, costs 40 Pulse',
    input: { keyboardMouse: 'R', gamepad: 'RT / R2', action: 'transform' },
    timing: { windup: .72, active: 8, recovery: 0, cancelAt: .72 }, cooldown: 11, pulseCost: 40,
    ...noDamage, animation: 'ember', vfx: ['ember-preview'],
    sfx: [{ event: 'ember-start', bus: 'combat', maxVoices: 1 }, { event: 'ember-end', bus: 'combat', maxVoices: 1 }],
    icon: '/assets/characters/kairo/b03/states.png', iconFrame: 0, iconColumns: 4, iconDirectionRow: 1,
  },
};

export const PULSE_TUNING = {
  parry: 18,
  killBonus: 9,
  max: 100,
  finisherCost: KAIRO_BASE_ABILITIES.finisher.pulseCost,
  emberPreviewCost: KAIRO_BASE_ABILITIES.emberPreview.pulseCost,
} as const;

export const COMBAT_TUNING_NOTES = {
  targetWispTimeToKillSeconds: 1.5,
  targetStrikerTimeToKillSeconds: 2.6,
  targetSentinelTimeToKillSeconds: 4.5,
  measurement: 'Design estimates for the current prototype enemies; not calibrated human playtest results.',
  pulse: 'Combo contacts +7/+8/+10; bolt contact +5; shockwave contact +6; parry +18; kill +9; finisher costs 75; Ember preview costs 40.',
} as const;
