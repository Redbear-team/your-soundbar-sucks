"""Render each source photo into PDF page space, clipped to its section.

Usage: python3 -I gen.py <links_dir> <locate_mobile.json> <locate_desktop.json> <out_public_images> <preview_dir>
Writes <out>/{mobile,desktop}/<name>.webp and prints a JSON placement map
(units = PDF page px, relative to the section's top-left).
"""
import sys, os, json
import cv2
import numpy as np
from PIL import Image

links, loc_m, loc_d, out_dir, prev_dir = sys.argv[1:6]
F = 3.0  # output px per design unit

SRC = {
    'hero-axe': 'Gemini_Generated_Image_ydnjjxydnjjxydnj.png',
    'burning-bar': 'Gemini_Generated_Image_seus1eseus1eseus.png',
    'couch': 'Gemini_Generated_Image_qp3tnvqp3tnvqp3t.png',
    'blindfold': 'Gemini_Generated_Image_pxi87apxi87apxi8.png',
    'product': '2 Unit Shot.png',
    'shredder': 'Gemini_Generated_Image_p77vkrp77vkrp77v.png',
    'anvil': 'Gemini_Generated_Image_n1b6otn1b6otn1b6.png',
}
LAYOUTS = {
    'mobile': dict(W=326, sections={
        's1': (82, 2236), 's2': (2236, 3314), 's3': (3314, 4856), 's4': (4856, 5512)},
        place={'hero-axe': 's1', 'burning-bar': 's1', 'couch': 's1', 'blindfold': 's2',
               'product': 's3', 'shredder': 's3', 'anvil': 's4'}, loc=loc_m),
    'desktop': dict(W=603, sections={
        's1': (82, 1314), 's2': (1314, 1940), 's3': (1940, 2813), 's4': (2813, 3154)},
        place={'hero-axe': 's1', 'burning-bar': 's1', 'couch': 's1', 'blindfold': 's2',
               'product': 's3', 'shredder': 's3', 'anvil': 's4'}, loc=loc_d),
}
BG = {'s1': (0x76, 0x29, 0x15), 's2': (0x2f, 0x32, 0x33), 's3': (0x76, 0x29, 0x15), 's4': (0x2f, 0x32, 0x33)}

def color_to_alpha(bgra, bg_rgb, floor=0.05):
    """GIMP-style colour-to-alpha: remove the flat backdrop colour so the photo
    composites back to its original pixels over that colour, and overlapping
    photos don't show rectangular edges."""
    P = bgra[:, :, :3].astype(np.float32) / 255.0
    src_a = bgra[:, :, 3].astype(np.float32) / 255.0
    B = np.array(bg_rgb[::-1], np.float32) / 255.0
    up = np.where(P > B, (P - B) / np.maximum(1 - B, 1e-6), 0)
    dn = np.where(P < B, (B - P) / np.maximum(B, 1e-6), 0)
    a = np.maximum(up, dn).max(axis=2)
    a = np.clip((a - floor) / (1 - floor), 0, 1)  # drop near-backdrop noise
    safe = np.maximum(a, 1e-4)[..., None]
    C = np.clip((P - B) / safe + B, 0, 1)
    out = np.empty_like(bgra)
    out[:, :, :3] = (C * 255 + 0.5).astype(np.uint8)
    out[:, :, 3] = (a * src_a * 255 + 0.5).astype(np.uint8)
    return out


def selective_alpha(bgra, bg_rgb, rect, below, bounds, edge=36, feather=18):
    """Opaque everywhere except where this photo overlaps a photo beneath it, or
    near its own edges inside the section; there the flat backdrop is keyed out
    so layers and edges blend. Opaque areas are identical over the section colour."""
    h, w = bgra.shape[:2]
    x0, y0, x1, y1 = rect
    bx0, by0, bx1, by1 = bounds
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    ux = x0 + xx / F; uy = y0 + yy / F           # design units
    need = np.zeros((h, w), np.float32)
    # interior edges: distance from each rect edge that is not the section/page edge
    for d, interior in (((ux - x0), x0 > bx0), ((x1 - ux), x1 < bx1), ((uy - y0), y0 > by0), ((y1 - uy), y1 < by1)):
        if interior:
            need = np.maximum(need, np.clip(1 - (d - edge) / feather, 0, 1))
    for (ox0, oy0, ox1, oy1) in below:
        dx = np.minimum(ux - ox0, ox1 - ux); dy = np.minimum(uy - oy0, oy1 - uy)
        inside = np.minimum(dx, dy)                # >0 inside the lower photo
        need = np.maximum(need, np.clip((inside + feather) / feather, 0, 1))
    # Content mask: how far each pixel is from the flat backdrop, thresholded and
    # feathered. Original colours are kept (no colour-to-alpha amplification),
    # so overlapping photos blend smoothly without banding.
    c2a = color_to_alpha(bgra, bg_rgb, floor=0.0)
    content = c2a[:, :, 3].astype(np.float32) / 255.0
    content = np.clip((content - 0.17) / 0.2, 0, 1)
    content = cv2.dilate(content, np.ones((11, 11), np.uint8))
    content = cv2.GaussianBlur(content, (0, 0), 14)
    a = 1 - need * (1 - content)
    a = np.where(a > 0.985, 1.0, a)
    out = bgra.copy()
    src_a = bgra[:, :, 3].astype(np.float32) / 255.0
    out[:, :, 3] = (a * src_a * 255 + 0.5).astype(np.uint8)
    return out


cache = {}
def load(name):
    if name not in cache:
        im = cv2.imread(os.path.join(links, SRC[name]), cv2.IMREAD_UNCHANGED)
        if im.shape[2] == 3:
            im = cv2.cvtColor(im, cv2.COLOR_BGR2BGRA)
        cache[name] = im
    return cache[name]

placements = {}
for layout, cfg in LAYOUTS.items():
    loc = json.load(open(cfg['loc']))['results']
    W = cfg['W']
    os.makedirs(os.path.join(out_dir, layout), exist_ok=True)
    preview = {k: np.zeros((int((b - a) * 1), W, 3), np.uint8) + np.array(BG[k][::-1], np.uint8)
               for k, (a, b) in cfg['sections'].items()}
    placements[layout] = {}
    below_by_sec = {}
    for name, sec in cfg['place'].items():
        below = below_by_sec.setdefault(sec, [])
        r = loc[name]
        sy0, sy1 = cfg['sections'][sec]
        M = np.array(r['M'], np.float64)       # small-source -> page units
        k = r['k']                              # small = full * k
        src = load(name)
        if r['flip']:
            src = cv2.flip(src, 1)
        # full-res source -> page units
        A = M.copy(); A[:, :2] *= k
        # page box of the transformed source
        h, w = src.shape[:2]
        corners = cv2.transform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), A).reshape(-1, 2)
        bx0, by0 = corners.min(0); bx1, by1 = corners.max(0)
        # clip to section and page width
        x0, y0 = max(bx0, 0), max(by0, sy0)
        x1, y1 = min(bx1, W), min(by1, sy1)
        x0, y0, x1, y1 = [round(v) for v in (x0, y0, x1, y1)]
        # pre-scale with INTER_AREA so the warp is close to 1:1
        s = float(np.hypot(A[0, 0], A[1, 0])) * F
        pre = cv2.resize(src, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        # output px = F * (A_lin @ p + t) with p = q / s  (q = pre-scaled px)
        B = np.empty_like(A)
        B[:, :2] = A[:, :2] * F / s
        B[:, 2] = A[:, 2] * F
        B[0, 2] -= x0 * F; B[1, 2] -= y0 * F     # origin at clip rect
        ow, oh = int(round((x1 - x0) * F)), int(round((y1 - y0) * F))
        out = cv2.warpAffine(pre, B, (ow, oh), flags=cv2.INTER_LINEAR,
                             borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
        if name != 'product':
            out = selective_alpha(out, BG[sec], (x0, y0, x1, y1), below, (0, sy0, W, sy1))
        below.append((x0, y0, x1, y1))
        has_alpha = (out[:, :, 3] < 250).any()
        rgba = cv2.cvtColor(out, cv2.COLOR_BGRA2RGBA)
        pim = Image.fromarray(rgba if has_alpha else rgba[:, :, :3])
        path = os.path.join(out_dir, layout, f'{name}.webp')
        pim.save(path, quality=80, method=6, alpha_quality=100)
        placements[layout][name] = dict(section=sec, x=x0, y=y0 - sy0, w=x1 - x0, h=y1 - y0,
                                        px=[ow, oh], alpha=bool(has_alpha), kb=os.path.getsize(path) // 1024)
        # preview composite at 1 px/unit
        small = cv2.resize(out, ((x1 - x0), (y1 - y0)), interpolation=cv2.INTER_AREA)
        a = small[:, :, 3:4] / 255.0
        region = preview[sec][y0 - sy0:y1 - sy0, x0:x1]
        preview[sec][y0 - sy0:y1 - sy0, x0:x1] = (small[:, :, :3] * a + region * (1 - a)).astype(np.uint8)
    full = np.vstack([preview[k] for k in sorted(preview)])
    cv2.imwrite(os.path.join(prev_dir, f'composite_{layout}.png'), full)

print(json.dumps(placements, indent=1))
