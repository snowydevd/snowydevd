/* ══════════════════════════════════════════════════════════════════════════════════════
   5 · UTILERÍA
   ══════════════════════════════════════════════════════════════════════════════════════ */
/* Pala: (x, y) = punta de la hoja; rot 0 = parada, con el mango hacia arriba. */
const SHV = { top: -322, mid: -186 };                // dónde van las manos, medido desde la punta
const shvPt = (x, y, rot, ly) => [x - ly * Math.sin(rot), y + ly * Math.cos(rot)];
function drawShovel(c, x, y, rot, hot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  if (hot > 0.01) { c.globalAlpha = hot * 0.5; c.strokeStyle = YEL; c.lineWidth = 16; c.lineJoin = 'round'; c.beginPath(); c.moveTo(0, -300); c.lineTo(0, -40); c.stroke(); c.globalAlpha = 1; }   // brillo de «objeto»
  rr(c, -7, -300, 14, 215, 7); c.fillStyle = K.k7; c.fill();
  c.lineWidth = 12; c.strokeStyle = K.k7; c.lineJoin = 'round'; rr(c, -23, -344, 46, 44, 12); c.stroke();
  c.fillStyle = K.k6; rr(c, -11, -114, 22, 32, 5); c.fill();
  c.beginPath(); c.moveTo(-37, -92); c.lineTo(37, -92); c.quadraticCurveTo(42, -40, 0, 0); c.quadraticCurveTo(-42, -40, -37, -92); c.closePath(); c.fillStyle = K.k8; c.fill();
  c.strokeStyle = '#D6D6DA'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-22, -78); c.quadraticCurveTo(-24, -46, -8, -20); c.stroke();
  c.restore();
}
function drawCamera(c, x, y, s = 1, rot = 0) {       // cámara de frente (objetivo hacia nosotros)
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rr(c, -24, -58, 48, 26, 7); c.fillStyle = K.k4; c.fill();
  rr(c, -64, -42, 128, 84, 14); c.fillStyle = K.k3; c.fill(); c.lineWidth = 3; c.strokeStyle = K.k6; c.stroke();
  c.fillStyle = K.k4; rr(c, -62, -40, 28, 80, 11); c.fill();
  c.fillStyle = YEL; c.beginPath(); c.arc(-44, -47, 8, 0, TAU); c.fill();
  c.fillStyle = K.k5; c.beginPath(); c.arc(10, 0, 34, 0, TAU); c.fill();
  c.fillStyle = BG; c.beginPath(); c.arc(10, 0, 25, 0, TAU); c.fill();
  c.strokeStyle = YEL; c.lineWidth = 3; c.beginPath(); c.arc(10, 0, 29.5, 0, TAU); c.stroke();
  c.strokeStyle = K.k7; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.arc(10, 0, 15, -2.4, -1.3); c.stroke();
  c.fillStyle = K.k7; rr(c, 36, -36, 20, 10, 3); c.fill();
  c.restore();
}
function drawCameraSide(c, x, y, s = 1, rot = 0) {   // cámara de perfil (objetivo hacia +x)
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rr(c, -24, -56, 34, 22, 6); c.fillStyle = K.k4; c.fill();
  rr(c, -42, -40, 64, 80, 10); c.fillStyle = K.k3; c.fill(); c.lineWidth = 3; c.strokeStyle = K.k6; c.stroke();
  rr(c, 20, -30, 66, 60, 8); c.fillStyle = K.k4; c.fill(); c.stroke();
  c.fillStyle = YEL; c.fillRect(74, -30, 6, 60);
  c.fillStyle = K.k5; rr(c, 84, -35, 13, 70, 4); c.fill();
  c.fillStyle = YEL; c.beginPath(); c.arc(-12, -45, 7, 0, TAU); c.fill();
  c.restore();
}
function drawPhoneMini(c, x, y, s = 1, rot = 0, on = 1) {   // el teléfono en la mano, con la pantalla hacia nosotros
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rr(c, -38, -74, 76, 148, 15); c.fillStyle = K.k3; c.fill(); c.lineWidth = 3; c.strokeStyle = K.k7; c.stroke();
  rr(c, -32, -67, 64, 134, 10); c.fillStyle = BG; c.fill();
  if (on > 0.01) { c.globalAlpha *= on;
    c.fillStyle = YEL; c.fillRect(-2.5, -58, 5, 22);                                         // la barra del wordmark
    c.fillStyle = '#D6D6DA'; c.fillRect(-20, -53, 13, 12); c.fillRect(8, -53, 13, 12);
    for (let i = 0; i < 3; i++) { const yy = -26 + i * 28; rr(c, -26, yy, 52, 22, 4); c.fillStyle = K.k3; c.fill(); c.fillStyle = YEL; c.fillRect(-23, yy + 3, 13, 16); c.fillStyle = K.k7; c.fillRect(-6, yy + 5, 28, 4); c.fillRect(-6, yy + 13, 18, 3); }
  }
  c.restore();
}
function coin(c, x, y, r, a = 1, spin = 1) {
  if (a <= 0) return;
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.scale(Math.max(0.12, Math.abs(spin)), 1); c.fillStyle = YEL; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
  c.fillStyle = BG; c.font = FD(r * 1.5); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('$', 0, r * 0.52); c.restore();
}
function moth(c, x, y, t, a = 1) {                    // la polilla que sale del bolsillo vacío
  const f = Math.sin(t * 46);
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.fillStyle = K.k8;
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, 0); c.lineTo(s * 17, -12 * f - 6); c.lineTo(s * 13, 9); c.closePath(); c.fill(); }
  c.fillStyle = K.k6; c.beginPath(); c.ellipse(0, 1, 3.5, 9, 0, 0, TAU); c.fill(); c.restore();
}
function tumbleweed(c, x, y, r, rot, a = 1) {         // un cardo rodando: no hay nadie
  c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(rot); c.strokeStyle = K.k6; c.lineWidth = 3; c.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const rr_ = r * (0.45 + hash(i * 3.3) * 0.55), a0 = hash(i * 7.1) * TAU; c.beginPath(); c.ellipse(hash(i) * 8 - 4, hash(i + 3) * 8 - 4, rr_, rr_ * (0.55 + hash(i * 1.7) * 0.45), a0, 0.3, TAU - 0.5); c.stroke(); }
  c.restore();
}
function puffs(c, x, y, t, t0, n = 6, spread = 90, col = K.k6) {   // polvo
  const p = prog(t, t0, t0 + 0.6); if (p <= 0 || p >= 1) return;
  c.save(); c.fillStyle = col;
  for (let i = 0; i < n; i++) { const dir = (i / (n - 1) - 0.5) * 2, e = E.outCubic(p); c.globalAlpha = (1 - p) * 0.8; c.beginPath(); c.arc(x + dir * spread * e, y - (18 + hash(i * 2.3) * 38) * e, (12 + hash(i * 5.1) * 16) * (0.5 + e * 0.7), 0, TAU); c.fill(); }
  c.restore();
}
function whipLines(c, t, tc) {                        // líneas de barrido en los cortes rápidos de la secuencia de changas
  const p = prog(t, tc - 0.12, tc + 0.2); if (p <= 0 || p >= 1) return;
  const a = Math.sin(p * Math.PI);
  c.save();
  for (let i = 0; i < 16; i++) { const y = 560 + hash(i * 9.7 + tc) * 780, len = 300 + hash(i * 3.1 + tc) * 700, x = W + 300 - ((p * 2600 + hash(i * 1.9 + tc) * 1800) % 2400);
    c.globalAlpha = a * (i % 4 === 0 ? 0.9 : 0.4); c.fillStyle = i % 4 === 0 ? YEL : K.k6; c.fillRect(x, y, len, 2 + hash(i) * 4); }
  c.restore();
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   6 · INDICADORES (franja de abajo): PLATA y PÚBLICO, como en un videojuego.
   Arrancan los dos en cero. La plata sube con las changas; el público, recién al final.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const fmtUSD = v => 'US$ ' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function moneyAt(t) {
  if (t < T.job1) return 0;
  const step = (name, a, b) => lerp(a, b, E.outCubic(prog(t, T[name] + D[name] * 0.58, T[name] + D[name] * 0.92)));
  if (t < T.job2) return step('job1', 0, 300);
  if (t < T.job3) return step('job2', 300, 650);
  if (t < T.goal) return step('job3', 650, 1000);
  return lerp(1000, 0, E.inOutCubic(prog(t, T.buy + 0.75, T.buy + 1.55)));          // se va todo en la cámara
}
const crowdAt = t => t < T.rambla ? 0 : E.inOutCubic(prog(t, T.rambla + 1.6, T.rambla + D.rambla - 0.5));
function hudAlpha(t) {
  const a1 = E.outCubic(prog(t, T.q1 + D.q1 * 0.62, T.q1 + D.q1 * 0.62 + 0.3)) * (1 - prog(t, T.gridd + 1.1, T.gridd + 1.4));
  const a2 = E.outCubic(prog(t, T.rambla + 0.5, T.rambla + 0.9)) * (1 - prog(t, T.logo - 0.25, T.logo));
  return Math.max(a1, a2);
}
function drawHud(c, t) {
  const a = hudAlpha(t); if (a <= 0.004) return;
  const m = moneyAt(t), goal = m >= 999.5 && t < T.buy + 0.75, pub = crowdAt(t);
  const inY = (1 - a) * 40, broke = t < T.job1 ? Math.exp(-(t - T.q1 - D.q1 * 0.62) * 9) : t > T.buy + 1.55 ? Math.exp(-(t - T.buy - 1.55) * 8) : 0;
  c.save(); c.globalAlpha = a; c.translate(0, inY); c.textBaseline = 'alphabetic';
  // PLATA (se va cuando se la gasta en la cámara: de ahí en más el problema es el público)
  const pa = 1 - E.inOutCubic(prog(t, T.buy + 2.0, T.buy + 2.35));
  if (pa > 0.004) { c.save(); c.globalAlpha = a * pa;
  c.font = FU(30); c.fillStyle = K.k7; tracked(c, 'PLATA', 60, 1398, 3);
  const pop = t >= T.goal ? 1 + 0.16 * Math.exp(-(t - T.goal) * 9) : 1;
  c.save(); c.translate(204 + jit(31, t, 7 * broke, 30), 1402); c.scale(pop, pop); c.font = FD(60); c.fillStyle = goal ? YEL : K.k9; c.textAlign = 'left'; c.fillText(fmtUSD(m), 0, 0); c.restore();
  const bx = 520, bw = 500, by = 1374;
  rr(c, bx, by, bw, 18, 9); c.fillStyle = K.k4; c.fill();
  if (m > 1) { rr(c, bx, by, Math.max(18, bw * m / 1000), 18, 9); c.fillStyle = YEL; c.fill(); }
  c.font = FU(24); c.fillStyle = goal ? YEL : K.k7; tracked(c, 'META US$ 1.000', bx + bw, 1358, 1.5, 'right');
  c.restore(); }
  // PÚBLICO
  c.font = FU(30); c.fillStyle = K.k7; tracked(c, 'PÚBLICO', 60, 1474, 3);
  for (let i = 0; i < 10; i++) {
    const x = 204 + i * 82, on = pub * 10 > i + 0.5, pk = on ? 1 + 0.25 * Math.exp(-Math.max(0, pub * 10 - i - 0.5) * 4) : 1;
    c.save(); c.translate(x + 37, 1463); c.scale(pk, pk); rr(c, -37, -11, 74, 22, 6); c.fillStyle = on ? YEL : K.k4; c.fill(); c.restore();
  }
  c.restore();
}
function placeChip(c, txt, t, t0, t1) {               // cartel de lugar en las changas
  const a = E.outBack(prog(t, t0 + 0.08, t0 + 0.3), 1.8) * (1 - E.inCubic(prog(t, t1 - 0.14, t1 - 0.04))); if (a <= 0.01) return;
  c.save(); c.translate(60, 600); c.scale(Math.min(1, a), 1); c.font = FU(34);
  const w = tw(txt, c.font) + 3 * (txt.length - 1) + 44; c.fillStyle = YEL; c.fillRect(0, 0, w, 56);
  ink(c, () => { c.font = FU(34); c.fillStyle = BG; c.textBaseline = 'alphabetic'; tracked(c, txt, 22, 40, 3); });
  c.restore();
}
function gain(c, txt, x, y, t, t0) {                  // «+US$ 300» que sube y se va a la barra
  const p = prog(t, t0, t0 + 0.75); if (p <= 0 || p >= 1) return;
  const s = E.outBack(prog(t, t0, t0 + 0.18), 2.6), fly = E.inCubic(prog(t, t0 + 0.4, t0 + 0.75));
  const px = lerp(x, 330, fly), py = lerp(y - 60 * E.outCubic(p), 1380, fly);
  c.save(); c.translate(px, py); c.scale(s * (1 - fly * 0.5), s * (1 - fly * 0.5)); c.globalAlpha = 1 - fly * 0.6;
  coin(c, -8, -22, 26, 1, Math.cos(t * 14)); c.font = FD(74); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
  c.lineWidth = 12; c.strokeStyle = BG; c.strokeText(txt, 30, 0); c.fillStyle = YEL; c.fillText(txt, 30, 0); c.restore();
}
