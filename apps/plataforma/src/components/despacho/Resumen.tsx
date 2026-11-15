"use client";

/**
 * EL RESUMEN: LO PRIMERO QUE SE VE AL ENTRAR EN FACTURAS
 *
 * Ger, con una captura de un panel de finanzas al lado: «hazlo algo así y
 * quiero que se entienda». Lo que se toma de aquella referencia no es el
 * morado ni los adornos: es el orden. Una cifra que manda, las que la
 * explican al lado, la evolución debajo y lo último que ha pasado a la derecha.
 *
 *   · EL BLOQUE VINO es la única pieza oscura de la pantalla (MARCA.md: una por
 *     pantalla) y dice lo único que Iris quiere saber al entrar: cuánto le
 *     queda este trimestre.
 *   · EL IVA va aparte porque es otro dinero: no es suyo, lo guarda para
 *     Hacienda.
 *   · MES A MES son barras, no una línea: son cantidades de cada mes, no un
 *     valor que fluye. Lo facturado va en el color de la casa; lo gastado, en
 *     gris. Distintos por claridad, no sólo por tono, y con leyenda.
 *
 * Nada de esto es la declaración, y se dice: los números los cierra el gestor.
 */

import { useEffect, useMemo, useState } from "react";
import { useEstrecho } from "./Piezas";
import { css } from "@/lib/css";
import { APOYO, BOTON_NORMAL, BOTON_PLANO, ENLACE, NOTA, PAD, RAYA, TARJETA, botonPrincipal, rotulo } from "@/lib/ui";
import {
  anterior,
  claveDia,
  cuentaComoIngreso,
  desglose,
  euros,
  gastos as repoGastos,
  hastaTrimestre,
  mesesTrimestre,
  mismoTrimestre,
  nombreTrimestre,
  numeroDe,
  plazoTrimestre,
  resumen,
  siguiente,
  totales,
  trimestreDe,
  type Factura,
  type Gasto,
  type Trimestre,
} from "@/lib/despacho";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESES_LARGOS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/** Los dos colores del gráfico, por token: lo de la casa y un gris. */
const C_INGRESO = "var(--accion)";
const C_GASTO = "color-mix(in srgb, var(--text) 30%, transparent)";

/** Euros sin céntimos, para los ejes y el bloque: «1.235 €». */
/** «10 nov»: en una lista corta la fecha larga partía cada fila en dos. */
const corta = (f: string) => `${Number(f.slice(8, 10))} ${MESES[Number(f.slice(5, 7)) - 1]}`;

const redondos = (n: number) => Math.round(n).toLocaleString("es-ES") + " €";

export default function Resumen({
  facturas,
  onNuevaFactura,
  onApuntarGasto,
  onVerFacturas,
  onVerGastos,
}: {
  facturas: Factura[];
  onNuevaFactura: () => void;
  onApuntarGasto: () => void;
  onVerFacturas: () => void;
  onVerGastos: () => void;
}) {
  const [lista, setLista] = useState<Gasto[]>([]);
  const [fallo, setFallo] = useState("");
  const [q, setQ] = useState<Trimestre | null>(null);
  const [encima, setEncima] = useState<number | null>(null);
  /* Dos columnas —lo grande a la izquierda, lo que lo explica a la derecha—
     hasta que no caben; entonces, una. */
  const estrecho = useEstrecho(980);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setQ(trimestreDe(claveDia(new Date())));
    repoGastos
      .listar()
      .then(setLista)
      .catch((e) => setFallo(e instanceof Error ? e.message : "No se han podido leer los gastos."));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const r = useMemo(() => (q ? resumen(facturas, lista, (f) => mismoTrimestre(f, q)) : null), [facturas, lista, q]);
  const ano = useMemo(() => (q ? resumen(facturas, lista, hastaTrimestre(q)) : null), [facturas, lista, q]);

  /** Los doce meses del año del trimestre: facturado y gastado, sin IVA. */
  const meses = useMemo(() => {
    if (!q) return [];
    return MESES.map((_, m) => {
      const clave = `${q.ano}-${String(m + 1).padStart(2, "0")}`;
      const r = resumen(facturas, lista, (f) => f.startsWith(clave));
      return { m, ingresos: r.ingresos, gastos: r.gastos };
    });
  }, [facturas, lista, q]);

  if (!q || !r || !ano) return null;

  const hoyQ = trimestreDe(claveDia(new Date()));
  const esElDeHoy = hoyQ.ano === q.ano && hoyQ.t === q.t;
  const mesHoy = new Date().getMonth();

  const ultimasF = facturas.filter(cuentaComoIngreso).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 3);
  const ultimosG = lista.slice(0, 3);

  /* ------------------------------------------------ la escala del gráfico */
  const tope = Math.max(...meses.map((x) => Math.max(x.ingresos, x.gastos)), 0);
  /** Un techo redondo: 1, 2 o 5 por una potencia de diez. */
  const techo = (() => {
    if (tope <= 0) return 100;
    const p = Math.pow(10, Math.floor(Math.log10(tope)));
    return [1, 2, 5, 10].map((k) => k * p).find((v) => v >= tope) ?? 10 * p;
  })();
  const mesEncima = encima != null ? meses[encima] : null;

  return (
    <>
      {/* ------------------------------------------------ el trimestre y las acciones */}
      <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;margin-bottom:var(--gap);")}>
        <div style={css("display:flex;align-items:center;gap:6px;")}>
          <button aria-label="Trimestre anterior" onClick={() => setQ(anterior(q))} style={css(BOTON_PLANO + "padding:8px 14px;")}>
            ‹
          </button>
          <div style={css("min-width:0;padding:0 var(--s1);")}>
            <div style={css("font-size:var(--t-body);font-weight:500;color:var(--text);white-space:nowrap;")}>{nombreTrimestre(q)}</div>
            <div style={css(NOTA)}>De {mesesTrimestre(q)}</div>
          </div>
          <button aria-label="Trimestre siguiente" onClick={() => setQ(siguiente(q))} style={css(BOTON_PLANO + "padding:8px 14px;")}>
            ›
          </button>
          {!esElDeHoy && (
            <button onClick={() => setQ(hoyQ)} style={css(ENLACE + "margin-left:var(--s2);color:var(--accion);")}>
              Volver al de hoy
            </button>
          )}
        </div>
        <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;margin-left:auto;")}>
          <button onClick={onApuntarGasto} style={css(BOTON_NORMAL)}>
            Apuntar un gasto
          </button>
          <button onClick={onNuevaFactura} style={css(botonPrincipal())}>
            Nueva factura
          </button>
        </div>
      </div>

      {fallo && (
        <p role="alert" style={css(APOYO + "margin:0 0 var(--gap);color:var(--red);")}>
          {fallo} Los gastos no se han podido leer: las cifras de abajo no los cuentan.
        </p>
      )}

      <div data-resumen="" style={css("display:grid;gap:var(--gap);grid-template-columns:" + (estrecho ? "minmax(0,1fr)" : "minmax(0,1.85fr) minmax(0,1fr)") + ";")}>
        {/* ------------------------------------------------ el bloque vino */}
        <section
          style={css(
            "min-width:0;border-radius:var(--r-tarjeta);background:var(--bloque);color:var(--sobre-bloque);border:1px solid var(--bloque-borde);" +
              PAD +
              "display:flex;flex-direction:column;gap:var(--s4);"
          )}
        >
          <span style={css("font-size:var(--t-mini);font-weight:500;color:var(--sobre-bloque-2);")}>Este trimestre te queda</span>
          <span data-cifras="" style={css("font-size:var(--t-hero);font-weight:300;letter-spacing:-.02em;line-height:1;")}>
            {euros(r.rendimiento)}
          </span>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:var(--s3);")}>
            {[
              ["Has facturado", r.ingresos, `${r.nFacturas === 1 ? "1 factura" : `${r.nFacturas} facturas`}`],
              ["Has gastado", r.gastos, `${r.nGastos === 1 ? "1 gasto" : `${r.nGastos} gastos`}`],
            ].map(([t, v, pie]) => (
              <div key={t as string} style={css("border-radius:var(--r);background:var(--bloque-2);padding:var(--s3) var(--s4);min-width:0;")}>
                <div style={css("font-size:var(--t-mini);color:var(--sobre-bloque-2);")}>{t}</div>
                <div data-cifras="" style={css("font-size:var(--t-title);font-weight:400;margin-top:2px;")}>
                  {euros(v as number)}
                </div>
                <div style={css("font-size:var(--t-micro);color:var(--sobre-bloque-2);margin-top:2px;")}>{pie as string}, sin IVA</div>
              </div>
            ))}
          </div>
          <span style={css("font-size:var(--t-mini);color:var(--sobre-bloque-2);line-height:1.45;")}>
            Desde enero llevas {euros(ano.rendimiento)}. Es lo que mira tu gestor para el modelo 130.
          </span>
        </section>

        {/* ------------------------------------------------ el IVA */}
        <section style={css(TARJETA + PAD + "min-width:0;display:flex;flex-direction:column;gap:var(--s3);")}>
          <span style={css(rotulo())}>IVA del trimestre</span>
          <span data-cifras="" style={css("font-size:var(--t-hero);font-weight:300;letter-spacing:-.02em;line-height:1;color:var(--text);")}>
            {euros(Math.abs(r.iva))}
          </span>
          <span style={css(APOYO + "margin:0;")}>{r.iva >= 0 ? "Lo guardas para Hacienda (modelo 303)." : "Te sale a favor."}</span>
          <div style={css(RAYA + "padding-top:var(--s3);display:flex;flex-direction:column;gap:6px;")}>
            <div data-cifras="" style={css("display:flex;justify-content:space-between;gap:var(--s3);font-size:var(--t-mini);color:var(--text-2);")}>
              <span>Cobrado en tus facturas</span>
              <span>{euros(r.ivaRepercutido)}</span>
            </div>
            <div data-cifras="" style={css("display:flex;justify-content:space-between;gap:var(--s3);font-size:var(--t-mini);color:var(--text-2);")}>
              <span>Pagado en tus gastos</span>
              <span>− {euros(r.ivaSoportado)}</span>
            </div>
          </div>
          <span style={css(NOTA + "margin-top:auto;line-height:1.45;")}>Tu gestor lo presenta {plazoTrimestre(q)}.</span>
        </section>

        {/* ------------------------------------------------ mes a mes */}
        <section style={css(TARJETA + PAD + "min-width:0;display:flex;flex-direction:column;gap:var(--s3);")}>
          <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
            <span style={css("font-size:var(--t-title);font-weight:500;letter-spacing:-.015em;color:var(--text);")}>Mes a mes · {q.ano}</span>
            <span style={css("display:flex;gap:var(--s4);margin-left:auto;font-size:var(--t-mini);color:var(--text-2);")}>
              <span style={css("display:inline-flex;align-items:center;gap:6px;")}>
                <span style={css("width:10px;height:10px;border-radius:3px;background:" + C_INGRESO + ";")} />
                Facturado
              </span>
              <span style={css("display:inline-flex;align-items:center;gap:6px;")}>
                <span style={css("width:10px;height:10px;border-radius:3px;background:" + C_GASTO + ";")} />
                Gastado
              </span>
            </span>
          </div>

          {/* Lo que dice la barra que tienes debajo del ratón. Ocupa siempre su
              renglón para que el gráfico no salte al pasar. */}
          <div data-cifras="" aria-live="polite" style={css(NOTA + "min-height:1.4em;")}>
            {mesEncima
              ? `${MESES_LARGOS[mesEncima.m]}: facturado ${euros(mesEncima.ingresos)} · gastado ${euros(mesEncima.gastos)}`
              : "Pasa por encima de un mes para ver sus cifras. Sin IVA."}
          </div>

          {/* EN PIEZAS DE HTML Y NO EN UN DIBUJO: un SVG escala también la letra,
              y en el móvil los meses salían a cinco píxeles. Así la letra se
              queda a su tamaño y sólo se estiran las barras. */}
          <div
            role="img"
            aria-label={`Facturado y gastado cada mes de ${q.ano}, sin IVA.`}
            onMouseLeave={() => setEncima(null)}
            style={css("display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--s2);")}
          >
            {/* El eje: tres cifras redondas, de arriba abajo. */}
            <div data-cifras="" style={css("display:flex;flex-direction:column;justify-content:space-between;height:170px;font-size:var(--t-micro);color:var(--text-3);text-align:right;transform:translateY(-.5em);")}>
              <span>{redondos(techo)}</span>
              <span>{redondos(techo / 2)}</span>
              <span>0 €</span>
            </div>
            <div style={css("min-width:0;")}>
              <div
                style={css(
                  "position:relative;height:170px;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));border-bottom:1px solid var(--border-strong);" +
                    /* Las dos rayas de guía, recesivas: la mitad y el techo. */
                    "background:linear-gradient(var(--border),var(--border)) 0 0/100% 1px no-repeat,linear-gradient(var(--border),var(--border)) 0 50%/100% 1px no-repeat;"
                )}
              >
                {meses.map((x, i) => {
                  const on = encima === i;
                  const h = (v: number) => (v > 0 ? `max(2px, ${(v / techo) * 100}%)` : "0");
                  return (
                    <button
                      key={i}
                      type="button"
                      onMouseEnter={() => setEncima(i)}
                      onFocus={() => setEncima(i)}
                      aria-label={`${MESES_LARGOS[x.m]}: facturado ${euros(x.ingresos)}, gastado ${euros(x.gastos)}`}
                      style={css(
                        "all:unset;cursor:default;display:flex;align-items:flex-end;justify-content:center;gap:2px;height:100%;border-radius:var(--r-sm) var(--r-sm) 0 0;" +
                          "background:" + (on ? "var(--accion-suave)" : "transparent") + ";"
                      )}
                    >
                      <span style={css("width:min(14px,32%);height:" + h(x.ingresos) + ";background:" + C_INGRESO + ";border-radius:4px 4px 0 0;")} />
                      <span style={css("width:min(14px,32%);height:" + h(x.gastos) + ";background:" + C_GASTO + ";border-radius:4px 4px 0 0;")} />
                    </button>
                  );
                })}
              </div>
              <div style={css("display:grid;grid-template-columns:repeat(12,minmax(0,1fr));margin-top:6px;")}>
                {meses.map((x) => {
                  const esHoy = x.m === mesHoy && q.ano === new Date().getFullYear();
                  return (
                    <span
                      key={x.m}
                      style={css(
                        "text-align:center;font-size:var(--t-micro);" + (esHoy ? "color:var(--text);font-weight:500;" : "color:var(--text-3);")
                      )}
                    >
                      {estrecho ? MESES[x.m].charAt(0).toUpperCase() : MESES[x.m]}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ lo último */}
        <section style={css(TARJETA + PAD + "min-width:0;display:flex;flex-direction:column;gap:var(--s2);")}>
          <div style={css("display:flex;align-items:baseline;")}>
            <span style={css(rotulo())}>Últimas facturas</span>
            <button onClick={onVerFacturas} style={css(ENLACE)}>
              Ver todas
            </button>
          </div>
          {ultimasF.length === 0 && <p style={css(NOTA + "margin:0;")}>Aún no has emitido ninguna.</p>}
          {ultimasF.map((f) => (
            <div key={f.id} style={css("display:flex;align-items:center;gap:var(--s3);padding:6px 0;")}>
              <span style={css("width:8px;height:8px;border-radius:50%;flex:none;background:" + C_INGRESO + ";")} />
              <span style={css("flex:1;min-width:0;")}>
                <span style={css("display:block;font-size:var(--t-body);color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                  {f.cliente.nombre || "Sin nombre"}
                </span>
                <span data-cifras="" style={css(NOTA + "display:block;")}>
                  {numeroDe(f)} · {corta(f.fecha)}
                </span>
              </span>
              <span data-cifras="" style={css("font-size:var(--t-body);font-weight:500;color:var(--text);white-space:nowrap;")}>
                {euros(totales(f).total)}
              </span>
            </div>
          ))}

          <div style={css(RAYA + "margin-top:var(--s2);padding-top:var(--s3);display:flex;align-items:baseline;")}>
            <span style={css(rotulo())}>Últimos gastos</span>
            <button onClick={onVerGastos} style={css(ENLACE)}>
              Ver todos
            </button>
          </div>
          {ultimosG.length === 0 && <p style={css(NOTA + "margin:0;")}>Aún no has apuntado ninguno.</p>}
          {ultimosG.map((g) => (
            <div key={g.id} style={css("display:flex;align-items:center;gap:var(--s3);padding:6px 0;")}>
              <span style={css("width:8px;height:8px;border-radius:50%;flex:none;background:" + C_GASTO + ";")} />
              <span style={css("flex:1;min-width:0;")}>
                <span style={css("display:block;font-size:var(--t-body);color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                  {g.proveedor}
                </span>
                <span style={css(NOTA + "display:block;")}>{corta(g.fecha)}</span>
              </span>
              <span data-cifras="" style={css("font-size:var(--t-body);font-weight:500;color:var(--text);white-space:nowrap;")}>
                − {euros(desglose(g).total)}
              </span>
            </div>
          ))}
        </section>
      </div>

      <p style={css(NOTA + "line-height:1.5;margin:var(--gap) 0 0;max-width:70ch;")}>
        Son tus números en orden, no la declaración. Lo que pagas al final lo cierra tu gestor.
      </p>
    </>
  );
}
