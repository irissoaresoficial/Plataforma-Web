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
import { css } from "@/lib/css";
import { useSesion } from "@/lib/sesion";
import { CABECERA, LECTURA, NOTA, botonPrincipal, PANTALLA } from "@/lib/ui";
import EditorCurso, { cursoNuevo } from "../escuela/EditorCurso";
import Biblioteca from "../escuela/Biblioteca";
import Banda from "../Banda";
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
import { loLleva } from "@/lib/escuela/tipos";
import SecretariaIA from "../escuela/SecretariaIA";
import FichaCurso, { FichaNueva } from "../escuela/FichaCurso";


type Donde =
  | { que: "lista" }
  | { que: "edita"; curso: Curso }
  | { que: "ve"; curso: Curso };

export default function CursosScreen() {
  const { usuario, esAdmin, puede } = useSesion();
  const uid = usuario ? usuario.uid : "";
  /* Quien monta cursos sin ser Iris. Ve los suyos —en borrador también— y los
     que haya comprado, y edita sólo los suyos. */
  const creador = !esAdmin && puede("crear");
  const esMio = (c: Curso) => esAdmin || (creador && loLleva(c, uid));
  const [donde, setDonde] = useState<Donde>({ que: "lista" });
  const [lista, setLista] = useState<Curso[] | null>(null);
  const [avances, setAvances] = useState<Record<string, Avance | null>>({});
  const [fallo, setFallo] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "publicados" | "borradores">("todos");
  /* Inscritos por curso, sólo de los que monta quien mira. */
  const [alumnos, setAlumnos] = useState<Record<string, number>>({});

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
      const [publicados, mias, propios] = await Promise.all([
        repoCursos.publicados(),
        repoInscripciones.deAlumno(uid),
        puede("crear") ? repoCursos.deAutor(uid) : Promise.resolve([] as Curso[]),
      ]);
      const permitidos = new Set(mias.map((i) => i.cursoId));
      const comprados = publicados.filter((c) => permitidos.has(c.id) && !propios.some((p) => p.id === c.id));
      setLista([...propios, ...comprados]);
    } catch (e) {
      setLista([]);
      setFallo(e instanceof Error ? e.message : "No se han podido cargar los cursos.");
    }
  }, [esAdmin, puede, uid]);

  /*
   * UN CURSO NUEVO DE UN CREADOR SE GUARDA ANTES DE ABRIRLO.
   *
   * Iris puede subir vídeos a un curso que todavía no existe en la base; un
   * creador no, porque las reglas de subida miran en la ficha del curso de
   * quién es. Si no estuviera guardado, el primer vídeo que subiera fallaría
   * con un «no autorizado» que no explica nada. Guardado vacío, en borrador,
   * no lo ve nadie y las subidas ya saben que es suyo.
   */
  async function nuevo() {
    if (esAdmin) return setDonde({ que: "edita", curso: cursoNuevo() });
    setFallo("");
    const c: Curso = { ...cursoNuevo(), autor: uid, autorNombre: usuario ? usuario.nombre : "" };
    try {
      await repoCursos.guardar(c);
      setDonde({ que: "edita", curso: c });
    } catch (e) {
      setFallo(e instanceof Error ? e.message : "No se ha podido crear el curso.");
    }
  }

  useEffect(() => {
    void carga();
  }, [carga]);

  const mios = (lista ?? []).filter((c) => esMio(c));

  /*
   * BORRAR UN CURSO. Lo puede hacer Iris con cualquiera y un creador con sus
   * borradores: es exactamente lo que ya dejaban las reglas de Firestore, no
   * se ha abierto nada nuevo. Lo publicado de un creador lo borra Iris.
   *
   * Los archivos (vídeos, portada, material) se quedan en el almacén. Es a
   * propósito, por lo mismo que en `subir.ts`: borrar un curso es un gesto de
   * un clic, y borrar además sus vídeos lo haría irrecuperable de verdad.
   */
  const puedeBorrar = (c: Curso) => esAdmin || (creador && c.autor === uid && !c.publicado);

  async function borra(c: Curso) {
    setFallo("");
    try {
      await repoCursos.borrar(c.id);
      setLista((xs) => (xs ?? []).filter((x) => x.id !== c.id));
    } catch (e) {
      setFallo(
        "No se ha borrado «" + (c.titulo.trim() || "Curso sin nombre") + "». " +
          (e instanceof Error ? e.message : "Revisa la conexión y vuelve a probar.")
      );
    }
  }

  /* Los inscritos de cada curso propio. Falla en silencio: sin el dato la
     ficha no enseña la cifra, que es mejor que enseñar un cero falso. */
  useEffect(() => {
    if (!lista || !(esAdmin || creador)) return;
    let vivo = true;
    const propios = lista.filter((c) => esMio(c));
    Promise.all(propios.map((c) => repoInscripciones.deCurso(c.id).then((xs) => xs.length).catch(() => null))).then((ns) => {
      if (!vivo) return;
      const m: Record<string, number> = {};
      propios.forEach((c, i) => {
        const n = ns[i];
        if (n !== null) m[c.id] = n;
      });
      setAlumnos(m);
    });
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista, esAdmin, creador]);

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
        publica={esAdmin}
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
    const c = donde.curso;
    return (
      <Reproductor
        curso={c}
        uid={uid}
        alSalir={() => setDonde({ que: "lista" })}
        alEditar={esMio(c) ? () => setDonde({ que: "edita", curso: c }) : undefined}
      />
    );
  }

  /* ------------------------------------------------------------- la lista */

  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--s4);")}>
      <Banda
        /* La Iris del curso, la misma del banner de la web (19 nov 2026). */
        foto="/escuela/numerologia-iris.jpg"
        encuadre="100% 22%"
        fotoALaDerecha
        titulo={esAdmin ? "Cursos" : "Mis cursos"}
        sub={
          esAdmin
            ? "Lo que montas, lo que está publicado y lo que te piden publicar."
            : creador
              ? "Los cursos que montas y los que estás haciendo."
              : "Las clases que tienes, y por dónde vas en cada una."
        }
        cifras={
          lista === null
            ? []
            : esAdmin || creador
              ? [
                  { n: lista.filter((c) => esMio(c)).length, que: "Cursos" },
                  { n: lista.filter((c) => esMio(c) && c.publicado).length, que: "Publicados" },
                ]
              : [{ n: lista.length, que: lista.length === 1 ? "Curso" : "Cursos" }]
        }
        accion={
          (esAdmin || creador) && (
            <button
              data-guia="curso"
              onClick={() => void nuevo()}
              style={css(botonPrincipal() + "background:var(--sobre-bloque);color:var(--vino);border-color:var(--sobre-bloque);")}
            >
              + Nuevo curso
            </button>
          )
        }
      />

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
          {esAdmin || creador ? (
            <>
              <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Todavía no has creado ningún curso</h2>
              <p style={css(LECTURA + "margin:0 auto var(--s4);max-width:52ch;")}>
                Un curso se monta en varios ratos: lo empiezas, lo dejas, lo sigues. Mientras no lo publiques no lo ve
                nadie, así que puedes crearlo ahora aunque sólo tengas el nombre.
              </p>
              {creador && (
                <p style={css(LECTURA + "margin:0 auto var(--s4);max-width:52ch;")}>
                  Cuando esté listo, pides que se publique e Iris lo revisa.
                </p>
              )}
              <button onClick={() => void nuevo()} style={css(botonPrincipal())}>
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
      {/* Quien estudia ve su biblioteca; las fichas de abajo son para quien
          monta cursos: Iris todos, un creador los suyos. */}
      {!esAdmin && (
        <Biblioteca
          cursos={(lista ?? []).filter((c) => !esMio(c))}
          avances={avances}
          abrir={(c) => setDonde({ que: "ve", curso: c })}
        />
      )}
      {creador && (lista ?? []).some(esMio) && (lista ?? []).some((c) => !esMio(c)) && (
        <h2 style={css("margin:var(--s4) 0 0;font-size:var(--t-head);font-weight:500;letter-spacing:-.02em;")}>Los que montas</h2>
      )}
      {/* ---------------------------------------- los filtros, si hay de qué */}
      {(esAdmin || creador) && mios.length > 2 && (
        <div role="tablist" aria-label="Qué cursos ver" style={css("display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 calc(var(--s1) * -1);padding:2px var(--s1);")}>
          {(
            [
              ["todos", "Todos", mios.length],
              ["publicados", "Publicados", mios.filter((c) => c.publicado).length],
              ["borradores", "Borradores", mios.filter((c) => !c.publicado).length],
            ] as const
          ).map(([k, t, n]) => {
            const activo = filtro === k;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={activo}
                onClick={() => setFiltro(k)}
                style={css(
                  "display:inline-flex;align-items:center;gap:8px;padding:7px 8px 7px 15px;border-radius:var(--r-pill);cursor:pointer;flex:none;white-space:nowrap;" +
                    "font:inherit;font-size:var(--t-body);font-weight:500;" +
                    (activo
                      ? "background:var(--vino);color:var(--sobre-bloque);border:1px solid var(--vino);"
                      : "background:var(--surface);color:var(--text-2);border:1px solid var(--border);")
                )}
              >
                {t}
                <span
                  style={css(
                    "min-width:24px;padding:1px 7px;border-radius:var(--r-pill);font-size:var(--t-mini);font-variant-numeric:tabular-nums;" +
                      (activo
                        ? "background:rgba(255,255,255,.16);color:var(--sobre-bloque);"
                        : "background:var(--surface-2);color:var(--text-3);")
                  )}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {lista !== null && lista.length > 0 && (
        <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr));")}>
          {(lista ?? [])
            .filter((c) => esAdmin || esMio(c))
            .filter((c) => (filtro === "publicados" ? c.publicado : filtro === "borradores" ? !c.publicado : true))
            .map((c, i) => (
              <FichaCurso
                key={c.id}
                c={c}
                i={i}
                total={totalLecciones(c)}
                minutos={c.modulos.reduce((n, m) => n + m.lecciones.reduce((k, l) => k + (l.minutos || 0), 0), 0)}
                parte={progreso(c, avances[c.id] ?? null)}
                alumnos={esMio(c) && c.id in alumnos ? alumnos[c.id] : null}
                esMio={esMio(c)}
                esAdmin={esAdmin}
                puedeBorrar={puedeBorrar(c)}
                entrar={() => setDonde({ que: "ve", curso: c })}
                editar={() => setDonde({ que: "edita", curso: c })}
                borrar={() => void borra(c)}
              />
            ))}
          {(esAdmin || creador) && filtro !== "publicados" && <FichaNueva alPulsar={() => void nuevo()} />}
        </div>
      )}
      {/* La empresa conectada, en cada pantalla del creador. */}
      {puede("crear") && !puede("despacho") && <SecretariaIA compacta />}
    </div>
  );
}
