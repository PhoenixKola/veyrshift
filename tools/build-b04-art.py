#!/usr/bin/env python3
"""Build B04 runtime character atlases and contact sheets from authored source grids."""
from __future__ import annotations

from pathlib import Path
import json

from PIL import Image, ImageDraw
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art-source" / "b04"
RUNTIME = ROOT / "public" / "assets" / "characters" / "kairo" / "b04"
EVIDENCE = ROOT / "tests" / "evidence" / "b04" / "contact-sheets"
VFX_SOURCES = {
    "boltFlight": "kinetic-bolt-flight.png",
    "comboImpact": "combo-impact.png",
    "shockwave": "resonance-shockwave.png",
    "parry": "perfect-parry.png",
    "dodge": "slipstream-dodge.png",
    "finisher": "threadbreak-impact.png",
}
CELL_W, CELL_H = 192, 256
DIRECTIONS = ["front", "right", "back", "left"]
ALPHA_FLOOR = 32
cv2.setNumThreads(1)


def analyze_components(alpha: Image.Image) -> tuple[np.ndarray, list[int]]:
    binary = (np.asarray(alpha) > ALPHA_FLOOR).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    areas = [int(area) for area in stats[1:count, cv2.CC_STAT_AREA]]
    return labels, sorted(areas, reverse=True)


def source_cell(image: Image.Image, col: int, row: int, cols: int, rows: int) -> tuple[Image.Image, dict]:
    left = round(col * image.width / cols)
    right = round((col + 1) * image.width / cols)
    top = round(row * image.height / rows)
    bottom = round((row + 1) * image.height / rows)
    raw = image.crop((left, top, right, bottom)).convert("RGBA")
    alpha = raw.getchannel("A")
    alpha_array = np.asarray(alpha).copy()
    alpha_array[(alpha_array > 0) & (alpha_array <= ALPHA_FLOOR)] = 0
    labels, areas = analyze_components(Image.fromarray(alpha_array, mode="L"))
    if not areas:
        raise ValueError(f"empty source cell row={row} column={col}")
    largest = areas[0]
    count = int(labels.max()) + 1
    component_stats = cv2.connectedComponentsWithStats((alpha_array > ALPHA_FLOOR).astype(np.uint8), connectivity=8)[2]
    removed_components = []
    for label in range(1, count):
        area = int(component_stats[label, cv2.CC_STAT_AREA])
        if area / largest < 0.12:
            alpha_array[labels == label] = 0
            removed_components.append({
                "area": area,
                "bbox": [int(component_stats[label, cv2.CC_STAT_LEFT]), int(component_stats[label, cv2.CC_STAT_TOP]),
                         int(component_stats[label, cv2.CC_STAT_WIDTH]), int(component_stats[label, cv2.CC_STAT_HEIGHT])],
            })
    raw.putalpha(Image.fromarray(alpha_array, mode="L"))
    bounds = raw.getchannel("A").getbbox()
    if not bounds:
        raise ValueError(f"empty source cell row={row} column={col}")
    l, t, r, b = bounds
    margin = 7
    crop_box = (max(0, l - margin), max(0, t - margin), min(raw.width, r + margin), min(raw.height, b + margin))
    cropped = raw.crop(crop_box)
    _, comps = analyze_components(cropped.getchannel("A"))
    return cropped, {
        "sourceCell": {"x": left, "y": top, "width": right - left, "height": bottom - top},
        "sourceAlphaBounds": [l, t, r, b],
        "runtimeTrim": [crop_box[0], crop_box[1], crop_box[2], crop_box[3]],
        "clearedLowAlphaPixels": int(np.count_nonzero((np.asarray(alpha) > 0) & (np.asarray(alpha) <= ALPHA_FLOOR))),
        "foregroundComponents": comps,
        "foregroundComponentsDeleted": len(removed_components),
        "removedNeighborComponents": removed_components,
    }


def fit_cell(source: Image.Image, scale: float) -> Image.Image:
    width = max(1, round(source.width * scale))
    height = max(1, round(source.height * scale))
    resized = source.resize((width, height), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
    x = (CELL_W - width) // 2
    y = CELL_H - 8 - height
    frame.alpha_composite(resized, (x, y))
    return frame


def build_vfx(name: str, filename: str) -> dict:
    source_path = SOURCE / "vfx" / filename
    image = Image.open(source_path).convert("RGBA")
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise ValueError(f"VFX source is empty: {source_path}")
    l, t, r, b = bbox
    margin = max(8, round(max(r-l, b-t) * .035))
    crop = image.crop((max(0,l-margin), max(0,t-margin), min(image.width,r+margin), min(image.height,b+margin)))
    crop.thumbnail((768, 768), Image.Resampling.LANCZOS)
    output = ROOT / "public" / "assets" / "vfx" / "b04" / f"{name}.webp"
    output.parent.mkdir(parents=True, exist_ok=True)
    crop.save(output, "WEBP", quality=93, method=4, exact=True)
    print(f"Built generated VFX {name}: {crop.width}x{crop.height}", flush=True)
    return {"source":f"art-source/b04/vfx/{filename}", "runtime":output.relative_to(ROOT).as_posix(),
            "sourceSize":[image.width,image.height], "trimBounds":[l,t,r,b], "runtimeSize":[crop.width,crop.height],
            "format":"WebP RGBA", "animation":"position, scale, rotation, and opacity are driven by fixed-step combat events"}


def build_sheet(name: str, source_name: str, source_rows: int, maps: list[list[int]], runtime_name: str,
                direction_overrides: dict[int, str] | None = None) -> dict:
    source_path = SOURCE / source_name
    image = Image.open(source_path).convert("RGBA")
    direction_overrides = direction_overrides or {}
    override_images = {direction: Image.open(SOURCE / path).convert("RGBA") for direction, path in direction_overrides.items()}
    source_cols = 4
    src_frames: dict[tuple[int, int], tuple[Image.Image, dict]] = {}
    direction_max = [[1, 1] for _ in DIRECTIONS]
    for direction_index in range(4):
        for frame_index in range(source_rows):
            if direction_index in override_images:
                cell, metadata = source_cell(override_images[direction_index], frame_index, 0, source_rows, 1)
                metadata["sourceImage"] = f"art-source/b04/{direction_overrides[direction_index]}"
            else:
                cell, metadata = source_cell(image, direction_index, frame_index, source_cols, source_rows)
            src_frames[(direction_index, frame_index)] = (cell, metadata)
            direction_max[direction_index][0] = max(direction_max[direction_index][0], cell.width)
            direction_max[direction_index][1] = max(direction_max[direction_index][1], cell.height)

    direction_scales = [min(172 / width, 232 / height) for width, height in direction_max]
    output_frames = len(maps[0])
    atlas = Image.new("RGBA", (CELL_W * output_frames, CELL_H * 4), (0, 0, 0, 0))
    frame_manifest = []
    for direction_index, direction in enumerate(DIRECTIONS):
        for runtime_frame, source_frame in enumerate(maps[direction_index]):
            cropped, metadata = src_frames[(direction_index, source_frame)]
            scale = direction_scales[direction_index]
            frame = fit_cell(cropped, scale)
            atlas.alpha_composite(frame, (runtime_frame * CELL_W, direction_index * CELL_H))
            frame_manifest.append({
                "direction": direction,
                "frame": runtime_frame,
                "sourceFrame": source_frame,
                "runtimePivot": [CELL_W / 2, CELL_H - 8],
                "uniformScale": round(scale, 6),
                **metadata,
            })

    RUNTIME.mkdir(parents=True, exist_ok=True)
    output_path = RUNTIME / runtime_name
    output_path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(output_path, "WEBP", quality=93, method=4, exact=True)
    print(f"Built animation atlas {name}: {atlas.width}x{atlas.height}", flush=True)
    contact = Image.new("RGB", (CELL_W * output_frames, CELL_H * 4 + 28), (15, 24, 36))
    draw = ImageDraw.Draw(contact)
    for i, direction in enumerate(DIRECTIONS):
        draw.text((6, i * CELL_H + 4), direction.upper(), fill=(173, 203, 215))
        for f in range(output_frames):
            frame = atlas.crop((f * CELL_W, i * CELL_H, (f + 1) * CELL_W, (i + 1) * CELL_H)).convert("RGBA")
            bg = Image.new("RGBA", frame.size, (15, 24, 36, 255))
            bg.alpha_composite(frame)
            contact.paste(bg.convert("RGB"), (f * CELL_W, i * CELL_H + 28))
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    contact.save(EVIDENCE / f"{name}.png", optimize=True)
    return {
        "source": f"art-source/b04/{source_name}",
        "runtime": f"public/assets/characters/kairo/b04/{runtime_name}",
        "sourceGrid": {"columns": 4, "rows": source_rows, "columnOrder": DIRECTIONS, "rowOrder": "authored phase sequence"},
        "directionOverrides": {DIRECTIONS[index]: path for index, path in direction_overrides.items()},
        "runtimeGrid": {"columns": output_frames, "rows": 4, "rowOrder": DIRECTIONS},
        "frameWidth": CELL_W,
        "frameHeight": CELL_H,
        "directionScales": {direction: round(direction_scales[index], 6) for index, direction in enumerate(DIRECTIONS)},
        "alphaFloor": ALPHA_FLOOR,
        "frames": frame_manifest,
    }


def main() -> None:
    RUNTIME.mkdir(parents=True, exist_ok=True)
    for stale in RUNTIME.glob("*.png"):
        stale.unlink()
    icons = {
        "combo": build_sheet("combo", "kairo-combo-hit1-grid.png", 4,
                             [[0, 1, 2, 3, 0, 1, 2, 0, 0, 1, 2, 3] for _ in DIRECTIONS], "combo.webp"),
        "comboHitTwo": build_sheet("combo-hit-two", "kairo-combo-hit2-grid.png", 3,
                                   [[0, 1, 2, 0] for _ in DIRECTIONS], "combo-hit-two.webp"),
        "comboHitThree": build_sheet("combo-hit-three", "kairo-combo-hit3-grid.png", 4,
                                     [[0, 1, 2, 3] for _ in DIRECTIONS], "combo-hit-three.webp"),
        "locomotionTransitions": build_sheet("locomotion-transitions", "kairo-locomotion-transitions-grid.png", 4,
                                              [[0, 1, 2, 3] for _ in DIRECTIONS], "locomotion-transitions.webp"),
        "bolt": build_sheet("bolt-cast", "kairo-bolt-cast-grid.png", 4,
                            [[0, 1, 2, 3] for _ in DIRECTIONS], "bolt-cast.webp"),
        "shockwave": build_sheet("shockwave", "kairo-shockwave-grid.png", 4,
                                 [[0, 1, 2, 3] for _ in DIRECTIONS], "shockwave.webp"),
        "guardParry": build_sheet("guard-parry", "kairo-guard-parry-grid.png", 4,
                                  [[0, 1, 2, 3] for _ in DIRECTIONS], "guard-parry.webp"),
        "finisher": build_sheet("finisher", "kairo-finisher-grid.png", 4,
                            [[0, 1, 2, 3] for _ in DIRECTIONS], "finisher.webp",
                            {1: "kairo-finisher-right-strip.png"}),
    }

    # Extend the combo atlas with the separately authored hit-two and hit-three frames.
    # Each four-frame section stays distinct; hit two reuses only its recovery stance.
    hit_two_image = Image.open(RUNTIME / "combo-hit-two.webp").convert("RGBA")
    hit_three_image = Image.open(RUNTIME / "combo-hit-three.webp").convert("RGBA")
    combined = Image.open(RUNTIME / "combo.webp").convert("RGBA")
    for direction in range(4):
        combined.paste(hit_two_image.crop((0, direction * CELL_H, 4 * CELL_W, (direction + 1) * CELL_H)), (4 * CELL_W, direction * CELL_H))
        combined.paste(hit_three_image.crop((0, direction * CELL_H, 4 * CELL_W, (direction + 1) * CELL_H)), (8 * CELL_W, direction * CELL_H))
    combined.save(RUNTIME / "combo.webp", "WEBP", quality=93, method=4, exact=True)
    # Replace the pre-combination strip with the final 12-frame combo preview.
    contact = Image.new("RGB", (CELL_W * 12, CELL_H * 4 + 28), (15, 24, 36))
    draw = ImageDraw.Draw(contact)
    for direction, label in enumerate(DIRECTIONS):
        draw.text((6, direction * CELL_H + 4), label.upper(), fill=(173, 203, 215))
        for frame_index in range(12):
            frame = combined.crop((frame_index * CELL_W, direction * CELL_H,
                                   (frame_index + 1) * CELL_W, (direction + 1) * CELL_H))
            bg = Image.new("RGBA", frame.size, (15, 24, 36, 255))
            bg.alpha_composite(frame)
            contact.paste(bg.convert("RGB"), (frame_index * CELL_W, direction * CELL_H + 28))
    contact.save(EVIDENCE / "combo.png", optimize=True)
    icons["combo"]["runtimeGrid"] = {"columns": 12, "rows": 4, "rowOrder": DIRECTIONS, "columnsByHit": ["hit1 frames 0-3", "hit2 frames 4-7", "hit3 frames 8-11"]}
    icons["combo"]["runtime"] = "public/assets/characters/kairo/b04/combo.webp"
    icons["combo"]["hitTwoSource"] = "art-source/b04/kairo-combo-hit2-grid.png"
    icons["combo"]["hitThreeSource"] = "art-source/b04/kairo-combo-hit3-grid.png"

    vfx = {name:build_vfx(name, filename) for name,filename in VFX_SOURCES.items()}

    # Human-readable art board: this composites the generated sources for review only.
    board = Image.new("RGB", (3*360, 2*280), (13,20,29))
    labels = ["KINETIC BOLT", "COMBO IMPACT", "RESONANCE SHOCKWAVE", "PERFECT PARRY", "SLIPSTREAM DODGE", "THREADBREAK FINISHER"]
    for index,(name,filename) in enumerate(VFX_SOURCES.items()):
        source_image=Image.open(SOURCE/"vfx"/filename).convert("RGBA")
        source_image.thumbnail((330,220),Image.Resampling.LANCZOS)
        cell=Image.new("RGBA",(360,280),(13,20,29,255))
        cell.alpha_composite(source_image,((360-source_image.width)//2,24+(220-source_image.height)//2))
        cell_draw=ImageDraw.Draw(cell);cell_draw.text((15,250),labels[index],fill=(218,226,233,255))
        board.paste(cell.convert("RGB"),((index%3)*360,(index//3)*280))
    board.save(EVIDENCE/"vfx-generated-contact-sheet.png",optimize=True)

    clips={**icons, "dodge":{"source":"B03 authored four-direction dodge master", "runtime":"public/assets/characters/kairo/b03/dodge.png", "columns":4, "rows":4, "directions":DIRECTIONS, "reusedFrom":"B03; no B04 redrawing"}}
    manifest = {
        "status": "B04 implementation proposal; generated character art and generated painted VFX await owner review",
        "date": "2026-11-06",
        "generation": {
            "tool": "OpenAI built-in ImageGen",
            "generatorVersion": "not exposed by the tool",
            "masterPromptRecord": "Earlier B04 source prompts were not retained verbatim; generation is documented as proposed original work, not cleared or approved art.",
            "finisherRightFacingCorrection": {
                "source": "owner-provided annotated four-pose screenshot",
                "output": "art-source/b04/kairo-finisher-right-strip.png",
                "prompt": "Edit the attached four-pose sprite strip. Keep exactly the same four animation poses, order, scale, spacing, costume, silhouette, colors, and transparent background. Correct the head in the circled fourth pose so its face, eyes, nose, and hair turn in the SAME screen direction as the body's shoulders and the facing direction of the first three poses. The fourth head must not look backward or opposite the torso. Preserve the fighter's magenta hair, dark sleeveless top, gold bracers and burgundy sash. Remove the yellow markup circle completely. Clean all four frames so no neighboring body pixels, stray limbs, gaps, or background appear between sprites; leave transparent gutters. Maintain clean painted sprite edges."
            }
        },
        "directions": DIRECTIONS,
        "runtimeCell": {"width": CELL_W, "height": CELL_H, "pivot": [CELL_W / 2, CELL_H - 8]},
        "cleanup": {"alphaFloor": ALPHA_FLOOR,
                    "rule": "Clear alpha values 1-32. Remove and record disconnected components smaller than 12% of the dominant silhouette in each source cell; preserve larger components for visual review."},
        "clips": clips,
        "vfx": vfx,
        "icons": {"strategy":"Generated Kairo animation frames are cropped as HUD art previews; no code-drawn icons.",
                  "assets":{"combo":"public/assets/characters/kairo/b04/combo.webp","bolt":"public/assets/characters/kairo/b04/bolt-cast.webp",
                            "shockwave":"public/assets/characters/kairo/b04/shockwave.webp","parry":"public/assets/characters/kairo/b04/guard-parry.webp",
                            "dodge":"public/assets/characters/kairo/b03/dodge.png","finisher":"public/assets/characters/kairo/b04/finisher.webp",
                            "ember":"public/assets/characters/kairo/b03/states.png"}},
        "rejectedDrafts": [
            {"source": "art-source/b04/rejected/kairo-combo-hit2-grid-straight-punch-rejected.png", "reason": "The generated second-hit frame repeated a straight extension instead of a hook."},
            {"source": "art-source/b04/rejected/kairo-locomotion-run-only-rejected.png", "reason": "The generated sheet did not distinguish run start and brake from running poses."},
            {"source": "art-source/b04/rejected/b04-vfx-atlas-green-fringe-rejected.png", "reason": "Unwanted chromatic edge contamination around luminous effects."},
            {"source": "art-source/b04/rejected/b04-vfx-atlas-transparency-fringe-rejected.png", "reason": "Visible red/yellow fringe and checker-like edge artifacts in alpha."},
            {"source": "art-source/b04/rejected/kairo-finisher-grid-head-direction-and-cell-bleed-rejected.png", "reason": "Recovery head direction was inconsistent and detached neighbor fragments crossed cell boundaries."},
            {"source": "art-source/b04/rejected/kairo-shockwave-grid-edge-crop-rejected.png", "reason": "Generated shockwave source had detached fragments and edge contamination."},
        ],
        "notes": ["B03 four-way dodge remains the base movement clip; B04 adds the generated start/stop clip.",
                  "Per-direction fixed scale and a shared bottom-center pivot avoid frame-to-frame size changes.",
                  "Disconnected source components below 12% of the largest component are removed and recorded; larger components require visual review.",
                  "Kairo frames are currently used as compact HUD art previews; standalone polished ability glyphs and in-game Chrome review remain open."],
    }
    manifest_path = ROOT / "docs" / "art" / "b04-asset-manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(icons)} B04 character atlases and manifest -> {manifest_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
