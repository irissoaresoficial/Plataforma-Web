"use client";

/**
 * ============================================================================
 * EL CUADRO DE INCLUSIÓN — LAS NUEVE CASAS, CONTÁNDOSE
 * ============================================================================
 *
 * Nueve casas, y en cada una vive un habitante: cuántas letras del nombre
 * completo valen ese número. Eso es todo el mecanismo, y es tan simple que se
 * puede ENSEÑAR en vez de contarlo.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ EL NOMBRE SE VA CONTANDO LETRA A LETRA
 * ---------------------------------------------------------------------------
 * La rejilla de base 22 se arma delante de quien mira porque ver salir la línea
 * de la madre al nudo emocional explica de dónde viene el nudo. Aquí el problema
 * es otro: el cuadro no tiene líneas, tiene un RECUENTO. Y un recuento sólo se
 * entiende viéndolo contar.
 *
 * Así que el nombre aparece arriba, letra a letra, cada letra con su valor
 * debajo, y cada vez que una letra cae, su casa se enciende y su habitante sube
 * uno. Al acabar, salen los puentes. Quien lo ve una vez ya sabe hacerlo a mano:
 * ése es el objetivo, porque esto es una escuela y no una calculadora.
 *
 * ---------------------------------------------------------------------------
 * LO QUE HAY QUE VER SIN LEER NADA
 * ---------------------------------------------------------------------------
 * De un cuadro de inclusión sólo se leen tres cosas de un vistazo, y el dibujo
 * las dice con la forma, no con el texto:
 *
 *   CASA VACÍA (habitante 0)  · el hueco. Es lo más importante del cuadro: la
 *     casa vacía es la kármica, la lección que la persona viene a aprender. Va
 *     con el disco en trazo discontinuo, sin relleno — un hueco de verdad.
 *   CASA DOMINANTE (3 o más)  · aro dorado. Energía de sobra en esa área.
 *   CASA NORMAL               · el disco hundido de siempre.
 *
 * Y el relieve manda lo de siempre en esta casa: lo que se hunde es contenido
 * —el número del habitante— y lo que sobresale es acción —la casa entera, que se
 * pulsa—.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ TARJETAS Y NO UN SVG, COMO EL OTRO GRÁFICO
 * ---------------------------------------------------------------------------
 * La rejilla de 22 es SVG porque tiene geometría: posiciones exactas y líneas
 * entre ellas. Ésta no tiene geometría, tiene una tabla de 3×3, y lo que la hace
 * legible es el relieve —el hundido del número, el realce de la casa—, que en
 * SVG hay que falsificar con degradados y en CSS es una variable de la casa.
 *
 * Y de paso resuelve el responsive solo: nueve casillas en tres columnas caben
 * en cualquier ancho, y por debajo de 380 px pasan a dos columnas sin que haya
 * que dibujar una segunda geometría como allí.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import {
  AREAS,
  letrasDe,
  puenteDe,
  valorLetra,
  type Casa,
} from "@/lib/base9";
import FichaGrafico, { type Contenido } from "./FichaGrafico";

type Props = {
  /** El nombre completo de nacimiento, ya juntado. */
  nombreCompleto: string;
  casas: Casa[];
};

/** Cuánto tarda cada letra en caer, y cuánto los puentes al final. */
const TOTAL_CUENTA = 2600;
const POR_LETRA_MIN = 45;
const POR_LETRA_MAX = 130;
const PAUSA_PUENTES = 520;

export default function CuadroBase9({ nombreCompleto, casas }: Props) {
  const [vuelta, setVuelta] = useState(0);
  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s4);")}>
      <Dibujo key={vuelta} nombreCompleto={nombreCompleto} casas={casas} />
      <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
        <button
          onClick={() => setVuelta((v) => v + 1)}
          style={css(
            "background:var(--surface);border:1px solid var(--border-strong);color:var(--text-2);border-radius:999px;padding:9px 18px;font-size:var(--t-body);font-weight:560;cursor:pointer;box-shadow:var(--nm-alto);"
          )}
        >
          Verlo contarse otra vez
        </button>
        <span style={css("font-size:var(--t-mini);color:var(--text-4);")}>
          Toca una casa: se abre qué letras han caído ahí y qué significa.
        </span>
      </div>
    </div>
  );
}

function Dibujo({ nombreCompleto, casas }: Props) {
  const quieto = useReducedMotion();

  /**
   * El nombre convertido: cada letra con su valor y, por tanto, con su casa.
   *
   * Va también partido en palabras, y esto no es un detalle de maquetación. El
   * recuento no distingue nombre de apellidos —cuenta las veintiuna letras
   * seguidas— pero quien mira la tira sí necesita distinguirlos: sin el hueco,
   * «GUSTAVOANDRESGIORDANO» es una tira de veintiún caracteres que no se
   * reconoce como el nombre de nadie, y lo que la tira tiene que enseñar es
   * precisamente que esas letras son SU nombre.
   */
  const palabras = useMemo(() => {
    let i = 0;
    return nombreCompleto
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => letrasDe(p).map((g) => ({ g, v: valorLetra(g) ?? 0, i: i++ })))
      .filter((w) => w.length);
  }, [nombreCompleto]);

  const letras = useMemo(() => palabras.flat(), [palabras]);

  /* Cuántas letras se han contado ya. Con el movimiento reducido, todas desde
     el principio: quien ha pedido que las cosas no se muevan no tiene por qué
     esperar a que termine una animación para leer su carta. */
  const [contadas, setContadas] = useState(() => (quieto ? letras.length : 0));
  const [conPuentes, setConPuentes] = useState(() => Boolean(quieto));
  const [abierta, setAbierta] = useState<number | null>(null);

  useEffect(() => {
    if (quieto) return;
    /* El ritmo se ajusta al largo del nombre: un nombre de cuarenta letras a la
       velocidad de uno de quince duraría el doble y se haría pesado. Con topes,
       para que ni un nombre cortísimo salga disparado ni uno larguísimo se
       arrastre. */
    const paso = Math.min(
      POR_LETRA_MAX,
      Math.max(POR_LETRA_MIN, Math.round(TOTAL_CUENTA / Math.max(1, letras.length)))
    );
    const relojes = letras.map((_, i) => setTimeout(() => setContadas(i + 1), 260 + i * paso));
    relojes.push(setTimeout(() => setConPuentes(true), 260 + letras.length * paso + PAUSA_PUENTES));
    return () => relojes.forEach(clearTimeout);
  }, [quieto, letras]);

  /** Los habitantes tal y como van hasta la letra contada. */
  const parcial = useMemo(() => {
    const c: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    for (let i = 0; i < contadas; i++) {
      const v = letras[i]?.v;
      if (v) c[v] += 1;
    }
    return c;
  }, [contadas, letras]);

  /** La casa en la que acaba de caer una letra: se enciende un instante. */
  const cayendo = contadas > 0 && contadas <= letras.length ? letras[contadas - 1].v : null;
  const terminado = contadas >= letras.length;

  /** Qué letras han caído en cada casa. Es la «cuenta» que enseña la ficha. */
  const letrasDeCasa = useMemo(() => {
    const m: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
    for (const l of letras) if (l.v) m[l.v].push(l.g);
    return m;
  }, [letras]);

  const ficha: Contenido | null =
    abierta === null ? null : fichaDeCasa(casas[abierta - 1], letrasDeCasa[abierta], letras.length);

  const salta = (d: number) => setAbierta(((abierta ?? 1) - 1 + d + 9) % 9 + 1);

  return (
    <>
      {/* --------------------------------------------------- EL NOMBRE, CAYENDO
          Cada letra con su valor debajo. Es la parte que enseña el mecanismo:
          sin esto, el cuadro es un resultado; con esto, es una cuenta. */}
      <div
        style={css(
          "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);display:flex;flex-wrap:wrap;gap:4px 3px;justify-content:center;min-height:62px;align-items:center;"
        )}
        aria-hidden
      >
        {palabras.map((palabra, w) => (
          <span key={w} style={css("display:flex;gap:3px;margin-right:14px;")}>
            {palabra.map((l) => {
              const ya = l.i < contadas;
              const ahora = l.i === contadas - 1 && !terminado;
              return (
                <span
                  key={l.i}
                  style={css(
                    "display:flex;flex-direction:column;align-items:center;gap:1px;width:19px;transition:opacity .2s ease,transform .2s ease;" +
                      (ya ? "opacity:1;" : "opacity:.22;") +
                      (ahora ? "transform:translateY(-3px);" : "")
                  )}
                >
                  <span
                    style={css(
                      "font-size:var(--t-body);font-weight:590;line-height:1;color:" +
                        (ahora ? "var(--accion)" : "var(--text-2)") +
                        ";"
                    )}
                  >
                    {l.g}
                  </span>
                  <span
                    data-cifras=""
                    style={css(
                      "font-size:var(--t-micro);line-height:1;color:" + (ahora ? "var(--gold)" : "var(--text-4)") + ";"
                    )}
                  >
                    {l.v}
                  </span>
                </span>
              );
            })}
          </span>
        ))}
      </div>

      {/* ------------------------------------------------------- LAS NUEVE CASAS */}
      <div
        style={css(
          "display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--s3);margin-top:var(--s4);"
        )}
        role="group"
        aria-label="Cuadro de inclusión: nueve casas"
      >
        {casas.map((c) => {
          const h = parcial[c.casa];
          const vacia = terminado && h === 0;
          const dominante = h >= 3;
          const enciende = cayendo === c.casa && !terminado;
          return (
            <motion.button
              key={c.casa}
              onClick={() => setAbierta(c.casa)}
              aria-label={`Casa ${c.casa}, habitante ${h}`}
              animate={enciende && !quieto ? { scale: 1.035 } : { scale: 1 }}
              transition={{ duration: 0.18 }}
              style={css(
                "position:relative;display:flex;flex-direction:column;align-items:center;gap:var(--s2);padding:var(--s4) var(--s2);cursor:pointer;text-align:center;" +
                  "background:var(--surface);border-radius:var(--r);border:1px solid " +
                  (enciende ? "var(--gold)" : dominante ? "var(--gold-soft)" : "var(--border)") +
                  ";box-shadow:var(--nm-alto);transition:border-color .2s ease;"
              )}
            >
              {/* El número de la casa, arriba. Pequeño: la casa es la dirección,
                  no el dato. El dato es quién vive dentro.

                  Y la chapa de «kármica» va AQUÍ AL LADO, en la misma línea, no
                  flotando en la esquina. Flotando se montaba encima de «CASA 8»
                  en cuanto la columna se estrechaba —en el móvil se leía
                  «CASA kármica»— y no hay ancho al que eso no pueda pasar con un
                  rótulo y una chapa disputándose el mismo renglón. */}
              <span
                style={css(
                  "display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;font-size:var(--t-micro);font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--text-4);"
                )}
              >
                Casa {c.casa}
                {vacia && (
                  <span
                    style={css(
                      "letter-spacing:.04em;text-transform:none;padding:2px 7px;border-radius:980px;background:var(--gold-soft);color:var(--gold-deep);"
                    )}
                  >
                    kármica
                  </span>
                )}
              </span>

              {/* El habitante, hundido en su disco. Lo que se hunde es
                  contenido; la casa entera, que sobresale, es la acción. */}
              <span
                data-cifras=""
                style={css(
                  "display:grid;place-items:center;width:clamp(44px,8vw,58px);height:clamp(44px,8vw,58px);border-radius:50%;font-size:clamp(19px,3.4vw,25px);font-weight:600;line-height:1;letter-spacing:-.02em;" +
                    (vacia
                      ? "border:1.6px dashed var(--border-strong);color:var(--text-4);background:transparent;"
                      : "box-shadow:var(--nm-hondo);background:var(--surface-2, var(--bg));color:var(--text);" +
                        (dominante ? "outline:2px solid var(--gold);outline-offset:2px;" : ""))
                )}
              >
                {h}
              </span>

              {/* El puente. Sale al final, cuando ya está el recuento entero:
                  antes no existe, porque se calcula del habitante terminado. */}
              <span
                style={css(
                  "font-size:var(--t-micro);color:var(--text-4);transition:opacity .35s ease;" +
                    (conPuentes ? "opacity:1;" : "opacity:0;")
                )}
              >
                Puente <b style={css("color:var(--text-2);font-weight:600;")}>{puenteDe(h, c.casa)}</b>
              </span>

            </motion.button>
          );
        })}
      </div>

      <FichaGrafico
        contenido={ficha}
        alCerrar={() => setAbierta(null)}
        alAnterior={() => salta(-1)}
        alSiguiente={() => salta(1)}
        posicion={abierta === null ? undefined : { i: abierta, total: 9 }}
      />
    </>
  );
}

/**
 * Lo que cuenta una casa al abrirse.
 *
 * Las tres cosas que hay que saber de una casa: quién vive dentro y con qué
 * letras (la cuenta), cuál es su puente y de dónde sale, y qué área de la vida
 * es. La tercera va marcada como lo que es —una atribución de otra escuela— para
 * no dar por buena de Coquatrix una lista que no es suya.
 */
function fichaDeCasa(c: Casa, letras: string[], totalLetras: number): Contenido {
  const area = AREAS[c.casa];
  const bloques: Contenido["bloques"] = [];

  bloques.push({
    label: "El puente",
    texto: c.vacia
      ? "La casa está vacía, y una casa vacía tiene puente 0. No es «cero por descarte»: es una regla escrita de la escuela, y no vale calcular |0 − " +
        c.casa +
        "|. El camino para esta área no pasa por otro número, pasa por habitarla."
      : `${Math.max(c.habitante, c.casa)} − ${Math.min(c.habitante, c.casa)} = ${c.puente}. Del habitante a su casa, siempre del mayor al menor. Es el camino alternativo: por dónde se equilibra lo que sobra o lo que falta en esta área.`,
  });

  if (area) {
    bloques.push({
      label: "El área de la vida",
      texto: area,
      tono: "oro",
    });
  } else {
    bloques.push({
      label: "El área de la vida",
      texto:
        "No la tenemos. Es la única de las nueve cuya descripción no aparece en ninguna fuente accesible, y no se inventa. Está en la lista de lo que hay que preguntarle a Iris.",
      tono: "rojo",
    });
  }

  bloques.push({
    label: "De dónde sale la lista de áreas",
    texto:
      "Las áreas de las nueve casas son de la Escuela Sistémica Jaume Valls, no de Coquatrix. Coinciden con el sistema, pero podrían no ser las que enseña Iris: pendiente de confirmar con ella.",
  });

  return {
    k: "casa" + c.casa,
    etiqueta: "Casa " + c.casa,
    titulo: c.vacia
      ? "Casa vacía"
      : c.dominante
        ? "Casa dominante"
        : "Habitante " + c.habitante,
    apunte: `${c.habitante} de ${totalLetras} letras`,
    valor: c.habitante,
    valorPie: c.vacia
      ? "sin habitante: kármica"
      : c.dominante
        ? "tres o más: energía de sobra"
        : "letras del nombre que valen " + c.casa,
    cuenta: letras.length
      ? { pasos: letras.map((g) => ({ label: g, valor: c.casa })), op: "", bruto: undefined, redujo: false }
      : null,
    cuerpo: c.vacia
      ? "Ninguna letra del nombre vale " +
        c.casa +
        ". Una casa sin habitante es la lección: el área que no viene dada y hay que construir. Es lo primero que se mira de un cuadro de inclusión."
      : c.dominante
        ? "Hay " +
          c.habitante +
          " letras que valen " +
          c.casa +
          ". Tres o más es una casa dominante: energía de sobra en esta área, que puede jugar a favor o desbordarse."
        : "Hay " +
          c.habitante +
          (c.habitante === 1 ? " letra que vale " : " letras que valen ") +
          c.casa +
          ". Es lo que la persona trae de serie en esta área.",
    bloques,
  };
}
