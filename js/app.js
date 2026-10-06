import { EXERCISES, MUSCLES, VARIANT_LABEL, byId } from "./exercises.js";
import { mountAnim, frameSvg } from "./anim.js";
import * as P from "./program.js";
import * as store from "./store.js";
import * as drive from "./drive.js";
import * as timer from "./timer.js";
import * as theme from "./theme.js";

const { fmt, e1rm } = P;
const $ = (s, r = document) => r.querySelector(s);
const view = $("#view");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const DAY = 86400000;
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d, o = { day: "numeric", month: "short" }) => new Date(d).toLocaleDateString("es-ES", o);
const weekStart = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.getTime(); };
const variant = (exId, v) => byId[exId]?.variantes[v] || byId[exId]?.variantes[0];
const exName = (exId, v) => variant(exId, v)?.nombre || byId[exId]?.nombre || exId;
const sessions = () => store.live("sessions").sort((a, b) => b.fecha.localeCompare(a.fecha));
const EMOJIS = ["🏆", "💪", "🔥", "🥇", "🎯", "🚀", "⭐", "🏋️", "🦵", "🫀", "⚡", "👑"];

// ---------- utilidades de UI ----------
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), 2600);
}
function modal(html, onMount) {
  const m = $("#modal");
  m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><button class="close" data-act="closeModal" aria-label="Cerrar">✕</button>${html}</div>`;
  m.classList.add("open");
  onMount?.(m);
}
function closeModal() { $("#modal").classList.remove("open"); $("#modal").innerHTML = ""; }
const confirmBox = (msg) => window.confirm(msg);

function avatarHtml(p, cls = "") {
  if (p?.avatar) return `<img class="avatar ${cls}" src="${p.avatar}" alt="">`;
  return `<span class="avatar ${cls}" aria-hidden="true">${esc((p?.nombre || "?").trim().charAt(0).toUpperCase() || "?")}</span>`;
}
let pendingAvatar = undefined; // foto elegida en el formulario antes de guardar
function animSvg(anim, cls = "anim") {
  return `<svg class="${cls}" viewBox="0 0 200 200" aria-hidden="true">${frameSvg(anim, 0.35)}</svg>`;
}
function mountAnims(root) {
  root.querySelectorAll("svg[data-anim]").forEach((svg) => {
    const [id, v] = svg.dataset.anim.split(":");
    mountAnim(svg, variant(id, +v).anim);
  });
}

// ---------- historial y métricas ----------
function lastSetsFor(exId, v) {
  for (const s of sessions()) {
    const e = s.ejercicios.find((x) => x.exId === exId && x.variante === v) || s.ejercicios.find((x) => x.exId === exId);
    if (e) return { sets: e.sets, fecha: s.fecha, mismaVariante: e.variante === v };
  }
  return null;
}
function bestE1rm(exId, before) {
  let best = 0;
  for (const s of store.live("sessions")) {
    if (before && s.fecha >= before) continue;
    for (const e of s.ejercicios) if (e.exId === exId) for (const st of e.sets) if (st.hecho) best = Math.max(best, e1rm(+st.peso, +st.reps));
  }
  return best;
}
function historyFor(exId) {
  const pts = [];
  for (const s of [...sessions()].reverse()) {
    const ex = s.ejercicios.filter((x) => x.exId === exId);
    if (!ex.length) continue;
    let best = 0, top = null, secs = 0;
    for (const e of ex) for (const st of e.sets) {
      if (!st.hecho) continue;
      const v = e1rm(+st.peso, +st.reps);
      if (v > best) { best = v; top = st; }
      secs = Math.max(secs, +st.seg || 0);
    }
    if (best || secs) pts.push({ x: new Date(s.fecha).getTime(), y: best || secs, top, secs: !best });
  }
  return pts;
}
function weekSetsByMuscle(since = weekStart()) {
  const out = {};
  for (const s of store.live("sessions")) {
    if (new Date(s.fecha).getTime() < since) continue;
    for (const e of s.ejercicios) {
      const m = byId[e.exId]?.musculo;
      if (m) out[m] = (out[m] || 0) + e.sets.filter((x) => x.hecho).length;
    }
  }
  return out;
}

// ---------- objetivos ----------
function goalProgress(g) {
  if (g.tipo === "ejercicio") {
    const best = bestE1rm(g.exId);
    return { pct: g.valor ? best / g.valor : 0, txt: best ? `Mejor 1RM estimado: ${fmt(best)} kg` : "Aún sin registros" };
  }
  if (g.tipo === "sesiones") {
    const n = store.live("sessions").filter((s) => s.fecha >= (g.creado || "")).length;
    return { pct: n / g.valor, txt: `${n} de ${g.valor} entrenamientos` };
  }
  if (g.tipo === "peso_corporal") {
    const bw = store.live("bodyweight").sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    const start = g.inicio || bw?.kg || g.valor;
    if (!bw) return { pct: 0, txt: "Registra tu peso en Progreso" };
    const pct = start === g.valor ? 1 : (start - bw.kg) / (start - g.valor);
    return { pct: Math.max(0, pct), txt: `Actual: ${fmt(bw.kg)} kg (inicio ${fmt(start)} kg)` };
  }
  return { pct: g.cumplido ? 1 : 0, txt: g.cumplido ? "Conseguido" : "Márcalo cuando lo consigas" };
}
function goalTitle(g) {
  if (g.tipo === "ejercicio") return `${byId[g.exId]?.nombre || g.exId}: ${fmt(g.valor)} kg${g.reps > 1 ? ` × ${g.reps}` : ""}`;
  if (g.tipo === "sesiones") return `Completar ${g.valor} entrenamientos`;
  if (g.tipo === "peso_corporal") return `Llegar a ${fmt(g.valor)} kg de peso corporal`;
  return g.texto;
}
function checkGoals() {
  const hits = [];
  for (const g of store.live("goals")) {
    if (g.cumplido || g.tipo === "libre") continue;
    if (goalProgress(g).pct >= 1) { store.upsert("goals", { ...g, cumplido: today() }); hits.push(g); }
  }
  return hits;
}

// ---------- gráficos ----------
function lineChart(points, { unit = "kg", label = "" } = {}) {
  if (points.length < 2) return `<p class="muted small">Necesitas al menos 2 registros para ver la gráfica.</p>`;
  const W = 340, H = 180, pl = 36, pr = 12, pt = 12, pb = 26;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pad = (y1 - y0) * 0.15 || y1 * 0.1 || 1; y0 = Math.max(0, y0 - pad); y1 += pad;
  const X = (x) => pl + ((x - x0) / (x1 - x0 || 1)) * (W - pl - pr);
  const Y = (y) => pt + (1 - (y - y0) / (y1 - y0 || 1)) * (H - pt - pb);
  const ticks = [0, 0.5, 1].map((t) => y0 + (y1 - y0) * t);
  const d = points.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join("");
  const last = points[points.length - 1];
  const data = esc(JSON.stringify(points.map((p) => ({ x: X(p.x), y: Y(p.y), v: p.y, d: p.x, t: p.top ? `${fmt(p.top.peso)} kg × ${p.top.reps}` : "" }))));
  return `<div class="chart" data-points="${data}" data-unit="${unit}">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
      ${ticks.map((t) => `<line x1="${pl}" x2="${W - pr}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/><text x="${pl - 6}" y="${Y(t) + 3}" class="axis" text-anchor="end">${Math.round(t)}</text>`).join("")}
      <text x="${pl}" y="${H - 6}" class="axis">${fmtDate(x0)}</text><text x="${W - pr}" y="${H - 6}" class="axis" text-anchor="end">${fmtDate(x1)}</text>
      <path d="${d}" class="line"/>
      ${points.map((p) => `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4" class="dot"/>`).join("")}
      <text x="${X(last.x) - 4}" y="${Y(last.y) - 9}" class="lbl" text-anchor="end">${fmt(last.y)} ${unit}</text>
      <line class="xhair" y1="${pt}" y2="${H - pb}" x1="-10" x2="-10"/>
    </svg><div class="tip" hidden></div></div>`;
}
function bindCharts(root) {
  root.querySelectorAll(".chart").forEach((c) => {
    const pts = JSON.parse(c.dataset.points), svg = c.querySelector("svg"), tip = c.querySelector(".tip"), xh = c.querySelector(".xhair");
    const move = (ev) => {
      const r = svg.getBoundingClientRect();
      const x = ((ev.clientX - r.left) / r.width) * svg.viewBox.baseVal.width;
      const p = pts.reduce((a, b) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a));
      xh.setAttribute("x1", p.x); xh.setAttribute("x2", p.x);
      tip.hidden = false;
      tip.innerHTML = `<b>${fmt(p.v)} ${c.dataset.unit}</b><br>${fmtDate(p.d, { day: "numeric", month: "short", year: "numeric" })}${p.t ? `<br>${p.t}` : ""}`;
      tip.style.left = `${Math.min(r.width - 120, Math.max(0, (p.x / svg.viewBox.baseVal.width) * r.width - 60))}px`;
    };
    svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerdown", move);
    svg.addEventListener("pointerleave", () => { tip.hidden = true; xh.setAttribute("x1", -10); xh.setAttribute("x2", -10); });
  });
}
function barsVsTarget(done, target) {
  const keys = Object.keys(MUSCLES).filter((m) => target[m]);
  const max = Math.max(...keys.map((m) => Math.max(done[m] || 0, target[m])), 1);
  return `<div class="bars" role="table" aria-label="Series esta semana por músculo">${keys.map((m) => {
    const d = done[m] || 0, t = target[m];
    return `<div class="bar-row" role="row" title="${MUSCLES[m]}: ${d} de ${t} series">
      <span class="bar-name" role="cell">${MUSCLES[m]}</span>
      <span class="bar-track" role="cell"><span class="bar-fill" style="width:${(d / max) * 100}%"></span><span class="bar-target" style="left:${(t / max) * 100}%"></span></span>
      <span class="bar-val" role="cell">${d}/${t}</span></div>`;
  }).join("")}</div><p class="muted small">Barra: series hechas esta semana · marca vertical: objetivo semanal de tu rutina.</p>`;
}

// ---------- vistas ----------
const routes = {
  hoy: viewHome, rutina: viewRoutine, ejercicios: viewExercises, ejercicio: viewExercise, progreso: viewProgress,
  logros: viewAchievements, perfil: viewProfile, formulario: viewForm, entreno: viewWorkout,
};

function render() {
  const [route, ...args] = (location.hash.slice(2) || "hoy").split("/");
  const profile = store.obj("profile");
  if (!profile && !["formulario", "ejercicios", "ejercicio", "perfil"].includes(route)) { location.hash = "#/formulario"; return; }
  if (route === "entreno" && !store.getActive()) { location.hash = "#/hoy"; return; }
  const fn = routes[route] || viewHome;
  document.querySelectorAll(".tabbar a").forEach((a) => a.classList.toggle("on", a.dataset.r === route || (route === "ejercicio" && a.dataset.r === "ejercicios")));
  document.body.dataset.route = route;
  view.innerHTML = fn(...args.map(decodeURIComponent));
  mountAnims(view);
  bindCharts(view);
  renderSyncChip();
  $("#avatarTop").innerHTML = profile ? avatarHtml(profile, "sm") : "";
}
function rerenderKeepScroll() { const y = scrollY; render(); scrollTo(0, y); }

function renderSyncChip() {
  const s = drive.getStatus();
  const c = $("#sync");
  c.dataset.state = s.state;
  c.title = s.msg;
  c.querySelector("span").textContent = { ok: "Sincronizado", busy: "Sincronizando…", expired: "Sincronizar", pending: "Pendiente", error: "Error", off: "Local" }[s.state] || "";
}

// HOY
function nextDayIdx(routine) {
  const last = sessions().find((s) => s.rutinaId === routine.id);
  return last ? (last.diaIdx + 1) % routine.dias.length : 0;
}
function viewHome() {
  const p = store.obj("profile"), r = store.obj("routine"), active = store.getActive();
  const ss = sessions();
  const wk = ss.filter((s) => new Date(s.fecha).getTime() >= weekStart()).length;
  const streak = (() => { let n = 0, w = weekStart(); while (ss.some((s) => { const t = new Date(s.fecha).getTime(); return t >= w && t < w + 7 * DAY; })) { n++; w -= 7 * DAY; } return n; })();
  const next = r ? nextDayIdx(r) : 0;
  const lastAch = store.live("achievements").sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  return `
  <header class="page-h hello"><div><p class="muted">${fmtDate(new Date(), { weekday: "long", day: "numeric", month: "long" })}</p><h1>Hola, ${esc(p.nombre || "atleta")}</h1></div><a href="#/perfil" aria-label="Perfil">${avatarHtml(p, "md")}</a></header>
  ${active ? `<a class="card resume" href="#/entreno"><b>Entreno en curso</b><span>${esc(active.diaNombre)} · toca para continuar</span></a>` : ""}
  <div class="stats">
    <div class="stat"><span class="n">${wk}<small>/${r?.dias.length || p.dias}</small></span><span>esta semana</span></div>
    <div class="stat"><span class="n">${streak}</span><span>semanas seguidas</span></div>
    <div class="stat"><span class="n">${ss.length}</span><span>entrenos</span></div>
  </div>
  ${r ? `
  <section class="card next">
    <p class="eyebrow">Toca hoy</p>
    <h2>${esc(r.dias[next].nombre)}</h2>
    <p class="muted small">${r.dias[next].ejercicios.length} ejercicios · ~${Math.round(P.sessionSeconds(r.dias[next]) / 60)} min</p>
    <ul class="mini-list">${r.dias[next].ejercicios.map((e) => `<li>${esc(exName(e.exId, e.variante))} <span class="muted">${e.series}×${e.tiempo ? `${e.repMin}-${e.repMax} s` : `${e.repMin}-${e.repMax}`}</span></li>`).join("")}</ul>
    <button class="btn primary block" data-act="start" data-day="${next}" ${active ? "disabled" : ""}>Empezar entreno</button>
  </section>
  <section><h3>Otros días</h3><div class="chips">${r.dias.map((d, i) => i === next ? "" : `<button class="chip" data-act="start" data-day="${i}" ${active ? "disabled" : ""}>${esc(d.nombre)}</button>`).join("")}</div></section>` : `<a class="btn primary block" href="#/formulario">Crear mi rutina</a>`}
  ${lastAch ? `<section class="card ach-mini"><span class="emoji">${lastAch.emoji}</span><div><p class="eyebrow">Último logro</p><b>${esc(lastAch.titulo)}</b></div></section>` : ""}
  ${ss[0] ? `<section><h3>Último entreno</h3>${sessionCard(ss[0])}</section>` : ""}`;
}
function sessionCard(s) {
  const sets = s.ejercicios.reduce((n, e) => n + e.sets.filter((x) => x.hecho).length, 0);
  const vol = s.ejercicios.reduce((n, e) => n + e.sets.filter((x) => x.hecho).reduce((m, x) => m + (+x.peso || 0) * (+x.reps || 0), 0), 0);
  return `<button class="card session" data-act="showSession" data-id="${s.id}"><b>${esc(s.diaNombre)}</b><span class="muted small">${fmtDate(s.fecha, { weekday: "short", day: "numeric", month: "short" })} · ${Math.round((s.duracionSeg || 0) / 60)} min · ${sets} series · ${Math.round(vol).toLocaleString("es-ES")} kg</span></button>`;
}

// FORMULARIO DE PERFIL
function viewForm() {
  const g = drive.getUser();
  const isNew = !store.obj("profile");
  const p = store.obj("profile") || { nombre: g?.nombre || "", avatar: g?.foto || null, experiencia: "principiante", objetivo: "hipertrofia", dias: 3, duracion: 60, equipo: "completo", limitaciones: [], prioridades: [] };
  if (isNew && pendingAvatar === undefined && g?.foto) pendingAvatar = g.foto;
  const googleBox = !isNew ? "" : g
    ? `<p class="card small google-ok">Conectado con Google como <b>${esc(g.email)}</b>. Hemos rellenado tu nombre y tu foto; completa el resto.</p>`
    : drive.clientId() ? `<div class="card google-cta"><b>¿Tienes cuenta de Google?</b><p class="small muted">Conéctala para rellenar tu nombre y tu foto, guardar tus datos en tu Drive y recuperarlos si ya usaste Gym App en otro dispositivo.</p><button class="btn primary block" type="button" data-act="driveConnect">Conectar con Google</button></div>` : "";
  const radio = (name, opts, val) => opts.map(([v, l, d]) => `<label class="opt"><input type="radio" name="${name}" value="${v}" ${String(val) === String(v) ? "checked" : ""}><span><b>${l}</b>${d ? `<small>${d}</small>` : ""}</span></label>`).join("");
  const check = (name, opts, vals) => opts.map(([v, l]) => `<label class="chip-check"><input type="checkbox" name="${name}" value="${v}" ${vals.includes(v) ? "checked" : ""}><span>${l}</span></label>`).join("");
  return `
  <header class="page-h"><h1>${store.obj("profile") ? "Editar perfil" : "Crea tu perfil"}</h1><p class="muted">Con tus respuestas generamos una rutina semanal basada en la evidencia científica.</p></header>
  ${googleBox}
  <form id="profileForm" class="form">
    <fieldset><legend>Sobre ti</legend>
      <div class="avatar-pick"><span id="formAvatarPreview">${avatarHtml(pendingAvatar !== undefined ? { ...p, avatar: pendingAvatar } : p, "lg")}</span>
        <label class="btn ghost small">Elegir foto<input type="file" accept="image/*" id="formAvatar" hidden></label></div>
      <label>Nombre<input name="nombre" required value="${esc(p.nombre)}" autocomplete="given-name"></label>
      <div class="row3">
        <label>Edad<input name="edad" type="number" inputmode="numeric" min="12" max="100" value="${esc(p.edad)}"></label>
        <label>Peso (kg)<input name="peso" type="number" inputmode="decimal" step="0.1" min="30" max="300" value="${esc(p.peso)}"></label>
        <label>Altura (cm)<input name="altura" type="number" inputmode="numeric" min="120" max="230" value="${esc(p.altura)}"></label>
      </div>
      <label>Sexo<select name="sexo"><option value="">Prefiero no decirlo</option><option value="h" ${p.sexo === "h" ? "selected" : ""}>Hombre</option><option value="m" ${p.sexo === "m" ? "selected" : ""}>Mujer</option></select></label>
    </fieldset>
    <fieldset><legend>Experiencia</legend>${radio("experiencia", Object.entries(P.LEVELS).map(([k, v]) => [k, v.label, v.desc]), p.experiencia)}</fieldset>
    <fieldset><legend>Objetivo principal</legend>${radio("objetivo", Object.entries(P.GOALS).map(([k, v]) => [k, v.label]), p.objetivo)}</fieldset>
    <fieldset><legend>Disponibilidad</legend>
      <label>Días por semana<select name="dias">${[2, 3, 4, 5, 6].map((d) => `<option ${+p.dias === d ? "selected" : ""}>${d}</option>`).join("")}</select></label>
      <label>Tiempo por sesión<select name="duracion">${[45, 60, 75, 90].map((d) => `<option value="${d}" ${+p.duracion === d ? "selected" : ""}>${d} min</option>`).join("")}</select></label>
    </fieldset>
    <fieldset><legend>Material preferido</legend>${radio("equipo", [["completo", "Peso libre primero", "Barras y mancuernas, con máquinas de apoyo"], ["maquinas", "Máquinas y poleas primero", "Más guiado y fácil de aprender"]], p.equipo)}</fieldset>
    <fieldset><legend>Molestias o lesiones</legend><div class="chips">${check("limitaciones", [["lumbar", "Zona lumbar"], ["rodilla", "Rodillas"], ["hombro", "Hombros"]], p.limitaciones || [])}</div></fieldset>
    <fieldset><legend>Músculos a priorizar <small class="muted">(+4 series/semana)</small></legend><div class="chips">${check("prioridades", Object.entries(MUSCLES), p.prioridades || [])}</div></fieldset>
    <button class="btn primary block" type="submit">${store.obj("routine") ? "Guardar y regenerar rutina" : "Generar mi rutina"}</button>
    ${store.obj("profile") ? `<button class="btn ghost block" type="button" data-act="saveProfileOnly">Guardar sin cambiar la rutina</button>` : ""}
  </form>`;
}
function readForm(form) {
  const fd = new FormData(form);
  const o = Object.fromEntries([...fd.entries()].filter(([k]) => !["limitaciones", "prioridades"].includes(k)));
  o.limitaciones = fd.getAll("limitaciones");
  o.prioridades = fd.getAll("prioridades");
  if (pendingAvatar !== undefined) o.avatar = pendingAvatar;
  pendingAvatar = undefined;
  return o;
}

// RUTINA
function viewRoutine() {
  const r = store.obj("routine"), p = store.obj("profile");
  if (!r) return `<p>No hay rutina. <a href="#/formulario">Créala</a>.</p>`;
  const vol = P.weeklySetsByMuscle(r);
  return `
  <header class="page-h"><p class="eyebrow">Tu rutina</p><h1>${esc(r.nombre)}</h1><p class="muted">${r.dias.length} días por semana · ${esc(P.GOALS[p.objetivo]?.label || "")}</p></header>
  <details class="card why"><summary>¿Por qué esta rutina? (base científica)</summary><ul>${P.rationale(p, r).map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
    <p class="small muted"><a href="#/perfil">Ver referencias</a></p></details>
  ${r.dias.map((d, di) => `
    <section class="card day">
      <div class="day-h"><h2>${esc(d.nombre)}</h2><span class="muted small">~${Math.round(P.sessionSeconds(d) / 60)} min</span></div>
      ${d.ejercicios.map((e, ei) => routineRow(e, di, ei)).join("")}
      <div class="day-actions"><button class="btn ghost small" data-act="addEx" data-day="${di}">+ Añadir ejercicio</button><button class="btn primary small" data-act="start" data-day="${di}" ${store.getActive() ? "disabled" : ""}>Empezar</button></div>
    </section>`).join("")}
  <section class="card"><h3>Series semanales por músculo</h3>
    <div class="vol">${Object.keys(MUSCLES).map((m) => `<div><span>${MUSCLES[m]}</span><b class="${(vol[m] || 0) < 8 && !["core", "gemelos", "biceps", "triceps"].includes(m) ? "low" : ""}">${vol[m] || 0}</b></div>`).join("")}</div>
    <p class="muted small">Referencia: unas 10 o más series semanales por músculo grande maximizan la hipertrofia en la mayoría de personas (Schoenfeld et al., 2017). Bíceps, tríceps y hombros reciben además trabajo indirecto de los básicos.</p></section>
  <a class="btn ghost block" href="#/formulario">Cambiar perfil y regenerar</a>`;
}
function routineRow(e, di, ei) {
  const ex = byId[e.exId];
  return `<div class="ex-row">
    <svg class="thumb" data-anim="${e.exId}:${e.variante}" viewBox="0 0 200 200"></svg>
    <div class="ex-main">
      <a href="#/ejercicio/${e.exId}/${e.variante}" class="ex-name">${esc(exName(e.exId, e.variante))}</a>
      <span class="muted small">${MUSCLES[ex.musculo]} · ${VARIANT_LABEL[variant(e.exId, e.variante).tipo]}</span>
      <div class="ex-params">
        <label><input type="number" inputmode="numeric" min="1" max="10" value="${e.series}" data-edit="series" data-day="${di}" data-i="${ei}" aria-label="Series"> series</label>
        <label><input type="number" inputmode="numeric" min="1" max="100" value="${e.repMin}" data-edit="repMin" data-day="${di}" data-i="${ei}" aria-label="Mínimo">–<input type="number" inputmode="numeric" min="1" max="120" value="${e.repMax}" data-edit="repMax" data-day="${di}" data-i="${ei}" aria-label="Máximo"> ${e.tiempo ? "s" : "reps"}</label>
        <label>desc. <input type="number" inputmode="numeric" step="15" min="15" max="600" value="${e.descanso}" data-edit="descanso" data-day="${di}" data-i="${ei}" aria-label="Descanso en segundos"> s</label>
        <span class="muted small">RIR ${e.rir}</span>
      </div>
    </div>
    <div class="ex-tools">
      <button class="icon-btn" data-act="exMenu" data-day="${di}" data-i="${ei}" aria-label="Opciones">⋯</button>
    </div>
  </div>`;
}

// EJERCICIOS
let exFilter = { m: "", t: "", q: "" };
function viewExercises() {
  const list = EXERCISES.filter((e) => (!exFilter.m || e.musculo === exFilter.m) && (!exFilter.t || e.variantes.some((v) => v.tipo === exFilter.t)) && (!exFilter.q || (e.nombre + e.variantes.map((v) => v.nombre).join(" ")).toLowerCase().includes(exFilter.q.toLowerCase())));
  return `
  <header class="page-h"><h1>Ejercicios</h1><p class="muted">${EXERCISES.length} ejercicios y ${EXERCISES.reduce((n, e) => n + e.variantes.length, 0)} variantes con su técnica animada.</p></header>
  <input class="search" type="search" placeholder="Buscar ejercicio…" value="${esc(exFilter.q)}" data-filter="q">
  <div class="chips scroll">${[["", "Todos"], ...Object.entries(MUSCLES)].map(([k, l]) => `<button class="chip ${exFilter.m === k ? "on" : ""}" data-act="filterM" data-v="${k}">${l}</button>`).join("")}</div>
  <div class="chips">${[["", "Todo el material"], ...Object.entries(VARIANT_LABEL)].map(([k, l]) => `<button class="chip ${exFilter.t === k ? "on" : ""}" data-act="filterT" data-v="${k}">${l}</button>`).join("")}</div>
  <div class="ex-grid">${list.map((e) => {
    const vi = exFilter.t ? Math.max(0, e.variantes.findIndex((v) => v.tipo === exFilter.t)) : 0;
    return `<a class="ex-card" href="#/ejercicio/${e.id}/${vi}">${animSvg(e.variantes[vi].anim, "thumb")}<b>${esc(e.nombre)}</b><span class="muted small">${MUSCLES[e.musculo]} · ${[...new Set(e.variantes.map((v) => VARIANT_LABEL[v.tipo]))].join(", ")}</span></a>`;
  }).join("") || `<p class="muted">Sin resultados.</p>`}</div>`;
}
function viewExercise(id, v = "0") {
  const ex = byId[id];
  if (!ex) return `<p>Ejercicio no encontrado.</p>`;
  const vi = Math.min(+v || 0, ex.variantes.length - 1);
  const hist = historyFor(id);
  const best = bestE1rm(id);
  return `
  <a class="back" href="#/ejercicios">← Ejercicios</a>
  <header class="page-h"><p class="eyebrow">${MUSCLES[ex.musculo]}${ex.secundarios.length ? ` · también ${ex.secundarios.map((m) => MUSCLES[m].toLowerCase()).join(", ")}` : ""}</p><h1>${esc(ex.nombre)}</h1></header>
  <div class="tabs">${ex.variantes.map((x, i) => `<a class="tab ${i === vi ? "on" : ""}" href="#/ejercicio/${id}/${i}">${VARIANT_LABEL[x.tipo]}<small>${esc(x.nombre)}</small></a>`).join("")}</div>
  <div class="anim-stage"><svg class="anim big" data-anim="${id}:${vi}" role="img" aria-label="Animación: ${esc(ex.variantes[vi].nombre)}"></svg><p class="small muted center">${esc(ex.variantes[vi].nombre)}</p></div>
  <section class="card"><h3>Cómo se hace</h3><ol class="steps">${ex.pasos.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></section>
  <section class="card warn"><h3>Errores comunes</h3><ul>${ex.errores.map((s) => `<li>${esc(s)}</li>`).join("")}</ul></section>
  <section class="card tip-card"><h3>Consejo</h3><p>${esc(ex.consejo)}</p></section>
  <section class="card"><h3>Tu evolución</h3>${best ? `<p>Mejor 1RM estimado: <b>${fmt(best)} kg</b></p>` : ""}${lineChart(hist, { unit: hist[0]?.secs ? "s" : "kg", label: `Evolución de ${ex.nombre}` })}</section>`;
}

// ENTRENO ACTIVO
function startWorkout(di) {
  const r = store.obj("routine");
  const d = r.dias[di];
  const act = {
    id: store.uid(), inicio: Date.now(), diaIdx: di, diaNombre: d.nombre, rutinaId: r.id, rest: null,
    ejercicios: d.ejercicios.map((slot) => {
      const last = lastSetsFor(slot.exId, slot.variante);
      const sug = P.suggestion(slot, last?.mismaVariante ? last.sets : null);
      const lastW = last?.mismaVariante ? Math.max(0, ...last.sets.filter((s) => s.hecho).map((s) => +s.peso || 0)) : 0;
      const peso = sug?.peso ?? (lastW || "");
      return { exId: slot.exId, variante: slot.variante, slot: { ...slot }, sets: Array.from({ length: slot.series }, () => ({ peso: peso === 0 ? "" : peso, reps: "", seg: "", hecho: false })) };
    }),
  };
  store.setActive(act);
  timer.unlockAudio();
  location.hash = "#/entreno";
}
function viewWorkout() {
  const a = store.getActive();
  const total = a.ejercicios.reduce((n, e) => n + e.sets.length, 0);
  const done = a.ejercicios.reduce((n, e) => n + e.sets.filter((s) => s.hecho).length, 0);
  return `
  <header class="page-h workout-h"><div><p class="eyebrow">Entrenando</p><h1>${esc(a.diaNombre)}</h1></div><div class="clock"><span id="elapsed">${timer.mmss((Date.now() - a.inicio) / 1000)}</span><small>${done}/${total} series</small></div></header>
  <div class="progress"><span style="width:${(done / total) * 100}%"></span></div>
  <div class="row-btns"><button class="btn ghost small" data-act="stopwatch">⏱ Cronómetro</button><button class="btn ghost small" data-act="restNow">⏸ Descanso</button></div>
  ${a.ejercicios.map((e, ei) => workoutExercise(e, ei)).join("")}
  <button class="btn ghost block" data-act="addWorkoutEx">+ Añadir ejercicio</button>
  <button class="btn primary block" data-act="finish">Terminar entreno</button>
  <button class="btn danger-ghost block" data-act="discard">Descartar entreno</button>`;
}
function workoutExercise(e, ei) {
  const ex = byId[e.exId], s = e.slot;
  const last = lastSetsFor(e.exId, e.variante);
  const sug = P.suggestion(s, last?.mismaVariante ? last.sets : null);
  const allDone = e.sets.length && e.sets.every((x) => x.hecho);
  return `<section class="card wex ${allDone ? "complete" : ""}" id="wex-${ei}">
    <div class="wex-h">
      <svg class="thumb" data-anim="${e.exId}:${e.variante}" viewBox="0 0 200 200" data-act="technique" data-ex="${e.exId}" data-v="${e.variante}" role="button" aria-label="Ver técnica"></svg>
      <div><b>${esc(exName(e.exId, e.variante))}</b>
      <p class="muted small">${s.series} × ${s.repMin}-${s.repMax} ${s.tiempo ? "s" : "reps"} · RIR ${s.rir} · descanso ${timer.mmss(s.descanso)}</p></div>
      <button class="icon-btn" data-act="wexMenu" data-i="${ei}" aria-label="Opciones">⋯</button>
    </div>
    ${last ? `<p class="last small">Última vez (${fmtDate(last.fecha)}): ${last.sets.filter((x) => x.hecho).map((x) => (s.tiempo ? `${x.seg} s` : `${fmt(+x.peso || 0)}×${x.reps}`)).join(", ") || "—"}${last.mismaVariante ? "" : " <span class='muted'>(otra variante)</span>"}</p>` : `<p class="last small muted">Primera vez: elige un peso con el que llegues al rango dejando ${s.rir} reps en reserva.</p>`}
    ${sug ? `<p class="sug ${sug.sube ? "up" : ""} small">${esc(sug.texto)}</p>` : ""}
    <div class="sets">
      <div class="set head"><span>#</span><span>kg</span><span>${s.tiempo ? "seg" : "reps"}</span><span></span></div>
      ${e.sets.map((st, si) => `<div class="set ${st.hecho ? "done" : ""}">
        <span>${si + 1}</span>
        <input type="number" inputmode="decimal" step="0.5" min="0" placeholder="kg" value="${esc(st.peso)}" data-set="peso" data-e="${ei}" data-s="${si}" aria-label="Peso serie ${si + 1}">
        ${s.tiempo
          ? `<span class="with-btn"><input type="number" inputmode="numeric" min="0" placeholder="${s.repMax}" value="${esc(st.seg)}" data-set="seg" data-e="${ei}" data-s="${si}" aria-label="Segundos"><button class="icon-btn" data-act="workTimer" data-e="${ei}" data-s="${si}" aria-label="Cronometrar">▶</button></span>`
          : `<input type="number" inputmode="numeric" min="0" placeholder="${s.repMin}-${s.repMax}" value="${esc(st.reps)}" data-set="reps" data-e="${ei}" data-s="${si}" aria-label="Repeticiones serie ${si + 1}">`}
        <button class="check" data-act="toggleSet" data-e="${ei}" data-s="${si}" aria-label="Serie hecha" aria-pressed="${st.hecho}">✓</button>
      </div>`).join("")}
    </div>
    <div class="set-tools"><button class="btn ghost small" data-act="addSet" data-e="${ei}">+ Serie</button>${e.sets.length > 1 ? `<button class="btn ghost small" data-act="delSet" data-e="${ei}">− Serie</button>` : ""}</div>
  </section>`;
}
function updateActive(fn, rerender = true) {
  const a = store.getActive();
  fn(a);
  store.setActive(a);
  if (rerender) rerenderKeepScroll();
}
function finishWorkout() {
  const a = store.getActive();
  const ejercicios = a.ejercicios
    .map((e) => ({ exId: e.exId, variante: e.variante, sets: e.sets.filter((s) => s.hecho).map((s) => ({ peso: +s.peso || 0, reps: +s.reps || 0, seg: +s.seg || 0, hecho: true })) }))
    .filter((e) => e.sets.length);
  if (!ejercicios.length) { if (confirmBox("No has marcado ninguna serie. ¿Descartar el entreno?")) discardWorkout(); return; }
  const fecha = new Date(a.inicio).toISOString();
  const prs = [];
  for (const e of ejercicios) {
    const before = bestE1rm(e.exId, fecha);
    const now = Math.max(...e.sets.map((s) => e1rm(s.peso, s.reps)));
    if (now > before && before > 0) prs.push({ exId: e.exId, before, now });
  }
  store.upsert("sessions", { id: a.id, fecha, duracionSeg: Math.round((Date.now() - a.inicio) / 1000), diaIdx: a.diaIdx, diaNombre: a.diaNombre, rutinaId: a.rutinaId, ejercicios });
  store.setActive(null);
  timer.stop(false);
  timer.releaseScreen();
  const goals = checkGoals();
  location.hash = "#/hoy";
  const sets = ejercicios.reduce((n, e) => n + e.sets.length, 0);
  modal(`<h2>¡Entreno completado! 💪</h2>
    <p>${sets} series en ${Math.round((Date.now() - a.inicio) / 60000)} min.</p>
    ${prs.length ? `<h3>Nuevos récords</h3><ul class="prs">${prs.map((p) => `<li>🏅 ${esc(byId[p.exId].nombre)}: ${fmt(p.now)} kg 1RM est. <span class="muted">(antes ${fmt(p.before)})</span></li>`).join("")}</ul>` : ""}
    ${goals.length ? `<h3>Objetivos conseguidos</h3><ul>${goals.map((g) => `<li>🎯 ${esc(goalTitle(g))}</li>`).join("")}</ul><a class="btn primary block" href="#/logros" data-act="closeModal">Añadir a mis logros</a>` : ""}
    <button class="btn ${goals.length ? "ghost" : "primary"} block" data-act="closeModal">Cerrar</button>`);
}
function discardWorkout() { store.setActive(null); timer.stop(false); timer.releaseScreen(); location.hash = "#/hoy"; }

// PROGRESO
let progEx = "";
function viewProgress() {
  const ss = sessions();
  const used = [...new Set(ss.flatMap((s) => s.ejercicios.map((e) => e.exId)))];
  if (!progEx || !used.includes(progEx)) progEx = used[0] || "";
  const r = store.obj("routine");
  const target = r ? P.weeklySetsByMuscle(r) : {};
  const bw = store.live("bodyweight").sort((a, b) => a.fecha.localeCompare(b.fecha));
  const month = ss.filter((s) => Date.now() - new Date(s.fecha).getTime() < 30 * DAY);
  const vol = month.reduce((n, s) => n + s.ejercicios.reduce((m, e) => m + e.sets.reduce((k, x) => k + (+x.peso || 0) * (+x.reps || 0), 0), 0), 0);
  const records = used.map((id) => ({ id, v: bestE1rm(id) })).filter((x) => x.v).sort((a, b) => b.v - a.v);
  return `
  <header class="page-h"><h1>Tu evolución</h1></header>
  <div class="stats">
    <div class="stat"><span class="n">${month.length}</span><span>entrenos en 30 días</span></div>
    <div class="stat"><span class="n">${(vol / 1000).toFixed(1).replace(".", ",")}<small>t</small></span><span>volumen en 30 días</span></div>
    <div class="stat"><span class="n">${records.length}</span><span>ejercicios con marca</span></div>
  </div>
  <section class="card"><h3>Fuerza por ejercicio</h3>
    ${used.length ? `<select data-act-change="progEx">${used.map((id) => `<option value="${id}" ${id === progEx ? "selected" : ""}>${esc(byId[id]?.nombre || id)}</option>`).join("")}</select>
    <p class="muted small">1RM estimado (fórmula de Epley) de la mejor serie de cada sesión.</p>
    ${lineChart(historyFor(progEx), { unit: byId[progEx]?.tiempo ? "s" : "kg", label: "Evolución" })}` : `<p class="muted">Registra tu primer entreno para ver tu progreso.</p>`}
  </section>
  ${r ? `<section class="card"><h3>Series esta semana</h3>${barsVsTarget(weekSetsByMuscle(), target)}</section>` : ""}
  <section class="card"><h3>Peso corporal</h3>
    <form class="inline-form" id="bwForm"><input name="kg" type="number" inputmode="decimal" step="0.1" min="30" max="300" placeholder="kg" required aria-label="Peso en kg"><input name="fecha" type="date" value="${today()}" aria-label="Fecha"><button class="btn primary small">Añadir</button></form>
    ${lineChart(bw.map((b) => ({ x: new Date(b.fecha).getTime(), y: +b.kg })), { unit: "kg", label: "Peso corporal" })}
    ${bw.length ? `<details><summary class="small">Ver registros</summary><ul class="plain">${[...bw].reverse().map((b) => `<li>${fmtDate(b.fecha, { day: "numeric", month: "short", year: "numeric" })}: <b>${fmt(+b.kg)} kg</b> <button class="link" data-act="delBw" data-id="${b.id}">borrar</button></li>`).join("")}</ul></details>` : ""}
  </section>
  ${records.length ? `<section class="card"><h3>Mejores marcas</h3><ul class="plain records">${records.map((x) => `<li><a href="#/ejercicio/${x.id}/0">${esc(byId[x.id]?.nombre)}</a><b>${fmt(x.v)} kg</b></li>`).join("")}</ul></section>` : ""}
  <section><h3>Historial</h3>${ss.map(sessionCard).join("") || `<p class="muted">Sin entrenos todavía.</p>`}</section>`;
}

// LOGROS Y OBJETIVOS
function viewAchievements() {
  const goals = store.live("goals").sort((a, b) => (a.cumplido ? 1 : 0) - (b.cumplido ? 1 : 0));
  const achs = store.live("achievements").sort((a, b) => b.fecha.localeCompare(a.fecha));
  return `
  <header class="page-h"><h1>Objetivos y logros</h1><p class="muted">Marca metas, sigue tu progreso y guarda tus logros cuando los consigas.</p></header>
  <section><div class="sec-h"><h3>Objetivos</h3><button class="btn ghost small" data-act="newGoal">+ Objetivo</button></div>
    ${goals.map((g) => { const pr = goalProgress(g); const pct = Math.min(1, pr.pct); const done = g.cumplido || pct >= 1; return `
      <div class="card goal ${done ? "done" : ""}">
        <div class="goal-h"><b>${esc(goalTitle(g))}</b><button class="icon-btn" data-act="delGoal" data-id="${g.id}" aria-label="Borrar objetivo">✕</button></div>
        <div class="progress"><span style="width:${pct * 100}%"></span></div>
        <p class="muted small">${esc(pr.txt)} · ${Math.round(pct * 100)} %</p>
        ${done ? `<button class="btn primary small" data-act="goalToAch" data-id="${g.id}">🏆 Añadir como logro</button>` : g.tipo === "libre" ? `<button class="btn ghost small" data-act="goalDone" data-id="${g.id}">Marcar conseguido</button>` : ""}
      </div>`; }).join("") || `<p class="muted">Sin objetivos. Añade el primero.</p>`}
  </section>
  <section><div class="sec-h"><h3>Mis logros</h3><button class="btn primary small" data-act="newAch">+ Logro</button></div>
    <div class="ach-grid">${achs.map((a) => `<div class="ach"><span class="emoji">${a.emoji}</span><b>${esc(a.titulo)}</b>${a.descripcion ? `<p class="small">${esc(a.descripcion)}</p>` : ""}<span class="muted small">${fmtDate(a.fecha, { day: "numeric", month: "short", year: "numeric" })}</span><button class="link small" data-act="delAch" data-id="${a.id}">borrar</button></div>`).join("") || `<p class="muted">Aún no hay logros. ¡El primero está cerca!</p>`}</div>
  </section>`;
}
function achForm(pre = {}) {
  modal(`<h2>Nuevo logro</h2><form id="achForm" class="form">
    <div class="emoji-pick">${EMOJIS.map((e, i) => `<label><input type="radio" name="emoji" value="${e}" ${(pre.emoji || EMOJIS[0]) === e ? "checked" : ""}><span>${e}</span></label>`).join("")}</div>
    <label>Título<input name="titulo" required maxlength="80" value="${esc(pre.titulo)}"></label>
    <label>Descripción<textarea name="descripcion" rows="2" maxlength="300">${esc(pre.descripcion)}</textarea></label>
    <label>Fecha<input name="fecha" type="date" value="${pre.fecha || today()}" required></label>
    ${pre.goalId ? `<input type="hidden" name="goalId" value="${pre.goalId}">` : ""}
    <button class="btn primary block">Guardar logro</button></form>`);
}
function goalForm() {
  modal(`<h2>Nuevo objetivo</h2><form id="goalForm" class="form">
    <label>Tipo<select name="tipo" id="goalTipo">
      <option value="ejercicio">Peso en un ejercicio (1RM estimado)</option><option value="sesiones">Número de entrenamientos</option><option value="peso_corporal">Peso corporal</option><option value="libre">Otro (lo marco yo)</option></select></label>
    <label data-for="ejercicio">Ejercicio<select name="exId">${EXERCISES.filter((e) => !e.tiempo).map((e) => `<option value="${e.id}">${esc(e.nombre)}</option>`).join("")}</select></label>
    <label data-for="ejercicio sesiones peso_corporal"><span id="goalValLabel">Peso objetivo (kg)</span><input name="valor" type="number" inputmode="decimal" step="0.5" min="1"></label>
    <label data-for="libre" hidden>Describe el objetivo<input name="texto" maxlength="120"></label>
    <button class="btn primary block">Guardar objetivo</button></form>`, (m) => {
    const sel = $("#goalTipo", m);
    const upd = () => {
      m.querySelectorAll("[data-for]").forEach((l) => (l.hidden = !l.dataset.for.split(" ").includes(sel.value)));
      $("#goalValLabel", m).textContent = { ejercicio: "Peso objetivo (kg)", sesiones: "Número de entrenamientos", peso_corporal: "Peso objetivo (kg)" }[sel.value] || "";
    };
    sel.addEventListener("change", upd); upd();
  });
}

// PERFIL
function viewProfile() {
  const p = store.obj("profile");
  const st = drive.getStatus();
  return `
  <header class="page-h"><h1>Perfil</h1></header>
  ${p ? `<section class="card"><div class="profile-top">${avatarHtml(p, "lg")}<div><h3>${esc(p.nombre)}</h3>
      <div class="row-btns"><label class="btn ghost small">Cambiar foto<input type="file" accept="image/*" id="avatarFile" hidden></label>${p.avatar ? `<button class="btn danger-ghost small" data-act="removeAvatar">Quitar</button>` : ""}<a class="btn ghost small" href="#/formulario">Editar perfil</a></div></div></div>
    ${drive.getUser()?.email ? `<p class="muted small">${esc(drive.getUser().email)}</p>` : ""}<p class="muted small">${[p.edad && `${p.edad} años`, p.peso && `${fmt(+p.peso)} kg`, p.altura && `${p.altura} cm`].filter(Boolean).join(" · ")}</p>
    <p>${P.LEVELS[p.experiencia]?.label} · ${P.GOALS[p.objetivo]?.label} · ${p.dias} días · ${p.duracion} min</p></section>` : `<a class="btn primary block" href="#/formulario">Crear perfil</a>`}
  <section class="card sync-card"><h3>Sincronización con Google Drive</h3>
    <p class="muted small">Tus datos se guardan en este dispositivo y, si conectas Google, en una carpeta privada de tu Drive que solo ve esta app. Así los tienes en el iPhone, la tablet y el ordenador.</p>
    <p class="sync-state" data-state="${st.state}">● ${esc(st.msg)}${st.last ? ` · ${st.last.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}` : ""}</p>
    ${drive.clientId() ? `
      ${st.state === "off" ? `<button class="btn primary block" data-act="driveConnect">Conectar con Google</button>` : `<button class="btn primary block" data-act="driveSync">Sincronizar ahora</button><button class="btn ghost block" data-act="driveDisconnect">Desconectar</button>`}
      <details><summary class="small">ID de cliente de Google</summary><form id="cidForm" class="inline-form"><input name="cid" value="${esc(drive.clientId())}" aria-label="ID de cliente"><button class="btn ghost small">Guardar</button></form></details>`
    : `<p class="small">Falta el <b>ID de cliente de Google</b>. Créalo una vez siguiendo las instrucciones del archivo LEEME y pégalo aquí:</p>
      <form id="cidForm" class="inline-form"><input name="cid" placeholder="xxxx.apps.googleusercontent.com" aria-label="ID de cliente"><button class="btn primary small">Guardar</button></form>`}
  </section>
  <section class="card"><h3>Copia de seguridad</h3>
    <p class="muted small">Descarga o restaura todos tus datos en un archivo.</p>
    <div class="row-btns"><button class="btn ghost small" data-act="export">Exportar</button><label class="btn ghost small">Importar<input type="file" accept="application/json,.json" id="importFile" hidden></label></div>
    <button class="btn danger-ghost small" data-act="wipe">Borrar datos de este dispositivo</button>
  </section>
  ${appearanceHtml()}
  <section class="card"><h3>Ajustes</h3>
    <label class="switch"><input type="checkbox" data-act-change="sound" ${store.get().settings?.sonido !== false ? "checked" : ""}> Sonido al terminar el descanso</label>
  </section>
  <section class="card"><h3>Referencias científicas</h3><ol class="refs small">${P.REFERENCES.map((r) => `<li>${esc(r)}</li>`).join("")}</ol>
  <p class="muted small">Esta app no sustituye el consejo médico. Si tienes dolor o una lesión, consulta a un profesional.</p></section>`;
}

function appearanceHtml() {
  const t = theme.resolve(store.get().settings?.tema);
  const custom = t.preset === "custom";
  return `<section class="card"><h3>Apariencia</h3>
    <p class="small muted">Modo</p>
    <div class="seg" role="radiogroup" aria-label="Modo de color">${[["sistema", "Sistema"], ["claro", "Claro"], ["oscuro", "Oscuro"]].map(([v, l]) => `<button role="radio" aria-checked="${t.modo === v}" class="${t.modo === v ? "on" : ""}" data-act="themeMode" data-v="${v}">${l}</button>`).join("")}</div>
    <p class="small muted">Tema de color</p>
    <div class="swatches">${theme.PRESETS.map((x) => `<button class="swatch ${t.preset === x.id ? "on" : ""}" data-act="themePreset" data-v="${x.id}" aria-label="${x.nombre}" aria-pressed="${t.preset === x.id}"><i style="background:${x.acento}"></i><span>${x.nombre}</span></button>`).join("")}
      <button class="swatch ${custom ? "on" : ""}" data-act="themePreset" data-v="custom" aria-pressed="${custom}"><i class="rainbow"></i><span>Mío</span></button></div>
    ${custom ? `<div class="custom-colors">
      <label>Color principal<input type="color" value="${t.acento}" data-theme-color="acento"></label>
      <label>Tono del fondo<input type="color" value="${t.fondo || "#808080"}" data-theme-color="fondo"></label>
      <button class="btn ghost small" data-act="themeNeutral">Fondo neutro</button></div>` : ""}
  </section>`;
}
function saveTheme(patch) {
  const cur = theme.resolve(store.get().settings?.tema);
  const tema = { ...store.get().settings?.tema, ...patch };
  if (patch.preset === "custom" && !patch._keep) { tema.acento = cur.acento; tema.fondo = cur.fondo; }
  delete tema._keep;
  store.setObject("settings", { ...store.get().settings, tema });
  theme.apply(tema);
  rerenderKeepScroll();
}

// ---------- eventos ----------
const actions = {
  closeModal,
  start: (b) => startWorkout(+b.dataset.day),
  showSession: (b) => {
    const s = store.live("sessions").find((x) => x.id === b.dataset.id);
    if (!s) return;
    modal(`<h2>${esc(s.diaNombre)}</h2><p class="muted">${fmtDate(s.fecha, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · ${Math.round(s.duracionSeg / 60)} min</p>
      ${s.ejercicios.map((e) => `<div class="hist-ex"><b>${esc(exName(e.exId, e.variante))}</b><span>${e.sets.map((x) => (x.seg && !x.reps ? `${x.seg} s` : `${fmt(x.peso)}×${x.reps}`)).join(" · ")}</span></div>`).join("")}
      <button class="btn danger-ghost block" data-act="delSession" data-id="${s.id}">Borrar este entreno</button>`);
  },
  delSession: (b) => { if (confirmBox("¿Borrar este entreno?")) { store.remove("sessions", b.dataset.id); closeModal(); render(); } },
  saveProfileOnly: () => {
    const f = $("#profileForm");
    if (!f.reportValidity()) return;
    store.setObject("profile", { ...store.obj("profile"), ...readForm(f) });
    toast("Perfil guardado"); location.hash = "#/perfil";
  },
  exMenu: (b) => {
    const di = +b.dataset.day, ei = +b.dataset.i, r = store.obj("routine"), e = r.dias[di].ejercicios[ei], ex = byId[e.exId];
    const alts = EXERCISES.filter((x) => x.musculo === ex.musculo && x.id !== ex.id);
    modal(`<h2>${esc(ex.nombre)}</h2>
      <h3>Variante</h3><div class="opt-list">${ex.variantes.map((v, i) => `<button class="opt-btn ${i === e.variante ? "on" : ""}" data-act="setVariant" data-day="${di}" data-i="${ei}" data-v="${i}">${animSvg(v.anim, "thumb")}<span><b>${esc(v.nombre)}</b><small>${VARIANT_LABEL[v.tipo]}</small></span></button>`).join("")}</div>
      ${alts.length ? `<h3>Cambiar por otro ejercicio</h3><div class="opt-list">${alts.map((x) => `<button class="opt-btn" data-act="swapEx" data-day="${di}" data-i="${ei}" data-ex="${x.id}"><span><b>${esc(x.nombre)}</b><small>${MUSCLES[x.musculo]}</small></span></button>`).join("")}</div>` : ""}
      <div class="row-btns"><button class="btn ghost small" data-act="moveEx" data-day="${di}" data-i="${ei}" data-d="-1">↑ Subir</button><button class="btn ghost small" data-act="moveEx" data-day="${di}" data-i="${ei}" data-d="1">↓ Bajar</button><button class="btn danger-ghost small" data-act="removeEx" data-day="${di}" data-i="${ei}">Quitar</button></div>`);
  },
  setVariant: (b) => editRoutine((r) => (r.dias[+b.dataset.day].ejercicios[+b.dataset.i].variante = +b.dataset.v), true),
  swapEx: (b) => editRoutine((r) => {
    const slot = r.dias[+b.dataset.day].ejercicios[+b.dataset.i];
    const ex = byId[b.dataset.ex];
    const v = P.pickVariant(ex, store.obj("profile")) ?? 0;
    Object.assign(slot, { exId: ex.id, variante: v, tiempo: !!ex.tiempo });
    if (ex.tiempo) Object.assign(slot, { repMin: 30, repMax: 60 });
  }, true),
  moveEx: (b) => editRoutine((r) => {
    const arr = r.dias[+b.dataset.day].ejercicios, i = +b.dataset.i, j = i + +b.dataset.d;
    if (j >= 0 && j < arr.length) [arr[i], arr[j]] = [arr[j], arr[i]];
  }, true),
  removeEx: (b) => editRoutine((r) => r.dias[+b.dataset.day].ejercicios.splice(+b.dataset.i, 1), true),
  addEx: (b) => pickExercise((ex) => editRoutine((r) => {
    const p = store.obj("profile");
    const comp = ex.tipo === "compuesto";
    r.dias[+b.dataset.day].ejercicios.push({ exId: ex.id, variante: P.pickVariant(ex, p) ?? 0, series: 3, repMin: ex.tiempo ? 30 : comp ? 6 : 10, repMax: ex.tiempo ? 60 : comp ? 10 : 15, rir: 2, descanso: comp ? 150 : 90, tiempo: !!ex.tiempo });
  }, true)),
  technique: (b) => { location.hash = `#/ejercicio/${b.dataset.ex}/${b.dataset.v}`; },
  wexMenu: (b) => {
    const a = store.getActive(), ei = +b.dataset.i, e = a.ejercicios[ei], ex = byId[e.exId];
    modal(`<h2>${esc(ex.nombre)}</h2><h3>Variante para hoy</h3><div class="opt-list">${ex.variantes.map((v, i) => `<button class="opt-btn ${i === e.variante ? "on" : ""}" data-act="wexVariant" data-i="${ei}" data-v="${i}">${animSvg(v.anim, "thumb")}<span><b>${esc(v.nombre)}</b><small>${VARIANT_LABEL[v.tipo]}</small></span></button>`).join("")}</div>
      <div class="row-btns"><a class="btn ghost small" href="#/ejercicio/${e.exId}/${e.variante}" data-act="closeModal">Ver técnica</a><button class="btn danger-ghost small" data-act="wexRemove" data-i="${ei}">Quitar de hoy</button></div>`);
  },
  wexVariant: (b) => { updateActive((a) => (a.ejercicios[+b.dataset.i].variante = +b.dataset.v)); closeModal(); },
  wexRemove: (b) => { updateActive((a) => a.ejercicios.splice(+b.dataset.i, 1)); closeModal(); },
  addWorkoutEx: () => pickExercise((ex) => updateActive((a) => {
    const p = store.obj("profile"), comp = ex.tipo === "compuesto";
    const slot = { exId: ex.id, variante: P.pickVariant(ex, p) ?? 0, series: 3, repMin: ex.tiempo ? 30 : comp ? 6 : 10, repMax: ex.tiempo ? 60 : comp ? 10 : 15, rir: 2, descanso: comp ? 150 : 90, tiempo: !!ex.tiempo };
    a.ejercicios.push({ exId: ex.id, variante: slot.variante, slot, sets: Array.from({ length: 3 }, () => ({ peso: "", reps: "", seg: "", hecho: false })) });
  })),
  toggleSet: (b) => {
    timer.unlockAudio();
    const ei = +b.dataset.e, si = +b.dataset.s;
    let startRest = false, rest = 0, label = "";
    updateActive((a) => {
      const e = a.ejercicios[ei], st = e.sets[si];
      st.hecho = !st.hecho;
      if (st.hecho) {
        if (!e.slot.tiempo && !st.reps) st.reps = e.slot.repMax;
        // copia el peso a las series siguientes vacías
        e.sets.slice(si + 1).forEach((x) => { if (!x.hecho && x.peso === "") x.peso = st.peso; });
        startRest = true; rest = e.slot.descanso;
        const nextLeft = e.sets.some((x) => !x.hecho);
        label = nextLeft ? `Siguiente: serie ${e.sets.findIndex((x) => !x.hecho) + 1} de ${exName(e.exId, e.variante)}` : (a.ejercicios[ei + 1] ? `Siguiente: ${exName(a.ejercicios[ei + 1].exId, a.ejercicios[ei + 1].variante)}` : "Último ejercicio completado");
      }
    });
    if (startRest) {
      const r = timer.startRest(rest, label);
      updateActive((a) => (a.rest = r), false);
    }
  },
  addSet: (b) => updateActive((a) => { const e = a.ejercicios[+b.dataset.e]; const l = e.sets[e.sets.length - 1]; e.sets.push({ peso: l?.peso ?? "", reps: "", seg: "", hecho: false }); }),
  delSet: (b) => updateActive((a) => a.ejercicios[+b.dataset.e].sets.pop()),
  workTimer: (b) => {
    timer.unlockAudio();
    const ei = +b.dataset.e, si = +b.dataset.s, a = store.getActive(), e = a.ejercicios[ei];
    timer.startWork({ target: e.slot.repMin, label: `${exName(e.exId, e.variante)} · serie ${si + 1}`, onStop: (secs) => updateActive((x) => { x.ejercicios[ei].sets[si].seg = secs; }) });
  },
  stopwatch: () => { timer.unlockAudio(); timer.startWork({ label: "Cronómetro" }); },
  restNow: () => { timer.unlockAudio(); const r = timer.startRest(90, "Descanso"); updateActive((a) => (a.rest = r), false); },
  finish: () => { if (confirmBox("¿Terminar y guardar el entreno?")) finishWorkout(); },
  discard: () => { if (confirmBox("¿Descartar este entreno? Se perderán las series.")) discardWorkout(); },
  filterM: (b) => { exFilter.m = b.dataset.v; render(); },
  filterT: (b) => { exFilter.t = b.dataset.v; render(); },
  delBw: (b) => { store.remove("bodyweight", b.dataset.id); rerenderKeepScroll(); },
  newGoal: goalForm,
  newAch: () => achForm(),
  delGoal: (b) => { if (confirmBox("¿Borrar objetivo?")) { store.remove("goals", b.dataset.id); rerenderKeepScroll(); } },
  goalDone: (b) => { const g = store.live("goals").find((x) => x.id === b.dataset.id); store.upsert("goals", { ...g, cumplido: today() }); rerenderKeepScroll(); },
  goalToAch: (b) => { const g = store.live("goals").find((x) => x.id === b.dataset.id); achForm({ titulo: goalTitle(g), emoji: "🎯", goalId: g.id }); },
  delAch: (b) => { if (confirmBox("¿Borrar logro?")) { store.remove("achievements", b.dataset.id); rerenderKeepScroll(); } },
  driveConnect: async () => {
    const onForm = document.body.dataset.route === "formulario";
    try {
      await drive.connect();
      const hasProfile = !!store.obj("profile");
      fillFromGoogle();
      toast(onForm && hasProfile ? "Datos recuperados de tu Drive" : "Conectado con Google");
      if (onForm && hasProfile) { location.hash = "#/hoy"; return; }
    } catch (e) { toast(e.message); }
    render();
  },
  driveSync: async () => { try { if (drive.hasToken()) await drive.sync(); else await drive.connect(); toast("Sincronizado"); } catch (e) { if (e.message !== "expired") toast(e.message); } render(); },
  driveDisconnect: () => { if (confirmBox("¿Desconectar Google Drive? Tus datos se quedan en este dispositivo.")) { drive.disconnect(); render(); } },
  themeMode: (b) => saveTheme({ modo: b.dataset.v }),
  themePreset: (b) => saveTheme({ preset: b.dataset.v }),
  themeNeutral: () => saveTheme({ preset: "custom", fondo: null, _keep: 1 }),
  removeAvatar: () => { store.setObject("profile", { ...store.obj("profile"), avatar: null }); render(); },
  wipe: () => {
    if (!confirmBox("¿Borrar todos los datos de este dispositivo? Si estás conectado a Google, tu copia en Drive no se borra.")) return;
    drive.disconnect();
    store.setActive(null);
    store.replaceAll({}, "wipe");
    location.hash = "#/formulario";
  },
  export: () => {
    const blob = new Blob([store.exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `gymapp-${today()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};
// Completa nombre y foto del perfil con la cuenta de Google si están vacíos.
function fillFromGoogle() {
  const g = drive.getUser(), p = store.obj("profile");
  if (!g || !p) return;
  const patch = {};
  if (!p.nombre && g.nombre) patch.nombre = g.nombre;
  if (!p.avatar && g.foto) patch.avatar = g.foto;
  if (Object.keys(patch).length) store.setObject("profile", { ...p, ...patch });
}
function editRoutine(fn, close) {
  const r = structuredClone(store.obj("routine"));
  fn(r);
  store.setObject("routine", r);
  if (close) closeModal();
  rerenderKeepScroll();
}
function pickExercise(cb) {
  modal(`<h2>Elegir ejercicio</h2><input class="search" type="search" placeholder="Buscar…" id="pickQ"><div class="opt-list" id="pickList">${EXERCISES.map((x) => `<button class="opt-btn" data-pick="${x.id}">${animSvg(x.variantes[0].anim, "thumb")}<span><b>${esc(x.nombre)}</b><small>${MUSCLES[x.musculo]}</small></span></button>`).join("")}</div>`, (m) => {
    $("#pickQ", m).addEventListener("input", (ev) => {
      const q = ev.target.value.toLowerCase();
      m.querySelectorAll("[data-pick]").forEach((b) => (b.hidden = !b.textContent.toLowerCase().includes(q)));
    });
    m.querySelector("#pickList").addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-pick]");
      if (!b) return;
      closeModal();
      cb(byId[b.dataset.pick]);
    });
  });
}

document.addEventListener("click", (ev) => {
  if (ev.target.id === "modal") return closeModal();
  const b = ev.target.closest("[data-act]");
  if (!b || b.disabled) return;
  const fn = actions[b.dataset.act];
  if (!fn) return;
  if (b.tagName !== "A") ev.preventDefault();
  fn(b, ev);
});
document.addEventListener("input", (ev) => {
  const t = ev.target;
  if (t.dataset.filter) {
    exFilter.q = t.value;
    const pos = t.selectionStart;
    render();
    const n = $(".search"); n.focus(); n.setSelectionRange(pos, pos);
  }
  if (t.dataset.set) {
    updateActive((a) => (a.ejercicios[+t.dataset.e].sets[+t.dataset.s][t.dataset.set] = t.value), false);
  }
});
document.addEventListener("change", (ev) => {
  const t = ev.target;
  if (t.dataset.edit) {
    const v = Math.max(1, +t.value || 1);
    editRoutine((r) => (r.dias[+t.dataset.day].ejercicios[+t.dataset.i][t.dataset.edit] = v));
  }
  if (t.dataset.actChange === "progEx") { progEx = t.value; rerenderKeepScroll(); }
  if (t.dataset.actChange === "sound") { store.setObject("settings", { ...store.get().settings, sonido: t.checked }); timer.setSound(t.checked); }
  if (t.dataset.themeColor) {
    const tema = { ...store.get().settings?.tema, preset: "custom", [t.dataset.themeColor]: t.value };
    store.setObject("settings", { ...store.get().settings, tema });
    theme.apply(tema);
  }
  if ((t.id === "avatarFile" || t.id === "formAvatar") && t.files[0]) {
    theme.avatarFromFile(t.files[0]).then((url) => {
      if (t.id === "formAvatar") { pendingAvatar = url; $("#formAvatarPreview").innerHTML = avatarHtml({ avatar: url }, "lg"); }
      else { store.setObject("profile", { ...store.obj("profile"), avatar: url }); render(); toast("Foto actualizada"); }
    }).catch((e) => toast(e.message));
  }
  if (t.id === "importFile" && t.files[0]) {
    t.files[0].text().then((txt) => { try { store.importJson(txt); toast("Datos importados"); render(); } catch (e) { toast("No se pudo importar: " + e.message); } });
  }
});
document.addEventListener("submit", (ev) => {
  const f = ev.target;
  ev.preventDefault();
  if (f.id === "profileForm") {
    const p = { ...store.obj("profile"), ...readForm(f) };
    const first = !store.obj("profile");
    store.setObject("profile", p);
    store.setObject("routine", P.generateRoutine(p));
    if (first && !store.live("goals").length) {
      for (const g of P.suggestedGoals(p)) store.upsert("goals", { ...g, creado: today(), inicio: g.tipo === "peso_corporal" ? +p.peso : undefined });
      if (p.peso) store.upsert("bodyweight", { fecha: today(), kg: +p.peso });
    }
    toast(first ? "¡Rutina creada!" : "Rutina regenerada");
    location.hash = "#/rutina";
  }
  if (f.id === "achForm") {
    const d = Object.fromEntries(new FormData(f));
    store.upsert("achievements", { emoji: d.emoji, titulo: d.titulo, descripcion: d.descripcion, fecha: d.fecha });
    if (d.goalId) { const g = store.live("goals").find((x) => x.id === d.goalId); if (g) store.upsert("goals", { ...g, logro: true }); }
    closeModal(); toast("¡Logro guardado! 🏆");
    location.hash = "#/logros"; render();
  }
  if (f.id === "goalForm") {
    const d = Object.fromEntries(new FormData(f));
    if (d.tipo !== "libre" && !(+d.valor > 0)) { toast("Indica un valor"); return; }
    if (d.tipo === "libre" && !d.texto) { toast("Describe el objetivo"); return; }
    const bw = store.live("bodyweight").sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
    store.upsert("goals", { tipo: d.tipo, exId: d.tipo === "ejercicio" ? d.exId : undefined, valor: +d.valor || 0, reps: 1, texto: d.texto || "", creado: today(), inicio: d.tipo === "peso_corporal" ? bw?.kg ?? +store.obj("profile")?.peso : undefined });
    checkGoals();
    closeModal(); render();
  }
  if (f.id === "bwForm") {
    const d = Object.fromEntries(new FormData(f));
    store.upsert("bodyweight", { fecha: d.fecha, kg: +d.kg });
    checkGoals();
    rerenderKeepScroll();
  }
  if (f.id === "cidForm") {
    drive.setClientId(f.cid.value);
    toast("ID guardado"); render();
  }
});

$("#sync").addEventListener("click", async () => {
  if (!drive.clientId() || drive.getStatus().state === "off") { location.hash = "#/perfil"; return; }
  try { if (drive.hasToken()) await drive.sync(); else await drive.connect(); } catch (e) { if (e.message !== "expired") toast(e.message); }
});
drive.onStatus(() => { renderSyncChip(); if (document.body.dataset.route === "perfil" || (document.body.dataset.route === "formulario" && !store.obj("profile") && drive.getUser() && !$("input[name=nombre]")?.value)) render(); });
store.subscribe((_, source) => {
  if (source === "sync" || source === "wipe") theme.apply(store.get().settings?.tema);
  if (source === "sync" && document.body.dataset.route !== "entreno") rerenderKeepScroll();
});

// reloj del entreno
setInterval(() => {
  const a = store.getActive(), el = $("#elapsed");
  if (a && el) el.textContent = timer.mmss((Date.now() - a.inicio) / 1000);
}, 1000);
timer.onTimerChange(() => { const a = store.getActive(); if (a?.rest) { a.rest = null; store.setActive(a); } });

window.addEventListener("hashchange", () => { closeModal(); render(); scrollTo(0, 0); });
timer.setSound(store.get().settings?.sonido !== false);
theme.apply(store.get().settings?.tema);

// restaura el descanso si se recargó la página
const act = store.getActive();
if (act?.rest && act.rest.end > Date.now()) timer.startRest(0, act.rest.label, act.rest);

render();
if (drive.getStatus().state === "ok") drive.sync().catch(() => {});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
