# B03 Kairo directional animation evidence

**Run date:** 2026-11-06 · **Result:** Implementation is reviewable; art/game-feel owner signoff is pending. Visual gates remain partial where noted.

## Baseline and scope

The checked-out baseline was B02 commit `bb933d273a6677f77998bba8e11e273a93f5dd57`, clean before B03. The V2 vision document was read and not edited. Only Kairo's base animation was changed; other hero/form records remain data or future scope. No source from the old AOTS RPG or third-party game assets was used.

## Art and pipeline

- Proposed turnaround: [`art-source/b03/kairo-base-turnaround.png`](../../art-source/b03/kairo-base-turnaround.png).
- Direction/state source sheets, rejected drafts, generation prompt briefs, and record are in [`art-source/b03/`](../../art-source/b03/).
- Runtime metadata: [`b03-animation-manifest.json`](../art/b03-animation-manifest.json); process notes: [`b03-runtime-pipeline.md`](../art/b03-runtime-pipeline.md).
- Contact sheets: [`idle`](../../tests/evidence/b03/contact-sheets/idle-by-direction.png), [`run`](../../tests/evidence/b03/contact-sheets/run-by-direction.png), [`dodge`](../../tests/evidence/b03/contact-sheets/dodge-by-direction.png), [`combo`](../../tests/evidence/b03/contact-sheets/combo-by-direction.png), [`supporting states`](../../tests/evidence/b03/contact-sheets/states-by-direction.png).
- Equal-scale B02/B03 right-facing comparison: [`b02-vs-b03-equal-scale.png`](../../tests/evidence/b03/b02-vs-b03-equal-scale.png). Runtime-sized and 75% sizing sample: [`runtime-sprite-scales.png`](../../tests/evidence/b03/runtime-sprite-scales.png).
- Iteration evidence: first combo/dodge sheets had neighboring shoe fragments; uppercut wrist and run profile shoe were clipped. These sheets were rejected, preserved, and replaced. Rejected assets and reasons are in the manifest and generation record. Current contact sheets were inspected; no component deletion was used to hide anatomy. Source-grid edge alpha is cleared only when the value is 1–32.
- Provider limitations: image generation did not expose model/version, seed, or verbatim prompt transcript. Prompt briefs are marked as reconstructed rather than passed off as exact transcripts. No external likeness/trademark/legal clearance was performed.

## Live Chrome evidence

The Vite React app was run in visible Google Chrome 156 on Windows using a Ryzen 7 5700X, 16 logical cores and 32 GiB RAM. Chrome's user agent and samples are in [`chrome-run.json`](../../tests/evidence/b03/chrome-run.json). The Playwright runner is [`tools/b03-chrome-check.mjs`](../../tools/b03-chrome-check.mjs); Playwright was installed temporarily with `--no-save` and is not a runtime dependency.

The visible run covered title → hub → play, four arrow-key movement directions and four WASD/arrow direction changes, a WASD diagonal, attacks aimed front/back/left/right, three-hit input, four cardinal dodge inputs, guard/parry, Ember, a real enemy update damage/hurt, the reward overlay and choice, a second-room transition, repeated real hits through KO, pause/resume, return to hub and settings. `DEV TEST TARGET`, `DEV SHOW TELEGRAPH`, and `DEV FORCE ROOM CLEAR` fixtures were used to isolate a stable enemy and reach review states; the hurt/KO calls use `CombatSession`'s actual attack/damage path. The test is not an ordinary unassisted run or human playtest.

Useful snapshots: [`front run`](../../tests/evidence/b03/chrome-front-run.png), [`back run`](../../tests/evidence/b03/chrome-back-run.png), [`left run`](../../tests/evidence/b03/chrome-left-run.png), [`right run`](../../tests/evidence/b03/chrome-right-run.png), [`front attack`](../../tests/evidence/b03/chrome-attack-front.png), [`back attack`](../../tests/evidence/b03/chrome-attack-back.png), [`hurt`](../../tests/evidence/b03/chrome-real-hit-hurt.png), [`KO result`](../../tests/evidence/b03/chrome-real-hit-ko.png), [`reward`](../../tests/evidence/b03/chrome-reward.png), [`reduced motion`](../../tests/evidence/b03/chrome-settings-reduced-motion.png).

Actual motion/video: [`continuous B03 title-to-gameplay sequence`](../../tests/evidence/b03/video/b03-live-gameplay.webm) and [`B02 runtime comparison sample`](../../tests/evidence/b03/video/b02-live-reference.webm). The B03 recording includes movement/combat/state transitions, reward, KO and return flow at normal playback speed. Chrome reported zero page exceptions, console errors, or failed requests in the Vite run and zero errors in the offline `file://` preview. The offline check decoded all five B03 atlases from files beside `standalone.html`; see [`chrome-offline-standalone.png`](../../tests/evidence/b03/chrome-offline-standalone.png). Screenshots were also captured at 1280×800, 1920×800 and 960×540. Physical gamepad: **NOT RUN — no hardware was connected.**

### Measured performance (not an approval pass)

Three 2.2-second Chrome `requestAnimationFrame` samples per renderer were taken at 1480×920 with movement and attack input held. These are monitor/compositor callback observations, not an FPS cap or a calibrated GPU benchmark.

| Renderer | Observed FPS per sample | Median frame time | P95 frame time | Maximum frame-time outlier |
|---|---:|---:|---:|---:|
| B03 | 221.3, 225.9, 229.5 | 4.2 ms | 4.7–8.4 ms | 11.9–16.3 ms |
| B02 | 211.8, 231.3, 213.1 | 4.2 ms | 4.4–8.4 ms | 12.3–108.4 ms |

B03 atlas PNGs total 4,355,088 compressed bytes. Decoded RGBA dimensions imply approximately 22,020,096 bytes before browser/GPU overhead. This is an estimate, not measured VRAM. B03 did not show a clear sustained slowdown in this short paired sample; the B02 108.4 ms maximum is an outlier. The observed callbacks varied and no display-refresh rate was independently measured. The sample is too short and workload too light to declare a performance pass; GPU/browser background conditions were not controlled. The comparison page uses the development-only B02 fallback query.

## Verification commands

Final clean-install verification: `npm ci` PASS; `npm run typecheck` PASS; `npm run build` PASS; `npm test` PASS (22/22); `npm audit` PASS (0 vulnerabilities); `git diff --check` PASS. The test suite also verifies that all five B03 atlases are copied into the offline preview output. The visible Chrome run above passed with no console/page errors or failed requests.

## Quality matrix

| Gate | Status | Evidence and remaining issue |
|---|---|---|
| Four distinct authored views; no B03 mirroring | PASS (technical) / PARTIAL (visual approval) | Contact sheets and real Chrome captures show front, back, right and left. Generated art remains proposed. |
| Diagonal facing and attack coherence | PARTIAL | Dominant-axis cardinal selection, vertical wins ties. Diagonals are not separately authored; attacks retain continuous aim. |
| Idle and run animation | PARTIAL | Four frames per direction are integrated; run is a loop of generated key poses. Dedicated start/stop and human-reviewed foot-contact are absent. |
| Dodge and combo | PARTIAL | Four cardinal dodge poses and 12 combo frames/direction are integrated. Third hit reads as a launcher; first two pose contrast/contact spacing need improvement. |
| Guard, parry, hurt, KO, Ember compatibility | PASS (runtime selection) / PARTIAL (visual quality) | Real state path appears in Chrome; generated pose quality and transitions need owner review. Ember remains a limited B02 prototype. |
| Frame cleanup and source provenance | PASS (repeatable bounded pipeline) / PARTIAL (art audit) | Rejected sheets retained; no connected-component deletion. Provider transcript/version unavailable; per-frame visual audit is not fully annotated. |
| Rendering transitions, scale and fallback | PASS (bounded technical) | Preload before RAF, B02 fallback, 70 ms crossfade and 100%/75% samples. Fallback-to-vector route is covered by resolver tests. |
| Keyboard/mouse and menu flow | PASS (bounded browser) | Visible Chrome script; no physical gamepad testing. |
| Performance | PARTIAL | Short paired B02/B03 samples are recorded; no calibrated GPU or long-load test. |
| Owner approval of appearance and game feel | NOT RUN / REQUIRED | Generated proposal; the owner must review visual quality, facing, feel and readiness. |

## B04 readiness

The technical system can support the next bounded combat/VFX/audio slice, but the **premium art foundation is not yet strong enough to call complete**. B04 can proceed only as a reviewable prototype slice if the owner accepts this state; a production-quality B04 should wait for stronger first/second hit distinction, diagonal attack presentation and an owner art/game-feel decision. No B04 work is included here.
