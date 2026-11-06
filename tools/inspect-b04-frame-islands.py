#!/usr/bin/env python3
"""Print connected alpha components per source grid cell for manual B04 sprite QA."""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
FILES={
    "combo1":("kairo-combo-hit1-grid.png",4), "combo2":("kairo-combo-hit2-grid.png",3),
    "combo3":("kairo-combo-hit3-grid.png",4), "locomotion":("kairo-locomotion-transitions-grid.png",4),
    "bolt":("kairo-bolt-cast-grid.png",4), "shockwave":("kairo-shockwave-grid.png",4),
    "guard":("kairo-guard-parry-grid.png",4), "finisher":("kairo-finisher-grid.png",4),
}
DIRECTIONS=("front","right","back","left")
for name,(filename,rows) in FILES.items():
    image=Image.open(ROOT/"art-source"/"b04"/filename).convert("RGBA")
    print(f"\n{name} {image.width}x{image.height} cell={image.width/4:.1f}x{image.height/rows:.1f}")
    for phase in range(rows):
        for direction,direction_name in enumerate(DIRECTIONS):
            box=(round(direction*image.width/4),round(phase*image.height/rows),round((direction+1)*image.width/4),round((phase+1)*image.height/rows))
            alpha=np.asarray(image.crop(box).getchannel("A"))
            count,_,stats,_=cv2.connectedComponentsWithStats((alpha>32).astype(np.uint8),connectivity=8)
            components=sorted((tuple(map(int,s)) for s in stats[1:count]),key=lambda value:value[4],reverse=True)
            print(f"  {direction_name:5} phase {phase}: " + ", ".join(f"area={a} box={x},{y},{w},{h}" for x,y,w,h,a in components[:6]))
