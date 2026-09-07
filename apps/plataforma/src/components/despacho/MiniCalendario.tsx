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
 * Siempre seis filas, aunque el mes quepa en cinco. Si la cuadrícula cambiara
 * de alto, al pasar de febrero a marzo la página daría un salto y los filtros
 * de debajo se moverían de sitio bajo el dedo.
 */

import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { NOTA, rotulo } from "@/lib/ui";
import { claveDia, cuadriculaDelMes, diaLargo, mesYAno, INICIALES_DIA } from "@/lib/despacho";

export default function MiniCalendario({
  mes,
  elegido,
  conSesion,
  alElegir,
  alCambiarMes,
}: {
  /** Cualquier día del mes que se pinta. */
  mes: Date;
  /** El día marcado en granate: el que se está mirando en la rejilla. */
  elegido: Date;
  /** Las claves («2026-09-24») de los días que tienen alguna sesión. */
  conSesion: Set<string>;
  alElegir: (d: Date) => void;
  alCambiarMes: (pasos: number) => void;
}) {
  const dias = cuadriculaDelMes(mes);
  const hoy = claveDia(new Date());
  const marcado = claveDia(elegido);
  const quieto = useReducedMotion();

  const flecha = (paso: -1 | 1) => (
    <button
      onClick={() => alCambiarMes(paso)}
      aria-label={paso === 1 ? "El mes siguiente" : "El mes anterior"}
      style={css(
        "flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;cursor:pointer;" +
          "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-3);"
      )}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={paso === 1 ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"} />
      </svg>
    </button>
  );

  return (
    <div style={css("min-width:0;")}>
      <div style={css("display:flex;align-items:center;gap:var(--s2);margin-bottom:var(--s3);")}>
        {/* El mes va en el rótulo de la casa y no en un titular: aquí manda la
            cuadrícula, y un nombre de mes grande le robaría el sitio. */}
        <span style={css(rotulo("var(--gold)") + "flex:1;min-width:0;")}>{mesYAno(mes)}</span>
        {flecha(-1)}
        {flecha(1)}
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:2px;")}>
        {INICIALES_DIA.map((d, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={css(NOTA + "text-align:center;padding-bottom:4px;font-weight:600;color:var(--text-4);")}
          >
            {d}
          </span>
        ))}

        {dias.map((d) => {
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
                "position:relative;display:grid;place-items:center;aspect-ratio:1;border-radius:50%;cursor:pointer;" +
                  "font-size:var(--t-mini);font-variant-numeric:tabular-nums;line-height:1;" +
                  /* El borde se escribe entero en las tres ramas y nunca como un
                     `border-color` suelto detrás: mezclar la abreviada con una de
                     sus partes hace que React avise y que en algún repintado se
                     quede el aro de un día que ya no es hoy. */
                  (esElegido
                    ? /* Lo elegido, en granate: la misma regla de toda la casa. */
                      "border:1px solid var(--accion);background:var(--accion);color:var(--sobre-accion);font-weight:600;"
                    : esHoy
                      ? /* Hoy, cuando no es el día elegido, se marca con el aro
                           del oro: adorna y sitúa, pero no compite. */
                        "border:1px solid var(--border-accent);background:none;color:var(--text);font-weight:600;"
                      : "border:1px solid transparent;background:none;color:" +
                        (esDeEsteMes ? "var(--text-2)" : "var(--text-4)") +
                        ";")
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
                      /* Sobre el granate del día elegido, un punto dorado se
                         pierde: ahí el punto es del color de la tinta de encima. */
                      (esElegido ? "var(--sobre-accion)" : "var(--gold)") +
                      ";"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
