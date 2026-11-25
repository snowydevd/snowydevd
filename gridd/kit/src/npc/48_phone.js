/* ══════════════════════════════════════════════════════════════════════════════════════
   ESCENAS 4 y 5 (pantalla del celular) · USÁ GRIDD y ARMÁ EL TUYO
   El celular entra por «match cut»: la cámara se mete en el teléfono que el NPC tiene en la mano.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const PH = { x: 170, y: 585, w: 740, h: 1520, r: 100, bz: 12 };
PH.sx = PH.x + PH.bz; PH.sy = PH.y + PH.bz; PH.sw = PH.w - 2 * PH.bz; PH.sh = PH.h - 2 * PH.bz; PH.sr = PH.r - PH.bz;
const LIST = { y0: 852, w: 684, h: 160, pitch: 172 }, MAPV = { x: PH.sx, y: 840 };
const PINS = [[296, 528], [222, 380], [598, 396], [322, 452], [203, 196], [676, 370]];     // pines en el sprite del mapa
const MYEV = { dow: 'DOM', day: '22', time: '17:00', name: 'BARRIDOS EN LA RAMBLA', zone: 'Rambla de Pocitos, Montevideo' };   // el evento que publica el NPC
const TP = {};                                        // momentos clave de la app, atados a las palabras del narrador
function buildPhoneTimes() {
  TP.in1 = T.feed - 0.16; TP.map = wordT('feed', 'MAPA') - 0.12;                  // [VO] «…o en MAPA»
  TP.pick = T.go + 0.3; TP.where = wordT('go', 'DÓNDE') - 0.06; TP.when = wordT('go', 'CUÁNDO') - 0.06; TP.done = pageT('go', 1);   // [VO] «elegís uno» · «dónde» · «cuándo» · «y listo»
  TP.zoom2 = pageT('own', 1) - 0.42; TP.in2 = pageT('own', 1) - 0.14; TP.plus = pageT('own', 1) + 0.12;   // [VO] «publicá tu propio evento…»
  TP.free = pageT('own', 2);                                                        // [VO][SFX] «Gratis.» → sello
  TP.loc = pageT('form', 0) + 0.15; TP.hour = pageT('form', 1); TP.fly = pageT('form', 2) + 0.1; TP.send = T.form + D.form - 0.3;   // [VO] ubicación · horario · flyer
  TP.app = T.stories + 0.1; TP.story = pageT('stories', 1) - 0.12; TP.daily = pageT('stories', 1) + 0.1; TP.out = T.rambla;     // [VO] «en la app» · «todos los días en las historias»
}
const phoneOn = t => (t >= TP.in1 && t < T.crowd) || (t >= TP.in2 && t < TP.out);

function sprFlyer2(inkOnly) {                         // el flyer del NPC: «Barridos en la rambla» (inkOnly = sólo lo negro, para redibujarlo nítido sobre el halo)
  const w = 600, h = 760, s = mk(w, h), x = s.x; x.textBaseline = 'alphabetic';
  if (!inkOnly) { x.fillStyle = YEL; x.fillRect(0, 0, w, h); }
  x.fillStyle = BG; x.fillRect(0, 0, w, 26); x.fillRect(0, h - 26, w, 26);
  const cs2 = 20; for (let i = 0; i < 30; i += 2) { x.fillRect(i * cs2, 26, cs2, cs2); x.fillRect((i + 1) * cs2, h - 26 - cs2, cs2, cs2); }
  x.font = FU(34); tracked(x, 'EVENTO DE CAR SPOTTERS', w / 2, 98, 6, 'center');
  let fs = 200; while (tw('BARRIDOS', FD(fs)) > w - 70) fs -= 2;
  x.font = FD(fs); x.textAlign = 'center'; x.fillText('BARRIDOS', w / 2, 100 + fs * 0.78);
  const y2 = 100 + fs * 0.78; x.font = FD(92); x.fillText('EN LA RAMBLA', w / 2, y2 + 98);
  // auto en barrido: silueta nítida y fondo corrido
  if (!inkOnly) { x.save(); x.beginPath(); x.rect(0, y2 + 130, w, 220); x.clip(); x.fillStyle = BG; x.fillRect(0, y2 + 130, w, 220);
  for (let i = 0; i < 26; i++) { x.fillStyle = i % 5 === 0 ? YEL : K.k5; x.fillRect(hash(i * 3.1) * w - 120, y2 + 140 + hash(i * 7.7) * 200, 120 + hash(i * 1.3) * 300, 2 + hash(i * 9.1) * 5); }
  const cs = A.photoCars[0]; x.drawImage(cs.c, w / 2 - cs.w / 2, y2 + 130 + 196 - cs.oy);
  x.restore(); }
  x.fillStyle = BG; const y3 = y2 + 350 + 84; x.font = FD(104); x.fillText('DOM 22 · 17 HS', w / 2, y3);
  x.font = FU(40); tracked(x, 'RAMBLA DE POCITOS', w / 2, y3 + 58, 5, 'center');
  return s;
}
let INK_Y = H;                                        // hasta dónde se puede redibujar la tinta de las fechas (arriba de la hoja abierta)
function phoneCard(c, spr, inkSpr, y, s, a, hot) {
  if (a <= 0) return;
  const k = LIST.w / 940;
  c.save(); c.globalAlpha *= a; c.translate(PH.sx + 16 + LIST.w / 2, y + LIST.h / 2); c.scale(s * k, s * k); c.translate(-470, -110);
  cardBox(c, 940, 220, hot); c.drawImage(spr.c, 0, 0);
  if (a >= 0.99 && inkSpr && INK_Y > MAPV.y + 20) { const mc = c.getTransform(), yy = INK_Y; ink(c, () => { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.beginPath(); c.rect(PH.sx, MAPV.y, PH.sw, yy - MAPV.y); c.clip(); c.setTransform(mc); c.drawImage(inkSpr.c, 0, 0); c.restore(); }); }
  c.restore();
}
function listView(c, t, t0, withNew) {                // feed: las tarjetas entran en cascada
  const sc = withNew ? 0 : LIST.pitch * 1.0 * E.outQuart(prog(t, t0 + 0.9, t0 + 1.5));
  for (let i = 0; i < 6; i++) {
    const tin = t0 + 0.08 + i * 0.085, p = prog(t, tin - 0.08, tin + 0.24); if (p <= 0) continue;
    const isNew = withNew && i === 0, spr = isNew ? A.cardNew : A.cards[withNew ? i - 1 : i], inkS = isNew ? A.cardNewInk : A.cardInk[withNew ? i - 1 : i];
    const y = LIST.y0 + i * LIST.pitch - sc + (1 - E.outBack(p, 1.7)) * 260;
    if (y > H + 40 || y + LIST.h < MAPV.y - 10) continue;
    const hot = isNew ? 0.55 + 0.45 * Math.sin((t - t0) * 7) : Math.exp(-Math.max(0, t - tin) * 7) * 0.9;
    phoneCard(c, spr, inkS, y, lerp(0.94, 1, E.outCubic(p)), prog(t, tin - 0.08, tin - 0.02), hot);
    if (isNew && p >= 1) { c.save(); c.translate(PH.sx + PH.sw - 118, y - 14); c.rotate(0.07); c.fillStyle = YEL; c.fillRect(0, 0, 104, 40); const lab = () => { c.font = FU(27); c.fillStyle = BG; c.textBaseline = 'alphabetic'; tracked(c, 'NUEVO', 14, 30, 1.5); }; if (INK_Y > y + 40) ink(c, lab); else lab(); c.restore(); }
  }
}
function mapView(c, t, t0) {                          // mapa: carga por celdas y caen los pines
  const mx = MAPV.x, my = MAPV.y;
  if (t < t0 + 0.5) { const cs = 179;
    for (let r = 0; r < 7; r++) for (let q = 0; q < 4; q++) { const p = prog(t, t0 + (r + q) * 0.02, t0 + (r + q) * 0.02 + 0.2); if (p <= 0) continue; const e = E.outCubic(p), k = lerp(0.8, 1, e); c.globalAlpha = e;
      c.drawImage(A.map.c, q * cs, r * cs, cs, cs, mx + q * cs + cs * (1 - k) / 2, my + r * cs + cs * (1 - k) / 2, cs * k, cs * k); }
    c.globalAlpha = 1;
  } else c.drawImage(A.map.c, mx, my);
  [...PINS.keys()].sort((a, b) => PINS[a][1] - PINS[b][1]).forEach(i => {
    const tp = t0 + 0.22 + i * 0.1, d = t - tp, px = mx + PINS[i][0], py = my + PINS[i][1]; if (d < -0.14) return;
    if (d >= 0 && d < 0.45) { const q = d / 0.45; c.globalAlpha = (1 - q) * 0.9; c.strokeStyle = YEL; c.lineWidth = 3; c.beginPath(); c.ellipse(px, py, 8 + E.outCubic(q) * 44, (8 + E.outCubic(q) * 44) * 0.5, 0, 0, TAU); c.stroke(); c.globalAlpha = 1; }
    const fall = d < 0 ? 1 - E.inQuad(prog(t, tp - 0.14, tp)) : 0, sq = d >= 0 ? Math.exp(-d * 18) * Math.cos(d * 30) : 0, sel = i === 0 && t >= TP.pick ? 0.3 * E.outBack(prog(t, TP.pick, TP.pick + 0.22), 3) : 0;
    c.save(); c.globalAlpha = prog(t, tp - 0.14, tp - 0.08); c.translate(px, py - fall * 150); c.scale((1 + 0.3 * sq) * (1 + sel), (1 - 0.34 * sq) * (1 + sel)); drawPin(c, 0, 0, 1, false); c.restore();
  });
}
function detailSheet(c, t) {                          // [VO] «Elegís uno, ves dónde y cuándo… y listo.»
  const k = E.outBack(prog(t, TP.pick + 0.12, TP.pick + 0.44), 1.15); if (k <= 0.002) return;
  const top = lerp(H + 60, 1010, k), x0 = PH.sx, w = PH.sw, ev = EVENTS[0];
  c.fillStyle = 'rgba(11,11,12,0.5)'; c.globalAlpha = clamp(k); c.fillRect(x0, MAPV.y, w, H); c.globalAlpha = 1;
  rr(c, x0, top, w, 1000, 44); c.fillStyle = '#1B1B1F'; c.fill(); c.lineWidth = 2; c.strokeStyle = K.k5; c.stroke();
  c.fillStyle = K.k5; rr(c, 540 - 38, top + 16, 76, 7, 3.5); c.fill();
  INK_Y = H; phoneCard(c, A.cards[0], A.cardInk[0], top + 44, 1, 1, 0);
  // dos renglones, y cada uno se enciende cuando el narrador lo nombra
  [['DÓNDE', ev.zone, TP.where], ['CUÁNDO', 'Viernes ' + ev.day + ' · ' + ev.time + ' hs', TP.when]].forEach(([lab, val, a], i) => {
    const y = top + 232 + i * 116, lit = t >= a, hot = lit ? Math.exp(-(t - a) * 2.6) : 0, pop = 1 + (lit ? 0.34 * Math.exp(-(t - a) * 9) : 0);
    c.save(); c.translate(x0 + 30, y);
    rr(c, 0, 0, w - 60, 98, 18); c.fillStyle = '#242429'; c.fill(); if (hot > 0.02) { c.globalAlpha = hot; c.lineWidth = 4; c.strokeStyle = YEL; c.stroke(); c.globalAlpha = 1; }
    c.save(); c.translate(54, 49); c.scale(pop, pop);                                       // ícono: pin o reloj
    if (i === 0) drawPin(c, 0, 25, 1.05, false);
    else { c.strokeStyle = YEL; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 21, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(0, -11); c.lineTo(0, 0); c.lineTo(9, 5); c.stroke(); }
    c.restore();
    c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.font = FU(22); c.fillStyle = lit ? YEL : K.k7; tracked(c, lab, 104, 36, 2.5);
    c.font = FU(40); c.fillStyle = K.k9; c.fillText(val, 104, 78);
    c.restore();
  });
  const dn = prog(t, TP.done, TP.done + 0.6); if (dn > 0 && dn < 1) { sparkle(c, 846, top + 226, 54 * Math.sin(dn * Math.PI)); sparkle(c, 236, top + 470, 34 * Math.sin(dn * Math.PI)); }
}
function eventSheet(c, t) {                           // hoja «Nuevo evento»: nombre → ubicación → horario → flyer → publicar
  const k = E.outBack(prog(t, TP.plus + 0.1, TP.plus + 0.42), 1.15) - E.inCubic(prog(t, TP.app - 0.1, TP.app + 0.14)); if (k <= 0.002) return;
  const top = lerp(H + 60, 950, k), x0 = PH.sx, w = PH.sw;
  c.fillStyle = 'rgba(11,11,12,0.5)'; c.globalAlpha = clamp(k); c.fillRect(x0, MAPV.y, w, H); c.globalAlpha = 1;
  rr(c, x0, top, w, 1100, 44); c.fillStyle = '#1B1B1F'; c.fill(); c.lineWidth = 2; c.strokeStyle = K.k5; c.stroke();
  c.fillStyle = K.k5; rr(c, 540 - 38, top + 16, 76, 7, 3.5); c.fill();
  c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillStyle = K.k9; c.font = FD(48); c.fillText('NUEVO EVENTO', x0 + 34, top + 88);
  const rows = [['NOMBRE', 'Barridos en la rambla', TP.plus + 0.5, 0.55], ['UBICACIÓN', 'Rambla de Pocitos', TP.loc, 0.3], ['HORARIO', 'Dom 22 · 17:00', TP.hour, 0.25], ['FLYER', 'flyer-barridos.png', TP.fly, 0.25]];
  rows.forEach(([lab, val, a, dur], i) => {
    const y = top + 130 + i * 86, n = Math.floor(val.length * prog(t, a, a + dur) + 0.001), act = t >= a && t < a + dur + 0.25, done = t >= a + dur;
    c.font = FU(22); c.fillStyle = act ? YEL : K.k7; tracked(c, lab, x0 + 34, y, 2.5);
    c.font = FU(40); c.fillStyle = K.k9; const s = val.slice(0, n); c.fillText(s, x0 + 34, y + 42);
    if (act && !done) { c.fillStyle = YEL; c.fillRect(x0 + 38 + tw(s, FU(40)), y + 10, 4, 36); }
    c.fillStyle = act ? YEL : K.k4; c.fillRect(x0 + 34, y + 54, w - 68, 2);
    const ok = E.outBack(prog(t, a + dur, a + dur + 0.2), 3);                              // tilde al completar
    if (ok > 0) { c.save(); c.translate(x0 + w - 62, y + 22); c.scale(ok, ok); c.strokeStyle = YEL; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(-4, 10); c.lineTo(14, -12); c.stroke(); c.restore(); }
  });
  // detalle de cada paso: pin que cae, y el flyer que sube
  const lp = t - TP.loc - 0.1; if (lp > -0.14 && lp < 1.4) { const px = x0 + w - 130, py = top + 130 + 86 + 40, fall = lp < 0 ? 1 - E.inQuad(prog(lp, -0.14, 0)) : 0, sq = lp >= 0 ? Math.exp(-lp * 18) * Math.cos(lp * 30) : 0;
    c.save(); c.globalAlpha = (1 - prog(lp, 1.1, 1.4)); c.translate(px, py - fall * 120); c.scale(1 + 0.3 * sq, 1 - 0.34 * sq); drawPin(c, 0, 0, 0.9, false); c.restore(); }
  const fp = E.outBack(prog(t, TP.fly + 0.1, TP.fly + 0.45), 1.6); if (fp > 0) { const fw = 92, fh = fw * 760 / 600; c.save(); c.translate(x0 + w - 150, top + 130 + 3 * 86 + 16); c.rotate(-0.08 * fp); c.scale(fp, fp); c.drawImage(A.flyer.c, -fw / 2, -fh / 2, fw, fh); c.restore(); }
  // botón PUBLICAR
  const pr = Math.sin(prog(t, TP.send - 0.03, TP.send + 0.12) * Math.PI), by = top + 482, bh = 92;
  c.save(); c.translate(540, by + bh / 2); c.scale(1 - 0.05 * pr, 1 - 0.05 * pr); rr(c, -(w - 60) / 2, -bh / 2, w - 60, bh, 18); c.fillStyle = YEL; c.fill();
  ink(c, () => { c.fillStyle = BG; c.font = FD(52); c.textBaseline = 'alphabetic'; tracked(c, 'PUBLICAR', 0, 52 * CAP / 2, 1.5, 'center'); }); c.restore();
  tapDot(c, 540 + 150, by + bh / 2 + 6, t, TP.send);
  // [SFX] sello «GRATIS»
  const g = t - TP.free; if (g > -0.02) { const s = lerp(2.4, 1, E.outBack(prog(g, 0, 0.18), 2.2)), a = prog(g, -0.02, 0.05) * (1 - prog(t, TP.loc - 0.25, TP.loc - 0.05));
    if (a > 0) { c.save(); c.globalAlpha = a; c.translate(704, top + 58); c.rotate(-0.13); c.scale(s, s); c.fillStyle = YEL; c.fillRect(-150, -58, 300, 116);
      ink(c, () => { c.fillStyle = BG; c.font = FD(100); c.textBaseline = 'alphabetic'; c.textAlign = 'center'; c.fillText('GRATIS', 0, 100 * CAP / 2); }); c.restore(); } }
}
function storyView(c, t) {                            // [VO] «…y todos los días en las historias de Instagram de Gridd.»
  const sl = E.outExpo(prog(t, TP.story, TP.story + 0.4)); if (sl <= 0) return;
  const x0 = PH.sx + (1 - sl) * PH.sw, w = PH.sw, y0 = PH.sy;
  c.save(); c.translate(x0 - PH.sx, 0);
  c.fillStyle = K.k2; c.fillRect(PH.sx, y0, w, H);
  const u = Math.max(0, t - TP.story - 0.3), day = Math.floor(u / 0.62) % 7, dp = (u / 0.62) % 1, L = 'LMMJVSD';
  for (let i = 0; i < 7; i++) {                         // siete tramos = siete días: la historia vuelve a salir cada día
    const sx = PH.sx + 26 + i * 96, sw = 88;
    rr(c, sx, y0 + 92, sw, 7, 3.5); c.fillStyle = K.k5; c.fill();
    if (i < day) { rr(c, sx, y0 + 92, sw, 7, 3.5); c.fillStyle = K.k9; c.fill(); } else if (i === day) { rr(c, sx, y0 + 92, Math.max(7, sw * dp), 7, 3.5); c.fillStyle = YEL; c.fill(); }
    c.font = FU(24); c.fillStyle = i === day ? YEL : K.k6; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(L[i], sx + sw / 2, y0 + 132);
  }
  c.strokeStyle = YEL; c.lineWidth = 4; c.beginPath(); c.arc(PH.sx + 62, y0 + 188, 31, 0, TAU); c.stroke();
  c.fillStyle = K.k3; c.beginPath(); c.arc(PH.sx + 62, y0 + 188, 24, 0, TAU); c.fill(); c.fillStyle = YEL; c.fillRect(PH.sx + 59, y0 + 172, 6, 32);
  wordmark(c, PH.sx + 112 - A.wmXS.inkL, y0 + 204, A.wmXS, 1);
  const fw = 560, fh = fw * 760 / 600, pop = 1 + 0.03 * Math.exp(-dp * 9);
  c.save(); c.translate(540, y0 + 250 + fh / 2); c.scale(pop, pop); c.drawImage(A.flyer.c, -fw / 2, -fh / 2, fw, fh);
  if (sl >= 0.999) ink(c, () => c.drawImage(A.flyerInk.c, -fw / 2, -fh / 2, fw, fh)); c.restore();
  const g = t - TP.daily; if (g > -0.02) { const s = lerp(2.2, 1, E.outBack(prog(g, 0, 0.18), 2.2)); c.save(); c.globalAlpha = prog(g, -0.02, 0.05); c.translate(PH.sx + PH.sw - 206, y0 + 190); c.rotate(-0.045); c.scale(s, s);
    c.fillStyle = YEL; c.fillRect(-176, -38, 352, 76); const lab = () => { c.fillStyle = BG; c.font = FD(56); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('TODOS LOS DÍAS', 0, 56 * CAP / 2); }; if (sl >= 0.999 && g > 0.2) ink(c, lab); else lab(); c.restore(); }
  c.restore();
}
function scenePhone(c, t) {
  if (!phoneOn(t)) return;
  const second = t >= TP.in2, tin = second ? TP.in2 : TP.in1, a = E.outCubic(prog(t, tin, tin + 0.16));
  const fl = 4 * Math.sin(t * 1.25);
  c.save(); c.globalAlpha = a; c.translate(0, fl);
  rr(c, PH.x, PH.y, PH.w, PH.h, PH.r); c.fillStyle = K.k2; c.fill();
  const edge = c.createLinearGradient(0, PH.y, 0, PH.y + 760); edge.addColorStop(0, '#7A7A84'); edge.addColorStop(1, '#3C3C43'); c.lineWidth = 3; c.strokeStyle = edge; c.stroke();
  c.save(); rr(c, PH.sx, PH.sy, PH.sw, PH.sh, PH.sr); c.fillStyle = '#0D0D0F'; c.fill(); c.clip();
  INK_Y = H;
  if (second) { const k = E.outBack(prog(t, TP.plus + 0.1, TP.plus + 0.42), 1.15) - E.inCubic(prog(t, TP.app - 0.1, TP.app + 0.14)); if (k > 0.002) INK_Y = lerp(H + 60, 950, k) + fl; if (t >= TP.story) INK_Y = 0; }
  c.save(); c.beginPath(); c.rect(PH.sx, MAPV.y, PH.sw, H); c.clip();
  if (!second) {
    if (t < TP.map + 0.12) { const out = E.inCubic(prog(t, TP.map - 0.1, TP.map + 0.02)); c.save(); c.translate(0, out * 700); c.globalAlpha = a * (1 - out); listView(c, t, TP.in1 + 0.1, false); c.restore(); }
    if (t >= TP.map) mapView(c, t, TP.map);
    detailSheet(c, t);
  } else {
    listView(c, t, t >= TP.app ? TP.app : TP.in2 - 2, t >= TP.app);
    eventSheet(c, t);
  }
  c.restore();
  c.fillStyle = K.k3; c.fillRect(PH.sx, MAPV.y - 2, PH.sw, 2);
  // chrome: wordmark, «+» y filtros
  wordmark(c, PH.sx + 30 - A.wmS.inkL, 746, A.wmS, 1);
  const plusOn = second && t >= TP.plus && t < TP.app, px = PH.sx + PH.sw - 60, py = 722;
  if (second) { const pp = prog(t, TP.in2 + 0.05, TP.plus + 0.15); if (pp > 0 && pp < 1) { c.globalAlpha = a * (1 - pp) * 0.9; c.strokeStyle = YEL; c.lineWidth = 3; c.beginPath(); c.arc(px, py, 30 + E.outCubic(pp) * 34, 0, TAU); c.stroke(); c.globalAlpha = a; } }
  c.beginPath(); c.arc(px, py, 30, 0, TAU); if (plusOn) { c.fillStyle = YEL; c.fill(); } else { c.lineWidth = 2; c.strokeStyle = K.k6; c.stroke(); }
  c.fillStyle = plusOn ? BG : K.k9; c.fillRect(px - 13, py - 2, 26, 4); c.fillRect(px - 2, py - 13, 4, 26);
  if (second) tapDot(c, px + 8, py + 10, t, TP.plus);
  let cx = PH.sx + 30; const cy = 772; cx += chip(c, cx, cy, 'ESTE FINDE', 1, 1) + 10; cx += chip(c, cx, cy, 'MONTEVIDEO', 0, 1) + 10; chip(c, cx, cy, 'CANELONES', 0, 1);
  const mapOn = !second && t >= TP.map ? 1 : 0, mw = tw('MAPA', FU(27)) + 40;
  chip(c, PH.sx + PH.sw - 30 - mw, cy, 'MAPA', mapOn, 1);
  if (!second) { tapDot(c, PH.sx + PH.sw - 30 - mw / 2 + 6, cy + 34, t, TP.map); tapDot(c, MAPV.x + PINS[0][0] + 10, MAPV.y + PINS[0][1] - 20, t, TP.pick); }
  if (second) storyView(c, t);
  // barra de estado e isla, siempre arriba de todo
  const by = PH.sy + 31, bx = PH.sx + PH.sw - 96;
  c.font = FU(30); c.fillStyle = K.k8; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText('21:07', PH.sx + 44, PH.sy + 53);
  for (let i = 0; i < 4; i++) c.fillRect(bx - 48 + i * 9, by + 21 - (i + 1) * 5, 6, (i + 1) * 5);
  rr(c, bx, by, 46, 22, 6); c.lineWidth = 2; c.strokeStyle = K.k7; c.stroke(); rr(c, bx + 4, by + 4, 30, 14, 3); c.fill(); c.fillRect(bx + 48, by + 7, 3, 8);
  rr(c, 540 - 82, PH.sy + 20, 164, 44, 22); c.fillStyle = K.k2; c.fill(); c.lineWidth = 2; c.strokeStyle = K.k4; c.stroke();
  c.restore();
  c.restore();
}
