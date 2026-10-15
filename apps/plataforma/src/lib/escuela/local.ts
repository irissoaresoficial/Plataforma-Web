/**
 * LOS CURSOS EN ESTE NAVEGADOR.
 *
 * Es lo que corre cuando no hay claves de Firebase: en desarrollo, y en una
 * previa donde nadie ha puesto las variables. No es un repuesto de emergencia
 * —si falta Firebase en producción hay un problema más gordo que éste— es lo
 * que permite montar y mirar las pantallas sin tocar la base de datos de Iris.
 *
 * Este archivo y `nube.ts` son los dos únicos de la escuela que saben dónde se
 * guarda nada.
 */

import type { Avance, Curso, Inscripcion } from "./tipos";
import type { RepoAvance, RepoCursos, RepoInscripciones } from "./repositorio";

const LS_CURSOS = "es33.cursos.v1";
const LS_INSCRIPCIONES = "es33.inscripciones.v1";
const LS_AVANCE = "es33.avance.v1";

/** Un identificador corto y legible. No tiene que ser único en el universo:
 *  tiene que serlo dentro de una escuela con unos pocos cursos. */
export function nuevoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function lee<T>(clave: string): T[] {
  /* Leer FUERA del try por el mismo motivo que en el despacho: una lista vacía
     porque no hay nada escrito es la verdad; una lista vacía porque el
     navegador no deja ni mirar es una mentira que se enseña como un hecho. */
  const crudo = localStorage.getItem(clave);
  if (!crudo) return [];
  try {
    const x = JSON.parse(crudo);
    return Array.isArray(x) ? (x as T[]) : [];
  } catch {
    return [];
  }
}

function escribe<T>(clave: string, xs: T[]): void {
  try {
    localStorage.setItem(clave, JSON.stringify(xs));
  } catch {
    /* Navegación privada, o almacenamiento lleno. Una pantalla que revienta
       por no poder guardar es peor que un guardado que no entra. */
  }
}

export const cursosLocal: RepoCursos = {
  async listar() {
    return lee<Curso>(LS_CURSOS).sort((a, b) => b.tocado.localeCompare(a.tocado));
  },
  async publicados() {
    return (await this.listar()).filter((c) => c.publicado);
  },
  async obtener(id) {
    return lee<Curso>(LS_CURSOS).find((c) => c.id === id) ?? null;
  },
  async guardar(c) {
    const xs = lee<Curso>(LS_CURSOS);
    const i = xs.findIndex((x) => x.id === c.id);
    if (i >= 0) xs[i] = c;
    else xs.push(c);
    escribe(LS_CURSOS, xs);
    return c;
  },
  async borrar(id) {
    escribe(
      LS_CURSOS,
      lee<Curso>(LS_CURSOS).filter((c) => c.id !== id)
    );
  },
};

export const inscripcionesLocal: RepoInscripciones = {
  async deAlumno(uid) {
    return lee<Inscripcion>(LS_INSCRIPCIONES).filter((x) => x.uid === uid);
  },
  async deCurso(cursoId) {
    return lee<Inscripcion>(LS_INSCRIPCIONES).filter((x) => x.cursoId === cursoId);
  },
  async dar(uid, cursoId, via = "mano") {
    const xs = lee<Inscripcion>(LS_INSCRIPCIONES);
    const id = `${uid}__${cursoId}`;
    const nueva: Inscripcion = { id, uid, cursoId, desde: new Date().toISOString(), via };
    const i = xs.findIndex((x) => x.id === id);
    if (i >= 0) xs[i] = nueva;
    else xs.push(nueva);
    escribe(LS_INSCRIPCIONES, xs);
    return nueva;
  },
  async quitar(uid, cursoId) {
    escribe(
      LS_INSCRIPCIONES,
      lee<Inscripcion>(LS_INSCRIPCIONES).filter((x) => x.id !== `${uid}__${cursoId}`)
    );
  },
};

export const avanceLocal: RepoAvance = {
  async de(uid, cursoId) {
    return lee<Avance>(LS_AVANCE).find((x) => x.id === `${uid}__${cursoId}`) ?? null;
  },
  async marcar(uid, cursoId, leccionId, hecha) {
    const xs = lee<Avance>(LS_AVANCE);
    const id = `${uid}__${cursoId}`;
    const viejo = xs.find((x) => x.id === id);
    const hechas = new Set(viejo?.hechas ?? []);
    if (hecha) hechas.add(leccionId);
    else hechas.delete(leccionId);
    const nuevo: Avance = { id, uid, cursoId, hechas: [...hechas], tocado: new Date().toISOString() };
    const i = xs.findIndex((x) => x.id === id);
    if (i >= 0) xs[i] = nuevo;
    else xs.push(nuevo);
    escribe(LS_AVANCE, xs);
    return nuevo;
  },
};
