"use client";

/**
 * LAS PLANTILLAS, A LA VISTA
 *
 * Eran tres botones pequeños —«Una sesión / Un curso / Otra cosa»— que sólo
 * cambiaban el texto del concepto: el precio había que escribirlo a mano, y
 * sin IVA, que es justo la cuenta donde se equivoca cualquiera. Ahora son
 * tarjetas con su precio, y al elegir una se rellena todo.
 *
 * Van ARRIBA del formulario porque es la primera decisión: qué se factura. A
 * quién va después, y la mayoría de las veces se elige de la lista.
 */

import { useCallback, useEffect, useState } from "react";
import { css } from "@/lib/css";
import { BOTON_PLANO, NOTA, PASTILLA, PASTILLA_ELEGIDA, rotulo } from "@/lib/ui";
import { euros, PENDIENTE, type LineaFactura } from "@/lib/despacho";
import { PLANTILLAS_CASA, creaPropia, guardaPropia, listaPropias, quitaPropia, type Plantilla } from "@/lib/despacho/plantillas";

export function usePlantillas() {
  const [propias, setPropias] = useState<Plantilla[]>([]);
  const recargar = useCallback(async () => {
    try {
      setPropias(await listaPropias());
    } catch {
      /* Sin poder leerlas se quedan las de la casa, que no dependen de nada. */
    }
  }, []);
  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => void recargar(), [recargar]);
  return { propias, setPropias };
}

/** Lo que cuesta una tarjeta, escrito como se lee. */
function precioDe(p: Plantilla): { texto: string; pendiente: boolean } {
  if (p.precioFinal != null) return { texto: euros(p.precioFinal), pendiente: false };
  if (p.lineas) {
    const base = p.lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
    const total = base * (1 + (p.iva ?? 0) / 100);
    return { texto: euros(Math.round(total * 100) / 100), pendiente: false };
  }
  return p.precioFinal == null ? { texto: `Precio ${PENDIENTE}`, pendiente: true } : { texto: euros(p.precioFinal), pendiente: false };
}

export default function Plantillas({
  propias,
  setPropias,
  elegida,
  onElige,
}: {
  propias: Plantilla[];
  setPropias: (l: Plantilla[]) => void;
  elegida: string | null;
  onElige: (p: Plantilla) => void;
}) {
  const [fallo, setFallo] = useState("");
  /* «Nueva plantilla»: un nombre y lo que paga la clienta. Nada más. */
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [guardando, setGuardando] = useState(false);

  const crear = async () => {
    const n = Number(precio.replace(",", "."));
    if (!nombre.trim()) return setFallo("Ponle un nombre: es lo que saldrá escrito en la factura.");
    if (!(n > 0)) return setFallo("Pon lo que paga la clienta, con el IVA dentro.");
    setGuardando(true);
    setFallo("");
    try {
      const lista = await creaPropia(nombre, n);
      setPropias(lista);
      setCreando(false);
      setNombre("");
      setPrecio("");
      onElige(lista[lista.length - 1]);
    } catch (e) {
      setFallo((e instanceof Error ? e.message : "No se ha podido guardar.") + " La plantilla no se ha guardado.");
    } finally {
      setGuardando(false);
    }
  };

  const quitar = async (id: string) => {
    setFallo("");
    try {
      setPropias(await quitaPropia(id));
    } catch (e) {
      setFallo((e instanceof Error ? e.message : "No se ha podido quitar.") + " Sigue guardada.");
    }
  };

  const tarjeta = (p: Plantilla) => {
    const { texto, pendiente } = precioDe(p);
    const on = elegida === p.id;
    return (
      <div key={p.id} style={css("position:relative;min-width:0;display:flex;")}>
        <button
          type="button"
          onClick={() => onElige(p)}
          aria-pressed={on}
          style={css(
            (on ? PASTILLA_ELEGIDA : PASTILLA) +
              /* La elegida lleva además el canto en vino lleno: con sólo el
                 fondo suave, sobre el cristal no se distinguía de las demás. */
              (on ? "box-shadow:inset 0 0 0 1.5px var(--accion);" : "") +
              "flex:1;min-width:0;display:flex;flex-direction:column;gap:4px;text-align:left;cursor:pointer;font:inherit;padding:var(--s3) var(--s4);color:var(--text);"
          )}
        >
          <span style={css("font-size:var(--t-body);font-weight:500;line-height:1.3;overflow-wrap:anywhere;" + (p.propia ? "padding-right:22px;" : ""))}>
            {p.nombre}
          </span>
          {/* PENDIENTE en rojo, como manda la casa, pero al tamaño del texto:
              tres en rojo grande se leían como tres errores. */}
          <span
            data-cifras=""
            style={css(
              (pendiente ? "font-size:var(--t-mini);font-weight:500;color:var(--red);" : "font-size:var(--t-title);font-weight:400;letter-spacing:-.01em;color:var(--text);")
            )}
          >
            {pendiente ? PENDIENTE : texto}
          </span>
          <span style={css(NOTA + "line-height:1.35;")}>{p.propia ? "Tuya" : `Lo que paga · ${p.origen}`}</span>
        </button>
        {p.propia && (
          <button
            type="button"
            onClick={() => void quitar(p.id)}
            aria-label={`Quitar la plantilla ${p.nombre}`}
            title="Quitar esta plantilla"
            style={css(
              "position:absolute;top:8px;right:8px;width:24px;height:24px;border-radius:50%;border:none;background:none;cursor:pointer;color:var(--text-3);font-size:var(--t-body);line-height:1;"
            )}
          >
            ×
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
      <span style={css(rotulo())}>¿Qué le facturas?</span>
      <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,128px),1fr));gap:var(--s2);")}>
        {PLANTILLAS_CASA.map(tarjeta)}
        {propias.map(tarjeta)}
        {!creando && (
          <button
            type="button"
            onClick={() => {
              setFallo("");
              setCreando(true);
            }}
            style={css(
              "display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:4px;text-align:left;cursor:pointer;font:inherit;" +
                "padding:var(--s3) var(--s4);border-radius:var(--r);border:1px dashed var(--border-strong);background:transparent;color:var(--text-2);min-height:96px;"
            )}
          >
            <span style={css("font-size:var(--t-title);font-weight:300;line-height:1;color:var(--accion);")}>+</span>
            <span style={css("font-size:var(--t-body);font-weight:500;")}>Nueva plantilla</span>
            <span style={css(NOTA)}>Un curso, una consulta…</span>
          </button>
        )}
      </div>

      {creando && (
        <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;align-items:center;")}>
          <input
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Qué es: Consulta de Kábala"
            aria-label="Nombre de la plantilla"
            style={css("flex:2 1 200px;min-width:0;padding:10px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);")}
          />
          <input
            value={precio}
            inputMode="decimal"
            onChange={(e) => setPrecio(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void crear()}
            placeholder="Precio con IVA"
            aria-label="Lo que paga la clienta, con IVA"
            data-cifras=""
            style={css("flex:1 1 120px;min-width:0;padding:10px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);text-align:right;")}
          />
          <button type="button" onClick={() => void crear()} disabled={guardando} style={css(BOTON_PLANO)}>
            {guardando ? "Guardando…" : "Crear"}
          </button>
          <button type="button" onClick={() => setCreando(false)} style={css(BOTON_PLANO)}>
            Dejarlo
          </button>
        </div>
      )}

      <p style={css(NOTA + "margin:0;line-height:1.5;")}>Los precios son lo que paga la clienta, con el 21 % de IVA ya dentro.</p>
      {fallo && (
        <p role="alert" style={css(NOTA + "margin:0;color:var(--red);")}>
          {fallo}
        </p>
      )}
    </div>
  );
}

/** «Guardar como plantilla», al pie de la factura: pide un nombre y nada más. */
export function GuardarPlantilla({
  lineas,
  iva,
  onGuardada,
}: {
  lineas: LineaFactura[];
  iva: number;
  onGuardada: (l: Plantilla[], nombre: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [fallo, setFallo] = useState("");
  const vale = lineas.some((l) => l.concepto.trim());

  if (!abierto) {
    return (
      <button type="button" onClick={() => { setNombre(lineas[0]?.concepto ?? ""); setAbierto(true); }} disabled={!vale} style={css(BOTON_PLANO)}>
        Guardar como plantilla
      </button>
    );
  }

  const guardar = async () => {
    if (!nombre.trim()) {
      setFallo("Ponle un nombre.");
      return;
    }
    setGuardando(true);
    setFallo("");
    try {
      onGuardada(await guardaPropia(nombre, lineas, iva), nombre.trim());
      setAbierto(false);
    } catch (e) {
      setFallo((e instanceof Error ? e.message : "No se ha podido guardar.") + " La plantilla no se ha guardado.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={css("flex:1 1 100%;display:flex;gap:var(--s2);flex-wrap:wrap;align-items:center;")}>
      <input
        autoFocus
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && void guardar()}
        placeholder="Nombre de la plantilla"
        aria-label="Nombre de la plantilla"
        style={css("flex:1 1 200px;min-width:0;padding:10px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);")}
      />
      <button type="button" onClick={() => void guardar()} disabled={guardando} style={css(BOTON_PLANO)}>
        {guardando ? "Guardando…" : "Guardar"}
      </button>
      <button type="button" onClick={() => setAbierto(false)} style={css(BOTON_PLANO)}>
        Dejarlo
      </button>
      {fallo && <span style={css(NOTA + "flex:1 1 100%;color:var(--red);")}>{fallo}</span>}
    </div>
  );
}
