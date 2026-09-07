/**
 * QUIÉN FACTURA — Y AHORA SE ESCRIBE DESDE LA PANTALLA, NO DESDE EL CÓDIGO
 *
 * En España una factura sin el nombre o razón social, el NIF y el domicilio de
 * quien la emite no es una factura: es un papel. Mientras falte cualquiera de
 * los tres:
 *
 *   · se pueden guardar borradores, que no son documentos;
 *   · pero NO se puede emitir una factura definitiva;
 *   · y el hueco sale marcado en la pantalla, para que se vea qué falta.
 *
 * POR QUÉ ESTO YA NO ES UNA CONSTANTE
 * ---------------------------------------------------------------------------
 * Estaban escritos aquí a mano, y la pantalla decía —con la ruta del archivo a
 * la vista— «se escriben en un solo sitio: src/lib/despacho/emisor.ts». Es
 * decir: para que Iris pudiera emitir su primera factura hacía falta que
 * alguien abriera el código, escribiera su NIF, y volviera a desplegar. La
 * plataforma le estaba pidiendo a una numeróloga que editara un archivo de
 * TypeScript, y hasta que alguien lo hiciera no podía cobrar.
 *
 * Ahora se guardan como cualquier otro dato suyo y se escriben desde la
 * pantalla. Lo que NO cambia es la regla: sin los tres, no se emite. Eso no era
 * una limitación técnica, es la ley.
 *
 * DÓNDE SE GUARDAN. En `ajustes/emisor` de Firestore si hay nube, y en el
 * navegador si no — la misma pareja que el resto del despacho. Con una
 * diferencia importante que está explicada abajo, en `cargaEmisor`.
 *
 * POR QUÉ SIGUE HABIENDO UN OBJETO `EMISOR` EXPORTADO. Porque media docena de
 * sitios lo leen de forma síncrona, y el más delicado es el que congela los
 * datos dentro de una factura al emitirla. Convertir todo eso en asíncrono
 * repartiría el «espera a que carguen los datos» por seis archivos, y en el
 * primero que se olvidara saldría una factura con el NIF vacío — con número
 * puesto y sin poder borrarla. Así que el objeto se queda, y lo que se hace es
 * RELLENARLO al arrancar: quien lo lea después lo lee ya cargado.
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { nube } from "@/lib/firebase";
import type { DatosFiscales } from "./tipos";

/** Lo que todavía no tiene valor de verdad. La misma palabra que usa la web. */
export const PENDIENTE = "PENDIENTE";

const LS_EMISOR = "es33.emisor.v1";

/**
 * LOS DATOS FISCALES DE IRIS.
 *
 * No se escriben aquí: se rellenan solos al arrancar con lo que haya guardado.
 * Es un objeto que se muta a propósito —ver la cabecera— y por eso lo que se
 * exporta es la misma referencia siempre.
 */
export const EMISOR: DatosFiscales = {
  nombre: PENDIENTE,
  nif: PENDIENTE,
  direccion: PENDIENTE,
};

/** Un dato que no está puesto: pendiente, vacío o sin definir. */
export const falta = (v: unknown) => v === PENDIENTE || v === null || v === "" || v === undefined;

/** Cómo se llama cada hueco cuando hay que decírselo a Iris. */
const NOMBRES: Array<{ campo: keyof DatosFiscales; etiqueta: string }> = [
  { campo: "nombre", etiqueta: "Nombre o razón social" },
  { campo: "nif", etiqueta: "NIF" },
  { campo: "direccion", etiqueta: "Domicilio fiscal" },
];

/** Qué falta del emisor, con el nombre que entiende quien lo lee. */
export function faltaDelEmisor(e: DatosFiscales = EMISOR): string[] {
  return NOMBRES.filter(({ campo }) => falta(e[campo])).map(({ etiqueta }) => etiqueta);
}

/** ¿Se puede emitir una factura definitiva? Sólo si no falta ninguno. */
export function emisorCompleto(e: DatosFiscales = EMISOR): boolean {
  return faltaDelEmisor(e).length === 0;
}

/** Deja el objeto compartido exactamente igual a lo que se le pase. */
function rellena(d: Partial<DatosFiscales>) {
  EMISOR.nombre = (d.nombre || "").trim() || PENDIENTE;
  EMISOR.nif = (d.nif || "").trim() || PENDIENTE;
  EMISOR.direccion = (d.direccion || "").trim() || PENDIENTE;
}

let cargado = false;

/**
 * Trae los datos guardados y rellena `EMISOR`. Devuelve una copia.
 *
 * EL NAVEGADOR ES EL RESPALDO, NO LA COPIA BUENA. Se escribe también en local
 * cada vez que se lee de la nube, y no es por rendimiento: es porque el botón
 * de emitir se apaga si los datos no están, y una factura que no se puede
 * emitir porque la red va lenta es una factura que no se cobra hoy. Con el
 * respaldo, la pantalla arranca con lo último que sabía y la nube la corrige un
 * segundo después.
 *
 * La nube manda siempre que conteste. El local sólo habla cuando la nube calla.
 */
export async function cargaEmisor(): Promise<DatosFiscales> {
  const local = leeLocal();
  if (local) rellena(local);

  const base = nube();
  if (base) {
    try {
      const d = await getDoc(doc(base, "ajustes", "emisor"));
      if (d.exists()) {
        const datos = d.data() as Partial<DatosFiscales>;
        rellena(datos);
        escribeLocal(EMISOR);
      }
    } catch {
      /* Sin red se sigue con el respaldo. Que no haya nube no puede impedir
         mirar una factura que ya está hecha. */
    }
  }
  cargado = true;
  return { ...EMISOR };
}

/** ¿Ya se ha intentado cargar? La pantalla lo usa para no enseñar «faltan tus
 *  datos» durante el segundo que tarda en llegar la respuesta: acusar a alguien
 *  de no haber rellenado algo que sí rellenó es la peor forma de saludar. */
export const emisorCargado = () => cargado;

/**
 * Guarda los datos fiscales. Lanza si no se puede guardar en la nube teniéndola:
 * aquí el silencio es peligroso. Si Iris escribe su NIF, ve que se guarda, y no
 * se ha guardado, la próxima factura sale sin él.
 */
export async function guardaEmisor(d: DatosFiscales): Promise<void> {
  rellena(d);
  escribeLocal(EMISOR);
  const base = nube();
  if (!base) return;
  await setDoc(doc(base, "ajustes", "emisor"), { ...EMISOR }, { merge: true });
}

function leeLocal(): DatosFiscales | null {
  try {
    const v = JSON.parse(localStorage.getItem(LS_EMISOR) || "null");
    return v && typeof v === "object" ? (v as DatosFiscales) : null;
  } catch {
    return null;
  }
}

function escribeLocal(d: DatosFiscales) {
  try {
    localStorage.setItem(LS_EMISOR, JSON.stringify(d));
  } catch {
    /* navegación privada, almacenamiento lleno */
  }
}
