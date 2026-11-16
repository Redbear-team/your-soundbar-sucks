"""Build a 3D colour LUT: site colours -> how the user's PDF viewer shows them.

Usage: python3 -I lut.py <render_png> <out_npz> <shot1> [<shot2> ...]
Aligns each screenshot to the render (SIFT + similarity transform), pairs pixels
in smooth areas, and averages the colour shift per LUT cell. Cells without data
fall back to a distance-weighted shift from nearby cells, fading to no shift.
"""
import sys
import cv2
import numpy as np

N = 17  # grid points per channel


def align_pairs(render, shot, sift, kr, dr):
    ks, ds = sift.detectAndCompute(cv2.cvtColor(shot, cv2.COLOR_BGR2GRAY), None)
    m = cv2.BFMatcher().knnMatch(ds, dr, k=2)
    good = [a for a, b in (x for x in m if len(x) == 2) if a.distance < 0.7 * b.distance]
    p_s = np.float32([ks[g.queryIdx].pt for g in good])
    p_r = np.float32([kr[g.trainIdx].pt for g in good])
    M, inl = cv2.estimateAffinePartial2D(p_s, p_r, ransacReprojThreshold=3, maxIters=5000)
    Minv = cv2.invertAffineTransform(M)
    h, w = shot.shape[:2]
    rw = cv2.warpAffine(render, Minv, (w, h), flags=cv2.INTER_AREA, borderValue=(255, 255, 255))
    valid = cv2.warpAffine(np.ones(render.shape[:2], np.uint8), Minv, (w, h)) > 0

    def smooth(img):
        g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
        return cv2.GaussianBlur(np.abs(cv2.Laplacian(g, cv2.CV_32F)), (0, 0), 3) < 2.5

    ok = valid & smooth(rw) & smooth(shot)
    ok = cv2.erode(ok.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    rb = cv2.GaussianBlur(rw, (0, 0), 1.5)
    sb = cv2.GaussianBlur(shot, (0, 0), 1.5)
    return rb[ok][:, ::-1].astype(np.float64), sb[ok][:, ::-1].astype(np.float64), int(inl.sum())


def build(X, Y):
    """Mean shift per cell, then fill empty cells from neighbours."""
    idx = np.clip(np.round(X / 255 * (N - 1)).astype(int), 0, N - 1)
    flat = idx[:, 0] * N * N + idx[:, 1] * N + idx[:, 2]
    cnt = np.bincount(flat, minlength=N ** 3).astype(np.float64)
    delta = np.zeros((N ** 3, 3))
    for c in range(3):
        delta[:, c] = np.bincount(flat, weights=Y[:, c] - X[:, c], minlength=N ** 3)
    have = cnt >= 30
    delta[have] /= cnt[have, None]
    delta[~have] = 0
    # Fill: Gaussian-weighted average of filled cells, fading to zero shift far away.
    grid = np.stack(np.meshgrid(np.arange(N), np.arange(N), np.arange(N), indexing='ij'), -1).reshape(-1, 3)
    src = grid[have]
    out = delta.copy()
    sigma = 1.5
    for i in np.where(~have)[0]:
        d2 = ((src - grid[i]) ** 2).sum(1)
        w = np.exp(-d2 / (2 * sigma ** 2))
        if w.sum() > 1e-6:
            fade = min(1.0, w.sum())  # little support -> little shift
            out[i] = fade * (w[:, None] * delta[have]).sum(0) / w.sum()
    # light smoothing across the grid
    vol = out.reshape(N, N, N, 3)
    k = np.array([0.25, 0.5, 0.25])
    for ax in range(3):
        vol = np.apply_along_axis(lambda v: np.convolve(np.pad(v, 1, mode='edge'), k, 'valid'), ax, vol)
    return vol, have.reshape(N, N, N)


def apply_lut(vol, rgb):
    """Trilinear lookup of the shift for an (..., 3) float array in 0..255."""
    p = np.clip(rgb / 255 * (N - 1), 0, N - 1 - 1e-6)
    i0 = np.floor(p).astype(int)
    f = p - i0
    out = np.zeros_like(rgb, dtype=np.float64)
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (f[..., 0] if dx else 1 - f[..., 0]) * (f[..., 1] if dy else 1 - f[..., 1]) * (
                    f[..., 2] if dz else 1 - f[..., 2])
                out += w[..., None] * vol[i0[..., 0] + dx, i0[..., 1] + dy, i0[..., 2] + dz]
    return np.clip(rgb + out, 0, 255)


if __name__ == '__main__':
    render_path, out_path, shots = sys.argv[1], sys.argv[2], sys.argv[3:]
    render = cv2.imread(render_path)
    render = cv2.resize(render, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
    sift = cv2.SIFT_create(nfeatures=30000)
    kr, dr = sift.detectAndCompute(cv2.cvtColor(render, cv2.COLOR_BGR2GRAY), None)
    X, Y = [], []
    for sp in shots:
        x, y, n = align_pairs(render, cv2.imread(sp), sift, kr, dr)
        print(sp.split('/')[-1], 'inliers', n, 'samples', len(x))
        X.append(x); Y.append(y)
    X = np.concatenate(X); Y = np.concatenate(Y)
    # hold out 10% to check the fit
    rng = np.random.default_rng(0)
    test = rng.random(len(X)) < 0.1
    vol, have = build(X[~test], Y[~test])
    pred = apply_lut(vol, X[test])
    err = np.abs(pred - Y[test])
    base = np.abs(X[test] - Y[test])
    print('held-out error, before:', base.mean(0).round(2), ' after:', err.mean(0).round(2),
          ' p95 after:', np.percentile(err, 95, 0).round(1))
    vol, have = build(X, Y)
    np.savez(out_path, vol=vol, have=have)
    for name, h in [('rust', '#762915'), ('charcoal', '#2f3233'), ('slate', '#374147'),
                    ('gold', '#d79629'), ('white', '#ffffff')]:
        c = np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
        o = np.round(apply_lut(vol, c[None])[0]).astype(int)
        print(f'{name:9s} {h} -> #{o[0]:02x}{o[1]:02x}{o[2]:02x}')


ANCHORS = [  # (PDF colour under the document profile, colour in the user's viewer)
    ((0x76, 0x29, 0x15), (0x60, 0x28, 0x1d)),
    ((0x30, 0x32, 0x33), (0x2c, 0x2f, 0x2b)),
    ((0x37, 0x41, 0x47), (0x2e, 0x35, 0x39)),
]


def apply_anchored(vol, rgb, sigma=14.0):
    """LUT lookup plus a smooth correction so the anchor colours land exactly."""
    out = apply_lut(vol, rgb)
    for src, dst in ANCHORS:
        src = np.array(src, float); dst = np.array(dst, float)
        corr = dst - apply_lut(vol, src[None])[0]
        w = np.exp(-((rgb - src) ** 2).sum(-1) / (2 * sigma ** 2))
        out = out + w[..., None] * corr
    return np.clip(out, 0, 255)
