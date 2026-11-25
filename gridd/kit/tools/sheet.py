#!/usr/bin/env python3
"""Hoja de contactos: python3 sheet.py <dir> <out.png> [cols] [scale]"""
import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
sc = float(sys.argv[4]) if len(sys.argv) > 4 else 0.25
files = sorted(glob.glob(os.path.join(d, 'f_*.png')))
tw, th = int(1080 * sc), int(1920 * sc)
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 22) + 6), (40, 40, 44))
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
    x, y = 6 + (i % cols) * (tw + 6), 6 + (i // cols) * (th + 22)
    sheet.paste(im, (x, y + 16))
    dr.text((x + 2, y + 2), os.path.basename(f)[2:-4] + ' s', fill=(223, 255, 0))
sheet.save(out)
print(out, sheet.size)
