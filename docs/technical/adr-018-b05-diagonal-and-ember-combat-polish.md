# ADR-018 — Four-view diagonal travel and B05 Ember combat polish

**Date:** 2026-11-06
**Status:** Implemented candidate; owner visual and game-feel approval pending.

The renderer has only four authored body directions. Exact diagonal input formerly selected front/back because vertical won ties, even while Kairo traversed the screen laterally. Travel now selects the side profile for 45-degree input, with a bounded hysteresis region that keeps it stable near the diagonal boundary. Near-vertical travel returns to the front/back row. Dodge and quantized combat aim use the same diagonal side bias, so attacking along the travel line does not switch to a contradictory body row. The melee hit arc stays locked to the attack row; this is a four-view approximation, not eight-direction art.

Base combo hit two previously displayed atlas column 2 at damage contact although the authored extended punch is column 1. The resolver now keeps the authored contact column through the active hit window and moves to recoil during recovery. Base and form attacks receive a small renderer-only forward body drive and settle; hitboxes, damage, cancel timing and deterministic simulation remain unchanged.

Ember uses the existing original generated VFX textures with a cuff-localized glow, stronger ignition, contact and finisher layering, and a quieter persistent aura. The finisher texture is rotated to align its source diagonal with the attack direction. These presentation changes apply in ordinary gameplay and the developer showcase because both use the same Canvas renderer. No new character sheet or master was generated. The runtime Ember body is still based on the earlier turnaround, so the heated segmented armor reinterpretation is not yet fully embodied in all four directions.

This is a bounded B05 improvement, not a complete transformation or a renderer change. Glass remains functional and unchanged. Dedicated Ember special/finisher body animation, hurt/KO, start/stop, recorded audio, owner acceptance and boss validation remain open. V2 vision is unchanged.
