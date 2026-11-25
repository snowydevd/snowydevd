/* ══════════════════════════════════════════════════════════════════════════════════════
   2 · GUION Y LÍNEA DE TIEMPO
   ──────────────────────────────────────────────────────────────────────────────────────
   VO = lo que dice el narrador (la única voz). Para cada línea:
     d     duración de la locución en segundos (si regrabás, poné acá la duración real)
     ph    (opcional) frases medidas en el audio: [inicio, fin, cuántas palabras del subtítulo abarca], en segundos
           desde que arranca la línea. Con esto cada palabra del subtítulo entra cuando la voz la dice.
     say   el texto a leer
     pages cómo se muestra en subtítulos: cada página ≤ 6 palabras, «|» corta el renglón
           y *asteriscos* marcan lo que va en amarillo.
   SEGS = los tramos de la historia, en orden: [nombre, duración mínima, línea de voz, entrada, aire].
   La línea de tiempo se calcula sumando: un tramo dura lo que dura su voz (más entrada y aire)
   o su mínimo, lo que sea mayor. T.nombre = cuándo empieza · D.nombre = cuánto dura.
   Buscá «[VO]» y «[SFX]» en el código para ver dónde cae cada línea y cada efecto de sonido.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const VO = {
  q1:      { d: 3.40, say: '¿Querés ser car spotter… y no tenés un mango?',            pages: ['¿QUERÉS SER|*CAR SPOTTER*…', '…Y NO TENÉS|*UN MANGO*?'] },
  q2:      { d: 2.30, say: 'Armate de valor… y agarrala.',                             pages: ['ARMATE DE VALOR…', '…Y *AGARRALA*.'] },
  job1:    { d: 0.90, say: 'Una changa.',                                              pages: ['UNA *CHANGA*.'] },
  job2:    { d: 0.95, say: 'Otra changa.',                                             pages: ['OTRA *CHANGA*.'] },
  job3:    { d: 0.90, say: 'Y otra más.',                                              pages: ['Y *OTRA MÁS*.'] },
  goal:    { d: 1.10, say: '¡Mil dólares!',                                            pages: ['¡*MIL DÓLARES*!'] },
  buy:     { d: 2.20, say: 'Te alcanza justo para la cámara.',                         pages: ['TE ALCANZA JUSTO|PARA *LA CÁMARA*.'] },
  q3:      { d: 3.00, say: '¿Y a qué auto le vas a sacar la primera foto?',            pages: ['¿Y A QUÉ AUTO', 'LE VAS A SACAR|*LA PRIMERA FOTO*?'] },
  nope:    { d: 1.60, say: 'Mmm… mejor no.',                                           pages: ['MMM…', '*MEJOR NO*.'] },
  gridd:   { d: 1.70, say: 'Tranqui. Usá Gridd.',                                      pages: ['TRANQUI.|USÁ *GRIDD*.'] },
  feed:    { d: 2.70, say: 'Todos los meets, en lista o en mapa.',                     pages: ['TODOS LOS MEETS,|EN *LISTA* O EN *MAPA*.'] },
  go:      { d: 3.10, say: 'Elegís uno, ves dónde y cuándo… y listo.',                 pages: ['ELEGÍS UNO, VES|*DÓNDE* Y *CUÁNDO*…', '…Y *LISTO*.'] },
  crowd:   { d: 3.00, say: 'Pero ojo: ahí van todos los car spotters.',                pages: ['PERO OJO:', 'AHÍ VAN *TODOS*|LOS CAR SPOTTERS.'] },
  own:     { d: 5.20, say: 'Así que armá el tuyo: publicá tu propio evento de barridos. Gratis.', pages: ['ASÍ QUE|*ARMÁ EL TUYO*:', 'PUBLICÁ TU PROPIO|EVENTO DE *BARRIDOS*.', '*GRATIS.*'] },
  form:    { d: 3.30, say: 'Elegís ubicación, horario y subís un flyer.',              pages: ['ELEGÍS *UBICACIÓN*,', '*HORARIO*…', 'Y SUBÍS *UN FLYER*.'] },
  stories: { d: 5.40, say: 'Sale en la app… y todos los días en las historias de Instagram de Gridd.', pages: ['SALE EN *LA APP*…', '…Y *TODOS LOS DÍAS*', 'EN LAS HISTORIAS DE|INSTAGRAM DE *GRIDD*.'] },
  rambla:  { d: 2.60, say: 'Y ahora… los autos vienen a vos.',                         pages: ['Y AHORA…', 'LOS AUTOS|*VIENEN A VOS*.'] },
  logo:    { d: 2.00, say: 'Gridd. Descargá la app.',                                  pages: [] },
};
/*__VO_DUR__*/                                       // (el armado pisa acá las duraciones y frases medidas en la locución)

const SEGS = [
  // nombre     mín.   voz        entrada  aire   corte (al terminar el tramo hay cambio de escena: el subtítulo se va antes)
  ['spawn',     1.40],                               // 1 · LA NADA: aparece el NPC en el medio de la grilla vacía
  ['q1',        0,     'q1',      0.08,    0.30],
  ['nod',       1.10],                               //     asiente
  ['fall',      1.10],                               // 2 · LA PALA: cae de arriba
  ['q2',        0,     'q2',      0.10,    0.25],
  ['grab',      0.85],                               //     la agarra
  ['job1',      1.45,  'job1',    0.20,    0.10,  true],    //     changa 1: obra
  ['job2',      1.45,  'job2',    0.20,    0.10,  true],    //     changa 2: lavadero
  ['job3',      1.45,  'job3',    0.20,    0.10,  true],    //     changa 3: delivery
  ['goal',      1.60,  'goal',    0.25,    0.20,  true],    //     meta: US$ 1.000
  ['buy',       2.60,  'buy',     0.35,    0.20],    // 3 · LA CÁMARA
  ['q3',        0,     'q3',      0.10,    0.20],
  ['junk',      3.00],                               //     la cámara se aleja: cachilas que se desarman
  ['nope',      1.80,  'nope',    0.10,    0.20,  true],
  ['gridd',     2.30,  'gridd',   0.15,    0.30,  true],    // 4 · USÁ GRIDD: levanta el teléfono
  ['feed',      3.20,  'feed',    0.25,    0.20],    //     lista y mapa
  ['go',        3.20,  'go',      0.10,    0.20,  true],    //     abre uno: dónde y cuándo
  ['crowd',     3.30,  'crowd',   0.25,    0.20],    // 5 · EL GIRO: ahí van todos
  ['own',       0,     'own',     0.10,    0.25],    //     armá el tuyo
  ['form',      3.50,  'form',    0.10,    0.20],    //     ubicación, horario, flyer
  ['stories',   0,     'stories', 0.10,    0.45,  true],    //     app + historias
  ['rambla',    5.20,  'rambla',  1.00,    0.20,  true],    // 6 · FINAL: barridos en la rambla
  ['logo',      3.90,  'logo',    0.80,    0.20],    //     cierre
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

/* ── subtítulos: reparto del tiempo de cada línea entre sus palabras ── */
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
  } else for (const w of words) { w.t = cue.t + cue.d * (w.w0 / total); }
  cue.words = words; cue.npages = cue.pages.length;
}
for (const k in VO) parsePages(VO[k]);
const pageT = (k, p) => VO[k].words.find(w => w.page === p).t;           // cuándo arranca una página de subtítulo
const wordT = (k, s) => VO[k].words.find(w => w.s.includes(s)).t;         // cuándo se dice una palabra
const SUBS = { on: qs.get('subs') !== '0', x: 60, top: 312 };
function buildSubs() {
  for (const k in VO) {
    const cue = VO[k]; cue.lay = [];
    for (let p = 0; p < cue.npages; p++) {
      const ws = cue.words.filter(w => w.page === p), lines = [];
      for (const w of ws) (lines[w.line] = lines[w.line] || []).push(w);
      const text = lines.map(l => l.map(w => w.s).join(' '));
      let fs = 128; while (Math.max(...text.map(s => tw(s, FD(fs)))) > 944) fs -= 2;       // el renglón más ancho entra en la grilla
      lines.forEach((l, li) => { const L = lay(text[li], FD(fs)); let ci = 0; for (const w of l) { w.x = L.g[ci].x; ci += w.s.length + 1; } });
      const t0 = ws[0].t, last = ws[ws.length - 1];
      const next = cue.words.find(w => w.page === p + 1);
      cue.lay.push({ fs, lines, text, t0, t1: next ? next.t - 0.07 : cue.t + cue.d + 0.45 });
    }
  }
  const cues = Object.values(VO).filter(q => q.lay && q.lay.length).sort((a, b) => a.t - b.t);
  cues.forEach((q, i) => { const last = q.lay[q.lay.length - 1]; if (cues[i + 1]) last.t1 = Math.min(last.t1, cues[i + 1].t - 0.16); last.t1 = Math.min(last.t1, q.cut - 0.13); });
}
function drawSubs(c, t) {                             // [VO] una página a la vez, palabra por palabra, al ritmo de la voz
  if (!SUBS.on) return;
  for (const k in VO) {
    const cue = VO[k]; if (!cue.lay || t < cue.t - 0.2 || t > cue.t + cue.d + 0.7) continue;
    for (const pg of cue.lay) {
      if (t < pg.t0 - 0.12 || t > pg.t1 + 0.12) continue;
      const S = pg.fs, cap = S * CAP, out = E.inCubic(prog(t, pg.t1, pg.t1 + 0.1));
      pg.lines.forEach((l, li) => {
        const base = SUBS.top + cap + li * (cap + 30);
        c.save(); c.beginPath(); c.rect(SUBS.x - S * 0.25, base - S * 1.4, 1100, S * 1.4 + S * 0.17); c.clip();
        c.font = FD(S); c.textAlign = 'left'; c.textBaseline = 'alphabetic';
        for (const w of l) {
          const p = prog(t, w.t - 0.09, w.t + 0.17); if (p <= 0) continue;
          const dy = (1 - E.outBack(p, 1.6)) * S * 1.08 + out * S * 1.25;
          c.fillStyle = w.hl ? YEL : K.k9;
          if (p < 0.5) { c.globalAlpha = 0.3; c.fillText(w.s, SUBS.x + w.x, base + dy + (1 - p) * S * 0.3); c.globalAlpha = 1; }   // smear
          c.fillText(w.s, SUBS.x + w.x, base + dy);
        }
        c.restore();
      });
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   3 · CÁMARA Y MUNDO
   La cámara mira un punto del mundo (x, y) con un zoom z. Se define por claves y se interpola
   con easing; las sacudidas van aparte. Todo lo que es «mundo» se dibuja con useCam().
   ══════════════════════════════════════════════════════════════════════════════════════ */
const CAMK = [], SHAKES = [], FLASHES = [];
const camKey = (t, x, y, z, e = E.inOutCubic) => CAMK.push({ t, x, y, z, e });
const shake = (t, amp, k = 16) => SHAKES.push({ t, amp, k });
const flash = (t, k = 30, a = 1) => FLASHES.push({ t, k, a });
function camera(t) {
  let i = 0; while (i < CAMK.length - 2 && t >= CAMK[i + 1].t) i++;
  const a = CAMK[i], b = CAMK[i + 1], u = b.e(prog(t, a.t, b.t));
  const cam = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)), sx: 0, sy: 0 };
  for (const s of SHAKES) if (t >= s.t) { const d = t - s.t, e = s.amp * Math.exp(-d * s.k), f = Math.floor(d * FPS + 0.001); cam.sx += e * (hash(f * 3.1 + s.t) * 2 - 1); cam.sy += e * (hash(f * 5.7 + s.t + 9) * 2 - 1); }
  return cam;
}
const flashAt = t => { let a = 0; for (const f of FLASHES) if (t >= f.t) a = Math.max(a, f.a * Math.exp(-(t - f.t) * f.k)); return a; };
function useCam(c, cam, par = 1) {                    // par < 1 = capa lejana (parallax)
  const z = cam.z;
  c.setTransform(z, 0, 0, z, W / 2 - (540 + (cam.x - 540) * par) * z + cam.sx, H / 2 - (960 + (cam.y - 960) * par) * z + cam.sy);
}
/* La grilla del mundo: se dibuja en coordenadas de mundo, así acompaña el zoom y los paneos.
   Dos capas: las líneas intermedias van «más lejos» (se mueven menos con la cámara → parallax). */
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
/* Piso: la línea donde pisan + un charco de luz bajo el personaje */
function ground(c, x0, x1, a = 1) { c.globalAlpha = a; c.fillStyle = K.k5; c.fillRect(x0, GYW, x1 - x0, 3); c.globalAlpha = 1; }
function spot(c, x, y, rx, a = 1) {
  c.save(); c.translate(x, y + 4); c.scale(1, 0.16);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(132,132,142,${0.34 * a})`); g.addColorStop(1, 'rgba(132,132,142,0)');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, TAU); c.fill(); c.restore();
}
/* Onomatopeya: reemplaza al efecto de sonido en pantalla y marca dónde va [SFX] */
function boom(c, txt, x, y, t, t0, o = {}) {
  const p = prog(t, t0, t0 + (o.dur || 0.7)); if (p <= 0 || p >= 1) return;
  const s = lerp(1.7, 1, E.outBack(prog(t, t0, t0 + 0.16), 2.4)), S = o.size || 110, a = 1 - E.inCubic(prog(t, t0 + (o.dur || 0.7) - 0.14, t0 + (o.dur || 0.7)));
  c.save(); c.translate(x + jit(77, t, 3, 24), y + jit(78, t, 3, 24) - p * 26); c.rotate((o.rot ?? -8) * RAD); c.scale(s, s); c.globalAlpha = a;
  c.font = FD(S); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
  c.lineWidth = S * 0.16; c.strokeStyle = BG; c.strokeText(txt, 0, 0); c.fillStyle = o.col || YEL; c.fillText(txt, 0, 0); c.restore();
}
/* Líneas de impacto alrededor de un punto */
function burst(c, x, y, t, t0, o = {}) {
  const p = prog(t, t0, t0 + (o.dur || 0.32)); if (p <= 0 || p >= 1) return;
  const n = o.n || 9, r0 = (o.r || 40) + E.outCubic(p) * (o.grow || 70), len = (o.len || 34) * (1 - p);
  c.save(); c.strokeStyle = o.col || YEL; c.lineWidth = o.w || 6; c.lineCap = 'round'; c.globalAlpha = 1 - p * p;
  for (let i = 0; i < n; i++) { const a = (o.a0 ?? -Math.PI) + (o.arc ?? Math.PI) * (i / (n - 1)); c.beginPath(); c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); c.lineTo(x + Math.cos(a) * (r0 + len), y + Math.sin(a) * (r0 + len)); c.stroke(); }
  c.restore();
}
