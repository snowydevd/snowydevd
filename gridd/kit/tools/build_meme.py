#!/usr/bin/env python3
"""Arma gridd-elegi-tu-personaje.html: une los módulos de src/meme (con //@@include recursivo, relativo a cada archivo),
   incrusta las fuentes y, si existe, la pista de audio (vo_meme/mezcla.mp3) y las duraciones medidas de la voz."""
import base64, pathlib, sys, re, json
root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src' / 'meme'
def load(path):
    s = path.read_text(encoding='utf-8')
    return re.sub(r'^//@@include (\S+)\s*$', lambda m: load((path.parent / m.group(1)).resolve()).rstrip('\n'), s, flags=re.M)
js = '\n'.join(load(p).rstrip('\n') + '\n' for p in sorted(src.glob('[0-9][0-9]_*.js')))
html = (src / 'shell.html').read_text(encoding='utf-8')
html = html.replace('/*__CSS__*/', (src / 'style.css').read_text(encoding='utf-8').rstrip('\n'))
html = html.replace('/*__JS__*/', js)
vd = root / 'vo_meme' / 'durations.json'
if vd.exists():
    d = json.loads(vd.read_text())
    html = html.replace('/*__VO_DUR__*/', 'Object.entries(' + json.dumps(d, ensure_ascii=False) + ').forEach(([k, v]) => { if (VO[k]) Object.assign(VO[k], typeof v === "number" ? { d: v } : v); });')
aud = root / 'vo_meme' / 'mezcla.mp3'
if aud.exists() and '--noaudio' not in sys.argv:
    html = html.replace('/*__VOZ__*/', 'data:audio/mpeg;base64,' + base64.b64encode(aud.read_bytes()).decode())
fdir = root / 'fonts'
for w in ('600', '900'):
    html = html.replace(f'__FONT_{w}__', base64.b64encode((fdir / f'barlow-condensed-latin-{w}-normal.woff2').read_bytes()).decode())
args = [a for a in sys.argv[1:] if not a.startswith('--')]
out = pathlib.Path(args[0] if args else str(root.parent / 'gridd-elegi-tu-personaje.html'))
out.parent.mkdir(parents=True, exist_ok=True); out.write_text(html, encoding='utf-8')
print(f'{out}  {len(html)/1024:.1f} KB')
