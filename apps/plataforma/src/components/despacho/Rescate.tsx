"use client";

/**
 * EL AVISO DEL RESCATE. Sólo aparece si ha pasado algo: si ha subido algo que
 * estaba sólo en este navegador, si hay facturas que no se suben solas, o si
 * ha fallado. Un día normal no pinta nada. Ver `lib/despacho/rescate.ts`.
 */
import { useEffect, useState } from "react";
import { css } from "@/lib/css";
import { APOYO, BOTON_PLANO } from "@/lib/ui";
import { rescataDelNavegador, type Rescate as R } from "@/lib/despacho/rescate";

export default function Rescate({ facturas = false, alSubir }: { facturas?: boolean; alSubir?: () => void }) {
  const [r, setR] = useState<R | null>(null);

  useEffect(() => {
    let vivo = true;
    void rescataDelNavegador().then((x) => {
      if (!vivo || !x) return;
      setR(x);
      if (x.fichasSubidas || x.citasSubidas) alSubir?.();
    });
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!r) return null;
  const subido = r.fichasSubidas + r.citasSubidas > 0;
  const hayFacturas = facturas && r.facturasSoloAqui.length > 0;
  if (!subido && !hayFacturas && !r.fallo) return null;

  const descarga = () => {
    const blob = new Blob([JSON.stringify(r.facturasSoloAqui, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "facturas-de-este-navegador.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const n = (k: number, uno: string, varios: string) => `${k} ${k === 1 ? uno : varios}`;
  return (
    <div data-chrome="1" role="status" style={css("display:flex;flex-direction:column;gap:var(--s2);margin-bottom:var(--s4);")}>
      {subido && (
        <p style={css(APOYO + "margin:0;")}>
          Han subido a tu cuenta{" "}
          {[r.fichasSubidas && n(r.fichasSubidas, "ficha", "fichas"), r.citasSubidas && n(r.citasSubidas, "cita", "citas")].filter(Boolean).join(" y ")} que
          sólo estaban en este navegador, de antes de conectar la cuenta. Ya no se guardan en este ordenador.
        </p>
      )}
      {hayFacturas && (
        <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
          <p style={css(APOYO + "margin:0;flex:1 1 280px;")}>
            Hay {n(r.facturasSoloAqui.length, "factura", "facturas")} sólo en este navegador, de antes de conectar la cuenta. No se suben
            solas porque su número podría repetirse con otra. Descárgalas para revisarlas.
          </p>
          <button type="button" onClick={descarga} style={css(BOTON_PLANO)}>
            Descargar
          </button>
        </div>
      )}
      {r.fallo && <p style={css(APOYO + "margin:0;color:var(--red);")}>No se ha podido recuperar todo lo de este navegador: {r.fallo}. Se vuelve a intentar al volver a entrar.</p>}
    </div>
  );
}
