'use client';

/**
 * EL BLOQUE ANCLADO
 *
 * Una sección que se queda quieta en pantalla mientras se sigue bajando, y por
 * dentro va cambiando lo que enseña. Es el recurso que más separa una web cara
 * de una normal: el contenido deja de pasar por delante y pasa a estar
 * ocurriendo.
 *
 * Aquí lo usa el bloque del dolor —«cambias de trabajo y a los seis meses te
 * sientes igual»— que es el mejor texto que tiene la web y que hoy pasa como
 * una lista más. Anclado, cada frase se lee sola, que es como pegan.
 *
 * CÓMO FUNCIONA. La caja de fuera es alta: tantas pantallas como frases haya.
 * Dentro va una capa pegada al alto de la ventana. Al bajar, lo que avanza no
 * es la página dentro de la caja sino el índice de la frase que toca, sacado
 * de cuánto se lleva recorrido.
 *
 * EN EL MÓVIL NO SE ANCLA. Un bloque pegado en un teléfono se pelea con la
 * barra del navegador, que aparece y desaparece al bajar, y el resultado es un
 * salto en cada gesto. Por debajo de 900 px las frases se apilan y ya está: se
 * leen igual de bien y el desplazamiento no sufre.
 */

import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { CURVA, useProgreso } from './movimiento';

export default function Anclado({
  rotulo,
  lineas,
  cierre,
}: {
  rotulo: string;
  /** Las frases que se van enseñando, una por pantalla. */
  lineas: string[];
  /** La frase que remata, ya sin anclar. */
  cierre?: string;
}) {
  const quieto = useReducedMotion();
  const caja = useRef<HTMLDivElement>(null);
  const progreso = useProgreso(caja, ['start start', 'end end']);

  // De 0 a 1 repartido entre las frases. Se deja media frase de margen al
  // final para que la última no desaparezca justo al soltarse el anclaje.
  const indice = useTransform(progreso, (p) => Math.min(lineas.length - 1, Math.floor(p * lineas.length * 0.96)));

  return (
    /*
     * La caja alta y el cierre son HERMANOS, no padre e hijo.
     *
     * Con el cierre dentro de la caja alta pasaba esto: la capa pegada ocupa
     * una pantalla, el cierre venía justo detrás, y el resto del alto de la
     * caja —dos pantallas y media— se quedaba vacío debajo. En pantalla era
     * una frase suelta en mitad de un desierto de color arena.
     */
    <div className="arena">
      <div className="anclado-fuera" ref={caja} style={{ ['--anclado-n' as string]: lineas.length }}>
        <div className="anclado-dentro">
          <div className="banda-dentro anclado-caja">
            <span className="rotulo">{rotulo}</span>

            <div className="anclado-frases">
              {lineas.map((linea, i) => (
                <Frase key={i} texto={linea} i={i} indice={indice} total={lineas.length} quieto={!!quieto} />
              ))}
            </div>

            {/* El carril de la izquierda dice por dónde va. Sin él, un bloque que
              no se mueve mientras la rueda gira parece que se ha quedado
              colgado. */}
            <div className="anclado-carril" aria-hidden>
              {lineas.map((_, i) => (
                <Marca key={i} i={i} indice={indice} quieto={!!quieto} />
            ))}
            </div>
          </div>
        </div>
      </div>

      {cierre && (
        <div className="anclado-cierre banda-dentro">
          <motion.p
            initial={quieto ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ duration: 0.8, ease: CURVA }}
          >
            {cierre}
          </motion.p>
        </div>
      )}
    </div>
  );
}

/** Una frase. La de turno se ve entera; las demás se apagan sin irse del todo,
 *  para que se entienda que hay una lista y no una sola frase que cambia. */
function Frase({
  texto,
  i,
  indice,
  total,
  quieto,
}: {
  texto: string;
  i: number;
  indice: ReturnType<typeof useTransform<number, number>>;
  total: number;
  quieto: boolean;
}) {
  /*
   * Ancladas, las cuatro frases ocupan la MISMA celda. Dejar las apagadas a
   * 0,16 parecía buena idea —«que se vea que hay una lista»— y en pantalla era
   * un borrón de cuatro frases encima de otra, como una hoja mal impresa.
   * Sólo se ve la de turno; que hay cuatro lo dicen el carril y el «03 / 04».
   */
  const opacidad = useTransform(indice, (n) => (n === i ? 1 : 0));
  const y = useTransform(indice, (n) => (n === i ? 0 : n > i ? -16 : 16));

  if (quieto) {
    return <p className="anclado-frase" style={{ opacity: i === 0 ? 1 : 0.5 }}>{texto}</p>;
  }

  return (
    <motion.p
      className="anclado-frase"
      style={{ opacity: opacidad, y, willChange: 'transform, opacity' }}
      transition={{ duration: 0.5, ease: CURVA }}
    >
      <span className="anclado-num" aria-hidden>
        {String(i + 1).padStart(2, '0')} <span className="anclado-de">/ {String(total).padStart(2, '0')}</span>
      </span>
      {texto}
    </motion.p>
  );
}

function Marca({ i, indice, quieto }: { i: number; indice: ReturnType<typeof useTransform<number, number>>; quieto: boolean }) {
  const alto = useTransform(indice, (n) => (n >= i ? '100%' : '0%'));
  return (
    <span className="anclado-marca">
      <motion.span style={quieto ? { height: i === 0 ? '100%' : '0%' } : { height: alto }} />
    </span>
  );
}
