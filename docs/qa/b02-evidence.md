# B02 animation and combat proof

**Date:** 2026-11-05  
**Status:** Implementation evidence is captured; owner visual and tactile approval is pending.

## Build and automated checks

| Command | Result |
|---|---|
| `npm ci` | PASS; clean dependency install |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; Vite production build completed |
| `npm test` | PASS; 19/19 tests |
| `npm audit` | PASS; zero vulnerabilities |
| `python tools/build-b02-animations.py` | PASS; regenerated five atlases, manifest and contact sheet |

The combat tests cover delayed directional hit checks, buffered three-hit combo timing, hitstop, dash cancellation and invulnerability, hurt/KO persistence, and existing save compatibility. These checks establish simulation behavior, not owner approval of animation quality or game feel.

## Visible browser pass

`node tools/b02-chrome-check.mjs` ran in visible Google Chrome 156.0.8078.80 against the Vite app. It exercised title → hub → gameplay, movement, three attacks against the stationary dev training target, dodge, guard, seeded Ember Drive activation and active presentation, pause/resume, forced room-clear reward selection/resume, and two viewport sizes. The first combo impact screenshot shows the attack pose and impact particles. `result.json` reports no page errors, console errors, or failed HTTP requests; pause and reward both resumed successfully.

The run collected 431 animation-frame samples over 1.8 seconds (median interval 4.2 ms; p95 4.3 ms) in this local browser session. At 1280×720, document size remained 1280×720 and the canvas fit within the viewport. At 960×540, document size remained 960×540 and the canvas fit within the viewport. These are one-machine measurements, not a performance target or hardware compatibility claim.

The Chrome script uses the development-only training target, form resource seed and room-clear fixture to reach controlled states. It does not prove ordinary progression or replace hands-on input/game-feel review. A physical controller was not tested.

## Captured evidence

- `tests/evidence/b02/chrome/b02-gameplay-evidence.webm` — full visible browser session.
- `tests/evidence/b02/chrome/result.json` — browser version, actions, frame sample, viewports and error/request checks.
- `tests/evidence/b02/chrome/title-menu.png`, `idle-live.png`, `locomotion-live.png` — entry and animation states.
- `tests/evidence/b02/chrome/combo-hit-1.png`, `combo-hit-2.png`, `combo-hit-3.png`, `combo-live.png` — combo state and impacts.
- `tests/evidence/b02/chrome/dodge-live.png`, `guard-live.png`, `ember-activation-live.png`, `ember-active-live.png` — defense and form presentation.
- `tests/evidence/b02/chrome/pause-live.png`, `reward-live.png`, `gameplay-16-9.png`, `gameplay-reduced.png` — overlays and viewport fit.
- `tests/evidence/b02/kairo-animation-contact-sheet.png` — final cleaned runtime atlas contact sheet, visually inspected for detached partial limbs.

## Art generation and review boundary

Five generated source sheets and their summaries are in `art-source/b02/`; optimized runtime atlases and frame/anchor measurements are in `public/assets/characters/kairo/b02/` and `docs/art/b02-animation-manifest.json`. The repeatable alpha-component cleanup removes disconnected cell fragments below its documented 0.6% threshold. After the user's report of an extra hand and neighboring-cell body fragments, the dodge source layout was rebuilt and the final runtime contact sheet was inspected. Cleanup cannot repair connected anatomy or guarantee every pose is polished.

The image tool did not expose model/version metadata. The recorded generation briefs describe original Kairo action poses; they are summaries, not provider transcripts. Source images remain proposed feasibility work with owner art approval and external IP clearance still open.

Known limits include one three-quarter facing mirrored horizontally, no authored eight-direction set, generated key poses without rigging or hand-authored in-betweens, cell-bottom rather than skeletal anchors, and a shared directional arc across combo frames. Ember Drive remains a short prototype presentation and does not satisfy the V2 complete-form contract.

## Handoff

Owner review is still required for silhouette/anatomy consistency, every frame's crop and attached detail, live animation cadence, combat readability, and tactile feel. B02 is a bounded prototype proof, not production art acceptance or approval of the full renderer/engine choice.
