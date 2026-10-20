/**
 * LOS CURSOS EN FIRESTORE.
 *
 * Mismas costumbres que `despacho/nube.ts`, y por el mismo motivo —que dos
 * mitades de la plataforma que hacen lo mismo de dos maneras distintas son dos
 * cosas que mantener:
 *
 *   · LOS IDENTIFICADORES LOS PONEMOS NOSOTROS (`setDoc`, no `addDoc`). Así
 *     guardar es la misma operación tanto si crea como si actualiza, y el id de
 *     una inscripción puede ser `uid__cursoId`, que es lo que impide por la
 *     forma del dato que alguien aparezca dos veces en el mismo curso.
 *   · LEER SIN CONEXIÓN DEVUELVE VACÍO, no revienta. Escribir sin conexión SÍ
 *     revienta, y debe: quien llama tiene que poder decir «no se ha guardado».
 *     Una escritura que falla en silencio es trabajo perdido sin avisar.
 */

import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { nube } from "@/lib/firebase";
import type { Avance, Curso, Inscripcion } from "./tipos";
import type { RepoAvance, RepoCursos, RepoInscripciones } from "./repositorio";

function base() {
  const b = nube();
  if (!b) throw new Error("La plataforma no está conectada a Firebase.");
  return b;
}
const baseOpcional = () => nube();

function conId<T>(id: string, datos: unknown): T {
  return { ...(datos as object), id } as T;
}

export const cursosNube: RepoCursos = {
  async listar() {
    const b = baseOpcional();
    if (!b) return [];
    const r = await getDocs(query(collection(b, "cursos"), orderBy("tocado", "desc")));
    return r.docs.map((d) => conId<Curso>(d.id, d.data()));
  },

  /*
   * LOS PUBLICADOS SE FILTRAN EN EL SERVIDOR, no aquí.
   *
   * Traerlos todos y quedarse con los publicados parece lo mismo y no lo es:
   * las reglas no dejan a un alumno leer un borrador, así que la consulta
   * entera fallaría —Firestore rechaza la consulta, no filtra lo que no se
   * puede— y la pantalla se quedaría sin cursos en vez de sin borradores.
   */
  async publicados() {
    const b = baseOpcional();
    if (!b) return [];
    const r = await getDocs(query(collection(b, "cursos"), where("publicado", "==", true)));
    return r.docs
      .map((d) => conId<Curso>(d.id, d.data()))
      .sort((a, b2) => b2.tocado.localeCompare(a.tocado));
  },

  /* Filtrado en el servidor por lo mismo que los publicados: un creador no
     puede leer los cursos de otro, así que pedirlos todos fallaría entero. */
  async deAutor(uid) {
    const b = baseOpcional();
    if (!b) return [];
    const r = await getDocs(query(collection(b, "cursos"), where("autor", "==", uid)));
    return r.docs
      .map((d) => conId<Curso>(d.id, d.data()))
      .sort((a, b2) => b2.tocado.localeCompare(a.tocado));
  },

  async obtener(id) {
    const b = baseOpcional();
    if (!b) return null;
    const d = await getDoc(doc(b, "cursos", id));
    return d.exists() ? conId<Curso>(d.id, d.data()) : null;
  },

  async guardar(c) {
    await setDoc(doc(base(), "cursos", c.id), c);
    return c;
  },

  async borrar(id) {
    await deleteDoc(doc(base(), "cursos", id));
  },
};

export const inscripcionesNube: RepoInscripciones = {
  async deAlumno(uid) {
    const b = baseOpcional();
    if (!b) return [];
    const r = await getDocs(query(collection(b, "inscripciones"), where("uid", "==", uid)));
    return r.docs.map((d) => conId<Inscripcion>(d.id, d.data()));
  },
  async deCurso(cursoId) {
    const b = baseOpcional();
    if (!b) return [];
    const r = await getDocs(query(collection(b, "inscripciones"), where("cursoId", "==", cursoId)));
    return r.docs.map((d) => conId<Inscripcion>(d.id, d.data()));
  },
  async dar(uid, cursoId, via = "mano") {
    const nueva: Inscripcion = {
      id: `${uid}__${cursoId}`,
      uid,
      cursoId,
      desde: new Date().toISOString(),
      via,
    };
    await setDoc(doc(base(), "inscripciones", nueva.id), nueva);
    return nueva;
  },
  async quitar(uid, cursoId) {
    await deleteDoc(doc(base(), "inscripciones", `${uid}__${cursoId}`));
  },
};

export const avanceNube: RepoAvance = {
  async de(uid, cursoId) {
    const b = baseOpcional();
    if (!b) return null;
    const d = await getDoc(doc(b, "avance", `${uid}__${cursoId}`));
    return d.exists() ? conId<Avance>(d.id, d.data()) : null;
  },
  /**
   * SE ESCRIBE PRIMERO Y SE PREGUNTA DESPUÉS.
   *
   * Aquí había lo que parece de sentido común: leer cómo va el avance, añadir
   * o quitar la lección a mano, y guardar la lista entera. Tenía dos defectos,
   * y uno de ellos rompía la función del todo.
   *
   * EL QUE LA ROMPÍA. La lectura iba antes de que el documento existiera, y
   * leer un documento que no existe no era «no hay nada»: era un no de las
   * reglas (el porqué está escrito entero en `firebase/firestore.rules`, en el
   * bloque de `avance`). Así que la primera lección de cada curso no se podía
   * marcar nunca. La regla ya está arreglada; esta lectura, además, ya no
   * hace falta.
   *
   * EL OTRO. Dos pestañas abiertas en el mismo curso —que pasa más de lo que
   * parece: una en el móvil y otra en el ordenador— leían las dos la misma
   * lista y la guardaban las dos enteras. La segunda borraba lo que había
   * marcado la primera, sin avisar.
   *
   * `arrayUnion` y `arrayRemove` no tienen ninguno de los dos problemas:
   * dicen «añade esto» y «quita esto», y es el servidor quien junta. No hay
   * lista que pisar y no hay que leer para escribir. Con `merge` el documento
   * se crea si no estaba.
   *
   * La lectura de después sí hace falta, y es la razón por la que esto
   * devuelve el avance entero y no nada: quien llama necesita repintar la
   * barra de progreso con lo que de verdad hay guardado, no con lo que supone.
   * Ahí el documento ya existe, así que esa lectura no tropieza con nada.
   */
  async marcar(uid, cursoId, leccionId, hecha) {
    const b = base();
    const id = `${uid}__${cursoId}`;
    const referencia = doc(b, "avance", id);
    await setDoc(
      referencia,
      {
        id,
        uid,
        cursoId,
        hechas: hecha ? arrayUnion(leccionId) : arrayRemove(leccionId),
        tocado: new Date().toISOString(),
      },
      { merge: true }
    );
    const d = await getDoc(referencia);
    const hechas = (d.data()?.hechas as string[]) ?? [];
    return { id, uid, cursoId, hechas, tocado: (d.data()?.tocado as string) ?? new Date().toISOString() };
  },
};

/**
 * TODOS los avances de todo el mundo. Sólo lo lee la administración.
 *
 * Es lo que hace posible la pantalla de métricas sin guardar ni una cifra
 * aparte: cuántas lecciones se han terminado, cuántos acaban un curso y en qué
 * lección exacta se cae la gente salen todos de aquí.
 *
 * NO SE PUEDE PAGINAR, y conviene saberlo: con mil alumnos y diez cursos son
 * diez mil documentos en una lectura. Hoy, con una escuela que empieza, son
 * decenas. El día que eso crezca, las métricas se calculan en el servidor una
 * vez al día y se guarda el resumen; no se arregla paginando aquí.
 */
export async function todosLosAvances(): Promise<Avance[]> {
  const b = baseOpcional();
  if (!b) return [];
  const r = await getDocs(collection(b, "avance"));
  return r.docs.map((d) => conId<Avance>(d.id, d.data()));
}
