/**
 * ============================================================================
 * LOS ARCHIVOS QUE SE BAJAN: SUBIRLOS Y QUITARLOS
 * ============================================================================
 *
 * El manual en PDF, la plantilla de la ficha, el audio de la meditación. Lo
 * que acompaña a un curso y no es un vídeo de clase.
 *
 * ESTO ERA UNA BIBLIOTECA COMÚN Y YA NO LO ES. Había una colección
 * `recursos` en Firestore y una pantalla «Recursos» en el menú, con todo
 * junto. Gerson: «cada curso tiene sus recursos, entonces es irrelevante
 * colocarlo allí». Ahora la ficha de cada archivo vive DENTRO del documento
 * de su curso, al lado de sus módulos — el porqué está escrito en `tipos.ts`,
 * donde está el tipo.
 *
 * LO QUE QUEDA AQUÍ es la parte que no cambia de sitio: hablar con el
 * almacén. Subir un archivo, adivinar de qué tipo es, decir cuánto pesa en
 * cristiano y borrarlo cuando sobra.
 *
 * DOS SITIOS, Y HAY QUE SABER POR QUÉ: un documento de Firestore no pasa de
 * 1 MB, así que el archivo va al almacén y en el curso queda su dirección.
 * Eso arrastra que quitar un recurso son DOS borrados —la ficha y el
 * archivo— y el segundo puede fallar. El orden está elegido abajo.
 */

import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { almacen } from "@/lib/firebase";
import { nuevoId } from "./local";
import type { Recurso } from "./tipos";

export type { Recurso };

export type Tipo = Recurso["tipo"];

/** 2 GB, igual que los vídeos de las clases. */
const TOPE = 2 * 1024 * 1024 * 1024;

/** El peso, dicho como lo diría una persona. */
export function pesoHumano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return mb < 100 ? `${mb.toFixed(1).replace(".", ",")} MB` : `${Math.round(mb)} MB`;
}

/**
 * De qué tipo es un archivo, mirando lo que el navegador dice que es.
 *
 * Se adivina en vez de preguntarlo porque es una pregunta que Iris no debería
 * tener que contestar: el archivo ya sabe lo que es. Si falla, se corrige en la
 * ficha — pero acertar nueve de cada diez veces ahorra un campo del formulario,
 * y cada campo que se quita es gente que termina de subirlo.
 */
export function adivinaTipo(f: File): Tipo {
  if (f.type.startsWith("audio/")) return "audio";
  if (f.type.startsWith("video/")) return "video";
  const n = f.name.toLowerCase();
  if (/\.(xlsx|xls|csv|docx|doc|pages|numbers|key|pptx)$/.test(n)) return "plantilla";
  return "pdf";
}

/**
 * Sube el archivo al almacén y devuelve su ficha.
 *
 * NO LA GUARDA EN NINGÚN SITIO, y eso es a propósito: la ficha va dentro del
 * documento del curso, y quien lo escribe es el editor, que ya está guardando
 * el curso entero por otras razones. Si esto escribiera por su cuenta,
 * habría dos sitios desde los que se toca el mismo documento y un curso a
 * medio guardar podría perder un recurso recién subido.
 */
export async function sube(
  cursoId: string,
  f: File,
  datos: { nombre: string; que: string; tipo?: Tipo },
  alVer: (parte: number) => void
): Promise<Recurso> {
  const a = almacen();
  if (!a) throw new Error("La plataforma no está conectada a Firebase.");
  if (f.size > TOPE) {
    throw new Error(`Ese archivo pesa ${pesoHumano(f.size)} y el tope son 2 GB.`);
  }

  const punto = f.name.lastIndexOf(".");
  const ext = punto > 0 ? f.name.slice(punto + 1).toLowerCase() : "bin";
  /* Dentro de la carpeta del curso, no en un montón común. Así, el día que
     se borre un curso entero, sus archivos se van con él sin tener que
     buscarlos uno a uno — y mirando el almacén se ve de quién es cada cosa. */
  const ruta = `recursos/${cursoId}/${nuevoId()}.${ext}`;
  const tarea = uploadBytesResumable(ref(a, ruta), f, { contentType: f.type || "application/octet-stream" });

  await new Promise<void>((listo, falla) => {
    tarea.on(
      "state_changed",
      (s) => alVer(s.totalBytes ? s.bytesTransferred / s.totalBytes : 0),
      (e) => falla(e),
      () => listo()
    );
  });

  const r: Recurso = {
    id: nuevoId(),
    nombre: datos.nombre.trim() || f.name,
    que: datos.que.trim(),
    tipo: datos.tipo ?? adivinaTipo(f),
    url: await getDownloadURL(tarea.snapshot.ref),
    ruta,
    peso: f.size,
    creado: new Date().toISOString(),
  };
  return r;
}

/**
 * Borra el archivo del almacén.
 *
 * EL ORDEN IMPORTA Y ESTÁ ELEGIDO: quien llama quita primero la ficha de la
 * lista del curso y guarda, y después llama a esto.
 *
 * Si se rompe entre los dos, queda un archivo en el almacén que no aparece en
 * ninguna lista: ocupa unos céntimos y no molesta a nadie. Al revés —archivo
 * primero— un fallo dejaría una ficha visible con un botón de descargar que da
 * error, que es lo que hace que alguien escriba preguntando qué pasa.
 *
 * Entre perder céntimos y perder la confianza de quien usa el curso, se
 * pierden los céntimos. Por eso esto NO lanza si falla.
 */
export async function borraArchivo(r: Recurso): Promise<void> {
  const a = almacen();
  if (!a) return;
  try {
    await deleteObject(ref(a, r.ruta));
  } catch {
    /* Ver arriba: el archivo huérfano es el precio aceptado. */
  }
}
