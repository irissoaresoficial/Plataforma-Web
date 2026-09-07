/**
 * QUIÉN FACTURA — Y LO QUE TODAVÍA NO SE SABE DE ÉL
 *
 * En España una factura sin el nombre o razón social, el NIF y el domicilio de
 * quien la emite no es una factura: es un papel. Y esos tres datos NO los ha
 * dado nadie todavía.
 *
 * Así que no se inventan. Se marcan como `PENDIENTE`, igual que hace la web en
 * `apps/web/content/site.ts`, y mientras lo estén:
 *
 *   · la plataforma deja guardar borradores, que no son documentos;
 *   · pero NO deja emitir una factura definitiva;
 *   · y el hueco sale marcado en la pantalla y en la propia factura, para que
 *     se vea de un vistazo qué falta.
 *
 * CUANDO LLEGUEN LOS DATOS: se escriben abajo, en `EMISOR`, y ya está. La
 * etiqueta desaparece sola y el botón de emitir se enciende.
 */

import type { DatosFiscales } from "./tipos";

/** Lo que todavía no tiene valor de verdad. La misma palabra que usa la web. */
export const PENDIENTE = "PENDIENTE";

/**
 * LOS DATOS FISCALES DE IRIS. AQUÍ SE ESCRIBEN, Y EN NINGÚN SITIO MÁS.
 *
 * No los rellenes «para probar»: una factura de prueba con un NIF inventado se
 * acaba emitiendo de verdad, y entonces ya lleva número y no se puede borrar.
 */
export const EMISOR: DatosFiscales = {
  nombre: PENDIENTE,
  nif: PENDIENTE,
  direccion: PENDIENTE,
};

/** Un dato que no está puesto: pendiente, vacío o sin definir. */
export const falta = (v: unknown) => v === PENDIENTE || v === null || v === "" || v === undefined;

/** Cómo se llama cada hueco cuando hay que decírselo a Iris. */
const NOMBRES: Array<{ campo: keyof DatosFiscales; etiqueta: string }> = [
  { campo: "nombre", etiqueta: "Nombre o razón social" },
  { campo: "nif", etiqueta: "NIF" },
  { campo: "direccion", etiqueta: "Domicilio fiscal" },
];

/** Qué falta del emisor, con el nombre que entiende quien lo lee. */
export function faltaDelEmisor(e: DatosFiscales = EMISOR): string[] {
  return NOMBRES.filter(({ campo }) => falta(e[campo])).map(({ etiqueta }) => etiqueta);
}

/** ¿Se puede emitir una factura definitiva? Sólo si no falta ninguno. */
export function emisorCompleto(e: DatosFiscales = EMISOR): boolean {
  return faltaDelEmisor(e).length === 0;
}
