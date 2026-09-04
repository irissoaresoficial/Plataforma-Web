'use client';

import { useEffect, useRef } from 'react';

/**
 * Los números del estudio flotando en el aire, en dorado.
 *
 * No son puntos genéricos: son las cifras con las que se trabaja —del 1 al 9 y
 * los maestros 11, 22 y 33—, que es de lo que va la casa. Cada una tiene una
 * profundidad: las del fondo salen grandes, desenfocadas y casi transparentes;
 * las de delante, pequeñas y nítidas. Suben muy despacio y el ratón las aparta.
 */

const CIFRAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '22', '33'];

type Num = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0 = al fondo, 1 = delante. Manda en el tamaño, el desenfoque y el brillo. */
  z: number;
  texto: string;
  giro: number;
  vGiro: number;
};

export default function CampoNumeros({
  densidad = 26000,
  /** Sobre granate conviene más brillo; sobre papel claro, mucho menos. */
  intensidad = 1,
}: {
  densidad?: number;
  intensidad?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let nums: Num[] = [];

    const nuevo = (yAlAzar: boolean): Num => {
      const z = Math.random();
      return {
        x: Math.random() * w,
        y: yAlAzar ? Math.random() * h : h + 40,
        vx: (Math.random() - 0.5) * 0.1,
        vy: -(0.05 + z * 0.16),
        z,
        texto: CIFRAS[Math.floor(Math.random() * CIFRAS.length)],
        giro: (Math.random() - 0.5) * 0.4,
        vGiro: (Math.random() - 0.5) * 0.0016,
      };
    };

    const montar = () => {
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(14, Math.min(46, Math.round((w * h) / densidad)));
      nums = Array.from({ length: n }, () => nuevo(true));
    };
    montar();
    window.addEventListener('resize', montar);

    let raton = { x: -9999, y: -9999 };
    const alMover = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      raton = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const alSalir = () => (raton = { x: -9999, y: -9999 });
    c.addEventListener('mousemove', alMover);
    c.addEventListener('mouseleave', alSalir);

    const pintar = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nums) {
        // Lo lejano es grande y borroso; lo cercano, pequeño y nítido. Es lo que
        // da sensación de profundidad en vez de un plano de números sueltos.
        const tam = 74 - n.z * 54;
        const desenfoque = (1 - n.z) * 7;
        const alfa = (0.1 + n.z * 0.42) * intensidad;

        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(n.giro);
        ctx.filter = desenfoque > 0.4 ? `blur(${desenfoque.toFixed(1)}px)` : 'none';
        ctx.font = `400 ${tam.toFixed(0)}px 'Fraunces', Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(200,163,92,${alfa.toFixed(3)})`;
        ctx.fillText(n.texto, 0, 0);
        ctx.restore();
      }
      ctx.filter = 'none';
    };

    if (quieto) {
      // Sin movimiento, pero el campo sigue estando: se pinta una sola vez.
      pintar();
      return () => {
        window.removeEventListener('resize', montar);
        c.removeEventListener('mousemove', alMover);
        c.removeEventListener('mouseleave', alSalir);
      };
    }

    let raf = 0;
    const paso = () => {
      for (let i = 0; i < nums.length; i++) {
        const n = nums[i];
        n.x += n.vx;
        n.y += n.vy;
        n.giro += n.vGiro;

        const dx = n.x - raton.x;
        const dy = n.y - raton.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 30000) {
          const d = Math.sqrt(d2) || 1;
          const f = ((30000 - d2) / 30000) * (0.4 + n.z * 1.1);
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }

        // Al salir por arriba vuelve a entrar por abajo, con otra cifra.
        if (n.y < -60) nums[i] = nuevo(false);
        if (n.x < -70) n.x = w + 70;
        if (n.x > w + 70) n.x = -70;
      }
      pintar();
      raf = requestAnimationFrame(paso);
    };
    paso();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', montar);
      c.removeEventListener('mousemove', alMover);
      c.removeEventListener('mouseleave', alSalir);
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
