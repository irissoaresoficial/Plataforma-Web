"use client";

/**
 * ============================================================================
 * LA CAMPAÑA ENTERA: DEL EURO A LA PERSONA APUNTADA
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026: «quiero saber todo cuánto me gasto, con
 * comunicación profesional y que se vea muy bien». Y antes: que quien lleve un
 * curso delegado vea «las métricas de Facebook también y las métricas de la
 * web, evidentemente de la web donde estén captando público».
 *
 * Son las dos mitades de un mismo recorrido, y por eso van en una sola
 * pantalla y en un solo orden:
 *
 *     euros  →  lo ven  →  hacen clic  →  cargan la página  →  dejan el correo
 *
 * Cada flecha de esas es un sitio donde se pierde gente, y cada una se arregla
 * de una forma distinta. Si caen entre «lo ven» y «hacen clic», el problema es
 * el anuncio. Entre «hacen clic» y «cargan», es que la web va lenta. Entre
 * «cargan» y «dejan el correo», es la página de la masterclass. Enseñar las
 * cinco cifras juntas es lo que permite señalar cuál de las tres cosas hay que
 * tocar, en vez de cambiarlo todo a ciegas.
 *
 * ---------------------------------------------------------------------------
 * TODO SALE DE `campana`, Y ESO ES UNA DECISIÓN, NO UNA LIMITACIÓN
 * ---------------------------------------------------------------------------
 * Los apuntados podrían leerse de `leads`, que es donde están de verdad. No se
 * hace, por dos motivos:
 *
 *   1. Esta pantalla la abren dos personas. Iris ve `leads`; quien lleva un
 *      curso delegado, no —ni debe—. Si cada una sacara el número de un sitio,
 *      verían costes por persona distintos, y dos cifras distintas para lo
 *      mismo valen menos que una sola.
 *   2. En `campana` hay un RECUENTO, no una lista. Ni correos, ni nombres, ni
 *      ciudades. Quien lleva un curso necesita saber que entraron nueve
 *      personas; no necesita saber quiénes son, y no tiene por qué verlo.
 *
 * El recuento lo hace el proceso diario contando contra `leads`, así que no
 * puede discrepar de la realidad: la realidad es `leads`.
 *
 * ---------------------------------------------------------------------------
 * LO QUE NO SE HACE AQUÍ
 * ---------------------------------------------------------------------------
 * · NO se pintan ceros cuando no hay datos. Cuatro ceros parecen una pantalla
 *   rota; lo que pasa es que el proceso aún no ha corrido, y eso se dice.
 * · NO se suma el alcance entre días: serían las mismas personas contadas
 *   varias veces. Se enseña el mejor día y se avisa de que es eso.
 * · NO se calla cuando hay clics y cero apuntados. Es la señal de que algo se
 *   ha roto en el formulario, y es cara: el dinero sigue saliendo.
 */

import { useMemo } from "react";
import { css } from "@/lib/css";
import { APOYO, CABECERA, LECTURA, NOTA } from "@/lib/ui";
import { Barras, Linea, type Punto } from "../escuela/Grafico";
import { euros } from "@/lib/despacho";
import { suma, type DiaCampana } from "@/lib/despacho/campana";

/** `2026-10-20` → `20-10`, que es lo que cabe debajo de una barra. */
function corto(dia: string): string {
  const p = dia.split("-");
  return p.length === 3 ? `${p[2]}-${p[1]}` : dia;
}

/** Un entero con el punto de los miles donde lo pone el español. */
function miles(n: number): string {
  return Math.round(n).toLocaleString("es-ES");
}

/**
 * Un decimal CON COMA, que es como se escribe en español.
 *
 * `toFixed` devuelve «2.99», con el punto del inglés. Puesto al lado de un
 * «22,78 €» con coma —en la misma tarjeta— canta: son dos idiomas a la vez en
 * una pantalla que se le enseña a un cliente.
 */
function dec(n: number, cifras = 1): string {
  return n.toLocaleString("es-ES", { minimumFractionDigits: cifras, maximumFractionDigits: cifras });
}

export default function Gasto({ dias, tarjeta }: { dias: DiaCampana[]; tarjeta: string }) {
  const d = useMemo(() => {
    const t = suma(dias);

    const porDia: Punto[] = dias.map((x) => ({ etiqueta: corto(x.dia), valor: Math.round(x.gasto * 100) / 100 }));

    /* Cada anuncio, sumando todos los días. */
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
        /* Lo que de verdad se compara entre anuncios no es cuánto gasta, sino a
           cuánto le sale el clic. Gastar mucho con el clic barato es lo que se
           quiere que pase. */
        detalle: v.clics > 0 ? `${euros(v.gasto / v.clics)} por clic · ${miles(v.clics)} clics` : "sin clics todavía",
        valor: Math.round(v.gasto * 100) / 100,
        /* El importe ya escrito: «10,50 €» y no «10,5 €». */
        texto: euros(v.gasto),
      }));

    const vid = dias.reduce(
      (a, x) => ({
        empiezan: a.empiezan + (x.video?.empiezan ?? 0),
        cuarto: a.cuarto + (x.video?.cuarto ?? 0),
        mitad: a.mitad + (x.video?.mitad ?? 0),
        entero: a.entero + (x.video?.entero ?? 0),
      }),
      { empiezan: 0, cuarto: 0, mitad: 0, entero: 0 },
    );

    return { t, porDia, anuncios, vid };
  }, [dias]);

  const bloque = (titulo: string, dice: string, hijo: React.ReactNode) => (
    <section style={css(tarjeta)}>
      <h2 style={css(CABECERA + "margin:0;font-size:var(--t-head);")}>{titulo}</h2>
      {/* APOYO y no NOTA: `--text-4` es el gris de los pies de foto, y esta
          frase no es un pie — es la que dice qué hay que mirar en el
          gráfico de debajo. Si no se lee, el gráfico no se entiende. */}
      <p style={css(APOYO + "margin:6px 0 var(--s4);max-width:62ch;")}>{dice}</p>
      {hijo}
    </section>
  );

  const cifra = (que: string, valor: string, pie: string, destacar = false) => (
    <div
      style={css(
        tarjeta +
          (destacar
            ? "background:var(--bloque);color:var(--sobre-bloque);border-color:var(--bloque-borde);box-shadow:var(--shadow-lg);"
            : ""),
      )}
    >
      <div style={css(NOTA + (destacar ? "color:var(--sobre-bloque-2);" : "color:var(--text-3);"))}>{que}</div>
      <div
        style={css(
          "font-family:var(--font-display);font-size:clamp(28px,3.6vw,40px);font-weight:650;" +
            "line-height:1.05;margin-top:8px;font-variant-numeric:tabular-nums;letter-spacing:-.03em;" +
            (destacar ? "color:inherit;" : "color:var(--text);"),
        )}
      >
        {valor}
      </div>
      <div style={css(NOTA + "margin-top:6px;line-height:1.45;" + (destacar ? "color:var(--sobre-bloque-2);" : "color:var(--text-3);"))}>
        {pie}
      </div>
    </div>
  );

  /* Todavía no se ha escrito ningún día: se explica, no se pintan ceros. */
  if (dias.length === 0) {
    return (
      <section style={css(tarjeta + "max-width:640px;")}>
        <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Inversión publicitaria</h2>
        <p style={css(LECTURA + "margin:0;")}>
          Aquí van el gasto de cada día, cuánta gente ve los anuncios, cuántas llegan a la web y —lo que de verdad
          importa— cuánto cuesta cada persona que acaba dejando su correo. Los números se escriben una vez al día;
          aparecerán en cuanto el proceso corra por primera vez.
        </p>
      </section>
    );
  }

  const t = d.t;
  /* El denominador honrado de la conversión: quien no llegó a cargar la página
     no tuvo ocasión de apuntarse. Mientras no haya aterrizajes medidos se usan
     los clics, que es lo único que hay. */
  const llegaron = t.aterrizajes > 0 ? t.aterrizajes : t.clics;

  return (
    <>
      <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(190px,1fr));")}>
        {cifra("Llevamos gastado", euros(t.gasto), `Desde el ${corto(t.desde)}`)}
        {cifra("Han hecho clic", miles(t.clics), `A ${euros(t.porClic)} cada clic`)}
        {cifra(
          "Cuesta cada apuntado",
          t.apuntadosDePago > 0 ? euros(t.porApuntado) : "—",
          t.apuntadosDePago > 0
            ? `${t.apuntadosDePago} personas de la campaña`
            : "Todavía no se ha apuntado nadie de la campaña",
          true,
        )}
        {cifra("Personas distintas", miles(t.alcance), "El mejor día, no la suma")}
      </div>

      {/* ------------------------------------------------------- lo que esperamos */}
      {/*
       * AQUÍ HABÍA UN CARTEL ROJO QUE DECÍA «han entrado X personas y no se ha
       * apuntado ninguna», y se ha quitado a propósito.
       *
       * Gerson, el 21 de octubre: «no quiero que muestres esto, esto me lo
       * dices a mí; mejor coloca, se espera conseguir x a x leads; los
       * problemas aquí en el chat».
       *
       * Y tiene razón. Esta pantalla no la abre sólo quien lleva la campaña:
       * la abren Iris y la persona a quien se le delega un curso. Para ellas,
       * un aviso en rojo diciendo que algo puede estar roto no es información
       * útil —no pueden arreglarlo— sino una alarma sobre un trabajo que no es
       * el suyo. Un panel que asusta a quien no puede actuar deja de abrirse.
       *
       * El aviso NO se ha perdido: vive donde sirve, que es el informe diario
       * de quien lleva la publicidad. El script que escribe estos números
       * (`scripts/campana-dia.mjs`) sigue gritando en la consola cuando hay
       * clics y cero apuntados.
       *
       * En su lugar va lo que sí le sirve a quien mira: cuántas personas se
       * esperan. Y se dice con un rango y no con un número, porque un número
       * exacto sería mentira: esto depende de cuánta gente se apunte de la que
       * entra, y eso no se sabe hasta que entra.
       */}
      {t.prevision && (
        <section style={css(tarjeta + "max-width:70ch;")}>
          <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Lo que esperamos</h2>
          <p style={css(LECTURA + "margin:0 0 var(--s2);")}>
            Con el presupuesto de esta campaña se esperan entre{" "}
            <strong>
              {miles(t.prevision.min)} y {miles(t.prevision.max)} personas apuntadas
            </strong>
            {t.apuntadosDePago > 0 ? (
              <>
                {" "}
                antes de la masterclass. Van <strong>{miles(t.apuntadosDePago)}</strong>.
              </>
            ) : (
              <> antes de la masterclass.</>
            )}
          </p>
          <p style={css(APOYO + "margin:0;")}>
            Es una previsión, no una promesa: depende de cuánta gente se apunte de la que entra en la página, y eso se
            va sabiendo sobre la marcha. Se ajusta cada día con los números reales.
          </p>
        </section>
      )}

      {/* ---------------------------------------------------------- el recorrido */}
      {bloque(
        "El recorrido completo, de los euros a las personas",
        "Dónde se pierde gente. Entre «lo ven» y «hacen clic» manda el anuncio; entre «hacen clic» y «llegan a la web» manda lo rápido que cargue; entre «llegan» y «se apuntan» manda la página de la masterclass. Cada escalón se arregla de una forma distinta.",
        <Barras
          datos={[
            { etiqueta: "Lo han visto", detalle: "personas distintas", valor: t.alcance },
            {
              etiqueta: "Han hecho clic",
              detalle: `${dec(t.ctr, 2)} de cada 100 que lo ven`,
              valor: t.clics,
            },
            ...(t.aterrizajes > 0
              ? [
                  {
                    etiqueta: "Han llegado a la web",
                    detalle: `se pierden ${miles(t.clics - t.aterrizajes)} por el camino`,
                    valor: t.aterrizajes,
                  },
                ]
              : []),
            {
              etiqueta: "Han dejado su correo",
              detalle: llegaron > 0 ? `${dec(t.convierte)} de cada 100 que llegan` : "",
              valor: t.apuntadosDePago,
            },
          ]}
        />,
      )}

      <section style={css(tarjeta + "max-width:70ch;")}>
        <p style={css(APOYO + "margin:0;")}>
          Los números de Meta se escriben una vez al día, así que pueden ir hasta un día por detrás. El{" "}
          <strong>coste por apuntado</strong> no lo sabe Meta: sale de cruzar lo que se gastó con la gente que de verdad
          dejó su correo. <strong>Personas distintas</strong> es el mejor día y no la suma de todos, porque sumarlos
          contaría varias veces a la misma persona.
        </p>
      </section>

      {bloque(
        "Cuánto se gasta cada día",
        "Para ver si algún día se disparó el gasto sin que nadie lo tocara.",
        <Linea datos={d.porDia} />,
      )}

      {d.anuncios.length > 0 &&
        bloque(
          "En qué anuncio se va el dinero",
          "Meta reparte solo el presupuesto hacia lo que funciona. Lo que hay que mirar no es quién gasta más, sino a cuánto le sale el clic: gastar mucho con el clic barato es exactamente lo que queremos.",
          <Barras datos={d.anuncios} />,
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
                detalle: `${miles((d.vid.cuarto / d.vid.empiezan) * 100)} % de los que empiezan`,
                valor: d.vid.cuarto,
              },
              {
                etiqueta: "Llegan a la mitad",
                detalle: `${miles((d.vid.mitad / d.vid.empiezan) * 100)} % de los que empiezan`,
                valor: d.vid.mitad,
              },
              {
                etiqueta: "Se lo ven entero",
                detalle: `${miles((d.vid.entero / d.vid.empiezan) * 100)} % de los que empiezan`,
                valor: d.vid.entero,
              },
            ]}
          />,
        )}

      {t.frecuencia >= 2.5 && (
        <section style={css(tarjeta + "max-width:70ch;")}>
          <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>El público se está quemando</h2>
          <p style={css(LECTURA + "margin:0;")}>
            A la misma persona ya le ha salido el anuncio {dec(t.frecuencia)} veces de media. Por encima de dos
            veces y media la gente deja de verlo y el coste sube solo. Toca ampliar el público o cambiar la pieza.
          </p>
        </section>
      )}
    </>
  );
}
