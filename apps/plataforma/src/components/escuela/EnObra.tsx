"use client";

/**
 * ============================================================================
 * «ESTO TODAVÍA NO ESTÁ, Y ASÍ VA A SER»
 * ============================================================================
 *
 * POR QUÉ EXISTE UNA PANTALLA QUE NO HACE NADA.
 *
 * La escuela se construye por trozos, y durante unas semanas el menú va a
 * tener entradas que llevan a sitios a medio hacer. Hay dos formas de llevar
 * eso y sólo una es honrada:
 *
 *   · Enseñar la pantalla ya montada pero vacía, con sus botones puestos.
 *     Parece terminada, se pulsa y no pasa nada. Quien lo ve concluye que está
 *     ROTO, no que está por hacer — y a partir de ahí desconfía de todo lo
 *     demás, incluido lo que sí funciona.
 *
 *   · Decirlo. Esta pantalla.
 *
 * No es un cartel de «próximamente» de los que no dicen nada. Dice qué va a
 * haber aquí exactamente, en qué fase de la hoja de ruta entra, y qué está
 * esperando. Eso sirve para dos cosas: Gerson ve por dónde va la obra sin
 * preguntar, e Iris —cuando entre— sabe qué puede prometer y qué no.
 *
 * SE BORRA. Cada vez que una de estas pantallas se construye de verdad, esta
 * se quita de esa ruta. Cuando no quede ninguna, este archivo desaparece. Si
 * dentro de seis meses sigue aquí, es que algo se quedó por el camino, y eso
 * también es información.
 */

import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";

export type Obra = {
  /** Cómo se llama la pantalla. El mismo nombre que en el menú. */
  titulo: string;
  /** Una frase de qué es esto, en cristiano. */
  resumen: string;
  /** Lo que va a haber aquí, cosa por cosa. Nada de promesas vagas. */
  tendra: string[];
  /** En qué fase de la hoja de ruta entra. */
  fase: string;
  /**
   * Lo que hace falta antes, si hace falta algo. Vacío cuando sólo falta
   * construirlo. Una obra parada por una decisión no es lo mismo que una obra
   * que va en su turno, y confundirlas hace que nadie tome la decisión.
   */
  espera?: string;
};

export default function EnObra({ titulo, resumen, tendra, fase, espera }: Obra) {
  const quieto = useReducedMotion();

  return (
    <motion.div
      initial={quieto ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={css(
        "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
          "padding:clamp(28px,5vw,56px) var(--pad-card);box-shadow:var(--nm-alto);max-width:72ch;"
      )}
    >
      <span
        style={css(
          "display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:var(--r-pill);" +
            "background:var(--gold-soft);color:var(--gold-deep);font-size:var(--t-mini);font-weight:590;"
        )}
      >
        <span aria-hidden style={css("display:block;width:6px;height:6px;border-radius:50%;background:currentColor;")} />
        {fase}
      </span>

      <h2 style={css("font-size:var(--t-head);margin:var(--s3) 0 var(--s2);")}>{titulo}</h2>

      <p style={css("font-size:var(--t-read);line-height:1.65;color:var(--text-3);margin:0;text-wrap:pretty;")}>
        {resumen}
      </p>

      <div style={css("margin-top:var(--s5);")}>
        <h3
          style={css(
            "font-size:var(--t-micro);font-weight:600;letter-spacing:.13em;text-transform:uppercase;" +
              "color:var(--text-4);margin:0 0 var(--s3);"
          )}
        >
          Lo que va a haber aquí
        </h3>
        <ul style={css("list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:var(--s2);")}>
          {tendra.map((x, i) => (
            <motion.li
              key={x}
              initial={quieto ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={css(
                "display:flex;gap:11px;align-items:flex-start;font-size:var(--t-read);" +
                  "line-height:1.55;color:var(--text-2);"
              )}
            >
              <span
                aria-hidden
                style={css(
                  "flex:none;margin-top:8px;width:5px;height:5px;border-radius:50%;background:var(--text-4);"
                )}
              />
              <span style={css("text-wrap:pretty;")}>{x}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Una obra parada por una decisión se señala distinto que una obra que
          simplemente no ha llegado su turno: ésta necesita que alguien decida,
          y si no se distingue, nadie decide. */}
      {espera && (
        <p
          style={css(
            "margin:var(--s5) 0 0;padding:12px 14px;border-radius:var(--r-sm);" +
              "border:1px solid var(--border);background:color-mix(in srgb, var(--text) 4%, transparent);" +
              "font-size:var(--t-mini);line-height:1.55;color:var(--text-3);"
          )}
        >
          <strong style={css("color:var(--text-2);")}>Antes hace falta decidir:</strong> {espera}
        </p>
      )}
    </motion.div>
  );
}
