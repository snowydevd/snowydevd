/* ══════════════════════════════════════════════════════════════════════════════════════
   PERSONAJE 3 · EL QUE TE EXPLICA TODO LO QUE LE HIZO AL AUTO
   Habla y habla (la lista de modificaciones no termina nunca) · placa «3 HORAS DESPUÉS…» ·
   el que escuchaba ya es un esqueleto, con telarañas y una mosca; él sigue:
   «…y eso que no te conté del motor».
   ══════════════════════════════════════════════════════════════════════════════════════ */
const C3 = { carTail: -420, ex: 520, li: 840 };
const MODS = ['LE BAJÉ 4 CM', 'ESCAPE DIRECTO', 'FILTRO CÓNICO', 'LLANTAS 18', 'LED POR TODOS LADOS', 'REPROGRAMACIÓN', 'TURBO (CHIQUITO)', 'BUJÍAS DE IRIDIO',
              'VOLANTE DE CARRERA', 'ALERÓN (CASERO)', 'PINZAS PINTADAS', '3 AROMATIZANTES', 'POMO DE CAMBIOS NUEVO'];
const BUB3 = { x: 64, y: 622, w: 730, h: 180 };
const babble = t => ['big', 'o', 'smile', 'O', 'flat', 'big'][Math.floor(t * 11) % 6];
function c3World(c, t) {
  const night = t >= T.q3, u = t - T.s3;
  ground(c, -800, 1600); spot(c, C3.ex, GYW, 230); spot(c, C3.li, GYW, 200);
  drawCar(c, A.gt, C3.carTail, GYW, {});
  if (night) {                                         // telaraña en el espejo del auto
    c.save(); c.strokeStyle = K.k7; c.lineWidth = 2; c.globalAlpha = 0.7; const ox = 260, oy = GYW - 210;
    for (let i = 0; i < 7; i++) { const a = -0.2 + i * 0.26; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(a) * 90, oy + Math.sin(a) * 90); c.stroke(); }
    for (let r = 30; r <= 90; r += 30) { c.beginPath(); for (let i = 0; i < 7; i++) { const a = -0.2 + i * 0.26; c.lineTo(ox + Math.cos(a) * r, oy + Math.sin(a) * r); } c.stroke(); }
    c.restore();
  }
  // el que explica: señala el auto con la llave inglesa y gesticula con la otra mano
  const g = Math.sin(t * 7), p = Object.assign({ x: C3.ex, y: GYW, s: 1, face: 1, blink: blinkAt(t, 4), lean: 0.05, lx: 0.55 }, CHARS[2].look,
    { hL: [-158, -372 + 18 * Math.sin(t * 5)], hR: [70 + 16 * g, -330 + 34 * Math.sin(t * 6.3)], mouth: babble(t) });
  npc(c, p, (cc) => drawWrench(cc, -160, -372 + 18 * Math.sin(t * 5), 0.9, Math.PI + 0.15));
  // el que escucha
  const q = { x: C3.li, y: GYW, s: 1, face: -1, hat: K.k7, lx: 0.8, blink: blinkAt(t, 7) };
  if (!night) {
    const bored = prog(t, T.s3 + 0.8, T.p3); q.hdy = 7 * Math.abs(Math.sin(t * 6)) * (1 - bored); q.mouth = bored < 0.4 ? 'smile' : 'flat'; q.lid = 0.65 * bored; q.lean = -0.04 * bored;
  } else {
    Object.assign(q, { skull: 1, lean: -0.09, crouch: 16, tilt: 0.28, lx: 0.3, blink: 0, rim: false });
  }
  npc(c, q);
  if (night) {                                         // telarañas, araña y mosca
    const hx = C3.li - 30, hy = GYW - 380;
    c.save(); c.strokeStyle = K.k8; c.lineWidth = 2; c.globalAlpha = 0.75;
    const ox = hx - 50, oy = hy - 60; for (let i = 0; i < 6; i++) { const a = 1.2 + i * 0.32; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(a) * 120, oy + Math.sin(a) * 120); c.stroke(); }
    for (let r = 40; r <= 120; r += 40) { c.beginPath(); for (let i = 0; i < 6; i++) { const a = 1.2 + i * 0.32; c.lineTo(ox + Math.cos(a) * r, oy + Math.sin(a) * r); } c.stroke(); }
    c.restore();
    const sy = hy + 20 + 26 * Math.sin(t * 2.2), sx = hx + 70;
    c.strokeStyle = K.k7; c.lineWidth = 1.5; c.beginPath(); c.moveTo(sx, hy - 100); c.lineTo(sx, sy); c.stroke();
    c.fillStyle = K.k3; c.beginPath(); c.arc(sx, sy + 8, 11, 0, TAU); c.fill(); c.strokeStyle = K.k3; c.lineWidth = 3;
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { c.beginPath(); c.moveTo(sx, sy + 8); c.lineTo(sx + s * 20, sy + 2 + i * 6); c.lineTo(sx + s * 26, sy + 10 + i * 6); c.stroke(); }
    const fa = t * 5.2, fx = hx + Math.sin(fa) * 110, fy = hy - 40 + Math.sin(fa * 2) * 46;
    c.fillStyle = K.k3; c.beginPath(); c.arc(fx, fy, 7, 0, TAU); c.fill(); c.fillStyle = K.k8; c.globalAlpha = 0.6;
    const fw = Math.abs(Math.sin(t * 90)) * 9; c.beginPath(); c.ellipse(fx - 5, fy - 7, 6, fw, -0.4, 0, TAU); c.ellipse(fx + 5, fy - 7, 6, fw, 0.4, 0, TAU); c.fill(); c.globalAlpha = 1;
  }
}
function c3Screen(c, t) {
  const night = t >= T.q3, k = E.outBack(prog(t, T.s3 + 0.55, T.s3 + 0.8), 1.8);
  if (night) {                                         // luna y estrellas: se hizo de noche
    const a = E.outCubic(prog(t, T.q3, T.q3 + 0.4));
    c.save(); c.globalAlpha = a; c.fillStyle = K.k8; c.beginPath(); c.arc(960, 700, 40, 0, TAU); c.fill(); c.fillStyle = BG; c.beginPath(); c.arc(978, 688, 36, 0, TAU); c.fill();
    c.fillStyle = K.k7; for (let i = 0; i < 9; i++) { const tw_ = 0.5 + 0.5 * Math.sin(t * 3 + i * 2.1); c.globalAlpha = a * tw_; c.fillRect(840 + hash(i * 2.3) * 210, 640 + hash(i * 5.1) * 160, 4, 4); }
    c.restore();
  }
  if (k <= 0) return;
  c.save(); c.translate(BUB3.x + BUB3.w / 2, BUB3.y + BUB3.h); c.scale(k, k); c.translate(-(BUB3.x + BUB3.w / 2), -(BUB3.y + BUB3.h));
  bubble(c, BUB3.x, BUB3.y, BUB3.w, BUB3.h, [478, BUB3.y + BUB3.h + 44], { col: K.k9 });
  c.save(); c.beginPath(); c.rect(BUB3.x + 20, BUB3.y + 14, BUB3.w - 40, BUB3.h - 28); c.clip();
  c.fillStyle = BG; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  if (!night) {
    const off = Math.max(0, t - T.s3 - 0.75) * 4.4 * 60;
    c.font = FD(50);
    for (let i = 0; i < 30; i++) { const y = BUB3.y + BUB3.h + 24 + i * 60 - off; if (y < BUB3.y - 10 || y > BUB3.y + BUB3.h + 60) continue; c.fillText('• ' + MODS[i % MODS.length], BUB3.x + 44, y); }
  } else {
    c.font = FD(60); c.fillText('…Y ESO QUE NO TE', BUB3.x + 44, BUB3.y + 78); c.fillText('CONTÉ DEL MOTOR.', BUB3.x + 44, BUB3.y + 146);
  }
  c.restore(); c.restore();
}
function c3Top(c, t) {                                 // placa «3 HORAS DESPUÉS…» (tapa todo, también la placa del personaje)
  if (t < T.p3 - 0.02 || t > T.q3 + 0.2) return;
  const a = E.outExpo(prog(t, T.p3, T.p3 + 0.22)), o = E.inCubic(prog(t, T.q3 - 0.08, T.q3 + 0.12));
  c.save(); c.translate((1 - a) * W - o * W, 0);
  c.fillStyle = BG; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.1; c.fillStyle = YEL; for (let x = 60; x < W; x += 120) c.fillRect(x - 1, 0, 2, H); for (let y = 60; y < H; y += 120) c.fillRect(0, y - 1, W, 2); c.globalAlpha = 1;
  clockIcon(c, 540, 730, 90, (t - T.p3) * 14);
  riseText(c, '3 HORAS', 540 - tw('3 HORAS', FD(170)) / 2, 1010, 170, K.k9, t, T.p3 + 0.12, undefined, { byWord: true });
  riseText(c, 'DESPUÉS…', 540 - tw('DESPUÉS…', FD(170)) / 2, 1180, 170, YEL, t, T.p3 + 0.32, undefined, { byWord: true });
  c.restore();
}
