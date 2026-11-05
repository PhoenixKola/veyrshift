# Runtime architecture — preproduction baseline

**2026-11-05. Status: scaffold architecture, not final engine lock.**

| Layer | Location | Responsibility |
|---|---|---|
| Simulation | `src/game/runtime/CombatSession.ts` | Hero state, hit/skill rules, enemies, three lab rooms, reward flow, save updates. Has no React/Phaser/canvas dependencies. |
| Input | `src/game/runtime/InputController.ts` | Keyboard/mouse pressed vs held; world-space mouse projection. |
| Runtime adapter | `src/game/runtime/GameController.ts` | RequestAnimationFrame, frame timing, input -> simulation, paint, UI snapshots and audio events. |
| Renderer | `src/game/render/CanvasRenderer.ts` | Canvas2D hand-authored pseudo-2.5D stage, geometry proxies, attack telegraph and prototype VFX. Replaceable. |
| UI | `src/app/App.tsx` | React hub, overlay and HUD. Uses same runtime adapter as the no-dependency preview. |
| Offline proof | `src/preview/`, `tools/bundle-standalone.py` | No external packages; single-file artifact proves core combat can run on a browser. |
| Content | `src/game/data/` | Typed catalog and prototype encounters. Form list is **vision data**, not implemented forms. |
| Save | `src/game/storage/save.ts` | Versioned browser `localStorage` with guarded parsing. No account, cloud save or secure anti-cheat. |

## Technology checkpoint

V2 proposes React + TypeScript + Vite with a renderer such as Phaser 3. The intended app uses **React 19 + TypeScript + Vite**, and B00 verified its install, lockfile, typecheck, production build and actual Chrome render. Vite is pinned by the lockfile to the 6.4.5 line after the initial audit found a high-severity advisory. The portable custom Canvas2D battle laboratory is retained as an **interim renderer** per proposed ADR-007; the Phaser/alternative comparison spike and frame-time comparison are still open. Replacing this renderer should not require rewriting combat progression or saves.

**Current known debts to address in B00/B01/B02:** Runtime delta and attack timing are not fixed-timestep; no collision obstacles, broadphase, input buffering, replay serialization, controller support, rebind UI, proper animation timeline, launches/juggles or high-quality player art. Basic enemy contact AI and telegraphs are placeholders, and the three-room chain is far shorter than the 10–14 encounters envisioned for MVP. Browser data is local-only, losing storage loses progress.

## Determinism constraints

All encounter selections use `SeededRandom`, and run seed can be passed to `newRun`. The current simulation uses frame-step delta for movement, so precise physics determinism across different frame schedules is **not yet guaranteed**. B02 should establish a fixed-step simulation, input event buffering and replayable combat before claiming reproducible run inputs.

## Original assets

`public/assets` contains intentionally empty category folders; each must receive approved original master and derived files with a ledger entry. The character shown in the preview is a **programmatically drawn stand-in**. It is not approved final art, final silhouette, or sprite source to blindly upscale.
