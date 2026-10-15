/**
 * EL ÚNICO SITIO DONDE SE ELIGE DÓNDE SE GUARDAN LOS CURSOS.
 *
 * Igual que `despacho/index.ts`, y por lo mismo: con las claves de Firebase
 * puestas todo va a la nube; sin ellas, al navegador. No hay un interruptor que
 * alguien tenga que acordarse de mover al desplegar, porque un interruptor así
 * siempre acaba mal puesto un martes por la tarde.
 */

import { hayFirebase } from "@/lib/firebase";
import { avanceLocal, cursosLocal, inscripcionesLocal } from "./local";
import { avanceNube, cursosNube, inscripcionesNube } from "./nube";
import type { RepoAvance, RepoCursos, RepoInscripciones } from "./repositorio";

const enLaNube = hayFirebase();

export const cursos: RepoCursos = enLaNube ? cursosNube : cursosLocal;
export const inscripciones: RepoInscripciones = enLaNube ? inscripcionesNube : inscripcionesLocal;
export const avance: RepoAvance = enLaNube ? avanceNube : avanceLocal;

/** ¿Se está guardando en la nube? Lo pregunta la pantalla para el cartel de
 *  «esto vive sólo en este navegador». Ese aviso es verdad sin nube y mentira
 *  con ella, y un aviso que miente enseña a no leer los avisos. */
export const guardadoEnLaNube = enLaNube;

/* Las lecturas de administración no pasan por el repositorio: no tienen
   versión local porque sin nube no hay nadie de quien sacar métricas. */
export { todosLosAvances } from "./nube";
export { nuevoId } from "./local";
export * from "./tipos";
export type { RepoAvance, RepoCursos, RepoInscripciones } from "./repositorio";
