/**
 * EL ÚNICO SITIO DONDE SE ELIGE DÓNDE SE GUARDA
 *
 * Las pantallas importan `citas`, `clientes` y `facturas` de aquí y no saben
 * nada más. Ésa era la apuesta de la carpeta entera, y aquí se cobra: la
 * mudanza del navegador a la nube son las cuatro líneas de abajo, y no se ha
 * tocado ni una pantalla.
 *
 * SE ELIGE SOLO, Y ESE ES EL PUNTO. Con las claves de Firebase puestas, todo
 * va a la nube; sin ellas, al navegador. No hay un interruptor que alguien
 * tenga que acordarse de mover al desplegar — un interruptor así siempre acaba
 * mal puesto un martes por la tarde, y entonces el trabajo de un día se guarda
 * en un sitio donde nadie lo va a buscar.
 *
 * Lo local no se tira: es lo que hace que la plataforma siga arrancando para
 * trabajar en las pantallas sin claves de nadie delante.
 *
 * Los avisos entraron después y por la misma puerta: lo que se guarda de ellos
 * —cuáles ya se han visto— tiene su repositorio como los otros tres. Lo que NO
 * se guarda es el aviso en sí, que se calcula cada vez en `avisos.ts` a partir
 * de lo que ya hay. Ninguna pantalla llama a `localStorage`, tampoco para eso.
 */

import { hayFirebase } from "@/lib/firebase";
import { avisosLocal, citasLocal, clientesLocal, facturasLocal } from "./local";
import { avisosNube, citasNube, clientesNube, facturasNube } from "./nube";
import type { RepoAvisos, RepoCitas, RepoClientes, RepoFacturas } from "./repositorio";

const enLaNube = hayFirebase();

export const citas: RepoCitas = enLaNube ? citasNube : citasLocal;
export const clientes: RepoClientes = enLaNube ? clientesNube : clientesLocal;
export const facturas: RepoFacturas = enLaNube ? facturasNube : facturasLocal;
/** Qué avisos ya ha mirado Iris. Los avisos en sí no se guardan: se calculan. */
export const avisos: RepoAvisos = enLaNube ? avisosNube : avisosLocal;

/**
 * ¿Se está guardando en la nube? Las pantallas lo preguntan para una sola cosa:
 * el cartel de «esto vive sólo en este navegador y se puede perder». Ese aviso
 * es verdad sin nube y es mentira con ella, y un aviso que miente entrena a la
 * gente a no leer los avisos.
 */
export const guardadoEnLaNube = enLaNube;

export { nuevoId, sinTildes } from "./local";
export * from "./tipos";
export * from "./emisor";
export * from "./fechas";
export * from "./relacion";
/* Aquí había un `export * from "./etapas"`. Las etapas eran las cinco columnas
   del tablero de Clientes y ese tablero ya no existe: Clientes es una lista.
   Lo único de aquel archivo que se sigue usando —`loQueCuelga`— se ha mudado a
   `relacion.ts`, que es de donde salía el dato. */
export * from "./rejilla";
export * from "./avisos";
export type { RepoAvisos, RepoCitas, RepoClientes, RepoFacturas, Repositorio } from "./repositorio";
