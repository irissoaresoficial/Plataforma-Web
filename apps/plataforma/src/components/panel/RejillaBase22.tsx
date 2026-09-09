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
 * ---------------------------------------------------------------------------
 * CABE EN LA PANTALLA. SIEMPRE.
 * ---------------------------------------------------------------------------
 * Antes el dibujo tenía un ancho mínimo de 640 px y se salía: en una tableta
 * había que arrastrar de lado para ver la mitad derecha de la carta, y una
 * carta que no se ve entera no es una carta, es un plano.
 *
 * Ahora hay DOS DIBUJOS del mismo sistema y se elige por el ancho que hay:
 *
 *   · ANCHO   la rejilla de siempre, con el nombre entero debajo de cada
 *             círculo. Es la de trabajar en mesa.
 *   · ESTRECHO  la misma rejilla apretada, sin nombres largos —a ese tamaño no
 *             se leerían— y con la abreviatura de clase debajo: PP, NE, QE,
 *             CIS. El nombre completo lo da la ficha al tocar.
 *
 * No es «la versión pobre para el móvil»: en el móvil el nombre entero escrito
 * a cuatro píxeles es exactamente igual de inútil que no escribir nada, y
 * encima ensucia. La abreviatura es lo que se usa en clase.
 *
 * ---------------------------------------------------------------------------
 * SE TOCA, Y LO DICE ANTES DE QUE LO TOQUES
 * ---------------------------------------------------------------------------
 * Al pasar por encima —o al llegar con el tabulador— el círculo crece un pelo y
 * se encienden en oro las líneas que salen de él: se ve de dónde viene y a
 * dónde va antes de pulsar nada. Al pulsar se abre la ficha de cristal por
 * encima, con la cuenta hecha y el significado, y desde ahí se recorren las
 * diecinueve sin cerrarla.
 *
 * ---------------------------------------------------------------------------
 * TRES ESTADOS, TRES DIBUJOS DISTINTOS.
 * ---------------------------------------------------------------------------
 * CONFIRMADA    círculo de aro dorado. La fórmula cuadra con la tabla de Iris
 *               y además hay fuente escrita publicada.
 * RECONSTRUIDA  igual, con un punto pequeño arriba a la derecha. Cuadra con la
 *               tabla, pero ninguna fuente accesible enuncia la fórmula: son
 *               las seis casillas del Espejo.
 * PENDIENTE     círculo de trazo discontinuo y un interrogante en vez del
 *               número. Ahora mismo no hay ninguna, pero el dibujo lo soporta:
 *               una casilla sin fórmula nunca enseñará un número inventado.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { baseReducida, calculaBase22, cuentaDe, type BaseNacimiento, type Calculada } from "@/lib/base22";
import FichaGrafico, { type Contenido } from "./FichaGrafico";

/**
 * Las dos rejillas.
 *
 * Seis columnas y seis filas, con la fila del nudo de dolor y la de la huida
 * casi vacías: el dibujo es ancho arriba y abajo y estrecho en el centro, como
 * en la tabla de Iris. Lo único que cambia entre las dos es la escala y si cabe
 * o no el nombre largo.
 */
const ANCHA = {
  colX: [70, 210, 350, 490, 630, 780],
  filaY: [60, 175, 300, 400, 510, 625],
  w: 860,
  h: 700,
  r: 30,
  cifra: 22,
  rotulo: 10,
  largo: true,
};
const ESTRECHA = {
  colX: [42, 118, 194, 270, 346, 422],
  filaY: [46, 138, 236, 318, 410, 500],
  w: 464,
  h: 548,
  r: 26,
  cifra: 22,
  rotulo: 13,
  largo: false,
};

/** A partir de aquí cabe la rejilla ancha con los nombres enteros. */
const ANCHO_MINIMO = 700;

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

type Props = { base: BaseNacimiento };

/**
 * La de fuera lleva la cuenta de las veces que se ha pedido verla otra vez, y
 * esa cuenta es la `key` del dibujo: «otra vez» tira el dibujo entero y monta
 * uno nuevo, en vez de reiniciar un contador a mano dentro de un efecto.
 *
 * También mide el hueco: el ancho decide cuál de las dos rejillas se dibuja, y
 * eso no puede salir de una media query porque el panel tiene un lateral que se
 * pliega — la ventana no cambia y el hueco sí.
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

  /* Hasta que se mide, no se dibuja nada: pintar primero la ancha y cambiarla
     al instante siguiente es un salto feo justo al entrar en la sección. El
     hueco reservado tiene la altura que va a ocupar, así que tampoco da tirón. */
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
          <div style={css("aspect-ratio:860/700;")} />
        ) : (
          <Dibujo key={vuelta + "·" + G.w} base={base} G={G} />
        )}
      </div>

      <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
        <button
          onClick={() => setVuelta((v) => v + 1)}
          style={css(
            "background:var(--surface);border:1px solid var(--border-strong);color:var(--text-2);border-radius:999px;padding:9px 18px;font-size:var(--t-body);font-weight:560;cursor:pointer;box-shadow:var(--nm-alto);"
          )}
        >
          Verla montarse otra vez
        </button>
        <span style={css("font-size:var(--t-mini);color:var(--text-4);")}>
          Toca cualquier círculo: se abre la cuenta y lo que significa.
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

function Dibujo({ base, G }: { base: BaseNacimiento; G: typeof ANCHA }) {
  const quieto = useReducedMotion();
  const tabla = useMemo(() => calculaBase22(base), [base]);
  const reducida = useMemo(() => baseReducida(base), [base]);
  const porClave = useMemo(() => Object.fromEntries(tabla.map((p) => [p.k, p])), [tabla]);

  /** Cuál está resaltada por el ratón o el tabulador, y cuál está abierta. */
  const [sobre, setSobre] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);

  /* Cuántas tandas se han encendido ya. Empieza en cero y la suben los
     temporizadores; con el movimiento reducido apagado, empieza entera. */
  const [paso, setPaso] = useState(() => (quieto ? ORDEN.length : 0));

  useEffect(() => {
    if (quieto) return;
    const relojes = ORDEN.map((_, i) => setTimeout(() => setPaso(i + 1), 280 + i * 400));
    return () => relojes.forEach(clearTimeout);
  }, [quieto]);

  const punto = useCallback(
    (p: { fila: number; col: number }) => ({ x: G.colX[p.col] ?? G.w / 2, y: G.filaY[p.fila] ?? G.h / 2 }),
    [G]
  );

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

  /* Lo resaltado es lo que está abierto o, si no hay nada abierto, aquello
     sobre lo que está el ratón. Con la ficha abierta el ratón queda encima del
     cristal, así que dejar mandar al hover apagaría el resalte justo cuando
     más falta hace saber de qué casilla se está leyendo. */
  const activo = abierta ?? sobre;

  const i = tabla.findIndex((p) => p.k === abierta);
  const salta = (d: number) => setAbierta(tabla[(i + d + tabla.length) % tabla.length].k);

  return (
    <>
      <svg
        viewBox={`0 0 ${G.w} ${G.h}`}
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        role="img"
        aria-label="Rejilla de numerología en base 22"
      >
        {/* ------------------------------------------------------- líneas */}
        <g>
          {lineas.map(({ a, b, k }) => {
            const pa = punto(a);
            const pb = punto(b);
            const dentro = visible(a.k) && visible(b.k);
            const enciende = activo === a.k || activo === b.k;
            return (
              <motion.line
                key={k}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke={enciende ? "var(--gold)" : "var(--border-strong)"}
                strokeWidth={enciende ? 2.4 : 1.2}
                strokeOpacity={enciende ? 0.95 : 1}
                style={{ transition: "stroke .18s ease, stroke-width .18s ease" }}
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
          const enciende = activo === p.k;
          const nombre = G.largo ? p.nombre : p.corto || p.nombre;
          return (
            <motion.g
              key={p.k}
              className="grafico-toca"
              role="button"
              tabIndex={0}
              aria-label={`${p.nombre}${p.valor === null ? "" : ", " + p.valor}`}
              initial={quieto ? false : { opacity: 0, scale: 0.7 }}
              animate={dentro ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
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
              {/* El halo. Va detrás del círculo y sólo se enciende cuando esta
                  casilla es la elegida: es lo que hace que, con la ficha
                  abierta, se siga sabiendo de cuál se está leyendo. */}
              <circle
                cx={x}
                cy={y}
                r={G.r + 7}
                fill="var(--gold-soft)"
                style={{ opacity: enciende ? 1 : 0, transition: "opacity .18s ease" }}
              />
              <circle
                cx={x}
                cy={y}
                r={G.r}
                fill={falta ? "var(--surface)" : "var(--surface-2)"}
                stroke={falta ? "var(--red)" : "var(--gold)"}
                strokeWidth={falta ? 1.2 : enciende ? 2.4 : 1.6}
                strokeDasharray={falta ? "4 4" : undefined}
                style={{ transition: "stroke-width .18s ease" }}
              />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: G.cifra,
                  fontWeight: 600,
                  fill: falta ? "var(--red)" : "var(--text)",
                  pointerEvents: "none",
                }}
              >
                {falta ? "?" : p.valor}
              </text>
              {/* El punto de «casilla deducida», arriba a la derecha del aro. */}
              {p.certeza === "reconstruido" && (
                <circle cx={x + G.r * 0.72} cy={y - G.r * 0.72} r={3.4} fill="var(--gold)" />
              )}
              {/* El nombre debajo. En la rejilla ancha va entero, partido en dos
                  renglones cuando es largo; en la estrecha va la abreviatura. */}
              {(G.largo ? dosRenglones(nombre) : [nombre]).map((t, j) => (
                <text
                  key={j}
                  x={x}
                  y={y + G.r + (G.largo ? 16 : 17) + j * 12}
                  textAnchor="middle"
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: G.rotulo,
                    fontWeight: 590,
                    fill: enciende ? "var(--gold)" : "var(--text-3)",
                    pointerEvents: "none",
                    transition: "fill .18s ease",
                  }}
                >
                  {t}
                </text>
              ))}
            </motion.g>
          );
        })}
      </svg>

      <FichaGrafico
        contenido={abierta ? fichaDe(porClave[abierta], tabla, reducida) : null}
        alCerrar={() => setAbierta(null)}
        alAnterior={() => salta(-1)}
        alSiguiente={() => salta(1)}
        posicion={i >= 0 ? { i: i + 1, total: tabla.length } : undefined}
      />
    </>
  );
}

/** La casilla, convertida en lo que la ficha sabe pintar. */
function fichaDe(p: Calculada, tabla: Calculada[], base: { dia: number; mes: number; anio: number }): Contenido {
  const c = cuentaDe(p.k, tabla, base);
  const bloques: Contenido["bloques"] = [];

  if (p.de) bloques.push({ label: "De dónde sale", texto: p.de + ".", tono: "normal" });

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
