# B05 inherited live-game evidence and owner capture procedure

**Current batch status:** PARTIAL / BLOCKED. For the current art, integration, automated checks and per-state status matrix, see [`b05-completion-evidence.md`](b05-completion-evidence.md); it supersedes earlier B05 baseline status below. CUA reports `browser access host unavailable`, and no browser surface is exposed. The native app pipe was also unavailable. The isolated standalone/headless browser smoke does not count as visible Chrome UAT.

## Gate 0 — inherited B04 live verification

| Requirement | Status | Evidence |
|---|---|---|
| Actual Vite game from title through hub and a run | BLOCKED | No headed Chrome surface can be controlled in this environment. |
| Movement, directional attacks, combo, dash, guard/parry, bolt, shockwave and Threadbreak | NOT RUN | No live Vite session or video. |
| HUD, pause/settings/save persistence, sound and mute | NOT RUN | No browser interaction or listening review. |
| Reduced effects and 16:9 / 16:10 / ultrawide / 960×540 | NOT RUN | No headed capture. |
| B04 finisher fourth frame in actual combat | NOT RUN | Contact sheet is not proof of gameplay continuity. |
| Physical controller | NOT RUN | No hardware test. |

## Owner-run visible Chrome checklist

1. From the repository root, run `npm ci` and `npm run dev`. Open the exact localhost origin printed by Vite in visible Chrome. Keep DevTools Console and Network open; do not use the standalone preview as a substitute.
2. Record a continuous normal-speed clip from title → hub → new run → movement, attacks and abilities → pause/settings → resume → reward/results. Capture B04 Threadbreak's fourth finisher frame during combat.
3. Exercise WASD and arrows; mouse aim and left/right click; Shift dodge; hold E guard/parry; Q shockwave; R form; F finisher; Escape pause. Report blocked inputs, JS errors, failed assets and save behavior.
4. Capture Ember and Glass separately at ordinary gameplay scale through activation → run → combo → bolt → special → finisher → reversion. Include full animation speed and sound. Follow the form-specific sequence and view/settings/performance requests in `b05-completion-evidence.md`.
5. Test sound only after a user gesture; separately record mute and master/effects volume. Synthetic sound event logs are not listening evidence. Use a physical controller only if one is available, otherwise record NOT RUN.
6. Include viewport sizes, Chrome version, machine and any frame-time/memory measurements. Owner review is required before marking any visual, sound, accessibility, controller or performance gate passed.

The candidate art, atlas export audit, offline GIFs and automated tests are evidence of implementation only. They do not show actual Vite rendering or establish visual quality, fluidity, combat feel or sound quality.
