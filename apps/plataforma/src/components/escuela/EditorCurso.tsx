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
import { BOTON_NORMAL, BOTON_PLANO, CAMPO, CABECERA, NOTA, botonPrincipal, rotulo } from "@/lib/ui";
import Confirmar from "../Confirmar";
import SubirVideo from "./SubirVideo";
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
  alSalir,
  alGuardar,
}: {
  inicial: Curso;
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

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s4);max-width:900px;")}>
      {/* ------------------------------------------------------- la barra */}
      <div
        style={css(
          "position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;" +
            "padding:var(--s3) 0;background:var(--fondo);"
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

      {/* ------------------------------------------------------- la ficha */}
      <section
        style={css(
          "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
            "padding:var(--pad-card);box-shadow:var(--nm);display:flex;flex-direction:column;gap:var(--s3);"
        )}
      >
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

        {/*
          PUBLICAR ES UN GESTO APARTE, con su frase al lado diciendo qué pasa.
          Una casilla suelta que diga «publicado» no dice si publicar significa
          que lo ve todo el mundo o sólo quien lo ha comprado — y esa duda, en
          la pantalla de quien publica, es la que hace que no se publique.
        */}
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
            onChange={(e) => cambia({ publicado: e.target.checked })}
            style={css("margin-top:3px;width:17px;height:17px;flex:none;cursor:pointer;")}
          />
          <label htmlFor="curso-publicado" style={css("cursor:pointer;")}>
            <span style={css("display:block;font-size:var(--t-body);font-weight:600;color:var(--text);")}>
              Publicado
            </span>
            <span style={css(NOTA + "display:block;margin-top:3px;line-height:1.5;")}>
              {c.publicado
                ? "Lo ven las personas que han entrado en la escuela. Mientras no cobres por él, el acceso lo das tú desde Gestión."
                : "Es un borrador: no lo ve nadie más que tú. Puedes dejarlo a medias y seguir otro día."}
            </span>
          </label>
        </div>
      </section>

      {/* ------------------------------------------------------ el temario */}
      <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
        <h2 style={css(CABECERA + "margin:0;")}>El temario</h2>
        <span style={css(NOTA)}>
          {c.modulos.length === 0
            ? "Todavía no hay nada"
            : `${c.modulos.length} ${c.modulos.length === 1 ? "módulo" : "módulos"} · ${total} ${
                total === 1 ? "lección" : "lecciones"
              }`}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {c.modulos.map((m, im) => (
          <motion.section
            key={m.id}
            initial={quieto ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={quieto ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
                "padding:var(--pad-card);box-shadow:var(--nm);overflow:hidden;"
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
    </div>
  );
}
