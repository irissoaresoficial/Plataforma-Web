"use client";

/**
 * ============================================================================
 * EL DINERO DE LA PUBLICIDAD — Y LO ÚNICO QUE META NO PUEDE CALCULAR
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026: «quiero que la plataforma en la parte de
 * métricas me muestre gastos, cuántas personas entran, quiero ver todos los
 * datos», y «lo que ven las personas si revisan el vídeo, si lo ven».
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ ESTA PANTALLA EXISTE SI META YA ENSEÑA ESTOS NÚMEROS
 * ---------------------------------------------------------------------------
 * Meta sabe lo que se gasta y cuánta gente hace clic. Lo que Meta NO sabe es
 * qué pasó después del clic: quién dejó su correo y quién no. Eso sólo está
 * aquí, en `leads`.
 *
 * Y el número que decide dónde va el dinero nace justo de juntar las dos
 * mitades: EL COSTE POR PERSONA APUNTADA. No el coste por clic —que es lo que
 * enseña Meta— sino lo que cuesta de verdad cada persona que acaba en la lista.
 * Un anuncio con clics a 0,40 € parece el mejor del mundo hasta que se ve que
 * de esos clics no se apunta nadie.
 *
 * Esa resta no se puede hacer en Meta ni se puede hacer en Firestore. Se hace
 * aquí, y es la razón entera de este archivo.
 *
 * ---------------------------------------------------------------------------
 * LOS NÚMEROS LLEGAN UNA VEZ AL DÍA, Y SE DICE EN PANTALLA
 * ---------------------------------------------------------------------------
 * Vienen de la colección `campana`, que escribe un proceso de fuera (ver
 * `lib/despacho/campana.ts`, que explica por qué no se le pregunta a Meta en
 * directo). Así que pueden ir hasta un día por detrás, y eso se avisa debajo
 * de las cifras en vez de dejar que alguien las lea como si fueran de ahora
 * mismo.
 *
 * SIN DATOS NO SE PINTAN CEROS. Cuatro ceros y un gráfico plano parecen una
 * pantalla rota; lo que pasa es que todavía no se ha escrito el primer día.
 * Así que se dice eso con letras.
 */

import { useMemo } from "react";
import { css } from "@/lib/css";
import { CABECERA, LECTURA, NOTA } from "@/lib/ui";
import { Barras, Linea, type Punto } from "../escuela/Grafico";
import { euros } from "@/lib/despacho";
import type { DiaCampana } from "@/lib/despacho/campana";
import { suma } from "@/lib/despacho/campana";
import type { Lead } from "@/lib/despacho/leads";

/** `2026-10-20` → `20-10`, que es lo que cabe debajo de una barra. */
function corto(dia: string): string {
  const p = dia.split("-");
  return p.length === 3 ? `${p[2]}-${p[1]}` : dia;
}

/** Un entero con el punto de los miles donde lo pone el español. */
function miles(n: number): string {
  return Math.round(n).toLocaleString("es-ES");
}

export default function Gasto({
  dias,
  leads,
  tarjeta,
}: {
  dias: DiaCampana[];
  /**
   * Los apuntados, para poder cruzar euros con personas.
   *
   * `null` SIGNIFICA «NO LOS PUEDO LEER», Y NO ES LO MISMO QUE UNA LISTA
   * VACÍA. Esta pantalla la abren dos personas distintas: Iris, que ve los
   * leads porque son suyos, y quien lleva un curso, que no los ve porque las
   * reglas no se los dejan leer.
   *
   * Si las dos recibieran `[]`, a la segunda le saldría «todavía no se ha
   * apuntado nadie» —que es falso y además desalienta— en vez de «esto no se
   * ve desde aquí». Un hueco honrado vale más que un cero que miente.
   */
  leads: Lead[] | null;
  tarjeta: string;
}) {
  const d = useMemo(() => {
    const t = suma(dias);

    /*
     * LOS APUNTADOS QUE CUENTAN SON LOS QUE TRAJO LA CAMPAÑA, NO TODOS.
     *
     * Si aquí se metieran también los que llegaron por su cuenta, el coste por
     * persona saldría barato por un motivo que no tiene nada que ver con la
     * publicidad: que alguien la conocía de antes. Sería un número que mejora
     * solo cuando la campaña va peor, y con eso no se puede decidir nada.
     *
     * Se cuentan los que llevan etiqueta de campaña Y entraron dentro del
     * periodo del que hay datos de gasto. Las dos condiciones importan: un lead
     * de agosto con etiqueta de otra campaña abarataría este mes sin haber
     * costado un céntimo este mes.
     */
    const dentro = (l: Lead) => {
      if (!l.campana?.source || !l.alta) return false;
      const k = l.alta.toISOString().slice(0, 10);
      return (!t.desde || k >= t.desde) && (!t.hasta || k <= t.hasta);
    };
    const dePago = leads === null ? null : leads.filter(dentro);

    /* Cuánto cuesta cada persona apuntada. Cero apuntados no es «0 €»: es que
       todavía no se puede saber, y se enseña como una raya. */
    const porLead = dePago && dePago.length > 0 ? t.gasto / dePago.length : 0;

    /* De cada cien que llegan a la web por un anuncio, cuántas se apuntan. Es
       lo que dice si el problema está en el anuncio o está en la página. */
    const convierte = dePago && t.clics > 0 ? (dePago.length / t.clics) * 100 : 0;

    /* El gasto día a día, para ver de un vistazo si algún día se disparó. */
    const porDia: Punto[] = dias.map((x) => ({ etiqueta: corto(x.dia), valor: Math.round(x.gasto * 100) / 100 }));

    /* Cada anuncio, sumando todos los días. El reparto del dinero es lo que
       señala qué se apaga mañana. */
    const m = new Map<string, { gasto: number; clics: number }>();
    for (const x of dias)
      for (const a of x.anuncios ?? []) {
        const y = m.get(a.nombre) ?? { gasto: 0, clics: 0 };
        m.set(a.nombre, { gasto: y.gasto + a.gasto, clics: y.clics + a.clics });
      }
    const anuncios = [...m.entries()]
      .sort((a, b) => b[1].gasto - a[1].gasto)
      .slice(0, 8)
      .map(([nombre, v]) => ({
        etiqueta: nombre,
        /* El detalle lleva el coste por clic de ESE anuncio, que es la
           comparación que de verdad se mira: gastar mucho no es malo si el
           clic sale barato. */
        detalle: v.clics > 0 ? `${euros(v.gasto / v.clics)} por clic · ${miles(v.clics)} clics` : "sin clics todavía",
        valor: Math.round(v.gasto * 100) / 100,
      }));

    /* El vídeo: de los que empiezan a verlo, cuántos aguantan. */
    const vid = dias.reduce(
      (a, x) => ({
        empiezan: a.empiezan + (x.video?.empiezan ?? 0),
        cuarto: a.cuarto + (x.video?.cuarto ?? 0),
        mitad: a.mitad + (x.video?.mitad ?? 0),
        entero: a.entero + (x.video?.entero ?? 0),
      }),
      { empiezan: 0, cuarto: 0, mitad: 0, entero: 0 },
    );

    return { t, dePago: dePago === null ? null : dePago.length, porLead, convierte, porDia, anuncios, vid };
  }, [dias, leads]);

  const bloque = (titulo: string, dice: string, hijo: React.ReactNode) => (
    <section style={css(tarjeta)}>
      <h2 style={css(CABECERA + "margin:0;font-size:var(--t-head);")}>{titulo}</h2>
      <p style={css(NOTA + "margin:6px 0 var(--s4);max-width:62ch;line-height:1.5;")}>{dice}</p>
      {hijo}
    </section>
  );

  const cifra = (que: string, valor: string, pie: string) => (
    <div style={css(tarjeta)}>
      <div style={css(NOTA)}>{que}</div>
      <div
        style={css(
          "font-family:var(--font-display);font-size:clamp(28px,3.6vw,40px);font-weight:650;" +
            "line-height:1.05;margin-top:8px;color:var(--text);font-variant-numeric:tabular-nums;letter-spacing:-.03em;",
        )}
      >
        {valor}
      </div>
      <div style={css(NOTA + "margin-top:6px;line-height:1.45;")}>{pie}</div>
    </div>
  );

  /* Todavía no se ha escrito ningún día: se explica, no se pintan ceros. */
  if (dias.length === 0) {
    return (
      <section style={css(tarjeta + "max-width:640px;")}>
        <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Lo que cuesta la publicidad</h2>
        <p style={css(LECTURA + "margin:0;")}>
          Aquí van el gasto de cada día, cuánta gente ve los anuncios, cuántas hacen clic y —lo que de verdad importa—
          cuánto cuesta cada persona que acaba apuntándose. Los números los escribe un proceso una vez al día; aparecerán
          en cuanto corra por primera vez.
        </p>
      </section>
    );
  }

  return (
    <>
      <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(190px,1fr));")}>
        {cifra("Llevamos gastado", euros(d.t.gasto), `Desde el ${corto(d.t.desde)}`)}
        {cifra("Han hecho clic", miles(d.t.clics), `A ${euros(d.t.porClic)} cada clic`)}
        {cifra(
          "Cuesta cada apuntado",
          d.dePago && d.dePago > 0 ? euros(d.porLead) : "—",
          d.dePago === null
            ? "La lista de apuntados no se ve desde aquí"
            : d.dePago > 0
              ? `${d.dePago} personas de la campaña`
              : "Todavía no se ha apuntado nadie de la campaña",
        )}
        {cifra("Personas distintas", miles(d.t.alcance), "El mejor día, no la suma")}
      </div>

      <section style={css(tarjeta + "max-width:70ch;")}>
        <p style={css(NOTA + "margin:0;line-height:1.5;")}>
          Los números de Meta se escriben una vez al día, así que pueden ir hasta un día por detrás. El{" "}
          <strong>coste por apuntado</strong> no lo sabe Meta: sale de cruzar lo que se gastó con la gente que de verdad
          dejó su correo aquí. <strong>Personas distintas</strong> es el mejor día y no la suma de todos, porque sumarlos
          contaría varias veces a la misma persona.
        </p>
      </section>

      {bloque(
        "Cuánto se gasta cada día",
        "Para ver si algún día se disparó el gasto sin que nadie lo tocara.",
        <Linea datos={d.porDia} />,
      )}

      {d.dePago !== null &&
        d.t.clics > 0 &&
        bloque(
          "De los que entran, cuántos se apuntan",
          `De cada cien personas que llegan a la web desde un anuncio, se apuntan ${d.convierte.toFixed(
            1,
          )}. Si esto baja, el problema está en la página, no en el anuncio: el anuncio ya hizo su trabajo trayéndolos.`,
          <Barras
            datos={[
              { etiqueta: "Hicieron clic", valor: d.t.clics },
              { etiqueta: "Se apuntaron", valor: d.dePago ?? 0 },
            ]}
          />,
        )}

      {d.anuncios.length > 0 &&
        bloque(
          "En qué anuncio se va el dinero",
          "Meta reparte solo el presupuesto hacia lo que funciona. Lo que hay que mirar no es quién gasta más, sino a cuánto le sale el clic: gastar mucho con el clic barato es exactamente lo que queremos.",
          <Barras datos={d.anuncios} sufijo=" €" />,
        )}

      {d.vid.empiezan > 0 &&
        bloque(
          "Hasta dónde aguantan el vídeo",
          "Dónde se cae la gente. Si casi nadie pasa del primer cuarto, el problema está en los primeros segundos y hay que cambiar el principio, no el vídeo entero.",
          <Barras
            datos={[
              { etiqueta: "Lo empiezan", valor: d.vid.empiezan },
              {
                etiqueta: "Llegan al cuarto",
                detalle: `${((d.vid.cuarto / d.vid.empiezan) * 100).toFixed(0)}% de los que empiezan`,
                valor: d.vid.cuarto,
              },
              {
                etiqueta: "Llegan a la mitad",
                detalle: `${((d.vid.mitad / d.vid.empiezan) * 100).toFixed(0)}% de los que empiezan`,
                valor: d.vid.mitad,
              },
              {
                etiqueta: "Se lo ven entero",
                detalle: `${((d.vid.entero / d.vid.empiezan) * 100).toFixed(0)}% de los que empiezan`,
                valor: d.vid.entero,
              },
            ]}
          />,
        )}

      {d.t.frecuencia >= 2.5 && (
        <section style={css(tarjeta + "max-width:70ch;border-color:var(--acento,var(--border));")}>
          <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>El público se está quemando</h2>
          <p style={css(LECTURA + "margin:0;")}>
            A la misma persona ya le ha salido el anuncio {d.t.frecuencia.toFixed(1)} veces de media. Por encima de dos
            veces y media la gente deja de verlo y el coste sube solo. Toca ampliar el público o cambiar la pieza.
          </p>
        </section>
      )}
    </>
  );
}
