/**
 * LA IMPLEMENTACIÓN DE VERDAD: FIRESTORE
 *
 * El hermano de `local.ts`, detrás de las mismas interfaces de
 * `repositorio.ts`. `local.ts` guarda en el navegador de quien esté delante;
 * éste guarda en la nube, y ésa es toda la diferencia que ve una pantalla:
 * ninguna.
 *
 * POR QUÉ HACÍA FALTA, Y NO ERA UNA MEJORA
 * ---------------------------------------------------------------------------
 * Con `local.ts`, la agenda de Iris vivía en el `localStorage` de un navegador
 * concreto. Eso significa tres cosas, y las tres son graves para una
 * herramienta de trabajo: si abre la plataforma en el móvil no ve nada de lo
 * que apuntó en el ordenador; si vacía los datos del navegador pierde su
 * agenda entera sin aviso; y —lo que la rompía del todo— una sesión que alguien
 * reserva por la web SE GUARDA EN LA NUBE, así que nunca podía aparecer en una
 * agenda que sólo miraba el disco local. Se reservaba una cita, llegaba el
 * correo, y la agenda seguía diciendo «esa semana la tienes libre entera».
 *
 * LOS IDENTIFICADORES LOS PONEMOS NOSOTROS. `setDoc` con un id propio en vez de
 * `addDoc`: así `guardar` es la misma operación tanto si crea como si
 * actualiza, igual que en la versión local, y no hay dos caminos que mantener.
 *
 * LAS FECHAS SIGUEN SIENDO TEXTO ISO y no `Timestamp` de Firestore. El tipo
 * `Cita` es el contrato que comparten la web y la plataforma, y la web escribe
 * desde el servidor con otro SDK: si aquí se guardaran timestamps y allí
 * cadenas, la misma colección tendría dos formatos y el que ordena por fecha
 * fallaría con la mitad. Un ISO ordena alfabéticamente igual que
 * cronológicamente, que es justo lo que necesita la agenda.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { nube } from "@/lib/firebase";
import type { AvisoVisto, Cita, Cliente, Factura } from "./tipos";
import type { RepoAvisos, RepoCitas, RepoClientes, RepoFacturas } from "./repositorio";
import { EMISOR, emisorCompleto, faltaDelEmisor } from "./emisor";
import { nuevoId, sinTildes } from "./local";

/**
 * Sin conexión no se inventa nada.
 *
 * Devolver una lista vacía cuando no hay base es correcto para LEER —no hay
 * nada que enseñar— pero sería un desastre para escribir: la pantalla creería
 * que ha guardado y no habría guardado. Por eso escribir sin base lanza, y
 * quien llama enseña el error de verdad.
 */
function base() {
  const b = nube();
  if (!b) throw new Error("La plataforma no está conectada a Firebase.");
  return b;
}

function baseOpcional() {
  return nube();
}

/** Firestore devuelve los campos sueltos; el `id` va aparte y hay que pegarlo. */
function conId<T>(id: string, datos: unknown): T {
  return { ...(datos as object), id } as T;
}

/* -------------------------------------------------------------- clientes */

export const clientesNube: RepoClientes = {
  async listar() {
    const b = baseOpcional();
    if (!b) return [];
    const r = await getDocs(query(collection(b, "clientes"), orderBy("nombre")));
    return r.docs.map((d) => conId<Cliente>(d.id, d.data()));
  },

  async obtener(id) {
    const b = baseOpcional();
    if (!b) return null;
    const d = await getDoc(doc(b, "clientes", id));
    return d.exists() ? conId<Cliente>(d.id, d.data()) : null;
  },

  async guardar(c) {
    const guardado = { ...c, id: c.id || nuevoId(), actualizada: new Date().toISOString() };
    await setDoc(doc(base(), "clientes", guardado.id), guardado);
    return guardado;
  },

  async borrar(id) {
    await deleteDoc(doc(base(), "clientes", id));
  },

  async buscar(texto) {
    /*
     * Se filtra en memoria, y es una decisión con fecha de caducidad escrita.
     *
     * Firestore no sabe buscar «contiene» ni ignorar tildes: sólo compara
     * cadenas enteras o rangos de prefijo. Buscar «mónica» escribiendo «monica»
     * exige un campo aparte con el nombre ya normalizado, y eso hay que
     * escribirlo en cada guardado y rellenarlo en todo lo que ya existe.
     *
     * A la escala de esto —los clientes de una persona— traerse la lista entera
     * es una consulta pequeña y la búsqueda es instantánea. El día que no lo
     * sea, se añade ese campo; hacerlo hoy sería complicar el guardado para
     * resolver un problema que no existe.
     */
    const todos = await clientesNube.listar();
    const q = sinTildes(texto);
    if (!q) return todos;
    return todos.filter((c) => sinTildes(c.nombre).includes(q) || sinTildes(c.email || "").includes(q));
  },
};

/* ----------------------------------------------------------------- citas */

export const citasNube: RepoCitas = {
  async listar() {
    const b = baseOpcional();
    if (!b) return [];
    const r = await getDocs(query(collection(b, "citas"), orderBy("inicioISO")));
    return r.docs.map((d) => conId<Cita>(d.id, d.data()));
  },

  async obtener(id) {
    const b = baseOpcional();
    if (!b) return null;
    const d = await getDoc(doc(b, "citas", id));
    return d.exists() ? conId<Cita>(d.id, d.data()) : null;
  },

  async guardar(c) {
    const guardado = { ...c, id: c.id || nuevoId() };
    await setDoc(doc(base(), "citas", guardado.id), guardado);
    return guardado;
  },

  async borrar(id) {
    await deleteDoc(doc(base(), "citas", id));
  },

  async entre(desdeISO, hastaISO) {
    const b = baseOpcional();
    if (!b) return [];
    /* La consulta la hace la base, no el navegador: es un rango sobre un campo
       ordenado, exactamente para lo que sirve un índice. Traerse el año entero
       para quedarse con una semana funciona hoy y deja de funcionar solo. */
    const r = await getDocs(
      query(
        collection(b, "citas"),
        where("inicioISO", ">=", desdeISO),
        where("inicioISO", "<=", hastaISO),
        orderBy("inicioISO"),
      ),
    );
    return r.docs.map((d) => conId<Cita>(d.id, d.data()));
  },
};

/* -------------------------------------------------------------- facturas */

const listaFacturas = async (): Promise<Factura[]> => {
  const b = baseOpcional();
  if (!b) return [];
  const r = await getDocs(collection(b, "facturas"));
  const todas = r.docs.map((d) => conId<Factura>(d.id, d.data()));
  /* El mismo orden que en local: los borradores arriba —es lo que está a
     medias— y después las emitidas de la más nueva a la más vieja. Se ordena
     aquí y no en la consulta porque son tres criterios encadenados y Firestore
     pediría un índice compuesto por cada combinación. */
  return todas.sort((a, b2) => {
    if (a.numero === 0 && b2.numero !== 0) return -1;
    if (b2.numero === 0 && a.numero !== 0) return 1;
    if (a.numero === 0 && b2.numero === 0) return b2.creada.localeCompare(a.creada);
    return b2.serie.localeCompare(a.serie) || b2.numero - a.numero;
  });
};

export const facturasNube: RepoFacturas = {
  async listar() {
    return listaFacturas();
  },

  async obtener(id) {
    const b = baseOpcional();
    if (!b) return null;
    const d = await getDoc(doc(b, "facturas", id));
    return d.exists() ? conId<Factura>(d.id, d.data()) : null;
  },

  async guardar(f) {
    // Una factura emitida es un documento cerrado: se anula, no se reescribe.
    const previa = await facturasNube.obtener(f.id);
    if (previa && previa.estado !== "borrador") {
      throw new Error("Esa factura ya está emitida: no se puede cambiar. Si está mal, anúlala y haz otra.");
    }
    const guardado = { ...f, id: f.id || nuevoId() };
    await setDoc(doc(base(), "facturas", guardado.id), guardado);
    return guardado;
  },

  async borrar(id) {
    const f = await facturasNube.obtener(id);
    if (!f) return;
    if (f.estado !== "borrador") {
      throw new Error("Una factura emitida no se borra: se anula, y su número se queda ocupado.");
    }
    await deleteDoc(doc(base(), "facturas", id));
  },

  async emitir(id) {
    const f = await facturasNube.obtener(id);
    if (!f) throw new Error("Esa factura ya no está.");
    if (f.estado !== "borrador") throw new Error("Esa factura ya estaba emitida.");
    if (!emisorCompleto()) {
      throw new Error("Faltan tus datos fiscales (" + faltaDelEmisor().join(", ") + "). Sin ellos no es una factura válida.");
    }
    if (!f.lineas.length || f.lineas.some((l) => !l.concepto.trim())) {
      throw new Error("Falta decir qué se factura.");
    }
    if (!f.cliente.nombre.trim()) throw new Error("Falta a quién se factura.");

    /*
     * EL NÚMERO SE SACA DE LO QUE HAY, Y AQUÍ ESO TIENE UN LÍMITE QUE HAY QUE
     * DECIR EN VOZ ALTA.
     *
     * Se lee el mayor de la serie y se le suma uno, igual que en local. Con una
     * sola persona emitiendo facturas eso es correcto siempre. Con DOS PESTAÑAS
     * pulsando «emitir» en el mismo segundo, las dos leerían el mismo mayor y
     * las dos emitirían la 2026/007.
     *
     * La solución de verdad es una transacción de Firestore, y no está escrita
     * porque hacerla bien exige un documento contador aparte y decidir qué pasa
     * si la transacción falla a medias. Hoy esto lo usa una persona; el día que
     * sean dos, esta función es el único sitio que hay que tocar — y este
     * comentario es el aviso de que hay que tocarlo, en vez de descubrirlo con
     * dos facturas repetidas delante de un inspector.
     */
    const serie = f.fecha.slice(0, 4);
    const todas = await listaFacturas();
    const numero = todas.filter((x) => x.serie === serie).reduce((m, x) => Math.max(m, x.numero), 0) + 1;

    const definitiva: Factura = {
      ...f,
      serie,
      numero,
      estado: "emitida",
      emisor: { ...EMISOR },
      emitida: new Date().toISOString(),
    };
    await setDoc(doc(base(), "facturas", definitiva.id), definitiva);
    return definitiva;
  },

  async anular(id, motivo) {
    const f = await facturasNube.obtener(id);
    if (!f) throw new Error("Esa factura ya no está.");
    if (f.estado === "borrador") throw new Error("Un borrador no se anula: se borra.");
    if (!motivo.trim()) throw new Error("Escribe por qué se anula.");
    const anulada: Factura = { ...f, estado: "anulada", motivoAnulacion: motivo.trim() };
    await setDoc(doc(base(), "facturas", anulada.id), anulada);
    return anulada;
  },
};

/* --------------------------------------------------------------- avisos */

const MEDIO_ANO = 183 * 86400000;

export const avisosNube: RepoAvisos = {
  async vistos() {
    const b = baseOpcional();
    if (!b) return [];
    const r = await getDocs(collection(b, "avisos"));
    const corte = Date.now() - MEDIO_ANO;
    return r.docs
      .map((d) => conId<AvisoVisto>(d.id, d.data()))
      .filter((v) => Date.parse(v.cuando) > corte);
  },

  async marcar(nuevos) {
    if (!nuevos.length) return;
    const b = base();
    const cuando = new Date().toISOString();
    /*
     * Uno por identificador, y el último manda — igual que en local. Van en
     * paralelo y no en serie porque «marcar todo como visto» es una sola
     * decisión: en serie, diez avisos son diez viajes seguidos y la pantalla se
     * queda esperando por algo que a nadie le importa que tarde.
     *
     * El identificador del aviso se usa como identificador del documento, así
     * que marcar dos veces el mismo pisa en vez de acumular. Se limpia porque
     * un id de Firestore no admite `/` ni puntos.
     */
    await Promise.all(
      nuevos.map(({ id, sello }) =>
        setDoc(doc(b, "avisos", id.replace(/[/\\.#$[\]]/g, "_").slice(0, 380)), { id, sello, cuando }),
      ),
    );
  },
};
