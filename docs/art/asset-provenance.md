# Asset provenance and approval ledger

| Asset group | Source / creation method | IP / likeness check | Status | Owner signoff |
|---|---|---|---|---|
| Temporary game chamber geometry | Original TypeScript Canvas paths in `CanvasRenderer.ts` | Designed for this scaffold; not researched as commercial environment IP | PROXY | NO |
| Temporary Kairo silhouette | Original TypeScript Canvas paths in `CanvasRenderer.ts` | No third-party assets used; character resemblance still requires review | PROXY | NO |
| Enemy stand-in polygons | Original TypeScript Canvas paths | No third-party assets used | PROXY | NO |
| Temporary projectile, dash, aura rings | Procedural Canvas2D VFX | No third-party assets used | PROXY | NO |
| Temporary sound bleeps | Local `Web Audio API` oscillators | No licensed recording used | PROXY | NO |
| B00 Direction A concept board | OpenAI built-in image generation; generated 2026-11-05; exact prompt recorded in `docs/qa/b00-evidence.md` | Agent visual spot-check only; no external image/name clearance performed | PROPOSED — CONCEPT ONLY | NO |
| B00 Direction B concept board | OpenAI built-in image generation; generated 2026-11-05; exact prompt recorded in `docs/qa/b00-evidence.md` | Agent visual spot-check only; no external image/name clearance performed | PROPOSED — CONCEPT ONLY | NO |
| B00 favicon | Original hand-authored SVG, `public/favicon.svg`, 2026-11-05 | Original geometric mark; not checked as commercial logo | PROXY | NO |
| Approved original hero masters | None | NOT RUN | MISSING | NO |
| Finished music and game SFX | None | NOT RUN | MISSING | NO |

**Never mark an AI-generated image APPROVED automatically.** Record tool/model, creation date, exact source prompt, license/usage assumptions, visual inspection, derivative files and owner decision. Character and form names remain provisional pending appropriate checks.

The B00 generated boards are preserved under `public/assets/_b00-concepts/` only so they can be reviewed. They are not loaded by the game and are not approved source art. Generation model/version and legal-use terms were not exposed by the tool, so those fields remain unknown; review the originals for accidental resemblance before adopting or deriving any asset.
