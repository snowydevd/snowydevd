#!/usr/bin/env python3
"""Arma gridd-car-spotter.html: une los módulos de src/npc, resuelve los //@@include e incrusta fuentes (y voz, si hay)."""
import base64, pathlib, sys, re, json
root = pathlib.Path(__file__).resolve().parent.parent
src = root / 'src' / 'npc'
def load(name):
    s = (src / name).read_text(encoding='utf-8')
    return re.sub(r'^//@@include (\S+)\s*$', lambda m: (src / m.group(1)).read_text(encoding='utf-8').rstrip('\n'), s, flags=re.M)
js = '\n'.join(load(p.name).rstrip('\n') + '\n' for p in sorted(src.glob('[0-9][0-9]_*.js')))
html = (src / 'shell.html').read_text(encoding='utf-8')
html = html.replace('/*__CSS__*/', (src / 'style.css').read_text(encoding='utf-8').rstrip('\n'))
html = html.replace('/*__JS__*/', js)
# duraciones medidas de la voz y pista incrustada (opcionales)
vd = root / 'vo' / 'durations.json'
if vd.exists():
    d = json.loads(vd.read_text())
    html = html.replace('/*__VO_DUR__*/', 'Object.entries(' + json.dumps(d, ensure_ascii=False) + ').forEach(([k, v]) => { if (VO[k]) Object.assign(VO[k], typeof v === "number" ? { d: v } : v); });')
voz = root / 'vo' / 'narracion.mp3'
if voz.exists() and '--novoz' not in sys.argv:
    html = html.replace('/*__VOZ__*/', 'data:audio/mpeg;base64,' + base64.b64encode(voz.read_bytes()).decode())
fdir = root / 'fonts'
for w in ('600', '900'):
    html = html.replace(f'__FONT_{w}__', base64.b64encode((fdir / f'barlow-condensed-latin-{w}-normal.woff2').read_bytes()).decode())
args = [a for a in sys.argv[1:] if not a.startswith('--')]
out = pathlib.Path(args[0] if args else str(root.parent / 'gridd-car-spotter.html'))
out.parent.mkdir(parents=True, exist_ok=True); out.write_text(html, encoding='utf-8')
print(f'{out}  {len(html)/1024:.1f} KB')
