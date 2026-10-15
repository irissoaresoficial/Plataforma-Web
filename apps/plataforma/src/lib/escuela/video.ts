/**
 * ============================================================================
 * EL ENLACE QUE PEGA IRIS, CONVERTIDO EN UN VÍDEO QUE SE VE
 * ============================================================================
 *
 * EL PROBLEMA, DICHO COMO PASA. Iris sube un vídeo a donde sea, copia la barra
 * de direcciones y lo pega en la lección. Esa dirección es la de la PÁGINA del
 * vídeo, no la del reproductor: metida en un marco, YouTube devuelve una
 * página que se niega a mostrarse dentro de otra, y lo que ve el alumno es un
 * rectángulo en blanco.
 *
 * La salida de libro es pedirle «el enlace para insertar». Y es justo lo que no
 * se puede pedir: hay que entrar en otro menú, saber que existe esa opción y
 * distinguir un enlace de otro. Eso es lo que hace que una lección se quede sin
 * vídeo.
 *
 * Así que lo traduce el código. Ella pega lo que tiene y aquí se convierte.
 *
 * LO QUE SE RECONOCE, y por qué estos y no otros:
 *
 *   · YOUTUBE — es donde está todo el mundo, y en «oculto» es gratis.
 *   · VIMEO — lo que usa quien no quiere su marca encima.
 *   · BUNNY STREAM — lo que recomendaría para cobrar: unos céntimos por hora
 *     vista y no deja descargar el vídeo.
 *   · UN ARCHIVO SUELTO (.mp4, .webm) — el que se sube a cualquier sitio.
 *
 * LO QUE NO SE RECONOCE NO SE ROMPE: sale un enlace para abrirlo en otra
 * pestaña. Peor que verlo dentro, pero el alumno ve su clase. Una lección que
 * no se puede ver porque no supimos leer un enlace es el peor resultado
 * posible, y es el que tiene este archivo el trabajo de evitar.
 */

export type Video =
  /** Va dentro de un marco: es un reproductor de otra casa. */
  | { clase: "marco"; src: string }
  /** Es un archivo de vídeo: lo pone el navegador con sus propios controles. */
  | { clase: "archivo"; src: string }
  /** No lo sabemos leer: se abre fuera. */
  | { clase: "fuera"; src: string }
  /** No hay enlace todavía. */
  | { clase: "vacio" };

/** Saca el identificador de un vídeo de YouTube de cualquiera de sus formas. */
function youtube(u: URL): string | null {
  const h = u.hostname.replace(/^www\./, "");
  /* youtu.be/ID — el que da el botón de compartir. */
  if (h === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
  if (h !== "youtube.com" && h !== "m.youtube.com" && h !== "music.youtube.com") return null;
  /* youtube.com/watch?v=ID — la barra de direcciones. */
  const v = u.searchParams.get("v");
  if (v) return v;
  /* youtube.com/embed/ID y /shorts/ID y /live/ID. */
  const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
  return m ? m[2] : null;
}

export function leeVideo(enlace: string): Video {
  const limpio = (enlace || "").trim();
  if (!limpio) return { clase: "vacio" };

  let u: URL;
  try {
    u = new URL(limpio);
  } catch {
    /* No es ni una dirección. Pasa cuando se pega medio enlace o un texto. */
    return { clase: "fuera", src: limpio };
  }

  /* Nada que no vaya cifrado. Un vídeo por http dentro de una página por https
     lo bloquea el navegador sin decir por qué, y el hueco se queda en blanco
     igual que antes — con la diferencia de que aquí sí sabemos el motivo. */
  if (u.protocol !== "https:") return { clase: "fuera", src: limpio };

  const id = youtube(u);
  if (id) {
    /* `rel=0` quita los vídeos sugeridos de otros canales al terminar. En una
       escuela que cobra, terminar una lección y que salgan cuatro vídeos de
       otro es regalar al alumno. */
    return { clase: "marco", src: `https://www.youtube-nocookie.com/embed/${id}?rel=0` };
  }

  const h = u.hostname.replace(/^www\./, "");

  if (h === "vimeo.com" || h === "player.vimeo.com") {
    const n = u.pathname.match(/(\d+)/);
    if (n) return { clase: "marco", src: `https://player.vimeo.com/video/${n[1]}` };
  }

  /* Bunny Stream ya da directamente una dirección de reproductor. */
  if (h.endsWith("mediadelivery.net") || h.endsWith("b-cdn.net")) {
    if (/\.(mp4|webm|m4v)$/i.test(u.pathname)) return { clase: "archivo", src: limpio };
    return { clase: "marco", src: limpio };
  }

  if (/\.(mp4|webm|m4v|ogv)$/i.test(u.pathname)) return { clase: "archivo", src: limpio };

  return { clase: "fuera", src: limpio };
}
