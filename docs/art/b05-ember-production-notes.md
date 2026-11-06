# B05 art-first Ember production candidate — 2026-11-06

The source masters are in `art-source/b05-ember-production/{base,ember}/`. All 19 selected PNGs were newly made with OpenAI's built-in ImageGen in this batch. The generator did not expose a model version, seed, or reproducible generation ID. The selected files and their SHA-256 values, source dimensions, exact extracted cell bounds, and discarded detached-pixel counts are in `b05-ember-production-manifest.json`. `python tools/build-b05-ember-production.py` rebuilds nine runtime WebP atlases from these masters and existing cardinal fallback atlases.

## Art lock and generation briefs

Base Kairo uses the B03 turnaround as the identity reference: asymmetric plum hair, lean athletic body, dark split jacket, bronze cuffs, and matched shoes. Ember uses `art-source/b05/visual-breakthrough/ember-reinterpretation-from-glass-b-reference-v1.png` as its provisional reference after a comparison with `ember-concept-a.png`. The chosen reference has segmented heated bronze forearms and armor, a distinctive red/orange internal glow, and retains Kairo's plum hair. It is not a Glass design approval.

The ImageGen briefs requested original transparent-background game character animation strips, consistent camera angle, full body and feet, four discrete nonoverlapping poses, no text, no props or neighboring fragments, anatomically correct two hands and two feet, and matching hair/cuffs/shoes. The directional turnaround brief requested unique NE/NW/SE/SW body views, and the run briefs requested four progressing gait poses for each diagonal and form. The combo briefs requested separate windup, extension, contact, and recovery for each of three punches, with an alternate arm for hit two and heavier weight transfer for hit three. Ember action briefs requested armored activation, special, and finisher body poses. These are editorial summaries of the generation requests; the service did not furnish durable prompt or seed metadata.

Two attempted 4-by-4 run grids were rejected because adjacent figures and edge fragments entered cells. The selected four-frame strips were exported with explicit cell cuts for four Ember strips where equal quarters would split the body. The exporter rejects a main figure touching a cell border, retains the largest alpha-connected body, and records detached pixels. It cannot prove anatomy or temporal continuity; those remain visual review items.

Gameplay-size contact-sheet inspection found the generated NW and SW figures looking toward screen-right. The exporter now mirrors those eight run drawings and two idle stills per form horizontally, using each distinct generated body drawing. This corrects the broad travel gaze, but it reverses asymmetric hair and costume details; those left-diagonal views remain provisional and need a hand-authored correction before premium approval. The manifest marks these mirrored rows explicitly.

## Runtime coverage

| State | Base in ordinary play | Ember in ordinary play | Remaining limitation |
|---|---|---|---|
| Idle N/E/S/W | B03/B05 legacy in new atlas | B05 legacy in new atlas | Four cardinal source views remain older work. |
| Idle NE/NW/SE/SW | One new unique still each, repeated in four cells | One new unique still each, repeated in four cells | NW/SW have horizontal gaze corrections; no breathing cycle. |
| Run N/E/S/W | B03/B04 legacy rows | B05 legacy rows | Gait quality still needs review. |
| Run NE/NW/SE/SW | Four new gait drawings per direction | Four new armored gait drawings per direction | NW/SW are horizontally corrected; asymmetric details need repair. |
| Three-hit combo E | Twelve newly authored body drawings | Twelve new armored body drawings | Contact cells follow the three simulation hit windows. |
| Three-hit combo N/S/W | B04 legacy | B05 legacy | No new diagonal attack aim; attack facing is still cardinal. |
| Activation/reversion E | New four-stage base-to-Ember strip | New four-stage strip played in reverse | Other directions use the existing crossfade. |
| Ember special/finisher E | N/A | Four new body drawings each | Existing VFX continue to provide effect layers; no new effect texture was generated in this batch. |
| Ember special/finisher N/S/W | N/A | Legacy Ember combo body rows | Requires directional authored action sheets. |
| Dodge, guard, hurt, KO, bolt | Existing directional art | Existing directional art | No new drawings in this batch. |

The runtime files are 192 × 256 pixels per cell. Idle/run atlases contain eight rows × four cells; combo atlases contain four rows × twelve cells. The Ember special/finisher atlases contain four rows × four cells with only the E row newly authored. Activation is one row × four cells. There are 76 selected newly generated body cells: 8 diagonal idle stills, 32 diagonal run drawings, 24 right-facing combo drawings, and 12 Ember action drawings. Idle atlas repetition yields 24 derived cells. The manifest records all selected cells, not an assertion that all pass owner art review.

## Acceptance

This is a production candidate, not a completed premium form. It lacks newly authored attack directions other than E, diagonal attack poses, new VFX textures, new supporting states, an authored idle cycle, and owner approval. The older Ember prototype also still fails the complete-form definition in the unchanged V2 vision.
