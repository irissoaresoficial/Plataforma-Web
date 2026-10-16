"use client";

/**
 * ============================================================================
 * EL RECIBIDOR DE LA ESCUELA
 * ============================================================================
 *
 * La primera pantalla de quien entra. El equivalente de la consulta para Iris:
 * el sitio donde se cae al abrir y al que se vuelve.
 *
 * LO QUE ESTABA MAL Y POR QUÉ SE REHIZO
 * ---------------------------------------------------------------------------
 * Gerson, mirándola: «no me gusta cómo está alineado, no me gusta la UI». Tres
 * cosas concretas, y las tres eran de verdad:
 *
 *   1. EL SALUDO ERA UNA CAJA ENORME CON UN AGUJERO DENTRO. Dos líneas de
 *      texto arriba a la izquierda y debajo medio metro de nada, con borde
 *      alrededor para enmarcar el vacío. Un recuadro es una promesa de que
 *      dentro hay algo; si no lo hay, la promesa sale fallida.
 *
 *      Un saludo no es un objeto: es el encabezado de la página. Ahora es un
 *      título, sin caja, sin borde y sin relleno de sobra.
 *
 *   2. NADA SE ALINEABA CON NADA. El saludo tenía un relleno, el aviso otro y
 *      las tarjetas otro, así que los textos empezaban en tres verticales
 *      distintas. Eso no se sabe nombrar al verlo —se siente como que está
 *      descuidado— y es de lo que más separa una herramienta cara de una
 *      barata. Ahora todo arranca en la misma línea.
 *
 *   3. ESTABA VACÍA. Tres tarjetas que sólo decían a dónde llevan, en una
 *      pantalla donde cabían diez. El hueco no se arregla estirando lo que
 *      hay: se arregla poniendo algo que importe. Y lo que importa en el
 *      recibidor de una escuela es POR DÓNDE IBAS: los cursos empezados, con
 *      su avance, y el botón de seguir.
 *
 * La regla que queda, para cuando esto crezca: esta pantalla responde «¿qué
 * hago ahora?». Todo lo que no ayude a contestar eso sobra, por bonito que
 * quede.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp, type View } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import { CABECERA, NOTA, TITULO, botonPrincipal , PANTALLA} from "@/lib/ui";
import { IcoComunidad, IcoCursos, IcoRecursos } from "../Iconos";
import PanelInicio from "../escuela/PanelInicio";
import {
  avance as repoAvance,
  cursos as repoCursos,
  inscripciones as repoInscripciones,
  porDondeIba,
  progreso,
  totalLecciones,
  type Avance,
  type Curso,
} from "@/lib/escuela";
import type { Capacidad } from "@/lib/roles";

type Ico = (p: { size?: number }) => React.JSX.Element;

/**
 * Las puertas de la escuela, con la llave que pide cada una y SU COLOR.
 *
 * El color no decora: identifica. Los cursos son melocotón en todas partes, la
 * comunidad rosa, los recursos lavanda — aquí, en el icono de dentro de cada
 * pantalla y en lo que venga después. A la tercera visita se sabe dónde se
 * está antes de haber leído el título, y eso es lo que separa una herramienta
 * grande y ordenada de una grande y confusa.
 *
 * Ir todo en granate sería más «de marca» y no informaría de nada: el granate
 * y el oro dicen de quién es la plataforma, no en qué parte estás.
 */
const PUERTAS: Array<{ k: View; llave: Capacidad; titulo: string; que: string; Ico: Ico; tono: string }> = [
  {
    k: "cursos",
    llave: "cursos",
    titulo: "Cursos",
    que: "Las clases, por módulos, con el vídeo y los materiales de cada una.",
    Ico: IcoCursos,
    tono: "melocoton",
  },
  {
    k: "comunidad",
    llave: "comunidad",
    titulo: "Comunidad",
    que: "Donde se pregunta, se responde y se comparte lo que uno va viendo.",
    Ico: IcoComunidad,
    tono: "rosa",
  },
  {
    k: "recursos",
    llave: "recursos",
    titulo: "Recursos",
    que: "La biblioteca: plantillas, guías y audios para descargar.",
    Ico: IcoRecursos,
    tono: "lavanda",
  },
];

export default function EscuelaScreen() {
  const { setView } = useApp();
  const { usuario, puede, esAdmin } = useSesion();
  const uid = usuario ? usuario.uid : "";
  const quieto = useReducedMotion();

  const [empezados, setEmpezados] = useState<Array<{ curso: Curso; av: Avance | null }>>([]);

  /*
   * LO QUE SE ESTÁ VIENDO AHORA MISMO.
   *
   * Falla en silencio a propósito: si esto no carga, el recibidor sale sin la
   * fila de «sigue donde lo dejaste» y con todo lo demás en su sitio. Un
   * atajo que no aparece es una molestia; un recibidor que no aparece es una
   * plataforma rota.
   */
  useEffect(() => {
    if (!uid) return;
    let vivo = true;
    (async () => {
      try {
        const mios = esAdmin
          ? await repoCursos.listar()
          : await (async () => {
              const [pub, ins] = await Promise.all([
                repoCursos.publicados(),
                repoInscripciones.deAlumno(uid),
              ]);
              const permitidos = new Set(ins.map((i) => i.cursoId));
              return pub.filter((c) => permitidos.has(c.id));
            })();
        const avs = await Promise.all(mios.map((c) => repoAvance.de(uid, c.id).catch(() => null)));
        if (!vivo) return;
        setEmpezados(
          mios
            .map((curso, i) => ({ curso, av: avs[i] }))
            .filter(({ curso }) => totalLecciones(curso) > 0)
            .slice(0, 3)
        );
      } catch {
        /* Ver arriba: sin esto la pantalla sigue entera. */
      }
    })();
    return () => {
      vivo = false;
    };
  }, [uid, esAdmin]);

  const abiertas = PUERTAS.filter((p) => puede(p.llave));
  const nombre = (usuario ? usuario.nombre : "").split(" ")[0];

  /*
   * LA MISMA DIRECCIÓN, DOS PANTALLAS.
   *
   * Para Iris el Inicio es su panel de mando: cómo va la escuela. Para un
   * alumno es su recibidor: por dónde iba y qué puede abrir. No es el mismo
   * contenido con unos trozos escondidos — son dos preguntas distintas, y
   * mezclarlas daría una pantalla que no contesta bien ninguna.
   */
  if (esAdmin) {
    return (
      <div style={css(PANTALLA)}>
        <PanelInicio nombre={nombre} />
      </div>
    );
  }

  /* Un solo ancho y un solo arranque para todo lo de esta pantalla: es lo que
     hacía que los textos empezaran en tres verticales distintas. */
  return (
    <motion.div
      initial={quieto ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--s6);")}
    >
      {/* ------------------------------------------------------- El saludo */}
      {/*
        LA BANDA DE ACUARELA.
        
        Lo único de toda la plataforma que es una imagen y no una forma
        dibujada, y está aquí por un motivo que no es decorar: ésta es la
        primera pantalla que se ve al entrar, y es la que tiene que decir de
        quién es esta escuela antes de que se lea una palabra.
        
        POR QUÉ FUNCIONA Y NO ES RELLENO. Papel crema a la izquierda —donde va
        el texto, que así se lee sin velos ni trucos— y a la derecha las
        acuarelas de la casa: granate, salvia y lavanda, con la geometría del
        árbol trazada en oro muy fino. Es la marca de Iris dicha en voz baja.
        
        PESA 36 KB. El original pesaba 1,5 MB, que en la pantalla de entrada es
        medio segundo de nada mirando un hueco. Se recorta y se convierte a
        WebP, y lo que se pierde no se ve: es una acuarela difusa, no una foto
        con detalle que defender.
        
        `aria-hidden` y vacío el `alt`: no dice nada que no esté dicho al lado.
        Describirla a quien usa un lector de pantalla sería hacerle oír la
        decoración antes de llegar a su nombre.
      */}
      <header
        style={css(
          "position:relative;overflow:hidden;border-radius:var(--r-tarjeta);" +
            "background:var(--surface);box-shadow:var(--nm);" +
            "padding:clamp(28px,4vw,46px) clamp(24px,3.4vw,42px);isolation:isolate;"
        )}
      >
        <span
          aria-hidden
          style={css(
            "position:absolute;inset:0;z-index:0;background-image:url('/banda-escuela.webp');" +
              "background-size:cover;background-position:right center;" +
              /* En oscuro la acuarela es demasiado luz: se baja y se funde con
                 el fondo en vez de flotar encima como un cuadro iluminado. */
              "opacity:var(--banda-opacidad, 1);"
          )}
        />
        <div style={css("position:relative;z-index:1;")}>
        <h1 style={css(TITULO + "margin:0;")}>{nombre ? `Hola, ${nombre}` : "Escuela de Sabiduría 33"}</h1>
        <p style={css("font-size:var(--t-read);line-height:1.6;color:var(--text-2);margin:10px 0 0;max-width:46ch;text-wrap:pretty;")}>
          Aquí dentro están tus cursos, la comunidad y todo lo que vayas desbloqueando. Se está construyendo ahora
          mismo, así que irás viendo cómo se llena.
        </p>

        {/* Iris no es alumna. Sin esta línea lee la pantalla como un fallo de
            su propia plataforma: «¿dónde está mi despacho?». */}
        {esAdmin && (
          <p
            style={css(
              "display:flex;gap:9px;align-items:baseline;margin:var(--s4) 0 0;padding:11px 14px;" +
                "border-radius:var(--r-sm);border:1px solid var(--border);" +
                "background:color-mix(in srgb, var(--text) 4%, transparent);" +
                "font-size:var(--t-mini);line-height:1.55;color:var(--text-3);max-width:76ch;"
            )}
          >
            <span aria-hidden style={css("flex:none;color:var(--gold-deep, var(--text-3));")}>•</span>
            <span>
              <strong style={css("color:var(--text-2);")}>Estás viendo la escuela como la ve un alumno.</strong> Tu
              estudio de Kábala y tu despacho siguen donde estaban, en el menú. Ningún alumno los ve.
            </span>
          </p>
        )}
        </div>
      </header>

      {/* --------------------------------------------- Sigue donde lo dejaste */}
      {/* Lo primero de verdad, antes que los atajos: la pregunta que trae a
          alguien a esta pantalla es «¿qué hago ahora?», y esto la contesta. */}
      {empezados.length > 0 && (
        <section>
          <h2 style={css(CABECERA + "margin:0 0 var(--s3);font-size:var(--t-head);")}>Sigue donde lo dejaste</h2>
          <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fill,minmax(300px,1fr));")}>
            {empezados.map(({ curso, av }, i) => {
              const parte = progreso(curso, av);
              const total = totalLecciones(curso);
              const hechas = Math.round(parte * total);
              const siguiente = porDondeIba(curso, av);
              return (
                <motion.article
                  key={curso.id}
                  initial={quieto ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  style={css(
                    "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
                      "box-shadow:var(--nm);padding:var(--s4);display:flex;flex-direction:column;gap:10px;"
                  )}
                >
                  <h3 style={css("font-size:var(--t-body);font-weight:600;margin:0;")}>
                    {curso.titulo || "Curso sin nombre"}
                  </h3>

                  <span style={css(NOTA)}>
                    {parte === 1
                      ? "Terminado"
                      : siguiente
                        ? `Te toca: ${siguiente.titulo || "la siguiente lección"}`
                        : "Sin empezar"}
                  </span>

                  <div
                    role="progressbar"
                    aria-valuenow={Math.round(parte * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Lo que llevas de ${curso.titulo}`}
                    style={css(
                      "height:5px;border-radius:999px;margin-top:2px;overflow:hidden;" +
                        "background:color-mix(in srgb, var(--text) 10%, transparent);"
                    )}
                  >
                    <motion.div
                      initial={quieto ? false : { width: 0 }}
                      animate={{ width: `${parte * 100}%` }}
                      transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      style={css("height:100%;background:var(--gold-deep, var(--text));border-radius:999px;")}
                    />
                  </div>

                  <div style={css("display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:4px;")}>
                    <span style={css(NOTA)}>
                      {hechas} de {total}
                    </span>
                    <button onClick={() => setView("cursos")} style={css(botonPrincipal())}>
                      {parte === 0 ? "Empezar" : parte === 1 ? "Repasar" : "Seguir"}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ Las puertas */}
      {abiertas.length > 0 && (
        <section>
          <h2 style={css(CABECERA + "margin:0 0 var(--s3);font-size:var(--t-head);")}>Tu escuela</h2>
          <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fit,minmax(248px,1fr));")}>
            {abiertas.map(({ k, titulo, que, Ico, tono }, i) => (
              <motion.button
                key={k}
                onClick={() => setView(k)}
                whileHover={quieto ? undefined : { y: -2 }}
                whileTap={{ scale: 0.99 }}
                initial={quieto ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                style={css(
                  "text-align:left;cursor:pointer;color:inherit;font:inherit;" +
                    "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
                    "box-shadow:var(--nm);padding:var(--s4);" +
                    /* Los tres bloques de dentro en la misma rejilla en las tres
                       tarjetas: así los títulos quedan a la misma altura aunque
                       una descripción ocupe dos renglones y otra tres. */
                    "display:grid;grid-template-rows:auto auto 1fr;gap:10px;min-height:152px;"
                )}
              >
                <span
                  aria-hidden
                  style={css(
                    "display:grid;place-items:center;width:40px;height:40px;border-radius:var(--r-sm);" +
                      `background:var(--${tono});color:var(--${tono}-tx);`
                  )}
                >
                  <Ico size={19} />
                </span>
                <span style={css("font-size:var(--t-body);font-weight:600;")}>{titulo}</span>
                <span style={css(NOTA + "line-height:1.5;text-wrap:pretty;")}>{que}</span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/*
       * NADIE SE QUEDA MIRANDO UNA PANTALLA SIN SALIDA.
       *
       * Alguien con cuenta y sin ninguna llave —se dio de alta, no ha comprado
       * todavía, o se le retiró el acceso— no vería ni una puerta. Sin esto,
       * una pantalla en blanco y a adivinar a quién se escribe.
       */}
      {abiertas.length === 0 && (
        <section
          style={css(
            "background:var(--surface);border:1px solid var(--border);border-radius:var(--r);" +
              "padding:clamp(28px,5vw,48px) var(--pad-card);box-shadow:var(--nm);max-width:620px;"
          )}
        >
          <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Tu cuenta todavía no tiene acceso a nada</h2>
          <p style={css("font-size:var(--t-read);line-height:1.6;color:var(--text-3);margin:0 0 var(--s4);text-wrap:pretty;")}>
            Si acabas de comprar un curso, el acceso puede tardar un poco en llegar. Si llevas esperando más de un día,
            escribe a Iris y lo soluciona enseguida.
          </p>
          <a
            href="mailto:irissoaresoficial@gmail.com"
            style={css(botonPrincipal() + "display:inline-block;text-decoration:none;")}
          >
            Escribir a Iris
          </a>
        </section>
      )}
    </motion.div>
  );
}
