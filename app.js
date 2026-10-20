(() => {
'use strict';

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ls = {
  get(k, d) { try { const v = localStorage.getItem('vr26.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('vr26.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  del(k) { try { localStorage.removeItem('vr26.' + k); } catch (e) {} }
};
const rid = n => { const a = 'abcdefghijkmnpqrstuvwxyz23456789'; let s = ''; const b = new Uint8Array(n); try { crypto.getRandomValues(b); } catch (e) { for (let i = 0; i < n; i++) b[i] = Math.random() * 256; } for (const x of b) s += a[x % 32]; return s; };
const shuffle = (arr, rnd = Math.random) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = n => Array.from({length: n}, (_, i) => i);
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const seeded = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return mulberry(h >>> 0); };
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const upLetters = s => String(s || '').toUpperCase().replace(/[ÁÀÄÂ]/g, 'A').replace(/[ÉÈËÊ]/g, 'E').replace(/[ÍÌÏÎ]/g, 'I').replace(/[ÓÒÖÔ]/g, 'O').replace(/[ÚÙÜÛ]/g, 'U').replace(/[^A-ZÑ]/g, '');
const isImg = s => typeof s === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s) && s.length < 400000;
let toastT = 0;
function toast(msg) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2800); }
const params = new URLSearchParams(location.search);

/* ---------- contenido ---------- */
const NAMES = ['Diegonio', 'Luismi', 'Cebollo', 'Manu Manuel', 'Adrián', 'Antrolio', 'Nacto', 'Sales Director at Alge Protech Spain'];
const PAIR_NAMES = ['Mario y Luigi', 'Sonic y Tails', 'Crash y Coco', 'Ash y Pikachu', 'Timón y Pumba', 'Pinky y Cerebro', 'Ren y Stimpy', 'Banjo y Kazooie', 'Jak y Daxter', 'Chip y Chop', 'Bob Esponja y Patricio', 'Goku y Krilin', 'Spyro y Sparx', 'Ratchet y Clank'];
const TRIVIA = [
  {c: 'Dibujos', q: '¿Cómo se llama el maestro de Goku que vive en la Kame House?', o: ['El Duende Tortuga', 'Karin', 'Kaito', 'Piccolo']},
  {c: 'Dibujos', q: 'En «Oliver y Benji», ¿cómo se llama el primer equipo de Oliver?', o: ['New Team', 'Toho', 'Muppet', 'Furano']},
  {c: 'Cine', q: '¿A qué velocidad tiene que ir el DeLorean para viajar en el tiempo?', o: ['88 millas por hora', '100 millas por hora', '77 millas por hora', '121 millas por hora']},
  {c: 'Series', q: 'En «Verano azul», ¿cómo se llama el barco de Chanquete?', o: ['La Dorada', 'La Gaviota', 'La Perla', 'La Niña']},
  {c: 'Videojuegos', q: '¿De qué país es Blanka en «Street Fighter II»?', o: ['Brasil', 'México', 'India', 'Tailandia']},
  {c: 'Bandas sonoras', q: '¿Quién compuso la banda sonora de «La guerra de las galaxias» (1977)?', o: ['John Williams', 'Hans Zimmer', 'Ennio Morricone', 'Vangelis']},
  {c: 'Tele', q: '¿Cómo se llamaban los robots de «La bola de cristal»?', o: ['Los Electroduendes', 'Los Robotines', 'Los Chispitas', 'Los Metalines']},
  {c: 'Series', q: '¿Cómo se llama el coche de «El coche fantástico»?', o: ['KITT', 'KARR', 'HAL', 'Herbie']},
  {c: 'Videojuegos', q: '¿En qué año llegó a España la primera PlayStation?', o: ['1995', '1993', '1997', '1999']},
  {c: 'Cine', q: 'En «Los Cazafantasmas», ¿qué monstruo gigante se pasea por Nueva York al final?', o: ['El hombre de malvavisco', 'Godzilla', 'Un pollo gigante', 'King Kong']},
  {c: 'Series', q: '¿Cómo se llama la cafetería de «Friends»?', o: ['Central Perk', 'Monk’s Café', 'Luke’s', 'Moe’s']},
  {c: 'Bandas sonoras', q: '¿Quién compuso la música de «El bueno, el feo y el malo»?', o: ['Ennio Morricone', 'John Williams', 'Bill Conti', 'Jerry Goldsmith']}
];
const FINAL = [
  {c: 'Videojuegos', q: 'Tetris lo creó Alexéi Pázhitnov. ¿En qué país?', o: ['Unión Soviética', 'Japón', 'Estados Unidos', 'Hungría']},
  {c: 'Cine', q: '¿Qué película ganó el Óscar a mejor película en la gala de 1998?', o: ['Titanic', 'Forrest Gump', 'Gladiator', 'American Beauty']},
  {c: 'Bandas sonoras', q: '¿Quién compuso la banda sonora de «Regreso al futuro»?', o: ['Alan Silvestri', 'John Williams', 'James Horner', 'Danny Elfman']},
  {c: 'Series', q: '¿Cómo se llama el mayordomo de «El príncipe de Bel-Air»?', o: ['Geoffrey', 'Alfred', 'Jarvis', 'Niles']},
  {c: 'Dibujos', q: 'En «Bola de Dragón», ¿cómo se llama la nube en la que vuela Goku?', o: ['Kinton', 'Shenron', 'Kaio', 'Popo']},
  {c: 'Dibujos', q: 'En «Los Caballeros del Zodiaco», ¿cuál es la constelación de Seiya?', o: ['Pegaso', 'Dragón', 'Cisne', 'Andrómeda']}
];
/* t: respuesta; s: búsqueda en el catálogo; k: palabra que debe salir en el artista o el título */
const SONGS = [
  {t: 'Bola de Dragón Z', s: 'Cha-La Head-Cha-La Hironobu Kageyama', k: 'cha'},
  {t: 'Los Cazafantasmas', s: 'Ghostbusters Ray Parker Jr', k: 'ghostbusters'},
  {t: 'Regreso al futuro', s: 'Back to the Future Alan Silvestri', k: 'future'},
  {t: 'Los Caballeros del Zodiaco', s: 'Pegasus Fantasy Make-Up', k: 'pegasus'},
  {t: 'Super Mario Bros.', s: 'Super Mario Bros theme Koji Kondo', k: 'mario'},
  {t: 'Pokémon', s: 'Pokemon Theme Jason Paige', k: 'pok'},
  {t: 'Friends', s: 'I\'ll Be There for You The Rembrandts', k: 'rembrandts'},
  {t: 'El príncipe de Bel-Air', s: 'Fresh Prince of Bel-Air theme', k: 'bel'},
  {t: 'Indiana Jones', s: 'Raiders March John Williams', k: 'raiders'},
  {t: 'Parque Jurásico', s: 'Theme from Jurassic Park John Williams', k: 'jurassic'},
  {t: 'Rocky', s: 'Gonna Fly Now Bill Conti', k: 'fly'},
  {t: 'Top Gun', s: 'Danger Zone Kenny Loggins', k: 'danger'},
  {t: 'Titanic', s: 'My Heart Will Go On Celine Dion', k: 'heart'},
  {t: 'Los Simpson', s: 'The Simpsons Theme Danny Elfman', k: 'simpsons'},
  {t: 'Mazinger Z', s: 'Mazinger Z Ichiro Mizuki', k: 'mazinger'},
  {t: 'El Rey León', s: 'Hakuna Matata Lion King', k: 'hakuna'},
  {t: 'Tetris', s: 'Tetris theme Korobeiniki', k: 'tetris'},
  {t: 'The Legend of Zelda', s: 'Legend of Zelda main theme', k: 'zelda'},
  {t: 'Misión imposible', s: 'Mission Impossible Theme Lalo Schifrin', k: 'mission'},
  {t: 'La guerra de las galaxias', s: 'Star Wars Main Title John Williams', k: 'star wars'},
  {t: 'Sonic the Hedgehog', s: 'Green Hill Zone Sonic', k: 'green hill'},
  {t: 'Oliver y Benji', s: 'Captain Tsubasa Moete Hero', k: 'hero'}
];
const WORDS = [
  {w: 'Pac-Man', alt: ['pacman', 'comecocos']}, {w: 'Tiburón', alt: ['jaws']}, {w: 'E.T.', alt: ['et', 'e t', 'el extraterrestre']},
  {w: 'Los Pitufos', alt: ['pitufo']}, {w: 'Titanic', alt: []}, {w: 'Super Mario', alt: ['mario', 'mario bros', 'super mario bros']},
  {w: 'Doraemon', alt: []}, {w: 'Batman', alt: []}, {w: 'El Rey León', alt: []}, {w: 'Tetris', alt: []},
  {w: 'Mazinger Z', alt: ['mazinger']}, {w: 'Shin Chan', alt: ['shinchan']}
];
const EMOJI = [
  {t: 'Titanic', e: '🚢🧊💔'}, {t: 'El Rey León', e: '🦁👑🌅'}, {t: 'Parque Jurásico', e: '🦖🏝️🚙'}, {t: 'Tiburón', e: '🦈🏖️🎶'},
  {t: 'Regreso al futuro', e: '🚗⚡🕰️'}, {t: 'Los Cazafantasmas', e: '👻🚫🔫'}, {t: 'E.T.', e: '👽🚲🌕'}, {t: 'Toy Story', e: '🤠🚀🧸'},
  {t: 'Buscando a Nemo', e: '🐠🔎🌊'}, {t: 'Harry Potter', e: '⚡🧙‍♂️👓'}, {t: 'El señor de los anillos', e: '💍🌋🧝'}, {t: 'Matrix', e: '💊🕶️💻'},
  {t: 'Shrek', e: '🟢👹🏰'}, {t: 'Indiana Jones', e: '🤠🐍🗿'}, {t: 'Top Gun', e: '✈️🕶️🏐'}, {t: 'Rocky', e: '🥊🥚🏃'},
  {t: 'Forrest Gump', e: '🏃🍫🪶'}, {t: 'Los Simpson', e: '🍩🟡🛋️'}, {t: 'Pokémon', e: '⚡🐭🔴'}, {t: 'Bola de Dragón', e: '🐉🟠⭐'},
  {t: 'Oliver y Benji', e: '⚽🇯🇵🥅'}, {t: 'Verano azul', e: '☀️🚲⛵'}, {t: 'Friends', e: '☕🛋️👫'}, {t: 'El coche fantástico', e: '🚗🗣️🔴'},
  {t: 'Super Mario', e: '🍄🔧👨'}, {t: 'Pac-Man', e: '🟡👻🍒'}, {t: 'Los Pitufos', e: '🔵🍄🏘️'}, {t: 'Doraemon', e: '🐱🔵🚪'},
  {t: 'Gremlins', e: '🐾💧🌙'}, {t: 'Los Goonies', e: '🗺️🏴‍☠️💎'}
];
const ROUNDS = [
  {id: 'trivial', kind: 'quiz', name: 'Cultura de sofá', steps: 10, secs: 20, pool: 'TRIVIA', rules: [
    'Pregunta en la tele, respuesta en el móvil. Cada uno contesta en el suyo.',
    'Cada acierto suma 1 punto a tu pareja.',
    'El acierto más rápido de cada pregunta suma 1 punto más.']},
  {id: 'cifras', kind: 'cifras', name: 'Cifras', steps: 3, secs: 60, rules: [
    'Combina las seis cifras con sumas, restas, multiplicaciones y divisiones para acercarte al número.',
    'En el móvil: toca una cifra, una operación y otra cifra. El resultado se convierte en una ficha nueva.',
    'Cuenta el mejor de la pareja. Exacto: 10 puntos. A 5 o menos: 7. A 10 o menos: 5.']},
  {id: 'dibujo', kind: 'dibujo', name: 'Dibújamelo', steps: 4, secs: 80, rules: [
    'En cada pareja, uno dibuja en su móvil y el otro lo ve en el suyo y escribe la respuesta.',
    'Todos los títulos son de pelis, series, dibujos o videojuegos. Prohibido escribir letras o números.',
    'Primera pareja en acertar: 5 puntos. Segunda: 4. Tercera: 3. El resto que acierte: 2. Se turna quién dibuja.']},
  {id: 'cancion', kind: 'cancion', name: '¿Qué suena?', steps: 8, rules: [
    'La música la pone el portátil: fragmentos de 2, 5, 10 y 20 segundos de una canción al azar.',
    'Cada pareja elige una respuesta entre cuatro. Vale la primera que marque cualquiera de los dos.',
    'Si acertáis durante el primer fragmento: 4 puntos. Luego 3, 2 y 1.']},
  {id: 'letras', kind: 'letras', name: 'Letras', steps: 3, secs: 45, rules: [
    'Forma la palabra más larga que puedas con las nueve letras, tocándolas en el móvil.',
    'Al acabar, el jurado (todos) valida las palabras en la tele.',
    'Cuenta la palabra más larga de la pareja: tantos puntos como letras. Con las nueve, 18.']},
  {id: 'bingo', kind: 'bingo', name: 'Bingo de emojis', steps: 1, rules: [
    'Cada uno tiene en el móvil un cartón con nueve pelis y series.',
    'En la tele salen pistas en emojis. Si es una de tu cartón, márcala.',
    'Primera línea: 5 puntos. Bingo: 10 y se acaba. Cantar en falso: −2.']},
  {id: 'tapas', kind: 'tapas', name: 'Concurso de tapas', steps: 1, rules: [
    'Primero cada uno sube desde el móvil el nombre y una foto de su tapa.',
    'Después cada uno vota su podio: primera, segunda y tercera (3, 2 y 1 votos). No vale votarse.',
    'Al campeonato: la mejor tapa suma 10 puntos a su pareja, la segunda 7, la tercera 5, la cuarta 3 y el resto 1.']},
  {id: 'final', kind: 'quiz', name: 'Duelo final', steps: 6, secs: 15, mult: 2, pool: 'FINAL', rules: [
    'Seis preguntas más difíciles y con menos tiempo.',
    'Todo vale doble: 2 puntos por acierto y 2 más para el más rápido.',
    'Si hay empate al final, se desempata a los dados de póker.']}
];
const STAGES = [2, 5, 10, 20];
const STAGE_PTS = [4, 3, 2, 1];
const STAGE_GAP = 7000;
const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const TAPA_PTS = [10, 7, 5, 3];

/* ---------- lógica compartida ---------- */
function bingoCard(gid, pid) { return shuffle(range(EMOJI.length), seeded(gid + ':' + pid)).slice(0, 9); }
function canBuild(word, letters) {
  const c = {}; for (const l of letters) c[l] = (c[l] || 0) + 1;
  for (const ch of upLetters(word)) { if (!c[ch]) return false; c[ch]--; }
  return true;
}
function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = range(n + 1);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
function cleanGuess(s) { return norm(s).replace(/[^a-z0-9 ]/g, ' ').replace(/\b(el|la|los|las|un|una)\b/g, ' ').replace(/\s+/g, ''); }
function matchWord(g, w) {
  const x = cleanGuess(g); if (!x) return false;
  return [w.w, ...(w.alt || [])].some(o => { const c = cleanGuess(o); return c === x || (c.length >= 5 && lev(c, x) <= (c.length > 8 ? 2 : 1)); });
}
function genCifras() {
  const smalls = shuffle([1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10]);
  const bigs = shuffle([25, 50, 75, 100]);
  const nb = Math.random() < .5 ? 1 : 2;
  return {t: 101 + Math.floor(Math.random() * 899), n: shuffle([...bigs.slice(0, nb), ...smalls.slice(0, 6 - nb)])};
}
function solveCifras(nums, target) {
  let best = {d: Infinity, v: null, steps: []};
  const seen = new Set(); const t0 = Date.now();
  const rec = (arr, steps) => {
    for (const v of arr) { const d = Math.abs(v - target); if (d < best.d) { best = {d, v, steps: steps.slice()}; if (!d) return true; } }
    if (arr.length < 2 || Date.now() - t0 > 2500) return false;
    const key = arr.slice().sort((a, b) => a - b).join(',');
    if (seen.has(key)) return false; seen.add(key);
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
      const a = Math.max(arr[i], arr[j]), b = Math.min(arr[i], arr[j]);
      const rest = arr.filter((_, x) => x !== i && x !== j);
      const c = [[a + b, '+'], [a * b, '×'], [a - b, '−']];
      if (b > 0 && a % b === 0) c.push([a / b, '÷']);
      for (const [r, op] of c) {
        if (r <= 0 || ((op === '×' || op === '÷') && b === 1) || (op === '−' && r === b)) continue;
        steps.push({a, b, op, r});
        if (rec([...rest, r], steps)) return true;
        steps.pop();
      }
    }
    return false;
  };
  rec(nums, []);
  const need = [best.v], keep = [];
  for (let i = best.steps.length - 1; i >= 0; i--) { const s = best.steps[i]; const k = need.indexOf(s.r); if (k >= 0) { need.splice(k, 1); need.push(s.a, s.b); keep.unshift(s); } }
  return {v: best.v, d: best.d, steps: keep.map(s => `${s.a} ${s.op} ${s.b} = ${s.r}`)};
}
function genLetras() {
  const V = 'AAAAAAAAAAAAEEEEEEEEEEEEEIIIIIIOOOOOOOOOUUUU', C = 'SSSSSSRRRRRRNNNNNNDDDDDLLLLLCCCCCTTTTTMMMMPPPBBGGVVYQHHFZJÑX';
  const nv = Math.random() < .5 ? 3 : 4; const out = [];
  for (let i = 0; i < nv; i++) out.push(V[Math.floor(Math.random() * V.length)]);
  for (let i = nv; i < 9; i++) out.push(C[Math.floor(Math.random() * C.length)]);
  return shuffle(out);
}
const B36 = '0123456789abcdefghijklmnopqrstuvwxyz';
const DSCALE = 1200, DMAX = 6000;
const encPt = v => { v = Math.max(0, Math.min(1295, Math.round(v))); return B36[Math.floor(v / 36)] + B36[v % 36]; };
const decPt = s => B36.indexOf(s[0]) * 36 + B36.indexOf(s[1]);
function encStrokes(strokes) { return strokes.filter(s => s.length).map(s => s.map(p => encPt(p[0]) + encPt(p[1])).join('')).join('.'); }
function decStrokes(str) {
  if (typeof str !== 'string' || !str) return [];
  return str.split('.').map(seg => { const pts = []; for (let i = 0; i + 3 < seg.length; i += 4) pts.push([decPt(seg.slice(i, i + 2)), decPt(seg.slice(i + 2, i + 4))]); return pts; });
}
function paint(cv, strokes) {
  const r = cv.getBoundingClientRect(); const dpr = Math.min(3, window.devicePixelRatio || 1);
  const size = Math.max(10, Math.round(r.width));
  if (cv.width !== size * dpr) { cv.width = size * dpr; cv.height = size * dpr; }
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--cream').trim() || 'white';
  ctx.lineWidth = Math.max(2.5, size * .012); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const k = size / DSCALE;
  for (const s of strokes) {
    if (!s.length) continue; ctx.beginPath(); ctx.moveTo(s[0][0] * k, s[0][1] * k);
    if (s.length === 1) ctx.lineTo(s[0][0] * k + .1, s[0][1] * k + .1);
    for (let i = 1; i < s.length; i++) ctx.lineTo(s[i][0] * k, s[i][1] * k);
    ctx.stroke();
  }
}
function clockSVG() {
  let s = '<svg class="clock" viewBox="0 0 200 200" aria-hidden="true"><circle class="ck-bg" cx="100" cy="100" r="96"/>';
  for (let i = 0; i < 30; i++) s += `<rect class="ck-seg on" x="95" y="10" width="10" height="24" rx="3" transform="rotate(${i * 12} 100 100)"/>`;
  return s + '<text class="ck-num" x="100" y="121" text-anchor="middle">0</text></svg>';
}
function setClock(leftMs, totalMs) {
  const svg = $('.clock'); if (svg) {
    const lit = Math.ceil(Math.max(0, leftMs) / totalMs * 30);
    $$('.ck-seg', svg).forEach((el, i) => el.classList.toggle('on', i < lit));
    $('.ck-num', svg).textContent = Math.ceil(Math.max(0, leftMs) / 1000);
  }
  const bar = $('.tbar i'); if (bar) bar.style.width = Math.max(0, Math.min(100, leftMs / totalMs * 100)) + '%';
  const sc = $('.secs[data-timer]'); if (sc) sc.textContent = Math.ceil(Math.max(0, leftMs) / 1000) + ' s';
}
const logoHTML = small => `<div class="logo"><span class="l1">Campeonato Mundial</span><span class="l2">Villaraso 2026</span>${small ? '' : '<span class="l3">Edición otoño</span>'}</div>`;
const tilesWord = (w, cls = 'tl') => [...w].map(ch => ch === ' ' ? '<span style="width:12px"></span>' : `<span class="${cls}">${esc(ch)}</span>`).join('');
const optLetter = i => 'ABCD'[i];
const eqHTML = on => `<div class="eq${on ? ' on' : ''}" aria-hidden="true">${'<i></i>'.repeat(6)}</div>`;

function compressImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => {
      const m = 560, k = Math.min(1, m / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      let q = .72, d = c.toDataURL('image/jpeg', q);
      while (d.length > 90000 && q > .3) { q -= .1; d = c.toDataURL('image/jpeg', q); }
      res(d);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
    img.src = url;
  });
}

/* ---------- red: MQTT público, sin cuentas ---------- */
const BROKERS = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081'];
function brokerUrl(i) { return params.get('broker') || BROKERS[i] || BROKERS[0]; }
function makeNet(code, url, isHost, me) {
  const base = 'vr26/' + code + '/';
  const L = {st: [], peers: [], img: [], conn: []};
  const peers = new Map(), seen = new Map();
  let mine = {}, pubT = 0, lastPub = 0, peersT = 0, up = false;
  const client = window.mqtt.connect(url, {clientId: 'vr' + rid(10), keepalive: 30, reconnectPeriod: 2500, connectTimeout: 9000, clean: true});
  const firePeers = () => { if (peersT) return; peersT = setTimeout(() => { peersT = 0; const ch = {peers: api.peers()}; L.peers.forEach(f => f(ch)); }, 60); };
  const pubPres = () => {
    pubT = 0; lastPub = Date.now();
    if (!isHost) client.publish(base + 'p/' + me, JSON.stringify(mine), {retain: true, qos: 0});
  };
  client.on('connect', () => {
    up = true;
    client.subscribe([base + 'st', base + 'p/+', base + 'img/+'], {qos: 0});
    if (!isHost && Object.keys(mine).length) pubPres();
    L.conn.forEach(f => f(true));
  });
  client.on('close', () => { if (up) { up = false; L.conn.forEach(f => f(false)); } });
  client.on('error', () => {});
  client.on('message', (topic, buf) => {
    const t = topic.slice(base.length); let data;
    try { const s = buf.toString(); if (!s) return; data = JSON.parse(s); } catch (e) { return; }
    if (!data || typeof data !== 'object') return;
    if (t === 'st') { if (!isHost) L.st.forEach(f => f(data)); }
    else if (t.startsWith('p/')) { const id = t.slice(2, 40); peers.set(id, {peer: id, presence: data, isMe: id === me}); seen.set(id, Date.now()); firePeers(); }
    else if (t.startsWith('img/')) { const id = t.slice(4, 40); L.img.forEach(f => f(id, data)); }
  });
  const api = {
    emit(topic, data) { if (client.connected) client.publish(base + 'st', JSON.stringify(data), {retain: true, qos: 0}); return Promise.resolve(); },
    on(topic, f) { if (topic === 'st') L.st.push(f); return () => {}; },
    presence(patch) {
      for (const k in patch) { if (patch[k] === null) delete mine[k]; else mine[k] = patch[k]; }
      if (!pubT) pubT = setTimeout(pubPres, Math.max(0, 140 - (Date.now() - lastPub)));
      return Promise.resolve();
    },
    publishImg(data) { client.publish(base + 'img/' + me, JSON.stringify(data), {retain: true, qos: 1}); },
    peers() { return [...peers.values()]; },
    seenAt(id) { return seen.get(id) || 0; },
    onPeers(f) { L.peers.push(f); return () => {}; },
    onImg(f) { L.img.push(f); return () => {}; },
    onConnection(f) { L.conn.push(f); setTimeout(() => f(up), 0); return () => {}; },
    connected: () => up,
    end() { try { client.end(true); } catch (e) {} }
  };
  return api;
}
function joinURL(code, bi) {
  const u = new URL(location.href); u.search = ''; u.hash = '';
  u.searchParams.set('g', code); u.searchParams.set('b', String(bi));
  for (const k of ['broker', 'mockmusic']) if (params.get(k)) u.searchParams.set(k, params.get(k));
  return u.toString();
}
function qrSVG(text) {
  try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({cellSize: 8, margin: 2, scalable: true}); }
  catch (e) { return ''; }
}

/* ---------- música: avances de 30 s del catálogo de iTunes ---------- */
function silentWav() {
  const n = 8000 * 3, b = new ArrayBuffer(44 + n), v = new DataView(b); const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
  let s = ''; const u = new Uint8Array(b); for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return 'data:audio/wav;base64,' + btoa(s);
}
function itunes(term) {
  return new Promise((res, rej) => {
    const cb = 'itcb' + rid(8); const s = document.createElement('script');
    const done = () => { clearTimeout(t); delete window[cb]; s.remove(); };
    const t = setTimeout(() => { done(); rej(new Error('timeout')); }, 9000);
    window[cb] = d => { done(); res(d); };
    s.onerror = () => { done(); rej(new Error('net')); };
    s.src = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=15&country=ES&callback=${cb}`;
    document.head.appendChild(s);
  });
}
async function findTrack(song) {
  if (params.get('mockmusic')) return {url: silentWav(), label: 'Prueba sin sonido'};
  const d = await itunes(song.s);
  const rs = (d && d.results || []).filter(r => r.previewUrl);
  const k = norm(song.k);
  const good = rs.filter(r => norm(r.trackName + ' ' + r.artistName + ' ' + (r.collectionName || '')).includes(k));
  const pick = (good.length ? good : rs)[0];
  if (!pick) throw new Error('none');
  return {url: pick.previewUrl, label: `${pick.trackName} · ${pick.artistName}`};
}

/* ---------- estado global ---------- */
let room = null, roomState = 'pending';
const gameCode = (params.get('g') || '').replace(/[^a-z0-9]/g, '').slice(0, 12);
let role = gameCode ? 'player' : ls.get('role', null);

/* ================= PRESENTADOR ================= */
const H = {G: null, deadline: 0, lastSend: 0, sendT: 0, online: new Set(), onStr: '', menu: false, confirmNew: false, renderQ: false, saveT: 0, sorteoAnim: false,
  imgs: ls.get('imgs', {}), audio: null, musicT: 0, music: {}, musicCheck: false, playing: false};

function newGame() {
  return {
    gid: rid(6), bi: 0, phase: 'lobby', players: {}, pairs: [], r: -1, s: 0, step: null, ans: {}, res: null, draws: {}, log: [], deadline: 0, tapas: null, items: {},
    ord: {trivial: shuffle(range(TRIVIA.length)), final: range(FINAL.length), dibujo: shuffle(range(WORDS.length)), cancion: shuffle(range(SONGS.length))}
  };
}
const curRound = () => ROUNDS[H.G.r];
const stepKey = () => H.G.gid + '-' + H.G.r + '-' + H.G.s;
const pairOf = pid => H.G.pairs.find(p => p.m.includes(pid));
const pname = pid => (H.G.players[pid] && H.G.players[pid].n) || 'Alguien';
function saveSoon() { clearTimeout(H.saveT); H.saveT = setTimeout(() => ls.set('game', H.G), 300); }
function renderSoon() { if (H.renderQ) return; H.renderQ = true; requestAnimationFrame(() => { H.renderQ = false; if (role === 'host') hostRender(); }); }

function effPts(pts) {
  const out = {};
  for (const id in pts) { const p = H.G.pairs.find(x => x.id === id); if (!p) continue; out[id] = pts[id] * (p.x2 === H.G.r && pts[id] > 0 ? 2 : 1); }
  return out;
}
function tapaRace() {
  const G = H.G, votes = {}; for (const id in G.items) votes[id] = 0;
  let voters = 0;
  for (const p in G.ans) { if (!G.ans[p].f) continue; voters++; (G.ans[p].v || []).forEach((x, i) => { if (x in votes && x !== p) votes[x] += [3, 2, 1][i]; }); }
  return {votes, voters};
}
function pubStep() {
  const G = H.G, st = G.step; if (!st || G.r < 0) return null;
  switch (curRound().kind) {
    case 'quiz': return {q: st.q, c: st.c, o: st.o};
    case 'cifras': return {t: st.t, n: st.n};
    case 'letras': return {l: st.l};
    case 'dibujo': return {w: st.word.w, dr: st.dr, ok: Object.keys(G.ans).filter(p => G.ans[p].ok)};
    case 'cancion': { const pa = {}; for (const p in G.ans) { const pr = pairOf(p); if (pr) pa[pr.id] = [G.ans[p].v, p, G.ans[p].st]; } return {o: st.o, stage: st.stage, playing: H.playing, pa}; }
    case 'bingo': return {cl: st.cl, cur: st.cur, prev: st.prev, li: st.li, bi: st.bi, msg: st.msg};
    case 'tapas': { const items = {}; for (const id in G.items) items[id] = G.items[id].n; const r = tapaRace(); return {mode: st.mode, items, votes: r.votes, voters: r.voters}; }
    default: return {};
  }
}
function pubRes() {
  const G = H.G, res = G.res; if (G.phase !== 'reveal' || !res) return null;
  const out = {pts: effPts(res.pts)}; const st = G.step;
  switch (curRound().kind) {
    case 'quiz': out.ok = st.ok; break;
    case 'cancion': out.ok = st.ok; out.t = st.t; break;
    case 'cifras': out.sol = st.sol ? st.sol.steps : null; out.sv = st.sol ? st.sol.v : null; break;
    case 'letras': out.w = res.w; break;
    case 'dibujo': out.w = st.word.w; break;
    case 'tapas': out.rank = res.rank; break;
  }
  return out;
}
function pub() {
  const G = H.G; const names = {};
  for (const pid in G.players) names[pid] = G.players[pid].n;
  return {
    gid: G.gid, at: Date.now(), ph: G.phase, r: G.r, s: G.s, k: stepKey(), names,
    pairs: G.pairs.map(p => ({id: p.id, n: p.n, m: p.m, sc: p.sc, x2: p.x2})),
    left: G.phase === 'play' && H.deadline ? Math.max(0, H.deadline - Date.now()) : null,
    got: G.phase === 'play' ? Object.keys(G.ans) : [], d: G.phase === 'play' || G.phase === 'reveal' ? pubStep() : null, res: pubRes()
  };
}
function send(force) {
  if (!room || !H.G) return;
  const now = Date.now();
  if (!force && now - H.lastSend < 250) { if (!H.sendT) H.sendT = setTimeout(() => { H.sendT = 0; send(true); }, 270); return; }
  H.lastSend = now;
  room.emit('st', pub());
}
function changed() { saveSoon(); send(); renderSoon(); }

function hostPeers() {
  const G = H.G; if (!G || !room) return;
  const on = new Set(); let ch = false; const now = Date.now();
  for (const p of room.peers()) {
    const pr = p.presence || {};
    if (pr.role !== 'p' || typeof pr.pid !== 'string' || !pr.pid || pr.g !== G.gid) continue;
    const pid = pr.pid.slice(0, 24);
    if (now - room.seenAt(p.peer) < 25000) on.add(pid);
    const nm = String(pr.name || '').trim().slice(0, 40) || 'Jugador';
    if (!G.players[pid]) { G.players[pid] = {n: nm}; ch = true; }
    else if (G.players[pid].n !== nm) { G.players[pid].n = nm; ch = true; }
    if (G.phase === 'intro' && pr.x2 === G.r) { const pair = pairOf(pid); if (pair && pair.x2 == null) { pair.x2 = G.r; ch = true; } }
    if (G.phase === 'play' && pr.k === stepKey() && ingest(pid, pr)) ch = true;
  }
  const s = [...on].sort().join(',');
  if (s !== H.onStr) { H.onStr = s; H.online = on; ch = true; }
  if (ch) { changed(); checkAuto(); }
}
function hostImg(pid, data) {
  const G = H.G; if (!G || data.g !== G.gid || !G.players[pid]) return;
  const n = String(data.n || '').trim().slice(0, 40); if (!n) return;
  const img = isImg(data.img) ? data.img : null;
  const prev = G.items[pid];
  if (prev && prev.n === n && (H.imgs[pid] || null) === img) return;
  G.items[pid] = {n}; if (img) H.imgs[pid] = img; else delete H.imgs[pid];
  if (!ls.set('imgs', H.imgs)) { /* sin espacio: las fotos siguen en memoria */ }
  changed();
}
function ingest(pid, pr) {
  const G = H.G, st = G.step, R = curRound(), a = pr.a, prev = G.ans[pid], now = Date.now();
  const pair = pairOf(pid); if (!pair) return false;
  switch (R.kind) {
    case 'quiz':
      if (Number.isInteger(a) && a >= 0 && a < 4 && (!prev || prev.v !== a)) { G.ans[pid] = {v: a, t: now}; return true; }
      return false;
    case 'cancion':
      if (!st.stage || Object.keys(G.ans).some(p => pairOf(p) === pair)) return false;
      if (Number.isInteger(a) && a >= 0 && a < 4) { G.ans[pid] = {v: a, t: now, st: st.stage}; return true; }
      return false;
    case 'cifras':
      if (a && typeof a.v === 'number' && Number.isFinite(a.v) && (!prev || prev.v !== a.v)) {
        G.ans[pid] = {v: Math.round(a.v), ops: Array.isArray(a.ops) ? a.ops.slice(0, 6).map(x => String(x).slice(0, 32)) : [], t: now}; return true;
      }
      return false;
    case 'letras':
      if (typeof a === 'string') { const w = upLetters(a).slice(0, 9); if ((prev || w) && (!prev || prev.v !== w)) { G.ans[pid] = {v: w, t: now}; return true; } }
      return false;
    case 'dibujo':
      if (st.dr[pair.id] === pid) { if (typeof pr.d === 'string' && G.draws[pair.id] !== pr.d) { G.draws[pair.id] = pr.d.slice(0, DMAX + 200); saveSoon(); } return false; }
      if (typeof a === 'string' && a.trim() && !(prev && prev.ok) && (!prev || prev.v !== a)) { G.ans[pid] = {v: a.slice(0, 40), ok: matchWord(a, st.word), t: now}; return true; }
      return false;
    case 'bingo':
      if (a && Array.isArray(a.m)) {
        const m = a.m.filter(i => Number.isInteger(i) && i >= 0 && i < 9);
        const nx = Object.assign({}, prev || {}, {v: m, t: now});
        const isClaim = (a.c === 'l' || a.c === 'b') && a.cn && (!prev || prev.cn !== a.cn);
        if (isClaim) nx.cn = a.cn;
        if (prev && !isClaim && JSON.stringify(prev.v) === JSON.stringify(m)) return false;
        G.ans[pid] = nx;
        if (isClaim) bingoClaim(pid, a.c, m);
        return true;
      }
      return false;
    case 'tapas':
      if (st.mode !== 'vote' || (prev && prev.f)) return false;
      if (a && Array.isArray(a.v) && a.f) {
        const v = [...new Set(a.v.filter(x => typeof x === 'string' && x !== pid && G.items[x]))].slice(0, 3);
        G.ans[pid] = {v, f: true, t: now}; return true;
      }
      return false;
  }
  return false;
}
function addLive(pairId, n) { const r = H.G.res; r.pts[pairId] = (r.pts[pairId] || 0) + n; }
function bingoClaim(pid, c, m) {
  const G = H.G, st = G.step; if (st.bi) return;
  const card = bingoCard(G.gid, pid), called = new Set(st.cl), pair = pairOf(pid), nm = pname(pid);
  const okCell = i => m.includes(i) && called.has(card[i]);
  if (c === 'l') {
    if (st.li) { st.msg = `${nm} canta línea, pero ya estaba cantada`; return; }
    if (LINES.some(L => L.every(okCell))) { st.li = pid; addLive(pair.id, 5); st.msg = `¡Línea de ${nm}! +5 para ${pair.n}`; }
    else { addLive(pair.id, -2); st.msg = `${nm} ha cantado línea en falso: −2 para ${pair.n}`; }
  } else {
    if (range(9).every(okCell)) { st.bi = pid; addLive(pair.id, 10); st.msg = `¡BINGO de ${nm}! +10 para ${pair.n}`; setTimeout(toReveal, 2500); }
    else { addLive(pair.id, -2); st.msg = `${nm} ha cantado bingo en falso: −2 para ${pair.n}`; }
  }
}
function activePlayers() { return Object.keys(H.G.players).filter(pid => pairOf(pid)); }
function checkAuto() {
  const G = H.G; if (!G || G.phase !== 'play') return;
  const R = curRound(), st = G.step;
  const live = activePlayers().filter(pid => H.online.has(pid));
  if (R.kind === 'quiz' && live.length && live.every(pid => G.ans[pid])) { clearTimeout(H.autoT); H.autoT = setTimeout(toReveal, 900); }
  if (R.kind === 'cancion' && G.pairs.every(p => p.m.some(m => G.ans[m]))) { clearTimeout(H.autoT); H.autoT = setTimeout(toReveal, 900); }
  if (R.kind === 'dibujo') {
    const guessers = live.filter(pid => st.dr[pairOf(pid).id] !== pid);
    if (guessers.length && G.pairs.every(p => p.m.some(pid => G.ans[pid] && G.ans[pid].ok) || !p.m.some(pid => guessers.includes(pid)))) { clearTimeout(H.autoT); H.autoT = setTimeout(toReveal, 1200); }
  }
  if (R.kind === 'tapas' && st.mode === 'vote' && live.length && live.every(pid => G.ans[pid] && G.ans[pid].f)) { clearTimeout(H.autoT); H.autoT = setTimeout(toReveal, 3500); }
}

function drawPairs() {
  const G = H.G; const ids = shuffle(Object.keys(G.players)); const names = shuffle(PAIR_NAMES); const pairs = [];
  for (let i = 0; i + 1 < ids.length; i += 2) pairs.push({id: 'p' + (pairs.length + 1), n: names[pairs.length % names.length], m: [ids[i], ids[i + 1]], sc: 0, x2: null});
  if (ids.length % 2) { if (pairs.length) pairs[pairs.length - 1].m.push(ids[ids.length - 1]); else pairs.push({id: 'p1', n: names[0], m: [ids[0]], sc: 0, x2: null}); }
  G.pairs = pairs; G.log = []; G.tapas = null;
}
function songOptions(idx) {
  const others = shuffle(SONGS.map((s, i) => i).filter(i => i !== idx)).slice(0, 3).map(i => SONGS[i].t);
  const o = shuffle([SONGS[idx].t, ...others]);
  return {o, ok: o.indexOf(SONGS[idx].t)};
}
function makeStep(R, s) {
  const G = H.G;
  const liveOf = p => { const l = p.m.filter(id => !G.players[id] || !G.players[id].off); return l.length ? l : p.m; };
  switch (R.kind) {
    case 'quiz': { const pool = R.pool === 'FINAL' ? FINAL : TRIVIA; const item = pool[G.ord[R.id][s % pool.length]]; const order = shuffle([0, 1, 2, 3]); return {q: item.q, c: item.c, o: order.map(i => item.o[i]), ok: order.indexOf(0)}; }
    case 'cifras': { const g = genCifras(); return {t: g.t, n: g.n, sol: null}; }
    case 'letras': return {l: genLetras()};
    case 'dibujo': { const word = WORDS[G.ord.dibujo[s % WORDS.length]]; const dr = {}; for (const p of G.pairs) { const l = liveOf(p); dr[p.id] = l[s % l.length]; } return {word, dr}; }
    case 'cancion': {
      G.songPos = G.songPos == null ? 0 : G.songPos;
      let idx = null;
      for (let tries = 0; tries < SONGS.length; tries++) { const c = G.ord.cancion[G.songPos % SONGS.length]; G.songPos++; const m = H.music[c]; if (!m || m.url) { idx = c; break; } }
      if (idx == null) idx = G.ord.cancion[0];
      return Object.assign({idx, t: SONGS[idx].t, stage: 0}, songOptions(idx));
    }
    case 'bingo': return {cl: [], cur: null, prev: null, li: null, bi: null, msg: ''};
    case 'tapas': return {mode: 'entry'};
    default: return {};
  }
}
function startStep(s) {
  const G = H.G, R = curRound();
  stopMusic();
  G.s = s; G.ans = {}; G.draws = {}; G.step = makeStep(R, s);
  G.res = R.kind === 'bingo' ? {pts: {}} : null;
  H.deadline = R.secs ? Date.now() + R.secs * 1000 : 0; G.deadline = H.deadline;
  G.phase = 'play';
  if (R.kind === 'bingo') nextClue();
  if (R.kind === 'cifras') { const st = G.step; setTimeout(() => { if (G.step === st) { st.sol = solveCifras(st.n, st.t); saveSoon(); renderSoon(); send(); } }, 400); }
  if (R.kind === 'cancion') loadSong(G.step.idx);
  changed(); send(true);
}
function nextClue() {
  const st = H.G.step; const left = range(EMOJI.length).filter(i => !st.cl.includes(i));
  if (!left.length) return;
  if (st.cur != null) st.prev = EMOJI[st.cur].t;
  const i = left[Math.floor(Math.random() * left.length)]; st.cl.push(i); st.cur = i; st.msg = '';
}

/* ----- música en el portátil ----- */
function audioEl() { if (!H.audio) { H.audio = new Audio(); H.audio.preload = 'auto'; } return H.audio; }
function loadSong(idx) {
  const m = H.music[idx];
  if (m && (m.url || m.err)) { if (m.url) audioEl().src = m.url; renderSoon(); return Promise.resolve(m); }
  if (m && m.p) return m.p;
  const p = findTrack(SONGS[idx]).then(r => { H.music[idx] = r; if (H.G && H.G.step && H.G.step.idx === idx) audioEl().src = r.url; renderSoon(); return r; })
    .catch(() => { H.music[idx] = {err: true}; renderSoon(); return H.music[idx]; });
  H.music[idx] = {p}; return p;
}
function prefetchSongs(all) { const list = all ? range(SONGS.length) : H.G.ord.cancion.slice(0, 10); list.forEach(i => loadSong(i)); }
function stopMusic() { clearTimeout(H.musicT); H.musicT = 0; H.playing = false; if (H.audio) { try { H.audio.pause(); } catch (e) {} } }
function playFor(ms) {
  const a = audioEl(); try { a.currentTime = 0; } catch (e) {}
  H.playing = true; const pr = a.play(); if (pr && pr.catch) pr.catch(() => { toast('El navegador no deja sonar la música: pulsa otra vez el botón.'); });
  return new Promise(res => { H.musicT = setTimeout(() => { try { a.pause(); } catch (e) {} H.playing = false; res(); }, ms); });
}
async function runStage(n) {
  const G = H.G; if (!G || G.phase !== 'play' || curRound().kind !== 'cancion') return;
  const st = G.step; clearTimeout(H.musicT);
  st.stage = n; H.playing = true; changed(); send(true);
  await playFor(STAGES[n - 1] * 1000);
  if (G.phase !== 'play' || G.step !== st) return;
  changed(); send(true);
  H.musicT = setTimeout(() => { if (G.phase === 'play' && G.step === st) { if (n < 4) runStage(n + 1); else toReveal(); } }, STAGE_GAP);
}
function swapSong() {
  const G = H.G; stopMusic();
  const used = new Set([G.step.idx]);
  const cands = G.ord.cancion.filter(i => !used.has(i) && !(H.music[i] && H.music[i].err));
  const idx = cands[Math.floor(Math.random() * cands.length)];
  if (idx == null) { toast('No quedan canciones disponibles.'); return; }
  Object.assign(G.step, {idx, t: SONGS[idx].t, stage: 0}, songOptions(idx)); G.ans = {};
  loadSong(idx); changed(); send(true);
}

function computeRes() {
  const G = H.G, R = curRound(), st = G.step, A = G.ans, pts = {};
  const add = (pid, n) => { const p = pairOf(pid); if (p) pts[p.id] = (pts[p.id] || 0) + n; };
  const byTime = (a, b) => A[a].t - A[b].t;
  switch (R.kind) {
    case 'quiz': {
      const m = R.mult || 1; const right = Object.keys(A).filter(p => A[p].v === st.ok && pairOf(p)).sort(byTime);
      right.forEach(p => add(p, m)); if (right[0]) add(right[0], m);
      return {pts, right, fast: right[0] || null};
    }
    case 'cancion': {
      const right = Object.keys(A).filter(p => A[p].v === st.ok && pairOf(p)).sort(byTime);
      right.forEach(p => add(p, STAGE_PTS[Math.max(0, (A[p].st || 1) - 1)]));
      return {pts, right};
    }
    case 'cifras': {
      const best = {};
      for (const p in A) { const pr = pairOf(p); if (!pr) continue; const d = Math.abs(A[p].v - st.t); if (!best[pr.id] || d < best[pr.id].d) best[pr.id] = {d, v: A[p].v, pid: p}; }
      for (const id in best) { const d = best[id].d; const n = d === 0 ? 10 : d <= 5 ? 7 : d <= 10 ? 5 : 0; if (n) pts[id] = n; }
      return {pts, best};
    }
    case 'letras': {
      const w = {}; for (const p in A) { if (!pairOf(p) || !A[p].v) continue; w[p] = [A[p].v, A[p].v.length >= 2 && canBuild(A[p].v, st.l)]; }
      const r = {pts: {}, w}; letrasPts(r); return r;
    }
    case 'dibujo': {
      const first = {};
      for (const p in A) { if (!A[p].ok) continue; const pr = pairOf(p); if (!pr) continue; if (!first[pr.id] || A[p].t < first[pr.id]) first[pr.id] = A[p].t; }
      const order = Object.keys(first).sort((a, b) => first[a] - first[b]);
      order.forEach((id, i) => { pts[id] = [5, 4, 3][i] || 2; });
      return {pts, order};
    }
    case 'bingo': return {pts: Object.assign({}, G.res ? G.res.pts : {})};
    case 'tapas': {
      const {votes, voters} = tapaRace(); const ids = Object.keys(votes);
      const rank = ids.map(id => { const pos = 1 + ids.filter(o => votes[o] > votes[id]).length; return [id, votes[id], voters ? (TAPA_PTS[pos - 1] || 1) : 0, pos]; }).sort((a, b) => a[3] - b[3]);
      rank.forEach(([id, , n]) => { if (n) add(id, n); });
      G.tapas = rank;
      return {pts, rank};
    }
  }
  return {pts};
}
function letrasPts(r) {
  const best = {};
  for (const p in r.w) { if (!r.w[p][1]) continue; const pr = pairOf(p); if (!pr) continue; best[pr.id] = Math.max(best[pr.id] || 0, r.w[p][0].length); }
  r.pts = {}; for (const id in best) r.pts[id] = best[id] === 9 ? 18 : best[id];
}
function toReveal() {
  const G = H.G; if (!G || G.phase !== 'play') return;
  clearTimeout(H.autoT);
  const kind = curRound().kind;
  stopMusic();
  G.res = computeRes(); G.phase = 'reveal'; H.deadline = 0; G.deadline = 0;
  if (kind === 'cancion' && H.music[G.step.idx] && H.music[G.step.idx].url) playFor(12000).then(renderSoon);
  changed(); send(true);
}
function commit() {
  const G = H.G; if (!G.res || G.res.done) return;
  const e = effPts(G.res.pts);
  for (const id in e) { const p = G.pairs.find(x => x.id === id); if (p) p.sc += e[id]; }
  G.log.push({r: G.r, s: G.s, e}); G.res.done = true;
}
function hostNext() {
  const G = H.G;
  switch (G.phase) {
    case 'lobby':
      if (Object.keys(G.players).length < 2) { toast('Hacen falta al menos dos jugadores conectados.'); return; }
      drawPairs(); G.phase = 'sorteo'; H.sorteoAnim = true; break;
    case 'sorteo': G.r = 0; G.phase = 'intro'; break;
    case 'intro': if (curRound().kind === 'cancion') prefetchSongs(false); startStep(0); return;
    case 'play':
      if (curRound().kind === 'tapas' && G.step.mode === 'entry') { G.step.mode = 'vote'; G.ans = {}; break; }
      toReveal(); return;
    case 'reveal': stopMusic(); commit(); if (G.s + 1 < curRound().steps) { startStep(G.s + 1); return; } G.phase = 'tabla'; break;
    case 'tabla': if (G.r + 1 < ROUNDS.length) { G.r++; G.phase = 'intro'; if (curRound().kind === 'cancion') prefetchSongs(false); } else G.phase = 'fin'; break;
  }
  changed(); send(true);
}
function roundGain(r) { const g = {}; for (const l of H.G.log) if (l.r === r) for (const id in l.e) g[id] = (g[id] || 0) + l.e[id]; return g; }

/* ----- vista del presentador ----- */
function hostTop() {
  const G = H.G; const R = G.r >= 0 ? ROUNDS[G.r] : null;
  let st = '';
  if (roomState === 'none') st = '<span class="pill warn">Sin conexión: revisa el wifi</span>';
  else if (roomState === 'pending') st = '<span class="pill">Conectando…</span>';
  else st = `<span class="pill">${H.online.size} móvil${H.online.size === 1 ? '' : 'es'} conectado${H.online.size === 1 ? '' : 's'}</span>`;
  const where = R && G.phase !== 'fin' ? `<span class="pill">Prueba ${G.r + 1}/${ROUNDS.length} · ${esc(R.name)}${G.phase === 'play' || G.phase === 'reveal' ? ` · ${G.s + 1}/${R.steps}` : ''}</span>` : '';
  return `<header class="top">${logoHTML()}<div class="topinfo">${where}${st}<button class="btn ghost sm" data-act="menu">Menú</button></div></header>`;
}
function marcadorHTML() {
  const G = H.G; if (!G.pairs.length || G.phase === 'sorteo' || G.phase === 'fin') return '';
  const max = Math.max(...G.pairs.map(p => p.sc));
  return `<section class="marcador" aria-label="Marcador">${G.pairs.map(p => `<div class="mc${p.sc === max && max > 0 ? ' lead' : ''}"><div><div class="nm">${esc(p.n)}${p.x2 === G.r && G.r >= 0 ? ' <span class="pill x2">×2</span>' : ''}</div><div class="ms">${p.m.map(m => esc(pname(m))).join(' · ')}</div></div><span class="tn wide">${p.sc}</span></div>`).join('')}</section>`;
}
function ptsHTML(pts) {
  const e = effPts(pts); const ids = H.G.pairs.map(p => p.id).filter(id => e[id]);
  if (!ids.length) return '<p class="muted">Nadie puntúa en esta.</p>';
  return `<div class="ptsrow">${ids.map(id => { const p = H.G.pairs.find(x => x.id === id); return `<div class="ptsc"><span class="tn wide">${e[id] > 0 ? '+' : ''}${e[id]}</span>${esc(p.n)}${p.x2 === H.G.r && pts[id] > 0 ? ' <span class="pill x2">×2</span>' : ''}</div>`; }).join('')}</div>`;
}
function gotHTML() {
  const G = H.G, R = curRound(), st = G.step;
  if (R.kind === 'cancion') return `<div class="lbl">Han respondido</div><div class="chips">${G.pairs.map(p => `<span class="chip${p.m.some(m => G.ans[m]) ? ' done' : ''}">${esc(p.n)}</span>`).join('')}</div>`;
  let ids = activePlayers();
  if (R.kind === 'dibujo') ids = ids.filter(p => st.dr[pairOf(p).id] !== p);
  const entry = R.kind === 'tapas' && st.mode === 'entry';
  const lab = R.kind === 'dibujo' ? 'Han acertado' : entry ? 'Han subido su tapa' : R.kind === 'tapas' ? 'Han votado' : R.kind === 'bingo' ? 'Jugando' : 'Han respondido';
  const done = p => R.kind === 'dibujo' ? G.ans[p] && G.ans[p].ok : entry ? !!G.items[p] : R.kind === 'tapas' ? G.ans[p] && G.ans[p].f : !!G.ans[p];
  return `<div class="lbl">${lab}</div><div class="chips">${ids.map(p => `<span class="chip${done(p) ? ' done' : ''}${H.online.has(p) ? ' on' : ''}"><span class="dot"></span>${esc(pname(p))}</span>`).join('')}</div>`;
}
const imgTag = (pid, cls = '') => H.imgs[pid] ? `<img class="${cls}" src="${H.imgs[pid]}" alt="">` : `<span class="noimg ${cls}">Sin foto</span>`;
function hostMain() {
  const G = H.G;
  if (G.phase === 'lobby') {
    const ids = Object.keys(G.players); const url = joinURL(G.gid, G.bi);
    return `<div class="lobby"><div class="stack" style="gap:18px">
      <section class="hero"><div class="lbl">Campeonato Mundial</div><div class="tiles xl">${tilesWord('VILLARASO')}</div><div class="tiles lg">${tilesWord('2026', 'tn')}</div><div class="lbl">Edición otoño · Sábado 24 de octubre</div></section>
      <section class="board stack">
        <h2 class="title" style="font-size:clamp(1.3rem,2.6vw,2rem)">Jugadores (${ids.length})</h2>
        <p>Escanead el código con la cámara del móvil y tocad vuestro nombre. Las parejas las sortea la aplicación.</p>
        <div class="chips">${ids.length ? ids.map(p => `<span class="chip${H.online.has(p) ? ' on' : ''}"><span class="dot"></span>${esc(pname(p))}${G.players[p].off ? ' (sin móvil)' : ''}<button data-act="kick" data-v="${esc(p)}" aria-label="Quitar a ${esc(pname(p))}">×</button></span>`).join('') : '<span class="muted">Todavía no ha entrado nadie.</span>'}</div>
        <form id="addoff" class="row"><input class="txt" id="offname" maxlength="40" placeholder="Añadir a alguien sin móvil" style="flex:1;min-width:0"><button class="btn ghost" type="submit">Añadir</button></form>
        <div class="row end"><button class="btn big" data-act="next"${ids.length < 2 ? ' disabled' : ''}>Sortear parejas</button></div>
      </section></div>
      <aside class="qrcard"><div class="lbl">Escanea para jugar</div>${roomState === 'ok' ? qrSVG(url) : `<p style="padding:40px 10px">${roomState === 'none' ? 'No hay conexión. Comprueba el wifi del portátil y recarga.' : 'Conectando…'}</p>`}<b>Código ${esc(G.gid)}</b><span class="url">${esc(url)}</span></aside></div>`;
  }
  if (G.phase === 'sorteo') {
    const anim = H.sorteoAnim; H.sorteoAnim = false;
    return `<section class="center"><div class="lbl">El sorteo ha hablado</div><h1 class="title">Parejas del campeonato</h1></section>
    <div class="pairgrid">${G.pairs.map((p, i) => `<article class="pairc${anim ? ' flip' : ''}" style="--d:${i * .8}s"><div class="lbl">Pareja ${i + 1}</div><h3>${esc(p.n)}</h3><p class="mem">${p.m.map(m => esc(pname(m))).join(' &amp; ')}</p></article>`).join('')}</div>
    <div class="row end"><button class="btn ghost" data-act="redraw">Volver a sortear</button><button class="btn big" data-act="next">Empezar la prueba 1</button></div>`;
  }
  if (G.phase === 'intro') {
    const R = curRound(); const x2 = G.pairs.filter(p => p.x2 === G.r);
    let extra = '';
    if (R.kind === 'cancion') {
      const list = G.ord.cancion.slice(0, 10); const ok = list.filter(i => H.music[i] && H.music[i].url).length; const bad = list.filter(i => H.music[i] && H.music[i].err).length;
      extra = `<p class="musicnote">Música: ${ok} canciones listas${bad ? `, ${bad} no encontradas (se saltan solas)` : ''}${ok + bad < list.length ? '. Buscando el resto…' : '.'} Sube el volumen del portátil.</p>`;
    }
    return `<section class="board stack" style="align-items:flex-start">
      <div class="lbl">Prueba ${G.r + 1} de ${ROUNDS.length}</div>
      <h1 class="rname">${esc(R.name)}</h1>
      <ul class="rules">${R.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>${extra}
      <p class="muted">Comodín ×2: cada pareja puede usarlo una vez en todo el campeonato, desde el móvil, mientras se ve esta pantalla.${x2.length ? '' : ' De momento nadie lo ha activado.'}</p>
      ${x2.length ? `<div class="chips">${x2.map(p => `<span class="pill x2">×2 ${esc(p.n)}</span>`).join('')}</div>` : ''}
    </section>
    <div class="row end"><button class="btn big" data-act="next">Empezar</button></div>`;
  }
  if (G.phase === 'play') return hostPlay();
  if (G.phase === 'reveal') return hostReveal();
  if (G.phase === 'tabla') {
    const gain = roundGain(G.r); const sorted = G.pairs.slice().sort((a, b) => b.sc - a.sc); const max = Math.max(1, ...sorted.map(p => p.sc));
    const nextR = ROUNDS[G.r + 1];
    return `<section class="board stack"><div class="lbl">Clasificación tras la prueba ${G.r + 1}</div><h1 class="title">${esc(curRound().name)}</h1>
      <div class="standing">${sorted.map((p, i) => `<div class="srow"><div class="pos">${i + 1}</div><div><div class="nm">${esc(p.n)} <span class="gain">${gain[p.id] ? `+${gain[p.id]}` : ''}</span></div><div class="muted">${p.m.map(m => esc(pname(m))).join(' · ')}</div><div class="bar"><i style="width:${Math.max(2, p.sc / max * 100)}%"></i></div></div><span class="tn wide">${p.sc}</span></div>`).join('')}</div></section>
      <div class="row end"><button class="btn big" data-act="next">${nextR ? `Prueba ${G.r + 2}: ${esc(nextR.name)}` : 'Ver a los campeones'}</button></div>`;
  }
  if (G.phase === 'fin') {
    const sorted = G.pairs.slice().sort((a, b) => b.sc - a.sc);
    const tie = sorted.length > 1 && sorted[0].sc === sorted[1].sc;
    const pod = [sorted[1], sorted[0], sorted[2]];
    const best = G.tapas && G.tapas.length && G.tapas[0][1] > 0 ? G.tapas.filter(t => t[3] === 1) : [];
    return `<section class="hero"><div class="lbl">Campeones del Mundo · Villaraso 2026 · Edición otoño</div>
      <h1 class="rname">${tie ? '¡Empate!' : esc(sorted[0].n)}</h1>
      <p class="title" style="font-size:clamp(1.2rem,3vw,2rem);color:var(--cream);text-shadow:none">${tie ? 'Desempate a los dados de póker: la mejor jugada gana.' : sorted[0].m.map(m => esc(pname(m))).join(' &amp; ')}</p></section>
      <div class="podium">${pod.map((p, i) => p ? `<div class="p${[2, 1, 3][i]}"><div class="nm">${esc(p.n)}</div><div class="muted">${p.m.map(m => esc(pname(m))).join(' · ')}</div><span class="tn wide">${p.sc}</span><div class="plat">${[2, 1, 3][i]}</div></div>` : '<div></div>').join('')}</div>
      ${sorted.length > 3 ? `<div class="board"><div class="standing">${sorted.slice(3).map((p, i) => `<div class="srow"><div class="pos">${i + 4}</div><div class="nm">${esc(p.n)}</div><span class="tn wide">${p.sc}</span></div>`).join('')}</div></div>` : ''}
      ${best.length ? `<div class="board stack"><div class="lbl">Mejor tapa de la edición</div><div class="tapgrid">${best.map(t => `<div class="tapc">${imgTag(t[0])}<div><b>${esc(G.items[t[0]] ? G.items[t[0]].n : '')}</b><span>${esc(pname(t[0]))}</span></div></div>`).join('')}</div></div>` : ''}`;
  }
  return '';
}
function raceHTML() {
  const G = H.G, d = pubStep();
  return `<div class="race" id="race">${Object.keys(G.items).map(id => `<div class="lane" data-id="${esc(id)}"><span class="finish"></span><div class="runner">${H.imgs[id] ? `<img src="${H.imgs[id]}" alt="">` : '<span class="noimg">🍽️</span>'}<div><b>${esc(G.items[id].n)}</b><small>${esc(pname(id))}</small></div><span class="rp">0</span></div></div>`).join('')}</div>
    <p class="status" id="racecount"></p>`;
}
function updateRace() {
  const G = H.G, d = pubStep(); const total = activePlayers().length;
  const lead = Math.max(0, ...Object.values(d.votes)); const finish = Math.max(lead, Math.ceil(total * 1.5), 1);
  $$('#race .lane').forEach(l => { const id = l.dataset.id; const v = d.votes[id] || 0; const r = $('.runner', l); r.style.setProperty('--x', Math.min(1, v / finish)); $('.rp', r).textContent = v; });
  const c = $('#racecount'); if (c) c.textContent = `Han votado ${d.voters} de ${total}`;
}
function hostPlay() {
  const G = H.G, R = curRound(), st = G.step; let main = '', extra = '';
  const head = `<div class="lbl">${esc(R.name)} · ${G.s + 1} de ${R.steps}</div>`;
  switch (R.kind) {
    case 'quiz':
      main = `${head}<div class="lbl" style="color:var(--gold)">${esc(st.c)}</div><h1 class="q">${esc(st.q)}</h1><div class="opts">${st.o.map((o, i) => `<div class="opt"><span class="ob">${optLetter(i)}</span><span>${esc(o)}</span></div>`).join('')}</div>`; break;
    case 'cifras':
      main = `${head}<div class="center"><div class="lbl">Número objetivo</div><div class="target">${st.t}</div><div class="tiles lg">${st.n.map(n => `<span class="tn${n > 10 ? ' wide' : ''}">${n}</span>`).join('')}</div></div>`; break;
    case 'letras':
      main = `${head}<div class="center"><div class="lbl">Las nueve letras</div><div class="tiles xl">${st.l.map(l => `<span class="tl">${l}</span>`).join('')}</div><p class="muted">La palabra más larga que se os ocurra. Sin nombres propios.</p></div>`; break;
    case 'dibujo':
      main = `${head}<h1 class="q">A dibujar en el móvil</h1><div class="pairgrid">${G.pairs.map(p => { const ok = p.m.some(m => G.ans[m] && G.ans[m].ok); return `<div class="pairc"><h3>${esc(p.n)}</h3><p>Dibuja: <b>${esc(pname(st.dr[p.id]))}</b></p><p class="status${ok ? ' ok' : ''}">${ok ? '¡Acertado!' : 'Adivinando…'}</p></div>`; }).join('')}</div>`; break;
    case 'cancion': {
      const m = H.music[st.idx] || {};
      const status = m.err ? '<p class="banner">No he encontrado esta canción. Cambia a otra.</p>' : !m.url ? '<p class="muted">Cargando la canción…</p>' : '';
      main = `${head}<h1 class="q">¿Qué suena?</h1>${eqHTML(H.playing)}${status}
        <div class="stages">${STAGES.map((s, i) => `<span class="stg${st.stage === i + 1 && H.playing ? ' on' : st.stage > i ? '' : ''}"><b>${s} s</b>${STAGE_PTS[i]} pts${st.stage > i + 1 || (st.stage === i + 1 && !H.playing) ? ' ✓' : ''}</span>`).join('')}</div>
        <div class="opts">${st.o.map((o, i) => `<div class="opt"><span class="ob">${optLetter(i)}</span><span>${esc(o)}</span></div>`).join('')}</div>`;
      extra = `<button class="btn ghost" data-act="swapsong">Cambiar de canción</button>${st.stage === 0 ? `<button class="btn red big" data-act="playsong"${m.url ? '' : ' disabled'}>Que suene</button>` : `<button class="btn ghost" data-act="replay">Repetir fragmento</button>`}`;
      break;
    }
    case 'bingo':
      main = `${head}<div class="center"><div class="lbl">Pista ${st.cl.length} de ${EMOJI.length}</div><div class="emoji">${st.cur != null ? EMOJI[st.cur].e : ''}</div>${st.prev ? `<p class="muted">La anterior era: <b>${esc(st.prev)}</b></p>` : ''}${st.msg ? `<div class="banner">${esc(st.msg)}</div>` : ''}${st.li ? `<p class="muted">Línea cantada por ${esc(pname(st.li))}</p>` : ''}</div>`;
      extra = `<button class="btn ghost" data-act="clue"${st.bi || st.cl.length >= EMOJI.length ? ' disabled' : ''}>Siguiente pista</button>`; break;
    case 'tapas':
      if (st.mode === 'entry') {
        const ids = Object.keys(G.items);
        main = `${head}<h1 class="q">Subid vuestra tapa desde el móvil</h1><p class="muted">Nombre del plato y una foto. Cuando estén todas, empieza la votación.</p>
          <div class="tapgrid">${ids.map(id => `<div class="tapc">${imgTag(id)}<div><b>${esc(G.items[id].n)}</b><span>${esc(pname(id))}</span></div></div>`).join('') || '<p class="muted">Aún no ha llegado ninguna.</p>'}</div>`;
        return `<div class="playgrid"><section class="board stack">${main}</section><aside class="pside">${gotHTML()}</aside></div>
          <div class="row end"><button class="btn big" data-act="next"${ids.length < 2 ? ' disabled' : ''}>Empezar la votación</button></div>`;
      }
      return `<section class="board stack">${head}<h1 class="q">La carrera de las tapas</h1>${raceHTML()}</section>
        <div class="row end"><button class="btn big" data-act="next">Cerrar votación</button></div>`;
  }
  return `<div class="playgrid"><section class="board stack">${main}</section><aside class="pside">${R.secs ? clockSVG() : ''}${gotHTML()}</aside></div>
  <div class="row end">${extra}<button class="btn big" data-act="next">Ver resultado</button></div>`;
}
function hostReveal() {
  const G = H.G, R = curRound(), st = G.step, res = G.res, A = G.ans; let main = '';
  const head = `<div class="lbl">${esc(R.name)} · ${G.s + 1} de ${R.steps} · Resultado</div>`;
  switch (R.kind) {
    case 'quiz': {
      const who = i => Object.keys(A).filter(p => A[p].v === i).map(p => esc(pname(p)) + (res.fast === p ? ' ⚡' : '')).join(', ');
      main = `${head}<h1 class="q">${esc(st.q)}</h1>
      <div class="opts">${st.o.map((o, i) => `<div class="opt ${i === st.ok ? 'ok' : 'dim'}"><span class="ob">${optLetter(i)}</span><span>${esc(o)}<span class="who">${who(i) || '&nbsp;'}</span></span></div>`).join('')}</div>
      ${res.fast ? `<p class="muted">Más rápido: ${esc(pname(res.fast))}</p>` : ''}`; break;
    }
    case 'cancion': {
      const who = i => Object.keys(A).filter(p => A[p].v === i).map(p => `${esc(pairOf(p).n)} (fragmento ${A[p].st})`).join(', ');
      const m = H.music[st.idx] || {};
      main = `${head}<h1 class="q">Era «${esc(st.t)}»</h1>${m.label ? `<p class="muted">${esc(m.label)}</p>` : ''}${eqHTML(H.playing)}
      <div class="opts">${st.o.map((o, i) => `<div class="opt ${i === st.ok ? 'ok' : 'dim'}"><span class="ob">${optLetter(i)}</span><span>${esc(o)}<span class="who">${who(i) || '&nbsp;'}</span></span></div>`).join('')}</div>`; break;
    }
    case 'cifras': {
      const rows = Object.keys(A).map(p => [p, A[p].v, Math.abs(A[p].v - st.t)]).sort((a, b) => a[2] - b[2]);
      main = `${head}<div class="center"><div class="target">${st.t}</div></div>
      <ul class="list">${rows.map(([p, v, d]) => `<li class="li"><span>${esc(pname(p))}</span><span><span class="num">${v}</span> <span class="muted">${d === 0 ? 'exacto' : `a ${d}`}</span></span></li>`).join('') || '<li class="li muted">Nadie ha enviado nada.</li>'}</ul>
      <div><div class="lbl">Una solución${st.sol ? (st.sol.d ? ` (lo más cerca posible: ${st.sol.v})` : '') : ''}</div><div class="steps">${st.sol ? st.sol.steps.map(s => `<span>${esc(s)}</span>`).join('') || `<span>${st.sol.v}</span>` : '<span class="muted">Calculando…</span>'}</div></div>`;
      break;
    }
    case 'letras': {
      const ids = Object.keys(res.w).sort((a, b) => res.w[b][0].length - res.w[a][0].length);
      main = `${head}<div class="tiles md">${st.l.map(l => `<span class="tl">${l}</span>`).join('')}</div>
      <p class="muted">El jurado decide: toca una palabra para darla por buena o anularla.</p>
      <ul class="list">${ids.map(p => `<li class="li${res.w[p][1] ? '' : ' bad'}"><span>${esc(pname(p))}</span><button class="btn ${res.w[p][1] ? '' : 'ghost '}sm" data-act="jury" data-v="${esc(p)}"><span class="w">${esc(res.w[p][0])}</span> · ${res.w[p][0].length}</button></li>`).join('') || '<li class="li muted">Nadie ha formado palabra.</li>'}</ul>`;
      break;
    }
    case 'dibujo':
      main = `${head}<div class="center"><div class="lbl">Había que dibujar</div><div class="rname" style="font-size:clamp(2rem,6vw,4.4rem)">${esc(st.word.w)}</div></div>
      <div class="drawgrid">${G.pairs.map(p => { const pos = res.order.indexOf(p.id); return `<figure><canvas class="cv" data-draw="${esc(p.id)}"></canvas><figcaption>${esc(p.n)} · dibujó ${esc(pname(st.dr[p.id]))}${pos >= 0 ? ` · ${pos + 1}.º en acertar` : ' · no acertó'}</figcaption></figure>`; }).join('')}</div>`;
      break;
    case 'bingo':
      main = `${head}<div class="center">${st.bi ? `<div class="rname">¡Bingo!</div><p class="title" style="font-size:1.6rem">${esc(pname(st.bi))}</p>` : '<h1 class="q">Fin del bingo</h1>'}${st.li ? `<p>Línea: <b>${esc(pname(st.li))}</b></p>` : ''}</div>`; break;
    case 'tapas':
      main = `${head}<h1 class="q">Clasificación de tapas</h1><div class="tapgrid">${res.rank.map(([p, v, n, pos]) => `<div class="tapc">${imgTag(p)}<div><b>${pos}.º ${esc(G.items[p] ? G.items[p].n : '')}</b><span>${esc(pname(p))} · ${v} votos · +${n} a su pareja</span></div></div>`).join('')}</div>`; break;
  }
  return `<section class="board stack">${main}<div class="lbl">Puntos</div>${ptsHTML(res.pts)}</section>
  <div class="row end">${R.kind === 'cancion' ? '<button class="btn ghost" data-act="listen">Escuchar otra vez</button>' : ''}<button class="btn big" data-act="next">${G.s + 1 < R.steps ? 'Sumar y seguir' : 'Sumar y ver la clasificación'}</button></div>`;
}
function menuHTML() {
  const G = H.G; const unpaired = Object.keys(G.players).filter(p => !pairOf(p));
  const ml = H.musicCheck ? `<div class="mlist">${SONGS.map((s, i) => { const m = H.music[i] || {}; return `<span class="${m.err ? 'bad' : ''}">${esc(s.t)}: ${m.url ? esc(m.label) : m.err ? 'no encontrada' : 'buscando…'}</span>`; }).join('')}</div>` : '';
  return `<div class="sheet" data-act="closemenu"><div class="sheet-in" role="dialog" aria-label="Menú del presentador" data-stop="1">
    <div class="row" style="justify-content:space-between"><h3>Menú del presentador</h3><button class="btn ghost sm" data-act="closemenu">Cerrar</button></div>
    ${G.pairs.length ? `<div class="stack"><h3>Ajustar puntos</h3>${G.pairs.map(p => `<div class="adj"><span>${esc(p.n)}</span><button class="btn ghost sm" data-act="adj" data-v="${p.id}:-1">−1</button><span class="num">${p.sc}</span><button class="btn ghost sm" data-act="adj" data-v="${p.id}:1">+1</button></div>`).join('')}</div>` : ''}
    ${unpaired.length && G.pairs.length ? `<div class="stack"><h3>Jugadores sin pareja</h3>${unpaired.map(u => `<div class="stack"><span>${esc(pname(u))}</span><div class="row">${G.pairs.map(p => `<button class="btn ghost sm" data-act="join" data-v="${esc(u)}:${p.id}">A ${esc(p.n)}</button>`).join('')}</div></div>`).join('')}</div>` : ''}
    ${G.pairs.length ? `<div class="stack"><h3>Ir a una prueba</h3>${ROUNDS.map((r, i) => `<button class="btn ${i === G.r ? '' : 'ghost '}sm" data-act="goto" data-v="${i}">${i + 1}. ${esc(r.name)}</button>`).join('')}<p class="muted">Saltar abandona la pregunta en curso sin sumar sus puntos.</p></div>` : ''}
    <div class="stack"><h3>Música</h3><button class="btn ghost sm" data-act="checkmusic">Comprobar todas las canciones</button>${ml}</div>
    <div class="stack"><h3>Partida</h3>
      <p class="muted">Enlace para los móviles: ${esc(joinURL(G.gid, G.bi))}</p>
      ${G.pairs.length ? '<button class="btn ghost sm" data-act="relobby">Volver a la sala de espera (repite el sorteo y pone el marcador a cero)</button>' : ''}
      ${H.confirmNew ? '<p>¿Seguro? Se borra el marcador y cambia el código QR: todos tendrán que volver a escanearlo.</p><div class="row"><button class="btn red sm" data-act="newgame">Sí, nueva partida</button><button class="btn ghost sm" data-act="nonew">No</button></div>' : '<button class="btn ghost sm" data-act="asknew">Nueva partida</button>'}
    </div></div></div>`;
}
function hostRender() {
  const G = H.G;
  if (G.phase === 'play' && curRound() && curRound().kind === 'tapas' && G.step.mode === 'vote' && $('#race') && !H.menu) {
    const top = $('header.top'); if (top) top.outerHTML = hostTop();
    updateRace(); return;
  }
  const app = $('#app'); const ae = document.activeElement; const fid = ae && ae.id; const fval = fid && ae.value; const sel = fid && ae.selectionStart;
  const sc = H.menu && $('.sheet-in') ? $('.sheet-in').scrollTop : 0;
  app.className = 'host';
  app.innerHTML = hostTop() + `<main class="stack" style="gap:18px">${hostMain()}</main>` + marcadorHTML() + (H.menu ? menuHTML() : '');
  if (fid) { const el = document.getElementById(fid); if (el) { if (fval != null) el.value = fval; el.focus(); try { el.setSelectionRange(sel, sel); } catch (e) {} } }
  if (sc && $('.sheet-in')) $('.sheet-in').scrollTop = sc;
  if (G.phase === 'reveal' && curRound().kind === 'dibujo') $$('canvas[data-draw]').forEach(cv => paint(cv, decStrokes(G.draws[cv.dataset.draw])));
  if ($('#race')) requestAnimationFrame(() => requestAnimationFrame(updateRace));
  hostTick();
}
function hostTick() {
  const G = H.G; if (!G || G.phase !== 'play' || !H.deadline) return;
  const left = H.deadline - Date.now(); setClock(left, curRound().secs * 1000);
  if (left < -800) toReveal();
}
const HACT = {
  next: () => hostNext(),
  menu: () => { H.menu = true; H.confirmNew = false; hostRender(); },
  closemenu: (v, el, ev) => { if (el.classList.contains('sheet') && ev.target.closest('[data-stop]')) return; H.menu = false; hostRender(); },
  kick: v => { delete H.G.players[v]; changed(); },
  redraw: () => { drawPairs(); H.sorteoAnim = true; changed(); send(true); },
  playsong: () => { audioEl(); runStage(1); },
  replay: () => { const st = H.G.step; if (st.stage) { clearTimeout(H.musicT); playFor(STAGES[st.stage - 1] * 1000).then(() => { renderSoon(); send(true); if (H.G.phase === 'play' && H.G.step === st) H.musicT = setTimeout(() => { if (H.G.phase === 'play' && H.G.step === st) { if (st.stage < 4) runStage(st.stage + 1); else toReveal(); } }, STAGE_GAP); }); renderSoon(); send(true); } },
  swapsong: () => swapSong(),
  listen: () => { stopMusic(); playFor(20000).then(renderSoon); renderSoon(); },
  checkmusic: () => { H.musicCheck = true; prefetchSongs(true); hostRender(); },
  clue: () => { nextClue(); changed(); send(true); },
  jury: v => { const r = H.G.res; if (r && r.w[v] && !r.done) { r.w[v][1] = !r.w[v][1]; letrasPts(r); changed(); } },
  adj: v => { const [id, d] = v.split(':'); const p = H.G.pairs.find(x => x.id === id); if (p) { p.sc += +d; H.G.log.push({r: H.G.r, s: -1, e: {[id]: +d}}); changed(); } },
  join: v => { const [pid, id] = v.split(':'); const p = H.G.pairs.find(x => x.id === id); if (p && !pairOf(pid)) { p.m.push(pid); changed(); } },
  goto: v => { const G = H.G; clearTimeout(H.autoT); stopMusic(); G.r = +v; G.phase = 'intro'; G.step = null; G.res = null; G.ans = {}; H.deadline = 0; H.menu = false; if (curRound().kind === 'cancion') prefetchSongs(false); changed(); send(true); },
  relobby: () => { const G = H.G; stopMusic(); G.pairs = []; G.r = -1; G.phase = 'lobby'; G.step = null; G.res = null; G.log = []; G.tapas = null; H.deadline = 0; H.menu = false; changed(); send(true); },
  asknew: () => { H.confirmNew = true; hostRender(); },
  nonew: () => { H.confirmNew = false; hostRender(); },
  newgame: () => { stopMusic(); const bi = H.G.bi; H.G = newGame(); H.G.bi = bi; H.imgs = {}; ls.set('imgs', {}); H.menu = false; H.confirmNew = false; H.deadline = 0; ls.set('game', H.G); location.reload(); },
  role: () => { role = null; ls.del('role'); render(); }
};
function connectHost() {
  const G = H.G; let tried = 0; const order = [G.bi || 0, ...range(BROKERS.length).filter(i => i !== (G.bi || 0))];
  const attempt = () => {
    const bi = order[tried]; const net = makeNet(G.gid, brokerUrl(bi), true, 'host');
    let ok = false;
    net.onConnection(up => { if (up && !ok) { ok = true; room = net; roomState = 'ok'; if (G.bi !== bi) { G.bi = bi; saveSoon(); } wireHost(); renderSoon(); } else if (ok) { roomState = up ? 'ok' : 'pending'; renderSoon(); } });
    setTimeout(() => { if (!ok) { net.end(); tried++; if (tried < order.length && !params.get('broker')) attempt(); else { roomState = 'none'; renderSoon(); setTimeout(() => { tried = 0; roomState = 'pending'; renderSoon(); attempt(); }, 15000); } } }, 9000);
  };
  attempt();
}
let hostWired = false;
function wireHost() {
  if (hostWired) return; hostWired = true;
  room.onPeers(() => hostPeers());
  room.onImg((pid, data) => hostImg(pid, data));
  hostPeers(); send(true);
  setInterval(() => { if (role === 'host') { hostPeers(); send(true); } }, 3000);
}
function startHost() {
  const saved = ls.get('game', null);
  if (saved && saved.gid && saved.phase) { H.G = saved; if (!H.G.items) H.G.items = {}; H.deadline = saved.deadline || 0; if (saved.phase !== 'lobby') toast('Partida recuperada. Puedes empezar otra desde el menú.'); }
  else { H.G = newGame(); ls.set('game', H.G); }
  hostRender();
  connectHost();
  if (H.G.r >= 0 && ROUNDS[H.G.r].kind === 'cancion') prefetchSongs(false);
}

/* ================= JUGADOR ================= */
const P = {pid: null, name: ls.get('name.' + gameCode, ''), S: null, sig: '', pres: {}, deadline: 0, L: {}, upd: null, strokes: [], lastDraw: '', drawT: 0, imgs: {}, myTapa: null};
P.pid = ls.get('pid', null) || (() => { const p = rid(10); ls.set('pid', p); return p; })();
function setPres(patch) {
  for (const k in patch) { if (patch[k] === null) delete P.pres[k]; else P.pres[k] = patch[k]; }
  if (room) room.presence(patch);
}
function myPair() { const S = P.S; return S && S.pairs.find(p => p.m.includes(P.pid)); }
const nm = pid => (P.S && P.S.names[pid]) || 'Alguien';
function onState(S) {
  if (!S || typeof S !== 'object' || typeof S.ph !== 'string' || !Array.isArray(S.pairs) || !S.names || S.gid !== gameCode) return;
  if (P.S && S.at && P.S.at && S.at < P.S.at) return;
  P.S = S; P.deadline = S.left != null ? Date.now() + S.left : 0;
  if (S.k !== P.pres.k) { P.L = {}; P.strokes = []; P.lastDraw = ''; setPres({k: S.k, a: null, d: null}); }
  playerRender();
}
function sigOf() {
  const S = P.S; if (!S) return 'wait' + roomState; const R = ROUNDS[S.r]; const mp = myPair();
  let x = [S.ph, S.k, mp ? mp.id + mp.m.join() : '-', mp ? mp.x2 : ''].join('|');
  if (S.ph === 'lobby') x += Object.values(S.names).join();
  if (S.ph === 'sorteo' || S.ph === 'tabla' || S.ph === 'fin') x += S.pairs.map(p => p.sc + p.n).join();
  if (S.ph === 'play' && R && R.kind === 'tapas' && S.d) x += S.d.mode + (S.d.mode === 'vote' ? Object.keys(S.d.items).join() : '');
  if (S.ph === 'play' && R && R.kind === 'cancion' && S.d) x += S.d.o.join();
  return x;
}
function playerRender() {
  const app = $('#app'); app.className = 'phone';
  if (!P.name) { if (!$('#namepick') || P.sig !== 'name' + Object.values((P.S && P.S.names) || {}).join()) { P.sig = 'name' + Object.values((P.S && P.S.names) || {}).join(); app.innerHTML = phoneHead() + nameForm(); } return; }
  const sig = sigOf();
  if (sig === P.sig && P.upd) { P.upd(); return; }
  P.sig = sig; P.upd = null;
  app.innerHTML = phoneHead() + `<main class="stack">${phoneMain()}</main><div class="row" style="justify-content:center"><button class="linkbtn" data-act="rename">Cambiar mi nombre</button></div>`;
  if (P.upd) P.upd();
}
function phoneHead() {
  const mp = myPair();
  return `<header class="phead">${logoHTML(true)}<div class="me">${P.name ? `<b>${esc(P.name)}</b>` : ''}${mp ? esc(mp.n) : ''}</div></header>`;
}
function nameForm() {
  const taken = new Set(Object.entries((P.S && P.S.names) || {}).filter(([id]) => id !== P.pid).map(([, n]) => n));
  return `<section class="board stack" id="namepick"><div class="tiles md">${tilesWord('VILLARASO')}</div><h1 class="title" style="font-size:1.6rem">¿Quién eres?</h1>
  <div class="namepick">${NAMES.map(n => `<button data-act="pickname" data-v="${esc(n)}" class="${taken.has(n) ? 'taken' : ''}">${esc(n)}</button>`).join('')}</div>
  <form id="nameform" class="stack"><label class="lbl" for="pname">¿Otro nombre?</label><div class="row"><input class="txt" id="pname" maxlength="40" autocomplete="nickname" style="flex:1;min-width:0"><button class="btn" type="submit">Entrar</button></div></form></section>`;
}
function phoneMain() {
  const S = P.S;
  if (!S) return `<section class="board center"><div class="lbl">${roomState === 'none' ? 'Sin conexión' : 'Conectando'}</div><h2 class="title" style="font-size:1.6rem">${roomState === 'none' ? 'No llego a la partida' : 'Esperando al presentador…'}</h2><p class="muted">${roomState === 'none' ? 'Comprueba que tienes internet (mejor el wifi de la casa). Lo sigo intentando solo.' : 'Cuando la pantalla del portátil esté abierta, aparecerás en la sala.'}</p></section>`;
  const mp = myPair(); const R = ROUNDS[S.r];
  if (S.ph === 'lobby') {
    const names = Object.values(S.names);
    return `<section class="board stack"><div class="lbl">Sala de espera</div><h1 class="bigname">Hola, ${esc(P.name)}</h1><p>Ya estás dentro. Cuando estemos todos, el presentador sorteará las parejas.</p><div class="chips">${names.map(n => `<span class="chip on"><span class="dot"></span>${esc(n)}</span>`).join('')}</div></section>`;
  }
  if (!mp) return `<section class="board stack"><div class="lbl">Sin pareja</div><h2 class="title" style="font-size:1.5rem">Te has unido tarde</h2><p>El presentador te puede meter en una pareja desde su menú. Mientras, mira la tele.</p></section>`;
  const partners = mp.m.filter(m => m !== P.pid).map(m => esc(nm(m))).join(' y ');
  if (S.ph === 'sorteo') return `<section class="board center"><div class="lbl">Tu pareja</div><div class="bigname flip">${partners || 'Juegas solo'}</div><p class="title" style="font-size:1.3rem">${esc(mp.n)}</p></section>`;
  if (S.ph === 'intro') {
    const x2 = mp.x2 === S.r ? '<div class="banner">Comodín ×2 activado en esta prueba</div>' : mp.x2 != null ? `<p class="muted">Ya gastasteis el comodín en «${esc(ROUNDS[mp.x2].name)}».</p>` : `<button class="btn full" data-act="x2">Usar el comodín ×2 aquí</button><p class="muted">Solo hay uno por pareja en todo el campeonato.</p>`;
    return `<section class="board stack"><div class="lbl">Prueba ${S.r + 1} de ${ROUNDS.length}</div><h1 class="rname" style="font-size:2.4rem">${esc(R.name)}</h1><ul class="rules" style="font-size:1rem">${R.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>${x2}</section>`;
  }
  if (S.ph === 'play' && S.d) return phonePlay(R, mp);
  if (S.ph === 'reveal' && S.res) return phoneReveal(R, mp);
  if (S.ph === 'tabla' || S.ph === 'fin') {
    const sorted = S.pairs.slice().sort((a, b) => b.sc - a.sc);
    return `<section class="board stack"><div class="lbl">${S.ph === 'fin' ? 'Clasificación final' : 'Clasificación'}</div><div class="standing">${sorted.map((p, i) => `<div class="srow"><div class="pos">${i + 1}</div><div><div class="nm">${esc(p.n)}${p.id === mp.id ? ' ★' : ''}</div><div class="muted">${p.m.map(m => esc(nm(m))).join(' · ')}</div></div><span class="tn wide">${p.sc}</span></div>`).join('')}</div></section>`;
  }
  return `<section class="board center"><p class="muted">Mira la tele.</p></section>`;
}
function timerHTML() { return `<div class="tline"><div class="tbar" style="flex:1"><i style="width:100%"></i></div><span class="secs" data-timer>–</span></div>`; }
function gotLine() { return `<p class="status" id="gotline"></p>`; }
function updGot(okText, waitText) { const el = $('#gotline'); if (!el) return; const got = P.S.got.includes(P.pid); el.textContent = got ? okText : waitText; el.classList.toggle('ok', got); }
const pimg = (pid, cls = '') => P.imgs[pid] ? `<img class="${cls}" src="${P.imgs[pid]}" alt="">` : '';
function phonePlay(R, mp) {
  const S = P.S, d = S.d, L = P.L;
  switch (R.kind) {
    case 'quiz': {
      P.upd = () => { $$('.opt').forEach((b, i) => b.classList.toggle('sel', L.sel === i)); updGot('Respuesta recibida. Puedes cambiarla hasta que acabe el tiempo.', L.sel != null ? 'Enviando…' : 'Elige una respuesta.'); };
      return `${timerHTML()}<section class="stack"><div class="lbl" style="color:var(--gold)">${esc(d.c)}</div><h1 class="q" style="font-size:1.45rem">${esc(d.q)}</h1><div class="opts">${d.o.map((o, i) => `<button class="opt" data-act="ans" data-v="${i}"><span class="ob">${optLetter(i)}</span><span>${esc(o)}</span></button>`).join('')}</div>${gotLine()}</section>`;
    }
    case 'cancion': {
      P.upd = () => {
        const dd = P.S.d; const pa = dd.pa[mp.id];
        $$('.opt').forEach((b, i) => { b.classList.toggle('sel', pa ? pa[0] === i : L.sel === i); b.disabled = !!pa || !dd.stage; });
        const el = $('#stageinfo');
        if (el) el.textContent = pa ? `Vuestra respuesta: ${optLetter(pa[0])} (la eligió ${nm(pa[1])}, en el fragmento ${pa[2]})` : !dd.stage ? 'Atentos: va a sonar en el portátil.' : `Fragmento ${dd.stage} (${STAGES[dd.stage - 1]} s): si acertáis ahora, ${STAGE_PTS[dd.stage - 1]} puntos`;
        if (el) el.classList.toggle('ok', !!pa);
        const eq = $('.eq'); if (eq) eq.classList.toggle('on', !!dd.playing);
      };
      return `<section class="stack"><div class="lbl">¿Qué suena? · Suena en el portátil</div>${eqHTML(d.playing)}<p class="status" id="stageinfo"></p><div class="opts">${d.o.map((o, i) => `<button class="opt" data-act="sans" data-v="${i}"><span class="ob">${optLetter(i)}</span><span>${esc(o)}</span></button>`).join('')}</div><p class="muted">Vale la primera respuesta de la pareja. Hablad antes de tocar.</p></section>`;
    }
    case 'cifras': {
      if (!L.tiles) { L.tiles = d.n.map(v => ({v, used: false})); L.steps = []; L.a = null; L.op = null; }
      P.upd = () => cifrasUpd();
      return `${timerHTML()}<section class="stack"><div class="center"><div class="target" style="font-size:3.4rem">${d.t}</div></div><div class="tiles tap" id="ctiles"></div><div class="ops">${['+', '−', '×', '÷'].map(o => `<button data-act="cop" data-v="${o}">${o}</button>`).join('')}</div><div class="steps" id="csteps"></div><div class="row"><button class="btn ghost sm" data-act="cundo">Deshacer</button><button class="btn ghost sm" data-act="creset">Empezar de nuevo</button></div><p class="status" id="cbest"></p></section>`;
    }
    case 'letras': {
      if (!L.used) L.used = [];
      P.upd = () => letrasUpd();
      return `${timerHTML()}<section class="stack"><div class="word" id="lword"></div><div class="tiles tap" id="ltiles"></div><div class="row" style="justify-content:center"><button class="btn ghost" data-act="lback">Borrar letra</button><button class="btn ghost" data-act="lclear">Borrar todo</button></div><p class="status" id="lstat"></p></section>`;
    }
    case 'dibujo': {
      const drawer = d.dr[mp.id] === P.pid;
      if (drawer) {
        P.upd = () => { const ok = mp.m.some(m => P.S.d.ok.includes(m)); const el = $('#dstat'); if (el) { el.textContent = ok ? '¡Tu pareja lo ha acertado!' : 'Tu pareja lo está viendo en su móvil.'; el.classList.toggle('ok', ok); } };
        setTimeout(setupDrawCanvas, 0);
        return `${timerHTML()}<section class="stack"><div class="lbl">Dibuja (sin letras ni números)</div><div class="bigname" style="font-size:2rem">${esc(d.w)}</div><canvas class="cv" id="dcv"></canvas><div class="row" style="justify-content:space-between"><button class="btn ghost sm" data-act="dclear">Borrar dibujo</button><span class="muted" id="dfull"></span></div><p class="status" id="dstat"></p></section>`;
      }
      P.upd = () => {
        const ok = mp.m.some(m => P.S.d.ok.includes(m));
        const el = $('#dstat'); if (el) { el.textContent = ok ? '¡Acertado!' : (L.tried && P.S.got.includes(P.pid) ? `«${L.tried}» no es. Prueba otra vez.` : 'Escribe el título y pulsa Probar.'); el.classList.toggle('ok', ok); }
        const f = $('#gform'); if (f) f.hidden = ok;
        paintPartner();
      };
      return `${timerHTML()}<section class="stack"><div class="lbl">Dibuja ${esc(nm(d.dr[mp.id]))}</div><canvas class="cv" id="gcv"></canvas><form id="gform" class="row"><input class="txt" id="guess" maxlength="40" autocomplete="off" placeholder="¿Qué es?" style="flex:1;min-width:0"><button class="btn" type="submit">Probar</button></form><p class="status" id="dstat"></p></section>`;
    }
    case 'bingo': {
      const card = bingoCard(S.gid, P.pid); if (!L.m) { L.m = []; L.cn = 0; }
      P.upd = () => { $$('.card button').forEach((b, i) => b.classList.toggle('on', L.m.includes(i))); const el = $('#bmsg'); if (el) el.textContent = P.S.d.msg || `Pistas: ${P.S.d.cl.length}`; const lb = $('[data-act="claim"][data-v="l"]'); if (lb) lb.disabled = !!P.S.d.li; };
      return `<section class="stack"><div class="lbl">Tu cartón · las pistas salen en la tele</div><div class="card">${card.map((ix, i) => `<button data-act="mark" data-v="${i}">${esc(EMOJI[ix].t)}</button>`).join('')}</div><div class="row" style="justify-content:center"><button class="btn red" data-act="claim" data-v="l">¡Línea!</button><button class="btn" data-act="claim" data-v="b">¡Bingo!</button></div><p class="status" id="bmsg"></p></section>`;
    }
    case 'tapas': {
      if (d.mode === 'entry') {
        P.upd = () => { const el = $('#tstat'); if (!el) return; const sent = !!P.S.d.items[P.pid]; el.textContent = sent ? `Recibida en la tele: «${P.S.d.items[P.pid]}». Puedes cambiarla hasta que empiece la votación.` : P.myTapa ? 'Enviando…' : 'Pon el nombre y una foto, y envíala.'; el.classList.toggle('ok', sent); };
        const mt = P.myTapa || {};
        return `<section class="board stack"><div class="lbl">Concurso de tapas</div><h1 class="q" style="font-size:1.5rem">Sube tu tapa</h1>
          <label class="lbl" for="tname">Nombre del plato</label><input class="txt" id="tname" maxlength="40" value="${esc(mt.n || '')}" placeholder="Ej.: Croquetas de la abuela">
          ${mt.img ? `<img class="tprev" id="tprev" src="${mt.img}" alt="">` : '<img class="tprev" id="tprev" alt="" hidden>'}
          <label class="btn ghost full" for="tphoto" style="text-align:center">Hacer o elegir foto</label><input type="file" id="tphoto" accept="image/*" hidden>
          <button class="btn big full" data-act="tsend">Enviar mi tapa</button><p class="status" id="tstat"></p></section>`;
      }
      if (!L.v) L.v = [];
      const ids = Object.keys(d.items).filter(p => p !== P.pid);
      P.upd = () => {
        const fin = L.sent;
        $$('.vote button').forEach(b => { const k = L.v.indexOf(b.dataset.v); const t = $('.tn', b); t.textContent = k >= 0 ? (k + 1) + '.º' : ''; t.hidden = k < 0; b.classList.toggle('on', k >= 0); b.disabled = !!fin; });
        const sb = $('[data-act="vsend"]'); if (sb) { sb.disabled = !!fin || L.v.length < Math.min(3, ids.length); sb.hidden = !!fin; }
        const el = $('#gotline'); if (el) { el.textContent = fin ? (P.S.got.includes(P.pid) ? 'Voto recibido. Mira la carrera en la tele.' : 'Enviando…') : `Elige ${Math.min(3, ids.length)} por orden: primera, segunda y tercera.`; el.classList.toggle('ok', !!fin); }
      };
      return `<section class="stack"><div class="lbl">Concurso de tapas</div><h1 class="q" style="font-size:1.5rem">Tu podio de tapas</h1><div class="vote">${ids.map(p => `<button data-act="vtap" data-v="${esc(p)}"><span class="vt">${pimg(p)}<span>${esc(d.items[p])}<small>${esc(nm(p))}</small></span></span><span class="tn wide" hidden></span></button>`).join('')}</div>
        <div class="row"><button class="btn ghost sm" data-act="vreset">Borrar</button><button class="btn big" data-act="vsend" style="flex:1">Enviar voto</button></div>${gotLine()}</section>`;
    }
  }
  return '';
}
function cifrasUpd() {
  const L = P.L, d = P.S.d;
  const ct = $('#ctiles'); if (ct) ct.innerHTML = L.tiles.map((t, i) => `<button class="tn${t.v > 99 ? ' wide' : ''}${L.a === i ? ' sel' : ''}" data-act="ctile" data-v="${i}"${t.used ? ' disabled' : ''}>${t.v}</button>`).join('');
  $$('.ops button').forEach(b => b.classList.toggle('sel', b.dataset.v === L.op));
  const cs = $('#csteps'); if (cs) cs.innerHTML = L.steps.map(s => `<span>${esc(s.txt)}</span>`).join('');
  const best = L.tiles.reduce((b, t) => Math.abs(t.v - d.t) < Math.abs(b - d.t) ? t.v : b, L.tiles[0].v);
  const cb = $('#cbest'); if (cb) { const df = Math.abs(best - d.t); cb.textContent = `Tu mejor número: ${best} ${df ? `(a ${df})` : '¡exacto!'}`; cb.classList.toggle('ok', !df); }
  if (L.sentBest !== best) { L.sentBest = best; setPres({a: {v: best, ops: L.steps.map(s => s.txt)}}); }
}
function letrasUpd() {
  const L = P.L, d = P.S.d;
  const word = L.used.map(i => d.l[i]).join('');
  const w = $('#lword'); if (w) w.textContent = word || '·';
  const lt = $('#ltiles'); if (lt) lt.innerHTML = d.l.map((l, i) => `<button class="tl" data-act="ltile" data-v="${i}"${L.used.includes(i) ? ' disabled' : ''}>${l}</button>`).join('');
  const st = $('#lstat'); if (st) st.textContent = word ? `${word.length} letras. Se envía sola al acabar el tiempo.` : 'Toca las letras en orden.';
  if (L.sent !== word) { L.sent = word; setPres({a: word}); }
}
function setupDrawCanvas() {
  const cv = $('#dcv'); if (!cv) return; paint(cv, P.strokes);
  let cur = null;
  const pt = e => { const r = cv.getBoundingClientRect(); return [Math.round((e.clientX - r.left) / r.width * DSCALE), Math.round((e.clientY - r.top) / r.height * DSCALE)]; };
  const pushDraw = force => { const s = encStrokes(P.strokes); if (s === P.lastDraw) return; const now = Date.now(); if (!force && now - P.drawT < 180) return; P.drawT = now; P.lastDraw = s; setPres({d: s}); };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); if (encStrokes(P.strokes).length > DMAX) { const f = $('#dfull'); if (f) f.textContent = 'Lienzo lleno: borra para seguir'; return; } try { cv.setPointerCapture(e.pointerId); } catch (x) {} cur = [pt(e)]; P.strokes.push(cur); paint(cv, P.strokes); });
  cv.addEventListener('pointermove', e => { if (!cur) return; const p = pt(e); const l = cur[cur.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) < 14) return; cur.push(p); paint(cv, P.strokes); pushDraw(false); });
  const end = () => { if (!cur) return; cur = null; pushDraw(true); };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
}
function paintPartner() {
  const cv = $('#gcv'); if (!cv || !room || !P.S || !P.S.d) return;
  const mp = myPair(); if (!mp) return; const dr = P.S.d.dr[mp.id];
  const peer = room.peers().find(p => p.presence && p.presence.pid === dr && p.presence.k === P.S.k);
  const d = peer && typeof peer.presence.d === 'string' ? peer.presence.d : '';
  if (cv.dataset.last === d && cv.width) return; cv.dataset.last = d; paint(cv, decStrokes(d));
}
function phoneReveal(R, mp) {
  const S = P.S, res = S.res, d = S.d || {}; const g = res.pts[mp.id] || 0; let info = '';
  switch (R.kind) {
    case 'quiz': info = `<p>La buena era <b>${esc(d.o ? d.o[res.ok] : '')}</b>.</p><p class="status ${P.L.sel === res.ok ? 'ok' : ''}">${P.L.sel === res.ok ? 'Has acertado' : P.L.sel == null ? 'No respondiste' : 'Has fallado'}</p>`; break;
    case 'cancion': { const pa = d.pa && d.pa[mp.id]; info = `<p>Era <b>${esc(res.t)}</b>.</p><p class="status ${pa && pa[0] === res.ok ? 'ok' : ''}">${!pa ? 'No respondisteis' : pa[0] === res.ok ? 'Habéis acertado' : 'Habéis fallado'}</p>`; break; }
    case 'cifras': info = res.sol ? `<div class="lbl">Una solución${res.sv !== d.t ? ` (lo más cerca: ${res.sv})` : ''}</div><div class="steps">${res.sol.map(s => `<span>${esc(s)}</span>`).join('')}</div>` : ''; break;
    case 'letras': info = '<p>El jurado está revisando las palabras en la tele.</p>'; break;
    case 'dibujo': info = `<p>Era <b>${esc(res.w)}</b>.</p>`; break;
    case 'tapas': info = `<ul class="list">${(res.rank || []).slice(0, 3).map(([p, v, n, pos]) => `<li class="li"><span>${pos}.º ${esc(d.items ? d.items[p] : '')}</span><span class="muted">${esc(nm(p))} · ${v} votos</span></li>`).join('')}</ul>`; break;
  }
  return `<section class="board center"><div class="lbl">Resultado · ${esc(mp.n)}</div><div class="gainbig">${g > 0 ? '+' : ''}${g}</div>${mp.x2 === S.r && g > 0 ? '<span class="pill x2">Con comodín ×2</span>' : ''}${info}</section>`;
}
function setName(n) { n = String(n || '').trim().slice(0, 40); if (!n) return; P.name = n; ls.set('name.' + gameCode, n); P.sig = ''; setPres({role: 'p', pid: P.pid, name: n, g: gameCode}); keepAwake(); playerRender(); }
const PACT = {
  pickname: v => setName(v),
  ans: v => { P.L.sel = +v; setPres({a: +v}); P.upd && P.upd(); },
  sans: v => { const dd = P.S.d; const mp = myPair(); if (!dd.stage || (mp && dd.pa[mp.id])) return; P.L.sel = +v; setPres({a: +v}); P.upd && P.upd(); },
  x2: () => { setPres({x2: P.S.r}); toast('Comodín pedido. Aparecerá en la tele.'); },
  ctile: v => {
    const L = P.L, i = +v;
    if (L.a == null || L.op == null || L.a === i) { L.a = L.a === i ? null : i; L.op = L.a == null ? null : L.op; cifrasUpd(); return; }
    const a = L.tiles[L.a].v, b = L.tiles[i].v; let r = null;
    if (L.op === '+') r = a + b; if (L.op === '×') r = a * b; if (L.op === '−') r = a - b; if (L.op === '÷') r = b && a % b === 0 ? a / b : null;
    if (r == null || r <= 0) { toast(L.op === '÷' ? 'Solo vale si la división es exacta.' : 'El resultado tiene que ser positivo.'); return; }
    L.tiles[L.a].used = true; L.tiles[i].used = true; L.tiles.push({v: r, used: false});
    L.steps.push({txt: `${a} ${L.op} ${b} = ${r}`, ia: L.a, ib: i}); L.a = null; L.op = null; cifrasUpd();
  },
  cop: v => { if (P.L.a == null) { toast('Primero toca una cifra.'); return; } P.L.op = v; cifrasUpd(); },
  cundo: () => { const L = P.L; const s = L.steps.pop(); if (!s) return; L.tiles.pop(); L.tiles[s.ia].used = false; L.tiles[s.ib].used = false; L.a = null; L.op = null; cifrasUpd(); },
  creset: () => { const L = P.L; L.tiles = P.S.d.n.map(v => ({v, used: false})); L.steps = []; L.a = null; L.op = null; cifrasUpd(); },
  ltile: v => { const i = +v; if (!P.L.used.includes(i)) P.L.used.push(i); letrasUpd(); },
  lback: () => { P.L.used.pop(); letrasUpd(); },
  lclear: () => { P.L.used = []; letrasUpd(); },
  dclear: () => { P.strokes = []; const f = $('#dfull'); if (f) f.textContent = ''; const cv = $('#dcv'); if (cv) paint(cv, []); P.lastDraw = ''; setPres({d: ''}); },
  mark: v => { const L = P.L, i = +v; L.m = L.m.includes(i) ? L.m.filter(x => x !== i) : [...L.m, i]; setPres({a: {m: L.m, c: null, cn: L.cn}}); P.upd && P.upd(); },
  claim: v => { const L = P.L; L.cn++; setPres({a: {m: L.m, c: v, cn: L.cn}}); toast(v === 'l' ? '¡Línea cantada!' : '¡Bingo cantado!'); },
  tsend: () => {
    const n = ($('#tname') ? $('#tname').value : '').trim().slice(0, 40);
    if (!n) { toast('Ponle nombre a tu tapa.'); return; }
    P.myTapa = Object.assign({}, P.myTapa || {}, {n});
    if (room) room.publishImg({g: gameCode, n, img: P.myTapa.img || null});
    P.upd && P.upd();
  },
  vtap: v => { const L = P.L; if (L.sent) return; L.v = L.v.includes(v) ? L.v.filter(x => x !== v) : L.v.length < 3 ? [...L.v, v] : L.v; P.upd && P.upd(); },
  vreset: () => { if (P.L.sent) return; P.L.v = []; P.upd && P.upd(); },
  vsend: () => { const L = P.L; if (L.sent || !L.v.length) return; L.sent = true; setPres({a: {v: L.v, f: true}}); P.upd && P.upd(); },
  rename: () => { P.name = ''; ls.del('name.' + gameCode); P.sig = ''; playerRender(); }
};
let playerWired = false;
function connectPlayer() {
  const bi = +params.get('b') || 0;
  const net = makeNet(gameCode, brokerUrl(bi), false, P.pid);
  room = net;
  net.on('st', S => onState(S));
  net.onPeers(() => { if (P.S && P.S.ph === 'play' && ROUNDS[P.S.r] && ROUNDS[P.S.r].kind === 'dibujo') paintPartner(); });
  net.onImg((pid, data) => { if (data && data.g === gameCode && isImg(data.img)) { P.imgs[pid] = data.img; if (P.S && P.S.ph === 'play' && P.S.d && P.S.d.mode === 'vote') { P.sig = ''; playerRender(); } } });
  let wasUp = false;
  net.onConnection(up => { if (up) { wasUp = true; roomState = 'ok'; } else if (!wasUp) roomState = 'pending'; if (!P.S) playerRender(); });
  setTimeout(() => { if (!wasUp) { roomState = 'none'; if (!P.S) { P.sig = ''; playerRender(); } } }, 12000);
  if (P.name) setPres({role: 'p', pid: P.pid, name: P.name, g: gameCode});
  setInterval(() => { if (P.name) setPres({hb: Date.now()}); }, 8000);
}
function startPlayer() {
  if (playerWired) { playerRender(); return; }
  playerWired = true; P.sig = ''; playerRender(); connectPlayer();
}
let wake = null;
function keepAwake() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener('release', () => { wake = null; }); }).catch(() => {}); } catch (e) {} }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && role === 'player') keepAwake(); });

/* ================= SELECCIÓN DE MODO ================= */
function roleScreen() {
  const app = $('#app'); app.className = 'phone';
  app.innerHTML = `<section class="hero"><div class="lbl">Campeonato Mundial</div><div class="tiles md">${tilesWord('VILLARASO')}</div><div class="tiles md">${tilesWord('2026', 'tn')}</div><div class="lbl">Edición otoño</div></section>
  <section class="board stack">
    <button class="btn big full" data-act="pick" data-v="host">Abrir la pantalla del presentador</button>
    <p class="muted">Ábrelo en el portátil conectado a la tele. Saldrá un código QR: cada jugador lo escanea con la cámara de su móvil y entra sin instalar nada ni crear cuentas.</p>
  </section>`;
}
function render() {
  if (role === 'host') { if (!H.G) startHost(); else hostRender(); }
  else if (role === 'player') startPlayer();
  else roleScreen();
}
setInterval(() => {
  if (role === 'host') hostTick();
  else if (role === 'player' && P.S && P.S.ph === 'play' && P.deadline) { const R = ROUNDS[P.S.r]; if (R && R.secs) setClock(P.deadline - Date.now(), R.secs * 1000); }
}, 250);

/* ---------- eventos ---------- */
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]'); if (!el || el.disabled) return;
  const act = el.dataset.act, v = el.dataset.v;
  if (act === 'pick') { role = v; ls.set('role', v); render(); return; }
  if (role === 'host' && HACT[act]) { HACT[act](v, el, ev); return; }
  if (role === 'player' && PACT[act]) { keepAwake(); PACT[act](v, el, ev); }
});
document.addEventListener('submit', ev => {
  ev.preventDefault();
  const f = ev.target;
  if (f.id === 'nameform') setName($('#pname').value);
  if (f.id === 'addoff' && role === 'host') { const n = $('#offname').value.trim().slice(0, 40); if (!n) return; H.G.players['x' + rid(8)] = {n, off: true}; $('#offname').value = ''; changed(); }
  if (f.id === 'gform' && role === 'player') { const g = $('#guess').value.trim(); if (!g) return; P.L.tried = g; setPres({a: g}); $('#guess').value = ''; P.upd && P.upd(); }
});
document.addEventListener('change', async ev => {
  if (ev.target.id !== 'tphoto' || role !== 'player') return;
  const file = ev.target.files && ev.target.files[0]; if (!file) return;
  try {
    const img = await compressImage(file);
    const n = ($('#tname') ? $('#tname').value : '').trim();
    P.myTapa = Object.assign({}, P.myTapa || {}, {img}, n ? {n} : {});
    const pv = $('#tprev'); if (pv) { pv.src = img; pv.hidden = false; }
    toast('Foto lista. Pulsa «Enviar mi tapa».');
  } catch (e) { toast('No he podido leer esa foto. Prueba con otra.'); }
});
window.addEventListener('resize', () => { if (role === 'player') { const cv = $('#dcv'); if (cv) paint(cv, P.strokes); const g = $('#gcv'); if (g) { g.dataset.last = '~'; paintPartner(); } } });

if (!window.mqtt) { roomState = 'none'; }
render();
})();
