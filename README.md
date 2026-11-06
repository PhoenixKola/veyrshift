# PROJECT VEYRSHIFT — Browser Action Roguelite

> **PREPRODUCTION SCAFFOLD, NOT A COMPLETE GAME OR PRODUCTION BUILD.**
> Internal codename only; no game title or original character names are legally cleared.

A clean, original, browser-first 2.5D fully manual anime-inspired action roguelite. The authoritative design source is **[`docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md`](docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md)**. That file is included **verbatim** in this repository, so Claude/Codex can reference it every batch.

## What is *actually playable now*

- Kairo remains the only playable hero. B03/B04 add four authored cardinal views for movement, distinct combo hits, guard/parry and base abilities. B05 adds form selection and bounded Ember/Glass combat prototypes. Generated art remains **unapproved feasibility work**, not a polished master or production animation set.
- One hero, three short seeded encounter chambers, three enemy archetypes (wisp, striker, sentinel), enemy telegraphs, manual angled melee string, directional ranged projectile, dash and invulnerability, guard/parry, an area attack, an ultimate and two partial form prototypes.
- Selection from three generated room-clear upgrades; full mini-loop with defeat/victory, shard banking, persistent local save (versioned schema), pause/retry/hub.
- Prototype combat VFX/audio, damage feedback, seeded RNG, reusable core combat simulator, runtime/UI decoupling and a strong starting UI shell.
- **Six heroes and 42 form names are typed *catalog records*, not 42 implemented playable heroes/forms.** This differentiation is explicit in `src/game/data/heroes.ts` and `src/game/data/forms.ts`.
- No downloadable third-party art, no scraped IP and no copyrighted game characters are included.

## Quickest way to try it — no npm needed

Open **`dist-preview/standalone.html`** in Chrome, Edge or Firefox. The HTML bundles the same self-authored TypeScript game/renderer and CSS into one dependency-free file. It requires no localhost server, CDN or account. It is deliberately a test harness, not the shipping frontend.

If your browser blocks local files, from the repository root run `python3 -m http.server 4173 --directory dist-preview` and open `http://localhost:4173/` (regular module version) or `/standalone.html`.

## Standard React + Vite application

### B01 player flow

Install Node.js 22+, run `npm ci`, then run `npm run dev`. The title menu opens first. Choose **New Run**, then **Start Run** in the pre-run hub. Equip Ember Drive by default or unlock Glass Current with five successful parries in the Forms screen. WASD or arrow keys move; mouse aim + left click attacks; right click fires a ranged shot; Shift dodges; Q uses the special; hold E to guard; R activates or ends the equipped form when Pulse is available; F uses the finisher when charged; Escape pauses. The pause screen can resume or abandon to the hub.

Keyboard arrows/Tab/Enter navigate menus. Standard gamepad baseline: left stick moves, right stick aims, A attacks, B dodges, X special, Y interact, LB guard, RB ranged shot, LT finisher, RT form preview, Start pauses; d-pad/left stick navigates menus, A confirms, B backs out. PlayStation labels are shown when the device ID identifies PlayStation hardware. Fullscreen is available from the pre-run hub. Settings persist locally; music stays disabled because no music track is included.

The B01 shell flow remains. B03 adds four authored cardinal animation views for Kairo's idle, run, dodge, combo and supporting states. B04 adds the typed base ability kit, separate cooldowns, generated painted VFX and combat HUD/pause details. Attacks still select the dominant cardinal view; separate diagonal art is not present. Source masters, rejected drafts, generated contact sheets and the ability contract are in `art-source/b04/`, `docs/art/b04-asset-manifest.json`, `docs/art/b04-ability-visual-bible.md` and ADR-011. The finisher's corrected right-facing row keeps its head aligned through all four phases. Visible Chrome gameplay evidence, audio/game-feel review and owner art approval remain pending. See `docs/qa/b04-evidence.md` for current results and blockers.

Install Node.js 22+.

```bash
npm install
npm run dev
```

Open the local address printed by Vite. This initializes the React + TypeScript frontend using **the exact same** game simulation and rendering code. `npm run build` runs the React/TypeScript production compilation and Vite bundle.

**Current B04 verification:** `npm ci`, `npm run typecheck`, `npm run build`, `npm test` (25/25) and `npm audit` pass. The CUA browser host was unavailable for this batch, so the visible Chrome gameplay gate remains unrun; details and other open checks are in `docs/qa/b04-evidence.md`.

### Owner-local Chrome QA for B05

The B05 recovery batch adds a repeatable Windows Chrome run through the actual Vite game. From PowerShell at the repo root:

```powershell
npm ci
npm run qa:chrome:self-test
npm run qa:chrome:local
```

The launcher is headed by default, uses a temporary Playwright context and installed Chrome, and saves screenshots, normal-speed video-only WebM clips, runtime/network diagnostics and a JSON report under `tests/evidence/b05/live-chrome/`. Use `npm run qa:chrome:headless` only for supplementary automation. For another local Vite port, run `node tools/b05-chrome-local-qa.mjs --url http://127.0.0.1:5175/`. The WebM has no audio; human visual and system-audio review remain separate gates. See [B05 Chrome recovery and art handoff](docs/qa/b05-chrome-recovery.md).

## Controls (desktop keyboard and mouse)

| Control | Action |
| --- | --- |
| WASD / arrows | Walk |
| Mouse movement | Aim manually |
| Left mouse / Space / J | Melee strike; timed repeats create a three-hit string |
| Right mouse / K | Directional energy bolt |
| Shift | Short invulnerable dodge |
| E (hold) | Guard, short initial parry opportunity |
| Q | Radial pulse blast |
| R | Activate/end equipped form (40 Pulse plus upkeep reserve) |
| F | Prototype finisher (75 Pulse) |
| Esc | Pause / resume |

The combat slice uses fixed-step action timing, one press per basic strike, a short press buffer and one directional arc check per swing. Hit one, hit two and the final launcher have separate catalog timings and authored animation sections. Per-frame hitbox shapes and frame-by-frame visual alignment remain unverified.

## Local verification (works without installing npm dependencies if global `tsc` is available)

```bash
npm run verify:offline
python3 tests/browser-smoke.py
```

`verify:offline` compiles the shared TypeScript simulation and preview, regenerates a self-contained `dist-preview/standalone.html` and runs the Node test suite. The optional browser smoke requires Python Playwright and Chromium; it renders the built preview inside an isolated document, because the build environment blocks local URL navigation. Screenshots are in `tests/browser-hub.png` and `tests/browser-combat.png`. These screenshots are **scaffold visual evidence only**, not visual or gameplay acceptance of the final game.

## Repository map

```
src/app/                Title/hub/menu shell, gameplay overlays and development proof UI
src/game/core/          Shared typed contracts, physics helpers, deterministic RNG
src/game/data/          Heroes (6), form concepts (42), prototype encounters/upgrades
src/game/runtime/       Frame-based simulation, combat rules, input and loop controller
src/game/render/        Replaceable Canvas 2D 2.5D prototype renderer
src/game/storage/       Versioned local progress schema
src/game/audio/         Original synthesized placeholder audio
src/preview/            Dependency-free preview shell sharing all game logic
dist-preview/           Built offline preview (standalone HTML and ES modules)
public/assets/          Proposed runtime art exports and future original art/VFX packs
docs/                   Verbatim V2 bible, architecture, visuals, QA and status
prompts/                Batch-specific Claude/Codex instructions
tests/                  Deterministic core test suite and Chromium smoke
```

## Agent handoff

1. Open `AGENTS.md` or `CLAUDE.md`.
2. Read the **V2 game vision**, `docs/technical/architecture.md` and `docs/technical/implementation-status.md`.
3. Start with the next explicitly assigned batch prompt in `prompts/`.
4. Do not rewrite the design bible or bulk-generate character art until the owner approves the master style. Document mismatches and request an explicit visual signoff where appropriate.

## Roadmap honesty

- **B00**: original IP / design style / runtime feasibility gate - **DONE, owner approval pending**.
- **B01**: premium game shell, input foundation and bounded renderer/art feasibility - **IMPLEMENTED, owner approval pending**.
- **B02**: Kairo combat-feel vertical slice - **IMPLEMENTED AS A PROTOTYPE; owner visual/game-feel approval pending**.
- **B03**: Kairo four-direction animation source, runtime pipeline and live browser proof - **IMPLEMENTED; generated art/game-feel approval pending; visual gates partial**.
- **B04**: Kairo base combat catalog, HUD/pause integration, generated art/VFX/audio, automated tests - **IMPLEMENTED AS A REVIEWABLE PROPOSAL; visible Chrome gameplay evidence and owner approval pending**.
- **B05**: two Kairo form prototypes with candidate atlases, icons and VFX; visual-breakthrough silhouettes now have a dev-only combat replay, but the new motion drafts **FAIL** fluid-animation quality and live visual/audio review remains blocked. See [B05 visual-breakthrough evidence](docs/qa/b05-visual-breakthrough-evidence.md).
- **B06-B13**: Gravity Break, encounters, multiple heroes, bosses, room paths and exhaustive release signoff - **NOT DONE**.
- **42 forms**: long-term design target, **not** an MVP deliverable. First complete-release target: two fully polished heroes, three complete forms per hero, six total (see [roadmap addendum](docs/technical/roadmap-addendum-2026-11-06.md)).

## Originality and licensing

Hades and Dragon Ball are high-level feel references only. Do not copy characters, outfits, UI, sound, music, shaders, locations or signature animations from existing IP. Existing hero names and `Project Veyrshift` must be checked for conflicts before public release. Provenance and visual approval belong in `docs/art/asset-provenance.md`.

## B05 Kairo forms — prototype only

The current Forms screen lets the player equip Ember Drive or unlock/equip Glass Current after five parries. Save schema v3 migrates the prior save formats. Ember and Glass combat prototypes have bounded differences and are described in `docs/technical/adr-012-formweaving-runtime-save-contract.md`. Candidate four-direction atlases, icons, VFX textures and synthesized combat cues remain proposals. The B05 visual-breakthrough pass demonstrates distinct VFX-off Ember/Glass silhouettes and adds a Vite-only `?b05showcase=1` replay through the actual controller, combat session and Canvas renderer. Its eight independently generated held poses per form **fail** fluid-motion quality; headed owner visual/audio review remains pending. Do not treat these as complete transformations or production animation. See [visual-breakthrough evidence](docs/qa/b05-visual-breakthrough-evidence.md), [art notes](docs/art/b05-visual-breakthrough-notes.md), and [B05 completion evidence](docs/qa/b05-completion-evidence.md). B05 remains partial; do not claim B06 appearance-swap readiness.

The browser-access recovery adds an owner-local Playwright/Chrome workflow in [B05 Chrome recovery](docs/qa/b05-chrome-recovery.md); a successful automated report still does not close owner visual/audio acceptance. The corrected source mapping keeps Glass B labeled as Glass and the single Ember reinterpretation as a non-runtime review proposal. Glass A is the provisional Glass anchor; Ember A and the new Ember proposal await owner choice. B05 remains partial and fluid animation remains failed.
