"use client";

/**
 * LAS FACTURAS
 *
 * Emitir una por una sesión o por un curso, verla y descargarla. Y tres reglas
 * que no son de diseño sino de la cosa en sí:
 *
 *  1. LOS DATOS FISCALES DEL EMISOR NO EXISTEN todavía. No se inventan: salen
 *     marcados como PENDIENTE aquí y en la propia hoja, y mientras falten no se
 *     puede emitir una factura definitiva. Un borrador sí, que no es un
 *     documento.
 *
 *  2. LA NUMERACIÓN ES CORRELATIVA Y SIN HUECOS. El número no se reserva al
 *     empezar a escribir: se asigna al emitir. Por eso un borrador se puede
 *     tirar a la basura sin dejar hueco — no llegó a tener número.
 *
 *  3. UNA FACTURA EMITIDA NO SE BORRA. Se anula, y su número se queda ocupado.
 *     Borrarla dejaría un agujero en la serie, y una serie con agujeros no
 *     vale: no hay forma de demostrar qué había en el número que falta. Por eso
 *     esta pantalla no ofrece «borrar» sobre nada que esté emitido; ofrece
 *     «anular», y la regla la vuelve a comprobar el repositorio.
 *
 * Como las otras dos, no toca `localStorage`: habla con `lib/despacho`.
 */

import { useCallback, useEffect, useState } from "react";
import { css } from "@/lib/css";
import { useApp } from "@/lib/app-context";
import { APOYO, BOTON_NORMAL, BOTON_PLANO, NOTA, PAD, RAYA, TARJETA, TITULO, botonPrincipal, rotulo, tarjetaCon } from "@/lib/ui";
import { imprimir, AYUDA_IMPRIMIR } from "@/lib/imprimir";
import {
  clientes as repoClientes,
  facturas as repoFacturas,
  claveDia,
  emisorCompleto,
  euros,
  faltaDelEmisor,
  fechaDeFactura,
  nuevoId,
  numeroDe,
  sinTildes,
  totales,
  type Cliente,
  type Factura,
} from "@/lib/despacho";
import { AvisoNavegador, Cabecera, Estado, Vacio, useLlevaAlDetalle } from "../despacho/Piezas";
import HojaFactura from "../despacho/HojaFactura";

/** El tipo general de IVA en España. Se puede cambiar en el formulario: no
 *  todos los servicios llevan el mismo, y adivinar cuál toca no es cosa nuestra. */
const IVA_GENERAL = 21;

/** Lo que se suele facturar, para no teclearlo cada vez. */
const CONCEPTOS = [
  { label: "Una sesión", texto: "Sesión individual" },
  { label: "Un curso", texto: "Curso" },
  { label: "Otra cosa", texto: "" },
];

function facturaVacia(fecha: string): Factura {
  return {
    id: nuevoId(),
    serie: fecha.slice(0, 4),
    numero: 0,
    fecha,
    estado: "borrador",
    cliente: { nombre: "", nif: "", direccion: "" },
    clienteId: null,
    // Nulo hasta que se emita: entonces se congela el emisor de ese momento.
    emisor: null,
    lineas: [{ concepto: "Sesión individual", cantidad: 1, precio: 0 }],
    iva: IVA_GENERAL,
    notas: "",
    creada: new Date().toISOString(),
  };
}

const COLOR_ESTADO: Record<Factura["estado"], string> = {
  borrador: "var(--gold)",
  emitida: "var(--green)",
  anulada: "var(--red)",
};

export default function FacturasScreen() {
  const { marca, setView, setClienteAbierto, facturaAbierta, setFacturaAbierta, recado, setRecado } = useApp();

  const [lista, setLista] = useState<Factura[]>([]);
  const [gente, setGente] = useState<Cliente[]>([]);
  const [abierta, setAbierta] = useState<Factura | null>(null);
  const [borrador, setBorrador] = useState<Factura | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [anulando, setAnulando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(true);

  const completo = emisorCompleto();
  const huecos = faltaDelEmisor();

  const recargar = useCallback(async () => {
    const [f, g] = await Promise.all([repoFacturas.listar(), repoClientes.listar()]);
    setLista(f);
    setGente(g);
    setCargando(false);
  }, []);

  /* Como en las otras pantallas: el disco de este equipo no se puede leer en el
     primer render porque el servidor no lo ve. Y la fecha de hoy tampoco puede
     sembrarse en el estado inicial — el servidor puede estar en otro día. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void recargar();
    setBorrador(facturaVacia(claveDia(new Date())));
  }, [recargar]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /** Lo que se está viendo: una factura ya emitida, o el borrador en curso. */
  const enPantalla = abierta ?? borrador;
  // En móvil la factura elegida sale debajo de la lista, fuera de pantalla.
  const alDetalle = useLlevaAlDetalle(abierta?.id);

  const nueva = () => {
    setAbierta(null);
    setAnulando(false);
    setMensaje("");
    setBorrador(facturaVacia(claveDia(new Date())));
  };

  const abrir = (f: Factura) => {
    setAnulando(false);
    setMensaje("");
    if (f.estado === "borrador") {
      // Un borrador se sigue escribiendo; una emitida sólo se mira.
      setAbierta(null);
      setBorrador(f);
    } else {
      setAbierta(f);
    }
  };

  const cambia = (parte: Partial<Factura>) => setBorrador((b) => (b ? { ...b, ...parte } : b));

  /** Al escribir el nombre se busca en los clientes: si está fichado, su NIF y
   *  su domicilio entran solos y no hay que teclearlos cada vez. */
  const cambiaCliente = (nombre: string) => {
    const encontrado = gente.find((g) => sinTildes(g.nombre) === sinTildes(nombre));
    setBorrador((b) =>
      b
        ? {
            ...b,
            clienteId: encontrado?.id ?? null,
            cliente: encontrado
              ? { nombre: encontrado.nombre, nif: encontrado.nif ?? "", direccion: encontrado.direccion ?? "" }
              : { ...b.cliente, nombre },
          }
        : b
    );
  };

  /*
   * LOS RECADOS QUE LLEGAN DE OTRA PANTALLA.
   *
   * Dos, y los dos vienen de fuera: «abre ESTA factura» —lo manda el aviso de
   * la cabecera cuando un borrador lleva días parado, y el botón «Abrirla» de
   * la ficha de un cliente— y «hazle una factura a ESTA persona», que lo manda
   * la ficha. Sin esto, los dos botones sólo cambiarían de pantalla y dejarían
   * a Iris buscando en la lista lo que ella acaba de señalar.
   *
   * Se consumen y se apagan en el acto: son un recado, no un estado. Si se
   * quedaran puestos, cada vuelta a Facturas reabriría lo mismo.
   *
   * Se espera a que esté leído el disco: sin la lista no se sabe qué factura es
   * la del identificador, y sin los clientes no se pueden traer solos el NIF y
   * el domicilio de quien se va a facturar.
   */
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (cargando) return;
    if (facturaAbierta) {
      const f = lista.find((x) => x.id === facturaAbierta);
      if (f) abrir(f);
      setFacturaAbierta(null);
      return;
    }
    if (recado) {
      nueva();
      cambiaCliente(recado);
      setRecado(null);
    }
  }, [cargando, facturaAbierta, recado, lista]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const guardarBorrador = async () => {
    if (!borrador) return;
    try {
      await repoFacturas.guardar(borrador);
      setMensaje("Borrador guardado. No es una factura todavía: no tiene número.");
      await recargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "No se ha podido guardar.");
    }
  };

  const emitir = async () => {
    if (!borrador) return;
    try {
      // Se guarda antes de emitir para que lo que se numere sea exactamente lo
      // que hay en pantalla, y no una versión anterior.
      await repoFacturas.guardar(borrador);
      const emitida = await repoFacturas.emitir(borrador.id);
      setAbierta(emitida);
      setMensaje(`Emitida la factura ${numeroDe(emitida)}. Ya no se puede cambiar: si está mal, anúlala y haz otra.`);
      await recargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "No se ha podido emitir.");
    }
  };

  const tirarBorrador = async () => {
    if (!borrador) return;
    try {
      await repoFacturas.borrar(borrador.id);
      setMensaje("Borrador tirado. Como no tenía número, la numeración sigue seguida.");
      nueva();
      await recargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "No se ha podido tirar.");
    }
  };

  const confirmarAnular = async () => {
    if (!abierta) return;
    try {
      const anulada = await repoFacturas.anular(abierta.id, motivo);
      setAbierta(anulada);
      setAnulando(false);
      setMotivo("");
      setMensaje(`La ${numeroDe(anulada)} queda anulada. Su número sigue ocupado: la serie no se rompe.`);
      await recargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : "No se ha podido anular.");
    }
  };

  const entrada = "width:100%;min-width:0;padding:10px 13px;color:var(--text);font-family:var(--font-ui);font-size:var(--t-body);";

  const campo = (etiqueta: string, hijo: React.ReactNode) => (
    <label style={css("display:flex;flex-direction:column;gap:5px;min-width:0;")}>
      <span style={css(rotulo())}>{etiqueta}</span>
      {hijo}
    </label>
  );

  return (
    <main style={css("max-width:var(--ancho);margin:0 auto;padding:var(--s6) var(--gutter) var(--s8);")}>
      <div data-chrome="1">
        <Cabecera
          titulo="Facturas"
          pie="Numeradas seguidas, sin saltarse ninguna."
        />

        {/* --------------------------------------------- lo que falta y manda */}
        {!completo && (
          <div style={css(tarjetaCon("var(--red)") + PAD + "margin-bottom:var(--gap-lg);")}>
            <div style={css(rotulo("var(--red)") + "margin-bottom:var(--s2);")}>Faltan tus datos fiscales</div>
            <p style={css(APOYO + "margin:0 0 var(--s3);max-width:64ch;")}>
              En una factura española son obligatorios y nadie los ha dado todavía, así que no se han inventado. Hasta que estén,
              puedes dejar la factura en borrador, pero no emitirla.
            </p>
            <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;margin-bottom:var(--s3);")}>
              {huecos.map((h) => (
                <span
                  key={h}
                  style={css(
                    "display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border:1px solid var(--red-border);border-radius:999px;font-size:var(--t-mini);font-weight:590;color:var(--red);"
                  )}
                >
                  {h} · PENDIENTE
                </span>
              ))}
            </div>
            <p style={css(NOTA + "margin:0;line-height:1.5;")}>
              Se escriben en un solo sitio: <code>src/lib/despacho/emisor.ts</code>. En cuanto estén, el botón de emitir se
              enciende solo.
            </p>
          </div>
        )}
      </div>

      {/* `data-hoja` lo lee la hoja de impresión: al imprimir, la rejilla de dos
       * columnas se deshace para que la factura salga a todo el folio. */}
      <div data-dos="" data-hoja="">
        {/* ------------------------------------------------------- la lista */}
        {/* El aviso va FUERA de la tarjeta de la lista, no dentro: dentro de
         * una tarjeta no va otra tarjeta — lo que separa es una línea. */}
        <div data-chrome="1" data-anclado="" style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;position:sticky;top:79px;")}>
          <section
            style={css(TARJETA + PAD + "max-height:calc(100vh - 220px);overflow-y:auto;min-width:0;")}
          >
            <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s3);")}>
              {cargando ? "Un momento…" : lista.length === 1 ? "1 factura" : `${lista.length} facturas`}
            </div>

            {!cargando && lista.length === 0 && <Vacio>Todavía no has hecho ninguna. Empieza por la de al lado.</Vacio>}

            <div style={css("display:flex;flex-direction:column;")}>
              {lista.map((f, i) => {
                const on = enPantalla?.id === f.id;
                const t = totales(f);
                return (
                  <button
                    key={f.id}
                    onClick={() => abrir(f)}
                    style={css(
                      /* La línea va siempre puesta y cambia de color; ver la nota
                         en ClientesScreen sobre por qué no se quita y se pone. */
                      "display:flex;align-items:center;gap:var(--s3);width:100%;text-align:left;padding:var(--s3) var(--s2);border:none;cursor:pointer;border-radius:var(--r-sm);border-top:1px solid " +
                        (i ? "var(--border)" : "transparent") +
                        ";" +
                        "background:" +
                        (on ? "var(--accion-suave)" : "transparent") +
                        ";color:" +
                        (on ? "var(--accion)" : "var(--text)") +
                        ";"
                    )}
                  >
                    <span style={css("flex:1;min-width:0;")}>
                      <span data-cifras="" style={css("display:block;font-size:var(--t-body);font-weight:590;")}>
                        {f.estado === "borrador" ? "Borrador" : numeroDe(f)}
                      </span>
                      <span style={css(NOTA + "display:block;margin-top:2px;overflow-wrap:anywhere;")}>
                        {f.cliente.nombre || "Sin nombre"} · {euros(t.total)}
                      </span>
                    </span>
                    <Estado
                      texto={f.estado === "borrador" ? "Borrador" : f.estado === "anulada" ? "Anulada" : "Emitida"}
                      color={COLOR_ESTADO[f.estado]}
                    />
                  </button>
                );
              })}
            </div>

            <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);")}>
              <button onClick={nueva} style={css(BOTON_NORMAL + "width:100%;")}>
                Nueva factura
              </button>
            </div>
          </section>

          <AvisoNavegador que="Las facturas" tono="aviso" />
        </div>

        {/* ------------------------------------------- el formulario o la hoja */}
        <div ref={alDetalle} style={css("display:flex;flex-direction:column;gap:var(--gap);min-width:0;scroll-margin-top:79px;")}>
          {abierta ? (
            /* --------------------------------------------- una ya emitida */
            <section data-chrome="1" style={css(TARJETA + PAD)}>
              <h2 style={css(TITULO + "margin:0 0 var(--s2);")}>Factura {numeroDe(abierta)}</h2>
              <p style={css(APOYO + "margin:0 0 var(--s4);")}>
                {abierta.estado === "anulada"
                  ? `Anulada${abierta.motivoAnulacion ? ": " + abierta.motivoAnulacion : "."} Su número sigue ocupado, que es lo que mantiene la serie seguida.`
                  : `Emitida el ${fechaDeFactura(abierta.fecha)}. Una factura emitida no se cambia: si está mal, anúlala y haz otra.`}
              </p>

              <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;align-items:center;")}>
                {/* La única mancha de granate: descargarla es a lo que se
                    viene aquí una vez emitida. */}
                <button onClick={() => imprimir()} style={css(botonPrincipal())}>
                  Descargar la factura
                </button>
                {abierta.estado === "emitida" && !anulando && (
                  <button onClick={() => setAnulando(true)} style={css(BOTON_PLANO + "color:var(--red);")}>
                    Anular
                  </button>
                )}
                {abierta.clienteId && (
                  <button
                    onClick={() => {
                      setClienteAbierto(abierta.clienteId);
                      setView("clientes");
                    }}
                    style={css(BOTON_PLANO + "margin-left:auto;")}
                  >
                    Ver su ficha
                  </button>
                )}
              </div>

              {anulando && (
                <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);display:flex;flex-direction:column;gap:var(--s2);")}>
                  <span style={css(rotulo("var(--red)"))}>¿Por qué se anula?</span>
                  <p style={css(NOTA + "margin:0 0 var(--s2);line-height:1.5;")}>
                    Se queda escrito en la propia factura. No se borra: su número no puede quedar vacío.
                  </p>
                  <input
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Error en el importe · la sesión no llegó a darse"
                    style={css(entrada)}
                  />
                  <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;")}>
                    <button onClick={() => void confirmarAnular()} style={css(BOTON_NORMAL)}>
                      Anular la factura
                    </button>
                    <button onClick={() => setAnulando(false)} style={css(BOTON_PLANO)}>
                      Dejarlo
                    </button>
                  </div>
                </div>
              )}

              <p style={css(NOTA + "margin:var(--s4) 0 0;line-height:1.5;")}>{AYUDA_IMPRIMIR}</p>
              {mensaje && (
                <p role="status" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--text-2);")}>
                  {mensaje}
                </p>
              )}
            </section>
          ) : (
            /* ------------------------------------------------ el borrador */
            borrador && (
              <section data-chrome="1" style={css(TARJETA + PAD)}>
                <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s2);")}>Nueva factura</div>
                <p style={css(APOYO + "margin:0 0 var(--s5);")}>
                  Mientras sea un borrador puedes cambiar lo que quieras y tirarlo si no vale. El número se le pone al emitirla.
                </p>

                <div style={css("display:flex;flex-direction:column;gap:var(--s4);")}>
                  {/* -------------------------------------------- a quién */}
                  <div style={css("display:flex;flex-direction:column;gap:var(--s3);")}>
                    {campo(
                      "¿A quién le facturas?",
                      <>
                        <input
                          value={borrador.cliente.nombre}
                          onChange={(e) => cambiaCliente(e.target.value)}
                          list="es33-clientes-factura"
                          placeholder="Nombre o razón social"
                          style={css(entrada)}
                        />
                        <datalist id="es33-clientes-factura">
                          {gente.map((g) => (
                            <option key={g.id} value={g.nombre} />
                          ))}
                        </datalist>
                      </>
                    )}
                    <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr));gap:var(--s3);")}>
                      {campo(
                        "Su NIF",
                        <input
                          value={borrador.cliente.nif}
                          onChange={(e) => cambia({ cliente: { ...borrador.cliente, nif: e.target.value } })}
                          placeholder="Si hace falta"
                          style={css(entrada)}
                        />
                      )}
                      {campo(
                        "Su domicilio",
                        <input
                          value={borrador.cliente.direccion}
                          onChange={(e) => cambia({ cliente: { ...borrador.cliente, direccion: e.target.value } })}
                          placeholder="Si hace falta"
                          style={css(entrada)}
                        />
                      )}
                    </div>
                    <p style={css(NOTA + "margin:0;line-height:1.5;")}>
                      Si no pones NIF ni domicilio, la factura sale sin ellos. Para una empresa, o si la persona la necesita para
                      desgravar, hacen falta.
                    </p>
                  </div>

                  {/* --------------------------------------------- qué se factura */}
                  <div style={css(RAYA + "padding-top:var(--s4);display:flex;flex-direction:column;gap:var(--s3);")}>
                    <div style={css("display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap;")}>
                      <span style={css(rotulo())}>¿Qué le facturas?</span>
                      <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;margin-left:auto;")}>
                        {CONCEPTOS.map((c) => (
                          <button
                            key={c.label}
                            type="button"
                            onClick={() =>
                              cambia({ lineas: [{ ...borrador.lineas[0], concepto: c.texto }, ...borrador.lineas.slice(1)] })
                            }
                            style={css(BOTON_PLANO)}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Las tres casillas de cada línea no llevan rótulo encima
                     * —serían tres rótulos por línea y la tarjeta se llenaría
                     * de letra pequeña— así que se dice una vez, en cristiano. */}
                    <p style={css(NOTA + "margin:0;line-height:1.5;")}>
                      En cada línea: qué es, cuántas veces y a cuánto sale la unidad sin IVA.
                    </p>

                    {borrador.lineas.map((l, i) => (
                      <div key={i} data-linea-factura="" style={css("display:grid;grid-template-columns:minmax(0,1fr) 74px 96px auto;gap:var(--s2);align-items:center;")}>
                        <input
                          value={l.concepto}
                          onChange={(e) =>
                            cambia({ lineas: borrador.lineas.map((x, j) => (j === i ? { ...x, concepto: e.target.value } : x)) })
                          }
                          placeholder="Concepto"
                          aria-label="Concepto"
                          style={css(entrada)}
                        />
                        <input
                          value={l.cantidad}
                          inputMode="numeric"
                          onChange={(e) =>
                            cambia({ lineas: borrador.lineas.map((x, j) => (j === i ? { ...x, cantidad: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)) })
                          }
                          aria-label="Cantidad"
                          style={css(entrada + "text-align:right;")}
                        />
                        <input
                          value={l.precio}
                          inputMode="decimal"
                          onChange={(e) =>
                            cambia({ lineas: borrador.lineas.map((x, j) => (j === i ? { ...x, precio: Number(e.target.value.replace(",", ".").replace(/[^\d.]/g, "")) || 0 } : x)) })
                          }
                          aria-label="Precio sin IVA"
                          style={css(entrada + "text-align:right;")}
                        />
                        <button
                          onClick={() => cambia({ lineas: borrador.lineas.filter((_, j) => j !== i) })}
                          disabled={borrador.lineas.length === 1}
                          title="Quitar esta línea"
                          aria-label="Quitar esta línea"
                          style={css(
                            "flex:none;width:30px;height:30px;border-radius:50%;border:1px solid var(--border-strong);background:none;cursor:pointer;font-size:var(--t-body);line-height:1;color:" +
                              (borrador.lineas.length === 1 ? "var(--text-4)" : "var(--text-3)") +
                              ";"
                          )}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => cambia({ lineas: [...borrador.lineas, { concepto: "", cantidad: 1, precio: 0 }] })}
                      style={css(BOTON_PLANO + "align-self:flex-start;")}
                    >
                      Añadir otra línea
                    </button>
                  </div>

                  {/* ------------------------------------------ fecha, IVA y pie */}
                  <div style={css(RAYA + "padding-top:var(--s4);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:var(--s3);")}>
                    {campo("Fecha", <input type="date" value={borrador.fecha} onChange={(e) => cambia({ fecha: e.target.value })} style={css(entrada)} />)}
                    {campo(
                      "IVA (%)",
                      <input
                        value={borrador.iva}
                        inputMode="numeric"
                        onChange={(e) => cambia({ iva: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                        style={css(entrada + "text-align:right;")}
                      />
                    )}
                  </div>
                  <p style={css(NOTA + "margin:0;line-height:1.5;")}>
                    El 21 % es el tipo general. Cámbialo si a lo que facturas le corresponde otro.
                  </p>

                  {campo(
                    "Al pie de la factura (si quieres)",
                    <textarea
                      value={borrador.notas}
                      onChange={(e) => cambia({ notas: e.target.value })}
                      rows={2}
                      placeholder="Forma de pago, número de cuenta…"
                      style={css(entrada + "resize:vertical;line-height:1.5;")}
                    />
                  )}
                </div>

                <div style={css(RAYA + "margin-top:var(--s5);padding-top:var(--s4);display:flex;gap:var(--s2);flex-wrap:wrap;align-items:center;")}>
                  {/* La única mancha de granate de la pantalla. Apagada
                      mientras falten los datos fiscales: se ve que existe y que
                      hoy no se puede pulsar, que es más honesto que esconderla. */}
                  <button
                    onClick={() => void emitir()}
                    disabled={!completo}
                    title={completo ? undefined : "Faltan tus datos fiscales: " + huecos.join(", ")}
                    style={css(botonPrincipal(completo))}
                  >
                    Emitir la factura
                  </button>
                  <button onClick={() => void guardarBorrador()} style={css(BOTON_NORMAL)}>
                    Guardar el borrador
                  </button>
                  <button onClick={() => void tirarBorrador()} style={css(BOTON_PLANO + "margin-left:auto;color:var(--red);")}>
                    Tirar el borrador
                  </button>
                </div>

                {!completo && (
                  <p style={css(NOTA + "margin:var(--s3) 0 0;line-height:1.5;color:var(--red);")}>
                    No se puede emitir hasta que estén tus datos fiscales. El borrador sí se guarda.
                  </p>
                )}

                {mensaje && (
                  <p role="status" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--text-2);")}>
                    {mensaje}
                  </p>
                )}
              </section>
            )
          )}

          {/* La hoja va debajo, siempre. Es la misma en pantalla y en papel: no
           * hay una versión «de ver» y otra «de imprimir» que puedan
           * discrepar. Al imprimir desaparece todo lo demás — está marcado
           * `data-chrome`— y sale sólo esto. */}
          {enPantalla && <HojaFactura f={enPantalla} marca={marca} />}
        </div>
      </div>
    </main>
  );
}
