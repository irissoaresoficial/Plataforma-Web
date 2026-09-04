'use client';

import { useEffect, useRef } from 'react';

/** Ambient rising dust particles, fixed to the viewport. Matches the v4 "dust" canvas. */
export default function DustField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let w = 0,
      h = 0,
      pts: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(16, Math.min(52, Math.round((w * h) / 38000)));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.07,
        vy: -(Math.random() * 0.14 + 0.03),
        r: Math.random() * 1.5 + 0.4,
        a: Math.random() * 0.16 + 0.05,
      }));
    };
    build();
    window.addEventListener('resize', build);

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -8) {
          p.y = h + 8;
          p.x = Math.random() * w;
        }
        if (p.x < -8) p.x = w + 8;
        if (p.x > w + 8) p.x = -8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(200,155,74,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', build);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
        opacity: 0.9,
      }}
    />
  );
}
