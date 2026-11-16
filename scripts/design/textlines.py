"""Find text lines (white or gold) in a page render and print their boxes.
Usage: python3 -I textlines.py <page_png> [x_min x_max]
"""
import sys
import numpy as np
from PIL import Image

im = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int)
H, W, _ = im.shape
x_min = int(sys.argv[2]) if len(sys.argv) > 2 else 0
x_max = int(sys.argv[3]) if len(sys.argv) > 3 else W
r, g, b = im[..., 0], im[..., 1], im[..., 2]
white = (r > 225) & (g > 215) & (b > 205)
gold = (r > 185) & (g > 120) & (g < 175) & (b < 90)
for kind, mask in (('W', white), ('G', gold)):
    mask = mask[:, x_min:x_max]
    rows = mask.sum(1)
    on = rows >= 2
    y = 0
    while y < H:
        if on[y]:
            y0 = y
            while y < H and on[y]:
                y += 1
            y1 = y
            if y1 - y0 >= 3:
                cols = np.where(mask[y0:y1].any(0))[0]
                density = mask[y0:y1].sum() / ((y1 - y0) * (cols[-1] - cols[0] + 1))
                if density < 0.6:  # skip solid white areas (e.g. inputs)
                    print(f"{kind} y={y0:5d}-{y1:5d} h={y1-y0:3d} x={cols[0]+x_min:4d}-{cols[-1]+x_min:4d} w={cols[-1]-cols[0]+1:4d}")
        y += 1
