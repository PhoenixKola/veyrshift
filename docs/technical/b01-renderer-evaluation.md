# B01 renderer and animation feasibility evaluation

**Date:** 2026-11-05
**Status:** Measured prototype comparison; no final renderer decision.
**Browser:** Google Chrome 156.0.8078.80, Windows, visible foreground tab, 1260×900 viewport.

## Comparison harness

The dev-only `/renderer-proof.html` page renders one deterministic 1180×680 scene in Canvas2D and Phaser 3.90.0 using Canvas renderer. The scene has the same 16 floor lines, one moving fighter proxy, one enemy proxy, one telegraph circle, a melee arc, and animated form orbit. Both modes ran in the same Chrome tab for nine seconds, Canvas first and Phaser second. `requestAnimationFrame`/Phaser post-render frame cadence is recorded separately from draw interval. The page is not part of the production build, and Phaser is a dev dependency only.

## Measured sample

| Measure | Canvas2D | Phaser 3.90 | Notes |
|---|---:|---:|---|
| Frame samples | 2,144 | 2,109 | One nine-second foreground sample per mode. |
| Frame interval median | 4.2 ms | 4.2 ms | Browser scheduling included. |
| Frame interval p95 | 4.3 ms | 7.1 ms | Vsync/compositor and tab scheduling affect this sample. |
| Measured render interval median | 0.0 ms | 0.1 ms | Canvas is synchronous draw-call time; Phaser is PRE_RENDER→POST_RENDER. Sub-millisecond values are near the measurement floor. |
| Measured render interval p95 | 0.2 ms | 0.3 ms | These windows are not perfectly equivalent; do not treat as an engine ranking. |
| Startup to first rendered frame | 1.1 ms | 182.8 ms | Phaser game construction measured after its dev module was already downloaded; module download is excluded. Canvas scene/context is already in the loaded shell. |
| `performance.memory.usedJSHeapSize` | 15.25 MB baseline; 16.24 MB after Canvas | 18.28 MB after Phaser | Approximate Chrome JS heap only, same page cumulative; not isolated allocations, GPU memory or texture/process RSS. |

Raw browser output and screenshots: `tests/evidence/b01/chrome/renderer-results.json`, `renderer-canvas-live.png`, `renderer-phaser-live.png`. These data establish that both approaches can draw this small scene in this browser. They do not establish scalable performance: the workload has few actors, no animation atlas, no post-processing and no production asset loading. Frame-time sample variation and the different render timing windows are larger than any defensible performance conclusion here.

## Authoring and integration comparison

| Topic | Canvas2D | Phaser 3.90 |
|---|---|---|
| Existing game integration | Already used by `CanvasRenderer`; direct Canvas drawing and no engine dependency in production. | A familiar Scene/Graphics lifecycle can draw the spike, but a separate adapter and depth conventions are still needed. |
| Current spike authoring | Short direct drawing code; manual lifecycle, draw ordering and state management. | Scene lifecycle/Graphics APIs are useful; scene boilerplate and Phaser package/runtime are additional setup. |
| Character art | Does not create a rig, atlas, or animation by itself. | Also needs an authored rig or reviewed atlas and does not solve source-art consistency. |
| Dev dependency cost | None beyond browser Canvas. | Phaser 3.90 package's minified distribution is about 1.20 MB uncompressed. Keeping the proof in a separate development-only HTML entry prevents it entering `dist/`. |
| Simulation | `CombatSession` can remain renderer-independent. | Same simulation can remain renderer-independent behind an adapter; full migration is unnecessary for this feasibility check. |

## Animation feasibility finding

OpenAI image generation provided distinct transparent Kairo stills for idle/master, punch, dodge and Ember visual preview, plus an original Rift Wisp and a separate title illustration. The stills are integrated in the React hub and live combat Canvas. Runtime selection follows current attack/dash/transform state; simple procedural bobbing and VFX fill the motion gaps. This proves image loading, bounds scaling and state-pose integration. It does **not** prove a locomotion loop, multi-frame directional punch, animated dodge, stable contact timing, all-direction consistency, or validated hitbox alignment. The detailed source-to-runtime manifest and production pipeline are in `docs/art/b01-frame-manifest.json` and `docs/art/b01-runtime-pipeline.md`.

## Recommendation for owner review

Keep Canvas2D for the next small combat-feel iteration because the current shared renderer and standalone preview already work, and this spike shows no measured reason to migrate. Revisit after a reviewed sprite/rig sequence, animation authoring test, and a representative scene workload exist. This is only a provisional cost-of-change recommendation; do not treat it as the final renderer or style lock. Both the generated art direction and the final engine remain pending owner approval.
