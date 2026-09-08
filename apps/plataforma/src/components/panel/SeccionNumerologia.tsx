"use client";

/**
 * ============================================================================
 * NUMEROLOGÍA — LA REJILLA DE BASE 22
 * ============================================================================
 *
 * La otra lectura de la misma fecha. La parte de Kábala lee el árbol, los
 * arcanos y los ciclos; ésta coloca a la persona en una rejilla de diecinueve
 * casillas que se leen por parejas: lo social arriba, la defensa abajo, y en el
 * centro la familia de la que sale todo.
 *
 * ESTA PANTALLA ES DE ESCUELA, NO SÓLO DE CONSULTA. Por eso la tabla se arma
 * delante en vez de aparecer hecha, y por eso cada casilla se puede pulsar para
 * ver de dónde sale su número. Quien la usa no viene sólo a leer un resultado:
 * viene a aprender a sacarlo.
 *
 * Y POR ESO SE DICE DE DÓNDE VIENE CADA COSA. Trece casillas tienen fuente
 * escrita publicada; las seis del Espejo cuadran con la tabla de Iris pero
 * ninguna fuente accesible enuncia su fórmula, así que salen marcadas con un
 * punto y lo dicen cuando se abren. Esa distinción es lo que separa a una
 * escuela de alguien que se lo inventa: no cuesta nada decirla y lo cambia todo.
 */

import { useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, NOTA, PAD_SM, TARJETA, TITULO } from "@/lib/ui";
import { cuantasCalculan, type Calculada } from "@/lib/base22";
import RejillaBase22 from "./RejillaBase22";
import Pendiente from "./Pendiente";

export default function SeccionNumerologia() {
  const { r, re } = useApp();
  const [abierta, setAbierta] = useState<Calculada | null>(null);

  /* Una empresa no tiene fecha de nacimiento, y esta tabla entera sale de la
     fecha. No es que falte: es que no aplica. */
  if (re && !r) {
    return (
      <Pendiente
        titulo="La rejilla es de personas"
        pie="Las diecinueve casillas salen del día, el mes y el año de nacimiento. Una empresa se lee sólo de su nombre, así que aquí no hay nada que colocar."
      />
    );
  }
  if (!r) return null;

  const { total, confirmadas, reconstruidas } = cuantasCalculan();

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--gap-lg);")}>
      <div>
        <h2 style={css(TITULO + "margin:0 0 var(--s2);")}>Rejilla de base 22</h2>
        <p style={css(APOYO + "margin:0 0 var(--s2);max-width:64ch;")}>
          Del día, el mes y el año salen diecinueve números que se colocan siempre en el mismo sitio. Arriba, lo que la
          persona enseña fuera; abajo, lo que monta para defenderse; en el centro, la familia de la que sale todo.
        </p>
        <p style={css(APOYO + "margin:0;max-width:64ch;")}>
          La tabla es un espejo: la mitad de arriba <b style={css("color:var(--text);")}>suma</b> los pares de la fecha y
          la de abajo <b style={css("color:var(--text);")}>resta</b> exactamente los mismos, el mayor menos el menor. El
          nudo de dolor es el nudo emocional restado; la huida es el emersor restado.
        </p>
      </div>

      <RejillaBase22 base={{ dia: r.fecha.dia, mes: r.fecha.mes, anio: r.fecha.anio }} alElegir={setAbierta} />

      {/* La ficha de la casilla que se acabe de pulsar. Va debajo del dibujo y
          no en una ventana encima: en clase se mira la tabla y la explicación a
          la vez, y una ventana que tapa la tabla obliga a cerrarla para
          comprobar lo que se acaba de leer. */}
      {abierta && (
        <section style={css(TARJETA + PAD_SM + "display:flex;flex-direction:column;gap:var(--s3);")}>
          <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
            <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>La casilla</span>
            <span style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-title);color:var(--text);")}>
              {abierta.nombre}
            </span>
            {abierta.sigla && (
              <span style={css("font-size:var(--t-mini);color:var(--text-4);letter-spacing:.04em;")}>
                {abierta.sigla}
              </span>
            )}
            {abierta.valor !== null && (
              <span style={css("margin-left:auto;font-family:var(--font-ui);font-weight:600;font-size:var(--t-hero);color:var(--gold);line-height:1;")}>
                {abierta.valor}
              </span>
            )}
          </div>

          {abierta.de ? (
            <p style={css(APOYO + "margin:0;")}>
              <b style={css("color:var(--text);")}>De dónde sale:</b> {abierta.de}.
              {abierta.valor9 !== null && <> En base 9 se lee como un {abierta.valor9}.</>}
            </p>
          ) : (
            <p style={css(APOYO + "margin:0;color:var(--red);")}>
              Todavía no está la fórmula de esta casilla. No se rellena a ojo: un número inventado aquí acaba en el
              documento que se le entrega a la persona.
            </p>
          )}

          {abierta.significado && <p style={css(APOYO + "margin:0;")}>{abierta.significado}</p>}

          {/* De dónde viene la fórmula. Sólo se dice cuando hay algo que decir:
              en las trece con fuente no hace falta ninguna coletilla. */}
          {abierta.certeza === "reconstruido" && (
            <p style={css(NOTA + "margin:0;border-left:2px solid var(--gold);padding-left:var(--s3);")}>
              <b style={css("color:var(--text-2);")}>Casilla deducida.</b> Esta fórmula da exactamente el número que
              tiene la tabla de Iris hecha a mano, y sigue la regla del Espejo —restar, el mayor menos el menor, y un
              cero se lee como 22—, pero ninguna fuente publicada la enuncia con estas palabras. Se enseña como
              deducción, no como cita.
            </p>
          )}

          {abierta.aviso && <p style={css(NOTA + "margin:0;")}>{abierta.aviso}</p>}

          <button
            onClick={() => setAbierta(null)}
            style={css(
              "align-self:flex-start;background:none;border:none;color:var(--text-3);font-size:var(--t-mini);cursor:pointer;padding:0;text-decoration:underline;"
            )}
          >
            Cerrar
          </button>
        </section>
      )}

      {/* El estado, dicho con los números exactos. «Comprobado» a secas no dice
          nada; decir cuántas tienen fuente y cuántas son deducción se puede
          comprobar, y es lo que hace creíble el resto. */}
      <p style={css(NOTA + "margin:0;max-width:64ch;")}>
        Las {total} casillas calculan, y las {total} dan los mismos números que la tabla que Iris tiene hecha a mano.
        De ellas, {confirmadas} tienen además fuente escrita publicada —el sistema es de Kris Hadar,{" "}
        <i>La numérologie à 22 nombres</i>, 1990— y {reconstruidas}, las del Espejo, cuadran con la tabla pero no
        aparecen enunciadas en ninguna fuente accesible: van marcadas con un punto.
      </p>
    </div>
  );
}
