"""Locate each source photo inside a PDF page render.

Usage: python3 -I locate.py <links_png_dir> <page_png> <label>
Prints, for each photo: flip, scale (page px per source px), rotation, and the
page-space bounding box of the full source image, plus its offset.
"""
import sys, os, json
import cv2
import numpy as np

links, page_path, label = sys.argv[1:4]
SRC = {
    'hero-axe': 'Gemini_Generated_Image_ydnjjxydnjjxydnj.png',
    'burning-bar': 'Gemini_Generated_Image_seus1eseus1eseus.png',
    'couch': 'Gemini_Generated_Image_qp3tnvqp3tnvqp3t.png',
    'blindfold': 'Gemini_Generated_Image_pxi87apxi87apxi8.png',
    'product': '2 Unit Shot.png',
    'shredder': 'Gemini_Generated_Image_p77vkrp77vkrp77v.png',
    'anvil': 'Gemini_Generated_Image_n1b6otn1b6otn1b6.png',
}

page = cv2.imread(page_path)
page_g = cv2.cvtColor(page, cv2.COLOR_BGR2GRAY)
sift = cv2.SIFT_create(nfeatures=40000)
kp_p, des_p = sift.detectAndCompute(page_g, None)
matcher = cv2.BFMatcher(cv2.NORM_L2)
results = {}

for name, fname in SRC.items():
    src = cv2.imread(os.path.join(links, fname), cv2.IMREAD_UNCHANGED)
    if src.shape[2] == 4:  # composite transparent product over mid gray
        a = src[:, :, 3:4] / 255.0
        src = (src[:, :, :3] * a + 128 * (1 - a)).astype(np.uint8)
    # work at a size comparable to the page so features match
    k = 1600 / max(src.shape[:2])
    small = cv2.resize(src, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
    best = None
    for flip in (False, True):
        img = cv2.flip(small, 1) if flip else small
        g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        kp_s, des_s = sift.detectAndCompute(g, None)
        if des_s is None:
            continue
        m = matcher.knnMatch(des_s, des_p, k=2)
        good = [a for a, b in (x for x in m if len(x) == 2) if a.distance < 0.72 * b.distance]
        if len(good) < 8:
            continue
        sp = np.float32([kp_s[g_.queryIdx].pt for g_ in good])
        pp = np.float32([kp_p[g_.trainIdx].pt for g_ in good])
        M, inl = cv2.estimateAffinePartial2D(sp, pp, ransacReprojThreshold=4, maxIters=5000)
        if M is None:
            continue
        n = int(inl.sum())
        if best is None or n > best[0]:
            best = (n, flip, M, img.shape)
    if not best:
        print(name, 'NOT FOUND')
        continue
    n, flip, M, shp = best
    s = float(np.hypot(M[0, 0], M[1, 0]))
    rot = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
    h, w = shp[:2]
    corners = np.float32([[0, 0], [w, 0], [w, h], [0, h]]).reshape(-1, 1, 2)
    pc = cv2.transform(corners, M).reshape(-1, 2)
    x0, y0 = pc.min(0)
    x1, y1 = pc.max(0)
    # scale relative to the ORIGINAL full-res source
    s_full = s * k
    results[name] = dict(inliers=n, flip=flip, rot=round(rot, 2), scale_full=s_full,
                         page_box=[round(float(v), 1) for v in (x0, y0, x1, y1)],
                         M=M.tolist(), k=k)
    print(f"{name:12s} inl={n:4d} flip={flip!s:5s} rot={rot:6.2f} box=({x0:.0f},{y0:.0f})-({x1:.0f},{y1:.0f})")

json.dump(dict(page=page_path, size=page.shape[:2], results=results),
          open(os.path.join(os.path.dirname(page_path), f'locate_{label}.json'), 'w'), indent=1)
