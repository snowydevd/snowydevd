// Recorre TODOS los frames: busca excepciones y mide el costo de render(t) por tramo (headless = raster por software).
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const html = process.argv[2];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text()); });
  await page.goto('file://' + path.resolve(html) + '?t=0&noui=1');
  await page.waitForFunction(() => window.GRIDD && window.GRIDD.ready === true);
  const res = await page.evaluate(async () => {
    const G = window.GRIDD, cv = document.getElementById('stage');
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true }); probe.canvas.width = probe.canvas.height = 1;
    const names = Object.keys(G.T).filter(k => k !== 'end').sort((a, b) => G.T[a] - G.T[b]);
    const out = {}, bad = []; let n = 0;
    const N = Math.round(G.DUR * 60);
    for (let i = 0; i <= N; i++) {
      const t = Math.min(G.DUR, i / 60); let sg = names[0]; for (const k of names) if (t >= G.T[k]) sg = k;
      const t0 = performance.now();
      try { G.render(t); } catch (e) { bad.push(t.toFixed(3) + ' ' + e.message); if (bad.length > 12) break; continue; }
      probe.drawImage(cv, 0, 0, 1, 1, 0, 0, 1, 1); probe.getImageData(0, 0, 1, 1);
      const d = performance.now() - t0; const o = out[sg] = out[sg] || { n: 0, tot: 0, mx: 0, at: 0 }; o.n++; o.tot += d; if (d > o.mx) { o.mx = d; o.at = t; } n++;
    }
    return { n, bad, out: Object.fromEntries(Object.entries(out).map(([k, o]) => [k, (o.tot / o.n).toFixed(1) + ' ms · máx ' + o.mx.toFixed(1) + ' @' + o.at.toFixed(2)])), dur: G.DUR, T: G.T };
  });
  console.log('frames', res.n, 'dur', res.dur.toFixed(2));
  console.log(JSON.stringify(res.out, null, 1));
  console.log('excepciones:', res.bad.length ? res.bad.join('\n') : 'ninguna');
  console.log('consola:', errs.length ? errs.slice(0, 10).join('\n') : 'limpia');
  console.log('T', JSON.stringify(Object.fromEntries(Object.entries(res.T).map(([k, v]) => [k, +v.toFixed(2)]))));
  await browser.close();
})();
