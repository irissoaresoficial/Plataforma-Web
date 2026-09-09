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
 * delante en vez de aparecer hecha, y por eso cada casilla se toca y cuenta de
 * dónde sale su número. Quien la usa no viene sólo a leer un resultado: viene a
 * aprender a sacarlo.
 *
 * LA EXPLICACIÓN YA NO VA DEBAJO. Estaba en una tarjeta bajo el dibujo, y para
 * leerla había que bajar — o sea, perder de vista el círculo que se acababa de
 * pulsar. Ahora se abre encima, sobre cristal, con el dibujo detrás.
 *
 * Y SE DICE DE DÓNDE VIENE CADA COSA. Trece casillas tienen fuente escrita
 * publicada; las seis del Espejo cuadran con la tabla de Iris pero ninguna
 * fuente accesible enuncia su fórmula, así que salen marcadas con un punto y lo
 * dicen al abrirse. Esa distinción es lo que separa a una escuela de alguien
 * que se lo inventa: no cuesta nada decirla y lo cambia todo.
 */

import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, NOTA, TITULO } from "@/lib/ui";
import { cuantasCalculan } from "@/lib/base22";
import RejillaBase22 from "./RejillaBase22";
import Pendiente from "./Pendiente";

export default function SeccionNumerologia() {
  const { r, re } = useApp();

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

      <RejillaBase22 base={{ dia: r.fecha.dia, mes: r.fecha.mes, anio: r.fecha.anio }} />

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
