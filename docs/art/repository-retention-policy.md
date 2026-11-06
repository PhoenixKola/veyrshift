# Repository asset and evidence retention policy

## Keep tracked

- Production runtime atlases and the assets the browser loads.
- Canonical source art used by current asset builders: the B03 Kairo master, the B04 base combat and effect sheets, current B05 review sources, and the new B05 Ember production candidates.
- Build scripts, selected-source manifests, provenance notes, ADRs, and concise QA reports.
- Small contact sheets that show current production directions at game scale.
- Tests and reproducible browser QA scripts; large generated browser output is excluded.

## Move outside the repository and ignore

- Chrome/WebM/GIF evidence runs and screenshot matrices. Keep the local archive for historical review; regenerate current gameplay captures with `tools/b05-chrome-local-qa.mjs` or `tools/b05-ember-production-qa.mjs`.
- Handoff/review ZIPs. The current B05 review package is created with `tools/build-b05-art-review.py` and saved beside the repository in `veyrshift-local-archive-2026-11-06/`.
- Rejected image sheets and superseded B05 proposal/sequence images. These do not feed runtime exports. Their decisions remain documented; hashes and original relative paths are in the external archive inventory.
- B00 direction boards that are no longer active production sources.

The external archive is a local convenience and is not backed up by Git or included in a GitHub source ZIP. The tracked manifests and rejection notes remain the durable provenance record. Never use an archived or rejected source as a current master without an explicit review.

## Delete from tracked tree

The cleanup removes the above local-only material from Git tracking. Historical generated captures remain on this workstation in the sibling archive, not in repository history as new files. No canonical production source or runtime asset is removed.

## Optional external archive

`../veyrshift-local-archive-2026-11-06/` stores the moved review captures, rejected/superseded source sheets, and an SHA-256 inventory. It is not required to build, run, or test the game. Archive size is measured in the B05 continuation report.
