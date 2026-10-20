"use client";

/**
 * ============================================================================
 * DONDE IRIS MONTA UN CURSO
 * ============================================================================
 *
 * La pantalla de la que depende que la escuela sea suya. Si para añadir una
 * lección hay que escribirme, la escuela se para el día que yo no conteste.
 *
 * TRES DECISIONES QUE EXPLICAN CÓMO ES ESTO POR DENTRO
 * ---------------------------------------------------------------------------
 *
 * 1. SE GUARDA PULSANDO, NO SOLO.
 *
 *    Lo que se lleva ahora es guardar al teclear, y aquí sería un error. Un
 *    curso publicado lo están viendo alumnos MIENTRAS ella lo edita: con
 *    guardado automático, un título a medio escribir aparece en la pantalla de
 *    alguien. Pulsando, ella decide cuándo lo de dentro sale fuera.
 *
 *    Lo que eso trae —perder el trabajo al cerrar sin guardar— se tapa por los
 *    dos sitios por los que se pierde: el aviso del navegador al cerrar la
 *    pestaña, y la pregunta al volver atrás.
 *
 * 2. BORRADOR ES EL ESTADO NORMAL, no una opción avanzada.
 *
 *    Un curso se monta en varios ratos. Si lo primero que hace un curso nuevo
 *    es aparecer, hay que montarlo de una sentada o enseñar los huecos. Nace en
 *    borrador y publicar es un gesto aparte y explícito.
 *
 * 3. NADA PIDE SABER NADA.
 *
 *    No hay un campo «identificador», ni «slug», ni «orden». Todo eso lo pone
 *    el código. Los minutos los escribe ella porque acaba de grabar y los sabe.
 *
 *    Y EL VÍDEO SE SUBE, NO SE PEGA. Al principio esto pedía un enlace, y aun
 *    traduciéndolo bien seguía obligando a tener el vídeo colgado en algún
 *    sitio y a saber de dónde se copia la dirección. Desde el 15 de octubre de
 *    2026 se elige el archivo del ordenador y va a Firebase. Pegar un enlace
 *    sigue estando, debajo y en pequeño, para la clase que ya vive en otra
 *    parte.
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, BOTON_PLANO, CAMPO, NOTA, PANTALLA, TARJETA, botonPrincipal, rotulo } from "@/lib/ui";
import Confirmar from "../Confirmar";
import SubirVideo from "./SubirVideo";
import Recursos from "./Recursos";
import { portadaDe } from "@/lib/escuela/portadas";
import { cursos as repo, nuevoId, totalLecciones, type Curso, type Leccion, type Modulo } from "@/lib/escuela";

/** Un curso recién nacido: en borrador y sin nada dentro. */
export function cursoNuevo(): Curso {
  const ahora = new Date().toISOString();
  return {
    id: nuevoId(),
    titulo: "",
    descripcion: "",
    portada: "",
    publicado: false,
    modulos: [],
    creado: ahora,
    tocado: ahora,
  };
}

type Estado = "limpio" | "sucio" | "guardando" | "error";

export default function EditorCurso({
  inicial,
  publica,
  alSalir,
  alGuardar,
}: {
  inicial: Curso;
  /** Iris publica; un creador sólo pide que se publique. */
  publica: boolean;
  alSalir: () => void;
  /** Para que la lista de fuera se entere sin volver a preguntar a la base. */
  alGuardar: (c: Curso) => void;
}) {
  const [c, setC] = useState<Curso>(inicial);
  const [estado, setEstado] = useState<Estado>("limpio");
  const [fallo, setFallo] = useState("");
  const quieto = useReducedMotion();

  /** Todo cambio pasa por aquí, y por eso no hay forma de cambiar algo y que
   *  el botón de guardar siga diciendo que no hay nada que guardar. */
  const cambia = (parche: Partial<Curso>) => {
    setC((x) => ({ ...x, ...parche }));
    setEstado("sucio");
  };

  /*
   * EL AVISO DEL NAVEGADOR AL CERRAR LA PESTAÑA.
   *
   * Es la única forma de interceptar a quien cierra la ventana o pulsa atrás
   * del navegador — ahí la aplicación ya no manda. El navegador enseña su
   * propio texto, no se puede escribir el nuestro, y hay que aguantarlo: es
   * feo, pero es eso o el trabajo de media tarde.
   *
   * Sólo se engancha cuando hay algo que perder. Un aviso al cerrar una
   * pantalla donde no se ha tocado nada es exactamente lo que enseña a pulsar
   * «salir» sin leer, y entonces no sirve el día que sí había algo.
   */
  useEffect(() => {
    if (estado !== "sucio") return;
    const avisa = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisa);
    return () => window.removeEventListener("beforeunload", avisa);
  }, [estado]);

  async function guarda() {
    setEstado("guardando");
    setFallo("");
    try {
      const guardado = { ...c, tocado: new Date().toISOString() };
      await repo.guardar(guardado);
      setC(guardado);
      alGuardar(guardado);
      setEstado("limpio");
    } catch (e) {
      /*
       * SE QUEDA EN PANTALLA LO QUE ELLA ESCRIBIÓ, no lo que había guardado.
       * Volver atrás sería tirar su trabajo encima del fallo. Puede corregir la
       * conexión y pulsar otra vez.
       */
      setEstado("error");
      setFallo(e instanceof Error ? e.message : "No se ha podido guardar.");
    }
  }

  /* ------------------------------------------------------------- módulos */

  const ponModulos = (modulos: Modulo[]) => cambia({ modulos });

  const nuevoModulo = () =>
    ponModulos([...c.modulos, { id: nuevoId(), titulo: "", lecciones: [] }]);

  const cambiaModulo = (i: number, parche: Partial<Modulo>) =>
    ponModulos(c.modulos.map((m, j) => (j === i ? { ...m, ...parche } : m)));

  const borraModulo = (i: number) => ponModulos(c.modulos.filter((_, j) => j !== i));

  /** Mover un módulo arriba o abajo. Es reordenar un array, y eso es todo
   *  —no hay campo `orden` que mantener— porque el curso es un documento. */
  const mueveModulo = (i: number, salto: number) => {
    const j = i + salto;
    if (j < 0 || j >= c.modulos.length) return;
    const xs = [...c.modulos];
    [xs[i], xs[j]] = [xs[j], xs[i]];
    ponModulos(xs);
  };

  /* ------------------------------------------------------------ lecciones */

  const nuevaLeccion = (im: number) =>
    cambiaModulo(im, {
      lecciones: [
        ...c.modulos[im].lecciones,
        { id: nuevoId(), titulo: "", video: "", texto: "", minutos: 0 },
      ],
    });

  const cambiaLeccion = (im: number, il: number, parche: Partial<Leccion>) =>
    cambiaModulo(im, {
      lecciones: c.modulos[im].lecciones.map((l, j) => (j === il ? { ...l, ...parche } : l)),
    });

  const borraLeccion = (im: number, il: number) =>
    cambiaModulo(im, { lecciones: c.modulos[im].lecciones.filter((_, j) => j !== il) });

  const mueveLeccion = (im: number, il: number, salto: number) => {
    const xs = [...c.modulos[im].lecciones];
    const j = il + salto;
    if (j < 0 || j >= xs.length) return;
    [xs[il], xs[j]] = [xs[j], xs[il]];
    cambiaModulo(im, { lecciones: xs });
  };

  /* ---------------------------------------------------------------- salir */

  const salir = () => alSalir();

  /* ------------------------------------------------------------- pintura */

  const etiqueta = (t: string) =>
    css("display:block;" + rotulo() + "margin-bottom:6px;");

  const total = totalLecciones(c);

  /* Lo que el curso tiene dentro, contado. Va en la cabecera y en la
     lista de comprobación de la derecha: es lo mismo dicho dos veces. */
  const minutos = c.modulos.reduce((s, m) => s + m.lecciones.reduce((t, l) => t + (l.minutos || 0), 0), 0);
  const conVideo = c.modulos.some((m) => m.lecciones.some((l) => l.video));
  const listo: Array<[string, boolean]> = [
    ["Tiene nombre", c.titulo.trim().length > 0],
    ["Dice de qué va", c.descripcion.trim().length > 0],
    ["Tiene al menos una lección", total > 0],
    ["Alguna lección tiene vídeo", conVideo],
  ];
  const estadoCurso = c.publicado ? "Publicado" : c.revision ? "En revisión" : "Borrador";

  /*
   * EL EDITOR, REHECHO EL 20 DE OCTUBRE DE 2026. Gerson: «esto no está
   * alineado (…) cada sección se debe de saber de qué va, para eso las
   * imágenes».
   *
   * Tenía razón en las dos cosas. Era la única pantalla de la plataforma sin
   * el margen de las demás: pegada a la columna, a 900 px y sin centrar, así
   * que el «Volver» y los títulos tocaban el borde. Ahora usa el mismo
   * `PANTALLA` que todas.
   *
   * Y eran tres bloques iguales uno debajo de otro. Ahora son tres PASOS,
   * cada uno con su número, su foto de la casa y una línea que dice para
   * qué es. Publicar sale del formulario y va a la columna de la derecha,
   * con lo que falta para que el curso esté listo, porque no es un dato más
   * del curso: es lo último que se hace.
   */
  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--gap);")}>
      {/* ------------------------------------------------------- la barra */}
      <div
        style={css(
          /* Cristal de verdad, como la cabecera. Aquí ponía `var(--fondo)`,
             que no existe: la barra era transparente y el formulario pasaba
             por debajo de los botones al bajar. Va pegada justo bajo la
             cabecera de la aplicación (63 px), no encima de ella. */
          "position:sticky;top:75px;z-index:20;display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;" +
            "padding:10px 12px;border-radius:var(--r-pill);background:var(--vidrio-denso);" +
            "backdrop-filter:var(--vidrio-difuminado);-webkit-backdrop-filter:var(--vidrio-difuminado);" +
            "border:1px solid var(--border);box-shadow:var(--shadow-sm);"
        )}
      >
        {estado === "sucio" ? (
          <Confirmar
            estilo={BOTON_PLANO}
            pregunta="Has cambiado cosas y no las has guardado. Si sales ahora se pierden."
            confirmar="Salir sin guardar"
            alConfirmar={salir}
          >
            ← Volver
          </Confirmar>
        ) : (
          <button onClick={salir} style={css(BOTON_PLANO)}>
            ← Volver
          </button>
        )}

        <span style={css(NOTA + "margin-left:auto;")} aria-live="polite">
          {estado === "guardando" && "Guardando…"}
          {estado === "limpio" && "Todo guardado"}
          {estado === "sucio" && "Sin guardar"}
          {estado === "error" && "No se ha guardado"}
        </span>

        <button
          onClick={guarda}
          disabled={estado === "limpio" || estado === "guardando"}
          style={css(botonPrincipal(estado === "sucio" || estado === "error"))}
        >
          Guardar
        </button>
      </div>

      {fallo && (
        <p
          role="alert"
          style={css(
            "margin:0;padding:12px 14px;border-radius:var(--r-sm);border:1px solid var(--alarma, #C0392B);" +
              "background:color-mix(in srgb, var(--alarma, #C0392B) 10%, transparent);font-size:var(--t-mini);line-height:1.5;"
          )}
        >
          <strong>No se ha guardado.</strong> {fallo} Lo que has escrito sigue en pantalla: arregla la conexión y
          vuelve a pulsar Guardar.
        </p>
      )}

      {/* ------------------------------------------------- la cabecera */}
      <header
        style={css(
          "position:relative;overflow:hidden;border-radius:var(--r-tarjeta);min-height:220px;" +
            "display:flex;align-items:flex-end;background:var(--bloque);box-shadow:var(--nm-alto);"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portadaDe(c)}
          alt=""
          style={css("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%;")}
        />
        <div
          aria-hidden="true"
          style={css("position:absolute;inset:0;background:linear-gradient(90deg,rgba(34,29,31,.88) 0%,rgba(34,29,31,.55) 55%,rgba(34,29,31,.2) 100%);")}
        />
        <div style={css("position:relative;padding:var(--pad-card);display:flex;flex-direction:column;gap:10px;min-width:0;")}>
          <span
            style={css(
              "align-self:flex-start;font-size:var(--t-mini);font-weight:500;padding:4px 12px;border-radius:var(--r-pill);" +
                (c.publicado
                  ? "background:var(--oro-luz);color:var(--vino);"
                  : "background:var(--bloque-2);border:1px solid var(--bloque-borde);color:var(--sobre-bloque);")
            )}
          >
            {estadoCurso}
          </span>
          <h1
            style={css(
              "margin:0;font-family:var(--font-display);font-variation-settings:normal;font-weight:300;" +
                "font-size:clamp(30px,3.6vw,46px);letter-spacing:-.03em;line-height:1.05;color:var(--sobre-bloque);overflow-wrap:anywhere;"
            )}
          >
            {c.titulo.trim() || "Curso sin nombre"}
          </h1>
          <span style={css("font-size:var(--t-body);color:var(--sobre-bloque-2);")}>
            {c.modulos.length} {c.modulos.length === 1 ? "módulo" : "módulos"} · {total} {total === 1 ? "lección" : "lecciones"}
            {minutos > 0 && ` · ${minutos} min`}
          </span>
        </div>
      </header>

      <div data-editor-rejilla="">
        <div style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
          {/* ------------------------------------------- 1 · lo básico */}
          <Paso n={1} foto="/escuela/basico.jpg" titulo="Lo básico" que="El nombre, de qué va y la portada. Es lo que se ve antes de entrar.">
            <div>
              <label htmlFor="curso-titulo" style={etiqueta("")}>
                Nombre del curso
              </label>
              <input
                id="curso-titulo"
                value={c.titulo}
                onChange={(e) => cambia({ titulo: e.target.value })}
                placeholder="Desórdenes Amorosos"
                style={css(CAMPO + "font-size:var(--t-read);")}
              />
            </div>

            <div>
              <label htmlFor="curso-desc" style={etiqueta("")}>
                De qué va
              </label>
              <textarea
                id="curso-desc"
                value={c.descripcion}
                onChange={(e) => cambia({ descripcion: e.target.value })}
                rows={4}
                placeholder="Lo que se lee antes de entrar. Dos o tres frases bastan."
                style={css(CAMPO + "resize:vertical;line-height:1.6;")}
              />
            </div>

            <div>
              <label htmlFor="curso-portada" style={etiqueta("")}>
                Portada <span style={css(NOTA)}>— opcional</span>
              </label>
              <input
                id="curso-portada"
                value={c.portada}
                onChange={(e) => cambia({ portada: e.target.value })}
                placeholder="Pega aquí la dirección de una imagen"
                style={css(CAMPO)}
              />
              <p style={css(NOTA + "margin:6px 0 0;")}>
                Si lo dejas vacío sale un fondo liso con la inicial. No pasa nada por no poner ninguna.
              </p>
            </div>
          </Paso>

          {/* -------------------------------------------- 2 · el temario */}
          <Paso
            n={2}
            foto="/escuela/temario.jpg"
            titulo="El temario"
            que="Módulos y lecciones, en el orden en que se ven. Cada lección lleva su vídeo."
          >
          <AnimatePresence initial={false}>
            {c.modulos.map((m, im) => (
              <motion.section
                key={m.id}
                initial={quieto ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={quieto ? { opacity: 0 } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={css(
                  "background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-lg);" +
                    "padding:var(--pad-card-sm);overflow:hidden;"
                )}
              >
                <div style={css("display:flex;align-items:center;gap:10px;flex-wrap:wrap;")}>
                  <span style={css(NOTA + "flex:none;")}>Módulo {im + 1}</span>
                  <input
                    value={m.titulo}
                    onChange={(e) => cambiaModulo(im, { titulo: e.target.value })}
                    placeholder="Nombre del módulo"
                    aria-label={`Nombre del módulo ${im + 1}`}
                    style={css(CAMPO + "flex:1 1 220px;font-weight:600;")}
                  />
                  <div style={css("display:flex;gap:4px;flex:none;")}>
                    <button
                      onClick={() => mueveModulo(im, -1)}
                      disabled={im === 0}
                      title="Subir"
                      aria-label={`Subir el módulo ${im + 1}`}
                      style={css(BOTON_PLANO + (im === 0 ? "opacity:.3;cursor:default;" : ""))}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => mueveModulo(im, 1)}
                      disabled={im === c.modulos.length - 1}
                      title="Bajar"
                      aria-label={`Bajar el módulo ${im + 1}`}
                      style={css(BOTON_PLANO + (im === c.modulos.length - 1 ? "opacity:.3;cursor:default;" : ""))}
                    >
                      ↓
                    </button>
                    <Confirmar
                      estilo={BOTON_PLANO}
                      titulo={`Borrar el módulo ${im + 1}`}
                      pregunta={
                        m.lecciones.length > 0
                          ? `Se borra el módulo y sus ${m.lecciones.length} ${
                              m.lecciones.length === 1 ? "lección" : "lecciones"
                            }.`
                          : "Se borra este módulo."
                      }
                      confirmar="Borrar"
                      alConfirmar={() => borraModulo(im)}
                    >
                      ✕
                    </Confirmar>
                  </div>
                </div>

                {/* --------------------------------------------- las lecciones */}
                <div style={css("display:flex;flex-direction:column;gap:var(--s3);margin-top:var(--s3);")}>
                  {m.lecciones.map((l, il) => (
                    <div
                      key={l.id}
                      style={css(
                        "border:1px solid var(--border);border-radius:var(--r-sm);padding:var(--s3);" +
                          "display:flex;flex-direction:column;gap:10px;"
                      )}
                    >
                      <div style={css("display:flex;align-items:center;gap:10px;flex-wrap:wrap;")}>
                        <span style={css(NOTA + "flex:none;")}>{im + 1}.{il + 1}</span>
                        <input
                          value={l.titulo}
                          onChange={(e) => cambiaLeccion(im, il, { titulo: e.target.value })}
                          placeholder="Nombre de la lección"
                          aria-label={`Nombre de la lección ${im + 1}.${il + 1}`}
                          style={css(CAMPO + "flex:1 1 200px;")}
                        />
                        <div style={css("display:flex;gap:4px;flex:none;")}>
                          <button
                            onClick={() => mueveLeccion(im, il, -1)}
                            disabled={il === 0}
                            aria-label="Subir la lección"
                            style={css(BOTON_PLANO + (il === 0 ? "opacity:.3;cursor:default;" : ""))}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => mueveLeccion(im, il, 1)}
                            disabled={il === m.lecciones.length - 1}
                            aria-label="Bajar la lección"
                            style={css(BOTON_PLANO + (il === m.lecciones.length - 1 ? "opacity:.3;cursor:default;" : ""))}
                          >
                            ↓
                          </button>
                          <Confirmar
                            estilo={BOTON_PLANO}
                            titulo="Borrar la lección"
                            pregunta="Se borra esta lección."
                            confirmar="Borrar"
                            alConfirmar={() => borraLeccion(im, il)}
                          >
                            ✕
                          </Confirmar>
                        </div>
                      </div>

                      <div style={css("display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start;")}>
                        <div style={css("flex:1 1 260px;min-width:0;")}>
                          <SubirVideo
                            cursoId={c.id}
                            valor={l.video}
                            alCambiar={(video) => cambiaLeccion(im, il, { video })}
                            etiqueta={l.titulo || `la lección ${im + 1}.${il + 1}`}
                          />
                        </div>
                        <input
                          type="number"
                          min={0}
                          value={l.minutos || ""}
                          onChange={(e) => cambiaLeccion(im, il, { minutos: Number(e.target.value) || 0 })}
                          placeholder="min"
                          aria-label="Duración en minutos"
                          style={css(CAMPO + "flex:0 0 92px;")}
                        />
                      </div>

                      <textarea
                        value={l.texto}
                        onChange={(e) => cambiaLeccion(im, il, { texto: e.target.value })}
                        rows={2}
                        placeholder="Lo que se lee al lado del vídeo. Opcional."
                        aria-label="Texto de la lección"
                        style={css(CAMPO + "resize:vertical;line-height:1.6;")}
                      />
                    </div>
                  ))}

                  <button onClick={() => nuevaLeccion(im)} style={css(BOTON_NORMAL + "align-self:flex-start;")}>
                    + Añadir lección
                  </button>
                </div>
              </motion.section>
            ))}
          </AnimatePresence>


            <button onClick={nuevoModulo} style={css(BOTON_NORMAL + "align-self:flex-start;")}>
              + Añadir módulo
            </button>
          </Paso>

          {/*
            EL MATERIAL QUE SE BAJA, DEBAJO DEL TEMARIO.

            Mismo orden que ve la alumna en el reproductor, a propósito: primero
            las clases, después lo que se lleva. Que Iris monte el curso en el
            mismo orden en que se va a leer es lo que hace que sepa cómo le queda
            sin tener que salir a mirarlo.

            SUBIR UN ARCHIVO SÍ TOCA EL ALMACÉN AL MOMENTO —el archivo se va para
            arriba en cuanto se pulsa Subir— pero la FICHA entra en el curso como
            cualquier otro cambio, por `cambia()`, y se guarda con el botón de
            Guardar. Así no hay dos caminos por los que el documento del curso se
            escriba, que es como se pierde un módulo recién creado.

            Lo que eso arrastra, dicho: si Iris sube un archivo y cierra sin
            guardar, el archivo se queda en el almacén sin estar en ningún curso.
            Ocupa unos céntimos y nadie lo ve. La alternativa —guardar el curso
            entero a su espalda al subir— puede pisarle un título a medio
            escribir, y eso sí se nota.
          */}
          <Paso n={3} foto="/escuela/material.jpg" titulo="Material" que="Lo que se descarga: un PDF, una plantilla, un audio.">
            <Recursos
              cursoId={c.id}
              recursos={c.recursos ?? []}
              puedeEditar
              enPaso
              alCambiar={(recursos) => cambia({ recursos })}
            />
          </Paso>
        </div>

        {/* ----------------------------------------------- la columna */}
        <aside data-editor-lado="" style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
          <section style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);")}>
            <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>Publicar</h2>
            {/* La lista de lo que falta. No impide nada —un curso se puede
                publicar a medias si se quiere—, pero dice lo que hay. */}
            <ul style={css("list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;")}>
              {listo.map(([que, si]) => (
                <li key={que} style={css("display:flex;align-items:center;gap:10px;font-size:var(--t-body);color:" + (si ? "var(--text)" : "var(--text-3)") + ";")}>
                  <span
                    aria-hidden="true"
                    style={css(
                      "flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:var(--t-micro);" +
                        (si ? "background:var(--accion);color:var(--sobre-accion);" : "border:1.5px dashed var(--border-strong);")
                    )}
                  >
                    {si ? "✓" : ""}
                  </span>
                  {que}
                  <span className="sr-only" style={css("position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);")}>
                    {si ? " (hecho)" : " (falta)"}
                  </span>
                </li>
              ))}
            </ul>
            {/*
              PUBLICAR ES UN GESTO APARTE, con su frase al lado diciendo qué pasa.
              Una casilla suelta que diga «publicado» no dice si publicar significa
              que lo ve todo el mundo o sólo quien lo ha comprado — y esa duda, en
              la pantalla de quien publica, es la que hace que no se publique.
            */}
            {/*
              EL CREADOR NO PUBLICA: PIDE. La casilla es la misma y en el mismo
              sitio, para que no haya dos maneras de hacer lo mismo; lo que cambia
              es lo que significa marcarla. Las reglas de Firestore lo aseguran
              además: aunque alguien tocara esto desde la consola, un creador no
              puede cambiar `publicado`.
            */}
            {!publica && (
              <div
                style={css(
                  "display:flex;align-items:flex-start;gap:12px;padding:14px;border-radius:var(--r-sm);" +
                    "border:1px solid var(--border);background:color-mix(in srgb, var(--text) 3%, transparent);"
                )}
              >
                <input
                  id="curso-revision"
                  type="checkbox"
                  checked={c.publicado || Boolean(c.revision)}
                  disabled={c.publicado}
                  onChange={(e) => cambia({ revision: e.target.checked })}
                  style={css("margin-top:3px;width:17px;height:17px;flex:none;cursor:pointer;")}
                />
                <label htmlFor="curso-revision" style={css("cursor:pointer;")}>
                  <span style={css("display:block;font-size:var(--t-body);font-weight:500;color:var(--text);")}>
                    {c.publicado ? "Publicado" : "Pedir que se publique"}
                  </span>
                  <span style={css(NOTA + "display:block;margin-top:3px;line-height:1.5;")}>
                    {c.publicado
                      ? "Ya lo ven sus alumnos. Lo que cambies se ve en cuanto guardes."
                      : c.revision
                        ? "Iris lo revisa y lo publica. Puedes seguir cambiándolo mientras."
                        : "Es un borrador: no lo ve nadie más que tú. Márcalo cuando esté listo y guarda."}
                  </span>
                </label>
              </div>
            )}
            {publica && (
            <div
              style={css(
                "display:flex;align-items:flex-start;gap:12px;padding:14px;border-radius:var(--r-sm);" +
                  "border:1px solid var(--border);background:color-mix(in srgb, var(--text) 3%, transparent);"
              )}
            >
              <input
                id="curso-publicado"
                type="checkbox"
                checked={c.publicado}
                onChange={(e) => cambia(e.target.checked ? { publicado: true, revision: false } : { publicado: false })}
                style={css("margin-top:3px;width:17px;height:17px;flex:none;cursor:pointer;")}
              />
              <label htmlFor="curso-publicado" style={css("cursor:pointer;")}>
                <span style={css("display:block;font-size:var(--t-body);font-weight:600;color:var(--text);")}>
                  Publicado
                </span>
                <span style={css(NOTA + "display:block;margin-top:3px;line-height:1.5;")}>
                  {c.publicado
                    ? "Lo ven las personas que han entrado en la escuela. Mientras no cobres por él, el acceso lo das tú desde Gestión."
                    : c.revision
                      ? `${c.autorNombre || "Su creador"} pide que lo publiques. Míralo y, si está bien, márcalo y guarda.`
                      : "Es un borrador: no lo ve nadie más que tú. Puedes dejarlo a medias y seguir otro día."}
                </span>
              </label>
            </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

/**
 * UN PASO DEL EDITOR: número, foto, título y para qué es.
 *
 * La foto no es adorno: es la que hace que, bajando por un curso largo, se
 * sepa en qué parte se está sin leer el título. Son fotos de la casa, las
 * mismas de la web.
 */
function Paso({ n, foto, titulo, que, children }: { n: number; foto: string; titulo: string; que: string; children: React.ReactNode }) {
  return (
    <section style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s4);")}>
      <div style={css("display:flex;align-items:center;gap:var(--s4);")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto} alt="" style={css("flex:none;width:72px;height:72px;border-radius:var(--r-lg);object-fit:cover;")} />
        <div style={css("min-width:0;")}>
          <div style={css("font-size:var(--t-mini);font-weight:500;color:var(--text-3);")}>Paso {n}</div>
          <h2 style={css("margin:2px 0 0;font-size:var(--t-head);font-weight:500;letter-spacing:-.025em;line-height:1.15;color:var(--text);")}>{titulo}</h2>
          <p style={css("margin:4px 0 0;font-size:var(--t-body);color:var(--text-3);line-height:1.45;")}>{que}</p>
        </div>
      </div>
      <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>{children}</div>
    </section>
  );
}
