/**
 * LOS GASTOS, Y LAS CUENTAS DEL TRIMESTRE
 *
 * Iris es autónoma. Cada tres meses su gestor le pide lo mismo: lo que ha
 * facturado, lo que ha gastado y el IVA de las dos cosas. Con eso hace el
 * modelo 303 (el IVA) y el 130 (el adelanto del IRPF). Las facturas ya
 * estaban aquí; faltaba la otra mitad, los gastos, y la suma.
 *
 * LO QUE ESTO NO ES. No presenta impuestos ni dice cuánto hay que pagar. Pone
 * los números en orden para que el gestor los revise. Por eso la pantalla
 * habla de «IVA del trimestre» y «rendimiento», que son restas, y no de «lo
 * que vas a pagar», que depende de cosas que aquí no constan (retenciones que
 * le hayan practicado, pagos anteriores, gastos que el gestor no admita).
 *
 * DÓNDE SE GUARDAN. En la colección `gastos` de Firestore si hay nube, y en el
 * navegador si no: la misma pareja que el resto del despacho. El tique (foto o
 * PDF) va al almacén de archivos, en `justificantes/`, y sólo con nube: en el
 * navegador no cabe un archivo de verdad, y fingir que se ha guardado sería
 * peor que decir que no.
 */

import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { almacen, hayFirebase, nube } from "@/lib/firebase";
import { nuevoId } from "./local";
import { totales, type Factura } from "./tipos";

/* ------------------------------------------------------------------ tipos */

/** El tique o la factura del proveedor, ya subido. */
export type Justificante = {
  /** Dónde está en el almacén, para poder borrarlo. */
  ruta: string;
  url: string;
  nombre: string;
  tipo: string;
};

export type Gasto = {
  id: string;
  /** Fecha de la factura o del tique, AAAA-MM-DD. Decide en qué trimestre cae. */
  fecha: string;
  /** A quién se le pagó. */
  proveedor: string;
  /** El NIF del proveedor. Hacienda lo pide en el libro de gastos; puede faltar
   *  en un tique pequeño, y entonces el gestor decide. */
  nifProveedor: string;
  /** El número de su factura, si lo tiene. */
  numero: string;
  concepto: string;
  categoria: string;
  /** Lo que se pagó, IVA incluido: el número grande del tique. Se guarda éste
   *  y no la base porque es el que Iris tiene delante; la base y la cuota se
   *  sacan de él y suman exactamente lo pagado, sin un céntimo de más. */
  total: number;
  /** Tipo de IVA del tique, en tanto por ciento. */
  iva: number;
  justificante: Justificante | null;
  creado: string;
};

/**
 * Las categorías son las que usa cualquier gestor para separar los gastos de
 * una actividad. Sirven para que el libro se lea de un vistazo, no para decidir
 * qué se deduce: eso lo decide él.
 */
export const CATEGORIAS = [
  "Material y compras",
  "Alquiler del local",
  "Luz, agua, teléfono e internet",
  "Programas y suscripciones",
  "Publicidad y redes",
  "Formación",
  "Gestoría y asesoría",
  "Cuota de autónomos",
  "Seguros",
  "Viajes y desplazamientos",
  "Comisiones del banco",
  "Otros",
];

/** Los tipos de IVA que existen hoy en España. El 0 es para lo que no lleva:
 *  la cuota de autónomos, un seguro, una comisión del banco. */
export const TIPOS_IVA = [21, 10, 4, 0];

const redondea = (n: number) => Math.round(n * 100) / 100;

/** La base y la cuota de un gasto, sacadas del total. Se calculan, no se
 *  guardan: como en las facturas. La cuota es lo que queda, para que base más
 *  cuota sea siempre lo que se pagó. */
export function desglose(g: Pick<Gasto, "total" | "iva">): { base: number; cuota: number; total: number } {
  const total = redondea(Number(g.total) || 0);
  const base = redondea(total / (1 + g.iva / 100));
  return { base, cuota: redondea(total - base), total };
}

export function gastoVacio(fecha: string): Gasto {
  return {
    id: nuevoId(),
    fecha,
    proveedor: "",
    nifProveedor: "",
    numero: "",
    concepto: "",
    categoria: CATEGORIAS[0],
    total: 0,
    iva: 21,
    justificante: null,
    creado: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------ trimestres */

/** Un trimestre: el año y el número, del 1 al 4. */
export type Trimestre = { ano: number; t: 1 | 2 | 3 | 4 };

export const trimestreDe = (fecha: string): Trimestre => ({
  ano: Number(fecha.slice(0, 4)),
  t: (Math.floor((Number(fecha.slice(5, 7)) - 1) / 3) + 1) as Trimestre["t"],
});

export const mismoTrimestre = (fecha: string, q: Trimestre) => {
  const x = trimestreDe(fecha);
  return x.ano === q.ano && x.t === q.t;
};

const MESES_T = ["enero a marzo", "abril a junio", "julio a septiembre", "octubre a diciembre"];
export const nombreTrimestre = (q: Trimestre) => `${q.t}.º trimestre de ${q.ano}`;
export const mesesTrimestre = (q: Trimestre) => MESES_T[q.t - 1];

/** El plazo para presentar el 303 y el 130 de cada trimestre: del 1 al 20 del
 *  mes siguiente, y el del cuarto hasta el 30 de enero. */
export const plazoTrimestre = (q: Trimestre) =>
  q.t === 4 ? `del 1 al 30 de enero de ${q.ano + 1}` : `del 1 al 20 de ${["abril", "julio", "octubre"][q.t - 1]}`;

export const anterior = (q: Trimestre): Trimestre => (q.t === 1 ? { ano: q.ano - 1, t: 4 } : { ano: q.ano, t: (q.t - 1) as Trimestre["t"] });
export const siguiente = (q: Trimestre): Trimestre => (q.t === 4 ? { ano: q.ano + 1, t: 1 } : { ano: q.ano, t: (q.t + 1) as Trimestre["t"] });

/** Las facturas que cuentan como ingreso: las emitidas. Un borrador no es una
 *  factura y una anulada no tiene efecto. */
export const cuentaComoIngreso = (f: Factura) => f.estado === "emitida";

export type Resumen = {
  ingresos: number;
  ivaRepercutido: number;
  gastos: number;
  ivaSoportado: number;
  /** Repercutido menos soportado. Positivo: sale a ingresar. Negativo: a favor. */
  iva: number;
  /** Ingresos menos gastos, sin IVA. */
  rendimiento: number;
  nFacturas: number;
  nGastos: number;
  sinTique: number;
};

/** Las cuentas de un tramo: un trimestre, o todo el año hasta ese trimestre. */
export function resumen(facturas: Factura[], gastos: Gasto[], entra: (fecha: string) => boolean): Resumen {
  const fs = facturas.filter((f) => cuentaComoIngreso(f) && entra(f.fecha));
  const gs = gastos.filter((g) => entra(g.fecha));
  const ingresos = redondea(fs.reduce((s, f) => s + totales(f).base, 0));
  const ivaRepercutido = redondea(fs.reduce((s, f) => s + totales(f).cuota, 0));
  const gastosBase = redondea(gs.reduce((s, g) => s + desglose(g).base, 0));
  const ivaSoportado = redondea(gs.reduce((s, g) => s + desglose(g).cuota, 0));
  return {
    ingresos,
    ivaRepercutido,
    gastos: gastosBase,
    ivaSoportado,
    iva: redondea(ivaRepercutido - ivaSoportado),
    rendimiento: redondea(ingresos - gastosBase),
    nFacturas: fs.length,
    nGastos: gs.length,
    sinTique: gs.filter((g) => !g.justificante).length,
  };
}

/** Del 1 de enero hasta el final del trimestre: lo que mira el modelo 130. */
export const hastaTrimestre = (q: Trimestre) => (fecha: string) => {
  const x = trimestreDe(fecha);
  return x.ano === q.ano && x.t <= q.t;
};

/* ------------------------------------------------------------ el almacén */

const LS_GASTOS = "es33.gastos.v1";

function leeLocal(): Gasto[] {
  const crudo = localStorage.getItem(LS_GASTOS);
  try {
    const v = JSON.parse(crudo || "[]");
    return Array.isArray(v) ? (v as Gasto[]) : [];
  } catch {
    return [];
  }
}

function escribeLocal(lista: Gasto[]) {
  /* Aquí NO se traga el fallo: si el navegador no deja guardar, la pantalla
     tiene que decirlo y no enseñar el gasto como apuntado. */
  localStorage.setItem(LS_GASTOS, JSON.stringify(lista));
}

const porFecha = (a: Gasto, b: Gasto) => b.fecha.localeCompare(a.fecha) || b.creado.localeCompare(a.creado);

const enLaNube = hayFirebase();

/** ¿Se pueden subir tiques? Sólo con el almacén de la nube. */
export const admiteTiques = enLaNube;

export const gastos = {
  async listar(): Promise<Gasto[]> {
    if (!enLaNube) return leeLocal().sort(porFecha);
    const b = nube();
    if (!b) return [];
    const r = await getDocs(collection(b, "gastos"));
    return r.docs.map((d) => ({ ...(d.data() as Gasto), id: d.id })).sort(porFecha);
  },

  async guardar(g: Gasto): Promise<Gasto> {
    const limpio: Gasto = { ...g, total: redondea(Number(g.total) || 0), proveedor: g.proveedor.trim(), concepto: g.concepto.trim() };
    if (!enLaNube) {
      const lista = leeLocal();
      const i = lista.findIndex((x) => x.id === limpio.id);
      if (i === -1) lista.push(limpio);
      else lista[i] = limpio;
      escribeLocal(lista);
      return limpio;
    }
    const b = nube();
    if (!b) throw new Error("La plataforma no está conectada a Firebase.");
    await setDoc(doc(b, "gastos", limpio.id), limpio);
    return limpio;
  },

  async borrar(g: Gasto): Promise<void> {
    if (!enLaNube) {
      escribeLocal(leeLocal().filter((x) => x.id !== g.id));
      return;
    }
    const b = nube();
    if (!b) throw new Error("La plataforma no está conectada a Firebase.");
    await deleteDoc(doc(b, "gastos", g.id));
    if (g.justificante) await quitaTique(g.justificante);
  },
};

/** El tope de un tique. Una foto de móvil pesa 3 o 4 MB; un PDF, menos. */
const TOPE = 10 * 1024 * 1024;

/** Sube la foto o el PDF del tique y devuelve su ficha. No guarda el gasto:
 *  eso lo hace `gastos.guardar`, cuando Iris pulsa guardar. */
export async function subeTique(gastoId: string, f: File): Promise<Justificante> {
  const a = almacen();
  if (!a) throw new Error("Los tiques sólo se pueden subir con la plataforma conectada a la nube.");
  if (f.size > TOPE) throw new Error("Ese archivo pesa más de 10 MB. Haz la foto con menos calidad o pásalo a PDF.");
  if (!/^image\/|^application\/pdf$/.test(f.type)) throw new Error("El tique tiene que ser una foto o un PDF.");
  const punto = f.name.lastIndexOf(".");
  const ext = punto > 0 ? f.name.slice(punto + 1).toLowerCase() : f.type === "application/pdf" ? "pdf" : "jpg";
  const ruta = `justificantes/${gastoId}-${nuevoId()}.${ext}`;
  const r = ref(a, ruta);
  await uploadBytes(r, f, { contentType: f.type });
  return { ruta, url: await getDownloadURL(r), nombre: f.name, tipo: f.type };
}

export async function quitaTique(j: Justificante): Promise<void> {
  const a = almacen();
  if (!a) return;
  try {
    await deleteObject(ref(a, j.ruta));
  } catch {
    /* Si ya no estaba, no hay nada que quitar. */
  }
}
