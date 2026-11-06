# Runtime architecture — preproduction baseline

**2026-11-05. Status: scaffold architecture, not final engine lock.**

| Layer | Location | Responsibility |
|---|---|---|
| Simulation | `src/game/runtime/CombatSession.ts` | Hero state, hit/skill rules, enemies, three lab rooms, reward flow, save updates. Has no React/Phaser/canvas dependencies. |
| Input | `src/game/runtime/InputController.ts`, `gamepadMapping.ts` | Keyboard/mouse/gamepad pressed vs held; dead zones and world-space aim. |
| Runtime adapter | `src/game/runtime/GameController.ts` | RequestAnimationFrame, frame timing, input -> simulation, paint, UI snapshots and audio events. |
| Renderer | `src/game/render/CanvasRenderer.ts` | Canvas2D hand-authored pseudo-2.5D stage, geometry proxies, attack telegraph and prototype VFX. Replaceable. |
| UI | `src/app/App.tsx` | React hub, overlay and HUD. Uses same runtime adapter as the no-dependency preview. |
| Offline proof | `src/preview/`, `tools/bundle-standalone.py` | No external packages; single-file artifact proves core combat can run on a browser. |
| Content | `src/game/data/` | Typed catalog and prototype encounters. Form list is **vision data**, not implemented forms. |
| Save | `src/game/storage/save.ts` | Versioned browser `localStorage` with guarded parsing. No account, cloud save or secure anti-cheat. |

## B01 shell/input addition (2026-11-05)

`src/app/screenState.ts` defines the small player-screen transition function. `App.tsx` owns title, hub, character, forms, records, settings and credits pages; combat remains mounted only on the full viewport gameplay route. The development renderer proof is a separate `renderer-proof.html` Vite entry and is not emitted by the public production build. Phaser is a dev dependency used by this comparison page only.

`src/game/runtime/gamepadMapping.ts` is a device-neutral standard gamepad mapper with radial dead zones, pressed/held sets, menu edge/repeat handling and platform labels. `InputController.ts` combines it with keyboard/mouse inputs, preserves last meaningful aim, releases on blur/disconnect and pauses on focus loss. Save schema v2 carries sanitized settings and migrates v1 records. Generated Kairo/enemy/title images are loaded by `CanvasRenderer` as single state poses; the simulation remains independent of those assets.

## B03 directional animation layer (2026-11-06)

`src/game/core/direction.ts` maps movement/aim vectors to authored front/right/back/left directions. `src/game/animation/animationResolver.ts` resolves simulation state and timers into atlas/frame selections; it is presentation-only and does not own hitboxes or mutate combat. `CanvasRenderer.ts` preloads five B03 atlases before the game loop, crossfades direction/state changes for 70 ms, and falls back to B02 atlases then vector art. A dev-only `?anim=b02` route supports paired browser comparisons. The four-way policy, atlas map, trim/pivot metadata and unresolved visual limits are in ADR-010 and the B03 art pipeline doc.

## Technology checkpoint

V2 proposes React + TypeScript + Vite with a renderer such as Phaser 3. B00 verified the React/Vite install, lockfile, build and actual Chrome render. B01 added a measured, bounded Phaser 3.90.0 comparison; it did not show a production-scale reason to migrate. Canvas2D remains the **proposed interim renderer** under ADR-008, not a final engine lock. Phaser is a dev-only dependency and its spike is excluded from production `dist/`.

**Current known debts after B04:** The runtime adapter advances the simulation in fixed 1/60-second steps with a bounded accumulator; exact replay serialization and long-frame stress behavior are absent. Collision obstacles and broadphase, rebind UI and physical controller evidence are absent. Generated Kairo motion and effects are multi-frame and four-directional, but diagonal views, per-frame hitbox geometry, sustained effects-load profiling and human visual/game-feel approval remain open. Enemy AI and the three-room chain are prototypes far short of MVP scale. Browser data is local-only.

## Determinism constraints

All encounter selections use `SeededRandom`, and run seed can be passed to `newRun`. B04 routes gameplay through a fixed 1/60-second update and edge-buffered actions; same seed plus same sampled actions is deterministic in current core tests. Replay serialization, cross-browser floating-point guarantees and recovery from prolonged tab suspension are not implemented.

## Original assets

`public/assets` now includes generated B01–B04 proposals and runtime exports. Sources remain in `art-source/` with manifests and rejected drafts; none is approved by its presence in the runtime tree. The renderer still retains a **programmatically drawn stand-in** as fallback; it is not final silhouette art or a sprite source to blindly upscale.

## B04 base-combat data and event pipeline (2026-11-06)

`src/game/data/kairoAbilities.ts` owns the Kairo base-kit definitions, action timings, costs, ranges, target caps, asset ids and SFX ids. `CombatSession` remains presentation-agnostic and emits typed combat events; `animationResolver` maps timers and facing to four cardinal atlas rows; `CanvasRenderer` layers character atlases and generated painted effects; `GameController` routes the same events to `SoundBus` and React snapshots. The HUD reads the session's ability availability/cooldowns and does not maintain independent clocks. See [ADR-011](adr-011-b04-base-combat-ability-contract.md).

The animation pipeline keeps authored views in front/right/back/left order. B04 art sources, directional overrides, cell trim/pivots, component cleanup and optimized WebP output are reproducible with `tools/build-b04-art.py`; generated artifacts remain proposed until visual/gameplay review. The runtime does not claim separately authored diagonal art. Visible Chrome gameplay validation was unavailable for this batch; this limitation is recorded in `docs/qa/b04-evidence.md`.
