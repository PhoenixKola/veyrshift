# Architecture decision log

| ID | Status | Decision | Rationale / open question |
|---|---|---|---|
| ADR-000 | Provisional | Working name `Project Veyrshift` | Internal-only codename; do not assert trademark availability |
| ADR-001 | Locked intent | 2.5D browser-first fully manual action roguelite | Updated V2 vision overrides previous auto-survivor concept |
| ADR-002 | Provisional | React 19, TypeScript, Vite shell | Familiar maintainable web app; actual installed build pending B00 |
| ADR-003 | **OPEN** | Canvas2D renderer vs Phaser 3 / alternative | B01 measured a bounded Canvas2D/Phaser spike but not representative production animation or scale; final renderer choice remains open. See ADR-008. |
| ADR-004 | Locked architecture goal | Renderer-independent TypeScript combat simulation | Avoid total gameplay rewrite when production art engine is selected |
| ADR-005 | Locked process | 42 forms are *vision/catalog*, 4 high-quality forms are MVP target | Prevent completion-count theatre and repetitive recolor assets |
| ADR-006 | Locked process | Visual approval and real Chrome hands-on signoff | Automated test/screenshot sweeps cannot replace owner aesthetics and game-feel acceptance |
| ADR-007 | Proposed / owner review | Continue Canvas2D as interim renderer | React/Vite and existing Canvas lab run in Chrome; Phaser comparison remains unmeasured. See [`adr-007-b00-renderer.md`](adr-007-b00-renderer.md). |
| ADR-008 | Proposed / owner review | Keep Canvas2D interim after B01 same-scene spike | Both modes render the proof; measured data is insufficient to lock an engine. See [`adr-008-b01-renderer-proof.md`](adr-008-b01-renderer-proof.md). |
| ADR-009 | Proposed / owner review | Keep Canvas2D as interim after B02 animation proof | Visible Chrome evidence covers five atlases and a bounded combat scene; performance scope is one local workload and does not lock the engine. See [ADR-009](adr-009-b02-canvas-animation-proof.md). |
| ADR-015 | Accepted for this corrective pass; owner review required | Keep Ember A and Glass A as silhouette proposals, add Vite-only actual-game replay, and stop independent full-character frame generation after motion gate failure | See [ADR-015](adr-015-b05-visual-breakthrough.md) and the [B05 visual-breakthrough evidence](../qa/b05-visual-breakthrough-evidence.md). |
| ADR-016 | Accepted for this recovery batch; owner review required | Add an owner-local isolated Playwright/Chrome workflow and correct Glass B's source identity; keep one Ember reinterpretation as a non-runtime proposal | See [ADR-016](adr-016-b05-local-chrome-and-art-handoff.md) and the [B05 Chrome recovery handoff](../qa/b05-chrome-recovery.md). |
| ADR-017 | Accepted for implementation; owner review required | Ship a 36-second actual-game Ember/Glass candidate using existing form atlases, simulation timing and layered event VFX; keep animation/art/audio acceptance pending | See [ADR-017](adr-017-b05-premium-motion-vfx-candidate.md) and [B05 premium motion/VFX evidence](../qa/b05-animation-vfx-production-evidence.md). |
