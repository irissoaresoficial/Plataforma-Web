"use client";

/**
 * ============================================================================
 * LOS ARCHIVOS DE UN CURSO
 * ============================================================================
 *
 * El manual en PDF, la plantilla de la ficha, el audio de la meditación.
 *
 * ESTO ERA UNA PANTALLA ENTERA EN EL MENÚ Y YA NO LO ES. Gerson: «el apartado
 * de recursos y demás, pues esto iría como tal dentro de los cursos. Cada
 * curso tiene sus recursos, entonces es irrelevante colocarlo allí».
 *
 * Lo que se gana no es sólo una entrada menos en la columna. Una biblioteca
 * común obliga a contestar «¿quién puede bajar este archivo?», y la respuesta
 * siempre iba a ser «quien tenga el curso del que es». Puesta dentro del
 * curso, la pregunta ya está contestada por la inscripción.
 *
 * Y lo que se pierde, dicho: buscar y filtrar por tipo. Tenían sentido con
 * cien fichas de todos los cursos mezcladas; con los cuatro archivos de un
 * curso, un buscador es un trasto que hay que mirar antes de ver la lista.
 *
 * SE USA EN DOS SITIOS Y SE COMPORTA DISTINTO:
 *   · En el reproductor, debajo de las lecciones: se mira y se baja.
 *   · En el editor, mientras Iris monta el curso: se sube y se quita.
 * Es el mismo componente porque es la misma lista, y que se vea igual a los
 * dos lados es lo que hace que Iris sepa lo que va a ver su alumna.
 */

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, BOTON_PLANO, CABECERA, CAMPO, NOTA, botonPrincipal } from "@/lib/ui";
import Confirmar from "@/components/Confirmar";
import { adivinaTipo, borraArchivo, pesoHumano, sube, type Recurso, type Tipo } from "@/lib/escuela/recursos";

const NOMBRE_TIPO: Record<Tipo, string> = {
  pdf: "PDF",
  audio: "Audio",
  plantilla: "Plantilla",
  video: "Vídeo",
};

/* El tono de cada tipo. Con cuatro archivos no hace falta buscar, pero sí
   distinguir de un vistazo cuál es el audio y cuál la plantilla. El color
   marca; no rellena. */
const TONO_TIPO: Record<Tipo, string> = {
  pdf: "lavanda",
  audio: "rosa",
  plantilla: "lima",
  video: "melocoton",
};

/** Cada tipo dibuja lo que es, no un clip genérico igual para todos. */
function Marca({ tipo }: { tipo: Tipo }) {
  const trazo = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden {...trazo}>
      {tipo === "audio" && <path d="M4 10v4M8 7.5v9M12 5v14M16 8.5v7M20 11v2" />}
      {tipo === "plantilla" && (
        <>
          <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="2" />
          <path d="M3.6 9.3h16.8M9.3 9.3v11.1" opacity=".55" />
        </>
      )}
      {tipo === "video" && (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="m10.3 9.8 4.4 2.2-4.4 2.2z" fill="currentColor" stroke="none" />
        </>
      )}
      {tipo === "pdf" && (
        <>
          <path d="M13.4 3.2H7a2 2 0 0 0-2 2v13.6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.8z" />
          <path d="M13.3 3.3v4.3a1.2 1.2 0 0 0 1.2 1.2h4.3" opacity=".6" />
        </>
      )}
    </svg>
  );
}

export default function Recursos({
  cursoId,
  recursos,
  puedeEditar = false,
  enPaso = false,
  alCambiar,
}: {
  cursoId: string;
  recursos: Recurso[];
  /** Iris sube y quita; una alumna sólo mira y baja. */
  puedeEditar?: boolean;
  /** Dentro del editor el título ya lo pone el paso: aquí no se repite. */
  enPaso?: boolean;
  /** La lista nueva. Quien llama la guarda en el curso. */
  alCambiar?: (nuevos: Recurso[]) => void;
}) {
  const quieto = useReducedMotion();
  const campo = useRef<HTMLInputElement>(null);

  const [elegido, setElegido] = useState<File | null>(null);
  const [nombre, setNombre] = useState("");
  const [que, setQue] = useState("");
  const [parte, setParte] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [fallo, setFallo] = useState("");

  /*
   * EL NOMBRE SE RELLENA SOLO CON EL DEL ARCHIVO, SIN LA EXTENSIÓN.
   *
   * Casi siempre el archivo ya se llama como hay que llamarlo, así que Iris
   * sube y pulsa. Y cuando no, lo corrige — que es mucho menos trabajo que
   * escribirlo desde cero. Un formulario que viene medio hecho se termina;
   * uno en blanco se abandona.
   */
  function elige(f: File | undefined) {
    if (!f) return;
    setFallo("");
    setElegido(f);
    const punto = f.name.lastIndexOf(".");
    setNombre(punto > 0 ? f.name.slice(0, punto) : f.name);
    setQue("");
  }

  async function confirma() {
    if (!elegido) return;
    setSubiendo(true);
    setParte(0);
    setFallo("");
    try {
      const r = await sube(cursoId, elegido, { nombre, que }, setParte);
      alCambiar?.([r, ...recursos]);
      setElegido(null);
      setNombre("");
      setQue("");
    } catch (e) {
      setFallo(e instanceof Error ? e.message : "No se ha podido subir.");
    } finally {
      setSubiendo(false);
      if (campo.current) campo.current.value = "";
    }
  }

  /* Se quita de la lista primero y se borra el archivo después. El orden está
     explicado en `lib/escuela/recursos.ts`: un archivo huérfano cuesta
     céntimos, una ficha con un botón de descargar roto cuesta confianza. */
  function quita(r: Recurso) {
    alCambiar?.(recursos.filter((x) => x.id !== r.id));
    void borraArchivo(r);
  }

  const hay = recursos.length > 0;
  if (!hay && !puedeEditar) return null;

  return (
    <section style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
      <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
        {!enPaso && <h2 style={css(CABECERA + "margin:0;font-size:var(--t-head);")}>Material del curso</h2>}
        {hay && (
          <span style={css(NOTA)}>
            {recursos.length} {recursos.length === 1 ? "archivo" : "archivos"}
          </span>
        )}
        {puedeEditar && !elegido && (
          <button onClick={() => campo.current?.click()} style={css(BOTON_NORMAL + (enPaso ? "" : "margin-left:auto;"))}>
            + Subir un archivo
          </button>
        )}
      </div>

      {puedeEditar && (
        <input ref={campo} type="file" onChange={(e) => elige(e.target.files?.[0])} style={css("display:none;")} aria-hidden tabIndex={-1} />
      )}

      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--alarma, #C0392B);")}>
          {fallo}
        </p>
      )}

      {/* ------------------------------------------------ la ficha al subir */}
      {/* Se pide el nombre y la descripción ANTES de subir, no después: subir
          primero y preguntar luego deja archivos sin nombre cada vez que algo
          interrumpe, y un archivo sin nombre es un archivo perdido. */}
      {elegido && (
        <div
          style={css(
            "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
              "box-shadow:var(--nm);padding:var(--s4);display:flex;flex-direction:column;gap:var(--s3);"
          )}
        >
          <div style={css(NOTA)}>
            {elegido.name} · {pesoHumano(elegido.size)} · se guardará como {NOMBRE_TIPO[adivinaTipo(elegido)]}
          </div>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Cómo se llama"
            aria-label="Nombre del archivo"
            disabled={subiendo}
            style={css(CAMPO + "font-size:var(--t-read);")}
          />
          <input
            value={que}
            onChange={(e) => setQue(e.target.value)}
            placeholder="Una línea de qué es"
            aria-label="Descripción del archivo"
            disabled={subiendo}
            style={css(CAMPO)}
          />

          {subiendo ? (
            <div>
              <div style={css("display:flex;justify-content:space-between;margin-bottom:6px;")}>
                <span style={css(NOTA)}>Subiendo… no cierres esta pestaña.</span>
                <span style={css(NOTA + "font-variant-numeric:tabular-nums;")}>{Math.round(parte * 100)} %</span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(parte * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Subiendo el archivo"
                style={css("height:5px;border-radius:999px;overflow:hidden;background:color-mix(in srgb, var(--text) 10%, transparent);")}
              >
                <div style={css(`height:100%;width:${parte * 100}%;background:var(--accion);border-radius:999px;`)} />
              </div>
            </div>
          ) : (
            <div style={css("display:flex;gap:var(--s3);justify-content:flex-end;")}>
              <button onClick={() => setElegido(null)} style={css(BOTON_PLANO)}>
                Cancelar
              </button>
              <button onClick={() => void confirma()} style={css(botonPrincipal())}>
                Subir
              </button>
            </div>
          )}
        </div>
      )}

      {!hay && puedeEditar && (
        <p style={css(NOTA + "margin:0;line-height:1.55;max-width:60ch;")}>
          Todavía no hay ningún archivo. Sube aquí lo que repartes con este curso: un PDF, una plantilla, un audio.
        </p>
      )}

      <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fill,minmax(260px,1fr));")}>
        {recursos.map((r, i) => (
          <motion.article
            key={r.id}
            initial={quieto ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(0.04 * i, 0.2), duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
                "box-shadow:var(--nm);padding:var(--s4);display:flex;flex-direction:column;gap:9px;"
            )}
          >
            <div style={css("display:flex;align-items:center;gap:10px;")}>
              <span
                aria-hidden
                style={css(
                  "flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:var(--r-sm);" +
                    `background:var(--${TONO_TIPO[r.tipo]});color:var(--${TONO_TIPO[r.tipo]}-tx);`
                )}
              >
                <Marca tipo={r.tipo} />
              </span>
              <span style={css(NOTA)}>
                {NOMBRE_TIPO[r.tipo]} · {pesoHumano(r.peso)}
              </span>
            </div>

            <h3 style={css("font-size:var(--t-body);font-weight:600;margin:0;line-height:1.3;overflow-wrap:anywhere;")}>
              {r.nombre}
            </h3>
            {r.que && <p style={css(NOTA + "margin:0;line-height:1.5;flex:1;")}>{r.que}</p>}

            <div style={css("display:flex;align-items:center;gap:10px;margin-top:4px;flex-wrap:wrap;")}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                style={css(BOTON_NORMAL + "text-decoration:none;display:inline-block;")}
              >
                Descargar
              </a>
              {puedeEditar && (
                <Confirmar
                  estilo={BOTON_PLANO}
                  pregunta={`Se quita «${r.nombre}» de este curso y se borra su archivo. No se puede deshacer.`}
                  confirmar="Borrar"
                  alConfirmar={() => quita(r)}
                >
                  Borrar
                </Confirmar>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
