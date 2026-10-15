/**
 * ============================================================================
 * LA COMUNIDAD, EN DATOS
 * ============================================================================
 *
 * UN TEMA ES UN DOCUMENTO Y SUS RESPUESTAS VAN APARTE, y ésta es la decisión
 * contraria a la que se tomó con los cursos. Conviene entender por qué, porque
 * el caso parece el mismo y no lo es.
 *
 * Un curso es un árbol que escribe UNA persona de una sentada: Iris monta el
 * temario, lo guarda entero, y nadie más lo toca. Ahí el documento único gana.
 *
 * Un tema es lo contrario: lo abre una persona y le responden veinte, a la vez,
 * durante meses. Con las respuestas dentro del tema, cada respuesta sería
 * reescribir el documento completo — y dos personas respondiendo en el mismo
 * segundo se pisarían, perdiéndose una de las dos sin que nadie se entere. Esa
 * es exactamente la clase de pérdida que no se descubre nunca: nadie echa de
 * menos un mensaje que no sabe que existió.
 *
 * Así que: `temas` y `respuestas`, dos colecciones.
 *
 * EL CONTADOR DE RESPUESTAS VIVE EN EL TEMA, y está duplicado a propósito. Se
 * podría contar las respuestas cada vez que se pinta la lista, y serían veinte
 * consultas para enseñar veinte números. Guardarlo cuesta una escritura de más
 * al responder y ahorra una lectura por tema en cada visita a la pantalla.
 *
 * Lo que trae esa duplicación es que puede descuadrarse —si una escritura falla
 * a la mitad, el contador dice 7 y hay 6—. Se asume: un número de respuestas
 * que se queda corto un día no rompe nada ni engaña a nadie de forma que
 * importe. Si fuera dinero, no se asumiría.
 *
 * SE ORDENA POR ÚLTIMA RESPUESTA, no por cuándo se creó. Una comunidad
 * ordenada por creación entierra las conversaciones vivas debajo de las
 * muertas, y lo que hay que ver al entrar es dónde se está hablando AHORA.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { nube } from "@/lib/firebase";
import { nuevoId } from "./local";

export type Tema = {
  id: string;
  /** Quién lo escribió. Se guarda el uid Y el nombre. */
  uid: string;
  autor: string;
  /** Si lo escribió Iris. Se guarda en el tema para no tener que mirar su
   *  ficha cada vez que se pinta la lista. */
  esIris: boolean;
  titulo: string;
  texto: string;
  /** Fijado arriba. Sólo Iris. */
  fijado: boolean;
  respuestas: number;
  creado: string;
  /** Cuándo se habló por última vez. Es por lo que se ordena. */
  movido: string;
};

export type Respuesta = {
  id: string;
  temaId: string;
  uid: string;
  autor: string;
  esIris: boolean;
  texto: string;
  creado: string;
};

function base() {
  const b = nube();
  if (!b) throw new Error("La plataforma no está conectada a Firebase.");
  return b;
}

/*
 * EL NOMBRE DEL AUTOR SE GUARDA DENTRO DEL MENSAJE, NO SE BUSCA AL PINTAR.
 *
 * Lo "correcto" sería guardar sólo el uid y leer el nombre de su ficha. Y sería
 * un error por dos motivos:
 *
 *   1. Pintar veinte mensajes serían veinte lecturas más, cada una cobrada.
 *   2. Y sobre todo: las reglas NO dejan a un alumno leer la ficha de otro —es
 *      la lista de nombres y correos de la escuela—. Así que el nombre no
 *      llegaría nunca y todos los mensajes saldrían firmados por nadie.
 *
 * Lo que cuesta: si alguien se cambia el nombre, sus mensajes viejos siguen
 * firmados con el de antes. Es el precio correcto — un foro funciona así desde
 * siempre y nadie lo nota.
 */

export async function listaTemas(): Promise<Tema[]> {
  const b = nube();
  if (!b) return [];
  const r = await getDocs(query(collection(b, "temas"), orderBy("movido", "desc")));
  return r.docs.map((d) => ({ ...(d.data() as Omit<Tema, "id">), id: d.id }));
}

export async function creaTema(
  autor: { uid: string; nombre: string; esIris: boolean },
  titulo: string,
  texto: string
): Promise<Tema> {
  const ahora = new Date().toISOString();
  const t: Tema = {
    id: nuevoId(),
    uid: autor.uid,
    autor: autor.nombre,
    esIris: autor.esIris,
    titulo: titulo.trim(),
    texto: texto.trim(),
    fijado: false,
    respuestas: 0,
    creado: ahora,
    movido: ahora,
  };
  await setDoc(doc(base(), "temas", t.id), t);
  return t;
}

export async function respuestasDe(temaId: string): Promise<Respuesta[]> {
  const b = nube();
  if (!b) return [];
  const r = await getDocs(
    query(collection(b, "respuestas"), where("temaId", "==", temaId), orderBy("creado"))
  );
  return r.docs.map((d) => ({ ...(d.data() as Omit<Respuesta, "id">), id: d.id }));
}

export async function responde(
  temaId: string,
  autor: { uid: string; nombre: string; esIris: boolean },
  texto: string
): Promise<Respuesta> {
  const b = base();
  const ahora = new Date().toISOString();
  const r: Respuesta = {
    id: nuevoId(),
    temaId,
    uid: autor.uid,
    autor: autor.nombre,
    esIris: autor.esIris,
    texto: texto.trim(),
    creado: ahora,
  };
  await setDoc(doc(b, "respuestas", r.id), r);

  /*
   * Y se sube el contador y la fecha del tema. Va DESPUÉS y en su propia
   * escritura: si esto falla, la respuesta ya está guardada y lo único que
   * pasa es que el tema no sube en la lista hasta la siguiente. Al revés
   * —tocar el tema primero— un fallo dejaría un tema diciendo que tiene una
   * respuesta que no existe.
   */
  const d = await getDoc(doc(b, "temas", temaId));
  const antes = d.exists() ? ((d.data().respuestas as number) ?? 0) : 0;
  await updateDoc(doc(b, "temas", temaId), { respuestas: antes + 1, movido: ahora });
  return r;
}

/** Fijar y desfijar. Sólo Iris; las reglas lo comprueban otra vez. */
export async function fija(temaId: string, fijado: boolean): Promise<void> {
  await updateDoc(doc(base(), "temas", temaId), { fijado });
}

/**
 * Borrar un tema.
 *
 * NO BORRA SUS RESPUESTAS, y eso hay que saberlo: quedan colgadas en la
 * colección apuntando a un tema que ya no está. No se ven en ningún sitio
 * —sólo se piden las de un tema concreto— pero ocupan.
 *
 * Borrarlas aquí serían N escrituras desde el navegador, que puede fallar a la
 * mitad y encima se cobra una a una. Lo que corresponde es una función del
 * servidor que limpie, y se monta el día que haga falta. Escrito aquí para que
 * ese día se encuentre.
 */
export async function borraTema(temaId: string): Promise<void> {
  await deleteDoc(doc(base(), "temas", temaId));
}
