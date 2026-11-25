/* ══════════════════════════════════════════════════════════════════════════════════════
   2 · GUION Y LÍNEA DE TIEMPO
   ─────────────────────────────────────────────────────────────────────────────────────
   Formato: pantalla de «ELEGÍ TU PERSONAJE» de juego de pelea. La grilla es la de Gridd.
   Cinco tipos de gente que hay en toda juntada + un casillero bloqueado: VOS.

   VO = lo que dice el locutor (o, sin voz, cuánto tiempo queda cada texto en pantalla):
     d     duración en segundos (si se graba la voz, el armado pisa estos números con los medidos)
     say   el texto
     pages subtítulo abajo (vacío = no lleva: ese texto ya está en la placa del personaje)
           «|» corta el renglón y *asteriscos* marcan lo que va en amarillo.
   SEGS = tramos en orden: [nombre, duración mínima, línea de voz, entrada, aire, corte].
   Un tramo dura lo que dura su línea (más entrada y aire) o su mínimo, lo que sea mayor.
   Un «aire» negativo hace que el tramo siguiente arranque antes de que termine la frase.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const VO = {
  title: { d: 1.30, say: '¡Elegí tu personaje!',                                   pages: [] },
  n1:    { d: 1.35, say: '¡El que acelera parado!',                                pages: [] },
  pun1:  { d: 1.05, say: 'Siempre hay uno.',                                       pages: ['*SIEMPRE HAY UNO.*'] },
  n2:    { d: 1.85, say: '¡El que vino con el auto de la vieja!',                  pages: [] },
  n3:    { d: 2.30, say: '¡El que te explica todo lo que le hizo al auto!',        pages: [] },
  pun3:  { d: 1.50, say: 'Tres horas después…',                                    pages: [] },
  n4:    { d: 1.95, say: '¡El que se tira al piso por una foto!',                  pages: [] },
  n5:    { d: 1.75, say: '¡El que llega cuando ya terminó!',                       pages: [] },
  pun5:  { d: 1.20, say: 'La juntada era ayer.',                                   pages: ['LA JUNTADA|*ERA AYER.*'] },
  vos:   { d: 1.40, say: '¿Y vos? ¿Cuál sos?',                                     pages: [] },
  cta:   { d: 3.00, say: 'Encontrá tu próxima juntada en Gridd. Descargá la app.', pages: [] },
};
/*__VO_DUR__*/                                       // (el armado pisa acá las duraciones y frases medidas en la locución, si hay)

const SEGS = [
  // nombre  mín.   voz      entrada aire
  ['intro', 2.45,  'title', 0.20,  0.30],            // título + casilleros + el cursor salta
  ['s1',    0.85,  'n1',    0.05, -0.45],            // 1 · selecciona y entra
  ['g1',    2.35],                                   //     acelera: BRAP · BRAAP · BRRRAAAP · se le apaga · alarma
  ['p1',    0,     'pun1',  0.05,  0.55, true],      //     el de al lado mira a cámara
  ['x1',    0.48],                                   //     vuelve a la grilla
  ['s2',    0.85,  'n2',    0.05, -0.75],            // 2 · el auto de la vieja
  ['g2',    2.55],                                   //     facha · zoom a «bebé a bordo» · llama mamá · se va
  ['p2',    2.05],                                   //     «nacido para / obligado a»
  ['x2',    0.48],
  ['s3',    0.85,  'n3',    0.05, -1.05],            // 3 · el que te explica todo
  ['g3',    1.45],                                   //     habla y habla
  ['p3',    0,     'pun3',  0.15,  0.25],            //     placa: TRES HORAS DESPUÉS
  ['q3',    1.85],                                   //     el otro ya es un esqueleto
  ['x3',    0.48],
  ['s4',    0.85,  'n4',    0.05, -0.80],            // 4 · el fotógrafo
  ['g4',    2.55],                                   //     se tira · lo pisan · cono · LOMO DE BURRO
  ['p4',    1.50],                                   //     la foto: valió la pena
  ['x4',    0.48],
  ['s5',    0.85,  'n5',    0.05, -0.65],            // 5 · el que llega tarde
  ['g5',    1.80],                                   //     no hay nadie: grillos, cardo
  ['p5',    0,     'pun5',  0.05,  0.35, true],      //     «la juntada era ayer»
  ['q5',    1.60],                                   //     el evento en Gridd: era ayer · mate
  ['x5',    0.48],
  ['lock',  0.70,  'vos',   0.20,  0.35],            // VOS: bloqueado · ¿cuál sos?
  ['fin',   3.60,  'cta',   0.35,  0.50],            // se desbloquea: GR|DD · DESCARGÁ LA APP
];
const T = {}, D = {};
let DUR = 0;
for (const [name, min, cue, lead = 0.08, air = 0.2, cut = false] of SEGS) {
  const d = Math.max(min, cue ? lead + VO[cue].d + air : 0);
  T[name] = DUR; D[name] = d; if (cue) { VO[cue].t = DUR + lead; VO[cue].cut = cut ? DUR + d : Infinity; } DUR += d;
}
T.end = DUR;
const seg = (t, name) => (t - T[name]) / D[name];                        // avance 0→1 dentro de un tramo
const inSeg = (t, a, b = a) => t >= T[a] && t < T[b] + D[b];              // ¿estamos entre el tramo a y el b?

/* ── subtítulos (sólo los remates): palabra por palabra, centrados en la franja de abajo ── */
function parsePages(cue) {
  const words = []; let total = 0;
  cue.pages.forEach((pg, pi) => {
    let hl = false, line = 0, cur = '', curHl = false;
    const push = () => { if (!cur) return; const end = cur[cur.length - 1];
      const pause = end === '…' ? 5 : '.?!:'.includes(end) ? 4 : end === ',' ? 2.5 : 0;
      const w = { s: cur, hl: curHl, page: pi, line, w0: total, wt: cur.replace(/[^\p{L}\p{N}]/gu, '').length + 1.5 }; total += w.wt + pause; words.push(w); cur = ''; };
    for (const ch of pg) {
      if (ch === '*') { hl = !hl; continue; }
      if (ch === ' ') { push(); continue; }
      if (ch === '|') { push(); line++; continue; }
      if (!cur) curHl = hl; cur += ch;
    }
    push();
  });
  if (cue.ph) {                                       // frases medidas en el audio: las palabras se reparten dentro de cada frase
    let i = 0;
    for (const [a, b, n] of cue.ph) { const ws = words.slice(i, i + n), tot = ws.reduce((s, w) => s + w.wt, 0); let acc = 0; for (const w of ws) { w.t = cue.t + a + (b - a) * (acc / tot); acc += w.wt; } i += n; }
    for (; i < words.length; i++) words[i].t = cue.t + cue.d;
  } else for (const w of words) { w.t = cue.t + cue.d * (w.w0 / Math.max(1, total)); }
  cue.words = words; cue.npages = cue.pages.length;
}
for (const k in VO) parsePages(VO[k]);
const SUBS = { on: qs.get('subs') !== '0', top: 1352, max: 118 };
function layCaption(text, max = SUBS.max) {          // tamaño que entra en 944 px y posición de cada palabra (centrado)
  let fs = max; while (Math.max(...text.map(s => tw(s, FD(fs)))) > 944) fs -= 2;
  return { fs, x0: text.map(s => 540 - tw(s, FD(fs)) / 2) };
}
function buildSubs() {
  for (const k in VO) {
    const cue = VO[k]; cue.lay = [];
    for (let p = 0; p < cue.npages; p++) {
      const ws = cue.words.filter(w => w.page === p), lines = [];
      for (const w of ws) (lines[w.line] = lines[w.line] || []).push(w);
      const text = lines.map(l => l.map(w => w.s).join(' ')), L0 = layCaption(text);
      lines.forEach((l, li) => { const L = lay(text[li], FD(L0.fs)); let ci = 0; for (const w of l) { w.x = L0.x0[li] + L.g[ci].x; ci += w.s.length + 1; } });
      const next = cue.words.find(w => w.page === p + 1);
      cue.lay.push({ fs: L0.fs, lines, text, t0: ws[0].t, t1: next ? next.t - 0.07 : cue.t + cue.d + 0.45 });
    }
  }
  const cues = Object.values(VO).filter(q => q.lay && q.lay.length).sort((a, b) => a.t - b.t);
  cues.forEach((q, i) => { const last = q.lay[q.lay.length - 1]; if (cues[i + 1]) last.t1 = Math.min(last.t1, cues[i + 1].t - 0.16); last.t1 = Math.min(last.t1, q.cut - 0.13); });
}
function drawWordsLine(c, l, base, S, t, out) {
  c.font = FD(S); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
  for (const w of l) {
    const p = prog(t, w.t - 0.09, w.t + 0.17); if (p <= 0) continue;
    const dy = (1 - E.outBack(p, 1.6)) * S * 1.08 + out * S * 1.25;
    c.lineWidth = S * 0.16; c.strokeStyle = BG; c.strokeText(w.s, w.x, base + dy);                // contorno negro: se lee sobre cualquier fondo
    c.fillStyle = w.hl ? YEL : K.k9;
    if (p < 0.5) { c.globalAlpha = 0.3; c.fillText(w.s, w.x, base + dy + (1 - p) * S * 0.3); c.globalAlpha = 1; }   // smear
    c.fillText(w.s, w.x, base + dy);
  }
}
function drawSubs(c, t) {                             // [VO] una página a la vez, palabra por palabra, al ritmo de la voz
  if (!SUBS.on) return;
  for (const k in VO) {
    const cue = VO[k]; if (!cue.lay || t < cue.t - 0.2 || t > cue.t + cue.d + 0.7) continue;
    for (const pg of cue.lay) {
      if (t < pg.t0 - 0.12 || t > pg.t1 + 0.12) continue;
      const S = pg.fs, cap = S * CAP, out = E.inCubic(prog(t, pg.t1, pg.t1 + 0.1));
      pg.lines.forEach((l, li) => {
        const base = SUBS.top + cap + li * (cap + 26);
        c.save(); c.beginPath(); c.rect(0, base - S * 1.4, W, S * 1.4 + S * 0.22); c.clip();
        drawWordsLine(c, l, base, S, t, out); c.restore();
      });
    }
  }
}
/* Cartel sin voz (mismo estilo que los subtítulos): str con «|» y *amarillo*, palabras repartidas en dur segundos */
const _capt = new Map();
function caption(c, t, t0, t1, str, o = {}) {
  if (t < t0 - 0.12 || t > t1 + 0.12) return;
  let C = _capt.get(str + '|' + t0);
  if (!C) {
    const cue = { pages: [str], t: t0, d: o.dur ?? 0.5 }; parsePages(cue);
    const lines = []; for (const w of cue.words) (lines[w.line] = lines[w.line] || []).push(w);
    const text = lines.map(l => l.map(w => w.s).join(' ')), L0 = layCaption(text, o.max || SUBS.max);
    lines.forEach((l, li) => { const L = lay(text[li], FD(L0.fs)); let ci = 0; for (const w of l) { w.x = L0.x0[li] + L.g[ci].x; ci += w.s.length + 1; } });
    C = { lines, fs: L0.fs }; _capt.set(str + '|' + t0, C);
  }
  const S = C.fs, cap = S * CAP, out = E.inCubic(prog(t, t1, t1 + 0.1)), top = o.top ?? SUBS.top;
  C.lines.forEach((l, li) => {
    const base = top + cap + li * (cap + 26);
    c.save(); c.beginPath(); c.rect(0, base - S * 1.4, W, S * 1.4 + S * 0.22); c.clip(); drawWordsLine(c, l, base, S, t, out); c.restore();
  });
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   3 · CÁMARA, VISTA Y MUNDO
   La cámara mira un punto del mundo (x, y) con un zoom z (claves con easing + sacudidas aparte).
   VIEW agrega una transformación de pantalla: sirve para meter la escena entera en un casillero
   de la grilla (zoom de entrada y de salida) sin que cada escena tenga que saberlo.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const CAMK = [], SHAKES = [], FLASHES = [], IMPACTS = [];
const camKey = (t, x, y, z, e = E.inOutCubic) => CAMK.push({ t, x, y, z, e });
const shake = (t, amp, k = 16) => SHAKES.push({ t, amp, k });
const flash = (t, k = 30, a = 1) => FLASHES.push({ t, k, a });
const impact = (t, dur = 0.05) => IMPACTS.push({ t, dur });                // «impact frame»: el cuadro se invierte en amarillo y negro
const CUT = x => 0;                                  // easing «corte»: se queda quieta hasta la clave y salta
function camera(t) {
  let i = 0; while (i < CAMK.length - 2 && t >= CAMK[i + 1].t) i++;
  const a = CAMK[i], b = CAMK[i + 1], u = b.e(prog(t, a.t, b.t));
  const cam = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)), sx: 0, sy: 0 };
  for (const s of SHAKES) if (t >= s.t) { const d = t - s.t, e = s.amp * Math.exp(-d * s.k), f = Math.floor(d * FPS + 0.001); cam.sx += e * (hash(f * 3.1 + s.t) * 2 - 1); cam.sy += e * (hash(f * 5.7 + s.t + 9) * 2 - 1); }
  return cam;
}
const CAM0 = { x: 540, y: 960, z: 1, sx: 0, sy: 0 };
const flashAt = t => { let a = 0; for (const f of FLASHES) if (t >= f.t) a = Math.max(a, f.a * Math.exp(-(t - f.t) * f.k)); return a; };
const impactAt = t => IMPACTS.some(f => t >= f.t && t < f.t + f.dur);
const VIEW = { s: 1, ox: 0, oy: 0 };
function useCam(c, cam, par = 1) {                    // par < 1 = capa lejana (parallax)
  const z = cam.z, tx = W / 2 - (540 + (cam.x - 540) * par) * z + cam.sx, ty = H / 2 - (960 + (cam.y - 960) * par) * z + cam.sy;
  c.setTransform(VIEW.s * z, 0, 0, VIEW.s * z, VIEW.ox + VIEW.s * tx, VIEW.oy + VIEW.s * ty);
}
function useScreen(c, cam) { const sx = cam ? cam.sx : 0, sy = cam ? cam.sy : 0; c.setTransform(VIEW.s, 0, 0, VIEW.s, VIEW.ox + VIEW.s * sx, VIEW.oy + VIEW.s * sy); }
/* congelado («freeze frame»): el tiempo de la escena se queda quieto entre a y b */
const freeze = (t, a, b) => t < a ? t : t < b ? a : t - (b - a);

/* La grilla del mundo: en coordenadas de mundo (acompaña zoom y paneos), dos capas con parallax. */
function worldGrid(c, cam, a) {
  if (a <= 0.004) return;
  const z = cam.z, lw = 2 / z, lm = 1.5 / z;
  c.fillStyle = YEL;
  for (const far of [true, false]) {
    const par = far ? 0.62 : 1; useCam(c, cam, par);
    const cx = 540 + (cam.x - 540) * par, cy = 960 + (cam.y - 960) * par;
    const x0 = cx - W / 2 / z - 60, x1 = cx + W / 2 / z + 60, y0 = cy - H / 2 / z - 60, y1 = cy + H / 2 / z + 60;
    if (far) {
      c.globalAlpha = a * 0.06;
      for (let x = Math.floor(x0 / GC) * GC; x <= x1; x += GC) c.fillRect(x - lm / 2, y0, lm, y1 - y0);
      for (let y = Math.floor(y0 / GC) * GC; y <= y1; y += GC) c.fillRect(x0, y - lm / 2, x1 - x0, lm);
    } else {
      const sx = Math.floor((x0 - GO) / GC) * GC + GO, sy = Math.floor((y0 - GO) / GC) * GC + GO, k = 8 / Math.sqrt(z);
      c.globalAlpha = a * 0.17;
      for (let x = sx; x <= x1; x += GC) c.fillRect(x - lw / 2, y0, lw, y1 - y0);
      for (let y = sy; y <= y1; y += GC) c.fillRect(x0, y - lw / 2, x1 - x0, lw);
      c.globalAlpha = a * 0.3;
      for (let x = sx; x <= x1; x += GC) for (let y = sy; y <= y1; y += GC) { c.fillRect(x - k, y - lw / 2, k * 2, lw); c.fillRect(x - lw / 2, y - k, lw, k * 2); }
    }
  }
  c.globalAlpha = 1;
}
/* Piso, charco de luz, onomatopeyas y líneas de impacto */
function ground(c, x0, x1, a = 1) { c.globalAlpha = a; c.fillStyle = K.k5; c.fillRect(x0, GYW, x1 - x0, 3); c.globalAlpha = 1; }
function spot(c, x, y, rx, a = 1) {
  c.save(); c.translate(x, y + 4); c.scale(1, 0.16);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(132,132,142,${0.34 * a})`); g.addColorStop(1, 'rgba(132,132,142,0)');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, TAU); c.fill(); c.restore();
}
function boom(c, txt, x, y, t, t0, o = {}) {          // [SFX] la onomatopeya marca dónde va cada efecto
  const dur = o.dur || 0.7, p = prog(t, t0, t0 + dur); if (p <= 0 || p >= 1) return;
  const s = lerp(1.7, 1, E.outBack(prog(t, t0, t0 + 0.16), 2.4)), S = o.size || 110, a = 1 - E.inCubic(prog(t, t0 + dur - 0.14, t0 + dur));
  c.save(); c.translate(x + jit(77, t, o.jit ?? 3, 24), y + jit(78, t, o.jit ?? 3, 24) - p * (o.rise ?? 26)); c.rotate((o.rot ?? -8) * RAD); c.scale(s, s); c.globalAlpha *= a;
  c.font = FD(S); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
  c.lineWidth = S * 0.16; c.strokeStyle = BG; c.strokeText(txt, 0, 0); c.fillStyle = o.col || YEL; c.fillText(txt, 0, 0); c.restore();
}
function burst(c, x, y, t, t0, o = {}) {
  const p = prog(t, t0, t0 + (o.dur || 0.32)); if (p <= 0 || p >= 1) return;
  const n = o.n || 9, r0 = (o.r || 40) + E.outCubic(p) * (o.grow || 70), len = (o.len || 34) * (1 - p);
  c.save(); c.strokeStyle = o.col || YEL; c.lineWidth = o.w || 6; c.lineCap = 'round'; c.globalAlpha *= 1 - p * p;
  for (let i = 0; i < n; i++) { const a = (o.a0 ?? -Math.PI) + (o.arc ?? Math.PI) * (i / (n - 1)); c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); c.lineTo(x + Math.cos(a) * (r0 + len), y + Math.sin(a) * (r0 + len)); c.stroke(); }
  c.restore();
}
function puff(c, x, y, r, a) { if (a <= 0.004) return; c.globalAlpha = a; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.globalAlpha = 1; }
