# B05 premium motion, VFX and playable showcase evidence

**Date:** 2026-11-06

**Status:** Playable implementation candidate; owner visual, audio and game-feel approval pending. B05 remains partial and does not satisfy the V2 complete-form contract.

## What runs in the game

Both showcases run through the actual Vite React app, `GameController`, deterministic `CombatSession.update`, Canvas renderer, hitboxes, form timers, cooldowns and event audio path. Each continuous replay runs at normal speed for 36 seconds and repeats three action cycles. The dev route only scripts inputs, test targets and presentation settings; ordinary controls use the same form-specific renderer and combat events.

| Form | Runtime sequence exercised | Combat evidence |
|---|---|---|
| Ember Drive | Activate, move/run, three-hit combo, bolt, special, finisher, dodge and revert; three times | Combo/finisher reduced the first test target from 1200 to 621 HP. Seven targets remained in the encounter. |
| Glass Current | Activate, move/run, three-hit combo, bolt, telegraphed dodge/counter, counter-gated special, finisher, guard/parry and revert; three times | Dodge earned its real counter window; the special consumed it. First target fell from 1200 to 936 HP. Seven targets remained. |

Combo presentation snapshots the form at attack start so an expiring form does not flash back to base during a committed string. Special and finisher actions retain the real ability rules and use a corresponding form-specific combo phase because dedicated character-action atlases do not exist. Activation and reversion crossfade base/form directional art and use event-timed form textures. Form hurt/KO currently falls back to form guard/idle art; no dedicated form hurt/KO clip exists.

The VFX renderer layers the existing generated Ember/Glass textures by combat event and action phase, with moving trails, timed bloom/impact/recovery layers and a bounded deterministic visual-particle budget. It follows reduced-motion, reduced-flash, particle and screenshake settings. This is an integrated proposal; it has not received owner visual approval.

## Captured browser evidence

Latest successful run: `tests/evidence/b05/live-chrome/run-2026-11-06T18-09-47-225Z-pid5776/qa-report.json`.

- `showcase-ember-drive.webm` and `showcase-glass-current.webm`: continuous 36-second normal-speed captures from the actual Vite game. Both include the dev panel's failed eight-pose GIF as an in-scene comparison. These WebM files contain no audio track.
- `transformation-attack-reversion-short.webm`: 7.6-second activation, real attack and reversion capture.
- `ordinary-game.webm`: ordinary menu/form selection and combat flow, including save v3 selection and Glass dodge-counter-special verification.
- `showcase-matrix-*.png`: both forms captured at 100% and 75% game scale, on dark and midtone backgrounds, with normal and reduced effects.
- `ordinary-*.png`, `showcase-*-{start,mid,end}.png`, and `qa-report.json`: ordinary gameplay/menu and action snapshots, timing samples, assertions and browser telemetry.

The automated run used Chrome 156.0.8078.80 on Windows, 1280×720 for the two form videos and 960×540 for an ordinary gameplay sample. Seven stationary high-HP targets provided a populated encounter without turning the showcase into a survival test. Headless RAF samples reported Ember 217.99 callbacks/s (P95 8.3 ms, maximum 50.1 ms) and Glass 221.31 callbacks/s (P95 8.3 ms, maximum 37.6 ms). These are headless callback/timing observations, not a display-refresh or sustained hardware-performance acceptance result.

The final report has zero console errors, page exceptions, failed requests or HTTP error responses. It passes ordinary form selection/save persistence, movement, real mouse damage, guard/dodge, Ember special/finisher, pause/settings/resume, return-to-hub, Glass selection and the earned Glass dodge counter. Browser audio event IDs and a running AudioContext were observed; **sound was not captured or heard**. Physical controller testing was not run.

The clips and screenshots are stored in the Git-ignored `tests/evidence/b05/live-chrome/` tree. They are intentionally excluded from Git history and GitHub downloads.

## Runtime art and remaining production gaps

This batch did not generate another independent pose sheet. It uses the existing four-direction form atlases and VFX textures, timed from real simulation states. Atlas motion is not a skeletal rig, mesh deformation or generated in-between animation; the short timing phases and renderer compositing are a review candidate whose fluidity must be judged at normal speed.

The runtime body art still comes from `ember-drive-turnaround-v2.png` and `glass-current-turnaround-v3.png`. The separate Glass A and Ember reinterpretation proposal images have **not** been converted into the runtime four-direction atlases. That master-to-runtime art gap remains open. Dedicated form hurt/KO, start/stop, special/finisher body atlases, authored audio recordings and active sound loops are also missing. Human visual/audio/game-feel signoff, physical-controller review and originality/likeness clearance remain pending.

## Verification

Commands/results for the final source state:

| Command/check | Result |
|---|---|
| Clean `npm ci` | PASS in a disposable clean validation checkout (73 packages; 0 install vulnerabilities). A root attempt encountered Windows `EPERM` because the user's existing Vite server held a native dependency file; it was left running. |
| `npm run typecheck` | PASS in the clean validation checkout. |
| `npm run build` | PASS; Vite production bundle built. |
| `npm test` | PASS, 43/43 core tests. |
| `npm audit` | PASS, 0 vulnerabilities. |
| `python tools/build-b05-art.py` | PASS; both existing four-direction candidate atlases and manifest regenerated. |
| `npm run qa:chrome:self-test` | PASS. |
| Headless Chrome QA | PASS; `node tools/b05-chrome-local-qa.mjs --headless --url http://127.0.0.1:5174/`; no browser/network errors. |
| `git diff --check` | PASS. |
| Production bundle | PASS; `dist/art-source/` is absent. |

See [ADR-017](../technical/adr-017-b05-premium-motion-vfx-candidate.md), the [animation manifest](../art/b05-animation-manifest.json), and the [generation notes](../art/b05-generation-notes.md). V2 remains unchanged. Do not mark B05 complete or begin B06 on the strength of automated evidence alone.
