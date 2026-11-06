# B05 evidence — Ember Drive + Glass Current

**Batch status: PARTIAL / BLOCKED.** Form selection, v3 save migration and small deterministic combat prototypes are implemented. B04 Gate 0 visible Chrome playthrough remains blocked because CUA reports `browser access host unavailable` and no browser surfaces are exposed. This also prevents B05 normal-speed footage, game-scale visual review, audio evaluation and viewport QA. Owner visual/game-feel approval is pending. Do not treat the generated sheets or automated tests as a substitute.

## Gate 0 — B04 live verification

| Requirement | Status | Evidence |
|---|---|---|
| Visible real Vite game from title through hub and run | BLOCKED | CUA `getState()` reports browser host unavailable; native app pipe also failed. Existing `tests/browser-smoke.py` is headless, injects a standalone bundle into `about:blank`, and is not an acceptable visible Vite UAT substitute. |
| Inputs, combat, Threadbreak and Ember prototype at normal scale | NOT RUN | No actual game session capture. |
| HUD, pause/settings persistence, sound/mute | NOT RUN | No browser interaction or listening review. |
| Reduced effects and 16:9/16:10/ultrawide/960×540 | NOT RUN | No headed capture. |
| Finisher direction/continuity in motion | NOT RUN | B04 still/contact sheet only is not proof of gameplay continuity. |
| Physical controller | NOT RUN | No hardware test. |

**Owner reproduction steps:** From the repo root, run `npm ci`, `npm run dev`, open Vite's printed URL in visible Chrome, and follow the B05 prompt's Gate 0 checklist. For the form prototype, unlock Glass by landing five parries, open Forms from the hub, equip each form and start a new run. Set Pulse to 100 with the development-only fixture for deterministic comparisons. Capture continuous normal-speed clips at actual play scale, then test pause, settings, reduced effects and all listed viewports. Record browser errors and separately listen to the sound. Do not infer hardware/controller approval from a synthetic gamepad API.

## Generated reference masters

Both masters were created by built-in image generation on 2026-11-06, using the B03 base turnaround as an identity reference. Tool output paths were copied into `art-source/b05/proposed/`; originals remain in the Codex generated-images directory. Model/version/seed metadata was not exposed.

**Ember brief:** “Use case: original game character transformation reference master. Asset type: high-resolution transparent turnaround sheet for an original browser action roguelite. Input image 1 is Kairo Venn's base identity; preserve his recognizable face, lean athletic adult build, asymmetric swept-back dark plum hair, cropped charcoal jacket with cream piping, split plum coat tails, bronze ring-joint kinetic cuffs, dark trousers and boots. Show the SAME Kairo in exactly four full-body neutral standing views arranged left to right: front, left profile, back, right three-quarter. Ember Drive (Fury): visibly evolved silhouette with broader articulated bronze cuff lattice, restrained ember-red luminous seam marks on jacket and cuffs, slightly forward-loaded athletic posture, plum hair with a few copper-lit tips while retaining its recognizable shape, sharper split coat tails. Keep face/anatomy consistent in all four views. Existing inked cel-shaded high-resolution 2.5D anime-inspired game illustration, crisp outlines and painted material shading. Orthographic studio character sheet, evenly spaced, same body scale, full boots, generous gaps, transparent background, small simple view labels above each figure. Exactly four figures, each exactly two arms and two hands, no cropped limbs, no fragments, no weapons, no action poses, no flames/aura/glow clouds, no overlap. Avoid famous anime transformations, golden spikes, white gi, other IP likeness, logo or watermark.”

**Glass brief:** “Use case: original game character transformation reference master. Asset type: high-resolution four-view costume and silhouette design sheet for an original browser action roguelite. Input image 1 defines Kairo Venn's identity: preserve the same recognizable face, lean athletic adult build, asymmetric swept-back dark plum hair, cropped charcoal jacket with cream piping, split plum coat tails, bronze ring-joint kinetic cuffs, dark trousers and boots. Show the SAME Kairo in exactly four full-body neutral standing views in one horizontal row: front, left profile, back, right three-quarter. Glass Current (Precision) is composed and exact, visually distinct from the fiery form: subtly cleaner swept hair silhouette with same dark plum color and no silver/white hair, sculpted segmented bronze cuffs with narrow translucent pale-cyan/prismatic insets, a few precise glasslike seam facets on jacket, one elegant transparent crescent echo-disc integrated behind one shoulder (not a halo), straighter relaxed posture with poised open hand. Keep costume recognizable; controlled cool pearl, faint cyan and restrained violet refraction only on metal/glass accents. No flames or warm ember glow. Maintain face, proportions, costume details and consistent left/right facing across all views. Existing inked cel-shaded high-resolution 2.5D painted anime-inspired game illustration, crisp outlines, refined fabric/metal/glass shading. Orthographic studio sheet, evenly spaced figures, identical scale, full boots, generous gaps, clean transparent background, small simple labels above figures. Exactly four figures, exactly two arms and two hands each, no cropped limbs, no fragments, no weapons, no action poses, no overlap, no effects obscuring body. Avoid Ultra Instinct/silver hair/white aura imagery, famous anime motifs, third-party likeness, logo, watermark.”

## Automated verification

The following B05 commands are required; report current outcomes after the final run:

| Command | Result |
|---|---|
| `npm ci` | PASS after one Windows `ENOTEMPTY` cleanup retry; installed 71 packages |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; Vite production bundle produced |
| `npm test` | PASS 31/31 |
| `npm audit` | PASS; 0 vulnerabilities |
| `python tools/build-b05-art.py` | PASS; manifest rebuilt; no runtime art exported |
| `git diff --check` | PASS; only expected Windows LF→CRLF notices |
| Visible Chrome + normal-speed videos | BLOCKED / NOT RUN |

Tested behaviors include v1/v2→v3 migration, equipped/unlocked Glass save persistence, equipped form selection per run, affordable transformed finisher cost, one-shot Glass avoided-hit counter, five-parry unlock, Ember third-hit marks, Glass special requiring and consuming a counter window, plus existing B04 combat regressions. The form logic has not been observed at game scale, tuned by players, or validated against bosses.

## Review matrix

| Category | Base B04 | Ember Drive | Glass Current |
|---|---|---|---|
| Design consistency | PARTIAL; inherited B04 proposal | PARTIAL; turnaround proposal rejected from runtime | PARTIAL; turnaround proposal rejected from runtime |
| Animation / cardinal continuity | BLOCKED in live play | NOT IMPLEMENTED | NOT IMPLEMENTED |
| Ability/mechanic distinction | PARTIAL; prior B04 prototype | PARTIAL; mark/detonation, projectile splash, forward special, speed/iframe tradeoff, tuned finisher | PARTIAL; earned perfect-dodge counter, counter-only special, piercing projectile, movement tradeoff, tuned finisher |
| VFX / audio | PARTIAL; B04 provisional synthesized effects | NOT IMPLEMENTED as authored package | NOT IMPLEMENTED as authored package |
| HUD / form selection / save | BLOCKED in browser | PARTIAL; selection/status/save logic | PARTIAL; unlock/equip/status/save logic |
| Performance / accessibility / controller | NOT RUN | NOT RUN | NOT RUN |
| Owner beauty/game-feel signoff | REQUIRED | REQUIRED | REQUIRED |

No B05 image assets are approved. The runtime directory `public/assets/characters/kairo/b05/` intentionally has no atlas. The unresolved appearance swap, fluid animation, dedicated icons, VFX, audio, visible browser proof, performance, and boss-room evidence block claims that either form is complete or that the code is ready for B06 Gravity Break.
