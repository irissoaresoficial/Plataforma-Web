"use client";
/**
 * ============================================================================
 * EL LUOPAN
 * ============================================================================
 *
 * Un luopan de verdad tiene dos piezas: el plato redondo, que gira, y la base
 * cuadrada, que no se mueve y lleva dos hilos rojos en cruz. Se apoya la base
 * paralela a la fachada, se gira el plato hasta que la aguja apunta al Norte,
 * y se lee el anillo que queda bajo el hilo rojo.
 *
 * Aquí es igual. El hilo rojo de arriba es la FACHADA: lo que cae debajo es la
 * lectura. El plato gira con el dedo, con el ratón, con la brújula del móvil o
 * escribiendo los grados.
 *
 * LOS ANILLOS, DE DENTRO AFUERA (los de un luopan San Yuan, simplificado a lo
 * que usa el estudio):
 *
 *   · El estanque del cielo, con la aguja y la línea roja Norte–Sur.
 *   · Los ocho trigramas del Cielo Posterior con su número del Lo Shu.
 *   · Las ocho direcciones.
 *   · Las 24 montañas: carácter, nombre y código (N1, N2…). Es el anillo con
 *     el que se calcula todo.
 *   · Los 360 grados, con las rayas entre montañas marcadas.
 *
 * Y uno opcional: las cuatro direcciones buenas y las cuatro malas de una
 * persona, para ver de un golpe hacia dónde le conviene la cama o la mesa.
 */
import { useCallback, useRef } from "react";
import { css } from "@/lib/css";
import { DIRS, GRADO_DIR, LOSHU, MANSION_BUENA, MONTANAS, TRIGRAMA, norm, type Dir, type Mansion } from "@/lib/fengshui/calculo";
import { MANSION } from "@/lib/fengshui/textos";

const RAD = Math.PI / 180;
const punto = (r: number, a: number) => [r * Math.sin(a * RAD), -r * Math.cos(a * RAD)] as const;

/** Un trozo de corona entre dos radios y dos ángulos. */
function corona(r1: number, r2: number, a1: number, a2: number) {
  const grande = norm(a2 - a1) > 180 ? 1 : 0;
  const [x1, y1] = punto(r2, a1);
  const [x2, y2] = punto(r2, a2);
  const [x3, y3] = punto(r1, a2);
  const [x4, y4] = punto(r1, a1);
  return `M${x1} ${y1}A${r2} ${r2} 0 ${grande} 1 ${x2} ${y2}L${x3} ${y3}A${r1} ${r1} 0 ${grande} 0 ${x4} ${y4}Z`;
}

/** El trigrama dibujado: tres líneas, enteras o partidas, de abajo arriba. */
function Trigrama({ lineas, x, y, giro }: { lineas: readonly (0 | 1)[]; x: number; y: number; giro: number }) {
  const ancho = 34;
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      {[2, 1, 0].map((i, fila) => {
        const yy = -12 + fila * 12;
        return lineas[i] ? (
          <rect key={i} x={-ancho / 2} y={yy - 3} width={ancho} height={6} rx={2} style={{ fill: "var(--text)" }} />
        ) : (
          <g key={i}>
            <rect x={-ancho / 2} y={yy - 3} width={ancho * 0.4} height={6} rx={2} style={{ fill: "var(--text)" }} />
            <rect x={ancho * 0.1} y={yy - 3} width={ancho * 0.4} height={6} rx={2} style={{ fill: "var(--text)" }} />
          </g>
        );
      })}
    </g>
  );
}

export type LuopanProps = {
  /** Hacia dónde mira la fachada, en grados. */
  grados: number;
  /** Si se pasa, el plato se gira arrastrando. */
  alGirar?: (g: number) => void;
  /** Dónde cae la fachada en la pantalla: 0 arriba, 90 derecha, 180 abajo… */
  haciaPantalla?: number;
  /** Las ocho mansiones de una persona, para el anillo de colores. */
  mansiones?: Record<Dir, Mansion> | null;
  /** Encima de un plano: sin base cuadrada, más transparente. */
  sobrePlano?: boolean;
  etiqueta?: string;
};

export default function Luopan({ grados, alGirar, haciaPantalla = 0, mansiones, sobrePlano, etiqueta }: LuopanProps) {
  const svg = useRef<SVGSVGElement>(null);
  const arrastre = useRef<{ desde: number; inicio: number } | null>(null);
  /* El plato gira para que el grado de la fachada quede bajo el hilo. */
  const giro = haciaPantalla - grados;

  const anguloDe = useCallback((e: React.PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    return (Math.atan2(x, -y) * 180) / Math.PI;
  }, []);

  const empieza = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!alGirar) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrastre.current = { desde: anguloDe(e), inicio: grados };
  };
  const mueve = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!alGirar || !arrastre.current) return;
    const delta = anguloDe(e) - arrastre.current.desde;
    /* Girar el plato a la derecha hace que bajo el hilo quede un grado menor. */
    alGirar(Math.round(norm(arrastre.current.inicio - delta) * 10) / 10);
  };
  const suelta = () => {
    arrastre.current = null;
  };

  const conPersona = Boolean(mansiones);
  const rEstanque = conPersona ? 112 : 132;

  return (
    <svg
      ref={svg}
      viewBox="-520 -520 1040 1040"
      role="img"
      aria-label={etiqueta ?? `Luopan. La fachada mira a ${grados.toFixed(1)} grados.`}
      onPointerDown={empieza}
      onPointerMove={mueve}
      onPointerUp={suelta}
      onPointerCancel={suelta}
      style={css(
        "width:100%;height:auto;display:block;user-select:none;-webkit-user-select:none;" +
          (alGirar ? "cursor:grab;touch-action:none;" : "") +
          (sobrePlano ? "opacity:.86;" : "")
      )}
    >
      <defs>
        <radialGradient id="fs-cristal" cx="35%" cy="25%" r="85%">
          <stop offset="0%" stopColor="var(--surface)" />
          <stop offset="100%" stopColor="var(--surface-2)" />
        </radialGradient>
        <radialGradient id="fs-estanque" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="var(--surface)" />
          <stop offset="100%" stopColor="var(--gold-soft)" />
        </radialGradient>
      </defs>

      {/* LA BASE CUADRADA, que no gira. */}
      {!sobrePlano && (
        <rect x={-510} y={-510} width={1020} height={1020} rx={72} style={{ fill: "url(#fs-cristal)", stroke: "var(--border)", strokeWidth: 2 }} />
      )}

      {/* EL PLATO, que gira. */}
      <g transform={`rotate(${giro})`} style={{ transition: arrastre.current ? "none" : "transform 160ms ease-out" }}>
        <circle r={478} style={{ fill: sobrePlano ? "color-mix(in srgb, var(--surface) 70%, transparent)" : "var(--surface)", stroke: "var(--border-strong)", strokeWidth: 2 }} />

        {/* Las 24 montañas, con las yang un poco más oscuras. */}
        {MONTANAS.map((m) => (
          <path
            key={m.i}
            d={corona(300, 412, m.desde, m.desde + 15)}
            style={{ fill: "var(--accion)", fillOpacity: m.yang ? 0.1 : 0.03, stroke: "var(--border)", strokeWidth: 1.2 }}
          />
        ))}
        {MONTANAS.map((m) => {
          const a = m.desde + 7.5;
          const [x1, y1] = punto(372, a);
          const [x2, y2] = punto(336, a);
          const [x3, y3] = punto(314, a);
          return (
            <g key={m.i}>
              <text x={x1} y={y1} transform={`rotate(${a} ${x1} ${y1})`} textAnchor="middle" dominantBaseline="middle" style={{ fill: "var(--text)", fontSize: 34, fontWeight: 500 }}>
                {m.hanzi}
              </text>
              <text x={x2} y={y2} transform={`rotate(${a} ${x2} ${y2})`} textAnchor="middle" dominantBaseline="middle" style={{ fill: "var(--text-3)", fontSize: 15, fontWeight: 500 }}>
                {m.pinyin}
              </text>
              <text x={x3} y={y3} transform={`rotate(${a} ${x3} ${y3})`} textAnchor="middle" dominantBaseline="middle" style={{ fill: "var(--gold)", fontSize: 13, fontWeight: 600 }}>
                {m.codigo}
              </text>
            </g>
          );
        })}

        {/* Los 360 grados. */}
        {Array.from({ length: 360 }, (_, g) => {
          const largo = g % 15 === 0 ? 22 : g % 5 === 0 ? 14 : 7;
          const [x1, y1] = punto(476, g);
          const [x2, y2] = punto(476 - largo, g);
          return <line key={g} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: "var(--text-3)", strokeWidth: g % 15 === 0 ? 2 : 1, opacity: g % 5 === 0 ? 0.9 : 0.5 }} />;
        })}
        {Array.from({ length: 24 }, (_, i) => {
          const g = i * 15;
          const [x, y] = punto(434, g);
          return (
            <text key={g} x={x} y={y} transform={`rotate(${g} ${x} ${y})`} textAnchor="middle" dominantBaseline="middle" style={{ fill: "var(--text-3)", fontSize: 16, fontVariantNumeric: "tabular-nums" }}>
              {g}
            </text>
          );
        })}

        {/* Las rayas entre direcciones, de lado a lado del plato. */}
        {DIRS.map((d) => {
          const a = GRADO_DIR[d] - 22.5;
          const [x1, y1] = punto(rEstanque, a);
          const [x2, y2] = punto(476, a);
          return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: "var(--accion)", strokeWidth: 2.4, opacity: 0.55 }} />;
        })}

        {/* Las ocho direcciones y sus trigramas. */}
        {DIRS.map((d) => {
          const a = GRADO_DIR[d];
          const t = TRIGRAMA[d];
          const [xd, yd] = punto(270, a);
          const [xn, yn] = punto(240, a);
          const [xt, yt] = punto(conPersona ? 186 : 200, a);
          const [xl, yl] = punto(conPersona ? 150 : 160, a);
          return (
            <g key={d}>
              <text x={xd} y={yd} transform={`rotate(${a} ${xd} ${yd})`} textAnchor="middle" dominantBaseline="middle" style={{ fill: "var(--accion)", fontSize: 30, fontWeight: 650 }}>
                {d}
              </text>
              <text x={xn} y={yn} transform={`rotate(${a} ${xn} ${yn})`} textAnchor="middle" dominantBaseline="middle" style={{ fill: "var(--text-3)", fontSize: 15 }}>
                {t.nombre} {t.hanzi}
              </text>
              <Trigrama lineas={t.lineas} x={xt} y={yt} giro={a} />
              <text x={xl} y={yl} transform={`rotate(${a} ${xl} ${yl})`} textAnchor="middle" dominantBaseline="middle" style={{ fill: "var(--gold)", fontSize: 20, fontWeight: 600 }}>
                {LOSHU[d]}
              </text>
            </g>
          );
        })}

        {/* El anillo de la persona: verde lo bueno, rojo lo difícil. */}
        {mansiones &&
          DIRS.map((d) => {
            const m = mansiones[d];
            const buena = MANSION_BUENA[m];
            const a = GRADO_DIR[d];
            const [x, y] = punto(124, a);
            return (
              <g key={d}>
                <path d={corona(112, 136, a - 21.5, a + 21.5)} style={{ fill: buena ? "var(--green)" : "var(--red)", fillOpacity: buena ? 0.32 : 0.22 }} />
                <text x={x} y={y} transform={`rotate(${a} ${x} ${y})`} textAnchor="middle" dominantBaseline="middle" style={{ fill: "var(--text)", fontSize: 11, fontWeight: 600 }}>
                  {MANSION[m].nombre}
                </text>
              </g>
            );
          })}

        {/* El estanque del cielo, con la línea Norte–Sur y la aguja. */}
        <circle r={rEstanque - (conPersona ? 26 : 0)} style={{ fill: "url(#fs-estanque)", stroke: "var(--border-strong)", strokeWidth: 2 }} />
        <line x1={0} y1={-(rEstanque - 34)} x2={0} y2={rEstanque - 34} style={{ stroke: "var(--red)", strokeWidth: 2.5 }} />
        <path d="M0 -70 L11 0 L0 8 L-11 0 Z" style={{ fill: "var(--red)" }} />
        <path d="M0 70 L11 0 L0 -8 L-11 0 Z" style={{ fill: "var(--text)" }} />
        <circle r={7} style={{ fill: "var(--surface)", stroke: "var(--text)", strokeWidth: 2 }} />
      </g>

      {/* LOS HILOS ROJOS, que no giran. El de arriba es la fachada. */}
      {(() => {
        const [fx, fy] = punto(500, haciaPantalla);
        const [ax, ay] = punto(500, haciaPantalla + 180);
        const [lx, ly] = punto(500, haciaPantalla + 90);
        const [rx, ry] = punto(500, haciaPantalla + 270);
        const [mx, my] = punto(506, haciaPantalla);
        return (
          <g style={{ pointerEvents: "none" }}>
            <line x1={fx} y1={fy} x2={ax} y2={ay} style={{ stroke: "var(--red)", strokeWidth: 2.4 }} />
            <line x1={lx} y1={ly} x2={rx} y2={ry} style={{ stroke: "var(--red)", strokeWidth: 1.6, opacity: 0.7 }} />
            <circle cx={mx} cy={my} r={9} style={{ fill: "var(--red)" }} />
          </g>
        );
      })()}
    </svg>
  );
}
