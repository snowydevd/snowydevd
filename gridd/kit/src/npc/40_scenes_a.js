/* ══════════════════════════════════════════════════════════════════════════════════════
   ESCENAS 1 y 2 · LA NADA y LA PALA
   ══════════════════════════════════════════════════════════════════════════════════════ */
const HANG_L = [-76, -168], HANG_R = [76, -168];     // manos colgando
const mixP = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const toL = (p, wx, wy) => [(wx - p.x) / ((p.s || 1) * (p.face || 1)), (wy - (p.y ?? GYW)) / (p.s || 1)];   // mundo → espacio del personaje
const SHX = 742;                                     // dónde cae la pala
const TI = T.fall + 0.5;                             // [SFX] el instante en que se clava («TONC»)

function shovelVoid(t) {                             // la pala: cae, vibra clavada, y la arrancan
  if (t < T.fall + 0.14) return null;
  if (t < TI) { const u = E.inQuad(prog(t, T.fall + 0.14, TI)); return { x: SHX + 30 * (1 - u), y: lerp(GYW - 1500, GYW + 46, u), rot: 0.32 * (1 - u), hot: 0 }; }
  const d = t - TI, g = seg(t, 'grab'), pull = E.outBack(prog(g, 0.5, 0.92), 1.4);
  return { x: lerp(SHX, 716, pull), y: lerp(GYW + 46, GYW - 150, pull), rot: 0.13 * Math.exp(-d * 6) * Math.cos(d * 28) + lerp(0.04, -0.28, pull),
           hot: t >= T.q2 && g < 0.5 ? 0.55 + 0.45 * Math.sin((t - T.q2) * 9) : 0 };
}
function heroVoid(t) {
  const p = { x: 540, y: GYW, blink: blinkAt(t), sq: breathe(t) };
  const tC = wordT('q1', 'CAR') - 0.1, tB = pageT('q1', 1) - 0.05;       // [VO] «car spotter» → se ilusiona · «no tenés un mango» → bolsillos
  if (t < T.q1) {                                                         // mira para los costados: no hay nada
    p.lx = 0.9 * Math.sin((t - 0.2) * 2.4) * prog(t, 0.2, 0.5); p.browL = p.browR = 0.15;
  } else if (t < tB) {
    const k = E.outCubic(prog(t, T.q1, T.q1 + 0.3)), d = E.outBack(prog(t, tC, tC + 0.3), 2);
    p.lx = lerp(0.9 * Math.sin((T.q1 - 0.2) * 2.4), 0, k); p.wide = 0.5 * d; p.mouth = d > 0.5 ? 'smile' : 'flat'; p.ly = -0.25 * d; p.browY = -4 * d;
  } else if (t < T.fall) {
    const k = E.outBack(prog(t, tB, tB + 0.32), 2.2), sh = E.outCubic(prog(t, tB, tB + 0.25)) * (1 - E.inOutCubic(prog(t, T.nod - 0.1, T.nod + 0.25)));
    p.pockets = k; p.browL = p.browR = 0.5 * Math.min(1, k); p.mouth = 'sad'; p.tilt = 0.06 * sh;
    p.hL = mixP(HANG_L, [-128, -262], sh); p.hR = mixP(HANG_R, [128, -262], sh);                    // se encoge de hombros
    const n = seg(t, 'nod'); if (n > 0 && n < 1) { const nd = Math.pow(Math.max(0, Math.sin(n * TAU * 2 - 0.3)), 0.8) * (1 - n * 0.2); p.hdy = 14 * nd; p.ly = 0.75 * nd; }   // asiente dos veces
  } else {
    const d = t - TI;
    p.pockets = 1 - E.inCubic(prog(t, T.grab, T.grab + 0.18)); p.mouth = 'o'; p.browL = p.browR = 0.2;
    if (d < 0) { const u = E.outCubic(prog(t, T.fall + 0.08, TI - 0.08)); p.ly = -0.9 * u; p.lx = 0.45 * u; p.wide = 0.7 * u; p.hdy = -6 * u; }   // la ve venir
    else {
      const hop = Math.sin(prog(d, 0, 0.34) * Math.PI), land = d > 0.34 ? Math.exp(-(d - 0.34) * 14) : 0, calm = E.inOutCubic(prog(d, 0.36, 0.7));
      p.y = GYW - 62 * hop; p.x = 540 - 36 * E.outCubic(prog(d, 0, 0.34)); p.sq += 0.1 * hop - 0.13 * land;                              // salta del susto
      p.wide = lerp(1, 0.25, prog(d, 0.3, 0.8)); p.lx = lerp(0.45, 0.95, prog(d, 0.1, 0.4)); p.ly = lerp(-0.9, 0.1, E.outCubic(prog(d, 0, 0.3)));
      p.hL = mixP([-120, -300], HANG_L, calm); p.hR = mixP([124, -310], HANG_R, calm);
    }
    if (t >= T.q2) {
      const tA = wordT('q2', 'AGARRALA') - 0.15, look = E.inOutCubic(prog(t, tA, tA + 0.22)) * (1 - E.inOutCubic(prog(t, tA + 0.75, tA + 1.0)));   // [VO] mira al narrador y vuelve a la pala
      p.mouth = t > tA && t < tA + 0.7 ? 'wavy' : 'flat'; p.lx = lerp(0.95, 0, look); p.wide = 0.25; p.browL = p.browR = lerp(0.2, -0.3, prog(t, tA + 0.7, tA + 1.0));
    }
    if (t >= T.grab) {
      const u = seg(t, 'grab'), st = prog(u, 0, 0.5);
      p.x = lerp(504, 640, E.inOutCubic(st)); p.y = GYW - 20 * Math.sin(st * Math.PI); p.lean = 0.14 * Math.sin(prog(u, 0, 0.6) * Math.PI);
      p.lx = 0.9; p.browL = p.browR = -0.35; p.mouth = u > 0.55 ? 'grit' : 'flat'; p.wide = 0;
    }
  }
  return p;
}
function thought(c, x, y, s, a, pop) {               // globito de pensamiento: una cámara
  if (s <= 0.01) return;
  c.save(); c.translate(x, y); c.scale(s * (1 + pop * 0.5), s * (1 + pop * 0.5)); c.globalAlpha = a * (1 - pop);
  c.fillStyle = K.k3; c.strokeStyle = K.k6; c.lineWidth = 3;
  for (const [bx, by, r] of [[-104, 96, 9], [-84, 74, 14]]) { c.beginPath(); c.arc(bx, by, r, 0, TAU); c.fill(); c.stroke(); }
  c.beginPath(); for (const [bx, by, r] of [[-46, 4, 52], [10, -22, 58], [56, 8, 50], [4, 24, 54]]) { c.moveTo(bx + r, by); c.arc(bx, by, r, 0, TAU); } c.stroke(); c.fill();
  drawCamera(c, 4, 6, 0.62, -0.1);
  c.restore();
}
function sceneVoid(c, t) {
  ground(c, -3000, 4000);
  const tu = prog(t, 0.15, T.q1 + 1.6);                                   // un cardo cruza rodando
  if (tu > 0 && tu < 1) tumbleweed(c, lerp(-760, 1900, tu), GYW - 58 - Math.abs(Math.sin(tu * 20)) * 44, 54, tu * 28);
  const p = heroVoid(t), sh = shovelVoid(t), g = seg(t, 'grab'), held = sh && g > 0.5;
  spot(c, p.x, GYW, 250);
  if (t >= T.fall && t < TI) { const u = prog(t, T.fall, TI); c.save(); c.globalAlpha = 0.5 * u; c.fillStyle = K.k5; c.beginPath(); c.ellipse(SHX, GYW + 5, 14 + 56 * u, 4 + 8 * u, 0, 0, TAU); c.fill(); c.restore(); }   // la sombra avisa
  if (sh && !held) { c.save(); c.beginPath(); c.rect(-3000, -4000, 7000, 4000 + GYW + 2); c.clip(); drawShovel(c, sh.x, sh.y, sh.rot, sh.hot); c.restore();
    if (sh.hot > 0) for (let i = 0; i < 3; i++) { const u = ((t - T.q2) * 1.3 + i / 3) % 1; sparkle(c, SHX + [-58, 62, 34][i], GYW - [300, 210, 360][i], 22 * Math.sin(u * Math.PI), 1); } }
  if (t >= T.grab) {                                                      // manos a la pala
    const gt = shvPt(sh.x, sh.y, sh.rot, SHV.top), gm = shvPt(sh.x, sh.y, sh.rot, SHV.mid);
    p.hR = mixP(HANG_R, toL(p, gt[0], gt[1]), E.inOutCubic(prog(g, 0.2, 0.5))); p.hL = mixP(HANG_L, toL(p, gm[0], gm[1]), E.inOutCubic(prog(g, 0.52, 0.8)));
  }
  npc(c, p, held ? (cc, gg, pp) => { const l = toL(pp, sh.x, sh.y); drawShovel(cc, l[0], l[1], sh.rot, 0); } : null);
  nameTag(c, p.x, p.y - 560 * (1 + (p.sq || 0)), 'NPC', t, 0, E.outBack(prog(t, 0.5, 0.8), 2));
  // globito: sueña con la cámara… hasta que se acuerda de la billetera
  const tC = wordT('q1', 'CAR') - 0.1, tB = pageT('q1', 1) - 0.05;
  if (t > tC && t < tB + 0.3) thought(c, 770, 700, E.outBack(prog(t, tC, tC + 0.28), 2), 1, E.outCubic(prog(t, tB, tB + 0.22)));
  burst(c, 770, 700, t, tB, { n: 10, r: 60, grow: 60, a0: 0, arc: TAU * 0.9, col: K.k7, w: 5 });
  const mo = prog(t, tB + 0.2, tB + 2.1);                                 // la polilla del bolsillo
  if (mo > 0 && mo < 1) moth(c, p.x + 96 + mo * 150 + Math.sin(mo * 19) * 26, GYW - 190 - mo * 430 + Math.cos(mo * 13) * 18, t, Math.min(1, (1 - mo) * 3));
  // la pala
  mark(c, '!', p.x - 132, p.y - 470, t, TI + 0.02, 0.75);
  puffs(c, SHX, GYW, t, TI, 7, 110);
  burst(c, SHX, GYW - 8, t, TI, { n: 7, r: 30, grow: 90, len: 40 });
  boom(c, 'TONC', 880, 800, t, TI, { size: 124 });
  puffs(c, SHX, GYW, t, T.grab + D.grab * 0.52, 5, 70);
}

/* ── secuencia de changas: tres planos cortos, con corte de barrido entre uno y otro ── */
const whipIn = (t, tc) => (1 - E.outExpo(prog(t, tc, tc + 0.22))) * 1500;
const whipOut = (t, tc) => -E.inCubic(prog(t, tc - 0.12, tc)) * 1500;
const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

function shotObra(c, t) {                             // changa 1: palear en una obra
  const u = t - T.job1, P = 0.62, n = Math.floor(u / P), f = ((u % P) + P) % P / P;
  const KP = [648, GYW - 60, -0.62], K0 = [636, GYW + 36, -0.5], K1 = [690, GYW - 120, -1.0], K2 = [770, GYW - 230, -1.3];   // pala: lista · clavada · con tierra · revoleo
  const S = f < 0.26 ? mix3(KP, K0, E.inCubic(f / 0.26)) : f < 0.52 ? mix3(K0, K1, E.outCubic((f - 0.26) / 0.26)) : f < 0.72 ? mix3(K1, K2, E.outExpo((f - 0.52) / 0.2)) : mix3(K2, KP, E.inOutCubic((f - 0.72) / 0.28));
  const dig = f < 0.26 ? E.inCubic(f / 0.26) : f < 0.52 ? 1 - E.outCubic((f - 0.26) / 0.26) : 0, toss = f > 0.52 && f < 0.8 ? Math.sin((f - 0.52) / 0.28 * Math.PI) : 0;
  ground(c, -400, 1500);
  // valla a rayas y cono
  c.fillStyle = K.k5; c.fillRect(150, GYW - 170, 12, 170); c.fillRect(398, GYW - 170, 12, 170);
  c.save(); c.beginPath(); c.rect(120, GYW - 190, 320, 74); c.clip(); c.fillStyle = K.k3; c.fillRect(120, GYW - 190, 320, 74); c.fillStyle = YEL;
  for (let i = -2; i < 9; i++) { c.beginPath(); c.moveTo(120 + i * 64, GYW - 116); c.lineTo(152 + i * 64, GYW - 116); c.lineTo(192 + i * 64, GYW - 190); c.lineTo(160 + i * 64, GYW - 190); c.closePath(); c.fill(); }
  c.restore();
  c.fillStyle = K.k6; c.beginPath(); c.moveTo(948, GYW - 118); c.lineTo(968, GYW - 118); c.lineTo(996, GYW - 12); c.lineTo(920, GYW - 12); c.closePath(); c.fill(); c.fillRect(904, GYW - 14, 108, 14);
  c.fillStyle = YEL; c.fillRect(936, GYW - 78, 44, 16);
  // montículo que crece con cada palada
  const mh = 30 + 24 * Math.min(4, n + (f > 0.8 ? (f - 0.8) / 0.2 : 0));
  c.fillStyle = K.k4; c.beginPath(); c.moveTo(770, GYW); c.quadraticCurveTo(850, GYW - mh * 2.1, 930, GYW); c.closePath(); c.fill();
  c.fillStyle = BG; c.beginPath(); c.ellipse(628, GYW + 4, 78, 13, 0, 0, TAU); c.fill(); c.strokeStyle = K.k5; c.lineWidth = 3; c.stroke();   // el pozo
  const p = { x: 470, y: GYW, lean: 0.1 + 0.27 * dig - 0.13 * toss, crouch: 10 + 30 * dig, lx: 0.9, ly: 0.35 * dig - 0.3 * toss, mouth: 'grit', browL: -0.3, browR: -0.3 };
  const gt = shvPt(S[0], S[1], S[2], SHV.top), gm = shvPt(S[0], S[1], S[2], SHV.mid);
  p.hL = toL(p, gt[0], gt[1]); p.hR = toL(p, gm[0], gm[1]);
  spot(c, p.x, GYW, 230);
  npc(c, p, (cc) => { drawShovel(cc, S[0] - p.x, S[1] - GYW, S[2]);
    if (f > 0.3 && f < 0.6) { cc.fillStyle = K.k5; const tip = shvPt(S[0] - p.x, S[1] - GYW, S[2], -50); cc.beginPath(); cc.arc(tip[0], tip[1] - 8, 30, 0, TAU); cc.fill(); } });   // la tierra en la pala
  for (let k = Math.max(0, n - 1); k <= n; k++) {                         // terrones volando al montículo
    const tk = T.job1 + k * P + 0.58 * P, d = t - tk; if (d < 0 || d > 0.6) continue;
    c.fillStyle = K.k5;
    for (let i = 0; i < 6; i++) { const vx = 120 + hash(i * 3.7 + k) * 170, vy = -420 - hash(i * 5.3 + k) * 240, x = 770 + vx * d, y = GYW - 250 + vy * d + 1700 * d * d; if (y < GYW - 6) { c.beginPath(); c.arc(x, y, 8 + hash(i * 2.1) * 9, 0, TAU); c.fill(); } }
  }
  sweat(c, p.x + 30, GYW - 500, t, T.job1 + 0.2);
}
function shotLavadero(c, t) {                         // changa 2: lavar autos
  const u = t - T.job2, a = u * 15;
  ground(c, -400, 1500);
  c.fillStyle = K.k4; c.beginPath(); c.ellipse(760, GYW + 6, 420, 10, 0, 0, TAU); c.fill();                                  // charco
  drawCar(c, A.hatch, 330, GYW, {});
  const hx = 520 + Math.cos(a) * 50, hy = GYW - 196 + Math.sin(a) * 38;                                                       // la esponja da vueltas
  const p = { x: 250, y: GYW, lean: 0.2, lx: 0.9, ly: 0.2, mouth: 'smile', browL: -0.1, browR: -0.1, crouch: 6 + 4 * Math.sin(a), blink: blinkAt(t, 3) };
  p.hR = toL(p, hx, hy); p.hL = [-58, -150];
  // balde
  c.fillStyle = K.k5; c.beginPath(); c.moveTo(74, GYW - 76); c.lineTo(152, GYW - 76); c.lineTo(142, GYW); c.lineTo(84, GYW); c.closePath(); c.fill();
  c.fillStyle = '#D6D6DA'; c.fillRect(76, GYW - 82, 74, 10); c.strokeStyle = K.k7; c.lineWidth = 4; c.beginPath(); c.arc(113, GYW - 80, 36, Math.PI, 0); c.stroke();
  spot(c, p.x, GYW, 220);
  npc(c, p, (cc) => { cc.fillStyle = YEL; rr(cc, hx - p.x - 26, hy - GYW - 16, 52, 34, 9); cc.fill(); });                     // esponja
  // espuma
  c.fillStyle = '#D6D6DA';
  for (let i = 0; i < 22; i++) {
    const ph = hash(i * 4.1), born = ph * 0.9, life = ((u - born) % 1.1 + 1.1) % 1.1 / 1.1; if (u < born) continue;
    const bx = 410 + hash(i * 7.7) * 420, by = GYW - 90 - hash(i * 2.9) * 170 - life * 24, r = (6 + hash(i * 9.3) * 15) * Math.sin(Math.min(1, life * 1.4) * Math.PI * 0.9 + 0.2);
    c.globalAlpha = 0.9 * (1 - life * life); c.beginPath(); c.arc(bx, by, Math.max(0, r), 0, TAU); c.fill();
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 5; i++) { const d = ((u * 1.6 + i * 0.21) % 1); c.fillStyle = K.k8; c.globalAlpha = 1 - d; c.fillRect(420 + i * 96, GYW - 40 + d * 40, 4, 14); } c.globalAlpha = 1;   // gotas
  const sp = prog(t, T.job2 + D.job2 - 0.55, T.job2 + D.job2 - 0.15); if (sp > 0 && sp < 1) { sparkle(c, 860, GYW - 290, 50 * Math.sin(sp * Math.PI)); sparkle(c, 960, GYW - 200, 30 * Math.sin(sp * Math.PI)); }
}
function drawBike(c, x, y, ang) {
  c.save(); c.translate(x, y); c.lineCap = 'round'; c.lineJoin = 'round';
  for (const wx of [-118, 128]) {
    c.strokeStyle = K.k7; c.lineWidth = 7; c.beginPath(); c.arc(wx, -80, 76, 0, TAU); c.stroke();
    c.strokeStyle = K.k5; c.lineWidth = 2; for (let i = 0; i < 8; i++) { const a = ang + i * TAU / 8; c.beginPath(); c.moveTo(wx, -80); c.lineTo(wx + Math.cos(a) * 72, -80 + Math.sin(a) * 72); c.stroke(); }
  }
  c.strokeStyle = '#D6D6DA'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, -82); c.lineTo(-30, -236); c.lineTo(96, -226); c.lineTo(0, -82); c.lineTo(-118, -80); c.lineTo(-30, -236); c.moveTo(96, -226); c.lineTo(128, -80); c.moveTo(92, -214); c.lineTo(104, -262); c.lineTo(128, -268); c.stroke();
  c.fillStyle = K.k8; rr(c, -60, -250, 58, 14, 7); c.fill();
  c.fillStyle = YEL; c.beginPath(); c.arc(132, -246, 9, 0, TAU); c.fill();
  c.restore();
}
function shotDelivery(c, t) {                         // changa 3: delivery en bici, de noche
  const u = t - T.job3, sc = u * 880, ang = sc / 76;
  // edificios lejos (parallax lento) con alguna ventana prendida
  for (let i = 0; i < 9; i++) { const bw = 150 + hash(i * 3.3) * 110, bx = ((i * 260 - sc * 0.16) % 2340 + 2340) % 2340 - 400, bh = 240 + hash(i * 7.1) * 300;
    c.fillStyle = K.k2; c.fillRect(bx, GYW - bh, bw, bh); c.fillStyle = yel(0.55); for (let k = 0; k < 4; k++) if (hash(i * 11 + k * 3.7) > 0.45) c.fillRect(bx + 22 + (k % 2) * 60, GYW - bh + 40 + Math.floor(k / 2) * 86, 26, 34); }
  ground(c, -400, 1500);
  c.fillStyle = K.k6; for (let i = 0; i < 8; i++) { const x = ((i * 260 - sc) % 2080 + 2080) % 2080 - 400; c.fillRect(x, GYW + 34, 120, 5); }      // línea de la calle
  for (let i = 0; i < 3; i++) {                                           // faroles que pasan
    const x = ((i * 760 - sc * 0.9) % 2280 + 2280) % 2280 - 500;
    c.fillStyle = K.k5; c.fillRect(x, GYW - 560, 10, 560); c.fillRect(x, GYW - 560, 96, 10); c.fillStyle = YEL; rr(c, x + 70, GYW - 552, 44, 16, 8); c.fill();
    const g = c.createLinearGradient(0, GYW - 536, 0, GYW); g.addColorStop(0, yel(0.22)); g.addColorStop(1, yel(0)); c.fillStyle = g; c.beginPath(); c.moveTo(x + 76, GYW - 536); c.lineTo(x + 108, GYW - 536); c.lineTo(x + 260, GYW); c.lineTo(x - 80, GYW); c.closePath(); c.fill();
  }
  const bx = 520, bob = Math.sin(u * 22) * 3;
  const g2 = c.createLinearGradient(bx + 130, 0, bx + 620, 0); g2.addColorStop(0, yel(0.4)); g2.addColorStop(1, yel(0)); c.fillStyle = g2; c.beginPath(); c.moveTo(bx + 134, GYW - 246); c.lineTo(bx + 640, GYW - 330); c.lineTo(bx + 640, GYW - 60); c.closePath(); c.fill();   // luz de la bici
  spot(c, bx, GYW, 260);
  drawBike(c, bx, GYW, ang);
  const pa = ang * 0.55, px = Math.cos(pa) * 36, py = Math.sin(pa) * 36;
  c.strokeStyle = K.k7; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx + px, GYW - 82 + py); c.lineTo(bx - px, GYW - 82 - py); c.stroke();      // bielas
  const p = { x: bx, y: GYW + bob, hipX: -34, crouch: NG.hip - 246, lean: 0.46, lx: 0.9, mouth: 'grit', browL: -0.25, browR: -0.25, tilt: -0.3,
              hL: [112, -262], hR: [120, -266], fL: [-px - 8, -82 - py + 22], fR: [px - 8, -82 + py + 22], behind: 'L' };
  // mochila térmica a la espalda
  c.save(); c.translate(bx - 34, GYW + bob - 246); c.rotate(0.46); rr(c, -150, -168, 118, 132, 12); c.fillStyle = K.k3; c.fill(); c.lineWidth = 3; c.strokeStyle = K.k6; c.stroke(); c.fillStyle = YEL; c.fillRect(-150, -120, 118, 22); c.restore();
  npc(c, p);
  c.fillStyle = K.k8; for (let i = 0; i < 7; i++) { const y = GYW - 120 - hash(i * 3.9) * 420, x = ((hash(i * 8.1) * 1400 - sc * 1.5) % 1500 + 1500) % 1500 - 200; c.globalAlpha = 0.5; c.fillRect(x, y, 150 + hash(i) * 120, 3); } c.globalAlpha = 1;   // viento
}
function shotGoal(c, t) {                             // meta: US$ 1.000
  const u = t - T.goal, hop = Math.abs(Math.sin(u * 9.5)) * Math.exp(-u * 1.1);
  ground(c, -400, 1500); spot(c, 540, GYW, 260);
  for (let i = 0; i < 14; i++) {                                           // lluvia de monedas
    const a = -Math.PI * (0.1 + 0.8 * hash(i * 3.1)), v = 560 + hash(i * 5.7) * 460, x = 540 + Math.cos(a) * v * u, y = GYW - 330 + Math.sin(a) * v * u + 1250 * u * u;
    if (y < GYW - 8) coin(c, x, y, 24, 1, Math.cos(u * 16 + i));
  }
  npc(c, { x: 540, y: GYW - 70 * hop, sq: 0.07 * hop, mouth: 'big', wide: 0.3, browY: -5, hL: [-136, -474 - 20 * hop], hR: [136, -474 - 20 * hop] });
  nameTag(c, 540, GYW - 70 * hop - 566, 'NPC', t, 0);
  burst(c, 540, GYW - 320, t, T.goal + 0.05, { n: 14, r: 150, grow: 150, len: 60, a0: -Math.PI * 1.1, arc: Math.PI * 1.2 });
}
function sceneJobs(c, t) {                            // [VO] una changa por línea: «Una changa. Otra changa. Y otra más.»
  const shots = [[T.job1, T.job2, shotObra, 'OBRA', '+US$ 300'], [T.job2, T.job3, shotLavadero, 'LAVADERO', '+US$ 350'], [T.job3, T.goal, shotDelivery, 'DELIVERY', '+US$ 350']];
  for (const [a, b, fn] of shots) if (t >= a && t < b) { c.save(); c.translate(whipIn(t, a) + whipOut(t, b), 0); fn(c, t); c.restore(); }
  if (t >= T.goal) { c.save(); c.translate(whipIn(t, T.goal), 0); shotGoal(c, t); c.restore(); }
}
function jobsOverlay(c, t) {                          // en pantalla (no en el mundo): carteles, ganancias y barridos de corte
  const shots = [[T.job1, T.job2, 'OBRA', '+US$ 300'], [T.job2, T.job3, 'LAVADERO', '+US$ 350'], [T.job3, T.goal, 'DELIVERY', '+US$ 350']];
  for (const [a, b, name, plus] of shots) { placeChip(c, name, t, a, b); gain(c, plus, 640, 640, t, a + (b - a) * 0.5); }
  for (const tc of [T.job1, T.job2, T.job3, T.goal]) whipLines(c, t, tc);
}
