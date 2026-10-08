// Temporizadores: descanso (cuenta atrás), ejercicio (cronómetro con objetivo opcional) e intervalos de cardio.
// Se basan en marcas de tiempo, así que siguen siendo exactos si la pantalla se bloquea.
let audio = null;
let wakeLock = null;
let tickId = null;
let cur = null; // { mode: 'rest'|'work', start, end?, total?, target?, onDone, onStop, label, beeped }
let el = null;
let miniPref = true; // el temporizador sale plegado; si lo despliegas, se queda desplegado hasta recargar
export let soundOn = true;
export const setSound = (v) => (soundOn = v);

// ---------- sonidos de alarma (sintetizados, sin archivos) ----------
export const ALARMS = [
  { id: "pitidos", nombre: "Pitidos" },
  { id: "campana", nombre: "Campana" },
  { id: "digital", nombre: "Reloj digital" },
  { id: "silbato", nombre: "Silbato" },
  { id: "gong", nombre: "Gong" },
  { id: "sirena", nombre: "Sirena" },
];
let cfg = { tipo: "pitidos", vol: 80, fondo: true };
export function configure(c = {}) { cfg = { ...cfg, ...c }; cache.clear(); }
export const config = () => cfg;

const TAU = Math.PI * 2;
const att = (t, a) => (t < a ? t / a : 1);
// Cada sonido: duración de un toque (len), separación entre toques (step) y la onda en el instante t.
const VOICES = {
  pitidos: { len: 0.22, step: 0.28, wave: (t, acc, sr) => att(t, 0.02) * Math.exp(-Math.max(0, t - 0.02) * 9) * tone(acc ? 1320 : 880, t, sr) },
  campana: { len: 1.5, step: 0.75, wave: (t, acc, sr) => { const f = acc ? 1047 : 880; return att(t, 0.004) * (tone(f, t, sr) * Math.exp(-t * 2.5) + 0.5 * tone(f * 2.76, t, sr) * Math.exp(-t * 5) + 0.25 * tone(f * 5.4, t, sr) * Math.exp(-t * 8)) / 1.4; } },
  digital: { len: 0.46, step: 0.7, wave: (t, acc, sr) => (Math.floor(t / 0.12) < 4 && t % 0.12 < 0.07 ? 1 : 0) * (tone(acc ? 2093 : 1568, t, sr) + tone((acc ? 2093 : 1568) * 3, t, sr) / 3) * 0.8 },
  silbato: { len: 0.45, step: 0.55, wave: (t) => att(t, 0.01) * Math.min(1, (0.45 - t) / 0.05) * Math.sin(TAU * (2400 * t - (130 / (TAU * 28)) * Math.cos(TAU * 28 * t))) },
  gong: { len: 2.2, step: 1.1, wave: (t, acc, sr) => { const f = acc ? 262 : 196; return att(t, 0.01) * (tone(f, t, sr) * Math.exp(-t * 1.4) + 0.6 * tone(f * 2.1, t, sr) * Math.exp(-t * 2.2) + 0.35 * tone(f * 3.03, t, sr) * Math.exp(-t * 3) + 0.2 * tone(f * 4.2, t, sr) * Math.exp(-t * 4)) / 1.6; } },
  sirena: { len: 0.9, step: 0.9, wave: (t) => att(t, 0.02) * Math.min(1, (0.9 - t) / 0.03) * Math.sin(TAU * (600 * t + (900 * 0.9 / Math.PI) * (1 - Math.cos((Math.PI * t) / 0.9)))) },
};
// tono puro; se omite si la frecuencia no cabe en la frecuencia de muestreo
const tone = (f, t, sr) => (f < sr * 0.45 ? Math.sin(TAU * f * t) : 0);

// Genera n toques del sonido elegido (el último, más agudo) a la frecuencia de muestreo sr.
function synth(n, sr, tipo = cfg.tipo, vol = cfg.vol) {
  const v = VOICES[tipo] || VOICES.pitidos;
  const out = new Float32Array(Math.ceil(((n - 1) * v.step + v.len) * sr));
  const amp = 0.9 * Math.pow(Math.max(0, Math.min(100, vol)) / 100, 1.5);
  const len = Math.floor(v.len * sr);
  for (let i = 0; i < n; i++) {
    const off = Math.round(i * v.step * sr), acc = i === n - 1 && n > 1;
    for (let k = 0; k < len && off + k < out.length; k++) out[off + k] += amp * v.wave(k / sr, acc, sr);
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.max(-1, Math.min(1, out[i]));
  return out;
}

export function unlockAudio() {
  if (audio && audio.state !== "closed") { if (audio.state !== "running") audio.resume?.().catch(() => {}); return; }
  try {
    audio = new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    g.gain.value = 0; o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + 0.01);
  } catch {}
}
// iOS suspende o interrumpe el audio a menudo: cada toque en la pantalla lo reactiva.
document.addEventListener("pointerdown", () => { if (audio && audio.state !== "running" && audio.state !== "closed") audio.resume?.().catch(() => {}); }, true);

const cache = new Map();
function play(n, tipo, vol) {
  if (!audio) return;
  const go = () => {
    try {
      const key = `${n}|${tipo ?? cfg.tipo}|${vol ?? cfg.vol}`;
      let buf = cache.get(key);
      if (!buf) {
        const data = synth(n, audio.sampleRate, tipo, vol);
        buf = audio.createBuffer(1, data.length, audio.sampleRate);
        buf.getChannelData(0).set(data);
        if (tipo === undefined) cache.set(key, buf);
      }
      const src = audio.createBufferSource();
      src.buffer = buf; src.connect(audio.destination); src.start();
    } catch {}
  };
  if (audio.state === "running") go();
  else audio.resume?.().then(go, go);
}
export function beep(times = 3) {
  try { navigator.vibrate?.([200, 100, 200, 100, 200]); } catch {}
  if (!soundOn) return;
  unlockAudio();
  play(times);
}
// Botón «Probar» de Ajustes
export function preview(tipo, vol) { unlockAudio(); play(3, tipo, vol); }

// ---------- alarma en segundo plano ----------
// iOS congela la página al cambiar de app, así que la alarma no puede dispararse desde JavaScript.
// En su lugar, al empezar la cuenta atrás se reproduce una pista de audio con silencio y la alarma al final:
// el sistema la sigue reproduciendo aunque la app esté en segundo plano o la pantalla bloqueada.
let bgEl = null, bgUrl = null, bgFor = null;
const BG_MAX = 20 * 60; // segundos
function wav(silence, alarm, sr) {
  const ns = Math.round(silence * sr), n = ns + alarm.length;
  const buf = new ArrayBuffer(44 + n), d = new DataView(buf), b = new Uint8Array(buf);
  const str = (o, s) => [...s].forEach((c, i) => d.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF"); d.setUint32(4, 36 + n, true); str(8, "WAVE"); str(12, "fmt ");
  d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true); d.setUint32(24, sr, true); d.setUint32(28, sr, true); d.setUint16(32, 1, true); d.setUint16(34, 8, true);
  str(36, "data"); d.setUint32(40, n, true);
  b.fill(128, 44, 44 + ns);
  for (let i = 0; i < alarm.length; i++) b[44 + ns + i] = Math.round(128 + alarm[i] * 127);
  return new Blob([buf], { type: "audio/wav" });
}
function stopBg() {
  if (bgEl) { bgEl.pause(); bgEl.removeAttribute("src"); try { bgEl.load(); } catch {} }
  if (bgUrl) URL.revokeObjectURL(bgUrl);
  bgUrl = null; bgFor = null;
  try { if ("mediaSession" in navigator) navigator.mediaSession.metadata = null; } catch {}
}
function scheduleBg(seconds) {
  stopBg();
  if (!soundOn || !cfg.fondo || !(seconds > 0) || seconds > BG_MAX) return;
  try {
    const sr = seconds > 300 ? 8000 : 11025;
    bgUrl = URL.createObjectURL(wav(seconds, synth(3, sr), sr));
    bgEl ||= Object.assign(new Audio(), { preload: "auto" });
    bgEl.setAttribute("playsinline", "");
    bgEl.src = bgUrl;
    const mine = (bgFor = cur);
    bgEl.play().catch(() => { if (bgFor === mine) stopBg(); }); // sin gesto del usuario iOS no deja reproducir: suena en primer plano
    if ("mediaSession" in navigator && window.MediaMetadata) {
      const fin = new Date(Date.now() + seconds * 1000).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      navigator.mediaSession.metadata = new MediaMetadata({ title: `${cur.label} · suena a las ${fin}`, artist: "Gym App", artwork: [{ src: "icons/icon-512.png", sizes: "512x512", type: "image/png" }] });
    }
  } catch { stopBg(); }
}
// ¿La pista ya se encarga (o se encargó) de la alarma de este temporizador?
const bgCovers = () => bgEl && bgFor === cur && (bgEl.ended || (!bgEl.paused && bgEl.currentTime > 0));
function alarm(times) { if (bgCovers()) { try { navigator.vibrate?.([200, 100, 200]); } catch {} return; } beep(times); }

async function lockScreen() {
  try { if ("wakeLock" in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release", () => (wakeLock = null)); } } catch {}
}
export function releaseScreen() { try { wakeLock?.release(); } catch {} wakeLock = null; }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && cur) lockScreen(); });

const mmss = (s) => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
export { mmss };

function ensureEl() {
  if (el) return el;
  el = document.createElement("div");
  el.className = "timer-sheet";
  el.setAttribute("role", "timer");
  el.innerHTML = `
    <div class="timer-label"></div>
    <div class="timer-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="ring-bg"/><circle cx="60" cy="60" r="52" class="ring-fg" pathLength="100"/></svg><div class="timer-time">0:00</div></div>
    <div class="timer-sub"></div>
    <div class="timer-actions"></div>`;
  document.body.appendChild(el);
  el.addEventListener("click", (e) => {
    if (!e.target.closest("button") && el.classList.contains("mini") && cur) { el.classList.remove("mini"); miniPref = false; return; }
    const b = e.target.closest("button[data-t]");
    if (!b || !cur) return;
    const a = b.dataset.t;
    if (a === "minus") { cur.end -= 15000; cur.total = Math.max(1, cur.total - 15); if (!cur.beeped) scheduleBg((cur.end - Date.now()) / 1000); }
    if (a === "plus") { cur.end += 15000; cur.total += 15; if (cur.end > Date.now()) { cur.beeped = false; el.classList.remove("done"); scheduleBg((cur.end - Date.now()) / 1000); } }
    if (a === "skip" || a === "stop") stop(true);
    if (a === "next" && cur?.mode === "int") {
      const t = (Date.now() - cur.start) / 1000, p = cur.phases.find((x) => t < x.to);
      if (p) { cur.start -= (p.to - t) * 1000; cur.onShift?.(cur.start); }
    }
    if (a === "min") miniPref = el.classList.toggle("mini");
    render();
  });
  return el;
}

function render() {
  if (!cur) return;
  const now = Date.now();
  const time = el.querySelector(".timer-time"), fg = el.querySelector(".ring-fg"), sub = el.querySelector(".timer-sub");
  el.querySelector(".timer-label").textContent = cur.label;
  if (cur.mode === "rest") {
    const left = (cur.end - now) / 1000;
    time.textContent = mmss(left);
    fg.style.strokeDasharray = `${Math.max(0, (left / cur.total) * 100)} 100`;
    sub.textContent = left <= 0 ? "¡A por la siguiente serie!" : "Descanso";
    el.classList.toggle("done", left <= 0);
    if (left <= 0 && !cur.beeped) { cur.beeped = true; alarm(3); }
    if (left <= -20) stop(true);
  } else if (cur.mode === "int") {
    const t = (now - cur.start) / 1000;
    const i = cur.phases.findIndex((p) => t < p.to);
    if (i < 0) {
      time.textContent = mmss(cur.total);
      fg.style.strokeDasharray = "100 100";
      sub.textContent = "¡Sesión completada!";
      el.classList.add("done");
      el.dataset.phase = "";
      if (!cur.beeped) { cur.beeped = true; beep(3); }
      return;
    }
    const p = cur.phases[i];
    if (i !== cur.idx) { cur.idx = i; beep(p.tipo === "trabajo" ? 2 : 1); }
    el.querySelector(".timer-label").textContent = `${cur.label} · ${p.label}`;
    el.dataset.phase = p.tipo;
    time.textContent = mmss(p.to - t);
    fg.style.strokeDasharray = `${Math.min(100, ((t - p.from) / p.seg) * 100)} 100`;
    sub.textContent = `${mmss(t)} de ${mmss(cur.total)}`;
  } else {
    const el2 = (now - cur.start) / 1000;
    if (cur.target) {
      const left = cur.target - el2;
      time.textContent = left > 0 ? mmss(left) : "+" + mmss(-left);
      fg.style.strokeDasharray = `${Math.max(0, Math.min(100, (el2 / cur.target) * 100))} 100`;
      sub.textContent = left > 0 ? `Objetivo ${cur.target >= 120 ? mmss(cur.target) : `${cur.target} s`}` : "¡Objetivo cumplido!";
      if (left <= 0 && !cur.beeped) { cur.beeped = true; alarm(3); }
    } else {
      time.textContent = mmss(el2);
      fg.style.strokeDasharray = `${(el2 % 60) / 0.6} 100`;
      sub.textContent = "Cronómetro";
    }
  }
}

const MIN_BTN = `<button data-t="min" class="btn ghost min-btn" aria-label="Plegar o desplegar"><span class="when-mini">▲ Abrir</span><span class="when-full">▾</span></button>`;
function actions(mode) {
  if (mode === "int") return `<button data-t="next" class="btn ghost">Saltar fase</button><button data-t="stop" class="btn primary">Terminar</button>${MIN_BTN}`;
  return mode === "rest"
    ? `<button data-t="minus" class="btn ghost">−15 s</button><button data-t="skip" class="btn primary">Saltar</button><button data-t="plus" class="btn ghost">+15 s</button>${MIN_BTN}`
    : `<button data-t="stop" class="btn primary">Parar</button>${MIN_BTN}`;
}

export function startRest(seconds, label = "Descanso", restore) {
  stop(false);
  ensureEl();
  cur = restore || { mode: "rest", start: Date.now(), end: Date.now() + seconds * 1000, total: seconds, label };
  open();
  scheduleBg((cur.end - Date.now()) / 1000);
  return cur;
}
export function startWork({ target = 0, label = "Ejercicio", onStop, start = Date.now() } = {}) {
  stop(false);
  ensureEl();
  cur = { mode: "work", start, target, label, onStop };
  open();
  if (target) scheduleBg(target - (Date.now() - start) / 1000);
}
// Intervalos: fases { tipo: calentamiento|trabajo|pausa|calma, seg, label } con aviso sonoro en cada cambio.
export function startIntervals({ phases, label = "Intervalos", onStop, onShift, start = Date.now() }) {
  stop(false);
  ensureEl();
  let acc = 0;
  const ph = phases.map((p) => ({ ...p, from: acc, to: (acc += p.seg) }));
  const t0 = (Date.now() - start) / 1000;
  cur = { mode: "int", start, phases: ph, total: acc, label, onStop, onShift, idx: Math.max(0, ph.findIndex((p) => t0 < p.to)) };
  open();
}
function open() {
  el.querySelector(".timer-actions").innerHTML = actions(cur.mode);
  el.classList.remove("done");
  el.classList.toggle("mini", miniPref);
  el.dataset.phase = "";
  el.classList.add("open");
  lockScreen();
  clearInterval(tickId);
  tickId = setInterval(render, 250);
  render();
}
export function stop(user) {
  if (!cur) return;
  const c = cur;
  stopBg();
  cur = null;
  clearInterval(tickId);
  el?.classList.remove("open");
  if (c.mode !== "rest" && user && c.onStop) c.onStop(Math.min(c.total || Infinity, Math.round((Date.now() - c.start) / 1000)));
  if (onChange) onChange(null);
}
export const current = () => cur;
let onChange = null;
export const onTimerChange = (fn) => (onChange = fn);
