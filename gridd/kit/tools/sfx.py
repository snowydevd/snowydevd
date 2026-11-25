#!/usr/bin/env python3
"""Efectos de sonido sintetizados para «De NPC a car spotter», puestos en los tiempos exactos de la animación.
   python3 sfx.py      → vo/sfx.wav (pista estéreo sólo de efectos) · vo/mezcla.wav (voz + efectos) · vo/sfx_cues.json (lista de eventos)
   Todo se genera con osciladores y ruido filtrado: no usa grabaciones de terceros (no hay licencias que revisar)."""
import json, pathlib, subprocess
import numpy as np
from scipy.signal import butter, sosfilt

root = pathlib.Path(__file__).resolve().parent.parent
vo = root / 'vo'; SR = 48000
ev = json.loads((vo / 'eventos.json').read_text())
T, D, X, DUR = ev['T'], ev['D'], ev['X'], ev['DUR']; TP, TJ = X['TP'], X['TJ']
rng = np.random.default_rng(11)
N = int((DUR + 0.6) * SR)
mix = np.zeros((N, 2)); CUES = []

# ── utilidades ──────────────────────────────────────────────────────────────────────────
n_ = lambda d: max(1, int(round(d * SR)))
tt = lambda d: np.arange(n_(d)) / SR
noise = lambda d: rng.standard_normal(n_(d))
def filt(x, kind, fc, order=2): return sosfilt(butter(order, np.asarray(fc, float) / (SR / 2), kind, output='sos'), x)
lp = lambda x, f, o=2: filt(x, 'low', f, o)
hp = lambda x, f, o=2: filt(x, 'high', f, o)
bp = lambda x, a, b, o=2: filt(x, 'band', [a, b], o)
def norm(x): m = np.abs(x).max(); return x / m if m > 0 else x
def fade(x, a=0.003, r=0.008):
    x = x.copy(); na, nr = min(len(x) // 2, n_(a)), min(len(x) // 2, n_(r))
    x[:na] *= np.linspace(0, 1, na); x[-nr:] *= np.linspace(1, 0, nr); return x
def ph(freq): return 2 * np.pi * np.cumsum(freq) / SR                     # fase a partir de una frecuencia que cambia
def glide(d, f0, f1, tau=None):                                           # frecuencia que va de f0 a f1 (exponencial, o con constante de tiempo)
    t = tt(d); return f1 + (f0 - f1) * np.exp(-t / tau) if tau else f0 * (f1 / f0) ** (t / max(d, 1e-6))
def put(x, t, db=0.0, pan=0.0, name=None):
    """Suma un sonido (mono, o estéreo ya paneado) en el segundo t. db = pico en dBFS (un mono al centro queda 3 dB más bajo por canal)."""
    if name: CUES.append((round(t, 2), name))
    i = int(round(t * SR))
    if i >= N or i + len(x) <= 0: return
    g = 10 ** (db / 20)
    if x.ndim == 1: a = (pan + 1) * np.pi / 4; x = np.stack([x * np.cos(a), x * np.sin(a)], 1)
    x = x * g
    if i < 0: x = x[-i:]; i = 0
    x = x[:N - i]; mix[i:i + len(x)] += x

# ── generadores ─────────────────────────────────────────────────────────────────────────
def sweep(d, f0, f1, q=2.5, shape=1.0):                                   # ruido con pasabanda que barre (filtro de estado variable)
    x = noise(d); n = len(x); f = np.minimum(f0 * (f1 / f0) ** (np.arange(n) / n), SR / 6.5)
    g = 2 * np.sin(np.pi * f / SR); k = 1 / q; lo = bd = 0.0; out = np.empty(n)
    for i in range(n):
        hi = x[i] - lo - k * bd; bd += g[i] * hi; lo += g[i] * bd; out[i] = bd
    return norm(out * np.sin(np.pi * np.arange(n) / n) ** (2 * shape))
whoosh = sweep
def thud(d=0.25, f0=130, f1=48, click=0.25, tau=None):
    t = tt(d); y = np.sin(ph(glide(d, f0, f1, 0.03))) * np.exp(-t / (tau or d / 4.5)) + click * lp(noise(d), 1800) * np.exp(-t / 0.005)
    return norm(fade(y, 0.001, 0.02))
def metal(d, f, ratios=(1, 2.76, 5.40, 8.93), amps=(1, 0.6, 0.4, 0.25), tau=0.25, strike=0.5, trem=0.0):
    t = tt(d); y = sum(a * np.sin(2 * np.pi * f * r * t + rng.uniform(0, 6.28)) * np.exp(-t / (tau / (1 + 0.55 * k))) for k, (r, a) in enumerate(zip(ratios, amps)))
    y = y + strike * bp(noise(d), 1500, 7000) * np.exp(-t / 0.004)
    if trem: y = y * (1 + trem * np.exp(-t * 6) * np.cos(2 * np.pi * 4.5 * t))
    return norm(fade(y, 0.0005, 0.02))
def bell(f, d=0.5, tau=0.16, bright=0.35):
    t = tt(d); y = np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / (tau * 0.6)) + 0.4 * bright * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t / (tau * 0.4))
    return norm(fade(y * np.exp(-t / tau), 0.002, 0.02))
def tick(f=3200, tau=0.004, d=0.03, air=0.3):
    t = tt(d); return norm(fade(np.sin(2 * np.pi * f * t) * np.exp(-t / tau) + air * hp(noise(d), 4000) * np.exp(-t / 0.002), 0.0003, 0.004))
def blip(f0, f1, d=0.07, tau=None):
    t = tt(d); return norm(fade(np.sin(ph(glide(d, f0, f1))) * np.exp(-t / (tau or d / 3)), 0.002, 0.01))
def tap(): return norm(np.pad(tick(1500, 0.006, 0.04, 0.15), (0, n_(0.03))) + 0.7 * thud(0.07, 320, 170, 0.0, 0.015))
def shutter():
    y = np.zeros(n_(0.16)); a = bp(noise(0.02), 1800, 6500) * np.exp(-tt(0.02) / 0.004); b = bp(noise(0.035), 900, 5000) * np.exp(-tt(0.035) / 0.008)
    y[:len(a)] += a; i = n_(0.052); y[i:i + len(b)] += 0.9 * b; m = thud(0.06, 190, 120, 0, 0.012); y[i:i + len(m)] += 0.35 * m
    return norm(y)
def car_pass(d=1.7, f0=160, w=0.13, harm=9, rough=1.8, air=0.55):          # motor (armónicos con Doppler) + ruido de rodadura; devuelve estéreo izq → der
    t = tt(d); u = (t - d / 2) / w
    freq = f0 * (1 + 0.11 * -np.tanh(u * 0.8)) * (1 + 0.012 * np.sin(2 * np.pi * 27 * t))
    p = ph(freq); eng = sum(np.sin(h * p + rng.uniform(0, 6.28)) / h ** 0.85 for h in range(1, harm + 1)) + 0.6 * np.sin(0.5 * p)
    eng = lp(np.tanh(rough * eng / np.abs(eng).max()), 3200)
    amp = (1 / (1 + u * u)) ** 0.8
    y = (eng + air * bp(noise(d), 500, 3800) * (1 / (1 + u * u)) ** 0.4) * amp
    y = norm(fade(y, 0.15, 0.25)); pan = np.clip(u * 0.55, -0.85, 0.85); a = (pan + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)], 1)
def sputter(d, rate=10.5):                                                # motor de cachila: explosiones irregulares, con fallas, que se va apagando
    y = np.zeros(n_(d)); t = 0.0
    while t < d - 0.12:
        k = t / d; gap = (1 / rate) * (1 + 0.25 * rng.uniform(-1, 1)) * (1 + 2.2 * max(0, k - 0.72) / 0.28)
        if rng.uniform() > 0.18:
            pd = 0.09; q = tt(pd); pulse = lp(noise(pd), 650) * np.exp(-q / 0.018) + 0.9 * np.sin(2 * np.pi * rng.uniform(58, 74) * q) * np.exp(-q / 0.028)
            i = n_(t); y[i:i + len(pulse)] += pulse[:len(y) - i] * rng.uniform(0.6, 1.0) * min(1, k / 0.35 + 0.25) * (1 - max(0, k - 0.8) / 0.2 * 0.6)
        if rng.uniform() < 0.35:                                         # chapas que tiemblan
            r = bp(noise(0.02), 2200, 5200) * np.exp(-tt(0.02) / 0.004); i = n_(t + rng.uniform(0, gap)); y[i:i + len(r)] += 0.28 * r[:max(0, len(y) - i)]
        t += gap
    return norm(y)
def backfire():
    d = 0.55; t = tt(d); y = bp(noise(d), 250, 6000) * np.exp(-t / 0.012) + 1.1 * np.sin(ph(40 + 95 * np.exp(-t / 0.05))) * np.exp(-t / 0.11) + 0.3 * lp(noise(d), 1200) * np.exp(-t / 0.09)
    return norm(fade(y, 0.0005, 0.05))
def hubroll(d):                                                           # taza rodando: un aro que suena y bambolea cada vez más rápido
    t = tt(d); ring = sum(a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) for f, a in ((1650, 1), (2480, 0.6), (3900, 0.35)))
    am = 0.35 + 0.65 * np.sin(ph(5 + 15 * (t / d) ** 2)) ** 2
    y = (ring * am + 0.25 * bp(noise(d), 2000, 6000)) * np.minimum(1, t / 0.05) * (1 - 0.5 * t / d)
    return norm(fade(y, 0.01, 0.05))
def clatter():                                                            # la taza se asienta: golpecitos cada vez más seguidos
    y = np.zeros(n_(0.42))
    for k, (t0, a) in enumerate(zip((0, 0.085, 0.15, 0.2, 0.238, 0.266, 0.286), (1, 0.8, 0.62, 0.48, 0.36, 0.26, 0.18))):
        m = metal(0.09, 1900 + 60 * k, tau=0.03, strike=0.8); i = n_(t0); y[i:i + len(m)] += a * m
    return norm(y)
def hiss(d): return norm(fade(hp(noise(d), 3500) * (1 + 0.25 * lp(noise(d), 9) / 0.05).clip(0.3, 2), 0.5, 0.4))
def whistle(d, f0=2300, f1=760):
    t = tt(d); p = ph(glide(d, f0, f1) * (1 + 0.01 * np.sin(2 * np.pi * 9 * t)))
    return norm(fade((np.sin(p) + 0.18 * np.sin(2 * p)) * (0.35 + 0.65 * t / d), 0.04, 0.012))
def stamp(): return norm(np.pad(thud(0.22, 150, 58, 0.2), (0, 0)) + 0.55 * np.pad(bp(noise(0.05), 700, 2600) * np.exp(-tt(0.05) / 0.012), (0, n_(0.22) - n_(0.05))))
def seq(notes, step, d_last=0.35, tau=0.09, bright=0.5):                  # notas encadenadas (arpegio)
    y = np.zeros(n_(step * (len(notes) - 1) + d_last))
    for k, f in enumerate(notes):
        last = k == len(notes) - 1; b = bell(f, d_last if last else step * 2.2, tau * (2.2 if last else 1), bright); i = n_(k * step); y[i:i + len(b)] += b[:len(y) - i]
    return norm(y)
def gliss(d=0.3, f0=520, f1=1560):
    t = tt(d); p = ph(glide(d, f0, f1)); return norm(fade((np.sin(p) + 0.4 * np.sin(2 * p)) * (0.5 + 0.5 * t / d), 0.004, 0.05))
def sparkle(d=0.35, n=6, lo=3000, hi=6500):
    y = np.zeros(n_(d + 0.12))
    for _ in range(n):
        b = bell(rng.uniform(lo, hi), 0.1, 0.035, 0.2); i = n_(rng.uniform(0, d)); y[i:i + len(b)] += rng.uniform(0.5, 1) * b[:len(y) - i]
    return norm(y)
def ticks(n, d, f=3100, jitter=0.25, rise=0.0):                           # tecleo / contador
    y = np.zeros(n_(d + 0.05))
    for k in range(n):
        tk = tick(f * (1 + rise * k / max(1, n - 1)) * rng.uniform(0.9, 1.1), 0.003, 0.02, 0.5); i = n_(max(0, (k + rng.uniform(-jitter, jitter)) * d / n)); y[i:i + len(tk)] += rng.uniform(0.6, 1) * tk[:len(y) - i]
    return norm(y)
def footstep(): d = 0.09; t = tt(d); return norm(lp(noise(d), 320) * np.exp(-t / 0.02) + np.sin(2 * np.pi * 88 * t) * np.exp(-t / 0.03))
def dig_stab():
    d = 0.2; t = tt(d); y = bp(noise(d), 250, 1900) * np.exp(-t / 0.035) + 0.3 * hp(noise(d), 2500) * np.exp(-t / 0.05)
    th = thud(0.14, 115, 62, 0, 0.03); y[:len(th)] += 0.8 * th; return norm(fade(y, 0.001, 0.03))
def dirt():
    d = 0.3; t = tt(d); env = sum(np.exp(-np.maximum(0, t - t0) / 0.04) * (t >= t0) * a for t0, a in ((0, 1), (0.05, 0.7), (0.11, 0.5)))
    return norm(fade(lp(noise(d), 950) * env, 0.002, 0.05))
def bed(d, lo, hi, lfo=(0.13, 0.071), depth=0.45, howl=0.35):             # cama de aire estéreo (viento): dos canales decorrelacionados con ráfagas compartidas
    t = tt(d); gust = np.clip(0.55 + depth * np.sin(2 * np.pi * lfo[0] * t + 1.1) * np.sin(2 * np.pi * lfo[1] * t + 0.4) + 0.2 * depth * np.sin(2 * np.pi * 0.31 * t), 0.08, 1.2)
    ch = [bp(noise(d), lo, hi, 1) * gust + howl * bp(noise(d), hi * 0.8, hi * 1.7, 2) * gust ** 2.2 for _ in range(2)]
    y = np.stack(ch, 1); return y / np.abs(y).max()
def waves(d):                                                             # rompiente suave: ruido grave que crece y se retira, con algo de espuma
    t = tt(d); sw = (0.5 + 0.5 * np.sin(2 * np.pi * 0.19 * t - 1.2)) ** 2.2; fo = (0.5 + 0.5 * np.sin(2 * np.pi * 0.19 * t - 1.9)) ** 4
    ch = [lp(noise(d), 480) * (0.25 + sw) + 0.5 * bp(noise(d), 1400, 5200) * fo * 0.5 for _ in range(2)]
    y = np.stack(ch, 1); return y / np.abs(y).max()
def rms_gain(y, target_db): return 10 ** (target_db / 20) / (np.sqrt((y ** 2).mean()) + 1e-12)
def env_io(y, a, r):
    y = y.copy(); na, nr = n_(a), n_(r); y[:na] *= np.linspace(0, 1, na)[:, None] if y.ndim == 2 else np.linspace(0, 1, na)
    y[-nr:] *= np.linspace(1, 0, nr)[:, None] if y.ndim == 2 else np.linspace(1, 0, nr); return y

# ══ 1 · LA NADA ═════════════════════════════════════════════════════════════════════════
w = bed(T['job1'] - 0.02, 160, 850); put(env_io(w * rms_gain(w, -35), 1.4, 0.22), 0, 0, name='viento (cama, hasta el primer corte)')
put(blip(650, 1150, 0.07), 0.52, -26, name='pop: aparece el cartelito NPC')
t0, t1 = 0.15, T['q1'] + 1.6
for k in range(1, 20):                                                    # el cardo rebota
    tu = k * np.pi / 20 / 1.0
    if 0.24 < tu < 0.76: put(hp(noise(0.07), 1700) * np.exp(-tt(0.07) / 0.02), t0 + (t1 - t0) * tu, -31, pan=-0.75 + 1.5 * (tu - 0.24) / 0.52, name='cardo que cruza rodando' if k == 2 else None)
put(blip(380, 900, 0.1), X['tC'], -24, 0.3, 'globito de pensamiento (sueña con la cámara)')
put(blip(950, 280, 0.07), X['tB'], -21, 0.3, 'se pincha el globito · bolsillos vacíos')
put(whoosh(0.16, 900, 2600), X['tB'] + 0.02, -29)
fl = np.zeros(n_(1.9))
for k in range(int(1.9 * 14.6)):
    b = hp(noise(0.012), 2500) * np.exp(-tt(0.012) / 0.003); i = n_(k / 14.6); fl[i:i + len(b)] += b * (1 - k / 28) * rng.uniform(0.6, 1)
put(norm(fl), X['tB'] + 0.2, -36, 0.35, 'polilla')

# ══ 2 · LA PALA ═════════════════════════════════════════════════════════════════════════
TI = X['TI']
put(whistle(TI - T['fall'] - 0.1), T['fall'] + 0.1, -20, 0.25, 'silbido: la pala cae')
tonc = metal(0.9, 430, ratios=(1, 2.31, 3.86, 5.9, 8.2), amps=(1, 0.75, 0.5, 0.3, 0.2), tau=0.22, strike=0.7, trem=0.5)
th = thud(0.3, 120, 46, 0.3); tonc[:len(th)] += 0.9 * th
put(norm(tonc), TI, -7, 0.25, 'TONC: la pala se clava')
put(dirt(), TI + 0.01, -22, 0.25)
put(footstep(), TI + 0.34, -26, -0.05, 'el NPC aterriza del susto')
put(sparkle(0.3, 5), T['q2'] + 0.08, -29, 0.25, 'brillo: la pala «llama»')
put(sparkle(0.25, 4), X['tA'] + 0.05, -30, 0.25)
put(footstep(), T['grab'] + 0.10, -26, -0.05, 'pasos hacia la pala'); put(footstep(), T['grab'] + 0.30, -25, 0.1)
tg = T['grab'] + D['grab'] * 0.52
put(metal(0.35, 1250, ratios=(1, 2.1, 3.4), amps=(1, 0.5, 0.3), tau=0.09, strike=0.6), tg, -18, 0.25, 'arranca la pala del piso')
put(dirt(), tg, -23, 0.25)
for k, tc in enumerate((T['job1'], T['job2'], T['job3'], T['goal'])):      # barridos de corte entre changas
    put(whoosh(0.36, 280, 2700), tc - 0.16, -13, 0.4 if k % 2 else -0.4, 'whoosh de corte (changas)' if k == 0 else None)

# ── changa 1: obra ──
P = 0.62
for k in range(3):
    ts = T['job1'] + k * P + 0.26 * P
    if ts < T['job2'] - 0.05: put(dig_stab(), ts, -13, -0.1, 'palada en la obra' if k == 0 else None)
    if ts + 0.17 < T['job2'] - 0.05: put(whoosh(0.2, 500, 1700), ts + 0.15, -25, 0.1)
    tl = T['job1'] + k * P + 0.58 * P + 0.38
    if tl < T['job2'] - 0.03: put(dirt(), tl, -22, 0.45, 'la tierra cae al montículo' if k == 0 else None)
coin = lambda: norm(np.concatenate([bell(988, 0.07, 0.05, 0.4)[:n_(0.065)], bell(1319, 0.45, 0.14, 0.4)]))
def job_money(a, b, name):
    put(coin(), a + (b - a) * 0.5, -18, 0.15, name)
    put(ticks(12, (b - a) * 0.34, 3800, rise=0.25), a + (b - a) * 0.58, -32, -0.4)
job_money(T['job1'], T['job2'], 'moneda: +US$ 300')
# ── changa 2: lavadero ──
d = T['job3'] - T['job2'] - 0.32; t = tt(d)
scrub = bp(noise(d), 500, 2600) * (0.18 + 0.82 * np.abs(np.sin(15 * (t + 0.2))) ** 1.6)
put(norm(fade(scrub, 0.08, 0.1)), T['job2'] + 0.2, -19, 0.15, 'esponja: lavado del auto')
for _ in range(9): f = rng.uniform(450, 1100); put(blip(f, f * 1.9, 0.04), T['job2'] + rng.uniform(0.3, 1.25), -28, rng.uniform(-0.2, 0.6))
for k in range(4): put(blip(1500, 1900, 0.03), T['job2'] + 0.35 + k * 0.27, -31, 0.3)
put(sparkle(0.3, 7), T['job2'] + D['job2'] - 0.5, -24, 0.4, 'brillo: auto limpio')
job_money(T['job2'], T['job3'], 'moneda: +US$ 350')
# ── changa 3: delivery ──
bb = np.zeros(n_(0.5))
for t0b in (0, 0.17):
    q = tt(0.3); b = (np.sin(2 * np.pi * 2350 * q) + 0.6 * np.sin(2 * np.pi * 3530 * q)) * np.exp(-q / 0.07) * (1 + 0.5 * np.sin(2 * np.pi * 29 * q)); i = n_(t0b); bb[i:i + len(b)] += b[:len(bb) - i]
put(norm(bb), T['job3'] + 0.22, -19, 0.1, 'timbre de la bici')
d = T['goal'] - T['job3'] - 0.3
put(ticks(int(d * 13), d, 4300, jitter=0.08), T['job3'] + 0.2, -33, 0.0, 'rueda libre de la bici')
rush = bed(d, 500, 2600, lfo=(0.9, 0.5), depth=0.3, howl=0.2); put(env_io(rush * rms_gain(rush, -30), 0.12, 0.12), T['job3'] + 0.18, 0, name='viento en la bici')
job_money(T['job3'], T['goal'], 'moneda: +US$ 350')
# ── meta ──
put(seq((1047, 1319, 1568, 2093), 0.065, 0.4, 0.1), T['goal'] + 0.04, -19, 0, 'fanfarria: ¡mil dólares!')
for _ in range(11): put(bell(rng.choice((988, 1319, 1568, 1976)), 0.2, 0.06, 0.3), T['goal'] + rng.uniform(0.12, 1.05), -29, rng.uniform(-0.7, 0.7))
for k in (1, 2, 3): put(footstep(), T['goal'] + k * np.pi / 9.5, -27 - 2 * k, 0)

# ══ 3 · LA CÁMARA ═══════════════════════════════════════════════════════════════════════
w = bed(T['junk'] - T['buy'], 160, 850); put(env_io(w * rms_gain(w, -38), 0.3, 0.4), T['buy'], 0)
put(whoosh(0.55, 2600, 480), T['buy'] + 0.3, -22, 0, 'la cámara cae del cielo')
put(norm(np.concatenate([tick(2200, 0.004, 0.06), np.zeros(n_(0.01)), bell(2217, 0.5, 0.2, 0.5) + 0.7 * bell(2794, 0.5, 0.18, 0.4)])), T['buy'] + 0.72, -20, -0.3, 'ka-ching: paga la cámara')
put(norm(thud(0.1, 210, 110, 0.1, 0.02) + 0.5 * np.pad(tick(2500), (0, n_(0.1) - n_(0.03)))), T['buy'] + 0.84, -17, 0, 'ataja la cámara')
put(ticks(16, 0.85, 3600, rise=-0.3), T['buy'] + 0.78, -33, -0.4)
put(seq((784, 988, 1319), 0.07, 0.45, 0.12), T['buy'] + 1.05, -19, 0, 'jingle: «objeto conseguido»')
put(sparkle(0.4, 7), T['buy'] + 1.1, -27, 0)
put(blip(300, 150, 0.2, 0.08), T['buy'] + 1.58, -27, -0.4, 'la plata queda en cero')
put(tick(2600, 0.005, 0.04), T['q3'] + 0.14, -27, 0)
put(norm(np.concatenate([bell(784, 0.11, 0.06), bell(932, 0.3, 0.1)])), T['q3'] + 0.3, -22, 0.2, '«?»')

# ── las cachilas ──
st = bed(T['gridd'] - T['junk'], 180, 1000); put(env_io(st * rms_gain(st, -38), 0.5, 0.05), T['junk'], 0)
put(whoosh(0.95, 1900, 280, 2.0), T['junk'], -21, 0, 'la cámara se aleja')
sp = sputter(2.0); put(sp, T['junk'] + 0.3, -15, 0.5, 'motor de cachila que falla')
put(backfire(), TJ['pum'], -5, 0.6, 'PUM: contraexplosión')
cl = metal(1.0, 215, tau=0.42, strike=0.8)
put(cl, TJ['clang'], -7, 0.2, 'CLANG: se cae el paragolpes')
put(metal(0.5, 228, tau=0.2, strike=0.6), TJ['clang'] + np.pi / 13, -15, 0.2); put(metal(0.3, 236, tau=0.12, strike=0.5), TJ['clang'] + 2 * np.pi / 13, -22, 0.2)
put(metal(0.25, 2050, ratios=(1, 1.52, 2.4), amps=(1, 0.6, 0.3), tau=0.07, strike=0.5), TJ['hub'], -16, 0.3, 'salta la taza')
put(metal(0.12, 1900, tau=0.04, strike=0.8), TJ['hub'] + 0.3, -20, 0.3)
put(hubroll(0.9), TJ['hub'] + 0.3, -21, 0.15, 'la taza rueda hasta el NPC')
put(clatter(), TJ['hub'] + 1.2, -18, -0.1, 'la taza se asienta')
h = hiss(T['gridd'] - T['junk'] - 2.0); put(h * rms_gain(h, -37), T['junk'] + 2.0, 0, 0.4, 'vapor del capó')

# ══ 4 · USÁ GRIDD ═══════════════════════════════════════════════════════════════════════
phone_on = lambda: norm(np.concatenate([bell(1319, 0.09, 0.08), bell(1760, 0.55, 0.2)]))
put(whoosh(0.2, 600, 3000), T['gridd'] + 0.32, -23, 0.25, 'saca el teléfono')
put(phone_on(), T['gridd'] + 0.72, -19, 0.25, 'se prende la pantalla')
put(whoosh(0.52, 300, 3600, 2.0, 1.4), T['feed'] - 0.47, -14, 0, 'zoom: la cámara se mete en el teléfono')
for i in range(6): put(tick(2300 + 130 * i, 0.004, 0.03, 0.2), TP['in1'] + 0.1 + 0.08 + i * 0.085 + 0.06, -28, 0, 'tarjetas del feed entran en cascada' if i == 0 else None)
put(tap(), TP['map'], -22, 0.5, 'toque: MAPA')
put(whoosh(0.25, 1500, 4200), TP['map'] + 0.02, -31, 0)
for i in range(6): put(blip(620 + 70 * i, 430 + 50 * i, 0.06), TP['map'] + 0.22 + i * 0.1, -25, rng.uniform(-0.4, 0.4), 'pines que caen en el mapa' if i == 0 else None)
put(tap(), TP['pick'], -22, -0.1, 'toque: elige un evento')
put(whoosh(0.3, 400, 1900), TP['pick'] + 0.12, -27, 0)
put(bell(1319, 0.4, 0.12), TP['where'], -24, 0, 'resalta DÓNDE'); put(bell(1568, 0.4, 0.12), TP['when'], -24, 0, 'resalta CUÁNDO')
put(sparkle(0.3, 6), TP['done'], -25, 0, '«…y listo»'); put(bell(2093, 0.4, 0.14), TP['done'] + 0.02, -27, 0)

# ══ 5 · EL GIRO ═════════════════════════════════════════════════════════════════════════
d = T['own'] + 0.6 - T['crowd']; t = tt(d); p = ph(41 * (1 + 0.03 * np.sin(2 * np.pi * 1.3 * t)))
idle = lp(sum(np.sin(h * p + rng.uniform(0, 6.28)) / h for h in range(1, 9)) * (1 + 0.25 * np.sin(2 * np.pi * 20.5 * t)), 420)
put(fade(norm(idle), 0.05, 0.8), T['crowd'], -35, -0.6, 'superauto regulando (muy bajo)')
named = False
for i, off in enumerate(X['crowdFl']):                                    # los clones disparan sin parar
    m = 0
    while True:
        u = (1.6 * m - off) / 1.9; m += 1
        if u < 0.02: continue
        if T['crowd'] + u > min(TP['in2'], T['own'] + 1.2): break
        put(shutter(), T['crowd'] + u, -27 + rng.uniform(-3, 2), -0.55 + 0.11 * i, None if named else 'obturadores de los otros car spotters'); named = True
for k in range(1, 9):
    u = k * np.pi / 6.2
    if T['crowd'] + u < T['own'] + 0.1: put(footstep(), T['crowd'] + u, -29, 0.6, 'saltitos del NPC' if k == 1 else None)
put(norm(bell(1760, 0.5, 0.2) + 0.5 * bell(2637, 0.5, 0.15)), T['own'] + 0.3, -16, 0.5, '«!»: se le ocurre')
put(whoosh(0.2, 600, 3000), TP['zoom2'] - 0.9 + 0.32, -23, 0.5); put(phone_on(), TP['zoom2'] - 0.9 + 0.72, -22, 0.5)
put(whoosh(0.52, 300, 3600, 2.0, 1.4), TP['in2'] + 0.14 - 0.47, -14, 0.2, 'zoom al teléfono')
put(tap(), TP['plus'], -22, 0.5, 'toque: «+»'); put(whoosh(0.3, 400, 1900), TP['plus'] + 0.1, -27, 0)
put(ticks(11, 0.55), TP['plus'] + 0.5, -30, -0.2, 'tecleo: nombre del evento'); put(blip(900, 1500, 0.05), TP['plus'] + 1.07, -29, 0.5)
put(stamp(), TP['free'], -11, 0.2, 'sello GRATIS')
put(ticks(7, 0.3), TP['loc'], -30, -0.2, 'tecleo: ubicación'); put(blip(620, 430, 0.06), TP['loc'] + 0.1, -24, 0.4); put(blip(900, 1500, 0.05), TP['loc'] + 0.32, -29, 0.5)
put(ticks(6, 0.25), TP['hour'], -30, -0.2, 'tecleo: horario'); put(blip(900, 1500, 0.05), TP['hour'] + 0.27, -29, 0.5)
put(ticks(6, 0.25), TP['fly'], -30, -0.2, 'tecleo: flyer'); put(blip(480, 1150, 0.08), TP['fly'] + 0.12, -22, 0.4, 'aparece el flyer'); put(blip(900, 1500, 0.05), TP['fly'] + 0.27, -29, 0.5)
put(tap(), TP['send'], -20, 0, 'toque: PUBLICAR')
put(norm(np.concatenate([whoosh(0.3, 600, 4200), np.zeros(1)])), TP['send'] + 0.04, -19, 0, 'whoosh: publicado')
put(seq((1047, 1319, 1568), 0.08, 0.5, 0.14), TP['app'] + 0.12, -20, 0, 'campanita: el evento ya está en la app')
put(whoosh(0.35, 500, 2600), TP['story'], -18, 0.2, 'desliza: historia de Instagram')
put(stamp(), TP['daily'], -14, 0.3, 'sello TODOS LOS DÍAS')
k = 1
while TP['story'] + 0.3 + k * 0.62 < T['rambla'] - 0.1: put(tick(2000, 0.006, 0.04, 0.15), TP['story'] + 0.3 + k * 0.62, -30, -0.4 + 0.12 * k, 'tic: pasa un día en la historia' if k == 1 else None); k += 1

# ══ 6 · LA RAMBLA ═══════════════════════════════════════════════════════════════════════
d = T['logo'] - T['rambla']
wv = waves(d); put(env_io(wv * rms_gain(wv, -36), 0.3, 0.35), T['rambla'], 0, name='olas y brisa de la rambla (cama)')
RB = X['RB']; qmid = (80 - RB['x0']) / (RB['x1'] - RB['x0'])
for i, ((kind, t0c), f0) in enumerate(zip(X['PASS'], (232, 138, 188))):
    tc = T['rambla'] + t0c + RB['dur'] * qmid; cp = car_pass(1.7, f0, w=0.13, harm=10 if f0 < 160 else 8, rough=2.2 if f0 < 160 else 1.7)
    put(cp, tc - 0.85, -7); CUES.append((round(tc, 2), f'auto {i + 1} pasa frente a cámara ({"superdeportivo" if i == 0 else "GT" if i == 1 else "descapotable"}): el sonido dura 1,7 s centrado acá'))
    ts = X['shots'][i]
    put(shutter(), ts, -9, 0.5, f'CLIC: foto {i + 1}')                         # tiene que oírse por encima del auto que pasa
    put(whoosh(0.2, 3200, 700), ts, -25, 0.5)
    put(whoosh(0.3, 1300, 420), ts + 0.06, -27, -0.2); put(tick(1700, 0.006, 0.04, 0.2), ts + 0.41, -30, -0.5)
for i, (t0a, pan) in enumerate(((2.0, -0.6), (2.7, -0.15), (3.4, 0.2))):
    put(blip(520, 980, 0.06), T['rambla'] + t0a, -27, pan, 'se suma público del otro lado' if i == 0 else None)
    m = 0
    while True:
        u = (1.5 * m - 0.5 * i) / 1.3; m += 1
        if u < t0a + 0.35: continue
        if T['rambla'] + u > T['logo'] - 0.3: break
        put(shutter(), T['rambla'] + u, -30, pan)
put(gliss(0.28), X['TAGT'], -15, 0.45, 'power-up: de NPC a CAR SPOTTER'); put(bell(2093, 0.5, 0.18), X['TAGT'] + 0.24, -18, 0.45); put(sparkle(0.35, 7), X['TAGT'] + 0.2, -26, 0.45)
pub = np.array(X['pub']); scale = (784, 880, 988, 1175, 1319, 1568, 1760, 1976, 2349, 2637); tfull = None
for i in range(10):
    j = np.argmax(pub * 10 > i + 0.5)
    if pub[j] * 10 > i + 0.5:
        tm = T['rambla'] + j * D['rambla'] / len(pub); put(bell(scale[i], 0.16, 0.05, 0.3), tm, -27, -0.5 + 0.1 * i, 'medidor PÚBLICO: se llena bloque a bloque' if i == 0 else None); tfull = tm
if tfull: put(seq((1568, 1976, 2349), 0.07, 0.4, 0.12), tfull + 0.12, -23, 0.3, 'medidor PÚBLICO lleno')

# ══ CIERRE ══════════════════════════════════════════════════════════════════════════════
L = T['logo']
put(whoosh(0.4, 4200, 500, 1.6), L - 0.06, -14, 0, 'flash + corte al cierre')
put(thud(0.35, 140, 52, 0.25), L + 0.3, -10, 0, 'cae la barra del logo')
put(whoosh(0.32, 500, 3600), L + 0.4, -15, 0, 'salen las letras GR|DD')
put(norm(np.pad(thud(0.3, 125, 50, 0.3), (0, 0)) + 0.3 * np.pad(metal(0.2, 1500, tau=0.06), (0, n_(0.3) - n_(0.2)))), L + 0.42 + 0.3, -10, 0, 'las letras se asientan')
put(stamp(), X['logoC'] + 0.06, -12, 0, 'placa DESCARGÁ LA APP')
put(ticks(9, 0.3, 3000), X['logoC'] + 0.43, -28, 0, 'tecleo: gridd.app')

# ── terminación de la pista de efectos: limitador suave y fundidos en los extremos ──
peak = np.abs(mix).max(); lim = 10 ** (-3 / 20)
mix = np.where(np.abs(mix) > lim * 0.7, np.sign(mix) * (lim * 0.7 + (lim * 0.3) * np.tanh((np.abs(mix) - lim * 0.7) / (lim * 0.3))), mix)
mix[:n_(0.05)] *= np.linspace(0, 1, n_(0.05))[:, None]; mix[-n_(0.3):] *= np.linspace(1, 0, n_(0.3))[:, None]
def write(path, y): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s16le', str(path)], input=np.ascontiguousarray(y).tobytes(), check=True)
write(vo / 'sfx.wav', mix)

# ── mezcla con la voz: los efectos bajan mientras habla el narrador ──
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(vo / 'narracion.wav'), '-ac', '1', '-ar', str(SR), '-f', 'f64le', '-'], capture_output=True, check=True).stdout
v = np.frombuffer(raw, dtype=np.float64); v = np.pad(v, (0, max(0, N - len(v))))[:N]
envv = np.abs(v); a_att, a_rel = np.exp(-1 / (0.05 * SR)), np.exp(-1 / (0.3 * SR)); e = 0.0; hop = 48; ed = np.empty(N // hop + 1)
blk = np.array([envv[i:i + hop].max() if i < N else 0 for i in range(0, N, hop)]); ca, cr = a_att ** hop, a_rel ** hop
for i, b in enumerate(blk): e = b + (e - b) * (ca if b > e else cr); ed[i] = e
env = np.repeat(ed[:len(blk)], hop)[:N]
duck = 10 ** (-6.5 * np.clip(env / 0.05, 0, 1) / 20)                       # hasta −6,5 dB bajo la voz
VOZ, FX = 10 ** (-2.5 / 20), 10 ** (-2.0 / 20)
out = FX * mix * duck[:, None] + VOZ * np.stack([v, v], 1)
lim = 10 ** (-1.5 / 20); out = np.where(np.abs(out) > lim * 0.8, np.sign(out) * (lim * 0.8 + (lim * 0.2) * np.tanh((np.abs(out) - lim * 0.8) / (lim * 0.2))), out)
write(vo / 'mezcla.wav', out)
CUES.sort(); (vo / 'sfx_cues.json').write_text(json.dumps(CUES, ensure_ascii=False, indent=0))
mmss = lambda t: '%d:%05.2f' % (int(t // 60), t % 60)
(root / 'out' / 'gridd-car-spotter-efectos-tiempos.txt').write_text('GRIDD · «De NPC a car spotter» · dónde va cada efecto de sonido (min:seg desde el inicio del video)\n' + '─' * 96 + '\n' + '\n'.join('%s   %s' % (mmss(t), n) for t, n in CUES) + '\n', encoding='utf-8')
db = lambda x: 20 * np.log10(x + 1e-12)
print('efectos: %d eventos con nombre · pico antes de limitar %.1f dBFS · pico final %.1f dBFS · RMS %.1f dBFS' % (len(CUES), db(peak), db(np.abs(mix).max()), db(np.sqrt((mix ** 2).mean()))))
print('mezcla: pico %.1f dBFS · voz sola RMS %.1f dBFS · efectos bajo la voz: −6,5 dB' % (db(np.abs(out).max()), db(np.sqrt((v[np.abs(v) > 0.01] ** 2).mean()))))
