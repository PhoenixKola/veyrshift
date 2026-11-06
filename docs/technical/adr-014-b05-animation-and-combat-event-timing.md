# ADR-014: B05 form animation and combat event timing

- **Date:** 2026-11-06
- **Status:** Implemented proposal; owner/game-feel review pending
- **Scope:** Kairo B05 Ember Drive and Glass Current prototype

## Context

B05 added short candidate form atlases but several frame transitions were not tied tightly enough to simulation events. The audit also found Glass dodge duration could be overwritten by the base duration, a held guard could re-open its parry window, Glass special could bypass its earned counter, and form projectiles/casts could lose their source identity on form expiry.

## Decisions

1. A Glass dodge earns its one-shot counter only when an incoming hit is actually avoided during the dodge window. The counter is consumed by Glass's special and waits through its configured windup before applying damage.
2. A guard press can award one perfect parry. Releasing guard is required before another parry window can open. The form parry art is shown only after a successful parry event.
3. A cast snapshots its form when started. A bolt keeps that form for impact/splash after expiry; a committed Glass counter similarly keeps its cast form through reversion. A base cast never acquires form behavior after activation.
4. Ember marks are counted on confirmed target contacts. The third contact against that target detonates the marks and emits a separate event from ordinary combo contact.
5. Form dodge duration comes from its form tuning. Candidate bolt release art changes at the simulation's `.105s` windup boundary. Combo candidate phase metadata and offline previews use simulation windup/active/recovery timing and keep all four direction rows visible together.
6. Candidate exports fail on above-threshold source-cell edge contact. No detached foreground component is automatically deleted; source art with unsafe boundaries or facing errors is rejected and retained.

## Consequences

These changes are deterministic and covered by core tests. Candidate atlas timing can now be compared with combat events using the same timing inputs. They do not establish real-time animation quality, correct hitboxes in gameplay, audio quality, balance, or owner approval. Missing form hurt/KO, special, finisher, start/stop and activation/deactivation character clips remain explicitly out of scope for this partial implementation.

## Verification

`npm test` passed 40/40 at the time of this ADR. The live Chrome gate remains blocked; see `docs/qa/b05-finalization-evidence.md`.
