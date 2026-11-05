# Implementation status — 2026-11-05 scaffold baseline

## Verified
- `npm run preview:build`: passes using installed global TypeScript compiler (no registry packages needed).
- `npm run test`: 9 core tests pass (deterministic RNG, geometry, six-hero/42-form metadata, safe save parse, manual attack damage, dash, form sample, reward, victory).
- `python3 tests/browser-smoke.py`: passes using Chromium via injected standalone JS (same simulation/render code). Smoke enters game, moves/aims/attacks, pauses/resumes and captures evidence. No observed browser JS exceptions.
- Screenshots: `tests/browser-hub.png`, `tests/browser-combat.png`. Screenshots show **temporary proxy art**, not finished art quality.

## Not verified / not implemented
- React/Vite `npm install`, `npm run typecheck`, `npm run build` cannot be run in this sandbox because npm registry DNS resolution failed. Run first in a connected environment. There is not yet a valid generated package-lock.
- `src/app/App.tsx` is the intended production shell but currently unverified beyond source inspection; do not claim it ships.
- No final playable full MVP; current mini-loop is three rooms and one prototype character, not 18–25 minutes.
- No approved master sheets, finished animation atlases, licensed/provenance-cleared music, authentic form VFX, major boss, second hero, room branching, rich build system or user-approved visuals.
- 41 form records are `planned`, one (Ember Drive) is `prototype` only; none meets V2's shippable full form quality contract.
- No true IP uniqueness certification. No completed trademark, domain or store availability review.

## Required first handoff

Run `prompts/project-veyrshift-b00-originality-technology-visual-gate.md`, resolve actual full app install/build, capture genuine Chrome evidence and seek owner signoff for the art/tech direction before B02/B03 mass production.

## B00 work log — 2026-11-05

- `npm install` succeeded and generated `package-lock.json`. Vite was updated from 6.3.5 to 6.4.5 after `npm audit` reported a high-severity advisory; the post-update audit reported 0 vulnerabilities.
- `npm run typecheck` and `npm run build` passed. The first `npm test` runs exposed Windows portability issues in the nested npm script, Python launcher and default text encoding. Test scripts now call preview steps directly; the bundler honors `PYTHON`, otherwise uses `python` on Windows / `python3` elsewhere, and forces UTF-8 for project files.
- The actual Vite app was loaded in visible Google Chrome at 1480 × 980 and 1110 × 740. Hub/start, keyboard movement, pointer attack input, pause/resume, abandon-to-hub save, and reload persistence were exercised. Native-scale, 75%-viewport and grayscale captures are in `tests/evidence/b00/chrome/`. A missing favicon request found in the first run was fixed with `public/favicon.svg`; the follow-up run has no failed requests or page exceptions.
- Python Playwright is not installed, so `python3 tests/browser-smoke.py` was not run. The optional Node Playwright runner used installed Google Chrome; Playwright was installed `--no-save` and is not a runtime or project dependency.
- Two OpenAI built-in image-generation proposals are under `public/assets/_b00-concepts/` and recorded in the provenance ledger. They are proposals only and are not canonical or approved assets.
- Interim renderer recommendation: keep Canvas2D through the next bounded combat-feel slice; do not perform an engine rewrite in B00. Phaser/alternative spike, performance comparison and final renderer lock remain unverified/pending. Ember Drive still fails the full transformation contract. Owner visual and tech signoff is still required.
- Detailed commands, browser actions, image prompts, screenshots and gate statuses are in [`docs/qa/b00-evidence.md`](../qa/b00-evidence.md), [`docs/technical/b00-runtime-evaluation.md`](b00-runtime-evaluation.md), and [`docs/art/b00-style-comparison.md`](../art/b00-style-comparison.md).
