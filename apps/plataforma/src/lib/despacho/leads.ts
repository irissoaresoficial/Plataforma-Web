"use client";

/**
 * LOS CORREOS QUE ENTRAN POR LA WEB, VISTOS DESDE AQUÍ.
 *
 * Esto cierra el círculo del proyecto. Alguien rellena un formulario en
 * irissoares.com; el servidor de la web lo guarda en Firestore antes de hacer
 * nada más; y esta plataforma lo lee de la misma base. Un dato, un sitio.
 *
 * Lo que se puede hacer y lo que no lo deciden las reglas de
 * `firebase/firestore.rules`, no este archivo:
 *
 *   · LEER, sí.
 *   · CAMBIAR el estado y anotar, sí. Es el trabajo de Iris.
 *   · CREAR, no. Un lead sólo puede nacer de que una persona real haya
 *     rellenado un formulario. Si se pudieran crear a mano, la lista dejaría de
 *     ser un registro de lo que ha pasado.
 *   · BORRAR, tampoco. Un correo que llegó, llegó. Si sobra se marca como
 *     descartado y queda el rastro de que estuvo.
 */

import { collection, doc, getDocs, limit, orderBy, query, updateDoc, type Timestamp } from "firebase/firestore";
import { nube } from "../firebase";

/** Por dónde entró. Son los tres formularios de la web más el chat. */
export type OrigenLead = "sinergia" | "membresia" | "curso" | "reserva";

/**
 * En qué punto está. Es lo único que mueve Iris, y por eso son cuatro y no
 * doce: un embudo con doce estados es un embudo que nadie mantiene al día, y un
 * estado que nadie mantiene miente.
 */
export type EstadoLead = "nuevo" | "contactado" | "cliente" | "descartado";

export const ESTADOS_LEAD: Array<{ k: EstadoLead; label: string; que: string }> = [
  { k: "nuevo", label: "Nuevo", que: "Ha dejado su correo y todavía no le has escrito." },
  { k: "contactado", label: "Le has escrito", que: "Ya has hablado con esta persona." },
  { k: "cliente", label: "Ya es cliente", que: "Ha reservado o ha comprado." },
  { k: "descartado", label: "Descartado", que: "No sigue adelante. Se queda apuntado, no se borra." },
];

export type Lead = {
  id: string;
  email: string;
  nombre: string;
  origen: string;
  detalle: string;
  whatsapp: string;
  lang: string;
  estado: EstadoLead;
  veces: number;
  /** Cuándo apareció por primera vez y cuándo volvió la última. */
  alta: Date | null;
  visto: Date | null;
  nota?: string;
};

/** Firestore devuelve sus propias fechas; el resto de la plataforma usa `Date`. */
function fecha(v: unknown): Date | null {
  if (!v) return null;
  const t = v as Timestamp;
  return typeof t?.toDate === "function" ? t.toDate() : null;
}

/**
 * Los últimos leads, del más reciente al más antiguo.
 *
 * Con tope, y a propósito: esta lista sólo crece, y una pantalla que se trae
 * cinco mil documentos para enseñar los veinte de arriba tarda, gasta cuota y
 * un día deja de abrirse. Doscientos son de sobra para trabajar; el día que
 * haya que buscar entre miles, se busca en el servidor y no aquí.
 */
export async function ultimosLeads(tope = 200): Promise<Lead[]> {
  const base = nube();
  if (!base) return [];
  const r = await getDocs(query(collection(base, "leads"), orderBy("visto", "desc"), limit(tope)));
  return r.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      email: x.email ?? "",
      nombre: x.nombre ?? "",
      origen: x.origen ?? "",
      detalle: x.detalle ?? "",
      whatsapp: x.whatsapp ?? "",
      lang: x.lang ?? "es",
      estado: (x.estado as EstadoLead) ?? "nuevo",
      veces: typeof x.veces === "number" ? x.veces : 1,
      alta: fecha(x.alta),
      visto: fecha(x.visto),
      nota: x.nota ?? "",
    };
  });
}

/** Mover a alguien de estado. Es la única acción del embudo. */
export async function mueveLead(id: string, estado: EstadoLead): Promise<void> {
  const base = nube();
  if (!base) throw new Error("sin_nube");
  await updateDoc(doc(base, "leads", id), { estado });
}

/** Apuntar algo sobre un lead — lo que se dijo al llamarle, por ejemplo. */
export async function anotaLead(id: string, nota: string): Promise<void> {
  const base = nube();
  if (!base) throw new Error("sin_nube");
  await updateDoc(doc(base, "leads", id), { nota: nota.slice(0, 2000) });
}
