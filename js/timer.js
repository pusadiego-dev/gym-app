// Temporizadores: descanso (cuenta atrás), ejercicio (cronómetro con objetivo opcional) e intervalos de cardio.
// Se basan en marcas de tiempo, así que siguen siendo exactos si la pantalla se bloquea.
let audio = null;
let wakeLock = null;
let tickId = null;
let cur = null; // { mode: 'rest'|'work', start, end?, total?, target?, onDone, onStop, label, beeped }
let el = null;
export let soundOn = true;
export const setSound = (v) => (soundOn = v);

export function unlockAudio() {
  if (audio) return;
  try {
    audio = new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    g.gain.value = 0; o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + 0.01);
  } catch {}
}
export function beep(times = 3) {
  try { navigator.vibrate?.([200, 100, 200, 100, 200]); } catch {}
  if (!soundOn || !audio) return;
  audio.resume?.();
  for (let i = 0; i < times; i++) {
    const o = audio.createOscillator(), g = audio.createGain();
    const t0 = audio.currentTime + i * 0.28;
    o.frequency.value = i === times - 1 ? 1320 : 880;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
    o.connect(g).connect(audio.destination); o.start(t0); o.stop(t0 + 0.22);
  }
}
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
    const b = e.target.closest("button[data-t]");
    if (!b || !cur) return;
    const a = b.dataset.t;
    if (a === "minus") { cur.end -= 15000; cur.total = Math.max(1, cur.total - 15); }
    if (a === "plus") { cur.end += 15000; cur.total += 15; cur.beeped = false; }
    if (a === "skip" || a === "stop") stop(true);
    if (a === "next" && cur?.mode === "int") {
      const t = (Date.now() - cur.start) / 1000, p = cur.phases.find((x) => t < x.to);
      if (p) { cur.start -= (p.to - t) * 1000; cur.onShift?.(cur.start); }
    }
    if (a === "min") el.classList.toggle("mini");
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
    if (left <= 0 && !cur.beeped) { cur.beeped = true; beep(); }
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
      if (left <= 0 && !cur.beeped) { cur.beeped = true; beep(2); }
    } else {
      time.textContent = mmss(el2);
      fg.style.strokeDasharray = `${(el2 % 60) / 0.6} 100`;
      sub.textContent = "Cronómetro";
    }
  }
}

function actions(mode) {
  if (mode === "int") return `<button data-t="next" class="btn ghost">Saltar fase</button><button data-t="stop" class="btn primary">Terminar</button><button data-t="min" class="btn ghost icon" aria-label="Minimizar">▾</button>`;
  return mode === "rest"
    ? `<button data-t="minus" class="btn ghost">−15 s</button><button data-t="skip" class="btn primary">Saltar</button><button data-t="plus" class="btn ghost">+15 s</button><button data-t="min" class="btn ghost icon" aria-label="Minimizar">▾</button>`
    : `<button data-t="stop" class="btn primary">Parar</button><button data-t="min" class="btn ghost icon" aria-label="Minimizar">▾</button>`;
}

export function startRest(seconds, label = "Descanso", restore) {
  stop(false);
  ensureEl();
  cur = restore || { mode: "rest", start: Date.now(), end: Date.now() + seconds * 1000, total: seconds, label };
  open();
  return cur;
}
export function startWork({ target = 0, label = "Ejercicio", onStop, start = Date.now() } = {}) {
  stop(false);
  ensureEl();
  cur = { mode: "work", start, target, label, onStop };
  open();
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
  el.classList.remove("done", "mini");
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
  cur = null;
  clearInterval(tickId);
  el?.classList.remove("open");
  if (c.mode !== "rest" && user && c.onStop) c.onStop(Math.min(c.total || Infinity, Math.round((Date.now() - c.start) / 1000)));
  if (onChange) onChange(null);
}
export const current = () => cur;
let onChange = null;
export const onTimerChange = (fn) => (onChange = fn);
