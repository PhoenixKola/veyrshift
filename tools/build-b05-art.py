"""Audit B05 generated form reference masters; intentionally exports no runtime art."""
from __future__ import annotations
import hashlib, json, struct
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SOURCES=[
    ("ember-drive", "art-source/b05/proposed/ember-drive-four-view-master.png", "PROPOSED DESIGN ONLY; rejected for runtime due to baked light backdrop and insufficient silhouette change"),
    ("glass-current", "art-source/b05/proposed/glass-current-four-view-master.png", "PROPOSED DESIGN ONLY; rejected for runtime due to view-label artifacts and inconsistent echo accessory geometry"),
]

def inspect(path: Path):
    data=path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise ValueError(f"Not a PNG: {path}")
    width,height,depth,color_type=struct.unpack(">IIBB",data[16:26])
    return {"width":width,"height":height,"bitDepth":depth,"pngColorType":color_type,
            "alphaChannelEncoded":color_type in (4,6),"bytes":len(data),
            "sha256":hashlib.sha256(data).hexdigest()}

entries=[]
for form,path,note in SOURCES:
    target=ROOT/path
    entries.append({"form":form,"source":path,"status":"PROPOSED_REFERENCE_ONLY","runtimeExport":None,
                    "coverage":{"turnaroundViews":4,"idle":False,"run":False,"combo":False,"dodge":False,"guardParry":False,"hurtKo":False,"activationEnd":False,"finisher":False},
                    "review":note,**inspect(target)})

manifest={"batch":"B05","generatedDate":"2026-11-06","pipeline":"python tools/build-b05-art.py",
          "status":"PARTIAL_ART_GATE_BLOCKED","runtimeAssetsExported":False,
          "transparencyPolicy":"Only PNG color types 4/6 encode an alpha channel; an alpha channel alone does not prove clean cutout edges.",
          "forms":entries}
(ROOT/"docs/art/b05-animation-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
print("B05 art source audit written; no source passed runtime-art review.")
