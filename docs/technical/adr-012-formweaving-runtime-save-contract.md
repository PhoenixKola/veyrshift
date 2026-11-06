# ADR-012 — Kairo form selection, persistence and prototype combat contracts

- **Date:** 2026-11-06
- **Status:** Implemented as a reviewable prototype; visual/gameplay approval pending

## Context

B04's Ember action was a temporary preview and save schema v2 had no equipped form or unlock progress. B05 needs a bounded, data-described Kairo form choice without making the long-term 42 records look implemented.

## Decision

1. Keep `KAIRO_FORMS` separate from vision-only `FORMS`. Only Ember Drive and Glass Current have prototype runtime records. Ember is initially unlocked; Glass unlocks after five successful parries persisted as `precisionTrials`.
2. Save v3 stores the equipped form and trial progress. v1/v2 saves migrate conservatively to Ember while retaining shards, run records, settings and known progress. Unknown form IDs fall back safely.
3. A run copies the equipped selection once. R activates the selected form; Pulse activation cost, duration, upkeep and cooldown remain bounded. R can end an active form early. Paused/hidden game states do not advance combat simulation.
4. The combat prototype differentiates Ember with combo marks/detonation, a small projectile splash, forward special, faster pursuit and reduced dodge iframe time. Glass has a longer dodge, a one-shot counter window on a correctly timed avoided attack, a counter-only special and a piercing projectile. The form finisher tuning differs. These rules are proposals, not balanced playtest results.
5. Existing renderer/input/simulation boundaries remain. Art is not loaded as production form art until a consistent master and full action coverage pass source-cell review. This ADR does not approve the current proxy hue/aura effect.

## Consequences and limits

- Selection, unlock progress and gameplay rules can be tested deterministically and saved across sessions.
- Current animations remain base/proxy animation; no alternate form animation set, dedicated glyph set, authored B05 VFX, or designed audio package is integrated. The art and real-browser gates remain blocked/partial.
- Glass's five-parry requirement can be met in the existing prototype; there is no boss-specific balance evidence. The B06 major appearance swap remains an architecture target, not a validated readiness claim.
