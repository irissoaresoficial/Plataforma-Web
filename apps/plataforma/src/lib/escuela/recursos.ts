/**
 * ============================================================================
 * LA BIBLIOTECA, EN DATOS
 * ============================================================================
 *
 * Un recurso es una ficha en Firestore que apunta a un archivo en el almacén.
 * Dos sitios, y hay que saber por qué: Firestore guarda texto y busca rápido;
 * el almacén guarda archivos y no sabe buscar. Meter el PDF dentro del
 * documento no se puede —hay un tope de 1 MB— y meter el nombre y la
 * descripción sólo en el nombre del archivo haría imposible buscar.
 *
 * LO QUE ESTO ARRASTRA, dicho claro: borrar la ficha NO borra el archivo. Son
 * dos borrados y el segundo puede fallar. Así que `borra()` hace los dos, en
 * el orden que deja el menor destrozo si se rompe a la mitad.
 */

import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { almacen, nube } from "@/lib/firebase";
import { nuevoId } from "./local";

export type Tipo = "pdf" | "audio" | "plantilla" | "video";

export type Recurso = {
  id: string;
  nombre: string;
  /** Una línea de qué es. Se busca por aquí además de por el nombre. */
  que: string;
  tipo: Tipo;
  /** Dónde está el archivo, para bajarlo. */
  url: string;
  /** Su sitio exacto en el almacén, que es lo que hace falta para borrarlo.
   *  No se saca de la `url`: esa lleva una llave dentro y parsearla sería
   *  atarse a un formato que Google puede cambiar. */
  ruta: string;
  /** En bytes. Se enseña en humano; se guarda en crudo para poder sumarlo. */
  peso: number;
  creado: string;
};

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

function base() {
  const b = nube();
  if (!b) throw new Error("La plataforma no está conectada a Firebase.");
  return b;
}

export async function listaRecursos(): Promise<Recurso[]> {
  const b = nube();
  if (!b) return [];
  const r = await getDocs(query(collection(b, "recursos"), orderBy("creado", "desc")));
  return r.docs.map((d) => ({ ...(d.data() as Omit<Recurso, "id">), id: d.id }));
}

/** Sube el archivo y guarda su ficha. Devuelve la ficha ya creada. */
export async function sube(
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
  const ruta = `recursos/${nuevoId()}.${ext}`;
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
  await setDoc(doc(base(), "recursos", r.id), r);
  return r;
}

/**
 * Borrar un recurso: la ficha y el archivo.
 *
 * EL ORDEN IMPORTA Y ESTÁ ELEGIDO. Primero la ficha, después el archivo.
 *
 * Si se rompe entre los dos, queda un archivo en el almacén que no aparece en
 * ninguna lista: ocupa unos céntimos y no molesta a nadie. Al revés —archivo
 * primero— un fallo dejaría una ficha visible con un botón de descargar que da
 * error, que es lo que hace que alguien escriba preguntando qué pasa.
 *
 * Entre perder céntimos y perder la confianza de quien usa la biblioteca, se
 * pierden los céntimos.
 */
export async function borra(r: Recurso): Promise<void> {
  await deleteDoc(doc(base(), "recursos", r.id));
  const a = almacen();
  if (!a) return;
  try {
    await deleteObject(ref(a, r.ruta));
  } catch {
    /* Ver arriba: el archivo huérfano es el precio aceptado. */
  }
}
