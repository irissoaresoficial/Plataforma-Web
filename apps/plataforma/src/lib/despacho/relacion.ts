/**
 * CÓMO VA LA RELACIÓN CON UNA PERSONA
 *
 * Un CRM para quien vive de sesiones de una en una no es un archivador de
 * fichas: es la respuesta a cuatro preguntas que Iris hoy contesta contando con
 * los dedos sobre la agenda de papel.
 *
 *   · ¿Cuándo la vi por última vez?
 *   · ¿Cuándo vuelvo a verla?
 *   · ¿Escribí lo que pasó en la última sesión?
 *   · ¿Le debo una factura?
 *
 * Ninguna de esas cuatro está guardada en ningún sitio: las cuatro se sacan
 * cruzando la ficha con las citas y las facturas. La cuenta se hace AQUÍ y en
 * un solo sitio, y no en cada pantalla, por un motivo muy concreto: la lista de
 * clientes, la ficha abierta y los avisos de la cabecera dicen las mismas tres
 * cosas al mismo tiempo, y si cada una la calculara por su cuenta acabarían
 * discrepando — la lista diciendo «hace 3 meses» y el aviso diciendo «hace 2».
 *
 * Este archivo no sabe que existe el almacenamiento: recibe las listas ya
 * leídas y devuelve la cuenta. Por eso vale igual el día de Firebase.
 */

import type { Cita, Cliente, Factura } from "./tipos";
import { diaRelativo, diasEntre, hace, hora } from "./fechas";

export type Relacion = {
  /** La última sesión que ya ha pasado. Nula si nunca ha habido ninguna. */
  ultima: Cita | null;
  /** La siguiente apuntada. Nula si no hay nada por delante. */
  proxima: Cita | null;
  /** Días de calendario desde la última. Nulo si nunca ha venido. */
  diasSinVerse: number | null;
  /** Cuántas sesiones lleva. Es lo que separa a una clienta de un nombre. */
  sesiones: number;
  /**
   * La última sesión pasada sobre la que no se escribió ninguna nota después.
   * Nula si está apuntada, si no hay sesiones o si la sesión es ya tan vieja
   * que apuntarla ahora sería inventarse el recuerdo (ver `DIAS_PARA_APUNTAR`).
   */
  sinApuntar: Cita | null;
  /** Sus facturas todavía en borrador, de la más vieja a la más nueva. */
  borradores: Factura[];
};

/**
 * Pasado un mes, una sesión sin apuntar se queda sin apuntar.
 *
 * No es un número arbitrario: lo que Iris escribiría hoy de una sesión de hace
 * cuatro meses no es lo que pasó, es lo que recuerda — y una nota inventada es
 * peor que ninguna, porque la próxima vez la leerá creyéndosela. Pasado el mes,
 * la plataforma deja de insistir.
 */
export const DIAS_PARA_APUNTAR = 30;

/** El que no vuelve en tres meses es el que ya no vuelve. Es el tramo a partir
 *  del cual una relación se ha enfriado de verdad y no es «que ha tardado». */
export const DIAS_FRIO = 90;

/** Todo lo de una persona, cruzado. `ahora` entra por parámetro y no se pide
 *  dentro para que dos llamadas seguidas den lo mismo y para poder probarlo. */
export function relacionDe(
  cliente: Cliente,
  citas: Cita[],
  facturas: Factura[],
  ahora = new Date()
): Relacion {
  const corte = ahora.toISOString();
  // Las anuladas no cuentan para nada: una sesión que no se dio no es una vez
  // que se vieron, y contarla diría que la relación está más caliente de lo
  // que está — que es exactamente el error que esta pantalla existe para evitar.
  const suyas = citas
    .filter((c) => c.personaId === cliente.id && c.estado !== "anulada")
    .sort((a, b) => a.inicioISO.localeCompare(b.inicioISO));

  const pasadas = suyas.filter((c) => c.inicioISO <= corte);
  const futuras = suyas.filter((c) => c.inicioISO > corte);

  const ultima = pasadas.length ? pasadas[pasadas.length - 1] : null;
  const diasSinVerse = ultima ? diasEntre(new Date(ultima.inicioISO), ahora) : null;

  // Una nota escrita DESPUÉS de la sesión es la nota de esa sesión. Comparar
  // por fecha y no por un enlace entre nota y cita es a propósito: Iris escribe
  // «lo que pasó el jueves», no «la nota de la cita 7f3a», y atarlas obligaría
  // a elegir una cita cada vez que apunta algo.
  const apuntada = ultima ? cliente.notas.some((n) => n.fecha >= ultima.inicioISO) : true;

  return {
    ultima,
    proxima: futuras[0] ?? null,
    diasSinVerse,
    sesiones: pasadas.length,
    sinApuntar: ultima && !apuntada && (diasSinVerse ?? 0) <= DIAS_PARA_APUNTAR ? ultima : null,
    borradores: facturas
      .filter((f) => f.clienteId === cliente.id && f.estado === "borrador")
      .sort((a, b) => a.creada.localeCompare(b.creada)),
  };
}

/**
 * La línea que va debajo del nombre en la lista.
 *
 * Manda lo que viene: si hay una sesión apuntada, eso es lo que Iris necesita
 * ver, porque es lo único sobre lo que todavía puede hacer algo. Sólo cuando no
 * hay nada por delante se dice cuánto hace de la última — que es entonces el
 * dato que decide si hay que llamar.
 *
 * Corto de verdad: cabe debajo de un nombre en una columna de 300 px.
 */
export function comoVaCorto(r: Relacion, ahora = new Date()): string {
  if (r.proxima) {
    const cuando = diaRelativo(new Date(r.proxima.inicioISO), ahora);
    return `${cuando} a las ${hora(r.proxima.inicioISO)}`;
  }
  if (r.diasSinVerse === null) return "Sin ninguna sesión todavía";
  return mayuscula(hace(r.diasSinVerse));
}

/**
 * Las dos frases de la ficha: lo que viene y lo que hubo, dichas enteras.
 *
 * Aquí sí caben, y aquí hacen falta las dos: la ficha es donde se decide si se
 * llama a alguien, y para eso hay que saber a la vez que la próxima es dentro
 * de dos semanas y que la última fue en junio.
 */
export function frasesDeRelacion(r: Relacion, ahora = new Date()): { viene: string; hubo: string } {
  const viene = r.proxima
    ? `La próxima, ${diaRelativo(new Date(r.proxima.inicioISO), ahora).toLocaleLowerCase("es")} a las ${hora(r.proxima.inicioISO)}.`
    : "No tiene ninguna sesión apuntada.";

  if (r.diasSinVerse === null) return { viene, hubo: "Todavía no has tenido ninguna sesión." };

  const cuantas = r.sesiones === 1 ? "Ha venido una vez" : `Ha venido ${r.sesiones} veces`;
  return { viene, hubo: `${cuantas}; la última, ${hace(r.diasSinVerse)}.` };
}

/** «hace 3 meses» → «Hace 3 meses». Los rótulos empiezan por mayúscula y las
 *  frases de dentro no, así que la conversión se hace donde se usa. */
export const mayuscula = (t: string) => t.replace(/^./, (c) => c.toLocaleUpperCase("es"));
