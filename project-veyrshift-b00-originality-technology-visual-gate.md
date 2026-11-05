# PROJECT VEYRSHIFT — B00: ORIGINALITY, TECHNOLOGY & VISUAL DIRECTION GATE

**Target agent:** Claude Code or OpenAI Codex, running in the root of the newly supplied `project-veyrshift/` repository.

**Batch ID:** B00

**Status:** First real agent handoff. This prompt is designed to act on the existing scaffold, not to start over and not to implement later roadmap batches.

**Reference document, read in full BEFORE ANY CHANGES:** `docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md` (V2 design bible, included verbatim in this repository). Also read `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/technical/architecture.md`, `docs/technical/implementation-status.md`, `docs/art/visual-bible.md`, `docs/art/asset-provenance.md` and `docs/qa/acceptance-matrix.md`.

---

## 0. What we are building

Create a genuinely original, incredibly satisfying **browser-first 2.5D fully manual action roguelite**. Inspirations are the *structure and responsiveness* of Hades-style combat, stylish anime power fantasies, transformations that change actual move mechanics, branching authored chambers, and meaningful post-run unlocks. **Do not reproduce** Hades, Dragon Ball, Megabonk or the owner's old Dragon Ball RPGs. This is new IP. `Project Veyrshift` is an **internal codename only**, NOT a cleared commercial title. Our six hero names are provisional; `Sera Voss` must not be reintroduced. Long-term ambition is six heroes/seven distinctive forms each (42), **not** a mandate to fake-build all that content now.

**Owner's priority:** Exceptional game feel, original characters/visual style, lots of truly different premium transformations, modern responsive action, and fun replayability. No generic template, tired pixel-art shortcut, mass-produced recolors, or pretty fake screenshots unconnected to gameplay.

**Locked direction:** Single-player desktop web first, 2.5D perspective, direct manual melee/ranged attacks, dodge, parry, finishers, formweaving disciplines, authored rooms assembled into branching routes; later standalone desktop perhaps Electron. **NO** auto-survivor/horde formula, turn-based RPG, story-first linear campaign or art copied from uploaded older projects.

---

## 1. Understand the repository as it exists

You MUST explore the actual ZIP/repository before making decisions; don't assume the source tree from documentation is accurate.

The scaffold currently contains:
- A React 19 + TypeScript + Vite planned UI shell (`src/app/`, `src/main.tsx`).
- A dependency-free, reusable typed combat simulation (`src/game/core`, `src/game/runtime`).
- A provisional hand-drawn Canvas2D renderer (`src/game/render/`) and a genuinely playable 3-room sandbox.
- Basic Kairo actions: directional melee string, directional energy projectile, dash/iframes, guard/parry, Q blast, F finisher, R experimental Ember Drive, seeded encounters, rewards, local save.
- Six **concept** hero records and 42 **concept** form records. 41 are planned; Ember Drive is a *prototype*, NOT an approved fully realized form.
- Offline proof (`dist-preview/standalone.html`) and nine passing Node core tests; a Chromium smoke (`tests/browser-smoke.py`) was run on the standalone engine and rendered real inputs. These are only scaffold observations, not user signoff.

**Critical known limitation:** The creation environment couldn't reach npm registry, so the real React/Vite build was NOT run. There is no validated package-lock yet. Do NOT claim the main app builds until you have independently installed/compiled and actually loaded it.

## 2. Exact B00 objectives and mandatory execution order

### A. Reproduce the current state and fix foundational issues
1. Inspect source, package versions, runtime boundaries and all existing docs.
2. Attempt `npm install`, commit/generate a valid `package-lock.json` in the working tree, then `npm run typecheck`, `npm run build`, `npm run test` and `python3 tests/browser-smoke.py` if Playwright is available. If one command is unavailable, record the exact cause, do not fake execution. Keep the standalone preview build working.
3. Launch the REAL Vite app in Chrome (prefer visible Chrome/browser integration available in your environment), play it, inspect canvas size, coordinates, input mappings, pause/resume, reward, save persistence, screen overflow and console errors. Compare against standalone preview for parity. Browser screenshots/recordings must come from the running app rather than mock HTML screenshots.
4. Fix reproducible foundation defects only: errors, event listeners, resize mapping, hidden overlays, input safety, save schema, build types and obvious accessibility failures. Resist polishing or expanding every system out of scope.
5. Document discrepancies with initial scaffold docs. Update implementation-status and acceptance evidence with actual commands/results.

### B. Prove the rendering direction rather than selecting from habit
The design bible proposes Phaser 3 or another engine only after meaningful proof. Compare:
- The **existing Canvas2D adapter** (do NOT discard its deterministic simulation just to switch renderers).
- **Phaser 3** or a well-supported alternative if justified by VFX, depth-sorting, scene composition, input integration and performance. Do NOT adopt a new engine merely because the owner used Phaser before.

Build a small, genuinely runnable representative visual comparison using the same Kairo stand-in, environment and combat input. Focus on: angled top-down readability, proper ground shadows, character sorting, hit direction, 2.5D perspective, screen-space and world-space VFX, resize, potential animation rig pipeline and ability to handle transformation particles. At least one playable example must exist for the recommended renderer. Document evidence, measurable tradeoffs and adoption/migration cost. Recommend one engine/renderer, but **do not perform a destructive engine migration or rewrite solely on preference without owner approval**.

### C. Define two ORIGINAL professional art directions
Use the V2 bible and `docs/art/visual-bible.md`. Produce **two clearly distinct, coherent art-style proposals** for the same original Kairo test scene:
- **Direction A:** Premium high-resolution 2D hand-painted / graphic cel-shaded character with modular animation layers and controlled illumination.
- **Direction B:** Crisp bold 2.5D stylized character language with refined inking, poster-quality color-blocking and lighting-integrated high-res sprites.

Both must look original, game-ready, modern and professionally composed (not placeholders or generic template art). Include a consistent visual system for Kairo, one enemy, one arena plane, one punch/energy effect and both base-state and **conceptual Ember Drive** design. Use capable native image generation if actually available; if image tools are unavailable, be transparent and create annotated design specifications or sketches, explicitly labeled PROPOSED, rather than claiming production art exists. Don't make unreviewed generated characters canonical.

**IP guardrails:** Do not use Goku, Gohan, Vegeta, Super Saiyan/Ultra Instinct appearances or catchphrases, Hades character art, existing sprite rips, copyrighted concept sheets, recognizable anime hairstyles or iconic energy attack choreography. Kairo's defining shape should be the asymmetric plum hair + split charcoal jacket + bronze kinetic cuffs plus newly invented *Weave* motifs. No unlicensed stock images or music. Verify obvious exact-name/visual collisions and record the limits of such verification; trademark and copyright clearance are not guaranteed by search.

### D. Make character sprite + transformation feasibility tangible
In the selected visual candidate or isolated lab, demonstrate:
- Normal size Kairo idle silhouette and movement with recognizable joint/body shapes.
- One directional strike and one motion trail; correct shadow and depth ordering while moving.
- A transformation anticipation → burst → combat-ready recovery **preview** with different geometry/aura language (not merely a hair color swap).
- Effects that preserve telegraph readability, and a reduced-flash / reduced-motion proof where available.
- Comparison screenshots at native target play resolution and 75%-scale gameplay view, plus one grayscale silhouette comparison.

Do NOT create 42 forms, expand all six heroes, implement a major boss or rewrite the whole project. B00 is a **style and engine approval gate**, with the express goal of allowing B01/B02/B03 to proceed using an agreed, technically proven foundation.

### E. Master system specifications (short, actionable)
Write concise, implementation-ready notes for:
- What makes the projected angle, game sprites, layered shadows and camera work (with recommendations for transparent sprite atlases, animation states and depth constraints).
- Animation master pipeline, source art preservation, dimensions, naming, atlas and asset provenance. No runtime AI-generation dependency.
- Mechanical formweaving quality contract: each full form must alter basic chain mechanics, two active moves, one defensive/mobility mechanic and one finisher; must be useful in normal encounters and boss fights, have unmistakable silhouette, animations/VFX/audio and an activation that isn't an irritating repeated cutscene.
- Browser performance, input response, frametime, hitstop, telegraph visibility and accessibility targets. State proposed targets as targets, not measured achievements.

---

## 3. Quality gates / pass criteria

Mark each PASS / FAIL / BLOCKED / NOT RUN, with direct evidence:

1. **Truthful repo assessment:** Scoped changes grounded in actual code; no invented assets/features or fictitious current behavior.
2. **Working foundation:** React/Vite app installs, typechecks, builds and launches in a real browser; no fatal JS errors. If blocked, report why and do not sign off B00.
3. **Same behavior:** React app and offline preview share the simulation and observable controls without regression.
4. **Render feasibility:** Actual in-game screenshots demonstrate satisfactory 2.5D perspective, depth, attack trails, readable telegraphs and scaling.
5. **Art directions:** Two original coherent proposals and a reasoned recommendation, clearly labeled pending **owner visual approval**.
6. **Transformation preview:** Original silhouette/aura identity has visible combat-ready proof, not a cheap generic fiery recolor. Do not call the form fully implemented until its full mechanic/art contract passes.
7. **IP/provenance:** New assets registered with prompt/source/date, likeness review and approval status. Preliminary name searches do not mean legal clearance.
8. **Tests:** Existing 9 core tests remain green; appropriate new tests cover actual fixes. Real input verification is included; automated tests cannot substitute for owner visual judgment.
9. **No accidental scope creep:** No premature implementation of 6 heroes, 42 forms or final release content.

**GATE RULE:** Do not declare B00 approved until the owner has reviewed the character/style comparisons and the runtime recommendation. Technical checks passing alone is not game-feel acceptance.

---

## 4. Expected deliverables in working tree

- Fixed/verified clean scaffold with valid lockfile if install succeeds.
- `docs/technical/b00-runtime-evaluation.md` with actual experiments and recommendation.
- `docs/art/b00-style-comparison.md` with candidate images, critical pros/cons and the exact unresolved owner decisions.
- Proposed original concept assets under a dedicated `public/assets/_b00-concepts/` (or `art/source/b00/`) folder, with master/source evidence, not silently in final asset slots.
- Short evidence manifest `docs/qa/b00-evidence.md`, plus screenshots/video under a sensible evidence directory, organized by app/version/viewport. Do not inflate the production bundle with gigabytes of duplicate screenshots.
- Updated `docs/technical/implementation-status.md`, `docs/qa/acceptance-matrix.md`, `docs/art/asset-provenance.md`.
- No accidental changes to V2 vision text, no copied copyrighted assets, and no production deployment.

## 5. Final report format

Return a thorough but concise markdown report:

1. Files added/changed; state of the repo and whether any commit/push happened (**do not commit/push unless explicitly told**).
2. What you actually ran (exact commands, pass/fail/test counts), what browser you visibly opened, and which interactions you truly performed.
3. Show visual evidence file paths and a side-by-side summary of A/B candidates.
4. Renderer comparison with reasoned choice and tradeoffs.
5. Originality/provenance checks, remaining collision risks and decisions needed from the owner.
6. Explicit PASS/FAIL/BLOCKED/NOT RUN acceptance matrix.
7. Exact recommendation for B01/B02 next, with no unsupported claim of finished gameplay or final art.

**Important:** Deliver working, inspectable repository changes and evidence now, not promises to do work later. If a tool or external dependency is missing, preserve the best truthful partial result and name the blocker. Pause any final visual-style commitment until the owner explicitly approves it.
