"use client";

/**
 * LA FICHA DE UN CURSO EN LA LISTA DE QUIEN MONTA CURSOS.
 *
 * Gerson, el 15 de noviembre de 2026, con un panel de referencia al lado:
 * «necesito que se vea más bonito esto y que también pueda borrar los cursos».
 *
 * Lo que se ha cogido de la referencia, y por qué:
 *   · La portada DENTRO de la ficha, con su propio canto y aire alrededor, en
 *     vez de pegada al borde: la ficha se lee como un objeto, no como un
 *     recorte de foto con texto debajo.
 *   · El estado encima de la imagen, en una pastilla de cristal: se ve de un
 *     vistazo cuál está publicado sin leer nada.
 *   · Las cifras en pastillas pequeñas (lecciones, minutos, alumnos): datos
 *     de verdad del curso, no decoración.
 *
 * SIN PORTADA NO SALE UNA IMAGEN ROTA. Antes la ficha pintaba la dirección tal
 * cual, y si era un vídeo o un enlace caído salía el icono roto (así se veía
 * Desórdenes Amorosos). Ahora pasa por `portadaDe` y, si aun así no carga, cae
 * a la foto de la casa.
 */
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, NOTA, botonPrincipal } from "@/lib/ui";
import Confirmar from "../Confirmar";
import { portadaDe } from "@/lib/escuela/portadas";
import type { Curso } from "@/lib/escuela";

const CASA = "/escuela/basico.jpg";

const PASTILLA_CIFRA =
  "display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:var(--r-pill);" +
  "background:var(--surface-2);border:1px solid var(--border);font-size:var(--t-mini);color:var(--text-3);" +
  "font-variant-numeric:tabular-nums;white-space:nowrap;";

export default function FichaCurso({
  c,
  i,
  total,
  minutos,
  parte,
  alumnos,
  esMio,
  esAdmin,
  puedeBorrar,
  entrar,
  editar,
  borrar,
}: {
  c: Curso;
  i: number;
  total: number;
  minutos: number;
  /** Lo que lleva visto quien mira, de 0 a 1. */
  parte: number;
  /** Inscritos. null = no se sabe (no se enseña). */
  alumnos: number | null;
  esMio: boolean;
  esAdmin: boolean;
  puedeBorrar: boolean;
  entrar: () => void;
  editar: () => void;
  borrar: () => void;
}) {
  const quieto = useReducedMotion();
  const [rota, setRota] = useState(false);
  const src = rota ? CASA : portadaDe(c, i);

  const estado = c.publicado
    ? { t: "Publicado", fondo: "var(--oro-luz)", tinta: "var(--vino)" }
    : c.revision
      ? { t: esAdmin ? "Pide publicar" : "En revisión", fondo: "var(--oro-luz)", tinta: "var(--vino)" }
      : { t: "Borrador", fondo: "rgba(255,255,255,.82)", tinta: "var(--tinta, #221d1f)" };

  /* La pregunta dice qué se pierde y cuánto, como pide `Confirmar`. */
  const pregunta = [
    `Se borra «${c.titulo.trim() || "Curso sin nombre"}»`,
    total > 0 ? ` con sus ${total} ${total === 1 ? "lección" : "lecciones"}` : "",
    ". No se puede deshacer.",
    c.publicado ? " Está publicado: los alumnos dejan de verlo." : "",
    alumnos ? ` Tiene ${alumnos} ${alumnos === 1 ? "persona inscrita" : "personas inscritas"}.` : "",
  ].join("");

  return (
    <motion.article
      initial={quieto ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.05 * i, 0.3), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      data-ficha-curso=""
      style={css(
        "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
          "box-shadow:var(--nm-alto);padding:10px;display:flex;flex-direction:column;gap:12px;min-width:0;"
      )}
    >
      {/* ------------------------------------------------ la portada */}
      <div
        style={css(
          "position:relative;aspect-ratio:16/10;border-radius:calc(var(--r-tarjeta) - 8px);overflow:hidden;background:var(--bloque);"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          onError={() => setRota(true)}
          style={css("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")}
        />
        <span
          aria-hidden="true"
          style={css("position:absolute;inset:0;background:linear-gradient(180deg,rgba(34,29,31,.28),transparent 38%,transparent 62%,rgba(34,29,31,.35));")}
        />

        {esMio && (
          <span
            style={css(
              "position:absolute;top:10px;left:10px;font-size:var(--t-mini);font-weight:500;padding:5px 12px;" +
                "border-radius:var(--r-pill);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);" +
                `background:${estado.fondo};color:${estado.tinta};`
            )}
          >
            {estado.t}
          </span>
        )}

        {puedeBorrar && (
          <div style={css("position:absolute;top:8px;right:8px;")}>
            <Confirmar
              estilo={
                "width:34px;height:34px;display:grid;place-items:center;border-radius:50%;cursor:pointer;" +
                "border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.78);color:var(--vino);" +
                "backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font-size:var(--t-body);line-height:1;"
              }
              titulo="Borrar el curso"
              pregunta={pregunta}
              confirmar="Borrar"
              alConfirmar={borrar}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
              </svg>
              <span style={css("position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);")}>
                Borrar el curso
              </span>
            </Confirmar>
          </div>
        )}
      </div>

      {/* -------------------------------------------------- lo de dentro */}
      <div style={css("padding:2px 8px 6px;display:flex;flex-direction:column;gap:10px;flex:1;min-width:0;")}>
        <div style={css("display:flex;flex-direction:column;gap:4px;min-width:0;")}>
          {esAdmin && c.autorNombre && <span style={css(NOTA)}>De {c.autorNombre}</span>}
          <h2
            style={css(
              "margin:0;font-size:var(--t-read);font-weight:500;letter-spacing:-.015em;line-height:1.3;" +
                (c.titulo.trim() ? "color:var(--text);" : "color:var(--text-4);")
            )}
          >
            {c.titulo.trim() || "Curso sin nombre"}
          </h2>
          {c.descripcion && (
            <p
              style={css(
                NOTA +
                  "margin:0;line-height:1.5;color:var(--text-3);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
              )}
            >
              {c.descripcion}
            </p>
          )}
        </div>

        <div style={css("display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;")}>
          <span style={css(PASTILLA_CIFRA)}>
            <b style={css("font-weight:500;color:var(--text);")}>{total}</b> {total === 1 ? "lección" : "lecciones"}
          </span>
          {minutos > 0 && (
            <span style={css(PASTILLA_CIFRA)}>
              <b style={css("font-weight:500;color:var(--text);")}>{minutos}</b> min
            </span>
          )}
          {alumnos !== null && (
            <span style={css(PASTILLA_CIFRA)}>
              <b style={css("font-weight:500;color:var(--text);")}>{alumnos}</b> {alumnos === 1 ? "alumno" : "alumnos"}
            </span>
          )}
        </div>

        {total > 0 && parte > 0 && (
          <div
            role="progressbar"
            aria-valuenow={Math.round(parte * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Lo que llevas de ${c.titulo}`}
            style={css("height:4px;border-radius:999px;background:color-mix(in srgb, var(--text) 10%, transparent);overflow:hidden;")}
          >
            <div style={css(`height:100%;width:${parte * 100}%;background:var(--gold-deep, var(--text));`)} />
          </div>
        )}

        <div style={css("display:flex;gap:8px;")}>
          <button onClick={entrar} style={css(botonPrincipal() + "flex:1 1 auto;")}>
            {parte > 0 && parte < 1 ? "Seguir" : "Entrar"}
          </button>
          {esMio && (
            <button data-guia="editar" onClick={editar} style={css(BOTON_NORMAL)}>
              Editar
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/** La última ficha de la rejilla: crear otro, con el mismo tamaño que un curso. */
export function FichaNueva({ alPulsar }: { alPulsar: () => void }) {
  return (
    <button
      onClick={alPulsar}
      data-ficha-nueva=""
      style={css(
        "min-height:280px;border-radius:var(--r-tarjeta);border:1.5px dashed var(--border-strong, var(--border));" +
          "background:color-mix(in srgb, var(--surface) 55%, transparent);cursor:pointer;color:var(--text-2);" +
          "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font:inherit;"
      )}
    >
      <span
        aria-hidden="true"
        style={css(
          "width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:var(--t-read);" +
            "background:var(--surface);border:1px solid var(--border);box-shadow:var(--nm-alto);color:var(--vino);"
        )}
      >
        +
      </span>
      <span style={css("font-size:var(--t-body);font-weight:500;")}>Nuevo curso</span>
    </button>
  );
}
