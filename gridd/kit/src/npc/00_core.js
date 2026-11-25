/* ══════════════════════════════════════════════════════════════════════════════════════
   1 · FORMATO
   ══════════════════════════════════════════════════════════════════════════════════════ */
const W = 1080, H = 1920, FPS = 60, DT = 1 / FPS;
const qs = new URLSearchParams(location.search);
/* Reels: nada importante en el 15% de arriba ni en el 20% de abajo (zona segura: y 288→1536).
   Tres franjas fijas: subtítulos del narrador (300→540) · escena (560→1300) · indicadores (1340→1500). */
const GC = 120, GO = 60;                             // grilla base de 120 px con origen en (60,60)
const GYW = 1180;                                    // piso del mundo: ahí pisan los personajes

//@@include _old_paleta_utils.txt
//@@include _old_beams.txt
//@@include _old_type.txt
