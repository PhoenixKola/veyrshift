# B05 native 2D skeletal animation pilot

Date: 2026-11-06
Baseline: `f802cbc64f46eec1fe54839c87f83f39fa6514e0`

## Player-visible result

**No gameplay change.** The pilot stopped at the mandatory art gate. The generated part sheet was assembled into a neutral right-facing figure for review at the intended 100% and 75% character scales. The owner rejected the result as looking terrible. No rig or pilot art was integrated into `CanvasRenderer`; the current B05 sprite animation remains in place.

## Attempt and failure

One reference-anchored 12-part sheet was generated from the B03 Kairo turnaround and current right-facing B05 combo source. Its isolated pieces included head/hair, torso, pelvis, coat tails, upper/lower arms, cuffs/fists, upper legs and lower legs/boots. A small image-processing pass separated the sheet cells and removed bright detached edge spill for a neutral assembly preview. The resulting asset and extracted parts stayed in the local generation/temp area; none were copied into the repository or public runtime.

The generated source sheet is the local ImageGen output `exec-39a2ebd2-4cbf-4954-b3ed-43f9687c308d.png` (outside Git). The extracted candidate PNGs and rejected composites are in the development machine's local `veyrshift-parts-preview` temp folder. These are unapproved review artifacts, not deliverables.

The assembly fails the visual gate:

- The torso/hip/upper-leg junction creates a conspicuous horizontal split and gap; the pelvis and trouser sections do not overlap cleanly.
- Independently rendered arms do not align convincingly with the torso. Their cut ends and shoulder/elbow joins read as detached components instead of painted underlaps.
- The result is stiff and overly symmetrical, with fists hanging near the hips rather than a convincing ready stance. It does not preserve the athletic action silhouette of the reference.
- At gameplay scale, proportion and silhouette changes make it read as a reassembled alternate drawing of Kairo rather than the same authored figure in motion.

The sheet contains individual-looking pieces, but that alone does not make a usable rig. No animation timeline, punch poses, combat timing integration, debug overlay, Chrome capture, or old/new comparison video was made after this failure. Those would not repair the rejected base artwork.

## Decision

**NO-GO** for this generated layer set and for expanding this pilot technique to eight directions, Ember, Glass, or bosses. This is not a permanent rejection of native 2D skeletal animation; it is a rejection of this art construction as a foundation. The earlier high-quality sprite assets and production renderer remain untouched.

## Focused art correction brief

Before another rig implementation, obtain one coherent, manually authored right-facing Kairo layer source at the existing gameplay camera and proportions. Build every part from the same original drawing; paint hidden overlap tabs and torso/waist underpainting into the source so pivots remain covered when limbs rotate. Required matching layers: head/neck, torso/jacket/shirt, upper and lower arms with the two distinct cuffs and fists, pelvis/belt, coat/sash tails, upper legs, and lower legs/boots. First deliver only a neutral assembled overlay plus first-hit and third-hit composites. Review at the exact 100×140 and 75×105 display sizes; reject any visible seam, gap, costume drift, or loss of Kairo's face and silhouette before authoring a timeline.

## Verification

- Inspected the canonical B03 turnaround and existing B05 right-facing combo source before the art attempt.
- `git diff --check` is the only codebase verification run for this batch. The test/build/Chrome pipeline was intentionally not run because the pilot stopped before any source or runtime code change.
- Human visual and game-feel acceptance: **FAIL / NO-GO**, based on the owner's direct review. No claim of animation improvement or production readiness is made.
