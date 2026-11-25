/* ══════════════════════════════════════════════════════════════════════════════════════
   5 · PANTALLA DE SELECCIÓN («ELEGÍ TU PERSONAJE»)
   Seis casilleros en la grilla: cinco tipos de gente de juntada y uno bloqueado (VOS).
   El cursor «P1» salta entre casilleros; al elegir uno, el casillero se agranda hasta
   llenar la pantalla (la escena entra desde adentro del casillero) y al terminar vuelve.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const SEL = { x0: 75, y0: 700, w: 450, h: 250, gx: 30, gy: 30 };
const tileRect = i => ({ x: SEL.x0 + (i % 2) * (SEL.w + SEL.gx), y: SEL.y0 + Math.floor(i / 2) * (SEL.h + SEL.gy), w: SEL.w, h: SEL.h });
const FULL = { x: 0, y: 0, w: W, h: H };
const rectLerp = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) });

const DARK = { hood: '#2B2B30', hoodS: '#1F1F23', hoodD: '#141417' };
const CHARS = [
  { short: 'EL ACELERADOR',      name: ['EL QUE ACELERA', 'PARADO'],               stats: [['RUIDO', 10], ['VELOCIDAD', 0]],
    look: { hw: 'cap', hatc: K.k6, acc: 'shades', pal: DARK, mouth: 'smirk' } },
  { short: 'EL AUTO DE LA VIEJA', name: ['EL QUE VINO CON', 'EL AUTO DE LA VIEJA'], stats: [['FACHA', 10], ['CABALLOS', 2]],
    look: { hw: 'hair', hatc: K.k5, acc: 'shades', pal: { hood: '#ADADB6', hoodS: '#8E8E98', hoodD: '#6E6E78' }, mouth: 'smirk' } },
  { short: 'EL EXPLICADOR',      name: ['EL QUE TE EXPLICA', 'TODO LO QUE LE HIZO'],  stats: [['DATOS', 10], ['PAUSAS', 0]],
    look: { hw: 'short', hatc: K.k6, acc: 'glasses stache', pal: { hood: '#5A5A63', hoodS: '#4A4A53', hoodD: '#34343A' }, mouth: 'big' } },
  { short: 'EL FOTÓGRAFO',       name: ['EL QUE SE TIRA AL', 'PISO POR UNA FOTO'],   stats: [['ÁNGULO', 10], ['DIGNIDAD', 0]],
    look: { mouth: 'smile' } },
  { short: 'EL QUE LLEGA TARDE', name: ['EL QUE LLEGA', 'CUANDO YA TERMINÓ'],         stats: [['PUNTUALIDAD', 0], ['MATE', 10]],
    look: { hw: 'beanie', hat: K.k6, pal: { sole: YEL, cords: YEL }, mouth: 'flat', lid: 0.45 } },
  { short: '¿VOS?', locked: true },
];
const SCN = ['s1', 's2', 's3', 's4', 's5'];          // primer tramo de cada personaje
const XS = ['x1', 'x2', 'x3', 'x4', 'x5'];          // tramo de vuelta a la grilla
const sceneOf = t => { for (let i = 4; i >= 0; i--) if (t >= T[SCN[i]]) return t < T[XS[i]] + D[XS[i]] ? i : -1; return -1; };

/* ── cursor P1: dónde está en cada momento ── */
const HOPS = [[1.18, 1], [1.30, 3], [1.42, 2], [1.54, 4], [1.66, 5], [1.84, 0]];   // en la intro: salta como quien no se decide
function cursorAt(t) {
  if (t < T.intro + 1.02) return null;
  if (t < T.s1) {
    let from = 0, to = 0, k = 1, tk = 0;
    for (const [dt, i] of HOPS) { if (t >= T.intro + dt) { from = to; to = i; tk = T.intro + dt; } }
    k = E.outBack(prog(t, tk, tk + 0.1), 2);
    return { from, to, k, a: E.outCubic(prog(t, T.intro + 1.02, T.intro + 1.14)) };
  }
  for (let i = 0; i < 5; i++) {
    if (t < T[SCN[i]] + 0.2) return { from: i, to: i, k: 1, a: 1, sel: prog(t, T[SCN[i]], T[SCN[i]] + 0.2) };
    if (t < T[XS[i]] + 0.26) { if (t >= T[SCN[i]] + 0.2 && t < T[XS[i]]) return null; return null; }
    if (t < T[XS[i]] + D[XS[i]]) { const k = E.outBack(prog(t, T[XS[i]] + 0.26, T[XS[i]] + 0.44), 1.8); return { from: i, to: i + 1, k, a: 1 }; }
  }
  return { from: 5, to: 5, k: 1, a: 1, sel: prog(t, T.lock + 0.15, T.lock + 0.3) };
}
function cursorRect(cu) { const a = tileRect(cu.from), b = tileRect(cu.to); return rectLerp(a, b, cu.k); }

/* ── casilleros ── */
function lockIcon(c, x, y, s, open = 0) {             // candado
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = YEL; c.lineWidth = 12; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-26, -8); c.lineTo(-26, -34 - open * 30); c.arc(0, -34 - open * 30, 26, Math.PI, 0); c.lineTo(26, -8 - open * 30); c.stroke();
  rr(c, -44, -10, 88, 70, 12); c.fillStyle = YEL; c.fill();
  c.fillStyle = BG; c.beginPath(); c.arc(0, 18, 9, 0, TAU); c.fill(); c.fillRect(-4, 18, 8, 22);
  c.restore();
}
function tilePortrait(c, i, r, t, hov, ex = {}) {
  const ch = CHARS[i], dh = Math.max(0, t - hov), hop = hov ? Math.abs(Math.sin(dh * 9)) * 12 * Math.exp(-dh * 3) : 0;
  const S = 0.95, base = Object.assign({ x: r.x + r.w / 2, y: r.y + 104 + 408 * S - hop, s: S, face: i % 2 ? -1 : 1, rim: false, blink: blinkAt(t, i * 1.7), lx: (i % 2 ? -1 : 1) * 0.25 }, ch.look, ex);
  if (i === 3) npc(c, base, (cc) => drawCamera(cc, 0, -300, 0.95, 0));       // el fotógrafo, con la cámara al pecho
  else if (i === 4) npc(c, Object.assign(base, { hR: [-30, -330] }), (cc) => drawMate(cc, -30, -330, 1));
  else npc(c, base);
}
function drawTile(c, i, t, o) {
  const r = tileRect(i), ch = CHARS[i];
  const pop = o.pop ?? 1; if (pop <= 0.001) return;
  c.save(); c.translate(r.x + r.w / 2, r.y + r.h / 2); c.scale(pop, pop); c.translate(-r.x - r.w / 2, -r.y - r.h / 2);
  if (o.shake) c.translate(jit(91, t, o.shake, 30), 0);
  rr(c, r.x, r.y, r.w, r.h, 18); c.fillStyle = K.k2; c.fill();
  c.save(); rr(c, r.x, r.y, r.w, r.h, 18); c.clip();
  // fondo: rayas diagonales muy suaves, como las placas de los juegos de pelea
  c.globalAlpha = o.hov ? 0.12 : 0.05; c.fillStyle = YEL; for (let k = -4; k < 12; k++) { c.beginPath(); c.moveTo(r.x + k * 60, r.y + r.h); c.lineTo(r.x + k * 60 + 26, r.y + r.h); c.lineTo(r.x + k * 60 + 26 + r.h * 0.5, r.y); c.lineTo(r.x + k * 60 + r.h * 0.5, r.y); c.closePath(); c.fill(); }
  c.globalAlpha = 1;
  if (!ch.locked) tilePortrait(c, i, r, t, o.hov);
  else {
    const un = o.unlock || 0;
    if (un < 1) { c.globalAlpha = 1 - un;
      npc(c, { x: r.x + r.w / 2, y: r.y + 104 + 408 * 0.95, s: 0.95, rim: false, hat: K.k3, pal: { skin: K.k3, skinS: K.k3, hood: K.k3, hoodS: K.k3, hoodD: K.k3, pants: K.k3, shoe: K.k3, sole: null, cords: null } });
      c.globalAlpha = 1; lockIcon(c, r.x + r.w / 2, r.y + 108, 1.05 * (1 - un * 0.3), un); c.globalAlpha = 1; }
    if (un > 0) { c.globalAlpha = un; const g = A.wmTile; wordmark(c, r.x + r.w / 2, r.y + 150, g, 1); c.globalAlpha = 1; }
  }
  // franja con el nombre
  c.fillStyle = 'rgba(11,11,12,0.86)'; c.fillRect(r.x, r.y + r.h - 58, r.w, 58);
  c.font = FD(36); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillStyle = o.hov ? YEL : K.k9; c.fillText(ch.short, r.x + r.w / 2, r.y + r.h - 17);
  c.font = FU(24); c.textAlign = 'left'; c.fillStyle = K.k7; tracked(c, ch.locked ? '??' : '0' + (i + 1), r.x + 16, r.y + 34, 2);
  if (o.seen) { const k = E.outBack(o.seen, 3); c.save(); c.translate(r.x + r.w - 34, r.y + 34); c.scale(k, k); c.fillStyle = YEL; c.beginPath(); c.arc(0, 0, 18, 0, TAU); c.fill();
    c.strokeStyle = BG; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-8, 0); c.lineTo(-2, 7); c.lineTo(9, -7); c.stroke(); c.restore(); }
  c.restore();
  c.lineWidth = 2; c.strokeStyle = o.hov ? K.k6 : K.k4; rr(c, r.x, r.y, r.w, r.h, 18); c.stroke();
  if (o.flash > 0) { c.globalAlpha = o.flash; rr(c, r.x, r.y, r.w, r.h, 18); c.fillStyle = YEL; c.fill(); c.globalAlpha = 1; }
  c.restore();
}
function drawCursor(c, t, cu) {
  if (!cu || cu.a <= 0) return;
  const r = cursorRect(cu), pulse = 1 + 0.015 * Math.sin(t * 9), sel = cu.sel ? Math.sin(cu.sel * Math.PI) : 0, g = 10 + 8 * sel;
  c.save(); c.globalAlpha = cu.a; c.translate(r.x + r.w / 2, r.y + r.h / 2); c.scale(pulse + 0.05 * sel, pulse + 0.05 * sel);
  c.lineWidth = g; c.strokeStyle = YEL; rr(c, -r.w / 2 - 9, -r.h / 2 - 9, r.w + 18, r.h + 18, 24); c.stroke();
  c.fillStyle = YEL; rr(c, -r.w / 2 - 14, -r.h / 2 - 50, 84, 46, 10); c.fill();
  ink(c, () => { c.fillStyle = BG; c.font = FD(36); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('P1', -r.w / 2 + 28, -r.h / 2 - 14); });
  c.restore();
}
/* ── título ── */
function selectTitle(c, t) {
  const lockOn = t >= T.lock - 0.05, a0 = T.intro + 0.18;
  if (!lockOn) {
    riseText(c, 'ELEGÍ TU', 540 - tw('ELEGÍ TU', FD(150)) / 2, 440, 150, K.k9, t, a0, t > T.s1 ? T.s1 - 0.2 : undefined, { byWord: true, stg: 0.08, back: 2 });
    riseText(c, 'PERSONAJE', 540 - tw('PERSONAJE', FD(150)) / 2, 588, 150, YEL, t, a0 + 0.2, t > T.s1 ? T.s1 - 0.16 : undefined, { back: 2.2, stg: 0.02 });
  } else {
    riseText(c, '¿Y VOS?', 540 - tw('¿Y VOS?', FD(150)) / 2, 440, 150, K.k9, t, T.lock + 0.12, undefined, { byWord: true, stg: 0.08, back: 2 });
    riseText(c, '¿CUÁL SOS?', 540 - tw('¿CUÁL SOS?', FD(150)) / 2, 588, 150, YEL, t, T.lock + 0.42, undefined, { byWord: true, stg: 0.1, back: 2.2 });
  }
  // chip de abajo del título
  const txt = lockOn ? 'COMENTÁ ABAJO  ↓' : 'EDICIÓN JUNTADA DE AUTOS  ·  PARTE 1', k = lockOn ? E.outBack(prog(t, T.lock + 0.6, T.lock + 0.85), 2) : E.outBack(prog(t, T.intro + 0.5, T.intro + 0.75), 2) * (t > T.s1 ? 1 - prog(t, T.s1 - 0.1, T.s1 + 0.1) : 1);
  if (k > 0.01) { c.save(); c.font = FU(28); const w = tw(txt, c.font) + 2.4 * txt.length + 56; c.translate(540, 646); c.scale(k, k);
    rr(c, -w / 2, -24, w, 48, 24); c.fillStyle = lockOn ? YEL : K.k3; c.fill(); if (!lockOn) { c.lineWidth = 2; c.strokeStyle = K.k5; c.stroke(); }
    const draw = () => { c.font = FU(28); c.fillStyle = lockOn ? BG : YEL; c.textBaseline = 'alphabetic'; tracked(c, txt, 0, 10, 2.4, 'center'); };
    lockOn ? ink(c, draw) : draw(); c.restore(); }
}
/* ── la pantalla entera ── */
function seenAt(t, i) { return i < 5 && t > T[XS[i]] + 0.2 ? prog(t, T[XS[i]] + 0.2, T[XS[i]] + 0.45) : 0; }
function drawSelect(c, t, skip = -1) {
  selectTitle(c, t);
  const cu = cursorAt(t), hovI = cu ? (cu.k > 0.5 ? cu.to : cu.from) : -1;
  for (let i = 0; i < 6; i++) {
    if (i === skip) continue;
    const pop = E.outBack(prog(t, T.intro + 0.55 + i * 0.07, T.intro + 0.85 + i * 0.07), 1.8);
    let hovT = 0; if (i === hovI) hovT = hoverSince(t, i);
    const lock = i === 5 && t >= T.lock ? 6 * Math.exp(-(t - T.lock - 0.3) * 6) * (t > T.lock + 0.3 ? 1 : 0) : 0;
    const un = i === 5 ? E.outCubic(prog(t, T.fin + 0.25, T.fin + 0.55)) : 0;
    drawTile(c, i, t, { pop, hov: i === hovI ? hovT : 0, seen: seenAt(t, i), flash: cu && cu.sel && i === cu.to ? Math.sin(cu.sel * Math.PI) * 0.55 : 0, shake: lock, unlock: un });
  }
  drawCursor(c, t, cu);
  if (t >= T.lock + 0.3 && t < T.fin + 0.25) {        // [SFX] BLOQUEADO
    const r = tileRect(5), k = E.outBack(prog(t, T.lock + 0.3, T.lock + 0.45), 2.5) * (1 - E.inCubic(prog(t, T.fin + 0.1, T.fin + 0.25)));
    c.save(); c.translate(r.x + r.w / 2, r.y + r.h / 2 - 6); c.rotate(-0.12); c.scale(k, k); c.fillStyle = YEL; c.fillRect(-170, -38, 340, 76);
    ink(c, () => { c.fillStyle = BG; c.font = FD(60); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('BLOQUEADO', 0, 60 * CAP / 2); }); c.restore();
  }
}
function hoverSince(t, i) {                           // desde cuándo el cursor está sobre el casillero i (para el saltito del personaje)
  if (t < T.s1) { let since = T.intro + 1.02; for (const [dt, j] of HOPS) if (t >= T.intro + dt && j === i) since = T.intro + dt; return since; }
  return i === 0 ? T.intro + 1.84 : T[XS[i - 1]] + 0.3;
}

/* ── placa del luchador (arriba): nombre + dos barras de «estadísticas» ── */
function fighterCard(c, i, t) {
  const ch = CHARS[i], t0 = T[SCN[i]] + 0.42, k = E.outExpo(prog(t, t0, t0 + 0.4)), out = E.inCubic(prog(t, T[XS[i]] - 0.05, T[XS[i]] + 0.12));
  if (k <= 0) return;
  c.save(); c.translate(lerp(-1150, 0, k) - out * 1150, 0);
  c.beginPath(); c.moveTo(48, 300); c.lineTo(1050, 300); c.lineTo(1030, 604); c.lineTo(30, 604); c.closePath(); c.fillStyle = 'rgba(11,11,12,0.88)'; c.fill(); c.lineWidth = 3; c.strokeStyle = YEL; c.stroke();
  c.fillStyle = YEL; c.beginPath(); c.moveTo(64, 278); c.lineTo(170, 278); c.lineTo(160, 324); c.lineTo(54, 324); c.closePath(); c.fill();
  ink(c, () => { c.fillStyle = BG; c.font = FD(34); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('P1  0' + (i + 1), 72, 314); });
  let fs = 92; while (Math.max(tw(ch.name[0], FD(fs)), tw(ch.name[1], FD(fs))) > 930) fs -= 2;
  riseText(c, ch.name[0], 74, 404, fs, K.k9, t, t0 + 0.1, undefined, { byWord: true, stg: 0.05 });
  riseText(c, ch.name[1], 74, 404 + fs * 0.98, fs, YEL, t, t0 + 0.22, undefined, { byWord: true, stg: 0.05 });
  ch.stats.forEach(([lab, v], j) => {
    const y = 536 + j * 46, f = prog(t, t0 + 0.45 + j * 0.18, t0 + 0.85 + j * 0.18), n = Math.round(v * E.outCubic(f));
    c.font = FU(28); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = K.k7; tracked(c, lab, 76, y + 10, 2.5);
    for (let b = 0; b < 10; b++) { const on = b < n; rr(c, 370 + b * 52, y - 12, 44, 22, 5); c.fillStyle = on ? YEL : K.k4; c.fill(); }
    const zero = v === 0 && f >= 1, sh = zero ? jit(40 + j, t, 3 * Math.exp(-(t - t0 - 0.85 - j * 0.18) * 4), 30) : 0;
    c.font = FD(46); c.textAlign = 'right'; c.fillStyle = v === 0 ? YEL : K.k9; c.fillText(String(n), 1000 + sh, y + 16);
  });
  c.restore();
}
/* entrada y salida de la escena: el casillero crece hasta llenar la pantalla (y vuelve) */
function sceneWindow(t, i) {
  const a = T[SCN[i]], x = T[XS[i]];
  if (t < a + 0.16) return null;
  let k;
  if (t < x) k = E.inOutCubic(prog(t, a + 0.16, a + 0.5));
  else k = 1 - E.inOutCubic(prog(t, x, x + 0.26));
  if (k <= 0.001) return null;
  return { r: rectLerp(tileRect(i), FULL, k), s: lerp(0.36, 1, k), k };
}
