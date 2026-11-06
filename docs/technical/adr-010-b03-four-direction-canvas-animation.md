# ADR-010 â€” B03 four-direction Canvas animation

**Date:** 2026-11-06
**Status:** Adopted for the B03 prototype; production art and renderer approval remain pending.

## Context

B02 displayed the same three-quarter Kairo art for movement in every world direction and mirrored it horizontally. B03 needs real toward-camera, away-camera and lateral views without reworking the simulation or freezing the provisional Canvas2D renderer decision.

## Decision

- Preserve the existing `CombatSession` state/timing and Canvas2D runtime.
- Add a renderer-facing animation resolver and store movement/hurt facing on hero presentation state.
- Use four distinct authored cardinal views, with vertical movement winning exact diagonal ties. A 70 ms crossfade softens view changes. Do not mirror the authored B03 images.
- Keep B02 atlases as a runtime fallback and expose a development-only B02 comparison query.
- Keep generated animation source separate from runtime atlases, record per-frame crop/pivot/component data, and do not delete connected alpha components automatically.

## Consequences and unresolved questions

This fixes the obvious front/back mismatch and visibly provides left/right profiles. It does not supply authored diagonal views, dedicated run starts/stops or per-frame foot-contact events. Attack simulation uses continuous aim while the image selects the nearest cardinal pose; diagonal contact-pose coherence remains partial. Generated poses and the 70 ms crossfade need owner review for quality and comfort. The B03 files therefore establish a repeatable proposal pipeline, not approved production art or a final renderer lock.
