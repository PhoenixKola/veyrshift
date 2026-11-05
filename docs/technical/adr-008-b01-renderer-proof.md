# ADR-008: Keep Canvas2D interim after B01 renderer proof

**Date:** 2026-11-05
**Status:** Proposed; owner approval required. No final renderer lock.

## Context

B01 added an actual title/pre-run/gameplay shell and generated state-pose art, plus a separate development-only same-scene Canvas2D/Phaser comparison. The simulation remains in `CombatSession`; both renderers in the proof draw a bounded scene without changing simulation code. Full results and limits are in [`b01-renderer-evaluation.md`](b01-renderer-evaluation.md).

## Proposal

Continue Canvas2D as the interim renderer for the next bounded combat-feel slice. Keep the Phaser spike available on the dev-only `renderer-proof.html` page for repeatable comparisons. Do not migrate the game or lock a production engine during B01.

## Evidence and rationale

In a nine-second visible Chrome 156 sample at 1260×900, both modes reported a 4.2 ms median frame interval. The p95 intervals were 4.3 ms for Canvas2D and 7.1 ms for Phaser; their measured render intervals were 0.0/0.2 ms and 0.1/0.3 ms median/p95 respectively. Canvas synchronous call timing and Phaser PRE_RENDER→POST_RENDER timing are not exactly equivalent, and this small test lacks production actors/effects/assets. Phaser reached its first rendered frame in 182.8 ms after its module was already loaded, while Canvas drew its first scene in 1.1 ms. Same-tab Chrome heap readings are approximate and not isolated. No data supports a final performance winner.

Canvas2D remains the least disruptive choice while the game has a tiny number of one-frame character poses. Phaser does not solve the current missing rig/animation authoring pipeline. The generated visual style and title/menu presentation are also owner-review proposals.

## Consequences

- Keep the Canvas and standalone preview rendering paths available; preserve the simulation boundary.
- Keep Phaser a dev-only comparison dependency. The production `dist/` output contains no Phaser chunk.
- Re-run this comparison when an approved multi-frame/rigged character, production enemy density, effects, and target hardware are available.
- Obtain owner approval for game feel, visual direction, and renderer before production expansion.

## References

- [Phaser 3.90.0 release](https://phaser.io/news/2025/05/phaser-v390-released)
- [Phaser Core Events API](https://docs.phaser.io/api-documentation/namespace/core-events)
