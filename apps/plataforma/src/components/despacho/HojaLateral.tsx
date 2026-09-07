"use client";

/**
 * LA HOJA QUE SE ABRE POR EL LADO
 *
 * POR QUÉ EXISTE. El tablero de clientes y la rejilla de la agenda ocupan la
 * pantalla entera —cinco columnas, siete días—, y las dos necesitan enseñar
 * algo encima: la ficha de una persona, el detalle de una sesión, el hueco para
 * apuntar otra. Partir la pantalla en dos como antes ya no vale: dejaría el
 * tablero en tres columnas y medio y la semana en cuatro días.
 *
 * POR QUÉ POR EL LADO Y NO EN EL CENTRO. La ficha de una persona es larga —el
 * nombre, cómo va, las notas, su historia— y una ventana centrada obliga a
 * elegir entre una caja alta que se sale por arriba o una ancha que deja los
 * párrafos en renglones de cien caracteres. Pegada al lado derecho tiene toda
 * la altura de la ventana y un ancho de lectura, y además deja ver el tablero
 * al lado: se ve de dónde salió lo que se está mirando.
 *
 * En una pantalla estrecha ocupa el ancho entero, porque una hoja de 560 px en
 * un móvil de 390 no es una hoja lateral: es la pantalla con un borde inútil.
 *
 * LAS TRES SALIDAS. Escape, el clic en el velo y la × de la esquina. Son las
 * tres que prueba cualquiera sin pensar, y las mismas de `Confirmar` y de la
 * ficha del diccionario, para que todo lo que flota en esta casa se cierre
 * igual.
 *
 * Sale por un portal, colgada del `body`, y por el mismo motivo que la pregunta
 * de `Confirmar`: las tarjetas del tablero entran con `transform`, y dentro de
 * un contexto de apilamiento ningún `z-index` sirve de nada.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { CABECERA, NOTA } from "@/lib/ui";

export default function HojaLateral({
  abierta,
  cerrar,
  titulo,
  pie,
  children,
}: {
  abierta: boolean;
  cerrar: () => void;
  /** Lo que se está mirando: el nombre de la persona, «Apuntar una sesión». */
  titulo: string;
  /** La línea de debajo. Puede no haberla. */
  pie?: string;
  children: React.ReactNode;
}) {
  const [montado, setMontado] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion();

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => setMontado(true), []);

  /*
   * ESCAPE CIERRA LO DE ARRIBA DEL TODO, NO LA HOJA ENTERA.
   *
   * Dentro de la ficha hay preguntas de `Confirmar` —«¿borro esta nota?»— que
   * salen por su propio portal, colgadas del `body` y por encima de la hoja. Si
   * esto escuchara Escape sin mirar, la tecla con la que se cancela un borrado
   * cerraría además la ficha de la persona: se cancela una cosa y desaparecen
   * dos. Así que si hay otro diálogo abierto que no está dentro de esta hoja,
   * la tecla es suya y aquí no se hace nada.
   */
  useEffect(() => {
    if (!abierta) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const otro = [...document.querySelectorAll('[role="dialog"]')].some(
        (d) => d !== panel.current && !panel.current?.contains(d)
      );
      if (!otro) cerrar();
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [abierta, cerrar]);

  if (!montado) return null;

  return createPortal(
    <AnimatePresence>
      {abierta && (
        <motion.div
          data-chrome="1"
          onClick={cerrar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={css(
            /* El mismo velo cálido y desenfocado de la ficha del diccionario: lo
               de detrás se reconoce pero queda fuera de foco, que es lo que hace
               que una hoja se lea como una hoja encima y no como otra pantalla. */
            "position:fixed;inset:0;z-index:70;background:rgba(74,58,48,.22);" +
              "backdrop-filter:saturate(1.2) blur(14px);-webkit-backdrop-filter:saturate(1.2) blur(14px);" +
              "display:flex;justify-content:flex-end;"
          )}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            onClick={(e) => e.stopPropagation()}
            /* Entra deslizándose desde el borde por el que sale. Es el gesto que
               dice de dónde viene y hacia dónde se va al cerrarla. */
            initial={quieto ? { opacity: 0 } : { x: "100%" }}
            animate={quieto ? { opacity: 1 } : { x: 0 }}
            exit={quieto ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "width:min(580px,100%);height:100%;display:flex;flex-direction:column;min-width:0;" +
                "background:var(--surface);border-left:1px solid var(--border-strong);box-shadow:var(--shadow-lg);"
            )}
          >
            {/* La cabecera se queda quieta mientras el cuerpo se desplaza: en una
                ficha larga, saber de quién se está leyendo no puede depender de
                haber vuelto a subir. */}
            <div
              style={css(
                "flex:none;display:flex;align-items:flex-start;gap:var(--s3);padding:var(--pad-card) var(--pad-card) var(--s4);" +
                  "border-bottom:1px solid var(--border);background:var(--surface);"
              )}
            >
              <div style={css("min-width:0;flex:1;")}>
                <h2 style={css(CABECERA + "margin:0;font-size:var(--t-title);overflow-wrap:anywhere;")}>{titulo}</h2>
                {pie && <p style={css(NOTA + "margin:5px 0 0;")}>{pie}</p>}
              </div>
              {/* 44 px: la medida a partir de la cual un dedo acierta sin mirar. */}
              <button
                onClick={cerrar}
                aria-label="Cerrar"
                style={css(
                  "flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:980px;cursor:pointer;" +
                    "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-3);font-size:var(--t-title);line-height:1;"
                )}
              >
                ×
              </button>
            </div>

            <div style={css("flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:var(--pad-card);")}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
