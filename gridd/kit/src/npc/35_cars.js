/* ══════════════════════════════════════════════════════════════════════════════════════
   7 · AUTOS
   Siluetas genéricas, sin marca ni logo. Todas se dibujan en un espacio de 640 px de largo
   (piso en y=0, ruedas de radio 50) mirando hacia +x, y se guardan como sprites.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const ARCH = (x, cx) => x.arc(cx, -48, 62, 0.29, Math.PI - 0.29, true);
const BELLY = (x, w) => { x.lineTo(586, -30); ARCH(x, w[1]); x.lineTo(194, -30); ARCH(x, w[0]); x.lineTo(22, -30); x.bezierCurveTo(14, -30, 10, -34, 8, -40); };
const CARDEF = {
  gt: {                                              // coupé gran turismo
    w: [132, 524], body: '#1F1F23', rimc: '#A4A4AE',
    top: x => { x.bezierCurveTo(2, -52, 2, -80, 8, -104); x.lineTo(18, -128); x.lineTo(30, -134); x.bezierCurveTo(60, -138, 96, -140, 126, -142); x.bezierCurveTo(186, -162, 236, -178, 296, -178);
                x.bezierCurveTo(340, -178, 384, -166, 428, -136); x.bezierCurveTo(492, -130, 566, -118, 606, -102); x.bezierCurveTo(626, -94, 636, -78, 636, -60); x.lineTo(632, -40); x.bezierCurveTo(630, -32, 624, -30, 614, -30); },
    win: x => { x.moveTo(158, -144); x.bezierCurveTo(208, -162, 250, -169, 296, -169); x.bezierCurveTo(334, -169, 372, -160, 412, -139); x.closePath(); },
    pillars: [286], tail: [[6, -104], [16, -126], [30, -126], [24, -104]], head: [[598, -103], [628, -92], [635, -72], [612, -82]],
  },
  super: {                                           // deportivo de motor central, bajo y en cuña
    w: [132, 524], body: YEL, rimc: null, dark: true,
    top: x => { x.bezierCurveTo(2, -50, 2, -72, 8, -92); x.lineTo(20, -116); x.lineTo(76, -124); x.bezierCurveTo(140, -132, 196, -146, 256, -148); x.bezierCurveTo(306, -150, 346, -140, 402, -108);
                x.bezierCurveTo(476, -96, 560, -76, 612, -60); x.bezierCurveTo(628, -55, 636, -48, 636, -42); x.lineTo(634, -36); x.bezierCurveTo(632, -31, 626, -30, 616, -30); },
    win: x => { x.moveTo(226, -139); x.bezierCurveTo(256, -143, 290, -143, 308, -140); x.lineTo(390, -107); x.lineTo(244, -110); x.closePath(); },
    pillars: [], tail: [[8, -94], [18, -112], [34, -112], [28, -94]], head: [[566, -78], [606, -64], [612, -54], [580, -62]],
    extra: (x) => { x.fillStyle = BG; x.beginPath(); x.moveTo(150, -104); x.lineTo(216, -106); x.lineTo(200, -66); x.lineTo(166, -66); x.closePath(); x.fill();   // toma de aire
                    x.fillRect(2, -152, 92, 9); x.fillRect(28, -144, 7, 24); x.fillRect(66, -144, 7, 22); },                                                        // alerón
  },
  spider: {                                          // descapotable
    w: [132, 524], body: '#C9C9CF', rimc: null, dark: true,
    top: x => { x.bezierCurveTo(2, -52, 2, -80, 8, -100); x.lineTo(18, -122); x.bezierCurveTo(80, -128, 160, -130, 226, -130); x.bezierCurveTo(238, -158, 292, -158, 304, -130); x.lineTo(420, -126);
                x.bezierCurveTo(490, -122, 566, -112, 606, -98); x.bezierCurveTo(626, -90, 636, -76, 636, -60); x.lineTo(632, -40); x.bezierCurveTo(630, -32, 624, -30, 614, -30); },
    win: x => { x.moveTo(418, -127); x.lineTo(372, -170); x.lineTo(384, -172); x.lineTo(440, -127); x.closePath(); },
    pillars: [], tail: [[6, -100], [16, -120], [30, -120], [24, -100]], head: [[598, -99], [628, -88], [635, -70], [612, -80]],
  },
  hatch: {                                           // compacto (el del lavadero)
    w: [132, 524], body: '#55555E', rimc: '#A4A4AE',
    top: x => { x.lineTo(6, -112); x.bezierCurveTo(8, -150, 36, -180, 104, -183); x.lineTo(330, -183); x.bezierCurveTo(380, -181, 420, -152, 452, -126); x.bezierCurveTo(520, -120, 590, -110, 622, -98);
                x.bezierCurveTo(634, -92, 638, -76, 638, -58); x.lineTo(634, -40); x.bezierCurveTo(632, -32, 626, -30, 616, -30); },
    win: x => { x.moveTo(50, -128); x.bezierCurveTo(54, -160, 78, -173, 110, -173); x.lineTo(326, -173); x.bezierCurveTo(366, -171, 396, -150, 420, -129); x.closePath(); },
    pillars: [178, 300], tail: [[4, -106], [4, -128], [16, -128], [16, -106]], head: [[604, -104], [630, -94], [636, -76], [614, -86]],
  },
  junk: {                                            // cachila: sedán viejo y cuadrado
    w: [132, 524], body: '#4A4A53', rimc: '#84848E',
    top: x => { x.lineTo(4, -112); x.lineTo(12, -130); x.lineTo(124, -134); x.lineTo(172, -181); x.lineTo(388, -181); x.lineTo(448, -132); x.lineTo(604, -126); x.lineTo(632, -116); x.lineTo(636, -70); x.lineTo(634, -40); x.lineTo(616, -30); },
    win: x => { x.moveTo(140, -137); x.lineTo(180, -173); x.lineTo(384, -173); x.lineTo(432, -137); x.closePath(); },
    pillars: [252, 330], tail: [[4, -104], [4, -124], [14, -124], [14, -104]], head: [[612, -112], [632, -108], [634, -92], [614, -94]],
    extra: (x) => {                                  // parches de masilla y óxido, parabrisas rajado
      x.fillStyle = '#6B6B74'; x.beginPath(); x.moveTo(300, -128); x.lineTo(410, -124); x.lineTo(400, -60); x.lineTo(310, -64); x.closePath(); x.fill();
      x.fillStyle = '#34343A'; for (const [px, py, r] of [[70, -86, 22], [96, -70, 14], [520, -108, 16], [220, -52, 18], [560, -70, 12]]) { x.beginPath(); x.ellipse(px, py, r, r * 0.7, 0.4, 0, TAU); x.fill(); }
      x.strokeStyle = K.k7; x.lineWidth = 2.5; x.beginPath(); x.moveTo(400, -166); x.lineTo(388, -150); x.lineTo(404, -146); x.lineTo(396, -138); x.stroke();
    },
  },
};
function carShape(x, d) { x.beginPath(); x.moveTo(8, -40); d.top(x); BELLY(x, d.w); x.closePath(); }
function sprCar(kind, sc, soft) {                     // soft = sólo la masa, para los ecos del motion blur
  const d = CARDEF[kind], pad = 24, s = mk(Math.ceil((640 + pad * 2) * sc), Math.ceil(240 * sc)), x = s.x;
  s.ox = pad * sc; s.oy = 218 * sc; s.sc = sc; s.kind = kind;
  x.translate(s.ox, s.oy); x.scale(sc, sc); x.lineJoin = 'round'; x.lineCap = 'round';
  carShape(x, d); x.fillStyle = d.body; x.fill();
  if (soft) { x.fillStyle = '#0E0E10'; for (const wx of d.w) { x.beginPath(); x.arc(wx, -50, 50, 0, TAU); x.fill(); } return s; }
  x.save(); x.clip();
  x.fillStyle = d.dark ? 'rgba(11,11,12,0.2)' : 'rgba(11,11,12,0.3)'; x.fillRect(0, -70, 640, 44);                                   // zócalo
  x.strokeStyle = d.dark ? 'rgba(11,11,12,0.45)' : 'rgba(214,214,218,0.16)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(10, -104); x.bezierCurveTo(200, -112, 440, -106, 630, -84); x.stroke();   // cintura
  x.strokeStyle = 'rgba(11,11,12,0.55)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(290, -140); x.lineTo(286, -34); x.moveTo(436, -130); x.lineTo(444, -40); x.stroke();                          // puertas
  if (d.extra) d.extra(x);
  x.restore();
  x.beginPath(); d.win(x); x.fillStyle = BG; x.fill();
  x.fillStyle = d.body; for (const px of d.pillars) x.fillRect(px - 5, -184, 11, 50);
  x.save(); x.beginPath(); d.win(x); x.clip(); x.strokeStyle = 'rgba(214,214,218,0.16)'; x.lineWidth = 3; x.beginPath(); x.moveTo(210, -150); x.lineTo(246, -164); x.moveTo(330, -162); x.lineTo(368, -148); x.stroke(); x.restore();
  if (d.rimc) { x.beginPath(); x.moveTo(8, -40); d.top(x); x.strokeStyle = d.rimc; x.lineWidth = 2.6; x.stroke(); }             // contraluz
  const poly = (pts, col) => { x.fillStyle = col; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fill(); };
  poly(d.tail, d.body === YEL ? BG : YEL); poly(d.head, d.body === YEL ? '#D6D6DA' : YEL);
  x.fillStyle = d.dark ? 'rgba(11,11,12,0.6)' : K.k6; x.fillRect(304, -124, 24, 4);
  return s;
}
function drawWheel(c, x, y, ang, sp, hub = true) {
  const a0 = c.globalAlpha;
  c.fillStyle = '#0E0E10'; c.beginPath(); c.arc(x, y, 50, 0, TAU); c.fill(); c.lineWidth = 2; c.strokeStyle = K.k4; c.stroke();
  c.fillStyle = K.k2; c.beginPath(); c.arc(x, y, 33, 0, TAU); c.fill(); c.lineWidth = 3; c.strokeStyle = K.k6; c.stroke();
  if (!hub) { c.fillStyle = K.k5; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); return; }
  const n = sp > 300 ? 5 : 1; c.strokeStyle = K.k7; c.lineWidth = 4.5; c.lineCap = 'round'; c.globalAlpha = a0 * (sp > 300 ? 0.3 : 1);
  for (let k = 0; k < n; k++) for (let i = 0; i < 5; i++) { const a = ang + i * TAU / 5 - k * 0.2; c.beginPath(); c.moveTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); c.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); c.stroke(); }
  c.globalAlpha = a0; c.fillStyle = K.k8; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill();
}
/* (x, y) = punto del piso bajo la cola. o: { ang, spd, bob, flip, noHub: índice de rueda sin taza } */
function drawCar(c, sp, x, y, o = {}) {
  const d = CARDEF[sp.kind];
  c.save(); c.translate(x, y); if (o.flip) c.scale(-1, 1);
  c.save(); c.scale(sp.sc, sp.sc); d.w.forEach((wx, i) => drawWheel(c, wx, -50, o.ang || 0, o.spd || 0, o.noHub !== i)); c.restore();
  c.drawImage(sp.c, -sp.ox, -sp.oy + (o.bob || 0));
  c.restore();
}
