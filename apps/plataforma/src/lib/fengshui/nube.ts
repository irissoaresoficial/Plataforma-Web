"use client";

/**
 * ============================================================================
 * LOS ESTUDIOS DE FENG SHUI, EN LA NUBE
 * ============================================================================
 *
 * Hasta el 15 de noviembre de 2026 un estudio de Feng Shui vivía SÓLO en el
 * navegador donde se hizo: limpiar el historial o cambiar de ordenador era
 * perderlo, plano incluido. Esto lo sube a Firestore, igual que se hizo con
 * los estudios de Kábala (`lib/estudios.ts`), y con las mismas reglas:
 *
 *   · El navegador sigue siendo la copia rápida: se pinta lo de aquí al
 *     momento y después se funde con lo de arriba.
 *   · NUNCA SE BORRA AL FUNDIR. Lo que está aquí y no arriba, sube. Lo que
 *     está arriba y no aquí, baja. Borrar es un botón, y entonces se borra en
 *     los dos sitios.
 *   · Cada estudio que sube se apunta como subido, con la fecha de la versión
 *     que subió. Lo local no se toca hasta tener esa confirmación — y ni
 *     siquiera entonces se borra: se queda de copia.
 *
 * DOS COLECCIONES, Y POR QUÉ
 * ---------------------------------------------------------------------------
 *   `fengshui`         → el estudio: datos, medidas, ocupantes y notas.
 *   `fengshui-planos`  → el plano, una imagen, un documento por estudio.
 *
 * El plano va aparte porque pesa cien veces más que el estudio y cambia
 * muchísimo menos: si fueran juntos, mover la fachada un grado volvería a
 * subir la foto entera. Va en Firestore y no en Storage para que tenga la
 * misma llave que el resto del despacho —`esAdmin()`—; Storage sólo sabe
 * comprobar el correo de Iris, y una segunda administradora no podría abrir
 * los planos. Un documento admite 1 MB: el plano se recomprime hasta caber.
 *
 * Son datos de terceros —nombre, dirección y fechas de nacimiento de quien
 * vive en la casa— y por eso las reglas sólo dejan entrar a administración.
 */

import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { nube } from "@/lib/firebase";
import type { EstudioFs } from "./estudio";

const COLECCION = "fengshui";
const PLANOS = "fengshui-planos";

/** Lo que se ha subido ya: id → `actualizado` de la versión que está arriba. */
const LLAVE_SUBIDOS = "fengshui-subidos";
/** Lo mismo para los planos: id → huella de la imagen que está arriba. */
const LLAVE_PLANOS_SUBIDOS = "fengshui-planos-subidos";

/** Tope de lo que se guarda de un plano. Firestore admite 1 MB por documento. */
const TOPE_PLANO = 900_000;

export function hayNubeFs(): boolean {
  return nube() != null;
}

/* ------------------------------------------------------- estado, honesto */

/**
 * Lo que la pantalla puede decir sobre dónde está el trabajo. Existe para no
 * mentir: «se guarda en tu cuenta» sólo se dice cuando la nube ha contestado
 * que sí, y si falla se dice que falla.
 */
export type EstadoNube = "sin-nube" | "comprobando" | "al-dia" | "subiendo" | "fallo";

let estado: EstadoNube = hayNubeFs() ? "comprobando" : "sin-nube";
let motivo = "";
const oyentes = new Set<() => void>();

function pon(e: EstadoNube, m = "") {
  estado = e;
  motivo = m;
  oyentes.forEach((f) => f());
}
export function estadoNube(): { estado: EstadoNube; motivo: string } {
  return { estado, motivo };
}
export function escuchaNube(f: () => void): () => void {
  oyentes.add(f);
  return () => oyentes.delete(f);
}

function explica(err: unknown): string {
  const c = (err as { code?: string })?.code ?? "";
  if (c.includes("permission-denied")) return "tu cuenta no tiene permiso para guardar estudios";
  if (c.includes("unavailable")) return "no hay conexión";
  if (c.includes("resource-exhausted")) return "la base de datos ha llegado a su tope";
  return err instanceof Error ? err.message : "error desconocido";
}

/* ------------------------------------------------------ lo que ya subió */

function leeMapa(llave: string): Record<string, string> {
  try {
    const v = JSON.parse(localStorage.getItem(llave) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}
function apunta(llave: string, id: string, valor: string | null) {
  const m = leeMapa(llave);
  if (valor === null) delete m[id];
  else m[id] = valor;
  try {
    localStorage.setItem(llave, JSON.stringify(m));
  } catch {
    /* Sin sitio para apuntarlo: se volverá a subir la próxima vez, que es
       inofensivo — subir dos veces lo mismo deja lo mismo. */
  }
}

/** Una huella barata de la imagen, para saber si la de arriba es ésta. */
function huella(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i += 97) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${s.length}.${h >>> 0}`;
}

/* -------------------------------------------------------------- estudios */

/** Firestore no admite `undefined`: un viaje por JSON lo quita. */
const limpio = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

export async function leeEstudiosNube(): Promise<EstudioFs[]> {
  const b = nube();
  if (!b) return [];
  const r = await getDocs(collection(b, COLECCION));
  return r.docs.map((d) => d.data() as EstudioFs);
}

async function subeUno(e: EstudioFs): Promise<void> {
  const b = nube();
  if (!b) throw new Error("La plataforma no está conectada a Firebase.");
  await setDoc(doc(b, COLECCION, e.id), limpio(e));
  apunta(LLAVE_SUBIDOS, e.id, e.actualizado);
}

/** ¿Lo que hay aquí es exactamente lo que hay arriba? */
export function estaSubido(e: EstudioFs): boolean {
  return leeMapa(LLAVE_SUBIDOS)[e.id] === e.actualizado;
}

/** Apunta como subido lo que acaba de bajar de la nube: ya está arriba. */
export function apuntaBajado(e: EstudioFs) {
  apunta(LLAVE_SUBIDOS, e.id, e.actualizado);
}

/**
 * Sube los que han cambiado desde la última vez. Se espera un momento antes
 * de subir: mover el luopan son decenas de cambios por segundo, y subir cada
 * uno sería pagar decenas de escrituras por un solo gesto.
 */
let pendiente: EstudioFs[] | null = null;
let reloj: ReturnType<typeof setTimeout> | null = null;

export function programaSubida(lista: EstudioFs[]) {
  if (!hayNubeFs()) return;
  pendiente = lista;
  if (reloj) clearTimeout(reloj);
  pon("subiendo");
  reloj = setTimeout(() => void subePendientes(), 1200);
}

export async function subePendientes(): Promise<boolean> {
  reloj = null;
  const lista = pendiente ?? [];
  pendiente = null;
  let fallo: unknown = null;
  /* Uno a uno: si uno falla, los otros siguen. */
  for (const e of lista) {
    if (estaSubido(e)) continue;
    try {
      await subeUno(e);
    } catch (err) {
      fallo = err;
    }
  }
  if (pendiente || reloj) return !fallo; // ha entrado otro cambio mientras tanto
  pon(fallo ? "fallo" : "al-dia", fallo ? explica(fallo) : "");
  return !fallo;
}

/** Borra el estudio y su plano de la nube. Sólo cuando Iris lo borra a mano. */
export async function borraEstudioNube(id: string): Promise<void> {
  const b = nube();
  if (!b) return;
  try {
    await Promise.all([deleteDoc(doc(b, COLECCION, id)), deleteDoc(doc(b, PLANOS, id))]);
    apunta(LLAVE_SUBIDOS, id, null);
    apunta(LLAVE_PLANOS_SUBIDOS, id, null);
  } catch (err) {
    pon("fallo", explica(err));
  }
}

/* ---------------------------------------------------------------- planos */

/**
 * Recomprime el plano hasta que quepa en un documento. A 1600 px y calidad
 * 0,85 casi todos caben ya; los que no, bajan de calidad y después de tamaño.
 * Un plano a 1200 px sigue leyéndose entero.
 */
async function cabe(datos: string): Promise<string> {
  if (datos.length <= TOPE_PLANO) return datos;
  const img = await new Promise<HTMLImageElement>((ok, mal) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = () => mal(new Error("No se ha podido preparar el plano para subirlo."));
    i.src = datos;
  });
  for (const [lado, calidad] of [
    [1600, 0.7],
    [1400, 0.65],
    [1200, 0.6],
    [1000, 0.55],
  ] as const) {
    const escala = Math.min(1, lado / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * escala);
    c.height = Math.round(img.height * escala);
    const ctx = c.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const r = c.toDataURL("image/jpeg", calidad);
    if (r.length <= TOPE_PLANO) return r;
  }
  throw new Error("El plano es demasiado grande para guardarlo en tu cuenta. Prueba con una imagen más pequeña.");
}

export function planoSubido(id: string, datos: string): boolean {
  return leeMapa(LLAVE_PLANOS_SUBIDOS)[id] === huella(datos);
}

/** Sube el plano (o lo quita, con `null`). Devuelve false si no ha podido. */
export async function subePlano(id: string, datos: string | null): Promise<boolean> {
  const b = nube();
  if (!b) return false;
  pon("subiendo");
  try {
    if (datos === null) {
      await deleteDoc(doc(b, PLANOS, id));
      apunta(LLAVE_PLANOS_SUBIDOS, id, null);
    } else {
      const arriba = await cabe(datos);
      await setDoc(doc(b, PLANOS, id), { id, datos: arriba, tocado: new Date().toISOString() });
      /* Se apunta la huella de lo que había AQUÍ, no de lo recomprimido: es
         lo que se compara la próxima vez para saber si hay que subirlo. */
      apunta(LLAVE_PLANOS_SUBIDOS, id, huella(datos));
    }
    if (!pendiente && !reloj) pon("al-dia");
    return true;
  } catch (err) {
    pon("fallo", explica(err));
    return false;
  }
}

/** Baja el plano de un estudio. null si no tiene o no se puede. */
export async function bajaPlano(id: string): Promise<string | null> {
  const b = nube();
  if (!b) return null;
  try {
    const d = await getDoc(doc(b, PLANOS, id));
    const datos = d.exists() ? (d.data().datos as string | undefined) : undefined;
    if (!datos) return null;
    apunta(LLAVE_PLANOS_SUBIDOS, id, huella(datos));
    return datos;
  } catch {
    return null;
  }
}

/** Para cuando la sincronización termina: cuenta lo que se sabe. */
export function ponEstado(e: EstadoNube, err?: unknown) {
  pon(e, err ? explica(err) : "");
}
