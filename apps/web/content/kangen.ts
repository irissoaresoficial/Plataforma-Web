/**
 * ============================================================================
 * LA PRESENTACIÓN DEL EVENTO, DIAPOSITIVA A DIAPOSITIVA
 * ============================================================================
 *
 * ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA CAMBIAR EL CONTENIDO.
 * El diseño vive en `components/kangen`.
 *
 * DOS MARCAS EN EL TEXTO:
 *   · *palabra*   sale en el color del agua: lo que hay que recordar.
 *   · [texto]     sale en ROJO: algo que falta y no se inventa.
 *   · « / »       parte un titular en dos líneas.
 *
 * DE DÓNDE SALE CADA COSA. El orden es el de la nota de Iris y sus audios
 * del 6 de noviembre de 2026. El contenido, de los PDF de Mentoría que
 * descargó Gerson (1149, 1043, 1036, 1271 y 1073): las cifras van tal cual
 * vienen allí, y cada una dice de dónde sale. Los vídeos son los enlaces de
 * Vimeo de la plataforma Mentor6A23.
 *
 * TODA LA INFORMACIÓN DEL ORIGINAL. Gerson, el 7 de noviembre de 2026, al
 * ver la primera versión: «quiero la misma información, la misma cosa, deja
 * lo mismo (…) lo pones bonito con el branding». Cada PDF va diapositiva a
 * diapositiva en su archivo (kangen-1149.ts, kangen-1043.ts, kangen-1036.ts,
 * kangen-1271.ts, kangen-1073.ts), con su texto y sus cifras tal cual; sólo
 * se corrigen erratas. Cada diapositiva dice en un comentario de qué páginas
 * sale.
 *
 * Fuera quedan sólo dos cosas: el PDF del 1220, porque en la nota de Iris el
 * 1220 es el vídeo «Decide», y la tabla de pH y cáncer que sale en miniatura
 * dentro de la p. 44 del 1043: dice que el cáncer viene de una sangre ácida,
 * y eso no se publica.
 */

import { DIAPOS_1149 } from './kangen-1149';
import { DIAPOS_1043 } from './kangen-1043';
import { DIAPOS_1036 } from './kangen-1036';
import { DIAPOS_1271 } from './kangen-1271';
import { DIAPOS_1073 } from './kangen-1073';

type Tono = { tono?: 'oscuro' | 'claro' };

export type Diapo =
  | { tipo: 'portada'; rotulo: string; titulo: string; texto?: string }
  | { tipo: 'capitulo'; numero: string; titulo: string; texto?: string }
  | ({ tipo: 'frase'; rotulo?: string; titulo: string; texto?: string; fuente?: string; centrada?: boolean } & Tono)
  | ({ tipo: 'cifra'; rotulo?: string; valor: number; decimales?: number; prefijo?: string; sufijo?: string; titulo: string; texto?: string; fuente?: string } & Tono)
  | ({ tipo: 'cifras'; rotulo?: string; titulo: string; cifras: Array<{ valor: number; decimales?: number; prefijo?: string; sufijo?: string; texto: string }>; fuente?: string } & Tono)
  | ({ tipo: 'lista'; rotulo?: string; titulo: string; texto?: string; puntos: Array<{ titulo: string; texto?: string }>; pasos?: boolean } & Tono)
  | ({ tipo: 'imagen'; rotulo?: string; titulo?: string; texto?: string; src: string; alt: string } & Tono)
  | ({ tipo: 'linea'; rotulo?: string; titulo: string; hitos: Array<{ cuando: string; que: string; texto?: string }>; pie?: string } & Tono)
  | ({ tipo: 'barras'; rotulo?: string; titulo: string; texto?: string; barras: Array<{ etiqueta?: string; valor: number; destaca?: boolean }>; unidad?: string; fuente?: string } & Tono)
  | { tipo: 'foto'; src: string; alt: string; rotulo?: string; titulo: string; texto?: string; foco?: string }
  | ({ tipo: 'quiz'; rotulo?: string; titulo: string; opciones: string[]; correcta: number; texto?: string } & Tono)
  | { tipo: 'acertijo'; rotulo?: string; titulo: string; respuesta: string; texto?: string; src?: string; alt?: string }
  | { tipo: 'video'; rotulo: string; titulo: string; vimeo: string; clase: string }
  | { tipo: 'pregunta'; rotulo?: string; titulo: string; texto?: string };

export type Capitulo = { titulo: string; diapos: Diapo[] };

export const CAPITULOS: Capitulo[] = [
  /* ================================================================ INICIO */
  {
    titulo: 'Inicio',
    diapos: [
      {
        tipo: 'portada',
        rotulo: 'Mentor 6A23 · Evento',
        titulo: 'Formar parte / del *futuro*',
        texto: 'Lo que está cambiando en Europa, en el agua y en el trabajo. Y lo que puedes hacer tú.',
      },
    ],
  },

  /* ===================================================== 1 · LA PIRÁMIDE */
  { titulo: 'La mayor pirámide', diapos: DIAPOS_1149 },

  /* ============================================= 2 · EL MUNDO CAMBIA */
  {
    titulo: 'El mundo cambia',
    diapos: [
      {
        tipo: 'video',
        rotulo: 'Gotas de cambio · 16.5',
        titulo: 'El mundo está *cambiando*',
        vimeo: '1181636318',
        clase: 'Gotas 16.5 · El Mundo Está Cambiando Robots (1141)',
      },
      ...DIAPOS_1043,
    ],
  },

  /* ======================================== 3 · KANGEN Y EL MEDIO AMBIENTE */
  { titulo: 'El medio ambiente', diapos: DIAPOS_1036 },

  /* =================================================== 4 · EMPRENDER */
  {
    titulo: 'Emprender',
    diapos: [
      {
        tipo: 'video',
        rotulo: 'Gotas de cambio · 16.6',
        titulo: '*Emprendedores*',
        vimeo: '1181636386',
        clase: 'Gotas 16.6 · Emprendedores Antonio Banderas (1142)',
      },
      ...DIAPOS_1271,
    ],
  },

  /* ================================================== 5 · DISCIPLINA */
  {
    titulo: 'Disciplina',
    diapos: [
      {
        tipo: 'video',
        rotulo: 'Gotas de cambio · 7',
        titulo: '¿Y tú, estás *preparado*?',
        vimeo: '1181636489',
        clase: '¿Y Tú, Estás Preparado? (1143) · Gotas nº 7',
      },
      ...DIAPOS_1073,
    ],
  },

  /* ======================================================== 6 · JUAN */
  {
    titulo: 'Juan',
    diapos: [
      {
        tipo: 'frase',
        rotulo: '03 · Juan',
        titulo: '[Falta esta pieza]',
        texto: '[No aparece en Mentor6A23 con el nombre «Juan». Puede ser el homenaje a Juan Antonio Jorge. Iris tiene que decir cuál es.]',
      },
    ],
  },

  /* ====================================================== 7 · DECIDE */
  {
    titulo: 'Decide',
    diapos: [
      {
        tipo: 'video',
        rotulo: 'Gotas de cambio · 9',
        titulo: '*Decide*',
        vimeo: '1181674453',
        clase: 'Gotas 9 · Decide (1220)',
      },
      {
        tipo: 'video',
        rotulo: 'Gotas de cambio · 11',
        titulo: 'Inteligencia *artificial*',
        vimeo: '1181677054',
        clase: 'Gotas 11 · IA (1249)',
      },
    ],
  },

  /* ======================================================== CIERRE */
  {
    titulo: 'Cierre',
    diapos: [
      {
        tipo: 'pregunta',
        titulo: '¿Y aquí quién quiere / formar parte del *futuro*?',
      },
    ],
  },
];
