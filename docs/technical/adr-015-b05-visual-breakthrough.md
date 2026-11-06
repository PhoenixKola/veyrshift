# ADR-015: B05 visual-breakthrough proof and animation stop condition

- **Date:** 2026-11-06
- **Status:** Accepted for this corrective pass; owner review required before further art production
- **Scope:** Ember Drive and Glass Current visual proposals, plus a development-only proof harness

## Context

Prior B05 form art changed mostly cuffs, pose and color. The corrective study established that distinct VFX-off silhouettes are achievable: Ember can use an asymmetrical kinetic cuff, while Glass can use an angular shoulder/coat silhouette. Eight independently generated poses per form, however, do not provide continuous motion. Contact boards reveal held poses and character-anchor changes. The visible Vite/Chrome review could not run in this environment.

## Decisions

1. Retain Ember A and Glass A as **provisional concept directions only**. Keep both alternate concepts and the rejected facing/cell-bleed sheets in source provenance. Do not treat a successful boundary check as art approval.
2. Preserve one deterministic five-second pose proof per form using exactly eight authored pictures and the listed phase durations. Do not generate duplicate frames or claim interpolation/fluidity.
3. Provide a development-only `?b05showcase=1` route. It invokes the actual `GameController`, `CombatSession`, `CanvasRenderer`, form event VFX and browser audio bus. The showcase supplies fixed combat inputs only while it is active; its candidate art assets are loaded from `art-source/` only in Vite development.
4. Use core simulation tests to verify real hitbox, iframe, form-counter/special and reversion behavior. Treat those as logic evidence, never as animation or art acceptance.
5. Mark the animation-quality gate **FAIL** for these drafts, Stage 3 multilayer VFX **NOT STARTED**, and live Vite/browser/audio review **BLOCKED / NOT RUN**. Stop independent full-character pose generation until a reference-locked rig or animator-reviewed in-between method succeeds on one clip.

## Consequences

The harness makes drafts reviewable in the real game scene without exposing the candidate atlas in production menus or bundles. The source and contact sheets are retained. These proposals do not satisfy the full transformation contract, visual approval, normal-speed animation, layered VFX, audio or release gates. The owner should review the silhouette direction and the recommended change in animation method before the next art batch.

## Verification

See [`docs/qa/b05-visual-breakthrough-evidence.md`](../qa/b05-visual-breakthrough-evidence.md) for command results and browser blockers. The authoritative V2 vision is unchanged.
