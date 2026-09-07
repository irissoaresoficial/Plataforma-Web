/**
 * DÓNDE CAE CADA BLOQUE EN LA REJILLA DE LA SEMANA
 *
 * La rejilla coloca cada sesión a su hora y con la altura que le toca según lo
 * que dure. Eso es una regla de tres y no necesita un archivo. Lo que sí lo
 * necesita es EL SOLAPE: dos sesiones a la misma hora del mismo día.
 *
 * Pasa de verdad —una sesión se alarga, se apunta otra encima, o hay una
 * videollamada y una presencial a la vez— y si no se resuelve, el bloque de
 * arriba tapa el de abajo y la agenda esconde justo lo que hay que ver. Peor
 * aún: lo esconde sin decirlo, así que se descubre el día que llega la persona.
 *
 * La cuenta se hace aquí, aparte de la pantalla, porque es geometría pura: no
 * sabe de React, ni de colores, ni de citas. Recibe tramos con principio y fin
 * en minutos y devuelve en qué carril va cada uno y cuántos carriles hay que
 * repartir. Se puede leer y comprobar sin abrir un navegador.
 *
 * CÓMO SE REPARTE, en dos pasos:
 *
 *  1. Se agrupan los tramos que se tocan entre sí, encadenando: si A pisa a B y
 *     B pisa a C, los tres van al mismo grupo aunque A y C no se toquen. Si no
 *     se encadenara, A y C se pintarían los dos en el primer carril y B, en el
 *     segundo, se solaparía con los dos.
 *  2. Dentro del grupo, cada tramo entra en el primer carril donde quepa. Todos
 *     los del grupo se reparten el ancho a partes iguales, así que las columnas
 *     quedan alineadas y no bailan de anchura de una hora a otra.
 */

/** Un tramo colocado: en qué carril va y entre cuántos se reparte el ancho. */
export type Colocado<T> = {
  dato: T;
  /** Minutos desde las 00:00 de su día. */
  desde: number;
  hasta: number;
  /** Carril, de 0 en adelante y de izquierda a derecha. */
  carril: number;
  /** Cuántos carriles tiene el grupo al que pertenece. Nunca 0. */
  carriles: number;
};

/**
 * Reparte una lista de tramos en carriles sin que dos que se pisan compartan
 * carril. Entra sin ordenar y sale ordenada por hora de principio.
 *
 * `minimo` es lo que ocupa un tramo aunque dure menos: dos sesiones de quince
 * minutos seguidas no se solapan de verdad, pero pintadas a su altura real son
 * dos rayas de doce píxeles en las que no cabe un nombre. Se les da un alto
 * mínimo para pintarlas y por eso también se cuentan como solapadas al
 * repartir: si no, se pintarían encima una de otra.
 */
export function reparteCarriles<T>(
  items: T[],
  desdeDe: (x: T) => number,
  duracionDe: (x: T) => number,
  minimo = 0
): Array<Colocado<T>> {
  const tramos = items
    .map((dato) => {
      const desde = desdeDe(dato);
      return { dato, desde, hasta: desde + Math.max(duracionDe(dato), minimo) };
    })
    .sort((a, b) => a.desde - b.desde || a.hasta - b.hasta);

  const salida: Array<Colocado<T>> = [];
  let grupo: Array<Colocado<T>> = [];
  // Hasta dónde llega lo más largo del grupo abierto. Un tramo que empiece
  // después de esto ya no toca a NINGUNO de los del grupo, así que el grupo se
  // cierra: es lo que encadena A-B-C sin comparar todos contra todos.
  let finDelGrupo = -1;
  /** Cuándo acaba lo último puesto en cada carril del grupo abierto. */
  let carriles: number[] = [];

  const cierra = () => {
    const cuantos = Math.max(1, carriles.length);
    grupo.forEach((c) => (c.carriles = cuantos));
    salida.push(...grupo);
    grupo = [];
    carriles = [];
    finDelGrupo = -1;
  };

  tramos.forEach(({ dato, desde, hasta }) => {
    if (grupo.length && desde >= finDelGrupo) cierra();
    // El primer carril libre. Buscar el primero y no el más corto es lo que
    // mantiene los bloques pegados a la izquierda: con dos sesiones seguidas y
    // una tercera encima, la tercera no se va a un carril de más.
    let carril = carriles.findIndex((fin) => fin <= desde);
    if (carril === -1) carril = carriles.length;
    carriles[carril] = hasta;
    finDelGrupo = Math.max(finDelGrupo, hasta);
    grupo.push({ dato, desde, hasta, carril, carriles: 1 });
  });

  if (grupo.length) cierra();
  return salida;
}

/**
 * DE QUÉ HORA A QUÉ HORA SE PINTA LA REJILLA.
 *
 * Un día tiene veinticuatro horas y Iris trabaja en ocho. Pintar las
 * veinticuatro obligaría a bajar media pantalla para llegar a la primera
 * sesión, todos los días. Se pinta la jornada normal —de nueve a nueve— y se
 * estira sólo si hay algo fuera: una sesión a las siete y media de la mañana
 * tiene que verse, no quedarse cortada por arriba.
 *
 * Se devuelven horas enteras porque la rejilla dibuja una línea por hora; el
 * bloque de las 8:15 cae dentro de la franja de las 8.
 */
export const HORA_ABRE = 9;
export const HORA_CIERRA = 21;

export function franjaDeHoras(minutosDeCadaTramo: Array<{ desde: number; hasta: number }>): { abre: number; cierra: number } {
  let abre = HORA_ABRE;
  let cierra = HORA_CIERRA;
  minutosDeCadaTramo.forEach(({ desde, hasta }) => {
    abre = Math.min(abre, Math.floor(desde / 60));
    // Lo que acaba a las 21:30 necesita que se pinte la franja de las 21, así
    // que el cierre es la hora siguiente al final, redondeada hacia arriba.
    cierra = Math.max(cierra, Math.ceil(hasta / 60));
  });
  return { abre: Math.max(0, abre), cierra: Math.min(24, Math.max(cierra, abre + 1)) };
}
