'use client';

import { useEffect, useRef } from 'react';

/**
 * Los números del estudio flotando en el aire.
 *
 * No son puntos genéricos: son las cifras con las que se trabaja —del 1 al 9 y
 * los maestros 11, 22 y 33—, que es de lo que va la casa. Suben muy despacio,
 * las de atrás desenfocadas y las de delante nítidas, y el ratón las aparta.
 *
 * IMPORTANTE PARA EL RENDIMIENTO: el desenfoque se aplica UNA vez, al preparar
 * los sellos, y después solo se copian. Hacerlo con `ctx.filter` en cada frame
 * cuesta un desenfoque gaussiano a pantalla completa por número y por frame:
 * medido, hundía la página de 60 a 1 fps.
 */

const CIFRAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '22', '33'];

/** Cuántas capas de profundidad hay. Cada una tiene su tamaño y su desenfoque. */
const CAPAS = 4;

type Num = { x: number; y: number; vx: number; vy: number; capa: number; cifra: number };

export default function CampoNumeros({
  densidad = 42000,
  /** Sobre papel claro conviene poco; sobre granate aguanta más. */
  intensidad = 1,
}: {
  densidad?: number;
  intensidad?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d', { alpha: true });
    if (!ctx) return;

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let nums: Num[] = [];
    /** sellos[capa][cifra] = el número ya dibujado y desenfocado, listo para copiar. */
    let sellos: HTMLCanvasElement[][] = [];
    let visible = true;

    const tamDe = (capa: number) => 15 + capa * 7; // 15, 22, 29, 36 px
    const borronDe = (capa: number) => (CAPAS - 1 - capa) * 1.6; // 4.8, 3.2, 1.6, 0
    const alfaDe = (capa: number) => (0.16 + capa * 0.11) * intensidad;

    /** Dibuja cada cifra en su propio lienzo, con su desenfoque ya aplicado. */
    const prepararSellos = () => {
      sellos = [];
      for (let capa = 0; capa < CAPAS; capa++) {
        const tam = tamDe(capa);
        const borron = borronDe(capa);
        const margen = Math.ceil(borron * 3 + 4);
        const fila: HTMLCanvasElement[] = [];
        for (const cifra of CIFRAS) {
          const s = document.createElement('canvas');
          const sctx = s.getContext('2d')!;
          sctx.font = `400 ${tam}px 'Fraunces', Georgia, serif`;
          const ancho = Math.ceil(sctx.measureText(cifra).width) + margen * 2;
          const alto = Math.ceil(tam * 1.4) + margen * 2;
          s.width = ancho * dpr;
          s.height = alto * dpr;
          sctx.scale(dpr, dpr);
          if (borron > 0.2) sctx.filter = `blur(${borron}px)`;
          sctx.font = `400 ${tam}px 'Fraunces', Georgia, serif`;
          sctx.textAlign = 'center';
          sctx.textBaseline = 'middle';
          sctx.fillStyle = '#c8a35c';
          sctx.fillText(cifra, ancho / 2, alto / 2);
          fila.push(s);
        }
        sellos.push(fila);
      }
    };

    const nuevo = (yAlAzar: boolean): Num => {
      const capa = Math.floor(Math.random() * CAPAS);
      return {
        x: Math.random() * w,
        y: yAlAzar ? Math.random() * h : h + 50,
        vx: (Math.random() - 0.5) * 0.09,
        vy: -(0.05 + capa * 0.045),
        capa,
        cifra: Math.floor(Math.random() * CIFRAS.length),
      };
    };

    const montar = () => {
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(12, Math.min(38, Math.round((w * h) / densidad)));
      nums = Array.from({ length: n }, () => nuevo(true));
    };

    prepararSellos();
    montar();
    window.addEventListener('resize', montar);

    // Cuando el hero deja de verse, el canvas deja de pintar: no tiene sentido
    // gastar frames en algo que está fuera de pantalla.
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(c);

    let raton = { x: -9999, y: -9999 };
    const alMover = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      raton = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const alSalir = () => (raton = { x: -9999, y: -9999 });
    window.addEventListener('mousemove', alMover, { passive: true });
    window.addEventListener('mouseleave', alSalir);

    const pintar = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nums) {
        const s = sellos[n.capa]?.[n.cifra];
        if (!s) continue;
        const aw = s.width / dpr;
        const ah = s.height / dpr;
        ctx.globalAlpha = alfaDe(n.capa);
        ctx.drawImage(s, n.x - aw / 2, n.y - ah / 2, aw, ah);
      }
      ctx.globalAlpha = 1;
    };

    if (quieto) {
      pintar();
      return () => {
        io.disconnect();
        window.removeEventListener('resize', montar);
        window.removeEventListener('mousemove', alMover);
        window.removeEventListener('mouseleave', alSalir);
      };
    }

    let raf = 0;
    let ultimo = 0;
    const paso = (t: number) => {
      raf = requestAnimationFrame(paso);
      if (!visible) return;
      // 30 fps bastan para una deriva tan lenta, y deja la mitad de la máquina
      // libre para el desplazamiento de la página.
      if (t - ultimo < 33) return;
      ultimo = t;

      for (let i = 0; i < nums.length; i++) {
        const n = nums[i];
        n.x += n.vx;
        n.y += n.vy;

        const dx = n.x - raton.x;
        const dy = n.y - raton.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000) {
          const d = Math.sqrt(d2) || 1;
          const f = ((26000 - d2) / 26000) * (0.5 + n.capa * 0.4);
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }

        if (n.y < -60) nums[i] = nuevo(false);
        if (n.x < -60) n.x = w + 60;
        if (n.x > w + 60) n.x = -60;
      }
      pintar();
    };
    raf = requestAnimationFrame(paso);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', montar);
      window.removeEventListener('mousemove', alMover);
      window.removeEventListener('mouseleave', alSalir);
    };
  }, [densidad, intensidad]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
    />
  );
}
