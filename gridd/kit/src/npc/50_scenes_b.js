/* ══════════════════════════════════════════════════════════════════════════════════════
   ESCENA 3 · LA CÁMARA  (y las cachilas)
   ══════════════════════════════════════════════════════════════════════════════════════ */
const CUT = x => 0;                                  // easing «corte»: la cámara se queda quieta hasta la clave y salta
const JK = { sc: 1.35, len: 640 * 1.35 };            // cachila
const TJ = { pum: T.junk + 1.2, bump: T.junk + 1.62, clang: T.junk + 1.92, hub: T.junk + 2.05 };   // [SFX] contraexplosión · se suelta el paragolpes · «CLANG» · salta la taza

function camProp(t) {                                 // dónde está la cámara de fotos (mundo): baja, la levanta, se la lleva al ojo
  const u = t - T.buy;
  let y = lerp(GYW - 1250, GYW - 350, E.outBack(prog(u, 0.3, 0.85), 1.2));
  y = lerp(y, GYW - 535, E.outBack(prog(u, 1.0, 1.3), 1.8));                              // «objeto conseguido»
  y = lerp(y, GYW - 282, E.inOutCubic(prog(u, 1.75, 2.15)));
  let x = 540, s = 1;
  if (t >= T.q3) { const k = E.outBack(prog(t, T.q3 + 0.1, T.q3 + 0.42), 1.5), lx = heroScan(t); x = 540 + lx * 34 * k; y = lerp(y, GYW - 428, k); }
  if (t >= T.junk) { const k = E.inOutCubic(prog(t, T.junk + 0.55, T.junk + 1.35)); x = lerp(x, 588, k); y = lerp(y, GYW - 300, k); }     // la baja despacio
  return [x, y, s];
}
const heroScan = t => t < T.junk ? 0.85 * Math.sin((t - T.q3 - 0.25) * 2.7) * prog(t, T.q3 + 0.25, T.q3 + 0.6) * (1 - prog(t, T.q3 + D.q3 - 0.5, T.q3 + D.q3 - 0.1)) + 0.9 * prog(t, T.q3 + D.q3 - 0.5, T.q3 + D.q3 - 0.1) : 0.9;
function heroCamera(t) {
  const u = t - T.buy, p = { x: 540, y: GYW, blink: blinkAt(t, 2), sq: breathe(t) };
  if (t < T.q3) {
    const got = E.outBack(prog(u, 1.0, 1.3), 2), look = E.inOutCubic(prog(u, 1.85, 2.15)) * (1 - E.inOutCubic(prog(u, 2.45, 2.7)));
    p.ly = lerp(-0.85, 0, prog(u, 0.7, 1.0)) + 0.85 * look; p.lx = -0.35 * look; p.wide = 0.5 + 0.4 * got - 0.5 * look;
    p.mouth = look > 0.5 ? 'flat' : u > 0.9 ? 'big' : 'o'; p.browL = p.browR = 0.45 * look; p.browY = -5 * got * (1 - look);
    p.y = GYW - 34 * Math.sin(prog(u, 1.0, 1.4) * Math.PI);                                // saltito al levantarla
  } else if (t < T.junk) {
    p.lx = heroScan(t); p.y = GYW - 14 * Math.abs(Math.sin((t - T.q3) * 7)) * prog(t, T.q3 + 0.3, T.q3 + 0.6) * (1 - prog(t, T.q3 + D.q3 - 0.6, T.q3 + D.q3 - 0.2)); p.mouth = 'smile'; p.lean = 0.06 * p.lx;
  } else {
    const dead = E.inOutCubic(prog(t, T.junk + 0.75, T.junk + 1.3)), tN = wordT('nope', 'MEJOR') - 0.1;
    p.lx = 0.9; p.lid = 0.6 * dead; p.mouth = 'flat'; p.browL = p.browR = -0.05;
    if (t >= TJ.clang && t < TJ.clang + 0.2) p.blink = 1;
    const dn = E.inOutCubic(prog(t, T.nope - 0.25, T.nope + 0.1)) * (1 - E.inOutCubic(prog(t, tN - 0.1, tN + 0.15)));   // mira la taza que le llega a los pies
    p.ly = 0.75 * dn; p.lx = lerp(0.9, 0.5, dn);
    if (t >= tN) { const k = E.inOutCubic(prog(t, tN, tN + 0.2)); p.lx = lerp(0.9, 0, k) + 0.28 * Math.sin((t - tN) * 13) * Math.exp(-(t - tN) * 2.2) * k; p.lid = 0.7; }   // [VO] «mejor no»: niega con la cabeza
  }
  return p;
}
function junkCar(c, t, tail, seed, front) {           // una cachila: tiembla, echa humo y se le caen cosas
  const u = t - T.junk, bob = jit(seed, t, 3.2, 22), nose = tail - JK.len, live = t < TJ.pum + 99;
  // humo del escape
  c.fillStyle = K.k5;
  for (let i = 0; i < 9; i++) { const life = ((u * 1.5 + i / 9 + seed) % 1), a = (1 - life) * 0.75; if (u < 0.2) break; c.globalAlpha = a; c.beginPath(); c.arc(tail + 20 + life * 150 + Math.sin(i * 2.3 + u * 3) * 14, GYW - 54 - life * 170, 16 + life * 44, 0, TAU); c.fill(); }
  c.globalAlpha = 1;
  drawCar(c, A.junk, tail, GYW, { flip: true, bob, ang: -(tail) / 54, spd: 100, noHub: front && t >= TJ.hub ? 1 : -1 });
  if (!front) return;
  // paragolpes: colgando, y después al piso
  const bx = nose + 16, by = GYW - 62;
  if (t < TJ.bump) { c.save(); c.translate(bx, by + bob); c.rotate(0.05 * Math.sin(u * 30)); rr(c, -14, -13, 92, 26, 9); c.fillStyle = K.k7; c.fill(); c.restore(); }
  else { const d = t - TJ.bump, fall = Math.min(1, d / 0.3), yb = lerp(by, GYW - 13, E.inQuad(fall)) - (d > 0.3 ? 34 * Math.abs(Math.sin((d - 0.3) * 13)) * Math.exp(-(d - 0.3) * 6) : 0);
    c.save(); c.translate(bx - 30 * E.outCubic(Math.min(1, d / 0.6)), yb); c.rotate(-0.5 * fall + (d > 0.3 ? 0.45 * Math.exp(-(d - 0.3) * 5) : 0)); rr(c, -14, -13, 92, 26, 9); c.fillStyle = K.k7; c.fill(); c.restore(); }
  // vapor del capó cuando se queda
  if (u > 2.0) { c.fillStyle = K.k8; for (let i = 0; i < 6; i++) { const life = ((u * 0.9 + i / 6) % 1); c.globalAlpha = (1 - life) * 0.5 * prog(u, 2.0, 2.4); c.beginPath(); c.arc(nose + 150 + Math.sin(i * 4.1 + u * 2) * 26, GYW - 180 - life * 190, 12 + life * 34, 0, TAU); c.fill(); } c.globalAlpha = 1; }
}
function sceneCamera(c, t) {                          // T.buy → T.gridd
  ground(c, -3000, 5000);
  const u = t - T.buy, p = heroCamera(t), cp = camProp(t), inHand = u > 0.82;
  spot(c, 540, GYW, 250);
  // la calle (aparece cuando la cámara se aleja)
  if (t >= T.junk) {
    const su = t - T.junk, k = E.outCubic(prog(su, 0.25, 2.1)), tail = lerp(1750, 700, k) + JK.len + 12 * Math.sin(su * 31) * (1 - k);
    c.fillStyle = K.k4; for (let i = 0; i < 9; i++) c.fillRect(-200 + i * 260, GYW + 70, 130, 6);                         // línea de la calle
    junkCar(c, t, tail + JK.len + 40, 7, false);                                                                       // la de atrás, que asoma
    junkCar(c, t, tail, 3, true);
    const nose = tail - JK.len;
    // [SFX] contraexplosión
    if (t >= TJ.pum) { const d = t - TJ.pum; c.fillStyle = K.k4; for (let i = 0; i < 6; i++) { const e = E.outCubic(Math.min(1, d / 0.9)); c.globalAlpha = Math.max(0, 1 - d / 1.1) * 0.9; c.beginPath(); c.arc(tail + 40 + hash(i * 3.3) * 150 * e, GYW - 60 - hash(i * 5.1) * 190 * e, 30 + 60 * e * hash(i * 2.7 + 1), 0, TAU); c.fill(); } c.globalAlpha = 1; }
    burst(c, tail + 16, GYW - 54, t, TJ.pum, { n: 9, r: 20, grow: 90, len: 44, a0: -1.2, arc: 2.4 });
    boom(c, 'PUM', 1392, GYW - 400, t, TJ.pum, { size: 150, rot: 7 });
    burst(c, nose - 10, GYW - 6, t, TJ.clang, { n: 7, r: 26, grow: 70, len: 36 });
    boom(c, 'CLANG', nose + 250, GYW - 430, t, TJ.clang, { size: 140, rot: -6 });
    // la taza: salta, rueda hasta los pies del NPC y se cae
    if (t >= TJ.hub) { const d = t - TJ.hub, roll = E.outCubic(prog(d, 0, 1.25)), x = lerp(tail - 524 * JK.sc, 640, roll), down = E.inCubic(prog(d, 1.2, 1.45)), hop = d < 0.3 ? Math.sin(d / 0.3 * Math.PI) * 70 : 0, r = 43;
      c.save(); c.translate(x, GYW - r * (1 - down * 0.85) - hop); c.scale(1, 1 - down * 0.86); c.rotate(-roll * 16);
      c.fillStyle = K.k8; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.strokeStyle = K.k5; c.lineWidth = 5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * TAU / 5) * r * 0.82, Math.sin(i * TAU / 5) * r * 0.82); c.stroke(); } c.fillStyle = K.k5; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.fill(); c.restore(); }
  }
  // el NPC y su cámara
  const lc = toL(p, cp[0], cp[1]);
  if (inHand) { const k = E.outCubic(prog(u, 0.82, 1.0)); p.hL = mixP(HANG_L, [lc[0] - 60, lc[1] + 8], k); p.hR = mixP(HANG_R, [lc[0] + 58, lc[1] + 8], k); }
  else if (u > 0.3) { const k = E.outCubic(prog(u, 0.35, 0.8)); p.hL = mixP(HANG_L, [-70, -420], k); p.hR = mixP(HANG_R, [70, -420], k); }   // estira los brazos para atajarla
  if (!inHand && u > 0.28) { c.save(); c.globalAlpha = 0.5; sparkle(c, cp[0], cp[1], 110 * prog(u, 0.3, 0.8)); c.restore(); drawCamera(c, cp[0], cp[1], 1, 0.06 * Math.sin(u * 20)); }
  npc(c, p, inHand ? (cc) => drawCamera(cc, lc[0], lc[1], 1, 0) : null);
  nameTag(c, p.x, p.y - 566, 'NPC', t, 0);
  if (u > 1.0 && u < 2.0) for (let i = 0; i < 4; i++) { const q = ((u - 1.0) * 1.6 + i / 4) % 1; sparkle(c, cp[0] + [-120, 126, -84, 96][i], cp[1] + [-40, -70, 60, 44][i], 30 * Math.sin(q * Math.PI)); }
  burst(c, cp[0], cp[1], t, T.buy + 1.08, { n: 12, r: 90, grow: 90, len: 50, a0: -Math.PI, arc: Math.PI });
  mark(c, '?', p.x + 130, p.y - 470, t, T.q3 + 0.3, 0.9);
}
function buyOverlay(c, t, cam) {                      // las monedas vuelan de la billetera a la cámara (pantalla)
  const u = t - T.buy; if (u < 0.7 || u > 1.75) return;
  const cp = camProp(t), tx = W / 2 + (cp[0] - cam.x) * cam.z, ty = H / 2 + (cp[1] - cam.y) * cam.z;
  for (let i = 0; i < 12; i++) { const q = prog(u, 0.72 + i * 0.065, 1.02 + i * 0.065); if (q <= 0 || q >= 1) continue; const e = E.inOutCubic(q);
    coin(c, lerp(300, tx, e) + Math.sin(q * Math.PI) * (i % 2 ? 120 : -90), lerp(1382, ty, e) - Math.sin(q * Math.PI) * 60, 20, 1, Math.cos(u * 18 + i)); }
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   ESCENA 4 · USÁ GRIDD (el NPC saca el teléfono; la cámara se mete en la pantalla)
   ══════════════════════════════════════════════════════════════════════════════════════ */
const MINI1 = { x: 706, y: GYW - 432 }, MINI2 = { x: 1196, y: GYW - 432 };       // dónde queda el teléfono en la mano en cada toma
const ZPH = PH.w / 76;                                                          // zoom con el que el teléfono de la mano calza con el de pantalla
function heroPhone(t, t0, hx, mini) {                 // saca el teléfono y lo muestra
  const u = t - t0, up = E.outBack(prog(u, 0.3, 0.72), 1.5), p = { x: hx, y: GYW, blink: blinkAt(t, 5), sq: breathe(t) };
  const ph = mixP([hx + 62, GYW - 176], [mini.x, mini.y], up);
  p.hR = toL(p, ph[0] + 4, ph[1] + 44); p.lx = 0.55 * up * (1 - prog(u, 0.95, 1.2)); p.mouth = up > 0.6 ? 'smile' : 'flat'; p.wide = 0.3 * up;
  return { p, ph, on: E.outCubic(prog(u, 0.7, 0.85)) };
}
function sceneGridd(c, t) {                           // T.gridd → T.feed
  ground(c, -3000, 5000); spot(c, 540, GYW, 250);
  const H1 = heroPhone(t, T.gridd, 540, MINI1), p = H1.p;
  p.hL = [-30, -246];                                                                     // la otra mano sostiene la cámara colgada
  npc(c, p, (cc) => { cc.strokeStyle = K.k7; cc.lineWidth = 6; cc.beginPath(); cc.moveTo(-40, -330); cc.lineTo(-24, -262); cc.moveTo(40, -330); cc.lineTo(20, -262); cc.stroke(); drawCamera(cc, -2, -236, 0.74, 0);
    const l = toL(p, H1.ph[0], H1.ph[1]); drawPhoneMini(cc, l[0], l[1], 1, 0, H1.on); });
  nameTag(c, p.x, p.y - 566, 'NPC', t, 0, 1 - prog(t, T.feed - 0.45, T.feed - 0.25));
  burst(c, MINI1.x, MINI1.y, t, T.gridd + 0.72, { n: 12, r: 96, grow: 70, len: 44, a0: 0, arc: TAU * 0.92 });
  if (t > T.gridd + 0.75) for (let i = 0; i < 3; i++) { const q = ((t - T.gridd) * 1.5 + i / 3) % 1; sparkle(c, MINI1.x + [-70, 78, 60][i], MINI1.y + [-96, -60, 84][i], 26 * Math.sin(q * Math.PI)); }
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   ESCENA 5 · EL GIRO: «ahí van todos los car spotters»
   ══════════════════════════════════════════════════════════════════════════════════════ */
const CROWD = [[560, 46, 0.9], [690, 46, 0.9], [820, 46, 0.9], [505, 0, 1], [628, 0, 1], [752, 0, 1], [876, 0, 1]];   // [x, cuánto atrás, escala]
const HX2 = 1046;                                    // dónde queda el protagonista: atrás de todos
function sceneCrowd(c, t) {                           // T.crowd → entra el teléfono
  const u = t - T.crowd;
  ground(c, -3000, 5000);
  spot(c, 120, GYW, 520, 1.4);
  const g = c.createLinearGradient(0, GYW - 900, 0, GYW); g.addColorStop(0, yel(0)); g.addColorStop(1, yel(0.16)); c.fillStyle = g; c.beginPath(); c.moveTo(60, GYW - 1000); c.lineTo(190, GYW - 1000); c.lineTo(470, GYW); c.lineTo(-330, GYW); c.closePath(); c.fill();   // reflector sobre el auto
  drawCar(c, A.super12, 430 - 768, GYW, {});
  CROWD.forEach(([x, back, s], i) => {                  // los otros NPC: todos con la cámara en alto, todos al mismo auto
    const bob = Math.sin(u * 5 + i * 1.7) * 5, fl = ((u * 1.9 + hash(i * 3.7) * 3) % 1.6) / 0.16;
    const p = { x, y: GYW - back + bob * 0.4, s, face: -1, hat: back ? K.k6 : K.k7, lx: 0.9, rim: !back, blink: blinkAt(t, i), crouch: [2, 14, 5, 0, 12, 4, 9][i] + bob * 0.5, lean: [0, -0.05, 0, -0.03, -0.07, 0, -0.04][i], a: back ? 0.82 : 1 };
    const cy = -436 - (i % 3) * 14; p.hL = [86, cy + 30]; p.hR = [130, cy + 36];
    npc(c, p, (cc) => drawCameraSide(cc, 96, cy, 0.9, 0.06));
    if (fl < 1) { c.save(); c.globalAlpha = 1 - fl; sparkle(c, x - 190 * s, GYW - back - (436 + (i % 3) * 14) * s, 70 * (1 - fl * 0.5)); c.restore(); }   // [SFX] flashes
  });
  // el protagonista, atrás de todos: salta y no ve nada
  const tO = T.own, turn = E.inOutCubic(prog(t, tO + 0.05, tO + 0.4));
  if (t < TP.zoom2 - 0.9 || turn < 1) {
    const hop = Math.abs(Math.sin(u * 6.2)) * (1 - turn), p = { x: HX2, y: GYW - 96 * hop, sq: 0.06 * hop, face: turn < 0.5 ? -1 : 1, lx: lerp(0.9, 0, turn), mouth: turn > 0.5 ? 'flat' : 'wavy', browL: 0.45 * (1 - turn), browR: 0.45 * (1 - turn), blink: blinkAt(t, 9) };
    p.hL = mixP([-20, -470], HANG_L, turn); p.hR = mixP([60, -480], HANG_R, turn);
    npc(c, p, turn < 0.6 ? (cc) => drawCameraSide(cc, 22, -500, 0.9, -0.1) : null);
    nameTag(c, HX2, GYW - 96 * hop - 566, 'NPC', t, 0);
    sweat(c, HX2 + 60, GYW - 520 - 96 * hop, t, T.crowd + 0.4);
  } else {                                              // [VO] «armá el tuyo»: se le ocurre, saca el teléfono
    const H2 = heroPhone(t, TP.zoom2 - 0.9, HX2, MINI2), p = H2.p; p.browL = p.browR = -0.2;
    npc(c, p, (cc) => { const l = toL(p, H2.ph[0], H2.ph[1]); drawPhoneMini(cc, l[0], l[1], 1, 0, H2.on); });
    nameTag(c, HX2, GYW - 566, 'NPC', t, 0, 1 - prog(t, TP.zoom2 - 0.1, TP.zoom2 + 0.1));
  }
  mark(c, '!', HX2 + 128, GYW - 500, t, tO + 0.3, 0.9);
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   ESCENA 6 · FINAL: barridos en la rambla
   ══════════════════════════════════════════════════════════════════════════════════════ */
const RB = { hx: 880, hy: GYW + 150, dur: 1.15, x0: -1400, x1: 1500 };
const PASS = [['super', 0.25], ['gt', 1.75], ['spider', 3.25]];                 // qué auto pasa y cuándo (s desde que arranca la escena)
const shotT = i => T.rambla + PASS[i][1] + RB.dur * ((430 - 480 - RB.x0) / (RB.x1 - RB.x0));   // [SFX] «clic»: el auto queda justo enfrente
const TAGT = T.rambla + 2.5;                         // [SFX] deja de ser NPC
const PHOTO = [[162, 1298, -5], [384, 1312, 3.5], [604, 1296, -2.5]], PHS = 0.7;  // dónde quedan las fotos (pantalla) y a qué escala: en fila sobre la vereda
function sprPhoto(i) {                                // la foto del barrido: auto nítido, fondo corrido
  const w = 360, h = 240, s = mk(w, h), x = s.x, cs = A.photoCars[i];
  x.fillStyle = '#D6D6DA'; x.fillRect(0, 0, w, h); x.fillStyle = BG; x.fillRect(11, 11, w - 22, h - 22);
  x.save(); x.beginPath(); x.rect(11, 11, w - 22, h - 22); x.clip();
  for (let k = 0; k < 34; k++) { x.fillStyle = k % 4 === 0 ? yel(0.85) : k % 3 === 0 ? K.k7 : K.k5; x.fillRect(hash(k * 3.1 + i) * w - 140, 16 + hash(k * 7.7 + i) * 150, 130 + hash(k * 1.3) * 260, 2 + hash(k * 9.1) * 5); }
  x.fillStyle = K.k4; x.fillRect(0, 196, w, 3); x.fillStyle = yel(0.25); x.fillRect(0, 202, w, 3);
  const cx = w / 2 - cs.w / 2 + 4, gy = 196;
  x.save(); x.translate(cx + cs.ox, gy); x.scale(cs.sc, cs.sc); for (const wx of CARDEF[cs.kind].w) drawWheel(x, wx, -50, i, 900); x.restore();
  x.drawImage(cs.c, cx, gy - cs.oy);
  x.restore(); return s;
}
function sceneRambla(c, t, cam) {
  const u = t - T.rambla, sc = u * 26;
  // fondo: edificios lejos, el río, el murito, palmeras y faroles
  for (let i = 0; i < 10; i++) { const bw = 120 + hash(i * 3.3 + 9) * 110, bx = -260 + i * 180 - sc * 0.2, bh = 90 + hash(i * 7.1 + 4) * 120; c.fillStyle = K.k2; c.fillRect(bx, GYW - 430 - bh, bw, bh);
    c.fillStyle = yel(0.5); for (let k = 0; k < 4; k++) if (hash(i * 11 + k * 3.7 + 2) > 0.5) c.fillRect(bx + 18 + (k % 2) * 46, GYW - 430 - bh + 26 + Math.floor(k / 2) * 60, 16, 22); }
  c.fillStyle = BG; c.fillRect(-400, GYW - 430, 2200, 140);
  for (let i = 0; i < 26; i++) { const yy = GYW - 420 + hash(i * 3.9) * 110, xx = ((hash(i * 8.3) * 1900 - sc * (0.3 + hash(i) * 0.3)) % 1900 + 1900) % 1900 - 300; c.fillStyle = i % 5 === 0 ? yel(0.5) : K.k4; c.fillRect(xx, yy, 40 + hash(i * 2.2) * 110, 3); }   // reflejos en el agua
  c.fillStyle = K.k3; c.fillRect(-400, GYW - 300, 2200, 54); c.fillStyle = K.k5; c.fillRect(-400, GYW - 306, 2200, 8);                    // murito de la rambla
  for (let i = 0; i < 14; i++) c.fillRect(-380 + i * 160 - (sc * 0.5) % 160, GYW - 300, 6, 54);
  for (const px of [330, 1010]) { const x = px - sc * 0.5;                                                                             // palmeras
    c.strokeStyle = K.k3; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, GYW - 250); c.quadraticCurveTo(x + 18, GYW - 410, x + 6, GYW - 540); c.stroke();
    c.lineWidth = 15; for (let k = 0; k < 7; k++) { const a = -Math.PI * (0.06 + k * 0.148) + Math.sin(u * 1.4 + k) * 0.04; c.beginPath(); c.moveTo(x + 6, GYW - 540); c.quadraticCurveTo(x + 6 + Math.cos(a) * 110, GYW - 540 + Math.sin(a) * 120 - 30, x + 6 + Math.cos(a) * 190, GYW - 540 + Math.sin(a) * 110 + 46); c.stroke(); } }
  for (const lx of [80, 560, 1040]) c.drawImage(A.lamp.c, lx - sc * 0.5 - 222, GYW - 592);                                              // faroles (sprite)
  // público que se suma del otro lado
  [[190, 2.0], [470, 2.7], [690, 3.4]].forEach(([x, t0], i) => { const k = E.outBack(prog(u, t0, t0 + 0.3), 2); if (k <= 0) return; const fl = ((u * 1.3 + i * 0.5) % 1.5) / 0.14;
    c.save(); c.globalAlpha = 0.92; c.translate(x - sc * 0.5, GYW - 250); c.scale(k, k); c.drawImage(A.fan.c, -130, -350); c.restore();
    if (fl < 1 && k >= 1) { c.save(); c.globalAlpha = 1 - fl; sparkle(c, x - sc * 0.5 + 96, GYW - 250 - 222, 44); c.restore(); } });
  // la calle
  c.fillStyle = K.k5; c.fillRect(-400, GYW, 2200, 3); c.fillStyle = K.k4; for (let i = 0; i < 9; i++) c.fillRect(-300 + i * 250, GYW + 64, 130, 6); c.fillRect(-400, RB.hy, 2200, 3);
  // los autos de alta gama
  let aim = null;
  PASS.forEach(([kind, t0], i) => {
    const q = (u - t0) / RB.dur; if (q < -0.1 || q > 1.05) return;
    const tail = lerp(RB.x0, RB.x1, q), sp = A[kind], v = (RB.x1 - RB.x0) / RB.dur, nose = tail + 612 * sp.sc;
    c.save(); c.setTransform(1, 0, 0, 1, cam.sx, cam.sy); softBeams(c, [[W / 2 + (nose - cam.x) * cam.z, H / 2 + (GYW - 124 - cam.y) * cam.z, 0.03, 9 * RAD, 1300]], 0.5); c.restore();
    const gr = c.createLinearGradient(nose, 0, nose + 520, 0); gr.addColorStop(0, yel(0.45)); gr.addColorStop(1, yel(0)); c.fillStyle = gr; c.fillRect(nose, GYW - 1, 520, 3);
    c.drawImage(A[kind + 'Smear'].c, tail - A[kind + 'Smear'].back - sp.ox, GYW - sp.oy);                                               // motion blur (estela precompuesta)
    drawCar(c, sp, tail, GYW, { ang: tail / 75, spd: v });
    aim = [tail + 480, GYW - 150];
  });
  // el protagonista: sigue al auto con la cámara y dispara
  const hx = RB.hx, face = aim ? (aim[0] < hx ? -1 : 1) : -1, p = { x: hx, y: RB.hy, s: 1.05, face, lx: 0.9, blink: 0, mouth: 'smile', browL: -0.15, browR: -0.15 };
  const ang = aim ? Math.atan2(aim[1] - (RB.hy - 450), Math.abs(aim[0] - hx)) * 0.7 : 0.1, raise = aim ? 1 : 0.35 + 0.1 * Math.sin(u * 3);
  const cyL = lerp(-330, -436, raise); p.hL = [78, cyL + 34]; p.hR = [124, cyL + 40]; p.lean = aim ? 0.07 : 0; p.crouch = aim ? 10 : 0;
  spot(c, hx, RB.hy, 250);
  npc(c, p, (cc) => drawCameraSide(cc, 92, cyL, 0.95, ang));
  for (let i = 0; i < 3; i++) { const ts = shotT(i); burst(c, hx - 150, RB.hy - 470, t, ts, { n: 10, r: 30, grow: 110, len: 60, a0: Math.PI * 0.6, arc: Math.PI * 0.9 }); boom(c, 'CLIC', hx - 250, RB.hy - 640, t, ts, { size: 92, rot: -9, dur: 0.5 }); }
  // [SFX] el cartel cambia: de NPC a CAR SPOTTER
  const on = t >= TAGT;
  nameTag(c, hx, RB.hy - 600 - 30 * Math.sin(prog(t, TAGT, TAGT + 0.3) * Math.PI), on ? 'CAR SPOTTER' : 'NPC', t, on ? 1 : 0);
  burst(c, hx, RB.hy - 640, t, TAGT, { n: 12, r: 70, grow: 110, len: 54, a0: -Math.PI * 1.05, arc: Math.PI * 1.1 });
}
function ramblaOverlay(c, t, cam) {                   // las fotos saltan de la cámara y se apilan
  for (let i = 0; i < 3; i++) {
    const ts = shotT(i) + 0.05, k = E.outBack(prog(t, ts, ts + 0.36), 1.5); if (k <= 0) continue;
    const from = [W / 2 + (RB.hx - 160 - cam.x) * cam.z, H / 2 + (RB.hy - 470 - cam.y) * cam.z], to = PHOTO[i];
    const out = E.inCubic(prog(t, T.logo - 0.3, T.logo - 0.05));
    c.save(); c.globalAlpha = 1 - out; c.translate(lerp(from[0], to[0], k), lerp(from[1], to[1], k) - out * 80); c.rotate((to[2] + (1 - Math.min(1, k)) * 30) * RAD); c.scale(Math.max(0.05, k) * PHS, Math.max(0.05, k) * PHS);
    c.drawImage(A.photos[i].c, -180, -120); c.restore();
  }
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   CIERRE · el flash de la última foto deja el wordmark: GR|DD · Descargá la app · gridd.app
   ══════════════════════════════════════════════════════════════════════════════════════ */
const CTA = { y: 960, h: 116, size: 90, txt: 'DESCARGÁ LA APP' }, URLT = 'gridd.app';
let WM = null;
function sceneLogo(c, t) {
  const ph = VO.logo.ph, tV = ph && ph[1] ? VO.logo.t + ph[1][0] - 0.06 : T.logo + 1.0;                     // [VO] «Descargá la app»: la placa entra con la frase
  const g = WM, base = 900, tB = T.logo + 0.1, t0 = T.logo + 0.42, tC = tV, tU = tV + 0.45;                 // [SFX] barra · letras · CTA · URL
  const bh = E.outBack(prog(t, tB, tB + 0.34), 2), rel = t >= t0 ? Math.exp(-(t - t0) * 12) * Math.cos((t - t0) * 28) : 0;
  if (bh > 0) { c.fillStyle = YEL; const hh = g.barH * bh, ww = g.bw * (1 - 0.1 * rel); c.fillRect(540 - ww / 2, 780 - hh / 2, ww, hh); }
  if (t >= tB && t < tB + 0.6) { c.globalAlpha = 0.8 * Math.exp(-(t - tB) * 7); c.fillStyle = YEL; c.fillRect(540 - 1.5, -200, 3, H + 400); c.globalAlpha = 1; }
  const travel = -g.inkL - g.bw / 2 + 40;
  const eIn = tt => E.outBack(prog(tt, t0, t0 + 0.38), 1.35), eOut = tt => E.outBack(prog(tt, t0, t0 + 0.38), 2.5);
  c.font = g.font; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = K.k9;
  const side = (sgn, tt, a) => { const dI = (1 - eIn(tt)) * travel, dO = (1 - eOut(tt)) * travel; c.globalAlpha = a;
    if (sgn < 0) { c.fillText('R', 540 + g.rX + dI, base); c.fillText('G', 540 + g.grX + dO, base); } else { c.fillText('D', 540 + g.ddX - dI, base); c.fillText('D', 540 + g.d2X - dO, base); } };
  if (t >= t0) for (const sgn of [-1, 1]) {
    c.save(); c.beginPath(); if (sgn < 0) c.rect(-300, 500, 540 - g.bw / 2 + 300, 600); else c.rect(540 + g.bw / 2, 500, 900, 600); c.clip();   // salen de atrás de la barra
    if (t < t0 + 0.2) for (let k = 3; k >= 1; k--) side(sgn, t - k * DT * 0.4, 0.2);
    side(sgn, t, 1); c.restore();
  }
  c.globalAlpha = 1;
  const x0 = 540 + g.inkL, x1 = 540 + g.inkR, bw = x1 - x0, cp = E.outBack(prog(t, tC - 0.07, tC + 0.2), 1.25);
  if (cp > 0) {
    c.fillStyle = YEL; c.fillRect(540 - bw / 2 * cp, CTA.y, bw * cp, CTA.h);
    const S = CTA.size, w = tw(CTA.txt, FD(S));
    ink(c, () => { c.save(); c.beginPath(); c.rect(540 - bw / 2 * cp, CTA.y, bw * cp, CTA.h); c.clip();
      riseText(c, CTA.txt, 540 - w / 2, CTA.y + CTA.h / 2 + S * CAP / 2, S, BG, t, tC + 0.07, undefined, { byWord: true, stg: 0.05, dur: 0.26, back: 1.3 }); c.restore(); });
  }
  if (t >= tU - 0.02) {
    const n = Math.floor(prog(t, tU - 0.02, tU + 0.3) * URLT.length + 0.001);
    c.font = FU(72); c.textBaseline = 'alphabetic'; c.fillStyle = K.k9;
    const tr = 3, full = tw(URLT, c.font) + tr * (URLT.length - 1), sx = 540 - full / 2, s = URLT.slice(0, n), w = n ? tracked(c, s, sx, 1192, tr) : 0;
    if (t < tU + 0.5 && (n < URLT.length || Math.floor((t - tU) * 6) % 2 === 0)) { c.fillStyle = YEL; c.fillRect(sx + w + 6, 1192 - 52, 6, 56); }
  }
}

/* ── armado de las escenas 3 a 6 ── */
function gridA2(t) {
  if (t < T.feed) return 1;
  if (t < T.crowd) return 0.75;
  if (t < TP.in2) return 0.9;
  if (t < T.rambla) return 0.75;
  if (t < T.logo) return 0.3;
  return E.outCubic(prog(t, T.logo, T.logo + 0.4));
}
function renderB(c, t, cam) {
  if (t >= T.buy && t < T.gridd) sceneCamera(c, t);
  if (t >= T.gridd && t < T.feed + 0.02) sceneGridd(c, t);
  if (t >= T.crowd && t < TP.in2 + 0.18) sceneCrowd(c, t);
  if (t >= T.rambla && t < T.logo) sceneRambla(c, t, cam);
}
function overlayB(c, t, cam) {
  if (t >= T.buy && t < T.q3) buyOverlay(c, t, cam);
  scenePhone(c, t);
  if (t >= T.rambla && t < T.logo) ramblaOverlay(c, t, cam);
  if (t >= T.logo) sceneLogo(c, t);
}
function buildCamB() {
  camKey(T.job1, 540, 960, 1, CUT);
  camKey(T.buy, 540, 960, 1);
  camKey(T.buy + 0.7, 540, 880, 1.1);                                     // se acerca: llega la cámara
  camKey(T.q3 + D.q3 - 0.1, 540, 880, 1.1);
  camKey(T.junk + 0.95, 860, 1010, 0.68);                                 // se aleja: aparece la calle
  camKey(T.nope, 860, 1010, 0.68);
  camKey(T.gridd - 0.001, 836, 1010, 0.73);
  camKey(T.gridd, 580, 890, 1.16, CUT);                                   // corte al NPC
  camKey(T.gridd + 0.9, 590, 890, 1.2);
  camKey(T.feed - 0.42, 590, 890, 1.2);
  camKey(T.feed - 0.001, MINI1.x, MINI1.y - (1345 - 960) / ZPH, ZPH, E.inCubic);   // se mete en el teléfono
  camKey(T.feed, 540, 960, 1, CUT);
  camKey(T.crowd - 0.001, 540, 960, 1);
  camKey(T.crowd, 500, 900, 0.8, CUT);                                    // la juntada, vista de costado
  camKey(T.own, 540, 900, 0.8);
  camKey(TP.zoom2 - 0.75, 1010, 880, 1.12);                               // lo encuadra a él
  camKey(TP.zoom2, 1030, 880, 1.16);
  camKey(TP.in2 + 0.139, MINI2.x, MINI2.y - (1345 - 960) / ZPH, ZPH, E.inCubic);
  camKey(TP.in2 + 0.14, 540, 960, 1, CUT);
  camKey(T.rambla - 0.001, 540, 960, 1);
  camKey(T.rambla, 520, 960, 1, CUT);
  camKey(T.logo - 0.001, 566, 960, 1.03, E.outCubic);
  camKey(T.logo, 540, 960, 1, CUT);
  camKey(DUR + 1, 540, 960, 1);
  shake(TJ.pum, 14); shake(TJ.clang, 12); shake(TP.free, 12); shake(TP.daily, 9); shake(TAGT, 8); shake(T.logo + 0.42, 7);
  for (let i = 0; i < 3; i++) flash(shotT(i), 16, 0.5);                    // [SFX] flash de cada foto
  flash(T.goal, 22, 0.35); flash(T.logo, 9, 0.9);                          // meta · corte al cierre
}
function initB() {
  A.cards = EVENTS.map(sprCard); A.cardInk = EVENTS.map(sprCardInk); A.cardNew = sprCard(MYEV); A.cardNewInk = sprCardInk(MYEV);
  A.map = sprMap(); A.wmS = wmGeom(62); A.wmXS = wmGeom(46);
  for (const k of ['super', 'gt', 'spider']) { A[k] = sprCar(k, 1.5); A[k + 'Soft'] = sprCar(k, 1.5, true); }
  A.super12 = sprCar('super', 1.2); A.junk = sprCar('junk', JK.sc);
  A.photoCars = ['super', 'gt', 'spider'].map(k => sprCar(k, 0.46)); A.photos = [0, 1, 2].map(sprPhoto); A.flyer = sprFlyer2(); A.flyerInk = sprFlyer2(true);
  // sprites que alivianan la rambla: la estela de cada auto (diez ecos ya compuestos), el farol y el espectador
  const st = (RB.x1 - RB.x0) / RB.dur * DT * 0.16;
  for (const k of ['super', 'gt', 'spider']) { const sf = A[k + 'Soft'], s = mk(Math.ceil(sf.w + 9 * st + 2), sf.h); s.x.globalAlpha = 0.1; for (let g = 10; g >= 1; g--) s.x.drawImage(sf.c, (10 - g) * st, 0); s.back = 10 * st; A[k + 'Smear'] = s; }
  { const s = mk(444, 344), x = s.x; x.translate(222, 2); x.fillStyle = K.k5; x.fillRect(-5, 0, 10, 340); x.fillRect(-70, 0, 140, 9);
    for (const sd of [-1, 1]) { x.fillStyle = YEL; rr(x, sd * 70 - 22, 6, 44, 15, 7); x.fill(); const g = x.createLinearGradient(0, 20, 0, 340); g.addColorStop(0, yel(0.2)); g.addColorStop(1, yel(0)); x.fillStyle = g;
      x.beginPath(); x.moveTo(sd * 70 - 16, 20); x.lineTo(sd * 70 + 16, 20); x.lineTo(sd * 70 + 150, 340); x.lineTo(sd * 70 - 150, 340); x.closePath(); x.fill(); }
    A.lamp = s; }
  { const s = mk(280, 360); npc(s.x, { x: 130, y: 350, s: 0.5, face: 1, hat: K.k7, lx: 0.9, rim: false, hL: [70, -430], hR: [116, -424] }, (cc) => drawCameraSide(cc, 92, -440, 0.9, 0.2)); A.fan = s; }
  WM = wmGeom(240 / CAP); let fs = 100; while (tw(CTA.txt, FD(fs)) > (WM.inkR - WM.inkL) - 84) fs--; CTA.size = fs;
  buildPhoneTimes();
}
