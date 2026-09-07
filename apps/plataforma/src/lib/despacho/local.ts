/**
 * LA IMPLEMENTACIÓN DE HOY: EL NAVEGADOR
 *
 * Todo lo del despacho se guarda en el `localStorage` de este equipo, igual que
 * los estudios (ver `lib/storage.ts`, que hace lo mismo y del mismo modo). No
 * hay servidor todavía.
 *
 * Este archivo es el único de la plataforma que sabe que existe
 * `localStorage` para el despacho, y es el que se tira a la basura el día que
 * llegue Firebase. Nada de lo que hay aquí sale de este archivo salvo por las
 * interfaces de `repositorio.ts`.
 */

import type { Cita, Cliente, Factura } from "./tipos";
import type { RepoCitas, RepoClientes, RepoFacturas } from "./repositorio";
import { EMISOR, emisorCompleto, faltaDelEmisor } from "./emisor";

const LS_CITAS = "es33.citas.v1";
const LS_CLIENTES = "es33.clientes.v1";
const LS_FACTURAS = "es33.facturas.v1";

/* --------------------------------------------------------------- el disco */

/**
 * Leer y escribir una lista. Se envuelve en `try` como en el resto de la casa:
 * en navegación privada, o con el almacenamiento lleno, esto lanza — y una
 * pantalla que revienta por no poder guardar una nota es peor que una nota que
 * no se guarda.
 */
function lee<T>(clave: string): T[] {
  try {
    const v = JSON.parse(localStorage.getItem(clave) || "[]");
    return Array.isArray(v) ? (v as T[]) : [];
  } catch {
    return [];
  }
}

function escribe<T>(clave: string, lista: T[]) {
  try {
    localStorage.setItem(clave, JSON.stringify(lista));
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Un identificador que no se repite. `randomUUID` no está en todas partes. */
export function nuevoId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    /* algunos navegadores lo esconden fuera de https */
  }
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

/**
 * Guardar es crear o reemplazar, según si el `id` ya estaba. Lo comparten los
 * tres repositorios, así que se escribe una vez.
 */
function guardaEn<T extends { id: string }>(clave: string, x: T): T {
  const lista = lee<T>(clave);
  const i = lista.findIndex((y) => y.id === x.id);
  if (i === -1) lista.push(x);
  else lista[i] = x;
  escribe(clave, lista);
  return x;
}

function borraDe(clave: string, id: string) {
  escribe(
    clave,
    lee<{ id: string }>(clave).filter((x) => x.id !== id)
  );
}

/**
 * «Mónica» tiene que salir escribiendo «monica». Quien busca a alguien en una
 * lista de clientes no está pensando en las tildes.
 */
export function sinTildes(t: string): string {
  return (t || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* -------------------------------------------------------------- clientes */

/** Por nombre, que es como Iris busca a la gente: alfabético en una lista, no
 *  por cuándo la dio de alta. */
const listaClientes = () => lee<Cliente>(LS_CLIENTES).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

export const clientesLocal: RepoClientes = {
  async listar() {
    return listaClientes();
  },

  async obtener(id) {
    return listaClientes().find((c) => c.id === id) ?? null;
  },

  async guardar(c) {
    return guardaEn(LS_CLIENTES, { ...c, actualizada: new Date().toISOString() });
  },

  async borrar(id) {
    borraDe(LS_CLIENTES, id);
  },

  async buscar(texto) {
    const q = sinTildes(texto);
    const todos = listaClientes();
    if (!q) return todos;
    return todos.filter((c) => sinTildes(c.nombre).includes(q) || sinTildes(c.email).includes(q));
  },
};

/* ----------------------------------------------------------------- citas */

const listaCitas = () => lee<Cita>(LS_CITAS).sort((a, b) => a.inicioISO.localeCompare(b.inicioISO));

export const citasLocal: RepoCitas = {
  async listar() {
    return listaCitas();
  },

  async obtener(id) {
    return listaCitas().find((c) => c.id === id) ?? null;
  },

  async guardar(c) {
    return guardaEn(LS_CITAS, c);
  },

  async borrar(id) {
    borraDe(LS_CITAS, id);
  },

  async entre(desdeISO, hastaISO) {
    return listaCitas().filter((c) => c.inicioISO >= desdeISO && c.inicioISO <= hastaISO);
  },
};

/* -------------------------------------------------------------- facturas */

/** Las más nuevas arriba, y los borradores —que no tienen número— antes que las
 *  emitidas: son lo que está a medias y lo que hay que terminar. */
const listaFacturas = () =>
  lee<Factura>(LS_FACTURAS).sort((a, b) => {
    if (a.numero === 0 && b.numero !== 0) return -1;
    if (b.numero === 0 && a.numero !== 0) return 1;
    if (a.numero === 0 && b.numero === 0) return b.creada.localeCompare(a.creada);
    return b.serie.localeCompare(a.serie) || b.numero - a.numero;
  });

const unaFactura = (id: string) => listaFacturas().find((f) => f.id === id) ?? null;

export const facturasLocal: RepoFacturas = {
  async listar() {
    return listaFacturas();
  },

  async obtener(id) {
    return unaFactura(id);
  },

  async guardar(f) {
    // Una factura emitida es un documento cerrado: se anula, no se reescribe.
    // La comprobación va aquí y no sólo en la pantalla porque la regla es del
    // dato, no del formulario — cualquier pantalla futura la hereda gratis.
    const previa = unaFactura(f.id);
    if (previa && previa.estado !== "borrador") {
      throw new Error("Esa factura ya está emitida: no se puede cambiar. Si está mal, anúlala y haz otra.");
    }
    return guardaEn(LS_FACTURAS, f);
  },

  async borrar(id) {
    const f = unaFactura(id);
    if (!f) return;
    if (f.estado !== "borrador") {
      throw new Error("Una factura emitida no se borra: se anula, y su número se queda ocupado.");
    }
    borraDe(LS_FACTURAS, id);
  },

  async emitir(id) {
    const f = unaFactura(id);
    if (!f) throw new Error("Esa factura ya no está.");
    if (f.estado !== "borrador") throw new Error("Esa factura ya estaba emitida.");
    if (!emisorCompleto()) {
      throw new Error("Faltan tus datos fiscales (" + faltaDelEmisor().join(", ") + "). Sin ellos no es una factura válida.");
    }
    if (!f.lineas.length || f.lineas.some((l) => !l.concepto.trim())) {
      throw new Error("Falta decir qué se factura.");
    }
    if (!f.cliente.nombre.trim()) throw new Error("Falta a quién se factura.");

    // El número se saca de lo que hay guardado, no de un contador aparte: un
    // contador y una lista son dos verdades que acaban discrepando. Se mira el
    // mayor y se le suma uno, así que anular una NO libera su número.
    const serie = f.fecha.slice(0, 4);
    const numero = listaFacturas()
      .filter((x) => x.serie === serie)
      .reduce((m, x) => Math.max(m, x.numero), 0) + 1;

    const definitiva: Factura = {
      ...f,
      serie,
      numero,
      estado: "emitida",
      // El emisor se copia tal y como está HOY. Si mañana cambia de domicilio,
      // esta factura tiene que seguir diciendo el de hoy.
      emisor: { ...EMISOR },
      emitida: new Date().toISOString(),
    };
    return guardaEn(LS_FACTURAS, definitiva);
  },

  async anular(id, motivo) {
    const f = unaFactura(id);
    if (!f) throw new Error("Esa factura ya no está.");
    if (f.estado === "borrador") throw new Error("Un borrador no se anula: se borra.");
    if (!motivo.trim()) throw new Error("Escribe por qué se anula.");
    const anulada: Factura = { ...f, estado: "anulada", motivoAnulacion: motivo.trim() };
    return guardaEn(LS_FACTURAS, anulada);
  },
};
