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
 * POR QUÉ ESTO SE REHIZO EL 22 DE OCTUBRE
 * ---------------------------------------------------------------------------
 * Gerson: «ese dashboard de métricas está horrible», con una referencia al
 * lado. Y tenía razón. Lo que fallaba no eran los números, que eran los
 * mismos: era que estaban enterrados en prosa. Un bloque de texto largo
 * arriba, otro en medio explicando la previsión, y los cuatro datos buenos
 * repartidos entre medias. Para saber cómo iba la campaña había que LEER.
 *
 * Un cuadro de mando no se lee: se mira. Así que:
 *
 *   · EL PLAN pasa a una banda fina de dos columnas. Sigue el primero —eso
 *     Gerson lo pidió y es correcto, sin él el gasto no significa nada— pero
 *     deja de ocupar una pantalla.
 *   · LA CIFRA QUE MANDA (lo que cuesta cada persona apuntada) sale del montón
 *     y se queda sola en una tarjeta oscura, con el gasto diario dibujado
 *     dentro y la previsión como barra de avance. Esa tarjeta contesta
 *     «¿vamos bien?» sin leer una palabra.
 *   · LO QUE ESPERAMOS deja de ser un párrafo y pasa a ser esa barra.
 *   · LOS GRÁFICOS van de dos en dos, no uno debajo de otro. La pantalla
 *     entera cabe en dos pantallazos en vez de en seis.
 *
 * El texto no se ha perdido: lo que explica qué mirar en cada gráfico sigue
 * debajo de cada título, que es donde sirve.
 *
 * ---------------------------------------------------------------------------
 * TODO SALE DE `campana`, Y ESO ES UNA DECISIÓN, NO UNA LIMITACIÓN
 * ---------------------------------------------------------------------------
 * Los apuntados podrían leerse de `leads`, que es donde están de verdad. No se
 * hace, por dos motivos:
 *
 *   1. Esta pantalla la abren varias personas. Iris ve `leads`; quien lleva un
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
 * · NO se pinta un aviso rojo cuando hay clics y cero apuntados. Gerson, el 21
 *   de octubre: «no quiero que muestres esto, esto me lo dices a mí; los
 *   problemas aquí en el chat». Esta pantalla la abre gente que no puede
 *   arreglar la campaña, y una alarma sobre un trabajo ajeno sólo consigue que
 *   dejen de abrirla. El aviso sigue vivo donde sirve: el informe diario de
 *   quien lleva la publicidad.
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

/**
 * EL GASTO DIARIO, DIBUJADO PEQUEÑO Y DENTRO DE LA TARJETA OSCURA.
 *
 * Va a mano y no con el componente `Linea` de la casa por una razón concreta:
 * `Linea` lleva sus ejes, sus etiquetas y sus colores de tarjeta clara, y aquí
 * nada de eso cabe ni se vería. Lo que hace falta es la FORMA de la curva —si
 * el gasto va liso o si un día se disparó— y eso son cuatro líneas de SVG.
 *
 * `preserveAspectRatio="none"` es lo que deja que se estire a lo ancho de la
 * tarjeta sin deformar el grosor del trazo, porque `vector-effect` mantiene el
 * trazo en píxeles de pantalla y no en unidades del dibujo.
 */
function Chispa({ datos, color }: { datos: number[]; color: string }) {
  if (datos.length < 2) return null;
  const alto = 40;
  const ancho = 100;
  const max = Math.max(...datos, 0.01);
  const paso = ancho / (datos.length - 1);
  const punto = (v: number, i: number) => `${(i * paso).toFixed(2)},${(alto - (v / max) * alto).toFixed(2)}`;
  const linea = datos.map(punto).join(" ");
  const area = `0,${alto} ${linea} ${ancho},${alto}`;
  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={css("width:100%;height:40px;display:block;overflow:visible;")}
    >
      <polygon points={area} fill={color} opacity="0.16" />
      <polyline
        points={linea}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
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
    <section style={css(tarjeta + "display:flex;flex-direction:column;")}>
      <h2 style={css(CABECERA + "margin:0;font-size:var(--t-head);")}>{titulo}</h2>
      {/* APOYO y no NOTA: `--text-4` es el gris de los pies de foto, y esta
          frase no es un pie — es la que dice qué hay que mirar en el
          gráfico de debajo. Si no se lee, el gráfico no se entiende. */}
      <p style={css(APOYO + "margin:6px 0 var(--s4);max-width:62ch;")}>{dice}</p>
      {hijo}
    </section>
  );

  /** Una cifra pequeña de las de la derecha. Tres líneas y nada más. */
  const ficha = (que: string, valor: string, pie: string) => (
    <div style={css(tarjeta + "padding:var(--pad-card-sm);display:flex;flex-direction:column;justify-content:center;")}>
      <div style={css(NOTA + "color:var(--text-3);")}>{que}</div>
      <div
        style={css(
          "font-family:var(--font-display);font-size:clamp(22px,2.4vw,30px);font-weight:650;" +
            "line-height:1.05;margin-top:6px;font-variant-numeric:tabular-nums;letter-spacing:-.03em;color:var(--text);",
        )}
      >
        {valor}
      </div>
      <div style={css(NOTA + "margin-top:4px;line-height:1.4;color:var(--text-3);")}>{pie}</div>
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
  /* Cuánto del camino llevamos hecho hacia el techo de la previsión. Se mide
     contra el MÁXIMO y no contra el mínimo: una barra que se llena enseguida
     porque el listón estaba bajo no dice nada. */
  const avance = t.prevision && t.prevision.max > 0 ? Math.min(1, t.apuntadosDePago / t.prevision.max) : 0;

  return (
    <>
      {/* ------------------------------------------------------------- el plan */}
      {/* VA EL PRIMERO, Y ESO ES LA MITAD DE LO QUE HACE.
          Un panel que empieza con «llevamos gastado 4,92 €» obliga a quien lo
          abre a adivinar si eso es mucho o poco, pronto o tarde, bien o mal.
          Empezando por «esta semana se recogen datos», el gasto que viene
          debajo ya significa algo.
          Lo que cambió el 22 de octubre es el TAMAÑO: era una pantalla de
          prosa y ahora es una banda de dos columnas que se lee de un vistazo
          sin dejar de decir lo mismo. */}
      {t.plan && (
        <section
          style={css(
            tarjeta +
              "background:var(--bloque);color:var(--sobre-bloque);border-color:var(--bloque-borde);" +
              "box-shadow:var(--shadow-lg);padding:var(--pad-card);",
          )}
        >
          <div style={css("display:flex;align-items:baseline;justify-content:space-between;gap:var(--s3);flex-wrap:wrap;")}>
            <div style={css("display:flex;align-items:center;gap:10px;")}>
              <i style={css("width:7px;height:7px;border-radius:50%;flex:none;background:var(--oro-luz);")} />
              <span
                style={css(
                  "font-family:var(--font-display);font-size:var(--t-head);font-weight:620;" +
                    "letter-spacing:-.02em;line-height:1.2;color:inherit;",
                )}
              >
                {t.plan.fase}
              </span>
            </div>
            <span style={css(NOTA + "color:var(--sobre-bloque-2);")}>
              Del {corto(t.desde)} al {corto(t.hasta)}
            </span>
          </div>

          <div
            style={css(
              "display:grid;gap:var(--s3) var(--s4);margin-top:var(--s3);padding-top:var(--s3);" +
                "border-top:1px solid var(--bloque-borde);" +
                "grid-template-columns:repeat(auto-fit,minmax(250px,1fr));align-items:start;",
            )}
          >
            <div>
              <div style={css(NOTA + "color:var(--sobre-bloque-2);margin-bottom:5px;")}>Qué se hace estos días</div>
              <p style={css("margin:0;font-size:var(--t-body);line-height:1.55;color:inherit;text-wrap:pretty;")}>
                {t.plan.semana}
              </p>
            </div>
            <div>
              <div style={css(NOTA + "color:var(--sobre-bloque-2);margin-bottom:5px;")}>Qué toca después</div>
              <p style={css("margin:0;font-size:var(--t-body);line-height:1.55;color:inherit;text-wrap:pretty;")}>
                {t.plan.despues}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------- la cabeza del panel */}
      {/* La cifra que manda, sola y oscura, con el gasto diario dibujado dentro
          y la previsión como barra. A la derecha, las cuatro de apoyo en
          rejilla. Contesta «¿vamos bien?» sin leer una palabra. */}
      <div data-gasto-cabeza="">
        <section
          style={css(
            tarjeta +
              "background:var(--bloque);color:var(--sobre-bloque);border-color:var(--bloque-borde);" +
              "box-shadow:var(--shadow-lg);display:flex;flex-direction:column;gap:var(--s3);",
          )}
        >
          <div style={css(NOTA + "color:var(--sobre-bloque-2);")}>Cuesta cada persona apuntada</div>
          <div style={css("display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;")}>
            <span
              style={css(
                "font-family:var(--font-display);font-size:clamp(40px,5.4vw,64px);font-weight:650;" +
                  "line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.04em;color:inherit;",
              )}
            >
              {t.apuntadosDePago > 0 ? euros(t.porApuntado) : "—"}
            </span>
            <span style={css(NOTA + "color:var(--sobre-bloque-2);")}>
              {t.apuntadosDePago > 0
                ? `${miles(t.apuntadosDePago)} personas de la campaña`
                : "todavía no se ha apuntado nadie"}
            </span>
          </div>

          <Chispa datos={d.porDia.map((x) => x.valor)} color="var(--oro-luz)" />

          {t.prevision && (
            <div style={css("margin-top:auto;padding-top:var(--s3);border-top:1px solid var(--bloque-borde);")}>
              <div style={css("display:flex;align-items:baseline;justify-content:space-between;gap:var(--s2);")}>
                <span style={css(NOTA + "color:var(--sobre-bloque-2);")}>Se esperan antes de la masterclass</span>
                <span style={css("font-size:var(--t-body);font-weight:500;color:inherit;font-variant-numeric:tabular-nums;")}>
                  {miles(t.apuntadosDePago)} de {miles(t.prevision.min)}–{miles(t.prevision.max)}
                </span>
              </div>
              {/* La barra se dibuja con `role="img"` y su etiqueta, para que
                  quien use lector de pantalla reciba la misma frase que quien
                  la ve. Un div de color sin nombre no dice nada. */}
              <div
                role="img"
                aria-label={`Van ${miles(t.apuntadosDePago)} personas apuntadas de las ${miles(t.prevision.max)} que se esperan como mucho.`}
                style={css(
                  "margin-top:8px;height:6px;border-radius:999px;overflow:hidden;background:var(--bloque-2);",
                )}
              >
                <div style={css(`width:${(avance * 100).toFixed(1)}%;height:100%;background:var(--oro-luz);border-radius:999px;`)} />
              </div>
              <p style={css(NOTA + "color:var(--sobre-bloque-2);margin:8px 0 0;line-height:1.45;")}>
                Es una previsión y no una promesa: se ajusta cada día con los números reales.
              </p>
            </div>
          )}
        </section>

        <div data-gasto-fichas="">
          {ficha("Llevamos gastado", euros(t.gasto), `Desde el ${corto(t.desde)}`)}
          {ficha("Han hecho clic", miles(t.clics), `A ${euros(t.porClic)} cada clic`)}
          {ficha("Personas distintas", miles(t.alcance), "El mejor día, no la suma")}
          {ficha(
            "Llegan y se apuntan",
            llegaron > 0 ? `${dec(t.convierte)} %` : "—",
            llegaron > 0 ? `de ${miles(llegaron)} que llegan` : "sin visitas todavía",
          )}
        </div>
      </div>

      {/* ------------------------------------------------- los gráficos, por pares */}
      <div data-gasto-par="">
        {bloque(
          "El recorrido, de los euros a las personas",
          "Dónde se pierde gente. Entre «lo ven» y «hacen clic» manda el anuncio; entre «hacen clic» y «llegan» manda lo rápido que cargue la web; entre «llegan» y «se apuntan» manda la página de la masterclass.",
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

        {d.anuncios.length > 0
          ? bloque(
              "En qué anuncio se va el dinero",
              "Meta reparte sola el presupuesto hacia lo que funciona. Lo que hay que mirar no es quién gasta más, sino a cuánto le sale el clic: gastar mucho con el clic barato es exactamente lo que queremos.",
              <Barras datos={d.anuncios} />,
            )
          : bloque(
              "En qué anuncio se va el dinero",
              "Saldrá en cuanto el proceso diario escriba el reparto por anuncio.",
              <p style={css(NOTA + "margin:0;")}>Todavía no hay reparto guardado.</p>,
            )}
      </div>

      <div data-gasto-par="">
        {bloque(
          "Cuánto se gasta cada día",
          "Para ver si algún día se disparó el gasto sin que nadie lo tocara.",
          <Linea datos={d.porDia} />,
        )}

        {d.vid.empiezan > 0
          ? bloque(
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
            )
          : bloque(
              "Hasta dónde aguantan el vídeo",
              "Saldrá en cuanto corran anuncios de vídeo y el proceso diario guarde las cifras.",
              <p style={css(NOTA + "margin:0;")}>Todavía no hay datos de vídeo.</p>,
            )}
      </div>

      {t.frecuencia >= 2.5 && (
        <section style={css(tarjeta + "max-width:70ch;")}>
          <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>El público se está quemando</h2>
          <p style={css(LECTURA + "margin:0;")}>
            A la misma persona ya le ha salido el anuncio {dec(t.frecuencia)} veces de media. Por encima de dos veces y
            media la gente deja de verlo y el coste sube solo. Toca ampliar el público o cambiar la pieza.
          </p>
        </section>
      )}

      <p style={css(NOTA + "margin:0;max-width:78ch;line-height:1.5;")}>
        Los números de Meta se escriben una vez al día, así que pueden ir hasta un día por detrás. El coste por apuntado
        no lo sabe Meta: sale de cruzar lo que se gastó con la gente que de verdad dejó su correo. «Personas distintas»
        es el mejor día y no la suma de todos, porque sumarlos contaría varias veces a la misma persona.
      </p>
    </>
  );
}
