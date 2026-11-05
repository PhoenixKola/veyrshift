# B00 original visual direction proposals — 2026-11-05

**Status: proposals only. Neither board is approved master art.** These generated images are for the owner to compare; they are not sprite sources, final character sheets, or proof of legal clearance.

## Shared scene brief

Both boards depict the same proposed original Kairo scene: asymmetric plum hair, cropped split charcoal jacket, bronze kinetic cuffs; an angular rift-wisp enemy with a high-contrast attack tell; an angled fractured-stone Weave arena; a pearl-cyan directional strike; and an Ember Drive concept that adds geometry/plates while retaining Kairo's identity. The images also include body, motion, attack, and activation studies.

| Candidate | Rendering direction | Strengths | Risks / open questions |
|---|---|---|---|
| **A — Hand-painted graphic cel shade** ([proposal](../../public/assets/_b00-concepts/direction-a-hand-painted.png)) | High-resolution painted character with controlled edge lighting, material texture and broad brush variation | Premium character close-ups; modular layer potential; stronger painted surface treatment and broad scene depth | At the gameplay scale, fine paint detail may collapse; require controlled paint texture and fewer small costume marks. Current board's attack crescent approaches the enemy tell in luminance and should be retuned. |
| **B — Crisp inked 2.5D sprite language** ([proposal](../../public/assets/_b00-concepts/direction-b-inked-2.5d.png)) | Bolder outline, cleaner poster-like color blocks and integrated high-resolution sprite lighting | Likely clearer separation at gameplay scale; strong read of movement poses and segmented silhouette; easier to constrain into consistent atlas frames | Avoid a flat cutout look; integrated lighting and ground shadows must preserve depth. The generated board still has painterly shading, so production tests must sharpen the graphic treatment. |

## Current recommendation for user review

Advance **B as the first animation-atlas feasibility test**, with A as the visual control. The clean block shapes and strong outline are more likely to survive 64–96 px screen height and reduced-scale play, while selected hand-painted lighting from A can be tested as a restrained surface pass. This is a production hypothesis, not owner signoff. Run a grayscale silhouette test from actual gameplay camera and compare hit/telegraph overlap before choosing.

## Kairo / enemy / stage / effects system proposal

- **Kairo base:** retain the asymmetrical plum hair mass, split jacket tails, bronze cuff silhouette, and forward-weighted stance. Avoid tall golden spikes, familiar martial-arts uniforms, and iconic beam poses.
- **Ember Drive concept:** add offset articulated cuff plates and compressed angular orbit marks. The generated concept suggests the silhouette, but it contains no production animation, complete moveset, audio, or ordinary-room/boss validation. The current runtime sample remains a time-limited damage modifier and aura prototype.
- **Enemy:** angular, non-humanoid wisp silhouette with a separate color/shape tell. Tell readability outranks effect density.
- **Arena:** fractured circular floor and suspended Weave structures, restrained steel-blue values; keep the playable floor visually calmer than the perimeter.
- **Punch/effect:** directional crescent with a clear point of origin and travel direction; use pearl/cyan edge and a short amber hit accent. Avoid a full-screen bloom or beam ritual.

## Production pipeline proposal (not yet implemented)

- Preserve layered source masters in a source-art folder; export transparent RGBA PNG atlases at integer pixel sizes. Do not regenerate at runtime.
- Keep the game camera/ground anchor consistent across 4-way or 8-way poses. Start with idle, move, 3-hit attack, dash, guard, hit, transformation anticipation/burst/recovery. Record per-frame bounds, pivot, ground anchor, duration, and hitbox timing in a typed manifest.
- Use stable names such as `kairo_base_idle_s_00.png`, `kairo_base_attack_e_01.png`, and `kairo_ember_activation_02.png`; atlas IDs should use hero, discipline, state, direction, and revision.
- Track generation method/tool, date, exact prompt, source references, edit history, likeness review, derivatives, and owner approval in the provenance ledger. Generated output remains proposed until owner review; online searches cannot certify clearance.

## Decisions required from owner

1. Choose A, B, a hybrid, or request another iteration.
2. Approve or revise Kairo's silhouette and the Ember Drive geometry concept.
3. Approve the proposed next-step Canvas interim renderer or request the bounded Phaser comparison spike before B01/B02.

No mass production or final art signoff should begin until these choices are made.
