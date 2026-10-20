"use client";

/**
 * ============================================================================
 * LOS GRÁFICOS DE LAS MÉTRICAS
 * ============================================================================
 *
 * Dibujados a mano en SVG, como los iconos y por lo mismo: una librería de
 * gráficos pesa cientos de kilobytes, trae su propio aspecto —que no es el de
 * esta casa— y para cuatro formas no compensa.
 *
 * LAS REGLAS QUE SE SIGUEN AQUÍ, y de dónde salen
 * ---------------------------------------------------------------------------
 * No son gusto. Son el oficio de representar datos, y cada una tapa una forma
 * concreta de mentir sin querer:
 *
 *   · UNA SOLA SERIE POR GRÁFICO, Y UN SOLO EJE. Dos escalas en el mismo dibujo
 *     —visitas a la izquierda, euros a la derecha— dejan que las dos líneas se
 *     crucen donde uno quiera: se elige la escala y sale la historia que se
 *     busca. Si hay dos medidas, son dos gráficos.
 *
 *   · LA MAGNITUD SE DICE CON LA LONGITUD, no con el color. Por eso las barras
 *     son todas del mismo tono: lo que se compara es cuánto miden. Pintar cada
 *     barra de un color distinto sugiere que son cosas distintas cuando son la
 *     misma cosa en sitios distintos.
 *
 *   · LAS BARRAS ARRANCAN EN CERO. Siempre. Cortar la base es el truco más
 *     viejo que hay para que una diferencia del 3 % parezca del 300 %.
 *
 *   · NO SE ETIQUETA CADA PUNTO. Un número encima de cada dato es ruido que no
 *     lee nadie. Se marca el final y el máximo; el resto lo lleva el eje y lo
 *     dice el ratón por encima.
 *
 *   · EL TEXTO NUNCA VA DEL COLOR DEL DATO. El color lo lleva la marca —la
 *     línea, la barra—; las letras van en tinta normal. Un dorado claro como
 *     texto no se lee, y ahí se pierde justo lo que había que leer.
 *
 *   · LA REJILLA ES DE UN PELO Y SE QUITA DE EN MEDIO. Si la rejilla compite
 *     con el dato, el dato ha perdido.
 *
 * EL COLOR: uno solo, `--accion`, que es granate en claro y oro claro en
 * oscuro. Comprobado contra las dos superficies: pasa de sobra el mínimo de
 * contraste. No hace falta paleta de varios colores porque no hay varias
 * series que distinguir — y una paleta que no hace falta es una paleta que
 * acaba confundiendo.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { NOTA } from "@/lib/ui";

/* ─────────────────────────────────────────────────── la línea del tiempo ── */

export type Punto = { etiqueta: string; valor: number };

/**
 * Cuántas personas entran cada día.
 *
 * Con relleno por debajo —un lavado del 10 %, no un bloque— porque lo que se
 * lee aquí es la forma del mes entero, y el relleno la hace visible de un
 * vistazo sin tapar nada.
 */
export function Linea({ datos, alto = 200 }: { datos: Punto[]; alto?: number }) {
  const [encima, setEncima] = useState<number | null>(null);

  const W = 720;
  const H = alto;
  const izq = 34;
  const der = 10;
  const arr = 14;
  const aba = 24;

  const max = Math.max(...datos.map((d) => d.valor), 1);
  /* El techo se redondea a una cifra limpia: un eje que acaba en 47 obliga a
     leer el número para situar el resto. */
  const techo = Math.ceil(max / 10) * 10 || 10;

  const x = (i: number) => izq + (i * (W - izq - der)) / Math.max(datos.length - 1, 1);
  const y = (v: number) => arr + (1 - v / techo) * (H - arr - aba);

  const linea = datos.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.valor).toFixed(1)}`).join(" ");
  const relleno = `${linea} L${x(datos.length - 1).toFixed(1)},${H - aba} L${izq},${H - aba} Z`;

  const iMax = datos.reduce((mejor, d, i) => (d.valor > datos[mejor].valor ? i : mejor), 0);
  const iFin = datos.length - 1;

  return (
    <div style={css("position:relative;")}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        /*
         * EL TAMAÑO VA POR ESTILO, NO POR ATRIBUTO.
         *
         * El atributo `height` de un SVG sólo admite una longitud, y «auto» es
         * una palabra de CSS: puesta ahí, el navegador la rechaza con un error
         * en consola y se queda en los 150 px por defecto, que no es lo que
         * nadie quiso. En `style` sí vale, y entonces el dibujo escala solo con
         * el ancho guardando su proporción.
         *
         * Y NO SE TOCA `preserveAspectRatio`. Ponerlo en «none» hace que el
         * dibujo se estire para llenar la caja, y entonces los puntos redondos
         * del final salen como huevos. El trazo no se entera —lo sujeta
         * `vector-effect`— pero los círculos sí, y es de esas cosas que se ven
         * raras sin saber decir por qué.
         */
        role="img"
        aria-label={`Personas que entran cada día. Máximo ${datos[iMax].valor} el ${datos[iMax].etiqueta}.`}
        style={css("display:block;width:100%;height:auto;overflow:visible;")}
        onMouseLeave={() => setEncima(null)}
        onMouseMove={(e) => {
          const caja = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - caja.left) / caja.width) * W;
          const i = Math.round(((px - izq) / (W - izq - der)) * (datos.length - 1));
          setEncima(Math.max(0, Math.min(datos.length - 1, i)));
        }}
      >
        {/* La rejilla: cuatro pelos y los números del eje. Sin ellos hay que
            adivinar la escala; con más, la rejilla se come el dato. */}
        {[0, 0.5, 1].map((p) => (
          <g key={p}>
            <line
              x1={izq}
              x2={W - der}
              y1={y(techo * p)}
              y2={y(techo * p)}
              stroke="var(--border)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={izq - 8}
              y={y(techo * p) + 4}
              textAnchor="end"
              style={css("font-size:11px;fill:var(--text-4);font-family:var(--font-ui);")}
            >
              {Math.round(techo * p)}
            </text>
          </g>
        ))}

        <path d={relleno} fill="var(--accion)" opacity="0.1" />
        {/*
          LA LÍNEA NO SE DIBUJA SOLA, Y NO ES PEREZA.
          
          Aquí había una animación de trazado —la línea creciendo de izquierda a
          derecha— y PINTABA MAL: el último tercio se quedaba sin línea, con el
          relleno debajo y nada encima.
          
          El motivo es que esa animación se hace con un patrón de guiones
          (`strokeDasharray`), y el largo del patrón se calcula en las unidades
          del `viewBox` —720 de ancho— mientras que `vector-effect` pinta el
          trazo en píxeles de pantalla. Estirado el dibujo a mil y pico píxeles,
          el patrón se queda corto y el resto de la línea no llega a pintarse.
          
          Se puede tener una de las dos cosas: el trazo de 2 px exactos a
          cualquier tamaño, o la animación de dibujado. Gana el trazo, porque la
          línea tiene que verse bien SIEMPRE y la animación sólo el primer
          segundo. La entrada la hace el bloque entero apareciendo.
        */}
        <path
          d={linea}
          fill="none"
          stroke="var(--accion)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* La cruz del ratón: dice qué día se está mirando sin tener que
            acertarle a un punto de cuatro píxeles. */}
        {encima !== null && (
          <line
            x1={x(encima)}
            x2={x(encima)}
            y1={arr}
            y2={H - aba}
            stroke="var(--text-4)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {/* El punto final y el máximo, con su anillo del color del fondo para
            que se lean aunque caigan encima de la línea. */}
        {[iFin, iMax].map((i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(datos[i].valor)}
            r="4.5"
            fill="var(--accion)"
            stroke="var(--surface)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Las fechas: sólo la primera y la última. Treinta etiquetas en un eje
            de setecientos píxeles se solapan y no se lee ninguna. */}
        <text x={izq} y={H - 6} style={css("font-size:11px;fill:var(--text-4);font-family:var(--font-ui);")}>
          {datos[0].etiqueta}
        </text>
        <text x={W - der} y={H - 6} textAnchor="end" style={css("font-size:11px;fill:var(--text-4);font-family:var(--font-ui);")}>
          {datos[iFin].etiqueta}
        </text>
      </svg>

      {encima !== null && (
        <div
          role="status"
          style={css(
            "position:absolute;top:0;pointer-events:none;transform:translateX(-50%);" +
              `left:${(x(encima) / W) * 100}%;` +
              "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);" +
              "box-shadow:var(--shadow-lg, 0 10px 30px -12px rgba(0,0,0,.3));padding:7px 11px;white-space:nowrap;"
          )}
        >
          <div style={css("font-size:var(--t-mini);font-weight:600;color:var(--text);")}>
            {datos[encima].valor} personas
          </div>
          <div style={css(NOTA)}>{datos[encima].etiqueta}</div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── barras echadas ── */

export type Barra = {
  etiqueta: string;
  detalle?: string;
  /** Lo que mide la barra. Siempre un número: es lo que da el ancho. */
  valor: number;
  /**
   * Qué ESCRIBIR al final de la barra, cuando no es el número pelado.
   *
   * Hace falta para el dinero. «10,5 €» es correcto pero se lee mal en una
   * columna de importes; lo que se espera ver es «10,50 €». Y eso no se puede
   * sacar del número sin saber que es dinero, que es justo lo que esta pieza
   * no sabe ni tiene por qué saber. Así que lo trae ya escrito quien lo sabe.
   */
  texto?: string;
};

/**
 * El número al final de la barra, en español.
 *
 * ESTO ESTABA PINTANDO EL NÚMERO EN CRUDO, y se veía: 6210 sin punto de los
 * miles, y 10.5 con el punto decimal de otro idioma justo al lado de un
 * «22,78 €» con coma. Dos separadores distintos para lo mismo en la misma
 * pantalla es de las cosas que hacen que un panel parezca a medio hacer.
 */
function enEspanol(n: number): string {
  return n.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

/**
 * Comparar cuánto, con nombres largos.
 *
 * Echadas y no de pie a propósito: «Reino Unido» o «São Paulo» en vertical hay
 * que girarlos o cortarlos, y un rótulo girado no se lee — se descifra.
 */
export function Barras({ datos, sufijo = "" }: { datos: Barra[]; sufijo?: string }) {
  const quieto = useReducedMotion();
  const max = Math.max(...datos.map((d) => d.valor), 1);

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
      {datos.map((d, i) => (
        <div key={d.etiqueta}>
          <div style={css("display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin-bottom:6px;")}>
            <span style={css("font-size:var(--t-body);color:var(--text-2);")}>
              {d.etiqueta}
              {d.detalle && <span style={css(NOTA + "margin-left:7px;")}>{d.detalle}</span>}
            </span>
            {/* El número al final de la barra, no encima: ahí no tapa el dato. */}
            {/* `nowrap`: sin esto, en el móvil «10,50 €» parte el símbolo del
                importe y el euro se cae solo a la línea de abajo. */}
            <span
              style={css(
                "font-size:var(--t-mini);font-weight:600;color:var(--text);" +
                  "font-variant-numeric:tabular-nums;white-space:nowrap;",
              )}
            >
              {d.texto ?? `${enEspanol(d.valor)}${sufijo}`}
            </span>
          </div>
          <div
            style={css(
              "height:10px;border-radius:999px;overflow:hidden;" +
                "background:color-mix(in srgb, var(--text) 7%, transparent);"
            )}
          >
            <motion.div
              initial={quieto ? false : { width: 0 }}
              animate={{ width: `${(d.valor / max) * 100}%` }}
              transition={{ delay: 0.06 + i * 0.05, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={css("height:100%;background:var(--accion);border-radius:999px;")}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── columnas de pie ── */

/**
 * Lo mismo que `Barras` pero de pie, para cuando el eje es el TIEMPO.
 *
 * Por qué dos formas y no una: una serie por meses se lee de pie porque el
 * tiempo va de izquierda a derecha, igual que se lee. Echada habría que girar
 * la cabeza para seguir el orden. Y al revés, una lista de países se lee
 * echada porque «Reino Unido» de pie hay que girarlo o cortarlo.
 *
 * LAS COLUMNAS ARRANCAN EN CERO Y NO SE NEGOCIA. Cortar la base es el truco
 * más viejo que hay: una diferencia del 3 % parece del 300 %. Si algún día
 * alguien quiere «que se note más la subida», se cambian los datos, no el eje.
 */
export function Columnas({ datos, prefijo = "", sufijo = "" }: { datos: Barra[]; prefijo?: string; sufijo?: string }) {
  const quieto = useReducedMotion();
  const max = Math.max(...datos.map((d) => d.valor), 1);
  /* El techo redondeado a una cifra limpia, por lo mismo que en la línea: un
     eje que acaba en 47 obliga a leer el número para situar el resto. */
  const techo = Math.ceil(max / 10) * 10 || 10;

  return (
    <div>
      <div style={css("display:flex;align-items:flex-end;gap:clamp(6px,1.4vw,16px);height:190px;")}>
        {datos.map((d, i) => (
          <div
            key={d.etiqueta}
            style={css("flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:7px;")}
          >
            {/* El valor en la punta, y sólo ahí: un número dentro de cada
                columna compite con la propia columna por decir lo mismo. */}
            <span style={css("font-size:var(--t-micro);font-weight:600;color:var(--text-2);font-variant-numeric:tabular-nums;white-space:nowrap;")}>
              {prefijo}
              {d.valor}
              {sufijo}
            </span>
            <motion.div
              initial={quieto ? false : { height: 0 }}
              animate={{ height: `${(d.valor / techo) * 100}%` }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={css(
                /* Redondeada arriba y recta abajo: el canto recto es la línea
                   de base, y redondearla también haría que la columna pareciera
                   flotar por encima del cero. */
                "width:100%;max-width:38px;background:var(--accion);border-radius:var(--r-xs) var(--r-xs) 0 0;"
              )}
            />
          </div>
        ))}
      </div>
      <div style={css("display:flex;gap:clamp(6px,1.4vw,16px);margin-top:9px;")}>
        {datos.map((d) => (
          <span
            key={d.etiqueta}
            style={css("flex:1;min-width:0;text-align:center;" + NOTA + "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;")}
          >
            {d.etiqueta}
          </span>
        ))}
      </div>
    </div>
  );
}
