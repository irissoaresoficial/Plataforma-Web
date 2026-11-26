'use client';

/**
 * UN SOLO ENLACE PARA LOS DOS IDIOMAS (26 nov, Gerson: «debía estar en el
 * mismo link»). La página sale en portugués si el navegador está en
 * portugués o si el enlace lleva `?lang=pt`; si no, en castellano. Arriba hay
 * un selector ES · PT para cambiarlo a mano.
 */
import { useEffect, useState } from 'react';
import type { Idioma } from './textos';

export function useIdioma(inicial: Idioma) {
  const [v, setV] = useState<Idioma>(inicial);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'pt' || q === 'es') return setV(q);
    if (inicial === 'es' && navigator.language?.toLowerCase().startsWith('pt')) setV('pt');
  }, [inicial]);
  return { v, setV };
}

export function Selector({ idioma }: { idioma: { v: Idioma; setV: (x: Idioma) => void } }) {
  return (
    <div className="da-selector" role="group" aria-label="Idioma">
      {(['es', 'pt'] as const).map((x) => (
        <button key={x} type="button" aria-pressed={idioma.v === x} onClick={() => idioma.setV(x)}>
          {x === 'es' ? 'Español' : 'Português'}
        </button>
      ))}
    </div>
  );
}
