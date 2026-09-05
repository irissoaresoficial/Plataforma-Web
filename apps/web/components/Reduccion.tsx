'use client';

/**
 * LA REDUCCIÓN
 *
 * Una fecha que se va plegando hasta quedarse en un número.
 *
 *   14 · 3 · 1981  →  1+4+3+1+9+8+1  →  27  →  2+7  →  9
 *
 * Esto no es un adorno traído de otra web. Es literalmente lo que hace Iris:
 * reducir una fecha a su cifra. Cualquiera puede poner un contador que sube o
 * un texto que se desvanece; esta pieza sólo tiene sentido aquí, y por eso es
 * la que hace que la portada se lea como suya y no como una plantilla.
 *
 * Los maestros no se reducen. 11, 22 y 33 se paran ahí, y ésa es la regla de
 * la casa —la escuela se llama 33— así que la animación también se para.
 */

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { CURVA } from './movimiento';
import { pasosCaminoDeVida } from '@/lib/numerologia';

/** Los que no se reducen. */
const MAESTROS = new Set([11, 22, 33]);

/**
 * Los pasos, pedidos al motor de la casa.
 *
 * Esta función tuvo aquí su propia cuenta y sumaba todos los dígitos de golpe.
 * No es así como se calcula el camino de vida, y daba otro número que el resto
 * de la web en el 13,8 % de las fechas. Ahora no calcula nada: pregunta.
 */
export const pasosDe = (dia: number, mes: number, anio: number) => pasosCaminoDeVida(dia, mes, anio);

export default function Reduccion({
  dia,
  mes,
  anio,
  /** Milisegundos entre un paso y el siguiente. */
  ritmo = 780,
  className,
  alAcabar,
}: {
  dia: number;
  mes: number;
  anio: number;
  ritmo?: number;
  className?: string;
  /** Se llama cuando la cuenta ha llegado a su cifra. Lo usa quien envuelve
   *  esta pieza para no sacar lo que va después a mitad de la animación. */
  alAcabar?: () => void;
}) {
  const quieto = useReducedMotion();
  const caja = useRef<HTMLDivElement>(null);
  const dentro = useInView(caja, { once: true, margin: '0px 0px -20% 0px' });
  const pasos = pasosDe(dia, mes, anio);
  const [i, setI] = useState(0);

  /*
   * PRIMERO PIENSA, DESPUÉS CONTESTA.
   *
   * Antes la cuenta empezaba de golpe: pulsabas y ya estaba el primer paso ahí,
   * sin más. Un resultado instantáneo se lee como una tabla consultada; un
   * segundo de trabajo delante se lee como alguien haciendo la cuenta, que es
   * lo que la pieza tiene que transmitir — es literalmente lo que hace Iris con
   * quien se sienta enfrente.
   *
   * Es un segundo escaso, no una ruleta de las que dan vueltas cinco segundos
   * para fingir esfuerzo. Y con el movimiento reducido no hay espera ninguna.
   */
  const [pensando, setPensando] = useState(true);

  useEffect(() => {
    // Con el movimiento reducido no hay espera: el resultado y ya.
    if (quieto) {
      setPensando(false);
      return;
    }
    /* Y si el bloque todavía no ha entrado en pantalla, se sigue pensando: el
       reloj arranca cuando la persona lo está mirando. La primera versión
       apagaba aquí el «pensando» —«si no está dentro, fuera»— y como al montar
       nunca está dentro, se apagaba en el primer instante y no se veía jamás. */
    if (!dentro) return;
    const t = setTimeout(() => setPensando(false), 900);
    return () => clearTimeout(t);
  }, [dentro, quieto]);

  useEffect(() => {
    // Con el movimiento reducido no se recorre nada: se enseña el resultado,
    // que es lo que la pieza quiere decir.
    if (!dentro || quieto || pensando) return;
    if (i >= pasos.length - 1) return;
    const t = setTimeout(() => setI((n) => n + 1), ritmo);
    return () => clearTimeout(t);
  }, [dentro, quieto, pensando, i, pasos.length, ritmo]);

  const final = quieto || i >= pasos.length - 1;

  // Se avisa una sola vez, y en un efecto: llamar al padre durante el render
  // le pide a React que actualice mientras está pintando.
  const avisado = useRef(false);
  useEffect(() => {
    if (!final || avisado.current) return;
    if (!dentro && !quieto) return;
    avisado.current = true;
    alAcabar?.();
  }, [final, dentro, quieto, alAcabar]);

  const texto = quieto ? pasos[pasos.length - 1] : pasos[i];
  const numero = pasos[pasos.length - 1];
  const esMaestro = MAESTROS.has(Number(numero));

  return (
    <div ref={caja} className={`reduccion ${className ?? ''}`}>
      <span className="rotulo" style={{ color: 'var(--acento)' }}>
        {pensando ? 'Haciendo la cuenta' : esMaestro ? 'Un número maestro' : 'Una fecha, un número'}
      </span>

      <div className="reduccion-linea" aria-live="off">
        {pensando ? (
          /* Los tres puntos de «está pensando». Es el mismo gesto que usa el
             agente del chat antes de contestar, y a propósito: en toda la web,
             tres puntos quieren decir lo mismo. */
          <motion.span
            key="pensando"
            className="reduccion-pensando"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <span className="punto" />
            <span className="punto" />
            <span className="punto" />
          </motion.span>
        ) : (
          /* La `key` cambia con el paso, así que React tira el anterior y monta
             el siguiente: es lo que hace que uno salga y el otro entre en vez
             de que el texto cambie de golpe. */
          <motion.span
            key={texto}
            className={final ? 'reduccion-cifra final' : 'reduccion-cifra'}
            initial={quieto ? false : { opacity: 0, y: 14, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.44, ease: CURVA }}
          >
            {texto}
          </motion.span>
        )}
      </div>

      {/* Los puntos de abajo dicen cuántos pliegues quedan. Sin ellos la pieza
          parece que parpadea sin motivo; con ellos se entiende que va a algún
          sitio. */}
      <div className="reduccion-puntos" aria-hidden>
        {pasos.map((_, n) => (
          <span key={n} className={n <= i || quieto ? 'lleno' : ''} />
        ))}
      </div>

      {/* El pie no aparece hasta que la cuenta ha llegado. Antes salía desde el
          primer paso y decía el resultado, así que destripaba lo único que la
          pieza tiene que enseñar: el camino. */}
      <AnimatePresence>
        {final && (
          <motion.p
            className="reduccion-pie"
            initial={quieto ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: CURVA, delay: 0.15 }}
          >
            {esMaestro
              ? `El ${numero} no se reduce. Es de los que se quedan.`
              : `Todo lo que eres cabe en un ${numero}. Y de ahí sale lo que se repite.`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
