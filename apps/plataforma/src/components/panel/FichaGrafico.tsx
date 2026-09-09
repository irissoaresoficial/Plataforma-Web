"use client";

/**
 * ============================================================================
 * LA FICHA DE UN GRÁFICO — CRISTAL POR ENCIMA DEL DIBUJO
 * ============================================================================
 *
 * Los dos gráficos de la plataforma —la rejilla de base 22 y el Árbol de la
 * Vida— tienen el mismo problema: son bonitos y no dicen nada por sí solos. Un
 * círculo con un 17 dentro no explica qué es un 17 ni por qué es 17.
 *
 * Antes eso se resolvía con una tarjeta DEBAJO del dibujo, y estaba mal por una
 * razón sencilla: para leerla había que bajar, y al bajar se perdía de vista el
 * círculo que se acababa de pulsar. Se leía la explicación de algo que ya no se
 * veía.
 *
 * Ahora se abre encima, sobre cristal: el dibujo sigue ahí detrás, desenfocado
 * pero reconocible, y se cierra con Escape, con la ×, tocando fuera o —en el
 * móvil— empujando la hoja hacia abajo. Y no hay que cerrarla para mirar la
 * siguiente casilla: las flechas de abajo recorren el gráfico entero sin salir.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ CRISTAL Y RELIEVE, Y NO UNA TARJETA MÁS
 * ---------------------------------------------------------------------------
 * La plataforma entera está hecha de tarjetas opacas que se apoyan en el papel.
 * Si esto fuera otra tarjeta opaca, se leería como otra pantalla. El cristal
 * dice «esto está POR ENCIMA de lo que estabas mirando, y lo que estabas
 * mirando sigue ahí»; es la única pieza de la plataforma que lo dice, y por eso
 * puede permitírselo sin que se convierta en un efecto de moda repetido.
 *
 * El número va hundido en un disco —relieve hacia dentro, `--nm-hondo`— y no
 * dibujado encima. Es el mismo lenguaje de los campos de formulario: lo que se
 * hunde es contenido, lo que sobresale es acción. Aquí el número es el dato y
 * los botones son la acción, y se distinguen sin leerlos.
 *
 * Todo sale de las variables de la casa (`--vidrio`, `--nm-hondo`, `--gold`),
 * así que en oscuro no hay nada que ajustar: el cristal se vuelve humo y el
 * relieve cambia de lado él solo.
 */

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";

/** Un renglón de la cuenta: «Personalidad profunda 20». */
export type Pieza = { label: string; valor: number | string };

/** Un bloque de texto con su rótulo, debajo del cuerpo. */
export type Bloque = { label: string; texto: string; tono?: "normal" | "oro" | "rojo" };

export type Contenido = {
  /** Sirve de `key`: al cambiar, la hoja repinta su contenido. */
  k: string;
  /** El rótulo pequeño de arriba: «La casilla», «Sendero del árbol». */
  etiqueta: string;
  titulo: string;
  /** La sigla o el número de arcano, a la derecha del título. */
  apunte?: string;
  /** El número grande, hundido en su disco. */
  valor?: number | string | null;
  /** El pie del disco: «en base 9, un 5». */
  valorPie?: string;
  /** La cuenta, si la hay: piezas, signo y resultado. */
  cuenta?: { pasos: Pieza[]; op: "+" | "−" | ""; bruto?: number; redujo?: boolean } | null;
  /** Una línea en cursiva bajo el título: el lema del arcano. */
  lema?: string;
  /** El texto largo. */
  cuerpo?: string;
  /** Lo que va después del cuerpo, con su rótulo. */
  bloques?: Bloque[];
  /** El color de acento de esta ficha. Por defecto, el oro de la casa. */
  color?: string;
};

type Props = {
  contenido: Contenido | null;
  alCerrar: () => void;
  /** Recorrer el gráfico sin cerrar. Si faltan, no salen las flechas. */
  alAnterior?: () => void;
  alSiguiente?: () => void;
  /** «3 de 19», para saber por dónde se va. */
  posicion?: { i: number; total: number };
};

const sinSuscripcion = () => () => {};
const enElNavegador = () => true;
const enElServidor = () => false;

/**
 * VA COLGADA DEL <body>, Y TIENE QUE IR AHÍ.
 *
 * La hoja se pinta con `position:fixed`, o sea, respecto a la pantalla. Pero
 * «respecto a la pantalla» deja de ser verdad en cuanto un antepasado tiene
 * `transform` — y los tiene: las secciones del panel entran con una animación
 * de framer-motion, que es exactamente eso. El resultado era una hoja anclada
 * al trozo de página donde estaba el dibujo: el velo empezaba a media pantalla
 * y dejaba la cabecera nítida y sin cubrir.
 *
 * No se arregla desde el CSS. Se arregla sacándola del árbol de la sección y
 * colgándola del <body>, que es lo que hace el portal.
 */
export default function FichaGrafico({ contenido, alCerrar, alAnterior, alSiguiente, posicion }: Props) {
  /* En el servidor no hay <body> al que colgarse, así que hay que esperar al
     navegador. Se pregunta con `useSyncExternalStore` —que devuelve `false` al
     pintar en el servidor y `true` en el navegador— y no con un `useState` que
     se enciende dentro de un efecto: React desaconseja lo segundo, y con razón,
     porque provoca un segundo pintado de toda la sección por cada ficha. */
  const enCliente = useSyncExternalStore(sinSuscripcion, enElNavegador, enElServidor);
  if (!enCliente) return null;

  return createPortal(
    <AnimatePresence>
      {contenido && (
        <Hoja
          key="ficha"
          contenido={contenido}
          alCerrar={alCerrar}
          alAnterior={alAnterior}
          alSiguiente={alSiguiente}
          posicion={posicion}
        />
      )}
    </AnimatePresence>,
    document.body
  );
}

function Hoja({ contenido, alCerrar, alAnterior, alSiguiente, posicion }: Props & { contenido: Contenido }) {
  const quieto = useReducedMotion();
  const caja = useRef<HTMLDivElement>(null);
  const color = contenido.color || "var(--gold)";

  /* Escape cierra y las flechas recorren. Son las tres teclas que prueba
     cualquiera sin pensarlo, y una ficha que no las escucha se siente rota. */
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") return alCerrar();
      if (e.key === "ArrowLeft" && alAnterior) return alAnterior();
      if (e.key === "ArrowRight" && alSiguiente) return alSiguiente();
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [alCerrar, alAnterior, alSiguiente]);

  /* El foco entra en la hoja al abrirse: si se queda en el círculo del dibujo,
     que ahora está detrás del cristal, el lector de pantalla sigue leyendo el
     gráfico y el teclado sigue moviéndose por él. */
  useEffect(() => {
    caja.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.div
      data-chrome="1"
      className="ficha-velo"
      onClick={alCerrar}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-label={contenido.titulo}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        /* En el móvil sube desde abajo como una hoja; en pantalla ancha se
           centra. Es la misma pieza: sólo cambia de dónde entra, y eso lo
           deciden las clases de globals.css, no dos componentes distintos. */
        className="ficha-grafico"
        initial={quieto ? false : { opacity: 0, y: 26, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={quieto ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.995 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      >
        {/* El asidero del móvil. En pantalla ancha se oculta desde el CSS: en
            un ratón no significa nada y sólo roba un renglón. */}
        <span className="ficha-asa" aria-hidden />

        <button
          onClick={alCerrar}
          aria-label="Cerrar"
          className="ficha-cerrar"
          style={css(
            "position:absolute;top:14px;right:14px;display:grid;place-items:center;width:40px;height:40px;border-radius:980px;border:1px solid var(--vidrio-borde);background:var(--vidrio);color:var(--text-2);font-size:20px;line-height:1;cursor:pointer;box-shadow:var(--nm-alto);"
          )}
        >
          ×
        </button>

        {/* --------------------------------------------- LA CABEZA, QUIETA
            El nombre y el número no se van con el rodillo: con un arcano de
            cuatro mil caracteres, a la mitad del texto ya no se sabe de qué
            carta se está leyendo. */}
        <div className="ficha-cabeza">
          <div style={css("display:flex;align-items:flex-start;gap:var(--s4);padding-right:44px;")}>
            <div style={css("min-width:0;flex:1;")}>
              <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:4px;")}>
                {contenido.etiqueta}
              </div>
              <h2
                style={css(
                  "font-family:var(--font-display);font-weight:500;font-size:var(--t-head);line-height:1.16;letter-spacing:-.018em;color:var(--text);margin:0;text-wrap:balance;"
                )}
              >
                {contenido.titulo}
              </h2>
              {contenido.apunte && (
                <div style={css("font-size:var(--t-mini);color:var(--text-4);letter-spacing:.04em;margin-top:6px;")}>
                  {contenido.apunte}
                </div>
              )}
              {contenido.lema && (
                <div style={css("font-size:var(--t-read);line-height:1.4;color:" + color + ";margin-top:8px;")}>
                  {contenido.lema}
                </div>
              )}
            </div>

            {contenido.valor !== undefined && contenido.valor !== null && (
              <div style={css("flex:none;display:flex;flex-direction:column;align-items:center;gap:6px;")}>
                <div
                  style={css(
                    "width:84px;height:84px;border-radius:980px;display:grid;place-items:center;background:var(--surface-2);box-shadow:var(--nm-hondo);font-family:var(--font-ui);font-weight:600;font-size:34px;line-height:1;color:" +
                      color +
                      ";"
                  )}
                >
                  {contenido.valor}
                </div>
                {contenido.valorPie && (
                  <span style={css("font-size:var(--t-mini);color:var(--text-4);text-align:center;")}>
                    {contenido.valorPie}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="ficha-cuerpo">
          {/* ------------------------------------------------------ la cuenta
              Enseñada como se hace en clase, con el bruto antes de reducir: el
              «39 → 12» es justo el paso que la gente falla, y esconderlo
              convierte una escuela en una calculadora. */}
          {contenido.cuenta && contenido.cuenta.pasos.length > 0 && (
            <div
              style={css(
                "display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:var(--s3) var(--s3);border-radius:var(--r);background:var(--surface-2);box-shadow:var(--nm-hondo);"
              )}
            >
              {contenido.cuenta.pasos.map((p, i) => (
                <span key={i} style={css("display:contents;")}>
                  {i > 0 && contenido.cuenta!.op && (
                    <span style={css("font-size:var(--t-title);color:var(--text-4);font-weight:400;")}>
                      {contenido.cuenta!.op}
                    </span>
                  )}
                  <span
                    style={css(
                      "display:inline-flex;align-items:baseline;gap:6px;padding:5px 11px;border-radius:980px;background:var(--surface);border:1px solid var(--border);white-space:nowrap;"
                    )}
                  >
                    <span style={css("font-size:var(--t-mini);color:var(--text-3);")}>{p.label}</span>
                    <b style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-body);color:var(--text);")}>
                      {p.valor}
                    </b>
                  </span>
                </span>
              ))}
              {/* El resultado va en una sola pieza que no se parte: «= 36 → 9»
                  cortado entre la flecha y el 9 se lee como dos cuentas. */}
              {contenido.cuenta.bruto !== undefined && (
                <span style={css("display:inline-flex;align-items:baseline;gap:8px;white-space:nowrap;")}>
                  <span style={css("font-size:var(--t-title);color:var(--text-4);font-weight:400;")}>=</span>
                  <b style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-body);color:var(--text-2);")}>
                    {contenido.cuenta.bruto}
                  </b>
                  {contenido.cuenta.redujo && (
                    <>
                      <span style={css("font-size:var(--t-body);color:var(--text-4);")}>→</span>
                      <b style={css("font-family:var(--font-ui);font-weight:600;font-size:var(--t-body);color:" + color + ";")}>
                        {contenido.valor}
                      </b>
                    </>
                  )}
                </span>
              )}
            </div>
          )}

          {/* --------------------------------------------------- el texto */}
          {contenido.cuerpo && (
            <p
              style={css(
                "font-size:var(--t-read);line-height:1.62;color:var(--text-2);margin:0;text-wrap:pretty;white-space:pre-line;"
              )}
            >
              {contenido.cuerpo}
            </p>
          )}

          {(contenido.bloques || []).map((b, i) => (
            <div
              key={i}
              style={css(
                b.tono === "normal" || !b.tono
                  ? "border-top:1px solid var(--border);padding-top:var(--s3);"
                  : "border-left:2px solid " +
                    (b.tono === "rojo" ? "var(--red)" : "var(--gold)") +
                    ";padding-left:var(--s3);"
              )}
            >
              <div
                style={css(
                  "font-size:var(--t-mini);font-weight:590;margin-bottom:4px;color:" +
                    (b.tono === "rojo" ? "var(--red)" : b.tono === "oro" ? "var(--gold)" : "var(--text-3)") +
                    ";"
                )}
              >
                {b.label}
              </div>
              <p style={css("font-size:var(--t-body);line-height:1.56;color:var(--text-3);margin:0;text-wrap:pretty;")}>
                {b.texto}
              </p>
            </div>
          ))}

        </div>

        {/* ----------------------------------------------- EL PIE, QUIETO
            «Siguiente» siempre a mano. Si estuviera al final del texto habría
            que rodar cuatro pantallas para pasar de arcano, que es justo lo que
            esta ficha vino a quitar. */}
        {(alAnterior || alSiguiente) && (
          <div className="ficha-pie">
            <Flecha alPulsar={alAnterior} etiqueta="Anterior" signo="‹" />
            <Flecha alPulsar={alSiguiente} etiqueta="Siguiente" signo="›" />
            {posicion && (
              <span style={css("margin-left:auto;font-size:var(--t-mini);color:var(--text-4);")}>
                {posicion.i} de {posicion.total}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function Flecha({ alPulsar, etiqueta, signo }: { alPulsar?: () => void; etiqueta: string; signo: string }) {
  return (
    <button
      onClick={alPulsar}
      disabled={!alPulsar}
      aria-label={etiqueta}
      style={css(
        "display:grid;place-items:center;width:44px;height:44px;border-radius:980px;border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);font-size:20px;line-height:1;box-shadow:var(--nm-alto);cursor:" +
          (alPulsar ? "pointer" : "not-allowed") +
          ";opacity:" +
          (alPulsar ? "1" : ".4") +
          ";"
      )}
    >
      {signo}
    </button>
  );
}
