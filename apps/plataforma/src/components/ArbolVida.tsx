"use client";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { arbolGeometria } from "@/lib/arbol";
import type { Resultado } from "@/lib/engine";

/**
 * El Árbol de la Vida, uno solo para toda la plataforma: el panel, el resumen
 * y el documento impreso dibujan lo mismo y sólo cambian el acabado. Antes
 * había tres copias y las dos pequeñas se habían quedado atrás — sin nombres,
 * sin complementarios y sin animación.
 *
 * Lo que se ve, como está anotado a mano en la ficha:
 *
 *   · los 22 senderos en gris, el árbol entero siempre presente;
 *   · encima, los senderos de tus tres caminos, en trazo grueso y de color;
 *     si dos caminos caen en el mismo, van en paralelo, uno de cada color;
 *   · en discontinuo y corriendo, los caminos complementarios — la energía
 *     que acompaña, no la que se anda. También en paralelo cuando un mismo
 *     complementario viene de dos caminos;
 *   · el nombre del arcano escrito a lo largo de su sendero, girado con él;
 *   · el número del arcano al otro lado de la línea.
 */
export default function ArbolVida({
  r,
  animado = true,
  nombres = true,
  rotulos = true,
  fuente = "-apple-system, BlinkMacSystemFont, sans-serif",
  tenue,
  borde = "rgba(0,0,0,.22)",
  colorNombre = "var(--text-3)",
  estilo = "width:100%;height:auto;display:block;",
}: {
  r: Resultado;
  animado?: boolean;
  /** Nombres de las diez sefirot junto a su círculo. */
  nombres?: boolean;
  /** Nombres de los arcanos montados sobre sus senderos. */
  rotulos?: boolean;
  fuente?: string;
  /** Color de los senderos que no llevan ninguno de tus caminos. */
  tenue?: string;
  borde?: string;
  colorNombre?: string;
  estilo?: string;
}) {
  const quieto = useReducedMotion();
  const vivo = animado && !quieto;
  const { senderos, sefirot, marcasCamino, complementarios, rotulos: rots, rotulosComp } = arbolGeometria(r);

  return (
    <svg viewBox="-54 -8 488 676" style={css(estilo)}>
      {/* Los complementarios van los primeros, por debajo de todo. */}
      {complementarios.map((c, i) => (
        <motion.line
          key={"c" + i}
          x1={c.x1}
          y1={c.y1}
          x2={c.x2}
          y2={c.y2}
          stroke={c.color}
          strokeWidth={2.4}
          strokeOpacity={0.42}
          strokeLinecap="round"
          strokeDasharray="7 9"
          initial={vivo ? { opacity: 0 } : false}
          animate={vivo ? { opacity: 1, strokeDashoffset: [0, -32] } : { opacity: 1 }}
          transition={{
            opacity: { delay: c.delay, duration: 0.6 },
            strokeDashoffset: { duration: 1.6, repeat: Infinity, ease: "linear" },
          }}
        />
      ))}

      {senderos.map((s, i) => (
        <motion.line
          key={i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          stroke={tenue && s.w <= 2 ? tenue : s.color}
          strokeWidth={s.w}
          strokeOpacity={s.o}
          strokeLinecap="round"
          initial={vivo ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ delay: s.delay, duration: s.w > 2 ? 0.9 : 0.55, ease: [0.4, 0, 0.2, 1] }}
        />
      ))}

      {sefirot.map((p, i) => (
        <g key={i}>
          <motion.circle
            cx={p.x}
            cy={p.y}
            r={19}
            fill={p.fill}
            stroke={borde}
            strokeWidth={1}
            initial={vivo ? { opacity: 0, scale: 0.2 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: p.delay, duration: 0.62, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
          {nombres && (
            <motion.text
              x={p.tx}
              y={p.ty}
              fill={colorNombre}
              fontSize={13}
              fontFamily={fuente}
              fontWeight={510}
              textAnchor={p.anchor}
              initial={vivo ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ delay: p.delayT, duration: 0.5 }}
            >
              {p.nombre}
            </motion.text>
          )}
        </g>
      ))}

      {marcasCamino.map((m, i) => (
        <motion.text
          key={"m" + i}
          x={m.x}
          y={m.y}
          fill={m.color}
          fontSize={14}
          fontFamily={fuente}
          fontWeight={700}
          textAnchor="middle"
          initial={vivo ? { opacity: 0, scale: 0.5 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: m.delay, duration: 0.5, ease: [0.34, 1.4, 0.64, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          {m.n}
        </motion.text>
      ))}

      {/* Los nombres de los arcanos, montados sobre su sendero y girados con
       * él. Los de los caminos propios con más cuerpo; los de los
       * complementarios, más tenues. */}
      {rotulos &&
        [...rots.map((t) => ({ t, propio: true })), ...rotulosComp.map((t) => ({ t, propio: false }))].map(({ t, propio }, i) => (
          <motion.text
            key={"r" + i}
            x={t.x}
            y={t.y}
            fill={t.color}
            fontSize={propio ? 12 : 11}
            fontFamily={fuente}
            fontWeight={propio ? 640 : 560}
            fillOpacity={propio ? 0.95 : 0.7}
            textAnchor="middle"
            transform={`rotate(${t.rot.toFixed(2)} ${t.x.toFixed(2)} ${t.y.toFixed(2)})`}
            initial={vivo ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: t.delay, duration: 0.55 }}
          >
            {t.nombre}
          </motion.text>
        ))}
    </svg>
  );
}
