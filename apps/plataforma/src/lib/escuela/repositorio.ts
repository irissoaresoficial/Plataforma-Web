/**
 * LO QUE SE PUEDE HACER CON LOS CURSOS, SIN DECIR DÓNDE SE GUARDAN.
 *
 * Mismo trato que el despacho (ver `lib/despacho/repositorio.ts`): las
 * pantallas hablan con estas interfaces y nunca con Firestore ni con
 * `localStorage`. Lo que se gana es que la plataforma arranca y se trabaja en
 * ella sin claves de nadie delante, y que el día que haya que mudarse se
 * cambia un archivo.
 */

import type { Avance, Curso, Inscripcion } from "./tipos";

export interface RepoCursos {
  /** Todos. Sólo lo llama Iris: un alumno pide los suyos. */
  listar(): Promise<Curso[]>;
  /** Los publicados, para quien no es Iris. */
  publicados(): Promise<Curso[]>;
  /** Los que monta un creador, publicados o no. */
  deAutor(uid: string): Promise<Curso[]>;
  obtener(id: string): Promise<Curso | null>;
  guardar(c: Curso): Promise<Curso>;
  borrar(id: string): Promise<void>;
}

export interface RepoInscripciones {
  /** A qué cursos tiene acceso esta persona. */
  deAlumno(uid: string): Promise<Inscripcion[]>;
  /** Quién tiene acceso a este curso. Para la pantalla de Gestión. */
  deCurso(cursoId: string): Promise<Inscripcion[]>;
  dar(uid: string, cursoId: string, via?: Inscripcion["via"]): Promise<Inscripcion>;
  quitar(uid: string, cursoId: string): Promise<void>;
  /** Las de los cursos de un creador. Para sus métricas. */
  deAutor(uid: string): Promise<Inscripcion[]>;
}

export interface RepoAvance {
  de(uid: string, cursoId: string): Promise<Avance | null>;
  /**
   * Marca o desmarca una lección y devuelve cómo queda.
   *
   * Devuelve el avance entero en vez de nada a propósito: la pantalla necesita
   * repintar la barra de progreso justo después, y si tuviera que volver a
   * preguntar habría un parpadeo entre el clic y la barra moviéndose. Lo que
   * hace que esto se sienta bien es que la barra se mueva EN EL MOMENTO.
   */
  marcar(uid: string, cursoId: string, leccionId: string, hecha: boolean, autor?: string, equipo?: string[]): Promise<Avance>;
  /** Los avances en los cursos de un creador. Para sus métricas. */
  deAutor(uid: string): Promise<Avance[]>;
}
