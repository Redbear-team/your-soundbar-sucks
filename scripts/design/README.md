# Design pipeline

These scripts turn the final design PDF (`design/AUDIO_Cu_B2C_Sucks.pdf`) and the original photos from the Illustrator package's `Links` folder into the placed images in `public/images/{mobile,desktop}/` and the numbers in `src/art.ts` and `src/design.ts`.

The PDF pages are flattened CMYK images with no live text, so everything is measured from pixels. Units are PDF page pixels: the mobile page is 326 wide, the desktop page 603.

You need Python 3 with `opencv-python-headless`, `numpy`, `Pillow` and `psd-tools`. The photos (about 230 MB of PSD and JPG files) aren't committed.

| Script | What it does |
| --- | --- |
| `cmyk2srgb.py` | Converts the PDF's CMYK page images to sRGB with the document's U.S. Web Coated (SWOP) v2 profile. The profile is embedded in the Shutterstock PSD. |
| `locate.py` | Finds each source photo on a PDF page with SIFT feature matching. It gives scale, rotation, position and whether the photo is mirrored. The burning soundbar and the wood chipper are mirrored, and the product shot is rotated about 36°. |
| `gen.py` | Renders every photo into page space at 3 px per unit, clipped to its section. It keeps the photo opaque except where it overlaps another photo or meets an inner edge. There a feathered content mask lets layers blend. It prints the placement JSON used for `src/art.ts`. |
| `textlines.py` | Lists white and gold text lines (box, width) on a page render. |
| `fit.py` | Fits Figtree font sizes to measured line widths. These gave the type scale in `src/design.ts`. |

## Typical run

1. Extract the PDF pages as CMYK TIFFs:

```bash
pdfimages -tiff design/AUDIO_Cu_B2C_Sucks.pdf raw
```

2. Convert the pages to sRGB:

```bash
python3 -I scripts/design/cmyk2srgb.py cmyk.icc raw-001.tif raw-002.tif
```

3. Crop each converted page to its content: mobile is x 71–397, desktop starts at x 0. Save the crops as `raw-001_page.png` and `raw-002_page.png`.

4. Composite each PSD from `Links` to PNG (psd-tools), then locate the photos on both pages:

```bash
python3 -I scripts/design/locate.py <links_png_dir> raw-001_page.png mobile
```

```bash
python3 -I scripts/design/locate.py <links_png_dir> raw-002_page.png desktop
```

5. Render the placed images:

```bash
python3 -I scripts/design/gen.py <links_png_dir> locate_mobile.json locate_desktop.json public/images <preview_dir>
```
