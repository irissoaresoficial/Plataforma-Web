"use client";

/**
 * ============================================================================
 * RECURSOS — LA BIBLIOTECA
 * ============================================================================
 *
 * Lo que no es una clase pero hace falta tener a mano: plantillas, guías,
 * audios. Lo sube Iris y se lo baja cualquiera que tenga cuenta.
 *
 * LA REGLA QUE DECIDE ESTA PANTALLA: una biblioteca se abandona por desorden,
 * no por falta de cosas. A las treinta fichas, si no se encuentra nada, se deja
 * de abrir y lo que hay dentro vale cero. De ahí lo que tiene y lo que no:
 *
 *   · BUSCADOR DESDE EL PRIMER DÍA, aunque con cuatro archivos no haga falta.
 *     Ponerlo luego significa ponerlo cuando ya se ha abandonado.
 *   · FILTRO POR TIPO. «Quiero la plantilla» y «quiero el audio» son dos
 *     búsquedas distintas y las dos son frecuentes.
 *   · NADA DE CARPETAS ANIDADAS. Una carpeta dentro de otra es un sitio donde
 *     perder cosas. Etiquetas planas y buscador: se encuentra escribiendo, no
 *     navegando.
 *   · EL PESO VA ESCRITO. Quien está en el metro con datos decide distinto si
 *     el audio pesa 4 MB o 120.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { BOTON_NORMAL, BOTON_PLANO, CABECERA, CAMPO, LECTURA, NOTA, TITULO, botonPrincipal , PANTALLA} from "@/lib/ui";
import { useSesion } from "@/lib/sesion";
import Confirmar from "../Confirmar";
import {
  adivinaTipo,
  borra as borraRecurso,
  listaRecursos,
  pesoHumano,
  sube,
  type Recurso,
  type Tipo,
} from "@/lib/escuela/recursos";

const NOMBRE_TIPO: Record<Tipo, string> = {
  pdf: "PDF",
  audio: "Audio",
  plantilla: "Plantilla",
  video: "Vídeo",
};

/* El tono de cada tipo. En una biblioteca de cien fichas, el color es lo que
   deja barrer la rejilla con la vista buscando «los audios» sin leer una sola
   etiqueta. Con todas del mismo color habría que leerlas todas. */
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
      {tipo === "audio" && (
        <>
          <path d="M4 10v4M8 7.5v9M12 5v14M16 8.5v7M20 11v2" />
        </>
      )}
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

export default function RecursosScreen() {
  const { esAdmin } = useSesion();
  const quieto = useReducedMotion();
  const campo = useRef<HTMLInputElement>(null);

  const [lista, setLista] = useState<Recurso[] | null>(null);
  const [roto, setRoto] = useState(false);
  const [fallo, setFallo] = useState("");
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<Tipo | "todo">("todo");

  /* La subida en curso: el archivo elegido, sus datos y por dónde va. */
  const [elegido, setElegido] = useState<File | null>(null);
  const [nombre, setNombre] = useState("");
  const [que, setQue] = useState("");
  const [parte, setParte] = useState(0);
  const [subiendo, setSubiendo] = useState(false);

  const carga = useCallback(async () => {
    setRoto(false);
    try {
      setLista(await listaRecursos());
    } catch (e) {
      setLista([]);
      setRoto(true);
      setFallo(e instanceof Error ? e.message : "No se ha podido leer la biblioteca.");
    }
  }, []);

  useEffect(() => {
    void carga();
  }, [carga]);

  /*
   * EL NOMBRE SE RELLENA SOLO CON EL DEL ARCHIVO, SIN LA EXTENSIÓN.
   *
   * Casi siempre el archivo ya se llama como hay que llamarlo, así que Iris
   * sube y pulsa. Y cuando no, lo corrige — que es mucho menos trabajo que
   * escribirlo desde cero cada vez. Un formulario que viene medio hecho se
   * termina; uno en blanco se abandona.
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
      const r = await sube(elegido, { nombre, que }, setParte);
      setLista((xs) => [r, ...(xs ?? [])]);
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

  async function quita(r: Recurso) {
    const antes = lista;
    setLista((xs) => (xs ?? []).filter((x) => x.id !== r.id));
    try {
      await borraRecurso(r);
    } catch (e) {
      setLista(antes);
      setFallo(e instanceof Error ? e.message : "No se ha podido borrar.");
    }
  }

  const vistos = (lista ?? []).filter(
    (r) =>
      (tipo === "todo" || r.tipo === tipo) &&
      `${r.nombre} ${r.que}`.toLowerCase().includes(busca.trim().toLowerCase())
  );

  const pastilla = (activo: boolean) =>
    "font-size:var(--t-mini);font-weight:590;padding:6px 13px;border-radius:var(--r-pill);cursor:pointer;" +
    "border:1px solid " + (activo ? "transparent" : "var(--border)") + ";" +
    (activo
      ? "background:var(--accion);color:var(--sobre-accion);"
      : "background:transparent;color:var(--text-3);");

  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--s4);")}>
      <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
        <h1 style={css(TITULO + "margin:0;")}>Recursos</h1>
        {lista !== null && !roto && lista.length > 0 && (
          <span style={css(NOTA)}>
            {lista.length} {lista.length === 1 ? "archivo" : "archivos"}
          </span>
        )}
        {esAdmin && !elegido && (
          <button onClick={() => campo.current?.click()} style={css(botonPrincipal() + "margin-left:auto;")}>
            + Subir un recurso
          </button>
        )}
      </div>

      <input
        ref={campo}
        type="file"
        onChange={(e) => elige(e.target.files?.[0])}
        style={css("display:none;")}
        aria-hidden
        tabIndex={-1}
      />

      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--alarma, #C0392B);")}>
          {fallo}
        </p>
      )}

      {/* ------------------------------------------------ la ficha al subir */}
      {/* Se pide el nombre y la descripción ANTES de subir, no después: subir
          primero y preguntar luego deja archivos sin nombre cada vez que algo
          interrumpe, y un archivo sin nombre en una biblioteca es un archivo
          perdido. */}
      {elegido && (
        <section
          style={css(
            "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
              "box-shadow:var(--nm);padding:var(--s4);display:flex;flex-direction:column;gap:var(--s3);"
          )}
        >
          <div style={css(NOTA)}>
            {elegido.name} · {pesoHumano(elegido.size)} · se guardará como {adivinaTipo(elegido)}
          </div>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Cómo se llama"
            aria-label="Nombre del recurso"
            disabled={subiendo}
            style={css(CAMPO + "font-size:var(--t-read);")}
          />
          <input
            value={que}
            onChange={(e) => setQue(e.target.value)}
            placeholder="Una línea de qué es. Se busca también por aquí."
            aria-label="Descripción del recurso"
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
                aria-label="Subiendo el recurso"
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
        </section>
      )}

      {/* -------------------------------------------------- buscar y filtrar */}
      {(lista?.length ?? 0) > 0 && (
        <div style={css("display:flex;gap:var(--s3);flex-wrap:wrap;align-items:center;")}>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar en la biblioteca"
            aria-label="Buscar en la biblioteca"
            style={css(CAMPO + "flex:1 1 240px;max-width:340px;")}
          />
          <div style={css("display:flex;gap:7px;flex-wrap:wrap;")}>
            <button onClick={() => setTipo("todo")} style={css(pastilla(tipo === "todo"))}>
              Todo
            </button>
            {(Object.keys(NOMBRE_TIPO) as Tipo[]).map((t) => (
              <button key={t} onClick={() => setTipo(t)} style={css(pastilla(tipo === t))}>
                {NOMBRE_TIPO[t]}
              </button>
            ))}
          </div>
        </div>
      )}

      {lista === null && <p style={css(NOTA + "margin:0;")}>Cargando…</p>}

      {roto && (
        <p style={css(NOTA + "margin:0;")}>
          No se ha podido leer la biblioteca. Mira la conexión y vuelve a entrar.
        </p>
      )}

      {lista !== null && !roto && lista.length === 0 && (
        <div
          style={css(
            "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
              "padding:clamp(28px,5vw,48px) var(--pad-card);box-shadow:var(--nm);max-width:620px;"
          )}
        >
          <h2 style={css(CABECERA + "margin:0 0 var(--s2);")}>La biblioteca está vacía</h2>
          <p style={css(LECTURA + "margin:0;")}>
            {esAdmin
              ? "Sube lo que repartes en los cursos: la plantilla del Espejo y la Máscara, la tabla de letras, los audios. Lo que hoy mandas por correo cada vez."
              : "Todavía no hay nada aquí. Cuando Iris suba material, aparece en esta página."}
          </p>
        </div>
      )}

      <div style={css("display:grid;gap:var(--s3);grid-template-columns:repeat(auto-fill,minmax(290px,1fr));")}>
        {vistos.map((r, i) => (
          <motion.article
            key={r.id}
            initial={quieto ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(0.04 * i, 0.22), duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={css(
              "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);" +
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

            <h2 style={css("font-size:var(--t-body);font-weight:600;margin:0;line-height:1.3;overflow-wrap:anywhere;")}>
              {r.nombre}
            </h2>
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
              {esAdmin && (
                <Confirmar
                  estilo={BOTON_PLANO}
                  pregunta={`Se borra «${r.nombre}» y su archivo. No se puede deshacer.`}
                  confirmar="Borrar"
                  alConfirmar={() => void quita(r)}
                >
                  Borrar
                </Confirmar>
              )}
            </div>
          </motion.article>
        ))}
      </div>

      {(lista?.length ?? 0) > 0 && vistos.length === 0 && (
        <p style={css(NOTA + "margin:0;")}>Nada con eso. Prueba con otra palabra, o quita el filtro de tipo.</p>
      )}
    </div>
  );
}
