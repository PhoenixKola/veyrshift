"""Slice reviewed B02 sprite strips into compact, foot-anchored runtime atlases.

Requires Pillow. Source sheets remain unmodified under art-source/b02/.
"""
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art-source" / "b02"
OUTPUT = ROOT / "public" / "assets" / "characters" / "kairo" / "b02"
MANIFEST = ROOT / "docs" / "art" / "b02-animation-manifest.json"
PREVIEW = ROOT / "tests" / "evidence" / "b02" / "kairo-animation-contact-sheet.png"
CELL = (128, 160)
CONTENT = (108, 144)
ANCHOR_Y = 154
MIN_COMPONENT_RATIO = 0.006

SHEETS = {
    "idle": ("kairo-idle-source-sheet.png", 8, 1, True, 0.12),
    "run": ("kairo-run-grid-source.png", 4, 2, True, 0.07),
    "combo": ("kairo-combo-grid-source.png", 4, 3, False, 0.09),
    "dodge": ("kairo-dodge-grid-source.png", 3, 2, False, 0.032),
    "states": ("kairo-states-grid-source.png", 4, 2, False, 0.12),
}

def build(name: str, source_name: str, columns: int, rows: int) -> tuple[dict, Image.Image]:
    sheet = Image.open(SOURCE / source_name).convert("RGBA")
    count = columns * rows
    atlas = Image.new("RGBA", (CELL[0] * count, CELL[1]), (0, 0, 0, 0))
    frame_bounds = []
    removed_components = []
    for index in range(count):
        row, column = divmod(index, columns)
        left = round(column * sheet.width / columns)
        right = round((column + 1) * sheet.width / columns)
        top = round(row * sheet.height / rows)
        bottom = round((row + 1) * sheet.height / rows)
        cell = sheet.crop((left, top, right, bottom))
        alpha = cell.getchannel("A")
        labels = alpha.point(lambda value: 255 if value > 16 else 0)
        label_pixels = labels.load()
        label = 1
        retained = set()
        removed = []
        minimum_area = max(16, int(cell.width * cell.height * MIN_COMPONENT_RATIO))
        for y in range(labels.height):
            for x in range(labels.width):
                if label_pixels[x, y] != 255:
                    continue
                ImageDraw.floodfill(labels, (x, y), label, thresh=0)
                area = labels.histogram()[label]
                if area >= minimum_area:
                    retained.add(label)
                else:
                    removed.append(area)
                label += 1
                if label >= 255:
                    raise ValueError(f"{source_name}: too many alpha components in frame {index}")
        keep = labels.point(lambda value: 255 if value in retained else 0)
        cell.putalpha(ImageChops.multiply(alpha, keep))
        bounds = cell.getchannel("A").getbbox()
        if not bounds:
            raise ValueError(f"{source_name}: empty frame {index}")
        frame_bounds.append(list(bounds))
        removed_components.append(removed)
        figure = cell.crop(bounds)
        figure.thumbnail(CONTENT, Image.Resampling.LANCZOS)
        x = (CELL[0] - figure.width) // 2
        y = ANCHOR_Y - figure.height
        atlas.alpha_composite(figure, (index * CELL[0] + x, y))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    target = OUTPUT / f"{name}.png"
    atlas.save(target, optimize=True)
    return ({
        "source": f"art-source/b02/{source_name}",
        "runtime": f"public/assets/characters/kairo/b02/{name}.png",
        "frameCount": count,
        "sourceGrid": {"columns": columns, "rows": rows, "order": "row-major"},
        "frameWidth": CELL[0],
        "frameHeight": CELL[1],
        "anchor": {"x": CELL[0] // 2, "y": ANCHOR_Y, "method": "bottom-center after alpha trim"},
        "sourceFrameBounds": frame_bounds,
        "removedDisconnectedAlphaComponents": removed_components,
        "cleanupThreshold": f"components below {MIN_COMPONENT_RATIO:.1%} of a source cell are removed; core silhouette preserved",
        "bytes": target.stat().st_size,
    }, atlas)

manifest = {
    "status": "prototype animation feasibility; not owner-approved production art",
    "date": "2026-11-05",
    "pipeline": "Generated source grids are sliced in row-major cells; connected alpha components below 0.6% of each cell are removed; remaining silhouette bounds are trimmed, proportionally downscaled, and bottom-center anchored into uniform transparent atlases. No pose redraw, frame interpolation, or per-frame hitbox art is claimed.",
    "cell": {"width": CELL[0], "height": CELL[1]},
    "clips": {},
    "stateRanges": {"guard": [0, 2], "hurt": [2, 4], "ko": [4, 6], "emberActivation": [6, 8]},
    "comboRanges": {"hit1": [0, 4], "hit2": [4, 8], "hit3": [8, 12]},
}
for name, (source_name, columns, rows_count, loop, frame_seconds) in SHEETS.items():
    record, _ = build(name, source_name, columns, rows_count)
    record.update({"loop": loop, "frameSeconds": frame_seconds})
    manifest["clips"][name] = record
MANIFEST.parent.mkdir(parents=True, exist_ok=True)
MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
rows = [(name, Image.open(OUTPUT / f"{name}.png").convert("RGBA")) for name in SHEETS]
preview = Image.new("RGBA", (CELL[0] * 12, 26 + len(rows) * (CELL[1] + 28)), "#101a28")
draw = ImageDraw.Draw(preview)
for row, (name, atlas) in enumerate(rows):
    y = 26 + row * (CELL[1] + 28)
    draw.text((8, y - 18), f"{name.upper()}  |  {manifest['clips'][name]['frameCount']} frames", fill="#c5e4ec")
    for index in range(manifest["clips"][name]["frameCount"]):
        cell = atlas.crop((index * CELL[0], 0, (index + 1) * CELL[0], CELL[1]))
        preview.alpha_composite(cell, (index * CELL[0], y))
        draw.rectangle((index * CELL[0], y, (index + 1) * CELL[0] - 1, y + CELL[1] - 1), outline="#294052")
PREVIEW.parent.mkdir(parents=True, exist_ok=True)
preview.convert("RGB").save(PREVIEW, optimize=True)
print(f"Built {len(SHEETS)} atlases; {sum(v['bytes'] for v in manifest['clips'].values()):,} runtime bytes; contact sheet: {PREVIEW.relative_to(ROOT)}")
