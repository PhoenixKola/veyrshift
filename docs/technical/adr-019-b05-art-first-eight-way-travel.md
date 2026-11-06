# ADR-019 — B05 art-first eight-way travel candidate

Date: 2026-11-06. Status: provisional, owner visual approval pending.

The simulation retains its existing cardinal attack-facing and angle-based hit arcs. `Hero.moveFacing` now stores eight travel directions selected from the movement vector with a small hysteresis dead band. `animationResolver` maps the four new diagonals to rows 4–7 for base and Ember idle/run, while Glass and older transition/dodge sheets use cardinal fallback rows. This preserves deterministic combat, saved data, and the existing renderer boundary.

`CanvasRenderer` loads the newly exported base/Ember atlases during ordinary play. New right-facing combo and Ember action cells are selected at their real hit/action phases. Existing authored rows handle all other attack facings until corresponding body art is made. Ember right-facing activation/reversion uses a new four-stage strip; other views use the existing crossfade. No engine or save-schema change was made.

The tradeoff is explicit: eight-way **travel** is newly illustrated for base and Ember, but eight-way **combat** is incomplete. In particular, mouse aim at diagonals still maps to cardinal strike art, and the new action strips are only right-facing. This remains a partial B05 gate, not a full form approval.
