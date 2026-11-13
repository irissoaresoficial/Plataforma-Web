"use client";

/**
 * ============================================================================
 * LA MÁSCARA Y EL ESPEJO, DIBUJÁNDOSE
 * ============================================================================
 *
 * Es la lámina que Iris usa en clase —«La máscara y el espejo», de K. Hadar,
 * M. Dessors, S. Sellam y M. Pradal—, con los números de la persona dentro. No
 * es una rejilla de círculos iguales: es la forma de la lámina, porque es la
 * que Iris enseña y la que sus alumnas reconocen.
 *
 *   · Un RECTÁNGULO por fuera: EM, PES y BA arriba; NR a la izquierda; NH, PED
 *     y BEx abajo; y la personalidad profunda, un TRIÁNGULO, en el lado derecho.
 *   · Dentro, la figura: CIS y CES arriba, el nudo emocional en medio con su
 *     rombo, la fila de la familia —madre roja, Yo amarillo, padre azul—, el
 *     nudo de dolor en ROMBO debajo y CID y CED abajo.
 *   · Fuera, a la derecha, las dos búsquedas sueltas: emocional y espiritual.
 *
 * Cada línea es una pieza de la cuenta (ver `une` en lib/base22.ts) y lleva el
 * color que tiene en la lámina. Las de la fila central son flechas dobles: de
 * ida con «+» y de vuelta con «−», como en el original.
 *
 * Todas las posiciones están en el espacio de la lámina (880 × 1.040). Es
 * vertical, así que es la misma en ordenador y en móvil: lo único que cambia es
 * el tamaño del número, más grande en el móvil para que se lea.
 *
 * Se sigue armando delante de quien mira —primero el día, el mes y el año, y
 * luego lo que se deduce—, se toca para abrir la ficha, y al pasar por encima
 * se encienden las líneas que salen de la casilla.
 *
 * TRES ESTADOS. Confirmada: forma normal. Reconstruida: con un punto dorado
 * abajo a la derecha. Pendiente: trazo discontinuo y un interrogante, nunca un
 * número inventado.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { baseReducida, calculaBase22, cuentaDe, orejas, type BaseNacimiento, type Calculada } from "@/lib/base22";
import FichaGrafico, { type Contenido } from "./FichaGrafico";

/* ------------------------------------------------------------- colores --
   Los de la lámina, traducidos a los tokens de la plataforma. Ninguno es
   nuevo: el naranja es el melocotón de la casa y el morado el de la vía de
   destino, que son los más cercanos a los de la lámina. Los «-tx» se ajustan
   solos en oscuro. */
const C = {
  rojo: "var(--via-origen-tx)",
  rosa: "var(--rosa-tx)",
  naranja: "var(--melocoton-tx)",
  morado: "var(--via-destino-tx)",
  verde: "var(--green)",
  lima: "var(--lima-tx)",
  azul: "var(--via-transformacion-tx)",
  oro: "var(--gold)",
  oscuro: "var(--text)",
} as const;

/** La sigla que pone la lámina. La de clase (QE, RH…) sigue en la ficha. */
const SIGLA: Record<string, string> = {
  emersor: "EM",
  persExtSocial: "PES",
  busqArmonia: "BA",
  comportIntSocial: "CIS",
  comportExtSocial: "CES",
  nudoEmocional: "NE",
  resistencia: "NR",
  madre: "MADRE",
  yo: "YO",
  padre: "PADRE",
  persProfunda: "PP",
  busqEmocional: "BEm",
  busqEspiritual: "BEs",
  nudoDolor: "ND",
  comportIntDefensa: "CID",
  comportExtDefensa: "CED",
  huida: "NH",
  persExtDefensa: "PED",
  busqSalida: "BEx",
};

type Forma = "circulo" | "triangulo" | "rombo" | "suelto";

/**
 * Dónde cae cada casilla en la lámina, de qué color va su recuadro y qué forma
 * tiene. Las coordenadas están pensadas para el radio grande (el del móvil):
 * con él ya no se tocan las orejas de dos vecinos.
 */
const LAMINA: Record<string, { x: number; y: number; color: string; forma?: Forma }> = {
  emersor: { x: 80, y: 200, color: C.rojo },
  persExtSocial: { x: 405, y: 200, color: C.naranja },
  busqArmonia: { x: 720, y: 200, color: C.rosa },
  comportIntSocial: { x: 235, y: 360, color: C.naranja },
  comportExtSocial: { x: 575, y: 360, color: C.verde },
  nudoEmocional: { x: 405, y: 455, color: C.morado },
  resistencia: { x: 80, y: 600, color: C.rojo },
  madre: { x: 235, y: 600, color: C.rojo },
  yo: { x: 405, y: 600, color: C.oro },
  padre: { x: 575, y: 600, color: C.azul },
  persProfunda: { x: 720, y: 600, color: C.rosa, forma: "triangulo" },
  busqEmocional: { x: 820, y: 300, color: C.azul, forma: "suelto" },
  busqEspiritual: { x: 820, y: 440, color: C.lima, forma: "suelto" },
  nudoDolor: { x: 405, y: 790, color: C.rosa, forma: "rombo" },
  comportIntDefensa: { x: 235, y: 915, color: C.naranja },
  comportExtDefensa: { x: 575, y: 915, color: C.verde },
  huida: { x: 80, y: 1040, color: C.morado },
  persExtDefensa: { x: 405, y: 1040, color: C.oscuro },
  busqSalida: { x: 720, y: 1040, color: C.morado },
};

/** Las tres de la familia van rellenas, como en la lámina. Colores fijos en
 *  claro y en oscuro, así que la tinta de encima también es fija. */
const RELLENO: Record<string, { fondo: string; tinta: string }> = {
  madre: { fondo: "var(--via-origen)", tinta: "var(--sobre-bloque)" },
  yo: { fondo: "var(--oro-luz)", tinta: "var(--vino)" },
  padre: { fondo: "var(--via-transformacion)", tinta: "var(--sobre-bloque)" },
};

/** Las flechitas DN, MN y AN de la lámina: de qué dato de la fecha sale cada
 *  una. Dentro del dibujo no caben sin montarse en el móvil, así que van en la
 *  leyenda, junto a su nombre. */
const DATO: Record<string, string> = {
  madre: "día de nacimiento (DN)",
  yo: "mes de nacimiento (MN)",
  padre: "año de nacimiento (AN)",
};

type Trazo = {
  /** De dónde a dónde se dibuja (para las flechas y las curvas, importa). */
  de: string;
  a: string;
  color: string;
  forma?: "recta" | "curva" | "doble" | "flecha";
  /** El punto de control de la curva. */
  ctrl?: [number, number];
  signo?: "+" | "−";
};

/** Cada línea de la lámina, con su color. Si `une` trae una que no está aquí,
 *  se dibuja recta y oscura: mejor que no dibujarla. */
const TRAZOS: Trazo[] = [
  /* El rectángulo */
  { de: "emersor", a: "persExtSocial", color: C.rojo },
  { de: "persExtSocial", a: "busqArmonia", color: C.rosa },
  { de: "emersor", a: "resistencia", color: C.rojo },
  { de: "resistencia", a: "huida", color: C.morado },
  { de: "huida", a: "persExtDefensa", color: C.morado },
  { de: "persExtDefensa", a: "busqSalida", color: C.morado },
  { de: "busqArmonia", a: "persProfunda", color: C.rosa },
  { de: "persProfunda", a: "busqSalida", color: C.morado },
  /* Naranja: la mitad de la madre */
  { de: "persExtSocial", a: "comportIntSocial", color: C.naranja },
  { de: "persExtSocial", a: "comportExtSocial", color: C.naranja },
  { de: "comportIntSocial", a: "yo", color: C.naranja },
  { de: "comportIntSocial", a: "madre", color: C.naranja },
  { de: "madre", a: "comportIntDefensa", color: C.naranja },
  { de: "yo", a: "comportIntDefensa", color: C.naranja },
  /* Morado: el nudo emocional */
  { de: "madre", a: "nudoEmocional", color: C.morado },
  { de: "nudoEmocional", a: "padre", color: C.morado },
  /* Verde: la mitad del padre */
  { de: "comportExtSocial", a: "yo", color: C.verde },
  { de: "comportExtSocial", a: "padre", color: C.verde },
  { de: "padre", a: "comportExtDefensa", color: C.verde },
  { de: "yo", a: "comportExtDefensa", color: C.verde },
  /* Rosa: el nudo de dolor */
  { de: "madre", a: "nudoDolor", color: C.rosa },
  { de: "padre", a: "nudoDolor", color: C.rosa },
  /* Oscuro: la máscara */
  { de: "comportIntDefensa", a: "persExtDefensa", color: C.oscuro },
  { de: "comportExtDefensa", a: "persExtDefensa", color: C.oscuro },
  /* Las curvas hacia las búsquedas de fuera */
  { de: "nudoEmocional", a: "busqEmocional", color: C.azul, forma: "curva", ctrl: [620, 520] },
  { de: "yo", a: "busqEspiritual", color: C.lima, forma: "curva", ctrl: [560, 410] },
  { de: "persProfunda", a: "busqEmocional", color: C.rosa, forma: "curva", ctrl: [740, 380] },
  { de: "persProfunda", a: "busqEspiritual", color: C.rosa, forma: "curva", ctrl: [850, 590] },
  /* Las flechas de la fila central */
  { de: "madre", a: "yo", color: C.oscuro, forma: "doble" },
  { de: "yo", a: "padre", color: C.oscuro, forma: "doble" },
  { de: "padre", a: "persProfunda", color: C.oscuro, forma: "flecha", signo: "+" },
  { de: "madre", a: "resistencia", color: C.rojo, forma: "flecha", signo: "−" },
];
const clave = (a: string, b: string) => [a, b].sort().join("·");
const TRAZO_DE = Object.fromEntries(TRAZOS.map((t) => [clave(t.de, t.a), t]));

/** El lienzo: la lámina entera, con margen para orejas y recuadros. */
const VISTA = { x: 0, y: 110, w: 880, h: 1040 };

/**
 * Dos tamaños de la misma lámina. En el móvil la lámina mide unos 320 px de
 * ancho: con el número a 46 de 880 sale a unos 17 px, que se lee. En
 * ordenador, a 38, para que no parezca un cartel.
 */
const ANCHA = { r: 44, cifra: 38, rotulo: 21, movil: false };
const ESTRECHA = { r: 52, cifra: 46, rotulo: 26, movil: true };
type Tam = typeof ANCHA;

/** Por debajo de este ancho de hueco, el tamaño grande y la leyenda debajo. */
const ANCHO_MINIMO = 700;

/**
 * En qué orden se van encendiendo: el orden en que se DEDUCEN. Primero los
 * tres datos de la fecha, después lo que se saca de ellos, y así.
 */
const ORDEN = [
  ["madre", "yo", "padre"],
  ["persProfunda", "nudoEmocional", "resistencia"],
  ["busqEmocional", "busqEspiritual"],
  ["comportIntSocial", "comportExtSocial"],
  ["persExtSocial"],
  ["emersor", "busqArmonia"],
  ["nudoDolor", "comportIntDefensa", "comportExtDefensa"],
  ["persExtDefensa"],
  ["busqSalida", "huida"],
];

type Props = { base: BaseNacimiento };

/**
 * La de fuera lleva la cuenta de las veces que se ha pedido verla otra vez —esa
 * cuenta es la `key` del dibujo— y mide el hueco, que decide el tamaño. No sale
 * de una media query porque el panel tiene un lateral que se pliega.
 */
export default function RejillaBase22({ base }: Props) {
  const [vuelta, setVuelta] = useState(0);
  const [ancho, setAncho] = useState<number | null>(null);
  const hueco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = hueco.current;
    if (!el) return;
    const ojo = new ResizeObserver(([e]) => setAncho(e.contentRect.width));
    ojo.observe(el);
    return () => ojo.disconnect();
  }, []);

  const G = ancho !== null && ancho < ANCHO_MINIMO ? ESTRECHA : ANCHA;

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s4);")}>
      <div
        ref={hueco}
        style={css(
          "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);"
        )}
      >
        {ancho === null ? (
          <div style={css(`aspect-ratio:${VISTA.w}/${VISTA.h};max-width:560px;`)} />
        ) : (
          <Dibujo key={vuelta + "·" + G.r} base={base} G={G} />
        )}
      </div>

      <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
        <button
          onClick={() => setVuelta((v) => v + 1)}
          style={css(
            "background:var(--surface);border:1px solid var(--border-strong);color:var(--text-2);border-radius:var(--r-pill);padding:9px 18px;font-size:var(--t-body);font-weight:500;cursor:pointer;box-shadow:var(--nm-alto);"
          )}
        >
          Verla montarse otra vez
        </button>
        <span style={css("font-size:var(--t-mini);color:var(--text-4);")}>
          Toca cualquier casilla: se abre la cuenta y lo que significa.
        </span>
        <span style={css("display:inline-flex;align-items:center;gap:6px;font-size:var(--t-mini);color:var(--text-4);")}>
          <svg width="10" height="10" aria-hidden style={{ display: "block" }}>
            <circle cx="5" cy="5" r="3.4" fill="var(--gold)" />
          </svg>
          Casilla deducida: cuadra con la tabla de Iris, pero no hay fuente escrita.
        </span>
        <span style={css("font-size:var(--t-mini);color:var(--text-4);")}>
          Las orejas: 22 menos el número y 21 menos el número.
        </span>
      </div>
    </div>
  );
}

/** Una punta de flecha que acaba en (x2, y2). */
function punta(x1: number, y1: number, x2: number, y2: number, t: number) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (d: number, g: number) => `${x2 - t * Math.cos(a + g) * d},${y2 - t * Math.sin(a + g) * d}`;
  return `${x2},${y2} ${p(1, 0.45)} ${p(1, -0.45)}`;
}

function Dibujo({ base, G }: { base: BaseNacimiento; G: Tam }) {
  const quieto = useReducedMotion();
  const tabla = useMemo(() => calculaBase22(base), [base]);
  const reducida = useMemo(() => baseReducida(base), [base]);
  const porClave = useMemo(() => Object.fromEntries(tabla.map((p) => [p.k, p])), [tabla]);

  const [sobre, setSobre] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [paso, setPaso] = useState(() => (quieto ? ORDEN.length : 0));

  useEffect(() => {
    if (quieto) return;
    const relojes = ORDEN.map((_, i) => setTimeout(() => setPaso(i + 1), 280 + i * 400));
    return () => relojes.forEach(clearTimeout);
  }, [quieto]);

  const tandaDe = (k: string) => ORDEN.findIndex((t) => t.includes(k));
  const visible = (k: string) => tandaDe(k) < paso;

  /* Las líneas salen de `une`; la lámina sólo pone el color y la forma. */
  const lineas: Trazo[] = [];
  const hechas = new Set<string>();
  for (const p of tabla) {
    for (const otro of p.une ?? []) {
      if (!porClave[otro] || !LAMINA[otro] || !LAMINA[p.k]) continue;
      const k = clave(p.k, otro);
      if (hechas.has(k)) continue;
      hechas.add(k);
      lineas.push(TRAZO_DE[k] ?? { de: p.k, a: otro, color: C.oscuro });
    }
  }

  const activo = abierta ?? sobre;
  const i = tabla.findIndex((p) => p.k === abierta);
  const salta = (d: number) => setAbierta(tabla[(i + d + tabla.length) % tabla.length].k);

  const R = G.r;
  /** Radio de cada forma, para que las flechas acaben en el borde. */
  const borde = (k: string) => {
    const f = LAMINA[k].forma;
    return f === "suelto" ? R * 0.8 : f === "triangulo" ? R * 0.95 : f === "rombo" ? R * 1.05 : R;
  };
  const opacidad = (dentro: boolean, toca: boolean) => (!dentro ? 0 : activo && !toca ? 0.22 : 1);

  /** Un recuadro con la sigla, centrado en (x, y). */
  const recuadro = (x: number, y: number, t: string, color: string, relleno?: { fondo: string; tinta: string }) => {
    const h = G.rotulo * 1.45;
    const w = t.length * G.rotulo * 0.68 + G.rotulo * 0.9;
    return (
      <g style={{ pointerEvents: "none" }}>
        <rect
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          rx={h * 0.28}
          fill={relleno ? relleno.fondo : "var(--surface)"}
          stroke={relleno ? relleno.fondo : color}
          strokeWidth={1.6}
        />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontFamily: "var(--font-ui)", fontSize: G.rotulo, fontWeight: 500, fill: relleno ? relleno.tinta : color }}
        >
          {t}
        </text>
      </g>
    );
  };

  return (
    <div
      style={css(
        G.movil
          ? "display:flex;flex-direction:column;gap:var(--s5);"
          : "display:grid;grid-template-columns:minmax(0,560px) minmax(220px,1fr);gap:var(--gap-lg);align-items:center;"
      )}
    >
      <svg
        viewBox={`${VISTA.x} ${VISTA.y} ${VISTA.w} ${VISTA.h}`}
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        role="img"
        aria-label="La máscara y el espejo: la carta de numerología en base 22"
      >
        {/* ------------------------------------------------------- líneas */}
        <g>
          {lineas.map((l) => {
            const k = clave(l.de, l.a);
            const A = LAMINA[l.de];
            const B = LAMINA[l.a];
            const dentro = visible(l.de) && visible(l.a);
            const toca = activo === l.de || activo === l.a;
            const ancho = toca && activo ? 3.4 : 2;
            const op = opacidad(dentro, toca);

            if (l.forma === "doble" || l.forma === "flecha") {
              /* Flechas de borde a borde, en horizontal. */
              const dir = Math.sign(B.x - A.x);
              const x1 = A.x + dir * (borde(l.de) + 6);
              const x2 = B.x - dir * (borde(l.a) + 6);
              const cabeza = G.rotulo * 0.55;
              const sig = { fontFamily: "var(--font-ui)", fontSize: G.rotulo * 1.05, fontWeight: 500 } as const;
              const ida = (y: number, color: string, signo: string, arriba: boolean, de: number, a: number) => (
                <g>
                  <line x1={de} y1={y} x2={a - Math.sign(a - de) * cabeza * 0.6} y2={y} stroke={color} strokeWidth={ancho} />
                  <polygon points={punta(de, y, a, y, cabeza)} fill={color} />
                  <text
                    x={(de + a) / 2}
                    y={y + (arriba ? -G.rotulo * 0.6 : G.rotulo * 0.7)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{ ...sig, fill: color }}
                  >
                    {signo}
                  </text>
                </g>
              );
              return (
                <motion.g
                  key={k}
                  initial={quieto ? false : { opacity: 0 }}
                  animate={{ opacity: op }}
                  transition={{ duration: 0.45 }}
                  style={{ pointerEvents: "none" }}
                >
                  {l.forma === "doble" ? (
                    <>
                      {ida(A.y - R * 0.2, C.oscuro, "+", true, x1, x2)}
                      {ida(A.y + R * 0.2, C.rojo, "−", false, x2, x1)}
                    </>
                  ) : (
                    ida(A.y, l.color, l.signo ?? "", true, x1, x2)
                  )}
                </motion.g>
              );
            }

            const d =
              l.forma === "curva" && l.ctrl
                ? `M ${A.x} ${A.y} Q ${l.ctrl[0]} ${l.ctrl[1]} ${B.x} ${B.y}`
                : `M ${A.x} ${A.y} L ${B.x} ${B.y}`;
            return (
              <motion.path
                key={k}
                d={d}
                fill="none"
                stroke={l.color}
                strokeWidth={ancho}
                strokeLinecap="round"
                style={{ transition: "stroke-width .18s ease", pointerEvents: "none" }}
                initial={quieto ? false : { pathLength: 0, opacity: 0 }}
                animate={dentro ? { pathLength: 1, opacity: op } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })}
        </g>

        {/* ----------------------------------------------------- casillas */}
        {tabla.map((p) => {
          const L = LAMINA[p.k];
          if (!L) return null;
          const { x, y, color } = L;
          const forma = L.forma ?? "circulo";
          const dentro = visible(p.k);
          const falta = p.valor === null;
          const enciende = activo === p.k;
          const relleno = falta ? undefined : RELLENO[p.k];
          const r = forma === "suelto" ? R * 0.8 : R;
          const trazo = falta ? "var(--red)" : relleno ? relleno.fondo : color;
          const fondo = relleno ? relleno.fondo : "var(--surface)";
          const ancho = enciende ? 3.6 : 2.4;
          const dash = falta ? "6 6" : undefined;
          const atenuada = activo && !enciende && !(porClave[activo]?.une ?? []).includes(p.k) && !(p.une ?? []).includes(activo);

          /* La figura: círculo, triángulo o rombo, según la lámina. */
          const T = R * 1.3;
          const D = R * 1.18;
          const figura =
            forma === "triangulo" ? (
              <polygon
                points={`${x},${y - T} ${x + T * 0.92},${y + T * 0.58} ${x - T * 0.92},${y + T * 0.58}`}
                strokeLinejoin="round"
                fill={fondo}
                stroke={trazo}
                strokeWidth={ancho}
                strokeDasharray={dash}
              />
            ) : forma === "rombo" ? (
              <polygon
                points={`${x},${y - D} ${x + D},${y} ${x},${y + D} ${x - D},${y}`}
                strokeLinejoin="round"
                fill={fondo}
                stroke={trazo}
                strokeWidth={ancho}
                strokeDasharray={dash}
              />
            ) : (
              <circle cx={x} cy={y} r={r} fill={fondo} stroke={trazo} strokeWidth={ancho} strokeDasharray={dash} />
            );

          /* Dónde va su recuadro: debajo, salvo el NE (un rombo encima), el
             PP (a su derecha) y las dos búsquedas de fuera (encima: debajo
             chocarían una con otra). */
          const h = G.rotulo * 1.45;
          const sigla = SIGLA[p.k] ?? p.sigla ?? p.k;
          const etiqueta =
            p.k === "nudoEmocional" ? null : forma === "triangulo" ? (
              recuadro(x + T * 0.92 + G.rotulo * 0.2 + (sigla.length * G.rotulo * 0.68 + G.rotulo * 0.9) / 2, y + T * 0.45, sigla, color)
            ) : forma === "suelto" ? (
              recuadro(x, y - r - 8 - h / 2, sigla, color)
            ) : (
              recuadro(
                x,
                y + (forma === "rombo" ? D : r) + 8 + h / 2,
                sigla,
                color,
                relleno
              )
            );

          return (
            <motion.g
              key={p.k}
              className="grafico-toca"
              role="button"
              tabIndex={0}
              aria-label={`${p.nombre}${p.valor === null ? "" : ", " + p.valor}`}
              initial={quieto ? false : { opacity: 0, scale: 0.7 }}
              animate={dentro ? { opacity: atenuada ? 0.45 : 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: `${x}px ${y}px` }}
              onClick={() => setAbierta(p.k)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setAbierta(p.k);
                }
              }}
              onPointerEnter={() => setSobre(p.k)}
              onPointerLeave={() => setSobre((s) => (s === p.k ? null : s))}
              onFocus={() => setSobre(p.k)}
              onBlur={() => setSobre((s) => (s === p.k ? null : s))}
            >
              {/* El halo de la elegida. */}
              <circle
                cx={x}
                cy={y}
                r={(forma === "triangulo" ? T : forma === "rombo" ? D : r) + 9}
                fill="var(--gold-soft)"
                style={{ opacity: enciende ? 1 : 0, transition: "opacity .18s ease" }}
              />
              {/* El rombo del NE, encima de sus orejas, como en la lámina. */}
              {p.k === "nudoEmocional" && (
                <g style={{ pointerEvents: "none" }}>
                  {(() => {
                    const q = G.rotulo * 1.15;
                    const cy = y - R * 1.44 - 6 - q;
                    return (
                      <>
                        <polygon
                          points={`${x},${cy - q} ${x + q * 1.25},${cy} ${x},${cy + q} ${x - q * 1.25},${cy}`}
                          fill="var(--surface)"
                          stroke={color}
                          strokeWidth={1.6}
                          strokeLinejoin="round"
                        />
                        <text
                          x={x}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{ fontFamily: "var(--font-ui)", fontSize: G.rotulo * 0.9, fontWeight: 500, fill: color }}
                        >
                          NE
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
              {/* Las orejas: 22 − n a la izquierda y 21 − n a la derecha (ver
                  `orejas` en lib/base22.ts). Las dos búsquedas de fuera no
                  llevan, como en la lámina; su ficha sí las da. */}
              {!falta &&
                forma !== "suelto" &&
                orejas(p.valor as number).map((o, j) => {
                  const ox = x + (j === 0 ? -1 : 1) * R * 0.92;
                  const oy = y - R * 0.96;
                  return (
                    <g key={j} style={{ pointerEvents: "none" }}>
                      <circle cx={ox} cy={oy} r={R * 0.48} fill="var(--surface)" stroke={trazo} strokeWidth={1.6} />
                      <text
                        x={ox}
                        y={oy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{ fontFamily: "var(--font-ui)", fontSize: R * 0.5, fontWeight: 500, fill: relleno ? color : "var(--text-2)" }}
                      >
                        {o}
                      </text>
                    </g>
                  );
                })}
              {figura}
              <text
                x={x}
                y={forma === "triangulo" ? y + T * 0.14 : y}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: forma === "suelto" ? G.cifra * 0.88 : G.cifra,
                  fontWeight: 500,
                  fill: falta ? "var(--red)" : relleno ? relleno.tinta : "var(--text)",
                  pointerEvents: "none",
                }}
              >
                {falta ? "?" : p.valor}
              </text>
              {/* El punto de «casilla deducida», abajo a la derecha. */}
              {p.certeza === "reconstruido" && (
                <circle
                  cx={x + (forma === "rombo" ? D * 0.62 : r * 0.74)}
                  cy={y + (forma === "rombo" ? D * 0.62 : r * 0.74)}
                  r={G.rotulo * 0.24}
                  fill="var(--gold)"
                />
              )}
              {etiqueta}
            </motion.g>
          );
        })}
      </svg>

      {/* ------------------------------------------------------- leyenda --
          Lo que en la lámina va abajo: cada sigla con su nombre entero. Aquí
          además lleva el número y se toca igual que la casilla. */}
      <ul
        aria-label="Leyenda"
        style={css(
          `list-style:none;margin:0;padding:0;display:grid;gap:2px var(--s4);grid-template-columns:${G.movil ? "repeat(auto-fill,minmax(240px,1fr))" : "1fr"};`
        )}
      >
        {tabla.map((p) => {
          const L = LAMINA[p.k];
          const relleno = RELLENO[p.k];
          const enciende = activo === p.k;
          return (
            <li key={p.k}>
              <button
                onClick={() => setAbierta(p.k)}
                onPointerEnter={() => setSobre(p.k)}
                onPointerLeave={() => setSobre((s) => (s === p.k ? null : s))}
                style={css(
                  `width:100%;display:flex;align-items:center;gap:var(--s2);background:${enciende ? "var(--gold-soft)" : "transparent"};border:0;border-radius:var(--r-sm);padding:5px 8px;cursor:pointer;text-align:left;font-family:var(--font-ui);transition:background var(--mov);`
                )}
              >
                <span
                  style={css(
                    `flex:none;min-width:52px;text-align:center;font-size:var(--t-micro);font-weight:500;border-radius:var(--r-xs);padding:2px 6px;border:1.5px solid ${relleno ? relleno.fondo : L?.color};background:${relleno ? relleno.fondo : "transparent"};color:${relleno ? relleno.tinta : L?.color};`
                  )}
                >
                  {SIGLA[p.k] ?? p.sigla}
                </span>
                <span style={css("flex:1;font-size:var(--t-mini);color:var(--text-2);line-height:1.25;")}>
                  {p.nombre}
                  {DATO[p.k] && (
                    <span style={css("display:block;font-size:var(--t-micro);color:var(--text-4);")}>{DATO[p.k]}</span>
                  )}
                </span>
                <span style={css("flex:none;font-size:var(--t-body);font-weight:500;color:var(--text);font-variant-numeric:tabular-nums;")}>
                  {p.valor ?? "?"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <FichaGrafico
        contenido={abierta ? fichaDe(porClave[abierta], tabla, reducida) : null}
        alCerrar={() => setAbierta(null)}
        alAnterior={() => salta(-1)}
        alSiguiente={() => salta(1)}
        posicion={i >= 0 ? { i: i + 1, total: tabla.length } : undefined}
      />
    </div>
  );
}

/** La casilla, convertida en lo que la ficha sabe pintar. */
function fichaDe(p: Calculada, tabla: Calculada[], base: { dia: number; mes: number; anio: number }): Contenido {
  const c = cuentaDe(p.k, tabla, base);
  const bloques: Contenido["bloques"] = [];

  if (p.de) bloques.push({ label: "De dónde sale", texto: p.de + ".", tono: "normal" });
  if (p.valor !== null) {
    const [a, b] = orejas(p.valor);
    bloques.push({
      label: "Las orejas",
      tono: "normal",
      texto: `22 − ${p.valor} = ${a} a la izquierda y 21 − ${p.valor} = ${b} a la derecha.${p.valor >= 21 ? " Con 21 y 22 la resta da cero o menos: el cero se lee como 22. Pendiente de que Iris lo confirme." : ""}`,
    });
  }

  if (p.certeza === "reconstruido") {
    bloques.push({
      label: "Casilla deducida",
      tono: "oro",
      texto:
        "Esta fórmula da exactamente el número que tiene la tabla de Iris hecha a mano, y sigue la regla del Espejo —restar, el mayor menos el menor, y un cero se lee como 22—, pero ninguna fuente publicada la enuncia con estas palabras. Se enseña como deducción, no como cita.",
    });
  }
  if (p.aviso) bloques.push({ label: "Ojo con esto", texto: p.aviso, tono: "normal" });
  if (!p.calcula) {
    bloques.push({
      label: "Sin fórmula",
      tono: "rojo",
      texto:
        "Todavía no está la fórmula de esta casilla. No se rellena a ojo: un número inventado aquí acaba en el documento que se le entrega a la persona.",
    });
  }

  const mitad =
    p.mitad === "familia" ? "La familia" : p.mitad === "social" ? "La mitad social" : "El Espejo · la defensa";

  return {
    k: p.k,
    etiqueta: mitad,
    titulo: p.nombre,
    apunte: p.sigla,
    valor: p.valor,
    valorPie: p.valor9 !== null ? "en base 9, un " + p.valor9 : undefined,
    cuenta: c && c.pasos.length > 1 ? { pasos: c.pasos, op: c.op, bruto: c.bruto, redujo: c.redujo } : null,
    cuerpo: p.significado,
    bloques,
  };
}
