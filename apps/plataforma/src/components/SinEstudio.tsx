"use client";

/**
 * ============================================================================
 * «AQUÍ NO HAY NINGÚN ESTUDIO ABIERTO»
 * ============================================================================
 *
 * El panel, el estudio y la comparativa de pareja necesitan una carta calculada.
 * Si no la hay, hasta ahora pasaba esto: la dirección cambiaba sola a la raíz,
 * la cabecera pasaba a decir «Consulta» y aparecía un formulario en blanco. Sin
 * un cartel, sin una línea, sin nada.
 *
 * Y la conclusión razonable de quien lo ve no es «tengo que generar un estudio
 * primero»: es «el enlace está roto». Iris guarda /panel en favoritos, lo abre
 * por la mañana en un ordenador donde no ha trabajado antes —o después de
 * limpiar el navegador, que borra los estudios guardados— y se encuentra en
 * otra dirección con una pantalla vacía.
 *
 * La decisión de fondo era correcta: sin estudio no hay panel que enseñar. Lo
 * que faltaba era CONTARLO, y no mover a nadie de sitio por debajo. Ahora la
 * dirección se queda donde estaba —así el enlace guardado sigue siendo válido y
 * recargar después de generar el estudio lleva a donde se quería ir— y en su
 * lugar sale esto, con el botón que lleva al único sitio del que puede salir
 * un estudio.
 */

import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { botonPrincipal } from "@/lib/ui";
import Particulas from "./Particulas";

/** Cómo se llama cada pantalla cuando hay que decir a cuál se ha llegado. */
const NOMBRE: Record<string, string> = {
  panel: "El panel",
  estudio: "El documento",
  pareja: "La comparativa de pareja",
};

export default function SinEstudio({ vista }: { vista: string }) {
  const { setView } = useApp();
  const quieto = useReducedMotion();

  return (
    <motion.div
      initial={quieto ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={css(
        "position:relative;overflow:hidden;isolation:isolate;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:clamp(40px,8vw,84px) var(--pad-card);text-align:center;box-shadow:var(--nm-alto);"
      )}
    >
      <div style={css("position:absolute;inset:0;z-index:0;pointer-events:none;")} aria-hidden>
        <Particulas cantidad={22} />
      </div>
      <div style={css("position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:var(--s3);")}>
        <span
          style={css(
            "display:inline-flex;align-items:center;gap:7px;padding:6px 14px;border-radius:980px;background:var(--gold-soft);color:var(--gold-deep);font-size:var(--t-mini);font-weight:590;"
          )}
        >
          {NOMBRE[vista] ?? "Esta pantalla"} necesita un estudio
        </span>
        <h2 style={css("font-size:var(--t-head);margin:var(--s2) 0 0;")}>
          Todavía no hay ningún estudio abierto
        </h2>
        <p style={css("font-size:var(--t-read);line-height:1.6;color:var(--text-3);margin:0;max-width:52ch;text-wrap:pretty;")}>
          Esta pantalla lee la carta de una persona, así que primero hay que calcularla. Los estudios se guardan en este
          navegador: si has entrado desde otro equipo, o has limpiado el navegador, no están aquí.
        </p>
        <button onClick={() => setView("inicio")} style={css(botonPrincipal() + "margin-top:var(--s2);")}>
          Ir a la consulta
        </button>
        <p style={css("font-size:var(--t-mini);color:var(--text-4);margin:0;max-width:46ch;")}>
          La dirección no se ha movido: en cuanto generes el estudio, este enlace vuelve a funcionar.
        </p>
      </div>
    </motion.div>
  );
}
