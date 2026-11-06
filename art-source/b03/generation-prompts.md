# B03 generation briefs

Generated 2026-11-06 with the built-in OpenAI image-generation tool (`image_gen.imagegen`). The service returned PNGs and output IDs but did not expose a downloadable prompt transcript, model/version, seed or per-frame settings. The briefs below preserve the exact creative constraints used for the source groups, but are reconstructed from the execution notes rather than claimed as verbatim provider prompts.

## Canonical master reference

Use the existing B01 Kairo master as a visual reference. Create an original, polished, high-resolution turnaround for the same lean athletic male fighter: asymmetric dark-plum hair, charcoal split jacket with gold/bronze seams, bronze kinetic cuffs, dark loose trousers, and bronze-accent shoes. Preserve identity, garment construction, palette, body proportions, and asymmetry across front, right profile, back, and three-quarter-right views. Neutral studio presentation, clean isolated figure, no text, logos, copied characters, borrowed costume motifs, or extra limbs. The result is a proposal, not approved canon.

## Directional source grids

Use the accepted B03 turnaround as the consistency reference. Generate four rows in this fixed order: front/toward camera, right profile, back/away, left profile. Keep each figure fully inside its own transparent cell with generous gutters; no touching or crossing grid lines. Preserve Kairo's hair, face, jacket, cuffs, footwear, and palette. Do not mirror an existing view to invent another direction.

- **Idle:** four clean, combat-ready grounded poses per direction, small but visible changes in breathing, weight, hands, hair and split jacket tails; feet remain planted.
- **Run:** four sequential footwork poses per direction with clear weight shift, leg exchange, arm counter-swing and cloth follow-through; show complete shoes and limbs with margin.
- **Dodge:** four sequential evasive poses per direction, anticipation, displacement/lean, recovery; full body and scarf tails kept within each cell.
- **Supporting states:** one frame each per direction for guard, parry accent, hurt recoil and KO; same character scale and stable garment details.

## Combo source grids

Use the accepted turnaround. Each sheet is a four-by-four grid, rows in the same front/right/back/left order. Columns are anticipation, extension, contact, recovery. Keep complete anatomy inside each cell with generous separation. Hit 1 is a short straight punch, hit 2 a visibly different cross-body strike, and hit 3 a stronger rising strike with crouch/launcher follow-through. Keep the target line in the shown facing direction and preserve the exact same costume and character identity. Do not add effects that hide pose or anatomy.

## Iteration / rejection record

The first combo and dodge layouts placed detached shoes into neighbouring cells. The first uppercut clipped the wrist, and the first run cropped the profile shoe. Those PNGs were retained under `rejected/` and were not silently cropped into runtime use. Replacement source grids added margins and were inspected via the contact sheets. The state grid was regenerated/edited to reduce its background fringe before pipeline import. The raw pre-edit state sheet remains in `rejected/` for audit.

The generation tool did not provide deterministic seeds or a model version; re-generation is not guaranteed to reproduce these exact results.
