'use client';

import { useEffect } from 'react';

/**
 * Custom ring + dot cursor. Reacts to data attributes placed on elements:
 * data-mag (magnetic pull), data-cur-label (grows + shows text), data-hov-img
 * (zooms the inner <img>), data-card + data-cardnum (lights up the card number),
 * data-line (treated as a hoverable row).
 */
export default function Cursor({ hitSelector = '[data-mag],[data-hov-img],a,input,[data-card],[data-line]' }: { hitSelector?: string }) {
  useEffect(() => {
    if (!window.matchMedia('(pointer:fine)').matches) return;

    const ring = document.createElement('div');
    ring.style.cssText =
      'position:fixed;left:0;top:0;width:26px;height:26px;margin:-13px 0 0 -13px;border:1px solid #F4F3EF;border-radius:50%;pointer-events:none;z-index:9999;display:flex;align-items:center;justify-content:center;font-family:Satoshi,-apple-system,sans-serif;font-size:11px;font-weight:700;letter-spacing:.02em;color:#0A0A0C;mix-blend-mode:difference;transition:width .35s cubic-bezier(.16,1,.3,1),height .35s cubic-bezier(.16,1,.3,1),margin .35s cubic-bezier(.16,1,.3,1),background .3s ease,border-color .3s ease';
    const dot = document.createElement('div');
    dot.style.cssText =
      'position:fixed;left:0;top:0;width:4px;height:4px;margin:-2px 0 0 -2px;background:#C89B4A;border-radius:50%;pointer-events:none;z-index:9999;transition:opacity .3s ease';
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.body.setAttribute('data-cur', 'on');

    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2,
      rx = mx,
      ry = my,
      mag: HTMLElement | null = null;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;

      const glow = document.getElementById('glow');
      const hero = document.getElementById('top');
      if (glow && hero) {
        const r = hero.getBoundingClientRect();
        if (my > r.top && my < r.bottom) {
          glow.style.opacity = '1';
          glow.style.transform = `translate(${mx}px,${my - r.top}px)`;
        } else {
          glow.style.opacity = '.3';
        }
      }

      const tg = e.target as HTMLElement;
      const hit = tg && tg.closest ? (tg.closest(hitSelector) as HTMLElement | null) : null;
      const label = hit && (hit.closest('[data-cur-label]') as HTMLElement | null);
      const txt = label ? label.getAttribute('data-cur-label') || '' : '';
      ring.textContent = txt;
      const big = !!txt,
        med = !!hit && !txt;
      const size = big ? 70 : med ? 48 : 26;
      ring.style.width = size + 'px';
      ring.style.height = size + 'px';
      ring.style.margin = -size / 2 + 'px 0 0 ' + -size / 2 + 'px';
      ring.style.background = big ? '#F4F3EF' : med ? 'var(--linea)' : 'transparent';
      ring.style.mixBlendMode = big ? 'normal' : 'difference';
      ring.style.color = '#0A0A0C';
      ring.style.borderColor = '#F4F3EF';
      dot.style.opacity = big ? '0' : '1';

      document.querySelectorAll<HTMLElement>('[data-hov-img] img').forEach((im) => {
        im.style.transform = 'scale(1)';
        im.style.filter = im.style.filter.replace(/saturate\([^)]*\)/, 'saturate(.92)');
      });
      const img = tg && tg.closest ? (tg.closest('[data-hov-img]') as HTMLElement | null) : null;
      if (img) {
        const im = img.querySelector<HTMLElement>('img');
        if (im) {
          im.style.transform = 'scale(1.06)';
        }
      }

      document.querySelectorAll<HTMLElement>('[data-cardnum]').forEach((n) => {
        n.style.color = 'var(--linea)';
      });
      const card = tg && tg.closest ? (tg.closest('[data-card]') as HTMLElement | null) : null;
      if (card) {
        const n = card.querySelector<HTMLElement>('[data-cardnum]');
        if (n) n.style.color = 'var(--acento)';
      }

      const magEl = tg && tg.closest ? (tg.closest('[data-mag]') as HTMLElement | null) : null;
      if (mag && mag !== magEl) {
        mag.style.translate = '0 0';
        mag = null;
      }
      if (magEl) {
        mag = magEl;
        const r = magEl.getBoundingClientRect();
        magEl.style.translate =
          ((mx - (r.left + r.width / 2)) * 0.1).toFixed(1) +
          'px ' +
          ((my - (r.top + r.height / 2)) * 0.16).toFixed(1) +
          'px';
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf = 0;
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.body.removeAttribute('data-cur');
      ring.remove();
      dot.remove();
    };
  }, [hitSelector]);

  return null;
}
