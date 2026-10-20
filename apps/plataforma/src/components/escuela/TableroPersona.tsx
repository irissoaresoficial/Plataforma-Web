"use client";

/**
 * ============================================================================
 * EL TABLERO DE QUIEN NO ES IRIS: CREADORES Y ALUMNOS
 * ============================================================================
 *
 * Gerson, el 20 de octubre de 2026, entrando como creador: «¿por qué el
 * dashboard de Iris es diferente? El de Iris es mejor; quiero que la pongas».
 *
 * Tenía razón: la escuela de un alumno o de un creador era una lista de
 * cajas, y el de Iris un tablero con piezas, cifras grandes y un bloque
 * oscuro que ancla. Esto es el mismo tablero —la misma rejilla, las mismas
 * piezas, el mismo vocabulario— con lo de cada uno dentro:
 *
 *   · su cara, a sangre, o el hueco para ponerla;
 *   · su semana (el creador, de su agenda) o su avance (el alumno);
 *   · lo próximo: su siguiente cita o su siguiente lección;
 *   · sus PUNTOS en dorado y sus primeros pasos en el bloque oscuro, que es
 *     lo que aquí hace el trabajo de los «pendientes» de Iris;
 *   · sus cursos y, el creador, su agenda de la semana.
 *
 * Todo sale de lo que hay guardado. Nada de relleno.
 */
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import { botonPrincipal } from "@/lib/ui";
import { abreSemana, cierraSemana, claveDia, diaRelativo, hora, semanaDe } from "@/lib/despacho/fechas";
import type { Cita } from "@/lib/despacho";
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
import { misEventos, type Evento } from "@/lib/escuela/agenda";
import { misPuntos, type MisPuntos } from "@/lib/escuela/puntos";
import { portadaDe } from "@/lib/escuela/portadas";
import { NOMBRE_ROL } from "@/lib/roles";
import { APOYO, Abrir, AgendaSemana, CIFRA, PIEZA, PIEZA_OSCURA, Semana, TITULO_PIEZA, saludo } from "../screens/TableroScreen";

type Datos = {
  puntos: MisPuntos;
  cursos: Curso[];
  avances: Record<string, Avance | null>;
  alumnos: number;
  eventos: Evento[];
};

/** Un evento de la agenda leído como una cita, para usar las mismas piezas que Iris. */
const comoCita = (e: Evento): Cita => ({
  id: e.id,
  personaId: e.id,
  inicioISO: e.inicioISO,
  minutos: e.minutos,
  tipo: "sesion",
  estado: "confirmada",
  creada: e.creado,
});

export default function TableroPersona() {
  const { usuario, puede } = useSesion();
  const { setView } = useApp();
  const quieto = useReducedMotion();
  const uid = usuario ? usuario.uid : "";
  const foto = usuario ? usuario.foto : undefined;
  const creador = puede("crear") && !puede("despacho");
  const [d, setD] = useState<Datos | null>(null);
  const [ahora] = useState(() => new Date());

  useEffect(() => {
    if (!uid) return;
    let vivo = true;
    (async () => {
      const puntos = await misPuntos(uid, Boolean(foto), puede);
      let cursos: Curso[] = [];
      let alumnos = 0;
      let eventos: Evento[] = [];
      const avances: Record<string, Avance | null> = {};
      if (creador) {
        const [c, ins, ev] = await Promise.all([
          repoCursos.deAutor(uid).catch(() => []),
          repoInscripciones.deAutor(uid).catch(() => []),
          misEventos(uid).catch(() => []),
        ]);
        cursos = c;
        alumnos = new Set(ins.map((i) => i.uid)).size;
        eventos = ev;
      } else {
        const [pub, ins] = await Promise.all([repoCursos.publicados().catch(() => []), repoInscripciones.deAlumno(uid).catch(() => [])]);
        const mios = new Set(ins.map((i) => i.cursoId));
        cursos = pub.filter((c) => mios.has(c.id));
        const avs = await Promise.all(cursos.map((c) => repoAvance.de(uid, c.id).catch(() => null)));
        cursos.forEach((c, i) => (avances[c.id] = avs[i]));
      }
      if (vivo) setD({ puntos, cursos, avances, alumnos, eventos });
    })();
    return () => {
      vivo = false;
    };
  }, [uid, foto, puede, creador]);

  const semana = useMemo(() => semanaDe(ahora), [ahora]);
  const citasSemana = useMemo(() => {
    if (!d) return [];
    const desde = abreSemana(ahora).getTime();
    const hasta = cierraSemana(ahora).getTime();
    return d.eventos.filter((e) => {
      const t = new Date(e.inicioISO).getTime();
      return t >= desde && t <= hasta;
    }).map(comoCita);
  }, [d, ahora]);

  const nombre = ((usuario && usuario.nombre) || "").split(" ")[0];
  const p = d?.puntos;
  const hechos = p ? p.pasos.filter((x) => x.hecho).length : 0;
  const faltan = p ? p.pasos.length - hechos : 0;
  const lecciones = d ? Object.values(d.avances).reduce((n, a) => n + (a?.hechas.length ?? 0), 0) : 0;
  const fecha = ahora.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, (c) => c.toLocaleUpperCase("es"));

  const cifras: Array<{ n: string | number; que: string }> = [
    { n: p ? p.total : "–", que: "Puntos" },
    ...(creador
      ? [
          { n: d ? d.alumnos : "–", que: "Alumnos" },
          { n: d ? d.cursos.length : "–", que: "Cursos" },
        ]
      : [
          { n: d ? lecciones : "–", que: "Lecciones hechas" },
          { n: d ? d.cursos.length : "–", que: "Cursos" },
        ]),
  ];

  return (
    <div data-tablero="" style={css("max-width:1400px;margin:0 auto;min-width:0;padding:var(--s6) var(--gutter) var(--s8);")}>
      {/* ---------------------------------------------------- la cabecera */}
      <header data-tablero-cabecera="" style={css("margin-bottom:var(--gap-lg);")}>
        <div style={css("min-width:0;display:flex;flex-direction:column;gap:var(--s5);")}>
          <div>
            <h1 style={css("margin:0;font-family:var(--font-display);font-weight:300;font-size:clamp(34px,4.2vw,54px);letter-spacing:-.035em;line-height:1.05;color:var(--text);")}>
              {saludo(ahora)}
              {nombre ? `, ${nombre}` : ""}
            </h1>
            <p style={css("margin:8px 0 0;font-size:var(--t-body);color:var(--text-3);")}>{fecha}</p>
          </div>
          {/* Los primeros pasos partidos en dos, como la tira de sesiones de
              Iris: el ancho de cada pastilla ES su parte. */}
          <div style={css("display:flex;flex-direction:column;gap:8px;max-width:640px;")}>
            <div style={css("display:flex;gap:8px;font-size:var(--t-mini);color:var(--text-3);")}>
              {hechos > 0 && <div style={css(`flex:${hechos} 1 0;min-width:96px;`)}>Pasos hechos</div>}
              {faltan > 0 && <div style={css(`flex:${faltan} 1 0;min-width:96px;`)}>Por hacer</div>}
            </div>
            <div style={css("display:flex;gap:8px;")}>
              {hechos > 0 && (
                <div style={css(`flex:${hechos} 1 0;min-width:96px;height:38px;border-radius:var(--r-pill);display:flex;align-items:center;padding:0 16px;font-size:var(--t-mini);font-weight:500;background:var(--vino);color:var(--sobre-bloque);`)}>
                  {hechos}
                </div>
              )}
              {faltan > 0 && (
                <button
                  onClick={() => setView(p!.pasos.find((x) => !x.hecho)!.ir)}
                  style={css(
                    `flex:${faltan} 1 0;min-width:96px;height:38px;border-radius:var(--r-pill);display:flex;align-items:center;padding:0 16px;font:inherit;font-size:var(--t-mini);font-weight:500;cursor:pointer;color:var(--text);border:1px solid var(--border-strong);` +
                      "background:repeating-linear-gradient(-45deg,var(--surface) 0 6px,var(--surface-2) 6px 12px);"
                  )}
                >
                  {faltan}
                </button>
              )}
              {!p && (
                <div style={css("flex:1;height:38px;border-radius:var(--r-pill);border:1px solid var(--border-strong);background:repeating-linear-gradient(-45deg,var(--surface) 0 6px,var(--surface-2) 6px 12px);")} />
              )}
            </div>
          </div>
        </div>
        <dl data-tablero-cifras="" style={css("margin:0;display:flex;gap:clamp(20px,3vw,44px);align-items:flex-end;")}>
          {cifras.map((c, i) => (
            <div key={c.que} style={css("display:flex;flex-direction:column;gap:6px;")}>
              <dd
                style={css(
                  CIFRA +
                    "margin:0;font-size:clamp(44px,5vw,68px);" +
                    /* Los puntos, en oro: son la cifra que se gana. */
                    (i === 0 ? "background:linear-gradient(135deg,var(--oro),var(--vino));-webkit-background-clip:text;background-clip:text;color:transparent;" : "color:var(--text);")
                )}
              >
                {c.n}
              </dd>
              <dt style={css("font-size:var(--t-mini);color:var(--text-3);")}>{c.que}</dt>
            </div>
          ))}
        </dl>
      </header>

      <div data-tablero-rejilla="">
        {/* ------------------------------------------------- su cara */}
        <section
          style={css(
            "position:relative;overflow:hidden;border-radius:var(--r-tarjeta);min-height:300px;background:var(--bloque);box-shadow:var(--nm-alto);display:flex;flex-direction:column;justify-content:flex-end;"
          )}
        >
          {foto ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={foto} alt="" style={css("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
          ) : (
            <div aria-hidden="true" style={css("position:absolute;inset:0;display:grid;place-items:center;font-weight:300;font-size:140px;color:var(--bloque-borde);letter-spacing:-.05em;")}>
              {(nombre[0] || "·").toUpperCase()}
            </div>
          )}
          <div aria-hidden="true" style={css("position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(34,29,31,.85) 100%);")} />
          <div style={css("position:relative;padding:var(--pad-card-sm);display:flex;align-items:flex-end;justify-content:space-between;gap:var(--s3);flex-wrap:wrap;")}>
            <div style={css("min-width:0;")}>
              <div style={css("font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;color:var(--sobre-bloque);")}>{usuario ? usuario.nombre : ""}</div>
              <div style={css("font-size:var(--t-mini);color:var(--oro-luz);")}>{(usuario ? usuario.roles : []).map((r) => NOMBRE_ROL[r]).join(" · ")}</div>
            </div>
            <button onClick={() => setView("perfil")} style={css(botonPrincipal() + "padding:10px 18px;background:var(--sobre-bloque);color:var(--vino);border-color:var(--sobre-bloque);")}>
              {foto ? "Mi perfil" : "Pon tu foto · +10"}
            </button>
          </div>
        </section>

        {/* -------------------------------------- su semana / su avance */}
        {creador ? (
          <Semana semana={semana} citas={citasSemana} hoy={ahora} abrir={() => setView("miagenda")} />
        ) : (
          <TuAvance cursos={d?.cursos ?? []} avances={d?.avances ?? {}} abrir={() => setView("cursos")} />
        )}

        {/* ---------------------------------------------- lo próximo */}
        {creador ? (
          <Proximo eventos={d?.eventos ?? []} ahora={ahora} abrir={() => setView("miagenda")} />
        ) : (
          <Siguiente cursos={d?.cursos ?? []} avances={d?.avances ?? {}} abrir={() => setView("cursos")} />
        )}

        {/* ------------------------------- puntos (oro) + pasos (oscuro) */}
        <div data-tablero-columna="" style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
          <section
            style={css(
              "border-radius:var(--r-tarjeta);padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:10px;color:var(--vino);" +
                "background:linear-gradient(135deg,var(--oro-luz) 0%,color-mix(in srgb, var(--oro) 75%, var(--oro-luz)) 100%);box-shadow:0 12px 30px color-mix(in srgb, var(--oro) 35%, transparent);"
            )}
          >
            <div style={css("display:flex;align-items:baseline;justify-content:space-between;gap:var(--s3);")}>
              <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;color:var(--vino);")}>Tus puntos</h2>
              <span style={css("font-size:var(--t-mini);font-weight:600;padding:3px 10px;border-radius:var(--r-pill);background:var(--vino);color:var(--oro-luz);")}>{p ? p.nivel.nombre : "–"}</span>
            </div>
            <span style={css(CIFRA + "font-size:var(--t-cifra, 52px);")}>{p ? p.total : "–"}</span>
            {p && p.nivel.siguiente && (
              <>
                <div style={css("height:8px;border-radius:var(--r-pill);background:color-mix(in srgb, var(--vino) 15%, transparent);overflow:hidden;")}>
                  <motion.div
                    initial={quieto ? false : { width: 0 }}
                    animate={{ width: `${Math.round(((p.total - p.nivel.desde) / ((p.nivel.hasta ?? 1) - p.nivel.desde)) * 100)}%` }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    style={css("height:100%;border-radius:var(--r-pill);background:var(--vino);")}
                  />
                </div>
                <div style={css("font-size:var(--t-mini);font-weight:500;")}>
                  Te faltan {p.nivel.faltan} para {p.nivel.siguiente}
                </div>
              </>
            )}
          </section>

          <section style={css(PIEZA_OSCURA + "flex:1;")}>
            <div style={css("display:flex;align-items:baseline;justify-content:space-between;gap:var(--s3);")}>
              <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;color:var(--sobre-bloque);")}>Tus primeros pasos</h2>
              <span style={css(CIFRA + "font-size:var(--t-head);color:var(--oro-luz);")}>
                {hechos}/{p ? p.pasos.length : 0}
              </span>
            </div>
            <ul style={css("list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;")}>
              {(p?.pasos ?? []).map((x) => (
                <li key={x.k}>
                  <button
                    onClick={() => !x.hecho && setView(x.ir)}
                    style={css(
                      "width:100%;display:flex;align-items:center;gap:12px;padding:8px 6px;border:none;border-radius:var(--r);background:transparent;color:inherit;text-align:left;font:inherit;" +
                        (x.hecho ? "cursor:default;" : "cursor:pointer;")
                    )}
                  >
                    <span
                      aria-hidden="true"
                      style={css(
                        "flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:var(--t-mini);" +
                          (x.hecho ? "background:var(--oro-luz);color:var(--vino);" : "background:var(--bloque-2);border:1px dashed var(--bloque-borde);color:var(--sobre-bloque-2);")
                      )}
                    >
                      {x.hecho ? "✓" : ""}
                    </span>
                    <span style={css("flex:1;min-width:0;font-size:var(--t-body);line-height:1.3;color:" + (x.hecho ? "var(--sobre-bloque-2)" : "var(--sobre-bloque)") + ";" + (x.hecho ? "text-decoration:line-through;" : ""))}>
                      {x.que}
                    </span>
                    <span style={css("flex:none;font-size:var(--t-micro);font-weight:600;color:var(--oro-luz);")}>+{x.puntos}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ------------------------------------------------- sus cursos */}
        <section style={css(PIEZA)}>
          <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:var(--s3);")}>
            <h2 style={css(TITULO_PIEZA + "margin:0;")}>{creador ? "Tus cursos" : "Tus cursos"}</h2>
            <Abrir onClick={() => setView("cursos")} etiqueta="Abrir los cursos" />
          </div>
          {d && d.cursos.length === 0 && (
            <p style={css(APOYO + "margin:0;")}>{creador ? "Todavía no has creado ningún curso. Empieza por aquí: suma 20 puntos." : "Todavía no tienes ningún curso."}</p>
          )}
          {(d?.cursos ?? []).slice(0, 4).map((c, i) => (
            <button key={c.id} onClick={() => setView("cursos")} style={css("display:flex;align-items:center;gap:12px;padding:0;border:none;background:none;cursor:pointer;font:inherit;text-align:left;color:var(--text);")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portadaDe(c, i)} alt="" style={css("flex:none;width:56px;height:40px;border-radius:var(--r-sm);object-fit:cover;")} />
              <span style={css("min-width:0;flex:1;")}>
                <span style={css("display:block;font-size:var(--t-body);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{c.titulo || "Sin título"}</span>
                <span style={css("display:block;font-size:var(--t-mini);color:var(--text-3);")}>
                  {creador ? (c.publicado ? "Publicado" : c.revision ? "En revisión" : "Borrador") : `${Math.round(progreso(c, d?.avances[c.id] ?? null) * 100)} % hecho`}
                </span>
              </span>
            </button>
          ))}
          {creador && (
            <button onClick={() => setView("cursos")} style={css(botonPrincipal() + "align-self:flex-start;margin-top:auto;padding:10px 18px;")}>
              + Nuevo curso
            </button>
          )}
        </section>

        {/* ---------------------------------- su agenda / la comunidad */}
        {creador ? (
          <AgendaSemana
            semana={semana}
            citas={citasSemana}
            hoy={ahora}
            nombreDe={(id) => d?.eventos.find((e) => e.id === id)?.titulo ?? ""}
            abrir={() => setView("miagenda")}
          />
        ) : (
          <section data-tablero-agenda="" style={css(PIEZA + "justify-content:center;")}>
            <h2 style={css(TITULO_PIEZA + "margin:0;")}>La comunidad</h2>
            <p style={css("margin:0;font-size:var(--t-read);line-height:1.55;color:var(--text-2);max-width:52ch;")}>
              Pregunta, cuenta lo que ves en tu carta y lee a las demás. Cada tema que abres suma 10 puntos; cada respuesta, 3.
            </p>
            {puede("comunidad") && (
              <button onClick={() => setView("comunidad")} style={css(botonPrincipal() + "align-self:flex-start;")}>
                Ir a la comunidad
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

/* ====================================================== las piezas propias */

/** El próximo evento de la agenda del creador, en anillo como el de Iris. */
function Proximo({ eventos, ahora, abrir }: { eventos: Evento[]; ahora: Date; abrir: () => void }) {
  const t = ahora.getTime();
  const siguiente = eventos.filter((e) => new Date(e.inicioISO).getTime() > t).sort((a, b) => a.inicioISO.localeCompare(b.inicioISO))[0];
  const deHoy = eventos.filter((e) => claveDia(new Date(e.inicioISO)) === claveDia(ahora));
  const pasados = deHoy.filter((e) => new Date(e.inicioISO).getTime() <= t).length;
  const parte = deHoy.length ? pasados / deHoy.length : 0;
  let centro = "—";
  let bajo = "Nada apuntado";
  if (siguiente) {
    const faltan = Math.round((new Date(siguiente.inicioISO).getTime() - t) / 60000);
    if (faltan < 24 * 60) {
      centro = `${String(Math.floor(faltan / 60)).padStart(2, "0")}:${String(faltan % 60).padStart(2, "0")}`;
      bajo = "para empezar";
    } else {
      centro = diaRelativo(new Date(siguiente.inicioISO));
      bajo = `a las ${hora(siguiente.inicioISO)}`;
    }
  }
  return <Anillo titulo="Lo próximo" centro={centro} bajo={bajo} parte={parte} pie={siguiente ? siguiente.titulo : "Apunta tu primer directo o tu primera sesión."} abrir={abrir} />;
}

/** La siguiente lección del alumno, en el mismo anillo: el anillo es lo hecho. */
function Siguiente({ cursos, avances, abrir }: { cursos: Curso[]; avances: Record<string, Avance | null>; abrir: () => void }) {
  const actual = cursos.find((c) => {
    const p = progreso(c, avances[c.id] ?? null);
    return p > 0 && p < 1;
  }) ?? cursos[0];
  if (!actual) return <Anillo titulo="Sigue por donde ibas" centro="—" bajo="Sin cursos" parte={0} pie="Cuando tengas un curso, aquí verás tu siguiente lección." abrir={abrir} />;
  const p = progreso(actual, avances[actual.id] ?? null);
  const sig = porDondeIba(actual, avances[actual.id] ?? null);
  return <Anillo titulo="Sigue por donde ibas" centro={`${Math.round(p * 100)} %`} bajo="hecho" parte={p} pie={sig ? `Te toca: ${sig.titulo || "la siguiente lección"}` : actual.titulo} abrir={abrir} />;
}

function Anillo({ titulo, centro, bajo, parte, pie, abrir }: { titulo: string; centro: string; bajo: string; parte: number; pie: string; abrir: () => void }) {
  const quieto = useReducedMotion();
  const R = 64;
  const C = 2 * Math.PI * R;
  return (
    <section style={css(PIEZA)}>
      <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:var(--s3);")}>
        <h2 style={css(TITULO_PIEZA + "margin:0;")}>{titulo}</h2>
        <Abrir onClick={abrir} etiqueta={`Abrir: ${titulo}`} />
      </div>
      <div style={css("flex:1;display:grid;place-items:center;position:relative;min-height:170px;")}>
        <svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2;
            return <line key={i} x1={84 + Math.cos(a) * 80} y1={84 + Math.sin(a) * 80} x2={84 + Math.cos(a) * 76} y2={84 + Math.sin(a) * 76} stroke="var(--border-strong)" strokeWidth="1.2" strokeLinecap="round" />;
          })}
          <circle cx="84" cy="84" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
          {parte > 0 && (
            <motion.circle
              cx="84"
              cy="84"
              r={R}
              fill="none"
              stroke="var(--oro)"
              strokeWidth="12"
              strokeLinecap="round"
              transform="rotate(-90 84 84)"
              initial={quieto ? false : { strokeDasharray: `0 ${C}` }}
              animate={{ strokeDasharray: `${C * parte} ${C}` }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            />
          )}
        </svg>
        <div style={css("position:absolute;inset:0;display:grid;place-items:center;text-align:center;")}>
          <div>
            <div style={css(CIFRA + "font-size:" + (centro.length > 5 ? "var(--t-title)" : "34px") + ";color:var(--text);")}>{centro}</div>
            <div style={css("font-size:var(--t-micro);color:var(--text-3);margin-top:4px;")}>{bajo}</div>
          </div>
        </div>
      </div>
      <div style={css(APOYO + "min-height:34px;overflow:hidden;text-overflow:ellipsis;")}>{pie}</div>
    </section>
  );
}

/** El avance del alumno, curso a curso, en barras. */
function TuAvance({ cursos, avances, abrir }: { cursos: Curso[]; avances: Record<string, Avance | null>; abrir: () => void }) {
  return (
    <section style={css(PIEZA)}>
      <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:var(--s3);")}>
        <h2 style={css(TITULO_PIEZA + "margin:0;")}>Tu avance</h2>
        <Abrir onClick={abrir} etiqueta="Abrir los cursos" />
      </div>
      {cursos.length === 0 && <p style={css(APOYO + "margin:0;")}>Aquí verás cuánto llevas de cada curso.</p>}
      <div style={css("display:flex;flex-direction:column;gap:14px;margin-top:auto;")}>
        {cursos.slice(0, 4).map((c) => {
          const p = progreso(c, avances[c.id] ?? null);
          return (
            <div key={c.id}>
              <div style={css("display:flex;justify-content:space-between;gap:8px;font-size:var(--t-mini);color:var(--text-2);margin-bottom:6px;")}>
                <span style={css("overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{c.titulo}</span>
                <span style={css("font-variant-numeric:tabular-nums;")}>
                  {Math.round(p * totalLecciones(c))}/{totalLecciones(c)}
                </span>
              </div>
              <div style={css("height:8px;border-radius:var(--r-pill);background:var(--surface-2);overflow:hidden;")}>
                <div style={css(`height:100%;width:${p * 100}%;border-radius:var(--r-pill);background:linear-gradient(90deg,var(--vino),var(--oro));`)} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
