# B01 generated art pipeline

Date: 2026-11-05. Status: experimental and not approved for production.

## Source and runtime files

Image-generation source masters are kept outside the public directory under `art-source/b01/`. Runtime PNGs are kept by role under `public/assets/characters/kairo/prototype/`, `public/assets/enemies/prototype/`, and `public/assets/ui/`. `tools/optimize-b01-assets.py` alpha-trims character/enemy poses, applies Lanczos thumbnail sizing, writes optimized PNGs, and leaves source files unchanged. The title image is resized without alpha trimming. No atlas packing is used yet because every animation state is a separate authored image and there is no validated sequence to pack.

`docs/art/b01-frame-manifest.json` records the current dimensions, source mapping, facing, pivot and foot anchor. Measurements are hand-estimated after transparent trim. It is a review manifest, not a validated animation pipeline.

## Live integration

The React pre-run and character screens show the generated Kairo artwork. `CanvasRenderer` loads the optimized idle, punch, dodge, Ember visual-only, and Rift Wisp PNGs directly. During combat it selects one image by simulation state, keeps the simulation and collision/hitbox rules in `CombatSession`, and falls back to original Canvas geometry if a PNG is unavailable. Punch and dodge art are authored facing right and are deliberately not mirrored; the current renderer does not yet orient the art to all eight directions. The title menu uses its own generated cinematic background.

These are still poses. Idle has a small procedurally interpolated bob, and the world actor moves on the simulation plane; there is no generated locomotion cycle, multi-frame punch, or dodge timing animation. Ember image is shown briefly during activation, with the prototype's existing damage modifier and time limit. It is not a complete transformation under the V2 quality contract. The requested frame-by-frame hitbox alignment and animation-cycle quality are not established in this batch.

## Next production steps

Once the owner selects a provisional direction, build a reproducible 2D rig or hand-authored multi-frame workflow from approved layered masters, then validate stable silhouette, per-frame foot anchoring, alpha edges, hitbox envelope, depth ordering, and 100%/75% gameplay readability. Pack only coherent, reviewed sequences into atlases; retain source masters and manifests. Re-run compression and memory/startup checks before adding more states or characters.
