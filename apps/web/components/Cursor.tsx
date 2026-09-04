'use client';

import { useEffect } from 'react';

/**
 * El cursor de la casa: un aro y un punto dorado.
 *
 * Reacciona a los atributos que llevan los elementos: `data-mag` tira de ellos,
 * `data-cur-label` engorda el aro y escribe una palabra dentro, `data-hov-img`
 * acerca la foto, `data-card` + `data-cardnum` encienden el número de la ficha.
 *
 * RENDIMIENTO: el movimiento del ratón solo guarda la posición. Todo lo demás
 * —mirar qué hay debajo y tocar estilos— pasa una vez por frame, y solo cuando
 * el elemento bajo el puntero ha cambiado. Antes se recorría el documento
 * entero (dos querySelectorAll entre todos los nodos) en cada mousemove, lo que
 * invalidaba el estilo de la página decenas de veces por segundo.
 */
export default function Cursor({
  hitSelector = '[data-mag],[data-hov-img],a,input,[data-card],[data-line]',
}: {
  hitSelector?: string;
}) {
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const aro = document.createElement('div');
    aro.style.cssText =
      'position:fixed;left:0;top:0;width:26px;height:26px;margin:-13px 0 0 -13px;' +
      'border:1px solid rgba(74,18,32,.5);border-radius:50%;pointer-events:none;z-index:9999;' +
      'display:flex;align-items:center;justify-content:center;font-family:var(--sans);' +
      'font-size:11px;font-weight:700;letter-spacing:.02em;color:#FBF6EE;background:transparent;' +
      'will-change:transform;' +
      'transition:width .35s cubic-bezier(.16,1,.3,1),height .35s cubic-bezier(.16,1,.3,1),' +
      'margin .35s cubic-bezier(.16,1,.3,1),background .3s ease,border-color .3s ease';
    const punto = document.createElement('div');
    punto.style.cssText =
      'position:fixed;left:0;top:0;width:4px;height:4px;margin:-2px 0 0 -2px;background:#B8924F;' +
      'border-radius:50%;pointer-events:none;z-index:9999;will-change:transform;transition:opacity .3s ease';
    document.body.append(aro, punto);
    document.body.setAttribute('data-cur', 'on');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let ax = mx;
    let ay = my;

    // Lo que hay bajo el puntero ahora mismo. Guardarlo evita rehacer el trabajo
    // en cada frame y permite limpiar solo el elemento que se acaba de dejar.
    let objetivo: HTMLElement | null = null;
    let anteriorFoto: HTMLElement | null = null;
    let anteriorFicha: HTMLElement | null = null;
    let iman: HTMLElement | null = null;

    const alMover = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const bajo = e.target as HTMLElement | null;
      if (bajo !== objetivo) {
        objetivo = bajo;
        revisar(bajo);
      }
    };

    /** Se ejecuta solo cuando cambia el elemento bajo el puntero. */
    const revisar = (tg: HTMLElement | null) => {
      const sobre = tg?.closest?.(hitSelector) as HTMLElement | null;
      const conEtiqueta = sobre?.closest('[data-cur-label]') as HTMLElement | null;
      const texto = conEtiqueta?.getAttribute('data-cur-label') || '';

      aro.textContent = texto;
      const grande = Boolean(texto);
      const medio = Boolean(sobre) && !texto;
      const lado = grande ? 70 : medio ? 48 : 26;
      aro.style.width = `${lado}px`;
      aro.style.height = `${lado}px`;
      aro.style.margin = `${-lado / 2}px 0 0 ${-lado / 2}px`;
      aro.style.background = grande ? '#4A1220' : medio ? 'rgba(74,18,32,.09)' : 'transparent';
      aro.style.borderColor = grande ? '#4A1220' : 'rgba(74,18,32,.5)';
      punto.style.opacity = grande ? '0' : '1';

      // Solo se toca la foto que se deja y la que se toma, no todas las de la página.
      const foto = (tg?.closest?.('[data-hov-img]') as HTMLElement | null) ?? null;
      if (anteriorFoto && anteriorFoto !== foto) {
        const im = anteriorFoto.querySelector<HTMLElement>('img');
        if (im) im.style.transform = 'scale(1)';
      }
      if (foto) {
        const im = foto.querySelector<HTMLElement>('img');
        if (im) im.style.transform = 'scale(1.05)';
      }
      anteriorFoto = foto;

      const ficha = (tg?.closest?.('[data-card]') as HTMLElement | null) ?? null;
      if (anteriorFicha && anteriorFicha !== ficha) {
        const n = anteriorFicha.querySelector<HTMLElement>('[data-cardnum]');
        if (n) n.style.color = '';
      }
      if (ficha) {
        const n = ficha.querySelector<HTMLElement>('[data-cardnum]');
        if (n) n.style.color = 'var(--acento)';
      }
      anteriorFicha = ficha;

      const nuevoIman = (tg?.closest?.('[data-mag]') as HTMLElement | null) ?? null;
      if (iman && iman !== nuevoIman) iman.style.translate = '0 0';
      iman = nuevoIman;
    };

    window.addEventListener('mousemove', alMover, { passive: true });

    let raf = 0;
    const bucle = () => {
      // El aro va un paso por detrás del puntero: es lo que le da el arrastre.
      ax += (mx - ax) * 0.18;
      ay += (my - ay) * 0.18;
      aro.style.transform = `translate(${ax.toFixed(1)}px,${ay.toFixed(1)}px)`;
      punto.style.transform = `translate(${mx}px,${my}px)`;

      if (iman) {
        const r = iman.getBoundingClientRect();
        iman.style.translate =
          `${((mx - (r.left + r.width / 2)) * 0.1).toFixed(1)}px ` +
          `${((my - (r.top + r.height / 2)) * 0.16).toFixed(1)}px`;
      }
      raf = requestAnimationFrame(bucle);
    };
    raf = requestAnimationFrame(bucle);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', alMover);
      aro.remove();
      punto.remove();
      document.body.removeAttribute('data-cur');
    };
  }, [hitSelector]);

  return null;
}
