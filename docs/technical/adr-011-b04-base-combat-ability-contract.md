# ADR-011 — B04 typed base-combat ability contract

- **Date:** 2026-11-06
- **Status:** Implemented for the current Kairo prototype; owner/gameplay review pending
- **Context:** B04 replaces scattered combat constants and coupled cooldowns with one typed base-form ability catalog while preserving the B03 Canvas2D and four-cardinal-direction architecture.

## Decision

1. Keep simulation, input, renderer, HUD and sound separated. `KAIRO_BASE_ABILITIES` and `KAIRO_COMBO_HITS` in `src/game/data/kairoAbilities.ts` own action identity, timings, costs, ranges, hit limits, VFX/SFX event names, prompts and icon sources.
2. Run the existing fixed-step simulation pipeline: input edge → deterministic availability check → authored animation phase → contact/projectile event → hit resolution and Pulse update → renderer/audio event → snapshot-driven HUD. UI code reads ability snapshots; it does not own cooldown clocks.
3. Keep bolt, shockwave, dodge, finisher and Ember preview cooldowns in separate per-ability slots. The finisher consumes 75 Pulse and Ember preview consumes 40; the shockwave has an independent 4.8 second cooldown and no Pulse cost. A parry restores 18 Pulse; combo contacts restore 7/8/10, bolt contact 5, shockwave contact 6 and a kill 9. Pulse is capped at 100.
4. A basic attack is edge-triggered, buffered for up to 270 ms and advances at most one combo hit per press. The three hit definitions own different damage, timing, arc, knockback, target cap and SFX/VFX identifiers. Bolt input maps to one projectile press and never aliases the combo action.
5. Use four authored views in the existing order front/right/back/left. Continuous aim is quantized to the dominant cardinal view and the corresponding combat hit arc; diagonals do not claim unique authored art. Direction mapping remains presentation-only.
6. WebAudio synthesis is original and event-driven. Combat and UI sounds share the master level but UI events are mixed at 65% of the effects setting. Browser gesture unlock and focus suspend/resume remain in the runtime adapter.
7. Generated art stays outside production approval until owner review. The build script records source grids, trim bounds, pivots, per-direction scales and removed detached components. The finisher right row is an explicit corrected source override following owner feedback.

## Consequences and limits

- The gameplay contract and HUD can read the same ability definitions and runtime snapshot. Automated tests cover input cardinality, direction-row progression, Pulse affordability, cooldown separation and existing iframe/hit checks.
- The current renderer, enemies and room slice remain prototypes. No per-frame hitbox geometry, diagonal animation art, music, physical-controller test or live Chrome sound/feel review is complete.
- Generated HUD imagery currently crops animation frames rather than using standalone ability glyphs. Generated art, audio mix and human combat feel remain owner-review items.
- The full visible Chrome evidence gate could not be run because the browser automation host was unavailable. See `docs/qa/b04-evidence.md`.

## Alternatives considered

- Keep B03 scattered timers and UI labels: rejected because costs, cooldowns and animation/audio contracts would drift.
- Automatically play all combo strikes from one input: rejected; one press must issue one strike and subsequent presses queue later hits.
- Replace Canvas2D or migrate to Phaser during B04: rejected; this slice does not provide evidence that a renderer rewrite is required.
