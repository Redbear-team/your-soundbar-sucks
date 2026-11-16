"""Render the photos so each section reproduces the PDF, gradients included.

Usage:
  python3 -I gen2.py <links_dir> <locate_mobile.json> <locate_desktop.json> \
      <pdf_mobile_page.png> <pdf_desktop_page.png> <lut.npz> <out_images_dir> <preview_dir>

For every section, photos are stacked bottom-up. Each photo's blend mask is
recovered from the PDF: where the photo differs from what is beneath it, the
PDF colour says how much of the photo shows (least-squares projection),
smoothed into a soft mask. What remains (glows, vignettes) becomes one soft
"tone" layer per section. All colours are then mapped through the viewer LUT.
Outputs <out>/{mobile,desktop}/<name>.webp and tone-<section>.webp, plus a JSON
placement map on stdout.
"""
import sys, os, json
import cv2
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lut import apply_anchored  # noqa: E402

links, loc_m, loc_d, pdf_m, pdf_d, lut_path, out_dir, prev_dir, mask_m, mask_d = sys.argv[1:11]
VOL = np.load(lut_path)['vol']
F_BY_LAYOUT = {'mobile': 3.7, 'desktop': 4.8}  # master px per design unit (largest srcset size)
TONE_F = 0.5   # tone layer px per unit (it is very smooth)

SRC = {
    'hero-axe': 'Gemini_Generated_Image_ydnjjxydnjjxydnj.png',
    'burning-bar': 'Gemini_Generated_Image_seus1eseus1eseus.png',
    'couch': 'Gemini_Generated_Image_qp3tnvqp3tnvqp3t.png',
    'blindfold': 'Gemini_Generated_Image_pxi87apxi87apxi8.png',
    'product': '2 Unit Shot.png',
    'shredder': 'Gemini_Generated_Image_p77vkrp77vkrp77v.png',
    'anvil': 'Gemini_Generated_Image_n1b6otn1b6otn1b6.png',
}
PLACE = {'hero-axe': 's1', 'burning-bar': 's1', 'couch': 's1', 'blindfold': 's2',
         'product': 's3', 'shredder': 's3', 'anvil': 's4'}
LAYOUTS = {
    'mobile': dict(W=326, pdf=pdf_m, loc=loc_m, mask=mask_m, clean=(2, 322), sections={
        's1': (82, 2236), 's2': (2236, 3314), 's3': (3314, 4856), 's4': (4856, 5512)},
        cones=(39, 1659 + 82, 252, 95)),
    'desktop': dict(W=603, pdf=pdf_d, loc=loc_d, mask=mask_d, clean=(1, 599), sections={
        's1': (82, 1314), 's2': (1314, 1940), 's3': (1940, 2813), 's4': (2813, 3154)},
        cones=(300, 928 + 82, 252, 95)),
}
# Flat section colours in the PDF (document profile), before the viewer LUT.
BG = {'s1': (0x76, 0x29, 0x15), 's2': (0x30, 0x32, 0x33), 's3': (0x76, 0x29, 0x15), 's4': (0x30, 0x32, 0x33)}

cache = {}


def load(name):
    if name not in cache:
        im = cv2.imread(os.path.join(links, SRC[name]), cv2.IMREAD_UNCHANGED)
        if im.shape[2] == 3:
            im = cv2.cvtColor(im, cv2.COLOR_BGR2BGRA)
        cache[name] = im
    return cache[name]


def render(name, r, rect, scale):
    """Warp the full-res source into page space at `scale` px/unit, cropped to rect."""
    src = load(name)
    if r['flip']:
        src = cv2.flip(src, 1)
    A = np.array(r['M'], np.float64); A[:, :2] *= r['k']
    x0, y0, x1, y1 = rect
    s = float(np.hypot(A[0, 0], A[1, 0])) * scale
    pre = cv2.resize(src, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
    B = np.empty_like(A)
    B[:, :2] = A[:, :2] * scale / s
    B[:, 2] = A[:, 2] * scale
    B[0, 2] -= x0 * scale; B[1, 2] -= y0 * scale
    ow, oh = int(round((x1 - x0) * scale)), int(round((y1 - y0) * scale))
    out = cv2.warpAffine(pre, B, (ow, oh), flags=cv2.INTER_LINEAR,
                         borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
    rgb = out[:, :, 2::-1].astype(np.float64)
    a = out[:, :, 3].astype(np.float64) / 255.0
    return rgb, a


def box_of(r, W, sy0, sy1):
    h, w = cache_shape(r)
    A = np.array(r['M'], np.float64); A[:, :2] *= r['k']
    c = cv2.transform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2), A).reshape(-1, 2)
    x0, y0 = c.min(0); x1, y1 = c.max(0)
    return [round(v) for v in (max(x0, 0), max(y0, sy0), min(x1, W), min(y1, sy1))]


def cache_shape(r):
    return r['_shape']


def norm_blur(img, w, sigma):
    """Blur `img` using weights `w` (normalised convolution)."""
    if img.ndim == 3:
        num = cv2.GaussianBlur(img * w[..., None], (0, 0), sigma)
    else:
        num = cv2.GaussianBlur(img * w, (0, 0), sigma)
    den = cv2.GaussianBlur(w, (0, 0), sigma)
    return num / np.maximum(den[..., None] if img.ndim == 3 else den, 1e-6), den


def to_viewer(rgb):
    return apply_anchored(VOL, rgb)


def save_webp(path, rgb, a):
    rgba = np.dstack([np.clip(np.round(rgb), 0, 255), np.clip(np.round(a * 255), 0, 255)]).astype(np.uint8)
    has_alpha = (rgba[:, :, 3] < 250).any()
    Image.fromarray(rgba if has_alpha else rgba[:, :, :3]).save(path, quality=82, method=6, alpha_quality=100)
    return bool(has_alpha), os.path.getsize(path) // 1024


placements = {}
for layout, cfg in LAYOUTS.items():
    F = F_BY_LAYOUT[layout]
    W = cfg['W']
    loc = json.load(open(cfg['loc']))['results']
    for name, r in loc.items():
        r['_shape'] = load(name).shape[:2]
    page = cv2.imread(cfg['pdf'])[:, :, ::-1].astype(np.float64)
    # The PDF raster's outer columns blend into the white page around it
    # (desktop content ends at x=600, mobile starts at x=1 and ends at x=323).
    # Replace them with the nearest clean column so no light line gets baked in.
    clean_l, clean_r = cfg['clean']
    page[:, :clean_l] = page[:, clean_l:clean_l + 1]
    page[:, clean_r + 1:W] = page[:, clean_r:clean_r + 1]
    os.makedirs(os.path.join(out_dir, layout), exist_ok=True)
    placements[layout] = {}
    previews = []
    for sec, (sy0, sy1) in cfg['sections'].items():
        H = sy1 - sy0
        P = page[sy0:sy1, :W]
        C = np.zeros((H, W, 3)) + np.array(BG[sec], float)       # composite so far (1 px/unit)
        layers = [n for n, s in PLACE.items() if s == sec]
        # Render each layer at 1 px/unit for estimation.
        low = {}
        for n in layers:
            rect = box_of(loc[n], W, sy0, sy1)
            low[n] = (rect, *render(n, loc[n], rect, 1.0))
        # Text: exact mask from the site's own render (text positions match the PDF).
        tm = cv2.imread(cfg['mask'], cv2.IMREAD_GRAYSCALE)
        text = np.zeros((H, W), bool)
        hh = min(H, tm.shape[0] - sy0)
        text[:hh] = tm[sy0:sy0 + hh, :W] > 0
        # Cones on the couch are drawn separately in SVG; keep them out of the masks.
        cx, cy, cw, ch = cfg['cones']
        cones = np.zeros((H, W), bool)
        if sec == 's1':
            cones[cy - sy0 - 2:cy - sy0 + ch + 2, cx - 2:cx + cw + 2] = True

        alphas = {}
        for i, n in enumerate(layers):
            (x0, y0, x1, y1), I, cov = low[n]
            ys, xs = slice(y0 - sy0, y1 - sy0), slice(x0, x1)
            Cb, Pb, tb = C[ys, xs], P[ys, xs], (text | cones)[ys, xs]
            d = I - Cb
            den = (d * d).sum(2)
            a_raw = np.clip(((Pb - Cb) * d).sum(2) / np.maximum(den, 1e-6), 0, 1)
            w = np.where((den > 12 ** 2) & ~tb & (cov > 0.5), np.minimum(den, 80 ** 2), 0)
            # Multi-scale fill: fine detail where the PDF shows the blend, wider
            # neighbourhoods across text/cone holes, layer default only far away.
            default = 1.0 if i == 0 else 0.0
            a = np.full(a_raw.shape, default)
            for sigma in (48, 16, 6, 1.6):
                a_s, support = norm_blur(a_raw, w, sigma)
                conf = np.clip(support / (0.15 * 80 ** 2), 0, 1)
                a = conf * a_s + (1 - conf) * a
            a = np.clip(a, 0, 1) * cov
            # Soften any photo edge that falls inside the page, so it can't read as a line.
            ramp = 8.0
            yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]].astype(np.float64)
            fade = np.ones_like(a)
            if x0 > 0:
                fade = np.minimum(fade, np.clip((xx + 0.5) / ramp, 0, 1))
            if x1 < W:
                fade = np.minimum(fade, np.clip((a.shape[1] - xx - 0.5) / ramp, 0, 1))
            if y0 > sy0:
                fade = np.minimum(fade, np.clip((yy + 0.5) / ramp, 0, 1))
            if y1 < sy1:
                fade = np.minimum(fade, np.clip((a.shape[0] - yy - 0.5) / ramp, 0, 1))
            a = a * fade
            alphas[n] = a
            C[ys, xs] = a[..., None] * I + (1 - a[..., None]) * Cb

        # Tone layer: smooth residual between the PDF and the photo stack.
        # Residual from clean pixels only, filled across holes at increasing scales.
        hole = cv2.dilate((text | cones).astype(np.uint8), np.ones((9, 21), np.uint8)) > 0
        Rraw = P - C
        valid = (~hole).astype(np.float64)
        R = np.zeros_like(Rraw)
        for sigma in (40, 14, 5):
            Rs, sup = norm_blur(Rraw, valid, sigma)
            conf = np.clip(sup / 0.3, 0, 1)[..., None]
            R = conf * Rs + (1 - conf) * R
        Ct = C
        T_v, B_v = to_viewer(Ct + R), to_viewer(Ct)
        diff = T_v - B_v
        ta = np.clip(np.abs(diff).max(2) / 48.0, 0, 1)
        O = np.where(ta[..., None] > 1e-3, B_v + diff / np.maximum(ta[..., None], 1e-3), B_v)
        ta = np.where(np.abs(diff).max(2) < 1.5, 0, ta)
        tw, th = max(2, int(round(W * TONE_F))), max(2, int(round(H * TONE_F)))
        O_s = cv2.resize(O, (tw, th), interpolation=cv2.INTER_AREA)
        a_s = cv2.resize(ta, (tw, th), interpolation=cv2.INTER_AREA)
        has_a, kb = save_webp(os.path.join(out_dir, layout, f'tone-{sec}.webp'), O_s, a_s)
        placements[layout][f'tone-{sec}'] = dict(section=sec, x=0, y=0, w=W, h=H, kb=kb)
        print(f'{layout} {sec}: residual |R| mean {np.abs(R[~text]).mean():.2f} p95 {np.percentile(np.abs(R[~text]), 95):.1f}',
              file=sys.stderr)

        # Full-res photo layers.
        prev = to_viewer(np.zeros((H, W, 3)) + np.array(BG[sec], float))
        for n in layers:
            (x0, y0, x1, y1), _, _ = low[n]
            rgb, cov = render(n, loc[n], (x0, y0, x1, y1), F)
            a_up = cv2.resize(alphas[n], (rgb.shape[1], rgb.shape[0]), interpolation=cv2.INTER_LINEAR)
            if n == 'product':
                a_up = np.minimum(a_up, cov) if a_up.max() > 0 else cov
            a_up = np.where(a_up > 0.985, 1.0, a_up) * (cov if n != 'product' else 1)
            rgb_v = to_viewer(rgb)
            # Lossless master; make_sizes.py exports the WebP ladder from it.
            rgba = np.dstack([np.clip(np.round(rgb_v), 0, 255), np.clip(np.round(a_up * 255), 0, 255)]).astype(np.uint8)
            has_a = bool((rgba[:, :, 3] < 250).any())
            Image.fromarray(rgba if has_a else rgba[:, :, :3]).save(os.path.join(out_dir, layout, f'{n}.png'), compress_level=1)
            kb = 0
            placements[layout][n] = dict(section=sec, x=x0, y=y0 - sy0, w=x1 - x0, h=y1 - y0, alpha=has_a, kb=kb)
            sm_rgb = cv2.resize(rgb_v, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
            sm_a = cv2.resize(a_up, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)[..., None]
            prev[y0 - sy0:y1 - sy0, x0:x1] = sm_a * sm_rgb + (1 - sm_a) * prev[y0 - sy0:y1 - sy0, x0:x1]
        tone = cv2.resize(O_s, (W, H), interpolation=cv2.INTER_LINEAR)
        tone_a = cv2.resize(a_s, (W, H), interpolation=cv2.INTER_LINEAR)[..., None]
        prev = tone_a * tone + (1 - tone_a) * prev
        previews.append(prev)
    cv2.imwrite(os.path.join(prev_dir, f'composite2_{layout}.png'),
                np.clip(np.vstack(previews), 0, 255).astype(np.uint8)[:, :, ::-1])

print(json.dumps(placements, indent=1))
