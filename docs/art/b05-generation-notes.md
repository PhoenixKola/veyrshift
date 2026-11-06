# B05 art generation and export notes

**Date:** 2026-11-06  
**Generator:** OpenAI built-in ImageGen. Model/version and seed are not exposed by the tool. Earlier B05 exact prompts were not retained in this checkout; their notes below remain explicitly briefs. The two finalization hurt/KO prompts are recorded verbatim because those tool calls exposed their text.

## Candidate source set

All files below are original generated candidates stored as PNG under `art-source/b05/review/`:

- `ember-drive-turnaround-v2.png` — four-view evolved Kairo concept, bronze kinetic cuff lattice, forward-loaded identity.
- `glass-current-turnaround-v3.png` — four-view evolved Kairo concept, refined prismatic cuffs, restrained cool accents.
- `glass-current-turnaround-v2.png` — interim generated study retained for provenance; v3 is the selected candidate recorded in the runtime manifest.
- `ember-idle-grid-v2.png`, `glass-idle-grid-v2.png` — four-direction, four-pose stance candidates; v1 drafts are rejected for wrong facing and cell-edge contact.
- `ember-dodge-grid-v3.png`, `glass-dodge-grid-v2.png` — four-direction dodge candidates; unsafe-margin and arms-down drafts are rejected. Glass uses explicit row cuts through an empty gutter so the source retains all alpha content.
- `ember-guard-grid-v1.png`, `glass-guard-grid-v1.png` — four-direction guard/parry candidates; runtime parry pose is selected only after a successful parry event.
- `ember-bolt-grid-v1.png`, `glass-bolt-grid-v1.png` — four-direction cast candidates; release phase aligns with the B04 bolt windup.
- `ember-run-grid-v1.png`, `glass-run-grid-v1.png` — 4×4 grids, rows front/right/back/left, columns push-off/stride/pass/land.
- `ember-combo-hit1-grid-v1.png`, `ember-combo-hit2-grid-v1.png`, `ember-combo-hit3-grid-v1.png` — per-hit 4×4 grids, rows front/right/back/left, four generated phases per hit.
- `glass-combo-hit1-grid-v1.png`, `glass-combo-hit2-grid-v3.png`, `glass-combo-hit3-grid-v3.png` — same direction/phase layout. The final versions were selected after rejecting white backdrop, top-edge hair, cell-edge feet and neighboring-cell cut artifacts.
- `ember-ability-icons-v1.png`, `glass-ability-icons-v1.png` — 3×2 transparent glyph sheets, sliced into six discrete UI textures per form.
- `ember-vfx-sheet-v1.png`, `glass-vfx-sheet-v1.png` — 3×2 transparent effect sheets, sliced into activation, contact, bolt, special, finisher and transition textures.

The prompt briefs asked for original HD inked/cel-shaded 2.5D anime action-game visuals, four consistent cardinal views based on the existing Kairo reference, unclipped body parts, clear gaps between cells, transparent backgrounds, no extra limbs, and form-specific silhouette/material language. Ember used kinetic bronze/ember cues; Glass used controlled prismatic/cyan-violet cues. No third-party images were intentionally referenced other than the project’s own Kairo identity reference.

## Rejected drafts archived outside Git

- `glass-combo-hit2-grid-white-background-rejected.png` — opaque white background.
- `glass-combo-hit2-grid-top-edge-rejected.png` — hair touched the top source-cell edge.
- `glass-combo-hit3-grid-trailing-cut-rejected.png` — light trail leaked through neighboring source cells.
- `glass-combo-hit3-grid-foot-edge-rejected.png` — foot cut the source-cell edge.
- Earlier turnaround proposals previously in `art-source/b05/proposed/` — prior B05 evidence records baked-background, label and accessory-placement defects; they are excluded from runtime and stored in the local sibling archive.
- `ember-idle-grid-v1-wrong-facing.png` — final row did not preserve facing and poses were too similar.
- `glass-idle-grid-v1-edge-contact.png` — above-threshold alpha touches a source-cell edge.
- `ember-dodge-grid-v1-unsafe-margin.png` — foot one source pixel from an edge; rejected against the user's prior crop-neighbor feedback.
- `ember-dodge-grid-v2-stance-mismatch.png` and `glass-dodge-grid-v1-stance-mismatch.png` — arms-down / insufficiently purposeful dodge poses.
- `glass-dodge-grid-v1-stance-mismatch.png` — first Glass dodge attempt; rejected for the same stance problem.
- `glass-hurtko-grid-v1-repeated-left-facing.png` — generated replacement repeated a left-facing profile in the required right-facing row; no runtime use.
- `ember-hurtko-grid-v1-cell-edge-noise.png` — opaque pixels touched cell edges in multiple frames; rejected to avoid cross-cell contamination.

Rejected full-resolution sources listed above are retained outside the repository at `../veyrshift-local-archive-2026-11-06/` and recorded by original path, byte count, and SHA-256 in its `archive-inventory.json`. The active build uses selected sources only.

## Verbatim finalization prompts

**Glass hurt/KO v1 — rejected for direction errors:**

> Use case: stylized-concept. Asset: original 2.5D game directional hurt and defeat character source. Reference locks adult Glass Current Kairo's identity, prismatic cuffs, raised collar, plum hair, charcoal jacket, split coat tails, boots and proportions. Create a transparent 4x4 grid of separate whole-body poses. Rows face front, RIGHT, back, LEFT respectively; keep head and torso aligned with the direction in the entire row. Columns: (1) flinch from a hit, (2) recoil a little further with both arms protecting body, (3) steady into guard, (4) defeated kneeling on one knee with head lowered, both arms and hands attached. Keep character scale and feet grounded with identical costume. Each figure occupies the central 60% of cell width and 70% height with broad transparent gutters, no overlapping cells. Exactly two arms/hands and two legs/feet, no extra limbs, severed pieces, cropping or blood. Original HD inked cel-shaded action game art. Genuine transparency, no effects, text, labels, grid, checkerboard or floor shadow.

**Ember hurt/KO v1 — rejected for cell-edge noise:**

> Use case: stylized-concept. Asset: an original game animation source sheet, transparent background, 4 columns x 4 rows of equal separate cells. Adult Ember Drive Kairo: plum hair, face with steady proportions, one bronze pauldron, asymmetric bronze cuffs, charcoal jacket, split plum coat tails, charcoal trousers, bronze-trimmed boots. EXACT ROW DIRECTIONS: row 1 faces directly toward camera, front view; row 2 is his RIGHT-facing profile, his nose points to the RIGHT edge of the image and we see his right side; row 3 is a back view, face completely hidden; row 4 is his LEFT-facing profile, nose points to the LEFT edge. Keep these directions exact in every cell of that row. Each row has four whole-body poses in order: (1) small hit flinch, (2) deeper recoil covering torso with arms, (3) return to steady fighting stance, (4) low defeated kneel with lowered head and hands attached. Pose variation may be subtle, costume and scale consistent. Center each body with generous clear blank margins; no other cells' body parts may enter a cell. Exactly two arms and hands, two legs and boots, anatomically coherent. Use original HD inked cel-shaded anime action-game art, no text, labels, effects, shadows, checkerboard, border lines, panel frames, or extra background. Genuine alpha transparency.

## Deterministic derivatives

Run `python tools/build-b05-art.py` to regenerate runtime exports and `docs/art/b05-animation-manifest.json`. The exporter uses four cardinal rows, fixed 192×256 character cells, 128×128 icon cells and 256×256 VFX cells. It removes only nonzero alpha values at or below 32, rejects any remaining above-threshold source-cell border pixels, reports connected-component areas without deleting them, and writes contact sheets plus offline GIF phase previews using simulation-derived phase durations. Combo previews keep all four directions visible together instead of changing direction once per frame. Source SHA-256, dimensions, trims, pivots, durations and runtime file paths are recorded in the manifest.

Dark-background contact sheets were inspected for turnarounds, icons, VFX, run and combo clips. This is an offline technical/artifact inspection only. It does not establish game-scale readability, fluid animation, actual combat timing, sound quality, legal clearance or owner approval. See `docs/qa/b05-completion-evidence.md`.

## Playable motion/VFX integration — 2026-11-06

This continuation generated no new character image sheets. It uses the existing four-direction B05 form atlases and six authored effect textures per form, selected from real combat states and layered by the Canvas renderer. The rejected eight-pose GIF workflow was not expanded. Current run/combo art consists of authored directional sprite phases, not skeletal parts or generated in-betweens; see [`b05-animation-vfx-production-evidence.md`](../qa/b05-animation-vfx-production-evidence.md) for the actual 36-second gameplay captures and limitations.

The current gameplay body atlases still use [`ember-drive-turnaround-v2.png`](../../art-source/b05/review/ember-drive-turnaround-v2.png) and [`glass-current-turnaround-v3.png`](../../art-source/b05/review/glass-current-turnaround-v3.png) as their references. Glass A and the single Ember reinterpretation remain separate proposal images and have not yet been converted to the runtime four-direction atlases. The visual master-to-runtime gap remains open. All art is still proposed and awaits owner review.
