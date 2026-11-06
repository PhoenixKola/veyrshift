# ADR-013: B05 form presentation uses preloaded Canvas2D atlases and event textures

**Date:** 2026-11-06  
**Status:** Accepted for this implementation proposal; owner visual/audio approval pending.

## Context

B05 has two prototype form records with deterministic combat differences, but no form-specific runtime animation or presentation pipeline. The current renderer is portable Canvas2D. B00 explicitly deferred final renderer selection; B05 must not silently migrate engines.

## Decision

- Keep combat simulation presentation-agnostic. `CombatSession` emits typed events tagged with the currently active `KairoFormId`; transformation end events retain the form ID after the simulation changes back to base.
- Keep form character atlases, UI icons and effect textures as generated source PNGs plus deterministic lossless WebP runtime exports. `CanvasRenderer` preloads form combo/run and effect images before its animation loop.
- Use form-specific combo/run atlases only while that form is active and the corresponding asset is loaded. Missing art falls back to the existing B04/B03/B02/vector paths.
- Use event ID plus form ID to select one of six dedicated VFX textures per form, with Canvas2D event-time scale/fade. Missing form VFX continues through the inherited generic effect path.
- Route the same events through `GameController` to distinct provisional WebAudio synthesis cues. Keep settings and volume controls on the existing SoundBus.
- Preserve the current renderer, save schema, controller mapping and simulation timing. No Phaser/Electron/3D migration is introduced.

## Consequences and limits

This creates a bounded production-candidate path without coupling game rules to Canvas. The form atlases currently cover only four run poses and twelve combo poses per direction; they do not provide idle, dodge, guard/parry, hurt/KO, active-loop, ranged-cast, special, finisher or fluid activation/reversion character animation. VFX are single textures with event-time transforms, not layered animation. Audio is synthesized and has not been listened to in a browser. All generated material is unapproved. Live Vite visual/game-feel/audio/performance evidence remains blocked until a headed browser is available.

## Evidence

See `docs/art/b05-animation-manifest.json`, `docs/art/b05-generation-notes.md` and `docs/qa/b05-completion-evidence.md`. No change is made to the historical V2 vision.
