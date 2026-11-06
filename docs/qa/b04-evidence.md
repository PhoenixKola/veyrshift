# B04 evidence — Kairo base combat (2026-11-06)

**Status:** Implementation proposal; owner visual/game-feel approval pending. The visible Chrome gameplay gate remains blocked in this environment, so this is not a completed production-quality signoff.

## Finisher direction repair

The owner flagged the fourth pose's head direction and stray pixels from neighboring source cells. I generated a corrected four-pose screen-right strip from the annotated reference, removed the markup, and use it as the right-facing row override in the runtime atlas. The four phases now retain the same screen-right head/action direction. The atlas builder removes and records detached components below 12% of each cell's dominant silhouette; contact sheets were rebuilt from the runtime atlases.

- Source correction: `art-source/b04/kairo-finisher-right-strip.png`
- Directional master: `art-source/b04/kairo-finisher-grid.png`
- Runtime atlas: `public/assets/characters/kairo/b04/finisher.webp` (768×1024; 4 phases × 4 cardinal rows)
- Contact sheet: `tests/evidence/b04/contact-sheets/finisher.png`
- Chrome-rendered preview of the corrected right-facing runtime row: `tests/evidence/b04/chrome-finisher-runtime.png` (Chrome 156.0.8078.80; 1600×620)
- Contact sheets for other clips: `tests/evidence/b04/contact-sheets/`
- Painted generated VFX board: `tests/evidence/b04/contact-sheets/vfx-generated-contact-sheet.png`
- Source, trim, scale, pivot, component cleanup and rejected-draft metadata: `docs/art/b04-asset-manifest.json`

The correction prompt is recorded in the manifest. ImageGen version metadata was not exposed. Earlier B04 generation prompts were not retained verbatim. All generated source assets remain proposed pending owner review.

## Automated verification

| Command | Result |
|---|---|
| `npm ci` | PASS; installed 71 packages; no install-time audit findings |
| `npm run typecheck` | PASS |
| `npm run build` | PASS; Vite production bundle produced |
| `npm test` | PASS; 25/25 core tests, including one-press/one-strike, one-bolt, cooldown separation, Pulse affordability and finisher direction-row progression |
| `npm audit` | PASS; 0 vulnerabilities |
| `python tools/build-b04-art.py` | PASS; rebuilt character atlases, VFX exports, contact sheets and manifest |
| `git diff --check` | PASS; no whitespace errors (Git emitted normal LF→CRLF notices for Windows checkout) |

The test suite checks deterministic simulation rules and build artifacts. It does not establish visual quality, sound quality, frame-perfect hitbox alignment or human game feel.

B04 adds about 29.5 MB of source masters/rejected art (21 files). Optimized runtime atlases are about 2.34 MB (8 files) and generated runtime VFX are about 0.53 MB (6 files). These are the B04 additions only, not a full repository/archive measurement.

## Browser and hardware verification

The CUA browser host reported that browser access was unavailable. Chrome rendered the corrected runtime atlas preview, but the visible gameplay run could not exercise title → hub → gameplay, real keyboard/mouse input, audio, pause/settings navigation, reward/defeat routes, reduced-effects modes, or 16:9/16:10/960×540 layouts. No normal-speed gameplay clip or in-game screenshot was captured for B04. Physical controller testing is **NOT RUN**. Do not treat the source/contact sheets, atlas preview or automated tests as substitutes for these gates.

## Current tuning record

Values below are implementation values, not human-playtest results. Targets are estimates for the current prototype enemies.

| Action | Damage / effect | Timing | Cost / cooldown | Pulse gain |
|---|---|---|---|---|
| Combo hit 1 | 14; 86 range; 0.84 rad; cap 2 | 65 ms windup, 55 ms active, 190 ms recovery | No separate cooldown; next press buffered for 270 ms | 7 per hit |
| Combo hit 2 | 19; 92 range; 0.88 rad; cap 2 | 90 ms windup, 65 ms active, 200 ms recovery | No separate cooldown | 8 per hit |
| Combo hit 3 | 31; 108 range; 1.16 rad; cap 3 | 135 ms windup, 85 ms active, 300 ms recovery | No separate cooldown | 10 per hit |
| Kinetic Bolt | 24; 620 travel range; cap 1 | 105 ms cast windup | 0 Pulse; 0.52 s cooldown | 5 on hit |
| Resonance Shockwave | 24; 172 radial range; cap 8; 238 knockback | 220 ms windup; 90 ms active | 0 Pulse; 4.8 s cooldown | 6 per hit |
| Slipstream Dodge | 820 movement speed | 190 ms dash; 260 ms invulnerability | 0 Pulse; 0.88 s cooldown | — |
| Counterguard / parry | Block reduces damage to 32%; parry negates hit | First 220 ms is parry window | No cooldown | 18 per parry |
| Threadbreak finisher | 72; 244 range; 1.22 rad; cap 3; 360 knockback | 270 ms windup; 100 ms active; 430 ms recovery | 75 Pulse; 10 s cooldown | — |
| Ember Drive preview | Temporary damage modifier/presentation | 720 ms activation; up to 8 s active | 40 Pulse; 11 s cooldown | — |

Pulse caps at 100. A kill adds 9 Pulse. The current prototype time-to-kill estimates (wisp 1.5 s, striker 2.6 s, sentinel 4.5 s) are authored targets, not measured clear times.

## Open visual and acceptance items

- Inspect every action at game scale in visible Chrome and normal-speed motion; the finisher source correction has only contact-sheet review here.
- Confirm all attacks, hit reactions, VFX layers and synthesized sounds are legible and correctly timed in an ordinary run.
- Capture before/after B03→B04 combo and locomotion evidence; verify startup/braking feet and diagonal pose/impact agreement.
- Exercise HUD cooldown/availability truth, pause tabs and saved settings in Chrome; test controller glyph switching and physical hardware if available.
- Review rendered 960×540, 16:9, 16:10, reduced-motion, reduced-flash and particles-off states.
- Dedicated stand-alone ability glyphs remain incomplete; HUD images currently crop generated animation frames. No music asset is present.
- Ember Drive remains a prototype and does not meet the form contract.
