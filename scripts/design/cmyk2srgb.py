import sys
from PIL import Image, ImageCms
icc = sys.argv[1]
srgb = ImageCms.createProfile('sRGB')
for src in sys.argv[2:]:
    im = Image.open(src)
    print(src, im.mode, im.size)
    tr = ImageCms.buildTransform(ImageCms.ImageCmsProfile(icc), srgb, 'CMYK', 'RGB',
                                 renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC,
                                 flags=ImageCms.Flags.BLACKPOINTCOMPENSATION)
    out = ImageCms.applyTransform(im, tr)
    out.save(src.rsplit('.', 1)[0] + '_srgb.png')
