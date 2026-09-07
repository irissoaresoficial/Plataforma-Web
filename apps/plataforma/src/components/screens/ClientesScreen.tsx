"use client";

/**
 * LOS CLIENTES, EN UN TABLERO
 *
 * QUÉ ERA ANTES Y POR QUÉ HA CAMBIADO DE FORMA.
 *
 * Era una lista con cuatro montones —«Todos», «Esta semana», «Pendiente»,
 * «Hace mucho»— y una ficha al lado. La inteligencia estaba bien: la lista ya
 * decía cómo iba cada relación en palabras. Lo que fallaba era la FORMA de
 * mirarla: en una lista sólo se ve un montón cada vez. Para saber cómo va el
 * despacho —cuántos vienen, cuántos se están enfriando, de cuántos falta algo—
 * había que pulsar los cuatro filtros de uno en uno y acordarse de los números.
 *
 * Un tablero enseña los cinco a la vez. Ésa es toda la diferencia, y es la que
 * convierte «buscar a alguien» en «ver cómo va la consulta».
 *
 * LAS COLUMNAS SE DEDUCEN, NO SE ELIGEN — Y POR ESO NO SE ARRASTRAN.
 *
 * En qué columna cae cada persona sale de lo que ya se sabe de ella: si tiene
 * sesión apuntada, cuánto hace de la última, si falta la nota, si hay una
 * factura a medias. Ver `lib/despacho/etapas.ts`, donde está escrito el porqué
 * de cada una.
 *
 * Eso significa que arrastrar una tarjeta de columna NO PUEDE GUARDAR NADA:
 * soltarla en «Los ves pronto» no le pone una sesión, y al recargar volvería a
 * su sitio. Un tablero donde arrastrar no guarda es un tablero que miente sobre
 * lo que es, así que aquí no se arrastra: cada tarjeta lleva a su ficha, y en
 * la ficha está el botón que sí cambia las cosas. Una columna que se calcula
 * sola nunca está desfasada, que es justo lo que le pasa a un tablero de
 * etiquetas que alguien tiene que mantener.
 *
 * EN PANTALLA ESTRECHA no hay cinco columnas: hay una, y las cinco etapas pasan
 * a ser pestañas con su cuenta. Es la misma información —el número de cada
 * columna se sigue viendo entero— en el único reparto que cabe en 390 px.
 *
 * No toca `localStorage`: pide las citas, las fichas y las facturas a los
 * repositorios de `lib/despacho`. El día que eso sea Firebase, este archivo no
 * cambia.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { NOTA, PAD, PAD_SM, PASTILLA, PASTILLA_ELEGIDA, RAYA, TARJETA, botonPrincipal, rotulo } from "@/lib/ui";
import { titulo as enTitulo } from "@/lib/format";
import {
  citas as repoCitas,
  clientes as repoClientes,
  facturas as repoFacturas,
  comoVaCorto,
  diaLargo,
  diaMinimo,
  diasEntre,
  etapaDe,
  loQueCuelga,
  nuevoId,
  relacionDe,
  ETAPAS,
  type ClaveEtapa,
  type Cita,
  type Cliente,
  type Factura,
  type Relacion,
} from "@/lib/despacho";
import { AvisoNavegador, Avatar, Cabecera, Vacio, useEstrecho } from "../despacho/Piezas";
import HojaLateral from "../despacho/HojaLateral";
import FichaCliente from "../despacho/FichaCliente";

/** Cómo se llama en pantalla de dónde salió cada persona. */
const ORIGENES: Record<string, string> = {
  "web-sinergia": "Llegó por la prueba gratis",
  "web-membresia": "Llegó por la lista de espera",
  "web-curso": "Llegó por un curso",
  "web-cita": "Pidió cita por la web",
  "web-chat": "Llegó por el chat de la web",
  plataforma: "Añadida desde la plataforma",
  "a-mano": "Apuntada a mano",
};

/** Cuántas caras caben arriba antes de que la tira deje de leerse de un
 *  vistazo. Las que no caben se dicen con un número, no se esconden. */
const CARAS_A_LA_VISTA = 12;

type ConRelacion = { c: Cliente; r: Relacion; etapa: ClaveEtapa };

export default function ClientesScreen() {
  const { clienteAbierto, setClienteAbierto } = useApp();

  const [lista, setLista] = useState<Cliente[]>([]);
  const [todasCitas, setTodasCitas] = useState<Cita[]>([]);
  const [todasFacturas, setTodasFacturas] = useState<Factura[]>([]);
  const [busca, setBusca] = useState("");
  const [cargando, setCargando] = useState(true);
  // Sube de número después de cada escritura y obliga a releer. Es la forma
  // barata de que el tablero y la ficha no se queden con lo de antes.
  const [refresco, setRefresco] = useState(0);
  // Qué columna ha elegido ella cuando sólo cabe una; `null` mientras no haya
  // pulsado ninguna. En ancho no se usa: allí se ven las cinco.
  const [columna, setColumna] = useState<ClaveEtapa | null>(null);

  const estrecho = useEstrecho(900);
  const quieto = useReducedMotion();

  /*
   * CUANDO LAS CINCO COLUMNAS NO CABEN, EL BORDE SE DESVANECE.
   *
   * En un portátil de 1280 la quinta columna se sale por la derecha. Cortada a
   * ras se lee como un fallo de maquetación —o peor: como que sólo hay cuatro
   * columnas—, y la barra de desplazamiento del tablero queda al pie, fuera de
   * la ventana. Desvanecido, el borde dice «esto sigue», que es lo mismo que
   * hace la lista de letras de la consulta cuando no cabe entera.
   *
   * Se apaga al llegar al final: un desvanecido permanente diría que sigue
   * habiendo algo cuando ya no queda nada.
   */
  const tablero = useRef<HTMLDivElement>(null);
  const [sobraTablero, setSobraTablero] = useState(false);
  useEffect(() => {
    const el = tablero.current;
    if (!el) return;
    const mide = () => setSobraTablero(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    mide();
    el.addEventListener("scroll", mide, { passive: true });
    window.addEventListener("resize", mide);
    return () => {
      el.removeEventListener("scroll", mide);
      window.removeEventListener("resize", mide);
    };
    // `lista` y no la gente ya repartida: se declara más arriba y dice lo mismo
    // —cuánta gente hay—, que es lo único que puede cambiar el ancho de esto.
  }, [estrecho, lista.length]);

  /* Leer el disco de este equipo es leer un sistema externo, que es para lo que
     está el efecto: no se puede pedir en el primer render porque el servidor no
     ve el almacenamiento de este equipo. */
  useEffect(() => {
    let vivo = true;
    // Las tres a la vez: sin las citas y las facturas no se puede saber en qué
    // columna va nadie, que es justo lo que esta pantalla ha venido a decir.
    Promise.all([repoClientes.buscar(busca), repoCitas.listar(), repoFacturas.listar()]).then(([c, ci, fa]) => {
      if (!vivo) return;
      setLista(c);
      setTodasCitas(ci);
      setTodasFacturas(fa);
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, [busca, refresco]);

  const recargar = useCallback(() => setRefresco((n) => n + 1), []);

  /** Cómo va cada persona y en qué columna cae, calculado una vez para todas. */
  const gente = useMemo<ConRelacion[]>(() => {
    const ahora = new Date();
    return lista.map((c) => {
      const r = relacionDe(c, todasCitas, todasFacturas, ahora);
      return { c, r, etapa: etapaDe(r) };
    });
  }, [lista, todasCitas, todasFacturas]);

  /** La gente de cada columna. El orden dentro de una columna es el alfabético
   *  que ya entrega el repositorio: una columna que se reordena sola obliga a
   *  volver a buscar con los ojos cada vez que se guarda algo. */
  const porEtapa = useMemo(() => {
    const m = {} as Record<ClaveEtapa, ConRelacion[]>;
    ETAPAS.forEach(({ k }) => (m[k] = []));
    gente.forEach((g) => m[g.etapa].push(g));
    return m;
  }, [gente]);

  /**
   * QUÉ COLUMNA SE VE CUANDO SÓLO CABE UNA.
   *
   * Mientras ella no haya pulsado ninguna pestaña, la decide la pantalla: «Te
   * falta cerrar algo», que es lo que más urge, y si ahí no hay nadie —que es
   * el estado bueno y el más frecuente— la primera columna que tenga gente.
   * Abrir en una columna vacía daría la impresión de que no hay nada.
   *
   * Se calcula al pintar y no en un efecto a propósito: no hay ningún sistema
   * externo con el que sincronizarse, sólo una elección que todavía no se ha
   * hecho. En cuanto ella pulsa una pestaña manda la suya, aunque esté vacía.
   */
  const columnaVisible: ClaveEtapa =
    columna ?? (porEtapa.cerrar?.length ? "cerrar" : ETAPAS.find((e) => porEtapa[e.k]?.length)?.k ?? "cerrar");

  /*
   * LA PESTAÑA QUE ESTÁ PUESTA TIENE QUE VERSE.
   *
   * Las cinco pestañas no caben en 390 px, así que la tira se desliza; y la que
   * sale elegida al abrir es la tercera o la cuarta, según dónde haya gente. Sin
   * esto, la pantalla abriría enseñando una columna cuya pestaña está fuera de
   * la vista: se ve el contenido y no se ve de qué es.
   *
   * `block: "nearest"` es lo que impide que además dé un salto vertical y se
   * lleve por delante la cabecera.
   */
  const pestanaViva = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (estrecho) pestanaViva.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [estrecho, columnaVisible]);

  /**
   * LA TIRA DE CARAS DE ARRIBA: a quién ves esta semana.
   *
   * Es la única fila de la pantalla ordenada por hora y no por nombre, a
   * propósito: contesta «¿quién viene y en qué orden?», que es la pregunta con
   * la que se abre el lunes por la mañana. Los siete días se cuentan desde hoy,
   * no de lunes a domingo: el jueves lo que importa no es lo que queda de esta
   * semana, es lo que viene por delante.
   */
  const estaSemana = useMemo(() => {
    const ahora = new Date();
    return gente
      .filter((g) => g.r.proxima && diasEntre(ahora, new Date(g.r.proxima.inicioISO)) <= 7)
      .sort((a, b) => (a.r.proxima?.inicioISO ?? "").localeCompare(b.r.proxima?.inicioISO ?? ""));
  }, [gente]);

  /* -------------------------------------------------------- la ficha abierta */

  const abierta = useMemo(() => gente.find((g) => g.c.id === clienteAbierto) ?? null, [gente, clienteAbierto]);

  const nueva = async () => {
    const c = await repoClientes.guardar({
      id: nuevoId(),
      nombre: "Sin nombre",
      email: "",
      origen: "plataforma",
      etiquetas: [],
      // Nadie ha aceptado nada todavía: no se inventa un consentimiento para
      // que el tipo cuadre. Ver `lib/despacho/tipos.ts`.
      consentimiento: null,
      notas: [],
      creada: new Date().toISOString(),
      actualizada: new Date().toISOString(),
    });
    setClienteAbierto(c.id);
    recargar();
  };

  const entrada = "width:100%;min-width:0;padding:11px 14px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);";

  /* ------------------------------------------------------------- la tarjeta */

  /**
   * Una persona, como se lee en el tablero: la cara, el nombre y dos datos.
   * El primero es cómo va la relación en palabras —«Jueves a las 18:00», «Hace
   * 4 meses»—, que es lo que convierte una lista de nombres en un CRM. El
   * segundo, si hay algo colgando, va en rojo y en dos palabras.
   */
  const tarjeta = (g: ConRelacion, i: number) => {
    const cuelga = loQueCuelga(g.r);
    const elegida = g.c.id === clienteAbierto;
    return (
      <motion.button
        key={g.c.id}
        initial={quieto ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={quieto ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
        /* Escalonada, pero con tope: en una columna de treinta, esperar
           metro y medio de retraso a la última haría que la pantalla
           tardara dos segundos en estar entera. Y corta —la casa no pasa de
           un tercio de segundo—, que es lo que la separa de una animación
           bonita de enseñar y molesta de usar. */
        transition={{ duration: 0.28, delay: Math.min(i, 7) * 0.03, ease: [0.16, 1, 0.3, 1] }}
        /* El levantarse al pasar por encima lo lleva framer y no el
           `[data-alza]` de la hoja de estilos, y no es un capricho: la tarjeta
           entra con una animación que deja su `transform` escrito en línea, y
           un `transform` en línea se come cualquier `:hover` del CSS. Con la
           regla de la hoja, el gesto sencillamente no ocurriría. */
        whileHover={quieto ? undefined : { y: -2 }}
        whileTap={quieto ? undefined : { scale: 0.99 }}
        onClick={() => setClienteAbierto(g.c.id)}
        style={css(
          /*
             UNA PASTILLA, NO UNA TARJETA. Esto era una tarjeta blanca levantada
             DENTRO de la tarjeta blanca de la columna, que es justo lo que la
             regla de la casa prohíbe. En claro se veían dos cantos y dos
             sombras discutiendo por el mismo borde; en oscuro era peor, porque
             la columna y la ficha son el mismo color y sólo las separaba una
             línea de un pelo: veinte fichas se leían como una mancha.

             Hundida sobre el fondo de su columna se distingue de un vistazo y
             además dice lo que es —algo que está dentro de esto— sin necesidad
             de competir con la tarjeta que la contiene.

             La de quien tiene la ficha abierta va en granate: la misma regla
             que la pestaña puesta en la columna de la plataforma y que el botón
             principal. Es lo que ata la hoja de la derecha con el sitio del
             tablero de donde salió. */
          (elegida ? PASTILLA_ELEGIDA : PASTILLA) +
            "display:flex;align-items:flex-start;gap:10px;width:100%;text-align:left;cursor:pointer;padding:11px 12px;"
        )}
      >
        <Avatar nombre={g.c.nombre} tamano={32} />
        <span style={css("min-width:0;flex:1;")}>
          <span style={css("display:block;font-size:var(--t-body);font-weight:590;line-height:1.3;color:var(--text);overflow-wrap:anywhere;")}>
            {enTitulo(g.c.nombre)}
          </span>
          <span style={css(NOTA + "display:block;margin-top:3px;line-height:1.4;")}>{comoVaCorto(g.r)}</span>
          {cuelga && (
            <span style={css(NOTA + "display:block;margin-top:2px;color:var(--red);")}>{cuelga}</span>
          )}
        </span>
      </motion.button>
    );
  };

  /* ------------------------------------------------------------- la columna */

  /*
   * LA CABEZA DE COLUMNA, SIN EL RENGLÓN DE INSTRUCCIONES.
   *
   * Debajo del título iba siempre `e.hacer` — «Tienen ficha y ninguna sesión.
   * Ponles la primera.»— y ocupaba dos o tres renglones. Por cinco columnas eso
   * son QUINCE líneas de instrucciones permanentes en la pantalla, más que todo
   * el contenido de las columnas juntas la mayoría de los días. Se leen el
   * primer día; a partir del segundo son la mancha gris que hay que saltarse
   * para llegar a los nombres, y enseñan a no leer el texto de esta pantalla.
   *
   * No se pierde: sigue estando donde de verdad hace falta —en la columna
   * VACÍA, que es la única que no se explica sola— y a un golpe de ratón en el
   * título, que es donde va a buscar quien no lo recuerde. Lo que se ha quitado
   * es que se lo cuente todos los días a quien ya lo sabe.
   */
  const cabezaColumna = (k: ClaveEtapa) => {
    const e = ETAPAS.find((x) => x.k === k)!;
    const n = porEtapa[k]?.length ?? 0;
    return (
      <>
        {/* La raya de color al canto de arriba, el rótulo del mismo color y la
            cuenta. El color marca de qué columna se trata; no rellena nada. */}
        <div aria-hidden="true" style={css(`height:2px;background:${e.color};border-radius:2px;margin-bottom:10px;`)} />
        <div title={e.hacer} style={css("display:flex;align-items:baseline;gap:var(--s2);")}>
          <span style={css(rotulo(e.color))}>{e.titulo}</span>
          <span data-cifras="" style={css(NOTA + "margin-left:auto;font-weight:600;color:var(--text-3);")}>
            {n}
          </span>
        </div>
      </>
    );
  };

  const cuerpoColumna = (k: ClaveEtapa) => {
    const dentro = porEtapa[k] ?? [];
    if (!dentro.length) {
      const e = ETAPAS.find((x) => x.k === k)!;
      return (
        <p style={css(NOTA + "margin:var(--s4) 0 0;line-height:1.5;color:var(--text-4);")}>
          {busca ? "Nadie con ese nombre en esta columna." : e.vacio}
        </p>
      );
    }
    return (
      <div style={css("display:flex;flex-direction:column;gap:8px;margin-top:var(--s3);")}>
        <AnimatePresence initial={false}>{dentro.map((g, i) => tarjeta(g, i))}</AnimatePresence>
      </div>
    );
  };

  /* ---------------------------------------------------------------- pintado */

  return (
    <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);min-width:0;")}>
      <Cabecera
        titulo="Clientes"
        pie="Se reparten solos según lo que tengas apuntado."
      />

      {/* ================================================== buscar y las caras */}
      <section style={css(TARJETA + PAD + "margin-bottom:var(--gap-lg);min-width:0;")}>
        <div style={css("display:flex;flex-wrap:wrap;gap:var(--s3);align-items:center;")}>
          {/* El buscador va lo primero: buscar a alguien mientras se habla por
              teléfono es lo más urgente que pasa en esta pantalla. */}
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nombre"
            aria-label="Buscar por nombre"
            style={css(entrada + "flex:1 1 240px;")}
          />
          {/* La única mancha de granate de la pantalla. En estrecho se estira
              hasta el borde de la tarjeta: debajo del buscador, un botón que
              acaba a dos tercios del ancho deja el canto derecho partido — y es
              la misma regla que en la agenda, donde el botón principal también
              ocupa su renglón entero cuando no cabe al lado de nada. */}
          <button onClick={() => void nueva()} style={css(botonPrincipal() + (estrecho ? "flex:1 1 100%;" : ""))}>
            Añadir una persona
          </button>
        </div>

        <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);")}>
          <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>A quién ves esta semana</div>
          {cargando ? (
            <Vacio>Un momento…</Vacio>
          ) : estaSemana.length === 0 ? (
            <Vacio>Nada apuntado esta semana.</Vacio>
          ) : (
            <div
              data-tira=""
              style={css("display:flex;gap:var(--s4);overflow-x:auto;padding-bottom:4px;scrollbar-width:none;overscroll-behavior-x:contain;")}
            >
              {estaSemana.slice(0, CARAS_A_LA_VISTA).map((g, i) => (
                <motion.button
                  key={g.c.id}
                  initial={quieto ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={quieto ? undefined : { y: -3 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.035, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => setClienteAbierto(g.c.id)}
                  title={`${g.c.nombre} · ${comoVaCorto(g.r)}`}
                  style={css(
                    "flex:none;width:74px;display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:none;padding:0;cursor:pointer;font-family:inherit;"
                  )}
                >
                  <Avatar nombre={g.c.nombre} tamano={42} />
                  <span
                    style={css(
                      "font-size:var(--t-micro);line-height:1.25;color:var(--text-2);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;"
                    )}
                  >
                    {g.c.nombre.split(/\s+/)[0]}
                  </span>
                  <span style={css("font-size:var(--t-micro);line-height:1.2;color:var(--text-4);text-align:center;")}>
                    {g.r.proxima ? diaMinimo(new Date(g.r.proxima.inicioISO)) : ""}
                  </span>
                </motion.button>
              ))}
              {estaSemana.length > CARAS_A_LA_VISTA && (
                <span style={css(NOTA + "flex:none;align-self:center;")}>y {estaSemana.length - CARAS_A_LA_VISTA} más</span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================= el tablero */}
      {!cargando && lista.length === 0 ? (
        <section style={css(TARJETA + PAD)}>
          <Vacio>
            {busca
              ? "Aquí no hay nadie con ese nombre. Pruébalo con menos letras."
              : "Todavía no hay nadie. Se llena solo al apuntar sesiones."}
          </Vacio>
        </section>
      ) : estrecho ? (
        /* -------------------------------------------- una columna cada vez */
        <div style={css("min-width:0;")}>
          {/* `="pagina"`: esta tira va suelta en la página, no dentro de una
              tarjeta, así que el margen de la página se lo pone la hoja de
              estilos para que no se corte a ras del borde del cristal. El
              porqué entero está en globals.css. */}
          <div
            data-tira="pagina"
            style={css("display:flex;gap:6px;overflow-x:auto;padding-bottom:var(--s3);scrollbar-width:none;overscroll-behavior-x:contain;")}
          >
            {ETAPAS.map((e) => {
              const on = columnaVisible === e.k;
              const n = porEtapa[e.k]?.length ?? 0;
              return (
                <button
                  key={e.k}
                  ref={on ? pestanaViva : undefined}
                  onClick={() => setColumna(e.k)}
                  aria-pressed={on}
                  style={css(
                    "flex:none;display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;cursor:pointer;font-size:var(--t-mini);font-weight:590;white-space:nowrap;" +
                      "border:1px solid " +
                      (on ? "var(--accion-borde)" : "var(--border-strong)") +
                      ";background:" +
                      (on ? "var(--accion-suave)" : "transparent") +
                      ";color:" +
                      (on ? "var(--accion)" : "var(--text-3)") +
                      ";"
                  )}
                >
                  {/* El punto del color de la columna: es lo que hace que la
                      pestaña y la columna se reconozcan como la misma cosa. */}
                  <span aria-hidden="true" style={css(`width:7px;height:7px;border-radius:50%;flex:none;background:${e.color};`)} />
                  {e.titulo}
                  {n > 0 && <span data-cifras="">{n}</span>}
                </button>
              );
            })}
          </div>

          <section style={css(TARJETA + PAD_SM + "min-width:0;")}>
            {cabezaColumna(columnaVisible)}
            {cuerpoColumna(columnaVisible)}
          </section>
        </div>
      ) : (
        /* ------------------------------------------------- las cinco columnas */
        <div
          ref={tablero}
          /* La barra de desplazamiento se VE, y aquí sí. En la tira de caras y
             en la de pestañas se esconde porque son cuatro cosas y se arrastran
             con el dedo; el tablero, en un portátil de 1280, se sale un poco por
             la derecha y sin barra no hay forma de saber que hay una quinta
             columna. Una columna escondida en un tablero es una columna que no
             existe. */
          style={css(
            "overflow-x:auto;overflow-y:visible;padding-bottom:var(--s3);overscroll-behavior-x:contain;" +
              (sobraTablero
                ? "mask-image:linear-gradient(90deg,#000 calc(100% - 46px),transparent 100%);" +
                  "-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 46px),transparent 100%);"
                : "")
          )}
        >
          {/*
              LAS CINCO ACABAN A LA MISMA ALTURA.

              Iban con `align-items:start`, así que cada columna medía lo que
              medía su contenido: cinco tarjetas con cinco cantos inferiores
              distintos, uno a 884 y el de al lado a 1047. El ojo lee eso como
              cinco cosas sueltas, y esta pantalla existe justamente para que se
              lean como UNA: un tablero del que se ve la forma entera.

              Con `stretch` todas cogen el alto de la más llena —hasta el tope,
              donde cada una empieza a desplazarse por dentro— y el tablero
              vuelve a tener un borde de abajo. El `min-height` es para el caso
              contrario: cinco columnas casi vacías se quedaban en dos dedos de
              alto y el tablero desaparecía.
          */}
          <div style={css("display:grid;grid-template-columns:repeat(5,minmax(206px,1fr));gap:var(--s3);align-items:stretch;min-width:1060px;")}>
            {ETAPAS.map((e, ci) => (
              <motion.section
                key={e.k}
                initial={quieto ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: ci * 0.04, ease: [0.16, 1, 0.3, 1] }}
                style={css(
                  TARJETA +
                    PAD_SM +
                    /* Cada columna se desplaza por dentro y su cabecera se
                       queda: con veinte personas en «Se te están enfriando», sin
                       esto la página entera se haría el triple de larga y las
                       otras cuatro columnas quedarían colgando arriba. */
                    "min-width:0;min-height:260px;max-height:calc(100vh - 300px);overflow-y:auto;overscroll-behavior:contain;"
                )}
              >
                <div style={css("position:sticky;top:0;z-index:1;background:var(--surface);padding-bottom:var(--s2);margin:-2px 0 0;")}>
                  {cabezaColumna(e.k)}
                </div>
                {cuerpoColumna(e.k)}
              </motion.section>
            ))}
          </div>
        </div>
      )}

      <AvisoNavegador que="Las fichas y las notas" />

      {/* =============================================================== la ficha */}
      <HojaLateral
        abierta={Boolean(abierta)}
        cerrar={() => setClienteAbierto(null)}
        titulo={abierta ? enTitulo(abierta.c.nombre) : ""}
        pie={
          abierta
            ? `${ORIGENES[abierta.c.origen] || "Apuntada a mano"} · desde el ${diaLargo(new Date(abierta.c.creada))}`
            : undefined
        }
      >
        {abierta && (
          <FichaCliente
            /* La clave es la persona: al cambiar de ficha se monta otra, y con
               ella se van el borrador de la nota y el formulario desplegado de
               la anterior. Sin esto, la nota a medias de Ana aparecería escrita
               en la ficha de Carmen. */
            key={abierta.c.id}
            ficha={abierta.c}
            relacion={abierta.r}
            todasCitas={todasCitas}
            todasFacturas={todasFacturas}
            alCambiar={recargar}
            alBorrar={() => {
              setClienteAbierto(null);
              recargar();
            }}
          />
        )}
      </HojaLateral>
    </main>
  );
}
