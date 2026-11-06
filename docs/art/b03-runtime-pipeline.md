# B03 directional animation pipeline

**2026-11-06 · Proposed generated art; owner review pending.**

## Source and export

The B03 source masters are under `art-source/b03/`; the generation briefs and limits are recorded in [`generation-prompts.md`](../../art-source/b03/generation-prompts.md) and [`generation-record.json`](../../art-source/b03/generation-record.json). The accepted turnaround anchors four distinct authored cardinal views. It is a proposed generated reference, not a production-approved master.

Run `python tools/build-b03-animation-assets.py` to make five PNG atlases and contact sheets. Pillow is required. Regular sheets use a 4×4 layout: rows are front/toward, right profile, back/away, left profile; each row has four frames. The combo atlas uses 12 columns (four phases for each of three hits) and four directional rows. Runtime cells are 192×256 with a shared clip scale and normalized ground pivot.

The script records each source alpha bound, pivot, clip scale, connected foreground component area and alpha cleanup count in `docs/art/b03-animation-manifest.json`. A configurable per-frame pivot/root-offset map is in `tools/b03-frame-overrides.json`. Current overrides retain the common generated foot line; they are exposed for artist correction and have not been hand-tuned through a skeletal/rig workflow.

Only alpha values 1–32 are cleared after source-sheet review. Connected components are reported, never automatically deleted. The first clipped/bleeding combo, dodge and run sheets remain in `art-source/b03/rejected/`. The atlas builder does not turn checkerboard pixels into alpha, warp anatomy, or hide detached limbs by cropping neighboring cells.

## Runtime

`src/game/animation/animationResolver.ts` maps movement, aim, combat and state precedence to a direction row and frame. `src/game/core/direction.ts` selects one of four authored views by dominant axis (vertical wins exact diagonal ties). There are no mirrored B03 frames and no separately authored diagonal views; attacks retain continuous simulation aim while the pose selects its nearest cardinal view. Direction changes crossfade over 70 ms unless reduced-motion is enabled. B02 atlases remain the loading fallback; existing vector art remains the last-resort fallback. `GameController.start()` waits for B03/B02/player-enemy image decode attempts before starting the render loop. `tools/copy-preview.mjs` copies the public art beside the offline preview, and file-URL preview loads resolve those art paths relative to the standalone HTML.

Simulation owns combo, dash, guard, damage and KO timing. The presentation resolver reads the existing hero timers; it does not change hitboxes, invulnerability or attack timing. The only B02 force switch is a development-only `?anim=b02` comparison route. It is absent from production behavior.

## Limits

The generated sources are pose sheets, not skeletal animation or manually redrawn production frames. Run uses four authored key poses; it does not yet have dedicated start/stop clips or extracted foot-contact events. The common pivot works in captured cardinal movement but has not had a frame-by-frame human correction pass. Four-way direction selection is readable in the current Chrome captures; diagonal attack pose alignment is partial because gameplay keeps an arbitrary continuous angle while art chooses one cardinal row. Combo hit 3 is visually distinct, but the first two need stronger pose contrast and cleaner anticipation/contact timing. These are open visual gates, not claims of acceptance.
