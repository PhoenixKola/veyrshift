"""Trim and resize B01 concept images into browser-ready prototype PNGs.

Source masters remain untouched under public/assets/_b01-source/.
Requires Pillow locally; generated files are review-only feasibility assets.
"""
from pathlib import Path
from PIL import Image

ROOT = Path("public/assets")
SOURCE = Path("art-source/b01")


def save_trimmed(source_name: str, target: Path, max_size: tuple[int, int]) -> None:
    image = Image.open(SOURCE / source_name).convert("RGBA")
    bounds = image.getchannel("A").getbbox()
    if bounds:
        image = image.crop(bounds)
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, optimize=True)
    print(f"{target}: {image.width}x{image.height}, {target.stat().st_size:,} bytes")


for source_name, output_name, max_height in [
    ("kairo-master-direction-b.png", "idle.png", 480),
    ("kairo-punch-right.png", "punch-right.png", 520),
    ("kairo-dodge-right.png", "dodge-right.png", 520),
    ("kairo-ember-visual.png", "ember-visual-only.png", 480),
]:
    save_trimmed(
        source_name,
        ROOT / "characters" / "kairo" / "prototype" / output_name,
        (640, max_height),
    )

save_trimmed(
    "rift-wisp.png",
    ROOT / "enemies" / "prototype" / "rift-wisp.png",
    (384, 384),
)

background = Image.open(SOURCE / "title-background.png").convert("RGB")
background.thumbnail((1672, 941), Image.Resampling.LANCZOS)
target = ROOT / "ui" / "title-background-b01.png"
target.parent.mkdir(parents=True, exist_ok=True)
background.save(target, optimize=True)
print(f"{target}: {background.width}x{background.height}, {target.stat().st_size:,} bytes")
