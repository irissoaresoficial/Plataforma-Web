"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { SEF, SENDEROS } from "@/lib/tree";
import { arbolGeometria } from "@/lib/arbol";
import type { Idioma } from "@/lib/documento";
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
  idioma = "es",
  alElegirSendero,
}: {
  r: Resultado;
  animado?: boolean;
  /**
   * Qué hacer cuando se toca un sendero. Sólo lo pasa el panel: en el documento
   * impreso no hay nada que tocar, y allí estas zonas ni siquiera se dibujan.
   *
   * El árbol tiene 22 senderos y cada uno ES un arcano —el índice del sendero
   * es el número del arcano—, así que tocar una línea es preguntar por esa
   * carta. Hasta ahora el dibujo era sólo para mirar y las cartas había que
   * buscarlas en otra pantalla.
   */
  alElegirSendero?: (arcano: number) => void;
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
  /** Dentro del árbol van escritos los nombres de las sefirot y de los arcanos
   *  de cada sendero: en el documento salen en su idioma, y en el panel de
   *  Iris siguen en español, que es donde no se pasa nada. */
  idioma?: Idioma;
}) {
  const quieto = useReducedMotion();
  const vivo = animado && !quieto;
  const { senderos, sefirot, marcasCamino, complementarios, rotulos: rots, rotulosComp } = arbolGeometria(r, idioma);
  const [sobre, setSobre] = useState<number | null>(null);

  return (
    <svg viewBox="-54 -8 488 676" style={css(estilo)}>
      {/* El resalte del sendero por el que se está pasando. Va debajo de todo
          lo demás: es un engrosamiento del propio camino, no una capa encima. */}
      {alElegirSendero && sobre !== null && (
        <line
          x1={SEF[SENDEROS[sobre][0]].x}
          y1={SEF[SENDEROS[sobre][0]].y}
          x2={SEF[SENDEROS[sobre][1]].x}
          y2={SEF[SENDEROS[sobre][1]].y}
          stroke="var(--gold)"
          strokeWidth={13}
          strokeOpacity={0.28}
          strokeLinecap="round"
        />
      )}
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
          /*
           * Las discontinuas marchan dos vueltas y se paran.
           *
           * Iban con `repeat: Infinity`: a los diez segundos de haber entrado en
           * la sección seguían avanzando, y siguen mientras esté abierta. El
           * árbol es la única pantalla que está para mirar con calma —es lo que
           * Iris gira hacia la clienta— y cuatro hileras de hormigas marchando
           * debajo del texto es ruido permanente justo donde hace falta quietud.
           *
           * Dos vueltas bastan para decir lo que tienen que decir: «este camino
           * no es el tuyo, es el que hace pareja». Dicho eso, se callan.
           */
          transition={{
            opacity: { delay: c.delay, duration: 0.45 },
            strokeDashoffset: { delay: c.delay, duration: 1.4, repeat: 1, ease: "linear" },
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

      {/* ------------------------------------------------ LO QUE SE TOCA
          Van las últimas, encima de todo, y son invisibles: una línea gruesa
          y transparente por cada sendero.

          El trazo real tiene entre 1,4 y 4 px de ancho en las unidades del
          dibujo — o sea, dos o tres píxeles en pantalla. Nadie acierta eso con
          el dedo. Estas zonas tienen 20, que es la medida a la que un dedo da
          sin apuntar, y no se ven porque no pintan nada: sólo escuchan.

          `pointerEvents="stroke"` es lo que hace que escuche la línea y no su
          caja: sin eso, un sendero en diagonal se tragaría los toques de medio
          árbol. */}
      {alElegirSendero &&
        SENDEROS.map(([a, b], i) => (
          <line
            key={"z" + i}
            x1={SEF[a].x}
            y1={SEF[a].y}
            x2={SEF[b].x}
            y2={SEF[b].y}
            stroke="transparent"
            strokeWidth={20}
            strokeLinecap="round"
            pointerEvents="stroke"
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label={"Arcano " + i}
            onClick={() => alElegirSendero(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                alElegirSendero(i);
              }
            }}
            onPointerEnter={() => setSobre(i)}
            onPointerLeave={() => setSobre((s) => (s === i ? null : s))}
            onFocus={() => setSobre(i)}
            onBlur={() => setSobre((s) => (s === i ? null : s))}
          />
        ))}
    </svg>
  );
}
