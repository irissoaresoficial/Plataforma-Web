"use client";

/**
 * LOS LEADS: QUIÉN HA ENTRADO POR LA WEB.
 *
 * Es donde se cierra el círculo del proyecto entero. Alguien deja su correo en
 * la web —la prueba gratis, la lista de la comunidad, un curso, o reserva una
 * sesión por el chat— y el servidor lo guarda en Firestore antes de hacer nada
 * más. Esta pantalla lee esa misma base: lo que entra por la web aparece aquí,
 * sin que nadie tenga que copiarlo a mano.
 *
 * POR QUÉ COLUMNAS Y NO UNA LISTA CON FILTROS
 * ---------------------------------------------------------------------------
 * Aquí había una lista con cuatro botones encima para filtrarla, y no se
 * entendía. El motivo es que una lista filtrada enseña UN montón cada vez, y lo
 * que hay que ver de un embudo es la FORMA de todos a la vez: si hay veinte
 * esperando en «nuevo» y ninguno en «le has escrito», eso es un problema, y con
 * filtros hacen falta cuatro clics y memoria para darse cuenta. En columnas se
 * ve sin leer una palabra.
 *
 * Y sobre todo: con filtros, mover a alguien era entrar en su ficha y pulsar un
 * botón de una lista de cuatro. Aquí se arrastra la tarjeta a la columna de al
 * lado. El trabajo de este panel es mover gente de izquierda a derecha, así que
 * la pantalla tenía que estar hecha de izquierda a derecha.
 *
 * ARRASTRAR NO PUEDE SER LA ÚNICA FORMA. Arrastrar no existe con el teclado y
 * es incómodo en un móvil, así que cada tarjeta abre su ficha al pulsarla y
 * desde ahí se mueve con botones. Lo mismo, por otro camino.
 *
 * SIN FIREBASE ESTÁ VACÍA A PROPÓSITO. No hay versión local de los leads: un
 * lead sólo puede nacer de un formulario real de la web guardándose en la nube,
 * así que sin nube no hay nada que enseñar — y decirlo es más honesto que
 * fingir una lista de prueba.
 */

import { useEffect, useMemo, useState } from "react";
import { css } from "@/lib/css";
import { hayFirebase } from "@/lib/firebase";
import { hace, diasEntre } from "@/lib/despacho/fechas";
import {
  ESTADOS_LEAD,
  anotaLead,
  mueveLead,
  ultimosLeads,
  type EstadoLead,
  type Lead,
} from "@/lib/despacho/leads";
import { APOYO, BOTON_PLANO, NOTA, PAD, RAYA, TARJETA, TITULO, rotulo, tarjetaCon } from "@/lib/ui";
import { Avatar } from "../despacho/Piezas";

/** Cómo se llama cada origen cuando se le enseña a Iris. */
const ORIGENES: Record<string, string> = {
  sinergia: "La prueba gratis",
  membresia: "Lista de espera",
  curso: "Un curso",
  reserva: "Reservó una sesión",
};

const origenLegible = (o: string) => ORIGENES[o] || o;

/**
 * El color de cada columna. Marca el hilo de arriba y el número, nunca rellena:
 * cuatro columnas con cuatro fondos de color son cuatro carteles peleándose, y
 * lo que tiene que destacar en esta pantalla son las personas.
 */
const COLOR_ESTADO: Record<EstadoLead, string> = {
  nuevo: "var(--accion)",
  contactado: "var(--gold)",
  cliente: "var(--green)",
  descartado: "var(--text-4)",
};

export default function LeadsScreen() {
  const conNube = hayFirebase();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  /** Sobre qué columna está ahora mismo la tarjeta que se arrastra. */
  const [encima, setEncima] = useState<EstadoLead | null>(null);
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  const carga = () => {
    if (!conNube) return;
    ultimosLeads().then(setLeads);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(carga, [conNube]);

  const activo = useMemo(() => leads?.find((l) => l.id === abierto) ?? null, [leads, abierto]);

  useEffect(() => {
    setNota(activo?.nota ?? "");
  }, [activo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Cerrar la ficha con Escape. Un panel que tapa media pantalla y sólo se cierra
     con la equis pequeña de la esquina es un panel que estorba. */
  useEffect(() => {
    if (!activo) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(null);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [activo]);

  const porEstado = (e: EstadoLead) => leads?.filter((l) => l.estado === e) ?? [];

  const cambiaEstado = async (id: string, estado: EstadoLead) => {
    // Optimista: se ve el cambio al momento y si algo falla se recarga de la
    // base, que es la única fuente de verdad — no se deja la pantalla mintiendo.
    setLeads((s) => s?.map((l) => (l.id === id ? { ...l, estado } : l)) ?? s);
    try {
      await mueveLead(id, estado);
    } catch {
      carga();
    }
  };

  const guardaNota = async () => {
    if (!activo) return;
    setGuardando(true);
    try {
      await anotaLead(activo.id, nota);
      setLeads((s) => s?.map((l) => (l.id === activo.id ? { ...l, nota } : l)) ?? s);
    } finally {
      setGuardando(false);
    }
  };

  if (!conNube) {
    return (
      <div style={css("max-width:1180px;margin:0 auto;padding:var(--gutter);")}>
        <h1 style={css(TITULO + "font-size:var(--t-hero);margin:0 0 var(--s2);")}>Leads</h1>
        <div style={css(tarjetaCon("var(--red)") + PAD)}>
          <div style={css(rotulo("var(--red)") + "margin-bottom:var(--s2);")}>Sin conectar</div>
          <p style={css(APOYO + "margin:0;")}>
            Esta pantalla lee de Firebase, y Firebase todavía no está conectado aquí.
          </p>
        </div>
      </div>
    );
  }

  const total = leads?.length ?? 0;

  return (
    <div style={css("max-width:1400px;margin:0 auto;padding:var(--gutter);display:flex;flex-direction:column;gap:var(--gap-lg);")}>
      {/*
          LA CABECERA, DE UNA LÍNEA.
          Había aquí dos frases explicando qué es un lead y que la lista se llena
          sola. Se lee una vez, el primer día, y después son dos renglones que
          empujan hacia abajo lo único que importa —la gente— en todas las visitas
          restantes. Lo que la pantalla hace se ve haciéndolo.
      */}
      <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
        <h1 style={css(TITULO + "font-size:var(--t-hero);margin:0;")}>Leads</h1>
        <span style={css(NOTA)}>{total === 0 ? "Nadie todavía" : total === 1 ? "1 persona" : `${total} personas`}</span>
      </div>

      {leads === null ? (
        <div style={css(TARJETA + PAD)}>
          <p style={css(APOYO + "margin:0;")}>Mirando en Firebase…</p>
        </div>
      ) : (
        <div
          style={css(
            "display:grid;gap:var(--gap);align-items:start;" +
              /* Cuatro carriles que no se estrechan por debajo de lo legible: si no
                 caben, la fila se desplaza en horizontal en vez de aplastar las
                 tarjetas hasta que el nombre de alguien no cabe. */
              "grid-auto-flow:column;grid-auto-columns:minmax(238px,1fr);overflow-x:auto;padding-bottom:4px;"
          )}
        >
          {ESTADOS_LEAD.map((e) => {
            const dentro = porEstado(e.k);
            const marcada = encima === e.k;
            return (
              <section
                key={e.k}
                onDragOver={(ev) => {
                  ev.preventDefault();
                  if (encima !== e.k) setEncima(e.k);
                }}
                onDragLeave={() => setEncima((c) => (c === e.k ? null : c))}
                onDrop={(ev) => {
                  ev.preventDefault();
                  setEncima(null);
                  const id = ev.dataTransfer.getData("text/plain");
                  if (id) cambiaEstado(id, e.k);
                }}
                style={css(
                  "display:flex;flex-direction:column;gap:10px;min-height:180px;border-radius:var(--r);padding:4px;" +
                    /* La columna sólo se ilumina mientras hay algo encima. En
                       reposo no tiene fondo: cuatro cajas grises no dicen nada,
                       y lo que separa las columnas es el aire entre ellas. */
                    (marcada
                      ? "background:var(--accion-suave);outline:1px dashed var(--accion-borde);"
                      : "background:transparent;outline:1px dashed transparent;") +
                    "transition:background .18s ease,outline-color .18s ease;"
                )}
              >
                <header style={css("display:flex;align-items:center;gap:8px;padding:2px 6px 8px;")}>
                  <span style={css("width:6px;height:6px;border-radius:50%;flex:none;background:" + COLOR_ESTADO[e.k] + ";")} />
                  <span style={css("font-size:var(--t-mini);font-weight:640;letter-spacing:.02em;color:var(--text-2);")}>
                    {e.label}
                  </span>
                  <span style={css("margin-left:auto;font-size:var(--t-mini);font-weight:640;color:var(--text-4);font-variant-numeric:tabular-nums;")}>
                    {dentro.length}
                  </span>
                </header>

                {dentro.length === 0 ? (
                  /* Un hueco marcado, no un texto. Dice «aquí caben cosas» y a la
                     vez enseña dónde soltar mientras se arrastra. */
                  <div
                    style={css(
                      "border:1px dashed var(--border);border-radius:var(--r);min-height:64px;display:grid;place-items:center;" +
                        "font-size:var(--t-mini);color:var(--text-4);"
                    )}
                  >
                    —
                  </div>
                ) : (
                  dentro.map((l) => {
                    const dias = l.visto ? diasEntre(l.visto, new Date()) : 0;
                    const yendo = arrastrando === l.id;
                    return (
                      <button
                        key={l.id}
                        draggable
                        onDragStart={(ev) => {
                          ev.dataTransfer.setData("text/plain", l.id);
                          ev.dataTransfer.effectAllowed = "move";
                          setArrastrando(l.id);
                        }}
                        onDragEnd={() => {
                          setArrastrando(null);
                          setEncima(null);
                        }}
                        onClick={() => setAbierto(l.id)}
                        style={css(
                          TARJETA +
                            "text-align:left;padding:12px 13px;cursor:grab;display:flex;gap:10px;align-items:flex-start;" +
                            "border-left:2px solid " + COLOR_ESTADO[e.k] + ";" +
                            (yendo ? "opacity:.45;" : "opacity:1;") +
                            (abierto === l.id ? "outline:1px solid var(--accion);" : "") +
                            "transition:opacity .15s ease,transform .15s ease;"
                        )}
                      >
                        <Avatar nombre={l.nombre || l.email} tamano={28} />
                        <span style={css("min-width:0;flex:1;")}>
                          <span style={css("display:block;font-size:var(--t-body);font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                            {l.nombre || l.email}
                          </span>
                          <span style={css("display:block;font-size:var(--t-mini);color:var(--text-4);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                            {origenLegible(l.origen)}
                          </span>
                          <span style={css("display:block;font-size:var(--t-mini);color:var(--text-4);margin-top:4px;")}>
                            {l.visto ? hace(dias) : ""}
                            {l.veces > 1 ? ` · ${l.veces}×` : ""}
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </section>
            );
          })}
        </div>
      )}

      {/*
          LA FICHA, ENCIMA Y NO AL LADO.
          Una columna fija a la derecha se comía un tercio del ancho SIEMPRE, y
          las tres cuartas partes del tiempo enseñaba «elige a alguien de la
          lista». El embudo necesita ese ancho; la ficha sólo aparece cuando hace
          falta y se quita con Escape.
      */}
      {activo && (
        <div
          onClick={() => setAbierto(null)}
          style={css(
            "position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.42);display:flex;justify-content:flex-end;"
          )}
        >
          <aside
            onClick={(ev) => ev.stopPropagation()}
            style={css(
              "width:min(380px,100%);height:100%;overflow-y:auto;background:var(--surface-solid);" +
                "border-left:1px solid var(--border);padding:var(--pad-card);display:flex;flex-direction:column;gap:var(--gap);"
            )}
          >
            <div style={css("display:flex;align-items:flex-start;gap:var(--s3);")}>
              <Avatar nombre={activo.nombre || activo.email} tamano={40} />
              <div style={css("min-width:0;flex:1;")}>
                <div style={css("font-size:var(--t-title);font-weight:600;color:var(--text);overflow-wrap:anywhere;")}>
                  {activo.nombre || "Sin nombre"}
                </div>
                <div style={css(NOTA)}>{origenLegible(activo.origen)}</div>
              </div>
              <button
                onClick={() => setAbierto(null)}
                aria-label="Cerrar"
                style={css("flex:none;border:0;background:transparent;color:var(--text-4);font-size:19px;cursor:pointer;line-height:1;padding:2px 4px;")}
              >
                ×
              </button>
            </div>

            <div style={css("display:flex;flex-direction:column;gap:8px;font-size:var(--t-body);")}>
              <a href={`mailto:${activo.email}`} style={css("color:var(--accion);text-decoration:none;overflow-wrap:anywhere;")}>
                {activo.email}
              </a>
              {activo.whatsapp && (
                <a href={`https://wa.me/${activo.whatsapp.replace(/\D/g, "")}`} style={css("color:var(--accion);text-decoration:none;")}>
                  {activo.whatsapp} · WhatsApp
                </a>
              )}
              {activo.detalle && <div style={css(NOTA + "line-height:1.5;")}>{activo.detalle}</div>}
            </div>

            <div style={css(RAYA)} />

            <div>
              <div style={css(rotulo() + "margin-bottom:8px;")}>Mover a</div>
              <div style={css("display:flex;flex-wrap:wrap;gap:8px;")}>
                {ESTADOS_LEAD.map((e) => (
                  <button
                    key={e.k}
                    onClick={() => cambiaEstado(activo.id, e.k)}
                    title={e.que}
                    style={css(
                      "padding:7px 13px;border-radius:980px;font-size:var(--t-mini);font-weight:590;cursor:pointer;" +
                        (activo.estado === e.k
                          ? "border:1px solid var(--accion);background:var(--accion);color:var(--sobre-accion);"
                          : "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);")
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={css(RAYA)} />

            <div>
              <div style={css(rotulo() + "margin-bottom:8px;")}>Lo que apuntas</div>
              <textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Qué se dijo, qué quedó pendiente…"
                rows={5}
                style={css("width:100%;padding:11px 13px;font-family:var(--font-ui);font-size:var(--t-body);color:var(--text);resize:vertical;")}
              />
              <button onClick={guardaNota} disabled={guardando} style={css(BOTON_PLANO + "margin-top:10px;")}>
                {guardando ? "Guardando…" : "Guardar la nota"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
