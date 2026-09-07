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
