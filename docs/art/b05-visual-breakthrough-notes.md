# B05 visual-breakthrough art notes

**Generated:** 2026-11-06 with the OpenAI built-in image-generation tool. The tool did not expose a model/version or seed. This remains original-IP feasibility art; it has not been checked for likeness conflicts or approved by the owner.

## Candidate direction

- **Ember A** (`ember-concept-a.png`): same recognizable Kairo face, plum hair, lean build, dark jacket, split cloth and bronze-cuff identity; a greatly enlarged asymmetrical segmented cuff makes the attack side heavy. A right-facing profile was generated alongside the front view.
- **Ember B** (`ember-concept-b.png`): the stronger shape change is a broad asymmetric shoulder/pauldron and longer, more flared coat. It is an alternate direction, not used for the pose proof.
- **Glass A** (`glass-concept-a.png`): sharply faceted translucent shoulder pieces and long side panels create a taller, more vertical silhouette, with restrained cool material accents. A right-facing profile accompanies the front view.
- **Glass B** (`glass-concept-b.png`): narrower body outline, open geometric forearm rings, and one controlled sash. It is an alternate direction, not used for the pose proof.

The selected Ember and Glass proposals remain visually distinct from base in the VFX-off front and profile comparisons at 100% and 75%. The base art is lower-resolution than the generated concepts; the close-up board keeps that limitation visible rather than presenting the base as equally detailed.

## Sequence drafts and rejection log

Rejected source images and superseded concept/sequence sheets are stored outside Git in the sibling local archive. Their filenames, original paths, byte counts and hashes remain in that archive's inventory; selected Ember comparison references and its reinterpretation master remain tracked.

| Source | Status | Review |
|---|---|---|
| `ember-sequence-grid-v1.png` | Retained as draft | Eight right-facing phases: idle, anticipation, cuff forming, transformed stance, heavy-attack windup, contact, recovery, return. Cell-edge audit passes, but the scale/anchor changes and held poses fail fluid-motion quality. |
| `glass-sequence-grid-v1-cell-bleed.png` | Rejected, retained | Counter anatomy/energy touched neighboring cells. |
| `glass-sequence-grid-v2-afterimage-edge.png` | Rejected, retained | The afterimage crossed its cell boundary. |
| `glass-sequence-grid-v3.png` | Retained as draft | Eight right-facing phases: base idle, focus, facets forming, transformed stance, dodge, counter thrust, recovery, return. Cell-edge audit passes. Large holds and independently changing silhouette still fail fluid-motion quality. |
| `rejected/glass-concept-b1-wrong-profile.png` | Rejected, retained | Profile faced the wrong direction. |

No edges were trimmed to hide bleed. The runtime proof atlases are derived by taking each equal source cell, finding its alpha bounds above 32, adding transparent margin, fitting it to a 192×256 transparent frame, and packing the eight frames into a horizontal strip. Source alpha and every visible component are kept. There are no generated or interpolated in-between frames. Bottom-center fitting aligns the feet but does not stabilize body/shoulder anchors; this is one cause of visible drift.

The timed GIFs use the source timings in `manifest.json`. They are one authored image per timed phase, not duplicated 60-fps copies, but they are only pose previews and do not represent a rigged or polished animation.

## Corrected source mapping and locked handoff (2026-11-06)

The user's three shared choices map to the repository as follows: angular translucent shoulder/coat is `glass-concept-a.png`; the slimmer dark jacket with open forearm loops is `glass-concept-b.png`; the third image resembles base Kairo. **Glass B is not Ember art.** Glass A remains the provisional Glass Current silhouette anchor. Ember A remains the separate oversized-bronze-cuff proposal and comparison anchor.

One Ember reinterpretation was generated for quick owner review: [`ember-reinterpretation-from-glass-b-reference-v1.png`](../../art-source/b05/visual-breakthrough/ember-reinterpretation-from-glass-b-reference-v1.png). It uses Glass B only as a clearly labeled placement inspiration for a forearm motif, with heated segmented bronze/charcoal kinetic armor and orange-red seams. Its exact prompt, reference roles and image metadata are in [`ember-reinterpretation-manifest.json`](../../art-source/b05/visual-breakthrough/ember-reinterpretation-manifest.json). This sheet is a proposal only, is not a replacement for Ember A, is not a runtime asset, and has no owner approval. No additional pose sheets were generated.

The art handoff to the owner is limited to reviewing Glass A against Ember A and this single Ember reinterpretation. Decide the preferred Ember silhouette before any animation production. The existing independent-pose drafts still fail the fluid-motion gate; no more full-character pose rolls should be made. The next animation attempt must use one reference-locked rig/layer workflow or reviewed in-betweens and pass at gameplay scale before further production.

## Prompt provenance

The generation tool did not provide a durable prompt transcript with the earlier concept and sequence files. Their exact prompt strings are not present in this checkout, so they are **not reconstructed as if verbatim**. The new Ember reinterpretation prompt is archived verbatim in its adjacent manifest. The earlier request briefs used were:

- Ember A/B concepts: original Kairo front plus right profile; retain face, asymmetrical plum hair, lean build, bronze cuff motif and split dark jacket; distinguish A with a massive segmented gauntlet and B with shoulder/mantle geometry; transparent background, no effects.
- Glass A/B concepts: original Kairo front plus right profile; retain the same identity; distinguish A with translucent angular shoulder/coat facets and B with open forearm geometry; no blue recolor, no effects, transparent background.
- Ember v1: transparent 4×2 source grid of eight whole-body Kairo phases for ignition and one heavy combo attack, right-facing consistently, no cell overlap or detached body parts.
- Glass v1/v2/v3: transparent eight-pose grid for focus, facets, precise dodge and counter, with a consistent right-facing head; no neighboring pixels. The v1/v2 layout/afterimage failed edge checks; v3 removed the overlapping afterimage from the generated frames so trails can be a separate renderer effect.

These bullets are brief summaries, **not exact prompts**. Future image generations must archive the exact submitted prompt and provider/model metadata when exposed before an image enters the candidate ledger.

## Reproducible outputs

Run `python tools/build-b05-visual-breakthrough.py` to rebuild:

- `tests/evidence/b05/visual-breakthrough/comparison-front.jpg`
- `tests/evidence/b05/visual-breakthrough/comparison-right.jpg`
- `tests/evidence/b05/visual-breakthrough/detail-closeups.jpg`
- normal-scale pose boards and 5-second timed-pose GIFs
- eight-frame lossless WebP preview atlases under `art-source/b05/visual-breakthrough/runtime/`
- `art-source/b05/visual-breakthrough/manifest.json` with source bounds, timings and byte counts

The runtime atlases are served only by the Vite **development** harness; they are not exported under `public/` or added to the production runtime bundle. See [visual-breakthrough QA](../qa/b05-visual-breakthrough-evidence.md).

## Later B05 playable atlas continuation — 2026-11-06

The rejected eight-pose drafts above remain rejected; the later production pass did not add frames to them. Instead, the actual Vite game now plays the existing four-direction form atlases, event-timed form textures and combat VFX through 36-second Ember and Glass sequences. The older sentence above about the development-only proof atlases describes the superseded eight-pose visual-breakthrough route; the newer runtime path uses the production candidate atlases under `public/assets/characters/kairo/forms/` and is documented in [premium motion/VFX evidence](../qa/b05-animation-vfx-production-evidence.md).

The current runtime atlases still reference the earlier `ember-drive-turnaround-v2.png` and `glass-current-turnaround-v3.png`, not the separate Ember reinterpretation and Glass A proposal images. Do not treat those proposals as integrated masters. Runtime visual quality, smoothness, audio and owner approval remain pending; the showcases are review candidates, not completed V2 forms.
