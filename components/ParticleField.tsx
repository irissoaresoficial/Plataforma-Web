'use client';

import { useEffect, useRef } from 'react';

/** Connected particle field that repels from the mouse. Matches the v4 "field" canvas. */
export default function ParticleField({ density = 16000 }: { density?: number }) {
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
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(30, Math.min(110, Math.round((w * h) / density)));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.4 + 0.4,
        a: Math.random() * 0.45 + 0.18,
      }));
    };
    build();
    window.addEventListener('resize', build);

    let mouse = { x: -999, y: -999 };
    const onMove = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => (mouse = { x: -999, y: -999 });
    c.addEventListener('mousemove', onMove);
    c.addEventListener('mouseleave', onLeave);

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x,
          dy = p.y - mouse.y,
          d2 = dx * dx + dy * dy;
        if (d2 < 22000) {
          const f = ((22000 - d2) / 22000) * 0.95,
            d = Math.sqrt(d2) || 1;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(200,155,74,${p.a})`;
        ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j],
            ax = p.x - q.x,
            ay = p.y - q.y,
            dd = ax * ax + ay * ay;
          if (dd < 11000) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(200,155,74,${(0.09 * (1 - dd / 11000)).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', build);
      c.removeEventListener('mousemove', onMove);
      c.removeEventListener('mouseleave', onLeave);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}
