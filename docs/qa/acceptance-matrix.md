# QA gates (beginning of evidence matrix)

| Item | Status | Evidence / gap |
|---|---|---|
| Compiled TS preview | PASS | `npm run preview:build` |
| Core tests | PASS | 9/9 `node --test` |
| Chromium start/move/attack/pause/resume | PASS (smoke only) | `tests/browser-smoke.py`, screenshots |
| React + Vite installed and built | BLOCKED | npm registry unavailable in scaffold environment; agent to verify |
| User accepts camera and hero art | NOT RUN | B00 style gate |
| Kairo premium animation combat feel | NOT RUN | B02 / B03 |
| Original IP / commercial name clearance | NOT RUN | Preliminary only; professional review may be appropriate |
| Ember Drive meets full V2 form contract | FAIL / PROTOTYPE | Simple timed modifier and rings, not unique complete moveset |
| Full 2-hero/4-form MVP | NOT RUN | Later batches |
| Full game visible Chrome hands-on UAT | NOT RUN | B13; automated browser smoke is NOT substitute |

## B00 evidence update — 2026-11-05

| B00 criterion | Status | Evidence / limitation |
|---|---|---|
| Truthful repo assessment | PASS | Source and module paths inspected; six heroes/42 forms are data records, Ember Drive is a prototype only. |
| Working React/Vite foundation | PASS | `npm install`, `npm run typecheck`, `npm run build`; actual Vite app opened in Google Chrome. Vite upgraded to fixed 6.4.5; `npm audit` clean. |
| Shared React/preview behavior | PASS (bounded) | Both paths compile from shared TypeScript runtime; Chrome hub/start, movement, pointer input, pause/resume and save reload passed. Full reward behavior parity not exercised. |
| Render feasibility in actual game | PASS (prototype scope) | Chrome captures show projected Canvas stage, ground shadows, actor y-sort, enemy tell, strike/input, grayscale proxy, native and 75% viewport. No authored sprite atlas or Phaser comparison. |
| Two original art direction proposals | PASS (proposal only) | Two generated concept boards and style comparison doc. Owner visual approval is pending; proposals are not production assets. |
| Transformation preview quality contract | BLOCKED | Boards show an Ember Drive concept activation sequence, but no in-game anticipation/burst/recovery proof; runtime Ember Drive remains a timed modifier/aura prototype and fails V2 quality contract. |
| IP / provenance | PASS (ledger documented; legal clearance NOT RUN) | Original prompt-led concept boards are recorded as proposed; names/title and likeness remain uncleared. |
| Tests and real input | PASS (9 core); PARTIAL browser | `npm test` passes 9/9 after Windows script fix. Chrome smoke passed key/mouse movement, click, pause, resize and save reload. Hitbox/iframes/reward-selection/full-run UAT not covered by B00. |
| No scope creep | PASS | No other hero/form, boss, engine migration, or final release content was implemented. |

**Gate:** B00 is **not approved**. Owner visual choice and a bounded Phaser (or supported alternative) comparison remain required before final renderer/style lock; B02/B03 production scope should wait for owner review.

## B01 gate — 2026-11-05

| B01 item | Status | Evidence / limitation |
|---|---|---|
| Player title and hub replace dashboard | PASS (prototype) | Actual Vite/React in Chrome; title/hub screenshots in `tests/evidence/b01/chrome/`. Owner presentation approval pending. |
| Character, Forms, Records, Settings, Credits routes | PASS (honest prototype scope) | Actual menu interactions and screenshots; only Kairo is playable, other form content remains locked/catalog-only. |
| Responsive full-viewport gameplay and overlays | PASS (technical fit); PARTIAL (visual approval) | Chrome at 1480×980 and 1110×740; no scroll overflow; reward/pause/victory screenshots. |
| Arrow/WASD/mouse combat and pause | PASS (bounded browser input) | Chrome script exercised both movement maps, pointer attack/ranged, dash, guard, special, finisher and pause/resume; hitbox and iframe unit coverage added. Manual game-feel signoff pending. |
| Gamepad mapping, menu navigation, disconnect semantics | PASS (synthetic mapping); NOT RUN (hardware) | Mapper unit test plus browser `navigator.getGamepads` mock for d-pad/A menu navigation. Physical controller unavailable. |
| Settings and legacy save migration | PASS | Chrome values reloaded from localStorage; v1→v2 and volume/deadzone tests pass. Music is disabled because no music track exists. |
| Generated Kairo art in live game | PARTIAL | Title/hub and generated single poses appear in Canvas combat. No generated loops, frame-by-frame hitbox validation, all-direction art, or approved master. |
| Asset-source separation and provenance | PARTIAL | Source masters are outside `public/` with manifests and optimization script. Recorded prompt briefs are not verbatim provider transcripts; external IP/law review and owner approval are NOT RUN. |
| Ember Drive full form quality | FAIL / PROTOTYPE | Brief visual-only form pose is demonstrated; mechanics still use prior simple modifier. Does not satisfy V2 form contract. |
| Phaser vs Canvas comparison | PARTIAL / MEASURED SPIKE | Same small scene and one Chrome sample in `b01-renderer-evaluation.md`; instrumentation and workload differ by renderer. No final renderer choice. |
| `npm ci`, typecheck, build, tests, audit | PASS | Exact B01 commands/outcomes in `b01-evidence.md`; 16/16 tests. |
| Vision unchanged, no extra form/hero scope | PASS | Authoritative V2 file checksum unchanged; only one Kairo prototype and existing short three-room loop. |
| Owner style, engine, menu and input feel signoff | NOT RUN / REQUIRED | Owner review requested; see evidence handoff and comparison screenshots. |


## B02 Kairo animation and combat-feel gate ? 2026-11-05

| B02 criterion | Status | Evidence / limitation |
|---|---|---|
| Idle and locomotion animation in live Canvas game | PASS (prototype), pending owner review | Eight-frame source-grid atlases, runtime contact sheet, visible Chrome capture/video. No authored eight-direction set. |
| Three-hit grounded combo with distinct animation ranges | PASS (prototype) | 12 frames grouped by hit, 75 ms delayed directional arc, buffer and hitstop tests. Hitboxes are still one shared arc per strike. |
| Dodge animation and invulnerability | PASS (bounded) | Six-frame clip plus streak, actual simulation iframe regression test, live Chrome evidence. One facing is mirrored horizontally. |
| Guard, hurt and KO supporting states | PASS (prototype) | Runtime state atlas and simulation KO test; owner motion/pose quality review remains pending. |
| Enemy impact feedback | PASS (prototype) | Knockback, stagger, squash/flash, impact particles and hitstop; no enemy animation atlas. |
| Ember Drive anticipation/activation | PASS (bounded presentation only) | Two pose sequence, expanding ring, brief audio/VFX support; still fails full V2 form contract. |
| Source/runtime separation, anchors and repeatable pipeline | PASS | Five original sheets in `art-source/b02/`, five runtime atlases, JSON frame/anchor manifest, deterministic optimizer. |
| Detached partial hands/feet in exported frames | PASS after source-grid rebuild and alpha cleanup | B02 contact sheet inspected after cleanup; component areas recorded in manifest. Connected paint artifacts still need owner review. |
| React typecheck, build, core tests and npm audit | PASS | `npm run typecheck`, `npm run build`, `npm test` (19/19), and `npm audit` (zero vulnerabilities); details in `docs/qa/b02-evidence.md`. |
| Visible Chrome input/menu/combat/pause/reward/viewport pass | PASS (bounded dev fixture) | Google Chrome 156, visible headed pass and recording; no console/page errors or failed requests, two viewports fit; details in `docs/qa/b02-evidence.md`. |
| Owner visual quality, animation scalability and tactile signoff | NOT RUN / REQUIRED | Generated art is proposed feasibility work. Approval must come from the owner after review. |

**Gate:** B02 implementation is reviewable, but art quality and game-feel approval remain open. No production art or complete transformation claim is made.
