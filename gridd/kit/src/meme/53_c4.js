/* ══════════════════════════════════════════════════════════════════════════════════════
   PERSONAJE 4 · EL QUE SE TIRA AL PISO POR UNA FOTO  (el car spotter de gorro amarillo)
   Se tira al piso frente al súper para el contrapicado · CLIC CLIC · uno le pasa por arriba
   como si nada · le cae un cono en la espalda · aparece el cartel: LOMO DE BURRO ·
   se levanta y muestra la foto: valió la pena.
   ══════════════════════════════════════════════════════════════════════════════════════ */
const C4 = { carTail: -380, sx: 640, lx: 916, ly: GYW - 70, coneX: 770, signX: 932 };
const R4 = { dive: [0.08, 0.42], clicks: [0.56, 0.74, 0.92, 1.95], walk: [0.85, 1.72], cone: 1.62, sign: 2.12 };   // [SFX] segundos desde T.g4
function c4body(t) {                                   // dónde está (pies), cuánto está girado y qué tan «acostado» está
  const u = t - T.g4;
  let k = E.inOutCubic(prog(u, R4.dive[0], R4.dive[1]));
  if (t >= T.p4) k = 1 - E.outBack(prog(t, T.p4, T.p4 + 0.3), 1.6);
  k = clamp(k, -0.08, 1.08);
  const hop = t >= T.p4 ? 120 * Math.sin(Math.PI * clamp(prog(t, T.p4, T.p4 + 0.3))) : 90 * Math.sin(Math.PI * clamp(k));
  return { x: lerp(C4.sx, C4.lx, clamp(k)), y: lerp(GYW, C4.ly, clamp(k)) - hop, th: -Math.PI / 2 * k, k };
}
function c4World(c, t) {
  const u = t - T.g4, B = c4body(t);
  ground(c, -800, 1600); spot(c, 160, GYW, 520, 0.9);
  drawCar(c, A.super, C4.carTail, GYW, {});
  // el cartel aparece detrás
  lomoSign(c, C4.signX, GYW, E.outBack(prog(u, R4.sign, R4.sign + 0.32), 1.8));
  // el fotógrafo
  const lying = clamp(B.k), cl = R4.clicks.some(q => u > q && u < q + 0.06);
  const p = Object.assign({ x: 0, y: 0, s: 1, face: -1, blink: blinkAt(t, 6), lx: 0.9, hlock: B.th, mouth: lying > 0.5 ? 'grit' : 'smile' }, CHARS[3].look);
  p.hL = mixP([70, -404], [-14, -452], lying); p.hR = mixP([40, -394], [14, -444], lying);
  if (t >= T.p4) { const sh = E.outCubic(prog(t, T.p4 + 0.32, T.p4 + 0.55)); p.mouth = 'big'; p.hL = mixP(p.hL, [-40, -470], sh); p.hR = mixP(p.hR, [60, -480], sh); p.lx = lerp(0.9, 0, sh); }
  const camRot = lerp(0, -Math.PI / 2, lying);
  spot(c, B.x - 200 * lying, GYW, 260);
  c.save(); c.translate(B.x, B.y + (cl ? 2 : 0)); c.rotate(B.th);
  npc(c, p, t < T.p4 + 0.32 ? (cc) => drawCameraSide(cc, lerp(66, 0, lying), lerp(-412, -470, lying), 0.9, camRot) : null);
  c.restore();
  if (lying > 0.9 && t < T.p4) for (const q of R4.clicks) { const d = u - q; if (d > 0 && d < 0.22) { sparkle(c, B.x - 520, B.y - 10, 60 * Math.sin(d / 0.22 * Math.PI)); } }
  boom(c, 'PUF', C4.lx - 210, GYW - 210, t, T.g4 + R4.dive[1], { size: 90, rot: -8, dur: 0.45, col: K.k9 });
  boom(c, 'CLIC', C4.lx - 560, GYW - 260, t, T.g4 + R4.clicks[0], { size: 84, rot: -10, dur: 0.3 });
  boom(c, 'CLIC', C4.lx - 600, GYW - 330, t, T.g4 + R4.clicks[1], { size: 84, rot: 8, dur: 0.3 });
  boom(c, 'CLIC', C4.lx - 560, GYW - 250, t, T.g4 + R4.clicks[3], { size: 84, rot: -6, dur: 0.3 });
  // el cono (le cae en la espalda; cuando se levanta, se cae)
  if (u >= R4.cone) {
    const d = u - R4.cone, land = 0.24, top = C4.ly - 72;
    let y = d < land ? lerp(GYW - 1100, top, E.inQuad(d / land)) : top - 40 * Math.abs(Math.sin((d - land) * 16)) * Math.exp(-(d - land) * 7), r = d < land ? 0.4 : 0.12;
    let x = C4.coneX;
    if (t >= T.p4) { const e = t - T.p4; x += 240 * e; y = Math.min(GYW, y - 300 * e + 2200 * e * e); r += e * 9; }
    drawCone(c, x, y, 1, r);
  }
  boom(c, 'TOC', C4.coneX + 60, C4.ly - 260, t, T.g4 + R4.cone + 0.24, { size: 90, rot: 8, dur: 0.4, col: K.k9 });
  // el que pasa caminando y le pasa por arriba
  const wk = prog(u, R4.walk[0], R4.walk[1]);
  if (wk > 0 && wk < 1) {
    const x = lerp(1280, -280, wk), over = x > 300 && x < 1000 && lying > 0.9, f = walkFeet((1280 - x) / 118, 118, over ? 165 : 34);
    npc(c, { x, y: GYW - f.bob, s: 1, face: -1, hat: K.k6, lx: 0.7, lid: 0.45, mouth: 'flat', fL: f.fL, fR: f.fR, blink: blinkAt(t, 8), kL: -1, kR: -1, lean: over ? -0.04 : 0.02 });
  }
}
function c4Screen(c, t) {
  if (t < T.p4) return;
  const k = E.outBack(prog(t, T.p4 + 0.35, T.p4 + 0.62), 1.5);
  photoCard(c, 492, 930, 0.84 * k, t);
  caption(c, t, T.p4 + 0.55, T.x4 + 0.05, '*TODO POR* EL ÁNGULO.', { dur: 0.45 });
}
