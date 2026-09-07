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
 *
 * Y UNA CUARTA, QUE NO ES DE DISEÑO SINO DE PINTADO.
 *
 * La pregunta sale por un portal, colgada del `body`, y no dentro de la tarjeta
 * que la dispara. No es una filigrana: las tarjetas entran con la cascada de
 * `[data-cascada]`, y esa animación deja puesto un `transform` —una matriz
 * identidad, pero un `transform`— que crea un contexto de apilamiento. Dentro
 * de él, ningún `z-index` sirve para nada: la tarjeta siguiente, que va después
 * en el documento, se pintaba ENCIMA de la pregunta y se comía el botón de
 * confirmar. Preguntar y que la respuesta no se pueda pulsar es peor que no
 * preguntar.
 *
 * Al salir del árbol de la tarjeta hay que colocarla a mano contra la ventana,
 * que es lo que hacen `sitio` y `coloca`.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  /* El portal necesita el `body`, y en el servidor no lo hay: estas páginas se
     generan estáticas. Hasta que esto no está montado en un navegador, la
     pregunta sencillamente no existe — y no puede existir, porque para verla
     hay que haber pulsado. */
  const [montado, setMontado] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  const globo = useRef<HTMLDivElement>(null);
  const no = useRef<HTMLButtonElement>(null);
  const quieto = useReducedMotion();

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => setMontado(true), []);

  /** Dónde se planta la pregunta, medido contra la ventana. */
  const [sitio, setSitio] = useState<{ top: number; left: number; ancho: number }>({ top: 0, left: 0, ancho: 260 });

  /**
   * Se mide el botón y se coloca la pregunta debajo, o encima si abajo no cabe:
   * en el pie de una tarjeta larga, la pregunta se salía por debajo de la
   * ventana y había que adivinar que estaba ahí.
   */
  const coloca = useCallback(() => {
    const b = caja.current?.getBoundingClientRect();
    if (!b) return;
    const ancho = Math.min(320, Math.max(260, b.width), window.innerWidth - 24);
    const alto = globo.current?.offsetHeight ?? 210;
    const cabeDebajo = b.bottom + 8 + alto <= window.innerHeight - 12;
    // Hacia qué lado se abre lo dice quien la usa, según dónde esté el botón.
    const bruto = alineado === "derecha" ? b.right - ancho : b.left;
    return setSitio({
      top: cabeDebajo ? b.bottom + 8 : Math.max(12, b.top - 8 - alto),
      // Y nunca fuera de la ventana: en un móvil, un botón pegado al borde
      // dejaría la mitad de la pregunta cortada.
      left: Math.min(Math.max(12, bruto), window.innerWidth - ancho - 12),
      ancho,
    });
  }, [alineado]);

  /* Se coloca antes de pintarla —con `useLayoutEffect`— para que no se vea un
     fotograma en la esquina de arriba antes de saltar a su sitio. */
  useLayoutEffect(() => {
    if (abierto) coloca();
  }, [abierto, coloca]);

  /* Escape cierra y el clic fuera cierra: las dos salidas que cualquiera prueba
     sin pensar. Y al abrir, el foco va al «No» — así el Enter de quien viene
     tecleando cancela en vez de destruir. */
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      const d = e.target as Node;
      // Dos cajas y no una: con el portal, la pregunta ya no está dentro del
      // botón. Si sólo se mirara el botón, pulsar «No» contaría como clic fuera
      // y la pregunta se cerraría antes de que llegara el clic.
      if (caja.current?.contains(d) || globo.current?.contains(d)) return;
      setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    // La pregunta está fija a la ventana; si la página se mueve por debajo, hay
    // que volver a colocarla o se queda flotando lejos de su botón.
    const mueve = () => coloca();
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    window.addEventListener("scroll", mueve, true);
    window.addEventListener("resize", mueve);
    no.current?.focus();
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
      window.removeEventListener("scroll", mueve, true);
      window.removeEventListener("resize", mueve);
    };
  }, [abierto, coloca]);

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

      {montado &&
        createPortal(
      <AnimatePresence>
        {abierto && (
          <motion.div
            ref={globo}
            role="dialog"
            aria-label={pregunta}
            initial={quieto ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={quieto ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "position:fixed;z-index:120;top:" +
                sitio.top +
                "px;left:" +
                sitio.left +
                "px;width:" +
                sitio.ancho +
                "px;" +
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
      </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
