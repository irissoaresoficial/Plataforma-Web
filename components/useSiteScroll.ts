'use client';

import { useEffect } from 'react';

/**
 * Mueve la barra de progreso de arriba, el parallax de [data-par] y
 * (optionally) the "method" progress rail fed by [data-step] elements.
 */
export default function useSiteScroll({ methodProgress = false }: { methodProgress?: boolean } = {}) {
  useEffect(() => {
    const bar = document.getElementById('bar');
    const mprog = methodProgress ? document.getElementById('mprog') : null;
    const steps = methodProgress ? Array.from(document.querySelectorAll<HTMLElement>('[data-step]')) : [];

    let ticking = false;
    const apply = () => {
      ticking = false;
      const y = window.scrollY || 0,
        vh = window.innerHeight;
      const h = document.documentElement.scrollHeight - vh;
      if (bar) bar.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';

      // La barra ya no cambia de color con el fondo: lleva su propio cristal
      // esmerilado siempre, así que aquí no hay nada que ajustar.

      document.querySelectorAll<HTMLElement>('[data-par]').forEach((el2) => {
        const r = el2.getBoundingClientRect();
        const rate = parseFloat(el2.dataset.par || '0');
        const mid = r.top + r.height / 2 - vh / 2;
        (el2.style as any).translate = '0 ' + (mid * rate).toFixed(1) + 'px';
      });

      if (mprog && steps.length) {
        let seen = 0;
        steps.forEach((st) => {
          if (st.getBoundingClientRect().top < vh * 0.62) seen++;
        });
        mprog.style.width = Math.round((seen / steps.length) * 100) + '%';
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    apply();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [methodProgress]);
}
