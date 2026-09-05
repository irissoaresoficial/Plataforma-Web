"use client";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import type { Resultado } from "@/lib/engine";
import { CONOS, CONO_APEX, CONO_BOCA, CONO_CORONA, CONO_RAIZ, EJE_CUERPO, EJE_CURVO, ESPEJO_CUERPO, PORTALES_CUERPO, RETICULA, SILUETA_PERFIL } from "@/lib/cuerpo";

const FUENTE = "-apple-system, BlinkMacSystemFont, sans-serif";
const GRIS = "#C6C4CB";
const AZUL = "#2C5D9E";
const VERDE = "#4C9A5A";
const ROJO = "#C0392B";

/* Se recorta por abajo antes de las piernas: de la rodilla para abajo no hay
 * ningún portal y eran doscientas unidades de lienzo vacío. La figura se
 * disuelve en degradado en vez de cortarse en seco. */
const VISTA = "-52 -78 404 626";

/**
 * La lámina de la ficha con los diez portales anotados como se anotan a mano
 * en NUEVA_FICHA_KABBALAH_IMPRIMIR.pdf (pág. 2):
 *
 *   · el número del portal, grande y en negro — el décimo se rotula 0;
 *   · su número dinámico en rojo, pequeño, abajo a la derecha;
 *   · un recuadro azul con la cifra de la fecha que abre el aprendizaje,
 *     repetida tantas veces como aparezca — el "55" del portal 2;
 *   · un subrayado verde en los portales que son maestría.
 *
 * Los números van sueltos sobre la figura, sin pastilla, como en la ficha.
 * La silueta se pinta reflejada (ESPEJO_CUERPO) para que mire a la izquierda,
 * hacia la columna del 3, 4, 5 y 6.
 * Lo único que cambia respecto al papel es hacia dónde sale el recuadro: en
 * la ficha va encima, y aquí hacia fuera, porque en pantalla las dos columnas
 * quedan más juntas y encima chocaba con el portal de arriba.
 */
export default function CuerpoPortales({ r }: { r: Resultado }) {
  const est = r.estructura;
  const quieto = useReducedMotion();

  const late = (i: number) =>
    quieto
      ? {}
      : {
          animate: { opacity: [0.5, 0.9, 0.5], scaleX: [0.95, 1.05, 0.95] },
          transition: { duration: 5.5 + i * 0.7, repeat: Infinity, ease: "easeInOut" as const },
        };

  return (
    <svg viewBox={VISTA} style={css("width:100%;height:auto;display:block;")}>
      <defs>
        {CONOS.map((c, i) => (
          <linearGradient key={i} id={`es33-cono-izq-${i}`} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={c.tono} stopOpacity="0.5" />
            <stop offset="100%" stopColor={c.tono} stopOpacity="0" />
          </linearGradient>
        ))}
        {CONOS.map((c, i) => (
          <linearGradient key={"d" + i} id={`es33-cono-der-${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={c.tono} stopOpacity="0.5" />
            <stop offset="100%" stopColor={c.tono} stopOpacity="0" />
          </linearGradient>
        ))}
        <linearGradient id="es33-corona" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#7B5EA7" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7B5EA7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="es33-raiz" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0392B" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C0392B" stopOpacity="0" />
        </linearGradient>
        <clipPath id="es33-recorte-cuerpo">
          <path d={SILUETA_PERFIL} />
        </clipPath>
        <linearGradient id="es33-desvanece" x1="0" y1="446" x2="0" y2="540" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="es33-pie">
          <rect x="-52" y="-78" width="404" height="524" fill="#fff" />
          <rect x="-52" y="446" width="404" height="100" fill="url(#es33-desvanece)" />
        </mask>
      </defs>

      {CONOS.map((c, i) => (
        <g key={c.y}>
          <motion.path
            d={`M${EJE_CUERPO - CONO_APEX} ${c.y} L-14 ${c.y - CONO_BOCA} L-14 ${c.y + CONO_BOCA} Z`}
            fill={`url(#es33-cono-izq-${i})`}
            style={{ transformBox: "fill-box", transformOrigin: "right center" }}
            {...late(i)}
          />
          <motion.path
            d={`M${EJE_CUERPO + CONO_APEX} ${c.y} L314 ${c.y - CONO_BOCA} L314 ${c.y + CONO_BOCA} Z`}
            fill={`url(#es33-cono-der-${i})`}
            style={{ transformBox: "fill-box", transformOrigin: "left center" }}
            {...late(i + 1)}
          />
        </g>
      ))}
      <motion.path d={CONO_CORONA} fill="url(#es33-corona)" style={{ transformBox: "fill-box", transformOrigin: "bottom center" }} {...late(2)} />

      <motion.g mask="url(#es33-pie)" initial={quieto ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
        {/* El espejo va aquí dentro y no en el grupo enmascarado: así el
         * recorte de la retícula se refleja con la silueta y el degradado del
         * pie sigue leyéndose en las coordenadas del lienzo. */}
        <g transform={ESPEJO_CUERPO}>
          <path d={SILUETA_PERFIL} fill={GRIS} />
          <g clipPath="url(#es33-recorte-cuerpo)" stroke="#fff" strokeLinecap="round" fill="none" strokeOpacity={0.92} strokeWidth={2.2}>
            <path d={EJE_CURVO} />
            {RETICULA.map((l) => (
              <line key={l.y} x1={l.x1 - 4} y1={l.y} x2={l.x2 + 4} y2={l.y} />
            ))}
          </g>
        </g>
      </motion.g>
      <motion.path d={CONO_RAIZ} fill="url(#es33-raiz)" style={{ transformBox: "fill-box", transformOrigin: "top center" }} {...late(4)} />

      {PORTALES_CUERPO.map((p, i) => {
        const veces = est.aprendizajes[p.portal] || 0;
        const maestria = est.maestrias.includes(p.portal);
        const dinamico = est.dinamicos[p.portal];
        const cifra = String(dinamico).repeat(veces);
        const anchoCaja = 18 + cifra.length * 13;

        // Hacia fuera y un poco arriba. En la corona y en la raíz no hay
        // "fuera", así que ahí el recuadro sí va encima, como en la ficha.
        const cajaCx = p.lado === 0 ? p.x : p.x + p.lado * (26 + anchoCaja / 2);
        const cajaCy = p.lado === 0 ? p.y - 40 : p.y - 22;

        return (
          <motion.g
            key={p.portal}
            initial={quieto ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <text x={p.x} y={p.y + 11} fill="var(--text)" fontSize={32} fontFamily={FUENTE} fontWeight={700} textAnchor="middle" letterSpacing="-0.02em">
              {p.etiqueta}
            </text>
            <text x={p.x + 13} y={p.y + 19} fill={ROJO} fontSize={16} fontFamily={FUENTE} fontWeight={600} textAnchor="start">
              {dinamico}
            </text>

            {/* Subrayado verde: el portal viene resuelto, es maestría. */}
            {maestria && (
              <motion.line
                x1={p.x - 16}
                y1={p.y + 23}
                x2={p.x + 10}
                y2={p.y + 23}
                stroke={VERDE}
                strokeWidth={3.4}
                strokeLinecap="round"
                strokeOpacity={0.85}
                initial={quieto ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.7 + i * 0.05, duration: 0.4 }}
              />
            )}

            {veces > 0 && (
              <motion.g
                initial={quieto ? false : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.85 + i * 0.05, duration: 0.42, ease: [0.34, 1.4, 0.64, 1] }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <rect
                  x={cajaCx - anchoCaja / 2}
                  y={cajaCy - 15}
                  width={anchoCaja}
                  height={30}
                  rx={8}
                  fill="var(--surface-solid)"
                  stroke={AZUL}
                  strokeWidth={2.4}
                />
                <text x={cajaCx} y={cajaCy + 7} fill={AZUL} fontSize={18} fontFamily={FUENTE} fontWeight={700} textAnchor="middle" letterSpacing="0.03em">
                  {cifra}
                </text>
              </motion.g>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}
