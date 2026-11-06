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
| R | Experimental Ember Drive (40 Pulse) |
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
- **B05**: two incomplete Kairo form prototypes; art/gameplay verification gates remain blocked.
- **B06-B13**: Gravity Break, encounters, multiple heroes, bosses, room paths and exhaustive release signoff - **NOT DONE**.
- **42 forms**: long-term design target, **not** an MVP deliverable. MVP ambition: two heroes, four mechanically complete premium forms.

## Originality and licensing

Hades and Dragon Ball are high-level feel references only. Do not copy characters, outfits, UI, sound, music, shaders, locations or signature animations from existing IP. Existing hero names and `Project Veyrshift` must be checked for conflicts before public release. Provenance and visual approval belong in `docs/art/asset-provenance.md`.

## B05 Kairo forms — prototype only

The current Forms screen lets the player equip Ember Drive or unlock/equip Glass Current after five parries. Save schema v3 migrates the prior save formats. Ember and Glass combat prototypes have bounded differences and are described in `docs/technical/adr-012-formweaving-runtime-save-contract.md`. They are **not complete transformations**: their generated reference masters are rejected for runtime, and alternate animation atlases, dedicated icons, authored VFX/audio and live gameplay approval are still missing. Follow the local Chrome steps in `docs/qa/b05-evidence.md` before evaluating. B05 remains partial; do not claim B06 appearance-swap readiness.
