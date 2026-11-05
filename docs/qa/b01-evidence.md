# B01 evidence: player shell, controller foundation, art and renderer proof

**Date:** 2026-11-05
**Starting commit:** `60511a703de6776d00ebf9dff5c996dc0f3023f1`
**Evidence timing:** captured against the starting commit after B01 implementation, before its commit.
**Status:** implementation and evidence captured; owner approval required.

## Environment and commands

- Windows 11 x64, Node `v22.22.0`, npm `11.11.0`, Google Chrome `156.0.8078.80`.
- `npm ci` â€” PASS; 71 packages installed; audit reported 0 vulnerabilities.
- `npm run typecheck` â€” PASS.
- `npm run build` â€” PASS; Vite 6.4.5 transformed 40 modules. Output: `dist/assets/index-*.js` 234.80 kB (74.40 kB gzip), CSS 13.88 kB (4.23 kB gzip). No Phaser chunk is emitted. Source masters stay outside `public/` and are not copied into `dist/`.
- `npm test` â€” PASS; 16/16 tests, including original deterministic combat loop tests and B01 navigation, migration, gamepad mapping, melee hitbox and invulnerability tests. The dependency-free standalone preview is rebuilt by this command.
- `npm audit` â€” PASS after clean install; 0 vulnerabilities.
- `python tools/optimize-b01-assets.py` â€” PASS; alpha-trimmed/resized the B01 runtime files and retained source masters under `art-source/b01/`.
- `node tools/b01-chrome-check.mjs` â€” PASS on visible Google Chrome against the real Vite/React app. `result.json` records viewport geometry, settings persistence, hardware availability, console errors and failed requests. Errors: `[]`; failed requests: `[]`.
- `node tools/b01-renderer-benchmark.mjs` â€” PASS on visible Chrome; 9-second same-tab sample per renderer, screenshots and raw output recorded below.
- Playwright `1.54.2` was installed with `npm install --no-save` only to drive Chrome and is not in `package.json` or the lockfile. That temporary install reported one high-severity advisory. A subsequent clean `npm ci` restored the declared dependency set and the final `npm audit` was clean (0 vulnerabilities).
- The first dev-server command `npm run dev -- --port 5174` passed an extra positional `5174` through npm 11; Vite returned 404 at the tested root. It was stopped and replaced with `npx vite --host 127.0.0.1 --port 5174`; the browser run then passed. This was a test-launch correction, not an app failure.

## What was exercised in Chrome

The script opened the actual React app and navigated Title â†’ Character â†’ Forms â†’ Records â†’ Credits â†’ Settings â†’ Hub â†’ Game. It adjusted master/effects volume, enabled reduced flash and reduced motion, disabled particles, verified the music control is disabled, reloaded and confirmed master volume `0.64` and save schema v2 persisted. Fullscreen enter/exit succeeded.

In the live game it sent WASD and arrow movement, mouse aim and left-button strike, right-button shot, Shift dash, Q special, held E guard, F finisher input, Escape pause/resume, and a synthetic `window.blur` while movement was held to check input clearing and auto-pause. The short Ember activation was demonstrated after the explicitly development-only `DEV · SEED FORM PREVIEW` fixture seeded Pulse; this is visual-feasibility evidence, not normal resource-earned form UAT. The enemy telegraph was shown with a dev-only fixture, both in color and in a grayscale capture with the reduced-flash setting enabled.

Reward selection and the three-room victory overlay were exercised with the development-only `DEV · FORCE ROOM CLEAR` fixture. This validates the actual React overlay, controls and route transition, but does not claim ordinary combat was cleared in the browser. The browser session had no physical controller (`navigator.getGamepads()` returned zero connected pads before the test mock). A Gamepad API-shaped mock moved menu focus with D-pad and confirmed Character with A; unit tests cover the standard action indices, edge/held behavior, dead zone, persistent aim and disconnect reset. **Physical gamepad hardware: NOT RUN.**

## Responsive and visual captures

Screenshots and the Chrome video are in [`tests/evidence/b01/chrome/`](../../tests/evidence/b01/chrome/).

| Evidence | Description |
|---|---|
| `title-menu.png` | New title menu with dedicated original illustration. |
| `character-hub.png`, `character.png` | Kairo pre-run selection and character record. |
| `forms-locked-prototype.png`, `records.png`, `settings.png`, `credits.png` | Reachable menu pages; prototype/locked status is explicit. |
| `gameplay-native.png`, `combat-action-poses.png` | Actual live combat canvas at native viewport after mouse/keyboard actions; generated Kairo and enemy PNGs loaded. |
| `gameplay-75-percent.png` | 1110×740 capture (75% of the 1480×980 browser window). |
| `gameplay-16-9.png`, `gameplay-16-10.png`, `gameplay-ultrawide.png`, `gameplay-reduced.png` | 1920×1080, 1600×1000, 2560×1080 and 960×540 aspect/size checks. Canvas remains centered at the 1180:680 world ratio; document scroll dimensions equal viewport dimensions. |
| `pause.png`, `pause-focus-loss.png`, `reward.png`, `victory.png` | Pause, focus-loss auto-pause, reward choice and completed result overlays. Reward/victory are reached using the dev fixture described above. |
| `ember-visual-gameplay.png` | Generated Ember visual pose rendered in live combat during the short activation preview. |
| `enemy-telegraph.png`, `gameplay-reduced-flash-grayscale.png` | Original generated Rift Wisp with separate tell; grayscale/reduced-flash readability check. Agent inspection only; owner combat-readability signoff pending. |
| `b01-gameplay-evidence.webm` | Visible Chrome page recording through menu, settings, gameplay input, form preview and UI checks. Recording is screen/page evidence, not owner game-feel approval. |
| `renderer-canvas-live.png`, `renderer-phaser-live.png`, `renderer-results.json` | Same-scene development renderer samples. |

Chrome metric output in `result.json`: no page exceptions or failed requests; settings reloaded at the modified value; fullscreen entered/exited; 1480×980 native and 1110×740 (75%) document dimensions matched the viewport; the 16:9, 16:10, ultrawide and reduced viewports had no horizontal/vertical document overflow.

## Generated art prompts and provenance notes

Generation tool: OpenAI built-in image generation. Date: 2026-11-05. All are proposals; no external image/name clearance or owner likeness review was performed. Tool generation metadata did not expose a model/version, and the prompt transport log did not preserve a verbatim invocation in the repository. The following prompt briefs are recorded from the generation request; they are **not represented as verbatim transcripts**:

1. **Kairo master** (`art-source/b01/kairo-master-direction-b.png`): original full-body anime action roguelite fighter based on provisional B00 Direction B inked 2.5D; lean athletic stance; asymmetric plum hair; charcoal split jacket; bronze kinetic cuffs; original face and silhouette; transparent background; no weapon, aura, text, logos or existing-IP costume cues.
2. **Punch pose** (`art-source/b01/kairo-punch-right.png`): same Kairo identity and outfit as the master; single clear right-authored punch state pose; transparent background; preserve face, hair, asymmetrical cuff and palette; no collage, captions, extra characters, or borrowed signature attack.
3. **Dodge pose** (`art-source/b01/kairo-dodge-right.png`): same Kairo identity/outfit; single low, compact right-authored evasive pose with readable silhouette and feet; transparent background; no collage, text, speed-line background or borrowed animation.
4. **Ember visual** (`art-source/b01/kairo-ember-visual.png`): same base identity, outfit and asymmetry; a brief visual-only form proposal with articulated amber plates/orbiting geometry changing the silhouette; transparent background; no text/weapon; not an instruction to imply completed mechanics.
5. **Rift Wisp** (`art-source/b01/rift-wisp.png`): original non-humanoid angular rift enemy with compact floating silhouette, distinct cool material/light, transparent background, no baked attack tell or text. The tell is authored separately in Canvas.
6. **Title background** (`art-source/b01/title-background.png`): original moody broken-weave arena scene, Kairo placed on the right and dark negative space on the left for UI, wide cinematic composition; no typography, logos, copied game UI or third-party reference images.

Runtime derivatives are generated reproducibly by `tools/optimize-b01-assets.py`; source masters are not inside the web public directory. Sizes, hand-estimated pivot/ground anchors, facing and one-frame duration are in [`docs/art/b01-frame-manifest.json`](../art/b01-frame-manifest.json). Pipeline limitations and next steps are in [`docs/art/b01-runtime-pipeline.md`](../art/b01-runtime-pipeline.md). All generated assets remain `PROPOSED`, owner signoff `NO` in the provenance ledger.

## Renderer comparison

The same deterministic 1180×680 scene ran nine seconds in each mode in Chrome 156 at 1260×900: 16 floor lines, one moving actor, one enemy, telegraph, melee arc, animated form orbit. Canvas ran first; Phaser 3.90.0 ran second in the same tab. The measured result was:

| Measure | Canvas2D | Phaser 3.90 |
|---|---:|---:|
| Frame samples | 2,144 | 2,109 |
| Frame interval median / p95 | 4.2 / 4.3 ms | 4.2 / 7.1 ms |
| Measured render interval median / p95 | 0.0 / 0.2 ms | 0.1 / 0.3 ms |
| Startup to first rendered frame | 1.1 ms | 182.8 ms |

The Phaser module was already downloaded before timing startup. Canvas measures synchronous draw calls; Phaser measures its PRE_RENDERâ†’POST_RENDER window. The workload is tiny and does not represent animation atlases, production actor counts, post-processing or heavy effects; no performance win is claimed. `performance.memory.usedJSHeapSize` was available but is approximate and cumulative in one page, not isolated GPU/process memory. Detailed qualifications and the provisional recommendation are in [`docs/technical/b01-renderer-evaluation.md`](../technical/b01-renderer-evaluation.md) and [`docs/technical/adr-008-b01-renderer-proof.md`](../technical/adr-008-b01-renderer-proof.md).

## B01 status matrix

| Feature | Status | Evidence / owner gate |
|---|---|---|
| Full-viewport player shell, title and pre-run hub | PASS (prototype) | Actual Chrome; owner visual direction approval pending. |
| Character, Forms, Records, Settings, Credits navigation | PASS (prototype content) | Pages navigated; unimplemented content is labeled locked/prototype. |
| Gameplay responsive fit and minimal HUD | PASS (viewport geometry) / PARTIAL (visual approval) | Screens at native, 75%, 16:9, 16:10, ultrawide, reduced. |
| Pause, reward and victory screens | PASS (actual UI routes) | Pause from keyboard and blur; reward/victory via explicit dev fixture. Ordinary full combat completion in browser is NOT RUN. |
| Keyboard/mouse live controls | PASS (bounded input exercise) | WASD/arrows, mouse buttons, dash, special, guard, finisher, pause. Owner input feel signoff pending. |
| Gamepad mapping/menu | PASS (unit + API mock) / NOT RUN (hardware) | Synthetic menu focus/confirm; 16 tests cover action indices and mapper semantics; physical controller unavailable. |
| Versioned settings and v1 migration | PASS | Browser localStorage reload plus deterministic parser tests. |
| Generated Kairo art in real game | PARTIAL | Single stills integrated into hub/combat. No generated locomotion loop or multi-frame attack/dodge sequence. |
| Enemy and tell / grayscale/reduced-flash | PARTIAL | Live Chrome screenshot; automated pixel/telegraph contrast validation and owner readability approval are absent. |
| Ember Drive complete transformation | FAIL / PROTOTYPE ONLY | Visual preview shown; changed move set, movement/defense, finisher and full VFX/audio quality are not implemented. |
| Canvas2D/Phaser engineering comparison | PARTIAL / MEASURED BOUNDED SPIKE | Data present; not representative enough for final engine lock. |
| V2 vision byte-for-byte unchanged | PASS | `git diff --exit-code -- docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md` returns zero. |
| Owner signoff | NOT RUN / REQUIRED | Listed next. B01 is not accepted solely because automated checks pass. |

## Owner approval required before B02 production expansion

1. **Gameplay art direction:** keep the provisional inked 2.5D Kairo proposal for a larger animation test, revise it, or return to the B00 painted proposal. The B00 boards are at `public/assets/_b00-concepts/`; B01 title/hub/gameplay proposals are `title-menu.png`, `character-hub.png`, and `gameplay-native.png`.
2. **Renderer:** accept Canvas2D as interim for the next combat-feel slice, request another bounded comparison, or direct a Phaser prototype. ADR-008 is a proposal, not a lock.
3. **Title/menu presentation:** accept this provisional internal-codename treatment for iteration, or request visual/wordmark/background changes. No trademark/title clearance is claimed.
4. **Input feel:** approve the keyboard/gamepad baseline for a human playtest, or list desired button changes/dead-zone/repeat behavior. Physical gamepad review is still outstanding.

## Walkthrough

`npm ci` â†’ `npm run dev` â†’ open the printed local URL. Select **New Run** and then **Start Run**. Move with WASD/arrows or the left stick; aim with mouse or right stick; use left click/A for strike, right click/RB for ranged shot, Shift/B for dodge, Q/X for special, hold E/LB for guard, R/RT for the prototype form when Pulse is available, and F/LT for the finisher when charged. Press Esc/Start to pause; resume or abandon to the hub. Fullscreen is available in the hub. Do not use `?dev=1` outside local development; it exposes the development-only room/form/telegraph fixtures. The renderer comparison is a separate dev Vite page at `/renderer-proof.html`.

## Repository handling

No commit, push or deployment was made for B01. The B00 root-prompt deletion and untracked B01 prompt were already present as user changes; both were preserved and neither was staged. The worktree contains B01 implementation/evidence files awaiting owner review.
