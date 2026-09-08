// Diccionario de datos — Escuela de Sabiduría 33
// Extraído literalmente de los manuales de Kábala aportados por la usuaria.
import raw from "@/data/kdata.json";
import caminoEvolutivo from "@/data/caminoEvolutivo.json";
import tensiones from "@/data/tensiones.json";

export type NumeroFicha = {
  n: number;
  titulo: string;
  texto: string;
  atlante?: string;
  refs?: { T?: number; L?: number; C?: number; P?: number; R?: number };
};

export type ArcanoData = {
  num: number;
  nombre: string;
  lema: string;
  texto: string;
  pareja?: string;
};

export type KData = {
  numeros: Record<string, NumeroFicha>;
  principios: Record<string, unknown>;
  arcanos: Record<string, ArcanoData>;
  estructuras: Record<string, { texto: string; negativo: string; positivo: string }>;
  tareas: Record<string, { nombre: string; texto: string; hiloRojo: string; neurosis: string; sanador: string }>;
  enfermedades: Record<string, { psico?: string; organos?: string; fisicas?: string; nota?: string }>;
  planos_conciencia: { planos: Record<string, { nombre: string; texto: string }> };
  ciclos: {
    ciclos: Record<string, string>;
    realizaciones: Record<string, string>;
    desafios: Record<string, string>;
    anioPersonal: Record<string, string>;
    etapas9: Record<string, string>;
  };
  letras: Record<string, number>;
  numerologia: Record<string, { pos: string; neg: string }>;
  ejes: Array<{ nombre: string; a: number; b: number }>;
  planosTension: Array<{ nombre: string; a: number; b: number }>;
  caminosComplementarios: Record<string, number[]>;
  parejas: {
    cuentas: { mismaCuenta: string; mismoPotencial: string; cruzado: string; afinidad: string };
    estructuras: { iguales: string; distintas: string };
    portales?: Record<string, string>;
    planos?: Record<string, string>;
    combinaciones?: Record<string, string>;
  };
};

export const KDATA = raw as unknown as KData;

export type CaminoEvolutivoEntry = { nombre: string; sendero: string; texto: string };
export const CAMINO_EVOLUTIVO = caminoEvolutivo as unknown as Record<string, CaminoEvolutivoEntry>;

/** Explicaciones de los ejes y planos de tensión (manual de estructura
 *  energética, §20 y §21). Se indexan por "a-b", p. ej. "2-7". */
export type TensionEntry = { nombre: string; texto: string; tension?: string };
export type Tensiones = {
  intro: { ejes: string; planos: string };
  ejes: Record<string, TensionEntry>;
  planos: Record<string, TensionEntry>;
};
export const TENSIONES = tensiones as unknown as Tensiones;

/* ==========================================================================
   LOS APUNTES EN OTROS IDIOMAS
   ==========================================================================

   Iris entrega el estudio a gente de Portugal y de habla inglesa. Los apuntes
   traducidos viven en `kdata.pt.json` / `kdata.en.json` y compañía, con la
   misma forma exacta que el español.

   POR QUÉ SE CARGAN A PETICIÓN Y NO CON UN `import` NORMAL, que sería más
   corto de escribir: el diccionario pesa 292 KB por idioma. Importándolos
   arriba, los tres viajarían en el paquete que descarga CUALQUIERA que abra la
   plataforma —para mirar la agenda, para cobrar una factura—, casi un mega de
   apuntes de Kábala que en ese momento no va a leer nadie. Con `import()`
   dinámico, el portugués sólo se descarga la primera vez que alguien pide un
   documento en portugués, y el español sigue estando desde el primer momento.

   Y SI FALLA LA DESCARGA, se devuelve el español. Es la misma regla que en
   `lib/documento`: la salida siempre es un documento, nunca un hueco.
   ========================================================================== */

export type Apuntes = { kdata: KData; camino: Record<string, CaminoEvolutivoEntry>; tensiones: Tensiones };

const EN_ESPANOL: Apuntes = { kdata: KDATA, camino: CAMINO_EVOLUTIVO, tensiones: TENSIONES };

/* Una vez descargado un idioma se queda: cambiar de portugués a inglés y
   volver no vuelve a pedir nada a la red. */
const cargados = new Map<string, Apuntes>([["es", EN_ESPANOL]]);

export function apuntesYaCargados(lang: string): Apuntes | null {
  return cargados.get(lang) ?? null;
}

export async function cargaApuntes(lang: string): Promise<Apuntes> {
  const ya = cargados.get(lang);
  if (ya) return ya;
  try {
    /* Los tres se piden a la vez y no uno detrás de otro: son tres archivos
       independientes y en serie serían tres viajes encadenados por nada. */
    const [k, c, t] = await Promise.all([
      lang === "pt" ? import("@/data/kdata.pt.json") : import("@/data/kdata.en.json"),
      lang === "pt" ? import("@/data/caminoEvolutivo.pt.json") : import("@/data/caminoEvolutivo.en.json"),
      lang === "pt" ? import("@/data/tensiones.pt.json") : import("@/data/tensiones.en.json"),
    ]);
    const ap: Apuntes = {
      kdata: (k.default ?? k) as unknown as KData,
      camino: (c.default ?? c) as unknown as Record<string, CaminoEvolutivoEntry>,
      tensiones: (t.default ?? t) as unknown as Tensiones,
    };
    cargados.set(lang, ap);
    return ap;
  } catch {
    /* Sin red, o un archivo que no está: el documento sale en español. Peor
       sería una pantalla en blanco o un estudio a medias. */
    return EN_ESPANOL;
  }
}
