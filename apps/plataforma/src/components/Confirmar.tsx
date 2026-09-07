"use client";

/**
 * PREGUNTAR ANTES DE ROMPER ALGO.
 *
 * La plataforma tenía dos botones que destruían trabajo sin decir nada:
 * «Restablecer textos», que borraba de golpe todos los párrafos que Iris había
 * reescrito a lo largo de una tarde, y la × de cada estudio guardado, que lo
 * quitaba al instante. Los dos, además, viven a pocos píxeles del botón que se
 * pulsa en cada consulta. Y no hay copia de seguridad automática de nada: la
 * propia pantalla lo dice —«esa copia es lo único que queda»—.
 *
 * TRES DECISIONES, Y NINGUNA ES DE ADORNO.
 *
 * 1. No es `window.confirm`. Ese diálogo sale con la letra y los colores del
 *    navegador, en inglés según el sistema, y bloquea la página entera. Aquí la
 *    pregunta sale en la misma casa que el resto.
 *
 * 2. El botón de confirmar NO cae donde estaba el que se acaba de pulsar.
 *    Es la única protección de verdad contra el accidente más común, que es el
 *    doble clic: si «Sí» apareciera bajo el dedo, confirmar sería tan fácil como
 *    no haber preguntado. Va a la derecha del «No», y el foco entra en «No».
 *
 * 3. La pregunta dice QUÉ se pierde y CUÁNTO. «¿Estás seguro?» no es una
 *    pregunta: no aporta ningún dato nuevo para decidir. «Vas a descartar los 20
 *    párrafos que has reescrito de Ana Maria Soares» sí.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";

export default function Confirmar({
  children,
  estilo,
  titulo,
  pregunta,
  confirmar,
  alConfirmar,
  alineado = "derecha",
}: {
  /** Lo que se ve dentro del botón que dispara la pregunta. */
  children: React.ReactNode;
  /** El estilo de ese botón: se le pasa tal cual para que sea el de siempre. */
  estilo: string;
  /** Texto accesible del botón, cuando el contenido es sólo un símbolo. */
  titulo?: string;
  /** Qué se pierde y cuánto. En una frase. */
  pregunta: string;
  /** El texto del botón que rompe: un verbo, no «Aceptar». */
  confirmar: string;
  alConfirmar: () => void;
  /** Hacia qué lado se abre la pregunta, según dónde esté el botón. */
  alineado?: "derecha" | "izquierda";
}) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const no = useRef<HTMLButtonElement>(null);
  const quieto = useReducedMotion();

  /* Escape cierra y el clic fuera cierra: las dos salidas que cualquiera prueba
     sin pensar. Y al abrir, el foco va al «No» — así el Enter de quien viene
     tecleando cancela en vez de destruir. */
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    no.current?.focus();
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div ref={caja} style={css("position:relative;flex:none;")}>
      <button
        onClick={() => setAbierto((a) => !a)}
        title={titulo}
        aria-label={titulo}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        style={css(estilo)}
      >
        {children}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            role="dialog"
            aria-label={pregunta}
            initial={quieto ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={quieto ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "position:absolute;top:calc(100% + 8px);z-index:80;width:max(260px,100%);max-width:min(320px,80vw);" +
                (alineado === "derecha" ? "right:0;" : "left:0;") +
                "background:var(--surface);border:1px solid var(--border-strong);border-radius:var(--r);" +
                "box-shadow:var(--shadow-lg);padding:var(--s4);text-align:left;"
            )}
          >
            <p style={css("margin:0 0 var(--s4);font-size:var(--t-body);line-height:1.5;color:var(--text-2);text-wrap:pretty;")}>
              {pregunta}
            </p>
            {/* «No» primero y a la izquierda; «Sí» al otro extremo, lejos de
                donde estaba el botón que se acaba de pulsar. */}
            <div style={css("display:flex;gap:var(--s2);justify-content:flex-end;")}>
              <button
                ref={no}
                onClick={() => setAbierto(false)}
                style={css(
                  "padding:8px 15px;border-radius:980px;border:1px solid var(--border-strong);background:var(--surface);" +
                    "color:var(--text-2);font-family:var(--font-ui);font-size:var(--t-body);font-weight:590;cursor:pointer;"
                )}
              >
                No, dejarlo
              </button>
              <button
                onClick={() => {
                  setAbierto(false);
                  alConfirmar();
                }}
                style={css(
                  "padding:8px 15px;border-radius:980px;border:1px solid var(--red);background:var(--red);" +
                    "color:#fff;font-family:var(--font-ui);font-size:var(--t-body);font-weight:590;cursor:pointer;"
                )}
              >
                {confirmar}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
