/* ══════════════════════════════════════════════════════════════════════════════════════
   RENDER: un frame = una función del tiempo
   ══════════════════════════════════════════════════════════════════════════════════════ */
const SCENES = [
  { world: c1World, screen: c1Screen },
  { world: c2World, screen: c2Screen },
  { world: c3World, screen: c3Screen, top: c3Top },
  { world: c4World, screen: c4Screen },
  { world: c5World, screen: c5Screen },
];
function impactFx(c) {                                // «impact frame»: el cuadro se invierte en negro y amarillo
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'saturation'; c.fillStyle = '#808080'; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'difference'; c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'multiply'; c.fillStyle = YEL; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
  c.fillStyle = BG; for (let i = 0; i < 26; i++) { const a = hash(i * 7.3) * TAU, r0 = 330 + hash(i * 3.1) * 140; c.beginPath(); c.moveTo(540 + Math.cos(a) * r0, 960 + Math.sin(a) * r0); c.lineTo(540 + Math.cos(a + 0.03) * 1400, 960 + Math.sin(a + 0.03) * 1400); c.lineTo(540 + Math.cos(a - 0.03) * 1400, 960 + Math.sin(a - 0.03) * 1400); c.closePath(); c.fill(); }
}
function frameWin(c, r, k) {                          // marco amarillo del casillero mientras crece / se achica
  if (k >= 0.999) return;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1 - k; c.lineWidth = 10; c.strokeStyle = YEL; rr(c, r.x - 5, r.y - 5, r.w + 10, r.h + 10, lerp(22, 0, k)); c.stroke(); c.globalAlpha = 1;
}
function inWindow(c, win, fn) {                        // dibuja una escena entera dentro de un rectángulo de pantalla
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); rr(c, win.r.x, win.r.y, win.r.w, win.r.h, lerp(18, 0, win.k)); c.clip();
  VIEW.s = win.s; VIEW.ox = win.r.x + win.r.w / 2 - win.s * W / 2; VIEW.oy = win.r.y + win.r.h / 2 - win.s * H / 2;
  fn();
  c.restore(); VIEW.s = 1; VIEW.ox = 0; VIEW.oy = 0;
}
function render(t, grainT = t) {
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  c.fillStyle = BG; c.fillRect(0, 0, W, H);
  const sc = sceneOf(t), win = sc >= 0 ? sceneWindow(t, sc) : null, ew = endWindow(t);
  if (!(win && win.k >= 0.999) && !(ew && ew.k >= 0.999)) {          // la grilla de selección (cuando no la tapa una escena)
    worldGrid(c, CAM0, 1); c.setTransform(1, 0, 0, 1, 0, 0);
    drawSelect(c, t, win ? sc : -1);
  }
  if (win) {
    inWindow(c, win, () => {
      const cam = camera(t);
      c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = BG; c.fillRect(0, 0, W, H);
      worldGrid(c, cam, 0.5);
      useCam(c, cam); SCENES[sc].world(c, t, cam);
      useScreen(c, cam); SCENES[sc].screen(c, t, cam);
      useScreen(c); fighterCard(c, sc, t);
      if (SCENES[sc].top) { useScreen(c); SCENES[sc].top(c, t); }
    });
    frameWin(c, win.r, win.k);
  }
  if (ew) { inWindow(c, ew, () => { useScreen(c); endCard(c, t); }); frameWin(c, ew.r, ew.k); }
  c.setTransform(1, 0, 0, 1, 0, 0); drawSubs(c, t);
  if (impactAt(t)) impactFx(c);
  if (t < 0.35) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1 - E.outCubic(prog(t, 0.0, 0.35)); c.fillStyle = BG; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }   // entra desde negro
  post(c, t, grainT);
}

function buildCam() {                                 // claves de cámara de cada escena (x, y = punto del mundo al centro; z = zoom)
  camKey(0, 540, 960, 1);
  // 1 · acelerador
  camKey(T.s1, 462, 840, 1, CUT); camKey(T.p1 - 0.001, 470, 842, 1.02);
  camKey(T.p1, 880, 800, 1.95, CUT); camKey(T.x1, 880, 796, 2.1, E.outCubic);          // [VO] «siempre hay uno»: zoom dramático a la cara
  // 2 · el auto de la vieja
  camKey(T.s2, 560, 820, 0.95, CUT); camKey(T.g2 + R2.ring, 610, 820, 1.02, E.inOutCubic); camKey(T.g2 + R2.frz[1], 610, 820, 1.02); camKey(T.g2 + R2.answer + 0.15, 640, 800, 1.12, E.outExpo);
  camKey(T.g2 + R2.go, 640, 800, 1.12); camKey(T.g2 + R2.go + 0.3, 560, 820, 0.95, E.outCubic); camKey(T.x2, 560, 820, 0.95);
  // 3 · el que explica
  camKey(T.s3, 540, 769, 0.9, CUT); camKey(T.p3, 552, 772, 0.92); camKey(T.q3, 560, 769, 0.95, CUT); camKey(T.x3, 566, 769, 0.97);
  // 4 · fotógrafo
  camKey(T.s4, 540, 840, 1, CUT); camKey(T.g4 + R4.dive[1], 540, 840, 1); camKey(T.g4 + R4.dive[1] + 0.02, 560, 880, 1.06, E.outExpo); camKey(T.p4, 540, 850, 1.02); camKey(T.x4, 540, 850, 1.02);
  // 5 · llega tarde
  camKey(T.s5, 540, 840, 1, CUT); camKey(T.p5, 520, 840, 1); camKey(T.p5 + 0.22, 480, 800, 1.32, E.outExpo); camKey(T.q5, 490, 800, 1.36); camKey(T.x5, 500, 820, 1.2);
  camKey(DUR + 1, 540, 960, 1);
  // sacudidas, destellos e «impact frames»  [SFX]
  R1.revs.forEach((r, k) => shake(T.g1 + r, [6, 11, 26][k])); shake(T.g1 + R1.stall, 6); impact(T.g1 + R1.revs[2], 0.05); flash(T.g1 + R1.revs[2], 18, 0.35);
  shake(T.g2 + R2.ring, 8); shake(T.g2 + R2.go, 10); shake(T.p2 + 0.75, 14); impact(T.p2 + 0.75, 0.04);
  shake(T.g4 + R4.dive[1], 12); shake(T.g4 + R4.cone + 0.24, 9); shake(T.g4 + R4.sign, 6); flash(T.p4 + 0.35, 14, 0.5);
  for (const q of R4.clicks) flash(T.g4 + q, 26, 0.18);
  shake(T.lock + 0.3, 10); impact(T.lock + 0.3, 0.04); flash(T.fin + 0.25, 10, 0.55); shake(TE().t0, 7);
  for (let i = 0; i < 5; i++) flash(T[SCN[i]] + 0.16, 16, 0.22);          // [SFX] «¡seleccionado!»
}

/* Momentos internos de cada escena, para sincronizar el audio (tools/export_events.js los guarda en vo_meme/eventos.json) */
function soundCues() {
  const steps = (u0, u1, xAt, stride) => { const out = []; let last = -1; for (let i = 0; i <= 600; i++) { const u = u0 + (u1 - u0) * i / 600, ph = Math.floor(xAt(u) / stride); if (ph !== last) { out.push(+u.toFixed(3)); last = ph; } } return out; };
  return { R1, R2, R4, R5, HOPS, TE: TE(),
    steps4: steps(R4.walk[0], R4.walk[1], u => 1280 - lerp(1280, -280, (u - R4.walk[0]) / (R4.walk[1] - R4.walk[0])), 118),
    steps5: steps(0, R5.walk[1], u => lerp(-180, C5.stop, E.outCubic(u / R5.walk[1])) + 180, 96) };
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   INICIO
   ══════════════════════════════════════════════════════════════════════════════════════ */
function init() {
  M.font = FD(200); const mh = M.measureText('H'); CAP = (mh.actualBoundingBoxAscent || 140) / 200;
  buildSubs();
  A.rod = sprCar('rod', 1.2); A.mom = sprCar('mom', 1.25); A.gt = sprCar('gt', 1.25); A.super = sprCar('super', 1.15);
  A.wmTile = wmGeom(86); A.wmIcon = wmGeom(40);
  WM = wmGeom(240 / CAP); let fs = 100; while (tw(CTA.txt, FD(fs)) > (WM.inkR - WM.inkL) - 84) fs--; CTA.size = fs;
  buildCam(); buildPost();
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   REPRODUCTOR
   ══════════════════════════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const P = { t: 0, playing: false, start: 0, ended: false, hud: false, poster: false };
let peekTimer = 0, recorder = null, vozTimer = 0;
const PTR = { x: 0, y: 0, x0: 0, y0: 0, quiet: 0 };          // puntero: para que un temblor del mouse no destape los botones al grabar

/* Audio (voz del locutor, efectos y música en una sola pista que arranca en el segundo 0). Puede venir incrustado
   (VOZ_SRC) o cargarse con el botón «Cargar audio». La animación manda: el audio se le sincroniza. */
const VOZ_SRC = '/*__VOZ__*/';
const AU = { el: null, has: false };
function vozPlay(from, delay = 0) {
  clearTimeout(vozTimer); if (!AU.has) return;
  AU.el.pause();
  vozTimer = setTimeout(() => { try { AU.el.currentTime = Math.max(0, from); const pr = AU.el.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) {} }, delay * 1000);
}
function vozStop() { clearTimeout(vozTimer); if (AU.has) AU.el.pause(); }

function setPlaying(v) { P.playing = v; document.body.classList.toggle('playing', v); }
function play(from = 0, preroll = 0.35) {                   // preroll: un instante de negro para arrancar la grabación limpio
  P.poster = false; $('replaylabel').textContent = 'Replay';
  P.ended = false; P.t = from; P.start = performance.now() + preroll * 1000 - from * 1000; setPlaying(true); document.body.classList.remove('peek');
  PTR.x0 = PTR.x; PTR.y0 = PTR.y; PTR.quiet = performance.now() + 1500;
  vozPlay(from, preroll);
}
function pause() {
  if (P.poster) return play();                              // en la portada, Espacio arranca desde el principio
  if (P.playing) { setPlaying(false); vozStop(); }
  else if (!P.ended) { P.start = performance.now() - P.t * 1000; setPlaying(true); vozPlay(P.t); }
  else play();
}
function seek(t) { setPlaying(false); vozStop(); P.ended = false; P.poster = false; P.t = clamp(t, 0, DUR); if (AU.has) { try { AU.el.currentTime = P.t; } catch (e) {} } render(P.t); hud(); }
function hud() {                                             // tecla B: en qué tramo estamos y qué dice el locutor
  if (!P.hud) return;
  const t = P.t; let sg = SEGS[0][0]; for (const s of SEGS) if (t >= T[s[0]]) sg = s[0];
  let line = '—'; for (const k in VO) if (t >= VO[k].t && t < VO[k].t + VO[k].d) line = VO[k].say;
  const el = $('hud'); el.classList.toggle('on', line !== '—');
  el.innerHTML = `<b>${t.toFixed(3).padStart(6, '0')} s</b> / ${DUR.toFixed(2)}  f ${String(Math.round(t * FPS)).padStart(4, '0')}\ntramo <b>${sg}</b>  (+${(t - T[sg]).toFixed(2)} s)\nlocutor: ${line}`;
}
let lastKey = '';
function loop(now) {
  if (P.playing) {
    P.t = Math.max(0, (now - P.start) / 1000);
    if (AU.has && !AU.el.paused && Math.abs(AU.el.currentTime - P.t) > 0.12 && P.t > 0.3) { try { AU.el.currentTime = P.t; } catch (e) {} }   // si el audio se corre, se reengancha
    if (P.t >= DUR) { P.t = DUR; P.ended = true; setPlaying(false); vozStop(); if (recorder) setTimeout(() => recorder && recorder.state === 'recording' && recorder.stop(), 350); }
  }
  const gt = P.playing || P.ended ? now / 1000 : P.t;          // el grano sigue vivo sobre el último frame
  const key = P.t + '|' + Math.floor(gt * 30);
  if (key !== lastKey) { lastKey = key; render(P.t, gt); hud(); }
  requestAnimationFrame(loop);
}

/* Grabación directa del lienzo: sale a 1080×1920 reales aunque la ventana sea más chica (con el audio, si hay). */
let ac = null, acDest = null;
function vozTracks() {
  if (!AU.has) return [];
  try {
    if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); const src = ac.createMediaElementSource(AU.el); acDest = ac.createMediaStreamDestination(); src.connect(acDest); src.connect(ac.destination); }
    if (ac.state === 'suspended') ac.resume();
    return acDest.stream.getAudioTracks();
  } catch (e) { return []; }
}
function record() {
  if (recorder || !cv.captureStream || !window.MediaRecorder) return;
  const au = vozTracks();
  const kinds = au.length ? ['video/mp4;codecs=avc1.64002A,mp4a.40.2', 'video/mp4', 'video/webm;codecs=h264,opus', 'video/webm;codecs=vp9,opus', 'video/webm']
                          : ['video/mp4;codecs=avc1.64002A', 'video/mp4', 'video/webm;codecs=h264', 'video/webm;codecs=vp9', 'video/webm'];
  const mime = kinds.find(m => MediaRecorder.isTypeSupported(m)); if (!mime) return;
  const chunks = [], vs = cv.captureStream(FPS), stream = new MediaStream([...vs.getVideoTracks(), ...au]);
  recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 24e6, audioBitsPerSecond: 192e3 });
  recorder.ondataavailable = e => e.data.size && chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mime.split(';')[0] }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'gridd-elegi-tu-personaje.' + (mime.includes('mp4') ? 'mp4' : 'webm'); a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); vs.getTracks().forEach(tr => tr.stop()); recorder = null; $('recdot').hidden = true;
  };
  $('recdot').hidden = false; recorder.start(); play(0, 0.5);
}

function boot() {
  init();
  AU.el = $('voz');
  if (VOZ_SRC.length > 20) { AU.el.src = VOZ_SRC; AU.has = true; $('vozlabel').textContent = 'Cambiar audio'; }
  $('replay').addEventListener('click', () => play());
  $('rec').addEventListener('click', record);
  if (!cv.captureStream || !window.MediaRecorder) $('rec').hidden = true;
  $('vozbtn').addEventListener('click', () => $('vozfile').click());
  $('vozfile').addEventListener('change', e => {              // pista propia (voz, efectos y/o música): se reproduce sincronizada desde el segundo 0
    const f = e.target.files && e.target.files[0]; if (!f) return;
    AU.el.src = URL.createObjectURL(f); AU.has = true; $('vozlabel').textContent = f.name.length > 22 ? f.name.slice(0, 20) + '…' : f.name; play();
  });
  const peek = () => { document.body.classList.add('peek'); clearTimeout(peekTimer); peekTimer = setTimeout(() => document.body.classList.remove('peek'), 1400); };
  addEventListener('mousemove', e => {
    PTR.x = e.clientX; PTR.y = e.clientY;
    if (performance.now() < PTR.quiet && Math.hypot(PTR.x - PTR.x0, PTR.y - PTR.y0) < 60) return;
    if (e.clientY > innerHeight * 0.74) peek();
  });
  addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') peek(); });
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'r') play();
    else if (k === ' ') { e.preventDefault(); pause(); }
    else if (k === 'arrowright' || k === 'arrowleft') { e.preventDefault(); seek(Math.round(P.t * FPS + (k === 'arrowright' ? 1 : -1) * (e.shiftKey ? 10 : 1)) / FPS); }
    else if (k === 's') { SUBS.on = !SUBS.on; lastKey = ''; if (!P.playing) render(P.t); }
    else if (k === 'g') $('guides').hidden = !$('guides').hidden;
    else if (k === 'b') { P.hud = !P.hud; $('hud').hidden = !P.hud; hud(); }
    else if (k === 'h') document.body.classList.toggle('noui');
    else if (k === 'f') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
  });
  if (qs.has('guides')) $('guides').hidden = false;
  if (qs.has('hud')) { P.hud = true; $('hud').hidden = false; }
  if (qs.has('noui')) document.body.classList.add('noui');
  window.GRIDD = { ready: true, seek, play, pause, render, T, D, VO, DUR, FPS, X: soundCues() };
  const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (qs.has('t')) seek(parseFloat(qs.get('t')) || 0);
  else if (calm) { seek(DUR); P.ended = true; }
  else if (AU.has) {                                         // con audio: si el navegador no deja sonar sin un clic, espera en la portada
    const vol = AU.el.volume; AU.el.volume = 0; let pr = null; try { pr = AU.el.play(); } catch (e) {}
    const go = ok => { AU.el.pause(); AU.el.volume = vol; try { AU.el.currentTime = 0; } catch (e) {} if (ok) play(0, 0.25); else { seek(T.intro + 2.0); P.poster = true; $('replaylabel').textContent = 'Reproducir'; } };
    if (pr && pr.then) pr.then(() => go(true), () => go(false)); else go(false);
  } else play(0, 0.25);
  requestAnimationFrame(loop);
}
const loadFonts = () => document.fonts && document.fonts.load
  ? Promise.race([Promise.all([document.fonts.load(FD(64), 'GRÍD¿?'), document.fonts.load(FU(32), 'gridd.app')]), new Promise(r => setTimeout(r, 2500))])
  : Promise.resolve();
const domReady = new Promise(r => document.readyState === 'loading' ? addEventListener('DOMContentLoaded', r, { once: true }) : r());
domReady.then(loadFonts).then(boot, boot);
