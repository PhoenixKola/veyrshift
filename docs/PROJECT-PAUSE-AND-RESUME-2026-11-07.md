# Project Veyrshift — Pause and Resume Handoff

**Status: PAUSED — NOT FINISHED.** Date: 2026-11-07. This is a documentation checkpoint; it does not approve B05 or authorize B06.

## A. Identity and decisions to preserve

Veyrshift remains an independent original 2.5D, HD anime/cel-shaded, top-down/isometric manual-action roguelite project. It is paused independently of the owner's separate new game project. Its original heroes, mechanical transformations, combat direction, and long-term roadmap remain in force. This is not a cancellation, pixel-art conversion, release, or completed game.

The unchanged design authority is [`docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md`](project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md). The current expansion notes are in [`docs/technical/roadmap-addendum-2026-11-06.md`](technical/roadmap-addendum-2026-11-06.md). Preserve V2 verbatim. The six-hero / 42-form ambition is long-range metadata, not implemented content: only Kairo's prototype is playable, and there is no owner-approved master character art. Hades and Dragon Ball remain high-level genre/power-fantasy references only; all characters, story, UI, effects, and names must remain original.

## B. Verified technical state

### Stack, install, and run

- Browser app: React 19.1, TypeScript 5.9, Vite 6.4, and a portable Canvas2D renderer. Phaser 3.90 is a development dependency used by the old renderer comparison harness; it is not the production renderer. B00 did not lock a final engine or approve an engine rewrite. There is no Electron runtime dependency.
- `package.json` requires Node.js 22 or newer. This machine reported Node `v22.22.0`, npm `11.11.0`, and Python `3.12.10` during this checkpoint. The exact dependency lock is `package-lock.json`.
- From the repository root, install with `npm ci`, then start the actual app with `npm run dev`; Vite binds to `127.0.0.1` and normally prints `http://127.0.0.1:5173/`. Open that URL in a desktop browser. The browser runtime does not require Node or Electron after the page loads.
- Python 3 is used by the art-export and offline-preview tools. Use the tool-specific Python libraries already documented by those scripts if rebuilding art. Local Chrome is required for the repository's headed Chrome QA command. Audio begins after browser user interaction.

The tracked snapshot contains 301 files, approximately 140.5 MiB total before `.git`, dependencies, and ignored recordings. `art-source/` accounts for about 115.7 MiB and `public/` about 21.7 MiB. The rest is mostly source, tests, tools, and documentation.

### What is playable and what remains a prototype

The actual Vite app has a title/hub, Kairo record and Forms screens, a short combat/room loop, manual attacks, enemy telegraphs, dodge/guard/parry, abilities, rewards/results, pause/settings, and local profile persistence. Kairo's base kit includes a three-hit melee chain, bolt, shockwave, dash, guard/parry, and Pulse finisher. The two selectable Kairo form prototypes are Ember Drive and Glass Current; Glass unlock progress is tied to successful parries. A run snapshots its equipped form. These mechanics have automated and headless-browser evidence, but that evidence does not establish good combat feel or visual quality.

This is not the V2 MVP route. The six heroes, 42 long-range form ideas, two playable-hero plan, branching authored route, full enemy roster, boss phases, deep build system, and polished replay loop are not implemented. The dev showcase creates targets and resets state for proof; those scripted targets/resets are not ordinary campaign content. No form currently satisfies the complete V2 quality contract.

### Controls confirmed in `src/game/runtime/InputController.ts`

- Move: WASD or arrow keys. Mouse position aims; left click attacks and right click fires the bolt. Keyboard alternatives are Space/J for attack and K for bolt.
- Shift: dodge; E: guard/parry; Q: shockwave; R: activate/end the equipped form; F: finisher; Enter: interact; Escape: pause.
- Standard Gamepad API mapping exists in `src/game/runtime/gamepadMapping.ts`: left stick moves, right stick aims, A attacks, B dodges, X shockwave, Y interacts, LB guards, RB fires bolt, LT uses finisher, RT transforms, and Start pauses. Menus also read the D-pad and left stick. No physical controller has been tested; these are source mappings, not hardware signoff.

### Persistence, entry points, and QA routes

Save data is browser `localStorage` under `veyrshift-save-v1`, with payload schema v3 and v1/v2 migrations. It stores settings, unlock/equip state, and profile counters. It is local to that browser profile/origin; there is no cloud sync, export, or run suspend/resume. Clearing browser storage can remove it. A run's active combat state is not persisted.

Useful entry points are `src/main.tsx`, `src/app/App.tsx`, `src/game/runtime/GameController.ts`, `src/game/runtime/CombatSession.ts`, `src/game/runtime/InputController.ts`, `src/game/render/CanvasRenderer.ts`, `src/game/animation/animationResolver.ts`, and `src/game/storage/save.ts`. Simulation/data live under `src/game/core/` and `src/game/data/`; WebAudio synthesis is in `src/game/audio/synth.ts`.

Current scripts in `package.json` include `npm run typecheck`, `npm run build`, `npm test`, `npm run verify:offline`, `npm run preview:build`, `npm run preview:serve`, `npm run qa:chrome:self-test`, `npm run qa:chrome:local` (headed), and `npm run qa:chrome:headless`. `npm run dev` is the normal game route. The focused B05 Vite harnesses use `?b05showcase=1` and `?dev=1`; they are test routes, not campaign content. QA recordings are written beneath `tests/evidence/`, which `.gitignore` excludes.

The simulation uses seeded randomness and a fixed 1/60-second update through `GameController`; the renderer and React UI consume simulation snapshots/events. Replay serialization, cross-browser floating-point guarantees, long-frame stress behavior, tab-suspension recovery, input rebinding, and physical-controller behavior remain open. Browser save data is local-only.

## C. B05 status — unfinished and unapproved

B05 remains **PARTIAL / PLAYABLE CANDIDATE / HUMAN REVIEW REQUIRED**. Base Kairo's animation consistency and combat feel still need a professional-quality improvement and owner review. Neither Ember Drive nor Glass Current is artistically complete or approved.

- **Ember Drive:** selected/generated art covers some movement and attack states, including newer base/Ember diagonal travel and right-facing combat frames. It is not complete, consistent eight-direction art. Asymmetric details still need correction in uncovered/fallback directions. Smooth special, finisher, hurt, KO, activation, expiry, and transition animation coverage is incomplete. Strong art-matched VFX and authored audio are still open; current sound cues are synthesized WebAudio, and the browser recordings have no audio track.
- **Glass Current:** its runtime uses a candidate based on the older Glass turnaround and partial four-direction atlases. The selected Glass concept has not received equivalent final playable art/animation production. The Glass A concept file noted by older art documents is absent from the tracked `art-source/b05/visual-breakthrough/` tree at this checkpoint; its external availability could not be checked because the cited archive is absent. Do not treat a concept image or current atlas as an approved master.
- **Animation-method gates:** independent full-body pose grids showed long holds, anchor/scale jumps, and inconsistent motion; those drafts failed the fluid-motion gate. The Blender/rigged-3D pilot was blocked before modeling because no Blender executable or `bpy` installation was found. Generated isolated 2D parts failed composition review with waist gaps, detached-looking joints, stiff symmetry, and identity/silhouette drift. The later assembled-layer arm pilot also failed: inpainted hidden anatomy blurred, the cuff/hand separated, and the torso did not transfer weight. Do not present any of these experiments as a working production solution. See [ADR-020](technical/adr-020-rigged-3d-sprite-pilot-feasibility.md), [ADR-021](technical/adr-021-native-2d-skeletal-pilot-art-gate.md), and [ADR-022](technical/adr-022-assembled-first-art-gate.md).
- **Chrome evidence and limits:** the latest broad local report at `tests/evidence/b05/live-chrome/run-2026-11-06T22-13-20-956Z-pid24196/qa-report.json` ran Chrome 156.0.8078.80 headless on Windows at 1280×720 from 2026-11-06 22:13:20Z to 22:15:39Z. It reports 59/61 checks: all ordinary-game and form-showcase checks passed, and the only two failures were `page.waitForFunction` timeouts at 9 seconds in the optional `rig-cutout-100` and `rig-cutout-75` proof. Browser telemetry reported no console errors, page exceptions, failed requests, or HTTP errors. This is a bounded automated run, not an app-wide failure and not a full pass.
- A later focused headless Chrome capture at `tests/evidence/b05/live-chrome/ember-production-after-effects-2026-11-06T23-01-43-457Z/` exercised four diagonal directions, base three-hit damage (1000→936), and Ember activation/combo/special/finisher/reversion; recorded scene error arrays were empty. The 2026-11-07 assembled-first decision report likewise records 1000→936 from existing base combo contacts (14 + 19 + 31). These prove existing mechanics/capture only, not an animation improvement or acceptance.
- Headed owner review of normal-speed gameplay, animation, audio, and tactile feel remains pending. Audio listening, physical-controller testing, external likeness/IP clearance, and owner approval remain NOT RUN. The tracked summaries are [`docs/qa/b05-animation-vfx-production-evidence.md`](qa/b05-animation-vfx-production-evidence.md), [`docs/qa/b05-completion-evidence.md`](qa/b05-completion-evidence.md), and [`docs/qa/b05-assembled-first-animation-decision.md`](qa/b05-assembled-first-animation-decision.md). The local reports above are newer than some tracked summaries and are ignored by Git.

## D. Assets, provenance, and preservation

- Identity reference candidate: `art-source/b03/kairo-base-turnaround.png`. It is an identity anchor, not an owner-approved master. Asset approval/provenance is tracked in [`docs/art/asset-provenance.md`](art/asset-provenance.md); the broad original direction is [`docs/art/visual-bible.md`](art/visual-bible.md).
- Current B05 form-source candidates are under `art-source/b05/review/`; the art-first corrective sources are under `art-source/b05-ember-production/{base,ember}/`. The source/runtime maps and states are recorded in [`docs/art/b05-animation-manifest.json`](art/b05-animation-manifest.json) and [`docs/art/b05-ember-production-manifest.json`](art/b05-ember-production-manifest.json). Reproducible builders are `tools/build-b05-art.py` and `tools/build-b05-ember-production.py`; `tools/build-b05-visual-breakthrough.py` reproduces the separate rejected pose-proof artifacts.
- `CanvasRenderer` loads the art-first base/Ember atlases at `public/assets/characters/kairo/b05-ember-production/`: base and Ember idle/run/combo, plus Ember activation/special/finisher. The Ember art-first additions only cover selected directions/states. The candidate form atlases at `public/assets/characters/kairo/forms/{ember-drive,glass-current}/` contain idle/run/combo/dodge/guardParry/bolt. Glass currently draws from those candidate atlases; Ember uses them for uncovered/supporting states and directions when the art-first atlas does not apply. `public/assets/vfx/b05/{ember-drive,glass-current}/` provides six generated form-effect textures per form; base effects are under `public/assets/vfx/b04/`. These are runtime proposals, not approved production masters.
- The current form-body atlases reference `art-source/b05/review/ember-drive-turnaround-v2.png` and `glass-current-turnaround-v3.png`; separate Ember reinterpretation and Glass concept proposals are not equivalent final runtime animation. The full source/asset history is in the manifests and provenance ledger. The audio path is synthesized in `src/game/audio/synth.ts`; there are no finished music recordings or approved authored SFX.
- The B05 slimming report says 197 files (137,821,568 original bytes) were moved to `E:\Programming\Projects\0. Extra\veyrshift-local-archive-2026-11-06\` and an SHA-256 inventory was checked then. That directory is **not present at the cited location now**; its manifest, files, checksums, and approximate current size could not be verified. The assembled-first review ZIP at `E:\Programming\Projects\0. Extra\veyrshift-b05-assembled-first-review-2026-11-07.zip` is also absent. No archive or review package was restored or copied. No off-repo material is backed up to GitHub by this handoff.
- The latest broad ignored Chrome folder is about 38.8 MiB; the later focused folder is about 9.7 MiB. Their WebM files, screenshots, and JSON reports may disappear with this machine and are not part of the remote. Recreate essential evidence with `npm run qa:chrome:local` for headed review or `npm run qa:chrome:headless` for supplementary automation. Keep the audio review separate because Playwright WebM captures contain no audio. `prompts/` is intentionally ignored; the current B05 prompt may not be available in a fresh clone.
- A suggested owner-managed backup destination is an external drive or approved private backup folder such as `F:\Backups\Veyrshift\2026-11-07\`. This is only a suggestion; that destination was not checked or created. Do not restore the reported 197 files into the slimmed repository merely to preserve them again.

## E. Resume checklist

1. Read this handoff, the unchanged V2 vision, current implementation status, architecture, roadmap addendum, B05 QA reports, and both B05 art manifests before proposing work. Read the ignored current prompt only if it is present locally.
2. Confirm the pause tag/remote state, source integrity, clean install, typecheck, build, and unit tests. Start `npm run dev` and inspect normal-speed play in local Chrome; automated/build success is not visual or tactile signoff.
3. Ask the owner for a fresh visual assessment. Old screenshots, contact sheets, and headless clips do not replace current review.
4. Select one tightly scoped animation-production method. First show one convincing, normal-speed in-game combo and transformation at actual gameplay scale, including direction changes and the real hit, before producing more states or directions.
5. If AI-only animation still misses the HD art bar, consider a targeted professional 2D keyframe/paintover handoff with source-locked Kairo identity and painted overlap anatomy. Do not repeat the failed autonomous rig or generated-part experiments without new evidence.
6. Keep B05 open until gameplay, animation, VFX, audio, and owner-approved visual/game-feel gates pass. Only then consider B06.

Suggested initial commands:

```powershell
git fetch origin
git status --short
git rev-parse 'veyrshift-paused-2026-11-07^{}'
npm ci
npm run typecheck
npm run build
npm test
npm run dev
```

`npm run qa:chrome:self-test` and then `npm run qa:chrome:local` reproduce the local QA route; reserve time for a person to watch and listen.

## F. Checkpoint record and verification

Read-only checkpoint verification before this document was added:

- Branch: `main`.
- Local HEAD: `ed09ec68628cd60f97ea25232757fb780e35c0cc` (`2026-11-07`, `docs: record assembled-first animation art gate`).
- `origin` fetch/push URL: `https://github.com/PhoenixKola/veyrshift.git`.
- After `git fetch origin`, `origin/main` was the same SHA. `git rev-list --left-right --count HEAD...origin/main` returned `0 0`; `git status --short` was empty.
- `git tag --list` returned no tags before this pause checkpoint. The annotated checkpoint tag is `veyrshift-paused-2026-11-07`. Resolve its exact commit with `git rev-parse 'veyrshift-paused-2026-11-07^{}'`; a document cannot embed its own commit SHA without changing that SHA.
- The pause task itself ran the Git status/fetch/relationship checks, local Node/npm/Python version checks, tracked file-size inventory, archive-path checks, and parsed the ignored latest Chrome reports described above. It did **not** rerun `npm ci`, builds, unit tests, art generation, or browser QA. All B05 pass/fail results in this handoff are copied from the dated tracked or ignored reports and are labeled as such.
- After publication, verify with `git fetch origin`, `git ls-remote origin refs/heads/main refs/tags/veyrshift-paused-2026-11-07 'refs/tags/veyrshift-paused-2026-11-07^{}'`, and `git rev-parse 'veyrshift-paused-2026-11-07^{}'`; remote `main` and the peeled tag should resolve to the handoff commit. This document alone is the intended tracked change for the pause checkpoint; `prompts/`, generated evidence, and production code/assets are not part of it.

## Reading order for the next session

1. `docs/PROJECT-PAUSE-AND-RESUME-2026-11-07.md`
2. `docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md`
3. `docs/technical/implementation-status.md`
4. `docs/technical/architecture.md` and `docs/technical/roadmap-addendum-2026-11-06.md`
5. `docs/art/visual-bible.md`, `docs/art/asset-provenance.md`, `docs/art/b05-animation-manifest.json`, `docs/art/b05-ember-production-manifest.json`
6. `docs/qa/b05-assembled-first-animation-decision.md`, `docs/qa/b05-animation-vfx-production-evidence.md`, `docs/qa/b05-completion-evidence.md`
7. Any current ignored `.md` prompt under `prompts/`, if still present.
