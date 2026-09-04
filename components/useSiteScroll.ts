'use client';

import { useEffect } from 'react';

/**
 * Drives the fixed nav's background/blur + text color transition as the page scrolls
 * over light vs dark sections, the top progress bar, [data-par] parallax elements and
 * (optionally) the "method" progress rail fed by [data-step] elements.
 */
export default function useSiteScroll({ methodProgress = false }: { methodProgress?: boolean } = {}) {
  useEffect(() => {
    const bar = document.getElementById('bar');
    const nav = document.getElementById('nav');
    const mprog = methodProgress ? document.getElementById('mprog') : null;
    const steps = methodProgress ? Array.from(document.querySelectorAll<HTMLElement>('[data-step]')) : [];

    let ticking = false;
    const apply = () => {
      ticking = false;
      const y = window.scrollY || 0,
        vh = window.innerHeight;
      const h = document.documentElement.scrollHeight - vh;
      if (bar) bar.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';

      // Qué hay justo debajo de la barra, siempre: la barra es fija y cruza
      // bloques claros y de granate, incluido el primero. Mirarlo solo después
      // de bajar dejaba la barra pintada para fondo oscuro sobre el hero claro.
      let light = true;
      {
        const el = document.elementFromPoint(Math.max(8, window.innerWidth - 14), 32);
        let node: Element | null = el,
          bg = '';
        while (node && node !== document.body) {
          const c = getComputedStyle(node).backgroundColor;
          if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') {
            bg = c;
            break;
          }
          node = node.parentElement;
        }
        const m = bg.match(/\d+/g);
        light = m ? Number(m[0]) * 0.299 + Number(m[1]) * 0.587 + Number(m[2]) * 0.114 > 140 : true;
      }
      const solid = y > vh * 0.7;
      if (nav) {
        nav.style.background = solid ? (light ? 'rgba(253,251,247,.88)' : 'rgba(74,18,32,.86)') : 'transparent';
        nav.style.backdropFilter = solid ? 'blur(16px)' : 'none';
        (nav.style as any).webkitBackdropFilter = solid ? 'blur(16px)' : 'none';
        nav.style.borderBottomColor = solid ? (light ? 'rgba(43,26,30,.1)' : 'rgba(251,246,238,.14)') : 'transparent';
      }
      const fg = light ? '#2B1A1E' : '#FBF6EE';
      // El sello tiene dos versiones y aquí se decide cuál toca: la de color
      // sobre papel, la blanca sobre granate.
      document.body.dataset.navClaro = light ? 'no' : 'si';
      document.querySelectorAll<HTMLElement>('.navtx').forEach((el2) => {
        el2.style.color = fg;
      });
      const langbox = document.getElementById('langbox');
      if (langbox) {
        langbox.style.borderColor = light ? 'rgba(43,26,30,.2)' : 'rgba(251,246,238,.24)';
        langbox.style.color = fg;
      }
      const navbtn = document.getElementById('navbtn');
      if (navbtn) {
        navbtn.style.background = light ? '#4A1220' : '#B8924F';
        navbtn.style.color = light ? '#FBF6EE' : '#4A1220';
      }

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
