import type { KeyAction, KairoFormId } from '../core/types.js';

export type VisualProofForm = Extract<KairoFormId, 'ember-drive' | 'glass-current'>;
export type VisualProofCue = { at: number; action?: KeyAction; cue?: 'enemy-telegraph' };

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
