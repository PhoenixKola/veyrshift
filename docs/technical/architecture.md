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

## Technology checkpoint

V2 proposes React + TypeScript + Vite with a renderer such as Phaser 3. B00 verified the React/Vite install, lockfile, build and actual Chrome render. B01 added a measured, bounded Phaser 3.90.0 comparison; it did not show a production-scale reason to migrate. Canvas2D remains the **proposed interim renderer** under ADR-008, not a final engine lock. Phaser is a dev-only dependency and its spike is excluded from production `dist/`.

**Current known debts after B01:** Runtime delta and attack timing are not fixed-timestep; collision obstacles, broadphase, input buffering, replay serialization and rebind UI are absent. Keyboard/mouse plus standard gamepad mapping now exist, but physical gamepad, controller reconnect and human feel testing remain pending. Generated Kairo art consists of individual poses with no locomotion loop, multi-frame attacks, all-direction animation or hitbox-alignment validation. Basic enemy AI and telegraphs are placeholders, and the three-room chain is far shorter than the 10-14 encounters envisioned for MVP. Browser data is local-only.

## Determinism constraints

All encounter selections use `SeededRandom`, and run seed can be passed to `newRun`. The current simulation uses frame-step delta for movement, so precise physics determinism across different frame schedules is **not yet guaranteed**. B02 should establish a fixed-step simulation, input event buffering and replayable combat before claiming reproducible run inputs.

## Original assets

`public/assets` contains intentionally empty category folders; each must receive approved original master and derived files with a ledger entry. The character shown in the preview is a **programmatically drawn stand-in**. It is not approved final art, final silhouette, or sprite source to blindly upscale.
