# B05 finalization evidence ? 2026-11-06

**Status: PARTIAL. Live gameplay and owner visual/audio acceptance are blocked.** This continuation has not completed either form and does not establish B06 production readiness. Candidate source art, source-level checks and deterministic tests are recorded below.

## Current state-by-form acceptance

?Verified? below means the implementation has the stated source/automated checks. No row is live-game or owner visual verification.

### Base Kairo

| State | IMPLEMENTED | VERIFIED | OWNER APPROVED |
|---|---|---|---|
| Idle / run | Yes, base atlases | Existing resolver and asset tests; live check NOT RUN | No |
| Start/stop | Yes, base transition atlas | Existing routing; live check NOT RUN | No |
| Combo 1/2/3 | Yes, base combo art | Existing combat/timing tests; live check NOT RUN | No |
| Dodge / guard / parry | Yes, base art | Existing simulation tests; live check NOT RUN | No |
| Hurt / KO | Yes, base state art | KO simulation test; live check NOT RUN | No |
| Bolt / special / finisher | Yes, base art | Bolt/finisher timing and combat tests; live check NOT RUN | No |
| Activate / active / deactivate | Existing base transition and state handling | Expiry/save behavior unit tests; live check NOT RUN | No |

### Ember Drive

| State | IMPLEMENTED | VERIFIED | OWNER APPROVED |
|---|---|---|---|
| Idle | Yes, 4-direction candidate atlas | Source boundaries, runtime path and resolver tests | No; live review NOT RUN |
| Run | Yes, 4-direction candidate atlas | Source/runtime checks and resolver test | No; live review NOT RUN |
| Start/stop | No, base fallback | Fallback path remains; no live check | No |
| Combo 1/2/3 | Yes, 12-frame candidate atlas | Contact phase test, cell boundaries, manifest; GIF is offline only | No; live review NOT RUN |
| Dodge | Yes, 4-direction candidate atlas | Source margin/bounds and form duration/iframe tests | No; live review NOT RUN |
| Guard / parry | Yes, shared candidate atlas | Event-driven parry pose and one-shot guard tests | No; live review NOT RUN |
| Hurt / KO | No, base fallback | Two generated drafts rejected; fallback only | No |
| Bolt cast | Yes, 4-direction candidate atlas | Release at `.105s`, projectile form identity across expiry | No; live review NOT RUN |
| Special / finisher | No, base fallback art | Simulation events exist; no form character atlas | No |
| Activate / deactivate | Partial, base character state plus form effects | Form timer/expiry tested; transitions not reviewed live | No |
| Active loop | Partial, candidate idle atlas while stationary | Atlas path/margins checked; continuous motion unverified | No |

### Glass Current

| State | IMPLEMENTED | VERIFIED | OWNER APPROVED |
|---|---|---|---|
| Idle | Yes, 4-direction candidate atlas | Source boundaries, runtime path and resolver tests | No; live review NOT RUN |
| Run | Yes, 4-direction candidate atlas | Source/runtime checks and resolver test | No; live review NOT RUN |
| Start/stop | No, base fallback | Fallback path remains; no live check | No |
| Combo 1/2/3 | Yes, 12-frame candidate atlas | Contact phase test, cell boundaries, manifest; GIF is offline only | No; live review NOT RUN |
| Dodge | Yes, 4-direction candidate atlas | Source margin/bounds; `.24s` duration and earned-counter simulation tests | No; live review NOT RUN |
| Guard / parry | Yes, shared candidate atlas | Event-driven parry pose and one-shot guard tests | No; live review NOT RUN |
| Hurt / KO | No, base fallback | Generated draft rejected for repeated left-facing row; fallback only | No |
| Bolt cast | Yes, 4-direction candidate atlas | Release at `.105s`, cast-form snapshot and projectile tests | No; live review NOT RUN |
| Special / finisher | No, base fallback art | Counter gating/cast timing tested; no form character atlas | No |
| Activate / deactivate | Partial, base character state plus form effects | Form timer/expiry tested; transitions not reviewed live | No |
| Active loop | Partial, candidate idle atlas while stationary | Atlas path/margins checked; continuous motion unverified | No |

## Changes made

- Added candidate idle, dodge, guard/parry and bolt sources/atlases for both forms; extended form art routing in `CanvasRenderer`.
- Corrected Glass dodge duration so the form's `.24s` duration is not replaced by the base `.19s` duration.
- Restricted the Glass counter to a genuinely avoided hit during the dodge window. Glass special consumes an earned counter and waits for its cast windup. A committed cast retains its form identity if the transformation expires.
- Restricted perfect parry to once per guard press and show its candidate character pose only after a successful parry event.
- Made Ember marks detonate on the target's third confirmed contact, with a distinct event for the detonation.
- Aligned form bolt release art with the `.105s` windup and recorded simulation-based phase durations in combo manifest metadata. Fixed combo offline GIFs to show all four cardinal directions simultaneously at each phase.
- Rejected and retained `glass-hurtko-grid-v1-repeated-left-facing.png` and `ember-hurtko-grid-v1-cell-edge-noise.png`. Neither is exported to runtime. All other unsafe/incorrect B05 attempts remain in the rejected folder.
- The equal-scale base/Ember/Glass sheet is `tests/evidence/b05/base-ember-glass-scale-comparison.jpg`. It was inspected at 100% and 75% display scale; form silhouettes remain too similar to claim clear gameplay-scale differentiation.

## Verification and its limits

- `python tools/build-b05-art.py` regenerates the candidate assets, contact sheets and JSON manifest. It rejects above-threshold cell-edge contact, records component sizes and deletes no components automatically.
- `npm ci`: passed; 71 packages installed and the install audit reported zero vulnerabilities. `npm run typecheck`: passed. `npm run build`: passed (Vite production bundle built). `npm test`: **40/40 passed**, covering deterministic simulation, direction selection, combo and bolt timing, form projectile identity through reversion, Ember third-contact marks, Glass dodge/parry/counter, save migration, asset paths and candidate cell boundaries. `npm audit`: zero vulnerabilities. `python tools/build-b05-art.py`: passed. `git diff --check`: passed with only Windows LF-to-CRLF notices.
- Offline GIFs and contact sheets are not actual Vite gameplay, fluidity, visual quality or sound approval.
- A local Vite server returned HTTP 200 for the root and candidate resources. It did not provide interactive game verification.
- Current B05 asset footprint: review source PNGs 33.36 MiB (23 files); rejected PNGs 16.55 MiB (11); form character WebP runtime 8.11 MiB (12); UI runtime 0.19 MiB (12); VFX runtime 0.33 MiB (12); B05 evidence 13.94 MiB (46). This continuation adds 27.44 MiB before compression (19.18 MiB source/rejected art, 4.30 MiB form runtime, 3.95 MiB evidence, remainder docs). All current git-managed working-tree files total 234,820,199 bytes (~223.9 MiB). The live GitHub ZIP after this push measured 226,269,277 bytes (215.79 MiB); the GitHub ZIP for starting commit `e933624` measured 198,837,673 bytes (189.63 MiB), so this continuation adds 27,431,604 bytes (26.16 MiB) to the archive. Local `git archive` measurement was within 14 KB of the live GitHub ZIP. The earlier 110,280 KB screenshot preceded these subsequent B04/B05 batches and is not the `e933624` baseline. `prompts/` remains git-ignored and contains no tracked files.
- CUA returned `browser access host unavailable` and `Computer Use native pipe unavailable`. The visible Chrome launch fallback was rejected by execution policy. No real game video/audio, normal-speed transitions, controller, viewport/accessibility or performance stress evidence was captured.
- Audio remains unlistened procedural WebAudio; no form active loop or approved recordings. Layering is partial; polished event-linked flipbooks and in-game impact review are missing.
- B04 Threadbreak finisher and base HUD still lack a current live-game sample. Physical controller test is NOT RUN. No owner visual/audio/game-feel signoff was obtained.

## Remaining blockers

1. Generate and inspect safe four-direction form art for start/stop, hurt/KO, shockwave/special, finisher and fluid activation/deactivation; retain base fallback labels until each atlas is integrated and checked.
2. Improve the short key-pose sequences into fluid normal-speed animation and demonstrate visibly distinct base/Ember/Glass silhouettes and fighting styles at gameplay scale.
3. Build layered event-specific Ember and Glass effects; verify hit alignment, readability, reduced-effects behavior, bounded counts and sustained frame time in real play.
4. Listen and tune actual browser audio. Verify settings, HUD, keyboard and a physical controller if available.
5. Capture a continuous normal-speed Vite Chrome recording with sound through hub, each form's transitions/actions/reversion and B04 Threadbreak/base HUD. Check errors, resource loads, target viewports, 100%/75%, reduced effects, performance and 3+ enemies.
6. Obtain owner review of art, sound, animation and game feel. All generated assets remain proposals; external originality/likeness clearance is also NOT RUN.

## Owner-local Chrome recording steps

1. Run `npm ci` then `npm run dev` in the repository root. Open the printed localhost address in visible Chrome and keep DevTools Console and Network open.
2. Start from title, enter the hub and a run. Exercise WASD/arrows, mouse aim, click attacks, dodge, hold/release guard, bolt, special, finisher, pause/settings/save, then repeat with Ember and Glass through expiry/reversion.
3. Record one continuous 30?90 second normal-speed clip with sound after the first user gesture. Include B04 Threadbreak's corrected finisher and the base HUD. Do not substitute offline GIFs or standalone preview.
4. Include viewport sizes, Chrome version, machine and frame-time sample under concurrent effects; report console errors, missing requests, controller hardware used and any failed animation/facing/crop.

See `docs/art/b05-generation-notes.md`, `docs/art/b05-animation-manifest.json` and `docs/technical/adr-014-b05-animation-and-combat-event-timing.md` for source decisions and audit records.
