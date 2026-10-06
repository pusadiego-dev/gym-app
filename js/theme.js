// Apariencia: modo claro/oscuro/sistema, temas de color predeterminados y personalizado.
export const PRESETS = [
  { id: "fuego", nombre: "Fuego", acento: "#e2531f", fondo: null },
  { id: "oceano", nombre: "Océano", acento: "#2a78d6", fondo: "#2a78d6" },
  { id: "bosque", nombre: "Bosque", acento: "#1f9d55", fondo: "#1f9d55" },
  { id: "uva", nombre: "Uva", acento: "#7c4dff", fondo: "#7c4dff" },
  { id: "chicle", nombre: "Chicle", acento: "#e0457b", fondo: "#e0457b" },
  { id: "acero", nombre: "Acero", acento: "#5b6b7f", fondo: "#5b6b7f" },
  { id: "lima", nombre: "Lima", acento: "#7fb800", fondo: null },
];
export const DEFAULT = { modo: "sistema", preset: "fuego", acento: "#e2531f", fondo: null };

function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
}
const hsl = (h, s, l) => `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function resolve(t) {
  const th = { ...DEFAULT, ...(t || {}) };
  const p = PRESETS.find((x) => x.id === th.preset);
  if (p) { th.acento = p.acento; th.fondo = p.fondo; }
  return th;
}

export function apply(t) {
  const th = resolve(t);
  const root = document.documentElement;
  if (th.modo === "claro") root.dataset.theme = "light";
  else if (th.modo === "oscuro") root.dataset.theme = "dark";
  else delete root.dataset.theme;

  const [h, s, l] = hexToHsl(th.acento);
  const accL = th.acento;
  const accD = hsl(h, Math.min(100, s + 5), Math.min(68, Math.max(l, 55)));
  const inkL = luminance(th.acento) > 0.45 ? "#111" : "#fff";
  const inkD = "#111";
  let light = `--accent:${accL};--accent-ink:${inkL};--plate:${accL};--accent-soft:color-mix(in srgb, ${accL} 16%, var(--surface));`;
  let dark = `--accent:${accD};--accent-ink:${inkD};--plate:${accD};--accent-soft:color-mix(in srgb, ${accD} 22%, var(--surface));`;
  if (th.fondo) {
    const [fh] = hexToHsl(th.fondo);
    light += `--bg:${hsl(fh, 22, 96)};--surface:${hsl(fh, 30, 99)};--surface-2:${hsl(fh, 16, 92)};--line:${hsl(fh, 14, 85)};`;
    dark += `--bg:${hsl(fh, 18, 7)};--surface:${hsl(fh, 14, 11)};--surface-2:${hsl(fh, 12, 16)};--line:${hsl(fh, 10, 23)};`;
  }
  let el = document.getElementById("theme-style");
  if (!el) { el = document.createElement("style"); el.id = "theme-style"; document.head.appendChild(el); }
  el.textContent = `:root{${light}}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${dark}}}
:root[data-theme="dark"]{${dark}}`;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.remove());
  const meta = document.createElement("meta");
  meta.name = "theme-color";
  meta.content = getComputedStyle(document.body).backgroundColor || "#111214";
  document.head.appendChild(meta);
}
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = getComputedStyle(document.body).backgroundColor;
});

// Reduce una foto a un cuadrado de 256 px (JPEG) para guardarla y sincronizarla.
export function avatarFromFile(file, size = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      c.getContext("2d").drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen")); };
    img.src = url;
  });
}
