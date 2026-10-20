"use client";

/**
 * ============================================================================
 * LA AGENDA DEL CREADOR
 * ============================================================================
 *
 * La semana a la vista y un sitio para apuntar. Nada más: un creador apunta
 * sus directos, sus sesiones y sus entregas, y lo que necesita es verlos por
 * días y no olvidarse. El porqué de que no sea la agenda de Iris está en
 * `lib/escuela/agenda.ts`.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { css } from "@/lib/css";
import { useSesion } from "@/lib/sesion";
import { BOTON_NORMAL, BOTON_PLANO, CAMPO, NOTA, PANTALLA, TARJETA, botonPrincipal } from "@/lib/ui";
import { claveDia, hora, masDias, semanaDe } from "@/lib/despacho/fechas";
import { borraEvento, guardaEvento, misEventos, type Evento } from "@/lib/escuela/agenda";
import Banda from "../Banda";
import { marcaAgendaVista } from "@/lib/escuela/puntos";
import Confirmar from "../Confirmar";
import SecretariaIA from "../escuela/SecretariaIA";

const hoyClave = () => claveDia(new Date());

export default function MiAgendaScreen() {
  const { usuario } = useSesion();
  const uid = usuario ? usuario.uid : "";
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [fallo, setFallo] = useState("");
  const [desde, setDesde] = useState(() => new Date());
  const [abierto, setAbierto] = useState<Evento | null>(null);

  const [titulo, setTitulo] = useState("");
  const [dia, setDia] = useState(hoyClave);
  const [hor, setHor] = useState("18:00");
  const [minutos, setMinutos] = useState(60);
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  /* Haber abierto la agenda es uno de los primeros pasos del creador. */
  useEffect(() => {
    if (uid) marcaAgendaVista(uid);
  }, [uid]);

  const carga = useCallback(async () => {
    if (!uid) return;
    try {
      setEventos(await misEventos(uid));
    } catch (e) {
      setEventos([]);
      setFallo(e instanceof Error ? e.message : "No se ha podido leer tu agenda.");
    }
  }, [uid]);

  /* Leer la agenda es leer un sistema externo, que es para lo que está el
     efecto; la misma excepción que en `app-context`. */
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    void carga();
  }, [carga]);

  const semana = useMemo(() => semanaDe(desde), [desde]);
  const [ahora] = useState(() => Date.now());
  const proximos = (eventos ?? []).filter((e) => new Date(e.inicioISO).getTime() >= ahora - 3600000);

  async function apunta() {
    if (!titulo.trim() || !uid) return;
    setGuardando(true);
    setFallo("");
    try {
      const inicio = new Date(`${dia}T${hor}:00`);
      await guardaEvento({ uid, titulo: titulo.trim(), inicioISO: inicio.toISOString(), minutos, nota: nota.trim() });
      setTitulo("");
      setNota("");
      await carga();
    } catch (e) {
      setFallo(e instanceof Error ? e.message : "No se ha podido guardar.");
    } finally {
      setGuardando(false);
    }
  }

  async function borra(e: Evento) {
    setFallo("");
    try {
      await borraEvento(uid, e.id);
      setAbierto(null);
      await carga();
    } catch (x) {
      setFallo(x instanceof Error ? x.message : "No se ha podido borrar.");
    }
  }

  const mes = semana[0].toLocaleDateString("es", { month: "long", year: "numeric" });

  return (
    <div style={css(PANTALLA + "display:flex;flex-direction:column;gap:var(--gap);")}>
      <Banda
        foto="/escuela/basico.jpg"
        encuadre="50% 60%"
        titulo="Mi agenda"
        sub="Tus directos, tus sesiones y tus entregas. Sólo la ves tú."
        cifras={eventos ? [{ n: proximos.length, que: proximos.length === 1 ? "Por venir" : "Por venir" }] : []}
      />

      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--red);")}>
          {fallo}
        </p>
      )}

      <div data-editor-rejilla="">
        {/* --------------------------------------------------- la semana */}
        <section style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);min-width:0;")}>
          <div style={css("display:flex;align-items:center;gap:8px;flex-wrap:wrap;")}>
            <button onClick={() => setDesde((d) => masDias(d, -7))} aria-label="Semana anterior" style={css(BOTON_PLANO)}>
              ←
            </button>
            <button onClick={() => setDesde(new Date())} style={css(BOTON_PLANO)}>
              Hoy
            </button>
            <button onClick={() => setDesde((d) => masDias(d, 7))} aria-label="Semana siguiente" style={css(BOTON_PLANO)}>
              →
            </button>
            <h2 style={css("margin:0 0 0 8px;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>
              {mes.replace(/^./, (c) => c.toLocaleUpperCase("es"))}
            </h2>
          </div>
          <div data-tablero-dias="" style={css("display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;")}>
            {semana.map((d, i) => {
              const k = claveDia(d);
              const esHoy = k === hoyClave();
              const delDia = (eventos ?? []).filter((e) => claveDia(new Date(e.inicioISO)) === k);
              return (
                <div
                  key={k}
                  style={css(
                    "min-width:0;min-height:180px;display:flex;flex-direction:column;gap:6px;padding:8px 4px;border-radius:var(--r);" +
                      (esHoy ? "background:var(--accion-suave);" : "") +
                      (i > 0 ? "border-left:1px dashed var(--border);" : "")
                  )}
                >
                  <button
                    onClick={() => setDia(k)}
                    title="Apuntar algo este día"
                    style={css("border:none;background:none;cursor:pointer;font:inherit;text-align:center;margin-bottom:4px;")}
                  >
                    <div style={css("font-size:var(--t-micro);color:var(--text-3);")}>{d.toLocaleDateString("es", { weekday: "short" })}</div>
                    <div style={css("font-weight:" + (esHoy ? 500 : 300) + ";font-size:var(--t-title);color:" + (esHoy ? "var(--accion)" : "var(--text)") + ";")}>{d.getDate()}</div>
                  </button>
                  {delDia.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setAbierto(e)}
                      style={css(
                        "text-align:left;cursor:pointer;font:inherit;min-width:0;padding:7px 8px;border-radius:var(--r-sm);font-size:var(--t-micro);line-height:1.3;" +
                          "background:var(--bloque);color:var(--sobre-bloque);border:none;"
                      )}
                    >
                      <div style={css("font-weight:500;font-variant-numeric:tabular-nums;")}>{hora(e.inicioISO)}</div>
                      <div style={css("overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.85;")}>{e.titulo}</div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          {eventos && eventos.length === 0 && (
            <p style={css(NOTA + "margin:0;text-align:center;")}>Todavía no has apuntado nada. Empieza a la derecha.</p>
          )}

          {abierto && (
            <div style={css("border-top:1px solid var(--border);padding-top:var(--s3);display:flex;flex-direction:column;gap:6px;")}>
              <div style={css("font-size:var(--t-body);font-weight:500;")}>{abierto.titulo}</div>
              <div style={css(NOTA)}>
                {new Date(abierto.inicioISO).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })} · {hora(abierto.inicioISO)} ·{" "}
                {abierto.minutos} min
              </div>
              {abierto.nota && <p style={css("margin:0;font-size:var(--t-body);color:var(--text-2);white-space:pre-wrap;")}>{abierto.nota}</p>}
              <div style={css("display:flex;gap:8px;margin-top:6px;")}>
                <button onClick={() => setAbierto(null)} style={css(BOTON_NORMAL)}>
                  Cerrar
                </button>
                <Confirmar estilo={BOTON_PLANO} pregunta="Se borra de tu agenda." confirmar="Borrar" alConfirmar={() => void borra(abierto)}>
                  Borrar
                </Confirmar>
              </div>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------- apuntar */}
        <aside data-editor-lado="" style={css(TARJETA + "padding:var(--pad-card-sm);display:flex;flex-direction:column;gap:var(--s3);min-width:0;")}>
          <h2 style={css("margin:0;font-size:var(--t-title);font-weight:500;letter-spacing:-.02em;")}>Apuntar algo</h2>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Qué es: un directo, una sesión…" aria-label="Qué es" style={css(CAMPO)} />
          <div style={css("display:flex;gap:8px;")}>
            <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} aria-label="Día" style={css(CAMPO + "flex:1 1 0;")} />
            <input type="time" value={hor} onChange={(e) => setHor(e.target.value)} aria-label="Hora" style={css(CAMPO + "flex:0 0 110px;")} />
          </div>
          <select value={minutos} onChange={(e) => setMinutos(Number(e.target.value))} aria-label="Cuánto dura" style={css(CAMPO)}>
            {[30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>
                {({ 30: "30 minutos", 45: "45 minutos", 60: "1 hora", 90: "Hora y media", 120: "2 horas" } as Record<number, string>)[m]}
              </option>
            ))}
          </select>
          <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3} placeholder="Una nota, el enlace del directo… Opcional." aria-label="Nota" style={css(CAMPO + "resize:vertical;line-height:1.5;")} />
          <button onClick={() => void apunta()} disabled={!titulo.trim() || guardando} style={css(botonPrincipal(Boolean(titulo.trim()) && !guardando))}>
            {guardando ? "Guardando…" : "Apuntar"}
          </button>

          {proximos.length > 0 && (
            <div style={css("border-top:1px solid var(--border);padding-top:var(--s3);display:flex;flex-direction:column;gap:8px;")}>
              <div style={css(NOTA)}>Lo próximo</div>
              {proximos.slice(0, 5).map((e) => (
                <button key={e.id} onClick={() => setAbierto(e)} style={css("display:flex;gap:10px;align-items:baseline;border:none;background:none;cursor:pointer;font:inherit;text-align:left;padding:0;")}>
                  <span style={css("font-size:var(--t-mini);color:var(--gold);white-space:nowrap;font-variant-numeric:tabular-nums;")}>
                    {new Date(e.inicioISO).toLocaleDateString("es", { day: "numeric", month: "short" })} · {hora(e.inicioISO)}
                  </span>
                  <span style={css("font-size:var(--t-body);color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{e.titulo}</span>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
      {/* La empresa conectada, en cada pantalla del creador. */}
      <SecretariaIA compacta />
    </div>
  );
}
