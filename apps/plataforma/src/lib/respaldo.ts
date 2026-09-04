/**
 * Guardar y traer los estudios en un fichero.
 *
 * La plataforma no tiene servidor: todo vive en el `localStorage` de este
 * navegador. Hasta que lo tenga, esto es lo único que separa el trabajo de
 * Iris de perderse el día que borre los datos del navegador o cambie de
 * ordenador. No es un extra: es la única copia que existe.
 *
 * El formato del fichero vive en `@iris/datos`, compartido con la web, porque
 * es también el formato con el que los estudios se mudarán a la base de datos:
 * el día de la mudanza se lee un respaldo y se escribe, sin traducir nada.
 */

import { creaRespaldo, leeRespaldo, fusiona, nombreDeRespaldo, type Fusion } from '@iris/datos';
import { cargaEdits, cargaHistorial, guardaEdits, guardaHistorial, type Edits, type HistItem } from './storage';

/**
 * Baja un fichero con todo lo que hay en este navegador.
 *
 * Se lee del almacenamiento y no del estado de React a propósito: lo que
 * importa salvar es lo que está guardado de verdad, no lo que se esté viendo
 * en pantalla en este momento.
 */
export function descargaRespaldo(): { estudios: number; nombre: string } {
  const estudios = cargaHistorial();
  const respaldo = creaRespaldo(estudios, cargaEdits());
  const nombre = nombreDeRespaldo();

  const url = URL.createObjectURL(new Blob([JSON.stringify(respaldo, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Sin esto el navegador se queda el fichero entero en memoria hasta que se
  // recargue la página.
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { estudios: estudios.length, nombre };
}

export type ResultadoImportar =
  | { ok: true; fusion: Fusion; estudios: HistItem[]; correcciones: Edits; mensaje: string }
  | { ok: false; mensaje: string };

/**
 * Mete en este navegador lo que traiga un fichero de copia.
 *
 * No sustituye: funde. Traer una copia de hace un mes no puede borrar los
 * estudios de esta semana, y si el fichero no es válido no se toca nada.
 */
export function importaRespaldo(texto: string): ResultadoImportar {
  const lectura = leeRespaldo(texto);
  if (!lectura.ok) return { ok: false, mensaje: lectura.motivo };

  const aqui = { estudios: cargaHistorial(), correcciones: cargaEdits() };
  const fusion = fusiona(aqui, {
    estudios: lectura.respaldo.estudios,
    correcciones: lectura.respaldo.correcciones,
  });

  guardaHistorial(fusion.estudios as HistItem[]);
  guardaEdits(fusion.correcciones as Edits);

  return {
    ok: true,
    fusion,
    estudios: fusion.estudios as HistItem[],
    correcciones: fusion.correcciones as Edits,
    mensaje: mensajeDe(fusion),
  };
}

/** Lo que se le dice a Iris después de traer un fichero, en cristiano. */
function mensajeDe(f: Fusion): string {
  if (f.nuevos === 0 && f.repetidos === 0) return 'La copia no traía ningún estudio.';
  if (f.nuevos === 0) return `Todos los estudios de la copia ya estaban aquí. No ha cambiado nada.`;
  const nuevos = f.nuevos === 1 ? 'Se ha añadido 1 estudio' : `Se han añadido ${f.nuevos} estudios`;
  const yaEstaban = f.repetidos === 0 ? '' : f.repetidos === 1 ? ', y 1 ya estaba' : `, y ${f.repetidos} ya estaban`;
  return `${nuevos}${yaEstaban}. No se ha borrado nada de lo que había.`;
}

/** Lee el fichero que se elige en el diálogo del sistema. */
export function leeFichero(fichero: File): Promise<string> {
  return fichero.text();
}
