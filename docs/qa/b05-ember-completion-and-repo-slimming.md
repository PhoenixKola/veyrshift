# B05 Ember completion and repository slimming

Date: 2026-11-06

## Delivery

- Replaced the rejected off-model base northwest/southwest run strips with two ImageGen strips anchored to the canonical B03 Kairo turnaround and established run poses. The dark contact sheet was inspected after export; hair, jacket, sash, cuffs, and shoes remain consistent with Kairo.
- Rejected off-model Ember NW/SW strips remain outside the repository in the local archive. Ember NW/SW movement uses its left-facing fallback and is explicitly labeled in the atlas and manifest. It is not complete eight-way Ember art.
- Rebuilt 9 runtime atlases from 68 audited selected source cells. The atlas exporter records source bounds, detached pixels, and fallback directions. The four NW/SW turnaround cells remain source-audit only; they are not exported.
- Updated the asset ledger, current status, acceptance matrix, and retention policy. Historical evidence, rejected/proposed art, old concepts, and the previous review ZIP were moved to the adjacent local archive. The 197-file inventory records byte counts and SHA-256 checksums and was verified against the archived files.
- Prompts remain git-ignored.

## Repository archive measurement

Measurements use `git archive --format=zip` over a repository snapshot. The baseline snapshot is `32c63a8`, before this batch. The after measurement is the completed batch snapshot. This is the source ZIP payload; it does not reduce Git's historical object database, and history was not rewritten.

| Snapshot | ZIP bytes | Change |
|---|---:|---:|
| Before (`32c63a8`) | 274,773,926 | — |
| After (completed batch snapshot) | 140,893,583 | −133,880,343 (−48.72%) |

Moved items: 197 files, 137,821,568 original bytes. This includes 76,771,922 bytes of old browser evidence, 51,265,851 bytes of rejected/superseded art sources, 4,895,247 bytes of old public concepts, and the 4,888,548-byte handoff ZIP. See `archive-inventory.json` and `README.txt` in `E:\Programming\Projects\0. Extra\veyrshift-local-archive-2026-11-06` for the checksummed local copy. Active source masters and runtime atlases remain tracked.

## Verification

- `npm ci` — pass; 74 packages audited, 0 vulnerabilities.
- `python tools/build-b05-ember-production.py` — pass; 68 selected cells, 9 atlases.
- `npm test` — pass; 45/45.
- `npm run typecheck` — pass.
- `npm run build` — pass.
- `npm audit` — pass; 0 vulnerabilities.
- Focused headless Chrome proof on the rebuilt runtime — pass. All four diagonal facings work in base and Ember; base combo reduced the target from 1000 to 936 HP; Ember activation, combo damage, special, finisher, and reversion completed. No page errors or failed requests. Machine report and normal-speed videos are in ignored `tests/evidence/b05/live-chrome/ember-production-after-effects-2026-11-06T22-16-47-404Z/`.
- Broad Chrome QA — 59/61 checks pass, with no console errors, page errors, failed requests, or bad responses. The two failures are the existing rig-cutout proof timing out at 100% and 75% viewport; B05 form/showcase checks passed. Human visual, audio, and game-feel approval remain pending.

## Remaining approval blockers

This delivery is a production candidate, not a finished form approval. Ember still lacks authored NW/SW diagonal art, directional attacks beyond the existing cardinal coverage, and new VFX textures. The Ember NW/SW reuse of left-facing art is a known visible limitation. The owner must review the exported contact sheets and gameplay, and listen to the game audio before visual/tactile/audio acceptance.
