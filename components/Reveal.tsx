'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

const TAGS = {
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  span: motion.span,
  p: motion.p,
} as const;

/**
 * Scroll reveal used across every page. Driven by explicit state (IntersectionObserver +
 * a safety-net timeout) rather than framer-motion's `whileInView` alone, mirroring the
 * belt-and-braces approach ("sweep" + safety timeout) the original vanilla implementation used.
 */
export default function Reveal({
  as = 'div',
  delay = 0,
  line = false,
  style,
  className,
  children,
}: {
  as?: keyof typeof TAGS;
  delay?: number;
  line?: boolean;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const distance = line ? 26 : 20;

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.top < vh * 0.9 && r.bottom > vh * -0.12) setShown(true);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setShown(true)),
      { threshold: 0.05, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);

    const raf = requestAnimationFrame(check);
    const safety = setTimeout(check, 900);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, [reduced]);

  const Tag = TAGS[as];

  return (
    <Tag
      ref={ref as any}
      style={style}
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: distance }}
      transition={{
        opacity: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 },
        y: { duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 },
      }}
    >
      {children}
    </Tag>
  );
}
