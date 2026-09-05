"use client";

/**
 * QUIÉN ESTÁ DENTRO, Y CÓMO SALIR
 *
 * Una pastilla con la inicial de quien ha entrado; al pulsarla, su correo y el
 * botón de salir.
 *
 * Que exista no es un adorno: una plataforma en la que se entra y no se puede
 * salir está a medio hacer. Y en un ordenador compartido —el de casa, el del
 * despacho— es que además es un problema, porque el siguiente que lo abra entra
 * como si fuera Iris.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { css } from "@/lib/css";
import { useSesion } from "@/lib/sesion";

export default function Cuenta() {
  const { usuario, sale } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  /* Se cierra al pulsar fuera y con Escape, que es lo que espera cualquiera de
     un menú que se abre debajo de un botón. */
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  if (!usuario) return null;
  const inicial = usuario.nombre.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={caja} style={css("position:relative;flex:none;")}>
      <button
        onClick={() => setAbierto((a) => !a)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Cuenta de ${usuario.email}`}
        style={css(
          "width:38px;height:38px;display:grid;place-items:center;border-radius:50%;cursor:pointer;" +
            "border:1px solid var(--border-strong);background:var(--surface);color:var(--gold-deep);" +
            "font-family:var(--font-display);font-size:15px;font-weight:500;line-height:1;"
        )}
      >
        {inicial}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={css(
              "position:absolute;top:calc(100% + 8px);right:0;z-index:60;min-width:230px;" +
                "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
                "box-shadow:var(--shadow-lg);padding:6px;"
            )}
          >
            <div style={css("padding:10px 12px 12px;border-bottom:1px solid var(--border);margin-bottom:6px;")}>
              <div style={css("font-size:var(--t-micro);letter-spacing:.14em;text-transform:uppercase;color:var(--text-4);margin-bottom:4px;")}>
                Dentro como
              </div>
              <div style={css("font-size:var(--t-body);color:var(--text);overflow-wrap:anywhere;")}>{usuario.email}</div>
            </div>

            <button
              role="menuitem"
              onClick={() => {
                setAbierto(false);
                sale();
              }}
              style={css(
                "display:flex;align-items:center;gap:9px;width:100%;text-align:left;padding:10px 12px;" +
                  "border:none;background:transparent;border-radius:var(--r-sm);cursor:pointer;" +
                  "font-size:var(--t-body);font-weight:500;color:var(--text-2);"
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Salir
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
