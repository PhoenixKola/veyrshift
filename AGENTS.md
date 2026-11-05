# AI GAME DEVELOPMENT CONTRACT — PROJECT VEYRSHIFT

Read these in order before coding:
1. `docs/project-veyrshift-hades-style-game-vision-transformations-roadmap-v2.md` — authoritative, unchanged vision.
2. `docs/technical/implementation-status.md` — evidence-backed current state.
3. `docs/technical/architecture.md` — module boundaries and tech constraints.
4. `docs/art/visual-bible.md` and `docs/art/asset-provenance.md` — original art direction and ledger.
5. Current batch `.md` prompt from `prompts/`.

## Non-negotiables
- Original IP only. Hades means manual combat and roguelite structure, not Hades content/UI. Dragon Ball means exhilarating power fantasy, not its characters, hairstyles, outfits, attacks, effects, or names. No old AOTS RPG code, story, ripped sprites, or copyrighted materials.
- Do not claim the six heroes or 42 form records are implemented: only Kairo's prototype exists now. No polished master character art is present.
- Preserve V2 game vision verbatim. New decisions go in dated ADRs under `docs/technical/`.
- The game must be playable, browser-first and eventually suitable for an Electron host without relying on Node/Electron at runtime.
- Keep core simulation deterministic and renderer/UI isolated. Never use `Math.random()` for gameplay.
- A form requires unique silhouette, changed attack chain/mechanics, 2 modified active moves, mobility/defense change, finisher and high-quality VFX/audio/animation, in ordinary rooms AND boss fights. The current Ember Drive sample **does not** meet this.
- Test actual hitboxes/inputs/iframes/state persistence. Build/tests are necessary but never sufficient for visual or tactile approval. Capture real Chrome evidence; user approves visual design and game feel.
- Do not silently add 3D features, Phaser, Electron or engine rewrites. B00 is an explicit engineering choice checkpoint comparing the current portable Canvas renderer to alternatives.
- No implicit commit/push/deploy. Report touched files, changes, commands run, tests, evidence, unresolved issues and signoff blockers.
- Stop and report blockers rather than inventing green tests or pretending unseen art/images are approved.
