"use client";

/**
 * ============================================================================
 * EL TABLERO: CÓMO VA EL DÍA
 * ============================================================================
 *
 * Lo primero que ve Iris al entrar. Hasta el 20 de octubre de 2026 lo primero
 * era la consulta —un formulario en blanco— y para saber si hoy había sesión,
 * quién había escrito o qué factura colgaba había que ir a tres sitios.
 *
 * LA REFERENCIA. Gerson mandó un panel de recursos humanos: piezas de distinto
 * tamaño sobre un fondo con luz, una foto grande, un gráfico de barras, un
 * reloj en anillo, un bloque oscuro con la lista de tareas y una semana de
 * calendario. Se ha copiado la COMPOSICIÓN, no los colores: el amarillo de
 * allí es aquí el oro claro, el negro es el vino de la casa, y la letra es la
 * misma Instrument Sans de la web, en fino para las cifras grandes.
 *
 * LA REGLA QUE NO SE SALTA: NI UNA CIFRA DE RELLENO. La referencia está llena
 * de números porque es una maqueta. Aquí cada número sale de lo que hay
 * guardado —las sesiones, las fichas, las facturas, los cursos— y cuando no
 * hay nada, la pieza lo dice y ofrece el paso que lo arregla. Una pantalla de
 * inicio con ceros bonitos inventados es la forma más rápida de que Iris deje
 * de fiarse de todas las demás.
 */

import { useEffect, useMemo, useState } from "react";
import { css } from "@/lib/css";
import { useApp, type View } from "@/lib/app-context";
import { useSesion } from "@/lib/sesion";
import { BOTON_PLANO, botonPrincipal } from "@/lib/ui";
import {
  abreDia,
  abreSemana,
  avisos as repoAvisos,
  calculaAvisos,
  citas as repoCitas,
  cierraDia,
  cierraSemana,
  claveDia,
  clientes as repoClientes,
  diaRelativo,
  etiquetaTipo,
  euros,
  facturas as repoFacturas,
  hora,
  semanaDe,
  totales,
  type Aviso,
  type Cita,
  type Cliente,
  type Factura,
} from "@/lib/despacho";
import { cursos as repoCursos, inscripciones as repoInscripciones, type Curso } from "@/lib/escuela";
import { IcoAgenda, IcoClientes, IcoComunidad, IcoMetricas } from "../Iconos";

/* ------------------------------------------------------------------ datos */

type Datos = {
  citas: Cita[];
  clientes: Cliente[];
  facturas: Factura[];
  avisos: Aviso[];
  cursos: Curso[];
  alumnos: number;
};

/** Lo que se lee al entrar. Cada lectura falla sola: si las facturas no se
 *  pueden leer, la agenda se sigue viendo y la pieza de facturas lo dice. */
function useDatos() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [fallo, setFallo] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const [citas, clientes, facturas, vistos, cursos] = await Promise.all([
          repoCitas.listar(),
          repoClientes.listar(),
          repoFacturas.listar(),
          repoAvisos.vistos(),
          repoCursos.listar(),
        ]);
        /* Alumnos: quien tiene al menos una inscripción, contado una vez. Una
           persona con tres cursos es una alumna, no tres. */
        const porCurso = await Promise.all(cursos.map((c) => repoInscripciones.deCurso(c.id)));
        const alumnos = new Set(porCurso.flat().map((i) => i.uid)).size;
        if (!vivo) return;
        setDatos({
          citas: citas.filter((c) => c.estado !== "anulada"),
          clientes,
          facturas,
          avisos: calculaAvisos({ citas, clientes, facturas, vistos }),
          cursos,
          alumnos,
        });
      } catch (e) {
        console.error("[tablero] no se han podido leer los datos", e);
        if (vivo) setFallo("No he podido leer tus datos. Si es la conexión, vuelve a entrar en un momento.");
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  return { datos, fallo };
}

/* ------------------------------------------------------------- vocabulario */

/** La pieza: blanca, canto blando, borde que se ve. */
const PIEZA =
  "background:var(--surface);border:1px solid var(--border);border-radius:var(--r-tarjeta);box-shadow:var(--nm-alto);padding:var(--pad-card-sm);min-width:0;display:flex;flex-direction:column;gap:var(--s3);";
/** La pieza oscura. Una por pantalla: si hubiera dos, ninguna anclaría. */
const PIEZA_OSCURA =
  "background:var(--bloque);border:1px solid var(--bloque-borde);border-radius:var(--r-tarjeta);box-shadow:var(--shadow-lg);padding:var(--pad-card-sm);min-width:0;display:flex;flex-direction:column;gap:var(--s3);color:var(--sobre-bloque);";
const TITULO_PIEZA = "font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;line-height:1.15;color:var(--text);";
const CIFRA = "font-weight:300;letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums;";
const APOYO = "font-size:var(--t-mini);color:var(--text-3);line-height:1.4;";

/** La flecha redonda de la esquina: «esto se abre». */
function Abrir({ onClick, etiqueta, oscura }: { onClick: () => void; etiqueta: string; oscura?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      style={css(
        "flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;cursor:pointer;transition:background var(--mov);" +
          (oscura
            ? "background:var(--bloque-2);border:1px solid var(--bloque-borde);color:var(--oro-luz);"
            : "background:var(--surface-2);border:1px solid var(--border);color:var(--text);")
      )}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </button>
  );
}

const INICIALES = ["L", "M", "X", "J", "V", "S", "D"];

function saludo(d: Date): string {
  const h = d.getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 21) return "Buenas tardes";
  return "Buenas noches";
}

/** «1 h 30 min», «45 min», «6 h». */
function tiempo(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

/** La cifra grande, que tiene que caber en un renglón: «6,5 h», «45 min». */
function horas(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.round((min / 60) * 10) / 10;
  return `${String(h).replace(".", ",")} h`;
}

/* ================================================================ pantalla */

export default function TableroScreen() {
  const { setView, setClienteAbierto, setFocoFicha, setFacturaAbierta } = useApp();
  const { usuario } = useSesion();
  const { datos, fallo } = useDatos();
  /* La hora se fija al montar: el tablero es una foto de cuándo se abre, y un
     reloj corriendo repintaría las siete piezas cada minuto por un número. */
  const [ahora] = useState(() => new Date());

  const semana = useMemo(() => semanaDe(ahora), [ahora]);
  const citasSemana = useMemo(() => {
    if (!datos) return [];
    const desde = abreSemana(ahora).getTime();
    const hasta = cierraSemana(ahora).getTime();
    return datos.citas
      .filter((c) => {
        const t = new Date(c.inicioISO).getTime();
        return t >= desde && t <= hasta;
      })
      .sort((a, b) => a.inicioISO.localeCompare(b.inicioISO));
  }, [datos, ahora]);

  const nombreDe = (id: string) => datos?.clientes.find((c) => c.id === id)?.nombre ?? "Sin nombre";
  const nombre = ((usuario && usuario.nombre) || "Iris").split(" ")[0];

  const irAviso = (a: Aviso) => {
    const d = a.destino;
    if (d.pantalla === "agenda") return setView("agenda");
    if (d.pantalla === "clientes") {
      setClienteAbierto(d.clienteId);
      setFocoFicha(d.foco ?? null);
      return setView("personas");
    }
    setFacturaAbierta(d.facturaId);
    setView("facturas");
  };

  return (
    <div data-tablero="" style={css("max-width:1400px;margin:0 auto;min-width:0;padding:var(--s6) var(--gutter) var(--s8);")}>
      <Cabecera
        saludo={`${saludo(ahora)}, ${nombre}`}
        fecha={diaRelativo(ahora) === "Hoy" ? ahora.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }) : ""}
        citasSemana={citasSemana}
        datos={datos}
      />

      {fallo && (
        <p role="alert" style={css("margin:0 0 var(--s4);padding:12px 16px;border-radius:var(--r);background:var(--red-soft);border:1px solid var(--red-border);color:var(--red);font-size:var(--t-body);")}>
          {fallo}
        </p>
      )}

      <div data-tablero-rejilla="">
        <Retrato alPulsar={() => setView("inicio")} />
        <Semana semana={semana} citas={citasSemana} hoy={ahora} abrir={() => setView("agenda")} />
        <Proxima datos={datos} ahora={ahora} nombreDe={nombreDe} abrir={() => setView("agenda")} />
        <Columna datos={datos} ahora={ahora} irAviso={irAviso} abrirFacturas={() => setView("facturas")} />
        <Atajos datos={datos} ir={setView} />
        <AgendaSemana semana={semana} citas={citasSemana} hoy={ahora} nombreDe={nombreDe} abrir={() => setView("agenda")} />
      </div>
    </div>
  );
}

/* ================================================================ cabecera */

function Cabecera({
  saludo: texto,
  fecha,
  citasSemana,
  datos,
}: {
  saludo: string;
  fecha: string;
  citasSemana: Cita[];
  datos: Datos | null;
}) {
  const hechas = citasSemana.filter((c) => c.estado === "hecha").length;
  const confirmadas = citasSemana.filter((c) => c.estado === "confirmada").length;
  const pedidas = citasSemana.filter((c) => c.estado === "pedida").length;
  const total = citasSemana.length;

  /*
   * LA TIRA DE PASTILLAS. En la referencia son porcentajes de un proceso de
   * contratación; aquí es la semana de sesiones partida por cómo está cada
   * una. El ancho de cada pastilla ES su parte, así que se lee sin leer.
   */
  const tramos: Array<{ k: string; n: number; estilo: string }> = [
    { k: "Hechas", n: hechas, estilo: "background:var(--vino);color:var(--sobre-bloque);" },
    { k: "Confirmadas", n: confirmadas, estilo: "background:var(--oro-luz);color:var(--vino);" },
    {
      k: "Por confirmar",
      n: pedidas,
      estilo:
        "background:repeating-linear-gradient(-45deg,var(--surface) 0 6px,var(--surface-2) 6px 12px);color:var(--text);border:1px solid var(--border-strong);",
    },
  ].filter((t) => t.n > 0);

  const cifras: Array<{ n: number | null; que: string }> = [
    { n: datos ? datos.clientes.length : null, que: "Personas" },
    { n: datos ? total : null, que: "Sesiones esta semana" },
    { n: datos ? datos.alumnos : null, que: "Alumnos" },
  ];

  return (
    <header data-tablero-cabecera="" style={css("margin-bottom:var(--gap-lg);")}>
      <div style={css("min-width:0;display:flex;flex-direction:column;gap:var(--s5);")}>
        <div>
          <h1 style={css("margin:0;font-family:var(--font-display);font-variation-settings:normal;font-weight:300;font-size:clamp(34px,4.2vw,54px);letter-spacing:-.035em;line-height:1.05;color:var(--text);")}>
            {texto}
          </h1>
          {fecha && <p style={css("margin:8px 0 0;font-size:var(--t-body);color:var(--text-3);")}>{fecha.replace(/^./, (c) => c.toLocaleUpperCase("es"))}</p>}
        </div>

        <div style={css("display:flex;flex-direction:column;gap:8px;max-width:640px;")}>
          <div style={css("display:flex;gap:8px;")}>
            {tramos.length > 0 ? (
              tramos.map((t) => (
                <div key={t.k} style={css(`flex:${t.n} 1 0;min-width:96px;font-size:var(--t-mini);color:var(--text-3);`)}>
                  {t.k}
                </div>
              ))
            ) : (
              <div style={css("font-size:var(--t-mini);color:var(--text-3);")}>Esta semana</div>
            )}
          </div>
          <div style={css("display:flex;gap:8px;")}>
            {tramos.length > 0 ? (
              tramos.map((t) => (
                <div
                  key={t.k}
                  style={css(
                    `flex:${t.n} 1 0;min-width:96px;height:38px;border-radius:var(--r-pill);display:flex;align-items:center;padding:0 16px;font-size:var(--t-mini);font-weight:500;font-variant-numeric:tabular-nums;${t.estilo}`
                  )}
                >
                  {t.n}
                </div>
              ))
            ) : (
              <div
                style={css(
                  "flex:1;height:38px;border-radius:var(--r-pill);display:flex;align-items:center;padding:0 16px;font-size:var(--t-mini);color:var(--text-3);border:1px solid var(--border-strong);background:repeating-linear-gradient(-45deg,var(--surface) 0 6px,var(--surface-2) 6px 12px);"
                )}
              >
                {datos ? "Sin sesiones apuntadas esta semana" : "Leyendo…"}
              </div>
            )}
          </div>
        </div>
      </div>

      <dl data-tablero-cifras="" style={css("margin:0;display:flex;gap:clamp(20px,3vw,44px);align-items:flex-end;")}>
        {cifras.map((c) => (
          <div key={c.que} style={css("display:flex;flex-direction:column;gap:6px;")}>
            <dd style={css(CIFRA + "margin:0;font-size:clamp(44px,5vw,68px);color:var(--text);")}>{c.n ?? "–"}</dd>
            <dt style={css("font-size:var(--t-mini);color:var(--text-3);")}>{c.que}</dt>
          </div>
        ))}
      </dl>
    </header>
  );
}

/* ================================================================= retrato */

/**
 * LA FOTO DE IRIS, A SANGRE. Es su foto de verdad, la de la web. Ni una cara
 * generada: una plataforma que lleva su nombre no pone a otra persona en su
 * sitio. Y el botón de la consulta va aquí porque la consulta es ella.
 */
function Retrato({ alPulsar }: { alPulsar: () => void }) {
  return (
    <section
      data-tablero-retrato=""
      style={css(
        "position:relative;overflow:hidden;border-radius:var(--r-tarjeta);min-height:300px;background:var(--bloque);box-shadow:var(--nm-alto);display:flex;flex-direction:column;justify-content:flex-end;"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/iris.jpg" alt="Iris Soares" style={css("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 18%;")} />
      <div aria-hidden="true" style={css("position:absolute;inset:0;background:linear-gradient(180deg,transparent 38%,rgba(34,29,31,.55) 66%,rgba(34,29,31,.86) 100%);")} />
      <div style={css("position:relative;padding:var(--pad-card-sm);display:flex;align-items:flex-end;justify-content:space-between;gap:var(--s3);flex-wrap:wrap;")}>
        <div style={css("min-width:0;")}>
          <div style={css("font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;color:var(--sobre-bloque);")}>Iris Soares</div>
          <div style={css("font-size:var(--t-mini);color:var(--oro-luz);")}>Escuela de Sabiduría 33</div>
        </div>
        <button onClick={alPulsar} style={css(botonPrincipal() + "padding:10px 18px;background:var(--sobre-bloque);color:var(--vino);border-color:var(--sobre-bloque);")}>
          Nueva consulta
        </button>
      </div>
    </section>
  );
}

/* ================================================================== semana */

function Semana({ semana, citas, hoy, abrir }: { semana: Date[]; citas: Cita[]; hoy: Date; abrir: () => void }) {
  const minutosDia = semana.map((d) => {
    const k = claveDia(d);
    return citas.filter((c) => claveDia(new Date(c.inicioISO)) === k).reduce((s, c) => s + c.minutos, 0);
  });
  const total = minutosDia.reduce((s, m) => s + m, 0);
  const tope = Math.max(...minutosDia, 1);
  const iHoy = semana.findIndex((d) => claveDia(d) === claveDia(hoy));

  return (
    <section style={css(PIEZA)}>
      <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:var(--s3);")}>
        <h2 style={css(TITULO_PIEZA + "margin:0;")}>Tu semana</h2>
        <Abrir onClick={abrir} etiqueta="Abrir la agenda" />
      </div>
      <div style={css("display:flex;align-items:baseline;gap:10px;")}>
        <span style={css(CIFRA + "font-size:var(--t-hero);color:var(--text);white-space:nowrap;")}>{horas(total)}</span>
        <span style={css(APOYO + "max-width:9em;")}>de sesión esta semana</span>
      </div>
      {/* Las barras: un palo por día y su alto es lo que dura lo apuntado.
          El de hoy va en oro, como el día marcado de la referencia. */}
      <div aria-hidden="true" style={css("flex:1;min-height:120px;display:grid;grid-template-columns:repeat(7,1fr);align-items:end;gap:6px;margin-top:auto;")}>
        {minutosDia.map((m, i) => {
          const esHoy = i === iHoy;
          const alto = m ? Math.max(12, Math.round((m / tope) * 100)) : 0;
          return (
            <div key={i} style={css("display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end;")}>
              {esHoy && m > 0 && (
                <span style={css("font-size:var(--t-micro);font-weight:500;padding:3px 7px;border-radius:var(--r-pill);background:var(--oro-luz);color:var(--vino);white-space:nowrap;")}>{tiempo(m)}</span>
              )}
              <div
                style={css(
                  "width:8px;border-radius:var(--r-pill);" +
                    (m
                      ? `height:${alto}%;background:${esHoy ? "var(--oro)" : "var(--text)"};`
                      : "height:22%;background:repeating-linear-gradient(180deg,var(--border-strong) 0 3px,transparent 3px 6px);")
                )}
              />
              <span style={css("width:6px;height:6px;border-radius:50%;background:" + (esHoy ? "var(--oro)" : "var(--text)") + ";opacity:" + (m ? 1 : 0.25) + ";")} />
            </div>
          );
        })}
      </div>
      <div style={css("display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center;font-size:var(--t-micro);color:var(--text-3);")}>
        {INICIALES.map((l, i) => (
          <span key={i} style={css(i === iHoy ? "color:var(--text);font-weight:500;" : "")}>{l}</span>
        ))}
      </div>
      <span className="sr-only" style={css("position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);")}>
        {semana.map((d, i) => `${INICIALES[i]}: ${minutosDia[i] ? tiempo(minutosDia[i]) : "nada"}`).join(", ")}
      </span>
    </section>
  );
}

/* ================================================================= próxima */

/**
 * LA PRÓXIMA SESIÓN, EN ANILLO. La referencia tiene un cronómetro; aquí el
 * centro dice cuánto falta para la siguiente y el anillo cuánto del día está
 * hecho: sesiones de hoy terminadas sobre las que hay.
 */
function Proxima({ datos, ahora, nombreDe, abrir }: { datos: Datos | null; ahora: Date; nombreDe: (id: string) => string; abrir: () => void }) {
  const t = ahora.getTime();
  const proxima = datos?.citas
    .filter((c) => (c.estado === "pedida" || c.estado === "confirmada") && new Date(c.inicioISO).getTime() > t)
    .sort((a, b) => a.inicioISO.localeCompare(b.inicioISO))[0];
  const deHoy = (datos?.citas ?? []).filter((c) => {
    const x = new Date(c.inicioISO).getTime();
    return x >= abreDia(ahora).getTime() && x <= cierraDia(ahora).getTime();
  });
  const hechasHoy = deHoy.filter((c) => c.estado === "hecha").length;
  const parte = deHoy.length ? hechasHoy / deHoy.length : 0;

  let centro = "—";
  let bajo = "Nada apuntado";
  if (proxima) {
    const faltan = Math.round((new Date(proxima.inicioISO).getTime() - t) / 60000);
    if (faltan < 24 * 60) {
      centro = `${String(Math.floor(faltan / 60)).padStart(2, "0")}:${String(faltan % 60).padStart(2, "0")}`;
      bajo = "para empezar";
    } else {
      centro = diaRelativo(new Date(proxima.inicioISO));
      bajo = `a las ${hora(proxima.inicioISO)}`;
    }
  }

  const R = 64;
  const C = 2 * Math.PI * R;

  return (
    <section style={css(PIEZA)}>
      <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:var(--s3);")}>
        <h2 style={css(TITULO_PIEZA + "margin:0;")}>Próxima sesión</h2>
        <Abrir onClick={abrir} etiqueta="Abrir la agenda" />
      </div>
      <div style={css("flex:1;display:grid;place-items:center;position:relative;min-height:170px;")}>
        <svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">
          {/* Los ticks de fuera, como la esfera de la referencia. */}
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={84 + Math.cos(a) * 80}
                y1={84 + Math.sin(a) * 80}
                x2={84 + Math.cos(a) * 76}
                y2={84 + Math.sin(a) * 76}
                stroke="var(--border-strong)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="84" cy="84" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
          {parte > 0 && (
            <circle
              cx="84"
              cy="84"
              r={R}
              fill="none"
              stroke="var(--oro)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${C * parte} ${C}`}
              transform="rotate(-90 84 84)"
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
      <div style={css("display:flex;align-items:center;justify-content:space-between;gap:var(--s3);min-height:34px;")}>
        {proxima ? (
          <div style={css("min-width:0;")}>
            <div style={css("font-size:var(--t-body);font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{nombreDe(proxima.personaId)}</div>
            <div style={css(APOYO)}>
              {etiquetaTipo(proxima.tipo)} · {tiempo(proxima.minutos)}
            </div>
          </div>
        ) : (
          <div style={css(APOYO)}>{deHoy.length ? `Hoy: ${hechasHoy} de ${deHoy.length} hechas` : "Hoy no tienes ninguna sesión"}</div>
        )}
        {deHoy.length > 0 && proxima && <div style={css(APOYO + "white-space:nowrap;")}>{hechasHoy}/{deHoy.length} hoy</div>}
      </div>
    </section>
  );
}

/* ======================================================= facturas + avisos */

/*
 * CUATRO Y NO MÁS. Con cinco, la pieza oscura crecía hasta el doble que sus
 * vecinas y estiraba la fila de abajo, que se llenaba de aire. El detalle de
 * cada aviso tampoco va: está en la campana, que es donde se lee entero.
 */
const TOPE_AVISOS = 4;

function Columna({
  datos,
  ahora,
  irAviso,
  abrirFacturas,
}: {
  datos: Datos | null;
  ahora: Date;
  irAviso: (a: Aviso) => void;
  abrirFacturas: () => void;
}) {
  const mes = ahora.toISOString().slice(0, 7);
  const delMes = (datos?.facturas ?? []).filter((f) => f.fecha.startsWith(mes));
  const emitidas = delMes.filter((f) => f.estado === "emitida");
  const borradores = (datos?.facturas ?? []).filter((f) => f.estado === "borrador");
  const facturado = emitidas.reduce((s, f) => s + totales(f).total, 0);
  const nombreMes = ahora.toLocaleDateString("es", { month: "long" });
  const lista = datos?.avisos ?? [];

  return (
    <div data-tablero-columna="" style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
      <section style={css(PIEZA)}>
        <h2 style={css(TITULO_PIEZA + "margin:0;")}>Facturado</h2>
        <span style={css(CIFRA + "font-size:var(--t-hero);color:var(--text);white-space:nowrap;")}>{datos ? euros(facturado) : "–"}</span>
        <div style={css(APOYO)}>
          En {nombreMes}: {emitidas.length === 1 ? "1 factura emitida" : `${emitidas.length} facturas emitidas`}
          {borradores.length > 0 && ` · ${borradores.length === 1 ? "1 borrador" : `${borradores.length} borradores`}`}
        </div>
        <button onClick={abrirFacturas} style={css(BOTON_PLANO + "align-self:flex-start;font-size:var(--t-mini);")}>
          Ver facturas
        </button>
      </section>

      <section style={css(PIEZA_OSCURA + "flex:1;")}>
        <div style={css("display:flex;align-items:baseline;justify-content:space-between;gap:var(--s3);")}>
          <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;color:var(--sobre-bloque);")}>Pendiente</h2>
          <span style={css(CIFRA + "font-size:var(--t-head);color:var(--oro-luz);")}>{datos ? lista.length : "–"}</span>
        </div>
        {datos && lista.length === 0 && <p style={css("margin:0;font-size:var(--t-body);color:var(--sobre-bloque-2);")}>No hay nada que te esté esperando.</p>}
        <ul style={css("list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;")}>
          {lista.slice(0, TOPE_AVISOS).map((a) => (
            <li key={a.id}>
              <button
                onClick={() => irAviso(a)}
                style={css(
                  "width:100%;display:flex;align-items:center;gap:12px;padding:9px 6px;border:none;border-radius:var(--r);background:transparent;color:inherit;text-align:left;cursor:pointer;font:inherit;"
                )}
              >
                <span
                  aria-hidden="true"
                  style={css(
                    "flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--bloque-2);border:1px solid var(--bloque-borde);"
                  )}
                >
                  <span style={css("width:8px;height:8px;border-radius:50%;background:" + (a.tono === "pierde" ? "var(--via-origen)" : a.tono === "hoy" ? "var(--oro-luz)" : "var(--sobre-bloque-2)") + ";")} />
                </span>
                <span style={css("min-width:0;flex:1;")}>
                  <span style={css("display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:var(--t-body);color:var(--sobre-bloque);line-height:1.3;")}>{a.titulo}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {lista.length > TOPE_AVISOS && (
          <div style={css("margin-top:auto;font-size:var(--t-mini);color:var(--sobre-bloque-2);")}>
            Y {lista.length - TOPE_AVISOS} más en la campana de arriba.
          </div>
        )}
      </section>
    </div>
  );
}

/* =================================================================== atajos */

/**
 * LA LISTA PLEGABLE de la referencia. Allí son prestaciones del empleado; aquí
 * es lo que no es el día: la escuela y la gente. Una abierta y las demás
 * cerradas, para que la pieza no crezca más que sus vecinas.
 */
function Atajos({ datos, ir }: { datos: Datos | null; ir: (v: View) => void }) {
  const [abierta, setAbierta] = useState<"cursos" | "personas" | null>("cursos");
  const ultimas = [...(datos?.clientes ?? [])].sort((a, b) => b.creada.localeCompare(a.creada)).slice(0, 3);
  const cursos = datos?.cursos.slice(0, 3) ?? [];

  const cabeza = (k: "cursos" | "personas", texto: string, n: number | null) => (
    <button
      onClick={() => setAbierta(abierta === k ? null : k)}
      aria-expanded={abierta === k}
      style={css("width:100%;display:flex;align-items:center;justify-content:space-between;gap:var(--s3);padding:12px 0;border:none;background:none;cursor:pointer;font:inherit;color:var(--text);")}
    >
      <span style={css("font-size:var(--t-body);font-weight:500;")}>
        {texto}
        {n != null && <span style={css("color:var(--text-3);font-weight:400;margin-left:8px;")}>{n}</span>}
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={css("transition:transform var(--mov);transform:rotate(" + (abierta === k ? 180 : 0) + "deg);")}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );

  const enlace = (v: View, texto: string, Ico: (p: { size?: number }) => React.JSX.Element) => (
    <button
      onClick={() => ir(v)}
      style={css("width:100%;display:flex;align-items:center;gap:10px;padding:12px 0;border:none;border-top:1px dashed var(--border-strong);background:none;cursor:pointer;font:inherit;font-size:var(--t-body);font-weight:500;color:var(--text);text-align:left;")}
    >
      <span style={css("color:var(--text-3);display:grid;")}>
        <Ico size={18} />
      </span>
      {texto}
    </button>
  );

  return (
    <section data-tablero-atajos="" style={css(PIEZA + "gap:0;padding-top:8px;padding-bottom:8px;")}>
      {cabeza("cursos", "Cursos", datos ? datos.cursos.length : null)}
      {abierta === "cursos" && (
        <div style={css("display:flex;flex-direction:column;gap:10px;padding-bottom:12px;")}>
          {datos && cursos.length === 0 && <p style={css(APOYO + "margin:0;")}>Todavía no hay ningún curso.</p>}
          {cursos.map((c) => (
            <button key={c.id} onClick={() => ir("gestion")} style={css("display:flex;align-items:center;gap:12px;padding:0;border:none;background:none;cursor:pointer;font:inherit;text-align:left;color:var(--text);")}>
              <Portada curso={c} />
              <span style={css("min-width:0;")}>
                <span style={css("display:block;font-size:var(--t-body);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{c.titulo || "Sin título"}</span>
                <span style={css("display:block;font-size:var(--t-mini);color:" + (c.publicado ? "var(--green)" : "var(--text-3)") + ";")}>{c.publicado ? "Publicado" : "Borrador"}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      <div style={css("border-top:1px dashed var(--border-strong);")} />
      {cabeza("personas", "Últimas personas", datos ? datos.clientes.length : null)}
      {abierta === "personas" && (
        <div style={css("display:flex;flex-direction:column;gap:8px;padding-bottom:12px;")}>
          {datos && ultimas.length === 0 && <p style={css(APOYO + "margin:0;")}>Todavía no hay nadie fichado.</p>}
          {ultimas.map((p) => (
            <div key={p.id} style={css("display:flex;align-items:center;gap:10px;font-size:var(--t-body);color:var(--text);")}>
              <span aria-hidden="true" style={css("width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--arena);color:var(--vino);font-size:var(--t-mini);font-weight:500;")}>
                {(p.nombre || "?").slice(0, 1).toLocaleUpperCase("es")}
              </span>
              <span style={css("overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{p.nombre}</span>
            </div>
          ))}
        </div>
      )}
      {enlace("personas", "Personas", IcoClientes)}
      {enlace("comunidad", "Comunidad", IcoComunidad)}
      {enlace("metricas", "Métricas", IcoMetricas)}
    </section>
  );
}

/** La miniatura del curso. Sin portada, la inicial sobre vino: nunca un roto. */
function Portada({ curso }: { curso: Curso }) {
  const esImagen = curso.portada && !/\.(mp4|webm|mov)(\?|$)/i.test(curso.portada);
  return (
    <span style={css("flex:none;width:56px;height:40px;border-radius:var(--r-sm);overflow:hidden;display:grid;place-items:center;background:var(--bloque);color:var(--oro-luz);font-size:var(--t-body);font-weight:500;")}>
      {esImagen ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={curso.portada} alt="" style={css("width:100%;height:100%;object-fit:cover;")} />
      ) : (
        (curso.titulo || "?").slice(0, 1).toLocaleUpperCase("es")
      )}
    </span>
  );
}

/* ============================================================ la semana, día a día */

function AgendaSemana({
  semana,
  citas,
  hoy,
  nombreDe,
  abrir,
}: {
  semana: Date[];
  citas: Cita[];
  hoy: Date;
  nombreDe: (id: string) => string;
  abrir: () => void;
}) {
  const kHoy = claveDia(hoy);
  const mes = semana[0].toLocaleDateString("es", { month: "long", year: "numeric" });

  return (
    <section data-tablero-agenda="" style={css(PIEZA)}>
      <div style={css("display:flex;align-items:center;justify-content:space-between;gap:var(--s3);")}>
        <div>
          <h2 style={css(TITULO_PIEZA + "margin:0;")}>Agenda</h2>
          <div style={css(APOYO)}>{mes.replace(/^./, (c) => c.toLocaleUpperCase("es"))}</div>
        </div>
        <button onClick={abrir} style={css(BOTON_PLANO + "font-size:var(--t-mini);display:inline-flex;align-items:center;gap:8px;")}>
          <IcoAgenda size={16} />
          Abrir agenda
        </button>
      </div>
      <div data-tablero-dias="" style={css("display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;")}>
        {semana.map((d, i) => {
          const k = claveDia(d);
          const esHoy = k === kHoy;
          const delDia = citas.filter((c) => claveDia(new Date(c.inicioISO)) === k);
          return (
            <div
              key={k}
              style={css(
                "min-width:0;display:flex;flex-direction:column;gap:6px;padding:8px 4px;border-radius:var(--r);" +
                  (esHoy ? "background:var(--accion-suave);" : "") +
                  (i > 0 ? "border-left:1px dashed var(--border);" : "")
              )}
            >
              <div style={css("text-align:center;margin-bottom:4px;")}>
                <div style={css("font-size:var(--t-micro);color:var(--text-3);")}>{d.toLocaleDateString("es", { weekday: "short" })}</div>
                <div style={css(CIFRA + "font-size:var(--t-title);color:" + (esHoy ? "var(--accion)" : "var(--text)") + ";font-weight:" + (esHoy ? 500 : 300) + ";")}>{d.getDate()}</div>
              </div>
              {delDia.slice(0, 3).map((c) => (
                <div
                  key={c.id}
                  title={`${hora(c.inicioISO)} · ${nombreDe(c.personaId)} · ${etiquetaTipo(c.tipo)}`}
                  style={css(
                    "min-width:0;padding:7px 8px;border-radius:var(--r-sm);font-size:var(--t-micro);line-height:1.3;" +
                      (c.tipo === "sesion"
                        ? "background:var(--bloque);color:var(--sobre-bloque);"
                        : "background:var(--surface);border:1px solid var(--border-strong);color:var(--text);")
                  )}
                >
                  <div style={css("font-weight:500;font-variant-numeric:tabular-nums;")}>{hora(c.inicioISO)}</div>
                  <div style={css("overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.85;")}>{nombreDe(c.personaId)}</div>
                </div>
              ))}
              {delDia.length > 3 && <div style={css("font-size:var(--t-micro);color:var(--text-3);text-align:center;")}>+{delDia.length - 3}</div>}
            </div>
          );
        })}
      </div>
      {citas.length === 0 && <p style={css(APOYO + "margin:0;text-align:center;")}>Esta semana no tienes nada apuntado.</p>}
    </section>
  );
}
