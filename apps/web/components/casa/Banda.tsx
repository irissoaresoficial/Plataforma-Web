/**
 * LA FRANJA DE DOS COLUMNAS.
 * ============================================================================
 *
 * Es la tercera forma de la casa, después de la entrada a pantalla completa y
 * del bloque crema. Lo que se cuenta a la izquierda; lo que lo demuestra a la
 * derecha. Es el reparto de la estantería de cursos y el del bloque de Iris,
 * y aquí queda suelto para que lo usen numerología y kábala.
 *
 * Gerson, el 18 de octubre: «el mismo diseño que tenemos en la home adaptado a
 * la comunicación del apartado». Para que eso sea verdad y no una imitación,
 * las páginas no pintan franjas: piden una.
 *
 * LOS TONOS SON LOS DE LA CASA, NO UNOS NUEVOS. `claro`, `arena` y `vino` ya
 * existen en globals.css y lo que hacen es cambiar los tokens de color de todo
 * lo que llevan dentro. Por eso una franja en granate deja bien a lo que se le
 * meta —la calculadora, el árbol—: lo de dentro lee los mismos tokens y se
 * entera solo de que ahora está sobre oscuro.
 *
 * APILADO. Con `apilado`, el texto va arriba y lo de abajo ocupa el ancho
 * entero. Es para las piezas que no caben en media franja: la calculadora, que
 * ya es de dos columnas por dentro, y el árbol de la vida.
 *
 * Y EL TITULAR ES OPCIONAL, que es menos raro de lo que parece. Hay piezas que
 * ya traen el suyo —la calculadora abre con «Antes de cambiar nada, hay que
 * saber qué traes»— y ponerle otro encima deja dos titulares pisándose, que es
 * el fallo que más veces ha habido que arreglar en esta web. Cuando la pieza
 * ya habla, la franja se calla y se queda en lo que es: el color, los márgenes
 * y el sitio.
 *
 * NO LLEVA 'use client' A PROPÓSITO. Aquí no hay ni un estado ni un escucha:
 * es una caja. Dejándola de servidor, las páginas que sólo usan esto no mandan
 * ni un byte de JavaScript de más.
 */

import type { ReactNode } from 'react';

export default function Banda({
  id,
  tono = 'claro',
  rotulo,
  titulo,
  texto,
  nota,
  apilado = false,
  children,
}: {
  id?: string;
  tono?: 'claro' | 'arena' | 'vino';
  /** La línea pequeña en versalitas de encima del titular. Opcional. */
  rotulo?: string;
  /** Opcional: sin él no se pinta la columna de texto (ver arriba). */
  titulo?: ReactNode;
  /** El párrafo que explica el titular. Puede ser uno o varios. */
  texto?: ReactNode;
  /** La letra pequeña del final de la columna. Opcional. */
  nota?: ReactNode;
  apilado?: boolean;
  children?: ReactNode;
}) {
  /* El `id` del titular se saca del de la franja para que `aria-labelledby`
     apunte a algo de verdad. Sin titular no se pone ninguno de los dos: un
     `aria-labelledby` que apunta al vacío es peor que no ponerlo. */
  const hid = titulo && id ? `${id}-h` : undefined;
  const hayTexto = Boolean(rotulo || titulo || texto || nota);

  return (
    <section
      className={`casa-banda ${tono}${apilado || !hayTexto ? ' casa-banda-apilada' : ''}`}
      id={id}
      aria-labelledby={hid}
    >
      <div className="casa-banda-dentro">
        {hayTexto && (
          <div className="casa-banda-texto">
            {rotulo && <span className="casa-banda-rotulo">{rotulo}</span>}
            {titulo && (
              <h2 className="casa-banda-h" id={hid}>
                {titulo}
              </h2>
            )}
            {texto && <div className="casa-banda-p">{texto}</div>}
            {nota && <p className="casa-banda-nota">{nota}</p>}
          </div>
        )}

        {children && <div className="casa-banda-lado">{children}</div>}
      </div>
    </section>
  );
}
