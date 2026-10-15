/*
 * EL ENLACE QUE PEGA IRIS.
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/video.ts
 *
 * Esto se comprueba aquí porque NO SE VE FALLANDO. Un enlace mal traducido no
 * da error: da un rectángulo en blanco en la pantalla de un alumno, en una
 * lección concreta, de un curso concreto, y nadie se entera hasta que alguien
 * escribe para quejarse. Para entonces lleva semanas roto.
 *
 * Y es lógica con muchas formas de entrar: la misma clase de YouTube tiene
 * cinco direcciones distintas según de dónde se copie —la barra, el botón de
 * compartir, un móvil, un directo, un corto— y todas tienen que acabar en el
 * mismo sitio.
 */
import { leeVideo } from "@/lib/escuela/video";

type Caso = [string, boolean, boolean];
const casos: Caso[] = [];
const comprueba = (que: string, obtenido: boolean, esperado: boolean) =>
  casos.push([que, obtenido, esperado]);

const marco = (u: string) => {
  const v = leeVideo(u);
  return v.clase === "marco" ? v.src : `NO es marco: ${v.clase}`;
};

/* ── YouTube: todas las formas de copiar la misma clase ──────────────── */

const ESPERADO = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0";

comprueba("la barra de direcciones", marco("https://www.youtube.com/watch?v=dQw4w9WgXcQ") === ESPERADO, true);
comprueba("el botón de compartir", marco("https://youtu.be/dQw4w9WgXcQ") === ESPERADO, true);
comprueba("con el minuto dentro", marco("https://youtu.be/dQw4w9WgXcQ?t=42") === ESPERADO, true);
comprueba("desde el móvil", marco("https://m.youtube.com/watch?v=dQw4w9WgXcQ") === ESPERADO, true);
comprueba("sin www", marco("https://youtube.com/watch?v=dQw4w9WgXcQ") === ESPERADO, true);
comprueba("un enlace para insertar ya hecho", marco("https://www.youtube.com/embed/dQw4w9WgXcQ") === ESPERADO, true);
comprueba("un corto", marco("https://www.youtube.com/shorts/dQw4w9WgXcQ") === ESPERADO, true);
comprueba("un directo", marco("https://www.youtube.com/live/dQw4w9WgXcQ") === ESPERADO, true);
comprueba("con la lista detrás", marco("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123") === ESPERADO, true);

/* Se pide la versión sin cookies y sin vídeos de otros al terminar: en una
   escuela que cobra, acabar una lección y que salgan cuatro vídeos de otro
   canal es regalarle el alumno a quien sea. */
comprueba("pide la versión sin cookies", marco("https://youtu.be/abc12345678").includes("youtube-nocookie"), true);
comprueba("quita los sugeridos del final", marco("https://youtu.be/abc12345678").includes("rel=0"), true);

/* ── Vimeo ───────────────────────────────────────────────────────────── */

comprueba("Vimeo normal", marco("https://vimeo.com/123456789") === "https://player.vimeo.com/video/123456789", true);
comprueba("Vimeo de reproductor", marco("https://player.vimeo.com/video/123456789") === "https://player.vimeo.com/video/123456789", true);

/* ── Archivos sueltos ────────────────────────────────────────────────── */

comprueba("un mp4 es un archivo", leeVideo("https://ejemplo.com/clase.mp4").clase === "archivo", true);
comprueba("un webm es un archivo", leeVideo("https://ejemplo.com/clase.webm").clase === "archivo", true);
comprueba("con parámetros detrás sigue siendo archivo", leeVideo("https://ejemplo.com/clase.mp4?t=1").clase === "archivo", true);

/* ── Lo que no se sabe leer NO SE ROMPE ──────────────────────────────── */
/* Es la regla que más importa: el alumno tiene que poder ver su clase aunque
   nosotros no hayamos reconocido de dónde sale el enlace. */

comprueba("una plataforma desconocida se abre fuera", leeVideo("https://loquesea.com/video/7").clase === "fuera", true);
comprueba("medio enlace pegado se abre fuera", leeVideo("youtube.com/watch?v=abc").clase === "fuera", true);
comprueba("un texto cualquiera se abre fuera", leeVideo("pendiente de subir").clase === "fuera", true);

/* Sin cifrar no se mete en la página: el navegador lo bloquea sin decir por
   qué y el hueco se queda en blanco igual que antes de todo esto. */
comprueba("sin https no se incrusta", leeVideo("http://www.youtube.com/watch?v=dQw4w9WgXcQ").clase === "fuera", true);

/* ── Vacío es vacío, no un error ─────────────────────────────────────── */
/* Una lección sin vídeo todavía es un estado legítimo: se monta el esqueleto
   del curso primero y se graba después. */

comprueba("sin enlace", leeVideo("").clase === "vacio", true);
comprueba("sólo espacios", leeVideo("   ").clase === "vacio", true);

/* ── El veredicto ────────────────────────────────────────────────────── */

const fallos = casos.filter(([, o, e]) => o !== e);

console.log("\nEL ENLACE DEL VÍDEO\n");
for (const [que, obtenido, esperado] of casos) {
  const bien = obtenido === esperado;
  console.log(`  ${bien ? "ok  " : "FALLA"} ${que.padEnd(46)} ${bien ? "" : `dio ${obtenido}, esperaba ${esperado}`}`);
}
console.log(`\n${casos.length - fallos.length} de ${casos.length} coinciden\n`);

process.exitCode = fallos.length ? 1 : 0;
