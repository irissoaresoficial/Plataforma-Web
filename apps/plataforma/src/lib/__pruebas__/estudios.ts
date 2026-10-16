/*
 * FUNDIR LO DEL NAVEGADOR CON LO DE LA NUBE.
 *
 *   npx tsx --tsconfig tsconfig.json src/lib/__pruebas__/estudios.ts
 *
 * Esta función decide qué versión de un estudio sobrevive cuando hay dos, y
 * ese tipo de fallo no se ve: no da error, da un estudio con el texto de
 * antes. Iris corrige un párrafo en el ordenador de casa, abre la plataforma
 * en la consulta, y el párrafo ha vuelto a como estaba. Nadie sabría por qué.
 *
 * Lo que se comprueba es lo que de verdad puede salir mal:
 *
 *   · Que nunca desaparezca un estudio por fundir. Da igual en qué lado esté.
 *   · Que gane el más reciente, y que uno sin fecha pierda contra uno con
 *     fecha — porque sin fecha significa «de antes de que hubiera fechas».
 *   · Que las correcciones se junten campo a campo. Corregir el bloque del
 *     alma en un sitio y el de los ciclos en otro tiene que dejar los dos.
 *   · Que la mudanza inicial salga entera: nube vacía, todo a subir.
 */
import { funde, type EstudioGuardado } from "@/lib/estudios";
import type { Edits, HistItem } from "@/lib/storage";

type Caso = [string, boolean, boolean];
const casos: Caso[] = [];
const comprueba = (que: string, obtenido: boolean, esperado = true) => casos.push([que, obtenido, esperado]);

/** Un estudio de mentira, con lo justo para que la función trabaje. */
const estudio = (id: string, tocado?: string, nombre = id): HistItem => ({
  id,
  nombre,
  fecha: "1/1/1990",
  corazon: 7,
  ...(tocado ? { tocado } : {}),
  f: { nombre, ap1: "", ap2: "", dia: "1", mes: "1", anio: "1990" },
});

const guardado = (h: HistItem, correcciones?: Record<string, string>): EstudioGuardado => ({
  ...h,
  correcciones: correcciones ?? {},
});

/* ── Nada se pierde ──────────────────────────────────────────────────── */

{
  const r = funde([estudio("A")], {}, [guardado(estudio("B"))]);
  comprueba("uno aquí y otro arriba dan dos", r.estudios.length === 2);
  comprueba("el de aquí sigue estando", r.estudios.some((h) => h.id === "A"));
  comprueba("el de arriba también", r.estudios.some((h) => h.id === "B"));
  comprueba("y el que falta arriba es el de aquí", r.faltanArriba.map((h) => h.id).join() === "A");
}

/* ── LA MUDANZA. Nube vacía: suben todos ─────────────────────────────── */

{
  const mios = [estudio("A"), estudio("B"), estudio("C")];
  const r = funde(mios, {}, []);
  comprueba("con la nube vacía no se pierde ninguno", r.estudios.length === 3);
  comprueba("y suben los tres", r.faltanArriba.length === 3);
}

/* ── Navegador vacío: bajan todos ────────────────────────────────────── */

{
  const r = funde([], {}, [guardado(estudio("A")), guardado(estudio("B"))]);
  comprueba("en un ordenador nuevo bajan los dos", r.estudios.length === 2);
  comprueba("y no hay nada que subir", r.faltanArriba.length === 0);
}

/* ── Quién gana cuando está en los dos ───────────────────────────────── */

{
  const aqui = estudio("A", "2026-10-10T10:00:00.000Z", "VIEJO");
  const arriba = guardado(estudio("A", "2026-10-15T10:00:00.000Z", "NUEVO"));
  const r = funde([aqui], {}, [arriba]);
  comprueba("no se duplica", r.estudios.length === 1);
  comprueba("gana el de la nube, que es más reciente", r.estudios[0].nombre === "NUEVO");
}

{
  const aqui = estudio("A", "2026-10-15T10:00:00.000Z", "NUEVO");
  const arriba = guardado(estudio("A", "2026-10-10T10:00:00.000Z", "VIEJO"));
  const r = funde([aqui], {}, [arriba]);
  comprueba("y gana el de aquí cuando el reciente es éste", r.estudios[0].nombre === "NUEVO");
}

/*
 * EL CASO DE LA MUDANZA, QUE ES EL QUE DE VERDAD IMPORTA.
 *
 * Los estudios que Iris ya tiene en su navegador no tienen fecha: se
 * guardaron antes de que existiera el campo. Si uno de ésos se comparara de
 * igual a igual contra el que subió desde otro ordenador, podría machacarlo.
 * Sin fecha se considera lo más viejo que hay.
 */
{
  const sinFecha = estudio("A", undefined, "SIN FECHA");
  const conFecha = guardado(estudio("A", "2026-10-15T10:00:00.000Z", "CON FECHA"));
  comprueba("uno sin fecha pierde contra uno con fecha", funde([sinFecha], {}, [conFecha]).estudios[0].nombre === "CON FECHA");
  comprueba("y da igual de qué lado venga cada uno", funde([estudio("A", "2026-10-15T10:00:00.000Z", "CON FECHA")], {}, [guardado(estudio("A", undefined, "SIN FECHA"))]).estudios[0].nombre === "CON FECHA");
}

/* ── El orden: lo último trabajado, arriba ───────────────────────────── */

{
  const r = funde(
    [estudio("VIEJO", "2026-01-01T00:00:00.000Z"), estudio("NUEVO", "2026-10-15T00:00:00.000Z")],
    {},
    []
  );
  comprueba("el más reciente sale primero", r.estudios[0].id === "NUEVO");
  comprueba("y el que no tiene fecha cae al final", funde([estudio("SIN"), estudio("CON", "2026-01-01T00:00:00.000Z")], {}, []).estudios[1].id === "SIN");
}

/* ── Las correcciones ────────────────────────────────────────────────── */

{
  /* Dos bloques distintos, en dos sitios distintos. Tienen que quedar los dos:
     esto es Iris corrigiendo el alma en casa y los ciclos en la consulta. */
  const aquiEdits: Edits = { A: { alma: "lo que escribí en casa" } };
  const arriba = guardado(estudio("A", "2026-10-15T00:00:00.000Z"), { ciclos: "lo que escribí en la consulta" });
  const r = funde([estudio("A", "2026-10-10T00:00:00.000Z")], aquiEdits, [arriba]);
  comprueba("se quedan las correcciones de los dos sitios", Object.keys(r.correcciones.A ?? {}).sort().join() === "alma,ciclos");
  comprueba("la de aquí, intacta", r.correcciones.A?.alma === "lo que escribí en casa");
  comprueba("la de arriba, intacta", r.correcciones.A?.ciclos === "lo que escribí en la consulta");
}

{
  /* El MISMO bloque corregido en los dos sitios. Manda el estudio más
     reciente, igual que manda para la ficha. */
  const aquiEdits: Edits = { A: { alma: "la de aquí" } };
  const arriba = guardado(estudio("A", "2026-10-15T00:00:00.000Z"), { alma: "la de arriba" });
  const r = funde([estudio("A", "2026-10-10T00:00:00.000Z")], aquiEdits, [arriba]);
  comprueba("con el mismo bloque gana el estudio más reciente", r.correcciones.A?.alma === "la de arriba");

  const alReves = funde([estudio("A", "2026-10-20T00:00:00.000Z")], aquiEdits, [arriba]);
  comprueba("y al revés, gana el de aquí", alReves.correcciones.A?.alma === "la de aquí");
}

{
  /* Una corrección de un estudio que sólo está aquí no se puede perder por el
     camino de fundir. */
  const r = funde([estudio("A")], { A: { alma: "mía" } }, [guardado(estudio("B"))]);
  comprueba("la corrección de un estudio que sólo está aquí sobrevive", r.correcciones.A?.alma === "mía");
}

/* ── Dos listas vacías ───────────────────────────────────────────────── */

{
  const r = funde([], {}, []);
  comprueba("sin nada en ningún lado no revienta", r.estudios.length === 0 && r.faltanArriba.length === 0);
}

/* ── El veredicto ────────────────────────────────────────────────────── */

const fallos = casos.filter(([, o, e]) => o !== e);
console.log("\nFUNDIR LOS ESTUDIOS\n");
for (const [que, obtenido, esperado] of casos) {
  const bien = obtenido === esperado;
  console.log(`  ${bien ? "ok  " : "FALLA"} ${que.padEnd(58)} ${bien ? "" : `dio ${obtenido}, esperaba ${esperado}`}`);
}
console.log(`\n${casos.length - fallos.length} de ${casos.length} coinciden\n`);
process.exitCode = fallos.length ? 1 : 0;
