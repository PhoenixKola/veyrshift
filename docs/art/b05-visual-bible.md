# B05 form art direction — candidate proposal, owner approval pending

**Updated 2026-11-06. Status: PARTIAL.** Two replacement turnaround candidates, four-direction run and combo source grids, six-icon families, and six-purpose VFX texture sheets are in `art-source/b05/review/`. The deterministic exporter writes lossless candidate WebP assets under `public/assets/`; none is approved for production. Source-cell checks and dark-background contact sheets are in the B05 manifest and `tests/evidence/b05/`.

## Ember Drive — Fury

Retain Kairo's recognizable plum hair, cropped charcoal jacket, split plum coat tails, bronze kinetic cuffs, lean adult build and proportions. Candidate design pushes a heavier forward stance and a stronger articulated bronze cuff lattice with ember light. Contact uses a hot faceted burst; the bolt is a compact forward streak; the special is a grounded sweep; the finisher is a descending comet; reversion uses an inward spiral. The current candidate turnaround was inspected on charcoal, but live normal-size/silhouette comparison, grayscale approval and owner review remain pending.

## Glass Current — Precision

Retain the same identity and dark plum hair. Candidate design uses refined cuff facets, cooler glass insets and a narrower controlled stance. Contact is a refracted star, the projectile is a clean piercing lance, the special is a counter cross-cut, the finisher is a focused linear cut, and reversion leaves a pair of clean motion contours. The current candidate turnaround was inspected on charcoal; directional continuity, grayscale readability and owner approval remain pending.

## Exported candidate coverage

- Character sheets: 4 directions (`front`, `right`, `back`, `left`) × 4 run key poses and 12 combo poses per form. Each combo hit has four generated phases. Boundary count is zero; the builder clears only low-alpha edge noise (alpha 1–32) and never deletes disconnected components.
- HUD glyphs: six separate 128×128 textures per form (`identity`, `activation`, `bolt`, `special`, `finisher`, `combo`). They are rendered in the form screen and transformed HUD, alongside Ember target-mark/detonation status or Glass counter-window status.
- VFX textures: six separate 256×256 transparent textures per form (`activation`, `contact`, `bolt`, `special`, `finisher`, `transition`). Canvas2D selects these from form-tagged events and animates their size/opacity over event lifetime. This is single-texture presentation, not a layered particle animation.
- WebAudio: distinct procedural cues are routed for form activation/reversion, combo hits, projectile, special/counter and finisher. They are unlistened proposals. No active loop or authored recording exists.

## Missing production states and acceptance gates

Form-specific character art is still missing for idle, dodge, guard/parry, hurt/KO, ranged cast, special, finisher, active loop and fluid activation/deactivation. Run/combo sheets contain short key-pose sequences, so the at-speed offline GIFs are an export/playback aid, not proof of fluid motion. Start/stop and other states still use inherited base art. The two masters have not been checked in an actual browser at normal gameplay scale; no owner approval, audio listening, controller test, boss-room test, or sustained-effects performance measurement exists.

Keep these proposals out of any “approved” category. Do not claim B05 complete or B06 appearance-swap readiness. For current per-gate status and owner capture steps, see `docs/qa/b05-completion-evidence.md` and `docs/qa/b05-evidence.md`.

## Provenance

Generated with OpenAI built-in ImageGen on 2026-11-06. Model/version and seed were not exposed. Exact prior-turn prompts were not retained in the repository; reconstruction notes are explicitly labeled in `docs/art/b05-generation-notes.md`. Source PNGs remain under `art-source/b05/review/`; failed sheets are retained under `art-source/b05/rejected/`. Runtime mapping, hashes, dimensions, cell checks and pivots are in `docs/art/b05-animation-manifest.json`. No external likeness/IP clearance or owner signoff has occurred.
