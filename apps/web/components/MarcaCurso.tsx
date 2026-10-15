'use client';

/**
 * ============================================================================
 * LA MARCA DEL CURSO, EN LA CABECERA DE LA PÁGINA
 * ============================================================================
 *
 * EN QUÉ SE DIFERENCIA DEL OTRO VÍDEO, que es lo que decide cómo se comporta
 * éste. Aquí había `VideoPresenta`: Iris HABLANDO, con su cartel y un botón de
 * reproducir en medio. Ese vídeo no arranca solo a propósito —su contenido es
 * lo que dice, y un vídeo con voz que arranca solo lo bloquea el navegador o
 * suena en el metro— y quien pulsa es exactamente quien quiere oírla.
 *
 * Esto es lo contrario y por eso no es el mismo componente: siete segundos sin
 * una palabra, el logotipo del curso formándose sobre granate. No hay nada que
 * decidir oír. Un botón de reproducir encima sería pedir permiso para enseñar
 * un rótulo, y quien lo pulsara se encontraría con que no pasa nada más.
 *
 * Así que va en bucle, callado, sin controles y sin botón. Y se para cuando no
 * se ve: un bucle fuera de pantalla gasta batería y no lo mira nadie.
 *
 * QUIEN HA PEDIDO QUE NADA SE MUEVA ve el fotograma quieto, que dice lo mismo.
 * No es cortesía: para una parte de la gente —vértigo, migraña con aura,
 * epilepsia fotosensible— una animación en bucle es un síntoma.
 */

import { useEffect, useRef, useState } from 'react';
import Foto from './Foto';

export default function MarcaCurso({
  video,
  cartel,
  alt,
}: {
  video: string;
  /** El fotograma quieto. Lo que se ve mientras carga, y lo único que ve
   *  quien no quiere movimiento. Sin él, un rectángulo negro. */
  cartel: string;
  alt: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  /* Arranca en `false` y se decide en el navegador: el servidor no sabe qué ha
     pedido este aparato, y si arrancara en `true` el HTML del servidor y el del
     navegador no coincidirían. */
  const [conMovimiento, setConMovimiento] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mirar = () => setConMovimiento(!mq.matches);
    mirar();
    mq.addEventListener('change', mirar);
    return () => mq.removeEventListener('change', mirar);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !conMovimiento) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 }
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, [conMovimiento]);

  if (!conMovimiento) {
    return (
      <div className="vpres">
        <Foto src={cartel} alt={alt} llenar radius={0} sizes="(max-width:1099px) 92vw, 560px" />
      </div>
    );
  }

  return (
    <div className="vpres vpres-marca">
      <video ref={ref} poster={cartel} muted loop playsInline preload="metadata" autoPlay aria-label={alt}>
        <source src={video} type="video/mp4" />
      </video>
    </div>
  );
}
