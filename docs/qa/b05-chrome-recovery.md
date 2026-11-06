# B05 Chrome QA recovery and locked-art handoff

**Date:** 2026-11-06
**Scope:** B05 recovery only; this is not B06.
**Status:** QA workflow implemented; agent run status is in the local machine report. Owner visual/audio signoff remains pending.

## Run the real Vite app in local Chrome

From the repository root in Windows PowerShell:

```powershell
npm ci
npm run qa:chrome:self-test
npm run qa:chrome:local
```

`qa:chrome:local` opens the actual Vite React/Canvas game in a clean temporary Playwright context using `channel: 'chrome'`. It is headed by default. The launcher reuses a reachable Vite dev server at `127.0.0.1:5173`, or starts the repository's Vite app bound to `127.0.0.1` when the port is free. It stops only the Vite child process it started. It never uses a personal Chrome profile, remote debugging port, external host, or browser-policy workaround.

The run covers the title → hub → character/forms → game route; arrow and WASD movement; mouse attack against a development-only test target; guard, dodge and Ember activation; HUD; pause, settings and resume; and the two deterministic B05 replays through the real `GameController`, `CombatSession`, Canvas renderer and browser audio-event path.

The launcher records Chrome/version, OS and viewport, browser console/page errors, failed requests, HTTP error responses, timed proof state, sound event IDs/audio-context state, and requestAnimationFrame timing. It saves screenshots, a normal-speed ordinary-game WebM and one WebM per form replay beside `qa-report.json` under:

```text
tests/evidence/b05/live-chrome/run-<timestamp>-pid<process>/
```

Every report is labeled **AUTOMATED / HUMAN REVIEW PENDING**. A Playwright WebM is video-only: an audio-context state or sound-event log is not evidence that a person heard the mix. Timestamped run directories are Git-ignored to keep recordings out of repository downloads; keep the local report and clips for review or share selected files separately.

### Alternate local Vite port

If port 5173 is occupied, start Vite on another loopback port:

```powershell
npm run dev -- --port 5175 --strictPort
```

Then, in another PowerShell window:

```powershell
node tools/b05-chrome-local-qa.mjs --url http://127.0.0.1:5175/
```

The `--url` option accepts only `http://localhost`, `http://127.0.0.1`, or `http://[::1]` and verifies the response is Vite. A non-Vite service on the requested port is reported and left untouched. For supplementary automation, use `npm run qa:chrome:headless`; a headless run cannot pass visible-gameplay or human-visual gates.

## Owner visual and audio review

1. Watch `ordinary-game.webm`, `showcase-ember-drive.webm`, and `showcase-glass-current.webm` at normal speed. Inspect the matching screenshots and `qa-report.json`; note any clipped, detached, neighboring, wrongly facing, drifting, or unreadable animation/art. The proof still uses eight held drawings per form; it is not presumed fluid.
2. For a **30–90 second** sound review, use normal Chrome with sound enabled and record system audio with Xbox Game Bar (`Win+G`, confirm capture audio is enabled, then `Win+Alt+R`) or OBS with desktop/system audio enabled. Do not rely on the Playwright WebM for sound. Play both B05 replays and ordinary attacks, guard/dodge and pause/menu sounds.
3. Save or copy the owner recording to `tests/evidence/b05/live-chrome/owner-audio-review.mp4` (or provide the recording for review). Listen for timing, clipping, masking and mix balance. Mark the human visual and audio rows only after that review.

If the headed launch is denied by a local execution policy, keep the exact failure from `qa-report.json` and run the same command in a normal authorized interactive PowerShell session. Do not change Chrome security settings or bypass policy. This repository cannot repair the unavailable connected-browser host.

## Gate status

| Gate | Current status | Evidence and limit |
|---|---|---|
| Implementation | PARTIAL / prototype | Runtime combat and the Vite showcase exist; no transformation meets the complete V2 form contract. |
| Browser automation | Workflow implemented; latest run status in `qa-report.json` | A permitted automated pass does not approve animation quality. Headed owner run remains the visible-review path. |
| Human visual/audio acceptance | PENDING | Requires owner playback at actual game scale and a system-audio recording/listen. |
| Motion-method feasibility | CLIP CAPTURED; owner visual review pending | 1.7s single-layer right-profile cutout lunge/attack at 100% and 75% with a real hit. Code interpolation moves the whole cutout; no skeletal or joint animation is claimed. |
| Fluid animation | FAIL | Eight independently generated held poses have large anchor changes and no in-betweens. Stop more pose rolls; prove one reference-locked rig/layer or reviewed in-between clip first. |
| Layered motion VFX | NOT STARTED | The prior stop condition remains; do not proceed until the one-clip motion gate clears. |

## Corrected source and art handoff

| Reference | Correct identity | Current decision |
|---|---|---|
| `glass-concept-a.png` | Angular translucent shoulder/coat | Provisional Glass Current silhouette anchor; owner approval pending. |
| `glass-concept-b.png` | Slim dark jacket with open forearm loops | Glass Current B. It is not Ember art and retains its source identity. |
| Third shared image | Base Kairo-like design | Base-form identity reference, not a new transformation. |
| `ember-concept-a.png` | Separate Ember candidate with large bronze cuffs | Ember A comparison anchor. |
| `ember-reinterpretation-from-glass-b-reference-v1.png` | One heated segmented kinetic-armor reinterpretation | Owner-review proposal only. Glass B was used only as forearm-placement inspiration; the image is not runtime art or an approved Ember master. |

The reinterpretation's exact prompt and reference roles are recorded in [`ember-reinterpretation-manifest.json`](../../art-source/b05/visual-breakthrough/ember-reinterpretation-manifest.json). The proposal sheet is shown at full source scale in the repo; review it alongside Ember A and Glass A before selecting a silhouette. No additional character-frame generation was done.

## Agent-side verification record

**Latest completed run:** `tests/evidence/b05/live-chrome/run-2026-11-06T17-08-27-585Z-pid42156/qa-report.json` (local, Git-ignored artifacts).

| Command/check | Result | Scope |
|---|---|---|
| `npm ci` | PASS; 73 packages installed, 0 vulnerabilities reported by install | Clean dependency install with Playwright pinned. |
| `npm run qa:chrome:self-test` | PASS | Loopback restrictions and route construction; no browser involved. |
| `npm run qa:chrome:headless` | PASS; 44/44 assertions, Chrome 156.0.8078.80, Node v22.22.0 | Supplementary headless run on Windows 10.0.26300 through actual Vite at 1280×720; ordinary gameplay also captured at 960×540. |
| Browser telemetry | PASS; 0 console errors, page exceptions, failed requests or HTTP errors | Recorded per page in the JSON report. |
| Ordinary game input | PASS | Title/hub/character/forms/game; WASD and arrows moved the hero; mouse attack reduced test target HP 1000→986; guard and dodge states activated; form activation, HUD, pause/settings/resume passed. |
| Ember replay | PASS (automated simulation/renderer evidence) | 5.02s timeline; real target HP 1000→986; returned to base; event IDs logged. |
| Glass replay | PASS (automated simulation/renderer evidence) | 5.06s timeline; counter window opened; target HP 1000→964; returned to base; event IDs logged. |
| Cutout motion-method clip | PASS (pipeline feasibility only; owner review pending) | One generated right-facing profile view, cropped at draw time from the proposal sheet and moved as one fixed-scale cutout by six smooth code keyframes for 1.7s; a real directional melee hit landed. Normal-speed WebM and screenshots were captured at 100% and 75% in the actual Vite scene, with the failed eight-pose GIF shown beside the source. No joint deformation, manually posed parts or generated in-betweens. This does not clear animation quality. |
| RAF timing sample | Observed only | Form replay: Ember 4.2 ms median / 4.3 ms P95 / 20.7 ms max; Glass 4.2 / 4.3 / 24.9 ms. Cutout test at both scales: 4.2 / 4.3 / 8.4 ms. Headless callback rate is not a display-refresh or performance acceptance result. |
| Video/audio | Video PASS; audio NOT CAPTURED | One ordinary-game WebM and one per form are present. Playwright did not capture sound; event log reports AudioContext running but no listening was performed. |
| Headed owner review | PENDING | No successful headed owner review or sound recording is claimed. A first npm argument-forwarding invocation was interrupted when the wrapper omitted the headless flag; it has no usable report and is excluded. |
| Fluid animation / layered VFX | FAIL / NOT STARTED | Existing eight-pose motion still fails. Layered work remains stopped at the motion gate. |

The automatic pass demonstrates the QA pathway, bounded gameplay mechanics, and one cutout interpolation method only. It does not approve the concepts, show that production animation is fluid, confirm monitor refresh behavior, or establish heard audio/game feel. The full-body cutout keeps all parts stable because it moves as a single image; it is not a skeletal/limb rig. Do not infer those passes from the report.

See [ADR-016](../technical/adr-016-b05-local-chrome-and-art-handoff.md), [visual-breakthrough evidence](b05-visual-breakthrough-evidence.md), and [art notes](../art/b05-visual-breakthrough-notes.md). V2 is unchanged; B05 remains partial, and B06 is out of scope.

## Later premium motion/VFX production run — 2026-11-06

The recovery-run results above are historical and are superseded for current B05 gameplay evidence by [`b05-animation-vfx-production-evidence.md`](b05-animation-vfx-production-evidence.md). The new proof plays the existing four-direction form atlases and event-timed VFX through the actual Vite game for 36 seconds per form, exercises both ordinary form selections and the Glass dodge counter, and captures 100%/75% normal/reduced-effect views. It does not use the rejected eight-pose GIF as the live character animation.

The current captures remain **headless automated / owner review pending**. The videos contain no audio, no one listened to the mix, and the runtime body art still uses the earlier B05 turnaround references rather than the separate Glass A and Ember reinterpretation proposal images. See the premium evidence report for missing art states, current source mapping, browser metrics and the exact latest report path.
