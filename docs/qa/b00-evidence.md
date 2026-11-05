# B00 evidence manifest — 2026-11-05

## Environment and commands

- Windows, Node `v22.22.0`, npm `11.11.0`; installed Google Chrome via `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- `npm install` — PASS; installed 69 packages, generated `package-lock.json`.
- `npm install --save-dev vite@6.4.5` — PASS; fixed the Vite advisory reported by the first audit and updated the lockfile.
- `npm run typecheck` — PASS.
- `npm run build` — PASS; Vite 6.4.5 production bundle completed.
- `npm test` — initial attempts exposed Windows portability issues in the nested npm script, Python launcher and Python's default text encoding. Test scripts now call preview steps directly; the bundler selects `PYTHON`, then Windows `python` / non-Windows `python3`, and reads/writes UTF-8. Final rerun: PASS, 9/9 tests.
- `node --test tests/core.test.mjs` — PASS, 9/9 tests (direct confirmation).
- `npm ci` — PASS from the generated lockfile; 69 packages installed.
- `npm audit` — PASS after clean install and Vite update, 0 vulnerabilities. A temporary, `--no-save` Playwright install used for Chrome evidence was not added to `package.json` or the lockfile.
- `python3 tests/browser-smoke.py` — NOT RUN because Python `playwright` is unavailable (`ModuleNotFoundError`).
- `node tools/b00-chrome-check.mjs` — PASS using a visible Google Chrome 156.0.8078.80 window against the actual Vite app at `http://127.0.0.1:5174/`. The script is an optional local evidence runner; Playwright was installed with `npm install --no-save playwright@1.54.2` and is not a project dependency.

## Browser actions actually performed

The Chrome runner captured the hub, started a run, moved with `D`, aimed and clicked the canvas, paused with Escape, resumed, resized the viewport, captured a grayscale Canvas proxy, abandoned to hub, then reloaded and checked the local save record. Result JSON confirms `persistedAfterReload: true`, `runs: 1`, and `bestRoom: 1`. The small layout remained within viewport width at both sizes; the page is taller than the initial 980px viewport and scrolls vertically as expected for the full panel/footer layout.

The run did **not** reach a reward choice, validate hitboxes/iframes, activate Ember Drive, or test a controller. The current attack frame is short and the screenshot is not evidence of polished animation. Chrome did not report page exceptions or failed resource responses after the favicon fix.

## Chrome captures

All files below are screenshots from the live Vite/React app; the run loop and renderer are the project source, not mock HTML. Kairo and enemies remain procedural proxy art.

- `tests/evidence/b00/chrome/hub.png` — initial hub at 1480 × 980.
- `tests/evidence/b00/chrome/combat-native.png` — active encounter at 1480 × 980; canvas CSS box approx. 1073 × 618.
- `tests/evidence/b00/chrome/combat-strike.png` — short pointer-attack frame.
- `tests/evidence/b00/chrome/combat-input.png` — movement and enemy tell after direct input.
- `tests/evidence/b00/chrome/paused.png` — pause overlay and resume control.
- `tests/evidence/b00/chrome/combat-75pct.png` — active encounter with 1110 × 740 browser viewport; canvas CSS box approx. 703 × 405.
- `tests/evidence/b00/chrome/combat-grayscale.png` — game Canvas rendered in grayscale as a proxy silhouette check. This does not replace approved master art or a character-specific silhouette sheet.
- `tests/evidence/b00/chrome/result.json` — viewport, save reload, console error and failed-request observations.

The first browser run had a 404 for `/favicon.ico`; B00 supplied an original project favicon (`public/favicon.svg`). The follow-up capture reports no failed resource and no page exception.

## Generated art proposals and exact prompts

Tool: OpenAI built-in image-generation tool. Date: 2026-11-05. The tool did not expose a model/version or license metadata. The prompt and files are recorded for provenance. Agent inspected the resulting images for requested subject/style and obvious prohibited references; this is not formal likeness review or legal clearance. Owner approval: **NO**.

**Direction A**, saved as `public/assets/_b00-concepts/direction-a-hand-painted.png`:

> Use case: stylized-concept. Asset type: B00 original game art direction proposal board, concept only, not production assets. Primary request: Create a premium game-ready concept art board for Direction A, showing the same original playable scene: Kairo Venn, an athletic original kinetic fighter with asymmetric dark plum swept hair (NOT tall golden spikes), short split charcoal jacket, bronze kinetic cuffs; one original angular rift wisp enemy; one angled top-down 2.5D fractured stone arena; one clearly readable directional punch trail / pearl-cyan impact crescent; and a conceptual Ember Drive form with a changed silhouette from articulated amber kinetic cuff lattice and shoulder plates, keeping the same plum hair and recognizable face. Present clear subpanels of idle, movement, strike, and transformation anticipation/burst/recovery. Style: premium high-resolution hand-painted / graphic cel-shaded 2D character rendering, modular animation layers, controlled illumination, nuanced painted materials, clean readable forms. Compose a polished art-direction sheet with one large dynamic gameplay-camera scene plus smaller labeled visual studies; no legible text required. Environment should use restrained near-black steel blue architecture with fractured-circle Weave motifs and amber / pearl / cyan accents. Enemy telegraph must remain high contrast against effects. Original IP only; no recognizable existing anime/game design, no borrowed UI, no logos, no watermark.

**Direction B**, saved as `public/assets/_b00-concepts/direction-b-inked-2.5d.png`:

> Use case: stylized-concept. Asset type: B00 original game art direction proposal board, concept only, not production assets. Primary request: Create a distinct premium game-ready concept art board for Direction B, depicting the identical original gameplay scene and character as Direction A for comparison: Kairo Venn, athletic kinetic fighter with asymmetric dark plum swept hair (not spiked), split short charcoal jacket, bronze kinetic cuffs; one original angular rift wisp enemy; angled top-down 2.5D fractured-stone arena; readable directional punch trail / pearl-cyan impact crescent; and conceptual Ember Drive with a changed silhouette through floating amber segmented orbit plates and offset geometric halo, keeping the same plum hair and recognizable face. Show large gameplay-camera composition plus smaller studies for idle, movement, strike, anticipation, burst and recovery. Style: crisp bold stylized 2.5D character language, refined inking, poster-quality color-blocking, high-resolution sprite look with lighting integrated into forms and clear animation planes; clearly unlike hand-painted art. Restrain near-black steel-blue architecture, fractured-circle Weave motifs, amber / pearl / cyan accents. Preserve enemy telegraph readability. Original IP only, avoid resemblance to any known anime/game character, franchise marks, copied UI or logos; no watermark or legible text.

Both boards are comparative proposals. Neither is a spritesheet, rig, implemented transformation, canonical character design, or owner-approved asset.

## Acceptance results

| Criterion | Result | Evidence / remaining gap |
|---|---|---|
| Truthful repository assessment | PASS | Source review and current-state docs; no claim that six heroes/42 forms are implemented. |
| React/Vite foundation | PASS | Install, typecheck, production build and final audit. |
| App/preview parity | PASS (bounded) | Shared source and tests; actual React app launch, input, pause and save reload checked. Reward flow parity was not exercised. |
| Canvas render feasibility | PASS (prototype scope) | Actual Chrome shots show stage plane, actor sorting, shadow, telegraph, input, resize and grayscale proxy. |
| Two original art proposals | PASS (pending approval) | A/B boards exist; owner visual choice remains open. |
| Transformation preview | BLOCKED | Concept board depicts geometry change and activation beats; no in-game anticipation/burst/recovery. Runtime Ember Drive still fails the form contract. |
| Provenance/IP clearance | PARTIAL | Proposal sources and prompts recorded. No legal name, trademark, domain, store or formal likeness clearance. |
| Tests | PASS (9/9); PARTIAL manual | Chrome basic inputs and persistence checked; hitboxes, iframes, reward selection, controller and full run remain for later gates. |
| Scope | PASS | No other hero/form, major boss, engine migration or production content added. |

**B00 decision:** not approved until the owner reviews the art boards and interim renderer recommendation. The bounded Phaser/alternative renderer comparison and frame-time measurement remain open.
