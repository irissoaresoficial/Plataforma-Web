'use client';

import { useEffect, useRef, useState } from 'react';

export default function Counter({ to, group = false }: { to: number; group?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const run = () => {
      if (done.current) return;
      done.current = true;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / 1400);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * ease));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && run()),
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return <span ref={ref}>{group ? val.toLocaleString('es-ES', { useGrouping: true }) : val}</span>;
}
