import type { KeyAction, KairoFormId } from '../core/types.js';

export type VisualProofForm = Extract<KairoFormId, 'ember-drive' | 'glass-current'>;
export type VisualProofCue = { at: number; action?: KeyAction; cue?: 'enemy-telegraph' };
export type PremiumShowcaseCue = {
  at: number;
  action?: KeyAction;
  movement?: { x: number; y: number };
  held?: KeyAction[];
  cue?: 'enemy-telegraph'|'reset-targets'|'top-up-pulse';
};
export type RigCutoutPose = { x: number; y: number; rotation: number };

const CUTOUT_LUNGE_KEYFRAMES: readonly { at: number; x: number; y: number; rotation: number }[] = [
  { at: 0, x: 0, y: 0, rotation: 0 },
  { at: .2, x: -5, y: -1, rotation: -.035 },
  { at: .46, x: 7, y: -7, rotation: .02 },
  { at: .68, x: 17, y: -4, rotation: .045 },
  { at: .82, x: 9, y: 0, rotation: .015 },
  { at: 1, x: 0, y: 0, rotation: 0 },
];

/** A whole-body cutout lunge with smooth code-derived in-betweens; the art itself stays unchanged. */
export function visualRigCutoutPose(elapsedSeconds: number, durationSeconds = 1.7): RigCutoutPose {
  const progress = Math.min(1, Math.max(0, elapsedSeconds / Math.max(.001, durationSeconds)));
  const nextIndex = CUTOUT_LUNGE_KEYFRAMES.findIndex(frame => frame.at >= progress);
  if (nextIndex <= 0) {
    const frame = CUTOUT_LUNGE_KEYFRAMES[0];
    return { x: frame.x, y: frame.y, rotation: frame.rotation };
  }
  const from = CUTOUT_LUNGE_KEYFRAMES[nextIndex - 1];
  const to = CUTOUT_LUNGE_KEYFRAMES[nextIndex];
  const linear = (progress - from.at) / (to.at - from.at);
  const eased = linear * linear * (3 - 2 * linear);
  return {
    x: from.x + (to.x - from.x) * eased,
    y: from.y + (to.y - from.y) * eased,
    rotation: from.rotation + (to.rotation - from.rotation) * eased,
  };
}

/** Timings hold the eight authored drawings as-is; they do not add interpolated or duplicate frames. */
export const VISUAL_PROOF_PHASES: Readonly<Record<VisualProofForm, readonly number[]>> = {
  'ember-drive': [1000, 450, 500, 400, 950, 120, 750, 850],
  'glass-current': [1000, 750, 450, 450, 720, 120, 720, 850],
};

/** Fixed, deterministic cues are routed through CombatSession's normal inputs and enemy attack logic. */
export const VISUAL_PROOF_CUES: Readonly<Record<VisualProofForm, readonly VisualProofCue[]>> = {
  'ember-drive': [
    { at: 1.0, action: 'transform' },
    { at: 3.23, action: 'attack' },
    { at: 4.22, action: 'transform' },
  ],
  'glass-current': [
    { at: 1.0, action: 'transform' },
    { at: 2.39, cue: 'enemy-telegraph' },
    { at: 2.63, action: 'dash' },
    { at: 3.13, action: 'shockwave' },
    { at: 4.22, action: 'transform' },
  ],
};

const showcaseCycle = (form: VisualProofForm, start: number): PremiumShowcaseCue[] => form === 'ember-drive' ? [
  { at: start + .20, action: 'transform' },
  { at: start + .82, movement: { x: 1, y: 0 } },
  { at: start + 1.16, movement: { x: 0, y: 0 } },
  { at: start + 1.45, cue: 'reset-targets', action: 'attack' },
  { at: start + 1.79, action: 'attack' },
  { at: start + 2.13, action: 'attack' },
  { at: start + 2.68, action: 'bolt' },
  { at: start + 3.25, action: 'shockwave' },
  { at: start + 4.10, cue: 'top-up-pulse', action: 'finisher' },
  { at: start + 5.18, cue: 'enemy-telegraph' },
  { at: start + 5.42, movement: { x: 1, y: 0 }, action: 'dash' },
  { at: start + 5.70, movement: { x: 0, y: 0 } },
  { at: start + 6.82, action: 'transform' },
] : [
  { at: start + .20, action: 'transform' },
  { at: start + .82, movement: { x: 1, y: 0 } },
  { at: start + 1.16, movement: { x: 0, y: 0 } },
  { at: start + 1.45, cue: 'reset-targets', action: 'attack' },
  { at: start + 1.79, action: 'attack' },
  { at: start + 2.13, action: 'attack' },
  { at: start + 2.68, action: 'bolt' },
  { at: start + 3.25, cue: 'enemy-telegraph' },
  { at: start + 3.49, movement: { x: 1, y: 0 }, action: 'dash' },
  { at: start + 3.78, movement: { x: 0, y: 0 } },
  { at: start + 3.88, action: 'shockwave' },
  { at: start + 4.72, cue: 'top-up-pulse', action: 'finisher' },
  { at: start + 5.28, cue: 'enemy-telegraph' },
  { at: start + 5.54, held: ['guard'] },
  { at: start + 5.92, held: [] },
  { at: start + 6.82, action: 'transform' },
];

/** Three deterministic 12-second action cycles, replayed through the real CombatSession and renderer. */
export const PREMIUM_SHOWCASE_DURATION = 36;
export const PREMIUM_SHOWCASE_CUES: Readonly<Record<VisualProofForm, readonly PremiumShowcaseCue[]>> = {
  'ember-drive': [0, 12, 24].flatMap(start => showcaseCycle('ember-drive', start)),
  'glass-current': [0, 12, 24].flatMap(start => showcaseCycle('glass-current', start)),
};

export function premiumShowcaseCuesBetween(form: VisualProofForm, from: number, to: number): readonly PremiumShowcaseCue[] {
  return PREMIUM_SHOWCASE_CUES[form].filter(cue => cue.at > from && cue.at <= to);
}

export function visualProofDuration(form: VisualProofForm): number {
  return VISUAL_PROOF_PHASES[form].reduce((total, milliseconds) => total + milliseconds, 0) / 1000;
}

export function visualProofFrameIndex(form: VisualProofForm, elapsedSeconds: number): number {
  let remaining = Math.max(0, elapsedSeconds) * 1000;
  const timings = VISUAL_PROOF_PHASES[form];
  for (let index = 0; index < timings.length - 1; index++) {
    remaining -= timings[index];
    if (remaining < 0) return index;
  }
  return timings.length - 1;
}

export function visualProofCuesBetween(form: VisualProofForm, from: number, to: number): readonly VisualProofCue[] {
  return VISUAL_PROOF_CUES[form].filter(cue => cue.at > from && cue.at <= to);
}
