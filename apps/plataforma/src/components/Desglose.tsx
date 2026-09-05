import { css } from "@/lib/css";

export type Paso = {
  etiqueta: string;
  /** La operación tal y como se hace a mano, p. ej. "5+9 + 3 + 6+9+9+6". */
  operacion: string;
  resultado?: string | number;
  /** Resalta el paso: es el número al que se llega. */
  final?: boolean;
};

/**
 * Muestra el cálculo paso a paso, para poder comprobar a mano de dónde sale
 * cada número (y para poder explicarlo en consulta).
 */
export default function Desglose({ titulo, pasos, nota }: { titulo: string; pasos: Paso[]; nota?: string }) {
  return (
    <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:var(--pad-card-sm);")}>
      <div style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);margin-bottom:var(--s4);")}>{titulo}</div>
      <div style={css("display:flex;flex-direction:column;gap:1px;")}>
        {pasos.map((p, i) => (
          // Tres columnas fijas en vez de flex con salto: con flex-wrap una
          // operación larga empujaba el resultado a una línea propia y el
          // "= 119" quedaba suelto, sin su cuenta al lado.
          <div
            key={i}
            className="es33-paso"
            style={css(
              "display:grid;grid-template-columns:minmax(96px,auto) 1fr auto;align-items:baseline;column-gap:var(--s3);row-gap:2px;padding:8px 10px;border-radius:var(--r-sm);background:" +
                (p.final ? "var(--gold-soft)" : "transparent") +
                ";"
            )}
          >
            <span style={css("font-size:var(--t-mini);font-weight:590;color:var(--text-3);")}>{p.etiqueta}</span>
            <span style={css("font-family:var(--font-ui);font-size:var(--t-body);color:var(--text-2);letter-spacing:-.012em;min-width:0;overflow-wrap:anywhere;")}>{p.operacion}</span>
            <span
              style={css(
                "justify-self:end;white-space:nowrap;font-family:var(--font-ui);font-weight:600;font-variant-numeric:tabular-nums;line-height:1.1;font-size:" +
                  (p.final ? "22px" : "17px") +
                  ";color:" +
                  (p.final ? "var(--text)" : "var(--text-3)") +
                  ";"
              )}
            >
              {p.resultado !== undefined && p.resultado !== "" ? "= " + p.resultado : ""}
            </span>
          </div>
        ))}
      </div>
      {nota && <div style={css("font-family:var(--font-ui);font-size:var(--t-body);color:var(--text-4);margin-top:var(--s4);line-height:1.5;")}>{nota}</div>}
    </div>
  );
}
