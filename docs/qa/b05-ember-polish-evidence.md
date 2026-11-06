# B05 Ember polish, diagonal travel and combo evidence

**Date:** 2026-11-06
**Status:** Playable candidate; human visual, tactile and audio approval pending.

## What changed in the real game

Four diagonal input pairs select the matching left or right travel row, with front/back at near-vertical input and hysteresis during small changes. The movement vector itself stays diagonal. Base hit two now presents its extended punch during the real damage window; the three-hit chain has a small forward body drive and recovery settle. Ember gains localized cuff energy, stronger ignition and impact layering, a quieter aura, and a finisher texture aligned to the actual strike vector. The same renderer handles ordinary play and the developer showcase.

## Headless Chrome evidence

Matched focused runs: baseline commit `ed04098` in `tests/evidence/b05/live-chrome/ember-polish-before-2026-11-06T20-11-30-114Z/` and this batch in `tests/evidence/b05/live-chrome/ember-polish-after-2026-11-06T20-12-09-311Z/`. Both use the same scripted input and the actual Vite game at normal speed, recorded by headless Chrome 156. The three `comparison-*.webm` files in the after directory put **before on the left, after on the right**. Browser loading and frame scheduling are not frame-locked, so corresponding instants can drift. The WebM files contain **no audio**.

| Clip | What it shows | Automated observation |
|---|---|---|
| `diagonal-four-directions.webm` | W+D, W+A, S+D, S+A, each followed by a cardinal transition | Baseline samples were back, back, front, front. After samples were right, left, right, left while position moved along both axes. |
| `base-three-hit-combo.webm` | Three manual punches against the fixed test target | Target HP changed from 1000 to 936. |
| `ember-activation-combo-special-finisher-reversion.webm` | R activation, manual combo, Q special, F finisher and R reversion | Transformed state became true, then false; after target HP changed from 1000 to 807. Around 4.3s in the matched comparison, the prior finisher points down while the revised finisher follows the rightward strike. |

Each `report.json` contains the samples and browser error arrays, which were empty. The after run used `node tools/b05-ember-polish-qa.mjs http://127.0.0.1:5175/`; the detached baseline checkout used port 5176 with `--baseline`. The base combo comparison is subtle at normal game scale; its clearest correction is the authored extended-punch contact column, verified at the active-frame boundary in the resolver test. The old eight-pose GIF remains a rejected reference, not accepted gameplay art.

The focused clips are Git-ignored to keep the repository download small. They are available in the local workspace, not the GitHub ZIP. The tracked script lets the owner regenerate them.

## Verification and limits

- Clean `npm ci` in a separate temporary dependency directory: 73 packages, 0 vulnerabilities. The root Vite process was left running to avoid Windows native-file locks.
- `npm run typecheck`, `npm run build`, `npm test` (44/44), `npm audit` (0 vulnerabilities), `python tools/build-b05-art.py`, and `npm run qa:chrome:self-test`: pass.
- Focused Chrome QA: both matched runs pass, no recorded page or request failures. Full B05 Chrome QA on the final code: 72 checks, 0 failures and no console, page, failed-request or HTTP errors; report `tests/evidence/b05/live-chrome/run-2026-11-06T20-08-17-611Z-pid35904/qa-report.json`.
- Human headed playback, sound listening, physical controller feel, owner art approval and boss fight review remain **not run**. The old turnaround-derived character atlas still cannot meet the selected heated segmented armor direction in every view. The existing generated frames may still look pose-heavy to the owner. B05 remains partial; another Ember art and animation pass is needed before proceeding to Glass as a fully approved form.
