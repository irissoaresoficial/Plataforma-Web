"use client";

/**
 * ============================================================================
 * UN CURSO, VISTO POR DENTRO
 * ============================================================================
 *
 * Aquí es donde un alumno pasa las horas que ha pagado, así que lo que decide
 * esta pantalla no es cómo queda: es si termina el curso o lo deja a la
 * tercera lección.
 *
 * LO QUE HACE QUE SE TERMINE UN CURSO, y lo que hay aquí por eso:
 *
 *   · SABER SIEMPRE CUÁL ES LA SIGUIENTE. Lo que abandona un curso no es el
 *     aburrimiento, es abrirlo y tener que acordarse de por dónde ibas. Al
 *     entrar se abre sola la primera sin terminar, y al acabar una hay un botón
 *     que lleva a la de después: nunca hay que volver a la lista a buscarse.
 *
 *   · VER EL AVANCE. La barra de arriba no es decoración: es lo que convierte
 *     «me quedan muchas» en «llevo siete de doce». Es el mismo dato dicho de
 *     una manera que empuja en vez de pesar.
 *
 *   · QUE MARCAR SE NOTE EN EL ACTO. Se pinta antes de que conteste el
 *     servidor, y si falla se vuelve atrás y se dice. Esperar medio segundo a
 *     que se ponga una marca de visto es lo que hace que una herramienta se
 *     sienta lenta aunque sea rápida.
 */

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, BOTON_PLANO, CABECERA, LECTURA, NOTA, PANTALLA, botonPrincipal } from "@/lib/ui";
import { logoDe, portadaDe } from "@/lib/escuela/portadas";
import { leeVideo } from "@/lib/escuela/video";
import Recursos from "./Recursos";
import { avance as repoAvance, porDondeIba, progreso, totalLecciones, type Avance, type Curso, type Leccion } from "@/lib/escuela";

export default function Reproductor({
  curso,
  uid,
  alSalir,
  alEditar,
}: {
  curso: Curso;
  uid: string;
  alSalir: () => void;
  /** Sólo para quien lo monta: el atajo para ir a subir lo que falte. */
  alEditar?: () => void;
}) {
  const [av, setAv] = useState<Avance | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [fallo, setFallo] = useState("");
  const quieto = useReducedMotion();

  /** Todas las lecciones seguidas, que es como se recorre el curso aunque se
   *  enseñen agrupadas por módulo. */
  const todas = useMemo(
    () => curso.modulos.flatMap((m) => m.lecciones.map((l) => ({ ...l, modulo: m.titulo }))),
    [curso]
  );

  useEffect(() => {
    let vivo = true;
    repoAvance
      .de(uid, curso.id)
      .then((a) => {
        if (!vivo) return;
        setAv(a);
        /* Se abre por donde iba, no por el principio. Volver a la lección uno
           cada vez que se entra es lo que hace que un curso se sienta un
           trámite. */
        setAbierta((x) => x ?? porDondeIba(curso, a)?.id ?? todas[0]?.id ?? null);
      })
      .catch(() => {
        /* Sin avance se puede estudiar igual: se pierde la marca de visto, no
           la clase. Lo que no se puede es dejar la pantalla en blanco. */
        if (vivo) setAbierta((x) => x ?? todas[0]?.id ?? null);
      });
    return () => {
      vivo = false;
    };
  }, [uid, curso, todas]);

  const hechas = useMemo(() => new Set(av?.hechas ?? []), [av]);
  const leccion = todas.find((l) => l.id === abierta) ?? null;
  const total = totalLecciones(curso);
  const hechasVivas = todas.filter((l) => hechas.has(l.id)).length;
  const parte = progreso(curso, av);

  async function marca(l: Leccion, hecha: boolean) {
    const antes = av;
    /* Se pinta ya. Si el servidor dice que no, se deshace y se cuenta. */
    setAv((x) => {
      const s = new Set(x?.hechas ?? []);
      if (hecha) s.add(l.id);
      else s.delete(l.id);
      return { id: `${uid}__${curso.id}`, uid, cursoId: curso.id, hechas: [...s], tocado: new Date().toISOString() };
    });
    setFallo("");
    try {
      const nuevo = await repoAvance.marcar(uid, curso.id, l.id, hecha, curso.autor, curso.equipo);
      setAv(nuevo);
    } catch {
      setAv(antes);
      setFallo("No se ha podido guardar que has terminado esta lección. Mira la conexión y vuelve a probar.");
    }
  }

  const siguiente = () => {
    const i = todas.findIndex((l) => l.id === abierta);
    return i >= 0 && i + 1 < todas.length ? todas[i + 1] : null;
  };

  const video = leeVideo(leccion?.video ?? "");

  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--s4);")}>
      {/* --------------------------------------------------------- cabecera */}
      {/* Con el mismo margen que las demás pantallas: aquí faltaba el
          `PANTALLA` y el curso salía pegado a la columna. Y con su portada
          —o su logo, si el curso tiene marca propia— para que se sepa dónde
          se está sin leer. */}
      <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
        <button onClick={alSalir} style={css(BOTON_PLANO)}>
          ← Mis cursos
        </button>
        {alEditar && (
          <button onClick={alEditar} style={css(BOTON_NORMAL + "margin-left:auto;")}>
            Editar el curso
          </button>
        )}
      </div>
      <header
        style={css(
          "position:relative;overflow:hidden;border-radius:var(--r-tarjeta);min-height:200px;display:flex;align-items:flex-end;" +
            "background:var(--bloque);box-shadow:var(--nm-alto);"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={portadaDe(curso)} alt="" style={css("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
        <span aria-hidden="true" style={css("position:absolute;inset:0;background:linear-gradient(90deg,rgba(34,29,31,.85),rgba(34,29,31,.25));")} />
        <div style={css("position:relative;padding:var(--pad-card);display:flex;flex-direction:column;gap:10px;")}>
          {logoDe(curso) && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logoDe(curso)!} alt="" style={css("height:46px;width:auto;align-self:flex-start;border-radius:var(--r-sm);")} />
          )}
          <h1 style={css("margin:0;font-weight:300;font-size:clamp(28px,3.4vw,44px);letter-spacing:-.03em;line-height:1.05;color:var(--sobre-bloque);")}>
            {curso.titulo || "Curso sin nombre"}
          </h1>
          {curso.descripcion && (
            <p style={css("margin:0;font-size:var(--t-body);color:var(--sobre-bloque-2);max-width:60ch;")}>{curso.descripcion}</p>
          )}
        </div>
      </header>

      {/* ----------------------------------------------------- el progreso */}
      {total > 0 && (
        <div>
          <div style={css("display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:7px;")}>
            <span style={css(NOTA)}>
              {hechasVivas} de {total} {total === 1 ? "lección" : "lecciones"}
            </span>
            {parte === 1 && (
              <span style={css("font-size:var(--t-mini);font-weight:600;color:var(--gold-deep, var(--text-2));")}>
                Curso terminado
              </span>
            )}
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(parte * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Lo que llevas de este curso"
            style={css("height:6px;border-radius:999px;background:color-mix(in srgb, var(--text) 10%, transparent);overflow:hidden;")}
          >
            <motion.div
              initial={false}
              animate={{ width: `${parte * 100}%` }}
              transition={quieto ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={css("height:100%;background:var(--gold-deep, var(--text));border-radius:999px;")}
            />
          </div>
        </div>
      )}

      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--alarma, #C0392B);")}>
          {fallo}
        </p>
      )}

      {/* ------------------------------------------- el curso todavía vacío */}
      {total === 0 ? (
        /*
          EL ESQUELETO DEL CURSO VACÍO. Gerson: «sé que no tiene lecciones,
          pero haz el esqueleto, que por lo menos diga subir cosas». Una caja
          con una frase no enseña cómo va a ser esto; el esqueleto sí: aquí el
          vídeo, aquí las lecciones, aquí el material. Y a quien lo monta, el
          botón para llenarlo.
        */
        <div data-reproductor style={css("display:grid;gap:var(--s4);align-items:start;")}>
          <div
            style={css(
              "aspect-ratio:16/9;border-radius:var(--r-tarjeta);background:var(--bloque);display:grid;place-items:center;text-align:center;" +
                "padding:var(--pad-card);color:var(--sobre-bloque);box-shadow:var(--nm-alto);"
            )}
          >
            <div style={css("display:flex;flex-direction:column;align-items:center;gap:var(--s3);")}>
              <span aria-hidden="true" style={css("width:64px;height:64px;border-radius:50%;display:grid;place-items:center;border:1.5px dashed var(--bloque-borde);color:var(--oro-luz);")}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
              </span>
              <div style={css("font-size:var(--t-title);font-weight:500;")}>Aquí irá la primera clase</div>
              <p style={css("margin:0;font-size:var(--t-body);color:var(--sobre-bloque-2);max-width:44ch;")}>
                {alEditar
                  ? "Sube el vídeo de la primera lección y el curso empieza a tomar forma."
                  : "Iris lo está preparando. En cuanto suba la primera clase, aparece aquí."}
              </p>
              {alEditar && (
                <button onClick={alEditar} style={css(botonPrincipal() + "background:var(--sobre-bloque);color:var(--vino);border-color:var(--sobre-bloque);")}>
                  Subir la primera clase
                </button>
              )}
            </div>
          </div>
          <nav
            aria-label="Lecciones del curso"
            style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);padding:var(--s4);box-shadow:var(--nm);display:flex;flex-direction:column;gap:10px;")}
          >
            <div style={css("font-size:var(--t-body);font-weight:500;color:var(--text);")}>Lecciones</div>
            {[1, 2, 3].map((n) => (
              <div key={n} style={css("display:flex;align-items:center;gap:10px;padding:8px;border-radius:var(--r-sm);border:1px dashed var(--border-strong);")}>
                <span style={css("width:22px;height:22px;border-radius:50%;border:1.5px dashed var(--border-strong);flex:none;")} />
                <span style={css(NOTA)}>Lección {n} · por subir</span>
              </div>
            ))}
            {alEditar && (
              <button onClick={alEditar} style={css(BOTON_NORMAL + "align-self:flex-start;margin-top:6px;")}>
                + Añadir lecciones
              </button>
            )}
          </nav>
        </div>
      ) : (
        <div style={css("display:grid;gap:var(--s4);align-items:start;")} data-reproductor>
          {/* ------------------------------------------------- el temario */}
          <nav
            style={css(
              "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
                "padding:var(--s3);box-shadow:var(--nm);order:2;"
            )}
            aria-label="Lecciones del curso"
          >
            {curso.modulos.map((m, im) => (
              <div key={m.id} style={css(im > 0 ? "margin-top:var(--s3);" : "")}>
                <div style={css(NOTA + "padding:0 10px 6px;font-weight:600;")}>
                  {m.titulo || `Módulo ${im + 1}`}
                </div>
                {m.lecciones.map((l, il) => {
                  const hecha = hechas.has(l.id);
                  const activa = l.id === abierta;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setAbierta(l.id)}
                      aria-current={activa ? "true" : undefined}
                      style={css(
                        "display:flex;align-items:flex-start;gap:10px;width:100%;text-align:left;" +
                          "padding:9px 10px;border:none;border-radius:var(--r-sm);cursor:pointer;" +
                          "font:inherit;font-size:var(--t-body);line-height:1.4;" +
                          (activa
                            ? "background:color-mix(in srgb, var(--text) 8%, transparent);color:var(--text);font-weight:600;"
                            : "background:transparent;color:var(--text-2);")
                      )}
                    >
                      <span
                        aria-hidden
                        style={css(
                          "flex:none;margin-top:1px;width:17px;height:17px;border-radius:50%;display:grid;place-items:center;" +
                            "font-size:10px;font-weight:700;" +
                            (hecha
                              ? "background:var(--gold-deep, var(--text));color:var(--surface);"
                              : "border:1.5px solid var(--text-4);color:transparent;")
                        )}
                      >
                        ✓
                      </span>
                      <span style={css("flex:1;")}>
                        {l.titulo || `Lección ${im + 1}.${il + 1}`}
                        {l.minutos > 0 && <span style={css(NOTA + "margin-left:7px;")}>{l.minutos} min</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* ------------------------------------------------- la lección */}
          <section style={css("order:1;min-width:0;display:flex;flex-direction:column;gap:var(--s3);")}>
            {leccion && (
              <>
                <div
                  style={css(
                    "aspect-ratio:16/9;background:#000;border-radius:var(--r);overflow:hidden;" +
                      "border:1px solid var(--border);display:grid;place-items:center;"
                  )}
                >
                  {video.clase === "marco" && (
                    <iframe
                      key={video.src}
                      src={video.src}
                      title={leccion.titulo || "Lección"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      style={css("width:100%;height:100%;border:0;display:block;")}
                    />
                  )}
                  {video.clase === "archivo" && (
                    <video key={video.src} src={video.src} controls playsInline style={css("width:100%;height:100%;display:block;")} />
                  )}
                  {video.clase === "fuera" && (
                    <div style={css("text-align:center;padding:var(--s4);color:#fff;")}>
                      <p style={css("margin:0 0 var(--s3);font-size:var(--t-body);opacity:.85;")}>
                        Este vídeo se ve en otra pestaña.
                      </p>
                      <a
                        href={video.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={css(botonPrincipal() + "display:inline-block;text-decoration:none;")}
                      >
                        Abrir el vídeo
                      </a>
                    </div>
                  )}
                  {video.clase === "vacio" && (
                    <p style={css("margin:0;padding:var(--s4);text-align:center;color:#fff;opacity:.7;font-size:var(--t-body);")}>
                      Esta lección todavía no tiene vídeo.
                    </p>
                  )}
                </div>

                <h2 style={css(CABECERA + "margin:0;")}>{leccion.titulo || "Lección sin nombre"}</h2>

                {leccion.texto && (
                  <p style={css(LECTURA + "margin:0;white-space:pre-wrap;")}>{leccion.texto}</p>
                )}

                <div style={css("display:flex;gap:var(--s3);flex-wrap:wrap;align-items:center;margin-top:var(--s2);")}>
                  <button
                    data-guia="leccion"
                    onClick={() => marca(leccion, !hechas.has(leccion.id))}
                    style={css(hechas.has(leccion.id) ? BOTON_NORMAL : botonPrincipal())}
                  >
                    {hechas.has(leccion.id) ? "✓ Terminada" : "Marcar como terminada"}
                  </button>
                  {siguiente() && (
                    <button
                      onClick={() => {
                        const s = siguiente();
                        if (s) setAbierta(s.id);
                      }}
                      style={css(BOTON_PLANO)}
                    >
                      Siguiente lección →
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/*
        EL MATERIAL DEL CURSO, DEBAJO DE TODO.

        Aquí abajo y no arriba: quien abre un curso viene a ver la clase, y lo
        que se baja se busca después de verla o al terminar. Puesto arriba
        sería un trámite entre la persona y el vídeo.

        Fuera de la rejilla del reproductor a propósito —ocupa el ancho
        entero— porque no es parte de la lección que se está viendo: es del
        curso. Si no hay archivos, el componente no pinta nada.
      */}
      <Recursos cursoId={curso.id} recursos={curso.recursos ?? []} />

      {/* En pantalla ancha el temario vuelve a su columna de la derecha. En
          estrecho va debajo del vídeo —de ahí los `order` de arriba—: lo
          primero que tiene que verse al abrir una lección es la lección. */}
      {/*
        LA REJILLA VA ENTERA AQUÍ, Y NO LA MITAD EN EL ATRIBUTO `style`.

        Así estaba y por eso fallaba: una columna en la línea y dos columnas en
        esta hoja. Un estilo en línea gana siempre a una regla de hoja, así que
        la consulta de medios no se aplicaba NUNCA y el temario se quedaba
        debajo del vídeo también en pantalla ancha. Es la clase de fallo que no
        da error, no sale en la consola y sólo se ve mirando.

        En estrecho: el vídeo arriba y el temario debajo. Lo primero que tiene
        que verse al abrir una lección es la lección, no el índice.
        En ancho: el temario a la derecha, pegado arriba mientras se baja, para
        poder saltar de lección sin perder el sitio.
      */}
      <style>{`
        [data-reproductor] { grid-template-columns: minmax(0, 1fr); }
        @media (min-width: 900px) {
          [data-reproductor] { grid-template-columns: minmax(0, 1fr) 300px; }
          [data-reproductor] > nav {
            position: sticky;
            top: var(--s3);
            max-height: calc(100vh - 120px);
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}
