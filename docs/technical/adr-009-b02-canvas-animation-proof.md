# ADR-009: Canvas2D remains the interim animation proof renderer after B02

- **Date:** 2026-11-05
- **Status:** Proposed; owner review required
- **Context:** B01 measured a small Canvas2D/Phaser comparison but left the renderer decision open. B02 adds five frame atlases, state-driven animation selection, combat feedback, and a short form presentation to the existing portable Canvas renderer.
- **Decision:** Keep Canvas2D as the interim renderer for the current prototype while keeping the final renderer choice open. B02 provides evidence that this bounded workload can run in the existing browser-first path; it does not establish production scale or settle the B00 engine checkpoint.
- **Evidence:** Five runtime atlases total 846,845 bytes. The visible Chrome 156 B02 pass completed its scripted interactions without page/console errors or failed requests. In a 1.8-second animation-frame sample, 431 intervals measured 4.2 ms median and 4.3 ms p95 on the local machine. See [`b02-evidence.md`](../qa/b02-evidence.md) and [`b01-renderer-evaluation.md`](../qa/b01-renderer-evaluation.md).
- **Consequences:** Core simulation remains renderer-independent. Continue tracking asset scale, effect overdraw, input feel, mobile/browser performance and the unmeasured alternatives before making a final engine choice. Do not describe the renderer as locked.
- **Open:** Owner style/game-feel acceptance, representative production-scale workload, lower-powered hardware, physical controller, and final renderer decision.
