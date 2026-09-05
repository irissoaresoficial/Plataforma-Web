"use client";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import Particulas from "../Particulas";

/**
 * El sitio de una disciplina que todavía no está hecha.
 *
 * Existe para que Feng Shui y Numerología tengan ya su hueco en la
 * navegación: al abrirlas se ve que están previstas y sin desarrollar, en vez
 * de una pantalla en blanco o un enlace que no lleva a ninguna parte.
 */
export default function Pendiente({ titulo, pie }: { titulo: string; pie: string }) {
  const quieto = useReducedMotion();

  return (
    <motion.div
      initial={quieto ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={css(
        "position:relative;overflow:hidden;isolation:isolate;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:clamp(40px,8vw,84px) var(--pad-card);text-align:center;"
      )}
    >
      <div style={css("position:absolute;inset:0;z-index:0;pointer-events:none;")}>
        <Particulas cantidad={22} />
      </div>
      <div style={css("position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:var(--s3);")}>
        <span
          style={css(
            "display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:980px;background:var(--gold-soft);color:var(--gold-deep);font-size:var(--t-mini);font-weight:590;"
          )}
        >
          Pendiente para desarrollar
        </span>
        <h2 style={css("font-size:var(--t-head);margin:var(--s2) 0 0;")}>{titulo}</h2>
        <p style={css("font-size:var(--t-read);line-height:1.6;color:var(--text-3);margin:0;max-width:52ch;text-wrap:pretty;")}>{pie}</p>
      </div>
    </motion.div>
  );
}
