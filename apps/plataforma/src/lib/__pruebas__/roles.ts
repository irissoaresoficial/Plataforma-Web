/*
 * QUIÉN PUEDE TOCAR QUÉ.
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/roles.ts
 *
 * Los permisos no se pueden comprobar mirando la pantalla, y ése es justo el
 * problema: una pantalla con un permiso mal puesto se ve perfectamente normal
 * hasta el día que un alumno abre el despacho de Iris y ve la lista de
 * clientas con sus notas. No hay aviso previo, no hay nada roto a la vista, y
 * cuando se descubre ya ha pasado.
 *
 * Por eso esto está aquí y se lanza con el resto: es la única forma de que un
 * cambio en `roles.ts` no se lleve por delante una puerta sin que nadie lo vea.
 *
 * LO QUE SE COMPRUEBA, Y POR QUÉ CADA COSA:
 *
 *   1. LA REGLA DEL NEGOCIO: el estudio de Kábala es sólo de Iris. Un alumno
 *      paga un curso, no compra el método. Es la comprobación que más importa
 *      de todo este archivo.
 *   2. QUE LAS LLAVES SE ACUMULAN: alumno + miembro lleva las dos, y eso no
 *      le da ninguna tercera.
 *   3. LAS FICHAS VIEJAS, SIN CAMPO `roles`, SON ADMINISTRADORAS. Si esto se
 *      rompe, al publicar Iris se queda fuera de su propia plataforma y no
 *      queda nadie dentro capaz de volver a meterla.
 *   4. QUE UNA FICHA ROTA NO REGALE ADMINISTRACIÓN. Vieja y rota no son lo
 *      mismo: sin campo es vieja, con campo ilegible es rota, y la rota se
 *      queda sin llaves.
 *   5. QUE NADIE SE PUEDA QUITAR LA ADMINISTRACIÓN A SÍ MISMO.
 */
import { esAdmin, puede, puedeQuitarseAdmin, rolesDe, type Capacidad, type Rol } from "@/lib/roles";

type Caso = [string, boolean, boolean];
const casos: Caso[] = [];
const comprueba = (que: string, obtenido: boolean, esperado: boolean) =>
  casos.push([que, obtenido, esperado]);

const admin = { roles: ["admin"] as Rol[] };
const alumno = { roles: ["alumno"] as Rol[] };
const miembro = { roles: ["miembro"] as Rol[] };
const ambos = { roles: ["alumno", "miembro"] as Rol[] };
const creador = { roles: ["creador"] as Rol[] };
const vieja = {};
const rota = { roles: ["jefa", ""] as unknown as Rol[] };

/* ── 1. El estudio y el despacho son sólo de Iris ────────────────────── */

for (const cerrada of ["estudio", "despacho", "metricas", "gestion"] as Capacidad[]) {
  comprueba(`admin abre ${cerrada}`, puede(admin, cerrada), true);
  comprueba(`alumno NO abre ${cerrada}`, puede(alumno, cerrada), false);
  comprueba(`miembro NO abre ${cerrada}`, puede(miembro, cerrada), false);
  comprueba(`alumno+miembro NO abre ${cerrada}`, puede(ambos, cerrada), false);
  comprueba(`creador NO abre ${cerrada}`, puede(creador, cerrada), false);
}

/* ── 1b. El creador monta cursos, y sólo eso ─────────────────────────── */

comprueba("creador puede crear cursos", puede(creador, "crear"), true);
comprueba("creador entra en sus cursos", puede(creador, "cursos"), true);
comprueba("creador entra en la escuela", puede(creador, "escuela"), true);
comprueba("creador entra en comunidad", puede(creador, "comunidad"), true);
comprueba("creador NO es admin", esAdmin(creador), false);
comprueba("alumno NO puede crear cursos", puede(alumno, "crear"), false);
comprueba("miembro NO puede crear cursos", puede(miembro, "crear"), false);
comprueba("admin puede crear cursos", puede(admin, "crear"), true);

/* ── 2. Cada llave abre lo suyo, y sólo lo suyo ──────────────────────── */

comprueba("alumno ve sus cursos", puede(alumno, "cursos"), true);
comprueba("miembro NO ve cursos", puede(miembro, "cursos"), false);
comprueba("miembro entra en comunidad", puede(miembro, "comunidad"), true);
comprueba("alumno NO entra en comunidad", puede(alumno, "comunidad"), false);
comprueba("los tres entran en la escuela · alumno", puede(alumno, "escuela"), true);
comprueba("los tres entran en la escuela · miembro", puede(miembro, "escuela"), true);
comprueba("los tres entran en la escuela · admin", puede(admin, "escuela"), true);

/* ── 3. Las llaves se acumulan ───────────────────────────────────────── */

comprueba("alumno+miembro ve cursos", puede(ambos, "cursos"), true);
comprueba("alumno+miembro entra en comunidad", puede(ambos, "comunidad"), true);
comprueba("alumno+miembro NO es admin", esAdmin(ambos), false);

/* ── 4. Fichas viejas y fichas rotas ─────────────────────────────────── */

comprueba("ficha vieja (sin roles) es admin", esAdmin(vieja), true);
comprueba("ficha vieja abre el estudio", puede(vieja, "estudio"), true);
comprueba("roles vacío cuenta como vieja", esAdmin({ roles: [] }), true);
comprueba("roles null cuenta como vieja", esAdmin({ roles: null }), true);
comprueba("ficha rota NO es admin", esAdmin(rota), false);
comprueba("ficha rota no abre nada", puede(rota, "escuela"), false);
comprueba("sin ficha no abre nada", puede(null, "escuela"), false);
comprueba("sin ficha no es admin", esAdmin(null), false);

/* Lo que se descarta de una ficha a medias no se lleva lo bueno por delante. */
const mezcla = { roles: ["alumno", "pirata"] as unknown as Rol[] };
comprueba("se queda el rol válido de una mezcla", puede(mezcla, "cursos"), true);
comprueba("y el inventado no abre nada", puede(mezcla, "despacho"), false);
comprueba("rolesDe limpia lo que no existe", rolesDe(mezcla).join() === "alumno", true);

/* ── 5. Nadie se deja a sí mismo fuera ───────────────────────────────── */

comprueba("Iris NO se quita a sí misma la administración", puedeQuitarseAdmin("iris", "iris"), false);
comprueba("Iris sí se la quita a otra persona", puedeQuitarseAdmin("iris", "ana"), true);

/* ── El veredicto ────────────────────────────────────────────────────── */

const fallos = casos.filter(([, o, e]) => o !== e);

console.log("\nPERMISOS DE LA ESCUELA\n");
for (const [que, obtenido, esperado] of casos) {
  const bien = obtenido === esperado;
  console.log(`  ${bien ? "ok  " : "FALLA"} ${que.padEnd(46)} ${bien ? "" : `dio ${obtenido}, esperaba ${esperado}`}`);
}
console.log(`\n${casos.length - fallos.length} de ${casos.length} coinciden\n`);

process.exitCode = fallos.length ? 1 : 0;
