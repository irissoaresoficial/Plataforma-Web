"use client";

/**
 * ============================================================================
 * LAS MÉTRICAS DE UN CREADOR: CÓMO VAN SUS CURSOS
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026: quien lleva Desórdenes Amorosos «tiene que
 * tener acceso al dashboard de cuántas personas están entrando y demás a su
 * apartado del curso».
 *
 * SÓLO LO SUYO. Sale de las inscripciones y los avances de SUS cursos, que
 * las reglas le dejan leer porque llevan su uid copiado (`autor`). No ve ni
 * la gente ni los números de los cursos de Iris o de otro creador, ni nada del
 * despacho.
 *
 * Cada cifra es una pregunta, como en las métricas de Iris, y ninguna se
 * inventa: si no hay alumnos todavía, lo dice.
 */
import { useEffect, useMemo, useState } from "react";
import { css } from "@/lib/css";
import { useSesion } from "@/lib/sesion";
import { NOTA, PANTALLA, TARJETA } from "@/lib/ui";
import { Barras } from "../escuela/Grafico";
import Banda from "../Banda";
import {
  avance as repoAvance,
  cursos as repoCursos,
  inscripciones as repoInscripciones,
  totalLecciones,
  type Avance,
  type Curso,
  type Inscripcion,
} from "@/lib/escuela";
import { portadaDe } from "@/lib/escuela/portadas";
import SecretariaIA from "../escuela/SecretariaIA";
import Gasto from "../metricas/Gasto";
import { ultimosDias, type DiaCampana } from "@/lib/despacho/campana";

const DIA = 24 * 3600 * 1000;

export default function MisMetricasScreen() {
  const { usuario } = useSesion();
  const uid = usuario ? usuario.uid : "";
  const [d, setD] = useState<{ cursos: Curso[]; ins: Inscripcion[]; avs: Avance[] } | null>(null);
  /* Lo que cuesta la publicidad. Va en su propio estado y no en el `Promise.all`
     de arriba a propósito: si esto falla o llega tarde, los cursos ya están
     pintados. Son dos cosas independientes y no tienen por qué esperarse. */
  const [campana, setCampana] = useState<DiaCampana[]>([]);
  const [fallo, setFallo] = useState("");
  const [elegido, setElegido] = useState<string>("todos");
  /* La hora, fija al abrir: la pantalla es una foto de ese momento. */
  const [ahora] = useState(() => Date.now());

  useEffect(() => {
    if (!uid) return;
    let vivo = true;
    (async () => {
      try {
        const [cursos, ins, avs] = await Promise.all([repoCursos.deAutor(uid), repoInscripciones.deAutor(uid), repoAvance.deAutor(uid)]);
        if (vivo) setD({ cursos, ins, avs });
      } catch (e) {
        if (vivo) {
          setD({ cursos: [], ins: [], avs: [] });
          setFallo(e instanceof Error ? e.message : "No se han podido leer tus métricas.");
        }
      }
    })();
    return () => {
      vivo = false;
    };
  }, [uid]);

  /* La campaña no depende de quién seas: es la misma para toda la casa. Por eso
     se pide una vez al abrir y no cada vez que se cambia de curso. */
  useEffect(() => {
    let vivo = true;
    void ultimosDias(60).then((x) => {
      if (vivo) setCampana(x);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const m = useMemo(() => {
    if (!d) return null;
    const cursos = elegido === "todos" ? d.cursos : d.cursos.filter((c) => c.id === elegido);
    const ids = new Set(cursos.map((c) => c.id));
    const ins = d.ins.filter((i) => ids.has(i.cursoId));
    const avs = d.avs.filter((a) => ids.has(a.cursoId));
    const alumnos = new Set(ins.map((i) => i.uid)).size;
    const nuevos30 = new Set(ins.filter((i) => ahora - new Date(i.desde).getTime() < 30 * DIA).map((i) => i.uid)).size;
    const activos7 = new Set(avs.filter((a) => ahora - new Date(a.tocado).getTime() < 7 * DIA).map((a) => a.uid)).size;
    const vivas = new Set(cursos.flatMap((c) => c.modulos.flatMap((x) => x.lecciones.map((l) => l.id))));
    const lecciones = avs.reduce((n, a) => n + a.hechas.filter((id) => vivas.has(id)).length, 0);
    let empiezan = 0;
    let acaban = 0;
    for (const a of avs) {
      const c = cursos.find((x) => x.id === a.cursoId);
      const total = c ? totalLecciones(c) : 0;
      const hechas = a.hechas.filter((id) => vivas.has(id)).length;
      if (!total || !hechas) continue;
      empiezan += 1;
      if (hechas >= total) acaban += 1;
    }
    /* Dónde se cae la gente: sólo con un curso elegido, porque mezclar
       lecciones de varios no señala ninguna. */
    const uno = cursos.length === 1 ? cursos[0] : null;
    const suyos = uno ? avs.filter((a) => a.cursoId === uno.id) : [];
    const caida = uno && suyos.length
      ? uno.modulos
          .flatMap((x) => x.lecciones)
          .slice(0, 12)
          .map((l, i) => ({ etiqueta: `${i + 1}. ${l.titulo || "Sin nombre"}`, valor: Math.round((suyos.filter((a) => a.hechas.includes(l.id)).length / suyos.length) * 100) }))
      : [];
    return { alumnos, nuevos30, activos7, lecciones, acabanPct: empiezan ? Math.round((acaban / empiezan) * 100) : 0, empiezan, caida, uno };
  }, [d, elegido, ahora]);

  const cifras: Array<[string, string, string]> = m
    ? [
        ["¿Cuánta gente tiene tus cursos?", `${m.alumnos}`, "alumnos con acceso"],
        ["¿Cuántos han entrado este mes?", `${m.nuevos30}`, "alumnos nuevos en 30 días"],
        ["¿Quién está estudiando ahora?", `${m.activos7}`, "han avanzado en los últimos 7 días"],
        ["¿Cuántos lo acaban?", `${m.acabanPct} %`, m.empiezan ? `de los ${m.empiezan} que empezaron` : "nadie ha empezado todavía"],
      ]
    : [];

  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--gap);")}>
      <Banda
        foto="/escuela/banda-cursos.jpg"
        encuadre="50% 60%"
        titulo="Mis métricas"
        sub="Cuánta gente entra a tus cursos y hasta dónde llega. Sólo de los cursos que montas tú."
        cifras={m ? [{ n: m.lecciones, que: "Lecciones vistas" }] : []}
      />

      {fallo && <p role="alert" style={css(NOTA + "margin:0;color:var(--red);")}>{fallo}</p>}
      {d === null && <p style={css(NOTA + "margin:0;")}>Cargando…</p>}

      {d && d.cursos.length === 0 && (
        <div style={css(TARJETA + "padding:var(--pad-card);max-width:620px;")}>
          <h2 style={css("margin:0 0 8px;font-size:var(--t-head);font-weight:500;")}>Todavía no tienes cursos</h2>
          <p style={css("margin:0;font-size:var(--t-read);line-height:1.6;color:var(--text-2);")}>
            En cuanto montes uno y entre gente, aquí verás cuántos lo tienen, quién está estudiando y en qué lección se para.
          </p>
        </div>
      )}

      {d && d.cursos.length > 0 && m && (
        <>
          {/* Qué curso se mira. «Todos» suma; uno solo enseña además dónde
              se cae la gente. */}
          <div role="tablist" style={css("display:flex;gap:8px;flex-wrap:wrap;")}>
            {[{ id: "todos", titulo: "Todos mis cursos" }, ...d.cursos].map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={elegido === c.id}
                onClick={() => setElegido(c.id)}
                style={css(
                  "padding:9px 16px;border-radius:var(--r-pill);cursor:pointer;font:inherit;font-size:var(--t-mini);font-weight:500;" +
                    (elegido === c.id ? "background:var(--accion);color:var(--sobre-accion);border:1px solid var(--accion);" : "background:var(--surface);color:var(--text-2);border:1px solid var(--border);")
                )}
              >
                {c.titulo || "Curso sin nombre"}
              </button>
            ))}
          </div>

          <div data-kpis="">
            {cifras.map(([q, n, que], i) => (
              <section
                key={q}
                style={css(
                  "border-radius:var(--r-tarjeta);padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:10px;min-width:0;" +
                    (i === 0
                      ? "background:var(--bloque);color:var(--sobre-bloque);border:1px solid var(--bloque-borde);box-shadow:var(--shadow-lg);"
                      : "background:var(--surface);border:1px solid var(--border);box-shadow:var(--nm-alto);")
                )}
              >
                <h3 style={css("margin:0;font-size:var(--t-body);font-weight:500;line-height:1.35;")}>{q}</h3>
                <div style={css("font-weight:300;font-size:clamp(38px,3.8vw,52px);letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums;")}>{n}</div>
                <div style={css("font-size:var(--t-mini);color:" + (i === 0 ? "var(--sobre-bloque-2)" : "var(--text-3)") + ";")}>{que}</div>
              </section>
            ))}
          </div>

          <div data-metricas-rejilla="">
            <section style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);")}>
              <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>¿En qué lección se va la gente?</h2>
              {m.uno ? (
                m.caida.length ? (
                  <>
                    <p style={css(NOTA + "margin:0;line-height:1.5;")}>De cada cien que empiezan {m.uno.titulo}, cuántos llegan a cada lección.</p>
                    <Barras datos={m.caida} sufijo=" %" />
                  </>
                ) : (
                  <p style={css(NOTA + "margin:0;")}>Todavía nadie ha empezado este curso.</p>
                )
              ) : (
                <p style={css(NOTA + "margin:0;")}>Elige un curso arriba y verás en qué lección se para la gente.</p>
              )}
            </section>
            <section style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);")}>
              <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>Tus cursos</h2>
              {d.cursos.map((c, i) => {
                const n = new Set(d.ins.filter((x) => x.cursoId === c.id).map((x) => x.uid)).size;
                return (
                  <div key={c.id} style={css("display:flex;align-items:center;gap:12px;")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={portadaDe(c, i)} alt="" style={css("width:64px;height:40px;object-fit:cover;border-radius:var(--r-sm);")} />
                    <span style={css("flex:1;min-width:0;")}>
                      <span style={css("display:block;font-size:var(--t-body);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{c.titulo || "Curso sin nombre"}</span>
                      <span style={css(NOTA)}>{c.publicado ? "Publicado" : c.revision ? "En revisión" : "Borrador"}</span>
                    </span>
                    <span style={css("font-size:var(--t-body);font-weight:500;font-variant-numeric:tabular-nums;")}>{n}</span>
                    <span style={css(NOTA)}>{n === 1 ? "alumno" : "alumnos"}</span>
                  </div>
                );
              })}
            </section>
          </div>
        </>
      )}
      {/* --------------------------------------------- lo que cuesta traerlos */}
      {/* Gerson, el 20 de octubre: estas métricas «las debe ver también la otra
          persona a la que le daremos acceso al panel de Desórdenes Amorosos».
          Aquí ve el dinero de la campaña —gasto, clics, hasta dónde aguantan
          el vídeo— y NO ve nada del despacho de Iris: ni clientas, ni facturas,
          ni la lista de correos.

          Los apuntados que enseña son un RECUENTO guardado en `campana`, no la
          lista de `leads`: el número de personas sí, quiénes son no. Así esta
          persona ve el coste por apuntado —que es lo que necesita para decidir—
          sin que le llegue ni un correo ajeno. Y es exactamente el mismo número
          que ve Iris, porque sale del mismo sitio: dos pantallas que dieran
          costes distintos para lo mismo valdrían menos que una sola. */}
      {campana.length > 0 && (
        <>
          <h2 style={css("margin:var(--s4) 0 0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>
            Lo que cuesta la publicidad
          </h2>
          <Gasto dias={campana} tarjeta={TARJETA + "padding:var(--pad-card-sm);"} />
        </>
      )}

      {/* La empresa conectada, en cada pantalla del creador. */}
      <SecretariaIA compacta />
    </div>
  );
}
