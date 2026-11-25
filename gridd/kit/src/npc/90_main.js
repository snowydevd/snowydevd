/* ══════════════════════════════════════════════════════════════════════════════════════
   RENDER: un frame = una función del tiempo
   ══════════════════════════════════════════════════════════════════════════════════════ */
function gridA(t) {                                   // cuánta grilla se ve en cada momento
  if (t < T.job1) return 1;
  if (t < T.goal) return 0.5;
  return gridA2(t);
}
function render(t, grainT = t) {
  const c = ctx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  c.fillStyle = BG; c.fillRect(0, 0, W, H);
  const cam = camera(t);
  c.save();
  worldGrid(c, cam, gridA(t));
  useCam(c, cam);
  if (t < T.job1 + 0.02) { c.save(); c.translate(whipOut(t, T.job1), 0); sceneVoid(c, t); c.restore(); }
  if (t >= T.job1 && t < T.buy) sceneJobs(c, t);
  renderB(c, t, cam);                                                     // escenas 3 a 6
  c.restore();
  // capa de pantalla: carteles, indicadores y subtítulos
  c.save(); c.setTransform(1, 0, 0, 1, cam.sx, cam.sy);
  if (t >= T.job1 - 0.15 && t < T.goal + 0.4) jobsOverlay(c, t);
  overlayB(c, t, cam);
  drawHud(c, t);
  drawSubs(c, t);
  c.restore();
  if (t < 0.6) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1 - E.outCubic(prog(t, 0.05, 0.6)); c.fillStyle = BG; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }   // entra desde negro
  post(c, t, grainT);
}

function buildCam() {                                 // claves de cámara (x, y = punto del mundo que queda en el centro; z = zoom)
  camKey(0, 540, 900, 0.46);                                              // plano general: un punto en la grilla vacía
  camKey(0.25, 540, 900, 0.46);
  camKey(T.q1 + 0.15, 540, 960, 1);                                       // se acerca para la pregunta
  camKey(T.fall, 540, 960, 1);
  camKey(TI, 566, 960, 1, E.inCubic);
  camKey(T.q2 + 0.4, 600, 990, 1.1);                                      // encuadra al NPC y la pala
  camKey(T.grab, 600, 990, 1.1);
  camKey(T.job1 - 0.05, 640, 1000, 1.16);
  shake(TI, 18);
  buildCamB();                                                            // de las changas en adelante
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   INICIO
   ══════════════════════════════════════════════════════════════════════════════════════ */
function init() {
  M.font = FD(200); const mh = M.measureText('H'); CAP = (mh.actualBoundingBoxAscent || 140) / 200;
  buildSubs();
  A.hatch = sprCar('hatch', 1.45);
  initB();
  buildCam(); buildPost();
}

/* ══════════════════════════════════════════════════════════════════════════════════════
   REPRODUCTOR
   ══════════════════════════════════════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const P = { t: 0, playing: false, start: 0, ended: false, hud: false, poster: false };
let peekTimer = 0, recorder = null, vozTimer = 0;
const PTR = { x: 0, y: 0, x0: 0, y0: 0, quiet: 0 };          // puntero: para que un temblor del mouse no destape los botones al grabar

/* Voz del narrador: un archivo de audio que arranca en el segundo 0. Puede venir incrustado (VOZ_SRC)
   o cargarse con el botón «Cargar voz». La animación manda: el audio se le sincroniza. */
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
function hud() {                                             // tecla B: en qué tramo estamos y qué dice el narrador
  if (!P.hud) return;
  const t = P.t; let sg = SEGS[0][0]; for (const s of SEGS) if (t >= T[s[0]]) sg = s[0];
  let line = '—'; for (const k in VO) if (t >= VO[k].t && t < VO[k].t + VO[k].d) line = VO[k].say;
  const el = $('hud'); el.classList.toggle('on', line !== '—');
  el.innerHTML = `<b>${t.toFixed(3).padStart(6, '0')} s</b> / ${DUR.toFixed(2)}  f ${String(Math.round(t * FPS)).padStart(4, '0')}\ntramo <b>${sg}</b>  (+${(t - T[sg]).toFixed(2)} s)\nvoz: ${line}`;
}
let lastKey = '';
function loop(now) {
  if (P.playing) {
    P.t = Math.max(0, (now - P.start) / 1000);
    if (AU.has && !AU.el.paused && Math.abs(AU.el.currentTime - P.t) > 0.12 && P.t > 0.3) { try { AU.el.currentTime = P.t; } catch (e) {} }   // si la voz se corre, se reengancha
    if (P.t >= DUR) { P.t = DUR; P.ended = true; setPlaying(false); vozStop(); if (recorder) setTimeout(() => recorder && recorder.state === 'recording' && recorder.stop(), 350); }
  }
  const gt = P.playing || P.ended ? now / 1000 : P.t;          // el grano sigue vivo sobre el último frame
  const key = P.t + '|' + Math.floor(gt * 30);
  if (key !== lastKey) { lastKey = key; render(P.t, gt); hud(); }   // en pausa no se redibuja; al terminar, sólo a 30 fps
  requestAnimationFrame(loop);
}

/* Grabación directa del lienzo: sale a 1080×1920 reales aunque la ventana sea más chica.
   Si hay voz cargada, se graba junto con la imagen. */
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
    a.href = URL.createObjectURL(blob); a.download = 'gridd-car-spotter.' + (mime.includes('mp4') ? 'mp4' : 'webm'); a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); vs.getTracks().forEach(tr => tr.stop()); recorder = null; $('recdot').hidden = true;
  };
  $('recdot').hidden = false; recorder.start(); play(0, 0.5);
}

function boot() {
  init();
  AU.el = $('voz');
  if (VOZ_SRC.length > 20) { AU.el.src = VOZ_SRC; AU.has = true; $('vozlabel').textContent = 'Cambiar voz'; }
  $('replay').addEventListener('click', () => play());
  $('rec').addEventListener('click', record);
  if (!cv.captureStream || !window.MediaRecorder) $('rec').hidden = true;
  $('vozbtn').addEventListener('click', () => $('vozfile').click());
  $('vozfile').addEventListener('change', e => {              // narración propia: se reproduce sincronizada desde el segundo 0
    const f = e.target.files && e.target.files[0]; if (!f) return;
    AU.el.src = URL.createObjectURL(f); AU.has = true; $('vozlabel').textContent = f.name.length > 22 ? f.name.slice(0, 20) + '…' : f.name; play();
  });
  // Mientras corre, los botones sólo vuelven si llevás el mouse a la franja de abajo (o tocás la pantalla):
  // así un movimiento mínimo al apretar Replay no los deja a la vista en la grabación.
  const peek = () => { document.body.classList.add('peek'); clearTimeout(peekTimer); peekTimer = setTimeout(() => document.body.classList.remove('peek'), 1400); };
  addEventListener('mousemove', e => {
    PTR.x = e.clientX; PTR.y = e.clientY;
    if (performance.now() < PTR.quiet && Math.hypot(PTR.x - PTR.x0, PTR.y - PTR.y0) < 60) return;
    if (e.clientY > innerHeight * 0.74) peek();
  });
  addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') peek(); });
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;          // no pisar atajos del navegador
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
  window.GRIDD = { ready: true, seek, play, pause, render, T, D, VO, DUR, FPS };
  const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;   // si el sistema pide menos movimiento, no arranca solo
  if (qs.has('t')) seek(parseFloat(qs.get('t')) || 0); else if (calm) { seek(DUR); P.ended = true; }
  else if (AU.has) {                                         // con voz: se prueba si el navegador deja sonar sin un clic; si no, espera en un cuadro de portada
    const vol = AU.el.volume; AU.el.volume = 0; let pr = null; try { pr = AU.el.play(); } catch (e) {}
    const go = ok => { AU.el.pause(); AU.el.volume = vol; try { AU.el.currentTime = 0; } catch (e) {} if (ok) play(0, 0.25); else { seek(T.q1 + 2.4); P.poster = true; $('replaylabel').textContent = 'Reproducir'; } };
    if (pr && pr.then) pr.then(() => go(true), () => go(false)); else go(false);
  } else play(0, 0.25);
  requestAnimationFrame(loop);
}
// las fuentes están declaradas al final del documento: se piden recién cuando el DOM está completo
const loadFonts = () => document.fonts && document.fonts.load
  ? Promise.race([Promise.all([document.fonts.load(FD(64), 'GRÍD¿?'), document.fonts.load(FU(32), 'gridd.app')]), new Promise(r => setTimeout(r, 2500))])
  : Promise.resolve();
const domReady = new Promise(r => document.readyState === 'loading' ? addEventListener('DOMContentLoaded', r, { once: true }) : r());
domReady.then(loadFonts).then(boot, boot);
