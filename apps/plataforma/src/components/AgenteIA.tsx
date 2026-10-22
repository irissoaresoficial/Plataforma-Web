"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { css } from "@/lib/css";

/**
 * EL AGENTE IA, ANUNCIADO. Lo pidió Gerson el 20 de octubre de 2026: «un
 * pequeño botón que realce, que se vea para todos, que diga próximamente».
 *
 * Va en la cabecera y no en la columna: la columna de Iris ya pasa del alto de
 * un portátil y ahí abajo no lo vería nadie. En la cabecera está en todas las
 * pantallas, para todo el mundo, sin bajar.
 *
 * No hace nada todavía y lo dice: «Próximamente» va en la propia pastilla. Un
 * botón que parece funcionar y no hace nada es justo lo que enseña a
 * desconfiar del resto. Al pulsarlo dice qué va a ser, y ya está.
 */
export default function AgenteIA() {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div ref={caja} style={css("position:relative;flex:none;")}>
      <button
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-haspopup="dialog"
        aria-label="Agente IA, próximamente"
        style={css(
          "display:flex;align-items:center;gap:8px;height:38px;padding:0 8px 0 12px;cursor:pointer;white-space:nowrap;" +
            "border-radius:var(--r-pill);border:1px solid var(--bloque-borde);font:inherit;" +
            "background:linear-gradient(135deg,var(--vino) 0%,var(--vino) 55%,var(--oro) 170%);color:var(--sobre-bloque);" +
            "box-shadow:0 6px 18px color-mix(in srgb, var(--vino) 24%, transparent);"
        )}
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--oro-luz)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
          <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
        </svg>
        <span data-agente-texto="" style={css("font-size:var(--t-mini);font-weight:500;")}>Asistente IA</span>
        <span
          data-agente-texto=""
          style={css("font-size:var(--t-micro);font-weight:500;padding:3px 8px;border-radius:var(--r-pill);background:var(--oro-luz);color:var(--vino);")}
        >
          Próximamente
        </span>
      </button>
      <AnimatePresence>
        {abierto && (
          <motion.div
            role="dialog"
            aria-label="Agente IA"
            data-agente-hoja=""
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={css(
              "position:absolute;top:calc(100% + 10px);right:0;z-index:60;width:min(300px,80vw);padding:var(--s4);" +
                "background:var(--bloque);color:var(--sobre-bloque);border:1px solid var(--bloque-borde);" +
                "border-radius:var(--r-lg);box-shadow:var(--shadow-lg);"
            )}
          >
            <div style={css("font-size:var(--t-mini);color:var(--oro-luz);")}>Próximamente</div>
            <div style={css("font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;margin-top:4px;")}>Asistente inteligente</div>
            <p style={css("margin:8px 0 0;font-size:var(--t-body);line-height:1.5;color:var(--sobre-bloque-2);")}>
              Para terapeutas. Un solo lugar para crecer y expandir tu conocimiento y tu empresa.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
