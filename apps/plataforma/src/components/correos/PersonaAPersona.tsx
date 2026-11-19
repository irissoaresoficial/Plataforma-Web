"use client";

/**
 * LA LISTA DE MARCO, PERSONA POR PERSONA (19 de noviembre de 2026).
 *
 * Ger: «quiero que me muestres los correos de Marco, tipo checklist, si se
 * envía». Una fila por correo de la lista y una casilla por cada envío
 * (invitación, recordatorio, es hoy). La casilla marcada lleva el día y la
 * hora en que salió, que es lo que la web apunta en `enviados.<id>` al
 * mandarlo: no es una previsión, es lo que pasó. Las bajas salen tachadas.
 *
 * Sólo lo ve la administración: la pantalla de Correos ya está cerrada a la
 * llave `gestion` y las reglas de Firestore cierran `difusion`.
 */

import { useMemo, useState } from "react";
import type { Contacto, Envio } from "./VistaCorreos";

const NOMBRE: Record<string, string> = { invitacion: "Invitación", recordatorio: "Recordatorio", "es-hoy": "Es hoy" };

function cuando(v: unknown): string | null {
  if (!v) return null;
  const t =
    typeof v === "object" && v !== null && "toDate" in v && typeof (v as { toDate: unknown }).toDate === "function"
      ? (v as { toDate: () => Date }).toDate()
      : typeof v === "object" && v !== null && "seconds" in v
        ? new Date(Number((v as { seconds: number }).seconds) * 1000)
        : new Date(String(v));
  if (Number.isNaN(t.getTime())) return "Enviado";
  return t.toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
}

export default function PersonaAPersona({ envios, contactos }: { envios: Envio[]; contactos: Contacto[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "pendientes" | "enviados">("todos");
  /* Todos los envíos de la lista, también los que van además a las inscritas. */
  const deLaLista = envios;

  const filas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return contactos
      .filter((c) => !q || c.email.includes(q))
      .filter((c) => {
        const alguno = deLaLista.some((e) => c.enviados?.[e.id]);
        return filtro === "todos" ? true : filtro === "enviados" ? alguno : !alguno && !c.baja;
      })
      .sort((a, b) => a.email.localeCompare(b.email));
  }, [contactos, busca, filtro, deLaLista]);

  const total = contactos.length;
  const cuenta = (id: string) => contactos.filter((c) => c.enviados?.[id]).length;

  return (
    <section className="pp" aria-label="La lista de Marco, persona por persona">
      <div className="pp-cabeza">
        <h2>La lista de Marco, persona por persona</h2>
        <p>
          Una casilla por correo. <b>Marcada = ya le llegó</b>, con el día y la hora. Vacía = todavía no le toca o sale en
          la próxima tanda de las 8:00.
        </p>
        <div className="pp-resumen">
          {deLaLista.map((e) => (
            <span key={e.id} className="pp-chip">
              {NOMBRE[e.id] ?? e.id}
              <b>
                {cuenta(e.id)} / {total}
              </b>
            </span>
          ))}
          <span className="pp-chip">
            Bajas<b>{contactos.filter((c) => c.baja).length}</b>
          </span>
        </div>
        <div className="pp-filtros">
          <input type="search" placeholder="Buscar un correo" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar un correo" />
          {(["todos", "enviados", "pendientes"] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>
              {f === "todos" ? "Todos" : f === "enviados" ? "Ya recibieron algo" : "Aún nada"}
            </button>
          ))}
        </div>
      </div>

      <div className="pp-tabla" role="table" aria-label="Correos enviados a cada persona" style={{ ["--cols" as string]: deLaLista.length }}>
        <div className="pp-fila pp-titulos" role="row">
          <span role="columnheader">Correo</span>
          {deLaLista.map((e) => (
            <span key={e.id} role="columnheader">
              {NOMBRE[e.id] ?? e.id}
            </span>
          ))}
        </div>
        {filas.map((c) => (
          <div key={c.email} className="pp-fila" role="row" data-baja={c.baja || undefined}>
            <span role="cell" className="pp-correo">
              {c.email}
              {c.baja && <small> · se dio de baja</small>}
            </span>
            {deLaLista.map((e) => {
              const h = cuando(c.enviados?.[e.id]);
              return (
                <span key={e.id} role="cell" className="pp-casilla" data-hecho={h ? "" : undefined}>
                  <i aria-hidden="true">{h ? "✓" : ""}</i>
                  <small>{h ?? "—"}</small>
                </span>
              );
            })}
          </div>
        ))}
        {filas.length === 0 && <p className="pp-vacio">No hay ningún correo con ese filtro.</p>}
      </div>
      <style>{ESTILO}</style>
    </section>
  );
}

const ESTILO = `
.pp { display:grid; gap:16px; padding:var(--pad-card); border-radius:var(--r-panel); background:var(--surface); border:1px solid var(--border); box-shadow:var(--nm-alto); }
.pp-cabeza { display:grid; gap:10px; }
.pp-cabeza h2 { margin:0; font-size:var(--t-title); font-weight:500; letter-spacing:-.02em; color:var(--text); }
.pp-cabeza p { margin:0; font-size:var(--t-body); line-height:1.55; color:var(--text-2); max-width:78ch; }
.pp-cabeza b { font-weight:500; color:var(--text); }
.pp-resumen, .pp-filtros { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.pp-chip { display:inline-flex; align-items:center; gap:8px; padding:6px 12px; border-radius:var(--r-pill); font-size:var(--t-mini); color:var(--text-2); background:var(--surface-2); border:1px solid var(--border); }
.pp-chip b { font-weight:500; color:var(--text); font-variant-numeric:tabular-nums; }
.pp-filtros input { flex:1 1 220px; min-width:0; padding:10px 14px; border-radius:var(--r-pill); border:1px solid var(--border); background:var(--surface-solid); color:var(--text); font:inherit; font-size:var(--t-body); }
.pp-filtros button { padding:9px 14px; border-radius:var(--r-pill); border:1px solid var(--border); background:var(--surface-2); color:var(--text-2); font:inherit; font-size:var(--t-mini); cursor:pointer; }
.pp-filtros button[aria-pressed="true"] { background:var(--accion); border-color:var(--accion); color:var(--sobre-accion); }
.pp-tabla { display:grid; max-height:560px; overflow:auto; border-radius:var(--r-sm); border:1px solid var(--border); }
.pp-fila { display:grid; grid-template-columns:minmax(200px,1.6fr) repeat(var(--cols,3), minmax(96px,1fr)); gap:10px; align-items:center; padding:10px 14px; border-top:1px solid var(--border); }
.pp-titulos { position:sticky; top:0; z-index:1; background:var(--surface-solid); border-top:0; font-size:var(--t-mini); font-weight:500; color:var(--text-3); }
.pp-correo { font-size:var(--t-body); color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pp-correo small { color:var(--text-3); font-size:var(--t-mini); }
.pp-fila[data-baja] .pp-correo { text-decoration:line-through; color:var(--text-3); }
.pp-casilla { display:flex; align-items:center; gap:8px; }
.pp-casilla i { flex:none; width:20px; height:20px; border-radius:6px; border:1.5px solid var(--border-strong); display:grid; place-items:center; font-style:normal; font-size:var(--t-mini); line-height:1; }
.pp-casilla[data-hecho] i { background:var(--accion); border-color:var(--accion); color:var(--sobre-accion); }
.pp-casilla small { font-size:var(--t-mini); color:var(--text-3); font-variant-numeric:tabular-nums; white-space:nowrap; }
.pp-casilla[data-hecho] small { color:var(--text-2); }
.pp-vacio { margin:0; padding:16px; font-size:var(--t-body); color:var(--text-3); }
@media (max-width: 640px) {
  .pp-fila { grid-template-columns:minmax(140px,1fr) repeat(var(--cols,3), 34px); }
  .pp-casilla small { display:none; }
}
`;
