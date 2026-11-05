# B00 runtime evaluation — 2026-11-05

**Status: interim recommendation; owner approval required before B01/B02/B03 renderer lock.** This is an engineering comparison, not a measured head-to-head benchmark.

## Repository facts

- React 19 + TypeScript + Vite is the intended shell (`src/app/App.tsx`). The React shell imports the same `GameController` and `CombatSession` used by the offline preview.
- `src/game/runtime/CombatSession.ts` owns gameplay state and deterministic encounter RNG. `InputController.ts` owns browser input. `GameController.ts` binds input, simulation, Canvas rendering, and audio. `CanvasRenderer.ts` draws the projected floor, shadows, actors, telegraphs, projectiles, attack arcs, particles, and prototype aura.
- The renderer is tightly coupled to the current procedural Kairo/enemy proxies and a fixed logical arena (1180 × 680). It is a functional lab, not a sprite-atlas animation pipeline.
- A visible Google Chrome session ran the actual Vite app at 1480 × 980 and 1110 × 740 viewports. Images and interaction notes are in [`b00-evidence.md`](../qa/b00-evidence.md). No Phaser runtime or second playable renderer was installed or built; performance comparisons against Phaser are therefore **not measured**.

## Renderer comparison

| Concern | Current Canvas2D adapter | Phaser 3 (not prototyped in B00) |
|---|---|---|
| Simulation reuse | Already separated enough to keep `CombatSession` and data; no engine runtime dependency | Can host the same simulation behind an adapter if the boundary is kept explicit |
| Current 2.5D read | Proven basic angled plane, y-sort for actors, soft ground shadows, projected geometry and color-coded telegraphs | Supports scene/layer composition and camera tools; visual quality still depends on authored assets and integration |
| Combat effects | Existing hand-drawn trails, particles, projectiles, screen shake, and prototype aura are live in Chrome | Broader built-in scene, animation, camera and input facilities; package/runtime overhead and renderer-specific tuning need a runnable sample to quantify |
| Sprite/rig pipeline | Not present; the current procedural actor is a proxy | Does not create approved character art or a modular rig automatically; likely needs atlas/animation pipeline design and content migration |
| Depth ordering | Simple actor `y` sort; stage/effects are manually layered | More scene primitives, but custom depth conventions and effects layering remain required |
| Resize/input | Responsive CSS canvas with pointer-to-logical-world projection; quick browser interaction passed | Equivalent behavior can be implemented, but migration must preserve logical coordinate and input behavior |
| Migration cost | No migration; keep renderer behind existing controller boundary | Add dependency and a renderer adapter, recreate stage, actor sorting/shadows, effects, resize and accessibility behavior; retest browser and preview parity |
| Performance | Chrome screenshots show a small 3-enemy encounter, but frame time was not instrumented | Not measured; no honest claim of a Phaser performance advantage is possible yet |

## Recommendation

**Continue the portable Canvas2D renderer through the next combat-feel prototype as an interim choice. Do not rewrite or lock it as the production renderer yet.** It already runs the deterministic game loop in Chrome and the same core in the offline preview. B00 found no measured need to pay the migration cost before the first authored sprite/animation pipeline exists.

Before final renderer lock, build a bounded Phaser 3 or supported-alternative spike using the same logical arena, same Kairo proxy, one enemy, one directional attack, telegraph, ground shadow, y-sort, resize, and form-effect timeline. Capture comparable screenshots and instrument frame time on a named target machine. Reuse `CombatSession`; do not move gameplay rules into engine callbacks. If the animation/scene pipeline materially improves authoring or readability, record a new ADR and obtain owner approval before migration.

## Actionable renderer targets (proposed, not measured)

- Preserve a 1180 × 680 logical combat coordinate space, with letterbox/contain scaling and pointer coordinates converted to that space.
- Sort actors by their ground-anchor `y`; keep shadows attached to ground anchors and draw telegraphs beneath actors/effects that would obscure them.
- Author transparent sprite atlases with consistent ground anchor, frame bounds, pivots, and metadata for idle, move, attack, dash, guard, hit, transform, and recovery. Keep source masters losslessly outside runtime atlases.
- Keep world-space effects sorted/configurable separately from screen-space UI; cap particles and effect overdraw; expose reduced-motion/flash settings.
- Target 60 FPS on the agreed desktop baseline (frame budget ≤16.7 ms), with no sustained frame spikes during ordinary encounters. Measure this before claiming it.
- Keep combat input response and hit-stop authored in simulation time. The current simulation uses variable frame delta and does not establish a fixed-step/replay guarantee.
- Give enemy attack tells distinct shape and timing so high-energy effects do not erase them; test at native and 75% viewport sizes and in grayscale.

## Gate status

- Real React/Vite install, typecheck, production build, and audit: passed after Vite patch update; exact commands/results are in the evidence manifest.
- Actual Chrome app render, basic input, pause/resize, and save reload: passed. The initial run exposed a missing favicon request; B00 adds an original SVG icon and verifies the follow-up run has no failed resources.
- Phaser/alternative comparison prototype and timing: **not run**.
- Owner choice of final renderer: **pending**.
