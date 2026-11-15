"use client";
import { useEffect, useState, type ComponentType } from "react";
import { css } from "@/lib/css";
import { useApp, PESTANAS, VISTAS_DE_ESTUDIO, llaveDe, dondeEmpieza } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import dynamic from "next/dynamic";
import Sidebar, { Dock } from "./Sidebar";
import Menu, { BotonMenu } from "./Menu";
import Tema from "./Tema";
import Cuenta from "./Cuenta";
import Avisos from "./despacho/Avisos";
import AgenteIA from "./AgenteIA";
import MisPuntos from "./MisPuntos";
import GuiaPasos from "./escuela/GuiaPasos";
import Novedades from "./despacho/Novedades";
import Particulas from "./Particulas";
import SinEstudio from "./SinEstudio";
import type { View } from "@/lib/app-context";

/*
 * CADA PANTALLA, CON SU PROPIO CÓDIGO Y SÓLO CUANDO SE ABRE.
 *
 * Aquí se importaban las diecinueve pantallas de golpe, arriba del archivo. Y
 * como todas las direcciones (/, /panel, /agenda…) pintan este mismo Shell,
 * cualquiera de ellas obligaba a descargar y a leer el código de TODAS: un
 * alumno que entraba a ver su curso se bajaba el Feng Shui, las facturas, el
 * panel de la Kábala y las métricas de Iris antes de ver nada. Medido el 15 de
 * noviembre de 2026: 2,6 MB de JavaScript (784 KB comprimidos) en cada
 * dirección, la misma cifra en todas, que es la firma de este fallo.
 *
 * Ahora cada pantalla es un trozo aparte que se pide cuando hace falta. La
 * primera que se ve llega antes porque viene sola, y las demás se traen
 * después, en silencio, cuando el navegador no tiene nada mejor que hacer
 * (`calienta`, abajo): al pulsar en la columna ya están en casa y el cambio
 * es igual de inmediato que antes.
 *
 * Mientras llega, un hueco del alto de la pantalla y nada más. Sin rueda ni
 * «Cargando…»: casi siempre ya está y un aviso sería un parpadeo; y el hueco
 * evita que el pie suba de golpe y vuelva a bajar.
 */
const CARGAS: Record<View, () => Promise<{ default: ComponentType }>> = {
  tablero: () => import("./screens/TableroScreen"),
  miagenda: () => import("./screens/MiAgendaScreen"),
  mismetricas: () => import("./screens/MisMetricasScreen"),
  inicio: () => import("./screens/ConsultaScreen"),
  panel: () => import("./screens/PanelScreen"),
  estudio: () => import("./screens/EstudioScreen"),
  pareja: () => import("./screens/ParejaScreen"),
  fengshui: () => import("./screens/FengShuiScreen"),
  agenda: () => import("./screens/AgendaScreen"),
  personas: () => import("./screens/PersonasScreen"),
  facturas: () => import("./screens/FacturasScreen"),
  escuela: () => import("./screens/EscuelaScreen"),
  cursos: () => import("./screens/CursosScreen"),
  comunidad: () => import("./screens/ComunidadScreen"),
  perfil: () => import("./screens/PerfilScreen"),
  metricas: () => import("./screens/MetricasScreen"),
  gestion: () => import("./screens/GestionScreen"),
  correos: () => import("./screens/CorreosScreen"),
};

/* La ficha que se abre al pulsar un número o un arcano. Sólo existe en las
   pantallas del estudio, pero arrastraba los diccionarios del documento en
   los tres idiomas (por `chips` → `documento`) a la primera carga de todo el
   mundo. Va aparte y llega justo después, sin que nadie espere por ella: hasta
   que alguien pulsa algo no tiene nada que pintar. */
const DetalleModal = dynamic(() => import("./DetalleModal"));

const Hueco = () => <div aria-hidden="true" style={css("min-height:70vh;")} />;

/* `next/dynamic` necesita ver cada `import()` escrito a mano para partir el
   código, así que va una por una y no en un bucle sobre CARGAS. */
const TableroScreen = dynamic(() => import("./screens/TableroScreen"), { loading: Hueco });
const MiAgendaScreen = dynamic(() => import("./screens/MiAgendaScreen"), { loading: Hueco });
const MisMetricasScreen = dynamic(() => import("./screens/MisMetricasScreen"), { loading: Hueco });
const ConsultaScreen = dynamic(() => import("./screens/ConsultaScreen"), { loading: Hueco });
const PanelScreen = dynamic(() => import("./screens/PanelScreen"), { loading: Hueco });
const EstudioScreen = dynamic(() => import("./screens/EstudioScreen"), { loading: Hueco });
const ParejaScreen = dynamic(() => import("./screens/ParejaScreen"), { loading: Hueco });
const FengShuiScreen = dynamic(() => import("./screens/FengShuiScreen"), { loading: Hueco });
const AgendaScreen = dynamic(() => import("./screens/AgendaScreen"), { loading: Hueco });
const PersonasScreen = dynamic(() => import("./screens/PersonasScreen"), { loading: Hueco });
const FacturasScreen = dynamic(() => import("./screens/FacturasScreen"), { loading: Hueco });
const EscuelaScreen = dynamic(() => import("./screens/EscuelaScreen"), { loading: Hueco });
const CursosScreen = dynamic(() => import("./screens/CursosScreen"), { loading: Hueco });
const ComunidadScreen = dynamic(() => import("./screens/ComunidadScreen"), { loading: Hueco });
const PerfilScreen = dynamic(() => import("./screens/PerfilScreen"), { loading: Hueco });
const MetricasScreen = dynamic(() => import("./screens/MetricasScreen"), { loading: Hueco });
const GestionScreen = dynamic(() => import("./screens/GestionScreen"), { loading: Hueco });
const CorreosScreen = dynamic(() => import("./screens/CorreosScreen"), { loading: Hueco });

/**
 * Trae en segundo plano el código de las pantallas que esta persona puede
 * abrir, de una en una y sólo cuando el navegador está desocupado. Las que no
 * le tocan no se piden: a un alumno no le hace falta el despacho ni para
 * tenerlo guardado.
 */
function calienta(vistas: View[]) {
  const ocioso: (fn: () => void) => void =
    typeof window !== "undefined" && "requestIdleCallback" in window
      ? (fn) => window.requestIdleCallback(fn, { timeout: 4000 })
      : (fn) => window.setTimeout(fn, 600);
  let i = 0;
  const siguiente = () => {
    const v = vistas[i++];
    if (!v) return;
    CARGAS[v]()
      .catch(() => {
        /* Si falla aquí no pasa nada: se volverá a pedir al abrir la pantalla,
           y ahí sí se verá el error si lo hay. */
      })
      .finally(() => ocioso(siguiente));
  };
  ocioso(siguiente);
}

/*
 * LAS PANTALLAS QUE YA VAN EN CRISTAL.
 *
 * El cristal (globals.css, «EL CRISTAL») entra pantalla por pantalla: cada una
 * se añade aquí cuando está revisada en captura, en claro y en oscuro, a 1440 y
 * a 390. Las demás siguen como estaban hasta su turno — mejor una pantalla de
 * antes entera que una nueva a medias.
 */
const CRISTAL: View[] = [
  "tablero",
  "inicio",
  "panel",
  "estudio",
  "pareja",
  "agenda",
  "personas",
  "facturas",
  "escuela",
  "cursos",
  "comunidad",
  "perfil",
  "miagenda",
  "mismetricas",
  "metricas",
  "correos",
  "gestion",
  /* Feng Shui, desde el 15 de noviembre: su chat ya lo hizo con estos mismos
     tokens. Ger: «TODOS LOS APARTADOS TENGAN NUESTRO DISEÑO». */
  "fengshui",
];

export default function Shell() {
  const { view, setView, r, re, rehidratado } = useApp();
  const { usuario, puede } = useSesion();
  const [menu, setMenu] = useState(false);

  /*
   * ESCONDER UNA PUERTA NO ES CERRARLA.
   *
   * El menú ya no enseña lo que no se puede abrir, y eso basta para que nadie
   * se tropiece con el despacho de Iris sin querer. Pero no basta para nada
   * más: la dirección se escribe a mano, se pega de un chat, se queda en el
   * historial del navegador. Un alumno que haya visto `/personas` una vez lo
   * vuelve a escribir y entra.
   *
   * Así que la puerta se cierra aquí también, y a quien no puede pasar no se
   * le enseña un cartel de «no tienes permiso» —que no sirve de nada y encima
   * confirma que ahí hay algo— sino que se le lleva a lo más cercano que sí
   * es suyo: Iris a su consulta, un alumno a su escuela.
   *
   * ESTO NO ES LA SEGURIDAD, ES LA EDUCACIÓN. Quien sepa lo justo puede saltar
   * esto desde la consola del navegador en diez segundos. Lo que de verdad
   * impide que se lleve los datos son las reglas de Firestore, que corren en
   * el servidor de Google y no se pueden tocar desde aquí. Esto es para que la
   * plataforma no enseñe pantallas rotas a quien no le tocan.
   *
   * Se espera a que se sepa quién hay dentro: con `usuario` en null todavía no
   * ha contestado Firebase, y mover a alguien en ese momento lo echaría de
   * donde quería ir justo antes de tener derecho a estar.
   */
  useEffect(() => {
    if (usuario == null) return;
    if (puede(llaveDe(view))) return;
    setView(dondeEmpieza(puede));
  }, [usuario, view, puede, setView]);

  /*
   * Y MIENTRAS SE LA LLEVA, NO SE PINTA LA PANTALLA PROHIBIDA.
   *
   * El efecto de arriba corre DESPUÉS de pintar. Eso significaba que un alumno
   * que escribía /personas veía la pantalla de personas montarse durante un
   * fotograma, y un fotograma es tiempo de sobra para que esa pantalla pida a
   * Firestore la lista de clientes de Iris. El servidor contestaba no —que es
   * lo que tiene que pasar— pero la petición ya iba de camino y su rechazo
   * aparecía en la consola como un error sin dueño:
   *
   *     Missing or insufficient permissions.
   *
   * No se escapaba ni un dato. Lo que se escapaba era la calma: un error rojo
   * al navegar enseña a desconfiar de la consola, y el día que haya uno de
   * verdad estará mezclado con éstos.
   *
   * Así que la vista que se PINTA se decide aquí, antes de pintar, y no espera
   * al efecto. El efecto sigue haciendo falta —es quien cambia la dirección en
   * la barra para que no se quede /personas escrito— pero ya no es él quien
   * protege la pantalla.
   *
   * `usuario` aquí nunca es null: `<Guardia>` no deja montar nada de esto
   * hasta que Firebase ha contestado quién hay dentro (app/layout.tsx). Si eso
   * cambiara, se comprueba igual, porque sin saber quién eres `puede()`
   * devuelve false para todo y lo seguro es llevarte a tu sitio.
   */
  const vista = usuario != null && !puede(llaveDe(view)) ? dondeEmpieza(puede) : view;

  /* Una vez pintada la primera pantalla, el resto de las suyas se va
     trayendo sin prisa (ver CARGAS, arriba). Depende sólo de quién es: no se
     repite al navegar. */
  useEffect(() => {
    if (usuario == null) return;
    calienta((Object.keys(CARGAS) as View[]).filter((v) => puede(llaveDe(v))));
  }, [usuario, puede]);

  /*
   * SIN ESTUDIO NO HAY PANEL, PERO TAMPOCO SE MUEVE A NADIE DE SITIO.
   *
   * Aquí había un `setView("inicio")`: si se llegaba a /panel sin ningún
   * estudio abierto, la dirección cambiaba sola a la raíz y aparecía el
   * formulario en blanco. Sin un cartel, sin una línea, sin nada.
   *
   * La decisión de fondo era correcta —esta pantalla lee una carta y sin carta
   * no hay nada que enseñar— pero la forma perdía a la persona. Iris abre su
   * enlace guardado en un ordenador donde no ha trabajado antes, ve otra
   * dirección y una pantalla vacía, y concluye que el enlace está roto.
   *
   * Ahora la dirección se queda donde está y en su sitio sale <SinEstudio />,
   * que dice qué falta y lleva a la consulta. Así el enlace guardado sigue
   * siendo válido: en cuanto se genera el estudio, /panel enseña el panel.
   *
   * Sólo afecta a las pantallas DEL ESTUDIO. La agenda, los clientes y las
   * facturas no dependen de ninguna carta — son el trabajo de despacho.
   *
   * Se espera a `rehidratado`: antes de eso todavía no se ha intentado
   * recuperar el estudio guardado y el cartel saldría siempre, incluso cuando
   * sí lo hay.
   */
  const cristal = CRISTAL.includes(vista);
  const nombreVista =
    PESTANAS.find((t) => t.k === vista)?.label ?? (vista === "pareja" ? "Comparativa" : vista === "fengshui" ? "Feng Shui" : "");

  /* Las hojas que se abren encima (la ficha de una persona, una cita) se
     pintan fuera de este árbol, directamente en <body>, y no ven el
     `data-cristal` de aquí abajo. La marca se repite en <html> para que
     globals.css también las alcance. */
  useEffect(() => {
    const raiz = document.documentElement;
    if (cristal) raiz.dataset.enCristal = "";
    else delete raiz.dataset.enCristal;
  }, [cristal]);

  const faltaEstudio = rehidratado && VISTAS_DE_ESTUDIO.includes(vista) && !r && !re;

  return (
    <div
      data-app-root=""
      data-cristal={cristal ? "" : undefined}
      style={css(
        "position:relative;min-height:100vh;color:var(--text);font-family:var(--font-ui);"
      )}
    >
      {/*
          EL POLVO, EN TODAS LAS PANTALLAS.

          Estaba sólo en la consulta y en los carteles de «pendiente», así que
          la atmósfera se apagaba justo al entrar a trabajar: la consulta
          respiraba y el panel, la agenda y las facturas eran papel liso.

          Va aquí, en la raíz, y no dentro de cada pantalla: así es UN solo
          lienzo para toda la aplicación en vez de uno por vista, no se reinicia
          al cambiar de sección —el polvo sigue subiendo mientras navegas, que
          es la mitad del efecto— y las motas atraviesan la columna y la
          cabecera por debajo del cristal.

          Fijo a la ventana a propósito: es aire de la habitación, no del
          documento, así que no se va con el scroll.
      */}
      <div data-polvo="" aria-hidden="true" style={css("position:fixed;inset:0;z-index:0;pointer-events:none;")}>
        <Particulas cantidad={34} />
      </div>
      {/*
          UNA SOLA CABECERA, EN TODAS LAS PANTALLAS.

          La consulta no llevaba: era una pantalla limpia, con el tema y la
          cuenta sueltos en una esquina, y al despacho se iba por una tarjeta de
          dentro. Tenía sentido cuando la consulta era la puerta de entrada al
          estudio y poco más.

          Ya no lo tiene. Ahora la columna de la izquierda ES la navegación, y
          una pantalla sin ella es una pantalla desde la que no se puede ir a
          ningún sitio — justo la primera que se ve al abrir por la mañana.
          Misma cabecera y misma columna en las seis: no hay que aprenderse una
          pantalla que funciona distinta de las demás.
      */}
      {cristal ? (
      /* LA BARRA DE CRISTAL: una píldora que flota arriba, como la de Safari.
         La marca a la izquierda, en el centro dónde estás y a la derecha lo
         mismo que en la cabecera de siempre. La forma la pone globals.css. */
      <header data-chrome="1" data-app-header="" data-barra="">
        <BotonMenu onClick={() => setMenu(true)} />
        <div style={css("display:flex;align-items:center;gap:11px;min-width:0;flex:none;")}>
          {/* `logo-chico.jpeg` es el mismo sello a 160 px (13 KB). Aquí se
              pintaba a 38 px pidiendo el original de 1024 px, 171 KB en la
              primera visita de cada aparato sólo para la esquina de la barra.
              El grande se queda para el documento, que se imprime. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-chico.jpeg"
            alt="Escuela de Sabiduría 33"
            style={css("width:38px;height:38px;flex:none;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1px var(--border-accent);")}
          />
          <span data-barra-nombre="" style={css("font-size:var(--t-body);font-weight:500;letter-spacing:.02em;color:var(--text);white-space:nowrap;")}>
            Escuela de Sabiduría 33
          </span>
        </div>
        <div data-barra-campo="" aria-current="page">
          {nombreVista}
        </div>
        <div style={css("display:flex;align-items:center;gap:8px;flex:none;")}>
          <MisPuntos />
          <AgenteIA />
          {puede("despacho") && <Avisos />}
          <Tema />
          <Cuenta />
        </div>
      </header>
      ) : (
      <header
        data-chrome="1"
        data-app-header=""
        style={css(
          /* La cabecera es cristal: se ve pasar el contenido por debajo al hacer
             scroll, y por eso se lee como una capa que flota y no como una
             franja pegada. El desenfoque y el color salen de los tokens de la
             casa (`--vidrio`), no de una mezcla escrita aquí, para que el
             cristal de la cabecera, el del lateral y el de las hojas sean
             exactamente el mismo cristal. */
          "position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:clamp(12px,2vw,22px);flex-wrap:wrap;padding:12px clamp(14px,3vw,28px);background:var(--vidrio);backdrop-filter:var(--vidrio-difuminado);-webkit-backdrop-filter:var(--vidrio-difuminado);border-bottom:1px solid var(--border);"
        )}
      >
        <BotonMenu onClick={() => setMenu(true)} />
        <div data-marca="" style={css("display:flex;align-items:center;gap:13px;min-width:0;")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-chico.jpeg"
            alt="Escuela de Sabiduría 33"
            style={css("width:38px;height:38px;flex:none;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1px rgba(201,168,76,.4),0 0 22px var(--border-accent);")}
          />
          <div style={css("display:flex;flex-direction:column;gap:2px;min-width:0;")}>
            <div data-marca-nombre="" style={css("font-family:var(--font-display);font-weight:500;font-size:clamp(15px,1.7vw,19px);letter-spacing:-.008em;color:var(--text);line-height:1.15;")}>Escuela de Sabiduría 33</div>
            {/* Las disciplinas que hay. Feng Shui salía aquí y no existía.

                Y sólo las ve quien estudia. Un alumno que compra un curso de
                la escuela no trabaja con la Kábala ni con la numerología: leía
                aquí el nombre de dos cosas que no puede abrir en ningún sitio,
                justo debajo del nombre de la casa. No era una fuga de datos,
                pero sí la promesa de una puerta que para él no existe. */}
            {puede("estudio") && (
              <div data-marca-disciplinas="" style={css("font-size:var(--t-mini);color:var(--text-4);letter-spacing:-.01em;")}>Kábala · Numerología · Feng Shui</div>
            )}
            {/*
                DÓNDE ESTOY, CUANDO LAS PESTAÑAS NO SE VEN.

                Por debajo de 1200 px la tira de pestañas se va al cajón, y con
                ella la única señal de en qué pantalla se está. La cabecera se
                quedaba diciendo «Escuela de Sabiduría 33 · Volver · I» y para
                saber si estabas en el Panel o en el Estudio —que se parecen lo
                justo para dudar— había que abrir el cajón y mirar cuál estaba
                marcada. Dos toques para contestar la primera pregunta de
                cualquier pantalla.

                Ahora el nombre de la vista ocupa el renglón del subtítulo, que
                en ese ancho no está haciendo nada: las disciplinas ya salen en
                el cajón, que es donde se usan.
            */}
            <div
              data-marca-vista=""
              style={css("font-size:var(--t-mini);font-weight:600;color:var(--accion);letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}
            >
              {nombreVista}
            </div>
          </div>
        </div>
        {/*
            Y «VOLVER» TAMBIÉN SE HA IDO.

            Era un rótulo con tres destinos: desde el Estudio subía al Panel,
            desde el Panel echaba al formulario vacío de la consulta. Con la
            columna siempre delante ya no hace falta ninguna flecha genérica —
            cada sitio tiene su nombre y se pulsa directamente. Un botón menos
            en la cabecera, y uno que además engañaba.
        */}
        {/*
            LA TIRA DE PESTAÑAS SE HA IDO A LA COLUMNA.

            Eran seis, y seis no caben: a partir de 1200 px se escondían enteras
            en el cajón. Además duplicaban lo que la columna ya listaba, así que
            para saber a dónde se podía ir había que mirar en dos sitios y
            acordarse de cuál mandaba en cada ancho.

            Aquí arriba se queda lo que no es navegación: quién eres, en qué
            pantalla estás cuando la columna no cabe, y el tema.
        */}
        <span style={css("margin-left:auto;")} />
        {/* Los avisos van aquí y no en la columna: la columna es una lista de
            sitios y un aviso no es un sitio, además de que desaparece dentro del
            cajón por debajo de 980 px. El porqué entero está escrito en
            `despacho/Avisos.tsx`. Delante del tema, porque es lo que a veces
            hay que mirar y el tema se toca una vez en la vida.

            SÓLO PARA QUIEN TIENE DESPACHO. Esto estaba montado para todo el
            mundo, y un alumno entrando en la escuela disparaba la lectura de
            `avisos`, `leads` y `citas` — tres colecciones que las reglas
            reservan a Iris. No se colaba nada: el servidor decía no las tres
            veces. Lo que pasaba es que la consola se llenaba de «Missing or
            insufficient permissions» en cada pantalla, y ese ruido es
            exactamente el que luego esconde un fallo de verdad. Se arregla en
            el sitio correcto: no pedir lo que no te toca, en vez de pedirlo y
            tragarse el no. */}
        <MisPuntos />
        <AgenteIA />
        {puede("despacho") && <Avisos />}
        <Tema />
        <Cuenta />
      </header>
      )}

      {/* Por encima del polvo. Sin `position` propia, este bloque va en el
          flujo normal y el lienzo —que está posicionado— se le pintaría encima,
          tapando la aplicación entera con un velo de motas. */}
      <div
        data-fila={cristal ? "" : undefined}
        style={css("position:relative;z-index:1;display:flex;align-items:" + (cristal ? "stretch" : "flex-start") + ";")}
      >
        {/* La columna, en todas. Salía sólo en el panel, lo cual era coherente
            cuando llevaba únicamente las partes de la carta; ahora que es toda
            la navegación, esconderla en cinco de las seis pantallas dejaría
            cinco pantallas sin salida. */}
        <Sidebar cristal={cristal} />
        {/* `key={view}` es lo que hace que la pantalla nueva sea un elemento
            nuevo y no el mismo repintado: sin eso, React reutiliza el nodo y la
            animación de entrada de `[data-vista]` no vuelve a dispararse nunca.
            El porqué de que haya animación está en globals.css. */}
        <div key={vista} data-vista="" data-ventana={cristal ? "" : undefined} style={css("flex:1;min-width:0;")}>
          {vista === "tablero" && <TableroScreen />}
          {vista === "miagenda" && <MiAgendaScreen />}
          {vista === "mismetricas" && <MisMetricasScreen />}
          {vista === "inicio" && <ConsultaScreen />}
          {faltaEstudio && <SinEstudio vista={vista} />}
          {vista === "panel" && !faltaEstudio && <PanelScreen />}
          {vista === "estudio" && !faltaEstudio && <EstudioScreen />}
          {vista === "pareja" && !faltaEstudio && <ParejaScreen />}
          {vista === "fengshui" && <FengShuiScreen />}
          {vista === "agenda" && <AgendaScreen />}
          {vista === "personas" && <PersonasScreen />}
          {vista === "facturas" && <FacturasScreen />}
          {vista === "escuela" && <EscuelaScreen />}
          {vista === "cursos" && <CursosScreen />}
          {vista === "comunidad" && <ComunidadScreen />}
          {vista === "perfil" && <PerfilScreen />}
          {vista === "metricas" && <MetricasScreen />}
          {vista === "gestion" && <GestionScreen />}
          {vista === "correos" && <CorreosScreen />}
        </div>
      </div>

      {/* Por debajo de 1130 px el riel se convierte en un dock abajo, en el
          centro. Sólo en cristal: fuera de él manda el cajón de siempre. */}
      {cristal && <Dock abrirMenu={() => setMenu(true)} />}
      <Menu abierto={menu} cerrar={() => setMenu(false)} />
      {/* Los avisos que aparecen solos cuando entra alguien por la web. Van
          aquí, al final y fuera de todo, porque son una capa que flota encima:
          dentro de cualquier bloque heredarían su `overflow` o su `z-index` y
          acabarían recortados por una tarjeta.

          Y con la misma llave que los avisos de arriba, por lo mismo: dejaba
          dos orejas puestas en `leads` y en `citas` que para un alumno sólo
          podían recibir un no. Éstas ni se quejaban —tienen su propio manejo
          de error, que calla— así que el gasto no se veía por ninguna parte. */}
      {puede("despacho") && <Novedades />}
      {/* Los primeros pasos, con su nube, para quien no es Iris. Se van solos
          cuando están todos hechos. Por qué y cómo: `escuela/GuiaPasos.tsx`. */}
      {!puede("despacho") && <GuiaPasos />}

      <DetalleModal />
    </div>
  );
}
