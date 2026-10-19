"use client";

/**
 * ============================================================================
 * LA CAMPAÑA — DE DÓNDE SALE CADA PERSONA Y QUÉ HACE DESPUÉS
 * ============================================================================
 *
 * Gerson, el 19 de octubre: «métricas de dónde vienen las personas, métricas
 * que necesitemos para constantes mejoras», «quiero ver los leads que entran
 * que salen», «datos que me permitan modificar y mejorar siempre las campañas
 * publicitarias».
 *
 * Son tres peticiones y una sola pregunta de fondo: ¿QUÉ APAGO Y QUÉ SUBO?
 * Por eso esta pantalla no enseña todo lo que se puede contar, sino las cuatro
 * cosas con las que se puede hacer algo mañana por la mañana.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ «QUÉ ANUNCIO LOS TRAE» ES EL BLOQUE QUE MANDA
 * ---------------------------------------------------------------------------
 * Meta ya dice cuánto cuesta cada anuncio. Lo que Meta NO sabe es qué pasó
 * después: cuál de esos leads contestó, cuál se hizo cliente y cuál no abrió
 * un correo en su vida. Eso sólo está aquí.
 *
 * Y la diferencia decide dinero. Un anuncio que trae leads a 1,50 € parece el
 * mejor de todos hasta que se ve que ninguno de esos leads compra nunca; y el
 * de 6 € que parecía caro resulta ser el único que trae gente de verdad. Esa
 * comparación no se puede hacer en Meta, porque Meta se queda en el clic.
 *
 * ---------------------------------------------------------------------------
 * EL COSTE POR LEAD NO SALE AQUÍ, Y ES A PROPÓSITO
 * ---------------------------------------------------------------------------
 * Haría falta saber cuánto se gastó, y eso vive en Meta. Se podría pedir a
 * mano —«escribe aquí lo que gastaste»— y entonces esta pantalla enseñaría un
 * número que depende de que alguien se acuerde de actualizarlo cada semana. El
 * día que no se acuerde, el coste por lead sería falso y nadie lo sabría.
 *
 * Así que aquí va el reparto —cuántos trae cada anuncio— y el coste se mira en
 * Meta, que es quien lo sabe sin que nadie teclee nada. Dividir lo segundo
 * entre lo primero es una cuenta de diez segundos y siempre es verdad.
 *
 * ---------------------------------------------------------------------------
 * LA LEY, QUE AQUÍ TAMBIÉN APLICA
 * ---------------------------------------------------------------------------
 * «De dónde entran» va por país y ciudad. Nunca la dirección de internet
 * entera: en Europa eso es un dato personal y no hace falta para decidir nada
 * de lo que hay en esta pantalla.
 */

import { useMemo } from "react";
import { css } from "@/lib/css";
import { CABECERA, LECTURA, NOTA } from "@/lib/ui";
import { Barras, Linea, type Punto } from "../escuela/Grafico";
import type { Lead } from "@/lib/despacho/leads";

const DIAS = 30;

/** Cuántos leads van entrando cada día, los últimos treinta. */
function porDia(leads: Lead[]): Punto[] {
  const cuenta = new Map<string, number>();
  const hoy = new Date();
  for (let i = DIAS - 1; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - i);
    cuenta.set(d.toISOString().slice(0, 10), 0);
  }
  for (const l of leads) {
    if (!l.alta) continue;
    const k = l.alta.toISOString().slice(0, 10);
    if (cuenta.has(k)) cuenta.set(k, (cuenta.get(k) || 0) + 1);
  }
  return [...cuenta.entries()].map(([k, valor]) => ({ etiqueta: k.slice(5), valor }));
}

/**
 * Agrupa y ordena de más a menos, con tope.
 *
 * El tope no es por rendimiento: es porque una lista de cuarenta barras no se
 * lee. Lo que no entra en las ocho primeras no va a cambiar ninguna decisión,
 * y dejarlo fuera hace que las ocho que importan se vean.
 */
function agrupa(leads: Lead[], de: (l: Lead) => string, tope = 8): Punto[] {
  const m = new Map<string, number>();
  for (const l of leads) {
    const k = de(l);
    if (!k) continue;
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, tope)
    .map(([etiqueta, valor]) => ({ etiqueta, valor }));
}

export default function Embudo({ leads, tarjeta }: { leads: Lead[]; tarjeta: string }) {
  const d = useMemo(() => {
    const corte = new Date();
    corte.setDate(corte.getDate() - DIAS);
    const recientes = leads.filter((l) => l.alta && l.alta >= corte);

    const deCampana = recientes.filter((l) => l.campana?.source);

    return {
      recientes,
      total: recientes.length,
      deCampana: deCampana.length,
      /* Los que llegaron por su cuenta: nadie pagó por ellos. Verlos al lado de
         los de pago es lo que dice si la campaña está aportando algo o sólo
         está cobrando por gente que iba a entrar igual. */
      organicos: recientes.length - deCampana.length,
      fuera: recientes.filter((l) => l.estado === "descartado").length,
      dias: porDia(recientes),

      /* El anuncio CONCRETO. Si no hay etiqueta de anuncio se cae a la campaña,
         y si tampoco, a quién lo manda: siempre algo antes que nada. */
      anuncios: agrupa(deCampana, (l) =>
        l.campana?.content || l.campana?.campaign || l.campana?.source || "",
      ),
      fuentes: agrupa(recientes, (l) => l.campana?.source || "directo o buscador"),
      lugares: agrupa(recientes, (l) =>
        l.ciudad && l.pais ? `${l.ciudad} · ${l.pais}` : l.pais || "",
      ),
      puertas: agrupa(recientes, (l) => l.campana?.landing || ""),

      embudo: [
        { etiqueta: "Nuevos, sin hablar", valor: recientes.filter((l) => l.estado === "nuevo").length },
        { etiqueta: "Ya contactados", valor: recientes.filter((l) => l.estado === "contactado").length },
        { etiqueta: "Son clientes", valor: recientes.filter((l) => l.estado === "cliente").length },
        { etiqueta: "Descartados", valor: recientes.filter((l) => l.estado === "descartado").length },
      ].filter((x) => x.valor > 0),
    };
  }, [leads]);

  const bloque = (titulo: string, dice: string, hijo: React.ReactNode) => (
    <section style={css(tarjeta)}>
      <h2 style={css(CABECERA + "margin:0;font-size:var(--t-head);")}>{titulo}</h2>
      <p style={css(NOTA + "margin:6px 0 var(--s4);max-width:62ch;line-height:1.5;")}>{dice}</p>
      {hijo}
    </section>
  );

  const cifra = (que: string, valor: string | number, pie: string) => (
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

  /* Sin leads no se dibuja un cuadro de mando vacío: se dice qué falta para
     que se llene. Cuatro ceros y tres gráficos planos parecen una pantalla
     rota, y lo que pasa es que todavía no ha entrado nadie. */
  if (d.total === 0) {
    return (
      <section style={css(tarjeta + "max-width:640px;")}>
        <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Todavía no ha entrado nadie</h2>
        <p style={css(LECTURA + "margin:0;")}>
          Aquí aparecerá cada persona que deje su correo en la web: de qué anuncio vino, desde qué ciudad y qué hizo
          después. Se llena solo en cuanto entre el primero.
        </p>
      </section>
    );
  }

  return (
    <>
      <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(190px,1fr));")}>
        {cifra("Se han apuntado", d.total, `En los últimos ${DIAS} días`)}
        {cifra("Vinieron de un anuncio", d.deCampana, "Con etiqueta de campaña")}
        {cifra("Llegaron por su cuenta", d.organicos, "Sin pagar por ellos")}
        {cifra("Descartados", d.fuera, "No siguen adelante")}
      </div>

      {bloque(
        "Cuánta gente se apunta cada día",
        "Para ver el efecto de lo que se hizo: el día que sube la línea es el día que algo funcionó.",
        <Linea datos={d.dias} />,
      )}

      {d.anuncios.length > 0
        ? bloque(
            "Qué anuncio los trae",
            "Cuántas personas ha traído cada pieza. El coste de cada una lo dice Meta; dividir una cosa entre la otra es lo que señala qué anuncio se sube y cuál se apaga.",
            <Barras datos={d.anuncios} />,
          )
        : bloque(
            "Qué anuncio los trae",
            "Todavía no ha entrado nadie con etiqueta de campaña.",
            <p style={css(LECTURA + "margin:0;max-width:62ch;")}>
              Para que esto se llene, los enlaces de los anuncios tienen que llevar la cola de siempre:{" "}
              <code style={css("font-size:13px;")}>?utm_source=meta&amp;utm_campaign=…&amp;utm_content=…</code>. Lo que
              se escriba en <code style={css("font-size:13px;")}>utm_content</code> es lo que aparece en este gráfico,
              así que conviene que sea el nombre de la pieza: <em>video-marco-30s</em>, no <em>anuncio1</em>.
            </p>,
          )}

      {d.lugares.length > 0 &&
        bloque(
          "De dónde entran",
          "Ciudad y país de quien se apunta. Decide dónde se anuncia y a qué hora se publica. Se guarda sólo esto, nunca la dirección de internet de nadie.",
          <Barras datos={d.lugares} />,
        )}

      {d.fuentes.length > 1 &&
        bloque(
          "Quién los manda",
          "Meta, Instagram, el buscador o directamente. «Directo o buscador» es quien llegó sin etiqueta: casi siempre, gente que ya os conocía.",
          <Barras datos={d.fuentes} />,
        )}

      {d.puertas.length > 1 &&
        bloque(
          "Por qué puerta entran",
          "La primera página que pisaron. Si una página trae gente y otra no, ahí hay una decisión.",
          <Barras datos={d.puertas} />,
        )}

      {d.embudo.length > 1 &&
        bloque(
          "Qué pasa después",
          "En qué punto está cada persona. Si casi todos siguen en «nuevos», el problema no es la campaña: es que nadie les ha escrito todavía.",
          <Barras datos={d.embudo} />,
        )}
    </>
  );
}
