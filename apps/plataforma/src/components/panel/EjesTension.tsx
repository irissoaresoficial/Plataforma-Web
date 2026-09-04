"use client";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import type { Resultado } from "@/lib/engine";

const ROJO = "#C0392B";

/**
 * La escalera E/M de la ficha (NUEVA_FICHA_KABBALAH_IMPRIMIR.pdf, pág. 2).
 *
 * En la hoja impresa viene una columna E y una columna M con los números
 * puestos así:
 *
 *          2
 *      3       1
 *      4       0
 *      5       9
 *      6       8
 *          7
 *
 * No es una lista: es el anillo de los diez portales abierto en dos mitades.
 * El 2 arriba y el 7 abajo caen sobre el eje; por el lado E se baja 3, 4, 5, 6
 * y por el M se baja 1, 0, 9, 8. Puestos así, cada eje de tensión del manual
 * —2-7 masculinidad, 3-8 feminidad, 1-6 espíritu y materia, 4-9 karma,
 * 5-10 transformación— es una línea que cruza de un lado al otro, y por eso la
 * ficha los dibuja aquí en vez de enumerarlos.
 *
 * Los ejes van en línea continua y los planos de consciencia en discontinua;
 * en rojo los que están en tensión en esta carta, que es lo que el motor ya
 * sabía y sólo se enseñaba como lista.
 */

/** Dónde cae cada portal en la escalera. El 10 se rotula 0, como en la hoja. */
const SITIO: Record<number, { x: number; y: number }> = {
  2: { x: 108, y: 30 },
  3: { x: 62, y: 78 },
  1: { x: 154, y: 78 },
  4: { x: 62, y: 124 },
  10: { x: 154, y: 124 },
  5: { x: 62, y: 170 },
  9: { x: 154, y: 170 },
  6: { x: 62, y: 216 },
  8: { x: 154, y: 216 },
  7: { x: 108, y: 264 },
};

export default function EjesTension({ r }: { r: Resultado }) {
  const quieto = useReducedMotion();

  const lineas = [
    ...r.ejes.map((e) => ({ a: e.eje.a, b: e.eje.b, activo: e.activo, nombre: e.eje.nombre, eje: true })),
    ...r.planosTension.map((p) => ({ a: p.plano.a, b: p.plano.b, activo: p.activo, nombre: p.plano.nombre, eje: false })),
  ].filter((l) => SITIO[l.a] && SITIO[l.b]);

  const enTension = lineas.filter((l) => l.activo);
  // Un portal está tenso si lo está alguna de las líneas que pasan por él.
  const portalTenso = new Set(enTension.flatMap((l) => [l.a, l.b]));

  return (
    <div>
      <svg viewBox="0 0 216 294" style={css("width:100%;max-width:260px;height:auto;display:block;margin:0 auto;")}>
        {/* Las dos columnas, como están rotuladas en la hoja. */}
        <text x="62" y="12" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-4)">
          E
        </text>
        <text x="154" y="12" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-4)">
          M
        </text>

        {lineas.map((l, i) => {
          const A = SITIO[l.a],
            B = SITIO[l.b];
          return (
            <motion.line
              key={i}
              x1={A.x}
              y1={A.y}
              x2={B.x}
              y2={B.y}
              stroke={l.activo ? ROJO : "var(--border-strong)"}
              strokeWidth={l.activo ? 2 : 1.2}
              strokeDasharray={l.eje ? undefined : "5 5"}
              strokeLinecap="round"
              // Se anima la opacidad y no el trazado: al animar `pathLength`,
              // framer pone pathLength="1" en la línea y el discontinuo pasa a
              // medirse sobre esa longitud normalizada — los planos salían
              // continuos, sin forma de distinguirlos de los ejes.
              initial={quieto ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.45 }}
            />
          );
        })}

        {Object.entries(SITIO).map(([n, p], i) => {
          const portal = +n;
          const tenso = portalTenso.has(portal);
          return (
            <motion.g
              key={n}
              initial={quieto ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.4, ease: [0.34, 1.5, 0.64, 1] }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r="15"
                fill="var(--surface)"
                stroke={tenso ? ROJO : "var(--border-strong)"}
                strokeWidth={tenso ? 1.8 : 1.2}
              />
              <text
                x={p.x}
                y={p.y + 6}
                textAnchor="middle"
                fontSize="17"
                fontWeight="600"
                fill={tenso ? ROJO : "var(--text-2)"}
              >
                {portal === 10 ? "0" : portal}
              </text>
            </motion.g>
          );
        })}
      </svg>

      <div style={css("display:flex;flex-wrap:wrap;gap:var(--s3) var(--s4);justify-content:center;margin-top:var(--s4);font-size:var(--t-mini);color:var(--text-3);")}>
        <span style={css("display:inline-flex;align-items:center;gap:7px;")}>
          <svg width="22" height="6" aria-hidden="true">
            <line x1="1" y1="3" x2="21" y2="3" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Eje
        </span>
        <span style={css("display:inline-flex;align-items:center;gap:7px;")}>
          <svg width="22" height="6" aria-hidden="true">
            <line x1="1" y1="3" x2="21" y2="3" stroke="var(--text-3)" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
          </svg>
          Plano
        </span>
        <span style={css("display:inline-flex;align-items:center;gap:7px;color:" + ROJO + ";")}>
          <svg width="22" height="6" aria-hidden="true">
            <line x1="1" y1="3" x2="21" y2="3" stroke={ROJO} strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          En tensión
        </span>
      </div>

      <p style={css("font-size:var(--t-body);line-height:1.5;color:var(--text-3);margin:var(--s4) 0 0;text-align:center;text-wrap:pretty;")}>
        {enTension.length === 0
          ? "Ningún eje ni plano queda en tensión en esta carta."
          : "En tensión: " + enTension.map((l) => l.nombre).join(" · ")}
      </p>
    </div>
  );
}
