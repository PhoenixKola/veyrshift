#!/usr/bin/env python3
"""Build game-size static silhouette comparisons without modifying any source art."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art-source/b05/visual-breakthrough"
EVIDENCE = ROOT / "tests/evidence/b05/visual-breakthrough"
BASE = ROOT / "public/assets/characters/kairo/b03/idle.png"
FORMS = {
    "ember-concept-a": "ember-drive",
    "ember-concept-b": "ember-drive",
    "glass-concept-a": "glass-current",
    "glass-concept-b": "glass-current",
}
CELL = (100, 140)
PANEL_W, PANEL_H, LABEL_W, HEADER_H = 122, 172, 128, 48
FONT = ImageFont.load_default()
SEQUENCES = {
    "ember": (SOURCE / "ember-sequence-grid-v1.png", 4, 2,
              [1000, 450, 500, 400, 950, 120, 750, 850]),
    "glass": (SOURCE / "glass-sequence-grid-v3.png", 2, 4,
              [1000, 750, 450, 450, 720, 120, 720, 850]),
}


def source_view(path: Path, direction: str) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    split = image.width // 2
    half = image.crop((0, 0, split, image.height) if direction == "front" else
                      (split, 0, image.width, image.height))
    alpha = half.getchannel("A")
    # Threshold is used only to locate the figure bounds; source alpha is kept.
    bounds = alpha.point(lambda value: 255 if value > 32 else 0).getbbox()
    if bounds is None:
        raise ValueError(f"no visible figure in {path.name}/{direction}")
    left, top, right, bottom = bounds
    pad = 10
    return half.crop((max(0, left-pad), max(0, top-pad),
                      min(half.width, right+pad), min(half.height, bottom+pad)))


def fitted(image: Image.Image, scale: float) -> Image.Image:
    width = round(CELL[0] * scale)
    height = round(CELL[1] * scale)
    image = image.copy()
    image.thumbnail((width, height), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", CELL, (0, 0, 0, 0))
    frame.alpha_composite(image, ((CELL[0]-image.width)//2, CELL[1]-image.height-3))
    return frame


def base_views(direction: str) -> Image.Image:
    image = Image.open(BASE).convert("RGBA")
    row = 0 if direction == "front" else 1
    return image.crop((0, row*256, 192, (row+1)*256))


def add_effect(frame: Image.Image, form_id: str) -> Image.Image:
    key = "activation" if form_id == "ember-drive" else "transition"
    texture = Image.open(ROOT / f"public/assets/vfx/b05/{form_id}/{key}.webp").convert("RGBA")
    texture.thumbnail((132, 124), Image.Resampling.LANCZOS)
    # Mirror the existing renderer's subdued sustained-form aura opacity.
    alpha = texture.getchannel("A").point(lambda value: round(value * .23))
    texture.putalpha(alpha)
    result = Image.new("RGBA", CELL, (0, 0, 0, 0))
    result.alpha_composite(texture, ((CELL[0]-texture.width)//2, 17))
    result.alpha_composite(frame)
    return result


def build(direction: str) -> Path:
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    base = base_views(direction)
    concepts = {name: source_view(SOURCE / f"{name}.png", direction) for name in FORMS}
    columns = [("BASE", None, base)] + [(name.upper().replace("CONCEPT-", " "), FORMS[name], image)
                                        for name, image in concepts.items()]
    conditions = [(1, "DARK", False), (1, "DARK", True),
                  (1, "MIDTONE", False), (1, "MIDTONE", True),
                  (.75, "DARK", False), (.75, "DARK", True),
                  (.75, "MIDTONE", False), (.75, "MIDTONE", True)]
    height = HEADER_H + len(conditions) * PANEL_H
    width = LABEL_W + len(columns) * PANEL_W
    sheet = Image.new("RGB", (width, height), (13, 18, 27))
    draw = ImageDraw.Draw(sheet)
    draw.text((8, 10), f"B05 VISUAL BREAKTHROUGH | {direction.upper()} VIEW | GAME DRAW SCALE 100 x 140", fill=(235, 240, 244), font=FONT)
    for index, (label, _, _) in enumerate(columns):
        draw.text((LABEL_W + index*PANEL_W + 8, 31), label, fill=(199, 214, 221), font=FONT)

    for row, (scale, environment, effects) in enumerate(conditions):
        y = HEADER_H + row * PANEL_H
        bg = (22, 29, 40) if environment == "DARK" else (117, 124, 133)
        draw.rectangle((0, y, width, y+PANEL_H-1), fill=(26, 33, 43) if row % 2 == 0 else (19, 26, 36))
        fx_label = "ON" if effects else "OFF"
        scale_label = "100%" if scale == 1 else "75%"
        draw.multiline_text((7, y+11), f"{scale_label}\n{environment}\nVFX {fx_label}", fill=(222, 230, 235), font=FONT, spacing=5)
        for index, (label, form_id, art) in enumerate(columns):
            frame = fitted(art, scale)
            if effects and form_id:
                frame = add_effect(frame, form_id)
            background = Image.new("RGBA", CELL, (*bg, 255))
            background.alpha_composite(frame)
            x = LABEL_W + index * PANEL_W + (PANEL_W-CELL[0])//2
            sheet.paste(background.convert("RGB"), (x, y+8))
            draw.rectangle((x, y+8, x+CELL[0]-1, y+CELL[1]+7), outline=(170, 179, 190), width=1)
    target = EVIDENCE / f"comparison-{direction}.jpg"
    sheet.save(target, quality=94, subsampling=0, optimize=True)
    return target


def sequence_frames(path: Path, columns: int, rows: int) -> list[Image.Image]:
    sheet = Image.open(path).convert("RGBA")
    frames = []
    for index in range(columns * rows):
        column, row = index % columns, index // columns
        left, top = round(column * sheet.width / columns), round(row * sheet.height / rows)
        right, bottom = round((column + 1) * sheet.width / columns), round((row + 1) * sheet.height / rows)
        cell = sheet.crop((left, top, right, bottom))
        bounds = cell.getchannel("A").point(lambda value: 255 if value > 32 else 0).getbbox()
        if bounds is None:
            raise ValueError(f"empty frame {index} in {path.name}")
        x0, y0, x1, y1 = bounds
        pad = max(8, round(min(cell.size) * .025))
        # Guard the inferred content bounds; never let one cell contribute pixels to another.
        bounds = (max(0, x0-pad), max(0, y0-pad), min(cell.width, x1+pad), min(cell.height, y1+pad))
        frames.append(cell.crop(bounds))
    return frames


def frame_canvas(frame: Image.Image, size=(192, 256)) -> Image.Image:
    result = Image.new("RGBA", size, (0, 0, 0, 0))
    frame = frame.copy()
    frame.thumbnail((size[0]-12, size[1]-12), Image.Resampling.LANCZOS)
    result.alpha_composite(frame, ((size[0]-frame.width)//2, size[1]-frame.height-6))
    return result


def build_sequence_evidence(name: str, config) -> tuple[Path, Path]:
    path, columns, rows, timings = config
    frames = sequence_frames(path, columns, rows)
    if len(frames) != len(timings):
        raise ValueError(f"timing/frame mismatch for {name}")
    canvases = [frame_canvas(frame) for frame in frames]
    runtime_dir = SOURCE / "runtime"
    runtime_dir.mkdir(parents=True, exist_ok=True)
    atlas = Image.new("RGBA", (192 * len(canvases), 256), (0, 0, 0, 0))
    for index, frame in enumerate(canvases):
        atlas.alpha_composite(frame, (index * 192, 0))
    runtime_path = runtime_dir / f"{name}-proof.webp"
    atlas.save(runtime_path, "WEBP", lossless=True, method=6)
    # Keep the inspection board at recognisable figure size, with explicit frame order.
    tile_w, tile_h, label_h = 246, 300, 30
    board = Image.new("RGB", (columns*tile_w, rows*(tile_h+label_h)), (15, 21, 30))
    draw = ImageDraw.Draw(board)
    for index, frame in enumerate(canvases):
        x, y = (index % columns)*tile_w, (index // columns)*(tile_h+label_h)
        bg = Image.new("RGBA", CELL, (28, 37, 48, 255))
        preview = frame.resize(CELL, Image.Resampling.LANCZOS)
        bg.alpha_composite(preview, (0, 0))
        bg = bg.resize((200, 280), Image.Resampling.LANCZOS)
        board.paste(bg.convert("RGB"), (x+23, y+4))
        draw.text((x+8, y+285), f"{index+1:02d}  {timings[index]/1000:.2f}s", fill=(226, 234, 239), font=FONT)
    review = EVIDENCE / f"sequence-{name}-normal-scale.jpg"
    board.save(review, quality=93, optimize=True)

    # A faithful timed pose playback (one authored drawing per phase), expressly not a fluid-video claim.
    playback = EVIDENCE / f"sequence-{name}-timed-poses.gif"
    playback_frames = []
    for index, frame in enumerate(canvases):
        stage = Image.new("RGBA", (960, 540), (12, 18, 27, 255))
        backdrop = ImageDraw.Draw(stage)
        backdrop.rectangle((0, 365, 960, 540), fill=(20, 34, 49, 255))
        backdrop.ellipse((480-56, 368, 480+56, 388), fill=(3, 9, 17, 150))
        hero = frame.resize((100, 140), Image.Resampling.LANCZOS)
        stage.alpha_composite(hero, (430, 225))
        overlay = ImageDraw.Draw(stage)
        overlay.text((30, 28), f"{name.upper()}  |  PHASE {index+1}/8  |  AUTHORED-POSE PREVIEW", fill=(229, 237, 243), font=ImageFont.load_default())
        overlay.text((30, 504), "Offline timed pose preview · not a full-game capture or fluid-animation approval", fill=(173, 190, 200), font=ImageFont.load_default())
        playback_frames.append(stage.convert("RGB"))
    playback_frames[0].save(playback, save_all=True, append_images=playback_frames[1:], duration=timings,
                            loop=0, disposal=2, optimize=True)
    bounds_report = []
    sheet = Image.open(path).convert("RGBA")
    for index in range(columns * rows):
        column, row = index % columns, index // columns
        cell = sheet.crop((round(column*sheet.width/columns), round(row*sheet.height/rows),
                           round((column+1)*sheet.width/columns), round((row+1)*sheet.height/rows)))
        alpha_mask = cell.getchannel("A").point(lambda value: 255 if value > 32 else 0)
        bounds = alpha_mask.getbbox()
        edge_hits = 0
        if bounds:
            left, top, right, bottom = bounds
            edge_hits = int(left == 0) + int(top == 0) + int(right == cell.width) + int(bottom == cell.height)
        bounds_report.append({"frame": index, "alpha_bounds_threshold_32": bounds, "cell_edge_contacts": edge_hits})
    if any(frame["cell_edge_contacts"] for frame in bounds_report):
        raise ValueError(f"alpha touches a source cell boundary in {path.name}")
    manifest_path = SOURCE / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {"sequences": {}}
    manifest.setdefault("sequences", {})[name] = {
        "source": path.relative_to(ROOT).as_posix(), "runtime_preview": runtime_path.relative_to(ROOT).as_posix(),
        "source_bytes": path.stat().st_size, "runtime_bytes": runtime_path.stat().st_size,
        "grid": {"columns": columns, "rows": rows, "frames": len(frames), "cell_edge_contacts_threshold_32": 0},
        "duration_ms": timings, "total_ms": sum(timings), "alpha_audit": bounds_report,
        "runtime_cell": [192, 256], "authoring_note": "Eight independently generated held poses, cropped by alpha bounds; no generated in-betweens. Preview is intentionally classified as a timed-pose draft, not fluid animation."
    }
    source_pngs = sorted(SOURCE.rglob("*.png"))
    runtime_webps = sorted(runtime_dir.glob("*.webp"))
    evidence_files = sorted(EVIDENCE.iterdir())
    manifest["size_report"] = {
        "source_png_count_including_rejections": len(source_pngs),
        "source_png_bytes_including_rejections": sum(file.stat().st_size for file in source_pngs),
        "rejected_png_bytes": sum(file.stat().st_size for file in (SOURCE / "rejected").rglob("*.png")),
        "development_preview_atlas_count": len(runtime_webps),
        "development_preview_atlas_bytes": sum(file.stat().st_size for file in runtime_webps),
        "evidence_file_count": len(evidence_files),
        "evidence_bytes": sum(file.stat().st_size for file in evidence_files),
        "production_bundle_bytes": 0,
        "note": "Runtime previews are source-tree WebP atlases served by Vite development only; they are excluded from public/ and dist/. Evidence total includes every file already present in this evidence directory."
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return review, playback


def build_detail_closeups() -> Path:
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    base = base_views("front")
    details = [
        ("BASE", base),
        ("EMBER A · SEGMENTED CUFF", source_view(SOURCE / "ember-concept-a.png", "front")),
        ("GLASS A · FACETED SHOULDER", source_view(SOURCE / "glass-concept-a.png", "front")),
    ]
    tile = (320, 340)
    board = Image.new("RGB", (len(details)*tile[0], tile[1]+34), (14, 20, 29))
    draw = ImageDraw.Draw(board)
    for index, (label, image) in enumerate(details):
        x = index*tile[0]
        if label == "BASE":
            bounds = image.getchannel("A").point(lambda value: 255 if value > 32 else 0).getbbox()
            if bounds:
                left, top, right, bottom = bounds
                crop = image.crop((left, top, right, top+round((bottom-top)*.63)))
                crop = crop.resize((round(crop.width*1.65), round(crop.height*1.65)), Image.Resampling.LANCZOS)
            else:
                crop = image
        else:
            bounds = image.getchannel("A").point(lambda value: 255 if value > 32 else 0).getbbox()
            assert bounds is not None
            left, top, right, bottom = bounds
            body = image.crop((left, top, right, min(bottom, top+round((bottom-top)*.59))))
            crop = body.crop((round(body.width*.08), 0, round(body.width*.92), body.height))
        crop.thumbnail((tile[0]-20, tile[1]-20), Image.Resampling.LANCZOS)
        panel = Image.new("RGBA", tile, (25, 34, 46, 255))
        panel.alpha_composite(crop, ((tile[0]-crop.width)//2, (tile[1]-crop.height)//2))
        board.paste(panel.convert("RGB"), (x, 0))
        draw.text((x+10, tile[1]+10), label, fill=(229, 235, 240), font=FONT)
    target = EVIDENCE / "detail-closeups.jpg"
    board.save(target, quality=94, subsampling=0, optimize=True)
    return target


if __name__ == "__main__":
    for view in ("front", "right"):
        print(build(view).relative_to(ROOT))
    for name, config in SEQUENCES.items():
        for target in build_sequence_evidence(name, config):
            print(target.relative_to(ROOT))
    print(build_detail_closeups().relative_to(ROOT))
