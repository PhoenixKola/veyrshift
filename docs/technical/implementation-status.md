# Implementation status - current through B02 (2026-11-05)

## Scaffold baseline verification (historical - before B00)
- `npm run preview:build`: passes using installed global TypeScript compiler (no registry packages needed).
- `npm run test`: 9 core tests pass (deterministic RNG, geometry, six-hero/42-form metadata, safe save parse, manual attack damage, dash, form sample, reward, victory).
- `python3 tests/browser-smoke.py`: passes using Chromium via injected standalone JS (same simulation/render code). Smoke enters game, moves/aims/attacks, pauses/resumes and captures evidence. No observed browser JS exceptions.
- Screenshots: `tests/browser-hub.png`, `tests/browser-combat.png`. Screenshots show **temporary proxy art**, not finished art quality.

## Initial scaffold gaps (historical - before B00)

These notes describe the pre-B00 scaffold state; B00/B01 evidence below supersedes the verification statements.
- React/Vite `npm install`, `npm run typecheck`, `npm run build` cannot be run in this sandbox because npm registry DNS resolution failed. Run first in a connected environment. There is not yet a valid generated package-lock.
- `src/app/App.tsx` is the intended production shell but currently unverified beyond source inspection; do not claim it ships.
- No final playable full MVP; current mini-loop is three rooms and one prototype character, not 18–25 minutes.
- No approved master sheets, finished animation atlases, licensed/provenance-cleared music, authentic form VFX, major boss, second hero, room branching, rich build system or user-approved visuals.
- 41 form records are `planned`, one (Ember Drive) is `prototype` only; none meets V2's shippable full form quality contract.
- No true IP uniqueness certification. No completed trademark, domain or store availability review.

## Initial handoff (completed)

The B00 handoff ran on 2026-11-05; B01 work and current evidence are recorded below.

## B00 work log — 2026-11-05

- `npm install` succeeded and generated `package-lock.json`. Vite was updated from 6.3.5 to 6.4.5 after `npm audit` reported a high-severity advisory; the post-update audit reported 0 vulnerabilities.
- `npm run typecheck` and `npm run build` passed. The first `npm test` runs exposed Windows portability issues in the nested npm script, Python launcher and default text encoding. Test scripts now call preview steps directly; the bundler honors `PYTHON`, otherwise uses `python` on Windows / `python3` elsewhere, and forces UTF-8 for project files.
- The actual Vite app was loaded in visible Google Chrome at 1480 × 980 and 1110 × 740. Hub/start, keyboard movement, pointer attack input, pause/resume, abandon-to-hub save, and reload persistence were exercised. Native-scale, 75%-viewport and grayscale captures are in `tests/evidence/b00/chrome/`. A missing favicon request found in the first run was fixed with `public/favicon.svg`; the follow-up run has no failed requests or page exceptions.
- Python Playwright is not installed, so `python3 tests/browser-smoke.py` was not run. The optional Node Playwright runner used installed Google Chrome; Playwright was installed `--no-save` and is not a runtime or project dependency.
- Two OpenAI built-in image-generation proposals are under `public/assets/_b00-concepts/` and recorded in the provenance ledger. They are proposals only and are not canonical or approved assets.
- Interim renderer recommendation: keep Canvas2D through the next bounded combat-feel slice; do not perform an engine rewrite in B00. Phaser/alternative spike, performance comparison and final renderer lock remain unverified/pending. Ember Drive still fails the full transformation contract. Owner visual and tech signoff is still required.
- Detailed commands, browser actions, image prompts, screenshots and gate statuses are in [`docs/qa/b00-evidence.md`](../qa/b00-evidence.md), [`docs/technical/b00-runtime-evaluation.md`](b00-runtime-evaluation.md), and [`docs/art/b00-style-comparison.md`](../art/b00-style-comparison.md).

## B01 work log â€” 2026-11-05 (owner approval pending)

- Replaced the player-facing dashboard with a full-viewport title, pre-run hub, Kairo record, Forms/Records pages with honest prototype/locked content, settings and credits. Gameplay uses a full-viewport fixed-proportion Canvas arena with minimal native HUD and pause/reward/result overlays. Fullscreen is offered from the hub.
- Added keyboard arrows + WASD, mouse aim/attack, a standard gamepad mapping and menu focus handling. Gamepad API mock exercises UI navigation. No physical controller was connected; hardware testing is **NOT RUN**. Blur releases held inputs and pauses gameplay. Settings schema v2 migrates v1 records and persists volumes/effects/accessibility preferences.
- Generated a dedicated Kairo master, separately generated idle/punch/dodge/Ember stills, a Rift Wisp and title illustration. Optimized runtime exports load in the running Canvas game and hub. These assets are proposals. Current state poses are not animation sequences, movement still uses procedural bobbing, and owner style approval is absent.
- Added a dev-only same-scene Canvas2D vs Phaser 3.90.0 comparison page (`renderer-proof.html`) with frame-cadence and render-interval instrumentation. See ADR-008 and `docs/technical/b01-renderer-evaluation.md`; results support no final engine winner. Phaser does not ship in the production bundle.
- Expanded tests to 16 deterministic checks including screen transitions, v1 save migration, gamepad dead zone/edge/aim/action indices, melee arc hitbox and telegraph/dash invulnerability. The separate dev fixture was used only to exercise reward/result overlays; it is not ordinary combat UAT.
- B01 acceptance evidence, screenshots, browser action list, recorded asset prompt briefs/provenance and signoff gates are in [`docs/qa/b01-evidence.md`](../qa/b01-evidence.md). Verbatim generator prompts were not exposed for archival. Do not proceed into B02 production expansion until the owner reviews the art, renderer evidence and game feel.


## B02 work log ? 2026-11-05 (prototype implemented; owner review pending)

- Replaced in-game pose swapping with five source-grid-derived Canvas atlases: idle (8), run (8), combo (12: four phases for each of three hits), dodge (6), and supporting states (8: guard, hurt, KO, Ember anticipation/active). Source sheets are separate in `art-source/b02/`; runtime atlases are optimized to 128?160 cells under `public/assets/characters/kairo/b02/`.
- Added a repeatable grid-slicing pipeline with per-frame alpha bounds, proportional downscale and bottom-center anchoring. It removes only disconnected alpha components below 0.6% of a source cell; the exact source grid and removed component areas are recorded in `docs/art/b02-animation-manifest.json`. Contact-sheet QA is in `tests/evidence/b02/kairo-animation-contact-sheet.png`.
- Refined the live controller to advance combat at a bounded 60 Hz fixed step and retain button edges until a simulation step. Melee uses a 75 ms startup, delayed directional arc check, hitstop and a 190 ms attack press buffer. The three strikes use distinct animation ranges; the third is a stronger launcher. Dash cancels a pending swing, retains 260 ms of invulnerability, and has a six-pose cycle plus restrained streaks.
- Added readable guard, hurt and KO poses, enemy recoil/squash, hit-confirm particles/audio, and a 720 ms Ember Drive anticipation/burst/ready presentation. Ember Drive remains a limited prototype and does not meet the full form quality contract.
- Browser art remains a single three-quarter facing with horizontal mirroring; it does not yet contain authored eight-direction art. The generated run poses are keyframes, not rigged/interpolated animation. Frame-specific collision shapes, hitbox-to-pose alignment, art cleanup beyond disconnected alpha specks, production audio and physical-controller feel remain unproven.
- `npm test` now includes 19 deterministic cases, including three-hit buffering, directional hit checks, hitstop, dash invulnerability, save/room flow and KO state. Full B02 command results, actual Chrome interactions, screenshots/video, and remaining gates are recorded in [`docs/qa/b02-evidence.md`](../qa/b02-evidence.md).
- Visual style, art quality, combat feel, and animation scalability still require owner signoff. These generated assets are not approved master art.

## B03 Kairo directional animation — 2026-11-06 (implementation reviewable; owner approval pending)

- Added original generated turnaround/source grids for four authored cardinal views: front/toward, right, back/away and left. Integrated idle, run, dodge, three-hit combo, guard, parry, hurt and KO atlas frames in the real Canvas game. No B03 view is horizontally mirrored. The diagonal policy selects the dominant axis (vertical wins ties), so there are four authored directions, not eight.
- Added `src/game/core/direction.ts` and presentation-only `src/game/animation/animationResolver.ts`; movement facing and incoming-hit facing are retained separately. Simulation continues to own attack, dash, invulnerability, guard, hitstop and KO timing. `CanvasRenderer` preloads the new atlases before starting its loop, uses 70 ms state/facing crossfades, and retains B02 plus vector fallback paths.
- `tools/build-b03-animation-assets.py` creates five 192×256-cell atlases, a JSON frame/pivot/component manifest and contact sheets. Alpha floor is 32; components are reported and never deleted automatically. Configurable pivots live in `tools/b03-frame-overrides.json`. Several bad generated sheets were rejected and retained rather than cropped into runtime.
- Generation tool/version, seed, and exact submitted prompt transcript were not exposed; reconstructed prompt briefs are labeled as such. No external legal/originality clearance or owner art approval is claimed.
- Visible Chrome 156 ran the actual Vite app from title through game. Arrow and WASD directions, diagonal movement, four attack aims, combo, four-way dodge, guard/parry, Ember compatibility, actual enemy damage/hurt, reward selection, a second chamber, repeated real damage through KO, pause/resume, return to hub and reduced-motion settings were exercised. Dev fixtures isolated combat/reward states. Viewports: 1480×920, 1280×800, 1920×800 and 960×540. Zero console/page errors or failed requests. Browser captures and video are under `tests/evidence/b03/`.
- Paired short movement/attack RAF samples on Chrome 156 / Ryzen 7 5700X: B03 three samples around 221.3–229.5 observed callbacks/s, 4.2 ms median, 4.7–8.4 ms P95, 11.9–16.3 ms max. B02 comparison: around 211.8–231.3 callbacks/s, 4.2 ms median, 4.4–8.4 ms P95, with one 108.4 ms max outlier. Display refresh and GPU were not measured; this is not a performance acceptance pass. B03 PNGs total 4.36 MB compressed; their decoded RGBA pixel estimate is ~22.0 MB before overhead.
- `npm test` was expanded to 22 deterministic checks covering directional mapping/no mirroring, animation state priority/timing, fallback and atlas references, while retaining combat tests for hitboxes, iframe, save, reward, and KO. Final clean-install verification: `npm ci`, `npm run typecheck`, `npm run build`, `npm test` (22/22) and `npm audit` (0 vulnerabilities) all pass; `git diff --check` is clean.

**Remaining gates:** diagonal attack poses use nearest cardinal art while the hit arc retains a continuous angle; combo hit 1/2 need stronger pose distinction; run has no dedicated start/stop or foot-contact events; no full frame-by-frame human pivot/consistency audit exists; generated master/sheets remain proposals; physical gamepad test is not run. The B03 acceptance matrix is therefore **PARTIAL**, and owner visual/game-feel approval remains **NOT RUN / REQUIRED**. B04 can use the technical pipeline for a bounded prototype only if the owner accepts this state; a production-quality combat art foundation still needs the listed refinements and signoff.
