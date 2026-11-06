# B05 assembled-first 2D animation decision

Date: 2026-11-07
Baseline: `bd3ef433f28d5b9ee070af4678d7bbb8ff29245e`
Decision: **NO-GO for assembled-layer articulation; retain current full-body frame animation.**

## Player-visible result

No runtime or production-asset change. The current right-facing base combo remains the existing whole-body sprite sequence. Focused Chrome evidence confirms its three contact values (14 + 19 + 31) damage the test target from 1000 to 936 HP. The recording shows the current game and is not a before/after of layered art. No animation-production improvement is claimed.

## Phase A: source-preserving assembly gate

Selected `art-source/b05-ember-production/base/combo-hit1-right.png`, cell 1 (543x724), as the actual in-game right-facing neutral/guard pose. The original source remains untouched. SHA-256 digests for all three base combo strips are in the external `provenance.json`.

A bounded segmentation extracted the lead arm, cuff and fist from that same frame. A single body plate retained head, torso, legs and tails; OpenCV inpainting filled the removed arm pixels as a temporary underpaint attempt. Rest compositing reproduced the source closely (visible-pixel mean absolute RGBA difference 0.1295; 448 pixels differ by more than 8 channel values). This validates only static reconstruction. The underpaint is inferred pixels, not authored hidden anatomy.

Two transforms around source pixel pivot (274,217) were reviewed at full resolution and at 100x140 and 75x105, without VFX. The moving arm reveals a blurred hole where the arm had covered the torso and leaves the torso/weight fixed. Cuff and fist edges read as separated patches. The contact silhouettes do not read as intentional martial-arts poses. These are rejected tests; none ships. The experiment isolated only one arm and is not a production-ready layer set.

**Gate result:** FAIL for joint underpaint, shoulder/arm continuity, contact silhouette and full-body weight transfer. Face and costume pixels stayed source-locked at rest, but that is not enough for animation. Stop the assembled-part route here; do not expand it to Ember or additional directions.

## Phase C: existing full-body fallback

The following complete-body frames were copied unchanged from the authored base source strips and compared together at full size and runtime size:

- Neutral / windup: `combo-hit1-right.png`, cell 2.
- First-hit contact: `combo-hit1-right.png`, cell 3.
- Third-hit contact: `combo-hit3-right.png`, cell 3.

The figure retains the same face, hairstyle, clothing, cuffs, footwear, lighting and right-facing orientation. The current runtime's base atlas is 2304x1024 with 192x256 frame cells, drawn at 100x140 Canvas pixels. The external contact sheets also show 75x105. The existing sequence is coherent and playable; the selected keyposes are not new art and no new transition frames were drawn.

The external package contains the full-size source/reconstruction comparison, the rejected arm poses and layers, the three full-body keyposes at full and game scale, and `gameplay/base-three-hit-combo.webm`. The focused QA report records no page errors and a target HP change from 1000 to 936. Test assets and the video are outside Git in: `E:\Programming\Projects\0. Extra\veyrshift-b05-assembled-first-review-2026-11-07.zip`.

## Exact artist task

Paint one right-facing Kairo source at the current proportions. Preserve the canonical face, hair, expression, asymmetric cuffs, jacket, sash, belt, trousers, boots, shadow and cel shading. Hand-paint hidden overlap behind the lead shoulder, elbow, wrist/cuff and fist so the arm can rotate without transparent gaps or blurred fill; keep the waist and planted foot connected to the body. Deliver: (1) an assembled neutral/windup, first-contact and third-contact transparent RGBA full-body image, each at 543x724 source-cell size; (2) the matching arm/torso underpaint and separated cutout layers with named pivots and occlusion order; and (3) a 192x256-per-cell runtime atlas export with clean transparent padding and no neighboring-cell bleed. Show each pose without VFX at 100x140 and 75x105. The owner must approve these images before any rig or Ember reuse.

## Verification and limits

- Ran `node tools/b05-ember-production-qa.mjs http://127.0.0.1:5175/` in headless Chrome at normal recording speed. Base combo target HP moved 1000 to 936; all recorded scenes reported no page errors. Recording is the current runtime, not a layered implementation.
- `npm run typecheck`, `npm run build` and `npm test` were not run because this batch changed no runtime code or production art.
- Human visual/game-feel approval: pending. No claim that the source-locked pose selection is a newly produced animation.
- Layered articulation reuse for Ember: **not approved**. Existing full-body frame swapping is demonstrated for the current base sequence only; new source-locked art production is not tested by this gate.
