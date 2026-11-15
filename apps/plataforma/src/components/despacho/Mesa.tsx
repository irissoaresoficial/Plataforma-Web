"use client";

/**
 * LA MESA: EL FOLIO DE LA FACTURA, COMO EN UN EDITOR DE TEXTO
 *
 * Ger: «que se vea como un tipo Word». La factura se ve entera, como una hoja
 * A4 sobre la mesa, y se actualiza mientras se escribe en el formulario de al
 * lado. Se puede acercar, alejar, ajustar a la ventana y ver en grande.
 *
 * LA ESCALA VA POR FUERA DEL FOLIO. El folio mide siempre 210 × 297 mm; lo que
 * cambia es un `transform: scale` en la caja que lo envuelve. Así el PDF y la
 * impresión salen idénticos digan lo que digan los botones de zoom (la hoja de
 * impresión de globals.css quita la escala con `[data-escala]`).
 *
 * PULSAR UN TEXTO DEL FOLIO lleva a su campo del formulario: el cliente, un
 * concepto, el pie, la fecha. No se escribe sobre el papel —eso es otro
 * programa—, pero se llega al sitio sin buscarlo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { css } from "@/lib/css";
import { BOTON_PLANO, NOTA } from "@/lib/ui";
import type { Factura } from "@/lib/despacho";
import HojaFactura from "./HojaFactura";

/** El ancho de un A4 en píxeles de pantalla (210 mm a 96 ppp), hasta medirlo. */
const A4 = 794;
const PASOS = [0.5, 0.6, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 2];

/** Mide una caja y avisa cada vez que cambia. */
function useMedida<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [m, setM] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setM({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, m] as const;
}

const pct = (n: number) => `${Math.round(n * 100)} %`;
const sube = (n: number) => PASOS.find((p) => p > n + 0.001) ?? PASOS[PASOS.length - 1];
const baja = (n: number) => [...PASOS].reverse().find((p) => p < n - 0.001) ?? PASOS[0];

/** Los cuatro botones del zoom. Los usan la mesa y la vista en grande. */
function Zoom({ escala, ajustada, onCambia, onAjusta }: { escala: number; ajustada: boolean; onCambia: (n: number) => void; onAjusta: () => void }) {
  const chico = BOTON_PLANO + "padding:6px 12px;";
  return (
    <div style={css("display:flex;align-items:center;gap:4px;")}>
      <button type="button" aria-label="Alejar" onClick={() => onCambia(baja(escala))} style={css(chico)}>
        −
      </button>
      <span data-cifras="" aria-live="polite" style={css(NOTA + "min-width:44px;text-align:center;color:var(--text-2);")}>
        {pct(escala)}
      </span>
      <button type="button" aria-label="Acercar" onClick={() => onCambia(sube(escala))} style={css(chico)}>
        +
      </button>
      <button type="button" onClick={onAjusta} aria-pressed={ajustada} style={css(chico + (ajustada ? "color:var(--accion);" : ""))}>
        Ajustar
      </button>
    </div>
  );
}

/**
 * El folio escalado, con su hueco del tamaño justo para que la caja que lo
 * contiene sepa cuánto ocupa (un `transform` no mueve nada a su alrededor).
 */
function Folio({
  f,
  marca,
  escala,
  editable,
  onCampo,
  onMedida,
}: {
  f: Factura;
  marca: string;
  escala: number;
  editable: boolean;
  onCampo?: (campo: string) => void;
  onMedida: (m: { w: number; h: number }) => void;
}) {
  const [hoja, m] = useMedida<HTMLDivElement>();
  useEffect(() => onMedida(m), [m, onMedida]);
  const w = m.w || A4;
  const h = m.h || A4 * 1.414;

  return (
    <div
      data-mesa-editable={editable ? "" : undefined}
      onClick={(e) => {
        if (!editable || !onCampo) return;
        const c = (e.target as HTMLElement).closest<HTMLElement>("[data-campo]");
        if (c?.dataset.campo) onCampo(c.dataset.campo);
      }}
      style={css(`position:relative;flex:none;margin:0 auto;width:${w * escala}px;height:${h * escala}px;`)}
    >
      <div ref={hoja} data-escala="" style={css(`position:absolute;top:0;left:0;transform:scale(${escala});transform-origin:0 0;`)}>
        <HojaFactura f={f} marca={marca} />
      </div>
    </div>
  );
}

/* Lo que se puede pulsar del folio se marca al pasar. Va en una hoja de estilo
   y no en línea porque `:hover` no se puede escribir en línea. Con tokens. */
const ESTILO_EDITABLE = `
[data-mesa-editable] [data-campo] { cursor: text; border-radius: 4px; transition: box-shadow var(--t-rapido); }
[data-mesa-editable] [data-campo]:hover { box-shadow: 0 0 0 2px var(--accion-borde); }
`;

export default function Mesa({
  f,
  marca,
  editable,
  onCampo,
}: {
  f: Factura;
  marca: string;
  editable: boolean;
  onCampo?: (campo: string) => void;
}) {
  const [mesa, mm] = useMedida<HTMLDivElement>();
  const [hoja, setHoja] = useState({ w: A4, h: A4 * 1.414 });
  const [zoom, setZoom] = useState<number | null>(null);
  const [grande, setGrande] = useState(false);

  /* «Ajustar» es el ancho de la mesa (ya sin su relleno), sin pasar del 125 %: un
     folio más grande que eso se lee peor, no mejor. */
  const ajuste = mm.w ? Math.min(1.25, Math.max(0.3, (mm.w - 4) / (hoja.w || A4))) : 0.6;
  const escala = zoom ?? ajuste;
  const onMedida = useCallback((m: { w: number; h: number }) => {
    if (m.w) setHoja(m);
  }, []);

  return (
    <div data-mesa="" style={css("min-width:0;min-height:0;display:flex;flex-direction:column;gap:var(--s2);")}>
      <style>{ESTILO_EDITABLE}</style>
      <div data-chrome="1" style={css("display:flex;align-items:center;gap:var(--s2);flex-wrap:wrap;")}>
        <Zoom escala={escala} ajustada={zoom === null} onCambia={setZoom} onAjusta={() => setZoom(null)} />
        {editable && <span style={css(NOTA + "margin-left:var(--s2);")}>Pulsa un texto del folio para cambiarlo.</span>}
        <button type="button" onClick={() => setGrande(true)} style={css(BOTON_PLANO + "padding:6px 14px;margin-left:auto;")}>
          Ver en grande
        </button>
      </div>
      <div
        ref={mesa}
        data-mesa-fondo=""
        style={css(
          "flex:1;min-height:0;overflow:auto;padding:24px;border-radius:var(--r-tarjeta);" +
            "background:color-mix(in srgb, var(--text) 7%, transparent);border:1px solid var(--border);"
        )}
      >
        <Folio f={f} marca={marca} escala={escala} editable={editable} onCampo={onCampo} onMedida={onMedida} />
      </div>
      {grande && <VerGrande f={f} marca={marca} alCerrar={() => setGrande(false)} />}
    </div>
  );
}

/**
 * EL FOLIO A PANTALLA COMPLETA. Se cierra con Escape, con la × o pulsando
 * fuera del papel. En el móvil es la única forma de ver la factura entera, y
 * ahí el pellizco del navegador amplía como en cualquier foto.
 */
export function VerGrande({ f, marca, alCerrar }: { f: Factura; marca: string; alCerrar: () => void }) {
  const [caja, cm] = useMedida<HTMLDivElement>();
  const [hoja, setHoja] = useState({ w: A4, h: A4 * 1.414 });
  const [zoom, setZoom] = useState<number | null>(null);
  const ajuste = cm.w ? Math.min(1.5, Math.max(0.3, (cm.w - 4) / (hoja.w || A4))) : 0.5;
  const escala = zoom ?? ajuste;
  const onMedida = useCallback((m: { w: number; h: number }) => {
    if (m.w) setHoja(m);
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && alCerrar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [alCerrar]);

  /* Por un portal, colgado del `body`: la ventana de cristal lleva un filtro,
     y cualquier `position:fixed` dentro de ella se queda encerrado en la
     ventana en vez de cubrir la pantalla. */
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      data-chrome="1"
      role="dialog"
      aria-modal="true"
      aria-label="La factura en grande"
      style={css(
        "position:fixed;inset:0;z-index:1000;display:flex;flex-direction:column;gap:var(--s2);padding:var(--s3);" +
          "background:var(--bg);color:var(--text);font-family:var(--font-ui);"
      )}
    >
      <div style={css("display:flex;align-items:center;gap:var(--s2);flex-wrap:wrap;")}>
        <Zoom escala={escala} ajustada={zoom === null} onCambia={setZoom} onAjusta={() => setZoom(null)} />
        <button type="button" onClick={alCerrar} aria-label="Cerrar" style={css(BOTON_PLANO + "padding:6px 14px;margin-left:auto;")}>
          Cerrar ×
        </button>
      </div>
      <div
        ref={caja}
        onClick={(e) => e.target === e.currentTarget && alCerrar()}
        style={css("flex:1;min-height:0;overflow:auto;padding:16px;touch-action:pan-x pan-y pinch-zoom;")}
      >
        <Folio f={f} marca={marca} escala={escala} editable={false} onMedida={onMedida} />
      </div>
    </div>,
    document.body
  );
}
