// Fotos del diario de vacaciones. Cada foto se guarda en este dispositivo (IndexedDB) y como archivo
// suelto en la carpeta privada de la app en Google Drive («foto-<id>.jpg»). Las notas solo guardan el id.
import * as store from "./store.js";
import * as drive from "./drive.js";

const DB = "gymapp-photos", OS = "photos", PREFIX = "foto-";
const MAX_SIDE = 1600; // px del lado largo
// Las fotos sin nota se borran pasado un día (por si otro móvil aún no ha subido su nota), o al momento si se borró todo.
const GC_AGE = 24 * 3600e3;

let dbp = null;
function db() {
  if (!dbp) dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(OS);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(OS, mode), req = fn(t.objectStore(OS));
    t.oncomplete = () => res(req?.result);
    t.onerror = () => rej(t.error);
  });
}
const getRec = (id) => tx("readonly", (s) => s.get(id));
const putRec = (id, rec) => tx("readwrite", (s) => s.put(rec, id));
const delRec = (id) => tx("readwrite", (s) => s.delete(id));
const allKeys = () => tx("readonly", (s) => s.getAllKeys());

// Reduce la foto (lado largo 1600 px, JPEG) para que ocupe poco.
function shrink(file) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo leer la foto"))), "image/jpeg", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la foto")); };
    img.src = url;
  });
}

// Guarda la foto en el dispositivo y devuelve su id (la subida a Drive va después de sincronizar la nota).
export async function add(file) {
  const blob = await shrink(file), id = store.uid();
  await putRec(id, { blob, subida: false, creado: Date.now() });
  return id;
}
export async function remove(ids) {
  for (const id of ids || []) await delRec(id).catch(() => {});
}

const urls = new Map(); // id → objectURL
const downloading = new Map();
async function url(id) {
  if (urls.has(id)) return urls.get(id);
  let rec = await getRec(id).catch(() => null);
  if (!rec && drive.hasToken()) {
    if (!downloading.has(id)) downloading.set(id, (async () => {
      const f = (await drive.listFiles(PREFIX + id))[0];
      if (!f) return null;
      const r = { blob: await drive.downloadBlob(f.id), subida: true, driveId: f.id, creado: Date.now() };
      await putRec(id, r);
      return r;
    })().finally(() => downloading.delete(id)));
    rec = await downloading.get(id).catch(() => null);
  }
  if (!rec) return null;
  const u = URL.createObjectURL(rec.blob);
  urls.set(id, u);
  return u;
}

// Rellena los <img data-photo="id"> de un trozo de página.
export function hydrate(root) {
  root.querySelectorAll("img[data-photo]:not([src])").forEach((img) => {
    url(img.dataset.photo).then((u) => {
      if (u) img.src = u;
      else img.closest(".vac-photo")?.classList.add("missing");
    });
  });
}

const referenced = (data) => new Set((data.vacations || []).filter((v) => !v.deleted).flatMap((v) => (v.notas || []).flatMap((n) => n.fotos || [])));

// Tras sincronizar: sube las fotos nuevas, borra de Drive las que ya no usa ninguna nota y libera las locales borradas.
drive.onSynced(async (data) => {
  const used = referenced(data), cutoff = Math.max(Date.now() - GC_AGE, data.resetAt || 0);
  for (const id of await allKeys()) {
    const rec = await getRec(id);
    if (!rec) continue;
    if (!used.has(id)) { if (Date.now() - rec.creado > GC_AGE) await delRec(id); continue; }
    if (!rec.subida) {
      const driveId = await drive.uploadBlob(PREFIX + id + ".jpg", rec.blob);
      await putRec(id, { ...rec, subida: true, driveId });
    }
  }
  for (const f of await drive.listFiles(PREFIX)) {
    const id = f.name.slice(PREFIX.length).replace(/\.jpg$/, "");
    if (!used.has(id) && new Date(f.modifiedTime).getTime() < cutoff) await drive.deleteFile(f.id).catch(() => {});
  }
});

// Al borrar los datos (de este móvil o de todas partes), fuera también las fotos locales.
store.subscribe((_, source) => {
  if (source !== "wipe") return;
  urls.forEach((u) => URL.revokeObjectURL(u)); urls.clear();
  tx("readwrite", (s) => s.clear()).catch(() => {});
});
