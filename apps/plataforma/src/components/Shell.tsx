"use client";
import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import { useApp, PESTANAS, VISTAS_DE_ESTUDIO, type View } from "@/lib/app-context";
import ConsultaScreen from "./screens/ConsultaScreen";
import PanelScreen from "./screens/PanelScreen";
import EstudioScreen from "./screens/EstudioScreen";
import ParejaScreen from "./screens/ParejaScreen";
import LeadsScreen from "./screens/LeadsScreen";
import AgendaScreen from "./screens/AgendaScreen";
import ClientesScreen from "./screens/ClientesScreen";
import FacturasScreen from "./screens/FacturasScreen";
import DetalleModal from "./DetalleModal";
import Sidebar from "./Sidebar";
import Menu, { BotonMenu } from "./Menu";
import Tema from "./Tema";
import Cuenta from "./Cuenta";
import Avisos from "./despacho/Avisos";
import Particulas from "./Particulas";

export default function Shell() {
  const { view, setView, r, re, rehidratado } = useApp();
  const [menu, setMenu] = useState(false);

  // Ahora que cada pantalla tiene su dirección, se puede llegar a /panel con
  // el enlace guardado. Si el estudio que estaba abierto sigue en este equipo
  // se recupera solo; si no hay ninguno se vuelve a la consulta, que es donde
  // se empieza. Se espera a que se haya intentado recuperarlo: antes de eso
  // no hay estudio todavía y se saldría siempre.
  //
  // Sólo se echa de las pantallas DEL ESTUDIO. La agenda, los clientes y las
  // facturas no dependen de que haya una carta calculada — son el trabajo de
  // despacho — y antes esta línea las habría devuelto a la consulta sin más.
  useEffect(() => {
    if (rehidratado && VISTAS_DE_ESTUDIO.includes(view) && !r && !re) setView("inicio");
  }, [view, r, re, rehidratado, setView]);

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
            {/* Las disciplinas que hay. Feng Shui salía aquí y no existía. */}
            <div data-marca-disciplinas="" style={css("font-size:var(--t-mini);color:var(--text-4);letter-spacing:-.01em;")}>Kábala · Numerología</div>
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
              {PESTANAS.find((t) => t.k === view)?.label ?? (view === "pareja" ? "Comparativa" : "")}
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
            hay que mirar y el tema se toca una vez en la vida. */}
        <Avisos />
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
        <div key={view} data-vista="" style={css("flex:1;min-width:0;")}>
          {view === "inicio" && <ConsultaScreen />}
          {view === "panel" && <PanelScreen />}
          {view === "estudio" && <EstudioScreen />}
          {view === "pareja" && <ParejaScreen />}
          {view === "leads" && <LeadsScreen />}
          {view === "agenda" && <AgendaScreen />}
          {view === "clientes" && <ClientesScreen />}
          {view === "facturas" && <FacturasScreen />}
        </div>
      </div>

      <Menu abierto={menu} cerrar={() => setMenu(false)} />
      <DetalleModal />
    </div>
  );
}
