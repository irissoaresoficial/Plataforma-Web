"use client";
import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import { useApp, PESTANAS, VISTAS_DE_ESTUDIO, type View } from "@/lib/app-context";
import ConsultaScreen from "./screens/ConsultaScreen";
import PanelScreen from "./screens/PanelScreen";
import EstudioScreen from "./screens/EstudioScreen";
import ParejaScreen from "./screens/ParejaScreen";
import AgendaScreen from "./screens/AgendaScreen";
import ClientesScreen from "./screens/ClientesScreen";
import FacturasScreen from "./screens/FacturasScreen";
import DetalleModal from "./DetalleModal";
import Sidebar from "./Sidebar";
import Menu, { BotonMenu } from "./Menu";
import Tema from "./Tema";
import Cuenta from "./Cuenta";

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

  // Desde el estudio y la comparativa se vuelve al panel, que es de donde se
  // sale; desde cualquier otra pantalla, a la consulta.
  const volverA: View = view === "estudio" || view === "pareja" ? "panel" : "inicio";

  return (
    <div
      data-app-root=""
      style={css(
        "min-height:100vh;color:var(--text);font-family:var(--font-ui);"
      )}
    >
      {/* La entrada no lleva cabecera: sólo el formulario, centrado. La marca,
       * la navegación y el botón de volver no pintan nada mientras no haya un
       * estudio abierto, y quitarlos deja la pantalla en lo único que hay que
       * hacer ahí. El cambio de tema sí se queda, suelto en una esquina. */}
      {/* En la consulta no hay cabecera, así que el tema y la cuenta van
          sueltos en la esquina. Salir tiene que poder hacerse desde cualquier
          pantalla, y ésta es la primera que se ve. Al despacho se va desde la
          tarjeta de la propia consulta, no desde aquí: tres botones más en la
          esquina de una pantalla sin cabecera es justo lo que se quitó. */}
      {view === "inicio" && (
        <div data-chrome="1" style={css("position:fixed;top:16px;right:clamp(14px,3vw,28px);z-index:40;display:flex;align-items:center;gap:10px;")}>
          <Tema />
          <Cuenta />
        </div>
      )}

      {view !== "inicio" && (
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
            «VOLVER» DICE A DÓNDE.

            El rótulo era siempre «Volver» y el destino cambiaba: desde el
            Estudio subía al Panel, desde el Panel echaba al formulario vacío de
            la consulta. Dos toques seguidos sin pensar y te plantabas fuera del
            estudio que estabas mirando. El destino sólo se sabía por el `title`,
            que en una tableta no existe.

            Una palabra más y desaparece la duda entera. Y en el Panel el botón
            ni sale: la pestaña «Consulta» está ahí al lado y hace lo mismo.
        */}
        {view !== "panel" && (
          <button
            onClick={() => setView(volverA)}
            style={css(
              "display:inline-flex;align-items:center;gap:7px;flex:none;padding:8px 14px;border-radius:980px;cursor:pointer;border:1px solid var(--border-accent);background:color-mix(in srgb, var(--text) 4%, transparent);color:var(--gold);font-size:var(--t-body);font-weight:590;transition:all .2s;"
            )}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            {volverA === "inicio" ? "A la consulta" : "Al panel"}
          </button>
        )}
        {/* Control segmentado de iOS: una pista gris y una pastilla blanca
         * elevada sobre la sección activa.
         *
         * Dentro van los dos grupos separados por una línea de un pelo: a la
         * izquierda el estudio —los tres pasos de leer una carta—, a la derecha
         * el despacho. Son una sola pista y no dos porque son seis sitios donde
         * se puede estar, y sólo se está en uno; con dos pistas parecería que la
         * pantalla puede tener a la vez una pestaña de cada. */}
        <nav data-nav="" style={css("display:flex;align-items:center;gap:2px;margin-left:auto;background:color-mix(in srgb, var(--text) 8%, transparent);border-radius:980px;padding:3px;")}>
          {PESTANAS.map((t, i) => {
            const on = view === t.k || (t.k === "panel" && view === "pareja");
            // El panel y el estudio necesitan una carta calculada; el despacho
            // no, y por eso nunca se bloquea.
            const bloqueado = VISTAS_DE_ESTUDIO.includes(t.k) && !r && !re;
            const abreGrupo = i > 0 && PESTANAS[i - 1].grupo !== t.grupo;
            return (
              <span key={t.k} style={css("display:flex;align-items:center;gap:2px;")}>
                {abreGrupo && <span aria-hidden="true" style={css("width:1px;height:18px;margin:0 6px;background:var(--border-strong);")} />}
                <button
                  onClick={() => {
                    if (!bloqueado) setView(t.k);
                  }}
                  style={css(
                    "padding:7px 16px;border-radius:980px;border:none;white-space:nowrap;cursor:" +
                      (bloqueado ? "not-allowed" : "pointer") +
                      ";font-size:var(--t-body);font-weight:590;letter-spacing:-.01em;background:" +
                      (on ? "var(--surface-solid)" : "transparent") +
                      ";box-shadow:" +
                      (on ? "0 3px 8px rgba(0,0,0,.1),0 1px 1px rgba(0,0,0,.06)" : "none") +
                      ";color:" +
                      (on ? "var(--text)" : bloqueado ? "var(--text-4)" : "var(--text-3)") +
                      ";transition:all .22s;"
                  )}
                >
                  {t.label}
                </button>
              </span>
            );
          })}
        </nav>
        <Tema />
        <Cuenta />
      </header>
      )}

      {/* En el panel la barra lateral va pegada al contenido; el resto de
       * pantallas ocupan el ancho completo. */}
      <div style={css("display:flex;align-items:flex-start;")}>
        {view === "panel" && <Sidebar />}
        <div style={css("flex:1;min-width:0;")}>
          {view === "inicio" && <ConsultaScreen />}
          {view === "panel" && <PanelScreen />}
          {view === "estudio" && <EstudioScreen />}
          {view === "pareja" && <ParejaScreen />}
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
