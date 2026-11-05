# Architecture decision log

| ID | Status | Decision | Rationale / open question |
|---|---|---|---|
| ADR-000 | Provisional | Working name `Project Veyrshift` | Internal-only codename; do not assert trademark availability |
| ADR-001 | Locked intent | 2.5D browser-first fully manual action roguelite | Updated V2 vision overrides previous auto-survivor concept |
| ADR-002 | Provisional | React 19, TypeScript, Vite shell | Familiar maintainable web app; actual installed build pending B00 |
| ADR-003 | **OPEN** | Canvas2D renderer vs Phaser 3 / alternative | B00 must compare real animation, sprite composition, VFX, depth ordering and performance before final engine lock |
| ADR-004 | Locked architecture goal | Renderer-independent TypeScript combat simulation | Avoid total gameplay rewrite when production art engine is selected |
| ADR-005 | Locked process | 42 forms are *vision/catalog*, 4 high-quality forms are MVP target | Prevent completion-count theatre and repetitive recolor assets |
| ADR-006 | Locked process | Visual approval and real Chrome hands-on signoff | Automated test/screenshot sweeps cannot replace owner aesthetics and game-feel acceptance |
| ADR-007 | Proposed / owner review | Continue Canvas2D as interim renderer | React/Vite and existing Canvas lab run in Chrome; Phaser comparison remains unmeasured. See [`adr-007-b00-renderer.md`](adr-007-b00-renderer.md). |
