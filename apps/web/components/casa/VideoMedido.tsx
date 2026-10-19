'use client';

import { useRef } from 'react';
import { medir } from '@/lib/medir';

/**
 * ============================================================================
 * EL VÍDEO QUE CUENTA HASTA DÓNDE LLEGA LA GENTE
 * ============================================================================
 *
 * Por fuera es el mismo `<video>` de siempre: mismos controles, mismo cartel,
 * misma pinta. Por dentro levanta la mano cinco veces —al play, al 25, al 50,
 * al 75 y al final— y eso es lo que convierte «vino gente» en «vino gente y
 * esto es lo que hizo».
 *
 * ---------------------------------------------------------------------------
 * CADA AVISO SE DA UNA SOLA VEZ, Y ES LO ÚNICO DIFÍCIL DE ESTO
 * ---------------------------------------------------------------------------
 * `timeupdate` salta cuatro o cinco veces por segundo. Si se avisa cada vez que
 * el reloj pasa de la mitad, un vídeo de dos minutos manda doscientos avisos de
 * «va por el 50%», y entonces Métricas dice que mil personas vieron medio vídeo
 * cuando fueron cinco. Peor aún: Meta aprendería de un número inflado y pujaría
 * por la gente equivocada con el dinero de Gerson.
 *
 * Por eso cada marca se tacha de la lista en cuanto se pasa, y el `Set` vive en
 * un `useRef`: sobrevive a los repintados y no provoca ninguno. Si la persona
 * rebobina y vuelve a pasar por el 50%, no se cuenta dos veces — porque no
 * llegó dos veces, llegó una y volvió a mirar.
 *
 * ---------------------------------------------------------------------------
 * SI NO HAY CONSENTIMIENTO, ESTO NO MANDA NADA
 * ---------------------------------------------------------------------------
 * No hace falta comprobarlo aquí: `medir()` busca `fbq` y `gtag` en la ventana
 * y, si la persona dijo «no, gracias», esos dos no existen y la función se sale
 * sin hacer nada. Ni petición, ni cookie, ni error. El vídeo se ve igual de
 * bien para quien no quiere que le midan, que es como tiene que ser.
 */

/** Dónde se levanta la mano, y cómo se llama cada aviso. */
const MARCAS = [
  { parte: 0.25, evento: 'video25' },
  { parte: 0.5, evento: 'video50' },
  { parte: 0.75, evento: 'video75' },
] as const;

export default function VideoMedido({
  src,
  poster,
  nombre,
  className,
}: {
  src: string;
  poster: string;
  /** Qué vídeo es. Viaja con cada aviso para poder distinguirlos el día que
   *  haya dos vídeos midiendo en páginas distintas. */
  nombre: string;
  className?: string;
}) {
  const dadas = useRef<Set<string>>(new Set());

  /** Avisa, pero sólo la primera vez. */
  const unaVez = (evento: Parameters<typeof medir>[0]) => {
    if (dadas.current.has(evento)) return;
    dadas.current.add(evento);
    medir(evento, { video: nombre });
  };

  return (
    <video
      className={className}
      controls
      playsInline
      preload="none"
      poster={poster}
      onPlay={() => unaVez('video')}
      onTimeUpdate={(e) => {
        const v = e.currentTarget;
        /* Sin duración no hay porcentaje que calcular. Pasa en los primeros
           milisegundos y al cargar por partes. */
        if (!v.duration || !Number.isFinite(v.duration)) return;
        const visto = v.currentTime / v.duration;
        for (const m of MARCAS) if (visto >= m.parte) unaVez(m.evento);
      }}
      /* `ended` y no el 100% del reloj: hay vídeos cuyo `currentTime` se queda
         unas centésimas por debajo de `duration` y nunca llegarían a tocar la
         marca. El navegador sabe mejor que nosotros cuándo se ha acabado. */
      onEnded={() => unaVez('video100')}
    >
      <source src={src} type="video/mp4" />
      Tu navegador no puede reproducir este vídeo.
    </video>
  );
}
