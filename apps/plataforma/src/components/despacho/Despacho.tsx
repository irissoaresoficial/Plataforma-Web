"use client";

/**
 * LA PUERTA AL DESPACHO, DESDE LA CONSULTA
 *
 * La pantalla de entrada no lleva cabecera —es una decisión de la casa: ahí
 * sólo está el formulario— así que sin esta tarjeta no habría forma de llegar a
 * la agenda, a los clientes ni a las facturas sin escribir la dirección a mano.
 *
 * Y no es sólo un menú: cada línea trae el dato que hace que valga la pena
 * mirarla. «Hoy tienes 3 sesiones» es lo primero que Iris necesita saber al
 * abrir la plataforma por la mañana, y aquí lo lee sin ir a ninguna parte. Por
 * eso va la primera de la columna y no debajo del todo.
 */

import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import { useApp, type View } from "@/lib/app-context";
import { NOTA, PAD, TARJETA, rotulo } from "@/lib/ui";
import { IcoAgenda, IcoClientes, IcoFacturas } from "../Iconos";
import { citas as repoCitas, clientes as repoClientes, facturas as repoFacturas, abreDia, cierraDia } from "@/lib/despacho";

type Fila = { k: View; label: string; pie: string; Ico: (p: { size?: number }) => React.JSX.Element };

export default function Despacho() {
  const { setView } = useApp();
  const [filas, setFilas] = useState<Fila[] | null>(null);

  /* Se pide al montar y no antes: el almacenamiento vive en este equipo y el
     servidor no puede verlo, así que sembrarlo en el primer render rompería la
     hidratación. Es el mismo motivo por el que el historial de estudios se
     carga en un efecto. */
  useEffect(() => {
    let vivo = true;
    const ahora = new Date();
    Promise.all([
      repoCitas.entre(abreDia(ahora).toISOString(), cierraDia(ahora).toISOString()),
      repoClientes.listar(),
      repoFacturas.listar(),
    ]).then(([hoy, gente, facturas]) => {
      if (!vivo) return;
      const vivas = hoy.filter((c) => c.estado !== "anulada");
      const borradores = facturas.filter((f) => f.estado === "borrador").length;
      const emitidas = facturas.filter((f) => f.estado === "emitida").length;
      setFilas([
        {
          k: "agenda",
          label: "Agenda",
          Ico: IcoAgenda,
          pie:
            vivas.length === 0
              ? "Hoy no tienes ninguna sesión"
              : vivas.length === 1
                ? "Hoy tienes 1 sesión"
                : `Hoy tienes ${vivas.length} sesiones`,
        },
        {
          k: "clientes",
          label: "Clientes",
          Ico: IcoClientes,
          pie:
            gente.length === 0
              ? "Todavía no hay nadie fichado"
              : gente.length === 1
                ? "1 persona fichada"
                : `${gente.length} personas fichadas`,
        },
        {
          k: "facturas",
          label: "Facturas",
          Ico: IcoFacturas,
          pie: borradores
            ? borradores === 1
              ? "1 borrador sin emitir"
              : `${borradores} borradores sin emitir`
            : emitidas
              ? emitidas === 1
                ? "1 factura emitida"
                : `${emitidas} facturas emitidas`
              : "Todavía no has hecho ninguna",
        },
      ]);
    });
    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div style={css(TARJETA + PAD)}>
      <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>El despacho</div>
      {!filas ? (
        <p style={css(NOTA + "margin:0;")}>Un momento…</p>
      ) : (
        filas.map((f, i) => (
          <button
            key={f.k}
            onClick={() => setView(f.k)}
            style={css(
              "display:flex;align-items:center;gap:var(--s3);width:100%;text-align:left;padding:var(--s3) 0;border:none;background:none;cursor:pointer;color:var(--text);border-top:1px solid " +
                (i ? "var(--border)" : "transparent") +
                ";"
            )}
          >
            <span style={css("flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:var(--r);background:var(--gold-soft);color:var(--gold);")}>
              <f.Ico size={17} />
            </span>
            <span style={css("flex:1;min-width:0;")}>
              <span style={css("display:block;font-size:var(--t-read);line-height:1.25;")}>{f.label}</span>
              <span style={css(NOTA + "display:block;margin-top:2px;")}>{f.pie}</span>
            </span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none", color: "var(--text-4)" }}>
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ))
      )}
    </div>
  );
}
