"use client";

/**
 * LAS FACTURAS
 *
 * Emitir una por una sesión o por un curso, verla y descargarla. Y tres reglas
 * que no son de diseño sino de la cosa en sí:
 *
 *  1. LOS DATOS FISCALES DEL EMISOR SE ESCRIBEN AQUÍ. Estaban en el código y la
 *     pantalla enseñaba la ruta del archivo, que es tanto como pedirle a una
 *     numeróloga que edite TypeScript para poder cobrar. Ahora hay un
 *     formulario. Lo que no cambia: mientras falte cualquiera de los tres —
 *     nombre, NIF y domicilio— se pueden guardar borradores pero NO emitir. No
 *     es una limitación nuestra, es la ley, y lo que falta sale marcado aquí y
 *     en la propia hoja en vez de inventarse.
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
import { APOYO, BOTON_NORMAL, BOTON_PLANO, NOTA, PAD, RAYA, TARJETA, TITULO, botonPrincipal, rotulo } from "@/lib/ui";
import { useExportar, AVISO_SIN_DIALOGO } from "@/lib/imprimir";
import {
  clientes as repoClientes,
  facturas as repoFacturas,
  cargaEmisor,
  claveDia,
  emisorCargado,
  emisorCompleto,
  euros,
  falta,
  faltaDelEmisor,
  fechaDeFactura,
  guardaEmisor,
  nuevoId,
  numeroDe,
  sinTildes,
  totales,
  EMISOR,
  type Cliente,
  type DatosFiscales,
  type Factura,
} from "@/lib/despacho";
import { AvisoNavegador, Cabecera, Estado, Vacio, useEstrecho, useLlevaAlDetalle } from "../despacho/Piezas";
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

/**
 * Los datos fiscales, preparados para escribirse encima.
 *
 * Lo que falta vale `PENDIENTE` por dentro —es la palabra que usa toda la casa
 * para «esto no tiene valor todavía»— y esa palabra no puede aparecer dentro de
 * un campo de texto: quien la vea escrita creerá que ya hay algo puesto y
 * borrará una letra de más. En el formulario, lo que falta es un hueco vacío.
 */
const paraEditar = (d: DatosFiscales): DatosFiscales => ({
  nombre: falta(d.nombre) ? "" : d.nombre,
  nif: falta(d.nif) ? "" : d.nif,
  direccion: falta(d.direccion) ? "" : d.direccion,
});

const COLOR_ESTADO: Record<Factura["estado"], string> = {
  borrador: "var(--gold)",
  emitida: "var(--green)",
  anulada: "var(--red)",
};

export default function FacturasScreen() {
  const { marca, setView, setClienteAbierto, facturaAbierta, setFacturaAbierta, recado, setRecado } = useApp();

  /* Descargar la factura es imprimir, igual que el estudio: misma pieza, mismo
     aviso si el navegador no abre el diálogo. */
  const { exporta, sinDialogo, trasPulsar, ayuda } = useExportar();
  const [lista, setLista] = useState<Factura[]>([]);
  const [gente, setGente] = useState<Cliente[]>([]);
  const [abierta, setAbierta] = useState<Factura | null>(null);
  const [borrador, setBorrador] = useState<Factura | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [anulando, setAnulando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(true);

  /* El mismo corte que usa `[data-dos]` en globals.css para dejar la lista y el
     documento en una sola columna. Aquí sólo decide una cosa: si el botón de los
     datos fiscales cabe al final del renglón o necesita el suyo. */
  const estrecho = useEstrecho(900);

  /*
   * LOS DATOS FISCALES, QUE AHORA SE ESCRIBEN AQUÍ.
   *
   * `mios` es el borrador de los tres campos mientras se están escribiendo, y
   * `sello` sube cada vez que se guardan de verdad: es lo que obliga a esta
   * pantalla a releer `EMISOR` —que es un objeto que se muta, no un estado de
   * React— y a que el botón de emitir se encienda en el acto en vez de al
   * siguiente clic en cualquier otra cosa.
   */
  const [mios, setMios] = useState<DatosFiscales | null>(null);
  const [abriendoDatos, setAbriendoDatos] = useState(false);
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [falloDatos, setFalloDatos] = useState("");
  const [sello, setSello] = useState(0);

  /* `sello` se lee aquí para que quede escrito de qué depende este cálculo:
     `EMISOR` es un objeto que se muta —ver la cabecera de `emisor.ts`—, así que
     nada de lo que React vigila cambia al guardarlo. Sin un estado que suba, el
     botón de emitir se quedaría apagado con los datos ya escritos. */
  const completo = sello >= 0 && emisorCompleto();
  const huecos = faltaDelEmisor();
  /* Hasta que termina la primera carga no se sabe si faltan o no. Acusar a
     alguien de no haber rellenado algo que sí rellenó es la peor forma de
     saludar, así que mientras tanto no se dice nada. */
  const sabemosDelEmisor = emisorCargado();

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
    /* Y los datos fiscales, que viven en la nube o en el navegador igual que
       todo lo demás. Al volver se sube el sello: es lo único que hace que la
       pantalla se entere de que `EMISOR` ya no está vacío. */
    void cargaEmisor().then((d) => {
      setMios(paraEditar(d));
      setSello((n) => n + 1);
    });
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

  /*
   * GUARDAR LOS DATOS FISCALES.
   *
   * Se enseña el fallo y no se cierra el formulario si algo va mal: si Iris
   * escribe su NIF, ve que se guarda y no se guardó, la siguiente factura sale
   * sin él — con número puesto y sin poder borrarla.
   */
  const guardarMisDatos = async () => {
    if (!mios) return;
    setGuardandoDatos(true);
    setFalloDatos("");
    try {
      await guardaEmisor(mios);
      setSello((n) => n + 1);
      setAbriendoDatos(false);
    } catch (e) {
      setFalloDatos(e instanceof Error ? e.message : "No se han podido guardar.");
    } finally {
      setGuardandoDatos(false);
    }
  };

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

        {/* ------------------------------------------------ quién factura */}
        {/*
            ANTES: UN AVISO ROJO CON LA RUTA DE UN ARCHIVO .TS DENTRO.

            Decía «se escriben en un solo sitio: src/lib/despacho/emisor.ts».
            Es decir: la plataforma le estaba pidiendo a una numeróloga que
            abriera un archivo de TypeScript y volviera a desplegar antes de
            poder cobrar su primera factura. Un aviso que no se puede atender
            desde la propia pantalla no es un aviso: es un muro con un cartel.

            Ahora es un formulario. Y sigue siendo lo primero de la pantalla
            SÓLO mientras falte algo — en cuanto los tres estén, se pliega a un
            renglón que se puede volver a abrir para corregirlos, porque un NIF
            se cambia una vez cada muchos años y no puede ocupar el sitio del
            trabajo de todos los días.

            La regla no se ha tocado: sin los tres se guardan borradores pero no
            se emite. Eso no es una limitación nuestra, es la ley española, y
            está dicho junto al botón apagado, que es donde hace falta leerlo.
        */}
        {sabemosDelEmisor && mios && (
          <section style={css(TARJETA + PAD + "margin-bottom:var(--gap-lg);")}>
            <div style={css("display:flex;align-items:baseline;gap:var(--s3);flex-wrap:wrap;")}>
              <span style={css(rotulo(completo ? "var(--gold)" : "var(--red)"))}>
                {completo ? "Quien factura" : "Faltan tus datos fiscales"}
              </span>
              <span style={css(NOTA + "min-width:0;overflow-wrap:anywhere;")}>
                {completo ? `${EMISOR.nombre} · ${EMISOR.nif}` : `${huecos.join(", ")} — sin ellos no se puede emitir.`}
              </span>
              {!abriendoDatos && (
                <button
                  onClick={() => setAbriendoDatos(true)}
                  /* En ancho va al final del renglón; en estrecho el renglón es
                     suyo entero, porque un botón colgando a la derecha debajo de
                     dos líneas de texto se lee como si se hubiera caído ahí. */
                  style={css((completo ? BOTON_PLANO : botonPrincipal()) + (estrecho ? "flex:1 1 100%;" : "margin-left:auto;"))}
                >
                  {completo ? "Cambiarlos" : "Ponerlos ahora"}
                </button>
              )}
            </div>

            {abriendoDatos && (
              <div style={css(RAYA + "margin-top:var(--s4);padding-top:var(--s4);display:flex;flex-direction:column;gap:var(--s3);")}>
                {campo(
                  "Tu nombre o razón social",
                  <input
                    value={mios.nombre}
                    onChange={(e) => setMios({ ...mios, nombre: e.target.value })}
                    placeholder="Iris Soares"
                    style={css(entrada)}
                  />
                )}
                <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:var(--s3);")}>
                  {campo(
                    "Tu NIF",
                    <input
                      value={mios.nif}
                      onChange={(e) => setMios({ ...mios, nif: e.target.value })}
                      placeholder="12345678Z"
                      style={css(entrada)}
                    />
                  )}
                  {campo(
                    "Tu domicilio fiscal",
                    <input
                      value={mios.direccion}
                      onChange={(e) => setMios({ ...mios, direccion: e.target.value })}
                      placeholder="Calle, número, código postal y ciudad"
                      style={css(entrada)}
                    />
                  )}
                </div>
                <div style={css("display:flex;gap:var(--s2);flex-wrap:wrap;align-items:center;")}>
                  <button onClick={() => void guardarMisDatos()} disabled={guardandoDatos} style={css(botonPrincipal(!guardandoDatos))}>
                    {guardandoDatos ? "Guardando…" : "Guardar mis datos"}
                  </button>
                  <button
                    onClick={() => {
                      /* Al dejarlo se recupera lo guardado: si no, lo escrito a
                         medias se quedaría en pantalla como si fuera lo bueno. */
                      setMios(paraEditar(EMISOR));
                      setFalloDatos("");
                      setAbriendoDatos(false);
                    }}
                    style={css(BOTON_PLANO)}
                  >
                    Dejarlo
                  </button>
                </div>
                {falloDatos && (
                  <p role="alert" style={css(APOYO + "margin:0;color:var(--red);")}>
                    {falloDatos} Tus datos no se han guardado: vuelve a intentarlo antes de emitir nada.
                  </p>
                )}
              </div>
            )}
          </section>
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
                    {/* En un borrador el renglón de arriba era «Borrador» y la
                        pastilla de la derecha, otra vez «Borrador»: la misma
                        palabra dos veces en la misma fila y ni rastro de a
                        quién era. El estado lo dice la pastilla, que es su
                        oficio; arriba va lo que identifica la factura — el
                        número cuando lo tiene y, mientras no, la persona. */}
                    <span style={css("flex:1;min-width:0;")}>
                      <span data-cifras="" style={css("display:block;font-size:var(--t-body);font-weight:590;overflow-wrap:anywhere;")}>
                        {f.estado === "borrador" ? f.cliente.nombre || "Sin nombre" : numeroDe(f)}
                      </span>
                      <span style={css(NOTA + "display:block;margin-top:2px;overflow-wrap:anywhere;")}>
                        {f.estado === "borrador" ? euros(t.total) : `${f.cliente.nombre || "Sin nombre"} · ${euros(t.total)}`}
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

          {/* EN TONO DE NOTA, NO DE ALARMA — Y ES UN CAMBIO A PROPÓSITO.
              Iba en tarjeta con la raya roja al canto por ser las facturas lo
              que menos se puede perder, y el argumento sigue siendo verdad. Lo
              que no funcionaba era el resultado: en esta pantalla convivían dos
              bloques rojos a la vez —éste y el de los datos fiscales— más tres
              pastillas rojas, y con la pantalla entera en rojo ninguno de los
              dos avisaba de nada. Un solo rojo por pantalla, y aquí ese rojo es
              el que se puede arreglar pulsando: el de arriba. El texto es el
              mismo, dicho con la voz con la que se dice en las otras tres. */}
          <AvisoNavegador que="Las facturas" />
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
                <button onClick={exporta} style={css(botonPrincipal())}>
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

              <p style={css(NOTA + "margin:var(--s4) 0 0;line-height:1.5;")}>{ayuda}</p>
              {sinDialogo && (
                <p role="alert" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--red);")}>
                  {AVISO_SIN_DIALOGO}
                </p>
              )}
              {trasPulsar && (
                <p role="status" style={css(APOYO + "margin:var(--s3) 0 0;color:var(--text-3);")}>
                  {trasPulsar}
                </p>
              )}
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
                {/* Sobraba debajo: «Mientras sea un borrador puedes cambiar lo
                    que quieras y tirarlo si no vale. El número se le pone al
                    emitirla». Los tres botones del pie —emitir, guardar el
                    borrador, tirarlo— ya dicen las tres cosas, y la hoja de
                    abajo lleva su propia banda de BORRADOR. Contarlo además en
                    un párrafo es explicar lo que ya se está viendo. */}
                <div style={css(rotulo("var(--gold)") + "margin-bottom:var(--s4);")}>Nueva factura</div>

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
                    {/* Sobraba: «Si no pones NIF ni domicilio, la factura sale
                        sin ellos…». Los dos campos ya llevan «Si hace falta»
                        escrito dentro, que dice lo mismo en tres palabras y en
                        el sitio donde se está mirando. */}
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
                     * de letra pequeña—. Se decía en un renglón aparte: «En
                     * cada línea: qué es, cuántas veces y a cuánto sale la
                     * unidad sin IVA». Ahora lo dice cada casilla desde dentro,
                     * que es donde se mira al escribir, y el renglón se ha ido.
                     * Los `aria-label` ya estaban y siguen: quien no ve el
                     * hueco escrito oye el nombre entero del campo. */}
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
                          placeholder="Cant."
                          aria-label="Cantidad"
                          style={css(entrada + "text-align:right;")}
                        />
                        <input
                          value={l.precio}
                          inputMode="decimal"
                          onChange={(e) =>
                            cambia({ lineas: borrador.lineas.map((x, j) => (j === i ? { ...x, precio: Number(e.target.value.replace(",", ".").replace(/[^\d.]/g, "")) || 0 } : x)) })
                          }
                          placeholder="€ sin IVA"
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
                  {/* Sobraba: «El 21 % es el tipo general. Cámbialo si a lo que
                      facturas le corresponde otro». El campo se llama «IVA (%)»
                      y viene con 21 puesto: la frase repetía las dos cosas que
                      ya se ven. */}

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

                {/* UN BOTÓN APAGADO TIENE QUE DECIR POR QUÉ, Y AQUÍ SE PUEDE
                    ARREGLAR SIN MOVERSE. Antes esta línea sólo explicaba; el
                    remedio estaba en un archivo del código. Ahora lleva al
                    formulario de arriba y lo abre. */}
                {sabemosDelEmisor && !completo && (
                  <p style={css(NOTA + "margin:var(--s3) 0 0;line-height:1.5;")}>
                    {/* Los huecos van con su nombre tal cual —«NIF», no «nif»—:
                        pasarlos a minúscula para que encajaran en la frase
                        dejaba las siglas escritas mal en un texto sobre la ley. */}
                    <span style={css("color:var(--red);")}>
                      En España no hay factura sin {huecos.length === 3 ? "tus datos fiscales" : huecos.join(" ni ")}.
                    </span>{" "}
                    El borrador sí se guarda.{" "}
                    <button
                      onClick={() => {
                        setAbriendoDatos(true);
                        /* El desplazamiento suave se apaga con el resto del
                           movimiento: quien pide menos animación no quiere que
                           la página se le mueva sola durante medio segundo. */
                        const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                        window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
                      }}
                      style={css(
                        "background:none;border:none;padding:0;cursor:pointer;font:inherit;color:var(--accion);font-weight:590;text-decoration:underline;"
                      )}
                    >
                      Ponlos ahora
                    </button>
                    .
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
