"use client";

/**
 * ============================================================================
 * LA REJILLA DE BASE 22, DIBUJÁNDOSE
 * ============================================================================
 *
 * No es un gráfico que aparece: es una tabla que se ARMA delante de quien mira.
 * Primero el día, el mes y el año —la madre, el Yo y el padre—, que es de donde
 * sale todo; después lo que se deduce de ellos; y las líneas se van tendiendo
 * conforme aparecen los dos extremos que unen.
 *
 * POR QUÉ ASÍ Y NO DE GOLPE. Esto es una escuela. Una tabla que aparece entera
 * es un resultado; una que se construye por delante es una explicación. Quien la
 * ve montarse entiende, sin que nadie se lo diga, que el nudo emocional sale de
 * la madre y del padre — porque ha visto salir la línea de ahí.
 *
 * Y por eso se puede volver a lanzar: el botón de «verla montarse otra vez» es
 * la herramienta de clase, no un adorno.
 *
 * ---------------------------------------------------------------------------
 * TRES ESTADOS, TRES DIBUJOS DISTINTOS.
 * ---------------------------------------------------------------------------
 * CONFIRMADA    círculo de aro dorado. La fórmula cuadra con la tabla de Iris
 *               y además hay fuente escrita publicada.
 * RECONSTRUIDA  igual, con un punto pequeño arriba a la derecha. Cuadra con la
 *               tabla, pero ninguna fuente accesible enuncia la fórmula: son
 *               las seis casillas del Espejo. El punto no es un adorno, es la
 *               diferencia entre «esto lo dice el libro» y «esto lo hemos
 *               deducido nosotros», y quien estudia aquí tiene derecho a verla.
 * PENDIENTE     círculo de trazo discontinuo y un interrogante en vez del
 *               número. Ahora mismo no hay ninguna, pero el dibujo lo soporta:
 *               si algún día se añade una casilla sin fórmula, saldrá marcada
 *               en rojo en vez de enseñar un número que nadie ha calculado.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { calculaBase22, type BaseNacimiento, type Calculada } from "@/lib/base22";

/* La rejilla en coordenadas. Seis columnas y seis filas, con la fila 3 —el nudo
   de dolor— y la 5 —la huida— casi vacías: el dibujo es ancho arriba y abajo, y
   estrecho en el centro, como en la tabla de Iris. */
const COL_X = [70, 210, 350, 490, 630, 780];
const FILA_Y = [60, 175, 300, 400, 510, 625];
const ANCHO = 860;
const ALTO = 700;
const RADIO = 30;

const punto = (p: { fila: number; col: number }) => ({ x: COL_X[p.col] ?? 350, y: FILA_Y[p.fila] ?? 300 });

/**
 * En qué orden se van encendiendo.
 *
 * No es el orden de la lista ni el de la rejilla: es el orden en que se
 * DEDUCEN. Primero los tres datos de la fecha, después lo que se saca de ellos
 * y al final lo que se saca de eso. Ver la tabla montarse en este orden es ver
 * la cuenta hacerse.
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

type Props = { base: BaseNacimiento; alElegir?: (p: Calculada) => void };

/**
 * La de fuera sólo lleva la cuenta de las veces que se ha pedido verla otra
 * vez, y esa cuenta es la `key` del dibujo.
 *
 * Así, «otra vez» no reinicia un contador a mano dentro de un efecto —que es
 * lo que había, y lo que React desaconseja— sino que tira el dibujo entero y
 * monta uno nuevo. Menos código y ningún estado que pueda quedarse a medias
 * entre dos vueltas.
 */
export default function RejillaBase22(props: Props) {
  const [vuelta, setVuelta] = useState(0);
  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s4);")}>
      <Dibujo key={vuelta} {...props} />
      <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
        <button
          onClick={() => setVuelta((v) => v + 1)}
          style={css(
            "background:var(--surface);border:1px solid var(--border-strong);color:var(--text-2);border-radius:999px;padding:9px 18px;font-size:var(--t-body);font-weight:560;cursor:pointer;"
          )}
        >
          Verla montarse otra vez
        </button>
        <span style={css("font-size:var(--t-mini);color:var(--text-4);")}>
          Cada casilla se puede pulsar para ver de dónde sale su número.
        </span>
        <span style={css("display:inline-flex;align-items:center;gap:6px;font-size:var(--t-mini);color:var(--text-4);")}>
          <svg width="10" height="10" aria-hidden style={{ display: "block" }}>
            <circle cx="5" cy="5" r="3.4" fill="var(--gold)" />
          </svg>
          Casilla deducida: cuadra con la tabla de Iris, pero no hay fuente escrita.
        </span>
      </div>
    </div>
  );
}

function Dibujo({ base, alElegir }: Props) {
  const quieto = useReducedMotion();
  const tabla = useMemo(() => calculaBase22(base), [base]);
  const porClave = useMemo(() => Object.fromEntries(tabla.map((p) => [p.k, p])), [tabla]);

  /* Cuántas tandas se han encendido ya. Empieza en cero y la suben los
     temporizadores; con el movimiento reducido apagado, empieza entera. */
  const [paso, setPaso] = useState(() => (quieto ? ORDEN.length : 0));

  useEffect(() => {
    if (quieto) return;
    const relojes = ORDEN.map((_, i) => setTimeout(() => setPaso(i + 1), 280 + i * 400));
    return () => relojes.forEach(clearTimeout);
  }, [quieto]);

  /** En qué tanda entra cada posición, para saber si ya toca pintarla. */
  const tandaDe = (k: string) => ORDEN.findIndex((t) => t.includes(k));
  const visible = (k: string) => tandaDe(k) < paso;

  /* Una línea sólo se tiende cuando están sus dos puntas. Media línea colgando
     de un círculo que todavía no existe se lee como un fallo de dibujo. */
  const lineas: { a: Calculada; b: Calculada; k: string }[] = [];
  const hechas = new Set<string>();
  for (const p of tabla) {
    for (const otro of p.une ?? []) {
      const q = porClave[otro];
      if (!q) continue;
      const k = [p.k, otro].sort().join("·");
      if (hechas.has(k)) continue;
      hechas.add(k);
      lineas.push({ a: p, b: q, k });
    }
  }

  return (
      <div
        style={css(
          "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);overflow-x:auto;"
        )}
      >
        <svg
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          style={{ width: "100%", minWidth: 640, height: "auto", display: "block" }}
          role="img"
          aria-label="Rejilla de numerología en base 22"
        >
          {/* ------------------------------------------------------- líneas */}
          <g>
            {lineas.map(({ a, b, k }) => {
              const pa = punto(a);
              const pb = punto(b);
              const dentro = visible(a.k) && visible(b.k);
              return (
                <motion.line
                  key={k}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke="var(--border-strong)"
                  strokeWidth={1.2}
                  initial={quieto ? false : { pathLength: 0, opacity: 0 }}
                  animate={dentro ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              );
            })}
          </g>

          {/* ----------------------------------------------------- círculos */}
          {tabla.map((p) => {
            const { x, y } = punto(p);
            const dentro = visible(p.k);
            const falta = p.valor === null;
            return (
              <motion.g
                key={p.k}
                initial={quieto ? false : { opacity: 0, scale: 0.7 }}
                animate={dentro ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: `${x}px ${y}px`, cursor: alElegir ? "pointer" : "default" }}
                onClick={() => alElegir?.(p)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={RADIO}
                  fill={falta ? "var(--surface)" : "var(--surface-2)"}
                  stroke={falta ? "var(--red)" : "var(--gold)"}
                  strokeWidth={falta ? 1.2 : 1.6}
                  strokeDasharray={falta ? "4 4" : undefined}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 22,
                    fontWeight: 600,
                    fill: falta ? "var(--red)" : "var(--text)",
                  }}
                >
                  {falta ? "?" : p.valor}
                </text>
                {/* El punto de «reconstruida». Arriba a la derecha del aro, del
                    tamaño justo para verse y no para gritar. */}
                {p.certeza === "reconstruido" && (
                  <circle cx={x + RADIO * 0.72} cy={y - RADIO * 0.72} r={3.4} fill="var(--gold)" />
                )}
                {/* El nombre debajo, partido en dos renglones cuando es largo:
                    a esta escala, «Personalidad externa social-profesional» en
                    una sola línea se sale por encima de los círculos vecinos. */}
                {dosRenglones(p.nombre).map((t, i) => (
                  <text
                    key={i}
                    x={x}
                    y={y + RADIO + 16 + i * 12}
                    textAnchor="middle"
                    style={{ fontFamily: "var(--font-ui)", fontSize: 10, fontWeight: 590, fill: "var(--text-3)" }}
                  >
                    {t}
                  </text>
                ))}
              </motion.g>
            );
          })}
        </svg>
      </div>
  );
}

/**
 * Partir un nombre largo en dos renglones por el hueco más cercano a la mitad.
 *
 * Se parte por donde el nombre respira y no por el número de letras: cortar
 * «social-profesional» a la mitad de la palabra se lee como un fallo, y a este
 * cuerpo de letra —10 px— no hay margen para disimularlo.
 */
function dosRenglones(t: string): string[] {
  if (t.length <= 18) return [t];
  const palabras = t.split(" ");
  const medio = t.length / 2;
  let mejor = 1;
  let corte = Infinity;
  for (let i = 1; i < palabras.length; i++) {
    const largo = palabras.slice(0, i).join(" ").length;
    if (Math.abs(largo - medio) < corte) {
      corte = Math.abs(largo - medio);
      mejor = i;
    }
  }
  return [palabras.slice(0, mejor).join(" "), palabras.slice(mejor).join(" ")];
}
