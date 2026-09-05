"use client";
import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";

/**
 * Tira horizontal que se arrastra y no se acaba: al llegar a un extremo sigue
 * por el otro, porque la lista va duplicada y el desplazamiento se reengancha
 * a mitad de camino. Sirve para las series largas — los diez portales, las
 * nueve etapas, las cartas de camino — que en columna obligaban a bajar media
 * pantalla para ver la última.
 *
 * El salto se hace sobre el propio scroll, sin animación: como las dos copias
 * son idénticas, saltar del final de la primera al mismo punto de la segunda
 * es invisible. Con menos de tres elementos no se duplica nada — no hay
 * suficiente para dar la vuelta y el bucle se notaría.
 */
export default function Carrusel({
  children,
  ancho = 260,
  titulo,
  accion,
}: {
  children: React.ReactNode[];
  /** Ancho de cada tarjeta. La tira se mide en estos pasos. */
  ancho?: number;
  titulo?: string;
  accion?: React.ReactNode;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion();
  const bucle = children.length >= 3 && !quieto;
  const lista = bucle ? [...children, ...children] : children;

  const reengancha = () => {
    const el = pista.current;
    if (!el || !bucle) return;
    const mitad = el.scrollWidth / 2;
    if (el.scrollLeft >= mitad) el.scrollLeft -= mitad;
    else if (el.scrollLeft <= 0) el.scrollLeft += mitad;
  };

  const empuja = (signo: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    el.scrollBy({ left: signo * (ancho + 16) * 2, behavior: "smooth" });
  };

  const flecha = (signo: 1 | -1) => (
    <button
      onClick={() => empuja(signo)}
      aria-label={signo === 1 ? "Siguiente" : "Anterior"}
      style={css(
        "flex:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;cursor:pointer;border:1px solid var(--border-strong);background:var(--surface-solid);color:var(--text-3);"
      )}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={signo === 1 ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"} />
      </svg>
    </button>
  );

  return (
    <div style={css("min-width:0;")}>
      {(titulo || accion) && (
        <div style={css("display:flex;align-items:center;gap:var(--s3);margin-bottom:var(--s3);")}>
          {titulo && <span style={css("font-family:var(--font-display);font-size:var(--t-title);font-weight:500;letter-spacing:-.01em;color:var(--text);")}>{titulo}</span>}
          <div style={css("margin-left:auto;display:flex;align-items:center;gap:var(--s2);")}>
            {accion}
            {flecha(-1)}
            {flecha(1)}
          </div>
        </div>
      )}
      <div
        ref={pista}
        onScroll={reengancha}
        data-tira=""
        style={css(
          "display:flex;gap:var(--s4);overflow-x:auto;scroll-snap-type:x proximity;padding:2px 2px var(--s2);margin:-2px -2px 0;scrollbar-width:none;overscroll-behavior-x:contain;"
        )}
      >
        {lista.map((hijo, i) => (
          <motion.div
            key={i}
            initial={quieto ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 5) * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={css(`flex:none;width:${ancho}px;scroll-snap-align:start;`)}
          >
            {hijo}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
