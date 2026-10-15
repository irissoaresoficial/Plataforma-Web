"use client";

/**
 * ============================================================================
 * EL RECIBIDOR DE LA ESCUELA
 * ============================================================================
 *
 * La primera pantalla de quien NO es Iris. Es el equivalente de la consulta
 * para ella: el sitio donde se cae al entrar y al que se vuelve.
 *
 * QUÉ DECIDE ESTA PANTALLA, QUE NO ES POCO. Una escuela por internet se gana o
 * se pierde en los primeros diez segundos de la segunda visita. La primera vez
 * la gente entra por curiosidad; la segunda entra buscando algo concreto, y si
 * no lo encuentra de un vistazo no hay tercera. Así que aquí no va un panel de
 * bienvenida con el logotipo grande: va LO SIGUIENTE QUE HAY QUE HACER.
 *
 * Y mientras no haya nada que hacer —hoy— lo que va es la verdad, dicha sin
 * rodeos. Una escuela vacía disfrazada de escuela llena se nota enseguida.
 *
 * SE LE ENSEÑA A CADA UNO LO SUYO. La misma pantalla cambia según las llaves
 * que lleve quien la abre, y eso se pregunta a `puede()`, nunca a «¿es
 * alumno?». Iris la ve también —entra por aquí cuando quiere mirar su escuela
 * con los ojos de quien paga— y por eso hay un aviso que sólo ve ella.
 */

import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import { botonPrincipal } from "@/lib/ui";
import Particulas from "../Particulas";

/** Las puertas de la escuela, con la llave que pide cada una. */
const PUERTAS = [
  {
    k: "cursos" as const,
    capacidad: "cursos" as const,
    titulo: "Cursos",
    que: "Las clases, por módulos, con el vídeo y los materiales de cada una.",
  },
  {
    k: "comunidad" as const,
    capacidad: "comunidad" as const,
    titulo: "Comunidad",
    que: "Donde se pregunta, se responde y se comparte lo que uno va viendo.",
  },
  {
    k: "recursos" as const,
    capacidad: "recursos" as const,
    titulo: "Recursos",
    que: "La biblioteca: plantillas, guías y audios para descargar.",
  },
  {
    k: "trofeos" as const,
    capacidad: "recursos" as const,
    titulo: "Trofeos",
    que: "Lo que llevas hecho, tu racha y las medallas que vas abriendo.",
  },
];

export default function EscuelaScreen() {
  const { setView } = useApp();
  const { usuario, puede, esAdmin } = useSesion();
  const quieto = useReducedMotion();

  const abiertas = PUERTAS.filter((p) => puede(p.capacidad));
  const nombre = (usuario ? usuario.nombre : "").split(" ")[0];

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s5);max-width:980px;")}>
      {/* ------------------------------------------------------- El saludo */}
      <motion.div
        initial={quieto ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={css(
          "position:relative;overflow:hidden;isolation:isolate;background:var(--surface);" +
            "border:1px solid var(--border);border-radius:var(--r);padding:clamp(32px,6vw,64px) var(--pad-card);" +
            "box-shadow:var(--nm-alto);"
        )}
      >
        <div style={css("position:absolute;inset:0;z-index:0;pointer-events:none;")} aria-hidden>
          <Particulas cantidad={18} />
        </div>
        <div style={css("position:relative;z-index:1;")}>
          <h1 style={css("font-size:var(--t-display, var(--t-head));margin:0;line-height:1.15;")}>
            {nombre ? `Hola, ${nombre}` : "Escuela de Sabiduría 33"}
          </h1>
          <p
            style={css(
              "font-size:var(--t-read);line-height:1.65;color:var(--text-3);margin:var(--s3) 0 0;max-width:56ch;text-wrap:pretty;"
            )}
          >
            Aquí dentro están tus cursos, la comunidad y todo lo que vayas desbloqueando. Esto se está construyendo
            ahora mismo, así que irás viendo cómo se llena.
          </p>
        </div>
      </motion.div>

      {/* ------------------------------------------- El aviso que sólo ve Iris */}
      {/* Ella no es alumna, así que ve esta pantalla como la ve todo el mundo
          pero necesita saber que está mirando el otro lado del espejo: si no,
          lo lee como un fallo de su propia plataforma. */}
      {esAdmin && (
        <div
          style={css(
            "padding:12px 16px;border-radius:var(--r-sm);border:1px solid var(--border);" +
              "background:color-mix(in srgb, var(--gold-deep, var(--text)) 7%, transparent);" +
              "font-size:var(--t-mini);line-height:1.55;color:var(--text-3);"
          )}
        >
          <strong style={css("color:var(--text-2);")}>Estás viendo la escuela como la ve un alumno.</strong>{" "}
          Tu estudio de Kábala y tu despacho siguen donde estaban, en el menú de la izquierda. Ningún alumno los ve.
        </div>
      )}

      {/* ------------------------------------------------------ Las puertas */}
      <div
        style={css(
          "display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fill,minmax(248px,1fr));"
        )}
      >
        {abiertas.map((p, i) => (
          <motion.button
            key={p.k}
            onClick={() => setView(p.k)}
            whileTap={{ scale: 0.985 }}
            initial={quieto ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "text-align:left;cursor:pointer;background:var(--surface);border:1px solid var(--border);" +
                "border-radius:var(--r);padding:var(--s4) var(--s4);box-shadow:var(--nm);color:inherit;font:inherit;"
            )}
          >
            <span style={css("display:block;font-size:var(--t-body);font-weight:600;margin-bottom:6px;")}>
              {p.titulo}
            </span>
            <span style={css("display:block;font-size:var(--t-mini);line-height:1.5;color:var(--text-4);text-wrap:pretty;")}>
              {p.que}
            </span>
          </motion.button>
        ))}
      </div>

      {/*
       * NADIE SE QUEDA MIRANDO UNA PANTALLA SIN SALIDA.
       *
       * Alguien con cuenta pero sin ninguna llave —se dio de alta, todavía no
       * ha comprado nada, o se le retiró el acceso— llegaría aquí y no vería
       * ni una sola puerta. Sin esto, una pantalla en blanco y a adivinar.
       */}
      {abiertas.length === 0 && (
        <div
          style={css(
            "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
              "padding:clamp(28px,5vw,48px) var(--pad-card);text-align:center;box-shadow:var(--nm);"
          )}
        >
          <h2 style={css("font-size:var(--t-head);margin:0 0 var(--s2);")}>Tu cuenta todavía no tiene acceso a nada</h2>
          <p style={css("font-size:var(--t-read);line-height:1.6;color:var(--text-3);margin:0 auto;max-width:48ch;text-wrap:pretty;")}>
            Si acabas de comprar un curso, el acceso puede tardar un poco en llegar. Si llevas esperando más de un día,
            escribe a Iris y lo soluciona enseguida.
          </p>
          <a
            href="mailto:irissoaresoficial@gmail.com"
            style={css(botonPrincipal() + "display:inline-block;margin-top:var(--s4);text-decoration:none;")}
          >
            Escribir a Iris
          </a>
        </div>
      )}
    </div>
  );
}
