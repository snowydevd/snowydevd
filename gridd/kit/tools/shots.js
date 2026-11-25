// uso: node shots.js <html> <outdir> t1 t2 ...   (o "a:b:step")
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [html, outdir, ...specs] = process.argv.slice(2);
  let times = [];
  for (const s of specs) {
    if (s.includes(':')) { const [a, b, st] = s.split(':').map(Number); for (let t = a; t <= b + 1e-9; t += st) times.push(+t.toFixed(4)); }
    else times.push(Number(s));
  }
  fs.mkdirSync(outdir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text()); });
  await page.goto('file://' + path.resolve(html) + '?t=0&noui=1' + (process.env.Q ? '&' + process.env.Q : ''));
  await page.waitForFunction(() => window.GRIDD && window.GRIDD.ready === true, null, { timeout: 15000 });
  const t0 = Date.now();
  for (const t of times) {
    await page.evaluate(tt => window.GRIDD.seek(tt), t);
    await page.locator('#stage').screenshot({ path: path.join(outdir, `f_${t.toFixed(3).padStart(6, '0')}.png`) });
  }
  console.log(`${times.length} frames in ${Date.now() - t0} ms`);
  if (errs.length) console.log(errs.slice(0, 20).join('\n'));
  await browser.close();
})();
