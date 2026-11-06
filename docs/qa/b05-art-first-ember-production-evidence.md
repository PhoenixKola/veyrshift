# B05 art-first Ember production evidence — 2026-11-06

**Verdict: PARTIAL.** Newly generated character art is integrated into ordinary Vite gameplay. The work is not a completed eight-direction combat set or a premium Ember approval. Owner visual, feel, and audio signoff remain pending.

## Source and runtime proof

The 19 selected original source PNGs under `art-source/b05-ember-production/{base,ember}/` total 25,164,441 bytes. They contain 76 selected new figure cells: eight distinct diagonal still drawings, 32 diagonal run drawings, 24 base/Ember right-facing combo drawings, and 12 Ember right-facing action drawings. Nine runtime WebP atlases under `public/assets/characters/kairo/b05-ember-production/` total about 3.1 MB. See `docs/art/b05-ember-production-manifest.json` for each source SHA-256, crop, cell border audit, and atlas dimension. Four dark/light gameplay-size direction contact sheets are under `docs/art/`.

Two attempted 4-by-4 run grids were rejected for adjacent figure contamination. Four Ember strips received explicit cell cuts where equal quarters split a body. Every selected source cell has zero main-body border pixels at the alpha threshold. The inspector found an orientation mistake in NW/SW output, so those distinctive body frames are mirrored in the runtime atlas. Asymmetric hair/costume orientation is consequently provisional; the eight-way visual gate remains partial. Automated connected-component checks cannot prove correct hands, head direction, footwear, fluidity, or appeal.

## Real-game Chrome evidence

`tools/b05-ember-production-qa.mjs` started the actual Vite game in Chrome headless, pressed W+D/W+A/S+D/S+A, made manual base punches, activated Ember with R, attacked, used Q and F, and reverted with R. Both corrected-candidate runs passed their scripted assertions with no page errors or failed requests:

| Run | Settings | Evidence |
|---|---|---|
| `ember-production-after-body-only-2026-11-06T21-13-06-208Z` | Particles off | Normal-speed WebM for eight-way travel, three base punches, Ember activation/combo/special/finisher/reversion. Base test target HP 1000 → 936; Ember target 1000 → 807. |
| `ember-production-after-effects-2026-11-06T21-14-35-394Z` | Particles on | Matching normal-speed WebM for the same real-game inputs. Existing effects are visible; this batch made no new VFX texture. |

The prior pushed B05 real-game clips from `ember-polish-after-2026-11-06T20-12-09-311Z` provide a before reference. [The review ZIP](../../handoff/b05-art-first-review.zip) contains three normal-speed, before-left/after-right comparisons with particles enabled; three body-only current clips; dark/light contact sheets; source/runtime manifest; and two 75% Chrome screenshots. Browser start/frame schedules are not frame-locked. All WebM recordings are video-only. The ZIP is about 4.9 MB. The large raw browser directories remain ignored by Git.

The broad `node tools/b05-chrome-local-qa.mjs --headless --url http://127.0.0.1:5175/` run recorded 70 PASS and one FAIL: `showcase-matrix-glass-current-75-midtone-normal: active gameplay frame captured`. Its telemetry had no JS errors, failed requests, or bad responses. A prior concurrent broad run additionally timed out on page navigation, so its result is not used as the final broad result. The failing Glass frame check is recorded in the included broad QA JSON; Glass was outside this corrective batch. The broad run captured a real ordinary-game 960×540 screenshot and Ember 75% showcase screenshot.

## Acceptance gates

| Gate | Result | Evidence / blocker |
|---|---|---|
| New art | PASS as candidate | 19 sources, 76 selected figure cells, nine runtime atlases; new drawings visible with particles off. |
| Eight-way travel | PARTIAL | Four distinct new diagonal source views and run cycles per form. NW/SW runtime flips reverse asymmetry; cardinal run rows remain legacy. |
| Base combo | PARTIAL | New 12-cell right-facing chain and active-window timing. Other attack directions and diagonal aim are legacy. Fluidity awaits visual review. |
| Ember combo | PARTIAL | New armored 12-cell right-facing chain; other directions use legacy. |
| Ember special + finisher | PARTIAL | Four new right-facing body frames per action; legacy directions and existing VFX textures. |
| Activation/reversion | PARTIAL | New right-facing four-stage strip, reversed for reversion; other directions crossfade. |
| Runtime | PARTIAL | Focused ordinary-game Chrome passed; broad suite 70/71, one Glass frame check failed. Saves, hitboxes, iframes, controller mapping, sound settings, and HUD were not intentionally changed. |
| Evidence | PARTIAL | Source audit, four contact sheets, normal-speed before/after and body-only real-game clips, 75% screenshots in review ZIP. Owner visual/feel/audio approval pending. |

## Commands

- `python tools/build-b05-ember-production.py` — exported 76 cells and nine atlases.
- `npm run typecheck` — PASS.
- `npm run build` — PASS.
- `npm test` — 45/45 PASS, including new direction, atlas-manifest and fallback tests.
- `npm audit --audit-level=moderate` — 0 vulnerabilities.
- Focused Chrome QA with particles enabled and disabled — PASS as described.
- Broad Chrome QA — 70/71 checks pass; one Glass screenshot check fails.
- `python tools/build-b05-art-review.py ...` — ZIP produced and integrity checked.

The owner should inspect the included normal-speed clips and play the headed Chrome build for input feel. Listen to Ember actions in the headed game or record system sound; headless WebM has none. The V2 complete-form contract and original-IP commercial review remain open.
