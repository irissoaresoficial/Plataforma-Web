"use client";
/**
 * ============================================================================
 * LAS NUEVE CASILLAS
 * ============================================================================
 *
 * La carta de estrellas, dibujada como se dibuja en Feng Shui: en cada casilla,
 * la estrella de la MONTAÑA arriba a la izquierda, la del AGUA arriba a la
 * derecha y la del PERIODO abajo, en pequeño. Es la notación de todos los
 * libros, y quien sabe leer una carta la reconoce sin leyenda.
 *
 * La misma cuadrícula sirve en tres sitios —encima del plano, en la pantalla
 * de estrellas y en el informe—, y en los tres va orientada IGUAL QUE EL
 * PLANO: con la fachada en el lado en que la tiene el plano. Una carta con el
 * Sur arriba al estilo chino y un plano con la puerta abajo obligan a girar la
 * cabeza para cruzarlos, y ahí es donde se equivoca uno.
 */
import { css } from "@/lib/css";
import { CELDAS, NOMBRE_DIR, casillaEnPlano, type Carta, type CartaNatal, type Casilla, type Dir, type Lado, type Mansion } from "@/lib/fengshui/calculo";
import { ESTRELLA, MANSION } from "@/lib/fengshui/textos";
import { MANSION_BUENA } from "@/lib/fengshui/calculo";

export type Marcas = { taiSui: Dir; suiPo: Dir; sanSha: Dir; anio: number };

type Props = {
  carta: CartaNatal | null;
  fachada: number;
  lado: Lado;
  anual?: Carta | null;
  marcas?: Marcas | null;
  mansiones?: Record<Dir, Mansion> | null;
  seleccion?: Casilla | null;
  alElegir?: (c: Casilla) => void;
  /** Lo que hay en cada zona según el plano: dormitorio, cocina… */
  estancias?: Partial<Record<string, string[]>>;
  /** «plano»: transparente, encima de la imagen. «carta»: tarjetas. «papel»: para imprimir. */
  modo?: "plano" | "carta" | "papel";
};

const colorEstrella = (n: number) => (n === 5 ? "var(--fs-cinco)" : ESTRELLA[n]?.favorable ? "var(--green)" : "var(--red)");

export default function Cuadricula({ carta, fachada, lado, anual, marcas, mansiones, seleccion, alElegir, estancias, modo = "carta" }: Props) {
  const plano = modo === "plano";
  const papel = modo === "papel";
  return (
    <div
      role="grid"
      aria-label="Carta de estrellas de la vivienda"
      style={css(
        "--fs-cinco:#b8860b;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);width:100%;height:100%;" +
          (plano ? "gap:0;" : papel ? "gap:0;border:1.5px solid #282430;" : "gap:8px;")
      )}
    >
      {CELDAS.map(({ fila, col, angulo }) => {
        const k = casillaEnPlano(angulo, fachada, lado);
        const elegida = seleccion === k;
        const esFachada = angulo !== null && angulo === { arriba: 0, derecha: 90, abajo: 180, izquierda: 270 }[lado];
        const m = carta?.montana[k];
        const w = carta?.agua[k];
        const b = carta?.base[k];
        const a = anual?.[k];
        const mansion = k !== "C" && mansiones ? mansiones[k] : null;
        const avisos: string[] = [];
        if (marcas && k !== "C") {
          if (marcas.taiSui === k) avisos.push("Tai Sui");
          if (marcas.suiPo === k) avisos.push("Sui Po");
          if (marcas.sanSha === k) avisos.push("3 Asesinos");
        }
        const fondo = plano
          ? elegida
            ? "color-mix(in srgb, var(--accion) 22%, transparent)"
            : "color-mix(in srgb, var(--surface) 38%, transparent)"
          : papel
            ? k === "C"
              ? "#f3ede0"
              : "#fbf8f1"
            : elegida
              ? "var(--accion-suave)"
              : "var(--surface)";
        return (
          <button
            key={`${fila}-${col}`}
            type="button"
            role="gridcell"
            onClick={alElegir ? () => alElegir(k) : undefined}
            aria-pressed={alElegir ? elegida : undefined}
            aria-label={`${NOMBRE_DIR[k]}${m ? `: montaña ${m}, agua ${w}, periodo ${b}` : ""}${a ? `, año ${a}` : ""}`}
            style={css(
              "position:relative;min-width:0;min-height:0;display:flex;flex-direction:column;justify-content:space-between;text-align:left;font-family:var(--font-ui);" +
                `background:${fondo};` +
                (plano
                  ? "border:1px dashed color-mix(in srgb, var(--accion) 55%, transparent);padding:6px 8px;backdrop-filter:blur(1.5px);-webkit-backdrop-filter:blur(1.5px);"
                  : papel
                    ? "border:0.75px solid #c9bfa9;padding:6px 8px;"
                    : `border:1px solid ${elegida ? "var(--accion-borde)" : "var(--border)"};border-radius:var(--r);padding:10px 12px;box-shadow:${elegida ? "var(--nm-pulsado)" : "var(--shadow-sm)"};`) +
                (alElegir ? "cursor:pointer;" : "cursor:default;") +
                "transition:background var(--t-normal),box-shadow var(--t-normal);"
            )}
          >
            <span style={css("display:flex;justify-content:space-between;align-items:flex-start;gap:4px;")}>
              <span title="Estrella de la montaña" style={css(`font-size:${papel ? "15px" : "clamp(15px,1.9vw,22px)"};font-weight:650;line-height:1;color:${m ? colorEstrella(m) : "var(--text-4)"};font-variant-numeric:tabular-nums;`)}>
                {m ?? "·"}
              </span>
              <span title="Estrella del agua" style={css(`font-size:${papel ? "15px" : "clamp(15px,1.9vw,22px)"};font-weight:650;line-height:1;color:${w ? colorEstrella(w) : "var(--text-4)"};font-variant-numeric:tabular-nums;`)}>
                {w ?? "·"}
              </span>
            </span>
            <span style={css("display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0;")}>
              <span style={css(`font-size:${papel ? "9px" : "var(--t-micro)"};font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:${papel ? "#7d5f1e" : "var(--gold)"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;`)}>
                {k === "C" ? "Centro" : NOMBRE_DIR[k]}
                {esFachada ? " · fachada" : ""}
              </span>
              <span title="Estrella del periodo" style={css(`font-size:${papel ? "11px" : "var(--t-mini)"};color:${papel ? "#6f6560" : "var(--text-4)"};font-variant-numeric:tabular-nums;`)}>
                {b ?? ""}
              </span>
              {(estancias?.[k]?.length ?? 0) > 0 && (
                <span style={css("display:flex;flex-wrap:wrap;justify-content:center;gap:3px;max-width:100%;")}>
                  {estancias![k]!.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      style={css(
                        `font-size:${papel ? "8px" : "10px"};font-weight:600;padding:1px 6px;border-radius:var(--r-pill);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;` +
                          (papel ? "background:#efe6d3;color:#451a25;" : "background:var(--surface);color:var(--text-2);border:1px solid var(--border);")
                      )}
                    >
                      {t}
                    </span>
                  ))}
                  {estancias![k]!.length > 2 && <span style={css("font-size:10px;color:var(--text-4);")}>+{estancias![k]!.length - 2}</span>}
                </span>
              )}
            </span>
            <span style={css("display:flex;justify-content:space-between;align-items:flex-end;gap:4px;min-height:16px;")}>
              <span style={css("display:flex;flex-direction:column;gap:2px;min-width:0;")}>
                {mansion && (
                  <span
                    style={css(
                      `font-size:${papel ? "8px" : "10px"};font-weight:600;padding:1px 6px;border-radius:var(--r-pill);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;` +
                        (MANSION_BUENA[mansion] ? "background:color-mix(in srgb, var(--green) 16%, transparent);color:var(--green);" : "background:color-mix(in srgb, var(--red) 12%, transparent);color:var(--red);")
                    )}
                  >
                    {MANSION[mansion].nombre}
                  </span>
                )}
                {avisos.map((t) => (
                  <span key={t} style={css(`font-size:${papel ? "8px" : "10px"};font-weight:650;color:var(--red);white-space:nowrap;`)}>
                    {t}
                  </span>
                ))}
              </span>
              {a ? (
                <span
                  title={`Estrella del año ${marcas?.anio ?? ""}`}
                  style={css(
                    `flex:none;display:grid;place-items:center;width:${papel ? "17px" : "22px"};height:${papel ? "17px" : "22px"};border-radius:50%;font-size:${papel ? "9px" : "11px"};font-weight:700;font-variant-numeric:tabular-nums;` +
                      `background:${a === 5 ? "var(--fs-cinco)" : "var(--accion)"};color:${a === 5 ? "#fff" : "var(--sobre-accion)"};`
                  )}
                >
                  {a}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
