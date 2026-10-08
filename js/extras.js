// Frases de la pantalla de enhorabuena, niveles del logro de kilos y notas de versión.

// wiki: título del artículo en la Wikipedia en inglés; la foto se pide al momento y solo se usa si es de Wikimedia Commons (uso libre).
export const QUOTES = [
  { nombre: "Arnold Schwarzenegger", tipo: "culturista", wiki: "Arnold_Schwarzenegger", emoji: "🏆", frase: "La fuerza no viene de ganar. Tus luchas desarrollan tu fuerza. Cuando pasas por dificultades y decides no rendirte, eso es fuerza." },
  { nombre: "Ronnie Coleman", tipo: "culturista", wiki: "Ronnie_Coleman", emoji: "🏋️", frase: "Todo el mundo quiere ser culturista, pero nadie quiere levantar pesos pesados. ¡Yeah buddy! ¡Peso ligero, nene!" },
  { nombre: "Muhammad Ali", tipo: "boxeador", wiki: "Muhammad_Ali", emoji: "🥊", frase: "Odiaba cada minuto de entrenamiento, pero me decía: no abandones. Sufre ahora y vive el resto de tu vida como un campeón." },
  { nombre: "Bruce Lee", tipo: "artista marcial", wiki: "Bruce_Lee", emoji: "🥋", frase: "No temo al hombre que ha practicado 10.000 patadas una vez; temo al hombre que ha practicado una patada 10.000 veces." },
  { nombre: "Rocky Balboa", tipo: "personaje de cine", wiki: "Rocky_Balboa", emoji: "🥊", frase: "No importa lo fuerte que golpees. Importa lo fuerte que pueden golpearte y seguir avanzando." },
  { nombre: "Popeye", tipo: "personaje de dibujos animados", wiki: "Popeye", emoji: "💪", frase: "Soy lo que soy, y eso es todo lo que soy." },
  { nombre: "Yoda", tipo: "maestro jedi", wiki: "Yoda", emoji: "🟢", frase: "Hazlo o no lo hagas, pero no lo intentes." },
  { nombre: "Freddie Mercury", tipo: "músico", wiki: "Freddie_Mercury", emoji: "🎤", frase: "No voy a ser una estrella, voy a ser una leyenda." },
  { nombre: "Bob Marley", tipo: "músico", wiki: "Bob_Marley", emoji: "🎶", frase: "No sabes lo fuerte que eres hasta que ser fuerte es la única opción que te queda." },
  { nombre: "Michael Jordan", tipo: "jugador de baloncesto", wiki: "Michael_Jordan", emoji: "🏀", frase: "He fallado una y otra vez en mi vida. Por eso tengo éxito." },
  { nombre: "Usain Bolt", tipo: "velocista", wiki: "Usain_Bolt", emoji: "⚡", frase: "Entrené cuatro años para correr nueve segundos." },
  { nombre: "Dwayne «The Rock» Johnson", tipo: "actor y luchador", wiki: "Dwayne_Johnson", emoji: "🪨", frase: "Sé humilde, ten hambre y sé siempre el que más trabaja en la sala." },
];

// Logro automático por kilos acumulados (suma de peso × repeticiones de todas las series).
export const KG_TIERS = [
  { kg: 1000, emoji: "🥉", titulo: "Primera tonelada", desc: "1.000 kg levantados: como un coche pequeño." },
  { kg: 5000, emoji: "🥈", titulo: "5 toneladas", desc: "5.000 kg levantados: como un elefante." },
  { kg: 10000, emoji: "🥇", titulo: "10 toneladas", desc: "10.000 kg levantados: como un autobús." },
  { kg: 25000, emoji: "🏅", titulo: "25 toneladas", desc: "25.000 kg levantados: como un camión cargado." },
  { kg: 50000, emoji: "🏆", titulo: "50 toneladas", desc: "50.000 kg levantados: como un tanque." },
  { kg: 100000, emoji: "🐋", titulo: "100 toneladas", desc: "100.000 kg levantados: como una ballena azul." },
  { kg: 250000, emoji: "🚀", titulo: "250 toneladas", desc: "250.000 kg levantados: como un avión jumbo." },
  { kg: 500000, emoji: "👑", titulo: "500 toneladas", desc: "500.000 kg levantados." },
  { kg: 1000000, emoji: "💎", titulo: "Mil toneladas", desc: "1.000.000 kg levantados. Leyenda." },
];

// Notas de versión (la primera es la actual).
export const CHANGELOG = [
  {
    version: "16",
    fecha: "2026-10-08",
    cambios: [
      "Vacaciones día a día: al llegar el primer día ves solo el día de hoy y apuntas lo que hagas eligiendo el tipo (caminata, correr, bici, nadar, calistenia, fuerza, deporte, estiramientos…) con minutos, km y una nota. Puedes apuntar varias; al acabar el día se guarda y pasas al siguiente (si no apuntas nada, queda como día sin actividad).",
      "Mientras estás de vacaciones, Hoy esconde la rutina y muestra el día de vacaciones; al terminar vuelve a aparecer sola.",
      "Botón «Terminar vacaciones y volver a la rutina» por si acaban antes o puedes seguir entrenando.",
      "Las vacaciones tienen su propia sección en Hoy, más visible.",
      "Arreglado: los campos de fecha se salían de la caja en el iPhone.",
    ],
  },
  {
    version: "15",
    fecha: "2026-10-08",
    cambios: [
      "Modo vacaciones: apunta el día que empiezas y el día que acabas (Hoy → «Vacaciones y diario»). Esas semanas no rompen tu racha y al volver sigues con el siguiente entreno.",
      "Diario de cada viaje con su nombre («Semana Camino», «Viaje a China»…) para anotar lo que haces cada día y consultarlo cuando quieras.",
      "Semana de descarga: la app te la propone cada 4-6 semanas o si te estancas en varios ejercicios. Durante 7 días hace la mitad de series con un 10 % menos de peso. También puedes empezarla tú desde Ajustes.",
    ],
  },
  {
    version: "14",
    fecha: "2026-10-08",
    cambios: [
      "Temporizador: elige el sonido de la alarma (pitidos, campana, reloj digital, silbato, gong o sirena) y su volumen en Perfil → Ajustes, con botón para probarlo.",
      "La alarma del descanso suena aunque la app esté en segundo plano, en otra app o con la pantalla bloqueada, y se ve en la pantalla de bloqueo. Se puede desactivar en Ajustes.",
      "Arreglado: la alarma no sonaba a veces con el temporizador plegado.",
      "El temporizador aparece plegado por defecto y el botón para abrirlo se ve mucho más.",
      "Si haces la rutina en otro orden, al acabar un ejercicio te lleva al siguiente que te falta (el cardio, siempre al final).",
      "Fin del entreno: pantalla de enhorabuena con una frase motivadora y después un resumen con kilos levantados (comparados con la sesión anterior, la semana y el total), calorías estimadas, revisión de lo que faltó y propuestas de mejora por ejercicio.",
      "Al terminar puedes preparar la siguiente sesión con las mejoras propuestas o con los mismos pesos.",
      "Nuevo logro automático por kilos acumulados, desde la primera tonelada hasta las mil.",
      "Novedades de cada versión en Perfil.",
    ],
  },
];
