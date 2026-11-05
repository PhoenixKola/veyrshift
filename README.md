# PROJECT VEYRSHIFT — Browser Action Roguelite

> **PREPRODUCTION SCAFFOLD, NOT A COMPLETE GAME OR PRODUCTION BUILD.**
> Internal codename only; no game title or original character names are legally cleared.

A clean, original, browser-first 2.5D fully manual anime-inspired action roguelite. The authoritative design source is **[`docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md`](docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md)**. That file is included **verbatim** in this repository, so Claude/Codex can reference it every batch.

## What is *actually playable now*

- Original **Kairo Venn** placeholder silhouette and a hand-rendered, animated 2.5D laboratory room. This is **prototype geometry, not approved character art**.
- One hero, three short seeded encounter chambers, three enemy archetypes (wisp, striker, sentinel), enemy telegraphs, manual angled melee string, directional ranged projectile, dash and invulnerability, guard/parry, an area attack, an ultimate and a short experimental Ember Drive transformation.
- Selection from three generated room-clear upgrades; full mini-loop with defeat/victory, shard banking, persistent local save (versioned schema), pause/retry/hub.
- Prototype combat VFX/audio, damage feedback, seeded RNG, reusable core combat simulator, runtime/UI decoupling and a strong starting UI shell.
- **Six heroes and 42 form names are typed *catalog records*, not 42 implemented playable heroes/forms.** This differentiation is explicit in `src/game/data/heroes.ts` and `src/game/data/forms.ts`.
- No downloadable third-party art, no scraped IP and no copyrighted game characters are included.

## Quickest way to try it — no npm needed

Open **`dist-preview/standalone.html`** in Chrome, Edge or Firefox. The HTML bundles the same self-authored TypeScript game/renderer and CSS into one dependency-free file. It requires no localhost server, CDN or account. It is deliberately a test harness, not the shipping frontend.

If your browser blocks local files, from the repository root run `python3 -m http.server 4173 --directory dist-preview` and open `http://localhost:4173/` (regular module version) or `/standalone.html`.

## Standard React + Vite application

Install Node.js 22+.

```bash
npm install
npm run dev
```

Open the local address printed by Vite. This initializes the React + TypeScript frontend using **the exact same** game simulation and rendering code. `npm run build` runs the React/TypeScript production compilation and Vite bundle.

**Verification limitation on scaffold creation:** npm registry was unreachable, so npm dependencies and the React/Vite production build were **not** available for testing here. The dependency-free TypeScript preview **was compiled**, 9 core tests passed, and a real Chromium render/input smoke passed. Claude/Codex **must** execute `npm install`, `npm run typecheck`, `npm run build` and browser checks in a connected environment before declaring B00/B01 done. An initial `package-lock.json` is not included because generating a valid one requires registry resolution; generate and commit it on first successful install.

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

This is a **first-pass input scheme**, not a finished combo/launcher system. Attack frames, cancel windows, guard timing and transformation mechanics will be redesigned and playtested in the appropriate batches.

## Local verification (works without installing npm dependencies if global `tsc` is available)

```bash
npm run verify:offline
python3 tests/browser-smoke.py
```

`verify:offline` compiles the shared TypeScript simulation and preview, regenerates a self-contained `dist-preview/standalone.html` and runs the Node test suite. The optional browser smoke requires Python Playwright and Chromium; it renders the built preview inside an isolated document, because the build environment blocks local URL navigation. Screenshots are in `tests/browser-hub.png` and `tests/browser-combat.png`. These screenshots are **scaffold visual evidence only**, not visual or gameplay acceptance of the final game.

## Repository map

```
src/app/                React UI shell, HUD and control panel
src/game/core/          Shared typed contracts, physics helpers, deterministic RNG
src/game/data/          Heroes (6), form concepts (42), prototype encounters/upgrades
src/game/runtime/       Frame-based simulation, combat rules, input and loop controller
src/game/render/        Replaceable Canvas 2D 2.5D prototype renderer
src/game/storage/       Versioned local progress schema
src/game/audio/         Original synthesized placeholder audio
src/preview/            Dependency-free preview shell sharing all game logic
dist-preview/           Built offline preview (standalone HTML and ES modules)
public/assets/          Future ORIGINAL art, VFX, UI, enemy, audio and environment packs
docs/                   Verbatim V2 bible, architecture, visuals, QA and status
prompts/                Batch-specific Claude/Codex instructions
tests/                  Deterministic core test suite and Chromium smoke
```

## Agent handoff

1. Open `AGENTS.md` or `CLAUDE.md`.
2. Read the **V2 game vision**, `docs/technical/architecture.md` and `docs/technical/implementation-status.md`.
3. Start with [`prompts/project-veyrshift-b00-originality-technology-visual-gate.md`](prompts/project-veyrshift-b00-originality-technology-visual-gate.md).
4. Do not rewrite the design bible or bulk-generate character art until the owner approves the master style. Document mismatches and request an explicit visual signoff where appropriate.

## Roadmap honesty

- **B00**: original IP / design style / runtime feasibility gate — NEXT.
- **B01**: foundation — structurally preseeded but needs full dependency install, typecheck, build, runtime assessment and correction.
- **B02**: Kairo combat-feel vertical slice — **NOT DONE**, regardless of the basic combat visible in this scaffold.
- **B03–B13**: production art, encounters, 4 full forms, multiple heroes, bosses, room paths, progression and exhaustive Chrome signoff — **NOT DONE**.
- **42 forms**: long-term design target, **not** an MVP deliverable. MVP ambition: two heroes, four mechanically complete premium forms.

## Originality and licensing

Hades and Dragon Ball are high-level feel references only. Do not copy characters, outfits, UI, sound, music, shaders, locations or signature animations from existing IP. Existing hero names and `Project Veyrshift` must be checked for conflicts before public release. Provenance and visual approval belong in `docs/art/asset-provenance.md`.
