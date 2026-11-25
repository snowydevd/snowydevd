#!/usr/bin/env python3
"""Arma gridd-reel.html: toma src/reel/reel.src.html e incrusta las fuentes en base64."""
import base64, pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'src' / 'reel' / 'reel.src.html').read_text(encoding='utf-8')
fdir = root / 'fonts'
for w in ('600', '900'):
    b64 = base64.b64encode((fdir / f'barlow-condensed-latin-{w}-normal.woff2').read_bytes()).decode()
    key = f'__FONT_{w}__'
    assert key in src, key
    src = src.replace(key, b64)
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else str(root.parent / 'gridd-reel.html'))
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(src, encoding='utf-8')
print(f'{out}  {len(src)/1024:.1f} KB')
