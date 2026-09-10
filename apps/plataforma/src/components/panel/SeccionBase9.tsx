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
 * ESTA PANTALLA DICE LO QUE NO SABE, Y ESO ES LA MITAD DE SU VALOR
 * ---------------------------------------------------------------------------
 * De las cinco filas de la plantilla de Iris, dos calculan con fórmula
 * verificada —Base y Puente— y tres no tienen fórmula publicada en ninguna
 * fuente accesible: Inducción, Evolución e Inconsciente. Y hay cuatro cálculos
 * más de la escuela —Fuerza, Misión Cósmica, Iniciación Espiritual y el esquema
 * psicoenergético— en la misma situación.
 *
 * Están todos aquí, en rojo, diciendo exactamente qué falta. NO es un hueco: es
 * la lista de lo que hay que preguntarle a Iris, puesta donde ella la va a ver.
 * Un número inventado en una de esas casillas sería un estudio equivocado
 * firmado por ella; una casilla que dice «esto todavía no se calcula» es
 * información útil para las dos partes.
 *
 * La forma más rápida de cerrar las siete de golpe está escrita abajo del todo,
 * en la propia pantalla: una carta suya ya resuelta a mano, entera, con nombre y
 * fecha.
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
          Las cinco filas de la hoja de trabajo, en su orden. Dos calculan; las otras tres no tienen fórmula publicada y
          se dice cuál falta en vez de rellenarlas.
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
                    <th style={css(celda + "text-align:left;font-weight:600;white-space:nowrap;color:" + (falta ? "var(--red)" : "var(--text)") + ";")}>
                      {f.nombre}
                    </th>
                    {b.casas.map((c, i) => (
                      <td
                        key={c.casa}
                        data-cifras=""
                        style={css(
                          celda +
                            "text-align:center;" +
                            (falta ? "color:var(--red);opacity:.6;" : "color:var(--text);font-weight:590;")
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

        {/* Por qué falta cada una de las tres. Va debajo de la tabla y no en un
            tooltip: esto es lo que Iris tiene que leer para saber qué mandarnos,
            y un dato que hay que descubrir pasando el ratón no se lee nunca. */}
        <div style={css("display:flex;flex-direction:column;gap:var(--s3);margin-top:var(--s4);")}>
          {b.filas
            .filter((f) => f.falta)
            .map((f) => (
              <div
                key={f.k}
                style={css(
                  "border-left:2px solid var(--red);padding-left:var(--s3);display:flex;flex-direction:column;gap:4px;"
                )}
              >
                <span style={css("font-size:var(--t-body);font-weight:600;color:var(--red);")}>{f.nombre}</span>
                <span style={css(APOYO + "max-width:70ch;")}>{f.falta}</span>
              </div>
            ))}
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
          <Numero titulo="Equilibrio" pie="Las iniciales · de dónde se saca fuerza" d={b.equilibrio} deducido />
        </div>
        <p style={css(NOTA + "margin:var(--s3) 0 0;max-width:70ch;")}>
          Alma + Personalidad = Expresión, siempre en bruto ({b.alma.bruto} + {b.personalidad.bruto} ={" "}
          {b.expresion.bruto}). Es la comprobación de que la cuenta está bien hecha.{" "}
          <b style={css("color:var(--red);")}>Ojo al nombre:</b> en francés a esta misma suma de consonantes se la llama
          «realización», y el temario de Coquatrix glosa la <i>expresión</i> como «cómo nos ven los demás», que es lo que
          aquí dice la personalidad. Antes de redactar textos sobre estas dos, confirmar con Iris cómo las llama ella.
        </p>
      </div>

      {/* ══════════════════════════════════════════════ LOS NÚMEROS DE LA FECHA */}
      <div>
        <h3 style={css(CABECERA + "margin:0 0 var(--s2);")}>Los números de la fecha</h3>

        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:var(--s3);")}>
          <Numero
            titulo="Camino de vida"
            pie="Día, mes y año reducidos y sumados"
            d={b.camino.porPartes}
            deducido={b.camino.discrepa}
          />
          <Numero
            titulo="Inconsciente"
            pie="9 menos las casas vacías"
            d={{ bruto: b.inconscienteGlobal, reducido: b.inconscienteGlobal, pasos: [b.inconscienteGlobal], karmico: null, maestro: false }}
            deducido
          />
        </div>

        {/* La discrepancia del camino de vida NO se puede tapar. Es el número más
            leído de toda la carta, y las fuentes dan dos métodos que no dan lo
            mismo. Sólo se avisa cuando esta fecha concreta discrepa: avisar
            siempre convertiría la advertencia en decorado. */}
        {b.camino.discrepa && (
          <div
            style={css(
              "margin-top:var(--s3);border-left:2px solid var(--red);padding-left:var(--s3);display:flex;flex-direction:column;gap:4px;"
            )}
          >
            <span style={css("font-size:var(--t-body);font-weight:600;color:var(--red);")}>
              Esta fecha da dos caminos de vida distintos
            </span>
            <span style={css(APOYO + "max-width:70ch;")}>
              Reduciendo día, mes y año por separado y sumando después sale <b>{b.camino.porPartes.reducido}</b>; sumando
              todas las cifras de corrido sale <b>{b.camino.deCorrido.reducido}</b>. Las fuentes dan los dos métodos y no
              coinciden en cuanto entran maestros. Aquí se enseña el primero, que es el que los conserva y el que encaja
              con una escuela que los usa — pero no está confirmado para Coquatrix. Es la pregunta más importante de
              todas.
            </span>
          </div>
        )}

        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--s4);margin-top:var(--s4);")}>
          <Tira
            titulo="Realizaciones"
            pie="Las cuatro etapas, con las edades en que entran"
            items={b.realizaciones.map((x) => ({
              k: String(x.n),
              valor: x.valor,
              pie: x.hasta === null ? `desde los ${x.desde}` : `${x.desde} – ${x.hasta}`,
            }))}
          />
          <Tira
            titulo="Desafíos"
            pie="Restas, no sumas. Un 0 es «el desafío de todos»"
            items={b.desafios.map((x) => ({ k: String(x.n), valor: x.valor, pie: "desafío " + x.n }))}
          />
        </div>
        <p style={css(NOTA + "margin:var(--s3) 0 0;max-width:70ch;")}>
          Las dos tiras son la fórmula pitagórica clásica, no verificada para esta escuela, y hay un desajuste conocido:
          Coquatrix habla de <b>tres</b> desafíos y de tres ciclos —formación, producción y cosecha—, no de cuatro. Puede
          que su esquema no sea el de los cuatro pináculos.
        </p>
      </div>

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
                {h.apellido || <i style={css("color:var(--red);")}>falta este apellido</i>}
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
        <div
          style={css(
            "margin-top:var(--s3);border-left:2px solid var(--red);padding-left:var(--s3);display:flex;flex-direction:column;gap:4px;"
          )}
        >
          <span style={css("font-size:var(--t-body);font-weight:600;color:var(--red);")}>
            Las seis siglas de la plantilla no cuadran
          </span>
          <span style={css(APOYO + "max-width:70ch;")}>
            En la hoja de Iris este bloque tiene seis filas —MPP, NCE, EJE, MF, MG, MFG— y el sistema documentado usa
            cuatro apellidos. Esas siglas no aparecen en ninguna fuente, en ningún idioma. Pueden ser cuatro apellidos
            más dos síntesis (línea paterna y línea materna), o abreviaturas suyas. Hasta saberlo, aquí están los cuatro
            linajes documentados y nada más. Los dos de las abuelas no se piden todavía en la consulta: en cuanto se
            sepa qué son las seis filas, se añaden al formulario.
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ LO QUE FALTA */}
      <div>
        <h3 style={css(CABECERA + "margin:0 0 var(--s2);")}>Lo que todavía no se calcula</h3>
        <p style={css(APOYO + "margin:0 0 var(--s3);max-width:64ch;")}>
          Cuatro cálculos que están en el temario de la escuela con estos nombres exactos y de los que nadie publica la
          fórmula. No se inventan.
        </p>
        <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
          {b.sinFormula.map((s) => (
            <div
              key={s.nombre}
              style={css("border-left:2px solid var(--red);padding-left:var(--s3);display:flex;flex-direction:column;gap:4px;")}
            >
              <span style={css("font-size:var(--t-body);font-weight:600;color:var(--red);")}>{s.nombre}</span>
              <span style={css(APOYO + "max-width:70ch;")}>{s.falta}</span>
            </div>
          ))}
        </div>

        <div
          style={css(
            "margin-top:var(--s4);padding:var(--pad-card-sm);border-radius:var(--r);background:var(--gold-soft);color:var(--gold-deep);display:flex;flex-direction:column;gap:6px;"
          )}
        >
          <span style={css("font-size:var(--t-body);font-weight:600;")}>Lo que cierra todo esto de una vez</span>
          <span style={css("font-size:var(--t-body);line-height:1.55;max-width:70ch;")}>
            Una carta tuya ya resuelta a mano, entera, con el nombre y la fecha. Con una sola se despejan la Inducción,
            la Evolución, el Inconsciente, la Fuerza, el método del camino de vida y el número de desafíos: basta con
            comparar tus números con los que salen aquí y deducir la operación. Es, con diferencia, lo más rentable.
          </span>
        </div>
      </div>

      {/* La procedencia, al final y sin adornos. Es lo mismo que hace la rejilla
          de 22, y es lo que separa a una escuela de alguien que se lo inventa. */}
      <p style={css(NOTA + "margin:0;max-width:70ch;")}>
        El sistema es de <b style={css("color:var(--text-3);")}>Martine Coquatrix</b>, «Numerología Evolutiva del Alma»
        (<i>La numerología a la luz del Árbol de Vida y las Letras Hebraicas</i>, 2018). La tabla de letras, la mecánica
        del recuento y la fórmula del puente —incluida la excepción de la casa vacía— están verificadas contra un caso
        resuelto publicado, seis comprobaciones de seis. Todo lo marcado en rojo está sin fuente, y todo lo que sale con
        la nota «deducido» viene de una sola fuente o de otra escuela.
      </p>
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
function Numero({
  titulo,
  pie,
  d,
  deducido,
}: {
  titulo: string;
  pie: string;
  d: Doble;
  deducido?: boolean;
}) {
  return (
    <div
      style={css(
        "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s2);box-shadow:var(--nm-alto);"
      )}
    >
      <span style={css("font-size:var(--t-mini);font-weight:600;color:var(--text-3);display:flex;align-items:center;gap:6px;")}>
        {titulo}
        {deducido && (
          <span
            title="Deducido: una sola fuente, o fuente de otra escuela"
            style={css("width:7px;height:7px;border-radius:50%;background:var(--gold);flex:none;")}
          />
        )}
      </span>
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
      <span style={css("font-size:var(--t-mini);font-weight:600;color:var(--text-3);display:flex;align-items:center;gap:6px;")}>
        {titulo}
        <span
          title="Deducido: fórmula clásica, no verificada para esta escuela"
          style={css("width:7px;height:7px;border-radius:50%;background:var(--gold);flex:none;")}
        />
      </span>
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
