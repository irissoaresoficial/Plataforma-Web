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
 */

import { citasLocal, clientesLocal, facturasLocal } from "./local";
import type { RepoCitas, RepoClientes, RepoFacturas } from "./repositorio";

export const citas: RepoCitas = citasLocal;
export const clientes: RepoClientes = clientesLocal;
export const facturas: RepoFacturas = facturasLocal;

export { nuevoId, sinTildes } from "./local";
export * from "./tipos";
export * from "./emisor";
export * from "./fechas";
export type { RepoCitas, RepoClientes, RepoFacturas, Repositorio } from "./repositorio";
