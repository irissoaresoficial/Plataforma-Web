"use client";

/**
 * EL CALENDARIO PEQUEÑO
 *
 * Para qué está: para saltar de semana sin ir dando a la flecha seis veces, y
 * —lo que más se usa— para ver de un vistazo qué días del mes tienen algo.
 * El punto debajo de un número contesta «¿tengo hueco el jueves 24?» sin abrir
 * esa semana, que es la pregunta que se hace por teléfono mientras alguien
 * espera al otro lado.
 *
 * VA EN EL BLOQUE VINO (noviembre de 2026). Es la pieza oscura que ancla la
 * agenda —una por pantalla, MARCA.md—, como el mes en panel oscuro de la
 * referencia que pasó Ger. Encima: hoy en el círculo de oro vivo, el día
 * elegido en un aro claro y la semana que se está mirando en una píldora que
 * cruza la fila entera.
 *
 * Siempre seis filas, aunque el mes quepa en cinco. Si la cuadrícula cambiara
 * de alto, al pasar de febrero a marzo la página daría un salto y lo de debajo
 * se movería de sitio bajo el dedo. PLEGADO (en el móvil) enseña sólo la fila
 * de la semana elegida: el mes entero se abre con su botón.
 */

import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { claveDia, cuadriculaDelMes, diaLargo, mesYAno, INICIALES_DIA } from "@/lib/despacho";

export default function MiniCalendario({
  mes,
  elegido,
  conSesion,
  alElegir,
  alCambiarMes,
  semana = false,
  plegado = false,
  alPlegar,
}: {
  /** Cualquier día del mes que se pinta. */
  mes: Date;
  /** El día que se está mirando en la rejilla. */
  elegido: Date;
  /** Las claves («2026-09-24») de los días que tienen alguna sesión. */
  conSesion: Set<string>;
  alElegir: (d: Date) => void;
  alCambiarMes: (pasos: number) => void;
  /** Si se está viendo la semana: entonces su fila entera va en píldora. */
  semana?: boolean;
  /** Sólo la fila de la semana elegida. */
  plegado?: boolean;
  /** Si llega, sale el botón de abrir y cerrar el mes. */
  alPlegar?: () => void;
}) {
  const dias = cuadriculaDelMes(mes);
  const hoy = claveDia(new Date());
  const marcado = claveDia(elegido);
  const quieto = useReducedMotion();

  const filas = Array.from({ length: Math.ceil(dias.length / 7) }, (_, i) => dias.slice(i * 7, i * 7 + 7));
  const visibles = plegado ? filas.filter((f) => f.some((d) => claveDia(d) === marcado)) : filas;

  const flecha = (paso: -1 | 1) => (
    <button
      onClick={() => alCambiarMes(paso)}
      aria-label={paso === 1 ? "El mes siguiente" : "El mes anterior"}
      style={css(
        "flex:none;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;cursor:pointer;" +
          "border:1px solid var(--bloque-borde);background:var(--bloque-2);color:var(--sobre-bloque);"
      )}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={paso === 1 ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"} />
      </svg>
    </button>
  );

  return (
    <div style={css("min-width:0;color:var(--sobre-bloque);")}>
      <div style={css("display:flex;align-items:center;gap:var(--s2);margin-bottom:var(--s3);")}>
        <span style={css("flex:1;min-width:0;font-size:var(--t-body);font-weight:500;letter-spacing:-.01em;")}>
          {mesYAno(mes).replace(" de ", " ").replace(/^./, (c) => c.toLocaleUpperCase("es"))}
        </span>
        {alPlegar ? (
          <button
            onClick={alPlegar}
            aria-expanded={!plegado}
            style={css(
              "flex:none;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:var(--r-pill);cursor:pointer;font-family:inherit;" +
                "font-size:var(--t-mini);font-weight:500;border:1px solid var(--bloque-borde);background:var(--bloque-2);color:var(--sobre-bloque);"
            )}
          >
            {plegado ? "Ver el mes" : "Plegar"}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={css(plegado ? "" : "transform:rotate(180deg);")}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        ) : null}
        {!plegado && flecha(-1)}
        {!plegado && flecha(1)}
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:2px;")}>
        {INICIALES_DIA.map((d, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={css("text-align:center;padding-bottom:6px;font-size:var(--t-micro);font-weight:500;color:var(--sobre-bloque-2);")}
          >
            {d}
          </span>
        ))}
      </div>

      <div style={css("display:flex;flex-direction:column;gap:2px;")}>
        {visibles.map((fila) => {
          const esLaSemana = semana && fila.some((d) => claveDia(d) === marcado);
          return (
            <div
              key={claveDia(fila[0])}
              style={css(
                "display:grid;grid-template-columns:repeat(7,1fr);gap:2px;border-radius:var(--r-pill);" +
                  /* La semana que se está mirando, en una píldora clara que
                     cruza la fila: es la barra de la referencia. */
                  (esLaSemana ? "background:rgba(251,246,238,.14);box-shadow:inset 0 0 0 1px var(--bloque-borde);" : "")
              )}
            >
              {fila.map((d) => {
                const k = claveDia(d);
                const esDeEsteMes = d.getMonth() === mes.getMonth();
                const esHoy = k === hoy;
                const esElegido = k === marcado;
                const tiene = conSesion.has(k);
                return (
                  <button
                    key={k}
                    onClick={() => alElegir(d)}
                    aria-label={diaLargo(d) + (tiene ? ", con sesiones" : "")}
                    aria-current={esElegido ? "date" : undefined}
                    style={css(
                      "position:relative;display:grid;place-items:center;aspect-ratio:1;max-height:40px;width:100%;border-radius:50%;cursor:pointer;font-family:inherit;" +
                        "font-size:var(--t-mini);font-variant-numeric:tabular-nums;line-height:1;" +
                        (esHoy
                          ? /* Hoy, en el oro vivo: lo que antes se busca. */
                            "border:1px solid var(--cita-hoy);background:var(--cita-hoy);color:var(--cita-hoy-tx);font-weight:500;"
                          : esElegido
                            ? "border:1.5px solid var(--sobre-bloque);background:none;color:var(--sobre-bloque);font-weight:500;"
                            : "border:1px solid transparent;background:none;color:" +
                              (esDeEsteMes ? "var(--sobre-bloque)" : "var(--sobre-bloque-2)") +
                              ";" +
                              (esDeEsteMes ? "" : "opacity:.6;"))
                    )}
                  >
                    {d.getDate()}
                    {tiene && (
                      <motion.span
                        aria-hidden="true"
                        initial={quieto ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        style={css(
                          "position:absolute;bottom:3px;left:50%;margin-left:-2px;width:4px;height:4px;border-radius:50%;background:" +
                            (esHoy ? "var(--cita-hoy-tx)" : "var(--cita-hoy)") +
                            ";"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
