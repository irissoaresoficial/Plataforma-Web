/**
 * ============================================================================
 * LOS TROFEOS: LO QUE SE CELEBRA Y LO QUE NO
 * ============================================================================
 *
 * TODO SE CALCULA, NADA SE GUARDA APARTE, y ésa es la decisión que sostiene el
 * resto del archivo.
 *
 * Lo normal sería llevar una tabla de medallas ganadas y de puntos. Y traería
 * el problema de siempre con los datos duplicados: dos verdades sobre lo mismo
 * que acaban discrepando. Se borra una lección, se cambia una regla, falla una
 * escritura — y la tabla dice que tienes la medalla de «curso terminado» de un
 * curso que ya no existe. Ahí no hay forma de saber cuál de las dos miente.
 *
 * Aquí la única verdad son las lecciones terminadas y los días que se ha
 * entrado. Las medallas son una PREGUNTA sobre esos datos, no un registro. Si
 * Iris borra medio curso, el avance se recalcula y la medalla se ajusta sola.
 *
 * Lo que cuesta: no se puede saber CUÁNDO se ganó una medalla, porque no se
 * apuntó. Si algún día hay que celebrar un aniversario, habrá que guardarlo.
 * Hoy no hace falta y no se guarda.
 *
 * LAS TRES REGLAS DE QUÉ MERECE UNA MEDALLA
 * ---------------------------------------------------------------------------
 *
 *   1. SE CELEBRA LO QUE CUESTA, no lo que pasa solo. «Has entrado» no es un
 *      logro. Si se celebra todo, no se celebra nada, y además se nota el
 *      truco — que es peor que no celebrar.
 *
 *   2. SE ENSEÑA LO QUE FALTA, no sólo lo conseguido. Una medalla cerrada con
 *      su nombre y lo que hay que hacer tira más que diez abiertas: lo
 *      conseguido es pasado y lo que falta es lo que mueve.
 *
 *   3. LA RACHA SE CUIDA, NO SE CASTIGA. Los días seguidos son lo que más
 *      engancha y lo que más daño hace: perder una racha de cuarenta por un
 *      día malo hace que mucha gente no vuelva. Aquí se enseña sin cuenta
 *      atrás, sin amenaza y sin avisos de que está a punto de perderse.
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { nube } from "@/lib/firebase";
import { progreso, totalLecciones, type Avance, type Curso } from "./tipos";

/** Lo que alguien lleva hecho, resumido. */
export type Marcador = {
  lecciones: number;
  cursosEmpezados: number;
  cursosTerminados: number;
  /** Días seguidos entrando, hoy incluido. */
  racha: number;
};

export type Medalla = {
  id: string;
  nombre: string;
  /** Qué hay que hacer. Se enseña también cuando está cerrada: es lo que tira. */
  como: string;
  abierta: boolean;
};

/* ----------------------------------------------------------- las visitas */

/**
 * Los días que alguien ha entrado.
 *
 * SE GUARDAN LOS DÍAS, NO LAS VISITAS. Un documento por persona con una lista
 * de fechas en formato AAAA-MM-DD. Entrar catorce veces un martes escribe una
 * sola vez, y la lista de un año son 365 cadenas de diez letras: nada.
 *
 * Guardar cada visita daría para saber a qué hora entra la gente —interesante
 * para las métricas— y costaría una escritura por visita y una tabla que crece
 * sin fin. Si algún día hace falta esa precisión, se mide aparte y no aquí: lo
 * de aquí es la racha, y para la racha el día basta.
 */
export type Visitas = { uid: string; dias: string[] };

const hoy = () => new Date().toISOString().slice(0, 10);

/** Apunta que esta persona ha entrado hoy. No hace nada si ya estaba. */
export async function marcaVisita(uid: string): Promise<Visitas> {
  const b = nube();
  if (!b) return { uid, dias: [hoy()] };
  const ref = doc(b, "visitas", uid);
  const d = await getDoc(ref);
  const dias: string[] = d.exists() ? ((d.data().dias as string[]) ?? []) : [];
  const dia = hoy();
  if (dias.includes(dia)) return { uid, dias };
  /* Sólo se guardan los últimos dos años: una racha más larga que eso no la
     va a tener nadie, y el documento no crece para siempre. */
  const nuevos = [...dias, dia].slice(-730);
  await setDoc(ref, { uid, dias: nuevos });
  return { uid, dias: nuevos };
}

export async function visitasDe(uid: string): Promise<string[]> {
  const b = nube();
  if (!b) return [];
  const d = await getDoc(doc(b, "visitas", uid));
  return d.exists() ? ((d.data().dias as string[]) ?? []) : [];
}

/**
 * Cuántos días seguidos lleva, contando hacia atrás desde hoy.
 *
 * SI HOY NO HA ENTRADO, LA RACHA NO ES CERO: se cuenta desde ayer. Entrar a
 * las nueve de la mañana y ver un cero porque todavía no se ha registrado el
 * día es exactamente el desánimo que esta pantalla no debe producir.
 */
export function racha(dias: string[]): number {
  const set = new Set(dias);
  const d = new Date();
  /* Si hoy no está, se empieza a contar ayer. */
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(d.toISOString().slice(0, 10))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/* --------------------------------------------------------- el marcador */

export function marcador(
  cursos: Curso[],
  avances: Record<string, Avance | null>,
  dias: string[]
): Marcador {
  let lecciones = 0;
  let empezados = 0;
  let terminados = 0;
  for (const c of cursos) {
    const p = progreso(c, avances[c.id] ?? null);
    const total = totalLecciones(c);
    const hechas = Math.round(p * total);
    lecciones += hechas;
    if (hechas > 0) empezados += 1;
    if (total > 0 && p === 1) terminados += 1;
  }
  return { lecciones, cursosEmpezados: empezados, cursosTerminados: terminados, racha: racha(dias) };
}

/* --------------------------------------------------------- las medallas */

/**
 * Las medallas, abiertas o no, según lo que haya hecho esta persona.
 *
 * Se devuelven TODAS siempre, abiertas y cerradas, en el mismo orden. Esconder
 * las que faltan sería quitar justo lo que empuja — y además haría que la lista
 * cambiara de tamaño al ganar una, que se ve como un salto y no como un logro.
 */
export function medallas(m: Marcador, mensajes: number): Medalla[] {
  return [
    { id: "primera", nombre: "Primera clase", como: "Termina tu primera lección.", abierta: m.lecciones >= 1 },
    { id: "cinco", nombre: "Cinco lecciones", como: "Termina cinco lecciones.", abierta: m.lecciones >= 5 },
    { id: "racha7", nombre: "Siete días", como: "Entra siete días seguidos.", abierta: m.racha >= 7 },
    { id: "hablas", nombre: "La primera vez que hablas", como: "Escribe tu primer mensaje en la comunidad.", abierta: mensajes >= 1 },
    { id: "curso", nombre: "Curso terminado", como: "Acaba un curso de principio a fin.", abierta: m.cursosTerminados >= 1 },
    { id: "racha30", nombre: "Un mes entero", como: "Entra treinta días seguidos.", abierta: m.racha >= 30 },
  ];
}

/* ------------------------------------------------- lo que sólo ve Iris */

/**
 * Todas las visitas de todo el mundo. Sólo para las métricas.
 *
 * Las reglas dejan esta lectura únicamente a la administración, y está bien
 * que así sea: los días que alguien entra en una escuela de desarrollo
 * personal dibujan su vida —cuándo está mal, cuándo se fue de viaje, cuándo
 * dejó de venir—. Iris los necesita para saber si la escuela está viva; nadie
 * más tiene por qué verlos.
 */
export async function todasLasVisitas(): Promise<Visitas[]> {
  const b = nube();
  if (!b) return [];
  const { collection, getDocs } = await import("firebase/firestore");
  const r = await getDocs(collection(b, "visitas"));
  return r.docs.map((d) => ({ uid: d.id, dias: (d.data().dias as string[]) ?? [] }));
}

/**
 * Cuánta gente distinta entró cada uno de los últimos `n` días.
 *
 * SE CUENTAN PERSONAS, NO VISITAS, porque es lo único que se guarda — y
 * resulta ser lo que de verdad interesa: que una persona abra la escuela
 * catorce veces un martes no dice que la escuela esté más viva que si entra
 * una vez.
 *
 * Los días sin nadie salen con un cero y no se saltan. Una línea que se salta
 * los días vacíos miente sobre la forma del mes: junta el lunes con el jueves
 * y pinta una continuidad que no hubo.
 */
export function porDia(visitas: Visitas[], n = 30): Array<{ etiqueta: string; valor: number }> {
  const cuenta = new Map<string, number>();
  for (const v of visitas) {
    for (const d of new Set(v.dias)) cuenta.set(d, (cuenta.get(d) ?? 0) + 1);
  }
  const salida: Array<{ etiqueta: string; valor: number }> = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const clave = d.toISOString().slice(0, 10);
    salida.push({
      etiqueta: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      valor: cuenta.get(clave) ?? 0,
    });
  }
  return salida;
}
