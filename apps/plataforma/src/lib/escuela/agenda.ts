/**
 * LA AGENDA DE UN CREADOR DE CURSOS.
 *
 * Gerson, el 20 de octubre de 2026: «en el apartado de la gente que edita los
 * cursos tiene que haber un apartado de agenda». Quien lleva Desórdenes
 * Amorosos tiene sus directos, sus sesiones y sus entregas, y no son las
 * citas de Iris.
 *
 * NO ES LA AGENDA DE IRIS, Y A PROPÓSITO. La de Iris va atada a sus clientas,
 * sus fichas y sus facturas: abrírsela a un creador sería enseñarle los datos
 * de las clientas de Iris. Ésta es una agenda propia, sin fichas, que sólo ve
 * su dueño (las reglas de `agenda` en `firestore.rules`).
 */
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { nube } from "@/lib/firebase";
import { nuevoId } from "./local";

export type Evento = {
  id: string;
  /** De quién es. */
  uid: string;
  titulo: string;
  /** Inicio, en ISO con zona. */
  inicioISO: string;
  minutos: number;
  /** Para qué es: un directo, una sesión, una entrega… Texto libre. */
  nota: string;
  creado: string;
};

const LS = (uid: string) => `es33.agenda.${uid}`;

function leeLocal(uid: string): Evento[] {
  try {
    return JSON.parse(localStorage.getItem(LS(uid)) || "[]") as Evento[];
  } catch {
    return [];
  }
}
function escribeLocal(uid: string, xs: Evento[]) {
  try {
    localStorage.setItem(LS(uid), JSON.stringify(xs));
  } catch {
    /* sin almacenamiento */
  }
}

export async function misEventos(uid: string): Promise<Evento[]> {
  const b = nube();
  const xs = b
    ? (await getDocs(query(collection(b, "agenda"), where("uid", "==", uid)))).docs.map((d) => ({ ...(d.data() as Evento), id: d.id }))
    : leeLocal(uid);
  return xs.sort((a, c) => a.inicioISO.localeCompare(c.inicioISO));
}

export async function guardaEvento(e: Omit<Evento, "id" | "creado"> & { id?: string; creado?: string }): Promise<Evento> {
  const ev: Evento = { ...e, id: e.id || nuevoId(), creado: e.creado || new Date().toISOString() };
  const b = nube();
  if (b) await setDoc(doc(b, "agenda", ev.id), ev);
  else escribeLocal(ev.uid, [...leeLocal(ev.uid).filter((x) => x.id !== ev.id), ev]);
  return ev;
}

export async function borraEvento(uid: string, id: string): Promise<void> {
  const b = nube();
  if (b) await deleteDoc(doc(b, "agenda", id));
  else escribeLocal(uid, leeLocal(uid).filter((x) => x.id !== id));
}
