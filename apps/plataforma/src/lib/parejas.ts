"use client";

/**
 * ============================================================================
 * LAS COMPARATIVAS DE PAREJA, GUARDADAS
 * ============================================================================
 *
 * Hasta el 15 de noviembre de 2026 una comparativa no se guardaba en ninguna
 * parte: se calculaba, se miraba y al salir de la pantalla desaparecía, con
 * los datos de la segunda persona incluidos.
 *
 * QUÉ SE GUARDA: QUIÉNES SON LOS DOS, NO EL RESULTADO. El estudio de la
 * primera persona (su id en `estudios`) y lo que se escribió de la segunda.
 * La comparativa se vuelve a calcular al abrirla con el mismo motor de
 * siempre, igual que los estudios: si un día cambian las tablas, no queda una
 * comparativa vieja congelada que diga otra cosa.
 *
 * DÓNDE: en la colección `parejas` de la cuenta. Con la cuenta conectada, en
 * el navegador sólo queda una comparativa mientras espera a subir (sin red),
 * y se borra de aquí en cuanto Firestore la confirma — la misma regla que los
 * estudios (Gerson: «no quiero que se guarde en el ordenador»). Sin cuenta,
 * todo vive en el navegador, como antes.
 *
 * Son datos de terceros (nombres y fechas de nacimiento): sólo administración.
 */

import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { nube } from "@/lib/firebase";

/** Lo que hace falta de la segunda persona para volver a calcular. */
export type DatosB = {
  nombre: string;
  ap1: string;
  ap2: string;
  apPadre2: string;
  apMadre2: string;
  dia: string;
  mes: string;
  anio: string;
  genero: string;
};

export type ParejaGuardada = {
  id: string;
  /** El id del estudio de la primera persona, en `estudios`. */
  estudioA: string;
  nombreA: string;
  b: DatosB;
  nombreB: string;
  /** La ficha de Personas de la segunda persona, si Iris la ha unido. */
  clienteIdB?: string;
  creada: string;
  tocado: string;
};

const LS = "es33.parejas.v1";
const LS_SUBIDAS = "es33.parejas-subidas.v1";

/** El id: los dos, en el orden en que se compararon. Sin barras (Firestore). */
export function idDePareja(estudioA: string, b: DatosB): string {
  const deB = ["PERSONA", b.nombre, b.ap1, b.ap2, b.dia, b.mes, b.anio].join("|").toUpperCase();
  return `${estudioA}~${deB}`.replace(/\//g, "__");
}

function lee<T>(llave: string, nada: T): T {
  try {
    const v = JSON.parse(localStorage.getItem(llave) || "null");
    return v ?? nada;
  } catch {
    return nada;
  }
}
function escribe(llave: string, v: unknown) {
  try {
    localStorage.setItem(llave, JSON.stringify(v));
  } catch {
    /* navegador lleno: la nube la tiene */
  }
}

export function cargaParejas(): ParejaGuardada[] {
  const v = lee<ParejaGuardada[]>(LS, []);
  return Array.isArray(v) ? v : [];
}

function apuntaSubida(p: ParejaGuardada) {
  const m = lee<Record<string, string>>(LS_SUBIDAS, {});
  m[p.id] = p.tocado;
  escribe(LS_SUBIDAS, m);
}

const limpio = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

async function subeUna(p: ParejaGuardada): Promise<void> {
  const b = nube();
  if (!b) return;
  /* Con `merge`: si en esta sesión no se sabía que la segunda persona ya
     tenía ficha, volver a comparar no la desata. */
  await setDoc(doc(b, "parejas", p.id), limpio(p), { merge: true });
  apuntaSubida(p);
  /* Arriba y confirmada: fuera del ordenador (si sigue siendo esa versión). */
  escribe(
    LS,
    cargaParejas().filter((x) => !(x.id === p.id && x.tocado === p.tocado))
  );
}

/** Con la cuenta, lo que está arriba se recuerda en memoria, no en el disco. */
let enMemoria: ParejaGuardada[] = [];

/**
 * Guarda una comparativa (o la actualiza si los dos ya estaban). Aquí al
 * momento; arriba sin esperar. Si la subida falla, sube la próxima vez que se
 * abra la lista, al fundir.
 */
export function guardaPareja(p: ParejaGuardada): ParejaGuardada {
  const lista = cargaParejas().filter((x) => x.id !== p.id);
  escribe(LS, [p, ...lista]);
  enMemoria = [p, ...enMemoria.filter((x) => x.id !== p.id)];
  void subeUna(p).catch(() => {});
  return p;
}

/** Une la segunda persona a su ficha de Personas. */
export function vinculaB(id: string, clienteId: string): ParejaGuardada | null {
  const p = cargaParejas().find((x) => x.id === id) ?? enMemoria.find((x) => x.id === id);
  if (!p) return null;
  return guardaPareja({ ...p, clienteIdB: clienteId, tocado: new Date().toISOString() });
}

/** La que se conozca con ese id: la de aquí, la de memoria o la de la cuenta. */
export async function buscaPareja(id: string): Promise<ParejaGuardada | null> {
  const aqui = cargaParejas().find((x) => x.id === id) ?? enMemoria.find((x) => x.id === id);
  if (aqui) return aqui;
  const b = nube();
  if (!b) return null;
  try {
    const d = await getDoc(doc(b, "parejas", id));
    return d.exists() ? (d.data() as ParejaGuardada) : null;
  } catch {
    return null;
  }
}

export async function borraPareja(id: string): Promise<void> {
  enMemoria = enMemoria.filter((x) => x.id !== id);
  escribe(
    LS,
    cargaParejas().filter((x) => x.id !== id)
  );
  const b = nube();
  if (b) await deleteDoc(doc(b, "parejas", id));
}

/**
 * Todas, las de aquí y las de la cuenta. Gana la más reciente; lo que sólo
 * está aquí sube y queda apuntado como subido. Nada se borra.
 */
export async function todasLasParejas(): Promise<ParejaGuardada[]> {
  const aqui = cargaParejas();
  const b = nube();
  if (!b) return aqui;
  const arriba = (await getDocs(collection(b, "parejas"))).docs.map((d) => d.data() as ParejaGuardada);
  const porId = new Map(aqui.map((x) => [x.id, x]));
  for (const g of arriba) {
    const mia = porId.get(g.id);
    if (!mia || g.tocado > mia.tocado) porId.set(g.id, g);
    if (!mia || g.tocado >= mia.tocado) apuntaSubida(g);
  }
  const lista = [...porId.values()].sort((x, y) => y.tocado.localeCompare(x.tocado));
  /* Sube lo que falte; cada una que sube se borra de este ordenador. */
  const subidas = lee<Record<string, string>>(LS_SUBIDAS, {});
  for (const p of lista) if (subidas[p.id] !== p.tocado) await subeUna(p).catch(() => {});
  /* Lo de aquí que ya estaba arriba igual o más nuevo, también fuera. */
  const yaArriba = lee<Record<string, string>>(LS_SUBIDAS, {});
  escribe(
    LS,
    cargaParejas().filter((x) => yaArriba[x.id] !== x.tocado)
  );
  enMemoria = lista;
  return lista;
}
