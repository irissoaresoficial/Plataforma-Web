/**
 * EL ÚNICO SITIO DONDE SE ELIGE DÓNDE SE GUARDA
 *
 * Las pantallas importan `citas`, `clientes` y `facturas` de aquí y no saben
 * nada más. El día que llegue Firebase, esto son tres líneas:
 *
 *     export const citas: RepoCitas = citasFirebase;
 *     export const clientes: RepoClientes = clientesFirebase;
 *     export const facturas: RepoFacturas = facturasFirebase;
 *
 * y no se toca ni una pantalla. Ésa es toda la razón de que exista la carpeta.
 *
 * Los avisos entraron después y por la misma puerta: lo que se guarda de ellos
 * —cuáles ya se han visto— tiene su repositorio como los otros tres. Lo que NO
 * se guarda es el aviso en sí, que se calcula cada vez en `avisos.ts` a partir
 * de lo que ya hay. Ninguna pantalla llama a `localStorage`, tampoco para eso.
 */

import { avisosLocal, citasLocal, clientesLocal, facturasLocal } from "./local";
import type { RepoAvisos, RepoCitas, RepoClientes, RepoFacturas } from "./repositorio";

export const citas: RepoCitas = citasLocal;
export const clientes: RepoClientes = clientesLocal;
export const facturas: RepoFacturas = facturasLocal;
/** Qué avisos ya ha mirado Iris. Los avisos en sí no se guardan: se calculan. */
export const avisos: RepoAvisos = avisosLocal;

export { nuevoId, sinTildes } from "./local";
export * from "./tipos";
export * from "./emisor";
export * from "./fechas";
export * from "./relacion";
export * from "./avisos";
export type { RepoAvisos, RepoCitas, RepoClientes, RepoFacturas, Repositorio } from "./repositorio";
