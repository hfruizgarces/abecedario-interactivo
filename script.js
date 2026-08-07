/* ============================================
   ABECEDARIO INTERACTIVO - LÓGICA
   Educación Parvularia - JavaScript puro

   SISTEMA DE AUDIO:
   - Cada letra reproduce un archivo de audio grabado
     manualmente, ubicado en la carpeta "audios/" junto
     a este script, usando siempre rutas relativas
     (audios/<nombre>.mpeg). Ya no usa voz sintética.
   - El botón "🔊 Repetir instrucciones" mantiene el
     sistema anterior (SpeechSynthesis del navegador),
     tal como se pidió, ya que no hay un archivo grabado
     para ese texto.
   ============================================ */

// ------------------------------------------------
// 1. DATOS DEL ABECEDARIO (orden usado en Chile,
//    con CH después de C, LL después de L, Ñ después de N)
//
//    Cada letra apunta a su archivo de audio grabado.
//    Los nombres de archivo coinciden EXACTAMENTE con
//    el nombre de la letra en minúscula, por lo que si
//    en el futuro reemplazas cualquier .mpeg por una
//    nueva grabación con el mismo nombre, la aplicación
//    seguirá funcionando sin tocar el código.
// ------------------------------------------------
const ABECEDARIO = [
  { letra: "A",  archivo: "audios/a.mpeg" },
  { letra: "B",  archivo: "audios/b.mpeg" },
  { letra: "C",  archivo: "audios/c.mpeg" },
  { letra: "CH", archivo: "audios/ch.mpeg" },
  { letra: "D",  archivo: "audios/d.mpeg" },
  { letra: "E",  archivo: "audios/e.mpeg" },
  { letra: "F",  archivo: "audios/f.mpeg" },
  { letra: "G",  archivo: "audios/g.mpeg" },
  { letra: "H",  archivo: "audios/h.mpeg" },
  { letra: "I",  archivo: "audios/i.mpeg" },
  { letra: "J",  archivo: "audios/j.mpeg" },
  { letra: "K",  archivo: "audios/k.mpeg" },
  { letra: "L",  archivo: "audios/l.mpeg" },
  { letra: "LL", archivo: "audios/ll.mpeg" },
  { letra: "M",  archivo: "audios/m.mpeg" },
  { letra: "N",  archivo: "audios/n.mpeg" },
  { letra: "Ñ",  archivo: "audios/ñ.mpeg" },
  { letra: "O",  archivo: "audios/o.mpeg" },
  { letra: "P",  archivo: "audios/p.mpeg" },
  { letra: "Q",  archivo: "audios/q.mpeg" },
  { letra: "R",  archivo: "audios/r.mpeg" },
  { letra: "S",  archivo: "audios/s.mpeg" },
  { letra: "T",  archivo: "audios/t.mpeg" },
  { letra: "U",  archivo: "audios/u.mpeg" },
  { letra: "V",  archivo: "audios/v.mpeg" },
  { letra: "W",  archivo: "audios/w.mpeg" },
  { letra: "X",  archivo: "audios/x.mpeg" },
  { letra: "Y",  archivo: "audios/y.mpeg" },
  { letra: "Z",  archivo: "audios/z.mpeg" }
];

// ------------------------------------------------
// 2. REFERENCIAS AL DOM
// ------------------------------------------------
const pantallaBienvenida = document.getElementById("pantallaBienvenida");
const pantallaAbecedario = document.getElementById("pantallaAbecedario");
const barraSuperior = document.getElementById("barraSuperior");
const gridAbecedario = document.getElementById("gridAbecedario");
const tituloAbecedario = document.getElementById("tituloAbecedario");

const btnMayusculas = document.getElementById("btnMayusculas");
const btnMinusculas = document.getElementById("btnMinusculas");
const btnInicio = document.getElementById("btnInicio");
const btnInstrucciones = document.getElementById("btnInstrucciones");

// ------------------------------------------------
// 3. ESTADO
// ------------------------------------------------
let modoActual = "mayusculas"; // "mayusculas" | "minusculas"
let vozSeleccionada = null;

// ------------------------------------------------
// 3.1 VOZ PARA LAS INSTRUCCIONES (SpeechSynthesis)
//     Se usa ÚNICAMENTE para el botón de instrucciones,
//     igual que en el sistema de audio anterior.
//     Fuerza español: es-CL -> es-ES -> es-*
// ------------------------------------------------
function elegirVoz() {
  if (!("speechSynthesis" in window)) return;
  const voces = window.speechSynthesis.getVoices();
  if (!voces || voces.length === 0) return;

  let voz = voces.find(v => v.lang && v.lang.toLowerCase() === "es-cl");
  if (!voz) voz = voces.find(v => v.lang && v.lang.toLowerCase() === "es-es");
  if (!voz) voz = voces.find(v => v.lang && v.lang.toLowerCase().startsWith("es-"));
  if (!voz) voz = voces.find(v => v.lang && v.lang.toLowerCase().startsWith("es"));

  vozSeleccionada = voz || null;

  if (!vozSeleccionada) {
    console.warn(
      "[Abecedario Interactivo] No se encontró ninguna voz en español (es-CL, es-ES o es) " +
      "en este navegador. Se usará la voz predeterminada para las instrucciones."
    );
  }
}

if ("speechSynthesis" in window) {
  elegirVoz();
  window.speechSynthesis.onvoiceschanged = elegirVoz;
}

// Reproduce un texto por voz sintética (solo para instrucciones)
function hablar(texto, velocidad = 0.8) {
  if (!("speechSynthesis" in window) || !texto) return;

  window.speechSynthesis.cancel(); // evita superposición de voces

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = vozSeleccionada ? vozSeleccionada.lang : "es-ES";
  if (vozSeleccionada) utterance.voice = vozSeleccionada;
  utterance.rate = velocidad;
  utterance.pitch = 1.05;

  window.speechSynthesis.speak(utterance);
}

// ------------------------------------------------
// 4. REPRODUCTOR DE AUDIO ÚNICO Y REUTILIZABLE
//    Un solo elemento Audio para toda la aplicación:
//    si se toca una nueva letra mientras suena otra,
//    la anterior se detiene de inmediato (sin superponer).
// ------------------------------------------------
const reproductor = new Audio();
let burbujaActiva = null; // burbuja que actualmente muestra la animación "hablando"

function detenerAudioActual() {
  reproductor.pause();
  reproductor.currentTime = 0;
  if (burbujaActiva) {
    burbujaActiva.classList.remove("hablando");
    burbujaActiva = null;
  }
}

// Cuando el audio termina naturalmente, se quita la animación
reproductor.addEventListener("ended", () => {
  if (burbujaActiva) burbujaActiva.classList.remove("hablando");
  burbujaActiva = null;
});

// Si el archivo no existe o no se puede reproducir, se avisa por consola
reproductor.addEventListener("error", () => {
  console.warn(`[Abecedario Interactivo] No se pudo reproducir el audio: ${reproductor.src}`);
  if (burbujaActiva) burbujaActiva.classList.remove("hablando");
  burbujaActiva = null;
});

// Reproduce el archivo de audio de la letra tocada,
// deteniendo inmediatamente cualquier audio anterior.
function reproducirLetra(datosLetra, burbuja) {
  detenerAudioActual();

  reproductor.src = datosLetra.archivo;
  burbuja.classList.add("hablando");
  burbujaActiva = burbuja;

  const promesaReproduccion = reproductor.play();
  if (promesaReproduccion && typeof promesaReproduccion.catch === "function") {
    promesaReproduccion.catch((error) => {
      console.warn(`[Abecedario Interactivo] Error al reproducir "${datosLetra.archivo}":`, error);
      burbuja.classList.remove("hablando");
      burbujaActiva = null;
    });
  }
}

// ------------------------------------------------
// 5. CONSTRUIR LA GRILLA DE BURBUJAS
// ------------------------------------------------
function construirAbecedario(modo) {
  gridAbecedario.innerHTML = "";
  modoActual = modo;

  tituloAbecedario.textContent = "¡Toca una letra para escucharla!";

  ABECEDARIO.forEach((datosLetra) => {
    const burbuja = document.createElement("button");
    burbuja.type = "button";
    burbuja.className = "burbuja-letra";
    if (datosLetra.letra === "CH") {
      burbuja.classList.add("par-ch"); // necesita compactar espaciado
    } else if (datosLetra.letra === "LL") {
      burbuja.classList.add("par-ll"); // letras angostas, necesitan más aire, no menos
    }

    const textoMostrado = modo === "mayusculas"
      ? datosLetra.letra
      : datosLetra.letra.toLowerCase();

    // El texto va envuelto en un span propio: así el letter-spacing de las
    // letras dobles se puede compensar y centrar visualmente sin corrimientos.
    const spanTexto = document.createElement("span");
    spanTexto.className = "texto-burbuja";
    spanTexto.textContent = textoMostrado;
    burbuja.appendChild(spanTexto);
    burbuja.setAttribute("aria-label", `Letra ${datosLetra.letra}`);

    // Clic o toque: reproducir el audio grabado de la letra
    burbuja.addEventListener("click", () => {
      reproducirLetra(datosLetra, burbuja);
    });

    gridAbecedario.appendChild(burbuja);
  });
}

// ------------------------------------------------
// 6. TRANSICIONES ENTRE PANTALLAS
// ------------------------------------------------
function irAAbecedario(modo) {
  construirAbecedario(modo);

  pantallaBienvenida.hidden = true;
  pantallaAbecedario.hidden = false;
  barraSuperior.hidden = false;
}

function irABienvenida() {
  detenerAudioActual();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  pantallaAbecedario.hidden = true;
  pantallaBienvenida.hidden = false;
  barraSuperior.hidden = true;
}

// El botón "Inicio" ahora lleva al menú principal del sitio (index.html),
// ya que este abecedario es uno de los 3 recursos, no la portada del sitio.
function irAlMenuPrincipal() {
  window.location.href = "index.html";
}

// ------------------------------------------------
// 7. EVENTOS DE BOTONES PRINCIPALES
// ------------------------------------------------
btnMayusculas.addEventListener("click", () => irAAbecedario("mayusculas"));
btnMinusculas.addEventListener("click", () => irAAbecedario("minusculas"));
btnInicio.addEventListener("click", irAlMenuPrincipal);

// El botón de instrucciones conserva el sistema anterior (voz sintética),
// mientras que las letras siguen usando los audios grabados.
btnInstrucciones.addEventListener("click", () => {
  detenerAudioActual(); // por si había un audio de letra sonando
  hablar("Toca una letra para escuchar su nombre y su sonido.", 0.8);
});

// Pequeño efecto visual "tocando" para feedback táctil en botones grandes
[btnMayusculas, btnMinusculas, btnInicio, btnInstrucciones].forEach((btn) => {
  btn.addEventListener("touchstart", () => btn.classList.add("tocando"), { passive: true });
  btn.addEventListener("touchend", () => btn.classList.remove("tocando"), { passive: true });
});
