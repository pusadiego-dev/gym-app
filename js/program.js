// Generador de rutinas basado en la evidencia:
// - Volumen: relación dosis-respuesta entre series semanales e hipertrofia (Schoenfeld, Ogborn y Krieger, 2017; Pelland et al., 2024).
// - Frecuencia: entrenar cada músculo al menos 2 veces por semana (Schoenfeld, Ogborn y Krieger, 2016).
// - Rangos de repeticiones y cargas: continuo de repeticiones (Schoenfeld et al., 2021) y modelos de progresión del ACSM (2009).
// - Proximidad al fallo: 0-3 repeticiones en reserva (Refalo et al., 2023).
// - Descansos: 2-3 min en multiarticulares (Schoenfeld et al., 2016).
import { byId, MUSCLES } from "./exercises.js";

export const LEVELS = {
  principiante: { label: "Principiante", desc: "Menos de 6 meses entrenando", base: 9, maxSets: 4 },
  intermedio: { label: "Intermedio", desc: "De 6 meses a 2 años", base: 12, maxSets: 5 },
  avanzado: { label: "Avanzado", desc: "De 2 a 5 años con constancia", base: 15, maxSets: 5 },
  atleta: { label: "Atleta", desc: "Más de 5 años o compites", base: 18, maxSets: 6 },
};
export const GOALS = {
  hipertrofia: { label: "Ganar músculo", factor: 1 },
  fuerza: { label: "Ganar fuerza", factor: 0.85 },
  grasa: { label: "Perder grasa manteniendo músculo", factor: 0.85 },
  salud: { label: "Salud y forma general", factor: 0.6 },
};
// Músculos que ya reciben mucho trabajo indirecto o son pequeños: menos series directas.
const MUSCLE_FACTOR = { biceps: 0.7, triceps: 0.7, gemelos: 0.7, core: 0.6, gluteos: 0.8, hombros: 0.9 };

const DAYS = {
  fbA: { nombre: "Cuerpo completo A", ex: ["sentadilla", "press_banca", "remo", "curl_femoral", "elev_laterales", "triceps_polea", "gemelos_pie", "crunch"] },
  fbB: { nombre: "Cuerpo completo B", ex: ["peso_muerto_rumano", "press_militar", "jalon", "prensa", "aperturas", "curl", "plancha"] },
  fbC: { nombre: "Cuerpo completo C", ex: ["hip_thrust", "press_inclinado", "remo", "zancadas", "deltoide_post", "triceps_overhead", "curl_martillo", "elev_piernas"] },
  torsoA: { nombre: "Torso A", ex: ["press_banca", "remo", "press_militar", "jalon", "elev_laterales", "curl", "triceps_polea"] },
  piernaA: { nombre: "Pierna A", ex: ["sentadilla", "peso_muerto_rumano", "extension_cuad", "curl_femoral", "gemelos_pie", "crunch"] },
  torsoB: { nombre: "Torso B", ex: ["press_inclinado", "jalon", "fondos", "remo", "deltoide_post", "curl_martillo", "triceps_overhead"] },
  piernaB: { nombre: "Pierna B", ex: ["prensa", "hip_thrust", "zancadas", "curl_femoral", "gemelos_sentado", "elev_piernas"] },
  empujeA: { nombre: "Empuje A", ex: ["press_banca", "press_militar", "press_inclinado", "elev_laterales", "triceps_polea", "triceps_overhead"] },
  tironA: { nombre: "Tirón A", ex: ["jalon", "remo", "deltoide_post", "curl", "curl_martillo", "crunch"] },
  empujeB: { nombre: "Empuje B", ex: ["press_inclinado", "fondos", "aperturas", "press_militar", "elev_laterales", "triceps_overhead"] },
  tironB: { nombre: "Tirón B", ex: ["peso_muerto", "remo", "jalon", "deltoide_post", "curl", "elev_piernas"] },
};
const SPLITS = {
  2: { nombre: "Cuerpo completo (2 días)", dias: ["fbA", "fbB"] },
  3: { nombre: "Cuerpo completo (3 días)", dias: ["fbA", "fbB", "fbC"] },
  4: { nombre: "Torso / Pierna", dias: ["torsoA", "piernaA", "torsoB", "piernaB"] },
  5: { nombre: "Torso / Pierna + Empuje / Tirón / Pierna", dias: ["torsoA", "piernaA", "empujeB", "tironB", "piernaB"] },
  6: { nombre: "Empuje / Tirón / Pierna x2", dias: ["empujeA", "tironA", "piernaA", "empujeB", "tironB", "piernaB"] },
};

export function weeklyTargets(p) {
  const lvl = LEVELS[p.experiencia] || LEVELS.principiante;
  const g = GOALS[p.objetivo] || GOALS.hipertrofia;
  const out = {};
  for (const m of Object.keys(MUSCLES)) {
    let s = lvl.base * g.factor * (MUSCLE_FACTOR[m] || 1);
    if ((p.prioridades || []).includes(m)) s += 4;
    out[m] = Math.max(4, Math.round(s));
  }
  return out;
}

function scheme(p, ex, isFirst) {
  const comp = ex.tipo === "compuesto";
  const beginner = p.experiencia === "principiante";
  let r;
  switch (p.objetivo) {
    case "fuerza":
      r = comp ? (isFirst ? [3, 6, 2, 210] : [6, 8, 2, 150]) : [8, 12, 1, 90];
      break;
    case "grasa":
      r = comp ? [8, 12, 2, 120] : [12, 15, 1, 60];
      break;
    case "salud":
      r = comp ? [8, 12, 3, 90] : [10, 15, 2, 60];
      break;
    default:
      r = comp ? [6, 10, 2, 150] : [10, 15, 1, 90];
  }
  let [repMin, repMax, rir, descanso] = r;
  if (beginner) rir = Math.max(rir, 2); // margen para aprender la técnica
  if (ex.tiempo) return { repMin: 30, repMax: 60, rir, descanso: 60, tiempo: true };
  return { repMin, repMax, rir, descanso };
}

export function pickVariant(ex, p) {
  const lim = p.limitaciones || [];
  const ok = ex.variantes.map((v, i) => ({ v, i })).filter(({ v }) => !(v.avoid || []).some((a) => lim.includes(a)));
  if (!ok.length) return null;
  const prefMachines = p.equipo === "maquinas" || p.experiencia === "principiante";
  const order = prefMachines ? ["maquina", "polea", "libre"] : ["libre", "polea", "maquina"];
  ok.sort((a, b) => order.indexOf(a.v.tipo) - order.indexOf(b.v.tipo) || a.i - b.i);
  return ok[0].i;
}

function resolveExercise(id, p, seen = new Set()) {
  const ex = byId[id];
  if (!ex || seen.has(id)) return null;
  if (id === "peso_muerto" && ["principiante", "intermedio"].includes(p.experiencia)) return resolveExercise("remo", p, seen.add(id));
  const v = pickVariant(ex, p);
  if (v !== null) return { ex, v };
  return ex.sustituto ? resolveExercise(ex.sustituto, p, seen.add(id)) : null;
}

export function generateRoutine(p) {
  const dias = Math.min(6, Math.max(2, +p.dias || 3));
  const split = SPLITS[dias];
  const targets = weeklyTargets(p);
  const lvl = LEVELS[p.experiencia] || LEVELS.principiante;

  // 1) Elegir ejercicios por día (evitando duplicados dentro del día)
  const days = split.dias.map((key) => {
    const used = new Set();
    const list = [];
    for (const id of DAYS[key].ex) {
      const r = resolveExercise(id, p);
      if (!r || used.has(r.ex.id)) continue;
      used.add(r.ex.id);
      list.push(r);
    }
    return { key, nombre: DAYS[key].nombre, list };
  });

  // 2) Repartir el volumen semanal de cada músculo entre sus apariciones
  const occ = {};
  days.forEach((d) => d.list.forEach(({ ex }) => (occ[ex.musculo] = (occ[ex.musculo] || 0) + 1)));

  const routineDays = days.map((d) => {
    const ejercicios = d.list.map(({ ex, v }, i) => {
      const series = Math.min(lvl.maxSets, Math.max(2, Math.round(targets[ex.musculo] / occ[ex.musculo])));
      return { exId: ex.id, variante: v, series, ...scheme(p, ex, i === 0) };
    });
    return { nombre: d.nombre, ejercicios };
  });

  // 3) Ajustar a la duración disponible recortando primero series de aislamiento
  const limit = (+p.duracion || 60) * 60;
  for (const d of routineDays) {
    let guard = 40;
    while (sessionSeconds(d) > limit && guard--) {
      const cand = [...d.ejercicios].reverse().find((e) => e.series > 2 && byId[e.exId].tipo === "aislamiento") || [...d.ejercicios].reverse().find((e) => e.series > 2);
      if (cand) cand.series--;
      else if (d.ejercicios.length > 4) d.ejercicios.pop();
      else break;
    }
  }

  return {
    id: "r" + Date.now().toString(36),
    nombre: split.nombre,
    creada: new Date().toISOString(),
    dias: routineDays,
    objetivosSemanales: targets,
  };
}

export function sessionSeconds(day) {
  // calentamiento + (trabajo ~40 s + descanso) por serie
  return 8 * 60 + day.ejercicios.reduce((s, e) => s + e.series * (40 + e.descanso), 0);
}

export function weeklySetsByMuscle(routine) {
  const out = {};
  for (const d of routine.dias) for (const e of d.ejercicios) {
    const m = byId[e.exId]?.musculo;
    if (m) out[m] = (out[m] || 0) + e.series;
  }
  return out;
}

// Explicación legible de por qué la rutina es así.
export function rationale(p, routine) {
  const lvl = LEVELS[p.experiencia]; const g = GOALS[p.objetivo];
  const lines = [
    `Distribución "${routine.nombre}": cada grupo muscular se entrena unas 2 veces por semana, lo que según el metaanálisis de Schoenfeld et al. (2016) produce más hipertrofia que 1 vez.`,
    `Volumen pensado para nivel ${lvl.label.toLowerCase()}: unas ${lvl.base} series semanales por músculo grande como punto de partida. Más series dan más crecimiento hasta un punto (Schoenfeld et al., 2017; Pelland et al., 2024), así que empezamos en la zona baja-media y subimos si progresas.`,
  ];
  if (p.objetivo === "fuerza") lines.push("Para fuerza, el primer ejercicio del día va en 3-6 repeticiones con cargas altas y 3-4 min de descanso: la especificidad de carga es clave para la fuerza máxima (Schoenfeld et al., 2021).");
  else if (p.objetivo === "grasa") lines.push("Para perder grasa, mantener un entrenamiento de fuerza exigente es lo que conserva el músculo en déficit calórico; se usan descansos algo más cortos para ahorrar tiempo.");
  else if (p.objetivo === "salud") lines.push("Para salud general se sigue la recomendación del ACSM (2009): 8-12 repeticiones, 2-3 series por grupo muscular, 2-3 días por semana.");
  else lines.push("Para hipertrofia, 6-10 repeticiones en básicos y 10-15 en aislamiento: cualquier rango entre ~6 y 30 repeticiones hace crecer el músculo si llegas cerca del fallo (Schoenfeld et al., 2021).");
  lines.push(`Intensidad: termina cada serie dejando 0-3 repeticiones en reserva (RIR). Acercarse al fallo favorece la hipertrofia, pero llegar siempre al fallo no aporta más y fatiga (Refalo et al., 2023).${p.experiencia === "principiante" ? " Como principiante, deja 2-3 en reserva para consolidar la técnica." : ""}`);
  lines.push("Progresión (doble progresión): cuando completes todas las series en el máximo del rango de repeticiones, la app te sugerirá subir el peso un 2,5-5 %.");
  if ((p.limitaciones || []).length) lines.push(`Se han evitado variantes poco recomendables con molestias de ${p.limitaciones.join(", ")}. Consulta a un profesional sanitario si hay dolor.`);
  return lines;
}

export const REFERENCES = [
  "American College of Sports Medicine (2009). Progression models in resistance training for healthy adults. Med Sci Sports Exerc, 41(3), 687-708.",
  "Schoenfeld BJ, Ogborn D, Krieger JW (2016). Effects of resistance training frequency on measures of muscle hypertrophy: a systematic review and meta-analysis. Sports Med, 46(11), 1689-1697.",
  "Schoenfeld BJ, Ogborn D, Krieger JW (2017). Dose-response relationship between weekly resistance training volume and increases in muscle mass. J Sports Sci, 35(11), 1073-1082.",
  "Schoenfeld BJ et al. (2016). Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men. J Strength Cond Res, 30(7), 1805-1812.",
  "Schoenfeld BJ, Grgic J, Van Every DW, Plotkin DL (2021). Loading recommendations for muscle strength, hypertrophy, and local endurance: a re-examination of the repetition continuum. Sports, 9(2), 32.",
  "Refalo MC et al. (2023). Influence of resistance training proximity-to-failure on skeletal muscle hypertrophy: a systematic review with meta-analysis. Sports Med, 53(3), 649-665.",
  "Pelland JC et al. (2024). The resistance training dose-response: meta-regressions exploring the effects of weekly volume and frequency on muscle hypertrophy and strength gain. SportRxiv (preprint).",
  "Maeo S et al. (2021). Greater hamstrings muscle hypertrophy but similar damage protection after training at long versus short muscle lengths. Med Sci Sports Exerc, 53(4), 825-837.",
  "Maeo S et al. (2023). Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the overhead versus neutral arm position. Eur J Sport Sci, 23(7), 1240-1250.",
];

// Progresión doble: sugerencia para hoy a partir de la última vez.
export function suggestion(slot, lastSets) {
  const ex = byId[slot.exId];
  if (!lastSets || !lastSets.length) return null;
  const done = lastSets.filter((s) => s.hecho && (s.reps || s.seg));
  if (!done.length) return null;
  if (slot.tiempo) {
    const best = Math.max(...done.map((s) => s.seg || 0));
    return { texto: best >= slot.repMax ? `Llegaste a ${best} s: añade dificultad o peso` : `Intenta superar ${best} s`, peso: null };
  }
  const w = Math.max(...done.map((s) => +s.peso || 0));
  const top = done.filter((s) => (+s.peso || 0) === w);
  const allTop = top.length >= slot.series && top.every((s) => s.reps >= slot.repMax);
  if (allTop && w > 0) {
    const lower = ["cuadriceps", "isquios", "gluteos"].includes(ex.musculo) && ex.tipo === "compuesto";
    const inc = Math.max(lower ? 5 : ex.tipo === "compuesto" ? 2.5 : 1, Math.round(w * 0.025 * 2) / 2);
    return { texto: `¡Sube peso! Prueba ${fmt(w + inc)} kg × ${slot.repMin}+`, peso: w + inc, sube: true };
  }
  const minReps = Math.min(...top.map((s) => s.reps));
  return { texto: `Mantén ${fmt(w)} kg e intenta ${Math.min(slot.repMax, minReps + 1)}+ reps`, peso: w };
}
export const fmt = (n) => (Math.round(n * 10) / 10).toString().replace(".", ",");
export const e1rm = (w, r) => (r > 0 && w > 0 ? w * (1 + Math.min(r, 15) / 30) : 0); // Epley

// Objetivos sugeridos tras el formulario (referencias orientativas por nivel, en múltiplos del peso corporal).
export function suggestedGoals(p) {
  const bw = +p.peso || 75;
  const mult = { principiante: [0.75, 1, 0.5], intermedio: [1, 1.25, 0.65], avanzado: [1.25, 1.6, 0.8], atleta: [1.5, 2, 1] }[p.experiencia] || [0.75, 1, 0.5];
  const r = (x) => Math.round((x * bw) / 2.5) * 2.5;
  const out = [
    { tipo: "ejercicio", exId: "press_banca", valor: r(mult[0]), reps: 1, texto: "" },
    { tipo: "ejercicio", exId: "sentadilla", valor: r(mult[1]), reps: 1, texto: "" },
    { tipo: "ejercicio", exId: "press_militar", valor: r(mult[2]), reps: 1, texto: "" },
    { tipo: "sesiones", valor: (+p.dias || 3) * 12, texto: "" },
  ];
  if (p.objetivo === "grasa" && p.peso) out.push({ tipo: "peso_corporal", valor: Math.round(bw * 0.95), texto: "" });
  return out;
}
