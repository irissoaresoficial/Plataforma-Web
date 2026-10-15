/*
 * LO QUE SE ESCRIBE EN EL FORMULARIO.
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/entrada.ts
 *
 * Dos fallos que compartían la misma forma y por eso van juntos: los dos
 * dejaban salir un estudio EQUIVOCADO CON ASPECTO DE ESTAR BIEN. Ninguno de
 * los dos se ve mirando la pantalla, y ésa es exactamente la razón de que
 * hagan falta estas comprobaciones.
 *
 *   1. LAS LETRAS QUE NO ESTÁN EN EL MANUAL. La tabla de valores tiene las
 *      letras que tiene. Al llegar «Gonçalves», la ce con cedilla no tenía
 *      valor y el motor se la comía: el nombre valía menos y nadie lo sabía.
 *      Aquí no se comprueba que esa letra sume —no suma, y está bien que no
 *      sume mientras no esté en el manual— sino que el motor AVISE.
 *
 *   2. LAS FECHAS QUE NO EXISTEN. El 31 de febrero pasaba los tres controles
 *      viejos —día entre 1 y 31, mes entre 1 y 12, año de cuatro cifras— y
 *      producía un estudio completo con los números de otro día.
 *
 * Lo que NO se comprueba aquí, a propósito: cuánto vale cada letra. De eso se
 * encargan las pruebas de los estudios, contra el material de Iris.
 */
import { analizaNombre } from "@/lib/engine";
import { valida } from "@/lib/app-context";

type Caso = [string, boolean, boolean];
const casos: Caso[] = [];
const comprueba = (que: string, obtenido: boolean, esperado: boolean) =>
  casos.push([que, obtenido, esperado]);

/* ── 1. Las letras que el manual no recoge ───────────────────────────── */

const avisa = (nombre: string) => analizaNombre(nombre).descartadas.length > 0;

comprueba("avisa de la cedilla de Gonçalves", avisa("Joao Gonçalves"), true);
comprueba("avisa de la a con tilde de João", avisa("João Silva"), true);
comprueba("avisa de la o abierta de Mònica", avisa("Mònica Jordà"), true);
comprueba("avisa de Conceição", avisa("Conceição Santos"), true);
comprueba("avisa del circunflejo de Antônio", avisa("Antônio Câmara"), true);

/* Y lo contrario, que importa igual: un aviso que salta siempre es un aviso
   que se aprende a ignorar en dos días. */
comprueba("NO avisa de un nombre normal", avisa("Maria Iris Soares Campos"), false);
comprueba("NO avisa de las tildes del castellano", avisa("José Martínez Núñez"), false);
comprueba("NO avisa de la diéresis", avisa("Begoña Güell"), false);
comprueba("NO avisa del guión de Anne-Marie", avisa("Anne-Marie Dupont"), false);
comprueba("NO avisa del apóstrofo de O'Connor", avisa("O'Connor Murphy"), false);
comprueba("NO avisa de una inicial con punto", avisa("Ana M. Ruiz"), false);

/* Dice QUÉ letra es, no sólo que hay algo raro: sin eso el aviso no sirve
   para arreglarlo. */
const g = analizaNombre("Gonçalves").descartadas;
comprueba("el aviso nombra la letra concreta", g.length === 1 && g[0] === "Ç", true);

/* Una letra repetida se nombra una vez, no seis. */
const repetida = analizaNombre("Çaça Çeçe").descartadas;
comprueba("una letra repetida se nombra una sola vez", repetida.length === 1, true);

/* El nombre se sigue leyendo: avisar no es romper. */
const roto = analizaNombre("Joao Gonçalves");
comprueba("el resto del nombre se sigue leyendo", roto.total > 0, true);

/* ── 2. Las fechas que no existen ────────────────────────────────────── */

const base = { tipo: "persona" as const, nombre: "Ana", ap1: "Ruiz", ap2: "", genero: "f" };
const fecha = (dia: string, mes: string, anio: string) =>
  valida({ ...base, dia, mes, anio } as Parameters<typeof valida>[0]);

comprueba("31 de febrero NO pasa", fecha("31", "2", "1980") !== null, true);
comprueba("30 de febrero NO pasa", fecha("30", "2", "1980") !== null, true);
comprueba("31 de abril NO pasa", fecha("31", "4", "1990") !== null, true);
comprueba("31 de junio NO pasa", fecha("31", "6", "1990") !== null, true);
comprueba("31 de septiembre NO pasa", fecha("31", "9", "1990") !== null, true);
comprueba("31 de noviembre NO pasa", fecha("31", "11", "1990") !== null, true);
comprueba("29 de febrero de 1981 NO pasa", fecha("29", "2", "1981") !== null, true);

/* Y las que sí existen tienen que seguir pasando, incluidas las de borde. */
comprueba("29 de febrero de 1980 SÍ pasa (bisiesto)", fecha("29", "2", "1980") === null, true);
comprueba("29 de febrero de 2000 SÍ pasa (bisiesto de siglo)", fecha("29", "2", "2000") === null, true);
comprueba("28 de febrero de 1981 SÍ pasa", fecha("28", "2", "1981") === null, true);
comprueba("31 de enero SÍ pasa", fecha("31", "1", "1990") === null, true);
comprueba("30 de abril SÍ pasa", fecha("30", "4", "1990") === null, true);
comprueba("31 de diciembre SÍ pasa", fecha("31", "12", "2024") === null, true);
comprueba("1 de enero de 1900 SÍ pasa", fecha("1", "1", "1900") === null, true);

/* 1900 no es bisiesto: lo divide 100 y no lo divide 400. Es el caso que se
   escapa en casi todas las comprobaciones escritas a mano. */
comprueba("29 de febrero de 1900 NO pasa", fecha("29", "2", "1900") !== null, true);

/* El aviso dice la fecha, no «fecha inválida». */
const mensaje = fecha("31", "2", "1980") || "";
comprueba("el aviso nombra el día y el mes", mensaje.includes("31 de febrero"), true);

/* ── El veredicto ────────────────────────────────────────────────────── */

const fallos = casos.filter(([, o, e]) => o !== e);

console.log("\nLO QUE SE ESCRIBE EN EL FORMULARIO\n");
for (const [que, obtenido, esperado] of casos) {
  const bien = obtenido === esperado;
  console.log(`  ${bien ? "ok  " : "FALLA"} ${que.padEnd(48)} ${bien ? "" : `dio ${obtenido}, esperaba ${esperado}`}`);
}
console.log(`\n${casos.length - fallos.length} de ${casos.length} coinciden\n`);

process.exitCode = fallos.length ? 1 : 0;
