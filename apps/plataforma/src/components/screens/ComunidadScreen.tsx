"use client";

/**
 * ============================================================================
 * LA COMUNIDAD
 * ============================================================================
 *
 * Lo que hace que la gente vuelva cuando ya ha visto los vídeos. Un curso se
 * termina; una comunidad no. Por eso esto no es un añadido: es lo que sostiene
 * una membresía que se cobra todos los meses.
 *
 * LAS DECISIONES DE FORMA, QUE AQUÍ SON DECISIONES DE FONDO
 * ---------------------------------------------------------------------------
 *
 * 1. SE ESCRIBE ARRIBA DEL TODO, Y EL CAJÓN ESTÁ ABIERTO.
 *    Un botón de «nuevo tema» esconde la acción detrás de un clic y de una
 *    pantalla nueva, y eso basta para que no se escriba. Con el cajón a la
 *    vista, escribir es lo primero que se puede hacer al entrar.
 *
 * 2. LOS TEMAS SE ORDENAN POR ÚLTIMA RESPUESTA, no por fecha de creación.
 *    Una comunidad que ordena por creación entierra las conversaciones vivas
 *    debajo de las muertas. Lo que hay que ver al entrar es dónde se está
 *    hablando ahora.
 *
 * 3. NO HAY «ME GUSTA», HAY RESPUESTAS.
 *    Un contador de corazones premia lo que gusta; en una escuela donde la
 *    gente cuenta cosas difíciles de su familia, lo que hay que premiar es que
 *    alguien conteste. Las reacciones están, pero pequeñas y detrás.
 *
 * 4. LO FIJADO SE VE DISTINTO Y VA PRIMERO.
 *    Es por donde Iris dice las cosas que todos tienen que leer. Si se mezclara
 *    con el resto, se perdería en dos días.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, CAMPO, CABECERA, LECTURA, NOTA, TITULO, botonPrincipal } from "@/lib/ui";
import Muestra from "../escuela/Muestra";

type Tema = {
  id: string;
  autor: string;
  esIris?: boolean;
  fijado?: boolean;
  cuando: string;
  titulo: string;
  texto: string;
  respuestas: number;
  reacciones: number;
};

const EJEMPLO: Tema[] = [
  {
    id: "f",
    autor: "Iris Soares",
    esIris: true,
    fijado: true,
    cuando: "hace 2 días",
    titulo: "Cómo funciona esto y qué se puede preguntar aquí",
    texto:
      "Bienvenida a la comunidad. Aquí se pregunta cualquier duda de los cursos, se comparten lecturas y se cuenta lo que vais viendo en vuestras familias. Un par de normas: lo que se cuenta aquí no sale de aquí, y nadie interpreta la carta de otro sin que lo pida.",
    respuestas: 14,
    reacciones: 31,
  },
  {
    id: "1",
    autor: "Carmen Aledo",
    cuando: "hace 3 h",
    titulo: "El 11 y el 2 en la misma carta: ¿cómo se lee?",
    texto:
      "Estoy con la carta de mi madre y me salen los dos. Entiendo que el 11 no se reduce, pero en la casa de los ciclos me cuadra mejor el 2. ¿Alguien lo ha trabajado?",
    respuestas: 7,
    reacciones: 4,
  },
  {
    id: "2",
    autor: "Lucía Ferrer",
    cuando: "ayer",
    titulo: "Terminé el módulo 1 y tengo que contar una cosa",
    texto:
      "Hice el árbol de mi abuela y me encontré la misma fecha repetida en tres generaciones. Se me quedó el cuerpo raro. No sé si a alguien más le ha pasado.",
    respuestas: 23,
    reacciones: 18,
  },
  {
    id: "3",
    autor: "Marta Ortiz",
    cuando: "hace 3 días",
    titulo: "Duda tonta con la ce con cedilla de los apellidos portugueses",
    texto: "Mi apellido de soltera es Gonçalves y no sabía si la cuenta lo coge bien. ¿Alguien con apellido portugués?",
    respuestas: 5,
    reacciones: 2,
  },
];

export default function ComunidadScreen() {
  const [escrito, setEscrito] = useState("");
  const quieto = useReducedMotion();

  const fijados = EJEMPLO.filter((t) => t.fijado);
  const resto = EJEMPLO.filter((t) => !t.fijado);

  const ficha = (t: Tema, i: number) => (
    <motion.article
      key={t.id}
      initial={quieto ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.05 * i, 0.25), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={css(
        "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
          "box-shadow:var(--nm);padding:var(--s4);display:flex;gap:var(--s3);" +
          /* Lo fijado se distingue por un filo dorado a la izquierda y no por un
             fondo distinto: un fondo distinto se lee como «esto es otra cosa» y
             esto es un tema más, sólo que el que hay que leer. */
          (t.fijado ? "border-left:3px solid var(--gold, var(--text-3));" : "")
      )}
    >
      <span
        aria-hidden
        style={css(
          "flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;font-weight:600;" +
            (t.esIris
              ? "background:var(--gold-soft);color:var(--gold-deep);"
              : "background:color-mix(in srgb, var(--text) 8%, transparent);color:var(--text-3);")
        )}
      >
        {t.autor.trim()[0]}
      </span>

      <div style={css("flex:1;min-width:0;")}>
        <div style={css("display:flex;gap:9px;align-items:baseline;flex-wrap:wrap;")}>
          <span style={css("font-size:var(--t-body);font-weight:600;color:var(--text);")}>{t.autor}</span>
          {t.esIris && (
            <span
              style={css(
                "font-size:var(--t-micro);font-weight:600;padding:2px 8px;border-radius:var(--r-pill);" +
                  "background:var(--gold-soft);color:var(--gold-deep);"
              )}
            >
              la escuela
            </span>
          )}
          {t.fijado && <span style={css(NOTA)}>· fijado</span>}
          <span style={css(NOTA + "margin-left:auto;")}>{t.cuando}</span>
        </div>

        <h3 style={css("font-size:var(--t-read);font-weight:600;margin:7px 0 6px;line-height:1.3;")}>{t.titulo}</h3>
        <p style={css(LECTURA + "margin:0;")}>{t.texto}</p>

        <div style={css("display:flex;gap:var(--s3);align-items:center;margin-top:var(--s3);")}>
          <button style={css(BOTON_NORMAL)}>
            {t.respuestas} {t.respuestas === 1 ? "respuesta" : "respuestas"}
          </button>
          {/* Las reacciones existen pero no mandan: lo que esta comunidad
              premia es que alguien conteste, no que algo guste. */}
          <span style={css(NOTA)}>♡ {t.reacciones}</span>
        </div>
      </div>
    </motion.article>
  );

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s4);max-width:820px;")}>
      <h1 style={css(TITULO + "margin:0;")}>Comunidad</h1>

      <Muestra falta="Al conectarla, lo que se escriba aquí se guardará y le llegará un aviso a quien participe en el tema." />

      {/* --------------------------------------------------- escribir algo */}
      <section
        style={css(
          "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
            "box-shadow:var(--nm);padding:var(--s4);"
        )}
      >
        <textarea
          value={escrito}
          onChange={(e) => setEscrito(e.target.value)}
          rows={escrito ? 4 : 2}
          placeholder="¿Qué quieres preguntar o contar?"
          aria-label="Escribe un tema nuevo"
          style={css(CAMPO + "resize:vertical;line-height:1.6;")}
        />
        <div style={css("display:flex;justify-content:flex-end;gap:var(--s3);margin-top:var(--s3);")}>
          <button disabled={!escrito.trim()} style={css(botonPrincipal(Boolean(escrito.trim())))}>
            Publicar
          </button>
        </div>
      </section>

      {fijados.map((t, i) => ficha(t, i))}

      <h2 style={css(CABECERA + "margin:var(--s2) 0 0;font-size:var(--t-head);")}>Lo último</h2>
      {resto.map((t, i) => ficha(t, i + 1))}
    </div>
  );
}
