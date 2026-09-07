/**
 * LAS ETAPAS DEL TABLERO DE CLIENTES
 *
 * QUÉ ES UNA ETAPA AQUÍ, porque en la mayoría de los CRM no es esto.
 *
 * En un CRM de equipo comercial las columnas son un embudo que alguien mueve a
 * mano: «contactado», «propuesta enviada», «ganado». Funciona porque hay tres
 * personas mirando el mismo tablero y arrastrar una tarjeta es cómo se avisan
 * entre ellas. Aquí no hay equipo: hay una persona que da sesiones de una en
 * una, y una etiqueta que tuviera que mover ella misma se quedaría sin mover a
 * la semana — y entonces el tablero mentiría, que es peor que no tenerlo.
 *
 * Así que las etapas NO se eligen: se deducen de lo que ya se sabe de cada
 * persona —si tiene sesión apuntada, cuándo fue la última, si falta la nota, si
 * hay una factura a medias—. Nadie las mantiene y nunca están desfasadas.
 *
 * Y CADA COLUMNA CONTESTA «¿Y AHORA QUÉ HAGO CON ESTA GENTE?». Ésa fue la
 * criba: una columna que no se pueda contestar con un verbo no es una etapa, es
 * una etiqueta de estado. Por eso no hay una columna «Clientes activos» ni una
 * «Todos»: no se hace nada con ellas.
 *
 * LAS CINCO SON UN CICLO, Y SE PASA DE UNA A LA SIGUIENTE SOLO:
 *
 *     Todavía no ha venido  →  (le apuntas sesión)      →  La ves pronto
 *     La ves pronto         →  (pasa la sesión)          →  Te falta cerrar
 *     Te falta cerrar       →  (escribes la nota)        →  Toca llamar
 *     Toca llamar           →  (pasan tres meses)        →  Se te está enfriando
 *     cualquiera            →  (le apuntas sesión)       →  La ves pronto
 *
 * EL ORDEN DE PRECEDENCIA NO ES EL ORDEN DE LAS COLUMNAS, y es a propósito.
 *
 * Una persona está en una sola columna —si estuviera en dos, contar dejaría de
 * significar nada— y «te falta cerrar» gana a «la ves pronto» aunque esté más a
 * la derecha. El motivo: si viene el jueves y no apuntaste lo de la última
 * sesión, lo que hay que hacer HOY es escribir esa nota, precisamente porque
 * viene el jueves. Su tarjeta sigue diciendo «Jueves a las 18:00», así que no
 * se pierde nada; lo que se gana es que la columna de lo que se está perdiendo
 * no deja escapar a nadie.
 *
 * Este archivo no lee ni escribe nada: recibe una relación ya calculada
 * (`relacion.ts`) y devuelve en qué columna cae. Vale igual el día de Firebase.
 */

import type { Relacion } from "./relacion";
import { DIAS_FRIO } from "./relacion";

export type ClaveEtapa = "sin-estrenar" | "vienen" | "cerrar" | "llamar" | "frios";

export type Etapa = {
  k: ClaveEtapa;
  /** El nombre de la columna, dicho como se lo diría alguien a Iris. */
  titulo: string;
  /** Qué hacer con esta gente. Va debajo del título, en una línea. */
  hacer: string;
  /** Lo que dice la columna cuando está vacía. Nunca «sin datos». */
  vacio: string;
  /**
   * El color de la columna. Marca y no rellena: es la raya de arriba y el
   * rótulo, nunca el fondo de las tarjetas. Los cinco son tokens medidos para
   * pasar de 4,5:1 sobre el papel y sobre el granate.
   */
  color: string;
};

/**
 * De izquierda a derecha, el recorrido de una relación. El orden importa: se
 * lee como una línea de tiempo, no como una lista de filtros.
 */
export const ETAPAS: Etapa[] = [
  {
    k: "sin-estrenar",
    titulo: "Todavía no han venido",
    hacer: "Tienen ficha y ninguna sesión. Ponles la primera.",
    vacio: "Nadie esperando. Todo el mundo ha venido ya alguna vez.",
    color: "var(--via-transformacion-tx)",
  },
  {
    k: "vienen",
    titulo: "Los ves pronto",
    hacer: "Tienen día y hora. Léete su última nota antes de que lleguen.",
    vacio: "No tienes ninguna sesión apuntada por delante.",
    color: "var(--green)",
  },
  {
    k: "cerrar",
    titulo: "Te falta cerrar algo",
    hacer: "Una nota sin escribir o una factura a medias. Es lo que se pierde.",
    vacio: "No te queda nada colgando. Todas las sesiones tienen su nota.",
    color: "var(--red)",
  },
  {
    k: "llamar",
    titulo: "Toca llamar",
    hacer: "Vinieron hace poco y no tienen nada apuntado. Una llamada y vuelven.",
    vacio: "Todo el que ha venido hace poco tiene ya su próxima sesión.",
    color: "var(--gold)",
  },
  {
    k: "frios",
    titulo: "Se te están enfriando",
    hacer: "Hace más de tres meses que no los ves. El que no vuelve, se pierde.",
    vacio: "A nadie lo tienes olvidado.",
    color: "var(--text-4)",
  },
];

/**
 * En qué columna cae una persona. El orden de los `if` ES la precedencia
 * explicada arriba, y por eso no se puede reordenar sin cambiar el tablero.
 */
export function etapaDe(r: Relacion): ClaveEtapa {
  // Lo que se está perdiendo va primero, incluso por delante de lo que viene.
  if (r.sinApuntar || r.borradores.length) return "cerrar";
  if (r.proxima) return "vienen";
  // Quien no ha venido nunca no se ha enfriado: no ha empezado. Decir «hace
  // mucho que no la ves» de alguien a quien no has visto nunca sería mentira.
  if (r.diasSinVerse === null) return "sin-estrenar";
  return r.diasSinVerse >= DIAS_FRIO ? "frios" : "llamar";
}

/**
 * Lo que cuelga de esta persona, en dos palabras y eligiendo uno.
 *
 * Debajo de un nombre, en una tarjeta estrecha, dos marcas se leen peor que
 * ninguna. La nota va primero porque el recuerdo caduca y una factura no.
 */
export function loQueCuelga(r: Relacion): string {
  if (r.sinApuntar) return "sin apuntar";
  if (r.borradores.length) return r.borradores.length === 1 ? "factura a medias" : `${r.borradores.length} facturas a medias`;
  return "";
}
