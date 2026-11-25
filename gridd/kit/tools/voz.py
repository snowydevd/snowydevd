#!/usr/bin/env python3
"""Locución → animación.
  python3 voz.py medir                 detecta las frases en las tomas, las asigna a cada línea del guion y escribe vo/durations.json
  python3 voz.py mezclar <cues.json>   arma vo/narracion.wav/.mp3 poniendo cada línea donde la línea de tiempo la espera
"""
import json, pathlib, subprocess, sys
import numpy as np
root = pathlib.Path(__file__).resolve().parent.parent
vo = root / 'vo'; SR = 44100
# guion: línea → frases (texto, cuántas palabras de subtítulo abarca). Las frases son los tramos que la voz separa con una pausa.
GUION = [
  ('q1',      [('¿Querés ser car spotter…', 4), ('y no tenés un mango?', 5)]),
  ('q2',      [('Armate de valor…', 3), ('y agarrala.', 2)]),
  ('job1',    [('Una changa.', 2)]),
  ('job2',    [('Otra changa.', 2)]),
  ('job3',    [('Y otra más.', 3)]),
  ('goal',    [('¡Mil dólares!', 2)]),
  ('buy',     [('Te alcanza justo para la cámara.', 6)]),
  ('q3',      [('¿Y a qué auto le vas a sacar la primera foto?', 11)]),
  ('nope',    [('Mmm…', 1), ('mejor no.', 2)]),
  ('gridd',   [('Tranqui.', 1), ('Usá Gridd.', 2)]),
  ('feed',    [('Todos los meets,', 3), ('en lista o en mapa.', 5)]),
  ('go',      [('Elegís uno,', 2), ('ves dónde y cuándo…', 4), ('y listo.', 2)]),
  ('crowd',   [('Pero ojo:', 2), ('ahí van', 2), ('todos los car spotters.', 4)]),
  ('own',     [('Así que armá el tuyo:', 5), ('publicá tu propio evento de barridos.', 6), ('Gratis.', 1)]),
  ('form',    [('Elegís ubicación,', 2), ('horario', 1), ('y subís un flyer.', 4)]),
  ('stories', [('Sale en la app…', 4), ('y todos los días en las historias de Instagram de Gridd.', 11)]),
  ('rambla',  [('Y ahora…', 2), ('los autos vienen a vos.', 5)]),
  ('logo',    [('Gridd.', 0), ('Descargá la app.', 0)]),       # toma aparte (cierre.mp3)
]
PRE, POST = 0.05, 0.18                                  # aire que se conserva antes y después de cada línea
def load(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(vo / 'dl' / name), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def chunks(x, min_sil=0.12, min_len=0.06, drop=32):
    hop = SR // 200; n = len(x) // hop
    db = 10 * np.log10((x[:n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12)
    sp = db > np.percentile(db, 95) - drop
    segs, i = [], 0
    while i < n:
        if sp[i]:
            j = i
            while j < n and sp[j]: j += 1
            if segs and (i - segs[-1][1]) * hop / SR < min_sil: segs[-1][1] = j
            else: segs.append([i, j])
            i = j
        else: i += 1
    return [(a * hop / SR, b * hop / SR) for a, b in segs if (b - a) * hop / SR > min_len]
def alinear(cs, frases):
    """Asigna tramos de voz consecutivos a cada frase del guion (programación dinámica): cada frase dura más o menos
    lo que dicen sus caracteres, y juntar tramos separados por un silencio largo cuesta caro."""
    N, M = len(cs), len(frases); chars = [len(f) for f in frases]
    r = sum(chars) / sum(b - a for a, b in cs)
    for _ in range(3):
        INF = 1e18; best = [[INF] * (N + 1) for _ in range(M + 1)]; back = [[0] * (N + 1) for _ in range(M + 1)]; best[0][0] = 0
        for j in range(1, M + 1):
            e = chars[j - 1] / r
            for i in range(j, N + 1):
                for k in range(j - 1, i):                       # la frase j usa los tramos k … i−1
                    if best[j - 1][k] >= INF: continue
                    dur = cs[i - 1][1] - cs[k][0]; gaps = sum((cs[q + 1][0] - cs[q][1]) ** 2 for q in range(k, i - 1))
                    c = best[j - 1][k] + (dur - e) ** 2 / e + 8 * gaps
                    if c < best[j][i]: best[j][i] = c; back[j][i] = k
        out, i = [], N
        for j in range(M, 0, -1): k = back[j][i]; out.append((cs[k][0], cs[i - 1][1])); i = k
        out.reverse(); r = sum(chars) / sum(b - a for a, b in out)
    return out, best[M][N], r
def medir():
    t1, t2 = load('toma1.mp3'), load('cierre.mp3')
    f1 = [t for k, f in GUION if k != 'logo' for t, _ in f] + ['Grid.', 'Sumate a la beta.']      # la toma 1 trae además el cierre viejo, que se descarta
    f2 = [t for t, _ in GUION[-1][1]]
    a1, c1, r1 = alinear(chunks(t1, min_sil=0.075), f1); a2, c2, r2 = alinear(chunks(t2, min_sil=0.075), f2)
    print('toma 1: %d tramos → %d frases · costo %.2f · %.1f car/s   |   cierre: costo %.2f · %.1f car/s\n' % (len(chunks(t1, min_sil=0.075)), len(f1), c1, r1, c2, r2))
    out, plan, i, bad = {}, {}, 0, []
    for k, frases in GUION:
        src, cs = ('cierre', a2) if k == 'logo' else ('toma1', a1[i:i + len(frases)])
        if k != 'logo': i += len(frases)
        t0, t1e = cs[0][0], cs[-1][1]
        out[k] = {'d': round(t1e - t0, 3), 'ph': [[round(a - t0, 3), round(b - t0, 3), n] for (a, b), (_, n) in zip(cs, frases)]}
        plan[k] = {'src': src, 't0': t0, 't1': t1e}
        prev = None
        for (a, b), (txt, _) in zip(cs, frases):
            rate = len(txt) / (b - a); flag = '' if 8.5 <= rate <= 22 else '   ← revisar'
            if flag: bad.append((k, txt, rate))
            print(f'{k:8s} {a:6.2f} → {b:6.2f}  {b - a:5.2f} s  {rate:5.1f} car/s  {txt}{flag}')
    (vo / 'durations.json').write_text(json.dumps(out, ensure_ascii=False, indent=1)); (vo / 'plan.json').write_text(json.dumps(plan, indent=1))
    print('\ncierre viejo descartado: %s' % [(round(a, 2), round(b, 2)) for a, b in a1[-2:]])
    print('total de voz: %.2f s · frases fuera de rango: %d' % (sum(v['d'] for v in out.values()), len(bad)))
def mezclar(cues_file):
    info = json.loads(pathlib.Path(cues_file).read_text()); plan = json.loads((vo / 'plan.json').read_text())
    src = {'toma1': load('toma1.mp3'), 'cierre': load('cierre.mp3')}
    rms = lambda x: np.sqrt((x ** 2).mean() + 1e-12)
    sp1 = np.concatenate([src['toma1'][int(p['t0'] * SR):int(p['t1'] * SR)] for k, p in plan.items() if p['src'] == 'toma1'])
    pc = plan['logo']; g2 = rms(sp1) / rms(src['cierre'][int(pc['t0'] * SR):int(pc['t1'] * SR)])      # el cierre, al mismo nivel que el resto
    out = np.zeros(int((info['dur'] + 0.6) * SR)); f = int(0.008 * SR); ramp = np.linspace(0, 1, f)
    for k, p in plan.items():
        a, b = max(0, int((p['t0'] - PRE) * SR)), int((p['t1'] + POST) * SR)
        clip = src[p['src']][a:b].copy() * (g2 if p['src'] == 'cierre' else 1.0); clip[:f] *= ramp; clip[-f:] *= ramp[::-1]
        at = int((info['cues'][k] - (p['t0'] - a / SR)) * SR); out[at:at + len(clip)] += clip
        print(f'{k:8s} entra en {info["cues"][k]:6.2f} s  (dura {p["t1"] - p["t0"]:.2f})')
    peak = np.abs(out).max(); out *= 10 ** (-1.5 / 20) / peak
    print('ganancia del cierre ×%.2f · normalizado a −1,5 dBFS (pico original %.2f)' % (g2, peak))
    wav, crudo = vo / 'narracion.wav', vo / 'narracion_cruda.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', str(crudo)], input=out.tobytes(), check=True)
    # terminación: se lleva a −15 LUFS (nivel cómodo para redes) con un limitador suave en −1,5 dBFS
    lufs = lambda f: float([l for l in subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(f), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr.splitlines() if l.strip().startswith('I:')][-1].split()[1])
    l0 = lufs(crudo); g = min(6.0, -15.0 - l0)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(crudo), '-af', f'volume={g:.2f}dB,alimiter=limit=0.841:attack=3:release=50:level=false', '-c:a', 'pcm_s16le', str(wav)], check=True)
    print('sonoridad: %.1f LUFS → %.1f LUFS (ganancia %+.1f dB con limitador)' % (l0, lufs(wav), g))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-c:a', 'libmp3lame', '-b:a', '128k', str(vo / 'narracion.mp3')], check=True)
    print(wav, '%.2f s' % (len(out) / SR))
if __name__ == '__main__':
    medir() if sys.argv[1] == 'medir' else mezclar(sys.argv[2])
