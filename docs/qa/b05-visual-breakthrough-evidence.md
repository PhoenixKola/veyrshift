# B05 visual-breakthrough transformation proof

**Date:** 2026-11-06
**Scope:** Focused B05 corrective pass. This does not complete B05 or approve production art.
**Result:** Gate A passes as a proposal comparison. Gate B fails for animation quality. Full-game visual and audio review are blocked/not run.

## Gate and approval record

| Required status | Result | Evidence and limit |
|---|---|---|
| **ART PROPOSED** | PASS for silhouette distinction; owner review pending | [Front comparison](../../tests/evidence/b05/visual-breakthrough/comparison-front.jpg), [right comparison](../../tests/evidence/b05/visual-breakthrough/comparison-right.jpg), and [detail close-ups](../../tests/evidence/b05/visual-breakthrough/detail-closeups.jpg) show base, two Ember variants, and two Glass variants at 100%/75%, dark/midtone backgrounds, VFX off/on. Ember A uses a much larger segmented bronze cuff; Ember B broadens the shoulder and coat tails. Glass A adds angular translucent shoulder/coat geometry; Glass B keeps a narrow shape with open forearm loops. The provisional motion candidates are Ember A and Glass A. These are generated proposals, not final master art or owner-approved work. |
| **ANIMATION DEMONSTRATED** | **FAIL** — draft is a timed pose sequence, not fluid animation | [Ember pose board](../../tests/evidence/b05/visual-breakthrough/sequence-ember-normal-scale.jpg), [Glass pose board](../../tests/evidence/b05/visual-breakthrough/sequence-glass-normal-scale.jpg), and the timed previews show eight authored drawings held for 5.02s and 5.06s. Large body/anchor changes and long still holds remain visible; no in-betweens, controlled deformation, or secondary motion were authored. Do not call these clips fluid or polished. |
| **IN-GAME VERIFIED** | **NOT RUN / BLOCKED** | A dev-only trigger uses the real `GameController`, `CombatSession`, `CanvasRenderer`, combat event VFX, and Web Audio event path. CUA reported the browser host unavailable; the permitted headed-browser fallback was rejected by execution policy. Therefore the actual Vite scene was not watched or captured, and the integration is not visually verified. |
| **AUDIO HEARD** | **NOT RUN / BLOCKED** | The showcase drives existing event-based synthesized sounds from the browser sound bus. No browser was available for listening, so timing, mix and quality have not been heard. |
| **OWNER APPROVED** | **NOT RUN / REQUIRED** | Owner must review the proposals and decide whether to continue with the silhouette direction and a different motion-production method. |

## Production and combat evidence

- Four new front/right concept alternatives were generated. Their alpha remains intact; the builder crops only to fit comparison frames. No pixels or disconnected components are deleted from source masters.
- One eight-pose source grid was retained for each provisional candidate. Every source cell has zero alpha contact at the cell boundary using a threshold of 32. The reproducible cell audit, timings, source and runtime byte counts are in [`art-source/b05/visual-breakthrough/manifest.json`](../../art-source/b05/visual-breakthrough/manifest.json).
- The offline GIFs are explicitly labeled timed-pose previews. They contain one frame per authored pose with the listed hold durations; they are not captured from Chrome or the game renderer.
- The dev-only `?b05showcase=1` path supplies fixed inputs to normal combat simulation: Ember transformation and a real directional combo hit; Glass transformation, an enemy telegraph, a dodge that avoids the telegraphed hit and earns the counter, then the counter-gated special. The proof target and seed are deterministic. No save unlock is persisted by the harness.
- New core tests check the time table and exercise the real combat hitbox, dodge iframe/counter window, Glass special, and reversion. These checks establish simulation behavior only.
- Stage 3's new multi-layer VFX authoring was **not started** after the animation-quality stop condition. Existing form VFX/SFX remain as-is and do not satisfy Gate C.

## Browser, viewport, accessibility and controller status

- Visible CUA browser: **BLOCKED** (host unavailable). Headed-browser fallback: **BLOCKED** (execution-policy rejection). No policy restriction was bypassed.
- Actual Vite browser screenshots/video at a normal 16:9 size or 960×540: **NOT RUN**. The generated comparison is fixed at actual renderer sprite draw dimensions (100×140) and 75%; it is not an in-game capture.
- Browser audio: **NOT RUN**. Physical gamepad: **NOT RUN**. Reduced-motion/reduced-flash live presentation: **NOT RUN**.
- No actual gameplay recording exists in this batch. The GIFs and contact boards are marked simulated/static evidence.

## Source/runtime size

| Artifact | Bytes | MiB | Status |
|---|---:|---:|---|
| Nine generated source PNGs, including selected rejection evidence | 13,451,140 | 12.83 | Editable source masters; includes 5,157,722 bytes / 4.92 MiB of rejected drafts. |
| Two development preview WebP atlases | 589,476 | 0.56 | Vite-only source assets; not included in `public/` or `dist/`. |
| Seven comparison/contact/GIF evidence files | 1,025,988 | 0.98 | Offline review material. |
| Production bundle addition | 0 | 0.00 | `dist/art-source/` does not exist after production build. |

## Owner-local replay

1. From the repository root run `npm ci` and `npm run dev`.
2. Open `http://127.0.0.1:5173/?b05showcase=1` in Chrome at a 16:9 viewport. The page loads directly into the real game scene.
3. Click **PLAY EMBER DRAFT** and **PLAY GLASS DRAFT**. Each click starts a deterministic five-second draft replay. Audio begins on the button gesture. Escape or the pause control pauses it.
4. Record each replay at normal speed with desktop capture, preserving sound. Please share the two short captures so the actual scene, sequencing and audio can be reviewed before further art work.

At 960×540, keep Chrome's page viewport exactly 960×540. Do not compare a scaled browser capture with the large concept sheet as if it were game-render evidence.

## Verification completed in this batch

| Command/check | Result |
|---|---|
| `python tools/build-b05-visual-breakthrough.py` | PASS; regenerates both scale comparisons, detail close-ups, source-cell audit, runtime preview atlases, contact boards, and timed-pose GIFs. |
| `npm ci` | PASS; clean install, 71 packages added, 0 vulnerabilities reported by install. |
| `npm run typecheck` | PASS. |
| `npm run build` | PASS; Vite production build completed (45 modules). `dist/art-source/` is absent. |
| `npm test` | PASS, 42/42. Includes two added visual-proof timeline/combat simulation tests. |
| `npm audit` | PASS; 0 vulnerabilities. |
| Export consistency | PASS; builder rerun regenerated the comparison boards, source-cell audit, runtime preview atlases, contact boards and timed-pose GIFs. |
| Vite dev HTTP smoke | PASS; query-route HTML, both WebP atlases, and transformed `CanvasRenderer.ts` each returned HTTP 200. This is a server check, not a browser visual review. |
| `git diff --check` | PASS; no whitespace errors. |
| Visible Vite/Chrome review and audio listen | BLOCKED / NOT RUN as above. |

## Decision and next step

The silhouette study is worth owner review. The motion method has **failed the requested quality gate**: independent full-character generation produced dramatic pose changes but not consistent, continuous performance. Preserve the source and rejection log; stop producing more independent pose grids. The next tightly scoped continuation should first establish a reference-locked layered 2D rig (or a human-reviewed key-pose/in-between workflow) for one short transformation, prove the first motion at 100×140 and normal playback, and only then repeat for the second form. Do not begin form-atlas expansion or B06 work from this proof.
