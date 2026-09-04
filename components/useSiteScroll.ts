'use client';

import { useEffect } from 'react';

/**
 * Todo lo que se mueve al bajar la página: la barra de progreso de arriba, el
 * parallax de los elementos con [data-par] y, si se pide, el carril del método.
 *
 * CÓMO SE MANTIENE FLUIDO
 *
 * 1. El evento de scroll solo apunta que hay trabajo pendiente. El trabajo se
 *    hace una vez por frame, dentro de requestAnimationFrame.
 * 2. La lista de elementos se busca UNA vez, no en cada frame. Antes se hacía
 *    un querySelectorAll sobre todo el documento sesenta veces por segundo.
 * 3. Dentro del frame se lee primero y se escribe después, en dos vueltas
 *    separadas. Mezclarlas obliga al navegador a recalcular la maquetación
 *    entre cada elemento —leer, escribir, leer, escribir— y eso es justo lo
 *    que se nota como tirones al bajar.
 * 4. Si el valor no ha cambiado desde el frame anterior, no se toca el estilo:
 *    escribir lo mismo otra vez sigue costando.
 */
export default function useSiteScroll({ methodProgress = false }: { methodProgress?: boolean } = {}) {
  useEffect(() => {
    const bar = document.getElementById('bar');
    const mprog = methodProgress ? document.getElementById('mprog') : null;

    /** Se busca una vez y se vuelve a buscar solo si cambia el tamaño. */
    let pares: { el: HTMLElement; rate: number; ultimo: string }[] = [];
    let steps: HTMLElement[] = [];
    const censar = () => {
      pares = Array.from(document.querySelectorAll<HTMLElement>('[data-par]')).map((el) => {
        // Avisamos al navegador de que este elemento se va a mover, para que lo
        // suba a su propia capa y moverlo no repinte lo que tiene detrás.
        el.style.willChange = 'transform';
        return { el, rate: parseFloat(el.dataset.par || '0'), ultimo: '' };
      });
      steps = methodProgress ? Array.from(document.querySelectorAll<HTMLElement>('[data-step]')) : [];
    };
    censar();

    let ticking = false;
    let anchoBarra = -1;
    let anchoCarril = -1;

    const apply = () => {
      ticking = false;
      const y = window.scrollY || 0;
      const vh = window.innerHeight;
      const h = document.documentElement.scrollHeight - vh;

      /* --- lectura: nada de esto escribe --- */
      const desplazamientos = pares.map(({ el, rate }) => {
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2 - vh / 2;
        return '0 ' + (mid * rate).toFixed(1) + 'px';
      });
      let vistos = 0;
      if (mprog && steps.length) {
        for (const st of steps) if (st.getBoundingClientRect().top < vh * 0.62) vistos++;
      }

      /* --- escritura: ya no se vuelve a medir nada --- */
      if (bar) {
        const w = Math.round(h > 0 ? Math.min(100, (y / h) * 100) : 0);
        if (w !== anchoBarra) {
          anchoBarra = w;
          bar.style.width = w + '%';
        }
      }
      for (let i = 0; i < pares.length; i++) {
        const p = pares[i];
        if (desplazamientos[i] !== p.ultimo) {
          p.ultimo = desplazamientos[i];
          (p.el.style as CSSStyleDeclaration & { translate: string }).translate = desplazamientos[i];
        }
      }
      if (mprog && steps.length) {
        const w = Math.round((vistos / steps.length) * 100);
        if (w !== anchoCarril) {
          anchoCarril = w;
          mprog.style.width = w + '%';
        }
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };
    const onResize = () => {
      censar();
      onScroll();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    apply();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      for (const p of pares) p.el.style.willChange = '';
    };
  }, [methodProgress]);
}
