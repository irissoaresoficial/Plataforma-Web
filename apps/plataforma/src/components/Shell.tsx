"use client";
import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import { useApp, type View } from "@/lib/app-context";
import ConsultaScreen from "./screens/ConsultaScreen";
import PanelScreen from "./screens/PanelScreen";
import EstudioScreen from "./screens/EstudioScreen";
import ParejaScreen from "./screens/ParejaScreen";
import DetalleModal from "./DetalleModal";
import Sidebar from "./Sidebar";
import Menu, { BotonMenu } from "./Menu";
import Tema from "./Tema";

const TABS: Array<{ k: View; label: string }> = [
  { k: "inicio", label: "Consulta" },
  { k: "panel", label: "Panel" },
  { k: "estudio", label: "Estudio" },
];

export default function Shell() {
  const { view, setView, r, re, rehidratado } = useApp();
  const [menu, setMenu] = useState(false);

  // Ahora que cada pantalla tiene su dirección, se puede llegar a /panel con
  // el enlace guardado. Si el estudio que estaba abierto sigue en este equipo
  // se recupera solo; si no hay ninguno se vuelve a la consulta, que es donde
  // se empieza. Se espera a que se haya intentado recuperarlo: antes de eso
  // no hay estudio todavía y se saldría siempre.
  useEffect(() => {
    if (rehidratado && view !== "inicio" && !r && !re) setView("inicio");
  }, [view, r, re, rehidratado, setView]);

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
      {view === "inicio" && (
        <div data-chrome="1" style={css("position:fixed;top:16px;right:clamp(14px,3vw,28px);z-index:40;")}>
          <Tema />
        </div>
      )}

      {view !== "inicio" && (
      <header
        data-chrome="1"
        data-app-header=""
        style={css(
          "position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:clamp(12px,2vw,22px);flex-wrap:wrap;padding:12px clamp(14px,3vw,28px);background:color-mix(in srgb, var(--bg) 78%, transparent);backdrop-filter:blur(16px) saturate(180%);-webkit-backdrop-filter:blur(16px) saturate(180%);border-bottom:1px solid var(--border);"
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
          <div style={css("display:flex;flex-direction:column;gap:2px;")}>
            <div style={css("font-family:var(--font-display);font-weight:500;font-size:clamp(15px,1.7vw,19px);letter-spacing:-.008em;color:var(--text);line-height:1.15;")}>Escuela de Sabiduría 33</div>
            {/* La escuela son tres disciplinas: la marca ya no dice sólo Kábala. */}
            <div style={css("font-size:var(--t-mini);color:var(--text-4);letter-spacing:-.01em;")}>Kábala · Feng Shui · Numerología</div>
          </div>
        </div>
        <button
            onClick={() => setView(view === "panel" ? "inicio" : "panel")}
            title={view === "panel" ? "Volver a la consulta" : "Volver al panel"}
            style={css(
              "display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:980px;cursor:pointer;border:1px solid var(--border-accent);background:color-mix(in srgb, var(--text) 4%, transparent);color:var(--gold);font-size:var(--t-body);font-weight:590;transition:all .2s;"
            )}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Volver
          </button>
        {/* Control segmentado de iOS: una pista gris y una pastilla blanca
         * elevada sobre la sección activa. */}
        <nav data-nav="" style={css("display:flex;gap:2px;margin-left:auto;background:color-mix(in srgb, var(--text) 8%, transparent);border-radius:980px;padding:3px;")}>
          {TABS.map((t) => {
            const on = view === t.k;
            const bloqueado = t.k !== "inicio" && !r && !re;
            return (
              <button
                key={t.k}
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
            );
          })}
        </nav>
        <Tema />
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
        </div>
      </div>

      <Menu abierto={menu} cerrar={() => setMenu(false)} />
      <DetalleModal />
    </div>
  );
}
