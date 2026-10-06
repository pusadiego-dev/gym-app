// Motor de animación de figuras: poses clave interpoladas y dibujadas en SVG.
// Vista lateral (mirando a la derecha) o frontal. Coordenadas en un lienzo 200x200, suelo en y=182.

const L = { torso: 50, upper: 27, fore: 25, thigh: 40, shin: 38, neck: 13, head: 9 };
const FLOOR = 182;
const rad = (d) => (d * Math.PI) / 180;
const dirDown = (a) => [Math.sin(rad(a)), Math.cos(rad(a))]; // 0 = hacia abajo, + = hacia delante
const add = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s];

// Cinemática inversa de dos segmentos: devuelve la articulación intermedia.
function ik(a, b, l1, l2, bend) {
  let dx = b[0] - a[0], dy = b[1] - a[1];
  let d = Math.hypot(dx, dy) || 0.001;
  const max = l1 + l2 - 0.01;
  if (d > max) { dx = (dx / d) * max; dy = (dy / d) * max; d = max; }
  const cos = Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const ang = Math.acos(cos);
  const base = Math.atan2(dy, dx);
  const c1 = [a[0] + l1 * Math.cos(base + ang), a[1] + l1 * Math.sin(base + ang)];
  const c2 = [a[0] + l1 * Math.cos(base - ang), a[1] + l1 * Math.sin(base - ang)];
  const pick = { f: (p) => p[0], b: (p) => -p[0], u: (p) => -p[1], d: (p) => p[1] }[bend || "f"];
  const j = pick(c1) >= pick(c2) ? c1 : c2;
  // el extremo real (si el objetivo estaba fuera de alcance queda en el borde)
  const end = [a[0] + dx, a[1] + dy];
  return [j, end];
}

function limb(root, p, k, l1, l2, defBend) {
  // k: prefijo de claves. Brazo: hand/hr/ua+fa. Pierna: ankle/th+sh.
  if (k.fk1 in p) {
    const j = add(root, dirDown(p[k.fk1]), l1);
    const e = add(j, dirDown(p[k.fk2] ?? p[k.fk1]), l2);
    return [j, e];
  }
  let target = p[k.abs];
  if (!target && k.rel && p[k.rel]) target = [root[0] + p[k.rel][0], root[1] + p[k.rel][1]];
  if (!target) return null;
  return ik(root, target, l1, l2, p[k.bend] || defBend);
}

const ARM = { fk1: "ua", fk2: "fa", abs: "hand", rel: "hr", bend: "eb" };
const ARM2 = { fk1: "ua2", fk2: "fa2", abs: "hand2", rel: "hr2", bend: "eb2" };
const LEG = { fk1: "th", fk2: "sh", abs: "ankle", bend: "kb" };
const LEG2 = { fk1: "th2", fk2: "sh2", abs: "ankle2", bend: "kb2" };

function solveSide(p) {
  const J = {};
  J.hip = p.hip;
  const up = [Math.sin(rad(p.t || 0)), -Math.cos(rad(p.t || 0))];
  J.shoulder = add(J.hip, up, L.torso);
  const hd = p.hd ?? 0; // inclinación extra de la cabeza
  const hup = [Math.sin(rad((p.t || 0) + hd)), -Math.cos(rad((p.t || 0) + hd))];
  J.head = add(J.shoulder, hup, L.neck);
  const arm = limb(J.shoulder, p, ARM, L.upper, L.fore, "d") || ik(J.shoulder, add(J.shoulder, [0, 1], 50), L.upper, L.fore, "f");
  [J.elbow, J.hand] = arm;
  const arm2 = limb(J.shoulder, p, ARM2, L.upper, L.fore, p.eb2 || p.eb || "d");
  if (arm2) [J.elbow2, J.hand2] = arm2;
  const leg = limb(J.hip, p, LEG, L.thigh, L.shin, "f") || [add(J.hip, [0, 1], L.thigh), add(J.hip, [0, 1], L.thigh + L.shin)];
  [J.knee, J.ankle] = leg;
  const leg2 = limb(J.hip, p, LEG2, L.thigh, L.shin, p.kb2 || p.kb || "f");
  if (leg2) [J.knee2, J.ankle2] = leg2;
  J.toe = p.toe || add(J.ankle, p.tr || [11, 2]);
  if (J.ankle2) J.toe2 = p.toe2 || add(J.ankle2, p.tr2 || [11, 2]);
  return J;
}

function solveFront(p) {
  // Vista frontal simétrica: ua/fa = ángulo de abducción (0 = abajo, + = hacia fuera).
  const J = {};
  const cx = p.cx ?? 100, hy = p.hipY ?? 104;
  J.hipC = [cx, hy];
  J.neckBase = [cx, hy - L.torso];
  J.head = [cx, hy - L.torso - L.neck];
  const sw = 15, hw = 8;
  const side = (s) => {
    const sh = [cx + s * sw, hy - L.torso + 3];
    const ua = p.ua ?? 5, fa = p.fa ?? ua, al = p.al ?? 1; // al: escorzo del brazo (negativo = cruza hacia dentro)
    const el = [sh[0] + s * Math.sin(rad(ua)) * L.upper * al, sh[1] + Math.cos(rad(ua)) * L.upper * Math.abs(al)];
    const ha = [el[0] + s * Math.sin(rad(fa)) * L.fore * al, el[1] + Math.cos(rad(fa)) * L.fore * Math.abs(al)];
    const hp = [cx + s * hw, hy];
    const la = p.la ?? 4;
    const kn = [hp[0] + s * Math.sin(rad(la)) * L.thigh, hp[1] + Math.cos(rad(la)) * L.thigh];
    const an = [kn[0] + s * Math.sin(rad(la * 0.3)) * L.shin, kn[1] + Math.cos(rad(la * 0.3)) * L.shin];
    return { sh, el, ha, hp, kn, an };
  };
  J.R = side(1);
  J.Lf = side(-1);
  J.hand = J.R.ha; J.hand2 = J.Lf.ha; J.elbow = J.R.el; J.elbow2 = J.Lf.el;
  return J;
}

function lerp(a, b, t) {
  if (typeof a === "number" && typeof b === "number") return a + (b - a) * t;
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => lerp(v, b[i], t));
  return a;
}
function lerpPose(A, B, t) {
  const o = {};
  for (const k of Object.keys(A)) o[k] = k in B ? lerp(A[k], B[k], t) : A[k];
  return o;
}

const seg = (a, b, w, cls = "") => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke-width="${w}" class="${cls}"/>`;
const circ = (c, r, cls) => `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="${r}" class="${cls}"/>`;

function propSvg(pr, J, pose) {
  const at = (n) => J[n || "hand"];
  switch (pr.k) {
    case "circle":
      return `<circle cx="${pr.x}" cy="${pr.y}" r="${pr.r}" class="${pr.cls || "eq"}"/>`;
    case "water":
      return `<path d="M8 ${pr.y} q 11 -4 23 0 t 23 0 t 23 0 t 23 0 t 23 0 t 23 0 t 23 0 t 23 0" class="water"/>`;
    case "rope": { // comba: lazo que gira alrededor del cuerpo según el ángulo "rope" de la pose (0 = bajo los pies)
      const h1 = J.hand, h2 = J.hand2 || J.hand, a = rad(pose.rope || 0);
      const P = [h1[0] + Math.sin(a) * 50, h1[1] + 14 + Math.cos(a) * 92];
      const v = [(P[0] - h1[0]) / 0.75, (P[1] - h1[1]) / 0.75], len = Math.hypot(...v) || 1, n = [(-v[1] / len) * 16, (v[0] / len) * 16];
      const c1 = [h1[0] + v[0] + n[0], h1[1] + v[1] + n[1]], c2 = [h1[0] + v[0] - n[0], h1[1] + v[1] - n[1]];
      const f = (q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`;
      return `<path d="M${f(h1)} C${f(c1)} ${f(c2)} ${f(h2)}" class="rope"/>`;
    }
    case "rect":
      return `<rect x="${pr.x}" y="${pr.y}" width="${pr.w}" height="${pr.h}" rx="${pr.r ?? 3}" class="eq" ${pr.rot ? `transform="rotate(${pr.rot} ${pr.x + pr.w / 2} ${pr.y + pr.h / 2})"` : ""}/>`;
    case "line":
      return `<line x1="${pr.x1}" y1="${pr.y1}" x2="${pr.x2}" y2="${pr.y2}" class="eq-line" stroke-width="${pr.w ?? 4}"/>`;
    case "stack":
      return [0, 1, 2, 3, 4].map((i) => `<rect x="${pr.x}" y="${pr.y + i * 7}" width="18" height="5" rx="1" class="eq"/>`).join("");
    case "plate": {
      const c = add(at(pr.at), [pr.dx || 0, pr.dy || 0]);
      return circ(c, pr.r ?? 13, "plate") + circ(c, 3, "hub");
    }
    case "db": {
      const c = at(pr.at);
      return circ(c, pr.r ?? 6, "plate") + circ(c, 2, "hub");
    }
    case "kb": {
      const c = add(at(pr.at), [0, 8]);
      return circ(c, 8, "plate") + seg(at(pr.at), c, 3, "eq-line");
    }
    case "cable": {
      const h = at(pr.at);
      return seg(pr.from, h, 1.6, "cable") + circ(pr.from, 4, "pulley");
    }
    case "handle": {
      const h = at(pr.at), w = (pr.w ?? 22) / 2;
      return seg([h[0] - w, h[1]], [h[0] + w, h[1]], 4, "eq-line");
    }
    case "lever":
      return seg(pr.from, at(pr.at), 5, "lever") + circ(pr.from, 4, "pulley");
    case "pad":
      return circ(at(pr.at), pr.r ?? 6, "pad");
    case "plat": { // plataforma (prensa) centrada en un punto con un ángulo
      const c = at(pr.at), a = rad(pr.ang ?? 55), h = (pr.len ?? 30) / 2;
      return seg([c[0] - Math.cos(a) * h, c[1] - Math.sin(a) * h], [c[0] + Math.cos(a) * h, c[1] + Math.sin(a) * h], 5, "eq-line");
    }
    case "bar": // barra fija horizontal
      return seg([pr.x1, pr.y], [pr.x2, pr.y], 4, "eq-line");
    default:
      return "";
  }
}

function figureSide(J) {
  let s = "";
  if (J.knee2) s += `<g class="far">${seg(J.hip, J.knee2, 9)}${seg(J.knee2, J.ankle2, 8)}${seg(J.ankle2, J.toe2, 6)}</g>`;
  if (J.elbow2) s += `<g class="far">${seg(J.shoulder, J.elbow2, 7)}${seg(J.elbow2, J.hand2, 6)}</g>`;
  s += seg(J.hip, J.knee, 10) + seg(J.knee, J.ankle, 9) + seg(J.ankle, J.toe, 6);
  s += seg(J.hip, J.shoulder, 13);
  s += circ(J.head, L.head, "head");
  s += seg(J.shoulder, J.elbow, 8) + seg(J.elbow, J.hand, 7);
  return `<g class="fig">${s}</g>`;
}

function figureFront(J) {
  let s = seg(J.hipC, J.neckBase, 16) + circ(J.head, L.head, "head");
  for (const S of [J.R, J.Lf]) {
    s += seg(S.hp, S.kn, 10) + seg(S.kn, S.an, 9);
    s += seg([J.neckBase[0], S.sh[1]], S.sh, 9);
    s += seg(S.sh, S.el, 8) + seg(S.el, S.ha, 7);
  }
  return `<g class="fig">${s}</g>`;
}

export function frameSvg(anim, t) {
  // t en [0,1): ida y vuelta por los fotogramas clave con suavizado.
  const fr = anim.frames;
  let pose;
  if (fr.length === 1) pose = fr[0];
  else if (anim.loop) {
    // ciclo continuo (pedalear, correr, nadar): el último fotograma coincide con el primero
    const x = t * (fr.length - 1), i = Math.min(fr.length - 2, Math.floor(x));
    pose = lerpPose(fr[i], fr[i + 1], x - i);
  } else {
    const n = fr.length - 1;
    const pp = t < 0.5 ? t * 2 : 2 - t * 2; // 0→1→0
    const e = (1 - Math.cos(Math.PI * pp)) / 2;
    const x = e * n;
    const i = Math.min(n - 1, Math.floor(x));
    pose = lerpPose(fr[i], fr[i + 1], x - i);
  }
  const front = anim.view === "front";
  const J = front ? solveFront(pose) : solveSide(pose);
  const back = (anim.props || []).filter((p) => !p.front).map((p) => propSvg(p, J, pose)).join("");
  const fore = (anim.props || []).filter((p) => p.front).map((p) => propSvg(p, J, pose)).join("");
  const floor = `<line x1="8" y1="${FLOOR + 5}" x2="192" y2="${FLOOR + 5}" class="floor" stroke-width="2"/>`;
  return floor + back + (front ? figureFront(J) : figureSide(J)) + fore;
}

const running = new Set();
let rafId = null;
function tick(now) {
  for (const r of running) {
    if (!r.el.isConnected) { running.delete(r); continue; }
    const t = ((((now - r.start) % r.period) + r.period) % r.period) / r.period;
    r.el.innerHTML = frameSvg(r.anim, t);
  }
  rafId = running.size ? requestAnimationFrame(tick) : null;
}

// Dibuja en un <svg> y opcionalmente lo anima (devuelve una función para parar).
export function mountAnim(svgEl, anim, { animate = true, period = 2600, still = 0.5 } = {}) {
  svgEl.setAttribute("viewBox", "0 0 200 200");
  if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    svgEl.innerHTML = frameSvg(anim, still);
    return () => {};
  }
  const r = { el: svgEl, anim, period: anim.period || period, start: performance.now() };
  running.add(r);
  if (!rafId) rafId = requestAnimationFrame(tick);
  return () => running.delete(r);
}

export function stopAll() { running.clear(); }
