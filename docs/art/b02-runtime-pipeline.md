# B02 Kairo animation runtime pipeline

**Status:** Generated feasibility pass; not final art and not owner-approved.

## Source and exported atlases

The B02 image-generation source sheets are stored outside `public/` under `art-source/b02/`. `tools/build-b02-animations.py` slices the source layouts in row-major order, removes small disconnected alpha components, trims each remaining silhouette, proportionally scales it into a 128 x 160 transparent cell, and aligns its bottom-center to the recorded foot anchor. It writes the runtime atlases under `public/assets/characters/kairo/b02/`, updates `docs/art/b02-animation-manifest.json`, and creates `tests/evidence/b02/kairo-animation-contact-sheet.png`.

The cleanup threshold is 0.6% of each source cell. It removes detached specks such as a hand or shoe that leaked across a generated cell boundary; it does not redraw or change a connected silhouette. The manifest lists every frame's source alpha bounds and every removed component area so the cleanup is repeatable and reviewable.

| Atlas | Frames | Source grid | Runtime use |
|---|---:|---:|---|
| `idle.png` | 8 | 8 x 1 | 0.12 second breathing/weight-shift loop |
| `run.png` | 8 | 4 x 2 | 0.07 second directional locomotion loop |
| `combo.png` | 12 | 4 x 3 | Four frames for each of three attack silhouettes |
| `dodge.png` | 6 | 3 x 2 | 0.19 second evasive step/weave |
| `states.png` | 8 | 4 x 2 | Guard 0-1, hurt 2-3, KO 4-5, Ember activation 6-7 |

All runtime frame sizes and anchors are declared in the JSON manifest. The original source images remain available for visual comparison and re-slicing.

## Runtime selection and gameplay timing

`CanvasRenderer` selects an atlas from simulation state, then selects a frame from animation time or movement distance. Images mirror horizontally from the hero's facing angle. The camera is still a 2.5D plane: up/down movement uses the same three-quarter pose, not authored eight-direction sprites.

Each light strike starts an animation clip with a 75 ms anticipation before one directional melee arc check. The simulation's current hitbox is still a single arc shared across frames, not a hand-authored frame-by-frame hitbox envelope. Input presses buffer for 190 ms during recovery. Contact starts restrained color-coded impact particles and hitstop; the third hit uses the launcher pose and stronger feedback. A dash cancels the current swing and plays a distinct six-frame cycle during its invulnerable window.

Hurt and KO are explicit hero states. The Ember activation uses two authored poses plus a short expanding geometric ring; the active form continues to use the base run/combo animation with amber aura treatment. This is an experience/presentation proof only. Ember Drive is not a complete form under the V2 quality contract.

## Known limitations

- Frames are generated key poses with automated alpha cleanup and proportional placement. No redraw, rigging, tweening, or hand-authored in-betweens were added.
- Foot alignment is normalized by cell bounds and bottom-center, not per-frame skeletal pivots. Low/airborne poses may therefore feel less grounded than planted poses.
- The generated idle frames are intentionally subtle and visually similar. Face, anatomy and costume are consistent enough for a prototype, but this is not a polished master sheet.
- Only horizontal mirroring is implemented. No eight-direction art or directional hitbox animation alignment was produced.
- Small connected paint artifacts are not removed by connected-component cleanup and remain a visual review item. The owner must review every pose and the live game before the art direction can be accepted.
- Source generator model/version metadata was not exposed. Prompt briefs and output inspection are recorded in `docs/qa/b02-evidence.md`; external IP clearance and owner approval are not claimed.
