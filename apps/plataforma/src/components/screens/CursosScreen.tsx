"use client";

/**
 * ============================================================================
 * LOS CURSOS
 * ============================================================================
 *
 * UNA SOLA PANTALLA PARA LOS DOS, y es una decisión, no una economía.
 *
 * Lo fácil habría sido dos pantallas: «Mis cursos» para el alumno y «Gestión de
 * cursos» para Iris. Y entonces Iris no vería nunca lo que ve un alumno —vería
 * su lista de administración, con sus borradores y sus botones— y se enteraría
 * de que la portada no se lee o de que falta el vídeo de la lección cuatro
 * cuando alguien se lo escriba.
 *
 * Aquí es la misma pantalla. Ella ve lo que ven ellos, más lo suyo encima: los
 * borradores marcados y el botón de crear. Lo que está roto se ve desde dentro.
 *
 * LAS TRES SITUACIONES QUE TIENE QUE RESOLVER, porque las tres pasan:
 *
 *   1. IRIS SIN NINGÚN CURSO — el primer día. Tiene que quedar clarísimo qué
 *      botón se pulsa. Es el momento con más posibilidades de que la escuela
 *      no llegue a existir.
 *   2. UN ALUMNO SIN NINGÚN CURSO — pagó y todavía no tiene acceso, o se dio
 *      de alta sin comprar. Necesita saber a quién escribir, no un hueco.
 *   3. TODO EN MARCHA — la lista, con el avance de cada uno encima.
 */

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useSesion } from "@/lib/sesion";
import { BOTON_NORMAL, CABECERA, LECTURA, NOTA, TITULO, botonPrincipal , PANTALLA} from "@/lib/ui";
import EditorCurso, { cursoNuevo } from "../escuela/EditorCurso";
import Reproductor from "../escuela/Reproductor";
import {
  avance as repoAvance,
  cursos as repoCursos,
  inscripciones as repoInscripciones,
  guardadoEnLaNube,
  progreso,
  totalLecciones,
  type Avance,
  type Curso,
} from "@/lib/escuela";

type Donde =
  | { que: "lista" }
  | { que: "edita"; curso: Curso }
  | { que: "ve"; curso: Curso };

export default function CursosScreen() {
  const { usuario, esAdmin } = useSesion();
  const uid = usuario ? usuario.uid : "";
  const [donde, setDonde] = useState<Donde>({ que: "lista" });
  const [lista, setLista] = useState<Curso[] | null>(null);
  const [avances, setAvances] = useState<Record<string, Avance | null>>({});
  const [fallo, setFallo] = useState("");
  const quieto = useReducedMotion();

  /**
   * CADA UNO PIDE LO SUYO, y no es lo mismo filtrar aquí que pedir distinto.
   *
   * Iris pide todos los cursos: necesita sus borradores. Un alumno pide los
   * publicados y se queda con aquellos a los que tiene acceso. Traerlos todos
   * y filtrar en la pantalla no funcionaría: las reglas de Firestore rechazan
   * la consulta entera cuando incluye algo que no se puede leer, así que se
   * quedaría sin cursos en vez de sin borradores.
   */
  const carga = useCallback(async () => {
    setFallo("");
    try {
      if (esAdmin) {
        setLista(await repoCursos.listar());
        return;
      }
      if (!uid) {
        setLista([]);
        return;
      }
      const [publicados, mias] = await Promise.all([
        repoCursos.publicados(),
        repoInscripciones.deAlumno(uid),
      ]);
      const permitidos = new Set(mias.map((i) => i.cursoId));
      setLista(publicados.filter((c) => permitidos.has(c.id)));
    } catch (e) {
      setLista([]);
      setFallo(e instanceof Error ? e.message : "No se han podido cargar los cursos.");
    }
  }, [esAdmin, uid]);

  useEffect(() => {
    void carga();
  }, [carga]);

  /* El avance de cada curso, para pintar la barra en su tarjeta. Falla en
     silencio a propósito: sin avance la tarjeta sale sin barra, que es mucho
     mejor que una lista de cursos que no aparece. */
  useEffect(() => {
    if (!lista || !uid) return;
    let vivo = true;
    Promise.all(lista.map((c) => repoAvance.de(uid, c.id).catch(() => null))).then((xs) => {
      if (!vivo) return;
      const m: Record<string, Avance | null> = {};
      lista.forEach((c, i) => (m[c.id] = xs[i]));
      setAvances(m);
    });
    return () => {
      vivo = false;
    };
  }, [lista, uid]);

  /* ------------------------------------------------------------ el editor */

  if (donde.que === "edita") {
    return (
      <EditorCurso
        inicial={donde.curso}
        alSalir={() => {
          setDonde({ que: "lista" });
          void carga();
        }}
        alGuardar={(c) =>
          setLista((xs) => {
            const otros = (xs ?? []).filter((x) => x.id !== c.id);
            return [c, ...otros];
          })
        }
      />
    );
  }

  if (donde.que === "ve") {
    return <Reproductor curso={donde.curso} uid={uid} alSalir={() => setDonde({ que: "lista" })} />;
  }

  /* ------------------------------------------------------------- la lista */

  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--s4);")}>
      <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
        <h1 style={css(TITULO + "margin:0;")}>{esAdmin ? "Cursos" : "Mis cursos"}</h1>
        {esAdmin && (
          <button
            onClick={() => setDonde({ que: "edita", curso: cursoNuevo() })}
            style={css(botonPrincipal() + "margin-left:auto;")}
          >
            + Nuevo curso
          </button>
        )}
      </div>

      {/* El aviso de que esto no se está guardando en ningún sitio serio. Es
          verdad sin claves de Firebase y mentira con ellas, y un aviso que
          miente enseña a no leer los avisos. */}
      {!guardadoEnLaNube && (
        <p style={css(NOTA + "margin:0;")}>
          Esto se está guardando sólo en este navegador. Es lo normal mientras se trabaja en la plataforma; en la de
          Iris va a la nube.
        </p>
      )}

      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--alarma, #C0392B);")}>
          {fallo}
        </p>
      )}

      {lista === null && <p style={css(NOTA + "margin:0;")}>Cargando…</p>}

      {/* --------------------------------------------------- sin nada aún */}
      {lista !== null && lista.length === 0 && (
        <div
          style={css(
            "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
              "padding:clamp(32px,6vw,64px) var(--pad-card);text-align:center;box-shadow:var(--nm);"
          )}
        >
          {esAdmin ? (
            <>
              <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Todavía no has creado ningún curso</h2>
              <p style={css(LECTURA + "margin:0 auto var(--s4);max-width:52ch;")}>
                Un curso se monta en varios ratos: lo empiezas, lo dejas, lo sigues. Mientras no lo publiques no lo ve
                nadie, así que puedes crearlo ahora aunque sólo tengas el nombre.
              </p>
              <button onClick={() => setDonde({ que: "edita", curso: cursoNuevo() })} style={css(botonPrincipal())}>
                Crear el primer curso
              </button>
            </>
          ) : (
            <>
              <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Aún no tienes ningún curso</h2>
              <p style={css(LECTURA + "margin:0 auto var(--s4);max-width:48ch;")}>
                Si acabas de comprar uno, el acceso puede tardar un poco en llegar. Si llevas esperando más de un día,
                escribe a Iris y lo soluciona enseguida.
              </p>
              <a
                href="mailto:irissoaresoficial@gmail.com"
                style={css(botonPrincipal() + "display:inline-block;text-decoration:none;")}
              >
                Escribir a Iris
              </a>
            </>
          )}
        </div>
      )}

      {/* ------------------------------------------------------ las fichas */}
      <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fill,minmax(270px,1fr));")}>
        {(lista ?? []).map((c, i) => {
          const total = totalLecciones(c);
          const parte = progreso(c, avances[c.id] ?? null);
          const inicial = (c.titulo.trim()[0] || "·").toUpperCase();
          return (
            <motion.article
              key={c.id}
              initial={quieto ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.06 * i, 0.3), duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={css(
                "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
                  "box-shadow:var(--nm);overflow:hidden;display:flex;flex-direction:column;"
              )}
            >
              {/* La portada. Sin imagen sale la inicial sobre un fondo liso, y
                  eso es suficiente: obligar a tener una imagen para poder crear
                  un curso es lo que hace que el curso no se cree. */}
              <div
                style={css(
                  "aspect-ratio:16/9;background:color-mix(in srgb, var(--text) 8%, transparent);" +
                    "display:grid;place-items:center;overflow:hidden;"
                )}
              >
                {c.portada ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.portada}
                    alt=""
                    style={css("width:100%;height:100%;object-fit:cover;display:block;")}
                  />
                ) : (
                  <span style={css("font-family:var(--font-display);font-size:44px;color:var(--text-4);")}>
                    {inicial}
                  </span>
                )}
              </div>

              <div style={css("padding:var(--s3) var(--s4) var(--s4);display:flex;flex-direction:column;gap:8px;flex:1;")}>
                <div style={css("display:flex;align-items:center;gap:8px;flex-wrap:wrap;")}>
                  <h2 style={css("font-size:var(--t-body);font-weight:600;margin:0;")}>
                    {c.titulo || "Curso sin nombre"}
                  </h2>
                  {/* El borrador se marca con una palabra y no con un color: un
                      color hay que haber aprendido qué significa. */}
                  {esAdmin && !c.publicado && (
                    <span
                      style={css(
                        "font-size:var(--t-micro);font-weight:600;letter-spacing:.08em;text-transform:uppercase;" +
                          "padding:2px 8px;border-radius:var(--r-pill);color:var(--text-3);" +
                          "background:color-mix(in srgb, var(--text) 9%, transparent);"
                      )}
                    >
                      Borrador
                    </span>
                  )}
                </div>

                {c.descripcion && (
                  <p style={css(NOTA + "margin:0;line-height:1.5;")}>
                    {c.descripcion.length > 120 ? c.descripcion.slice(0, 117) + "…" : c.descripcion}
                  </p>
                )}

                <span style={css(NOTA + "margin-top:auto;")}>
                  {total === 0 ? "Sin lecciones todavía" : `${total} ${total === 1 ? "lección" : "lecciones"}`}
                </span>

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

                <div style={css("display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;")}>
                  <button onClick={() => setDonde({ que: "ve", curso: c })} style={css(botonPrincipal() + "flex:1 1 auto;")}>
                    {parte > 0 && parte < 1 ? "Seguir" : "Entrar"}
                  </button>
                  {esAdmin && (
                    <button onClick={() => setDonde({ que: "edita", curso: c })} style={css(BOTON_NORMAL)}>
                      Editar
                    </button>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
