/* ══════════════════════════════════════════════════════════════════════════════════════
   PERSONAJE 1 · EL QUE ACELERA PARADO
   Tres acelerones cada vez más grandes (BRAP · BRAAAP · BRRRRAAAAP), llamarada, el auto se le
   apaga, le salta la alarma y no la puede apagar. El de al lado, con las manos en las orejas
   y sin gorro (se lo voló el escape), mira a cámara: «Siempre hay uno».
   ══════════════════════════════════════════════════════════════════════════════════════ */
CARDEF.rod = Object.assign({}, CARDEF.spider, { body: '#2B2B30', rimc: '#84848E', dark: false });   // descapotable oscuro
const C1 = { tail: 690, drvX: 294, drvY: GYW + 128, byX: 880, ex: 726 };
const R1 = { revs: [0.30, 0.75, 1.20], stall: 1.72, alarm: 1.98, clicks: [2.06, 2.20, 2.34] };   // [SFX] segundos desde T.g1
function c1bob(u) {                                    // cómo salta el auto con cada acelerón
  let b = 0; const amp = [5, 9, 18];
  R1.revs.forEach((r, k) => { if (u > r) b -= amp[k] * Math.exp(-(u - r) * 7) * Math.abs(Math.sin((u - r) * 24)); });
  if (u < R1.stall) b += 1.3 * Math.sin(u * 64);                                            // regulando
  else b -= 7 * Math.exp(-(u - R1.stall) * 9) * Math.abs(Math.sin((u - R1.stall) * 30));   // se ahoga
  return b;
}
const c1rev = u => R1.revs.reduce((m, r) => u > r ? Math.max(m, Math.exp(-(u - r) * 5)) : m, 0);
function c1World(c, t) {
  const u = t - T.g1, bob = c1bob(u), rev = c1rev(u);
  ground(c, -500, 1600); spot(c, 380, GYW, 560, 0.8); spot(c, C1.byX, GYW, 200);
  // humo de los acelerones (detrás de todo)
  c.fillStyle = K.k5;
  R1.revs.forEach((r, k) => { for (let i = 0; i < 6 + k * 3; i++) { const l = (u - r - i * 0.03) / 1.3; if (l <= 0 || l >= 1) continue;
    puff(c, C1.ex + l * (180 + k * 120) + i * 12, GYW - 50 - l * (160 + k * 60) - hash(i * 3.3 + k) * 50, 14 + l * (40 + k * 20), (1 - l) * 0.55); } });
  // el auto y el escape
  drawCar(c, A.rod, C1.tail, GYW, { flip: true, bob });
  c.fillStyle = K.k6; rr(c, C1.ex - 52, GYW - 52 + bob, 52, 15, 6); c.fill(); c.fillStyle = YEL; c.fillRect(C1.ex - 4, GYW - 52 + bob, 5, 15);
  R1.revs.forEach((r, k) => { const d = u - r, dur = [0.28, 0.32, 0.52][k]; if (d > 0 && d < dur) flame(c, C1.ex, GYW - 45 + bob, [56, 84, 112][k] * Math.sin(Math.PI * d / dur), [22, 32, 52][k], t, k); });
  // el conductor: asomado arriba de la puerta
  const p = Object.assign({ x: C1.drvX, y: C1.drvY + bob, s: 0.95, face: -1, rim: false, blink: blinkAt(t, 2) }, CHARS[0].look, { hL: [100, -330], hR: [92, -346] });
  if (u < R1.stall) { p.mouth = rev > 0.35 ? 'big' : 'smirk'; p.hdy = 12 * rev; p.lean = -0.07 * rev; }
  else { p.mouth = 'O'; p.lean = 0.04; p.browL = p.browR = 0.45; }
  let fobOn = false;
  if (u >= R1.alarm) { p.mouth = 'wavy'; p.hR = [64, -470]; fobOn = R1.clicks.some(k => u > k && u < k + 0.08); }
  c.save(); c.beginPath(); c.rect(-2000, -4000, 5000, GYW - 153 + bob + 4000); c.clip();
  npc(c, p, u >= R1.alarm ? (cc) => keyFob(cc, 64, -486, fobOn) : null);
  c.restore();
  steeringWheel(c, C1.drvX - 95, GYW - 185 + bob);
  if (u > R1.stall) sweat(c, C1.drvX - 60, GYW - 380 + bob, t, T.g1 + R1.stall + 0.1);
  // se ahoga: humo negro del capó
  c.fillStyle = K.k3;
  for (let i = 0; i < 8; i++) { const l = (u - R1.stall - i * 0.07) / 1.4; if (l <= 0 || l >= 1) continue; puff(c, 40 + Math.sin(i * 2.1 + l * 3) * 30, GYW - 150 - l * 300, 20 + l * 46, (1 - l) * 0.8); }
  // alarma: luces que titilan
  if (u >= R1.alarm && Math.floor((u - R1.alarm) * 5) % 2 === 0) {
    for (const [lx, ly] of [[-60, GYW - 95 + bob], [680, GYW - 118 + bob]]) { const g = c.createRadialGradient(lx, ly, 0, lx, ly, 90); g.addColorStop(0, yel(0.95)); g.addColorStop(1, yel(0)); c.fillStyle = g; c.beginPath(); c.arc(lx, ly, 90, 0, TAU); c.fill(); }
  }
  // el de al lado
  const b = { x: C1.byX, y: GYW, s: 1, face: -1, hat: K.k7, lx: 0.9, blink: blinkAt(t, 5), mouth: 'flat' };
  const fl = R1.revs.reduce((m, r, k) => u > r ? Math.max(m, Math.exp(-(u - r) * 6) * (k + 1)) : m, 0);
  b.lean = -0.06 * fl; b.x += 10 * fl; b.wide = Math.min(1, fl * 0.5);
  if (u > R1.revs[1] - 0.05) { const k = E.outCubic(prog(u, R1.revs[1] - 0.05, R1.revs[1] + 0.12)); b.hL = mixP([-76, -168], [-88, -404], k); b.hR = mixP([76, -168], [88, -404], k); b.mouth = 'grit'; b.browL = b.browR = -0.3; }
  if (u > R1.revs[2]) b.hw = 'none';                  // el gorro se lo voló el escape
  if (t >= T.p1) { const k = E.inOutCubic(prog(t, T.p1, T.p1 + 0.25)); b.lx = lerp(0.9, 0, k); b.lid = 0.62 * k; b.mouth = 'flat'; b.wide = 0; b.browL = b.browR = 0; b.blink = blinkAt(t + 0.9, 1); }
  spot(c, b.x, GYW, 200);
  npc(c, b);
  if (u > R1.revs[2]) {                                // el gorro volando
    const d = u - R1.revs[2], x = C1.byX + 30 + 420 * d, y = GYW - 470 - 900 * d + 1500 * d * d;
    if (y < GYW + 200) { c.save(); c.translate(x, y); c.rotate(d * 9); c.fillStyle = K.k7; c.beginPath(); c.moveTo(-80, -20); c.bezierCurveTo(-88, -108, 88, -108, 80, -20); c.closePath(); c.fill(); rr(c, -85, -40, 170, 32, 13); c.fill(); c.restore(); }
  }
  // onomatopeyas
  boom(c, 'BRAP', 800, GYW - 330, t, T.g1 + R1.revs[0], { size: 110, rot: -10, dur: 0.45 });
  boom(c, 'BRAAAP', 690, GYW - 450, t, T.g1 + R1.revs[1], { size: 150, rot: 8, dur: 0.5 });
  boom(c, 'BRRRRAAAAP', 440, GYW - 520, t, T.g1 + R1.revs[2], { size: 185, rot: -6, dur: 0.62, jit: 9 });
  boom(c, 'PLOF', 60, GYW - 300, t, T.g1 + R1.stall, { size: 96, rot: 6, dur: 0.5, col: K.k9 });
  if (u >= R1.alarm) for (let n = 0; n < 4; n++) boom(c, 'UIU', n % 2 ? 430 : 210, GYW - (n % 2 ? 470 : 440), t, T.g1 + R1.alarm + n * 0.24, { size: 92, rot: n % 2 ? 7 : -7, dur: 0.24, rise: 8 });
}
function c1Screen(c, t) {}
