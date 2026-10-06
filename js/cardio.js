// Cardio: máquinas y actividades con su animación, y los tipos de sesión (zonas e intervalos).

// ---------- Animaciones (vista lateral, mirando a la derecha) ----------
const deg = Math.PI / 180;
const range = (n) => Array.from({ length: n }, (_, i) => i);

// Correr / caminar: apoyo delante, paso bajo la cadera, el otro pie delante, paso... (ciclo)
function gait({ hip, t, front, back, under, swing, arm, bob = 0 }) {
  const P = (a, b, ua, ua2, up) => ({ hip: [hip[0], hip[1] - up], t, ankle: a, ankle2: b, kb: "f", kb2: "f", ua, fa: ua + 90, ua2, fa2: ua2 + 90 });
  const A = P(front, back, -arm, arm, 0), M1 = P(under, swing, 0, 0, bob), B = P(back, front, arm, -arm, 0), M2 = P(swing, under, 0, 0, bob);
  return [A, M1, B, M2, A];
}
const treadmill = (incl = 0) => [
  { k: "line", x1: 24, y1: 185, x2: 160, y2: 185 - incl, w: 6 },
  { k: "line", x1: 156, y1: 184 - incl, x2: 148, y2: 92, w: 4 },
  { k: "line", x1: 148, y1: 92, x2: 126, y2: 96, w: 4 },
];

const C = { x: 108, y: 160, r: 15 }; // eje de los pedales de la bici
const bikeFrames = range(9).map((k) => {
  const a = k * 45 * deg;
  return { hip: [80, 110], t: 28, ankle: [C.x + Math.cos(a) * C.r, C.y + Math.sin(a) * C.r], ankle2: [C.x - Math.cos(a) * C.r, C.y - Math.sin(a) * C.r], kb: "f", kb2: "f", hand: [134, 104], eb: "d" };
});
const ellipFrames = range(9).map((k) => {
  const a = k * 45 * deg, c = Math.cos(a), s = Math.sin(a);
  return { hip: [92, 99 + s * 1.5], t: 4, ankle: [104 + c * 20, 170 + s * 6], ankle2: [104 - c * 20, 170 - s * 6], kb: "f", kb2: "f", hand: [116 - c * 9, 94], hand2: [116 + c * 9, 94], eb: "d" };
});
const swimFrames = range(9).map((k) => {
  const ua = 90 - k * 45, kick = Math.cos((k * Math.PI) / 2) * 7;
  return { hip: [62, 114], t: 88, hd: -6, ua, fa: ua - 18, ua2: ua + 180, fa2: ua + 162, th: -90 + kick, sh: -96 + kick, th2: -90 - kick, sh2: -96 - kick };
});
const ropeFrames = [0, 90, 180, 270, 360].map((r, k) => {
  const air = Math.cos(r * deg); // 1 = en el aire (la comba pasa bajo los pies)
  return { hip: [95, 100 - air * 4], t: 2, ankle: [97, 178 - Math.max(0, air) * 6], ankle2: [99, 178 - Math.max(0, air) * 6], kb: "f", kb2: "f", hr: [14, 36], hr2: [10, 36], eb: "b", rope: r };
});

const ANIM = {
  run: { loop: true, period: 900, frames: gait({ hip: [94, 100], t: 12, front: [120, 177], back: [58, 158], under: [97, 178], swing: [72, 142], arm: 40, bob: 4 }), props: treadmill() },
  walkIncline: { loop: true, period: 1500, frames: gait({ hip: [92, 101], t: 8, front: [114, 175], back: [72, 179], under: [94, 178], swing: [88, 168], arm: 22, bob: 2 }), props: treadmill(12) },
  bike: {
    loop: true, period: 1100, frames: bikeFrames,
    props: [{ k: "line", x1: 66, y1: 184, x2: 152, y2: 184, w: 5 }, { k: "line", x1: 84, y1: 114, x2: 104, y2: 168, w: 5 }, { k: "rect", x: 66, y: 108, w: 28, h: 5 }, { k: "line", x1: 132, y1: 182, x2: 138, y2: 104, w: 5 }, { k: "line", x1: 128, y1: 103, x2: 146, y2: 100, w: 4 }, { k: "circle", x: 138, y: 160, r: 16, cls: "wheel" }, { k: "lever", from: [C.x, C.y], at: "ankle2" }, { k: "lever", from: [C.x, C.y], at: "ankle", front: true }],
  },
  elliptical: {
    loop: true, period: 1600, frames: ellipFrames,
    props: [{ k: "line", x1: 54, y1: 184, x2: 156, y2: 184, w: 5 }, { k: "circle", x: 62, y: 174, r: 9, cls: "wheel" }, { k: "lever", from: [146, 182], at: "hand2" }, { k: "plat", at: "ankle2", ang: 0, len: 24 }, { k: "lever", from: [146, 182], at: "hand", front: true }, { k: "plat", at: "ankle", ang: 0, len: 24, front: true }],
  },
  rower: {
    period: 2400,
    frames: [{ hip: [98, 165], t: 22, ankle: [146, 167], kb: "u", hand: [150, 140], eb: "b" }, { hip: [66, 165], t: -22, ankle: [146, 167], kb: "u", hand: [74, 128], eb: "b" }],
    props: [{ k: "line", x1: 24, y1: 175, x2: 176, y2: 175, w: 4 }, { k: "plat", at: "hip", ang: 0, len: 24 }, { k: "line", x1: 152, y1: 150, x2: 156, y2: 176, w: 5 }, { k: "circle", x: 178, y: 150, r: 13, cls: "wheel" }, { k: "cable", from: [170, 148], at: "hand" }],
  },
  stepper: {
    period: 1300,
    frames: [{ hip: [94, 100], t: 10, ankle: [114, 152], ankle2: [100, 180], kb: "f", kb2: "f", hand: [126, 108], eb: "d" }, { hip: [94, 100], t: 10, ankle: [100, 180], ankle2: [114, 152], kb: "f", kb2: "f", hand: [126, 108], eb: "d" }],
    props: [{ k: "line", x1: 70, y1: 186, x2: 156, y2: 186, w: 5 }, { k: "line", x1: 154, y1: 186, x2: 148, y2: 60, w: 5 }, { k: "line", x1: 148, y1: 106, x2: 118, y2: 108, w: 4 }, { k: "plat", at: "ankle2", ang: 0, len: 26 }, { k: "plat", at: "ankle", ang: 0, len: 26, front: true }],
  },
  swim: { loop: true, period: 2200, frames: swimFrames, props: [{ k: "water", y: 106 }] },
  rope: { loop: true, period: 700, frames: ropeFrames, props: [{ k: "rope" }] },
};

// ---------- Actividades ----------
// impacto: alto/medio/bajo. avoid: molestias con las que se desaconseja. distancia: si tiene sentido apuntar km.
export const CARDIO = [
  { id: "cinta_correr", nombre: "Correr", sub: "Cinta o exterior", impacto: "alto", avoid: ["rodilla"], distancia: true, anim: ANIM.run,
    pasos: ["Zancada corta y rápida: el pie cae cerca de la vertical de la cadera.", "Tronco algo inclinado hacia delante desde los tobillos.", "Brazos a 90° moviéndose hacia delante y atrás, sin cruzar el cuerpo.", "En cinta, pon un 1 % de inclinación para imitar el aire libre."],
    errores: ["Zancada muy larga aterrizando con el talón por delante del cuerpo.", "Agarrarse a la barra de la cinta.", "Subir el volumen semanal de golpe."],
    consejo: "Es la actividad de mayor impacto: aumenta el tiempo poco a poco y alterna con bici o elíptica si te molestan las rodillas." },
  { id: "cinta_caminar", nombre: "Caminar en cinta inclinada", sub: "Inclinación 6-15 %", impacto: "bajo", avoid: [], distancia: true, anim: ANIM.walkIncline,
    pasos: ["Sube la inclinación antes que la velocidad (5-6 km/h suele bastar).", "Tronco erguido, mirada al frente.", "Brazos sueltos acompañando el paso."],
    errores: ["Colgarse de las barras: reduce mucho el esfuerzo real.", "Inclinarse hacia atrás para compensar la pendiente."],
    consejo: "Muy útil para acumular minutos en zona 2 con poco impacto. Si no puedes ir sin agarrarte, baja la inclinación." },
  { id: "bici", nombre: "Bici estática", sub: "Bici o spinning", impacto: "bajo", avoid: [], distancia: true, anim: ANIM.bike,
    pasos: ["Altura del sillín: con el pedal abajo, la rodilla queda casi estirada (unos 25-35° de flexión).", "Rodillas alineadas con los pies, sin abrirlas.", "Cadencia de 80-100 pedaladas por minuto y regula el esfuerzo con la resistencia."],
    errores: ["Sillín demasiado bajo: carga las rodillas.", "Balancear la cadera sobre el sillín (está demasiado alto)."],
    consejo: "Es el cardio que menos interfiere con las ganancias de fuerza y el más seguro para intervalos intensos." },
  { id: "eliptica", nombre: "Elíptica", sub: "Bajo impacto, cuerpo entero", impacto: "bajo", avoid: [], distancia: true, anim: ANIM.elliptical,
    pasos: ["Pies completos sobre los pedales todo el recorrido.", "Empuja y tira de las palancas para implicar los brazos.", "Espalda recta, sin apoyar el peso en las manos."],
    errores: ["Resistencia tan baja que solo «flotas».", "Ir de puntillas."],
    consejo: "Buena alternativa a correr: trabajo cardiovascular parecido con mucho menos impacto." },
  { id: "remo", nombre: "Remo ergómetro", sub: "Piernas, espalda y brazos", impacto: "bajo", avoid: ["lumbar"], distancia: true, anim: ANIM.rower,
    pasos: ["Orden al tirar: piernas, luego inclinas el tronco atrás y por último brazos.", "Al volver, al revés: brazos, tronco y piernas.", "Espalda neutra; el tirador llega a la parte baja del pecho.", "Resistencia (damper) media: 3-5."],
    errores: ["Tirar con los brazos antes de estirar las piernas.", "Redondear la zona lumbar.", "Damper al máximo pensando que es mejor."],
    consejo: "Mide el ritmo en tiempo por cada 500 m: es la forma estándar de comparar sesiones." },
  { id: "escaladora", nombre: "Escaladora", sub: "Stair climber o stepper", impacto: "medio", avoid: ["rodilla"], distancia: false, anim: ANIM.stepper,
    pasos: ["Apoya el pie entero en el escalón.", "Cuerpo erguido y ligeramente inclinado hacia delante desde la cadera.", "Manos apoyadas solo para equilibrio."],
    errores: ["Cargar el peso en los brazos.", "Pasos cortos de puntillas."],
    consejo: "Exige mucho a glúteos y cuádriceps: empieza con ritmos lentos y sesiones cortas." },
  { id: "natacion", nombre: "Natación", sub: "Piscina", impacto: "bajo", avoid: ["hombro"], distancia: true, anim: ANIM.swim,
    pasos: ["Cuerpo horizontal y alineado; mira al fondo de la piscina.", "Brazada larga: entra la mano por delante del hombro y empuja hasta la cadera.", "Patada corta desde la cadera, no desde la rodilla.", "Respira girando la cabeza, sin levantarla."],
    errores: ["Levantar la cabeza para respirar (se hunden las piernas).", "Patada con las rodillas muy flexionadas."],
    consejo: "Apunta la distancia en km (1.000 m = 1 km). Si tienes molestias de hombro, alterna con bici o elíptica." },
  { id: "comba", nombre: "Saltar a la comba", sub: "Cuerda", impacto: "alto", avoid: ["rodilla"], distancia: false, anim: ANIM.rope,
    pasos: ["Saltos bajos (2-3 cm) sobre la parte delantera del pie.", "Gira la cuerda con las muñecas, codos cerca del cuerpo.", "Rodillas ligeramente flexionadas para amortiguar."],
    errores: ["Saltar demasiado alto.", "Girar la cuerda con los hombros."],
    consejo: "Ideal para intervalos cortos. Ajusta la cuerda: pisándola, las asas llegan a las axilas." },
];
export const cardioById = Object.fromEntries(CARDIO.map((c) => [c.id, c]));

// ---------- Tipos de sesión ----------
// fc: % de la frecuencia cardiaca máxima. int: intervalos { n, trabajo (s), pausa (s) }, con 8 min de calentamiento y 5 de vuelta a la calma.
const WARM = 8, COOL = 5;
export const CARDIO_MODES = {
  z2: { dia: "Cardio suave (zona 2)", nombre: "Continuo suave (zona 2)", corto: "Zona 2", rpe: "3-4", fc: [60, 70], desc: "Ritmo cómodo: puedes mantener una conversación." },
  moderado: { dia: "Cardio moderado", nombre: "Continuo moderado", corto: "Moderado", rpe: "5-6", fc: [70, 80], desc: "Respiras fuerte y solo puedes decir frases cortas." },
  largo: { dia: "Cardio largo", nombre: "Sesión larga suave", corto: "Larga", rpe: "3-4", fc: [60, 70], desc: "Como la zona 2 pero más larga: construye la base aeróbica." },
  int_suave: { dia: "Intervalos suaves", nombre: "Intervalos suaves 6×1 min", corto: "6×1 min", rpe: "7", fc: [80, 85], desc: "6 × 1 min a ritmo exigente con 2 min muy suaves entre medias.", int: { n: 6, trabajo: 60, pausa: 120 } },
  x4x4: { dia: "Intervalos 4×4", nombre: "Intervalos 4×4 min", corto: "4×4 min", rpe: "8-9", fc: [85, 95], desc: "4 × 4 min fuertes (casi no puedes hablar) con 3 min suaves entre medias.", int: { n: 4, trabajo: 240, pausa: 180 } },
  x10x1: { dia: "Intervalos 10×1", nombre: "Intervalos 10×1 min", corto: "10×1 min", rpe: "8-9", fc: [85, 95], desc: "10 × 1 min fuerte con 1 min suave entre medias.", int: { n: 10, trabajo: 60, pausa: 60 } },
};
export const isInterval = (modo) => !!CARDIO_MODES[modo]?.int;
export function intervalMinutes(modo) {
  const i = CARDIO_MODES[modo]?.int;
  return i ? Math.round(WARM + COOL + (i.n * i.trabajo + (i.n - 1) * i.pausa) / 60) : 0;
}
// Fases del temporizador de intervalos.
export function intervalPhases(modo) {
  const i = CARDIO_MODES[modo].int;
  const ph = [{ tipo: "calentamiento", seg: WARM * 60, label: "Calentamiento suave" }];
  for (let k = 1; k <= i.n; k++) {
    ph.push({ tipo: "trabajo", seg: i.trabajo, label: `Intervalo ${k} de ${i.n}: ¡fuerte!` });
    if (k < i.n) ph.push({ tipo: "pausa", seg: i.pausa, label: `Recupera suave (${k}/${i.n})` });
  }
  ph.push({ tipo: "calma", seg: COOL * 60, label: "Vuelta a la calma" });
  return ph;
}
// Frecuencia cardiaca máxima estimada (Tanaka, Monahan y Seals, 2001).
export const hrMax = (edad) => (+edad >= 12 ? Math.round(208 - 0.7 * +edad) : null);
export function hrRange(modo, edad) {
  const m = hrMax(edad), f = CARDIO_MODES[modo]?.fc;
  return m && f ? `${Math.round((m * f[0]) / 100)}-${Math.round((m * f[1]) / 100)} ppm` : "";
}
