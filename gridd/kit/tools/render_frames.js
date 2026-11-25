// Render offline, cuadro a cuadro (determinístico): node render_frames.js <html> <outdir> [workers=4] [from=0] [to=1320]
// Cada worker es un Chromium headless que pide GRIDD.seek(i/60) y guarda el PNG del canvas.
// Retoma lo que ya esté en disco y, si una captura se cuelga, reabre el navegador y reintenta.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [html, outdir, nw = '4', from = '0', to = '1320'] = process.argv.slice(2);
  const N = +nw, A = +from, B = +to;
  fs.mkdirSync(outdir, { recursive: true });
  const t0 = Date.now(); let done = 0;
  const open = async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.log('PAGEERROR', e.message));
    await page.goto('file://' + path.resolve(html) + '?t=0&noui=1');
    await page.waitForFunction(() => window.GRIDD && window.GRIDD.ready === true, null, { timeout: 30000 });
    return { browser, page };
  };
  await Promise.all(Array.from({ length: N }, async (_, w) => {
    let s = await open();
    for (let i = A + w; i < B; i += N) {
      const file = path.join(outdir, 'f_' + String(i).padStart(5, '0') + '.png');
      if (fs.existsSync(file) && fs.statSync(file).size > 1000) { done++; continue; }
      for (let attempt = 1; ; attempt++) {
        try {
          await s.page.evaluate(t => window.GRIDD.seek(t), i / 60);
          await s.page.screenshot({ path: file + '.tmp', type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 }, timeout: 25000 });
          fs.renameSync(file + '.tmp', file); break;
        } catch (e) {
          console.log('reintento', attempt, 'frame', i, String(e.message).split('\n')[0]);
          if (attempt >= 5) throw e;
          try { await s.browser.close(); } catch (_) {}
          s = await open();
        }
      }
      if (++done % 200 === 0) console.log(done, 'frames', ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
    await s.browser.close();
  }));
  console.log('listo:', done, 'frames en', ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
