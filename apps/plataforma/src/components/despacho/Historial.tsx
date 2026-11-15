"use client";

/**
 * EL HISTORIAL DE FACTURAS, EN UNA VENTANITA
 *
 * Ger: «no me los metas ahí llenando alguna cosa; un pequeño apartado que
 * diga ver historial y que se abra una pequeña lista, tipo pop-up. Que no
 * sature». Antes era una tira de pastillas siempre a la vista encima del
 * editor. Ahora la pantalla es el editor y nada más; las facturas hechas se
 * miran cuando se piden.
 *
 * Va por un portal colgado del `body`: dentro de la ventana de cristal un
 * `position:fixed` se queda encerrado. Se cierra con Escape, con la × o
 * pulsando fuera.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { css } from "@/lib/css";
import { BOTON_PLANO, NOTA, rotulo } from "@/lib/ui";
import { euros, guardadoEnLaNube, numeroDe, sinTildes, totales, type Factura } from "@/lib/despacho";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const corta = (f: string) => `${Number(f.slice(8, 10))} ${MESES[Number(f.slice(5, 7)) - 1]} ${f.slice(0, 4)}`;

const COLOR: Record<Factura["estado"], string> = {
  borrador: "var(--gold)",
  emitida: "var(--green)",
  anulada: "var(--red)",
};
const ESTADO: Record<Factura["estado"], string> = { borrador: "Borrador", emitida: "Emitida", anulada: "Anulada" };

export default function Historial({
  lista,
  actual,
  onAbrir,
  alCerrar,
}: {
  lista: Factura[];
  actual: string | null;
  onAbrir: (f: Factura) => void;
  alCerrar: () => void;
}) {
  const [busca, setBusca] = useState("");

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && alCerrar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [alCerrar]);

  /* Las más recientes arriba: es lo que se busca casi siempre. */
  const ordenadas = [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.numero - a.numero);
  const q = sinTildes(busca);
  const vistas = q ? ordenadas.filter((f) => sinTildes(`${numeroDe(f)} ${f.cliente.nombre}`).includes(q)) : ordenadas;

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      data-chrome="1"
      onClick={(e) => e.target === e.currentTarget && alCerrar()}
      style={css(
        "position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:var(--s4);" +
          "background:color-mix(in srgb, var(--bg) 55%, transparent);font-family:var(--font-ui);color:var(--text);"
      )}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Historial de facturas"
        style={css(
          "width:min(460px,100%);max-height:min(70vh,620px);display:flex;flex-direction:column;" +
            "background:var(--surface-solid);border:1px solid var(--border);border-radius:var(--r-tarjeta);box-shadow:var(--shadow-lg);overflow:hidden;"
        )}
      >
        <div style={css("display:flex;align-items:center;gap:var(--s3);padding:var(--s4) var(--s4) var(--s3) var(--s5);")}>
          <span style={css("font-size:var(--t-title);font-weight:500;letter-spacing:-.015em;")}>Historial</span>
          <span style={css(NOTA)}>{lista.length === 1 ? "1 factura" : `${lista.length} facturas`}</span>
          <button type="button" onClick={alCerrar} aria-label="Cerrar" style={css(BOTON_PLANO + "padding:6px 12px;margin-left:auto;")}>
            ×
          </button>
        </div>

        {lista.length > 6 && (
          <div style={css("padding:0 var(--s4) var(--s3) var(--s5);")}>
            <input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nombre o número"
              aria-label="Buscar factura"
              style={css("width:100%;padding:9px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);")}
            />
          </div>
        )}

        <div style={css("flex:1;min-height:0;overflow-y:auto;padding:0 var(--s2) var(--s2);")}>
          {lista.length === 0 && <p style={css(NOTA + "margin:0;padding:var(--s3) var(--s3) var(--s4);")}>Todavía no has hecho ninguna.</p>}
          {lista.length > 0 && vistas.length === 0 && <p style={css(NOTA + "margin:0;padding:var(--s3);")}>Ninguna con «{busca}».</p>}
          {vistas.map((f) => {
            const on = f.id === actual;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  onAbrir(f);
                  alCerrar();
                }}
                style={css(
                  "all:unset;box-sizing:border-box;width:100%;cursor:pointer;display:flex;align-items:center;gap:var(--s3);padding:10px var(--s3);border-radius:var(--r-sm);" +
                    (on ? "background:var(--accion-suave);" : "")
                )}
              >
                <span title={ESTADO[f.estado]} style={css("width:8px;height:8px;border-radius:50%;flex:none;background:" + COLOR[f.estado] + ";")} />
                <span style={css("flex:1;min-width:0;")}>
                  <span style={css("display:block;font-size:var(--t-body);color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                    {f.cliente.nombre || "Sin nombre"}
                  </span>
                  <span data-cifras="" style={css(NOTA + "display:block;")}>
                    {f.estado === "borrador" ? "Borrador" : numeroDe(f)} · {corta(f.fecha)}
                    {f.estado === "anulada" ? " · anulada" : ""}
                  </span>
                </span>
                <span data-cifras="" style={css("font-size:var(--t-body);font-weight:500;color:var(--text);white-space:nowrap;")}>
                  {euros(totales(f).total)}
                </span>
              </button>
            );
          })}
        </div>

        {/* La respuesta a «¿se guardan?», dicha donde se mira: con el dato que
            decide de verdad dónde se guarda, no escrita a mano. */}
        <div style={css("padding:var(--s3) var(--s5);border-top:1px solid var(--border);" + rotulo("var(--text-3)") + "font-weight:400;")}>
          {guardadoEnLaNube ? "Guardadas en la nube. Las emitidas no se pueden borrar: se anulan." : "Ahora mismo se guardan sólo en este navegador."}
        </div>
      </div>
    </div>,
    document.body
  );
}
