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
 *   1. LAS LETRAS CON ADORNO. La tabla de valores tiene las letras que tiene.
 *      Al llegar «Gonçalves», la ce con cedilla no estaba en la tabla y el
 *      motor se la comía: el nombre valía menos y nadie lo sabía.
 *
 *      La regla, dicha por Gerson: esa letra ES una ce. Así que no se avisa de
 *      ella, se le quita el adorno y se lee como lo que es. Lo que se
 *      comprueba aquí es justo eso: que la letra LLEGA a la cuenta.
 *
 *      Esto no inventa ningún valor —no se le pone número a una letra que el
 *      manual no tiene, se reconoce qué letra del manual hay escrita— y por
 *      eso vale también para la a de «João» o la o de «Antônio».
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

/* ── 1. Las letras con adorno se leen, no se tiran ───────────────────── */

const lee = (nombre: string) => analizaNombre(nombre).texto;
const avisa = (nombre: string) => analizaNombre(nombre).descartadas.length > 0;

/* La comprobación que más importa del archivo: la letra llega a la cuenta.
   Si esto falla, el nombre vale menos de lo que vale y el estudio sale mal
   sin que nada en la pantalla lo delate. */
comprueba("la cedilla de Gonçalves se lee como C", lee("Joao Gonçalves") === "JOAO GONCALVES", true);
comprueba("la a de João se lee como A", lee("João Silva") === "JOAO SILVA", true);
comprueba("la o abierta de Mònica se lee como O", lee("Mònica Jordà") === "MONICA JORDA", true);
comprueba("Conceição se lee entera", lee("Conceição Santos") === "CONCEICAO SANTOS", true);
comprueba("el circunflejo de Antônio se lee como O", lee("Antônio Câmara") === "ANTONIO CAMARA", true);

/* Y ninguna de ellas avisa, porque no hay nada de lo que avisar. Un aviso que
   salta en todos los apellidos portugueses se aprende a ignorar en dos días, y
   entonces no sirve para el caso en que sí importa. */
comprueba("Gonçalves NO avisa", avisa("Joao Gonçalves"), false);
comprueba("João NO avisa", avisa("João Silva"), false);
comprueba("Conceição NO avisa", avisa("Conceição Santos"), false);
comprueba("NO avisa de un nombre normal", avisa("Maria Iris Soares Campos"), false);
comprueba("NO avisa de las tildes del castellano", avisa("José Martínez Núñez"), false);
comprueba("NO avisa de la diéresis", avisa("Begoña Güell"), false);
comprueba("NO avisa del guión de Anne-Marie", avisa("Anne-Marie Dupont"), false);
comprueba("NO avisa del apóstrofo de O'Connor", avisa("O'Connor Murphy"), false);
comprueba("NO avisa de una inicial con punto", avisa("Ana M. Ruiz"), false);

/* Las que la tabla SÍ recoge entran enteras y siguen valiendo lo suyo: la Ñ no
   se convierte en N por el camino. Esto no es un detalle: la Ñ vale 14 y la N
   vale 5, así que confundirlas cambia la cuenta. */
comprueba("la Ñ sobrevive entera", lee("Núñez") === "NÚÑEZ", true);
comprueba("la tilde del castellano sobrevive", lee("José") === "JOSÉ", true);

/* Quitar el adorno no cambia una cuenta que ya salía bien: todas las variantes
   que la tabla recoge valen lo mismo que su letra base. Se comprueba con la
   que sí está en los dos sitios. */
const conTilde = analizaNombre("MARÍA").total;
const sinTilde = analizaNombre("MARIA").total;
comprueba("la Í acentuada vale lo mismo que la I", conTilde === sinTilde, true);

/* LO QUE NO TIENE LETRA DEBAJO SÍ SE AVISA. Un carácter de otro alfabeto o un
   emoji no se puede convertir en nada, y ahí sigue haciendo falta decirlo en
   vez de comérselo callando. Es el único caso que queda, y por eso ahora el
   aviso significa algo. */
comprueba("avisa de un alfabeto que no es el nuestro", avisa("Ана Петрова"), true);
comprueba("avisa del griego", avisa("Γιώργος"), true);
comprueba("avisa de un emoji", avisa("Ana 🌙 Ruiz"), true);

/* Dice QUÉ carácter es, no sólo que hay algo raro: sin eso el aviso no sirve
   para arreglarlo. */
const emoji = analizaNombre("Ana 🌙 Ruiz").descartadas;
comprueba("el aviso nombra el carácter concreto", emoji.length === 1 && emoji[0] === "🌙", true);

/* Repetido se nombra una vez, no seis. */
const repetido = analizaNombre("Ana 🌙🌙 Ruiz 🌙").descartadas;
comprueba("un carácter repetido se nombra una sola vez", repetido.length === 1, true);

/* El nombre se sigue leyendo: avisar no es romper. */
const roto = analizaNombre("Ana 🌙 Ruiz");
comprueba("el resto del nombre se sigue leyendo", roto.total > 0, true);
comprueba("y el emoji no se cuela en el texto", roto.texto === "ANA RUIZ", true);

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
