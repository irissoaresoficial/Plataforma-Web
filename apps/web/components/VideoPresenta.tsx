'use client';

import { useRef, useState } from 'react';

/**
 * ============================================================================
 * EL VÍDEO EN EL QUE IRIS SE PRESENTA
 * ============================================================================
 *
 * Un cuadro 16:9 con el cartel puesto y un botón de reproducir en medio. Se
 * pulsa y empieza, con sonido.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ NO ARRANCA SOLO
 * ---------------------------------------------------------------------------
 * El otro vídeo de la casa —el del bloque «Tu número»— sí arranca solo, y está
 * bien que lo haga: ahí lo que se ve es ambiente, y el sonido no aporta nada.
 *
 * Éste es lo contrario: es Iris HABLANDO. El contenido es lo que dice, no lo
 * que se ve. Y un vídeo con voz que arranca solo es imposible: los navegadores
 * lo bloquean si no está silenciado, así que arrancaría mudo — es decir,
 * arrancaría sin su contenido, gastando datos y llamando la atención para no
 * decir nada. Peor aún en un móvil en el metro, que es donde va a verlo media
 * gente.
 *
 * Así que se enseña el cartel, se pone un botón grande y se deja decidir. Quien
 * pulsa quiere oírla, que es exactamente la persona a la que le sirve.
 *
 * `preload="metadata"` para no bajarse ocho megas a quien no va a pulsar, y
 * `poster` para que mientras tanto haya una cara y no un rectángulo negro.
 */
export default function VideoPresenta({
  src,
  cartel,
  etiqueta,
}: {
  src: string;
  cartel: string;
  /** Qué se oye al pulsar. Va al lector de pantalla y al `aria-label`. */
  etiqueta: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [andando, setAndando] = useState(false);

  const arrancar = () => {
    const v = video.current;
    if (!v) return;
    v.play();
    setAndando(true);
  };

  return (
    <div className={`vpres${andando ? ' vpres-va' : ''}`}>
      <video
        ref={video}
        src={src}
        poster={cartel}
        preload="metadata"
        playsInline
        controls={andando}
        onPlay={() => setAndando(true)}
        onPause={() => setAndando(false)}
      />
      {!andando && (
        <button type="button" className="vpres-play" onClick={arrancar} aria-label={etiqueta} data-mag>
          <span className="vpres-icono" aria-hidden>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M8 5.2v13.6a.6.6 0 0 0 .92.5l10.7-6.8a.6.6 0 0 0 0-1l-10.7-6.8A.6.6 0 0 0 8 5.2Z" />
            </svg>
          </span>
          <span className="vpres-txt">{etiqueta}</span>
        </button>
      )}
    </div>
  );
}
