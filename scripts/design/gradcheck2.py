"""Gradient match inside the page area: blurred colour difference, screen vs site.
Usage: python3 -I gradcheck2.py <scratch_dir> <render_png> [label]"""
import sys
import cv2, numpy as np
S, render_path = sys.argv[1], sys.argv[2]
render = cv2.resize(cv2.imread(render_path), None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
sift = cv2.SIFT_create(nfeatures=30000)
kr, dr = sift.detectAndCompute(cv2.cvtColor(render, cv2.COLOR_BGR2GRAY), None)
tot = []
for f in ('4', '5', '6'):
    shot = cv2.imread(f'{S}/shots/{f}_srgb.png')
    ks, ds = sift.detectAndCompute(cv2.cvtColor(shot, cv2.COLOR_BGR2GRAY), None)
    m = cv2.BFMatcher().knnMatch(ds, dr, k=2)
    good = [a for a, b in (x for x in m if len(x) == 2) if a.distance < 0.7 * b.distance]
    M, _ = cv2.estimateAffinePartial2D(np.float32([ks[g.queryIdx].pt for g in good]),
                                       np.float32([kr[g.trainIdx].pt for g in good]), ransacReprojThreshold=3)
    h, w = shot.shape[:2]
    Mi = cv2.invertAffineTransform(M)
    rw = cv2.warpAffine(render, Mi, (w, h), flags=cv2.INTER_AREA)
    valid = cv2.warpAffine(np.ones(render.shape[:2], np.uint8), Mi, (w, h))
    # page area in the screenshot: not the white margin
    page = (cv2.GaussianBlur(shot, (0, 0), 3).min(2) < 235).astype(np.uint8)
    ok = cv2.erode(valid & page, np.ones((41, 41), np.uint8)) > 0
    d = cv2.GaussianBlur(shot.astype(np.float32), (0, 0), 10) - cv2.GaussianBlur(rw.astype(np.float32), (0, 0), 10)
    e = np.abs(d)[ok]
    tot.append(e)
    print(f'  shot {f}: mean |diff| per channel {e.mean(0)[::-1].round(2)}  p95 {np.percentile(e.max(1), 95):.1f}  (n={ok.sum()})')
e = np.concatenate(tot)
print(f'  ALL: mean {e.mean():.2f}  p95 {np.percentile(e.max(1), 95):.1f}')
