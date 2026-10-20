"use client";

/**
 * ============================================================================
 * LOS CURSOS DE QUIEN ESTUDIA
 * ============================================================================
 *
 * Gerson mandó una biblioteca de formación como referencia: arriba, grande, la
 * clase por la que vas; a la derecha cuánto llevas y el temario con lo hecho
 * marcado; debajo, tus cursos con su barra. Es lo que contesta la única
 * pregunta que trae quien abre esta pantalla: «¿por dónde iba?».
 *
 * TODO SALE DE SU AVANCE. Nada de «vídeos vistos: 48» ni horas inventadas: el
 * porcentaje es lecciones hechas entre lecciones que hay, y la lección de
 * arriba es la primera que no ha terminado.
 */
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { botonPrincipal, BOTON_NORMAL, NOTA, TARJETA } from "@/lib/ui";
import { porDondeIba, progreso, totalLecciones, type Avance, type Curso } from "@/lib/escuela";

import { portadaDe } from "@/lib/escuela/portadas";

export default function Biblioteca({
  cursos,
  avances,
  abrir,
}: {
  cursos: Curso[];
  avances: Record<string, Avance | null>;
  abrir: (c: Curso) => void;
}) {
  const quieto = useReducedMotion();
  if (cursos.length === 0) return null;

  /* El de arriba: el último que tocó y no ha acabado. Si no ha empezado
     ninguno, el primero. */
  const conAvance = cursos
    .map((c, i) => ({ c, i, a: avances[c.id] ?? null, p: progreso(c, avances[c.id] ?? null) }))
    .sort((x, y) => (y.a?.tocado ?? "").localeCompare(x.a?.tocado ?? ""));
  const actual = conAvance.find((x) => x.p > 0 && x.p < 1) ?? conAvance[0];
  const { c, a, p } = actual;
  const siguiente = porDondeIba(c, a);
  const hechas = new Set(a?.hechas ?? []);
  const total = totalLecciones(c);
  const nHechas = c.modulos.reduce((n, m) => n + m.lecciones.filter((l) => hechas.has(l.id)).length, 0);
  /* En qué módulo cae la siguiente, para decirlo como en la referencia:
     «Módulo 1 · Lección 2». */
  let donde = "";
  c.modulos.forEach((m, im) =>
    m.lecciones.forEach((l, il) => {
      if (siguiente && l.id === siguiente.id) donde = `Módulo ${im + 1} · Lección ${il + 1}`;
    })
  );

  const R = 46;
  const C = 2 * Math.PI * R;

  return (
    <div data-biblioteca="">
      {/* ------------------------------------------------- por donde ibas */}
      <div style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
        <motion.button
          initial={quieto ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => abrir(c)}
          aria-label={`Seguir con ${c.titulo}`}
          style={css(
            "position:relative;overflow:hidden;min-height:clamp(260px,32vw,380px);border:none;padding:0;cursor:pointer;text-align:left;font:inherit;" +
              "border-radius:var(--r-tarjeta);background:var(--bloque);box-shadow:var(--shadow-lg);display:flex;align-items:flex-end;"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={portadaDe(c, actual.i)} alt="" style={css("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
          <span aria-hidden="true" style={css("position:absolute;inset:0;background:linear-gradient(90deg,rgba(34,29,31,.86),rgba(34,29,31,.35) 70%,rgba(34,29,31,.1));")} />
          <span style={css("position:relative;display:flex;flex-direction:column;gap:10px;padding:var(--pad-card);width:100%;")}>
            <span style={css("font-size:var(--t-mini);color:var(--oro-luz);")}>{p > 0 ? "Sigue por donde ibas" : "Empieza aquí"}</span>
            <span style={css("font-weight:300;font-size:clamp(30px,3.6vw,48px);letter-spacing:-.03em;line-height:1.05;color:var(--sobre-bloque);max-width:16ch;")}>
              {c.titulo || "Curso sin nombre"}
            </span>
            {siguiente && (
              <span style={css("font-size:var(--t-body);color:var(--sobre-bloque-2);")}>
                {donde && <span style={css("color:var(--oro-luz);")}>{donde} · </span>}
                {siguiente.titulo || "Sin nombre"}
              </span>
            )}
            <span style={css("display:flex;align-items:center;gap:14px;margin-top:6px;")}>
              <span
                aria-hidden="true"
                style={css("width:48px;height:48px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--sobre-bloque);color:var(--vino);")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </span>
              <span style={css("flex:1;height:5px;border-radius:var(--r-pill);background:color-mix(in srgb, var(--sobre-bloque) 22%, transparent);overflow:hidden;")}>
                <span style={css(`display:block;height:100%;width:${p * 100}%;background:var(--oro);`)} />
              </span>
              <span style={css("font-size:var(--t-mini);color:var(--sobre-bloque-2);font-variant-numeric:tabular-nums;")}>
                {nHechas}/{total}
              </span>
            </span>
          </span>
        </motion.button>

        {/* ------------------------------------------------- tus cursos */}
        <section style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);")}>
          <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>Tus cursos</h2>
          {conAvance
            .slice()
            .sort((x, y) => x.i - y.i)
            .map((x) => (
              <button
                key={x.c.id}
                data-fila-curso=""
                onClick={() => abrir(x.c)}
                style={css(
                  "display:grid;grid-template-columns:96px minmax(0,1fr) minmax(90px,180px);gap:var(--s4);align-items:center;" +
                    "padding:8px;border:none;border-radius:var(--r-lg);background:transparent;cursor:pointer;text-align:left;font:inherit;color:var(--text);"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={portadaDe(x.c, x.i)} alt="" style={css("width:96px;height:60px;object-fit:cover;border-radius:var(--r);")} />
                <span style={css("min-width:0;")}>
                  <span style={css("display:block;font-size:var(--t-body);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{x.c.titulo || "Curso sin nombre"}</span>
                  <span style={css(NOTA)}>{totalLecciones(x.c)} {totalLecciones(x.c) === 1 ? "lección" : "lecciones"}</span>
                </span>
                <span data-fila-barra="" style={css("display:flex;align-items:center;gap:10px;")}>
                  <span style={css("flex:1;height:5px;border-radius:var(--r-pill);background:var(--surface-2);overflow:hidden;")}>
                    <span style={css(`display:block;height:100%;width:${x.p * 100}%;background:var(--accion);`)} />
                  </span>
                  <span style={css(NOTA + "font-variant-numeric:tabular-nums;width:3.2em;text-align:right;")}>{Math.round(x.p * 100)} %</span>
                </span>
              </button>
            ))}
        </section>
      </div>

      {/* --------------------------------------------- tu camino, a la derecha */}
      <aside style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s4);min-width:0;")}>
        <div>
          <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>Lo que llevas</h2>
          <div style={css(NOTA + "margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{c.titulo}</div>
        </div>
        <div style={css("position:relative;display:grid;place-items:center;")}>
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
            {p > 0 && (
              <circle cx="60" cy="60" r={R} fill="none" stroke="var(--oro)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${C * p} ${C}`} transform="rotate(-90 60 60)" />
            )}
          </svg>
          <div style={css("position:absolute;inset:0;display:grid;place-items:center;text-align:center;")}>
            <div>
              <div style={css("font-weight:300;font-size:28px;letter-spacing:-.03em;line-height:1;")}>{Math.round(p * 100)} %</div>
              <div style={css(NOTA + "margin-top:4px;")}>hecho</div>
            </div>
          </div>
        </div>
        <div style={css(NOTA + "text-align:center;margin-top:-6px;")}>
          {nHechas} de {total} {total === 1 ? "lección" : "lecciones"}
        </div>
        <button onClick={() => abrir(c)} style={css(botonPrincipal())}>
          {p > 0 ? "Seguir" : "Empezar"}
        </button>

        <ol style={css("list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;")}>
          {c.modulos.flatMap((m) => m.lecciones).slice(0, 12).map((l, i) => {
            const hecha = hechas.has(l.id);
            const esta = siguiente?.id === l.id;
            return (
              <li
                key={l.id}
                style={css(
                  "display:flex;align-items:center;gap:10px;padding:8px 6px;border-radius:var(--r-sm);font-size:var(--t-mini);" +
                    (esta ? "background:var(--accion-suave);color:var(--text);font-weight:500;" : "color:" + (hecha ? "var(--text-2)" : "var(--text-3)") + ";")
                )}
              >
                <span style={css("width:1.6em;color:var(--text-4);font-variant-numeric:tabular-nums;")}>{i + 1}.</span>
                <span style={css("flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{l.titulo || "Sin nombre"}</span>
                <span
                  aria-label={hecha ? "hecha" : esta ? "la siguiente" : "por hacer"}
                  style={css(
                    "flex:none;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:var(--t-micro);" +
                      (hecha
                        ? "background:var(--green);color:var(--surface);"
                        : esta
                          ? "border:2px solid var(--oro);"
                          : "border:1.5px solid var(--border-strong);")
                  )}
                >
                  {hecha ? "✓" : ""}
                </span>
              </li>
            );
          })}
        </ol>
        {total > 12 && <div style={css(NOTA)}>y {total - 12} más dentro del curso</div>}
        <button onClick={() => abrir(c)} style={css(BOTON_NORMAL + "align-self:flex-start;font-size:var(--t-mini);")}>
          Ver el temario entero
        </button>
      </aside>
    </div>
  );
}
