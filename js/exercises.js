// Biblioteca de ejercicios: variantes (máquina, peso libre, polea) con su animación.

export const MUSCLES = {
  pecho: "Pecho", espalda: "Espalda", hombros: "Hombros", biceps: "Bíceps", triceps: "Tríceps",
  cuadriceps: "Cuádriceps", isquios: "Isquiotibiales", gluteos: "Glúteos", gemelos: "Gemelos", core: "Core",
};
export const VARIANT_LABEL = { libre: "Peso libre", maquina: "Máquina", polea: "Polea" };
// Las variantes con uni: true se hacen con un brazo o una pierna cada vez.
export const vLabel = (v) => VARIANT_LABEL[v.tipo] + (v.uni ? " · unilateral" : "");

// ---------- Utilidades de poses ----------
const STAND = { hip: [95, 104], t: 2, ankle: [97, 180] };
const S = (o) => ({ ...STAND, ...o });
const barOn = (at = "hand", r = 14, extra = {}) => ({ k: "plate", at, r, ...extra });
const db = (at = "hand") => ({ k: "db", at });
const db2 = [{ k: "db", at: "hand" }, { k: "db", at: "hand2" }];
const cable = (from, at = "hand") => ({ k: "cable", from, at });
const stackAt = (x, y) => ({ k: "stack", x, y });
const flatBench = [{ k: "rect", x: 40, y: 138, w: 100, h: 7 }, { k: "line", x1: 60, y1: 145, x2: 60, y2: 186 }, { k: "line", x1: 125, y1: 145, x2: 125, y2: 186 }];
const seat = (x = 60, y = 144, w = 50) => [{ k: "rect", x, y, w, h: 8 }, { k: "line", x1: x + w / 2, y1: y + 8, x2: x + w / 2, y2: 186 }];
const backrest = (x1, y1, x2, y2) => ({ k: "line", x1, y1, x2, y2, w: 8 });

const SEATED = { hip: [82, 142], t: -6, ankle: [122, 180] };
const SE = (o) => ({ ...SEATED, ...o });
const LYING = { hip: [122, 134], t: -90, ankle: [152, 180], kb: "u", hd: 0 };
const LY = (o) => ({ ...LYING, ...o });

const A = {
  // Piernas
  squatBar: { frames: [S({ hip: [95, 104], t: 4, ankle: [100, 180], hr: [-4, 4] }), S({ hip: [76, 140], t: 40, ankle: [100, 180], hr: [-4, 4] })], props: [barOn("shoulder", 15, { dx: -3, dy: -3 })] },
  squatSmith: { frames: [S({ hip: [95, 104], t: 3, ankle: [104, 180], hr: [-4, 4] }), S({ hip: [80, 140], t: 30, ankle: [104, 180], hr: [-4, 4] })], props: [{ k: "line", x1: 52, y1: 15, x2: 52, y2: 186, w: 4 }, { k: "line", x1: 150, y1: 15, x2: 150, y2: 186, w: 4 }, barOn("shoulder", 14, { dx: -3, dy: -3 })] },
  squatGoblet: { frames: [S({ hip: [95, 104], t: 3, ankle: [100, 180], hr: [12, 12] }), S({ hip: [78, 142], t: 28, ankle: [100, 180], hr: [12, 12] })], props: [{ k: "db", at: "hand" }] },
  legPress: {
    frames: [{ hip: [62, 140], t: -42, ankle: [124, 96], kb: "u", hr: [22, 30], tr: [8, -8] }, { hip: [62, 140], t: -42, ankle: [102, 114], kb: "u", hr: [22, 30], tr: [8, -8] }],
    props: [backrest(52, 146, 20, 112), { k: "line", x1: 50, y1: 148, x2: 92, y2: 150, w: 8 }, { k: "line", x1: 92, y1: 160, x2: 176, y2: 70, w: 3 }, { k: "plat", at: "toe", ang: 125, len: 34, front: true }],
  },
  lunge: { frames: [S({ hip: [95, 104], t: 2, ankle: [122, 180], ankle2: [70, 180], hr: [2, 50] }), S({ hip: [95, 138], t: 4, ankle: [122, 180], ankle2: [68, 180], hr: [2, 50] })], props: [db()] },
  bulgarian: { frames: [S({ hip: [92, 108], t: 6, ankle: [126, 180], ankle2: [52, 146], tr2: [-8, -4], hr: [2, 50] }), S({ hip: [92, 138], t: 10, ankle: [126, 180], ankle2: [52, 146], tr2: [-8, -4], hr: [2, 50] })], props: [{ k: "rect", x: 30, y: 148, w: 34, h: 8 }, { k: "line", x1: 47, y1: 156, x2: 47, y2: 186 }, db()] },
  lungeSmith: { frames: [S({ hip: [95, 104], t: 2, ankle: [122, 180], ankle2: [70, 180], hr: [-4, 4] }), S({ hip: [95, 138], t: 4, ankle: [122, 180], ankle2: [68, 180], hr: [-4, 4] })], props: [{ k: "line", x1: 52, y1: 15, x2: 52, y2: 186, w: 4 }, { k: "line", x1: 150, y1: 15, x2: 150, y2: 186, w: 4 }, barOn("shoulder", 14, { dx: -3, dy: -3 })] },
  legExt: { frames: [SE({ hip: [80, 132], t: -6, th: 90, sh: 2, hr: [12, 40] }), SE({ hip: [80, 132], t: -6, th: 90, sh: 84, hr: [12, 40] })], props: [{ k: "rect", x: 48, y: 136, w: 72, h: 9 }, backrest(52, 136, 46, 80), { k: "line", x1: 84, y1: 145, x2: 84, y2: 186 }, { k: "pad", at: "ankle", r: 6, front: true }] },
  legCurlSeated: { frames: [SE({ hip: [80, 132], t: -8, th: 90, sh: 82, hr: [12, 40] }), SE({ hip: [80, 132], t: -8, th: 90, sh: -12, hr: [12, 40] })], props: [{ k: "rect", x: 48, y: 136, w: 72, h: 9 }, backrest(52, 136, 44, 80), { k: "line", x1: 84, y1: 145, x2: 84, y2: 186 }, { k: "pad", at: "knee", r: 5, front: true }, { k: "pad", at: "ankle", r: 6, front: true }] },
  legCurlLying: { frames: [{ hip: [86, 132], t: 92, th: -90, sh: -90, hand: [150, 142], eb: "d", hd: 10 }, { hip: [86, 132], t: 92, th: -90, sh: -168, hand: [150, 142], eb: "d", hd: 10 }], props: [{ k: "rect", x: 40, y: 138, w: 120, h: 7 }, { k: "line", x1: 60, y1: 145, x2: 60, y2: 186 }, { k: "line", x1: 140, y1: 145, x2: 140, y2: 186 }, { k: "pad", at: "ankle", r: 6, front: true }] },
  legCurlCable: { frames: [S({ t: 14, th: 0, sh: 0, ankle2: [97, 180], hand: [128, 98] }), S({ t: 14, th: 4, sh: -95, ankle2: [97, 180], hand: [128, 98] })], props: [{ k: "line", x1: 135, y1: 30, x2: 135, y2: 186, w: 5 }, cable([30, 176], "ankle")] },
  rdl: { frames: [S({ hip: [92, 104], t: 4, ankle: [98, 180], hr: [1, 51] }), S({ hip: [72, 110], t: 72, ankle: [98, 180], hr: [1, 51] })], props: [barOn("hand", 14)] },
  rdlDb: { frames: [S({ hip: [92, 104], t: 4, ankle: [98, 180], hr: [1, 51] }), S({ hip: [72, 110], t: 72, ankle: [98, 180], hr: [1, 51] })], props: [db()] },
  pullThrough: { frames: [S({ hip: [92, 104], t: 4, ankle: [110, 180], hand: [100, 150] }), S({ hip: [74, 112], t: 70, ankle: [110, 180], hr: [-14, 48] })], props: [cable([20, 176])] },
  deadlift: { frames: [S({ hip: [74, 134], t: 55, ankle: [100, 180], hr: [-2, 51] }), S({ hip: [94, 104], t: 2, ankle: [100, 180], hr: [1, 51] })], props: [barOn("hand", 17, { dy: 6 })] },
  hipThrust: { frames: [{ hip: [100, 168], t: -70, ankle: [142, 180], kb: "u", hand: [100, 158], hd: 25 }, { hip: [100, 140], t: -92, ankle: [142, 180], kb: "u", hand: [100, 132], hd: 30 }], props: [{ k: "rect", x: 16, y: 148, w: 44, h: 34 }, barOn("hip", 15, { dy: -12, front: true })] },
  hipThrustMachine: { frames: [{ hip: [100, 168], t: -70, ankle: [142, 180], kb: "u", hand: [100, 158], hd: 25 }, { hip: [100, 140], t: -92, ankle: [142, 180], kb: "u", hand: [100, 132], hd: 30 }], props: [{ k: "rect", x: 16, y: 148, w: 44, h: 34 }, { k: "lever", from: [170, 120], at: "hip" }, { k: "pad", at: "hip", r: 8, front: true }] },
  kickbackCable: { frames: [S({ t: 18, th: 0, sh: 0, ankle2: [97, 180], hand: [130, 100] }), S({ t: 22, th: -42, sh: -30, ankle2: [97, 180], hand: [130, 100] })], props: [{ k: "line", x1: 137, y1: 30, x2: 137, y2: 186, w: 5 }, cable([30, 176], "ankle")] },
  kickbackMachine: { frames: [S({ t: 30, th: 0, sh: 0, ankle2: [97, 180], hand: [134, 92] }), S({ t: 32, th: -45, sh: -30, ankle2: [97, 180], hand: [134, 92] })], props: [{ k: "rect", x: 120, y: 88, w: 30, h: 8 }, { k: "line", x1: 140, y1: 96, x2: 140, y2: 186, w: 5 }, { k: "lever", from: [100, 100], at: "ankle" }, { k: "pad", at: "ankle", r: 6, front: true }] },
  calfStand: { frames: [S({ hip: [95, 104], ankle: [102, 176], toe: [114, 178], hr: [1, 51] }), S({ hip: [97, 93], ankle: [106, 166], toe: [114, 178], hr: [1, 51] })], props: [{ k: "rect", x: 104, y: 179, w: 34, h: 7 }, db()] },
  calfMachine: { frames: [S({ hip: [95, 104], ankle: [102, 176], toe: [114, 178], hr: [-4, 6] }), S({ hip: [97, 93], ankle: [106, 166], toe: [114, 178], hr: [-4, 6] })], props: [{ k: "rect", x: 104, y: 179, w: 34, h: 7 }, { k: "line", x1: 60, y1: 20, x2: 60, y2: 186, w: 5 }, { k: "lever", from: [60, 50], at: "shoulder" }, { k: "pad", at: "shoulder", r: 7, front: true }] },
  calfSeated: { frames: [{ hip: [70, 140], t: -2, th: 90, sh: 0, toe: [122, 180], hr: [40, 0] }, { hip: [70, 140], t: -2, th: 97, sh: 0, toe: [122, 180], hr: [40, 0] }], props: [...seat(40, 144, 46), { k: "pad", at: "knee", r: 7, front: true }, { k: "rect", x: 108, y: 180, w: 26, h: 6 }] },

  // Pecho
  bench: { frames: [LY({ hand: [72, 82], eb: "f" }), LY({ hand: [76, 118], eb: "f" })], props: [...flatBench, { k: "line", x1: 52, y1: 70, x2: 52, y2: 186, w: 3 }, barOn("hand", 14, { front: true })] },
  benchDb: { frames: [LY({ hand: [72, 82], eb: "f" }), LY({ hand: [70, 122], eb: "f" })], props: [...flatBench, db()] },
  incline: { frames: [{ hip: [112, 140], t: -58, ankle: [150, 180], kb: "u", hand: [72, 62], eb: "f" }, { hip: [112, 140], t: -58, ankle: [150, 180], kb: "u", hand: [78, 102], eb: "f" }], props: [backrest(112, 146, 52, 108), { k: "line", x1: 112, y1: 146, x2: 135, y2: 146, w: 8 }, { k: "line", x1: 100, y1: 146, x2: 100, y2: 186 }, barOn("hand", 14, { front: true })] },
  inclineDb: { frames: [{ hip: [112, 140], t: -58, ankle: [150, 180], kb: "u", hand: [72, 62], eb: "f" }, { hip: [112, 140], t: -58, ankle: [150, 180], kb: "u", hand: [76, 106], eb: "f" }], props: [backrest(112, 146, 52, 108), { k: "line", x1: 112, y1: 146, x2: 135, y2: 146, w: 8 }, { k: "line", x1: 100, y1: 146, x2: 100, y2: 186 }, db()] },
  chestPress: { frames: [SE({ hand: [124, 98], eb: "d" }), SE({ hand: [100, 100], eb: "d" })], props: [...seat(56, 144, 46), backrest(62, 144, 58, 84), { k: "lever", from: [150, 30], at: "hand" }, { k: "pad", at: "hand", r: 5, front: true }] },
  inclinePress: { frames: [SE({ t: -22, hand: [118, 70], eb: "d" }), SE({ t: -22, hand: [92, 88], eb: "d" })], props: [...seat(56, 144, 46), backrest(64, 144, 44, 86), { k: "lever", from: [160, 140], at: "hand" }, { k: "pad", at: "hand", r: 5, front: true }] },
  cablePress: { frames: [S({ t: 12, ankle: [118, 180], ankle2: [74, 180], hr: [6, 6], eb: "b" }), S({ t: 12, ankle: [118, 180], ankle2: [74, 180], hr: [50, 6], eb: "b" })], props: [{ k: "line", x1: 28, y1: 20, x2: 28, y2: 186, w: 5 }, cable([30, 70])] },
  flyFront: { view: "front", frames: [{ ua: 90, fa: 96, al: 1 }, { ua: 90, fa: 96, al: -0.28 }], props: [] },
  pushup: { frames: [{ hip: [90, 142], t: 78, ankle: [14, 176], toe: [20, 182], kb: "u", hand: [140, 181], eb: "b" }, { hip: [90, 160], t: 84, ankle: [14, 176], toe: [20, 182], kb: "u", hand: [140, 181], eb: "b" }], props: [] },
  dips: { frames: [{ hip: [95, 87], t: 6, hand: [102, 85], eb: "b", th: 10, sh: -40 }, { hip: [90, 109], t: 16, hand: [102, 85], eb: "b", th: 10, sh: -40 }], props: [{ k: "bar", x1: 86, x2: 134, y: 87 }, { k: "line", x1: 128, y1: 87, x2: 128, y2: 186, w: 4 }] },
  dipMachine: { frames: [SE({ hr: [8, 2], eb: "b" }), SE({ hr: [6, 46], eb: "b" })], props: [...seat(56, 144, 46), backrest(62, 144, 58, 84), { k: "lever", from: [40, 120], at: "hand" }, { k: "pad", at: "hand", r: 5, front: true }] },

  // Espalda
  pulldown: { frames: [{ hip: [95, 142], t: -10, th: 85, sh: 4, hr: [6, -50], eb: "b" }, { hip: [95, 142], t: -12, th: 85, sh: 4, hr: [12, -2], eb: "b" }], props: [...seat(70, 144, 50), { k: "pad", at: "knee", r: 6, front: false }, cable([95, 8]), { k: "handle", at: "hand", w: 46 }] },
  pulldownMachine: { frames: [{ hip: [95, 142], t: -10, th: 85, sh: 4, hr: [10, -50], eb: "b" }, { hip: [95, 142], t: -12, th: 85, sh: 4, hr: [14, -2], eb: "b" }], props: [...seat(70, 144, 50), { k: "pad", at: "knee", r: 6 }, { k: "lever", from: [30, 30], at: "hand" }, { k: "pad", at: "hand", r: 5, front: true }] },
  pullup: { frames: [{ hip: [96, 120], t: -4, hand: [100, 20], eb: "b", th: 30, sh: -60 }, { hip: [96, 86], t: -6, hand: [100, 20], eb: "b", th: 30, sh: -60 }], props: [{ k: "bar", x1: 60, x2: 140, y: 18 }, { k: "line", x1: 140, y1: 18, x2: 140, y2: 186, w: 4 }] },
  rowBar: { frames: [S({ hip: [76, 106], t: 68, ankle: [98, 180], hr: [0, 50], eb: "u" }), S({ hip: [76, 106], t: 68, ankle: [98, 180], hr: [-18, 30], eb: "u" })], props: [barOn("hand", 14)] },
  rowDb: { frames: [S({ hip: [76, 106], t: 70, ankle: [92, 180], hr: [0, 50], eb: "u", hand2: [150, 128] }), S({ hip: [76, 106], t: 70, ankle: [92, 180], hr: [-18, 28], eb: "u", hand2: [150, 128] })], props: [{ k: "rect", x: 112, y: 130, w: 66, h: 7 }, { k: "line", x1: 160, y1: 137, x2: 160, y2: 186 }, db()] },
  rowCable: { frames: [{ hip: [70, 150], t: -4, ankle: [132, 158], kb: "u", hr: [46, 8], eb: "b" }, { hip: [70, 150], t: -8, ankle: [132, 158], kb: "u", hr: [10, 22], eb: "b" }], props: [{ k: "rect", x: 36, y: 154, w: 70, h: 8 }, { k: "line", x1: 140, y1: 140, x2: 140, y2: 172, w: 5 }, cable([186, 140]), { k: "handle", at: "hand", w: 8 }] },
  rowMachine: { frames: [{ hip: [70, 145], t: 6, ankle: [112, 180], hr: [44, 6], eb: "b" }, { hip: [70, 145], t: 4, ankle: [112, 180], hr: [8, 14], eb: "b" }], props: [...seat(40, 149, 46), { k: "rect", x: 108, y: 82, w: 8, h: 34 }, { k: "line", x1: 112, y1: 116, x2: 112, y2: 150, w: 4 }, { k: "lever", from: [150, 170], at: "hand" }, { k: "pad", at: "hand", r: 5, front: true }] },

  // Hombros
  ohpBar: { frames: [S({ hr: [10, 0], eb: "d" }), S({ hr: [2, -51], eb: "d" })], props: [barOn("hand", 14, { front: true })] },
  ohpDb: { frames: [SE({ hr: [8, 0], eb: "d" }), SE({ hr: [2, -51], eb: "d" })], props: [...seat(56, 144, 46), backrest(64, 144, 62, 82), db()] },
  ohpMachine: { frames: [SE({ hr: [10, 0], eb: "d" }), SE({ hr: [4, -50], eb: "d" })], props: [...seat(56, 144, 46), backrest(64, 144, 62, 82), { k: "lever", from: [40, 30], at: "hand" }, { k: "pad", at: "hand", r: 5, front: true }] },
  lateralDb: { view: "front", frames: [{ ua: 8, fa: 10 }, { ua: 84, fa: 90 }], props: db2 },
  lateralCable: { view: "front", frames: [{ ua: 8, fa: -10 }, { ua: 84, fa: 90 }], props: [cable([82, 180], "hand")] },
  lateralMachine: { view: "front", frames: [{ ua: 10, fa: 8 }, { ua: 84, fa: 80 }], props: [...seat(70, 148, 60).slice(0, 1), { k: "pad", at: "elbow", r: 6, front: true }, { k: "pad", at: "elbow2", r: 6, front: true }] },
  reverseFly: { view: "front", frames: [{ ua: 90, fa: 96, al: -0.25 }, { ua: 90, fa: 96, al: 1 }], props: [] },
  facePull: { frames: [S({ t: -4, hr: [50, 0], eb: "b" }), S({ t: -6, hr: [8, -14], eb: "b" })], props: [{ k: "line", x1: 190, y1: 20, x2: 190, y2: 186, w: 5 }, cable([188, 46]), { k: "handle", at: "hand", w: 8 }] },

  // Brazos
  curlDb: { frames: [S({ ua: -4, fa: 2 }), S({ ua: -8, fa: 135 })], props: [db()] },
  curlBar: { frames: [S({ ua: -4, fa: 2 }), S({ ua: -8, fa: 135 })], props: [barOn("hand", 11, { front: true })] },
  curlCable: { frames: [S({ ua: -4, fa: 6 }), S({ ua: -8, fa: 150 })], props: [cable([126, 178]), { k: "handle", at: "hand", w: 12 }] },
  curlPreacher: { frames: [SE({ t: 8, ua: 45, fa: 58 }), SE({ t: 8, ua: 45, fa: 165 })], props: [...seat(56, 144, 46), { k: "line", x1: 86, y1: 106, x2: 110, y2: 128, w: 7 }, { k: "line", x1: 104, y1: 128, x2: 104, y2: 186, w: 4 }, { k: "pad", at: "hand", r: 5, front: true }] },
  hammerCable: { frames: [S({ ua: -4, fa: 6 }), S({ ua: -8, fa: 145 })], props: [cable([126, 178]), { k: "pad", at: "hand", r: 3, front: true }] },
  pushdown: { frames: [S({ t: 8, ua: -6, fa: 95 }), S({ t: 8, ua: -6, fa: 6 })], props: [{ k: "line", x1: 140, y1: 8, x2: 140, y2: 186, w: 5 }, cable([136, 12]), { k: "handle", at: "hand", w: 12 }] },
  overheadDb: { frames: [SE({ ua: 175, fa: -20 }), SE({ ua: 175, fa: -185 })], props: [...seat(56, 144, 46), backrest(64, 144, 62, 82), db()] },
  overheadCable: { frames: [S({ t: 22, ankle: [112, 180], ankle2: [72, 180], ua: 160, fa: 10 }), S({ t: 22, ankle: [112, 180], ankle2: [72, 180], ua: 160, fa: 160 })], props: [{ k: "line", x1: 30, y1: 20, x2: 30, y2: 186, w: 5 }, cable([34, 70]), { k: "handle", at: "hand", w: 8 }] },
  skull: { frames: [LY({ ua: 192, fa: 182 }), LY({ ua: 192, fa: 255 })], props: [...flatBench, barOn("hand", 11, { front: true })] },
  tricepsMachine: { frames: [SE({ ua: -8, fa: 100 }), SE({ ua: -8, fa: 8 })], props: [...seat(56, 144, 46), backrest(64, 144, 62, 82), { k: "rect", x: 92, y: 110, w: 30, h: 7 }, { k: "lever", from: [94, 116], at: "hand" }, { k: "pad", at: "hand", r: 5, front: true }] },

  // Core
  plank: { period: 3600, frames: [{ hip: [95, 156], t: 84, ua: 0, fa: 90, ankle: [22, 174], toe: [30, 182], kb: "u" }, { hip: [95, 153], t: 83, ua: 0, fa: 90, ankle: [22, 174], toe: [30, 182], kb: "u" }], props: [] },
  crunch: { frames: [{ hip: [110, 172], t: -84, ankle: [150, 180], kb: "u", hr: [12, -2] }, { hip: [110, 172], t: -52, ankle: [150, 180], kb: "u", hr: [12, -2] }], props: [] },
  cableCrunch: { frames: [{ hip: [90, 140], t: 10, th: 0, sh: -90, hr: [10, -8], eb: "d" }, { hip: [90, 140], t: 72, th: 0, sh: -90, hr: [10, -8], eb: "d" }], props: [{ k: "line", x1: 120, y1: 6, x2: 120, y2: 186, w: 5 }, cable([116, 10])] },
  legRaise: { frames: [{ hip: [98, 104], t: -2, hand: [100, 4], eb: "b", th: 0, sh: 0 }, { hip: [98, 104], t: -8, hand: [100, 4], eb: "b", th: 92, sh: 86 }], props: [{ k: "bar", x1: 60, x2: 140, y: 3 }] },
  captain: { frames: [{ hip: [95, 120], t: -4, ua: 90, fa: 90, th: 0, sh: 0 }, { hip: [95, 120], t: -6, ua: 90, fa: 90, th: 98, sh: 20 }], props: [backrest(80, 140, 80, 50), { k: "rect", x: 82, y: 66, w: 50, h: 6 }, { k: "line", x1: 80, y1: 140, x2: 80, y2: 186, w: 5 }] },
  crunchMachine: { frames: [SE({ t: -6, hr: [6, -4] }), SE({ t: 34, hr: [6, -4] })], props: [...seat(56, 144, 46), { k: "pad", at: "shoulder", r: 7, front: true }, { k: "lever", from: [60, 60], at: "shoulder" }] },
};

// ---------- Ejercicios ----------
// tipo: compuesto (multiarticular) o aislamiento. avoid: limitaciones con las que se desaconseja.
export const EXERCISES = [
  // PECHO
  { id: "press_banca", nombre: "Press de banca", musculo: "pecho", secundarios: ["triceps", "hombros"], tipo: "compuesto",
    variantes: [
      { tipo: "libre", nombre: "Press de banca con barra", anim: A.bench },
      { tipo: "libre", nombre: "Press de banca con mancuernas", anim: A.benchDb },
      { tipo: "maquina", nombre: "Press de pecho en máquina", anim: A.chestPress },
      { tipo: "polea", nombre: "Press de pecho en polea de pie", anim: A.cablePress },
      { tipo: "libre", uni: true, nombre: "Press de banca con mancuerna a una mano", anim: { ...A.benchDb } },
      { tipo: "maquina", uni: true, nombre: "Press de pecho en máquina a un brazo", anim: A.chestPress },
      { tipo: "polea", uni: true, nombre: "Press de pecho en polea a una mano", anim: A.cablePress },
    ],
    pasos: ["Túmbate con los ojos bajo la barra y los pies firmes en el suelo.", "Junta las escápulas y mantén un ligero arco lumbar natural.", "Baja controlado hasta rozar el pecho a la altura del esternón, codos a unos 45-70° del torso.", "Empuja hasta extender los brazos sin despegar los glúteos del banco."],
    errores: ["Rebotar la barra en el pecho.", "Abrir los codos a 90° (más estrés en el hombro)."],
    consejo: "Usa un recorrido completo: los rangos amplios suelen producir igual o más hipertrofia que los parciales." },
  { id: "press_inclinado", nombre: "Press inclinado", musculo: "pecho", secundarios: ["hombros", "triceps"], tipo: "compuesto",
    variantes: [
      { tipo: "libre", nombre: "Press inclinado con barra", anim: A.incline },
      { tipo: "libre", nombre: "Press inclinado con mancuernas", anim: A.inclineDb },
      { tipo: "maquina", nombre: "Press inclinado en máquina", anim: A.inclinePress },
      { tipo: "libre", uni: true, nombre: "Press inclinado con mancuerna a una mano", anim: A.inclineDb },
      { tipo: "maquina", uni: true, nombre: "Press inclinado en máquina a un brazo", anim: A.inclinePress },
    ],
    pasos: ["Banco a 30-45°.", "Escápulas retraídas y pies estables.", "Baja hacia la parte alta del pecho.", "Empuja hacia arriba y ligeramente hacia atrás."],
    errores: ["Inclinar demasiado el banco (pasa a ser un press de hombro).", "Perder la retracción escapular."],
    consejo: "Pone más énfasis en la porción clavicular del pectoral." },
  { id: "aperturas", nombre: "Aperturas", musculo: "pecho", secundarios: ["hombros"], tipo: "aislamiento",
    variantes: [
      { tipo: "maquina", nombre: "Contractora (pec deck)", anim: { ...A.flyFront, props: [{ k: "rect", x: 85, y: 140, w: 30, h: 8 }, { k: "pad", at: "hand", r: 5, front: true }, { k: "pad", at: "hand2", r: 5, front: true }] } },
      { tipo: "polea", nombre: "Cruce de poleas", anim: { ...A.flyFront, props: [{ k: "line", x1: 18, y1: 20, x2: 18, y2: 186, w: 5 }, { k: "line", x1: 182, y1: 20, x2: 182, y2: 186, w: 5 }, cable([180, 30], "hand"), cable([20, 30], "hand2")] } },
      { tipo: "libre", nombre: "Aperturas con mancuernas", anim: { ...A.flyFront, props: db2 } },
      { tipo: "polea", uni: true, nombre: "Cruce de polea a una mano", anim: { ...A.flyFront, props: [{ k: "line", x1: 182, y1: 20, x2: 182, y2: 186, w: 5 }, cable([180, 30], "hand")] } },
    ],
    pasos: ["Codos ligeramente flexionados y fijos.", "Abre los brazos en arco hasta notar estiramiento en el pecho.", "Cierra como si abrazaras un árbol, sin chocar las manos."],
    errores: ["Convertirlo en un press doblando los codos.", "Bajar más allá de lo que permite el hombro."],
    consejo: "La polea mantiene tensión en todo el recorrido; con mancuernas la tensión es máxima en el estiramiento." },
  { id: "fondos", nombre: "Fondos", musculo: "pecho", secundarios: ["triceps", "hombros"], tipo: "compuesto",
    variantes: [
      { tipo: "libre", nombre: "Fondos en paralelas", anim: A.dips, avoid: ["hombro"] },
      { tipo: "maquina", nombre: "Fondos en máquina", anim: A.dipMachine },
      { tipo: "libre", nombre: "Flexiones", anim: A.pushup },
    ],
    pasos: ["Agárrate con los brazos extendidos y el pecho ligeramente inclinado hacia delante.", "Baja hasta que los hombros queden a la altura de los codos.", "Empuja hasta casi bloquear."],
    errores: ["Bajar demasiado con los hombros adelantados.", "Balancear las piernas."],
    consejo: "Inclinar el torso hacia delante enfatiza el pecho; vertical, el tríceps." },

  // ESPALDA
  { id: "jalon", nombre: "Jalón / Dominadas", musculo: "espalda", secundarios: ["biceps"], tipo: "compuesto",
    variantes: [
      { tipo: "polea", nombre: "Jalón al pecho en polea", anim: A.pulldown },
      { tipo: "libre", nombre: "Dominadas", anim: A.pullup },
      { tipo: "maquina", nombre: "Jalón en máquina convergente", anim: A.pulldownMachine },
      { tipo: "polea", uni: true, nombre: "Jalón en polea a una mano", anim: A.pulldown },
    ],
    pasos: ["Agarre algo más ancho que los hombros.", "Inicia bajando las escápulas, luego tira con los codos hacia las costillas.", "Lleva la barra a la parte alta del pecho.", "Sube controlado hasta estirar del todo los dorsales."],
    errores: ["Tirar con los brazos sin mover las escápulas.", "Echarse muy atrás usando impulso."],
    consejo: "Piensa en llevar los codos al bolsillo trasero." },
  { id: "remo", nombre: "Remo", musculo: "espalda", secundarios: ["biceps", "hombros"], tipo: "compuesto",
    variantes: [
      { tipo: "polea", nombre: "Remo sentado en polea", anim: A.rowCable },
      { tipo: "libre", nombre: "Remo con barra", anim: A.rowBar, avoid: ["lumbar"] },
      { tipo: "libre", uni: true, nombre: "Remo con mancuerna a una mano", anim: A.rowDb },
      { tipo: "maquina", nombre: "Remo en máquina con apoyo de pecho", anim: A.rowMachine },
      { tipo: "polea", uni: true, nombre: "Remo en polea a una mano", anim: A.rowCable },
      { tipo: "maquina", uni: true, nombre: "Remo en máquina a un brazo", anim: A.rowMachine },
    ],
    pasos: ["Espalda neutra y pecho alto.", "Tira llevando los codos hacia atrás pegados al cuerpo.", "Junta las escápulas al final.", "Vuelve estirando los brazos y dejando que las escápulas se separen."],
    errores: ["Redondear la zona lumbar.", "Usar el balanceo del tronco para mover el peso."],
    consejo: "El remo con apoyo de pecho elimina la fatiga lumbar y deja trabajar más la espalda alta." },
  { id: "peso_muerto", nombre: "Peso muerto", musculo: "espalda", secundarios: ["gluteos", "isquios", "cuadriceps"], tipo: "compuesto",
    variantes: [{ tipo: "libre", nombre: "Peso muerto convencional", anim: A.deadlift, avoid: ["lumbar"] }],
    sustituto: "remo",
    pasos: ["Barra sobre la mitad del pie, agarre justo fuera de las piernas.", "Cadera atrás, espalda neutra, pecho alto y brazos estirados.", "Empuja el suelo con las piernas manteniendo la barra pegada al cuerpo.", "Termina con cadera y rodillas extendidas sin hiperextender."],
    errores: ["Redondear la espalda.", "Alejar la barra del cuerpo."],
    consejo: "Muy eficaz para fuerza general, pero genera mucha fatiga: programa pocas series y descansos largos." },

  // HOMBROS
  { id: "press_militar", nombre: "Press de hombro", musculo: "hombros", secundarios: ["triceps"], tipo: "compuesto",
    variantes: [
      { tipo: "libre", nombre: "Press militar con barra de pie", anim: A.ohpBar, avoid: ["lumbar"] },
      { tipo: "libre", nombre: "Press con mancuernas sentado", anim: A.ohpDb },
      { tipo: "maquina", nombre: "Press de hombro en máquina", anim: A.ohpMachine },
      { tipo: "libre", uni: true, nombre: "Press de hombro con mancuerna a una mano", anim: A.ohpDb },
      { tipo: "maquina", uni: true, nombre: "Press de hombro en máquina a un brazo", anim: A.ohpMachine },
    ],
    pasos: ["Glúteos y abdomen apretados.", "Parte con las manos a la altura de los hombros.", "Empuja en vertical, metiendo la cabeza bajo la barra al final.", "Baja controlado hasta la barbilla."],
    errores: ["Arquear mucho la zona lumbar.", "Empujar la barra hacia delante."],
    consejo: "Las variantes sentadas reducen la carga lumbar." },
  { id: "elev_laterales", nombre: "Elevaciones laterales", musculo: "hombros", secundarios: [], tipo: "aislamiento",
    variantes: [
      { tipo: "libre", nombre: "Elevaciones laterales con mancuernas", anim: A.lateralDb },
      { tipo: "polea", uni: true, nombre: "Elevación lateral en polea", anim: A.lateralCable },
      { tipo: "maquina", nombre: "Elevaciones laterales en máquina", anim: A.lateralMachine },
      { tipo: "libre", uni: true, nombre: "Elevación lateral con mancuerna a una mano", anim: { ...A.lateralDb, props: [db()] } },
    ],
    pasos: ["Ligera flexión de codos.", "Eleva los brazos hacia los lados hasta la altura de los hombros.", "Lidera con los codos, no con las manos.", "Baja lento."],
    errores: ["Encoger los trapecios.", "Balancear el cuerpo."],
    consejo: "El deltoides lateral responde bien a volúmenes altos y repeticiones medias-altas." },
  { id: "deltoide_post", nombre: "Deltoides posterior", musculo: "hombros", secundarios: ["espalda"], tipo: "aislamiento",
    variantes: [
      { tipo: "maquina", nombre: "Contractora inversa", anim: { ...A.reverseFly, props: [{ k: "rect", x: 85, y: 140, w: 30, h: 8 }, { k: "pad", at: "hand", r: 5, front: true }, { k: "pad", at: "hand2", r: 5, front: true }] } },
      { tipo: "polea", nombre: "Face pull en polea", anim: A.facePull },
      { tipo: "libre", nombre: "Pájaros con mancuernas", anim: { ...A.reverseFly, props: db2 } },
      { tipo: "libre", uni: true, nombre: "Pájaro con mancuerna a una mano", anim: { ...A.reverseFly, props: [db()] } },
      { tipo: "polea", uni: true, nombre: "Apertura inversa en polea a una mano", anim: { ...A.reverseFly, props: [{ k: "line", x1: 18, y1: 20, x2: 18, y2: 186, w: 5 }, cable([20, 90], "hand")] } },
    ],
    pasos: ["Brazos casi rectos a la altura de los hombros.", "Abre hacia atrás separando las manos.", "Pausa un instante con las escápulas juntas.", "Vuelve controlado."],
    errores: ["Usar demasiado peso y tirar con la espalda baja."],
    consejo: "Mejora la salud del hombro y equilibra todo el volumen de empujes." },

  // BÍCEPS
  { id: "curl", nombre: "Curl de bíceps", musculo: "biceps", secundarios: [], tipo: "aislamiento",
    variantes: [
      { tipo: "libre", nombre: "Curl con mancuernas", anim: A.curlDb },
      { tipo: "libre", nombre: "Curl con barra", anim: A.curlBar },
      { tipo: "polea", nombre: "Curl en polea baja", anim: A.curlCable },
      { tipo: "maquina", nombre: "Curl predicador en máquina", anim: A.curlPreacher },
      { tipo: "libre", uni: true, nombre: "Curl concentrado con mancuerna", anim: A.curlDb },
      { tipo: "polea", uni: true, nombre: "Curl en polea baja a una mano", anim: A.curlCable },
      { tipo: "maquina", uni: true, nombre: "Curl predicador en máquina a un brazo", anim: A.curlPreacher },
    ],
    pasos: ["Codos pegados al cuerpo y quietos.", "Flexiona hasta contraer el bíceps.", "Baja hasta extender casi por completo."],
    errores: ["Mover los codos hacia delante.", "Balancear el tronco."],
    consejo: "El curl predicador enfatiza el bíceps en posición estirada." },
  { id: "curl_martillo", nombre: "Curl martillo", musculo: "biceps", secundarios: [], tipo: "aislamiento",
    variantes: [
      { tipo: "libre", nombre: "Curl martillo con mancuernas", anim: A.curlDb },
      { tipo: "polea", nombre: "Curl martillo con cuerda", anim: A.hammerCable },
      { tipo: "libre", uni: true, nombre: "Curl martillo a una mano", anim: A.curlDb },
      { tipo: "polea", uni: true, nombre: "Curl martillo en polea a una mano", anim: A.hammerCable },
    ],
    pasos: ["Agarre neutro (palmas enfrentadas).", "Flexiona sin mover los codos.", "Baja controlado."],
    errores: ["Girar las muñecas durante el movimiento."],
    consejo: "Trabaja también el braquial y el braquiorradial." },

  // TRÍCEPS
  { id: "triceps_polea", nombre: "Extensión de tríceps en polea", musculo: "triceps", secundarios: [], tipo: "aislamiento",
    variantes: [
      { tipo: "polea", nombre: "Extensión en polea alta (barra o cuerda)", anim: A.pushdown },
      { tipo: "maquina", nombre: "Extensión de tríceps en máquina", anim: A.tricepsMachine },
      { tipo: "polea", uni: true, nombre: "Extensión en polea alta a una mano", anim: A.pushdown },
      { tipo: "maquina", uni: true, nombre: "Extensión de tríceps en máquina a un brazo", anim: A.tricepsMachine },
    ],
    pasos: ["Codos pegados al costado.", "Extiende hasta bloquear sin mover los hombros.", "Sube controlado hasta unos 90°."],
    errores: ["Abrir los codos.", "Inclinarse encima del peso."],
    consejo: "Si usas cuerda, separa las manos al final para mayor contracción." },
  { id: "triceps_overhead", nombre: "Extensión de tríceps sobre la cabeza", musculo: "triceps", secundarios: [], tipo: "aislamiento",
    variantes: [
      { tipo: "libre", nombre: "Extensión con mancuerna sobre la cabeza", anim: A.overheadDb, avoid: ["hombro"] },
      { tipo: "polea", nombre: "Extensión en polea sobre la cabeza", anim: A.overheadCable, avoid: ["hombro"] },
      { tipo: "libre", nombre: "Press francés con barra Z", anim: A.skull },
      { tipo: "libre", uni: true, nombre: "Extensión sobre la cabeza con mancuerna a una mano", anim: A.overheadDb, avoid: ["hombro"] },
      { tipo: "polea", uni: true, nombre: "Extensión en polea sobre la cabeza a una mano", anim: A.overheadCable, avoid: ["hombro"] },
    ],
    sustituto: "triceps_polea",
    pasos: ["Brazos junto a la cabeza.", "Baja el peso por detrás estirando el tríceps.", "Extiende sin mover los codos."],
    errores: ["Abrir mucho los codos.", "Arquear la zona lumbar."],
    consejo: "Maeo et al. (2023) observaron más hipertrofia del tríceps con extensiones por encima de la cabeza que en posición neutra." },

  // CUÁDRICEPS
  { id: "sentadilla", nombre: "Sentadilla", musculo: "cuadriceps", secundarios: ["gluteos", "core"], tipo: "compuesto",
    variantes: [
      { tipo: "libre", nombre: "Sentadilla con barra", anim: A.squatBar, avoid: ["lumbar", "rodilla"] },
      { tipo: "maquina", nombre: "Sentadilla en multipower (Smith)", anim: A.squatSmith },
      { tipo: "libre", nombre: "Sentadilla goblet con mancuerna", anim: A.squatGoblet },
    ],
    sustituto: "prensa",
    pasos: ["Pies a la anchura de los hombros, puntas algo abiertas.", "Inspira y aprieta el abdomen.", "Baja llevando la cadera atrás y abajo, rodillas en la línea de los pies.", "Baja al menos hasta que el muslo quede paralelo y sube empujando el suelo."],
    errores: ["Rodillas hacia dentro.", "Levantar los talones o redondear la espalda abajo."],
    consejo: "La profundidad completa trabaja más glúteo y aductores que la sentadilla parcial." },
  { id: "prensa", nombre: "Prensa de piernas", musculo: "cuadriceps", secundarios: ["gluteos"], tipo: "compuesto",
    variantes: [{ tipo: "maquina", nombre: "Prensa inclinada 45°", anim: A.legPress },
      { tipo: "maquina", uni: true, nombre: "Prensa a una pierna", anim: A.legPress }],
    pasos: ["Espalda y glúteos pegados al respaldo.", "Pies a la anchura de los hombros en el centro de la plataforma.", "Baja hasta unos 90° de rodilla o más sin despegar la pelvis.", "Empuja sin bloquear del todo las rodillas."],
    errores: ["Despegar la pelvis del asiento al bajar.", "Bloquear las rodillas de golpe."],
    consejo: "Permite cargar las piernas sin fatigar la zona lumbar: ideal para principiantes y para volumen." },
  { id: "extension_cuad", nombre: "Extensión de cuádriceps", musculo: "cuadriceps", secundarios: [], tipo: "aislamiento",
    variantes: [{ tipo: "maquina", nombre: "Extensión de cuádriceps en máquina", anim: A.legExt },
      { tipo: "maquina", uni: true, nombre: "Extensión de cuádriceps a una pierna", anim: A.legExt }],
    pasos: ["Ajusta el respaldo para que la rodilla quede alineada con el eje de la máquina.", "Extiende las piernas por completo.", "Pausa arriba y baja controlado."],
    errores: ["Dar tirones.", "Levantar la cadera del asiento."],
    consejo: "Única forma de entrenar el recto femoral en posición acortada; complementa a la sentadilla." },
  { id: "zancadas", nombre: "Zancadas", musculo: "cuadriceps", secundarios: ["gluteos"], tipo: "compuesto",
    variantes: [
      { tipo: "libre", uni: true, nombre: "Zancadas con mancuernas", anim: A.lunge, avoid: ["rodilla"] },
      { tipo: "libre", uni: true, nombre: "Sentadilla búlgara", anim: A.bulgarian, avoid: ["rodilla"] },
      { tipo: "maquina", uni: true, nombre: "Zancada en multipower", anim: A.lungeSmith, avoid: ["rodilla"] },
    ],
    sustituto: "prensa",
    pasos: ["Da un paso largo.", "Baja en vertical hasta que la rodilla trasera casi toque el suelo.", "Empuja con la pierna delantera."],
    errores: ["Paso demasiado corto.", "Rodilla delantera hacia dentro."],
    consejo: "Un paso más largo y el torso inclinado enfatizan el glúteo." },

  // ISQUIOS
  { id: "peso_muerto_rumano", nombre: "Peso muerto rumano", musculo: "isquios", secundarios: ["gluteos", "espalda"], tipo: "compuesto",
    variantes: [
      { tipo: "libre", nombre: "Peso muerto rumano con barra", anim: A.rdl, avoid: ["lumbar"] },
      { tipo: "libre", nombre: "Peso muerto rumano con mancuernas", anim: A.rdlDb, avoid: ["lumbar"] },
      { tipo: "polea", nombre: "Pull-through en polea", anim: A.pullThrough },
      { tipo: "libre", uni: true, nombre: "Peso muerto rumano a una pierna con mancuerna", anim: A.rdlDb, avoid: ["lumbar"] },
    ],
    sustituto: "curl_femoral",
    pasos: ["Rodillas ligeramente flexionadas y fijas.", "Lleva la cadera hacia atrás con la espalda neutra.", "Baja la barra pegada a las piernas hasta notar estiramiento en los isquios.", "Sube empujando la cadera hacia delante."],
    errores: ["Redondear la espalda.", "Convertirlo en una sentadilla doblando las rodillas."],
    consejo: "El estímulo está en el estiramiento: prioriza bajar lento y controlado." },
  { id: "curl_femoral", nombre: "Curl femoral", musculo: "isquios", secundarios: ["gemelos"], tipo: "aislamiento",
    variantes: [
      { tipo: "maquina", nombre: "Curl femoral sentado", anim: A.legCurlSeated },
      { tipo: "maquina", nombre: "Curl femoral tumbado", anim: A.legCurlLying },
      { tipo: "polea", uni: true, nombre: "Curl femoral en polea con tobillera", anim: A.legCurlCable },
      { tipo: "maquina", uni: true, nombre: "Curl femoral sentado a una pierna", anim: A.legCurlSeated },
      { tipo: "maquina", uni: true, nombre: "Curl femoral tumbado a una pierna", anim: A.legCurlLying },
    ],
    pasos: ["Rodilla alineada con el eje de la máquina.", "Flexiona las rodillas al máximo.", "Vuelve despacio hasta extender."],
    errores: ["Levantar la cadera.", "Recortar el recorrido."],
    consejo: "Maeo et al. (2021) encontraron más hipertrofia de isquios con el curl sentado que tumbado." },

  // GLÚTEOS
  { id: "hip_thrust", nombre: "Hip thrust", musculo: "gluteos", secundarios: ["isquios"], tipo: "compuesto",
    variantes: [
      { tipo: "libre", nombre: "Hip thrust con barra", anim: A.hipThrust },
      { tipo: "maquina", nombre: "Hip thrust en máquina", anim: A.hipThrustMachine },
      { tipo: "libre", uni: true, nombre: "Hip thrust a una pierna", anim: { ...A.hipThrust, props: A.hipThrust.props.slice(0, 1) } },
    ],
    pasos: ["Apoya la parte baja de las escápulas en el banco.", "Pies a la anchura de la cadera, espinillas verticales arriba.", "Sube la cadera apretando glúteos, mentón hacia el pecho.", "Baja controlado."],
    errores: ["Hiperextender la zona lumbar en lugar de extender la cadera."],
    consejo: "Máxima tensión del glúteo en posición acortada; complementa sentadillas y zancadas." },
  { id: "patada_gluteo", nombre: "Patada de glúteo", musculo: "gluteos", secundarios: [], tipo: "aislamiento",
    variantes: [
      { tipo: "polea", uni: true, nombre: "Patada de glúteo en polea", anim: A.kickbackCable },
      { tipo: "maquina", uni: true, nombre: "Patada de glúteo en máquina", anim: A.kickbackMachine },
    ],
    pasos: ["Torso ligeramente inclinado y abdomen firme.", "Lleva la pierna atrás extendiendo la cadera.", "Aprieta el glúteo sin arquear la espalda.", "Vuelve despacio."],
    errores: ["Arquear la zona lumbar para subir más."],
    consejo: "Buen ejercicio de aislamiento con baja fatiga sistémica." },

  // GEMELOS
  { id: "gemelos_pie", nombre: "Elevación de gemelos de pie", musculo: "gemelos", secundarios: [], tipo: "aislamiento",
    variantes: [
      { tipo: "maquina", nombre: "Gemelos en máquina de pie", anim: A.calfMachine },
      { tipo: "libre", nombre: "Gemelos con mancuerna en escalón", anim: A.calfStand },
      { tipo: "libre", uni: true, nombre: "Gemelos a una pierna con mancuerna en escalón", anim: A.calfStand },
    ],
    pasos: ["Puntas en el borde del escalón.", "Baja el talón hasta el máximo estiramiento y pausa 1-2 s.", "Sube todo lo posible."],
    errores: ["Rebotar abajo.", "Recorrido corto."],
    consejo: "La pausa en estiramiento elimina el rebote elástico y aumenta el estímulo." },
  { id: "gemelos_sentado", nombre: "Elevación de gemelos sentado", musculo: "gemelos", secundarios: [], tipo: "aislamiento",
    variantes: [{ tipo: "maquina", nombre: "Gemelos en máquina sentado", anim: A.calfSeated },
      { tipo: "maquina", uni: true, nombre: "Gemelos en máquina sentado a una pierna", anim: A.calfSeated }],
    pasos: ["Almohadilla sobre los muslos cerca de las rodillas.", "Baja el talón al máximo.", "Sube y aprieta."],
    errores: ["Rebotar."],
    consejo: "Con la rodilla flexionada trabaja sobre todo el sóleo." },

  // CORE
  { id: "plancha", nombre: "Plancha", musculo: "core", secundarios: [], tipo: "aislamiento", tiempo: true,
    variantes: [{ tipo: "libre", nombre: "Plancha frontal", anim: A.plank }],
    pasos: ["Antebrazos bajo los hombros.", "Cuerpo recto de la cabeza a los talones.", "Aprieta glúteos y abdomen y respira con normalidad."],
    errores: ["Hundir la cadera.", "Elevar demasiado el glúteo."],
    consejo: "Se registra por tiempo: usa el temporizador de ejercicio." },
  { id: "crunch", nombre: "Encogimiento abdominal", musculo: "core", secundarios: [], tipo: "aislamiento",
    variantes: [
      { tipo: "polea", nombre: "Crunch en polea alta", anim: A.cableCrunch },
      { tipo: "maquina", nombre: "Crunch en máquina", anim: A.crunchMachine },
      { tipo: "libre", nombre: "Crunch en el suelo", anim: A.crunch },
    ],
    pasos: ["Flexiona el tronco enrollando la columna.", "Lleva las costillas hacia la pelvis.", "Vuelve controlado."],
    errores: ["Tirar con los brazos o el cuello."],
    consejo: "El abdomen puede progresar en carga como cualquier otro músculo." },
  { id: "elev_piernas", nombre: "Elevación de piernas", musculo: "core", secundarios: [], tipo: "aislamiento",
    variantes: [
      { tipo: "libre", nombre: "Elevación de piernas colgado", anim: A.legRaise },
      { tipo: "maquina", nombre: "Elevación de rodillas en silla romana", anim: A.captain },
    ],
    pasos: ["Cuerpo estable sin balanceo.", "Eleva las piernas enrollando la pelvis.", "Baja lento."],
    errores: ["Balancearse.", "Solo flexionar la cadera sin enrollar la pelvis."],
    consejo: "Empieza con las rodillas flexionadas si te cuesta." },
];

export const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
