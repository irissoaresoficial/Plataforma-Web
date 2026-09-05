"use client";
import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp, type View } from "@/lib/app-context";
import { NavDisciplinas } from "./Sidebar";

const VISTAS: Array<{ k: View; label: string }> = [
  { k: "inicio", label: "Consulta" },
  { k: "panel", label: "Panel" },
  { k: "estudio", label: "Estudio" },
];

/**
 * El menú de móvil y tableta en vertical.
 *
 * Ahí no cabe la columna de la izquierda, y la tira de pestañas que la
 * sustituía metía en la misma fila las tres disciplinas y las siete partes de
 * Kábala: diez pestañas desplazándose en horizontal, sin jerarquía y sin que
 * se viera dónde acababa una cosa y empezaba la otra. Con el botón, la
 * navegación entera cabe de una vez y se lee como lo que es — tres
 * disciplinas, y dentro de una, sus partes.
 *
 * Es la misma lista que la columna de escritorio: <NavDisciplinas />.
 */
export default function Menu({ abierto, cerrar }: { abierto: boolean; cerrar: () => void }) {
  const { view, setView, r } = useApp();
  const quieto = useReducedMotion();

  // Con el cajón abierto la página de debajo no se desplaza, y la tecla de
  // escape lo cierra.
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("keydown", tecla);
    };
  }, [abierto, cerrar]);

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          data-chrome="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={cerrar}
          style={css("position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.36);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);")}
        >
          <motion.aside
            data-cajon=""
            onClick={(e) => e.stopPropagation()}
            initial={quieto ? { opacity: 0 } : { x: "-100%" }}
            animate={quieto ? { opacity: 1 } : { x: 0 }}
            exit={quieto ? { opacity: 0 } : { x: "-100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "position:absolute;top:0;left:0;bottom:0;width:min(300px,86vw);display:flex;flex-direction:column;gap:var(--s5);padding:18px 14px 28px;overflow-y:auto;background:var(--bg);border-right:1px solid var(--border);"
            )}
          >
            <div style={css("display:flex;align-items:center;gap:11px;padding:0 6px;")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpeg"
                alt=""
                style={css("width:34px;height:34px;flex:none;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1px rgba(201,168,76,.4);")}
              />
              <div style={css("min-width:0;")}>
                <div style={css("font-family:var(--font-display);font-weight:500;font-size:var(--t-body);color:var(--text);line-height:1.15;")}>Escuela de Sabiduría 33</div>
                <div style={css("font-size:var(--t-micro);color:var(--text-4);")}>Kábala · Feng Shui · Numerología</div>
              </div>
              <button
                onClick={cerrar}
                aria-label="Cerrar el menú"
                style={css("margin-left:auto;flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:50%;border:1px solid var(--border);background:var(--surface);color:var(--text-3);cursor:pointer;")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Consulta, panel y estudio también viven aquí: en la cabecera
             * estrecha ocupaban una fila entera para ellas solas. */}
            <div style={css("display:flex;gap:2px;background:color-mix(in srgb, var(--text) 8%, transparent);border-radius:980px;padding:3px;")}>
              {VISTAS.map((v) => {
                const on = view === v.k;
                const bloqueado = v.k !== "inicio" && !r;
                return (
                  <button
                    key={v.k}
                    onClick={() => {
                      if (bloqueado) return;
                      setView(v.k);
                      cerrar();
                    }}
                    style={css(
                      "flex:1;padding:8px 6px;border-radius:980px;border:none;white-space:nowrap;font-size:var(--t-body);font-weight:590;cursor:" +
                        (bloqueado ? "not-allowed" : "pointer") +
                        ";background:" +
                        (on ? "var(--surface-solid)" : "transparent") +
                        ";box-shadow:" +
                        (on ? "0 2px 6px rgba(0,0,0,.09)" : "none") +
                        ";color:" +
                        (on ? "var(--text)" : bloqueado ? "var(--text-4)" : "var(--text-3)") +
                        ";"
                    )}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>

            {r && <NavDisciplinas alCambiar={cerrar} />}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** El botón de tres rayas. Sólo se ve donde no cabe la columna lateral. */
export function BotonMenu({ onClick }: { onClick: () => void }) {
  return (
    <button
      data-boton-menu=""
      onClick={onClick}
      aria-label="Abrir el menú"
      style={css(
        "flex:none;display:none;place-items:center;width:38px;height:38px;border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface);color:var(--text-2);cursor:pointer;"
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  );
}
