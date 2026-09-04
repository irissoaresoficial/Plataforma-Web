"use client";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import type { ImagenAlma } from "@/lib/engine";

const AZUL = "#2C5D9E";
const ROJO = "#C0392B";
const VERDE = "#4C9A5A";

/**
 * La tabla de la imagen del alma con la notación de la ficha
 * (NUEVA_FICHA_KABBALAH_IMPRIMIR.pdf, pág. 3):
 *
 *   · nueve casillas en tres filas — espíritu, alma y materia — y la décima,
 *     el 10/0, cruzando por debajo;
 *   · en cada casilla el número del plano, grande, con su móvil en azul
 *     pequeño al lado;
 *   · si el plano está bloqueado, el número se escribe en azul y repetido
 *     tantas veces como pese el bloqueo;
 *   · si el plano trae ayuda, un recuadro rojo arriba con la cifra móvil,
 *     repetida tantas veces como ayudas haya;
 *   · un punto verde en la casilla de proyección.
 *
 * Es la misma lógica de la estructura energética: el motor calcula y el
 * dibujo repite lo que Iris escribiría a mano.
 */
export default function TablaAlma({ ia }: { ia: ImagenAlma }) {
  const quieto = useReducedMotion();

  const casilla = (n: number, i: number) => {
    const etiqueta = n === 10 ? "10/0" : String(n);
    const movil = ia.moviles[n];
    const bloqueo = ia.bloqueos[n] || 0;
    const ayuda = ia.ayudas[n] || 0;
    const verde = ia.proyeccion === n;
    // Bloqueado: el número del plano se escribe en azul y repetido.
    const texto = bloqueo ? etiqueta.repeat(bloqueo) : etiqueta;
    const cifraAyuda = ayuda ? String(movil).repeat(ayuda) : "";

    return (
      <motion.div
        key={n}
        initial={quieto ? false : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.06 + i * 0.05, duration: 0.42, ease: [0.34, 1.4, 0.64, 1] }}
        style={css(
          "position:relative;display:flex;align-items:flex-end;justify-content:center;gap:2px;min-height:78px;padding:var(--s4) var(--s2) var(--s3);border-radius:var(--r-sm);border:1px solid " +
            (bloqueo ? "color-mix(in srgb, " + AZUL + " 40%, transparent)" : "var(--border)") +
            ";background:" +
            (bloqueo ? "color-mix(in srgb, " + AZUL + " 8%, transparent)" : "color-mix(in srgb, var(--text) 3.5%, transparent)") +
            ";"
        )}
      >
        {/* El recuadro rojo de la ayuda va arriba, saliéndose un poco de la
         * casilla, como está anotado a mano. */}
        {ayuda > 0 && (
          <motion.span
            initial={quieto ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.04, duration: 0.35 }}
            style={css(
              `position:absolute;top:-11px;right:6px;display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;padding:0 6px;border-radius:5px;background:var(--surface-solid);border:2px solid ${ROJO};color:${ROJO};font-size:var(--t-mini);font-weight:700;line-height:1;letter-spacing:.04em;`
            )}
          >
            {cifraAyuda}
          </motion.span>
        )}

        {verde && (
          <motion.span
            initial={quieto ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, duration: 0.4, ease: [0.34, 1.5, 0.64, 1] }}
            title="Punto verde · proyección"
            style={css(`position:absolute;top:8px;right:9px;width:12px;height:12px;border-radius:50%;background:${VERDE};`)}
          />
        )}

        <span
          data-cifras=""
          style={css(
            `font-size:${bloqueo > 2 ? 20 : 26}px;font-weight:700;line-height:1;letter-spacing:-.02em;color:${bloqueo ? AZUL : "var(--text)"};`
          )}
        >
          {texto}
        </span>
        <span style={css(`font-size:var(--t-mini);font-weight:600;line-height:1.4;color:${AZUL};`)}>{movil}</span>
      </motion.div>
    );
  };

  const filas: Array<[string, number[]]> = [
    ["Espíritu", [1, 2, 3]],
    ["Alma", [4, 5, 6]],
    ["Materia", [7, 8, 9]],
  ];

  return (
    <div>
      <div style={css("display:grid;grid-template-columns:58px repeat(3,minmax(0,1fr));gap:var(--s2);align-items:center;")}>
        {filas.map(([label, celdas], fi) => (
          <div key={label} style={css("display:contents;")}>
            <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>{label}</span>
            {celdas.map((n, ci) => casilla(n, fi * 3 + ci))}
          </div>
        ))}
        <span />
        <div style={css("grid-column:2 / -1;")}>{casilla(10, 9)}</div>
      </div>

      <div style={css("display:flex;flex-wrap:wrap;gap:var(--s4);margin-top:var(--s4);font-size:var(--t-mini);color:var(--text-3);")}>
        <span style={css("display:inline-flex;align-items:center;gap:6px;")}>
          <span style={css(`width:13px;height:13px;border-radius:3px;background:color-mix(in srgb, ${AZUL} 22%, transparent);border:1px solid color-mix(in srgb, ${AZUL} 45%, transparent);`)} />
          Plano bloqueado
        </span>
        <span style={css("display:inline-flex;align-items:center;gap:6px;")}>
          <span style={css(`width:13px;height:13px;border-radius:3px;border:2px solid ${ROJO};`)} />
          Ayuda espiritual
        </span>
        <span style={css("display:inline-flex;align-items:center;gap:6px;")}>
          <span style={css(`width:11px;height:11px;border-radius:50%;background:${VERDE};`)} />
          Punto verde
        </span>
        <span style={css("display:inline-flex;align-items:center;gap:6px;")}>
          <span style={css(`font-size:var(--t-mini);font-weight:600;color:${AZUL};`)}>7</span>
          Número móvil
        </span>
      </div>
    </div>
  );
}
