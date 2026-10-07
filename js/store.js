// Estado de la app: se guarda en localStorage y se fusiona con la copia de Google Drive.
const KEY = "gymapp:data";
const ACTIVE_KEY = "gymapp:active"; // entreno en curso (solo en este dispositivo)
const COLLECTIONS = ["sessions", "achievements", "goals", "bodyweight"];
const OBJECTS = ["profile", "routine", "settings"];

const empty = () => ({ version: 1, resetAt: 0, profile: null, routine: null, settings: { sonido: true, updatedAt: 0 }, sessions: [], achievements: [], goals: [], bodyweight: [] });

const listeners = new Set();
let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export const now = () => Date.now();
export const uid = () => now().toString(36) + Math.random().toString(36).slice(2, 7);
export const get = () => state;
export const live = (name) => state[name].filter((x) => !x.deleted);

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit(source) { persist(); listeners.forEach((fn) => fn(state, source)); }

export function setObject(name, value) {
  state[name] = value ? { ...value, updatedAt: now() } : { deleted: true, updatedAt: now() };
  emit("local");
}
export function upsert(name, item) {
  const it = { ...item, id: item.id || uid(), updatedAt: now() };
  const i = state[name].findIndex((x) => x.id === it.id);
  if (i >= 0) state[name][i] = it; else state[name].push(it);
  emit("local");
  return it;
}
export function remove(name, id) {
  const i = state[name].findIndex((x) => x.id === id);
  if (i >= 0) { state[name][i] = { id, deleted: true, updatedAt: now() }; emit("local"); }
}
export function obj(name) {
  const o = state[name];
  return o && !o.deleted ? o : null;
}

// Fusión sin conflictos: por cada elemento gana la versión editada más recientemente.
// resetAt: fecha del último «borrar todo»; lo anterior se descarta en todos los dispositivos.
export function merge(a, b) {
  const out = empty();
  const r = (out.resetAt = Math.max(a?.resetAt || 0, b?.resetAt || 0));
  const fresh = (x) => x && (x.updatedAt || 0) >= r;
  for (const k of OBJECTS) {
    const x = fresh(a?.[k]) ? a[k] : null, y = fresh(b?.[k]) ? b[k] : null;
    out[k] = (x?.updatedAt || 0) >= (y?.updatedAt || 0) ? x ?? y ?? out[k] : y;
  }
  for (const k of COLLECTIONS) {
    const map = new Map();
    for (const it of [...(a?.[k] || []), ...(b?.[k] || [])].filter(fresh)) {
      const prev = map.get(it.id);
      if (!prev || (it.updatedAt || 0) > (prev.updatedAt || 0)) map.set(it.id, it);
    }
    out[k] = [...map.values()];
  }
  return out;
}
export function replaceAll(data, source = "sync") {
  state = { ...empty(), ...data };
  emit(source);
}

// Borra todo y marca la fecha para que la copia de Drive y otros dispositivos también lo descarten al sincronizar.
export function wipe(everywhere) {
  setActive(null);
  state = { ...empty(), resetAt: everywhere ? now() : 0 };
  emit("wipe");
}

export function exportJson() { return JSON.stringify(state, null, 2); }
export function importJson(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== "object" || !Array.isArray(data.sessions)) throw new Error("Archivo no válido");
  replaceAll(merge(state, data), "local");
}

export function getActive() { try { return JSON.parse(localStorage.getItem(ACTIVE_KEY)); } catch { return null; } }
export function setActive(s) { try { s ? localStorage.setItem(ACTIVE_KEY, JSON.stringify(s)) : localStorage.removeItem(ACTIVE_KEY); } catch {} }
