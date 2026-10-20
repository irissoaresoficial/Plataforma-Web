"use client";

/**
 * ============================================================================
 * LA COMUNIDAD
 * ============================================================================
 *
 * Lo que hace que la gente vuelva cuando ya ha visto los vídeos. Un curso se
 * termina; una comunidad no. No es un añadido: es lo que sostiene una
 * membresía que se cobra todos los meses.
 *
 * LAS DECISIONES DE FORMA, QUE AQUÍ SON DE FONDO
 * ---------------------------------------------------------------------------
 *
 * 1. SE ESCRIBE ARRIBA DEL TODO Y EL CAJÓN ESTÁ ABIERTO. Un botón de «nuevo
 *    tema» esconde la acción detrás de un clic y de otra pantalla, y eso basta
 *    para que no se escriba. Con el cajón a la vista, escribir es lo primero
 *    que se puede hacer al entrar.
 *
 * 2. LOS TEMAS SE ORDENAN POR ÚLTIMA RESPUESTA. Ordenar por fecha de creación
 *    entierra las conversaciones vivas debajo de las muertas.
 *
 * 3. LO FIJADO VA PRIMERO Y SE VE DISTINTO. Es por donde Iris dice lo que
 *    todos tienen que leer; mezclado con el resto se pierde en dos días.
 *
 * 4. EL HILO SE ABRE AQUÍ MISMO, no en otra pantalla. Un foro donde entrar a
 *    un tema es irse de la lista obliga a volver atrás después de cada
 *    respuesta, y eso es lo que hace que sólo se conteste a uno.
 */

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, BOTON_PLANO, CAMPO, CABECERA, LECTURA, NOTA, TITULO, botonPrincipal , PANTALLA} from "@/lib/ui";
import { useSesion } from "@/lib/sesion";
import Confirmar from "../Confirmar";
import Foto from "../Foto";
import {
  borraTema,
  creaTema,
  fija,
  listaTemas,
  responde,
  respuestasDe,
  todasLasRespuestas,
  clasificacion,
  nivelDe,
  PUNTOS_RESPUESTA,
  PUNTOS_TEMA,
  type Respuesta,
  type Tema,
} from "@/lib/escuela/comunidad";
import { guardadoEnLaNube } from "@/lib/escuela";
import { refrescaPuntos } from "@/lib/escuela/puntos";
import SecretariaIA from "../escuela/SecretariaIA";

/*
 * LA PRESENTACIÓN DE IRIS, mientras ella no fije la suya.
 *
 * Gerson: «haz una frase de inicio, explica quién es Iris y por qué te quiere
 * ayudar». Está hecha SÓLO con lo que Iris ya dice de sí misma en su web —su
 * título, desde cuándo tiene consulta y su idea de los patrones—, no con
 * frases nuevas puestas en su boca. En cuanto ella fije un mensaje suyo, sale
 * el suyo en lugar de éste.
 */
const PRESENTACION =
  "Soy Iris Soares, terapeuta psicosomática clínica y numeróloga transgeneracional, y tengo consulta desde 2010. " +
  "Lo que se repite en tu vida no es mala suerte: es un patrón, y los patrones se heredan. " +
  "Esta comunidad es para que no lo mires sola. Pregunta, cuenta lo que ves en tu carta y lee a las demás.";

/** Las normas de la casa. Cortas, para que se lean. */
const NORMAS = [
  "Aquí se habla de tú y con respeto. Nadie juzga la historia de nadie.",
  "Lo que se cuenta aquí se queda aquí. No copies fuera lo que escriben otras.",
  "Hablamos de patrones, no de culpables: tu familia no es el enemigo.",
  "Esto no sustituye a un médico ni a un psicólogo. Si estás pasando por algo grave, pide ayuda profesional.",
  "Nada de publicidad ni de vender servicios.",
];

/** «hace 3 h», «ayer», «12 oct». Lo que diría una persona, no una fecha. */
function cuando(iso: string): string {
  const d = new Date(iso);
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  if (h < 48) return "ayer";
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function ComunidadScreen() {
  const { usuario, esAdmin, puede } = useSesion();
  const quieto = useReducedMotion();

  const [temas, setTemas] = useState<Tema[] | null>(null);
  /** Todas las respuestas, sólo para contar los puntos. */
  const [todas, setTodas] = useState<Respuesta[]>([]);
  const [roto, setRoto] = useState(false);
  const [fallo, setFallo] = useState("");

  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [mandando, setMandando] = useState(false);

  /** Qué hilo está abierto, y lo que se ha leído de él. */
  const [abierto, setAbierto] = useState<string | null>(null);
  const [hilo, setHilo] = useState<Respuesta[]>([]);
  const [contesta, setContesta] = useState("");

  const autor = usuario
    ? { uid: usuario.uid, nombre: usuario.nombre || "Sin nombre", esIris: esAdmin, foto: usuario.foto }
    : null;

  const carga = useCallback(async () => {
    setRoto(false);
    try {
      const [t, r] = await Promise.all([listaTemas(), todasLasRespuestas().catch(() => [] as Respuesta[])]);
      setTemas(t);
      setTodas(r);
    } catch (e) {
      setTemas([]);
      setRoto(true);
      setFallo(e instanceof Error ? e.message : "No se han podido leer los temas.");
    }
  }, []);

  useEffect(() => {
    void carga();
  }, [carga]);

  async function abre(t: Tema) {
    if (abierto === t.id) {
      setAbierto(null);
      return;
    }
    setAbierto(t.id);
    setHilo([]);
    setContesta("");
    try {
      setHilo(await respuestasDe(t.id));
    } catch {
      /* El tema se sigue leyendo aunque sus respuestas no lleguen. */
    }
  }

  async function publica() {
    if (!autor || !titulo.trim()) return;
    setMandando(true);
    setFallo("");
    try {
      const t = await creaTema(autor, titulo, texto);
      refrescaPuntos();
      setTemas((xs) => [t, ...(xs ?? [])]);
      setTitulo("");
      setTexto("");
    } catch (e) {
      setFallo(e instanceof Error ? e.message : "No se ha podido publicar.");
    } finally {
      setMandando(false);
    }
  }

  async function contestar(t: Tema) {
    if (!autor || !contesta.trim()) return;
    setFallo("");
    try {
      const r = await responde(t.id, autor, contesta);
      refrescaPuntos();
      setHilo((xs) => [...xs, r]);
      setContesta("");
      setTemas((xs) =>
        (xs ?? []).map((x) =>
          x.id === t.id ? { ...x, respuestas: x.respuestas + 1, movido: r.creado } : x
        )
      );
    } catch (e) {
      setFallo(e instanceof Error ? e.message : "No se ha podido responder.");
    }
  }

  async function alternaFijado(t: Tema) {
    const antes = temas;
    setTemas((xs) => (xs ?? []).map((x) => (x.id === t.id ? { ...x, fijado: !x.fijado } : x)));
    try {
      await fija(t.id, !t.fijado);
    } catch (e) {
      setTemas(antes);
      setFallo(e instanceof Error ? e.message : "No se ha podido fijar.");
    }
  }

  async function borra(t: Tema) {
    const antes = temas;
    setTemas((xs) => (xs ?? []).filter((x) => x.id !== t.id));
    try {
      await borraTema(t.id);
    } catch (e) {
      setTemas(antes);
      setFallo(e instanceof Error ? e.message : "No se ha podido borrar.");
    }
  }

  /* ------------------------------------------------------------- pintura */

  const avatar = (nombre: string, deIris: boolean, grande = false, foto?: string) => (
    <Foto foto={foto || (deIris ? "/iris.jpg" : undefined)} nombre={nombre} tam={grande ? 40 : 32} iris={deIris} />
  );

  const ficha = (t: Tema, i: number) => {
    const dentro = abierto === t.id;
    const mio = usuario && t.uid === usuario.uid;
    return (
      <motion.article
        key={t.id}
        initial={quieto ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(0.04 * i, 0.2), duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={css(
          "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
            "box-shadow:var(--nm);padding:var(--s4);" +
            /* Lo fijado con un filo dorado a la izquierda, no con otro fondo:
               otro fondo se lee como «esto es otra cosa», y es un tema más —
               sólo que el que hay que leer. */
            (t.fijado ? "border-left:3px solid var(--gold);" : "")
        )}
      >
        <div style={css("display:flex;gap:var(--s3);")}>
          {avatar(t.autor, t.esIris, true, t.foto)}
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
              <span style={css(NOTA + "margin-left:auto;")}>{cuando(t.movido)}</span>
            </div>

            <h3 style={css("font-size:var(--t-read);font-weight:600;margin:7px 0 6px;line-height:1.3;")}>
              {t.titulo}
            </h3>
            {t.texto && <p style={css(LECTURA + "margin:0;white-space:pre-wrap;")}>{t.texto}</p>}

            <div style={css("display:flex;gap:var(--s3);align-items:center;margin-top:var(--s3);flex-wrap:wrap;")}>
              <button onClick={() => void abre(t)} style={css(BOTON_NORMAL)}>
                {t.respuestas === 0
                  ? dentro
                    ? "Cerrar"
                    : "Responder"
                  : `${t.respuestas} ${t.respuestas === 1 ? "respuesta" : "respuestas"}`}
              </button>
              {esAdmin && (
                <button onClick={() => void alternaFijado(t)} style={css(BOTON_PLANO)}>
                  {t.fijado ? "Dejar de fijar" : "Fijar arriba"}
                </button>
              )}
              {(esAdmin || mio) && (
                <Confirmar
                  estilo={BOTON_PLANO}
                  pregunta="Se borra este tema. Sus respuestas dejan de verse."
                  confirmar="Borrar"
                  alConfirmar={() => void borra(t)}
                >
                  Borrar
                </Confirmar>
              )}
            </div>

            {/* ------------------------------------------------- el hilo */}
            {dentro && (
              <motion.div
                initial={quieto ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={css("overflow:hidden;")}
              >
                <div style={css("margin-top:var(--s4);padding-top:var(--s4);border-top:1px solid var(--border);display:flex;flex-direction:column;gap:var(--s3);")}>
                  {hilo.map((r) => (
                    <div key={r.id} style={css("display:flex;gap:11px;")}>
                      {avatar(r.autor, r.esIris, false, r.foto)}
                      <div style={css("flex:1;min-width:0;")}>
                        <div style={css("display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;")}>
                          <span style={css("font-size:var(--t-mini);font-weight:600;color:var(--text-2);")}>
                            {r.autor}
                          </span>
                          <span style={css(NOTA)}>{cuando(r.creado)}</span>
                        </div>
                        <p style={css(LECTURA + "margin:3px 0 0;white-space:pre-wrap;")}>{r.texto}</p>
                      </div>
                    </div>
                  ))}

                  {hilo.length === 0 && (
                    <p style={css(NOTA + "margin:0;")}>Todavía no ha contestado nadie. Sé la primera.</p>
                  )}

                  <div style={css("display:flex;gap:var(--s3);align-items:flex-end;margin-top:var(--s2);flex-wrap:wrap;")}>
                    <textarea
                      value={contesta}
                      onChange={(e) => setContesta(e.target.value)}
                      rows={2}
                      placeholder="Escribe tu respuesta"
                      aria-label={`Responder a ${t.titulo}`}
                      style={css(CAMPO + "flex:1 1 240px;resize:vertical;line-height:1.6;")}
                    />
                    <button
                      onClick={() => void contestar(t)}
                      disabled={!contesta.trim()}
                      style={css(botonPrincipal(Boolean(contesta.trim())))}
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.article>
    );
  };

  const fijados = (temas ?? []).filter((t) => t.fijado);
  /* La bienvenida: el primer tema que Iris haya fijado. Si no hay, la
     pieza de arriba saluda igual, pero no se inventa ninguna frase suya. */
  const bienvenida = fijados.find((t) => t.esIris);
  const tabla = clasificacion(temas ?? [], todas);
  const mio = usuario ? tabla.find((p) => p.uid === usuario.uid) : undefined;
  const nivel = nivelDe(mio ? mio.puntos : 0);
  const resto = (temas ?? []).filter((t) => !t.fijado);

  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--s4);")}>
      <h1 style={css(TITULO + "margin:0;")}>Comunidad</h1>

      {/*
        IRIS RECIBE A QUIEN ENTRA. Gerson: «la idea es que esté ahí, ya como
        puesto, Iris saludando a las personas». Con su foto de verdad y, si ha
        fijado un mensaje, sus palabras: las que ella escribió, no unas que
        pongamos nosotros en su boca.
      */}
      <section
        style={css(
          "position:relative;overflow:hidden;border-radius:var(--r-tarjeta);background:var(--bloque);color:var(--sobre-bloque);" +
            "box-shadow:var(--nm-alto);display:flex;gap:var(--s4);align-items:center;padding:var(--pad-card-sm);flex-wrap:wrap;"
        )}
      >
        <Foto foto={bienvenida?.foto || (esAdmin && usuario ? usuario.foto : undefined) || "/iris.jpg"} nombre="Iris" tam={84} iris />
        <div style={css("flex:1 1 260px;min-width:0;")}>
          <div style={css("font-size:var(--t-mini);color:var(--oro-luz);")}>Iris Soares · Escuela de Sabiduría 33</div>
          <div style={css("font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;margin-top:4px;")}>
            {bienvenida ? bienvenida.titulo : `Hola, ${(usuario ? usuario.nombre : "").split(" ")[0] || "bienvenida"}`}
          </div>
          <p style={css("margin:6px 0 0;font-size:var(--t-body);line-height:1.55;color:var(--sobre-bloque-2);white-space:pre-wrap;")}>
            {bienvenida
              ? bienvenida.texto.length > 260
                ? bienvenida.texto.slice(0, 257) + "…"
                : bienvenida.texto
              : PRESENTACION}
          </p>
          {!bienvenida && esAdmin && (
            <p style={css("margin:10px 0 0;font-size:var(--t-mini);color:var(--oro-luz);")}>
              Esto sale con tus palabras de la web. Si escribes tu bienvenida abajo y la fijas, saldrá la tuya en su lugar.
            </p>
          )}
        </div>
      </section>

      <div data-comunidad="">
      <div style={css("display:flex;flex-direction:column;gap:var(--s4);min-width:0;")}>
      {!guardadoEnLaNube && (
        <p style={css(NOTA + "margin:0;")}>
          Sin conexión a la nube la comunidad no guarda nada. Es lo normal mientras se trabaja en la plataforma.
        </p>
      )}

      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--alarma, #C0392B);")}>
          {fallo}
        </p>
      )}

      {/* --------------------------------------------------- escribir algo */}
      <section
        style={css(
          "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
            "box-shadow:var(--nm);padding:var(--s4);display:flex;flex-direction:column;gap:var(--s3);"
        )}
      >
        <div style={css("display:flex;align-items:center;gap:10px;")}>
          {usuario && <Foto foto={usuario.foto} nombre={usuario.nombre} tam={36} iris={esAdmin} />}
          <div>
            <div style={css("font-size:var(--t-body);font-weight:500;color:var(--text);")}>Deja tu comentario</div>
            <div style={css(NOTA)}>Una duda, algo que hayas visto en tu carta, lo que quieras contar. Suma {PUNTOS_TEMA} puntos.</div>
          </div>
        </div>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Escribe aquí de qué quieres hablar"
          aria-label="Título del tema"
          style={css(CAMPO + "font-size:var(--t-read);")}
        />
        {/* El cuerpo sólo aparece cuando hay título: un cajón de dos campos
            vacíos pide más de lo que parece y frena a quien iba a escribir
            una línea. */}
        {titulo.trim() && (
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            placeholder="Cuéntalo con calma. Opcional."
            aria-label="Texto del tema"
            style={css(CAMPO + "resize:vertical;line-height:1.6;")}
          />
        )}
        {titulo.trim() && (
          <div style={css("display:flex;justify-content:flex-end;")}>
            <button
              onClick={() => void publica()}
              disabled={mandando}
              style={css(botonPrincipal(!mandando))}
            >
              {mandando ? "Publicando…" : "Publicar"}
            </button>
          </div>
        )}
      </section>

      {temas === null && <p style={css(NOTA + "margin:0;")}>Cargando…</p>}

      {/* Que no se pueda leer no es lo mismo que que no haya nada escrito. */}
      {roto && (
        <p style={css(NOTA + "margin:0;")}>
          No se han podido leer los temas. Mira la conexión y vuelve a entrar.
        </p>
      )}

      {temas !== null && !roto && temas.length === 0 && (
        <div
          style={css(
            "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
              "padding:clamp(28px,5vw,48px) var(--pad-card);box-shadow:var(--nm);"
          )}
        >
          <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>Aquí todavía no ha hablado nadie</h2>
          <p style={css(LECTURA + "margin:0;max-width:52ch;")}>
            {esAdmin
              ? "Empieza tú: un mensaje de bienvenida fijado arriba es lo que hace que el segundo se atreva. Una comunidad vacía no la rompe un alumno."
              : "Sé la primera en escribir. Una duda, algo que hayas visto en tu carta, lo que sea."}
          </p>
        </div>
      )}

      {fijados.map((t, i) => ficha(t, i))}

      {resto.length > 0 && fijados.length > 0 && (
        <h2 style={css(CABECERA + "margin:var(--s2) 0 0;font-size:var(--t-head);")}>Lo último</h2>
      )}
      {resto.map((t, i) => ficha(t, i + fijados.length))}
      </div>

      {/* ------------------------------------------- puntos, tabla, normas */}
      <aside data-comunidad-lado="" style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
        {/*
          LOS PUNTOS, CON CONTRASTE. Gerson: «Iris debe en su parte de
          comunidad decir también lo de los puntos; dale más contraste». Para
          quien participa, sus puntos y lo que le falta; para Iris, cómo se
          ganan, para que pueda animar a la gente sabiendo qué cuenta.
        */}
        <section
          style={css(
            "border-radius:var(--r-tarjeta);padding:var(--pad-card-sm);color:var(--vino);box-shadow:0 10px 26px color-mix(in srgb, var(--oro) 35%, transparent);" +
              "background:linear-gradient(135deg,var(--oro-luz) 0%,color-mix(in srgb, var(--oro) 75%, var(--oro-luz)) 100%);"
          )}
        >
          <div style={css("font-size:var(--t-mini);font-weight:600;")}>{esAdmin ? "Así se ganan puntos aquí" : "Tus puntos"}</div>
          {!esAdmin && (
            <div style={css("display:flex;align-items:baseline;gap:10px;margin-top:4px;")}>
              <span style={css("font-weight:300;font-size:52px;letter-spacing:-.05em;line-height:1;font-variant-numeric:tabular-nums;")}>{mio ? mio.puntos : 0}</span>
              <span style={css("font-size:var(--t-body);font-weight:500;")}>· nivel {nivel.nombre}</span>
            </div>
          )}
          {!esAdmin && nivel.siguiente && (
            <>
              <div style={css("height:8px;border-radius:var(--r-pill);background:color-mix(in srgb, var(--vino) 15%, transparent);overflow:hidden;margin-top:12px;")}>
                <div
                  style={css(
                    `height:100%;border-radius:var(--r-pill);background:var(--vino);width:${Math.round((((mio ? mio.puntos : 0) - nivel.desde) / ((nivel.hasta ?? 1) - nivel.desde)) * 100)}%;`
                  )}
                />
              </div>
              <div style={css("font-size:var(--t-mini);font-weight:500;margin-top:8px;")}>Te faltan {nivel.faltan} para {nivel.siguiente}.</div>
            </>
          )}
          <ul style={css("list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:6px;font-size:var(--t-body);")}>
            <li style={css("display:flex;justify-content:space-between;gap:10px;")}>
              <span>Abrir un tema</span>
              <strong style={css("font-weight:600;")}>+{PUNTOS_TEMA}</strong>
            </li>
            <li style={css("display:flex;justify-content:space-between;gap:10px;")}>
              <span>Responder a alguien</span>
              <strong style={css("font-weight:600;")}>+{PUNTOS_RESPUESTA}</strong>
            </li>
          </ul>
          <div style={css("font-size:var(--t-mini);margin-top:10px;line-height:1.5;")}>
            Niveles: Semilla, Raíz (20), Rama (60) y Árbol (150).{esAdmin ? " Tú no compites: eres la anfitriona." : ""}
          </div>
        </section>

        <section style={css(TARJETA_C)}>
          <h2 style={css("margin:0 0 var(--s3);font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>Las que más participan</h2>
          {tabla.length === 0 ? (
            <p style={css(NOTA + "margin:0;line-height:1.5;")}>
              Todavía nadie tiene puntos. Abre un tema o responde a alguien y sales aquí la primera.
            </p>
          ) : (
            <ol style={css("list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;")}>
              {tabla.slice(0, 5).map((p, i) => (
                <li key={p.uid} style={css("display:flex;align-items:center;gap:10px;")}>
                  <span style={css("width:22px;text-align:center;font-size:var(--t-body);font-weight:500;color:" + (i === 0 ? "var(--gold)" : "var(--text-3)") + ";")}>
                    {i + 1}
                  </span>
                  <Foto foto={p.foto} nombre={p.nombre} tam={34} />
                  <span style={css("flex:1;min-width:0;")}>
                    <span style={css("display:block;font-size:var(--t-body);font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                      {p.nombre}
                      {usuario && p.uid === usuario.uid && <span style={css(NOTA + "font-weight:400;")}> · tú</span>}
                    </span>
                    <span style={css(NOTA)}>{nivelDe(p.puntos).nombre}</span>
                  </span>
                  <span style={css("font-size:var(--t-body);font-weight:500;font-variant-numeric:tabular-nums;color:var(--text);")}>{p.puntos}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section style={css(TARJETA_C)}>
          <h2 style={css("margin:0 0 var(--s3);font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>Las normas</h2>
          <ol style={css("list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;font-size:var(--t-body);line-height:1.5;color:var(--text-2);")}>
            {NORMAS.map((n, i) => (
              <li key={n} style={css("display:flex;gap:10px;")}>
                <span style={css("flex:none;width:1.4em;color:var(--gold);font-weight:500;")}>{i + 1}.</span>
                <span>{n}</span>
              </li>
            ))}
          </ol>
        </section>
      </aside>
      </div>
      {/* La empresa conectada, en cada pantalla del creador. */}
      {puede("crear") && !puede("despacho") && <SecretariaIA compacta />}
    </div>
  );
}

const TARJETA_C =
  "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);box-shadow:var(--nm);padding:var(--pad-card-sm);";
