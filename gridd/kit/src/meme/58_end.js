/* ══════════════════════════════════════════════════════════════════════════════════════
   CIERRE · el casillero «VOS» se desbloquea, crece y queda el wordmark:
   ENCONTRÁ TU PRÓXIMA JUNTADA · GR|DD · DESCARGÁ LA APP · gridd.app
   ══════════════════════════════════════════════════════════════════════════════════════ */
const CTA = { y: 960, h: 116, size: 90, txt: 'DESCARGÁ LA APP' }, URLT = 'gridd.app';
let WM = null;
const TE = () => ({ grow: T.fin + 0.62, tB: T.fin + 0.98, t0: T.fin + 1.28, tC: T.fin + 1.78, tU: T.fin + 2.2, tS: T.fin + 0.95 });   // [SFX] crece · barra · letras · placa · url
function endWindow(t) {
  const e = TE(); if (t < e.grow) return null;
  const k = E.inOutCubic(prog(t, e.grow, e.grow + 0.34));
  return { r: rectLerp(tileRect(5), FULL, k), s: lerp(0.36, 1, k), k };
}
function endCard(c, t) {
  const g = WM, base = 900, e = TE(), { tB, t0, tC, tU } = e;
  c.fillStyle = BG; c.fillRect(-W, -H, 3 * W, 3 * H);
  worldGrid(c, CAM0, 0.75); useScreen(c);
  // línea de arriba
  const sl = 'ENCONTRÁ TU PRÓXIMA JUNTADA';
  if (t >= e.tS) { c.font = FU(40); c.fillStyle = K.k8; c.textBaseline = 'alphabetic'; const n = Math.floor(prog(t, e.tS, e.tS + 0.4) * sl.length + 0.001); tracked(c, sl.slice(0, n), 540 - (tw(sl, FU(40)) + 4 * (sl.length - 1)) / 2, 612, 4); }
  const bh = E.outBack(prog(t, tB, tB + 0.34), 2), rel = t >= t0 ? Math.exp(-(t - t0) * 12) * Math.cos((t - t0) * 28) : 0;
  if (bh > 0) { c.fillStyle = YEL; const hh = g.barH * bh, ww = g.bw * (1 - 0.1 * rel); c.fillRect(540 - ww / 2, 780 - hh / 2, ww, hh); }
  if (t >= tB && t < tB + 0.6) { c.globalAlpha = 0.8 * Math.exp(-(t - tB) * 7); c.fillStyle = YEL; c.fillRect(540 - 1.5, 400, 3, 1200); c.globalAlpha = 1; }
  const travel = -g.inkL - g.bw / 2 + 40;
  const eIn = tt => E.outBack(prog(tt, t0, t0 + 0.38), 1.35), eOut = tt => E.outBack(prog(tt, t0, t0 + 0.38), 2.5);
  c.font = g.font; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = K.k9;
  const side = (sgn, tt, a) => { const dI = (1 - eIn(tt)) * travel, dO = (1 - eOut(tt)) * travel; c.globalAlpha = a;
    if (sgn < 0) { c.fillText('R', 540 + g.rX + dI, base); c.fillText('G', 540 + g.grX + dO, base); } else { c.fillText('D', 540 + g.ddX - dI, base); c.fillText('D', 540 + g.d2X - dO, base); } };
  if (t >= t0) for (const sgn of [-1, 1]) {
    c.save(); c.beginPath(); if (sgn < 0) c.rect(-300, 500, 540 - g.bw / 2 + 300, 600); else c.rect(540 + g.bw / 2, 500, 900, 600); c.clip();
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
