// Arranque con voz incrustada: sin permiso de autoplay espera en portada; con un clic arranca con audio.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const html = process.argv[2], out = process.argv[3];
  const R = {};
  for (const [name, args] of [['sinAutoplay', []], ['conAutoplay', ['--autoplay-policy=no-user-gesture-required']]]) {
    const browser = await chromium.launch({ args });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto('file://' + path.resolve(html)); await page.waitForFunction(() => window.GRIDD && window.GRIDD.ready === true); await page.waitForTimeout(1200);
    const st = () => page.evaluate(() => { const au = document.getElementById('voz'); return { playing: document.body.classList.contains('playing'), label: document.getElementById('replaylabel').textContent, vozLabel: document.getElementById('vozlabel').textContent, audioPaused: au.paused, tAudio: +au.currentTime.toFixed(2), vol: au.volume, dur: +au.duration.toFixed(2) }; });
    R[name] = { alAbrir: await st() };
    if (name === 'sinAutoplay') { await page.screenshot({ path: path.join(out, 'voz_portada.png') }); await page.locator('#replay').click(); await page.waitForTimeout(2600); R[name].trasClic = await st(); await page.keyboard.press(' '); await page.waitForTimeout(200); R[name].enPausa = await st(); }
    else { await page.waitForTimeout(1500); R[name].alRato = await st(); }
    R[name].errs = errs; await browser.close();
  }
  console.log(JSON.stringify(R, null, 1));
})();
