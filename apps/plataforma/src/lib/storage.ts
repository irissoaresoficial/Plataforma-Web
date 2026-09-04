import type { Entrada } from "./engine";

const LS_HIST = "es33.historial.v1";
const LS_EDITS = "es33.edits.v1";
const LS_ACTUAL = "es33.actual.v1";

export type HistItem = {
  id: string;
  nombre: string;
  fecha: string;
  corazon: number;
  /** Los estudios guardados antes de que existieran empresas no traen `tipo`
   *  ni `genero`; al faltar se leen como persona, que es lo que eran. */
  f: { tipo?: string; nombre: string; ap1: string; ap2: string; dia: string; mes: string; anio: string; genero?: string };
};

export function cargaHistorial(): HistItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(LS_HIST) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
export function guardaHistorial(hist: HistItem[]) {
  try {
    localStorage.setItem(LS_HIST, JSON.stringify(hist));
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Cuál es el estudio abierto. Ahora que cada pantalla tiene su dirección, el
 * enlace del panel se puede guardar o recargar; sin esto la recarga perdía el
 * estudio —vivía sólo en memoria— y devolvía a la pantalla de entrada, con lo
 * que tener direcciones no servía de nada.
 */
export function cargaActual(): string | null {
  try {
    return localStorage.getItem(LS_ACTUAL);
  } catch {
    return null;
  }
}
export function guardaActual(id: string | null) {
  try {
    if (id) localStorage.setItem(LS_ACTUAL, id);
    else localStorage.removeItem(LS_ACTUAL);
  } catch {
    /* almacenamiento no disponible */
  }
}

export type Edits = Record<string, Record<string, string>>;
export function cargaEdits(): Edits {
  try {
    const v = JSON.parse(localStorage.getItem(LS_EDITS) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}
export function guardaEdits(edits: Edits) {
  try {
    localStorage.setItem(LS_EDITS, JSON.stringify(edits));
  } catch {
    /* almacenamiento no disponible */
  }
}

export type { Entrada };
