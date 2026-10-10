// Sincronización con Google Drive: guarda un único JSON en la carpeta oculta de la app (appDataFolder).
// Solo la app puede ver ese archivo; no aparece en tu Drive ni accede a tus otros archivos.
import { GOOGLE_CLIENT_ID } from "./config.js";
import * as store from "./store.js";

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const SCOPE = "openid email profile " + DRIVE_SCOPE;
const NO_DRIVE = "Falta el permiso de Drive: vuelve a conectar y, en la ventana de Google, marca la casilla para que Gym App guarde sus datos en tu Drive.";
const USER_KEY = "gymapp:googleUser";
const FILE = "gymapp-data.json";
const TOKEN_KEY = "gymapp:token";
const CONNECTED_KEY = "gymapp:driveConnected";
const CID_KEY = "gymapp:clientId";
// Cuenta de Google a la que pertenecen los datos guardados en este dispositivo.
const OWNER_KEY = "gymapp:owner";
export const owner = () => localStorage.getItem(OWNER_KEY) || "";
export const forgetOwner = () => localStorage.removeItem(OWNER_KEY);

let token = null;
let tokenClient = null;
let fileId = null;
let pushTimer = null;
let status = { state: "off", msg: "Sin conectar", last: null };
const listeners = new Set();

export const clientId = () => localStorage.getItem(CID_KEY) || GOOGLE_CLIENT_ID || "";
export const setClientId = (v) => { localStorage.setItem(CID_KEY, v.trim()); tokenClient = null; };
// Datos básicos de la cuenta de Google (nombre, correo, foto) para rellenar el perfil.
export const getUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };
async function fetchUser() {
  try {
    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${token.value}` } });
    if (!r.ok) return;
    const u = await r.json();
    const user = { nombre: u.given_name || u.name || "", nombreCompleto: u.name || "", email: u.email || "", foto: u.picture ? u.picture.replace(/=s\d+(-c)?$/, "") + "=s256-c" : "" };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}
if (!owner() && getUser()?.email) localStorage.setItem(OWNER_KEY, getUser().email);
export const wasConnected = () => localStorage.getItem(CONNECTED_KEY) === "1";
export const getStatus = () => status;
export const onStatus = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
function setStatus(state, msg) {
  status = { ...status, state, msg, last: state === "ok" ? new Date() : status.last };
  listeners.forEach((f) => f(status));
}

try {
  const t = JSON.parse(localStorage.getItem(TOKEN_KEY));
  if (t && t.exp > Date.now() + 60000) token = t;
} catch {}
if (token) setStatus("ok", "Conectado");
else if (wasConnected()) setStatus("expired", "Toca para sincronizar");

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = res;
    s.onerror = () => rej(new Error("No se pudo cargar Google (¿sin conexión?)"));
    document.head.appendChild(s);
  });
}

// Debe llamarse desde un toque del usuario (abre la ventana de Google).
// opts.expect: correo que debe usarse (si entra otra cuenta, no se toca nada).
// opts.beforeSync: se ejecuta tras comprobar la cuenta y antes de sincronizar.
// Si entra una cuenta distinta de la dueña de los datos locales, esos datos se quitan de este
// dispositivo (siguen en el Drive de su dueño) para no mezclar las cuentas.
export async function connect(opts = {}) {
  if (!clientId()) throw new Error("Falta el ID de cliente de Google (ver Perfil → Sincronización).");
  await loadGis();
  return new Promise((resolve, reject) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId(),
      scope: SCOPE,
      callback: async (resp) => {
        if (resp.error) { setStatus("error", "Google rechazó el acceso"); return reject(new Error(resp.error)); }
        // Google deja desmarcar permisos: sin el de Drive no se puede sincronizar.
        if (!google.accounts.oauth2.hasGrantedAllScopes(resp, DRIVE_SCOPE)) {
          google.accounts.oauth2.revoke(resp.access_token, () => {});
          localStorage.removeItem(CONNECTED_KEY);
          setStatus("error", NO_DRIVE);
          return reject(new Error(NO_DRIVE));
        }
        token = { value: resp.access_token, exp: Date.now() + (resp.expires_in - 60) * 1000 };
        localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
        localStorage.setItem(CONNECTED_KEY, "1");
        await fetchUser();
        const email = getUser()?.email || "";
        if (opts.expect && email && email !== opts.expect) {
          google.accounts.oauth2.revoke(resp.access_token, () => {});
          token = null; localStorage.removeItem(TOKEN_KEY);
          setStatus("expired", "Toca para sincronizar");
          return reject(new Error(`Has entrado con ${email}, pero los datos son de ${opts.expect}. No se ha borrado nada.`));
        }
        if (email && owner() && owner() !== email) { store.wipe(false); fileId = null; }
        if (email) localStorage.setItem(OWNER_KEY, email);
        try { opts.beforeSync?.(); await sync(); resolve(); } catch (e) { reject(e); }
      },
      error_callback: (e) => { setStatus(wasConnected() ? "expired" : "off", "No se completó el inicio de sesión"); reject(new Error(e?.message || "Ventana cerrada")); },
    });
    const hint = opts.expect || owner();
    tokenClient.requestAccessToken({ prompt: wasConnected() ? "" : "consent", ...(hint ? { login_hint: hint } : {}) });
  });
}

export function disconnect() {
  if (token && window.google?.accounts?.oauth2) google.accounts.oauth2.revoke(token.value, () => {});
  token = null; fileId = null; gen++; clearTimeout(pushTimer);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CONNECTED_KEY);
  localStorage.removeItem(USER_KEY);
  setStatus("off", "Sin conectar");
}

const valid = () => !!token && token.exp > Date.now();
export const hasToken = valid;

async function api(url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { Authorization: `Bearer ${token.value}`, ...(opts.headers || {}) } });
  if (r.status === 401) {
    token = null; localStorage.removeItem(TOKEN_KEY);
    setStatus("expired", "Sesión de Google caducada: toca para sincronizar");
    throw new Error("expired");
  }
  if (!r.ok) {
    let reason = "";
    try { reason = (await r.json()).error?.errors?.[0]?.reason || ""; } catch {}
    if (r.status === 403 && /insufficient/i.test(reason)) {
      token = null; localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(CONNECTED_KEY);
      throw new Error(NO_DRIVE);
    }
    if (r.status === 403 && /accessNotConfigured|SERVICE_DISABLED/i.test(reason)) throw new Error("La API de Google Drive no está activada en el proyecto de Google Cloud.");
    throw new Error(`Drive respondió ${r.status}${reason ? ` (${reason})` : ""}`);
  }
  return r;
}

async function findFile() {
  if (fileId) return fileId;
  const q = encodeURIComponent(`name='${FILE}'`);
  const r = await api(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&orderBy=modifiedTime%20desc`);
  const j = await r.json();
  fileId = j.files?.[0]?.id || null;
  return fileId;
}

async function download() {
  const id = await findFile();
  if (!id) return null;
  const r = await api(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`);
  return r.json();
}

async function upload(data) {
  const body = JSON.stringify(data);
  const id = await findFile();
  if (id) {
    await api(`https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body });
    return;
  }
  const boundary = "gymapp" + Math.random().toString(36).slice(2);
  const meta = { name: FILE, parents: ["appDataFolder"], mimeType: "application/json" };
  const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
  const r = await api("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body: multipart });
  fileId = (await r.json()).id;
}

// Archivos sueltos en appDataFolder (fotos del diario): listar, subir, bajar y borrar.
export async function listFiles(prefix) {
  const out = [];
  let page = "";
  do {
    const q = encodeURIComponent(`name contains '${prefix}'`);
    const r = await api(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&pageSize=1000&fields=nextPageToken,files(id,name,modifiedTime)${page ? `&pageToken=${page}` : ""}`);
    const j = await r.json();
    out.push(...(j.files || []).filter((f) => f.name.startsWith(prefix)));
    page = j.nextPageToken || "";
  } while (page);
  return out;
}
export async function uploadBlob(name, blob) {
  const boundary = "gymapp" + Math.random().toString(36).slice(2);
  const meta = { name, parents: ["appDataFolder"], mimeType: blob.type || "image/jpeg" };
  const body = new Blob([`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: ${meta.mimeType}\r\n\r\n`, blob, `\r\n--${boundary}--`]);
  const r = await api("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body });
  return (await r.json()).id;
}
export const downloadBlob = async (id) => (await api(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`)).blob();
export const deleteFile = (id) => api(`https://www.googleapis.com/drive/v3/files/${id}`, { method: "DELETE" });

// Se avisa tras cada sincronización correcta (con los datos ya fusionados).
const syncedHooks = new Set();
export const onSynced = (fn) => syncedHooks.add(fn);

let syncing = null;
let gen = 0; // cambia al desconectar: descarta sincronizaciones que estaban en curso
// Descarga, fusiona con lo local y sube el resultado.
export async function sync() {
  if (!valid()) { if (wasConnected()) setStatus("expired", "Toca para sincronizar"); return; }
  if (!navigator.onLine) { setStatus("pending", "Sin conexión: se sincronizará luego"); return; }
  if (syncing) return syncing;
  const myGen = gen;
  syncing = (async () => {
    setStatus("busy", "Sincronizando…");
    try {
      if (!getUser()) await fetchUser();
      const remote = await download();
      if (myGen !== gen) return; // se desconectó mientras descargaba
      const merged = store.merge(store.get(), remote || {});
      if (JSON.stringify(merged) !== JSON.stringify(store.get())) store.replaceAll(merged, "sync");
      await upload(merged);
      setStatus("ok", "Sincronizado");
      if (myGen === gen) syncedHooks.forEach((fn) => Promise.resolve().then(() => fn(merged)).catch(() => {}));
    } catch (e) {
      if (e.message !== "expired") setStatus("error", "Error al sincronizar: " + e.message);
      throw e;
    } finally {
      syncing = null;
    }
  })();
  return syncing;
}

// Tras cada cambio local, sube en unos segundos (si hay sesión válida).
store.subscribe((_, source) => {
  if (source !== "local") return;
  if (!valid()) { if (wasConnected()) setStatus("pending", "Cambios sin sincronizar: toca para sincronizar"); return; }
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => sync().catch(() => {}), 2500);
});
window.addEventListener("online", () => valid() && sync().catch(() => {}));
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && valid()) sync().catch(() => {}); });
