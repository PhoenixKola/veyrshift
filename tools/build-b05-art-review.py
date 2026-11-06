"""Package small normal-speed before/after Vite captures for owner review."""
from __future__ import annotations

import argparse
import subprocess
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLIPS = ("diagonal-four-directions", "base-three-hit-combo",
         "ember-activation-combo-special-finisher-reversion")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--before", required=True, type=Path)
    parser.add_argument("--body", required=True, type=Path)
    parser.add_argument("--effects", required=True, type=Path)
    parser.add_argument("--broad", required=True, type=Path)
    args = parser.parse_args()
    output = ROOT / "handoff/b05-art-first-review.zip"
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="veyrshift-b05-review-") as temp:
        temp = Path(temp)
        comparisons = []
        for name in CLIPS:
            before = args.before / f"{name}.webm"
            after = args.effects / f"{name}.webm"
            comparison = temp / f"before-left-after-right-{name}.webm"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(before),
                            "-i", str(after), "-filter_complex",
                            "[0:v]fps=12,scale=640:360,setsar=1[a];"
                            "[1:v]fps=12,scale=640:360,setsar=1[b];"
                            "[a][b]hstack=inputs=2[v]", "-map", "[v]", "-an",
                            "-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0",
                            "-shortest", str(comparison)], check=True)
            comparisons.append(comparison)
        readme = temp / "README.txt"
        readme.write_text(
            "VEYRSHIFT B05 art-first review — 2026-11-06\n"
            "Three normal-speed side-by-side recordings: prior pushed B05 on LEFT, current candidate on RIGHT.\n"
            "Recording start and frame scheduling are not locked; compare motion, not exact simultaneous poses.\n"
            "Comparison clips keep particles enabled in both captures.\n"
            "The additional current body clips have particles disabled. WebM contains no audio.\n"
            "75% screenshots come from the broad Chrome run; that run had one Glass showcase frame check fail.\n"
            "Owner visual, game-feel, and audio approval remain pending.\n"
            "Source masters and runtime files are in the repository; see the included manifest and notes.\n",
            encoding="utf-8")
        with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED, compresslevel=7) as archive:
            for comparison in comparisons:
                archive.write(comparison, comparison.name)
            for name in CLIPS:
                archive.write(args.body / f"{name}.webm", f"current-body-only-{name}.webm")
            archive.write(args.body / "report.json", "focused-qa-report.json")
            archive.write(args.broad / "qa-report.json", "broad-qa-report.json")
            archive.write(readme, readme.name)
            for name in ("base", "ember"):
                for background in ("dark", "light"):
                    image = ROOT / f"docs/art/b05-{name}-eight-way-{background}.png"
                    archive.write(image, image.name)
            for path in (ROOT / "docs/art/b05-ember-production-manifest.json",
                         ROOT / "docs/art/b05-ember-production-notes.md",
                         ROOT / "docs/qa/b05-art-first-ember-production-evidence.md"):
                archive.write(path, path.name)
            for name in ("ordinary-11-game-960x540.png",
                         "showcase-matrix-ember-drive-75-midtone-normal.png"):
                archive.write(args.broad / name, name)
    print(f"{output} ({output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
