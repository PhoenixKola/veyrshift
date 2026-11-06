# ADR-021 — Native 2D skeletal pilot stopped at the art gate

- **Date:** 2026-11-06
- **Status:** Recorded — NO-GO for the generated part set
- **Scope:** Base Kairo, right-facing native 2D skeletal-animation feasibility only

## Context

ADR-020 recorded the Blender pilot as blocked because no Blender toolchain was available. This pilot tested one reference-anchored 2D component sheet against the canonical B03 Kairo turnaround and the right-facing B05 combo source. It was assembled at the target gameplay scale before any animation or runtime integration.

The owner rejected the assembled figure as looking terrible. Review exposed a waist split/gap, poorly aligned shoulder and arm joins, a stiff symmetrical stance, and a changed overall silhouette. The pieces are not a visually coherent foundation for animation.

## Decision

1. Reject the generated parts and stop the pilot at the art gate.
2. Do not integrate these parts, create a rig timeline, or change production gameplay/rendering.
3. Keep the current sprite animations and existing B05 artwork untouched.
4. Require one coherent, manually authored Kairo layer source with painted overlap/underpainting and successful neutral/first-hit/third-hit composites at gameplay scale before a new rig implementation.
5. Do not extend this method to additional directions or characters until the base-Kairo art gate passes.

## Consequences

No runtime art or code was added. The generated parts remain outside the repository and are not treated as approved or usable source. See the [pilot review](../qa/b05-native-2d-skeletal-animation-pilot.md) for failure details and the specific art correction brief. V2 and the renderer architecture are unchanged.
