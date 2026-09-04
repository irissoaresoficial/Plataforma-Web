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
