"use client";

/**
 * ============================================================================
 * NUMEROLOGÍA — LA BASE 9 · CASAS Y HABITANTES
 * ============================================================================
 *
 * La otra numerología, y no es una variante de la de al lado: es otro sistema.
 *
 *   BASE 22 (Kris Hadar)        lee la FECHA y dice cómo se COMPORTA alguien.
 *   BASE 9  (Martine Coquatrix) lee el NOMBRE COMPLETO —y la fecha— y dice de
 *                               qué está HECHO: qué trae, qué le falta y de qué
 *                               familia viene.
 *
 * Por eso tiene su propio apartado y no una pestaña dentro del otro: quien mira
 * una carta de base 9 no está mirando lo mismo desde otro ángulo, está mirando
 * otra cosa.
 *
 * ---------------------------------------------------------------------------
 * LA PANTALLA ENSEÑA NÚMEROS. LO QUE NO SE SABE, SE CALLA.
 * ---------------------------------------------------------------------------
 * De las cinco filas de la plantilla, dos calculan con fórmula verificada
 * —Base y Puente— y tres no tienen fórmula publicada: Inducción, Evolución e
 * Inconsciente. Otros cuatro cálculos de la escuela están igual: Fuerza, Misión
 * Cósmica, Iniciación Espiritual y el esquema psicoenergético.
 *
 * Durante un rato esta pantalla llevaba todo eso escrito: siete párrafos en
 * rojo explicando qué faltaba y por qué, más avisos sobre nombres que bailan
 * entre escuelas y siglas que no cuadran. Era información CIERTA y era el sitio
 * EQUIVOCADO. Esto es la herramienta con la que Iris trabaja y que abre delante
 * de quien tiene enfrente; un muro de rojo diciendo lo que no sabemos no ayuda a
 * leer una carta, y quien lo ve no piensa «qué honestos», piensa «esto está a
 * medias».
 *
 * La regla que queda es la de siempre y no ha cambiado: NO SE INVENTA NINGÚN
 * NÚMERO. Las filas sin fórmula salen con un guion, en gris, y ya está. Un
 * guion dice lo mismo que siete párrafos —aquí todavía no hay cuenta— sin
 * convertir la pantalla en un parte de obra.
 *
 * Lo que faltaba sigue escrito entero en `lib/base9.ts`: la fórmula que no
 * aparece, la fuente que se contradice, el ejemplo que verifica cada cosa. Ahí
 * es donde sirve, porque ahí es donde alguien va a escribir la fórmula el día
 * que la tengamos.
 */

import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, NOTA, TITULO, CABECERA } from "@/lib/ui";
import { calculaBase9, type Doble } from "@/lib/base9";
import CuadroBase9 from "./CuadroBase9";
import Pendiente from "./Pendiente";

export default function SeccionBase9() {
  const { r, re } = useApp();

  /* Una empresa tiene nombre, pero no tiene apellidos ni fecha de nacimiento, y
     la base 9 se sostiene sobre las dos cosas: las herencias familiares salen de
     los apellidos y media carta sale de la fecha. */
  if (re && !r) {
    return (
      <Pendiente
        titulo="La base 9 es de personas"
        pie="Las nueve casas se cuentan del nombre completo de nacimiento, y las herencias, de los apellidos del padre y de la madre. Una empresa no tiene ni lo uno ni lo otro."
      />
    );
  }
  if (!r) return null;

  const e = r.entrada;
  const b = calculaBase9({
    nombre: e.nombre,
    apellido1: e.apellido1,
    apellido2: e.apellido2,
    dia: e.dia,
    mes: e.mes,
    anio: e.anio,
  });

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--gap-lg);")}>
      {/* ══════════════════════════════════════════════════════ QUÉ ES ESTO */}
      <div>
        <h2 style={css(TITULO + "margin:0 0 var(--s2);")}>Base 9 · casas y habitantes</h2>
        <p style={css(APOYO + "margin:0 0 var(--s2);max-width:64ch;")}>
          Nueve casas, que son nueve áreas de la vida. En cada una vive un habitante: cuántas letras del nombre completo
          de nacimiento valen ese número. Lo que se lee no es la casa ni el habitante por separado, sino la relación
          entre los dos.
        </p>
        <p style={css(APOYO + "margin:0;max-width:64ch;")}>
          Una casa con tres o más está sobrecargada. Una casa <b style={css("color:var(--text);")}>vacía</b> es la
          kármica: el área que no viene dada y se viene a aprender. Es lo primero que se mira.
        </p>
      </div>

      <CuadroBase9 nombreCompleto={b.nombreCompleto} casas={b.casas} />

      <p style={css(NOTA + "margin:0;max-width:64ch;")}>
        {b.totalLetras} letras en «{b.nombreCompleto}», y los nueve habitantes suman{" "}
        {b.cuadra ? "exactamente esas " + b.totalLetras : "OTRA COSA — hay un fallo de cálculo"}. El punto de equilibrio
        del cuadro está en {b.equilibrioDelCuadro.toFixed(1)} letras por casa: por encima se lee exceso y por debajo,
        defecto.
      </p>

      {/* ══════════════════════════════════════════════ LA PLANTILLA, FILA A FILA */}
      <div>
        <h3 style={css(CABECERA + "margin:0 0 var(--s2);")}>La plantilla, fila a fila</h3>
        <p style={css(APOYO + "margin:0 0 var(--s3);max-width:64ch;")}>
          Las cinco filas de la hoja de trabajo, en su orden.
        </p>

        <div style={css("overflow-x:auto;")}>
          <table
            style={css(
              "width:100%;min-width:520px;border-collapse:collapse;font-size:var(--t-body);"
            )}
          >
            <thead>
              <tr>
                <th style={css(celdaCabecera + "text-align:left;")}>Fila</th>
                {b.casas.map((c) => (
                  <th key={c.casa} style={css(celdaCabecera)} data-cifras="">
                    {c.casa}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.filas.map((f) => {
                const falta = f.certeza === "pendiente";
                return (
                  <tr key={f.k}>
                    <th style={css(celda + "text-align:left;font-weight:600;white-space:nowrap;color:" + (falta ? "var(--text-4)" : "var(--text)") + ";")}>
                      {f.nombre}
                    </th>
                    {b.casas.map((c, i) => (
                      <td
                        key={c.casa}
                        data-cifras=""
                        style={css(
                          celda +
                            "text-align:center;" +
                            (falta ? "color:var(--text-4);" : "color:var(--text);font-weight:590;")
                        )}
                      >
                        {f.calcula ? f.calcula(b.casas, i) : "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* ══════════════════════════════════════════════ LOS NÚMEROS DEL NOMBRE */}
      <div>
        <h3 style={css(CABECERA + "margin:0 0 var(--s2);")}>Los números del nombre</h3>
        <p style={css(APOYO + "margin:0 0 var(--s3);max-width:64ch;")}>
          De cada uno se apuntan dos cifras, como en la plantilla: la suma en bruto y la reducida. No es redundancia — el
          bruto es el único sitio donde se ven los números kármicos, porque un 19 reducido es un 1 y el 19 desaparece.
        </p>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:var(--s3);")}>
          <Numero titulo="Expresión" pie="Todas las letras · cómo nos ven" d={b.expresion} />
          <Numero titulo="Alma" pie="Las vocales · lo que se desea de verdad" d={b.alma} />
          <Numero titulo="Personalidad" pie="Las consonantes · lo que se proyecta" d={b.personalidad} />
          <Numero titulo="Equilibrio" pie="Las iniciales · de dónde se saca fuerza" d={b.equilibrio} />
          {/* El inconsciente sale del propio cuadro —cuántas casas quedan
              vacías—, así que vive aquí y no con los números de la fecha. */}
          <Numero
            titulo="Inconsciente"
            pie="9 menos las casas vacías"
            d={{ bruto: b.inconscienteGlobal, reducido: b.inconscienteGlobal, pasos: [b.inconscienteGlobal], karmico: null, maestro: false }}
          />
        </div>
        <p style={css(NOTA + "margin:var(--s3) 0 0;max-width:70ch;")}>
          Alma + Personalidad = Expresión, siempre en bruto ({b.alma.bruto} + {b.personalidad.bruto} ={" "}
          {b.expresion.bruto}). Es la comprobación de que la cuenta está bien hecha.
        </p>
      </div>

      {/* Lo que sale de la FECHA —camino de vida, ciclos, realizaciones y
          desafíos— no se repite aquí: vive en «Ciclos vitales», calculado desde
          el manual de la propia Iris. Estuvo duplicado y las dos copias no
          daban lo mismo. */}
      <p style={css(NOTA + "margin:0;max-width:64ch;")}>
        El camino de vida, los ciclos, las realizaciones y los desafíos salen de la fecha, y están en{" "}
        <b style={css("color:var(--text-3);")}>Ciclos vitales</b>.
      </p>

      {/* ══════════════════════════════════════════════ HERENCIAS FAMILIARES */}
      <div>
        <h3 style={css(CABECERA + "margin:0 0 var(--s2);")}>Herencias familiares</h3>
        <p style={css(APOYO + "margin:0 0 var(--s3);max-width:64ch;")}>
          Es la innovación de esta escuela: además del nombre y la fecha, se leen los <b>cuatro</b> apellidos — los dos
          del padre y los dos de la madre. Los dos primeros traen el linaje masculino; los de las abuelas, el femenino.
        </p>
        <div style={css("display:flex;flex-direction:column;gap:2px;")}>
          {b.herencias.map((h) => (
            <div
              key={h.k}
              style={css(
                "display:flex;align-items:baseline;gap:var(--s3);padding:10px 12px;border-radius:var(--r-sm);background:var(--surface);"
              )}
            >
              <span style={css("font-size:var(--t-body);font-weight:590;color:var(--text-2);min-width:9ch;")}>
                {h.nombre}
              </span>
              <span style={css("font-size:var(--t-body);color:var(--text-3);flex:1;min-width:0;overflow-wrap:anywhere;")}>
                {h.apellido || <span style={css("color:var(--text-4);")}>—</span>}
              </span>
              {h.valor && (
                <span data-cifras="" style={css("font-size:var(--t-body);color:var(--text-4);white-space:nowrap;")}>
                  {h.valor.bruto} <span style={css("color:var(--text-4);")}>→</span>{" "}
                  <b style={css("color:var(--text);font-weight:600;")}>{h.valor.reducido}</b>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const celdaCabecera =
  "padding:7px 6px;border-bottom:1px solid var(--border);font-size:var(--t-micro);font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--text-4);";
const celda = "padding:9px 6px;border-bottom:1px solid var(--border);";

/**
 * Un número del nombre o de la fecha, con su bruto y su reducido.
 *
 * El reducido va grande y hundido —es el dato— y el bruto pequeño al lado, con
 * la flecha. Cuando en la cadena aparece un kármico o el resultado es maestro,
 * se dice: son las dos lecturas que se pierden si sólo se enseña el dígito.
 */
function Numero({ titulo, pie, d }: { titulo: string; pie: string; d: Doble }) {
  return (
    <div
      style={css(
        "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s2);box-shadow:var(--nm-alto);"
      )}
    >
      <span style={css("font-size:var(--t-mini);font-weight:600;color:var(--text-3);")}>{titulo}</span>
      <span style={css("display:flex;align-items:baseline;gap:9px;")}>
        <span data-cifras="" style={css("font-size:var(--t-mini);color:var(--text-4);")}>
          {d.bruto}
        </span>
        <span style={css("color:var(--text-4);font-size:var(--t-mini);")}>→</span>
        <b
          data-cifras=""
          style={css(
            "font-size:var(--t-title);font-weight:600;line-height:1;letter-spacing:-.02em;color:" +
              (d.maestro ? "var(--gold-deep)" : "var(--text)") +
              ";"
          )}
        >
          {d.reducido}
        </b>
      </span>
      <span style={css("font-size:var(--t-micro);color:var(--text-4);line-height:1.4;")}>{pie}</span>
      {(d.maestro || d.karmico) && (
        <span style={css("display:flex;flex-wrap:wrap;gap:5px;")}>
          {d.maestro && <Chapa texto="número maestro" />}
          {d.karmico && <Chapa texto={`kármico ${d.karmico}`} />}
        </span>
      )}
    </div>
  );
}

function Chapa({ texto }: { texto: string }) {
  return (
    <span
      style={css(
        "font-size:var(--t-micro);font-weight:600;padding:2px 8px;border-radius:980px;background:var(--gold-soft);color:var(--gold-deep);"
      )}
    >
      {texto}
    </span>
  );
}

/** Cuatro números en fila, con su pie. Realizaciones y desafíos. */
function Tira({
  titulo,
  pie,
  items,
}: {
  titulo: string;
  pie: string;
  items: Array<{ k: string; valor: number; pie: string }>;
}) {
  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s2);")}>
      <span style={css("font-size:var(--t-mini);font-weight:600;color:var(--text-3);")}>{titulo}</span>
      <div style={css("display:flex;gap:var(--s2);")}>
        {items.map((x) => (
          <div
            key={x.k}
            style={css(
              "flex:1;min-width:0;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);padding:10px 6px;display:flex;flex-direction:column;align-items:center;gap:3px;"
            )}
          >
            <b data-cifras="" style={css("font-size:var(--t-head);font-weight:600;line-height:1;color:var(--text);")}>
              {x.valor}
            </b>
            <span style={css("font-size:var(--t-micro);color:var(--text-4);white-space:nowrap;")}>{x.pie}</span>
          </div>
        ))}
      </div>
      <span style={css("font-size:var(--t-micro);color:var(--text-4);line-height:1.4;")}>{pie}</span>
    </div>
  );
}
