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

## B03 Kairo directional animation gate — 2026-11-06

| B03 criterion | Status | Evidence / limitation |
|---|---|---|
| Four distinct authored cardinal views in live game | PASS (technical); PARTIAL (visual approval) | Front, right profile, back and left profile; no B03 mirroring. Generated master/source still proposed. |
| Diagonal movement/attack selection | PARTIAL | Dominant-axis mapping tested, vertical wins ties. No separate diagonal assets; continuous hit arc may differ from the nearest cardinal pose. |
| Idle/run/dodge visual loops | PARTIAL | Four frames per cardinal direction. Visible Chrome demonstrates true front/back/lateral movement. Start/stop clips, exact foot-contact events and owner smoothness review remain open. |
| Three-hit combo, guard/parry/hurt/KO and Ember compatibility | PARTIAL | Runtime phase/state routing and real damage/KO were exercised in visible Chrome. Third strike reads as an uppercut; first two need more visual distinction and temporal tuning. |
| Source review, consistency audit, repeatable generation pipeline | PARTIAL | 5 atlases, JSON metadata, pivots, contact sheets and rejected drafts. No manual redraw/rig; consistency audit is not exhaustively annotated frame-by-frame. Provider transcript/model/version unavailable. |
| Assets load, transition, fallback, reduced motion and responsive views | PASS (bounded technical) | Browser test has zero failed assets/JS errors; B02 and vector fallbacks are retained; 100/75% sprite scales and 1480×920/1280×800/1920×800/960×540 captures. |
| Performance under movement/attack vs B02 | PARTIAL | Three short paired RAF samples and RGBA atlas estimate in `b03-evidence.md`; no GPU measurement or sustained/stress profile. |
| Automated tests, clean install, build, audit | PASS after final clean-install run | Detailed commands/results in `b03-evidence.md`. |
| Physical gamepad feel | NOT RUN | No physical controller connected; synthetic gamepad mapping tests are not hardware proof. |
| Owner visual and game-feel approval | NOT RUN / REQUIRED | Review the proposed master, contact sheets, equal-scale comparison and live video before production-art acceptance. |

**B03 gate:** IMPLEMENTED AS A REVIEWABLE DIRECTIONAL ANIMATION PROPOSAL; important visual gates remain PARTIAL. Owner signoff is required before the assets are treated as approved production art.

## B04 Kairo base-combat and presentation gate — 2026-11-06

| B04 criterion | Status | Evidence / limitation |
|---|---|---|
| Typed Kairo base-ability contract and separate cooldown/resource rules | PASS (automated) | `kairoAbilities.ts`, per-ability snapshots, and tests for Pulse affordability and shockwave/finisher cooldown independence. |
| One press = one strike/bolt; repeated presses chain combo | PASS (automated) | Core test verifies held input does not auto-repeat and exactly one bolt cast/contact occurs; 3-hit progression tests pass. |
| Combo hit-one/hit-two/hit-three and start/stop source clips | PARTIAL | Separate generated directional sequences and runtime routing/contact sheets exist; foot contacts, normal-speed motion and B03→B04 visual comparison are not captured. |
| Finisher head direction and cell-boundary neighbor artifacts | PASS (source/contact-sheet review); PARTIAL (live game) | Corrected right-facing four-pose strip and rebuilt runtime atlas; automated direction-row progression test. Visible gameplay confirmation remains unavailable. |
| Original generated ability motion/VFX | PARTIAL | Generated masters, VFX contact board, runtime exports and typed event integration exist. No owner style approval or combined in-game clip. |
| Audio and accessibility mix | PARTIAL | Original event-driven WebAudio synthesis and settings integration exist. No audible Chrome review; no music track. |
| Cooldown HUD, input labels, pause tabs and settings | PARTIAL | Snapshot-driven implementation and pause UI present; no live keyboard/gamepad navigation, persistence, responsiveness or visual check in Chrome. |
| Build, tests, offline preview, audit | PASS | `npm ci`, typecheck, build, `npm test` 25/25 (offline preview is produced), `npm audit` zero vulnerabilities. |
| Visible Chrome gameplay, normal-speed clips, viewport/reduced-effects review | BLOCKED / NOT RUN | CUA browser host unavailable in this batch; no actual gameplay screenshot/recording. See `docs/qa/b04-evidence.md`. |
| Physical controller | NOT RUN | No controller hardware exercised. Mapper tests are not hardware evidence. |
| Ember Drive complete transformation contract | FAIL / PROTOTYPE | Ember preview remains a short prototype and does not satisfy the full form requirements. |
| Owner visual/game-feel and external likeness/IP approval | NOT RUN / REQUIRED | All generated assets remain proposals; no legal/name clearance performed. |

**B04 gate:** Code and source assets are reviewable, but B04 is **not approved**. Missing visible Chrome gameplay, sound/feel review, visual consistency checks at target sizes and owner signoff prevent a production-ready claim.

## B05 Kairo transformation gate — 2026-11-06 (continuation)

| B05 criterion | Status | Evidence / limitation |
|---|---|---|
| Kairo form selection and persistence | PASS (automated), PARTIAL (UI review) | Hub form screen, v3 equipped form and v1/v2 migration tests; visible Chrome navigation not run. |
| Glass unlock challenge | PASS (automated) | Five successful parries persist unlock progress; no player usability review. |
| Ember transformed combat distinction | PARTIAL | Mark detonation, splash projectile, forward special and tradeoffs are deterministic. Candidate combo/run atlases, six icons/VFX textures and form-specific synthesized event cues are integrated; no playtest or sound review. |
| Glass transformed combat distinction | PARTIAL | One-shot avoided-hit counter, counter-gated special and piercing shot are deterministic. Candidate combo/run atlases, six icons/VFX textures and form-specific synthesized event cues are integrated; no playtest or sound review. |
| Form turnaround art | PARTIAL | Replacement four-view turnaround candidates in `art-source/b05/review/` inspected on dark composites; no owner, grayscale, gameplay-scale or external originality approval. Earlier failed attempts are retained. |
| Form character action art | PARTIAL | Four-direction run and 12-frame combo candidate atlases exported, boundary audited and shown in contact/GIF previews. Idle, dodge, guard, hurt/KO, active loop, form-specific ability animation and fluid activation/reversion character art are missing. |
| Dedicated icons, authored VFX and original audio | PARTIAL | Six icons and six purpose-built VFX textures per form are exported and wired to HUD/events. Audio cues are procedural synthesis. No in-game visual check, layered VFX, active loop, sound listening or approval. |
| B04 visible Chrome Gate 0 | BLOCKED | CUA host unavailable; headless standalone smoke is not a substitute. |
| B05 normal-speed gameplay videos / audio / viewport / controller | NOT RUN | No live browser surfaces or physical controller validation. |
| Owner visual/game-feel approval | NOT RUN / REQUIRED | Both forms remain partial proposals. |
| B06 major appearance-swap readiness | UNVERIFIED | No alternate form animation library has been integrated or inspected. |

**Gate:** B05 is **PARTIAL / BLOCKED**. No complete-transformation, production-art, performance or owner-approval claim is made. See `docs/qa/b05-completion-evidence.md` for current results and the owner-run visible Chrome checklist. `docs/qa/b05-evidence.md` records the inherited B04 live gate.


## B05 finalization coverage ? 2026-11-06

| State | Base | Ember Drive | Glass Current |
|---|---|---|---|
| Idle | Native art | Native candidate art; live check not run | Native candidate art; live check not run |
| Run | Native art | Native candidate art; live check not run | Native candidate art; live check not run |
| Start/stop | Native art | Base fallback | Base fallback |
| Combo 1/2/3 | Native art | Native candidate art; contact timing changed by hit | Native candidate art; contact timing changed by hit |
| Dodge | Native art | Native candidate art | Native candidate art; `.24s` duration retained |
| Guard | Native art | Native candidate art | Native candidate art |
| Parry | Native art | Native candidate event pose | Native candidate event pose |
| Hurt | Native art | Base fallback | Base fallback |
| KO | Native art | Base fallback | Base fallback |
| Bolt cast | Native art | Native candidate art | Native candidate art |
| Special | Native art | Base fallback | Base fallback |
| Finisher | Native art | Base fallback | Base fallback |
| Activate | Existing base transition | Base transition/effects | Base transition/effects |
| Active loop | Base idle/aura | Candidate idle/aura; no sustained loop | Candidate idle/aura; no sustained loop |
| Deactivate | Existing base state | Base transition/effects | Base transition/effects |

?Native candidate art? means a runtime atlas is routed; it does not mean animation quality or game integration was approved. See the finalization evidence matrix for source/test, live-game and owner-approval statuses.

## B05 visual-breakthrough corrective pass — 2026-11-06

| B05 visual-breakthrough criterion | Status | Evidence / limitation |
|---|---|---|
| VFX-off Ember/Glass silhouettes distinct from base at target sizes | PASS as proposal comparison; owner review pending | Both concept variants per form are shown with base in front/right views, 100%/75% size, dark/midtone backgrounds, VFX off/on, plus close-ups. This does not approve the generated art. |
| Ember and Glass motion quality | **FAIL** | Eight-pose timed drafts have large pose/anchor changes and no rigged deformation or generated in-betweens. The timed GIFs and contact boards are previews, not fluid-animation evidence. |
| Actual combat timing in the draft proof | PASS (simulation tests only) | Ember combo hit damages the target; Glass avoids a telegraphed strike during dodge iframes, earns the counter, and lands the gated special. This does not establish what the running game looks like or feels like. |
| Dev-only replay uses the actual game loop and Canvas renderer | IMPLEMENTED; visual verification NOT RUN | Route `?b05showcase=1` and the two buttons are restricted to Vite development. Browser host unavailable and headed fallback denied by execution policy. |
| Layered motion-specific VFX (Gate C) | NOT STARTED / NOT RUN | Work stopped after the motion-quality gate failed. Existing B05 single-image form effects remain unchanged. |
| Browser/audio/960×540/16:9 visual review | BLOCKED / NOT RUN | No actual Vite browser screenshot/video or audible review. Owner-local steps are in `b05-visual-breakthrough-evidence.md`. |
| Physical controller and owner art/game-feel approval | NOT RUN / REQUIRED | No controller connected and generated proposals await owner review. |

**Corrective-pass gate:** ART PROPOSED (silhouette comparison only); ANIMATION DEMONSTRATED: FAIL; IN-GAME VERIFIED: NOT RUN / BLOCKED; AUDIO HEARD: NOT RUN / BLOCKED; OWNER APPROVED: NOT RUN / REQUIRED. Do not expand the form atlases until a reference-locked rig or reviewed in-between workflow clears the motion gate on one clip. See [`b05-visual-breakthrough-evidence.md`](b05-visual-breakthrough-evidence.md).
