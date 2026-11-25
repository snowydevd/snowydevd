// Guarda los tiempos de la animación para sincronizar el audio: node export_events.js <html> <salida.json>
// Lee window.GRIDD (T = inicio de cada tramo, D = duración, DUR = total, X = momentos internos que expone la página).
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const [html, out] = process.argv.slice(2);
  const browser = await chromium.launch(); const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('file://' + path.resolve(html) + '?t=0&noui=1');
  await page.waitForFunction(() => window.GRIDD && window.GRIDD.ready === true);
  const r = await page.evaluate(() => ({ T: GRIDD.T, D: GRIDD.D, DUR: GRIDD.DUR, X: GRIDD.X || {} }));
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true }); fs.writeFileSync(out, JSON.stringify(r));
  console.log(out, 'DUR', r.DUR.toFixed(2), 'errores', errs.length); await browser.close();
})();
