/**
 * LAS FECHAS, EN CASTELLANO Y EN HORA DE AQUÍ
 *
 * Una cita se guarda en ISO con zona —es lo que dice el contrato de
 * `@iris/datos`— pero se escribe y se lee en hora local: Iris apunta «el jueves
 * a las seis», no un instante UTC. Todas las conversiones entre las dos cosas
 * están aquí, y en ningún otro sitio, porque es donde se cuelan los fallos que
 * mueven una sesión un día entero.
 *
 * Los nombres de los días y los meses van escritos a mano, como los meses de
 * `lib/format.ts`, y no salen de `Intl`: así el texto es el mismo en el
 * servidor, en el navegador y en cualquier equipo, sin depender de qué idiomas
 * tenga instalados.
 */

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const dosCifras = (n: number) => String(n).padStart(2, "0");

/** «2026-09-07» de una fecha, en hora local. `toISOString` no vale: ésa es UTC
 *  y a partir de las dos de la tarde en España devuelve el día siguiente. */
export function claveDia(d: Date): string {
  return `${d.getFullYear()}-${dosCifras(d.getMonth() + 1)}-${dosCifras(d.getDate())}`;
}

/** Las 00:00 y las 23:59:59 de un día, en hora local. */
export const abreDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
export const cierraDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

/** Suma días sin tocar el original. */
export const masDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/**
 * El domingo con el que acaba la semana de una fecha. La semana empieza el
 * lunes: en España el domingo es el final, no el principio, y una agenda que
 * diga lo contrario se lee mal el primer día.
 */
export function cierraSemana(d: Date): Date {
  const haciaDomingo = (7 - d.getDay()) % 7; // getDay(): 0 es domingo
  return cierraDia(masDias(d, haciaDomingo));
}

/**
 * El lunes con el que empieza la semana de una fecha, a las 00:00.
 *
 * Es el ancla de la rejilla semanal: todo lo que la rejilla dibuja se mide
 * desde aquí. Va en pareja con `cierraSemana` y con la misma regla —la semana
 * empieza el lunes— porque si las dos no coincidieran, la última columna de la
 * rejilla enseñaría un día que la cuenta de «esta semana» ya no incluye.
 */
export function abreSemana(d: Date): Date {
  const desdeLunes = (d.getDay() + 6) % 7; // lunes = 0, domingo = 6
  return abreDia(masDias(d, -desdeLunes));
}

/** Los siete días de la semana de una fecha, de lunes a domingo. */
export function semanaDe(d: Date): Date[] {
  const lunes = abreSemana(d);
  return Array.from({ length: 7 }, (_, i) => masDias(lunes, i));
}

/**
 * Suma meses cayendo siempre dentro del mes que toca.
 *
 * `setMonth` sobre un 31 de enero devuelve el 3 de marzo, y en un calendario
 * que se mueve con flechas eso significa saltarse febrero entero. Se ancla en
 * el día 1, que es lo único que existe en los doce meses.
 */
export const masMeses = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

/** «septiembre de 2026», para la cabecera del calendario del mes. */
export const mesYAno = (d: Date) => `${MESES[d.getMonth()]} de ${d.getFullYear()}`;

/** Las iniciales de los días en la cabecera del mini calendario, empezando en
 *  lunes. La X del miércoles es la de toda la vida en España. */
export const INICIALES_DIA = ["L", "M", "X", "J", "V", "S", "D"];

/** El nombre corto del día: «lun», «mar». Para la cabecera de cada columna de
 *  la rejilla, donde el nombre entero no cabe en siete columnas. */
export const diaCorto = (d: Date) => DIAS[d.getDay()].slice(0, 3);

/**
 * Los días que se pintan en la cuadrícula de un mes: el mes entero más lo que
 * haga falta de los meses vecinos para que empiece en lunes y acabe en domingo.
 *
 * Se devuelven siempre 42 (seis semanas) y no las que salgan: si la cuadrícula
 * cambiara de alto según el mes, la página daría un salto al pasar de febrero a
 * marzo y lo que hay debajo se movería de sitio.
 */
export function cuadriculaDelMes(d: Date): Date[] {
  const primero = abreSemana(new Date(d.getFullYear(), d.getMonth(), 1));
  return Array.from({ length: 42 }, (_, i) => masDias(primero, i));
}

/** Minutos desde las 00:00 de su propio día. Es la coordenada vertical de la
 *  rejilla: a qué altura empieza un bloque dentro de su columna. */
export function minutosDelDia(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** «7 de septiembre». */
export const diaYMes = (d: Date) => `${d.getDate()} de ${MESES[d.getMonth()]}`;

/** «lunes, 7 de septiembre». */
export const diaLargo = (d: Date) => `${DIAS[d.getDay()]}, ${diaYMes(d)}`;

/** «7 de septiembre de 2026», para el papel. */
export const fechaDeFactura = (iso: string) => {
  const d = deClave(iso);
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
};

/** «Hoy», «Mañana» o el día con su nombre. Es lo que Iris necesita leer para
 *  saber si algo la pilla hoy sin tener que mirar el calendario. */
export function diaRelativo(d: Date, referencia = new Date()): string {
  const k = claveDia(d);
  if (k === claveDia(referencia)) return "Hoy";
  if (k === claveDia(masDias(referencia, 1))) return "Mañana";
  return diaLargo(d).replace(/^./, (c) => c.toLocaleUpperCase("es"));
}

/**
 * LO MISMO, PERO SIN EL MES CUANDO EL MES SE DA POR SABIDO.
 *
 * «Miércoles, 9 de septiembre a las 20:00» son tres renglones en la tarjeta de
 * una columna de doscientos píxeles, y dos de esos renglones no dicen nada
 * nuevo: si estamos en septiembre, el mes sobra. Sólo se escribe cuando la
 * fecha cae en otro mes, que es justo cuando hace falta para no confundirse.
 */
export function diaRelativoCorto(d: Date, referencia = new Date()): string {
  const k = claveDia(d);
  if (k === claveDia(referencia)) return "Hoy";
  if (k === claveDia(masDias(referencia, 1))) return "Mañana";
  const base = `${DIAS[d.getDay()]} ${d.getDate()}`;
  const conMes = d.getMonth() === referencia.getMonth() ? base : `${base} de ${MESES[d.getMonth()]}`;
  return conMes.replace(/^./, (c) => c.toLocaleUpperCase("es"));
}

/** Lo más corto que sigue diciendo qué día es: «Hoy», «Mañana», «mié 9». Para
 *  el hueco de debajo de una cara, donde caben once caracteres y no más. */
export function diaMinimo(d: Date, referencia = new Date()): string {
  const k = claveDia(d);
  if (k === claveDia(referencia)) return "Hoy";
  if (k === claveDia(masDias(referencia, 1))) return "Mañana";
  return `${DIAS[d.getDay()].slice(0, 3)} ${d.getDate()}`;
}

/**
 * CUÁNTO HACE, DICHO COMO SE DICE.
 *
 * «Hace 92 días» es un dato de máquina: para saber si eso es mucho hay que
 * dividir entre treinta mentalmente. Lo que Iris necesita saber es si a alguien
 * lo vio la semana pasada o el invierno pasado, y eso se dice con la unidad que
 * corresponde. Por eso los tramos suben: días hasta la semana, semanas hasta el
 * mes, meses hasta el año.
 *
 * Se redondea, y a propósito: «hace 3 meses» es verdad tanto a los 88 días como
 * a los 95, y ninguna decisión cambia por esos siete días.
 */
export function hace(dias: number): string {
  if (dias <= 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  if (dias < 14) return "hace una semana";
  if (dias < 31) return `hace ${Math.round(dias / 7)} semanas`;
  if (dias < 60) return "hace un mes";
  if (dias < 365) return `hace ${Math.round(dias / 30)} meses`;
  if (dias < 730) return "hace más de un año";
  return "hace años";
}

/**
 * Días de calendario entre dos instantes. Se cuenta por días y no por horas
 * porque «la viste ayer» tiene que ser verdad a las nueve de la mañana igual
 * que a las once de la noche: restando milisegundos, una sesión de ayer a las
 * ocho de la tarde saldría hoy hasta pasada esa hora.
 */
export function diasEntre(desde: Date, hasta: Date): number {
  return Math.round((abreDia(hasta).getTime() - abreDia(desde).getTime()) / 86400000);
}

/** «18:30». */
export const hora = (iso: string) => {
  const d = new Date(iso);
  return `${dosCifras(d.getHours())}:${dosCifras(d.getMinutes())}`;
};

/** Un «2026-09-07» a `Date` local. `new Date("2026-09-07")` lo lee como UTC y
 *  en España se queda en el día anterior a partir de medianoche. */
export function deClave(clave: string): Date {
  const [a, m, d] = clave.split("-").map(Number);
  return new Date(a || 2000, (m || 1) - 1, d || 1);
}

/** Lo que escribe Iris —«2026-09-07» y «18:30»— convertido al instante que se
 *  guarda. Si la hora viene vacía se apunta a las nueve, que es como empieza. */
export function instante(clave: string, horaTexto: string): string {
  const d = deClave(clave);
  const [h, m] = (horaTexto || "09:00").split(":").map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

/** «1 h 30 min», que es como se dice, en vez de «90 min». */
export function duracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Redondea la hora actual a la media hora siguiente: es lo que casi siempre se
 *  quiere al apuntar algo, y ahorra teclear. */
export function proximaMediaHora(ahora = new Date()): string {
  const d = new Date(ahora);
  d.setMinutes(d.getMinutes() > 30 ? 60 : 30, 0, 0);
  return `${dosCifras(d.getHours())}:${dosCifras(d.getMinutes())}`;
}
