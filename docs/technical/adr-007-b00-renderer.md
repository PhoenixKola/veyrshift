# ADR-007: Keep Canvas2D as an interim combat-lab renderer

**Date:** 2026-11-05
**Status:** Proposed; owner approval required for final renderer lock.

## Context

The current repository contains a playable Canvas2D adapter and a React/Vite shell sharing the same renderer-independent simulation. B00 verified the React/Vite app in Chrome at two viewport sizes. A Phaser or other engine comparison build and frame-time benchmark were not completed, and there is no approved sprite/rig pipeline yet.

## Decision

Keep Canvas2D for the next bounded combat-feel prototype. Treat it as an interim renderer and keep `CombatSession` independent of rendering. Do not add Phaser or rewrite the renderer during B00.

## Rationale

The current renderer is sufficient to exercise attack direction, y-sorting, projected floor, shadows, telegraphs and prototype effects against live combat input. Replacing it before art/animation requirements have been tested would add migration work without measured evidence that Phaser solves the present bottleneck.

## Consequences and follow-up

- B02 may improve the current renderer only as needed for combat-feel experiments; this does not approve it as the final production renderer.
- Before final lock, run the bounded same-scene Phaser (or well-supported alternative) spike and compare runtime authoring, legibility and measured frame time. Preserve the logical simulation and preview parity.
- Obtain owner approval for the final renderer and visual direction before mass art production.

## Evidence limits

Chrome test used the actual Vite app and Google Chrome, not a mock screenshot. It covered hub/start, movement, pointer attack input, pause/resume, viewport resize, abandonment-to-hub save, and save persistence after reload. B00 adds an original favicon to clear the initial 404. Reward selection, transformation activation, and a Phaser comparison were not verified in this pass.
