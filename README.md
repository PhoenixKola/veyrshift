# PROJECT VEYRSHIFT — Browser Action Roguelite

> **PREPRODUCTION SCAFFOLD, NOT A COMPLETE GAME OR PRODUCTION BUILD.**
> Internal codename only; no game title or original character names are legally cleared.

A clean, original, browser-first 2.5D fully manual anime-inspired action roguelite. The authoritative design source is **[`docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md`](docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md)**. That file is included **verbatim** in this repository, so Claude/Codex can reference it every batch.

## What is *actually playable now*

- Kairo remains the only playable hero. B03 adds four authored cardinal views in generated prototype animation atlases for idle, run, a 3-hit combo, dodge, guard, hurt, and KO; Ember activation remains a brief prototype. The art is still **unapproved feasibility work**, not a polished master or production animation set.
- One hero, three short seeded encounter chambers, three enemy archetypes (wisp, striker, sentinel), enemy telegraphs, manual angled melee string, directional ranged projectile, dash and invulnerability, guard/parry, an area attack, an ultimate and a short experimental Ember Drive transformation.
- Selection from three generated room-clear upgrades; full mini-loop with defeat/victory, shard banking, persistent local save (versioned schema), pause/retry/hub.
- Prototype combat VFX/audio, damage feedback, seeded RNG, reusable core combat simulator, runtime/UI decoupling and a strong starting UI shell.
- **Six heroes and 42 form names are typed *catalog records*, not 42 implemented playable heroes/forms.** This differentiation is explicit in `src/game/data/heroes.ts` and `src/game/data/forms.ts`.
- No downloadable third-party art, no scraped IP and no copyrighted game characters are included.

## Quickest way to try it — no npm needed

Open **`dist-preview/standalone.html`** in Chrome, Edge or Firefox. The HTML bundles the same self-authored TypeScript game/renderer and CSS into one dependency-free file. It requires no localhost server, CDN or account. It is deliberately a test harness, not the shipping frontend.

If your browser blocks local files, from the repository root run `python3 -m http.server 4173 --directory dist-preview` and open `http://localhost:4173/` (regular module version) or `/standalone.html`.

## Standard React + Vite application

### B01 player flow

Install Node.js 22+, run `npm ci`, then run `npm run dev`. The title menu opens first. Choose **New Run**, then **Start Run** in the pre-run hub. WASD or arrow keys move; mouse aim + left click attacks; right click fires a ranged shot; Shift dodges; Q uses the special; hold E to guard; R triggers the brief Ember Drive prototype preview when Pulse is available; F uses the finisher when charged; Escape pauses. The pause screen can resume or abandon to the hub.

Keyboard arrows/Tab/Enter navigate menus. Standard gamepad baseline: left stick moves, right stick aims, A attacks, B dodges, X special, Y interact, LB guard, RB ranged shot, LT finisher, RT form preview, Start pauses; d-pad/left stick navigates menus, A confirms, B backs out. PlayStation labels are shown when the device ID identifies PlayStation hardware. Fullscreen is available from the pre-run hub. Settings persist locally; music stays disabled because no music track is included.

The B01 shell flow remains. B03 adds four authored cardinal animation views for Kairo's idle, run, dodge, combo, and supporting states. The dominant-axis direction policy does not supply separate diagonal art; combo pose contrast and generated-art review remain open. Source grids, repeatable atlas exports, pivots, rejected drafts and provenance notes are in `art-source/b03/`, `docs/art/b03-runtime-pipeline.md`, and `docs/art/b03-animation-manifest.json`. Ember Drive is still a brief presentation/mechanical prototype and does not meet the full form contract. Owner visual and game-feel approval remains pending. See `docs/qa/b03-evidence.md` for real Chrome evidence and remaining gates.

Install Node.js 22+.

```bash
npm install
npm run dev
```

Open the local address printed by Vite. This initializes the React + TypeScript frontend using **the exact same** game simulation and rendering code. `npm run build` runs the React/TypeScript production compilation and Vite bundle.

**Current B01 verification:** The project has a clean dependency lock and was checked with `npm ci`, `npm run typecheck`, `npm run build`, `npm test` (16/16) and `npm audit`. The actual Vite/React app was exercised in visible Google Chrome; details and current limitations are in `docs/qa/b01-evidence.md`.

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

This is a **first-pass input scheme**, not a finished combo/launcher system. Light attacks now have startup/impact/recovery animation timing, a short press buffer, hitstop, and one directional arc check per swing. The third hit uses the launcher pose. There are no per-frame hitbox shapes or verified frame-by-frame hitbox alignment yet.

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
- **B04-B13**: production combat/VFX/audio, encounters, complete forms, multiple heroes, bosses, room paths and exhaustive signoff - **NOT DONE**.
- **42 forms**: long-term design target, **not** an MVP deliverable. MVP ambition: two heroes, four mechanically complete premium forms.

## Originality and licensing

Hades and Dragon Ball are high-level feel references only. Do not copy characters, outfits, UI, sound, music, shaders, locations or signature animations from existing IP. Existing hero names and `Project Veyrshift` must be checked for conflicts before public release. Provenance and visual approval belong in `docs/art/asset-provenance.md`.
