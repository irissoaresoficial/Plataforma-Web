"use client";
import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { css } from "@/lib/css";

const CLAVE = "es33.tema";
type Modo = "claro" | "oscuro";

/**
 * Interruptor de claro/oscuro.
 *
 * El tema se escribe en el elemento raíz y todo el color cuelga de ahí: los
 * componentes no saben en qué modo están, sólo leen sus variables. La elección
 * se guarda, y quien no haya elegido nunca hereda lo que pida su sistema.
 *
 * El primer pintado lo hace un script en el <head> — si esperásemos a que
 * React monte, la página aparecería en claro y saltaría a oscuro a la vista.
 */
/* El tema de verdad vive en el elemento raíz, no en React: lo escribe el
 * script del <head> antes del primer pintado. Aquí sólo se lee, con el hook
 * pensado para eso — meterlo en un useState y sincronizarlo en un efecto
 * provocaría un renderizado de más en cada carga. */
const oyentes = new Set<() => void>();
const suscribe = (fn: () => void) => {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
};
const lee = (): Modo => (document.documentElement.dataset.tema === "oscuro" ? "oscuro" : "claro");
const enServidor = (): Modo => "claro";

export default function Tema() {
  const modo = useSyncExternalStore(suscribe, lee, enServidor);

  const cambia = () => {
    const nuevo: Modo = modo === "oscuro" ? "claro" : "oscuro";
    document.documentElement.dataset.tema = nuevo;
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      // Navegación privada o almacenamiento bloqueado: el tema vale para esta
      // sesión y ya está, no es motivo para romper nada.
    }
    oyentes.forEach((fn) => fn());
  };

  const oscuro = modo === "oscuro";

  return (
    <button
      onClick={cambia}
      title={oscuro ? "Pasar a claro" : "Pasar a oscuro"}
      aria-label={oscuro ? "Pasar a claro" : "Pasar a oscuro"}
      style={css(
        "flex:none;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;cursor:pointer;border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);"
      )}
    >
      <motion.svg
        key={modo}
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.42, ease: [0.34, 1.4, 0.64, 1] }}
      >
        {oscuro ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.6v2.2M12 19.2v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.6 12h2.2M19.2 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
          </>
        ) : (
          <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" />
        )}
      </motion.svg>
    </button>
  );
}
