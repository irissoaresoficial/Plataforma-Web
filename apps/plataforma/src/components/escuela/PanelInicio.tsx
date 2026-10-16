"use client";

/**
 * ============================================================================
 * EL INICIO DE IRIS — «¿A QUIÉN ESTUDIAMOS HOY?»
 * ============================================================================
 *
 * AQUÍ HABÍA UN PANEL DE GRÁFICAS CON NÚMEROS INVENTADOS. Gerson los pidió
 * así para poder ver la pantalla antes de que hubiera escuela que medir, y
 * iban con un cartel encima diciendo que eran mentira. Cumplieron su función
 * y se van: «el inicio ya puedes quitar los datos».
 *
 * Y en su sitio, lo que él pidió a cambio: «al inicio quería como que dijera
 * qué persona o empresa estudiaremos el día de hoy».
 *
 * POR QUÉ ESO ES MEJOR QUE UN PANEL, y no sólo distinto.
 * ---------------------------------------------------------------------------
 * Un panel contesta «¿cómo va la cosa?». Es una buena pregunta, pero no es la
 * que se hace nadie al abrir una herramienta de trabajo por la mañana: la que
 * se hace es «¿qué hago ahora?». Y lo que hace Iris, lo que de verdad ocupa su
 * día, es levantar la carta de alguien.
 *
 * Una pantalla de inicio que contesta «¿cómo va la cosa?» se mira dos semanas
 * y se deja de mirar, porque la respuesta casi nunca cambia de un día para
 * otro. Una que contesta «¿a quién estudiamos hoy?» se usa todos los días,
 * porque la respuesta cambia todos los días.
 *
 * Los números siguen existiendo y no se han perdido: viven en Métricas, que es
 * donde se va cuando uno quiere mirar cómo va la escuela. Separados, cada
 * pantalla hace una cosa y la hace entera.
 *
 * LO QUE SÍ SE QUEDA AQUÍ, y por qué cada cosa:
 *
 *   · LA PREGUNTA, y dos puertas: una persona o una empresa. Son dos motores
 *     distintos —una empresa no tiene fecha de nacimiento— así que elegir
 *     antes ahorra un formulario que no encaja.
 *   · LO ÚLTIMO QUE TOCÓ. Casi nunca se abre una carta una sola vez: se mira,
 *     se escribe encima, se vuelve al día siguiente. Tenerlas a un clic es lo
 *     que evita volver a escribir un nombre y una fecha que ya están dentro.
 *   · Y NADA MÁS. Un inicio con seis cosas no es un inicio, es otro menú.
 */

import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { CABECERA, NOTA, TITULO, botonPrincipal, BOTON_NORMAL } from "@/lib/ui";
import { useApp } from "@/lib/app-context";
import type { HistItem } from "@/lib/storage";

/** Cuántos estudios recientes caben antes de que esto deje de ser un atajo y
 *  pase a ser una lista. Los demás están en la consulta, enteros. */
const A_MANO = 6;

export default function PanelInicio({ nombre }: { nombre: string }) {
  const quieto = useReducedMotion();
  const { hist, abrir, setView, set } = useApp();

  /** Empieza una carta nueva: se elige el tipo y se va a la consulta con el
   *  formulario en blanco y ese tipo ya puesto. */
  const empieza = (tipo: "persona" | "empresa") => {
    set("tipo", tipo);
    setView("inicio");
  };

  const tarjeta =
    "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
    "box-shadow:var(--nm);padding:var(--pad-card);";

  /** El saludo cambia con la hora. Es un detalle y es la diferencia entre una
   *  herramienta y una herramienta que parece tuya. */
  const hora = new Date().getHours();
  const saludo = hora < 6 ? "Buenas noches" : hora < 13 ? "Buenos días" : hora < 21 ? "Buenas tardes" : "Buenas noches";
  const pila = nombre.trim().split(/\s+/)[0] || "";

  const recientes = hist.slice(0, A_MANO);

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s6);")}>
      {/* ------------------------------------------------------- la pregunta */}
      <motion.section
        initial={quieto ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={css(tarjeta + "padding:clamp(28px,5vw,52px) var(--pad-card);")}
      >
        <div style={css(NOTA + "margin-bottom:10px;")}>
          {saludo}
          {pila ? `, ${pila}` : ""}
        </div>
        <h1 style={css(TITULO + "margin:0;max-width:20ch;")}>¿Qué persona o empresa estudiamos hoy?</h1>
        <p style={css(NOTA + "margin:var(--s3) 0 var(--s4);line-height:1.55;max-width:52ch;")}>
          Elige qué es y escribe el nombre. Lo demás —la carta, el árbol, el documento— sale solo.
        </p>
        <div style={css("display:flex;gap:var(--s3);flex-wrap:wrap;")}>
          <button onClick={() => empieza("persona")} style={css(botonPrincipal())}>
            Una persona
          </button>
          {/* Una empresa va en el botón normal y no en otro granate: son dos
              caminos, pero el de todos los días es el primero, y dos botones
              igual de fuertes obligan a decidir antes de haber decidido. */}
          <button onClick={() => empieza("empresa")} style={css(BOTON_NORMAL)}>
            Una empresa
          </button>
        </div>
      </motion.section>

      {/* ---------------------------------------------------- lo último */}
      {recientes.length > 0 && (
        <section>
          <h2 style={css(CABECERA + "margin:0 0 var(--s3);font-size:var(--t-head);")}>Lo último que miraste</h2>
          <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fill,minmax(230px,1fr));")}>
            {recientes.map((h: HistItem, i: number) => (
              <motion.button
                key={h.id}
                initial={quieto ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={quieto ? undefined : { y: -2 }}
                onClick={() => abrir(h)}
                style={css(
                  tarjeta +
                    "padding:var(--s4);text-align:left;cursor:pointer;font-family:inherit;" +
                    "display:flex;flex-direction:column;gap:5px;transition:border-color var(--t-normal);"
                )}
              >
                <span
                  style={css(
                    "font-size:var(--t-body);font-weight:600;color:var(--text);line-height:1.3;overflow-wrap:anywhere;"
                  )}
                >
                  {h.nombre}
                </span>
                {/* Una empresa no trae fecha, y entonces no se escribe un
                    renglón vacío: se dice lo que es. */}
                <span style={css(NOTA)}>{h.fecha || "Empresa"}</span>
              </motion.button>
            ))}
          </div>
          <p style={css(NOTA + "margin:var(--s3) 0 0;")}>
            Las demás están en Consulta, con su buscador.
          </p>
        </section>
      )}
    </div>
  );
}
