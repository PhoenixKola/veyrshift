# Animation pipeline decision: rigged-3D sprite pilot

Date: 2026-11-06
Baseline: `a6cf9ef49e812b1d8605f78112a233a193105a5b`

## Result

**INSUFFICIENT EVIDENCE — BLOCKED before modeling. NO-GO for adopting or integrating a 3D-to-sprite pipeline in this batch.** This is an environment blocker, not evidence that a rigged 3D approach could never meet the art bar. No character model, rendered frames, video, or runtime asset was created. The production game and B05 assets remain unchanged.

## Blender/tool availability audit

Checked the actual Windows development environment:

- `Get-Command blender`, `Get-Command blender.exe`, and `where.exe blender` returned no executable.
- The usual Blender Foundation folders under Program Files and the user-local Programs folder are absent.
- Windows uninstall registry inventory returned no Blender installation; `winget list --name Blender --disable-interactivity --accept-source-agreements` reported no installed package.
- Chocolatey’s installed package directory contains Chocolatey and FFmpeg, but no Blender package. No `bpy` Python module is available and no Blender process is running.
- There is no executable/version to run a headless render against. No install or policy bypass was attempted. This was a standard-location/package inventory, not an exhaustive recursive scan of every data-disk folder for manually copied portable binaries.

## Repository/source audit

- The requested baseline commit and clean working tree were verified before edits.
- Read the unchanged V2 vision, two-hero/six-form release addendum, current implementation status, architecture, visual bible, asset ledger, B05 completion handoff, B05 Ember production notes and manifest, animation resolver, Canvas renderer, and existing Chrome QA runner.
- Canonical reference candidates exist at `art-source/b03/kairo-base-turnaround.png` and `art-source/b05-ember-production/base/diagonal-turnaround.png`. They remain proposals, not owner-approved master art. The Ember reinterpretation image was not used as a modeling target; the pilot targets base Kairo.
- The existing `visualRigCutoutPose` pilot is a single 372×887 cutout drawn with Canvas translation and rotation. It has no articulated joints, deformations, rig, or rendered eight-direction animation. It is not counted as 3D or as an articulated-rig result.

## Five-criterion gate

| Criterion | Decision | Evidence and reason |
|---|---|---|
| Visual parity | **INSUFFICIENT EVIDENCE** | Blender was unavailable, so no model or turnaround was rendered against the Kairo proposal art at gameplay scale. Owner-approved master art is not present. |
| Motion | **INSUFFICIENT EVIDENCE** | No armature, action curves, articulated animation, combo, or moving footage could be produced. The existing cutout transform does not qualify. |
| Eight-way consistency | **INSUFFICIENT EVIDENCE** | No directional renders exist to compare. |
| Reproducibility | **INSUFFICIENT EVIDENCE** | No editable `.blend`, rig, source curves, camera/light setup, or sprite exporter exists for this experiment. |
| Browser feasibility and footprint | **INSUFFICIENT EVIDENCE** | No candidate sprites were rendered or loaded into the real Vite scene; no runtime-size or frame-cost measurement is available. |

## Exact next step

Do not adopt or integrate 3D based on the existing cutout proof. If an authorized Blender executable becomes available, run one bounded, reference-driven base-Kairo rig pilot and render the five acceptance gates before considering any runtime change. If Blender remains unavailable, the next feasible experiment is a separately scoped layered-2D articulated rig with manually redrawn joints and limited perspective views; it must pass the same normal-scale identity and motion review before expanding to Ember or other content.

No Chrome run or build/test suite was repeated because this blocked pilot changed documentation only; no source/runtime code or gameplay behavior changed. The existing Chrome scripts and production runtime were not modified.
