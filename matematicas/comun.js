// ============================================
// MATEMÁTICAS INTERACTIVAS - utilidades comunes
// ============================================

let vozSeleccionada = null;

function poblarVoces() {
  if (!("speechSynthesis" in window)) return;
  const voces = window.speechSynthesis.getVoices();
  vozSeleccionada =
    voces.find(v => v.lang && v.lang.toLowerCase().startsWith("es") && /chile|CL/i.test(v.lang + v.name)) ||
    voces.find(v => v.lang && v.lang.toLowerCase().startsWith("es")) ||
    null;
}
if ("speechSynthesis" in window) {
  poblarVoces();
  window.speechSynthesis.onvoiceschanged = poblarVoces;
}

function hablar(texto, callback) {
  if (!("speechSynthesis" in window) || !texto) { if (callback) callback(); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = vozSeleccionada ? vozSeleccionada.lang : "es-ES";
  if (vozSeleccionada) utterance.voice = vozSeleccionada;
  utterance.rate = 0.88;
  utterance.pitch = 1.08;
  utterance.volume = 1;
  if (callback) utterance.onend = callback;
  window.speechSynthesis.speak(utterance);
}

// Tonito simple de acierto/error con WebAudio (sin archivos de audio)
function tono(frecuencias, duracion = 0.14) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    let t = ctx.currentTime;
    frecuencias.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duracion + 0.02);
      t += duracion * 0.85;
    });
    setTimeout(() => ctx.close().catch(() => {}), (frecuencias.length * duracion + 0.3) * 1000);
  } catch (e) { /* audio no disponible, seguimos sin sonido */ }
}
function tonoAcierto() { tono([523.25, 659.25, 783.99]); }
function tonoError() { tono([220, 196]); }

function confeti(contenedor) {
  const emojis = ["🎉", "⭐", "✨", "🌟", "🎈"];
  for (let i = 0; i < 14; i++) {
    const pieza = document.createElement("span");
    pieza.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    pieza.style.position = "fixed";
    pieza.style.left = (45 + Math.random() * 10) + "vw";
    pieza.style.top = "40vh";
    pieza.style.fontSize = (1.2 + Math.random() * 1.4) + "rem";
    pieza.style.pointerEvents = "none";
    pieza.style.zIndex = "999";
    pieza.style.transition = "transform 0.9s ease-out, opacity 0.9s ease-out";
    (contenedor || document.body).appendChild(pieza);
    requestAnimationFrame(() => {
      const dx = (Math.random() - 0.5) * 260;
      const dy = -(120 + Math.random() * 160);
      pieza.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg)`;
      pieza.style.opacity = "0";
    });
    setTimeout(() => pieza.remove(), 1000);
  }
}

function barajar(arr) {
  const copia = arr.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function elegirAlAzar(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function enteroAlAzar(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const FRASES_EXITO = ["🎉 ¡Muy bien! 🎉", "✨ ¡Correcto! ✨", "🌟 ¡Excelente! 🌟", "💫 ¡Lo lograste! 💫", "🥳 ¡Así es! 🥳"];
const FRASES_ANIMO = ["Intenta de nuevo 💪", "Casi, ¡tú puedes! 🙂", "Vuelve a mirar con calma 👀"];

function fraseExito() { return elegirAlAzar(FRASES_EXITO); }
function fraseAnimo() { return elegirAlAzar(FRASES_ANIMO); }
