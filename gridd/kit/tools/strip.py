#!/usr/bin/env python3
"""Tira de fotogramas: python3 strip.py <dir> <out.png> <scale> t1 t2 ...  (elige el fotograma más cercano a cada t)"""
import sys, glob, os
from PIL import Image, ImageDraw
d, out, sc = sys.argv[1], sys.argv[2], float(sys.argv[3])
want = [float(x) for x in sys.argv[4:]]
files = sorted(glob.glob(os.path.join(d, 'f_*.png')))
ts = [float(os.path.basename(f)[2:-4]) for f in files]
tw, th = int(1080 * sc), int(1920 * sc)
sheet = Image.new('RGB', (len(want) * (tw + 6) + 6, th + 28), (40, 40, 44))
dr = ImageDraw.Draw(sheet)
for i, w in enumerate(want):
    j = min(range(len(ts)), key=lambda k: abs(ts[k] - w))
    im = Image.open(files[j]).convert('RGB').resize((tw, th), Image.LANCZOS)
    sheet.paste(im, (6 + i * (tw + 6), 22))
    dr.text((8 + i * (tw + 6), 4), '%.3f s' % ts[j], fill=(223, 255, 0))
sheet.save(out)
print(out, sheet.size)
