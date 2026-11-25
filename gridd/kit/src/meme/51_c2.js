/* ══════════════════════════════════════════════════════════════════════════════════════
   PERSONAJE 2 · EL QUE VINO CON EL AUTO DE LA VIEJA
   Pose de facha contra el auto (viento, destellos) · zoom a la luneta: «BEBÉ A BORDO» y el
   perrito que mueve la cabeza · cuadro congelado: lo llama MAMÁ · «¿¡DÓNDE ESTÁ EL AUTO!?» ·
   sale disparando (el cartelito queda flotando y se cae) · «NACIDO PARA / OBLIGADO A».
   ══════════════════════════════════════════════════════════════════════════════════════ */
CARDEF.mom = Object.assign({}, CARDEF.hatch, { body: '#ADADB6', rimc: null, dark: true });     // el auto de la vieja
const C2 = { tail: 60, px: 952 };
const R2 = { zIn: 0.55, zOut: 1.10, ring: 1.10, frz: [1.10, 1.46], answer: 1.48, yell: 1.58, dash: 2.05, go: 2.12 };   // [SFX] segundos desde T.g2
const c2tail = u => u < R2.go ? C2.tail : C2.tail + 1900 * E.inQuad(prog(u, R2.go, R2.go + 0.5));
function babySign(c, x, y, s, rot) {                    // «BEBÉ A BORDO» (el chico, en el mundo)
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.beginPath(); c.moveTo(0, -30); c.lineTo(30, 0); c.lineTo(0, 30); c.lineTo(-30, 0); c.closePath(); c.fillStyle = YEL; c.fill(); c.lineWidth = 3; c.strokeStyle = BG; c.stroke();
  c.fillStyle = BG; c.beginPath(); c.arc(0, -4, 7, 0, TAU); c.fill(); c.fillRect(-6, 4, 12, 12);
  c.restore();
}
function c2World(c, t) {
  const u0 = t - T.g2, u = freeze(u0, R2.frz[0], R2.frz[1]) , tl = T.g2 + u, tail = c2tail(u0);
  ground(c, -500, 1600); spot(c, 470, GYW, 560, 0.8);
  // el auto (y lo que lleva en la luneta)
  if (tail < 1700) {
    if (u0 > R2.go) { c.save(); c.globalAlpha = 0.35; for (let g = 1; g <= 5; g++) drawCar(c, A.mom, tail - g * 60 * prog(u0, R2.go, R2.go + 0.2), GYW, {}); c.restore(); }   // estela
    drawCar(c, A.mom, tail, GYW, { bob: u0 > R2.go ? -4 * Math.abs(Math.sin(u0 * 40)) : 0 });
    if (u0 < R2.go + 0.22) babySign(c, tail + 140, GYW - 188, 1.2, 0.08 * Math.sin(tl * 3));
  }
  if (u0 >= R2.go + 0.22) {                            // el cartelito se queda flotando… y se cae
    const d = u0 - R2.go - 0.22, y = Math.min(GYW - 20, GYW - 188 + 1600 * d * d), r = Math.min(1.6, d * 7);
    babySign(c, C2.tail + 140 + 30 * d, y, 1.2, r);
  }
  // él
  if (u0 < R2.dash) {
    const p = Object.assign({ x: C2.px, y: GYW, s: 1, face: -1, blink: blinkAt(tl, 3), lean: 0.13, lx: 0.2 }, CHARS[1].look, { hL: [40, -300], hR: [-36, -292], fL: [26, 0], fR: [-16, 0], aL: 0.1 });
    let phone = 0;
    if (u0 >= R2.ring) { const k = E.outCubic(prog(u0, R2.ring, R2.ring + 0.18)); p.hR = mixP([-36, -292], [86, -420], k); p.lx = lerp(0.2, -0.5, k); phone = k; }
    if (u0 >= R2.answer) { const k = E.inOutCubic(prog(u0, R2.answer, R2.answer + 0.25)); p.lean = lerp(0.13, -0.02, k); p.crouch = 14 * k; p.hL = mixP([40, -300], [-60, -170], k); p.mouth = 'wavy'; p.browL = p.browR = 0.45; p.lx = lerp(-0.5, 0, k); p.fL = [-30, 0]; p.fR = [36, 0]; }
    npc(c, p, phone ? (cc) => drawPhoneMini(cc, 88, -428, 0.62, -0.3, 1) : null);
    if (u0 >= R2.answer) sweat(c, C2.px - 50, GYW - 520, t, T.g2 + R2.answer);
    if (u < R2.ring) for (let i = 0; i < 4; i++) { const q = ((tl - T.g2) * 1.6 + i / 4) % 1; sparkle(c, C2.px + [-120, 110, -70, 140][i], GYW - [520, 430, 300, 610][i], 30 * Math.sin(q * Math.PI)); }
  } else if (u0 < R2.dash + 0.5) { c.fillStyle = K.k6; for (let i = 0; i < 7; i++) { const d = (u0 - R2.dash) / 0.5; puff(c, C2.px + (i - 3) * 30 * (1 + d * 2), GYW - 40 - d * 120 * hash(i), 30 + d * 40, (1 - d) * 0.7); } }
  boom(c, 'FIUUUM', 900, GYW - 420, t, T.g2 + R2.go, { size: 140, rot: -6, dur: 0.55 });
  // viento de la pose (líneas que cruzan)
  if (u < R2.ring) { c.fillStyle = K.k7; for (let i = 0; i < 9; i++) { const y = GYW - 120 - hash(i * 3.9) * 560, x = 1500 - ((hash(i * 8.1) * 2000 + (tl - T.s2) * 2600) % 2200); c.globalAlpha = 0.4; c.fillRect(x, y, 140 + hash(i) * 160, 3); } c.globalAlpha = 1; }
}
function c2Insert(c, t, k) {                           // primer plano de la luneta: «BEBÉ A BORDO» + perrito + rosario
  const s = lerp(1.3, 1, E.outExpo(k));
  c.save(); c.translate(540, 960); c.scale(s, s); c.translate(-540, -960);
  c.fillStyle = '#ADADB6'; c.fillRect(-100, 600, 1280, 760);
  rr(c, 70, 650, 940, 620, 70); c.fillStyle = BG; c.fill();
  c.save(); rr(c, 70, 650, 940, 620, 70); c.clip();
  c.strokeStyle = 'rgba(214,214,218,0.12)'; c.lineWidth = 30; c.beginPath(); c.moveTo(180, 1300); c.lineTo(520, 620); c.moveTo(300, 1300); c.lineTo(640, 620); c.stroke();
  // rosario
  c.strokeStyle = K.k7; c.lineWidth = 4; c.beginPath(); c.moveTo(860, 650); c.quadraticCurveTo(880 + 20 * Math.sin(t * 4), 820, 900, 650); c.stroke();
  c.fillStyle = K.k8; for (let i = 0; i < 9; i++) { const q = i / 8, x = lerp(860, 900, q) + Math.sin(q * Math.PI) * (20 + 20 * Math.sin(t * 4)), y = 650 + Math.sin(q * Math.PI) * 170; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill(); }
  c.fillRect(876 + 20 * Math.sin(t * 4) * 0.7, 822, 8, 40); c.fillRect(864 + 20 * Math.sin(t * 4) * 0.7, 834, 32, 8);
  // perrito que mueve la cabeza
  const nod = Math.sin(t * 13) * 0.22;
  c.fillStyle = K.k5; c.fillRect(70, 1180, 940, 90);
  c.save(); c.translate(780, 1180); c.fillStyle = K.k6; c.beginPath(); c.ellipse(0, -50, 70, 56, 0, 0, TAU); c.fill();
  c.strokeStyle = K.k7; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -96); for (let i = 0; i < 5; i++) c.lineTo((i % 2 ? 10 : -10), -100 - i * 8); c.stroke();
  c.translate(0, -138); c.rotate(nod); c.fillStyle = K.k7; c.beginPath(); c.arc(0, 0, 58, 0, TAU); c.fill();
  c.fillStyle = K.k5; c.beginPath(); c.ellipse(-56, 4, 18, 40, 0.3, 0, TAU); c.ellipse(56, 4, 18, 40, -0.3, 0, TAU); c.fill();
  c.fillStyle = K.k8; c.beginPath(); c.ellipse(0, 22, 30, 22, 0, 0, TAU); c.fill(); c.fillStyle = BG; c.beginPath(); c.arc(0, 12, 9, 0, TAU); c.arc(-22, -12, 7, 0, TAU); c.arc(22, -12, 7, 0, TAU); c.fill();
  c.restore();
  c.restore();
  // el cartel grande, con ventosa
  c.save(); c.translate(360, 930); c.rotate(-0.06 + 0.03 * Math.sin(t * 3));
  c.fillStyle = K.k7; c.beginPath(); c.arc(0, -232, 18, 0, TAU); c.fill(); c.fillRect(-3, -232, 6, 40);
  c.beginPath(); c.moveTo(0, -196); c.lineTo(196, 0); c.lineTo(0, 196); c.lineTo(-196, 0); c.closePath(); c.fillStyle = YEL; c.fill(); c.lineWidth = 12; c.strokeStyle = BG; c.stroke();
  ink(c, () => { c.fillStyle = BG; c.font = FD(84); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('BEBÉ', 0, -6); c.fillText('A BORDO', 0, 78); });
  c.restore();
  c.restore();
}
function c2Screen(c, t) {
  const u = t - T.g2;
  const zi = prog(u, R2.zIn, R2.zIn + 0.12), zo = u >= R2.zOut;
  if (u >= R2.zIn && !zo) c2Insert(c, t, zi);
  if (u >= R2.zIn - 0.06 && u < R2.zIn + 0.06) { c.globalAlpha = 1 - Math.abs(u - R2.zIn) / 0.06; c.fillStyle = K.k9; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }   // flash del zoom
  if (u >= R2.frz[0] && u < R2.frz[1] + 0.05) {      // cuadro congelado: se lava un poco y aparece la llamada
    c.fillStyle = 'rgba(11,11,12,0.35)'; c.fillRect(0, 0, W, H);
  }
  if (u >= R2.ring && u < R2.yell) { const o = E.inCubic(prog(u, R2.answer - 0.04, R2.yell)); c.save(); c.translate(292, 860); c.scale(1 - o, 1 - o); c.translate(-292, -860); callCard(c, 292, 860, t, T.g2 + R2.ring + 0.02); c.restore(); }
  if (u >= R2.yell && u < R2.dash + 0.1) {
    const k = E.outBack(prog(u, R2.yell, R2.yell + 0.18), 2.4), sh = 7 * Math.sin(t * 60);
    c.save(); c.translate(540 + sh, 690); c.scale(k, k); bubble(c, -390, -70, 780, 170, [290, 160], { col: K.k9 });
    c.fillStyle = BG; c.font = FD(72); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('¿¡DÓNDE ESTÁ EL AUTO!?', 0, 44); c.restore();
  }
  if (t >= T.p2) {                                     // «nacido para / obligado a»
    const a = E.outCubic(prog(t, T.p2, T.p2 + 0.25)), b = E.outBack(prog(t, T.p2 + 0.75, T.p2 + 0.95), 2.4), out = E.inCubic(prog(t, T.x2 - 0.05, T.x2 + 0.12));
    c.save(); c.globalAlpha = 1 - out;
    if (a > 0) { c.save(); c.translate(0, (1 - a) * 40); c.globalAlpha *= a; rr(c, 70, 690, 940, 230, 26); c.fillStyle = 'rgba(31,31,35,0.95)'; c.fill();
      c.font = FU(36); c.fillStyle = K.k7; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; tracked(c, 'NACIDO PARA:', 110, 760, 3);
      let fs = 96; while (tw('CORRER EN LE MANS', FD(fs)) > 860) fs -= 2; c.font = FD(fs); c.fillStyle = K.k9; c.fillText('CORRER EN LE MANS', 110, 870); c.restore(); }
    if (b > 0) { c.save(); c.translate(540, 1090); c.rotate(-0.025); c.scale(b, b); c.fillStyle = YEL; rr(c, -470, -125, 940, 250, 26); c.fill();
      ink(c, () => { c.font = FU(36); c.fillStyle = BG; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; tracked(c, 'OBLIGADO A:', -430, -56, 3);
        let fs = 96; while (tw('DEVOLVERLO CON NAFTA', FD(fs)) > 860) fs -= 2; c.font = FD(fs); c.fillText('DEVOLVERLO CON NAFTA', -430, 56); }); c.restore(); }
    c.restore();
  }
}
