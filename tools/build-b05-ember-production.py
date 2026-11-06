"""Audit selected generated sources and export bounded B05 Ember production candidates."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art-source/b05-ember-production"
OUT = ROOT / "public/assets/characters/kairo/b05-ember-production"
MANIFEST = ROOT / "docs/art/b05-ember-production-manifest.json"
CELL = (192, 256)
ROWS = {"front": 0, "right": 1, "back": 2, "left": 3,
        "northeast": 4, "northwest": 5, "southeast": 6, "southwest": 7}
DIAGONALS = {"ne": 4, "nw": 5, "se": 6, "sw": 7}
ALPHA_FLOOR = 32
CUTS = {
    "ember/run-sw.png": [0, 570, 1086, 1629, 2172],
    "ember/activation-right.png": [0, 510, 1050, 1645, 2172],
    "ember/finisher-right.png": [0, 543, 1050, 1670, 2172],
    "ember/special-right.png": [0, 510, 1040, 1629, 2172],
}
records: list[dict] = []


def source(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def select_body(path: Path, column: int) -> Image.Image:
    image = source(path)
    key = path.relative_to(SOURCE).as_posix()
    cuts = CUTS.get(key, [round(i * image.width / 4) for i in range(5)])
    frame = image.crop((cuts[column], 0, cuts[column + 1], image.height))
    rgba = np.asarray(frame).copy()
    alpha = rgba[:, :, 3]
    foreground = (alpha > ALPHA_FLOOR).astype(np.uint8)
    count, labels, stats, _ = cv2.connectedComponentsWithStats(foreground, 8)
    if count < 2:
        raise ValueError(f"Empty source cell: {path} column {column}")
    largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    body = labels == largest
    discarded = int(np.count_nonzero(foreground) - stats[largest, cv2.CC_STAT_AREA])
    edge = int(body[0].sum() + body[-1].sum() + body[:, 0].sum() + body[:, -1].sum())
    if edge:
        raise ValueError(f"Body touches source-cell border: {path} column {column}, {edge} pixels")
    # All discarded components are recorded. They are edge specks, not body parts,
    # as checked on the dark contact sheet before selecting these sources.
    rgba[:, :, 3] = np.where(body, alpha, 0)
    result = Image.fromarray(rgba, "RGBA")
    box = result.getbbox()
    if box is None:
        raise ValueError(f"Empty selected body: {path} column {column}")
    cropped = result.crop(box)
    records.append({"source": path.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                    "column": column, "sourceSize": list(image.size), "alphaFloor": ALPHA_FLOOR,
                    "sourceCut": [cuts[column], cuts[column + 1]],
                    "sourceBounds": list(box), "bodyPixels": int(stats[largest, cv2.CC_STAT_AREA]),
                    "discardedDetachedPixels": discarded, "sourceCellEdgePixels": edge})
    return cropped


def place(atlas: Image.Image, frame: Image.Image, column: int, row: int, scale: float, air: int = 0) -> None:
    size = (max(1, round(frame.width * scale)), max(1, round(frame.height * scale)))
    resized = frame.resize(size, Image.Resampling.LANCZOS)
    if size[0] > 176 or size[1] > 230:
        raise ValueError(f"Export exceeds safe 8px margins: {column}, {row}, {size}")
    x = column * CELL[0] + (CELL[0] - size[0]) // 2
    y = row * CELL[1] + 246 - air - size[1]
    atlas.alpha_composite(resized, (x, y))


def scale_for(frames: list[Image.Image]) -> float:
    return min(176 / max(frame.width for frame in frames), 230 / max(frame.height for frame in frames))


def legacy(form: str, clip: str) -> Image.Image:
    if form == "base":
        name = {"idle": "b03/idle.png", "run": "b03/run.png", "combo": "b04/combo.webp"}[clip]
        path = ROOT / "public/assets/characters/kairo" / name
    else:
        path = ROOT / f"public/assets/characters/kairo/forms/ember-drive/{clip}.webp"
    return Image.open(path).convert("RGBA")


def export(form: str) -> dict:
    folder = SOURCE / form
    dest = OUT / form
    dest.mkdir(parents=True, exist_ok=True)
    outputs: dict[str, dict] = {}
    for clip in ("idle", "run"):
        old = legacy(form, clip)
        atlas = Image.new("RGBA", (4 * CELL[0], 8 * CELL[1]))
        atlas.alpha_composite(old.crop((0, 0, 4 * CELL[0], 4 * CELL[1])))
        if clip == "idle":
            path = folder / "diagonal-turnaround.png"
            frames = [select_body(path, i) for i in range(4)]
            scale = scale_for(frames)
            for i, row in enumerate(DIAGONALS.values()):
                for column in range(4):
                    if row in (5, 7):
                        # Keep asymmetric costume details facing correctly. The generated
                        # NW/SW turnarounds were not camera-correct, so retain the authored
                        # left idle fallback for these two directions.
                        left = old.crop((0, 3 * CELL[1], 4 * CELL[0], 4 * CELL[1]))
                        atlas.paste(left.crop((column * CELL[0], 0, (column + 1) * CELL[0], CELL[1])),
                                    (column * CELL[0], row * CELL[1]))
                    else:
                        place(atlas, frames[i], column, row, scale)
            unique = 2
        else:
            authored_directions = [d for d in DIAGONALS if not (form == "ember" and d in ("nw", "sw"))]
            frame_sets = {d: [select_body(folder / f"run-{d}.png", i) for i in range(4)] for d in authored_directions}
            scale = scale_for([frame for frames in frame_sets.values() for frame in frames])
            for d, row in DIAGONALS.items():
                if form == "ember" and d in ("nw", "sw"):
                    # A mirror reverses the signature asymmetric Ember armor. Use the
                    # matching authored left-facing cycle until corrected diagonal art exists.
                    left = old.crop((0, 3 * CELL[1], 4 * CELL[0], 4 * CELL[1]))
                    atlas.paste(left, (0, row * CELL[1]))
                else:
                    for column, frame in enumerate(frame_sets[d]):
                        place(atlas, frame, column, row, scale, 9 if column == 1 else 0)
            unique = 16 if form == "base" else 8
        path = dest / f"{clip}.webp"
        atlas.save(path, "WEBP", quality=92, method=6)
        outputs[clip] = {"path": path.relative_to(ROOT).as_posix(), "size": list(atlas.size),
                         "directions": list(ROWS), "newDiagonalDrawings": unique,
                         "derivedIdleRepeats": 6 if clip == "idle" else 0,
                         "legacyDiagonalFallbackRows": ["northwest", "southwest"]
                         if clip == "idle" or form == "ember" and clip == "run" else []}

    # Re-author right-facing combo cells while retaining tested cardinal fallbacks.
    atlas = legacy(form, "combo")
    frames = [[select_body(folder / f"combo-hit{hit}-right.png", i) for i in range(4)] for hit in (1, 2, 3)]
    scale = scale_for([frame for group in frames for frame in group])
    for hit, group in enumerate(frames):
        for phase, frame in enumerate(group):
            cell = Image.new("RGBA", CELL)
            place(cell, frame, 0, 0, scale)
            atlas.paste(cell, ((hit * 4 + phase) * CELL[0], CELL[1]))
    path = dest / "combo.webp"
    atlas.save(path, "WEBP", quality=92, method=6)
    outputs["combo"] = {"path": path.relative_to(ROOT).as_posix(), "size": list(atlas.size),
                        "newAuthoredRightFrames": 12, "legacyRows": ["front", "back", "left"]}

    if form == "ember":
        for clip in ("special", "finisher"):
            old_combo = legacy(form, "combo")
            atlas = Image.new("RGBA", (4 * CELL[0], 4 * CELL[1]))
            for row in range(4):
                atlas.paste(old_combo.crop((8 * CELL[0], row * CELL[1], 12 * CELL[0], (row + 1) * CELL[1])),
                            (0, row * CELL[1]))
            frames = [select_body(folder / f"{clip}-right.png", i) for i in range(4)]
            scale = scale_for(frames)
            for phase, frame in enumerate(frames):
                cell = Image.new("RGBA", CELL)
                place(cell, frame, 0, 0, scale)
                atlas.paste(cell, (phase * CELL[0], CELL[1]))
            path = dest / f"{clip}.webp"
            atlas.save(path, "WEBP", quality=92, method=6)
            outputs[clip] = {"path": path.relative_to(ROOT).as_posix(), "size": list(atlas.size),
                             "newAuthoredRightFrames": 4, "legacyFallbackRows": ["front", "back", "left"]}
        frames = [select_body(folder / "activation-right.png", i) for i in range(4)]
        scale = scale_for(frames)
        atlas = Image.new("RGBA", (4 * CELL[0], CELL[1]))
        for phase, frame in enumerate(frames):
            place(atlas, frame, phase, 0, scale)
        path = dest / "activation.webp"
        atlas.save(path, "WEBP", quality=92, method=6)
        outputs["activation"] = {"path": path.relative_to(ROOT).as_posix(), "size": list(atlas.size),
                                  "newAuthoredRightFrames": 4}
    return outputs


def main() -> None:
    cv2.setNumThreads(1)
    outputs = {form: export(form) for form in ("base", "ember")}
    for form in ("base", "ember"):
        run = Image.open(ROOT / outputs[form]["run"]["path"]).convert("RGBA")
        fallback_rows = set(outputs[form]["run"]["legacyDiagonalFallbackRows"])
        for background, color in (("dark", "#132236"), ("light", "#dce3e6")):
            sheet = Image.new("RGB", (8 * 120, 190), color)
            draw = ImageDraw.Draw(sheet)
            for direction, row in ROWS.items():
                cell = run.crop((192, row * 256, 384, (row + 1) * 256))
                sprite = cell.resize((100, 140), Image.Resampling.LANCZOS)
                sheet.paste(sprite, (row * 120 + 10, 25), sprite)
                label = f"{direction} (left fallback)" if direction in fallback_rows else direction
                draw.text((row * 120 + 4, 170), label, fill="#ffffff" if background == "dark" else "#152333")
            sheet.save(ROOT / f"docs/art/b05-{form}-eight-way-{background}.png")
    data = {"batch": "B05 art-first corrective production candidate", "date": "2026-11-06",
            "generator": "OpenAI built-in ImageGen; exact prompt briefs in docs/art/b05-ember-production-notes.md; version/seed not exposed",
            "cell": list(CELL), "alphaPolicy": "largest connected body above alpha 32, all detached pixels logged; source cell edge contact rejects export",
            "directionRows": ROWS, "outputs": outputs, "sourceFrames": records,
            "limitations": ["Only right-facing new combo, special, finisher and activation body art; other attack directions retain legacy candidate rows.",
                            "Northwest/southwest idle use the left-facing legacy cycle to avoid reversing asymmetric details; Ember northwest/southwest run use its left-facing legacy cycle. Base northwest/southwest run are now identity-locked from the canonical turnaround.",
                            "Diagonal idle has one unique NE and SE pose per form repeated in four runtime columns; NW/SW use the left-facing legacy cycle.",
                            "No new dodge, guard, hurt, KO or full eight-direction attack art."]}
    MANIFEST.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"B05 Ember production candidates exported: {len(records)} selected source cells, {len(outputs['base']) + len(outputs['ember'])} atlases")


if __name__ == "__main__":
    main()
