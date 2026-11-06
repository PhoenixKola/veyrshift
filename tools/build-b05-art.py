#!/usr/bin/env python3
"""Audit B05 sources and build reviewable 4-direction combo atlases.

Small disconnected components are reported, never deleted automatically: cuffs,
coat tails, hair tips and glass cuts can all be small but intentional.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art-source" / "b05"
RUNTIME = ROOT / "public" / "assets" / "characters" / "kairo" / "forms"
EVIDENCE = ROOT / "tests" / "evidence" / "b05"
DIRECTIONS = ["front", "right", "back", "left"]
HITS = ["hit1", "hit2", "hit3"]
CELL_W, CELL_H = 192, 256
ALPHA_FLOOR = 32
cv2.setNumThreads(1)

SHEETS = {
    "ember-drive": [
        "ember-combo-hit1-grid-v1.png",
        "ember-combo-hit2-grid-v1.png",
        "ember-combo-hit3-grid-v1.png",
    ],
    "glass-current": [
        "glass-combo-hit1-grid-v1.png",
        "glass-combo-hit2-grid-v3.png",
        "glass-combo-hit3-grid-v3.png",
    ],
}

RUN_SHEETS = {
    "ember-drive": "ember-run-grid-v1.png",
    "glass-current": "glass-run-grid-v1.png",
}

ICON_SHEETS = {
    "ember-drive": ("ember-ability-icons-v1.png", ["identity", "activation", "bolt", "special", "finisher", "combo"]),
    "glass-current": ("glass-ability-icons-v1.png", ["identity", "activation", "bolt", "special", "finisher", "combo"]),
}

VFX_SHEETS = {
    "ember-drive": ("ember-vfx-sheet-v1.png", ["activation", "contact", "bolt", "special", "finisher", "transition"]),
    "glass-current": ("glass-vfx-sheet-v1.png", ["activation", "contact", "bolt", "special", "finisher", "transition"]),
}

TURNAROUNDS = {
    "ember-drive": "ember-drive-turnaround-v2.png",
    "glass-current": "glass-current-turnaround-v3.png",
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def split_cell(image: Image.Image, column: int, row: int, columns: int = 4, rows: int = 4) -> tuple[Image.Image, dict]:
    left = round(column * image.width / columns)
    right = round((column + 1) * image.width / columns)
    top = round(row * image.height / rows)
    bottom = round((row + 1) * image.height / rows)
    raw = image.crop((left, top, right, bottom)).convert("RGBA")
    alpha = np.asarray(raw.getchannel("A")).copy()
    cleared = int(np.count_nonzero((alpha > 0) & (alpha <= ALPHA_FLOOR)))
    alpha[(alpha > 0) & (alpha <= ALPHA_FLOOR)] = 0
    raw.putalpha(Image.fromarray(alpha, mode="L"))
    source_binary = (alpha > ALPHA_FLOOR).astype(np.uint8)
    source_border = int(source_binary[0, :].sum() + source_binary[-1, :].sum() +
                        source_binary[:, 0].sum() + source_binary[:, -1].sum())
    bounds = raw.getchannel("A").getbbox()
    if not bounds:
        raise ValueError(f"empty source cell row={row} column={column}")
    l, t, r, b = bounds
    margin = 6
    box = (max(0, l - margin), max(0, t - margin), min(raw.width, r + margin), min(raw.height, b + margin))
    cropped = raw.crop(box)
    alpha_crop = np.asarray(cropped.getchannel("A"))
    binary = (alpha_crop > ALPHA_FLOOR).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    components = sorted((int(stats[i, cv2.CC_STAT_AREA]) for i in range(1, count)), reverse=True)
    return cropped, {
        "sourceCell": {"x": left, "y": top, "width": right - left, "height": bottom - top},
        "sourceAlphaBounds": [l, t, r, b],
        "trimBox": list(box),
        "clearedLowAlphaPixels": cleared,
        "foregroundComponentAreas": components,
        "componentsDeleted": 0,
        "cellBorderPixelsAboveAlphaFloor": source_border,
    }


def fit_cell(source: Image.Image, scale: float) -> Image.Image:
    width = max(1, round(source.width * scale))
    height = max(1, round(source.height * scale))
    resized = source.resize((width, height), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
    frame.alpha_composite(resized, ((CELL_W - width) // 2, CELL_H - 8 - height))
    return frame


def composite_contact(atlas: Image.Image, form_id: str) -> None:
    phase_labels = ["HIT 1 · WINDUP", "HIT 1 · CONTACT", "HIT 1 · RECOVERY", "HIT 1 · SETTLE",
                    "HIT 2 · WINDUP", "HIT 2 · CONTACT", "HIT 2 · RECOVERY", "HIT 2 · SETTLE",
                    "HIT 3 · WINDUP", "HIT 3 · CONTACT", "HIT 3 · RECOVERY", "HIT 3 · SETTLE"]
    sheet = Image.new("RGB", (CELL_W * 12, CELL_H * 4 + 32), (19, 27, 38))
    draw = ImageDraw.Draw(sheet)
    for col, label in enumerate(phase_labels):
        draw.text((col * CELL_W + 5, 5), label, fill=(211, 223, 229))
    for row, direction in enumerate(DIRECTIONS):
        for col in range(12):
            frame = atlas.crop((col * CELL_W, row * CELL_H, (col + 1) * CELL_W, (row + 1) * CELL_H))
            bg = Image.new("RGBA", frame.size, (19, 27, 38, 255))
            bg.alpha_composite(frame)
            sheet.paste(bg.convert("RGB"), (col * CELL_W, row * CELL_H + 32))
        draw.text((4, row * CELL_H + 32), direction.upper(), fill=(145, 186, 198))
    sheet.save(EVIDENCE / f"{form_id}-combo-contact.jpg", quality=94, subsampling=0, optimize=True)


def animation_preview(atlas: Image.Image, form_id: str) -> None:
    frames = []
    for col in range(12):
        for row in range(4):
            frame = atlas.crop((col * CELL_W, row * CELL_H, (col + 1) * CELL_W, (row + 1) * CELL_H))
            background = Image.new("RGBA", frame.size, (19, 27, 38, 255))
            background.alpha_composite(frame)
            frames.append(background.convert("RGB"))
    frames[0].save(EVIDENCE / f"{form_id}-combo-at-speed.gif", save_all=True, append_images=frames[1:],
                   duration=85, loop=0, disposal=2, optimize=False)


def build_run(form_id: str, filename: str) -> dict:
    path = SOURCE / "review" / filename
    image = Image.open(path).convert("RGBA")
    source_cells = {}
    direction_sizes = [[1, 1] for _ in DIRECTIONS]
    direction_heights = [[] for _ in DIRECTIONS]
    frames = []
    for row, direction in enumerate(DIRECTIONS):
        for phase in range(4):
            cell, metadata = split_cell(image, phase, row)
            if metadata["cellBorderPixelsAboveAlphaFloor"]:
                raise ValueError(f"{form_id} run {direction} frame {phase} touches source-cell border")
            source_cells[(row, phase)] = (cell, metadata)
            direction_sizes[row][0] = max(direction_sizes[row][0], cell.width)
            direction_sizes[row][1] = max(direction_sizes[row][1], cell.height)
            bounds = metadata["sourceAlphaBounds"]
            direction_heights[row].append(bounds[3] - bounds[1])

    scales = []
    for row in range(4):
        median_height = float(np.median(direction_heights[row]))
        width, height = direction_sizes[row]
        scales.append(min(224 / max(1, median_height), 172 / width, 232 / height))
    atlas = Image.new("RGBA", (CELL_W * 4, CELL_H * 4), (0, 0, 0, 0))
    for row, direction in enumerate(DIRECTIONS):
        for phase in range(4):
            cell, metadata = source_cells[(row, phase)]
            atlas.alpha_composite(fit_cell(cell, scales[row]), (phase * CELL_W, row * CELL_H))
            frames.append({"direction": direction, "directionRow": row, "frame": phase,
                           "runtimePivot": [CELL_W / 2, CELL_H - 8], "uniformDirectionScale": round(scales[row], 6),
                           "durationMs": 70, "componentsDeleted": 0, **metadata})

    out_dir = RUNTIME / form_id
    out_dir.mkdir(parents=True, exist_ok=True)
    output = out_dir / "run.webp"
    atlas.save(output, "WEBP", lossless=True, method=4, exact=True)
    sheet = Image.new("RGB", (CELL_W * 4, CELL_H * 4 + 32), (19, 27, 38))
    draw = ImageDraw.Draw(sheet)
    for phase, label in enumerate(["PUSH-OFF", "STRIDE", "PASS", "LAND"]):
        draw.text((phase * CELL_W + 5, 5), label, fill=(211, 223, 229))
    for row, direction in enumerate(DIRECTIONS):
        draw.text((4, row * CELL_H + 32), direction.upper(), fill=(145, 186, 198))
        for phase in range(4):
            frame = atlas.crop((phase * CELL_W, row * CELL_H, (phase + 1) * CELL_W, (row + 1) * CELL_H))
            background = Image.new("RGBA", frame.size, (19, 27, 38, 255))
            background.alpha_composite(frame)
            sheet.paste(background.convert("RGB"), (phase * CELL_W, row * CELL_H + 32))
    sheet.save(EVIDENCE / f"{form_id}-run-contact.jpg", quality=94, subsampling=0, optimize=True)
    preview_frames = []
    for phase in range(4):
        frame = atlas.crop((phase * CELL_W, 0, (phase + 1) * CELL_W, CELL_H * 4))
        background = Image.new("RGBA", frame.size, (19, 27, 38, 255))
        background.alpha_composite(frame)
        preview_frames.append(background.convert("RGB"))
    preview_frames[0].save(EVIDENCE / f"{form_id}-run-at-speed.gif", save_all=True,
                           append_images=preview_frames[1:], duration=70, loop=0, disposal=2)
    return {"sourceGrid": {"source": path.relative_to(ROOT).as_posix(), "size": [image.width, image.height],
                           "sha256": sha256(path), "columns": 4, "rows": 4, "columnOrder": ["push-off", "stride", "pass", "land"],
                           "rowOrder": DIRECTIONS},
            "runtime": output.relative_to(ROOT).as_posix(), "runtimeBytes": output.stat().st_size,
            "runtimeGrid": {"columns": 4, "rows": 4, "frameWidth": CELL_W, "frameHeight": CELL_H, "directionOrder": DIRECTIONS},
            "uniformDirectionScales": {direction: round(scales[index], 6) for index, direction in enumerate(DIRECTIONS)},
            "runtimePivot": [CELL_W / 2, CELL_H - 8], "frames": frames,
            "contactSheet": f"tests/evidence/b05/{form_id}-run-contact.jpg",
            "atSpeedPreview": f"tests/evidence/b05/{form_id}-run-at-speed.gif"}


def build_icons(form_id: str, filename: str, names: list[str]) -> dict:
    path = SOURCE / "review" / filename
    image = Image.open(path).convert("RGBA")
    if image.width < 3 or image.height < 2:
        raise ValueError(f"invalid icon sheet dimensions: {path}")
    output_dir = ROOT / "public" / "assets" / "ui" / "b05" / form_id
    output_dir.mkdir(parents=True, exist_ok=True)
    contact = Image.new("RGB", (3 * 176, 2 * 204), (19, 27, 38))
    draw = ImageDraw.Draw(contact)
    entries = []
    for index, name in enumerate(names):
        col, row = index % 3, index // 3
        cropped, audit = split_cell(image, col, row, 3, 2)
        if audit["cellBorderPixelsAboveAlphaFloor"]:
            raise ValueError(f"{form_id} icon {name} touches source-cell border")
        bounds = cropped.getchannel("A").getbbox()
        if not bounds:
            raise ValueError(f"empty icon {form_id}/{name}")
        trimmed = cropped.crop(bounds)
        trimmed.thumbnail((106, 106), Image.Resampling.LANCZOS)
        icon = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        icon.alpha_composite(trimmed, ((128 - trimmed.width) // 2, (128 - trimmed.height) // 2))
        output = output_dir / f"{name}.webp"
        icon.save(output, "WEBP", lossless=True, method=4, exact=True)
        background = Image.new("RGBA", icon.size, (19, 27, 38, 255))
        background.alpha_composite(icon)
        contact.paste(background.convert("RGB"), (col * 176 + 24, row * 204 + 8))
        draw.text((col * 176 + 8, row * 204 + 148), name.upper(), fill=(211, 223, 229))
        entries.append({"name": name, "sourceCell": [col, row], "source": path.relative_to(ROOT).as_posix(),
                        "runtime": output.relative_to(ROOT).as_posix(), "runtimeSize": [128, 128],
                        "runtimeBytes": output.stat().st_size, "componentsDeleted": 0, **audit})
    contact_path = EVIDENCE / f"{form_id}-ability-icons-contact.jpg"
    contact.save(contact_path, quality=94, subsampling=0, optimize=True)
    return {"source": path.relative_to(ROOT).as_posix(), "size": [image.width, image.height], "sha256": sha256(path),
            "sourceGrid": {"columns": 3, "rows": 2, "cellSize": [round(image.width / 3, 2), round(image.height / 2, 2)]},
            "runtimeCell": [128, 128], "icons": entries, "contactSheet": contact_path.relative_to(ROOT).as_posix()}


def build_vfx(form_id: str, filename: str, names: list[str]) -> dict:
    path = SOURCE / "review" / filename
    image = Image.open(path).convert("RGBA")
    output_dir = ROOT / "public" / "assets" / "vfx" / "b05" / form_id
    output_dir.mkdir(parents=True, exist_ok=True)
    contact = Image.new("RGB", (3 * 256, 2 * 278), (19, 27, 38))
    draw = ImageDraw.Draw(contact)
    entries = []
    for index, name in enumerate(names):
        col, row = index % 3, index // 3
        cropped, audit = split_cell(image, col, row, 3, 2)
        if audit["cellBorderPixelsAboveAlphaFloor"]:
            raise ValueError(f"{form_id} VFX {name} touches source-cell border")
        bounds = cropped.getchannel("A").getbbox()
        if not bounds:
            raise ValueError(f"empty VFX {form_id}/{name}")
        trimmed = cropped.crop(bounds)
        trimmed.thumbnail((224, 224), Image.Resampling.LANCZOS)
        texture = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        texture.alpha_composite(trimmed, ((256 - trimmed.width) // 2, (256 - trimmed.height) // 2))
        output = output_dir / f"{name}.webp"
        texture.save(output, "WEBP", lossless=True, method=4, exact=True)
        background = Image.new("RGBA", texture.size, (19, 27, 38, 255))
        background.alpha_composite(texture)
        contact.paste(background.convert("RGB"), (col * 256, row * 278))
        draw.text((col * 256 + 8, row * 278 + 258), name.upper(), fill=(211, 223, 229))
        entries.append({"name": name, "sourceCell": [col, row], "source": path.relative_to(ROOT).as_posix(),
                        "runtime": output.relative_to(ROOT).as_posix(), "runtimeSize": [256, 256],
                        "runtimeBytes": output.stat().st_size, "componentsDeleted": 0, **audit})
    contact_path = EVIDENCE / f"{form_id}-vfx-contact.jpg"
    contact.save(contact_path, quality=94, subsampling=0, optimize=True)
    return {"source": path.relative_to(ROOT).as_posix(), "size": [image.width, image.height], "sha256": sha256(path),
            "sourceGrid": {"columns": 3, "rows": 2, "cellSize": [round(image.width / 3, 2), round(image.height / 2, 2)]},
            "runtimeCell": [256, 256], "textures": entries, "contactSheet": contact_path.relative_to(ROOT).as_posix()}


def build_form(form_id: str, sheet_names: list[str]) -> dict:
    source_cells: dict[tuple[int, int], tuple[Image.Image, dict]] = {}
    group_max = {(direction, hit): [1, 1] for direction in range(4) for hit in range(3)}
    group_heights = {(direction, hit): [] for direction in range(4) for hit in range(3)}
    source_audit = []
    for hit_index, sheet_name in enumerate(sheet_names):
        path = SOURCE / "review" / sheet_name
        if not path.exists():
            raise FileNotFoundError(path)
        image = Image.open(path).convert("RGBA")
        hash_value = sha256(path)
        sheet_record = {"source": path.relative_to(ROOT).as_posix(), "size": [image.width, image.height],
                        "sha256": hash_value, "grid": {"columns": 4, "rows": 4,
                        "columnOrder": ["phase 1", "phase 2", "phase 3", "phase 4"],
                        "rowOrder": DIRECTIONS}}
        for direction_index, direction in enumerate(DIRECTIONS):
            for phase in range(4):
                cell, audit = split_cell(image, phase, direction_index)
                key = (direction_index, hit_index * 4 + phase)
                source_cells[key] = (cell, {"sourceImage": path.relative_to(ROOT).as_posix(),
                                             "sourceHit": HITS[hit_index], "sourcePhase": phase,
                                             **audit})
                group = group_max[(direction_index, hit_index)]
                group[0] = max(group[0], cell.width)
                group[1] = max(group[1], cell.height)
                bounds = audit["sourceAlphaBounds"]
                group_heights[(direction_index, hit_index)].append(bounds[3] - bounds[1])
        source_audit.append(sheet_record)

    # Reject cell-boundary bleed before emitting runtime files.
    bad_edges = [(key, meta["cellBorderPixelsAboveAlphaFloor"])
                 for key, (_, meta) in source_cells.items() if meta["cellBorderPixelsAboveAlphaFloor"]]
    if bad_edges:
        raise ValueError(f"{form_id}: alpha content touches source-cell border: {bad_edges[:8]}")

    group_scales: dict[tuple[int, int], float] = {}
    direction_target_heights = {}
    for direction_index, direction in enumerate(DIRECTIONS):
        hit_medians = [float(np.median(group_heights[(direction_index, hit)])) for hit in range(3)]
        target_height = float(np.median(hit_medians))
        direction_target_heights[direction] = round(target_height, 2)
        for hit in range(3):
            width, height = group_max[(direction_index, hit)]
            content_scale = target_height / max(1.0, hit_medians[hit])
            group_scales[(direction_index, hit)] = min(content_scale, 172 / width, 232 / height)
    atlas = Image.new("RGBA", (CELL_W * 12, CELL_H * 4), (0, 0, 0, 0))
    frames = []
    for row, direction in enumerate(DIRECTIONS):
        for column in range(12):
            cropped, metadata = source_cells[(row, column)]
            hit_index = column // 4
            scale = group_scales[(row, hit_index)]
            atlas.alpha_composite(fit_cell(cropped, scale), (column * CELL_W, row * CELL_H))
            frames.append({"direction": direction, "directionRow": row, "frame": column,
                           "runtimePivot": [CELL_W / 2, CELL_H - 8], "uniformHitDirectionScale": round(scale, 6),
                           "durationMs": 85, **metadata})

    out_dir = RUNTIME / form_id
    out_dir.mkdir(parents=True, exist_ok=True)
    output = out_dir / "combo.webp"
    atlas.save(output, "WEBP", lossless=True, method=4, exact=True)
    composite_contact(atlas, form_id)
    animation_preview(atlas, form_id)
    run = build_run(form_id, RUN_SHEETS[form_id])
    icon_filename, icon_names = ICON_SHEETS[form_id]
    icons = build_icons(form_id, icon_filename, icon_names)
    vfx_filename, vfx_names = VFX_SHEETS[form_id]
    vfx = build_vfx(form_id, vfx_filename, vfx_names)
    return {
        "status": "PRODUCTION_CANDIDATE_OWNER_APPROVAL_PENDING",
        "masterReference": f"art-source/b05/review/{TURNAROUNDS[form_id]}",
        "sourceGrids": source_audit,
        "runtime": output.relative_to(ROOT).as_posix(),
        "runtimeBytes": output.stat().st_size,
        "run": run,
        "icons": icons,
        "vfx": vfx,
        "runtimeGrid": {"columns": 12, "rows": 4, "frameWidth": CELL_W, "frameHeight": CELL_H,
                         "directionOrder": DIRECTIONS, "hitColumns": {"hit1": [0, 3], "hit2": [4, 7], "hit3": [8, 11]}},
        "directionTargetSourceHeights": direction_target_heights,
        "uniformHitDirectionScales": {f"{DIRECTIONS[direction]}-{HITS[hit]}": round(scale, 6)
                                       for (direction, hit), scale in group_scales.items()},
        "runtimePivot": [CELL_W / 2, CELL_H - 8],
        "cleanup": {"alphaFloor": ALPHA_FLOOR, "clearedLowAlphaPixelsPerSourceCell": True,
                    "disconnectedComponentsAutomaticallyDeleted": False,
                    "rule": "All components above alpha floor are retained; source-cell edge contact blocks export."},
        "contactSheet": f"tests/evidence/b05/{form_id}-combo-contact.jpg",
        "atSpeedPreview": f"tests/evidence/b05/{form_id}-combo-at-speed.gif",
        "frames": frames,
        "coverage": {"combo1": True, "combo2": True, "combo3": True, "idle": False, "run": True,
                      "dodge": False, "guardParry": False, "hurtKo": False, "bolt": False,
                      "special": False, "finisher": False, "activation": False, "deactivation": False,
                      "dedicatedIcons": True, "authoredVfx": True},
    }


def audit_turnaround(form_id: str, filename: str) -> dict:
    path = SOURCE / "review" / filename
    image = Image.open(path).convert("RGBA")
    return {"source": path.relative_to(ROOT).as_posix(), "size": [image.width, image.height],
            "alphaExtrema": list(image.getchannel("A").getextrema()), "sha256": sha256(path),
            "review": "Inspected on dark composite for pose count, spacing, costume/silhouette consistency and visible fragments; owner approval remains pending."}


def audit_rejected() -> list[dict]:
    rejected = []
    for path in sorted((SOURCE / "rejected").glob("*.png")):
        rejected.append({"source": path.relative_to(ROOT).as_posix(), "sha256": sha256(path),
                         "reason": "Rejected generation retained for audit; see b05-generation-notes.md."})
    return rejected


def main() -> None:
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    forms = {form_id: build_form(form_id, names) for form_id, names in SHEETS.items()}
    manifest = {
        "batch": "B05 continuation",
        "generatedDate": "2026-11-06",
        "pipeline": "python tools/build-b05-art.py",
        "status": "PARTIAL_ART_IMPLEMENTED_VISUAL_ACCEPTANCE_BLOCKED",
        "generator": {"tool": "OpenAI built-in ImageGen", "modelVersion": "not exposed",
                      "seed": "not exposed", "transcript": "See docs/art/b05-generation-notes.md; prior-turn exact prompts were not retained in this checkout."},
        "runtimeAssetsExported": True,
        "runtimeCell": {"width": CELL_W, "height": CELL_H},
        "directions": DIRECTIONS,
        "alphaPolicy": {"floor": ALPHA_FLOOR, "noAutomaticSmallComponentDeletion": True,
                        "rejectCellEdgeContact": True},
        "turnarounds": {form_id: audit_turnaround(form_id, file) for form_id, file in TURNAROUNDS.items()},
        "forms": forms,
        "rejectedDrafts": audit_rejected(),
        "missingCoverage": ["idle", "dodge", "guard/parry character animation", "hurt/KO character animation",
                            "fluid activation/deactivation character animation", "active loop character animation",
                            "fluid authored animation beyond 4 key poses", "dedicated form audio and active loops",
                            "Glass piercing projectile/finisher character animation"],
        "limitations": ["These 12-frame action atlases are production candidates, not owner-approved art.",
                        "Generated 4-frame hit and run clips are illustrative key poses; fluidity and timing are not approved.",
                        "B04 live Chrome gate and B05 live Vite gameplay/audio/performance checks remain blocked by unavailable CUA host.",
                        "The animation GIFs are offline previews, not gameplay or human visual/game-feel signoff."],
    }
    manifest_path = ROOT / "docs" / "art" / "b05-animation-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Built {len(forms)} B05 reviewable combo atlases and manifest -> {manifest_path.relative_to(ROOT)}")
    for form_id, entry in forms.items():
        print(f"  {form_id}: {entry['runtimeBytes']} bytes; 12 frames x 4 directions; remaining states not exported")


if __name__ == "__main__":
    main()
