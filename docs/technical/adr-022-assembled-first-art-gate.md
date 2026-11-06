# ADR-022: Reject assembled-part articulation for the B05 Kairo source

Date: 2026-11-07
Status: Accepted for the current B05 base-combo art gate

## Context

The preceding native 2D skeletal pilot failed because generated components did not preserve Kairo's anatomy and overlap. This decision gate tested whether parts cut from the actual assembled right-facing B05 source could avoid that failure. A static neutral re-composition was close to the source, but inpainted hidden pixels did not contain usable shoulder/torso anatomy. Transforming the arm created blurred exposure, detached cuff/hand edges and no torso weight transfer.

The existing whole-body base combo source frames remain coherent and play in the current Canvas2D runtime. The complete-form vision and owner visual signoff remain open.

## Decision

- Reject the assembled-layer arm pilot for runtime use. Do not expand this approach to Ember, more directions or forms.
- Preserve the current full-body base combo atlas and deterministic combat simulation without modification. Its three actual contact values total 64 damage against the focused browser target.
- Retain the existing whole-body frame sequence as the limited fallback for the current base combo. Do not call the source-frame selection a newly produced animation improvement.
- Require a human-authored, source-locked paintover with hidden overlap anatomy and owner visual approval before another rig or new form animation is attempted.

This ADR does not change the V2 vision or approve any visual asset.

## Consequences

No runtime code or production assets changed in this batch. The failed arm cutout and the current gameplay clip are stored in an external review ZIP, not Git. The decision, provenance, contact poses, focused browser evidence, verification limits and exact artist brief are in [the B05 decision report](../qa/b05-assembled-first-animation-decision.md).
