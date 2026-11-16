"""Cut the flying soundbar shrapnel out of the hero photo so it can be animated.

Usage: python3 -I shards.py <public_images_dir> <out_ts>

There is no layered source for the hero, so this works on the largest rendered
hero for each layout (`hero-axe-2894.webp` desktop, `hero-axe-900.webp` mobile),
which stay in place as the input. For each layout it writes:

- `hero-plate-<width>.webp`: the hero with the free-flying fragments removed
  and the backdrop filled in behind them, in the same widths as `hero-axe`.
- `shards[-<width>].webp`: an atlas of the cut-out fragments with soft alpha.

and one TypeScript module with each fragment's box in the photo, its place in
the atlas and its start offset, rotation and delay for the animation.

How fragments are found: the backdrop is a saturated orange, while the debris,
the man's clothes, the axe and the soundbar are grey, black or much darker than
the backdrop around them. Those pixels are grouped; the big groups (man, axe,
bar) are closed and filled into one solid subject. Any small group that stays
clear of the subject is a fragment flying through the air. Fragments touching
the subject, and specks too small to read, stay in the plate.
"""
import sys, os, json, random
import cv2
import numpy as np
from PIL import Image

out_dir, out_ts = sys.argv[1:3]

# Layout: source width, page ladder (same as make_sizes.py), atlas widths, and the
# axe's point of impact in source pixels (where the fragments fly out from).
LAYOUTS = {
    'desktop': dict(src=2894, ladder=[768, 1206, 1600, 2160, 2894], atlas=[1447, 2894], impact=(1985, 835), scale=1.0),
    'mobile': dict(src=900, ladder=[390, 640, 900], atlas=[900], impact=(430, 912), scale=900 / 1500),
}
UNITS = {'desktop': 603, 'mobile': 326}  # hero width in design units (full page width)
QUALITY = lambda page_px: 80 if page_px <= 1206 else 72


def find(rgba, s):
    H, W = rgba.shape[:2]
    f = rgba[..., :3].astype(np.float32) / 255
    mx, mn = f.max(-1), f.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    backdrop = ((sat >= 0.5) & (mx >= 0.16)).astype(np.float32)
    sig = 30 * s
    local = cv2.GaussianBlur(mx * backdrop, (0, 0), sig) / np.maximum(cv2.GaussianBlur(backdrop, (0, 0), sig), 1e-3)
    fg = ((sat < 0.5) | (mx < 0.16) | (mx < local * 0.72)).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))

    r = max(3, int(9 * s)) | 1
    closed = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (r, r)))
    n, lbl, st, _ = cv2.connectedComponentsWithStats(closed, 8)
    subject = np.isin(lbl, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 25000 * s * s]).astype(np.uint8)
    holes = subject.copy()
    cv2.floodFill(holes, np.zeros((H + 2, W + 2), np.uint8), (0, 0), 1)
    subject |= 1 - holes
    g = int(16 * s) | 1
    guard = cv2.dilate(subject, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (g, g)))

    n, lbl, st, _ = cv2.connectedComponentsWithStats(fg, 8)
    shards = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 8 * s * s:
            continue
        piece = lbl[y:y + h, x:x + w] == i
        if guard[y:y + h, x:x + w][piece].any():
            continue
        shards.append((x, y, w, h, i))
    return lbl, shards, backdrop


def fill_backdrop(rgb, hole, backdrop, s):
    """Fill `hole` from nearby backdrop by normalised convolution, plus matching grain."""
    known = backdrop * (1 - hole)
    out = rgb.copy()
    est = np.zeros_like(rgb)
    for sig in (4 * s, 10 * s, 24 * s):
        num = cv2.GaussianBlur(rgb * known[..., None], (0, 0), sig)
        den = cv2.GaussianBlur(known, (0, 0), sig)[..., None]
        layer = num / np.maximum(den, 1e-4)
        need = (est.sum(-1) == 0) & (den[..., 0] > 0.05)
        est[need] = layer[need]
    # Grain: the photo's fine noise, sampled from the backdrop and added back.
    rng = np.random.default_rng(7)
    smooth = cv2.GaussianBlur(rgb, (0, 0), 2 * s)
    resid = (rgb - smooth)[known > 0.5]
    noise_sd = resid.std(0) if len(resid) else np.zeros(3)
    grain = cv2.GaussianBlur(rng.normal(0, 1, rgb.shape).astype(np.float32), (0, 0), 0.6) * noise_sd * 1.2
    filled = est + grain
    soft = cv2.GaussianBlur(hole, (0, 0), 1.0 * max(s, 0.6))[..., None]
    return out * (1 - soft) + filled * soft


def pack(boxes, width, pad):
    """Shelf-pack (w, h) boxes into a strip `width` wide. Returns positions and height."""
    order = sorted(range(len(boxes)), key=lambda i: -boxes[i][1])
    pos = [None] * len(boxes)
    x = y = shelf = 0
    for i in order:
        w, h = boxes[i]
        if x + w + pad > width:
            x, y, shelf = 0, y + shelf + pad, 0
        pos[i] = (x + pad, y + pad)
        x += w + pad
        shelf = max(shelf, h)
    return pos, y + shelf + 2 * pad


data = {}
for layout, cfg in LAYOUTS.items():
    d = os.path.join(out_dir, layout)
    src = Image.open(os.path.join(d, f"hero-axe-{cfg['src']}.webp")).convert('RGBA')
    rgba = np.array(src)
    H, W = rgba.shape[:2]
    s = cfg['scale']
    lbl, shards, backdrop = find(rgba, s)

    # Soft alpha for each fragment: its pixels grown a little, edges feathered.
    grow = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (max(3, int(5 * s)) | 1,) * 2)
    hole = np.zeros((H, W), np.float32)
    pieces = []
    m = int(6 * s) + 2
    for x, y, w, h, i in shards:
        x0, y0, x1, y1 = max(0, x - m), max(0, y - m), min(W, x + w + m), min(H, y + h + m)
        mask = (lbl[y0:y1, x0:x1] == i).astype(np.uint8)
        mask = cv2.dilate(mask, grow).astype(np.float32)
        alpha = np.clip(cv2.GaussianBlur(mask, (0, 0), 0.7 * max(s, 0.7)) * 1.15, 0, 1)
        hole[y0:y1, x0:x1] = np.maximum(hole[y0:y1, x0:x1], (alpha > 0.02).astype(np.float32))
        crop = rgba[y0:y1, x0:x1].copy()
        crop[..., 3] = (crop[..., 3].astype(np.float32) * alpha).astype(np.uint8)
        pieces.append(((x0, y0, x1 - x0, y1 - y0), crop, (lbl[y0:y1, x0:x1] == i).sum()))
    hole = cv2.dilate(hole, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (max(3, int(5 * s)) | 1,) * 2))

    plate = rgba.astype(np.float32)
    plate[..., :3] = fill_backdrop(plate[..., :3], hole, backdrop, s)
    plate = Image.fromarray(np.clip(plate, 0, 255).astype(np.uint8), 'RGBA')
    for page_px in cfg['ladder']:
        w = round(W * page_px / cfg['src'])
        h = round(H * page_px / cfg['src'])
        out = plate if w == W else plate.resize((w, h), Image.LANCZOS)
        out.save(os.path.join(d, f'hero-plate-{w}.webp'), quality=QUALITY(page_px), method=6, alpha_quality=100)

    # Atlas at full resolution; smaller atlases are straight downscales, so the
    # padding keeps neighbours from bleeding into each other.
    pad = 6
    width = 1024 if layout == 'desktop' else 512
    pos, ah = pack([(p[0][2], p[0][3]) for p in pieces], width, pad)
    atlas = Image.new('RGBA', (width, ah), (0, 0, 0, 0))
    for (box, crop, _), (ax, ay) in zip(pieces, pos):
        atlas.paste(Image.fromarray(crop, 'RGBA'), (ax, ay))
    atlas_files = []
    for aw in cfg['atlas']:
        k = aw / cfg['src']
        a = atlas if k == 1 else atlas.resize((round(width * k), round(ah * k)), Image.LANCZOS)
        name = 'shards.webp' if k == 1 else f'shards-{aw}.webp'
        a.save(os.path.join(d, name), quality=82, method=6, alpha_quality=90)
        atlas_files.append((name, k))

    # Animation: each fragment starts bunched near the point of impact, small and
    # turned, then flies out to where the photo froze it. Bigger pieces start a
    # touch later and spin less.
    rng = random.Random(11 if layout == 'desktop' else 12)
    u = UNITS[layout] / W  # design units per source pixel
    ix, iy = cfg['impact']
    items = []
    for (box, _, area), (ax, ay) in zip(pieces, pos):
        x, y, w, h = box
        cx, cy = x + w / 2, y + h / 2
        sx = ix + (cx - ix) * rng.uniform(0.02, 0.12) - cx
        sy = iy + (cy - iy) * rng.uniform(0.02, 0.12) - cy
        big = min(1, (area ** 0.5) / (40 * s))
        spin = rng.choice([-1, 1]) * rng.uniform(140, 320) * (1 - 0.6 * big)
        delay = rng.uniform(0, 0.22) + 0.12 * big
        items.append([x, y, w, h, ax, ay, round(sx * u, 2), round(sy * u, 2), round(spin), round(delay, 3)])
    data[layout] = dict(w=W, h=H, atlasW=width, atlasH=ah, files=atlas_files, shards=items)
    print(layout, len(items), 'shards; atlas', width, 'x', ah)

lines = [
    '// Generated by scripts/design/shards.py: the flying fragments cut out of the hero photo.',
    '// Each shard: [x, y, w, h] in source px, [ax, ay] in the atlas, start offset [dx, dy] in',
    '// design units, start rotation in degrees and delay in seconds.',
    'export type Shard = [number, number, number, number, number, number, number, number, number, number]',
    'export type ShardSet = { w: number; h: number; atlasW: number; atlasH: number; atlas: string; atlas2x?: string; shards: Shard[] }',
    'export const shards: { m: ShardSet; d: ShardSet } = {',
]
for key, layout in (('m', 'mobile'), ('d', 'desktop')):
    v = data[layout]
    files = {k: n for n, k in v['files']}
    if layout == 'desktop':
        one, two = f"/images/desktop/{files[0.5]}", f"/images/desktop/{files[1.0]}"
        extra = f", atlas: '{one}', atlas2x: '{two}'"
    else:
        extra = f", atlas: '/images/mobile/{files[1.0]}'"
    lines.append(f"  {key}: {{ w: {v['w']}, h: {v['h']}, atlasW: {v['atlasW']}, atlasH: {v['atlasH']}{extra}, shards: [")
    for it in v['shards']:
        lines.append('    [' + ', '.join(str(x) for x in it) + '],')
    lines.append('  ] },')
lines.append('}')
open(out_ts, 'w').write('\n'.join(lines) + '\n')
