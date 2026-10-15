/**
 * ============================================================================
 * SUBIR UN VÍDEO AL ALMACÉN DE FIREBASE
 * ============================================================================
 *
 * Iris elige un archivo de su ordenador y aquí se sube. Antes pegaba un enlace
 * de YouTube; desde el 15 de octubre de 2026, por decisión de Gerson, todo va
 * directamente a Firebase.
 *
 * LO QUE ESTO GANA: nadie depende de una cuenta de YouTube, el vídeo no se
 * puede encontrar buscando, y no hay que entender qué es un «enlace para
 * insertar». Iris elige el archivo y ya está.
 *
 * LO QUE ESTO CUESTA, y va escrito aquí porque es donde se mira: Firebase cobra
 * por lo DESCARGADO, no por lo guardado. Guardar cien gigas de clases vale unos
 * dos euros al mes; que cincuenta alumnos las vean vale bastante más. La cuenta
 * está en `firebase.ts`, junto a `almacen()`.
 *
 * TRES COSAS QUE HACE ESTE ARCHIVO Y QUE NO SE VEN:
 *
 *   1. SE SUBE POR TROZOS Y SE PUEDE SEGUIR. `uploadBytesResumable` corta el
 *      archivo y va mandando pedazos. Con un vídeo de un giga eso no es un
 *      lujo: con una subida de una sola pieza, un corte de red a los nueve
 *      minutos obliga a empezar de cero, y a la segunda vez que pase nadie
 *      sube nada más.
 *
 *   2. SE DICE POR DÓNDE VA. Una barra que avanza es la diferencia entre
 *      esperar y pensar que se ha colgado. Sin ella, a los dos minutos se
 *      cierra la pestaña — y eso sí cancela la subida.
 *
 *   3. EL NOMBRE DEL ARCHIVO NO SE RESPETA. «Clase 1 - DEFINITIVO (2).mp4»
 *      lleva espacios, paréntesis y puede repetirse. Se guarda con un nombre
 *      nuestro y la extensión original, y el nombre bonito no hace falta para
 *      nada: lo que se enseña al alumno es el título de la lección.
 */

import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from "firebase/storage";
import { almacen } from "@/lib/firebase";
import { nuevoId } from "./local";

/** Lo que se puede subir. Un vídeo que el navegador no sabe reproducir es un
 *  archivo que ocupa, cuesta y no se ve. */
const TIPOS = ["video/mp4", "video/webm", "video/quicktime"];

/**
 * El tope, y el porqué del número.
 *
 * 2 GB da para una clase larga en buena calidad. Más que eso casi siempre es un
 * archivo sin comprimir salido de la cámara, y subirlo tal cual es tirar dinero
 * dos veces: una al guardarlo y otra cada vez que alguien lo ve.
 */
const TOPE = 2 * 1024 * 1024 * 1024;

export type Problema = { mensaje: string };

/** Qué le pasa a este archivo, si le pasa algo. En cristiano, no en códigos. */
export function revisa(f: File): Problema | null {
  if (!TIPOS.includes(f.type)) {
    return {
      mensaje:
        "Ese archivo no es un vídeo que los navegadores sepan poner. Tiene que ser .mp4, .webm o .mov — el .mp4 es el que funciona en todos.",
    };
  }
  if (f.size > TOPE) {
    const gb = (f.size / (1024 * 1024 * 1024)).toFixed(1);
    return {
      mensaje: `Ese vídeo pesa ${gb} GB y el tope son 2 GB. Exportalo en 1080p en vez de 4K: se ve igual de bien en una clase y pesa la cuarta parte.`,
    };
  }
  return null;
}

export type Subida = {
  /** Para pintar la barra: de 0 a 1. */
  alVer: (parte: number) => void;
};

/**
 * Sube el archivo y devuelve su dirección para verlo.
 *
 * Lanza si falla, y debe: quien llama tiene que poder decir «no se ha subido».
 * Una subida que falla en silencio deja una lección sin vídeo y a nadie
 * enterado hasta que un alumno se queja.
 */
export async function subeVideo(cursoId: string, f: File, { alVer }: Subida): Promise<string> {
  const a = almacen();
  if (!a) throw new Error("La plataforma no está conectada a Firebase, así que no se puede subir nada.");

  const malo = revisa(f);
  if (malo) throw new Error(malo.mensaje);

  /* La extensión se saca del nombre y, si no la trae, del tipo. Sin extensión
     algunos navegadores se hacen los remolones al reproducir. */
  const punto = f.name.lastIndexOf(".");
  const ext = punto > 0 ? f.name.slice(punto + 1).toLowerCase() : (f.type.split("/")[1] || "mp4");

  /* Por curso, para que se vea de un vistazo en la consola de Firebase qué
     ocupa qué, y para poder borrar un curso entero sin ir archivo a archivo. */
  const sitio = ref(a, `cursos/${cursoId}/${nuevoId()}.${ext}`);

  const tarea = uploadBytesResumable(sitio, f, { contentType: f.type });

  await new Promise<void>((listo, falla) => {
    tarea.on(
      "state_changed",
      (s) => alVer(s.totalBytes ? s.bytesTransferred / s.totalBytes : 0),
      (e) => falla(e),
      () => listo()
    );
  });

  return getDownloadURL(tarea.snapshot.ref);
}

/**
 * Borra un vídeo subido.
 *
 * NO SE LLAMA AL QUITAR UNA LECCIÓN, y eso es a propósito. Quitar una lección
 * del temario es un gesto de un clic que se hace probando, y borrar el vídeo
 * ahí mismo haría irreversible algo que parece reversible: Iris reordena, se
 * arrepiente, y el archivo ya no está. Lo que cuesta dejarlo son dos céntimos
 * al mes.
 *
 * Existe para cuando haya una pantalla de limpiar lo que ya no usa nadie, que
 * es donde ese borrado se hace a la vista y a propósito.
 */
export async function borraVideo(url: string): Promise<void> {
  const a = almacen();
  if (!a) return;
  await deleteObject(ref(a, url));
}
