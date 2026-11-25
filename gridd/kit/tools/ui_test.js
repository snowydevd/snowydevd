// Prueba de la página: HUD, teclas, replay, «Cargar voz» (con una pista de bips en cada línea) y «Grabar video» con audio.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
function wavBeeps(times, dur, sr = 24000) {            // WAV mono 16 bit: un bip de 120 ms en cada tiempo
  const n = Math.round(dur * sr), pcm = Buffer.alloc(44 + n * 2);
  pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + n * 2, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22);
  pcm.writeUInt32LE(sr, 24); pcm.writeUInt32LE(sr * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(n * 2, 40);
  for (const t of times) for (let i = 0; i < 0.12 * sr; i++) { const k = Math.round(t * sr) + i; if (k < n) pcm.writeInt16LE(Math.round(Math.sin(i / sr * 2 * Math.PI * 880) * 14000 * Math.min(1, i / 200, (0.12 * sr - i) / 200)), 44 + k * 2); }
  return pcm;
}
(async () => {
  const html = process.argv[2], out = process.argv[3], doRec = process.argv[4] === 'rec';
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errs = [], reqs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message)); page.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  page.on('request', r => { if (!/^(file|blob|data):/.test(r.url())) reqs.push(r.url()); });
  await page.goto('file://' + path.resolve(html) + '?t=' + (process.env.TT || 20) + '&guides=1&hud=1');
  await page.waitForFunction(() => window.GRIDD && window.GRIDD.ready === true);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, 'ui_paused.png') });
  const R = {};
  R.hud = await page.locator('#hud').innerText();
  const subPx = () => page.evaluate(() => { const c = document.getElementById('stage'), x = document.createElement('canvas').getContext('2d'); x.canvas.width = 1080; x.canvas.height = 300; x.drawImage(c, 0, 300, 1080, 300, 0, 0, 1080, 300); const d = x.getImageData(0, 0, 1080, 300).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 150) n++; return n; });
  const a = await subPx(); await page.keyboard.press('s'); await page.waitForTimeout(150); const b = await subPx(); await page.keyboard.press('s'); await page.waitForTimeout(150); const c2 = await subPx();
  R.subs = { conSubs: a, sinSubs: b, deNuevo: c2 };
  await page.keyboard.down('Shift'); await page.keyboard.press('ArrowRight'); await page.keyboard.up('Shift');
  R.hudTras10 = (await page.locator('#hud').innerText()).split('\n')[0];
  await page.keyboard.press('g'); R.guiasOcultas = await page.locator('#guides').isHidden();
  await page.locator('#replay').click(); await page.waitForTimeout(1300);
  R.reproduciendo = await page.evaluate(() => ({ playing: document.body.classList.contains('playing'), uiOpacity: getComputedStyle(document.getElementById('ui')).opacity }));
  await page.screenshot({ path: path.join(out, 'ui_playing.png') });
  await page.keyboard.press(' '); R.pausado = await page.evaluate(() => !document.body.classList.contains('playing'));
  // voz: pista de bips, uno al arrancar cada línea del narrador
  const info = await page.evaluate(() => ({ dur: window.GRIDD.DUR, cues: Object.fromEntries(Object.entries(window.GRIDD.VO).map(([k, v]) => [k, v.t])) }));
  const wav = path.join(out, 'bips.wav'); fs.writeFileSync(wav, wavBeeps(Object.values(info.cues), info.dur));
  await page.setInputFiles('#vozfile', wav); await page.waitForTimeout(2500);
  R.voz = await page.evaluate(() => { const au = document.getElementById('voz'); return { label: document.getElementById('vozlabel').textContent, pausada: au.paused, tAudio: +au.currentTime.toFixed(2), hud: document.getElementById('hud').innerText.split('\n')[0] }; });
  await page.keyboard.press(' '); await page.waitForTimeout(200);
  R.vozEnPausa = await page.evaluate(() => document.getElementById('voz').paused);
  await page.setViewportSize({ width: 430, height: 932 }); await page.evaluate(() => window.GRIDD.seek(58.9)); await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(out, 'ui_mobile.png') });
  await page.setViewportSize({ width: 1440, height: 900 });
  if (doRec) {
    R.mimes = await page.evaluate(() => ['video/mp4;codecs=avc1.64002A,mp4a.40.2', 'video/mp4', 'video/webm;codecs=h264,opus', 'video/webm;codecs=vp9,opus', 'video/webm'].filter(m => MediaRecorder.isTypeSupported(m)));
    const t0 = Date.now();
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 150000 }), page.locator('#rec').click()]);
    R.archivo = path.join(out, dl.suggestedFilename()); await dl.saveAs(R.archivo); R.segundosGrabando = ((Date.now() - t0) / 1000).toFixed(1);
  }
  R.cues = info.cues; R.errs = errs; R.pedidosExternos = reqs;
  console.log(JSON.stringify(R, null, 1));
  await browser.close();
})();
