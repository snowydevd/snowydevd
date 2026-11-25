"""Generadores de efectos y música sintetizados (sin grabaciones de terceros). Todo mono a SR Hz salvo que se diga."""
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(23)
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
    if na: x[:na] *= np.linspace(0, 1, na)
    if nr: x[-nr:] *= np.linspace(1, 0, nr)
    return x
def ph(freq): return 2 * np.pi * np.cumsum(freq) / SR
def glide(d, f0, f1, tau=None):
    t = tt(d); return f1 + (f0 - f1) * np.exp(-t / tau) if tau else f0 * (f1 / f0) ** (t / max(d, 1e-6))
def square(p, duty=0.5): return np.where((p / (2 * np.pi)) % 1 < duty, 1.0, -1.0)
def tri(p): x = (p / (2 * np.pi)) % 1; return 4 * np.abs(x - 0.5) - 1
def saw(p): return 2 * ((p / (2 * np.pi)) % 1) - 1
NOTE = lambda name: 440 * 2 ** ((({'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}[name[:-1]]) + 12 * (int(name[-1]) - 4)) / 12)

# ── básicos ──
def sweep(d, f0, f1, q=2.5, shape=1.0):               # ruido con pasabanda que barre (whoosh)
    x = noise(d); n = len(x); f = np.minimum(f0 * (f1 / f0) ** (np.arange(n) / n), SR / 6.5)
    g = 2 * np.sin(np.pi * f / SR); k = 1 / q; lo = bd = 0.0; out = np.empty(n)
    for i in range(n):
        hi = x[i] - lo - k * bd; bd += g[i] * hi; lo += g[i] * bd; out[i] = bd
    return norm(out * np.sin(np.pi * np.arange(n) / n) ** (2 * shape))
def thud(d=0.25, f0=130, f1=48, click=0.25, tau=None):
    t = tt(d); y = np.sin(ph(glide(d, f0, f1, 0.03))) * np.exp(-t / (tau or d / 4.5)) + click * lp(noise(d), 1800) * np.exp(-t / 0.005)
    return norm(fade(y, 0.001, 0.02))
def boom808(d=1.3, f0=120, f1=46, drive=2.2):          # golpe grave de «zoom dramático» (original, no es el sample viral)
    t = tt(d); y = np.sin(ph(glide(d, f0, f1, 0.05))) * np.exp(-t / 0.42)
    y = np.tanh(drive * y) + 0.25 * lp(noise(d), 900) * np.exp(-t / 0.01)
    tail = lp(noise(d), 300) * np.exp(-t / 0.5) * 0.08
    return norm(fade(y + tail, 0.001, 0.08))
def metal(d, f, ratios=(1, 2.76, 5.40, 8.93), amps=(1, 0.6, 0.4, 0.25), tau=0.25, strike=0.5):
    t = tt(d); y = sum(a * np.sin(2 * np.pi * f * r * t + rng.uniform(0, 6.28)) * np.exp(-t / (tau / (1 + 0.55 * k))) for k, (r, a) in enumerate(zip(ratios, amps)))
    y = y + strike * bp(noise(d), 1500, 7000) * np.exp(-t / 0.004)
    return norm(fade(y, 0.0005, 0.02))
def bell(f, d=0.5, tau=0.16, bright=0.35):
    t = tt(d); y = np.sin(2 * np.pi * f * t) + bright * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / (tau * 0.6)) + 0.4 * bright * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t / (tau * 0.4))
    return norm(fade(y * np.exp(-t / tau), 0.002, 0.02))
def tick(f=3200, tau=0.004, d=0.03, air=0.3):
    t = tt(d); return norm(fade(np.sin(2 * np.pi * f * t) * np.exp(-t / tau) + air * hp(noise(d), 4000) * np.exp(-t / 0.002), 0.0003, 0.004))
def blip(f0, f1, d=0.07, tau=None, duty=None):
    t = tt(d); p = ph(glide(d, f0, f1)); w = np.sin(p) if duty is None else lp(square(p, duty), 6000)
    return norm(fade(w * np.exp(-t / (tau or d / 3)), 0.002, 0.01))
def chip_seq(notes, step, d_last=0.25, duty=0.25, tau=0.06):   # arpegio «de videojuego»
    y = np.zeros(n_(step * (len(notes) - 1) + d_last))
    for k, f in enumerate(notes):
        dd = d_last if k == len(notes) - 1 else step * 1.2; t = tt(dd); s = lp(square(2 * np.pi * f * t, duty), 7000) * np.exp(-t / (tau * (3 if k == len(notes) - 1 else 1)))
        i = n_(k * step); y[i:i + len(s)] += fade(s, 0.001, 0.01)[:len(y) - i]
    return norm(y)
def shutter():
    y = np.zeros(n_(0.16)); a = bp(noise(0.02), 1800, 6500) * np.exp(-tt(0.02) / 0.004); b = bp(noise(0.035), 900, 5000) * np.exp(-tt(0.035) / 0.008)
    y[:len(a)] += a; i = n_(0.052); y[i:i + len(b)] += 0.9 * b; m = thud(0.06, 190, 120, 0, 0.012); y[i:i + len(m)] += 0.35 * m
    return norm(y)
def footstep(): d = 0.09; t = tt(d); return norm(lp(noise(d), 320) * np.exp(-t / 0.02) + np.sin(2 * np.pi * 88 * t) * np.exp(-t / 0.03))
def stamp(): y = thud(0.22, 150, 58, 0.2); y[:n_(0.05)] += 0.55 * bp(noise(0.05), 700, 2600) * np.exp(-tt(0.05) / 0.012); return norm(y)
def sparkles(d=0.35, n=6, lo=3000, hi=6500):
    y = np.zeros(n_(d + 0.12))
    for _ in range(n):
        b = bell(rng.uniform(lo, hi), 0.1, 0.035, 0.2); i = n_(rng.uniform(0, d)); y[i:i + len(b)] += rng.uniform(0.5, 1) * b[:len(y) - i]
    return norm(y)
def ticks(n, d, f=3100, jitter=0.25, rise=0.0):
    y = np.zeros(n_(d + 0.05))
    for k in range(n):
        tk = tick(f * (1 + rise * k / max(1, n - 1)) * rng.uniform(0.9, 1.1), 0.003, 0.02, 0.5); i = n_(max(0, (k + rng.uniform(-jitter, jitter)) * d / n)); y[i:i + len(tk)] += rng.uniform(0.6, 1) * tk[:len(y) - i]
    return norm(y)
def bed(d, lo, hi, lfo=(0.13, 0.071), depth=0.45, howl=0.35):   # viento estéreo
    t = tt(d); gust = np.clip(0.55 + depth * np.sin(2 * np.pi * lfo[0] * t + 1.1) * np.sin(2 * np.pi * lfo[1] * t + 0.4) + 0.2 * depth * np.sin(2 * np.pi * 0.31 * t), 0.08, 1.2)
    ch = [bp(noise(d), lo, hi, 1) * gust + howl * bp(noise(d), hi * 0.8, hi * 1.7, 2) * gust ** 2.2 for _ in range(2)]
    y = np.stack(ch, 1); return y / np.abs(y).max()

# ── autos ──
def engine(d, rpm, harm=10, rough=1.8, crackle=0.0):    # motor a partir de una curva de «rpm» (Hz de la fundamental)
    p = ph(rpm * (1 + 0.012 * np.sin(2 * np.pi * 27 * tt(d))))
    e = sum(np.sin(h * p + rng.uniform(0, 6.28)) / h ** 0.8 for h in range(1, harm + 1)) + 0.6 * np.sin(0.5 * p)
    e = lp(np.tanh(rough * e / np.abs(e).max()), 3400) + 0.2 * bp(noise(d), 300, 2500)
    if crackle:
        pops = np.zeros(n_(d))
        for _ in range(int(crackle * d * 20)):
            i = rng.integers(n_(d * 0.45), n_(d)); q = bp(noise(0.02), 300, 4000) * np.exp(-tt(0.02) / 0.004); pops[i:i + len(q)] += q[:len(pops) - i] * rng.uniform(0.6, 1.6)
        e = e + crackle * pops
    return e
def rev(d, f_idle, f_peak, up=0.18, crackle=1.0):        # acelerón en vacío: sube rápido y baja
    t = tt(d); env_rpm = np.where(t < up, (t / up) ** 0.6, np.exp(-(t - up) / (d * 0.35)))
    rpm = f_idle + (f_peak - f_idle) * env_rpm
    amp = 0.45 + 0.55 * np.clip(env_rpm * 1.3, 0, 1)
    return norm(fade(engine(d, rpm, crackle=crackle) * amp, 0.01, 0.12))
def idle(d, f=34):
    t = tt(d); rpm = f * (1 + 0.04 * np.sin(2 * np.pi * 0.9 * t)); return norm(fade(engine(d, rpm, harm=8, rough=1.4) * (0.8 + 0.2 * np.sin(2 * np.pi * 7.5 * t)), 0.2, 0.05))
def stall(d=0.7):                                        # se ahoga: tres explosiones que se apagan + «plof»
    y = np.zeros(n_(d))
    for k, (t0, a, f) in enumerate(((0, 1, 70), (0.12, 0.7, 62), (0.27, 0.45, 55))):
        q = 0.14; s = (lp(noise(q), 700) * np.exp(-tt(q) / 0.025) + np.sin(2 * np.pi * f * tt(q)) * np.exp(-tt(q) / 0.05)); i = n_(t0); y[i:i + len(s)] += a * s[:len(y) - i]
    p = thud(0.35, 90, 38, 0.15); i = n_(0.34); y[i:i + len(p)] += 0.9 * p[:len(y) - i]
    return norm(y)
def car_alarm(d, f1=1180, f2=830, per=0.24):            # alarma: dos tonos que se alternan, con «uiuiu»
    t = tt(d); sel = (np.floor(t / per) % 2) == 0; f = np.where(sel, f1, f2) * (1 + 0.06 * np.sin(2 * np.pi * 18 * t))
    y = lp(square(ph(f), 0.5), 3500) * (0.85 + 0.15 * np.sin(2 * np.pi * 4 * t))
    return norm(fade(bp(y, 500, 4000), 0.01, 0.06))
def chirp_lock(): return norm(np.concatenate([blip(2600, 2600, 0.05, duty=0.5), np.zeros(n_(0.03)), blip(2600, 2600, 0.05, duty=0.5)]))
def peel_out(d=0.8):                                     # chirrido de gomas + motor que se va
    t = tt(d); sq = bp(noise(d), 1500, 3800) * (0.6 + 0.4 * np.sin(2 * np.pi * 37 * t)) + 0.5 * np.sin(ph(1850 + 220 * np.sin(2 * np.pi * 9 * t)))
    sq = sq * np.exp(-t / 0.35)
    e = engine(d, 60 + 160 * (1 - np.exp(-t / 0.15)), harm=8) * np.exp(-t / 0.5) * 0.8
    return norm(fade(sq + e, 0.005, 0.1))

# ── comedia ──
def record_scratch(d=0.42):                              # «rayón» de disco (cuadro congelado)
    t = tt(d); f = 900 + 2600 * np.abs(np.sin(2 * np.pi * (2.2 + 9 * t) * t))
    x = noise(d); y = np.zeros_like(x); lo = bd = 0.0; g = 2 * np.sin(np.pi * np.minimum(f, SR / 6.5) / SR)
    for i in range(len(x)):
        hi = x[i] - lo - 0.35 * bd; bd += g[i] * hi; lo += g[i] * bd; y[i] = bd
    y = y * np.exp(-t / 0.25) + 0.3 * np.sin(ph(80 + 300 * np.sin(2 * np.pi * 7 * t))) * np.exp(-t / 0.2)
    return norm(fade(np.tanh(1.5 * norm(y)), 0.002, 0.05))
def phone_ring(d=0.38):                                  # timbre de teléfono (dos tonos con trémolo)
    t = tt(d); y = (np.sin(2 * np.pi * 1300 * t) + np.sin(2 * np.pi * 1630 * t)) * (0.5 + 0.5 * square(2 * np.pi * 22 * t, 0.5))
    return norm(fade(bp(y, 800, 4000), 0.005, 0.03))
def gibberish(d, f0=290, rate=8.5, angry=1.0, phone=True, seed=0):   # voz ininteligible (la mamá por teléfono / el que explica)
    r = np.random.default_rng(seed); t = tt(d); n = len(t)
    pitch = f0 * (1 + 0.18 * angry * np.sin(2 * np.pi * 1.7 * t) + 0.08 * np.sin(2 * np.pi * 5.3 * t))
    src = saw(ph(pitch)) + 0.1 * r.standard_normal(n)
    env = np.zeros(n); vowels = []; tcur = 0.0
    while tcur < d:
        dur = r.uniform(0.6, 1.4) / rate; i0, i1 = n_(tcur), min(n, n_(tcur + dur)); w = np.sin(np.linspace(0, np.pi, max(1, i1 - i0))) ** 0.7
        env[i0:i1] = np.maximum(env[i0:i1], w * r.uniform(0.6, 1.0)); vowels.append((i0, i1, r.integers(0, 4))); tcur += dur * r.uniform(1.0, 1.25)
    F = [(730, 1090), (270, 2290), (530, 1840), (570, 840)]
    y = np.zeros(n)
    for i0, i1, v in vowels:
        seg = src[i0:i1]; f1, f2 = F[v]
        if len(seg) > 32: y[i0:i1] += bp(seg, f1 * 0.8, f1 * 1.25) + 0.7 * bp(seg, f2 * 0.85, f2 * 1.2)
    y = y * env
    if phone: y = bp(y, 450, 3000, 3)
    return norm(fade(y, 0.01, 0.05))
def sad_trombone():                                      # «wa wa wa waaa»
    notes = [('D4', 0.32), ('C#4', 0.32), ('C4', 0.32), ('B3', 1.1)]; out = []
    for k, (nm, d) in enumerate(notes):
        t = tt(d); f = NOTE(nm) * (1 + (0.025 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / 0.25, 0, 1) if k == 3 else 0)) * (1 - 0.03 * np.exp(-t / 0.03))
        s = saw(ph(f)); w = np.exp(-t / 0.08); s = lp(s, 1800) * w + lp(s, 900) * (1 - w) + 0.03 * noise(d)   # se «cierra» como una sordina
        env = np.minimum(1, t / 0.03) * (np.exp(-t / 2.5) if k < 3 else np.exp(-t / 0.9)) * (0.85 + 0.15 * np.sin(2 * np.pi * 3 * t + k))
        out.append(fade(s * env, 0.01, 0.04))
    return norm(np.concatenate(out))
def boing(d=0.45, f0=220, f1=520):                       # resorte
    t = tt(d); f = (f0 + (f1 - f0) * (1 - np.exp(-t / 0.12))) * (1 + 0.22 * np.sin(2 * np.pi * (26 - 14 * t / d) * t) * np.exp(-t / 0.25))
    return norm(fade(np.sin(ph(f)) * np.exp(-t / 0.22), 0.002, 0.03))
def slurp(d=0.55):                                       # sorbo de mate
    t = tt(d); f = 700 + 2200 * (t / d) ** 1.3
    x = noise(d); y = np.zeros_like(x); lo = bd = 0.0; g = 2 * np.sin(np.pi * f / SR)
    for i in range(len(x)):
        hi = x[i] - lo - 0.12 * bd; bd += g[i] * hi; lo += g[i] * bd; y[i] = bd
    am = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 13 * t)) ** 3
    return norm(fade(y * am * np.sin(np.pi * t / d) ** 0.6, 0.01, 0.04))
def crickets(d, rate=1.9, f=4600, seed=1):              # grillos
    r = np.random.default_rng(seed); y = np.zeros(n_(d)); tc = r.uniform(0, 0.2)
    while tc < d - 0.2:
        for k in range(3):
            q = 0.022; s = np.sin(2 * np.pi * f * r.uniform(0.97, 1.03) * tt(q)) * np.sin(np.pi * tt(q) / q); i = n_(tc + k * 0.034); y[i:i + len(s)] += s[:len(y) - i]
        tc += 1 / rate * r.uniform(0.8, 1.2)
    return norm(y)
def clock_ticks(d, r0=3.0, r1=14.0):                     # tic-tac que se acelera
    y = np.zeros(n_(d)); tc = 0.0; k = 0
    while tc < d:
        tk = tick(2300 if k % 2 else 1650, 0.006, 0.04, 0.15); i = n_(tc); y[i:i + len(tk)] += tk[:len(y) - i]; k += 1
        tc += 1 / (r0 + (r1 - r0) * (tc / d) ** 1.5)
    return norm(y)
def fly(d, pan_fn=None):                                 # mosca (estéreo)
    t = tt(d); f = 210 * (1 + 0.08 * np.sin(2 * np.pi * 3.1 * t)); y = saw(ph(f)) * (0.7 + 0.3 * np.sin(2 * np.pi * 21 * t)); y = bp(y, 180, 2400) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.83 * t))
    y = norm(fade(y, 0.1, 0.1)); pan = np.sin(2 * np.pi * 0.83 * t) * 0.7; a = (pan + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)], 1)
def buzz_err(d=0.38):                                    # «error / bloqueado»
    t = tt(d); y = lp(square(2 * np.pi * 98 * t, 0.5) + 0.7 * square(2 * np.pi * 147 * t, 0.5), 2600) * (0.5 + 0.5 * square(2 * np.pi * 14 * t, 0.6))
    return norm(fade(y, 0.003, 0.05))
def bwomp(d=0.3): t = tt(d); return norm(fade(lp(square(ph(glide(d, 330, 120)), 0.5), 3000) * np.exp(-t / 0.18), 0.002, 0.03))   # «0» en una barra
def gliss_up(d=0.35, f0=400, f1=1600):
    t = tt(d); p = ph(glide(d, f0, f1)); return norm(fade(lp(square(p, 0.25), 6000) * (0.4 + 0.6 * t / d), 0.003, 0.04))
def rustle(d): t = tt(d); return norm(fade(bp(noise(d), 900, 5000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3.3 * t))) * (1 - 0.3 * t / d), 0.1, 0.2))
def whistle_fall(d=0.3): t = tt(d); return norm(fade(np.sin(ph(glide(d, 2400, 900))) * (0.4 + 0.6 * t / d), 0.02, 0.01))
def plastic_thunk(): y = thud(0.16, 420, 180, 0.5, 0.03); y[:n_(0.03)] += 0.5 * bp(noise(0.03), 1200, 5000) * np.exp(-tt(0.03) / 0.006); return norm(y)
def notif(): return norm(np.concatenate([bell(1976, 0.12, 0.07, 0.3)[:n_(0.1)], bell(2637, 0.6, 0.2, 0.3)]))
def babble_male(d, seed=3): return gibberish(d, f0=125, rate=7.5, angry=0.35, phone=False, seed=seed)
