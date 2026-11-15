"use client";

/**
 * ============================================================================
 * LO QUE SE QUEDÓ EN EL NAVEGADOR AL CONECTAR LA NUBE
 * ============================================================================
 *
 * Antes de que hubiera Firebase, las fichas, las citas y las facturas se
 * guardaban en el navegador (`local.ts`). El día que se conectó la nube,
 * `index.ts` empezó a leer SÓLO de la nube — y lo que hubiera en el navegador
 * se quedó ahí, sin borrar pero sin que ninguna pantalla lo enseñara.
 *
 * Esto lo recupera, una vez por sesión, al entrar en Personas o en Facturas:
 *
 *   · FICHAS Y CITAS que estén aquí y no arriba → suben, con su mismo id, y
 *     se apuntan como subidas. Lo de aquí NO se borra: se queda de copia.
 *     Si ya están arriba no se tocan, aunque aquí sean distintas: lo de
 *     arriba es lo que Iris ha estado usando desde entonces.
 *
 *   · FACTURAS → NO SUBEN SOLAS. Una factura emitida lleva un número de una
 *     serie correlativa; subir una 2026/003 vieja junto a la 2026/003 de la
 *     nube daría dos facturas con el mismo número. Sólo se cuentan, se avisa,
 *     y se ofrece descargarlas para revisarlas.
 */

import type { Cita, Cliente, Factura } from "./tipos";
import { citasLocal, clientesLocal, facturasLocal } from "./local";
import { citasNube, clientesNube, facturasNube } from "./nube";
import { hayFirebase } from "@/lib/firebase";

export type Rescate = {
  fichasSubidas: number;
  citasSubidas: number;
  /** Facturas que sólo están en este navegador. No se suben. */
  facturasSoloAqui: Factura[];
  /** Si algo no se ha podido subir, por qué. */
  fallo: string;
};

const LS_RESCATE = "es33.rescate.v1";

function apunta(que: "clientes" | "citas", ids: string[]) {
  if (!ids.length) return;
  try {
    const v = JSON.parse(localStorage.getItem(LS_RESCATE) || "{}");
    v[que] = [...new Set([...(v[que] ?? []), ...ids])];
    v.cuando = new Date().toISOString();
    localStorage.setItem(LS_RESCATE, JSON.stringify(v));
  } catch {
    /* sin sitio: la próxima vez se vuelve a comprobar, y no subirá dos veces
       porque ya estarán arriba */
  }
}

async function soloAqui<T extends { id: string }>(local: () => Promise<T[]>, arriba: () => Promise<T[]>): Promise<T[]> {
  const aqui = await local().catch(() => [] as T[]);
  if (!aqui.length) return [];
  const ids = new Set((await arriba()).map((x) => x.id));
  return aqui.filter((x) => !ids.has(x.id));
}

let enCurso: Promise<Rescate | null> | null = null;

/** null = no hay nube (todo vive aquí y no hay nada que rescatar). */
export function rescataDelNavegador(): Promise<Rescate | null> {
  if (!hayFirebase()) return Promise.resolve(null);
  enCurso ??= (async () => {
    const r: Rescate = { fichasSubidas: 0, citasSubidas: 0, facturasSoloAqui: [], fallo: "" };
    try {
      const fichas = await soloAqui<Cliente>(() => clientesLocal.listar(), () => clientesNube.listar());
      const subidas: string[] = [];
      for (const c of fichas) {
        try {
          await clientesNube.guardar(c);
          subidas.push(c.id);
        } catch (e) {
          r.fallo = e instanceof Error ? e.message : "no se ha podido subir una ficha";
        }
      }
      apunta("clientes", subidas);
      r.fichasSubidas = subidas.length;

      const citas = await soloAqui<Cita>(() => citasLocal.listar(), () => citasNube.listar());
      const subidasC: string[] = [];
      for (const c of citas) {
        try {
          await citasNube.guardar(c);
          subidasC.push(c.id);
        } catch (e) {
          r.fallo = e instanceof Error ? e.message : "no se ha podido subir una cita";
        }
      }
      apunta("citas", subidasC);
      r.citasSubidas = subidasC.length;

      r.facturasSoloAqui = await soloAqui<Factura>(() => facturasLocal.listar(), () => facturasNube.listar());
    } catch (e) {
      r.fallo = e instanceof Error ? e.message : "no se ha podido comprobar la cuenta";
      enCurso = null; // que lo vuelva a intentar la próxima vez
    }
    return r;
  })();
  return enCurso;
}
