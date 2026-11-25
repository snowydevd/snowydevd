#!/usr/bin/env python3
"""Pista de audio de «ELEGÍ TU PERSONAJE»: efectos + música chiptune original, puestos en los tiempos exactos de la animación.
   python3 sfx_meme.py → vo_meme/sfx.wav · vo_meme/musica.wav · vo_meme/mezcla.wav/.mp3 · gridd-elegi-tu-personaje-efectos-tiempos.txt
   Todo sintetizado (osciladores y ruido filtrado): no hay grabaciones ni música de terceros."""
import json, pathlib, subprocess, sys
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from synth import *

root = pathlib.Path(__file__).resolve().parent.parent
vo = root / 'vo_meme'; vo.mkdir(exist_ok=True); (root / 'out').mkdir(exist_ok=True)
ev = json.loads((vo / 'eventos.json').read_text())
T, D, X, DUR = ev['T'], ev['D'], ev['X'], ev['DUR']
R1, R2, R4, R5, HOPS, TE = X['R1'], X['R2'], X['R4'], X['R5'], X['HOPS'], X['TE']
N = int((DUR + 0.8) * SR)
fx = np.zeros((N, 2)); CUES = []
SCN, XS = ['s1', 's2', 's3', 's4', 's5'], ['x1', 'x2', 'x3', 'x4', 'x5']

def put(x, t, db=0.0, pan=0.0, name=None, buf=None):
    buf = fx if buf is None else buf
    if name: CUES.append((round(t, 2), name))
    i = int(round(t * SR))
    if i >= len(buf) or i + len(x) <= 0: return
    g = 10 ** (db / 20)
    if x.ndim == 1: a = (pan + 1) * np.pi / 4; x = np.stack([x * np.cos(a), x * np.sin(a)], 1)
    x = x * g
    if i < 0: x = x[-i:]; i = 0
    x = x[:len(buf) - i]; buf[i:i + len(x)] += x
def stereo_bed(y, a=0.3, r=0.3):
    y = y.copy(); na, nr = n_(a), n_(r); y[:na] *= np.linspace(0, 1, na)[:, None]; y[-nr:] *= np.linspace(1, 0, nr)[:, None]; return y
rms_db = lambda y, target: 10 ** (target / 20) / (np.sqrt((y ** 2).mean()) + 1e-12)

# ══ INTRO: título, casilleros, cursor ════════════════════════════════════════════════════
put(sweep(0.35, 300, 3000), 0.0, -18, 0, 'whoosh: entra el título')
put(thud(0.35, 120, 45, 0.35), 0.24, -8, 0, 'golpe: «ELEGÍ TU»')
put(boom808(0.9, 110, 44), 0.42, -9, 0, 'golpe grave: «PERSONAJE»')
for i in range(6): put(blip(500 + 90 * i, 900 + 140 * i, 0.06, duty=0.5), 0.58 + i * 0.07, -21, -0.5 + 0.2 * i, 'casilleros que aparecen' if i == 0 else None)
put(blip(1400, 1400, 0.05, duty=0.5), 1.02, -20, 0, 'aparece el cursor P1')
for k, (dt, i) in enumerate(HOPS): put(blip(900, 900, 0.045, duty=0.5), dt, -20, -0.4 if i % 2 == 0 else 0.4, 'cursor: salta de casillero en casillero' if k == 0 else None)
# selección, zoom de entrada y placa de cada personaje
for i in range(5):
    s, x = T[SCN[i]], T[XS[i]]
    put(chip_seq([NOTE('C5'), NOTE('E5'), NOTE('G5'), NOTE('C6')], 0.045, 0.25, 0.25), s, -14, 0, f'«¡seleccionado!» (personaje {i + 1})')
    put(sweep(0.4, 400, 5000, 2.2), s + 0.12, -16, 0, 'whoosh: el casillero llena la pantalla' if i == 0 else None)
    put(sweep(0.3, 2500, 500), s + 0.42, -20, -0.5, 'entra la placa del personaje' if i == 0 else None)
    put(thud(0.18, 200, 90, 0.2), s + 0.55, -18, 0)
    st = [[10, 0], [10, 2], [10, 0], [10, 0], [0, 10]][i]
    for j, v in enumerate(st):
        t0 = s + 0.42 + 0.45 + j * 0.18
        if v > 0: put(ticks(v, 0.36 * v / 10, 1500, jitter=0.05, rise=0.8), t0, -24, 0.3)
        else: put(bwomp(), t0 + 0.38, -17, 0.3, 'barra en 0: «bwomp»' if i == 0 else None)
    put(sweep(0.28, 4000, 400), x - 0.02, -18, 0, 'whoosh: vuelve a la grilla' if i == 0 else None)
    put(blip(900, 900, 0.045, duty=0.5), x + 0.27, -20, 0.3)
    put(blip(1400, 1900, 0.06, duty=0.5), x + 0.44, -21, 0.3)

# ══ 1 · EL QUE ACELERA PARADO ═══════════════════════════════════════════════════════════
g = T['g1']
put(idle(R1['stall'] + 0.8), T['s1'] + 0.5 - 0.0, -24, 0.1, 'motor regulando')
for k, r in enumerate(R1['revs']):
    put(rev([0.55, 0.65, 0.95][k], 34, [95, 120, 165][k], up=[0.10, 0.12, 0.16][k], crackle=[0.6, 1.0, 2.0][k]), g + r - 0.04, [-11, -9, -5][k], 0.15, ['acelerón 1: BRAP', 'acelerón 2: BRAAAP', 'acelerón 3: BRRRRAAAAP'][k])
put(boom808(1.0, 100, 40, 2.6), g + R1['revs'][2], -10, 0, 'golpe del «impact frame»')
put(sweep(0.5, 600, 3200), g + R1['revs'][2] + 0.05, -20, 0.5, 'se le vuela el gorro al de al lado')
put(stall(), g + R1['stall'] - 0.3, -9, -0.2, 'se le apaga el auto (PLOF)')
put(chirp_lock(), g + R1['alarm'] - 0.06, -20, -0.1)
al = car_alarm(T['x1'] + D['x1'] - (g + R1['alarm']) + 0.2)
put(al, g + R1['alarm'], -14, -0.15, 'alarma del auto (UIU UIU) que no puede apagar')
for k, q in enumerate(R1['clicks']): put(tick(2800, 0.004, 0.03, 0.4), g + q, -16, -0.2, 'clics del llavero' if k == 0 else None)
put(boom808(1.2, 120, 46), T['p1'], -8, 0, 'golpe grave: zoom a la cara (siempre hay uno)')

# ══ 2 · EL AUTO DE LA VIEJA ════════════════════════════════════════════════════════════
g = T['g2']
put(sparkles(0.5, 7), T['s2'] + 0.6, -22, 0.5, 'destellos de «facha»')
w = bed(R2['ring'] + 0.8, 600, 2600, lfo=(0.6, 0.3), depth=0.3, howl=0.2); put(stereo_bed(w * rms_db(w, -32), 0.3, 0.2), T['s2'] + 0.5, 0, name='viento de la pose')
put(sweep(0.25, 800, 5000), g + R2['zIn'] - 0.1, -16, 0, 'zoom a la luneta')
put(bell(2349, 0.6, 0.18), g + R2['zIn'], -17, 0, '«ding»: BEBÉ A BORDO')
for k in range(3): put(boing(0.32, 300, 560), g + R2['zIn'] + 0.12 + k * 0.16, -21, 0.4, 'perrito que mueve la cabeza' if k == 0 else None)
put(record_scratch(), g + R2['frz'][0] - 0.02, -8, 0, 'RECORD SCRATCH: cuadro congelado')
for k in range(2): put(phone_ring(0.3), g + R2['ring'] + 0.06 + k * 0.42, -14, -0.4, 'le suena el teléfono: MAMÁ' if k == 0 else None)
put(tick(1800, 0.005, 0.03), g + R2['answer'], -18, -0.2, 'atiende')
put(gibberish(0.62, f0=320, rate=10, angry=1.2, phone=True, seed=5), g + R2['yell'], -10, -0.2, 'la mamá enojada (voz ininteligible): ¿DÓNDE ESTÁ EL AUTO?')
put(sweep(0.25, 500, 3000), g + R2['dash'], -16, 0.3, 'se mete en el auto de un salto')
put(peel_out(0.9), g + R2['go'], -9, 0.5, 'arranca chirriando gomas (FIUUUM)')
put(tick(3400, 0.004, 0.03, 0.4), g + R2['go'] + 0.22 + 0.35, -18, -0.4, 'el cartelito cae al piso')
put(sweep(0.3, 2000, 500), T['p2'] + 0.02, -22, 0, 'entra «NACIDO PARA»')
put(stamp(), T['p2'] + 0.75, -9, 0, 'golpe: «OBLIGADO A: DEVOLVERLO CON NAFTA»')
put(sad_trombone(), T['p2'] + 0.85, -12, 0, 'trombón triste: wa wa wa waaa')

# ══ 3 · EL QUE TE EXPLICA TODO ═════════════════════════════════════════════════════════
put(babble_male(T['p3'] - (T['s3'] + 0.5) + 0.1), T['s3'] + 0.5, -17, -0.2, 'habla y habla (voz ininteligible)')
put(sweep(0.3, 300, 4000), T['p3'] - 0.05, -12, 0, 'whoosh: placa «3 HORAS DESPUÉS…»')
put(clock_ticks(D['p3'] - 0.1), T['p3'] + 0.05, -16, 0, 'tic-tac que se acelera')
put(bell(1568, 0.8, 0.3, 0.3), T['q3'] - 0.12, -16, 0, '«ding»: pasaron tres horas')
nw = bed(D['q3'] + D['x3'], 140, 700, depth=0.6, howl=0.5); put(stereo_bed(nw * rms_db(nw, -30), 0.4, 0.3), T['q3'], 0, name='viento de noche')
put(fly(D['q3'] + 0.2), T['q3'] + 0.1, -22, name='mosca')
put(babble_male(D['q3'] - 0.1, seed=9), T['q3'] + 0.05, -18, -0.2, 'sigue hablando')

# ══ 4 · EL FOTÓGRAFO ═══════════════════════════════════════════════════════════════════
g = T['g4']
put(sweep(0.36, 400, 2600), g + R4['dive'][0], -14, 0.2, 'se tira al piso')
put(thud(0.3, 110, 50, 0.3), g + R4['dive'][1], -8, 0.1, 'PUF: cae al piso')
for k, q in enumerate(R4['clicks']): put(shutter(), g + q, -11, -0.3, 'CLIC: saca fotos' if k == 0 else None)
for k, q in enumerate(X['steps4']):
    over = 380 < (1280 - 1560 * (q - R4['walk'][0]) / (R4['walk'][1] - R4['walk'][0])) < 1000
    put(footstep(), g + q, -16 if not over else -14, 0.6 - 1.2 * (q - R4['walk'][0]) / (R4['walk'][1] - R4['walk'][0]), 'uno le pasa por arriba caminando' if k == 0 else None)
put(whistle_fall(0.24), g + R4['cone'], -18, 0.1, 'cae el cono')
put(plastic_thunk(), g + R4['cone'] + 0.24, -10, 0.1, 'TOC: el cono en la espalda')
put(boing(0.4, 200, 420), g + R4['sign'], -14, 0.5, 'BOING: aparece el cartel LOMO DE BURRO')
put(boing(0.5, 160, 600), T['p4'], -12, 0, 'se levanta de un salto')
put(chip_seq([NOTE('G5'), NOTE('C6'), NOTE('E6'), NOTE('G6')], 0.06, 0.45, 0.25), T['p4'] + 0.35, -14, 0, '«ta-da»: muestra la foto')
put(sparkles(0.4, 8), T['p4'] + 0.4, -20, 0)

# ══ 5 · EL QUE LLEGA TARDE ═════════════════════════════════════════════════════════════
amb_d = T['x5'] + D['x5'] - T['s5'] + 0.2
cw = bed(amb_d, 200, 1100, depth=0.5, howl=0.3); put(stereo_bed(cw * rms_db(cw, -31), 0.5, 0.3), T['s5'] + 0.2, 0, name='estacionamiento vacío: viento')
put(crickets(amb_d), T['s5'] + 0.4, -22, 0.35, 'grillos')
for k, q in enumerate(X['steps5']): put(footstep(), T['g5'] + q, -17, -0.4 + 0.08 * k, 'llega caminando' if k == 0 else None)
put(rustle(1.1), T['g5'] + 0.85, -22, 0, 'pasa el cardo')
put(blip(700, 1100, 0.08), T['g5'] + R5['ask'], -20, 0.1, 'globo: ¿Y? ¿ARRANCÓ?')
put(boom808(1.1, 110, 44), T['p5'] + 0.2, -9, 0, 'golpe grave: «la juntada era ayer» (zoom)')
put(slurp(0.6), T['p5'] + R5['sip'][0] + 0.1, -12, 0.1, 'SLURP: sorbo de mate')
put(notif(), T['q5'] + 0.1, -13, 0, 'aparece el evento en Gridd: ya pasó')
put(slurp(0.55), T['q5'] + R5['sip2'] + 0.08, -12, 0.1, 'SLURP: otro sorbo')

# ══ CIERRE ═════════════════════════════════════════════════════════════════════════════
put(stamp(), T['lock'] + 0.3, -8, 0.3, 'BLOQUEADO')
put(buzz_err(0.4), T['lock'] + 0.3, -15, 0.3)
put(thud(0.3, 140, 50, 0.3), T['lock'] + 0.15, -14, 0, '«¿Y VOS?»'); put(boom808(0.9, 110, 44), T['lock'] + 0.45, -12, 0, '«¿CUÁL SOS?»')
put(metal(0.4, 1900, tau=0.08, strike=0.7), T['fin'] + 0.25, -14, 0.3, 'se rompe el candado')
put(gliss_up(0.4, 400, 1800), T['fin'] + 0.25, -15, 0.3, 'power-up: se desbloquea')
put(sweep(0.4, 400, 5000), TE['grow'] - 0.04, -14, 0, 'whoosh: el casillero llena la pantalla')
put(thud(0.35, 140, 52, 0.25), TE['tB'], -10, 0, 'cae la barra del logo')
put(sweep(0.32, 500, 3600), TE['t0'] - 0.1, -15, 0, 'salen las letras GR|DD')
put(boom808(1.4, 110, 42), TE['t0'] + 0.2, -9, 0, 'las letras se asientan')
put(stamp(), TE['tC'], -12, 0, 'placa DESCARGÁ LA APP')
put(ticks(9, 0.3, 3000), TE['tU'], -24, 0, 'tecleo: gridd.app')

# ══ MÚSICA: chiptune original, 125 BPM, La menor (Am–F–C–G) ══════════════════════════════
BPM = 125; beat = 60 / BPM; e8 = beat / 2
CH = [('A', ['A4', 'C5', 'E5'], 'A2'), ('F', ['F4', 'A4', 'C5'], 'F2'), ('C', ['E4', 'G4', 'C5'], 'C3'), ('G', ['D4', 'G4', 'B4'], 'G2')]
MEL = [['E5', '-', 'A5', '-', 'C6', 'B5', 'A5', 'E5'], ['F5', '-', 'A5', '-', 'C6', 'A5', 'F5', 'C5'], ['E5', '-', 'G5', '-', 'C6', 'G5', 'E5', 'C5'], ['D5', '-', 'G5', '-', 'B5', 'A5', 'G5', 'D5'],
       ['A5', '-', 'C6', '-', 'E6', 'D6', 'C6', 'A5'], ['A5', '-', 'C6', '-', 'F6', 'E6', 'C6', 'A5'], ['G5', '-', 'C6', '-', 'E6', 'D6', 'C6', 'G5'], ['B5', '-', 'D6', '-', 'G6', 'D6', 'B5', 'G5']]
bars = 8; L = int(round(bars * 4 * beat * SR)); mel = np.zeros(L); bas = np.zeros(L); stb = np.zeros(L); kick = np.zeros(L); snr = np.zeros(L); hat = np.zeros(L)
def addn(buf, x, t): i = int(round(t * SR)); buf[i:i + len(x)] += x[:max(0, len(buf) - i)]
def tone(f, d, kind='pulse', duty=0.25, rel=0.03, sus=0.7):
    t = tt(d); p = 2 * np.pi * f * t; w = lp(square(p, duty), 5200) if kind == 'pulse' else tri(p)
    env = np.where(t < 0.01, t / 0.01, sus + (1 - sus) * np.exp(-(t - 0.01) / 0.05)); return fade(w * env, 0.002, rel)
for b in range(bars):
    t0 = b * 4 * beat; ch = CH[b % 4]; notes = MEL[b]
    k = 0
    while k < 8:
        nm = notes[k]; j = k + 1
        while j < 8 and notes[j] == '-': j += 1
        if nm != '-': addn(mel, tone(NOTE(nm), (j - k) * e8 * 0.92, 'pulse', 0.25), t0 + k * e8)
        k = j
    rootf = NOTE(ch[2])
    for q in range(8): addn(bas, tone(rootf * (2 if q % 2 else 1), e8 * 0.9, 'tri', rel=0.02, sus=0.85), t0 + q * e8)
    for q in range(4):
        for nm in ch[1]: addn(stb, tone(NOTE(nm), 0.09, 'pulse', 0.5, rel=0.02, sus=0.4), t0 + q * beat + e8)
    for q in (0, 2): addn(kick, thud(0.16, 150, 45, 0.15, 0.05), t0 + q * beat)
    if b % 2: addn(kick, thud(0.16, 150, 45, 0.15, 0.05), t0 + 1.5 * beat)
    for q in (1, 3):
        dd = 0.13; s = bp(noise(dd), 1200, 7000) * np.exp(-tt(dd) / 0.04) + 0.6 * np.sin(2 * np.pi * 190 * tt(dd)) * np.exp(-tt(dd) / 0.03); addn(snr, fade(s, 0.001, 0.02), t0 + q * beat)
    for q in range(8): dd = 0.03; s = hp(noise(dd), 7000) * np.exp(-tt(dd) / 0.008); addn(hat, s * (1 if q % 2 else 0.55), t0 + q * e8)
nr = lambda x: x / (np.abs(x).max() + 1e-12)
loopm = 0.34 * nr(mel) + 0.42 * nr(bas) + 0.10 * nr(stb) + 0.50 * nr(kick) + 0.30 * nr(snr) + 0.10 * nr(hat)
loopm = np.tanh(1.2 * loopm) / np.tanh(1.2)
loopS = np.stack([loopm * 0.95 + 0.05 * nr(stb) * 0.1, loopm * 0.95 + 0.05 * nr(mel) * 0.1], 1)
def music_section(t_in, t_out, end='cut'):
    d = t_out - t_in; reps = int(np.ceil(d * SR / L)) + 1; y = np.concatenate([loopS] * reps)[:n_(d)].copy()
    if end == 'tape':                                     # «tape stop»: la música se frena como un casete (cuando se le apaga el auto)
        k = n_(0.45); seg = y[-k:]; u = np.linspace(0, 1, k); pos = np.cumsum(1 - u) ; pos = pos / pos[-1] * (k * 0.5)
        y[-k:] = np.stack([np.interp(pos, np.arange(k), seg[:, c]) for c in range(2)], 1) * (1 - u[:, None] ** 2)
    elif end == 'fade': k = n_(0.35); y[-k:] *= np.linspace(1, 0, k)[:, None]
    else: k = n_(0.015); y[-k:] *= np.linspace(1, 0, k)[:, None]
    y[:n_(0.01)] *= np.linspace(0, 1, n_(0.01))[:, None]
    return y
mus = np.zeros((N, 2))
SECS = [(0.18, T['g1'] + R1['stall'] + 0.1, 'tape', 'música: pantalla de selección'), (T['x1'] + 0.02, T['g2'] + R2['frz'][0], 'cut', 'música vuelve con la grilla (se corta con el record scratch)'),
        (T['x2'] + 0.02, T['p3'], 'cut', 'música vuelve (se corta con la placa de las tres horas)'), (T['x3'] + 0.02, T['s5'] + 0.45, 'fade', 'música vuelve (se apaga en el estacionamiento vacío)'),
        (T['x5'] + 0.02, TE['t0'] + 0.2, 'cut', 'música vuelve hasta el logo')]
for a, b, e, nm in SECS: put(music_section(a, b, e), a, 0, name=nm, buf=mus)
fin = np.zeros(n_(2.5)); ft = tt(2.5)                    # acorde final cuando se asienta el logo
for nm in ['A3', 'E4', 'A4', 'C5', 'E5']: fin += lp(square(2 * np.pi * NOTE(nm) * ft, 0.5), 3000) * np.exp(-ft / 0.9)
fin += 1.2 * thud(2.5, 140, 45, 0.3, 0.3)
put(nr(fade(fin, 0.002, 0.3)), TE['t0'] + 0.2, -6, 0, 'acorde final', buf=mus)

# ══ MEZCLA ═════════════════════════════════════════════════════════════════════════════
def write(path, y): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', str(path)], input=np.ascontiguousarray(y).tobytes(), check=True)
def softclip(y, lim): return np.where(np.abs(y) > lim * 0.75, np.sign(y) * (lim * 0.75 + lim * 0.25 * np.tanh((np.abs(y) - lim * 0.75) / (lim * 0.25))), y)
env = np.abs(fx).max(axis=1); hop = 480; blk = np.array([env[i:i + hop].max() for i in range(0, N, hop)]); e = 0.0; ed = np.empty(len(blk))
for i, b in enumerate(blk): e = b + (e - b) * (0.5 if b > e else 0.93); ed[i] = e
duck = np.repeat(10 ** (-8 * np.clip(ed / 0.25, 0, 1) / 20), hop)[:N]              # la música baja bajo los golpes (los efectos son el chiste)
MUS = 10 ** (-18 / 20)
out = fx + MUS * mus * duck[:, None]
out[:n_(0.05)] *= np.linspace(0, 1, n_(0.05))[:, None]; out[-n_(0.4):] *= np.linspace(1, 0, n_(0.4))[:, None]
write(vo / 'sfx.wav', softclip(fx, 10 ** (-1 / 20))); write(vo / 'musica.wav', softclip(MUS * mus, 10 ** (-1 / 20)))
crudo = vo / 'mezcla_cruda.wav'; write(crudo, softclip(out, 10 ** (-0.5 / 20)))
lufs = lambda f: float([l for l in subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(f), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr.splitlines() if l.strip().startswith('I:')][-1].split()[1])
l0 = lufs(crudo); g_db = max(-12.0, min(10.0, -14.0 - l0))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(crudo), '-af', f'volume={g_db:.2f}dB,alimiter=limit=0.841:attack=3:release=60:level=false', '-c:a', 'pcm_s16le', str(vo / 'mezcla.wav')], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(vo / 'mezcla.wav'), '-c:a', 'libmp3lame', '-b:a', '160k', str(vo / 'mezcla.mp3')], check=True)
CUES.sort()
mmss = lambda t: '%d:%05.2f' % (int(t // 60), t % 60)
(root / 'out' / 'gridd-elegi-tu-personaje-efectos-tiempos.txt').write_text('GRIDD · «ELEGÍ TU PERSONAJE» · dónde va cada efecto (min:seg desde el inicio del video)\n' + '─' * 96 + '\n' + '\n'.join('%s   %s' % (mmss(t), n) for t, n in CUES) + '\n', encoding='utf-8')
print('eventos: %d · mezcla: %.1f LUFS → %.1f LUFS (ganancia %+.1f dB) · pico fx %.1f dBFS' % (len(CUES), l0, lufs(vo / 'mezcla.wav'), g_db, 20 * np.log10(np.abs(fx).max() + 1e-12)))
