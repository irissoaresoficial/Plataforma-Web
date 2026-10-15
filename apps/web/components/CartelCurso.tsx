'use client';

/**
 * ============================================================================
 * EL CARTEL DEL CURSO, QUIETO O EN MOVIMIENTO
 * ============================================================================
 *
 * Un curso se anuncia con una imagen, y desde octubre de 2026 el de Desórdenes
 * Amorosos se anuncia con su marca animada. Esto decide cuál de las dos cosas
 * se enseña, y la decisión no es «si hay vídeo, vídeo».
 *
 * EL FOTOGRAMA QUIETO NO ES UN REPUESTO: ES LO PRIMERO QUE SE VE. Un vídeo sin
 * `poster` enseña un rectángulo negro mientras carga, y eso cae justo en el
 * primer segundo de la página que vende. Con `poster` la tarjeta se ve entera
 * desde el principio y el movimiento entra encima cuando está listo.
 *
 * QUIEN HA PEDIDO QUE NADA SE MUEVA, NO VE MOVERSE NADA. No es una cortesía:
 * para una parte de la gente —vértigo, migraña con aura, epilepsia
 * fotosensible— una animación en bucle en mitad de la pantalla es un síntoma,
 * no una molestia. A esas personas se les da la imagen quieta, que cuenta
 * exactamente lo mismo. Se mira en el navegador y no en el servidor porque es
 * un ajuste del aparato de cada uno.
 *
 * Y SE PARA CUANDO NO SE VE. Un bucle reproduciéndose fuera de pantalla gasta
 * batería y no lo mira nadie. Se para al salir y arranca al volver.
 *
 * SIN SONIDO Y SIN CONTROLES, a propósito: es la carátula de una tarjeta, no
 * una clase. Un cartel con botón de pausa invita a pulsarlo, y lo que tiene
 * que pulsarse aquí es el curso.
 */

import { useEffect, useRef, useState } from 'react';
import Foto from './Foto';

type Props = {
  /** El fotograma quieto. Obligatorio: es lo que se ve antes que nada. */
  cartel: string;
  /** El bucle, si lo hay. */
  video?: string;
  alt: string;
  sizes: string;
};

export default function CartelCurso({ cartel, video, alt, sizes }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  /*
   * Empieza en `false` y no en el valor real, y eso es deliberado: el servidor
   * no sabe qué ha pedido este navegador, así que si arrancara en `true` el
   * HTML del servidor y el del navegador no coincidirían y React protestaría.
   * Se decide en el primer efecto, ya en el navegador.
   */
  const [conMovimiento, setConMovimiento] = useState(false);

  useEffect(() => {
    if (!video) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mirar = () => setConMovimiento(!mq.matches);
    mirar();
    mq.addEventListener('change', mirar);
    return () => mq.removeEventListener('change', mirar);
  }, [video]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !conMovimiento) return;
    /* Sin IntersectionObserver —navegadores viejos— se reproduce y ya está:
       gastar batería es peor que no gastarla, pero mucho mejor que no verse. */
    if (typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.15 }
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, [conMovimiento]);

  if (!video || !conMovimiento) {
    return <Foto src={cartel} alt={alt} llenar radius={0} sizes={sizes} />;
  }

  return (
    <video
      ref={ref}
      poster={cartel}
      muted
      loop
      playsInline
      preload="metadata"
      autoPlay
      /* No lo lee ningún lector de pantalla: lo que dice el cartel ya lo dice
         el título que hay justo al lado, y oír «vídeo, Cartel de…» antes de
         llegar al nombre del curso sólo estorba. */
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={video} type="video/mp4" />
    </video>
  );
}
