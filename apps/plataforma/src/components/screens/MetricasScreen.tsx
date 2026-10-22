"use client";

/**
 * ============================================================================
 * MÉTRICAS — EL CUADRO DE MANDO DE LA ESCUELA
 * ============================================================================
 *
 * Sólo lo ve Iris. Sirve para una cosa y hay que repetirla porque es fácil
 * perderla de vista: DECIDIR. Dónde anuncia, qué curso repite, qué lección
 * rehace. Todo número que no ayude a decidir ninguna de esas cosas sobra, por
 * interesante que sea.
 *
 * De ahí el orden de la pantalla, que no es casual:
 *
 *   1. CUATRO NÚMEROS GRANDES, lo que se mira de reojo cada mañana.
 *   2. CUÁNTA GENTE ENTRA, para ver si lo de la semana pasada funcionó.
 *   3. DE DÓNDE ENTRAN, que es lo que Gerson pidió por su nombre: saber el
 *      sitio. Decide en qué idioma se escribe y a qué hora se publica.
 *   4. DÓNDE SE CAE LA GENTE DENTRO DEL CURSO. El más incómodo y el más útil:
 *      señala la lección concreta que hay que rehacer.
 *
 * LO QUE NO HAY, y es tan importante como lo que hay:
 *
 *   · NADA DE «USUARIOS ACTIVOS MENSUALES» ni medidas de ésas. Suenan a
 *     empresa grande y no se puede hacer nada con ellas.
 *   · NI UN SOLO GRÁFICO DE QUESO. Comparar trozos de tarta es comparar
 *     ángulos, que es justo lo que el ojo hace peor. Barras.
 *   · NINGÚN GRÁFICO CON DOS EJES. Ver más abajo, en `Grafico.tsx`.
 *
 * TODO LO QUE SE ENSEÑA SALE DE LO QUE YA SE GUARDA, SIN UNA SOLA CIFRA
 * APARTE. Las visitas vienen de `visitas`, el avance de `avance`, los cursos
 * de `cursos` y la gente de `usuarios`. No hay ninguna tabla de estadísticas
 * que pueda discrepar de la realidad: si no cuadra, es que la realidad es ésa.
 *
 * Y LO QUE FALTA SE DICE, NO SE INVENTA. De dónde entra la gente y por qué
 * puerta llegó NO se puede saber con lo que hay guardado: eso lo sabe el
 * servidor en el momento de la visita y nadie lo está apuntando. Antes había
 * ahí unos números de ejemplo preciosos; ahora hay un cartel explicando qué
 * hace falta para tenerlos de verdad. Un hueco honrado vale más que un dato
 * inventado que alguien va a usar para decidir dónde anuncia.
 *
 * LA LEY, PARA CUANDO SE MONTE: la ubicación se guarda por país y ciudad,
 * NUNCA la dirección de internet entera, que en Europa es un dato personal. Y
 * se escribe en la política de privacidad antes de encender nada.
 */

import { useCallback, useEffect, useState } from "react";
import { css } from "@/lib/css";
import { BOTON_NORMAL, CABECERA, LECTURA, NOTA, PANTALLA } from "@/lib/ui";
import { Barras, Columnas, Linea, type Barra, type Punto } from "../escuela/Grafico";
import { citas as repoCitas, clientes as repoClientes, euros, facturas as repoFacturas, totales, type Cita, type Cliente, type Factura } from "@/lib/despacho";
import { fuenteDe } from "@/lib/despacho/fuentes";
import Banda from "../Banda";
import { listaUsuarios } from "@/lib/despacho/usuarios";
import { rolesDe } from "@/lib/roles";
import { useSesion } from "@/lib/sesion";
import { cursos as repoCursos, todosLosAvances, totalLecciones, type Avance, type Curso } from "@/lib/escuela";
import { porDia, todasLasVisitas } from "@/lib/escuela/trofeos";
import { ultimosLeads, type Lead } from "@/lib/despacho/leads";
import Embudo from "../metricas/Embudo";
import Gasto from "../metricas/Gasto";
import { ultimosDias, type DiaCampana } from "@/lib/despacho/campana";

type Datos = {
  dias: Punto[];
  alumnos: number;
  miembros: number;
  lecciones: number;
  /** De cada cien que empiezan un curso, cuántos lo acaban. */
  acaban: number;
  /** Por dónde se cae la gente, lección a lección. */
  caida: Array<{ etiqueta: string; valor: number }>;
  /** Los apuntados de la web, crudos. La cuenta de la campaña se hace en
   *  `Embudo`, que es quien los pinta: así los dos viven juntos y no hay que
   *  mirar dos archivos para entender un número. */
  leads: Lead[];
  /** Lo que ha costado la publicidad, un documento por día. Lo escribe un
   *  proceso de fuera; aquí sólo se lee. Vacío mientras no haya corrido. */
  campana: DiaCampana[];
  /* Lo del despacho, desde el 20 de octubre de 2026. Gerson: «que me
     muestre realmente bien los datos que necesito ver». Lo que necesita ver
     quien vive de esto es cuánta gente nueva llega, cuántas sesiones da y
     cuánto factura; la escuela va después. */
  nuevas30: number;
  sesiones30: number;
  facturado30: number;
  porMes: Barra[];
  /* Los mismos, de los 30 días anteriores: un número sin con qué compararlo
     no dice si vas bien o mal. */
  nuevasAntes: number;
  sesionesAntes: number;
  facturadoAntes: number;
  clientas30: number;
  clientasAntes: number;
  fuentes: Barra[];
};

export default function MetricasScreen() {
  const { puede } = useSesion();
  const [d, setD] = useState<Datos | null>(null);
  const [roto, setRoto] = useState(false);
  const [tabla, setTabla] = useState(false);

  const carga = useCallback(async () => {
    setRoto(false);
    try {
      /* Los leads van en el mismo `Promise.all` y no en una llamada aparte:
         son cinco lecturas que no dependen unas de otras, y encadenarlas
         multiplicaría por cinco lo que tarda en abrirse la pantalla. */
      const [gente, cursos, avances, visitas, leads, citas, facturas, clientes, campana] = await Promise.all([
        listaUsuarios(),
        repoCursos.listar(),
        todosLosAvances(),
        todasLasVisitas(),
        ultimosLeads(500),
        repoCitas.listar(),
        repoFacturas.listar(),
        repoClientes.listar(),
        /* Lo de la campaña entra en el mismo paquete que lo demás. Y no puede
           tumbar la pantalla: `ultimosDias` devuelve lista vacía si no hay
           permiso o no hay nube, en vez de lanzar. Las métricas de la escuela
           tienen que verse aunque lo de la publicidad falle. */
        ultimosDias(60),
      ]);
      setD({
        ...calcula(gente, cursos, avances, visitas, leads),
        ...despacho(leads, citas, facturas, clientes),
        campana,
      });
    } catch {
      setRoto(true);
    }
  }, []);

  useEffect(() => {
    void carga();
  }, [carga]);

  const tarjeta =
    "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
    "box-shadow:var(--nm);padding:var(--s4);";

  const bloque = (titulo: string, dice: string, hijo: React.ReactNode) => (
    <section style={css(tarjeta)}>
      <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;line-height:1.2;color:var(--text);")}>{titulo}</h2>
      {/* Debajo del título, PARA QUÉ SIRVE. Un cuadro de mando sin esta línea
          obliga a deducir qué hacer con cada dibujo, y lo que se deduce cambia
          según el día que se tenga. */}
      <p style={css(NOTA + "margin:6px 0 var(--s4);max-width:62ch;line-height:1.5;")}>{dice}</p>
      {hijo}
    </section>
  );

  /* Una escuela sin alumnos pero con leads entrando NO está vacía: es
     exactamente el momento de la campaña, y es cuando más falta hace mirar
     esta pantalla. Antes se tapaba entera con el cartel de «nada que medir». */
  const vacio =
    d && d.dias.every((x) => x.valor === 0) && d.lecciones === 0 && d.leads.length === 0 && d.sesiones30 === 0 && d.facturado30 === 0;

  /*
   * REHECHA EL 20 DE OCTUBRE DE 2026. Gerson: «nada de lo que está ahí me
   * gusta; arregla y ajusta bien su comunicación».
   *
   * Lo que fallaba no era el dato, era cómo se decía: rótulos sueltos
   * («Lecciones terminadas», «Acaban el curso») sin decir si eso era bueno o
   * malo, y la campaña arriba del todo con su jerga. Ahora cada cifra es una
   * PREGUNTA que Iris se haría, con su respuesta en grande y, debajo, si va
   * mejor o peor que el mes anterior. Primero el negocio, después la escuela,
   * y los anuncios al final para quien quiera mirar de cerca.
   */
  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--gap);")}>
      <Banda
        foto="/escuela/banda-cursos.jpg"
        encuadre="50% 60%"
        titulo="Métricas"
        sub="Cómo va tu negocio y tu escuela en los últimos 30 días, comparado con los 30 anteriores."
        accion={
          d && !vacio ? (
            <button
              onClick={() => setTabla((x) => !x)}
              style={css(BOTON_NORMAL + "background:transparent;color:var(--sobre-bloque);border-color:var(--bloque-borde);")}
            >
              {tabla ? "Ver los gráficos" : "Ver en tabla"}
            </button>
          ) : undefined
        }
      />

      {d === null && !roto && <p style={css(NOTA + "margin:0;")}>Cargando…</p>}

      {roto && (
        <p style={css(NOTA + "margin:0;")}>
          No se han podido leer las métricas. Mira la conexión y vuelve a entrar.
        </p>
      )}

      {vacio && (
        <div style={css(tarjeta + "max-width:620px;")}>
          <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Todavía no hay nada que medir</h2>
          <p style={css(LECTURA + "margin:0;")}>
            Esto se llena solo con lo que pasa: la gente que te escribe, las sesiones que das, lo que cobras y lo que
            hacen tus alumnos. En cuanto entre la primera persona, empieza a contar.
          </p>
        </div>
      )}

      {d && !vacio && !tabla && (
        <>
          {/* ------------------------------------------------- tu negocio */}
          <h2 style={css(SECCION)}>Tu negocio</h2>
          <div data-kpis="">
            <Kpi pregunta="¿Cuánta gente nueva te ha escrito?" valor={`${d.nuevas30}`} ahora={d.nuevas30} antes={d.nuevasAntes} que="personas nuevas desde la web" nada="nadie" />
            <Kpi pregunta="¿Cuántas clientas nuevas tienes?" valor={`${d.clientas30}`} ahora={d.clientas30} antes={d.clientasAntes} que="fichas nuevas en Personas" />
            <Kpi pregunta="¿Cuántas sesiones has dado?" valor={`${d.sesiones30}`} ahora={d.sesiones30} antes={d.sesionesAntes} que="apuntadas en la agenda, sin las anuladas" />
            <Kpi pregunta="¿Cuánto has facturado?" valor={euros(d.facturado30)} ahora={d.facturado30} antes={d.facturadoAntes} que="facturas emitidas, con IVA" oscura nada="0 €" />
          </div>

          <div data-metricas-rejilla="">
            {bloque(
              "¿De dónde llega la gente?",
              "Qué llevó a cada persona nueva a tu web: un anuncio, Instagram, Google o fue directa. Lo que más trae es donde merece la pena poner más.",
              d.fuentes.length ? <Barras datos={d.fuentes} /> : <p style={css(NOTA + "margin:0;")}>En estos 30 días no ha entrado nadie nuevo por la web.</p>
            )}
            {bloque(
              "¿Cuánto has facturado cada mes?",
              "Los últimos seis meses, para ver si el negocio sube, baja o se mantiene.",
              d.porMes.some((x) => x.valor > 0) ? <Columnas datos={d.porMes} sufijo=" €" /> : <p style={css(NOTA + "margin:0;")}>Todavía no hay facturas emitidas.</p>
            )}
          </div>

          {/* ------------------------------------------------- tu escuela */}
          <h2 style={css(SECCION)}>Tu escuela</h2>
          <section data-metricas-cabecera="" style={css(tarjeta + "padding:var(--pad-card);")}>
            <dl style={css("margin:0;display:flex;flex-wrap:wrap;gap:clamp(20px,3.4vw,52px);align-items:flex-end;")}>
              {[
                [`${d.alumnos}`, "Alumnos", "con algún curso"],
                [`${d.miembros}`, "Miembros", "en la comunidad"],
                [`${d.lecciones}`, "Lecciones vistas", "entre todos"],
              ].map(([n, que, mas]) => (
                <div key={que} style={css("display:flex;flex-direction:column;gap:4px;")}>
                  <dd style={css("margin:0;font-weight:300;font-size:clamp(36px,4.2vw,56px);letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums;color:var(--text);")}>{n}</dd>
                  <dt style={css("font-size:var(--t-body);color:var(--text);")}>{que}</dt>
                  <span style={css(NOTA)}>{mas}</span>
                </div>
              ))}
            </dl>
            <Medidor valor={d.acaban} que="de los que empiezan, acaban" />
          </section>

          <div data-metricas-rejilla="">
            {bloque(
              "¿Cuánta gente entra a la escuela?",
              "Personas distintas que abrieron la plataforma cada día. Si publicas algo y esta línea sube, funcionó.",
              <Linea datos={d.dias} />
            )}
            {d.caida.length > 0
              ? bloque(
                  "¿En qué lección se va la gente?",
                  "De cada cien que empiezan tu curso con más alumnos, cuántos llegan a cada lección. Donde la barra cae de golpe está la lección que hay que mirar.",
                  <Barras datos={d.caida} sufijo=" %" />
                )
              : bloque(
                  "¿En qué lección se va la gente?",
                  "Saldrá en cuanto alguien empiece un curso: verás en qué lección se para la gente.",
                  <p style={css(NOTA + "margin:0;")}>Todavía nadie ha empezado ningún curso.</p>
                )}
          </div>

          {/* ------------------------------------------------- tus anuncios */}
          <h2 style={css(SECCION)}>Tus anuncios, de cerca</h2>
          <Embudo leads={d.leads} tarjeta={tarjeta} />

          {/* --------------------------------------- lo que cuesta el dinero */}
          {/* Va DESPUÉS del embudo a propósito: el embudo dice cuánta gente
              trae cada anuncio, y esto dice cuánto costó. En ese orden la
              división —euros entre personas— se hace sola al leer. */}
          {/* Detrás de la misma llave que en la pantalla del creador, aunque
              aquí la tenga siempre quien entra. Preguntar por la capacidad y
              no dar por hecho el rol es lo que hace que el día que se parta
              `admin` en dos no haya que acordarse de esta línea. */}
          {puede("campana") && (
            <>
              <h2 style={css(SECCION)}>Inversión publicitaria</h2>
              <Gasto dias={d.campana} tarjeta={tarjeta} />
            </>
          )}
        </>
      )}

      {d && !vacio && tabla && (
        <section style={css(tarjeta)}>
          <h2 style={css(CABECERA + "margin:0 0 var(--s3);font-size:var(--t-head);")}>En tabla</h2>
          <div style={css("overflow-x:auto;")}>
            <table style={css("width:100%;border-collapse:collapse;font-size:var(--t-body);")}>
              <caption style={css(NOTA + "text-align:left;margin-bottom:10px;")}>
                Últimos 30 días comparados con los 30 anteriores.
              </caption>
              <thead>
                <tr>
                  {["Qué", "Ahora", "Antes"].map((h, k) => (
                    <th key={h} scope="col" style={css("padding:8px 10px;border-bottom:1px solid var(--border);color:var(--text-3);font-weight:500;text-align:" + (k ? "right" : "left") + ";")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Gente nueva", `${d.nuevas30}`, `${d.nuevasAntes}`],
                  ["Clientas nuevas", `${d.clientas30}`, `${d.clientasAntes}`],
                  ["Sesiones", `${d.sesiones30}`, `${d.sesionesAntes}`],
                  ["Facturado", euros(d.facturado30), euros(d.facturadoAntes)],
                ].map(([q, a, b]) => (
                  <tr key={q}>
                    <td style={css("padding:8px 10px;border-bottom:1px solid var(--border);")}>{q}</td>
                    <td style={css("padding:8px 10px;border-bottom:1px solid var(--border);text-align:right;font-variant-numeric:tabular-nums;")}>{a}</td>
                    <td style={css("padding:8px 10px;border-bottom:1px solid var(--border);text-align:right;font-variant-numeric:tabular-nums;color:var(--text-3);")}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

/** El rótulo de cada parte de la pantalla. */
const SECCION = "margin:var(--s3) 0 0;font-size:var(--t-head);font-weight:500;letter-spacing:-.025em;color:var(--text);";

/**
 * UNA CIFRA CON SU PREGUNTA Y SU COMPARACIÓN.
 *
 * La flecha compara con los 30 días anteriores y nada más: no hay objetivos
 * inventados ni «buen ritmo». Si antes había cero, no se calcula un tanto por
 * ciento —de cero a uno no es «un 100 % más», es «antes, ninguna»—.
 */
function Kpi({
  pregunta,
  valor,
  ahora,
  antes,
  que,
  oscura,
  nada = "ninguna",
}: {
  pregunta: string;
  valor: string;
  ahora: number;
  antes: number;
  que: string;
  oscura?: boolean;
  /** Cómo se dice «cero» para esta cifra: «ninguna», «0 €». */
  nada?: string;
}) {
  const sube = ahora > antes;
  const igual = ahora === antes;
  const cambio = antes === 0 ? (ahora === 0 ? "Igual que el mes anterior" : `El mes anterior: ${nada}`) : `${sube ? "+" : ""}${Math.round(((ahora - antes) / antes) * 100)} % que el mes anterior`;
  return (
    <section
      style={css(
        "border-radius:var(--r-tarjeta);padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:10px;min-width:0;" +
          (oscura
            ? "background:var(--bloque);color:var(--sobre-bloque);border:1px solid var(--bloque-borde);box-shadow:var(--shadow-lg);"
            : "background:var(--surface);border:1px solid var(--border);box-shadow:var(--nm-alto);")
      )}
    >
      <h3 style={css("margin:0;font-size:var(--t-body);font-weight:500;line-height:1.35;color:" + (oscura ? "var(--sobre-bloque)" : "var(--text)") + ";")}>{pregunta}</h3>
      <div style={css("font-weight:300;font-size:clamp(38px,3.8vw,52px);letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap;")}>{valor}</div>
      <div style={css("font-size:var(--t-mini);color:" + (oscura ? "var(--sobre-bloque-2)" : "var(--text-3)") + ";")}>{que}</div>
      <div
        style={css(
          "align-self:flex-start;font-size:var(--t-mini);font-weight:500;padding:4px 10px;border-radius:var(--r-pill);" +
            (igual || antes === 0
              ? oscura
                ? "background:var(--bloque-2);color:var(--sobre-bloque-2);"
                : "background:var(--surface-2);color:var(--text-3);"
              : sube
                ? "background:var(--lima);color:var(--lima-tx);"
                : "background:var(--melocoton);color:var(--melocoton-tx);")
        )}
      >
        {!igual && antes !== 0 && (sube ? "↑ " : "↓ ")}
        {cambio}
      </div>
    </section>
  );
}

/**
 * EL MEDIDOR: media rueda que se llena. Es el de la referencia, y sirve aquí
 * para lo único que es una proporción de verdad —de cada cien que empiezan
 * un curso, cuántos lo acaban—. Las demás cifras son cantidades y un medidor
 * no tendría techo que marcar.
 */
function Medidor({ valor, que }: { valor: number; que: string }) {
  const R = 78;
  const largo = Math.PI * R;
  const v = Math.max(0, Math.min(100, valor));
  return (
    <figure style={css("margin:0;position:relative;width:200px;flex:none;text-align:center;")}>
      <svg width="200" height="116" viewBox="0 0 200 116" aria-hidden="true">
        <path d={`M ${100 - R} 100 A ${R} ${R} 0 0 1 ${100 + R} 100`} fill="none" stroke="var(--surface-2)" strokeWidth="14" strokeLinecap="round" />
        {v > 0 && (
          <path
            d={`M ${100 - R} 100 A ${R} ${R} 0 0 1 ${100 + R} 100`}
            fill="none"
            stroke="var(--oro)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${(largo * v) / 100} ${largo}`}
          />
        )}
      </svg>
      <figcaption style={css("position:absolute;left:0;right:0;top:46px;")}>
        <div style={css("font-weight:300;font-size:34px;letter-spacing:-.03em;line-height:1;color:var(--text);")}>{v} %</div>
        <div style={css(NOTA + "margin-top:6px;")}>{que}</div>
      </figcaption>
    </figure>
  );
}

/** Lo del despacho en los últimos 30 días, y lo facturado de seis meses. */
function despacho(leads: Lead[], citas: Cita[], facturas: Factura[], clientes: Cliente[]) {
  const ahora = Date.now();
  const DIA = 24 * 3600 * 1000;
  const hace30 = ahora - 30 * DIA;
  const hace60 = ahora - 60 * DIA;
  const entre = (t: number, desde: number, hasta: number) => t >= desde && t < hasta;
  /* Nuevas = la primera vez que aparecieron, no la última vez que volvieron. */
  const altaDe = (l: Lead) => (l.alta ?? l.visto)?.getTime() ?? 0;
  const nuevas30 = leads.filter((l) => entre(altaDe(l), hace30, ahora + 1)).length;
  const nuevasAntes = leads.filter((l) => entre(altaDe(l), hace60, hace30)).length;
  const sesion = (desde: number, hasta: number) =>
    citas.filter((c) => c.estado !== "anulada" && entre(new Date(c.inicioISO).getTime(), desde, hasta)).length;
  const sesiones30 = sesion(hace30, ahora + 1);
  const sesionesAntes = sesion(hace60, hace30);
  const emitidas = facturas.filter((f) => f.estado === "emitida");
  const dia = (t: number) => new Date(t).toISOString().slice(0, 10);
  const cobrado = (desde: number, hasta: number) =>
    emitidas.filter((f) => f.fecha >= dia(desde) && f.fecha < dia(hasta)).reduce((s, f) => s + totales(f).total, 0);
  const facturado30 = cobrado(hace30, ahora + DIA);
  const facturadoAntes = cobrado(hace60, hace30);
  const clientas30 = clientes.filter((c) => entre(new Date(c.creada).getTime(), hace30, ahora + 1)).length;
  const clientasAntes = clientes.filter((c) => entre(new Date(c.creada).getTime(), hace60, hace30)).length;
  const m = new Map<string, number>();
  for (const l of leads) if (entre(altaDe(l), hace30, ahora + 1)) m.set(fuenteDe(l), (m.get(fuenteDe(l)) ?? 0) + 1);
  const fuentes: Barra[] = [...m.entries()].sort((a, b) => b[1] - a[1]).map(([etiqueta, valor]) => ({ etiqueta, valor }));
  const hoy = new Date();
  const porMes: Barra[] = Array.from({ length: 6 }, (_, i) => {
    const m = new Date(hoy.getFullYear(), hoy.getMonth() - 5 + i, 1);
    const clave = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}`;
    return {
      etiqueta: m.toLocaleDateString("es", { month: "short" }),
      valor: Math.round(emitidas.filter((f) => f.fecha.startsWith(clave)).reduce((s, f) => s + totales(f).total, 0)),
    };
  });
  return { nuevas30, sesiones30, facturado30, porMes, nuevasAntes, sesionesAntes, facturadoAntes, clientas30, clientasAntes, fuentes };
}

function calcula(
  gente: Array<{ roles?: string[] }>,
  cursos: Curso[],
  avances: Avance[],
  visitas: Array<{ uid: string; dias: string[] }>,
  leads: Lead[]
/* `campana` queda fuera igual que lo del despacho: no se calcula aquí, se
   lee de su propia colección y se mete en el objeto al final. */
): Omit<Datos, keyof ReturnType<typeof despacho> | "campana"> {
  const rol = (r: string) => gente.filter((p) => rolesDe(p as never).includes(r as never)).length;

  /* Las lecciones hechas, contando SÓLO LAS QUE SIGUEN EXISTIENDO. Si Iris
     borra una lección que alguien terminó, su id se queda en el avance; sin
     este filtro el total subiría por encima de las lecciones que hay. */
  const vivas = new Set(cursos.flatMap((c) => c.modulos.flatMap((m) => m.lecciones.map((l) => l.id))));
  const lecciones = avances.reduce((n, a) => n + a.hechas.filter((id) => vivas.has(id)).length, 0);

  /* Cuántos de los que empezaron un curso lo acabaron. Se mira curso a curso y
     se promedia sobre los que TIENEN lecciones: un curso vacío daría una
     división entre cero, y un 100 % por no tener nada que hacer sería la
     métrica más halagadora y más falsa de la pantalla. */
  let empezados = 0;
  let acabados = 0;
  for (const c of cursos) {
    const total = totalLecciones(c);
    if (total === 0) continue;
    const suyos = avances.filter((a) => a.cursoId === c.id);
    for (const a of suyos) {
      const hechas = a.hechas.filter((id) => vivas.has(id)).length;
      if (hechas === 0) continue;
      empezados += 1;
      if (hechas >= total) acabados += 1;
    }
  }

  /* Dónde se cae la gente: del curso con más alumnos, cuántos llegan a cada
     lección. Se coge uno solo porque mezclar varios no señala ninguna lección
     concreta, y señalar la lección concreta es para lo que sirve el gráfico. */
  let caida: Array<{ etiqueta: string; valor: number }> = [];
  const conGente = cursos
    .map((c) => ({ c, n: avances.filter((a) => a.cursoId === c.id).length }))
    .sort((a, b) => b.n - a.n)[0];
  if (conGente && conGente.n > 0 && totalLecciones(conGente.c) > 0) {
    const suyos = avances.filter((a) => a.cursoId === conGente.c.id);
    const base = suyos.length;
    let i = 0;
    for (const m of conGente.c.modulos) {
      for (const l of m.lecciones) {
        i += 1;
        const cuantos = suyos.filter((a) => a.hechas.includes(l.id)).length;
        caida.push({
          etiqueta: `${i}. ${l.titulo || "Sin nombre"}`,
          valor: Math.round((cuantos / base) * 100),
        });
      }
    }
    caida = caida.slice(0, 12);
  }

  return {
    dias: porDia(visitas, 30),
    alumnos: rol("alumno"),
    miembros: rol("miembro"),
    lecciones,
    acaban: empezados === 0 ? 0 : Math.round((acabados / empezados) * 100),
    caida,
    leads,
  };
}
