# B05 art generation and export notes

**Date:** 2026-11-06  
**Generator:** OpenAI built-in ImageGen. Model/version and seed are not exposed by the tool. Exact prompts for the generations completed in earlier turns were not retained in this checkout, so this file records honest prompt briefs rather than reconstructed text passed off as verbatim prompts.

## Candidate source set

All files below are original generated candidates stored as PNG under `art-source/b05/review/`:

- `ember-drive-turnaround-v2.png` — four-view evolved Kairo concept, bronze kinetic cuff lattice, forward-loaded identity.
- `glass-current-turnaround-v3.png` — four-view evolved Kairo concept, refined prismatic cuffs, restrained cool accents.
- `glass-current-turnaround-v2.png` — interim generated study retained for provenance; v3 is the selected candidate recorded in the runtime manifest.
- `ember-run-grid-v1.png`, `glass-run-grid-v1.png` — 4×4 grids, rows front/right/back/left, columns push-off/stride/pass/land.
- `ember-combo-hit1-grid-v1.png`, `ember-combo-hit2-grid-v1.png`, `ember-combo-hit3-grid-v1.png` — per-hit 4×4 grids, rows front/right/back/left, four generated phases per hit.
- `glass-combo-hit1-grid-v1.png`, `glass-combo-hit2-grid-v3.png`, `glass-combo-hit3-grid-v3.png` — same direction/phase layout. The final versions were selected after rejecting white backdrop, top-edge hair, cell-edge feet and neighboring-cell cut artifacts.
- `ember-ability-icons-v1.png`, `glass-ability-icons-v1.png` — 3×2 transparent glyph sheets, sliced into six discrete UI textures per form.
- `ember-vfx-sheet-v1.png`, `glass-vfx-sheet-v1.png` — 3×2 transparent effect sheets, sliced into activation, contact, bolt, special, finisher and transition textures.

The prompt briefs asked for original HD inked/cel-shaded 2.5D anime action-game visuals, four consistent cardinal views based on the existing Kairo reference, unclipped body parts, clear gaps between cells, transparent backgrounds, no extra limbs, and form-specific silhouette/material language. Ember used kinetic bronze/ember cues; Glass used controlled prismatic/cyan-violet cues. No third-party images were intentionally referenced other than the project’s own Kairo identity reference.

## Rejected drafts retained

- `glass-combo-hit2-grid-white-background-rejected.png` — opaque white background.
- `glass-combo-hit2-grid-top-edge-rejected.png` — hair touched the top source-cell edge.
- `glass-combo-hit3-grid-trailing-cut-rejected.png` — light trail leaked through neighboring source cells.
- `glass-combo-hit3-grid-foot-edge-rejected.png` — foot cut the source-cell edge.
- Earlier turnaround proposals in `art-source/b05/proposed/` — prior B05 evidence records baked-background, label and accessory-placement defects; they remain excluded from runtime.

## Deterministic derivatives

Run `python tools/build-b05-art.py` to regenerate runtime exports and `docs/art/b05-animation-manifest.json`. The exporter uses four cardinal rows, fixed 192×256 character cells, 128×128 icon cells and 256×256 VFX cells. It removes only nonzero alpha values at or below 32, rejects any remaining above-threshold source-cell border pixels, reports connected-component areas without deleting them, and writes contact sheets plus fixed-timing offline GIFs. Source SHA-256, dimensions, trims, pivots, durations and runtime file paths are recorded in the manifest.

Dark-background contact sheets were inspected for turnarounds, icons, VFX, run and combo clips. This is an offline technical/artifact inspection only. It does not establish game-scale readability, fluid animation, actual combat timing, sound quality, legal clearance or owner approval. See `docs/qa/b05-completion-evidence.md`.
