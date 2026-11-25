/* ══════════════════════════════════════════════════════════════════════════════════════
   PERSONAJE 5 · EL QUE LLEGA CUANDO YA TERMINÓ
   Estacionamiento vacío, alambrado, un farol que titila · llega tranquilo, con el mate y el
   termo · mira para los dos lados: grillos, un cardo · «¿Y? ¿Arrancó?» · «La juntada era ayer» ·
   mira el evento en Gridd: era ayer · sorbo de mate.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const C5 = { stop: 470 };
const R5 = { walk: [0.0, 0.95], look: [0.95, 1.62], ask: 1.25, sip: [0.25, 0.85], sip2: 0.75 };   // [SFX] look/ask: desde T.g5 · sip: desde T.p5 · sip2: desde T.q5
function c5World(c, t) {
  const u = t - T.g5;
  // fondo: alambrado, cartel de cerrado y farol
  fence(c, -700, 1700, GYW - 380);
  c.save(); c.translate(760, GYW - 250); c.rotate(-0.05); c.fillStyle = YEL; rr(c, -120, -40, 240, 80, 8); c.fill(); c.strokeStyle = K.k6; c.lineWidth = 3; c.beginPath(); c.moveTo(-90, -40); c.lineTo(-60, -90); c.moveTo(90, -40); c.lineTo(60, -90); c.stroke();
  ink(c, () => { c.fillStyle = BG; c.font = FD(58); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('CERRADO', 0, 58 * CAP / 2); }); c.restore();
  const on = hash(Math.floor(t * 11) * 1.7) > 0.18 ? 1 : 0.15;
  c.fillStyle = K.k5; c.fillRect(1004, GYW - 640, 12, 640); c.fillRect(940, GYW - 640, 76, 10); c.fillStyle = on > 0.5 ? YEL : K.k6; rr(c, 920, GYW - 634, 44, 14, 7); c.fill();
  if (on > 0.5) { const g = c.createLinearGradient(0, GYW - 620, 0, GYW); g.addColorStop(0, yel(0.16)); g.addColorStop(1, yel(0)); c.fillStyle = g; c.beginPath(); c.moveTo(926, GYW - 620); c.lineTo(958, GYW - 620); c.lineTo(1120, GYW); c.lineTo(760, GYW); c.closePath(); c.fill(); }
  ground(c, -800, 1600);
  // el cardo
  const tu = prog(u, 0.85, 1.95); if (tu > 0 && tu < 1) tumbleweed(c, lerp(1260, -240, tu), GYW - 56 - Math.abs(Math.sin(tu * 18)) * 40, 54, -tu * 26);
  // él: entra caminando con el mate y el termo
  let x = C5.stop, f = { fL: [-36, 0], fR: [36, 0], bob: 0 };
  if (u < R5.walk[1]) { const w = prog(u, R5.walk[0], R5.walk[1]); x = lerp(-180, C5.stop, E.outCubic(w)); f = walkFeet((x + 180) / 96, 96, 30); }
  const p = Object.assign({ x, y: GYW - f.bob, s: 1, face: 1, blink: blinkAt(t, 9), lx: 0.4, fL: f.fL, fR: f.fR }, CHARS[4].look, { hR: [62, -300], hL: [-46, -250] });
  if (u >= R5.look[0] && u < R5.look[1] + 0.4) p.lx = Math.sin((u - R5.look[0]) * 7.5) * 0.95;
  if (t >= T.p5) { const s = Math.sin(Math.PI * prog(t, T.p5 + R5.sip[0], T.p5 + R5.sip[1])); p.hR = mixP([62, -300], [40, -372], s); p.mouth = s > 0.3 ? 'sip' : 'flat'; p.lid = 0.6; p.lx = 0.2; }
  if (t >= T.q5) { const s = Math.sin(Math.PI * prog(t, T.q5 + R5.sip2, T.q5 + R5.sip2 + 0.55)); p.lx = 0; p.lid = 0.7; p.hR = mixP([62, -300], [40, -372], s); p.mouth = s > 0.3 ? 'sip' : 'flat'; }
  spot(c, x, GYW, 230);
  npc(c, p, (cc, g) => { drawTermo(cc, -50, -262, 0.92, 0.12); drawMate(cc, p.hR[0], p.hR[1], 1, 0); });
  boom(c, 'SLURP', C5.stop + 150, GYW - 520, t, T.p5 + R5.sip[0] + 0.15, { size: 70, rot: -8, dur: 0.55, col: K.k9 });
  boom(c, 'SLURP', C5.stop + 150, GYW - 520, t, T.q5 + R5.sip2 + 0.12, { size: 70, rot: 8, dur: 0.55, col: K.k9 });
  if (t >= T.q5 - 0.2) bagFloat(c, lerp(-150, 1250, prog(t, T.q5 - 0.2, T.x5 + 0.3)), GYW - 520 + Math.sin(t * 2) * 60, t);
}
function c5Screen(c, t) {
  const u = t - T.g5;
  cricket(c, 230, 1250, t, T.g5 + 1.0); cricket(c, 860, 1180, t, T.g5 + 1.3); cricket(c, 300, 1150, t, T.p5 + 0.4);
  if (u >= R5.ask && t < T.p5 + 0.1) {
    const k = E.outBack(prog(u, R5.ask, R5.ask + 0.2), 2), o = E.inCubic(prog(t, T.p5 - 0.05, T.p5 + 0.1));
    c.save(); c.globalAlpha = 1 - o; c.translate(560, 712); c.scale(k, k); bubble(c, -250, -64, 500, 128, [-20, 140], { col: K.k9 });
    c.fillStyle = BG; c.font = FD(64); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('¿Y? ¿ARRANCÓ?', 0, 24); c.restore();
  }
  if (t >= T.q5) notifCard(c, t, T.q5 + 0.1, 'GRIDD  ·  YA PASÓ', 'NOCHE EN LA RAMBLA', 'Ayer  ·  21:30  ·  Punta Carretas');
}
