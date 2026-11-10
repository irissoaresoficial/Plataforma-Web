'use client';

import { useEffect, useRef, useState } from 'react';
import { medir } from '@/lib/medir';

/**
 * ============================================================================
 * EL VÍDEO QUE CUENTA HASTA DÓNDE LLEGA LA GENTE
 * ============================================================================
 *
 * Por fuera, desde el 10 de noviembre de 2026: cartel con el gancho, un botón
 * de play propio y, al pulsarlo, arranca EN SILENCIO con subtítulos (como en
 * Instagram, que es de donde viene la gente) y con un botón para el sonido.
 * Por dentro levanta la mano cinco veces —al play, al 25, al 50, al 75 y al final— y eso es lo que convierte «vino gente» en «vino gente y
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
  subtitulos,
  className,
}: {
  src: string;
  poster: string;
  nombre: string;
  /** Un .vtt en castellano. Se enseña siempre: el vídeo arranca sin sonido. */
  subtitulos?: string;
  className?: string;
}) {
  const dadas = useRef<Set<string>>(new Set());
  const video = useRef<HTMLVideoElement>(null);
  const [empezado, setEmpezado] = useState(false);
  const [mudo, setMudo] = useState(true);

  const unaVez = (evento: Parameters<typeof medir>[0]) => {
    if (dadas.current.has(evento)) return;
    dadas.current.add(evento);
    medir(evento, { video: nombre });
  };

  /* LOS SUBTÍTULOS SE ENCIENDEN A MANO. El atributo `default` de <track> no
     basta en todos los navegadores (Safari lo ignora si el sistema tiene los
     subtítulos apagados), y en un vídeo que arranca mudo sin subtítulos no
     se entiende nada. */
  const enciendeSubtitulos = (v: HTMLVideoElement) => {
    for (const t of Array.from(v.textTracks)) t.mode = t.language === 'es' ? 'showing' : t.mode;
  };

  /* ARRANQUE AUTOMÁTICO (10 de noviembre de 2026, lo pidió Gerson: «que
     apenas se abra la landing, pum, se ponga el vídeo, con sonido»).
     Ningún navegador deja sonar un vídeo sin que la persona haya tocado la
     página: Chrome, Safari y el navegador de Instagram lo bloquean. Así que:
     1) se intenta con sonido (si el navegador ya confía en la web, suena);
     2) si no deja, arranca en silencio con subtítulos;
     3) al primer toque, clic o tecla en CUALQUIER sitio de la página, se
        enciende el sonido solo. */
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    enciendeSubtitulos(v);
    let quitado = false;
    const encenderAlTocar = () => {
      if (quitado) return;
      quitado = true;
      quitar();
      v.muted = false;
      setMudo(false);
      if (v.paused) v.play().catch(() => {});
    };
    const eventos = ['pointerdown', 'keydown', 'touchend'] as const;
    const quitar = () => eventos.forEach((ev) => window.removeEventListener(ev, encenderAlTocar, true));
    v.muted = false;
    v.play()
      .then(() => {
        setMudo(false);
        setEmpezado(true);
      })
      .catch(() => {
        v.muted = true;
        setMudo(true);
        v.play()
          .then(() => setEmpezado(true))
          .catch(() => {});
        eventos.forEach((ev) => window.addEventListener(ev, encenderAlTocar, { capture: true, passive: true }));
      });
    return quitar;
  }, []);

  const darPlay = () => {
    const v = video.current;
    if (!v) return;
    v.muted = false;
    setMudo(false);
    enciendeSubtitulos(v);
    setEmpezado(true);
    v.play().catch(() => {});
  };

  const alternarSonido = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMudo(v.muted);
    if (v.paused) v.play().catch(() => {});
  };

  return (
    <div className={`casa-vid${empezado ? ' casa-vid-en-marcha' : ''}${className ? ` ${className}` : ''}`}>
      <video
        ref={video}
        controls={empezado}
        playsInline
        muted={mudo}
        /* `metadata` y no `none`: pesa unos KB y permite que los subtítulos
           y la duración estén listos al pulsar. El vídeo en sí no se baja
           hasta que se le da al play. */
        preload="auto"
        autoPlay
        poster={poster}
        onLoadedMetadata={(e) => enciendeSubtitulos(e.currentTarget)}
        onPlay={() => {
          setEmpezado(true);
          unaVez('video');
        }}
        onVolumeChange={(e) => setMudo(e.currentTarget.muted)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (!v.duration || !Number.isFinite(v.duration)) return;
          const visto = v.currentTime / v.duration;
          for (const m of MARCAS) if (visto >= m.parte) unaVez(m.evento);
        }}
        onEnded={() => unaVez('video100')}
      >
        <source src={src} type="video/mp4" />
        {subtitulos && <track kind="subtitles" src={subtitulos} srcLang="es" label="Español" default />}
        Tu navegador no puede reproducir este vídeo.
      </video>

      {!empezado && (
        <button type="button" className="casa-vid-play" onClick={darPlay} aria-label="Ver el vídeo (empieza sin sonido, con subtítulos)">
          <span className="casa-vid-play-disco" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
          <span className="casa-vid-play-texto">Ver el vídeo</span>
        </button>
      )}

      {empezado && (
        <button type="button" className={`casa-vid-sonido${mudo ? ' casa-vid-sonido-llama' : ''}`} onClick={alternarSonido} aria-pressed={!mudo}>
          {mudo ? (
            <>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                <path d="m22 9-6 6M16 9l6 6" />
              </svg>
              Toca para activar el sonido
            </>
          ) : (
            'Quitar sonido'
          )}
        </button>
      )}
    </div>
  );
}
