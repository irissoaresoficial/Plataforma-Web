"use client";

/**
 * ============================================================================
 * LOS ESTUDIOS DE IRIS, EN LA NUBE
 * ============================================================================
 *
 * EL PROBLEMA QUE RESUELVE, dicho sin adornos: hasta hoy las cartas vivían
 * SÓLO en el navegador. No en «la nube de Google» ni en «el servidor»: en el
 * disco de ese ordenador, en ese navegador concreto. Lo que eso significa de
 * verdad:
 *
 *   · Limpia el historial del navegador → se van todas.
 *   · Cambia de ordenador → empieza de cero.
 *   · Abre la plataforma en el móvil → no hay nada.
 *   · El modo incógnito → no guarda nada y no avisa.
 *
 * Y el trabajo de una numeróloga ES eso: las cartas que ha levantado y lo que
 * ha escrito a mano encima de cada una. Había un botón de «guardar copia» que
 * baja un fichero, y está bien tenerlo, pero una copia que hay que acordarse
 * de hacer no es una copia de seguridad: es un recordatorio.
 *
 * ---------------------------------------------------------------------------
 * CÓMO FUNCIONA: SÓLO EN LA CUENTA (desde el 15 de noviembre de 2026)
 * ---------------------------------------------------------------------------
 * Gerson: «estos estudios se deben guardar en bases de datos, no quiero que
 * se guarde en el ordenador». Antes el navegador era la copia rápida; ya no:
 *
 *   · AL ABRIR, la lista se trae de Firestore. Mientras llega, la consulta
 *     dice «trayendo tus estudios».
 *   · AL GUARDAR, se escribe en Firestore. Sólo si falla (sin red) el estudio
 *     se apunta en el navegador como PENDIENTE, y se borra de aquí en cuanto
 *     sube (ver `pendientes` más abajo).
 *   · LO DE ANTES —la lista que vivía en el navegador— se funde con la de
 *     arriba, sube, y cuando Firestore lo ha confirmado TODO, se borra de
 *     este ordenador (`borraLoDeEsteOrdenador` en `storage.ts`).
 *   · SIN FIREBASE configurado, todo esto se apaga solo y la plataforma se
 *     comporta exactamente como antes, en el navegador.
 *
 * ---------------------------------------------------------------------------
 * CÓMO SE FUNDEN LOS DOS, QUE ES LA PARTE DELICADA
 * ---------------------------------------------------------------------------
 * Se unen por identificador, y donde los dos tienen el mismo estudio gana EL
 * MÁS RECIENTE, mirando el campo `tocado`.
 *
 * Los estudios de antes de hoy no tienen `tocado`, y eso se trata como «es
 * viejo»: cualquiera con fecha le gana. Es lo correcto — un estudio sin fecha
 * se guardó antes de que existiera la fecha, por definición.
 *
 * NUNCA SE BORRA AL FUNDIR. Si un estudio está en el navegador y no en la
 * nube, sube; si está en la nube y no en el navegador, baja. Que falte en un
 * lado no significa que se haya borrado: significa que ese lado no lo ha
 * visto todavía. Borrar de verdad es una acción con su botón, y entonces se
 * borra de los dos sitios a la vez.
 *
 * ESO HACE LA MUDANZA SOLA. La primera vez que Iris abre esto, sus cuarenta
 * estudios están en el navegador y la nube está vacía: se funden, suben
 * todos, y ella no se entera de nada. No hay botón de «migrar» que pulsar ni
 * momento en que se pueda hacer mal.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ UN DOCUMENTO POR ESTUDIO Y NO UNA LISTA
 * ---------------------------------------------------------------------------
 * Un documento de Firestore cabe en un mega. Un estudio ocupa poco, pero las
 * correcciones que escribe Iris encima son texto libre y pueden ser largas:
 * cuarenta estudios con sus párrafos en un solo documento se acercan a ese
 * tope, y el día que lo pasara dejaría de guardar sin avisar.
 *
 * Además, con un documento por estudio, guardar uno no reescribe los otros
 * treinta y nueve.
 *
 * ESTO SON DATOS DE TERCEROS, y por eso las reglas sólo dejan entrar a Iris:
 * son nombres y fechas de nacimiento de sus clientes, que ella custodia. Que
 * vivan en Firestore en europe-west1 es mejor —y no peor— que en un portátil:
 * están cifrados, en Europa y con copia, y la ley pide justo eso.
 */

import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { nube } from "@/lib/firebase";
import { borraLoDeEsteOrdenador, cargaEdits, cargaHistorial, type Edits, type HistItem } from "./storage";

/** Lo que se guarda de cada estudio: la ficha y lo que Iris escribió encima. */
export type EstudioGuardado = HistItem & { correcciones?: Record<string, string> };

export function hayNube(): boolean {
  return nube() != null;
}

/**
 * EL NOMBRE DEL DOCUMENTO.
 *
 * El identificador de un estudio es el tipo, el nombre y la fecha pegados con
 * barras verticales —«PERSONA|ANA|GIL|RUIZ|3|7|1988»— y eso vale tal cual como
 * nombre de documento salvo por una cosa: Firestore no admite la barra
 * inclinada, porque separa carpetas.
 *
 * Una persona no se llama «A/B», pero una empresa sí puede («Gestión y
 * Obra S.L. / Delegación Norte»), y el día que pasara el guardado fallaría con
 * un error que no dice nada. Se cambia por un guion bajo doble, que no aparece
 * en ningún nombre real, y se deja escrito aquí para que nadie lo deshaga.
 */
function nombreDoc(id: string): string {
  return id.replace(/\//g, "__");
}

function base() {
  const b = nube();
  if (!b) throw new Error("La plataforma no está conectada a Firebase.");
  return b;
}

/** Todo lo que hay guardado, tal cual está. */
export async function leeTodo(): Promise<EstudioGuardado[]> {
  const b = nube();
  if (!b) return [];
  const r = await getDocs(collection(b, "estudios"));
  return r.docs.map((d) => d.data() as EstudioGuardado);
}

/*
 * ---------------------------------------------------------------------------
 * LO QUE TODAVÍA NO HA SUBIDO (15 de noviembre de 2026)
 * ---------------------------------------------------------------------------
 * Gerson: «estos estudios se deben guardar en bases de datos, no quiero que se
 * guarde en el ordenador». Desde entonces, con la cuenta conectada, la lista
 * de estudios NO se guarda en el navegador: se lee de Firestore y se escribe
 * en Firestore.
 *
 * La única excepción es la que impide perder trabajo: si al guardar no hay
 * red, el estudio se apunta aquí como PENDIENTE —sólo ése, y sólo hasta que
 * suba—. En cuanto Firestore confirma que lo tiene, se borra del navegador.
 * Lo mismo con un borrado que no ha llegado arriba.
 */
const LS_PENDIENTES = "es33.estudios-pendientes.v1";

export type Pendiente = { item: EstudioGuardado; borrar?: false } | { borrar: true; tocado: string };

export function pendientes(): Record<string, Pendiente> {
  try {
    const v = JSON.parse(localStorage.getItem(LS_PENDIENTES) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}
function apuntaPendiente(id: string, p: Pendiente | null, siSigueSiendo?: string) {
  const m = pendientes();
  if (p === null) {
    /* Sólo se quita si lo apuntado es lo que acaba de subir: si mientras tanto
       se ha guardado otra versión, ésa sigue pendiente. */
    const ya = m[id];
    if (!ya) return;
    const sello = "item" in ya ? ya.item.tocado : ya.tocado;
    if (siSigueSiendo !== undefined && sello !== siSigueSiendo) return;
    delete m[id];
  } else m[id] = p;
  try {
    if (Object.keys(m).length) localStorage.setItem(LS_PENDIENTES, JSON.stringify(m));
    else localStorage.removeItem(LS_PENDIENTES);
  } catch {
    /* sin almacenamiento: se intenta subir igual */
  }
}
export function hayPendientes(): boolean {
  return Object.keys(pendientes()).length > 0;
}

/** Guarda o actualiza uno. Si falla, queda pendiente y lanza. */
export async function guardaUno(item: HistItem, correcciones?: Record<string, string>): Promise<void> {
  const limpio: EstudioGuardado = {
    ...item,
    tocado: item.tocado ?? new Date().toISOString(),
    /* Firestore no admite `undefined` dentro de un documento: revienta al
       escribir en vez de ignorarlo. Con un objeto vacío se guarda igual y se
       lee igual. */
    correcciones: correcciones ?? {},
  };
  apuntaPendiente(item.id, { item: limpio });
  await setDoc(doc(base(), "estudios", nombreDoc(item.id)), limpio);
  apuntaPendiente(item.id, null, limpio.tocado);
}

/** Lo quita de la nube. Se llama cuando Iris borra un estudio de verdad. */
export async function borraUno(id: string): Promise<void> {
  const tocado = new Date().toISOString();
  apuntaPendiente(id, { borrar: true, tocado });
  await deleteDoc(doc(base(), "estudios", nombreDoc(id)));
  apuntaPendiente(id, null, tocado);
}

/** Vuelve a intentar lo pendiente. true si ya no queda nada. */
export async function subePendientes(): Promise<boolean> {
  for (const [id, p] of Object.entries(pendientes())) {
    try {
      if (p.borrar) await borraUno(id);
      else await guardaUno(p.item, p.item.correcciones);
    } catch {
      /* sigue pendiente */
    }
  }
  return !hayPendientes();
}

/** Sube varios de una vez. Para la mudanza inicial y para traer una copia. */
export async function guardaVarios(items: HistItem[], edits: Edits): Promise<void> {
  /* De uno en uno y no en lote a propósito: con cuarenta documentos la
     diferencia es de milisegundos, y así un estudio que falle —por lo que sea—
     no se lleva por delante a los otros treinta y nueve. */
  for (const h of items) {
    await guardaUno(h, edits[h.id]).catch(() => {});
  }
}

/* ------------------------------------------------------------------ fundir */

/**
 * Cuál de los dos es más nuevo. Sin fecha se considera lo más viejo que hay.
 */
function masNuevo(a: HistItem, b: HistItem): HistItem {
  const fa = a.tocado ?? "";
  const fb = b.tocado ?? "";
  return fb > fa ? b : a;
}

export type Fundido = {
  estudios: HistItem[];
  correcciones: Edits;
  /** Los que están aquí y no en la nube. Son los que hay que subir. */
  faltanArriba: HistItem[];
};

/**
 * Une lo del navegador con lo de la nube.
 *
 * El orden del resultado es por fecha de retoque, del más reciente al más
 * antiguo, que es como la lista de estudios se lee en pantalla: lo último en
 * lo que se ha trabajado, arriba. Los que no tienen fecha caen al final, que
 * es donde estaban.
 */
export function funde(aqui: HistItem[], aquiEdits: Edits, arriba: EstudioGuardado[]): Fundido {
  const porId = new Map<string, HistItem>();
  const correcciones: Edits = {};
  const enLaNube = new Set<string>();

  for (const h of aqui) {
    porId.set(h.id, h);
    if (aquiEdits[h.id]) correcciones[h.id] = { ...aquiEdits[h.id] };
  }

  for (const g of arriba) {
    enLaNube.add(g.id);
    const { correcciones: suyas, ...ficha } = g;
    const mio = porId.get(g.id);
    porId.set(g.id, mio ? masNuevo(mio, ficha) : ficha);

    /* Las correcciones se funden campo a campo, no se sustituyen enteras.
       Si Iris corrigió el bloque del alma en el ordenador y el de los ciclos
       en el móvil, se quedan las dos: sustituir perdería una. Cuando el mismo
       bloque está en los dos sitios, manda el que venga del estudio más
       reciente, que es lo que acaba de decidirse arriba. */
    if (suyas && Object.keys(suyas).length) {
      const ganaLaNube = !mio || masNuevo(mio, ficha) === ficha;
      correcciones[g.id] = ganaLaNube
        ? { ...(correcciones[g.id] || {}), ...suyas }
        : { ...suyas, ...(correcciones[g.id] || {}) };
    }
  }

  const estudios = [...porId.values()].sort((a, b) => (b.tocado ?? "").localeCompare(a.tocado ?? ""));
  return {
    estudios,
    correcciones,
    faltanArriba: estudios.filter((h) => !enLaNube.has(h.id)),
  };
}

/* ------------------------------------------------------------- al abrir */

export type AlAbrir = {
  estudios: HistItem[];
  correcciones: Edits;
  /** al-dia: todo arriba · pendiente: algo espera a subir · fallo: la cuenta no contesta. */
  estado: "al-dia" | "pendiente" | "fallo";
};

/**
 * AL ABRIR LA PLATAFORMA CON LA CUENTA CONECTADA.
 *
 *  1. Trae la lista de Firestore.
 *  2. Le funde lo que hubiera en este ordenador de antes y lo que se quedó
 *     pendiente de subir (gana lo más reciente; nada se borra al fundir; lo
 *     que se borró sin red sigue borrado).
 *  3. Sube lo que arriba falte o esté más viejo.
 *  4. Sólo si TODO ha subido, borra la lista de antes de este ordenador.
 *
 * Si la cuenta no contesta, devuelve lo que haya aquí para poder trabajar, y
 * no borra nada.
 */
export async function traeYMuda(): Promise<AlAbrir> {
  const deAntes = cargaHistorial();
  const deAntesEdits = cargaEdits();
  const pend = pendientes();
  const pendItems = Object.values(pend).flatMap((x) => ("item" in x ? [x.item] : []));
  const borrados = new Set(Object.entries(pend).filter(([, x]) => x.borrar).map(([k]) => k));
  const aqui: HistItem[] = [...deAntes, ...pendItems.map(({ correcciones: _c, ...h }) => (void _c, h))];
  const aquiEdits: Edits = { ...deAntesEdits };
  for (const x of pendItems) if (x.correcciones) aquiEdits[x.id] = x.correcciones;

  let arriba: EstudioGuardado[];
  try {
    arriba = await leeTodo();
  } catch {
    const r = funde(aqui, aquiEdits, []);
    return { estudios: r.estudios.filter((h) => !borrados.has(h.id)), correcciones: r.correcciones, estado: "fallo" };
  }

  const r = funde(aqui, aquiEdits, arriba);
  const estudios = r.estudios.filter((h) => !borrados.has(h.id));
  const deArriba = new Map(arriba.map((g) => [g.id, g]));
  const subir = estudios.filter((h) => {
    const g = deArriba.get(h.id);
    if (!g) return true;
    if ((h.tocado ?? "") > (g.tocado ?? "")) return true;
    return JSON.stringify(r.correcciones[h.id] ?? {}) !== JSON.stringify(g.correcciones ?? {});
  });
  let todoArriba = true;
  for (const h of subir) {
    try {
      await guardaUno(h, r.correcciones[h.id]);
    } catch {
      todoArriba = false;
    }
  }
  todoArriba = (await subePendientes()) && todoArriba;
  if (todoArriba) borraLoDeEsteOrdenador();
  return { estudios, correcciones: r.correcciones, estado: todoArriba ? "al-dia" : "pendiente" };
}
