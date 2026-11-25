/* ══════════════════════════════════════════════════════════════════════════════════════
   4 · PERSONAJES
   El mismo rig 2D de «De NPC a car spotter» (caderas, torso, cabeza, brazos y piernas con IK),
   con vestuario nuevo para que cada «tipo» se reconozca de un vistazo:
     hw   = qué tiene en la cabeza: 'beanie' (gorro), 'cap' (gorra al revés), 'hair' (jopo con gel),
            'short' (pelo corto) o 'none'
     hatc = color de la gorra / el pelo · acc = accesorios: 'shades', 'glasses', 'stache' (separados por espacio)
     pal  = colores de la ropa · skull = 1 → esqueleto (para el chiste de las tres horas)
     hlock = ángulo fijo de la cabeza (para dibujarlo acostado con la cara derecha)
   ══════════════════════════════════════════════════════════════════════════════════════ */
const NC = { skin: '#BFBFC8', skinS: '#A0A0AA', hood: '#4E4E58', hoodS: '#3E3E47', hoodD: '#2C2C33', pants: '#303037', shoe: '#D6D6DA', sole: YEL, hat: YEL };
const NRIM = { skin: '#8E8E98', skinS: '#8E8E98', hood: '#8E8E98', hoodS: '#8E8E98', hoodD: '#8E8E98', pants: '#7A7A84', shoe: '#8E8E98', sole: null, hat: '#8E8E98' };
const NG = { hip: 188, torso: 148, headR: 76, shW: 58, shY: 22, armU: 78, armL: 76, hipW: 30, thigh: 85, shin: 85 };
const POSE0 = { x: 540, y: GYW, s: 1, face: 1, lean: 0, crouch: 0, hipX: 0, sq: 0, tilt: 0, hdx: 0, hdy: 0, lx: 0, ly: 0, blink: 0, wide: 0, lid: 0,
                browL: 0, browR: 0, browY: 0, mouth: 'flat', hL: null, hR: null, eL: 0, eR: 0, fL: null, fR: null, kL: -1, kR: -1, aL: 0, aR: 0,
                hat: YEL, hw: 'beanie', hatc: '#5A5A63', acc: '', pal: null, skull: 0, hlock: null, behind: '', a: 1, rim: true, pockets: 0 };

function ik(ax, ay, tx, ty, l1, l2, dir) {            // dos huesos: devuelve codo/rodilla (e) y extremo alcanzado (h)
  let dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy) || 0.001;
  const mx = l1 + l2 - 0.5; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
  const a = Math.atan2(dy, dx), k = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  return { ex: ax + Math.cos(a + k * dir) * l1, ey: ay + Math.sin(a + k * dir) * l1, hx: ax + dx, hy: ay + dy };
}
function npcGeom(p) {                                 // esqueleto en coordenadas locales (origen = entre los pies, y negativo = arriba)
  const hy = -(NG.hip - p.crouch), H = [p.hipX, hy], ca = Math.cos(p.lean), sa = Math.sin(p.lean);
  const R = (x, y) => [H[0] + x * ca - y * sa, H[1] + x * sa + y * ca];
  const N = R(0, -NG.torso), SL = R(-NG.shW, -NG.torso + NG.shY), SR = R(NG.shW, -NG.torso + NG.shY);
  const hp = p.lean * 0.55 + p.tilt, ha = p.hlock ?? hp;
  const HC = [N[0] + Math.sin(hp) * NG.headR * 0.95 + p.hdx, N[1] - Math.cos(hp) * NG.headR * 0.95 + p.hdy];
  const hl = p.hL || [SL[0] - 18, SL[1] + 146], hr = p.hR || [SR[0] + 18, SR[1] + 146];
  const arm = (S, h, dir, side) => {                    // dir 0 = automático: codo hacia afuera y hacia abajo
    if (dir) return ik(S[0], S[1], h[0], h[1], NG.armU, NG.armL, dir);
    const a = ik(S[0], S[1], h[0], h[1], NG.armU, NG.armL, 1), b = ik(S[0], S[1], h[0], h[1], NG.armU, NG.armL, -1);
    const sc = e => side * (e.ex - S[0]) + 0.55 * (e.ey - S[1]), w = clamp(0.5 + (sc(a) - sc(b)) / 70);
    return { ex: lerp(b.ex, a.ex, w), ey: lerp(b.ey, a.ey, w), hx: a.hx, hy: a.hy };
  };
  const AL = arm(SL, hl, p.eL, -1), AR = arm(SR, hr, p.eR, 1);
  const fl = p.fL || [-36, 0], fr = p.fR || [36, 0];
  const LL = ik(H[0] - NG.hipW, hy, fl[0], fl[1] - 22, NG.thigh, NG.shin, p.kL), LR = ik(H[0] + NG.hipW, hy, fr[0], fr[1] - 22, NG.thigh, NG.shin, p.kR);
  return { H, N, SL, SR, HC, ha, AL, AR, LL, LR };
}
function limb(c, a, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) c.lineTo(a[i], a[i + 1]); c.stroke(); }

function npcFace(c, p) {                              // en el marco de la cabeza. lx, ly = hacia dónde mira (la cara se corre: «gira»)
  const fx = p.lx * 20, fy = p.ly * 12, shades = p.acc.includes('shades');
  c.lineCap = 'round';
  c.strokeStyle = NC.skinS; c.lineWidth = 3.5; c.beginPath(); c.moveTo(fx * 1.25 - 2, fy + 23); c.quadraticCurveTo(fx * 1.25 + 7, fy + 30, fx * 1.25 - 1, fy + 33); c.stroke();   // nariz
  for (const s of [-1, 1]) {
    const ex = fx + s * 27, ey = fy + 14, rx = 9.5 * (1 + p.wide * 0.25), ry = Math.max(1.5, 11.5 * (1 + p.wide * 0.3) * (1 - p.blink * 0.9));
    if (!shades) {
      c.fillStyle = BG; c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, TAU); c.fill();
      if (p.blink < 0.5) { c.fillStyle = '#D6D6DA'; c.beginPath(); c.arc(ex - 3, ey - 4, 2.6, 0, TAU); c.fill(); }
      if (p.lid > 0.02) { c.fillStyle = NC.skin; c.fillRect(ex - 15, ey - 18, 30, 6 + 13 * p.lid); c.fillStyle = BG; c.fillRect(ex - 12, ey - 13 + 13 * p.lid, 24, 3.5); }   // párpado (cara de «¿en serio?»)
    }
    c.save(); c.translate(ex, fy - 9 + p.browY - p.wide * 5 - (shades ? 9 : 0)); c.rotate((s < 0 ? p.browL : p.browR) * s); c.fillStyle = BG; rr(c, -12, -3.5, 24, 7, 3.5); c.fill(); c.restore();   // ceja
  }
  const mx = fx * 0.9, my = fy + 46; c.strokeStyle = BG; c.lineWidth = 5; c.fillStyle = BG;
  switch (p.mouth) {
    case 'smile': c.beginPath(); c.moveTo(mx - 15, my - 4); c.quadraticCurveTo(mx, my + 12, mx + 15, my - 4); c.stroke(); break;
    case 'smirk': c.beginPath(); c.moveTo(mx - 13, my + 1); c.quadraticCurveTo(mx + 2, my + 6, mx + 16, my - 8); c.stroke(); break;
    case 'big':   c.beginPath(); c.moveTo(mx - 19, my - 6); c.quadraticCurveTo(mx, my + 28, mx + 19, my - 6); c.closePath(); c.fill(); break;
    case 'sad':   c.beginPath(); c.moveTo(mx - 13, my + 5); c.quadraticCurveTo(mx, my - 8, mx + 13, my + 5); c.stroke(); break;
    case 'o':     c.beginPath(); c.ellipse(mx, my + 2, 8, 10, 0, 0, TAU); c.fill(); break;
    case 'O':     c.beginPath(); c.ellipse(mx, my + 6, 13, 17, 0, 0, TAU); c.fill(); break;
    case 'grit':  rr(c, mx - 15, my - 7, 30, 15, 5); c.fill(); c.fillStyle = '#D6D6DA'; c.fillRect(mx - 11, my - 2, 22, 4); break;
    case 'wavy':  c.beginPath(); c.moveTo(mx - 15, my); c.quadraticCurveTo(mx - 8, my - 7, mx, my); c.quadraticCurveTo(mx + 8, my + 7, mx + 15, my); c.stroke(); break;
    case 'sip':   c.beginPath(); c.ellipse(mx + 4, my, 5, 5, 0, 0, TAU); c.fill(); break;
    default:      c.beginPath(); c.moveTo(mx - 11, my); c.lineTo(mx + 11, my); c.stroke();
  }
}
function skullFace(c, p) {                            // el que se quedó escuchando tres horas
  const fx = p.lx * 12, fy = p.ly * 8;
  c.fillStyle = BG;
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(fx + s * 28, fy + 8, 19, 22, s * 0.12, 0, TAU); c.fill(); }
  c.beginPath(); c.moveTo(fx, fy + 30); c.lineTo(fx - 9, fy + 44); c.lineTo(fx + 9, fy + 44); c.closePath(); c.fill();
  rr(c, fx - 27, fy + 52, 54, 20, 5); c.fill();
  c.strokeStyle = '#D6D6DA'; c.lineWidth = 3.5;
  for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(fx + i * 9, fy + 52); c.lineTo(fx + i * 9, fy + 72); c.stroke(); }
  c.fillStyle = '#D6D6DA'; c.fillRect(fx - 27, fy + 60, 54, 3);
  c.strokeStyle = K.k6; c.lineWidth = 3; c.beginPath(); c.moveTo(fx + 52, fy - 30); c.lineTo(fx + 40, fy - 14); c.lineTo(fx + 50, fy - 4); c.stroke();   // rajadura
}
function headwear(c, p, C, detail) {
  switch (p.hw) {
    case 'beanie':
      c.fillStyle = C.hat; c.beginPath(); c.moveTo(-80, -20); c.bezierCurveTo(-88, -108, 88, -108, 80, -20); c.closePath(); c.fill();
      rr(c, -85, -40, 170, 32, 13); c.fill();
      if (detail) { c.fillStyle = BG; c.fillRect(-80, -41.5, 160, 3); rr(c, 26 + p.lx * 10, -31, 20, 14, 3); c.fill(); }
      break;
    case 'cap': {                                      // gorra con la visera para atrás
      const side = p.lx >= 0 ? -1 : 1;
      c.fillStyle = p.hatc; c.beginPath(); c.moveTo(-80, -26); c.bezierCurveTo(-84, -106, 84, -106, 80, -26); c.closePath(); c.fill();
      c.save(); c.translate(side * 74, -34); c.rotate(side * 0.18); rr(c, side < 0 ? -66 : 0, -9, 66, 18, 9); c.fillStyle = K.k3; c.fill(); c.restore();   // visera
      if (detail) { c.fillStyle = K.k3; rr(c, -82, -38, 164, 14, 7); c.fill(); c.fillStyle = YEL; c.beginPath(); c.arc(0, -96, 7, 0, TAU); c.fill(); }
      break;
    }
    case 'hair':                                       // jopo con gel: el de la facha
      c.fillStyle = p.hatc; c.beginPath(); c.moveTo(-82, -12); c.bezierCurveTo(-92, -96, -18, -112, 30, -104); c.bezierCurveTo(74, -124, 108, -94, 86, -48);
      c.lineTo(80, -28); c.bezierCurveTo(44, -50, -18, -48, -62, -34); c.lineTo(-80, 4); c.closePath(); c.fill();
      if (detail) { c.strokeStyle = K.k7; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, -86); c.quadraticCurveTo(0, -100, 34, -94); c.moveTo(48, -98); c.quadraticCurveTo(74, -104, 82, -78); c.stroke(); }
      break;
    case 'short':                                      // pelo corto, con flequillo
      c.fillStyle = p.hatc; c.beginPath(); c.moveTo(-80, -14); c.bezierCurveTo(-88, -104, 88, -104, 80, -14);
      for (let i = 0; i <= 8; i++) c.lineTo(80 - i * 20, i % 2 ? -44 : -30); c.lineTo(-80, -14); c.closePath(); c.fill();
      break;
  }
}
function accessories(c, p) {
  const fx = p.lx * 20, fy = p.ly * 12;
  if (p.acc.includes('glasses')) {
    c.strokeStyle = BG; c.lineWidth = 4.5;
    for (const s of [-1, 1]) { c.beginPath(); c.arc(fx + s * 27, fy + 14, 18, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(fx + s * 45, fy + 10); c.lineTo(s * 77, 4); c.stroke(); }
    c.beginPath(); c.moveTo(fx - 9, fy + 12); c.quadraticCurveTo(fx, fy + 6, fx + 9, fy + 12); c.stroke();
  }
  if (p.acc.includes('shades')) {
    c.fillStyle = BG;
    for (const s of [-1, 1]) { rr(c, fx + s * 27 - 22, fy + 2, 44, 25, 10); c.fill(); c.strokeStyle = BG; c.lineWidth = 4; c.beginPath(); c.moveTo(fx + s * 47, fy + 8); c.lineTo(s * 77, 4); c.stroke(); }
    c.fillRect(fx - 8, fy + 6, 16, 5);
    c.strokeStyle = K.k7; c.lineWidth = 3; c.lineCap = 'round';
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(fx + s * 27 - 12, fy + 20); c.lineTo(fx + s * 27 - 2, fy + 8); c.stroke(); }
  }
  if (p.acc.includes('stache')) {                     // bigote
    const mx = fx * 0.9, my = fy + 38; c.fillStyle = K.k5;
    c.beginPath(); c.moveTo(mx, my - 4); c.bezierCurveTo(mx - 12, my - 12, mx - 30, my - 8, mx - 32, my + 6); c.bezierCurveTo(mx - 22, my + 2, mx - 10, my + 4, mx, my + 2);
    c.bezierCurveTo(mx + 10, my + 4, mx + 22, my + 2, mx + 32, my + 6); c.bezierCurveTo(mx + 30, my - 8, mx + 12, my - 12, mx, my - 4); c.fill();
  }
}
function npcPaint(c, p, g, C, detail, mid) {
  const arm = (S, A) => {
    if (detail) limb(c, [S[0], S[1], A.ex, A.ey, A.hx, A.hy], 47, C.hoodD);                 // filete oscuro: despega el brazo del torso
    limb(c, [S[0], S[1], A.ex, A.ey, A.hx, A.hy], 40, C.hood);
    c.fillStyle = C.skin; c.beginPath(); c.arc(A.hx, A.hy, 21, 0, TAU); c.fill();
  };
  const leg = (hx, L, fa) => {
    limb(c, [hx, g.H[1], L.ex, L.ey, L.hx, L.hy], 46, C.pants);
    c.save(); c.translate(L.hx, L.hy + 22); c.rotate(fa); rr(c, -26, -30, 74, 30, 13); c.fillStyle = C.shoe; c.fill();
    if (C.sole) { c.fillStyle = C.sole; c.fillRect(-22, -7, 66, 7); } c.restore();
  };
  if (p.behind.includes('L')) arm(g.SL, g.AL); if (p.behind.includes('R')) arm(g.SR, g.AR);
  leg(g.H[0] - NG.hipW, g.LL, p.aL); leg(g.H[0] + NG.hipW, g.LR, p.aR);
  // torso (buzo canguro)
  c.save(); c.translate(g.H[0], g.H[1]); c.rotate(p.lean);
  const T0 = NG.torso;
  c.beginPath(); c.moveTo(-56, 12); c.lineTo(56, 12); c.bezierCurveTo(63, -40, 72, -90, 70, -T0 + 36); c.bezierCurveTo(70, -T0 - 2, 44, -T0 - 9, 0, -T0 - 9);
  c.bezierCurveTo(-44, -T0 - 9, -70, -T0 - 2, -70, -T0 + 36); c.bezierCurveTo(-72, -90, -63, -40, -56, 12); c.closePath(); c.fillStyle = C.hood; c.fill();
  if (detail) {
    c.fillStyle = C.hoodS; rr(c, -56, -4, 112, 16, 7); c.fill();                           // elástico
    c.strokeStyle = C.hoodD; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-34, -24); c.lineTo(-24, -58); c.lineTo(24, -58); c.lineTo(34, -24); c.stroke();   // bolsillo canguro
    if (C.cords) { c.strokeStyle = C.cords; c.lineWidth = 4; c.beginPath(); c.moveTo(-11, -T0 + 2); c.lineTo(-13, -T0 + 38); c.moveTo(11, -T0 + 2); c.lineTo(13, -T0 + 34); c.stroke(); }   // cordones del buzo
  }
  c.fillStyle = C.hoodS; c.beginPath(); c.ellipse(0, -T0 - 2, 54, 26, 0, 0, TAU); c.fill();   // capucha
  c.restore();
  // cabeza
  c.save(); c.translate(g.HC[0], g.HC[1]); c.rotate(g.ha);
  const skull = p.skull > 0.5;
  if (!skull) { c.fillStyle = C.skinS; for (const s of [-1, 1]) { c.beginPath(); c.arc(s * 76 - p.lx * 7, 10, 13, 0, TAU); c.fill(); } }   // orejas
  rr(c, -78, -74, 156, 150, 64); c.fillStyle = C.skin; c.fill();
  headwear(c, p, C, detail);
  if (detail) { if (skull) skullFace(c, p); else npcFace(c, p); accessories(c, p); }
  c.restore();
  if (mid) mid(c, g, p);
  if (!p.behind.includes('L')) arm(g.SL, g.AL); if (!p.behind.includes('R')) arm(g.SR, g.AR);
}
/* Dibuja un personaje. mid(c, g, p) = lo que sostiene (entre el cuerpo y las manos); over(c, g, p) = por delante de todo. */
function npc(c, o, mid, over) {
  const p = Object.assign({}, POSE0, o), g = npcGeom(p), a0 = c.globalAlpha;
  const sx = p.s * (1 - p.sq * 0.55) * p.face, sy = p.s * (1 + p.sq);
  const C = Object.assign({}, NC, { cords: YEL }, p.hat !== YEL ? { hat: p.hat, sole: null, cords: K.k7 } : {}, p.pal || {}, p.skull > 0.5 ? { skin: '#D6D6DA', skinS: '#ADADB6' } : {});
  c.save(); c.translate(p.x, p.y); c.globalAlpha = a0 * p.a;
  if (p.rim) { c.save(); c.translate(-2.5 * p.s, -3 * p.s); c.scale(sx, sy); npcPaint(c, p, g, NRIM, false); c.restore(); }   // contraluz arriba a la izquierda
  c.scale(sx, sy);
  npcPaint(c, p, g, C, true, mid);
  if (over) over(c, g, p);
  c.restore(); c.globalAlpha = a0;
  return g;
}
const blinkAt = (t, seed = 0) => { const u = ((t + seed * 1.37) % 2.9) / 0.13; return u < 1 ? Math.sin(u * Math.PI) : 0; };   // parpadeo cada ~3 s
const breathe = (t, seed = 0) => Math.sin(t * 2.4 + seed) * 0.008;
/* caminata: pies que se alternan (para npc fL/fR) · ph = fase en pasos */
function walkFeet(ph, stride = 70, lift = 34) {
  const a = ph * Math.PI;
  return { fL: [-Math.cos(a) * stride / 2, -Math.max(0, Math.sin(a)) * lift], fR: [Math.cos(a) * stride / 2, -Math.max(0, -Math.sin(a)) * lift], bob: Math.abs(Math.sin(a)) * 6 };
}
function mark(c, ch, x, y, t, t0, dur = 0.8, size = 96) {   // «!», «?»
  const p = prog(t, t0, t0 + dur); if (p <= 0 || p >= 1) return;
  const s = E.outBack(prog(t, t0, t0 + 0.16), 3) * (1 - E.inCubic(prog(t, t0 + dur - 0.12, t0 + dur)));
  c.save(); c.translate(x, y - 10 * E.outCubic(p)); c.scale(s, s); c.font = FD(size); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.lineWidth = size * 0.15; c.lineJoin = 'round'; c.strokeStyle = BG; c.strokeText(ch, 0, 0); c.fillStyle = YEL; c.fillText(ch, 0, 0); c.restore();
}
function sparkle(c, x, y, r, a = 1) {                 // destello de cuatro puntas
  c.save(); c.globalAlpha *= a; c.fillStyle = YEL; c.beginPath();
  for (let i = 0; i < 8; i++) { const k = i % 2 ? r * 0.28 : r, an = i * Math.PI / 4; c.lineTo(x + Math.cos(an) * k, y + Math.sin(an) * k); }
  c.closePath(); c.fill(); c.restore();
}
function sweat(c, x, y, t, t0) {                      // gotas de esfuerzo
  for (let i = 0; i < 3; i++) { const u = ((t - t0) * 2.2 + i * 0.37) % 1; if (t < t0) return;
    c.save(); c.globalAlpha = 1 - u; c.fillStyle = '#D6D6DA'; c.translate(x + (i - 1) * 26 - u * 22 * (i - 1.4), y - Math.sin(u * Math.PI) * 34 + u * 30);
    c.beginPath(); c.moveTo(0, -9); c.quadraticCurveTo(8, 2, 0, 7); c.quadraticCurveTo(-8, 2, 0, -9); c.fill(); c.restore(); }
}
