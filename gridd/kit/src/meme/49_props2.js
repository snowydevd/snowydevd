const mixP = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
/* ══════════════════════════════════════════════════════════════════════════════════════
   6 · UTILERÍA NUEVA (todo dibujado con la paleta: negro, amarillo y grises)
   ══════════════════════════════════════════════════════════════════════════════════════ */
function drawMate(c, x, y, s = 1, rot = 0) {          // mate con bombilla: (x, y) = donde lo agarra la mano
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.strokeStyle = K.k8; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(6, -30); c.lineTo(20, -78); c.stroke();   // bombilla
  c.fillStyle = K.k6; c.beginPath(); c.moveTo(-26, -30); c.bezierCurveTo(-34, 2, -24, 30, 0, 32); c.bezierCurveTo(24, 30, 34, 2, 26, -30); c.closePath(); c.fill();
  c.fillStyle = K.k4; c.beginPath(); c.ellipse(0, -30, 26, 8, 0, 0, TAU); c.fill();
  c.fillStyle = YEL; c.fillRect(-28, -14, 56, 6);                                           // virola
  c.restore();
}
function drawTermo(c, x, y, s = 1, rot = 0) {         // termo bajo el brazo: (x, y) = centro
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rr(c, -24, -92, 48, 184, 16); c.fillStyle = K.k7; c.fill();
  rr(c, -20, -112, 40, 26, 8); c.fillStyle = K.k5; c.fill();
  c.fillStyle = K.k5; c.fillRect(-24, 40, 48, 10); c.fillStyle = YEL; c.fillRect(-24, -40, 48, 8);
  c.strokeStyle = K.k9; c.lineWidth = 3; c.beginPath(); c.moveTo(-12, -78); c.lineTo(-12, 26); c.stroke();
  c.restore();
}
function drawCone(c, x, y, s = 1, rot = 0) {          // cono: (x, y) = base
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.fillStyle = K.k5; rr(c, -48, -12, 96, 12, 3); c.fill();
  c.fillStyle = K.k6; c.beginPath(); c.moveTo(-34, -12); c.lineTo(-8, -112); c.lineTo(8, -112); c.lineTo(34, -12); c.closePath(); c.fill();
  c.fillStyle = YEL; c.beginPath(); c.moveTo(-26, -42); c.lineTo(-19, -70); c.lineTo(19, -70); c.lineTo(26, -42); c.closePath(); c.fill();
  c.restore();
}
function drawWrench(c, x, y, s = 1, rot = 0) {        // llave inglesa (para señalar el auto)
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  rr(c, -8, -10, 96, 20, 9); c.fillStyle = K.k8; c.fill();
  c.beginPath(); c.arc(100, 0, 22, 0.75, TAU - 0.75); c.lineTo(112, 0); c.closePath(); c.fill();
  c.restore();
}
function steeringWheel(c, x, y, s = 1) { c.save(); c.translate(x, y); c.rotate(-0.35); c.strokeStyle = K.k6; c.lineWidth = 9 * s; c.beginPath(); c.ellipse(0, 0, 11 * s, 36 * s, 0, 0, TAU); c.stroke(); c.restore(); }
function keyFob(c, x, y, on) { c.save(); c.translate(x, y); rr(c, -14, -24, 28, 42, 9); c.fillStyle = K.k3; c.fill(); c.fillStyle = on ? YEL : K.k6; c.beginPath(); c.arc(0, -8, 7, 0, TAU); c.fill(); c.restore(); }
function flame(c, x, y, L, w, t, seed) {              // llamarada del escape, hacia +x
  if (L <= 2) return;
  const j = jit(seed, t, 0.12, 40);
  c.save(); c.translate(x, y);
  c.fillStyle = YEL; c.beginPath(); c.moveTo(0, -w * 0.5); c.quadraticCurveTo(L * 0.5, -w * (1.2 + j), L, 0); c.quadraticCurveTo(L * 0.55, w * (1.1 - j), 0, w * 0.5); c.closePath(); c.fill();
  c.fillStyle = K.k9; c.beginPath(); c.moveTo(0, -w * 0.28); c.quadraticCurveTo(L * 0.3, -w * 0.62, L * 0.56, 0); c.quadraticCurveTo(L * 0.3, w * 0.6, 0, w * 0.28); c.closePath(); c.fill();
  c.restore();
}
/* Globo de diálogo (pantalla). tail = [x, y] adonde apunta la colita. */
function bubble(c, x, y, w, h, tail, o = {}) {
  const col = o.col || K.k9, sh = o.shake ? jit(55, o.t || 0, o.shake, 30) : 0;
  c.save(); c.translate(sh, 0);
  c.fillStyle = col; rr(c, x, y, w, h, o.r ?? 34); c.fill();
  if (tail) { const bx = clamp(tail[0], x + 50, x + w - 50), by = tail[1] < y ? y : y + h; c.beginPath(); c.moveTo(bx - 26, by - (tail[1] < y ? -2 : 2)); c.lineTo(tail[0], tail[1]); c.lineTo(bx + 22, by - (tail[1] < y ? -2 : 2)); c.closePath(); c.fill(); }
  c.restore();
}
/* Llamada entrante: MAMÁ */
function callCard(c, x, y, t, t0) {
  const k = E.outBack(prog(t, t0, t0 + 0.26), 2.2); if (k <= 0) return;
  const vib = t < t0 + 0.45 ? 0 : jit(61, t, 4, 30);
  c.save(); c.translate(x + vib, y); c.scale(k, k); c.rotate(-0.04);
  rr(c, -190, -150, 380, 300, 42); c.fillStyle = K.k2; c.fill(); c.lineWidth = 4; c.strokeStyle = K.k6; c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.font = FU(26); c.fillStyle = K.k7; tracked(c, 'LLAMADA ENTRANTE', 0, -92, 2.5, 'center');
  c.font = FD(104); c.fillStyle = K.k9; c.fillText('MAMÁ', -18, 6);
  c.fillStyle = YEL; c.save(); c.translate(124, -30); c.scale(1 + 0.12 * Math.sin(t * 14), 1 + 0.12 * Math.sin(t * 14)); c.beginPath(); c.moveTo(0, 12); c.bezierCurveTo(-30, -10, -16, -34, 0, -20); c.bezierCurveTo(16, -34, 30, -10, 0, 12); c.fill(); c.restore();
  for (const [bx, on] of [[-90, 0], [90, 1]]) { c.fillStyle = on ? YEL : K.k5; c.beginPath(); c.arc(bx, 84, 38, 0, TAU); c.fill();
    c.strokeStyle = on ? BG : K.k9; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); if (on) { c.arc(bx, 84, 15, 0.6, 2.6); } else { c.moveTo(bx - 13, 71); c.lineTo(bx + 13, 97); c.moveTo(bx + 13, 71); c.lineTo(bx - 13, 97); } c.stroke(); }
  c.restore();
}
/* Ficha de un evento de la app (se desliza desde arriba) */
function notifCard(c, t, t0, title, line2, line3) {
  const k = E.outBack(prog(t, t0, t0 + 0.32), 1.6); if (k <= 0) return;
  const y = lerp(470, 650, k);
  c.save(); rr(c, 60, y, 960, 190, 36); c.fillStyle = 'rgba(31,31,35,0.97)'; c.fill(); c.lineWidth = 3; c.strokeStyle = YEL; c.stroke();
  rr(c, 92, y + 34, 96, 96, 24); c.fillStyle = BG; c.fill(); wordmark(c, 140, y + 96, A.wmIcon, 1);
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  c.font = FU(28); c.fillStyle = K.k7; tracked(c, title, 214, y + 56, 2);
  c.font = FD(56); c.fillStyle = K.k9; c.fillText(line2, 214, y + 118);
  c.font = FU(32); c.fillStyle = YEL; c.fillText(line3, 214, y + 162);
  c.restore();
}
/* Cartel vial: LOMO DE BURRO */
function lomoSign(c, x, y, k) {
  if (k <= 0.001) return;
  c.save(); c.translate(x, y);
  c.fillStyle = K.k6; c.fillRect(-7, -300 * k, 14, 300 * k);
  c.translate(0, -360 * k); c.scale(k, k); c.rotate(jit(5, k * 10, 0.02 * (1 - k), 20));
  c.beginPath(); c.moveTo(0, -100); c.lineTo(100, 0); c.lineTo(0, 100); c.lineTo(-100, 0); c.closePath(); c.fillStyle = YEL; c.fill(); c.lineWidth = 8; c.strokeStyle = BG; c.stroke();
  ink(c, () => { c.fillStyle = BG; c.beginPath(); c.moveTo(-56, 26); c.lineTo(-30, 26); c.quadraticCurveTo(0, -36, 30, 26); c.lineTo(56, 26); c.lineTo(56, 38); c.lineTo(-56, 38); c.closePath(); c.fill(); });
  c.fillStyle = YEL; rr(c, -112, 116, 224, 64, 6); c.fill(); c.lineWidth = 5; c.strokeStyle = BG; c.stroke();
  ink(c, () => { c.fillStyle = BG; c.font = FD(40); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('LOMO DE BURRO', 0, 162); });
  c.restore();
}
/* Reloj que gira (placa «3 horas después») */
function clockIcon(c, x, y, r, a) {
  c.save(); c.translate(x, y); c.strokeStyle = K.k9; c.lineWidth = 10; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
  c.lineCap = 'round'; c.strokeStyle = YEL; c.lineWidth = 9; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a * 12 - Math.PI / 2) * r * 0.72, Math.sin(a * 12 - Math.PI / 2) * r * 0.72); c.stroke();
  c.strokeStyle = K.k9; c.lineWidth = 11; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - Math.PI / 2) * r * 0.48, Math.sin(a - Math.PI / 2) * r * 0.48); c.stroke(); c.restore();
}
/* Alambrado (fondo del estacionamiento vacío) */
function fence(c, x0, x1, top) {
  c.save(); c.beginPath(); c.rect(x0, top, x1 - x0, GYW - top); c.clip();
  c.strokeStyle = K.k3; c.lineWidth = 3; c.beginPath();
  for (let x = x0 - (GYW - top); x < x1; x += 46) { c.moveTo(x, GYW); c.lineTo(x + (GYW - top), top); c.moveTo(x + (GYW - top), GYW); c.lineTo(x, top); }
  c.stroke(); c.restore();
  c.fillStyle = K.k4; for (let x = x0; x <= x1; x += 300) c.fillRect(x - 6, top - 10, 12, GYW - top + 10);
  c.fillRect(x0, top - 10, x1 - x0, 8);
}
function bagFloat(c, x, y, t) {                       // bolsa de nylon volando
  c.save(); c.translate(x, y); c.rotate(Math.sin(t * 3) * 0.4); c.fillStyle = K.k7; c.globalAlpha *= 0.85;
  c.beginPath(); c.moveTo(-26, -10); c.quadraticCurveTo(-10, -30 + Math.sin(t * 9) * 6, 20, -16); c.quadraticCurveTo(34, 8, 16, 26); c.quadraticCurveTo(-8, 34, -24, 18); c.closePath(); c.fill();
  c.strokeStyle = K.k7; c.lineWidth = 4; c.beginPath(); c.moveTo(-18, -14); c.quadraticCurveTo(-26, -34, -12, -38); c.stroke(); c.restore();
}
/* Grillo: «cri cri» (pantalla) */
function cricket(c, x, y, t, t0) {
  const p = prog(t, t0, t0 + 0.55); if (p <= 0 || p >= 1) return;
  c.save(); c.globalAlpha = Math.sin(p * Math.PI); c.font = FU(40, 600); c.fillStyle = K.k7; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.translate(x, y - p * 18); c.rotate(-0.08); tracked(c, 'cri cri', 0, 0, 4, 'center'); c.restore();
}
/* Foto que muestra el fotógrafo: el súper en contrapicado, con fondo corrido */
function photoCard(c, cx, cy, k, t) {
  if (k <= 0.001) return;
  const w = 760, h = 520;
  c.save(); c.translate(cx, cy); c.rotate(-0.05 + 0.05 * (1 - k)); c.scale(k, k);
  c.fillStyle = '#D6D6DA'; c.fillRect(-w / 2, -h / 2, w, h + 70); c.fillStyle = BG; c.fillRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36);
  c.save(); c.beginPath(); c.rect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36); c.clip();
  for (let i = 0; i < 26; i++) { c.fillStyle = i % 4 ? K.k4 : yel(0.7); c.fillRect(-w / 2 + hash(i * 3.1) * w - 200, -h / 2 + 30 + hash(i * 7.7) * (h - 160), 200 + hash(i * 1.3) * 400, 2 + hash(i * 9.1) * 5); }
  c.save(); c.translate(-330, 170); c.scale(0.98, 0.98); c.transform(1, 0, -0.18, 1, 0, 0);      // contrapicado: el auto «más grande que la vida»
  c.save(); c.scale(A.super.sc, A.super.sc); for (const wx of CARDEF.super.w) drawWheel(c, wx, -50, 0, 0); c.restore();
  c.drawImage(A.super.c, -A.super.ox, -A.super.oy); c.restore();
  sparkle(c, 250, 70, 60 + 10 * Math.sin(t * 8)); sparkle(c, 250, 70, 22);
  c.restore();
  c.fillStyle = BG; c.font = FU(30); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; tracked(c, 'IMG_4721.JPG', 0, h / 2 + 46, 3, 'center');
  c.restore();
}
