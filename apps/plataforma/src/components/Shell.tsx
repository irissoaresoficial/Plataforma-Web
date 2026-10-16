"use client";
import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import { useApp, PESTANAS, VISTAS_DE_ESTUDIO, llaveDe, dondeEmpieza } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import ConsultaScreen from "./screens/ConsultaScreen";
import PanelScreen from "./screens/PanelScreen";
import EstudioScreen from "./screens/EstudioScreen";
import ParejaScreen from "./screens/ParejaScreen";
import LeadsScreen from "./screens/LeadsScreen";
import AgendaScreen from "./screens/AgendaScreen";
import ClientesScreen from "./screens/ClientesScreen";
import FacturasScreen from "./screens/FacturasScreen";
import EscuelaScreen from "./screens/EscuelaScreen";
import CursosScreen from "./screens/CursosScreen";
import MetricasScreen from "./screens/MetricasScreen";
import ComunidadScreen from "./screens/ComunidadScreen";
import PerfilScreen from "./screens/PerfilScreen";
import GestionScreen from "./screens/GestionScreen";
import DetalleModal from "./DetalleModal";
import Sidebar from "./Sidebar";
import Menu, { BotonMenu } from "./Menu";
import Tema from "./Tema";
import Cuenta from "./Cuenta";
import Avisos from "./despacho/Avisos";
import Novedades from "./despacho/Novedades";
import Particulas from "./Particulas";
import SinEstudio from "./SinEstudio";

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
   * historial del navegador. Un alumno que haya visto `/clientes` una vez lo
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
   * que escribía /clientes veía la pantalla de clientes montarse durante un
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
   * la barra para que no se quede /clientes escrito— pero ya no es él quien
   * protege la pantalla.
   *
   * `usuario` aquí nunca es null: `<Guardia>` no deja montar nada de esto
   * hasta que Firebase ha contestado quién hay dentro (app/layout.tsx). Si eso
   * cambiara, se comprueba igual, porque sin saber quién eres `puede()`
   * devuelve false para todo y lo seguro es llevarte a tu sitio.
   */
  const vista = usuario != null && !puede(llaveDe(view)) ? dondeEmpieza(puede) : view;

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
  const faltaEstudio = rehidratado && VISTAS_DE_ESTUDIO.includes(vista) && !r && !re;

  return (
    <div
      data-app-root=""
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
      <div aria-hidden="true" style={css("position:fixed;inset:0;z-index:0;pointer-events:none;")}>
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
      {(
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
            src="/logo.jpeg"
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
              <div data-marca-disciplinas="" style={css("font-size:var(--t-mini);color:var(--text-4);letter-spacing:-.01em;")}>Kábala · Numerología</div>
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
              {PESTANAS.find((t) => t.k === vista)?.label ?? (vista === "pareja" ? "Comparativa" : "")}
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
        {puede("despacho") && <Avisos />}
        <Tema />
        <Cuenta />
      </header>
      )}

      {/* Por encima del polvo. Sin `position` propia, este bloque va en el
          flujo normal y el lienzo —que está posicionado— se le pintaría encima,
          tapando la aplicación entera con un velo de motas. */}
      <div style={css("position:relative;z-index:1;display:flex;align-items:flex-start;")}>
        {/* La columna, en todas. Salía sólo en el panel, lo cual era coherente
            cuando llevaba únicamente las partes de la carta; ahora que es toda
            la navegación, esconderla en cinco de las seis pantallas dejaría
            cinco pantallas sin salida. */}
        <Sidebar />
        {/* `key={view}` es lo que hace que la pantalla nueva sea un elemento
            nuevo y no el mismo repintado: sin eso, React reutiliza el nodo y la
            animación de entrada de `[data-vista]` no vuelve a dispararse nunca.
            El porqué de que haya animación está en globals.css. */}
        <div key={vista} data-vista="" style={css("flex:1;min-width:0;")}>
          {vista === "inicio" && <ConsultaScreen />}
          {faltaEstudio && <SinEstudio vista={vista} />}
          {vista === "panel" && !faltaEstudio && <PanelScreen />}
          {vista === "estudio" && !faltaEstudio && <EstudioScreen />}
          {vista === "pareja" && !faltaEstudio && <ParejaScreen />}
          {vista === "leads" && <LeadsScreen />}
          {vista === "agenda" && <AgendaScreen />}
          {vista === "clientes" && <ClientesScreen />}
          {vista === "facturas" && <FacturasScreen />}
          {vista === "escuela" && <EscuelaScreen />}
          {vista === "cursos" && <CursosScreen />}
          {vista === "comunidad" && <ComunidadScreen />}
          {vista === "perfil" && <PerfilScreen />}
          {vista === "metricas" && <MetricasScreen />}
          {vista === "gestion" && <GestionScreen />}
        </div>
      </div>

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

      <DetalleModal />
    </div>
  );
}
