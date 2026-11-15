/**
 * LAS PLANTILLAS DE FACTURA
 *
 * Iris factura casi siempre lo mismo: una sesión, una consulta de Kábala, un
 * curso. Escribir el concepto y calcular la base sin IVA cada vez es donde se
 * cuelan los errores, así que se empieza por una plantilla.
 *
 * DOS CLASES:
 *
 *  · LAS DE LA CASA, que salen de los servicios y precios que ya publica la
 *    web (`apps/web/content/site.ts`: `SESION`, `KABALA`, `CURSOS`,
 *    `MEMBRESIA`). Están copiados aquí porque la plataforma no importa nada de
 *    la web; si cambia un precio allí, se cambia aquí también. Lo que la web
 *    tiene en `null` va como PENDIENTE: un precio de factura inventado es un
 *    precio cobrado de más o de menos.
 *
 *  · LAS SUYAS, que guarda Iris desde una factura para repetirla. Viven en
 *    `ajustes/plantillas` de Firestore (la regla ya existe) o en el navegador
 *    sin nube, como el resto del despacho.
 *
 * EL PRECIO DE LA WEB ES LO QUE PAGA LA CLIENTA, IVA INCLUIDO: en España un
 * precio a consumidores se anuncia final. La factura, en cambio, pide la base
 * sin IVA. Así que al aplicar una plantilla de la casa se saca la base a partir
 * del IVA que tenga puesto la factura, y la clienta paga lo anunciado.
 *
 * EL IVA ES EL 21 %. Lo confirmó Ger el 15 de noviembre de 2026: Iris sólo
 * factura a particulares (sin retención de IRPF) y sus servicios llevan el
 * tipo general. Por eso la factura arranca en 21 y no hay campo de retención.
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { hayFirebase, nube } from "@/lib/firebase";
import { nuevoId } from "./local";
import { totales, type LineaFactura } from "./tipos";

export type Plantilla = {
  id: string;
  /** El nombre corto de la tarjeta. */
  nombre: string;
  /** Lo que sale escrito en la factura. */
  concepto: string;
  /** Lo que paga la clienta, IVA incluido. Lo tienen la de la casa y las que
   *  Iris crea con «Nueva plantilla». */
  precioFinal: number | null;
  /** De dónde sale el precio, dicho corto: «precio de la web». */
  origen: string;
  /** Las guardadas desde una factura: sus líneas tal cual (sin IVA) y su IVA. */
  lineas?: LineaFactura[];
  iva?: number;
  propia: boolean;
};

/**
 * La de la casa: sólo la sesión, que es lo que Iris factura casi siempre.
 * Ger, 15 de noviembre de 2026: fuera el aniversario, Kábala, los cursos y la
 * membresía — «ella tiene que tener la capacidad de crear estas cosas». Lo
 * demás lo crea Iris con «Nueva plantilla», con su nombre y su precio.
 * El precio sale de `SESION.precio` en `apps/web/content/site.ts`.
 */
export const PLANTILLAS_CASA: Plantilla[] = [
  {
    id: "casa-sesion",
    nombre: "Sesión",
    concepto: "Sesión individual de numerología transgeneracional",
    precioFinal: 150,
    origen: "precio de la web",
    propia: false,
  },
];

const redondea = (n: number) => Math.round(n * 100) / 100;

/**
 * La base sin IVA que hace que la clienta pague exactamente lo anunciado.
 *
 * Con algunos precios no hay base en céntimos que cuadre al céntimo (111 € al
 * 21 % da 111,01 o 110,99). Entonces se queda un céntimo por debajo: cobrar un
 * céntimo menos de lo anunciado no le hace daño a nadie; uno más, sí.
 */
export function baseDesdeFinal(final: number, iva: number): number {
  let base = redondea(final / (1 + iva / 100));
  if (totales({ lineas: [{ concepto: "", cantidad: 1, precio: base }], iva }).total > final) base = redondea(base - 0.01);
  return base;
}

/* ------------------------------------------------------- las suyas */

const LS = "es33.plantillas.v1";
const enLaNube = hayFirebase();

export async function listaPropias(): Promise<Plantilla[]> {
  if (!enLaNube) {
    try {
      const v = JSON.parse(localStorage.getItem(LS) || "[]");
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
  const b = nube();
  if (!b) return [];
  const d = await getDoc(doc(b, "ajustes", "plantillas"));
  const lista = d.exists() ? (d.data() as { lista?: Plantilla[] }).lista : [];
  return Array.isArray(lista) ? lista : [];
}

/** Escribe la lista entera. Lanza si no se puede: «guardada» tiene que ser verdad. */
async function escribe(lista: Plantilla[]) {
  if (!enLaNube) {
    localStorage.setItem(LS, JSON.stringify(lista));
    return;
  }
  const b = nube();
  if (!b) throw new Error("La plataforma no está conectada a Firebase.");
  await setDoc(doc(b, "ajustes", "plantillas"), { lista });
}

export async function guardaPropia(nombre: string, lineas: LineaFactura[], iva: number): Promise<Plantilla[]> {
  const nueva: Plantilla = {
    id: nuevoId(),
    nombre: nombre.trim(),
    concepto: lineas[0]?.concepto ?? "",
    precioFinal: null,
    origen: "tuya",
    lineas: lineas.map((l) => ({ ...l })),
    iva,
    propia: true,
  };
  const lista = [...(await listaPropias()), nueva];
  await escribe(lista);
  return lista;
}

/** Una plantilla nueva desde cero: un nombre y lo que paga la clienta. */
export async function creaPropia(nombre: string, precioFinal: number): Promise<Plantilla[]> {
  const nueva: Plantilla = {
    id: nuevoId(),
    nombre: nombre.trim(),
    concepto: nombre.trim(),
    precioFinal: redondea(precioFinal),
    origen: "tuya",
    propia: true,
  };
  const lista = [...(await listaPropias()), nueva];
  await escribe(lista);
  return lista;
}

export async function quitaPropia(id: string): Promise<Plantilla[]> {
  const lista = (await listaPropias()).filter((p) => p.id !== id);
  await escribe(lista);
  return lista;
}
