# ADR-017: B05 playable motion and VFX candidate

**Date:** 2026-11-06

**Status:** Accepted for implementation; owner review required

**Scope:** B05 only

## Context

Earlier B05 independent eight-pose GIFs have visible anchor jumps and long holds and remain rejected as fluid animation. The repo already has original four-direction Ember/Glass idle, run, dodge, guard/parry, bolt and three-hit combo atlases plus authored form VFX textures. The premium-motion prompt calls for actual Vite gameplay sequences, ordinary-play integration, event-driven layered effects and an accurate owner handoff.

## Decision

Use the existing form atlases and existing Canvas2D runtime for a deterministic 36-second-per-form candidate showcase. Scripted dev inputs flow through the real `CombatSession`; state selection, form timing, cooldowns, hitboxes, Glass counter rules and damage remain authoritative. Integrate the same atlas and VFX selection into normal play. Keep the three-cycle route dev-only and isolate its target placement, actor repositioning and health/pulse resets from ordinary runs.

Layer existing form-specific VFX textures on event timing with moving trails and a bounded visual particle budget. Use crossfades and the activation/transition textures for form entry/reversion. Map special and finisher presentation to form-specific combo phases until dedicated action art exists. Keep the previous eight-pose previews as rejected comparison material; do not expand that workflow.

The current runtime atlases use `ember-drive-turnaround-v2.png` and `glass-current-turnaround-v3.png`. Glass A and the Ember reinterpretation remain separate silhouette proposals and are not yet represented in the runtime atlases. This does not satisfy the requested master-to-runtime handoff and remains an explicit art blocker.

## Consequences

- Both forms now have continuous 36-second browser gameplay recordings with real damage, crowded encounters, normal/reduced effects and 100%/75% screenshots.
- Four authored cardinal views are retained. The renderer uses phase timing and texture compositing; no skeletal rig, mesh deformation, in-between frames, dedicated special/finisher atlas or dedicated form hurt/KO atlas is claimed.
- Browser automation confirms mechanics and resource loading only. It cannot approve visual quality, movement feel or sound. Audio listening and owner signoff remain pending.
- Neither Ember Drive nor Glass Current meets the complete V2 form contract. Do not mark B05 production complete or start B06 from this candidate.

## Evidence

See [`B05 premium motion/VFX evidence`](../qa/b05-animation-vfx-production-evidence.md), [`b05-animation-manifest.json`](../art/b05-animation-manifest.json), and the local Git-ignored run under `tests/evidence/b05/live-chrome/`.
