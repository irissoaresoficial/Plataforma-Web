/*
 * LA RACHA Y LAS MEDALLAS.
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/trofeos.ts
 *
 * La racha es aritmética de fechas, que es de lo que más falla en silencio que
 * hay: nunca da error, da un número. Y un número equivocado aquí es de los que
 * más duelen, porque la racha es justo lo que engancha — decirle a alguien que
 * lleva 3 días cuando lleva 12 es quitarle lo único que había ganado.
 *
 * Los casos que se comprueban son los que rompen una cuenta de días escrita a
 * mano: el cambio de mes, el salto de año, el hueco en medio, y el de hoy
 * todavía sin entrar — que es el más frecuente de todos, porque pasa cada
 * mañana a todo el mundo.
 */
import { marcador, medallas, racha } from "@/lib/escuela/trofeos";
import type { Avance, Curso } from "@/lib/escuela/tipos";

type Caso = [string, boolean, boolean];
const casos: Caso[] = [];
const comprueba = (que: string, obtenido: boolean, esperado: boolean) =>
  casos.push([que, obtenido, esperado]);

/** El día de hace n días, en AAAA-MM-DD. */
const hace = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

/* ── La racha ────────────────────────────────────────────────────────── */

comprueba("sin días, racha cero", racha([]) === 0, true);
comprueba("sólo hoy, racha uno", racha([hace(0)]) === 1, true);
comprueba("hoy y ayer, racha dos", racha([hace(0), hace(1)]) === 2, true);
comprueba("cinco seguidos", racha([0, 1, 2, 3, 4].map(hace)) === 5, true);

/*
 * EL CASO DE CADA MAÑANA: todavía no se ha entrado hoy.
 *
 * Si la racha se contara sólo desde hoy, cualquiera que abra la plataforma
 * antes de que se registre su visita vería un CERO después de doce días
 * seguidos. Ese cero es exactamente el desánimo que esta pantalla no puede
 * producir, así que cuando hoy falta se cuenta desde ayer.
 */
comprueba("hoy aún no, pero ayer sí: la racha sigue viva", racha([1, 2, 3].map(hace)) === 3, true);
comprueba("ni hoy ni ayer: la racha se perdió", racha([2, 3, 4].map(hace)) === 0, true);

/* Un hueco corta, y corta en el hueco — no antes ni después. */
comprueba("un hueco corta la cuenta", racha([0, 1, 3, 4, 5].map(hace)) === 2, true);
comprueba("lo de después del hueco no se suma", racha([0, 1, 3, 4, 5, 6, 7].map(hace)) === 2, true);

/* Los días repetidos no cuentan dos veces: la lista puede traerlos si algo se
   escribió dos veces, y la racha no puede inflarse por eso. */
comprueba("un día repetido no cuenta dos veces", racha([hace(0), hace(0), hace(1)]) === 2, true);

/* Desordenados cuentan igual: no se guarda ningún orden y no hay que
   depender de que venga ordenado. */
comprueba("el orden de la lista da igual", racha([3, 0, 2, 1].map(hace)) === 4, true);

/*
 * EL CAMBIO DE MES Y EL DE AÑO.
 *
 * Es donde revienta una cuenta hecha restando números a mano: del 1 de marzo
 * hacia atrás está el 28 de febrero, o el 29, según el año. Aquí se usa el
 * calendario de verdad, así que esto pasa — pero si alguien lo reescribe un
 * día con aritmética de enteros, esta prueba se pone roja.
 */
comprueba("cuarenta días seguidos cruzan meses", racha(Array.from({ length: 40 }, (_, i) => hace(i))) === 40, true);
comprueba("cuatrocientos días cruzan el año", racha(Array.from({ length: 400 }, (_, i) => hace(i))) === 400, true);

/* ── El marcador ─────────────────────────────────────────────────────── */

const curso = (id: string, lecciones: string[]): Curso => ({
  id,
  titulo: id,
  descripcion: "",
  portada: "",
  publicado: true,
  modulos: [{ id: "m", titulo: "m", lecciones: lecciones.map((l) => ({ id: l, titulo: l, video: "", texto: "", minutos: 0 })) }],
  creado: "",
  tocado: "",
});
const av = (cursoId: string, hechas: string[]): Avance => ({
  id: `u__${cursoId}`,
  uid: "u",
  cursoId,
  hechas,
  tocado: "",
});

const cursos = [curso("a", ["a1", "a2", "a3"]), curso("b", ["b1", "b2"])];
const avances = { a: av("a", ["a1", "a2"]), b: av("b", ["b1", "b2"]) };
const m = marcador(cursos, avances, [0, 1].map(hace));

comprueba("cuenta las lecciones de todos los cursos", m.lecciones === 4, true);
comprueba("cuenta los cursos empezados", m.cursosEmpezados === 2, true);
comprueba("cuenta sólo los terminados del todo", m.cursosTerminados === 1, true);
comprueba("el marcador trae la racha", m.racha === 2, true);

/* Un curso sin avance no cuenta como empezado, y un curso vacío no cuenta como
   terminado — si contara, crear un curso en blanco regalaría una medalla. */
const vacio = marcador([curso("c", [])], {}, []);
comprueba("un curso sin lecciones no está terminado", vacio.cursosTerminados === 0, true);
comprueba("un curso sin tocar no está empezado", vacio.cursosEmpezados === 0, true);

/* ── Las medallas ────────────────────────────────────────────────────── */

const abiertas = (ms: ReturnType<typeof medallas>) => ms.filter((x) => x.abierta).map((x) => x.id);

const ninguna = medallas({ lecciones: 0, cursosEmpezados: 0, cursosTerminados: 0, racha: 0 }, 0);
comprueba("quien no ha hecho nada no tiene ninguna", abiertas(ninguna).length === 0, true);
comprueba("pero LAS VE TODAS, para saber qué falta", ninguna.length === 6, true);
comprueba("y cada cerrada dice cómo se abre", ninguna.every((x) => x.como.length > 10), true);

const algo = medallas({ lecciones: 5, cursosEmpezados: 1, cursosTerminados: 0, racha: 7 }, 0);
comprueba("cinco lecciones abren dos medallas", abiertas(algo).includes("primera") && abiertas(algo).includes("cinco"), true);
comprueba("siete días abren la racha de siete", abiertas(algo).includes("racha7"), true);
comprueba("pero no la de treinta", abiertas(algo).includes("racha30"), false);
comprueba("ni la de curso terminado", abiertas(algo).includes("curso"), false);

const habla = medallas({ lecciones: 0, cursosEmpezados: 0, cursosTerminados: 0, racha: 0 }, 1);
comprueba("escribir en la comunidad abre la suya", abiertas(habla).join() === "hablas", true);

/* ── El veredicto ────────────────────────────────────────────────────── */

const fallos = casos.filter(([, o, e]) => o !== e);
console.log("\nLA RACHA Y LAS MEDALLAS\n");
for (const [que, obtenido, esperado] of casos) {
  const bien = obtenido === esperado;
  console.log(`  ${bien ? "ok  " : "FALLA"} ${que.padEnd(50)} ${bien ? "" : `dio ${obtenido}, esperaba ${esperado}`}`);
}
console.log(`\n${casos.length - fallos.length} de ${casos.length} coinciden\n`);
process.exitCode = fallos.length ? 1 : 0;
