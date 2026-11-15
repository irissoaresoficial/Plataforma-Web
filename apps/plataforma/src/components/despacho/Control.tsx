"use client";

/**
 * EL CONTROL: INGRESOS, GASTOS Y LAS CUENTAS DEL TRIMESTRE
 *
 * La otra mitad de Facturas. Arriba, el trimestre que se está mirando y sus
 * cuatro números: lo que ha facturado, lo que ha gastado, el IVA que resulta y
 * lo que le queda. Debajo, a la izquierda, apuntar un gasto; a la derecha, lo
 * que ya está apuntado ese trimestre.
 *
 * Los ingresos no se apuntan aquí: son las facturas emitidas, y salen solas.
 * Escribirlos dos veces sería tener dos libros que algún día no cuadran.
 *
 * Nada de esto es la declaración. Son los números en orden para el gestor, y
 * la pantalla lo dice donde hace falta leerlo: junto a las cifras.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { css } from "@/lib/css";
import { APOYO, BOTON_NORMAL, BOTON_PLANO, NOTA, PAD, RAYA, TARJETA, botonPrincipal, rotulo } from "@/lib/ui";
import {
  CATEGORIAS,
  TIPOS_IVA,
  admiteTiques,
  anterior,
  claveDia,
  desglose,
  euros,
  fechaDeFactura,
  gastoVacio,
  gastos as repoGastos,
  guardadoEnLaNube,
  hastaTrimestre,
  mesesTrimestre,
  mismoTrimestre,
  nombreTrimestre,
  numeroDe,
  plazoTrimestre,
  quitaTique,
  resumen,
  siguiente,
  subeTique,
  totales,
  trimestreDe,
  cuentaComoIngreso,
  type Factura,
  type Gasto,
  type Trimestre,
} from "@/lib/despacho";
import { Vacio } from "./Piezas";

/** El mismo campo que el formulario de la factura, al lado: la pintura la
 *  ponen los estilos generales de `input` y `select`, igual que allí. */
const CAMPO = "width:100%;min-width:0;padding:10px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);";

export default function Control({ facturas }: { facturas: Factura[] }) {
  const [lista, setLista] = useState<Gasto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState("");
  const [q, setQ] = useState<Trimestre | null>(null);
  const [g, setG] = useState<Gasto | null>(null);
  /** ¿El que está en el formulario ya estaba guardado? Decide «Apuntar» o «Guardar cambios». */
  const [editando, setEditando] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [borrando, setBorrando] = useState(false);
  const elegir = useRef<HTMLInputElement>(null);

  const recargar = useCallback(async () => {
    try {
      setLista(await repoGastos.listar());
      setFallo("");
    } catch (e) {
      /* Una lista vacía aquí mentiría: diría «no has gastado nada» cuando lo
         cierto es «no he podido mirarlo». */
      setFallo(e instanceof Error ? e.message : "No se han podido leer los gastos.");
    } finally {
      setCargando(false);
    }
  }, []);

  /* La fecha de hoy no puede ir en el estado inicial: el servidor puede estar
     en otro día. Se siembra al montar, como en las otras pantallas. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const hoy = claveDia(new Date());
    setQ(trimestreDe(hoy));
    setG(gastoVacio(hoy));
    void recargar();
  }, [recargar]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const delTrimestre = useMemo(() => (q ? lista.filter((x) => mismoTrimestre(x.fecha, q)) : []), [lista, q]);
  const ingresosT = useMemo(
    () => (q ? facturas.filter((f) => cuentaComoIngreso(f) && mismoTrimestre(f.fecha, q)).sort((a, b) => b.fecha.localeCompare(a.fecha)) : []),
    [facturas, q]
  );
  const r = useMemo(() => (q ? resumen(facturas, lista, (f) => mismoTrimestre(f, q)) : null), [facturas, lista, q]);
  const ano = useMemo(() => (q ? resumen(facturas, lista, hastaTrimestre(q)) : null), [facturas, lista, q]);

  if (!q || !g || !r || !ano) return null;

  const d = desglose(g);
  const cambia = (parte: Partial<Gasto>) => setG({ ...g, ...parte });

  const limpiar = () => {
    setG(gastoVacio(claveDia(new Date())));
    setEditando(false);
    setArchivo(null);
    setBorrando(false);
    if (elegir.current) elegir.current.value = "";
  };

  const abrir = (x: Gasto) => {
    setG(x);
    setEditando(true);
    setArchivo(null);
    setBorrando(false);
    setMensaje("");
  };

  const falta = !g.proveedor.trim() ? "a quién se lo pagaste" : !g.concepto.trim() ? "qué es" : !(d.total > 0) ? "cuánto pagaste" : !g.fecha ? "la fecha" : "";

  const guardar = async () => {
    if (falta) {
      setMensaje(`Falta ${falta}.`);
      return;
    }
    setGuardando(true);
    setMensaje("");
    try {
      let x = g;
      if (archivo) {
        const anterior = g.justificante;
        x = { ...g, justificante: await subeTique(g.id, archivo) };
        if (anterior) await quitaTique(anterior);
      }
      await repoGastos.guardar(x);
      await recargar();
      /* Si el gasto es de otro trimestre, se salta a él: si no, se apunta y
         desaparece de la vista, y parece que no se ha guardado. */
      if (!mismoTrimestre(x.fecha, q)) setQ(trimestreDe(x.fecha));
      setMensaje(editando ? "Cambios guardados." : `Apuntado: ${x.proveedor}, ${euros(desglose(x).total)}.`);
      limpiar();
    } catch (e) {
      setMensaje((e instanceof Error ? e.message : "No se ha podido guardar.") + " El gasto no se ha guardado.");
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async () => {
    setGuardando(true);
    try {
      await repoGastos.borrar(g);
      await recargar();
      setMensaje("Gasto borrado.");
      limpiar();
    } catch (e) {
      setMensaje((e instanceof Error ? e.message : "No se ha podido borrar.") + " Sigue apuntado.");
    } finally {
      setGuardando(false);
    }
  };

  const campo = (etiqueta: string, hijo: React.ReactNode, nota?: string) => (
    <label style={css("display:flex;flex-direction:column;gap:5px;min-width:0;")}>
      <span style={css(rotulo())}>
        {etiqueta}
        {nota && <span style={css(NOTA + "font-weight:400;")}> · {nota}</span>}
      </span>
      {hijo}
    </label>
  );

  /** Una cifra del resumen: el número grande y, debajo, de dónde sale. */
  const cifra = (titulo: string, valor: number, pie: string, tono = "var(--text)") => (
    <div style={css("min-width:0;display:flex;flex-direction:column;gap:6px;")}>
      <span style={css(rotulo())}>{titulo}</span>
      <span data-cifras="" style={css("font-size:var(--t-hero);font-weight:300;letter-spacing:-.02em;line-height:1.05;color:" + tono + ";overflow-wrap:anywhere;")}>
        {euros(valor)}
      </span>
      <span style={css(NOTA + "line-height:1.45;")}>{pie}</span>
    </div>
  );

  const hoyQ = trimestreDe(claveDia(new Date()));
  const esElDeHoy = hoyQ.ano === q.ano && hoyQ.t === q.t;

  return (
    <>
      {/* ------------------------------------------------ el trimestre */}
      <section style={css(TARJETA + PAD + "margin-bottom:var(--gap-lg);")}>
        {/* El título a la izquierda y las dos flechas juntas a la derecha. Si
            van una a cada lado del título, en el móvil se parten en tres
            renglones y parecen botones sueltos. */}
        <div style={css("display:flex;align-items:flex-start;gap:var(--s3);margin-bottom:var(--s5);")}>
          <div style={css("flex:1;min-width:0;")}>
            <div style={css("font-size:var(--t-title);font-weight:500;letter-spacing:-.015em;color:var(--text);")}>{nombreTrimestre(q)}</div>
            <div style={css(NOTA + "margin-top:2px;line-height:1.45;")}>
              De {mesesTrimestre(q)}. Tu gestor lo presenta {plazoTrimestre(q)}.
              {!esElDeHoy && (
                <>
                  {" "}
                  <button
                    onClick={() => setQ(hoyQ)}
                    style={css("background:none;border:none;padding:0;cursor:pointer;font:inherit;color:var(--accion);text-decoration:underline;")}
                  >
                    Volver al de hoy
                  </button>
                </>
              )}
            </div>
          </div>
          <div style={css("display:flex;gap:6px;flex:none;")}>
            <button aria-label="Trimestre anterior" onClick={() => setQ(anterior(q))} style={css(BOTON_PLANO + "padding:8px 14px;")}>
              ‹
            </button>
            <button aria-label="Trimestre siguiente" onClick={() => setQ(siguiente(q))} style={css(BOTON_PLANO + "padding:8px 14px;")}>
              ›
            </button>
          </div>
        </div>

        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:var(--s5) var(--gap-lg);")}>
          {cifra("Has facturado", r.ingresos, `${r.nFacturas === 1 ? "1 factura" : `${r.nFacturas} facturas`}, sin IVA.`)}
          {cifra("Has gastado", r.gastos, `${r.nGastos === 1 ? "1 gasto" : `${r.nGastos} gastos`}, sin IVA.`)}
          {cifra(
            "IVA del trimestre",
            r.iva,
            `Cobrado ${euros(r.ivaRepercutido)} menos pagado ${euros(r.ivaSoportado)}. ${r.iva >= 0 ? "Es lo que sale a ingresar (modelo 303)." : "Sale a tu favor."}`
          )}
          {cifra(
            "Te queda",
            r.rendimiento,
            `Facturado menos gastado. Desde enero llevas ${euros(ano.rendimiento)}, que es lo que mira el modelo 130.`,
            r.rendimiento < 0 ? "var(--red)" : "var(--text)"
          )}
        </div>

        <p style={css(NOTA + "line-height:1.5;margin:var(--s5) 0 0;" + RAYA + "padding-top:var(--s4);")}>
          Son tus números en orden, no la declaración. Lo que pagas al final lo cierra tu gestor: puede faltar algún gasto
          que aquí no está, o sobrar uno que no se deduce.
          {r.sinTique > 0 && ` ${r.sinTique === 1 ? "Hay 1 gasto" : `Hay ${r.sinTique} gastos`} sin tique: sin él, el gestor no lo puede justificar.`}
        </p>
      </section>

      <div data-dos="">
        {/* ------------------------------------------------ apuntar un gasto */}
        <section style={css(TARJETA + PAD + "min-width:0;display:flex;flex-direction:column;gap:var(--s3);")}>
          <div style={css("display:flex;align-items:baseline;gap:var(--s3);")}>
            <span style={css("font-size:var(--t-title);font-weight:500;letter-spacing:-.015em;color:var(--text);")}>
              {editando ? "Cambiar un gasto" : "Apuntar un gasto"}
            </span>
            {editando && (
              <button onClick={limpiar} style={css(BOTON_PLANO + "margin-left:auto;")}>
                Dejarlo
              </button>
            )}
          </div>

          {campo(
            "A quién se lo pagaste",
            <input value={g.proveedor} onChange={(e) => cambia({ proveedor: e.target.value })} placeholder="La tienda, la empresa, la persona" style={css(CAMPO)} />
          )}
          {campo("Qué es", <input value={g.concepto} onChange={(e) => cambia({ concepto: e.target.value })} placeholder="Velas para la consulta" style={css(CAMPO)} />)}

          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:var(--s3);")}>
            {campo(
              "Cuánto pagaste",
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={g.total || ""}
                onChange={(e) => cambia({ total: Number(e.target.value) })}
                placeholder="0,00"
                data-cifras=""
                style={css(CAMPO)}
              />,
              "con IVA"
            )}
            {campo(
              "IVA",
              <select value={g.iva} onChange={(e) => cambia({ iva: Number(e.target.value) })} style={css(CAMPO)}>
                {TIPOS_IVA.map((t) => (
                  <option key={t} value={t}>
                    {t === 0 ? "Sin IVA" : `${t} %`}
                  </option>
                ))}
              </select>
            )}
            {campo("Fecha", <input type="date" value={g.fecha} onChange={(e) => cambia({ fecha: e.target.value })} style={css(CAMPO)} />)}
          </div>

          {d.total > 0 && (
            <p data-cifras="" style={css(NOTA + "margin:0;")}>
              {euros(d.base)} de gasto + {euros(d.cuota)} de IVA.
            </p>
          )}

          {campo(
            "De qué tipo",
            <select value={g.categoria} onChange={(e) => cambia({ categoria: e.target.value })} style={css(CAMPO)}>
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}

          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr));gap:var(--s3);")}>
            {campo(
              "Su NIF",
              <input value={g.nifProveedor} onChange={(e) => cambia({ nifProveedor: e.target.value })} placeholder="Viene en la factura" style={css(CAMPO)} />,
              "si lo tiene"
            )}
            {campo(
              "Número de su factura",
              <input value={g.numero} onChange={(e) => cambia({ numero: e.target.value })} placeholder="Si lo tiene" style={css(CAMPO)} />
            )}
          </div>

          {/* ------------------------------------------------ el tique */}
          <div style={css("display:flex;flex-direction:column;gap:6px;")}>
            <span style={css(rotulo())}>El tique</span>
            {admiteTiques ? (
              <>
                <input
                  ref={elegir}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                  style={css("display:none;")}
                />
                <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
                  <button onClick={() => elegir.current?.click()} style={css(BOTON_NORMAL)}>
                    {archivo || g.justificante ? "Cambiar la foto o el PDF" : "Subir foto o PDF"}
                  </button>
                  <span style={css(NOTA + "min-width:0;overflow-wrap:anywhere;")}>
                    {archivo ? `${archivo.name} · se sube al guardar` : g.justificante ? (
                      <a href={g.justificante.url} target="_blank" rel="noreferrer" style={css("color:var(--accion);")}>
                        {g.justificante.nombre}
                      </a>
                    ) : (
                      "Desde el móvil puedes hacerle la foto directamente."
                    )}
                  </span>
                </div>
              </>
            ) : (
              <span style={css(NOTA + "line-height:1.5;")}>
                Los tiques se suben cuando la plataforma está conectada a la nube. Ahora mismo no lo está: guarda el papel.
              </span>
            )}
          </div>

          <div style={css(RAYA + "padding-top:var(--s4);margin-top:var(--s1);display:flex;gap:var(--s2);flex-wrap:wrap;align-items:center;")}>
            <button onClick={() => void guardar()} disabled={guardando} style={css(botonPrincipal(!guardando))}>
              {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Apuntar el gasto"}
            </button>
            {editando &&
              (borrando ? (
                <>
                  <span style={css(NOTA)}>¿Lo borras?</span>
                  <button onClick={() => void borrar()} disabled={guardando} style={css(BOTON_PLANO + "color:var(--red);")}>
                    Sí, borrarlo
                  </button>
                  <button onClick={() => setBorrando(false)} style={css(BOTON_PLANO)}>
                    No
                  </button>
                </>
              ) : (
                <button onClick={() => setBorrando(true)} style={css(BOTON_PLANO)}>
                  Borrar
                </button>
              ))}
          </div>
          {mensaje && (
            <p role="status" style={css(APOYO + "margin:0;color:var(--text-2);")}>
              {mensaje}
            </p>
          )}
          {!guardadoEnLaNube && (
            <p style={css(NOTA + "line-height:1.5;margin:0;")}>
              Ahora mismo los gastos se guardan sólo en este navegador. Si cambias de ordenador, no estarán.
            </p>
          )}
        </section>

        {/* ------------------------------------------------ lo apuntado */}
        <div style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;")}>
          <section style={css(TARJETA + PAD + "min-width:0;")}>
            <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>
              {cargando ? "Un momento…" : `Gastos del trimestre · ${euros(r.gastos + r.ivaSoportado)} pagados`}
            </div>
            {fallo && (
              <p role="alert" style={css(APOYO + "margin:0 0 var(--s3);color:var(--red);")}>
                {fallo} No se sabe qué hay apuntado: no te fíes de la lista hasta que vuelva.
              </p>
            )}
            {!cargando && !fallo && delTrimestre.length === 0 && <Vacio>No hay gastos apuntados en este trimestre. Apunta el primero a la izquierda.</Vacio>}
            {delTrimestre.map((x, i) => {
              const dx = desglose(x);
              const on = editando && g.id === x.id;
              return (
                <button
                  key={x.id}
                  onClick={() => abrir(x)}
                  style={css(
                    "display:flex;align-items:center;gap:var(--s3);width:100%;text-align:left;padding:var(--s3) var(--s2);border:none;cursor:pointer;font:inherit;border-radius:var(--r-sm);border-top:1px solid " +
                      (i ? "var(--border)" : "transparent") +
                      ";background:" +
                      (on ? "var(--accion-suave)" : "transparent") +
                      ";color:var(--text);"
                  )}
                >
                  <span style={css("flex:1;min-width:0;")}>
                    <span style={css("display:block;font-size:var(--t-body);font-weight:500;overflow-wrap:anywhere;")}>
                      {x.proveedor} · {x.concepto}
                    </span>
                    <span style={css(NOTA + "display:block;margin-top:2px;overflow-wrap:anywhere;")}>
                      {fechaDeFactura(x.fecha)} · {x.categoria}
                      {x.justificante ? "" : " · sin tique"}
                    </span>
                  </span>
                  <span data-cifras="" style={css("font-size:var(--t-body);font-weight:500;white-space:nowrap;")}>
                    {euros(dx.total)}
                  </span>
                </button>
              );
            })}
          </section>

          <section style={css(TARJETA + PAD + "min-width:0;")}>
            <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>Facturas del trimestre · salen solas</div>
            {ingresosT.length === 0 && <Vacio>No has emitido ninguna factura con fecha de este trimestre.</Vacio>}
            {ingresosT.map((f, i) => {
              const t = totales(f);
              return (
                <div
                  key={f.id}
                  style={css(
                    "display:flex;align-items:center;gap:var(--s3);padding:var(--s3) var(--s2);border-top:1px solid " + (i ? "var(--border)" : "transparent") + ";"
                  )}
                >
                  <span style={css("flex:1;min-width:0;")}>
                    <span data-cifras="" style={css("display:block;font-size:var(--t-body);font-weight:500;")}>
                      {numeroDe(f)} · {f.cliente.nombre || "Sin nombre"}
                    </span>
                    <span style={css(NOTA + "display:block;margin-top:2px;")}>{fechaDeFactura(f.fecha)}</span>
                  </span>
                  <span data-cifras="" style={css("font-size:var(--t-body);font-weight:500;white-space:nowrap;")}>
                    {euros(t.total)}
                  </span>
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </>
  );
}
