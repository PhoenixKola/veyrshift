# ADR-016: B05 owner-local Chrome QA and corrected art handoff

- **Date:** 2026-11-06
- **Status:** Accepted for this recovery batch; owner visual/audio approval remains required
- **Scope:** Local browser-evidence workflow and B05 source mapping only. No engine or game-vision change.

## Context

The connected-browser host was unavailable and the prior headed launch was denied by execution policy. B05 still needs actual Vite/Chrome evidence, but the owner can run Chrome locally in an authorized interactive Windows session. The shared art references were also mislabeled: Glass Current B's open forearm loops were called Ember art.

## Decisions

1. Use version-locked Playwright with the installed Chrome channel and an isolated, temporary browser context. Run actual Vite on loopback only. Reuse a supplied Vite server only when the endpoint responds as Vite; never attach to a personal profile or an external/debugging host.
2. Make `npm run qa:chrome:local` headed by default for the owner's normal Windows session. `--headless` is supplementary automation only. The runner captures screenshots, video-only WebM, errors, failed resources, timed gameplay state, and RAF timing in a JSON report marked `AUTOMATED / HUMAN REVIEW PENDING`.
3. Keep manual visual review and system-audio recording as separate owner tasks. Playwright recordings contain no audio and cannot close the listening gate.
4. Lock the source mapping for review: Glass A is the provisional Glass silhouette anchor; Glass B remains Glass B and is not an Ember master; the third reference resembles base Kairo; Ember A remains a separate Ember comparison candidate.
5. Retain exactly one new Ember reinterpretation proposal derived from the base Kairo identity, compared against Ember A, with Glass B explicitly restricted to forearm-motif placement inspiration. Do not place it in runtime or generate more full-character pose sheets before owner selection and a successful motion-method proof.
6. Keep B05 partial. The eight-pose drafts still fail fluid motion, layered motion VFX remain unstarted, and neither form is approved or complete under the V2 contract.

## Consequences

The owner has a repeatable PowerShell workflow that does not depend on the connected-browser host. The runner can be self-tested without a browser and will preserve exact launch/network/runtime errors. Owner-local run artifacts are ignored by Git so playable videos do not inflate repository downloads; the launcher, report schema, docs and source art remain reviewable in version control.

The corrected Ember image is a review proposal only. Its source roles and exact prompt are in [`ember-reinterpretation-manifest.json`](../../art-source/b05/visual-breakthrough/ember-reinterpretation-manifest.json). Its right-profile cutout is loaded only by the explicit development feasibility route; no candidate art is exported into production runtime assets.

## Verification

See [`B05 Chrome recovery`](../qa/b05-chrome-recovery.md) for owner commands, latest machine report, audio instructions and separate blockers. The authoritative V2 vision remains unchanged.
