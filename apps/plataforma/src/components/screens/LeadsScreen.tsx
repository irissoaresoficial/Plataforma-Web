"use client";

/**
 * LOS LEADS: QUIÉN HA ENTRADO POR LA WEB.
 *
 * Es donde se cierra el círculo del proyecto entero. Alguien deja su correo en
 * irissoares.com —la prueba gratis, la lista de la comunidad, un curso, o
 * reserva una sesión por el chat— y el servidor de la web lo guarda en
 * Firestore antes de hacer nada más. Esta pantalla lee esa misma base: lo que
 * entra por la web aparece aquí, sin que nadie tenga que copiarlo a mano.
 *
 * NO ES UN CRM COMPLETO Y NO QUIERE SERLO. Es la bandeja de entrada. Cuando
 * alguien de aquí se convierte en cliente de verdad —tiene una sesión, una
 * ficha, una factura— su sitio pasa a ser Clientes; esto se queda con la gente
 * que todavía está decidiendo.
 *
 * EL EMBUDO SON CUATRO ESTADOS Y NO DOCE, a propósito: un embudo con doce
 * estados es un embudo que nadie mantiene al día, y un estado que nadie
 * mantiene miente. Los cuatro y sus reglas de creación/borrado viven en
 * `lib/despacho/leads.ts` y en las reglas de Firestore — aquí sólo se leen y se
 * mueven.
 *
 * SIN FIREBASE, ESTA PANTALLA ESTÁ VACÍA A PROPÓSITO. No hay una versión local
 * de los leads: un lead sólo puede nacer de un formulario real de la web
 * guardándose en la nube, así que sin nube no hay nada que enseñar — y decirlo
 * es más honesto que fingir una lista de prueba.
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
  membresia: "Lista de espera — comunidad",
  curso: "Un curso",
  reserva: "Reservó una sesión",
};

function origenLegible(o: string): string {
  return ORIGENES[o] || o;
}

/** El color de cada estado. Marca, no rellena: la raya de la tarjeta y el
 *  texto de la pastilla, nunca un fondo entero. */
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
  const [filtro, setFiltro] = useState<EstadoLead | "todos">("todos");

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

  const cuenta = (e: EstadoLead) => leads?.filter((l) => l.estado === e).length ?? 0;
  const filtrados = leads?.filter((l) => filtro === "todos" || l.estado === filtro) ?? [];

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
            Esta pantalla lee directamente de Firebase, y Firebase todavía no está conectado aquí. En cuanto
            lo esté, lo que la gente deje en la web aparecerá solo, sin que nadie tenga que copiarlo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={css("max-width:1180px;margin:0 auto;padding:var(--gutter);display:flex;flex-direction:column;gap:var(--gap-lg);")}>
      <div>
        <h1 style={css(TITULO + "font-size:var(--t-hero);margin:0 0 var(--s2);")}>Leads</h1>
        <p style={css(APOYO + "margin:0;max-width:64ch;")}>
          Quién ha dejado su correo en la web, y en qué punto estás con cada uno. Se llena solo: nadie tiene
          que copiar nada aquí.
        </p>
      </div>

      {/* Los cuatro montones, como filtro — la misma idea que ya funciona en
          Clientes: no son etiquetas de base de datos, son las preguntas con las
          que se entra a mirar esto. */}
      <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;")}>
        <button
          onClick={() => setFiltro("todos")}
          style={css(
            "padding:8px 15px;border-radius:980px;font-size:var(--t-body);font-weight:590;cursor:pointer;" +
              (filtro === "todos"
                ? "border:1px solid var(--accion);background:var(--accion-suave);color:var(--accion);"
                : "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);")
          )}
        >
          Todos {leads ? `· ${leads.length}` : ""}
        </button>
        {ESTADOS_LEAD.map((e) => (
          <button
            key={e.k}
            onClick={() => setFiltro(e.k)}
            title={e.que}
            style={css(
              "padding:8px 15px;border-radius:980px;font-size:var(--t-body);font-weight:590;cursor:pointer;" +
                (filtro === e.k
                  ? "border:1px solid var(--accion);background:var(--accion-suave);color:var(--accion);"
                  : "border:1px solid var(--border-strong);background:var(--surface);color:var(--text-2);")
            )}
          >
            {e.label} · {cuenta(e.k)}
          </button>
        ))}
      </div>

      <div style={css("display:grid;grid-template-columns:minmax(0,1fr) minmax(0,340px);gap:var(--gap-lg);align-items:start;")}>
        {/* --------------------------------------------------------- la lista */}
        <div style={css(TARJETA)}>
          {leads === null ? (
            <p style={css(APOYO + PAD + "margin:0;")}>Mirando en Firebase…</p>
          ) : filtrados.length === 0 ? (
            <p style={css(APOYO + PAD + "margin:0;")}>
              {leads.length === 0
                ? "Todavía no ha entrado nadie por la web. En cuanto alguien deje su correo, aparece aquí solo."
                : "Nadie en este montón por ahora."}
            </p>
          ) : (
            <div style={css("display:flex;flex-direction:column;")}>
              {filtrados.map((l, i) => {
                const dias = l.visto ? diasEntre(l.visto, new Date()) : 0;
                return (
                  <button
                    key={l.id}
                    onClick={() => setAbierto(l.id)}
                    style={css(
                      "display:flex;align-items:center;gap:var(--s3);text-align:left;padding:14px var(--pad-card-sm);cursor:pointer;background:" +
                        (abierto === l.id ? "var(--accion-suave)" : "transparent") +
                        ";" +
                        (i > 0 ? RAYA : "")
                    )}
                  >
                    <Avatar nombre={l.nombre || l.email} />
                    <span style={css("min-width:0;flex:1;")}>
                      <span style={css("display:block;font-size:var(--t-body);font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                        {l.nombre || l.email}
                      </span>
                      <span style={css("display:block;font-size:var(--t-mini);color:var(--text-4);margin-top:1px;")}>
                        {origenLegible(l.origen)} · {l.visto ? hace(dias) : ""}
                        {l.veces > 1 ? ` · ha vuelto ${l.veces} veces` : ""}
                      </span>
                    </span>
                    <span style={css("flex:none;font-size:var(--t-mini);font-weight:600;color:" + COLOR_ESTADO[l.estado] + ";")}>
                      {ESTADOS_LEAD.find((e) => e.k === l.estado)?.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* -------------------------------------------------------- la ficha */}
        <div style={css("display:flex;flex-direction:column;gap:var(--gap);")}>
          {!activo ? (
            <div style={css(TARJETA + PAD)}>
              <p style={css(APOYO + "margin:0;")}>Elige a alguien de la lista para ver sus datos y moverlo.</p>
            </div>
          ) : (
            <>
              <div style={css(TARJETA + PAD)}>
                <div style={css("display:flex;align-items:center;gap:var(--s3);margin-bottom:var(--s4);")}>
                  <Avatar nombre={activo.nombre || activo.email} tamano={44} />
                  <div style={css("min-width:0;")}>
                    <div style={css("font-size:var(--t-title);font-weight:600;color:var(--text);overflow-wrap:anywhere;")}>
                      {activo.nombre || "Sin nombre"}
                    </div>
                    <div style={css("font-size:var(--t-mini);color:var(--text-4);")}>{origenLegible(activo.origen)}</div>
                  </div>
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
                  {activo.detalle && <div style={css(NOTA)}>{activo.detalle}</div>}
                </div>

                <div style={css(RAYA + "margin:var(--s4) 0;")} />

                <div style={css(rotulo() + "margin-bottom:8px;")}>Mover a</div>
                <div style={css("display:flex;flex-wrap:wrap;gap:8px;")}>
                  {ESTADOS_LEAD.map((e) => (
                    <button
                      key={e.k}
                      onClick={() => cambiaEstado(activo.id, e.k)}
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

              <div style={css(TARJETA + PAD)}>
                <div style={css(rotulo() + "margin-bottom:8px;")}>Lo que apuntas de esta llamada</div>
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Qué se dijo, qué quedó pendiente…"
                  rows={4}
                  style={css("width:100%;padding:11px 13px;font-family:var(--font-ui);font-size:var(--t-body);color:var(--text);resize:vertical;")}
                />
                <button onClick={guardaNota} disabled={guardando} style={css(BOTON_PLANO + "margin-top:10px;")}>
                  {guardando ? "Guardando…" : "Guardar la nota"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
