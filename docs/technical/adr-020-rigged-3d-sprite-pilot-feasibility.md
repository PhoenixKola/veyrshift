# ADR-020 — Rigged 3D sprite pilot feasibility

- **Date:** 2026-11-06
- **Status:** Recorded as blocked feasibility; no production technology selection
- **Scope:** One base-Kairo animation-pipeline experiment. No production renderer or combat changes.

## Context

Independent generated pose sheets have shown identity drift and stiff motion. The existing `visualRigCutoutPose` experiment translates and rotates one whole-body image; it does not articulate the character. The requested pilot requires an editable rigged character, eight-direction renders, a real combo animation, reproducible exports, and evidence in the Vite Canvas scene.

The development machine audit found no Blender executable in PATH or standard install folders, no registered installation, no installed Winget package, no Chocolatey package, and no `bpy` module. No headless render could be run. No installation was attempted.

## Decision

1. Record the 3D sprite experiment as **INSUFFICIENT EVIDENCE / BLOCKED** before modeling. This is **NO-GO for production adoption or integration in this batch**, not a general rejection of 3D.
2. Keep the existing browser Canvas2D runtime, B05 assets, combat behavior, and architecture unchanged.
3. Do not substitute a generic model, image plane, primitive puppet, new sprite sheet, or screenshot for the requested articulated base-Kairo model.
4. Resume only when an authorized Blender executable is available, or scope a separate layered-2D articulated pilot with manually redrawn joints and limited perspective art. Either method must clear owner visual review before broader production.

## Consequences

No `.blend`, render script, animation curves, runtime export, or new production dependency was added. The exact audit and criterion-by-criterion result are in [`the pilot feasibility report`](../qa/animation-pipeline-rigged-3d-sprite-pilot.md). The V2 vision is unchanged.
