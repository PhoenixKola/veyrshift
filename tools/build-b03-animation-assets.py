"""Build inspectable four-direction runtime atlases from the reviewed B03 source grids.

Requires Pillow. Source masters are preserved and are never modified. Unlike B02,
this pipeline does not discard disconnected alpha components; it reports them.
"""
from __future__ import annotations

import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art-source" / "b03"
OUTPUT = ROOT / "public" / "assets" / "characters" / "kairo" / "b03"
EVIDENCE = ROOT / "tests" / "evidence" / "b03"
MANIFEST = ROOT / "docs" / "art" / "b03-animation-manifest.json"
OVERRIDES_PATH = ROOT / "tools" / "b03-frame-overrides.json"
CELL_W, CELL_H = 192, 256
TARGET_FIGURE_HEIGHT = 220
MAX_FIGURE_WIDTH = 180
DIRECTIONS = ["front", "right", "back", "left"]
DIR_LABELS = {"front": "FRONT / TOWARD", "right": "RIGHT PROFILE", "back": "BACK / AWAY", "left": "LEFT PROFILE"}
ALPHA_FLOOR = 32

SHEETS = {
    "idle": ("kairo-idle-4dir-source.png", 4, 4),
    "run": ("kairo-run-4dir-source-v2.png", 4, 4),
    "dodge": ("kairo-dodge-4dir-source-v2.png", 4, 4),
    "states": ("kairo-state-4dir-source-v2-edited.png", 4, 4),
}
COMBOS = [
    "kairo-combo-1-source-v2.png",
    "kairo-combo-2-source-v2.png",
    "kairo-combo-3-source-v2.png",
]
STATE_COLUMNS = {"guard": 0, "parry": 1, "hurt": 2, "ko": 3, "emberAnticipation": 0, "emberBurst": 1}

def load_overrides() -> dict:
    if OVERRIDES_PATH.exists():
        return json.loads(OVERRIDES_PATH.read_text(encoding="utf-8"))
    return {"defaultPivot": {"x": 0.5, "y": 0.985}, "frames": {}}

def source_cell(sheet: Image.Image, columns: int, rows: int, row: int, col: int) -> Image.Image:
    left, right = round(col * sheet.width / columns), round((col + 1) * sheet.width / columns)
    top, bottom = round(row * sheet.height / rows), round((row + 1) * sheet.height / rows)
    cell = sheet.crop((left, top, right, bottom)).convert("RGBA")
    alpha = cell.getchannel("A")
    low = alpha.point(lambda value: 255 if 0 < value <= ALPHA_FLOOR else 0)
    cleared = sum(low.histogram()[1:])
    alpha = alpha.point(lambda value: 0 if 0 < value <= ALPHA_FLOOR else value)
    cell.putalpha(alpha)
    return cell, cleared

def connected_components(alpha: Image.Image, threshold: int = 16) -> list[int]:
    """Return foreground component areas for review; never delete a component."""
    mask = alpha.point(lambda a: 255 if a > threshold else 0)
    px = mask.load()
    width, height = mask.size
    areas: list[int] = []
    for y in range(height):
        for x in range(width):
            if px[x, y] != 255:
                continue
            px[x, y] = 0
            stack = [(x, y)]
            area = 0
            while stack:
                cx, cy = stack.pop()
                area += 1
                for nx, ny in ((cx-1,cy),(cx+1,cy),(cx,cy-1),(cx,cy+1)):
                    if 0 <= nx < width and 0 <= ny < height and px[nx, ny] == 255:
                        px[nx, ny] = 0
                        stack.append((nx, ny))
            areas.append(area)
    return sorted(areas, reverse=True)

def clip_scale(cells: list[Image.Image]) -> float:
    bounds = [cell.getchannel("A").getbbox() for cell in cells]
    bounds = [b for b in bounds if b]
    if not bounds:
        raise ValueError("Animation clip has no visible pixels")
    heights = sorted(b[3] - b[1] for b in bounds)
    median_height = heights[len(heights) // 2]
    widest = max(b[2] - b[0] for b in bounds)
    return min(TARGET_FIGURE_HEIGHT / median_height, MAX_FIGURE_WIDTH / widest)

def make_frame(cell: Image.Image, source_key: str, row: int, col: int, overrides: dict, scale: float) -> tuple[Image.Image, dict]:
    pivot = overrides.get("frames", {}).get(source_key, overrides.get("defaultPivot", {"x": .5, "y": .985}))
    bounds = cell.getchannel("A").getbbox()
    if not bounds:
        raise ValueError(f"Transparent/empty source frame: {source_key}")
    # Use one character scale per clip; crop alpha only after the shared scale is chosen.
    figure = cell.crop(bounds)
    resized = figure.resize((max(1, round(figure.width * scale)), max(1, round(figure.height * scale))), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (CELL_W, CELL_H), (0, 0, 0, 0))
    source_pivot_x = round(cell.width * float(pivot.get("x", .5)))
    source_pivot_y = round(cell.height * float(pivot.get("y", .985)))
    dest_pivot_x = CELL_W * .5 + float(pivot.get("rootX", 0))
    dest_pivot_y = CELL_H - 8 + float(pivot.get("rootY", 0))
    left = round(dest_pivot_x - (source_pivot_x - bounds[0]) * scale)
    top = round(dest_pivot_y - (source_pivot_y - bounds[1]) * scale)
    out.alpha_composite(resized, (left, top))
    info = {
        "sourceGridCell": {"row": row, "column": col, "width": cell.width, "height": cell.height},
        "sourceAlphaBounds": list(bounds),
        "sourcePivot": [source_pivot_x, source_pivot_y],
        "runtimePivot": [round(dest_pivot_x, 2), round(dest_pivot_y, 2)],
        "rootOffset": [float(pivot.get("rootX", 0)), float(pivot.get("rootY", 0))],
        "scale": round(scale, 6),
        "components": connected_components(cell.getchannel("A")),
    }
    return out, info

def build_regular(name: str, source_name: str, cols: int, rows: int, overrides: dict) -> tuple[dict, list[list[Image.Image]]]:
    sheet = Image.open(SOURCE / source_name).convert("RGBA")
    cells: dict[tuple[int, int], Image.Image] = {}
    cleared_by_cell: dict[tuple[int, int], int] = {}
    for row in range(rows):
        for col in range(cols):
            cells[(row, col)], cleared_by_cell[(row, col)] = source_cell(sheet, cols, rows, row, col)
    scale = clip_scale(list(cells.values()))
    directions: list[list[Image.Image]] = [[] for _ in range(rows)]
    records = []
    cleared_pixels = 0
    for row in range(rows):
        for col in range(cols):
            cell, cleared = cells[(row, col)], cleared_by_cell[(row, col)]
            cleared_pixels += cleared
            key = f"{name}.{DIRECTIONS[row]}.{col}"
            frame, detail = make_frame(cell, key, row, col, overrides, scale)
            directions[row].append(frame)
            records.append({"direction": DIRECTIONS[row], "frame": col, **detail})
    atlas = Image.new("RGBA", (cols * CELL_W, rows * CELL_H), (0, 0, 0, 0))
    for row in range(rows):
        for col in range(cols):
            atlas.alpha_composite(directions[row][col], (col * CELL_W, row * CELL_H))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    target = OUTPUT / f"{name}.png"
    atlas.save(target, optimize=True)
    return ({
        "source": f"art-source/b03/{source_name}",
        "runtime": f"public/assets/characters/kairo/b03/{name}.png",
        "grid": {"columns": cols, "rows": rows, "layout": "rows=directions front,right,back,left; columns=frames"},
        "frameCountPerDirection": cols,
        "frameWidth": CELL_W,
        "frameHeight": CELL_H,
        "uniformClipScale": round(scale, 6),
        "loop": name in {"idle", "run"},
        "frameSeconds": {"idle": 0.16, "run": 0.07, "dodge": 0.0475, "states": None}[name],
        "alphaFloorClearedPixelCount": cleared_pixels,
        "disconnectedComponentsDeleted": 0,
        "frames": records,
        "bytes": target.stat().st_size,
    }, directions)

def build_combo(overrides: dict) -> tuple[dict, list[list[Image.Image]]]:
    cells: dict[tuple[int, int, int], Image.Image] = {}
    cleared_by_cell: dict[tuple[int, int, int], int] = {}
    for hit, filename in enumerate(COMBOS, start=1):
        sheet = Image.open(SOURCE / filename).convert("RGBA")
        for row in range(4):
            for phase in range(4):
                cells[(hit, row, phase)], cleared_by_cell[(hit, row, phase)] = source_cell(sheet, 4, 4, row, phase)
    scale = clip_scale(list(cells.values()))
    direction_frames: list[list[Image.Image]] = [[] for _ in DIRECTIONS]
    records = []
    cleared_pixels = 0
    for hit, filename in enumerate(COMBOS, start=1):
        for row, direction in enumerate(DIRECTIONS):
            for phase in range(4):
                cell = cells[(hit, row, phase)]
                cleared = cleared_by_cell[(hit, row, phase)]
                cleared_pixels += cleared
                key = f"combo.hit{hit}.{direction}.{phase}"
                frame, detail = make_frame(cell, key, row, phase, overrides, scale)
                direction_frames[row].append(frame)
                records.append({"hit": hit, "phase": ["anticipation", "extension", "contact", "recovery"][phase], "direction": direction, **detail})
    atlas = Image.new("RGBA", (12 * CELL_W, 4 * CELL_H), (0, 0, 0, 0))
    for row in range(4):
        for col, frame in enumerate(direction_frames[row]):
            atlas.alpha_composite(frame, (col * CELL_W, row * CELL_H))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    target = OUTPUT / "combo.png"
    atlas.save(target, optimize=True)
    return ({
        "source": [f"art-source/b03/{name}" for name in COMBOS],
        "runtime": "public/assets/characters/kairo/b03/combo.png",
        "grid": {"columns": 12, "rows": 4, "layout": "rows=directions front,right,back,left; columns=hit1[4],hit2[4],hit3[4] phases"},
        "frameCountPerDirection": 12,
        "phaseOrderPerHit": ["anticipation", "extension", "contact", "recovery"],
        "phaseThresholds": "frame 0 before 60% of startup; frame 1 until startup; frame 2 for 75 ms after startup; frame 3 through recovery",
        "frameWidth": CELL_W,
        "frameHeight": CELL_H,
        "uniformClipScale": round(scale, 6),
        "alphaFloorClearedPixelCount": cleared_pixels,
        "disconnectedComponentsDeleted": 0,
        "frames": records,
        "bytes": target.stat().st_size,
    }, direction_frames)

def make_sheets(atlases: dict[str, Image.Image], regular_frames: dict[str, list[list[Image.Image]]], combo_frames: list[list[Image.Image]]) -> None:
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except OSError:
        font = ImageFont.load_default()
    outdir = EVIDENCE / "contact-sheets"
    outdir.mkdir(parents=True, exist_ok=True)
    for name, frames_by_direction in regular_frames.items():
        columns = max(len(row) for row in frames_by_direction)
        preview = Image.new("RGBA", (columns * CELL_W, 4 * (CELL_H + 30)), "#111a28")
        draw = ImageDraw.Draw(preview)
        for row, direction in enumerate(DIRECTIONS):
            y = row * (CELL_H + 30)
            draw.text((6, y + 7), DIR_LABELS[direction], font=font, fill="#b9d4e2")
            for col, frame in enumerate(frames_by_direction[row]):
                preview.alpha_composite(frame, (col * CELL_W, y + 30))
        preview.convert("RGB").save(outdir / f"{name}-by-direction.png", optimize=True)
    preview = Image.new("RGBA", (12 * CELL_W, 4 * (CELL_H + 30)), "#111a28")
    draw = ImageDraw.Draw(preview)
    for row, direction in enumerate(DIRECTIONS):
        y = row * (CELL_H + 30)
        draw.text((6, y + 7), DIR_LABELS[direction], font=font, fill="#b9d4e2")
        for col, frame in enumerate(combo_frames[row]):
            preview.alpha_composite(frame, (col * CELL_W, y + 30))
    preview.convert("RGB").save(outdir / "combo-by-direction.png", optimize=True)

overrides = load_overrides()
manifest = {
    "status": "B03 directional animation implementation; generated art is proposed and owner review remains pending",
    "date": "2026-11-06",
    "directions": DIRECTIONS,
    "diagonalPolicy": "four authored cardinal views; select the dominant world axis (vertical wins ties), with 70 ms crossfade on direction changes; diagonals are mapped, not separately authored",
    "cell": {"width": CELL_W, "height": CELL_H, "runtimeAnchor": [CELL_W // 2, CELL_H - 8]},
    "pivotOverrides": "tools/b03-frame-overrides.json; per-frame source pivot and root offsets are editable; default uses the common source-grid foot line",
    "cleanup": {"alphaFloor": ALPHA_FLOOR, "alphaThreshold": "Only nonzero alpha values <= 32 are cleared as low-opacity edge contamination after contact-sheet review; disconnected foreground components are reported, never deleted."},
    "rejectedSources": [
        {"source": "art-source/b03/rejected/kairo-combo-1-first-grid-rejected.png", "reason": "vertical grid bleed placed cropped shoes above the next row"},
        {"source": "art-source/b03/rejected/kairo-combo-2-first-grid-rejected.png", "reason": "vertical grid bleed placed cropped shoes above the next row"},
        {"source": "art-source/b03/rejected/kairo-combo-3-clipped-uppercut-rejected.png", "reason": "uppercut wrist clipped at canvas edge and grid fragments"},
        {"source": "art-source/b03/rejected/kairo-dodge-first-grid-rejected.png", "reason": "extended feet crossed cell bounds and appeared as detached fragments"},
        {"source": "art-source/b03/rejected/kairo-run-first-grid-edge-clipped.png", "reason": "extended profile shoe was clipped by the source cell edge"},
        {"source": "art-source/b03/kairo-combo-1-source.png", "reason": "superseded early grid; a rejected copy is retained and v2 is used"},
        {"source": "art-source/b03/kairo-combo-2-source.png", "reason": "superseded early grid; a rejected copy is retained and v2 is used"},
        {"source": "art-source/b03/kairo-combo-3-source.png", "reason": "superseded early grid; a rejected copy is retained and v2 is used"},
        {"source": "art-source/b03/kairo-dodge-4dir-source.png", "reason": "superseded first grid; a rejected copy is retained and v2 is used"},
        {"source": "art-source/b03/kairo-run-4dir-source.png", "reason": "superseded clipped profile grid; a rejected copy is retained and v2 is used"},
        {"source": "art-source/b03/kairo-state-4dir-source-v2-raw.png", "reason": "pre-edit halo draft; edited v2 is used"},
        {"source": "art-source/b03/kairo-state-4dir-source.png", "reason": "superseded initial grid retained for audit"}
    ],
    "clips": {},
    "states": STATE_COLUMNS,
    "generationMetadata": "art-source/b03/generation-record.json",
}
regular_frames: dict[str, list[list[Image.Image]]] = {}
preview_atlases: dict[str, Image.Image] = {}
for name, (source_name, cols, rows) in SHEETS.items():
    record, frames = build_regular(name, source_name, cols, rows, overrides)
    record["directions"] = DIRECTIONS
    manifest["clips"][name] = record
    regular_frames[name] = frames
    preview_atlases[name] = Image.open(ROOT / record["runtime"]).convert("RGBA")
combo_record, combo_frames = build_combo(overrides)
combo_record["directions"] = DIRECTIONS
manifest["clips"]["combo"] = combo_record
make_sheets(preview_atlases, regular_frames, combo_frames)
MANIFEST.parent.mkdir(parents=True, exist_ok=True)
MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
total_bytes = sum(clip["bytes"] for clip in manifest["clips"].values())
print(f"Built {len(manifest['clips'])} direction-aware atlases ({total_bytes:,} bytes); contact sheets: {EVIDENCE / 'contact-sheets'}")
