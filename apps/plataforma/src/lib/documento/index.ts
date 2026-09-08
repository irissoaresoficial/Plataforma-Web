/**
 * EL DOCUMENTO EN TRES IDIOMAS
 *
 * Iris hace el estudio en español y lo manda por correo. Si quien lo recibe es
 * de Lisboa o de Londres, hasta ahora abría un PDF en español. Aquí se elige en
 * qué idioma sale ESE documento; la plataforma sigue entera en español, que es
 * como trabaja ella.
 *
 * La regla de oro es que el español no se puede caer. Cada idioma se monta
 * encima del español: lo que la traducción no traiga, se sirve en español antes
 * que dejar un hueco. Un documento con una línea en el idioma que no toca es un
 * problema; un documento con un hueco en blanco es un documento que no se puede
 * mandar.
 */
import type { Ficha } from "../engine";
import { ES } from "./es";
import { PT } from "./pt";
import { EN } from "./en";
import type { ConGenero, Diccionario, Idioma } from "./tipos";

export type { ConGenero, Diccionario, Idioma, CopiaEstudio, CopiaHoja } from "./tipos";
export { ES } from "./es";

/** Sin traducir: el idioma se elige por su nombre, no por el nuestro. Es lo
 *  único de la plataforma que no va en español, y a propósito. */
export const IDIOMAS: Array<{ codigo: Idioma; etiqueta: string }> = [
  { codigo: "es", etiqueta: "Español" },
  { codigo: "pt", etiqueta: "Português" },
  { codigo: "en", etiqueta: "English" },
];

/** Cómo se llama cada idioma cuando hay que decirlo dentro de una frase en
 *  español —«sale en portugués»—, que eso sí es interfaz. */
export const EN_ESPANOL: Record<Idioma, string> = { es: "español", pt: "portugués", en: "inglés" };

/** Una cadena vacía es un hueco, no una traducción: se descarta para que el
 *  español de debajo asome. Se declara como `T` y no como `Partial<T>` porque
 *  lo que sale de aquí siempre se funde encima de un diccionario completo. */
function conValor<T extends object>(o: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (typeof v !== "string" || v.trim()) out[k] = v;
  return out as T;
}

/** Funde dos tablas indexadas por número respetando el campo suelto: si el
 *  portugués trae el nombre de un arcano pero no su lema, el lema sale en
 *  español y el nombre en portugués, no la ficha entera en español. */
function funde<T extends Record<string, unknown>>(base: Record<number, T>, encima: Record<number, T>): Record<number, T> {
  const out: Record<number, T> = { ...base };
  for (const [k, v] of Object.entries(encima)) {
    const n = Number(k);
    out[n] = { ...(base[n] || ({} as T)), ...conValor(v) } as T;
  }
  return out;
}

function mezcla(otro: Diccionario): Diccionario {
  return {
    codigo: otro.codigo,
    locale: otro.locale,
    hoja: { ...ES.hoja, ...conValor(otro.hoja) },
    estudio: { ...ES.estudio, ...conValor(otro.estudio) },
    arcanos: funde(ES.arcanos, otro.arcanos),
    numerologia: funde(ES.numerologia, otro.numerologia),
    estructuras: { ...ES.estructuras, ...conValor(otro.estructuras) },
    tareas: funde(ES.tareas, otro.tareas),
    planos: funde(ES.planos, otro.planos),
    ciclos: { ...ES.ciclos, ...conValor(otro.ciclos) },
    turbulencias: { ...ES.turbulencias, ...conValor(otro.turbulencias) },
    /* LOS NÚMEROS NO CAEN AL ESPAÑOL, y es la única excepción.
     * Son párrafos enteros de los apuntes, y un párrafo en español en mitad de
     * una hoja portuguesa se lee como un descuido. Sin él la frase sigue
     * entera —«La cuenta que vienes a saldar es el 62.»—, que es lo que ya
     * pasa hoy con los números que no figuran en los apuntes. */
    numeros: otro.numeros,
  };
}

const DICCIONARIOS: Record<Idioma, Diccionario> = { es: ES, pt: mezcla(PT), en: mezcla(EN) };

export function diccionario(idioma: Idioma | undefined | null): Diccionario {
  return (idioma && DICCIONARIOS[idioma]) || ES;
}

/** Mete los datos en los huecos de una frase: `{edad}`, `{n}`, `{lista}`. Lo
 *  que no se le pase se queda como está, que canta y se ve. */
export function rellena(plantilla: string, datos: Record<string, string | number>): string {
  return String(plantilla || "").replace(/\{(\w+)\}/g, (m, k: string) => (k in datos ? String(datos[k]) : m));
}

/**
 * La frase que le toca a quien lee, según cómo quiera que se le hable.
 *
 * Un idioma sin género escribe una sola cadena y la recibe entera, sin tener
 * que fingir tres formas iguales. El neutro no es una terminación más: es una
 * vuelta a la frase que no la necesita, y si un idioma no la trae se usa el
 * femenino —que es lo que hacía el estudio antes de que esto existiera—.
 */
export function segunGenero(v: ConGenero | undefined, genero: string | undefined): string {
  if (typeof v === "string") return v;
  if (!v) return "";
  return genero === "m" ? v.m : genero === "n" ? v.n ?? v.f : v.f;
}

/**
 * Lo que dicen las cifras de un número, en el idioma del documento. Misma
 * cuenta que hace el motor —cifra a cifra, sin repetir— pero leyendo la tabla
 * traducida.
 */
export function lecturaDe(d: Diccionario, n: number): { positivo: string; negativo: string } {
  const vistos = new Set<number>();
  const pos: string[] = [];
  const neg: string[] = [];
  for (const c of String(n)) {
    const cifra = Number(c);
    if (Number.isNaN(cifra) || vistos.has(cifra)) continue;
    vistos.add(cifra);
    const t = d.numerologia[cifra];
    if (t) {
      pos.push(t.pos);
      neg.push(t.neg);
    }
  }
  return { positivo: pos.join(" "), negativo: neg.join(" ") };
}

/**
 * El texto de un número de los apuntes. Si el número no figura entero —pasa
 * con casi todos los de tres cifras— el manual lo lee por sus partes, y la hoja
 * se queda con la primera. Es exactamente lo que hacía antes en español.
 */
export function textoDeNumero(d: Diccionario, f: Ficha | null | undefined): string {
  if (!f) return "";
  const propio = d.numeros[f.n];
  if (propio) return propio;
  const parte = f.partes?.[0];
  return parte ? d.numeros[parte.n] || "" : "";
}
